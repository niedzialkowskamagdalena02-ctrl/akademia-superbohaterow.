import {tasks130,choices130,modeNames130,clamp130,ringPass130} from './hangar130-data.js?v=130';
import {img130,btn130,esc130} from './hangar130.js?v=131';

export function taskBar130(c,task,index,total,count=index){return `<section class="h130-task"><div><small>${esc130(modeNames130[c.mode])} · RUNDA ${index+1} / ${total}</small><h3>${esc130(task.prompt)}</h3></div>${btn130('read-task','🔊','aria-label="Powtórz polecenie pilota"')}<b>${count} / ${total}</b></section>`;}
export const status130=()=>'<p class="h130-status" data-h130-status role="status" aria-live="polite"></p>';
export function bindRead130(c,getText){c.on(c.root,'click',e=>{if(e.target.closest('[data-h130="read-task"]'))c.speak(getText());});}
export function pointerPosition130(event,el){const r=el.getBoundingClientRect();return {x:clamp130((event.clientX-r.left)/r.width),y:clamp130((event.clientY-r.top)/r.height)};}

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
