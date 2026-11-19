const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {pathToFileURL}=require('node:url');
const native=require('/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/@napi-rs/canvas');
const root=path.resolve(__dirname,'..'),url=n=>pathToFileURL(path.join(root,'assets',n));
const review=path.resolve(process.env.REVIEW127||path.join(root,'../v129-review'));fs.mkdirSync(review,{recursive:true});
let clock=0,requests=[];
Object.defineProperty(global,'performance',{value:{now:()=>clock},configurable:true});
// The native preview decoder misidentifies PNGs whose C2PA metadata contains
// an SVG thumbnail. Drop metadata only in this test's in-memory decode buffer.
// The application and distribution retain every original byte (checked below).
function decodeBuffer(bytes){
 const chunks=[bytes.subarray(0,8)];
 for(let p=8;p<bytes.length;){const end=p+12+bytes.readUInt32BE(p),kind=bytes.toString('ascii',p+4,p+8);if(!['caBX','iTXt','tEXt','zTXt'].includes(kind))chunks.push(bytes.subarray(p,end));p=end;}
 return Buffer.concat(chunks);
}
const blobURLs=new Map();let blobID=0;
URL.createObjectURL=blob=>{const id='test-blob:'+ ++blobID;blobURLs.set(id,blob);return id;};
URL.revokeObjectURL=id=>blobURLs.delete(id);
let network=0;
global.fetch=async url=>{network++;return new Response(fs.readFileSync(path.join(root,String(url))),{status:200});};
global.Image=class extends native.Image{
 set src(value){
  if(!value)return;
  requests.push(value);
  if(value.startsWith('test-blob:')){
   const blob=blobURLs.get(value);if(!blob){queueMicrotask(()=>this.onerror?.(new Error('Missing blob')));return;}
   blob.arrayBuffer().then(buffer=>{const b=Buffer.from(buffer);super.src=decodeBuffer(b);}).catch(e=>this.onerror?.(e));
  }else try{const b=fs.readFileSync(path.join(root,value));super.src=b[0]===137?decodeBuffer(b):b;}catch(e){queueMicrotask(()=>this.onerror?.(e));}
 }
 async decode(){}
 get naturalWidth(){return this.width;}get naturalHeight(){return this.height;}
};
(async()=>{
 const {heroAssets127:art}=await import(url('hero-assets127.js'));
 const {heroModes127,heroPlayer127,action127,idleKey127,frameIndex127,frameRect127,powerMarkup127,hitSurface127}=await import(url('hero-animation127.js'));
 const {cameraBasis86}=await import(url('base-map86.js'));
 const {heroResources129}=await import(url('hero-resources129.js').href+'?v=129');
 let maxBytes=0;
 const sourceRoot=path.join(root,'../animations_refs/selected');
 for(const [name,meta]of Object.entries(art.files)){
  const bytes=fs.readFileSync(path.join(root,'assets/hq/hands127',name));
  assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),meta.sha256);
  for(const ref of meta.originals){
   const original=ref.startsWith('COMMON/')?path.join(sourceRoot,'../raw',ref.slice(7)):path.join(sourceRoot,ref);
   assert.deepEqual(bytes,fs.readFileSync(original),'Supplied PNG must remain byte-for-byte identical: '+ref);
  }
 }
 const canvas=native.createCanvas(640,360),ctx=canvas.getContext('2d');
 const basis=cameraBasis86(0,0),context={view:{x:0,z:0},basis,fx:.48,fy:.94,bounds:[7,3.2,6.3],room:'hall',reduced:false};
 let actions=0,frames=0,changes=0;const sequences=[];
 for(const hero of Object.keys(heroModes127)){
  const player=heroPlayer127(hero,()=>changes++);
  assert.ok(await player.setMode('punch'));assert.equal(player.loading,false);
  assert.ok(idleKey127(hero,'punch'));assert.ok(!/button|data-walk-mode/.test(powerMarkup127(hero)));
  for(const [mode]of heroModes127[hero]){
   assert.ok(await player.setMode(mode));
   for(const side of [-1,1]){
    const action=action127(hero,mode,side);if(!action)continue;
    const netBefore=network;
    const started=player.play(side);
    assert.equal(player.animated,true,'Playback starts in the same input turn, before any await');
    assert.equal(network,netBefore,'No network download in front of the first frame');
    assert.ok(await started,hero+"/"+mode+"/"+side+": "+player.error);assert.equal(player.busy,true);
    await heroResources129.decodeAll(action.frames.slice(0,4).flatMap(f=>typeof f==='string'?[f]:f.layers.map(l=>l.src)));
    const origin=clock,shots=[];
    for(let i=0;i<action.frames.length;i++){
     const timings=action.durations??Array(action.frames.length).fill(action.duration/action.frames.length);
     clock=origin+timings.slice(0,i).reduce((a,b)=>a+b,0)+timings[i]*.4;
     assert.equal(frameIndex127(clock-origin,action.duration,action.frames.length,false,action.durations),i);
     assert.ok(player.draw(ctx,canvas,clock,context));
     const rgba=ctx.getImageData(0,0,canvas.width,canvas.height).data;
     assert.ok(rgba.some((v,j)=>j%4===3&&v>128),'Nonempty original hands frame');
     assert.equal(player.stats.shown,i,'Every original frame is renderable: '+hero+'/'+mode+'/'+i);
     const filename=hero+'-'+mode+'-'+side+'-'+i+'.png';
     if([0,Math.floor(action.frames.length/2),action.frames.length-1].includes(i))fs.writeFileSync(path.join(review,filename),canvas.toBuffer('image/png'));
     shots.push(filename);frames++;
     maxBytes=Math.max(maxBytes,player.stats.decodedBytes);
     assert.ok(player.stats.decodedBytes<=player.stats.decodedBudget,'Bound decoded memory');
     await heroResources129.decodeAll(action.frames.slice(Math.max(0,i-1),Math.min(action.frames.length,i+5)).flatMap(f=>typeof f==='string'?[f]:f.layers.map(l=>l.src)));
    }
    clock=origin+action.duration+1;player.draw(ctx,canvas,clock,context);assert.equal(player.busy,false);
    // Stationary marks must project without exceptions after turning and walking.
    player.draw(ctx,canvas,clock+450,{...context,view:{x:.25,z:.3},basis:cameraBasis86(.25,-.1)});
    player.draw(ctx,canvas,clock+900,{...context,basis:cameraBasis86(Math.PI,0)});
    sequences.push({hero,mode,side,files:shots});actions++;
   }
  }
  player.dispose();assert.equal(player.busy,false);
 }
 const before=requests.length,unsupported=heroPlayer127('wanda');assert.equal(unsupported.supported,false);assert.equal(await unsupported.play(1),false);assert.equal(requests.length,before);
 // Mixed actions must also start immediately after all gesture modes are warmed.
 const {gestureModes130,handAction130}=await import(url('hero-gestures130.js'));
 for(const hero of Object.keys(heroModes127)){
  const player=heroPlayer127(hero),modes=gestureModes130(hero,true);assert(await player.prepareGesture(modes),player.error);
  const held=hero==='captain'||hero==='thor';
  if(held){assert(player.equip(hero==='captain'?'shield':'hammer'));clock+=200;player.draw(ctx,canvas,clock,context);}
  for(const side of [-1,1])for(const double of [false,true]){
   const move=handAction130(hero,side,double,true,held),net=network;
   const started=player.play(side,move.mode,{preserveOther:move.preserveOther});assert(player.animated);assert.equal(network,net);assert(await started);
   const action=action127(hero,move.mode,side);clock+=action.duration*.45;player.draw(ctx,canvas,clock,context);clock+=action.duration;player.draw(ctx,canvas,clock,context);
   assert(player.stats.decodedBytes<=player.stats.decodedBudget,'Mixed-gesture decoded memory remains bounded: '+hero);
  }
  player.dispose();
 }
 for(const [w,h]of [[393,852],[709,1384],[1200,600],[2400,1080]]){const r=frameRect127(w,h);assert.ok(Math.abs(r.w/r.h-1280/720)<1e-9);assert.equal(r.y+r.h,h);}
 const floor=hitSurface127({x:0,z:0},basis,.48,.94,[.5,.73],[7,3.2,6.3],true);assert.equal(floor.axis,1);assert.ok(Math.abs(floor.point[1]+1.58)<.002);
 const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');assert.match(sw,/academy-v131/);
 assert.ok(!sw.includes('hands90-hulk.webp'));assert.ok(!sw.includes('hands127/'),'Do not force all heroes PNGs to download during app update');
 const removed=JSON.parse(fs.readFileSync(path.join(root,'V127_REMOVED.json')));assert.equal(removed.length,12);for(const file of removed)assert.ok(!fs.existsSync(path.join(root,file)));
 fs.writeFileSync(path.join(review,'sequences.json'),JSON.stringify(sequences,null,2));
 // Mount the actual walk controller against DOM event targets and native canvases.
 // This catches wiring/initial-loading errors beyond testing the player directly.
 class Element extends EventTarget{
  constructor(dataset={}){super();this.dataset=dataset;this.hidden=false;this.disabled=false;this.textContent='';this.attrs={};this.style={setProperty(){}};
   const set=new Set();this.classList={add:n=>set.add(n),remove:n=>set.delete(n),contains:n=>set.has(n),toggle:(n,v)=>v===false?set.delete(n):set.add(n)};}
  setAttribute(k,v){this.attrs[k]=v;}removeAttribute(k){delete this.attrs[k];}
  querySelector(){return null;}querySelectorAll(){return [];}closest(){return null;}
  getBoundingClientRect(){return {width:393,height:852,left:0,top:0};}
  setPointerCapture(){}hasPointerCapture(){return true;}
 }
 class Surface extends Element{
  constructor(){super();this.backing=native.createCanvas(393,852);}
  get width(){return this.backing.width;}set width(v){this.backing.width=v;}
  get height(){return this.backing.height;}set height(v){this.backing.height=v;}
  getContext(kind,options){return kind==='2d'?this.backing.getContext(kind,options):null;}
 }
 const stage=new Element(),scene=new Element({hero:'captain',child:'v130-controller',handAttribute:'1'}),hands=new Surface(),world=new Surface(),software=new Surface(),fallback=new Element(),status=new Element();
 stage.querySelector=s=>s==='.hq119-software'?software:s==='.hq127-status'?status:s==='[data-walk-back]'||s==='[data-action="hq:view:menu"]'?new Element():null;
 stage.querySelectorAll=()=>[];
 scene.querySelector=s=>s==='.hq86-stage'?stage:s==='.hq86-world'?world:s==='.hq86-hands'?hands:s==='.hq86-fallback'?fallback:s==='.hq86-location'||s==='.hq86-release'?new Element():null;
 const raf=new Map();let rid=0;
 global.requestAnimationFrame=fn=>{raf.set(++rid,fn);return rid;};global.cancelAnimationFrame=id=>raf.delete(id);
 global.window=new EventTarget();window.matchMedia=()=>({matches:false});window.devicePixelRatio=1;
 global.ResizeObserver=class{observe(){}disconnect(){}};
 global.document={createElement:()=>native.createCanvas(1,1)};
 const {mountBaseWalk}=await import(url('base-walk85.js'));
 mountBaseWalk(scene);
 const settle=async predicate=>{for(let i=0;i<300;i++){if(predicate())return;await new Promise(r=>setTimeout(r,20));}throw Error('Controller did not settle: '+status.textContent);};
 await settle(()=>stage.attrs['aria-busy']==='false'&&status.textContent==='');
 const {handZones130}=await import(url('hero-gestures130.js'));
 const drawStep=ms=>{clock+=ms;for(const [id,draw]of [...raf]){raf.delete(id);draw(clock);}};
 const dispatch=(target,type,x,y)=>{const event=new Event(type,{cancelable:true});Object.assign(event,{pointerId:1,pointerType:'touch',button:0,clientX:x,clientY:y});target.dispatchEvent(event);};
 const zone=handZones130('captain',false,393,852)[1],x=(zone.left+zone.right)/2,y=(zone.top+zone.bottom)/2;
 dispatch(stage,'pointerdown',x,y);dispatch(stage,'pointermove',x,y-65);dispatch(window,'pointerup',x,y-65);drawStep(200);
 const armed=handZones130('captain',true,393,852)[1],ax=(armed.left+armed.right)/2,ay=(armed.top+armed.bottom)/2;
 const netBeforeGesture=network;
 dispatch(stage,'pointerdown',ax,ay);dispatch(window,'pointerup',ax,ay);clock+=100;
 dispatch(stage,'pointerdown',ax,ay);dispatch(window,'pointerup',ax,ay);
 assert.equal(network,netBeforeGesture,'Prepared double tap starts the throw without a download');
 drawStep(600);
 assert.ok(hands.getContext('2d').getImageData(0,600,393,252).data.some((v,i)=>i%4===3&&v>128));
 drawStep(1600);
 mountBaseWalk(null);
 console.log(`PASS V129: ${Object.keys(art.files).length} untouched original PNGs, ${actions} full movements / ${frames} rendered frames, synchronous start without network, bounded decoded memory (${(maxBytes/1024/1024).toFixed(1)} MiB), real touch controller equip/double-tap wiring; ${changes} updates.`);
})().catch(e=>{console.error(e);process.exitCode=1;});
