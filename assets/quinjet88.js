const paintColors={blue:['#f6fcff','#497a9f','#f3bd59'],mint:['#dffdf4','#357c79','#b8f5b7'],gold:['#fff2c9','#9d693a','#ffcd57']};
const {sin,cos}=Math;

function model(paint){
 const [body,bottom,stripe]=paintColors[paint]??paintColors.blue;
 const parts=[];
 const face=(color,...vertices)=>{
  const [a,b,c]=vertices;
  const u=b.map((value,i)=>value-a[i]),v=c.map((value,i)=>value-a[i]);
  const nx=u[1]*v[2]-u[2]*v[1],ny=u[2]*v[0]-u[0]*v[2],nz=u[0]*v[1]-u[1]*v[0];
  const lighting=Math.abs((nx*.35+ny*.91-nz*.21)/(Math.hypot(nx,ny,nz)||1));
  const rgb=color.slice(1).match(/../g).map(value=>parseInt(value,16));
  const shade=(gain,blue=0)=>`rgb(${rgb.map((channel,i)=>Math.round(Math.min(255,channel*gain+(i===2?blue:0)))).join(' ')})`;
  parts.push({vertices,light:shade(.86+.16*lighting,9),dark:shade(.56+.27*lighting,15)});
 };
 const hull=[
  [-1.22,.31,.33,.25],[-.66,.48,.5,.31],[.33,.46,.54,.32],
  [.91,.34,.37,.27],[1.37,.25,.21,.19],[1.58,.08,.08,.14]
 ];
 for(let i=0;i<hull.length-1;i++){
  const slice=([z,w,h,y])=>[[0,y+h,z],[w,y+h*.38,z],[w*.88,y-h*.35,z],[0,y-h*.51,z],
   [-w*.88,y-h*.35,z],[-w,y+h*.38,z]];
  const a=slice(hull[i]),b=slice(hull[i+1]);
  for(let k=0;k<a.length;k++){
   const next=(k+1)%a.length;
   face([body,stripe,bottom,bottom,stripe,body][k],a[k],a[next],b[next],b[k]);
  }
 }
 face('#547090',[-.25,.29,-1.23],[.25,.29,-1.23],[.23,.53,-1.23],[-.23,.53,-1.23]);
 for(const side of [-1,1]){
  const pt=(x,y,z)=>[x*side,y,z];
  face('#286898',pt(0,.85,.19),pt(.32,.65,.24),pt(.24,.58,.92),pt(0,.68,1.08));
  face('#70bde5',pt(0,.85,.19),pt(.25,.68,.21),pt(.13,.71,.65),pt(0,.78,.61));
  face('#234664',pt(.035,.841,.19),pt(.071,.84,.19),pt(.07,.691,1.045),pt(.025,.68,1.08));
  face(body,pt(.31,.34,.36),pt(1.63,.39,-.64),pt(1.79,.32,-.99),pt(.42,.27,-.85));
  face(bottom,pt(.31,.29,.33),pt(1.79,.32,-.99),pt(.42,.23,-.85));
  face(stripe,pt(.41,.35,.18),pt(1.56,.394,-.67),pt(1.66,.377,-.80),pt(.43,.34,.035));
  face(body,pt(1.49,.35,-.64),pt(1.78,.59,-.87),pt(1.81,.32,-.99));
  face(body,pt(.26,.37,-.79),pt(.73,.52,-1.21),pt(.79,.40,-1.46),pt(.24,.32,-1.23));
  face(stripe,pt(.66,.32,-.55),pt(.9,.32,-.61),pt(.91,.3,-1.04),pt(.64,.3,-1.04));
  face('#243e58',pt(.59,.31,-1.045),pt(.94,.32,-1.04),pt(.91,.17,-1.04),pt(.63,.17,-1.04));
  face('#8ff9ff',pt(.66,.288,-1.05),pt(.87,.29,-1.05),pt(.85,.205,-1.05),pt(.68,.205,-1.05));
  const ring=(z,r)=>Array.from({length:9},(_,i)=>pt(.755+cos(i*2*Math.PI/9)*r,.235+sin(i*2*Math.PI/9)*r,z));
  const front=ring(-.40,.16),outer=ring(-1.04,.19),inner=ring(-1.063,.116),nozzle=ring(-1.078,.085);
  for(let k=0;k<9;k++){
   const n=(k+1)%9;
   face(k<4?body:bottom,front[k],front[n],outer[n],outer[k]);
   face('#456d91',outer[k],outer[n],inner[n],inner[k]);
   face('#27516e',inner[k],inner[n],nozzle[n],nozzle[k]);
  }
  face('#8ef7ff',...nozzle);
 }
 face(body,[0,.51,-.64],[0,1.01,-1.02],[0,1.02,-1.29],[0,.44,-1.31]);
 face(stripe,[.02,.76,-.88],[.02,1.01,-1.02],[.02,1.02,-1.29],[.02,.82,-1.29]);
 return parts;
}

const meshes=Object.fromEntries(Object.keys(paintColors).map(paint=>[paint,model(paint)]));

export function drawQuinjet88(ctx,project,{x=0,y=0,z=0,yaw=0,bank=0,scale=1,paint='blue'}={}){
 const cs=Math.cos(yaw),sn=Math.sin(yaw),cb=Math.cos(bank),sb=Math.sin(bank);
 const faces=[];
 let left=Infinity,right=-Infinity,top=Infinity,bottom=-Infinity;
 for(const {vertices,light,dark} of meshes[paint]??meshes.blue){
  const p=vertices.map(([a,b,c])=>{
   const rx=a*cb-b*sb,ry=a*sb+b*cb;
   return project([x+scale*(rx*cs+c*sn),y+scale*ry,z+scale*(c*cs-rx*sn)]);
  });
  if(p.some(point=>!point))continue;
  for(const [px,py] of p){left=Math.min(left,px);right=Math.max(right,px);top=Math.min(top,py);bottom=Math.max(bottom,py);}
  faces.push({p,light,dark,depth:p.reduce((sum,point)=>sum+point[2],0)/p.length});
 }
 for(const {p,light,dark} of faces.sort((a,b)=>b.depth-a.depth)){
  const heights=p.map(point=>point[1]),top=Math.min(...heights),bottom=Math.max(...heights);
  let color=light;
  if(bottom-top>7){
   color=ctx.createLinearGradient(0,top,0,bottom);color.addColorStop(0,light);color.addColorStop(1,dark);
  }
  ctx.fillStyle=color;ctx.strokeStyle=color;ctx.lineWidth=.5;ctx.beginPath();
  ctx.moveTo(p[0][0],p[0][1]);
  for(const [x,y] of p.slice(1))ctx.lineTo(x,y);
  ctx.closePath();ctx.fill();ctx.stroke();
 }
 return faces.length?{left,right,top,bottom}:null;
}
