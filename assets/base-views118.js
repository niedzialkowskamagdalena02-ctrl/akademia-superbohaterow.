// Original supplied artwork, without conversion, cropping or colour changes.
// Coordinates use each file's intrinsic pixel space (not the viewport).
const view=(id,u,file,entry,nav,energy,mic,release,width=709)=>({
 id,u,src:'assets/hq/views118/'+file+'.png',width,height:1536,entry,nav,energy,mic,release
});
export const HALL_HEADING118=.62;
export const hallViews118=[
 view('pet',.046,'pet',[[119,962],[133,944],[507,898],[524,913],[520,996],[135,1052],[119,1036]],
  [20,28,217,84],[343,26,344,91],[547,1340,149,152],[601,145,82,41]),
 view('armory',.14,'armory',[[86,882],[119,842],[475,830],[523,862],[502,910],[116,938]],
  [20,34,214,84],[343,34,344,94],[552,1287,140,144],[600,149,82,42]),
 view('shop',.257,'shop',[[153,1004],[183,969],[519,967],[554,1001],[525,1049],[181,1052]],
  [19,48,224,79],[336,49,350,89],[550,1314,144,142],[603,159,78,42]),
 view('vault',.365,'vault',[[202,957],[224,923],[477,923],[506,955],[480,987],[227,989]],
  [20,50,211,80],[343,51,342,87],[549,1338,144,149],[604,165,76,40]),
 view('training',.50,'training',[[141,942],[566,942],[585,1015],[564,1037],[140,1037],[125,1019]],
  [20,19,215,85],[345,23,341,90],[554,1287,137,145],[604,137,75,38]),
 view('hall',HALL_HEADING118,'hall',null,
  [20,78,213,84],[344,81,338,90],[551,1288,139,144],[602,197,78,40]),
 view('arcade',.745,'arcade',[[153,754],[553,755],[574,776],[568,817],[548,837],[155,829],[143,806],[145,776]],
  [19,69,217,81],[345,72,339,81],[546,1314,146,140],[602,179,77,40]),
 view('hangar',.871,'hangar',[[82,822],[98,798],[405,798],[429,823],[425,854],[409,872],[98,872],[80,850]],
  [19,79,215,83],[345,80,341,93],[550,1316,145,147],[604,197,77,42],711),
 view('plants',.99,'plants',null,
  [26,38,213,81],[347,35,338,88],[544,1336,154,156],[601,149,80,41])
];
const distance=(a,b)=>Math.abs(Math.atan2(Math.sin(a-b),Math.cos(a-b)));
export function hallView118(yaw){
 return hallViews118.reduce((best,item)=>distance(yaw,(item.u-.5)*2*Math.PI)<distance(yaw,(best.u-.5)*2*Math.PI)?item:best);
}
export function fitArt118(width,height,view){
 const scale=Math.min(width/view.width,height/view.height);
 return {x:(width-view.width*scale)/2,y:(height-view.height*scale)/2,
  width:view.width*scale,height:view.height*scale,scale};
}
const position=(element,[x,y,w,h],view)=>{
 element.style.left=x/view.width*100+'%';element.style.top=y/view.height*100+'%';
 element.style.width=w/view.width*100+'%';element.style.height=h/view.height*100+'%';
};
const names={pet:'Kącik zwierzaka',armory:'Zbrojownia',shop:'Wejdź do sklepu',vault:'Skarbiec',training:'Sala Treningowa',arcade:'Centrum Rozrywki',hangar:'Hangar'};
export function hallMarkup118({crystals,charged,capacity,level},release){
 return `<div class="hq118-art" hidden>
  <img class="hq118-image" alt="" draggable="false">
  <button type="button" class="hq118-hit hq118-nav" data-action="hq:view:menu" aria-label="Wybór widoku"></button>
  <button type="button" class="hq118-hit hq118-entry" hidden></button>
  <button type="button" class="hq118-hit hq118-mic mic hq87-mic" data-action="mic" aria-label="Zadaj pytanie"></button>
  <div class="hq118-energy" role="meter" aria-label="Energia bohatera" aria-valuemin="0" aria-valuemax="${capacity}" aria-valuenow="${charged}" aria-valuetext="${charged} z ${capacity} kryształów, poziom ${level}; łącznie ${crystals}">
   <span class="hq118-level">poz. ${level}</span>
   ${Array.from({length:capacity},(_,i)=>`<i class="hq118-gem${i<charged?' is-charged':''}" aria-hidden="true"></i>`).join('')}
  </div><span class="hq118-release">V${release}</span>
 </div>`;
}
export function mountHall118(stage){
 const art=stage.querySelector('.hq118-art');
 if(!art)return null;
 const image=art.querySelector('.hq118-image'),nav=art.querySelector('.hq118-nav');
 const entry=art.querySelector('.hq118-entry'),mic=art.querySelector('.hq118-mic');
 const energy=art.querySelector('.hq118-energy'),release=art.querySelector('.hq118-release');
 const gems=[...energy.querySelectorAll('.hq118-gem')];
 const preloads=hallViews118.map(view=>{const img=new Image();img.src=view.src;return img;});
 let active=null,rect=null;
 function hide(){art.hidden=true;delete stage.dataset.artView;stage.parentElement.classList.remove('hq118-active');active=null;}
 function update(yaw,width,height){
  const selected=hallView118(yaw);
  if(selected!==active){
   active=selected;image.src=selected.src;
   image.alt=selected.id==='hall'?'Panoramiczny hol główny':selected.id==='plants'?'Zielona ściana w holu':names[selected.id];
   entry.hidden=!selected.entry;
   if(selected.entry){
    const xs=selected.entry.map(p=>p[0]),ys=selected.entry.map(p=>p[1]);
    const x=Math.min(...xs),y=Math.min(...ys),w=Math.max(...xs)-x,h=Math.max(...ys)-y;
    position(entry,[x,y,w,h],selected);
    entry.style.clipPath='polygon('+selected.entry.map(([px,py])=>`${(px-x)/w*100}% ${(py-y)/h*100}%`).join(',')+')';
    entry.dataset.walkEntry=selected.id;entry.setAttribute('aria-label',names[selected.id]);
   }else delete entry.dataset.walkEntry;
   position(nav,selected.nav,selected);position(mic,selected.mic,selected);
   position(energy,selected.energy,selected);position(release,selected.release,selected);
   // Dim only the original gem pixels; the supplied facets and frame stay intact.
   gems.forEach((gem,i)=>{gem.style.left=(4+i*11.6)+'%';});
  }
  rect=fitArt118(width,height,selected);
  gems.forEach((gem,i)=>{
   const [ex,ey,ew,eh]=selected.energy;
   const gx=ex+ew*(.04+i*.116),gy=ey+eh*.47;
   gem.style.backgroundImage=`url("${selected.src}")`;
   gem.style.backgroundSize=`${selected.width*rect.scale}px ${selected.height*rect.scale}px`;
   gem.style.backgroundPosition=`${-gx*rect.scale}px ${-gy*rect.scale}px`;
  });
  Object.assign(art.style,{left:rect.x+'px',top:rect.y+'px',width:rect.width+'px',height:rect.height+'px'});
  art.style.setProperty('--art118-font',rect.scale*22+'px');
  const wide=width>height;
  stage.classList.toggle('hq118-wide',wide);
  stage.style.setProperty('--art118-power-x',(wide?rect.x+rect.width+14:rect.x+rect.width*.80)+'px');
  stage.style.setProperty('--art118-power-y',(wide?rect.y+rect.height*.86:rect.y+selected.mic[1]*rect.scale-58)+'px');
  art.hidden=false;stage.dataset.artView=selected.id;stage.parentElement.classList.add('hq118-active');
  return selected;
 }
 return {update,hide,get current(){return active;},get rect(){return rect;},get ready(){return preloads.every(img=>img.complete);}};
}

// Powers remain usable over the supplied gloves, without stretching the artwork
// or painting a second pair of hands over them.
export function paintHallPower118(ctx,canvas,rect,web,power,now,reduced){
 if(!ctx)return;
 ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,canvas.width,canvas.height);
 if(!rect||!web&&!power)return;
 const density=canvas.width/canvas.clientWidth||1;
 ctx.save();ctx.scale(density,density);
 const x=rect.x+rect.width*((power?.side===-1||web?.side===-1) ? .25 : .75),y=rect.y+rect.height*.825;
 const tx=rect.x+rect.width*.5,ty=rect.y+rect.height*.46;
 const age=now-(power?.at??web.at),fade=reduced ? .65 : Math.sin(Math.min(1,age/(power?.kind==='punch'?440:640))*Math.PI);
 ctx.globalAlpha=Math.max(0,fade);ctx.lineCap='round';
 if(power?.kind==='punch'){
  ctx.strokeStyle='#b9ff6e';ctx.lineWidth=4;ctx.shadowColor='#9cff50';ctx.shadowBlur=20;
  ctx.beginPath();ctx.arc(x,y,18+age*.1,0,Math.PI*2);ctx.stroke();
 }else{
  ctx.strokeStyle=web?'#efffff':'#55ddff';ctx.shadowColor=ctx.strokeStyle;ctx.shadowBlur=22;ctx.lineWidth=web?2:9;
  ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(tx,ty);ctx.stroke();
  if(web){for(let i=0;i<8;i++){const a=i*Math.PI/4;ctx.beginPath();ctx.moveTo(tx,ty);ctx.lineTo(tx+Math.cos(a)*34,ty+Math.sin(a)*34);ctx.stroke();}}
  else{ctx.strokeStyle='#fff';ctx.lineWidth=3;ctx.stroke();}
 }
 ctx.restore();
}
