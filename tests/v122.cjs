const assert=require('node:assert/strict'),path=require('node:path');
const root=path.resolve(__dirname,'..');process.argv[2]=root;
const {app,data}=require('./legacy/test.cjs');
(async()=>{
 for(const who of ['pawel','patryk']){
  const a=app();a.api.set(data(),{role:'child',who});
  await a.api.handle('child:home');assert.equal((a.root.innerHTML.match(/class="academy107-wide-face"/g)||[]).length,6);
  assert.doesNotMatch(a.root.innerHTML,/data-v77-step="subject"/);
  await a.api.handle('child:learn');assert.match(a.root.innerHTML,/data-v77-step="subject"/);
  await a.api.handle('training:subject:Angielski');assert.match(a.root.innerHTML,/data-v77-step="source"/);
  assert.equal((a.root.innerHTML.match(/data-action="training:books:all"/g)||[]).length,1);
  await a.api.handle('training:source:outside');assert.match(a.root.innerHTML,/data-v77-step="train-options"/);
  assert.equal((a.root.innerHTML.match(/data-action="mic"/g)||[]).length,1);
  await a.api.handle('training:back:source');await a.api.handle('training:back:subject');assert.match(a.root.innerHTML,/data-v77-step="subject"/);
 }
 console.log('PASS V122 retained flow: V118 menu, separate subject screen, one material chooser, both ages, outside modes and back navigation.');
})().catch(e=>{console.error(e);process.exitCode=1});
