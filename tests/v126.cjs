const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),vm=require('node:vm');
const {pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'..'),url=n=>pathToFileURL(path.join(root,'assets',n));
(async()=>{
 const {hallBoards126,hallFaces126,hallPoint120,hallOutline120,hallSurface120,hallDensity125,quadMatrix126}=await import(url('base-panorama126.js'));
 const {hallHitPolygon120}=await import(url('base-panorama120.js'));
 const {walkRooms,cameraBasis86}=await import(url('base-map86.js'));
 const {panoramaRay119}=await import(url('panorama-software119.js'));
 const {cubeFace126,cubeUV126,clipCube126,panoramaSoftware126}=await import(url('panorama-software126.js'));
 const {baseWalkMarkup,panoramaWorld}=await import(url('base-walk85.js'));
 const meta=JSON.parse(fs.readFileSync(path.join(root,'assets/hq/panorama126/sources.json')));
 assert.deepEqual(meta.source_size,[6144,3072]);assert.equal(hallFaces126.length,6);
 for(const [name,data]of Object.entries(meta.files)){
  assert.deepEqual(data.size,[2048,2048]);
  assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,'assets/hq/panorama126',name))).digest('hex'),data.sha256);
 }
 assert.deepEqual(new Set(Object.keys(hallBoards126)),new Set(walkRooms.hall.points.map(p=>p.room)));
 let poses=0,samples=0;
 for(const original of walkRooms.hall.points){
  const p=hallPoint120(original),outline=hallOutline120(walkRooms.hall,p.panel120);
  const center=hallSurface120(walkRooms.hall,p.u,p.v),length=Math.hypot(...center);
  assert.ok(Math.abs(.5-Math.asin(center[1]/length)/Math.PI-p.v)<1e-10,'New sphere uses 180 degrees vertically');
  for(const x of [-4,0,4])for(const z of [-3,0,3])for(const turn of [-.22,0,.22]){
   const yaw=Math.atan2(center[0]-x,center[2]-z)+turn,pitch=Math.atan2(center[1],Math.hypot(center[0]-x,center[2]-z));
   const basis=cameraBasis86(yaw,pitch),fx=.434,fy=.94,hit=hallHitPolygon120(outline,{x,z},basis,fx,fy,390,844);
   assert.ok(hit.length>=3,p.room+' visible while walking');
   for(const a of outline){
    const dx=a[0]-x,dy=a[1],dz=a[2]-z,depth=dx*basis[6]+dy*basis[7]+dz*basis[8];if(depth<=.08)continue;
    const sx=(dx*basis[0]+dz*basis[2])/(depth*fx),sy=(dx*basis[3]+dy*basis[4]+dz*basis[5])/(depth*fy);
    const ray=panoramaRay119(basis,[x,0,z],walkRooms.hall.bounds,sx,sy,fx,fy),norm=Math.hypot(...a);
    assert.ok(Math.hypot(...a.map((n,i)=>ray[i]-n/norm))<1e-8);samples++;
   }poses++;
  }
 }
 // Each projected text corner lands at the corresponding painted board corner.
 const quad=[[30,20],[700,32],[640,150],[80,170]],m=quadMatrix126(quad,1000,170);
 for(const [i,[x,y]]of [[0,[0,0]],[1,[1000,0]],[2,[1000,170]],[3,[0,170]]]){
  const w=m[3]*x+m[7]*y+m[15];assert.ok(Math.hypot((m[0]*x+m[4]*y+m[12])/w-quad[i][0],(m[1]*x+m[5]*y+m[13])/w-quad[i][1])<1e-8);
 }
 for(let face=0;face<6;face++){
  const d=[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]][face];assert.equal(cubeFace126(d),face);assert.deepEqual(cubeUV126(d),[.5,.5]);
 }
 // A screen triangle crossing cube boundaries must retain all of its area.
 const triangle=[{screen:[0,0],dir:[1,.1,.8]},{screen:[80,0],dir:[.8,.1,1]},{screen:[40,100],dir:[.3,1,.7]}];
 const area=p=>Math.abs(p.reduce((s,a,i)=>{const b=p[(i+1)%p.length];return s+a.screen[0]*b.screen[1]-a.screen[1]*b.screen[0];},0))/2;
 assert.ok(Math.abs(Array.from({length:6},(_,f)=>area(clipCube126(triangle,f))).reduce((a,b)=>a+b,0)-area(triangle))<1e-8);
 assert.equal(hallDensity125(393,852,2.75),2.75);
 const html=baseWalkMarkup({grade:'2',base:{owned:[]}},'qa','iron',126,'');
 assert.equal((html.match(/hq120-entry/g)||[]).length,7);assert.equal((html.match(/class="hq126-sign"/g)||[]).length,7);
 assert.doesNotMatch(html,/hq119-plate-art|hq118-art|panorama125/);
 const sources={},calls=[];
 let cubeLimit=2048;
 const constants={VERTEX_SHADER:1,FRAGMENT_SHADER:2,MAX_CUBE_MAP_TEXTURE_SIZE:3,MAX_TEXTURE_SIZE:4,LINK_STATUS:5,TEXTURE_CUBE_MAP_POSITIVE_X:0x8515};
 const gl=new Proxy({...constants,getParameter:p=>p===3?cubeLimit:2048,getProgramParameter:()=>true,createShader:type=>({type}),
  shaderSource:(s,code)=>sources[s.type]=code,getUniformLocation:(_,n)=>n,getAttribLocation:()=>0,
  texImage2D:(...a)=>calls.push(a),uniform1f:(n,v)=>calls.push([n,v])},{get:(o,k)=>k in o?o[k]:()=>({})});
 const renderer=panoramaWorld({getContext:()=>gl}),faces=Array.from({length:6},(_,face)=>({face,naturalWidth:2048,naturalHeight:2048}));
 renderer.load(null,null,walkRooms.hall,faces);
 assert.ok(calls.some(([n,v])=>n==='useHall'&&v===1));
 for(let i=0;i<6;i++)assert.ok(calls.some(a=>a[0]===0x8515+i&&a.at(-1)===faces[i]),'All full-size faces uploaded');
 cubeLimit=1024;assert.equal(renderer.load(null,null,walkRooms.hall,faces),false,'Use software rather than silently shrinking the hall');
 renderer.load({naturalWidth:100,naturalHeight:100},null,walkRooms.pet);assert.ok(calls.some(([n,v])=>n==='useHall'&&v===0));
 // Exercise software along the complete turn and at the roof and floor.
 const draws=[],ctx=new Proxy({drawImage:(...a)=>draws.push(a)},{get:(o,k)=>k in o?o[k]:()=>{}});
 const soft=panoramaSoftware126({width:120,height:220,getContext:()=>ctx});soft.load(null,null,walkRooms.hall,faces);
 for(let i=0;i<16;i++)soft.draw({x:0,z:0},cameraBasis86(i*Math.PI/8,i===0?1.55:i===1?-1.55:0),.434,.94,0);
 assert.deepEqual(new Set(draws.map(a=>a[0].face)),new Set([0,1,2,3,4,5]));
 const other={naturalWidth:200,naturalHeight:100};draws.length=0;soft.load(other,null,walkRooms.pet);soft.draw({x:0,z:0},cameraBasis86(0,0),.434,.94,0);
 assert.ok(draws.every(a=>a[0]===other),'Cube cannot leak into other rooms');
 if(process.env.V126_GPU_CAPTURE)fs.writeFileSync(process.env.V126_GPU_CAPTURE,JSON.stringify({vertex:sources[1],fragment:sources[2],bounds:walkRooms.hall.bounds}));
 const sw=vm.runInNewContext(fs.readFileSync(path.join(root,'sw.js'),'utf8')+'\n({CACHE,ASSETS})',{self:{addEventListener(){}}});assert.equal(sw.CACHE,'academy-v127');
 for(const face of hallFaces126)assert.ok(sw.ASSETS.includes('./assets/hq/'+face));
 for(const asset of sw.ASSETS)assert.ok(fs.existsSync(path.join(root,asset.split('?')[0])),asset);
 assert.ok(!sw.ASSETS.some(a=>/panorama119\/|panorama125\/|views118\/.+\.png/.test(a)));
 console.log(`PASS V126: ${poses} camera poses, ${samples} image/touch projections, seven vector signs, complete native cube on GPU/software, seam clipping, low-GPU fallback and current offline assets.`);
})().catch(e=>{console.error(e);process.exitCode=1;});
