import {handleFamilySync78,AcademyFamilySync78} from './sync-worker.js';
export {AcademyFamilySync78};
// AKADEMIA V69 — Mentor: Gemini/Groq/Workers AI; OCR: Gemini/Groq Vision/Workers Vision.
// Klucze wyłącznie w sekretach Cloudflare. Nie wpisuj ich do tego pliku.
const GEMINI_MODEL = 'gemini-3.1-flash-lite';
const GROQ_MODEL = 'openai/gpt-oss-120b';
const WORKERS_MODEL = '@cf/google/gemma-4-26b-a4b-it';
const ALLOWED_ORIGIN = 'https://niedzialkowskamagdalena02-ctrl.github.io';
const cors = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Expose-Headers': 'X-AI-Provider',
  'Vary': 'Origin'
};
const send = (data, status = 200, provider = '') => new Response(JSON.stringify(data), {
  status,
  headers: { ...cors, 'Content-Type': 'application/json', ...(provider ? {'X-AI-Provider': provider} : {}) }
});

async function fetchWithLimit(url, init, timeoutMs) {
  const ac = new AbortController();
  const id = setTimeout(() => ac.abort(), timeoutMs);
  try { return await fetch(url, { ...init, signal: ac.signal }); }
  finally { clearTimeout(id); }
}
function extractedGemini(data) {
  return (data?.candidates?.[0]?.content?.parts || []).map(p => p.text || '').join('').trim();
}
function persona(style) {
  return style === 'fun' || style === 'spiderman' ? 'Spider-Man' : 'Iron Man';
}
function instruction(style) {
  return 'Jesteś edukacyjnym mentorem dziecka. Styl: ' + persona(style) +
    '. Odpowiadaj po polsku, przyjaźnie, rzeczowo i odpowiednio do wieku. ' +
    'Jeżeli uczeń prosi o pomoc w zadaniu, naprowadzaj krok po kroku. ' +
    'Jeżeli prosi o JSON, zwróć kompletny, poprawny JSON bez tekstu obok. ' +
    'Odpowiedz na rzeczywiste pytanie dziecka, bez powitania i bez menu.';
}

async function viaGemini(env, question, style, maxTokens, opts={}) {
  if (!env.GEMINI_API_KEY) throw new Error('missing key');
  const response = await fetchWithLimit(
    'https://generativelanguage.googleapis.com/v1beta/models/' + GEMINI_MODEL + ':generateContent',
    {method:'POST', headers:{'Content-Type':'application/json','x-goog-api-key':env.GEMINI_API_KEY},
      body:JSON.stringify({contents:[{role:'user',parts:[{text:instruction(style)+'\n\n'+question}]}],
        generationConfig:{maxOutputTokens:maxTokens,...(opts.review?{responseMimeType:'application/json'}:{})}})}, opts.review?12000:7500);
  if (!response.ok) throw new Error('HTTP ' + response.status);
  const text = extractedGemini(await response.json());
  if (!text) throw new Error('empty response');
  return text;
}
async function viaGroq(env, question, style, maxTokens, opts={}) {
  if (!env.GROQ_API_KEY) throw new Error('missing key');
  const response = await fetchWithLimit('https://api.groq.com/openai/v1/chat/completions',
    {method:'POST', headers:{'Content-Type':'application/json','Authorization':'Bearer '+env.GROQ_API_KEY},
      body:JSON.stringify({model:GROQ_MODEL, messages:[{role:'system',content:instruction(style)},{role:'user',content:question}],
        max_completion_tokens:maxTokens, temperature:0.4,...(opts.review?{reasoning_effort:'low',include_reasoning:false,response_format:{type:'json_schema',json_schema:{name:'question_review',strict:true,schema:v772ReviewSchema}}}:{})})}, opts.review?12000:8500);
  if (!response.ok) throw new Error('HTTP ' + response.status);
  const data = await response.json();
  const text = String(data?.choices?.[0]?.message?.content || '').trim();
  if (!text) throw new Error('empty response');
  return text;
}
async function viaWorkersAI(env, question, style, maxTokens, opts={}) {
  if (!env.AI?.run) throw new Error('missing production AI binding');
  const result = await v772ModelLimit(()=>env.AI.run(WORKERS_MODEL, {messages:[{role:'system',content:instruction(style)},{role:'user',content:question}], max_tokens:maxTokens,chat_template_kwargs:{enable_thinking:false},...(opts.review?{response_format:{type:'json_object'}}:{})}),opts.review?12000:9000);
  const text = String(result?.response || result?.choices?.[0]?.message?.content || '').trim();
  if (!text) throw new Error('empty response');
  return text;
}
// V69: OCR multimodalny z trzema kolejnymi, NIEZALEZNYMI probami.
const OCR_VISION_PROMPT = 'Przepisz wiernie cały tekst widoczny na zdjęciu strony podręcznika, zachowując polskie znaki i podział na wiersze. Nie wymyślaj tekstu.';
function ocrVisionPrompt(position){
  const zone=position==='top'?'GÓRNEJ':'DOLNEJ';
  return OCR_VISION_PROMPT+' Osobno znajdź DRUKOWANY NUMER STRONY w '+zone+' części kartki, w pobliżu jej lewego lub prawego rogu. Nie pomyl z numerem ćwiczenia, nagrania, lekcji ani zadania. Jeśli wyraźnie widzisz numer drukowanej strony w wybranym obszarze, dopisz na samym końcu [[PAGE_NUMBER:30]] (zamień 30 na prawdziwy numer). Odczytaj cyfry numeru dwa razy. Zwróć szczególną uwagę na podobne cyfry 4 i 7. Nie zgaduj numeru na podstawie otaczających stron. Jeśli nie jesteś pewien cyfry lub całego numeru, dopisz [[PAGE_NUMBER:UNKNOWN]]. Zachowaj tekst z całego zdjęcia, a znacznik daj tylko na końcu.';
}
function checkedOcrText(input) {
  const text=String(input||'').trim();
  if (text.length<8 || /^(nie mogę|nie jestem w stanie|sorry|i cannot|i can't|unable to|brak tekstu)/i.test(text)) throw Error('no readable OCR text');
  return text;
}
async function ocrViaGemini(env, image, mimeType,prompt){
  if(!env.GEMINI_API_KEY) throw Error('key not configured');
  const response=await fetchWithLimit('https://generativelanguage.googleapis.com/v1beta/models/'+GEMINI_MODEL+':generateContent',
    {method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':env.GEMINI_API_KEY},
    body:JSON.stringify({contents:[{role:'user',parts:[{text:prompt},{inline_data:{mime_type:mimeType,data:image}}]}],
      generationConfig:{maxOutputTokens:2800}})},17000);
  if(!response.ok)throw Error('HTTP '+response.status);
  return checkedOcrText(extractedGemini(await response.json()));
}
async function ocrViaGroqVision(env, image, mimeType,prompt){
  if(!env.GROQ_API_KEY) throw Error('key not configured');
  // GPT-OSS-120B nie obsluguje zdjec; do OCR osobny model multimodalny Groq.
  const response=await fetchWithLimit('https://api.groq.com/openai/v1/chat/completions',
    {method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+env.GROQ_API_KEY},
    body:JSON.stringify({model:'qwen/qwen3.8-27b',messages:[{role:'user',content:[
      {type:'text',text:prompt},{type:'image_url',image_url:{url:'data:'+mimeType+';base64,'+image}}
    ]}],temperature:0.1,max_completion_tokens:2800})},17000);
  if(!response.ok)throw Error('HTTP '+response.status);
  const data=await response.json();
  return checkedOcrText(data?.choices?.[0]?.message?.content);
}
async function ocrViaWorkersVision(env,image,mimeType,prompt){
  if(!env.AI?.run)throw Error('AI binding not configured');
  // Gemma 4 posiada wejscie obrazu: Workers AI ImageTextToText (image + messages).
  const result=await Promise.race([
    env.AI.run(WORKERS_MODEL,{messages:[{role:'user',content:prompt}],
      image:'data:'+mimeType+';base64,'+image,max_tokens:2800,
      chat_template_kwargs:{enable_thinking:false}}),
    new Promise((_,reject)=>setTimeout(()=>reject(Error('timeout')),17000))
  ]);
  return checkedOcrText(result?.response||result?.choices?.[0]?.message?.content);
}
async function ocrWithFallback(env, body){
  const image=String(body.image||'');
  const mimeType=String(body.mimeType||'image/jpeg');
  if(!['image/jpeg','image/png','image/webp'].includes(mimeType))return send({error:'Nieobsługiwany format zdjęcia'},400);
  if(!image||image.length>4500000)return send({error:'Nieprawidłowy rozmiar zdjęcia'},400);
  const prompt=ocrVisionPrompt(body.pageNumberPosition==='top'?'top':'bottom');
  const providers=[['gemini',ocrViaGemini],['groq-vision',ocrViaGroqVision],['workers-vision',ocrViaWorkersVision]];
  for(const [name,run] of providers){
    try {return send({text:await run(env,image,mimeType,prompt)},200,name)}
    catch(err){console.warn('OCR '+name+' failed:',String(err?.message||err).slice(0,80))}
  }
  return send({error:'Żaden z trzech modeli AI nie odczytał zdjęcia. Spróbuj ponownie później.'},503);
}

// V75: trzy niezależne opinie, bez modyfikowania pytań w bazie.
// Kontrola: osobny budzet na raport, JSON i pojedyncze ponowienie brakujacego modelu.
const v772ReviewSchema={type:'object',properties:{issues:{type:'array',items:{type:'object',properties:{index:{type:'integer'},reason:{type:'string'}},required:['index','reason'],additionalProperties:false}}},required:['issues'],additionalProperties:false};
async function v772ModelLimit(invoke,ms){let timer;try{return await Promise.race([Promise.resolve().then(invoke),new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('timeout')),ms);})]);}finally{clearTimeout(timer);}}
function v772ReviewCode(err){
 const msg=String(err?.message||''),status=msg.match(/^HTTP (\d{3})$/);
 return /missing key/.test(msg)?'missing-key':/missing production AI binding/.test(msg)?'missing-binding':err?.name==='AbortError'||/timeout/.test(msg)?'timeout':status?'HTTP-'+status[1]:/rate.limit|too many|quota|\b429\b/i.test(msg)?'HTTP-429':/empty response/.test(msg)?'empty-response':err instanceof SyntaxError||/nieprawidlowa liste/.test(msg)?'invalid-review':'provider-error';
}
function v772ReviewParse(raw,size){
 const text=String(raw).replace(/```(?:json)?/gi,'').replace(/```/g,'').trim();let obj;
 try{obj=JSON.parse(text);}catch{obj=JSON.parse(text.slice(text.indexOf('{'),text.lastIndexOf('}')+1));}
 if(!Array.isArray(obj?.issues)||obj.issues.some(x=>!x||!['number','string'].includes(typeof x.index)||String(x.index).trim()===''||!Number.isInteger(Number(x.index))||Number(x.index)<0||Number(x.index)>=size||typeof x.reason!=='string'||!x.reason.trim()))throw Error('Model przeslal nieprawidlowa liste ocen');
 return obj.issues.map(x=>({index:Number(x.index),reason:x.reason.trim().slice(0,500)})).slice(0,12);
}
async function reviewThree(env,body){
 const questions=Array.isArray(body.questions)?body.questions.slice(0,4):[];
 if(!questions.length)return send({error:'Brak pytań do sprawdzenia'},400);
 const all=[['gemini',viaGemini],['groq',viaGroq],['workers-ai',viaWorkersAI]],names=new Set(all.map(x=>x[0]));
 if(body.providers!==undefined&&(!Array.isArray(body.providers)||!body.providers.length||body.providers.some(x=>!names.has(x))))return send({error:'Nieprawidłowy wybór dostawców'},400);
 const chosen=body.providers?new Set(body.providers):names,sources=[],input=questions.map((q,i)=>{
  const source=String(q.source||'').slice(0,1700);let sourceIndex=sources.indexOf(source);if(sourceIndex<0){sourceIndex=sources.length;sources.push(source);}
  return {index:i,question:String(q.question||'').slice(0,400),answer:String(q.answer||'').slice(0,120),options:(Array.isArray(q.options)?q.options:[]).slice(0,4).map(x=>String(x).slice(0,120)),sourceQuote:String(q.sourceQuote||'').slice(0,320),sourceIndex};
 });
 const prompt='Jesteś niezależnym pedagogiem. Sprawdź pytania dziecka. Zgłoś tylko poważne błędy logiczne, błędną lub niejednoznaczną odpowiedź, sprzeczność z materiałem oraz zdradzenie odpowiedzi. Nie zmieniaj pytań. Przedmiot: '+String(body.subject||'')+'. Każdy sourceIndex wskazuje tekst w sources. Zwróć TYLKO JSON {"issues":[{"index":0,"reason":"krótki konkretny opis po polsku"}]}. Jeśli nie ma błędów, {"issues":[]}. Każda uwaga maksymalnie 2 zdania. Dane: '+JSON.stringify({questions:input,sources});
 const results=await Promise.all(all.filter(([name])=>chosen.has(name)).map(async([provider,fn])=>{
  let last;
  for(let attempt=1;attempt<=2;attempt++){
   try{return {provider,issues:v772ReviewParse(await v772ModelLimit(()=>fn(env,prompt,'tech',3000,{review:true}),12500),questions.length),attempts:attempt};}
   catch(err){last=v772ReviewCode(err);if(!['timeout','empty-response','invalid-review','provider-error','HTTP-500','HTTP-502','HTTP-503','HTTP-504'].includes(last))break;}
  }
  return {provider,code:last,error:'Ten model nie udostępnił prawidłowego raportu.'};
 }));
 const ok=results.some(x=>Array.isArray(x.issues));
 return send({reviews:results,reviewVersion:'77.2',...(ok?{}:{error:'Żaden z wybranych modeli AI nie udostępnił raportu.'})},ok?200:503);
}


export default {
  async fetch(request, env) {
    if(new URL(request.url).pathname.startsWith('/family-sync/'))return handleFamilySync78(request,env);
    const origin=request.headers.get('Origin');
    if (request.method==='OPTIONS') return new Response(null,{status:origin===ALLOWED_ORIGIN?204:403,headers:cors});
    if (request.method!=='POST') return send({error:'Method not allowed'},405);
    if (origin!==ALLOWED_ORIGIN) return send({error:'Forbidden'},403);
    const path=new URL(request.url).pathname;
    if (!['/mentor-ai','/ocr-ai','/review-three'].includes(path)) return send({error:'Not found'},404);
    const length=Number(request.headers.get('content-length')||0);
    if (length>5000000) return send({error:'Za duże żądanie'},413);
    let body;
    try {body=await request.json();} catch {return send({error:'Nieprawidłowy JSON'},400);}
    if (path==='/ocr-ai') return ocrWithFallback(env,body);
    if (path==='/review-three') return reviewThree(env,body);

    const question=String(body.question||'').slice(0,5500);
    if (!question.trim()) return send({error:'Brak pytania'},400);
    const style=String(body.mentor||'tech');
    const maxTokens=/JSON|\\"tasks\\"|Zwróć TYLKO/i.test(question)?3600:1200;
    // Bez fikcyjnych odpowiedzi. Każda próba musi wywołać prawdziwy model.
    const providers=[['gemini',viaGemini],['groq',viaGroq],['workers-ai',viaWorkersAI]];
    for(const [name,invoke] of providers) {
      try {
        const answer=await invoke(env,question,style,maxTokens);
        return send({answer},200,name);
      } catch(err) {
        // W logach tylko nazwa dostawcy i status, nigdy treść pytania ani sekret.
        console.warn('AI '+name+' failed:',String(err?.message||err).slice(0,70));
      }
    }
    return send({error:'Brak łączności z AI. Spróbuj ponownie później.'},503);
  }
};

// V75_AUDYT_ZGODNOSCI_3
