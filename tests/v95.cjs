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
    ownerDocument:root.ownerDocument,dataset:{},classList:{add(){}},style:{setProperty(){}},
    querySelector:key=>root.querySelector(key),
    querySelectorAll:key=>root.querySelectorAll(key),
    insertAdjacentHTML(_position,html){root.content+=html;},getContext(){return null;}
   });
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
 const won=name=>assert.ok(root.querySelector('.flight95-surface').dataset.f95Win,name);

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
      let seat=0;
      const wrong=task.options.findIndex(item=>item.value!==task.answer);
      root.click('bag:'+wrong);root.click('seat:0');
      assert.doesNotMatch(root.innerHTML,/data-f95-filled/);
      task.options.forEach((item,i)=>{
       if(item.value!==task.answer)return;
       root.click('bag:'+i);root.click('seat:'+seat++);
      });
      assert.equal((root.innerHTML.match(/data-f95-filled/g)||[]).length,task.count);
     }
     assert.match(root.innerHTML,/0 \/ 3/);
     assert.match(root.innerHTML,/aircraft-nose.webp/);
     load(t);
     assert.match(root.innerHTML,/Teraz czas na pasażerów/);
     root.click('next');
     assert.match(root.innerHTML,/0 \/ 4/);
     load(hangarDeck95(id,grade)[1]);
     assert.match(root.innerHTML,/Bagaże i pasażerowie na pokładzie/);
    }
    if(id==='takeoff'){
     assert.match(root.innerHTML,/Pociągnij dźwignię/);
     root.click('lever');
     assert.match(root.innerHTML,/cyfrą jeden/);
     pass(2);
     assert.match(root.innerHTML,/0 \/ 4/);
     for(const value of t.needed)pass(value);
     assert.match(root.innerHTML,/4 \/ 4/);
     assert.match(root.innerHTML,/flight96-ring-win/);
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
 assert.equal(manifest.CACHE,'academy-v96');
 for(const resource of manifest.ASSETS)assert.ok(fs.existsSync(path.resolve(dir,resource.split('?')[0])),resource);
 console.log('PASS V96 – 14 misji, odprawa i kabina, obręcze, slalom, karmnik, katalog, trening i cache.');
})().catch(error=>{console.error(error);process.exitCode=1;});
