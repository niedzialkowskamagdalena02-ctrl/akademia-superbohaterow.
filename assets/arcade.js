let timer=null,cleanup=()=>{};
export function stopArcade(){if(timer!==null)clearInterval(timer);timer=null;cleanup();cleanup=()=>{}}
export function mountArcade(kind,root){stopArcade();if(!root)return;const W=10,H=16,cell=24;root.innerHTML=`<p class="arcade-status" id="arcade-status">Wynik: 0</p><canvas class="arcade-screen" id="arcade-canvas" width="${W*cell}" height="${H*cell}" style="aspect-ratio:${W}/${H};max-width:260px" aria-label="Plansza gry"></canvas><div class="arcade-dpad" role="group" aria-label="Sterowanie kierunkami"><button class="dpad-up" data-dir="up" aria-label="W górę lub obrót">▲</button><button class="dpad-left" data-dir="left" aria-label="W lewo">◀</button><span class="dpad-center" aria-hidden="true">✦</span><button class="dpad-right" data-dir="right" aria-label="W prawo">▶</button><button class="dpad-down" data-dir="down" aria-label="W dół">▼</button></div><div class="arcade-controls"><button id="arcade-restart">↻ Nowa gra</button><button id="arcade-pause">⏸ Pauza</button></div><p class="muted">Sterowanie przyciskami na ekranie lub strzałkami klawiatury.</p>`;
const canvas=root.querySelector('canvas'),ctx=canvas.getContext('2d'),status=root.querySelector('#arcade-status'),pauseButton=root.querySelector('#arcade-pause');let score=0,over=false,paused=false;
const paint=(x,y,color)=>{ctx.fillStyle=color;ctx.fillRect(x*cell+1,y*cell+1,cell-2,cell-2)};
const bg=()=>{ctx.fillStyle='#0a1731';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.strokeStyle='#213454';for(let x=0;x<=W;x++){ctx.beginPath();ctx.moveTo(x*cell,0);ctx.lineTo(x*cell,H*cell);ctx.stroke()}for(let y=0;y<=H;y++){ctx.beginPath();ctx.moveTo(0,y*cell);ctx.lineTo(W*cell,y*cell);ctx.stroke()}};
let move=()=>{},reset=()=>{},updatePause=()=>{};
if(kind==='snake'){
let snake,dir,next,food,bonus,obstacles,level,ticks,stars;
const rand=n=>Math.floor(Math.random()*n);
const sameCell=(a,b)=>a?.x===b.x&&a?.y===b.y;
const freeCell=()=>{const free=[];for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){const p={x,y};if(!snake.some(s=>sameCell(s,p))&&!obstacles.some(s=>sameCell(s,p))&&!sameCell(food,p)&&!sameCell(bonus,p))free.push(p)}return free[rand(free.length)]||null};
const rounded=(x,y,w,h,r)=>{ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill()};
const gem=(p,color)=>{if(!p)return;const x=p.x*cell+cell/2,y=p.y*cell+cell/2;ctx.save();ctx.shadowColor=color;ctx.shadowBlur=16;ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(x,y-10);ctx.lineTo(x+9,y);ctx.lineTo(x,y+10);ctx.lineTo(x-9,y);ctx.closePath();ctx.fill();ctx.restore()};
const draw=()=>{const grd=ctx.createLinearGradient(0,0,canvas.width,canvas.height);grd.addColorStop(0,'#071b39');grd.addColorStop(1,'#32145b');ctx.fillStyle=grd;ctx.fillRect(0,0,canvas.width,canvas.height);for(let i=0;i<35;i++){const x=(i*71+19)%canvas.width,y=(i*97+43)%canvas.height;ctx.fillStyle='rgba(255,255,255,.32)';ctx.fillRect(x,y,2,2)}ctx.strokeStyle='rgba(117,183,255,.12)';for(let x=0;x<W;x++)for(let y=0;y<H;y++)ctx.strokeRect(x*cell,y*cell,cell,cell);obstacles.forEach(p=>{ctx.fillStyle='#7954a9';rounded(p.x*cell+2,p.y*cell+2,cell-4,cell-4,5);ctx.fillStyle='#bfa3ff';ctx.fillRect(p.x*cell+6,p.y*cell+6,7,3)});gem(food,'#ffcf40');gem(bonus,'#ff6de3');snake.forEach((p,i)=>{const x=p.x*cell+2,y=p.y*cell+2;ctx.fillStyle=i?'#35cfa5':'#8cfbe0';ctx.shadowColor='#3df7c0';ctx.shadowBlur=i?3:12;rounded(x,y,cell-4,cell-4,8);ctx.shadowBlur=0;if(i===0){ctx.fillStyle='#082a31';const ex=dir.x?dir.x*3:0,ey=dir.y?dir.y*3:0;ctx.beginPath();ctx.arc(x+7+ex,y+7+ey,2,0,7);ctx.arc(x+15+ex,y+7+ey,2,0,7);ctx.fill()}})};
const hud=()=>{status.textContent=`🚀 Wynik: ${score} · 💎 Kryształy: ${stars} · ⭐ Poziom: ${level} · 🐍 Długość: ${snake.length}${paused?' · Pauza':timer===null?' · Naciśnij ↑, ↓ lub →, aby zacząć.':''}`};
reset=()=>{
 if(timer!==null)clearInterval(timer);
 timer=null;score=0;stars=0;level=1;ticks=0;over=false;paused=false;
 snake=[{x:4,y:7},{x:3,y:7},{x:2,y:7}];dir={x:1,y:0};next=dir;
 obstacles=[];food=null;bonus=null;food=freeCell();
 pauseButton.textContent='⏸ Pauza';hud();draw();
};
const dirs={left:{x:-1,y:0},right:{x:1,y:0},up:{x:0,y:-1},down:{x:0,y:1}};
move=d=>{
 const direction=dirs[d];
 if(over||paused||!direction||(direction.x===-dir.x&&direction.y===-dir.y))return;
 next=direction;
 if(timer===null){timer=setInterval(tick,520);hud()}
};
const tick=()=>{
 if(over||paused)return;
 ticks++;dir=next;
 const head={x:snake[0].x+dir.x,y:snake[0].y+dir.y};
 const eat=sameCell(food,head),superEat=sameCell(bonus,head),grow=eat||superEat;
 const body=grow?snake:snake.slice(0,-1);
 if(head.x<0||head.y<0||head.x>=W||head.y>=H||obstacles.some(p=>sameCell(p,head))||body.some(p=>sameCell(p,head))){
  over=true;clearInterval(timer);timer=null;
  status.textContent=`🌠 Koniec misji! Wynik: ${score} · Poziom ${level} · Długość: ${snake.length}.`;draw();return;
 }
 snake.unshift(head);
 if(!grow)snake.pop();
 if(eat){
  score+=10;stars++;food=freeCell();
  if(stars%4===0){level++;const spot=freeCell();if(spot)obstacles.push(spot)}
 }else if(superEat){score+=40;bonus=null}
 if(ticks%35===0&&!bonus)bonus=freeCell();
 if(ticks%35===12)bonus=null;
 hud();draw();
};
updatePause=()=>{if(!over)hud()};
reset();
}else{
const shapes=[[[1,1,1,1]],[[1,1],[1,1]],[[0,1,0],[1,1,1]],[[1,0,0],[1,1,1]],[[0,0,1],[1,1,1]],[[1,1,0],[0,1,1]],[[0,1,1],[1,1,0]]];let board,piece;
const newPiece=()=>{const a=shapes[Math.floor(Math.random()*shapes.length)];return {shape:a.map(r=>[...r]),x:Math.floor((W-a[0].length)/2),y:0,color:['#f4c34c','#42c7c1','#b986f5','#ff7c86'][Math.floor(Math.random()*4)]}};
const fits=(p,dx=0,dy=0,shape=p.shape)=>shape.every((r,y)=>r.every((v,x)=>!v||(p.x+x+dx>=0&&p.x+x+dx<W&&p.y+y+dy<H&&(p.y+y+dy<0||!board[p.y+y+dy][p.x+x+dx]))));
const draw=()=>{bg();board.forEach((r,y)=>r.forEach((v,x)=>{if(v)paint(x,y,v)}));piece.shape.forEach((r,y)=>r.forEach((v,x)=>{if(v)paint(piece.x+x,piece.y+y,piece.color)}))};
const land=()=>{piece.shape.forEach((r,y)=>r.forEach((v,x)=>{if(v&&piece.y+y>=0)board[piece.y+y][piece.x+x]=piece.color}));let cleared=0;board=board.filter(r=>{if(r.every(Boolean)){cleared++;return false}return true});while(board.length<H)board.unshift(Array(W).fill(null));score+=cleared*100;status.textContent=`Wynik: ${score}`;piece=newPiece();if(!fits(piece)){over=true;status.textContent=`Koniec gry! Wynik: ${score}`}};
reset=()=>{board=Array.from({length:H},()=>Array(W).fill(null));piece=newPiece();score=0;over=false;paused=false;status.textContent='Wynik: 0';draw()};
move=d=>{if(over||paused)return;if(d==='left'&&fits(piece,-1))piece.x--;if(d==='right'&&fits(piece,1))piece.x++;if(d==='down'){if(fits(piece,0,1))piece.y++;else land()}if(d==='up'){const rotated=piece.shape[0].map((_,i)=>piece.shape.map(row=>row[i]).reverse());if(fits(piece,0,0,rotated))piece.shape=rotated}draw()};
const tick=()=>{if(over||paused)return;if(fits(piece,0,1))piece.y++;else land();draw()};reset();timer=setInterval(tick,500);
}
const controls=root.querySelectorAll('[data-dir]');controls.forEach(b=>b.addEventListener('click',()=>move(b.dataset.dir)));
const onKey=ev=>{const d={ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down'}[ev.key];if(d){ev.preventDefault();move(d)}};window.addEventListener('keydown',onKey);
root.querySelector('#arcade-restart').addEventListener('click',reset);pauseButton.addEventListener('click',()=>{if(over)return;paused=!paused;pauseButton.textContent=paused?'▶ Wznów':'⏸ Pauza';updatePause()});
cleanup=()=>window.removeEventListener('keydown',onKey);
}
