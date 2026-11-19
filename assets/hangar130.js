import {captainMissions93,aceMissions93} from './missions93-data.js?v=103';
import {gameGroup92} from './learning-games92.js?v=92';
import {mountHangar95 as mountLegacy95} from './hangar95.js?v=130';
import {gameIds130,modeNames130,createProgress130} from './hangar130-data.js?v=130';
import {mountEngine130} from './hangar130-flight.js?v=131';
import {mountRings131} from './rings131.js?v=131';
import {mountBalloons130} from './hangar130-balloons.js?v=131';
import {mountBaggage130} from './hangar130-baggage.js?v=131';

export const art130='assets/hangar130/';
export const esc130=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const img130=(path,cls='',alt='')=>`<img class="${cls}" src="${art130+path}" alt="${esc130(alt)}" draggable="false" decoding="async">`;
export const btn130=(action,label,extra='')=>`<button type="button" data-h130="${action}" ${extra}>${label}</button>`;
const tiles={baggage:'01_odprawa_bagazowa',takeoff:'02_lot_przez_obrecze',airballs:'03_slalom_z_balonami',engine:'04_kokpit_matematyczny',spelling:'05_balony_ortograficzne',fuel:'06_tankowanie_w_locie',radar:'07_radar_i_geometria',cargo:'08_sortownia_ladunkow'};
const intros={
 baggage:'Pięć lotów, pięć pieczątek! Wybieraj walizkę lub pasażera, potem miejsce. Możesz także przeciągać elementy. Bez pośpiechu.',
 takeoff:'Pociągnij dźwignię. Oblicz wynik i steruj w lewo lub w prawo, aby przelecieć przez otwór właściwej obręczy. Każda runda czeka na twój pierwszy ruch.',
 airballs:'Steruj samolotem w górę i w dół. Stuknij samolot, aby strzelić w balon z właściwą liczbą. Omijaj burzową chmurę! Błędny balon odpowie strzałem.',
 engine:'Wpisz sześć kodów. Używaj klawiatury na ekranie albo cyfr, Backspace i Enter. Zapalone kontrolki pozostają włączone. Nie ma limitu czasu.'
};
let dispose130=()=>{};
// Only decode the selected game's resources. No animated reference films or mockups are shipped.
const prepared=new Map();
async function prepare130(game){
 const map={baggage:['terminal.jpg','kabina.jpg','walizka.png','walizka_zielona.png','walizka_czerwona.png','walizka_niebieska.png','mis.png','kot.png','pies.png','fotel.png','bilet.png','pas.jpg','samolot.png','paszport.png','nowy_jork.jpg'],takeoff:['instruments.webp','odznaka.png'],engine:['kokpit.jpg','pas.jpg','samolot.png','kontrolka.png','wskaznik.png','odznaka.png'],airballs:['balon_rozowy.png','balon_pomaranczowy.png','samolot.png','chmura.png','piorun.png','pocisk.png','pekniecie_balonu.png','blysk_trafienia.png']};
 const dir={takeoff:'rings',airballs:'balloons'}[game]||game;
 if(!prepared.has(game))prepared.set(game,Promise.all(map[game].map(name=>new Promise((resolve,reject)=>{
  const image=new Image();image.onload=()=>image.decode?.().catch(()=>{}).then(()=>resolve())??resolve();image.onerror=()=>reject(Error('Nie udało się wczytać '+name));image.src=art130+dir+'/'+name;
 }))).catch(e=>{prepared.delete(game);throw e;}));
 return prepared.get(game);
}
export function mountHangar130(root,options={}){
 dispose130();if(!root)return;
 const {grade,preview=false,legacy=false,speak=()=>{},tap=()=>{},tone=()=>{}}=options;
 const progress=createProgress130(options), group=gameGroup92(grade);
 const available=[...captainMissions93,...aceMissions93];
 const catalogGames=group==='preschool'?[...captainMissions93,aceMissions93[0]]:group==='school'?[...captainMissions93.slice(0,3),...aceMissions93]:[];
 const playable=key=>catalogGames.some(r=>r[0]===key)&&(gameIds130.includes(key)||preview);
 const abort=new AbortController();let context=null,oldGame=null,serial=0,current='',disposed=false,pointerTicket=false;
 root.classList.add('h130');root.tabIndex=-1;
 const title=id=>available.find(r=>r[0]===id)?.[2]||'As Przestworzy';
 const speakTask=text=>speak(String(text),'pl-PL');
 function destroy(){serial++;context?.destroy();context=null;oldGame?.stop();oldGame=null;}
 function header(name,back=true){return `<header class="h130-top">${back?btn130('menu','‹ Wróć do kokpitu'):''}<h2 tabindex="-1">${esc130(name)}</h2>${btn130('exit','✕ Wysiądź')}</header>`;}
 function shell(body,name,screen='selection'){
  root.innerHTML=header(name)+body;root.dataset.f95Screen=screen;root.dataset.fl95Mode='130';root.closest('.hq95-cockpit-panel')?.scrollTo?.({top:0});
 }
 function menu(){
  destroy();current='';
  const saved=progress.read();
  const tile=([id,symbol,name])=>{
   const allowed=playable(id),done=gameIds130.includes(id)&&(saved[id+':young']?.complete||saved[id+':captain']?.complete||id==='baggage'&&[0,1,2,3,4].every(i=>saved.stamps?.['young:'+i]||saved.stamps?.['captain:'+i]));
   const art=tiles[id]?img130('menu/'+tiles[id]+'.png'):`<span class="h130-legacy-art" aria-hidden="true">${id==='feeder'?'<img src="assets/art99/feeder-cover.webp" alt="">':esc130(symbol)}</span>`;
   return btn130('game:'+id,`${art}<strong>${esc130(name)}</strong>${done?'<small>✓ Ukończono</small>':''}${allowed?'':'<span class="h130-lock">🔒 W przygotowaniu</span>'}`,`class="h130-tile" ${allowed?'':'disabled'}`);
  };
  const active=catalogGames.filter(r=>gameIds130.includes(r[0])),future=catalogGames.filter(r=>!gameIds130.includes(r[0]));
  root.innerHTML=header('As Przestworzy',false)+`<div class="h130-menu">${img130('menu/panorama.png','h130-panorama','Widok z kokpitu z radarem')}<h3>Wybierz misję</h3><div class="h130-grid">${active.map(tile).join('')}</div><h4>W przygotowaniu</h4><div class="h130-future">${future.map(tile).join('')}${btn130('classic','✈ Klasyczny lot Quinjetem',`class="h130-tile h130-classic" ${preview&&legacy?'':'disabled'}`)}</div></div>`;
  root.dataset.f95Screen='selection';root.dataset.fl95Mode='menu';
 }
 function choose(id){
  if(!playable(id))return;
  destroy();current=id;
  if(!gameIds130.includes(id)){
   root.classList.remove('h130');
   oldGame=mountLegacy95(root,{...options,initialMission:id,onCockpit:()=>{root.classList.add('h130');menu();},onExit:options.onExit});return;
  }
  shell(`<section class="h130-brief">${img130('menu/'+tiles[id]+'.png','h130-brief-art')}<p>${esc130(intros[id])}</p>${btn130('speak', '🔊 Odsłuchaj polecenie')}<h3>Wybierz poziom</h3><div class="h130-modes">${Object.entries(modeNames130).map(([mode,name])=>btn130('play:'+mode,esc130(name),'class="h130-primary"')).join('')}</div><p data-h130-status role="status"></p></section>`,title(id));
 }
 function makeContext(game,mode){
  let active=true,epoch=0,sceneAbort=new AbortController(),timers=new Set(),frames=new Set(),animations=new Set();
  function clean(){epoch++;sceneAbort.abort();sceneAbort=new AbortController();for(const id of timers)clearTimeout(id);timers.clear();for(const id of frames)cancelAnimationFrame(id);frames.clear();for(const a of animations)a.cancel();animations.clear();}
  const c={root,game,mode,progress,speak:speakTask,tone,tap,art:art130,
   reduced:globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches||false,
   get alive(){return active&&!disposed&&root.isConnected;},
   view(body){clean();shell(body,title(game),'play');},
   status(message){const e=root.querySelector('[data-h130-status]');if(e)e.textContent=message;},
   on(target,type,fn,extra={}){target?.addEventListener(type,fn,{...extra,signal:sceneAbort.signal});},
   later(fn,ms){const id=setTimeout(()=>{timers.delete(id);if(c.alive)fn();},ms);timers.add(id);return id;},
   loop(fn){let last=0,id;const version=epoch;const frame=now=>{frames.delete(id);if(!c.alive||epoch!==version)return;const dt=last?Math.min(.04,(now-last)/1000):0;last=now;const keep=root.ownerDocument.hidden||fn(dt,now)!==false;if(keep&&c.alive&&version===epoch){id=requestAnimationFrame(frame);frames.add(id);}};id=requestAnimationFrame(frame);frames.add(id);},
   animate(el,keys,config){if(!el?.animate||c.reduced)return null;const a=el.animate(keys,config);animations.add(a);a.finished.finally(()=>animations.delete(a)).catch(()=>{});return a;},
   destroy(){active=false;clean();},
   complete(label,badge){
    const fresh=progress.complete(game,c.mode);if(fresh)tone(6);
    c.view(`<section class="h130-result">${badge?img130(badge,'h130-badge'):''}<h3>${esc130(label)}</h3><p>Wszystkie zadania zaliczone · ${esc130(modeNames130[c.mode])}</p>${btn130('menu','Wróć do kokpitu','class="h130-primary"')}${btn130('game:'+game,'Zagraj ponownie')}</section>`);
    speakTask(label);
   },
   takeoff({folder='baggage',onFinish,label='Start samolotu'}){
    let done=false;
    c.view(`<div class="h130-launch" style="background-image:url('${art130+folder}/pas.jpg')"><h3>${esc130(label)}</h3><div class="h130-runway-lights" aria-hidden="true"></div>${img130(folder+'/samolot.png','h130-departing-plane')}<div class="h130-cloud-cover" aria-hidden="true"></div></div>${btn130('skip','Pomiń animację')}<p data-h130-status role="status">Światła pasa → przyspieszenie → start</p>`);
    const finish=()=>{if(done||!c.alive)return;done=true;onFinish();};
    c.on(root,'click',e=>{if(e.target.closest('[data-h130="skip"]'))finish();});
    c.later(finish,c.reduced?400:4100);
   }
  };return c;
 }
 async function play(mode){
  if(!modeNames130[mode]||!gameIds130.includes(current))return;
  const id=current,token=++serial;
  root.querySelectorAll('[data-h130^="play:"]').forEach(el=>el.disabled=true);
  const status=root.querySelector('[data-h130-status]');if(status)status.textContent='Przygotowuję obrazy…';
  try{await prepare130(id);}catch(e){if(token===serial){if(status)status.textContent=e.message;root.querySelectorAll('[data-h130^="play:"]').forEach(el=>el.disabled=false);}return;}
  if(token!==serial||disposed||!root.isConnected)return;
  context=makeContext(id,mode);
 ({baggage:mountBaggage130,takeoff:mountRings131,airballs:mountBalloons130,engine:mountEngine130}[id])(context);
 }
 // A release/click that entered the airplane cannot also choose a tile underneath.
 // Keyboard and assistive-technology clicks have detail=0 and remain available.
 root.addEventListener('pointerdown',()=>{pointerTicket=true;},{signal:abort.signal,capture:true});
 root.addEventListener('pointercancel',()=>{pointerTicket=false;},{signal:abort.signal});
 root.addEventListener('click',e=>{
  const button=e.target.closest('[data-h130]');if(!button||button.disabled)return;
  if(e.detail>0&&!pointerTicket){e.preventDefault();e.stopImmediatePropagation();return;}
  pointerTicket=false;
  const [action,arg]=button.dataset.h130.split(':');
  if(['menu','exit','game','play','classic','speak'].includes(action)){e.stopPropagation();tap();}
  if(action==='menu')menu();
  if(action==='exit'){destroy();options.onExit?.();}
  if(action==='game')choose(arg);
  if(action==='play')void play(arg);
  if(action==='classic'){destroy();options.onClassic?.();}
  if(action==='speak')speakTask(intros[current]);
 },{signal:abort.signal});
 dispose130=()=>{disposed=true;destroy();abort.abort();};
 // Entering or re-entering the airplane always lands here, regardless of saved mission state.
 menu();return {stop:dispose130,menu};
}
