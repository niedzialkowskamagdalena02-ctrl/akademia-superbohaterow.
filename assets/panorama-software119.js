// Canvas renderer for devices where WebGL is unavailable. Uses the same rays,
// room bounds and camera as the WebGL renderer and the entrance hit areas.
const smooth=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);};
export function panoramaRay119(basis,eye,bounds,sx,sy,fx,fy){
 const ray=[basis[0]*sx*fx+basis[3]*sy*fy+basis[6],
  basis[1]*sx*fx+basis[4]*sy*fy+basis[7],basis[2]*sx*fx+basis[5]*sy*fy+basis[8]];
 const distance=Math.min(...ray.map((r,i)=>Math.abs(r)<1e-9?Infinity:((r>=0?bounds[i]:i===1?-1.58:-bounds[i])-eye[i])/r));
 const p=ray.map((r,i)=>eye[i]+r*distance),length=Math.hypot(...p);
 return p.map(n=>n/length);
}
function triangle(ctx,image,source,destination,alpha=1,repeat=false){
 const [[u0,v0],[u1,v1],[u2,v2]]=source,[[x0,y0],[x1,y1],[x2,y2]]=destination;
 const du1=u1-u0,dv1=v1-v0,du2=u2-u0,dv2=v2-v0,det=du1*dv2-du2*dv1;
 if(Math.abs(det)<1e-8)return;
 const a=((x1-x0)*dv2-(x2-x0)*dv1)/det,b=((y1-y0)*dv2-(y2-y0)*dv1)/det;
 const c=((x2-x0)*du1-(x1-x0)*du2)/det,d=((y2-y0)*du1-(y1-y0)*du2)/det;
 // Slight overlap prevents antialiased clip edges from exposing a mesh grid.
 const cx=(x0+x1+x2)/3,cy=(y0+y1+y2)/3;
 const expanded=destination.map(([x,y])=>{const length=Math.hypot(x-cx,y-cy)||1;return [x+(x-cx)/length*.75,y+(y-cy)/length*.75];});
 ctx.save();ctx.globalAlpha=alpha;ctx.beginPath();ctx.moveTo(...expanded[0]);ctx.lineTo(...expanded[1]);ctx.lineTo(...expanded[2]);ctx.closePath();ctx.clip();
 ctx.transform(a,b,c,d,x0-a*u0-c*v0,y0-b*u0-d*v0);ctx.drawImage(image,0,0);
 if(repeat)ctx.drawImage(image,image.naturalWidth,0);
 ctx.restore();
}
export function panoramaSoftware119(canvas){
 const ctx=canvas?.getContext('2d',{alpha:false});
 if(!ctx)return null;
 let image=null,front=null,room=null;
 return {kind:'software',load(background,portrait,selected){image=background;front=portrait;room=selected;},free(){image=front=room=null;},
  draw(state,basis,fx,fy,squish){
   if(!image||!room)return;
   const w=canvas.width,h=canvas.height,cell=Math.max(20,Math.ceil(w/36)),eye=[state.x,0,state.z],rows=[];
   ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='#102039';ctx.fillRect(0,0,w,h);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
   for(let y=0;;y=Math.min(y+cell,h)){
    const row=[];
    for(let x=0;;x=Math.min(x+cell,w)){
     const dir=panoramaRay119(basis,eye,room.bounds,2*x/w-1,1-2*y/h,fx,fy);
     const uv=[.5+Math.atan2(dir[0],dir[2])/(2*Math.PI),Math.max(.002,Math.min(.998,.5-Math.asin(dir[1])*1.36/Math.PI))];
     let photo=null;
     if(front&&dir[2]>.02){
      const px=.5+dir[0]/dir[2]/(2*.94*front.naturalWidth/front.naturalHeight),py=.5-dir[1]/dir[2]/(2*.94);
      const toy=(1-smooth(.10,.15,Math.abs(px-.809)))*(1-smooth(.08,.115,Math.abs(py-.587)));
      photo=[px,py+squish*toy*(py-.677)*.7];
     }
     row.push({screen:[x,y],uv,photo});if(x===w)break;
    }
    rows.push(row);if(y===h)break;
   }
   for(let y=0;y<rows.length-1;y++)for(let x=0;x<rows[y].length-1;x++){
    const quad=[rows[y][x],rows[y][x+1],rows[y+1][x+1],rows[y+1][x]];
    for(const indices of [[0,1,2],[0,2,3]]){
     const nodes=indices.map(i=>quad[i]),wrap=Math.max(...nodes.map(n=>n.uv[0]))-Math.min(...nodes.map(n=>n.uv[0]))>.5;
     const uv=nodes.map(n=>[(n.uv[0]+(wrap&&n.uv[0]<.5?1:0))*image.naturalWidth,n.uv[1]*image.naturalHeight]);
     const screen=nodes.map(n=>n.screen);triangle(ctx,image,uv,screen,1,wrap);
     if(front&&nodes.every(n=>n.photo)){
      const edge=Math.min(...nodes.flatMap(n=>[n.photo[0],1-n.photo[0],n.photo[1],1-n.photo[1]]));
      const alpha=smooth(0,.15,edge);
      if(alpha>0)triangle(ctx,front,nodes.map(n=>[Math.max(0,Math.min(1,n.photo[0]))*front.naturalWidth,Math.max(0,Math.min(1,n.photo[1]))*front.naturalHeight]),screen,alpha);
     }
    }
   }
  }
 };
}

export {triangle as panoramaTriangle119};
