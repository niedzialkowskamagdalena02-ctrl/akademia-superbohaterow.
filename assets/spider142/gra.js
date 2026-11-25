const art={"grafiki/okna/kaczka.png": "grafiki/okna/kaczka.png", "grafiki/okna/kot.png": "grafiki/okna/kot.png", "grafiki/okna/kot_animacja.png": "grafiki/okna/kot_animacja.png", "grafiki/okna/kot_stopklatka.png": "grafiki/okna/kot_stopklatka.png", "grafiki/okna/kupa.png": "grafiki/okna/kupa.png", "grafiki/okna/kupa_animacja.png": "grafiki/okna/kupa_animacja.png", "grafiki/okna/kupa_stopklatka.png": "grafiki/okna/kupa_stopklatka.png", "grafiki/okna/paczek.png": "grafiki/okna/paczek.png", "grafiki/okna/ufo.png": "grafiki/okna/ufo.png", "grafiki/okna/zaba.png": "grafiki/okna/zaba.png", "grafiki/okna/zaba_animacja.png": "grafiki/okna/zaba_animacja.png", "grafiki/okna/zaba_stopklatka.png": "grafiki/okna/zaba_stopklatka.png"};
const preschool=document.documentElement.dataset.level==='przedszkole';
const integration=window.Training139;
const bank=integration.config.spiderBank;
window.akademiaZadaniaAI=integration.config.generateSpider;
const restored=integration.restore;
let history=Array.isArray(restored?.history)?restored.history:[];
let attempt=restored?.attempt||crypto.randomUUID(),epoch=0,revealed=!!restored?.revealed;
const $=s=>document.querySelector(s);
const scene=$('.scene'),hero=$('#hero'),canvas=$('canvas'),ctx=canvas.getContext('2d');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
function shuffle(values){
 const list=[...values];
 for(let i=list.length-1;i>0;i--){
  const j=Math.floor(Math.random()*(i+1));[list[i],list[j]]=[list[j],list[i]];
 }
 return list;
}
const groups=Object.keys(bank);
let aiBank=Array.isArray(restored?.aiBank)?restored.aiBank:[];
function taskKey(row){return [row[1],row[2]].map(s=>String(s).normalize('NFC').toLocaleLowerCase('pl').replace(/\s+/g,' ').trim()).join('|');}
function mission(){
 const seen=new Set(),schedule=[],recent=history.flat();
 while(schedule.length<10){const cycle=shuffle(groups);if(cycle[0]===schedule.at(-1))cycle.push(cycle.shift());schedule.push(...cycle);}
 const route=schedule.slice(0,10).map(group=>{
  const all=[...bank[group].map(row=>[group,...row]),...aiBank.filter(row=>row[0]===group)];
  const pool=shuffle(all).filter(row=>!seen.has(taskKey(row))).sort((a,b)=>recent.lastIndexOf(taskKey(a))-recent.lastIndexOf(taskKey(b)));
  if(!pool.length)throw Error('Brak różnych pytań do misji.');const row=pool[0];seen.add(taskKey(row));return row;
 });
 history=[...history,route.map(taskKey)].slice(-4);return route;
}
async function loadAiBank(){
 const provider=window.akademiaZadaniaAI;
 if(typeof provider!=='function')return;
 try{
  aiBank=await provider({gra:'spiderman-misja-na-dachu',poziom:preschool?'przedszkole':'klasy-1-3',kategorie:[...groups]});
  save142();
 }catch{
  // Keep the local bank available if the provider fails.
 }
}
const floors=new Map();
for(let n=10;n>0;n--){
 const element=document.createElement('div');element.className='floor';
 $('#floors').append(element);floors.set(n,element);
}
let tasks=[],solved=0,position=0,busy=false,ready=false;
function local(element){
 const r=element.getBoundingClientRect(),s=scene.getBoundingClientRect();
 return {x:r.left-s.left-scene.clientLeft,y:r.top-s.top-scene.clientTop,w:r.width,h:r.height};
}
function anchor(n){
 const tower=local($('.tower'));
 const x=tower.x+Math.max(17,tower.w*.12);
 if(n===0)return [x,scene.clientHeight-7];
 if(n===11){const roof=local($('.roof'));return [roof.x+roof.w/2,roof.y+6];}
 const row=local(floors.get(n));return [x,row.y+row.h];
}
function place([x,y]){
 hero.style.setProperty('--hero-x',x+'px');
 hero.style.setProperty('--hero-y',y+'px');
}
let cameoTimer,roofTimer;
const roofGag=$('#roof-gag');
const cameos=['kupa','zaba','kaczka','ufo','kot','paczek'];
let cameoBag=[];
let firstCameo=true;
function scheduleCameo(){
 if(cameoTimer!==undefined||solved===10)return;
 cameoTimer=setTimeout(()=>{
  cameoTimer=undefined;
  if(solved===10)return;
  const windows=[...scene.querySelectorAll('.floor:not(.active) .dummy')];
  const target=windows[Math.floor(Math.random()*windows.length)];
  if(target){
   if(!cameoBag.length){
    cameoBag=shuffle(cameos);
    if(firstCameo)cameoBag.splice(cameoBag.indexOf('kupa'),1);
   }
   const name=firstCameo?'kupa':cameoBag.pop();
   firstCameo=false;
   const guest=document.createElement('span'), image=document.createElement('img');
   const animated=['kupa','zaba','kot'].includes(name);
   const suffix=animated?(reduced.matches?'_stopklatka':'_animacja'):'';
   guest.className='cameo acted cameo-'+name;guest.ariaHidden='true';
   image.src=art['grafiki/okna/'+name+suffix+'.png'];
   if(animated&&!reduced.matches){
    // All supplied APNG frames remain in the original file. Separate frames
    // are used when APNG loading fails, and the still serves reduced motion.
    image.onerror=()=>{image.onerror=()=>{image.onerror=null;image.src=art['grafiki/okna/'+name+'.png'];};let frame=0;const tick=()=>{if(!guest.isConnected)return;image.src='grafiki/okna/'+name+'_'+(frame++%3+1)+'.png';setTimeout(tick,120);};tick();};
   }
   image.alt='';guest.append(image);target.append(guest);
   setTimeout(()=>guest.remove(),2250);
   save142();
  }
  scheduleCameo();
 },firstCameo?650:3000+Math.random()*1700);
}
const finales=['pigeon','dance','confetti','selfie','siku'];
let finaleBag=[],lastFinale;
const replay=$('#replay-pigeon');
const replaySiku=$('#replay-siku');
replay.onclick=()=>{if(solved===10)celebrate('pigeon');};
replaySiku.onclick=()=>{if(solved===10)celebrate('siku');};
function celebrate(requested){
 clearTimeout(roofTimer);
 hero.classList.remove('dance','bathroom','pigeon','confetti','selfie');
 roofGag.hidden=$('#stream').hidden=$('#finale-effect').hidden=true;
 void hero.offsetWidth;
 const [x,y]=anchor(11);
 scene.style.setProperty('--roof-x',x+'px');
 scene.style.setProperty('--roof-y',y+'px');
 if(!finaleBag.length){
  finaleBag=shuffle(finales);
  if(!lastFinale){
   finaleBag.splice(finaleBag.indexOf('siku'),1);
   finaleBag.push('siku');
  }
  if(finaleBag.at(-1)===lastFinale)finaleBag.unshift(finaleBag.pop());
 }
 const finale=requested??(lastFinale=finaleBag.pop());
 if(!requested)save142();
 scene.dataset.finale=finale;
 const text={
  pigeon:'Dach zdobyty!',
  dance:'Dach zdobyty! Czas na taniec zwycięstwa!',
  confetti:'Dach zdobyty! Ups, konfetti we włosach… pod maską!',
  selfie:'Dach zdobyty! Selfie — tylko nie mrugnij!',
  siku:'Dach zdobyty! O kurczę, siku!'
 };
 $('#feedback').textContent=text[finale];
 if(finale==='pigeon'){
  roofGag.hidden=false;
  const label=$('#feedback');
  const announce=()=>{if(scene.dataset.finale==='pigeon')label.textContent='Gołąb zwędził kanapkę!';};
  if(reduced.matches)announce();
  else setTimeout(announce,1200);
 }
 const effect=$('#finale-effect');
 if(finale==='confetti'||finale==='selfie'){
  effect.textContent=finale==='confetti'?'🎉':'📸';
  effect.hidden=false;
 }
 if(finale==='siku')$('#stream').hidden=false;
 hero.classList.add(finale==='siku'?'bathroom':finale);
 roofTimer=setTimeout(()=>{
  hero.classList.remove('dance','bathroom','pigeon','confetti','selfie');
  effect.hidden=$('#stream').hidden=true;
 },finale==='siku'?4400:2350);
}
function render(focus=false){
 clearTimeout(roofTimer);
 roofGag.hidden=true;
 hero.classList.remove('dance','climb','bathroom','pigeon','confetti','selfie');
 delete scene.dataset.finale;
 $('#finale-effect').hidden=$('#stream').hidden=true;
 scheduleCameo();
 const guest=scene.querySelector('.cameo');
 const task=tasks[solved];busy=ready=false;
 replay.hidden=replaySiku.hidden=solved!==10;
 $('#progress').value=solved;$('#level').textContent=solved+' / 10 pięter';
 $('#category').textContent=task?.[0]??'Dach zdobyty';
 const audioOnly=preschool&&task?.[0]==='Litery';
 $('#question').textContent=audioOnly?'Posłuchaj i wskaż właściwą literę.':task?.[1]??'Brawo! Spider-Man dotarł na dach.';
 $('#read').textContent=audioOnly?'▶ Posłuchaj pytania':'▶ Odczytaj';
 $('#read').hidden=!task;$('#next').hidden=!!task;
 $('#next').textContent=task?'Następne piętro ↑':'Zagraj ponownie';
 $('#feedback').textContent=task?'Wybierz okno na podświetlonym piętrze.':'Misja ukończona!';
 for(const [n,row] of floors){
  const current=!!task&&n===solved+1;
  row.className='floor'+(current?' active':'')+(n<=solved?' visited':'');
  row.replaceChildren();
  const label=document.createElement('span');label.className='number';label.textContent=n;row.append(label);
  if(current){
   for(const answer of shuffle(task.slice(2))){
    const button=document.createElement('button');button.className='window';button.textContent=answer;
    button.onclick=()=>shoot(button,answer===task[2]);row.append(button);
   }
  }else for(let i=0;i<3;i++){
   const window=document.createElement('span');window.className='dummy';window.ariaHidden='true';row.append(window);
  }
 }
 if(task&&guest)scene.querySelector('.floor:not(.active) .dummy')?.append(guest);
 place(anchor(position));
 if(focus)(document.querySelector('.window')??$('#next')).focus({preventScroll:true});
 save142();
}
function web(from,to,t,impact){
 const scale=devicePixelRatio||1,w=Math.round(scene.clientWidth*scale),h=Math.round(scene.clientHeight*scale);
 if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
 ctx.setTransform(scale,0,0,scale,0,0);ctx.clearRect(0,0,w/scale,h/scale);
 ctx.lineWidth=2;ctx.strokeStyle='#f4feff';ctx.shadowColor='#173c6a';ctx.shadowBlur=6;
 ctx.beginPath();ctx.moveTo(...from);ctx.lineTo(from[0]+(to[0]-from[0])*t,from[1]+(to[1]-from[1])*t);ctx.stroke();
 if(impact)for(let i=0;i<8;i++){
  const a=i*Math.PI/4;ctx.beginPath();ctx.moveTo(...to);ctx.lineTo(to[0]+12*Math.cos(a),to[1]+12*Math.sin(a));ctx.stroke();
 }
}
function clearWeb(){ctx.clearRect(0,0,canvas.width,canvas.height);}
function animate(ms,draw){
 const generation=epoch;
 if(reduced.matches){draw(1);return Promise.resolve();}
 return new Promise(resolve=>{
  const started=performance.now();
  function step(now){if(generation!==epoch){resolve();return;}const t=Math.min(1,(now-started)/ms);draw(t);if(t<1)requestAnimationFrame(step);else resolve();}
  requestAnimationFrame(step);
 });
}
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
function hand([x,y]){return [x+hero.offsetWidth*.32,y-hero.offsetHeight*.30];}
async function shoot(button,correct){
 if(busy)return;
 window.speechSynthesis?.cancel();
 busy=true;const generation=epoch;
 const start=anchor(position), r=local(button), target=[r.x+r.w/2,r.y+3];
 await animate(230,t=>web(hand(start),target,t,t===1));
 if(generation!==epoch)return;
 button.classList.add(correct?'hit':'miss');
 if(!correct){
  $('#feedback').textContent='Sieć puściła! Spider-Man spada na trawę.';
  await wait(170);if(generation!==epoch)return;clearWeb();
  const ground=anchor(0);
  const dropStart=position?start:[start[0],start[1]-46];
  if(!position)await animate(140,t=>place([start[0],start[1]-46*t]));
  await animate(460,t=>place([ground[0],dropStart[1]+(ground[1]-dropStart[1])*t*t]));
  if(generation!==epoch)return;
  restart();
  $('#feedback').textContent='Wracasz na pierwsze piętro. Wybierz okno, żeby zacząć od nowa.';
  return;
 }
 const nextFloor=solved+1, landing=anchor(nextFloor);
 if(!reduced.matches)hero.classList.add('climb');
 clearWeb();
 await animate(830,t=>{
  const ease=t-.075*Math.sin(t*Math.PI*4);
  const point=start.map((v,i)=>v+(landing[i]-v)*ease);
  place(point);
 });
 if(generation!==epoch)return;
 hero.classList.remove('climb');
 clearWeb();position=nextFloor;solved=nextFloor;
 if(solved===10){
  const roof=anchor(11);
  await animate(520,t=>place(landing.map((v,i)=>v+(roof[i]-v)*t-(i===1?16*Math.sin(Math.PI*t):0))));
  if(generation!==epoch)return;
  position=11;render(true);celebrate();integration.complete({attempt,revealed});return;
 }
 $('#progress').value=solved;$('#level').textContent=solved+' / 10 pięter';
 $('#feedback').textContent='Trafione! Piętro zdobyte.';
 $('#next').hidden=false;ready=true;save142();
}
const backgrounds=['park','wybrzeze','gory','zachod'];
let backgroundBag=[];
function changeBackground(){
 if(!backgroundBag.length){
  backgroundBag=shuffle(backgrounds);
  if(backgroundBag.at(-1)===scene.dataset.background)backgroundBag.unshift(backgroundBag.pop());
 }
 scene.dataset.background=backgroundBag.pop();
}
function restart(){
 epoch++;clearWeb();attempt=crypto.randomUUID();revealed=false;
 changeBackground();
 tasks=mission();
 solved=position=0;
 render(true);
}
$('#next').onclick=()=>{
 if(solved===10){if(integration.config.oneRound){integration.advance();return;}restart();return;}
 if(ready)render(true);
};
$('#read').onclick=()=>{
 if(busy||!window.speechSynthesis||!tasks[solved])return;
 speechSynthesis.cancel();
 const voice=new SpeechSynthesisUtterance(tasks[solved][1].replaceAll('×',' razy ').replaceAll('÷',' podzielone przez '));voice.lang='pl-PL';speechSynthesis.speak(voice);
};
$('#help').onclick=()=>integration.help();
new ResizeObserver(()=>{if(!busy||ready)place(anchor(position));}).observe(scene);
function save142(){
 const task=tasks[solved];
 integration.save({version142:1,tasks,solved,position,ready,attempt,revealed,history,aiBank,background:scene.dataset.background,backgroundBag,cameoBag,firstCameo,finaleBag,lastFinale,roundComplete:solved===10,context:task?{question:task[1],answer:task[2],options:task.slice(2)}:{question:'Misja na dachu ukończona',answer:''}});
}
integration.onSkip=()=>restart();
integration.onRevealed=()=>{revealed=true;save142();};
if(restored?.version142===1&&Array.isArray(restored.tasks)&&restored.tasks.length===10&&restored.tasks.every(row=>Array.isArray(row)&&groups.includes(row[0])&&row.length===5&&new Set(row.slice(2)).size===3)&&Number.isInteger(restored.solved)&&restored.solved>=0&&restored.solved<=10){
 tasks=restored.tasks;solved=restored.solved;position=solved===10?11:solved;
 backgroundBag=restored.backgroundBag||[];scene.dataset.background=backgrounds.includes(restored.background)?restored.background:'park';
 cameoBag=restored.cameoBag||[];firstCameo=restored.firstCameo!==false;
 finaleBag=restored.finaleBag||[];lastFinale=restored.lastFinale;
}else{tasks=mission();changeBackground();}
render();
if(solved===10){scene.dataset.finale=lastFinale||'siku';$('#feedback').textContent='Misja ukończona! Możesz powtórzyć finał lub zagrać ponownie.';}
void loadAiBank();
