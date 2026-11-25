// Simulated DOM and clock: behavior/paths, not a physical phone rendering test.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const {fixture,Element}=require('./hangar130-dom.cjs');
const root=path.resolve(__dirname,'..'),base=new URL('file://'+root+'/');
for(const name of ['id','className','value'])Object.defineProperty(Element.prototype,name,{get(){return this.getAttribute(name==='className'?'class':name)||'';},set(v){this.setAttribute(name==='className'?'class':name,v);},configurable:true});
Element.prototype.append=function(...nodes){for(const n of nodes)this.appendChild(n);};
Element.prototype.replaceChildren=function(...nodes){for(const n of this.children)n.parentNode=null;this.children=[];this.text='';this.append(...nodes);};
for(const [name,value]of Object.entries({clientWidth:360,clientHeight:650,clientLeft:0,clientTop:0,offsetWidth:40,offsetHeight:68}))Object.defineProperty(Element.prototype,name,{get(){return value;},configurable:true});
const getAll=Element.prototype.querySelectorAll;Element.prototype.querySelectorAll=function(s){if(s==='.floor:not(.active) .dummy')return getAll.call(this,'.floor .dummy').filter(n=>!n.closest('.floor').classList.contains('active'));return getAll.call(this,s);};
function setup(bank,grade,restore,oneRound=false){
 const f=fixture(),doc=f.doc,html=fs.readFileSync(path.join(root,'assets/spider142',grade==='P'?'pre.html':'school.html'),'utf8');
 doc.querySelector=s=>f.root.querySelector(s);doc.querySelectorAll=s=>f.root.querySelectorAll(s);doc.body=doc.documentElement=f.root;f.root.dataset.level=grade==='P'?'przedszkole':'klasy-1-3';
 f.root.innerHTML=html.slice(html.indexOf('<main>'),html.indexOf('</main>')+7);
 const ctx=new Proxy({},{get:()=>()=>{},set:()=>true});Element.prototype.getContext=()=>ctx;doc.createElement=tag=>new Element(tag,doc);
 let now=0,serial=0,timers=new Map(),saved={},completed=[],advances=0,spoken=[];
 const training={config:{spiderBank:bank,oneRound,generateSpider:async()=>[]},restore,save:s=>{saved=structuredClone(s);},complete:s=>completed.push(s),advance:()=>advances++,help(){},speak:s=>spoken.push(s)};
 const set=(fn,delay=0)=>{const id=++serial;timers.set(id,{fn,at:now+delay});return id;};
 const scope={document:doc,Training139:training,console,crypto,window:null,devicePixelRatio:2,performance:{now:()=>now},setTimeout:set,clearTimeout:id=>timers.delete(id),requestAnimationFrame:fn=>set(()=>fn(now),16),matchMedia:()=>({matches:true}),ResizeObserver:class{observe(){}},speechSynthesis:{cancel(){},speak:u=>spoken.push(u.text)},SpeechSynthesisUtterance:class{constructor(text){this.text=text;}},Math,JSON,Map,Set};scope.window=scope;
 const context=vm.createContext(scope);vm.runInContext(fs.readFileSync(path.join(root,'assets/spider142/gra.js'),'utf8'),context);
 const run=s=>vm.runInContext(s,context),flush=async(ms=200)=>{const end=now+ms;while(now<end){now=Math.min(end,now+20);for(const [id,t]of [...timers])if(t.at<=now){timers.delete(id);t.fn();}await Promise.resolve();await Promise.resolve();}for(let i=0;i<5;i++)await Promise.resolve();};
 const shoot=async correct=>{run(`shoot(document.querySelectorAll('.window').find(b=>(b.textContent===tasks[solved][2])===${correct}),${correct})`);await flush(300);};
 return {doc,run,flush,shoot,training,get saved(){return saved;},completed,spoken,get advances(){return advances;}};
}
(async()=>{
 const {spiderBank142,validateSpider142,taskKey142,generateSpider142}=await import(new URL('assets/spider142/bank.js',base));
 const {trainingCatalog139,trainingReady139}=await import(new URL('assets/training139-catalog.js',base));
 for(const grade of ['P','1','2','3']){
  for(const subject of ['polski','matematyka'])assert(trainingReady139({kind:'web-climber',subject},grade));
  assert.equal(trainingReady139({kind:'snail',subject:'polski'},grade),grade==='P');
  for(const label of ['Polski','Matematyka']){const games=trainingCatalog139(grade,label);assert.equal(games.filter(g=>g.kind==='web-climber').length,1);assert(!games.find(g=>g.kind==='web-climber').locked139);}
  const bank=spiderBank142(grade),f=setup(bank,grade);await f.flush();assert.equal(f.run('floors.size'),10);assert(f.doc.querySelector('.entry'));assert(f.doc.querySelector('.roof'));
  const route=f.saved.tasks;assert.equal(route.length,10);assert.equal(new Set(route.map(taskKey142)).size,10);assert.equal(new Set(route.map(r=>r[0])).size,3);assert.equal(f.saved.position,0);
  if(grade==='P'){f.run("solved=tasks.findIndex(t=>t[0]==='Litery');render()");assert.equal(f.doc.querySelector('#question').textContent,'Posłuchaj i wskaż właściwą literę.');assert(!f.doc.querySelector('#read').outerHTML.includes(f.run('tasks[solved][1]')));f.run("document.querySelector('#read').onclick()");assert.equal(f.spoken.at(-1),f.run('tasks[solved][1]'));f.run('solved=0;render()');}
  if(grade==='1')assert(bank.Matematyka.every(r=>!/[×÷*/]/.test(r[0])));
  await f.shoot(true);assert.equal(f.saved.solved,1);assert.equal(f.saved.position,1);assert.equal(f.completed.length,0);
  const resumed=setup(bank,grade,f.saved);assert.equal(resumed.saved.solved,1);assert.equal(resumed.saved.position,1);assert.equal(resumed.saved.attempt,f.saved.attempt);
  const oldAttempt=resumed.saved.attempt,oldBackground=resumed.saved.background;await resumed.shoot(false);assert.equal(resumed.saved.solved,0);assert.notEqual(resumed.saved.attempt,oldAttempt);assert.notEqual(resumed.saved.background,oldBackground);assert.equal(resumed.completed.length,0);
  const original=resumed.saved.tasks.map(taskKey142);resumed.training.onSkip();assert.notDeepEqual(resumed.saved.tasks.map(taskKey142),original);
  const game=setup(bank,grade,null,true);for(let floor=0;floor<10;floor++){await game.shoot(true);if(floor<9)game.run("document.querySelector('#next').onclick()");}
  assert.equal(game.saved.solved,10);assert.equal(game.saved.position,11);assert.equal(game.completed.length,1);assert.equal(game.advances,0,'Show roof before leaving mixed round');assert.equal(game.run('scene.dataset.finale'),'siku');
  for(const finale of ['pigeon','siku','dance','confetti','selfie'])game.run(`celebrate(${JSON.stringify(finale)})`);assert.equal(game.completed.length,1,'Replaying finales gives no extra reward');
  const roofReload=setup(bank,grade,game.saved);assert.equal(roofReload.completed.length,0,'Reloading completed route cannot grant again');
  game.run("document.querySelector('#next').onclick()");assert.equal(game.advances,1);
  const disclosed=setup(bank,grade);disclosed.training.onRevealed();assert(disclosed.saved.revealed);
  for(let floor=0;floor<10;floor++){await disclosed.shoot(true);if(floor<9)disclosed.run("document.querySelector('#next').onclick()");}assert(disclosed.completed[0].revealed);
 }
 const school=spiderBank142('1'),item={kategoria:'Matematyka',polecenie:'Ile to 8 + 4?',odpowiedzi:['11','12','13'],poprawnyIndeks:1};
 assert.equal(validateSpider142([item],school,'1').length,1);assert.equal(validateSpider142([{...item,poprawnyIndeks:0}],school,'1').length,0);assert.equal(validateSpider142([{...item,polecenie:'Ile to 8 × 4?',odpowiedzi:['31','32','33']}],school,'1').length,0);
 assert.equal(validateSpider142([{...item,kategoria:'Język polski',polecenie:'Wymyślony fakt',odpowiedzi:['a','b','c']}],school,'1').length,0);
 assert.deepEqual(await generateSpider142({bank:school,grade:'1',ask:async()=>{throw Error('offline');},signal:new AbortController().signal}),[]);
 // Every original visual survives unchanged, including the APNG payloads and
 // three-frame fallbacks; no standalone base64 demo is shipped in the app.
 const source=path.join(root,'../spider142_sources/grafiki');let count=0;
 function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory())walk(p);else{const rel=path.relative(source,p),dest=path.join(root,'assets/spider142/grafiki',rel);assert.deepEqual(fs.readFileSync(dest),fs.readFileSync(p),rel);count++;}}}walk(source);
 for(const file of ['styl.css','gra.js','pre.html','school.html'])for(const [,url]of fs.readFileSync(path.join(root,'assets/spider142',file),'utf8').matchAll(/(?:src=\"|url\([\"']?)(grafiki\/[^\"')]+)/g))assert(fs.existsSync(path.join(root,'assets/spider142',url)),url);
 console.log('PASS V142: preschool + grades 1–3, snail availability, ten floors/unique mixed questions, neutral letter prompt/audio, wrong reset, new landscapes, save/resume, roof/five finales, one completion, revealed flag, skip, offline/validated AI, '+count+' original visuals unchanged.');
})().catch(e=>{console.error(e);process.exitCode=1;});
