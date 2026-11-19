import {panoramaSoftware119,panoramaRay119,panoramaTriangle119} from './panorama-software119.js?v=126';

export function cubeFace126(d){
 const a=d.map(Math.abs),i=a[0]>=a[1]&&a[0]>=a[2]?0:a[1]>=a[2]?1:2;
 return i*2+(d[i]<0?1:0);
}
export function cubeUV126(d,face=cubeFace126(d)){
 const [x,y,z]=d,axis=Math.floor(face/2),m=Math.max(Math.abs(d[axis]),1e-12);
 const [s,t]=[[-z,-y],[z,-y],[x,z],[x,-z],[x,-y],[-x,-y]][face];
 return [.5+s/(2*m),.5+t/(2*m)];
}
export function clipCube126(nodes,face){
 const axis=Math.floor(face/2),sign=face%2?-1:1;
 for(const other of [0,1,2].filter(i=>i!==axis))for(const side of [-1,1]){
  const out=[];
  for(let i=0;i<nodes.length;i++){
   const a=nodes[i],b=nodes[(i+1)%nodes.length];
   const da=a.dir[axis]*sign-a.dir[other]*side,db=b.dir[axis]*sign-b.dir[other]*side;
   if(da>=0)out.push(a);
   if((da>=0)!==(db>=0)){
    const t=da/(da-db),mix=(a,b)=>a.map((n,k)=>n+(b[k]-n)*t);
    out.push({dir:mix(a.dir,b.dir),screen:mix(a.screen,b.screen)});
   }
  }
  nodes=out;
 }
 return nodes;
}
export function panoramaSoftware126(canvas){
 const legacy=panoramaSoftware119(canvas),ctx=canvas?.getContext('2d',{alpha:false});
 if(!ctx||!legacy)return null;
 let faces=null,room=null;
 function paint(nodes,face){
  const image=faces[face],source=nodes.map(n=>cubeUV126(n.dir,face).map((v,i)=>v*((i?image.naturalHeight:image.naturalWidth)-1)+.5));
  panoramaTriangle119(ctx,image,source,nodes.map(n=>n.screen));
 }
 return {kind:'software',load(image,front,selected,cube){
   faces=cube??null;room=selected;
   if(!faces)legacy.load(image,front,selected);
  },free(){faces=room=null;legacy.free();},
  draw(state,basis,fx,fy,squish){
   if(!faces){legacy.draw(state,basis,fx,fy,squish);return;}
   const w=canvas.width,h=canvas.height,cell=Math.max(20,Math.ceil(w/36)),rows=[];
   ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='#102039';ctx.fillRect(0,0,w,h);
   ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
   for(let y=0;;y=Math.min(y+cell,h)){
    const row=[];
    for(let x=0;;x=Math.min(x+cell,w)){
     const dir=panoramaRay119(basis,[state.x,0,state.z],room.bounds,2*x/w-1,1-2*y/h,fx,fy);
     row.push({dir,screen:[x,y],face:cubeFace126(dir)});if(x===w)break;
    }
    rows.push(row);if(y===h)break;
   }
   for(let y=0;y<rows.length-1;y++)for(let x=0;x<rows[y].length-1;x++){
    const q=[rows[y][x],rows[y][x+1],rows[y+1][x+1],rows[y+1][x]];
    for(const ids of [[0,1,2],[0,2,3]]){
     const nodes=ids.map(i=>q[i]);
     if(nodes.every(n=>n.face===nodes[0].face)){paint(nodes,nodes[0].face);continue;}
     // Clip at the actual cube edges, instead of stretching a triangle from
     // one face across another or revealing dark gaps during a full turn.
     for(let face=0;face<6;face++){
      const poly=clipCube126(nodes,face);
      for(let i=1;i<poly.length-1;i++)paint([poly[0],poly[i],poly[i+1]],face);
     }
    }
   }
  }
 };
}
