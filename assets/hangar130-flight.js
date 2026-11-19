import {tasks130,choices130,modeNames130,clamp130,ringPass130} from './hangar130-data.js?v=130';
import {img130,btn130,esc130} from './hangar130.js?v=130';

export function taskBar130(c,task,index,total,count=index){return `<section class="h130-task"><div><small>${esc130(modeNames130[c.mode])} · RUNDA ${index+1} / ${total}</small><h3>${esc130(task.prompt)}</h3></div>${btn130('read-task','🔊','aria-label="Powtórz polecenie pilota"')}<b>${count} / ${total}</b></section>`;}
export const status130=()=>'<p class="h130-status" data-h130-status role="status" aria-live="polite"></p>';
export function bindRead130(c,getText){c.on(c.root,'click',e=>{if(e.target.closest('[data-h130="read-task"]'))c.speak(getText());});}
export function pointerPosition130(event,el){const r=el.getBoundingClientRect();return {x:clamp130((event.clientX-r.left)/r.width),y:clamp130((event.clientY-r.top)/r.height)};}

export function mountRings130(c){
 const tasks=tasks130('takeoff',c.mode),saved=c.progress.read()['takeoff:'+c.mode];
 let round=saved?.complete?0:clamp130(saved?.round||0,0,tasks.length-1),phase='launch',x=.5,target=.5,held=0,approach=0,errors=0,gates=[],active=false,drag=null,feedback=false;
 const get=s=>c.root.querySelector(s), text=()=>tasks[round].prompt;
 function ready(message='Oblicz wynik. Pierwszy ruch rozpocznie zbliżanie obręczy.'){
  phase='waiting';approach=0;active=false;feedback=false;held=0;
  const values=choices130(tasks[round].answer,round<5?2:3);
  gates=values.map((value,i)=>({value,x:(i+1)/(values.length+1)}));
  c.view(taskBar130(c,tasks[round],round,tasks.length)+`<div class="h130-rings h130-sky" data-h130-board tabindex="0" aria-label="Steruj samolotem w lewo lub w prawo">
   <div class="h130-routes" aria-hidden="true">${gates.map(g=>`<i style="left:${g.x*100}%"></i>`).join('')}</div>
   ${gates.map((g,i)=>`<div class="h130-ring" data-ring="${i}">${img130('rings/obrecz.png')}<strong>${g.value}</strong></div>`).join('')}
   <i class="h130-route-marker" data-route aria-hidden="true"></i>${img130('rings/samolot_tyl.png','h130-rear-plane')}
   <div class="h130-particles" hidden aria-hidden="true">✦ · ✧ · ✦</div></div>
   <div class="h130-controls">${btn130('left','←','aria-label="Leć w lewo"')}${btn130('right','→','aria-label="Leć w prawo"')}</div>${status130()}<div data-h130-hint>${errors>=2?btn130('hint','Podpowiedź'):''}</div>`);
  c.status(message);bindRead130(c,text);c.speak(text());bindSteering();
  const board=get('[data-h130-board]'),plane=get('.h130-rear-plane'),nodes=gates.map((_,i)=>get('[data-ring="'+i+'"]')),marker=get('[data-route]');
  c.loop(dt=>{
   if(!feedback){if(held){target=clamp130(target+held*dt*.45,.055,.945);active=true;}x+=(target-x)*Math.min(1,dt*14);}
   plane.style.left=(x*100)+'%';plane.style.transform=`translate(-50%,-50%) rotate(${feedback?12:held*5}deg)`;
   const nearest=gates.reduce((best,g,i)=>Math.abs(g.x-x)<Math.abs(gates[best].x-x)?i:best,0);
   marker.style.left=(gates[nearest].x*100)+'%';
   if(active&&!feedback){phase='approaching';approach=Math.min(1,approach+dt/(c.reduced?2.5:c.mode==='young'?6.5:5.8));}
   gates.forEach((g,i)=>{const node=nodes[i];node.style.left=(g.x*100)+'%';node.style.top=(23+approach*53)+'%';node.style.width=(16+approach*(gates.length===3?11:18))+'%';});
   if(approach>=1&&!feedback){
    const radius=(gates.length===3?.27:.34)*.315;
    const hit=gates.findIndex(g=>ringPass130(x,g.x,radius));
    feedback=true;held=0;phase='reaction';
    if(hit<0){c.status('Wybierz obręcz. Spróbuj ponownie — ta sama runda.');c.later(()=>ready('Wybierz trasę do otworu obręczy.'),c.reduced?250:950);return;}
    const correct=gates[hit].value===tasks[round].answer;
    nodes[hit].querySelector('img').src=c.art+'rings/obrecz_'+(correct?'poprawna':'bledna')+'.png';
    nodes[hit].classList.add(correct?'is-correct':'is-wrong');
    if(correct){get('.h130-particles').hidden=false;c.status('Brawo! '+tasks[round].equation);c.tone(4);c.progress.round('takeoff',c.mode,round+1);c.later(()=>{round++;errors=0;if(round===tasks.length)final();else ready();},c.reduced?400:1200);}
    else{errors++;c.status('Spróbuj jeszcze raz. '+(errors>=2?'Możesz skorzystać z podpowiedzi.':''));c.later(()=>{target=.5;x=.5;ready('Spróbuj jeszcze raz — to samo działanie.');},c.reduced?350:1100);}
   }
  });
  c.on(c.root,'click',e=>{if(e.target.closest('[data-h130="hint"]')){const hint=tasks[round].hint;c.status(hint);c.speak(hint);}});
 }
 function move(direction){if(feedback)return;active=true;target=clamp130(target+direction*.16,.055,.945);}
 function bindSteering(){
  const board=get('[data-h130-board]');
  c.on(c.root,'keydown',e=>{if(['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();held=e.key==='ArrowLeft'?-1:1;active=true;}});
  c.on(c.root.ownerDocument,'keyup',e=>{if(['ArrowLeft','ArrowRight'].includes(e.key))held=0;});
  c.on(c.root,'pointerdown',e=>{
   if(e.button!==0||feedback)return;
   const button=e.target.closest('[data-h130="left"],[data-h130="right"]');
   if(button){held=button.dataset.h130==='left'?-1:1;active=true;e.preventDefault();return;}
   if(!e.target.closest('[data-h130-board]'))return;
   e.preventDefault();drag=e.pointerId;board.setPointerCapture?.(e.pointerId);target=clamp130(pointerPosition130(e,board).x,.055,.945);active=true;
  });
  c.on(board,'pointermove',e=>{if(e.pointerId===drag&&!feedback){target=clamp130(pointerPosition130(e,board).x,.055,.945);active=true;}});
  c.on(c.root.ownerDocument,'pointerup',()=>{held=0;drag=null;});
  c.on(c.root.ownerDocument,'pointercancel',()=>{held=0;drag=null;});
  c.on(c.root.ownerDocument.defaultView,'blur',()=>{held=0;drag=null;});
  c.on(c.root,'click',e=>{const b=e.target.closest('[data-h130="left"],[data-h130="right"]');if(b&&e.detail===0)move(b.dataset.h130==='left'?-1:1);});
 }
 function final(){
  phase='final';let done=false;
  c.view(`<div class="h130-rings h130-sky h130-final-climb">${img130('rings/samolot_tyl.png','h130-rear-plane')}<div class="h130-cloud-cover"></div><h3>11 / 11 — lecimy ponad chmury!</h3></div>${btn130('skip','Pomiń animację')}`);
  const finish=()=>{if(done)return;done=true;c.complete('Mistrz obręczy · 11 / 11','rings/odznaka.png');};
  c.on(c.root,'click',e=>{if(e.target.closest('[data-h130="skip"]'))finish();});c.later(finish,c.reduced?300:2200);
 }
 function launch(){
  phase='launch';let launched=false,down=null;
  c.view(taskBar130(c,tasks[round],round,tasks.length)+`<div class="h130-rings h130-on-runway" data-launch>${img130('rings/samolot_tyl.png','h130-rear-plane')}${btn130('lever',img130('rings/dzwignia.png')+'<span>Pociągnij w dół</span>','class="h130-lever" aria-label="Opuść dźwignię i wystartuj"')}</div>${status130()}`);
  c.status('Pociągnij czerwoną dźwignię w dół lub naciśnij ją. Klawiatura: Enter lub spacja.');bindRead130(c,()=>text()+'. Pociągnij dźwignię w dół.');
  const lever=get('[data-h130="lever"]');
  const start=()=>{if(launched)return;launched=true;c.tone(2);lever.disabled=true;get('[data-launch]').classList.add('is-taking-off');c.status('Przyspieszenie… start!');c.later(()=>ready(),c.reduced?250:1600);};
  c.on(lever,'click',start);c.on(lever,'pointerdown',e=>{down={id:e.pointerId,y:e.clientY};lever.setPointerCapture?.(e.pointerId);});
  c.on(lever,'pointermove',e=>{if(e.pointerId===down?.id&&e.clientY-down.y>18)start();});
  c.on(lever,'pointerup',()=>down=null);c.on(lever,'pointercancel',()=>down=null);
 }
 if(!saved?.complete&&saved?.round>=tasks.length)final();else launch();
 return {snapshot:()=>({round,phase,x,gates,errors,approach})};
}

export function mountEngine130(c){
 const tasks=tasks130('engine',c.mode),saved=c.progress.read()['engine:'+c.mode];
 let round=saved?.complete?0:clamp130(saved?.round||0,0,5),digits='',errors=0,solved=!saved?.complete&&saved?.round>=6,starting=false;
 if(solved)digits=String(tasks[5].answer);
 const get=s=>c.root.querySelector(s);
 function render(message='Wpisz kod i naciśnij „Sprawdź kod”.'){
  const task=tasks[round];
  c.view(taskBar130(c,task,round,6,round+(solved?1:0))+`<section class="h130-engine">
   <div class="h130-engine-window" role="img" aria-label="Pas startowy widziany z kokpitu"></div>
   <div class="h130-engine-panel"><div class="h130-gauge">${img130('engine/wskaznik.png')}<i data-needle style="transform:rotate(${-70+(round+(solved?1:0))*140/6}deg)" aria-hidden="true"></i><span>Moc silników</span></div>
    <div class="h130-code-panel"><output data-code aria-label="Wpisany kod" aria-live="polite">${esc130(digits||'…')}</output><div class="h130-keypad">${[1,2,3,4,5,6,7,8,9,'⌫',0].map(k=>btn130('digit:'+k,k,`aria-label="${k==='⌫'?'Usuń ostatnią cyfrę':k}" ${solved?'disabled':''}`)).join('')}</div>${btn130('check','Sprawdź kod',`class="h130-primary" ${solved?'disabled':''}`)}</div>
    <div class="h130-engine-lights"><strong>Kontrolki rozruchu</strong><div class="h130-lamps">${Array.from({length:6},(_,i)=>`<span class="h130-lamp ${i<round+(solved?1:0)?'is-lit':''}" aria-label="Kontrolka ${i+1}: ${i<round+(solved?1:0)?'włączona':'wyłączona'}">${img130('engine/kontrolka.png')}</span>`).join('')}</div><b>${round+(solved?1:0)} / 6 gotowe</b></div>
   </div></section>${status130()}<div class="h130-next">${solved?btn130('next-code',round===5?'Start samolotu':'Następny kod','class="h130-primary"'):errors>=2?btn130('hint','Podpowiedź'):''}</div>`);
  c.status(message);bindRead130(c,()=>task.prompt);
  const key=k=>{if(solved||starting)return;if(k==='Enter'){check();return;}if(k==='Backspace'||k==='⌫')digits=digits.slice(0,-1);else if(/^\d$/.test(k))digits=(digits+k).slice(0,3);get('[data-code]').textContent=digits||'…';};
  function check(){
   if(solved||starting)return;
   if(digits!==''&&Number(digits)===task.answer){solved=true;c.progress.round('engine',c.mode,round+1);c.tone(4);render(task.equation+(round===5?' · Silniki gotowe!':''));}
   else{errors++;c.status('Sprawdź kod i spróbuj jeszcze raz.');c.animate(get('[data-code]'),[{transform:'translateX(0)'},{transform:'translateX(-5px)'},{transform:'translateX(5px)'},{transform:'translateX(0)'}],{duration:250});get('.h130-engine-lights').classList.add('is-amber');c.later(()=>get('.h130-engine-lights')?.classList.remove('is-amber'),500);if(errors===2)get('.h130-next').innerHTML=btn130('hint','Podpowiedź');}
  }
  c.on(c.root,'click',e=>{
   const b=e.target.closest('[data-h130]');if(!b||b.disabled)return;const [a,k]=b.dataset.h130.split(':');
   if(a==='digit'){c.tap();key(k);}if(a==='check')check();
   if(a==='hint'){c.status(task.hint);c.speak(task.hint);}
   if(a==='next-code'&&solved&&!starting){if(round===5){starting=true;c.takeoff({folder:'engine',label:'Silniki gotowe — start!',onFinish:()=>c.complete('Pilot matematyczny','engine/odznaka.png')});}else{round++;solved=false;digits='';errors=0;render();c.speak(tasks[round].prompt);}}
  });
  c.on(c.root,'keydown',e=>{if(/^(\d|Backspace|Enter)$/.test(e.key)&&!(e.key==='Enter'&&e.target.closest('button'))){e.preventDefault();if(!e.repeat)key(e.key);}});
 }
 render();c.speak(tasks[round].prompt);return {snapshot:()=>({round,digits,solved,errors})};
}
