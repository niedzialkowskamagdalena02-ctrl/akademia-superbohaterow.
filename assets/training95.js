import {schoolGames92,preschoolGames92,gameGroup92,shuffle92} from './learning-games92.js?v=92';
import {schoolMissions93,preschoolMissions93} from './missions93-data.js?v=93';
import {vocabulary,readings} from './learning.js';
import {GAME_TITLES80,buildGames80} from './games80.js?v=84';
import {GAME_TITLES81,buildGames81} from './games81.js?v=82';
import {buildSubjectGames82} from './subject-games82.js?v=82';

const subjects=['polski','matematyka','angielski','przyroda'];
const names={polski:'Polski',matematyka:'Matematyka',angielski:'Angielski',przyroda:'Przyroda'};
const icons={polski:'📖',matematyka:'🔢',angielski:'🎧',przyroda:'🌿'};
const preschoolMath=new Set(['numbers','hidden','rail','bubble','cookies']);
const preschoolPolish=new Set(['letters','order','rhymes','trace','dino','snail','closet']);
const titles={...GAME_TITLES80,...GAME_TITLES81};
const extraWords=[
 ['milk','mleko'],['banana','banan'],['bread','chleb'],['car','samochód'],['ball','piłka'],['bird','ptak'],
 ['fish','ryba'],['flower','kwiat'],['sunflower','słonecznik'],['tree','drzewo'],['green','zielony'],
 ['yellow','żółty'],['train','pociąg'],['plane','samolot'],['bus','autobus'],['bear','niedźwiedź'],
 ['tiger','tygrys'],['elephant','słoń'],['rabbit','królik'],['socks','skarpetki'],['hat','kapelusz'],
 ['shirt','koszula'],['shoe','but'],['table','stół'],['chair','krzesło'],['Monday','poniedziałek'],
 ['Tuesday','wtorek'],['spring','wiosna'],['forest','las'],['mountain','góra'],['beach','plaża'],
 ['vanilla','wanilia'],['chocolate','czekolada'],['strawberry','truskawka'],['three','trzy'],
 ['rain','deszcz'],['bow','kokarda'],['rainbow','tęcza'],['snow','śnieg'],['man','mężczyzna'],['snowman','bałwan'],
 ['foot','stopa'],['football','piłka nożna']
];
const spelling=[
 ['g_ra','ó','u'],['wr_bel','ó','u'],['b_ty','u','ó'],['og_rek','ó','u'],['b_rza','u','ó'],['pi_rnik','ó','u'],
 ['_aba','ż','rz'],['o_ech','rz','ż'],['po_ądek','rz','ż'],['kału_a','ż','rz'],['ły_ka','ż','rz'],
 ['_mura','ch','h'],['_erbata','h','ch'],['bo_ater','h','ch'],['mu_a','ch','h'],['_leb','ch','h'],
 ['sło_ce','ń','n'],['w_ż','ą','a'],['g_ś','ę','e'],['sło_','ń','n'],['jab_ko','ł','l']
];
const grammar=[
 ['Kto? Co? Wybierz rzeczownik.','plecak','biegnie','zielony'],
 ['Jaki? Jaka? Jakie? Wybierz przymiotnik.','wesoły','pisze','tablica'],
 ['Co robi? Wybierz czasownik.','rysuje','chmura','ogromna'],
 ['Wybierz rzeczownik w zdaniu „Wysoki chłopiec skacze”.','chłopiec','wysoki','skacze'],
 ['Wybierz przymiotnik w zdaniu „Ania ma niebieski rower”.','niebieski','rower','ma'],
 ['Wybierz czasownik w zdaniu „Sowa leci nad lasem”.','leci','sowa','lasem']
];
const syllables=[['kot','1'],['la-to','2'],['ko-le-ga','3'],['wa-ka-cje','3'],['pa-ra-sol','3'],['sa-mo-lot','3'],['li-mo-na-da','4'],['ma-ma','2']];
const geometry=[
 ['Ile boków ma trójkąt?','3','4','5'],['Która figura nie ma wierzchołków?','Koło','Kwadrat','Trójkąt'],
 ['Które boki prostokąta mają tę samą długość?','Przeciwległe','Wszystkie zawsze','Sąsiednie zawsze'],
 ['Która figura ma cztery równe boki i kąty proste?','Kwadrat','Trójkąt','Koło'],
 ['Ile wierzchołków ma prostokąt?','4','3','6'],['Ile boków ma sześciokąt?','6','5','7']
];
const shapes=[
 ['Pokaż koło.','🔴','🟦','🔺'],['Pokaż trójkąt.','🔺','🟦','🔴'],['Pokaż kwadrat.','🟦','🔴','🔺'],
 ['Wskaż żółte koło.','🟡','🟢','🔵'],['Wskaż zielone koło.','🟢','🟡','🔵'],['Wskaż niebieskie koło.','🔵','🟡','🟢']
];
const nature=[
 ['Jak przetrwają zimę niektóre ptaki, na przykład bociany?','Odlatują do cieplejszych krajów','Zagrzebują się w piasku','Zasypiają na gałęzi'],
 ['Co dzieje się z kałużą, gdy długo świeci na nią słońce?','Woda paruje','Woda zamarza','Woda zamienia się w piasek'],
 ['Co pszczoła przenosi z kwiatu na kwiat?','Pyłek','Krople rosy','Kamyki'],
 ['W jakiej kolejności rośnie roślina?','Nasiono → siewka → dorosła roślina','Siewka → roślina → to samo nasiono','Dorosła roślina → siewka → nasiono'],
 ['W którą stronę zwykle rośnie łodyga rośliny?','W stronę światła','Wyłącznie w dół','Zawsze w stronę wiatru'],
 ['Dlaczego na szybie obok prysznica pojawiają się krople?','Para wodna skrapla się na szybie','Szyba topnieje','Szyba przecieka']
];

export function trainingSubject95(label) {
 const text=String(label||'').toLowerCase();
 if (/polsk/.test(text)) return 'polski';
 if (/matem/.test(text)) return 'matematyka';
 if (/angiel|english/.test(text)) return 'angielski';
 if (/przyrod/.test(text)) return 'przyroda';
 return /wiedz/.test(text) ? 'all' : 'other';
}
const row=(kind,name,subject,icon=icons[subject],engine='task')=>({id:engine+':'+subject+':'+kind,kind,name,subject,icon,engine});
const translated=(subject,words)=>words.map(([en,pl,picture])=>({
 en:en.toLowerCase(),pl,picture,sourcePageId:'outside-'+subject,sourceTitle:'Wiedza spoza książki'
}));
function englishPool(grade) {
 return translated('angielski',grade==='P'?[...vocabulary,...extraWords.slice(0,8)]:[...vocabulary,...extraWords]);
}
function candidates(grade,subject,round) {
 if(subject==='angielski'){
  const pool=shuffle92(englishPool(grade));
  const games=[...buildGames80(pool,round),...buildGames81(pool,round)];
  return grade==='P'?games.filter(t=>['spot','monster-tf','kitchen','picture-puzzle','sound-guess','toy-box'].includes(t.game80)):games;
 }
 const examples=subject==='matematyka'? arithmetic(grade) : grammar;
 const pairs=examples.map(([prompt,answer],i)=>({en:String(answer),pl:prompt,cue82:prompt,sourcePageId:'outside-'+subject,
  sourceTitle:'Wiedza spoza książki',explanation82:'Poprawna odpowiedź to '+answer+'.',seed:i}));
 return buildSubjectGames82(shuffle92(pairs),subject,round);
}
export function trainingCatalog95(grade, label) {
 const selected=trainingSubject95(label);
 const pre=grade==='P',school=gameGroup92(grade)==='school';
 const groups=selected==='all'?subjects:[selected];
 const games=[];
 for(const subject of groups){
  if(pre){
   for(const [engine,entries] of [['arcade',preschoolGames92],['scene',preschoolMissions93]]){
    for(const [kind,icon,name] of entries){
     const key=preschoolMath.has(kind)?'matematyka':preschoolPolish.has(kind)?'polski':kind==='quiz'?'przyroda':null;
     if(kind==='camera'&&['polski','matematyka'].includes(subject)||key===subject)games.push(row(kind,name,subject,icon,engine));
    }
   }
   if(subject==='matematyka')games.push(row('shapes','Kolory i kształty',subject,'🔶'),row('add','Dodawanie obrazków',subject,'🧮'));
   if(subject==='angielski')games.push(row('words','Słówka i obrazki',subject,'🖼️'));
  }else{
   if(school&&subject==='matematyka')for(const [engine,entries] of [['arcade',schoolGames92],['scene',schoolMissions93]])for(const [kind,icon,name] of entries)games.push(row(kind,name,subject,icon,engine));
   if(subject==='polski')games.push(row('spelling','Ortografia',subject,'✍️'),row('dictation','Dyktando',subject,'🎙️'),row('grammar','Części mowy',subject,'🧩'),
    row('syllables','Sylaby i głoski',subject,'🔠'),row('read','Czytanie ze zrozumieniem',subject,'📚'));
   if(subject==='matematyka')games.push(row('math','Działania matematyczne',subject,'🧮'),row('geometry','Geometria',subject,'📐'));
   if(subject==='angielski')games.push(row('words','Słówka i wymowa',subject,'🎧'));
  }
  if(!pre&&['polski','matematyka','angielski'].includes(subject))games.push(row('bank','Quiz · '+names[subject],subject,'⭐'));
  if(subject==='przyroda'||subject==='other')games.push(row('nature',subject==='przyroda'?'Quiz przyrodniczy':'Quiz wiedzy',subject));
  if(subject==='angielski'||!pre&&['matematyka','polski'].includes(subject)){
   const seen=new Set();
   for(const t of candidates(grade,subject,0)){
    if(seen.has(t.game80))continue;
    seen.add(t.game80);games.push(row(t.game80,titles[t.game80],subject,icons[subject],'word-game'));
   }
  }
 }
 return games;
}
export const trainingGroupName95=key=>names[key]??'Wiedza';

function arithmetic(grade) {
 const cap=Number(grade)===1?20:Number(grade)===2?50:100;
 const n=grade==='P'?5:cap;
 return Array.from({length:n-1},(_,i)=>{
  const a=i+1, b=1+Math.floor(Math.random()*Math.max(1,Math.min(a,n-a)));
  const sub=grade!=='P'&&i%2===1, x=sub?a-b:a+b;
  return ['Ile to '+a+(sub?' − ':' + ')+b+'?',String(x),String(x+1),String(x+2)];
 });
}
const task=(data,subject,extra={})=>{
 const [question,answer,...distractors]=data;
 const others=distractors.filter(x=>x!==answer);
 return {type:'choice',question,answer,options:shuffle92([answer,...new Set(others)]),
  sourceTitle:'Wiedza spoza książki',outsideSubject95:subject,
  hint:'Przeczytaj polecenie i przyjrzyj się odpowiedziom.',explanation:'Poprawna odpowiedź: '+answer+'.',...extra};
};

export function outsideDeck95(game,grade,custom=[],one=false) {
 const {subject,kind,engine}=game;
 if(engine==='word-game'){
  const limit=one?1:5,result=[],seen=new Set();
  for(let i=0;i<limit*4&&result.length<limit;i++){
   const task=candidates(grade,subject,i).find(t=>t.game80===kind);
   if(!task)continue;
   const key=JSON.stringify([task.answer,task.wordEn,task.label80,task.solutions77,task.audio]);
   if(seen.has(key))continue;
   seen.add(key);result.push({...task,outsideSubject95:subject});
  }
  return result;
 }
 let rows=[];
 switch(kind){
  case 'spelling': return shuffle92(spelling).slice(0,one?1:8).map(([word,right,wrong])=>task(['Uzupełnij wyraz: '+word,right,wrong],subject,{explanation:'Piszemy: '+word.replace('_',right)+'.'}));
  case 'dictation': return shuffle92(spelling).slice(0,one?1:6).map(([word,right,wrong])=>{
   const answer=word.replace('_',right);
   return task(['Posłuchaj i napisz usłyszany wyraz.',answer,word.replace('_',wrong)],subject,{type:'dictation',audio:answer});
  });
  case 'grammar': rows=grammar;break;
  case 'syllables': rows=syllables.map(([word,count])=>['Ile sylab ma wyraz „'+word.replaceAll('-','')+'”?',count,...['1','2','3','4'].filter(n=>n!==count).slice(0,2)]);break;
  case 'read': rows=readings.map(r=>[r.text+' '+r.question,r.answer,...r.options.filter(x=>x!==r.answer)]);break;
  case 'geometry': rows=Number(grade)===1?geometry.filter((_,i)=>i!==2):geometry;break;
  case 'shapes': rows=shapes;break;
  case 'add': rows=arithmetic('P').map(([,answer,...rest],i)=>['Policz wszystkie jabłka. '+'🍎'.repeat(i+1)+' + '+'🍏'.repeat(Number(answer)-i-1),answer,...rest]);break;
  case 'math': rows=arithmetic(grade);break;
  case 'words': {
   const pool=englishPool(grade);
   return shuffle92(pool).slice(0,one?1:8).map(item=>task(
    ['What does '+item.en+' mean?',item.pl,...shuffle92(pool.filter(p=>p.pl!==item.pl)).slice(0,3).map(p=>p.pl)],
    subject,{questionPl:'Co oznacza „'+item.en+'”?',audio:item.en}));
  }
  case 'bank':
   rows=subject==='polski'?grammar:subject==='matematyka'?arithmetic(grade):[];
   if(subject==='angielski'&&!custom.length)return outsideDeck95({...game,kind:'words'},grade,custom,one);
   break;
  case 'nature': rows=grade==='P'?[
   ['Które zwierzę ma długie uszy?','Królik','Kaczka','Ryba'],['Co rośnie na drzewie?','Jabłko','But','Łyżka'],
   ['Kiedy pada śnieg?','Zimą','Latem','Na plaży'],['Kto mieszka w ulu?','Pszczoły','Koty','Konie']
  ]:nature;break;
 }
 const base=rows.map(data=>task(data,subject));
 if(kind==='nature'||kind==='bank')for(const item of custom){
  if(typeof item?.q!=='string'||typeof item.a?.[item.ok]!=='string')continue;
  const options=item.a.filter((choice,i)=>i!==Number(item.ok)&&typeof choice==='string');
  const meta=subject==='angielski'?{questionPl:item.qPl||'',audio:item.audio||''}:{};
  base.push(task([item.q,item.a[item.ok],...options],subject,meta));
 }
 return shuffle92(base).slice(0,one?1:8);
}

export function trainingSequence95(catalog,pages,books,rotation,subject) {
 const rotate=(items,n)=>[...items.slice(n%items.length),...items.slice(0,n%items.length)];
 const groups=subject==='all'?subjects.filter(key=>catalog.some(item=>item.subject===key)):[subject];
 const turns=groups.length>1?groups.length*2:6;
 const queues=new Map(groups.map((key,i)=>[key,rotate(catalog.filter(item=>item.subject===key),rotation+i)]));
 const bookPages=rotate(pages,rotation);
 const usedPages=new Set();
 return Array.from({length:turns},(_,i)=>{
  const key=groups[i%groups.length], queue=queues.get(key);
  const page=bookPages.find(p=>!usedPages.has(p.id)&&(subject!=='all'||trainingSubject95(books.find(b=>b.id===p.bookId)?.subject)===key));
  if((groups.length>1?i>=groups.length:i%3===1)&&page){usedPages.add(page.id);return {page,key};}
  if(!queue?.length)return page?{page,key}:null;
  const item=queue.shift();queue.push(item);return {game:item,key};
 }).filter(Boolean);
}
