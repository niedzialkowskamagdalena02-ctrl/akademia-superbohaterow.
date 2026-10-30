// V48_AI_RESPONSE_DIAGNOSTICS
// V44_BULK_CHAPTERS
// V42_CHAPTERS
import {mountMissionGame} from './mission-game.js?v=76-k2';
import { initHeadquarters3D } from './headquarters3d.js';
import {initial,get,put,del,allRecords,replaceRecords,compress,uid,gradeName} from './data.js';
import {speak,listen,stopVoice,getVoiceState,setVoiceState} from './voice.js?v=76-k2';
import {vocabulary,readings,explanation} from './learning.js';
import {syncAdapter} from './sync.js';
import {BASE_ITEMS,baseMarkup,migrateBase} from './base.js';
import {mountArcade,stopArcade} from './arcade.js';
let mentorHistory={tech:[],fun:[]};
// V53_AI_RETRY_ONLY — prawdziwe odpowiedzi AI, anulowanie starych zapytań
const AI_MENTOR_URL='https://akademia-ai.niedzialkowskamagdalena02.workers.dev/mentor-ai';
const AI_FRIENDLY_MESSAGE='🦸 Mentor chwilowo nie może odpowiedzieć. Spróbuj jeszcze raz za moment.';
const aiRequests=new Map();
function cancelAIRequests(){for(const controller of aiRequests.values())controller.abort();aiRequests.clear()}
function beginAIRequest(key){aiRequests.get(key)?.abort();const controller=new AbortController();aiRequests.set(key,controller);setVoiceState('thinking');return controller}
function finishAIRequest(key,controller){if(aiRequests.get(key)===controller)aiRequests.delete(key);if(!aiRequests.size&&getVoiceState()==='thinking')setVoiceState('idle')}
function aiWait(ms,signal){return new Promise((resolve,reject)=>{
 let done=false;
 const onAbort=()=>{if(done)return;done=true;clearTimeout(timer);reject(new DOMException('Cancelled','AbortError'))};
 if(signal?.aborted){reject(new DOMException('Cancelled','AbortError'));return}
 const timer=setTimeout(()=>{done=true;signal?.removeEventListener('abort',onAbort);resolve()},ms);
 signal?.addEventListener('abort',onAbort,{once:true});
})}
async function askMentorAI(question,mentor,history=[],signal){
 for(let attempt=0;attempt<2;attempt++){
  if(signal?.aborted)throw new DOMException('Cancelled','AbortError');
  const request=new AbortController();
  let timedOut=false;
  const onAbort=()=>request.abort();
  signal?.addEventListener('abort',onAbort,{once:true});
  const timer=setTimeout(()=>{timedOut=true;request.abort()},28000);
  try{
   const response=await fetch(AI_MENTOR_URL,{method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({question,mentor,history}),signal:request.signal});
   let result=null;
   try{result=await response.json()}catch{}
   if(response.ok&&typeof result?.answer==='string'&&result.answer.trim())return result.answer.trim();
   const error=new Error('AI HTTP '+response.status);
   error.retryable=(!response.ok&&(response.status===408||response.status===425||response.status===429||response.status>=500));
   throw error;
  }catch(error){
   if(signal?.aborted)throw error;
   if(attempt===1||!(error.retryable||timedOut||error.name==='TypeError'))throw error;
  }finally{clearTimeout(timer);signal?.removeEventListener('abort',onAbort)}
  await aiWait([900,1900,3600][attempt],signal);
 }
 throw Error('AI unavailable');
}

let testMode=false,testSnapshot=null;let previewAll=false;let data,role='',who='',tab='home',adminTab='home',bookId='',pageId='',missionId='',practice=null,practiceAnswered=false,tracePoints=[],traceDown=false,traceMask=null;
const app=document.querySelector('#app'), $=id=>document.getElementById(id), e=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const date=()=>new Date().toISOString().slice(0,10), profile=()=>data.profiles[who], books=()=>data.books.filter(b=>v76Audience(b).includes(who)), pages=id=>data.books.length?null:null;
const speakBtn=(s,lang='pl-PL')=>`<button class="listen" data-speak="${e(s)}" data-lang="${lang}" title="Odsłuchaj" aria-label="Odsłuchaj">🔊</button>`;
const button=(name,action,cls='alt')=>`<button class="${cls}" data-action="${action}">${name}</button>`;
const input=(id,label,value='',type='text')=>`<label for="${id}">${label}</label><input id="${id}" type="${type}" value="${e(value)}">`;
const select=(id,label,options,value)=>`<label for="${id}">${label}</label><select id="${id}">${options.map(([v,t])=>`<option value="${e(v)}" ${v===value?'selected':''}>${e(t)}</option>`).join('')}</select>`;
const grades=[['P','Przedszkole'],...Array.from({length:12},(_,i)=>[String(i+1),`Klasa ${i+1}`])];
const people=[['pawel','Paweł'],['patryk','Patryk']];
const note=t=>{const n=$('notice');if(!n){console.warn('Powiadomienie:',t);return}n.textContent=t;n.classList.add('visible');setTimeout(()=>{if(n.isConnected)n.classList.remove('visible')},4500)};
const save=async()=>{if(testMode)return;await put('state',data);await syncAdapter.onLocalChange(data)};
const img=async id=>{const blob=await get('image:'+id);return blob?URL.createObjectURL(blob):''};
let ocrBusy=false;
// V67: jedna operacja zapisu na raz; bez podwojnych klikniec.
let adminActionBusy=false;
let bulkAiBusy=false;
let bulkAiPauseRequested=false;
let questionBuildBusy=false,questionBuildStop=false;
function subjectsOfChild(id){
 const p=data.profiles?.[id];return [...new Set((p?.subjects||[]).map(s=>String(s).trim()).filter(Boolean))];
}
function selectedSubjectValue(child,previous=''){
 const list=subjectsOfChild(child);
 return list.find(s=>s.toLocaleLowerCase('pl-PL')===String(previous).toLocaleLowerCase('pl-PL'))||list[0]||'';
}
function bookSubjectSelect(child,previous=''){
 const items=subjectsOfChild(child);
 return select('bsubject','Przedmiot — z profilu dziecka',items.length?items.map(s=>[s,s]):[['','Najpierw zaznacz przedmioty w profilu dziecka']],selectedSubjectValue(child,previous));
}
function refreshBookSubjectSelect(){
 const target=$('bsubject'),child=$('bchild')?.value;
 if(!target||!child)return;
 const was=target.value;target.replaceChildren();
 const items=subjectsOfChild(child);
 for(const s of (items.length?items:[''])){
  const option=document.createElement('option');option.value=s;option.textContent=s||'Najpierw zaznacz przedmioty dziecka';target.appendChild(option);
 }
 target.value=selectedSubjectValue(child,was);
}
function languageOfBook(b){return /ang|english/i.test(b?.subject||'')?'eng':'pol'}
function bookPageNumberLocation(b){return b?.pageNumberPosition==='top'?'top':'bottom'}
async function ensureNumberLocation(b){
 if(!b)return false;
 if(b.pageNumberPosition==='top'||b.pageNumberPosition==='bottom')return true;
 const choice=prompt('Gdzie AI ma szukać drukowanego numeru strony w tej książce?\n\n1 — NA DOLE strony (np. przy łapce)\n2 — NA GÓRZE strony\n\nWybierz 1 lub 2. Pytanie pojawi się tylko raz dla tej książki.','1');
 if(choice===null)return false;
 if(choice.trim()!=='1'&&choice.trim()!=='2')throw Error('Wybierz 1 (dół) albo 2 (góra).');
 b.pageNumberPosition=choice.trim()==='2'?'top':'bottom';await save();
 note('✅ Zapisano położenie numeru strony: '+(b.pageNumberPosition==='top'?'na górze':'na dole')+'.');return true;
}
function v73BookFields(b=null){
 const kind=b?.kind||'Podręcznik',part=String(b?.part||'1');
 const options=[['','—'],...Array.from({length:20},(_,i)=>[String(i+1),String(i+1)])];
 return `<div id="v73-book-part" ${kind==='Inne'?'hidden':''}>${select('bpart','Część',options,part)}</div><div id="v73-book-title" ${kind==='Inne'?'':'hidden'}>${input('btitle','Nazwa / opis materiału',b?.title||'')}</div>`;
}

function bookBankItems(b){try{const v=JSON.parse(localStorage.getItem('academy-v48-bank-'+b.child+'-'+b.id)||'[]');return Array.isArray(v)?v:[]}catch{return []}}
function questionCountOnPage(b,p,bank=bookBankItems(b)){
 const id=String(p.id),num=String(p.number);
 return bank.filter(x=>{
  const ids=(x.pageIds||[]).map(String);
  return ids.includes(id)||(!ids.some(v=>v.length>5)&&ids.includes(num));
 }).length;
}
function pageState(b,p,bank){
 if(!p.text?.trim())return {css:'missing',text:'⬜ BRAK TEKSTU'};
 const n=questionCountOnPage(b,p,bank);
 if(!p.reviewed)return {css:'ready',text:'🟡 TEKST ODCZYTANY · do sprawdzenia'+(n?' · zapisane pytania: '+n:'')};
 return n?{css:'questions',text:'🟢 ZATWIERDZONA · '+n+' pytań AI'}:{css:'approved',text:'🟠 ZATWIERDZONA · czeka na pytania'};
}
function filterBookPages(value){
 const b=data.books.find(x=>x.id===bookId);if(!b)return;
 const bank=bookBankItems(b);let shown=0;
 document.querySelectorAll('[data-admin-page-id]').forEach(el=>{
  const p=data.bookPages.find(x=>x.id===el.dataset.adminPageId);
  const state=p?pageState(b,p,bank).css:'missing';
  const yes=value==='all'||(value==='missing'&&state==='missing')||(value==='ready'&&state==='ready')||(value==='approved'&&state==='approved')||(value==='questions'&&state==='questions');
  el.hidden=!yes;if(yes)shown++;
 });
 const el=$('page-filter-count');if(el)el.textContent='Widoczne: '+shown;const toolbar=$('v75-page-toolbar');if(toolbar)toolbar.hidden=!shown;
}
// V75: panel rodzica, różnorodne zadania, materiały wspólne i trening przedszkolaka.
// V75_AUDYT_ZGODNOSCI_2
function v75ShareControls(b){
 const ids=people.filter(([id])=>id!==b.child);
 if(!ids.length)return '';
 return `<fieldset class="v75-share"><legend>👨‍👩‍👧‍👦 Udostępnij innym dzieciom</legend><small>Jedna książka i jedne zdjęcia — bez kopiowania plików.</small>${ids.map(([id,name])=>`<label><input type="checkbox" data-v75-share="${e(id)}" ${(b.sharedWith||[]).includes(id)?'checked':''}> ${e(name)}</label>`).join('')}</fieldset>`;
}
function v75QuestionToolbar(){return `<div class="v75-bank-tools"><button type="button" data-action="v75:select:all">☑ Zaznacz wszystko</button><button type="button" data-action="v75:select:none">Odznacz</button><button type="button" data-action="v75:questions:delete" class="line">🗑 Usuń zaznaczone</button><small id="v75-selected-count">Zaznaczono: 0</small></div>`}
function v75QuestionRow(x,p){
 const t=x.task||{},key=encodeURIComponent(String(x.key));
 const options=Array.isArray(t.options)?t.options:[],source=v74SourceForQuestion(t,p);
 const flagged=!!x.v75Flagged;
 return `<div class="v75-question-wrap ${flagged?'v75-question-alert':''}"><label class="v75-bank-check"><input type="checkbox" data-v75-bank-check="${e(key)}" aria-label="Zaznacz pytanie"> Zaznacz</label>
 <details class="v74-question"><summary>${flagged?'⚠️ ':''}${e(t.question||'Bez pytania')} <small>(${e(t.type||'pytanie')})</small></summary>
 <div class="v74-qedit" data-v74-edit="${e(key)}">
 ${flagged?`<p class="v75-flag">⚠️ Do weryfikacji: ${e(x.v75Reason||'Sprawdź logikę i odpowiedzi.')}</p><button type="button" data-action="v75:questions:suggest:${key}">🤖 Zaproponuj poprawkę przez AI</button>`:''}
 <label>Pytanie<textarea data-v74-field="question" rows="3">${e(t.question||'')}</textarea></label>
 <label>Polskie tłumaczenie polecenia (angielski)<textarea data-v75-field="questionPl" rows="2">${e(t.questionPl||'')}</textarea></label>
 <label>Poprawna odpowiedź<input data-v74-field="answer" value="${e(t.answer||'')}"></label>
 <label>Opcje / hasła — jedno w wierszu<textarea data-v74-field="options" rows="4">${e(options.join('\n'))}</textarea></label>
 <label>Wyjaśnienie<textarea data-v74-field="explanation" rows="2">${e(t.explanation||'')}</textarea></label>
 ${source.text?`<details class="v74-source"><summary>📖 Cytat lub fragment do sprawdzenia</summary><small>${e(source.label)}</small><blockquote>${e(source.text)}</blockquote></details>`:''}
 <div class="v74-admin-row v74-qbuttons"><button type="button" disabled data-action="book:save-question:${key}">💾 Zapisz</button><button type="button" class="alt" data-action="book:cancel-question:${key}">Anuluj</button><button type="button" class="line" data-action="book:delete-question:${key}">🗑 Usuń</button></div>
 </div></details></div>`;
}
function v75BankMatchesPage(x,p){
 const ids=(x.pageIds||[]).map(String),linked=data.bookPages.filter(q=>q.bookId===p.bookId&&ids.includes(String(q.id)));
 return linked.length?linked.some(q=>String(q.id)===String(p.id)):ids.includes(String(p.number));
}
function v75Review(b){
 const bank=bookBankItems(b),pages=sortedBookPages(b.id).filter(p=>p.text?.trim());
 const matches=v75BankMatchesPage;
 const groups=pages.map(p=>({p,items:bank.filter(x=>matches(x,p))}));
 const assigned=new Set(groups.flatMap(g=>g.items.map(x=>x.key)));
 const unassigned=bank.filter(x=>!assigned.has(x.key));
 const source=(p)=>`<div class="v75-page-source"><h4>📷 Zdjęcie strony ${e(p.number)}</h4><img class="pagephoto" data-v75-lazy-image="${p.imageId}" alt="Zdjęcie strony ${p.number}" loading="lazy"><details open><summary>📖 Rozpoznany tekst strony</summary><div class="v75-source-text">${e(p.text||'')}</div></details></div>`;
 return `<section class="card v74-bank-review v75-review">${button('← Do książki','admin:book')}<h2>🔎 Kontrola pytań AI</h2><p>Otwórz stronę, porównaj tekst i zdjęcie, a następnie popraw albo zaznacz pytania do usunięcia.</p>
 <p><b>${bank.length}</b> pytań · <b>${groups.filter(g=>g.items.length).length}</b> stron</p>
 <div class="v75-review-ai">${button('🤖 Sprawdź logikę trzema AI','v75:questions:ai','gold')} ${button('⏸ Zatrzymaj kontrolę','v75:questions:stop')} ${button('🛡️ Szybka kontrola techniczna','v75:questions:check')}<small class="v75-review-progress">Trzy niezależne opinie — bez automatycznego zmieniania pytań. Błędne zadania będą pomarańczowe.</small></div>
 ${v75QuestionToolbar()}
 ${groups.filter(g=>g.items.length).map(g=>`<details class="v74-review-page"><summary>📄 Strona ${e(g.p.number)} — ${g.items.length} pytań</summary>${source(g.p)}<div class="v75-page-qbar">${button('☑ Zaznacz tę stronę','v75:select:all')}${button('Odznacz tę stronę','v75:select:none')}</div>${g.items.map(x=>v75QuestionRow(x,g.p)).join('')}</details>`).join('')}
 ${unassigned.length?`<details class="v74-review-page"><summary>⚠️ Bez przypisanej strony — ${unassigned.length}</summary>${unassigned.map(x=>v75QuestionRow(x,null)).join('')}</details>`:''}</section>`;
}
function v75BankChecks(){const boxes=[...document.querySelectorAll('[data-v75-bank-check]:checked')];const out=document.getElementById('v75-selected-count');if(out)out.textContent='Zaznaczono: '+boxes.length;return boxes}
function v75BankDelete(){const selected=new Set(v75BankChecks().map(x=>decodeURIComponent(x.dataset.v75BankCheck)));if(!selected.size)return note('Najpierw zaznacz pytania.');const b=data.books.find(x=>x.id===bookId);if(!b)return;
 if(!confirm('Usunąć '+selected.size+' zaznaczonych pytań z tej książki? Nie usunie to stron ani zdjęć.'))return;
 const saved=bookBankItems(b).filter(x=>!selected.has(String(x.key)));
 localStorage.setItem('academy-v48-bank-'+b.child+'-'+b.id,JSON.stringify(saved));render();note('✅ Usunięto zaznaczone pytania.');
}
function v75CheckQuestionLogic(){
 const b=data.books.find(x=>x.id===bookId);if(!b)return;
 const bank=bookBankItems(b);let flagged=0;
 for(const x of bank){const t=x.task||{},op=t.options||[],reason=[];
  if(!t.question?.trim()||!t.answer?.trim())reason.push('Brak pytania lub poprawnej odpowiedzi');
  if(op.length!==4)reason.push('Nie ma czterech odpowiedzi');
  if(op.filter(y=>String(y).trim().toLowerCase()===String(t.answer||'').trim().toLowerCase()).length!==1)reason.push('Poprawna odpowiedź musi występować dokładnie raz');
  if(new Set(op.map(y=>String(y).trim().toLowerCase())).size!==op.length)reason.push('Powtarzające się odpowiedzi');
  if(/angiel|english/i.test(b.subject||'')&&(/które angielskie słowo.*oznacza/i.test(t.question||''))&&String(t.sourceQuote||'').includes(String(t.answer||'')+' |'))reason.push('Odpowiedź widoczna bezpośrednio w źródle');
  if(reason.length){x.v75Flagged=true;x.v75Reason=[x.v75Reason,...reason].filter(Boolean).join('; ').slice(0,500)}if(x.v75Flagged)flagged++;
 }
 localStorage.setItem('academy-v48-bank-'+b.child+'-'+b.id,JSON.stringify(bank));render();note(flagged?'⚠️ Zaznaczono '+flagged+' pytań wymagających uwagi.':'✅ Podstawowa kontrola nie wykryła oczywistych błędów.');
}
async function v75SuggestQuestion(key,btn){
 const b=data.books.find(x=>x.id===bookId),item=b?bookBankItems(b).find(x=>String(x.key)===key):null;
 if(!item)return note('Nie znaleziono pytania.');
 const box=btn.closest('[data-v74-edit]');if(!box)return;
 const page=sortedBookPages(b.id).find(p=>v75BankMatchesPage(item,p));
 const prompt='Jestes kontrolerem jakosci zadania dla dziecka. Popraw LOGIKE tego zadania bez wymyslania faktow. Miej JEDNA jednoznacznie poprawna odpowiedz i 4 rozne opcje. Dla angielskiego nie stosuj czytania ze zrozumieniem z odpowiedzia wprost w tekście zrodlowym. Polecenie po angielsku w question, polskie tlumaczenie samego polecenia w questionPl (bez odpowiedzi). Zwroc TYLKO JSON: {"question":"...","questionPl":"...","answer":"...","options":["...","...","...","..."],"explanation":"krótkie wyjaśnienie po odpowiedzi"}. Aktualne zadanie: '+JSON.stringify(item.task||{})+'. Tekst strony: '+String(page?.text||'').slice(0,2000);
 btn.disabled=true;const before=btn.textContent;btn.textContent='⏳ AI przygotowuje propozycję…';
 try{const raw=await askMentorAI(prompt,'tech'),clean=String(raw).replace(/```(?:json)?/g,'').replace(/```/g,'').trim();let obj;try{obj=JSON.parse(clean)}catch{obj=JSON.parse(clean.slice(clean.indexOf('{'),clean.lastIndexOf('}')+1))}
  if(!obj?.question||!obj?.answer||!Array.isArray(obj?.options)||obj.options.length!==4||obj.options.filter(x=>String(x).trim()===String(obj.answer).trim()).length!==1)throw Error('AI nie przygotowało poprawnej propozycji.');
  for(const [field,val] of Object.entries({question:obj.question,answer:obj.answer,options:obj.options.join('\n'),explanation:obj.explanation||''})){
   const el=box.querySelector('[data-v74-field="'+field+'"]');if(el)el.value=val;
  }
  const pl=box.querySelector('[data-v75-field="questionPl"]');if(pl)pl.value=String(obj.questionPl||'');
  const saveBtn=box.querySelector('[data-action^="book:save-question:"]');if(saveBtn)saveBtn.disabled=false;
  note('🟠 AI wpisało propozycję. Sprawdź ją przed naciśnięciem Zapisz.');
 }catch(err){note('❌ '+v75PolishError(err))}finally{if(btn.isConnected){btn.disabled=false;btn.textContent=before}}
}

let v75ReviewStop=false;
// V76: minimum dwa niezalezne, zwalidowane raporty; scalanie tylko niezmienionych pytan.
let v76ReviewRunning=false,v76ReviewController=null;
function v76ValidReports(reviews,size){
 const providers=new Set(['gemini','groq','workers-ai']),seen=new Set();
 return (Array.isArray(reviews)?reviews:[]).filter(r=>{
  if(!providers.has(r?.provider)||seen.has(r.provider)||!Array.isArray(r.issues))return false;
  if(r.issues.some(x=>!x||!['number','string'].includes(typeof x.index)||String(x.index).trim()===''||!Number.isInteger(Number(x.index))||Number(x.index)<0||Number(x.index)>=size||typeof x.reason!=='string'||!x.reason.trim()))return false;
  seen.add(r.provider);return true;
 });
}
async function v75ReviewWithThreeAI(btn){
 const b=data.books.find(x=>x.id===bookId);if(!b)return;
 if(v76ReviewRunning)return note('Kontrola już trwa.');
 const bank=bookBankItems(b);if(!bank.length)return note('Brak pytań do sprawdzenia.');
 if(!confirm('Sprawdzić jakość pytań? Wystarczą dwa niezależne raporty AI. Propozycje wymagają Twojej weryfikacji.'))return;
 const pages=sortedBookPages(b.id);v75ReviewStop=false;v76ReviewRunning=true;let checked=0,marked=0,stale=0,minReports=3,diagnostics='';
 if(btn){btn.disabled=true;btn.textContent='⏳ Analizuję pytania…'}
 try{
  for(let i=0;i<bank.length;i+=4){if(v75ReviewStop)break;
   const group=bank.slice(i,i+4),snapshots=group.map(x=>JSON.stringify(x.task));
   const qs=group.map(x=>{const p=pages.find(p=>v75BankMatchesPage(x,p));return {question:x.task?.question||'',answer:x.task?.answer||'',options:x.task?.options||[],sourceQuote:x.task?.sourceQuote||'',source:(p?.text||'').slice(0,1800)}});
   const ac=new AbortController();v76ReviewController=ac;const timer=setTimeout(()=>ac.abort(),30000);let response,res;
   try{response=await fetch('https://akademia-ai.niedzialkowskamagdalena02.workers.dev/review-three',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({questions:qs,subject:b.subject}),signal:ac.signal});res=await response.json()}finally{clearTimeout(timer);if(v76ReviewController===ac)v76ReviewController=null}
   if(v75ReviewStop)break;
   if(!response.ok)throw Error(res?.error||'Błąd weryfikacji AI');
   const reports=v76ValidReports(res.reviews,group.length);
   diagnostics=(res.reviews||[]).filter(r=>!reports.includes(r)).map(r=>String(r.provider||'model')+': '+(/^(missing-key|missing-binding|timeout|invalid-review|empty-response|HTTP-\d{3})$/.test(r.code||'')?r.code:'brak prawidłowego raportu')).join('; ');
   if(reports.length<2)throw Error('Odpowiedziało '+reports.length+' z 3 modeli. Potrzebne są co najmniej dwa. '+diagnostics);
   minReports=Math.min(minReports,reports.length);
   const fresh=bookBankItems(b);let applied=0;
   for(let j=0;j<group.length;j++){
    const item=fresh.find(x=>String(x.key)===String(group[j].key));
    if(!item||JSON.stringify(item.task)!==snapshots[j]){stale++;continue}
    const errors=reports.flatMap(r=>r.issues.filter(z=>Number(z.index)===j).map(z=>r.provider+': '+z.reason.trim()));
    item.v75Flagged=errors.length>0;item.v75Reason=errors.join(' | ').slice(0,650);
    item.v76Review={count:reports.length,providers:reports.map(r=>r.provider),at:new Date().toISOString(),status:errors.length?'do poprawy':'bez zgłoszonych uwag'};
    if(errors.length)marked++;checked++;applied++;
   }
   // Usunieta w czasie kontroli ksiazka nie moze odtworzyc banku.
   if(applied&&data.books.some(x=>x.id===b.id))localStorage.setItem('academy-v48-bank-'+b.child+'-'+b.id,JSON.stringify(fresh));
   const el=bookId===b.id?document.querySelector('.v75-review-progress'):null;
   if(el)el.textContent='Sprawdzono '+checked+'/'+bank.length+' pytań · '+reports.length+' z 3 AI · do poprawy: '+marked+(diagnostics?' · '+diagnostics:'');
  }
  if(bookId===b.id&&adminTab==='question-review')render();
  note((v75ReviewStop?'⏸ Zatrzymano. ':'✅ ')+checked+' pytań · '+(checked?minReports+' z 3 AI':'bez nowych ocen')+' · do poprawy: '+marked+(stale?' · pominięto zmienione/usunięte: '+stale:'')+(diagnostics?' · '+diagnostics:''));
 }catch(err){note(v75ReviewStop?'⏸ Kontrola zatrzymana. Ukończone partie zapisano.':'❌ '+(err.name==='AbortError'?'Przekroczono czas kontroli. Spróbuj ponownie.':v75PolishError(err))+'. Ukończone partie zapisano.')}
 finally{v76ReviewRunning=false;v76ReviewController=null;if(btn?.isConnected){btn.disabled=false;btn.textContent='🤖 Sprawdź jakość pytań'}}
}

function v75PreschoolView(){return `<section class="v75-preschool"><div class="v75-preschool-orbit" aria-hidden="true">🌍<span>⭐</span><span>🦋</span></div><h2>Odkrywaj świat z bohaterami!</h2><div class="v75-pre-buttons"><button data-action="v75:pre:game">🎮 Sala treningowa<small>Uczymy się przez zabawę</small></button><button data-action="v75:pre:test">🏆 Próba bohatera<small>Pokaż, co już umiesz</small></button></div></section>`}
function v75PolishError(err){const msg=String(err?.message||err||'');if(/Cannot set properties of undefined|Cannot read properties of null|textContent/i.test(msg))return 'Nie udało się odświeżyć elementu ekranu. Spróbuj ponownie otworzyć książkę.';if(/Failed to fetch|NetworkError|fetch failed/i.test(msg))return 'Brak połączenia z usługą AI. Sprawdź internet i spróbuj ponownie.';if(/Quota|rate limit|429/i.test(msg))return 'Usługa AI jest chwilowo przeciążona. Spróbuj później.';return msg}

// Zadania AI poza podręcznikiem są zapisywane osobno dla dziecka i przedmiotu.
function v75OutsideKey(child,subject){return 'academy-v75-outside-'+child+'-'+subject}
function v75OutsideBank(child,subject){try{const a=JSON.parse(localStorage.getItem(v75OutsideKey(child,subject))||'[]');return Array.isArray(a)?a:[]}catch{return []}}
function v75OutsidePanel(){
 const subjects=[['polski','Polski'],['matematyka','Matematyka'],['angielski','Angielski'],['przyroda','Przyroda'],['all','Wiedza ogólna'],['przedszkole','Przedszkole']];
 return `<section class="card v75-outside-bank"><h2>⚡ Baza pytań poza podręcznikami</h2><p>Oddzielna baza dla każdego dziecka. AI generuje propozycje, które możesz obejrzeć i usunąć przed treningiem.</p>
 <label>Dziecko<select id="v75-outside-child">${people.map(([id,n])=>`<option value="${id}">${e(n)}</option>`).join('')}</select></label>
 <label>Przedmiot<select id="v75-outside-subject">${subjects.map(([id,n])=>`<option value="${id}">${e(n)}</option>`).join('')}</select></label>
 <div class="v74-admin-row">${button('🤖 Wygeneruj pytania','v75:outside:generate','gold')}${button('🔎 Przejrzyj pytania','v75:outside:show')}</div>
 <div id="v75-outside-results" role="status"></div></section>`;
}
function v75OutsideShow(){return v76OutsideShow()}
async function v75OutsideGenerate(btn){
 const ch=$('v75-outside-child')?.value,sub=$('v75-outside-subject')?.value;if(!ch||!sub)return;
 const grade=data.profiles[ch]?.grade||'2',age=grade==='P'?'przedszkolaka 3-6 lat':'ucznia klasy '+grade;
 const current=v75OutsideBank(ch,sub);
 const prompt='Jestes nauczycielem. Wymysl 10 CIEKAWYCH, JEDNOZNACZNYCH, ROZNORODNYCH pytan o wiedze i umiejetnosci dla '+age+', przedmiot '+sub+'. Nie powtarzaj tych pytan: '+JSON.stringify(current.slice(-20).map(x=>x.q))+'. Uzywaj co najmniej 5 roznych kategorii pasujacych do wieku, np. obrazowe skojarzenia, logika, slowa, matematyka, zjawiska. W jezyku angielskim tylko latwe slowa, bez czytania ze zrozumieniem, bez zdradzania odpowiedzi. Kazde pytanie ma 3 rozne odpowiedzi, poprawna dokladnie jedna. Odpowiedz TYLKO JSON: {"tasks":[{"q":"Pytanie?","a":["odpowiedz 1","odpowiedz 2","odpowiedz 3"],"ok":0}]}.';
 if(btn){btn.disabled=true;btn.textContent='⏳ Generuję propozycje…'}
 try{const raw=await askMentorAI(prompt,'tech'),clean=String(raw).replace(/```(?:json)?/g,'').replace(/```/g,'').trim();let obj;try{obj=JSON.parse(clean)}catch{obj=JSON.parse(clean.slice(clean.indexOf('{'),clean.lastIndexOf('}')+1))}
  const arr=Array.isArray(obj.tasks)?obj.tasks:[],normalize=x=>String(x).trim().toLocaleLowerCase('pl-PL'),seen=new Set(current.map(x=>normalize(x.q||''))),fresh=[];
  for(const t of arr){
   if(!t||typeof t.q!=='string'||!t.q.trim()||!Array.isArray(t.a)||t.a.length!==3||t.a.some(x=>typeof x!=='string'||!x.trim())||!['number','string'].includes(typeof t.ok)||String(t.ok).trim()===''||!Number.isInteger(Number(t.ok))||Number(t.ok)<0||Number(t.ok)>=3)continue;
   const q=t.q.trim().slice(0,280),a=t.a.map(x=>x.trim()),key=normalize(q);if(new Set(a.map(normalize)).size!==3||seen.has(key))continue;
   seen.add(key);fresh.push({q,a,ok:Number(t.ok)});if(fresh.length>=10)break;
  }
  if(!fresh.length)throw Error('AI nie przygotowało poprawnych pytań. Spróbuj ponownie.');
  localStorage.setItem(v75OutsideKey(ch,sub),JSON.stringify([...current,...fresh].slice(-500)));if($('v75-outside-child')?.value===ch&&$('v75-outside-subject')?.value===sub){v76OutsideScope();v76Outside.status='✅ Zakończono · zapisano '+fresh.length+' pytań w bazie.';v75OutsideShow()}note('✅ Dodano '+fresh.length+' pytań do bazy '+ch+'.');
 }catch(err){note('❌ '+v75PolishError(err))}finally{if(btn?.isConnected){btn.disabled=false;btn.textContent='🤖 Wygeneruj pytania'}}
}
function v75OutsideDelete(index){const ch=$('v75-outside-child')?.value,sub=$('v75-outside-subject')?.value,items=v75OutsideBank(ch,sub);if(index<0||index>=items.length)return;items.splice(index,1);localStorage.setItem(v75OutsideKey(ch,sub),JSON.stringify(items));v75OutsideShow();note('✅ Usunięto pytanie z bazy.')}

function v75PreschoolQuestions(){
 const arr=[
 ['Który kolor ma niebo w słoneczny dzień?',['Niebieski','Czarny','Różowy'],0],
 ['Ile nóg ma pies?',['Dwie','Cztery','Sześć'],1],
 ['Jakie zwierzę mówi „miau”?',['Kot','Pies','Krowa'],0],
 ['Co rośnie na drzewie jabłoni?',['Jabłko','But','Widelec'],0],
 ['Jaka figura jest okrągła?',['Koło','Kwadrat','Trójkąt'],0],
 ['Ile palców jest u jednej dłoni?',['Trzy','Pięć','Osiem'],1],
 ['Jakiego koloru jest trawa?',['Zielona','Fioletowa','Czarna'],0],
 ['Czym myjemy zęby?',['Szczotką','Łyżką','Grzebieniem'],0],
 ['Co zakładamy, gdy pada deszcz?',['Kalosze','Okulary przeciwsłoneczne','Czapkę kąpielową'],0],
 ['Co świeci na niebie w dzień?',['Księżyc','Słońce','Latarka'],1],
 ['Co robimy przed jedzeniem?',['Myjemy ręce','Skaczemy na łóżku','Malujemy ściany'],0],
 ['Który owoc jest zwykle żółty?',['Banan','Wiśnia','Śliwka'],0]
 ];return [...[...arr].map(([q,a,ok])=>({q,a,ok,lang:'pl-PL',hero:'spider'})),...v75OutsideBank(who,'przedszkole').map(t=>({...t,lang:'pl-PL',hero:'spider'}))].sort(()=>Math.random()-.5).slice(0,10);
}

// V74_PANEL_MAMY: układ formularzy i filtrowanie raportu
function v74BookMarkup(b){
 const pages=sortedBookPages(b.id),bank=bookBankItems(b),stats=questionBankSummary(b);
 const last=Math.max(0,...pages.map(p=>Number(p.number)||0));
 const cards=pages.map(p=>{
  const state=pageState(b,p,bank),duplicate=pages.filter(x=>x.number===p.number).length>1;
  return `<div class="v74-page-row admin-page-item admin-page-${state.css}" data-admin-page-id="${e(p.id)}" hidden><label class="admin-page-check"><input type="checkbox" data-page-select="${p.id}" aria-label="Zaznacz stronę ${p.number}"><span>Zaznacz</span></label><div class="v74-page-info"><b>Strona ${p.number}</b><strong class="admin-page-status">${state.text}</strong><small>${e(p.chapter||'Bez działu')} · ${p.text?'Tekst zapisany':'Brak tekstu'}${duplicate?' · ⚠️ Powtórzony numer strony':''}${p.aiOcrError?' · ❌ Błąd AI: '+e(p.aiOcrError):''}</small></div>${button('Edytuj','page:open:'+p.id)}</div>`;
 }).join('')||'<p>Nie dodano jeszcze żadnych stron.</p>';
 return `<section class="card v74-book">
 ${button('← Biblioteka','admin:books')}<h2>${e(b.title)}</h2>
 <div class="admin-cover v74-cover">${b.coverId?`<img class="admin-cover-img" data-image="${b.coverId}" alt="Okładka książki">`:'<p class="muted">Brak okładki</p>'}
  <label class="v73-file-control v74-cover-button">📚 Wybierz okładkę<input type="file" id="bookcoverfile" accept="image/*"></label></div>
 <details class="v74-book-details"><summary>📘 Edytuj dane książki</summary><div class="v74-book-details-body">
  ${select('bchild','Dziecko',people,b.child)}${select('bgrade','Klasa',grades,b.grade)}${bookSubjectSelect(b.child,b.subject)}${v75ShareControls(b)}
  <label for="btype">Rodzaj materiału</label><select id="btype"><option value="Podręcznik" ${(!b.kind||b.kind==='Podręcznik')?'selected':''}>Podręcznik</option><option value="Ćwiczenia" ${b.kind==='Ćwiczenia'?'selected':''}>Zeszyt ćwiczeń</option><option value="Inne" ${b.kind==='Inne'?'selected':''}>Inne</option></select>
  ${v73BookFields(b)}${button('💾 Zapisz zmiany','book:save','gold')}
 </div></details>
 <div class="v74-admin-row v74-danger-row">${button(b.archived?'Przywróć z archiwum':'📦 Archiwizuj','book:archive')}${button('🗑️ Usuń cały podręcznik','book:delete','line')}</div>
 <section class="v74-book-add"><h3>📷 Dodaj wiele stron naraz</h3>
  <div class="v73-inline-fields v73-two-fields">${input('start','Pierwsza strona',String(last+1),'number')}${input('newchapter','Dział dodawanych stron','')}</div>
  <div class="v73-photo-options"><label class="v73-file-control">📁 Wybierz zdjęcia<input id="pagefiles" type="file" accept="image/*" multiple></label><label class="v73-file-control">📷 Zrób zdjęcie<input id="pagecamera" type="file" accept="image/*" capture="environment"></label></div>
  <details class="v74-chapter-details"><summary>📚 Przypisz istniejące strony do działu</summary>
   <div class="v73-inline-fields v73-two-fields">${input('chapterfrom','Od strony','1','number')}${input('chapterto','Do strony','10','number')}</div>
   ${input('chaptername','Numer działu (np. 1)','1','number')}${button('💾 Przypisz zakres do działu','book:chapter-range','gold')}
  </details>
 </section>
 <section class="v74-book-ocr"><h3>✨ Odczytaj zdjęcia przez AI</h3>
  <div class="v74-admin-row"><span class="v74-ocr-read">${button('✨ Odczytaj wszystkie zdjęcia przez AI','page:bulk-ai','gold')}</span><button id="bulk-ai-pause" type="button" class="alt" data-action="page:bulk-pause" disabled>⏸ Pauza</button></div>
  <p id="bulkocrstatus" role="status" aria-live="polite" class="guide" hidden></p>
  <small>AI pomija strony z zapisanym tekstem. Nieudany odczyt można ponowić w edytorze strony.</small>
  <label for="booknumberlocation">📄 Gdzie szukać drukowanego numeru strony?</label><select id="booknumberlocation"><option value="" ${!b.pageNumberPosition?'selected':''}>Zapytaj przy pierwszym odczycie</option><option value="bottom" ${b.pageNumberPosition==='bottom'?'selected':''}>Na dole strony</option><option value="top" ${b.pageNumberPosition==='top'?'selected':''}>Na górze strony</option></select>
  <small>To ustawienie zapisuje się po zmianie. AI będzie szukało numeru we wskazanej części zdjęcia.</small>
 </section>
 <section class="admin-question-bank v74-bank"><h3>🧠 Baza pytań z podręcznika</h3>
  <p>Zatwierdzono <b>${stats.approved}</b> z <b>${stats.read}</b> odczytanych stron. W bazie: <b>${stats.tasks}</b> pytań z <b>${stats.pages}</b> stron.</p>
  <div class="v74-admin-row">${button('🤖 Generuj pytania z zatwierdzonych stron','book:questions','gold')}${button('⏸ Pauza po stronie','book:questions-pause')}</div>
  ${button('🔎 Sprawdź pytania AI','book:review','alt')}
  <p id="book-question-progress" role="status" aria-live="polite">Generowanie obejmuje zatwierdzone strony. Pytania zapisują się osobno dla każdej strony.</p>
 </section>
 </section>
 <section class="card v74-pages"><h2>📄 Strony podręcznika</h2>
  <div class="admin-page-actions"><div class="v75-page-toolbar" id="v75-page-toolbar" hidden>${button('☑ Zaznacz wszystkie','page:select-all')}${button('Odznacz wszystkie','page:select-none')}${button('🗑 Usuń zaznaczone','page:delete-selected','line')}${button('🟠 Zatwierdź zaznaczone','v75:pages:approve','gold')}<small id="page-selected-count">Zaznaczono: 0</small></div>
   <label for="page-filter">Pokaż strony</label><select id="page-filter"><option value="none" selected>— Nie pokazuj żadnych —</option><option value="all">Wszystkie</option><option value="missing">⬜ Bez tekstu</option><option value="ready">🟡 Tekst do sprawdzenia</option><option value="approved">🟠 Zatwierdzone, bez pytań</option><option value="questions">🟢 Zatwierdzone, z pytaniami</option></select><small id="page-filter-count">Widoczne: 0</small>
  </div>${cards}
 </section>`;
}
function v74PageMarkup(p){
 const noteText=!p.text?.trim()?'⬜ Brak tekstu — najpierw odczytaj zdjęcie':p.reviewed?'🟠 Zatwierdzona strona':'🟡 Sprawdź tekst i numer, następnie zatwierdź';
 const lang=p.ocrLanguage||languageOfBook(data.books.find(b=>b.id===p.bookId));
 return `<section class="card v74-page-edit">${button('← Strony','admin:book')}<h2>Strona ${p.number}</h2>
 <p class="admin-review-message">${noteText}${p.ocrDetectedPageNumber!=null?' · AI wskazało numer: '+p.ocrDetectedPageNumber:''}</p>
 <div class="admin-page-arrows">${button('← Poprzednia strona','page:prev')}${button('Następna strona →','page:next')}</div>
 <img class="pagephoto" data-image="${p.imageId}" alt="Zdjęcie strony">
 <label for="ptext" class="v73-text-label">📝 Rozpoznany tekst — sprawdź lub popraw</label>
 <textarea id="ptext" class="v73-textarea v74-page-text">${e(p.text||'')}</textarea>
 <div class="v74-number-field"><label for="pnum">Numer strony</label><input id="pnum" type="number" min="1" value="${e(p.number)}"></div>
 <div class="v73-inline-fields v73-two-fields v74-page-meta">${input('pchapter','Dział',p.chapter||'')}
 <div class="v73-language"><label for="ocrlang">Język strony</label><select id="ocrlang"><option value="pol" ${lang==='pol'?'selected':''}>Polski</option><option value="eng" ${lang==='eng'?'selected':''}>Angielski</option></select></div></div>
 <p id="ocrstatus" class="guide" role="status" hidden></p>
 <div class="v74-admin-row v74-page-actions">${p.reviewed?button('↩️ Cofnij zatwierdzenie','page:unapprove'):button('🟠 Zatwierdź stronę','page:approve','gold')}${button('✨ Odczytaj przez AI','page:ai','gold')}</div>
 <label>Zastąp zdjęcie tej strony</label><div class="v73-photo-options"><label class="v73-file-control">📁 Wybierz zdjęcie<input type="file" accept="image/*" id="replacefile"></label><label class="v73-file-control">📷 Zrób zdjęcie<input type="file" accept="image/*" capture="environment" id="replacecamera"></label></div>
 <div class="v74-delete-row">${button('🗑️ Usuń stronę','page:delete','line')}</div>
 </section>`;
}
function v74SourceForQuestion(t,p){
 const quote=String(t.sourceQuote||t.sourceExcerpt||'').trim();
 if(quote)return {text:quote,label:'Cytat zapisany przy zadaniu'};
 const content=String(p?.text||'').trim();if(!content)return {text:'',label:''};
 const answer=String(t.answer||'').trim();let ix=answer.length>=3?content.toLocaleLowerCase('pl').indexOf(answer.toLocaleLowerCase('pl')):-1;
 if(ix<0){const words=String(t.question||'').split(/[^\p{L}]+/u).filter(w=>w.length>=5);for(const w of words){ix=content.toLocaleLowerCase('pl').indexOf(w.toLocaleLowerCase('pl'));if(ix>=0)break;}}
 if(ix<0)return {text:content.slice(0,440),label:'Początek odczytanej strony (niezweryfikowane źródło odpowiedzi)'};
 const start=Math.max(0,content.lastIndexOf('\n',Math.max(0,ix-180))+1),stop=Math.min(content.length,ix+280);
 return {text:content.slice(start,stop).trim(),label:'Fragment odczytanej strony w pobliżu słów z pytania / odpowiedzi'};
}
function v74QuestionReview(b){
 const bank=bookBankItems(b),pages=sortedBookPages(b.id).filter(p=>p.text?.trim());
 const matching=(x,p)=>{const ids=(x.pageIds||[]).map(String);return ids.includes(String(p.id))||(!ids.some(y=>y.length>5)&&ids.includes(String(p.number)))};
 const groups=pages.map(p=>({p,items:bank.filter(x=>matching(x,p))}));
 const assigned=new Set(groups.flatMap(g=>g.items.map(x=>String(x.key))));
 const rest=bank.filter(x=>!assigned.has(String(x.key)));
 function question(x,p){
  const key=encodeURIComponent(String(x.key)),t=x.task||{},options=Array.isArray(t.options)?t.options:[];
  const source=v74SourceForQuestion(t,p);
  return `<details class="v74-question"><summary>${e(t.question||'Bez pytania')} <small>${e(t.type||'pytanie')}</small></summary>
   <div class="v74-qedit" data-v74-edit="${e(key)}">
    <label>Pytanie<textarea data-v74-field="question" rows="3">${e(t.question||'')}</textarea></label>
    <label>Poprawna odpowiedź<input data-v74-field="answer" value="${e(t.answer||'')}"></label>
    <label>Opcje / hasła — jedno w wierszu<textarea data-v74-field="options" rows="4">${e(options.join('\n'))}</textarea></label>
    <label>Wyjaśnienie (opcjonalne)<textarea data-v74-field="explanation" rows="2">${e(t.explanation||'')}</textarea></label>
    ${source.text?`<details class="v74-source"><summary>📖 Tekst źródłowy</summary><small>${e(source.label)}</small><blockquote>${e(source.text)}</blockquote></details>`:'<p class="muted">Brak tekstu źródłowego przy tym pytaniu.</p>'}
    <div class="v74-admin-row v74-qbuttons"><button type="button" disabled data-action="book:save-question:${key}">💾 Zapisz</button><button type="button" class="alt" data-action="book:cancel-question:${key}">Anuluj</button><button type="button" class="line" data-action="book:delete-question:${key}">🗑 Usuń</button></div>
   </div>
  </details>`;
 }
 return `<section class="card v74-bank-review">${button('← Do książki','admin:book')}<h2>🔎 Sprawdź pytania AI</h2><p>Rozwiń pytanie i popraw treść bez dodatkowych okienek. Źródło jest opisane — jeśli to tylko fragment strony, sprawdź zgodność odpowiedzi.</p><p><b>${bank.length}</b> pytań z <b>${groups.filter(g=>g.items.length).length}</b> stron.</p>
  ${groups.filter(g=>g.items.length).map(g=>`<details class="v74-review-page"><summary>📄 Strona ${e(g.p.number)} — ${g.items.length} pytań</summary>${g.items.map(x=>question(x,g.p)).join('')}</details>`).join('')}
  ${rest.length?`<details class="v74-review-page"><summary>⚠️ Bez przypisanej strony — ${rest.length}</summary>${rest.map(x=>question(x,null)).join('')}</details>`:''}
 </section>`;
}
function v74QuestionEditContainer(btn){return btn?.closest('[data-v74-edit]')}
function v74QuestionFields(box){const field=name=>box?.querySelector('[data-v74-field="'+name+'"]')?.value??'';
 return {question:field('question'),answer:field('answer'),options:field('options'),explanation:field('explanation')};}
function v74QuestionInitial(key){const b=data.books.find(x=>x.id===bookId);return bookBankItems(b||{}).find(x=>String(x.key)===key)?.task||null}
function v74QuestionModified(box,key){
 const original=v74QuestionInitial(key);if(!original)return false;
 const now=v74QuestionFields(box);
 return (box?.querySelector('[data-v75-field="questionPl"]')?.value||'')!==String(original.questionPl||'')||now.question!==String(original.question||'')||now.answer!==String(original.answer||'')||now.options!==(Array.isArray(original.options)?original.options:[]).join('\n')||now.explanation!==String(original.explanation||'');
}
function v74SaveQuestion(key,btn){
 const b=data.books.find(x=>x.id===bookId),bank=b?bookBankItems(b):[];
 const item=bank.find(x=>String(x.key)===key),box=v74QuestionEditContainer(btn);
 if(!item||!box)return note('Nie znaleziono pytania.');
 const vals=v74QuestionFields(box),options=vals.options.split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
 if(!vals.question.trim()||!vals.answer.trim()||!options.length)return note('Wpisz treść, prawidłową odpowiedź i opcje zadania.');
 item.task={...item.task,question:vals.question.trim(),answer:vals.answer.trim(),options,explanation:vals.explanation.trim()};
 try{localStorage.setItem('academy-v48-bank-'+b.child+'-'+b.id,JSON.stringify(bank));}catch(err){return note('Nie udało się zapisać: '+err.message)}
 const submit=box.querySelector('[data-action^="book:save-question:"]');if(submit)submit.disabled=true;
 const summ=box.closest('details')?.querySelector('summary');if(summ)summ.childNodes[0].textContent=item.task.question+' ';
 note('✅ Poprawiono pytanie i zapisano odpowiedź.');
}
function v74CancelQuestion(key,btn){const item=v74QuestionInitial(key),box=v74QuestionEditContainer(btn);if(!item||!box)return;
 for(const [name,val] of Object.entries({question:item.question||'',answer:item.answer||'',options:(item.options||[]).join('\n'),explanation:item.explanation||''})){
  const control=box.querySelector('[data-v74-field="'+name+'"]');if(control)control.value=val;
 }
 const submit=box.querySelector('[data-action^="book:save-question:"]');if(submit)submit.disabled=true;
}
function v74DifficultiesReport(){
 const rows=[];
 for(const b of data.books)for(const id of new Set([b.child,...(b.sharedWith||[])])){try{const arr=JSON.parse(localStorage.getItem('academy-v53-stats-'+id+'-'+b.id)||'[]');if(Array.isArray(arr))for(const x of arr)rows.push({...x,child:id,book:b.title});}catch{}}
 rows.sort((a,b)=>String(b.date||'').localeCompare(String(a.date||'')));
 const id='pawel',peopleIds=['pawel','patryk'];
 return `<section class="card v74-report"><h2>📋 Trudności w nauce — raport dla mamy</h2>
 <label for="v74-report-child">Dziecko</label><select id="v74-report-child">${peopleIds.map(x=>`<option value="${x}" ${x===id?'selected':''}>${e(data.profiles[x]?.name||x)}</option>`).join('')}</select>
 <div class="v74-admin-row"><span class="v74-report-count" id="v74-report-count"></span><button type="button" class="line" data-action="report:reset">🗑 Wyczyść raport dziecka</button></div>
 ${peopleIds.map(child=>`<div data-v74-report="${child}" ${child!==id?'hidden':''}>${rows.filter(x=>x.child===child).slice(0,40).map(x=>`<div class="item"><div><b>${e(x.book)} · strona ${e(x.page||'—')}</b><p>${e(x.question||'')}</p><small>${e(x.reason||'')}</small></div></div>`).join('')||'<p class="muted">Brak zapisanych trudności.</p>'}</div>`).join('')}
 <small>Wyczyść raport usuwa tylko historię trudnych prób wybranego dziecka — nie książki, pytania ani punkty.</small>
 </section>`;
}
function v74ResetReport(){
 const child=document.getElementById('v74-report-child')?.value;
 if(!['pawel','patryk'].includes(child))return;
 const name=data.profiles[child]?.name||child;
 if(!confirm('Wyczyścić raport trudności dla '+name+'? Książki, pytania i postępy pozostaną.'))return;
 for(const b of data.books.filter(x=>x.child===child||(x.sharedWith||[]).includes(child)))localStorage.removeItem('academy-v53-stats-'+child+'-'+b.id);
 render();note('✅ Wyczyszczono wyłącznie raport trudności dla '+name+'.');
}
function v74UpdateReportFilter(){
 const child=document.getElementById('v74-report-child')?.value;
 document.querySelectorAll('[data-v74-report]').forEach(x=>x.hidden=x.dataset.v74Report!==child);
 const count=document.querySelector('[data-v74-report="'+child+'"]')?.querySelectorAll('.item').length||0;
 const el=document.getElementById('v74-report-count');if(el)el.textContent='Zapisane próby: '+count+' (maks. 40 widocznych)';
}

function v73QuestionReview(b){
 const bank=bookBankItems(b),pages=sortedBookPages(b.id).filter(p=>p.text?.trim());
 const groups=pages.map(p=>({p,items:bank.filter(x=>{const ids=(x.pageIds||[]).map(String);return ids.includes(String(p.id))||(!ids.some(v=>v.length>5)&&ids.includes(String(p.number)));})}));
 const grouped=new Set(groups.flatMap(g=>g.items.map(x=>x.key)));
 const unassigned=bank.filter(x=>!grouped.has(x.key));
 const renderItem=x=>{const key=encodeURIComponent(String(x.key)),t=x.task||{};
  return `<details class="v73-bank-question"><summary>${e(t.question||'Bez pytania')} <small>(${e(t.type||'pytanie')})</small></summary><div class="v73-bank-answer"><b>Poprawna odpowiedź:</b> ${e(t.answer||'Brak')}<p><b>Opcje / hasła:</b> ${e((t.options||[]).join(' · '))}</p><p>${e(t.explanation||'')}</p></div><button type="button" class="alt" data-action="book:edit-question:${key}">✏️ Popraw</button> <button type="button" class="line" data-action="book:delete-question:${key}">🗑 Usuń</button></details>`;
 };
 return `<section class="card v73-bank-review">${button('← Do książki','admin:book')}<h2>🔎 Sprawdź pytania AI</h2><p>Rozwiń pytanie, aby zobaczyć poprawną odpowiedź i opcje. Możesz poprawić lub usunąć błędne zadanie. Gry i punktacja nie ulegają zmianie.</p><p><b>${bank.length}</b> pytań · <b>${groups.filter(g=>g.items.length).length}</b> stron z pytaniami</p>`+
  groups.map(g=>`<details class="v73-review-page" ${g.items.length?'':'data-empty="1"'}><summary>📄 Strona ${e(g.p.number)} — ${g.items.length} pytań</summary>${g.items.map(renderItem).join('')||'<p>Brak pytań na tej stronie.</p>'}</details>`).join('')+
  (unassigned.length?`<details class="v73-review-page"><summary>⚠️ Pytania bez przypisania — ${unassigned.length}</summary>${unassigned.map(renderItem).join('')}</details>`:'')+'</section>';
}
function v73EditQuestion(key){
 const b=data.books.find(x=>x.id===bookId);if(!b)return;
 const bank=bookBankItems(b),rec=bank.find(x=>String(x.key)===key);if(!rec)return note('Nie znaleziono pytania.');
 const t=rec.task||{};
 const question=prompt('Popraw treść pytania:',t.question||'');if(question===null)return;
 const answer=prompt('Popraw prawidłową odpowiedź:',t.answer||'');if(answer===null)return;
 const options=prompt('Opcje / hasła (jedna w każdym wierszu):',(t.options||[]).join('\n'));if(options===null)return;
 const opts=options.split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
 if(!question.trim()||!answer.trim()||!opts.length)return note('Pytanie, odpowiedź i opcje nie mogą być puste.');
 rec.task={...t,question:question.trim(),answer:answer.trim(),options:opts};
 localStorage.setItem('academy-v48-bank-'+b.child+'-'+b.id,JSON.stringify(bank));render();note('✅ Zapisano poprawione pytanie.');
}
function v73DeleteQuestion(key){
 const b=data.books.find(x=>x.id===bookId);if(!b)return;
 const bank=bookBankItems(b);const item=bank.find(x=>String(x.key)===key);if(!item)return;
 if(!confirm('Usunąć wybrane pytanie z lokalnego banku?\n'+String(item.task?.question||'')))return;
 const next=bank.filter(x=>String(x.key)!==key);
 localStorage.setItem('academy-v48-bank-'+b.child+'-'+b.id,JSON.stringify(next));render();note('🗑 Usunięto błędne pytanie.');
}

function questionBankSummary(b){
 const bank=bookBankItems(b),pages=data.bookPages.filter(p=>p.bookId===b.id&&p.text?.trim());
 return {tasks:bank.length,pages:pages.filter(p=>questionCountOnPage(b,p,bank)>0).length,read:pages.length,approved:pages.filter(p=>p.reviewed===true).length};
}
function setQuestionBuildButtons(){
 const go=document.querySelector('[data-action="book:questions"]'),pause=document.querySelector('[data-action="book:questions-pause"]');
 if(go)go.disabled=questionBuildBusy;
 if(pause){pause.disabled=!questionBuildBusy||questionBuildStop;pause.textContent=questionBuildStop?'⏳ Zatrzymuję po stronie…':'⏸ Pauza generowania';}
}
async function buildBookQuestions(b){
 if(questionBuildBusy)throw Error('Generowanie pytań już trwa.');
 const pages=data.bookPages.filter(p=>p.bookId===b.id&&p.text?.trim()&&p.reviewed===true).sort((x,y)=>x.number-y.number);
 if(!pages.length){note('Najpierw sprawdź i zatwierdź przynajmniej jedną stronę. AI nie wygeneruje pytań ze stron niezatwierdzonych.');return}
 const cursorKey='academy-v71-question-queue-'+b.child+'-'+b.id;
 let queue=null;
 try{const stored=JSON.parse(localStorage.getItem(cursorKey)||'null');if(Array.isArray(stored))queue=stored.filter(id=>pages.some(p=>p.id===id))}catch{}
 const bank=bookBankItems(b);
 if(!queue?.length){
  const missing=pages.filter(p=>questionCountOnPage(b,p,bank)===0);
  queue=(missing.length?missing:pages).map(p=>p.id);
 }
 const todo=queue.map(id=>pages.find(p=>p.id===id)).filter(Boolean);
 questionBuildBusy=true;questionBuildStop=false;setQuestionBuildButtons();
 let completed=0,added=0,failed=0;
 const status=()=>document.getElementById('book-question-progress');
 const onProgress=x=>{
  const el=status();
  if(el)el.classList.remove('v76-complete');if(el)el.textContent='🤖 Odczytana strona '+(completed+1)+' z '+todo.length+' (nr '+x.page+'). Nowe pytania: '+x.added+' · nieudane: '+x.failed;
  if(x.finished){
   completed=x.index;added=x.added;failed=x.failed;
   try{localStorage.setItem(cursorKey,JSON.stringify(todo.slice(completed).map(p=>p.id)))}catch{}
  }
 };
 try{
  const controllerKey='mama-question-bank';
  const root=document.createElement('div');
  const job=mountMissionGame(root,{books:[b],pages:data.bookPages,child:b.child,childGrade:b.grade||data.profiles?.[b.child]?.grade||'2',initialBookId:b.id,
   speak:()=>{},reward:async()=>{},
   ask:async(question,timeoutMs=16000)=>{
    const controller=beginAIRequest(controllerKey),timer=setTimeout(()=>controller.abort(),timeoutMs);
    try{return await askMentorAI(question,'tech',[],controller.signal)}
    finally{clearTimeout(timer);finishAIRequest(controllerKey,controller)}
   },
   batchGenerate:{pages:todo,onProgress,shouldStop:()=>questionBuildStop||bookId!==b.id||adminTab!=='book'}
  });
  // V70 wyswietlalo surowy blad "reading paused", gdy mieszaly sie wersje modulow.
  if(!job?.work||typeof job.work.then!=='function')throw Error('Moduł banku pytań ma niewłaściwą wersję. Odśwież Akademię i ponów.');
  const result=await job.work;
  if(!result||typeof result.paused!=='boolean')throw Error('Generator nie zwrócił wyniku. Nie usunięto żadnych zapisanych pytań.');
  if(!result.paused)localStorage.removeItem(cursorKey);
  const summary=questionBankSummary(b);
  const el=status();
  if(el)el.textContent=(result.done>0?'✅ Zakończono. ':'⚠️ AI nie utworzyło poprawnych pytań z tej partii. ')+'W bazie: '+summary.tasks+' pytań z '+summary.pages+' odczytanych stron.'+
    (result.paused?' Wstrzymano — można wznowić.':'')+(result.failed?' Nieudane strony: '+result.failed+' — spróbuj ponownie.':'');
  if(el)el.classList.toggle('v76-complete',result.done>0);note('🤖 '+summary.tasks+' pytań w bazie, '+summary.pages+' stron z pytaniami.');
 }finally{questionBuildBusy=false;questionBuildStop=false;setQuestionBuildButtons()}
}

function setBulkAiControls(){
 const stop=$('bulk-ai-pause'),start=document.querySelector('[data-action="page:bulk-ai"]');
 if(stop){stop.disabled=!bulkAiBusy||bulkAiPauseRequested;stop.textContent=bulkAiPauseRequested?'⏳ Kończę bieżącą stronę…':'⏸ Pauza po bieżącej stronie';}
 if(start)start.disabled=bulkAiBusy;
}
function selectedBookPageIds(){
 return [...document.querySelectorAll('[data-page-select]:checked')].map(el=>el.dataset.pageSelect);
}
function updateBookPageSelection(){
 const el=$('page-selected-count');if(el)el.textContent='Zaznaczono: '+selectedBookPageIds().length;
}
async function runAdminAction(target,label,operation){
 if(adminActionBusy){note('⏳ Poczekaj, poprzednia operacja jeszcze trwa.');return}
 adminActionBusy=true;
 const old=target?.textContent||'';
 if(target){target.disabled=true;target.textContent='⏳ '+label}
 try{return await operation()}
 catch(err){console.error('Panel mamy:',err);note('❌ '+v75PolishError(err))}
 finally{adminActionBusy=false;if(target?.isConnected){target.disabled=false;target.textContent=old}}
}
function bulkAiStatus(message){const el=$('bulkocrstatus');if(el){el.textContent=message;el.hidden=false;el.classList.toggle('v76-complete',/^✅/.test(message))}}
function sortedBookPages(id){return data.bookPages.filter(p=>p.bookId===id).sort((a,b)=>a.number-b.number)}
async function saveEditedPage(){
 const p=data.bookPages.find(p=>p.id===pageId);
 if(!p)return false;
 const nextNumber=Number($('pnum')?.value)||p.number;
 const numberChanged=nextNumber!==p.number;
 if(numberChanged)p.pageNumberManual=true;
 p.number=nextNumber;
 const nextText=$('ptext')?.value??p.text;
 if(numberChanged||nextText!==p.text)p.reviewed=false;
 p.text=nextText;
 p.ocrLanguage=$('ocrlang')?.value||p.ocrLanguage||languageOfBook(data.books.find(b=>b.id===p.bookId));
 p.chapter=$('pchapter')?.value.trim()??p.chapter??'';
 await save();return true;
}
async function readAllBookPagesAI(){
 if(bulkAiBusy||ocrBusy)throw Error('Odczyt AI już trwa.');
 const activeBookId=bookId,pages=sortedBookPages(activeBookId);
 if(!pages.length)throw Error('Najpierw dodaj zdjęcia stron.');
 let pending=pages.filter(p=>!p.text?.trim()),overwriteAll=false;
 if(!pending.length){
  const approved=confirm('Nie ma żadnych nowych stron do odczytania.\n\nCzy chcesz odczytać WSZYSTKIE strony od nowa? To ZASTĄPI zapisane teksty, również poprawione ręcznie.\n\nOK — odczytaj od nowa; Anuluj — pozostaw bez zmian.');
  if(!approved){bulkAiStatus('✅ Nie ma nowych stron. Dotychczasowe teksty pozostają bez zmian.');return}
  pending=pages;overwriteAll=true;
 }
 bulkAiBusy=true;bulkAiPauseRequested=false;setBulkAiControls();
 let ok=0,errors=0,paused=false;
 const lang=languageOfBook(data.books.find(b=>b.id===activeBookId));
 try{
  for(let i=0;i<pending.length;i++){
   if(bulkAiPauseRequested||bookId!==activeBookId||adminTab!=='book'){paused=true;break}
   const page=pending[i];
   if(!overwriteAll&&page.text?.trim())continue;
   bulkAiStatus('📖 Strona '+(i+1)+' z '+pending.length+' (nr '+page.number+'). Zapisuję każdą oddzielnie.');
   try{await recognizePageAI(page,lang,overwriteAll);page.aiOcrError='';ok++}
   catch(err){page.aiOcrError=String(err?.message||err);errors++;await save();console.warn('Strona '+page.number,err)}
   if(bulkAiPauseRequested){paused=true;break}
  }
 }finally{bulkAiBusy=false;bulkAiPauseRequested=false;setBulkAiControls()}
 if(adminTab==='book'&&bookId===activeBookId){render();bulkAiStatus((paused?'⏸ Wstrzymano. ':errors?'⚠️ Zakończono z błędami. ':'✅ Zakończono. ')+'Zapisano '+ok+' stron · błędy: '+errors+'.')}
 if(paused)note('⏸ Pauza. Zapisano '+ok+' stron. Następnym razem AI odczyta tylko strony bez tekstu.');
 else note('✅ AI: odczytano '+ok+' stron, błędy: '+errors+'. Teksty zapisano osobno.');
}

function ocrStatus(message,progress){
 const el=$('ocrstatus');if(el){el.textContent=message+(Number.isFinite(progress)?' ('+Math.round(progress*100)+'%)':'');el.hidden=false;}
 const btns=document.querySelectorAll('[data-action="page:ocr"],[data-action="reader:ocr"]');btns.forEach(b=>b.disabled=ocrBusy);
}
async function loadOcrLibrary(){
 if(window.Tesseract?.createWorker)return;
 await new Promise((resolve,reject)=>{
  const script=document.createElement('script');script.src='https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js';
  script.onload=resolve;script.onerror=()=>reject(Error('Nie udało się pobrać silnika OCR. Sprawdź połączenie z internetem.'));
  document.head.appendChild(script);
 });
 if(!window.Tesseract?.createWorker)throw Error('Silnik OCR nie został uruchomiony.');
}
async function prepareOcrImage(blob, mode='contrast'){
 const bitmap=await createImageBitmap(blob);
 try{
  const scale=Math.min(2.4,2600/Math.max(bitmap.width,bitmap.height));
  const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));
  const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);
  const frame=ctx.getImageData(0,0,canvas.width,canvas.height), px=frame.data;
  // Rozjaśnij kolorowe tło i wzmocnij ciemne litery. Zachowaj pełną stronę.
  for(let i=0;i<px.length;i+=4){
   const r=px[i],g=px[i+1],b=px[i+2];
   let lum=.299*r+.587*g+.114*b;
   if(mode==='contrast'){
    const max=Math.max(r,g,b),min=Math.min(r,g,b);
    // zielone i żółte tła podbijamy do jasności papieru
    if(g>r*1.12&&g>b*.95&&lum>75)lum=Math.min(255,lum+40);
    lum=Math.max(0,Math.min(255,(lum-125)*1.65+195));
   }else{lum=Math.max(0,Math.min(255,(lum-125)*1.25+155));}
   px[i]=px[i+1]=px[i+2]=lum;
  }
  ctx.putImageData(frame,0,0);
  return canvas;
 }finally{bitmap.close()}
}
async function recognizePage(page,language='pol'){
 if(ocrBusy)throw Error('Rozpoznawanie już trwa. Poczekaj na zakończenie.');
 ocrBusy=true;let worker=null;
 try{
  ocrStatus('Uruchamiam rozpoznawanie…');await loadOcrLibrary();
  const blob=await get('image:'+page.imageId);if(!blob)throw Error('Nie znaleziono zdjęcia tej strony.');
  ocrStatus('Ładuję język '+(language==='eng'?'angielski':'polski')+'…');
  worker=await window.Tesseract.createWorker(language,1,{logger:m=>{if(m.status==='recognizing text')ocrStatus('Analizuję stronę…',m.progress);}});
  await worker.setParameters({preserve_interword_spaces:'1',user_defined_dpi:'300'});
  const variants=[['oryginał',blob,'6'],['poprawiony kontrast',await prepareOcrImage(blob,'contrast'),'6'],['odcienie szarości',await prepareOcrImage(blob,'gray'),'11']];
  let best=null;
  for(let i=0;i<variants.length;i++){
   const [name,source,psm]=variants[i];ocrStatus('Odczyt '+(i+1)+'/3: '+name+'…');
   await worker.setParameters({tessedit_pageseg_mode:psm});
   const result=await worker.recognize(source);
   const candidate={text:(result?.data?.text||'').trim(),confidence:result?.data?.confidence||0,name};
   if(candidate.text.length>8&&(!best||candidate.confidence>best.confidence))best=candidate;
  }
  if(!best)throw Error('Nie wykryto czytelnego tekstu. Spróbuj zrobić zdjęcie na wprost, bez odblasków.');
  // Nie nadpisuj bez pytania tekstu, który mama już ręcznie poprawiła.
  if(page.text?.trim()&&!confirm('Na tej stronie jest już zapisany tekst. Zastąpić go nowym odczytem?')){
   ocrStatus('Zachowano poprzedni tekst.');return page.text;
  }
  page.text=best.text;await save();
  ocrStatus('Odczytano tekst (pewność OCR: '+Math.round(best.confidence)+'%). Sprawdź wynik przed użyciem.');
  return best.text;
 }catch(err){ocrStatus('Błąd: '+err.message);throw err;}
 finally{if(worker)await worker.terminate().catch(()=>{});ocrBusy=false;document.querySelectorAll('[data-action="page:ocr"],[data-action="reader:ocr"]').forEach(b=>b.disabled=false);}
}

// V69: rozpoznaj numer DRUKOWANY na skraju przepisanego tekstu, a nie numer cwiczenia w srodku.
function printedPageNumberFromOCR(text,position="bottom"){
 const lines=String(text||'').split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
 if(lines.length<3)return null;
 const parse=(line,explicitOnly=false)=>{
  const named=line.match(/^(?:strona|page|s\.)\s*[:#-]?\s*(\d{1,3})\s*$/i);
  const bare=explicitOnly?null:line.match(/^[–—-]?\s*(\d{1,3})\s*[–—-]?$/);
  const value=Number((named||bare)?.[1]);
  return Number.isInteger(value)&&value>=1&&value<=999?value:null;
 };
 // Samotna cyfra pod tekstem jest typowa dla dolnej paginy; wers naglowkowy moze byc rozdzialem.
 const candidate=position==='top'?lines[0]:lines.at(-1);
 // Nie szukamy cyfry z zadania po przeciwnej stronie kartki.
 return parse(candidate);
}

async function recognizePageAI(page,language='pol',overwriteApproved=false){
 if(ocrBusy)throw Error('Inne rozpoznawanie już trwa.');
 ocrBusy=true;
 try{
  ocrStatus('Przygotowuję zdjęcie do analizy AI…');
  const blob=await get('image:'+page.imageId);
  if(!blob)throw Error('Nie znaleziono zdjęcia strony.');
  if(blob.size>7*1024*1024)throw Error('Zdjęcie jest za duże (maksymalnie 7 MB).');
  const b64=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(String(r.result).split(',')[1]);r.onerror=()=>reject(Error('Nie udało się odczytać zdjęcia.'));r.readAsDataURL(blob)});
  ocrStatus('AI czyta stronę. To może potrwać kilkanaście sekund…');
  const response=await fetch('https://akademia-ai.niedzialkowskamagdalena02.workers.dev/ocr-ai',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({image:b64,mimeType:blob.type||'image/jpeg',language:language==='eng'?'angielski':'polski',pageNumberPosition:bookPageNumberLocation(data.books.find(b=>b.id===page.bookId))})});
  let result;try{result=await response.json()}catch{throw Error('Serwer nie zwrócił poprawnej odpowiedzi. Sprawdź wdrożenie Netlify Functions.')}
  if(!response.ok)throw Error(result.error||'Błąd usługi AI: '+response.status);
  const text=String(result.text||'').trim();if(!text)throw Error('AI nie znalazło czytelnego tekstu na zdjęciu.');
  if(page.text?.trim()&&!overwriteApproved&&!confirm('Na stronie jest już tekst. Czy zastąpić go wynikiem AI?')){ocrStatus('Zachowano dotychczasowy tekst.');return}
  // Numer zmieniamy dopiero po UDANYM odczycie; przy braku numeru zostaje kolejnosc dodawania.
  const marker=text.match(/\[\[PAGE_NUMBER:(\d{1,3}|UNKNOWN)\]\]/i);
  const cleanText=text.replace(/\[\[PAGE_NUMBER:(?:\d{1,3}|UNKNOWN)\]\]/gi,'').trim();
  const loc=bookPageNumberLocation(data.books.find(b=>b.id===page.bookId));
  const detected=marker&&/^\d+$/.test(marker[1])?Number(marker[1]):null;
  const printed=(detected>=1&&detected<=999)?detected:(!marker?printedPageNumberFromOCR(cleanText,loc):null);
  if(printed!==null&&!page.pageNumberManual)page.number=printed;
  page.text=cleanText;page.ocrLanguage=language;page.reviewed=false;page.ocrDetectedPageNumber=printed;await save();
  ocrStatus('AI odczytało tekst'+(printed!==null?'; rozpoznany numer strony: '+printed:'; numer pozostawiono bez zmian')+'. Sprawdź wynik.');return text;
 }catch(err){ocrStatus('Błąd AI: '+err.message+' Wcześniej zapisany tekst nie został usunięty.');throw err}
 finally{ocrBusy=false;document.querySelectorAll('[data-action="page:ai"],[data-action="reader:ai"]').forEach(b=>b.disabled=false)}
}
const grant=async(child,points,reason,key)=>{if(data.history.some(h=>h.key===key))return false;data.profiles[child].xp+=points;data.profiles[child].coins+=points;data.history.unshift({id:uid(),key,child,points,reason,at:new Date().toISOString()});await save();return true};
function layout(title,content){cancelAIRequests();stopVoice();closeMicBubble();app.innerHTML=`<main class="wrap"><header class="head"><div><div class="brand">⚡ AKADEMIA SUPERBOHATERÓW <span style="display:inline-block;font-size:0.72em;border:1px solid currentColor;border-radius:8px;padding:2px 7px;vertical-align:middle">V76 · korekta 2</span></div><div class="sub">${e(title)}</div></div>${role==='child'?trainingSoundControl():''}${role?button(testMode?'← Zakończ test':'← Profile','exit','alt'):''}</header>${testMode?'<div class="test-banner">🧪 TRYB MAMY — BEZPŁATNY TEST • POSTĘPY NIE SĄ ZAPISYWANE</div>':''}${content}</main>${role==='child'?'<button class="mic" data-action="mic" aria-label="Sterowanie głosowe">🎙️</button>':''}`;document.querySelectorAll('[data-speak]').forEach(b=>b.addEventListener('click',()=>speak(b.dataset.speak,b.dataset.lang,role==='child'?profile().mentor:'tech',data.settings.rate||1)));hydrateImages();v76AfterRender();if(role==='child'&&(tab==='learn'||tab==='subjectmissions'))installMicDrag()}
async function hydrateImages(){for(const el of document.querySelectorAll('[data-image]')){const src=await img(el.dataset.image);if(el.isConnected&&src){el.src=src;el.onload=()=>URL.revokeObjectURL(src)}}}
function nav(){return role==='admin'?`<div class="tabs">${[['home','Przegląd'],['books','📚 Książki'],['missions','📋 Misje'],['settings','⚙️ Ustawienia'],['test','🧪 Testuj wszystko'],['backup','💾 Kopia']].map(([k,n])=>button(n,'admin:'+k,adminTab===k?'gold':'alt')).join('')}</div>`:`<div class="tabs">${[['home','🎯 Misje'],['books','📚 Książki'],['learn','🧠 Trening'],['academy','📖 Sala odkrywców'],['mentor','🤖 Mentor'],['base','🏙️ Baza Avengersów i gry']].map(([k,n])=>button(n,'child:'+k,tab===k?'gold':'alt')).join('')}</div>`}
function render(){if(tab!=='arcade')stopArcade();if(!role){layout('Wybierz swoją bazę',`<section class="card"><h1>Witaj w Akademii! 🛡️</h1><p>Każdy bohater ma własne misje i nagrody.</p></section><div class="grid">${people.map(([id,name])=>`<button class="tile" data-action="enter:${id}"><img class="profile-hero" src="assets/art/${data.profiles[id].hero||(id==='pawel'?'iron':'spider')}.svg" alt=""><h2>${name}</h2><small>${gradeName(data.profiles[id].grade)} · ${data.profiles[id].coins} złotych</small></button>`).join('')}</div><section class="card">${button('🔐 Centrum dowodzenia mamy','enter:admin','gold')}<p class="muted">Tryb lokalny: dane z tego telefonu nie synchronizują się jeszcze z innymi urządzeniami. ${syncAdapter.status()}</p></section>`);return}if(role==='admin')adminRender();else childRender()}
const DEFAULT_SUBJECTS=['Polski','Matematyka','Angielski','Przyroda','Plastyka','Muzyka','Informatyka','Wychowanie fizyczne','Etyka','Religia','Przedszkole'];
function subjectChecks(id){const current=data.profiles[id].subjects||[],items=[...new Set([...DEFAULT_SUBJECTS,...current])];return `<label>Przedmioty — zaznacz właściwe</label><div class="subject-list">${items.map(x=>`<label class="subject-chip"><input type="checkbox" data-subject-for="${id}" value="${e(x)}" ${current.includes(x)?'checked':''}> ${e(x)}</label>`).join('')}</div>`}
const VOCAB_ASSETS={apple:'apple',cat:'cat',dog:'dog',house:'house',book:'book',sun:'sun',tree:'tree',car:'car',bird:'bird',fish:'fish',ball:'ball',milk:'milk',school:'school',water:'water',flower:'flower'};
function vocabArt(word){const k=VOCAB_ASSETS[String(word||'').toLowerCase()];return k?`<img src="assets/art/vocab-${k}.svg" alt="Ilustracja: ${e(word)}">`:`<div class="vocab-fallback">${e(word)}</div>`}
const HEROES=[['iron','Iron Man','🦾','tech'],['spider','Spider-Man','🕷️','fun'],['hulk','Hulk','💚','fun'],['captain','Kapitan Ameryka','🛡️','tech'],['thor','Thor','⚡','fun'],['widow','Czarna Wdowa','🥷','tech'],['panther','Czarna Pantera','🐈‍⬛','tech'],['hawkeye','Hawkeye','🏹','tech'],['groot','Groot','🌳','fun'],['gamora','Gamora','⚔️','tech']];
function hero(id){return HEROES.find(x=>x[0]===id)||HEROES[0]}
function heroPicker(id){const current=data.profiles[id].hero||(id==='pawel'?'iron':'spider');return `<div class="hero-picker">${HEROES.map(([key,name,emoji])=>`<button class="hero-choice ${key===current?'chosen':''}" data-action="hero:set:${id}:${key}"><img class="hero-thumb" src="assets/art/${key}.svg" alt=""><b>${name}</b>${key===current?'<small>✓ Wybrany</small>':''}</button>`).join('')}</div>`}
const MENTOR_LINES={fun:{yes:['Spider-Man: Brawo! Pajęczy zmysł aż zatańczył!','Spider-Man: Oho! Mamy geniusza. Czy ktoś widział moje skarpetki?','Spider-Man: Świetnie! Nawet wisząc głową w dół, nie zrobiłbym tego lepiej!'],no:['Spider-Man: Ups! Sieć się trochę poplątała. Jeszcze raz!','Spider-Man: Mała wpadka! Nawet superbohater czasem ląduje w koszu na pranie.']},tech:{yes:['Iron Man: Analiza zakończona. Wynik: imponujący.','Iron Man: JARVIS, zapisz: młody geniusz na pokładzie.','Iron Man: Precyzja godna mojego laboratorium. Zatwierdzam!'],no:['Iron Man: Wykryto drobną usterkę w obliczeniach. Poprawiamy.','Iron Man: Prototyp odpowiedzi wymaga aktualizacji. Spróbuj ponownie.']}};
let mentorCounter=0;
function mentorLine(p,ok){const set=MENTOR_LINES[p.mentor==='fun'?'fun':'tech'][ok?'yes':'no'];return set[(mentorCounter++)%set.length]}

function adminRender(){let html=nav();if(adminTab==='home'){let pending=data.missions.filter(m=>m.status==='sent');html+=`<section class="card"><h2>Do sprawdzenia: ${pending.length}</h2>${pending.map(m=>missionCard(m,true)).join('')||'<p>Brak zgłoszeń.</p>'}</section><div class="grid">${people.map(([id,name])=>`<div class="card"><h3>${name}</h3><strong>⭐ ${data.profiles[id].coins} złotych</strong><p>${gradeName(data.profiles[id].grade)}</p></div>`).join('')}</div><p class="muted">Zdalne zgłoszenia wymagają późniejszego uruchomienia synchronizacji i logowania serwerowego.</p>`}
if(adminTab==='books')html+=v76HomeMarkup();
if(adminTab==='book'){const b=data.books.find(x=>x.id===bookId);if(!b){adminTab='books';return render()}html+=v76BookMarkup(b)}
if(adminTab==='question-review'){const b=data.books.find(x=>x.id===bookId);if(v76Q.level==='picker')html+=v76ReviewPicker();else if(!b){adminTab='books';return render()}else html+=v76QuestionView(b)}
if(adminTab==='page'){const p=data.bookPages.find(p=>p.id===pageId);if(!p){adminTab='book';return render()}html+=v74PageMarkup(p)}
if(adminTab==='missions')html+=`<section class="card"><h2>Nowa misja</h2>${select('mchild','Dla kogo',people,'pawel')}${select('mtype','Rodzaj',[['homework','🎒 Misja szkolna'],['chore','🏠 Misja domowa'],['test','🚨 Sprawdzian / ważny termin']],'homework')}${input('mtitle','Opis / zadania')}${input('msubject','Przedmiot / kategoria','Polski')}${select('mbook','Podręcznik (opcjonalnie)',[['','Bez książki'],...data.books.map(b=>[b.id,b.title])],'')}${input('mpage','Numer strony','', 'number')}${input('mdue','Termin','', 'date')}${select('mrepeat','Powtarzanie',[['none','Jednorazowo'],['daily','Codziennie'],['weekly','Co tydzień']],'none')}${input('mpoints','Pieniążki po zatwierdzeniu','20','number')}<label><input id="mphoto" type="checkbox" checked> Wymagaj zdjęcia wykonanej pracy</label><p class='muted'>Przy typie „Test / sprawdzian” wybierz przedmiot, podręcznik i stronę lub pozostaw książkę pustą, aby utworzyć test losowy z wybranego przedmiotu.</p>${button('➕ Dodaj misję','mission:add','gold')}</section><section class="card"><h2>Wszystkie misje</h2>${data.missions.slice().reverse().map(m=>missionCard(m,true)).join('')||'Brak misji.'}</section>`;
if(adminTab==='settings')html+=`<section class="card"><h2>Profile i poziomy</h2><h3>🧪 Podgląd całej Bazy Avengersów</h3><p>Tryb testowy pokazuje wszystkie piętra i wyposażenie, bez kupowania i bez zmiany postępów dzieci.</p>${button('🏙️ Zobacz całą bazę — podgląd','admin:preview','gold')}${people.map(([id,name])=>`<div class="item"><h3>${name}</h3></div>${select('grade_'+id,'Etap edukacji',grades,data.profiles[id].grade)}${subjectChecks(id)}${input('newsubject_'+id,'Dodaj nowy przedmiot (opcjonalnie)')}${input('pin_'+id,'PIN profilu (opcjonalny)',data.profiles[id].pin,'password')}<h4>Wybierz bohatera</h4>${heroPicker(id)}${button('Zapisz '+name,'profile:save:'+id)}</section><section class="card">`).join('')}<h2>PIN mamy</h2>${input('parentpin','Nowy PIN (min. 4 cyfry)','','password')}${button('Zmień PIN','pin:change')}<h3>Nagrody za trening</h3>${input('xpPractice','XP za poprawne ćwiczenie',data.settings.xpPractice,'number')}${input('dailyLimit','Dzienny limit nagród',data.settings.dailyPracticeLimit,'number')}${input('rate','Tempo czytania',data.settings.rate||1,'number')}${button('Zapisz ustawienia','settings:save')}<h3>Muzyczne nagrody</h3>${input('songtitle','Nazwa piosenki')}${input('songurl','Link YouTube')}<label for="songlyrics">Tekst piosenki (wklej lub wpisz)</label><textarea id="songlyrics" rows="8" placeholder="Każdy wers w osobnej linii"></textarea>${select('songchild','Misja dla',people,'pawel')}${button('🎵 Zapisz piosenkę i utwórz misję','song:add','gold')}<p>${data.settings.songs.map((s,i)=>`${e(s.title)} ${button('Usuń','song:delete:'+i,'line')}`).join('<br>')}</p><p class="muted">PIN-y chronią tylko przed przypadkowym wejściem. Pełne uprawnienia wymagają kont serwerowych.</p></section>`;
if(adminTab==='test')html+=`<section class="card"><h2>🧪 Centrum testów mamy</h2><p>Uruchom dowolny profil w trybie testowym. Wszystkie gry, pomieszczenia, bohaterowie i przedmioty są odblokowane. Nic nie kosztuje złotych i żadne zmiany nie zostaną zapisane.</p><div class="grid">${people.map(([id,name])=>button('🎮 Testuj jako '+name,'test:enter:'+id,'gold')).join('')}</div><p class="muted">Po zakończeniu wybierz „Zakończ test”. Dane dzieci pozostaną takie jak przed testem.</p></section>`;
if(adminTab==='preview')html+=`<section class='card'>${button('← Wróć do ustawień','admin:settings')}<h2>🧪 Pełna Baza Avengersów — tryb testowy</h2><p class='muted'>Ten podgląd nie wydaje złotych ani nie odblokowuje elementów na stałe.</p>${baseMarkup({...data.profiles.pawel,coins:9999,base:{version:1,owned:BASE_ITEMS.map(x=>x.id)}},button,true)}</section>`;if(adminTab==='backup')html+=`<section class="card"><h2>Pełna kopia danych</h2><p>Eksport obejmuje zdjęcia stron, zdjęcia prac, profile, XP i misje. Przy dużej bibliotece plik będzie duży.</p>${button('⬇️ Pobierz kopię JSON','backup:export','gold')}<label>Przywróć kopię JSON</label><input type="file" id="backupfile" accept=".json,application/json">${button('Przywróć kopię','backup:import')}<p class="muted">Nie odinstalowuj aplikacji ani nie czyść danych witryny bez kopii. Synchronizacja między telefonami jeszcze nie jest aktywna.</p></section>`;
layout('Centrum dowodzenia mamy',html)}
function dataPageCount(id){return data.bookPages.filter(p=>p.bookId===id).length}

function youtubeId(url){
 try{const u=new URL(url);const h=u.hostname.replace(/^www\./,'');
  let id=h==='youtu.be'?u.pathname.slice(1):(['youtube.com','m.youtube.com','youtube-nocookie.com'].includes(h)?(u.searchParams.get('v')||u.pathname.match(/\/(?:embed|shorts|live)\/([\w-]+)/)?.[1]):'');
  return /^[A-Za-z0-9_-]{11}$/.test(id||'')?id:null;
 }catch{return null}
}
function songScreen(song,mission){
 const id=youtubeId(song.url);
 const lyrics=String(song.lyrics||'').split(/\r?\n/).filter(x=>x.trim());
 return `<section class="card song-stage">${button('← Wróć do misji','child:home')}<h2>🎵 ${e(song.title)}</h2><p>Posłuchaj i śpiewaj razem z tekstem!</p>
 ${id?`<div class="song-video"><iframe title="Piosenka ${e(song.title)}" src="https://www.youtube-nocookie.com/embed/${id}" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy" referrerpolicy="strict-origin-when-cross-origin"></iframe></div>`:'<p>Nieprawidłowy adres YouTube.</p>'}
 <h3>🎤 Tekst piosenki</h3><div class="song-lyrics">${lyrics.map((line,i)=>`<button class="song-line" data-action="song:line:${i}">${e(line)}</button>`).join('')||'<p>Mama nie dodała jeszcze tekstu piosenki.</p>'}</div>
 <p class="muted">Dotknij wersu, aby go wyróżnić. Tekst nie przewija się automatycznie w rytm filmu.</p>
 ${mission?button('📸 Zgłoś wykonanie misji','mission:submit:'+mission.id,'gold'):''}</section>`;
}
function missionGroup(m){return m.type==='test'?'test':m.type==='chore'?'home':m.type==='song'?'home':'school'}
function missionDue(m){if(!m.due)return '';const d=new Date(m.due+'T12:00:00'),today=new Date();today.setHours(12,0,0,0);const days=Math.round((d-today)/86400000);const label=days<0?'PO TERMINIE':days===0?'DZISIAJ':days===1?'JUTRO':days<=3?'ZA '+days+' DNI':'DO '+d.toLocaleDateString('pl-PL',{day:'numeric',month:'long'});return `<div class="mission-deadline ${days<0?'late':days<=1?'urgent':''}">⏰ ${label}</div>`}
function missionBoard(child){const all=data.missions.filter(m=>m.child===child&&m.status!=='approved'&&m.status!=='school');const groups=[['test','🚨 ALERTY BOHATERA','Sprawdziany i ważne terminy'],['school','🎒 MISJE SZKOLNE','Prace domowe i zadania do szkoły'],['home','🏠 MISJE DOMOWE','Obowiązki, piosenki i wyzwania w domu']];const sorted=arr=>arr.slice().sort((a,b)=>(a.due||'9999').localeCompare(b.due||'9999'));return `<div class="mission-dashboard">${groups.map(([key,title,desc])=>{const ms=sorted(all.filter(m=>missionGroup(m)===key));return `<section class="mission-zone zone-${key}"><h3>${title} <span class="mission-count">${ms.length}</span></h3><p>${desc}</p>${ms.map(m=>missionCard(m,false)).join('')||'<p class="mission-empty">✨ Wszystko zrobione!</p>'}</section>`}).join('')}</div>`}
function missionCard(m,admin){let status={todo:'Do zrobienia',sent:'Czeka na mamę',redo:'Do poprawy',approved:'Zatwierdzone',school:'Odrobione w szkole'}[m.status]||m.status;return `<div class="mission"><div class="row between"><b>${e(m.title)}</b><span class="pill">${status}</span></div>${missionDue(m)}<small>${e(data.profiles[m.child].name)} · ${e(m.subject)} · ${m.points} złotych ${m.page?'· str. '+m.page:''}</small>${m.type==='song'&&!admin?button('🎵 Otwórz piosenkę i tekst','song:open:'+m.id,'gold'):''}${m.type==='test'&&!admin&&m.status==='todo'?button('📝 Rozpocznij sprawdzian','test:start:'+m.id,'gold'):''}${m.comment?`<p>💬 ${e(m.comment)} ${speakBtn(m.comment)}</p>`:''}${m.photoId?`<img class="pagephoto" data-image="${m.photoId}" alt="Zdjęcie wykonanej pracy">`:''}<div class="row">${admin?`${m.status==='sent'?button('✓ Zatwierdź','mission:approve:'+m.id,'gold')+button('↩ Do poprawy','mission:reject:'+m.id):''}${m.status==='todo'?button('✓ Odrobione w szkole','mission:school:'+m.id):''}${button('Usuń','mission:delete:'+m.id,'line')}`:m.status==='todo'||m.status==='redo'?button('📸 Zgłoś wykonanie','mission:submit:'+m.id,'gold'):' '}</div></div>`}
let lessonIndex=0,academySubject='',arcadeId='snake';
const ARCADE_GAMES=[{id:'snake',title:'Kosmiczny Wąż',icon:'🐍',cost:20,desc:'Zbieraj gwiazdki, omijaj ściany i własny ogon.'},{id:'blocks',title:'Wieża Klocków',icon:'🧱',cost:30,desc:'Układaj spadające klocki i zapełniaj rzędy.'}];
const LESSONS=[
{icon:'🕵️',title:'Rzeczownik',subtitle:'Kto? Co?',story:'Spider-Man szuka sprawcy zamieszania! Widzi kota, rower i szkołę. Wszystkie te nazwy to rzeczowniki.',rule:'Rzeczownik nazywa osoby, zwierzęta, rośliny, rzeczy i miejsca. Odpowiada na pytania: kto? co?',examples:'kto? lekarz, kot; co? drzewo, książka',question:'Który wyraz jest rzeczownikiem?',answers:['skacze','kot','zielony'],correct:1,why:'Kot to nazwa zwierzęcia.'},
{icon:'🎨',title:'Przymiotnik',subtitle:'Jaki? Jaka? Jakie?',story:'Iron Man opisuje nową zbroję: czerwona, błyszcząca, szybka. Tak działają przymiotniki!',rule:'Przymiotnik opisuje cechy i odpowiada na pytania: jaki? jaka? jakie?',examples:'czerwony hełm, szybki pojazd, miła osoba',question:'Który wyraz jest przymiotnikiem?',answers:['biegnie','zielony','dom'],correct:1,why:'Zielony opisuje cechę, czyli kolor.'},
{icon:'🏃',title:'Czasownik',subtitle:'Co robi? Co się dzieje?',story:'Thor podnosi młot, Spider-Man skacze, a Groot rośnie. Każda z tych czynności ma własną nazwę.',rule:'Czasownik mówi o czynności lub stanie. Pytamy: co robi? co się z nim dzieje?',examples:'czyta, śpi, skacze, rośnie',question:'Który wyraz jest czasownikiem?',answers:['skacze','zbroja','niebieski'],correct:0,why:'Skacze oznacza czynność.'},
{icon:'✍️',title:'Ó czy U?',subtitle:'Ortografia bez strachu',story:'Groot znalazł słowo „góra”. Kiedy zmienisz je na „górka”, nadal słyszysz ó. Ale uwaga: nie każde ó da się tak wyjaśnić!',rule:'Ó często piszemy, gdy wymienia się na o, e lub a, np. stół — stoły. Wiele wyrazów trzeba też zapamiętać.',examples:'stół — stoły, wóz — wozy; ulica piszemy przez u',question:'Który zapis jest poprawny?',answers:['gura','góra','góra przez u'],correct:1,why:'Poprawnie piszemy „góra” przez ó.'},
{icon:'🐝',title:'RZ czy Ż?',subtitle:'Zasady pisowni',story:'Gamora sprawdza tajną wiadomość: „morze”. Iron Man podpowiada: morze — morski! Tak łatwiej zapamiętać rz.',rule:'Rz często wymienia się na r, np. morze — morski. Ż może wymieniać się na g, z, dz, h lub ź, np. książka — księga.',examples:'morze — morski, książka — księga',question:'Jak zapiszesz miejsce pełne fal?',answers:['może','morze','możeż'],correct:1,why:'Morze piszemy przez rz. „Może” oznacza coś innego.'},
{icon:'🧮',title:'Dodawanie',subtitle:'Łączymy siły',story:'Do bazy przyleciały 4 roboty, a później jeszcze 3. Ile robotów pomaga teraz Iron Manowi?',rule:'Dodawanie łączy liczby w jedną większą całość. Możesz liczyć na palcach, klockach albo osi liczbowej.',examples:'4 + 3 = 7, 10 + 5 = 15',question:'Ile wynosi 8 + 5?',answers:['12','13','14'],correct:1,why:'8 + 2 = 10, a potem jeszcze 3, czyli 13.'},
{icon:'➖',title:'Odejmowanie',subtitle:'Co zostało?',story:'Spider-Man miał 12 zapasowych pojemników z siecią. Zużył 5 podczas treningu.',rule:'Odejmowanie oznacza zabieranie części lub szukanie różnicy między liczbami.',examples:'12 − 5 = 7, 9 − 4 = 5',question:'Ile wynosi 14 − 6?',answers:['7','8','9'],correct:1,why:'14 − 4 = 10 i jeszcze − 2 = 8.'},
{icon:'✖️',title:'Mnożenie',subtitle:'Równe grupy',story:'W hangarze stoją 3 rzędy po 4 pojazdy. Nie trzeba liczyć każdego z osobna!',rule:'Mnożenie to szybki sposób dodawania równych grup. 3 × 4 to trzy grupy po cztery.',examples:'3 × 4 = 12, bo 4 + 4 + 4 = 12',question:'Ile wynosi 5 × 3?',answers:['8','15','20'],correct:1,why:'3 + 3 + 3 + 3 + 3 = 15.'},
{icon:'🍕',title:'Ułamki',subtitle:'Dzielimy sprawiedliwie',story:'Hulk i Thor dzielą pizzę na cztery równe kawałki. Jeden kawałek to jedna czwarta pizzy.',rule:'Ułamek opisuje część całości podzielonej na równe części. 1/4 to jedna z czterech równych części.',examples:'1/2 to połowa, 1/4 to ćwiartka',question:'Jak zapisać połowę?',answers:['1/2','1/3','2/1'],correct:0,why:'Jedna z dwóch równych części to 1/2.'},
{icon:'👋',subject:'english',title:'Powitania',subtitle:'Hello! Good morning!',story:'Spider-Man spotyka nowego kolegę i mówi: Hello! A rano Iron Man wita wszystkich: Good morning!',rule:'Hello to cześć. Good morning to dzień dobry rano. Goodbye to do widzenia.',examples:'Hello! — Cześć!; Good morning! — Dzień dobry!; Goodbye! — Do widzenia!',question:'Jak powiedzieć po angielsku „cześć”?',answers:['Goodbye','Hello','Thank you'],correct:1,why:'Hello oznacza cześć.'},
{icon:'🐶',subject:'english',title:'Zwierzęta',subtitle:'Cat, dog, bird',story:'Groot spotkał kota, psa i ptaka. Gamora uczy go ich angielskich nazw.',rule:'Cat to kot, dog to pies, bird to ptak, fish to ryba.',examples:'cat — kot; dog — pies; bird — ptak; fish — ryba',question:'Co znaczy dog?',answers:['pies','kot','ryba'],correct:0,why:'Dog to pies.'},
{icon:'🎨',subject:'english',title:'Kolory',subtitle:'Red, blue, green',story:'Iron Man pokazuje czerwony pancerz, a Hulk jest zielony. Nauczmy się nazywać te kolory!',rule:'Red to czerwony, blue to niebieski, green to zielony, yellow to żółty.',examples:'red — czerwony; blue — niebieski; green — zielony; yellow — żółty',question:'Jak powiedzieć „zielony”?',answers:['red','yellow','green'],correct:2,why:'Green to zielony.'},
{icon:'🔢',subject:'english',title:'Liczby 1–10',subtitle:'One, two, three',story:'Thor liczy młoty: one, two, three! Czy potrafisz policzyć do dziesięciu?',rule:'One 1, two 2, three 3, four 4, five 5, six 6, seven 7, eight 8, nine 9, ten 10.',examples:'one — jeden; two — dwa; three — trzy; ten — dziesięć',question:'Co znaczy three?',answers:['dwa','trzy','cztery'],correct:1,why:'Three to trzy.'},
{icon:'📐',title:'Figury geometryczne',subtitle:'Tajemnice kształtów',story:'Kapitan Ameryka ogląda tarczę: jest okrągła. Iron Man projektuje kwadratowe panele w laboratorium.',rule:'Kwadrat ma cztery równe boki. Prostokąt ma cztery kąty proste. Trójkąt ma trzy boki.',examples:'okno — prostokąt, znak ostrzegawczy — trójkąt',question:'Ile boków ma trójkąt?',answers:['3','4','5'],correct:0,why:'Trójkąt ma trzy boki.'}
];
// V30: interaktywne gry tematyczne w Sali Odkrywców
const DISCOVERY_PAIRS={
 0:[['kot','rzeczownik'],['czyta','czasownik'],['zielony','przymiotnik'],['szkoła','rzeczownik']],
 1:[['szybki','przymiotnik'],['rower','rzeczownik'],['skacze','czasownik'],['miła','przymiotnik']],
 2:[['biegnie','czasownik'],['książka','rzeczownik'],['czerwony','przymiotnik'],['śpiewa','czasownik']],
 3:[['stół','ó'],['ulica','u'],['góra','ó'],['buty','u']],
 4:[['morze','rz'],['żaba','ż'],['rzeka','rz'],['książka','ż']],
 5:[['4 + 3','7'],['5 + 2','7'],['6 + 4','10'],['8 + 5','13']],
 6:[['9 − 4','5'],['12 − 5','7'],['14 − 6','8'],['10 − 3','7']],
 7:[['3 × 4','12'],['5 × 3','15'],['2 × 6','12'],['4 × 4','16']],
 8:[['połowa','1/2'],['ćwiartka','1/4'],['trzy czwarte','3/4'],['jedna trzecia','1/3']],
 9:[['hello','cześć'],['goodbye','do widzenia'],['good morning','dzień dobry'],['thank you','dziękuję']],
 10:[['dog','pies'],['cat','kot'],['bird','ptak'],['fish','ryba']],
 11:[['red','czerwony'],['blue','niebieski'],['green','zielony'],['yellow','żółty']],
 12:[['one','1'],['two','2'],['three','3'],['five','5']],
 13:[['trójkąt','3 boki'],['kwadrat','4 równe boki'],['prostokąt','4 kąty proste'],['koło','brak boków']]
};
let discoveryGame=null;
function discoveryShuffle(a){return [...a].sort(()=>Math.random()-.5)}
function discoveryStart(mode){
 const pairs=DISCOVERY_PAIRS[lessonIndex]||[];
 if(!pairs.length)return;
 const items=discoveryShuffle(pairs).slice(0,mode==='match'?4:3);
 discoveryGame={mode,items,index:0,score:0,selected:null,done:[],finished:false};
 discoveryDraw();
}
function discoveryDraw(){
 const g=discoveryGame,el=$('discovery-game');if(!el||!g)return;
 const lang=LESSONS[lessonIndex]?.subject==='english'?'en-US':'pl-PL';
 if(g.finished){el.innerHTML=`<div class="discovery-result"><span>🏆</span><h3>Misja zakończona!</h3><p>Wynik: ${g.score} / ${g.items.length}</p>${button('🔄 Zagraj ponownie','discovery:restart','gold')} ${button('📖 Inny temat','child:academy')}</div>`;return}
 if(g.mode==='match'){
  const options=discoveryShuffle(g.items.map((x,i)=>({value:x[1],idx:i}))).map((x,i)=>`<button data-action="discovery:match:${x.idx}" ${g.done.includes(x.idx)?'disabled':''}>${e(x.value)}</button>`).join('');
  const current=g.items[g.index];
  el.innerHTML=`<div class="discovery-game"><span class="discovery-pill">🔗 ŁĄCZ W PARY</span><div class="discovery-count">${g.index+1}/${g.items.length}</div><p>Dopasuj odpowiedź do:</p><div class="discovery-prompt">${e(current[0])} ${speakBtn(current[0],lang)}</div><div class="discovery-options">${options}</div><p class="discovery-feedback" id="discovery-feedback" role="status"></p></div>`;
 }else{
  const current=g.items[g.index],answers=discoveryShuffle([current[1],...discoveryShuffle([...new Set((DISCOVERY_PAIRS[lessonIndex]||[]).map(x=>x[1]).filter(x=>x!==current[1]))]).slice(0,2)]);
  el.innerHTML=`<div class="discovery-game"><span class="discovery-pill">⚡ SZYBKA MISJA</span><div class="discovery-count">${g.index+1}/${g.items.length}</div><p>Wybierz poprawną odpowiedź:</p><div class="discovery-prompt">${e(current[0])} ${speakBtn(current[0],lang)}</div><div class="discovery-options">${answers.map(x=>`<button data-action="discovery:quick" data-answer="${e(x)}">${e(x)}</button>`).join('')}</div><p class="discovery-feedback" id="discovery-feedback" role="status"></p></div>`;
 }
 el.querySelectorAll('[data-speak]').forEach(b=>b.addEventListener('click',ev=>{ev.stopPropagation();speak(b.dataset.speak,b.dataset.lang,profile().mentor)}));
}
function discoveryAnswer(value){
 const g=discoveryGame;if(!g||g.finished)return;
 const correct=g.items[g.index][1]===value,fb=$('discovery-feedback');
 if(!correct){if(fb)fb.textContent='💡 Spróbuj jeszcze raz! Poszukaj właściwej pary.';return}
 g.score++;g.done.push(g.index);g.index++;
 if(g.index>=g.items.length)g.finished=true;
 discoveryDraw();
}

// V36_AVENGERS_GAME
const avengersQuiz = [
 {q:'Ile to 7 + 5?',a:['10','12','14'],ok:1,hero:'iron'},
 {q:'Które słowo oznacza KOT?',a:['DOG','CAT','SUN'],ok:1,hero:'spider'},
 {q:'Ile to 9 × 3?',a:['18','27','36'],ok:1,hero:'thor'},
 {q:'Które słowo oznacza DOM?',a:['HOUSE','TREE','BOOK'],ok:0,hero:'iron'},
 {q:'Ile to 20 − 8?',a:['14','12','10'],ok:1,hero:'spider'},
 {q:'Które słowo oznacza WODA?',a:['MILK','APPLE','WATER'],ok:2,hero:'thor'}
];
let avengersRun=null;

function avengersPanel(){
 if(!avengersRun)return `<section class="avengers-v36">
  <h2>⚡ Wyzwanie Avengersów</h2>
  <p>Rozwiąż sześć zadań i zdobądź punkty!</p>
  <button data-action="av36:start">🚀 Rozpocznij misję</button>
 </section>`;
 const g=avengersRun;
 if(g.i>=g.items.length)return `<section class="avengers-v36">
  <h2>🏆 Misja ukończona!</h2>
  <p>Wynik: ${g.points} / ${g.items.length}</p>
  <button data-action="av36:start">🔁 Zagraj ponownie</button>
  <button data-action="av36:close">Wróć do treningu</button>
 </section>`;
 const q=g.items[g.i];
 return `<section class="avengers-v36">
  <div class="av36-top">⚡ MISJA AVENGERSÓW <span>⭐ ${g.points} pkt</span></div>
  <div class="av36-progress"><div style="width:${g.i/g.items.length*100}%"></div></div>
  <img class="av36-hero" src="assets/art/${q.hero}.svg" alt="Avenger">
  <p>Wyzwanie ${g.i+1} z ${g.items.length}</p>
  <h2>${e(q.q)} ${v37Voice(q.q)}</h2>
  <div class="av36-answers">${q.a.map((answer,i)=>`<div class="v37-answer">
 <button data-action="av36:answer:${i}" ${g.done?'disabled':''}>${e(answer)}</button>
 ${v37Voice(answer,q.lang||'pl-PL')}
 </div>`).join('')}</div>
  ${g.done?`<p class="av36-result">${g.good?'🎉 Brawo!':'💡 Poprawna odpowiedź: '+e(q.a[q.ok])}</p>
  <button data-action="av36:next">➡️ Dalej</button>`:''}
  <button class="av36-close" data-action="av36:close">✖ Zamknij</button>
 </section>`;
}


// V37_CHALLENGE_HUB
let v37Subject='all';
let v37Classic=false;

const v37Subjects=[
 ['all','🌌','Cała wiedza','Misja mieszana'],
 ['polski','📖','Polski','Słowa i zagadki'],
 ['matematyka','🔢','Matematyka','Liczby i logika'],
 ['angielski','🇬🇧','Angielski','Słówka i wymowa'],
 ['przyroda','🌿','Przyroda','Odkrywaj świat']
];

const v37Bank={
 polski:[
 ['Ile sylab ma słowo motyl?',['1','2','3'],1],
 ['Które słowo oznacza zwierzę?',['kot','dom','las'],0],
 ['Który wyraz jest poprawny?',['ksionszka','książka','ksionżka'],1],
 ['Które słowo jest czasownikiem?',['biega','zielony','szkoła'],0],
 ['Co jest przeciwieństwem słowa wysoki?',['niski','szeroki','długi'],0],
 ['Ile liter ma słowo las?',['2','3','4'],1]
 ],
 matematyka:[
 ['Ile to 7 + 5?',['10','12','14'],1],
 ['Ile to 20 - 8?',['14','12','10'],1],
 ['Ile to 9 razy 3?',['18','27','36'],1],
 ['Która liczba jest parzysta?',['7','11','12'],2],
 ['Ile boków ma trójkąt?',['3','4','5'],0],
 ['Ile to 6 razy 4?',['20','24','28'],1]
 ],
 angielski:[
 ['Co oznacza CAT?',['pies','kot','dom'],1],
 ['Co oznacza HOUSE?',['dom','drzewo','książka'],0],
 ['Co oznacza WATER?',['mleko','woda','słońce'],1],
 ['Co oznacza BOOK?',['szkoła','piłka','książka'],2],
 ['Co oznacza DOG?',['kot','pies','ptak'],1],
 ['Co oznacza SUN?',['słońce','księżyc','deszcz'],0]
 ],
 przyroda:[
 ['Na jakiej planecie żyjemy?',['Mars','Ziemia','Wenus'],1],
 ['Co zbiera pszczoła z kwiatów?',['Nektar','Piasek','Kamienie'],0],
 ['Czego potrzebuje roślina?',['Wody i światła','Plastiku','Ciemności'],0],
 ['Ile mamy pór roku?',['2','4','6'],1],
 ['Które zwierzę jest ssakiem?',['Żaba','Delfin','Motyl'],1],
 ['Co daje nam Słońce?',['Światło i ciepło','Śnieg','Piasek'],0]
 ]
};

// V75: większa pula sprawdzonych, różnych pytań w misjach poza podręcznikiem.
v37Bank.polski.push(
 ['Która litera jest samogłoską?',['B','A','K'],1],['Który wyraz jest przymiotnikiem?',['Biega','Zielony','Dom'],1],
 ['Ile sylab ma słowo „mama”?',['1','2','3'],1],['Które słowo jest rzeczownikiem?',['Kot','Śpiewa','Wysoki'],0],
 ['Który wyraz pasuje na koniec zdania: „Dziś świeci…”?',['słońce','biegać','szybko'],0],
 ['Które słowo piszemy wielką literą?',['warszawa','Warszawa','warszAWA'],1]);
v37Bank.matematyka.push(['Ile to 13 + 6?',['18','19','20'],1],['Ile to 16 − 7?',['8','9','10'],1],['Co jest większe?',['38','83','33'],1],['Ile boków ma kwadrat?',['3','4','5'],1],['Ile minut ma godzina?',['30','60','100'],1],['Ile to 4 × 5?',['15','20','25'],1]);
v37Bank.angielski.push(['What does BLUE mean?',['Niebieski','Zielony','Czerwony'],0],['What does APPLE mean?',['Jabłko','Jajko','Zupa'],0],['What does SCHOOL mean?',['Sklep','Szkoła','Samochód'],1],['Which word means PIES?',['Cat','Dog','Bird'],1],['What does GOODBYE mean?',['Do widzenia','Dzień dobry','Dziękuję'],0],['Which word means CZERWONY?',['Yellow','Green','Red'],2]);
v37Bank.przyroda.push(['Co potrzebują rośliny do wzrostu?',['Światła i wody','Pilota','Guzików'],0],['Które zwierzę jest ptakiem?',['Kot','Wróbel','Pies'],1],['Co zmienia się w ciągu roku?',['Pory roku','Liczba palców','Liczba boków koła'],0],['Co leci z chmur podczas deszczu?',['Woda','Piasek','Kamyki'],0],['Gdzie mieszkają ryby?',['W wodzie','W piaskownicy','Na drzewie'],0],['Jaka pora roku jest po zimie?',['Lato','Wiosna','Jesień'],1]);

function v37Questions(subject){
 const ids=subject==='all'
  ?Object.keys(v37Bank):[subject];
 let questions=ids.flatMap(id=>
  (v37Bank[id]||[]).map(q=>({
   q:q[0],a:q[1],ok:q[2],
   lang:id==='angielski'?'en-US':'pl-PL',
   hero:id==='angielski'?'spider':
        id==='matematyka'?'iron':
        id==='przyroda'?'groot':'captain'
  }))
 );
 for(let i=questions.length-1;i>0;i--){
  const j=Math.floor(Math.random()*(i+1));
  [questions[i],questions[j]]=[questions[j],questions[i]];
 }
 const sources=subject==='all'?['all','polski','matematyka','angielski','przyroda']:[subject];for(const sub of sources){const saved=v75OutsideBank(who,sub);questions.push(...saved.map(t=>({q:t.q,a:t.a,ok:Number(t.ok),lang:sub==='angielski'?'en-US':'pl-PL',hero:'iron'})))}for(let i=questions.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[questions[i],questions[j]]=[questions[j],questions[i]]}return questions.slice(0,10);
}

function v37Voice(text,lang='pl-PL'){
 return `<button type="button" class="v37-voice"
 data-action="v37:say:${lang}:${encodeURIComponent(text)}"
 aria-label="Odczytaj na głos">🔊</button>`;
}


// V41_INTERACTIVE_AI_MISSIONS
function smOpen(initialBookId='',launch=null){
 tab='subjectmissions';
 avengersRun=null;
 render();
 const root=document.getElementById('subject-missions-root');
 if(!root)return;
 mountMissionGame(root,{
  books:books().filter(b=>!b.archived),pages:data.bookPages,
  child:who,transient:testMode,childGrade:profile().grade,initialBookId,launch,onBack:()=>{tab='learn';trainingStep='range';render()},
  ask:async (question,timeoutMs=0)=>{
   const controller=beginAIRequest('mission');const ms=Number(timeoutMs);
   const timer=Number.isFinite(ms)&&ms>0?setTimeout(()=>controller.abort(),ms):null;
   try{return await askMentorAI(question,profile().mentor||'tech',[],controller.signal)}
   finally{if(timer!==null)clearTimeout(timer);finishAIRequest('mission',controller)}
  },
  speak:(text,lang)=>speak(text,lang,profile().mentor,data.settings.rate||1),
  reward:async n=>{
   const key='v41:'+who+':'+new Date().toISOString().slice(0,10)+':'+(initialBookId||'all');
   const ok=await grant(who,n,'Misja specjalna z podrecznika',key);
   if(ok)note('🏆 +'+n+' monet za misje!');
  }
 });
}

function v37Hub(){
 const selected=v37Subjects.find(x=>x[0]===v37Subject)
   ||v37Subjects[0];
 return `<section class="v37-hub">
  <div class="v37-heading">
   <div class="v37-label">⚡ STREFA AVENGERSÓW</div>
   <h2>🚀 SALA WYZWAŃ</h2>
   <p>Wybierz portal i rozpocznij przygodę!</p>
   <img src="assets/art/${who==='patryk'?'spider':'iron'}.svg"
    alt="Bohater Avengersów" class="v37-hero">
  </div>
  <div class="v37-portals">
   ${v37Subjects.map(([id,icon,name,desc])=>`
    <button type="button"
     class="v37-portal v37-${id} ${v37Subject===id?'selected':''}"
     data-action="v37:subject:${id}"
     aria-pressed="${v37Subject===id}">
     <span class="v37-icon">${icon}</span>
     <b>${name}</b>
     <small>${desc}</small>
    </button>`).join('')}
  </div>
  <!-- V38_BOOK_PORTAL -->
  <div class="v38-books">
    <div class="v38-books-heading">
      <span class="v38-kicker">⭐ MISJA SPECJALNA</span>
      <h3>📚 TAJNA BIBLIOTEKA AVENGERSÓW</h3>
      <p>Twoje szkolne podręczniki zamieniają się w misje bohaterów!</p>
    </div>
    <div class="v38-book-grid">
      ${books().filter(b=>!b.archived).map((b,i)=>`
        <button class="v38-book-card" data-action="sm:book:${e(b.id)}">
          <span class="v38-book-icon">${['📘','📗','📙','📕'][i%4]}</span>
          <strong>${e(b.title)}</strong>
          <small>${e(b.subject)} · Otwórz misje</small>
          <span class="v38-book-go">⚡ ROZPOCZNIJ →</span>
        </button>`).join('') || `<div class="v38-empty">
          <span>📸</span>
          <strong>Twoja pierwsza misja czeka!</strong>
          <p>Poproś mamę o dodanie podręcznika i zdjęć stron.</p>
        </div>`}
    </div>
    <button class="v38-all-books" data-action="child:books">
      📖 ZOBACZ WSZYSTKIE PODRĘCZNIKI
    </button>
  </div>
  <button class="v37-classic" data-action="sm:open">⚡ ROZPOCZNIJ MISJĘ SPECJALNĄ Z PODRĘCZNIKA</button>
  <div class="v37-launch">
   <h3>${selected[1]} ${selected[2]}</h3>
   <p>10 wyzwań • Avengersi • punkty • głos</p>
   <button data-action="v37:play">⚡ START MISJI</button>
  </div>
  <button class="v37-classic" data-action="v37:classic">
   📚 Klasyczne treningi i ćwiczenia
  </button>
 </section>`;
}

let trainingStep='subject',trainingSelectedSubject='Polski',trainingMode='game',trainingSelectedPages=new Set();
function trainingBookItems(){return books().filter(b=>!b.archived&&(/wiedza og[oó]lna/i.test(trainingSelectedSubject)||String(b.subject||'').trim().toLocaleLowerCase('pl-PL')===trainingSelectedSubject.toLocaleLowerCase('pl-PL')))}
function trainingPageItems(){const ids=new Set(trainingBookItems().map(b=>b.id));return data.bookPages.filter(p=>ids.has(p.bookId)&&p.text?.trim()).sort((a,b)=>a.number-b.number)}
function trainingSubjectsList(){return [...new Set(['Polski','Matematyka','Angielski','Przyroda','Wiedza ogólna',...((profile().subjects)||[]),...books().map(b=>b.subject)].filter(Boolean))]}
function trainingVoice(text){return speakBtn(text)}
function trainingCard(title,action,subtitle=''){if(action.startsWith('training:source:')){const icon=action.endsWith(':books')?'📚':'🚀';return `<button type="button" class="tr71-choice" data-action="${action}"><span class="v76-source-icon" aria-hidden="true">${icon}</span><strong>${e(title.slice(title.indexOf(' ')+1))}</strong></button>`}if(action.startsWith('training:mode:')){const cut=title.indexOf(' '),icon=title.slice(0,cut),label=title.slice(cut+1);return `<button type="button" class="tr71-choice" data-action="${action}"><span class="v76-mode-icon" aria-hidden="true">${icon}</span><strong class="v76-mode-text">${e(label)}</strong>${subtitle?`<small>${e(subtitle)}</small>`:''}</button>`}return `<button type="button" class="tr71-choice" data-action="${action}"><strong>${e(title)}</strong>${subtitle?`<small>${e(subtitle)}</small>`:''}</button>`}
function trainingSubjectCard(subject){
 const name=String(subject||'');
 const key=/polsk/i.test(name)?'polski':/matemat/i.test(name)?'matematyka':/angiel|english/i.test(name)?'angielski':/przyrod/i.test(name)?'przyroda':/wiedz|ogoln|ogóln/i.test(name)?'wiedza':'inne';
 const illustrations={
  polski:`<svg viewBox="0 0 140 110" class="tr72-illustration" aria-hidden="true"><ellipse cx="69" cy="97" rx="55" ry="9" fill="#1e0c39" opacity=".28"/><path d="M15 27Q39 12 68 32V96Q38 81 15 92Z" fill="#fff6da" stroke="#ffca72" stroke-width="4"/><path d="M68 32Q97 12 125 27V92Q98 82 68 96Z" fill="#fce9ff" stroke="#ffca72" stroke-width="4"/><path d="M68 32V96" stroke="#d6978b" stroke-width="3"/><text x="29" y="63" font-size="27" font-weight="900" fill="#b83055">A</text><text x="80" y="62" font-size="25" font-weight="900" fill="#963fac">Ą</text><path d="M100 85l28-40 7 5-28 40-12 5Z" fill="#ffc542" stroke="#fff3b3" stroke-width="2"/><path d="M95 95l5-10 7 5Z" fill="#513459"/></svg>`,
  matematyka:`<svg viewBox="0 0 140 110" class="tr72-illustration" aria-hidden="true"><ellipse cx="70" cy="98" rx="48" ry="8" fill="#041c55" opacity=".3"/><rect x="41" y="8" width="68" height="89" rx="12" fill="#6350da" stroke="#d1d5ff" stroke-width="4"/><rect x="50" y="19" width="50" height="26" rx="5" fill="#dcfff4"/><text x="57" y="39" fill="#172d67" font-weight="900" font-size="18">2+3</text><g fill="#ffd85e"><rect x="50" y="54" width="13" height="12" rx="3"/><rect x="69" y="54" width="13" height="12" rx="3"/><rect x="88" y="54" width="13" height="12" rx="3"/><rect x="50" y="73" width="13" height="12" rx="3"/><rect x="69" y="73" width="13" height="12" rx="3"/><rect x="88" y="73" width="13" height="12" rx="3"/></g><text x="10" y="36" font-weight="900" font-size="28" fill="#bdf5ff">÷</text><text x="115" y="80" font-weight="900" font-size="29" fill="#ffe18a">×</text></svg>`,
  angielski:`<svg viewBox="0 0 140 110" class="tr72-illustration" aria-hidden="true"><path d="M7 18Q7 6 20 6H104Q117 6 117 18V61Q117 73 104 73H54L30 95V73H20Q7 73 7 61Z" fill="#e7fff8" stroke="#5affde" stroke-width="4"/><text x="21" y="42" font-size="24" font-weight="900" fill="#075f81">HELLO!</text><path d="M73 67Q73 55 86 55H125Q137 55 137 68V88Q137 98 124 98H111L99 107V98H86Q73 98 73 88Z" fill="#ffc957" stroke="#fff8b6" stroke-width="3"/><text x="84" y="82" font-size="19" font-weight="900" fill="#423261">Hi!</text></svg>`,
  przyroda:`<svg viewBox="0 0 140 110" class="tr72-illustration" aria-hidden="true"><circle cx="112" cy="19" r="14" fill="#ffdf64"/><path d="M10 96Q70 84 130 96L130 108H10Z" fill="#87eb87"/><path d="M64 45V98" stroke="#79523a" stroke-width="13" stroke-linecap="round"/><circle cx="63" cy="37" r="27" fill="#2aba67"/><circle cx="43" cy="52" r="22" fill="#3bdc78"/><circle cx="84" cy="53" r="23" fill="#43db82"/><path d="M93 23Q104 6 115 27Q104 38 93 23M92 24Q79 11 79 30Q89 39 92 24" fill="#ff9ace"/><path d="M92 23v24" stroke="#70407d" stroke-width="3"/><circle cx="20" cy="91" r="7" fill="#ffb5e0"/><circle cx="29" cy="87" r="6" fill="#fce1ff"/></svg>`,
  wiedza:`<svg viewBox="0 0 140 110" class="tr72-illustration" aria-hidden="true"><g class="tr72-globe"><circle cx="70" cy="54" r="42" fill="#4ec7ff" stroke="#dbfbff" stroke-width="4"/><path d="M37 31L51 23L65 29L62 43L51 52L46 67L33 59Z" fill="#56d887"/><path d="M73 20L95 28L101 44L91 50L86 72L74 79L65 64L74 48L68 36Z" fill="#67e29a"/><path d="M62 91L73 78L91 82L96 88L83 95Z" fill="#35b973"/><ellipse cx="70" cy="54" rx="17" ry="42" fill="none" stroke="#eefeff" stroke-opacity=".75" stroke-width="2"/><path d="M30 54H110M35 38H105M35 70H105" stroke="#eefeff" stroke-opacity=".7" stroke-width="2" fill="none"/></g><path d="M118 8l4 8 8 4-8 4-4 8-4-8-8-4 8-4Z" fill="#ffe88e"/></svg>`,
  inne:`<svg viewBox="0 0 140 110" class="tr72-illustration" aria-hidden="true"><rect x="25" y="20" width="90" height="72" rx="15" fill="#ad79fa" stroke="#f5d6ff" stroke-width="4"/><path d="M70 31l9 17 20 3-14 13 3 20-18-9-18 9 3-20-14-13 20-3Z" fill="#ffe485"/></svg>`
 };
 return `<button type="button" class="tr71-choice tr72-subject-card" data-theme="${key}" data-action="training:subject:${encodeURIComponent(name)}" aria-label="Wybierz przedmiot ${e(name)}"><span class="tr72-illustration-frame">${illustrations[key]}</span>${key==='wiedza'?'<div class="v76-knowledge-decor" aria-hidden="true"><i class="v76-pyramid"></i><span class="v76-letter">A</span><span class="v76-letter">7</span><span class="v76-letter">b</span><span class="v76-letter">3</span><span class="v76-leaf">🌿</span><span class="v76-mag">🔎</span><span class="v76-bulb">💡</span></div>':''}<strong>${e(name)}</strong></button>`;
}
function trainingTapSound(){
 if(localStorage.getItem('academy-v72-training-silent')==='1')return;
 if(window.speechSynthesis?.speaking||window.speechSynthesis?.pending)return;
 try{const C=window.AudioContext||window.webkitAudioContext;if(!C)return;
  const c=new C(),o=c.createOscillator(),g=c.createGain();
  o.type='sine';o.frequency.setValueAtTime(570,c.currentTime);o.frequency.exponentialRampToValueAtTime(790,c.currentTime+.085);
  g.gain.setValueAtTime(.0001,c.currentTime);g.gain.exponentialRampToValueAtTime(.035,c.currentTime+.014);g.gain.exponentialRampToValueAtTime(.0001,c.currentTime+.12);
  o.connect(g);g.connect(c.destination);o.start();o.stop(c.currentTime+.14);o.onended=()=>c.close().catch(()=>{});
 }catch(err){console.warn('Krótki dźwięk przycisku:',err)}
}
function trainingSoundControl(){const muted=localStorage.getItem('academy-v72-training-silent')==='1';return `<button type="button" class="tr72-sound-toggle" data-action="training:toggle-sound" aria-pressed="${!muted}">${muted?'🎵':'🎶'}</button>`}

function trainingFlowMarkup(){
 if(profile().grade==='P'&&trainingStep!=='outside-quiz')return v75PreschoolView();
 let content='<section class="tr71 v73-training"><header><small>⚡ AKADEMIA AVENGERSÓW</small><h2>Gotowy na supermisję?</h2></header>';
 if(trainingStep==='subject'){
  content+=`<h3>Wybierz supermoc ${trainingVoice('Wybierz przedmiot, którego chcesz się uczyć.')}</h3><div class="v73-knowledge">${trainingSubjectCard('Wiedza ogólna')}</div><div class="tr71-grid tr72-subject-grid">`+
   trainingSubjectsList().filter(s=>s!=='Wiedza ogólna').map(s=>trainingSubjectCard(s)).join('')+'</div>';
 }else if(trainingStep==='source'){
  content+=`${trainingCard('← Wróć do przedmiotów','training:back:subject')}<h3>2. Wybierz źródło zadań ${trainingVoice('Wybierz Bibliotekę bohatera albo Misje poza podręcznikiem.')}</h3><div class="tr71-grid">`+
   trainingCard('📚 Tajna biblioteka Avengersów','training:source:books')+
   trainingCard('⚡ Wyzwania poza książką','training:source:outside')+'</div>';
 }else if(trainingStep==='outside'){
  content+=`${trainingCard('← Wybór źródła','training:back:source')}<div class="v73-portal"><img src="assets/art/${who==='patryk'?'spider':'iron'}.svg" alt="Superbohater"><h3>⚡ Podejmij wyzwanie Avengersów!</h3><p>${e(trainingSelectedSubject)} · 10 wyzwań</p><button class="tr71-start" data-action="v37:play">🚀 START MISJI</button></div><div class="v73-side-games"><h3>🎮 Szybkie gry</h3>${trainingCard('🔗 Dopasuj pary','training:mini:match')}${trainingCard('⚡ Szybka misja','training:mini:quick')}</div>${trainingCard('📚 Klasyczne ćwiczenia','v37:classic')}`;
 }else if(trainingStep==='outside-quiz'){
  content+=`${trainingCard('← Wybierz wyzwanie','v37:hub')}<h3>⚡ Misja: ${e(trainingSelectedSubject)}</h3>`;
 }else if(trainingStep==='outside-mini'){
  content+=`${trainingCard('← Wyzwania Avengersów','training:back:outside')}<h3>🔗 Dopasuj i odkryj!</h3><div id="discovery-game"></div>`;
 }else if(trainingStep==='mode'){
  content+=`${trainingCard('← Wybór źródła','training:back:source')}<h3>3. Wybierz tryb ${trainingVoice('Wybierz trening albo sprawdzian.')}</h3><div class="tr71-grid">`+
   trainingCard('🎮 Sala treningowa','training:mode:game')+
   trainingCard('🏆 Próba superbohatera','training:mode:test')+(/angiel|english/i.test(trainingSelectedSubject)?trainingCard('🃏 Słówka','training:mode:vocab','Piszę · słucham · mówię'):'')+'</div>';
 }else if(trainingStep==='range'){
  content+=`${trainingCard('← Wybór trybu','training:back:mode')}<h3>4. Wybierz zakres ${trainingVoice('Wybierz cały materiał albo konkretne książki, działy i strony.')}</h3><div class="tr71-grid">`+
   trainingCard('🌍 Cały arsenał wiedzy','training:range:all')+
   trainingCard('📚 Wybieram misję','training:range:pick')+'</div>';
 }else if(trainingStep==='pick'){
  const bs=trainingBookItems(),ps=trainingPageItems();
  content+=`${trainingCard('← Wybór zakresu','training:back:range')}<h3>5. Zaznacz książki, działy lub strony ${trainingVoice('Możesz zaznaczyć wiele książek i stron. Naciśnij Rozpocznij misję.')}</h3>`+
   `<div class="tr71-tools">${trainingCard('☑ Zaznacz wszystko','training:all')}${trainingCard('Odznacz wszystko','training:none')}</div>`+
   (bs.map(b=>{
    const thisPages=ps.filter(p=>p.bookId===b.id), chapters=[...new Set(thisPages.map(p=>p.chapter||'Bez działu'))];
    const chosen=thisPages.length>0&&thisPages.every(p=>trainingSelectedPages.has(p.id));
    return `<div class="tr71-book"><div class="tr71-bookhead">${b.coverId?`<img data-image="${b.coverId}" alt="Okładka ${e(b.title)}">`:'<span class="tr71-cover">📘</span>'}<div><strong>${e(b.title)}</strong><small>${e(b.kind||'Podręcznik')} · ${thisPages.length} stron</small>${trainingVoice(b.title+'; '+(b.kind||'Podręcznik'))}</div></div><label class="tr71-check"><input type="checkbox" data-tr71-book="${e(b.id)}" ${chosen?'checked':''}> Cała książka</label>`+
    chapters.map(ch=>{const chapterPages=thisPages.filter(p=>(p.chapter||'Bez działu')===ch);
     const full=chapterPages.every(p=>trainingSelectedPages.has(p.id));
     return `<details class="tr71-chapter"><summary>📖 ${e(ch)} · ${chapterPages.length} stron</summary><label class="tr71-check"><input type="checkbox" data-tr71-chapter="${e(b.id)}" data-tr71-chapter-name="${e(ch)}" ${full?'checked':''}> Cały dział</label><div class="tr71-pages">`+chapterPages.map(p=>`<span class="tr71-page-item"><label class="tr71-check"><input type="checkbox" data-tr71-page="${e(p.id)}" ${trainingSelectedPages.has(p.id)?'checked':''}> Strona ${p.number}</label><button type="button" class="tr71-voice" data-action="training:readpage:${e(p.id)}" aria-label="Odczytaj stronę ${p.number}">🔊</button></span>`).join('')+'</div></details>';
    }).join('')+'</div>';
   }).join('')||'<p>Nie ma jeszcze stron z zapisanym tekstem w tym przedmiocie.</p>')+
   `<p id="tr71-count" class="tr71-count">Zaznaczono ${trainingSelectedPages.size} stron.</p>`;
 }else if(trainingStep==='ready'){
  content+=`${trainingCard('← Wybór zakresu','training:back:range')}<h3>🚀 Misja jest gotowa ${trainingVoice('Naciśnij Rozpocznij misję.')}</h3><p>Przedmiot: <strong>${e(trainingSelectedSubject)}</strong>. Tryb: <strong>${trainingMode==='test'?'Sprawdzian':'Trening'}</strong>.</p><p>Strony: ${trainingSelectedPages.size}. Jedna misja wykorzystuje niewielką porcję materiału. Kolejne misje przechodzą przez następne strony.</p>`;
 }
 if(trainingStep==='pick'||trainingStep==='ready')content+=`<button type="button" data-action="training:start" class="tr71-start">⚡ Rozpocznij misję</button>`;
 content+='</section>';
 return content;
}
function trainingSelectionUpdate(){const el=document.getElementById('tr71-count');if(el)el.textContent='Zaznaczono '+trainingSelectedPages.size+' stron.'}
function trainingSelectionChange(el){
 const list=trainingPageItems(),checked=el.checked;
 let matching=[];
 if(el.hasAttribute('data-tr71-page'))matching=list.filter(p=>p.id===el.dataset.tr71Page);
 else if(el.hasAttribute('data-tr71-book'))matching=list.filter(p=>p.bookId===el.dataset.tr71Book);
 else if(el.hasAttribute('data-tr71-chapter'))matching=list.filter(p=>p.bookId===el.dataset.tr71Chapter&&(p.chapter||'Bez działu')===el.dataset.tr71ChapterName);
 for(const p of matching){if(checked)trainingSelectedPages.add(p.id);else trainingSelectedPages.delete(p.id)}
 // Synchronizuj widoczne checkboxy w drzewie bez przeładowywania strony.
 document.querySelectorAll('[data-tr71-page]').forEach(x=>{x.checked=trainingSelectedPages.has(x.dataset.tr71Page)});
 document.querySelectorAll('[data-tr71-book]').forEach(x=>{const related=list.filter(p=>p.bookId===x.dataset.tr71Book);x.checked=related.length>0&&related.every(p=>trainingSelectedPages.has(p.id))});
 document.querySelectorAll('[data-tr71-chapter]').forEach(x=>{const related=list.filter(p=>p.bookId===x.dataset.tr71Chapter&&(p.chapter||'Bez działu')===x.dataset.tr71ChapterName);x.checked=related.length>0&&related.every(p=>trainingSelectedPages.has(p.id))});
 trainingSelectionUpdate();
}

function childRender(){const p=profile();let html=`<section class="card"><div class="row between"><div><h2>${p.name} ${hero(p.hero||(who==='pawel'?'iron':'spider'))[2]}</h2><small>${gradeName(p.grade)} · Baza poziom ${1+Math.floor(p.xp/100)}</small></div><b class="xp">🪙 ${p.coins} złotych</b></div><div class="progress"><div style="width:${p.xp%100}%"></div></div></section>`+nav();
if(tab==='song'){const mission=data.missions.find(m=>m.id===missionId);const song=data.settings.songs.find(x=>x.id===mission?.songId);html+=song?songScreen(song,mission):'<section class="card">Nie znaleziono piosenki.</section>'}
if(tab==='home')html+=`<section class="card"><h2>🎯 Twoje misje ${speakBtn('Twoje misje')}</h2>${missionBoard(who)}</section><section class="card"><h3>Ostatnie osiągnięcia</h3>${data.history.filter(h=>h.child===who).slice(0,5).map(h=>`<p>+${h.points} złotych · ${e(h.reason)}</p>`).join('')||'Jeszcze brak.'}</section>`;
if(tab==='books')html+=`<section class="card"><h2>📚 Moje podręczniki ${speakBtn('Moje podręczniki')}</h2>${books().filter(b=>!b.archived).map(b=>`<div class="item"><div><b>${e(b.title)}</b><small>${e(b.subject)} · ${gradeName(b.grade)}</small></div>${button('Otwórz','reader:'+b.id)}</div>`).join('')||'Mama jeszcze nie dodała książek.'}</section>`;
if(tab==='subjectmissions')html+='<section id="subject-missions-root"></section>';
if(tab==='reader'){let b=data.books.find(b=>b.id===bookId),ps=data.bookPages.filter(p=>p.bookId===bookId).sort((a,b)=>a.number-b.number);let pg=data.bookPages.find(p=>p.id===pageId)||ps[0];html+=`<section class="card">${button('← Książki','child:books')}<h2>${e(b?.title||'Podręcznik')}</h2>${select('readerpage','Strona',ps.map(p=>[p.id,'Strona '+p.number]),pg?.id)}${pg?`<img class="pagephoto" data-image="${pg.imageId}" alt="Strona podręcznika"><p class="guide">${e(pg.text||'Tekst nie jest jeszcze rozpoznany. Możesz oglądać zdjęcie strony.')}</p>${speakBtn(pg.text||'Brak zapisanego tekstu')}<label for="ocrlang">Język strony</label><select id="ocrlang"><option value="pol">Polski</option><option value="eng">Angielski</option></select><p id="ocrstatus" class="guide" role="status" hidden></p>${button('✨ Odczytaj przez AI','reader:ai','gold')}<p class="muted">Rozpoznawanie wymaga internetu. Sprawdź poprawność tekstu przed odczytem.</p>`:'Brak stron.'}${input('tasks','Numery zadań, np. 1, 2, 3, 5')}${button('Dodaj do moich misji','homework:create','gold')}${button('🤖 Zapytaj mentora','child:mentor')}</section>`}
if(tab==='submission'){let m=data.missions.find(m=>m.id===missionId);html+=`<section class="card">${button('← Misje','child:home')}<h2>${e(m?.title)}</h2><p>Prześlij zdjęcie pracy. Mama sprawdzi ją przed przyznaniem punktów.</p><label>Galeria</label><input type="file" accept="image/*" id="workfile"><label>Aparat</label><input type="file" accept="image/*" capture="environment" id="workcamera"><label>Wiadomość do mamy</label><textarea id="workcomment"></textarea>${button('📤 Zgłoś wykonanie','mission:send','gold')}</section>`}
if(tab==='learn'&&v37Classic)html+=`<section class="card"><h2>🎓 Akademia wiedzy ${speakBtn('Trening bohatera')}</h2><div class="learning-banner"><span>📚</span><div><strong>Ucz się jak superbohater!</strong><small>Obrazki • słuchanie • quizy • sprawdziany</small></div><span>⭐</span></div><p>Ucz się także bez pracy domowej. Za poprawne zadania zdobywasz złote. Dzienny limit nagród chroni przed powtarzaniem najłatwiejszych ćwiczeń.</p>${speakBtn('Wybierz rodzaj treningu. Możesz ćwiczyć matematykę, czytanie, angielski, quizy, dyktanda i krzyżówki.')} ${select('trainingSubject','Wybierz przedmiot',trainingSubjects(), 'polski')}<div id="trainingKinds">${trainingKindSelect('polski')}</div><div class="learning-exercise" id="exercise"></div>${button('🔄 Nowe ćwiczenie','exercise:new')}</section><section class="card"><h3>🎵 Muzyczne nagrody</h3><p class="muted">Lista zaakceptowana przez mamę. Linki otwierają YouTube — rodzic powinien nadzorować korzystanie.</p>${data.settings.songs.map(s=>`<p><a href="${e(s.url)}" target="_blank" rel="noopener noreferrer">🎶 ${e(s.title)}</a></p>`).join('')}</section>`;
if(tab==='academy'){const subjects=[['polish','📖','Język polski','Gramatyka i ortografia'],['math','🧮','Matematyka','Liczby, działania i figury'],['english','🇬🇧','Język angielski','Słówka i podstawowe zwroty']];const belongs=(l,i)=>l.subject==='english'?'english':i<5?'polish':'math';const chosen=subjects.find(x=>x[0]===academySubject);html+=`<section class="card discovery-head"><h2>🚀 Sala Odkrywców</h2>${chosen?`${button('← Wybierz przedmiot','academy:subjects')}<h3>${chosen[1]} ${chosen[2]}</h3><p>${chosen[3]}. Wybierz zagadnienie, poznaj zasadę i rozwiąż miniwyzwanie.</p><div class="discovery-grid">${LESSONS.map((l,i)=>belongs(l,i)===academySubject?`<button class="discovery-tile" data-action="lesson:open:${i}"><span>${l.icon}</span><b>${l.title}</b><small>${l.subtitle}</small></button>`:'').join('')}</div>`:`<p>Wybierz przedmiot, a potem zagadnienie, którego chcesz się nauczyć.</p><div class="discovery-grid">${subjects.map(([id,icon,title,subtitle])=>`<button class="discovery-tile" data-action="academy:subject:${id}"><span>${icon}</span><b>${title}</b><small>${subtitle}</small></button>`).join('')}</div>`}</section>`;}
if(tab==='lesson'){const l=LESSONS[lessonIndex]||LESSONS[0];html+=`<section class="card lesson-card">${button('← Zagadnienia','child:academy')}<div class="lesson-art">${l.icon}</div><h2>${l.title}</h2><p class="lesson-story">${e(l.story)}</p><div class="lesson-rule"><strong>Zapamiętaj!</strong><p>${e(l.rule)}</p></div><p><strong>Przykłady:</strong> ${e(l.examples)}</p>${speakBtn(l.story+' '+l.rule+' Przykłady: '+l.examples)}<h3>🎯 Miniwyzwanie</h3><p>${e(l.question)} ${speakBtn(l.question)}</p><div class="discovery-grid">${l.answers.map((x,i)=>button(e(x),'lesson:answer:'+i)).join('')}</div><p id="lesson-feedback" role="status"></p><div class="discovery-playground"><h3>🎮 Zagraj i utrwal wiedzę!</h3><p>Wybierz grę. Każda runda ma inne pytania i kolorowe odpowiedzi.</p><div class="discovery-actions">${button('🔗 Dopasuj pary','discovery:start:match','gold')}${button('⚡ Szybka misja','discovery:start:quick','gold')}</div><div id="discovery-game"></div></div>${button('🔄 Inny temat','child:academy')}</section>`}
if(tab==='mentor')html+=`<section class="card mentor-room"><div class="mentor-header"><span class="mentor-tag">⚡ STREFA MENTORA</span><h2>Spotkaj swojego supermentora!</h2><p>Wybierz bohatera i zobacz jego supermoc.</p></div><div class="mentor-choices"><button type="button" class="mentor-choice ${p.mentor==='tech'?'selected':''}" data-action="mentor:choose:tech">🦾 Iron Man</button><button type="button" class="mentor-choice ${p.mentor==='fun'?'selected':''}" data-action="mentor:choose:fun">🕸️ Spider-Man</button></div><div class="mentor-stage ${p.mentor==='fun'?'stage-spider':'stage-iron'}" id="mentor-stage" aria-label="Animacja wybranego mentora"><div class="mentor-stars">✦ ✧ ✦</div><div class="mentor-flight-lines"></div><div class="mentor-web" aria-hidden="true"><svg viewBox="0 0 500 280" preserveAspectRatio="none"><path d="M230 170 L480 18 M230 170 L498 85 M230 170 L498 160 M230 170 L488 248 M230 170 L370 0 M230 170 L310 0 M230 170 L490 280 M230 170 L360 280" stroke="white" stroke-width="3" fill="none"/><path d="M332 108 Q370 123 390 80 M355 134 Q415 158 442 110 M350 170 Q420 190 470 175 M345 203 Q400 210 442 234 M285 140 Q315 160 330 95" stroke="white" stroke-width="2" fill="none"/></svg></div><img class="mentor-figure" src="assets/art/${p.mentor==='fun'?'spider':'iron'}.svg" alt="${p.mentor==='fun'?'Spider-Man':'Iron Man'}"><div class="mentor-floor"></div><div class="mentor-power-caption">${p.mentor==='fun'?'🕸️ Uwaga, leci sieć!':'🚀 Start silników! Iron Man leci!'}</div></div><div class="mentor-talk"><h3>${p.mentor==='fun'?'🕷️ Spider-Man mówi:':'🦾 Iron Man mówi:'}</h3><p>${p.mentor==='fun'?'Hej! Masz pytanie? Dawaj, zanim znowu zaplączę się w sieć!':'System gotowy. Zadaj pytanie, młody wynalazco.'}</p></div><p class="muted">Mentor korzysta z AI Gemini. Możesz pytać o naukę i superbohaterów.</p><label for="question">Twoje pytanie</label><input id="question" placeholder="Np. Co to rzeczownik? Jak mnożyć?"><div class="row">${button('💡 Wyjaśnij','mentor:answer','gold')}${button('🎙️ Zapytaj głosem','mic')}</div><p id="mentoranswer" class="guide">Zapytaj o rzeczowniki, czasowniki, sylaby, dodawanie, odejmowanie lub mnożenie.</p>${button('🔊 Odczytaj wyjaśnienie','mentor:speak')}</section>`;
if(tab==='base'){html+=`<section class="card"><h3>🦸 Wybierz swojego bohatera</h3><p>Możesz zmienić bohatera w każdej chwili.</p>${heroPicker(who)}</section>`+baseMarkup(p,button)+`<section class="card"><h2>🎮 Salon gier Avengersów</h2><p>Gry są dostępne także bez wydawania złotych.</p>${button('🧩 Prawdziwa krzyżówka','game:crossword','gold')}${button('🏆 Quiz superbohatera','game:quiz')}${button('🧠 Zagadki logiczne','game:logic')}<div class="arcade-shop"><h3>🕹️ Sektor gier</h3><p>Odblokuj grę raz za złote zdobyte w misjach. Po zakupie możesz grać bez limitu.</p>${ARCADE_GAMES.map(g=>`<div class="arcade-offer"><div><b>${g.icon} ${g.title}</b><small>${g.desc}</small></div>${(p.arcadeUnlocked||[]).includes(g.id)?button('▶ Graj','arcade:open:'+g.id,'gold'):button('🔓 '+g.cost+' złotych','arcade:buy:'+g.id,p.coins>=g.cost?'gold':'alt')}</div>`).join('')}</div></section>`}
if(tab==='crossword'){html+=crosswordView()}
if(tab==='arcade'){html+=`<section class="card">${button('← Baza Avengersów','child:base')}<h2>🕹️ ${e(ARCADE_GAMES.find(x=>x.id===arcadeId)?.title||'Gra')}</h2><div id="arcade-root"></div><p class="muted">Graj dla zabawy — bez automatycznego zarabiania złotych.</p></section>`}
if(tab==='learn'){
  if(v37Classic){
   html+=`<div class="v37-return">
    <button data-action="v37:hub">← Sala Wyzwań</button>
   </div>`;
  }else{
   html+=trainingFlowMarkup();
  }
  if(avengersRun)html+=avengersPanel();
 }layout('Akademia '+p.name,html);if(tab==='arcade')mountArcade(arcadeId,$('arcade-root'));if(tab==='learn'&&v37Classic)newExercise();if(tab==='trace')drawTrace()}
const CROSSWORDS=[
 {word:'KOT',clue:'Miauczy i mruczy',r:0,c:2,dir:'v'},
 {word:'DOM',clue:'Mieszkamy w nim',r:1,c:1,dir:'h'},
 {word:'LAS',clue:'Rosną w nim drzewa',r:3,c:2,dir:'h'},
 {word:'SOK',clue:'Napój z owoców',r:3,c:4,dir:'v'},
 {word:'OKO',clue:'Narząd wzroku',r:5,c:3,dir:'h'}
];
// Each entry has a fixed coordinate; all intersections are validated against one another.
const CROSS_LAYOUT=[
 {word:'KOT',clue:'Zwierzę, które miauczy',r:0,c:2,dir:'v'},
 {word:'DOM',clue:'Budynek, w którym mieszkasz',r:1,c:1,dir:'h'},
 {word:'LAS',clue:'Miejsce pełne drzew',r:3,c:1,dir:'h'},
 {word:'SOK',clue:'Napój wyciskany z owoców',r:3,c:3,dir:'v'},
 {word:'OKO',clue:'Widzisz nim świat',r:5,c:2,dir:'h'}
];
// Generated crossings: words share letters only where their coordinates overlap.
const CROSS_GAME=[
 {word:'KOT',clue:'Zwierzę, które miauczy',r:0,c:2,dir:'v'},
 {word:'DOM',clue:'Budynek, w którym mieszkasz',r:1,c:1,dir:'h'},
 {word:'LAS',clue:'Miejsce pełne drzew',r:3,c:0,dir:'h'},
 {word:'SOK',clue:'Owocowy napój',r:3,c:2,dir:'v'},
 {word:'OKO',clue:'Narząd wzroku',r:5,c:2,dir:'h'}
];
// Use a verified compact crossword with one shared central vertical word.
const PUZZLE=[
 {word:'KOT',clue:'Zwierzę, które miauczy',r:0,c:2,dir:'v'},
 {word:'DOM',clue:'Budynek mieszkalny',r:1,c:1,dir:'h'},
 {word:'TAMA',clue:'Budowla zatrzymująca wodę',r:2,c:2,dir:'h'}
];
// Intersections: KOT[1]=O = DOM[1], KOT[2]=T = TAMA[0].
function crosswordView(){const cells=new Map();for(const [i,w] of PUZZLE.entries()){for(let j=0;j<w.word.length;j++){const r=w.r+(w.dir==='v'?j:0),c=w.c+(w.dir==='h'?j:0),k=r+','+c,letter=w.word[j];if(cells.has(k)&&cells.get(k)!==letter)throw Error('Niezgodna krzyżówka');cells.set(k,letter)}}let grid='<div class="cross-grid">';for(let r=0;r<3;r++)for(let c=0;c<6;c++){const k=r+','+c;grid+=cells.has(k)?`<input class="cross-cell" data-cross="${k}" maxlength="1" inputmode="text" autocomplete="off" aria-label="Pole wiersz ${r+1} kolumna ${c+1}">`:'<div class="cross-empty"></div>'}grid+='</div>';return `<section class="card">${button('← Wróć do bazy','child:base')}<h2>🧩 Krzyżówka Avengersów</h2><p>Wpisuj po jednej literze w kratki. Hasła przecinają się i mają wspólne litery.</p>${grid}<h3>Hasła</h3>${PUZZLE.map((w,i)=>`<p><b>${i+1}. ${w.dir==='h'?'Poziomo':'Pionowo'}:</b> ${e(w.clue)} (${w.word.length} litery) ${speakBtn(w.clue)}</p>`).join('')}${button('Sprawdź całą krzyżówkę','crossword:check','gold')}<p id="cross-feedback" role="status"></p></section>`}
async function checkCrossword(){let ok=true,filled=true;const expected=new Map();for(const w of PUZZLE)for(let j=0;j<w.word.length;j++)expected.set((w.r+(w.dir==='v'?j:0))+','+(w.c+(w.dir==='h'?j:0)),w.word[j]);for(const [key,letter] of expected){const cell=document.querySelector(`[data-cross="${key}"]`);const val=(cell?.value||'').trim().toLocaleUpperCase('pl-PL');if(!val)filled=false;if(val!==letter)ok=false;cell?.classList.toggle('cross-wrong',!!val&&val!==letter)}const fb=$('cross-feedback');if(!filled){fb.textContent='Uzupełnij wszystkie kratki!';return}if(!ok){fb.textContent=mentorLine(profile(),false);speak(fb.textContent,'pl-PL',profile().mentor);return}fb.textContent=mentorLine(profile(),true);const key='crossword:'+who+':'+date();if(await grant(who,5,'Ułożona krzyżówka',key))fb.textContent+=' +5 złotych';else fb.textContent+=' Dziś punkty za tę krzyżówkę zostały już przyznane.';speak(fb.textContent,'pl-PL',profile().mentor)}
const TRAINING_GROUPS={
 polski:[['bookread','🎙️ Czytam z podręcznika'],['bookquiz','🧩 Zadania z podręcznika'],['read','📖 Czytanie ze zrozumieniem'],['syllable','🔠 Sylaby i wyrazy'],['dictation','✍️ Dyktando']],
 matematyka:[['bookquiz','📚 Zadania z podręcznika'],['math','➕ Działania matematyczne']],
 angielski:[['bookread','🎙️ Czytam z podręcznika'],['bookquiz','🧩 Zadania z podręcznika'],['english','🇬🇧 Słówka i wymowa']],
 wiedza:[['quiz','🏆 Quiz wiedzy'],['logic','🧠 Zagadki logiczne']],
 przedszkole:[['letter','🔤 Rozpoznaj literę'],['lettercase','🔠 Duża i mała litera'],['firstsound','🗣️ Pierwsza litera słowa'],['numbermatch','🔢 Wybierz cyfrę'],['shapes','🔷 Rozpoznaj kształt'],['count','⭐ Liczenie'],['trace','✍️ Pisanie palcem'],['color','🎨 Kolory i kształty'],['quiz','🎉 Quiz obrazkowy']]
};
function trainingSubjects(){return [['polski','📖 Język polski'],['matematyka','🧮 Matematyka'],['angielski','🇬🇧 Język angielski'],['wiedza','🧠 Wiedza i logika'],...(who==='patryk'?[['przedszkole','🌈 Zabawy przedszkolne']]:[])];}
function trainingKindSelect(subject){return select('kind','Wybierz ćwiczenie',TRAINING_GROUPS[subject]||TRAINING_GROUPS.polski,null)}
function trainingChooseSubject(subject){const target=$('trainingKinds');if(!target)return;target.innerHTML=trainingKindSelect(subject);newExercise()}
function trainingChooseKind(kind){const subject=Object.keys(TRAINING_GROUPS).find(k=>TRAINING_GROUPS[k].some(([id])=>id===kind))||'wiedza';const sel=$('trainingSubject');if(sel)sel.value=subject;trainingChooseSubject(subject);if($('kind'))$('kind').value=kind;newExercise()}

function bookTrainingPages(){
 const subject=$('trainingSubject')?.value||'polski';
 return data.bookPages.flatMap(pg=>{
  const b=data.books.find(x=>x.id===pg.bookId);
  if(!b||b.child!==who||b.archived||!pg.text?.trim())return [];
  const name=(b.subject||'').toLocaleLowerCase('pl-PL');
  if(subject==='angielski'&&!/ang|english/.test(name))return [];
  if(subject==='matematyka'&&!/mat/.test(name))return [];
  if(subject==='polski'&&!/pol/.test(name))return [];
  return [{pg,b}];
 });
}
function bookSentence(text){
 const cleaned=String(text||'').replace(/\s+/g,' ').trim();
 const sentences=cleaned.match(/[^.!?]+[.!?]+|[^.!?]+$/g)||[];
 return sentences.map(x=>x.trim()).filter(x=>x.length>=15&&x.length<=230&&x.split(/\s+/).length>=3);
}
function normWords(t){return String(t||'').toLocaleLowerCase('pl-PL').replace(/[^\p{L}\p{N}\s]/gu,' ').split(/\s+/).filter(Boolean)}
function compareReading(expected,heard){
 const a=normWords(expected),b=normWords(heard);
 let prev=Array.from({length:b.length+1},(_,i)=>i);
 for(let i=1;i<=a.length;i++){let curr=[i];for(let j=1;j<=b.length;j++)curr[j]=Math.min(curr[j-1]+1,prev[j]+1,prev[j-1]+(a[i-1]===b[j-1]?0:1));prev=curr}
 return {percent:Math.round(100*(1-prev[b.length]/Math.max(a.length,b.length,1))),expected:a.length,heard:b.length};
}
function bookExercise(){
 const box=$('exercise'),available=bookTrainingPages(),selected=$('booktrainingpage')?.value;
 const page=available.find(x=>x.pg.id===selected)||available[0];
 const kind=$('kind')?.value||'bookread';
 const pick=available.map(({pg,b})=>`<option value="${e(pg.id)}" ${pg.id===page?.pg.id?'selected':''}>${e(b.title)} · strona ${pg.number}</option>`).join('');
 const selector=`<div class="book-training-top"><span>📚 MISJA Z TWOJEJ KSIĄŻKI</span><span>✨ Uczymy się z podręcznika</span></div><label for="booktrainingpage">Wybierz książkę i stronę</label><select id="booktrainingpage">${pick}</select>`;
 if(!page){box.innerHTML=`<div class="book-training">${selector}<h3>📷 Dodaj najpierw stronę podręcznika</h3><p>Mama musi dodać zdjęcie, rozpoznać tekst i sprawdzić błędy OCR. Dopiero wtedy powstaną ćwiczenia z tej strony.</p></div>`;return}
 const sentences=bookSentence(page.pg.text);
 if(!sentences.length){box.innerHTML=`<div class="book-training">${selector}<p>Na tej stronie nie ma wystarczająco czytelnych zdań. Popraw tekst w Panelu mamy → Książki.</p></div>`;return}
 const sentence=sentences[Math.floor(Math.random()*sentences.length)];
 const lang=($('trainingSubject')?.value==='angielski')?'en-US':'pl-PL';
 if(kind==='bookread'){
  practice={kind,answer:sentence,question:sentence};
  box.innerHTML=`<div class="book-training">${selector}<div class="book-reading-card"><div class="book-illustration">📖 <span>⭐</span> 🎙️</div><span class="book-label">MISJA: PRZECZYTAJ NA GŁOS</span><p class="book-sentence">${e(sentence)}</p><div class="row">${speakBtn(sentence,lang)} ${button('🎙️ Czytam!','book:listen','gold')}</div><p class="book-instruction">Naciśnij mikrofon i przeczytaj zdanie. Porównamy rozpoznane słowa z tekstem książki.</p><p id="readingfeedback" role="status" class="book-result">Gotowy? Mikrofon czeka!</p><p class="muted">To orientacyjne porównanie tekstu rozpoznanego przez telefon, a nie wiarygodna ocena wymowy. W razie pomyłki mikrofonu spróbuj ponownie.</p></div></div>`;
 }else{
  const words=normWords(sentence).filter(x=>x.length>=4);
  const chosen=words[Math.floor(Math.random()*words.length)];
  const parts=sentence.split(new RegExp('('+chosen+')','i'));
  const masked=parts.map(x=>x.toLocaleLowerCase('pl-PL')===chosen?'_____':x).join('');
  const others=[...new Set(normWords(page.pg.text).filter(x=>x.length>=4&&x!==chosen))].sort(()=>Math.random()-.5).slice(0,3);
  const choices=[chosen,...others].sort(()=>Math.random()-.5);
  practice={kind,answer:chosen,question:masked};
  box.innerHTML=`<div class="book-training">${selector}<div class="book-reading-card"><div class="book-illustration">🧩 <span>✨</span> 📚</div><span class="book-label">MISJA: ODKRYJ BRAKUJĄCE SŁOWO</span><p class="book-sentence">${e(masked)}</p><p>Wybierz słowo, które naprawdę występuje w Twojej książce.</p><div class="book-choices">${choices.map((c,i)=>`<button data-choice="${e(c)}" data-action="exercise:check:${i}">${e(c)}</button>`).join('')}</div><p id="feedback" class="book-result" role="status"></p></div></div>`;
 }
 box.querySelectorAll('[data-speak]').forEach(b=>b.addEventListener('click',ev=>{ev.stopPropagation();speak(b.dataset.speak,b.dataset.lang,profile().mentor,data.settings.rate||1)}));
}
function practiceEnglishSpeech(){
 const word=practice?.word;
 const feedback=$('english-pronunciation-feedback');
 if(!word||!feedback)return;
 const Recognition=window.SpeechRecognition||window.webkitSpeechRecognition;
 if(!Recognition){feedback.textContent='Rozpoznawanie mowy nie jest dostępne w tej przeglądarce. Otwórz Akademię w Chrome.';return}
 try{
  const r=new Recognition();r.lang='en-US';r.interimResults=false;r.maxAlternatives=5;
  feedback.textContent='🎙️ Słucham! Powiedz po angielsku: '+word;
  r.onresult=ev=>{
   const alternatives=Array.from(ev.results[0]).map(x=>x.transcript.trim());
   const normalize=x=>x.toLowerCase().replace(/[^a-z\s-]/g,'').trim();
   const match=alternatives.some(x=>normalize(x)===normalize(word));
   const heard=alternatives[0]||'';
   feedback.textContent=match?'🌟 Telefon rozpoznał słowo „'+word+'”. Posłuchaj wzoru i powtórz dla utrwalenia.':'🎯 Telefon usłyszał „'+heard+'”. Odsłuchaj wzór i spróbuj ponownie. To może być też błąd rozpoznawania.';
  };
  r.onerror=ev=>{feedback.textContent='Nie udało się rozpoznać mowy ('+ev.error+'). Sprawdź dostęp do mikrofonu i spróbuj ponownie.'};
  r.onnomatch=()=>{feedback.textContent='Nie rozpoznano słowa. Spróbuj ponownie.'};
  r.start();
 }catch(err){feedback.textContent='Nie można uruchomić mikrofonu: '+err.message}
}
function checkBookReading(){
 const fb=$('readingfeedback');if(!fb||!practice||practice.kind!=='bookread')return;
 const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
 if(!SR){fb.textContent='Ta przeglądarka nie obsługuje rozpoznawania mowy. Spróbuj w Chrome na Androidzie.';return}
 fb.textContent='🎙️ Słucham… przeczytaj zdanie.';
 try{
  const rec=new SR();rec.lang=$('trainingSubject')?.value==='angielski'?'en-US':'pl-PL';rec.interimResults=false;
  rec.onresult=ev=>{
   const heard=ev.results[0][0].transcript,score=compareReading(practice.answer,heard);
   fb.innerHTML=`<b>Usłyszałam:</b> ${e(heard)}<p><b>Zgodność rozpoznanych słów: ${score.percent}%</b></p><p>${score.percent>=85?'🌟 Świetnie!':score.percent>=55?'💪 Dobra próba! Spróbuj jeszcze raz.':'🎯 Posłuchaj wzoru i spróbuj ponownie.'}</p>`;
  };
  rec.onerror=ev=>{fb.textContent='Nie udało się rozpoznać mowy ('+ev.error+'). Spróbuj ponownie.'};
  rec.onnomatch=()=>{fb.textContent='Nie rozpoznano zdania. Spróbuj jeszcze raz.'};
  rec.start();
 }catch(err){fb.textContent='Mikrofon: '+err.message}
}

async function newExercise(){const box=$('exercise');if(!box)return;const kind=$('kind').value;practiceAnswered=false;if(kind==='bookread'||kind==='bookquiz'){bookExercise();return;}let question='',answer='',choices=[],lang='pl-PL';if(kind==='letter'){const alphabet='ABCDEFGHIKLMNOPRSTUWYZ'.split('');const target=alphabet[Math.floor(Math.random()*alphabet.length)];question=`Znajdź literę ${target}. Dotknij właściwej litery!`;answer=target;choices=[target,...alphabet.filter(x=>x!==target).sort(()=>Math.random()-.5).slice(0,3)]}
else if(kind==='lettercase'){const alphabet='ABCDEFGHIKLMNOPRSTUWYZ'.split('');const target=alphabet[Math.floor(Math.random()*alphabet.length)];question=`Która mała literka pasuje do dużej ${target}?`;answer=target.toLowerCase();choices=[answer,...alphabet.filter(x=>x!==target).sort(()=>Math.random()-.5).slice(0,3).map(x=>x.toLowerCase())]}
else if(kind==='firstsound'){const words=[['🍎','arbuz','A'],['🐈','kot','K'],['🏠','dom','D'],['🐟','ryba','R'],['🦋','motyl','M'],['🐕','pies','P'],['☀️','słońce','S'],['🦁','lew','L'],['🌳','drzewo','D'],['🥛','mleko','M']];const w=words[Math.floor(Math.random()*words.length)];question=`${w[0]} ${w[1].toUpperCase()} — jaką literą zaczyna się to słowo?`;answer=w[2];choices=[answer,...'ABCDEFGHIKLMNOPRSTUWYZ'.split('').filter(x=>x!==answer).sort(()=>Math.random()-.5).slice(0,3)]}
else if(kind==='numbermatch'){const n=Math.floor(Math.random()*10);question=`Znajdź cyfrę ${n}. Która z nich to ${n}?`;answer=String(n);choices=[answer,...Array.from({length:10},(_,i)=>String(i)).filter(x=>x!==answer).sort(()=>Math.random()-.5).slice(0,3)]}
else if(kind==='shapes'){const shapes=[['●','koło'],['■','kwadrat'],['▲','trójkąt'],['◆','romb'],['★','gwiazda']];const sh=shapes[Math.floor(Math.random()*shapes.length)];question=`Który kształt to ${sh[1]}?`;answer=sh[0];choices=shapes.map(x=>x[0]).filter(x=>x!==answer).sort(()=>Math.random()-.5).slice(0,3).concat(answer)}
else if(kind==='math'){let max=profile().grade==='1'?10:profile().grade==='2'?30:100,a=1+Math.floor(Math.random()*max),b=1+Math.floor(Math.random()*Math.min(a,30)),plus=Math.random()>.5;question=`Ile to ${a} ${plus?'+':'−'} ${b}?`;answer=String(plus?a+b:a-b);choices=[answer,String(Number(answer)+2),String(Math.max(0,Number(answer)-1))]}else if(kind==='read'){const r=readings[Math.floor(Math.random()*readings.length)];question=r.text+'\n'+r.question;answer=r.answer;choices=r.options}else if(kind==='english'){const r=vocabulary[Math.floor(Math.random()*vocabulary.length)];question=`Co znaczy słowo „${r[0]}”?`;answer=r[1];choices=[r[1],...vocabulary.filter(v=>v[1]!==r[1]).slice(0,2).map(v=>v[1])];practice={kind,answer,question,word:r[0]};}else if(kind==='count'){let n=2+Math.floor(Math.random()*7);question='Policz gwiazdki: '+ '⭐'.repeat(n);answer=String(n);choices=[answer,String(n+1),String(n-1)]}else if(kind==='color'){const colors=[['🔴','czerwony'],['🟢','zielony'],['🔵','niebieski'],['🟡','żółty']];let r=colors[Math.floor(Math.random()*colors.length)];question=`Jaki to kolor? ${r[0]}`;answer=r[1];choices=colors.filter(c=>c[1]!==r[1]).slice(0,2).map(c=>c[1]).concat(answer)}else if(kind==='syllable'){const items=[['ma-ma','2'],['ka-na-pa','3'],['ko-tek','2'],['sa-mo-lot','3']];let r=items[Math.floor(Math.random()*items.length)];question=`Ile sylab ma słowo ${r[0]}?`;answer=r[1];choices=['1','2','3']}else if(kind==='dictation'){const words=['szkoła','krzesło','żaba','rzeka','chmura','przyjaciel','książka','ogród','pszczoła','wróbel'];answer=words[Math.floor(Math.random()*words.length)];question='Posłuchaj słowa, a potem zapisz je poprawnie.';practice={kind,answer,question};box.innerHTML=`<h3>✍️ Dyktando: posłuchaj i zapisz ${speakBtn('Napisz słowo, które za chwilę usłyszysz.')}</h3><div class="row">${button('🔊 Odsłuchaj słowo','dictation:play','gold')}</div><input id="dictationanswer" autocomplete="off" spellcheck="false" placeholder="Wpisz usłyszane słowo"><p>${button('Sprawdź pisownię','dictation:check','gold')}</p><p id="feedback" role="status"></p>`;box.querySelectorAll('[data-speak]').forEach(b=>b.addEventListener('click',()=>speak(b.dataset.speak)));return}
else if(kind==='quiz'){const qs=who==='pawel'?[['Ile dni ma tydzień?','7',['5','6','7','8']],['Która planeta jest naszą planetą?','Ziemia',['Mars','Ziemia','Wenus','Jowisz']],['Ile to 5 × 2?','10',['7','8','10','12']],['Co robi pszczoła?','Zbiera nektar',['Zbiera nektar','Buduje tamy','Zjada kamienie','Pływa w morzu']]]:[['Które zwierzę mówi „miau”?','🐈',['🐕','🐈','🐄','🐎']],['Jaki kolor ma trawa?','zielony',['czerwony','zielony','niebieski','fioletowy']],['Co ma dwa koła?','🚲',['🚲','🚗','🛶','🚁']]];const q=qs[Math.floor(Math.random()*qs.length)];question=q[0];answer=q[1];choices=q[2]}
else if(kind==='logic'){const q=[['Co jest cięższe: kilogram piór czy kilogram kamieni?','Tyle samo',['Pióra','Kamienie','Tyle samo','Nie wiadomo']],['Co następuje po liczbie 19?','20',['18','20','21','29']],['Który miesiąc jest po maju?','Czerwiec',['Marzec','Kwiecień','Czerwiec','Lipiec']]][Math.floor(Math.random()*3)];question=q[0];answer=q[1];choices=q[2]}
else if(kind==='trace'){box.innerHTML=`<h3>✍️ Prowadź palec po śladzie ${speakBtn('Prowadź palec po śladzie')}</h3>${select('tracechar','Litera lub cyfra','A B C D E F G H I J K L M N O P R S T U W Y Z 0 1 2 3 4 5 6 7 8 9'.split(' ').map(x=>[x,x]),'A')}<canvas id="trace" width="320" height="300" aria-label="Tablica do rysowania"></canvas><p id="tracefeedback">Narysuj literkę. Aplikacja sama sprawdzi kształt. Punkty tylko za poprawny ślad.</p>${button('Wyczyść','trace:clear')}${button('Sprawdź literkę','trace:submit','gold')}`;drawTrace();return}choices=[...new Set(choices)].sort(()=>Math.random()-.5);practice={kind,answer,question,...(practice?.word&&kind==='english'?{word:practice.word}:{})};box.innerHTML=kind==='english'?`<div class="english-game"><div class="english-top"><span>🇬🇧 ANGIELSKI · MISJA SŁÓWKA</span><span>✨ Ucz się przez zabawę</span></div><div class="english-mode-row"><span class="english-mode">🖼️ Obrazek</span><span class="english-mode">🔊 Słuchanie</span><span class="english-mode">🧠 Quiz</span></div><div class="english-illustration">${vocabArt(practice.word)}</div><div class="english-word"><small>POSŁUCHAJ I ZAPAMIĘTAJ</small><strong>${e(practice.word)}</strong><div class="english-audio">${speakBtn(practice.word,'en-US')} ${button('🔤 Literuj','exercise:spell')}</div><div class="english-pronunciation"><p><b>🎙️ Powiedz słowo po angielsku</b></p>${button('🎤 Powiedz do telefonu','exercise:pronounce','gold')}<p id="english-pronunciation-feedback" role="status" aria-live="polite">Najpierw posłuchaj wzoru, a potem naciśnij mikrofon.</p><small>Telefon sprawdza, jakie słowo rozpoznał — nie ocenia dokładności poszczególnych głosek. Możesz próbować wielokrotnie.</small></div></div><div class="english-question"><h3>Co oznacza <em>${e(practice.word)}</em>?</h3><p>Wybierz właściwą odpowiedź 👇</p></div><div class="english-answers">${choices.map((c,i)=>`<button class="english-answer" data-action="exercise:check:${i}" data-choice="${e(c)}"><span class="english-choice-mark">${['A','B','C','D'][i]}</span><b>${e(c)}</b></button>`).join('')}</div><p id="feedback" class="english-feedback" role="status"></p></div>`:`<h3>${e(question).replace(/\n/g,'<br>')} ${speakBtn(question)}</h3><p>${speakBtn('Wybierz poprawną odpowiedź spośród dostępnych możliwości.')}</p><div class="grid">${choices.map((c,i)=>`<button class="alt" data-action="exercise:check:${i}" data-choice="${e(c)}">${e(c)} ${speakBtn(c)}</button>`).join('')}</div><p id="feedback" role="status"></p>`;box.querySelectorAll('[data-speak]').forEach(b=>b.addEventListener('click',ev=>{ev.stopPropagation();speak(b.dataset.speak,b.dataset.lang,profile().mentor,data.settings.rate||1)}))}
async function checkExercise(i){if(practiceAnswered)return;const buttons=[...document.querySelectorAll('#exercise [data-choice]')],answer=buttons[i]?.dataset.choice;if(!answer)return;const ok=answer===practice.answer,fb=$('feedback');fb.textContent=mentorLine(profile(),ok);speak(fb.textContent,'pl-PL',profile().mentor);if(!ok)return;practiceAnswered=true;buttons.forEach(b=>b.disabled=true);const key=`practice:${who}:${date()}`,count=data.history.filter(h=>h.child===who&&h.key.startsWith(key)).length;const low=(who==='pawel'&&['count','color','letter','lettercase','firstsound','numbermatch','shapes','trace'].includes(practice.kind))||(Number(profile().grade)>2&&['count','color','letter','lettercase','firstsound','numbermatch','shapes'].includes(practice.kind));if(count<(Number(data.settings.dailyPracticeLimit)||3)&&!low){const awarded=await grant(who,Number(data.settings.xpPractice)||5,'Trening: '+practice.kind,key+':'+count);if(awarded)fb.textContent+=' +'+data.settings.xpPractice+' złotych'}else fb.textContent+=' Ćwicz dalej bez punktów (limit lub powtórka poniżej poziomu).'}
function drawTrace(){const canvas=$('trace');if(!canvas)return;const char=$('tracechar').value,ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,320,300);ctx.fillStyle='#d8dce5';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='bold 230px Arial';ctx.fillText(char,160,150);tracePoints=[];ctx.strokeStyle='#bd3048';ctx.lineWidth=10;ctx.lineCap='round';const mask=document.createElement('canvas');mask.width=320;mask.height=300;const mc=mask.getContext('2d');mc.fillStyle='white';mc.fillRect(0,0,320,300);mc.fillStyle='black';mc.font='bold 230px Arial';mc.textAlign='center';mc.textBaseline='middle';mc.fillText(char,160,150);traceMask=mc.getImageData(0,0,320,300).data;const pos=ev=>{const r=canvas.getBoundingClientRect();return [(ev.clientX-r.left)*320/r.width,(ev.clientY-r.top)*300/r.height]};canvas.onpointerdown=ev=>{traceDown=true;canvas.setPointerCapture(ev.pointerId);let p=pos(ev);tracePoints.push(p);ctx.beginPath();ctx.moveTo(...p)};canvas.onpointermove=ev=>{if(!traceDown)return;let p=pos(ev);tracePoints.push(p);ctx.lineTo(...p);ctx.stroke()};canvas.onpointerup=canvas.onpointercancel=()=>{traceDown=false;tracePoints.push(null)}}
async function traceSubmit(){
 const char=$('tracechar')?.value, feedback=$('tracefeedback');
 if(!char||!traceMask||!feedback)return;
 const strokes=[];let stroke=[];
 for(const point of tracePoints){if(point){stroke.push(point)}else if(stroke.length){strokes.push(stroke);stroke=[]}}
 if(stroke.length)strokes.push(stroke);
 const reject=(msg)=>{feedback.textContent='🔁 '+msg;speak(msg,'pl-PL',profile().mentor);note(msg)};
 if(!strokes.length||strokes.reduce((n,st)=>n+st.length,0)<12)return reject('Najpierw narysuj literkę palcem.');
 const W=320,H=300,grid=12,maskCells=new Set(),drawnCells=new Set();
 // Compare the actual rendered glyph with a sampled stroke, not just the amount of scribbling.
 const isInk=(x,y)=>x>=0&&x<W&&y>=0&&y<H&&traceMask[(Math.floor(y)*W+Math.floor(x))*4]<130;
 for(let y=0;y<H;y+=3)for(let x=0;x<W;x+=3)if(isInk(x,y))maskCells.add(Math.floor(x/grid)+Math.floor(y/grid)*Math.ceil(W/grid));
 let length=0,inside=0,samples=0,outside=0;
 for(const st of strokes){for(let i=1;i<st.length;i++){
  const a=st[i-1],b=st[i],d=Math.hypot(b[0]-a[0],b[1]-a[1]);if(d>130)return reject('Nie łącz odległych części jednym ruchem. Spróbuj jeszcze raz.');
  length+=d;const steps=Math.max(1,Math.ceil(d/3));
  for(let j=0;j<=steps;j++){
   const x=a[0]+(b[0]-a[0])*j/steps,y=a[1]+(b[1]-a[1])*j/steps;samples++;
   let close=false;for(let dy=-9;dy<=9&&!close;dy+=3)for(let dx=-9;dx<=9;dx+=3){if(isInk(x+dx,y+dy)){close=true;break}}
   if(close){inside++;drawnCells.add(Math.floor(x/grid)+Math.floor(y/grid)*Math.ceil(W/grid))}else outside++;
  }
 }}
 const precision=inside/Math.max(1,samples);
 // Count distinct regions of the letter reached by the child's strokes.
 let matched=0;for(const cell of maskCells){const gx=cell%Math.ceil(W/grid),gy=Math.floor(cell/Math.ceil(W/grid));let found=false;
  for(let dy=-1;dy<=1&&!found;dy++)for(let dx=-1;dx<=1;dx++)if(drawnCells.has(gx+dx+(gy+dy)*Math.ceil(W/grid))){found=true;break}
  if(found)matched++;
 }
 const coverage=matched/Math.max(1,maskCells.size);
 if(length<110||precision<.76||coverage<.55)return reject('Jeszcze nie całkiem. Prowadź paluszek po całej literce, dokładnie po jasnym śladzie.');
 const prefix=`trace:${who}:${date()}:`,count=data.history.filter(h=>h.key?.startsWith(prefix)).length;
 const key=prefix+char;
 if(data.history.some(h=>h.key===key)){feedback.textContent='✅ Świetnie! Ta literka jest już dzisiaj zaliczona. Możesz ćwiczyć dalej bez kolejnych punktów.';speak('Brawo! Literka jest poprawna. Dzisiaj punkty za nią już zdobyłeś.','pl-PL',profile().mentor);return}
 const limit=Math.max(0,Number(data.settings.dailyPracticeLimit)??3);
 const low=who==='pawel'&&Number(profile().grade)>=2;
 if(count>=limit||low){feedback.textContent='✅ Brawo! Kształt zaliczony. Dzisiaj bez dodatkowych punktów.';speak('Brawo! Dobrze poprowadzony ślad!','pl-PL',profile().mentor);return}
 const points=Math.max(0,Number(data.settings.xpPractice)||5);
 const awarded=await grant(who,points,'Poprawne pisanie: '+char,key);
 feedback.textContent=awarded?`✅ Brawo! Litera ${char} zaliczona. +${points} XP!`:'✅ Literka zaliczona.';
 speak(awarded?`Brawo! Poprawnie narysowana literka ${char}. Zdobywasz ${points} punktów!`:'Brawo! Poprawna literka.','pl-PL',profile().mentor);
}
async function exportBackup(){const records=await allRecords();const encoded=[];for(const [k,v] of records){if(v instanceof Blob){const base64=await new Promise(ok=>{const r=new FileReader();r.onload=()=>ok(r.result);r.readAsDataURL(v)});encoded.push([k,{__blob:base64}])}else encoded.push([k,v])}const url=URL.createObjectURL(new Blob([JSON.stringify({format:'academy-backup-1',records:encoded})],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='akademia-pelna-kopia-'+date()+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),10000)}
async function importBackup(){const f=$('backupfile').files[0];if(!f)return note('Wybierz plik kopii.');try{const raw=JSON.parse(await f.text());if(raw.format!=='academy-backup-1'||!Array.isArray(raw.records)||!raw.records.some(([k,v])=>k==='state'&&v.profiles?.pawel&&v.profiles?.patryk))throw Error('To nie jest poprawna kopia');if(!confirm('Zastąpić wszystkie lokalne dane tą kopią?'))return;const records=[];for(const [k,v] of raw.records){if(v?.__blob){const res=await fetch(v.__blob);records.push([k,await res.blob()])}else records.push([k,v])}await replaceRecords(records);data=await get('state');role='';render();note('Przywrócono pełną kopię.')}catch(err){note('Nie udało się przywrócić kopii: '+err.message)}}
async function handle(action,target){
if(action.startsWith('v76:'))return v76Action(action,target);
if(action==='book:review'){v76Q.level='pages';v76Q.selected.clear();adminTab='question-review';return render()}

if(action==='training:toggle-sound'){const old=localStorage.getItem('academy-v72-training-silent')==='1';localStorage.setItem('academy-v72-training-silent',old?'0':'1');for(const el of document.querySelectorAll('[data-action="training:toggle-sound"]')){el.textContent=old?'🎶':'🎵';el.setAttribute('aria-pressed',String(old))}return}
if(action.startsWith('training:')){
 const parts=action.split(':'),what=parts[1],value=decodeURIComponent(parts.slice(2).join(':'));
 if(what==='mini'){const lessonBySubject={Polski:0,Matematyka:5,Angielski:9};lessonIndex=lessonBySubject[trainingSelectedSubject]??0;avengersRun=null;trainingStep='outside-mini';render();discoveryStart(value==='quick'?'quick':'match');return}
 if(what==='subject'){trainingSelectedSubject=value;trainingSelectedPages=new Set();trainingStep='source';return render()}
 if(what==='source'){trainingStep=value==='outside'?'outside':'mode';if(value==='outside'){const map={Polski:'polski',Matematyka:'matematyka',Angielski:'angielski',Przyroda:'przyroda'};v37Subject=map[trainingSelectedSubject]||'all'}return render()}
 if(what==='mode'){trainingMode=value==='test'?'test':value==='vocab'&&/angiel|english/i.test(trainingSelectedSubject)?'vocab':'game';trainingStep='range';return render()}
 if(what==='back'){trainingStep=value;return render()}
 if(what==='range'){
  if(value==='all'){trainingSelectedPages=new Set(trainingPageItems().map(p=>p.id));trainingStep='ready'}
  else{trainingSelectedPages=new Set();trainingStep='pick'}return render();
 }
 if(what==='all'){trainingSelectedPages=new Set(trainingPageItems().map(p=>p.id));return render()}
 if(what==='none'){trainingSelectedPages=new Set();return render()}
 if(what==='readpage'){const p=data.bookPages.find(p=>p.id===value);if(p)return speak(p.text||'Brak rozpoznanego tekstu', 'pl-PL',profile().mentor,data.settings.rate||1);return}
 if(what==='start'){
  const eligible=new Set(trainingPageItems().map(p=>p.id));
  const selected=[...trainingSelectedPages].filter(id=>eligible.has(id));
  if(!selected.length)return note('Wybierz co najmniej jedną stronę, której tekst został odczytany.');
  const first=data.bookPages.find(p=>p.id===selected[0]);
  return smOpen(first?.bookId||'',{subject:trainingSelectedSubject,pageIds:selected,mode:trainingMode});
 }
 return;
}
if(action==='mic:reset'){localStorage.removeItem('academy-v70-mic-position');const mic=document.querySelector('.mic');if(mic){mic.style.left='';mic.style.top='';mic.style.right='';mic.style.bottom='';}return note('Przywrócono pozycję mikrofonu.')}
if(action==='sm:open')return smOpen();
if(action.startsWith('sm:book:'))return smOpen(action.slice(8));

if(action.startsWith('v37:say:')){
 const parts=action.split(':');
 const lang=parts[2];
 const text=decodeURIComponent(parts.slice(3).join(':'));
 speak(text,lang,profile().mentor,data.settings.rate||1);
 return;
}
if(action.startsWith('v37:subject:')){
 v37Subject=action.split(':')[2];
 return render();
}
if(action==='v37:play'){
 trainingStep='outside-quiz';
 avengersRun={
  items:v37Questions(v37Subject),
  i:0,points:0,done:false,good:false
 };
 v37Classic=false;
 return render();
}
if(action==='v37:classic'){
 avengersRun=null;
 v37Classic=true;
 return render();
}
if(action==='v37:hub'){
 avengersRun=null;
 v37Classic=false;
 trainingStep='outside';
 return render();
}

if(action==='av36:start'){
 avengersRun={items:[...avengersQuiz].sort(()=>Math.random()-.5),i:0,points:0,done:false,good:false};
 return render();
}
if(action==='av36:close'){avengersRun=null;return render();}
if(action.startsWith('av36:answer:')&&avengersRun&&!avengersRun.done){
 const q=avengersRun.items[avengersRun.i];
 avengersRun.good=Number(action.split(':')[2])===q.ok;
 if(avengersRun.good)avengersRun.points++;
 avengersRun.done=true;
 return render();
}
if(action==='av36:next'&&avengersRun&&avengersRun.done){
 avengersRun.i++;avengersRun.done=false;return render();
}
const [a,b,c]=action.split(':');try{if(action==='exit'){if(testMode){data=testSnapshot;testSnapshot=null;testMode=false;role='admin';who='';tab='home';adminTab='test';return render()}role='';who='';tab='home';return render()}if(a==='enter'){if(b==='admin'){if(!data.parentPin){const pin=prompt('Ustaw PIN mamy (minimum 4 cyfry)');if(!/^\d{4,8}$/.test(pin||''))return note('Wymagany PIN od 4 do 8 cyfr');data.parentPin=pin;await save()}else if(prompt('PIN mamy')!==data.parentPin)return note('Nieprawidłowy PIN');role='admin';adminTab='home'}else{const p=data.profiles[b];if(p.pin&&prompt('PIN profilu '+p.name)!==p.pin)return note('Nieprawidłowy PIN');role='child';who=b;tab='home'}return render()}if(a==='test'&&b==='enter'){if(!['pawel','patryk'].includes(c))return;testSnapshot=data;data=structuredClone(data);testMode=true;for(const id of ['pawel','patryk']){const p=data.profiles[id];p.coins=99999;p.arcadeUnlocked=ARCADE_GAMES.map(g=>g.id);const base=migrateBase(p);base.owned=BASE_ITEMS.map(i=>i.id)}role='child';who=c;tab='base';return render()}if(a==='admin'){adminTab=b;return render()}if(a==='child'){tab=b;if(b==='learn'){v37Classic=false;avengersRun=null;trainingStep='subject';trainingSelectedPages=new Set()}return render()}if(action==='book:add')return runAdminAction(target,'Dodaje ksiazke…',async()=>{
 if(!$('bsubject')?.value)throw Error('Najpierw zaznacz przedmioty w profilu dziecka.');
 const chosenKind=$('btype')?.value||'Podręcznik';const chosenSubject=$('bsubject')?.value||'Materiał';const chosenPart=$('bpart')?.value||'1';const title=chosenKind==='Inne'?$('btitle')?.value.trim():chosenSubject+' — '+chosenKind+' — część '+chosenPart;if(!title)return note('Wpisz nazwę materiału.');
 const child=$('bchild').value,subject=$('bsubject').value,part=$('bpart').value;
 if(data.books.some(b=>b.title.trim().toLocaleLowerCase('pl-PL')===title.toLocaleLowerCase('pl-PL')&&b.subject===subject&&String(b.part||'')===part&&String(b.grade||'')===String($('bgrade').value)))return note('Taka książka jest już w bibliotece. Otwórz ją zamiast dodawać ponownie.');
 data.books.push({id:uid(),title,child,audience:v76ChosenAudience(),grade:$('bgrade').value,subject,part,year:'',kind:$('btype').value,archived:false});
 await save();render();note('✅ Dodano książkę: '+title);
});if(action==='book:save')return runAdminAction(target,'Zapisuje książkę…',async()=>{
 if(!$('bsubject')?.value)throw Error('Wybierz przedmiot z profilu dziecka.');
 const book=data.books.find(b=>b.id===bookId);if(!book)throw Error('Nie znaleziono książki.');
 Object.assign(book,{title:$('btitle').value,child:$('bchild').value,grade:$('bgrade').value,subject:$('bsubject').value,part:$('bpart').value,year:book.year||'',audience:v76ChosenAudience(),kind:$('btype').value,pageNumberPosition:$('booknumberlocation')?.value||book.pageNumberPosition});
 await save();render();note('✅ Zapisano dane książki.');
});
if(action==='book:cover')return runAdminAction(target,'Zapisuje okładkę…',async()=>{
 const b=data.books.find(b=>b.id===bookId),file=$('bookcoverfile')?.files?.[0];
 if(!b)throw Error('Nie znaleziono książki.');if(!file)return note('Wybierz zdjęcie okładki.');
 const coverId=b.coverId||uid();await put('image:'+coverId,await compress(file));b.coverId=coverId;
 await save();render();note('✅ Zapisano okładkę książki.');
});
if(action==='page:bulk-pause'){
 if(!bulkAiBusy)return note('Nie trwa teraz zbiorczy odczyt zdjęć.');
 bulkAiPauseRequested=true;setBulkAiControls();bulkAiStatus('⏸ Zatrzymam po ukończeniu bieżącej strony. Jej tekst zostanie zapisany.');return;
}
if(action==='book:questions-pause'){if(questionBuildBusy){questionBuildStop=true;setQuestionBuildButtons();note('⏸ Zatrzymam po bieżącej stronie.')}return}
if(action==='v75:pages:approve')return runAdminAction(target,'Zatwierdzam strony…',async()=>{
 const ids=new Set(selectedBookPageIds());const chosen=data.bookPages.filter(p=>ids.has(p.id)&&p.bookId===bookId&&p.text?.trim()&&!p.reviewed);
 if(!chosen.length)return note('Zaznacz żółte strony z tekstem, które chcesz zatwierdzić.');
 if(!confirm('Zatwierdzić '+chosen.length+' stron bez ponownej kontroli tekstu i numeracji?'))return;
 for(const p of chosen){p.reviewed=true;p.reviewedAt=new Date().toISOString()}
 await save();render();note('✅ Zatwierdzono '+chosen.length+' stron.');
});
if(action==='v75:select:all'||action==='v75:select:none'){
 const section=target.closest('.v74-review-page')||document;
 section.querySelectorAll('[data-v75-bank-check]').forEach(x=>x.checked=action==='v75:select:all');v75BankChecks();return;
}
if(action==='v75:questions:delete')return v75BankDelete();
if(action==='v75:questions:check')return v75CheckQuestionLogic();
if(action==='v75:questions:ai')return v75ReviewWithThreeAI(target);
if(action==='v75:questions:stop'){v75ReviewStop=true;v76ReviewController?.abort();return note('⏸ Kontrola zakończy się po bieżącej partii.');}
if(action.startsWith('v75:questions:suggest:'))return v75SuggestQuestion(decodeURIComponent(action.slice('v75:questions:suggest:'.length)),target);
if(action==='v75:outside:show')return v75OutsideShow();
if(action==='v75:outside:generate')return v75OutsideGenerate(target);
if(action.startsWith('v75:outside:delete:'))return v75OutsideDelete(Number(action.split(':').pop()));
if(action==='v75:pre:game'||action==='v75:pre:test'){
 trainingMode=action.endsWith(':test')?'test':'game';trainingSelectedSubject='Wiedza ogólna';trainingSelectedPages=new Set();
 trainingStep='mode';const pagesReady=trainingPageItems();if(pagesReady.length){trainingSelectedPages=new Set(pagesReady.map(p=>p.id));return smOpen('',{subject:'Wiedza ogólna',pageIds:[...trainingSelectedPages],mode:trainingMode})}
 v37Subject='all';avengersRun={items:v75PreschoolQuestions().slice(0,10),i:0,points:0,done:false,good:false};trainingStep='outside-quiz';return render();
}
if(action==='report:reset')return v74ResetReport();
if(action.startsWith('book:save-question:')){
 const key=decodeURIComponent(action.slice('book:save-question:'.length)),box=target.closest('[data-v74-edit]');if(!box)return;
 const vals=v74QuestionFields(box),options=vals.options.split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
 if(!vals.question.trim()||!vals.answer.trim()||!options.length)return note('Wpisz pytanie, prawidłową odpowiedź i opcje.');
 const pl=box.querySelector('[data-v75-field="questionPl"]')?.value||'';
 v74SaveQuestion(key,target);
 const b=data.books.find(x=>x.id===bookId);if(b){const bank=bookBankItems(b),x=bank.find(x=>String(x.key)===key);if(x){x.task.questionPl=pl;delete x.task.instructionEn;delete x.task.instructionPl;delete x.v76Review;x.v75Flagged=false;x.v75Reason='';localStorage.setItem('academy-v48-bank-'+b.child+'-'+b.id,JSON.stringify(bank))}}
 return;
}
if(action.startsWith('book:cancel-question:')){
 const key=decodeURIComponent(action.slice('book:cancel-question:'.length)),box=target.closest('[data-v74-edit]');
 v74CancelQuestion(key,target);
 const pl=box?.querySelector('[data-v75-field="questionPl"]');const saved=v74QuestionInitial(key);
 if(pl)pl.value=String(saved?.questionPl||'');return;
}
if(action==='book:review'){adminTab='question-review';return render()}
if(action.startsWith('book:edit-question:'))return v73EditQuestion(decodeURIComponent(action.slice('book:edit-question:'.length)));
if(action.startsWith('book:delete-question:'))return v73DeleteQuestion(decodeURIComponent(action.slice('book:delete-question:'.length)));
if(action==='book:questions'){
 const b=data.books.find(x=>x.id===bookId);if(!b)return note('Nie znaleziono książki.');
 return buildBookQuestions(b).catch(err=>{console.error(err);note('❌ '+err.message)});
}
if(action==='page:bulk-ai')return runAdminAction(target,'Odczytuje strony AI…',async()=>{const b=data.books.find(x=>x.id===bookId);if(!await ensureNumberLocation(b))return;return readAllBookPagesAI()});
if(action==='page:select-all'||action==='page:select-none'){
 document.querySelectorAll('[data-page-select]').forEach(box=>box.checked=action==='page:select-all');
 updateBookPageSelection();return;
}
if(action==='page:delete-selected')return runAdminAction(target,'Usuwam wybrane strony…',async()=>{
 const ids=new Set(selectedBookPageIds()),pages=sortedBookPages(bookId).filter(p=>ids.has(p.id));
 if(!pages.length)return note('Najpierw zaznacz strony do usunięcia.');
 if(!confirm('Trwale usunąć '+pages.length+' zaznaczonych stron i ich zdjęcia? Pozostałe strony zostaną zachowane.'))return;
 for(const p of pages)await del('image:'+p.imageId);
 data.bookPages=data.bookPages.filter(p=>!ids.has(p.id));await save();render();note('✅ Usunięto '+pages.length+' wybranych stron.');
});if(action==='book:delete')return runAdminAction(target,'Usuwam podręcznik…',async()=>{
 const b=data.books.find(b=>b.id===bookId);if(!b)throw Error('Nie znaleziono podręcznika.');
 const pages=sortedBookPages(b.id);
 if(!confirm('Trwale usunąć podręcznik „'+b.title+'” razem z '+pages.length+' stronami, ich tekstami, zdjęciami i okładką?\n\nTej czynności nie można cofnąć.'))return;
 for(const p of pages)await del('image:'+p.imageId);
 if(b.coverId)await del('image:'+b.coverId);
 data.bookPages=data.bookPages.filter(p=>p.bookId!==b.id);
 data.books=data.books.filter(x=>x.id!==b.id);
 await save();bookId='';pageId='';adminTab='books';render();note('✅ Usunięto podręcznik i jego strony.');
});
if(action==='book:archive'){const book=data.books.find(b=>b.id===bookId);book.archived=!book.archived;await save();return render()}if(action.startsWith('book:open:')){bookId=action.slice(10);adminTab='book';return render()}if(action==='book:chapter-range'){
 const from=Number($('chapterfrom')?.value),to=Number($('chapterto')?.value);
 const rawChapter=String($('chaptername')?.value||'').trim();const name=/^\d+$/.test(rawChapter)?'Dział '+rawChapter:rawChapter;
 if(!Number.isInteger(from)||!Number.isInteger(to)||from<1||to<from||to-from>500)return note('Podaj prawidłowy zakres stron (maks. 501 stron).');
 if(!name)return note('Wpisz nazwę działu.');
 let count=0;for(const p of data.bookPages){if(p.bookId===bookId&&p.number>=from&&p.number<=to){p.chapter=name;count++}}
 if(!count)return note('Nie znaleziono stron w podanym zakresie.');
 await save();render();return note('Przypisano '+count+' stron do działu: '+name);
 }
 if(action==='page:upload'||action==='page:camera')return runAdminAction(target,'Dodaje zdjęcia…',async()=>{
 const input=action==='page:camera'?$('pagecamera'):$('pagefiles');
 const files=[...(input?.files||[])];if(!files.length)return note('Wybierz zdjęcia.');
 let n=Number($('start')?.value)||1,added=0,skipped=0;
 const known=new Set();const chapter=$('newchapter')?.value.trim()||'';
 for(const f of files){
  const signature=[f.name,f.size,f.lastModified].join('|');
  if(known.has(signature)){skipped++;continue}known.add(signature);
  if(data.bookPages.some(p=>p.bookId===bookId&&p.number===n)){
   // Zdjęcie dla tego numeru już istnieje: nie dodawaj drugiej kopii.
   skipped++;n++;continue;
  }
  const blob=await compress(f),imageId=uid();await put('image:'+imageId,blob);
  data.bookPages.push({id:uid(),bookId,number:n++,imageId,text:'',chapter});
  added++;target.textContent='⏳ Dodano '+added+' z '+files.length;
 }
 if(added)await save();render();note('✅ Dodano '+added+' stron'+(skipped?' · pominięto '+skipped+' duplikatów/numerów':'')+'.');
});if(action.startsWith('page:open:')){pageId=action.slice(10);adminTab='page';return render()}if(action==='page:approve')return runAdminAction(target,'Zatwierdzam stronę…',async()=>{
 if(!await saveEditedPage())throw Error('Nie znaleziono strony.');
 const p=data.bookPages.find(x=>x.id===pageId);
 if(!p?.text?.trim())return note('Najpierw odczytaj i sprawdź tekst strony.');
 p.reviewed=true;p.reviewedAt=new Date().toISOString();await save();render();note('✅ Strona '+p.number+' zatwierdzona. Można generować z niej pytania.');
});
if(action==='page:unapprove')return runAdminAction(target,'Cofam zatwierdzenie…',async()=>{
 if(!await saveEditedPage())throw Error('Nie znaleziono strony.');
 const p=data.bookPages.find(x=>x.id===pageId);if(!p)return;
 p.reviewed=false;await save();render();note('🟡 Cofnięto zatwierdzenie strony '+p.number+'.');
});
if(action==='page:save')return runAdminAction(target,'Zapisuje stronę…',async()=>{
 if(!await saveEditedPage())throw Error('Nie znaleziono strony.');note('✅ Zapisano tekst i dział strony.');
});
if(action==='page:prev'||action==='page:next')return runAdminAction(target,'Zapisuje i przechodzi…',async()=>{
 const current=pageId,delta=action==='page:next'?1:-1;
 if(!await saveEditedPage())throw Error('Nie znaleziono bieżącej strony.');
 const pages=sortedBookPages(bookId),index=pages.findIndex(p=>p.id===current),next=pages[index+delta];
 if(!next){note(delta>0?'To ostatnia strona.':'To pierwsza strona.');return}
 pageId=next.id;render();note('✅ Zapisano zmiany. Strona '+next.number+'.');
});if(action==='page:delete'){if(!confirm('Usunąć tę stronę?'))return;const pages=sortedBookPages(bookId),pos=pages.findIndex(x=>x.id===pageId),p=pages[pos];if(!p)return;await del('image:'+p.imageId);data.bookPages=data.bookPages.filter(x=>x.id!==pageId);const next=pages[pos+1]||pages[pos-1];await save();if(next){pageId=next.id;adminTab='page'}else adminTab='book';return render()}if(action==='page:replace'||action==='page:replace-camera'){const f=$(action==='page:replace-camera'?'replacecamera':'replacefile')?.files?.[0];if(!f)return note('Wybierz zdjęcie');const p=data.bookPages.find(p=>p.id===pageId);await put('image:'+p.imageId,await compress(f));p.reviewed=false;await save();return render()}if(action==='page:ai'){const p=data.bookPages.find(p=>p.id===pageId);if(!p)return note('Nie znaleziono strony');try{const b=data.books.find(x=>x.id===p.bookId);if(!await ensureNumberLocation(b))return;await saveEditedPage();await recognizePageAI(p,$('ocrlang')?.value||languageOfBook(b),true);render();note('✅ Odczyt AI gotowy. Sprawdź tekst i numer strony.')}catch(err){note('❌ Nie udało się odczytać zdjęcia. Wcześniejszy tekst zachowano. '+err.message)}return}if(action==='page:ocr'){const p=data.bookPages.find(p=>p.id===pageId);if(!p)return note('Nie znaleziono strony');const lang=$('ocrlang')?.value||'pol';try{await recognizePage(p,lang);render();note('Tekst odczytany. Sprawdź go i zapisz poprawki.')}catch(err){note(err.message)}return}
if(action.startsWith('profile:save:')){const p=data.profiles[c],pin=$('pin_'+c).value;if(pin&&!/^\d{4,8}$/.test(pin))return note('PIN musi mieć 4–8 cyfr');p.grade=$('grade_'+c).value;p.subjects=[...document.querySelectorAll('[data-subject-for="'+c+'"]:checked')].map(x=>x.value);const extra=$('newsubject_'+c).value.trim();if(extra&&!p.subjects.some(x=>x.toLowerCase()===extra.toLowerCase()))p.subjects.push(extra);p.pin=pin;await save();return note('Zapisano profil')}if(a==='hero'&&b==='set'){const id=c,selected=action.split(':')[3];if(!HEROES.some(h=>h[0]===selected))return;data.profiles[id].hero=selected;await save();return render()}if(action==='pin:change'){const pin=$('parentpin').value;if(!/^\d{4,8}$/.test(pin))return note('PIN musi mieć 4–8 cyfr');data.parentPin=pin;await save();return note('Zmieniono PIN')}if(action==='settings:save'){data.settings.xpPractice=Math.max(0,Math.min(30,Number($('xpPractice').value)));data.settings.dailyPracticeLimit=Math.max(0,Math.min(20,Number($('dailyLimit').value)));data.settings.rate=Math.max(.5,Math.min(1.5,Number($('rate').value)));await save();return note('Zapisano ustawienia')}if(action.startsWith('song:open:')){missionId=action.slice(10);tab='song';return render()}if(action.startsWith('song:line:')){const lines=[...document.querySelectorAll('.song-line')];lines.forEach((x,i)=>x.classList.toggle('active',i===Number(c)));return}if(action==='song:add'){const title=$('songtitle').value,url=$('songurl').value;if(!/^https:\/\/(www\.)?(youtube\.com|youtu\.be)\//.test(url))return note('Podaj prawidłowy link YouTube');const lyrics=$('songlyrics')?.value||'';const id=youtubeId(url);if(!id)return note('Podaj prawidłowy adres filmu YouTube');data.settings.songs.push({id:uid(),title,url,lyrics});const song=data.settings.songs.at(-1);data.missions.push({id:uid(),child:$('songchild').value,type:'song',songId:song.id,title:'🎵 Naucz się piosenki: '+title,subject:'Muzyka',status:'todo',points:20,requirePhoto:false,repeat:'none',created:date()});await save();return render()}if(action.startsWith('song:delete:')){data.settings.songs.splice(Number(c),1);await save();return render()}if(action==='backup:export')return exportBackup();if(action==='backup:import')return importBackup();if(action.startsWith('reader:')&&action!=='reader:ocr'){bookId=b;pageId='';tab='reader';return render()}if(action==='reader:ai'){const pg=data.bookPages.find(p=>p.id===($('readerpage')?.value||pageId));if(!pg)return note('Wybierz stronę');try{await recognizePageAI(pg,$('ocrlang')?.value||'pol');pageId=pg.id;render();note('Odczyt AI gotowy. Sprawdź tekst.')}catch(err){note(err.message)}return}if(action==='reader:ocr'){const pg=data.bookPages.find(p=>p.id===($('readerpage')?.value||pageId));if(!pg)return note('Wybierz stronę');try{await recognizePage(pg,$('ocrlang')?.value||'pol');pageId=pg.id;render();note('Tekst rozpoznany — możesz go teraz odsłuchać.')}catch(err){note(err.message)}return}
if(action==='homework:create'){const p=data.bookPages.find(p=>p.id===$('readerpage').value),b=data.books.find(b=>b.id===bookId),tasks=$('tasks').value.trim();if(!p||!tasks)return note('Wybierz stronę i wpisz zadania');data.missions.push({id:uid(),child:who,type:'homework',title:'Zadania '+tasks,subject:b.subject,bookId:b.id,page:p.number,status:'todo',points:20,requirePhoto:true,repeat:'none',created:date()});await save();tab='home';return render()}if(action==='academy:subjects'){academySubject='';tab='academy';return render()}if(action.startsWith('academy:subject:')){academySubject=c;tab='academy';return render()}if(action.startsWith('lesson:open:')){lessonIndex=Number(c);tab='lesson';return render()}
if(action.startsWith('discovery:start:'))return discoveryStart(c);if(action==='discovery:restart')return discoveryStart(discoveryGame?.mode||'match');if(action.startsWith('discovery:match:'))return discoveryAnswer(discoveryGame?.items[discoveryGame.index]?.[1]===discoveryGame?.items[Number(c)]?.[1]?discoveryGame.items[discoveryGame.index][1]:'');if(action==='discovery:quick')return discoveryAnswer(target.dataset.answer);if(action.startsWith('lesson:answer:')){const l=LESSONS[lessonIndex],ok=Number(c)===l.correct,el=$('lesson-feedback');if(!el)return;el.textContent=ok?'🎉 Świetnie! '+l.why:'💡 Spróbuj ponownie. '+l.rule;el.className=ok?'answer-ok':'answer-retry';speak(el.textContent,'pl-PL',profile().mentor);return}
if(action.startsWith('arcade:buy:')){const g=ARCADE_GAMES.find(x=>x.id===c),p=profile();if(!g)return;if((p.arcadeUnlocked||[]).includes(g.id))return note('Gra już odblokowana');if(p.coins<g.cost)return note('Brakuje '+(g.cost-p.coins)+' złotych');p.coins-=g.cost;p.arcadeUnlocked??=[];p.arcadeUnlocked.push(g.id);await save();return render()}
if(action.startsWith('arcade:open:')){if(!testMode&&!(profile().arcadeUnlocked||[]).includes(c))return note('Najpierw odblokuj grę');arcadeId=c;tab='arcade';return render()}
if(action==='game:crossword'){tab='crossword';return render()}if(action==='game:quiz'){tab='learn';render();trainingChooseKind('quiz');return}if(action==='game:logic'){tab='learn';render();trainingChooseKind('logic');return}if(action==='crossword:check')return checkCrossword();if(action==='exercise:new')return newExercise();if(action==='book:listen')return checkBookReading();if(action==='dictation:play')return speak(practice?.answer||'','pl-PL',profile().mentor,.8);if(action==='dictation:check'){const v=($('dictationanswer')?.value||'').trim().toLocaleLowerCase('pl-PL'),ok=v===practice.answer.toLocaleLowerCase('pl-PL');const fb=$('feedback');if(practiceAnswered)return;if(!ok){fb.textContent=mentorLine(profile(),false);speak(fb.textContent,'pl-PL',profile().mentor);return}practiceAnswered=true;fb.textContent=mentorLine(profile(),true);$('dictationanswer').disabled=true;const key='practice:'+who+':'+date(),count=data.history.filter(h=>h.child===who&&h.key.startsWith(key)).length;if(count<Number(data.settings.dailyPracticeLimit||3)){await grant(who,Number(data.settings.xpPractice)||5,'Trening: '+practice.kind,key+':'+count);fb.textContent+=' +'+data.settings.xpPractice+' złotych'}else fb.textContent+=' Dzienny limit XP wykorzystany.';speak(fb.textContent,'pl-PL',profile().mentor);return}if(action.startsWith('exercise:check:'))return checkExercise(Number(c));if(action==='exercise:pronounce')return practiceEnglishSpeech();if(action==='exercise:spell'){const letters=practice.word.toUpperCase().split('').join(', ');return speak(letters,'en-US',profile().mentor,.75)}if(action==='trace:clear')return drawTrace();if(action==='trace:submit')return traceSubmit();if(action==='mentor:answer'){
 const q=String($('question')?.value||'').trim();
 if(!q)return note('Najpierw wpisz pytanie.');
 const style=profile().mentor==='fun'?'fun':'tech';
 const output=$('mentoranswer');
 if(!output)return;
 const controller=beginAIRequest('mentor');
 const expectedWho=who;
 output.textContent='⏳ Mentor zastanawia się...';
 const isCurrent=()=>!controller.signal.aborted&&tab==='mentor'&&who===expectedWho&&$('mentoranswer')===output&&output.isConnected;
 try{
  const answer=await askMentorAI(q,style,mentorHistory[style],controller.signal);
  if(!isCurrent())return;
  mentorHistory[style].push({role:'user',text:q},{role:'model',text:answer});
  mentorHistory[style]=mentorHistory[style].slice(-8);
  output.textContent=answer;
  speak(answer,'pl-PL',style);
 }catch(error){
  if(isCurrent()){console.warn('Mentor AI:',error);output.textContent=AI_FRIENDLY_MESSAGE}
 }finally{finishAIRequest('mentor',controller)}
 return;
}if(action.startsWith('mentor:choose:')){const style=action.split(':')[2];if(!['tech','fun'].includes(style))return;profile().mentor=style;await save();render();return}if(action==='mentor:speak')return speak($('mentoranswer').textContent,'pl-PL',profile().mentor);if(a==='base'&&b==='buy'){const item=BASE_ITEMS.find(x=>x.id===c),p=profile(),base=migrateBase(p);if(!item)return note('Nieznany element');if(base.owned.includes(item.id))return note('To już jest w Twojej bazie');if(p.coins<item.cost)return note('Potrzebujesz jeszcze '+(item.cost-p.coins)+' złotych');p.coins-=item.cost;base.owned.push(item.id);await save();speak('Brawo! Odblokowano '+item.name,'pl-PL',p.mentor);return render()}if(action==='mic')return microphone();}catch(err){console.error(err);note('Nie udało się wykonać operacji: '+err.message)}}
function helpForQuestion(question){
 const q=String(question||'').toLocaleLowerCase('pl-PL').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
 if(/(test|sprawdzian|kartkowk)/.test(q))return 'Aby zrobić test, wybierz zakładkę Trening, następnie przedmiot i ćwiczenie Test lub Quiz. Jeśli test jest zadany przez mamę, otwórz Misje i wybierz tę misję.';
 if(/(pogra|gra[cy]?|gry|waz|tetris|klock)/.test(q))return 'Żeby pograć, otwórz zakładkę Baza Avengersów i gry, następnie znajdź Sektor gier. Wybierz Kosmicznego Węża albo Wieżę Klocków. Jeżeli gra jest zamknięta, możesz odblokować ją za złote.';
 if(/(gdzie|jak|kt[oó]r|klik|wejsc|otworzyc|znalezc)/.test(q)&&/(trening|cwiczen|zadani|nauk)/.test(q))return 'Ćwiczenia znajdziesz w zakładce Trening. Najpierw wybierz przedmiot, a potem rodzaj zadania. W Sali odkrywców możesz poznać zasady i przykłady.';
 if(/(gdzie|jak|klik|wejsc|otworzyc|znalezc)/.test(q)&&/(baz|zbrojown|bohater|sklep|zlot)/.test(q))return 'Otwórz Bazę Avengersów i gry. Tam obejrzysz pomieszczenia, bohaterów i wyposażenie, a także wydasz zdobyte złote.';
 if(/(gdzie|jak|klik|wejsc|otworzyc|znalezc)/.test(q)&&/(ksiaz|lektur|czyta)/.test(q))return 'Wejdź w zakładkę Książki. Wybierz książkę i stronę, którą chcesz przeczytać lub odsłuchać.';
 if(/(gdzie|jak|klik|wejsc|otworzyc|znalezc)/.test(q)&&/(misj|prac[ae] domow)/.test(q))return 'Otwórz Misje. Tam znajdziesz zadania przygotowane przez mamę.';
 if(/(gdzie|jak|klik|wejsc|otworzyc|znalezc)/.test(q)&&/(mentor|pytan|mikrofon)/.test(q))return 'Wybierz zakładkę Mentor. Możesz tam wybrać Iron Mana lub Spider-Mana, zadać pytanie i odsłuchać odpowiedź.';
 if(/(gdzie|jak|klik|wejsc|otworzyc|znalezc)/.test(q)&&/(angiel|slowek|wymow)/.test(q))return 'Otwórz Trening, wybierz Angielski i ćwiczenie ze słówkami. W Sali odkrywców też znajdziesz angielskie lekcje.';
 if(/(przeczytaj|odczytaj|powtorz polecenie)/.test(q))return 'Aby odsłuchać zadanie, naciśnij przycisk głośnika przy poleceniu. Możesz też ponownie odsłuchać moją odpowiedź przyciskiem Odsłuchaj.';
 return null;
}
function closeMicBubble(){const box=document.getElementById('micanswer');if(box)box.remove();}
function showMicBubble(answer,readAloud=true){
 closeMicBubble();
 const box=document.createElement('aside');box.id='micanswer';box.className='mic-answer-card';box.setAttribute('role','status');
 const heading=document.createElement('div');heading.className='mic-answer-heading';
 const title=document.createElement('strong');title.textContent=profile().mentor==='fun'?'🕷️ Spider-Man podpowiada':'🦾 Iron Man podpowiada';
 const close=document.createElement('button');close.type='button';close.className='mic-answer-close';close.setAttribute('aria-label','Zamknij podpowiedź');close.textContent='✕';close.addEventListener('click',()=>{aiRequests.get('mic-general')?.abort();stopVoice();closeMicBubble()});
 heading.append(title,close);
 const text=document.createElement('p');text.textContent=answer;
 const replay=document.createElement('button');replay.type='button';replay.className='mic-answer-replay';replay.textContent='🔊 Odsłuchaj ponownie';replay.addEventListener('click',()=>speak(answer,'pl-PL',profile().mentor));
 box.append(heading,text,replay);document.body.appendChild(box);if(readAloud)speak(answer,'pl-PL',profile().mentor);
}
async function helpWithExerciseAI(question){
 const exercise=practice;
 const exerciseBox=document.getElementById('exercise');
 if(!exercise||!exerciseBox)return;
 const style=profile().mentor==='fun'?'fun':'tech';
 const choices=[...document.querySelectorAll('#exercise [data-choice]')].map(b=>b.dataset.choice);
 const context=[
  'Jesteś nauczycielem pomagającym dziecku w ćwiczeniu.',
  'Aktualne zadanie: '+exercise.question,
  'Rodzaj ćwiczenia: '+exercise.kind,
  'Odpowiedzi do wyboru: '+choices.join(', '),
  'Nie podawaj od razu poprawnej odpowiedzi.',
  'Wyjaśniaj prosto, krok po kroku.',
  'Prośba dziecka: '+question
 ].join('\n');
 let bubble=document.getElementById('ai-exercise-help');
 if(!bubble){bubble=document.createElement('div');bubble.id='ai-exercise-help';bubble.className='card';exerciseBox.appendChild(bubble)}
 bubble.textContent='⏳ Mentor zastanawia się...';
 const controller=beginAIRequest('exercise');
 const expectedWho=who;
 const isCurrent=()=>!controller.signal.aborted&&who===expectedWho&&practice===exercise&&exerciseBox.isConnected&&document.getElementById('exercise')===exerciseBox&&bubble.isConnected;
 try{
  const answer=await askMentorAI(context,style,[],controller.signal);
  if(!isCurrent())return;
  bubble.textContent=answer;
  speak(answer,'pl-PL',style);
 }catch(error){
  if(isCurrent()){console.warn('Ćwiczenie AI:',error);bubble.textContent=AI_FRIENDLY_MESSAGE}
 }finally{finishAIRequest('exercise',controller)}
}
async function helpWithGeneralAI(question){
 const style=profile().mentor==='fun'?'fun':'tech';
 const screen=document.querySelector('main');
 const visibleText=String(screen?.innerText||'').replace(/\s+/g,' ').slice(0,150);
 const expectedTab=tab,expectedWho=who;
 const controller=beginAIRequest('mic-general');
 const isCurrent=()=>!controller.signal.aborted&&tab===expectedTab&&who===expectedWho&&document.querySelector('main')===screen;
 showMicBubble('⏳ Mentor zastanawia się...',false);
 try{
  const answer=await askMentorAI('Pytanie dziecka: '+question.slice(0,390)+'\nOdpowiedz wprost na pytanie, bez przywitania i bez proponowania menu.\nTekst ekranu (wyłącznie pomocniczo): '+visibleText,style,[],controller.signal);
  if(!isCurrent())return;
  showMicBubble(answer);
 }catch(error){
  if(isCurrent()){console.warn('Mikrofon AI:',error);closeMicBubble();note(AI_FRIENDLY_MESSAGE)}
 }finally{finishAIRequest('mic-general',controller)}
}
let micDragIgnoreClick=false;
function installMicDrag(){
 const mic=document.querySelector('.mic');if(!mic)return;
 let saved=null;try{saved=JSON.parse(localStorage.getItem('academy-v70-mic-position')||'null')}catch{}
 const putPos=(x,y)=>{const w=window.visualViewport?.width||innerWidth,h=window.visualViewport?.height||innerHeight;
  mic.style.left=Math.max(0,Math.min(w-mic.offsetWidth,x))+'px';mic.style.top=Math.max(0,Math.min(h-mic.offsetHeight,y))+'px';mic.style.right='auto';mic.style.bottom='auto';};
 if(saved&&Number.isFinite(saved.x)&&Number.isFinite(saved.y))putPos(saved.x,saved.y);
 let t=null,start=null,dragged=false,held=false;
 const finish=()=>{clearTimeout(t);if(held){if(dragged)try{localStorage.setItem('academy-v70-mic-position',JSON.stringify({x:mic.offsetLeft,y:mic.offsetTop}))}catch{}micDragIgnoreClick=true;setTimeout(()=>{micDragIgnoreClick=false},350)}
  mic.classList.remove('mic-moving');start=null;dragged=false;held=false;};
 mic.addEventListener('pointerdown',ev=>{if(ev.pointerType==='mouse'&&ev.button!==0)return;
  clearTimeout(t);dragged=false;held=false;start={id:ev.pointerId,x:ev.clientX,y:ev.clientY,left:mic.getBoundingClientRect().left,top:mic.getBoundingClientRect().top};
  try{mic.setPointerCapture(ev.pointerId)}catch{}
  t=setTimeout(()=>{if(start){held=true;micDragIgnoreClick=true;mic.classList.add('mic-moving')}},380);
 });
 mic.addEventListener('pointermove',ev=>{if(!start||start.id!==ev.pointerId)return;
  const dx=ev.clientX-start.x,dy=ev.clientY-start.y;
  if(!held){if(Math.abs(dx)+Math.abs(dy)>24){clearTimeout(t);start=null}return;}
  if(Math.abs(dx)+Math.abs(dy)>3)dragged=true;
  putPos(start.left+dx,start.top+dy);
 });
 mic.addEventListener('pointerup',finish);mic.addEventListener('pointercancel',finish);
 window.addEventListener('resize',()=>{const x=parseFloat(mic.style.left),y=parseFloat(mic.style.top);if(Number.isFinite(x)&&Number.isFinite(y))putPos(x,y)},{passive:true});
}
function microphone(){
 if(getVoiceState()!=='idle'||window.speechSynthesis?.speaking||window.speechSynthesis?.pending){cancelAIRequests();stopVoice();return;}

 const answer=q=>{
  const question=String(q||'').trim();
  if(!question)return;

  if(tab==='mentor' && $('question')){
   $('question').value=question;
   const output=$('mentoranswer');
   if(output)output.textContent='🎙️ Usłyszałem: '+question;
   handle('mentor:answer');
   return;
  }

  if(document.querySelector('.mg-tutor')){document.dispatchEvent(new CustomEvent('academy:tutor-question',{detail:{question}}));return;}

  if(practice && document.getElementById('exercise')){
   helpWithExerciseAI(question);
   return;
  }

  helpWithGeneralAI(question);
 };

 listen(answer,()=>{
  const q=prompt('🎙️ Nie usłyszałem pytania. Możesz je tutaj wpisać:');
  if(q)answer(q);
 });
}

document.addEventListener('toggle',ev=>{
 const group=ev.target;if(!group?.matches?.('.v75-review .v74-review-page')||!group.open)return;
 for(const image of group.querySelectorAll('[data-v75-lazy-image]')){
  const id=image.dataset.v75LazyImage;if(!id||image.dataset.v75Loading)return;
  image.dataset.v75Loading='1';img(id).then(url=>{if(image.isConnected&&url){image.src=url;image.onload=()=>URL.revokeObjectURL(url)}}).catch(err=>console.warn('Nie udało się wyświetlić zdjęcia strony',err));
 }
},true);
document.addEventListener('click',ev=>{const btn=ev.target.closest('[data-action]');if(btn){if(ev.target.closest('[data-speak]'))return;if(btn.dataset.action==='mic'&&micDragIgnoreClick){ev.preventDefault();ev.stopPropagation();return}if(btn.classList.contains('tr72-subject-card')){if(btn.dataset.opening)return;btn.dataset.opening='1';btn.classList.add('tr72-selected');trainingTapSound();setTimeout(()=>{if(btn.isConnected)handle(btn.dataset.action,btn)},['matematyka','przyroda','wiedza'].includes(btn.dataset.theme)?1150:480);return}if(btn.closest('.tr71')&&/^training:(source|mode):/.test(btn.dataset.action||'')){if(btn.dataset.opening)return;btn.dataset.opening='1';btn.classList.add('v76-tile-pressed');btn.setAttribute('aria-busy','true');trainingTapSound();setTimeout(()=>{if(btn.isConnected)handle(btn.dataset.action,btn)},280);return}if(btn.closest('.tr71')&&btn.dataset.action?.startsWith('training:')&&btn.dataset.action!=='training:toggle-sound')trainingTapSound();handle(btn.dataset.action,btn)}});
document.addEventListener('input',ev=>{const box=ev.target.closest('[data-v74-edit]');if(!box||!ev.target.matches('[data-v74-field],[data-v75-field]'))return;const key=decodeURIComponent(box.dataset.v74Edit||'');const btn=box.querySelector('[data-action^="book:save-question:"]');if(btn)btn.disabled=!v74QuestionModified(box,key);});
document.addEventListener('change',ev=>{if(ev.target.matches('[data-tr71-page],[data-tr71-book],[data-tr71-chapter]'))return trainingSelectionChange(ev.target);if(ev.target.matches('[data-page-select]'))updateBookPageSelection();if(ev.target.id==='bchild')refreshBookSubjectSelect();if(ev.target.id==='btype'){const other=ev.target.value==='Inne';const a=$('v73-book-title'),b=$('v73-book-part');if(a)a.hidden=!other;if(b)b.hidden=other;}if(ev.target.id==='page-filter')filterBookPages(ev.target.value);if(ev.target.id==='v74-report-child')v74UpdateReportFilter();if(ev.target.id==='booknumberlocation'){const b=data.books.find(x=>x.id===bookId);if(b){b.pageNumberPosition=ev.target.value;save().then(()=>note('✅ Zapisano położenie numeru strony.')).catch(err=>note('❌ '+err.message))}}if(ev.target.id==='replacefile'&&ev.target.files?.length)handle('page:replace');if(ev.target.id==='replacecamera'&&ev.target.files?.length)handle('page:replace-camera');if(ev.target.id==='bookcoverfile'&&ev.target.files?.length)handle('book:cover');if(ev.target.id==='pagefiles'&&ev.target.files?.length)handle('page:upload');if(ev.target.id==='pagecamera'&&ev.target.files?.length)handle('page:camera');if(ev.target.id==='trainingSubject')trainingChooseSubject(ev.target.value);if(ev.target.id==='kind')newExercise();if(ev.target.id==='booktrainingpage')bookExercise();if(ev.target.id==='tracechar')drawTrace();if(ev.target.id==='readerpage'){pageId=ev.target.value;render()}if(ev.target.id==='mentorstyle'){profile().mentor=ev.target.value;save()}});
// V76_PANEL: zachowujemy kolejnosc Dodaj -> Biblioteka -> Trudnosci -> Baza poza.
const v76OpenSections=new Set();
const v76Q={level:'pages',page:null,key:null,subject:'',selected:new Set(),numbers:new Map(),scroll:0,last:null};
let v76ReportShown=false,v76ReportChild='pawel';
function v76Audience(b){return Array.isArray(b.audience)?b.audience.filter(x=>people.some(p=>p[0]===x)):[...new Set([b.child,...(b.sharedWith||[])])].filter(x=>people.some(p=>p[0]===x))}
function v76AudienceControls(b=null){const checked=new Set(b?v76Audience(b):[]);return '<fieldset class="v76-audience"><legend>Udostępnij dzieciom</legend>'+v76Info('Podręcznik zostaje we wspólnej bazie. Zaznacz jedno dziecko, oboje albo żadne. Zdjęcia są zapisane tylko raz.')+people.map(([id,name])=>`<label><input type="checkbox" data-v76-audience="${e(id)}" ${checked.has(id)?'checked':''}> ${e(name)}</label>`).join('')+'</fieldset>'}
function v76ChosenAudience(){return [...document.querySelectorAll('[data-v76-audience]:checked')].map(x=>x.dataset.v76Audience)}
function v76AudienceText(b){const ids=v76Audience(b);return ids.length?ids.map(id=>data.profiles[id]?.name||id).join(' i '):'Tylko w bazie'}
function v76BookSubjectSelect(value='Polski'){return select('bsubject','Przedmiot',[...new Set([...DEFAULT_SUBJECTS,...data.books.map(b=>b.subject).filter(Boolean)])].map(x=>[x,x]),value)}
function v76Info(text){return `<details class="v76-info"><summary aria-label="Więcej informacji"><span aria-hidden="true">i</span></summary><div>${e(text)}</div></details>`}
function v76Fold(id,title,content,sub=''){return `<details class="card v76-section" data-v76-section="${id}" ${v76OpenSections.has(id)?'open':''}><summary><strong>${title}</strong>${sub?'<small>'+sub+'</small>':''}<span class="v76-chevron" aria-hidden="true">›</span></summary><div class="v76-section-content">${content}</div></details>`}
function v76ReportMarkup(){
 const rows=[];for(const b of data.books)for(const [child] of people){try{const a=JSON.parse(localStorage.getItem('academy-v53-stats-'+child+'-'+b.id)||'[]');if(Array.isArray(a))for(const x of a)rows.push({...x,child,book:b.title})}catch{}}
 rows.sort((a,b)=>String(b.date||'').localeCompare(String(a.date||'')));
 return select('v76-report-child','Dziecko',people,v76ReportChild)+`<div class="v76-actions">${button('Pokaż','v76:report-show','gold')}${button('🗑 Wyczyść raport','v76:report-clear','line')}</div>`+v76Info('Wyczyść raport usuwa tylko historię trudnych prób wybranego dziecka. Książki, zdjęcia, pytania i punkty pozostają.')+(v76ReportShown?rows.filter(x=>x.child===v76ReportChild).slice(0,40).map(x=>`<div class="item"><div><b>${e(x.book)} · strona ${e(x.page||'—')}</b><p>${e(x.question||'')}</p><small>${e(x.reason||'')}</small></div></div>`).join('')||'<p class="muted">Brak zapisanych trudności.</p>':'');
}
function v76LibraryCount(){const n=data.books.length;return n+' '+(n===1?'podręcznik':n%10>=2&&n%10<=4&&(n%100<12||n%100>14)?'podręczniki':'podręczników')}
function v76HomeMarkup(){
 const add=`<input type="hidden" id="bchild" value="pawel">${select('bgrade','Klasa',grades,'2')}${v76BookSubjectSelect()}<label for="btype">Rodzaj materiału</label><select id="btype"><option value="Podręcznik">Podręcznik</option><option value="Ćwiczenia">Zeszyt ćwiczeń</option><option value="Inne">Inny materiał</option></select>${v73BookFields()}${v76AudienceControls()}${button('Zapisz','book:add','gold')}`;
 const library=data.books.map(b=>`<div class="item"><div><b>${e(b.title)}</b><small>${e(b.subject)} · ${gradeName(b.grade)} · ${e(v76AudienceText(b))} · ${dataPageCount(b.id)} stron${b.archived?' · archiwum':''}</small></div>${button('Otwórz','book:open:'+b.id)}</div>`).join('')||'<p class="muted">Brak książek.</p>';
 const outside=v75OutsidePanel().replace(/^<section[^>]*><h2>[\s\S]*?<\/h2>/,'').replace(/<\/section>$/,'').replace(/<p>Oddzielna baza[\s\S]*?<\/p>/,v76Info('Pytania poza podręcznikami pozostają oddzielne dla dziecka i przedmiotu. Przed użyciem możesz je przejrzeć i usunąć.'));
 return v76Fold('home-add','＋ Dodaj podręcznik',add)+v76Fold('home-library','📚 Biblioteka','<h3>Wybierz książkę</h3>'+library,v76LibraryCount())+v76Fold('home-report','📋 Trudności w nauce',v76ReportMarkup())+v76Fold('home-outside','⚡ Baza pytań poza podręcznikami',outside);
}
// V76 korekta 2: zachowane elementy i rzedy V74, zmienione tylko obramowanie sekcji.
function v76BookFold(id,title,body,classes='v74-chapter-details'){
 return `<details class="${classes} v76-book-fold" data-v76-section="${id}" ${v76OpenSections.has(id)?'open':''}><summary>${title}</summary><div class="v76-book-fold-body">${body}</div></details>`;
}
function v76BookMarkup(b){
 const original=v74BookMarkup(b);
 const cut=(a,z)=>{const i=original.indexOf(a);if(i<0)throw Error('Brak sekcji książki: '+a);const j=original.indexOf(z,i+a.length);if(j<0)throw Error('Niepełna sekcja książki.');return original.slice(i+a.length,j)};
 const add='<section class="v74-book-add"><h3>📷 Dodaj wiele stron naraz</h3>';
 let header=original.slice(0,original.indexOf(add));
 header=header.replace(select('bchild','Dziecko',people,b.child),`<input type="hidden" id="bchild" value="${e(b.child||'pawel')}">`).replace(bookSubjectSelect(b.child,b.subject),v76BookSubjectSelect(b.subject)).replace(v75ShareControls(b),v76AudienceControls(b));
 const upload=cut(add,'<details class="v74-chapter-details">');
 const assign=cut('<details class="v74-chapter-details"><summary>📚 Przypisz istniejące strony do działu</summary>','</details>');
 let ocr=cut('<section class="v74-book-ocr"><h3>✨ Odczytaj zdjęcia przez AI</h3>','</section>');
 ocr=ocr.replace('<small>AI pomija strony z zapisanym tekstem. Nieudany odczyt można ponowić w edytorze strony.</small>',v76Info('AI pomija strony z zapisanym tekstem. Nieudany odczyt można ponowić w edytorze strony.')).replace('<small>To ustawienie zapisuje się po zmianie. AI będzie szukało numeru we wskazanej części zdjęcia.</small>',v76Info('To ustawienie zapisuje się po zmianie. AI będzie szukało numeru we wskazanej części zdjęcia.'));
 ocr=ocr.replace(/<label for="booknumberlocation">[\s\S]*?<\/label>(<select id="booknumberlocation">[\s\S]*?<\/select>)/,'<details class="v76-location"><summary>📄 Gdzie szukać drukowanego numeru strony?</summary><label for="booknumberlocation">Położenie numeru</label>$1</details>');
 let bank=cut('<section class="admin-question-bank v74-bank"><h3>🧠 Baza pytań z podręcznika</h3>','</section>');
 bank=bank.replace('🔎 Sprawdź pytania AI','🔎 Przejrzyj i popraw pytania').replace('<p id="book-question-progress" role="status" aria-live="polite">Generowanie obejmuje zatwierdzone strony. Pytania zapisują się osobno dla każdej strony.</p>','<p id="book-question-progress" role="status" aria-live="polite"></p>'+v76Info('Generowanie obejmuje zatwierdzone strony. Pytania zapisują się osobno dla każdej strony.'));
 const pages=cut('<section class="card v74-pages"><h2>📄 Strony podręcznika</h2>','</section>');
 return header+v76BookFold('book-upload','📷 Dodaj strony',upload)+v76BookFold('book-assign','📚 Przypisz istniejące strony do działu',assign)+v76BookFold('book-ocr','✨ Odczytaj tekst ze stron',ocr)+v76BookFold('book-bank','🧠 Stwórz bazę pytań',bank)+'</section>'+v76BookFold('book-pages','📄 Strony podręcznika',pages,'card v74-pages');
}

function v76QGroups(b){const bank=bookBankItems(b),ps=sortedBookPages(b.id),groups=ps.map(p=>({p,items:bank.filter(x=>v75BankMatchesPage(x,p))})).filter(g=>g.items.length),used=new Set(groups.flatMap(g=>g.items.map(x=>String(x.key))));if(bank.some(x=>!used.has(String(x.key))))groups.push({p:{id:'unassigned',number:'bez przypisania'},items:bank.filter(x=>!used.has(String(x.key)))});return groups}
function v76QNumbers(b,p,items){const group=b.id+'|'+p.id;if(!v76Q.numbers.has(group))v76Q.numbers.set(group,new Map());const map=v76Q.numbers.get(group);for(const item of items)if(!map.has(String(item.key)))map.set(String(item.key),Math.max(0,...map.values())+1);return map}
function v76QSource(p){if(!p||p.id==='unassigned')return '';return `<div class="v76-qsource"><img data-image="${e(p.imageId)}" alt="Zdjęcie strony ${e(p.number)}">${v76Fold('q-source-text','📖 Rozpoznany tekst',`<div class="v75-source-text">${e(p.text||'')}</div>`)}</div>`}
function v76QToolbar(){return `<div class="v76-qtoolbar"><div class="v76-actions">${button('Zaznacz wszystkie','v76:q-all')}${button('Odznacz wszystkie','v76:q-none')}</div>${button('🗑 Usuń zaznaczone pytania','v76:q-delete','line')}<small>Zaznaczono: ${v76Q.selected.size} pytań</small></div>`}
function v76ReviewPicker(){const subjects=[...new Set(data.books.map(b=>b.subject).filter(Boolean))];return `<section class="card v76-picker">${button('← Biblioteka','admin:books')}<h2>🔎 Przeglądaj pytania</h2>${select('v76-qsubject','Najpierw wybierz przedmiot',[['','Wybierz przedmiot'],...subjects.map(x=>[x,x])],v76Q.subject)}${v76Q.subject?select('v76-qbook','Następnie wybierz podręcznik',[['','Wybierz podręcznik'],...data.books.filter(b=>b.subject===v76Q.subject).map(b=>[b.id,b.title])],bookId)+button('Przejrzyj pytania','v76:q-open','gold'):''}</section>`}
function v76QuestionView(b){
 if(v76Q.level==='picker')return v76ReviewPicker();
 const groups=v76QGroups(b),bank=bookBankItems(b),group=groups.find(g=>String(g.p.id)===String(v76Q.page));
 const back=button('← Podręcznik','admin:book');
 if(v76Q.level==='edit'&&group){const item=group.items.find(x=>String(x.key)===String(v76Q.key));if(!item){v76Q.level='questions';return v76QuestionView(b)}const n=v76QNumbers(b,group.p,group.items).get(String(item.key));let editor=v75QuestionRow(item,group.p).replace(/<label class="v75-bank-check">[\s\S]*?<\/label>/,'').replace(/<details class="v74-question"><summary>[\s\S]*?<\/summary>/,'<div class="v74-question">').replace(/<\/details><\/div>$/,'</div></div>');if(!item.v75Flagged)editor=editor.replace('<label>Pytanie',button('🤖 Zaproponuj poprawkę AI','v75:questions:suggest:'+encodeURIComponent(String(item.key)))+'<label>Pytanie');return `<section class="card v76-question-edit">${button('← Strona '+group.p.number+' · lista pytań','v76:q-back')}<h2>Pytanie ${n}</h2><span class="v76-kind">${e(item.task?.type||'pytanie')}</span>${v76QSource(group.p)}${editor}</section>`}
 if(v76Q.level==='questions'&&group){const numbers=v76QNumbers(b,group.p,group.items);return `<section class="card v76-question-page">${button('← '+b.title+' · wszystkie strony','v76:q-pages')}<h2>Strona ${e(group.p.number)}</h2>${v76QSource(group.p)}${v76Fold('q-list','🔎 Rozwiń pytania z tej strony',v76QToolbar()+group.items.map(item=>{const key=String(item.key),n=numbers.get(key);return `<div class="v76-qrow ${v76Q.last===key?'v76-visited':''}"><label><input type="checkbox" data-v76-qcheck="${e(encodeURIComponent(key))}" aria-label="Zaznacz pytanie ${n}" ${v76Q.selected.has(key)?'checked':''}></label><button type="button" data-action="v76:q-edit:${encodeURIComponent(key)}"><b>${n}.</b><span>${e(item.task?.question||'Bez pytania')}<small>${item.v75Flagged?'⚠ Do poprawy · ':''}${e(item.task?.type||'pytanie')}${item.v76Review?' · '+item.v76Review.count+' z 3 AI':''}${v76Q.last===key?' · ostatnio oglądane':''}</small></span><i aria-hidden="true">›</i></button></div>`}).join(''))}</section>`}
 v76Q.level='pages';return `<section class="card v76-question-pages">${back}<h2>🔎 Przeglądaj i popraw pytania</h2><p>${e(b.subject)} · ${e(b.title)} · ${bank.length} pytań</p><div class="v76-actions">${button('🤖 Sprawdź jakość pytań','v75:questions:ai','gold')}${button('⏸ Zatrzymaj','v75:questions:stop')}${button('Kontrola techniczna','v75:questions:check')}</div><small class="v75-review-progress" role="status">Wynik jest zapisywany przy co najmniej dwóch prawidłowych raportach AI.</small>${v76Info('Gdy odpowiedzą trzy modele, zobaczysz 3 z 3. Gdy jeden jest niedostępny, wystarczą dwa prawidłowe raporty. Przy jednym lub zerze nie oznaczamy pytań jako sprawdzonych. AI wskazuje propozycje do Twojej weryfikacji, nie poprawia pytań automatycznie.')}${v76QToolbar()}${groups.map(g=>`<div class="v76-page-choice"><label><input type="checkbox" data-v76-pagecheck="${e(g.p.id)}" aria-label="Zaznacz pytania ze strony ${e(g.p.number)}" ${g.items.every(x=>v76Q.selected.has(String(x.key)))?'checked':''}></label><button type="button" data-action="v76:q-page:${encodeURIComponent(g.p.id)}"><span class="v76-page-thumb">📄</span><span><b>Strona ${e(g.p.number)}</b><small>${g.items.length} pytań</small></span><i aria-hidden="true">›</i></button></div>`).join('')||'<p>Brak pytań w tym podręczniku.</p>'}</section>`;
}
async function v76Action(action,target){
 if(action.startsWith('v76:outside-'))return v76OutsideAction(action);
 if(action==='v76:question-picker'){v76Q.level='picker';adminTab='question-review';render();return}
 if(action==='v76:q-open'){const id=$('v76-qbook')?.value;if(!id)return note('Wybierz podręcznik.');bookId=id;v76Q.level='pages';v76Q.selected.clear();render();return}
 if(action==='v76:q-pages'){v76Q.level='pages';render();return}
 if(action.startsWith('v76:q-page:')){v76Q.page=decodeURIComponent(action.slice('v76:q-page:'.length));v76Q.level='questions';v76Q.selected.clear();v76OpenSections.delete('q-list');render();return}
 if(action.startsWith('v76:q-edit:')){v76Q.key=decodeURIComponent(action.slice('v76:q-edit:'.length));v76Q.last=v76Q.key;v76Q.scroll=window.scrollY||0;v76Q.level='edit';render();return}
 if(action==='v76:q-back'){v76Q.level='questions';v76OpenSections.add('q-list');render();requestAnimationFrame(()=>window.scrollTo(0,v76Q.scroll));return}
 if(action==='v76:q-all'||action==='v76:q-none'){const b=data.books.find(x=>x.id===bookId),groups=v76QGroups(b);const items=v76Q.level==='questions'?(groups.find(g=>String(g.p.id)===String(v76Q.page))?.items||[]):bookBankItems(b);for(const x of items){if(action==='v76:q-all')v76Q.selected.add(String(x.key));else v76Q.selected.delete(String(x.key))}render();return}
 if(action==='v76:q-delete'){const b=data.books.find(x=>x.id===bookId),bank=bookBankItems(b),count=bank.filter(x=>v76Q.selected.has(String(x.key))).length;if(!count)return note('Zaznacz pytania do usunięcia.');if(!confirm('Usunąć '+count+' zaznaczonych pytań? Zdjęcia i teksty stron pozostaną.'))return;localStorage.setItem('academy-v48-bank-'+b.child+'-'+b.id,JSON.stringify(bank.filter(x=>!v76Q.selected.has(String(x.key)))));v76Q.selected.clear();render();note('✅ Usunięto '+count+' pytań. Zdjęcia i teksty pozostały.');return}
 if(action==='v76:report-show'){v76ReportChild=$('v76-report-child')?.value||v76ReportChild;v76ReportShown=true;render();return}
 if(action==='v76:report-clear'){const id=$('v76-report-child')?.value||v76ReportChild;if(!confirm('Wyczyścić raport dla '+(data.profiles[id]?.name||id)+'? Książki, pytania i punkty pozostaną.'))return;for(const b of data.books)localStorage.removeItem('academy-v53-stats-'+id+'-'+b.id);v76ReportShown=true;v76ReportChild=id;render();note('✅ Wyczyszczono raport wybranego dziecka.');return}
}
function v76MicPaint(){const state=getVoiceState(),label={idle:'Zadaj pytanie',starting:'Uruchamiam…',listening:'Słucham…',thinking:'Myślę…',speaking:'Mówię…'}[state]||'Zadaj pytanie';for(const mic of document.querySelectorAll('.mic')){mic.dataset.state=state;mic.setAttribute('aria-label',state==='idle'?'Nagraj pytanie':state==='listening'?'Zatrzymaj nagrywanie':'Przerwij odpowiedź lub oczekiwanie');if(!mic.querySelector('.v76-mic-glyph'))mic.innerHTML='<span class="v76-mic-glyph" aria-hidden="true">🎙️</span><small class="v76-mic-label" aria-live="polite"></small>';const el=mic.querySelector('.v76-mic-label');if(el)el.textContent=label}}
function v76AfterRender(){
 v76MicPaint();
 if($('v75-outside-child')){$('v75-outside-child').value=v76Outside.child;$('v75-outside-subject').value=v76Outside.subject;if(v76Outside.shown)v76OutsideShow()}
 // Dlugie informacje przenosimy pod i. Statusy operacji pozostaja widoczne.
 const informational=/^(Tryb lokalny:|Zdalne zgłoszenia|PIN-y chronią|Każda strona to|Generowanie obejmuje|AI pomija|To ustawienie|Wyczyść raport usuwa)/;
 for(const el of document.querySelectorAll('p,small')){if(el.closest('.v76-info')||el.hasAttribute('role')||!informational.test(el.textContent.trim()))continue;const d=document.createElement('details');d.className='v76-info';const summary=document.createElement('summary');summary.innerHTML='<span aria-hidden="true">i</span>';d.appendChild(summary);el.replaceWith(d);d.appendChild(el)}
 for(const el of document.querySelectorAll('#bulkocrstatus,#book-question-progress'))if(/zakończ|gotow|ukończ/i.test(el.textContent))el.classList.add('v76-complete');
}
document.addEventListener('academy:voice-state',v76MicPaint);
document.addEventListener('toggle',ev=>{const el=ev.target,id=el?.dataset?.v76Section;if(!id)return;if(el.open)v76OpenSections.add(id);else v76OpenSections.delete(id)},true);
document.addEventListener('change',ev=>{
 const el=ev.target;
 if(el.id==='v76-report-child'){v76ReportChild=el.value;v76ReportShown=false;render()}
 if(el.id==='v76-qsubject'){v76Q.subject=el.value;bookId='';render()}
 if(el.dataset.v76Qcheck!==undefined){const key=decodeURIComponent(el.dataset.v76Qcheck);el.checked?v76Q.selected.add(key):v76Q.selected.delete(key);render()}
 if(el.dataset.v76Pagecheck!==undefined){const b=data.books.find(x=>x.id===bookId),g=v76QGroups(b).find(g=>String(g.p.id)===el.dataset.v76Pagecheck);if(g)for(const item of g.items){el.checked?v76Q.selected.add(String(item.key)):v76Q.selected.delete(String(item.key))}render()}
});

// Baza poza podrecznikami: zaznaczanie, szczegoly i edycja prawdziwych zapisanych rekordow.
const v76Outside={child:'pawel',subject:'polski',shown:false,scope:'',selected:new Set(),detail:null,last:null,scroll:0,status:''};
const v76OutsideKey=t=>JSON.stringify([t?.q,t?.a,t?.ok]);
function v76OutsideScope(){
 const ch=$('v75-outside-child')?.value||v76Outside.child,sub=$('v75-outside-subject')?.value||v76Outside.subject,key=ch+'|'+sub;
 if(v76Outside.scope!==key){v76Outside.scope=key;v76Outside.selected.clear();v76Outside.detail=null;v76Outside.last=null;v76Outside.status=''}
 v76Outside.child=ch;v76Outside.subject=sub;return {ch,sub,items:v75OutsideBank(ch,sub)};
}
function v76OutsideShow(){
 const el=$('v75-outside-results');if(!el)return;v76Outside.shown=true;const {items}=v76OutsideScope();
 const item=items.find(t=>v76OutsideKey(t)===v76Outside.detail);
 const status=v76Outside.status?`<p role="status" class="v76-complete">${e(v76Outside.status)}</p>`:'';
 if(item){const options=Array.isArray(item.a)?item.a:[];
  el.innerHTML=status+button('← Wróć do listy pytań','v76:outside-back')+`<h3>Pytanie ${items.indexOf(item)+1}</h3><label for="v76-outside-q">Treść pytania</label><textarea id="v76-outside-q" rows="3">${e(item.q||'')}</textarea>`+Array.from({length:3},(_,i)=>input('v76-outside-a'+i,'Odpowiedź '+(i+1),options[i]||'')).join('')+select('v76-outside-ok','Prawidłowa odpowiedź',[[0,'1'],[1,'2'],[2,'3']],Number(item.ok))+`<div class="v76-actions">${button('Zapisz','v76:outside-save','gold')}${button('Anuluj','v76:outside-cancel')}</div>`+button('🗑 Usuń to pytanie','v76:outside-delete-one','line');return;
 }
 v76Outside.detail=null;const count=items.filter(t=>v76Outside.selected.has(v76OutsideKey(t))).length;
 el.innerHTML=status+`<h3>Pytania: ${items.length}</h3>`+(items.length?`<div class="v76-qtoolbar"><div class="v76-actions">${button('Zaznacz wszystkie','v76:outside-all')}${button('Odznacz wszystkie','v76:outside-none')}</div>${button('🗑 Usuń zaznaczone pytania','v76:outside-delete','line')}<small>Zaznaczono: ${count}</small></div>`+items.map((t,i)=>{const key=v76OutsideKey(t),encoded=encodeURIComponent(key);return `<div class="v76-qrow ${v76Outside.last===key?'v76-visited':''}"><label><input type="checkbox" data-v76-outside-check="${e(encoded)}" aria-label="Zaznacz pytanie ${i+1}" ${v76Outside.selected.has(key)?'checked':''}></label><button type="button" data-action="v76:outside-open:${e(encoded)}"><b>${i+1}.</b><span>${e(t.q||'Bez treści')}<small>Naciśnij, aby przejrzeć lub poprawić</small></span><i aria-hidden="true">›</i></button></div>`}).join(''):'<p class="muted">Brak pytań. Wygeneruj propozycje dla wybranego dziecka i przedmiotu.</p>');
}
async function v76OutsideAction(action){
 const {ch,sub,items}=v76OutsideScope();
 if(action.startsWith('v76:outside-open:')){v76Outside.detail=decodeURIComponent(action.slice('v76:outside-open:'.length));v76Outside.last=v76Outside.detail;v76Outside.scroll=window.scrollY||0;return v76OutsideShow()}
 if(action==='v76:outside-back'){v76Outside.detail=null;v76OutsideShow();requestAnimationFrame(()=>window.scrollTo(0,v76Outside.scroll));return}
 if(action==='v76:outside-all'||action==='v76:outside-none'){v76Outside.selected=action.endsWith('-all')?new Set(items.map(v76OutsideKey)):new Set();return v76OutsideShow()}
 if(action==='v76:outside-cancel')return v76OutsideShow();
 if(action==='v76:outside-save'){
  const at=items.findIndex(t=>v76OutsideKey(t)===v76Outside.detail);if(at<0)return note('Nie znaleziono pytania.');
  const q=$('v76-outside-q')?.value.trim()||'',a=[0,1,2].map(i=>$('v76-outside-a'+i)?.value.trim()||''),ok=Number($('v76-outside-ok')?.value);
  if(!q||a.some(x=>!x)||new Set(a.map(x=>x.toLocaleLowerCase('pl-PL'))).size!==3||!Number.isInteger(ok)||ok<0||ok>2)return note('Wpisz pytanie, trzy różne odpowiedzi i wskaż prawidłową.');
  const old=v76Outside.detail,wasSelected=v76Outside.selected.delete(old);items[at]={...items[at],q,a,ok};const key=v76OutsideKey(items[at]);v76Outside.detail=key;v76Outside.last=key;if(wasSelected)v76Outside.selected.add(key);localStorage.setItem(v75OutsideKey(ch,sub),JSON.stringify(items));v76Outside.status='✅ Zapisano poprawione pytanie.';return v76OutsideShow();
 }
 if(action==='v76:outside-delete'||action==='v76:outside-delete-one'){
  const chosen=action.endsWith('-one')?new Set([v76Outside.detail]):v76Outside.selected,count=items.filter(t=>chosen.has(v76OutsideKey(t))).length;
  if(!count)return note('Zaznacz pytania do usunięcia.');if(!confirm('Usunąć '+count+' pytań z tej bazy?'))return;
  localStorage.setItem(v75OutsideKey(ch,sub),JSON.stringify(items.filter(t=>!chosen.has(v76OutsideKey(t)))));v76Outside.selected.clear();v76Outside.detail=null;v76Outside.status='✅ Usunięto '+count+' pytań.';return v76OutsideShow();
 }
}
document.addEventListener('change',ev=>{
 const el=ev.target;
 if(el.dataset.v76OutsideCheck!==undefined){const key=decodeURIComponent(el.dataset.v76OutsideCheck);el.checked?v76Outside.selected.add(key):v76Outside.selected.delete(key);v76OutsideShow()}
 if(['v75-outside-child','v75-outside-subject'].includes(el.id)){v76OutsideScope();if(v76Outside.shown)v76OutsideShow()}
});

async function start(){try{data=await get('state')||initial();data.bookPages??=[];data.settings.rate??=1;data.settings.songs??=[];await save();render();if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js').catch(console.warn)}catch(err){app.innerHTML=`<main class="wrap"><section class="card"><h2>Nie udało się uruchomić Akademii</h2><p>${e(err.message)}</p><p>Włącz przechowywanie danych w przeglądarce i otwórz stronę ponownie.</p></section></main>`}}
start();

// V24: interaktywny podgląd bazy, bez ingerencji w postępy i zakupy.
(function(){
 const roomCenters={lab:[.25,.28],armory:[.72,.28],hangar:[.25,.73],team:[.72,.73]};
 const names={lab:'🔬 Laboratorium',armory:'🛡️ Zbrojownia',hangar:'🚀 Hangar',team:'🦸 Sala drużyny'};
 const state=new WeakMap();
 function setup(root){if(state.has(root))return state.get(root);const view=root.querySelector('[data-base-viewport]'),world=root.querySelector('[data-base-world]');const s={scale:1,x:0,y:0,pointer:null,moved:false};state.set(root,s);
 const paint=()=>{world.style.transform=`translate(${s.x}px,${s.y}px) scale(${s.scale})`};
 const reset=()=>{s.scale=1;s.x=0;s.y=0;paint()};
 const zoom=(factor)=>{const old=s.scale;s.scale=Math.max(1,Math.min(3.2,s.scale*factor));const w=view.clientWidth,h=view.clientHeight;s.x=w/2-(w/2-s.x)*s.scale/old;s.y=h/2-(h/2-s.y)*s.scale/old;paint()};
 const focus=(room)=>{if(!roomCenters[room])return;s.scale=2;const [rx,ry]=roomCenters[room];s.x=view.clientWidth*(.5-rx*s.scale);s.y=view.clientHeight*(.5-ry*s.scale);paint();root.querySelectorAll('[data-base-room]').forEach(b=>b.classList.toggle('selected',b.dataset.baseRoom===room));let inv={};try{inv=JSON.parse(decodeURIComponent(root.dataset.inventory||''))}catch{};const owned=inv[room]||[];root.querySelector('[data-base-info]').textContent=names[room]+' — '+(owned.length?'W bazie: '+owned.join(', ')+'.':'Tutaj pojawią się odblokowane przedmioty.');};
 view.addEventListener('pointerdown',e=>{if(e.button!==0)return;s.pointer={id:e.pointerId,x:e.clientX,y:e.clientY,ox:s.x,oy:s.y};s.moved=false;view.setPointerCapture(e.pointerId)});
 view.addEventListener('pointermove',e=>{if(!s.pointer||s.pointer.id!==e.pointerId)return;const dx=e.clientX-s.pointer.x,dy=e.clientY-s.pointer.y;if(Math.abs(dx)+Math.abs(dy)>7)s.moved=true;s.x=s.pointer.ox+dx;s.y=s.pointer.oy+dy;paint()});
 view.addEventListener('pointerup',e=>{if(s.pointer?.id===e.pointerId){s.pointer=null;setTimeout(()=>s.moved=false,50)}});
 view.addEventListener('pointercancel',()=>s.pointer=null);
 root.addEventListener('click',e=>{const z=e.target.closest('[data-base-zoom]');if(z){zoom(z.dataset.baseZoom==='in'?1.35:1/1.35);return}if(e.target.closest('[data-base-reset]')){reset();return}const f=e.target.closest('[data-base-fullscreen]');if(f){const full=root.classList.toggle('is-fullscreen');f.textContent=full?'✕':'⛶';document.body.style.overflow=full?'hidden':'';reset();return}const r=e.target.closest('[data-base-room],[data-room]');if(r&&!s.moved)focus(r.dataset.baseRoom||r.dataset.room)});
 root.addEventListener('keydown',e=>{const r=e.target.closest('[data-room]');if(r&&(e.key==='Enter'||e.key===' ')){e.preventDefault();focus(r.dataset.room)}});
 return s}
 const obs=new MutationObserver(()=>{document.querySelectorAll('[data-base-explorer]').forEach(setup);if(!document.querySelector('.base-explorer.is-fullscreen'))document.body.style.overflow=''});
 obs.observe(document.getElementById('app'),{childList:true,subtree:true});document.querySelectorAll('[data-base-explorer]').forEach(setup);
})();

initHeadquarters3D();

// V75_AUDYT_ZGODNOSCI_3

// V75_AUDYT_ZGODNOSCI_4
