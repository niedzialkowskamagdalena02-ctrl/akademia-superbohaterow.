import {gameGroup92,shuffle92} from './learning-games92.js?v=92';
import {mountTrace92} from './learning-trace92.js?v=95';
import {schoolMissions93,preschoolMissions93,captainMissions93,aceMissions93,missionDeck93} from './missions93-data.js?v=93';

const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const button=(text,action,attributes='')=>`<button type="button" data-mission93="${action}" ${attributes}>${text}</button>`;
const sound=(text,lang='pl-PL')=>`<button type="button" class="sq93-voice" data-sq93-say="${esc(text)}" data-lang="${lang}" aria-label="Odsłuchaj: ${esc(text)}">🔊</button>`;
const repeat=(count,fn)=>Array.from({length:count},(_,i)=>fn(i)).join('');
const directionLabels={left:'⬅ Lewo',right:'➡ Prawo',up:'⬆ W górę',down:'⬇ W dół'};
const colorCards=[['red','Czerwona wyspa'],['blue','Niebieska wyspa'],['green','Zielona wyspa']];
const gardenSpots=[[15,29],[43,20],[75,30],[28,52],[59,54],[82,61],[19,78],[60,83]];
const limit=(n,min,max)=>Math.max(min,Math.min(max,n));
const rowCol=index=>[Math.floor(index/7),index%7];
const readyShape=(expected,actual)=>expected.rows===actual.rows&&expected.columns===actual.columns;
const continents=[
 [[.04,.22],[.13,.15],[.22,.20],[.34,.25],[.31,.34],[.23,.38],[.23,.46],[.26,.50],[.22,.52],[.16,.40],[.12,.36]],
 [[.24,.51],[.32,.49],[.41,.55],[.38,.65],[.33,.72],[.30,.85],[.27,.82],[.28,.65],[.24,.59]],
 [[.31,.16],[.36,.12],[.40,.16],[.38,.26],[.32,.23]],
 [[.45,.34],[.48,.24],[.55,.22],[.60,.18],[.67,.23],[.72,.19],[.85,.23],[.94,.27],[.89,.36],[.79,.36],[.79,.45],[.71,.53],[.67,.42],[.61,.45],[.56,.36],[.50,.40]],
 [[.43,.41],[.51,.37],[.58,.43],[.59,.50],[.56,.57],[.54,.71],[.49,.71],[.46,.58],[.42,.51]],
 [[.74,.52],[.82,.55],[.88,.62],[.81,.60]],
 [[.77,.69],[.85,.60],[.93,.66],[.94,.77],[.86,.79],[.79,.75]],
 [[.02,.89],[.16,.90],[.22,.88],[.43,.91],[.52,.87],[.62,.90],[.81,.89],[.98,.91],[.98,.98],[.02,.98]]
];

export function paintWorld(canvas){
 const ctx=canvas?.getContext('2d');if(!ctx)return;
 const w=canvas.width,h=canvas.height;
 ctx.fillStyle='#287fa1';ctx.fillRect(0,0,w,h);
 ctx.fillStyle='#92e5f43d';ctx.fillRect(0,0,w,h*.19);ctx.fillRect(0,h*.87,w,h*.13);
 ctx.fillStyle='#f9db8233';ctx.fillRect(0,h*.36,w,h*.23);
 ctx.strokeStyle='#d4f9ff73';ctx.lineWidth=1;ctx.setLineDash([5,6]);
 for(const y of [.2,.37,.5,.63,.86]){ctx.beginPath();ctx.moveTo(0,h*y);ctx.lineTo(w,h*y);ctx.stroke();}
 ctx.setLineDash([]);ctx.strokeStyle='#c1e5bc';ctx.lineWidth=2;
 for(const [i,polygon] of continents.entries()){
  ctx.fillStyle=i===2||i===7?'#deedf4':'#70a65f';ctx.beginPath();
  polygon.forEach(([x,y],index)=>{if(index)ctx.lineTo(x*w,y*h);else ctx.moveTo(x*w,y*h);});
  ctx.closePath();ctx.fill();ctx.stroke();
 }
}

export function chocolateSelection93(start,end){
 const [r1,c1]=rowCol(start),[r2,c2]=rowCol(end);
 return {top:Math.min(r1,r2),left:Math.min(c1,c2),rows:Math.abs(r1-r2)+1,columns:Math.abs(c1-c2)+1};
}

let dispose=()=>{},music;
const notes=[261.63,293.66,329.63,349.23,392,440,493.88,523.25];
export function missionNote93(index){
 const Audio=globalThis.AudioContext??globalThis.webkitAudioContext;
 if(!Audio||globalThis.localStorage?.getItem('academy-v72-training-silent')==='1')return;
 try{
  music??=new Audio();
  if(music.state==='suspended')void music.resume().catch(()=>{});
  const oscillator=music.createOscillator(),gain=music.createGain(),now=music.currentTime;
  oscillator.frequency.value=notes[index%notes.length];oscillator.type='sine';
  gain.gain.setValueAtTime(.001,now);gain.gain.exponentialRampToValueAtTime(.075,now+.016);
  gain.gain.exponentialRampToValueAtTime(.001,now+.24);
  oscillator.connect(gain).connect(music.destination);oscillator.start(now);oscillator.stop(now+.25);
 }catch{}
}

export function mountMissions93(root,{grade,flight=false,speak=()=>{},tap=()=>{},tone=()=>{},legacy=false,initialGame='',oneRound=false,onFinish=()=>{},onBack=null,subject='all'}={}){
 dispose();dispose=()=>{};
 if(!root)return;
 const group=gameGroup92(grade);
 if(!group)return;
 const preschool=group==='preschool';
 const games=flight?(preschool?captainMissions93:aceMissions93):(preschool?preschoolMissions93:schoolMissions93);
 const controller=new AbortController(),{signal}=controller;
 let id='',deck=[],turn=0,state=null,finishCount=0,misses=0,timeout=0,ticker=0,gesture=null,ignoreClickUntil=0;
 const on=(name,listener)=>root.addEventListener(name,listener,{signal});
 const task=()=>deck[turn];
 const say=(text,lang='pl-PL')=>speak(text,lang);
 function cancelClock(){
  clearTimeout(timeout);timeout=0;clearInterval(ticker);ticker=0;
 }
 dispose=()=>{cancelClock();controller.abort();};

 function catalog(){
  cancelClock();id='';root.dataset.mission='';
  const heading=flight?(preschool?'Mały Kapitan':'As Przestworzy'):(preschool?'Zabawy dla przedszkolaka':'Gry do nauki mnożenia');
  root.innerHTML=`<div class="sq93-catalog${flight?' sq93-cockpit':''}">
   <header><h2>${heading}</h2>${preschool?sound('Jesteś w '+(flight?'kokpicie. Wybierz misję lotniczą.':'sali zabaw. Wybierz grę.')):''}</header>
   <div class="sq93-menu">${games.map(([key,icon,name,desc])=>`<div class="sq93-game-card">
    ${button(`<span aria-hidden="true">${icon}</span><strong>${name}</strong><small>${desc}</small>`,'play-'+key)}
    ${preschool?sound(name+'. '+desc):''}</div>`).join('')}</div>
   ${flight&&legacy?'<button type="button" class="alt" data-action="hq:flight">✈ Klasyczny lot Quinjetem</button>':''}</div>`;
 }
 function shell(content,feedback=''){
  const [,icon,title]=games.find(row=>row[0]===id);
  root.dataset.mission=id;
  root.innerHTML=`<header class="sq93-top">${button('‹ '+(flight?'Kokpit':'Wszystkie gry'),'catalog')}
   <h2 tabindex="-1">${icon} ${title}</h2>${preschool?sound(flight?'Wróć do kokpitu':'Wróć do listy gier'):''}</header>${content}
   <p class="sq93-feedback" data-sq93-feedback role="status">${esc(feedback)}</p>`;
 }
 function preview(key){
  if(!games.some(row=>row[0]===key))return;
  cancelClock();id=key;turn=0;state=null;gesture=null;
  const desc=games.find(row=>row[0]===id)[3];
  shell(`<section class="sq93-brief sq93-scene">${preschool?sound(desc):''}<p data-game-prompt>${desc}</p>
   ${button(id==='snail'?'Wejdź do ogrodu':'Zaczynamy','start','class="sq93-primary"')}${preschool?sound('Zaczynamy'):''}</section>`);
  if(preschool)say(desc);
  if(oneRound)start();
 }
 function start(){
  if(!id)return;
  if(id==='snail'){
   shell('<div class="sq93-snail" data-sq93-trace></div>');
   mountTrace92(root.querySelector('[data-sq93-trace]'),{speak,tap,snail:true,onFinish});say('Poprowadź ślimaka od zielonej kropki do czerwonej. Zbieraj liście.');return;
  }
  deck=missionDeck93(id,grade);
  if(id==='camera'&&subject!=='all')deck=deck.filter((_,i)=>i%2===Number(subject==='matematyka'));
  if(oneRound)deck=shuffle92(deck).slice(0,1);
  turn=0;finishCount=0;misses=0;fresh();
 }
 function makeFlightOptions(){
  const wanted=task().needed[state.done.length],options=[
   {label:wanted,value:wanted,words:wanted},
   {label:wanted===1?3:wanted-1,value:wanted===1?3:wanted-1,words:wanted===1?3:wanted-1},
   id==='airballs'?{label:'Burza',value:'storm',icon:'⛈️',words:'Chmura burzowa'}:
    {label:wanted+1,value:wanted+1,words:wanted+1}
  ];
  state.gates=shuffle92(options);
 }
 function fresh(){
  cancelClock();gesture=null;
  const t=task();
  state={done:[],finished:false,selection:null,lane:Math.floor((t.options?.length??3)/2),gateTime:t.time??0,deadline:0,
   phase:t.kind==='memory'?'covered':id==='takeoff'?'lever':t.kind==='cargo'?'cargo':'play',
   input:'',rotate:false,dimensions:null,starErrors:0,counts:{you:0,pirate:0}};
  if(t.kind==='flightSequence')makeFlightOptions();
  draw();
  if((preschool||t.lang)&&t.kind!=='memory')say(t.speech,t.lang);
  if(t.time)resumeTimer();
 }
 function message(words,read=false){
  const p=root.querySelector('[data-sq93-feedback]');
  if(p)p.textContent=words;
  if(read)say(words);
 }
 function shapes(value){
  const [form,color='cyan']=value.split(' ');
  return `<span class="sq93-shape sq93-${form} sq93-${color}" aria-hidden="true"></span>`;
 }
 function option(item,index,{selected=false,blocked=false,action='pick',shape=false,draggable=false}={}){
  const language=task()?.lang??'pl-PL';
  const icon=item.icon?(shape?shapes(item.icon):`<span class="sq93-emoji" aria-hidden="true">${item.icon}</span>`):'';
  const data=draggable?`data-sq93-drag="${index}"`:'';
  const marker=selected?' aria-pressed="true"':'';
  return `<div class="sq93-option${selected?' is-selected':''}">
  ${button(icon+`<span>${esc(item.label)}</span>`,action+'-'+index,(blocked?'disabled ':'')+marker+' '+data)}
  ${preschool||language==='en-US'?sound(item.words??item.label,language):''}</div>`;
 }
 function available(items,settings={}){
  return `<div class="sq93-options">${items.map((item,i)=>option(item,i,{
   ...settings,selected:settings.selected===i,blocked:state.finished||state.done.includes(i)
  })).join('')}</div>`;
 }
 function prompt(words){
  const t=task();
  return `<div class="sq93-prompt"><h3 data-game-prompt lang="${t.lang==='en-US'?'en':'pl'}">${esc(words??t.prompt)}</h3>${sound(t.speech,t.lang)}</div>`;
 }
 function draw(feedback=''){
  const t=task();
  const picture=t.icon?`<div class="sq93-picture" aria-hidden="true">${t.icon}</div>`:'';
  const scene=()=>{
   switch(t.kind){
    case 'baskets':return `<div class="sq93-baskets" aria-label="${t.groups} koszyki po ${t.each} jabłek">${repeat(t.groups,()=>
     `<div class="sq93-basket"><div>${repeat(t.each,()=>'<img src="assets/games80/pictures/apple.svg" alt="Jabłko">')}</div></div>`)}</div>${available(t.options)}`;
    case 'chocolate':return chocolate(t);
    case 'collect':return collect(t);
    case 'sequence':return sequence(t);
    case 'flight':case 'flightSequence':return air(t);
    case 'drop':return `${picture}<div class="sq93-target" data-sq93-drop="target">
     ${button(`${t.targetIcon??'🦕'} <span>${esc(t.drop)}</span>`,'drop',state.finished?'disabled':'')}
     ${preschool?sound(t.drop):''}</div>${available(t.options,{draggable:true})}`;
    case 'rail':return `<div class="sq93-group" data-sq93-drag="group" aria-label="Przedmioty do policzenia">${repeat(t.count,()=>`<span>${t.icon}</span>`)}</div>
     <div class="sq93-wagons">${t.options.map((item,i)=>option(item,i,{action:'wagon',blocked:state.finished})).join('')}</div>`;
    case 'load':return load(t);
    case 'closet':return closet(t);
    case 'memory':return memory(t);
    case 'keypad':return keypad(t);
    case 'map':return map(t);
    case 'cargo':return cargo(t);
    case 'radio':return radio(t);
    case 'radar':return `<div class="sq93-radar">${available(t.options,{shape:true})}</div>`;
    case 'duel':return `<div class="sq93-duel-labels"><span>Twoja karta</span><span>Karta pirata</span></div>${available(t.options)}`;
    default:return picture+available(t.options);
   }
  };
  const hud=`<p class="sq93-progress">⭐ ${turn+1} / ${deck.length}${t.time?` <span><progress max="${t.time}" value="${Math.ceil(state.gateTime)}" data-sq93-progress></progress> <b data-sq93-time>${Math.ceil(state.gateTime)} s</b></span>`:''}</p>`;
  const nextLabel=oneRound||turn+1<deck.length?'Następne zadanie':'Podsumowanie';
  const next=state.finished?`<div class="sq93-next">${button(nextLabel,'next','class="sq93-primary"')}${preschool?sound(nextLabel):''}</div>`:'';
  shell(hud+prompt()+`<div class="sq93-scene sq93-kind-${t.kind}" ${state.finished?'data-win':''}>${scene()}</div>`+next,feedback);
  if(t.kind==='map')paintWorld(root.querySelector('.sq93-world-map'));
 }
 function collect(t){
  if(id==='chameleon')return `<div class="sq93-lizard">${state.done.length?'👅 ':''}🦎 <b>${t.answer}</b></div>${available(t.options)}`;
  return `<div class="sq93-camera" aria-label="Park z ukrytymi znakami">${t.options.map((item,i)=>`<div class="sq93-find" style="--sx:${gardenSpots[i][0]}%;--sy:${gardenSpots[i][1]}%">
   ${option(item,i,{blocked:state.finished||state.done.includes(i),selected:state.done.includes(i)})}</div>`).join('')}</div>
   <p>📸 Zdjęcia: ${state.done.length} / ${t.options.filter(item=>item.value===t.answer).length}</p>`;
 }
 function sequence(t){
  const last=state.done.at(-1);
  return `<div class="sq93-sequence-sign" aria-hidden="true">${id==='frog'?'🏞️':'🛁 🐤'} <strong>${last===undefined?'':esc(t.options[last].label)}</strong></div>
   <div class="sq93-sequence">${t.options.map((item,i)=>option(id==='frog'&&last===i?{...item,icon:'🐸'}:item,i,{selected:state.done.includes(i),blocked:state.finished||state.done.includes(i)})).join('')}</div>`;
 }
 function air(t){
  if(state.phase==='lever')return `<div class="sq93-lever-area" data-sq93-lever>
   ${button('🔴 Pociągnij dźwignię','lever','aria-label="Pociągnij dźwignię startową"')}
   ${sound('Pociągnij dźwignię w dół albo dotknij uchwytu.')}<div aria-hidden="true">⬇</div></div>`;
  const options=t.kind==='flightSequence'?state.gates:t.options;
  const launch=t.kind==='flightSequence'&&id==='takeoff'?'Przeleć przez obręcz':t.shape?'Ląduj':id==='fuel'?'Tankuj':id==='seasons'?'Złap':'Leć';
  const label=id==='space'?'🚀':'✈️';
  const altitude=['airballs','spelling','landing','feeder'].includes(id);
  return `<div class="sq93-air" ${altitude?'data-altitude':''} style="--lanes:${options.length};--lane:${state.lane}">
   ${t.icon?`<div class="sq93-wing" aria-hidden="true">${t.icon}</div>`:''}
   <div class="sq93-gates" data-fly-${id}>${options.map((item,i)=>option(item,i,{
    selected:state.lane===i,action:'lane',shape:t.shape,blocked:state.finished
   })).join('')}</div>
   <div class="sq93-plane-slot"><span class="sq93-plane" aria-hidden="true">${label}</span></div>
   <div class="sq93-flight-actions">
    ${button('⬆','up',`aria-label="Leć w górę" ${state.finished?'disabled':''}`)}
    ${button(launch,'fly',`class="sq93-primary" ${state.finished?'disabled':''}`)}
    ${button('⬇','down',`aria-label="Leć w dół" ${state.finished?'disabled':''}`)}
   </div>${preschool?`<div class="sq93-flight-audio">${sound('Leć w górę')}${sound(launch)}${sound('Leć w dół')}</div>`:''}</div>`;
 }
 function chocolate(t){
  const marks=state.dimensions;
  return `<div class="sq93-chocolate" aria-label="Forma na czekoladki">${repeat(49,i=>{
   const [row,col]=rowCol(i);
   const active=marks&&row>=marks.top&&row<marks.top+marks.rows&&col>=marks.left&&col<marks.left+marks.columns;
   return button('', 'cell-'+i,`data-sq93-cell="${i}" aria-label="Rząd ${row+1}, kostka ${col+1}" aria-pressed="${!!active}" ${state.finished?'disabled':''}`);
  })}</div>
  <p data-sq93-dim>${marks?marks.rows+' × '+marks.columns:'Przeciągnij palcem od jednego rogu do drugiego.'}</p>
  <form data-sq93-form><label for="sq93-amount">Ile kostek razem?</label><input id="sq93-amount" inputmode="numeric" maxlength="3" pattern="[0-9]+" required ${state.finished?'disabled':''}>
  <button type="submit" ${state.finished?'disabled':''}>Sprawdź</button></form>
  ${state.finished?button('⟳ Obróć tabliczkę','rotate') : ''}`;
 }
 function closet(t){
  return `<div class="sq93-bear" aria-hidden="true">🧸 ${state.selection!==null?'👕 '+esc(t.tops[state.selection].label):''}</div>
   <h4>Koszulki</h4><div class="sq93-options">${t.tops.map((item,i)=>option({...item,icon:'👕'},i,{
    action:'top',selected:state.selection===i,blocked:state.finished||state.done.includes(item.value)
   })).join('')}</div>
   <h4>Spodenki</h4><div class="sq93-options">${t.bottoms.map((item,i)=>option({...item,icon:'🩳'},i,{
    action:'bottom',blocked:state.finished||state.done.includes(item.value)
   })).join('')}</div>`;
 }
 function memory(t){
  const showing=state.phase==='show';
  const plate=`<div class="sq93-plate" aria-label="Talerz">${showing?repeat(t.answer,()=>'<span aria-hidden="true">🍪</span>'):'<span class="sq93-napkin" aria-label="Serwetka"></span>'}</div>`;
  return plate+(state.phase==='answer'||state.finished?available(t.options):'')+
   (showing||state.finished?'':`<div class="sq93-next">${button(state.phase==='answer'?'Pokaż jeszcze raz':'Podnieś serwetkę','reveal','class="sq93-primary"')}${sound(state.phase==='answer'?'Pokaż jeszcze raz':'Podnieś serwetkę')}</div>`);
 }
 function load(t){
  return `<div class="sq93-cabin" data-sq93-drop="target">
   ${repeat(t.count,i=>`<span>${state.done[i]===undefined?(t.seat?'💺':'▢'):(t.seat?'🧸':'🧳')}</span>`)}
   ${button(t.seat?'Posadź na fotelu':'Włóż do luku','drop',state.finished?'disabled':'')}
   ${sound(t.seat?'Posadź misia na fotelu':'Włóż walizkę do luku')}</div>
   ${available(t.options,{draggable:true,selected:state.selection})}`;
 }
 function keypad(t){
  return `<div class="sq93-key-display" aria-live="polite" data-sq93-code>${esc(state.input||'•••')}</div>
   <div class="sq93-keypad">${[1,2,3,4,5,6,7,8,9,'⌫',0,'✓'].map((key,i)=>button(key,'key-'+i,`aria-label="${key==='⌫'?'Usuń cyfrę':key==='✓'?'Uruchom silnik':key}" ${state.finished?'disabled':''}`)).join('')}</div>`;
 }
 function map(t){
  const positions=[[50,13],[49,56],[85,68],[51,88]];
  const [x,y]=positions[state.selection]??[12,23];
  return `<div class="sq93-map"><div class="sq93-map-stage">
   <canvas class="sq93-world-map" width="620" height="300" aria-label="Mapa świata z pasami klimatycznymi"></canvas>
   <div class="sq93-world-plane" style="--map-x:${x}%;--map-y:${y}%" aria-hidden="true">✈️ ${state.finished?'📦':''}</div></div>
   <p class="sq93-map-animal" aria-hidden="true">${t.icon}</p>
   <div class="sq93-map-zones">${t.options.map((item,i)=>option(item,i,{
    action:'zone',selected:state.selection===i,blocked:state.finished
   })).join('')}</div></div>
   <div class="sq93-next">${button('Zrzuć paczkę','dispatch',state.finished?'disabled':'class="sq93-primary"')}${sound('Zrzuć paczkę')}</div>`;
 }
 function cargo(t){
  if(state.phase==='cargo')return `<div class="sq93-loading">
   ${button('📦 '+esc(t.word),'crate','data-sq93-drag="0" aria-label="Skrzynia ze słowem '+esc(t.word)+'"')}
   <div class="sq93-target" data-sq93-drop="target">${button('🛩️ Załaduj do samolotu','cargo-load')}</div></div>`;
  return `<p>🛩️ Ładunek: <strong>${esc(t.word)}</strong></p>${available(t.options,{action:'hangar'})}`;
 }
 function radio(t){
  return `<div class="sq93-cockpit-display"><span aria-hidden="true">✈️ ${state.direction?directionLabels[state.direction]:''}</span>
   <div class="sq93-flight-actions">${Object.entries(directionLabels).map(([dir,label])=>button(label,'dir-'+dir,
    `aria-pressed="${state.direction===dir}" ${state.finished?'disabled':''}`)).join('')}</div>
   ${t.color?`<div class="sq93-islands">${colorCards.map(([color,label])=>button(label,'color-'+color,
    `class="sq93-${color}" aria-pressed="${state.color===color}" ${state.finished?'disabled':''}`)).join('')}</div>`:''}
   ${button('Wykonaj manewr','manoeuvre',state.finished?'disabled':'class="sq93-primary"')}</div>`;
 }
 function complete(words='',scored=true){
  if(state.finished)return;
  cancelClock();state.finished=true;gesture=null;
  if(scored){finishCount++;tone(7);}
  const result=words||task().explain||'Brawo!';
  draw(result);
  if(preschool)say(result);
 }
 function retry(words='Spróbuj jeszcze raz.'){
  state.starErrors++;message(words,preschool);
 }
 function resumeTimer(){
  if(!task().time||state.finished)return;
  clearInterval(ticker);
  if(!state.deadline)state.deadline=Date.now()+state.gateTime*1000;
  ticker=setInterval(()=>{
   const left=Math.max(0,(state.deadline-Date.now())/1000);
   state.gateTime=left;
   const bar=root.querySelector('[data-sq93-progress]'),label=root.querySelector('[data-sq93-time]');
   if(bar)bar.value=left;
   if(label)label.textContent=Math.ceil(left)+' s';
   if(left<=0){
    state.deadline=0;state.gateTime=task().time;clearInterval(ticker);ticker=0;
    draw(id==='fuel'?'Paliwo się skończyło. Jesteś przy kolejnej próbie tankowania.':'Bramy przelatują ponownie. Spróbuj jeszcze raz.');resumeTimer();
   }
  },100);
 }
 function judge(value){
  if(state.finished)return;
  const t=task();
  if(value===t.answer)complete(t.explain);
  else{
   if(id==='fuel'){state.deadline-=2000;retry('Wynik nie pasuje. Tracisz 2 sekundy paliwa.');}
   else if(t.kind==='duel'){misses++;complete('Punkt dla pirata. '+t.explain,false);}
   else retry();
  }
 }
 function setLane(index,repaint=true){
  const options=task().kind==='flightSequence'?state.gates:task().options;
  if(!options)return;
  state.lane=limit(index,0,options.length-1);
  if(repaint){
   root.querySelector('.sq93-air')?.style.setProperty('--lane',state.lane);
   root.querySelectorAll('.sq93-gates [data-mission93]').forEach((button,i)=>{
    button.setAttribute('aria-pressed',String(i===state.lane));
    button.parentElement.classList.toggle('is-selected',i===state.lane);
   });
  }
 }
 function fly(){
  const t=task(),options=t.kind==='flightSequence'?state.gates:t.options,item=options[state.lane];
  if(t.time&&Date.now()>=state.deadline)return;
  if(t.kind!=='flightSequence'){judge(item.value);return;}
  const next=t.needed[state.done.length];
  if(item.value!==next)return retry(item.value==='storm'?'Omiń burzę i wybierz balon z liczbą '+next+'.':'Szukamy liczby '+next+'.');
  state.done.push(next);tone(state.done.length);
  if(state.done.length===t.needed.length)complete('Brawo! Wszystkie '+(id==='airballs'?'balony złapane.':'obręcze zaliczone.'));
  else{
   makeFlightOptions();draw('Następna liczba: '+t.needed[state.done.length]+'.');
   root.querySelector('.sq93-plane')?.animate?.([{transform:'scale(.65) translateY(-14px)'},{transform:'scale(1)'}],{duration:220});
  }
 }
 function pick(index){
  const t=task(),item=t.options?.[index];
  if(!item||state.done.includes(index))return;
  if(t.kind==='collect'){
   if(item.value!==t.answer)return retry();
   state.done.push(index);tone(state.done.length);
   const count=t.options.filter(it=>it.value===t.answer).length;
   if(state.done.length===count)complete(id==='camera'?'Wszystkie zdjęcia zrobione!':'Wszystkie pasujące muchy złapane!');
   else draw(id==='camera'?'Zdjęcie zrobione.':'Kameleon złapał muchę!');
  }else if(t.kind==='sequence'){
   if(item.value!==t.needed[state.done.length])return retry('Spróbuj najpierw znaleźć '+t.needed[state.done.length]+'.');
   state.done.push(index);tone(state.done.length-1);
   if(state.done.length===t.needed.length)complete(id==='frog'?'Żabka jest na drugim brzegu!':'Gama zagrana! Brawo!');
   else draw();
  }else if(t.kind==='drop'||t.kind==='load'){
   place(index,false);
  }else judge(item.value);
 }
 function place(index,dragged){
  const t=task(),item=t.options[index];
  if(!item||state.done.includes(index))return;
  if(item.value!==t.answer)return retry();
  if(t.kind==='drop'){complete(t.explain);return;}
  if(t.kind==='load'){
   state.done.push(index);state.selection=null;tone(state.done.length);
   if(state.done.length===t.count)complete(t.seat?'Misie siedzą na fotelach!':'Wszystkie właściwe walizki w luku!');
   else draw(dragged?'Na miejscu.':'Włożone. Wybierz następny przedmiot.');
  }
 }
 function reveal(){
  state.phase='show';draw();
  timeout=setTimeout(()=>{state.phase='answer';draw('Ile ciasteczek było na talerzu?');say('Ile ciasteczek było na talerzu?');},2600);
 }
 function handle(action){
  if(action.startsWith('play-'))return preview(action.slice(5));
  if(action==='catalog')return onBack?onBack():catalog();
  if(action==='start')return start();
  if(!state)return;
  if(action==='next'&&state.finished){
   if(oneRound){onFinish();return;}
   if(++turn<deck.length){fresh();return;}
   const note=id==='duel'?'Twoje punkty: '+finishCount+' · Punkty pirata: '+misses:'Ukończone rundy: '+finishCount+' / '+deck.length;
   shell(`<div class="sq93-summary"><b aria-hidden="true">🏆</b><h3>Misja ukończona</h3><p>${note}</p>${button('Zagraj ponownie','start','class="sq93-primary"')}${preschool?sound('Zagraj ponownie'):''}</div>`);
   if(preschool)say('Brawo! Misja ukończona.');
   return;
  }
  if(action==='rotate'&&state.finished&&task().kind==='chocolate'){
   state.rotate=!state.rotate;state.dimensions={top:0,left:0,rows:state.rotate?task().columns:task().rows,columns:state.rotate?task().rows:task().columns};
   draw(task().explain);return;
  }
  if(state.finished)return;
  const t=task(), separator=action.indexOf('-'),name=separator<0?action:action.slice(0,separator);
  const argument=separator<0?'':action.slice(separator+1),i=Number(argument);
  switch(name){
   case 'pick':return pick(i);
   case 'drag':return place(i,true);
   case 'wagon':return judge(t.options[i].value);
   case 'lane':return setLane(i);
   case 'up':return setLane(state.lane-1);
   case 'down':return setLane(state.lane+1);
   case 'fly':return fly();
   case 'lever':if(state.phase==='lever'){state.phase='play';draw('Silnik gotowy.');}return;
   case 'reveal':if(state.phase!=='show')reveal();return;
   case 'top':if(!state.done.includes(t.tops[i].value)){state.selection=i;draw();}return;
   case 'bottom':
    if(state.selection===null)return retry('Najpierw wybierz koszulkę.');
    if(t.tops[state.selection].value!==t.bottoms[i].value)return retry();
    state.done.push(t.bottoms[i].value);state.selection=null;tone(state.done.length);
    if(state.done.length===t.count)complete('Miś ma wszystkie komplety!');else draw('Pasują do siebie!');
    return;
   case 'zone':state.selection=i;draw();return;
   case 'dispatch':
    return state.selection===null?retry('Wybierz strefę, nad którą chcesz zrzucić paczkę.'):judge(t.options[state.selection].value);
   case 'hangar':return judge(t.options[i].value);
   case 'crate':case 'cargo':state.phase='deliver';draw('Ładunek w samolocie. Wybierz hangar.');return;
   case 'dir':state.direction=argument;draw();return;
   case 'color':state.color=argument;draw();return;
   case 'manoeuvre':
    return state.direction===t.direction&&(!t.color||state.color===t.color)?complete('Great flying!'):retry('Odsłuchaj komunikat i spróbuj jeszcze raz.');
   case 'drop':
    return state.selection===null?retry('Przeciągnij lub dotknij wybranego przedmiotu.'):place(state.selection,false);
   case 'cell':return cell(i);
  }
 }
 function cell(index){
  if(state.corner===undefined){state.corner=index;state.dimensions=chocolateSelection93(index,index);}
  else{state.dimensions=chocolateSelection93(state.corner,index);delete state.corner;}
  paintChocolate();
 }
 function paintChocolate(){
  const {top,left,rows,columns}=state.dimensions;
  for(const el of root.querySelectorAll('[data-sq93-cell]')){
   const [r,c]=rowCol(Number(el.dataset.sq93Cell));
   el.setAttribute('aria-pressed',String(r>=top&&r<top+rows&&c>=left&&c<left+columns));
  }
  root.querySelector('[data-sq93-dim]').textContent=rows+' × '+columns;
 }
 function keyInput(i){
  if(i===11){judge(Number(state.input||NaN));return;}
  state.input=i===9?state.input.slice(0,-1):(state.input+(i===10?'0':String(i+1))).slice(0,3);
  root.querySelector('[data-sq93-code]').textContent=state.input||'•••';
 }
 on('click',event=>{
  const audio=event.target.closest('[data-sq93-say]');
  if(audio){tap();say(audio.dataset.sq93Say,audio.dataset.lang);return;}
  const target=event.target.closest('[data-mission93]');
  if(!target||target.disabled||event.detail&&performance.now()<ignoreClickUntil)return;
  tap();
  const action=target.dataset.mission93;
  if(action.startsWith('key-')&&!state.finished){keyInput(Number(action.slice(4)));return;}
  if(action.startsWith('pick-')&&['drop','load'].includes(task()?.kind)&&state&&!state.finished){
   const index=Number(action.slice(5));
   if(state.selection!==index){
    state.selection=index;draw('Wybrano. Możesz teraz dotknąć celu albo ponownie przedmiotu.');return;
   }
  }
  handle(action);
 });
 on('submit',event=>{
  if(!event.target.matches('[data-sq93-form]'))return;
  event.preventDefault();tap();
  if(!state.dimensions||!readyShape(task(),state.dimensions))return retry('Najpierw ułóż tabliczkę o zamówionych wymiarach.');
  judge(Number(event.target.querySelector('input').value));
 });
 on('keydown',event=>{
  if(!state||state.finished||!task()||event.target.matches('input,select,textarea')||state.phase==='lever')return;
  const t=task();
  if(['flight','flightSequence'].includes(t.kind)){
   if(['ArrowLeft','ArrowUp','ArrowDown','ArrowRight'].includes(event.key)){
    event.preventDefault();setLane(state.lane+(['ArrowLeft','ArrowUp'].includes(event.key)?-1:1));
   }else if(event.key===' '&&!event.target.matches('button')){
    event.preventDefault();fly();
   }
  }else if(t.kind==='keypad'&&/^\d$/.test(event.key)){event.preventDefault();keyInput(event.key==='0'?10:Number(event.key)-1);}
 });
 on('pointerdown',event=>{
  if(event.button!==0||!state||state.finished||gesture||event.target.closest('[data-sq93-say]'))return;
  const cell=event.target.closest('[data-sq93-cell]'),piece=event.target.closest('[data-sq93-drag]'),lever=event.target.closest('[data-sq93-lever]');
  if(!cell&&!piece&&!lever)return;
  if(piece?.disabled)return;
  gesture={index:cell?.dataset.sq93Cell??piece?.dataset.sq93Drag,kind:cell?'cell':lever?'lever':'piece',
   id:event.pointerId,x:event.clientX,y:event.clientY,dragging:false,target:cell??piece??lever};
 });
 on('pointermove',event=>{
  if(gesture?.id!==event.pointerId)return;
  if(!gesture.dragging&&Math.hypot(event.clientX-gesture.x,event.clientY-gesture.y)<8)return;
  if(!gesture.dragging){gesture.dragging=true;root.setPointerCapture?.(event.pointerId);}
  if(gesture.kind==='cell'){
   const hit=root.ownerDocument.elementFromPoint(event.clientX,event.clientY)?.closest('[data-sq93-cell]');
   if(hit){
    state.dimensions=chocolateSelection93(Number(gesture.index),Number(hit.dataset.sq93Cell));paintChocolate();
   }
  }else if(gesture.kind==='piece'){
   gesture.target.style.setProperty('--mx',event.clientX-gesture.x+'px');
   gesture.target.style.setProperty('--my',event.clientY-gesture.y+'px');
   gesture.target.dataset.dragging='';
  }else gesture.target.style.setProperty('--lever',Math.max(0,Math.min(35,event.clientY-gesture.y))+'px');
 });
 function endGesture(event,cancelled){
  if(gesture?.id!==event.pointerId)return;
  const old=gesture;gesture=null;
  old.target.style.removeProperty('--mx');old.target.style.removeProperty('--my');old.target.style.removeProperty('--lever');
  delete old.target.dataset.dragging;
  if(!old.dragging||cancelled)return;
  ignoreClickUntil=performance.now()+290;
  const hit=root.ownerDocument.elementFromPoint(event.clientX,event.clientY);
  if(old.kind==='cell'){delete state.corner;return;}
  if(old.kind==='lever'){if(event.clientY-old.y>15)handle('lever');return;}
  const from=Number(old.index),target=hit?.closest('[data-mission93^="wagon-"]');
  if(old.index==='group'&&target)return handle(target.dataset.mission93);
  if(hit?.closest('[data-sq93-drop]')){
   if(task().kind==='cargo')handle('cargo-load');
   else handle('drag-'+from);
  }
 }
 on('pointerup',event=>endGesture(event,false));
 on('pointercancel',event=>endGesture(event,true));
 if(initialGame)preview(initialGame);else catalog();
}
