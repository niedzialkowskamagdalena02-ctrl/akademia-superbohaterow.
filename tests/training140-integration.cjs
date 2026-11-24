const assert=require('node:assert/strict'),vm=require('node:vm'),path=require('node:path');
process.argv[2]=path.resolve(__dirname,'..');
const {app,data}=require('./legacy/test.cjs');
(async()=>{
 for(const grade of ['P','1','2','3']){
  const view=app(),v=data();v.profiles.pawel.grade=grade;view.api.set(v,{who:'pawel',role:'child',subject:'Wiedza ogólna'});
  await view.api.handle('child:learn');await view.api.handle('training:subject:Wiedza ogólna');await view.api.handle('training:source:outside');await view.api.handle('training:catalog');
  const html=view.root.innerHTML;assert(html.includes('tr139-locked'));assert(html.includes('disabled aria-disabled="true"'));assert(html.includes('Pociąg Pełen Cyferek'));
  await view.api.handle('training:play:task:angielski:words');assert.equal(vm.runInContext('trainingGame95',view.ctx),null);
  await view.api.handle('training:mixed:start');assert(vm.runInContext('trainingRun95.items.length>0&&trainingRun95.items.every(x=>!x.game.locked139)',view.ctx));
  vm.runInContext('testMode=true',view.ctx);await view.api.handle('training:catalog');assert(!view.root.innerHTML.includes('tr139-locked'));await view.api.handle('training:play:task:angielski:words');assert.equal(vm.runInContext('trainingGame95.kind',view.ctx),'words');
  assert.equal(v.profiles.pawel.grade,grade);
 }
 console.log('PASS app routing: one child name across all four education levels; disabled catalog, direct launch and mixed mode; mother preview remains open.');
})().catch(error=>{console.error(error);process.exitCode=1;});
