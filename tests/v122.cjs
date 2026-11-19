const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),cp=require('node:child_process');
const {pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'..');process.argv[2]=root;
const url=n=>pathToFileURL(path.join(root,'assets',n));
(async()=>{
 const ui=await import(url('interface122.js'));
 const old=await import(url('interface121.js'));
 const menu=await import(url('interface102.js'));
 const {app,data}=require('./legacy/test.cjs');
 // This is exactly the approved V118 menu, rather than another approximation.
 const v118=cp.execFileSync('git',['show','dbfff21011465fbe17b61408ef0a427b185ce974:assets/interface102.js'],{cwd:root,encoding:'utf8'});
 const original=v118.slice(v118.indexOf('function academy102DashboardNav('),v118.indexOf('\nconst trainingArtBounds')).trim();
 assert.equal(menu.academy102DashboardNav.toString().replace(/\s+/g,' '),original.replace(/\s+/g,' '));
 for(const file of ['assets/interface121.js','assets/interface121.css','assets/interface121/subjects.webp','assets/interface121/subjects-scene.svg','assets/interface121/knowledge-moving-base.svg']){
  const before=cp.execFileSync('git',['rev-parse','aa81e298a767afe3d8ecf001d9ce2775fd2211e1:'+file],{cwd:root,encoding:'utf8'}).trim();
  const after=cp.execFileSync('git',['hash-object',file],{cwd:root,encoding:'utf8'}).trim();
  assert.equal(after,before,file+' unchanged');
 }
 for(const child of ['pawel','patryk']){
  const a=app(),d=data();a.api.set(d,{role:'child',who:child});
  await a.api.handle('child:home');
  assert.equal((a.root.innerHTML.match(/class="academy107-wide-face"/g)||[]).length,6);
  assert.doesNotMatch(a.root.innerHTML,/academy121-dashboard|data-v77-step="subject"/);
  await a.api.handle('child:learn');assert.match(a.root.innerHTML,/data-v77-step="subject"/);
  await a.api.handle('training:subject:Angielski');
  assert.match(a.root.innerHTML,/data-v77-step="source"/);
  assert.equal((a.root.innerHTML.match(/data-action="training:books:all"/g)||[]).length,1);
  assert.equal((a.root.innerHTML.match(/data-action="training:books:pick"/g)||[]).length,1);
  assert.equal((a.root.innerHTML.match(/data-action="training:source:outside"/g)||[]).length,1);
  assert.doesNotMatch(a.root.innerHTML,/data-action="training:source:books"|academy115-flow|academy121-choice/);
  assert.equal((a.root.innerHTML.match(/data-action="mic"/g)||[]).length,1);
  if(child==='pawel'){
   await a.api.handle('training:books:all');
   assert.match(a.root.innerHTML,/data-v77-step="train-options"/);
   assert.match(a.root.innerHTML,/Materiał z książek · 1 strona/);
   assert.match(a.root.innerHTML,/data-action="training:back:source"/);
   assert.deepEqual([...a.api.trainingSelected()],['page001']);
   for(const action of ['training:mixed:start','training:catalog','training:assessment'])assert.equal(a.root.innerHTML.split('data-action="'+action+'"').length-1,1);
   await a.api.handle('training:back:source');
   await a.api.handle('training:books:pick');assert.match(a.root.innerHTML,/data-v77-step="pick"/);
   assert.match(a.root.innerHTML,/data-action="training:back:source"/);
   await a.api.handle('training:all');await a.api.handle('training:start');assert.match(a.root.innerHTML,/data-v77-step="train-options"/);
   await a.api.handle('training:back:source');
  }else{
   assert.equal((a.root.innerHTML.match(/ disabled/g)||[]).length,2);
  }
  await a.api.handle('training:source:outside');
  assert.match(a.root.innerHTML,/data-v77-step="train-options"/);
  assert.match(a.root.innerHTML,/Inne materiały/);
  assert.match(a.root.innerHTML,/data-action="training:back:source"/);
  await a.api.handle('training:back:source');await a.api.handle('training:back:subject');
  assert.match(a.root.innerHTML,/data-v77-step="subject"/);
 }
 const profiles=[{id:'pawel',name:'Paweł',grade:'Klasa 2',coins:37,progress:63,hero:'hulk',audio:''},{id:'patryk',name:'Patryk',grade:'Przedszkole',coins:12,progress:24,hero:'spider',audio:'<button class="listen" data-speak="Patryk">Odsłuchaj</button>'}];
 const options={release:122,profiles,parent:true,portrait:menu.heroPortrait,status:'Połączono',pair:'',update:true};
 const entry=ui.entry122(options);
 for(const value of ['37 złotych','12 złotych','aria-valuenow="63"','aria-valuenow="24"','profile-pawel.webp','profile-patryk.webp','enter:admin'])assert.ok(entry.includes(value),value);
 assert.equal((entry.match(/data-action="enter:/g)||[]).length,3);
 assert.equal((entry.match(/class="academy122-welcome"/g)||[]).length,1);
 assert.doesNotMatch(entry,/profile-hero|hero-hulk.svg|hero-spider.svg/);
 const captain=ui.entry122({...options,profiles:[{...profiles[0],hero:'captain'}],parent:false});
 assert.match(captain,/profile-pawel-other.webp/);assert.ok(captain.includes(menu.heroPortrait('captain')));
 assert.doesNotMatch(captain,/enter:patryk|enter:admin/);
 const sw=vm.runInNewContext(fs.readFileSync(path.join(root,'sw.js'),'utf8')+'\n({CACHE,ASSETS})',{self:{addEventListener(){}}});
 assert.equal(sw.CACHE,'academy-v123');
 for(const file of fs.readdirSync(path.join(root,'assets/interface122')).filter(n=>!n.endsWith('.json')))assert.ok(sw.ASSETS.includes('./assets/interface122/'+file),file+' offline');
 for(const file of ['interface122.js?v=123','interface122.css?v=122','interface102.js?v=123','interface119.js?v=123','app.js?v=123'])assert.ok(sw.ASSETS.includes('./assets/'+file),file+' offline');
 assert.ok(old.training121Subjects('').includes('academy121-butterfly'));
 console.log('PASS V122: exact V118 menu, unchanged approved subjects/animations, one material chooser, both ages, book all/pick paths, back navigation, live profiles and offline assets.');
})().catch(e=>{console.error(e);process.exitCode=1});
