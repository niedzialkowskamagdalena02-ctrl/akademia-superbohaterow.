import {fistAnchors130,windAnchors130} from './hero-anchors130.js?v=130';

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
  candidates.push({x,y,src:layer.src});
 }
 return candidates.at(-1)??{x:box.x+box.w*(side<0?.3:.7),y:box.y+box.h*.55};
}
export function windRect130(key,image,point,box){
 const meta=windAnchors130[key]??{visibleWidth:1,tip:[.5,.5]};
 const w=box.w*.24/meta.visibleWidth,h=w*image.naturalHeight/image.naturalWidth;
 return {x:point.x-meta.tip[0]*w,y:point.y-meta.tip[1]*h,w,h,tipX:meta.tip[0],tipY:meta.tip[1]};
}
export function paintWind130(ctx,key,image,point,box,alpha){
 const {x,y,w,h}=windRect130(key,image,point,box);
 ctx.save();ctx.globalAlpha=alpha;ctx.drawImage(image,x,y,w,h);ctx.restore();
}
