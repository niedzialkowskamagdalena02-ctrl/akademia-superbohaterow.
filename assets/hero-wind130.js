import {fistAnchors130,windAnchors130,effectAnchors131} from './hero-anchors130.js?v=131';

// The same intact-image fitting as drawLayer in the original hands player.
export function fistPoint130(frame,side,box){
 const layers=typeof frame==='string'?[{src:frame}]:frame.layers,candidates=[];
 for(const layer of layers){
  const meta=fistAnchors130[layer.src];if(!meta)continue;
  const rect=layer.rect??[0,0,1,1],key=rect[2]<.8?'full':side<0?'left':'right',point=meta[key];if(!point)continue;
  const scale=Math.min(box.w*rect[2]/meta.size[0],box.h*rect[3]/meta.size[1]);
  const w=meta.size[0]*scale,h=meta.size[1]*scale;
  const x=box.x+rect[0]*box.w+(box.w*rect[2]-w)/2+point[0]*w,y=box.y+rect[1]*box.h+box.h*rect[3]-h+point[1]*h;
  if(layer.clip){const [cx,cy,cw,ch]=layer.clip;if(x<box.x+cx*box.w||x>box.x+(cx+cw)*box.w||y<box.y+cy*box.h||y>box.y+(cy+ch)*box.h)continue;}
  candidates.push({x,y,width:(point[2]||.12)*w,height:(point[3]||.12)*h,src:layer.src});
 }
 return candidates.at(-1)??{x:box.x+box.w*(side<0?.3:.7),y:box.y+box.h*.55};
}
export function windRect130(key,image,point,box){
 const meta=windAnchors130[key]??{visibleWidth:1,tip:[.5,.5]};
 const visible=Math.max(box.w*.07,Math.min(box.w*.18,(point.width||box.w*.10)*1.45));
 const w=visible/meta.visibleWidth,h=w*image.naturalHeight/image.naturalWidth;
 return {x:point.x-meta.tip[0]*w,y:point.y-meta.tip[1]*h,w,h,tipX:meta.tip[0],tipY:meta.tip[1]};
}
export function paintWind130(ctx,key,image,point,box,alpha,rotation=0){
 const {w,h,tipX,tipY}=windRect130(key,image,point,box);
 ctx.save();ctx.globalAlpha=alpha;ctx.translate(point.x,point.y);ctx.rotate(rotation);ctx.drawImage(image,-tipX*w,-tipY*h,w,h);ctx.restore();
}
export function windAngle131(previous,current,side,last=0){
 if(!previous||Math.hypot(current.x-previous.x,current.y-previous.y)<2)return last;
 let a=Math.atan2(current.y-previous.y,current.x-previous.x)-(side<0?0:Math.PI);
 while(a>Math.PI)a-=Math.PI*2;while(a<-Math.PI)a+=Math.PI*2;
 return Math.max(-1.1,Math.min(1.1,a));
}
export function paintContact131(ctx,key,image,point,box,alpha){
 const meta=effectAnchors131[key]??{center:[.5,.5],extent:1};
 const visible=Math.max(box.w*.09,Math.min(box.w*.22,(point.width||box.w*.1)*1.8));
 const scale=visible/(Math.max(image.naturalWidth,image.naturalHeight)*meta.extent),w=image.naturalWidth*scale,h=image.naturalHeight*scale;
 ctx.save();ctx.globalAlpha=alpha;ctx.drawImage(image,point.x-meta.center[0]*w,point.y-meta.center[1]*h,w,h);ctx.restore();
}
