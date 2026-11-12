const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const {pathToFileURL}=require('node:url');
const url=name=>new URL('../assets/'+name,pathToFileURL(__filename));
const button=(label,action)=>`<button data-action="${action}">${label}</button>`;

(async()=>{
 const {hqAdopt,hqEarnFood,hqFood,hqRead}=await import(url('headquarters84.js'));
 const {mountPetCare86,petCareMarkup86,servePet87}=await import(url('pet-care86.js'));
 const profile={};
 assert.equal(hqAdopt(profile,'cat','Puszek'),true);
 hqEarnFood(profile,'pierwsza');hqEarnFood(profile,'druga');

 let care,markup,swipes=0;
 const events={};
 const scene={
  addEventListener(name,callback){events[name]=callback;},
  setPointerCapture(){},
  querySelector(selector){return selector==='.hq86-pet-next'?{click(){swipes++;}}:null;}
 };
 const panel={scrollTop:87,querySelector:()=>care};
 function makeCare(){
  return {
   isConnected:true,
   querySelector:selector=>selector==='[data-pet-swipe]'?scene:null,
   set outerHTML(html){this.isConnected=false;markup=html;panel.scrollTop=0;care=makeCare();}
  };
 }
 care=makeCare();
 const app={querySelector:selector=>selector==='.hq86-pet-panel'?panel:care};
 let saved=0,completeSave;
 const source=fs.readFileSync(url('app.js'),'utf8');
 const handler=source.slice(source.indexOf('async function hqAction84'),source.indexOf('function hqMountArcade84'));
 const context={
  role:'child',who:'pawel',tab:'base',hqPanel84:'pet',profile:()=>profile,app,
  petRooms86:new Map([['pawel','kitchen']]),petEffects86:new Map(),petFeeding90:new Set(),petPlay87:new Set(),
  servePet87,petCareMarkup86,mountPetCare86,button,careGesture(){},hqTone84(){},
  hqShow84(){assert.fail('Karmienie nie powinno otwierać ponownie panelu.');},
  save(){saved++;return new Promise(resolve=>{completeSave=resolve;});}
 };
 const action=vm.runInNewContext(handler+'\nhqAction84;',context);
 mountPetCare86(app,()=>{});

 const tap={button:0,pointerId:1,clientX:80,clientY:50,target:{closest:()=>({click(){assert.fail('Przycisk obsługuje kliknięcie natywne.');}})}};
 events.pointerdown(tap);events.pointerup(tap);
 const swipe={...tap,target:{closest:()=>null}};
 events.pointerdown(swipe);events.pointerup({...swipe,clientX:20});
 assert.equal(swipes,1);

 const feed=()=>action('hq:feed:fish');
 const first=feed();
 await feed();
 assert.equal(saved,1);
 assert.equal(hqFood(profile).length,1);
 completeSave();await first;
 assert.equal(panel.scrollTop,87);
 assert.equal(context.petRooms86.get('pawel'),'kitchen');
 assert.match(markup,/data-pet-room="kitchen"/);
 assert.match(markup,/data-meal="fish" data-mouth="true"[\s\S]*fish\.svg/);
 assert.match(markup,/Kot dostał rybę!/);

 const second=feed();completeSave();await second;
 await feed();
 assert.equal(saved,2);
 assert.equal(hqRead(profile).foodServed.length,2);
 assert.match(markup,/<button type="button" disabled>🐟 Daj rybę<\/button>/);
 console.log('PASS karmienie – ryba, zachowanie kuchni i przewinięcia, brak podwójnego kliknięcia i blokada bez porcji.');
})().catch(error=>{console.error(error);process.exitCode=1;});
