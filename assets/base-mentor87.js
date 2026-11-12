export const MENTOR_GREETING_MS=1440;
const faces=[[0,3,2,1],[4,5,6,7],[0,4,7,3],[1,2,6,5],[0,1,5,4],[3,7,6,2]];
const lighting=[.44,1,.68,.81,.57,1.13];
const tint=(rgb,light)=>`rgb(${rgb.map(value=>Math.min(255,Math.round(value*light))).join(',')})`;

export function mentorMarkup87(style){
 const name=style==='fun'?'Spider-Man':'Iron Man';
 return `<canvas class="hq87-mentor-figure" width="225" height="316" data-mentor="${style==='fun'?'spider':'iron'}" aria-hidden="true"></canvas><b>${name}</b>`;
}

export function drawMentor87(canvas,turn,elapsed,ironArt=null){
 const ctx=canvas.getContext('2d');
 if(!ctx)return;
 const spider=canvas.dataset.mentor==='spider',w=canvas.width,h=canvas.height;
 const t=Math.max(0,Math.min(1,elapsed/MENTOR_GREETING_MS));
 const active=t>0&&t<1;
 const wave=t<.55?Math.sin(Math.min(t/.12,1)*Math.PI/2)*(1.82+.22*Math.sin(t*43)):1.84;
 const boost=t>.54?Math.sin((t-.54)/.46*Math.PI):0;
 const lift=active?boost*(spider?.86:.64):0;
 if(!spider&&ironArt){
  const frame=active?Math.round(t*16):turn<-.16?17:turn>.16?18:0;
  const cellWidth=ironArt.naturalWidth/5,cellHeight=ironArt.naturalHeight/4;
  ctx.clearRect(0,0,w,h);
  ctx.fillStyle='#0a152d70';ctx.beginPath();ctx.ellipse(w*.50,h*.925,36-lift*13,6,0,0,Math.PI*2);ctx.fill();
  if(lift>.045){
   for(const side of [-1,1]){
    const x=w*(.5+side*.12),y=h*(.92-.15*boost);
    const flame=ctx.createLinearGradient(x,y,x,y+36*boost);
    flame.addColorStop(0,'#e6ffff');flame.addColorStop(.3,'#63dfff');flame.addColorStop(1,'#2589ff00');
    ctx.fillStyle=flame;ctx.beginPath();ctx.moveTo(x-5,y);ctx.lineTo(x+5,y);ctx.lineTo(x,y+36*boost);ctx.fill();
   }
  }
  ctx.drawImage(ironArt,frame%5*cellWidth,Math.floor(frame/5)*cellHeight,cellWidth,cellHeight,0,0,w,h);
  return;
 }
 const cs=Math.cos(turn),sn=Math.sin(turn);
 const red=spider?[208,45,63]:[185,44,57],accent=spider?[32,93,158]:[248,191,72],dark=[29,44,64],cyan=[178,248,255];
 const polygons=[];
 function project([x,y,z]){
  const depth=z*cs-x*sn,rx=x*cs+z*sn;
  const zoom=53/(1-depth*.12);
  return [w/2+rx*zoom,h*.88-(y+lift-depth*.13)*zoom,depth];
 }
 function polygon(points,color){
  const screen=points.map(project);
  polygons.push({screen,color,z:screen.reduce((sum,p)=>sum+p[2],0)/screen.length});
 }
 function box(x,y,z,a,b,c,color,transform=p=>p){
  const points=[[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]]
   .map(([i,j,k])=>transform([x+i*a/2,y+j*b/2,z+k*c/2]));
  faces.forEach((f,i)=>polygon(f.map(index=>points[index]),tint(color,lighting[i])));
 }
 function helmet(){
  const rings=[[2.51,.25],[2.64,.39],[2.99,.40],[3.11,.30]];
  const vertices=rings.map(([y,r])=>Array.from({length:8},(_,i)=>{
   const a=(i+.5)*Math.PI/4;
   return [r*Math.sin(a),y,r*Math.cos(a)*.88];
  }));
  for(let j=0;j<vertices.length-1;j++){
   for(let i=0;i<8;i++){
    const n=(i+1)%8,front=i===7;
    const color=front&&!spider?[251,192,66]:red;
    polygon([vertices[j][i],vertices[j][n],vertices[j+1][n],vertices[j+1][i]],tint(color,.68+.35*(.5+.5*Math.cos(i*Math.PI/4))));
   }
  }
  polygon(vertices.at(-1),tint(red,1.1));
  for(const side of [-1,1]){
   const eye=spider?[244,253,255]:cyan;
   polygon([[side*.04,2.84,.341],[side*.25,2.91,.335],[side*.20,2.78,.345],[side*.06,2.79,.348]],tint(eye,1));
  }
  if(spider){
   box(0,2.93,.341,.018,.19,.012,dark);
   box(0,2.71,.342,.29,.012,.009,dark);
  }else box(0,2.69,.343,.17,.023,.014,[111,49,43]);
 }
 const arm=p=>{
  if(!active)return p;
  const [x,y,z]=p,dx=x-.48,dy=y-2.24,a=wave;
  return [.48+dx*Math.cos(a)-dy*Math.sin(a),2.24+dx*Math.sin(a)+dy*Math.cos(a),z+.12*Math.sin(a)];
 };
 ctx.clearRect(0,0,w,h);
 ctx.fillStyle='#0b152bd9';ctx.beginPath();ctx.ellipse(w/2,h*.90,39-lift*11,7,0,0,2*Math.PI);ctx.fill();
 for(const side of [-1,1]){
  box(side*.21,.56,0,.35,.94,.39,spider?accent:red);
  box(side*.21,.13,.08,.36,.28,.51,red);
 }
 box(0,1.47,0,.82,.79,.54,red);
 box(0,1.14,.03,.77,.18,.51,accent);
 box(0,1.93,0,.99,.64,.63,red);
 for(const side of [-1,1]){
  const rotate=side===1?arm:p=>p;
  box(side*.54,2.18,0,.34,.34,.52,accent,rotate);
  box(side*.63,1.90,0,.28,.45,.38,red,rotate);
  box(side*.68,1.56,.08,.25,.37,.32,spider?accent:red,rotate);
  box(side*.69,1.32,.12,.29,.27,.35,red,rotate);
  if(!spider)box(side*.69,1.36,.307,.13,.10,.03,cyan,rotate);
 }
 box(0,1.94,.336,spider?.12:.24,spider?.24:.20,.045,spider?dark:cyan);
 box(0,2.32,0,.27,.17,.29,accent);helmet();
 const hand=project(arm([.69,1.34,.28]));
 if(active&&t>.54&&spider){
  const p=[w*.83,0];
  ctx.strokeStyle='#e6faff';ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(hand[0],hand[1]);ctx.lineTo(p[0],p[1]);ctx.stroke();
  ctx.beginPath();ctx.moveTo(hand[0]+3,hand[1]);ctx.lineTo(p[0]-6,p[1]);ctx.stroke();
 }
 if(active&&lift>.04&&!spider){
  for(const side of [-1,1]){
   const [x,y]=project([side*.21,.02,.1]);
   const flame=ctx.createLinearGradient(x,y,x,y+27);flame.addColorStop(0,'#eeffff');flame.addColorStop(.35,'#52dfff');flame.addColorStop(1,'#3284ff00');
   ctx.fillStyle=flame;ctx.beginPath();ctx.moveTo(x-7,y);ctx.lineTo(x+7,y);ctx.lineTo(x,y+23+10*lift);ctx.fill();
  }
 }
 polygons.sort((a,b)=>a.z-b.z);
 for(const {screen,color} of polygons){
  ctx.fillStyle=color;ctx.strokeStyle=color;ctx.lineWidth=.7;ctx.beginPath();ctx.moveTo(screen[0][0],screen[0][1]);
  for(let i=1;i<screen.length;i++)ctx.lineTo(screen[i][0],screen[i][1]);
  ctx.closePath();ctx.fill();ctx.stroke();
 }
}
