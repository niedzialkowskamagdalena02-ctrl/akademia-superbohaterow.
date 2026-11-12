import {drawQuinjet88} from './quinjet88.js?v=88';
import {
 FLIGHT_ROUNDS89,GATES_PER_ROUND89,flightMission89,nextFlightMission89,
 readFlightMission89,saveFlightMission89,flightGates89,flightHit89
} from './flight-missions89.js?v=90';
import {drawFlightSky89,flightSky89} from './flight-sky89.js?v=89';

const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
const laneSpacing=1.38;

export function flightMarkup88(button,voice,{child='',preview=false}={}){
 const mission=flightMission89(readFlightMission89(child,preview));
 return `<section class="hq88-flight" data-flight-phase="ready">
  <h3>✈️ Lot Quinjetem</h3>
  <div class="hq89-flight-round"><b data-flight-topic>Misja 1</b><span data-flight-round>${flightSky89(0).name}</span></div>
  <h4 class="hq90-flight-goal" data-flight-goal>${mission.goal}</h4>
  <p class="hq88-flight-rules"><span data-flight-instruction>${mission.instruction}</span> ${voice(mission.goal+' '+mission.instruction)}</p>
  <div class="hq88-flight-controls">
   ${button('◀','hq:flight:left','alt')}${button('Start','hq:flight:start','gold')}${button('▶','hq:flight:right','alt')}
  </div>
  <div class="hq88-flight-score"><span data-flight-score>Trafienia 0</span><span data-flight-hearts>Osłony 3</span></div>
  <div class="hq88-flight-gates" aria-label="Najbliższe bramki: lewa, środkowa i prawa"><span>—</span><span>—</span><span>—</span></div>
  <canvas class="hq88-flight-view" tabindex="0" aria-label="Pas lotu. Steruj strzałkami lub dotknij pasa. W rundzie z literówkami strzelasz spacją."></canvas>
  <div class="hq89-flight-fire" hidden>${button('✦ Strzał','hq:flight:fire','gold')}</div>
  <p class="hq88-flight-status" data-flight-status role="status" aria-live="polite"></p>
 </section>`;
}

let cleanup=()=>{};
export function mountNounFlight88(root,paint,{child='',preview=false}={}){
 cleanup();cleanup=()=>{};
 const game=root?.querySelector('.hq88-flight');
 if(!game)return;
 const canvas=game.querySelector('canvas'),ctx=canvas.getContext('2d');
 if(!ctx)return;
 const score=game.querySelector('[data-flight-score]'),hearts=game.querySelector('[data-flight-hearts]');
 const status=game.querySelector('[data-flight-status]'),start=game.querySelector('[data-action="hq:flight:start"]');
 const topic=game.querySelector('[data-flight-topic]'),round=game.querySelector('[data-flight-round]');
 const goal=game.querySelector('[data-flight-goal]'),instruction=game.querySelector('[data-flight-instruction]');
 const voice=game.querySelector('.hq88-flight-rules [data-speak]'),panel=game.closest('.hq84-panel');
 const fireControl=game.querySelector('.hq89-flight-fire'),fireButton=fireControl.querySelector('button');
 const lanes=[...game.querySelectorAll('.hq88-flight-gates span')];
 const controller=new AbortController(),{signal}=controller;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 let width=0,height=0,frame=0,last=0,time=0,position=0,lane=0,run=null;
 let nextMission=readFlightMission89(child,preview),mission=flightMission89(nextMission);
 let scenery=flightSky89(0);

 function schedule(){if(!frame)frame=requestAnimationFrame(draw);}
 function resize(){
  const size=canvas.getBoundingClientRect(),density=Math.min(devicePixelRatio||1,1.8);
  width=size.width;height=size.height;
  canvas.width=Math.round(width*density);canvas.height=Math.round(height*density);
  ctx.setTransform(density,0,0,density,0,0);
  schedule();
 }
 function showMission(){
  mission=flightMission89(nextMission);scenery=flightSky89(run?.round??0);
  topic.textContent='Misja '+((run?.round??0)+1);
  round.textContent=scenery.name;
  goal.textContent=mission.goal;
  instruction.textContent=mission.instruction;
  if(voice)voice.dataset.speak=mission.goal+' '+mission.instruction;
 }
 function feedback(message){
  game.dataset.flightPhase=run?.phase??'ready';
  score.textContent='Trafienia '+(run?.score??0);
  hearts.textContent='Osłony '+(run?.hearts??3);
  const gates=run?.phase==='flying'?run.gates[run.index]:[];
  lanes.forEach((node,index)=>{node.textContent=gates[index]?.word??(gates[index]?.rock?'Przeszkoda':'—');});
  markLane();
  fireControl.hidden=run?.phase!=='flying'||!mission.shoot;
  fireButton.disabled=!!run?.shot;
  if(message!==undefined)status.textContent=message;
 }
 function markLane(){
  lanes.forEach((node,index)=>node.toggleAttribute('data-current',run?.phase==='flying'&&index===lane+1));
 }
 function begin(){
  if(run?.phase!=='between')run={round:0,score:0,hearts:3};
  Object.assign(run,{gates:flightGates89(flightMission89(nextMission)),index:0,at:0,phase:'flying',shot:null});
  last=0;lane=0;position=0;
  showMission();
  start.textContent='Od nowa';
  feedback(mission.shoot?'Ustaw samolot na pasie z literówką i naciśnij Strzał.':'Runda rozpoczęta. '+mission.instruction);
  canvas.focus({preventScroll:true});schedule();
 }
 function brief(){
  run=null;lane=0;position=0;last=0;time=0;
  showMission();
  start.textContent='Start';
  feedback('');
  if(panel)panel.scrollTop=0;
  schedule();
 }
 function advance(message){
  run.index++;run.at=0;run.shot=null;
  if(run.hearts>0&&run.index<run.gates.length){feedback(message);return;}

  nextMission=nextFlightMission89(nextMission);
  saveFlightMission89(child,preview,nextMission);
  if(run.hearts>0&&run.round+1<FLIGHT_ROUNDS89){
   run.round++;run.phase='between';showMission();
   start.textContent='Start misji '+(run.round+1);
   feedback(message||'');
   if(panel)panel.scrollTop=0;
  }else{
   run.phase='done';start.textContent='Następny lot';
   feedback([message,'Lot zakończony. Trafienia: '+run.score+' z '+(FLIGHT_ROUNDS89*GATES_PER_ROUND89)+'.'].filter(Boolean).join(' '));
  }
 }
 function steer(next){
  if(run?.phase!=='flying'||run.shot)return;
  lane=clamp(next,-1,1);
  markLane();
  schedule();
 }
 function fire(){
  if(run?.phase!=='flying'||!mission.shoot||run.shot)return;
  const target=run.gates[run.index][lane+1],message=flightHit89(run,mission,target);
  run.shot={lane,correct:target.goal===true,age:0,message};
  feedback(message);schedule();
 }
 game.addEventListener('click',event=>{
  const action=event.target.closest('button')?.dataset.action;
  if(action==='hq:flight:start'){
   if(run?.phase==='flying'||run?.phase==='done')brief();
   else begin();
  }
  if(action==='hq:flight:left')steer(lane-1);
  if(action==='hq:flight:right')steer(lane+1);
  if(action==='hq:flight:fire')fire();
 },{signal});
 const pointer=event=>{
  const {left,width}=canvas.getBoundingClientRect();
  steer(Math.floor((event.clientX-left)/width*3)-1);
 };
 canvas.addEventListener('pointerdown',event=>{canvas.setPointerCapture(event.pointerId);pointer(event);},{signal});
 canvas.addEventListener('pointermove',event=>{if(canvas.hasPointerCapture(event.pointerId))pointer(event);},{signal});
 game.addEventListener('keydown',event=>{
  if(event.code==='Space'&&event.target===canvas&&run?.phase==='flying'&&mission.shoot){
   event.preventDefault();fire();return;
  }
  if(event.key!=='ArrowLeft'&&event.key!=='ArrowRight')return;
  event.preventDefault();steer(lane+(event.key==='ArrowLeft'?-1:1));
 },{signal});
 const period=()=>mission.seconds;
 function draw(now){
  frame=0;
  if(!width||!height)return;
  const dt=last?Math.min(.065,(now-last)/1000):0;
  last=now;
  if(run?.phase==='flying'){
   time+=dt;
   if(run.shot){
    run.shot.age+=dt;
    if(run.shot.age>=.63)advance(run.shot.message);
   }else{
    run.at+=dt;
    if(run.at>=period()){
     const message=mission.shoot?'Minął czas na strzał.':flightHit89(run,mission,run.gates[run.index][lane+1]);
     advance(message);
    }
   }
  }
  position+=(lane-position)*(reduced?1:Math.min(1,(dt||.016)*13));
  const horizon=height*.36,focal=Math.min(width*.72,height*.97),distance=4.1;
  const project=([x,y,z])=>z>.20?[width*.5+x*focal/z,horizon+(1.8-y)*focal/z,z]:null;
  drawFlightSky89(ctx,scenery,width,height);
  for(let i=0;i<22;i++){
   const z=2.3+((i*3.91-time*5)%65+65)%65;
   const x=(i%2?1:-1)*(3+i%4*1.56);
   const [cx,cy]=project([x,-.42,z]),r=focal*(.53+i%3*.17)/z;
   const cloud=ctx.createLinearGradient(0,cy-r*.54,0,cy+r*.52);
   cloud.addColorStop(0,scenery.clouds[0]);cloud.addColorStop(1,scenery.clouds[1]);ctx.fillStyle=cloud;
   for(let j=-1;j<=1;j++){ctx.beginPath();ctx.ellipse(cx+j*r*.76,cy-j*j*r*.2,r,.44*r,0,0,Math.PI*2);ctx.fill();}
  }
  for(const x of [-1.5,-.5,.5,1.5].map(edge=>edge*laneSpacing)){
   for(let j=0;j<12;j++){
    const z=2.5+((j*3.5-time*5)%42+42)%42;
    const a=project([x,.15,z]),b=project([x,.15,z+1.22]);
    ctx.strokeStyle=scenery.rails;ctx.lineWidth=Math.max(1,8/z);
    ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.stroke();
   }
  }
  if(run?.phase==='flying'){
   const progress=run.at/period(),z=distance+17*(1-progress)**1.65;
   run.gates[run.index].forEach((entry,i)=>{
    if(!entry)return;
    const x=(i-1)*laneSpacing,p=project([x,1.19,z]),scale=focal/z;
    if(entry.rock){
     ctx.fillStyle='#69527d';ctx.strokeStyle='#fff2cb';ctx.lineWidth=Math.min(2,scale*.16);
     ctx.beginPath();
     for(let n=0;n<6;n++){const a=n*Math.PI/3;ctx.lineTo(p[0]+Math.cos(a)*scale*.53,p[1]+Math.sin(a)*scale*.40);}
     ctx.closePath();ctx.fill();ctx.stroke();return;
    }
    const font=clamp(scale*.29,7,17),w=Math.min(width*.32,scale*1.64),h=Math.max(17,scale*.55);
    const marked=run.shot?.lane===i-1;
    ctx.fillStyle=marked?(run.shot.correct?'#146856':'#8a3048'):'#173b71';
    ctx.strokeStyle=marked?(run.shot.correct?'#adffdf':'#ffd1b7'):'#bbf4ff';ctx.lineWidth=Math.min(2,scale*.11);
    ctx.beginPath();ctx.roundRect(p[0]-w/2,p[1]-h/2,w,h,Math.min(9,h*.27));ctx.fill();ctx.stroke();
    ctx.fillStyle='#fff';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='bold '+font+'px system-ui';
    ctx.fillText(entry.word,p[0],p[1],w*.90);
   });
   if(run.shot&&!reduced){
    const origin=project([position*laneSpacing,1,distance+.6]),target=project([run.shot.lane*laneSpacing,1.19,z]);
    ctx.save();ctx.globalAlpha=clamp(1-run.shot.age/.42,0,1);
    ctx.strokeStyle=run.shot.correct?'#b5ffdb':'#ffe4aa';ctx.shadowColor=ctx.strokeStyle;ctx.shadowBlur=13;
    ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(origin[0],origin[1]);ctx.lineTo(target[0],target[1]);ctx.stroke();ctx.restore();
   }
  }
  drawQuinjet88(ctx,project,{x:position*laneSpacing,y:.27,z:distance,scale:.58,bank:reduced?0:(lane-position)*-.37,paint});
  if(run?.phase==='flying'||Math.abs(position-lane)>.015)schedule();else last=0;
 }
 const observer=new ResizeObserver(resize);observer.observe(canvas);resize();
 cleanup=()=>{controller.abort();observer.disconnect();cancelAnimationFrame(frame);};
}
