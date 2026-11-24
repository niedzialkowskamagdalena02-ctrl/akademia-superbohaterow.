import {createHallAssets141} from './hall-assets141.js?v=141';
import {hallScene138} from './hall-scene138.js?v=141';
import {createLayeredHall137,hallGeometry137,hallCamera137} from './hall-layered137.js?v=141';
const TURN=Math.PI*2,OFFSET=(.5-.155)*TURN;
const scene=hallScene138,geometry=hallGeometry137(scene),base=new URL('./hq/hall138/',import.meta.url);
const mod=(x,n)=>(x%n+n)%n;
export const hallDefault138='hall138/fallback.png';
export const hallScenes138=scene.rooms.map(r=>({...r,room:r.id==='globe'?'training':r.id,u:mod(.155+r.index/8,1)}));
const transform=(x,z)=>[Math.cos(OFFSET)*x+Math.sin(OFFSET)*z,Math.sin(OFFSET)*x-Math.cos(OFFSET)*z];
export function hallState138(state){const [x,z]=transform(state.x||0,state.z||0);return {...state,x,z,yaw:state.yaw+OFFSET};}
export function hallFov138(width,height){return hallCamera137(0,0,width,height).tan;}
export function hallAnchor138(id){const room=geometry.find(r=>r.id===id)||geometry[4];const [x,z]=transform(room.normal[0]*scene.apothem,room.normal[2]*scene.apothem);return [x,0,z];}
export function clampHall138(state){
 let [x,z]=transform(state.x,state.z);const limit=scene.apothem-.65;
 for(let pass=0;pass<2;pass++)for(const room of geometry){const n=room.normal,excess=x*n[0]+z*n[2]-limit;if(excess>0){x-=n[0]*excess;z-=n[2]*excess;}}
 [state.x,state.z]=transform(x,z);return state;
}
export function hallPoint138(point,state={yaw:0},id){
 const choices=hallScenes138.filter(r=>r.room===point.room&&(!id||r.id===id));
 const distance=r=>Math.abs(Math.atan2(Math.sin((r.u-.5)*TURN-state.yaw),Math.cos((r.u-.5)*TURN-state.yaw)));
 const room=choices.sort((a,b)=>distance(a)-distance(b))[0];return room?{...point,scene:room.id,u:room.u,v:.57}:point;
}
function project(point,state,width,height){
 const camera=hallCamera137(state.yaw,state.pitch,width,height),p=[point[0]-state.x,point[1]-scene.eye,point[2]-state.z];
 return [p.reduce((v,x,i)=>v+x*camera.right[i],0),p.reduce((v,x,i)=>v+x*camera.up[i],0),p.reduce((v,x,i)=>v+x*camera.forward[i],0)];
}
export function hallRegions138(state,width,height){
 return geometry.map(room=>{
  const at=(x,y)=>[room.normal[0]*(scene.apothem-.025)+room.right[0]*x,y,room.normal[2]*(scene.apothem-.025)+room.right[2]*x];
  const raw=room.sign?room.signVertices:[at(-room.half*.7,3.4),at(room.half*.7,3.4),at(-room.half*.7,.35),at(room.half*.7,.35)];
  // Order around the perimeter, then clip in camera space before perspective.
  let polygon=[raw[0],raw[1],raw[3],raw[2]].map(p=>project(p,state,width,height)),clipped=[];
  for(let i=0;i<polygon.length;i++){const a=polygon[i],b=polygon[(i+1)%polygon.length],inside=a[2]>=.1,next=b[2]>=.1;if(inside)clipped.push(a);if(inside!==next){const t=(.1-a[2])/(b[2]-a[2]);clipped.push(a.map((n,k)=>n+(b[k]-n)*t));}}
  const camera=hallCamera137(state.yaw,state.pitch,width,height);
  polygon=clipped.map(p=>[(.5+p[0]/(2*p[2]*camera.tan[0]))*width,(.5-p[1]/(2*p[2]*camera.tan[1]))*height]);
  const visible=polygon.length>=3&&Math.max(...polygon.map(p=>p[0]))>=0&&Math.min(...polygon.map(p=>p[0]))<=width&&Math.max(...polygon.map(p=>p[1]))>=0&&Math.min(...polygon.map(p=>p[1]))<=height;
  return {scene:room.id,room:room.id==='globe'?'training':room.id,polygon,visible};
 });
}
export function placeHallEntrance138(marker,point,snapshot,width,height){
 const region=snapshot?.regions.find(r=>r.scene===(marker.dataset.hallScene||point.scene));
 marker.hidden=!region?.visible;if(marker.hidden)return;
 marker.style.width=width+'px';marker.style.height=height+'px';
 marker.style.clipPath='polygon('+region.polygon.map(([x,y])=>`${x*width/snapshot.width}px ${y*height/snapshot.height}px`).join(',')+')';
}
export function createHallView138(canvas,changed=()=>{}){
 let active=false,renderer=null,pending=null,token=0,snapshot=null,soft=null,softCanvas=null,assets=null,controller=null,lastState=null;
 async function fallback(){
  await assets.loadAll();
  if(!softCanvas){softCanvas=document.createElement('canvas');softCanvas.className='hq138-soft';softCanvas.setAttribute('aria-hidden','true');canvas.after(softCanvas);soft=softCanvas.getContext('2d',{alpha:false});}
  if(!soft)throw Error('Brak obsługi grafiki w przeglądarce.');
  canvas.dataset.fallback='true';softCanvas.hidden=!active;
 }
 function drawSoftware(state){
  const w=canvas.width,h=canvas.height;if(softCanvas.width!==w)softCanvas.width=w;if(softCanvas.height!==h)softCanvas.height=h;
  const index=mod(Math.round(state.yaw/(TURN/8)),8),room=scene.rooms[index],frame=assets.get('ramka.png'),photo=assets.get(room.image),fw=frame.naturalWidth||frame.width,fh=frame.naturalHeight||frame.height,scale=Math.max(w/fw,h/fh);
  const rw=fw*scale,rh=fh*scale,x=(w-rw)/2,y=Math.max(h-rh,Math.min(0,(h-rh)/2+state.pitch*h*.2));
  soft.fillStyle='#10263c';soft.fillRect(0,0,w,h);soft.imageSmoothingQuality='high';soft.drawImage(photo,x,y,rw,rh);soft.drawImage(frame,x,y,rw,rh);
  let rect=[x+rw*.08,y+rh*.13,rw*.84,rh*.8];
  if(room.sign){const sign=assets.get(room.sign),sw=rw*.73,sh=sw*(sign.naturalHeight||sign.height)/(sign.naturalWidth||sign.width),sx=(w-sw)/2,sy=y+rh*.82;soft.drawImage(sign,sx,sy,sw,sh);rect=[sx,sy,sw,sh];}
  const [rx,ry,ww,hh]=rect;return [{scene:room.id,room:room.id==='globe'?'training':room.id,visible:true,polygon:[[rx,ry],[rx+ww,ry],[rx+ww,ry+hh],[rx,ry+hh]]}];
 }
 const api={
  async load(state,{onProgress=()=>{}}={}){
   const mine=++token;active=true;lastState=state;
   if(!pending){
    controller?.abort();assets?.free();controller=new AbortController();
    assets=createHallAssets141(scene,{baseURL:base.href,signal:controller.signal,onProgress:p=>onProgress(p)});
    pending=(async()=>{try{renderer=await createLayeredHall137(canvas,scene,{baseURL:base.href,signal:controller.signal,assets});canvas.dataset.fallback='false';}catch(error){if(controller.signal.aborted)throw error;renderer?.free();renderer=null;await fallback();}})().catch(error=>{pending=null;controller.abort();assets?.free();throw error;});
   }
   await pending;if(mine!==token||!active)return false;
   if(softCanvas)softCanvas.hidden=!soft;
   try{api.draw(state);}catch(error){renderer?.free();renderer=null;await fallback();api.draw(state);}
   onProgress({percent:100,phase:'ready'});changed();return true;
  },
  draw(state,force=false){if(!active||!renderer&&!soft)return null;lastState=state;const live=hallState138(state),w=canvas.width,h=canvas.height;
   if(!w||!h)throw Error('Widok holu nie ma rozmiaru.');
   if(renderer)renderer.draw(live,force);const regions=renderer?hallRegions138(live,w,h):drawSoftware(live);snapshot={regions,width:w,height:h};return snapshot;
  },
  snapshot:()=>snapshot,
  deactivate(){active=false;token++;snapshot=null;if(softCanvas)softCanvas.hidden=true;},
  free(){api.deactivate();controller?.abort();renderer?.free();assets?.free();renderer=null;pending=null;assets=null;softCanvas?.remove();softCanvas=null;soft=null;}
 };
 canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();if(!active||!assets||controller.signal.aborted)return;renderer?.free();renderer=null;void fallback().then(()=>{if(active&&lastState)api.draw(lastState);changed();}).catch(error=>canvas.dispatchEvent(new CustomEvent('hall141:error',{detail:{message:error.message}})));});
 return api;
}
