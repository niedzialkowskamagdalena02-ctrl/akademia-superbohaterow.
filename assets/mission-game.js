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
 const material=()=>scopePages().map(p=>`STRONA ${p.number}${p.chapter?' | DZIAŁ '+p.chapter:''}: ${p.text}`).join('\n').slice(0,15000);
 const themes={polski:['🕵️ Detektyw Spider-Mana','🦹 Pułapka Lokiego','🎙️ Laboratorium czytania','🧩 Szyfr Avengersów','✍️ Dyktando Kapitana','🔠 Sylaby i głoski','📝 Krzyżówka'],matematyka:['🔐 Sejf Iron Mana','🛒 Sklep Avengersów','⏰ Zegar misji','📐 Geometria','🧮 Działania','🧠 Logiczne zagadki'],angielski:['🎧 Słuchanie','🎙️ Wymowa','🃏 Memory','🧩 Rozsypanki','✍️ Pisownia','🦹 Pułapka Lokiego','🗣️ Dialogi']};
 const plan={polski:['detective','loki','reading','order','dictation','syllables','crossword','choice'],matematyka:['safe','shop','clock','choice','safe','order','choice','shop'],angielski:['listening','memory','order','spelling','loki','reading','choice','listening']};
 const storeKey=()=>`academy-v41-${child}-${bookId}-${scope}`;

 function chapterOf(p){return String(p.chapter||'').trim()}
 function chapters(){return [...new Set(pagesFor().map(chapterOf).filter(Boolean))]}
 function scopePages(){
  const ps=pagesFor();if(scope==='all')return ps;
  if(scope.startsWith('chapter:'))return ps.filter(p=>chapterOf(p)===scope.slice(8));
  if(scope.startsWith('pages:')){
   const nums=new Set();scope.slice(6).split(/[,;\s]+/).forEach(x=>{
    const m=x.match(/^(\d+)-(\d+)$/);
    if(m){const lo=+m[1],hi=+m[2];if(Math.abs(lo-hi)<=100)for(let n=Math.min(lo,hi);n<=Math.max(lo,hi);n++)nums.add(n)}
    else if(/^\d+$/.test(x))nums.add(+x);
   });return ps.filter(p=>nums.has(+p.number));
  }return [];
 }
 function voiceGuide(){speak('Witaj w Akademii Superbohaterów! Wybierz podręcznik. Następnie wybierz całą książkę, jeden dział albo konkretne strony. Na końcu wybierz przygodę lub sprawdzian i rozpocznij misję!','pl-PL')}
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
  +'<h3>🎯 Rodzaj misji</h3><div class="mg-v42-grid">'+[['game','🎮','Przygoda'],['test','🏆','Sprawdzian']].map(x=>'<button type="button" data-mg-mode="'+x[0]+'" class="mg-v42-card '+(mode===x[0]?'active':'')+'"><span>'+x[1]+'</span><strong>'+x[2]+'</strong></button>').join('')+'</div>'
  +btn('⚡ ROZPOCZNIJ MISJĘ','start','mg-primary')+ (localStorage.getItem(sessionKey())?btn('▶️ Wznów ostatnią misję','resume','mg-primary'):'')+'<p class="mg-hint">Każda strona to osobny etap przygody. Możesz zatrzymać misję i wrócić później.</p></section>';
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
  return {type:'reading',question:'📜 Tajny przekaz Avengersów. Przeczytaj fragment strony '+p.number+':',passage,answer:'Przeczytane',options:['Przeczytane','Jeszcze czytam','Powtórz','Dalej'],explanation:'Teraz wykorzystaj przeczytany tekst w kolejnych zadaniach.',hint:'Czytaj spokojnie, zdanie po zdaniu.',pageNumber:p.number,done:false,correct:false};
 }
 function pagePrompt(p){
  const kinds=subject()==='matematyka'?'choice, safe, shop, clock, write, order, draw':subject()==='angielski'?'listening, dictation, spelling, order, choice, write, wordsearch':'detective, loki, syllables, order, dictation, crossword, wordsearch, write, choice, draw';
  return `Jesteś cierpliwym nauczycielem 8-letniego ucznia. Twórz interaktywne misje na podstawie JEDNEJ strony podręcznika. Zwróć TYLKO JSON, bez markdown: {"tasks":[{"type":"detective","question":"krótkie pytanie","answer":"poprawna odpowiedź","options":["odpowiedź 1","odpowiedź 2","odpowiedź 3","odpowiedź 4"],"hint":"wskazówka BEZ ujawniania odpowiedzi","explanation":"łagodne wyjaśnienie błędu bez zdradzania odpowiedzi przed kolejną próbą","audio":""}]}. Dokładnie 3 RÓŻNE zadania, każdy inny typ spośród: ${kinds}. Dla loki zapytaj, które zdanie jest fałszywe. Dla syllables odpowiedź to liczba sylab jednego słowa ze strony. Dla wordsearch odpowiedź to pojedyncze słowo ze strony, 3-9 liter. Dla order odpowiedź to zdanie 3-7 wyrazów. Dla dictation audio i answer to jedno słowo. Dla draw question opisuje, co narysować, a answer to krótka nazwa rysunku. Dla crossword odpowiedź to słowo 3-9 liter, options to cztery możliwe odpowiedzi, NIE hasła z definicjami. Dla write odpowiedź to krótkie słowo lub zdanie. Dla każdej zagadki daj cztery różne options, jedna z nich musi być dokładnie równa answer. NIE podawaj odpowiedzi w question, hint ani explanation. Unikaj niejednoznaczności. STRONA ${p.number}, PRZEDMIOT ${subject()}: ${String(p.text||'').slice(0,1450)}`;
 }

 function curriculumTasks(p){
  const text=String(p.text||'');const words=(text.match(/[A-Za-zĄĆĘŁŃÓŚŹŻąćęłńóśźż]{3,}/g)||[]);
  const unique=[...new Set(words.map(w=>w.toLocaleLowerCase('pl-PL')))];
  const result=[];const add=(type,question,answer,hint,extra={})=>result.push({type,question,answer:String(answer),options:[String(answer),'—','?','Nie wiem'],hint,explanation:'Sprawdź regułę i spróbuj jeszcze raz.',pageNumber:p.number,done:false,correct:false,...extra});
  if(subject()==='polski'){
   const w=unique.find(w=>w.length>=4&&w.length<=9&&/[aeiouyąęó]/i.test(w))||'mama';
   const vowels=[...w].filter(c=>'aąeęiouóy'.includes(c)).join(', ');
   add('write','🔤 Wypisz samogłoski występujące w wyrazie „'+w+'” (w kolejności).',vowels,'Samogłoski to a, ą, e, ę, i, o, ó, u, y.');
   const consonants=[...w].filter(c=>!('aąeęiouóy'.includes(c))).join(', ');
   add('write','🔡 Wypisz spółgłoski z wyrazu „'+w+'” (w kolejności).',consonants,'Spółgłoski to pozostałe litery.');
   const syll=unique.find(w=>w.length>=4&&w.length<=9&&/[aeiouyąęó].*[aeiouyąęó]/i.test(w))||w;
   add('syllables','👏 Ile sylab słyszysz w wyrazie „'+syll+'”? Wpisz liczbę.',(syll.match(/[aąeęiouóy]+/g)||[]).length,'Wypowiedz wyraz powoli i klaszcz przy każdej sylabie.');
   if(unique.length>=3){const target=unique.find(w=>w.length>=4&&w.length<=8)||unique[0];add('wordsearch','🔎 Znajdź na planszy słowo „'+target+'”.',target,'Szukaj liter po kolei, poziomo.');}
   add('write','✍️ Napisz rzeczownik, który nazywa osobę, zwierzę lub rzecz z czytanki.','', 'Rzeczownik odpowiada na pytania: kto? co?',{selfCheck:true});
   add('write','🎨 Znajdź w tekście przymiotnik albo dopisz pasujący do wybranego rzeczownika.','', 'Przymiotnik odpowiada na pytania: jaki? jaka? jakie?',{selfCheck:true});
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
    const chosen=shuffle(saved).slice(0,3).map(x=>({...x.task,_bankKey:x.key,pageNumber:p.number,done:false,correct:false}));
    let fresh=[];
    if(chosen.length<3){
     try{fresh=parse(await ask(pagePrompt(p))).map(t=>({...t,pageNumber:p.number}));storeTasks(fresh.map(t=>({...t,pageNumber:p.number})));}
     catch(e){errors.push('Strona '+p.number+': '+(e?.message||e))}
    }
    const local=curriculumTasks(p);
    const pool=[...local,...fresh,...chosen.filter(x=>!fresh.some(y=>fingerprint(x)===fingerprint(y)))];
    if(mode==='game')all.push(makeReading(p));
    const localExercises=pool.filter(t=>t.selfCheck||['syllables','wordsearch','spelling','listening'].includes(t.type));
    const others=pool.filter(t=>!localExercises.includes(t));
    all.push(...shuffle(localExercises).slice(0,2),...shuffle(others).slice(0,2));
   }
   if(!all.length)throw Error(errors.join('; ')||'Brak zadań i brak odpowiedzi AI');
   tasks=all;idx=0;points=0;award=false;hintLevel=0;wrongAttempts=0;reset();remember();draw();
  }catch(e){root.innerHTML=`<section class="mg-panel"><h2>⚠️ Nie udało się przygotować misji</h2><p>${escape(e.message)}</p>${btn('Spróbuj ponownie','start')}${btn('Wróć','back')}</section>`}
  finally{busy=false}
 }
 function reset(){choice=null;answered=false;tiles=[];hintLevel=0;wrongAttempts=0;tutorMessages=[]}
 const task=()=>tasks[idx];
 function answer(value){
  if(answered)return;
  const t=task();choice=String(value);t.correct=norm(choice)===norm(t.answer);
  if(t.type==='reading'||t.selfCheck)t.correct=true;
  if(!t.correct){wrongAttempts++;hintLevel=Math.min(3,hintLevel+1);draw();return}
  answered=true;t.done=true;points++;recordResult(t);remember();draw();
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
  const messages=tutorMessages.slice(-8).map(m=>'<div class="mg-tutor-message '+(m.who==='uczen'?'mg-tutor-user':'mg-tutor-ai')+'"><strong>'+(m.who==='uczen'?'Paweł':'🦸 Nauczyciel AI')+':</strong> '+escape(m.text)+'</div>').join('');
  return '<section class="mg-tutor" style="margin-top:18px;padding:14px;border:2px solid #64748b;border-radius:16px"><h3>💬 Zapytaj nauczyciela AI</h3><p>Nie wiesz, co zrobić? Zapytaj o polecenie, czytankę albo swój błąd.</p><div id="mg-tutor-log" aria-live="polite">'+messages+'</div><textarea id="mg-tutor-input" rows="2" placeholder="Np. Gdzie mam przeczytać? Nie rozumiem zadania..."></textarea><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px">'+btn(tutorBusy?'⏳ Odpowiadam...':'💬 Zapytaj AI','tutor-send','mg-primary')+btn('🎤 Mów do nauczyciela','tutor-mic')+btn('🔊 Odczytaj odpowiedź','tutor-speak')+'</div><small>Rozpoznawanie głosu zależy od przeglądarki. AI nie podaje gotowych odpowiedzi.</small></section>';
 }
 async function tutorAsk(question){
  const q=String(question||'').trim();if(!q||tutorBusy)return;
  tutorMessages.push({who:'uczen',text:q});tutorBusy=true;draw();
  try{
   const raw=await ask(tutorContext()+'\nNAJNOWSZE PYTANIE UCZNIA: '+q+'\nOdpowiedz zwykłym tekstem, bez JSON i bez znaków markdown. Maksymalnie 5 zdań.');
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
 function stage(){const t=task();let html='';
  if(t.type==='safe')html+=`<div class="mg-vault ${answered&&t.correct?'mg-unlocked':''}"><div class="mg-vault-door">🔐</div><div class="mg-vault-gold">🪙 🪙 ✨ 🪙 🪙</div></div>`;
  if(t.type==='shop')html+='<div class="mg-scene">🛒 🍎 🥛 🍞 💰</div>';
  if(t.type==='clock')html+='<div class="mg-scene">⏰ 🕒</div>';
  if(t.type==='listening'||t.type==='dictation')html+=btn('🔊 Odsłuchaj','audio','mg-sound');
  if(t.type==='reading')html+=btn('🔊 Posłuchaj fragmentu','audio','mg-sound');
  html+=`<h3>${escape(t.question)}</h3>`;
  if(t.type==='reading')html+=`<div class="mg-reading-text">${escape(t.passage||'')}</div>`;
  if(t.type==='wordsearch'){const w=String(t.answer||'').toUpperCase().replace(/[^A-ZĄĆĘŁŃÓŚŹŻ]/g,'').slice(0,9);if(!t.grid){const abc='AĄBCĆDEĘFGHIJKLŁMNŃOÓPRSŚTUWYZŹŻ';const grid=Array.from({length:9},()=>Array.from({length:9},()=>abc[Math.floor(Math.random()*abc.length)]));const row=Math.floor(Math.random()*9),col=Math.floor(Math.random()*(10-w.length));for(let i=0;i<w.length;i++)grid[row][col+i]=w[i];t.grid=grid;t.wordRow=row;t.wordCol=col}html+=`<p>Znajdź i zaznacz słowo z podręcznika. Dotknij jego pierwszej litery.</p><div class="mg-wordgrid">${t.grid.map((r,y)=>r.map((v,x)=>btn(escape(v),'grid:'+y+':'+x,'mg-grid-cell')).join('')).join('')}</div>`;}
  if(t.type==='draw')html+='<p>🎨 Narysuj odpowiedź palcem na planszy.</p><canvas id="mg-draw" width="320" height="220" style="touch-action:none;background:white;border:2px solid #7080a0;border-radius:12px;max-width:100%"></canvas>'+btn('🧽 Wyczyść rysunek','clear-draw')+btn('✓ Rysunek gotowy','draw-done','mg-primary');
  if(t.type==='reading'){html+=btn('✓ Przeczytane, idę dalej','read-done','mg-primary');}
  else if(t.type==='draw'||t.type==='wordsearch'){/* osobna mechanika */}
  else if(t.type==='memory'){
   if(!t.cards){t.cards=t.options.map((s,i)=>({i,p:s.split('=')})).filter(x=>x.p.length===2).flatMap(x=>[{pair:x.i,text:x.p[0]},{pair:x.i,text:x.p[1]}]);t.cards=shuffle(t.cards);t.matched=[];t.flipped=[]}
   html+=`<div class="mg-memory">${t.cards.map((c,i)=>btn(t.matched.includes(i)||t.flipped.includes(i)?escape(c.text):'❔','flip:'+i,'mg-memory-card '+(t.matched.includes(i)?'mg-matched':''))).join('')}</div>`;
  }else if(t.type==='crossword'){
   html+='<div class="mg-cross">'+t.options.map((s,i)=>{const [word,clue]=s.split('=');return `<label>${escape(clue||'Wpisz hasło')}</label><input data-mg-cross="${i}" maxlength="${Math.max(3,word.length)}" placeholder="${'□'.repeat(Math.min(word.length,16))}" autocomplete="off">`}).join('')+'</div>'+btn('✓ Sprawdź hasła','cross','mg-primary');
  }else if(t.type==='order'||t.type==='spelling'){
   if(!t.chunks)t.chunks=shuffle(t.type==='order'?t.answer.split(/\s+/):Array.from(t.answer));
   html+=`<div class="mg-built">${escape(tiles.map(i=>t.chunks[i]).join(t.type==='order'?' ':'')||'Dotknij kafelków, aby ułożyć odpowiedź')}</div><div class="mg-choices">${t.chunks.map((v,i)=>btn(escape(v),'tile:'+i,'mg-choice '+(tiles.includes(i)?'mg-tile-used':''))).join('')}</div>${btn('↩ Cofnij','undo')}${btn('✓ Sprawdź','submit','mg-primary')}`;
  }else if(t.type==='dictation'||t.type==='write'||t.type==='syllables'||t.type==='listening'){
   html+='<input id="mg-written" autocomplete="off" placeholder="Wpisz usłyszane słowo">'+btn('✓ Sprawdź','written','mg-primary');
  }else{
   html+=`<div class="mg-choices">${t.options.map((v,i)=>btn(escape(v),'pick:'+i,'mg-choice')).join('')}</div>`;
  }
  if(hintLevel&&!answered)html+=`<div class="mg-feedback">💡 ${escape(hintText(t))}</div>`;
  if(!answered&&t.type!=='reading')html+=btn('💡 Podpowiedz, ale nie zdradzaj','hint');
  if(answered){html+=`<div class="mg-feedback">🌟 Dobra robota!${mode==='test'?'':`<p>${escape(t.explanation)}</p>`}</div>`+btn(idx===tasks.length-1?'🏆 Zakończ misję':'➡️ Następna zagadka','next','mg-primary')}
  html+=tutorPanel();
  return html;
 }
 function draw(){
  if(idx>=tasks.length)return finish();
  const t=task();
  const names={safe:'🔐 Sejf Iron Mana',shop:'🛒 Sklep Avengersów',clock:'⏰ Zegar misji',detective:'🕵️ Detektyw Spider-Mana',loki:'🦹 Bitwa z Lokim',reading:'🎙️ Laboratorium czytania',order:'🧩 Szyfr Avengersów',dictation:'✍️ Dyktando Kapitana',syllables:'🔠 Sylaby i głoski',crossword:'📝 Krzyżówka',choice:'⚡ Zagadka bohatera',listening:'🎧 Misja słuchowa',memory:'🃏 Memory',spelling:'✍️ Pisownia'};
  root.innerHTML=`<section class="mg-panel"><header class="mg-header"><small>${mode==='test'?'🏆 PRÓBNY SPRAWDZIAN':'⚡ MISJA SPECJALNA'} · STRONA ${escape(t.pageNumber||'?')}</small><h2>${t.type==='reading'?'📜 Tajny przekaz Avengersów':t.type==='loki'?'🦹 Pułapka Lokiego':t.type==='detective'?'🕵️ Detektyw Spider-Mana':t.type==='wordsearch'?'🔎 Wykreślanka':t.type==='draw'?'🎨 Misja rysunkowa':names[t.type]||'🎮 Misja bohatera'}</h2><p>Wyzwanie ${idx+1} z ${tasks.length}</p><div class="mg-bar"><div style="width:${Math.round(idx/tasks.length*100)}%"></div></div>${btn('⏸ Stop / zapisz','pause')}</header>${stage()}</section>`;
  const canvas=root.querySelector('#mg-draw');if(canvas){const ctx=canvas.getContext('2d');ctx.lineWidth=4;ctx.lineCap='round';let painting=false;const point=e=>{const r=canvas.getBoundingClientRect();return [(e.clientX-r.left)*canvas.width/r.width,(e.clientY-r.top)*canvas.height/r.height]};canvas.onpointerdown=e=>{painting=true;canvas.setPointerCapture(e.pointerId);ctx.beginPath();ctx.moveTo(...point(e))};canvas.onpointermove=e=>{if(painting){ctx.lineTo(...point(e));ctx.stroke()}};canvas.onpointerup=()=>painting=false;}
 }
 function finish(){
  if(!award){award=true;try{localStorage.removeItem(sessionKey())}catch{}const weak=tasks.filter(t=>!t.correct).map(t=>t.question).slice(0,8);try{localStorage.setItem(storeKey(),JSON.stringify({weak,date:Date.now(),score:points,total:tasks.length}))}catch{}
   if(points>0)reward(Math.min(12,points));}
  root.innerHTML=`<section class="mg-panel mg-final"><div class="mg-fireworks mg-v47-celebrate">✨ 🪙 ⭐ 🏆 🚀 ⭐ 🪙 ✨</div><h2>🏆 Misja ukończona!</h2><strong>${points} / ${tasks.length}</strong><p>Monety za misję: ${Math.min(12,points)}. Wróć do błędów lub rozpocznij nową przygodę.</p>${tasks.map(t=>`<details><summary>${t.correct?'✅':'📖'} ${escape(t.question)}</summary><p>Odpowiedź: ${escape(t.answer)}</p><p>${escape(t.explanation)}</p></details>`).join('')}${btn('🔄 Nowa misja AI','start','mg-primary')}${btn('📚 Zmień dział','back')}</section>`;
 }
 root.addEventListener('click',ev=>{
  const b=ev.target.closest('[data-mg]');if(!b||busy)return;
  const act=b.dataset.mg,t=task();
  if(act==='tutor-send')return tutorAsk(root.querySelector('#mg-tutor-input')?.value||'');
  if(act==='tutor-mic')return tutorMic();
  if(act==='tutor-speak'){const last=[...tutorMessages].reverse().find(m=>m.who==='ai');if(last)return speak(last.text,'pl-PL');return}
  if(act==='guide')return voiceGuide();if(act==='start')return start();if(act==='resume')return resume();if(act==='back')return setup();
  if(act==='pause'){remember();root.innerHTML='<section class="mg-panel"><h2>⏸ Misja zatrzymana</h2><p>Postęp zapisany na tym urządzeniu.</p>'+btn('▶️ Wznów','resume','mg-primary')+btn('📚 Wróć do wyboru','back')+'</section>';return}
  if(act==='hint'){hintLevel=Math.min(3,hintLevel+1);return draw()}
  if(act==='read-done')return answer('Przeczytane');
  if(act==='draw-done'){answered=true;t.done=true;t.correct=true;points++;remember();return draw()}
  if(act==='clear-draw'){const c=root.querySelector('#mg-draw');c?.getContext('2d')?.clearRect(0,0,c.width,c.height);return}
  if(act.startsWith('grid:')){const [y,x]=act.slice(5).split(':').map(Number);if(y===t.wordRow&&x===t.wordCol)return answer(t.answer);hintLevel=Math.min(3,hintLevel+1);return draw()}
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
 setup();return {open:setup};
}
