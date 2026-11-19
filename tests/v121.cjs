const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),vm=require('node:vm');
const {pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'..');process.argv[2]=root;
const url=n=>pathToFileURL(path.join(root,'assets',n));
(async()=>{
 const {entry121,dashboard121,training121Subjects,training121Range,training121Options,crop121}=await import(url('interface121.js'));
 const {interfaceSources121,subjectTiles121}=await import(url('interface121/source-map.js'));
 const {heroPortrait,academy107Entry}=await import(url('interface102.js'));
 const {app,data}=require('./legacy/test.cjs');
 const records=JSON.parse(fs.readFileSync(path.join(root,'assets/interface121/sources.json')));
 for(const record of records){
  assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,record.asset))).digest('hex'),record.sha256);
 }
 assert.deepEqual([interfaceSources121.subjects.width,interfaceSources121.subjects.height],[709,1536]);
 for(const [id,[x,y,w,h]] of Object.entries(subjectTiles121))assert.ok(x>=0&&y>=0&&x+w<=709&&y+h<=1536,id+' crop within its source');
 const rect=subjectTiles121.polish,html=crop121('subjects',rect);
 assert.ok(html.includes('aspect-ratio:'+rect[2]+'/'+rect[3]));
 assert.ok(html.includes('width:'+709/rect[2]*100+'%'),'Actual source width drives crop scaling');
 const profile={release:121,profiles:[{id:'pawel',name:'Paweł',grade:'Klasa 2',coins:37,progress:63,hero:'captain',audio:''},{id:'patryk',name:'Patryk',grade:'Przedszkole',coins:12,progress:24,hero:'spider',audio:'<button class="listen">Odsłuchaj</button>'}],status:'Połączono',linked:true,parent:true,pair:'',update:true};
 const entry=academy107Entry(profile);
 for(const text of ['37 złotych','12 złotych','aria-valuenow="63"','aria-valuenow="24"',heroPortrait('captain'),'assets/interface121/hero-spider.svg','data-action="enter:pawel"','data-action="enter:patryk"','data-action="enter:admin"'])assert.ok(entry.includes(text),text);
 assert.equal((entry.match(/academy121-profile-frame/g)||[]).length,2);
 assert.equal((entry.match(/academy121-welcome/g)||[]).length,1);
 const childOnly=entry121({...profile,profiles:[profile.profiles[1]],parent:false,pair:'',portrait:heroPortrait});
 assert.ok(!childOnly.includes('enter:pawel')&&!childOnly.includes('enter:admin'));
 const menu=dashboard121([['training','Trening','learn']],()=>'<button class="listen" data-speak="Trening">Odsłuchaj</button>');
 assert.match(menu,/data-action="child:learn"/);assert.doesNotMatch(menu,/data-interface119|Wybierz przedmiot/);
 const subjects=training121Subjects('<button class="listen" data-speak="Wybierz przedmiot">Odsłuchaj</button>');
 assert.equal((subjects.match(/aria-label="Wybierz przedmiot /g)||[]).length,5);
 assert.equal((subjects.match(/ disabled /g)||[]).length,2);
 assert.match(subjects,/academy121-globe/);assert.match(subjects,/academy121-letter/);assert.match(subjects,/academy121-butterfly/);
 assert.doesNotMatch(subjects,/training:subject:Przedszkole|<strong>/);
 for(const hasPages of [false,true]){
  const range=training121Range({subject:'Angielski',voice:'',hasPages});
  assert.equal((range.match(/ disabled/g)||[]).length,hasPages?0:2);
 }
 const modes=training121Options({subject:'Wiedza ogólna',source:'outside',count:0});
 for(const action of ['training:mixed:start','training:catalog','training:assessment'])assert.ok(modes.includes(action));
 // Exercise the real app's navigation for both ages, including empty books.
 for(const child of ['pawel','patryk']){
  const a=app(),d=data();a.api.set(d,{role:'child',who:child});
  await a.api.handle('child:home');assert.match(a.root.innerHTML,/academy121-dashboard/);assert.doesNotMatch(a.root.innerHTML,/data-interface119="subjects"/);
  await a.api.handle('child:learn');assert.match(a.root.innerHTML,/data-v77-step="subject"/);
  await a.api.handle('training:subject:Angielski');assert.match(a.root.innerHTML,/data-v77-step="source"/);
  await a.api.handle('training:source:outside');assert.match(a.root.innerHTML,/data-v77-step="train-options"/);
  await a.api.handle('training:back:source');assert.match(a.root.innerHTML,/data-v77-step="source"/);
  await a.api.handle('training:source:books');assert.match(a.root.innerHTML,/data-v77-step="range"/);
  await a.api.handle('training:back:source');assert.match(a.root.innerHTML,/data-v77-step="source"/);
 }
 const sw=vm.runInNewContext(fs.readFileSync(path.join(root,'sw.js'),'utf8')+'\n({CACHE,ASSETS})',{self:{addEventListener(){}}});
 assert.equal(sw.CACHE,'academy-v121');
 for(const name of ['interface121.js?v=121','interface121.css?v=121','interface121/source-map.js?v=121','interface121/hero-hulk.svg','interface121/hero-spider.svg'])assert.ok(sw.ASSETS.includes('./assets/'+name),name);
 for(const file of fs.readdirSync(path.join(root,'assets/interface121')).filter(n=>!n.endsWith('.json'))){
  assert.ok(sw.ASSETS.includes('./assets/interface121/'+file+(file.endsWith('.js')?'?v=121':'')),file+' offline');
 }
 console.log('PASS V121: original sources, correct crop scale, dynamic heroes/coins/progress, 2-age navigation, empty books, animation layers and offline assets.');
})().catch(e=>{console.error(e);process.exitCode=1});
