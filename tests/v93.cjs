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
 const {drawHeroHands}=await import(url('hero-hands85.js'));
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
 assert.doesNotMatch(walk,/data-walk-power/);
 const hulkWalk=baseWalkMarkup(spider,'test','hulk',112,'');
 assert.match(hulkWalk,/data-walk-power="-1" aria-label="Cios lewą pięścią"/);
 assert.match(hulkWalk,/data-walk-power="1" aria-label="Cios prawą pięścią"/);
 const ironWalk=baseWalkMarkup(spider,'test','iron',114,'');
 assert.match(ironWalk,/class="hq112-power-controls hq114-laser-controls"[^>]*>\s*<button[^>]*data-walk-power="1" aria-label="Strzel laserem z prawej dłoni"/);
 assert.doesNotMatch(baseWalkMarkup(spider,'test','captain',112,''),/data-walk-power/);
 const hand={naturalWidth:621,naturalHeight:627},fist={naturalWidth:289,naturalHeight:420};
 const handsFrame=(hero,power)=>{
  const poses=[],images=[],beam=[],beamStart=[],glow=[];
  let matrix;
  const ctx={
   clearRect(){},save(){},restore(){},beginPath(){},fill(){},stroke(){},
   transform(a,b,c,d,e,f){matrix={a,b,c,d,e,f};},
   rotate(turn){
    const {a,b,c,d,e,f}=matrix,cos=Math.cos(turn),sin=Math.sin(turn);
    matrix={a:a*cos+c*sin,b:b*cos+d*sin,c:c*cos-a*sin,d:d*cos-b*sin,e,f};
   },
   getTransform(){return matrix;},
   drawImage(image){images.push(image);poses.push(matrix);},
   arc(x,y){glow.push([x,y]);},moveTo(x,y){beamStart.push([x,y]);},
   lineTo(x,y){beam.push([x,y]);}
  };
  drawHeroHands(ctx,{width:360,height:740},hero,0,false,hand,null,power,fist);
  return {poses,images,beam,beamStart,glow};
 };
 for(const side of [-1,1]){
  const frame=handsFrame('hulk',{kind:'punch',side,age:160});
  assert.deepEqual(frame.images,[fist,fist]);
  assert.ok(frame.poses[(side+1)/2].d>1);
  assert.equal(frame.poses[(1-side)/2].d,1);
 }
 assert.deepEqual(handsFrame('hulk',null).images,[hand,hand]);
 assert.equal(handsFrame('iron',{kind:'laser',side:1,age:110}).beam.length,0);
 const idle=handsFrame('iron',null);
 for(const age of [65,173,240,410,590]){
  const blast=handsFrame('iron',{kind:'laser',side:1,age});
  assert.deepEqual(blast.poses[0],idle.poses[0]);
  const {a,b,c,d}=blast.poses[1];
  assert.ok(Math.abs(Math.hypot(a,b)-Math.hypot(c,d))<1e-10,'right glove keeps its proportions');
  assert.ok(Math.abs(a*c+b*d)<1e-10,'right glove is never sheared');
  if(age===240){
   assert.ok(Math.hypot(a,b)>1);
   assert.deepEqual(blast.beamStart,blast.glow);
   assert.deepEqual(blast.beam,[[180,740*.37]]);
  }
 }

 const {app,data,mission}=require('./legacy/test.cjs');
 const view=app(),account=data();
 view.api.set(account,{role:'child',who:'patryk'});
 await view.api.handle('child:home');
 assert.equal((view.root.innerHTML.match(/class="academy104-destination"/g)||[]).length,6);
 assert.equal((view.root.innerHTML.match(/data-action="child:academy"/g)||[]).length,1);
 assert.match(view.root.innerHTML,/data-destination="books"[\s\S]*?aria-label="Książki">\s*<span[^>]*>\s*<img[^>]*interface117\/nav-books\.webp/);
 assert.match(view.root.innerHTML,/data-speak="Książki"/);
 for(const icon of ['missions','books','training','explorers','mentor','headquarters']){
  assert.ok(view.root.innerHTML.includes('assets/interface117/nav-'+icon+'.webp'),icon);
 }
 const header=markup=>markup.match(/<header class="academy102-header">[\s\S]*?<\/header>/)?.[0];
 const dashboardHeader=header(view.root.innerHTML);
 assert.match(dashboardHeader,/Akademia Patryk/);
 assert.match(dashboardHeader,/interface106\/masthead\.webp/);
 for(const page of ['missions-board','books','academy','mentor','learn','base']){
  await view.api.handle('child:'+page);
  if(page==='learn')assert.match(view.root.innerHTML,/<header class="academy119-subject-header">[\s\S]*?data-action="child:home" aria-label="Wróć"/,page);
  else assert.match(view.root.innerHTML,/<header class="academy116-top">[\s\S]*?data-action="child:home"[\s\S]*?>←<\/span> Wróć<\/button>/,page);
  assert.doesNotMatch(view.root.innerHTML,/class="academy102-header"|class="academy102-destinations|class="academy102-player"/,page);
  await view.api.handle('child:home');
  assert.equal(header(view.root.innerHTML),dashboardHeader,page);
  assert.equal((view.root.innerHTML.match(/class="academy104-destination"/g)||[]).length,6,page);
  await view.api.handle('child:'+page);
  if(page==='mentor'){
   for(const portrait of ['hero-pawel','hero-patryk'])assert.match(view.root.innerHTML,new RegExp(`class="mentor-choice-portrait" src="assets/interface108/${portrait}\\.webp"`));
   const current=account.profiles.patryk.mentor==='fun'?'hero-patryk':'hero-pawel';
   assert.match(view.root.innerHTML,new RegExp(`class="mentor-figure" src="assets/interface108/${current}\\.webp"`));
   await view.api.handle('mentor:choose:fun');
   assert.match(view.root.innerHTML,/class="mentor-figure" src="assets\/interface108\/hero-patryk\.webp"/);
  }
  if(page==='learn'){
   assert.match(view.root.innerHTML,/data-interface119="subjects"/);
   assert.equal((view.root.innerHTML.match(/data-action="mic"/g)||[]).length,0);
   assert.doesNotMatch(view.root.innerHTML,/training:subject:Przedszkole/);
   for(const subject of ['Chemia','Fizyka']){
    assert.match(view.root.innerHTML,new RegExp(`class="academy119-subject"[^>]* disabled aria-label="${subject} — w przygotowaniu"`));
    assert.ok(!view.root.innerHTML.includes('training:subject:'+subject));
   }
  }
 }
 let clicks=0;
 const audioParam={setValueAtTime(){},exponentialRampToValueAtTime(){}};
 await view.api.handle('child:home');
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
 assert.match(schoolView.root.innerHTML,/aria-label="Trening">\s*<span[^>]*>\s*<img[^>]*interface117\/nav-training\.webp/);
 assert.match(schoolView.root.innerHTML,/data-speak="Książki"/);
 assert.equal((schoolView.root.innerHTML.match(/academy107-wide-face/g)||[]).length,6);
 await schoolView.api.handle('child:learn');
 assert.match(schoolView.root.innerHTML,/assets\/interface119\/subjects\.webp/);
 assert.match(schoolView.root.innerHTML,/data-theme="matematyka"/);
 assert.match(schoolView.root.innerHTML,/data-theme="przyroda"/);
 schoolView.ctx.window.AudioContext=view.ctx.window.AudioContext;
 const mathCard={
  dataset:{action:'training:subject:Matematyka',theme:'matematyka'},isConnected:true,
  classList:new Set(['tr72-subject-card']),
  closest(selector){return ['button,summary','[data-action]'].includes(selector)?this:null;},
  matches(){return false;}
 };
 mathCard.classList.contains=mathCard.classList.has;
 for(const listener of schoolView.listeners.click)listener({target:mathCard,detail:1,isTrusted:true});
 assert.equal(clicks,2);
 assert.ok(mathCard.classList.has('tr72-selected'));
 assert.match(schoolView.root.innerHTML,/data-v77-step="subject"/);
 [...schoolView.timers.values()].find(timer=>timer.ms===1150).fn();
 assert.match(schoolView.root.innerHTML,/data-v77-step="source"/);
 for(const subject of ['Matematyka','Wiedza ogólna']){
  await schoolView.api.handle('training:subject:'+encodeURIComponent(subject));
  assert.match(schoolView.root.innerHTML,/data-action="training:back:subject" aria-label="Wróć"/);
  assert.match(schoolView.root.innerHTML,/data-action="training:source:books"/);
  assert.match(schoolView.root.innerHTML,/data-action="training:source:outside"/);
  assert.doesNotMatch(schoolView.root.innerHTML,/data-action="training:(mixed:start|catalog|assessment)"/);
  assert.match(schoolView.root.innerHTML,/interface117\/shelf\.webp/);
  assert.match(schoolView.root.innerHTML,/interface117\/planet\.webp/);
 }
 await schoolView.api.handle('training:source:outside');
 assert.match(schoolView.root.innerHTML,/data-v77-step="train-options"/);
 assert.equal((schoolView.root.innerHTML.match(/data-action="mic"/g)||[]).length,1);
 assert.match(schoolView.root.innerHTML,/data-action="training:assessment"/);
 assert.match(schoolView.root.innerHTML,/data-action="training:mixed:start"/);
 assert.ok(schoolView.root.innerHTML.includes('assets/interface119/modes.webp'));
 assert.match(schoolView.root.innerHTML,/academy119-illustration/);
 schoolView.ctx.window.matchMedia=()=>({matches:false});
 const gameTile={
  dataset:{action:'training:catalog'},isConnected:true,
  closest(selector){return ['button,summary','[data-action]'].includes(selector)?this:null;},
  matches(selector){return selector.includes('.academy115-flow button')||selector.includes('.academy115-choose');}
 };
 for(const listener of schoolView.listeners.click)listener({target:gameTile,detail:1,isTrusted:true});
 assert.equal(clicks,3);
 assert.equal(gameTile.dataset.academyPressed,'true');
 assert.match(schoolView.root.innerHTML,/class="academy119-page academy119-options/);
 [...schoolView.timers.values()].find(timer=>timer.ms===840).fn();
 assert.match(schoolView.root.innerHTML,/data-v77-step="catalog"/);
 await schoolView.api.handle('training:back:train-options');
 await schoolView.api.handle('training:mixed:start');
 assert.match(schoolView.root.innerHTML,/data-v77-step="mixed"/);
 assert.match(schoolView.root.innerHTML,/Spoza książki/);
 await schoolView.api.handle('training:back:source');
 await schoolView.api.handle('training:source:books');
 assert.match(schoolView.root.innerHTML,/data-v77-step="range"/);
 await schoolView.api.handle('training:range:all');
 assert.match(schoolView.root.innerHTML,/data-v77-step="train-options"/);
 assert.match(schoolView.root.innerHTML,/Materiał z książek · 1 strona/);
 await schoolView.api.handle('training:back:subject');
 assert.match(schoolView.root.innerHTML,/data-interface119="subjects"/);
 await schoolView.api.handle('child:missions-board');
 assert.match(schoolView.root.innerHTML,/interface117\/nav-missions\.webp/);
 for(const icon of ['alert','school','home']){
  assert.ok(schoolView.root.innerHTML.includes('interface117/'+icon+'.webp'),icon);
 }

 await schoolView.api.handle('child:home');
 assert.match(schoolView.root.innerHTML,/interface113\/shield\.webp/);

 const selectedPage={id:'p1',bookId:'math',number:4,text:'3 + 5 = 8. 2 + 4 = 6. 7 - 4 = 3.'};
 const excludedPage={id:'p2',bookId:'math',number:5,text:'50 + 30 = 80.'};
 const textbook={id:'math',title:'Matematyka',subject:'Matematyka',child:'pawel'};
 const materialLaunch={pageIds:['p1'],strictMaterial:true,subject:'Matematyka'};
 for(const options of [{mode:'game'},{mode:'game',chooseMaterialGame:true},{mode:'test',assessment:true}]){
  const view=mission({books:[textbook],pages:[selectedPage,excludedPage],launch:{...materialLaunch,...options}});
  await view.api.start();
  if(options.chooseMaterialGame){
   assert.match(view.root.innerHTML,/Wybierz grę/);
   assert.match(view.root.innerHTML,/data-mg="material-game:write"/);
   await view.root.listeners.click({target:{closest:()=>({dataset:{mg:'material-game:write'}})}});
  }
  const deck=view.api.tasks();
  assert.ok(deck.length>1);
  assert.ok(deck.every(t=>t.sourcePageId==='p1'));
  assert.ok(options.chooseMaterialGame?deck.every(t=>t.type==='write'):true);
  if(options.assessment){
   assert.doesNotMatch(view.root.innerHTML,/mg-tutor|data-mg="hint"/);
   view.api.answer('9999');
   assert.equal(view.api.answered(),true);
   assert.match(view.root.innerHTML,/Odpowiedź zapisana/);
   assert.doesNotMatch(view.root.innerHTML,/Poprawna odpowiedź|mg-tutor|Błędna odpowiedź|data-mg="written"/);
   await view.api.tutorAsk('Podaj odpowiedź');
   assert.equal(view.api.tutorMessages().length,0);
  }else if(!options.chooseMaterialGame){
   assert.ok(deck.some(t=>t.game80||t.visual77));
   assert.ok(deck.some(t=>t.type==='write'));
  }
 }
 const outside=mission({launch:{mode:'test',assessment:true,tasks:[
  {type:'write',question:'Oblicz: 2 + 3',answer:'5',options:[],outsideSubject95:'matematyka',hint:'Podpowiedź'},
  {type:'choice',question:'Co rośnie w lesie?',answer:'drzewa',options:['drzewa','samochody'],outsideSubject95:'przyroda'}
 ]}});
 await outside.api.start();
 assert.equal(outside.api.tasks().length,2);
 outside.api.answer('5');
 assert.equal(outside.api.score(),1);
 assert.doesNotMatch(outside.root.innerHTML,/mg-tutor|Podpowiedź|Brawo/);

 await schoolView.api.handle('child:base');
 for(const key of ['panther','hawkeye','gamora','groot','groot-lady']){
  assert.ok(schoolView.root.innerHTML.includes('data-action="hero:set:pawel:'+key+'"'));
  assert.ok(schoolView.root.innerHTML.includes('assets/interface116/'+key+'.webp'));
  assert.ok(fs.existsSync(url('interface116/'+key+'.webp')));
 }
 for(const key of ['widow','wanda']){
  assert.ok(schoolView.root.innerHTML.includes('data-action="hero:set:pawel:'+key+'"'));
  assert.ok(schoolView.root.innerHTML.includes('assets/interface117/'+key+'.webp'));
  assert.ok(fs.existsSync(url('interface117/'+key+'.webp')));
 }
 const heroProfiles=app(),updatedProfiles=data();
 updatedProfiles.profiles.pawel.hero='groot-lady';
 updatedProfiles.profiles.patryk.hero='hawkeye';
 heroProfiles.api.set(updatedProfiles,{role:''});
 heroProfiles.api.render();
 assert.match(heroProfiles.root.innerHTML,/data-action="enter:pawel">\s*<img[^>]*interface116\/groot-lady\.webp/);
 assert.match(heroProfiles.root.innerHTML,/data-action="enter:patryk">\s*<img[^>]*interface116\/hawkeye\.webp/);
 updatedProfiles.profiles.pawel.hero='wanda';
 updatedProfiles.profiles.patryk.hero='widow';
 heroProfiles.api.set(updatedProfiles,{role:''});
 heroProfiles.api.render();
 assert.match(heroProfiles.root.innerHTML,/data-action="enter:pawel">\s*<img[^>]*interface117\/wanda\.webp/);
 assert.match(heroProfiles.root.innerHTML,/data-action="enter:patryk">\s*<img[^>]*interface117\/widow\.webp/);
 await schoolView.api.handle('hq:wallet');
 assert.match(schoolView.root.innerHTML,/class="academy116-back alt" data-action="hq:close"/);
 assert.doesNotMatch(schoolView.root.innerHTML,/id="hq84-title"/);
 await schoolView.api.handle('hq:close');
 assert.match(schoolView.root.innerHTML,/id="hq84-title"/);

 const pinView=app(),pinAccount=data();
 pinAccount.parentPin='1111';
 pinAccount.profiles.pawel.hero='hulk';
 pinView.api.set(pinAccount,{role:''});
 pinView.api.render();
 assert.match(pinView.root.innerHTML,/class="academy107-entry"/);
 assert.match(pinView.root.innerHTML,/academy107-pair/);
 assert.match(pinView.root.innerHTML,/data-action="enter:pawel"[\s\S]*data-action="enter:patryk"/);
 assert.match(pinView.root.innerHTML,/class="academy107-profile-card academy107-profile-pawel" data-action="enter:pawel">\s*<img[^>]*assets\/interface119\/hulk\.svg/);
 assert.match(pinView.root.innerHTML,/assets\/interface108\/hero-patryk\.webp/);
 assert.match(pinView.root.innerHTML,/data-action="enter:admin" aria-label="Centrum dowodzenia mamy"><\/button>/);
 assert.match(pinView.root.innerHTML,/data-action="academy:update" aria-label="Aktualizuj Akademię"><\/button>/);
 const choices=pinView.ctx.academy102Choices();
 assert.match(choices,/data-action="hq:view:classic"[\s\S]*hq\/overview\.webp[\s\S]*<\/span>Widok klasyczny<\/span>[\s\S]*data-action="hq:view:walk"[\s\S]*hq\/walk\.webp[\s\S]*>Spacer po bazie<\/span>/);
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
  const art=hero==='hulk'?'interface119/hulk\\.svg':`art/${hero}\\.webp`;
  assert.match(pinView.root.innerHTML,new RegExp(`hero:set:pawel:${hero}"[^>]*><img[^>]*assets/${art}`));
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
