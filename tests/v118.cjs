const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const vm=require('node:vm');
const {pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'..');
const moduleUrl=name=>pathToFileURL(path.join(root,'assets',name));
const inside=([x,y],points)=>{
 let hit=false;
 for(let i=0,j=points.length-1;i<points.length;j=i++){
  const [a,b]=points[i],[c,d]=points[j];
  if((b>y)!==(d>y)&&x<(c-a)*(y-b)/(d-b)+a)hit=!hit;
 }
 return hit;
};
(async()=>{
 const {hallViews118,hallView118,fitArt118,hallMarkup118}=await import(moduleUrl('base-views118.js'));
 const {walkRooms}=await import(moduleUrl('base-map86.js'));
 const {energy86}=await import(moduleUrl('base-training86.js'));
 const originals=JSON.parse(fs.readFileSync(path.join(root,'assets/hq/views118/sources.json')));
 assert.equal(hallViews118.length,9);
 const doors=new Set(walkRooms.hall.points.map(point=>point.room));
 assert.deepEqual(new Set(hallViews118.filter(v=>v.entry).map(v=>v.id)),doors);
 const samples={
  pet:[[194,984],[335,973],[477,952]],
  armory:[[190,881],[332,878],[464,867]],
  shop:[[225,1007],[360,1008],[502,1008]],
  vault:[[270,958],[370,957],[463,957]],
  training:[[194,985],[370,985],[528,986]],
  arcade:[[213,786],[390,790],[525,792]],
  hangar:[[155,830],[285,830],[387,830]]
 };
 for(const view of hallViews118){
  const source=originals.find(item=>item.id===view.id);
  assert.ok(source,view.id);
  const hash=crypto.createHash('sha256').update(fs.readFileSync(path.join(root,source.asset))).digest('hex');
  assert.equal(hash,source.sha256,'Artwork changed: '+view.id);
  assert.deepEqual([view.width,view.height],[source.width,source.height]);
  for(const turns of [-2,-1,0,1,2])assert.equal(hallView118((view.u-.5)*2*Math.PI+turns*2*Math.PI).id,view.id);
  for(const size of [[360,800],[390,844],[412,915],[709,1536],[844,390],[1024,768]]){
   const fit=fitArt118(...size,view);
   assert.ok(fit.x>=0&&fit.y>=0);
   assert.ok(fit.x+fit.width<=size[0]+1e-9&&fit.y+fit.height<=size[1]+1e-9);
   assert.ok(Math.abs(fit.width/fit.height-view.width/view.height)<1e-12,'Aspect ratio: '+view.id);
   for(const point of samples[view.id]??[]){
    assert.ok(inside(point,view.entry),'Icon, label or chevron outside hit area: '+view.id);
    const screen=point.map((p,i)=>[fit.x,fit.y][i]+p*fit.scale);
    assert.ok(screen[0]>=0&&screen[0]<=size[0]&&screen[1]>=0&&screen[1]<=size[1]);
   }
  }
 }
 assert.equal(hallViews118.find(v=>v.id==='hall').entry,null);
 for(const correct of [0,1,8,9,141,159]){
  const energy=energy86({base:{headquarters:{correctRuns:{run:correct}}}});
  const markup=hallMarkup118(energy,118);
  assert.match(markup,new RegExp('aria-valuenow="'+energy.charged+'"'));
  assert.ok(markup.includes('poz. '+energy.level));
  assert.equal((markup.match(/ is-charged/g)||[]).length,energy.charged);
 }
 const manifest=vm.runInNewContext(fs.readFileSync(path.join(root,'sw.js'),'utf8')+'\n({CACHE,ASSETS})',{self:{addEventListener(){}}});
 assert.equal(manifest.CACHE,'academy-v120');
 for(const url of ['base-walk85.js?v=120','base-views118.js?v=118','base-views118.css?v=118',...hallViews118.map(v=>v.src.replace('assets/',''))]){
  assert.ok(manifest.ASSETS.includes('./assets/'+url),'Offline: '+url);
 }
 console.log('PASS V118 — 9 original files, 7 existing doors, icon/text/chevron hit areas at 6 screen sizes, real energy and offline assets.');
})().catch(error=>{console.error(error);process.exitCode=1;});
