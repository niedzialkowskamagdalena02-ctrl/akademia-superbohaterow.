const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const vm=require('node:vm');
const {pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'..');
process.argv[2]??=root;
const url=name=>pathToFileURL(path.join(root,'assets',name));
(async()=>{
 const {hallPanels119,hallPoint119,hallCorners119,quadMatrix119}=await import(url('base-panorama119.js'));
 const {panoramaRay119}=await import(url('panorama-software119.js'));
 const {walkRooms,roomAnchor86,cameraBasis86}=await import(url('base-map86.js'));
 const {baseWalkMarkup}=await import(url('base-walk85.js'));
 const {training119Range}=await import(url('interface119.js'));
 const {heroPortrait}=await import(url('interface102.js'));
 const {app,data}=require('./legacy/test.cjs');
 const renderPoint=(p,yaw,pitch=-.25)=>{
  const b=cameraBasis86(yaw,pitch),z=p[0]*b[6]+p[1]*b[7]+p[2]*b[8];
  return [( .5+(p[0]*b[0]+p[2]*b[2])/(2*z*.434))*390,
   (.5-(p[0]*b[3]+p[1]*b[4]+p[2]*b[5])/(2*z*.94))*844];
 };
 const matrixPoint=(m,x,y)=>[(m[0]*x+m[4]*y+m[12])/(m[3]*x+m[7]*y+1),
  (m[1]*x+m[5]*y+m[13])/(m[3]*x+m[7]*y+1)];
 let cameras=0;
 for(const original of walkRooms.hall.points){
  const p=hallPoint119(original),anchor=roomAnchor86(walkRooms.hall,p,.73);
  assert.ok(hallPanels119[original.room]);
  const corners=hallCorners119(p,anchor),[, ,w,h]=p.panel119.rect;
  let previous;
  for(let turn=-.15;turn<=.15;turn+=.01){
   const yaw=(p.u-.5)*2*Math.PI+turn;
   const projected=corners.map(c=>renderPoint(c,yaw));
   const matrix=quadMatrix119(projected,w,h);
   assert.ok(matrix&&matrix.every(Number.isFinite));
   for(const [i,xy] of [[0,[0,0]],[1,[w,0]],[2,[w,h]],[3,[0,h]]]){
    const actual=matrixPoint(matrix,...xy);
    assert.ok(Math.hypot(actual[0]-projected[i][0],actual[1]-projected[i][1])<1e-7);
   }
   const center=matrixPoint(matrix,w/2,h/2),expected=renderPoint(anchor,yaw);
   assert.ok(Math.hypot(center[0]-expected[0],center[1]-expected[1])<1e-7,'3D hit area '+original.room);
   const ray=panoramaRay119(cameraBasis86(yaw,-.25),[0,0,0],walkRooms.hall.bounds,2*center[0]/390-1,1-2*center[1]/844,.434,.94);
   const norm=Math.hypot(...anchor);
   assert.ok(Math.hypot(...ray.map((n,i)=>n-anchor[i]/norm))<1e-8,'Software camera matches the touch area');
   if(previous)assert.ok(Math.abs(center[0]-previous[0])>0.1&&Math.abs(center[0]-previous[0])<30,'Continuous camera motion');
   previous=center;cameras++;
  }
 }
 const walk=baseWalkMarkup({grade:'2',base:{owned:[]}},'qa','iron',119,'');
 assert.equal((walk.match(/hq120-entry/g)||[]).length,7);
 assert.doesNotMatch(walk,/hq118-art|hq118-entry|hq119-plate-art/);
 const walkCode=fs.readFileSync(path.join(root,'assets/base-walk85.js'),'utf8');
 assert.doesNotMatch(walkCode,/mountHall118|hallView118/);
 assert.ok(walkCode.includes('panorama120/hall.webp'));
 const png=fs.readFileSync(path.join(root,'assets/hq/panorama119/hall.png'));
 assert.ok(Math.abs(png.readUInt32BE(16)/png.readUInt32BE(20)-2)<.01);
 const view=app(),account=data();
 view.api.set(account,{role:'child',who:'patryk'});
 await view.api.handle('child:learn');
 assert.match(view.root.innerHTML,/data-interface119="subjects"/);
 assert.equal((view.root.innerHTML.match(/aria-label="Wróć"/g)||[]).length,1);
 assert.doesNotMatch(view.root.innerHTML,/training:subject:Przedszkole|academy111-extra-subjects|academy116-top|academy102-destinations/);
 assert.equal((view.root.innerHTML.match(/aria-label="Wybierz przedmiot /g)||[]).length,5);
 const empty=training119Range({subject:'Angielski',voice:'',hasPages:false});
 assert.equal((empty.match(/ disabled/g)||[]).length,2);
 const available=training119Range({subject:'Angielski',voice:'',hasPages:true});
 assert.doesNotMatch(available,/ disabled/);
 assert.match(available,/training:range:all/);assert.match(available,/training:range:pick/);
 const originals=JSON.parse(fs.readFileSync(path.join(root,'assets/interface119/sources.json')));
 for(const file of originals){
  assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,file.asset))).digest('hex'),file.sha256);
 }
 assert.equal(heroPortrait('hulk'),'assets/interface119/hulk.svg');
 const hulk=fs.readFileSync(path.join(root,heroPortrait('hulk')),'utf8');
 assert.match(hulk,/viewBox="0 420 709 800"/);
 assert.deepEqual(Buffer.from(hulk.match(/base64,([^"\s]+)/)[1],'base64'),fs.readFileSync(path.join(root,'assets/interface119/hulk-source.webp')));
 const cache=vm.runInNewContext(fs.readFileSync(path.join(root,'sw.js'),'utf8')+'\n({CACHE,ASSETS})',{self:{addEventListener(){}}});
 assert.equal(cache.CACHE,'academy-v120');
 for(const name of ['interface119.js?v=119','interface119.css?v=119','base-panorama119.js?v=119','base-panorama119.css?v=119','panorama-software119.js?v=119','hq/panorama119/hall.png','interface119/hulk.svg','interface119/subjects.webp','interface119/range.webp','interface119/modes.webp']){
  assert.ok(cache.ASSETS.includes('./assets/'+name),name);
 }
 console.log(`PASS V119 — ${cameras} continuous camera poses and matching 3D panels, Patryk's menu, book range, exact artwork and Hulk, offline assets.`);
})().catch(e=>{console.error(e);process.exitCode=1;});
