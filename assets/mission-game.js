const v773PreviewDecks=new Map();
import {speakSequence,stopVoice,setVoiceState,spellEnglish77} from './voice.js?v=77.4';
import {cleanEnglish76,vocabulary76,checkedVocabulary76,englishInstruction76,makeVocabularyTasks76,spokenMatch76,englishTaskSafe76,englishCue774,englishRecall774,simplifyEnglish774,englishExplanation774,englishAudioAllowed774,polishText774} from './english76.js?v=77.4';
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
export function mountMissionGame(root,{books,pages,ask,speak,reward,child,childGrade='2',initialBookId,batchGenerate=null,launch=null,onBack=null,transient=false}){
 const localStorage=transient?((persistent)=>{const memory=new Map();return {getItem:key=>memory.has(key)?memory.get(key):persistent.getItem(key),setItem:(key,value)=>memory.set(key,String(value)),removeItem:key=>memory.set(key,null)}})(globalThis.localStorage):globalThis.localStorage;
 const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const norm=s=>String(s??'').trim().toLocaleLowerCase('pl-PL').replace(/\s*,\s*/g,', ').replace(/\s+/g,' ');
 const btn=(label,act,cls='')=>`<button type="button" class="${cls}" data-mg="${act}">${label}</button>`;
 const shuffle=a=>{const r=[...a];for(let i=r.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[r[i],r[j]]=[r[j],r[i]];}return r;};
 let tutorMessages=[],tutorBusy=false,tutorListening=false,stageEpoch=0,readingRec=null;
 let bookId=initialBookId||'',scope='all',mode='game',tasks=[],idx=0,points=0,choice=null,answered=false,tiles=[],busy=false,award=false,progress={},hintLevel=0,paused=false,wrongAttempts=0;
 const book=()=>books.find(b=>b.id===bookId);
 const subject=(t=null)=>{const b=t?.sourceBookId?books.find(b=>b.id===t.sourceBookId):book();return /ang|english/i.test(b?.subject||'')?'angielski':/mat/i.test(b?.subject||'')?'matematyka':/przyrod|natur/i.test(b?.subject||'')?'przyroda':'polski'};
 const available=()=>books.filter(b=>pages.some(p=>p.bookId===b.id&&p.text?.trim()));
 const pagesFor=()=>pages.filter(p=>p.bookId===bookId&&p.text?.trim()).sort((a,b)=>a.number-b.number);
 const sourceBook=p=>books.find(b=>b.id===p.bookId);
 const sourceLabel=p=>{const b=sourceBook(p);return (b?.title||'Materiał bez tytułu')+' · strona '+p.number};
 const comparable=(a,b)=>String(a||'').trim().toLocaleLowerCase('pl-PL')===String(b||'').trim().toLocaleLowerCase('pl-PL');
 const sharedChapterPages=chapter=>{const base=book();return pages.filter(p=>p.text?.trim()&&comparable(p.chapter,chapter)&&books.some(b=>b.id===p.bookId&&!b.archived&&comparable(b.subject,base?.subject)&&String(b.grade||'')===String(base?.grade||''))).sort((a,b)=>String(sourceBook(a)?.title||'').localeCompare(String(sourceBook(b)?.title||''))||a.number-b.number)};
 const material=()=>scopePages().map(p=>`STRONA ${p.number}${p.chapter?' | DZIAŁ '+p.chapter:''}: ${p.text}`).join('\n').slice(0,15000);
 const themes={polski:['🕵️ Detektyw Spider-Mana','🦹 Pułapka Lokiego','🎙️ Laboratorium czytania','🧩 Szyfr Avengersów','✍️ Dyktando Kapitana','🔠 Sylaby i głoski','📝 Krzyżówka'],matematyka:['🔐 Sejf Iron Mana','🛒 Sklep Avengersów','⏰ Zegar misji','📐 Geometria','🧮 Działania','🧠 Logiczne zagadki'],angielski:['🎧 Słuchanie','🎙️ Wymowa','🃏 Memory','🧩 Rozsypanki','✍️ Pisownia','🦹 Pułapka Lokiego','🗣️ Dialogi']};
 const plan={polski:['detective','loki','reading','order','dictation','syllables','crossword','choice'],matematyka:['safe','shop','clock','choice','safe','order','choice','shop'],angielski:['listening','memory','order','spelling','loki','reading','choice','listening']};
 const storeKey=()=>`academy-v41-${child}-${bookId}-${scope}`;

 function chapterOf(p){return String(p.chapter||'').trim()}
 function chapters(){const base=book();return [...new Set(pages.filter(p=>p.text?.trim()&&books.some(b=>b.id===p.bookId&&!b.archived&&comparable(b.subject,base?.subject)&&String(b.grade||'')===String(base?.grade||''))).map(chapterOf).filter(Boolean))]}
 function scopePages(){
  if(launch){const ids=new Set(launch.pageIds||[]);return pages.filter(p=>ids.has(p.id)&&p.text?.trim()).sort((a,b)=>String(sourceBook(a)?.title||'').localeCompare(String(sourceBook(b)?.title||''),'pl')||a.number-b.number)}
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
 // V77.3: wybieramy z calego wybranego materialu, bez nadpisywania pytan po losowaniu.
 function v773DeckKey(part,ps){return 'academy-v773-'+part+'-'+child+'-'+mode+'-'+JSON.stringify(ps.map(p=>[p.bookId,p.id]).sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b))));}
 function v773ReadState(key,fallback){try{const raw=transient?v773PreviewDecks.get(key):localStorage.getItem(key);return raw?JSON.parse(raw):fallback;}catch{return fallback;}}
 function v773WriteState(key,value){try{const raw=JSON.stringify(value);if(transient)v773PreviewDecks.set(key,raw);else localStorage.setItem(key,raw);}catch{}}
 function v773DrawItems(list,count,key,initialTypes=[]){
  const candidates=shuffle([...new Map(list.map(x=>[x.token,x])).values()]),saved=v773ReadState(key,{}),counts=saved&&typeof saved==='object'&&!Array.isArray(saved)?saved:{},selected=[],types=new Set(initialTypes),pageUse=new Map();
  const seen=x=>Number.isFinite(counts[x.token])&&counts[x.token]>=0?counts[x.token]:0;
  while(candidates.length&&selected.length<count){
   const min=Math.min(...candidates.map(seen)),fresh=candidates.filter(x=>seen(x)===min);
   fresh.sort((a,b)=>Number(types.has(a.kind))-Number(types.has(b.kind))+(Number(pageUse.get(a.page)||0)-Number(pageUse.get(b.page)||0))*.1);
   const next=fresh[0];selected.push(next);types.add(next.kind);pageUse.set(next.page,(pageUse.get(next.page)||0)+1);counts[next.token]=seen(next)+1;candidates.splice(candidates.indexOf(next),1);
  }
  v773WriteState(key,counts);return selected;
 }
 // V77.4: znaczenia dla starszych pytan sa uzupelniane osobno; bank nie jest przepisywany.
 function v774CueCache(p){
  if(!p)return [];
  const saved=v773ReadState('academy-v774-cues-'+child+'-'+p.bookId+'-'+p.id,null);
  return saved?.text===p.text?checkedVocabulary76(saved.items,p.text):[];
 }
 function v774Normalize(t,p=null){
  if(subject(t)!=='angielski')return t;
  p=p||pages.find(p=>p.id===t.sourcePageId)||pagesFor().find(p=>String(p.number)===String(t.pageNumber));
  const cue=v774CueCache(p).find(x=>x.en===cleanEnglish76(t.answer))?.pl||'';
  return simplifyEnglish774(t,cue);
 }
 async function v774PrepareScope(ps){
  const previous=bookId,pending=[];
  try{for(const p of ps){bookId=p.bookId;if(subject()!=='angielski')continue;
   const cached=v774CueCache(p),words=[];
   for(const entry of readBank()){
    const t=entry.task;if(!t||!v75MatchesPage(entry,p)||!englishRecall774(t)||englishCue774(t)||cached.some(x=>x.en===cleanEnglish76(t.answer)))continue;
    const en=cleanEnglish76(t.answer);if(en&&en.length<=45&&!words.includes(en)&&(' '+cleanEnglish76(p.text)+' ').includes(' '+en+' '))words.push(en);
   }
   if(words.length)pending.push({p,cached,words:words.slice(0,12)});
  }}finally{bookId=previous;}
  if(!pending.length)return;
  // Jedno ograniczone zapytanie; brak AI nie blokuje pytan z gotowymi znaczeniami.
  const batch=pending.slice(0,3);let prompt='Podaj polskie znaczenia TYLKO wskazanych angielskich slow, zgodnie z kontekstem. Nie dopisuj slow ani definicji. Jesli znaczenie niepewne, pomin. TYLKO JSON {"pages":[{"id":"...","vocabulary":[{"en":"...","pl":"..."}]}]}. ';
  const ids=new Set();for(const item of batch){const part=JSON.stringify({id:item.p.id,words:item.words,text:String(item.p.text).slice(0,1000)});if(prompt.length+part.length>5200)break;prompt+=part+'\n';ids.add(item.p.id);}
  try{
   const raw=String(await ask(prompt,10000)).replace(/```(?:json)?/gi,'').replace(/```/g,''),obj=JSON.parse(raw.slice(raw.indexOf('{'),raw.lastIndexOf('}')+1));
   for(const item of batch){if(!ids.has(item.p.id))continue;const row=Array.isArray(obj.pages)?obj.pages.find(x=>x.id===item.p.id):null,list=checkedVocabulary76(row?.vocabulary,item.p.text).filter(x=>item.words.includes(x.en));
    if(list.length)v773WriteState('academy-v774-cues-'+child+'-'+item.p.bookId+'-'+item.p.id,{text:item.p.text,items:[...item.cached,...list]});
   }
  }catch{console.warn('Nie udało się uzupełnić znaczeń starszych pytań. Korzystam ze sprawdzonych słówek.');}
 }

 function v773CollectBank(ps){
  const previous=bookId,out=[],seen=new Set();
  try{for(const id of new Set(ps.map(p=>p.bookId))){bookId=id;const matching=ps.filter(p=>p.bookId===id);
   for(const savedEntry of readBank()){
    const source=matching.find(p=>v75MatchesPage(savedEntry,p));if(!source||!savedEntry.task)continue;
    const prepared={...savedEntry.task,sourceBookId:id,sourcePageId:source.id};if(!reliableTask(prepared,source))continue;
    const entry={...savedEntry,key:savedEntry.key||fingerprint(savedEntry.task),task:prepared};
    if(entry.subject!==subject()||!entry.task?.question)continue;
    const p=matching.find(p=>v75MatchesPage(entry,p)&&entry.task.type!=='reading'&&reliableTask(entry.task,p));if(!p)continue;
    const token=JSON.stringify([id,entry.key||fingerprint(entry.task)]);if(seen.has(token))continue;seen.add(token);
    out.push({token,kind:entry.task.type||'choice',page:p.id,entry,p});
   }
  }}finally{bookId=previous;}
  return out;
 }
 function v773TaskEntry(t,p){
  const token=JSON.stringify([p.bookId,p.id,t.type,t.answer,t.wordEn||'',(t.items||[]).map(x=>x.key||x.label).sort(),(t.pairs||[]).map(x=>x.en).sort(),(t.words||[]).slice().sort()]);
  return {token,kind:t.type,page:p.id,task:{...t,sourceBookId:p.bookId,sourcePageId:p.id,pageNumber:p.number,sourceTitle:sourceLabel(p),done:false,correct:false}};
 }
 function v773SourceWordsearch(p,round){const words=(subject()==='angielski'?vocabulary76(p.text).map(x=>x.en):wordPieces(p.text)).filter(w=>[...w].length>=3&&[...w].length<=8),pool=[...new Set(words)];if(pool.length<6)return null;const at=Math.abs(round)%pool.length,chosen=[...pool.slice(at),...pool.slice(0,at)].slice(0,6);return {type:'wordsearch',question:'🔎 Znajdź 6 słów. Szukaj poziomo i pionowo.',answer:chosen.join(', '),words:chosen,options:[],hint:'Zacznij od pierwszej litery i zaznaczaj kolejne.',pageNumber:p.number,done:false,correct:false};}
 function v773SourceMemory(p,round){const en=subject()==='angielski',pool=en?vocabulary76(p.text).map(x=>({front:x.en,back:x.pl})):[...new Set(wordPieces(p.text))].map(word=>({front:word,back:word}));if(pool.length<6)return null;const at=Math.abs(round)%pool.length,pairs=[...pool.slice(at),...pool.slice(0,at)].slice(0,6);return {type:'memory',question:en?'🃏 Memory: połącz słowa z ich znaczeniem.':'🃏 Memory: znajdź sześć par słów ze strony.',answer:'Wszystkie pary',options:[],cards:shuffle(pairs.flatMap((x,i)=>[{pair:i,label:x.front},{pair:i,label:x.back}])),matched:[],flipped:[],pageNumber:p.number,done:false,correct:false};}
 function v773SourceReading(p,round){if(subject()!=='polski')return null;const sentences=(String(p.text).match(/[^.!?]+[.!?]+|[^.!?]+$/g)||[]).map(x=>x.trim()).filter(x=>x.split(/\s+/).length>=3&&x.split(/\s+/).length<=25);if(!sentences.length)return null;return {type:'reading-mini',question:'🎙️ Przeczytaj kolejno podświetlane słowa ze strony.',passage:sentences[Math.abs(round)%sentences.length],answer:'Przeczytane',options:[],pageNumber:p.number,done:false,correct:false,readProgress:0};}
 function v773MaterialGame(t,p){if(!t)return false;if(t.type==='rebus')return visibleInText(p.text,t.answer);if(t.type==='crossword')return t.crossWords?.length&&t.crossWords.every(x=>visibleInText(p.text,x.word));if(t.type==='order'||t.type==='write')return visibleInText(p.text,t.answer);return true;}
 function v773BuildMission(ps){
  const pool=v773CollectBank(ps);if(!pool.length)return [];
  const saved=v773DrawItems(pool,mode==='test'?10:6,v773DeckKey('questions',ps));
  const core=saved.map(({entry,p})=>{const t={...entry.task,_bankKey:entry.key||fingerprint(entry.task),sourceBookId:p.bookId,sourcePageId:p.id,pageNumber:p.number,sourceTitle:sourceLabel(p),done:false,correct:false};if(sourceQuestion(t))t.sourceExcerpt=sourceFromText(p.text,t);if(['choice','safe','shop','clock','detective','loki'].includes(t.type))t.options=shuffle(t.options||[]);return t;});
  if(mode==='test')return core.map(v76AttachInstruction);
  const previous=bookId,roundKey=v773DeckKey('round',ps),round=Number(v773ReadState(roundKey,0))||0;v773WriteState(roundKey,round+1);
  const gamePages=v773DrawItems(ps.map(p=>({token:p.id,kind:p.bookId,page:p.id,p})),Math.min(2,ps.length),v773DeckKey('game-pages',ps)).map(x=>x.p),extras=[];
  try{for(const p of gamePages){bookId=p.bookId;
   const visual=v77ActivityPool([p],Math.abs(round));
   const local=[makeCrossword(p),v773SourceWordsearch(p,round),makePuzzle(p),makeAdjective(p),makeRebus(p),v773SourceMemory(p,round),v773SourceReading(p,round)].filter(t=>v773MaterialGame(t,p));
   extras.push(...[...visual,...local].map(t=>v773TaskEntry(t,p)));
  }}finally{bookId=previous;}
  const vocabulary=v76VocabularyPool(gamePages);
  if(vocabulary.length){for(const t of [...makeVocabularyTasks76(vocabulary,round,10),...v77ExtraWords(gamePages,Math.abs(round),vocabulary)]){const p=gamePages.find(p=>p.id===t.sourcePageId);if(p)extras.push(v773TaskEntry({...t,vocab76:!['vocab-build','vocab-match'].includes(t.type)},p));}}
  const extraKey=v773DeckKey('activities',ps),picked=[],oralTypes=['vocab-speak','vocab-repeat','vocab-reading'],types=core.map(t=>t.type),limit=10-core.length;
  const addFrom=(list,n)=>{const used=new Set(picked.map(x=>x.token)),chosen=v773DrawItems(list.filter(x=>!used.has(x.token)),Math.min(n,limit-picked.length),extraKey,[...types,...picked.map(x=>x.kind)]);picked.push(...chosen);};
  if(limit){addFrom(extras.filter(x=>oralTypes.includes(x.kind)),1);addFrom(extras.filter(x=>x.task.visual77),1);addFrom(extras.filter(x=>!oralTypes.includes(x.kind)),limit-picked.length);}
  const games=picked.map(x=>x.task),result=[];
  for(let i=0;i<core.length;i++){result.push(core[i]);if(i%2===0&&games.length)result.push(games.shift());}result.push(...games);
  return result.map(v76AttachInstruction);
 }

 // V48_BANK_AI: zapis lokalny w przegladarce, osobny dla kazdego dziecka i podrecznika
 // V76_WORDS_AND_SPEECH: wspolny lektor EN -> PL, slowka i mowienie.
 let v76VocabOnly=launch?.mode==='vocab';
 function v76AttachInstruction(t){if(subject(t)==='angielski'){v774Normalize(t);const x=englishInstruction76(t);t.instructionEn=x.en;t.instructionPl=x.pl;t.question=x.en;t.questionPl=x.pl;}return t}
 function v76SayInstruction(t){
  v774Normalize(t);const x=englishInstruction76(t),current=t;
  return speakSequence([{text:x.en,lang:'en-US',rate:.84},...(mode!=='test'||t.targetPl774?[{text:x.pl,lang:'pl-PL',rate:.92}]:[])],{isCurrent:()=>root.isConnected&&task()===current});
 }
 function v76VocabularyPool(ps){const out=[];for(const p of ps){const b=books.find(b=>b.id===p.bookId);if(!/ang|english/i.test(b?.subject||''))continue;for(const entry of vocabulary76(p.text))if(!out.some(x=>x.en===entry.en))out.push({...entry,sourcePageId:p.id,sourceBookId:p.bookId,pageNumber:p.number,sourceTitle:sourceLabel(p)})}return out}
 async function v76StartVocabulary(){
  if(busy)return;const ps=scopePages().filter(p=>/ang|english/i.test(books.find(b=>b.id===p.bookId)?.subject||''));
  if(!ps.length){root.innerHTML='<section class="mg-panel"><h2>Wybierz strony z angielskiego</h2><p>Słówka korzystają z odczytanego tekstu wybranych stron.</p>'+btn('← Wróć','back')+'</section>';return}
  busy=true;const prepareEpoch=++stageEpoch;root.innerHTML='<section class="mg-panel"><h2>🃏 Przygotowuję słówka…</h2></section>';
  try{
   const key=v773DeckKey('vocabulary-round',ps);let rotation=Number(v773ReadState(key,0))||0;
   const chosen=v773DrawItems(ps.map(p=>({token:p.id,kind:p.bookId,page:p.id,p})),Math.min(2,ps.length),v773DeckKey('vocabulary-pages',ps)).map(x=>x.p);let pool=v76VocabularyPool(chosen);
   if(pool.length<3){for(const p of chosen){
    try{
     const text=String(p.text||'').slice(0,2400),cacheKey='academy-v76-vocabulary-'+child+'-'+p.id;
     let cached=null;try{cached=JSON.parse(localStorage.getItem(cacheKey)||'null')}catch{}
     let list=cached?.text===text?checkedVocabulary76(cached.items,text):[];
     if(!list.length){const raw=String(await ask('Wybierz do 20 podstawowych angielskich slow lub krotkich zwrotow DOSLOWNIE obecnych w materiale. Dodaj ich jednoznaczne polskie znaczenia zgodne z kontekstem. Nie dodawaj slow spoza strony, imion ani tresci polecen. TYLKO JSON {"vocabulary":[{"en":"cat","pl":"kot"}]}. MATERIAL: '+text,16000)).replace(/```(?:json)?/gi,'').replace(/```/g,'');const obj=JSON.parse(raw.slice(raw.indexOf('{'),raw.lastIndexOf('}')+1));list=checkedVocabulary76(obj.vocabulary,text);if(list.length)try{localStorage.setItem(cacheKey,JSON.stringify({text,items:list}))}catch{}}
     for(const item of list)if(!pool.some(x=>x.en===item.en))pool.push({...item,sourcePageId:p.id,sourceBookId:p.bookId,pageNumber:p.number,sourceTitle:sourceLabel(p)});
    }catch(err){console.warn('Słówka: nie udało się uzupełnić strony',p.number)}
   }}
   if(!root.isConnected||stageEpoch!==prepareEpoch)return;
   if(!pool.length)throw Error('Na wybranych stronach nie znalazłem jeszcze słówek do bezpiecznego ćwiczenia. Wybierz inną stronę albo spróbuj ponownie przy dostępnym AI.');
   tasks=makeVocabularyTasks76(pool,rotation,10).map(t=>({...t,vocab76:true}));const extra=v77ExtraWords(chosen,Math.abs(rotation),pool);if(extra.length&&tasks.length>=7)tasks.splice(tasks.length-2,2,...extra);tasks=v77MixActivities(tasks,chosen,pool);idx=0;points=0;award=false;mode='game';reset();remember();v773WriteState(key,rotation+1);draw();
  }catch(err){root.innerHTML='<section class="mg-panel"><h2>Nie udało się przygotować słówek</h2><p>'+escape(err.message)+'</p>'+btn('Spróbuj ponownie','start')+btn('← Wróć','back')+'</section>'}
  finally{busy=false}
 }
 function v76MixWords(all,ps){
  const original=shuffle(all).slice(0,10);if(mode==='test'||childGrade==='P')return original.map(v76AttachInstruction);
  const pool=v76VocabularyPool(ps);if(!pool.length)return original.map(v76AttachInstruction);
  const key='academy-v76-mixed-words-'+child+'-'+ps.map(p=>p.bookId).join('|');let rotation=0;try{rotation=Number(localStorage.getItem(key)||0)||0}catch{}
  const words=makeVocabularyTasks76(pool,rotation,10);const oral=words.findIndex(t=>['vocab-speak','vocab-repeat','vocab-reading'].includes(t.type));if(oral>0)words.unshift(...words.splice(oral,1));let j=0;
  for(let i=2;i<original.length;i+=3){if(words[j])original[i]={...words[j++],vocab76:true};}
  try{localStorage.setItem(key,String(rotation+1))}catch{}
  const extra=v77ExtraWords(ps,Math.abs(rotation));if(extra.length&&original.length>=6){original[1]=extra[0];original[4]=extra[1];}
  return original.map(v76AttachInstruction);
 }
 function v76WordRecord(t){
  const key='academy-v76-word-stats-'+child+'-'+(t.sourceBookId||bookId);let data={};try{const x=JSON.parse(localStorage.getItem(key)||'{}');if(x&&typeof x==='object'&&!Array.isArray(x))data=x}catch{}
  const id=t.wordEn||t.answer,old=data[id]||{seen:0,correct:0};data[id]={seen:old.seen+1,correct:old.correct+(t.correct?1:0),last:Date.now(),kind:t.type};try{localStorage.setItem(key,JSON.stringify(data))}catch{}
 }
 function v76WordStage(t){
  const instruction=englishInstruction76(t);
  let html='<div class="v76-word-card"><div class="v76-word-icon" aria-hidden="true">'+escape(t.picture||({'vocab-write':'✍️','vocab-speak':'🎙️','vocab-repeat':'🗣️','vocab-listen':'🎧','vocab-reading':'📖','vocab-choice':'🃏','vocab-meaning':'💡'}[t.type])||'🃏')+'</div><h3>'+escape(instruction.en)+'</h3>'+(mode!=='test'?'<p class="mg-translation">'+escape(instruction.pl)+'</p>':'');
  if(['vocab-write','vocab-speak','vocab-choice'].includes(t.type))html+='<div class="v76-word-prompt">'+escape(t.promptPl)+'</div>';
  if(['vocab-meaning','vocab-repeat'].includes(t.type))html+='<div class="v76-word-prompt" lang="en">'+escape(t.wordEn)+'</div>';
  if(t.type==='vocab-reading')html+='<div class="v76-reading-words" lang="en">'+(t.readWords||[]).map(w=>'<span>'+escape(w)+'</span>').join('')+'</div>';
  if(['vocab-choice','vocab-meaning'].includes(t.type))html+='<div class="mg-choices">'+t.options.map((v,i)=>btn(escape(v),'pick:'+i,'mg-choice')).join('')+'</div>';
  if(['vocab-write','vocab-listen'].includes(t.type)){if(t.type==='vocab-listen')html+=btn('🔊 Posłuchaj słowa','v76-word-model','mg-primary');html+='<input id="mg-written" lang="en" autocomplete="off" autocapitalize="none" spellcheck="false" placeholder="Wpisz po angielsku">'+btn('✓ Sprawdź','written','mg-primary');}
  if(['vocab-speak','vocab-repeat','vocab-reading'].includes(t.type)){
   if(t.type!=='vocab-speak'||t.v76SpeechTried)html+=btn('🔊 Posłuchaj wzoru powoli','v76-word-model');
   html+=btn(t.v76Recording?'⏹ Zakończ wypowiedź':'🎙️ Odpowiedz po angielsku','v76-word-record','mg-primary '+(t.v76Recording?'v76-recording':''));
   if(t.v76Transcript)html+='<p class="v76-heard">Usłyszałem: '+escape(t.v76Transcript)+'</p>';
   if(t.v76Error)html+='<p class="mg-feedback" role="status">'+escape(t.v76Error)+'</p>';
  }
  html+='</div>';
  if(!answered)html+=btn('Pomiń bez zaliczenia — następne zadanie','skip');
  if(answered)html+='<div class="mg-feedback v76-success">🌟 Świetnie! '+escape(t.wordEn+' — '+t.promptPl)+'</div>'+btn(idx===tasks.length-1?'🏆 Zakończ misję':'➡️ Następne zadanie','next','mg-primary');
  return html+tutorPanel();
 }
 function v76WordModel(t){const words=t.type==='vocab-reading'?(t.readWords||[]):[t.wordEn];return speakSequence(words.flatMap((text,i)=>[{text,lang:'en-US',rate:.68},...(t.v76SpeechTried?[{text:t.type==='vocab-reading'?(t.readMeanings?.[i]||''):(t.promptPl||''),lang:'pl-PL',rate:.87}]:[])]),{isCurrent:()=>task()===t&&root.isConnected})}
 function v76WordVoice(t){
  if(readingRec){try{readingRec.stop()}catch{}return}
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SR){t.v76Error='Rozpoznawanie mowy nie jest dostępne w tej przeglądarce. Możesz pominąć zadanie bez zaliczenia.';draw();return}
  stopVoice();const current=t,epoch=stageEpoch;let transcript='',got=false,failed=false;
  const r=new SR();r.lang='en-US';r.maxAlternatives=5;r.interimResults=false;readingRec=r;t.v76Error='';
  const isCurrent=()=>root.isConnected&&task()===current&&epoch===stageEpoch;
  r.onstart=()=>{if(isCurrent()&&readingRec===r&&!r.__v76Cancelled){t.v76Recording=true;setVoiceState('listening');draw()}};
  r.onresult=e=>{if(!isCurrent())return;const candidates=Array.from(e.results?.[0]||[]).map(x=>x.transcript||'');transcript=candidates.find(s=>spokenMatch76(t.answer,s))||candidates[0]||'';got=!!transcript.trim()};
  r.onerror=e=>{failed=true;if(isCurrent()){t.v76Error=/not-allowed|service-not-allowed/.test(e.error)?'Zezwól na dostęp do mikrofonu.':'Nie udało się rozpoznać słów. Spróbuj ponownie.';t.v76Recording=false;setVoiceState('idle');draw()}};
  r.onend=()=>{
   if(readingRec===r)readingRec=null;if(!isCurrent())return;t.v76Recording=false;setVoiceState('idle');
   if(r.__v76Cancelled)return draw();
   if(!got){if(!failed)t.v76Error='Nie usłyszałem wypowiedzi. Spróbuj ponownie.';draw();return}
   t.v76Transcript=transcript;t.v76SpeechTried=true;
   if(spokenMatch76(t.answer,transcript)){answer(t.answer);return}
   wrongAttempts++;t.correct=false;logDifficulty(t,'próba wymowy: '+transcript);audioCue(false);t.v76Error='Spróbuj jeszcze raz. Posłuchaj spokojnego wzoru i powtórz słowa.';draw();if(mode!=='test')v76WordModel(t);
  };
  try{setVoiceState('starting');r.start()}catch(err){readingRec=null;t.v76Recording=false;t.v76Error='Nie udało się uruchomić mikrofonu. Spróbuj ponownie.';setVoiceState('idle');draw()}
 }
 function v76EnglishCrossword(p){
  const pool=vocabulary76(p.text).filter(x=>/^[a-z]{3,10}$/.test(x.en));
  if(pool.length<4)return null;
  const key='academy-v76-cross-'+child+'-'+bookId+'-'+p.id;let runs=0;try{runs=Number(localStorage.getItem(key)||0)||0}catch{}
  const candidates=[...pool.slice(runs%pool.length),...pool.slice(0,runs%pool.length)].filter(x=>x.en.length<=8);
  for(const target of candidates){const used=new Set(),entries=[];let valid=true;
   for(const letter of target.en){const match=pool.find(x=>!used.has(x.en)&&x.en.includes(letter));if(!match){valid=false;break}used.add(match.en);entries.push({word:match.en,index:match.en.indexOf(letter),clue:'Jak jest po angielsku „'+match.pl+'”?'})}
   if(!valid)continue;
   const left=Math.max(...entries.map(x=>x.index)),width=Math.max(...entries.map(x=>left-x.index+x.word.length));
   const grid=entries.map((entry,row)=>Array.from({length:width},(_,col)=>{const at=col-(left-entry.index);return at>=0&&at<entry.word.length?{letter:entry.word[at],cross:col===left,row,col}:null}));
   try{localStorage.setItem(key,String(runs+1))}catch{}
   const t={type:'crossword',question:'Solve the crossword. The highlighted letters will form the secret word.',questionPl:'Rozwiąż krzyżówkę. Wyróżnione litery utworzą hasło.',answer:target.en,crossInfo:target.en+' — '+target.pl,crossWords:entries,crossGrid:grid,crossColumn:left,crossTyped:entries.map(()=>''),options:[],pageNumber:p.number,done:false,correct:false};return t;
  }
  return null;
 }
 document.addEventListener('academy:voice-stop',()=>{if(!root.isConnected)return;if(tutorBusy){stageEpoch++;tutorBusy=false}if(!readingRec)return;const r=readingRec;r.__v76Cancelled=true;readingRec=null;const t=task();if(t){t.v76Recording=false;t.readActive=false}try{r.abort()}catch{}draw()});

 const bankKey=()=>`academy-v48-bank-${books.find(b=>b.id===bookId)?.child||child}-${bookId}`;
 const sessionKey=()=>`academy-v49-session-${child}-${launch&&initialBookId?initialBookId:bookId}`;
 const remember=()=>{try{localStorage.setItem(sessionKey(),JSON.stringify({scope,mode,tasks,idx,points,award}))}catch{}};
 function resume(){try{const x=JSON.parse(localStorage.getItem(sessionKey())||'null');if(!x||!x.tasks?.length)return setup();scope=x.scope;mode=x.mode;tasks=x.tasks.map(v76AttachInstruction);tasks.forEach(t=>{t.readActive=false});if(tasks.some(t=>t.type==='reading')){const before=tasks.slice(0,x.idx).filter(t=>t.type!=='reading').length;tasks=tasks.filter(t=>t.type!=='reading');x.idx=Math.min(before,Math.max(0,tasks.length-1))}idx=x.idx;points=x.points;award=x.award;paused=false;reset();answered=!!task()?.done;draw()}catch{setup()}}
 const selectionIds=()=>new Set(scopePages().map(p=>String(p.number)));
 const fingerprint=t=>norm(t.question)+'|'+norm(t.answer);
 function v75MatchesPage(x,p){
  const ids=(x.pageIds||[]).map(String),linked=pages.filter(q=>q.bookId===p.bookId&&ids.includes(String(q.id)));
  return linked.length?linked.some(q=>String(q.id)===String(p.id)):ids.includes(String(p.number));
 }
 function readBank(){try{const v=JSON.parse(localStorage.getItem(bankKey())||'[]');if(!Array.isArray(v))return [];let stats={};try{stats=JSON.parse(localStorage.getItem('academy-v76-question-stats-'+child+'-'+bookId)||'{}')||{}}catch{};let legacy=[];try{legacy=JSON.parse(localStorage.getItem('academy-v48-bank-'+child+'-'+bookId)||'[]')}catch{};if(!Array.isArray(legacy))legacy=[];return v.map(x=>{const old=legacy.find(t=>t.key===x.key);return {...x,...(child===books.find(b=>b.id===bookId)?.child?{}:{seen:old?.seen||0,wrong:old?.wrong||0,last:old?.last||0}),...(stats[x.key]||{})}})}catch{return []}}
 function writeBank(items){try{let previous=[];try{const v=JSON.parse(localStorage.getItem(bankKey())||'[]');if(Array.isArray(v))previous=v}catch{};localStorage.setItem(bankKey(),JSON.stringify(items.slice(-1800).map(x=>{const old=previous.find(p=>p.key===x.key);return {...x,seen:old?.seen||0,wrong:old?.wrong||0,last:old?.last||0}})))}catch(e){console.warn('Nie mozna zapisac banku zadan',e)}}
 function storeTasks(items,page=null){
  const bank=readBank();const ids=page?[String(page.number),String(page.id)]:[...selectionIds()];
  for(const t of items){
   if(!t||!t.question||!t.answer||!Array.isArray(t.options))continue;
   const key=fingerprint(t);const prev=bank.find(x=>x.key===key);
   if(prev){prev.pageIds=[...new Set([...(prev.pageIds||[]),...ids])];continue}
   bank.push({key,subject:subject(),pageIds:ids,task:{question:t.question,answer:t.answer,options:t.options,explanation:t.explanation||'',hint:t.hint||'',audio:t.audio||'',type:t.type,needsSource:t.needsSource===true,sourceQuote:t.sourceQuote||'',questionPl:t.questionPl||'',answerPl:t.answerPl||'',answerPlFor:cleanEnglish76(t.answer),explanationPl:t.explanationPl||'',...(t.type==='crossword'?{crossInfo:t.crossInfo,crossWords:t.crossWords,crossGrid:t.crossGrid,crossColumn:t.crossColumn}:{}),...(t.type==='wordsearch'?{words:t.words}:{}),...(t.type==='rebus'?{rebus:t.rebus,rebusPicture:t.rebusPicture,rebusHint:t.rebusHint}:{})},seen:0,wrong:0,last:0});
  }writeBank(bank);
 }
 function pickSaved(count=5){
  const ids=selectionIds();
  const eligible=readBank().filter(x=>x.subject===subject()&&Array.isArray(x.pageIds)&&x.pageIds.some(n=>ids.has(String(n)))&&x.task?.question&&x.task?.answer&&Array.isArray(x.task.options));
  eligible.sort((a,b)=>((b.wrong||0)*3-(b.seen||0)) - ((a.wrong||0)*3-(a.seen||0)) + (Math.random()-.5)*4);
  return eligible.slice(0,count).map(x=>({...x.task,_bankKey:x.key,done:false,correct:false}));
 }
 function recordResult(t){
  if(t.vocab76){v76WordRecord(t);return}

  const sourceId=t?.sourceBookId||bookId,owner=books.find(b=>b.id===sourceId)?.child||child;
  const contentKey='academy-v48-bank-'+owner+'-'+sourceId,statsKey='academy-v76-question-stats-'+child+'-'+sourceId;
  try{const bank=JSON.parse(localStorage.getItem(contentKey)||'[]'),key=t._bankKey||fingerprint(t);let all=JSON.parse(localStorage.getItem(statsKey)||'{}');if(!all||Array.isArray(all)||typeof all!=='object')all={};let legacy=[];try{legacy=JSON.parse(localStorage.getItem('academy-v48-bank-'+child+'-'+sourceId)||'[]')}catch{};const old=all[key]||((owner===child?bank:Array.isArray(legacy)?legacy:[]).find(x=>x.key===key)||{});all[key]={seen:(old.seen||0)+1,wrong:t.correct?Math.max(0,(old.wrong||0)-1):(old.wrong||0)+1,last:Date.now()};localStorage.setItem(statsKey,JSON.stringify(all))}catch(err){console.warn('Nie udało się zapisać postępu',err)}
 }
 // V62: pytanie musi mieć jedną poprawną odpowiedź i, gdy dotyczy tekstu,
 // odpowiedź rzeczywiście musi dać się znaleźć w dostarczonej czytance.
 function sourceQuestion(t){
  const q=String(t.question||'').toLocaleLowerCase('pl-PL');
  return t.needsSource===true || /(?:z|we|w) (?:wierszu|wiersza|czytance|czytanki|tekście|tekstu|refrenie|refrenu)|według (?:tekstu|wiersza)|na podstawie (?:tekstu|wiersza)|zgodnie z (?:tekstem|wierszem)|(?:co|kto|jakie|które|dlaczego).*w (?:wierszu|tekście)/i.test(q);
 }
 function visibleInText(text,value){
  const needle=spokenWords(value).join(' ');
  const hay=spokenWords(text).join(' ');
  return !!needle && (' '+hay+' ').includes(' '+needle+' ');
 }
 function reliableTask(t,p){
  if(subject()==='angielski'){if(!englishTaskSafe76(t))return false;v774Normalize(t,p);if(t?.v774NeedsCue||!englishTaskSafe76(t))return false;}
  if(t?.type==='crossword'){
   if(typeof t.crossInfo!=='string'||!Array.isArray(t.crossWords)||!t.crossWords.length||!Array.isArray(t.crossGrid)||t.crossGrid.length!==t.crossWords.length||!Number.isInteger(t.crossColumn)||t.crossColumn<0)return false;
   if(t.crossWords.some((v,i)=>!v||typeof v.word!=='string'||!v.word.trim()||typeof v.clue!=='string'||!Number.isInteger(v.index)||v.index<0||v.index>=v.word.length||!Array.isArray(t.crossGrid[i])||t.crossColumn<v.index||t.crossColumn-v.index+v.word.length>t.crossGrid[i].length||t.crossGrid[i].some(c=>c&&(typeof c.letter!=='string'||c.letter.length!==1))))return false;
  }
  if(t?.type==='wordsearch'&&(!Array.isArray(t.words)||!t.words.length||t.words.length>6||t.words.some(x=>typeof x!=='string'||!x.trim()||[...x].length>10)))return false;
  if(t?.type==='rebus'&&(typeof t.rebusPicture!=='string'||!t.rebusPicture.trim()||typeof t.rebus!=='string'||!t.rebus.trim()))return false;
  if(subject()==='angielski'&& (t.needsSource===true||/(?:z tekstu|zgodnie z tekstem|z listy|w historii|w opowiesci|w opowieści|w trzeciej części)/i.test(t.question||'')))return false;
  if(!t||!String(t.question||'').trim()||!String(t.answer||'').trim())return false;
  const options=t.options||[],requiresChoices=['choice','safe','shop','clock','detective','loki'].includes(t.type||'choice');
  if(!Array.isArray(options)||options.some(x=>typeof x!=='string'))return false;
  if(requiresChoices){if(options.length!==4||new Set(options.map(norm)).size!==4||options.filter(x=>norm(x)===norm(t.answer)).length!==1)return false;}
  else if(!['write','dictation','listening','order','spelling','syllables','rebus','crossword','wordsearch'].includes(t.type))return false;
  const q=String(t.question).toLocaleLowerCase('pl-PL');
  // 'Które słowo zawiera poprawnie zapisane rz?' nie może mieć czterech
  // wyrazów z poprawnym rz. Analogicznie dla innych sprawdzanych cząstek.
  const parts=['rz','ch','sz','cz','ó','ż'];
  const part=parts.find(x=>q.includes("'"+x+"'")||q.includes('„'+x+'”')||q.includes('"'+x+'"'));
  if(part&&requiresChoices&&/(zawiera|zawierają|cząstk|dwuznak|występuje|poprawnie napisan)/i.test(q)){
   const count=options.filter(x=>String(x).toLocaleLowerCase('pl-PL').includes(part)).length;
   if(count!==1)return false;
  }
  // V64: pisownia to wiedza słownikowa. Nie oceniaj automatycznie pytań AI
  // typu 'poprawnie zapisano ó', jeśli mogą mieć 0 lub kilka prawidłowych opcji.
  // Zastępujemy je lokalnymi, ręcznie sprawdzonymi ćwiczeniami ortograficznymi.
  const orthoRule=/(?:ortograf|pisown|poprawnie\s+(?:zapis\w*|napis\w*)|prawidłowo\s+(?:zapis\w*|napis\w*)|wymian\w*\s+(?:na|z)|wymienia\s+się)/i.test(q);
  const orthoWords=/(?:wyraz|słow|głosk|liter|cząstk|dwuznak|ortograf|pisown)/i.test(q);
  if(subject()==='polski'&&orthoRule&&orthoWords)return false;
  // V65: nie przyjmuj nieweryfikowalnych testow AI o pisowni.
  // Dotyczy tez formy: "Ktore slowo piszemy przez 'rz'?" oraz starego banku.
  const riskySpelling=/(?:pisz\w*\s+przez|zapis\w*\s+przez|przez\s+[„"']?(?:rz|ż|ó|u|ch|h)\b|[„"'](?:rz|ż|ó|ch|h)[”"']|ortograf|pisown|poprawnie\s+(?:zapis\w*|napis\w*)|prawidłowo\s+(?:zapis\w*|napis\w*)|wymien\w*\s+(?:na|z)|wymienia\s+się)/i.test(q);
  if(subject()==='polski'&&riskySpelling&&/(?:wyraz|słow|liter|głosk|cząstk|dwuznak|pisz|ortograf|pisown|które|który|wskaż|wybierz)/i.test(q))return false;
  // Pytanie o znaczenie/synonim z wiersza musi miec potwierdzenie semantyczne.
  // Nie uznawaj z automatu, ze np. "tajniki" to "nauka o naturze".
  if(subject()==='polski'&&sourceQuestion(t)&&/(?:\boznacza\b|\boznaczają\b|\boznaczające\b|\bznaczy\b|\bsynonim\w*|to samo co|równoznacz\w*|innymi słowami)/i.test(q))return false;
  if(sourceQuestion(t)){
   const page=String(p.text||'');
   if(!visibleInText(page,t.answer))return false;
   const quote=String(t.sourceQuote||'').trim();
   if(quote&&(!visibleInText(page,quote)||!visibleInText(quote,t.answer)))return false;
   // Jednoznaczny wybór słowa Z TEKSTU: tylko jedna opcja może tam wystąpić.
   if(requiresChoices&&/(?:które|który|jaki|wskaż|wybierz).*\b(?:słowo|wyraz)\b.*\b(?:wiersza|wierszu|tekstu|tekście|czytanki)\b/i.test(q)){
    if(options.filter(x=>visibleInText(page,x)).length!==1)return false;
   }
  }
  return true;
 }
 function parse(raw){
  let s=typeof raw==='string'?raw:JSON.stringify(raw);s=s.replace(/```(?:json)?/gi,'').replace(/```/g,'').trim();
  let obj;try{obj=JSON.parse(s)}catch{const a=s.indexOf('{'),b=s.lastIndexOf('}');if(a<0||b<=a)throw Error('AI nie przesłało kompletnej odpowiedzi');try{obj=JSON.parse(s.slice(a,b+1))}catch{throw Error('AI zwróciło ucięte zadania')}}
  const arr=Array.isArray(obj)?obj:obj?.tasks;
  if(!Array.isArray(arr))throw Error('AI nie zwróciło listy zadań');
  const allowed=['choice','detective','loki','reading','order','dictation','syllables','crossword','listening','spelling','write','draw','wordsearch','safe','shop','clock','rebus'];
  const good=arr.filter(t=>t&&typeof t.question==='string'&&typeof t.answer==='string'&&Array.isArray(t.options)&&t.options.length===4&&t.options.every(x=>typeof x==='string'));
  if(!good.length)throw Error('AI nie przygotowało poprawnego zadania');
  return good.slice(0,10).map((t,i)=>({...t,explanation:t.explanation||'Sprawdź fragment w podręczniku.',hint:t.hint||'Przeczytaj uważnie jeszcze raz odpowiedni fragment.',type:allowed.includes(t.type)?t.type:'choice',done:false,correct:false}));
 }
 function pagePrompt(p,history=[]){
  const sub=subject(),level=childGrade==='P'?'przedszkole, bez czytania i pisania':'klasa '+String(childGrade).slice(0,8);
  const kinds=childGrade==='P'?'choice, listening':sub==='matematyka'?'choice, safe, shop, clock, write, order':sub==='angielski'?'listening, spelling, dictation, order, choice, write':sub==='przyroda'?'choice, detective, order':'detective, loki, syllables, order, dictation, write, choice';
  const language=sub==='angielski'?'Proste slowka dla poczatkujacego: question EN, questionPl PL, np. Write the word in English. / Napisz po angielsku: kurtka. answer=jacket, answerPl=kurtka. Nie definiuj odziezy, pogody, pierwszych liter ani dnia po innym dniu. Bez zagadek i niejednoznacznych uzupelnianek. answerPl to krotkie polskie znaczenie answer, wymagane w pisowni i wyborze slow. explanation i hint WYLACZNIE PO POLSKU. Typ listening/dictation tylko dla rzeczywistego sluchania; zwykle pisanie/type write i spelling BEZ audio. Bez czytania ze zrozumieniem.':'Polecenia po polsku; questionPl puste.';
  const base=`Jestes nauczycielem. Poziom: ${level}. Przedmiot: ${sub}. Utworz do 10 NOWYCH, roznorodnych zadan z materialu strony, kilka roznych typow: ${kinds}. Nie powtarzaj wciaz sylabowania ani slowa drugiej. ${language}
Kazde zadanie ma jedna MERYTORYCZNIE poprawna odpowiedz answer i 4 ROZNE opcje options; tylko jedna opcja jest rowna answer, pozostale musza byc naprawde bledne. Nie zgaduj faktow ani odpowiedzi dla wyrownania liczby zadan. Dopasuj zadania do przedmiotu: polski bez rachunkow, matematyka i przyroda bez gramatyki. Dla przedszkola tylko proste pojecia, wybor lub sluchanie.
Pytanie o tresc wiersza/opowiadania wymaga needsSource:true oraz sourceQuote: doslowny cytat do 100 znakow, ze strony i z podstawa odpowiedzi. Odpowiedz musi wystepowac w materiale w tej samej formie. Nie wymyslaj cytatow. Dla zadan o slowie podanym w poleceniu needsSource:false; jesli pytanie dotyczy slowa Z TEKSTU, cytat jest wymagany. Nie tworz niejednoznacznych pytan o synonimy; tajniki przyrody nie oznaczaja nauki o naturze. Nie zadawaj pytan o rz/ó itp. z kilkoma prawidlowymi opcjami. Nie zdradzaj odpowiedzi w pytaniu ani hint, takze przez odmiany lub wyrazy pokrewne.
Krzyzowki, wykreslanki i rebusy dodaje aplikacja jako pelne plansze; nie generuj ich nazw jako typu zadania bez planszy. Dla listening podaj audio do odsluchu. Zwroc TYLKO kompletny JSON: {"tasks":[{"type":"choice","question":"...","questionPl":"...","answer":"...","answerPl":"polskie znaczenie (angielski)","options":["...","...","...","..."],"needsSource":false,"sourceQuote":"","hint":"wskazowka o sposobie rozwiazania bez odpowiedzi","explanation":"...","audio":""}]}.`;
  const tail='\nSTRONA '+String(p.number).slice(0,12)+', MATERIAL: '+String(p.text||'').slice(0,2400),prefix='\nNIE POWTARZAJ: ';
  const room=Math.max(0,5300-base.length-tail.length-prefix.length-4);
  const excluded=history.slice(-24).map(q=>String(q).slice(0,60)).join(' | ').slice(0,room);
  return base+prefix+(excluded||'brak')+tail;
 }

 const vowelsPL='aąeęiouóy';
 const lettersOnly=x=>String(x||'').toLocaleLowerCase('pl-PL').replace(/[^a-ząćęłńóśźż]/g,'');
 const lettersMatch=(a,b)=>lettersOnly(a)===lettersOnly(b);
 const curriculumKey=(t=null)=>`academy-v53-stats-${child}-${t?.sourceBookId||bookId}`;
 function stats(t=null){try{return JSON.parse(localStorage.getItem(curriculumKey(t))||'[]')}catch{return []}}
 function logDifficulty(t,reason){
  try{const v=stats(t);v.push({date:new Date().toISOString(),page:t.pageNumber||'',type:t.type,question:t.question,reason,attempts:wrongAttempts,subject:subject(t)});localStorage.setItem(curriculumKey(t),JSON.stringify(v.slice(-400)))}catch(e){console.warn(e)}
 }
 function pageText(t){const p=pages.find(p=>t.sourcePageId&&String(p.id)===String(t.sourcePageId))||pages.find(p=>p.bookId===(t.sourceBookId||bookId)&&Number(p.number)===Number(t.pageNumber));return String(p?.text||t.passage||'').slice(0,4000)}
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
  party();if(localStorage.getItem('academy-v72-training-silent')==='1')return;
  try{const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;const c=new AC();
   [523,659,784,1047].forEach((f,i)=>{const osc=c.createOscillator(),gain=c.createGain();const st=c.currentTime+i*.13;
    osc.type='sine';osc.frequency.value=f;gain.gain.setValueAtTime(.0001,st);gain.gain.exponentialRampToValueAtTime(.06,st+.025);
    gain.gain.exponentialRampToValueAtTime(.0001,st+.2);osc.connect(gain);gain.connect(c.destination);
    osc.start(st);osc.stop(st+.22);});setTimeout(()=>c.close(),1300)
  }catch(e){console.warn('Fanfara niedostępna')}
 }
 function spokenWords(text){return (String(text||'').toLocaleLowerCase('pl-PL').match(/[a-ząćęłńóśźż]+/g)||[])}
 function readingWord(word){return String(word).toLocaleLowerCase('pl-PL').replace(/ł/g,'l').normalize('NFD').replace(/[\u0300-\u036f]/g,'')}
 function speechClose(a,b){
  if(a===b)return true;
  const x=readingWord(a),y=readingWord(b);
  if(x===y)return true;
  if(Math.min(x.length,y.length)<5||Math.abs(x.length-y.length)>1)return false;
  // Jedna literówka w dłuższym wyrazie: błędy rozpoznawania, nie dowolna odpowiedź.
  let i=0,j=0,changes=0;
  while(i<x.length&&j<y.length){
   if(x[i]===y[j]){i++;j++;continue}
   if(++changes>1)return false;
   if(x.length>y.length)i++;else if(y.length>x.length)j++;else{i++;j++}
  }
  return changes+((i<x.length||j<y.length)?1:0)<=1;
 }
 function readingCoverage(sourceText,spokenText){
  const expected=spokenWords(sourceText),spoken=spokenWords(spokenText);
  const len=expected.length;
  if(!len)return {score:0,hits:0,total:0,heard:spoken.length,matched:[]};
  // Dynamiczne dopasowanie kolejności. Nie zatrzymuje się po trzech źle rozpoznanych
  // słowach i nie zalicza tekstu czytanego na wyrywki jako całego fragmentu.
  let previous=new Uint16Array(len+1);
  for(const heard of spoken){
   const next=new Uint16Array(len+1);
   for(let i=1;i<=len;i++){
    next[i]=speechClose(heard,expected[i-1])?previous[i-1]+1:Math.max(next[i-1],previous[i]);
   }
   previous=next;
  }
  const hits=previous[len];
  return {score:Math.round(100*hits/Math.max(len,spoken.length)),hits,total:len,heard:spoken.length,matched:[]};
 }
 function miniCoverage(sourceText,spokenText){
  const expected=spokenWords(sourceText),spoken=spokenWords(spokenText);
  let hits=0;
  for(const word of spoken){
   if(hits>=expected.length)break;
   if(speechClose(word,expected[hits]))hits++;
  }
  return {score:Math.round(100*hits/Math.max(1,expected.length)),hits,total:expected.length,heard:spoken.length,matched:expected.map((_,i)=>i<hits)};
 }
 // V64: bezpieczne, różnorodne ćwiczenia ortograficzne (po jednej poprawnej wersji).
 function makeSafeSpelling(p){
  if(subject()!=='polski')return null;
  // Sprawdzone przykłady; jedna dobra pisownia i trzy błędne warianty.
  const examples=[
   ['ogród',['ogród','ogrut','ogrod','ogródt']],
   ['róża',['róża','ruża','róza','rurza']],
   ['rzeka',['rzeka','żeka','rzęka','rzegka']],
   ['drzewo',['drzewo','dżewo','dzrewo','drzewwo']],
   ['król',['król','krul','króll','krol']],
   ['góra',['góra','gura','góóra','gora']],
   ['żaba',['żaba','rzaba','żabba','zaba']],
   ['chleb',['chleb','hleb','chlepp','chlep']],
   ['książka',['książka','ksiąszka','ksiąrzka','ksionżka']],
   ['pszczoła',['pszczoła','pszcoła','pszczuła','pszczołła']],
   ['mróz',['mróz','mruz','mrós','mrurz']],
   ['pióro',['pióro','piuro','piórro','pjoro']],
   ['szkoła',['szkoła','szkuła','skzoła','szkola']],
   ['jabłko',['jabłko','jabko','japłko','jabłkko']],
   ['wóz',['wóz','wuz','wózz','woz']],
   ['jaskółka',['jaskółka','jaskułka','jaskólka','jaskółkka']],
   ['burza',['burza','bórza','burża','buża']],
   ['wróbel',['wróbel','wrubel','wróbell','wrubell']],
   ['żółw',['żółw','rzółw','żulw','żółf']],
   ['przyjaciel',['przyjaciel','pszyjaciel','przyjacjel','pszyjacjel']],
   ['nożyczki',['nożyczki','nozyczki','norzyczki','nożyczkki']],
   ['chmura',['chmura','hmura','chmóra','chmurra']],
   ['bohater',['bohater','bochater','bohatter','bochatter']],
   ['herbata',['herbata','cherbata','herbada','cherbada']],
   ['kalendarz',['kalendarz','kalendaż','kalędarz','kalędaż']],
   ['rzodkiewka',['rzodkiewka','żodkiewka','rzotkiewka','żotkiewka']],
   ['słońce',['słońce','słonce','słończe','słonće']],
   ['stróż',['stróż','strurz','strósz','strusż']],
   ['półka',['półka','pułka','półkka','pułkka']],
   ['chrząszcz',['chrząszcz','hrząszcz','chsząszcz','chżąszcz']],
   ['drużyna',['drużyna','drurzyna','drużinna','drużena']],
   ['żuraw',['żuraw','rzuraw','żóraw','rzóraw']],
   ['krzesło',['krzesło','kżesło','krzesłoł','kżeśło']],
   ['wiewiórka',['wiewiórka','wiewiurka','wiewiórrka','wiewiórkaa']],
   ['papużka',['papużka','papórzka','papuszka','papużkka']],
   ['ogórek',['ogórek','ogurek','ogóreck','ogórrek']],
   ['puchar',['puchar','puhar','póchar','pucharr']],
   ['maluch',['maluch','maluh','malóch','malluch']],
   ['orzech',['orzech','ożech','orzeg','ożeg']],
   ['grzyb',['grzyb','gżyb','grzyp','grzybb']],
   ['lekarz',['lekarz','lekaż','lekarż','lekasz']],
   ['rowerzysta',['rowerzysta','roweżysta','rowerżysta','rowerzyssta']],
   ['mucha',['mucha','muha','mócha','muchha']],
   ['wieża',['wieża','wierza','wieza','wierża']],
   ['płótno',['płótno','płutno','płotno','płótnno']],
   ['siódemka',['siódemka','siudemka','siódemkka','siodemka']],
   ['błyskawica',['błyskawica','błyskawicaa','błyskawitsa','błyskavica']],
   ['podróż',['podróż','podrurz','podróżż','podruż']],
   ['wschód',['wschód','wshód','wschud','wschódd']]
  ];
  const key=`academy-v64-spelling-${child}-${bookId}`;
  let n=0;
  try{n=Number(localStorage.getItem(key)||0);localStorage.setItem(key,String(n+1))}catch(e){}
  const item=examples[n%examples.length];
  const prompts=[
   '✍️ Wskaż poprawną pisownię wyrazu.',
   '✍️ Który zapis wyrazu jest poprawny?',
   '✍️ Wybierz poprawnie zapisany wyraz.'
  ];
  return {type:'choice',question:prompts[n%prompts.length],
   answer:item[0],options:shuffle([...item[1]]),
   hint:'Przeczytaj uważnie każdą propozycję. Tylko jedna ma poprawną pisownię.',
   explanation:'Poprawna pisownia: '+item[0]+'.',needsSource:false,
   pageNumber:p.number,done:false,correct:false};
 }
 function makeMiniReading(p){
  if(subject()!=='polski')return null;
  // Krótkie, pełne zdania do ćwiczenia płynnego czytania, niezależne od czytanki.
  const sentences=[
   'Ala czyta nową książkę.','Mały lis biegnie szybko.','Olek lubi czerwone jabłka.',
   'Zosia rysuje piękny dom.','Wesoły pies goni piłkę.','Dzieci obserwują kolorowe motyle.',
   'Rano świeci jasne słońce.','Paweł buduje wielką rakietę.','Babcia podlewa zielone kwiaty.',
   'Złoty smok pilnuje skarbu.','Mądra sowa siedzi cicho.','Bohater znajduje stary klucz.',
   'Kotek śpi na poduszce.','Tomek maluje niebieski statek.','Wiewiórka zbiera małe orzechy.',
   'Kasia pisze krótkie zdanie.','Dzielny rycerz otwiera bramę.','Ptaki śpiewają piękną melodię.'
  ];
  const key=`academy-v60-mini-${child}-${bookId}`;
  let n=0;try{n=Number(localStorage.getItem(key)||0);localStorage.setItem(key,String(n+1))}catch{}
  const passage=sentences[n%sentences.length];
  return {type:'reading-mini',question:'🎙️ Przeczytaj kolejno podświetlane słowa.',passage,answer:'Przeczytane',options:[],pageNumber:p.number,done:false,correct:false,readProgress:0};
 }
 function sayFeedback(message){if(task()?.vocab76&&task().correct){const t=task();return speakSequence([{text:'Brawo! Dobra odpowiedź.',lang:'pl-PL',rate:.92},{text:t.audio||t.wordEn,lang:'en-US',rate:.72},{text:t.type==='vocab-reading'?'':t.promptPl,lang:'pl-PL',rate:.92}])}try{speak(String(message).replace(/[\*#_`]/g,''),'pl-PL')}catch(e){console.warn('Mowa niedostępna',e)}}
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
  const words=(subject()==='angielski'?vocabulary76(p.text).map(x=>x.en):wordPieces(p.text)).filter(w=>w.length>=3&&w.length<=8);
  const extra=subject()==='matematyka'?['dodaj','liczba','wynik','zegar','linia','figura','trójkąt','kwadrat']:subject()==='angielski'?['apple','flower','water','school','pencil','yellow','green','friend']:['kropka','wyrazy','zdanie','sylaba','książka','literki','wiersze','pytanie','wyraz','czytanie'];
  const pool=[...new Set([...words,...(subject()==='angielski'?[]:extra)])].filter(w=>[...w].length<=7);
  if(pool.length<6)return null;
  const key=`academy-v59-wordsearch-${child}-${bookId}-${p.number}`;
  let n=0;try{n=Number(localStorage.getItem(key)||0)}catch{}
  const sorted=shuffle(pool).sort((a,b)=>((pool.indexOf(a)+n*7)%pool.length)-((pool.indexOf(b)+n*7)%pool.length));
  const chosen=sorted.slice(0,6);
  try{localStorage.setItem(key,String(n+1))}catch{}
  return {type:'wordsearch',question:'🔎 Znajdź 6 słów. Szukaj poziomo i pionowo.',answer:chosen.join(', '),words:chosen,pageNumber:p.number,options:[],hint:'Zacznij od pierwszej litery i zaznaczaj kolejne.',done:false,correct:false};
 }
 function initWordGrid(t){
  const size=10,abc=subject(t)==='angielski'?'ABCDEFGHIJKLMNOPQRSTUVWXYZ':'AĄBCĆDEĘFGHIJKLŁMNŃOÓPRSŚTUWYZŹŻ';
  // Sześć słów w zwartej siatce 10x10; słowa mogą się przecinać wspólną literą.
  const words=(t.words||[]).slice(0,6);
  let grid,placed;
  // W rzadkim nieudanym układzie spróbuj jeszcze raz, nie gub słów.
  for(let attempt=0;attempt<120;attempt++){
   grid=Array.from({length:size},()=>Array(size).fill(''));placed=[];
   for(let k=0;k<words.length;k++){
   const word=words[k],letters=[...word.toUpperCase()],vertical=k%2===1;
   const candidates=[];
   for(let row=0;row<size;row++)for(let col=0;col<size;col++){
    if(row+(vertical?letters.length:1)>size||col+(vertical?1:letters.length)>size)continue;
    let intersections=0,possible=true;
    for(let i=0;i<letters.length;i++){
     const old=grid[row+(vertical?i:0)][col+(vertical?0:i)];
     if(old&&old!==letters[i]){possible=false;break}
     if(old)intersections++;
    }
    if(possible)candidates.push({row,col,score:intersections*20+Math.random()*5});
   }
   if(!candidates.length)continue;
   candidates.sort((a,b)=>b.score-a.score);
   const at=candidates[0];
   letters.forEach((ch,i)=>{grid[at.row+(vertical?i:0)][at.col+(vertical?0:i)]=ch});
   placed.push({word,row:at.row,col:at.col,dir:vertical?'v':'h',found:false});
   }
   if(placed.length===words.length)break;
  }
  if(placed.length!==words.length){
   grid=Array.from({length:size},()=>Array(size).fill(''));placed=[];
   words.forEach((word,i)=>{const chars=[...word.toUpperCase()];const row=i*1+(i>=3?2:0);chars.forEach((ch,j)=>grid[row][j]=ch);placed.push({word,row,col:0,dir:'h',found:false})});
  }
  grid.forEach(row=>row.forEach((x,i)=>{if(!x)row[i]=abc[Math.floor(Math.random()*abc.length)]}));
  t.words=placed.map(x=>x.word);t.placements=placed;t.grid=grid;t.picked=[];
 }
 function wordCell(p,i){return [p.row+(p.dir==='v'?i:0),p.col+(p.dir==='v'?0:i)]}
 function makeCrossword(p){
  if(subject()==='angielski')return v76EnglishCrossword(p);
  // Większa pula haseł końcowych; 19 edukacyjnych, co 20. — Avengers.
  const polish=[
   ['rzeczownik','Jak nazywa się część mowy odpowiadająca na pytania kto? co?'],
   ['czasownik','Jaka część mowy nazywa czynności, np. pisze, śpi, biega?'],
   ['przymiotnik','Jaka część mowy określa cechy, np. miły, zielona, duże?'],
   ['litera','Jak nazywa się jeden znak alfabetu?'],
   ['litery','Z czego składają się zapisane wyrazy? Wpisz liczbę mnogą.'],
   ['wyraz','Jak inaczej można nazwać zapisane słowo?'],
   ['słowo','Jak inaczej można nazwać wyraz?'],
   ['zdanie','Jak nazywa się wypowiedź rozpoczynana wielką literą i kończona znakiem interpunkcyjnym?'],
   ['kropka','Jakim znakiem kończymy zwykłe zdanie oznajmujące?'],
   ['przecinek','Jaki znak oddziela elementy wyliczenia, np. kot, pies, koń?'],
   ['pytajnik','Jaki znak stawiamy na końcu zdania pytającego?'],
   ['wykrzyknik','Jaki znak kończy zdanie wykrzyknikowe?'],
   ['dwukropek','Jaki znak składa się z dwóch kropek ustawionych jedna nad drugą?'],
   ['myślnik','Jak nazywa się długa kreska rozpoczynająca wypowiedź bohatera w dialogu?'],
   ['sylaba','Jak nazywa się część wyrazu, którą możemy wyklaskać?'],
   ['samogłoska','Jak nazywa się głoska taka jak a, e, i, o, u?'],
   ['spółgłoska','Jak nazywa się głoska taka jak b, p, t, m?'],
   ['głoska','Jak nazywa się pojedynczy dźwięk mowy?'],
   ['alfabet','Jak nazywa się uporządkowany zbiór liter?'],
   ['tytuł','Jak nazywa się nazwa książki widoczna na jej okładce?'],
   ['autor','Jak nazywa się osoba, która napisała książkę?'],
   ['wiersz','Jak nazywa się utwór poetycki zapisany w wersach?'],
   ['wers','Jak nazywa się pojedyncza linijka wiersza?'],
   ['rym','Jak nazywa się podobne zakończenie wyrazów w wierszu?'],
   ['bajka','Jak nazywa się opowieść, często z morałem i mówiącymi zwierzętami?'],
   ['baśń','Jak nazywa się opowieść z czarami i magicznymi postaciami?'],
   ['akapit','Jak nazywa się część tekstu rozpoczynana od nowej linijki?'],
   ['książka','Co ma strony, okładkę i tekst do czytania?'],
   ['biblioteka','Gdzie można wypożyczać książki?'],
   ['czytelnik','Jak nazywa się osoba czytająca książkę?'],
   ['okładka','Jak nazywa się zewnętrzna osłona książki?'],
   ['pisownia','Jak nazywamy sposób zapisywania słów?'],
   ['ortografia','Jak nazywają się zasady poprawnego zapisywania wyrazów?'],
   ['dyktando','Jak nazywa się ćwiczenie polegające na zapisaniu usłyszanych słów?'],
   ['dialog','Jak nazywa się rozmowa co najmniej dwóch osób w opowiadaniu?'],
   ['opis','Jak nazywa się tekst przedstawiający wygląd osoby lub przedmiotu?'],
   ['słownik','W jakiej książce sprawdzamy znaczenie wyrazów?'],
   ['język','Czym poruszamy w ustach podczas mówienia?'],
   ['głos','Co wydajemy podczas mówienia lub śpiewania?'],
   ['piórnik','W czym uczeń przechowuje ołówki i długopisy?'],
   ['zeszyt','W czym uczeń zapisuje notatki podczas lekcji?'],
   ['linijka','Czym mierzymy długość kreski w zeszycie?'],
   ['przerwa','Jak nazywa się odpoczynek między lekcjami?'],
   ['odpowiedź','Co podajemy, gdy ktoś zada nam pytanie?'],
   ['pytanie','Jak nazywa się wypowiedź, na którą oczekujemy odpowiedzi?'],
   ['wielka','Jaką literą zapisujemy pierwszą literę imienia: małą czy wielką?'],
   ['mała','Jaką literą zwykle zaczynamy rzeczownik pospolity w środku zdania?'],
   ['imię','Jak nazywa się osobista nazwa człowieka, np. Paweł?'],
   ['czytanie','Jak nazywa się rozpoznawanie zapisanych wyrazów i zdań?'],
   ['literki','Jak pieszczotliwie nazywamy małe litery alfabetu?']
  ];
  const maths=[
   ['dodawanie','Jak nazywa się działanie ze znakiem plus?'],
   ['odejmowanie','Jak nazywa się działanie ze znakiem minus?'],
   ['suma','Jak nazywa się wynik dodawania?'],
   ['różnica','Jak nazywa się wynik odejmowania?'],
   ['jeden','Zapisz słownie wynik: trzy minus dwa.'],['dwa','Zapisz słownie wynik: jeden plus jeden.'],
   ['trzy','Zapisz słownie wynik: jeden plus dwa.'],['cztery','Zapisz słownie wynik: dwa plus dwa.'],
   ['pięć','Zapisz słownie wynik: dwa plus trzy.'],['sześć','Zapisz słownie wynik: trzy plus trzy.'],
   ['siedem','Zapisz słownie wynik: cztery plus trzy.'],['osiem','Zapisz słownie wynik: cztery plus cztery.'],
   ['dziewięć','Zapisz słownie wynik: pięć plus cztery.'],['dziesięć','Zapisz słownie wynik: pięć plus pięć.'],
   ['zegar','Co pokazuje godziny i minuty?'],['minuta','Jaka jednostka czasu ma 60 sekund?'],
   ['godzina','Jaka jednostka czasu ma 60 minut?'],['metr','Jaka jednostka długości ma 100 centymetrów?'],
   ['kwadrat','Jaka figura ma cztery równe boki i kąty proste?'],
   ['trójkąt','Jaka figura ma trzy boki?'],['koło','Jaka płaska figura jest okrągła i nie ma kątów?'],
   ['prosta','Jak nazywa się linia, która nie jest krzywa?'],
   ['cyfra','Jak nazywa się jeden ze znaków od 0 do 9?'],
   ['liczba','Co zapisujemy za pomocą cyfr?'],
   ['parzysta','Jaka jest liczba dwa: parzysta czy nieparzysta?'],
   ['zero','Zapisz słownie wynik: pięć minus pięć.'],
   ['linijka','Czym mierzymy długość odcinka w zeszycie?'],
   ['długość','Co mierzymy w centymetrach lub metrach?']
  ];
  const english=[
   ['cat','Jak po angielsku napisać kot?'],['dog','Jak po angielsku napisać pies?'],
   ['sun','Jak po angielsku napisać słońce?'],['book','Jak po angielsku napisać książka?'],
   ['fish','Jak po angielsku napisać ryba?'],['bird','Jak po angielsku napisać ptak?'],
   ['water','Jak po angielsku napisać woda?'],['green','Jak po angielsku napisać zielony?'],
   ['red','Jak po angielsku napisać czerwony?'],['blue','Jak po angielsku napisać niebieski?'],
   ['hello','Jak po angielsku napisać cześć?'],['tree','Jak po angielsku napisać drzewo?'],
   ['apple','Jak po angielsku napisać jabłko?'],['milk','Jak po angielsku napisać mleko?'],
   ['one','Jak po angielsku napisać jeden?'],['two','Jak po angielsku napisać dwa?'],
   ['three','Jak po angielsku napisać trzy?'],['four','Jak po angielsku napisać cztery?'],
   ['five','Jak po angielsku napisać pięć?'],['star','Jak po angielsku napisać gwiazda?'],
   ['moon','Jak po angielsku napisać księżyc?'],['school','Jak po angielsku napisać szkoła?'],
   ['small','Jak po angielsku napisać mały?'],['big','Jak po angielsku napisać duży?'],
   ['yellow','Jak po angielsku napisać żółty?'],['white','Jak po angielsku napisać biały?'],
   ['black','Jak po angielsku napisać czarny?']
  ];
  const knowledge=subject()==='matematyka'?maths:subject()==='angielski'?english:polish;
  const educational=[
   ['przyroda','Przyroda to świat roślin, zwierząt i zjawisk naturalnych.'],
   ['alfabet','Alfabet to uporządkowany zbiór liter.'],
   ['wiedza','Wiedza to informacje zdobyte podczas nauki.'],
   ['odwaga','Odwaga pomaga działać pomimo strachu.'],
   ['kometa','Kometa to ciało niebieskie, które może mieć jasny warkocz.'],
   ['planeta','Planeta krąży wokół gwiazdy.'],
   ['tęcza','Tęcza powstaje, gdy światło rozdziela się na barwy.'],
   ['książka','Książka umożliwia poznawanie nowych historii i wiadomości.'],
   ['przygoda','Przygoda to niezwykłe wydarzenie.'],
   ['rakieta','Rakieta może wynosić pojazdy w przestrzeń kosmiczną.'],
   ['muzyka','Muzyka łączy dźwięki i rytmy.'],
   ['kosmos','Kosmos to przestrzeń obejmująca gwiazdy i planety.'],
   ['robot','Robot to maszyna wykonująca zaprogramowane zadania.'],
   ['magnes','Magnes przyciąga niektóre metale, np. żelazo.'],
   ['szkoła','W szkole uczymy się i spotykamy koleżanki oraz kolegów.'],
   ['pamięć','Pamięć pozwala zachowywać i przypominać sobie informacje.'],
   ['odkrywca','Odkrywca poznaje rzeczy i miejsca dotąd nieznane.'],
   ['biblioteka','Biblioteka udostępnia książki czytelnikom.'],
   ['słownik','Słownik pomaga sprawdzać znaczenia i pisownię słów.'],
   ['ocean','Ocean to bardzo rozległy zbiornik słonej wody.'],
   ['ortografia','Ortografia to zasady poprawnego pisania.'],
   ['samogłoska','Samogłoski mogą samodzielnie tworzyć sylaby.'],
   ['przyjaźń','Przyjaźń opiera się między innymi na zaufaniu.'],
   ['czasownik','Czasownik nazywa czynność lub stan.'],
   ['życzliwość','Życzliwość to przyjazne traktowanie innych.'],
   ['wiersz','Wiersz to utwór zapisany w wersach.'],
   ['język','Język pomaga ludziom przekazywać myśli.'],
   ['zagadki','Zagadki pomagają ćwiczyć myślenie.'],
   ['dzielność','Dzielność to odwaga w działaniu.']
  ];
  const heroes=[
   ['mjolnir','Mjolnir to młot Thora.'],
   ['wakanda','Wakanda to fikcyjna ojczyzna Czarnej Pantery.'],
   ['groot','Groot to bohater Strażników Galaktyki.'],
   ['stark','Tony Stark zbudował zbroję Iron Mana.'],
   ['tarcza','Tarcza to znak rozpoznawczy Kapitana Ameryki.']
  ];
  const englishSecrets=[['school','School znaczy szkoła.'],['friend','Friend to przyjaciel.'],['water','Water znaczy woda.'],['yellow','Yellow znaczy żółty.'],['green','Green znaczy zielony.'],['apple','Apple to jabłko.'],['planet','Planet znaczy planeta.'],['groot','Groot to bohater Strażników Galaktyki.']];
  const key=`academy-v61-cross-${child}-${bookId}-${subject()}`;
  let state={runs:0,secretHistory:[],wordHistory:[]};
  try{const got=JSON.parse(localStorage.getItem(key)||'null');if(got&&Array.isArray(got.secretHistory))state={...state,...got}}catch{}
  const n=Number(state.runs)||0;
  const entries=subject()==='angielski'?englishSecrets:(n%20===19?[...heroes,...educational]:[...educational,...heroes]);
  // Najpierw sekret, którego nie było w ostatnich kilkunastu krzyżówkach.
  const ordered=entries.map((entry,i)=>({entry,score:(state.secretHistory.slice(-12).includes(entry[0])?100:0)+state.secretHistory.filter(x=>x===entry[0]).length*12+(subject()!=='angielski'&&(n%20===19?!heroes.some(h=>h[0]===entry[0]):heroes.some(h=>h[0]===entry[0]))?60:0)+(i+n*7)%entries.length/100}));
  ordered.sort((a,b)=>a.score-b.score);
  for(const {entry:[secret,info]} of ordered){
   const used=new Set(),answers=[];
   let valid=true;
   for(const [i,letter] of [...secret].entries()){
    const options=knowledge.filter(([w])=>[...w].includes(letter)&&!used.has(w));
    if(!options.length){valid=false;break}
    options.sort((a,b)=>{
     const score=w=>(state.wordHistory.slice(-30).includes(w)?50:0)+Math.max(0,[...w].length-9)*3;
     return score(a[0])-score(b[0])||((i+n+[...a[0]].length)%7)-((i+n+[...b[0]].length)%7);
    });
    const [word,clue]=options[0];used.add(word);
    const variants={
     rzeczownik:['Jak nazywa się część mowy odpowiadająca na pytania kto? co?','Która część mowy nazywa ludzi, zwierzęta i przedmioty?'],
     czasownik:['Jaka część mowy mówi, co ktoś robi?','Którą częścią mowy jest słowo „biegnie”?'],
     sylaba:['Jak nazywa się część wyrazu, którą możemy wyklaskać?','Na jakie części dzielimy wyraz podczas sylabowania?'],
     litery:['Jak nazywamy znaki alfabetu występujące w wyrazach?','Wyraz „dom” jest zapisany za pomocą trzech… Czego?'],
     kropka:['Jakim znakiem kończymy zdanie oznajmujące?','Jaki znak postawisz po zdaniu „Ala ma kota”?'],
     wyraz:['Jak inaczej można nazwać zapisane słowo?','Czego kilka można ułożyć w zdanie? Wpisz liczbę pojedynczą.'],
     zdanie:['Co rozpoczyna się wielką literą i kończy kropką?','Jak nazywa się wypowiedź „Ala ma kota.”?']
    };
    const choices=variants[word]||[clue];
    answers.push({word,index:[...word].indexOf(letter),clue:choices[(n+i)%choices.length]});
   }
   if(!valid||answers.length!==[...secret].length)continue;
   const left=Math.max(...answers.map(e=>e.index));
   const width=Math.max(...answers.map(e=>left-e.index+[...e.word].length));
   const grid=answers.map((e,row)=>Array.from({length:width},(_,col)=>{
    const at=col-(left-e.index),chars=[...e.word];
    return at>=0&&at<chars.length?{letter:chars[at],cross:col===left,row,col}:null;
   }));
   state.runs=n+1;
   state.secretHistory=[...state.secretHistory,secret].slice(-40);
   state.wordHistory=[...state.wordHistory,...answers.map(x=>x.word)].slice(-70);
   try{localStorage.setItem(key,JSON.stringify(state))}catch{}
   return {type:'crossword',question:'📝 Krzyżówka wiedzy. Rozwiąż zagadki i odkryj hasło końcowe.',answer:secret,crossInfo:info,crossWords:answers,crossGrid:grid,crossColumn:left,crossTyped:answers.map(() => ''),pageNumber:p.number,options:[],done:false,correct:false};
  }
  return null;
 }
 function makeRebus(p){
  if(subject()!=='polski')return null;
  const examples=[
   {picture:'🦊',operation:'🦊 + T',answer:'LIST',tip:'Nazwij zwierzę na obrazku. Dopisz literę T.'},
   {picture:'🐈',operation:'🐈 − T + RA',answer:'KORA',tip:'Nazwij zwierzę. Usuń wskazaną literę i dopisz dwie nowe.'},
   {picture:'🌲',operation:'🌲 + KA',answer:'LASKA',tip:'Połącz nazwę miejsca z dwiema literami.'},
   {picture:'🐮',operation:'🐮 − WA + K',answer:'KROK',tip:'Usuń dwie litery z końca nazwy zwierzęcia, a potem dodaj K.'},
   {picture:'🐟',operation:'🐟 − BA + SUNEK',answer:'RYSUNEK',tip:'W nazwie zwierzęcia zastąp końcówkę nowymi literami.'},
   {picture:'🐈',operation:'MA + 🐈 − OT',answer:'MAK',tip:'Z nazwy zwierzęcia zostaw tylko pierwszą literę, a potem połącz ją z MA.'},
   {picture:'🐈',operation:'🐈 + EK',answer:'KOTEK',tip:'Do nazwy zwierzęcia dodaj dwie litery.'},
   {picture:'🌲',operation:'🌲 − S + WA',answer:'LAWA',tip:'Usuń ostatnią literę nazwy miejsca i dopisz WA.'},
   {picture:'🐟',operation:'🐟 − A + AK',answer:'RYBAK',tip:'Usuń ostatnią literę i zastąp ją dwiema nowymi.'}
  ];
  const key=`academy-v59-rebus-${child}-${bookId}`;
  let n=0;try{n=Number(localStorage.getItem(key)||0)}catch{}
  const ex=examples[n%examples.length];try{localStorage.setItem(key,String(n+1))}catch{}
  return {type:'rebus',question:'🧩 Rebus Avengersów: jakie słowo powstanie?',rebus:ex.operation,rebusPicture:ex.picture,rebusHint:ex.tip,answer:ex.answer.toLocaleLowerCase('pl-PL'),options:[],hint:ex.tip,pageNumber:p.number,done:false,correct:false};
 }
 function makeMemory(p){
  // 12 kart (6 par). Na zmianę: słowo-słowo oraz obrazek-słowo.
  const gallery=[['🐝','pszczoła'],['🌹','róża'],['🐟','ryba'],['🐈','kot'],['🐄','krowa'],['🌳','drzewo'],['🐻','niedźwiedź'],['🏠','dom'],['☀️','słońce'],['🚂','pociąg'],['🐸','żaba'],['🐘','słoń'],['🦊','lis'],['🌼','kwiat']];
  const subjects=subject()==='matematyka'?['dodawanie','liczba','kwadrat','trójkąt','zegar','wynik','godzina','minuta','figura','linijka']:subject()==='angielski'?['apple','school','yellow','green','water','cat','book','red','blue','tree']:['sylaba','litera','zdanie','kropka','wyraz','alfabet','wiersz','głoska','książka','czytanie'];
  const source=(subject()==='angielski'?vocabulary76(p.text).map(x=>x.en):wordPieces(p.text)).filter(w=>[...w].length>=3&&[...w].length<=10);
  const pool=[...new Set([...source,...(subject()==='angielski'?[]:subjects)])];
  const key=`academy-v60-memory-${child}-${bookId}`;let n=0;
  try{n=Number(localStorage.getItem(key)||0);localStorage.setItem(key,String(n+1))}catch{}
  const pictures=subject()==='polski'&&n%3===1;
  let pairs;
  if(pictures){
   const choices=[...gallery.slice(n%gallery.length),...gallery.slice(0,n%gallery.length)].slice(0,6);
   pairs=choices.map(([emoji,word])=>({front:emoji,back:word}));
  }else{
   const choices=[...pool.slice(n%Math.max(1,pool.length)),...pool.slice(0,n%Math.max(1,pool.length))].slice(0,6);
   if(choices.length<6)return null;
   pairs=choices.map(word=>({front:word,back:subject()==='angielski'?(vocabulary76(p.text).find(x=>x.en===word)?.pl||word):word}));
  }
  const cards=shuffle(pairs.flatMap((entry,i)=>[{pair:i,label:entry.front},{pair:i,label:entry.back}]));
  return {type:'memory',question:pictures?'🃏 Memory: połącz obrazki z nazwami.':'🃏 Memory: znajdź sześć par słów.',answer:'Wszystkie pary',options:[],cards,matched:[],flipped:[],pageNumber:p.number,done:false,correct:false};
 }
 function alphabeticOrderTask(t){
  return t.type==='order' && /alfabetyczn/i.test(String(t.question||'')) && /liter/i.test(String(t.question||''));
 }
 function makePuzzle(p){
  const sentence=String(p.text||'').split(/(?<=[.!?])\s+/).find(x=>x.trim().split(/\s+/).length>=4&&x.trim().split(/\s+/).length<=9&&(subject()!=='angielski'||!/[ąćęłńóśźż]|\b(?:wybierz|ułóż|zapisz|strona|podręcznik)\b/i.test(x)));
  if(!sentence)return null;
  return {type:'order',question:'Ułóż wyrazy w zdanie.',answer:sentence.trim(),options:[],pageNumber:p.number,hint:'Zacznij od wyrazu pisanego wielką literą.',done:false,correct:false};
 }
 function makeAdjective(p){
  if(subject()!=='polski')return null;
  const forms=new Set(['mały','mała','małe','małego','małej','duży','duża','duże','dużego','dużej','dobry','dobra','dobre','dobrego','dobrej','piękny','piękna','piękne','pięknego','pięknej','zielony','zielona','zielone','zielonego','zielonej','nowy','nowa','nowe','nowego','nowej','stary','stara','stare','starego','starej','drugi','druga','drugie','drugiego','drugiej','pierwszy','pierwsza','pierwsze','pierwszej']);
  const sentences=String(p.text||'').split(/(?<=[.!?])\s+/);
  const candidates=sentences.map(sentence=>({sentence,found:(sentence.match(/[A-Za-zĄĆĘŁŃÓŚŹŻąćęłńóśźż]+/g)||[]).map(w=>w.toLocaleLowerCase('pl-PL')).filter(w=>forms.has(w))})).filter(x=>x.found.length===1);
  if(!candidates.length)return null;
  const x=candidates[Math.floor(Math.random()*candidates.length)];
  return {type:'write',question:'🎨 Znajdź przymiotnik w zdaniu: „'+x.sentence.trim()+'”',answer:x.found[0],pageNumber:p.number,options:[],hint:'Przymiotnik odpowiada na pytanie: jaki? jaka? jakie?',done:false,correct:false};
 }
 function answerIsCorrect(t,value){
  if(t.vocab76&&t.type!=='vocab-meaning')return cleanEnglish76(value)===cleanEnglish76(t.answer);
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
  if(v76VocabOnly)return v76StartVocabulary();
  if(busy)return;
  stageEpoch++;tutorBusy=false;
  const ps=scopePages();if(!ps.length){alert('Wybierz strony z rozpoznanym tekstem.');return setup()}
  busy=true;root.innerHTML='<section class="mg-panel"><h2>🦸 Przygotowuję nowe wyzwania...</h2><p>Wczytuję zapisane pytania i gry. Nie musisz czekać na odczyt całego podręcznika.</p><p id="mg-load-progress" role="status">Otwieram materiał…</p></section>';
  try{
   const prepareEpoch=stageEpoch;await v774PrepareScope(ps);if(!root.isConnected||stageEpoch!==prepareEpoch)return;
   if(childGrade!=='P'){const prepared=v773BuildMission(ps);if(prepared.length){tasks=prepared;idx=0;points=0;award=false;reset();remember();draw();return;}}
   const all=[],errors=[];
   // Jedna porcja materialu na misje, kolejne uruchomienia przechodza po wszystkich stronach.
   const rotationId=String(child)+'-'+String(launch?.subject||bookId)+'-'+ps.length+'-'+String(ps[0]?.id||'');
   const rotationKey='academy-v70-rotation-'+rotationId;
   let at=0;try{at=Number(localStorage.getItem(rotationKey)||0)||0}catch{}
   const chosen=ps.length?[ps[Math.abs(at)%ps.length],...(ps.length>1?[ps[(Math.abs(at)+1)%ps.length]]:[])]:[];
   if(ps.length>1){try{localStorage.setItem(rotationKey,String(at+1))}catch{}}
   const startedAt=Date.now(),budgetMs=24000;
   for(let pageIndex=0;pageIndex<chosen.length;pageIndex++){
    const p=chosen[pageIndex];bookId=p.bookId;
    const status=root.querySelector('#mg-load-progress');if(status)status.textContent='Przygotowuję stronę '+p.number+' z książki „'+(sourceBook(p)?.title||'')+'”…';
    const key=`academy-v58-variety-${child}-${bookId}-${p.number}-${mode}`;
    let hist={runs:0,questions:[],types:[]};
    try{const h=JSON.parse(localStorage.getItem(key)||'null');if(h&&typeof h==='object')hist={...hist,...h}}catch{}
    const pageBank=readBank().filter(x=>x.subject===subject()&&v75MatchesPage(x,p)&&x.task?.question);
    const bank=pageBank.filter(x=>x.task.type!=='reading'&&(childGrade!=='P'||['choice','listening'].includes(x.task.type))&&reliableTask(x.task,p));
    const excluded=[...hist.questions.slice(-65),...bank.slice(-20).map(x=>x.task.question)];
    let fresh=[];
    // Gotowe pytania maja pierwszenstwo; AI potrzebne tylko dla pustej bazy strony.
    if(!bank.length&&Date.now()-startedAt<budgetMs){try{
     fresh=parse(await ask(pagePrompt(p,excluded),Math.min(12000,budgetMs-(Date.now()-startedAt)))).map(t=>({...t,pageNumber:p.number,_fresh:true}));
     const recent=new Set(hist.questions.slice(-40).map(x=>norm(x)));
     fresh=fresh.filter(x=>x.type!=='reading'&&(childGrade!=='P'||['choice','listening'].includes(x.type))&&reliableTask(x,p)&&!recent.has(norm(x.question))&&!(/sylab|głosk/i.test(x.question)&&/tropiciel/i.test(x.question)&&hist.questions.slice(-30).some(q=>/tropiciel/i.test(q))));
     if(fresh.length)storeTasks(fresh,p);
    }catch(e){errors.push('Strona '+p.number+': '+(e?.message||e))}}
    const unused=bank.filter(x=>!hist.questions.slice(-40).some(q=>norm(q)===norm(x.task.question)));
    const old=shuffle(unused.length?unused:bank).filter(x=>x.task?.type!=='reading'&&(childGrade!=='P'||['choice','listening'].includes(x.task?.type))&&reliableTask(x.task,p)).map(x=>({...x.task,_bankKey:x.key,pageNumber:p.number,done:false,correct:false}));
    if(!fresh.length&&!old.length)console.warn('AI nie przygotowało poprawnych pytań; spróbuję lokalnych gier edukacyjnych.');
    const extras=(childGrade==='P'?[]:[makeCrossword(p),makeWordsearch(p),makePuzzle(p),makeAdjective(p),makeRebus(p),makeMemory(p),mode==='game'?makeMiniReading(p):null]).filter(Boolean);
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
    // V65: co druga misja ma ćwiczenie ortografii z pewnym rozwiązaniem.
    // Nie zmienia częstotliwości, wyglądu ani liczby słów w wykreślance.
    if(childGrade!=='P'&&mode==='game'&&subject()==='polski'&&hist.runs%2===0)add(makeSafeSpelling(p));
    // Minimum dwa typy: nowa wiedza z AI plus wybrana gra.
    const diverseFresh=shuffle(fresh.length?fresh:old.slice(0,5)).sort((a,b)=>Number(usedTypes.has(a.type))-Number(usedTypes.has(b.type)));
    for(const t of diverseFresh){if(picked.length>=5)break;if(!usedTypes.has(t.type))add(t)}
    for(const t of diverseFresh){if(picked.length>=5)break;add(t)}
    // V62: co trzecia przygoda daje pierwszeństwo wykreślance.
    const wordsearchTurn=mode==='game'&&hist.runs%3===0;
    if(wordsearchTurn)add(extrasByType.find(t=>t.type==='wordsearch'));
    for(const t of extrasByType){if(picked.length>=8)break;if(!usedTypes.has(t.type))add(t)}
    // Czytanie co druga przygoda, NIE w sprawdzianie.
    if(childGrade!=='P'&&mode==='game'&&hist.runs%2===0&&!picked.some(x=>x.type==='reading-mini'))add(makeMiniReading(p));
    // Dawne pytanie tylko co dziesiata misje (lub awaryjnie przy braku AI).
    if(hist.runs%10===9||!fresh.length){for(const t of old){if(picked.length>=10)break;if(add(t))break}}
    for(const t of [...diverseFresh,...extrasByType,...old]){if(picked.length>=10)break;add(t)}
    picked.forEach(t=>{
     t.sourceBookId=p.bookId;t.sourcePageId=p.id;t.sourceTitle=sourceLabel(p);
     // Odpowiedni fragment zapisujemy razem z zadaniem, przed rozpoczęciem gry.
     if(sourceQuestion(t))t.sourceExcerpt=sourceFromText(p.text,t);
    });
    all.push(...picked);
    hist.runs=(Number(hist.runs)||0)+1;
    hist.questions=[...hist.questions,...picked.map(t=>t.question)].slice(-90);
    hist.types=[...hist.types,...picked.map(t=>t.type)].slice(-40);
    try{localStorage.setItem(key,JSON.stringify(hist))}catch{}
   }
   if(!all.length&&childGrade==='P'){
    const basic=[['Jakie zwierzę miauczy?',['Kot','Pies','Koń','Ryba'],0],['Co jest okrągłe?',['Koło','Kwadrat','Trójkąt','Prostokąt'],0],['Ile nóg ma kot?',['Dwie','Cztery','Sześć','Osiem'],1],['Co zakładamy na stopy?',['Buty','Czapkę','Rękawiczki','Szalik'],0],['Co pijemy, gdy chce nam się pić?',['Wodę','Piasek','Kredki','Kartkę'],0],['Co świeci w dzień?',['Słońce','Łyżka','Poduszka','But'],0],['Które zwierzę ma skrzydła?',['Wróbel','Kot','Pies','Krowa'],0],['Jakiego koloru jest trawa?',['Zielona','Złota','Różowa','Czarna'],0],['Czym myjemy ręce?',['Wodą i mydłem','Piaskiem','Farba','Kredą'],0],['Jaki owoc jest żółty?',['Banan','Wiśnia','Borówka','Śliwka'],0]];
    for(const [question,options,ok] of basic){all.push({type:'choice',question,options,answer:options[ok],explanation:'',sourceBookId:bookId,sourceTitle:'Zabawy przedszkolaka',pageNumber:0,done:false,correct:false})}
   }
   if(!all.length)throw Error(errors.join('; ')||'Nie udało się utworzyć misji');
   tasks=v77MixActivities(v76MixWords(all,chosen),chosen).map(t=>({...t,sourceBookId:t.sourceBookId||bookId,sourceTitle:t.sourceTitle||'Strona '+t.pageNumber}));
   idx=0;points=0;award=false;reset();remember();draw();
  }catch(err){console.warn('Tworzenie misji:',err);if(root.isConnected)root.innerHTML='<section class="mg-panel"><h2>Nie udało się przygotować misji</h2><p>Spróbuj ponownie, kiedy AI będzie dostępne.</p>'+btn('Spróbuj ponownie','start')+btn('Wróć','back')+'</section>'}
  finally{busy=false}
 }
 function reset(){if(readingRec){readingRec.__v76Cancelled=true;try{readingRec.abort()}catch(e){}readingRec=null;}stageEpoch++;tutorBusy=false;choice=null;answered=false;tiles=[];hintLevel=0;wrongAttempts=0;tutorMessages=[]}
 const task=()=>tasks[idx];
 function answer(value){
  if(answered)return;
  const t=task();if(!t||t.v77Revealing)return;v774Normalize(t);choice=String(value);
  t.correct=answerIsCorrect(t,choice);
  if(t.selfCheck){
   if(busy)return;
   busy=true;
   (async()=>{try{
    const prompt=(mode==='test'?'Nie podawaj odpowiedzi ani wskazówek do rozwiązania. ':'')+'Jesteś nauczycielem klasy drugiej. Oceń odpowiedź na podstawie polecenia i strony. Zwróć TYLKO JSON {"correct":true lub false,"feedback":"krótkie wyjaśnienie PO POLSKU, bez podawania rozwiązania"}. Nie zaliczaj pustych ani niepowiązanych odpowiedzi. Polecenie: '+t.question+'. Materiał: '+pageText(t).slice(0,1300)+'. Odpowiedź ucznia: '+choice;
    const raw=await ask(prompt);const text=String(raw).replace(/```(?:json)?/gi,'').replace(/```/g,'').trim();const obj=JSON.parse(text.slice(text.indexOf('{'),text.lastIndexOf('}')+1));
    if(typeof obj.correct!=='boolean'||typeof obj.feedback!=='string')throw Error('Niepełna ocena');
    if(obj.correct){t.correct=true;answered=true;t.done=true;points++;audioCue(true);sayFeedback('Dobra odpowiedź!');recordResult(t);remember()}
    else{wrongAttempts++;audioCue(false);if(wrongAttempts>=2)logDifficulty(t,'odpowiedź otwarta');tutorMessages.push({who:'ai',text:mode==='test'?'Ta odpowiedź nie została zaliczona. Spróbuj samodzielnie.':(subject(t)==='angielski'&&!polishText774(obj.feedback)?'Spróbuj jeszcze raz. Przeczytaj polskie polecenie i sprawdź swój zapis.':obj.feedback.slice(0,500))})}
   }catch(e){tutorMessages.push({who:'system',text:'🦸 Nie udało się teraz sprawdzić odpowiedzi. Spróbuj ponownie.'})}
   finally{busy=false;draw()}})();return;
  }
  if(!t.correct){if(/spółgłoski|samogłoski/i.test(t.question)){const a=Array.from(lettersOnly(t.answer)).sort().join(''),b=Array.from(lettersOnly(choice)).sort().join('');t.orderHint=!!a&&a===b;}wrongAttempts++;audioCue(false);if(wrongAttempts>=2)logDifficulty(t,'błędne próby');hintLevel=Math.min(3,hintLevel+1);draw();return}
  answered=true;t.done=true;points++;audioCue(true);if(subject(t)==='angielski')celebrateReading();sayFeedback('Brawo! Dobra odpowiedź.'+(mode==='game'&&subject(t)==='angielski'&&t.explanation?' '+t.explanation:''));recordResult(t);remember();draw();
 }
 function hintText(t){
  if(t.orderHint)return 'Litery są dobrane poprawnie, ale wpisz je kolejno, tak jak występują w podanym wyrazie. Przecinki i spacje nie są obowiązkowe.';
  if(mode==='test')return 'To sprawdzian. Przeczytaj polecenie uważnie i odpowiedz samodzielnie. Omówimy odpowiedzi po zakończeniu.';
  if(hintLevel===1){
   if(Array.isArray(t.options)&&t.options.length===4){
    const q=String(t.question||'').toLocaleLowerCase('pl-PL');
    if(/ó.*wymian|wymian.*ó/i.test(q))return 'Przypomnij sobie: „ó” może wymieniać się na „o” w wyrazie pokrewnym. Sprawdź tę zasadę dla każdej propozycji.';
    if(sourceQuestion(t))return 'Znajdź właściwy wers w tekście i porównaj wszystkie odpowiedzi z tym, co naprawdę napisano.';
    if(/ortografi|pisown|poprawnie napis|dwuznak|cząstk/i.test(q))return 'Przypomnij sobie zasadę pisowni i sprawdź po kolei każdą odpowiedź.';
    return 'Przeczytaj polecenie jeszcze raz i porównaj wszystkie propozycje. Nie wybieraj na chybił trafił.';
   }
   return t.hint||'Przeczytaj polecenie jeszcze raz.';
  }
  if(hintLevel===2)return 'Spróbuj znaleźć potrzebne informacje w poleceniu albo w tekście, jeżeli zadanie dotyczy czytanki.';
  return 'Zastanów się spokojnie. Jeśli zadanie jest trudne, poproś nauczyciela o wskazówkę.';
 }
 function tutorContext(){
  const t=task();if(!t)return '';
  const crossword=t.type==='crossword'?(t.crossWords||[]).map((e,i)=>`${i+1}. PYTANIE: ${e.clue}. Wpis ucznia: ${t.crossTyped?.[i]||'(pusto)'}. Prawidlowa odpowiedz TYLKO DLA MENTORA: ${e.word}`).join('\n'):'';
  const pictureName=({'🦊':'lis','🐈':'kot','🌲':'las','🐮':'krowa','🐟':'ryba'})[t.rebusPicture]||'obiekt na obrazku';
  const search=t.type==='wordsearch'?`Wykreślanka: TYLKO te słowa są ukryte na planszy: ${(t.placements||[]).map(p=>p.word).join(', ')}. Znalezione już: ${(t.placements||[]).filter(p=>p.found).map(p=>p.word).join(', ')||'brak'}. NIE wymyślaj innych słów ani pozycji. Nie udawaj, że widzisz ekran.`:'';
  const rebus=t.type==='rebus'?`WIDOCZNY REBUS: ${t.rebus}. Obrazek przedstawia: ${t.rebusPicture||'nieznany'}, nazwa: ${pictureName}. Jeżeli uczeń pyta co jest na obrazku, powiedz nazwę, ale nie rozwiązuj pozostałych operacji. ZADANA ODPOWIEDZ tylko dla ciebie: ${t.answer}. Wskazowka do tego rebusu: ${t.rebusHint||''}. Nie wymyslaj innego rebusu ani innych liter.`:'';
  const history=tutorMessages.slice(-5).map(m=>(m.who==='uczen'?'Uczeń: ':'Nauczyciel: ')+m.text).join('\n');
  return `Jestes nauczycielem ośmiolatka w Akademii Superbohaterów. Tryb: ${mode==='test'?'SPRAWDZIAN bez podpowiedzi':'TRENING'}. Aktualne zadanie: ${t.question}. Typ: ${t.type}. Przedmiot: ${subject()}. Pytania krzyżówki: ${crossword||'nie dotyczy'}. ${rebus} ${search} Tekst z materiału (tylko kontekst): ${pageText(t).slice(0,1100)}. Ostatnia odpowiedz: ${choice||'brak'}. Historia: ${history}. Skup się tylko na aktualnym zadaniu. W treningu wyjaśnij sens polecenia i naprowadzaj, nie dopowiadaj losowych wskazówek. Nie twierdź, że widzisz ekran na żywo.`;
 }
 function tutorPanel(){
  const messages=tutorMessages.slice(-6).map(m=>'<p class="mg-tutor-message"><strong>'+(m.who==='uczen'?'Paweł':m.who==='system'?'Komunikat':'Nauczyciel AI')+':</strong> '+escape(m.text)+'</p>').join('');
  return '<details class="mg-tutor a77-help" '+(tutorMessages.length||tutorBusy?'open':'')+'><summary>💬 Zapytaj nauczyciela AI</summary><div><h3>Pomoc nauczyciela '+btn('🔊','tutor-instruction')+'</h3><p>Naciśnij czerwony mikrofon z boku ekranu, żeby zapytać o zadanie. Możesz też napisać pytanie.</p><div aria-live="polite">'+messages+'</div><textarea id="mg-tutor-input" rows="2" placeholder="Wpisz pytanie do nauczyciela..."></textarea>'+btn(tutorBusy?'⏳ Odpowiadam...':'Wyślij pytanie','tutor-send','mg-primary')+(Number(task()?.v77HintCount)>=2&&!task()?.v77Revealed&&!answered?btn('Pokaż odpowiedź i wyjaśnij · bez monet','v77-reveal'):'')+(task()?.v77Revealed?'<p class="v77-assisted">💡 Ćwiczymy z pomocą — za to zadanie bez monet.</p>':'')+'</div></details>';
 }
 function v77SafeHint(t){
  if(['listening','dictation','vocab-listen'].includes(t.type))return 'Naciśnij głośnik i posłuchaj jeszcze raz. Zwróć uwagę na pierwszy dźwięk, a potem spróbuj zapisać usłyszane słowo.';
  if(t.type==='crossword')return 'Wybierz jedną wskazówkę. Policz kratki i zastanów się nad pierwszą literą. Rozwiązuj po jednym haśle.';
  if(t.type==='wordsearch')return 'Wybierz jedno słowo z listy. Poszukaj jego pierwszej litery i sprawdź kolejne pola w tym samym kierunku.';
  if(t.type==='memory'||t.type==='vocab-match')return 'Porównaj znaczenia. Znajdź jedną pewną parę, a potem zajmij się pozostałymi.';
  if(['order','spelling','vocab-build'].includes(t.type))return 'Zacznij od pierwszego elementu. Przeczytaj na głos to, co już ułożyłeś, i sprawdź, czego brakuje.';
  return 'Powiedz własnymi słowami, o co pyta polecenie. Potem porównaj możliwości i odrzuć te, które na pewno nie pasują. Spróbuj jednej odpowiedzi.';
 }
 function v77HintLeaks(text,t){
  const clean=s=>' '+String(s||'').toLocaleLowerCase('pl-PL').replace(/[^\p{L}\p{N}]+/gu,' ').trim()+' ',response=clean(text);
  const answers=[t.answer,...(t.crossWords||[]).map(x=>x.word),...(t.solutions77||[]).flatMap(x=>String(x).split(' — ')),...(t.exercises||[]).map(x=>String(x.answer))];
  return answers.some(a=>String(a||'').trim()&&response.includes(clean(a)))||/poprawna odpowiedź|odpowiedź (?:to|brzmi)|wybierz (?:pierwsz|drug|trzeci|czwart)|opcja [abcd1234]/i.test(text);
 }
 async function tutorAsk(question){
  const q=String(question||'').trim();if(!q||tutorBusy)return;const t=task();if(!t)return;v774Normalize(t);
  if(mode==='test'){
   const reply='To sprawdzian. Mogę wyjaśnić sposób wykonania, ale rozwiązanie zostawiam Tobie. '+v77SafeHint(t);
   tutorMessages.push({who:'uczen',text:q},{who:'ai',text:reply});draw();speak(reply,'pl-PL');return;
  }
  const procedure=/\b(?:jak|gdzie|czym)\b.{0,45}(?:wpisa|zaznacz|klik|nacis|mikrofon|głośnik|przycisk|kratk|pole)|co mam zrobić|poleceni|instrukcj/i.test(q);
  const requestedSolution=/(?:podaj|pokaż|zdradź|daj|powiedz).{0,35}(?:odpowied[zź]|rozwiązani)|(?:jaka|która).{0,25}(?:poprawna|prawidłowa) odpowied[zź]|poddaję się/i.test(q);
  const stillStuck=/nie (?:wiem|umiem|potrafię|rozumiem)/i.test(q);
  const hintCount=Number(t.v77HintCount)||(t.v77HintDelivered?1:0);
  const consent=/^(?:tak|proszę|poproszę|chcę|dobrze|okej|ok)(?:[,.! ]+(?:proszę|poproszę|chcę|odpowiedź|rozwiązanie|tak))*[.! ]*$/i.test(q)||requestedSolution||/przeliter|spell|jak.*pisz/i.test(q);
  const reveal=!!t.v77Revealed||(hintCount>=2&&!procedure&&consent);
  const epoch=stageEpoch,current=t,currentIndex=idx,isCurrent=()=>root.isConnected&&stageEpoch===epoch&&idx===currentIndex&&task()===current;
  tutorMessages.push({who:'uczen',text:q});tutorBusy=true;t.v77Revealing=reveal;draw();
  try{
   let response;
   if(reveal){
    // Pokazanie znanego rozwiązania natychmiast wyłącza monety za to zadanie.
    t.v77Revealed=true;t.v77Revealing=false;remember();
    const answer=t.solutions77?.length?t.solutions77.join('; '):t.type==='crossword'?(t.crossWords||[]).map((x,i)=>(i+1)+'. '+x.word).join('; ')+'. Hasło: '+t.answer:t.type==='vocab-match'?(t.pairs||[]).map(x=>x.en+' — '+x.pl).join('; '):t.answer;
    response='Odpowiedź: '+answer+'. '+(t.explanation||'Przejdźmy przez rozwiązanie spokojnie, krok po kroku.')+' To zadanie ćwiczymy z pomocą, więc nie otrzymasz za nie monet.';
    const message={who:'ai',text:response};tutorMessages.push(message);draw();
    try{const extra=String(await ask('Wyjaśnij ośmiolatkowi DLACZEGO podana odpowiedź jest poprawna. Nie zmieniaj poprawnej odpowiedzi. Krótko, prosto, po polsku, do 4 zdań. Zadanie: '+t.question+'. Odpowiedź: '+answer+'. Uzasadnienie: '+(t.explanation||'')+'. Kontekst: '+pageText(t).slice(0,900),12000)).replace(/\*\*|__|[`#]/g,'').trim();if(isCurrent()&&extra&&(subject(t)!=='angielski'||polishText774(extra))){response+=' '+extra.slice(0,1000);message.text=response}}catch{}
    if(isCurrent()){const spelling=/liter|spell|jak.*pisz/i.test(q)&&subject(t)==='angielski'&&/^[a-z '-]{1,35}$/i.test(t.wordEn||t.answer||'');if(spelling)spellEnglish77(t.wordEn||t.answer,{prefix:response,isCurrent});else speak(response,'pl-PL');}
   }else{
    // W pierwszej prośbie nie przekazujemy mentorowi klucza odpowiedzi.
    const prompt='Pomóż ośmiolatkowi rozwiązać zadanie SAMODZIELNIE. Wskazówka numer '+(hintCount+1)+'. '+(hintCount?'Podaj INNĄ małą wskazówkę niż poprzednio. Poprzednia: '+String(t.v77LastHint||'')+'. ':'')+'Zasady: NIE PODAWAJ rozwiązania, liter odpowiedzi, numeru opcji, tłumaczenia rozwiązywanego słowa ani synonimu odpowiedzi. Daj jedną krótką wskazówkę o sposobie myślenia. Nie wybieraj żadnej z opcji. Polecenie: '+t.question+' / '+(t.questionPl||'')+'. Typ: '+t.type+'. Prośba: '+q+'. Odpowiedz po polsku, do 3 zdań, bez markdown.';
    try{response=String(await ask(prompt)).replace(/\*\*|__|[`#]/g,'').trim()}catch{response=''}
    if(!isCurrent())return;
    if(!response||v77HintLeaks(response,t)||(subject(t)==='angielski'&&!polishText774(response)))response=v77SafeHint(t);
    t.v77HintDelivered=true;t.v77HintCount=hintCount+1;t.v77LastHint=response;
    if(t.v77HintCount>=2)response='Dam Ci jeszcze jedną małą podpowiedź. '+response+' Jeśli chcesz, mogę podać prawidłową odpowiedź i wyjaśnić ją. Wtedy za to zadanie nie otrzymasz monet.';
    remember();tutorMessages.push({who:'ai',text:response.slice(0,1400)});speak(response,'pl-PL');
   }
  }finally{if(isCurrent()){t.v77Revealing=false;tutorBusy=false;draw()}}
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
 // V63: Pokaż wyłącznie wersy z faktycznym potwierdzeniem odpowiedzi.
 function sourceFromText(text,t){
  const full=String(text||'');
  if(!full.trim())return '';
  const answer=spokenWords(t.answer||'');
  if(!answer.length)return '';
  const lines=full.split(/\n+|(?<=[.!?])\s+/).map(s=>s.trim()).filter(s=>spokenWords(s).length);
  const contains=fragment=>{
   const hay=spokenWords(fragment);
   return answer.length<=hay.length&&hay.some((_,i)=>answer.every((w,j)=>hay[i+j]===w));
  };
  const matches=[];
  for(let k=0;k<lines.length;k++){
   if(contains(lines[k])||(k+1<lines.length&&contains(lines[k]+' '+lines[k+1])))matches.push(k);
  }
  if(!matches.length)return '';
  // Cytat od AI służy tylko do rozstrzygnięcia, który z prawdziwych wersów wybrać.
  const quote=spokenWords(t.sourceQuote||'').join(' ');
  const question=spokenWords(t.question||'').filter(w=>w.length>4&&!['które','który','jakie','wiersza','tekstu','zgodnie','uczniowie','odpowiedź'].includes(w));
  const score=k=>{
   const context=lines.slice(Math.max(0,k-1),Math.min(lines.length,k+2)).join(' ');
   const normalized=spokenWords(context).join(' ');
   const quotePoints=quote.length>5&&normalized.includes(quote)?100:0;
   const contextPoints=question.reduce((n,w)=>n+(normalized.includes(w)?1:0),0);
   return quotePoints+contextPoints;
  };
  matches.sort((a,b)=>score(b)-score(a)||a-b);
  const at=matches[0];
  // Najwyżej trzy sąsiednie kompletne wersy, z wybraną odpowiedzią pośrodku.
  return lines.slice(Math.max(0,at-1),Math.min(lines.length,at+2)).join('\n').slice(0,480);
 }
 function shortSource(t){
  if(t.sourceExcerpt&&sourceFromText(t.sourceExcerpt,t))return t.sourceExcerpt;
  const direct=sourceFromText(pageText(t),t);
  if(direct)return direct;
  // Starsze zapisane misje mogły wskazywać niewłaściwą stronę; szukaj w tej
  // samej książce, nigdy w materiale innego dziecka lub przedmiotu.
  const sameBook=pages.filter(p=>p.bookId===(t.sourceBookId||bookId));
  for(const p of sameBook){
   const excerpt=sourceFromText(p.text,t);
   if(excerpt)return excerpt;
  }
  // Bez potwierdzonej odpowiedzi nie wyświetlaj losowego początku czytanki.
  return '';
 }
 // V75_AUDYT_ZGODNOSCI_2
 function v75InstructionSpeech(t,mode){return v76SayInstruction(t)}
function stage(){
  const t=task();v774Normalize(t);if(t.v774NeedsCue)return '<p role="status">To słowo wymaga uzupełnienia polskiego znaczenia. Możesz pominąć zadanie i przejrzeć je w bazie pytań.</p>'+btn('Pomiń bez zaliczenia — następne zadanie','skip');if(t.visual77)return v77VisualStage(t);if(['vocab-build','vocab-match'].includes(t.type))return v77WordGameStage(t);if(t.vocab76)return v76WordStage(t);let html='<style>.mg-panel [data-mg]{transition:transform .13s ease,filter .13s ease,box-shadow .13s ease}.mg-panel [data-mg]:active{transform:scale(.94);filter:brightness(1.35)}.mg-panel [data-mg]:focus-visible{outline:3px solid #fbbf24;outline-offset:3px}.mg-panel input:focus,.mg-panel textarea:focus{outline:3px solid #fbbf24}.mg-panel .mg-feedback{animation:mg-pop .35s ease-out}@keyframes mg-pop{from{opacity:.2;transform:scale(.94)}to{opacity:1;transform:scale(1)}}</style><h3>'+escape(t.question)+'</h3>'+ (subject(t)==='angielski'&&(mode!=='test'||t.targetPl774)&&t.questionPl?'<p class="mg-translation">🇵🇱 '+escape(t.questionPl)+'</p>':'');
  const q=String(t.question||'').toLocaleLowerCase('pl-PL');
  const storyHint=/(czytank|tekst|wiersz|opowiadani|bohater|autor|narrator|histori|według|na podstawie|co (?:się|robi|zrobił|zrobiła|zauważył|powiedział|woła|nawołuje)|kto (?:powiedział|woła|spotkał|zobaczył|zrobił)|dlaczego|w jaki sposób|co wydarzyło|o czym)/i.test(q);
  const noSource=['reading','wordsearch','crossword','rebus','syllables','dictation','listening','spelling','order'].includes(t.type)||/(sylab|głosk|samogłosk|spółgłosk|liter|alfabet|ortografi|wyraz[ieyu]? [„"'])/i.test(q);
  const explicitText=/(z wiersza|z czytanki|z tekstu|według wiersza|na podstawie tekstu|na końcu refrenu|zakończeniu refrenu)/i.test(q);
  if(subject(t)!=='angielski'&&(explicitText||(!noSource&&(t.needsSource===true||storyHint||t.type==='detective'||t.type==='loki')))){
   const excerpt=shortSource(t);
   if(excerpt)html+='<details class="mg-source" open><summary>📖 Tekst źródłowy — znajdź odpowiedź</summary><p style="max-height:330px;overflow:auto;white-space:pre-wrap">'+escape(excerpt)+'</p></details>';
  }

  if(t.type==='reading'||t.type==='reading-mini'){
   const mini=t.type==='reading-mini';
   html+='<p>📖 '+(mini?'Przeczytaj podświetlone na <strong>niebiesko</strong> słowo. Kiedy aplikacja je rozpozna, zrobi się <strong>zielone</strong>, a kolejne podświetli się na niebiesko. Czytaj bez ponownego klikania mikrofonu.':'Przeczytaj widoczny krótki fragment po kolei. Możesz zatrzymać mikrofon i kontynuować. Po zakończeniu naciśnij <strong>Sprawdź czytanie</strong>.')+'</p>';
   const text=t.passage||pageText(t);
   if(mini){
    const c=miniCoverage(text,t.readTranscript||'');
    html+='<div class="mg-reading-text" style="display:flex;flex-wrap:wrap;gap:8px;line-height:1.7">'+spokenWords(text).map((w,i)=>'<span data-mg-rw="'+i+'" style="padding:3px 8px;border-radius:7px;background:'+(c.matched[i]?'#16803b':i===c.hits?'#1769ff':'#293850')+';color:white">'+escape(w)+'</span>').join('')+'</div>';
   }else html+='<div class="mg-reading-text" style="white-space:pre-wrap">'+escape(text)+'</div>';
   html+=btn(t.readActive?'⏹ Zatrzymaj mikrofon':'🎙️ '+(t.readTranscript?'Kontynuuj czytanie':'Rozpocznij czytanie'),t.readActive?'read-stop':'read-aloud','mg-primary');
   if(!mini&&t.readTranscript&&!t.readActive&&!answered)html+=btn('✅ Sprawdź czytanie','read-check','mg-primary');
   if(Number.isFinite(t.readScore))html+='<div class="mg-feedback" role="status"><strong>'+ (t.readChecked?'Wynik próby: ':'Dotychczas rozpoznano: ')+(t.readHits||0)+' z '+(t.readTotal||0)+' słów — '+t.readScore+'%</strong><p>'+escape(!t.readChecked?'Zatrzymaj mikrofon i naciśnij Sprawdź czytanie.':t.readScore>=70?'🎉 Brawo, czytanie zaliczone!':'🌱 Dobry początek! Poćwicz i spróbuj ponownie.')+'</p><small>Rozpoznawanie mowy może się mylić; to nie jest ocena wymowy.</small></div>';
   if(t.readError)html+='<p role="status">🎙️ '+escape(t.readError)+'</p>';
   if(!t.readActive&&!answered)html+=btn('↺ Zacznij od początku','read-reset');
  }else if(t.type==='wordsearch'){
   if(!t.words?.length)t.words=wordPieces(pageText(t)).slice(0,6);
   if(!t.grid)initWordGrid(t);
   html+='<p>Znajdź sześć słów poziomo i pionowo na mniejszej planszy. Niektóre słowa mogą się przecinać. Poprawne litery są niebieskie, ukończone słowa zielone.</p><p><strong>Do znalezienia:</strong> '+t.placements.map(p=>p.found?'✅ '+escape(p.word):escape(p.word)).join(' • ')+'</p>';
   html+='<div class="mg-wordgrid" style="display:grid;grid-template-columns:repeat('+t.grid[0].length+',minmax(0,1fr));gap:3px">'+t.grid.map((r,y)=>r.map((v,x)=>{const found=t.placements.some(p=>p.found&&[...p.word].some((_,i)=>{const z=wordCell(p,i);return z[0]===y&&z[1]===x}));const selected=(t.picked||[]).some(z=>z[0]===y&&z[1]===x);return '<button type="button" data-mg="grid:'+y+':'+x+'" style="padding:5px 1px;min-width:0;background:'+(found?'#16803b':selected?'#075cff':'#394969')+' !important;color:white;border-radius:6px;'+(selected&&!found?'box-shadow:inset 0 0 0 3px #dbeafe,0 0 12px #60a5fa;outline:2px solid #93c5fd;':'')+'">'+escape(v)+'</button>'}).join('')).join('')+'</div>';
  }else if(t.type==='crossword'&&t.crossWords?.length){
   if(!Array.isArray(t.crossTyped))t.crossTyped=t.crossWords.map(()=>'');
   html+='<p>📋 <strong>Pytania do krzyżówki</strong>. Naciśnij numer pytania, aby przejść do jego kratek. Przesuń planszę palcem w bok, aby zobaczyć wszystkie litery.</p>';
   html+='<div class="mg-cross-questions" style="padding:10px;border:1px solid #64748b;border-radius:12px">'+t.crossWords.map((entry,i)=>'<div style="margin:6px 0">'+btn((i+1)+'. '+escape(entry.clue)+' ('+[...entry.word].length+' liter)','cross-go:'+i)+'</div>').join('')+'</div>';
   html+='<h3 style="margin-top:18px">📝 Wpisz odpowiedzi w krzyżówce</h3><p>Poprawna litera — niebieska, cały wyraz — zielony. Żółte przecięcia tworzą hasło.</p>';
   const width=t.crossGrid[0]?.length||0,cellSize=30;
   html+='<div class="mg-cross-board" style="overflow-x:auto;max-width:100%;touch-action:pan-x pan-y;padding:6px 0">';
   html+='<div role="grid" aria-label="Krzyżówka" style="display:grid;grid-template-columns:28px repeat('+width+','+cellSize+'px);gap:1px;width:max-content;margin:0">';
   t.crossWords.forEach((entry,i)=>{
    html+='<strong role="rowheader" style="font-size:14px;display:flex;align-items:center;justify-content:center;height:34px;color:#fcd34d">'+(i+1)+'.</strong>';
    const correct=lettersMatch(t.crossTyped[i]||'',entry.word);
    html+=t.crossGrid[i].map((cell,col)=>{
     if(!cell)return '<span aria-hidden="true" style="width:30px;height:34px"></span>';
     const pos=col-(t.crossColumn-entry.index),letter=Array.from(t.crossTyped[i]||'')[pos]||'';
     const match=letter&&lettersMatch(letter,cell.letter);
     const bg=correct?'#16803b':match?'#075cff':cell.cross?'#66500a':'#263550';
     return '<input data-mg-cell="'+i+':'+pos+'" maxlength="1" value="'+escape(letter)+'" aria-label="Hasło '+(i+1)+', litera '+(pos+1)+' z '+[...entry.word].length+'" autocomplete="off" autocapitalize="characters" style="box-sizing:border-box;margin:0;width:30px;height:34px;padding:0;text-align:center;font-size:17px;font-weight:800;color:white;border:1px solid '+(cell.cross?'#facc15':'#8ca2c6')+';border-radius:2px;background:'+bg+' !important">';
    }).join('');
   });
   html+='</div></div>';
   html+='<p>Hasło pionowe: '+(t.crossWords.every((w,i)=>lettersMatch(t.crossTyped[i]||'',w.word))?'<strong>'+escape(t.answer.toUpperCase())+'</strong>':'<strong>odkryj po rozwiązaniu wszystkich słów</strong>')+'</p>';
   html+=btn('✓ Sprawdź krzyżówkę','cross-new','mg-primary')+'<p id="mg-cross-feedback" role="status"></p>';
  }else if(t.type==='order'||t.type==='spelling'){
   const letterOrder=alphabeticOrderTask(t);
   if(letterOrder){
    // Rozpoznaj wyraz z polecenia, np. „tropicieli”, aby nie ufać błędnej kolejności od AI.
    const match=String(t.question||'').match(/(?:wyrazu|słowa)\s*[„\"'«]?\s*([a-ząćęłńóśźż]+)/i);
    if(match){
     const sorted=Array.from(match[1].toLocaleLowerCase('pl-PL')).sort((a,b)=>a.localeCompare(b,'pl')).join('');
     if(t.answer!==sorted){t.answer=sorted;t.chunks=null;tiles=[]}
    }
   }
   const letterTiles=letterOrder||t.type==='spelling';
   if(!Array.isArray(t.chunks) || (letterTiles&&t.chunks.length!==Array.from(t.answer).length)){
    t.chunks=shuffle(letterTiles?Array.from(t.answer):t.answer.trim().split(/\s+/));
    if(letterTiles&&t.chunks.length>1&&t.chunks.join('')===t.answer)t.chunks.reverse();
    tiles=[];
   }
   html+='<div class="mg-built">'+escape(tiles.map(i=>t.chunks[i]).join(letterTiles?'':' ')||'Ułóż puzzle, dotykając kafelków')+'</div><div class="mg-choices">'+t.chunks.map((v,i)=>btn(escape(v),'tile:'+i,'mg-choice '+(tiles.includes(i)?'mg-tile-used':''))).join('')+'</div>'+btn('↩ Cofnij','undo')+btn('✓ Sprawdź','submit','mg-primary');
  }else if(['write','dictation','listening','syllables','rebus'].includes(t.type)){
   if((t.type==='dictation'||t.type==='listening')&&(subject(t)!=='angielski'||englishAudioAllowed774(t)))html+=btn('🔊 Posłuchaj','audio');
   if(t.type==='rebus')html+='<div style="font-size:clamp(23px,5vw,36px);margin:18px 0;padding:17px;background:#172954;border:2px solid #4467ac;border-radius:12px;text-align:center;font-weight:bold">'+escape(t.rebus).replace(/− ([A-ZĄĆĘŁŃÓŚŹŻ]+)/g,'− <s style="text-decoration-color:#ff6b6b">$1</s>')+'</div><p>Odejmij i dodaj litery tak, aby powstał wyraz. Wpisz go poniżej.</p>';
   // V58: Tekst źródłowy pokazuje tylko reguła needsSource.
   html+='<input id="mg-written" autocomplete="off" placeholder="Wpisz odpowiedź">'+btn('✓ Sprawdź','written','mg-primary');
  }else if(t.type==='draw'){
   html+='<p>Rysunki zostawiamy na później.</p>'+btn('Pomiń','skip');
  }else if(t.type==='memory'){
   if(!t.cards?.length){html+='<p>Nie udało się utworzyć kart. Przejdź do następnego zadania.</p>';}
   else{
    html+='<p>Odkrywaj po dwie karty i szukaj sześciu pasujących par słów albo słów z obrazkami. Znalezione pary pozostaną zielone.</p>';
    html+='<div style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:5px">'+t.cards.map((c,i)=>{const hit=(t.matched||[]).includes(i),open=hit||(t.flipped||[]).includes(i);return '<button type="button" data-mg="flip:'+i+'" style="min-width:0;padding:10px 2px;min-height:72px;background:'+(hit?'#16803b':open?'#075cff':'#203c73')+' !important;border:2px solid #7aa1e2;border-radius:12px;color:white;font-size:clamp(13px,2.8vw,21px);font-weight:700">'+escape(open?c.label:'❔')+'</button>'}).join('')+'</div>';
   }
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
  const t=task();v774Normalize(t);
  const names={safe:'🔐 Sejf Iron Mana',shop:'🛒 Sklep Avengersów',clock:'⏰ Zegar misji',detective:'🕵️ Detektyw Spider-Mana',loki:'🦹 Bitwa z Lokim',reading:'🎙️ Laboratorium czytania',order:'🧩 Szyfr Avengersów',dictation:'✍️ Dyktando Kapitana',syllables:'🔠 Sylaby i głoski','vocab-choice':'🃏 Słówka · wybierz','vocab-write':'✍️ Słówka · napisz','vocab-speak':'🎙️ Słówka · powiedz','vocab-repeat':'🗣️ Słówka · powtórz','vocab-meaning':'💡 Słówka · znaczenie','vocab-listen':'🎧 Słówka · posłuchaj','vocab-reading':'📖 Słówka · przeczytaj','vocab-build':'🧩 Złóż słowo ze słuchu','vocab-match':'🔗 Połącz słówka',gallery77:'Galeria słów',radar77:'Radar słuchowy',command77:'Wykonaj polecenie',scene77:'Ustaw scenę',sort77:'Sortownia słów',detective77:'Detektyw tekstu',mosaic77:'Mozaika matematyczna',workshop77:'Warsztat liczenia',crossword:'📝 Krzyżówka',choice:'⚡ Zagadka bohatera',listening:'🎧 Misja słuchowa',memory:'🃏 Memory',spelling:'✍️ Pisownia',rebus:'🧩 Rebus Avengersów',memory:'🃏 Memory',"reading-mini":'🎙️ Czytaj słowo po słowie'};
  root.innerHTML=`<section class="mg-panel v77-play"><header class="mg-header"><div class="v77-adventure-art" aria-hidden="true"><span class="v77-rocket">🚀</span><span class="v77-star s1">✦</span><span class="v77-star s2">✧</span></div><small>${mode==='test'?'🏆 PRÓBNY SPRAWDZIAN':'⚡ MISJA SPECJALNA'} · ${escape(t.sourceTitle||('STRONA '+(t.pageNumber||'?')))}</small>${btn('🔊 Odczytaj polecenie','read-instruction')}<h2>${t.type==='reading'?'📜 Tajny przekaz Avengersów':t.type==='loki'?'🦹 Pułapka Lokiego':t.type==='detective'?'🕵️ Detektyw Spider-Mana':t.type==='wordsearch'?'🔎 Wykreślanka':t.type==='draw'?'🎨 Misja rysunkowa':names[t.type]||'🎮 Misja bohatera'}</h2><p>Wyzwanie ${idx+1} z ${tasks.length}</p><div class="mg-bar"><div style="width:${Math.round(idx/tasks.length*100)}%"></div></div>${btn('⏸ Stop / zapisz','pause')}</header><div class="v77-task-surface">${stage()}</div></section>`;
  const canvas=root.querySelector('#mg-draw');if(canvas){const ctx=canvas.getContext('2d');ctx.lineWidth=4;ctx.lineCap='round';let painting=false;const point=e=>{const r=canvas.getBoundingClientRect();return [(e.clientX-r.left)*canvas.width/r.width,(e.clientY-r.top)*canvas.height/r.height]};canvas.onpointerdown=e=>{painting=true;canvas.setPointerCapture(e.pointerId);ctx.beginPath();ctx.moveTo(...point(e))};canvas.onpointermove=e=>{if(painting){ctx.lineTo(...point(e));ctx.stroke()}};canvas.onpointerup=()=>painting=false;}
 }
 function finish(){
  if(award)return;
  stageEpoch++;tutorBusy=false;
  award=true;
  const total=tasks.length;
  const pct=total?Math.round(points/total*100):0;
  const passed=mode==='test'&&pct>=70;
  const independent=tasks.filter(t=>t.correct&&!t.v77Revealed).length;
  const coins=mode==='test'?(passed?Math.max(5,Math.min(20,points*2)):Math.min(3,points)):Math.min(12,independent);
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
  if(act.startsWith('a77-'))return v77VisualAction(act,t);
  if(act.startsWith('v77-')&&act!=='v77-reveal')return v77GameAction(act,t);
  if(act==='v77-reveal')return tutorAsk('Podaj odpowiedź i wyjaśnij dlaczego.');
  if(act==='v76-word-model')return t?.vocab76?v76WordModel(t):undefined;
  if(act==='v76-word-record')return t?.vocab76&&!answered?v76WordVoice(t):undefined;
  if(act==='tutor-instruction')return speak('Zapytaj nauczyciela AI. Naciśnij czerwony mikrofon z boku ekranu i powiedz, czego nie rozumiesz.','pl-PL');
  if(act==='read-instruction'){if(subject(t)==='angielski'){v75InstructionSpeech(t,mode);return;}return speak((mode==='test'?'Sprawdzian':'Misja')+'. '+(t?.type==='reading'?'Przeczytaj na głos cały tekst poniżej. Naciśnij rozpocznij czytanie. Kiedy będziesz potrzebował przerwy, naciśnij zakończ fragment. Możesz później kontynuować.':t?.question||'')+(t?.type==='wordsearch'?' Wybieraj litery kolejno.':''),'pl-PL');}
  if(act==='skip'){v774Normalize(t);logDifficulty(t,'uczeń poprosił o następne zadanie');sayFeedback('Nie szkodzi. '+(subject(t)==='angielski'&&t.explanation?'Wyjaśnienie: '+t.explanation+'. ':'')+'Zapisuję to do powtórki.');idx++;reset();remember();return draw()}
  if(act==='cross-new'){if(crossStatus(t))return crossDone(t);wrongAttempts++;audioCue(false);const box=root.querySelector('#mg-cross-feedback');if(box)box.textContent='Nie wszystkie wyrazy są jeszcze poprawne. Wpisane litery pozostają w kratkach.';return}
  if(act==='read-aloud'){
   const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
   if(!SR){t.readError='Ta przeglądarka nie obsługuje rozpoznawania głosu.';draw();return}
   if(readingRec)return;
   stopVoice();const r=new SR();r.onstart=()=>{if(readingRec===r&&!r.__v76Cancelled)setVoiceState('listening')};setVoiceState('starting');r.lang=subject(t)==='angielski'?'en-US':'pl-PL';r.continuous=true;r.interimResults=true;
   const current=t,epoch=stageEpoch;
   readingRec=r;t.readActive=true;t.readError='';t.readChecked=false;
   let finalPart='';
   const base=String(t.readTranscript||'');
   const preview=(pending='')=>{
    const c=(t.type==='reading-mini'?miniCoverage:readingCoverage)(t.passage||pageText(t),base+' '+finalPart+' '+pending);
    t.readHits=c.hits;t.readTotal=c.total;t.readHeard=c.heard;
    if(t.type==='reading-mini')root.querySelectorAll('[data-mg-rw]').forEach((el,i)=>{el.style.background=c.matched[i]?'#16803b':i===c.hits?'#1769ff':'#293850'});
   };
   r.onresult=e=>{
    let partial='',pending='';
    for(let i=0;i<e.results.length;i++){
     const tx=e.results[i][0]?.transcript||'';
     if(e.results[i].isFinal)partial+=' '+tx;else pending+=' '+tx;
    }
    finalPart=partial.trim();preview(pending);
    if(t.type==='reading-mini'&&!t.correct){
     const c=miniCoverage(t.passage||'',base+' '+finalPart+' '+pending);
     if(c.hits===c.total&&c.total>0){
      t.readTranscript=(base+' '+finalPart+' '+pending).trim();t.readChecked=true;
      t.readScore=100;t.readHits=c.hits;t.readTotal=c.total;t.readHeard=c.heard;
      t.correct=true;t.done=true;answered=true;points++;recordResult(t);remember();
      try{r.stop()}catch{}
      celebrateReading();sayFeedback('Brawo! Wszystkie słowa przeczytane w kolejności!');
     }
    }
   };
   r.onerror=e=>{const kind=String(e.error||'');
    if(kind==='not-allowed'||kind==='service-not-allowed')t.readError='Zezwól na dostęp do mikrofonu.';
    else if(kind!=='no-speech'&&kind!=='aborted')t.readError='Rozpoznawanie zakończone: '+kind+'. Zapisany tekst nie znika.';
   };
   r.onend=()=>{
    if(readingRec===r){readingRec=null;setVoiceState('idle')}
    if(r.__v76Cancelled)return;
    t.readTranscript=t.type==='reading-mini'&&t.correct?String(t.readTranscript||''):(base+' '+finalPart).trim();t.readActive=false;
    const c=(t.type==='reading-mini'?miniCoverage:readingCoverage)(t.passage||pageText(t),t.readTranscript);
    t.readScore=c.score;t.readHits=c.hits;t.readTotal=c.total;t.readHeard=c.heard;
    remember();if(root.isConnected&&task()===current&&stageEpoch===epoch)draw();
   };
   try{r.start();draw()}catch(e){readingRec=null;t.readActive=false;t.readError='Nie udało się uruchomić mikrofonu.';draw()}
   return;
  }
  if(act==='read-stop'){
   if(readingRec){try{readingRec.stop()}catch(e){console.warn('Stop mikrofonu',e)}}
   return;
  }
  if(act==='read-check'){
   if(t.readActive||readingRec)return;
   const c=(t.type==='reading-mini'?miniCoverage:readingCoverage)(t.passage||pageText(t),t.readTranscript||'');
   t.readScore=c.score;t.readHits=c.hits;t.readTotal=c.total;t.readHeard=c.heard;t.readChecked=true;
   if(c.score>=70&&!t.correct){t.correct=true;t.done=true;answered=true;points++;recordResult(t);celebrateReading();sayFeedback('Brawo! Czytanie zaliczone!');}
   else if(c.score<70){wrongAttempts++;audioCue(false);sayFeedback('Świetnie, że próbujesz! Poćwicz i spróbuj jeszcze raz.')}
   remember();draw();return;
  }
  if(act.startsWith('grid:')){
   const [y,x]=act.slice(5).split(':').map(Number);
   const available=t.placements.filter(p=>!p.found);
   let picked=t.picked||(t.picked=[]);
   const next=[...picked,[y,x]];
   let matches=available.filter(p=>next.every((z,i)=>{const cell=wordCell(p,i);return z[0]===cell[0]&&z[1]===cell[1]}));
   if(!matches.length){picked=[];matches=available.filter(p=>p.row===y&&p.col===x);if(matches.length)picked=[[y,x]];audioCue(matches.length>0);}
   else{picked=next;audioCue(true)}
   t.picked=picked;
   const completed=matches.find(p=>picked.length===Array.from(p.word).length);
   if(completed){completed.found=true;t.picked=[];if(t.placements.every(p=>p.found)){answered=true;t.done=true;t.correct=true;points++;recordResult(t);remember();sayFeedback('Wszystkie słowa odnalezione! Świetna robota!')}}
   draw();return;
  }
  if(act.startsWith('cross-go:')){const row=Number(act.split(':')[1]);const el=root.querySelector('[data-mg-cell="'+row+':0"]');if(el){el.scrollIntoView({behavior:'smooth',block:'center'});el.focus({preventScroll:true})}return}
  if(act==='tutor-send')return tutorAsk(root.querySelector('#mg-tutor-input')?.value||'');
  if(act==='tutor-mic')return tutorMic();
  if(act==='tutor-speak'){const last=[...tutorMessages].reverse().find(m=>m.who==='ai');if(last)return speak(last.text,'pl-PL');return}
  if(act==='report')return report();
  if(act==='guide')return voiceGuide();if(act==='start')return start();if(act==='resume')return resume();if(act==='back')return launch&&onBack?onBack():setup();
  if(act==='pause'){stopVoice();if(readingRec){try{readingRec.stop()}catch(e){}}if(t&&t.type==='reading')t.readActive=false;stageEpoch++;tutorBusy=false;remember();root.innerHTML='<section class="mg-panel"><h2>⏸ Misja zatrzymana</h2><p>Postęp zapisany na tym urządzeniu.</p>'+btn('▶️ Wznów','resume','mg-primary')+btn('📚 Wróć do wyboru','back')+'</section>';return}
  if(act==='hint'){hintLevel=Math.min(3,hintLevel+1);return draw()}
  if(act==='read-reset'){t.readTranscript='';t.readError='';t.readChecked=false;delete t.readScore;delete t.readHits;delete t.readTotal;delete t.readHeard;remember();draw();return;}
  if(act==='read-done')return; // nadal bez zaliczenia przez kliknięcie
  if(act==='draw-done'){answered=true;t.done=true;t.correct=true;points++;remember();return draw()}
  if(act==='clear-draw'){const c=root.querySelector('#mg-draw');c?.getContext('2d')?.clearRect(0,0,c.width,c.height);return}
  if(act==='next'){idx++;reset();remember();return draw()}
  if(act==='audio'){v774Normalize(t);if(subject(t)==='angielski'&&!englishAudioAllowed774(t))return;return speak(t.audio||t.question,subject(t)==='angielski'?'en-US':'pl-PL');}
  if(answered)return;
  if(act.startsWith('pick:'))return answer(t.options[Number(act.slice(5))]);
  if(act.startsWith('tile:')){const i=Number(act.slice(5));if(!tiles.includes(i)){tiles.push(i);draw()}return}
  if(act==='undo'){tiles.pop();return draw()}
  if(act==='submit')return answer(tiles.map(i=>t.chunks[i]).join(alphabeticOrderTask(t)||t.type==='spelling'?'':' '));
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
 // Dwie nowe aktywności na tych samych słówkach źródłowych.
 function v77ExtraWords(ps,rotation=0,explicitPool=null){const seen=new Set(),pool=(explicitPool||v76VocabularyPool(ps)).filter(x=>{const k=String(x.pl||'').trim().toLocaleLowerCase('pl-PL');if(!k||seen.has(k))return false;seen.add(k);return true});if(pool.length<3)return [];const rotate=[...pool.slice(rotation%pool.length),...pool.slice(0,rotation%pool.length)],entry=rotate.find(x=>/^[a-z]{2,14}$/.test(x.en));if(!entry)return [];
  const base={vocab76:true,sourcePageId:entry.sourcePageId,sourceBookId:entry.sourceBookId,sourceTitle:entry.sourceTitle,pageNumber:entry.pageNumber,done:false,correct:false};
  return [{...base,type:'vocab-build',question:'Listen and build the word from the letters.',questionPl:'Posłuchaj i ułóż słowo z liter.',answer:entry.en,wordEn:entry.en,promptPl:entry.pl,audio:entry.en,explanation:entry.en+' — '+entry.pl,options:[],letters:shuffle(Array.from(entry.en)),picked:[]},
   {...base,type:'vocab-match',question:'Match the English words with their Polish meanings.',questionPl:'Połącz angielskie słowa z ich polskimi znaczeniami.',answer:'Wszystkie pary',options:[],pairs:rotate.slice(0,4).map(x=>({en:x.en,pl:x.pl})),right:shuffle(rotate.slice(0,4).map((_,i)=>i)),matched:[],left:null,miss:false}];
 }
 function v77WordGameStage(t){let html='<div class="v76-word-card"><div class="v76-word-icon" aria-hidden="true">'+(t.type==='vocab-build'?'🧩':'🔗')+'</div><h3>'+escape(t.question)+'</h3><p class="mg-translation">'+escape(t.questionPl)+'</p>';
  if(t.type==='vocab-build'){html+=btn('🔊 Posłuchaj słowa','v77-model','mg-primary')+'<div class="v77-letter-slots" aria-label="Ułożone słowo">'+escape(t.picked.map(i=>t.letters[i]).join('')||'· '.repeat(t.letters.length))+'</div><div class="v77-letters">'+t.letters.map((l,i)=>'<button type="button" data-mg="v77-letter:'+i+'" '+(t.picked.includes(i)||answered?'disabled':'')+'>'+escape(l)+'</button>').join('')+'</div>'+btn('↩ Cofnij','v77-letter-undo')+btn('✓ Sprawdź słowo','v77-letter-check','mg-primary');}
  else{html+='<div class="v77-pair-board"><div>'+t.pairs.map((p,i)=>'<button type="button" data-mg="v77-pair-left:'+i+'" aria-pressed="'+(t.left===i)+'" '+(t.matched.includes(i)||answered?'disabled':'')+'>'+escape(p.en)+(t.matched.includes(i)?' ✓':'')+'</button>').join('')+'</div><div>'+t.right.map(i=>'<button type="button" data-mg="v77-pair-right:'+i+'" '+(t.matched.includes(i)||answered?'disabled':'')+'>'+escape(t.pairs[i].pl)+(t.matched.includes(i)?' ✓':'')+'</button>').join('')+'</div></div>';if(t.miss)html+='<p role="status">Jeszcze nie ta para. Spróbuj ponownie.</p>';}
  if(!answered)html+=btn('Pomiń bez zaliczenia — następne zadanie','skip');else html+='<div class="mg-feedback">🌟 Zadanie ukończone!</div>'+btn(idx===tasks.length-1?'🏆 Zakończ misję':'➡️ Następne zadanie','next','mg-primary');
  return html+'</div>'+tutorPanel();
 }
 function v77GameAction(act,t){if(!t||answered)return;
  if(act==='v77-model')return speakSequence([{text:t.audio,lang:'en-US',rate:.72}],{isCurrent:()=>task()===t&&root.isConnected});
  if(act.startsWith('v77-letter:')){const i=Number(act.slice(11));if(Number.isInteger(i)&&i>=0&&i<t.letters.length&&!t.picked.includes(i))t.picked.push(i);return draw()}
  if(act==='v77-letter-undo'){t.picked.pop();return draw()}
  if(act==='v77-letter-check')return answer(t.picked.map(i=>t.letters[i]).join(''));
  if(act.startsWith('v77-pair-left:')){const i=Number(act.slice(14));if(Number.isInteger(i)&&t.pairs[i]&&!t.matched.includes(i)){t.left=i;t.miss=false;draw()}return}
  if(act.startsWith('v77-pair-right:')){const i=Number(act.slice(15));if(t.left===null||!t.pairs[i]||t.matched.includes(i))return;if(t.left===i){t.matched.push(i);t.left=null;t.miss=false;audioCue(true);if(t.matched.length===t.pairs.length)return answer(t.answer)}else{t.miss=true;t.left=null;wrongAttempts++;audioCue(false)}return draw()}
 }

 // V77: gry budowane wyłącznie z odczytanej, wybranej strony.
 const v77Illustrated={cat:['kot','kot'],dog:['pies','pies'],sun:['słońce','słońce'],house:['dom','dom'],book:['książka','książka'],tree:['drzewo','drzewo'],bird:['ptak','ptak'],fish:['ryba','ryba'],apple:['jabłko','jabłko'],water:['woda','woda'],milk:['mleko','mleko'],car:['samochód','samochód'],ball:['piłka','piłka'],flower:['kwiat','kwiat'],school:['szkoła','szkoła'],'t shirt':['koszulka','koszulka'],shirt:['koszula','koszula'],skirt:['spódnica','spódnica'],shorts:['szorty','szorty'],trousers:['spodnie','spodnie'],dress:['sukienka','sukienka'],shoes:['buty','buty'],hat:['czapka','czapka'],socks:['skarpetki','skarpetki'],listen:['słuchać','słucha'],think:['myśleć','myśli'],say:['powiedzieć','mówi'],ask:['zapytać','pyta'],write:['pisać','pisze'],read:['czytać','czyta']};
 const v77Has=(text,word)=>(' '+String(text||'').toLocaleLowerCase('pl-PL').replace(/[^\p{L}\p{N}]+/gu,' ').trim()+' ').includes(' '+word.toLocaleLowerCase('pl-PL')+' ');
 function v77Art(key){
  const nounAssets=['cat','dog','sun','house','book','tree','bird','fish','apple','water','milk','car','ball','flower','school'];
  const title=v77Illustrated[key]?.[0]||'Ilustracja';
  if(nounAssets.includes(key))return '<img class="a77-picture" src="assets/art/vocab-'+key+'.svg" alt="'+escape(title)+'" draggable="false">';
  const clothes={'t shirt':'<path d="M55 31l-31 20 17 29 17-9v69h65V71l17 9 17-29-32-20-20 10H76Z" fill="#9dd09c"/><path d="M76 32q14 27 29 0" fill="none"/>',shirt:'<path d="M55 31l-31 20 17 29 17-9v69h65V71l17 9 17-29-32-20-20 10H76Z" fill="#50c9d3"/><path d="M76 32l-7 19 17-8 5 11 5-11 17 8-8-19M91 54v80" fill="none"/><circle cx="98" cy="75" r="2"/><circle cx="98" cy="91" r="2"/>',skirt:'<path d="M61 38h59l28 102H32Z" fill="#e885bc"/><path d="M62 38h58v15H62Z" fill="#9770cc"/><path d="M73 58l-12 72m34-72v72m12-72 15 72" fill="none"/>',shorts:'<path d="M47 43h86l5 82H98l-8-38-8 38H42Z" fill="#f3bb50"/><path d="M47 44h86v15H47M90 62v25M59 63q0 20-13 20m75-20q0 20 13 20" fill="none"/>',trousers:'<path d="M52 27h76l5 121h-32L90 75 79 148H47Z" fill="#6b9ae2"/><path d="M52 27h76v14H52M90 45v30M62 45q0 15-11 16m66-16q0 15 11 16" fill="none"/>',dress:'<path d="M62 25l-19 35 20 12-30 75h115l-31-75 20-12-20-35-15 15H77Z" fill="#ad87e7"/><path d="M63 72h54M77 26q12 32 25 0" fill="none"/>',shoes:'<path d="M25 85l17-28 32 11 12 38-2 23H22q-9-22 3-44M104 71l27-14 26 28q12 22 1 44H96l-2-23Z" fill="#ec7775"/><path d="M22 116h64m10 0h63M43 78l23 8m-27 5 32 9m50-22 23 9m-27 5 31 9" fill="none"/>',hat:'<path d="M44 105V80q0-47 46-47t46 47v25Z" fill="#ffc65c"/><path d="M30 100h119q15 4 8 18H24q-9-14 6-18" fill="#f18c76"/><circle cx="90" cy="28" r="13" fill="#b68cdd"/>',socks:'<path d="M41 31h35v72l-25 34q-28 7-30-16l20-26ZM107 31h35v72l-25 34q-28 7-30-16l20-26Z" fill="#67d6ad"/><path d="M41 48h35m31 0h35M28 106l24 17m42-17 24 17" fill="none"/>'};
  const faces='<circle cx="85" cy="62" r="29" fill="#ffd3a7"/><path d="M57 55q4-38 45-21l11 22-31-12Z" fill="#66508b"/><circle cx="75" cy="61" r="2"/><circle cx="95" cy="61" r="2"/><path d="M72 95q13-10 27 0l17 54H51Z" fill="#62b9d7"/>';
  const scenes={listen:faces+'<path d="M53 69V54q31-43 63 0v15" fill="none" stroke="#a17de0" stroke-width="9"/><rect x="46" y="57" width="13" height="29" rx="6" fill="#a17de0"/><rect x="109" y="57" width="13" height="29" rx="6" fill="#a17de0"/><path d="M136 49q18 18 0 36m12-49q27 31 0 62" fill="none" stroke="#efac3f"/>',think:faces+'<path d="M72 77q13 7 26 0" fill="none"/><circle cx="120" cy="29" r="5" fill="#fff"/><path d="M126 17q-18-17 6-21 18-8 24 8 20 20-1 27-16 9-29-14" fill="#fff"/><text x="135" y="19" fill="#7958b0" stroke="none" font-size="28" font-weight="900">?</text>',say:faces+'<ellipse cx="86" cy="77" rx="7" ry="6" fill="#aa5475"/><path d="M123 58q17 14 0 29m12-38q26 24 0 47" fill="none" stroke="#d88cc0"/>',ask:faces+'<path d="M103 105l33-40V39m-9 4 9 8 8-12" fill="none" stroke="#ffd3a7" stroke-width="12"/><text x="129" y="28" fill="#9572d6" stroke="none" font-size="33" font-weight="900">?</text>',write:'<rect x="29" y="24" width="109" height="126" rx="12" fill="#fff"/><path d="M43 54h55M43 73h43M43 92h30" stroke="#8caccb"/><path d="M75 123l58-79 15 13-58 79-23 8Z" fill="#ffc55d"/><path d="M67 144l8-21 15 13Z" fill="#715687"/>',read:faces+'<path d="M19 91q34-16 65 3 33-20 70-3v62q-35-17-70 1-31-17-65-1Z" fill="#ffdc88"/><path d="M84 94v60M31 109l39 5m27-1 43-5M32 128l37 5m29-1 41-5" fill="none"/>'};
  const body=clothes[key]||scenes[key];if(!body)return '';
  return '<svg class="a77-picture" viewBox="0 -8 180 180" role="img" aria-label="'+escape(title)+'"><rect x="3" y="0" width="174" height="164" rx="28" fill="#f0f9ff"/><g stroke="#385571" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">'+body+'</g></svg>';
 }
 function v77SourceVocabulary(p){const en=/ang|english/i.test(sourceBook(p)?.subject||'');return Object.entries(v77Illustrated).filter(([key,[pl,form]])=>v77Has(en&&key==='shirt'?String(p.text).replace(/\bt[ -]shirts?\b/gi,' '):p.text,en?key:form)).map(([key,[pl,form]])=>({key,label:en?key:form,pl,en:key,sourcePageId:p.id}));}
 function v77SourceMath(text){const found=[],seen=new Set();for(const m of String(text||'').matchAll(/(?<![\d.,])(\d{1,2})\s*([+−\-×*])\s*(\d{1,2})\s*=\s*(\d{1,3}|\?|_+)?/g)){const a=+m[1],b=+m[3],op=m[2],n=op==='+'?a+b:op==='-'||op==='−'?a-b:a*b,key=a+op+b;if(n<0||n>100||seen.has(key)||m[4]&&/^\d+$/.test(m[4])&&+m[4]!==n)continue;seen.add(key);found.push({a,b,op:op==='*'?'×':op,answer:n,label:a+' '+(op==='*'?'×':op)+' '+b})}return found;}
 function v77Garden(){return '<svg viewBox="0 0 400 250" aria-label="Kolorowy ogród" role="img"><rect width="400" height="250" fill="#c8efff"/><circle cx="325" cy="47" r="27" fill="#ffd56d"/><path d="M0 180Q100 100 220 180Q320 130 400 170V250H0" fill="#6bd6a0"/><path d="M55 190V85" stroke="#a07959" stroke-width="15"/><g fill="#3cac8d"><circle cx="55" cy="72" r="36"/><circle cx="30" cy="95" r="29"/><circle cx="80" cy="98" r="29"/></g><path d="M170 195v-72h94v72Z" fill="#fff1c4"/><path d="M153 128l66-53 64 53Z" fill="#e98599"/><rect x="207" y="150" width="24" height="45" rx="4" fill="#7c8ed0"/><g fill="#fff"><ellipse cx="135" cy="45" rx="40" ry="15"/><ellipse cx="174" cy="39" rx="30" ry="19"/></g><g stroke="#47996d" stroke-width="4"><path d="M295 231v-30m36 28v-41"/></g><g fill="#ef9ed6"><circle cx="295" cy="196" r="12"/><circle cx="331" cy="182" r="13"/></g></svg>';}
 function v77ActivityPool(ps,rotation=0){const out=[];
  for(const p of ps){const en=/ang|english/i.test(sourceBook(p)?.subject||''),subjectName=String(sourceBook(p)?.subject||'').toLocaleLowerCase('pl-PL'),words=v77SourceVocabulary(p),rotated=words.length?[...words.slice(rotation%words.length),...words.slice(0,rotation%words.length)]:[],items=rotated.slice(0,4);
   const base={visual77:true,sourcePageId:p.id,sourceBookId:p.bookId,sourceTitle:sourceLabel(p),pageNumber:p.number,options:[],done:false,correct:false};
   const add=(type,question,questionPl,answer,extra={})=>out.push({...base,type,question,questionPl,answer:String(answer),...extra});
   if(items.length>=3){
    add('gallery77',en?'Match the words to the pictures.':'Dopasuj podpisy do obrazków.',en?'Dopasuj angielskie podpisy do obrazków.':'','Wszystkie pary',{items,right:shuffle(items.map((_,i)=>i)),matched:[],left:null,miss:false,solutions77:items.map(x=>x.label+' — '+x.pl)});
    const target=items[rotation%items.length];add('radar77',en?'Listen and choose the picture.':'Posłuchaj i wybierz obrazek.',en?'Posłuchaj i wybierz pasujący obrazek.':'',target.key,{items:shuffle(items),audio:target.label,solutions77:[target.label+' — '+target.pl]});
    const objects=rotated.filter(x=>!['listen','think','say','ask','write','read'].includes(x.key)).slice(0,4),objectTarget=objects[rotation%Math.max(1,objects.length)];if(en&&v77Has(p.text,'circle')&&objects.length>=3)add('command77','Circle the '+objectTarget.label+'.','Otocz kółkiem: '+objectTarget.pl+'.',objectTarget.key,{items:shuffle(objects),solutions77:[objectTarget.label+' — '+objectTarget.pl]});
   }
   const object=rotated.find(x=>['cat','dog','ball','apple','book'].includes(x.key)),relations=['on','in','under','next to'].filter(x=>v77Has(p.text,x));
   if(en&&object&&relations.length&&v77Has(p.text,'box')){const target=relations[rotation%relations.length];add('scene77','Put the '+object.label+' '+target+' the box.','Umieść '+({cat:'kota',dog:'psa',apple:'jabłko',ball:'piłkę',book:'książkę'}[object.key]||object.pl)+' '+({'on':'na pudełku','in':'w pudełku','under':'pod pudełkiem','next to':'obok pudełka'}[target])+'.',target,{object,placed:null,solutions77:[object.label+' '+target+' the box']});}
   if(/polsk/.test(subjectName)){
    const cats=[['Rzeczowniki',['kot','pies','dom','las','ryba','drzewo','szkoła','książka','kwiat','piłka']],['Czasowniki',['czyta','pisze','biega','śpiewa','rysuje','rośnie','słucha','skacze','mówi']],['Przymiotniki',['mały','mała','duży','duża','zielony','zielona','czerwony','czerwona','wysoki','wysoka']]];
    const tokens=cats.flatMap(([category,list],index)=>list.filter(x=>v77Has(p.text,x)).map(word=>({word,category,index}))).slice(0,8);
    if(tokens.length>=3&&new Set(tokens.map(x=>x.index)).size>=2)add('sort77','Przenieś wyrazy do właściwych skrzyń.','','Wszystkie wyrazy',{tokens:shuffle(tokens),categories:cats.map(x=>x[0]),sorted:[],selected:null,miss:false,solutions77:tokens.map(x=>x.word+' — '+x.category)});
    const bank=readBank().filter(x=>v75MatchesPage(x,p)&&x.task?.needsSource===true&&x.task?.answer),candidate=bank.find(x=>{const ss=String(p.text).match(/[^.!?]+[.!?]+|[^.!?]+$/g)||[];return ss.filter(s=>visibleInText(s,x.task.answer)).length===1});
    if(candidate){const sentences=(String(p.text).match(/[^.!?]+[.!?]+|[^.!?]+$/g)||[]).map(s=>s.trim()).filter(Boolean),proof=sentences.find(s=>visibleInText(s,candidate.task.answer));if(proof&&sentences.length>=3)add('detective77','Znajdź zdanie, które uzasadnia odpowiedź: '+candidate.task.question,'',proof,{sentences:shuffle([proof,...sentences.filter(s=>s!==proof).slice(0,3)]),solutions77:[proof]});}
   }
   if(/matemat/.test(subjectName)){
    const sums=v77SourceMath(p.text);if(sums.length>=3){const exercises=[...sums.slice(rotation%sums.length),...sums.slice(0,rotation%sums.length)].slice(0,6);add('mosaic77','Rozwiąż działania i odkryj ilustrację.','','Mozaika odkryta',{exercises:exercises.map(ex=>({...ex,choices:shuffle([ex.answer,ex.answer+1,ex.answer?ex.answer-1:ex.answer+3,ex.answer+2])})),at:0,miss:false,solutions77:exercises.map(x=>x.label+' = '+x.answer)});}
    const sum=sums.find(x=>x.answer<=20);if(sum)add('workshop77','Włóż do skrzyni tyle kryształów, ile wynosi '+sum.label+'.','',''+sum.answer,{sum,count:0,solutions77:[sum.label+' = '+sum.answer]});
   }
  }
  return out;
 }
 function v77MixActivities(all,ps,explicitPool=null){if(mode==='test'||childGrade==='P')return all;const key='academy-v77-activity-rotation-'+child+'-'+ps.map(p=>p.id).join('|').slice(0,180);let at=0;try{at=Number(localStorage.getItem(key)||0)||0}catch{}const pool=v77ActivityPool(ps,Math.abs(at));if(!pool.length)return all;
  const byType=[...new Map(pool.map(t=>[t.type,t])).values()],rotated=[...byType.slice(Math.abs(at)%byType.length),...byType.slice(0,Math.abs(at)%byType.length)],result=[...all],slots=[0,3,6];
  for(let i=0;i<Math.min(slots.length,rotated.length);i++){if(slots[i]<result.length)result[slots[i]]=rotated[i];else if(result.length<10)result.push(rotated[i])}try{localStorage.setItem(key,String(at+1))}catch{}return result;
 }
 function v77VisualStage(t){let html='<div class="a77-board a77-'+t.type+'"><h3>'+escape(t.question)+'</h3>'+(subject(t)==='angielski'&&t.questionPl?'<p class="mg-translation">'+escape(t.questionPl)+'</p>':'');
  if(t.type==='gallery77'){html+='<p class="a77-instruction">Dotknij podpisu, potem pasującego obrazka.</p><div class="a77-matching"><div class="a77-labels">'+t.items.map((x,i)=>'<button data-mg="a77-left:'+i+'" '+(t.matched.includes(i)||answered?'disabled':'')+' aria-pressed="'+(t.left===i)+'">'+escape(x.label)+(t.matched.includes(i)?' ✓':'')+'</button>').join('')+'</div><div class="a77-images">'+t.right.map(i=>'<button data-mg="a77-right:'+i+'" '+(t.matched.includes(i)||answered?'disabled':'')+' aria-label="'+escape(t.items[i].pl)+'">'+v77Art(t.items[i].key)+(t.matched.includes(i)?'<span class="a77-check">✓</span>':'')+'</button>').join('')+'</div></div>';}
  if(['radar77','command77'].includes(t.type)){if(t.type==='radar77')html+='<div class="a77-radar"><div class="a77-radar-rings" aria-hidden="true"></div>'+btn('🔊 Posłuchaj','a77-audio','mg-primary')+'</div>';html+='<div class="a77-picture-choices">'+t.items.map((x,i)=>'<button class="'+(t.type==='command77'&&answered&&x.key===t.answer?'a77-circled':'')+'" data-mg="a77-picture:'+i+'" aria-label="'+escape(x.pl)+'" '+(answered?'disabled':'')+'>'+v77Art(x.key)+(answered&&x.key===t.answer?'<span class="a77-check">✓</span>':'')+'</button>').join('')+'</div>';}
  if(t.type==='scene77'){html+='<p class="a77-instruction">Dotknij wybranego miejsca, aby umieścić tam obrazek.</p><div class="a77-object">'+v77Art(t.object.key)+'</div><div class="a77-room"><div class="a77-box" aria-hidden="true"></div>'+['on','in','under','next to'].map((pos,i)=>'<button class="a77-zone zone-'+i+'" data-mg="a77-zone:'+i+'" aria-label="'+['Na pudełku','W pudełku','Pod pudełkiem','Obok pudełka'][i]+'" '+(answered?'disabled':'')+'>'+(t.placed===pos?v77Art(t.object.key):'<span aria-hidden="true">＋</span>')+'</button>').join('')+'</div>'+btn('✓ Sprawdź ustawienie','a77-scene-check','mg-primary');}
  if(t.type==='sort77'){html+='<div class="a77-sort-words">'+t.tokens.map((x,i)=>'<button data-mg="a77-token:'+i+'" aria-pressed="'+(t.selected===i)+'" '+(t.sorted.includes(i)||answered?'disabled':'')+'>'+escape(x.word)+'</button>').join('')+'</div><div class="a77-crates">'+t.categories.map((category,i)=>'<button data-mg="a77-crate:'+i+'" '+(answered?'disabled':'')+'><span class="a77-crate-art" aria-hidden="true"></span><strong>'+escape(category)+'</strong><small>'+escape(t.sorted.filter(j=>t.tokens[j].index===i).map(j=>t.tokens[j].word).join(', '))+'</small></button>').join('')+'</div><p class="a77-instruction">Dotknij wyrazu, a potem skrzyni.</p>';}
  if(t.type==='detective77'){html+='<div class="a77-detective-art" aria-hidden="true"><span></span><i></i></div><div class="a77-evidence">'+t.sentences.map((s,i)=>'<button data-mg="a77-evidence:'+i+'" '+(answered?'disabled':'')+'>'+escape(s)+'</button>').join('')+'</div>';}
  if(t.type==='mosaic77'){const n=t.exercises.length,ex=t.exercises[t.at];html+='<div class="a77-mosaic">'+v77Garden()+'<div class="a77-covers" style="--tiles:'+n+'">'+Array.from({length:n},(_,i)=>'<span class="'+(i<t.at?'a77-uncovered':'')+'" aria-hidden="true">✦</span>').join('')+'</div></div><p class="a77-round">Odkryto '+t.at+' z '+n+' fragmentów</p>';if(ex){const choices=ex.choices;html+='<div class="a77-equation">'+escape(ex.label)+' = ?</div><div class="a77-numbers">'+choices.map(value=>btn(String(value),'a77-number:'+value)).join('')+'</div>';}}
  if(t.type==='workshop77'){html+='<div class="a77-equation">'+escape(t.sum.label)+' = ?</div><div class="a77-treasure" aria-label="Kryształy w skrzyni">'+Array.from({length:t.count},()=>'<span class="a77-gem" aria-hidden="true"></span>').join('')+'</div><p>W skrzyni: <strong>'+t.count+'</strong></p><div class="a77-workshop-tools">'+btn('＋ Dołóż kryształ','a77-add')+btn('− Zabierz kryształ','a77-remove')+'</div>'+btn('✓ Sprawdź skrzynię','a77-count-check','mg-primary');}
  if(t.miss&&!answered)html+='<p class="a77-try" role="status">Jeszcze nie. Spróbuj ponownie — wybrane elementy możesz zmienić.</p>';
  if(answered)html+='<div class="a77-finish" role="status"><span aria-hidden="true">✦</span> Brawo! Gotowe.</div>'+btn(idx===tasks.length-1?'🏆 Zakończ misję':'➡️ Następne zadanie','next','mg-primary');else html+=btn('Pomiń bez zaliczenia — następne zadanie','skip');
  return html+'</div>'+tutorPanel();
 }
 function v77VisualAction(act,t){if(!t?.visual77||answered)return;const pick=Number(act.slice(act.indexOf(':')+1));
  const miss=()=>{t.miss=true;wrongAttempts++;audioCue(false);remember();draw()};
  const done=()=>{t.miss=false;answer(t.answer)};
  if(act==='a77-audio')return speakSequence([{text:t.audio,lang:subject(t)==='angielski'?'en-US':'pl-PL',rate:.76}],{isCurrent:()=>root.isConnected&&task()===t});
  if(act.startsWith('a77-left:')){if(t.items[pick]&&!t.matched.includes(pick)){t.left=pick;t.miss=false;draw()}return}
  if(act.startsWith('a77-right:')){if(t.left===null||!t.items[pick]||t.matched.includes(pick))return;if(t.left===pick){t.matched.push(pick);t.left=null;t.miss=false;audioCue(true);if(t.matched.length===t.items.length)return done();remember();draw()}else{t.left=null;miss()}return}
  if(act.startsWith('a77-picture:')){const x=t.items[pick];if(!x)return;return x.key===t.answer?done():miss()}
  if(act.startsWith('a77-zone:')){const pos=['on','in','under','next to'][pick];if(pos){t.placed=pos;t.miss=false;remember();draw()}return}
  if(act==='a77-scene-check')return t.placed===t.answer?done():miss();
  if(act.startsWith('a77-token:')){if(t.tokens[pick]&&!t.sorted.includes(pick)){t.selected=pick;t.miss=false;draw()}return}
  if(act.startsWith('a77-crate:')){const selected=t.selected;if(selected===null||!t.tokens[selected])return;if(t.tokens[selected].index===pick){t.sorted.push(selected);t.selected=null;t.miss=false;audioCue(true);if(t.sorted.length===t.tokens.length)return done();remember();draw()}else{t.selected=null;miss()}return}
  if(act.startsWith('a77-evidence:'))return t.sentences[pick]===t.answer?done():miss();
  if(act.startsWith('a77-number:')){const ex=t.exercises[t.at];if(!ex)return;if(ex.answer!==pick)return miss();t.at++;t.miss=false;audioCue(true);if(t.at===t.exercises.length)return done();remember();draw();return}
  if(act==='a77-add'||act==='a77-remove'){t.count=Math.max(0,Math.min(22,t.count+(act==='a77-add'?1:-1)));t.miss=false;remember();draw();return}
  if(act==='a77-count-check')return t.count===+t.answer?done():miss();
 }

 if(batchGenerate){
  // Ta sama funkcja pytan/filtr co w treningu. Zapisywanie odbywa sie po kazdej stronie.
  const work=(async()=>{
   const targetPages=(batchGenerate.pages||[]).filter(p=>p.text?.trim());
   let done=0,failed=0,added=0;
   for(let index=0;index<targetPages.length;index++){
    const p=targetPages[index];
    if(batchGenerate.shouldStop?.())break;
    bookId=p.bookId;
    batchGenerate.onProgress?.({done,failed,added,total:targetPages.length,page:p.number,index,finished:false});
    const excluded=readBank().filter(x=>v75MatchesPage(x,p)).slice(-35).map(x=>x.task?.question||'');
    try{
     const items=parse(await ask(pagePrompt(p,excluded),16000)).filter(t=>t.type!=='reading'&&reliableTask(t,p));
     if(items.length){storeTasks(items,p);added+=items.length;done++}
     else failed++;
    }catch(err){failed++;console.warn('Pytania AI strona '+p.number,err)}
    batchGenerate.onProgress?.({done,failed,added,total:targetPages.length,page:p.number,index:index+1,finished:true});
   }
   return {done,failed,added,total:targetPages.length,paused:!!batchGenerate.shouldStop?.()};
  })();
  return {work};
 }
 if(launch){mode=launch.mode==='test'?'test':'game';start();return {open:start}}
 setup();return {open:setup};
}

// V75_AUDYT_ZGODNOSCI_3

// V75_AUDYT_ZGODNOSCI_4

