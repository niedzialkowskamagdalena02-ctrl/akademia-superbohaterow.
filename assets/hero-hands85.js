const costumes={
 iron:['#ad273a','#fa7774','#471227','#f4c46d','#ffeab8','armor'],
 spider:['#be304d','#fb757c','#52112d','#253d69','#6d84b2','web'],
 hulk:['#4c942e','#a8df71','#244e1c','#5c3782','#ad79ce','skin'],
 captain:['#92413f','#e79070','#4e2226','#214a78','#cde8f5','shield'],
 thor:['#ab7765','#ecc1a3','#583b48','#313846','#c0ccd9','bands'],
 widow:['#302731','#6b5869','#141525','#a2404c','#ee8b94','bands'],
 panther:['#242334','#585570','#0d1121','#383352','#baaff0','claws'],
 hawkeye:['#4c344f','#9b688a','#251b30','#2d2347','#b7a0df','bands'],
 groot:['#76503c','#be9872','#372c27','#567043','#92ba63','bark'],
 gamora:['#508852','#a2ce80','#253d32','#472750','#e489cc','bands']
};

const handImages=new Map(),illustratedHands=new Set(['hulk','iron','spider','captain']);
export const HERO_POWER_TIME=Object.freeze({punch:440,laser:640});

function loadHandImage(path,fallback){
 if(!handImages.has(path)){
  handImages.set(path,new Promise(resolve=>{
   const image=new Image();
   image.onload=()=>resolve(image);
   image.onerror=()=>{
    if(fallback&&!image.src.endsWith(fallback))image.src=fallback;
    else{handImages.delete(path);resolve(null);}
   };
   image.src=path;
  }));
 }
 return handImages.get(path);
}

export function loadHeroHands88(hero){
 if(!illustratedHands.has(hero))return Promise.resolve(null);
 return loadHandImage('assets/hq/hd93/hands-'+hero+'.webp','assets/hq/hands90-'+hero+'.webp');
}

export function loadHulkFist(){
 return loadHandImage('assets/hq/hands90-hulk.webp');
}

let paths;
function geometry(){
 if(paths)return paths;
 const definitions={
  sleeve:'M-23 165 L-9 125 Q1 94 22 71 L69 96 Q55 115 54 154 L58 173 Z',
  fist:'M14 97 Q6 83 13 68 L23 52 Q23 38 33 33 Q39 30 43 34 Q48 26 56 30 Q62 30 65 36 Q75 31 81 38 Q88 39 92 47 L97 62 Q99 77 89 85 L70 103 Q58 114 42 112 L27 106 Z',
  knuckles:'M24 52 Q28 42 36 44 L42 50 Q47 41 54 42 Q61 42 64 50 Q72 44 79 49 L91 59 Q95 66 91 71 L72 77 L53 68 L34 69 Z',
  thumb:'M78 61 Q93 54 99 63 Q107 76 96 92 L82 103 L73 94 Z',
  cuff:'M15 90 Q42 104 69 98 L61 115 Q36 121 6 109 Z',
  plate:'M5 116 L18 101 L59 111 L50 141 L16 150 L-3 139 Z',
  lines:'M42 35 L40 48 M65 38 L62 51 M81 43 L77 54',
  web:'M16 78 L85 51 M17 55 L81 85 M48 32 L52 108 M26 51 Q37 64 49 63 Q59 52 70 47 M24 76 Q37 80 47 74 Q62 82 76 68 M34 96 Q45 89 58 96',
  bark:'M31 35 Q29 53 39 60 Q47 69 44 81 M54 34 Q49 55 60 68 Q66 72 65 87 M75 45 Q70 61 81 71 M4 112 Q23 128 14 153 M32 110 Q44 126 30 161',
  metal:'M27 54 L31 45 L38 45 L39 57 Z M45 50 L47 40 L55 39 L57 54 Z M63 52 L66 44 L73 45 L74 57 Z M79 54 L84 51 L91 61 L87 67 Z',
  claws:'M34 37 L34 28 L40 34 M53 32 L58 22 L61 33 M75 37 L82 30 L81 42'
 };
 paths=Object.fromEntries(Object.entries(definitions).map(([id,data])=>[id,new Path2D(data)]));
 return paths;
}

function smoothStep(age,start,end){
 const t=Math.max(0,Math.min(1,(age-start)/(end-start)));
 return t*t*(3-2*t);
}

function handMotion(power,side){
 const {kind,age,reduced}=power??{};
 const closed=kind==='punch'&&age>=34&&age<HERO_POWER_TIME.punch-22;
 const reach=kind==='punch'&&power.side===side ?
  (reduced ? .24 : smoothStep(age,55,151)*(1-smoothStep(age,173,409))) : 0;
 const lift=kind==='laser'&&side===1 ?
  (reduced ? .34 : smoothStep(age,0,173)*(1-smoothStep(age,376,HERO_POWER_TIME.laser))) : 0;
 return {closed,lean:.56*reach,length:1+.64*reach,lift,zoom:1+.24*lift};
}

function poseHand(ctx,side,{lean,length,lift,zoom},scale,x,y,angle){
 const size=scale*zoom;
 ctx.transform(-side*size,0,side*lean*size,length*size,x,y);
 ctx.rotate(angle+.09*lift);
}

function handPoint(ctx,x,y){
 const {a,b,c,d,e,f}=ctx.getTransform();
 return {x:a*x+c*y+e,y:b*x+d*y+f};
}

export function drawHeroHands(ctx,canvas,hero,step,moving,image=null,web=null,power=null,fistImage=null){
 const {width,height}=canvas;
 ctx.clearRect(0,0,width,height);
 const needsFist=handMotion(power,-1).closed;
 let laserOrigin;
 if(image&&(!needsFist||fistImage)){
  const art=needsFist?fistImage:image;
  const scale=Math.min(width*.35/image.naturalWidth,height*.25/image.naturalHeight)*(hero==='hulk'?1.1:1);
  const h=image.naturalHeight*scale,w=h*art.naturalWidth/art.naturalHeight;
  let webOrigin;
  for(const side of [-1,1]){
   const motion=handMotion(power,side);
   const sway=moving&&!motion.lean&&!motion.lift?Math.sin(step+side*Math.PI/2):0;
   ctx.save();
   const reach=web?.side===side?Math.max(0,1-web.age/330):0;
   const x=width*(side<0?.022:.978)-side*reach*w*.19,y=height+h*(.035+sway*.037-reach*.25);
   poseHand(ctx,side,motion,1,x,y,sway*.04);
   if(needsFist)ctx.filter='brightness(.78) saturate(.84)';
   ctx.drawImage(art,0,-h,w,h);
   if(web?.side===side)webOrigin={startX:x-side*w*.52,startY:y-h*.51};
   if(power?.kind==='laser'&&side===1)laserOrigin=handPoint(ctx,w*.63,-h*.60);
   ctx.restore();
  }
  if(web)paintWeb93(ctx,width,height,{...web,...webOrigin});
  if(laserOrigin)paintLaser(ctx,width,height,power.age,laserOrigin);
  return;
 }
 const [base,light,shade,cuff,accent,kind]=costumes[hero==='groot-lady'?'groot':hero]??costumes.iron;
 const p=geometry(),scale=Math.min(width*.00315,height*.00132)*(kind==='skin'?1.15:1);
 for(const side of [-1,1]){
  const motion=handMotion(power,side);
  const sway=moving&&!motion.lean&&!motion.lift?Math.sin(step+side*Math.PI/2):0;
  ctx.save();
  const x=width*(side<0?.084:.916)-side*motion.lean*130*scale;
  const y=height+(sway*5-130*motion.length*motion.zoom)*scale;
  poseHand(ctx,side,motion,scale,x,y,-.13-sway*.048);
  if(power?.kind==='laser'&&side===1)laserOrigin=handPoint(ctx,54,63);
  ctx.shadowColor='#070a17cc';ctx.shadowBlur=9*scale;ctx.shadowOffsetY=4*scale;
  ctx.lineJoin='round';ctx.lineWidth=1.25;ctx.strokeStyle=shade;
  const sleeve=ctx.createLinearGradient(0,121,61,140);
  sleeve.addColorStop(0,shade);sleeve.addColorStop(.46,cuff);sleeve.addColorStop(1,kind==='skin'?base:shade);
  ctx.fillStyle=sleeve;ctx.fill(p.sleeve);ctx.stroke(p.sleeve);
  ctx.shadowBlur=0;ctx.shadowOffsetY=0;
  const skin=ctx.createRadialGradient(47,48,4,49,65,58);
  skin.addColorStop(0,light);skin.addColorStop(.48,base);skin.addColorStop(1,shade);
  ctx.fillStyle=skin;ctx.fill(p.thumb);ctx.stroke(p.thumb);
  ctx.fill(p.fist);ctx.stroke(p.fist);
  const gloss=ctx.createLinearGradient(30,37,62,76);
  gloss.addColorStop(0,light);gloss.addColorStop(1,'#ffffff00');
  ctx.fillStyle=gloss;ctx.globalAlpha=.32;ctx.fill(p.knuckles);ctx.globalAlpha=1;
  ctx.lineWidth=1.05;ctx.stroke(p.lines);
  if(kind==='armor'||kind==='bands'||kind==='shield'||kind==='claws'){
   ctx.fillStyle=cuff;ctx.fill(p.cuff);ctx.stroke(p.cuff);
   ctx.strokeStyle=accent;ctx.lineWidth=1.45;ctx.stroke(p.cuff);
  }
  if(kind==='armor'){
   const polished=ctx.createLinearGradient(38,39,56,65);
   polished.addColorStop(0,'#fff0bd');polished.addColorStop(.48,'#db9d52');polished.addColorStop(1,'#a15d3d');
   ctx.fillStyle=polished;ctx.fill(p.metal);ctx.strokeStyle='#843737';ctx.lineWidth=1.4;ctx.stroke(p.metal);
  }
  if(kind==='armor'||kind==='shield'){
   ctx.fillStyle=base;ctx.fill(p.plate);ctx.stroke(p.plate);
   ctx.fillStyle=kind==='armor'?'#b9faff':accent;
   ctx.shadowColor=ctx.fillStyle;ctx.shadowBlur=kind==='armor'?6*scale:0;
   ctx.beginPath();ctx.ellipse(30,124,7,5,-.27,0,Math.PI*2);ctx.fill();
  }
  if(kind==='web'||kind==='bark'||kind==='claws'){
   ctx.strokeStyle=kind==='claws'?accent:shade;
   ctx.lineWidth=kind==='claws'?3:1.15;ctx.stroke(p[kind]);
  }
  ctx.restore();
 }
 if(web)paintWeb93(ctx,width,height,web);
 if(laserOrigin)paintLaser(ctx,width,height,power.age,laserOrigin);
}

function paintLaser(ctx,width,height,age,palm){
 const charge=smoothStep(age,45,170)*(1-smoothStep(age,355,510));
 if(!charge)return;
 const end={x:width*.5,y:height*.37};
 const beam=smoothStep(age,173,210)*(1-smoothStep(age,282,410));
 const unit=Math.max(2,Math.min(width,height)*.01);
 ctx.save();
 ctx.fillStyle='#d8ffff';ctx.shadowColor='#38daff';ctx.shadowBlur=unit*3;
 ctx.globalAlpha=charge*.92;
 ctx.beginPath();ctx.arc(palm.x,palm.y,unit*(.65+charge),0,Math.PI*2);ctx.fill();
 if(beam){
  ctx.globalAlpha=beam;ctx.strokeStyle='#55e5ff';ctx.lineWidth=unit*3;ctx.lineCap='round';
  ctx.beginPath();ctx.moveTo(palm.x,palm.y);ctx.lineTo(end.x,end.y);ctx.stroke();
  ctx.lineWidth=unit*.96;ctx.strokeStyle='#f2ffff';ctx.shadowBlur=0;ctx.stroke();
 }
 ctx.restore();
}

function paintWeb93(ctx,width,height,{side,age,startX=width*(side<0?.27:.73),startY=height*.83}){
 const reach=Math.min(1,age/125),alpha=Math.min(1,(460-age)/220);
 const aimX=width*(.5-side*.035),aimY=height*.41;
 const endX=startX+(aimX-startX)*reach,endY=startY+(aimY-startY)*reach;
 const line=(x,y,w)=>{
  ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(startX,startY);
  ctx.quadraticCurveTo((startX+x)/2-side*width*.08,(startY+y)/2+height*.015,x,y);ctx.stroke();
 };
 ctx.save();
 ctx.globalAlpha=Math.max(0,alpha);ctx.strokeStyle='#f0fbff';ctx.shadowColor='#62cff7';ctx.shadowBlur=height*.009;
 line(endX,endY,Math.max(2,height*.0032));line(endX+width*.012,endY+height*.016,Math.max(1,height*.0018));
 if(reach===1){
  ctx.beginPath();
  for(let arm=0;arm<8;arm++){
   const angle=Math.PI*arm/4;
   ctx.moveTo(endX,endY);ctx.lineTo(endX+Math.cos(angle)*width*.048,endY+Math.sin(angle)*width*.048);
  }
  ctx.stroke();
 }
 ctx.restore();
}
