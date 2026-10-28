// V53_CONSOLIDATED_CROSSING_CHAPTERS
// V55_FULL_REVIEW
// V52_DIVERSE_LEARNING
// V51_LIVE_TUTOR
// V49_PAGE_ADVENTURES
// V48_BANK_AI
// V47_INTERACTIVE_MISSIONS
// V46_AI_SCOPE
// V45_CHAPTER_SELECTION_VERIFIED
// V43_JSON_REPAIR
// V42_CHAPTER_SELECTION
// V41: interaktywne misje z podrecznikow, AI generuje tresc, aplikacja mechanike.
export function mountMissionGame(root,{books,pages,ask,speak,reward,child,initialBookId}){
 const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const norm=s=>String(s??'').trim().toLocaleLowerCase('pl-PL').replace(/\s*,\s*/g,', ').replace(/\s+/g,' ');
 const btn=(label,act,cls='')=>`<button type="button" class="${cls}" data-mg="${act}">${label}</button>`;
 const shuffle=a=>[...a].sort(()=>Math.random()-.5);
 let tutorMessages=[],tutorBusy=false,tutorListening=false;
 let bookId=initialBookId||'',scope='all',mode='game',tasks=[],idx=0,points=0,choice=null,answered=false,tiles=[],busy=false,award=false,progress={},hintLevel=0,paused=false,wrongAttempts=0;
 const book=()=>books.find(b=>b.id===bookId);
 const subject=()=>/ang|english/i.test(book()?.subject||'')?'angielski':/mat/i.test(book()?.subject||'')?'matematyka':'polski';
 const available=()=>books.filter(b=>pages.some(p=>p.bookId===b.id&&p.text?.trim()));
 const pagesFor=()=>pages.filter(p=>p.bookId===bookId&&p.text?.trim()).sort((a,b)=>a.number-b.number);
 const sourceBook=p=>books.find(b=>b.id===p.bookId);
 const sourceLabel=p=>{const b=sourceBook(p);return (b?.kind||'Podręcznik')+' — '+(b?.title||'Materiał')+', strona '+p.number};
 const comparable=(a,b)=>String(a||'').trim().toLocaleLowerCase('pl-PL')===String(b||'').trim().toLocaleLowerCase('pl-PL');
 const sharedChapterPages=chapter=>{const base=book();return pages.filter(p=>p.text?.trim()&&comparable(p.chapter,chapter)&&books.some(b=>b.id===p.bookId&&!b.archived&&b.child===base?.child&&comparable(b.subject,base?.subject)&&String(b.grade||'')===String(base?.grade||''))).sort((a,b)=>String(sourceBook(a)?.title||'').localeCompare(String(sourceBook(b)?.title||''))||a.number-b.number)};
 const material=()=>scopePages().map(p=>`STRONA ${p.number}${p.chapter?' | DZIAŁ '+p.chapter:''}: ${p.text}`).join('\n').slice(0,15000);
 const themes={polski:['🕵️ Detektyw Spider-Mana','🦹 Pułapka Lokiego','🎙️ Laboratorium czytania','🧩 Szyfr Avengersów','✍️ Dyktando Kapitana','🔠 Sylaby i głoski','📝 Krzyżówka'],matematyka:['🔐 Sejf Iron Mana','🛒 Sklep Avengersów','⏰ Zegar misji','📐 Geometria','🧮 Działania','🧠 Logiczne zagadki'],angielski:['🎧 Słuchanie','🎙️ Wymowa','🃏 Memory','🧩 Rozsypanki','✍️ Pisownia','🦹 Pułapka Lokiego','🗣️ Dialogi']};
 const plan={polski:['detective','loki','reading','order','dictation','syllables','crossword','choice'],matematyka:['safe','shop','clock','choice','safe','order','choice','shop'],angielski:['listening','memory','order','spelling','loki','reading','choice','listening']};
 const storeKey=()=>`academy-v41-${child}-${bookId}-${scope}`;

 function chapterOf(p){return String(p.chapter||'').trim()}
 function chapters(){const base=book();return [...new Set(pages.filter(p=>p.text?.trim()&&books.some(b=>b.id===p.bookId&&!b.archived&&b.child===base?.child&&comparable(b.subject,base?.subject)&&String(b.grade||'')===String(base?.grade||''))).map(chapterOf).filter(Boolean))]}
 function scopePages(){
  const ps=pagesFor();if(scope==='all')return ps;
  if(scope.startsWith('chapter:'))return sharedChapterPages(scope.slice(8));
  if(scope.startsWith('pages:')){
   const nums=new Set();scope.slice(6).split(/[,;\s]+/).forEach(x=>{
    const m=x.match(/^(\d+)-(\d+)$/);
    if(m){const lo=+m[1],hi=+m[2];if(Math.abs(lo-hi)<=100)for(let n=Math.min(lo,hi);n<=Math.max(lo,hi);n++)nums.add(n)}
    else if(/^\d+$/.test(x))nums.add(+x);
   });return ps.filter(p=>nums.has(+p.number));
  }return [];
 }
 function voiceGuide(){speak('Witaj w Akademii Superbohaterów! Wybierz podręcznik. Następnie wybierz całą książkę, jeden dział albo konkretne strony. Na końcu wybierz przygodę lub sprawdzian i rozpocznij misję!','pl-PL')}
 function report(){const v=stats();const rows=v.slice(-80).reverse();root.innerHTML='<section class="mg-panel"><h2>📋 Trudności i pominięte zadania</h2><p>Raport zapisany na tym urządzeniu. Pokazuje błędne próby i pominięcia w tej książce.</p>'+rows.map(x=>'<div class="mg-feedback"><strong>Strona '+escape(x.page)+'</strong> · '+escape(x.type)+'<p>'+escape(x.question)+'</p><small>'+escape(x.reason)+'</small></div>').join('')+btn('Wróć','back')+'</section>'}
 function setup(){
  const bs=available();if(!bs.length){root.innerHTML='<section class="mg-panel"><h2>📚 Dodaj stronę z rozpoznanym tekstem</h2></section>';return}
  if(!bs.some(b=>b.id===bookId))bookId=bs[0].id;
  const ch=chapters();
  root.innerHTML='<section class="mg-panel mg-v42"><header class="mg-header"><small>⚡ AKADEMIA SUPERBOHATERÓW</small><h2>🚀 Wybierz przygodę!</h2><p>Posłuchaj instrukcji!</p></header>'
  +btn('🔊 Opowiedz mi, co mam zrobić','guide','mg-primary')
  +'<h3>📚 Wybierz podręcznik</h3><div class="mg-v42-grid">'+bs.map(b=>'<button type="button" class="mg-v42-card '+(b.id===bookId?'active':'')+'" data-mg-book="'+escape(b.id)+'"><span>📘</span><strong>'+escape(b.title)+'</strong><small>'+escape(b.subject)+'</small></button>').join('')+'</div>'
  +'<h3>🗺️ Wybierz materiał</h3><div class="mg-v42-grid">'
  +[['all','🌍','Cała książka'],['chapter','📚','Jeden dział'],['pages','🔢','Wybrane strony']].map(x=>'<button type="button" data-mg-scope="'+x[0]+'" class="mg-v42-card '+((x[0]==='all'&&scope==='all')||(x[0]==='chapter'&&(scope==='choosechapter'||scope.startsWith('chapter:')))||(x[0]==='pages'&&(scope==='choosepages'||scope.startsWith('pages:')))?'active':'')+'"><span>'+x[1]+'</span><strong>'+x[2]+'</strong></button>').join('')+'</div>'
  +'<div id="mg-v42-detail"></div><p class="mg-v42-count">📄 Dostępne strony: <strong id="mg-v42-count">'+scopePages().length+'</strong></p>'
  +'<p class="mg-hint">📚 Wybrany dział łączy podręczniki, ćwiczenia i inne materiały tego samego przedmiotu i klasy.</p><h3>🎯 Rodzaj misji</h3><div class="mg-v42-grid">'+[['game','🎮','Przygoda'],['test','🏆','Sprawdzian']].map(x=>'<button type="button" data-mg-mode="'+x[0]+'" class="mg-v42-card '+(mode===x[0]?'active':'')+'"><span>'+x[1]+'</span><strong>'+x[2]+'</strong></button>').join('')+'</div>'
  +btn('📋 Zobacz trudności','report')+btn('⚡ ROZPOCZNIJ MISJĘ','start','mg-primary')+ (localStorage.getItem(sessionKey())?btn('▶️ Wznów ostatnią misję','resume','mg-primary'):'')+'<p class="mg-hint">Każda strona to osobny etap przygody. Możesz zatrzymać misję i wrócić później.</p></section>';
  const detail=root.querySelector('#mg-v42-detail');
  if(scope==='choosechapter'||scope.startsWith('chapter:'))detail.innerHTML=ch.length?'<div class="mg-v42-grid">'+ch.map(x=>'<button type="button" data-mg-chapter="'+escape(x)+'" class="mg-v42-card '+(scope==='chapter:'+x?'active':'')+'">📖 '+escape(x)+'</button>').join('')+'</div>':'<p class="mg-hint">Przypisz strony do działów w bibliotece.</p>';
  else if(scope==='choosepages'||scope.startsWith('pages:')){
   detail.innerHTML='<label for="mg-v42-pages">Wpisz numery stron, np. 2, 5, 8-10</label><input id="mg-v42-pages" type="text" placeholder="2, 5, 8-10" value="'+escape(scope.startsWith('pages:')?scope.slice(6):'')+'">';
   detail.querySelector('input').oninput=e=>{scope='pages:'+e.target.value;root.querySelector('#mg-v42-count').textContent=scopePages().length};
  }
  root.querySelectorAll('[data-mg-book]').forEach(el=>el.onclick=()=>{bookId=el.dataset.mgBook;scope='all';setup()});
  root.querySelectorAll('[data-mg-scope]').forEach(el=>el.onclick=()=>{scope=el.dataset.mgScope==='all'?'all':el.dataset.mgScope==='chapter'?'choosechapter':'choosepages';setup()});
  root.querySelectorAll('[data-mg-mode]').forEach(el=>el.onclick=()=>{mode=el.dataset.mgMode;setup()});
  root.querySelectorAll('[data-mg-chapter]').forEach(el=>el.onclick=()=>{scope='chapter:'+el.dataset.mgChapter;setup()});
 }
 // V48_BANK_AI: zapis lokalny w przegladarce, osobny dla kazdego dziecka i podrecznika
 const bankKey=()=>`academy-v48-bank-${child}-${bookId}`;
 const sessionKey=()=>`academy-v49-session-${child}-${bookId}`;
 const remember=()=>{try{localStorage.setItem(sessionKey(),JSON.stringify({scope,mode,tasks,idx,points,award}))}catch{}};
 function resume(){try{const x=JSON.parse(localStorage.getItem(sessionKey())||'null');if(!x||!x.tasks?.length)return setup();scope=x.scope;mode=x.mode;tasks=x.tasks;idx=x.idx;points=x.points;award=x.award;paused=false;reset();draw()}catch{setup()}}
 const selectionIds=()=>new Set(scopePages().map(p=>String(p.number)));
 const fingerprint=t=>norm(t.question)+'|'+norm(t.answer);
 function readBank(){try{const v=JSON.parse(localStorage.getItem(bankKey())||'[]');return Array.isArray(v)?v:[]}catch{return []}}
 function writeBank(items){try{localStorage.setItem(bankKey(),JSON.stringify(items.slice(-350)))}catch(e){console.warn('Nie mozna zapisac banku zadan',e)}}
 function storeTasks(items){
  const bank=readBank();const ids=[...selectionIds()];
  for(const t of items){
   if(!t||!t.question||!t.answer||!Array.isArray(t.options))continue;
   const key=fingerprint(t);const prev=bank.find(x=>x.key===key);
   if(prev){prev.pageIds=[...new Set([...(prev.pageIds||[]),...ids])];continue}
   bank.push({key,subject:subject(),pageIds:ids,task:{question:t.question,answer:t.answer,options:t.options,explanation:t.explanation||'',audio:t.audio||'',type:t.type},seen:0,wrong:0,last:0});
  }writeBank(bank);
 }
 function pickSaved(count=5){
  const ids=selectionIds();
  const eligible=readBank().filter(x=>x.subject===subject()&&Array.isArray(x.pageIds)&&x.pageIds.some(n=>ids.has(String(n)))&&x.task?.question&&x.task?.answer&&Array.isArray(x.task.options));
  eligible.sort((a,b)=>((b.wrong||0)*3-(b.seen||0)) - ((a.wrong||0)*3-(a.seen||0)) + (Math.random()-.5)*4);
  return eligible.slice(0,count).map(x=>({...x.task,_bankKey:x.key,done:false,correct:false}));
 }
 function recordResult(t){
  const bank=readBank();const x=bank.find(v=>v.key===(t._bankKey||fingerprint(t)));
  if(x){x.seen=(x.seen||0)+1;if(!t.correct)x.wrong=(x.wrong||0)+1;else x.wrong=Math.max(0,(x.wrong||0)-1);x.last=Date.now();writeBank(bank)}
 }
 function parse(raw){
  let s=typeof raw==='string'?raw:JSON.stringify(raw);s=s.replace(/```(?:json)?/gi,'').replace(/```/g,'').trim();
  let obj;try{obj=JSON.parse(s)}catch{const a=s.indexOf('{'),b=s.lastIndexOf('}');if(a<0||b<=a)throw Error('AI nie przesłało kompletnej odpowiedzi');try{obj=JSON.parse(s.slice(a,b+1))}catch{throw Error('AI zwróciło ucięte zadania')}}
  const arr=Array.isArray(obj)?obj:obj?.tasks;
  if(!Array.isArray(arr))throw Error('AI nie zwróciło listy zadań');
  const allowed=['choice','detective','loki','reading','order','dictation','syllables','crossword','listening','spelling','write','draw','wordsearch','safe','shop','clock'];
  const good=arr.filter(t=>t&&typeof t.question==='string'&&typeof t.answer==='string'&&Array.isArray(t.options)&&t.options.length===4&&t.options.every(x=>typeof x==='string'));
  if(!good.length)throw Error('AI nie przygotowało poprawnego zadania');
  return good.slice(0,5).map((t,i)=>({...t,explanation:t.explanation||'Sprawdź fragment w podręczniku.',hint:t.hint||'Przeczytaj uważnie jeszcze raz odpowiedni fragment.',type:allowed.includes(t.type)?t.type:'choice',done:false,correct:false}));
 }
 function makeReading(p){
  const passage=String(p.text||'').trim().slice(0,850);
  return {type:'reading',question:'📜 Tajny przekaz Avengersów. Przeczytaj fragment: '+sourceLabel(p)+':',passage,answer:'Przeczytane',options:['Przeczytane','Jeszcze czytam','Powtórz','Dalej'],explanation:'Teraz wykorzystaj przeczytany tekst w kolejnych zadaniach.',hint:'Czytaj spokojnie, zdanie po zdaniu.',pageNumber:p.number,sourceBookId:p.bookId,sourceTitle:sourceLabel(p),done:false,correct:false};
 }
 function pagePrompt(p){
  const kinds=subject()==='matematyka'?'choice, safe, shop, clock, write, order, draw':subject()==='angielski'?'listening, dictation, spelling, order, choice, write, wordsearch':'detective, loki, syllables, order, dictation, crossword, wordsearch, write, choice, draw';
  return `Jesteś cierpliwym nauczycielem 8-letniego ucznia. Twórz interaktywne misje na podstawie JEDNEJ strony podręcznika. Zwróć TYLKO JSON, bez markdown: {"tasks":[{"type":"detective","question":"krótkie pytanie","answer":"poprawna odpowiedź","options":["odpowiedź 1","odpowiedź 2","odpowiedź 3","odpowiedź 4"],"hint":"wskazówka BEZ ujawniania odpowiedzi","explanation":"łagodne wyjaśnienie błędu bez zdradzania odpowiedzi przed kolejną próbą","audio":""}]}. Dokładnie 3 RÓŻNE zadania, każdy inny typ spośród: ${kinds}. Dla loki zapytaj, które zdanie jest fałszywe. Dla syllables odpowiedź to liczba sylab jednego słowa ze strony. Dla wordsearch odpowiedź to pojedyncze słowo ze strony, 3-9 liter. Dla order odpowiedź to zdanie 3-7 wyrazów. Dla dictation audio i answer to jedno słowo. Dla draw question opisuje, co narysować, a answer to krótka nazwa rysunku. Dla crossword odpowiedź to słowo 3-9 liter, options to cztery możliwe odpowiedzi, NIE hasła z definicjami. Dla write odpowiedź to krótkie słowo lub zdanie. Dla każdej zagadki daj cztery różne options, jedna z nich musi być dokładnie równa answer. NIE podawaj odpowiedzi w question, hint ani explanation. Unikaj niejednoznaczności. STRONA ${p.number}, PRZEDMIOT ${subject()}: ${String(p.text||'').slice(0,1450)}`;
 }

 const vowelsPL='aąeęiouóy';
 const lettersOnly=x=>String(x||'').toLocaleLowerCase('pl-PL').replace(/[^a-ząćęłńóśźż]/g,'');
 const lettersMatch=(a,b)=>lettersOnly(a)===lettersOnly(b);
 const curriculumKey=()=>`academy-v53-stats-${child}-${bookId}`;
 function stats(){try{return JSON.parse(localStorage.getItem(curriculumKey())||'[]')}catch{return []}}
 function logDifficulty(t,reason){
  try{const v=stats();v.push({date:new Date().toISOString(),page:t.pageNumber||'',type:t.type,question:t.question,reason,attempts:wrongAttempts,subject:subject()});localStorage.setItem(curriculumKey(),JSON.stringify(v.slice(-400)))}catch(e){console.warn(e)}
 }
 function pageText(t){const p=pages.find(p=>p.bookId===(t.sourceBookId||bookId)&&Number(p.number)===Number(t.pageNumber));return String(p?.text||t.passage||'').slice(0,1800)}
 function sayFeedback(message){try{speak(String(message).replace(/[\*#_`]/g,''),'pl-PL')}catch(e){console.warn('Mowa niedostępna',e)}}
 function audioCue(ok){try{const C=window.AudioContext||window.webkitAudioContext;if(!C)return;const c=new C(),o=c.createOscillator(),g=c.createGain();o.type=ok?'sine':'triangle';o.frequency.setValueAtTime(ok?660:240,c.currentTime);if(ok)o.frequency.exponentialRampToValueAtTime(990,c.currentTime+.13);g.gain.setValueAtTime(.035,c.currentTime);g.gain.exponentialRampToValueAtTime(.001,c.currentTime+.19);o.connect(g);g.connect(c.destination);o.start();o.stop(c.currentTime+.2);o.onended=()=>c.close()}catch(e){}}
 function wordPieces(text){return [...new Set((String(text||'').match(/[A-Za-zĄĆĘŁŃÓŚŹŻąćęłńóśźż]{4,9}/g)||[]).map(x=>x.toLocaleLowerCase('pl-PL')))].filter(w=>w.length<=8)}
 function rotatePool(pool,p){
  const key=`academy-v53-rotation-${child}-${bookId}-${p.number}-${mode}`;
  let n=0;try{n=Number(localStorage.getItem(key)||0)}catch{}
  const unique=[...new Map(pool.filter(t=>t?.question).map(t=>[t.type+'|'+t.question,t])).values()];
  const groups={};for(const t of unique)(groups[t.type]??=[]).push(t);
  const kinds=Object.keys(groups).sort((x,y)=>x.localeCompare(y));
  if(!kinds.length)return [];
  const selected=[];for(let i=0;i<Math.min(5,kinds.length);i++){
   const kind=kinds[(i+n)%kinds.length],list=groups[kind];selected.push(list[(n+Math.floor(i/2))%list.length]);
  }
  if(selected.length<4){const rest=unique.filter(t=>!selected.includes(t));selected.push(...rest.slice(n%Math.max(1,rest.length)).slice(0,4-selected.length))}
  try{localStorage.setItem(key,String(n+1))}catch{}
  return selected.slice(0,5);
 }
 function makeWordsearch(p){
  const words=wordPieces(p.text).filter(w=>w.length>=4&&w.length<=8);
  if(words.length<2)return null;
  const offset=Math.floor(Math.random()*words.length);
  const chosen=[...words.slice(offset),...words.slice(0,offset)].slice(0,Math.min(4,words.length));
  return {type:'wordsearch',question:'🔎 Znajdź i zaznacz na planszy wszystkie słowa: '+chosen.join(', ')+'.',answer:chosen.join(', '),words:chosen,pageNumber:p.number,options:[],hint:'Dotykaj kolejnych liter słowa, od pierwszej do ostatniej.',done:false,correct:false};
 }
 function makeCrossword(p){
  const ws=wordPieces(p.text).filter(w=>w.length>=4&&w.length<=8);
  if(ws.length<3)return null;
  const possible=shuffle(ws.filter(w=>w.length>=3&&w.length<=5));
  for(const secret of possible){
   const entries=[];
   for(const letter of Array.from(secret)){
    const candidates=ws.filter(w=>w.includes(letter)&&!entries.some(e=>e.word===w));
    if(!candidates.length)break;
    const word=candidates[Math.floor(Math.random()*candidates.length)];entries.push({word,index:word.indexOf(letter)});
   }
   if(entries.length===secret.length){
    // A real crossing: the secret is a vertical word; every horizontal entry intersects it once.
    const maxLeft=Math.max(...entries.map(e=>e.index));
    const width=Math.max(...entries.map(e=>maxLeft-e.index+e.word.length));
    const grid=entries.map((e,row)=>Array.from({length:width},(_,col)=>{
     const at=col-(maxLeft-e.index);
     return at>=0&&at<e.word.length?{letter:e.word[at],cross:col===maxLeft,row,col}:null;
    }));
    return {type:'crossword',question:'📝 Prawdziwa krzyżówka: wpisz poziome hasła, a litery na przecięciach utworzą pionowe hasło.',answer:secret,crossWords:entries,crossGrid:grid,crossColumn:maxLeft,pageNumber:p.number,options:[],hint:'Pionowe hasło powstanie w kolorowej kolumnie.',done:false,correct:false};
   }
  }
  return null;
 }
 function makePuzzle(p){
  const sentence=String(p.text||'').split(/(?<=[.!?])\s+/).find(x=>x.trim().split(/\s+/).length>=4&&x.trim().split(/\s+/).length<=9);
  if(!sentence)return null;
  return {type:'order',question:'🧩 Puzzle Avengersów: ułóż wyrazy w zdanie z podręcznika.',answer:sentence.trim(),options:[],pageNumber:p.number,hint:'Zacznij od wyrazu pisanego wielką literą.',done:false,correct:false};
 }
 function makeAdjective(p){
  const forms=new Set(['mały','mała','małe','małego','małej','duży','duża','duże','dużego','dużej','dobry','dobra','dobre','dobrego','dobrej','piękny','piękna','piękne','pięknego','pięknej','zielony','zielona','zielone','zielonego','zielonej','nowy','nowa','nowe','nowego','nowej','stary','stara','stare','starego','starej','drugi','druga','drugie','drugiego','drugiej','pierwszy','pierwsza','pierwsze','pierwszej']);
  const sentences=String(p.text||'').split(/(?<=[.!?])\s+/);
  const candidates=sentences.map(sentence=>({sentence,found:(sentence.match(/[A-Za-zĄĆĘŁŃÓŚŹŻąćęłńóśźż]+/g)||[]).map(w=>w.toLocaleLowerCase('pl-PL')).filter(w=>forms.has(w))})).filter(x=>x.found.length===1);
  if(!candidates.length)return null;
  const x=candidates[Math.floor(Math.random()*candidates.length)];
  return {type:'write',question:'🎨 Znajdź przymiotnik w zdaniu: „'+x.sentence.trim()+'”',answer:x.found[0],pageNumber:p.number,options:[],hint:'Przymiotnik odpowiada na pytanie: jaki? jaka? jakie?',done:false,correct:false};
 }
 function answerIsCorrect(t,value){
  if(t.type==='reading')return true;
  if(t.selfCheck)return false; // Never automatically approve arbitrary noun/adjective.
  if(t.type==='wordsearch')return false;
  if(t.type==='crossword')return false;
  if(t.type==='write'&&/spółgłoski|samogłoski/i.test(t.question))return lettersMatch(value,t.answer);
  if(t.acceptedAnswers?.length)return t.acceptedAnswers.some(a=>norm(a)===norm(value));
  return norm(value)===norm(t.answer);
 }
 function curriculumTasks(p){
  const text=String(p.text||'');const words=(text.match(/[A-Za-zĄĆĘŁŃÓŚŹŻąćęłńóśźż]{3,}/g)||[]);
  const unique=[...new Set(words.map(w=>w.toLocaleLowerCase('pl-PL')))];
  const result=[];const add=(type,question,answer,hint,extra={})=>result.push({type,question,answer:String(answer),options:[String(answer),'—','?','Nie wiem'],hint,explanation:'Sprawdź regułę i spróbuj jeszcze raz.',pageNumber:p.number,done:false,correct:false,...extra});
  if(subject()==='polski'){
   const w=unique.find(w=>w.length>=4&&w.length<=9&&/[aeiouyąęó]/i.test(w));
   if(w){const vowels=[...w].filter(c=>vowelsPL.includes(c)).join(', ');
   add('write','🔤 Wypisz samogłoski występujące w wyrazie „'+w+'” (w kolejności).',vowels,'Samogłoski to a, ą, e, ę, i, o, ó, u, y.');
   const consonants=[...w].filter(c=>!vowelsPL.includes(c)).join(', ');
   add('write','🔡 Wypisz spółgłoski z wyrazu „'+w+'” (w kolejności).',consonants,'Spółgłoski to pozostałe litery, także J.');}
   const syll=unique.find(w=>w.length>=4&&w.length<=9&&/[aeiouyąęó].*[aeiouyąęó]/i.test(w));
   // Liczba grup samogłosek nie zawsze odpowiada liczbie sylab. Nie oceniaj tego automatycznie.
   if(syll)add('syllables','👏 Podziel wyraz „'+syll+'” na sylaby. Wpisz je oddzielone myślnikiem.','', 'Wypowiedz słowo powoli i klaszcz przy każdej sylabie.',{selfCheck:true});
   if(unique.length>=3){const target=unique.find(w=>w.length>=4&&w.length<=8)||unique[0];add('wordsearch','🔎 Znajdź na planszy słowo „'+target+'”.',target,'Szukaj liter po kolei, poziomo.');}
   // Odpowiedzi otwarte wymagają sprawdzenia przez AI, nie automatycznej akceptacji.
   // Nie generuj pytania o przymiotnik bez zdania i sprawdzonej odpowiedzi.
  }else if(subject()==='matematyka'){
   const nums=(text.match(/\b\d{1,2}\b/g)||[]).map(Number).filter(n=>n<=50);const a=nums[0]??7,b=nums[1]??4;
   add('write','➕ Oblicz: '+a+' + '+b+' = ?',a+b,'Policz na palcach albo rozbij działanie na dziesiątki i jedności.');
   const hi=Math.max(a,b),lo=Math.min(a,b);add('write','➖ Oblicz: '+hi+' − '+lo+' = ?',hi-lo,'Pomyśl, ile brakuje od mniejszej liczby do większej.');
   add('write','🛒 W sklepie Avengersów są '+a+' jabłek i '+b+' gruszek. Ile owoców jest razem?',a+b,'Słowo „razem” sugeruje dodawanie.');
   add('write','🔐 W sejfie było '+hi+' monet. Zabrano '+lo+'. Ile zostało?',hi-lo,'Zabieranie oznacza odejmowanie.');
  }else{
   const w=unique.find(w=>/^[a-z]{3,9}$/i.test(w))||'cat';
   add('spelling','🇬🇧 Ułóż litery angielskiego słowa „'+w+'”.',w,'Wybieraj litery po kolei.');
   add('write','🇬🇧 Przepisz po angielsku wyraz „'+w+'”.',w,'Sprawdź litery w podręczniku.');
   add('listening','🎧 Posłuchaj angielskiego słowa i zapisz je.',w,'Możesz odsłuchać ponownie.',{audio:w});
  }
  return result;
 }
 async function start(){
  if(busy)return;
  const ps=scopePages();if(!ps.length){alert('Wybierz strony z rozpoznanym tekstem.');return setup()}
  busy=true;root.innerHTML='<section class="mg-panel"><h2>🦸 Tworzę przygodę ze stron podręcznika...</h2><p>Każda strona będzie osobnym etapem. Zapisane zadania będą wykorzystywane ponownie.</p></section>';
  try{
   const all=[];let errors=[];
   for(const p of ps.slice(0,12)){
    const saved=readBank().filter(x=>x.subject===subject()&&x.pageIds?.includes(String(p.number))&&x.task?.question);
    const chosen=shuffle(saved).filter(x=>!x.task?.selfCheck).slice(0,3).map(x=>({...x.task,_bankKey:x.key,pageNumber:p.number,done:false,correct:false}));
    let fresh=[];
    if(chosen.length<3){
     try{fresh=parse(await ask(pagePrompt(p))).map(t=>({...t,pageNumber:p.number}));storeTasks(fresh.map(t=>({...t,pageNumber:p.number})));}
     catch(e){errors.push('Strona '+p.number+': '+(e?.message||e))}
    }
    const local=curriculumTasks(p);
    const extras=[makeWordsearch(p),makeCrossword(p),makePuzzle(p),makeAdjective(p)].filter(Boolean);
    const pool=[...extras,...local,...fresh,...chosen.filter(x=>!fresh.some(y=>fingerprint(x)===fingerprint(y)))];
    if(mode==='game'&&Math.random()<0.45)all.push(makeReading(p));
    pool.forEach(t=>{t.sourceBookId=p.bookId;t.sourceTitle=sourceLabel(p)});
    all.push(...rotatePool(pool,p));
   }
   if(!all.length)throw Error(errors.join('; ')||'Brak zadań i brak odpowiedzi AI');
   tasks=all.map(t=>{const p=ps.find(p=>Number(p.number)===Number(t.pageNumber)&&(t.sourceBookId?p.bookId===t.sourceBookId:true));return {...t,sourceBookId:t.sourceBookId||p?.bookId||bookId,sourceTitle:t.sourceTitle||(p?sourceLabel(p):'Strona '+t.pageNumber)}});idx=0;points=0;award=false;hintLevel=0;wrongAttempts=0;reset();remember();draw();
  }catch(e){root.innerHTML=`<section class="mg-panel"><h2>⚠️ Nie udało się przygotować misji</h2><p>${escape(e.message)}</p>${btn('Spróbuj ponownie','start')}${btn('Wróć','back')}</section>`}
  finally{busy=false}
 }
 function reset(){choice=null;answered=false;tiles=[];hintLevel=0;wrongAttempts=0;tutorMessages=[]}
 const task=()=>tasks[idx];
 function answer(value){
  if(answered)return;
  const t=task();choice=String(value);
  t.correct=answerIsCorrect(t,choice);
  if(t.selfCheck){
   if(busy)return;
   busy=true;
   (async()=>{try{
    const prompt='Jesteś nauczycielem klasy drugiej. Oceń odpowiedź na podstawie polecenia i strony. Zwróć TYLKO JSON {"correct":true lub false,"feedback":"krótkie wyjaśnienie bez podawania rozwiązania"}. Nie zaliczaj pustych ani niepowiązanych odpowiedzi. Polecenie: '+t.question+'. Materiał: '+pageText(t).slice(0,1300)+'. Odpowiedź ucznia: '+choice;
    const raw=await ask(prompt);const text=String(raw).replace(/```(?:json)?/gi,'').replace(/```/g,'').trim();const obj=JSON.parse(text.slice(text.indexOf('{'),text.lastIndexOf('}')+1));
    if(typeof obj.correct!=='boolean'||typeof obj.feedback!=='string')throw Error('Niepełna ocena');
    if(obj.correct){t.correct=true;answered=true;t.done=true;points++;audioCue(true);sayFeedback('Dobra odpowiedź!');recordResult(t);remember()}
    else{wrongAttempts++;audioCue(false);if(wrongAttempts>=2)logDifficulty(t,'odpowiedź otwarta');tutorMessages.push({who:'ai',text:obj.feedback.slice(0,500)})}
   }catch(e){tutorMessages.push({who:'ai',text:'Nie mogę teraz sprawdzić odpowiedzi. Spróbuj jeszcze raz albo wybierz następne zadanie.'})}
   finally{busy=false;draw()}})();return;
  }
  if(!t.correct){wrongAttempts++;audioCue(false);if(wrongAttempts>=2)logDifficulty(t,'błędne próby');hintLevel=Math.min(3,hintLevel+1);draw();return}
  answered=true;t.done=true;points++;audioCue(true);sayFeedback('Brawo! Dobra odpowiedź.');recordResult(t);remember();draw();
 }
 function hintText(t){
  if(hintLevel===0)return '';
  if(hintLevel===1)return t.hint||'Wróć do fragmentu i poszukaj słów związanych z pytaniem.';
  if(hintLevel===2)return 'Spróbuj odrzucić odpowiedzi, które nie pasują do tekstu. Sprawdź, co dokładnie jest napisane na stronie.';
  return 'To ćwiczenie może być trudne. Zajrzyj ponownie do tekstu, a potem spróbuj jeszcze raz. Możesz poprosić dorosłego o wspólne przeczytanie fragmentu.';
 }
 function tutorContext(){
  const t=task();if(!t)return '';
  const p=pagesFor().find(p=>Number(p.number)===Number(t.pageNumber));
  const history=tutorMessages.slice(-8).map(m=>(m.who==='uczen'?'Uczeń: ':'Nauczyciel: ')+m.text).join('\n');
  return `Jesteś nauczycielem wspierającym ośmioletniego ucznia Pawła w Akademii Superbohaterów. Rozmawiasz po polsku, krótko, serdecznie i rzeczowo. Nie podawaj gotowej odpowiedzi, zanim uczeń sam nie spróbuje. Wyjaśniaj krok po kroku, wskaż dokładnie miejsce czytania i sposób wykonania zadania. Jeśli uczeń pyta o błąd, wyjaśnij przyczynę, nie oceniaj jego osoby. Nie mów, że widzisz ekran na żywo: znasz tylko podany kontekst. Nie wymyślaj treści spoza strony. Jeśli pytanie jest niezwiązane z ćwiczeniem, możesz normalnie odpowiedzieć odpowiednio do wieku. Mentor: ${document.querySelector('[data-mentor]')?.dataset.mentor||'superbohater'}. Przedmiot: ${subject()}. Strona: ${t.pageNumber||'nieznana'}. Typ ćwiczenia: ${t.type}. Polecenie: ${t.question}. Fragment do przeczytania: ${t.passage||p?.text?.slice(0,1800)||'brak'}. Poprawne rozwiązanie WYŁĄCZNIE DLA CIEBIE (nie zdradzaj): ${t.answer}. Ostatnia próba ucznia: ${choice||'brak'}. Historia rozmowy: ${history}. Odpowiedz na najnowszą wypowiedź ucznia.`;
 }
 function tutorPanel(){
  const messages=tutorMessages.slice(-6).map(m=>'<p class="mg-tutor-message"><strong>'+(m.who==='uczen'?'Paweł':'Nauczyciel AI')+':</strong> '+escape(m.text)+'</p>').join('');
  return '<section class="mg-tutor" style="margin-top:18px;padding:14px;border:2px solid #64748b;border-radius:16px"><h3>💬 Zapytaj nauczyciela AI '+btn('🔊','tutor-instruction')+'</h3><p>Naciśnij czerwony mikrofon z boku ekranu, żeby zapytać o zadanie. Możesz też napisać pytanie.</p><div aria-live="polite">'+messages+'</div><textarea id="mg-tutor-input" rows="2" placeholder="Wpisz pytanie do nauczyciela..."></textarea>'+btn(tutorBusy?'⏳ Odpowiadam...':'Wyślij pytanie','tutor-send','mg-primary')+'</section>';
 }
 async function tutorAsk(question){
  const q=String(question||'').trim();if(!q||tutorBusy)return;
  tutorMessages.push({who:'uczen',text:q});tutorBusy=true;draw();
  try{
   const prompt=tutorContext()+'\nNAJNOWSZE PYTANIE UCZNIA: '+q+'\nOdpowiedz zwykłym tekstem, bez JSON i bez znaków markdown. Maksymalnie 5 zdań.';
   let raw;try{raw=await ask(prompt)}catch(first){await new Promise(r=>setTimeout(r,750));raw=await ask(prompt)}
   let response=String(raw||'').replace(/\*\*|__|[`#]/g,'').trim();
   if(!response)throw Error('AI nie przesłało odpowiedzi');
   tutorMessages.push({who:'ai',text:response.slice(0,1600)});
   try{speak(response,subject()==='angielski'?'pl-PL':'pl-PL')}catch(e){}
  }catch(e){tutorMessages.push({who:'ai',text:'Nie mogę teraz odpowiedzieć: '+(e.message||'błąd połączenia')+'. Spróbuj ponownie.'})}
  finally{tutorBusy=false;draw()}
 }
 function tutorMic(){
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SR){tutorMessages.push({who:'ai',text:'Ta przeglądarka nie obsługuje mikrofonu. Wpisz pytanie w polu poniżej.'});draw();return}
  if(tutorListening)return;
  try{const rec=new SR();rec.lang='pl-PL';rec.interimResults=false;tutorListening=true;
   rec.onresult=e=>{const q=e.results[0][0].transcript;tutorListening=false;tutorAsk(q)};
   rec.onerror=e=>{tutorListening=false;tutorMessages.push({who:'ai',text:'Nie udało się rozpoznać głosu ('+e.error+'). Możesz napisać pytanie.'});draw()};
   rec.onend=()=>{tutorListening=false};rec.start();
   const box=root.querySelector('#mg-tutor-input');if(box)box.placeholder='🎤 Słucham pytania...';
  }catch(e){tutorListening=false;tutorMessages.push({who:'ai',text:'Mikrofon: '+e.message});draw()}
 }
 function stage(){
  const t=task();let html='<style>.mg-panel [data-mg]{transition:transform .13s ease,filter .13s ease,box-shadow .13s ease}.mg-panel [data-mg]:active{transform:scale(.94);filter:brightness(1.35)}.mg-panel [data-mg]:focus-visible{outline:3px solid #fbbf24;outline-offset:3px}.mg-panel input:focus,.mg-panel textarea:focus{outline:3px solid #fbbf24}.mg-panel .mg-feedback{animation:mg-pop .35s ease-out}@keyframes mg-pop{from{opacity:.2;transform:scale(.94)}to{opacity:1;transform:scale(1)}}</style><h3>'+escape(t.question)+'</h3>';
  if(!['reading','wordsearch','crossword','dictation','listening'].includes(t.type)){const excerpt=pageText(t).slice(0,550);if(excerpt)html+='<details class="mg-source" open><summary>📖 Fragment materiału: '+escape(t.sourceTitle||'')+'</summary><p>'+escape(excerpt)+'</p></details>'; }
  if(t.type==='reading'){
   html+='<div class="mg-reading-text">'+escape(t.passage||pageText(t))+'</div>';
   html+=btn('🎙️ Przeczytaj na głos','read-aloud','mg-primary')+btn('Przejdź dalej','read-done');
  }else if(t.type==='wordsearch'){
   if(!t.words?.length)t.words=wordPieces(pageText(t)).slice(0,3);
   if(!t.grid){const abc='AĄBCĆDEĘFGHIJKLŁMNŃOÓPRSŚTUWYZŹŻ';const g=Array.from({length:10},()=>Array.from({length:10},()=>abc[Math.floor(Math.random()*abc.length)]));t.placements=[];
    t.words.slice(0,4).forEach((w,i)=>{const row=i*2,col=Math.floor(Math.random()*Math.max(1,11-w.length));const letters=Array.from(w.toUpperCase());letters.forEach((v,j)=>g[row][col+j]=v);t.placements.push({word:w,row,col,found:false})});t.grid=g;t.picked=[];}
   html+='<p>Zaznaczaj kolejne litery każdego słowa. Znalezione słowa zaświecą się na zielono.</p><p><strong>Do znalezienia:</strong> '+t.placements.map(p=>p.found?'✅ '+escape(p.word):escape(p.word)).join(' • ')+'</p>';
   html+='<div class="mg-wordgrid" style="display:grid;grid-template-columns:repeat(10,minmax(0,1fr));gap:3px">'+t.grid.map((r,y)=>r.map((v,x)=>{const found=t.placements.some(p=>p.found&&p.row===y&&x>=p.col&&x<p.col+p.word.length);const selected=(t.picked||[]).some(z=>z[0]===y&&z[1]===x);return '<button type="button" data-mg="grid:'+y+':'+x+'" style="padding:5px 1px;min-width:0;background:'+(found?'#16803b':selected?'#64748b':'#394969')+';color:white;border-radius:6px">'+escape(v)+'</button>'}).join('')).join('')+'</div>';
  }else if(t.type==='crossword'&&t.crossWords?.length){
   html+='<p>Odgadnij słowa z czytanki. Kolorowe pole w każdym wierszu utworzy hasło końcowe.</p>';
   t.crossWords.forEach((entry,i)=>{const w=entry.word,text=pageText(t);const excerpt=(text.split(/(?<=[.!?])\s+/).find(x=>x.toLocaleLowerCase('pl-PL').includes(w))||text.slice(0,90)).replace(new RegExp(w,'gi'),'_____');html+='<label>Hasło '+(i+1)+': '+escape(excerpt)+' ('+w.length+' liter, kolorowe pole nr '+(entry.index+1)+')</label><input data-mg-cross="'+i+'" maxlength="'+w.length+'" autocomplete="off" placeholder="'+('□'.repeat(w.length))+'">'});
   html+='<p><strong>Plansza krzyżówki (wyrazy poziomo, hasło pionowo):</strong></p>';
   html+='<div role="table" aria-label="Krzyżówka" style="display:grid;grid-template-columns:repeat('+t.crossGrid[0].length+',minmax(0,1fr));gap:2px;margin:12px 0">'+t.crossGrid.map((row,y)=>row.map((cell,x)=>cell?'<span role="cell" style="border:1px solid #94a3b8;min-height:27px;text-align:center;border-radius:3px;background:'+(cell.cross?'#fbbf24':'#e2e8f0')+';color:#111827;font-weight:700">'+(cell.cross?'★':'□')+'</span>':'<span role="cell" aria-hidden="true"></span>').join('')).join('')+'</div>';
   html+='<label>Odczytane pionowe hasło końcowe:</label><input id="mg-cross-secret" autocomplete="off" placeholder="Wpisz hasło końcowe">';
   html+=btn('✓ Sprawdź krzyżówkę','cross-new','mg-primary');
  }else if(t.type==='order'||t.type==='spelling'){
   if(!t.chunks)t.chunks=shuffle(t.type==='order'?t.answer.split(/\s+/):Array.from(t.answer));
   html+='<div class="mg-built">'+escape(tiles.map(i=>t.chunks[i]).join(t.type==='order'?' ':'')||'Ułóż puzzle, dotykając kafelków')+'</div><div class="mg-choices">'+t.chunks.map((v,i)=>btn(escape(v),'tile:'+i,'mg-choice '+(tiles.includes(i)?'mg-tile-used':''))).join('')+'</div>'+btn('↩ Cofnij','undo')+btn('✓ Sprawdź','submit','mg-primary');
  }else if(['write','dictation','listening','syllables'].includes(t.type)){
   if(t.type==='dictation'||t.type==='listening')html+=btn('🔊 Posłuchaj','audio');
   if(/rzeczownik|przymiotnik/i.test(t.question))html+='<div class="mg-reading-text"><strong>Fragment podręcznika:</strong> '+escape(pageText(t).slice(0,550))+'</div>';
   html+='<input id="mg-written" autocomplete="off" placeholder="Wpisz odpowiedź">'+btn('✓ Sprawdź','written','mg-primary');
  }else if(t.type==='draw'){
   html+='<p>Rysunki zostawiamy na później.</p>'+btn('Pomiń','skip');
  }else if(t.type==='memory'){
   html+='<div class="mg-choices">'+(t.options||[]).map((v,i)=>btn(escape(v),'pick:'+i,'mg-choice')).join('')+'</div>';
  }else{
   html+='<div class="mg-choices">'+(t.options||[]).map((v,i)=>btn(escape(v),'pick:'+i,'mg-choice')).join('')+'</div>';
  }
  if(hintLevel&&!answered)html+='<div class="mg-feedback">💡 '+escape(hintText(t))+'</div>';
  if(!answered&&t.type!=='reading')html+=btn('Nie dam rady — następne zadanie','skip');
  if(answered)html+='<div class="mg-feedback">🌟 Dobra robota!</div>'+btn(idx===tasks.length-1?'🏆 Zakończ misję':'➡️ Następne zadanie','next','mg-primary');
  html+=tutorPanel();return html;
 }
 function draw(){
  if(idx>=tasks.length)return finish();
  const t=task();
  const names={safe:'🔐 Sejf Iron Mana',shop:'🛒 Sklep Avengersów',clock:'⏰ Zegar misji',detective:'🕵️ Detektyw Spider-Mana',loki:'🦹 Bitwa z Lokim',reading:'🎙️ Laboratorium czytania',order:'🧩 Szyfr Avengersów',dictation:'✍️ Dyktando Kapitana',syllables:'🔠 Sylaby i głoski',crossword:'📝 Krzyżówka',choice:'⚡ Zagadka bohatera',listening:'🎧 Misja słuchowa',memory:'🃏 Memory',spelling:'✍️ Pisownia'};
  root.innerHTML=`<section class="mg-panel"><header class="mg-header"><small>${mode==='test'?'🏆 PRÓBNY SPRAWDZIAN':'⚡ MISJA SPECJALNA'} · ${escape(t.sourceTitle||('STRONA '+(t.pageNumber||'?')))}</small>${btn('🔊 Odczytaj polecenie','read-instruction')}<h2>${t.type==='reading'?'📜 Tajny przekaz Avengersów':t.type==='loki'?'🦹 Pułapka Lokiego':t.type==='detective'?'🕵️ Detektyw Spider-Mana':t.type==='wordsearch'?'🔎 Wykreślanka':t.type==='draw'?'🎨 Misja rysunkowa':names[t.type]||'🎮 Misja bohatera'}</h2><p>Wyzwanie ${idx+1} z ${tasks.length}</p><div class="mg-bar"><div style="width:${Math.round(idx/tasks.length*100)}%"></div></div>${btn('⏸ Stop / zapisz','pause')}</header>${stage()}</section>`;
  const canvas=root.querySelector('#mg-draw');if(canvas){const ctx=canvas.getContext('2d');ctx.lineWidth=4;ctx.lineCap='round';let painting=false;const point=e=>{const r=canvas.getBoundingClientRect();return [(e.clientX-r.left)*canvas.width/r.width,(e.clientY-r.top)*canvas.height/r.height]};canvas.onpointerdown=e=>{painting=true;canvas.setPointerCapture(e.pointerId);ctx.beginPath();ctx.moveTo(...point(e))};canvas.onpointermove=e=>{if(painting){ctx.lineTo(...point(e));ctx.stroke()}};canvas.onpointerup=()=>painting=false;}
 }
 function finish(){
  if(award)return;
  award=true;
  const total=tasks.length;
  const pct=total?Math.round(points/total*100):0;
  const passed=mode==='test'&&pct>=70;
  const coins=mode==='test'?(passed?Math.max(5,Math.min(20,points*2)):Math.min(3,points)):Math.min(12,points);
  try{localStorage.removeItem(sessionKey())}catch(e){}
  try{localStorage.setItem(storeKey(),JSON.stringify({date:Date.now(),score:points,total,passed:mode==='test'?passed:null,coins,weak:tasks.filter(t=>!t.correct).map(t=>t.question)}))}catch(e){}
  if(coins>0)reward(coins);audioCue(passed||mode!=='test');sayFeedback(mode==='test'?(passed?'Gratulacje! Sprawdzian zaliczony. Zdobywasz '+coins+' złotych.':'To jeszcze nie koniec przygody. Poćwicz trudniejsze zadania i spróbuj ponownie. Zdobywasz '+coins+' złotych.'):'Misja ukończona! Zdobywasz '+coins+' złotych.');
  const summary=mode==='test'?(passed?'🏆 Sprawdzian zaliczony!':'🌱 Jeszcze trochę poćwiczymy. Spróbuj ponownie, kiedy będziesz gotowy.'):'🎉 Przygoda ukończona!';
  root.innerHTML='<section class="mg-panel mg-final"><h2>'+summary+'</h2><p>Wynik: <strong>'+points+' / '+total+'</strong> ('+pct+'%).</p><p>🪙 Zdobyte złote: <strong>'+coins+'</strong></p><p>'+(mode==='test'&&!passed?'Wróć do trudnych zadań i poćwicz. Dasz radę!':'Dobra robota!')+'</p>'+btn('🔄 Spróbuj ponownie','start','mg-primary')+btn('📋 Zobacz trudności','report')+btn('📚 Wybierz materiał','back')+'</section>';
 }
 root.addEventListener('click',ev=>{
  const b=ev.target.closest('[data-mg]');if(!b||busy)return;
  const act=b.dataset.mg,t=task();
  if(act==='tutor-instruction')return speak('Zapytaj nauczyciela AI. Naciśnij czerwony mikrofon z boku ekranu i powiedz, czego nie rozumiesz.','pl-PL');
  if(act==='read-instruction')return speak((mode==='test'?'Próbny sprawdzian':'Misja specjalna')+'. Strona '+(t?.pageNumber||'')+'. '+(t?.question||'')+(t?.type==='wordsearch'?' Zaznacz kolejno wszystkie litery każdego słowa.':''),'pl-PL');
  if(act==='skip'){logDifficulty(t,'uczeń poprosił o następne zadanie');sayFeedback('Nie szkodzi. Zapisuję to zadanie do powtórki. Przejdźmy dalej.');idx++;reset();remember();return draw()}
  if(act==='cross-new'){const v=[...root.querySelectorAll('[data-mg-cross]')].map(x=>x.value);if(v.every((x,i)=>lettersMatch(x,t.crossWords[i].word))&&lettersMatch(root.querySelector('#mg-cross-secret')?.value||'',t.answer)){t.correct=true;answered=true;t.done=true;points++;audioCue(true);sayFeedback('Krzyżówka rozwiązana! Hasło to '+t.answer+'.');remember();return draw()}wrongAttempts++;audioCue(false);logDifficulty(t,'krzyżówka: niepoprawne hasła');return}
  if(act==='read-aloud'){
   const SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SR){alert('Rozpoznawanie mowy nie jest dostępne w tej przeglądarce.');return}
   const r=new SR();r.lang='pl-PL';r.continuous=true;r.interimResults=false;let heard='';
   r.onresult=e=>{for(let i=e.resultIndex;i<e.results.length;i++)if(e.results[i].isFinal)heard+=' '+e.results[i][0].transcript};
   r.onend=()=>{const words=lettersOnly(t.passage||pageText(t)).length;if(!heard.trim()){alert('Nie udało się rozpoznać czytania. Spróbuj ponownie.');return}const source=(t.passage||pageText(t)).toLocaleLowerCase('pl-PL').split(/\s+/).map(lettersOnly).filter(Boolean),spoken=heard.toLocaleLowerCase('pl-PL').split(/\s+/).map(lettersOnly).filter(Boolean);const hits=spoken.filter(w=>source.includes(w)).length;const score=Math.round(100*hits/Math.max(1,spoken.length));alert('Rozpoznano: '+heard+'\nZgodność orientacyjna: '+score+'%. Możesz przeczytać ponownie lub przejść dalej.');};
   r.onerror=e=>alert('Mikrofon: '+e.error);r.start();return;
  }
  if(act.startsWith('grid:')){const [y,x]=act.slice(5).split(':').map(Number);const picked=t.picked||(t.picked=[]);const matched=t.placements.find(p=>!p.found&&p.row===y&&x===p.col+picked.length&&picked.every((z,i)=>z[0]===p.row&&z[1]===p.col+i));if(matched){picked.push([y,x]);audioCue(true);if(picked.length===matched.word.length){matched.found=true;t.picked=[];if(t.placements.every(p=>p.found)){answered=true;t.done=true;t.correct=true;points++;recordResult(t);remember()}}draw();return}t.picked=[];audioCue(false);draw();return}
  if(act==='tutor-send')return tutorAsk(root.querySelector('#mg-tutor-input')?.value||'');
  if(act==='tutor-mic')return tutorMic();
  if(act==='tutor-speak'){const last=[...tutorMessages].reverse().find(m=>m.who==='ai');if(last)return speak(last.text,'pl-PL');return}
  if(act==='report')return report();
  if(act==='guide')return voiceGuide();if(act==='start')return start();if(act==='resume')return resume();if(act==='back')return setup();
  if(act==='pause'){remember();root.innerHTML='<section class="mg-panel"><h2>⏸ Misja zatrzymana</h2><p>Postęp zapisany na tym urządzeniu.</p>'+btn('▶️ Wznów','resume','mg-primary')+btn('📚 Wróć do wyboru','back')+'</section>';return}
  if(act==='hint'){hintLevel=Math.min(3,hintLevel+1);return draw()}
  if(act==='read-done')return answer('Przeczytane');
  if(act==='draw-done'){answered=true;t.done=true;t.correct=true;points++;remember();return draw()}
  if(act==='clear-draw'){const c=root.querySelector('#mg-draw');c?.getContext('2d')?.clearRect(0,0,c.width,c.height);return}
  if(act==='next'){idx++;reset();remember();return draw()}
  if(act==='audio')return speak(t.audio||t.question,subject()==='angielski'?'en-US':'pl-PL');
  if(answered)return;
  if(act.startsWith('pick:'))return answer(t.options[Number(act.slice(5))]);
  if(act.startsWith('tile:')){const i=Number(act.slice(5));if(!tiles.includes(i)){tiles.push(i);draw()}return}
  if(act==='undo'){tiles.pop();return draw()}
  if(act==='submit')return answer(tiles.map(i=>t.chunks[i]).join(t.type==='order'?' ':''));
  if(act==='written'){const val=root.querySelector('#mg-written')?.value||'';if(t.selfCheck&&!val.trim())return;return answer(val)}
  if(act==='cross'){
   const words=t.options.map(s=>s.split('=')[0]);const vals=[...root.querySelectorAll('[data-mg-cross]')].map(x=>x.value);
   const correct=words.every((w,i)=>norm(w)===norm(vals[i]));t.answer=words.join(', ');
   return answer(correct?t.answer:'');
  }
  if(act.startsWith('flip:')){
   const i=Number(act.slice(5));if(t.matched.includes(i)||t.flipped.includes(i)||t.flipped.length>=2)return;
   t.flipped.push(i);draw();
   if(t.flipped.length===2){const [a,b]=t.flipped;
    if(t.cards[a].pair===t.cards[b].pair){t.matched.push(a,b);t.flipped=[];if(t.matched.length===t.cards.length){t.answer='Wszystkie pary';return answer('Wszystkie pary')}draw()}
    else{busy=true;setTimeout(()=>{t.flipped=[];busy=false;draw()},850)}
   }
  }
 });
 document.addEventListener('academy:tutor-question',ev=>{if(root.isConnected&&root.querySelector('.mg-tutor'))tutorAsk(ev.detail?.question||'')});
 setup();return {open:setup};
}
