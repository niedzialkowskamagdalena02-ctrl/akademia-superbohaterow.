// V25: self-contained 3D scene. Geometry is in world coordinates and rendered with
// perspective projection, face depth sorting and an orbiting camera; no CDN required.
const ROOM_NAMES={lab:'Laboratorium',armory:'Zbrojownia',hangar:'Hangar',team:'Sala drużyny'};
const ROOM_COORDS={lab:[-3.35,-2.35],armory:[3.35,-2.35],hangar:[-3.35,2.35],team:[3.35,2.35]};
const ASSETS={guardian:'iron',inventor:'spider',shadow:'hulk',cosmo:'thor',blackwidow:'widow',panther:'panther',captain:'captain',hawkeye:'hawkeye',groot:'groot',gamora:'gamora'};
const imgCache=new Map();
function imageFor(id){let key=ASSETS[id]||('item-'+id);if(!imgCache.has(key)){let im=new Image();im.src='assets/art/'+key+'.svg';imgCache.set(key,im)}return imgCache.get(key)}
function init(root){if(root.dataset.hqReady)return;root.dataset.hqReady='1';
 const canvas=root.querySelector('[data-hq-canvas]'),ctx=canvas.getContext('2d');if(!ctx)return;
 const owned=new Set((root.dataset.owned||'').split(',').filter(Boolean));
 let yaw=-.66,pitch=.82,dist=18,target=[0,0,0],pointer=null,dragged=false,raf=0,last=0,focused='';const pointers=new Map();
 const colors={floor:'#253b58',wall:'#294767',edge:'#84d5ff',gold:'#efc66d',cyan:'#79e6ff'};
 function draw(time){if(!canvas.isConnected){cancelAnimationFrame(raf);return;}const rect=canvas.getBoundingClientRect();if(rect.width<1){raf=requestAnimationFrame(draw);return}let ratio=Math.min(devicePixelRatio||1,2);let w=Math.round(rect.width*ratio),h=Math.round(rect.height*ratio);if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h}ctx.setTransform(ratio,0,0,ratio,0,0);w=rect.width;h=rect.height;
 const sky=ctx.createLinearGradient(0,0,0,h);sky.addColorStop(0,'#173958');sky.addColorStop(.65,'#10243d');sky.addColorStop(1,'#061325');ctx.fillStyle=sky;ctx.fillRect(0,0,w,h);
 for(let i=0;i<50;i++){let x=(i*79.33)%w,y=(i*i*19.17)%(h*.64);ctx.fillStyle=i%4?'#b8dcf755':'#c8f5ff99';ctx.fillRect(x,y,1.4,1.4)}
 const cp=Math.cos(pitch),sp=Math.sin(pitch),cy=Math.cos(yaw),sy=Math.sin(yaw);const camera=[target[0]+dist*cp*sy,target[1]+dist*sp,target[2]+dist*cp*cy];let forward=norm(sub(target,camera)),right=norm(cross(forward,[0,1,0])),up=norm(cross(right,forward));const focal=Math.min(w*1.45,h*1.85);
 function proj(p){let v=sub(p,camera),depth=dot(v,forward);if(depth<.25)return null;return {x:w/2+dot(v,right)*focal/depth,y:h*.52-dot(v,up)*focal/depth,d:depth}}
 const faces=[],sprites=[],labels=[];
 function poly(points,color,stroke='',alpha=1){let ps=points.map(proj);if(ps.some(x=>!x))return;faces.push({ps,color,stroke,alpha,d:ps.reduce((a,b)=>a+b.d,0)/ps.length})}
 function box(x,y,z,sx,sy,sz,c,alpha=1){let A=[x-sx/2,y,z-sz/2],B=[x+sx/2,y,z-sz/2],C=[x+sx/2,y,z+sz/2],D=[x-sx/2,y,z+sz/2],E=[x-sx/2,y+sy,z-sz/2],F=[x+sx/2,y+sy,z-sz/2],G=[x+sx/2,y+sy,z+sz/2],H=[x-sx/2,y+sy,z+sz/2];
 poly([A,B,F,E],shade(c,-.22),'#80c5ee35',alpha);poly([B,C,G,F],shade(c,-.10),'#80c5ee35',alpha);poly([C,D,H,G],shade(c,-.18),'#80c5ee35',alpha);poly([D,A,E,H],shade(c,-.26),'#80c5ee35',alpha);poly([E,F,G,H],shade(c,.16),'#80c5ee55',alpha)}
 function label(text,x,y,z,color='#eaf9ff',size=11){let p=proj([x,y,z]);if(p)labels.push({...p,text,color,size})}
 function sprite(id,x,y,z,height=1.35){let p=proj([x,y,z]);if(!p)return;let ph=height*focal/p.d;sprites.push({p,id,ph})}
 function neon(x,y,z,color='#61d9ff',radius=.14){let p=proj([x,y,z]);if(!p)return;let r=Math.max(2,radius*focal/p.d);sprites.push({p,glow:color,r})}
 // Platform and four separate rooms; all furniture occupies real 3D positions.
 box(0,-.42,0,13.9,.28,10.1,'#192b48');
 for(const [id,[cx,cz]] of Object.entries(ROOM_COORDS)){
  const roomColors={lab:'#286480',armory:'#414b77',hangar:'#3c5c78',team:'#35646c'};
  box(cx,-.16,cz,6.2,.2,4.25,roomColors[id]);
  // Walls are real planes in the scene, with transparent glass and metallic frames.
  poly([[cx-3.05,0,cz-2.05],[cx+3.05,0,cz-2.05],[cx+3.05,2.5,cz-2.05],[cx-3.05,2.5,cz-2.05]],'#366687','#8ad7ff',.28);
  poly([[cx-3.05,0,cz-2.05],[cx-3.05,0,cz+2.05],[cx-3.05,2.5,cz+2.05],[cx-3.05,2.5,cz-2.05]],'#3c7090','#b2e8ff',.24);
  for(let i=-2;i<=2;i++){let zz=cz+i*.68;box(cx-2.99,.04,zz,.055,.05,3.9,'#4d86a0',.65)}
  label(ROOM_NAMES[id].toUpperCase(),cx,2.6,cz,'#bff3ff',12);
 }
 // LAB: console, glowing hologram, reactors, workbenches and robot.
 {let [x,z]=ROOM_COORDS.lab;box(x-1.3,.05,z-.5,2,.68,.7,'#45677c');box(x-1.3,.73,z-.68,1.65,.9,.12,'#1a5274');neon(x-1.3,1.1,z-.57);box(x+1.4,.05,z-.4,.85,1.3,.85,'#5e8da0');box(x+1.4,1.36,z-.4,.66,.16,.66,'#7fe9f3');neon(x+1.4,1.53,z-.4,'#51edff',.3);box(x-.2,.05,z+1.0,1.8,.55,.7,'#476079');if(owned.has('workshop'))sprite('workshop',x-.6,.68,z+1,1);if(owned.has('robot'))sprite('robot',x+.2,.68,z+.7,1);if(owned.has('arc'))neon(x-.8,1.65,z-.6,'#83faff',.24);if(owned.has('reactor'))neon(x+1.4,1.1,z-.4,'#8efaff',.5)}
 // ARMORY: raised display cases, armored figures and glass shelves.
 {let [x,z]=ROOM_COORDS.armory;for(let i=0;i<4;i++){let xx=x-2.1+i*1.35;box(xx,.05,z-.25,1.03,.35,1.15,'#344961');box(xx,.4,z-.25,.85,.1,.92,'#a9d4e4');box(xx,.5,z-.25,.94,1.65,.08,'#4584a1',.4)}
  const things=['armor','helmet','shield','cape'];things.forEach((id,i)=>{if(owned.has(id))sprite(id,x-2.1+i*1.35,.5,z-.25,1.5)});
  if(owned.has('thorhammer'))sprite('thorhammer',x+1.85,.3,z+1.25,.85);
  if(owned.has('gauntlet')){box(x-.5,.04,z+1.2,1.1,.7,.9,'#856b42');sprite('gauntlet',x-.5,.75,z+1.2,1.2);const gems=[['stone_space','#2679f4'],['stone_mind','#f8d947'],['stone_reality','#ef334c'],['stone_power','#a65bff'],['stone_time','#36c46d'],['stone_soul','#ff982f']];gems.forEach(([id,c],i)=>{if(owned.has(id))neon(x-.85+(i%3)*.35,1.1+Math.floor(i/3)*.25,z+1.15,c,.08)})}}
 // HANGAR: runway markings, lights, landing platform and Quinjet.
 {let [x,z]=ROOM_COORDS.hangar;box(x,.02,z,5.5,.04,2.6,'#243b4b');for(let i=-2;i<=2;i++){box(x+i*.83,.08,z,.34,.03,.08,'#d6f2fc')}for(let i=-2;i<=2;i++){neon(x+i*.95,.13,z+1.55,'#64d5ff',.06);neon(x+i*.95,.13,z-1.55,'#64d5ff',.06)}if(owned.has('quinjet'))sprite('quinjet',x,.32+Math.sin(time/900)*.08,z,2.6);box(x+2.45,.05,z, .18,1.9,2.8,'#638fa4')}
 // TEAM: meeting table, couches, glowing displays, actual character sprites.
 {let [x,z]=ROOM_COORDS.team;box(x,.05,z+.3,2.2,.55,.85,'#3e6577');box(x-1.8,.05,z+1.25,1.7,.72,.7,'#4a6c91');box(x+1.8,.05,z+1.25,1.7,.72,.7,'#4a6c91');box(x,.05,z-1.7,2.1,1.35,.13,'#265977');neon(x,1.12,z-1.5,'#6ffaff',.15);const heroes=['guardian','inventor','shadow','cosmo','blackwidow','panther','captain','hawkeye','groot','gamora'].filter(id=>owned.has(id));heroes.forEach((id,i)=>{let xx=x-2.15+(i%5)*1.08,zz=z-.5+Math.floor(i/5)*1.1;let bob=Math.sin(time/520+i*2)*.08;sprite(id,xx,.13+bob,zz,1.2)})}
 // Ground details and city skyline.
 for(let i=0;i<12;i++){let xx=-12+i*2.2;box(xx,-1.3,8+(i%3)*1.5,1.4,1.4+(i*7%5),1.1,'#102f48',.65)}
 faces.sort((a,b)=>b.d-a.d);for(let f of faces){ctx.globalAlpha=f.alpha;ctx.beginPath();ctx.moveTo(f.ps[0].x,f.ps[0].y);for(let j=1;j<f.ps.length;j++)ctx.lineTo(f.ps[j].x,f.ps[j].y);ctx.closePath();ctx.fillStyle=f.color;ctx.fill();if(f.stroke){ctx.strokeStyle=f.stroke;ctx.lineWidth=1;ctx.stroke()}}ctx.globalAlpha=1;
 sprites.sort((a,b)=>b.p.d-a.p.d);for(let s of sprites){if(s.glow){let g=ctx.createRadialGradient(s.p.x,s.p.y,0,s.p.x,s.p.y,s.r*2.7);g.addColorStop(0,s.glow);g.addColorStop(.35,s.glow+'99');g.addColorStop(1,'#ffffff00');ctx.fillStyle=g;ctx.beginPath();ctx.arc(s.p.x,s.p.y,s.r*2.7,0,Math.PI*2);ctx.fill();continue}let im=imageFor(s.id);if(im.complete&&im.naturalWidth){let wd=s.ph*.85;ctx.shadowColor='#4ce7ff88';ctx.shadowBlur=7;ctx.drawImage(im,s.p.x-wd/2,s.p.y-s.ph,wd,s.ph);ctx.shadowBlur=0}}
 for(let l of labels){ctx.font=`bold ${l.size}px system-ui`;ctx.textAlign='center';ctx.strokeStyle='#0c2439';ctx.lineWidth=4;ctx.strokeText(l.text,l.x,l.y);ctx.fillStyle=l.color;ctx.fillText(l.text,l.x,l.y)}
 ctx.textAlign='left';ctx.font='12px system-ui';ctx.fillStyle='#d2f4ff';ctx.fillText('SCENA 3D • obrót / zoom',12,h-14);
 raf=requestAnimationFrame(draw)}
 function focus(room){focused=room;let coords=ROOM_COORDS[room];if(!coords)return;target=[coords[0],.4,coords[1]];dist=10;root.querySelectorAll('[data-hq-room]').forEach(b=>b.classList.toggle('selected',b.dataset.hqRoom===room));let inv={};try{inv=JSON.parse(decodeURIComponent(root.dataset.inventory||''))}catch{}root.querySelector('[data-hq-info]').textContent=ROOM_NAMES[room]+': '+((inv[room]||[]).join(', ')||'Tu pojawią się odblokowane przedmioty.')}
 function reset(){yaw=-.66;pitch=.82;dist=18;target=[0,0,0];focused='';root.querySelectorAll('[data-hq-room]').forEach(b=>b.classList.remove('selected'));root.querySelector('[data-hq-info]').textContent='Obracaj bazę palcem, aby obejrzeć pokoje z różnych stron.'}
 canvas.addEventListener('pointerdown',e=>{canvas.setPointerCapture(e.pointerId);pointers.set(e.pointerId,[e.clientX,e.clientY]);pointer=[e.clientX,e.clientY];dragged=false});
 canvas.addEventListener('pointermove',e=>{if(!pointers.has(e.pointerId))return;let old=pointers.get(e.pointerId);pointers.set(e.pointerId,[e.clientX,e.clientY]);if(pointers.size===1){let dx=e.clientX-old[0],dy=e.clientY-old[1];yaw+=dx*.009;pitch=Math.max(.24,Math.min(1.43,pitch+dy*.006));if(Math.abs(dx)+Math.abs(dy)>2)dragged=true}else if(pointers.size===2){let arr=[...pointers.values()];let d=Math.hypot(arr[0][0]-arr[1][0],arr[0][1]-arr[1][1]);if(root._pinch)dist=Math.max(6,Math.min(31,dist*root._pinch/d));root._pinch=d}});
 const clear=e=>{pointers.delete(e.pointerId);root._pinch=0};canvas.addEventListener('pointerup',clear);canvas.addEventListener('pointercancel',clear);
 canvas.addEventListener('wheel',e=>{e.preventDefault();dist=Math.max(6,Math.min(31,dist+Math.sign(e.deltaY)*1.2))},{passive:false});
 root.addEventListener('click',e=>{let r=e.target.closest('[data-hq-room]');if(r)focus(r.dataset.hqRoom);if(e.target.closest('[data-hq-reset]'))reset();let z=e.target.closest('[data-hq-zoom]');if(z)dist=Math.max(6,Math.min(31,dist*(z.dataset.hqZoom==='in'?.8:1.25)));if(e.target.closest('[data-hq-full]')){let full=root.classList.toggle('hq-full');e.target.closest('button').textContent=full?'✕':'⛶';document.body.style.overflow=full?'hidden':''}});
 raf=requestAnimationFrame(draw);
}
function sub(a,b){return a.map((v,i)=>v-b[i])}function dot(a,b){return a.reduce((v,x,i)=>v+x*b[i],0)}function cross(a,b){return[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]]}function norm(a){let l=Math.hypot(...a)||1;return a.map(x=>x/l)}function shade(hex,amount){let n=parseInt(hex.slice(1),16);let a=[n>>16,(n>>8)&255,n&255].map(v=>Math.max(0,Math.min(255,Math.round(v+(amount>0?(255-v):v)*amount))));return '#'+a.map(v=>v.toString(16).padStart(2,'0')).join('')}
export function initHeadquarters3D(){const obs=new MutationObserver(()=>document.querySelectorAll('[data-hq3d]').forEach(init));obs.observe(document.getElementById('app'),{childList:true,subtree:true});document.querySelectorAll('[data-hq3d]').forEach(init)}
