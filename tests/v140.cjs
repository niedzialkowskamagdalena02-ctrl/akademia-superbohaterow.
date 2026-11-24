const assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs'),crypto=require('node:crypto');
const {fixture,Element}=require('./hangar130-dom.cjs'),url=n=>require('node:url').pathToFileURL(path.join(__dirname,'../assets',n));
Element.prototype.matches=function(s){return this.closest(s)===this;};
Object.defineProperty(Element.prototype,'value',{get(){return this._value??this.getAttribute('value')??'';},set(v){this._value=String(v);}});
const tick=async()=>{for(let i=0;i<8;i++)await Promise.resolve();};
function environment(map=new Map()){
 const f=fixture(),spoken=[],recognizers=[];
 f.doc.dispatchEvent=e=>f.doc.emit(e.type,e);
 const toggle=el=>{el.classList.toggle=(name,on)=>{if(on??!el.classList.contains(name))el.classList.add(name);else el.classList.remove(name);};for(const child of el.children)toggle(child);};
 const descriptor=Object.getOwnPropertyDescriptor(Element.prototype,'innerHTML');
 if(!Element.prototype.__space132Wrapped){Object.defineProperty(Element.prototype,'innerHTML',{get:descriptor.get,set(html){descriptor.set.call(this,html);toggle(this);},configurable:true});Element.prototype.__space132Wrapped=true;}
 class SR{constructor(){recognizers.push(this);}start(){this.onstart?.();}abort(){this.onend?.();}stop(){this.onend?.();}}
 global.CustomEvent=class{constructor(type,{detail}={}){this.type=type;this.detail=detail;}};
 global.window={SpeechRecognition:SR,speechSynthesis:{cancel(){},getVoices:()=>[],speak(){}}};global.document=f.doc;
 global.localStorage={getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,String(v)),removeItem:k=>map.delete(k)};
 const click=(action)=>{const el=f.root.querySelector('[data-mg="'+action+'"]');assert(el,'Missing '+action);if(!el.disabled)f.event('click',el);return el;};
 const type=value=>{const el=f.root.querySelector('#mg-written');assert(el);el.value=value;f.event('input',el);};
 const enter=()=>{f.event('submit',f.root.querySelector('[data-space132-answer]'));};
 return {...f,map,spoken,recognizers,click,type,enter};
}
(async()=>{
 const ui=await import(url('space-literacy140.js')),training=await import(url('training95.js')),{mountMissionGame}=await import(url('mission-game140.js'));
 const game=kind=>training.trainingCatalog95('2','polski').find(g=>g.kind===kind);
 const deck=kind=>training.outsideDeck95(game(kind),'2');
 let rewards=[],asks=[],backs=0;
 const mount=(f,kind,extra={})=>mountMissionGame(f.root,{books:[],pages:[],child:'pawel',speak:t=>f.spoken.push(t),reward:async(n,id)=>{rewards.push({n,id});return n;},ask:async q=>{asks.push(q);return JSON.stringify({kind:'hint',text:'Przeczytaj spokojnie polecenie.'});},onBack:()=>{backs++;f.root.innerHTML='';},launch:{tasks:[],repeat:()=>deck(kind),space132:kind,space132Resume:true,mode:'game'},...extra});
 const f=environment();f.map.set('existing-progress','keep');let session=mount(f,'dictation');const key=ui.spaceSessionKey132('pawel','dictation'),state=()=>JSON.parse(f.map.get(key));
 assert(f.root.querySelector('.space132'));let t=state().tasks[0];assert(!f.root.textContent.includes(t.answer),'Dictated answer is not revealed in visible text');
 f.click('audio');assert.equal(f.spoken.at(-1),t.audio);f.doc.dispatchEvent(new CustomEvent('academy:voice-state',{detail:{state:'speaking'}}));assert(f.root.querySelector('.space132').classList.contains('is-listening'));f.doc.dispatchEvent(new CustomEvent('academy:voice-state',{detail:{state:'idle'}}));assert(!f.root.querySelector('.space132').classList.contains('is-listening'));
 f.type('wpis roboczy');f.click('pause');assert(!f.root.querySelector('#mg-written'));f.click('resume');assert.equal(f.root.querySelector('#mg-written').value,'wpis roboczy');
 f.enter();assert.equal(state().points,0);assert.equal(state().tasks[0].space132Wrong,1);assert(!f.root.textContent.includes(t.answer));
 f.type(t.answer.toLocaleUpperCase('pl-PL').normalize('NFD'));f.enter();assert.equal(state().points,1);assert(f.root.textContent.includes(t.answer));
 f.click('next');f.type('zachowany wpis');session.dispose();
 const resumed=environment(f.map);session=mount(resumed,'dictation');assert.equal(state().idx,1);assert.equal(resumed.root.querySelector('#mg-written').value,'zachowany wpis');assert.equal(f.map.get('existing-progress'),'keep');
 resumed.click('skip');assert.equal(state().idx,2);assert.equal(state().points,1);assert(state().tasks[1].space132Skipped);
 resumed.click('space132-help');assert(resumed.root.querySelector('.mg-tutor').open);resumed.click('tutor-mic');const rec=resumed.recognizers.at(-1);assert.equal(rec.lang,'pl-PL');rec.onresult({results:[[{transcript:'Jak mam wykonać zadanie?'}]]});await tick();assert.equal(asks.length,1);assert(resumed.root.textContent.includes('Przeczytaj spokojnie polecenie.'));
 while(state()?.idx<state()?.tasks.length){const current=state();resumed.type(current.tasks[current.idx].answer);resumed.enter();resumed.click('next');await tick();if(!f.map.has(key))break;}
 assert(resumed.root.querySelector('.is-complete'));assert.equal(rewards.length,1);assert.equal(rewards[0].n,5);assert(resumed.root.textContent.includes('Pominięte bez zaliczenia: 1'));assert.equal(f.map.get(key),undefined);resumed.click('back');assert.equal(f.map.get(key),undefined,'Leaving results cannot recreate completed session');session.dispose();
 const s=environment();session=mount(s,'spelling');const skey=ui.spaceSessionKey132('pawel','spelling'),ss=()=>JSON.parse(s.map.get(skey));
 t=ss().tasks[0];s.click('space132-pick:'+t.options.indexOf(t.answer));assert.equal(ss().points,1);assert(s.root.textContent.includes(t.spaceGap132.word));s.click('next');
 t=ss().tasks[1];const wrong=t.options.findIndex(v=>v!==t.answer);
 for(let n=0;n<2;n++){s.click('space132-pick:'+wrong);assert.equal(ss().points,1);s.click('space132-gap');}assert(s.root.textContent.includes(t.spaceGap132.hint));
 const right=t.options.indexOf(t.answer),option=s.root.querySelector('[data-space132-option="'+right+'"]'),gap=s.root.querySelector('.space132-gap');s.doc.under=gap;
 s.event('pointerdown',option,{clientX:10,clientY:10});s.event('pointermove',option,{clientX:80,clientY:80});assert(gap.classList.contains('is-drop-target'));s.event('pointercancel',option,{clientX:80,clientY:80});assert.equal(ss().points,1);assert(!gap.classList.contains('is-drop-target'));
 s.event('pointerdown',option,{clientX:10,clientY:10});s.event('pointermove',option,{clientX:80,clientY:80});s.event('pointerup',option,{clientX:80,clientY:80});assert.equal(ss().points,2);s.click('next');assert.equal(s.root.querySelector('[data-space132-stage]').dataset.space132Stage,'2');assert(s.root.querySelector('.space132-word').textContent.includes('___'));
 s.click('tutor-mic');const late=s.recognizers.at(-1);s.click('back');const before=asks.length;late.onresult({results:[[{transcript:'Spóźnione pytanie'}]]});await tick();assert.equal(asks.length,before);session.dispose();
 assert.equal(ui.spaceKind132({space132:'dictation',mode:'game'},{outsideSubject95:'angielski'}),'');assert.equal(ui.spaceKind132({space132:'dictation'},{outsideSubject95:'polski'},true),'');
 assert.equal(ui.readSpace132({getItem:()=>'{bad'},key,'dictation'),null);assert.notEqual(ui.spaceSessionKey132('pawel','dictation'),ui.spaceSessionKey132('patryk','dictation'));
 const manifest=JSON.parse(fs.readFileSync(path.join(__dirname,'../scripts/space132-assets.json')));assert.equal(manifest.length,9);
 const code=fs.readFileSync(path.join(__dirname,'../assets/space-literacy132.js'),'utf8'),css=fs.readFileSync(path.join(__dirname,'../assets/space-literacy132.css'),'utf8');
 for(const file of manifest){assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(__dirname,'..',file.runtime))).digest('hex'),file.sha256);assert((code+css).includes(path.basename(file.runtime).replace('.png','')),'Original asset is used: '+file.runtime);}
 assert(css.includes('#app:has(.space132)>button.mic'));assert(css.includes('prefers-reduced-motion'));assert(!css.includes('object-fit:fill'));

 const {trainingCatalog139,decorateTasks139,trainingReady139}=await import(url('training139-catalog.js'));
 for(const grade of ['P','1','2','3']){
  const child=trainingCatalog139(grade,'Wiedza ogólna');assert.equal(new Set(child.map(g=>g.id)).size,child.length);
  assert(child.some(g=>g.locked139));assert(child.filter(g=>!g.locked139).every(g=>trainingReady139(g,grade)));
  assert(trainingCatalog139(grade,'Wiedza ogólna',true).every(g=>!g.locked139));
  const kinds=child.filter(g=>!g.locked139).map(g=>g.kind);
  for(const kind of ['order','syllables','dino','rail','closet'])assert(kinds.includes(kind),grade+' '+kind);
  assert.equal(kinds.includes('camera'),grade==='P');assert.equal(kinds.includes('grammar'),grade!=='P');
 }
 for(const kind of ['grammar','read','syllables','bank']){
  const cat=trainingCatalog139(kind==='syllables'?'P':'2','polski'),g=cat.find(g=>g.kind===kind);
  const tasks=decorateTasks139(training.outsideDeck95(g,'2'),kind);assert(tasks.length>0);
  const f2=environment();let paid=0;
  let live=mountMissionGame(f2.root,{books:[],pages:[],child:'same-child',speak:t=>f2.spoken.push(t),reward:async()=>{paid++;return 1;},onBack(){},launch:{tasks:[],repeat:()=>tasks,space132:kind,space132Scope:'2:outside',space132Resume:true,mode:'game'}});
  const key2=ui.spaceSessionKey132('same-child',kind)+':2:outside',state2=()=>JSON.parse(f2.map.get(key2));
  assert(f2.root.querySelector('[data-cosmic136="'+kind+'"]'));assert(!f2.root.querySelector('mark'));assert(!f2.root.querySelector('.space136-sound-tiles'));
  let item=state2().tasks[0];const wrong=item.options.findIndex(o=>o!==item.answer);f2.click('pick:'+wrong);assert.equal(state2().points,0);assert(!f2.root.querySelector('mark'));
  f2.click('pause');assert(!f2.root.querySelector('[data-mg^="pick:"]'));f2.click('resume');f2.click('pick:'+item.options.indexOf(item.answer));assert.equal(state2().points,1);
  if(kind==='grammar')assert(f2.root.querySelector('.is-filled'));
  if(kind==='read'&&item.space136.reading?.evidence)assert(f2.root.querySelector('mark'));
  if(kind==='syllables'&&item.space136.parts)assert(f2.root.querySelector('.space136-sound-tiles'));
  live.dispose();const reload=environment(f2.map);live=mountMissionGame(reload.root,{books:[],pages:[],child:'same-child',speak(){},reward:async()=>{paid++;return 1;},launch:{tasks:[],repeat:()=>tasks,space132:kind,space132Scope:'2:outside',space132Resume:true,mode:'game'}});assert.equal(state2().points,1);reload.click('next');
  if(state2()?.idx<tasks.length)reload.click('skip');assert.equal(state2().points,1);
  while(f2.map.has(key2)){const t=state2().tasks[state2().idx];reload.click('pick:'+t.options.indexOf(t.answer));reload.click('next');await tick();}
  assert(reload.root.querySelector('.is-complete'));assert.equal(paid,1);assert(!reload.root.querySelector('[data-mg="pause"]'));live.dispose();
 }
 const ai=await import(url('training139-ai.js'));
 const valid={polecenie:'Ile to 4 + 3?',odpowiedzi:['6','7','8'],poprawnyIndeks:1};
 assert(ai.validTask139(valid,{subject:'matematyka',grade:'1'}));assert.equal(ai.validTask139({...valid,poprawnyIndeks:0},{subject:'matematyka'}),null);
 assert.equal(ai.validTask139({...valid,polecenie:'9 ÷ 0'}, {subject:'matematyka'}),null);assert.equal(ai.validTask139({...valid,polecenie:'2 × 4'}, {subject:'matematyka',grade:'1'}),null);
 const known={question:'Wskaż rzeczownik.',answer:'kot',options:['kot','biegnie','zielony']};
 assert(ai.validTask139({polecenie:known.question,odpowiedzi:known.options,poprawnyIndeks:0},{subject:'polski',verifiedTasks:[known]}));assert.equal(ai.validTask139({polecenie:known.question,odpowiedzi:known.options,poprawnyIndeks:1},{subject:'polski',verifiedTasks:[known]}),null);
 const {trainingScope139}=await import(url('training139-player.js'));
 assert.notEqual(trainingScope139('P','polski','a'),trainingScope139('1','polski','a'));assert.notEqual(trainingScope139('1','polski','a'),trainingScope139('1','polski','b'));
 const files=JSON.parse(fs.readFileSync(path.join(__dirname,'../scripts/training139-assets.json')));for(const file of files)assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(__dirname,'..',file.runtime))).digest('hex'),file.sha256);
 console.log('PASS V140: education-level catalog and mother access; four task games with wrong/right/skip/pause/reload/reward; V132 spelling/dictation regression; verified AI and scoped progress; original PNG/WebP hashes. Simulated DOM, not a phone-browser rendering test.');
})().catch(error=>{console.error(error);process.exitCode=1;});
