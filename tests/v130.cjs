const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),vm=require('node:vm');
const {fixture,context}=require('./hangar130-dom.cjs');
const root=path.resolve(__dirname,'..'),url=n=>require('node:url').pathToFileURL(path.join(root,'assets',n));
Object.defineProperty(global,'performance',{value:{now:()=>global.__testTime130||0},configurable:true});
(async()=>{
 const d=await import(url('hangar130-data.js')),flight=await import(url('hangar130-flight.js')),bags=await import(url('hangar130-baggage.js')),balloons=await import(url('hangar130-balloons.js'));
 const makeProgress=(stored={})=>{let p=stored,writes=0;const map=new Map();return {...d.createProgress130({getProgress:()=>p,onProgress:next=>{p=next;writes++;},storage:{getItem:k=>map.get(k),setItem:(k,v)=>map.set(k,v)}}),get writes(){return writes;}};};
 assert.equal(d.tasks130('takeoff','young').length,11);assert.equal(d.tasks130('takeoff','captain')[6].answer,7);assert.equal(d.tasks130('takeoff','captain')[7].answer,6);assert.equal(d.tasks130('takeoff','captain')[10].answer,100);
 for(const answer of [0,1,7,48,100])for(const count of [2,3]){const choices=d.choices130(answer,count);assert.equal(new Set(choices).size,count);assert.equal(choices.filter(v=>v===answer).length,1);}
 assert(d.ringPass130(.5,.5,.08));assert(!d.ringPass130(.565,.5,.08));assert(!d.ringPass130(.69,.5,.08));
 assert(d.balloonHit130(.5,.465,{x:.5,y:.5,w:.13,h:.25}));assert(!d.balloonHit130(.5,.625,{x:.5,y:.5,w:.13,h:.25}));assert(d.cloudHit130(.5,.5,{x:.5,y:.5}));assert(!d.cloudHit130(.5,.7,{x:.5,y:.5}));
 let testRounds=0;
 for(const mode of ['young','captain']){
  const p=makeProgress(),c=context('engine',mode,p),controller=flight.mountEngine130(c),tasks=d.tasks130('engine',mode);
  c.click('digit:9');c.click('digit:9');c.click('check');c.click('check');assert.equal(controller.snapshot().digits,'99','Wrong code remains editable');assert.equal(c.root.querySelectorAll('.is-lit').length,0);c.click('hint');assert(c.root.querySelector('[data-h130-status]').textContent.length);
  c.key('Backspace');c.key('Backspace');
  for(let i=0;i<6;i++){
   for(const digit of String(tasks[i].answer))c.key(digit);c.key('Enter');
   assert.equal(controller.snapshot().round,i);assert.equal(c.root.querySelectorAll('.is-lit').length,i+1);assert.equal(p.read()['engine:'+mode].round,i+1);
   c.click('next-code');testRounds++;
  }
  c.click('skip');assert.equal(c.completion.label,'Pilot matematyczny');assert(p.read()['engine:'+mode].complete);assert.equal(p.complete('engine',mode),false,'No duplicate badge');
  const resumed=context('engine',mode,makeProgress({['engine:'+mode]:{round:3}}));assert.equal(flight.mountEngine130(resumed).snapshot().round,3);
  const ready=context('engine',mode,makeProgress({['engine:'+mode]:{round:6}}));assert(flight.mountEngine130(ready).snapshot().solved);assert.equal(ready.root.querySelectorAll('.is-lit').length,6);ready.click('next-code');ready.advance(4200);assert(ready.completion);
 }
 let flights=0;
 for(const mode of ['young','captain']){
  const p=makeProgress(),c=context('baggage',mode,p),controller=bags.mountBaggage130(c);
  for(let f=0;f<5;f++){
   assert.equal(controller.snapshot().flight,f);c.click('load');let {task}=controller.snapshot();
   const wrong=task.pool.findIndex((_,i)=>!d.bagAllowed130(task,[],i));if(wrong>=0){c.click('bag:'+wrong);c.click('hold:0');assert.equal(controller.snapshot().placed.length,0);}
   const chosen=[];while(chosen.length<task.count){const i=task.pool.findIndex((_,i)=>d.bagAllowed130(task,chosen,i));if(i<0)break;chosen.push({index:i,hold:0});}
   assert.equal(chosen.length,task.count);
   let counts=[...task.occupied];
   for(let n=0;n<chosen.length;n++){
    const h=task.rule==='equal'?n%task.holds:Math.max(0,counts.findIndex((v,i)=>v<task.capacity[i]));
    c.click('bag:'+chosen[n].index);c.click('hold:'+h);c.advance(250);counts[h]++;
   }
   assert(d.baggageValid130(task,controller.snapshot().placed));
   c.click('confirm-bags');c.advance(700);assert.equal(controller.snapshot().phase,'cabin');
   const first=task.people[0],badSeat=task.seats.find(s=>s.id!==first.target);
   c.click('person:'+first.id);c.click('seat:'+badSeat.id);assert.equal(Object.keys(controller.snapshot().people).length,0);
   for(const person of task.people){c.click('person:'+person.id);c.click('seat:'+person.target);c.advance(250);}
   assert(d.seatsValid130(task,controller.snapshot().people));assert.equal(c.root.querySelectorAll('.h130-belt').length,task.people.length);
   c.click('depart');c.click('skip');assert(p.read().stamps[mode+':'+f]);assert.equal(p.stamp(mode,f),false);assert.equal(p.unlocked(),Math.min(4,f+1));c.click('continue');flights++;
  }
  assert(c.root.textContent.includes('Pięć lotów ukończonych'));assert(p.read()['baggage:'+mode].complete);
 }
 // Equal loading is editable before confirmation, and a loaded case can be moved.
 {
  const c=context('baggage','captain',makeProgress({stamps:{'young:0':true}})),controller=bags.mountBaggage130(c);c.click('load');c.click('bag:0');c.click('hold:0');c.advance(250);c.click('bag:0');c.click('hold:1');c.advance(250);assert.equal(controller.snapshot().placed[0].hold,1);c.click('unload:0');assert.equal(controller.snapshot().placed.length,0);
 }
 {
  const c=context('baggage','young',makeProgress()),controller=bags.mountBaggage130(c);c.click('difficulty:captain');assert.equal(controller.snapshot().task.count,6);c.click('difficulty:young');assert.equal(controller.snapshot().task.count,3);
 }
 // Drag-and-drop uses the release point, and cancellation does not place anything.
 {
  const c=context('baggage','young',makeProgress()),controller=bags.mountBaggage130(c);c.click('load');const el=c.root.querySelector('[data-bag-drag="0"]');c.doc.under=c.root.querySelector('[data-hold="0"]');
  c.event('pointerdown',el,{clientX:70,clientY:360});c.event('pointermove',el,{clientX:200,clientY:150});c.event('pointerup',el,{clientX:200,clientY:150});c.advance(250);assert.equal(controller.snapshot().placed.length,1);
  c.advance(500);const next=c.root.querySelector('[data-bag-drag="1"]');c.event('pointerdown',next,{clientX:80,clientY:360});c.event('pointermove',next,{clientX:210,clientY:150});c.event('pointercancel',next,{clientX:210,clientY:150});c.advance(250);assert.equal(controller.snapshot().placed.length,1);
 }
 // All 22 gates: waiting, correct opening, reaction lock and final skip.
 for(const mode of ['young','captain']){
  const p=makeProgress(),c=context('takeoff',mode,p),controller=flight.mountRings130(c);c.click('lever');c.advance(1700);
  c.advance(10000);assert.equal(controller.snapshot().approach,0,'No approach before steering');
  for(let i=0;i<11;i++){
   const snapshot=controller.snapshot(),target=snapshot.gates.find(g=>g.value===d.tasks130('takeoff',mode)[i].answer),board=c.root.querySelector('[data-h130-board]');
   c.event('pointerdown',board,{clientX:target.x*800,clientY:320});c.event('pointerup',board,{clientX:target.x*800,clientY:320});c.advance(6800);
   c.advance(1300);assert.equal(p.read()['takeoff:'+mode].round,i+1);testRounds++;
  }
  c.click('skip');assert.equal(c.completion.label,'Mistrz obręczy · 11 / 11');
 }
 // Wrong gate and a miss keep the same arithmetic task; a second wrong offers a hint.
 {
  const c=context('takeoff','young',makeProgress()),controller=flight.mountRings130(c);c.click('lever');c.advance(1700);
  for(let i=0;i<2;i++){const target=controller.snapshot().gates.find(g=>g.value!==3),board=c.root.querySelector('[data-h130-board]');c.event('pointerdown',board,{clientX:target.x*800,clientY:300});c.event('pointerup',board);c.advance(8000);assert.equal(controller.snapshot().round,0);}
  assert(c.root.querySelector('[data-h130="hint"]'));const board=c.root.querySelector('[data-h130-board]');c.event('pointerdown',board,{clientX:40,clientY:300});c.event('pointerup',board);c.advance(8000);assert.equal(controller.snapshot().round,0);
 }
 function aimBalloon(c,index){const board=c.root.querySelector('[data-h130-board]');const clientY=(.155+index*.28)*450;c.event('pointerdown',board,{clientX:130,clientY});c.event('pointerup',board);c.advance(400);}
 let balloonRounds=0;
 for(const mode of ['young','captain']){
  const p=makeProgress(),c=context('airballs',mode,p),controller=balloons.mountBalloons130(c);
  for(let i=0;i<6;i++){
   const correct=controller.snapshot().balloons.findIndex(b=>b.value===d.tasks130('airballs',mode)[i].answer);aimBalloon(c,correct);c.click('fire');
   assert(controller.snapshot().bullet,'A visible projectile must leave the nose');
   c.advance(1800);assert.equal(p.read()['airballs:'+mode].round,i+1);balloonRounds++;
  }
  assert(c.completion.label.includes('Slalom ukończony'));
 }
 {
  const p=makeProgress(),c=context('airballs','young',p),controller=balloons.mountBalloons130(c);const wrong=controller.snapshot().balloons.findIndex(b=>b.value!==1);aimBalloon(c,wrong);c.click('fire');
  let sawCounter=false;for(let i=0;i<200;i++){c.advance(16);if(controller.snapshot().counter)sawCounter=true;if(controller.snapshot().phase==='falling')break;}
  assert(sawCounter,'Wrong balloon returns a separate reversed projectile');assert.equal(controller.snapshot().phase,'falling');assert(c.root.querySelector('[data-h130="fire"]').disabled);assert(controller.snapshot().balloons.every(b=>b.alive),'Wrong balloon remains');
  c.advance(2500);assert.equal(controller.snapshot().phase,'failed');assert(controller.snapshot().y>1);c.click('retry');assert.equal(controller.snapshot().round,0);assert.equal(controller.snapshot().phase,'play');
 }
 {
  const c=context('airballs','young',makeProgress()),controller=balloons.mountBalloons130(c),board=c.root.querySelector('[data-h130-board]');c.event('pointerdown',board,{clientX:120,clientY:.25*450});c.event('pointerup',board);
  for(let i=0;i<700&&controller.snapshot().phase==='play';i++)c.advance(16);
  assert.equal(controller.snapshot().phase,'falling','Moving cloud can actually reach the plane');assert.equal(c.root.querySelector('.h130-lightning').style.opacity,'1');
 }
 // Full resource and release check, including original bytes and deleted paths.
 const assets=JSON.parse(fs.readFileSync(path.join(root,'scripts/hangar130-assets.json')));assert.equal(assets.length,47);
 for(const a of assets){const bytes=fs.readFileSync(path.join(root,a.runtime));assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),a.sha256);assert.deepEqual(bytes,fs.readFileSync(path.join(root,'../hangar130_sources',a.source)));}
 // Exercise the actual menu wrapper and its lifecycle, not just isolated game rules.
 {
  const frames=new Set();let frameID=0,exit=0,classic=0,loads=[];
  global.requestAnimationFrame=()=>{frames.add(++frameID);return frameID;};global.cancelAnimationFrame=id=>frames.delete(id);global.matchMedia=()=>({matches:false});
  global.Image=class {set src(value){assert(fs.existsSync(path.join(root,value)),value);loads.push(value);queueMicrotask(()=>this.onload?.());}async decode(){}};
  const {mountHangar130}=await import(url('hangar130.js'));
  for(const grade of ['P','2']){
   const f=fixture(),stored={stamps:{'young:0':true},'engine:captain':{round:2}};
   const ui=mountHangar130(f.root,{grade,profileKey:'navigation-'+grade,getProgress:()=>stored,storage:{getItem(){return null;},setItem(){}},onExit:()=>exit++,onClassic:()=>classic++});
   assert(f.root.querySelector('.h130-panorama'));
   assert.equal(f.root.querySelector('.h130-grid').querySelectorAll('button').length,4);
   assert(!f.root.querySelector('[data-h130-board]'),'Re-entering airplane never starts a saved game');
   for(const game of d.gameIds130){f.click('game:'+game);assert(f.root.querySelector('.h130-modes'));f.click('play:young');await new Promise(setImmediate);assert.equal(f.root.dataset.f95Screen,'play');f.click('menu');assert(f.root.querySelector('.h130-panorama'));assert.equal(frames.size,0,'Returning to cockpit cancels animation loops');}
   f.click('exit');assert.equal(f.root.querySelector('.h130-panorama')!==null,true);ui.stop();
  }
  assert.equal(exit,2);assert.equal(classic,0);assert(loads.length>=38);
  const f=fixture();mountHangar130(f.root,{grade:'P',preview:true,legacy:true,onExit:()=>exit++});f.click('game:feeder');assert(f.root.querySelector('[data-f95-action="start"]'));const control=f.root.querySelector('[data-f95-action="catalog"]');f.event('click',control);assert(f.root.querySelector('.h130-panorama'),'Existing preview missions also return to the new cockpit');
 }
 // App integration: both explicit exit and dialog close return to the hangar.
 {
  const app=fs.readFileSync(path.join(root,'assets/app.js'),'utf8'),start=app.indexOf('async function hqAction84('),code=app.slice(start,app.indexOf('\n}',start)+2);
  for(const view of ['walk','classic'])for(const action of ['hq:disembark','hq:close']){
   const calls=[],env={role:'child',who:'pawel',profile:()=>({grade:'2'}),hqViews84:new Map([['pawel',view]]),hqPanel84:'cockpit',hqShow84:panel=>calls.push(['show',panel]),openWalkRoom87:(id,room)=>calls.push(['room',room])};
   vm.createContext(env);await vm.runInContext(code+'\nhqAction84("'+action+'")',env);
   assert.deepEqual(calls,view==='walk'?[['room','hangar'],['show',undefined]]:[['show','hangar']]);
  }
 }
 const sw=vm.runInNewContext(fs.readFileSync(path.join(root,'sw.js'))+'\n({CACHE,ASSETS})',{self:{addEventListener(){}}});assert.equal(sw.CACHE,'academy-v130');
 for(const entry of sw.ASSETS)assert(fs.existsSync(path.join(root,entry.split('?')[0])),entry);
 for(const a of assets)assert(sw.ASSETS.includes('./'+a.runtime));
 const removed=JSON.parse(fs.readFileSync(path.join(root,'scripts/hangar130-removed.json')));for(const a of removed)assert(!fs.existsSync(path.join(root,a.path)),a.path);
 console.log(`PASS V130: ${testRounds} engine/ring rounds, ${balloonRounds} balloon rounds, ${flights} complete boarding flights in both modes; countershot/cloud/fall/retry, wrong answers, hints, editable holds, drag/cancel, stamps/replay/resume; real menu lifecycle and app exit routes; 47 byte-identical assets and ${removed.length} deleted files.`);
})().catch(e=>{console.error(e);process.exitCode=1;});
