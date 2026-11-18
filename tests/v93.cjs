const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const {pathToFileURL}=require('node:url');
const url=name=>new URL('../assets/'+name,pathToFileURL(__filename));
process.argv[2]??=require('node:path').resolve(__dirname,'..');

function board(){
 const nodes=new Map(),listeners={};
 const makeNode=()=>({
  dataset:{},style:{setProperty(){},removeProperty(){}},classList:{toggle(){}},
  setAttribute(){},getContext(){return null;},isConnected:true,closest(){return null;},matches(){return false;}
 });
 const node=key=>{
  if(!nodes.has(key))nodes.set(key,makeNode());
  return nodes.get(key);
 };
 return {
  markup:'',dataset:{},listeners,ownerDocument:{elementFromPoint:()=>null},
  set innerHTML(html){this.markup=html;nodes.clear();},
  get innerHTML(){return this.markup;},
  addEventListener(name,fn,{signal}={}){listeners[name]=fn;signal?.addEventListener('abort',()=>delete listeners[name]);},
  querySelector:node,querySelectorAll:()=>[],
  click(action){
   const target={dataset:{mission93:action},closest:selector=>selector==='[data-mission93]'?target:null};
   listeners.click({target,detail:0});
  }
 };
}
(async()=>{
 const {schoolMissions93,preschoolMissions93,captainMissions93,aceMissions93,missionDeck93}=await import(url('missions93-data.js'));
 const {mountMissions93,chocolateSelection93}=await import(url('missions93.js'));
 const {rotateBlock93}=await import(url('arcade.js'));
 const {baseWalkMarkup,openWalkRoom87}=await import(url('base-walk85.js'));
 const {preschoolSpeech93}=await import(url('preschool-audio93.js'));
 const {traceStrokes92}=await import(url('learning-trace92.js'));
 const all=[schoolMissions93,preschoolMissions93,captainMissions93,aceMissions93];
 assert.deepEqual(all.map(list=>list.length),[7,7,7,7]);
 assert.equal(new Set(all.flat().map(row=>row[0])).size,28);
 for(const [index,list] of all.entries()){
  for(const [id] of list){
   if(id==='snail')continue;
   const grades=index%2===0?[1,2,3]:['P'];
   for(const grade of grades){
    for(let loop=0;loop<60;loop++){
     for(const task of missionDeck93(id,grade)){
      assert.ok(task.prompt&&task.speech,id);
      if(task.answer!==undefined&&task.options)assert.ok(task.options.some(c=>c.value===task.answer),id);
      if(task.needed&&task.options)assert.ok(task.needed.every(n=>task.options.some(c=>c.value===n)),id);
      if(task.kind==='load')assert.equal(task.options.filter(c=>c.value===task.answer).length,task.count);
      if(task.kind==='closet')assert.deepEqual(task.tops.map(c=>c.value).sort(),task.bottoms.map(c=>c.value).sort());
      if(task.kind==='collect'&&id==='chameleon'&&String(grade)==='2')assert.equal(task.options.filter(c=>c.value===task.answer).length,2);
     }
    }
   }
  }
 }
 assert.deepEqual(chocolateSelection93(30,8),{top:1,left:1,rows:4,columns:2});
 assert.equal(preschoolSpeech93('M'),'mmm');
 assert.equal(preschoolSpeech93('12'),'12');
 assert.ok(traceStrokes92('10').length===2);
 const shape={shape:[[1],[1],[1],[1]],x:8,y:1};
 const fits=(p,dx,dy,s)=>p.x+dx>=0&&p.x+dx+s[0].length<=10;
 assert.ok(rotateBlock93(shape,fits));
 assert.equal(shape.x,6);
 assert.deepEqual(shape.shape,[[1,1,1,1]]);
 assert.equal(rotateBlock93(shape,()=>false),false);
 assert.deepEqual(shape.shape,[[1,1,1,1]]);
 const spider={grade:'P',coins:0};
 openWalkRoom87('test','hangar');
 const walk=baseWalkMarkup(spider,'test','spider',93,'');
 assert.ok(walk.includes('data-action="hq:board"'));
 assert.doesNotMatch(walk,/hq88-aircraft/);
 assert.ok(fs.existsSync(url('hq/hd93/hangar95.webp')));
 assert.ok(walk.includes('data-walk-web'));
 assert.ok(!walk.includes('id="missions93-cockpit"'));
 assert.ok(!baseWalkMarkup(spider,'test','iron',93,'').includes('data-walk-web'));

 const {app,data}=require('./legacy/test.cjs');
 const view=app(),account=data();
 view.api.set(account,{role:'child',who:'patryk'});
 await view.api.handle('child:home');
 assert.equal((view.root.innerHTML.match(/class="academy104-destination"/g)||[]).length,6);
 assert.equal((view.root.innerHTML.match(/data-action="child:academy"/g)||[]).length,1);
 assert.match(view.root.innerHTML,/aria-label="Książki">\s*<img[^>]*interface106\/patryk-books\.webp/);
 assert.match(view.root.innerHTML,/data-speak="Książki"/);
 const header=markup=>markup.match(/<header class="academy102-header">[\s\S]*?<\/header>/)?.[0];
 const dashboardHeader=header(view.root.innerHTML);
 assert.match(dashboardHeader,/Akademia Patryk/);
 assert.match(dashboardHeader,/interface106\/masthead\.webp/);
 for(const page of ['missions-board','books','academy','mentor','learn','base']){
  await view.api.handle('child:'+page);
  assert.equal(header(view.root.innerHTML),dashboardHeader,page);
  assert.equal((view.root.innerHTML.match(/class="academy104-destination"/g)||[]).length,6,page);
  assert.equal((view.root.innerHTML.match(/class="academy102-player"/g)||[]).length,1,page);
  assert.match(view.root.innerHTML,new RegExp(`data-action="child:${page}" aria-current="page"`));
 }
 let clicks=0;
 const audioParam={setValueAtTime(){},exponentialRampToValueAtTime(){}};
 view.ctx.window.AudioContext=class {
  state='running';currentTime=0;
  createOscillator(){return {frequency:audioParam,connect(){},start(){clicks++;},stop(){}};}
  createGain(){return {gain:audioParam,connect(){}};}
 };
 const tile={dataset:{action:'child:books'},isConnected:true,
  closest(selector){return ['button,summary','[data-action]'].includes(selector)?this:null;},
  matches(selector){return selector.includes('.academy102-destinations button');}};
 const tap=()=>view.listeners.click.forEach(listener=>listener({target:tile,detail:1,isTrusted:true}));
 tap();tap();
 assert.equal(clicks,1);
 assert.equal(tile.dataset.academyPressed,'true');
 assert.doesNotMatch(view.root.innerHTML,/Moje podręczniki/);
 const opens=[...view.timers].filter(([,timer])=>timer.ms===190);
 assert.equal(opens.length,1);
 opens[0][1].fn();view.timers.delete(opens[0][0]);
 assert.equal(tile.dataset.academyPressed,undefined);
 assert.match(view.root.innerHTML,/Moje podręczniki/);
 view.storage.setItem('academy-v72-training-silent','1');tap();
 assert.equal(clicks,1);
 assert.equal(tile.dataset.academyPressed,'true');
 [...view.timers.values()].find(timer=>timer.ms===190).fn();
 const schoolView=app();
 schoolView.api.set(account,{role:'child',who:'pawel'});
 await schoolView.api.handle('child:home');
 assert.match(schoolView.root.innerHTML,/aria-label="Trening">\s*<img[^>]*interface106\/patryk-training\.webp/);
 assert.match(schoolView.root.innerHTML,/data-speak="Książki"/);
 assert.equal((schoolView.root.innerHTML.match(/academy107-wide-face/g)||[]).length,2);
 await schoolView.api.handle('child:missions-board');
 for(const icon of ['shield','icon-missions','alert','school','home']){
  assert.ok(schoolView.root.innerHTML.includes('interface107/'+icon+'.webp'),icon);
 }

 const pinView=app(),pinAccount=data();
 pinAccount.parentPin='1111';
 pinAccount.profiles.pawel.hero='hulk';
 pinView.api.set(pinAccount,{role:''});
 pinView.api.render();
 assert.match(pinView.root.innerHTML,/class="academy107-entry"/);
 assert.match(pinView.root.innerHTML,/academy107-pair/);
 assert.match(pinView.root.innerHTML,/class="academy107-profile-card academy107-profile-pawel" data-action="enter:pawel">\s*<img[^>]*assets\/art\/hulk\.webp/);
 assert.match(pinView.root.innerHTML,/assets\/interface108\/hero-patryk\.webp/);
 assert.match(pinView.root.innerHTML,/data-action="enter:admin" aria-label="Centrum dowodzenia mamy"><\/button>/);
 assert.match(pinView.root.innerHTML,/data-action="academy:update" aria-label="Aktualizuj Akademię"><\/button>/);
 const choices=pinView.ctx.academy102Choices();
 assert.match(choices,/data-action="hq:view:classic"[\s\S]*interface108\/classic\.webp[\s\S]*data-action="hq:view:walk"[\s\S]*interface108\/walk\.webp/);
 await pinView.api.handle('enter:admin');
 const pinMarkup=pinView.root.innerHTML;
 assert.equal((pinMarkup.match(/parent-pin:cancel/g)||[]).length,1);
 assert.equal((pinMarkup.match(/parent-pin:digit:/g)||[]).length,10);
 for(const [action,label] of [['confirm','OK'],['cancel','Anuluj'],['erase','Usuń ostatnią cyfrę']]){
  assert.ok(pinMarkup.includes(`parent-pin:${action}" aria-label="${label}"></button>`),action);
 }
 for(let digit=0;digit<=9;digit++){
  assert.ok(pinMarkup.includes(`parent-pin:digit:${digit}" aria-label="${digit}">${digit}</button>`),digit);
 }
 await pinView.api.handle('parent-pin:cancel');
 assert.match(pinView.root.innerHTML,/class="academy107-entry"/);
 await pinView.api.handle('enter:admin');
 const pinField=pinView.ids['academy107-pin-value']={value:'2222',maxLength:4};
 const pinError=pinView.ids['academy107-pin-error']={textContent:''};
 await pinView.api.handle('parent-pin:confirm');
 assert.match(pinError.textContent,/Nieprawidłowy PIN/);
 assert.equal(pinField.value,'');
 const pinKey={dataset:{action:'parent-pin:digit:1'},isConnected:true,
  closest(selector){return ['button,summary','[data-action]'].includes(selector)?this:null;},
  matches(selector){return selector.includes('.academy107-pin-key');}};
 for(let i=0;i<4;i++)pinView.listeners.click.forEach(listener=>listener({target:pinKey,detail:1,isTrusted:true}));
 assert.equal(pinField.value,'1111');
 assert.equal(pinKey.dataset.academyPressed,'true');
 await pinView.api.handle('parent-pin:erase');
 assert.equal(pinField.value,'111');
 await pinView.api.handle('parent-pin:digit:1');
 await pinView.api.handle('parent-pin:confirm');
 assert.match(pinView.root.innerHTML,/data-action="admin:settings"/);
 assert.equal(pinAccount.parentPin,'1111');
 await pinView.api.handle('admin:settings');
 for(const hero of ['hulk','captain','thor','hood']){
  assert.match(pinView.root.innerHTML,new RegExp(`hero:set:pawel:${hero}"[^>]*><img[^>]*assets/art/${hero}\\.webp`));
 }
 await pinView.api.handle('hero:set:patryk:hood');
 assert.equal(pinAccount.profiles.patryk.hero,'hood');
 await pinView.api.handle('exit');
 assert.match(pinView.root.innerHTML,/data-action="enter:patryk">\s*<img[^>]*assets\/art\/hood\.webp/);
 const setupView=app(),setupAccount=data();
 setupAccount.parentPin='';
 setupView.api.set(setupAccount,{role:''});
 await setupView.api.handle('enter:admin');
 assert.match(setupView.root.innerHTML,/Ustaw kod PIN/);
 setupView.ids['academy107-pin-value']={value:'002468',maxLength:8};
 setupView.ids['academy107-pin-error']={textContent:''};
 let savedPinState;
 setupView.ctx.put=async(key,value)=>{assert.equal(key,'state');savedPinState=value;};
 await setupView.api.handle('parent-pin:confirm');
 assert.equal(savedPinState.parentPin,'002468');
 assert.match(setupView.root.innerHTML,/data-action="admin:settings"/);
 await view.api.handle('child:learn');
 await view.api.handle('learning-games:open');
 await view.api.handle('learning-games:more');
 assert.match(view.root.innerHTML,/missions93-training/);
 assert.doesNotMatch(view.root.innerHTML,/missions93-cockpit|hq:board/);
 await view.api.handle('hq:board');
 assert.doesNotMatch(view.root.innerHTML,/missions93-cockpit/);
 await view.api.handle('child:base');
 await view.api.handle('hq:hangar');
 assert.match(view.root.innerHTML,/hq:board/);
 assert.doesNotMatch(view.root.innerHTML,/missions93-cockpit/);
 await view.api.handle('hq:board');
 assert.match(view.root.innerHTML,/missions93-cockpit/);
 account.profiles.patryk.base={owned:['quinjet']};
 await view.api.handle('hq:flight');
 assert.doesNotMatch(view.root.innerHTML,/hq88-flight/);
 await view.api.handle('test:enter:pawel');
 assert.match(view.root.innerHTML,/missions93-cockpit/);
 await view.api.handle('hq:close');
 assert.doesNotMatch(view.root.innerHTML,/missions93-cockpit/);
 view.api.set(account,{role:'admin'});
 view.ctx.flightMarkup88=(await import(url('noun-flight88.js'))).flightMarkup88;
 view.ctx.mountNounFlight88=()=>{};
 await view.api.handle('test:enter:patryk');
 await view.api.handle('hq:hangar');
 await view.api.handle('hq:board');
 await view.api.handle('hq:flight');
 assert.match(view.root.innerHTML,/hq88-flight/);

 const originals=[setTimeout,clearTimeout,setInterval,clearInterval,Date.now,Math.random];
 let now=0,nextId=0;
 const timeouts=new Map(),intervals=new Map();
 globalThis.setTimeout=(fn,ms)=>{timeouts.set(++nextId,{fn,ms});return nextId;};
 globalThis.clearTimeout=id=>timeouts.delete(id);
 globalThis.setInterval=(fn,ms)=>{intervals.set(++nextId,{fn,ms});return nextId;};
 globalThis.clearInterval=id=>intervals.delete(id);
 Date.now=()=>now;
 Math.random=()=>.32;
 const played=[],spoken=[];
 const root=board(),success=()=>assert.match(root.innerHTML,/data-mission93="next"/);
 function drag(kind,value,hit){
  const data=kind==='cell'?'sq93Cell':'sq93Drag';
  const source={dataset:{[data]:String(value)},style:{setProperty(){},removeProperty(){}},closest:selector=>
   selector===(kind==='cell'?'[data-sq93-cell]':'[data-sq93-drag]')?source:null};
  const down={target:source,button:0,pointerId:1,clientX:20,clientY:20};
  root.ownerDocument.elementFromPoint=()=>hit;
  root.listeners.pointerdown(down);
  root.listeners.pointermove({...down,clientX:80,clientY:80});
  root.listeners.pointerup({...down,clientX:80,clientY:80});
  root.ownerDocument.elementFromPoint=()=>null;
 }
 function mount(grade,flight=false,legacy=false){mountMissions93(root,{grade,flight,legacy,speak:(text,lang)=>spoken.push([text,lang]),tone:note=>played.push(note)});}
 function start(game,grade){
  root.click('play-'+game);root.click('start');
  return missionDeck93(game,grade)[0];
 }
 const choose=task=>root.click('pick-'+task.options.findIndex(c=>c.value===task.answer));
 const code=n=>{for(const d of String(n))root.click('key-'+(d==='0'?10:Number(d)-1));root.click('key-11');};
 function passGates(digits){
  for(const value of digits){
   const lanes=[...root.innerHTML.matchAll(/data-mission93="lane-(\d+)"[^>]*>(?:<span[^>]*>[^<]*<\/span>)?<span>(\d+)<\/span>/g)];
   const lane=lanes.find(match=>Number(match[2])===value);
   assert.ok(lane,'brama '+value);
   root.click('lane-'+lane[1]);root.click('fly');
  }
 }
 try{
  mount(2);
  assert.equal((root.innerHTML.match(/data-mission93="play-/g)||[]).length,7);
  for(const [id] of schoolMissions93){
   const task=start(id,2);
   if(id==='monster'||id==='duel')choose(task);
   if(id==='space'){
    assert.equal(intervals.size,1);
    root.click('lane-'+task.options.findIndex(c=>c.value===task.answer));root.click('fly');
    assert.equal(intervals.size,0);
   }
   if(id==='chocolate'){
    const cell={dataset:{sq93Cell:String((task.rows-1)*7+task.columns-1)},closest:()=>cell};
    drag('cell',0,cell);
    root.listeners.submit({target:{matches:()=>true,querySelector:()=>({value:task.answer})},preventDefault(){}});
    root.click('rotate');assert.match(root.innerHTML,new RegExp(task.columns+' × '+task.rows));
   }
   if(id==='chameleon')task.options.forEach((item,i)=>{if(item.value===task.answer)root.click('pick-'+i);});
   if(id==='frog')for(const n of task.needed)root.click('pick-'+task.options.findIndex(c=>c.value===n));
   if(id==='potions'){choose(task);root.click('drop');}
   success();
   root.click('catalog');
  }

  mount('P');
  assert.equal((root.innerHTML.match(/data-sq93-say=/g)||[]).length,8);
  assert.doesNotMatch(root.innerHTML,/play-monster|play-baggage/);
  for(const [id] of preschoolMissions93){
   if(id==='snail'){root.click('play-snail');assert.match(root.innerHTML,/Wejdź do ogrodu/);root.click('catalog');continue;}
   const t=start(id,'P');
   if(id==='dino'){
    root.click('pause');choose(t);root.click('drop');
    assert.doesNotMatch(root.innerHTML,/data-mission93="next"/);
    root.click('resume');choose(t);root.click('drop');
   }
   if(id==='rail'){
    const index=t.options.findIndex(c=>c.value===t.answer);
    const target={dataset:{mission93:'wagon-'+index},closest:sel=>sel.includes('wagon-')?target:null};
    drag('piece','rail-0',target);
    assert.doesNotMatch(root.innerHTML,/data-mission93="next"/);
    drag('piece','rail-'+index,target);
   }
   if(id==='camera')t.options.forEach((item,i)=>{if(item.value===t.answer)root.click('pick-'+i);});
   if(id==='bubble'){
    played.length=0;
    for(const n of t.needed)root.click('pick-'+t.options.findIndex(c=>c.value===n));
    assert.deepEqual(played.slice(0,5),[0,1,2,3,4]);
   }
   if(id==='closet')for(const [i,top] of t.tops.entries()){root.click('top-'+i);root.click('bottom-'+t.bottoms.findIndex(c=>c.value===top.value));}
   if(id==='cookies'){
    root.click('reveal');assert.equal([...timeouts.values()][0].ms,2600);
    const [key,pending]=[...timeouts.entries()][0];timeouts.delete(key);pending.fn();
    choose(t);
   }
   success();root.click('catalog');
  }

  mount('P',true);
  assert.match(root.innerHTML,/Mały Kapitan/);
  assert.doesNotMatch(root.innerHTML,/Klasyczny lot|play-monster/);
  for(const [id] of captainMissions93){
   const t=start(id,'P');
   if(id==='baggage')t.options.forEach((item,i)=>{if(item.value===t.answer){
    const hold={closest:selector=>selector==='[data-sq93-drop]'?hold:null};
    drag('piece',i,hold);
   }});
   if(id==='takeoff')root.click('lever');
   if(['takeoff','airballs'].includes(id))passGates(t.needed);
   if(['feeder','landing','seasons'].includes(id)){root.click('lane-'+t.options.findIndex(c=>c.value===t.answer));root.click('fly');}
   if(id==='parcels'){root.click('zone-'+t.options.findIndex(c=>c.value===t.answer));root.click('dispatch');}
   success();root.click('catalog');
  }
  mount(2,true,true);
  assert.match(root.innerHTML,/As Przestworzy/);
  assert.match(root.innerHTML,/Klasyczny lot Quinjetem/);
  for(const [id] of aceMissions93){
   const t=start(id,2);
   if(id==='engine')code(t.answer);
   if(id==='spelling'||id==='fuel'){root.click('lane-'+t.options.findIndex(c=>c.value===t.answer));root.click('fly');}
   if(id==='radar'||id==='airport')choose(t);
   if(id==='cargo'){root.click('crate');root.click('hangar-'+t.options.findIndex(c=>c.value===t.answer));}
   if(id==='radio'){
    assert.equal(spoken.at(-1)[1],'en-US');
    root.click('dir-'+t.direction);
    if(t.color)root.click('color-'+t.color);
    root.click('manoeuvre');
   }
   success();root.click('catalog');
  }
 }finally{
  mountMissions93(null);
  [globalThis.setTimeout,globalThis.clearTimeout,globalThis.setInterval,globalThis.clearInterval,Date.now,Math.random]=originals;
 }
 const assets=vm.runInNewContext(fs.readFileSync(url('../sw.js'),'utf8')+'\nASSETS',{self:{addEventListener(){}}});
 for(const f of assets)assert.ok(fs.existsSync(new URL(f.split('?')[0],url('..'))),f);
 console.log('PASS V93 – 28 misji, grupy wiekowe, wejście przez Hangar, odsłuch, obrót i dostęp offline.');
})().catch(error=>{console.error(error);process.exitCode=1;});
