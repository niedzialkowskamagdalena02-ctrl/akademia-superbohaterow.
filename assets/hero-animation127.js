import {heroAssets127 as ART} from './hero-assets127.js?v=127';
import {panoramaTriangle119} from './panorama-software119.js?v=126';
import {FLOOR_DEPTH} from './base-map86.js?v=95';

export const heroModes127=Object.freeze({
 hulk:[['punch','Pięści'],['slam','W dół']],
 captain:[['punch','Pięści'],['shield','Tarcza']],
 thor:[['punch','Pięści'],['hammer','Młot'],['throw','Rzut młotem']],
 iron:[['punch','Pięści'],['laser','Laser']],
 spider:[['punch','Pięści'],['web','Sieć']]
});
const cache=new Map(),ROOT='assets/hq/hands127/';
export const hasHeroArt127=hero=>Object.hasOwn(ART.heroes,hero);
export function powerMarkup127(hero){
 const modes=heroModes127[hero];if(!modes)return '';
 return `<div class="hq127-controls" data-walk-controls role="group" aria-label="Ruchy bohatera">
  <div class="hq127-modes">${modes.map(([id,label],i)=>`<button type="button" data-walk-mode="${id}" aria-pressed="${i===0}">${label}</button>`).join('')}</div>
  <div class="hq112-power-controls"><button type="button" data-walk-power="-1" aria-keyshortcuts="F">👊 Lewa</button><button type="button" data-walk-power="1" aria-keyshortcuts="G">👊 Prawa</button></div>
  <span class="hq127-status" role="status" aria-live="polite"></span>
 </div>`;
}
function image127(key){
 if(!cache.has(key)){
  const promise=new Promise((resolve,reject)=>{
   const image=new Image();image.onload=()=>resolve(image);
   image.onerror=()=>{cache.delete(key);reject(new Error('Nie udało się wczytać oryginalnej klatki. Spróbuj ponownie.'));};
   image.src=ROOT+key;
  });
  cache.set(key,promise);
 }else{const value=cache.get(key);cache.delete(key);cache.set(key,value);}
 while(cache.size>32)cache.delete(cache.keys().next().value);
 return cache.get(key);
}
export function frameKeys127(frame){return typeof frame==='string'?[frame]:frame.layers.map(layer=>layer.src);}
export function action127(hero,mode,side){return ART.heroes[hero]?.actions[mode+':'+side]??null;}
export function idleKey127(hero,mode){
 const art=ART.heroes[hero];if(!art)return null;
 return mode==='shield'?art.shieldIdle:mode==='hammer'||mode==='throw'?art.hammerIdle:mode==='laser'?art.laserIdle:art.idle;
}
export function frameIndex127(age,duration,count,reduced=false){
 const t=Math.max(0,Math.min(.999999,age/duration));
 return reduced?(t<.35?0:t<.8?Math.floor((count-1)/2):count-1):Math.floor(t*count);
}
export function frameRect127(width,height){
 const w=Math.min(width*(width<height?1.55:1),height*1280/720),h=w*720/1280;
 return {x:(width-w)/2,y:height-h,w,h};
}
function drawLayer(ctx,image,box,layer={}){
 const [x,y,w,h]=layer.rect??[0,0,1,1];
 const maxW=box.w*w,maxH=box.h*h,scale=Math.min(maxW/image.naturalWidth,maxH/image.naturalHeight);
 const iw=image.naturalWidth*scale,ih=image.naturalHeight*scale;
 ctx.save();
 if(layer.clip){const [cx,cy,cw,ch]=layer.clip;ctx.beginPath();ctx.rect(box.x+cx*box.w,box.y+cy*box.h,cw*box.w,ch*box.h);ctx.clip();}
 ctx.drawImage(image,box.x+x*box.w+(maxW-iw)/2,box.y+y*box.h+maxH-ih,iw,ih);
 ctx.restore();
}
export function drawFrame127(ctx,width,height,frame,loaded){
 const box=frameRect127(width,height),layers=typeof frame==='string'?[{src:frame}]:frame.layers;
 ctx.save();ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
 for(const layer of layers){const image=loaded.get(layer.src);if(image)drawLayer(ctx,image,box,layer);}
 ctx.restore();
}
function ray127(view,basis,fx,fy,aim,bounds,floor=false){
 const sx=(aim[0]-.5)*2*fx,sy=(.5-aim[1])*2*fy;
 const ray=[basis[6]+basis[0]*sx+basis[3]*sy,basis[7]+basis[4]*sy,basis[8]+basis[2]*sx+basis[5]*sy];
 if(floor)ray[1]=Math.min(-.65,ray[1]);
 const eye=[view.x,0,view.z],low=[-bounds[0],-FLOOR_DEPTH,-bounds[2]];
 let distance=Infinity,axis=2;
 for(let i=0;i<3;i++){if(Math.abs(ray[i])<1e-7)continue;const d=((ray[i]>0?bounds[i]:low[i])-eye[i])/ray[i];if(d>0&&d<distance){distance=d;axis=i;}}
 const point=eye.map((n,i)=>n+ray[i]*distance*.9995);
 let horizontal=axis===0?[0,0,1]:[1,0,0],vertical=[0,1,0];
 if(axis===1){horizontal=[basis[0],0,basis[2]];vertical=[-basis[2],0,basis[0]];}
 return {point,horizontal,vertical,axis};
}
export const hitSurface127=ray127;
function project127(view,basis,fx,fy,width,height,p){
 const d=[p[0]-view.x,p[1],p[2]-view.z],depth=d[0]*basis[6]+d[1]*basis[7]+d[2]*basis[8];
 if(depth<.12)return null;
 return [(.5+(d[0]*basis[0]+d[2]*basis[2])/(2*depth*fx))*width,(.5-(d[0]*basis[3]+d[1]*basis[4]+d[2]*basis[5])/(2*depth*fy))*height,depth];
}
function drawMark127(ctx,mark,now,view,basis,fx,fy,width,height){
 const keys=mark.keys,frame=Math.min(keys.length-1,Math.floor((now-mark.at)/50));
 const image=mark.images.get(keys[Math.max(0,frame)]);if(!image)return;
 const sourceW=image.naturalWidth,sourceH=image.naturalHeight;
 const w=mark.size,h=w*sourceH/sourceW;
 const points=[[-.5,.5],[.5,.5],[.5,-.5],[-.5,-.5]].map(([x,y])=>project127(view,basis,fx,fy,width,height,mark.point.map((n,i)=>n+mark.horizontal[i]*w*x+mark.vertical[i]*h*y)));
 if(points.some(p=>!p))return;
 const uv=[[0,0],[sourceW,0],[sourceW,sourceH],[0,sourceH]];
 for(const indices of [[0,1,2],[0,2,3]])panoramaTriangle119(ctx,image,indices.map(i=>uv[i]),indices.map(i=>points[i].slice(0,2)));
}
function fitFlash127(ctx,image,x,y,size,alpha=1){
 const scale=size/Math.max(image.naturalWidth,image.naturalHeight),w=image.naturalWidth*scale,h=image.naturalHeight*scale;
 ctx.save();ctx.globalAlpha=alpha;ctx.drawImage(image,x-w/2,y-h/2,w,h);ctx.restore();
}

// Frames are the supplied PNGs, drawn intact. Only placement and playback are code.
export function heroPlayer127(hero,changed=()=>{}){
 const supported=hasHeroArt127(hero),images=new Map();
 let mode='punch',idle=null,playing=null,loading=false,serial=0,dead=false,error='',lastContext=null,counter=0;
 const marks=[];
 async function loadKeys(keys){
  const unique=[...new Set(keys)].filter(Boolean);
  for(let start=0;start<unique.length;start+=4){await Promise.all(unique.slice(start,start+4).map(async key=>{const image=await image127(key);if(!dead)images.set(key,image);}));}
 }
 async function setMode(next){
  if(!supported||playing||loading||!heroModes127[hero].some(([id])=>id===next))return false;
  const ticket=++serial;mode=next;loading=true;error='';changed();
  try{const key=idleKey127(hero,mode);await loadKeys([key]);if(!dead&&ticket===serial)idle=key;}
  catch(e){if(!dead)error=e.message;}
  finally{if(!dead&&ticket===serial){loading=false;changed();}}
  return !error;
 }
 async function play(side){
  if(!supported||playing||loading||dead)return false;
  const action=action127(hero,mode,side);if(!action)return false;
  const ticket=++serial;loading=true;error='';changed();counter++;
  const effect=action.effect,webKeys=effect==='web'?Object.values(ART.webs)[(counter-1)%6]:null;
  const markKey=webKeys??(effect!=='punch'?[(ART.effects[effect]??[])[(counter-1)%(ART.effects[effect]?.length??1)]]:[]);
  const flashKey=effect==='punch'?ART.effects.punch[(counter-1)%4]:effect==='shield-dent'?ART.effects['shield-contact'][0]:effect==='laser'?ART.effects['laser-contact'][(counter-1)%3]:null;
  const tipKey=effect==='laser'?ART.effects['laser-tip'][0]:null;
  const windKey=effect==='punch'?ART.effects.wind[(side<0?0:2)+(counter%2)]:null;
  try{
   await loadKeys([...action.frames.flatMap(frameKeys127),...markKey,flashKey,tipKey,windKey]);
   if(dead||ticket!==serial)return false;
   const keys=new Set([idle,...action.frames.flatMap(frameKeys127),...marks.flatMap(m=>m.keys),...markKey,flashKey,tipKey,windKey]);
   for(const key of images.keys())if(!keys.has(key))images.delete(key);
   playing={...action,at:performance.now(),side,mode,markKeys:markKey,flashKey,tipKey,windKey,hit:false,surface:null};
  }catch(e){if(!dead)error=e.message;}
  finally{if(!dead&&ticket===serial){loading=false;changed();}}
  return !error;
 }
 function addMark(power,now){
  if(!power.surface||!power.markKeys.length)return;
  const fxImages=new Map(power.markKeys.map(key=>[key,images.get(key)]));
  marks.push({...power.surface,room:power.room,keys:power.markKeys,images:fxImages,at:now,size:power.effect==='web'?1.45:power.effect==='laser'?.65:1.7});
  if(marks.length>12)marks.shift();
 }
 function draw(ctx,canvas,now,context){
  if(!supported)return false;
  lastContext=context;const {width,height}=canvas;
  ctx.clearRect(0,0,width,height);
  const {view,basis,fx,fy,bounds,room,reduced}=context;
  for(const mark of marks)if(mark.room===room)drawMark127(ctx,mark,now,view,basis,fx,fy,width,height);
  let active=playing;
  if(active){
   const age=now-active.at,t=age/active.duration;
   if(!active.hit&&t>=active.contact){
    active.hit=true;active.room=room;
    const floor=active.effect.endsWith('-dent');
    active.surface=ray127(view,basis,fx,fy,[.5,floor?.73:.47],bounds,floor);
    if(!active.defer)addMark(active,now);
   }
   if(t>=1){if(active.defer)addMark(active,now);playing=null;active=null;changed();}
  }
  if(active){
   const age=now-active.at,index=frameIndex127(age,active.duration,active.frames.length,reduced);
   const delta=age/active.duration-active.contact;
   if(active.windKey&&!reduced&&delta>-.28&&delta<.10){const wind=images.get(active.windKey);if(wind)fitFlash127(ctx,wind,width*.5,height*.60,width*.9,Math.sin((delta+.28)/.38*Math.PI)*.65);}
   drawFrame127(ctx,width,height,active.frames[index],images);
   if(active.tipKey&&delta>=-.05&&delta<.10){const tip=images.get(active.tipKey);if(tip)fitFlash127(ctx,tip,width*.5,height*.47,Math.min(width,height)*.23,reduced?.35:.85);}
   if(active.flashKey&&delta>=0&&delta<.25){const flash=images.get(active.flashKey);if(flash)fitFlash127(ctx,flash,width*.5,height*.47,Math.min(width,height)*.42,(1-delta/.25)*(reduced?.45:1));}
  }else if(idle)drawFrame127(ctx,width,height,idle,images);
  return true;
 }
 return {
  supported,draw,setMode,play,
  get mode(){return mode;},get loading(){return loading;},get busy(){return !!playing||loading;},get error(){return error;},
  get animated(){return !!playing||marks.some(mark=>lastContext?.room===mark.room&&mark.keys.length>1&&performance.now()-mark.at<mark.keys.length*50);},
  stop(){serial++;playing=null;loading=false;},
  dispose(){dead=true;serial++;playing=null;marks.length=0;images.clear();}
 };
}
