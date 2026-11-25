const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const native=require('/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/@napi-rs/canvas');
const root=path.resolve(__dirname,'..'),url=file=>new URL('file://'+root+'/assets/'+file),review=path.join(root,'../impact142-render');fs.mkdirSync(review,{recursive:true});
let now=0;Object.defineProperty(global,'performance',{value:{now:()=>now},configurable:true});
function decodeBuffer(bytes){const chunks=[bytes.subarray(0,8)];for(let p=8;p<bytes.length;){const end=p+12+bytes.readUInt32BE(p),kind=bytes.toString('ascii',p+4,p+8);if(!['caBX','iTXt','tEXt','zTXt'].includes(kind))chunks.push(bytes.subarray(p,end));p=end;}return Buffer.concat(chunks);}
(async()=>{
 const geometry=await import(url('hero-impact142.js')),anchors=await import(url('hero-impact-anchors142.js'));
 const {heroPlayer127,action127,frameRect127,drawFrame127}=await import(url('hero-animation127.js'));
 const {cameraBasis86}=await import(url('base-map86.js'));const {heroAssets127:art}=await import(url('hero-assets127.js'));
 let checks=0;for(const room of ['hall','armory'])for(const yaw of [0,.8,2.1,4.8])for(const pitch of [-1,-.3,0,.6,1])for(const aim of [[.1,.15],[.5,.5],[.8,.9]]){
  const view={x:.15,z:-.2},basis=cameraBasis86(yaw,pitch),hit=geometry.hitSurface142(view,basis,.5,1,aim,[7,3.2,6.3],room);assert(hit);const p=geometry.projectImpact142(view,basis,.5,1,800,1400,hit.point);assert(p);assert(Math.hypot(p[0]-aim[0]*800,p[1]-aim[1]*1400)<1e-7,'Ray→actual surface→projection matches pixel');for(const v of [hit.horizontal,hit.vertical,hit.normal])assert(Math.abs(Math.hypot(...v)-1)<1e-8);assert(Math.abs(hit.normal.reduce((n,x,i)=>n+x*hit.horizontal[i],0))<1e-8);checks++;
 }
 for(const [name,meta]of Object.entries(art.files)){const bytes=fs.readFileSync(path.join(root,'assets/hq/hands127',name));assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),meta.sha256,'No supplied PNG changed');}
 const cache=new Map(),pool={peek:k=>cache.get(k),pin(){},release(){},stats:{},async decode(key){if(cache.has(key))return cache.get(key);const bytes=fs.readFileSync(path.join(root,'assets/hq/hands127',key));const image=await native.loadImage(decodeBuffer(bytes));Object.defineProperties(image,{naturalWidth:{value:image.width},naturalHeight:{value:image.height}});cache.set(key,image);return image;},async decodeAll(keys){await Promise.all([...new Set(keys)].map(key=>pool.decode(key)));},async warm(keys,progress,valid){for(const key of keys)assert(fs.existsSync(path.join(root,'assets/hq/hands127',key)));progress(keys.length,keys.length);return valid();}};
 const snapshots=[];let moves=0;
 for(const [key,meta]of Object.entries(anchors.contactAnchors142)){
  const [hero,mode,sideText]=key.split(':'),side=Number(sideText),player=heroPlayer127(hero,()=>{},{resources:pool}),action=action127(hero,mode,side);assert(action,key);
  assert(await player.prepareGesture([mode]));
  // The held contact strike also warms its exact frame in the gesture set.
  if(mode==='shield-hit')await pool.decodeAll(geometry.contactFrameKeys142(hero,mode,side));
  for(const [width,height]of [[400,820],[900,500],[800,1640]]){
   const canvas=native.createCanvas(width,height),ctx=canvas.getContext('2d'),view={x:.1,z:-.2},basis=cameraBasis86(.6,-.14),context={view,basis,fx:.48,fy:.94,bounds:[7,3.2,6.3],room:'hall',reduced:false};
   assert(await player.play(side,mode));const t=now+action.duration*action.contact+.001;player.draw(ctx,canvas,t,context);
   const state=player.stats,point=geometry.contactPoint142(hero,mode,side,action.frames[meta.index],frameRect127(width,height),null),projected=geometry.projectImpact142(view,basis,.48,.94,width,height,state.impact.point);
   assert(Math.hypot(point.x-projected[0],point.y-projected[1])<1e-6,key+' effect at visual contact');
   if(mode==='web')assert.equal(state.marks.length,moves%3+1,'Web starts forming at contact, not after the hand returns');
   const fixed=state.impact.point.slice();now=t+action.duration+1;player.draw(ctx,canvas,now,context);assert.equal(player.busy,false);
   const after=player.stats.marks.at(-1);assert(after,key+' leaves a mark');assert.deepEqual(after.point,fixed,'No moving mark on return');
   const moved={...context,view:{x:.4,z:-.5},basis:cameraBasis86(.8,-.05)};player.draw(ctx,canvas,now+450,moved);assert.deepEqual(player.stats.marks.at(-1).point,fixed,'Camera movement leaves the same world point');
   if(width===400){ctx.strokeStyle='#ff3333';ctx.lineWidth=2;ctx.beginPath();ctx.arc(projected[0],projected[1],10,0,2*Math.PI);ctx.stroke();player.draw(ctx,canvas,now+450,context);ctx.strokeStyle='#ff3333';ctx.beginPath();ctx.arc(projected[0],projected[1],10,0,2*Math.PI);ctx.stroke();const filename=key.replaceAll(':','-')+'.png';fs.writeFileSync(path.join(review,filename),canvas.toBuffer('image/png'));snapshots.push(filename);}
   moves++;
  }
  player.dispose();cache.clear();
 }
 // A hanging/corner/cocoon web's first point is not the geometric image center.
 for(const keys of Object.values(art.webs)){const a=geometry.markAnchor142(keys[0]);assert(a.every(n=>n>0&&n<1));assert.deepEqual(geometry.markAnchor142(keys.at(-1)),a);}
 // Bound the pinned playback window using exact original image dimensions.
 const {gestureModes130}=await import(url('hero-gestures130.js'));
 let maxPinned=0;
 for(const hero of ['hulk','spider','iron','captain','thor']){
  const image={naturalWidth:1280,naturalHeight:720},fake={peek:()=>image,release(){},async decode(){},async decodeAll(){},async warm(){return true;},pin(owner,keys){const bytes=[...new Set(keys)].reduce((sum,k)=>sum+art.files[k].size[0]*art.files[k].size[1]*4,0);maxPinned=Math.max(maxPinned,bytes);assert(bytes<=96*1024*1024,hero+' pinned frames stay within 96 MiB');}};
  const p=heroPlayer127(hero,()=>{},{resources:fake}),ctx=new Proxy({},{get:()=>()=>{},set:()=>true}),context={view:{x:0,z:0},basis:cameraBasis86(0,0),fx:.5,fy:1,bounds:[7,3,6],room:'hall',reduced:false};
  const modes=gestureModes130(hero,true);await p.prepareGesture(modes);
  for(const mode of modes)for(const side of [-1,1]){const action=action127(hero,mode,side);if(!action)continue;await p.play(side,mode);const start=now,durations=action.durations||Array(action.frames.length).fill(action.duration/action.frames.length);for(let i=0;i<action.frames.length;i++){now=start+durations.slice(0,i).reduce((a,b)=>a+b,0)+durations[i]*.4;p.draw(ctx,{width:400,height:820},now,context);}now=start+action.duration+1;p.draw(ctx,{width:400,height:820},now,context);}p.dispose();
 }
 console.log('PASS V142: '+checks+' world-ray round trips, '+moves+' original-animation contact renders at portrait/landscape/2× resolution, web contact timing, fixed world marks after turning/walking, all original PNG hashes, root alignment for all six webs. Review '+review);
})().catch(error=>{console.error(error);process.exitCode=1;});
