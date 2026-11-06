// Te same mechaniki V80/V81, z treścią z wybranych polskich i matematycznych stron.
const mixSubject82=a=>{const b=[...a];for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]];}return b;};
const atSubject82=(a,r)=>a[(Math.abs(r)||0)%a.length];
const normSubject82=s=>String(s??'').trim().toLocaleLowerCase('pl-PL');
export function subjectPool82(all,pages,books,subject){
 const ps=pages.filter(p=>books.some(b=>b.id===p.bookId&&(subject==='matematyka'?/mat/i:/pol/i).test(b.subject||''))),byId=new Map(ps.map(p=>[p.id,p])),out=[],seen=new Set();
 const add=(value,cue,p,extra={})=>{const en=normSubject82(value);if(!p||!en||seen.has(en))return;seen.add(en);out.push({en,pl:cue,cue82:cue,sourcePageId:p.id,sourceBookId:p.bookId,pageNumber:p.number,sourceTitle:(books.find(b=>b.id===p.bookId)?.title||'Materiał')+' · strona '+p.number,explanation82:extra.explanation||'Poprawna odpowiedź: '+en+'.',...extra});};
 for(const t of all){const p=byId.get(t.sourcePageId);if(!p||t.game80||!t.question||!['choice','safe','shop','loki','detective','write','spelling','dictation','order'].includes(t.type))continue;
  const a=normSubject82(t.answer);
  if(subject==='matematyka'&&/^\d+(?:[,.]\d+)?$/.test(a)&&Number(a.replace(',','.'))<=1000)add(a,t.question,p,{explanation:t.explanation||'',options82:t.options});
  if(subject==='polski'&&/^[a-ząćęłńóśźż]{2,16}$/u.test(a)&&(' '+normSubject82(p.text).replace(/[^\p{L}]+/gu,' ')+' ').includes(' '+a+' '))add(a,t.question,p,{explanation:t.explanation||''});
 }
 for(const p of ps){
  if(subject==='matematyka'){
   for(const m of String(p.text||'').matchAll(/(?<![\d.,])(\d{1,3})\s*([+−×*÷:/-])\s*(\d{1,3})(?!\d)/gu)){
    const a=Number(m[1]),b=Number(m[3]),op=m[2],value=op==='+'?a+b:/[-−]/.test(op)?a-b:/[*×]/.test(op)?a*b:b?a/b:NaN;
    if(!Number.isSafeInteger(value)||value<0||value>1000)continue;
    const expression=m[1]+' '+({'*':'×',':':'÷','/':'÷','-':'−'}[op]||op)+' '+m[3];add(String(value),'Oblicz: '+expression+' = ?',p,{explanation:expression+' = '+value+'.'});
   }
  }else{
   const stop=new Set('jest oraz albo żeby które który która przez tylko tego jego była było byli będzie mają tutaj takie teraz bardzo potem'.split(' '));
   for(const w of String(p.text||'').match(/[a-ząćęłńóśźż]+/giu)||[]){const word=normSubject82(w);if(word.length>=3&&word.length<=12&&!stop.has(word))add(word,'Wyraz z czytanki: „'+word+'”.',p,{explanation:'W tym wyrazie piszemy: '+[...word].join(' · ')+'.'});if(out.length>=100)break;}
  }
 }
 return out;
}
export function buildSubjectGames82(pool,subject,round=0){
 if(!pool.length)return [];const out=[],math=subject==='matematyka',word=atSubject82(pool,round),take=n=>Array.from({length:Math.min(n,pool.length)},(_,i)=>atSubject82(pool,round+i));
 const opts=target=>mixSubject82([target,...mixSubject82(pool.filter(x=>x.en!==target.en)).slice(0,3)]);
 const add=(kind,target,extra={},instruction=target.cue82)=>out.push({game80:kind,type:'game80',subject82:subject,language82:'pl-PL',question:'',questionPl:instruction,instructionEn:'',instructionPl:instruction,answer:target.en,wordEn:target.en,promptPl:target.cue82,sourcePageId:target.sourcePageId,sourceBookId:target.sourceBookId,sourceTitle:target.sourceTitle,pageNumber:target.pageNumber,explanation:target.explanation82,options:[],done:false,correct:false,progress80:0,miss80:false,...extra});
 if(!math){
  const alphabet=[...'aąbcćdeęfghijklłmnńoóprsśtuwyzźż'],chars=[...word.en],decoys=mixSubject82(alphabet.filter(c=>!chars.includes(c))).slice(0,3),fly=mixSubject82([...new Set([...chars,...decoys])]);
  for(const kind of ['letter-race','egg','balloon'])add(kind,word,{letters80:mixSubject82(chars),picked80:[],slots80:chars.map((_,i)=>i).filter(i=>i%2===1),decoys80:decoys,fly80:fly,flightRounds80:chars.map(c=>mixSubject82([c,...mixSubject82(fly.filter(x=>x!==c)).slice(0,3)])),ship80:50},'Ułóż wyraz z wybranego tekstu: „'+word.en+'”.');
  const gap=Math.abs(round)%chars.length;add('letter-thief',word,{game81:true,progress81:0,gap81:gap,letters81:mixSubject82([chars[gap],...decoys]),miss81:''},'Złap brakującą literę wyrazu „'+word.en+'”.');
  add('block-tower',word,{game81:true,progress81:0,letters81:chars.map(c=>mixSubject82([c,...mixSubject82(alphabet.filter(x=>x!==c)).slice(0,2)])),stack81:[],selected81:null,miss81:''},'Zbuduj wieżę z liter wyrazu „'+word.en+'”.');
 }
 if(pool.length<2)return out;
 add('word-catcher',word,{items80:opts(word),ship80:50},(math?'Złap wynik. ':'Złap właściwy wyraz. ')+word.cue82);
 const items=take(4),order=Array.from({length:items.length},(_,i)=>(i+1)%items.length);
 add('caterpillar',word,{game81:true,progress81:0,items81:items,right81:order,matched81:[],selected81:null,miss81:'',answer:'Wszystkie pary',solutions77:items.map(x=>x.cue82+' — '+x.en)},math?'Połącz działania z wynikami.':'Połącz polecenia z wyrazami z wybranego tekstu.');
 add('armor-builder',word,{game81:true,progress81:0,parts81:items.map(x=>({word:x,choices:opts(x),kind:'choice',letters:[],picked:[]})),answer:'Zbroja gotowa',solutions77:items.map(x=>x.cue82+' — '+x.en),miss81:''},math?'Zasil zbroję poprawnymi wynikami działań.':'Zasil zbroję, wybierając wyrazy pasujące do poleceń.');
 add('web-climber',word,{game81:true,progress81:0,floors81:items.map(x=>({word:x,choices:opts(x)})),web81:null,answer:'Dach zdobyty',solutions77:items.map(x=>x.cue82+' — '+x.en),miss81:''},math?'Strzel siecią w okno z poprawnym wynikiem.':'Strzel siecią w okno z wyrazem pasującym do polecenia.');
 add('moon-maze',word,{game81:true,progress81:0,pos81:[1,1],opened81:[],door81:null,gates81:Array.from({length:3},(_,i)=>{const x=atSubject82(pool,round+i);return {word:x,choices:opts(x)}}),answer:'Labirynt ukończony',solutions77:take(3).map(x=>x.cue82+' — '+x.en),miss81:''},math?'Przejdź labirynt. Otwieraj drzwi, wybierając poprawne wyniki.':'Przejdź labirynt. Otwieraj drzwi, wybierając wyrazy zgodne z poleceniami.');
 return out;
}
