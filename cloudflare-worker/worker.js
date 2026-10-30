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

async function viaGemini(env, question, style, maxTokens) {
  if (!env.GEMINI_API_KEY) throw new Error('missing key');
  const response = await fetchWithLimit(
    'https://generativelanguage.googleapis.com/v1beta/models/' + GEMINI_MODEL + ':generateContent',
    {method:'POST', headers:{'Content-Type':'application/json','x-goog-api-key':env.GEMINI_API_KEY},
      body:JSON.stringify({contents:[{role:'user',parts:[{text:instruction(style)+'\n\n'+question}]}],
        generationConfig:{maxOutputTokens:maxTokens}})}, 7500);
  if (!response.ok) throw new Error('HTTP ' + response.status);
  const text = extractedGemini(await response.json());
  if (!text) throw new Error('empty response');
  return text;
}
async function viaGroq(env, question, style, maxTokens) {
  if (!env.GROQ_API_KEY) throw new Error('missing key');
  const response = await fetchWithLimit('https://api.groq.com/openai/v1/chat/completions',
    {method:'POST', headers:{'Content-Type':'application/json','Authorization':'Bearer '+env.GROQ_API_KEY},
      body:JSON.stringify({model:GROQ_MODEL, messages:[{role:'system',content:instruction(style)},{role:'user',content:question}],
        max_completion_tokens:maxTokens, temperature:0.4})}, 8500);
  if (!response.ok) throw new Error('HTTP ' + response.status);
  const data = await response.json();
  const text = String(data?.choices?.[0]?.message?.content || '').trim();
  if (!text) throw new Error('empty response');
  return text;
}
async function viaWorkersAI(env, question, style, maxTokens) {
  if (!env.AI?.run) throw new Error('missing production AI binding');
  const result = await Promise.race([
    env.AI.run(WORKERS_MODEL, {messages:[{role:'system',content:instruction(style)},
      {role:'user',content:question}], max_tokens:maxTokens,
      chat_template_kwargs:{enable_thinking:false}}),
    new Promise((_,reject) => setTimeout(() => reject(new Error('timeout')), 9000))
  ]);
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
async function reviewThree(env,body){
 const questions=Array.isArray(body.questions)?body.questions.slice(0,4):[];
 if(!questions.length)return send({error:'Brak pytań do sprawdzenia'},400);
 const input=questions.map((q,i)=>({index:i,question:String(q.question||'').slice(0,400),answer:String(q.answer||'').slice(0,120),options:(q.options||[]).slice(0,4).map(x=>String(x).slice(0,120)),sourceQuote:String(q.sourceQuote||'').slice(0,320),source:String(q.source||'').slice(0,1700)}));
 const prompt='Jestes niezaleznym pedagogiem sprawdzajacym pytania edukacyjne dla dziecka. Nie zmieniaj pytan, tylko zglos powazne bledy logiczne, niepoprawne odpowiedzi, jawne zdradzenie odpowiedzi przez tekst zrodlowy, sprzecznosc z materialem, niezrozumialy jezyk. Przedmiot: '+String(body.subject||'')+'. Ocen kazda pozycje osobno. Zwroc TYLKO JSON: {"issues":[{"index":0,"reason":"opis bledu"}]}. Jesli wszystkie poprawne: {"issues":[]}. Nie oznaczaj bez podstaw i nie sugeruj zmian bez bledow. DANE: '+JSON.stringify(input);
 const providers=[['gemini',viaGemini],['groq',viaGroq],['workers-ai',viaWorkersAI]];
 const results=await Promise.all(providers.map(async ([provider,fn])=>{
  try{let raw=await fn(env,prompt,'tech',1500);raw=String(raw).replace(/```(?:json)?/gi,'').replace(/```/g,'').trim();let obj;try{obj=JSON.parse(raw)}catch{obj=JSON.parse(raw.slice(raw.indexOf('{'),raw.lastIndexOf('}')+1))}
   if(!Array.isArray(obj?.issues)||obj.issues.some(x=>!x||!['number','string'].includes(typeof x.index)||String(x.index).trim()===''||!Number.isInteger(Number(x.index))||Number(x.index)<0||Number(x.index)>=questions.length||typeof x.reason!=='string'||!x.reason.trim()))throw Error('Model przeslal nieprawidlowa liste ocen');return {provider,issues:obj.issues.map(x=>({index:Number(x.index),reason:x.reason.trim()})).slice(0,8)};
  }catch(err){return {provider,error:'Ten model nie był dostępny podczas sprawdzania.'}}
 }));
 if(!results.some(x=>Array.isArray(x.issues)))return send({error:'Żaden z trzech modeli AI nie odpowiedział.'},503);
 return send({reviews:results});
}

export default {
  async fetch(request, env) {
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
