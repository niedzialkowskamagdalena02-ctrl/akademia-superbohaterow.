const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {pathToFileURL}=require('node:url');
const native=require('/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/@napi-rs/canvas');
const root=path.resolve(__dirname,'..'),url=n=>pathToFileURL(path.join(root,'assets',n));
const review=path.resolve(process.env.REVIEW127||path.join(root,'../v127-review'));fs.mkdirSync(review,{recursive:true});
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
global.Image=class extends native.Image{
 set src(value){requests.push(value);try{const b=fs.readFileSync(path.join(root,value));super.src=b[0]===137?decodeBuffer(b):b;}catch(e){queueMicrotask(()=>this.onerror?.(e));}}
 get naturalWidth(){return this.width;}get naturalHeight(){return this.height;}
};
(async()=>{
 const {heroAssets127:art}=await import(url('hero-assets127.js'));
 const {heroModes127,heroPlayer127,action127,idleKey127,frameIndex127,frameRect127,powerMarkup127,hitSurface127}=await import(url('hero-animation127.js'));
 const {cameraBasis86}=await import(url('base-map86.js'));
 const sourceRoot=path.join(root,'../animations_refs/selected');
 for(const [name,meta]of Object.entries(art.files)){
  const bytes=fs.readFileSync(path.join(root,'assets/hq/hands127',name));
  assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),meta.sha256);
  for(const ref of meta.originals){
   const original=ref.startsWith('COMMON/')?path.join(sourceRoot,'../raw',ref.slice(7)):path.join(sourceRoot,ref);
   assert.deepEqual(bytes,fs.readFileSync(original),'Supplied PNG must remain byte-for-byte identical: '+ref);
  }
 }
 const canvas=native.createCanvas(709,1384),ctx=canvas.getContext('2d');
 const basis=cameraBasis86(0,0),context={view:{x:0,z:0},basis,fx:.48,fy:.94,bounds:[7,3.2,6.3],room:'hall',reduced:false};
 let actions=0,frames=0,changes=0;const sequences=[];
 for(const hero of Object.keys(heroModes127)){
  const player=heroPlayer127(hero,()=>changes++);
  assert.ok(await player.setMode('punch'));assert.equal(player.loading,false);
  assert.ok(idleKey127(hero,'punch'));assert.match(powerMarkup127(hero),/data-walk-mode/);
  for(const [mode]of heroModes127[hero]){
   assert.ok(await player.setMode(mode));
   for(const side of [-1,1]){
    const action=action127(hero,mode,side);if(!action)continue;
    assert.equal(action.frames.length,8);assert.ok(await player.play(side),hero+"/"+mode+"/"+side+": "+player.error);assert.equal(player.busy,true);
    const origin=clock,shots=[];
    for(let i=0;i<8;i++){
     clock=origin+(i+.4)*action.duration/8;
     assert.equal(frameIndex127(clock-origin,action.duration,8),i);
     assert.ok(player.draw(ctx,canvas,clock,context));
     const rgba=ctx.getImageData(0,0,canvas.width,canvas.height).data;
     assert.ok(rgba.some((v,j)=>j%4===3&&v>128),'Nonempty original hands frame');
     const filename=hero+'-'+mode+'-'+side+'-'+i+'.png';
     fs.writeFileSync(path.join(review,filename),canvas.toBuffer('image/png'));shots.push(filename);frames++;
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
 for(const [w,h]of [[393,852],[709,1384],[1200,600],[2400,1080]]){const r=frameRect127(w,h);assert.ok(Math.abs(r.w/r.h-1280/720)<1e-9);assert.equal(r.y+r.h,h);}
 const floor=hitSurface127({x:0,z:0},basis,.48,.94,[.5,.73],[7,3.2,6.3],true);assert.equal(floor.axis,1);assert.ok(Math.abs(floor.point[1]+1.58)<.002);
 const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');assert.match(sw,/academy-v128/);
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
 }
 class Surface extends Element{
  constructor(){super();this.backing=native.createCanvas(393,852);}
  get width(){return this.backing.width;}set width(v){this.backing.width=v;}
  get height(){return this.backing.height;}set height(v){this.backing.height=v;}
  getContext(kind,options){return kind==='2d'?this.backing.getContext(kind,options):null;}
 }
 const stage=new Element(),scene=new Element({hero:'captain',child:'v127-controller'}),hands=new Surface(),world=new Surface(),software=new Surface(),fallback=new Element(),status=new Element();
 const modes=heroModes127.captain.map(([id])=>new Element({walkMode:id})),buttons=[new Element({walkPower:'-1'}),new Element({walkPower:'1'})];
 stage.querySelector=s=>s==='.hq119-software'?software:s==='.hq127-status'?status:s==='[data-walk-back]'||s==='[data-action="hq:view:menu"]'?new Element():null;
 stage.querySelectorAll=s=>s==='[data-walk-mode]'?modes:s==='[data-walk-power]'?buttons:[];
 scene.querySelector=s=>s==='.hq86-stage'?stage:s==='.hq86-world'?world:s==='.hq86-hands'?hands:s==='.hq86-fallback'?fallback:s==='.hq86-location'||s==='.hq86-release'?new Element():null;
 const raf=new Map();let rid=0;
 global.requestAnimationFrame=fn=>{raf.set(++rid,fn);return rid;};global.cancelAnimationFrame=id=>raf.delete(id);
 global.window=new EventTarget();window.matchMedia=()=>({matches:false});window.devicePixelRatio=1;
 global.ResizeObserver=class{observe(){}disconnect(){}};
 global.document={createElement:()=>native.createCanvas(1,1)};
 const {mountBaseWalk}=await import(url('base-walk85.js'));
 mountBaseWalk(scene);
 const settle=async predicate=>{for(let i=0;i<100;i++){if(predicate())return;await new Promise(r=>setTimeout(r,20));}throw Error('Controller did not settle: '+status.textContent);};
 await settle(()=>stage.attrs['aria-busy']==='false'&&!buttons[0].disabled);
 assert.equal(status.textContent,'');modes[1].dispatchEvent(new Event('click'));
 await settle(()=>modes[1].attrs['aria-pressed']==='true'&&!buttons[1].disabled);
 assert.equal(buttons[0].disabled,true,'Shield is held by the original right hand');
 buttons[1].dispatchEvent(new Event('click'));assert.equal(buttons[1].disabled,true);
 await settle(()=>status.textContent==='');
 clock+=600;for(const [id,draw]of [...raf]){raf.delete(id);draw(clock);}
 assert.ok(hands.getContext('2d').getImageData(0,600,393,252).data.some((v,i)=>i%4===3&&v>128));
 clock+=1600;for(const [id,draw]of [...raf]){raf.delete(id);draw(clock);}assert.equal(buttons[1].disabled,false);
 mountBaseWalk(null);
 console.log(`PASS V127: ${Object.keys(art.files).length} untouched original PNGs, ${actions} movements / ${frames} rendered frames, original proportions, both hands, room marks, initial load, real controller mode/click wiring; ${changes} updates.`);
})().catch(e=>{console.error(e);process.exitCode=1;});
