const assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const url=name=>new URL('../assets/'+name,pathToFileURL(__filename));

function fakeNode(){
 return {
  dataset:{},textContent:'',hidden:false,disabled:false,events:{},attrs:new Set(),
  addEventListener(name,callback){this.events[name]=callback;},
  toggleAttribute(name,on){if(on)this.attrs.add(name);else this.attrs.delete(name);},
  focus(){},setPointerCapture(){},hasPointerCapture(){return true;},
  getBoundingClientRect(){return {left:0,width:340,height:270};}
 };
}

(async()=>{
 const {flightMission89,nextFlightMission89,flightGates89,flightHit89,readFlightMission89,saveFlightMission89}=await import(url('flight-missions89.js'));
 const {flightMarkup88,mountNounFlight88}=await import(url('noun-flight88.js'));
 const themes=['Rzeczowniki','Przymiotniki','Czasowniki','Ó czy U?','Ż czy RZ?','Strzał w literówkę','H czy CH?'];
 for(const [index,title] of themes.entries()){
  const mission=flightMission89(index),gates=flightGates89(mission,()=>.28);
  assert.equal(mission.title,title);
  assert.equal(gates.length,4);
  const unique=new Set();
  for(const gate of gates){
   assert.equal(gate.length,3);
   const targets=gate.filter(entry=>entry?.goal);
   assert.equal(targets.length,1);
   assert.ok(!unique.has(targets[0].word));
   unique.add(targets[0].word);
   if(mission.shoot)assert.ok(targets[0].correction&&gate.every(entry=>entry.word));
  }
 }
 assert.equal(nextFlightMission89(6),0);
 const score={score:0,hearts:3};
 const noun=flightMission89(0);
 assert.match(flightHit89(score,noun,{word:'kot',kind:'rzeczownik',goal:true}),/to rzeczownik/);
 assert.match(flightHit89(score,noun,{word:'leci',kind:'czasownik'}),/to czasownik/);
 assert.deepEqual(score,{score:1,hearts:2});

 const data=new Map();
 globalThis.localStorage={getItem:key=>data.get(key)??null,setItem:(key,value)=>data.set(key,value)};
 globalThis.matchMedia=()=>({matches:false});
 globalThis.devicePixelRatio=1;
 globalThis.ResizeObserver=class {observe(){}disconnect(){}};
 let frame=0,now=0;
 const frames=new Map();
 globalThis.requestAnimationFrame=callback=>{frames.set(++frame,callback);return frame;};
 globalThis.cancelAnimationFrame=id=>frames.delete(id);
 const tick=ms=>{
  for(let end=now+ms;now<end;){
   now+=Math.min(50,end-now);
   const pending=[...frames.values()];frames.clear();
   pending.forEach(callback=>callback(now));
  }
 };

 const names=['canvas','[data-flight-score]','[data-flight-hearts]','[data-flight-status]',
  '[data-action="hq:flight:start"]','[data-flight-topic]','[data-flight-round]','[data-flight-instruction]',
  '.hq88-flight-rules [data-speak]','.hq89-flight-fire'];
 const nodes=Object.fromEntries(names.map(name=>[name,fakeNode()]));
 const [canvas,points,hearts,status,start,topic,round,,voice,fire]=names.map(name=>nodes[name]);
 const controls=fakeNode(),fireButton=fakeNode(),lanes=[fakeNode(),fakeNode(),fakeNode()];
 fire.querySelector=()=>fireButton;
 controls.querySelector=name=>nodes[name];controls.querySelectorAll=()=>lanes;
 canvas.getContext=()=>new Proxy({},{
  get(target,prop){if(prop in target)return target[prop];return ()=>({addColorStop(){}});}
 });
 const mount=opts=>mountNounFlight88({querySelector:()=>controls},'blue',opts);
 const action=name=>controls.events.click({target:{closest:()=>({dataset:{action:'hq:flight:'+name}})}});
 const select=index=>canvas.events.pointerdown({clientX:(index+.5)*340/3,pointerId:1});
 const random=()=>.28;
 const oldRandom=Math.random;
 Math.random=random;
 const play=mission=>{
  for(const gate of flightGates89(mission,random)){
   const index=gate.findIndex(entry=>entry?.goal);
   assert.equal(lanes[index].textContent,gate[index].word);
   select(index);assert.ok(lanes[index].attrs.has('data-current'));
   const previous=lanes.map(node=>node.textContent).join('|');
   for(let j=0;j<140&&lanes.map(node=>node.textContent).join('|')===previous;j++)tick(50);
   assert.notEqual(lanes.map(node=>node.textContent).join('|'),previous);
  }
 };
 mount({child:'pawel'});
 for(const [index,scenery] of ['Słoneczny dzień','Gwiaździsty wieczór','Różowy zachód'].entries()){
  action('start');
  assert.match(round.textContent,new RegExp(scenery));
  assert.equal(topic.textContent,themes[index]);
  assert.equal(voice.dataset.speak,flightMission89(index).instruction);
  play(flightMission89(index));
  assert.equal(readFlightMission89('pawel'),index+1);
  assert.equal(start.textContent,index===2?'Następny lot':'Następna runda');
 }
 assert.equal(points.textContent,'Trafienia 12');
 assert.match(status.textContent,/12 z 12/);

 action('start');
 assert.equal(topic.textContent,themes[3]);play(flightMission89(3));
 action('start');
 assert.equal(topic.textContent,themes[4]);play(flightMission89(4));
 action('start');
 assert.equal(topic.textContent,themes[5]);
 assert.equal(fire.hidden,false);
 const findTypo=()=>lanes.findIndex(({textContent})=>flightMission89(5).pairs.some(([,wrong])=>wrong===textContent));
 select(findTypo());
 tick(6100);
 assert.equal(points.textContent,'Trafienia 8','Przelot przez literówkę nie daje punktu za strzał.');
 assert.equal(hearts.textContent,'Osłony 3');
 select((findTypo()+1)%3);action('fire');
 assert.equal(hearts.textContent,'Osłony 2');
 assert.match(status.textContent,/jest zapisane poprawnie/);
 tick(650);
 select(findTypo());
 controls.events.keydown({code:'Space',target:canvas,preventDefault(){}});
 action('fire');
 assert.equal(points.textContent,'Trafienia 9','Bramka zalicza tylko pierwszy strzał.');
 assert.match(status.textContent,/Trafione! Poprawnie piszemy/);
 tick(650);
 select(findTypo());action('fire');tick(650);
 assert.equal(readFlightMission89('pawel'),6);
 assert.equal(readFlightMission89('patryk'),0);
 const button=(label,action)=>`<button data-action="${action}">${label}</button>`;
 assert.match(flightMarkup88(button,()=>'',{child:'pawel'}),/H czy CH\?/);
 assert.match(flightMarkup88(button,()=>'',{child:'pawel',preview:true}),/Rzeczowniki/);
 saveFlightMission89('pawel',true,1);
 assert.equal(readFlightMission89('pawel'),6);
 mountNounFlight88(null);
 Math.random=oldRandom;
 assert.equal(frames.size,0);
 console.log('PASS V89 – trzy scenerie, siedem tematów, dwa pełne loty, strzały i osobny postęp profili.');
})().catch(error=>{console.error(error);process.exitCode=1;});
