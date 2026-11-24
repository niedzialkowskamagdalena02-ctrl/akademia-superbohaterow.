import {packagePages139} from './training139/catalog.js?v=140';
import {preschoolRound92,alphabet92,shuffle92,letterName92} from './learning-games92.js?v=92';
import {missionDeck93} from './missions93-data.js?v=140';
import {traceStrokes92} from './learning-trace92.js?v=95';
import {cosmicHelp136} from './training-cosmic140.js?v=140';
import {replenish139} from './training139-ai.js?v=140';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function materialTasks139(rows){return rows.map(r=>r.task||r).filter(t=>typeof t.question==='string'&&typeof t.answer==='string'&&Array.isArray(t.options)&&t.options.includes(t.answer)&&new Set(t.options).size===t.options.length);}
let routes;
export function trainingScope139(grade,subject,material=''){
 let hash=2166136261;for(const c of material){hash^=c.codePointAt(0);hash=Math.imul(hash,16777619);}return `${grade}:${subject}:${material?'material-'+(hash>>>0).toString(16):'outside'}`;
}
const poolKey139=(child,kind,scope,part='ai')=>`academy-training139-${part}:${child}:${scope}:${kind}`;
export function traceRoutes139(){
 if(routes)return routes;routes={};
 const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.style.cssText='position:absolute;width:1px;height:1px;visibility:hidden';document.body.append(svg);
 for(const glyph of [...alphabet92,...alphabet92.map(l=>l.toLocaleLowerCase('pl')),...Array.from({length:11},(_,i)=>String(i))]){
  routes[glyph]=traceStrokes92(glyph).map(stroke=>{const path=document.createElementNS(svg.namespaceURI,'path');path.setAttribute('d',stroke.d);svg.append(path);const length=path.getTotalLength(),count=Math.max(1,Math.ceil(length*stroke.scale/4));const pts=Array.from({length:count+1},(_,i)=>{const p=path.getPointAtLength(i/count*length);return [Math.round((p.x*stroke.scale+stroke.x)*20)/10,Math.round((p.y*stroke.scale+stroke.y)*20)/10];});path.remove();return pts;});
 }svg.remove();return routes;
}
async function readJSON139(file,signal){const response=await fetch(new URL(file,document.baseURI),{signal});if(!response.ok)throw Error('Nie udało się wczytać materiałów gry.');return response.json();}
export function riddleRounds139(bank,generated,older,recent=[]){
 const recentSet=new Set(recent),seen=new Set(),choose=pool=>shuffle92(pool).filter(row=>{const word=row.haslo.toLocaleLowerCase('pl');if(seen.has(word))return false;seen.add(word);return true;});
 const ai=choose(generated).slice(0,2),base=choose(bank.filter(r=>!seen.has(r.haslo.toLocaleLowerCase('pl')))).sort((a,b)=>Number(recentSet.has(a.id))-Number(recentSet.has(b.id))).slice(0,7-ai.length);
 return shuffle92([...ai,...base]).map(r=>{const other=shuffle92(bank.filter(x=>x.haslo!==r.haslo));const answer=older?r.haslo:r.haslo[0];const decoys=older?[...other.filter(x=>x.haslo[0]===answer[0]),...other.filter(x=>x.haslo[0]!==answer[0])].slice(0,2).map(x=>x.haslo):[...new Set(other.map(x=>x.haslo[0]))].filter(x=>x!==answer).slice(0,2);return [r.obraz,r.rymowanka,shuffle92([answer,...decoys]),answer,r.haslo];});
}
export async function frameConfig139({game,grade,subject,tasks,child,preview,signal,material,restore}){
 const kind=game.kind,older=grade!=='P',scope=trainingScope139(grade,subject,material),config={game:kind,grade,subject,child,scope,preview,appBase:document.baseURI,restore,material};
 if(['letters','numbers'].includes(kind)){
  let deck=preschoolRound92(kind);if(kind==='numbers'){const ten=deck.find(t=>t.answer===10)||{answer:10,options:[1,10,0],success:'Brawo! To 10.'};deck=shuffle92([{answer:0,options:shuffle92([0,1,10]),success:'Brawo! To 0.'},ten,...deck.filter(t=>t.answer!==10).slice(0,6)]);}
  config.letterConfig={title:game.name,theme:kind==='numbers'?'Odsłuchaj liczbę i wybierz właściwy kafelek.':'Dopasuj literę wzorcową.',mode:kind==='numbers'?4:0,questions:deck.map(t=>[kind==='numbers'?'Którą liczbę słyszysz?':t.prompt,'',t.options.map(String),t.options.indexOf(t.answer),String(t.cue??t.answer),t.success])};
 }
 if(kind==='order')config.orderRounds=preschoolRound92('order').map(t=>[t.options,t.answer]);
 if(kind==='trace'||kind==='rally'){
  config.routes=traceRoutes139();const pairs=keys=>keys.map(key=>[key,config.routes[key]]);config.traceSets={upper:pairs(alphabet92),lower:pairs(alphabet92.map(x=>x.toLocaleLowerCase('pl'))),nums:pairs(Array.from({length:11},(_,i)=>String(i)))};
 }
 if(kind==='rhymes'){
  const bank=await readJSON139('assets/training139/rhymes.json',signal);let extra=[],recent=[];try{extra=JSON.parse(localStorage.getItem(poolKey139(child,kind,scope))||'[]');recent=JSON.parse(localStorage.getItem(poolKey139(child,kind,scope,'recent'))||'[]');}catch{}
  config.rhymeRounds=riddleRounds139(bank,extra,older,recent);
  if(!preview)try{localStorage.setItem(poolKey139(child,kind,scope,'recent'),JSON.stringify(config.rhymeRounds.map(r=>bank.find(b=>b.rymowanka===r[1])?.id).filter(Boolean)));}catch{}
 }
 if(kind==='camera')config.cameraRounds=missionDeck93('camera','P').map((t,i)=>{if(typeof t.answer==='string')return [t.answer,t.options.map(o=>o.value)];const answer=alphabet92[(i*7+3)%alphabet92.length];return [answer,shuffle92([...Array(3).fill(answer),...shuffle92(alphabet92.filter(x=>x!==answer)).slice(0,5)])];});
 if(kind==='dino'){
  config.objects=await readJSON139('assets/training139/objects.json',signal);config.objects=config.objects.map(o=>({nazwa:o.name,plik:o.file,id:o.id}));
  config.dinoTasks=tasks.map(t=>({temat:subject,polecenie:t.question,dymek:t.question,opcje:t.options,poprawna:t.answer}));
 }
 if(kind==='closet'){
  let generated=[],recent=[];try{generated=JSON.parse(localStorage.getItem(poolKey139(child,kind,scope))||'[]');recent=JSON.parse(localStorage.getItem(poolKey139(child,kind,scope,'recent'))||'[]');}catch{}
  const pool=shuffle92([...tasks,...generated]).filter(t=>Array.isArray(t.options)&&t.options.includes(t.answer)).sort((a,b)=>Number(recent.includes(a.question))-Number(recent.includes(b.question)));
  config.closetMissions=Array.from({length:8},(_,i)=>{const a=pool[(i*2)%pool.length],b=pool[(i*2+1)%pool.length];return [a?.sourceTitle||'Misja stylisty',[a?.question||'Wybierz rzeczownik.',a?.options||['kot','biegnie','zielony'],a?.answer||'kot'],[b?.question||'Wybierz czasownik.',b?.options||['biegnie','kot','zielony'],b?.answer||'biegnie'],'⭐'];});
  if(!preview&&older)try{localStorage.setItem(poolKey139(child,kind,scope,'recent'),JSON.stringify(config.closetMissions.flatMap(m=>[m[1][0],m[2][0]])));}catch{}
 }
 return config;
}
export function mountTrainingPackage139(root,options){
 const {game,grade,subject=game.subject,child,preview=false,speak,stopAudio=()=>{},askHelp,onMic,onBack,onFinish,oneRound=false,tasks=[],material='',generate}=options;
 const lifetime=new AbortController(),{signal}=lifetime;let frame,context={question:game.name,answer:''},paused=false,config,finished=false;
 const scope=trainingScope139(grade,subject,material),key=`academy-training139:${child}:${scope}:${game.kind}`,session=crypto.randomUUID();
 window.__academyTraining139??=new Map();
 let restore=null;if(!preview)try{restore=JSON.parse(localStorage.getItem(key)||'null');}catch{}
 if(['closet','rally'].includes(game.kind)&&restore?.index>=restore?.rounds?.length)restore=null;
 const helper=cosmicHelp136(root,{signal,ask:askHelp,speak,mic:onMic,context:()=>context});
 root.className='training139-root space132';root.innerHTML=`<header class="training139-nav"><button type="button" data-t139="back">‹ Wszystkie gry</button><button type="button" data-t139="pause">Ⅱ Pauza</button><button type="button" data-t139="skip">Pomiń bez zaliczenia</button></header><p class="training139-loading" role="status">Ładuję grę…</p><div data-t139-stage></div>${helper.markup()}`;
 const send=(kind,data={})=>frame?.contentWindow?.postMessage({academyTraining139:session,kind,...data},location.origin);
 const dispose=()=>{if(signal.aborted)return;lifetime.abort();stopAudio();window.__academyTraining139.delete(session);if(frame)frame.src='about:blank';};
 root.addEventListener('click',e=>{const target=e.target.closest('[data-t139],[data-lg92]');if(!target)return;if(target.dataset.lg92){helper.action(target.dataset.lg92);return;}
  const action=target.dataset.t139;if(action==='back'){dispose();onBack();}if(action==='pause'){paused=!paused;target.textContent=paused?'▶ Wznów':'Ⅱ Pauza';send('pause',{paused});if(paused)stopAudio();}if(action==='skip'&&!paused){send('skip');if(oneRound){dispose();onFinish();}};
 },{signal});
 window.addEventListener('message',e=>{const data=e.data;if(e.source!==frame?.contentWindow||e.origin!==location.origin||data?.academyTraining139!==session||signal.aborted)return;
  if(data.kind==='ready'){root.querySelector('.training139-loading')?.remove();frame.hidden=false;}
  if(data.kind==='error'){const status=root.querySelector('.training139-loading');if(status)status.textContent='Nie udało się uruchomić gry. Wróć do listy i spróbuj ponownie.';}
  if(data.kind==='height'&&Number.isFinite(data.height))frame.style.height=Math.max(400,Math.min(5000,data.height+8))+'px';
  if(data.kind==='speak'&&typeof data.text==='string'&&!paused)speak(data.text.length===1&&alphabet92.includes(data.text.toLocaleUpperCase('pl'))?letterName92(data.text.toLocaleUpperCase('pl')):data.text,data.lang);if(data.kind==='stop-audio')stopAudio();
  if(data.kind==='back'){dispose();onBack();}if(data.kind==='help')helper.action('c136-help');if(data.kind==='mic')helper.action('c136-mic');
  if(data.kind==='state'&&data.state&&typeof data.state==='object'){
   const skip=root.querySelector('[data-t139="skip"]');if(skip)skip.disabled=!!data.state.roundComplete;
   if(data.state.context&&JSON.stringify(data.state.context)!==JSON.stringify(context)){context=data.state.context;helper.reset();}
   if(!preview)try{localStorage.setItem(key,JSON.stringify(data.state));}catch{}
  }
  if(data.kind==='advance'&&oneRound&&!finished){finished=true;dispose();onFinish();}
  if(data.kind==='restart'){if(!preview)localStorage.removeItem(key);dispose();mountTrainingPackage139(root,{...options});}
 },{signal});
 root.ownerDocument.addEventListener('academy:voice-state',e=>send('voice',{state:e.detail?.state}),{signal});
 (async()=>{
  try{config=await frameConfig139({...options,signal,restore,subject});if(signal.aborted)return;window.__academyTraining139.set(session,config);
   const page=packagePages139[game.kind]?.[grade==='P'?'pre':'school']||packagePages139[game.kind]?.pre;if(!page)throw Error('Brak wersji gry dla tego poziomu.');
   frame=document.createElement('iframe');frame.title=game.name;frame.className='training139-frame';frame.setAttribute('sandbox','allow-scripts allow-same-origin');frame.hidden=true;frame.src=page+'?v=141#session='+encodeURIComponent(session);root.querySelector('[data-t139-stage]').append(frame);
   if(generate&&['rhymes','closet'].includes(game.kind)&&!preview){
    const objects=await readJSON139('assets/training139/objects.json',signal);void replenish139({game:game.kind,grade,subject,material,verifiedTasks:tasks,objects,ask:generate,signal,key:poolKey139(child,game.kind,scope)});
   }
  }catch(error){if(signal.aborted)return;const status=root.querySelector('.training139-loading');if(status)status.textContent='Nie udało się wczytać gry: '+error.message;}
 })();
 return {dispose};
}
