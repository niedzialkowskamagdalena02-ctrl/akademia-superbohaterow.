import {contactAnchors142,markAnchors142} from './hero-impact-anchors142.js?v=142';
import {hallScene138} from './hall-scene138.js?v=141';
import {FLOOR_DEPTH} from './base-map86.js?v=95';
const dot=(a,b)=>a.reduce((sum,n,i)=>sum+n*b[i],0),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],unit=a=>{const n=Math.hypot(...a);return a.map(x=>x/n);};
const offset=(.5-.155)*Math.PI*2,transform=a=>[Math.cos(offset)*a[0]+Math.sin(offset)*a[2],a[1],Math.sin(offset)*a[0]-Math.cos(offset)*a[2]];
export function screenRay142(basis,fx,fy,aim){const x=(aim[0]-.5)*2*fx,y=(.5-aim[1])*2*fy;return [basis[6]+basis[0]*x+basis[3]*y,basis[7]+basis[4]*y,basis[8]+basis[2]*x+basis[5]*y];}
export function projectImpact142(view,basis,fx,fy,width,height,point){
 const d=[point[0]-view.x,point[1],point[2]-view.z],z=dot(d,basis.slice(6));if(z<.12)return null;
 return [(.5+dot(d,basis.slice(0,3))/(2*z*fx))*width,(.5-dot(d,basis.slice(3,6))/(2*z*fy))*height,z];
}
export function hitSurface142(view,basis,fx,fy,aim,bounds,room){
 let eye=[view.x||0,0,view.z||0],ray=screenRay142(basis,fx,fy,aim),right=basis.slice(0,3),planes=[];
 if(room==='hall'){
  eye=transform(eye);eye[1]=hallScene138.eye;ray=transform(ray);right=transform(right);
  const a=hallScene138.apothem,slope=(hallScene138.apex_height-hallScene138.wall_height)/a;
  for(let i=0;i<8;i++){const x=Math.sin(i*Math.PI/4),z=-Math.cos(i*Math.PI/4);planes.push({n:[x,0,z],d:a,kind:'wall'},{n:[slope*x,1,slope*z],d:hallScene138.apex_height,kind:'roof'});}
  planes.push({n:[0,-1,0],d:0,kind:'floor'});
 }else for(let axis=0;axis<3;axis++)for(const side of [-1,1]){const n=[0,0,0];n[axis]=side;planes.push({n,d:axis===1&&side<0?FLOOR_DEPTH:bounds[axis],kind:axis===1?(side<0?'floor':'ceiling'):'wall'});}
 let distance=Infinity,plane=null;
 for(const p of planes){const denominator=dot(p.n,ray);if(denominator<=1e-8)continue;const t=(p.d-dot(p.n,eye))/denominator;if(t>0&&t<distance){distance=t;plane=p;}}
 if(!plane)return null;
 let point=eye.map((n,i)=>n+ray[i]*distance),normal=unit(plane.n);
 let horizontal=Math.abs(normal[1])>.98?unit(right.map((n,i)=>n-normal[i]*dot(right,normal))):unit(cross([0,1,0],normal));let vertical=unit(cross(normal,horizontal));
 if(room==='hall'){point[1]-=hallScene138.eye;point=transform(point);normal=transform(normal);horizontal=transform(horizontal);vertical=transform(vertical);}
 return {point,horizontal,vertical,normal,kind:plane.kind,aim:[...aim]};
}
export function contactFrameKeys142(hero,mode,side){const meta=contactAnchors142[`${hero}:${mode}:${side}`];return meta?[meta.src]:[];}
export function contactPoint142(hero,mode,side,frame,box,fallback){
 const meta=contactAnchors142[`${hero}:${mode}:${side}`];if(!meta)return fallback;
 const layers=typeof frame==='string'?[{src:frame}]:frame.layers,layer=layers.find(layer=>layer.src===meta.src)||{src:meta.src},[x,y,w,h]=layer.rect||[0,0,1,1],scale=Math.min(box.w*w/meta.size[0],box.h*h/meta.size[1]),iw=meta.size[0]*scale,ih=meta.size[1]*scale;
 return {x:box.x+x*box.w+(box.w*w-iw)/2+meta.point[0]*iw,y:box.y+y*box.h+box.h*h-ih+meta.point[1]*ih,width:iw*.1,height:ih*.1};
}
export const markAnchor142=key=>markAnchors142[key]?.anchor||[.5,.5];
export function paintImpactFlash142(ctx,key,image,point,size,alpha){const meta=markAnchors142[key],a=meta?.anchor||[.5,.5],scale=size/(Math.max(image.naturalWidth,image.naturalHeight)),w=image.naturalWidth*scale,h=image.naturalHeight*scale;ctx.save();ctx.globalAlpha=alpha;ctx.drawImage(image,point[0]-a[0]*w,point[1]-a[1]*h,w,h);ctx.restore();}
