export const schoolGames92=[
 ['race','🏎️','Wyścig mnożeniowy','Rozpędź samochód i dojedź do mety.'],
 ['balloons','🎈','Złap właściwy wynik','Dotknij balonu z wynikiem działania.'],
 ['timer','⏱️','Tabliczka na czas','Wybierz tabliczkę. Masz 10 sekund na każde działanie.'],
 ['puzzle','🧩','Mnożeniowe puzzle','Odkrywaj obrazek po kawałku.'],
 ['missing','✏️','Podaj brakującą liczbę','Uzupełnij czynnik albo wynik.'],
 ['treasure','🏴‍☠️','Mnożeniowe skarby','Otwieraj skrzynie na wyspie piratów.'],
 ['master','🏆','Mistrz mnożenia','Ukończ cztery poziomy i zdobądź medal.']
];
export const preschoolGames92=[
 ['letters','🔤','Poznaj literki','Posłuchaj i znajdź właściwą literę.'],
 ['numbers','🔢','Cyfrowe łowy','Znajdź liczbę, o której mówi lektor.'],
 ['order','🧸','Literki w kolejności','Dotykaj liter w kolejności alfabetu.'],
 ['hidden','🌳','Znajdź cyfrę na obrazku','Odszukaj wszystkie pasujące cyfry.'],
 ['rhymes','🐝','Rymowanki i literki','Posłuchaj rymowanki i rozpoznaj pierwszą literę.'],
 ['trace','✍️','Pisanie po śladzie','Prowadź paluszek po przerywanej linii.'],
 ['quiz','⭐','Quiz małego odkrywcy','Rozpoznawaj litery, licz i wybieraj obrazki.']
];
export const alphabet92=Array.from('AĄBCĆDEĘFGHIJKLŁMNŃOÓPRSŚTUWYZŹŻ');
export const numbers92=Array.from({length:11},(_,i)=>i);
export const table92=numbers92.slice(1);
export const masterLevels92=['Łatwe działania','Mnożenie przez 2, 3 i 4','Mieszane działania','Brakujące liczby'];
export const awardNames92={race:'🏆 Puchar wyścigu',master:'🏅 Medal Mistrza Mnożenia'};

export function gameGroup92(grade){
 if(grade==='P')return 'preschool';
 if(['1','2','3'].includes(String(grade)))return 'school';
 return '';
}

export function shuffle92(items,random=Math.random){
 const copy=[...items];
 for(let i=copy.length-1;i>0;i--){
  const j=Math.floor(random()*(i+1));
  [copy[i],copy[j]]=[copy[j],copy[i]];
 }
 return copy;
}

export function mathRound92(game,grade,{factor=0,level=0,random=Math.random}={}){
 const size={race:7,balloons:8,timer:10,puzzle:9,missing:9,treasure:6,master:4}[game]??0;
 const max={1:5,2:10,3:10}[grade]??10;
 const easy=Number(grade)===3?[1,2,3,4,5]:[1,2,3];
 const masterFactors=game==='master'&&level===1?shuffle92([2,3,4],random):null;
 const tasks=[];
 const used=new Set();
 for(let i=0;i<size;i++){
  const stage=game==='missing'?Math.floor(i/3):game==='master'?level:0;
  const fixed=game==='timer'&&table92.includes(factor)?[factor]:null;
  const factors=fixed??(masterFactors?[masterFactors[i%masterFactors.length]]:
   game==='master'&&stage===0||game==='missing'&&stage===0?easy:
   game==='missing'&&stage===2?table92.slice(2,max):table92.slice(0,max));
  const largest=fixed?10:game==='master'&&stage===0?Math.min(max,5):
   game==='missing'&&stage<2?Math.min(max,stage===0?4:7):max;
  const pairs=factors.flatMap(a=>table92.slice(0,largest).map(b=>[a,b]));
  const available=pairs.filter(([a,b])=>!used.has(fixed?a+':'+b:Math.min(a,b)+':'+Math.max(a,b)));
  const [a,b]=shuffle92(available.length?available:pairs,random)[0];
  used.add(fixed?a+':'+b:Math.min(a,b)+':'+Math.max(a,b));
  const product=a*b;
  const slot=game==='missing'?[2,0,1,0,1,0,1,0,1][i]:game==='master'&&stage===3?i%2:2;
  const answer=[a,b,product][slot];
  const alternatives=slot===2?[product-a,product+b,product+a,product-b,product+1,product-1,product+2,product-2]:
   [answer-1,answer+1,answer+2,answer-2];
  const options=shuffle92([answer,...shuffle92([...new Set(alternatives)].filter(n=>n>0&&n<=100&&n!==answer),random).slice(0,2)],random);
  const values=[a,b,product].map((n,index)=>index===slot?'?':n);
  tasks.push({
   prompt:values[0]+' × '+values[1]+' = '+values[2],
   speech:values[0]+' razy '+values[1]+' równa się '+values[2]+'. Gdzie jest brakująca liczba?',
   equation:a+' × '+b+' = '+product,answer,options,stage,a,b,slot
  });
 }
 return tasks;
}

const letterNames92={
 B:'be',C:'ce',Ć:'cie',D:'de',F:'ef',G:'gie',H:'ha',J:'jot',K:'ka',L:'el',Ł:'eł',
 M:'em',N:'en',Ń:'eń',Ó:'u kreskowane',P:'pe',R:'er',S:'es',Ś:'eś',T:'te',W:'wu',
 Y:'igrek',Z:'zet',Ź:'ziet',Ż:'żet'
};
const examples92={
 A:'arbuz',Ą:'wąż',B:'banan',C:'cebula',Ć:'ćma',D:'dom',E:'ekran',Ę:'gęś',F:'foka',G:'góra',
 H:'hamak',I:'igła',J:'jabłko',K:'kot',L:'lew',Ł:'łódka',M:'miś',N:'nos',Ń:'koń',O:'oko',
 Ó:'ósemka',P:'pies',R:'ryba',S:'słoń',Ś:'ślimak',T:'trawa',U:'ucho',W:'woda',Y:'dym',
 Z:'zebra',Ź:'źródło',Ż:'żaba'
};
const rhymes92=[
 ['B','banan','banana','Żółty rogalik, skórkę ma. Małpka chętnie go zjada.'],
 ['D','dom','house','Drzwi i okna, dach nad nami. Tutaj mieszkam z rodzicami.'],
 ['K','kot','cat','Miękkie łapki, długi wąs. Mruczy, gdy przychodzi noc.'],
 ['K','królik','rabbit','Długie uszy ma i fika. Chrupie marchew i pomyka.'],
 ['P','pies','dog','Kiedy wracam, ogon merda. Mój wesoły kumpel szczeka.'],
 ['R','ryba','fish','Pływa cicho, nie chce mówić. W wodzie nurki bardzo lubi.'],
 ['S','słoń','elephant','Wielkie uszy, trąba długa. Chlapie wodą, okiem mruga.'],
 ['M','marchewka','carrot','Rośnie w ziemi, chrupie zdrowo. Jaka? Pomarańczowo!'],
 ['J','jabłko','apple','Rośnie w sadzie, pachnie latem. Chrup je razem z siostrą, bratem.'],
 ['L','lew','lion','Ma grzywę, jaką nosi król. Usłyszysz jego głośny ryk: ruu!']
];
export const letterName92=l=>letterNames92[l]??l;
const hasStartExample92=l=>!['Ą','Ę','Ń','Y'].includes(l);
const exampleSpeech92=l=>hasStartExample92(l)?letterName92(l)+' jak '+examples92[l]+'.':
 'Literę '+letterName92(l)+' słyszysz w słowie '+examples92[l]+'.';

function options92(answer,others,count,random){
 return shuffle92([answer,...shuffle92(others.filter(n=>n!==answer),random).slice(0,count-1)],random);
}
const choose92=(options,random)=>options[Math.floor(random()*options.length)];
const quizPicture92=(name,letter,image)=>({name,letter,image});

export function preschoolRound92(game,{lower=false,random=Math.random}={}){
 if(game==='letters')return shuffle92(alphabet92,random).slice(0,8).map(answer=>({
  answer,prompt:lower?'Znajdź małą literę.':'Znajdź literę.',cue:answer,
  speech:(lower?'Znajdź małą literę ':'Znajdź literę ')+letterName92(answer)+'.',
  options:options92(answer,alphabet92,3,random),lower,success:exampleSpeech92(answer)
 }));
 if(game==='numbers')return shuffle92(table92,random).slice(0,8).map((answer,index)=>{
  const count=Math.min(8,3+Math.floor(index/1.5));
  return {answer,prompt:'Znajdź '+answer+'.',speech:'Znajdź liczbę '+answer+'.',
   options:options92(answer,table92,count,random),success:'Brawo! To '+answer+'.'};
 });
 if(game==='order'){
  const sizes=[3,3,4,4,5,5];
  return sizes.map((length,index)=>{
   const alphabet=index<2?alphabet92.filter(letter=>/^[A-Z]$/.test(letter)):alphabet92;
   const max=alphabet.length-length;
   const starts=index===0?[0,1,2,3,4,5]:index===sizes.length-1?[max-2,max-1,max]:table92.map(n=>n+index*3).filter(n=>n<=max);
   const start=choose92(starts,random);
   const answer=alphabet.slice(start,start+length);
   let display=shuffle92(answer,random);
   if(display.every((letter,i)=>letter===answer[i]))display=[...display.slice(1),display[0]];
   return {answer,prompt:'Ułóż litery w kolejności.',speech:'Dotykaj liter w kolejności alfabetu. Zacznij od '+letterName92(answer[0])+'.',options:display};
  });
 }
 if(game==='hidden')return shuffle92(table92.slice(0,9),random).slice(0,4).map((answer,index)=>{
  const count=index+2;
  const others=shuffle92(table92.slice(0,9).filter(n=>n!==answer),random).slice(0,9-count);
  const prompt='Znajdź wszystkie wystąpienia cyfry '+answer+'.';
  return {answer,count,prompt,speech:prompt,options:shuffle92([...Array(count).fill(answer),...others],random)};
 });
 if(game==='rhymes')return shuffle92(rhymes92,random).slice(0,7).map(([answer,word,image,rhyme])=>({
  answer,image,rhyme,prompt:'Jaka jest pierwsza litera?',speech:rhyme+' Posłuchaj słowa: '+word+'. Jaka jest pierwsza litera?',
  options:options92(answer,alphabet92,3,random),success:letterName92(answer)+' jak '+word+'.'
 }));
 if(game==='quiz'){
  const pictures=[quizPicture92('kot','K','cat'),quizPicture92('dom','D','house'),
   quizPicture92('banan','B','banana'),quizPicture92('lew','L','lion'),quizPicture92('ryba','R','fish')];
  const tasks=[];
  for(let i=0;i<2;i++){
   const letter=choose92(alphabet92,random),previous=Math.floor(random()*9)+1;
   const apples=Math.floor(random()*7)+2,picture=choose92(pictures,random);
   const lookFor='Który obrazek zaczyna się na literę '+letterName92(picture.letter)+'?';
   const find={answer:letter,prompt:'Gdzie jest '+letter+'?',speech:'Gdzie jest litera '+letterName92(letter)+'?',options:options92(letter,alphabet92,3,random)};
   const next={answer:previous+1,prompt:'Jaka liczba jest po '+previous+'?',speech:'Jaka liczba jest po '+previous+'?',options:options92(previous+1,table92,3,random)};
   const count={answer:apples,apples,prompt:'Ile tu jest jabłek?',speech:'Policz jabłka. Ile ich jest?',options:options92(apples,table92,3,random)};
   const pictureTask={answer:picture.image,prompt:lookFor,speech:lookFor,pictures:options92(picture,pictures,3,random)};
   tasks.push(find,next,count,pictureTask);
  }
  return shuffle92(tasks,random);
 }
 return [];
}

export function recordGameAward92(profile,id){
 if(!Object.hasOwn(awardNames92,id))return false;
 const base=profile.base??={version:1,owned:[]};
 const headquarters=base.headquarters??={};
 const awards=headquarters.learningAwards92??={};
 if(awards[id])return false;
 awards[id]=true;
 return true;
}
