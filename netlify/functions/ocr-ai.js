exports.handler=async(event)=>{
 const json=(code,obj)=>({statusCode:code,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'},body:JSON.stringify(obj)});
 if(event.httpMethod!=='POST')return json(405,{error:'Dozwolone tylko POST.'});
 const key=process.env.GEMINI_API_KEY;
 if(!key)return json(503,{error:'AI nie jest jeszcze skonfigurowane. Dodaj GEMINI_API_KEY w Netlify → Environment variables i ponownie opublikuj projekt.'});
 try{
  if((event.body||'').length>10*1024*1024)return json(413,{error:'Zdjęcie jest za duże.'});
  const {image,mimeType,language}=JSON.parse(event.body||'{}');
  if(!image||!/^image\/(jpeg|png|webp)$/.test(mimeType||'')||!(/^[A-Za-z0-9+/=]+$/.test(image)))return json(400,{error:'Niepoprawne zdjęcie. Wybierz JPG, PNG lub WEBP.'});
  const prompt=`Przepisz dokładnie WSZYSTKIE czytelne fragmenty tekstu z tej fotografii strony podręcznika w języku ${language==='angielski'?'angielskim':'polskim'}. Zachowaj kolejność czytania, polskie znaki, interpunkcję, podział na zwrotki i akapity. Nie opisuj ilustracji, nie rozwiązuj zadań, nie dopisuj tekstu, którego nie widać. Miejsca nieczytelne oznacz [nieczytelne]. Zwróć wyłącznie transkrypcję.`;
  const model='gemini-3.1-flash-lite';
  const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),25000);
  let res;
  try{for(let i=0;i<3;i++){res=await fetch('https://generativelanguage.googleapis.com/v1beta/models/'+model+':generateContent',{method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':key},body:JSON.stringify({contents:[{parts:[{text:prompt},{inline_data:{mime_type:mimeType,data:image}}]}],generationConfig:{temperature:0,maxOutputTokens:3000}}),signal:controller.signal});if(res.status!==503||i===2)break;await new Promise(r=>setTimeout(r,1500*(i+1)))}}finally{clearTimeout(timer)}
  const obj=await res.json();
  if(!res.ok){if(res.status===429)return json(429,{error:'Wyczerpano limit darmowych zapytań Gemini. Spróbuj później.'});return json(502,{error:'Gemini odmówiło odczytu ('+res.status+'): '+String(obj.error?.message||'sprawdź klucz API').slice(0,220)})}
  const text=(obj.candidates?.[0]?.content?.parts||[]).map(p=>p.text||'').join('\n').trim();
  if(!text)return json(422,{error:'AI nie rozpoznało czytelnego tekstu.'});
  return json(200,{text});
 }catch(err){return json(500,{error:err.name==='AbortError'?'Odczyt trwał zbyt długo. Spróbuj ponownie.':'Błąd analizy zdjęcia. Spróbuj ponownie.'})}
};
