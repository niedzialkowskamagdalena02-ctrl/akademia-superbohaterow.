// The hall is one continuous environment. These original entrance graphics
// are projected into the same 3D camera as the room, not fixed to the screen.
export const hallPanels119={
 training:{v:.622,span:.12,rect:[125,938,462,105]},
 armory:{v:.596,span:.097,rect:[86,830,438,108]},
 arcade:{v:.610,span:.10,rect:[143,752,432,86]},
 hangar:{v:.602,span:.10,rect:[76,790,358,89],sw:711},
 pet:{v:.678,span:.074,rect:[115,898,416,159]},
 shop:{v:.610,span:.098,rect:[151,967,404,89]},
 vault:{v:.570,span:.093,rect:[200,917,310,78]}
};
export function hallPoint119(point){
 const panel=hallPanels119[point.room];
 return panel?{...point,v:panel.v,panel119:panel}:point;
}
export function hallDoor119(room,label){
 const panel=hallPanels119[room];
 if(!panel)return '';
 const [x,y,w,h]=panel.rect;
 return `<span class="hq119-plate-art" aria-hidden="true"><img src="assets/hq/views118/${room}.png" alt="" draggable="false" style="width:${(panel.sw??709)/w*100}%;left:${-x/w*100}%;top:${-y/h*100}%"></span><span class="academy102-sr">${label}</span>`;
}
export function hallCorners119(point,anchor){
 const {span,rect}=point.panel119;
 const theta=(point.u-.5)*2*Math.PI;
 const half=Math.hypot(anchor[0],anchor[2])*Math.tan(span*Math.PI);
 const high=half*rect[3]/rect[2];
 const tangent=[Math.cos(theta)*half,0,-Math.sin(theta)*half];
 return [[-1,1],[1,1],[1,-1],[-1,-1]].map(([side,up])=>
  [anchor[0]+side*tangent[0],anchor[1]+up*high,anchor[2]+side*tangent[2]]);
}
export function quadMatrix119(points,width,height){
 const [[x0,y0],[x1,y1],[x2,y2],[x3,y3]]=points;
 const dx1=x1-x2,dx2=x3-x2,dx3=x0-x1+x2-x3;
 const dy1=y1-y2,dy2=y3-y2,dy3=y0-y1+y2-y3;
 const divisor=dx1*dy2-dx2*dy1;
 if(Math.abs(divisor)<1e-8)return null;
 const g=(dx3*dy2-dx2*dy3)/divisor,h=(dx1*dy3-dx3*dy1)/divisor;
 return [(x1-x0+g*x1)/width,(y1-y0+g*y1)/width,0,g/width,
  (x3-x0+h*x3)/height,(y3-y0+h*y3)/height,0,h/height,
  0,0,1,0,x0,y0,0,1];
}
export function placeHallPanel119(marker,point,anchor,project,width,height){
 const corners=hallCorners119(point,anchor).map(project);
 if(corners.some(p=>!p)){marker.hidden=true;return;}
 const xs=corners.map(p=>p[0]),ys=corners.map(p=>p[1]);
 if(Math.max(...xs)<0||Math.min(...xs)>width||Math.max(...ys)<0||Math.min(...ys)>height){marker.hidden=true;return;}
 const [, ,w,h]=point.panel119.rect,matrix=quadMatrix119(corners,w,h);
 marker.hidden=!matrix;
 if(matrix){marker.style.width=w+'px';marker.style.height=h+'px';marker.style.transform='matrix3d('+matrix.join(',')+')';}
}
