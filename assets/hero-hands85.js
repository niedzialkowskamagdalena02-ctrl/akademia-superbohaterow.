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
export function loadHeroHands88(hero){
 if(!illustratedHands.has(hero))return Promise.resolve(null);
 if(!handImages.has(hero)){
  handImages.set(hero,new Promise(resolve=>{
   const image=new Image();
   image.onload=()=>resolve(image);
   image.onerror=()=>{handImages.delete(hero);resolve(null);};
   image.src='assets/hq/hands90-'+hero+'.webp';
  }));
 }
 return handImages.get(hero);
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

export function drawHeroHands(ctx,canvas,hero,step,moving,image=null){
 const {width,height}=canvas;
 ctx.clearRect(0,0,width,height);
 if(image){
  const scale=Math.min(width*.34/image.naturalWidth,height*.22/image.naturalHeight)*(hero==='hulk'?1.11:1);
  const w=image.naturalWidth*scale,h=image.naturalHeight*scale;
  for(const side of [-1,1]){
   const sway=moving?Math.sin(step+side*Math.PI/2):0;
   ctx.save();
   ctx.translate(width*(side<0?.067:.933),height+h*(.04+sway*.037));
   ctx.scale(-side,1);ctx.rotate(sway*.04);
   ctx.drawImage(image,0,-h,w,h);
   ctx.restore();
  }
  return;
 }
 const [base,light,shade,cuff,accent,kind]=costumes[hero]??costumes.iron;
 const p=geometry(),scale=Math.min(width*.00315,height*.00132)*(kind==='skin'?1.15:1);
 for(const side of [-1,1]){
  const sway=moving?Math.sin(step+side*Math.PI/2):0;
  ctx.save();
  ctx.translate(width*(side<0?.084:.916),height+(sway*5-130)*scale);
  ctx.scale(-side*scale,scale);
  ctx.rotate(-.13-sway*.048);
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
}
