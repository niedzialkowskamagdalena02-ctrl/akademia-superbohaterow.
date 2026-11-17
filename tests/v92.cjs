const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const {pathToFileURL}=require('node:url');
const url=name=>new URL('../assets/'+name,pathToFileURL(__filename));
process.argv[2]??=require('node:path').resolve(__dirname,'..');

function board(){
 const nodes=new Map(),listeners={};
 const makeNode=()=>({
  dataset:{},style:{setProperty(name,value){this[name]=value;}},
  parentElement:{setAttribute(){}},focus(){},isConnected:true
 });
 const node=key=>{
  if(!nodes.has(key))nodes.set(key,makeNode());
  return nodes.get(key);
 };
 return {
  markup:'',dataset:{},listeners,
  set innerHTML(html){this.markup=html;nodes.clear();},
  get innerHTML(){return this.markup;},
  addEventListener(name,fn,{signal}={}){listeners[name]=fn;signal?.addEventListener('abort',()=>delete listeners[name]);},
  querySelector:node,querySelectorAll:()=>[],
  closest:()=>({querySelector:node}),
  click(action){const target={dataset:{lg92:action},closest:()=>target};listeners.click({target});return target;}
 };
}

(async()=>{
 const {
  schoolGames92,preschoolGames92,mathRound92,preschoolRound92,gameGroup92,recordGameAward92,alphabet92,numbers92
 }=await import(url('learning-games92.js'));
 const {traceStrokes92,traceStep92}=await import(url('learning-trace92.js'));
 const {mountLearningGames92}=await import(url('learning-play92.js'));
 const {sync78AllowedChange,sync78Merge}=await import(url('sync-core.js'));
 assert.equal(schoolGames92.length,7);
 assert.equal(preschoolGames92.length,7);
 assert.deepEqual([1,2,3,'4','P'].map(gameGroup92),['school','school','school','','preschool']);
 for(let seed=0;seed<40;seed++){
  let counter=seed;
  const random=()=>{counter=(counter*1664525+1013904223)>>>0;return counter/4294967296;};
  for(const grade of [1,2,3]){
   for(const [id] of schoolGames92){
    for(const task of mathRound92(id,grade,{random})){
     assert.equal(task.options.length,3,id+' ma trzy odpowiedzi');
     assert.equal(new Set(task.options).size,3);
     assert.ok(task.options.includes(task.answer));
     assert.equal(task.answer,[task.a,task.b,task.a*task.b][task.slot]);
     assert.equal((task.prompt.match(/\?/g)||[]).length,1);
     if(grade===1)assert.ok(task.a<=5&&task.b<=5);
    }
   }
  }
  for(const [id] of preschoolGames92){
   if(id==='trace')continue;
   for(const task of preschoolRound92(id,{random,lower:true})){
    if(id==='order')assert.deepEqual([...task.options].sort(),[...task.answer].sort());
    else if(id==='hidden')assert.equal(task.options.filter(n=>n===task.answer).length,task.count);
    else if(task.pictures)assert.ok(task.pictures.some(({image})=>image===task.answer));
    else assert.ok(task.options.includes(task.answer));
   }
  }
 }
 const fixed=mathRound92('timer',1,{factor:7});
 assert.deepEqual(fixed.map(q=>q.b).sort((a,b)=>a-b),[1,2,3,4,5,6,7,8,9,10]);
 assert.ok(fixed.every(q=>q.a===7));
 assert.deepEqual(new Set(mathRound92('master',2,{level:1}).map(q=>q.a)),new Set([2,3,4]));
 assert.ok(mathRound92('master',2,{level:3}).every(q=>q.slot!==2));
 assert.deepEqual(mathRound92('missing',2).map(q=>q.stage),[0,0,0,1,1,1,2,2,2]);
 for(const symbol of [...alphabet92,...alphabet92.map(l=>l.toLowerCase()),...numbers92.map(String)]){
  assert.ok(traceStrokes92(symbol).length,'ślad '+symbol);
 }
 assert.equal(traceStrokes92('10').length,2);
 assert.equal(traceStrokes92('ż').length,2);
 const line=Array.from({length:24},(_,x)=>({x:x*5,y:20}));
 assert.equal(traceStep92(line,0,{x:100,y:20}),-1);
 assert.equal(traceStep92(line,3,{x:20,y:20}),4);
 assert.equal(traceStep92(line,3,{x:20,y:50}),-1);

 const original={name:'Paweł',grade:'2',coins:17,xp:8},profile=structuredClone(original),other=structuredClone(original);
 assert.equal(recordGameAward92(profile,'race'),true);
 assert.equal(recordGameAward92(profile,'race'),false);
 assert.equal(recordGameAward92(profile,'bad'),false);
 assert.equal(profile.coins,17);
 assert.equal(recordGameAward92(other,'master'),true);
 assert.ok(sync78AllowedChange('profile/pawel',original,profile,{role:'child',child:'pawel'},{}));
 assert.deepEqual(sync78Merge(original,profile,other,'profile/pawel').base.headquarters.learningAwards92,{race:true,master:true});

 const files=vm.runInNewContext(fs.readFileSync(url('../sw.js'),'utf8')+'\nASSETS',{self:{addEventListener(){}}});
 for(const f of files)assert.ok(fs.existsSync(new URL(f.split('?')[0],url('..'))),f);
 const {app,data}=require('./legacy/test.cjs');
 const view=app(),v=data();
 view.api.set(v,{who:'pawel',role:'child'});
 await view.api.handle('child:learn');
 assert.match(view.root.innerHTML,/Wybierz przedmiot/);
 await view.api.handle('training:subject:Matematyka');
 await view.api.handle('training:mode:train');
 await view.api.handle('training:back:catalog');
 assert.match(view.root.innerHTML,/Wyścig mnożeniowy/);
 assert.doesNotMatch(view.root.innerHTML,/Ortografia|Ortograficzne Balony/);
 await view.api.handle('learning-games:open');
 assert.match(view.root.innerHTML,/id="learning-games92"/);
 await view.api.handle('learning-games:back');
 assert.match(view.root.innerHTML,/Wybierz grę/);
 view.api.set(v,{who:'patryk',role:'child'});
 await view.api.handle('child:learn');
 await view.api.handle('training:subject:Matematyka');
 await view.api.handle('training:mode:train');
 await view.api.handle('training:back:catalog');
 assert.match(view.root.innerHTML,/Cyfrowe łowy/);
 assert.doesNotMatch(view.root.innerHTML,/Wyścig mnożeniowy|Poznaj literki/);
 await view.api.handle('child:academy');
 assert.doesNotMatch(view.root.innerHTML,/learning-games:open/);

 globalThis.matchMedia=()=>({matches:true});
 const originals=[setTimeout,clearTimeout,setInterval,clearInterval,Date.now,Math.random];
 let id=0,time=0;
 const timers=new Map(),intervals=new Map();
 globalThis.setTimeout=callback=>{const key=++id;timers.set(key,callback);return key;};
 globalThis.clearTimeout=key=>timers.delete(key);
 globalThis.setInterval=callback=>{const key=++id;intervals.set(key,callback);return key;};
 globalThis.clearInterval=key=>intervals.delete(key);
 Date.now=()=>time;
 Math.random=()=>.3;
 const flush=()=>{for(const [key,fn] of [...timers]){timers.delete(key);fn();}};
 const root=board(),awards=[],spoken=[];
 const open=id=>{root.click('open-'+id);root.click('start');};
 const choose=task=>root.click('pick-'+(task.pictures?task.pictures.findIndex(p=>p.image===task.answer):task.options.indexOf(task.answer)));
 const notice=()=>root.querySelector('[data-lg92-feedback]').textContent;

 try{
  mountLearningGames92(root,{grade:'2',onAward:id=>awards.push(id)});
  assert.equal((root.innerHTML.match(/data-lg92="open-/g)||[]).length,7);
  open('race');
  const race=mathRound92('race',2);
  root.click('pick-'+race[0].options.findIndex(n=>n!==race[0].answer));
  assert.match(notice(),/Spróbuj jeszcze raz/);
  for(const task of race){
   choose(task);
   assert.equal(root.querySelector('[data-lg92-race]').dataset.speed,'');
   flush();
  }
  assert.match(root.innerHTML,/Zdobywasz puchar/);
  assert.deepEqual(awards,['race']);

  root.click('catalog');open('balloons');
  assert.match(root.innerHTML,/--balloon-time:5.5s/);
  const balloons=mathRound92('balloons',2);
  for(const [index,task] of balloons.entries()){
   const target=choose(task);assert.equal(target.dataset.pop,'');flush();
   if(index===0)assert.match(root.innerHTML,/--balloon-time:5.07s/);
  }
  assert.match(root.innerHTML,/Zdobyte gwiazdki: 2/);

  root.click('catalog');root.click('open-timer');
  root.querySelector('#lg92-factor').value='4';
  root.click('start');
  assert.match(root.innerHTML,/4 × \d+ = \?/);
  assert.equal(intervals.size,1);
  time=9999;[...intervals.values()][0]();
  assert.equal(root.querySelector('[data-lg92-seconds]').textContent,'1 s');
  time=10000;[...intervals.values()][0]();
  assert.match(notice(),/Czas minął/);
  assert.equal(intervals.size,0);
  root.click('next');assert.equal(intervals.size,1);
  root.click('catalog');assert.equal(intervals.size,0);

  open('puzzle');
  assert.equal((root.innerHTML.match(/data-lg92-piece/g)||[]).length,9);
  for(const task of mathRound92('puzzle',2)){choose(task);flush();}
  assert.match(root.innerHTML,/Obrazek odkryty/);
  assert.equal((root.innerHTML.match(/data-revealed/g)||[]).length,9);

  root.click('catalog');open('missing');
  const missing=mathRound92('missing',2);
  assert.match(root.innerHTML,/inputmode="numeric"/);
  for(const [index,task] of missing.entries()){
   if(index===0){
    const target={matches:()=>true,querySelector:()=>({value:String(task.answer)})};
    root.listeners.submit({target,preventDefault(){}});
   }else choose(task);
   root.click('next');
  }
  assert.match(root.innerHTML,/Wszystkie liczby uzupełnione/);

  root.click('catalog');open('treasure');
  assert.match(root.innerHTML,/Dotknij świecącej skrzyni/);
  for(const [index,task] of mathRound92('treasure',2).entries()){
   root.click('chest-'+index);
   choose(task);root.click('next');
  }
  assert.match(root.innerHTML,/Wielki skarb zdobyty/);
  assert.match(root.innerHTML,/Monety znalezione na wyspie: 6/);

  root.click('catalog');open('master');
  for(let level=0;level<4;level++){
   for(const task of mathRound92('master',2,{level})){choose(task);root.click('next');}
   if(level<3){assert.match(root.innerHTML,/Następny poziom/);root.click('level');}
  }
  assert.match(root.innerHTML,/Medal Mistrza Mnożenia/);
  assert.deepEqual(awards,['race','master']);

  mountLearningGames92(root,{grade:'P',speak:text=>spoken.push(text)});
  assert.equal((root.innerHTML.match(/data-lg92="open-/g)||[]).length,7);
  assert.ok(!root.innerHTML.includes('open-race'));
  root.click('open-letters');root.click('lower');root.click('start');
  const letters=preschoolRound92('letters',{lower:true});
  assert.match(root.innerHTML,/Znajdź małą literę/);
  assert.ok(root.innerHTML.includes('>'+letters[0].answer.toLowerCase()+'</button>'));
  assert.equal(spoken.at(-1),letters[0].speech);choose(letters[0]);
  assert.equal(spoken.at(-1),letters[0].success);

  root.click('catalog');open('numbers');
  const numbers=preschoolRound92('numbers');
  assert.equal(numbers[0].options.length,3);
  assert.ok(numbers.at(-1).options.length>=7);
  for(const task of numbers){choose(task);root.click('next');}
  assert.match(root.innerHTML,/Zabawa ukończona/);

  root.click('catalog');open('order');
  for(const task of preschoolRound92('order')){
   for(const letter of task.answer)root.click('pick-'+task.options.indexOf(letter));
   root.click('next');
  }
  assert.match(root.innerHTML,/Zdobyte gwiazdki: 6/);
  root.click('catalog');open('hidden');
  for(const task of preschoolRound92('hidden')){
   for(const [index,n] of task.options.entries())if(n===task.answer)root.click('pick-'+index);
   assert.equal(root.querySelector('[data-lg92-found]').textContent,`Znaleziono ${task.count} z ${task.count}`);
   root.click('next');
  }
  assert.match(root.innerHTML,/Zabawa ukończona/);
  for(const game of ['rhymes','quiz']){
   root.click('catalog');open(game);
   for(const task of preschoolRound92(game)){choose(task);root.click('next');}
   assert.match(root.innerHTML,/Zabawa ukończona/);
  }
 }finally{
  mountLearningGames92(null);
  [globalThis.setTimeout,globalThis.clearTimeout,globalThis.setInterval,globalThis.clearInterval,Date.now,Math.random]=originals;
 }
 console.log('PASS V92 – 14 gier dla właściwych klas, przebiegi rozgrywek, trzy odpowiedzi, zegar, alfabet i ślad 0–10, odznaki i tryb offline.');
})().catch(error=>{console.error(error);process.exitCode=1;});
