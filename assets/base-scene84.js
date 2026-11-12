import {HQ_SPOTS} from './headquarters84.js?v=88';
import {baseArt88} from './base-art88.js?v=88';

const rooms={
 entry:{at:[0,4.7],look:[0,-3],bounds:[-1.94,1.94,-6.87,5.6],color:'#394d71'},
 lab:{at:[-3.45,-2.55],look:[-5.2,-4.4],bounds:[-8,-1.6,-5.8,-.55],color:'#1f6681'},
 arcade:{at:[3.3,-2.5],look:[4.8,-4.4],bounds:[1.6,8,-5.8,-.55],color:'#624780'},
 armory:{at:[0,-7.25],look:[0,-8.9],bounds:[-5.4,5.4,-10.2,-6.5],color:'#77604a'},
 hangar:{at:[-3.4,2.8],look:[-5.4,3],bounds:[-8,-1.6,.5,5.6],color:'#334c70'},
 pet:{at:[3.25,2.4],look:[5.3,2.8],bounds:[1.6,8,.5,5.6],color:'#714e73'}
};
const trim={entry:'#6ffde3',lab:'#64f3f2',arcade:'#f481ff',armory:'#ffd886',hangar:'#7eb5ff',pet:'#ffae99'};
const doorway={lab:[-1.7,-2.55],arcade:[1.7,-2.5],hangar:[-1.7,2.8],pet:[1.7,2.4]};
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const minus=(a,b)=>a.map((v,i)=>v-b[i]);
const dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0);
const towards=(a,b)=>Math.atan2(b[0]-a[0],a[1]-b[1]);
const near=.17;
const memories=new Map();
const images=new Map();
let disposeActive=()=>{};

export function mountBaseScene84(stage){
 disposeActive();
 if(!stage)return;
 const canvas=stage.querySelector('canvas'),ctx=canvas.getContext('2d');
 if(!ctx)return;
 const walk=stage.dataset.view==='walk',child=stage.dataset.child,events=new AbortController();
 const on=(node,type,fn,options={})=>node.addEventListener(type,fn,{...options,signal:events.signal});
 const shapes=[],barriers=[];
 const spots=[...stage.querySelectorAll('[data-hq84-spot]')];
 const saved=memories.get(child);
 const state=walk?(saved?.walk??{x:0,z:4.7,yaw:0,pitch:-.06,room:'entry'}):
  (saved?.orbit??{x:0,z:-2.2,yaw:.38,pitch:1.06,distance:24,room:'overview'});
 const poses={...saved,[walk?'walk':'orbit']:state};
 memories.set(child,poses);
 const reduced=typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches;
 let frame=0,last=0,motion=null,drag=null,effect=null;
 const tailShapes=new Set();
 const held=new Set();
 const solid=(x,z,w,d)=>barriers.push([x-w/2,x+w/2,z-d/2,z+d/2]);
 function face(points,color,edge='',alpha=1,floor=false){shapes.push({points,color,edge,alpha,floor})}
 function box(x,y,z,w,h,d,color,{collision=false,wall=false,edge='',alpha=1}={}){
  if(collision)solid(x,z,w,d);
  if(wall&&!walk)h=Math.min(h,.49);
  const a=[x-w/2,y,z-d/2],b=[x+w/2,y,z-d/2],c=[x+w/2,y,z+d/2],d0=[x-w/2,y,z+d/2];
  const top=[a,b,c,d0].map(([xx,yy,zz])=>[xx,yy+h,zz]);
  for(let i=0;i<4;i++){
   const j=(i+1)%4;
   face([[a,b,c,d0][i],[a,b,c,d0][j],top[j],top[i]],shade(color,[-.24,-.12,-.05,-.18][i]),edge,alpha);
  }
  face(top,shade(color,.12),edge,alpha);
 }
 function drum(x,y,z,r,height,color,n=12){
  const bottom=Array.from({length:n},(_,i)=>[x+Math.cos(i/n*Math.PI*2)*r,y,z+Math.sin(i/n*Math.PI*2)*r]);
  const top=bottom.map(([xx,yy,zz])=>[xx,yy+height,zz]);
  for(let i=0;i<n;i++){const j=(i+1)%n;face([bottom[i],bottom[j],top[j],top[i]],shade(color,Math.cos(i/n*6.28)*.19));}
  face(top,shade(color,.15));
 }
 function neon(x,y,z,w,d,color){box(x,y,z,w,.055,d,color)}
 function roomWall(x,z,w,d,room){
  box(x,0,z,w,2.95,d,shade(rooms[room].color,-.12),{wall:true,collision:true,edge:'#566384'});
  neon(x,walk?2.55:.49,z,w+.045,d+.045,trim[room]);
  if(walk)neon(x,.16,z,w+.035,d+.035,shade(trim[room],-.35));
 }
 function separator(x,z0,z1,opening,room){
  for(const [a,b] of [[z0,opening-1.17],[opening+1.17,z1]])roomWall(x,(a+b)/2,.18,b-a,room);
  if(walk)box(x,2.58,opening,.25,.16,2.34,trim[room]);
 }
 function floorRoom({bounds:[l,r,t,b],color},id){
  const tile=1.16;
  for(let z=t;z<b;z+=tile)for(let x=l;x<r;x+=tile){
   const xx=Math.min(x+tile,r),zz=Math.min(z+tile,b);
   const tone=shade(color,((Math.round(x*23)+Math.round(z*71))%7)*.013);
   face([[x,0,z],[xx,0,z],[xx,0,zz],[x,0,zz]],tone,'#182d5144',1,true);
  }
  if(id!=='entry'){
   neon((l+r)/2,.025,b-.13,r-l,.09,trim[id]);
   neon((l+r)/2,.025,t+.13,r-l,.09,trim[id]);
  }
 }
 if(!walk){
  box(0,-.85,-2.3,16.5,.73,16.15,'#233654',{edge:'#566890'});
  shapes.forEach(shape=>shape.floor=2);
 }
 for(const [id,room] of Object.entries(rooms))floorRoom(room,id);
 roomWall(-8,-.1,.18,11.4,'lab');roomWall(8,-.1,.18,11.4,'arcade');
 roomWall(-4.93,-5.8,6.14,.17,'lab');roomWall(4.93,-5.8,6.14,.17,'arcade');
 roomWall(-4.9,-.54,6.2,.16,'lab');roomWall(4.9,-.54,6.2,.16,'arcade');
 roomWall(-5,5.6,6,.17,'hangar');roomWall(5,5.6,6,.17,'pet');
 roomWall(0,-10.2,10.8,.18,'armory');
 roomWall(-5.4,-8.37,.18,3.65,'armory');roomWall(5.4,-8.37,.18,3.65,'armory');
 roomWall(-3.6,-6.52,3.5,.17,'armory');roomWall(3.6,-6.52,3.5,.17,'armory');
 for(const [room,[x,z]] of Object.entries(doorway)){
  const rear=z<0;
  separator(x,rear?-5.8:.5,rear?-.55:5.6,z,room);
 }
 // Central reactor and the stand by the entrance.
 solid(0,-3.45,1.7,1.6);
 drum(0,.03,-3.45,.98,.25,'#3a557c');
 drum(0,.27,-3.45,.78,.10,'#42e3ef');
 drum(0,.37,-3.45,.58,.045,'#c2fffd');
 drum(0,.42,-3.45,.27,.95,'#40e6e7');
 for(const x of [-1.42,1.42])neon(x,.012,-.6,.055,10.1,'#ffdb85');
 if(walk){
  for(const z of [-5.75,-1.15,2.85]){
   box(0,3.02,z,3.65,.13,.19,'#46618a');
   neon(0,2.98,z,3.43,.12,'#a5e7fc');
   face([[-1.8,3.12,z],[-.67,3.88,z],[.67,3.88,z],[1.8,3.12,z]],'#719cc6','#789aca',.68);
  }
 }
 function plant(x,z){
  drum(x,0,z,.24,.29,'#a47373',8);
  for(const [dx,dz,y,color] of [[-.27,0,.67,'#63bf8e'],[.26,.09,.72,'#7bcb8e'],[.05,-.19,.83,'#9ada8a'],[-.09,.15,.87,'#69b488']]){
   face([[x,.23,z],[x+dx-.19,y-.10,z+dz],[x+dx,y,z+dz-.08],[x+dx+.17,y-.14,z+dz]],color);
  }
 }
 plant(-1.57,5.05);plant(1.62,-5.43);plant(7.2,4.89);

 box(-.68,.01,2.85,.67,.73,.63,'#344d73');
 box(-.68,.75,2.85,.55,.14,.36,'#bd733b');
 box(-.68,.81,3.03,.22,.085,.035,'#f7d384');
 // Lab console and books.
 box(-5.2,.02,-4.55,2.75,.74,.64,'#356d82',{collision:true});
 box(-5.2,.78,-4.75,1.68,.77,.08,'#144e72');
 box(-5.2,.9,-4.7,1.43,.43,.025,'#65e6e3');
 for(let i=0;i<4;i++)box(-6.18+i*.16,.77,-4.39,.13,.24,.25,['#ffc877','#ad96f7','#7df1db','#f685a1'][i]);
 // Arcade cabinet fronts, poufs and a crystal ball.
 for(const [x,color] of [[4.25,'#a654bb'],[5.42,'#7162c9']]){
  box(x,0,-4.55,.83,1.43,.64,color,{collision:true});
  box(x,1.09,-4.19,.55,.38,.04,'#63dfff');
  box(x,1.48,-4.54,.86,.19,.65,'#ffd17c');
  box(x,.93,-4.13,.82,.08,.32,'#fc80d7');
 }
 for(const [x,z] of [[5.7,-1.45],[4.45,-1.45]])drum(x,.02,z,.36,.31,'#aa70c7');
 drum(6.5,0,-2.1,.44,.65,'#5d4e83');drum(6.5,.65,-2.1,.23,.33,'#9aefff');
 // Gallery cases and lab shelf.
 for(const [spot,x,,z,,action] of HQ_SPOTS){
  if(!action.startsWith('hq:slot:'))continue;
  box(x,0,z,.85,.79,.67,spot==='lab'?'#3b717c':'#886243',{collision:true});
  neon(x,.78,z,.9,.72,spot==='lab'?'#78f1f6':'#ffcb78');
  box(x,.84,z,.79,.84,.59,'#95d5e3',{edge:'#a7d7e399',alpha:.16});
 }
 for(const spot of spots){
  const item=spot.dataset.trophy;
  if(!item)continue;
  const [,x,,z]=HQ_SPOTS[Number(spot.dataset.hq84Spot)];
  const art=baseArt88(item);
  if(art)shapes.push({art,point:[x,.86,z],height:art.tall?.84:.59,slot:spot.dataset.action.split(':')[2]});
 }
 // Hangar and pet area.
 face([[-7.55,.005,.84],[-2.4,.005,.84],[-2.4,.005,5.15],[-7.55,.005,5.15]],'#2a3b58','',1,true);
 for(let i=0;i<5;i++){const x=-7.2+i*1.05;neon(x,.025,1.0,.34,.065,'#ffd66e');neon(x,.025,4.95,.34,.065,'#ffd66e');}
 if(stage.dataset.quinjet){
  const color={blue:'#63a5eb',mint:'#65dab3',gold:'#f4bd64'}[stage.dataset.paint]??'#63a5eb';
  box(-5.4,.38,3,2.25,.32,.69,color,{collision:true});
  face([[-4.1,.52,3],[-5.6,.52,2.65],[-6.35,.47,1.87],[-6.13,.48,3],[-6.35,.47,4.12],[-5.6,.52,3.35]],color,'#b5d9fd');
  box(-5.17,.72,3,.75,.18,.44,'#18335c');box(-6.32,.62,3,.29,.4,.16,color);
 }
 drum(5.45,0,2.88,.69,.22,'#d089aa');drum(5.45,.22,2.88,.57,.07,'#f8a7c3');
 drum(4.75,.02,2,.31,.11,'#ffc686');
 if(stage.dataset.pet){
  const dog=stage.dataset.pet==='dog',coat=dog?'#c19272':'#edac64';
  box(5.44,.27,2.91,.46,.39,.56,coat);
  box(5.39,.57,2.69,.51,.47,.42,coat);
  for(const x of [5.21,5.57]){box(x,dog?.69:1.0,2.67,.11,.21,.12,coat);box(x,.8,2.465,.075,.085,.028,'#242f48');}
  box(5.4,.7,2.449,.11,.055,.03,'#59394b');
  const start=shapes.length;box(5.71,.45,3.19,.15,.14,.41,coat);
  shapes.slice(start).forEach(shape=>tailShapes.add(shape));
 }
 drum(6.55,0,3.6,.56,.28,'#915b99');drum(6.55,.28,3.6,.48,.07,'#c28fd7');
 const eggStart=shapes.length;
 drum(6.55,.35,3.6,.31,.21,'#9ee0bf');drum(6.55,.56,3.6,.29,.17,'#f8a6ce');drum(6.55,.73,3.6,.21,.13,'#ace4ca');
 const eggShapes=shapes.slice(eggStart);
 function projectFrame(width,height,now){
  const camera=walk?[state.x,1.43,state.z]:[
   state.x+Math.sin(state.yaw)*Math.cos(state.pitch)*state.distance,
   Math.sin(state.pitch)*state.distance,
   state.z+Math.cos(state.yaw)*Math.cos(state.pitch)*state.distance
  ];
  const angle=walk?state.yaw:-state.yaw,tilt=walk?state.pitch:-state.pitch;
  const forward=[Math.sin(angle)*Math.cos(tilt),Math.sin(tilt),-Math.cos(angle)*Math.cos(tilt)];
  const right=[Math.cos(angle),0,Math.sin(angle)],up=[-Math.sin(angle)*Math.sin(tilt),Math.cos(tilt),Math.cos(angle)*Math.sin(tilt)];
  const focal=walk?Math.min(width*.69,height*.76):Math.min(width*.99,height*1.35);
  const cameraPoint=p=>{const v=minus(p,camera);return [dot(v,right),dot(v,up),dot(v,forward)]};
  const screen=([x,y,z])=>[width*.5+x*focal/z,height*.52-y*focal/z,z];
  const distance=(x,z)=>Math.hypot(x-state.x,z-state.z);
  const renderable=[];
  for(const shape of shapes){
   if(shape.art){
    const p=cameraPoint(shape.point);
    if(p[2]>near)renderable.push({...shape,p:screen(p),depth:p[2]-.44});
    continue;
   }
   const movingEgg=effect?.kind==='egg'&&eggShapes.includes(shape);
   const scale=movingEgg?1-Math.sin(Math.PI*clamp((now-effect.start)/520,0,1))*.46:1;
   const wag=effect?.kind==='feed'&&tailShapes.has(shape)?Math.sin((now-effect.start)/47)*.11:0;
   const points=shape.points.map(([x,y,z])=>cameraPoint([x+wag,movingEgg?.35+(y-.35)*scale:y,z]));
   const clipped=clip(points);
   if(clipped.length<3)continue;
   const p=clipped.map(screen);
   if(p.every(v=>v[0]<0)||p.every(v=>v[0]>width)||p.every(v=>v[1]<0)||p.every(v=>v[1]>height))continue;
   renderable.push({...shape,p,depth:points.reduce((n,v)=>n+v[2],0)/points.length});
  }
  renderable.sort((a,b)=>(Number(b.floor)||0)-(Number(a.floor)||0)||b.depth-a.depth);
  for(const s of renderable){
   if(s.art){
    let im=images.get(s.art.src);
    if(!im){im=new Image();im.onload=request;im.src=s.art.src;images.set(s.art.src,im);}
    if(im.complete&&im.naturalWidth){
     const h=s.height*focal/s.p[2],w=h*im.naturalWidth/im.naturalHeight;
     const lift=effect?.kind==='spark'&&s.slot===effect.slot?Math.sin(Math.PI*clamp((now-effect.start)/560,0,1))*h*.18:0;
     ctx.filter=s.art.hue?'hue-rotate('+s.art.hue+'deg)':'none';
     ctx.drawImage(im,s.p[0]-w/2,s.p[1]-h-lift,w,h);ctx.filter='none';
    }
    continue;
   }
   ctx.globalAlpha=s.alpha;ctx.beginPath();ctx.moveTo(s.p[0][0],s.p[0][1]);
   for(const [x,y] of s.p.slice(1))ctx.lineTo(x,y);
   ctx.closePath();ctx.fillStyle=s.color;ctx.fill();
   if(s.edge){ctx.strokeStyle=s.edge;ctx.lineWidth=.65;ctx.stroke();}
  }
  ctx.globalAlpha=1;
  for(const button of spots){
   const [room,x,y,z]=HQ_SPOTS[Number(button.dataset.hq84Spot)],p=cameraPoint([x,y+.29,z]);
   const far=distance(x,z);
   const visible=p[2]>near&&(walk?far<5.1&&visibleFrom(x,z):(state.room==='overview'?!button.dataset.action.startsWith('hq:slot:')&&!['hq:joke','hq:egg'].includes(button.dataset.action):state.room===room));
   if(!visible){button.hidden=true;continue;}
   const [sx,sy]=screen(p);
   button.hidden=sx<37||sx>width-37||sy<20||sy>height-50;
   if(!button.hidden){button.style.left=sx+'px';button.style.top=sy+'px';}
  }
  if(effect?.kind==='spark'){
   const spot=HQ_SPOTS.find(row=>row[5]==='hq:slot:'+effect.slot);
   if(spot){const [,x,y,z]=spot,p=cameraPoint([x,y,z]);if(p[2]>near){
    const [sx,sy]=screen(p);
    ctx.strokeStyle='#c5fffe';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(sx-18,sy-55);
    ctx.lineTo(sx+12,sy-31);ctx.lineTo(sx-3,sy-26);ctx.lineTo(sx+17,sy-2);ctx.stroke();
   }}
  }
 }
 function background(width,height){
  const sky=ctx.createLinearGradient(0,0,0,height);
  sky.addColorStop(0,'#253b79');sky.addColorStop(.62,'#617fbc');sky.addColorStop(1,'#192f57');
  ctx.fillStyle=sky;ctx.fillRect(0,0,width,height);
  for(let i=0;i<19;i++){
   const x=(i*53%width),w=18+(i*11%29),h=21+(i*37%81),y=height*(walk?.55:.53)-h;
   ctx.fillStyle=i%2?'#293e6b':'#314a79';ctx.fillRect(x,y,w,h);
   ctx.fillStyle=i%3?'#7f9ac3':'#dfb789';
   for(let j=10;j<h;j+=13)ctx.fillRect(x+6,y+j,3,3);
  }
 }
 function draw(now){
  frame=0;
  const dt=Math.min((now-last)/1000||0,.038);last=now;
  if(walk&&held.size){
   motion=null;
   const side=Number(held.has('right'))-Number(held.has('left'));
   const forward=Number(held.has('forward'))-Number(held.has('back'));
   const v=2.65*dt/(Math.hypot(side,forward)||1);
   move((Math.sin(state.yaw)*forward+Math.cos(state.yaw)*side)*v,(-Math.cos(state.yaw)*forward+Math.sin(state.yaw)*side)*v);
  }
  if(motion)advance(now);
  if(effect&&now-effect.start>560)effect=null;
  const {width,height}=canvas.getBoundingClientRect();
  if(!width||!height)return;
  const ratio=Math.min(window.devicePixelRatio||1,1.7);
  if(canvas.width!==Math.round(width*ratio)||canvas.height!==Math.round(height*ratio)){
   canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);
  }
  ctx.setTransform(ratio,0,0,ratio,0,0);background(width,height);projectFrame(width,height,now);
  if(motion||held.size||effect)request();
 }
 function request(){if(!frame&&!events.signal.aborted)frame=requestAnimationFrame(draw);}
 function collides(x,z,padding=.17){
  return barriers.some(([l,r,t,b])=>x>l-padding&&x<r+padding&&z>t-padding&&z<b+padding);
 }
 function isWalkable(x,z){
  return Object.values(rooms).some(({bounds:[l,r,t,b]})=>x>=l+.1&&x<=r-.1&&z>=t+.1&&z<=b-.1);
 }
 function move(x,z){
  const can=(px,pz)=>isWalkable(px,pz)&&!collides(px,pz);
  if(can(state.x+x,state.z))state.x+=x;
  if(can(state.x,state.z+z))state.z+=z;
 }
 function visibleFrom(x,z){
  return !barriers.some(([l,r,t,b])=>{
   if(x>=l&&x<=r&&z>=t&&z<=b)return false;
   for(let f=.1;f<.96;f+=.09){
    const px=state.x+(x-state.x)*f,pz=state.z+(z-state.z)*f;
    if(px>l&&px<r&&pz>t&&pz<b)return true;
   }
   return false;
  });
 }
 function advance(now){
  const {from,to,start}=motion;
  const ratio=reduced?1:clamp((now-start)/420,0,1);
  const t=ratio*ratio*(3-2*ratio);
  for(const k of Object.keys(to))state[k]=from[k]+(to[k]-from[k])*t;
  if(ratio===1)motion=null;
 }
 function focus(id){
  const room=rooms[id];if(walk&&!room)return;
  state.room=id;
  stage.parentElement.querySelectorAll('[data-hq84-room]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.hq84Room===id)));
  if(walk){[state.x,state.z]=room.at;state.yaw=towards(room.at,room.look);state.pitch=-.11;}
  else{
   const aim=room?room.look:[0,-2.2];
   motion={from:{x:state.x,z:state.z,distance:state.distance},to:{x:aim[0],z:aim[1],distance:room?13:24},start:performance.now()};
  }
  request();
 }
 function stopHold(){held.clear();request();}
 function step(direction,size){
  const f=direction==='forward'?1:direction==='back'?-1:0;
  const s=direction==='right'?1:direction==='left'?-1:0;
  move((Math.sin(state.yaw)*f+Math.cos(state.yaw)*s)*size,(-Math.cos(state.yaw)*f+Math.sin(state.yaw)*s)*size);
  request();
 }
 for(const button of stage.querySelectorAll('[data-move]')){
  on(button,'pointerdown',event=>{
   if(event.button!==0)return;
   button.setPointerCapture(event.pointerId);held.add(button.dataset.move);last=performance.now();step(button.dataset.move,.19);
  });
  for(const type of ['pointerup','pointercancel','lostpointercapture'])on(button,type,()=>{held.delete(button.dataset.move);request();});
  on(button,'click',event=>{if(event.detail===0)step(button.dataset.move,.55);});
 }
 on(canvas,'pointerdown',e=>{if(e.button!==0||drag)return;drag={id:e.pointerId,x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId);});
 on(canvas,'pointermove',e=>{
  if(!drag||drag.id!==e.pointerId)return;
  const dx=e.clientX-drag.x,dy=e.clientY-drag.y;drag.x=e.clientX;drag.y=e.clientY;
  state.yaw+=dx*(walk?.008:-.009);
  state.pitch=walk?clamp(state.pitch+dy*.006,-.62,.58):clamp(state.pitch-dy*.007,.35,1.37);request();
 });
 for(const type of ['pointerup','pointercancel','lostpointercapture'])on(canvas,type,e=>{if(drag?.id===e.pointerId)drag=null;});
 if(!walk)on(canvas,'wheel',e=>{e.preventDefault();motion=null;state.distance=clamp(state.distance+Math.sign(e.deltaY),10,35);request();},{passive:false});
 on(window,'blur',stopHold);
 on(stage.parentElement,'click',e=>{const b=e.target.closest('[data-hq84-room]');if(b)focus(b.dataset.hq84Room);});
 on(stage,'hq84:effect',e=>{
  const {kind,slot,focus:bringIntoView}=e.detail;
  if(bringIntoView){
   const point=HQ_SPOTS.find(row=>row[5]===(kind==='feed'?'hq:pet':kind==='egg'?'hq:egg':'hq:slot:'+slot));
   if(point){
    const [room,x,,z]=point;
    focus(room);
    if(walk){
     [state.x,state.z]=room==='lab'?[x+1.65,z]:room==='pet'?[x-1.55,z]:[x,z+1.65];
     state.yaw=towards([state.x,state.z],[x,z]);state.pitch=-.24;
    }
   }
  }
  effect={kind,slot,start:performance.now()};request();
 });
 const resize=typeof ResizeObserver==='function'?new ResizeObserver(request):null;
 resize?.observe(canvas);
 on(window,'resize',request);
 disposeActive=()=>{events.abort();resize?.disconnect();if(frame)cancelAnimationFrame(frame);};
 request();
}

function clip(points){
 const out=[];
 for(let i=0;i<points.length;i++){
  const a=points[i],b=points[(i+1)%points.length];
  if(a[2]>=near)out.push(a);
  if((a[2]>=near)!==(b[2]>=near)){
   const t=(near-a[2])/(b[2]-a[2]);out.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,near]);
  }
 }
 return out;
}
function shade(hex,amount){
 const n=parseInt(hex.slice(1),16);
 return '#'+[n>>16,n>>8&255,n&255].map(v=>clamp(Math.round(v+(amount>0?255-v:v)*amount),0,255).toString(16).padStart(2,'0')).join('');
}
