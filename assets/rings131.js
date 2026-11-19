import {legacyFlight131} from './rings131-motion.js?v=131';
import {tasks130,choices130} from './hangar130-data.js?v=130';
import {img130,btn130} from './hangar130.js?v=131';
import {taskBar130,status130,bindRead130,pointerPosition130} from './hangar130-flight.js?v=131';
const positions={1:[[50,35]],2:[[29,36],[71,30]],3:[[21,38],[50,25],[79,38]]};
function aircraft97() {
  return `<div class="flight97-aircraft" data-f97-aircraft aria-hidden="true">
    <span class="flight97-trail flight97-trail-left"></span><span class="flight97-trail flight97-trail-right"></span>
    <span class="flight97-tailplane"></span><span class="flight97-wheel flight97-wheel-left"></span><span class="flight97-wheel flight97-wheel-right"></span>
    <span class="flight97-wing flight97-wing-left"><i></i><b></b></span>
    <span class="flight97-wing flight97-wing-right"><i></i><b></b></span>
    <span class="flight97-fuselage"><i></i></span><span class="flight97-fin"></span>
  </div>`;
}

function puffs131(){return `<span class="flight96-ring-puffs" aria-hidden="true">${Array.from({length:18},(_,i)=>`<i style="left:${50+42*Math.cos(i*Math.PI*2/18)}%;top:${50+42*Math.sin(i*Math.PI*2/18)}%"></i>`).join('')}</span>`;}
export function mountRings131(c){
 const full=tasks130('takeoff',c.mode),saved=c.progress.read()['takeoff:'+c.mode],offset=saved?.complete?0:Math.min(saved?.round||0,full.length);
 if(offset===full.length){c.complete('Mistrz obręczy · 11 / 11','rings/odznaka.png');return {snapshot:()=>({phase:'done',passed:11})};}
 const tasks=full.slice(offset),gates=tasks.map((t,i)=>choices130(t.answer,i+offset<5?2:3));
 c.view(taskBar130(c,tasks[0],offset,11)+`<div class="flight95-surface flight97-takeoff" data-f97-phase="ready"><div class="flight97-window" data-f95-viewport tabindex="0" aria-label="Przeciągnij samolot do wybranej obręczy. Klawiatura: strzałki.">
  <div class="flight97-sky"></div><div class="flight97-airflow"></div><div class="flight97-flight-clouds">${Array.from({length:5},(_,i)=>`<i style="--cloud:${i}"></i>`).join('')}</div>
  <div class="flight97-ground"><div class="flight97-tarmac">${Array.from({length:8},()=>'<i class="flight97-mark"></i>').join('')}</div></div>
  ${gates.map((values,round)=>values.map((n,i)=>{const [x,y]=positions[values.length][i];return `<div class="flight97-hoop" data-f97-hoop="${round}:${i}" data-f97-lane="${i}" style="--gate-x:${x}%;--gate-y:${y}%" hidden>${btn130('ring-aim:'+i,puffs131()+'<b>'+n+'</b>',`class="flight97-hoop-button" aria-label="Leć do obręczy ${n}"`)}</div>`;}).join('')).join('')}
  ${aircraft97()}<div class="flight97-cockpit-frame"></div><div class="flight97-sparks"></div><div class="flight97-dashboard">${img130('rings/instruments.webp','flight97-dash-art')}<span class="flight97-status-lights"><i></i><i></i><i></i><i></i></span><span class="flight97-yoke"><i></i><i></i><b></b></span><div class="flight97-throttle" data-f95-lever>${btn130('lever','<span class="flight97-lever-arm"></span>','data-f95-action="lever" aria-label="Opuść dźwignię w kokpicie"')}</div></div>
  </div></div>${status130()}<div data-rings-result></div>`);
 let passed=0,drag=null,lever=null,done=false,awarded=false;
 const get=s=>c.root.querySelector(s),view=get('[data-f95-viewport]');
 const finish=()=>{if(awarded)return;awarded=true;c.complete('Mistrz obręczy · 11 / 11','rings/odznaka.png');};
 const motion=legacyFlight131(c.root,{needed:tasks.map(t=>t.answer),gates,problems:tasks.map(t=>({expression:t.prompt.replace(' = ?',''),prompt:t.prompt,speech:t.prompt}))},{
  reduced:c.reduced,
  onLaunch:text=>{c.status(text);c.tone(2);},
  onGate:(n,text,retry,speech)=>{
   if(n>passed){c.status(tasks[n-1].equation);c.tone(4);c.progress.round('takeoff',c.mode,offset+n);passed=n;}
   const task=tasks[n];if(task){get('.h130-task h3').textContent=task.prompt;get('.h130-task small').textContent=`${c.mode==='young'?'Młody pilot':'Kapitan'} · RUNDA ${offset+n+1} / 11`;get('.h130-task b').textContent=`${offset+n} / 11`;}
   c.status(retry?'Spróbuj jeszcze raz.':text);c.speak(speech);
  },
  onFinish:()=>{done=true;c.progress.round('takeoff',c.mode,11);c.status('Wszystkie obręcze zaliczone!');get('[data-rings-result]').innerHTML=btn130('skip-rings','Zobacz odznakę','class="h130-primary"');c.later(finish,c.reduced?180:1200);}
 });
 c.loop((dt,now)=>motion.step(now));bindRead130(c,()=>tasks[passed]?.prompt||'Wszystkie obręcze zaliczone.');
 c.status('Pociągnij czerwoną dźwignię osadzoną w kokpicie. Potem steruj samolotem palcem.');
 c.on(c.root,'click',e=>{const b=e.target.closest('[data-h130]');if(!b||b.disabled)return;const [a,index]=b.dataset.h130.split(':');if(a==='lever')motion.launch();if(a==='ring-aim')motion.aim(Number(index));if(a==='skip-rings')finish();});
 c.on(c.root,'pointerdown',e=>{
  if(e.button!==0||done)return;if(e.target.closest('[data-f95-lever]')){lever={id:e.pointerId,y:e.clientY};view.setPointerCapture?.(e.pointerId);return;}
  if(!e.target.closest('[data-f95-viewport]'))return;drag=e.pointerId;view.setPointerCapture?.(e.pointerId);const p=pointerPosition130(e,view);motion.steerTo(p.y*100,p.x*100);e.preventDefault();
 });
 c.on(view,'pointermove',e=>{if(e.pointerId===lever?.id){if(e.clientY-lever.y>16)motion.launch();return;}if(e.pointerId!==drag)return;const p=pointerPosition130(e,view);motion.steerTo(p.y*100,p.x*100);e.preventDefault();});
 for(const type of ['pointerup','pointercancel'])c.on(c.root.ownerDocument,type,()=>{drag=null;lever=null;});
 c.on(c.root,'keydown',e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();motion.steer(e.key.slice(5).toLowerCase());}});
 return {snapshot:()=>({...motion.snapshot(),round:offset+passed,gates}),aim:i=>motion.aim(i)};
}

