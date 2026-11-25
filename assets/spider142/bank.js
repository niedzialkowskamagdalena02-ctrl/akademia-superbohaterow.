import {preschoolBank,schoolBank} from './stock.js?v=142';
import {outsideDeck95} from '../training95.js?v=140';
import {alphabet92} from '../learning-games92.js?v=92';
import {arithmetic139} from '../training139-ai.js?v=140';
const clean=s=>String(s).normalize('NFC').toLocaleLowerCase('pl').replace(/\s+/g,' ').trim();
export const taskKey142=row=>clean(row[1])+'|'+clean(row[2]);
const unique=rows=>{const seen=new Set();return rows.filter(row=>{const key=taskKey142(row);if(seen.has(key))return false;seen.add(key);return true;});};
export function spiderBank142(grade,prepared=[]){
 const preschool=grade==='P',stock=preschool?preschoolBank:schoolBank;
 const bank=Object.fromEntries(Object.entries(stock).map(([group,rows])=>[group,rows.map(r=>[...r])]));
 if(preschool){
  for(let i=0;i<alphabet92.length;i++){
   const letter=alphabet92[i],others=[alphabet92[(i+3)%alphabet92.length],alphabet92[(i+7)%alphabet92.length]];
   bank.Litery.push(['Znajdź literę '+letter+'.',letter,...others],['Znajdź małą literę '+letter.toLocaleLowerCase('pl')+'.',...([letter,...others].map(l=>l.toLocaleLowerCase('pl')))]);
  }
  for(let n=1;n<=5;n++)for(const [name,emoji]of [['gwiazdki','⭐'],['jabłka','🍎'],['piłki','⚽']])bank.Liczby.push(['Policz '+name+'. '+Array(n).fill(emoji).join(' '),String(n),String(n===5?3:n+1),String(n===1?4:n-1)]);
 }else{
  const contexts={'b_ty':'Załóż b_ty na nogi.','st_ł':'Na środku kuchni stoi st_ł.','_eka':'Przez miasto płynie _eka.','_aba':'W stawie kumka _aba.','_leb':'Na śniadanie jem _leb.'};
  bank.Ortografia=bank.Ortografia.map(([q,...rest])=>{const gap=q.match(/„([^”]+)”/)?.[1];return [contexts[gap]?'Uzupełnij wyraz w zdaniu: '+contexts[gap]:q,...rest];});
  if(String(grade)==='1')bank.Matematyka=bank.Matematyka.filter(r=>!/[×÷*/]/.test(r[0]));
  // Keep the existing checked app banks and the donor's questions in one pool.
  for(let pass=0;pass<4;pass++)for(const [kind,group,subject]of [['math','Matematyka','matematyka'],['grammar','Język polski','polski'],['spelling','Ortografia','polski']]){
   for(const t of outsideDeck95({kind,subject},grade)){
    let question=t.question,options=t.options.slice(0,3);
    if(t.spaceGap132){const gap=t.spaceGap132;question='Uzupełnij wyraz w zdaniu: '+gap.sentence.replace('{word}',gap.template);if(options.length===2)options.push(['rz','sz','ą','ch'].find(x=>!options.includes(x)));}
    if(options.length===3&&new Set(options).size===3)bank[group].push([question,t.answer,...options.filter(x=>x!==t.answer)]);
   }
  }
  for(const t of prepared){
   if(!t.question||!Array.isArray(t.options)||t.options.length<3||!t.options.includes(t.answer))continue;
   const group=arithmetic139(t.question)!==null?'Matematyka':t.spaceGap132?'Ortografia':'Język polski';
   if(group==='Matematyka'&&String(grade)==='1'&&/[×÷*/]/.test(t.question))continue;
   const question=t.spaceGap132?'Uzupełnij wyraz w zdaniu: '+t.spaceGap132.sentence.replace('{word}',t.spaceGap132.template):t.question;
   bank[group].unshift([question,t.answer,...t.options.filter(x=>x!==t.answer).slice(0,2)]);
  }
 }
 for(const group of Object.keys(bank))bank[group]=unique(bank[group].map(r=>[group,...r])).map(r=>r.slice(1));
 return bank;
}
export function validateSpider142(items,bank,grade){
 if(!Array.isArray(items))return [];
 const checked=new Map(Object.entries(bank).flatMap(([g,rows])=>rows.map(r=>[taskKey142([g,...r]),[g,...r]]))),seen=new Set();
 return items.flatMap(item=>{
  const group=item?.kategoria,q=item?.polecenie,options=item?.odpowiedzi,index=item?.poprawnyIndeks;
  if(!bank[group]||typeof q!=='string'||q.length>500||!Array.isArray(options)||options.length!==3||options.some(x=>typeof x!=='string'||!x.trim()||x.length>100)||new Set(options.map(clean)).size!==3||!Number.isInteger(index)||index<0||index>2)return [];
  const row=[group,q.trim(),options[index],...options.filter((_,i)=>i!==index)],key=taskKey142(row),source=checked.get(key),value=arithmetic139(q);
  // Language and picture facts come from the checked banks. New arithmetic is
  // computed here, never accepted on the generator's say-so.
  const limit=String(grade)==='1'?20:String(grade)==='2'?100:1000;
  const arithmetic=grade!=='P'&&group==='Matematyka'&&value!==null&&value>=0&&value<=limit&&String(value)===row[2]&&options.every(x=>/^\d+$/.test(x))&&!(String(grade)==='1'&&/[×÷*/]/.test(q));
  if(!arithmetic&&(!source||source[0]!==group||!source.slice(2).every(x=>options.map(clean).includes(clean(x)))))return [];
  if(seen.has(key))return [];seen.add(key);return [row];
 });
}
export async function generateSpider142({bank,grade,material='',ask,signal}){
 if(!ask)return [];
 const approved=Object.entries(bank).flatMap(([g,rows])=>rows.map(r=>({kategoria:g,polecenie:r[0],odpowiedzi:r.slice(1),poprawnyIndeks:0})));
 const prompt='Przygotuj 12 pytań do gry Spider-Man, poziom '+(grade==='P'?'przedszkole, liczby do pięciu':'klasa '+grade)+'. Zwróć tylko JSON {"zadania":[{"kategoria":"...","polecenie":"...","odpowiedzi":["a","b","c"],"poprawnyIndeks":0}]}. Mieszaj kategorie. Zachowaj treść i poprawność pytań językowych i obrazkowych z zatwierdzonej bazy; zmieniaj kolejność odpowiedzi. '+(grade==='P'?'Nie dodawaj gramatyki ani ortografii.':'Możesz dodać nowe jednoznaczne działania matematyczne'+(String(grade)==='1'?' dodawanie i odejmowanie do 20.':', mnożenie i dzielenie z całkowitym wynikiem.'))+' Nie podawaj odpowiedzi w poleceniu. Materiał: '+material.slice(0,4000)+' Baza: '+JSON.stringify(approved.slice(0,100));
 try{const response=await ask(prompt,signal);if(signal.aborted)return [];const parsed=typeof response==='string'?JSON.parse(response.replace(/^```(?:json)?\s*|\s*```$/g,'')):response;return validateSpider142(parsed?.zadania,bank,grade);}catch{return [];}
}
