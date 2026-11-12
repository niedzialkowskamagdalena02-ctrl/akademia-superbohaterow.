const assert=require('node:assert/strict');
const fs=require('node:fs');
const {pathToFileURL}=require('node:url');
const url=name=>new URL('../assets/'+name,pathToFileURL(__filename));
const root=new URL('../',pathToFileURL(__filename));
const button=(label,action)=>`<button data-action="${action}">${label}</button>`;

(async()=>{
 const {hqItems,hqPlace,hqPlaced,hqDisplayPurchase88,hqShop,hqAdopt,hqPet,hqChoosePet88,hqFoodQuiz88}=await import(url('headquarters84.js'));
 const {baseArt88}=await import(url('base-art88.js'));
 const {baseWalkMarkup,openWalkRoom87,focusWalkCase88}=await import(url('base-walk85.js'));
 const {petPicker88,petCareMarkup86,servePet87}=await import(url('pet-care86.js'));
 const {petQuiz88}=await import(url('pet-quiz88.js'));
 const {flightMarkup88}=await import(url('noun-flight88.js'));
 const {drawQuinjet88}=await import(url('quinjet88.js'));

 const profile={coins:200,base:{owned:hqItems().map(item=>item.id)}};
 const shop=hqShop(profile,'',button);
 for(const {id} of hqItems()){
  const art=baseArt88(id);
  assert.ok(art&&fs.existsSync(new URL(art.src,root)),id);
  assert.ok(shop.includes(art.src),id);
  assert.equal(hqPlace(profile,id,'c'),true);
  assert.match(baseWalkMarkup(profile,'test','hulk',88,'',''),new RegExp('data-prop="c"[^>]+src="'+art.src.replaceAll('.','\\.')+'"'));
 }
 assert.equal(hqPlace(profile,'armor','a'),true);
 assert.equal(hqDisplayPurchase88(profile,'boots'),true);
 assert.equal(hqPlaced(profile,'a'),'armor');
 assert.equal(hqPlaced(profile,'b'),'boots');
 assert.equal(hqDisplayPurchase88(profile,'helmet'),false);
 assert.equal(hqDisplayPurchase88(profile,'boots'),false);
 openWalkRoom87('test','armory');
 assert.equal(focusWalkCase88('test','b'),true);
 assert.match(baseWalkMarkup(profile,'test','hulk',88,'',''),/data-action="hq:flight"/);
 assert.doesNotMatch(baseWalkMarkup({base:{owned:[]}},'other','iron',88,'',''),/data-action="hq:flight"|data-action="hq:bowl"/);

 assert.equal(hqAdopt(profile,'dog','Drops'),true);
 assert.equal(servePet87(profile,'water',()=>.76),true);
 assert.equal(hqChoosePet88(profile,'cat','Puszek'),true);
 assert.equal(hqPet(profile).name,'Puszek');
 assert.equal(hqChoosePet88(profile,'dog',''),true);
 assert.equal(hqPet(profile).name,'Drops');
 assert.equal(hqPet(profile).care.dirt.pee,'closet');
 const pet=petCareMarkup86(profile,'closet','',button);
 assert.match(pet,/data-pet-tool="cloth"/);
 assert.doesNotMatch(petCareMarkup86(profile,'bath','',button),/data-mess="pee"/);
 assert.match(pet,/dog-lap\.webp|dog-step-a\.webp/);
 assert.equal((petPicker88(profile).match(/hq:adopt:/g)||[]).length,3);
 assert.match(petPicker88(profile),/Drops/);

 const preschool=Array.from({length:6},(_,i)=>({q:'Jakiego koloru jest przedmiot '+i+'?',a:['A','B','C'],ok:0}));
 preschool.push({q:'Ile to 5 − 2?',a:['3','7','6'],ok:0});
 const junior=petQuiz88('P',preschool,{},()=>.1);
 assert.equal(junior.length,5);
 assert.ok(junior.every(([q])=>!q.includes('−')));
 const senior=petQuiz88('2',[],{angielski:[['What does CAT mean?',['pies','kot','dom'],1,'Co oznacza CAT?','pl-PL']]},()=>.2);
 assert.equal(senior.length,5);
 assert.equal(senior.filter(item=>item[3]).length,2);
 const calls=[];
 hqFoodQuiz88({items:senior,index:senior.findIndex(item=>item[3])},button,(q,lang)=>{calls.push(lang);return '<button>🔊</button>';});
 assert.deepEqual(calls,['en-US','pl-PL']);

 assert.match(flightMarkup88(button,()=>''),/hq:flight:start/);
 let faces=0;
 drawQuinjet88({beginPath(){},moveTo(){},lineTo(){},closePath(){},fill(){faces++;},stroke(){}},
  ([x,y,z])=>[x,y,z],{yaw:.45,paint:'mint'});
 assert.ok(faces>25);
 console.log('PASS V88 – grafiki i gabloty całego katalogu, wybór zwierząt z zachowaniem zapisu, poziomy i odsłuch, zasady i model lotu.');
})().catch(error=>{console.error(error);process.exitCode=1;});
