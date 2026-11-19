import {heroAssets127 as ART} from './hero-assets127.js?v=129';
import {heroResources129} from './hero-resources129.js?v=129';
import {fistPoint130,paintWind130} from './hero-wind130.js?v=130';
import {panoramaTriangle119} from './panorama-software119.js?v=126';
import {FLOOR_DEPTH} from './base-map86.js?v=95';

export const heroModes127=Object.freeze({
 hulk:[['punch','Pięści'],['slam','W dół']],
 captain:[['punch','Pięści'],['shield','Tarcza']],
 thor:[['punch','Pięści'],['hammer','Młot'],['throw','Rzut młotem']],
 iron:[['punch','Pięści'],['laser','Laser']],
 spider:[['punch','Pięści'],['web','Sieć']]
});

export const hasHeroArt127=hero=>Object.hasOwn(ART.heroes,hero);
export function powerMarkup127(hero){
 if(!hasHeroArt127(hero))return '';
 return '<span class="hq127-status" role="status" aria-live="polite"></span>';
}
export function frameKeys127(frame){return typeof frame==='string'?[frame]:frame.layers.map(layer=>layer.src);}
export function action127(hero,mode,side){
 if(hero==='captain'&&mode==='shield-hit'&&side===1){
  // The supplied throw starts with four frames in which the shield stays held.
  // Reuse that wind-up and its return for a contact strike; never launch the shield.
  const source=ART.heroes.captain.actions['shield:1'],out=source.frames.slice(0,4);
  return {frames:[...out,...out.slice(0,-1).reverse()],duration:520,contact:.5,effect:'shield-dent'};
 }
 return ART.heroes[hero]?.actions[mode+':'+side]??null;
}
export function idleKey127(hero,mode){
 const art=ART.heroes[hero];if(!art)return null;
 return mode==='shield'||mode==='shield-hit'?art.shieldIdle:mode==='hammer'||mode==='throw'?art.hammerIdle:mode==='laser'?art.laserIdle:art.idle;
}
export function frameIndex127(age,duration,count,reduced=false,durations=null){
 const t=Math.max(0,Math.min(.999999,age/duration));
 if(reduced)return t<.35?0:t<.8?Math.floor((count-1)/2):count-1;
 if(durations){let end=0;for(let i=0;i<count;i++){end+=durations[i];if(age<end)return i;}return count-1;}
 return Math.floor(t*count);
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
 const keys=mark.keys,frame=Math.min(keys.length-1,Math.floor((now-mark.at)/(400/keys.length)));
 const image=mark.images.get(keys[Math.max(0,frame)])??mark.images.get(keys[mark.lastIndex??0]);if(!image)return;
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
export function heroPlayer127(hero,changed=()=>{},{resources=heroResources129}={}){
 const supported=hasHeroArt127(hero),pool=resources,owner={},marks=[],requested=new Set();
 let mode='punch',idle=null,playing=null,equipping=null,loading=false,ready=false,serial=0,dead=false,error='',counter=0,progress='',lastContext=null;
 let firstKeys=[],seedKeys=[],hotKeys=[];const preparedModes=new Set();
 const actionKeys=action=>action? action.frames.flatMap(frameKeys127):[];
 const starts=next=>[-1,1].flatMap(side=>action127(hero,next,side)?.frames.slice(0,3).flatMap(frameKeys127)??[]);
 function spec(next,side,count){
  const action=action127(hero,next,side);if(!action)return null;
  const effect=action.effect,web=effect==='web'?Object.values(ART.webs)[(count-1)%6]:null;
  const markKeys=web??(effect!=='punch'?[(ART.effects[effect]??[])[(count-1)%(ART.effects[effect]?.length??1)]]:[]);
  const flashKey=effect==='punch'?ART.effects.punch[(count-1)%4]:effect==='shield-dent'?ART.effects['shield-contact'][0]:effect==='laser'?ART.effects['laser-contact'][(count-1)%3]:null;
  const tipKey=effect==='laser'?ART.effects['laser-tip'][0]:null;
  const windKey=effect==='punch'?ART.effects.wind[(side<0?0:2)+(count%2)]:null;
  return {markKeys,flashKey,tipKey,windKey};
 }
 const fxKeys=(effect,full=false)=>effect?[...(full?effect.markKeys:effect.markKeys.length?[effect.markKeys[0],effect.markKeys.at(-1)]:[]),effect.flashKey,effect.tipKey,effect.windKey].filter(Boolean):[];
 function modeKeys(next){
  const keys=[idleKey127(hero,next)];
  for(const side of [-1,1]){
   const action=action127(hero,next,side);if(!action)continue;keys.push(...actionKeys(action));
   if(action.effect==='web')keys.push(...Object.values(ART.webs).flat());
   else keys.push(...(ART.effects[action.effect]??[]));
   if(action.effect==='punch')keys.push(...ART.effects.punch,...ART.effects.wind);
   if(action.effect==='shield-dent')keys.push(...ART.effects['shield-contact']);
   if(action.effect==='laser')keys.push(...ART.effects['laser-contact'],...ART.effects['laser-tip']);
  }
  return [...new Set(keys)].filter(Boolean);
 }
 function windowKeys(action,index){return action.frames.slice(Math.max(0,index-1),Math.min(action.frames.length,index+4)).flatMap(frameKeys127);}
 function pin(){
  const keys=[idle,...firstKeys,...seedKeys,...hotKeys,...marks.flatMap(mark=>[...mark.images.keys()])];
  if(equipping)keys.push(equipping.from,equipping.to);
  if(playing)keys.push(...windowKeys(playing,playing.index),...frameKeys127(playing.frames[playing.lastIndex]),...fxKeys(playing,true));
  pool.pin(owner,keys.filter(Boolean));
 }
 function request(keys){
  const pending=[...new Set(keys)].filter(key=>key&&!pool.peek(key)&&!requested.has(key));if(!pending.length)return;
  pending.forEach(key=>requested.add(key));
  void pool.decodeAll(pending).catch(e=>{if(!dead)error=e.message;}).finally(()=>{
   pending.forEach(key=>requested.delete(key));if(!dead){pin();changed();}
  });
 }
 function prepareEffects(){
  seedKeys=[...new Set([-1,1].flatMap(side=>fxKeys(spec(mode,side,counter+1))))];pin();request(seedKeys);
 }
 async function setMode(next){
  if(!supported||playing||loading||dead||!heroModes127[hero].some(([id])=>id===next))return false;
  if(next===mode&&ready&&firstKeys.every(key=>pool.peek(key)))return true;
  const ticket=++serial;mode=next;loading=true;ready=false;error='';progress='';firstKeys=starts(next);seedKeys=[];pin();changed();
  const valid=()=>!dead&&ticket===serial;
  try{
   const key=idleKey127(hero,next);await pool.decode(key);if(!valid())return false;idle=key;pin();changed();
   const warmed=await pool.warm(modeKeys(next),(done,total)=>{if(valid()){progress=done+'/'+total;changed();}},valid);
   if(!warmed||!valid())return false;
   seedKeys=[...new Set([-1,1].flatMap(side=>fxKeys(spec(next,side,counter+1))))];pin();
   await pool.decodeAll([...firstKeys,...seedKeys]);
   if(valid()){ready=true;preparedModes.add(next);}
  }catch(e){if(valid())error=e.message;}
  finally{if(valid()){loading=false;pin();changed();}}
  return ready;
 }
 async function prepareGesture(modes){
  if(!supported||playing||dead)return false;
  if(ready&&modes.every(next=>preparedModes.has(next))&&hotKeys.every(key=>pool.peek(key)))return true;
  const ticket=++serial,valid=()=>!dead&&ticket===serial;
  loading=true;ready=false;error='';progress='';
  hotKeys=[...new Set(modes.flatMap(next=>[idleKey127(hero,next),...starts(next),...[-1,1].flatMap(side=>fxKeys(spec(next,side,counter+1)))]))].filter(Boolean);
  firstKeys=starts(mode);pin();changed();
  try{
   const key=idleKey127(hero,mode);await pool.decode(key);if(!valid())return false;idle=key;pin();changed();
   const keys=[...new Set(modes.flatMap(modeKeys))];
   if(!await pool.warm(keys,(done,total)=>{if(valid()){progress=done+'/'+total;changed();}},valid)||!valid())return false;
   await pool.decodeAll(hotKeys);if(!valid())return false;
   modes.forEach(next=>preparedModes.add(next));ready=true;
  }catch(e){if(valid())error=e.message;}
  finally{if(valid()){loading=false;pin();changed();}}
  return ready;
 }
 function equip(next){
  if(playing||equipping||loading||!ready||!preparedModes.has(next)||dead)return false;
  const to=idleKey127(hero,next);if(!pool.peek(to))return false;
  if(next===mode)return true;
  equipping={from:idle,to,at:performance.now(),duration:180};mode=next;idle=to;firstKeys=starts(next);pin();changed();return true;
 }
 // A ready input sets playback state immediately. Downloads and effect decoding
 // never sit in front of the first movement frame.
 async function play(side,next=mode,{preserveOther=false}={}){
  if(!supported||playing||equipping||loading||!ready||dead||next!==mode&&!preparedModes.has(next))return false;
  const action=action127(hero,next,side);if(!action)return false;
  counter++;seedKeys=[];error='';
  playing={...action,...spec(next,side,counter),at:performance.now(),side,mode:next,index:0,lastIndex:0,hit:false,surface:null,preserveOther};
  pin();changed();request([...windowKeys(playing,0),...fxKeys(playing,true)]);
  return true;
 }
 function addMark(power,now){
  if(!power.surface||!power.markKeys.length)return;
  const images=new Map();for(const key of [power.markKeys[0],power.markKeys.at(-1)]){const image=pool.peek(key);if(image)images.set(key,image);}
  marks.push({...power.surface,room:power.room,keys:power.markKeys,images,lastIndex:0,at:now,size:power.effect==='web'?1.45:power.effect==='laser'?.65:1.7});
  if(marks.length>12)marks.shift();
 }
 function draw(ctx,canvas,now,context){
  if(!supported)return false;
  lastContext=context;const {width,height}=canvas;
  ctx.clearRect(0,0,width,height);
  const {view,basis,fx,fy,bounds,room,reduced}=context;
  for(const mark of marks){
   const index=Math.min(mark.keys.length-1,Math.max(0,Math.floor((now-mark.at)/(400/mark.keys.length))));
   const keys=mark.keys.slice(Math.max(0,index-1),Math.min(mark.keys.length,index+3));
   keys.push(mark.keys.at(-1));
   mark.images=new Map(keys.map(key=>[key,pool.peek(key)]).filter(([,image])=>image));
   if(mark.images.has(mark.keys[index]))mark.lastIndex=index;
   request(keys);
   if(mark.room===room)drawMark127(ctx,mark,now,view,basis,fx,fy,width,height);
  }
  let active=playing;
  if(active){
   const age=now-active.at,t=age/active.duration;
   active.index=frameIndex127(age,active.duration,active.frames.length,reduced,active.durations);
   pin();request(windowKeys(active,active.index));
   if(!active.hit&&t>=active.contact){
    active.hit=true;active.room=room;
    const floor=active.effect.endsWith('-dent');
    active.surface=ray127(view,basis,fx,fy,[.5,floor?.73:.47],bounds,floor);
    if(!active.defer)addMark(active,now);
   }
   if(t>=1){if(active.defer)addMark(active,now);playing=null;active=null;prepareEffects();changed();}
  }
  if(active){
   const age=now-active.at,index=active.index,delta=age/active.duration-active.contact;
   const wanted=active.frames[index],complete=frameKeys127(wanted).every(key=>pool.peek(key));
   if(complete)active.lastIndex=index;
   const frame=active.frames[active.lastIndex],loaded=new Map(frameKeys127(frame).map(key=>[key,pool.peek(key)]));
   if(active.windKey&&!reduced&&delta>-.28&&delta<.10){
    const wind=pool.peek(active.windKey),box=frameRect127(width,height);
    if(wind)paintWind130(ctx,active.windKey,wind,fistPoint130(frame,active.side,box),box,Math.sin((delta+.28)/.38*Math.PI)*.85);
   }
   if(active.preserveOther&&idle){
    ctx.save();ctx.beginPath();ctx.rect(active.side<0?0:width/2,0,width/2,height);ctx.clip();drawFrame127(ctx,width,height,frame,loaded);ctx.restore();
    const image=pool.peek(idle);if(image){ctx.save();ctx.beginPath();ctx.rect(active.side<0?width/2:0,0,width/2,height);ctx.clip();drawFrame127(ctx,width,height,idle,new Map([[idle,image]]));ctx.restore();}
   }else drawFrame127(ctx,width,height,frame,loaded);
   if(active.tipKey&&delta>=-.05&&delta<.10){const tip=pool.peek(active.tipKey);if(tip)fitFlash127(ctx,tip,width*.5,height*.47,Math.min(width,height)*.23,reduced?.35:.85);}
   if(active.flashKey&&delta>=0&&delta<.25){const flash=pool.peek(active.flashKey);if(flash)fitFlash127(ctx,flash,width*.5,height*.47,Math.min(width,height)*.42,(1-delta/.25)*(reduced?.45:1));}
  }else if(equipping){
   const t=Math.min(1,(now-equipping.at)/equipping.duration),from=pool.peek(equipping.from),to=pool.peek(equipping.to);
   if(from){ctx.save();ctx.beginPath();ctx.rect(0,0,width/2,height);ctx.clip();drawFrame127(ctx,width,height,equipping.from,new Map([[equipping.from,from]]));ctx.restore();}
   const key=t<.5?equipping.from:equipping.to,image=t<.5?from:to;
   if(image){ctx.save();ctx.beginPath();ctx.rect(width/2,0,width/2,height);ctx.clip();ctx.translate(0,height*.16*(t<.5?t*2:(1-t)*2));drawFrame127(ctx,width,height,key,new Map([[key,image]]));ctx.restore();}
   if(t>=1){equipping=null;changed();}
  }else if(idle){const image=pool.peek(idle);if(image)drawFrame127(ctx,width,height,idle,new Map([[idle,image]]));}
  pin();
  return true;
 }
 return {
  supported,draw,setMode,prepareGesture,equip,play,
  get mode(){return mode;},get loading(){return loading;},get ready(){return ready;},get progress(){return progress;},get busy(){return !!playing||!!equipping||loading;},get error(){return error;},
  get stats(){return {...pool.stats,frame:playing?.index??null,shown:playing?.lastIndex??null};},
  get animated(){return !!playing||!!equipping||marks.some(mark=>lastContext?.room===mark.room&&mark.keys.length>1&&performance.now()-mark.at<400);},
  stop(){serial++;if(loading)ready=false;playing=null;equipping=null;loading=false;pin();},
  dispose(){dead=true;serial++;playing=null;equipping=null;marks.length=0;pool.release(owner);}
 };
}
