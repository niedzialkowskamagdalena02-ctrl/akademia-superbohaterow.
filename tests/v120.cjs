const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const vm=require('node:vm');
const {pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'..');
const url=name=>pathToFileURL(path.join(root,'assets',name));
(async()=>{
 const {hallEntries120}=await import(url('hall-entries120.js'));
 const {hallPoint120,hallOutline120,hallSurface120,hallHitPolygon120}=await import(url('base-panorama120.js'));
 const {walkRooms,cameraBasis86}=await import(url('base-map86.js'));
 const {panoramaRay119}=await import(url('panorama-software119.js'));
 const {baseWalkMarkup}=await import(url('base-walk85.js'));
 const metadata=JSON.parse(fs.readFileSync(path.join(root,'assets/hq/panorama120/sources.json')));
 assert.equal(metadata.entrances.length,7);
 assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,'assets/hq/panorama120/hall.webp'))).digest('hex'),metadata.sha256);
 assert.deepEqual(new Set(Object.keys(hallEntries120)),new Set(walkRooms.hall.points.map(p=>p.room)));
 let samples=0,poses=0;
 for(const original of walkRooms.hall.points){
  const p=hallPoint120(original),rect=p.panel120,outline=hallOutline120(walkRooms.hall,rect);
  const source=metadata.entrances.find(x=>x.id===p.room);
  assert.deepEqual(source.hit_uv,rect);
  assert.ok(source.crop_reference[1]>220,'No baked header: '+p.room);
  assert.ok(source.crop_reference[1]+source.crop_reference[3]<=1100,'No baked hands or microphone: '+p.room);
  for(const x of [-4,0,4])for(const z of [-3,0,3])for(const turn of [-.3,0,.3]){
   const target=hallSurface120(walkRooms.hall,p.u,p.v),yaw=Math.atan2(target[0]-x,target[2]-z)+turn;
   const pitch=Math.atan2(target[1],Math.hypot(target[0]-x,target[2]-z));
   const basis=cameraBasis86(yaw,pitch),view={x,z},fx=.434,fy=.94,w=390,h=844;
   const hit=hallHitPolygon120(outline,view,basis,fx,fy,w,h);
   assert.ok(hit.length>=3,p.room+' visible from walking position');
   assert.ok(hit.every(([sx,sy])=>Number.isFinite(sx)&&Number.isFinite(sy)&&sx>=-1e-8&&sx<=w+1e-8&&sy>=-1e-8&&sy<=h+1e-8));
   for(const point of outline){
    const dx=point[0]-x,dy=point[1],dz=point[2]-z;
    const depth=dx*basis[6]+dy*basis[7]+dz*basis[8];
    if(depth<=.08)continue;
    const sx=(dx*basis[0]+dz*basis[2])/(depth*fx),sy=(dx*basis[3]+dy*basis[4]+dz*basis[5])/(depth*fy);
    const ray=panoramaRay119(basis,[x,0,z],walkRooms.hall.bounds,sx,sy,fx,fy),norm=Math.hypot(...point);
    assert.ok(Math.hypot(...point.map((n,i)=>ray[i]-n/norm))<1e-8,'Texture and touch projection must agree while walking');samples++;
   }
   poses++;
  }
 }
 const markup=baseWalkMarkup({grade:'2',base:{owned:[]}},'qa','iron',120,'');
 assert.equal((markup.match(/hq120-entry/g)||[]).length,7);
 assert.doesNotMatch(markup,/hq119-plate-art|hq118-art|hq118-entry/);
 const cache=vm.runInNewContext(fs.readFileSync(path.join(root,'sw.js'),'utf8')+'\n({CACHE,ASSETS})',{self:{addEventListener(){}}});
 assert.equal(cache.CACHE,'academy-v123');
 for(const entry of ['base-panorama120.js?v=120','base-panorama120.css?v=120','hall-entries120.js?v=120','hq/panorama120/hall.webp','base-walk85.js?v=120','app.js?v=123'])assert.ok(cache.ASSETS.includes('./assets/'+entry));
 for(const asset of cache.ASSETS){assert.ok(fs.existsSync(path.join(root,asset.split('?')[0])),asset+' exists');}
 console.log(`PASS V120: ${poses} camera positions, ${samples} texture/touch projections, 7 supplied entrances without baked HUD/hands, offline assets.`);
})().catch(e=>{console.error(e);process.exitCode=1;});
