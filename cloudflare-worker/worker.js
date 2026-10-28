// AKADEMIA V56 — Gemini -> Groq -> Workers AI; OCR pozostaje na Gemini.
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
async function ocrWithGemini(env, body) {
  if (!env.GEMINI_API_KEY) return send({error:'OCR jest chwilowo niedostępny'},503);
  const image=String(body.image||'');
  const mimeType=String(body.mimeType||'image/jpeg');
  if (!['image/jpeg','image/png','image/webp'].includes(mimeType)) return send({error:'Nieobsługiwany format zdjęcia'},400);
  if (!image || image.length>4500000) return send({error:'Nieprawidłowy rozmiar zdjęcia'},400);
  try {
    const response=await fetchWithLimit('https://generativelanguage.googleapis.com/v1beta/models/'+GEMINI_MODEL+':generateContent',
      {method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':env.GEMINI_API_KEY},
      body:JSON.stringify({contents:[{role:'user',parts:[{text:'Przepisz dokładnie tekst ze zdjęcia. Zwróć tylko odczytany tekst.'},
        {inline_data:{mime_type:mimeType,data:image}}]}],generationConfig:{maxOutputTokens:2000}})}, 18000);
    if (!response.ok) throw new Error('HTTP '+response.status);
    const text=extractedGemini(await response.json());
    if (!text) throw new Error('empty response');
    return send({text},200,'gemini');
  } catch(err) {
    console.warn('OCR Gemini:',String(err?.message||err));
    return send({error:'OCR jest chwilowo niedostępny'},502);
  }
}
export default {
  async fetch(request, env) {
    const origin=request.headers.get('Origin');
    if (request.method==='OPTIONS') return new Response(null,{status:origin===ALLOWED_ORIGIN?204:403,headers:cors});
    if (request.method!=='POST') return send({error:'Method not allowed'},405);
    if (origin!==ALLOWED_ORIGIN) return send({error:'Forbidden'},403);
    const path=new URL(request.url).pathname;
    if (!['/mentor-ai','/ocr-ai'].includes(path)) return send({error:'Not found'},404);
    const length=Number(request.headers.get('content-length')||0);
    if (length>5000000) return send({error:'Za duże żądanie'},413);
    let body;
    try {body=await request.json();} catch {return send({error:'Nieprawidłowy JSON'},400);}
    if (path==='/ocr-ai') return ocrWithGemini(env,body);

    const question=String(body.question||'').slice(0,5500);
    if (!question.trim()) return send({error:'Brak pytania'},400);
    const style=String(body.mentor||'tech');
    const maxTokens=/JSON|\\"tasks\\"|Zwróć TYLKO/i.test(question)?2200:1200;
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
