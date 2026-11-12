const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const {pathToFileURL}=require('node:url');
const url=name=>new URL('../assets/'+name,pathToFileURL(__filename));
const button=(label,action)=>`<button data-action="${action}">${label}</button>`;

(async()=>{
 const {baseWalkMarkup,openWalkRoom87,focusWalkCase88}=await import(url('base-walk85.js'));
 const {cameraBasis86,roomAnchor86,walkRooms,FULL_TURN}=await import(url('base-map86.js'));
 const {hqPlace,hqShop}=await import(url('headquarters84.js'));
 const {BASE_ITEMS,migrateBase}=await import(url('base.js'));
 const {purchase82}=await import(url('wallet82.js'));
 const {drawMentor87,MENTOR_GREETING_MS}=await import(url('base-mentor87.js'));
 const profile={coins:50,base:{owned:['helmet']}};
 assert.equal(hqPlace(profile,'helmet','b'),true);
 const scene=()=>baseWalkMarkup(profile,'pawel','iron',91,'','');
 assert.match(scene(),/data-prop="b"[^>]+data-case-scale="0\.66"/);
 assert.match(scene(),/data-action="hq:room:workshop"/);
 assert.ok(!scene().includes('data-walk-door="workshop"'));

 for(const [room,actions] of Object.entries({
  training:{missions:'hq:area:home',training:'hq:training',simulator:'hq:exercise:mixed'},
  polish:{shelf:'hq:slot:lab'}
 })){
  const location=walkRooms[room],basis=cameraBasis86((location.heading-.5)*FULL_TURN,0);
  for(const [fixture,action] of Object.entries(actions)){
   const point=location.points.find(point=>point.fixture===fixture&&point.action===action);
   const [x,,z]=roomAnchor86(location,point,.73);
   const fraction=.5+(x*basis[0]+z*basis[2])/(2*location.minHorizontalFov*(x*basis[6]+z*basis[8]));
   assert.ok(fraction>.06&&fraction<.94,fixture+' w zasięgu kamery po wejściu');
   assert.ok(fs.existsSync(url('hq/'+fixture+'91.webp')));
  }
 }
 assert.equal(openWalkRoom87('pawel','polish'),true);
 assert.equal(focusWalkCase88('pawel','lab'),true);
 assert.equal(hqPlace(profile,'helmet','lab'),true);
 assert.match(scene(),/data-room="polish"[^>]+data-prop="lab"/);
 const source=fs.readFileSync(url('app.js'),'utf8');
 const actionCode=source.slice(source.indexOf('async function hqAction84'),source.indexOf('function hqMountArcade84'));
 let saved=0;
 const context={
  role:'child',who:'pawel',tab:'base',hqPanel84:'',profile:()=>profile,hqViews84:new Map([['pawel','walk']]),
  openWalkRoom87,purchase82,BASE_ITEMS,migrateBase,save:async()=>{saved++;},
  hqShow84(panel=''){context.hqPanel84=panel;},note:message=>assert.fail(message)
 };
 const action=vm.runInNewContext(actionCode+'\nhqAction84;',context);
 await action('hq:room:workshop');
 assert.equal(context.hqPanel84,'workshop');
 await action('hq:unlock-workshop');
 assert.equal(context.hqPanel84,'');
 assert.equal(saved,1);
 assert.equal(profile.coins,50);
 assert.match(scene(),/data-walk-door="workshop"/);
 assert.match(scene(),/hq86-location" role="status">Warsztat Tony’ego Starka/);
 assert.match(hqShop(profile,'',button,false,true),/hq:room:workshop/);
 await action('hq:room:workshop');
 assert.equal(saved,1);

 const sheet={naturalWidth:1240,naturalHeight:1360};
 const drawn=[];
 const ctx=new Proxy({drawImage(...args){drawn.push(args);}}, {get:(obj,key)=>obj[key]??(()=>({addColorStop(){}}))});
 const canvas={dataset:{mentor:'iron'},width:225,height:316,getContext:()=>ctx};
 drawMentor87(canvas,0,0,sheet);
 drawMentor87(canvas,0,MENTOR_GREETING_MS*.7,sheet);
 assert.deepEqual(drawn[0].slice(1,5),[0,0,248,340]);
 assert.notDeepEqual(drawn[1].slice(1,3),[0,0]);
 console.log('PASS V91 – skróty przy przedmiotach, warsztat z wcześniejszego zapisu i po odebraniu, półka, hełm i ruch mentora.');
})().catch(error=>{console.error(error);process.exitCode=1;});
