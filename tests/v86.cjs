const assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const url=name=>new URL('../assets/'+name,pathToFileURL(__filename));

(async()=>{
 const map=await import(url('base-map86.js'));
 const hq=await import(url('headquarters84.js'));
 const study=await import(url('base-training86.js'));
 const pet=await import(url('pet-care86.js'));
 const {sync78Merge}=await import(url('sync-core.js'));
 const {purchase82}=await import(url('wallet82.js'));
 const scene=map.walkRooms.hall;
 const view={x:0,z:0,yaw:0,pitch:0};
 map.advance86(scene,view,500);
 assert.equal(view.z,scene.bounds[2]-.9);
 assert.equal(map.advance86(scene,view,1),0);
 assert.equal(map.walkRooms.hall.points.filter(p=>p.room).length,5);
 assert.ok(map.walkRooms.training.points.some(p=>p.room==='polish'));
 assert.ok(map.walkRooms.training.points.some(p=>p.room==='english'));
 const behind=map.roomAnchor86(scene,scene.points.find(p=>p.room==='pet'),.65);
 assert.ok(behind[2]<0);

 const profile={coins:90,xp:0};
 assert.equal(hq.hqAdopt(profile,'dog','Drops'),true);
 assert.equal(pet.setPetCare86(profile,'outfit','scarf'),true);
 assert.equal(pet.setPetCare86(profile,'outfit','invalid'),false);
 assert.equal(pet.setPetCare86(profile,'wash'),true);
 const markup=pet.petCareMarkup86(profile,'kitchen','',(label,action)=>`<button data-action="${action}">${label}</button>`);
 assert.match(markup,/data-outfit="scarf"/);
 assert.doesNotMatch(markup,/hq:egg/);
 assert.equal(hq.hqEarnFood(profile,'quiz-one'),true);
 assert.equal(hq.hqFeed(profile),true);
 assert.equal(hq.hqFeed(profile),false);
 assert.equal(study.recordEnergy86(profile,'run-one',6),true);
 assert.equal(study.recordEnergy86(profile,'run-one',6),false);
 assert.equal(study.energy86(profile).charged,6);

 const local=structuredClone(profile),remote=structuredClone(profile);
 study.recordEnergy86(local,'run-two',4);
 pet.setPetCare86(remote,'outfit','cape');
 const merged=sync78Merge(profile,local,remote,'profile/pawel');
 assert.equal(hq.hqRead(merged).pet.care.outfit,'cape');
 assert.equal(study.energy86(merged).crystals,10);
 for(const kind of ['nouns','spelling','alphabet','plurals','mixed','master']){
  const run=study.trainingRound86(kind);
  assert.equal(run.items.length,kind==='master'?10:kind==='mixed'?8:6);
  assert.ok(run.items.every(q=>q.a[q.ok]&&(!q.qPl||q.lang==='en-US')));
 }
 assert.equal(study.unlockMaster86(merged,7,10),false);
 assert.equal(study.unlockMaster86(merged,8,10),true);
 assert.equal(study.unlockMaster86(merged,10,10),false);
 assert.ok(study.MASTER_PRIZES86.every(id=>merged.base.owned.includes(id)));
 assert.equal(purchase82({coins:9000},hq.hqItems().find(x=>x.id==='language-cup'),[]).ok,false);
 assert.equal(hq.hqPlace(merged,'language-cup','a'),true);
 assert.equal(hq.hqPlaced(merged,'a'),'language-cup');
 assert.equal(merged.coins,90);
 console.log('PASS V86 — ruch do granicy pokoju, opieka i strój, zapis energii, synchronizacja i nagrody Language Master');
})().catch(error=>{console.error(error);process.exitCode=1;});
