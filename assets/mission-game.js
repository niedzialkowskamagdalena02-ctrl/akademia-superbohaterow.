// V53_TEST_FIXES_01
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
 let tutorMessages=[],tutorBusy=false,tutorListening=false,stageEpoch=0,readingRec=null;
 let bookId=initialBookId||'',scope='all',mode='game',tasks=[],idx=0,points=0,choice=null,answered=false,tiles=[],busy=false,award=false,progress={},hintLevel=0,paused=false,wrongAttempts=0;
 const book=()=>books.find(b=>b.id===bookId);
 const subject=()=>/ang|english/i.test(book()?.subject||'')?'angielski':/mat/i.test(book()?.subject||'')?'matematyka':'polski';
 const available=()=>books.filter(b=>pages.some(p=>p.bookId===b.id&&p.text?.trim()));
 const pagesFor=()=>pages.filter(p=>p.bookId===bookId&&p.text?.trim()).sort((a,b)=>a.number-b.number);
 const sourceBook=p=>books.find(b=>b.id===p.bookId);
 const sourceLabel=p=>{const b=sourceBook(p);return (b?.title||'Materiał bez tytułu')+' · strona '+p.number};
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
 function report(){stageEpoch++;tutorBusy=false;const v=stats();const rows=v.slice(-80).reverse();root.innerHTML='<section class="mg-panel"><h2>📋 Trudności i pominięte zadania</h2><p>Raport zapisany na tym urządzeniu. Pokazuje błędne próby i pominięcia w tej książce.</p>'+rows.map(x=>'<div class="mg-feedback"><strong>Strona '+escape(x.page)+'</strong> · '+escape(x.type)+'<p>'+escape(x.question)+'</p><small>'+escape(x.reason)+'</small></div>').join('')+btn('Wróć','back')+'</section>'}
 function setup(){
  stageEpoch++;tutorBusy=false;
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
 function resume(){try{const x=JSON.parse(localStorage.getItem(sessionKey())||'null');if(!x||!x.tasks?.length)return setup();scope=x.scope;mode=x.mode;tasks=x.tasks;tasks.forEach(t=>{t.readActive=false});idx=x.idx;points=x.points;award=x.award;paused=false;reset();draw()}catch{setup()}}
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
  const allowed=['choice','detective','loki','reading','order','dictation','syllables','crossword','listening','spelling','write','draw','wordsearch','safe','shop','clock','rebus'];
  const good=arr.filter(t=>t&&typeof t.question==='string'&&typeof t.answer==='string'&&Array.isArray(t.options)&&t.options.length===4&&t.options.every(x=>typeof x==='string'));
  if(!good.length)throw Error('AI nie przygotowało poprawnego zadania');
  return good.slice(0,5).map((t,i)=>({...t,explanation:t.explanation||'Sprawdź fragment w podręczniku.',hint:t.hint||'Przeczytaj uważnie jeszcze raz odpowiedni fragment.',type:allowed.includes(t.type)?t.type:'choice',done:false,correct:false}));
 }
 function makeReading(p){
  const passage=String(p.text||'').trim().slice(0,850);
  return {type:'reading',question:'📜 Tajny przekaz Avengersów. Przeczytaj fragment: '+sourceLabel(p)+':',passage,answer:'Przeczytane',options:['Przeczytane','Jeszcze czytam','Powtórz','Dalej'],explanation:'Teraz wykorzystaj przeczytany tekst w kolejnych zadaniach.',hint:'Czytaj spokojnie, zdanie po zdaniu.',pageNumber:p.number,sourceBookId:p.bookId,sourceTitle:sourceLabel(p),done:false,correct:false};
 }
 function pagePrompt(p,history=[]){
  const kinds=subject()==='matematyka'?'choice, safe, shop, clock, write, order':subject()==='angielski'?'listening, dictation, spelling, order, choice, write':'detective, loki, syllables, order, dictation, write, choice';
  const excluded=history.slice(-12).map((q,i)=>`${i+1}. ${String(q).slice(0,75)}`).join(' | ');
  const prompt=`Jestes dobrym nauczycielem 8-latka. Utworz 5 NOWYCH, bardzo roznorodnych i jednoznacznych zadan w jezyku polskim, dopasowanych do PRZEDMIOTU ${subject()}. Dla polskiego: gramatyka, sylaby, litery, ortografia, przymiotniki, rozumienie czytanki; ZADNYCH rachunkow. Dla matematyki: rachunki i logika liczbowa, bez gramatyki. Kazde zadanie powinno uzywac innych slow i innego fragmentu strony. Unikaj ciaglego 'drugiej'. Poziom klasy drugiej. Co najmniej dwa rozne pytania o tresc czytanki, jesli strona zawiera opowiadanie lub wiersz. Dla kazdego pytania o to, co jest w tekscie ustaw "needsSource":true. Dla sylab, gloskowania, liczenia, rebusow, ortografii slowa wskazanego w pytaniu ustaw "needsSource":false. Nie wolno zadac pytania, ktorego odpowiedz nie wynika ze strony, chyba ze to wiedza szkolna wyraznie znana dziecku. Typy: ${kinds}. Kazde pytanie: jedna pewna odpowiedz, 4 rozne opcje, wsrod nich doslownie odpowiedz w polu answer. Bez zdradzania odpowiedzi w pytaniu czy podpowiedzi. Zwroc tylko JSON, bez markdown, dokladnie wedlug schematu: {"tasks":[{"type":"choice","question":"...","answer":"...","options":["...","...","...","..."],"needsSource":true,"hint":"...","explanation":"..."}]}. NIE POWTARZAJ ostatnich zadan: ${excluded||'brak'}. STRONA ${p.number}, MATERIAL: ${String(p.text||'').slice(0,2400)}`;
  return prompt.slice(0,5300);
 }

 const vowelsPL='aąeęiouóy';
 const lettersOnly=x=>String(x||'').toLocaleLowerCase('pl-PL').replace(/[^a-ząćęłńóśźż]/g,'');
 const lettersMatch=(a,b)=>lettersOnly(a)===lettersOnly(b);
 const curriculumKey=()=>`academy-v53-stats-${child}-${bookId}`;
 function stats(){try{return JSON.parse(localStorage.getItem(curriculumKey())||'[]')}catch{return []}}
 function logDifficulty(t,reason){
  try{const v=stats();v.push({date:new Date().toISOString(),page:t.pageNumber||'',type:t.type,question:t.question,reason,attempts:wrongAttempts,subject:subject()});localStorage.setItem(curriculumKey(),JSON.stringify(v.slice(-400)))}catch(e){console.warn(e)}
 }
 function pageText(t){const p=pages.find(p=>p.bookId===(t.sourceBookId||bookId)&&Number(p.number)===Number(t.pageNumber));return String(p?.text||t.passage||'').slice(0,4000)}
  function party(){
  try{
   if(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)return;
   if(!document.getElementById('mg-v58-confetti-css')){
    const css=document.createElement('style');css.id='mg-v58-confetti-css';
    css.textContent='@keyframes mg-confetti-fall{0%{transform:translateY(-10vh) rotate(0deg);opacity:1}100%{transform:translateY(105vh) rotate(740deg);opacity:0}}';
    document.head.appendChild(css);
   }
   const colors=['#fbbf24','#00d6ff','#8b5cf6','#22c55e','#ff6b6b'];
   const wrap=document.createElement('div');wrap.setAttribute('aria-hidden','true');wrap.style.cssText='position:fixed;inset:0;pointer-events:none;z-index:99998;overflow:hidden';
   for(let i=0;i<32;i++){
    const el=document.createElement('span');const left=(i*37+Math.random()*17)%100;
    el.style.cssText='position:absolute;top:-7vh;left:'+left+'%;width:'+(6+i%5)+'px;height:'+(9+i%6)+'px;background:'+colors[i%colors.length]+';border-radius:2px;animation:mg-confetti-fall '+(1.3+Math.random()*1.1)+'s '+(Math.random()*.35)+'s linear forwards';
    wrap.appendChild(el);
   }
   document.body.appendChild(wrap);setTimeout(()=>wrap.remove(),3000);
  }catch(e){console.warn('Konfetti niedostępne',e)}
 }
 function celebrateReading(){
  party();
  try{const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;const c=new AC();
   [523,659,784,1047].forEach((f,i)=>{const osc=c.createOscillator(),gain=c.createGain();const st=c.currentTime+i*.13;
    osc.type='sine';osc.frequency.value=f;gain.gain.setValueAtTime(.0001,st);gain.gain.exponentialRampToValueAtTime(.06,st+.025);
    gain.gain.exponentialRampToValueAtTime(.0001,st+.2);osc.connect(gain);gain.connect(c.destination);
    osc.start(st);osc.stop(st+.22);});setTimeout(()=>c.close(),1300)
  }catch(e){console.warn('Fanfara niedostępna')}
 }
 function spokenWords(text){return (String(text||'').toLocaleLowerCase('pl-PL').match(/[a-ząćęłńóśźż]+/g)||[])}
 function readingCoverage(sourceText,spokenText){
  const reference=spokenWords(sourceText),spoken=spokenWords(spokenText);
  if(!reference.length||!spoken.length)return {score:0,hits:0,total:reference.length,heard:spoken.length};
  const previous=new Uint16Array(reference.length+1);
  let row=previous;
  for(const word of spoken){
   const next=new Uint16Array(reference.length+1);
   for(let j=1;j<=reference.length;j++)next[j]=word===reference[j-1]?row[j-1]+1:Math.max(row[j],next[j-1]);
   row=next;
  }
  const hits=row[reference.length];
  // Liczba wszystkich slow czytanki, nie tylko wypowiedzianych.
  const score=Math.min(100,Math.round(100*hits/Math.max(reference.length,spoken.length)));
  return {score,hits,total:reference.length,heard:spoken.length};
 }
 function sayFeedback(message){try{speak(String(message).replace(/[\*#_`]/g,''),'pl-PL')}catch(e){console.warn('Mowa niedostępna',e)}}
 function audioCue(ok){try{const C=window.AudioContext||window.webkitAudioContext;if(!C)return;const c=new C(),o=c.createOscillator(),g=c.createGain();o.type=ok?'sine':'triangle';o.frequency.setValueAtTime(ok?660:240,c.currentTime);if(ok)o.frequency.exponentialRampToValueAtTime(990,c.currentTime+.13);g.gain.setValueAtTime(.035,c.currentTime);g.gain.exponentialRampToValueAtTime(.001,c.currentTime+.19);o.connect(g);g.connect(c.destination);o.start();o.stop(c.currentTime+.2);o.onended=()=>c.close()}catch(e){}}
 function wordPieces(text){const stop=new Set(['drugiej','drugiego','drugi','druga','drugie','który','która','które','przez','oraz','jest','także','potem']);return [...new Set((String(text||'').match(/[A-Za-zĄĆĘŁŃÓŚŹŻąćęłńóśźż]{4,10}/g)||[]).map(x=>x.toLocaleLowerCase('pl-PL')))].filter(w=>w.length<=10&&!stop.has(w))}
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
  return selected.slice(0,5).sort((a,b)=>((a.type.charCodeAt(0)+n*17)%37)-((b.type.charCodeAt(0)+n*17)%37));
 }
 function makeWordsearch(p){
  const words=wordPieces(p.text).filter(w=>w.length>=4&&w.length<=8);
  if(words.length<3)return null;
  const offset=Math.floor(Math.random()*words.length);
  const chosen=[...words.slice(offset),...words.slice(0,offset)].slice(0,Math.min(4,words.length));
  return {type:'wordsearch',question:'🔎 Znajdź i zaznacz na planszy wszystkie słowa: '+chosen.join(', ')+'.',answer:chosen.join(', '),words:chosen,pageNumber:p.number,options:[],hint:'Dotykaj kolejnych liter słowa, od pierwszej do ostatniej.',done:false,correct:false};
 }
 function makeCrossword(p){
  // Krzyzowka oparta na przedmiocie. Dla polskiego: tylko jezyk, czytanie, pisanie.
  const polish=[
   ['rzeczownik','Która część mowy odpowiada na pytania: kto? co?'],
   ['czasownik','Która część mowy nazywa czynności, np. biegnie, pisze, śpi?'],
   ['przymiotnik','Która część mowy odpowiada na pytania: jaki? jaka? jakie?'],
   ['litera','Jak nazywa się pojedynczy znak alfabetu?'],
   ['wyraz','Jak inaczej nazywamy pojedyncze słowo zapisane literami?'],
   ['zdanie','Co zaczynamy wielką literą, a kończymy kropką lub innym znakiem końca?'],
   ['kropka','Jaki znak kończy zwykłe zdanie oznajmujące?'],
   ['przecinek','Jaki znak stawiamy między elementami wyliczenia, np. kot, pies, ryba?'],
   ['pytajnik','Jaki znak kończy zdanie pytające? Wpisz jego nazwę.'],
   ['sylaba','Jak nazywa się część wyrazu, którą można wyklaskać?'],
   ['samogłoska','Jak nazywa się głoska taka jak A, E, O lub U?'],
   ['spółgłoska','Jak nazywa się głoska taka jak B, K, M lub T?'],
   ['alfabet','Jak nazywa się uporządkowany zbiór liter?'],
   ['tytuł','Jak nazywa się nazwa książki albo opowiadania umieszczona na początku?'],
   ['autor','Jak nazywa się osoba, która napisała książkę?'],
   ['wiersz','Jak nazywa się utwór literacki zapisany zwykle w krótkich wersach?'],
   ['rym','Jak nazywa się podobne brzmienie zakończeń wyrazów w wierszu?'],
   ['bajka','Jak nazywa się krótkie opowiadanie, w którym zwierzęta często mówią jak ludzie i jest morał?'],
   ['baśń','Jak nazywa się opowieść, w której występują czary i magiczne postacie?'],
   ['akapit','Jak nazywa się część tekstu rozpoczynająca się od nowego wiersza, często z wcięciem?'],
   ['język','Jakim narządem w ustach poruszamy podczas mówienia?'],
   ['głoska','Jak nazywa się najmniejszy dźwięk mowy, który wymawiamy i słyszymy?'],
   ['książka','Co ma okładkę, strony i tekst do czytania?'],
   ['biblioteka','Gdzie można wypożyczać książki?'],
   ['pisownia','Jak nazywa się sposób zapisywania wyrazów literami?'],
   ['dyktando','Jak nazywa się ćwiczenie, w którym zapisujesz słowa czytane przez nauczyciela?'],
   ['litery','Z czego składają się zapisane wyrazy: z cyfr czy z ...?'],
   ['wielka','Jaką literą rozpoczynamy imię? Wpisz: małą czy wielką.'],
   ['mała','Jaką literą zwykle zapisujemy nazwy pospolite w środku zdania? Wpisz: małą czy wielką.'],
   ['kropki','Jak nazywamy znaki na końcu zdania oznajmującego? Wpisz liczbę mnogą.'],
   ['nazwa','Jak inaczej mówimy na określenie osoby, miejsca lub rzeczy?'],
   ['imię','Jak nazywa się osobiste słowo, którym zwracamy się do człowieka, np. Paweł?']
  ];
  const maths=[
   ['dodawanie','Jak nazywa się działanie oznaczone znakiem plus?'],
   ['odejmowanie','Jak nazywa się działanie oznaczone znakiem minus?'],
   ['suma','Jak nazywa się wynik dodawania?'],['różnica','Jak nazywa się wynik odejmowania?'],
   ['jeden','Zapisz słownie wynik: trzy minus dwa.'],['dwa','Zapisz słownie wynik: jeden plus jeden.'],
   ['trzy','Zapisz słownie wynik: jeden plus dwa.'],['cztery','Zapisz słownie wynik: dwa plus dwa.'],
   ['pięć','Zapisz słownie wynik: dwa plus trzy.'],['sześć','Zapisz słownie wynik: trzy plus trzy.'],
   ['siedem','Zapisz słownie wynik: cztery plus trzy.'],['osiem','Zapisz słownie wynik: cztery plus cztery.'],
   ['dziewięć','Zapisz słownie wynik: pięć plus cztery.'],['dziesięć','Zapisz słownie wynik: pięć plus pięć.'],
   ['zegar','Co pokazuje godziny i minuty?'],['minuta','Jaka jednostka czasu ma 60 sekund?'],
   ['godzina','Jaka jednostka czasu ma 60 minut?'],['metr','Jaka jednostka długości ma 100 centymetrów?'],
   ['kwadrat','Jaka figura ma cztery równe boki i cztery kąty proste?'],
   ['trójkąt','Jaka figura ma trzy boki?'],['koło','Jaka płaska figura jest okrągła i nie ma kątów?']
  ];
  const english=[
   ['cat','Jak po angielsku napisać KOT?'],['dog','Jak po angielsku napisać PIES?'],
   ['sun','Jak po angielsku napisać SŁOŃCE?'],['book','Jak po angielsku napisać KSIĄŻKA?'],
   ['fish','Jak po angielsku napisać RYBA?'],['bird','Jak po angielsku napisać PTAK?'],
   ['water','Jak po angielsku napisać WODA?'],['green','Jak po angielsku napisać ZIELONY?'],
   ['red','Jak po angielsku napisać CZERWONY?'],['blue','Jak po angielsku napisać NIEBIESKI?'],
   ['hello','Jak po angielsku napisać CZEŚĆ?'],['tree','Jak po angielsku napisać DRZEWO?'],
   ['apple','Jak po angielsku napisać JABŁKO?'],['milk','Jak po angielsku napisać MLEKO?'],
   ['one','Jak po angielsku napisać JEDEN?'],['two','Jak po angielsku napisać DWA?'],
   ['three','Jak po angielsku napisać TRZY?'],['four','Jak po angielsku napisać CZTERY?'],
   ['five','Jak po angielsku napisać PIĘĆ?'],['star','Jak po angielsku napisać GWIAZDA?']
  ];
  const knowledge=subject()==='matematyka'?maths:subject()==='angielski'?english:polish;
  // Sekrety bez gotowego rozwiazania na ekranie. Wyjasnienie dopiero po zaliczeniu.
  const secrets=[
   ['mjolnir','Mjolnir to młot Thora.'],
   ['wakanda','Wakanda to fikcyjna ojczyzna Czarnej Pantery.'],
   ['groot','Groot to bohater Strażników Galaktyki.'],
   ['stark','Tony Stark zbudował zbroję Iron Mana.'],
   ['tarcza','Tarcza jest znakiem rozpoznawczym Kapitana Ameryki.']
  ];
  // Angielski ma wlasne hasla, aby litery pasowaly do slow angielskich.
  const availableSecrets=subject()==='angielski'?[['stark','Tony Stark to Iron Man.'],['groot','Groot należy do Strażników Galaktyki.']]:secrets;
  const key=`academy-v58-cross-${child}-${bookId}-${subject()}`;
  let n=0;try{n=Number(localStorage.getItem(key)||0)}catch{}
  const sorted=[...availableSecrets.slice(n%availableSecrets.length),...availableSecrets.slice(0,n%availableSecrets.length)];
  for(const [secret,info] of sorted){
   const used=new Set(),entries=[];
   for(const [i,letter] of [...secret].entries()){
    const choices=knowledge.filter(([w])=>w.includes(letter)&&!used.has(w)).sort((a,b)=>a[0].length-b[0].length);
    if(!choices.length)break;
    const choice=choices[(n+i*3)%Math.min(choices.length,12)];
    used.add(choice[0]);entries.push({word:choice[0],index:choice[0].indexOf(letter),clue:choice[1]});
   }
   if(entries.length!==secret.length)continue;
   const left=Math.max(...entries.map(e=>e.index));
   const width=Math.max(...entries.map(e=>left-e.index+e.word.length));
   const grid=entries.map((e,row)=>Array.from({length:width},(_,col)=>{
    const at=col-(left-e.index);return at>=0&&at<e.word.length?{letter:e.word[at],cross:col===left,row,col}:null;
   }));
   try{localStorage.setItem(key,String(n+1))}catch{}
   return {type:'crossword',question:'📝 Krzyżówka wiedzy. Rozwiąż szkolne zagadki, wpisując litery w kratki. Odkryj tajne hasło Avengersów.',answer:secret,crossInfo:info,crossWords:entries,crossGrid:grid,crossColumn:left,crossTyped:entries.map(()=>''),pageNumber:p.number,options:[],done:false,correct:false};
  }
  return null;
 }
 function makeRebus(p){
  if(subject()!=='polski')return null;
  const examples=[
   {picture:'🦊',word:'LIS',operation:'🦊 (LIS) + T',answer:'LIST',tip:'Do nazwy zwierzęcia dopisz literę T.'},
   {picture:'🐈',word:'KOT',operation:'🐈 (KOT) − T + RA',answer:'KORA',tip:'Odejmij ostatnią literę, potem dodaj RA.'},
   {picture:'🌲',word:'LAS',operation:'🌲 (LAS) + KA',answer:'LASKA',tip:'Połącz dwa zapisy w jedno słowo.'},
   {picture:'🐮',word:'KROWA',operation:'🐮 (KROWA) − WA + K',answer:'KROK',tip:'Usuń końcówkę WA i dopisz K.'},
   {picture:'🐟',word:'RYBA',operation:'🐟 (RYBA) − BA + SUNEK',answer:'RYSUNEK',tip:'Usuń BA i dopisz SUNEK.'},
   {picture:'🐈',word:'KOT',operation:'MA + 🐈 (KOT) − OT',answer:'MAK',tip:'Od KOT odejmij OT, a pozostałą literę dopisz do MA.'}
  ];
  const key=`academy-v58-rebus-${child}-${bookId}`;
  let n=0;try{n=Number(localStorage.getItem(key)||0)}catch{}
  const ex=examples[n%examples.length];try{localStorage.setItem(key,String(n+1))}catch{}
  return {type:'rebus',question:'🧩 Rebus Avengersów: odgadnij wyraz.',rebus:ex.operation,answer:ex.answer.toLocaleLowerCase('pl-PL'),options:[ex.answer,'Nie wiem','Pominę','Podpowiedź'],hint:ex.tip,pageNumber:p.number,done:false,correct:false};
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
   const w=shuffle(unique.filter(w=>w.length>=4&&w.length<=9&&!['drugiej','drugiego','drugi','druga','drugie'].includes(w)&&/[aeiouyąęó]/i.test(w)))[0];
   if(w){const vowels=[...w].filter(c=>vowelsPL.includes(c)).join(', ');
   add('write','🔤 Wypisz samogłoski występujące w wyrazie „'+w+'” (w kolejności).',vowels,'Samogłoski to a, ą, e, ę, i, o, ó, u, y.');
   const consonants=[...w].filter(c=>!vowelsPL.includes(c)).join(', ');
   add('write','🔡 Wypisz spółgłoski z wyrazu „'+w+'” (w kolejności).',consonants,'Spółgłoski to pozostałe litery, także J.');}
   const syll=shuffle(unique.filter(w=>w.length>=4&&w.length<=9&&!['drugiej','drugiego','drugi','druga','drugie'].includes(w)&&/[aeiouyąęó].*[aeiouyąęó]/i.test(w)))[0];
   // Liczba grup samogłosek nie zawsze odpowiada liczbie sylab. Nie oceniaj tego automatycznie.
   if(syll)add('syllables','👏 Podziel wyraz „'+syll+'” na sylaby. Wpisz je oddzielone myślnikiem.','', 'Wypowiedz słowo powoli i klaszcz przy każdej sylabie.',{selfCheck:true});
   if(unique.length>=3){const target=shuffle(unique.filter(w=>w.length>=4&&w.length<=10&&!['drugiej','drugiego','drugi','druga','drugie'].includes(w)))[0]||unique[0];add('wordsearch','🔎 Znajdź na planszy słowo „'+target+'”.',target,'Szukaj liter po kolei, poziomo.');}
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
  stageEpoch++;tutorBusy=false;
  const ps=scopePages();if(!ps.length){alert('Wybierz strony z rozpoznanym tekstem.');return setup()}
  busy=true;root.innerHTML='<section class="mg-panel"><h2>🦸 Przygotowuję nowe wyzwania...</h2><p>AI tworzy świeże pytania, a rodzaje gier zmieniają się między misjami.</p></section>';
  try{
   const all=[],errors=[];
   for(const p of ps.slice(0,12)){
    const key=`academy-v58-variety-${child}-${bookId}-${p.number}-${mode}`;
    let hist={runs:0,questions:[],types:[]};
    try{const h=JSON.parse(localStorage.getItem(key)||'null');if(h&&typeof h==='object')hist={...hist,...h}}catch{}
    const bank=readBank().filter(x=>x.subject===subject()&&x.pageIds?.includes(String(p.number))&&x.task?.question);
    const excluded=[...hist.questions.slice(-45),...bank.slice(-16).map(x=>x.task.question)];
    let fresh=[];
    try{
     fresh=parse(await ask(pagePrompt(p,excluded))).map(t=>({...t,pageNumber:p.number,_fresh:true}));
     const recent=new Set(hist.questions.slice(-40).map(x=>norm(x)));
     fresh=fresh.filter(x=>!recent.has(norm(x.question)));
     if(fresh.length)storeTasks(fresh);
    }catch(e){errors.push('Strona '+p.number+': '+(e?.message||e))}
    const unused=bank.filter(x=>!hist.questions.slice(-40).some(q=>norm(q)===norm(x.task.question)));
    const old=shuffle(unused.length?unused:bank).map(x=>({...x.task,_bankKey:x.key,pageNumber:p.number,done:false,correct:false}));
    if(!fresh.length&&!old.length)throw Error('Nie udało się pobrać nowych zadań ani znaleźć starszych do powtórki');
    const extras=[makeCrossword(p),makeWordsearch(p),makePuzzle(p),makeAdjective(p),makeRebus(p)].filter(Boolean);
    // Rozklad gier zalezy od historii (a nie kolejności w tablicy).
    const extrasByType=[...new Map(extras.map(x=>[x.type,x])).values()];
    extrasByType.sort((a,b)=>{
     const ra=hist.types.slice(-6).lastIndexOf(a.type),rb=hist.types.slice(-6).lastIndexOf(b.type);
     return ra-rb || ['rebus','crossword','wordsearch','order','write'].indexOf(a.type)-['rebus','crossword','wordsearch','order','write'].indexOf(b.type);
    });
    const picked=[];const usedTypes=new Set();const add=t=>{
     if(t&&!picked.some(x=>fingerprint(x)===fingerprint(t))){picked.push(t);usedTypes.add(t.type);return true}
     return false;
    };
    // Minimum dwa typy: nowa wiedza z AI plus wybrana gra.
    const diverseFresh=shuffle(fresh).sort((a,b)=>Number(usedTypes.has(a.type))-Number(usedTypes.has(b.type)));
    for(const t of diverseFresh){if(picked.length>=3)break;if(!usedTypes.has(t.type))add(t)}
    for(const t of diverseFresh){if(picked.length>=3)break;add(t)}
    for(const t of extrasByType){if(picked.length>=5)break;if(!usedTypes.has(t.type))add(t)}
    // Czytanie co druga przygoda, NIE w sprawdzianie.
    if(mode==='game'&&hist.runs%2===0)add(makeReading(p));
    // Dawne pytanie tylko co dziesiata misje (lub awaryjnie przy braku AI).
    if(hist.runs%10===9||!fresh.length){for(const t of old){if(picked.length>=6)break;if(add(t))break}}
    for(const t of [...diverseFresh,...extrasByType,...old]){if(picked.length>=6)break;add(t)}
    picked.forEach(t=>{t.sourceBookId=p.bookId;t.sourceTitle=sourceLabel(p)});
    all.push(...picked);
    hist.runs=(Number(hist.runs)||0)+1;
    hist.questions=[...hist.questions,...picked.map(t=>t.question)].slice(-90);
    hist.types=[...hist.types,...picked.map(t=>t.type)].slice(-40);
    try{localStorage.setItem(key,JSON.stringify(hist))}catch{}
   }
   if(!all.length)throw Error(errors.join('; ')||'Nie udało się utworzyć misji');
   tasks=all.map(t=>({...t,sourceBookId:t.sourceBookId||bookId,sourceTitle:t.sourceTitle||'Strona '+t.pageNumber}));
   idx=0;points=0;award=false;reset();remember();draw();
  }catch(err){console.warn('Tworzenie misji:',err);if(root.isConnected)root.innerHTML='<section class="mg-panel"><h2>Nie udało się przygotować misji</h2><p>Spróbuj ponownie, kiedy AI będzie dostępne.</p>'+btn('Spróbuj ponownie','start')+btn('Wróć','back')+'</section>'}
  finally{busy=false}
 }
 function reset(){if(readingRec){try{readingRec.stop()}catch(e){}readingRec=null;}stageEpoch++;tutorBusy=false;choice=null;answered=false;tiles=[];hintLevel=0;wrongAttempts=0;tutorMessages=[]}
 const task=()=>tasks[idx];
 function answer(value){
  if(answered)return;
  const t=task();choice=String(value);
  t.correct=answerIsCorrect(t,choice);
  if(t.selfCheck){
   if(busy)return;
   busy=true;
   (async()=>{try{
    const prompt=(mode==='test'?'Nie podawaj odpowiedzi ani wskazówek do rozwiązania. ':'')+'Jesteś nauczycielem klasy drugiej. Oceń odpowiedź na podstawie polecenia i strony. Zwróć TYLKO JSON {"correct":true lub false,"feedback":"krótkie wyjaśnienie bez podawania rozwiązania"}. Nie zaliczaj pustych ani niepowiązanych odpowiedzi. Polecenie: '+t.question+'. Materiał: '+pageText(t).slice(0,1300)+'. Odpowiedź ucznia: '+choice;
    const raw=await ask(prompt);const text=String(raw).replace(/```(?:json)?/gi,'').replace(/```/g,'').trim();const obj=JSON.parse(text.slice(text.indexOf('{'),text.lastIndexOf('}')+1));
    if(typeof obj.correct!=='boolean'||typeof obj.feedback!=='string')throw Error('Niepełna ocena');
    if(obj.correct){t.correct=true;answered=true;t.done=true;points++;audioCue(true);sayFeedback('Dobra odpowiedź!');recordResult(t);remember()}
    else{wrongAttempts++;audioCue(false);if(wrongAttempts>=2)logDifficulty(t,'odpowiedź otwarta');tutorMessages.push({who:'ai',text:mode==='test'?'Ta odpowiedź nie została zaliczona. Spróbuj samodzielnie.':obj.feedback.slice(0,500)})}
   }catch(e){tutorMessages.push({who:'system',text:'🦸 Nie udało się teraz sprawdzić odpowiedzi. Spróbuj ponownie.'})}
   finally{busy=false;draw()}})();return;
  }
  if(!t.correct){if(/spółgłoski|samogłoski/i.test(t.question)){const a=Array.from(lettersOnly(t.answer)).sort().join(''),b=Array.from(lettersOnly(choice)).sort().join('');t.orderHint=!!a&&a===b;}wrongAttempts++;audioCue(false);if(wrongAttempts>=2)logDifficulty(t,'błędne próby');hintLevel=Math.min(3,hintLevel+1);draw();return}
  answered=true;t.done=true;points++;audioCue(true);sayFeedback('Brawo! Dobra odpowiedź.');recordResult(t);remember();draw();
 }
 function hintText(t){
  if(t.orderHint)return 'Litery są dobrane poprawnie, ale wpisz je kolejno, tak jak występują w podanym wyrazie. Przecinki i spacje nie są obowiązkowe.';
  if(mode==='test')return 'To sprawdzian. Przeczytaj polecenie uważnie i odpowiedz samodzielnie. Omówimy odpowiedzi po zakończeniu.';
  if(hintLevel===1)return t.hint||'Przeczytaj polecenie jeszcze raz.';
  if(hintLevel===2)return 'Spróbuj znaleźć potrzebne informacje w poleceniu albo w tekście, jeżeli zadanie dotyczy czytanki.';
  return 'Zastanów się spokojnie. Jeśli zadanie jest trudne, poproś nauczyciela o wskazówkę.';
 }
 function tutorContext(){
  const t=task();if(!t)return '';
  const p=pages.find(p=>p.bookId===(t.sourceBookId||bookId)&&Number(p.number)===Number(t.pageNumber));
  const crossword=t.type==='crossword'?(t.crossWords||[]).map((e,i)=>`${i+1}. PYTANIE: ${e.clue}. Wpis ucznia: ${t.crossTyped?.[i]||'(pusto)'}. Poprawna odpowiedz DLA MENTORA (nie mow jej od razu): ${e.word}`).join('\n'):'';
  const history=tutorMessages.slice(-6).map(m=>(m.who==='uczen'?'Uczen: ':'Nauczyciel: ')+m.text).join('\n');
  return `Uczysz osmiolatka polskiego, matematyki lub angielskiego w Akademii Superbohaterow. Tryb: ${mode==='test'?'SPRAWDZIAN bez podpowiedzi':'TRENING z wyjasnieniami'}. Aktualne zadanie (NIE INNE): ${t.question}. Typ: ${t.type}. Przedmiot: ${subject()}. Zestaw pytan krzyzowki: ${crossword||'nie dotyczy'}. Tekst strony: ${pageText(t).slice(0,1800)}. Ostatnia odpowiedz ucznia: ${choice||'brak'}. Historia: ${history}. JESLI pytanie jest o krzyzowke, odnies sie tylko do wypisanych tu pytan; NIE wymyslaj zadnych innych, nie zmieniaj tematu, nie zgaduj innych ksiazek. Nie mow, ze widzisz ekran, bo widzisz tylko ten kontekst. W treningu mozesz pomagac zrozumiec pytanie i naprowadzac zamiast podawac gotowe rozwiazanie. Nie obiecuj ze sprawdziles wpisane litery, jesli nie zostaly przekazane.`;
 }
 function tutorPanel(){
  const messages=tutorMessages.slice(-6).map(m=>'<p class="mg-tutor-message"><strong>'+(m.who==='uczen'?'Paweł':m.who==='system'?'Komunikat':'Nauczyciel AI')+':</strong> '+escape(m.text)+'</p>').join('');
  return '<section class="mg-tutor" style="margin-top:18px;padding:14px;border:2px solid #64748b;border-radius:16px"><h3>💬 Zapytaj nauczyciela AI '+btn('🔊','tutor-instruction')+'</h3><p>Naciśnij czerwony mikrofon z boku ekranu, żeby zapytać o zadanie. Możesz też napisać pytanie.</p><div aria-live="polite">'+messages+'</div><textarea id="mg-tutor-input" rows="2" placeholder="Wpisz pytanie do nauczyciela..."></textarea>'+btn(tutorBusy?'⏳ Odpowiadam...':'Wyślij pytanie','tutor-send','mg-primary')+'</section>';
 }
 async function tutorAsk(question){
  const q=String(question||'').trim();if(!q||tutorBusy)return;
  if(mode==='test'){const message=/kolej|przecin|spacj|jak wpisa|jak zaznacz/i.test(q)?'Wpisz litery w kolejności podanej w poleceniu. Możesz użyć spacji lub przecinków.':'To sprawdzian, więc nie mogę teraz podpowiadać odpowiedzi ani wyjaśniać materiału. Przeczytaj polecenie i spróbuj samodzielnie. Po sprawdzianie możemy wspólnie omówić zadania.';tutorMessages.push({who:'uczen',text:q},{who:'ai',text:message});draw();return;}
  const expectedEpoch=stageEpoch,expectedIndex=idx,expectedTask=task();
  const isCurrent=()=>root.isConnected&&stageEpoch===expectedEpoch&&idx===expectedIndex&&task()===expectedTask;
  tutorMessages.push({who:'uczen',text:q});tutorBusy=true;draw();
  try{
   const prompt=tutorContext()+'\nNAJNOWSZE PYTANIE UCZNIA: '+q+'\nOdpowiedz zwykłym tekstem, bez JSON i bez znaków markdown. Maksymalnie 5 zdań.';
   const raw=await ask(prompt);
   if(!isCurrent())return;
   const response=String(raw||'').replace(/\*\*|__|[`#]/g,'').trim();
   if(!response)throw Error('AI empty');
   tutorMessages.push({who:'ai',text:response.slice(0,1600)});
   try{speak(response,'pl-PL')}catch(e){}
  }catch(error){
   if(isCurrent()){console.warn('Tutor AI:',error);tutorMessages.push({who:'system',text:'🦸 Mentor chwilowo nie może odpowiedzieć. Spróbuj jeszcze raz za moment.'})}
  }finally{if(isCurrent()){tutorBusy=false;draw()}}
 }
 function tutorMic(){
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SR){tutorMessages.push({who:'system',text:'🎙️ Możesz wpisać pytanie w polu poniżej.'});draw();return}
  if(tutorListening)return;
  try{const rec=new SR();rec.lang='pl-PL';rec.interimResults=false;tutorListening=true;
   rec.onresult=e=>{const q=e.results[0][0].transcript;tutorListening=false;tutorAsk(q)};
   rec.onerror=()=>{tutorListening=false;tutorMessages.push({who:'system',text:'🎙️ Nie usłyszałem pytania. Możesz je napisać.'});draw()};
   rec.onend=()=>{tutorListening=false};rec.start();
   const box=root.querySelector('#mg-tutor-input');if(box)box.placeholder='🎤 Słucham pytania...';
  }catch(e){tutorListening=false;console.warn('Mikrofon misji:',e);tutorMessages.push({who:'system',text:'🎙️ Możesz wpisać pytanie.'});draw()}
 }
 function stage(){
  const t=task();let html='<style>.mg-panel [data-mg]{transition:transform .13s ease,filter .13s ease,box-shadow .13s ease}.mg-panel [data-mg]:active{transform:scale(.94);filter:brightness(1.35)}.mg-panel [data-mg]:focus-visible{outline:3px solid #fbbf24;outline-offset:3px}.mg-panel input:focus,.mg-panel textarea:focus{outline:3px solid #fbbf24}.mg-panel .mg-feedback{animation:mg-pop .35s ease-out}@keyframes mg-pop{from{opacity:.2;transform:scale(.94)}to{opacity:1;transform:scale(1)}}</style><h3>'+escape(t.question)+'</h3>';
  const q=String(t.question||'').toLocaleLowerCase('pl-PL');
  const storyHint=/(czytank|tekst|wiersz|opowiadani|bohater|autor|narrator|histori|według|na podstawie|co (?:się|robi|zrobił|zrobiła|zauważył|powiedział|woła|nawołuje)|kto (?:powiedział|woła|spotkał|zobaczył|zrobił)|dlaczego|w jaki sposób|co wydarzyło|o czym)/i.test(q);
  const noSource=['reading','wordsearch','crossword','rebus','syllables','dictation','listening','spelling','order'].includes(t.type)||/(sylab|głosk|samogłosk|spółgłosk|liter|alfabet|ortografi|wyraz[ieyu]? [„"'])/i.test(q);
  if(!noSource&&(t.needsSource===true||storyHint||t.type==='detective'||t.type==='loki')){
   const excerpt=pageText(t).slice(0,3800);
   if(excerpt)html+='<details class="mg-source" open><summary>📖 Tekst źródłowy — znajdź odpowiedź</summary><p style="max-height:330px;overflow:auto;white-space:pre-wrap">'+escape(excerpt)+'</p></details>';
  }

  if(t.type==='reading'){
   html+='<p>📖 Przeczytaj poniższy tekst na głos. Naciśnij mikrofon, czytaj spokojnie i możesz robić przerwy. Po zatrzymaniu pokażemy, jaka część <strong>całego tekstu</strong> została rozpoznana. Od 70% zadanie jest zaliczone.</p>';
   html+='<div class="mg-reading-text">'+escape(t.passage||pageText(t))+'</div>';
   html+=btn(t.readActive?'⏹ Zakończ ten fragment':'🎙️ '+(t.readTranscript?'Kontynuuj czytanie':'Rozpocznij czytanie'),t.readActive?'read-stop':'read-aloud','mg-primary');
   if(Number.isFinite(t.readScore))html+='<div class="mg-feedback" role="status"><strong>Rozpoznano '+(t.readHits||0)+' z '+(t.readTotal||0)+' słów — '+t.readScore+'%</strong><p>'+escape(t.readScore>=70?'🎉 Brawo, misja czytania zaliczona!':'🌱 Dobry początek! Możesz czytać dalej, nie tracąc zapisanego fragmentu.')+'</p><small>Rozpoznawanie mowy jest orientacyjne i może się mylić.</small></div>';
   if(t.readError)html+='<p role="status">🎙️ '+escape(t.readError)+'</p>';
   if(t.readTranscript&&!answered)html+=btn('↺ Zacznij od początku','read-reset');
  }else if(t.type==='wordsearch'){
   if(!t.words?.length)t.words=wordPieces(pageText(t)).slice(0,3);
   if(!t.grid){const abc='AĄBCĆDEĘFGHIJKLŁMNŃOÓPRSŚTUWYZŹŻ';const g=Array.from({length:10},()=>Array.from({length:10},()=>abc[Math.floor(Math.random()*abc.length)]));t.placements=[];
    t.words.slice(0,4).forEach((w,i)=>{const row=i*2,col=Math.floor(Math.random()*Math.max(1,11-w.length));const letters=Array.from(w.toUpperCase());letters.forEach((v,j)=>g[row][col+j]=v);t.placements.push({word:w,row,col,found:false})});t.grid=g;t.picked=[];}
   html+='<p>Zaznaczaj kolejne litery każdego słowa. Znalezione słowa zaświecą się na zielono.</p><p><strong>Do znalezienia:</strong> '+t.placements.map(p=>p.found?'✅ '+escape(p.word):escape(p.word)).join(' • ')+'</p>';
   html+='<div class="mg-wordgrid" style="display:grid;grid-template-columns:repeat(10,minmax(0,1fr));gap:3px">'+t.grid.map((r,y)=>r.map((v,x)=>{const found=t.placements.some(p=>p.found&&p.row===y&&x>=p.col&&x<p.col+p.word.length);const selected=(t.picked||[]).some(z=>z[0]===y&&z[1]===x);return '<button type="button" data-mg="grid:'+y+':'+x+'" style="padding:5px 1px;min-width:0;background:'+(found?'#16803b':selected?'#075cff':'#394969')+' !important;color:white;border-radius:6px;'+(selected&&!found?'box-shadow:inset 0 0 0 3px #dbeafe,0 0 12px #60a5fa;outline:2px solid #93c5fd;':'')+'">'+escape(v)+'</button>'}).join('')).join('')+'</div>';
  }else if(t.type==='crossword'&&t.crossWords?.length){
   if(!Array.isArray(t.crossTyped))t.crossTyped=t.crossWords.map(()=>'');
   html+='<p>Rozwiąż zagadki z przedmiotu <strong>'+escape(subject())+'</strong>. Wpisuj pojedyncze litery w kratki. Poprawna litera zmienia kratkę na niebieską, cały wyraz — na zielony. Żółta kolumna utworzy hasło Avengersów.</p>';
   const width=t.crossGrid[0]?.length||0;
   t.crossWords.forEach((entry,i)=>{
    html+='<div class="mg-cross-row" style="margin:17px 0"><div style="font-size:16px;margin-bottom:7px"><strong>'+(i+1)+'.</strong> '+escape(entry.clue||'Odgadnij wyraz')+'</div>';
    html+='<div style="overflow-x:auto;max-width:100%;padding:3px 0"><div style="display:grid;grid-template-columns:repeat('+width+',35px);gap:3px;width:max-content">';
    const correct=lettersMatch(t.crossTyped[i]||'',entry.word);
    html+=t.crossGrid[i].map((cell,col)=>{
     if(!cell)return '<span aria-hidden="true"></span>';
     const pos=col-(t.crossColumn-entry.index);
     const letter=Array.from(t.crossTyped[i]||'')[pos]||'';
     const match=letter&&lettersMatch(letter,cell.letter);
     const bg=correct?'#16803b':match?'#075cff':cell.cross?'#66500a':'#263550';
     return '<input data-mg-cell="'+i+':'+pos+'" maxlength="1" value="'+escape(letter)+'" aria-label="Hasło '+(i+1)+', litera '+(pos+1)+'" autocomplete="off" autocapitalize="characters" style="box-sizing:border-box;margin:0;width:35px;height:40px;padding:0;text-align:center;font-size:20px;font-weight:800;color:white;border:2px solid '+(cell.cross?'#facc15':'#8ca2c6')+';border-radius:5px;background:'+bg+' !important">';
    }).join('');
    html+='</div></div></div>';
   });
   html+='<p>Hasło pionowe: '+(t.crossWords.every((w,i)=>lettersMatch(t.crossTyped[i]||'',w.word))?'<strong>'+escape(t.answer.toUpperCase())+'</strong>':'<strong>odkryj po rozwiązaniu wszystkich słów</strong>')+'</p>';
   html+=btn('✓ Sprawdź krzyżówkę','cross-new','mg-primary')+'<p id="mg-cross-feedback" role="status"></p>';
  }else if(t.type==='order'||t.type==='spelling'){
   if(!t.chunks)t.chunks=shuffle(t.type==='order'?t.answer.split(/\s+/):Array.from(t.answer));
   html+='<div class="mg-built">'+escape(tiles.map(i=>t.chunks[i]).join(t.type==='order'?' ':'')||'Ułóż puzzle, dotykając kafelków')+'</div><div class="mg-choices">'+t.chunks.map((v,i)=>btn(escape(v),'tile:'+i,'mg-choice '+(tiles.includes(i)?'mg-tile-used':''))).join('')+'</div>'+btn('↩ Cofnij','undo')+btn('✓ Sprawdź','submit','mg-primary');
  }else if(['write','dictation','listening','syllables','rebus'].includes(t.type)){
   if(t.type==='dictation'||t.type==='listening')html+=btn('🔊 Posłuchaj','audio');
   if(t.type==='rebus')html+='<div style="font-size:clamp(23px,5vw,36px);margin:18px 0;padding:17px;background:#172954;border:2px solid #4467ac;border-radius:12px;text-align:center;font-weight:bold">'+escape(t.rebus)+'</div><p>Odejmij i dodaj litery tak, aby powstał wyraz. Wpisz go poniżej.</p>';
   // V58: Tekst źródłowy pokazuje tylko reguła needsSource.
   html+='<input id="mg-written" autocomplete="off" placeholder="Wpisz odpowiedź">'+btn('✓ Sprawdź','written','mg-primary');
  }else if(t.type==='draw'){
   html+='<p>Rysunki zostawiamy na później.</p>'+btn('Pomiń','skip');
  }else if(t.type==='memory'){
   html+='<div class="mg-choices">'+(t.options||[]).map((v,i)=>btn(escape(v),'pick:'+i,'mg-choice')).join('')+'</div>';
  }else{
   html+='<div class="mg-choices">'+(t.options||[]).map((v,i)=>btn(escape(v),'pick:'+i,'mg-choice')).join('')+'</div>';
  }
  if(hintLevel&&!answered)html+='<div class="mg-feedback">💡 '+escape(hintText(t))+'</div>';
  if(!answered)html+=btn('Pomiń bez zaliczenia — następne zadanie','skip');
  if(answered)html+='<div class="mg-feedback">🌟 '+escape(t.type==='crossword'?'Brawo! Tajne hasło: '+t.answer+'. '+(t.crossInfo||''):'Dobra robota!')+'</div>'+btn(idx===tasks.length-1?'🏆 Zakończ misję':'➡️ Następne zadanie','next','mg-primary');
  html+=tutorPanel();return html;
 }
 function draw(){
  if(idx>=tasks.length)return finish();
  const t=task();
  const names={safe:'🔐 Sejf Iron Mana',shop:'🛒 Sklep Avengersów',clock:'⏰ Zegar misji',detective:'🕵️ Detektyw Spider-Mana',loki:'🦹 Bitwa z Lokim',reading:'🎙️ Laboratorium czytania',order:'🧩 Szyfr Avengersów',dictation:'✍️ Dyktando Kapitana',syllables:'🔠 Sylaby i głoski',crossword:'📝 Krzyżówka',choice:'⚡ Zagadka bohatera',listening:'🎧 Misja słuchowa',memory:'🃏 Memory',spelling:'✍️ Pisownia',rebus:'🧩 Rebus Avengersów'};
  root.innerHTML=`<section class="mg-panel"><header class="mg-header"><small>${mode==='test'?'🏆 PRÓBNY SPRAWDZIAN':'⚡ MISJA SPECJALNA'} · ${escape(t.sourceTitle||('STRONA '+(t.pageNumber||'?')))}</small>${btn('🔊 Odczytaj polecenie','read-instruction')}<h2>${t.type==='reading'?'📜 Tajny przekaz Avengersów':t.type==='loki'?'🦹 Pułapka Lokiego':t.type==='detective'?'🕵️ Detektyw Spider-Mana':t.type==='wordsearch'?'🔎 Wykreślanka':t.type==='draw'?'🎨 Misja rysunkowa':names[t.type]||'🎮 Misja bohatera'}</h2><p>Wyzwanie ${idx+1} z ${tasks.length}</p><div class="mg-bar"><div style="width:${Math.round(idx/tasks.length*100)}%"></div></div>${btn('⏸ Stop / zapisz','pause')}</header>${stage()}</section>`;
  const canvas=root.querySelector('#mg-draw');if(canvas){const ctx=canvas.getContext('2d');ctx.lineWidth=4;ctx.lineCap='round';let painting=false;const point=e=>{const r=canvas.getBoundingClientRect();return [(e.clientX-r.left)*canvas.width/r.width,(e.clientY-r.top)*canvas.height/r.height]};canvas.onpointerdown=e=>{painting=true;canvas.setPointerCapture(e.pointerId);ctx.beginPath();ctx.moveTo(...point(e))};canvas.onpointermove=e=>{if(painting){ctx.lineTo(...point(e));ctx.stroke()}};canvas.onpointerup=()=>painting=false;}
 }
 function finish(){
  if(award)return;
  stageEpoch++;tutorBusy=false;
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
 function crossStatus(t){
  if(!t||t.type!=='crossword')return false;
  return t.crossWords.every((e,i)=>lettersMatch(t.crossTyped[i]||'',e.word));
 }
 function crossDone(t){
  if(answered||!crossStatus(t))return;
  t.correct=true;t.done=true;answered=true;points++;recordResult(t);
  audioCue(true);party();sayFeedback('Brawo! Odkryte hasło: '+t.answer+'. '+(t.crossInfo||''));remember();draw();
 }
 root.addEventListener('input',ev=>{
  const el=ev.target.closest?.('[data-mg-cell]');if(!el||answered)return;
  const t=task();if(!t||t.type!=='crossword')return;
  const [row,col]=el.dataset.mgCell.split(':').map(Number);
  const entry=t.crossWords?.[row];if(!entry||col<0||col>=entry.word.length)return;
  const ch=lettersOnly(el.value).slice(-1).toUpperCase();el.value=ch;
  const arr=Array.from(String(t.crossTyped?.[row]||'').padEnd(entry.word.length,' '));
  arr[col]=ch||' ';t.crossTyped[row]=arr.join('').trimEnd();
  const complete=lettersMatch(t.crossTyped[row],entry.word);
  root.querySelectorAll('[data-mg-cell]').forEach(cell=>{
   const [r,p]=cell.dataset.mgCell.split(':').map(Number);
   if(r!==row)return;
   const w=t.crossWords[r];const letter=Array.from(t.crossTyped[r]||'')[p]||'';
   const good=letter&&lettersMatch(letter,Array.from(w.word)[p]);
   cell.style.setProperty('background',complete?'#16803b':good?'#075cff':'#263550','important');
  });
  remember();
  if(crossStatus(t)){crossDone(t);return}
  if(ch){
   const next=root.querySelector('[data-mg-cell="'+row+':'+(col+1)+'"]');
   if(next)next.focus();
  }
 });
 root.addEventListener('keydown',ev=>{
  const el=ev.target.closest?.('[data-mg-cell]');if(!el||ev.key!=='Backspace'||el.value)return;
  const [row,col]=el.dataset.mgCell.split(':').map(Number);const prev=root.querySelector('[data-mg-cell="'+row+':'+(col-1)+'"]');if(prev)prev.focus();
 });
 root.addEventListener('click',ev=>{
  const b=ev.target.closest('[data-mg]');if(!b||busy)return;
  const act=b.dataset.mg,t=task();
  if(act==='tutor-instruction')return speak('Zapytaj nauczyciela AI. Naciśnij czerwony mikrofon z boku ekranu i powiedz, czego nie rozumiesz.','pl-PL');
  if(act==='read-instruction')return speak((mode==='test'?'Sprawdzian':'Misja')+'. '+(t?.type==='reading'?'Przeczytaj na głos cały tekst poniżej. Naciśnij rozpocznij czytanie. Kiedy będziesz potrzebował przerwy, naciśnij zakończ fragment. Możesz później kontynuować.':t?.question||'')+(t?.type==='wordsearch'?' Wybieraj litery kolejno.':''),'pl-PL');
  if(act==='skip'){logDifficulty(t,'uczeń poprosił o następne zadanie');sayFeedback('Nie szkodzi. Zapisuję to zadanie do powtórki. Przejdźmy dalej.');idx++;reset();remember();return draw()}
  if(act==='cross-new'){if(crossStatus(t))return crossDone(t);wrongAttempts++;audioCue(false);const box=root.querySelector('#mg-cross-feedback');if(box)box.textContent='Nie wszystkie wyrazy są jeszcze poprawne. Wpisane litery pozostają w kratkach.';return}
  if(act==='read-aloud'){
   const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
   if(!SR){t.readError='Ta przeglądarka nie obsługuje rozpoznawania czytania na głos.';draw();return}
   if(readingRec)return;
   const r=new SR();r.lang='pl-PL';r.continuous=true;r.interimResults=false;
   const currentTask=t,readEpoch=stageEpoch,readIdx=idx;
   readingRec=r;t.readActive=true;t.readError='';
   const measure=()=>{
    const c=readingCoverage(t.passage||pageText(t),t.readTranscript||'');
    t.readScore=c.score;t.readHits=c.hits;t.readTotal=c.total;t.readHeard=c.heard;
    if(c.score>=70&&!t.correct&&task()===currentTask&&idx===readIdx&&stageEpoch===readEpoch){t.correct=true;t.done=true;answered=true;points++;recordResult(t);celebrateReading();sayFeedback('Wspaniale! Czytanie zaliczone!');}
    else if(c.score<70&&c.heard>0)sayFeedback('Dobry początek. Możesz odpocząć i przeczytać dalszy fragment, kiedy będziesz gotowy.');
    remember();
   };
   r.onresult=e=>{
    for(let i=e.resultIndex;i<e.results.length;i++)if(e.results[i].isFinal)t.readTranscript=(String(t.readTranscript||'')+' '+e.results[i][0].transcript).trim();
    // Zapis natychmiast, także przed pauzą aplikacji.
    measure();
   };
   r.onerror=e=>{
    const kind=String(e.error||'');
    if(kind==='not-allowed'||kind==='service-not-allowed')t.readError='Zezwól przeglądarce na używanie mikrofonu.';
    else if(kind!=='no-speech'&&kind!=='aborted')t.readError='Mikrofon zakończył rozpoznawanie ('+kind+'). Zapisany tekst nie znika; możesz spróbować ponownie.';
   };
   r.onend=()=>{
    if(readingRec===r)readingRec=null;t.readActive=false;
    measure();
    if(root.isConnected&&task()===currentTask&&stageEpoch===readEpoch)draw();
   };
   try{r.start();draw()}catch(e){readingRec=null;t.readActive=false;t.readError='Nie udało się uruchomić mikrofonu. Spróbuj ponownie.';draw()}
   return;
  }
  if(act==='read-stop'){
   if(readingRec){try{readingRec.stop()}catch(e){console.warn('Stop mikrofonu',e)}}
   return;
  }
  if(act.startsWith('grid:')){
   const [y,x]=act.slice(5).split(':').map(Number);
   const available=t.placements.filter(p=>!p.found);
   let picked=t.picked||(t.picked=[]);
   const next=[...picked,[y,x]];
   let matches=available.filter(p=>next.every((z,i)=>z[0]===p.row&&z[1]===p.col+i));
   if(!matches.length){picked=[];matches=available.filter(p=>p.row===y&&p.col===x);if(matches.length)picked=[[y,x]];audioCue(matches.length>0);}
   else{picked=next;audioCue(true)}
   t.picked=picked;
   const completed=matches.find(p=>picked.length===Array.from(p.word).length);
   if(completed){completed.found=true;t.picked=[];if(t.placements.every(p=>p.found)){answered=true;t.done=true;t.correct=true;points++;recordResult(t);remember();sayFeedback('Wszystkie słowa odnalezione! Świetna robota!')}}
   draw();return;
  }
  if(act==='tutor-send')return tutorAsk(root.querySelector('#mg-tutor-input')?.value||'');
  if(act==='tutor-mic')return tutorMic();
  if(act==='tutor-speak'){const last=[...tutorMessages].reverse().find(m=>m.who==='ai');if(last)return speak(last.text,'pl-PL');return}
  if(act==='report')return report();
  if(act==='guide')return voiceGuide();if(act==='start')return start();if(act==='resume')return resume();if(act==='back')return setup();
  if(act==='pause'){if(readingRec){try{readingRec.stop()}catch(e){}}if(t&&t.type==='reading')t.readActive=false;stageEpoch++;tutorBusy=false;remember();root.innerHTML='<section class="mg-panel"><h2>⏸ Misja zatrzymana</h2><p>Postęp zapisany na tym urządzeniu.</p>'+btn('▶️ Wznów','resume','mg-primary')+btn('📚 Wróć do wyboru','back')+'</section>';return}
  if(act==='hint'){hintLevel=Math.min(3,hintLevel+1);return draw()}
  if(act==='read-reset'){t.readTranscript='';t.readError='';delete t.readScore;delete t.readHits;delete t.readTotal;delete t.readHeard;remember();draw();return;}
  if(act==='read-done')return; // nadal bez zaliczenia przez kliknięcie
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
