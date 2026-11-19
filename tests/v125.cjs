const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),vm=require('node:vm');
const {pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'..'),url=n=>pathToFileURL(path.join(root,'assets',n));
(async()=>{
 const {hallEntries125,hallDetails125}=await import(url('hall-details125.js'));
 const {hallPoint120,hallOutline120,hallSurface120,hallDensity125}=await import(url('base-panorama125.js'));
 const {hallHitPolygon120}=await import(url('base-panorama120.js'));
 const {walkRooms,cameraBasis86}=await import(url('base-map86.js'));
 const {panoramaRay119,panoramaSoftware119}=await import(url('panorama-software119.js'));
 const {baseWalkMarkup,panoramaWorld}=await import(url('base-walk85.js'));
 const meta=JSON.parse(fs.readFileSync(path.join(root,'assets/hq/panorama125/sources.json')));
 assert.deepEqual(meta.panorama.native_size,[1774,887]);assert.equal(hallDetails125.length,11);
 for(const [name,data]of Object.entries(meta.files))assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,'assets/hq/panorama125',name))).digest('hex'),data.sha256);
 assert.deepEqual(new Set(Object.keys(hallEntries125)),new Set(walkRooms.hall.points.map(p=>p.room)));
 let poses=0,samples=0;
 for(const point of walkRooms.hall.points){
  const p=hallPoint120(point),outline=hallOutline120(walkRooms.hall,p.panel120);
  for(const x of [-4,0,4])for(const z of [-3,0,3])for(const turn of [-.25,0,.25]){
   const target=hallSurface120(walkRooms.hall,p.u,p.v),yaw=Math.atan2(target[0]-x,target[2]-z)+turn;
   const pitch=Math.atan2(target[1],Math.hypot(target[0]-x,target[2]-z));
   const basis=cameraBasis86(yaw,pitch),fx=.434,fy=.94;
   const hit=hallHitPolygon120(outline,{x,z},basis,fx,fy,390,844);
   assert.ok(hit.length>=3,p.room+' entrance visible');
   for(const a of outline){
    const dx=a[0]-x,dy=a[1],dz=a[2]-z,depth=dx*basis[6]+dy*basis[7]+dz*basis[8];if(depth<=.08)continue;
    const sx=(dx*basis[0]+dz*basis[2])/(depth*fx),sy=(dx*basis[3]+dy*basis[4]+dz*basis[5])/(depth*fy);
    const ray=panoramaRay119(basis,[x,0,z],walkRooms.hall.bounds,sx,sy,fx,fy),norm=Math.hypot(...a);
    assert.ok(Math.hypot(...a.map((n,i)=>ray[i]-n/norm))<1e-8);samples++;
   }poses++;
  }
 }
 const phone=hallDensity125(393,852,2.75);assert.equal(phone,2.75,'Native phone density is no longer capped at 2.45');
 for(const soft of [false,true])for(const [w,h]of [[393,852],[2560,1440]]){
  const d=hallDensity125(w,h,4,soft);assert.ok(w*h*d*d<=(soft?1_500_000:4_000_000)+1);
 }
 const html=baseWalkMarkup({grade:'2',base:{owned:[]}},'qa','iron',125,'');
 assert.equal((html.match(/hq120-entry/g)||[]).length,7);assert.doesNotMatch(html,/hq119-plate-art|hq118-art/);
 // Capture the actual generated shader and uploads; compile/render it in v125-gpu.py.
 const captures=[];
 for(const vectors of [16,64]){
  const sources={},calls=[];
  const gl=new Proxy({VERTEX_SHADER:1,FRAGMENT_SHADER:2,MAX_FRAGMENT_UNIFORM_VECTORS:3,MAX_TEXTURE_SIZE:4,LINK_STATUS:5,
   getParameter:p=>p===3?vectors:2048,getProgramParameter:()=>true,createShader:type=>({type}),
   shaderSource:(s,code)=>sources[s.type]=code,getUniformLocation:(_,n)=>n,
   uniform1f:(n,v)=>calls.push([n,v]),getAttribLocation:()=>0},
   {get:(o,k)=>k in o?o[k]:()=>({})});
  const renderer=panoramaWorld({getContext:()=>gl});assert.ok(renderer);
  const image={naturalWidth:1774,naturalHeight:887},atlas={naturalWidth:2048,naturalHeight:2048};
  renderer.load(image,null,walkRooms.hall,atlas);assert.ok(calls.some(([k,v])=>k==='hasDetails'&&v===1));
  renderer.load(image,null,walkRooms.pet,null);assert.deepEqual(calls.at(-1),['hasDetails',0]);
  captures.push({vectors,vertex:sources[1],fragment:sources[2]});
 }
 // Software fallback takes the same native tiles, and clears them on room changes.
 const draws=[];const context=new Proxy({drawImage:(...a)=>draws.push(a),getTransform:()=>({})},{get:(o,k)=>k in o?o[k]:()=>{}});
 global.document={createElement:()=>({width:0,height:0,getContext:()=>context})};
 const canvas={width:120,height:240,getContext:()=>context},software=panoramaSoftware119(canvas);
 const image={naturalWidth:1774,naturalHeight:887},atlas={naturalWidth:2048,naturalHeight:2048};
 software.load(image,null,walkRooms.hall,atlas);assert.equal(draws.length,11);
 for(const tile of hallDetails125){
  const u=tile.uv[0]+tile.uv[2]/2,v=tile.uv[1]+tile.uv[3]/2;
  software.draw({x:0,z:0},cameraBasis86((u-.5)*2*Math.PI,(.5-v)*Math.PI/1.36),.43,.94,0);
 }
 assert.ok(draws.some(a=>a[0]!==image&&a[0]!==atlas),'Native detail layers rendered');
 draws.length=0;software.load(image,null,walkRooms.pet);software.draw({x:0,z:0},cameraBasis86(0,0),.43,.94,0);
 assert.ok(draws.every(a=>a[0]===image),'Hall detail layers cannot leak into the pet room');
 delete global.document;
 if(process.env.V125_GPU_CAPTURE)fs.writeFileSync(process.env.V125_GPU_CAPTURE,JSON.stringify({captures,tiles:hallDetails125,bounds:walkRooms.hall.bounds}));
 const sw=vm.runInNewContext(fs.readFileSync(path.join(root,'sw.js'),'utf8')+'\n({CACHE,ASSETS})',{self:{addEventListener(){}}});
 assert.equal(sw.CACHE,'academy-v128');
 for(const entry of ['base-panorama125.js?v=125','hall-details125.js?v=125','hq/panorama125/hall.webp','hq/panorama125/details.webp','base-walk85.js?v=128','panorama-software119.js?v=128','app.js?v=128'])assert.ok(sw.ASSETS.includes('./assets/'+entry));
 assert.ok(!sw.ASSETS.includes('./assets/hq/panorama120/hall.webp'),'Old 6K upsample is no longer cached');
 for(const asset of sw.ASSETS)assert.ok(fs.existsSync(path.join(root,asset.split('?')[0])),asset);
 console.log(`PASS V125: ${poses} walking poses, ${samples} texture/touch projections, 7 entrances, native GPU/software tiles, low-uniform GPU variant, DPR budget, offline cache.`);
})().catch(e=>{console.error(e);process.exitCode=1;});
