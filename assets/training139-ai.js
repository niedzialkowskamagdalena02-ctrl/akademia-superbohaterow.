const clean=s=>String(s||'').normalize('NFC').toLocaleLowerCase('pl').replace(/\s+/g,' ').trim();
export function arithmetic139(text){
 const m=String(text).replace(/[?=]/g,'').trim().match(/^(?:Ile to\s+)?(\d{1,3})\s*([+×*÷/−-])\s*(\d{1,3})[.!]?$/u);if(!m)return null;
 const a=Number(m[1]),b=Number(m[3]),op=m[2],value=op==='+'?a+b:['-','−'].includes(op)?a-b:['*','×'].includes(op)?a*b:b?a/b:NaN;
 return Number.isFinite(value)&&Number.isInteger(value)?value:null;
}
export function validTask139(task,{subject,material='',grade='1',verifiedTasks=[]}={}){
 if(!task||typeof task.polecenie!=='string'||!Array.isArray(task.odpowiedzi)||task.odpowiedzi.length!==3||!Number.isInteger(task.poprawnyIndeks)||task.poprawnyIndeks<0||task.poprawnyIndeks>2)return null;
 const options=task.odpowiedzi.map(String);if(options.some(x=>!x.trim()||x.length>100)||new Set(options.map(clean)).size!==3)return null;
 const q=task.polecenie.trim(),answer=options[task.poprawnyIndeks];if(!q||q.length>500)return null;
 const source=verifiedTasks.find(t=>clean(t.question)===clean(task.zrodlo||q)&&clean(t.answer)===clean(answer)&&t.options?.length===3&&t.options.every(o=>options.map(clean).includes(clean(o))));
 // Material-based and language tasks must be traceable to a checked task.
 // The generator may vary wording and option order, but cannot invent a fact.
 if(material||subject==='polski'){
  if(!source||clean(q)!==clean(source.question))return null;
 }else if(subject==='matematyka'){
  const result=arithmetic139(q),limit=grade==='1'?20:grade==='2'?100:1000;
  if(result===null||String(result)!==answer||result<0||result>limit||grade==='1'&&/[×*÷/]/.test(q))return null;
 }else return null;
 return {question:q,answer,options,explanation:source?.explanation||String(task.wyjasnienie||''),topic:String(task.temat||''),generated139:true};
}
export function validRiddle139(row,objects){
 if(!row||typeof row.haslo!=='string'||typeof row.rymowanka!=='string'||typeof row.obraz!=='string')return null;
 const object=objects.find(o=>o.id===row.obraz||o.file===row.obraz);if(!object||clean(object.name)!==clean(row.haslo))return null;
 if(row.rymowanka.length<20||row.rymowanka.length>350||clean(row.rymowanka).includes(clean(row.haslo)))return null;
 if(!Array.isArray(row.opcje)||row.opcje.length!==3||new Set(row.opcje.map(clean)).size!==3||!row.opcje.some(x=>clean(x)===clean(row.haslo)))return null;
 return {id:'ai:'+clean(row.rymowanka),haslo:object.name,rymowanka:row.rymowanka,obraz:object.file,generated139:true};
}
function json(text){if(typeof text!=='string')return text;const raw=text.replace(/^```(?:json)?\s*|\s*```$/g,'').trim();try{return JSON.parse(raw);}catch{return null;}}
export async function replenish139({game,grade,subject,material='',verifiedTasks=[],objects=[],ask,signal,storage=localStorage,key}){
 if(!ask||grade==='P'&&game!=='rhymes')return [];
 const prompt=game==='rhymes'?
  'Utwórz dwie jednoznaczne krótkie zagadki rymowane po polsku dla przedszkolaka. Nie podawaj hasła w treści. Zwróć wyłącznie JSON {"zagadki":[{"haslo":"nazwa z katalogu","rymowanka":"...","opcje":["hasło","inne","inne"],"obraz":"id z katalogu"}]}. Katalog: '+JSON.stringify(objects.map(o=>({id:o.id,nazwa:o.name}))):
  'Zwróć JSON {"zadania":[{"temat":"...","polecenie":"...","odpowiedzi":["a","b","c"],"poprawnyIndeks":1,"wyjasnienie":"..."}]}. Przygotuj do 8 zadań z przedmiotu '+subject+' dla klasy '+grade+'. '+(material||subject==='polski'?'Wybierz pytania z poniższej zatwierdzonej bazy. Zachowaj ich treść i poprawną odpowiedź, zmieniaj kolejność odpowiedzi. Nie zmieniaj faktów.':'Zadania matematyczne w postaci Ile to a + b? lub a − b?'+(grade==='1'?' w zakresie 0–20.':' oraz mnożenia i dzielenia z całkowitym wynikiem.'))+' Nie dodawaj danych osobowych. Baza: '+JSON.stringify(verifiedTasks.slice(0,24).map(t=>({question:t.question,answer:t.answer,options:t.options,explanation:t.explanation})))+' Materiał: '+material.slice(0,5000);
 if(game!=='rhymes'&&!['matematyka','polski'].includes(subject))return [];
 try{
  const response=json(await ask(prompt,signal));if(signal.aborted)return [];
  let rows=game==='rhymes'?(response?.zagadki||[]).map(r=>validRiddle139(r,objects)):(response?.zadania||[]).map(r=>validTask139(r,{subject,material,grade,verifiedTasks}));
  rows=rows.filter(Boolean);let previous=[];try{const stored=JSON.parse(storage.getItem(key)||'[]');if(Array.isArray(stored))previous=stored;}catch{}
  const ids=new Set(previous.map(r=>clean(r.rymowanka||r.question)));rows=rows.filter(r=>{const id=clean(r.rymowanka||r.question);if(ids.has(id))return false;ids.add(id);return true;});
  if(game==='rhymes'&&rows.length){const check=json(await ask('Sprawdź jednoznaczność zagadek. Odrzuć zagadkę, jeśli wskazane hasło nie pasuje albo inne rozwiązanie pasuje równie dobrze. Zwróć JSON {"poprawneIndeksy":[0]}. Zagadki: '+JSON.stringify(rows),signal));const accepted=new Set(check?.poprawneIndeksy||[]);rows=rows.filter((_,i)=>accepted.has(i));}
  if(signal.aborted)return [];try{storage.setItem(key,JSON.stringify([...previous,...rows].slice(-80)));}catch{}return rows;
 }catch{return [];}
}
