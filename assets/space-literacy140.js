import {taskMarkup136,taskResult136} from './training-cosmic140.js?v=140';
const esc132=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const art132=(name,cls='')=>`<img src="assets/space132/${name}.png" class="${cls}" alt="" draggable="false" decoding="async">`;
const button132=(text,action,cls='')=>`<button type="button" class="${cls}" data-mg="${action}">${text}</button>`;
export const spaceStages132=['Bramy startowe','Naprawa nadajnika','Lądowanie'];
const contexts132={góra:'Przed nami wysoka {word}.',wróbel:'Na gałęzi siedzi {word}.',buty:'Zakładam wygodne {word}.',ogórek:'W koszyku leży zielony {word}.',burza:'Nad miastem przechodzi {word}.',piórnik:'Na biurku leży mój {word}.',żaba:'Nad stawem skacze {word}.',orzech:'Wiewiórka znalazła {word}.',porządek:'W pokoju panuje {word}.',kałuża:'Po deszczu została {word}.',łyżka:'Obok talerza leży {word}.',chmura:'Po niebie płynie {word}.',herbata:'W kubku jest ciepła {word}.',bohater:'Na ratunek przybył {word}.',mucha:'Nad stołem lata {word}.',chleb:'Na śniadanie jemy {word}.',słońce:'Na niebie świeci {word}.',wąż:'W terrarium mieszka {word}.',gęś:'Po podwórku chodzi {word}.',słoń:'W oddali stoi duży {word}.',jabłko:'Na stole leży czerwone {word}.'};
export function spaceGap132(template,right,choices){
 const word=template.replace('_',right);
 return {template,word,choices:[...choices],sentence:contexts132[word]||'Uzupełnij wyraz: {word}.',hint:`W wyrazie „${word}” w tej luce piszemy „${right}”. Przeczytaj poprawny zapis i spróbuj ponownie.`};
}
export function spaceKind132(launch,t,assessment=false){return !assessment&&launch?.mode!=='test'&&['spelling','dictation','grammar','syllables','read','bank'].includes(launch?.space132)&&t?.outsideSubject95==='polski'?launch.space132:'';}
export const spaceSessionKey132=(child,kind)=>`academy-space132-${child}-${kind}`;
export function readSpace132(storage,key,kind){
 try{
  const s=JSON.parse(storage.getItem(key)||'null');
  if(s?.version!==1||!Array.isArray(s.tasks)||!s.tasks.length||s.tasks.length>30||!Number.isInteger(s.idx)||s.idx<0||s.idx>s.tasks.length||!Number.isInteger(s.points)||s.points<0||s.points>s.tasks.length)return null;
  if(!s.tasks.every(t=>t?.outsideSubject95==='polski'&&typeof t.answer==='string'&&(kind==='dictation'?t.type==='dictation'&&typeof t.audio==='string':kind==='spelling'?t.spaceGap132&&Array.isArray(t.options)&&typeof t.spaceGap132.template==='string':Array.isArray(t.options)&&t.options.every(o=>typeof o==='string'))))return null;
  return s;
 }catch{return null;}
}
export function writeSpace132(storage,key,state){try{storage.setItem(key,JSON.stringify({version:1,...state}));}catch{}}
export function clearSpace132(storage,key){try{storage.removeItem(key);}catch{}}
function header132(kind,index,total,progress){
 return `<header class="space132-header">${button132('← Wróć','back')}<h2>${art132('rakieta','space132-title-ship')}${kind==='dictation'?'Dyktando':'Ortografia'}</h2>${art132('astronauta','space132-astronaut')}</header><p class="space132-count">${index>=total?'Misja zakończona':`Wyzwanie ${index+1} z ${total}`}</p><div class="space132-track" role="progressbar" aria-label="Postęp misji" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${progress}" style="--space-progress:${Math.round(progress/total*100)}%"><span class="space132-fill"></span>${[25,50,75].map(p=>`<span class="space132-star" style="left:${p}%">${art132('gwiazda')}</span>`).join('')}${art132('rakieta_przezroczysta','space132-ship')}${art132('skrzynia','space132-chest')}</div>`;
}
export function spaceMarkup132({kind,task:t,index,total,points,answered,wrongAttempts,help='',paused=false}){
 if(['grammar','syllables','read','bank'].includes(kind))return taskMarkup136({kind,task:t,index,total,points,answered,wrongAttempts,help,paused});
 const dictation=kind==='dictation',stage=index%3,gap=t.spaceGap132;
 const instruction=dictation?'Posłuchaj i napisz usłyszany wyraz!':spaceStages132[stage]+' · '+(stage===1?'Przenieś odpowiedź do luki lub wybierz literę i stuknij lukę.':'Wybierz brakującą literę lub dwuznak.');
 let main='';
 if(paused)main=`<section class="space132-answer"><h3>Misja zatrzymana</h3><p>Twój wpis i postęp są zachowane.</p>${button132('▶ Wznów','resume','space132-gold')}</section>`;
 else if(dictation)main=`<form class="space132-answer" data-space132-answer>${button132('🔊 Posłuchaj!','audio','space132-listen')}<label for="mg-written" class="space132-label">Wpisz usłyszany wyraz</label><input id="mg-written" data-space132-typed type="text" class="space132-input" value="${esc132(t.space132Typed||'')}" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" inputmode="text" enterkeyhint="done" placeholder="Wpisz odpowiedź tutaj…" ${answered?'disabled':''}>${answered?'': '<button type="submit" class="space132-gold">Sprawdź! 🚀</button>'}</form>`;
 else{
  const gapButton=button132(answered?esc132(t.answer):'___','space132-gap','space132-gap');
  const word=gap.template.split('_').map(esc132).join(gapButton);
  const phrase=stage===2?gap.sentence.split('{word}').map(esc132).join(word):word;
  main=`<section class="space132-answer">${button132('🔊 Posłuchaj!','audio','space132-listen')}<h3>${esc132(spaceStages132[stage])}</h3><div class="space132-word">${phrase}</div><div class="space132-options">${t.options.map((option,i)=>`<button type="button" data-mg="space132-pick:${i}" data-space132-option="${i}" aria-pressed="${t.space132Selected===i}" ${answered?'disabled':''}>${esc132(option)}</button>`).join('')}</div></section>`;
 }
 const feedback=answered?`<p class="space132-feedback" role="status">${dictation?'Brawo! Poprawnie: '+esc132(t.answer):['Przelot udany!','Nadajnik działa!','Lądowanie udane!'][stage]+' Poprawnie: '+esc132(gap.word)}</p>${button132(index===total-1?'Zakończ misję':'Dalej →','next','space132-gold')}`:wrongAttempts?`<p class="space132-feedback" role="status">Spróbuj jeszcze raz.${!dictation&&wrongAttempts>=2?' '+esc132(gap.hint):''}</p>`:'';
 return `<section class="space132 ${answered?'is-good':''} ${wrongAttempts&&!answered?'is-retry':''}" data-space132="${kind}" data-space132-stage="${stage}">${header132(kind,index,total,index+(answered?1:0))}<div class="space132-bar">${paused?'':button132('Ⅱ Pauza','pause')}<span>Poprawne: ${points}</span></div><div class="space132-guide">${art132('robot','space132-robot')}${art132('fala_dzwiekowa','space132-wave')}<p>${esc132(paused?'Odpocznij. Wrócimy do tego samego zadania.':instruction)}</p></div>${main}${paused?'':feedback}<div class="space132-tools">${paused?'':(answered?'':button132('Pomiń bez zaliczenia ⏭','skip'))}<div class="space132-help-row" ${paused?'hidden':''}>${button132('Zapytaj nauczyciela AI ✨','space132-help')}${button132(art132('mikrofon'),'tutor-mic','space132-mic')}</div></div>${help}</section>`;
}
export function spaceResult132({kind,points,total,skipped,coins}){
 if(['grammar','syllables','read','bank'].includes(kind))return taskResult136({kind,points,total,skipped,coins});
 return `<section class="space132 is-complete">${header132(kind,total,total,total)}<div class="space132-result">${art132('skrzynia')}<h3>Misja ukończona!</h3><p>Poprawne odpowiedzi: ${points} z ${total}.</p><p>Pominięte bez zaliczenia: ${skipped}.</p><p>Zdobyte złote: ${coins}.</p>${button132('Zagraj ponownie','start','space132-gold')}${button132('← Wróć','back')}</div></section>`;
}
// Touch drag is limited to transmitter options; it does not block page scrolling elsewhere.
export function mountSpaceDrag132(root,commit){
 const abort=new AbortController();let gesture=null,suppressUntil=0;
 const clear=()=>root.querySelector('.space132-gap')?.classList.remove('is-drop-target');
 const on=(name,fn,extra={})=>root.addEventListener(name,fn,{...extra,signal:abort.signal});
 on('click',e=>{if(e.detail>0&&performance.now()<suppressUntil){e.preventDefault();e.stopImmediatePropagation();}},{capture:true});
 on('pointerdown',e=>{
  suppressUntil=0;
  if(e.button!==0||root.querySelector('[data-space132-stage]')?.dataset.space132Stage!=='1')return;
  const el=e.target.closest('[data-space132-option]');if(!el||el.disabled)return;
  gesture={el,id:e.pointerId,x:e.clientX,y:e.clientY,index:Number(el.dataset.space132Option),moved:false};
 });
 on('pointermove',e=>{
  if(e.pointerId!==gesture?.id)return;const dx=e.clientX-gesture.x,dy=e.clientY-gesture.y;
  if(!gesture.moved&&Math.hypot(dx,dy)<8)return;
  gesture.moved=true;root.setPointerCapture?.(e.pointerId);e.preventDefault();gesture.el.style.transform=`translate(${dx}px,${dy}px)`;
  gesture.el.classList.add('is-dragging');clear();gesture.el.style.pointerEvents='none';const target=root.ownerDocument.elementFromPoint(e.clientX,e.clientY);gesture.el.style.pointerEvents='';target?.closest('.space132-gap')?.classList.add('is-drop-target');
 },{passive:false});
 const end=e=>{
  if(e.pointerId!==gesture?.id)return;const g=gesture;gesture=null;clear();g.el.style.transform='';g.el.classList.remove('is-dragging');
  if(!g.moved)return;
  // Block only the synthetic click generated by this drag, not the next physical tap.
  suppressUntil=performance.now()+350;
  if(e.type==='pointercancel'){suppressUntil=0;return;}
  g.el.style.pointerEvents='none';const target=root.ownerDocument.elementFromPoint(e.clientX,e.clientY);g.el.style.pointerEvents='';if(target?.closest('.space132-gap'))commit(g.index);
 };
 on('pointerup',end);on('pointercancel',end);
 return()=>{abort.abort();clear();if(gesture){gesture.el.style.transform='';gesture.el.classList.remove('is-dragging');gesture=null;}};
}
