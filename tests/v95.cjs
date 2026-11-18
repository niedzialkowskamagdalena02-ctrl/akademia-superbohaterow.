const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const dir=path.resolve(__dirname,'..'),asset=name=>pathToFileURL(path.join(dir,'assets',name));

function fixture(){
 const nodes=new Map(),listeners={};
 const root={
  dataset:{},ownerDocument:{hidden:false},
  set innerHTML(html){this.content=html;nodes.clear();},
  get innerHTML(){return this.content||'';},
  addEventListener(name,fn,{signal}){listeners[name]=fn;signal.addEventListener('abort',()=>delete listeners[name]);},
  querySelector(key){
   if(!nodes.has(key))nodes.set(key,{
    ownerDocument:root.ownerDocument,dataset:{},classList:{add(){}},style:new Map(),
    querySelector:key=>root.querySelector(key),
    querySelectorAll:key=>root.querySelectorAll(key),
    insertAdjacentHTML(_position,html){root.content+=html;},getContext(){return null;}
   });
   nodes.get(key).style.setProperty=nodes.get(key).style.set;
   return nodes.get(key);
  },
  querySelectorAll(key){
   if(key==='[data-f95-object]')return [...this.innerHTML.matchAll(/data-f95-object data-f95-type/g)].map((_,i)=>this.querySelector(key+i));
   return [];
  },
  click(action){
   const target={dataset:{f95Action:action},closest:selector=>selector==='[data-f95-action]'?target:null};
   listeners.click({target,detail:0});
  }
 };
 return root;
}

(async()=>{
 const {mountHangar95,hangarDeck95}=await import(asset('hangar95.js'));
 const {captainMissions93,aceMissions93}=await import(asset('missions93-data.js'));
 const {boardingDeck97,boardingRoundCount97,boardingSlots98,boardingTransfer97,canBoard97}=await import(asset('hangar-boarding97.js'));
 const {trainingCatalog95,trainingSequence95,outsideDeck95}=await import(asset('training95.js'));

 const preset=Math.random;
 Math.random=()=>.32;
 const frameQueue=new Map();
 let serial=0,now=performance.now(),arrival;
 globalThis.matchMedia=()=>({matches:true});
 globalThis.requestAnimationFrame=fn=>{frameQueue.set(++serial,fn);return serial;};
 globalThis.cancelAnimationFrame=id=>frameQueue.delete(id);
 const timer=setTimeout;
 globalThis.setTimeout=(fn,ms)=>ms===720?(arrival=fn,0):timer(fn,ms);

 function frames(seconds){
  for(let i=0;i<seconds*10;i++){
   now+=100;
   const batch=[...frameQueue];
   for(const [id,fn] of batch){frameQueue.delete(id);fn(now);}
  }
 }

 const root=fixture(), spoken=[];
 const pass=label=>{
  const choices=[...root.innerHTML.matchAll(/data-f95-action="aim:(\d+)" class="flight95-target" aria-label="([^"]+)"/g)];
  const target=choices.find(item=>item[2]===String(label));
  assert.ok(target,'Brak celu '+label);
  root.click('aim:'+target[1]);
  frames(10);
 };
 const won=name=>assert.ok(root.querySelector(name==='baggage'?'.flight97-board':'.flight95-surface').dataset.f95Win,name);

 try{
  for(const [grade,missions] of [['P',captainMissions93],['2',aceMissions93]]){
   mountHangar95(root,{grade,legacy:grade==='P',speak:message=>spoken.push(message)});
   assert.equal((root.innerHTML.match(/data-f95-action="mission:/g)||[]).length,7);
   assert.equal((root.innerHTML.match(/class="flight95-card"/g)||[]).length,8);
   assert.match(root.innerHTML,/data-action="hq:flight"[^>]*>[\s\S]*?<i aria-hidden="true">8<\/i>/);
   assert.equal(/data-action="hq:flight" disabled/.test(root.innerHTML),grade!=='P');
   for(const [id] of missions){
    root.click('mission:'+id);
    assert.match(root.innerHTML,/Rozpocznij misję/);
    root.click('start');
    const t=hangarDeck95(id,grade)[0];
    assert.ok(t.prompt,id);
    if(id==='baggage'){
     function load(task){
      const board=root.querySelector('.flight97-board');
      const places=[...root.innerHTML.matchAll(/data-f95-seat="(\d+)"/g)].map(match=>+match[1]);
      assert.deepEqual(places,[0,1,2,3]);
      let seat=places.length-1;
      const wrong=task.options.findIndex(item=>!task.targets.includes(item.value));
      root.click('bag:'+wrong);root.click('seat:'+seat);
      assert.equal(root.querySelector('[data-f95-seat="'+seat+'"]').disabled,undefined);
      const left=[...task.targets];
      task.options.forEach((item,i)=>{
       const found=left.indexOf(item.value);
       if(found<0)return;
       left.splice(found,1);
       root.click('bag:'+i);root.click('seat:'+seat);
       const destination=root.querySelector('[data-f95-seat="'+seat+'"]');
       assert.equal(destination.disabled,true);
       assert.match(destination.innerHTML,task.seat?/data-f98-pose="sit"/:/flight96-case/);
       seat--;
      });
      assert.equal(left.length,0);
      assert.equal(root.querySelector('[data-f97-board-progress]').textContent,task.count+' / '+task.count);
      assert.equal(root.querySelector('.flight97-board'),board,'The board survives completion');
      assert.equal(root.innerHTML.match(/data-f95-seat="/g).length,boardingSlots98);
     }
     assert.match(root.innerHTML,/0 \/ 3/);
     assert.match(root.innerHTML,/pilot.webp/);
     load(t);
     assert.match(root.innerHTML,/Teraz czas na pasażerów/);
     root.click('next');
     assert.match(root.innerHTML,/0 \/ 1/);
     load(hangarDeck95(id,grade)[1]);
     assert.match(root.querySelector('[data-game-prompt]').textContent,/Bagaże i pasażerowie na pokładzie/);
    }
    if(id==='takeoff'){
     assert.match(root.innerHTML,/Pociągnij dźwignię/);
     const plane=root.querySelector('[data-f97-aircraft]');
     assert.equal(plane.style.get('--plane-y'),'60%');
     root.click('lever');
     const stage=root.querySelector('.flight97-takeoff');
     assert.equal(stage.dataset.f97Phase,'roll');
     frames(1);
     assert.notEqual(plane.style.get('--plane-y'),'60%');
     frames(.5);
     assert.equal(stage.dataset.f97Phase,'lift');
     frames(1.2);
     assert.equal(stage.dataset.f97Phase,'air');
     assert.match(root.querySelector('[data-game-prompt]').textContent,/cyfrą jeden/);
     root.click('aim:1'); frames(2);
     assert.equal(root.querySelector('[data-f97-board-progress]').textContent,'0 / 4');
     for(const i of [0,1,2,3]){
      root.click('aim:'+i);
      frames(3);
      assert.equal(root.querySelector('[data-f97-board-progress]').textContent,(i+1)+' / 4');
      assert.equal(root.querySelector('[data-f97-aircraft]'),plane);
     }
     assert.equal(stage.dataset.f97Phase,'done');
     assert.match(root.querySelector('[data-game-prompt]').textContent,/Wszystkie cyfry zaliczone/);
    }
    if(id==='airballs'){
     assert.doesNotMatch(root.innerHTML,/Odsłuchaj: Chmura burzowa|Odsłuchaj: [0-9]/);
     pass('Chmura burzowa');
     assert.match(root.innerHTML,/0 \/ 6/);
     for(const value of t.needed){
      if(value===5){
       assert.match(root.innerHTML,/Następna cyfra <strong>pięć<\/strong>/);
       root.click('read');
       assert.match(spoken.at(-1),/^Następna cyfra pięć\./);
      }
      pass(value);
     }
    }
    if(id==='feeder'){
     const rounds=hangarDeck95(id,grade);
     assert.equal(rounds.length,3);
     pass(t.options.find(item=>item.value!==t.answer).label);
     assert.match(root.innerHTML,/0 \/ 3/);
     rounds.forEach((round,index)=>{
      assert.match(root.innerHTML,/chick.webp/);
      pass(round.answer);
      assert.match(root.innerHTML,new RegExp((index+1)+' / 3'));
      assert.match(root.innerHTML,/flight96-grain/);
      if(index<rounds.length-1)root.click('next');
     });
     assert.match(root.innerHTML,/Ptaszek nakarmiony!/);
    }
    if(['landing','seasons','spelling','fuel'].includes(id))pass(t.options.find(item=>item.value===t.answer).label);
    if(id==='fuel')assert.equal(root.querySelector('[data-f95-fuel]').value,100);
    if(id==='parcels'){root.click('zone:'+t.options.findIndex(item=>item.value===t.answer));root.click('drop');}
    if(id==='engine'){for(const digit of String(t.answer))root.click('key:'+digit);root.click('key:✓');}
    if(id==='radar')root.click('radar:'+t.options.findIndex(item=>item.value===t.answer));
    if(id==='cargo'){
     for(const i of [0,1,2]){root.click('crate:'+i);root.click('load');}
     root.click('depart');root.click('hangar:'+t.options.findIndex(item=>item.value===t.answer));root.click('cargo-drop');
    }
    if(id==='radio'){root.click('dir:'+t.direction);if(t.color)root.click('island:'+t.color);}
    if(id==='airport'){root.click('arrive');arrival();root.click('reply:'+t.options.findIndex(item=>item.value===t.answer));}
    won(id);
    root.click('catalog');
    assert.equal(frameQueue.size,0,id);
   }
  }
 }finally{mountHangar95(null);Math.random=preset;globalThis.setTimeout=timer;}

 const rounds=Array.from({length:boardingRoundCount97},(_,i)=>boardingDeck97(i,()=>.32));
 assert.equal(new Set(rounds.map(([bags])=>bags.targets.join(''))).size,boardingRoundCount97);
 assert.deepEqual([...new Set(rounds.map(([,riders])=>riders.count))].sort(),[1,2,3,4]);
 assert.ok(rounds.some(([bags])=>bags.targets.join('')==='KMS'));
 const mixed=rounds.find(([,riders])=>riders.targets.join(' ')==='dog dog cat')[1];
 const dog=mixed.options.findIndex(item=>item.value==='dog');
 assert.ok(canBoard97(mixed,[{index:dog}],'dog'));
 assert.ok(!canBoard97(mixed,[{index:dog},{index:dog}],'dog'));
 assert.ok(canBoard97(mixed,[{index:dog},{index:dog}],'cat'));
 assert.ok(mixed.options.some(item=>item.value==='cat'));
 const poses=[], phases=[];
 const pet={dataset:{},style:{setProperty(){}}};
 const mover={
  style:{},setAttribute(){},querySelector(){return pet;},remove(){this.removed=true;},
  animate(frames,{duration}){
   poses.push(pet.dataset.f98Pose);
   phases.push({frames,duration});
   return {finished:Promise.resolve(),cancel(){}};
  }
 };
 const box=(left,top,width,height)=>({left,top,width,height,bottom:top+height});
 const source={dataset:{},getBoundingClientRect:()=>box(20,445,53,59)};
 const destination={getBoundingClientRect:()=>box(260,316,69,75)};
 const board={animate(){},getBoundingClientRect:()=>box(0,0,350,560),append(){}};
 const transferRoot={
  ownerDocument:{createElement:()=>mover},
  querySelector(selector){
   return selector.startsWith('[data-f95-drag')?source:selector.startsWith('[data-f95-seat')?destination:board;
  }
 };
 globalThis.matchMedia=()=>({matches:false});
 const boarding=boardingTransfer97(transferRoot,mixed,{index:dog,slot:3});
 await boarding.finished;
 assert.deepEqual(poses,['walk','jump','sit']);
 assert.ok(phases[0].duration>800 && phases[0].frames.length===3);
 assert.match(mover.innerHTML,/flight98-leg-left/);
 assert.equal(mover.removed,true);
 assert.equal(source.dataset.f98Moving,undefined);
 const school=trainingCatalog95('2','Wiedza ogólna'),preschool=trainingCatalog95('P','Wiedza ogólna');
 assert.ok(school.some(g=>g.kind==='race'&&g.subject==='matematyka'));
 assert.ok(preschool.some(g=>g.kind==='dino'&&g.subject==='polski'));
 assert.ok(!preschool.some(g=>g.kind==='race'));
 assert.ok(school.every(g=>!['engine','airport','fuel','airballs'].includes(g.kind)));
 const english=trainingCatalog95('2','Język angielski');
 assert.ok(english.length>5&&english.every(g=>g.subject==='angielski'));
 const orthography=school.find(g=>g.kind==='spelling');
 const words=new Set(Array.from({length:6},()=>outsideDeck95(orthography,'2')).flat().map(t=>t.question));
 assert.ok(words.size>8);
 const mathBooks=[{id:'M',subject:'Matematyka'}];
 const material=[{id:'1',bookId:'M',number:12}];
 const scope=trainingSequence95(school,material,mathBooks,2,'all');
 assert.ok(scope.some(turn=>turn.page?.number===12&&turn.key==='matematyka'));
 assert.deepEqual([...new Set(scope.map(turn=>turn.key))].sort(),['angielski','matematyka','polski','przyroda']);
 const manifest=vm.runInNewContext(fs.readFileSync(path.join(dir,'sw.js'),'utf8')+'\n({CACHE,ASSETS})',{self:{addEventListener(){}}});
 assert.equal(manifest.CACHE,'academy-v98');
 for(const resource of manifest.ASSETS)assert.ok(fs.existsSync(path.resolve(dir,resource.split('?')[0])),resource);
 console.log('PASS V98 – 14 misji, odprawa i kabina, obręcze, slalom, karmnik, katalog, trening i cache.');
})().catch(error=>{console.error(error);process.exitCode=1;});
