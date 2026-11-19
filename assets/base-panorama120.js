import {hallEntries120} from './hall-entries120.js?v=120';
import {FLOOR_DEPTH,VERTICAL_SCALE} from './base-map86.js?v=95';

// Entrances are already in the shared texture. Buttons provide only hit areas.
export function hallPoint120(point){
 const rect=hallEntries120[point.room];
 return rect?{...point,u:rect[0]+rect[2]/2,v:rect[1]+rect[3]/2,panel120:rect}:point;
}
export function hallDoor120(label){
 return `<span class="academy102-sr">${label}</span>`;
}
export function hallSurface120(room,u,v){
 const yaw=(u-.5)*2*Math.PI,pitch=(.5-v)*Math.PI/VERTICAL_SCALE;
 const ray=[Math.cos(pitch)*Math.sin(yaw),Math.sin(pitch),Math.cos(pitch)*Math.cos(yaw)];
 const depth=Math.min(...ray.map((n,i)=>Math.abs(n)<1e-9?Infinity:
  (i===1&&n<0?FLOOR_DEPTH:room.bounds[i])/Math.abs(n)));
 return ray.map(n=>n*depth);
}
export function hallOutline120(room,rect){
 const [u,v,w,h]=rect,result=[];
 // Sample each edge: the bitmap is on the room surface, not a floating plane.
 for(let edge=0;edge<4;edge++)for(let step=0;step<12;step++){
  const t=step/12;
  const xy=edge===0?[u+w*t,v]:edge===1?[u+w,v+h*t]:edge===2?[u+w*(1-t),v+h]:[u,v+h*(1-t)];
  result.push(hallSurface120(room,...xy));
 }
 return result;
}
function clip(points,axis,limit,greater){
 const output=[];
 for(let i=0;i<points.length;i++){
  const a=points[i],b=points[(i+1)%points.length];
  const insideA=greater?a[axis]>=limit:a[axis]<=limit;
  const insideB=greater?b[axis]>=limit:b[axis]<=limit;
  if(insideA)output.push(a);
  if(insideA!==insideB){const t=(limit-a[axis])/(b[axis]-a[axis]);output.push(a.map((n,k)=>n+(b[k]-n)*t));}
 }
 return output;
}
export function hallHitPolygon120(outline,view,basis,fx,fy,width,height){
 let points=outline.map(p=>{
  const dx=p[0]-view.x,dy=p[1],dz=p[2]-view.z;
  return [dx*basis[0]+dz*basis[2],dx*basis[3]+dy*basis[4]+dz*basis[5],
   dx*basis[6]+dy*basis[7]+dz*basis[8]];
 });
 points=clip(points,2,.08,true).map(([x,y,z])=>[(.5+x/(2*z*fx))*width,(.5-y/(2*z*fy))*height]);
 for(const [axis,limit,greater] of [[0,0,true],[0,width,false],[1,0,true],[1,height,false]]){
  points=clip(points,axis,limit,greater);
 }
 return points;
}
export function placeHallHit120(marker,outline,view,basis,fx,fy,width,height){
 const points=hallHitPolygon120(outline,view,basis,fx,fy,width,height);
 marker.hidden=points.length<3;
 if(!marker.hidden){
  marker.style.width=width+'px';marker.style.height=height+'px';
  marker.style.clipPath='polygon('+points.map(([x,y])=>`${x}px ${y}px`).join(',')+')';
 }
}
