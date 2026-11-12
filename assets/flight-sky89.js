const scenes=[
 {name:'Słoneczny dzień',sky:['#1457a8','#469edc','#b9edff'],glow:['#fff1bd88','#fff2bb00'],
  ridges:['#96b9d5','#6f9cbd','#487d9e'],clouds:['#fafffff0','#94b6d9b0'],rails:'#bdf4ffbe',light:'#fff4d3'},
 {name:'Gwiaździsty wieczór',sky:['#090f36','#243268','#526195'],glow:['#bad8ff42','#8daaff00'],
  ridges:['#424e7c','#303d64','#1c2c50'],clouds:['#9caed3ab','#67799e54'],rails:'#9fdcffbf',light:'#e6f4ff',night:true},
 {name:'Różowy zachód',sky:['#4e316f','#c05c96','#ffc395'],glow:['#ffdfb4ce','#ff916900'],
  ridges:['#bd759a','#855b8a','#583e70'],clouds:['#ffe4d5e8','#d589babb'],rails:'#ffe3d4cb',light:'#fff0bd',sunset:true}
];

export function flightSky89(round){
 return scenes[round]??scenes[0];
}

export function drawFlightSky89(ctx,scene,width,height){
 const sky=ctx.createLinearGradient(0,0,0,height);
 sky.addColorStop(0,scene.sky[0]);sky.addColorStop(.48,scene.sky[1]);sky.addColorStop(1,scene.sky[2]);
 ctx.fillStyle=sky;ctx.fillRect(0,0,width,height);
 const x=width*.81,y=height*(scene.sunset?.47:.19),r=Math.min(width,height)*(scene.sunset?.118:.068);
 const glow=ctx.createRadialGradient(x,y,0,x,y,height*.47);
 glow.addColorStop(0,scene.glow[0]);glow.addColorStop(1,scene.glow[1]);
 ctx.fillStyle=glow;ctx.fillRect(0,0,width,height);
 if(scene.night){
  ctx.fillStyle='#e0efff';
  for(let i=0;i<39;i++){
   const sx=(i*137+53)%997/997*width,sy=(i*97+17)%499/499*height*.59;
   ctx.globalAlpha=.35+(i%5)*.15;
   ctx.beginPath();ctx.arc(sx,sy,i%8===0?1.55:.75,0,Math.PI*2);ctx.fill();
  }
  ctx.globalAlpha=1;
 }
 ctx.fillStyle=scene.light;ctx.beginPath();
 if(scene.night){
  ctx.arc(x,y,r,.82,5.3);ctx.quadraticCurveTo(x-r*.38,y+r*.39,x+Math.cos(.82)*r,y+Math.sin(.82)*r);
 }else ctx.arc(x,y,r,0,Math.PI*2);
 ctx.fill();
 for(let ridge=0;ridge<3;ridge++){
  const floor=height*(.58+ridge*.098);
  ctx.fillStyle=scene.ridges[ridge];ctx.beginPath();ctx.moveTo(0,height);
  for(let step=0;step<=width+8;step+=8){
   const phase=step/width*15+ridge*1.77;
   ctx.lineTo(step,floor-(Math.sin(phase*.71)+Math.sin(phase*1.44)*.35)*height*(scene.sunset?.053:.081));
  }
  ctx.lineTo(width,height);ctx.closePath();ctx.fill();
 }
 if(scene.night){
  const base=height*.91;
  for(let i=0;i<21;i++){
   const dx=width*i/20,tall=height*(.048+(i*7%12)*.007),w=width*.039;
   ctx.fillStyle='#192547';ctx.fillRect(dx,base-tall,w,tall);
   ctx.fillStyle=i%3===0?'#ffdb9c':'#8ddcff';
   for(let j=0;j<3;j++)if((i+j)%4!==0)ctx.fillRect(dx+w*.28,base-tall+(j+1)*height*.015,Math.max(1,w*.21),1);
  }
 }
}
