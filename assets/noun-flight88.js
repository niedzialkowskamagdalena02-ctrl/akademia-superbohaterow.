import {drawQuinjet88} from './quinjet88.js?v=88';

const NOUNS=['pilot','chmura','samolot','kot','rower','plecak','kosmos','zegar','lampa','sowa','lotnisko','książka','drzewo','góry','most','gwiazda','miasto','statek'];
const OTHER=['szybko','leci','niebieski','rysuje','wesoły','zimno','biegnie','duży','słodka','głośno','świeci','mały','czyta','zielony','skacze','mokry','pisze','wysoko'];
const guide='Steruj samolotem palcem lub strzałkami. Wlatuj w rzeczowniki. Omijaj inne słowa i przeszkody.';
const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));

export function flightGates88(random=Math.random){
 const order=items=>items.map(word=>[word,random()]).sort((a,b)=>a[1]-b[1]).map(([word])=>word);
 const nouns=order(NOUNS),others=order(OTHER);
 return nouns.slice(0,12).map((word,index)=>{
  const goal=Math.floor(random()*3);
  return Array.from({length:3},(_,lane)=>{
   if(lane===goal)return {word,noun:true};
   if((index+lane)%4===0)return null;
   return index>=3&&(index+lane)%5===0?{rock:true}:{word:others[(index+lane*5)%others.length]};
  });
 });
}
export function flightHit88(state,gate){
 if(!gate||state.hearts<=0)return '';
 if(gate.noun){state.score++;return 'Rzeczownik: '+gate.word+'!';}
 state.hearts--;
 return gate.rock?'Uwaga, przeszkoda!':gate.word+' to nie rzeczownik.';
}
export function flightMarkup88(button,voice){
 return `<section class="hq88-flight">
  <h3>✈️ Lot po rzeczowniki</h3><p class="hq88-flight-rules">${guide} ${voice(guide)}</p>
  <div class="hq88-flight-score"><span data-flight-score>Rzeczowniki 0</span><span data-flight-hearts>Osłony 3</span></div>
  <div class="hq88-flight-gates" aria-label="Najbliższe bramki: lewa, środkowa i prawa"><span>—</span><span>—</span><span>—</span></div>
  <canvas class="hq88-flight-view" tabindex="0" aria-label="Pas lotu. Kieruj strzałkami lub dotknij lewego, środkowego albo prawego pasa."></canvas>
  <div class="hq88-flight-controls">
   ${button('◀','hq:flight:left','alt')}${button('Start','hq:flight:start','gold')}${button('▶','hq:flight:right','alt')}
  </div><p class="hq88-flight-status" data-flight-status role="status" aria-live="polite">Kliknij Start, żeby wystartować.</p>
 </section>`;
}

let cleanup=()=>{};
export function mountNounFlight88(root,paint){
 cleanup();cleanup=()=>{};
 const game=root?.querySelector('.hq88-flight');
 if(!game)return;
 const canvas=game.querySelector('canvas'),ctx=canvas.getContext('2d');
 if(!ctx)return;
 const score=game.querySelector('[data-flight-score]'),hearts=game.querySelector('[data-flight-hearts]');
 const status=game.querySelector('[data-flight-status]'),start=game.querySelector('[data-action="hq:flight:start"]');
 const lanes=[...game.querySelectorAll('.hq88-flight-gates span')];
 const controller=new AbortController(),{signal}=controller;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 let width=0,height=0,frame=0,last=0,time=0,position=0,lane=0,run=null;
 function schedule(){if(!frame)frame=requestAnimationFrame(draw);}
 function resize(){
  const size=canvas.getBoundingClientRect(),density=Math.min(devicePixelRatio||1,1.8);
  width=size.width;height=size.height;
  canvas.width=Math.round(width*density);canvas.height=Math.round(height*density);
  ctx.setTransform(density,0,0,density,0,0);
  schedule();
 }
 function feedback(message){
  score.textContent='Rzeczowniki '+(run?.score??0);
  hearts.textContent='Osłony '+(run?.hearts??3);
  const gates=run?.active?run.gates[run.index]:[];
  lanes.forEach((node,index)=>{node.textContent=gates[index]?.word??(gates[index]?.rock?'Przeszkoda':'—');});
  if(message)status.textContent=message;
 }
 function begin(){
  run={gates:flightGates88(),index:0,score:0,hearts:3,at:0,active:true};
  last=0;lane=0;position=0;time=0;start.textContent='Od nowa';
  feedback('Lot rozpoczęty. Szukaj rzeczowników.');canvas.focus({preventScroll:true});schedule();
 }
 function steer(next){
  lane=clamp(next,-1,1);
  schedule();
 }
 game.addEventListener('click',event=>{
  const action=event.target.closest('button')?.dataset.action;
  if(action==='hq:flight:start')begin();
  if(action==='hq:flight:left')steer(lane-1);
  if(action==='hq:flight:right')steer(lane+1);
 },{signal});
 const pointer=event=>{
  const {left,width}=canvas.getBoundingClientRect();
  steer(Math.floor((event.clientX-left)/width*3)-1);
 };
 canvas.addEventListener('pointerdown',event=>{canvas.setPointerCapture(event.pointerId);pointer(event);},{signal});
 canvas.addEventListener('pointermove',event=>{if(canvas.hasPointerCapture(event.pointerId))pointer(event);},{signal});
 game.addEventListener('keydown',event=>{
  if(event.key!=='ArrowLeft'&&event.key!=='ArrowRight')return;
  event.preventDefault();steer(lane+(event.key==='ArrowLeft'?-1:1));
 },{signal});
 const period=()=>Math.max(1.65,2.65-(run?.index??0)*.068);
 function draw(now){
  frame=0;
  if(!width||!height)return;
  const dt=last?Math.min(.065,(now-last)/1000):0;
  last=now;
  if(run?.active){
   time+=dt;run.at+=dt;
   if(run.at>=period()){
    run.at=0;
    const hit=run.gates[run.index][lane+1];
    const message=flightHit88(run,hit);
    run.index++;
    run.active=run.hearts>0&&run.index<run.gates.length;
    feedback(run.active?message:'Lot zakończony. Zebrane rzeczowniki: '+run.score+' z '+run.gates.length+'.');
    if(!run.active)start.textContent='Poleć jeszcze raz';
   }
  }
  position+=(lane-position)*(reduced?1:Math.min(1,(dt||.016)*13));
  const horizon=height*.36,focal=Math.min(width*.72,height*.97),distance=4.1;
  const project=([x,y,z])=>z>.20?[width*.5+x*focal/z,horizon+(1.8-y)*focal/z,z]:null;
  const sky=ctx.createLinearGradient(0,0,0,height);
  sky.addColorStop(0,'#112d68');sky.addColorStop(.43,'#388aba');sky.addColorStop(.66,'#90dcf1');sky.addColorStop(1,'#446eb5');
  ctx.fillStyle=sky;ctx.fillRect(0,0,width,height);
  const sunX=width*.82,sunY=height*.21;
  const glow=ctx.createRadialGradient(sunX,sunY,0,sunX,sunY,height*.49);
  glow.addColorStop(0,'#ffeac38a');glow.addColorStop(.4,'#ffaa8745');glow.addColorStop(1,'#ffaa8700');
  ctx.fillStyle=glow;ctx.fillRect(0,0,width,height);
  ctx.fillStyle='#fff2c8';ctx.beginPath();ctx.arc(width*.82,height*.21,Math.min(width,height)*.072,0,Math.PI*2);ctx.fill();
  for(let ridge=0;ridge<3;ridge++){
   const h=height*(.57+ridge*.10);
   ctx.fillStyle=['#829bce','#688fc3','#456fa8'][ridge];ctx.beginPath();ctx.moveTo(0,height);
   for(let x=0;x<=width+8;x+=8){
    const phase=x/width*15+ridge*1.77;
    ctx.lineTo(x,h-(Math.sin(phase*.71)+Math.sin(phase*1.44)*.35)*height*.075);
   }
   ctx.lineTo(width,height);ctx.closePath();ctx.fill();
  }
  for(let i=0;i<22;i++){
   const z=2.3+((i*3.91-time*8)%65+65)%65;
   const x=(i%2?1:-1)*(3+i%4*1.56);
   const [cx,cy]=project([x,-.42,z]),r=focal*(.53+i%3*.17)/z;
   const cloud=ctx.createLinearGradient(0,cy-r*.54,0,cy+r*.52);
   cloud.addColorStop(0,'#f4ffffe6');cloud.addColorStop(1,'#91b0d88c');ctx.fillStyle=cloud;
   for(let j=-1;j<=1;j++){ctx.beginPath();ctx.ellipse(cx+j*r*.76,cy-j*j*r*.2,r,.44*r,0,0,Math.PI*2);ctx.fill();}
  }
  for(const x of [-2.6,-.87,.87,2.6]){
   for(let j=0;j<12;j++){
    const z=2.5+((j*3.5-time*8)%42+42)%42;
    const a=project([x,.15,z]),b=project([x,.15,z+1.22]);
    ctx.strokeStyle='#b3f1ff9c';ctx.lineWidth=Math.max(1,8/z);
    ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.stroke();
   }
  }
  if(run?.active){
   const progress=run.at/period(),z=distance+17*(1-progress)**1.65;
   run.gates[run.index].forEach((entry,i)=>{
    if(!entry)return;
    const x=(i-1)*1.73,p=project([x,1.19,z]),scale=focal/z;
    if(entry.rock){
     ctx.fillStyle='#69527d';ctx.strokeStyle='#fff2cb';ctx.lineWidth=Math.min(2,scale*.16);
     ctx.beginPath();
     for(let n=0;n<6;n++){const a=n*Math.PI/3;ctx.lineTo(p[0]+Math.cos(a)*scale*.53,p[1]+Math.sin(a)*scale*.40);}
     ctx.closePath();ctx.fill();ctx.stroke();return;
    }
    const font=clamp(scale*.29,7,17),w=Math.min(width*.32,scale*1.64),h=Math.max(17,scale*.55);
    ctx.fillStyle='#173b71';ctx.strokeStyle='#bbf4ff';ctx.lineWidth=Math.min(2,scale*.11);
    ctx.beginPath();ctx.roundRect(p[0]-w/2,p[1]-h/2,w,h,Math.min(9,h*.27));ctx.fill();ctx.stroke();
    ctx.fillStyle='#fff';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='bold '+font+'px system-ui';
    ctx.fillText(entry.word,p[0],p[1],w*.90);
   });
  }
  drawQuinjet88(ctx,project,{x:position*1.73,y:.27,z:distance,scale:.71,bank:reduced?0:(lane-position)*-.37,paint});
  if(run?.active||Math.abs(position-lane)>.015)schedule();else last=0;
 }
 const observer=new ResizeObserver(resize);observer.observe(canvas);resize();
 cleanup=()=>{controller.abort();observer.disconnect();cancelAnimationFrame(frame);};
}
