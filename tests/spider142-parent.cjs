const assert=require('node:assert/strict'),path=require('node:path');
const {fixture,Element}=require('./hangar130-dom.cjs');
Element.prototype.append=function(...els){els.forEach(el=>this.appendChild(el));};
(async()=>{
 const origin='https://academy.test';global.location={origin};global.document={baseURI:origin+'/'};const store=new Map();global.localStorage={getItem:key=>store.get(key)||null,setItem:(key,v)=>store.set(key,v),removeItem:key=>store.delete(key)};
 const {mountTrainingPackage139}=await import(new URL('file://'+path.resolve(__dirname,'../assets/training139-player.js')));
 function setup(preview=false){
  const f=fixture();let frame,awards=[],sent=[],back=0,stopped=0,mic=0;
  global.window={__academyTraining139:new Map(),addEventListener:(type,fn)=>{if(type==='message')f.message=fn;}};
  f.doc.createElement=tag=>{const el=new Element(tag,f.doc);if(tag==='iframe'){frame=el;el.contentWindow={postMessage:msg=>sent.push(msg)};}return el;};
  global.document=f.doc;f.doc.baseURI=origin+'/';
  const player=mountTrainingPackage139(f.root,{game:{kind:'web-climber',name:'Spider',subject:'polski'},grade:'P',child:preview?'mother':'kid',preview,tasks:[],speak(){},stopAudio(){stopped++;},onBack(){back++;},onComplete:id=>awards.push(id),onMic:()=>mic++,askHelp:async(q,task)=>{task.v77Revealed=true;return 'Prawidłowa odpowiedź';}});
  const flush=async()=>{for(let i=0;i<10;i++)await Promise.resolve();};
  const message=(kind,data={},source=frame?.contentWindow)=>{const [id]=window.__academyTraining139.keys();f.message({source,origin,data:{academyTraining139:id,kind,...data}});};
  return {f,player,flush,message,awards,sent,get frame(){return frame;},get back(){return back;},get mic(){return mic;},get stopped(){return stopped;}};
 }
 for(const preview of [false,true]){
  const t=setup(preview);await t.flush();assert.match(t.frame.src,/spider142\/pre.html\?v=142/);t.message('ready');assert.equal(t.frame.hidden,false);
  t.message('state',{state:{solved:10,position:11,attempt:'a',context:{question:'q',answer:'x'}}});
  t.message('complete',{attempt:'a'},{});assert.equal(t.awards.length,0,'Reject foreign window');
  t.message('complete',{attempt:'wrong'});assert.equal(t.awards.length,0,'Reject wrong attempt');
  t.message('complete',{attempt:'a'});t.message('complete',{attempt:'a'});assert.deepEqual(t.awards,preview?[]:['a']);
  t.message('state',{state:{solved:0,position:0,attempt:'b',context:{question:'q2',answer:'y'}}});
  t.f.doc.emit('academy:tutor-question',{detail:{question:'Pokaż odpowiedź'}});await t.flush();assert(t.sent.some(m=>m.kind==='revealed'));
  t.message('state',{state:{solved:10,position:11,attempt:'b',context:{question:'Koniec',answer:''}}});t.message('complete',{attempt:'b'});assert.deepEqual(t.awards,preview?[]:['a'],'Revealed answer blocks complete award');
  const pause=t.f.root.querySelector('[data-t139="pause"]');t.f.event('click',pause);assert(t.sent.some(m=>m.kind==='pause'&&m.paused));t.f.event('click',pause);assert(t.sent.some(m=>m.kind==='pause'&&!m.paused));
  t.player.dispose();assert.equal(t.frame.src,'about:blank');
 }
 assert(![...store.keys()].some(key=>key.includes(':mother:')),'Mother preview saves no child progress');
 console.log('PASS V142 parent: real iframe route, session/window guards, one award, teacher reveal exclusion, pause/resume messages, cleanup, mother isolation.');
})().catch(e=>{console.error(e);process.exitCode=1;});
