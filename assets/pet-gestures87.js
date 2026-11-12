const clamp=(n,low,high)=>Math.max(low,Math.min(high,n));
const mix=(a,b,t)=>a+(b-a)*t;

export function petTools87(room,playing,asleep){
 if(asleep||!['nest','bath'].includes(room))return '';
 const tool=(id,icon,label)=>`<button type="button" class="hq87-tool" data-pet-tool="${id}" aria-label="${label}" title="${label}">${icon}</button>`;
 return '<canvas class="hq87-pet-effects" aria-hidden="true"></canvas>'+
  (room==='bath'?tool('soap','🧼','Przesuń mydło po zwierzaku')+tool('shower','🚿','Spłucz pianę prysznicem'):
   '<span class="hq87-pet-hand" aria-hidden="true" hidden>🤚</span>'+(playing?tool('ball','<i aria-hidden="true"></i>','Przytrzymaj i rzuć piłkę'):''));
}

export function mountPetGestures87(panel,scene,complete){
 const canvas=scene?.querySelector('.hq87-pet-effects'),animal=scene?.querySelector('.hq86-animal');
 if(!canvas||!animal)return;
 const ctx=canvas.getContext('2d'),help=panel.querySelector('.hq87-gesture-help');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 let width=0,height=0,ratio=1,foam=[],added=0,drag=null,task=false,frame=0;
 const setHelp=text=>{if(help)help.textContent=text;};
 function size(){
  width=scene.clientWidth;height=scene.clientHeight;ratio=Math.min(devicePixelRatio||1,1.8);
  const w=Math.round(width*ratio),h=Math.round(height*ratio);
  if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
 }
 function animalBox(){
  const a=animal.getBoundingClientRect(),s=scene.getBoundingClientRect();
  return {x:a.left-s.left,y:a.top-s.top,w:a.width,h:a.height};
 }
 function point(event){
  const rect=scene.getBoundingClientRect();
  return {x:clamp(event.clientX-rect.left,13,width-13),y:clamp(event.clientY-rect.top,13,height-13)};
 }
 function put(button,p){button.style.left=p.x+'px';button.style.top=p.y+'px';}
 function draw(now=performance.now()){
  frame=0;
  if(!scene.isConnected||!ctx)return;
  ctx.setTransform(ratio,0,0,ratio,0,0);ctx.clearRect(0,0,width,height);
  for(const b of foam){
   ctx.beginPath();ctx.fillStyle='#effbffed';ctx.strokeStyle='#b9eaff';ctx.lineWidth=1.2;
   ctx.arc(b.x,b.y,b.r,0,Math.PI*2);ctx.fill();ctx.stroke();
   ctx.beginPath();ctx.fillStyle='#fff';ctx.arc(b.x-b.r*.25,b.y-b.r*.3,b.r*.24,0,Math.PI*2);ctx.fill();
  }
  if(drag?.id==='shower'&&!task){
   const {x,y}=drag.p;
   for(let i=0;i<19;i++){
    const fall=(now/6+i*8)%55,spread=(i%5-2)*fall*.13;
    ctx.beginPath();ctx.strokeStyle=i%3?'#82ddffe8':'#e2faff';ctx.lineWidth=2.1;
    ctx.moveTo(x+spread,y+fall);ctx.lineTo(x+spread*1.2,y+fall+9);ctx.stroke();
   }
   frame=requestAnimationFrame(draw);
  }
 }
 function finish(kind){
  if(frame){cancelAnimationFrame(frame);frame=0;}
  if(scene.isConnected)void Promise.resolve(complete(kind)).finally(()=>{task=false;});
 }
 function brush(kind,p,a){
  if(kind==='soap'){
   if(p.x<a.x+5||p.x>a.x+a.w-5||p.y<a.y+8||p.y>a.y+a.h-8)return;
   if(foam.some(b=>Math.hypot(b.x-p.x,b.y-p.y)<7)||foam.length>=75)return;
   foam.push({x:p.x,y:p.y,r:7+foam.length%5*1.4});added++;
   if(added>=8)setHelp('Piana gotowa. Przeciągnij prysznic po bąbelkach.');
  }else{
   foam=foam.filter(b=>Math.hypot(b.x-p.x,b.y-p.y-11)>31);
   if(!foam.length&&added>=8){
    added=0;task=true;setHelp('Piana spłukana!');
    finish('wash');
   }
  }
 }
 function animateFor(ms,step,done){
  const start=performance.now();
  const tick=now=>{
   if(!scene.isConnected)return;
   const t=clamp((now-start)/ms,0,1);
   step(t);
   if(t<1)requestAnimationFrame(tick);else done();
  };
  requestAnimationFrame(tick);
 }
 function toss(button,p,dx){
  if(task)return;
  size();task=true;button.disabled=true;
  const box=animalBox(),center=box.x+box.w/2;
  let x=clamp(p.x+dx*.55,width*.16,width*.84);
  if(Math.abs(x-center)<width*.16)x=dx<0?width*.18:width*.82;
  const y=clamp(p.y,height*.57,height*.82),travel=x-center;
  const mouthY=box.y+box.h*.64,petY=y-mouthY;
  setHelp('Zwierzaczek biegnie po piłkę…');
  animateFor(reduced?90:1840,t=>{
   if(t<.34){
    const f=t/.34;
    put(button,{x:mix(p.x,x,f),y:mix(p.y,y,f)-Math.sin(f*Math.PI)*height*.19});
    return;
   }
   const back=t>=.68,progress=back?1-(t-.68)/.32:(t-.34)/.34;
   const bounce=reduced?0:Math.abs(Math.sin(progress*Math.PI*5))*9;
   animal.style.translate=`${travel*progress}px ${petY*progress-bounce}px`;
   if(back)put(button,{x:center+travel*progress,y:mouthY+petY*progress-bounce});
  },()=>{
   animal.style.translate='';button.style.left='';button.style.top='';button.disabled=false;
   setHelp('Piłka wróciła. Możesz rzucić jeszcze raz.');
   finish('play');
  });
 }
 function stroke(){
  const hand=scene.querySelector('.hq87-pet-hand');
  if(!hand||task)return;
  size();task=true;hand.hidden=false;animal.classList.add('hq87-petted');
  const box=animalBox(),center=box.x+box.w*.51,y=box.y+box.h*.24;
  setHelp('Głaszczesz zwierzaka po głowie.');
  animateFor(reduced?90:1180,t=>{
   const move=Math.sin(t*Math.PI*4);
   hand.style.left=center+move*box.w*.23+'px';
   hand.style.top=y-Math.cos(t*Math.PI*4)*6+'px';
   animal.style.rotate=(reduced?0:move*3)+'deg';
  },()=>{hand.hidden=true;animal.classList.remove('hq87-petted');animal.style.rotate='';finish('stroke');});
 }
 for(const button of scene.querySelectorAll('[data-pet-tool]')){
  const id=button.dataset.petTool;
  button.addEventListener('pointerdown',event=>{
   if(event.button!==0||drag||task)return;
   size();button.setPointerCapture(event.pointerId);
   const p=point(event);
   drag={id,p,start:p,at:performance.now(),pointer:event.pointerId};
   button.classList.add('is-held');
   if(id==='shower'&&!foam.length)setHelp('Najpierw rozprowadź mydło po futerku.');
   if(id!=='ball'){brush(id,p,animalBox());put(button,p);if(!frame)draw();}
  });
  button.addEventListener('pointermove',event=>{
   if(drag?.pointer!==event.pointerId||task)return;
   const next=point(event);
   if(id!=='ball'){
    const a=animalBox(),span=Math.hypot(next.x-drag.p.x,next.y-drag.p.y),steps=Math.min(45,Math.max(1,Math.ceil(span/8)));
    for(let i=1;i<=steps&&!task;i++)brush(id,{x:mix(drag.p.x,next.x,i/steps),y:mix(drag.p.y,next.y,i/steps)},a);
   }
   drag.p=next;put(button,next);
   if(id!=='ball'&&!frame&&!task)draw();
  });
  const release=event=>{
   if(drag?.pointer!==event.pointerId)return;
   const last=drag;drag=null;
   button.classList.remove('is-held');button.style.left='';button.style.top='';
   if(frame){cancelAnimationFrame(frame);frame=0;}
   if(id==='ball'){
    const dx=last.p.x-last.start.x,dy=last.p.y-last.start.y;
    if(event.type==='pointerup'&&(performance.now()-last.at>=120||Math.hypot(dx,dy)>15))toss(button,last.p,dx);
   }else draw();
  };
  for(const type of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(type,release);
  button.addEventListener('click',event=>{
   if(event.detail!==0||task)return;
   size();const a=animalBox();
   if(id==='ball'){toss(button,{x:width*.79,y:height*.76},-width*.45);return;}
   if(id==='shower'){
    if(added<8){setHelp('Najpierw użyj mydła.');return;}
    foam=[];added=0;draw();task=true;finish('wash');return;
   }
   for(let i=0;i<12;i++)brush('soap',{x:a.x+a.w*(.2+i%4*.19),y:a.y+a.h*(.28+Math.floor(i/4)*.2)},a);
   draw();
  });
 }
 panel.querySelector('[data-pet-stroke]')?.addEventListener('click',stroke);
}
