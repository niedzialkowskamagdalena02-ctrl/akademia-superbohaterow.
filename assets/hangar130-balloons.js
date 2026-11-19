import {tasks130,choices130,clamp130,balloonHit130,cloudHit130} from './hangar130-data.js?v=130';
import {img130,btn130} from './hangar130.js?v=130';
import {taskBar130,status130,bindRead130,pointerPosition130} from './hangar130-flight.js?v=130';

export function mountBalloons130(c){
 const tasks=tasks130('airballs',c.mode),saved=c.progress.read()['airballs:'+c.mode];
 let round=saved?.complete?0:clamp130(saved?.round||0,0,tasks.length-1),phase='play',y=.53,aim=.53,held=0,drag=null,time=0,active=false,bullet=null,counter=null,cloud,balloons=[],fall=0,lightning=0,hitTimer=0,transition=false;
 const get=s=>c.root.querySelector(s), planeX=.16, planeWidth=.21;
 function render(){
  phase='play';active=false;bullet=null;counter=null;hitTimer=0;lightning=0;fall=0;time=0;held=0;transition=false;aim=y=.53;
  const values=choices130(tasks[round].answer,3);
  balloons=values.map((value,i)=>({value,x:.78+i*.09,y:.2+i*.28,w:.13,h:.25,alive:true,shake:0}));
  cloud={x:.6,y:.37};
  c.view(taskBar130(c,tasks[round],round,tasks.length)+`<div class="h130-balloon-board" data-h130-board tabindex="0" aria-label="Steruj samolotem w górę lub w dół i strzelaj do balonów">
   ${img130('balloons/samolot.png','h130-side-plane')}
   ${balloons.map((b,i)=>`<div class="h130-balloon" data-balloon="${i}">${img130('balloons/'+(i%2?'balon_pomaranczowy':'balon_rozowy')+'.png')}<strong>${b.value}</strong></div>`).join('')}
   ${img130('balloons/chmura.png','h130-storm')}${img130('balloons/pocisk.png','h130-projectile h130-outgoing')}${img130('balloons/pocisk.png','h130-projectile h130-countershot')}
   ${img130('balloons/piorun.png','h130-lightning')}${img130('balloons/pekniecie_balonu.png','h130-burst')}${img130('balloons/blysk_trafienia.png','h130-contact')}
  </div><div class="h130-controls">${btn130('up','↑','aria-label="Leć w górę"')}${btn130('fire','Strzel','class="h130-primary" aria-label="Strzel w balon"')}${btn130('down','↓','aria-label="Leć w dół"')}</div>${status130()}<div data-retry></div>`);
  c.status('Ustaw wysokość i strzel w balon z właściwą liczbą. Omijaj chmurę.');bindRead130(c,()=>tasks[round].prompt);c.speak(tasks[round].prompt);
  const board=get('[data-h130-board]'),plane=get('.h130-side-plane'),storm=get('.h130-storm'),out=get('.h130-outgoing'),back=get('.h130-countershot'),bolt=get('.h130-lightning'),burst=get('.h130-burst'),contact=get('.h130-contact');
  const nodes=balloons.map((_,i)=>get('[data-balloon="'+i+'"]'));
  function position(node,x,y){node.style.left=(x*100)+'%';node.style.top=(y*100)+'%';}
  function flash(x,y,bursting=false){position(contact,x,y);contact.style.opacity='1';if(bursting){position(burst,x,y);burst.style.opacity='1';}hitTimer=.38;}
  function lose(kind){
   if(phase!=='play')return;phase='falling';held=0;drag=null;bullet=null;counter=null;fall=0;
   if(kind==='storm'){
    lightning=.45;position(bolt,cloud.x,cloud.y);const r=board.getBoundingClientRect(),dx=(planeX-cloud.x)*r.width,dy=(y-cloud.y)*r.height;
    bolt.style.height=Math.hypot(dx,dy)+'px';bolt.style.transform=`translate(-50%,0) rotate(${-Math.atan2(dx,dy)*180/Math.PI}deg)`;
   }
   flash(planeX,y);c.status(kind==='storm'?'Uderzenie pioruna! Samolot opada.':'Balon odpowiedział strzałem. Samolot opada.');
   c.root.querySelectorAll('.h130-controls button').forEach(b=>b.disabled=true);
  }
  function fire(){if(phase!=='play'||bullet||counter||transition)return;active=true;bullet={x:planeX+planeWidth*.46,y};c.tap();}
  function steer(direction){if(phase!=='play'||counter||transition)return;active=true;aim=clamp130(aim+direction*.12,.12,.85);}
  c.on(c.root,'click',e=>{const b=e.target.closest('[data-h130]');if(!b||b.disabled)return;const a=b.dataset.h130;if(a==='fire')fire();if(a==='up'&&e.detail===0)steer(-1);if(a==='down'&&e.detail===0)steer(1);if(a==='retry')render();});
  c.on(c.root,'keydown',e=>{if(['ArrowUp','ArrowDown',' '].includes(e.key)&&!e.target.closest('button')){e.preventDefault();if(e.key===' '){if(!e.repeat)fire();}else{held=e.key==='ArrowUp'?-1:1;active=true;}}});
  c.on(c.root.ownerDocument,'keyup',e=>{if(['ArrowUp','ArrowDown'].includes(e.key))held=0;});
  c.on(c.root,'pointerdown',e=>{
   if(e.button!==0||phase!=='play'||counter||transition)return;
   const b=e.target.closest('[data-h130="up"],[data-h130="down"]');
   if(b){e.preventDefault();held=b.dataset.h130==='up'?-1:1;active=true;return;}
   if(!e.target.closest('[data-h130-board]'))return;e.preventDefault();drag=e.pointerId;board.setPointerCapture?.(e.pointerId);aim=clamp130(pointerPosition130(e,board).y,.12,.85);active=true;
  });
  c.on(board,'pointermove',e=>{if(drag===e.pointerId&&phase==='play'&&!counter&&!transition){aim=clamp130(pointerPosition130(e,board).y,.12,.85);active=true;}});
  for(const type of ['pointerup','pointercancel'])c.on(c.root.ownerDocument,type,()=>{held=0;drag=null;});
  c.on(c.root.ownerDocument.defaultView,'blur',()=>{held=0;drag=null;});
  c.loop(dt=>{
   if(active)time+=dt;
   if(phase==='play'){
    if(held&&!counter&&!transition)aim=clamp130(aim+held*dt*.5,.12,.85);
    if(!counter&&!transition)y+=(aim-y)*Math.min(1,dt*14);
    balloons.forEach((b,i)=>{
     if(!active)return;
     b.x=.75+Math.sin(time*.55+i*1.2)*.13;
     b.y=.19+i*.28+Math.sin(time*1.3+i)*.032;
     b.shake=Math.max(0,b.shake-dt);
    });
    cloud.x=.49+Math.sin(time*.48+1)*.29;cloud.y=.46+Math.sin(time*.72)*.25;
    if(active&&!counter&&!transition&&[[-.035,0],[.08,0],[0,-.025]].some(([dx,dy])=>cloudHit130(planeX+dx,y+dy,cloud)))lose('storm');
    if(bullet){
     const previous=bullet.x;bullet.x+=dt*.84;
     // Swept path checks prevent a fast bullet tunnelling through a narrow balloon.
     const hit=balloons.findIndex(b=>b.alive&&Array.from({length:5},(_,i)=>previous+(bullet.x-previous)*i/4).some(x=>balloonHit130(x,bullet.y,b)));
     if(hit>=0){
      const b=balloons[hit];bullet=null;
      if(b.value===tasks[round].answer){
       b.alive=false;transition=true;held=0;flash(b.x,b.y-.035,true);c.tone(4);c.status('Trafienie! '+tasks[round].equation);c.progress.round('airballs',c.mode,round+1);
       c.later(()=>{round++;if(round===tasks.length)c.complete('Slalom ukończony!');else render();},c.reduced?400:1000);
      }else{
       b.shake=.6;transition=true;held=0;c.status('To inna liczba — balon odpowiada strzałem!');
       const bx=b.x,by=b.y-.035;c.later(()=>{counter={x:bx,y:by};transition=false;},c.reduced?150:550);
      }
     }else if(bullet.x>1.08)bullet=null;
    }
    if(counter){
     const dx=planeX-counter.x,dy=y-counter.y,distance=Math.hypot(dx,dy),step=dt*.7;
     if(distance<=step+.04)lose('counter');else{counter.x+=dx/distance*step;counter.y+=dy/distance*step;}
    }
   }else if(phase==='falling'){
    fall+=dt;y+=dt*(.3+fall*.4);
    if(y>1.25){phase='failed';c.status('Spróbuj jeszcze raz. Zachowujesz zaliczone rundy.');get('[data-retry]').innerHTML=btn130('retry','Spróbuj ponownie','class="h130-primary"');}
   }
   position(plane,planeX,y);plane.style.transform=`translate(-50%,-50%) rotate(${phase==='falling'||phase==='failed'?65:held*5}deg)`;
   position(storm,cloud.x,cloud.y);position(out,bullet?.x||0,bullet?.y||0);out.style.opacity=bullet?'1':'0';
   position(back,counter?.x||0,counter?.y||0);back.style.opacity=counter?'1':'0';
   balloons.forEach((b,i)=>{position(nodes[i],b.x,b.y);nodes[i].style.opacity=b.alive?'1':'0';nodes[i].style.transform=`translate(-50%,-50%) rotate(${b.shake?Math.sin(time*48)*8:0}deg)`;});
   hitTimer=Math.max(0,hitTimer-dt);if(!hitTimer){contact.style.opacity='0';burst.style.opacity='0';}
   lightning=Math.max(0,lightning-dt);bolt.style.opacity=lightning?'1':'0';
  });
 }
 if(!saved?.complete&&saved?.round>=tasks.length)c.complete('Slalom ukończony!');else render();
 return {snapshot:()=>({round,phase,y,cloud,balloons,bullet,counter})};
}
