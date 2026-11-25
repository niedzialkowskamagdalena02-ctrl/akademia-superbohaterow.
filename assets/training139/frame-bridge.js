(function(){
 'use strict';
 const session=new URLSearchParams(location.hash.slice(1)).get('session');
 const config=parent.__academyTraining139?.get(session);
 if(!config)throw Error('Otwórz tę grę przez menu treningów Akademii.');
 const origin=location.origin,send=(kind,data={})=>parent.postMessage({academyTraining139:session,kind,...data},origin);
 let saved={...(config.restore||{})},paused=false,offset=0,pauseAt=0;
 const nativeNow=performance.now.bind(performance),nativeTimeout=setTimeout.bind(window),nativeClear=clearTimeout.bind(window),nativeFrame=requestAnimationFrame.bind(window),nativeCancel=cancelAnimationFrame.bind(window);
 let serial=1;const timers=new Map(),frames=new Map();
 function runTimer(id){const t=timers.get(id);if(!t||paused)return;t.started=nativeNow();t.native=nativeTimeout(()=>{timers.delete(id);t.fn(...t.args);},Math.max(0,t.remaining));}
 window.setTimeout=(fn,delay=0,...args)=>{if(typeof fn!=='function')throw Error('Wymagana funkcja timera.');const id=serial++;timers.set(id,{fn,remaining:Number(delay)||0,args});runTimer(id);return id;};
 window.clearTimeout=id=>{const t=timers.get(id);if(t)nativeClear(t.native);timers.delete(id);};
 window.requestAnimationFrame=fn=>{const id=serial++;const item={fn,native:0};frames.set(id,item);if(!paused)item.native=nativeFrame(t=>{frames.delete(id);fn(t-offset);});return id;};
 window.cancelAnimationFrame=id=>{const item=frames.get(id);if(item)nativeCancel(item.native);frames.delete(id);};
 try{Object.defineProperty(performance,'now',{value:()=>nativeNow()-offset-(paused?nativeNow()-pauseAt:0)});}catch{}
 function pause(on){
  if(paused===on)return;paused=on;
  if(on){pauseAt=nativeNow();for(const t of timers.values()){nativeClear(t.native);t.remaining-=nativeNow()-(t.started||nativeNow());}for(const f of frames.values())nativeCancel(f.native);send('stop-audio');}
  else{offset+=nativeNow()-pauseAt;for(const id of timers.keys())runTimer(id);for(const [id,f]of frames)f.native=nativeFrame(t=>{frames.delete(id);f.fn(t-offset);});}
  document.body.inert=on;document.body.classList.toggle('training139-paused',on);
 }
 const asset=value=>{
  if(!value)return value;value=String(value);
  if(/^(data:|blob:|https?:)/.test(value))return value;
  if(value.startsWith('assets/'))return new URL(value,config.appBase).href;
  return new URL(window.TRAINING139_ASSETS[value]||value,location.href).href;
 };
 const prefix=`academy-training139:${config.child}:${config.scope}:${config.game}:`,memory=new Map();
 const storage={getItem:key=>{try{return config.preview?memory.get(key)??null:localStorage.getItem(prefix+key);}catch{return null;}},setItem:(key,value)=>{try{if(config.preview)memory.set(key,String(value));else localStorage.setItem(prefix+key,value);}catch{}}};
 const shuffle=items=>{const out=[...items];for(let i=out.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[out[i],out[j]]=[out[j],out[i]];}return out;};
 let pendingVoice=null;
 const synthesis={cancel:()=>send('stop-audio'),speak:u=>{pendingVoice=u;send('speak',{text:String(u.text||''),lang:u.lang||'pl-PL'});}};
 if(!window.SpeechSynthesisUtterance)window.SpeechSynthesisUtterance=class{constructor(text){this.text=text;}};
 try{Object.defineProperty(window,'speechSynthesis',{value:synthesis,configurable:true});}catch{window.speechSynthesis.speak=synthesis.speak;window.speechSynthesis.cancel=synthesis.cancel;}
 window.Training139={config,restore:config.restore,asset,css:s=>String(s).replace(/url\(['"]?([^)'"\s]+)['"]?\)/g,(_,p)=>'url("'+asset(p)+'")'),storage,shuffle,speak:text=>send('speak',{text,lang:'pl-PL'}),
  save(data){saved={...saved,...data};send('state',{state:saved});},
  advance(){send('advance');},back(){send('back');},help(){send('help');},complete(data){send('complete',data);},
  dragCargo(node,index,load){
   let drag=null,ghost=null;
   node.addEventListener('pointerdown',e=>{if(e.button!==0||node.disabled)return;drag={id:e.pointerId,x:e.clientX,y:e.clientY,moved:false};node.setPointerCapture(e.pointerId);});
   node.addEventListener('pointermove',e=>{if(drag?.id!==e.pointerId)return;if(Math.hypot(e.clientX-drag.x,e.clientY-drag.y)<8&&!drag.moved)return;e.preventDefault();drag.moved=true;
    if(!ghost){ghost=node.cloneNode(true);ghost.style.cssText='position:fixed;z-index:9999;pointer-events:none;opacity:.8;width:140px;transform:translate(-50%,-50%)';document.body.append(ghost);}ghost.style.left=e.clientX+'px';ghost.style.top=e.clientY+'px';});
   function end(e,drop){if(drag?.id!==e.pointerId)return;if(drag.moved){node.skipClick=true;e.preventDefault();if(drop){const target=document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-wagon]');if(target)load(index,Number(target.dataset.wagon));}}ghost?.remove();ghost=null;drag=null;}
   node.addEventListener('pointerup',e=>end(e,true));for(const type of ['pointercancel','lostpointercapture'])node.addEventListener(type,e=>end(e,false));
  }
 };
 window.addEventListener('message',e=>{if(e.source!==parent||e.origin!==origin||e.data?.academyTraining139!==session)return;
  if(e.data.kind==='pause')pause(!!e.data.paused);
  if(e.data.kind==='skip')window.Training139.onSkip?.();
  if(e.data.kind==='revealed')window.Training139.onRevealed?.();
  if(e.data.kind==='voice'){const speaking=e.data.state==='speaking';document.body.classList.toggle('listening',speaking);if(!speaking){pendingVoice?.onend?.();pendingVoice=null;}}
 });
 document.addEventListener('click',e=>{
  const b=e.target.closest('#back,#restart,#ai,#mic');if(!b)return;e.preventDefault();e.stopImmediatePropagation();
  if(b.id==='ai')send('help');else if(b.id==='mic')send('mic');else if(b.id==='restart'&&/ponownie/i.test(b.textContent))send('restart');else send('back');
 },true);
 document.addEventListener('DOMContentLoaded',()=>{
  for(const selector of ['#ai','#mic','#back','#pause','#skip']){const el=document.querySelector(selector);if(el)el.hidden=true;}
  for(const selector of ['#details','#help','#info']){const el=document.querySelector(selector);if(el&&/Miejsce na|W aplikacji ten przycisk/.test(el.textContent))el.textContent='';}
  const content=document.querySelector('main')||document.body;
  const observer=new ResizeObserver(()=>send('height',{height:Math.ceil(content.getBoundingClientRect().height)}));observer.observe(content);
 },{once:true});
 window.addEventListener('load',()=>send('ready'),{once:true});
 window.addEventListener('error',()=>send('error'));
 window.addEventListener('unhandledrejection',()=>send('error'));
 window.addEventListener('pagehide',()=>{for(const t of timers.values())nativeClear(t.native);for(const f of frames.values())nativeCancel(f.native);timers.clear();frames.clear();},{once:true});
})();
