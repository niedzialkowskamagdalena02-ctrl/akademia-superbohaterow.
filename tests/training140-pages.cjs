const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {fixture,Element}=require('./hangar130-dom.cjs');
for(const name of ['id','className','value','title','type'])Object.defineProperty(Element.prototype,name,{get(){return this.getAttribute(name==='className'?'class':name)||'';},set(v){this.setAttribute(name==='className'?'class':name,v);},configurable:true});
Object.defineProperty(Element.prototype,'parentElement',{get(){return this.parentNode;}});
Element.prototype.append=function(...nodes){for(let n of nodes){if(typeof n!=='object'){const el=new Element('span',this.ownerDocument);el.textContent=n;n=el;}this.appendChild(n);}};
Element.prototype.replaceChildren=function(...nodes){this.children=[];this.text='';this.append(...nodes);};
Element.prototype.click=function(){if(!this.disabled)this.onclick?.({target:this,preventDefault(){},stopPropagation(){}});};
Element.prototype.after=function(node){this.parentNode?.appendChild(node);};
Element.prototype.toggleAttribute=function(n,on){if(on)this.setAttribute(n,'');else this.removeAttribute(n);};
const originalHTML=Object.getOwnPropertyDescriptor(Element.prototype,'innerHTML');Object.defineProperty(Element.prototype,'innerHTML',{get:originalHTML.get,set(value){originalHTML.set.call(this,value);const mark=el=>{el.classList.toggle=(name,on)=>{const yes=on??!el.classList.contains(name);if(yes)el.classList.add(name);else el.classList.remove(name);return yes;};el.classList.replace=(a,b)=>{el.classList.remove(a);el.classList.add(b);};el.children.forEach(mark);};mark(this);},configurable:true});
const rootDir=path.join(__dirname,'..'),base=new URL('file://'+rootDir+'/');
function setup(kind,mode,config,restore){
 const file=path.join(rootDir,'assets/training139/pages',kind+'-'+mode+'.html'),html=fs.readFileSync(file,'utf8');
 const f=fixture(),doc=f.doc;doc.querySelector=s=>f.root.querySelector(s);doc.querySelectorAll=s=>f.root.querySelectorAll(s);doc.getElementById=id=>doc.querySelector('#'+id);doc.createElement=tag=>new Element(tag,doc);doc.body=f.root;doc.documentElement=f.root;for(const [,key,value]of html.match(/<html([^>]*)>/)[1].matchAll(/([\w-]+)="([^"]*)"/g))f.root.setAttribute(key,value);
 const bodyAttrs=html.match(/<body([^>]*)>/)?.[1]||'';for(const [,key,value]of bodyAttrs.matchAll(/([\w-]+)="([^"]*)"/g))f.root.setAttribute(key,value);f.root.innerHTML=html.slice(html.indexOf('<main'),html.lastIndexOf('<script'));
 const toggle=el=>{el.classList.toggle=(name,on)=>{const set=on??!el.classList.contains(name);if(set)el.classList.add(name);else el.classList.remove(name);return set;};for(const x of el.children)toggle(x);};toggle(f.root);
 const originalCreate=doc.createElement;doc.createElement=tag=>{const el=originalCreate(tag);toggle(el);return el;};
 const canvas=new Proxy({measureText:t=>({width:String(t).length*8}),getImageData:()=>({data:new Uint8ClampedArray(400*400*4)})},{get:(o,k)=>o[k]||(()=>{}),set:(o,k,v)=>(o[k]=v,true)});
 Element.prototype.getContext=()=>canvas;
 const pageURL=new URL('assets/training139/pages/'+kind+'-'+mode+'.html',base),requestedImages=[];let context;
 const checkURL=value=>{if(!value)return;const url=new URL(value,pageURL);if(url.protocol==='file:')assert(fs.existsSync(url),kind+' missing image '+url.href);requestedImages.push(url.href);};
 let saved={},advances=0,back=0,spoken=[],now=0,timers=[];
 const training={config,restore,asset:s=>!s?s:new URL(String(s).startsWith('assets/')?s:(context.TRAINING139_ASSETS[s]||s),String(s).startsWith('assets/')?base:pageURL).href,css:s=>String(s).replace(/url\(['"]?([^)'"\s]+)['"]?\)/g,(_,p)=>'url("'+training.asset(p)+'")'),storage:{getItem:()=>null,setItem(){}},shuffle:x=>[...x],speak:s=>spoken.push(s),save:s=>{saved={...saved,...structuredClone(s)};},advance:()=>advances++,back:()=>back++,dragCargo(){}};
 class Image{constructor(){this.complete=true;this.naturalWidth=300;this.naturalHeight=300;}set src(v){checkURL(v);this._src=v;this.onload?.();}get src(){return this._src;}}
 const scope={console,document:doc,Training139:training,window:null,Image,performance:{now:()=>now},setTimeout:(fn,ms)=>{timers.push({at:now+ms,fn});return timers.length;},clearTimeout(){},requestAnimationFrame:fn=>0,cancelAnimationFrame(){},matchMedia:()=>({matches:true}),getComputedStyle:()=>({getPropertyValue:()=>''}),SpeechSynthesisUtterance:class{constructor(text){this.text=text;}},speechSynthesis:{cancel(){},speak:u=>spoken.push(u.text)},location:{reload(){back++;}},Math,JSON,Map,Set};scope.window=scope;scope.window.speechSynthesis=scope.speechSynthesis;
 context=vm.createContext(scope);
 const scripts=[...html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)].filter(m=>m[2].trim()&&!m[1].includes('module'));
 for(const m of scripts)vm.runInContext(m[2],context,{filename:path.basename(file),timeout:3000});
 const checkImages=()=>{for(const img of doc.querySelectorAll('img'))checkURL(img.src);};checkImages();
 const run=s=>{const value=vm.runInContext(s,context,{timeout:3000});checkImages();return value;};
 const click=selector=>{const b=doc.querySelector(selector);assert(b,kind+' missing '+selector);b.onclick?.({target:b,preventDefault(){},stopPropagation(){}});return b;};
 const flush=async(ms=10000)=>{now+=ms;for(let n=0;n<20;n++){now+=ms;const ready=timers.filter(t=>t.at<=now);timers=timers.filter(t=>t.at>now);for(const t of ready)t.fn();await Promise.resolve();if(!ready.length)break;}};
 return {doc,run,click,flush,training,checkImages,requestedImages,get saved(){return saved;},get advances(){return advances;},spoken};
}
(async()=>{
 global.document={baseURI:base.href};global.fetch=async url=>({ok:true,json:async()=>JSON.parse(fs.readFileSync(new URL(url),'utf8'))});global.localStorage={getItem:()=>null,setItem(){}};
 const {frameConfig139}=await import(new URL('assets/training139-player.js',base));
 const tasks=[{question:'2 + 3 = ?',answer:'5',options:['4','5','6']}];
 const configs={};for(const kind of ['letters','numbers','order','rhymes','camera','dino','rail','closet'])configs[kind]=await frameConfig139({game:{kind,name:kind},grade:'P',subject:kind==='rail'?'matematyka':'polski',tasks,child:'one',preview:true,signal:new AbortController().signal,material:'',restore:null});
 for(const kind of ['letters','numbers']){
  const f=setup(kind,'pre',configs[kind]);if(kind==='numbers')f.run('start.onclick()');assert(f.saved.config.questions.length===8);const options=f.doc.querySelectorAll('.pick');assert.equal(options.length,f.saved.config.questions[0][2].length);
  const before=f.saved.score;f.run('document.querySelectorAll(".sound")[0].onclick()');assert.equal(f.saved.score,before,'Independent audio never answers');
  f.run('document.querySelectorAll(".pick")[config.questions[i][3]].onclick()');assert.equal(f.saved.score,1);f.click('#next');assert.equal(f.advances,1);
  const r=setup(kind,'pre',configs[kind],f.saved);if(kind==='numbers')r.run('start.onclick()');assert.equal(r.saved.index,1,'Reload index');
 }
 {
  const f=setup('order','pre',configs.order);f.run('render()');for(const letter of f.run('rounds[0][1]'))f.run(`document.querySelectorAll('.pick').find(b=>b.textContent===${JSON.stringify(letter)}).onclick()`);assert(f.doc.querySelector('#play .gold'));f.click('#play .gold');assert.equal(f.advances,1);
 }
 for(const mode of ['pre','school']){
  const f=setup('rhymes',mode,{...configs.rhymes,grade:mode==='pre'?'P':'2'});f.run('render()');assert.equal(f.run('rounds.length'),7);f.run('document.querySelectorAll(".pick").find(b=>b.textContent===rounds[index][3]).onclick()');assert(f.doc.querySelector('#play .gold'));f.click('#play .gold');assert.equal(f.advances,1);
 }
 {
  const f=setup('camera','pre',configs.camera);assert.equal(f.run('scenes.length'),24);const target=f.run('rounds[round][0]');const object=f.doc.querySelectorAll('.object').find(b=>b.textContent===target);assert(object,'Letter is on a photographed object');object.onclick();const count=f.run('found');object.onclick();assert.equal(f.run('found'),count,'Cannot photograph one object twice');
 }
 for(const mode of ['pre','school']){
  const grade=mode==='pre'?'P':'2',config=await frameConfig139({game:{kind:'dino'},grade,subject:'matematyka',tasks,child:'one',preview:true,signal:new AbortController().signal,material:'',restore:null});
  const f=setup('dino',mode,config);assert.equal(f.run('bank.length'),76);f.run('feed([...eggs.children].find(b=>b.textContent===answer))');await f.flush();assert.equal(f.run('score'),1);
 }
 for(const mode of ['pre','school']){
  const f=setup('rail',mode,configs.rail);assert.equal(f.run('catalog.scenes.length'),30);const wagon=f.run('current.wagons[0]'),index=f.run(`current.cargo.findIndex(c=>c[0]===${wagon})`);assert(index>=0);f.run(`load(${index},${wagon})`);assert.equal(f.run('loaded.size'),1);const restore=setup('rail',mode,configs.rail,f.saved);assert.equal(restore.run('loaded.size'),1);assert.equal(restore.run('current.bg'),f.run('current.bg'));
 }
 for(const mode of ['pre','school']){
  const config=await frameConfig139({game:{kind:'closet'},grade:mode==='pre'?'P':'2',subject:'matematyka',tasks,child:'one',preview:true,signal:new AbortController().signal,material:'',restore:null});
  const f=setup('closet',mode,config);assert.equal(f.run('animals.length'),8);for(const [animal,name]of f.run('animals')){f.run(`rounds[index].animal=${JSON.stringify(animal)};rounds[index].name=${JSON.stringify(name)};render()`);f.run(`refuse(${JSON.stringify(animal)})`);f.checkImages();}
  const target=f.run('school?rounds[index].topTask[2]:rounds[index].target');const pick=f.doc.querySelectorAll('#tops .pick').find(b=>b.textContent===target);assert(pick);pick.onclick();assert(f.saved.selected.top!==undefined);const restore=setup('closet',mode,config,f.saved);assert.equal(restore.saved.selected.top,f.saved.selected.top);
 }
 {
  const {alphabet92}=await import(new URL('assets/learning-games92.js',base));const routes=Object.fromEntries([...alphabet92,...alphabet92.map(c=>c.toLocaleLowerCase('pl'))].map(c=>[c,[[[100,100],[112,100]]]]));
  const f=setup('rally','pre',{routes});f.run('render()');assert.equal(f.run('rounds.length'),64);assert.equal(f.run('backgrounds.length'),44);
  const canvas=f.doc.querySelector('canvas');canvas.onpointerdown({pointerId:1,clientX:200,clientY:112.5});canvas.onpointermove({pointerId:1,clientX:224,clientY:112.5});assert.equal(f.saved.index,1);assert.equal(f.advances,1,'Completed rally sign advances mixed training');assert(f.doc.querySelector('.finished'));
 }
 console.log('PASS supplied game scripts: independent sound, letter/number scoring and reload, alphabetical order, seven riddles, camera double-shot guard, dinosaur, both train and wardrobe modes. Simulated DOM/events.');
})().catch(error=>{console.error(error);process.exitCode=1;});
