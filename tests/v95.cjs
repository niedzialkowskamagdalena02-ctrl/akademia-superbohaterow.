const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const dir=path.resolve(__dirname,'..'),asset=name=>pathToFileURL(path.join(dir,'assets',name));

function fixture(){
 const nodes=new Map(),listeners={};
 const root={
  dataset:{},ownerDocument:{hidden:false,elementFromPoint:()=>null},
  set innerHTML(html){this.content=html;nodes.clear();},
  get innerHTML(){return this.content||'';},
  addEventListener(name,fn,{signal}){listeners[name]=fn;signal.addEventListener('abort',()=>delete listeners[name]);},
  querySelector(key){
   if(!nodes.has(key))nodes.set(key,{
    ownerDocument:root.ownerDocument,dataset:{},classList:{add(){}},style:new Map(),
    querySelector:key=>root.querySelector(key),
    querySelectorAll:key=>root.querySelectorAll(key),
    hasAttribute:name=>key===`[${name}]`,
    getBoundingClientRect:()=>({top:0,left:0,width:400,height:400}),
    insertAdjacentHTML(_position,html){root.content+=html;},getContext(){return null;}
   });
   nodes.get(key).style.setProperty=nodes.get(key).style.set;
   nodes.get(key).style.removeProperty=nodes.get(key).style.delete;
   return nodes.get(key);
  },
  querySelectorAll(key){
   if(key==='[data-f95-object]')return [...this.innerHTML.matchAll(/data-f95-object data-f95-type/g)].map((_,i)=>this.querySelector(key+i));
   return [];
  },
  click(action){
   const target={dataset:{f95Action:action},closest:selector=>selector==='[data-f95-action]'?target:null};
   listeners.click({target,detail:0});
  },
  drag(selector,from,to){
   const target={closest:query=>query.includes(selector)?root.querySelector(selector):null};
   const event=(type,[clientX,clientY])=>({type,target,pointerId:1,button:0,clientX,clientY});
   listeners.pointerdown(event('pointerdown',from));
   listeners.pointermove(event('pointermove',to));
   listeners.pointerup(event('pointerup',to));
  }
 };
 return root;
}

(async()=>{
 const {mountHangar95,hangarDeck95}=await import(asset('hangar95.js'));
 const {digitWord96}=await import(asset('hangar-art96.js'));
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
 const pass=(label,touch=false)=>{
  const choices=[...root.innerHTML.matchAll(/data-f95-action="aim:(\d+)" class="flight95-target" aria-label="([^"]+)"/g)];
  const target=choices.find(item=>item[2]===String(label));
  assert.ok(target,'Brak celu '+label);
  if(touch)root.drag('[data-f95-viewport]',[50,10],[190,[96,196,296][Number(target[1])]]);
  else root.click('aim:'+target[1]);
  frames(10);
 };
 const won=name=>assert.ok(root.querySelector(name==='baggage'?'.flight97-board':'.flight95-surface').dataset.f95Win,name);

 try{
  const published=['baggage','takeoff','airballs'];
  assert.deepEqual([7,8,9].map(digitWord96),['siedem','osiem','dziewięć']);
  for(const grade of ['1','3','4']){
   const maths=grade!=='4';
   mountHangar95(root,{grade,legacy:true});
   assert.deepEqual([...root.innerHTML.matchAll(/data-f95-action="mission:([a-z]+)"\s*>/g)].map(match=>match[1]),maths?[...published,'engine']:[]);
   assert.match(root.innerHTML,/data-action="hq:flight" disabled/);
   root.click('mission:radar');
   assert.equal(root.dataset.fl95Mode,'menu');
   if(maths){
    root.click('mission:engine');
    root.click('start');
    const {answer}=hangarDeck95('engine',grade)[0];
    for(const digit of String(answer))root.click('key:'+digit);
    root.click('key:✓');
    won('engine');
    root.click('catalog');
    root.click('mission:takeoff');
    assert.equal(root.dataset.fl95Mode,'brief');
   }
  }
  mountHangar95(root,{grade:'P'});
  assert.deepEqual([...root.innerHTML.matchAll(/data-f95-action="mission:([a-z]+)"\s*>/g)].map(match=>match[1]),published);
  const school=[...captainMissions93.filter(([id])=>published.includes(id)),...aceMissions93];
  for(const [grade,missions] of [['P',captainMissions93],['2',school]]){
   mountHangar95(root,{grade,profileKey:grade,preview:true,legacy:true,speak:message=>spoken.push(message)});
   assert.equal((root.innerHTML.match(/data-f95-action="mission:/g)||[]).length,missions.length);
   assert.equal((root.innerHTML.match(/class="flight95-card"/g)||[]).length,missions.length+1);
   assert.match(root.innerHTML,/data-action="hq:flight"\s*>/);
   assert.doesNotMatch(root.innerHTML,/data-f95-locked/);
   for(const [id] of missions){
    root.click('mission:'+id);
    assert.match(root.innerHTML,/Rozpocznij misję/);
    root.click('start');
    assert.equal(root.dataset.f95Screen,'play');
    assert.doesNotMatch(root.innerHTML,/flight95-bottom|flight95-steering|data-f95-action="move:/);
    const t=hangarDeck95(id,grade)[0];
    assert.ok(t.prompt,id);
    if(grade==='2'&&['airballs','takeoff'].includes(id)){
     assert.equal(t.problems.length,id==='takeoff'?11:6);
     assert.deepEqual(new Set(t.problems.map(problem=>problem.expression.split(' ')[1])),new Set(['+','−','×']));
     t.problems.forEach(({expression,answer},i)=>{
      const [a,op,b]=expression.split(' '), aNum=Number(a), bNum=Number(b);
      assert.equal(answer,{'+':aNum+bNum,'−':aNum-bNum,'×':aNum*bNum}[op]);
      assert.equal(t.needed[i],answer);
      assert.ok(t.gates[i].includes(answer));
      assert.equal(new Set(t.gates[i]).size,t.gates[i].length);
     });
    }
    if(id==='baggage'){
     function load(task){
      const board=root.querySelector('.flight97-board');
      const places=[...root.innerHTML.matchAll(/data-f95-seat="(\d+)"/g)].map(match=>+match[1]);
      assert.deepEqual(places,[0,1,2,3]);
      let seat=places.length-1;
      const wrong=task.options.findIndex(item=>!task.targets.includes(item.value));
      if(wrong!==-1){
       root.click('bag:'+wrong);root.click('seat:'+seat);
       assert.equal(root.querySelector('[data-f95-seat="'+seat+'"]').disabled,undefined);
      }
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
     const trip=hangarDeck95(id,grade);
     assert.deepEqual(trip.filter(stage=>!stage.seat).map(stage=>stage.flight.city),['Nowy Jork','Paryż','Rzym','Londyn','Reykjavík']);
     for(let flight=0;flight<5;flight++){
      const [bags,riders]=trip.slice(flight*2,flight*2+2);
      assert.equal(bags.flight,riders.flight);
      assert.ok(root.innerHTML.includes('Lot '+(flight+1)+' / 5'));
      assert.ok(root.innerHTML.includes(bags.flight.city));
      assert.ok(root.innerHTML.includes(bags.flight.country));
      assert.ok(root.innerHTML.includes(bags.prompt));
      assert.ok(root.innerHTML.includes(riders.prompt));
      assert.match(root.innerHTML,/pilot.webp/);
      assert.ok(spoken.at(-1).includes(bags.speech));
      assert.ok(spoken.at(-1).includes(riders.speech));
      assert.doesNotMatch(root.innerHTML,/Pięć lotów ukończonych/);
      if(flight===4) assert.match(spoken.at(-1),/Islandię, gdzie jest tata/);
      root.click('boarding-load');
      assert.ok(root.innerHTML.includes('0 / '+bags.count));
      load(bags);
      assert.match(root.innerHTML,/Teraz czas na pasażerów/);
      root.click('next');
      assert.ok(root.innerHTML.includes('0 / '+riders.count));
      load(riders);
      assert.ok(root.innerHTML.includes('Start '+riders.flight.to));
      assert.match(root.querySelector('[data-game-prompt]').textContent,/Bagaże i pasażerowie na pokładzie/);
      root.click('next');
     }
     assert.equal(root.dataset.fl95Mode,'result');
     assert.match(root.innerHTML,/Pięć lotów ukończonych!/);
     assert.match(root.innerHTML,/Wylądowaliśmy w Reykjavíku/);
     root.click('start');
     assert.ok(root.innerHTML.includes(hangarDeck95(id,grade,()=>.32,5)[0].prompt));
     root.click('catalog');
     continue;
    }
    if(id==='takeoff'){
     assert.match(root.innerHTML,/flight97-dashboard[\s\S]*data-f95-lever/);
     assert.doesNotMatch(root.innerHTML,/flight97-joystick|move:hold/);
     assert.deepEqual(t.gates.map(gates=>gates.length),[grade==='P'?1:2,2,2,2,2,3,3,3,3,3,3]);
     assert.ok(t.gates.every((gates,i)=>gates.includes(t.needed[i])&&new Set(gates).size===gates.length));
     assert.notDeepEqual(t.needed,hangarDeck95(id,grade,()=>.77)[0].needed);
     const progress=root.querySelector('[data-f97-board-progress]'),prompt=root.querySelector('[data-game-prompt]');
     const gate=(round,i)=>root.querySelector(`[data-f97-hoop="${round}:${i}"]`);
     const plane=root.querySelector('[data-f97-aircraft]');
     const speed=()=>Number(root.querySelector('[data-f95-viewport]').style.get('--flight-speed'));
     assert.equal(speed(),0);
     assert.equal(plane.style.get('--plane-y'),'60%');
     root.drag('[data-f95-lever]',[50,300],[50,330]);
     const stage=root.querySelector('.flight97-takeoff');
     assert.equal(stage.dataset.f97Phase,'roll');
     frames(1);
     assert.ok(speed()>0);
     assert.notEqual(plane.style.get('--plane-y'),'60%');
     frames(.5);
     assert.equal(stage.dataset.f97Phase,'lift');
     frames(1.2);
     assert.equal(stage.dataset.f97Phase,'air');
     const startSpeed=speed();
     assert.match(prompt.textContent,grade==='P'?/cyfrą/:/Ile to .*?\? Przeleć przez obręcz z wynikiem/);
     const positions={1:[[50,35]],2:[[29,36],[71,30]],3:[[21,38],[50,25],[79,38]]};
     const steer=(count,index)=>root.drag('[data-f95-viewport]',[200,240],positions[count][index].map(percent=>percent*4));
     for(const [round,gates] of t.gates.entries()){
      const correct=gates.indexOf(t.needed[round]);
      assert.ok(gates.every((_,i)=>gate(round,i).hidden===false));
      if(grade==='P'){
       assert.equal(prompt.textContent,`Przeleć przez obręcz z cyfrą ${t.needed[round]}.`);
       root.click('read');
       assert.equal(spoken.at(-1),`Przeleć przez obręcz z cyfrą ${digitWord96(t.needed[round])}.`);
      }
      if(round===7)assert.ok(speed()>startSpeed*1.3);
      if(round===1){
       steer(gates.length,1-correct);frames(2);
       assert.equal(progress.textContent,'1 / 11');
       assert.match(prompt.textContent,/Spróbuj jeszcze raz/);
       if(t.problems){
        assert.ok(prompt.textContent.includes(t.problems[round].expression));
        root.click('read');
        assert.ok(spoken.at(-1).includes(t.problems[round].speech));
       }
      }
      steer(gates.length,correct);frames(2);
      assert.equal(progress.textContent,(round+1)+' / 11');
      assert.equal(root.querySelector('[data-f97-aircraft]'),plane);
     }
     assert.equal(stage.dataset.f97Phase,'done');
     assert.match(prompt.textContent,/Wszystkie obręcze zaliczone/);
    }
    if(id==='airballs'){
     assert.doesNotMatch(root.innerHTML,/Odsłuchaj: Chmura burzowa|Odsłuchaj: [0-9]/);
     pass('Chmura burzowa',true);
     assert.match(root.innerHTML,/0 \/ 6/);
     for(const [i,value] of t.needed.entries()){
      if(t.problems){
       assert.ok(root.innerHTML.includes(t.problems[i].expression));
       root.click('read');
       assert.ok(spoken.at(-1).includes(t.problems[i].speech));
       if(i===1){
        pass(t.gates[i].find(answer=>answer!==value),true);
        assert.match(root.innerHTML,/1 \/ 6/);
        assert.match(root.innerHTML,/Oblicz wynik i spróbuj jeszcze raz/);
        assert.ok(root.innerHTML.includes(t.problems[i].expression));
       }
      }else if(value===5){
       assert.match(root.innerHTML,/Następna cyfra <strong>pięć<\/strong>/);
       root.click('read');
       assert.match(spoken.at(-1),/^Następna cyfra pięć\./);
      }
      pass(value,true);
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
    if(id==='radio'){
     const end={up:[200,60],down:[200,340],left:[60,200],right:[340,200]}[t.direction];
     root.drag('[data-f95-radio-swipe]',[200,200],end);
     if(t.color)root.click('island:'+t.color);
    }
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
 for(const [,riders] of rounds){
  for(const species of new Set(riders.targets)){
   assert.equal(riders.options.filter(item=>item.value===species).length,
    riders.targets.filter(value=>value===species).length);
  }
  assert.ok(riders.options.every(item=>['bear','cat','dog'].includes(item.value)));
 }
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
 assert.equal(manifest.CACHE,'academy-v108');
 for(const resource of manifest.ASSETS)assert.ok(fs.existsSync(path.resolve(dir,resource.split('?')[0])),resource);
 console.log('PASS V104 – Kokpit Matematyczny, cyfry i odsłuch, przyspieszanie, gesty, tryb mamy i cache.');
})().catch(error=>{console.error(error);process.exitCode=1;});
