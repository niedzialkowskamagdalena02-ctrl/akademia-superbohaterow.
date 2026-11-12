const assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const path=require('node:path');
const moduleUrl=name=>pathToFileURL(path.join(__dirname,'..','assets',name)).href;

async function main(){
 const hq=await import(moduleUrl('headquarters84.js'));
 const {migrateBase,BASE_ITEMS}=await import(moduleUrl('base.js'));
 const {purchase82}=await import(moduleUrl('wallet82.js'));
 const {sync78Merge,sync78AllowedChange}=await import(moduleUrl('sync-core.js'));
 const profile={coins:70,xp:0,unlocks:['Tarcza']};
 const original=structuredClone(profile);
 assert.equal(hq.hqBalances(profile).coins,70);
 assert.equal(hq.hqBalances(profile).gems,0);
 assert.deepEqual(profile,original,'Odczyt portfela nie zmienia profilu');
 migrateBase(profile);
 assert.ok(profile.base.owned.includes('shield'));
 assert.equal(hq.hqEarnToken(profile,'math','matematyka',true),false);
 assert.equal(hq.hqEarnToken(profile,'retry','polski',false),false);
 assert.equal(hq.hqEarnToken(profile,'lesson1','polski',true),true);
 assert.equal(hq.hqEarnToken(profile,'lesson1','polski',true),false);
 assert.equal(hq.hqSpendToken(profile),true);
 assert.equal(hq.hqSpendToken(profile),false);
 assert.equal(hq.hqBalances(profile).energy,0);

 assert.equal(hq.hqRecordCrystals(profile,'snake-1',4),true);
 assert.equal(hq.hqRecordCrystals(profile,'snake-1',4),false);
 assert.equal(hq.hqRecordCrystals(profile,'snake-1',2),false);
 assert.equal(hq.hqRecordCrystals(profile,'blocks-1',3),true);
 assert.equal(hq.hqBalances(profile).gems,7);
 assert.equal(hq.hqBuyWithGems(profile,'thorhammer'),true);
 assert.equal(hq.hqBuyWithGems(profile,'thorhammer'),false);
 assert.equal(hq.hqBalances(profile).gems,3);
 const armor=BASE_ITEMS.find(item=>item.id==='armor');
 assert.equal(purchase82(profile,armor,profile.base.owned).ok,true);
 assert.equal(hq.hqBalances(profile).coins,20);
 assert.equal(hq.hqPlace(profile,'unknown','a'),false);
 assert.equal(hq.hqPlace(profile,'armor','a'),true);
 assert.equal(hq.hqPlace(profile,'thorhammer','a'),true);
 assert.equal(hq.hqPlaced(profile,'a'),'thorhammer');
 assert.equal(hq.hqPlace(profile,'thorhammer','b'),true);
 assert.equal(hq.hqPlaced(profile,'a'),undefined);
 assert.equal(hq.hqPlaced(profile,'b'),'thorhammer');
 assert.equal(hq.hqPaint(profile,'gold'),false);

 assert.equal(hq.hqEarnFood(profile,'quiz1'),false);
 assert.equal(hq.hqAdopt(profile,'dog',' Drops '),true);
 assert.equal(hq.hqAdopt(profile,'cat','Puszek'),false);
 assert.equal(hq.hqRead(profile).pet.name,'Drops');
 assert.equal(hq.hqFeed(profile),false);
 assert.equal(hq.hqEarnFood(profile,'quiz1'),true);
 assert.equal(hq.hqEarnFood(profile,'quiz1'),false);
 assert.equal(hq.hqFeed(profile),true);
 assert.equal(hq.hqFeed(profile),false);
 assert.equal(hq.hqFood(profile).length,0);

 const base=structuredClone(profile),local=structuredClone(base),remote=structuredClone(base);
 hq.hqRecordCrystals(local,'snake-2',2);
 hq.hqRecordCrystals(remote,'blocks-2',3);
 hq.hqEarnToken(remote,'lesson2','angielski',true);
 hq.hqPlace(local,'armor','a');
 const merged=sync78Merge(base,local,remote,'profile/pawel');
 assert.equal(hq.hqBalances(merged).gems,8);
 assert.equal(hq.hqBalances(merged).energy,1);
 assert.equal(hq.hqPlaced(merged,'a'),'armor');
 assert.equal(sync78AllowedChange('profile/pawel',base,merged,{role:'child',child:'pawel'},{}),true);
 console.log('PASS V84 — starszy portfel, żetony, kryształy, zakupy, rozmieszczenie, zwierzak i synchronizacja');
}
main().catch(error=>{console.error(error);process.exitCode=1});
