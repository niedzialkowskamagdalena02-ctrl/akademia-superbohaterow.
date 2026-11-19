const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),vm=require('node:vm');
const {pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'..');process.argv[2]=root;
const url=n=>pathToFileURL(path.join(root,'assets',n));
(async()=>{
 const ui=await import(url('interface124.js'));
 const menu=await import(url('interface102.js'));
 const subject=await import(url('interface121.js'));
 const map=await import(url('interface121/source-map.js'));
 const {app,data}=require('./legacy/test.cjs');
 const baseline='a91cf078e5a5e89ef30e8da2d8869091970f4d93';
 // The approved subject board, including all animation layers, is identical.
 const original=cp.execFileSync('git',['show',baseline+':assets/interface121.js'],{cwd:root,encoding:'utf8'}).replace(/^import .*;\s*$/gm,'').replace(/export /g,'');
 const context={sources:map.interfaceSources121,tiles:map.subjectTiles121,pieces:map.knowledgePieces121};
 const before=vm.runInNewContext(original+'\ntraining121Subjects(\'\')',context);
 assert.equal(subject.training121Subjects(''),before);
 const cssBefore=cp.execFileSync('git',['rev-parse',baseline+':assets/interface121.css'],{cwd:root,encoding:'utf8'}).trim();
 assert.equal(cp.execFileSync('git',['hash-object','assets/interface121.css'],{cwd:root,encoding:'utf8'}).trim(),cssBefore);
 // The six-tile V118 menu is retained exactly.
 const v118=cp.execFileSync('git',['show','dbfff21011465fbe17b61408ef0a427b185ce974:assets/interface102.js'],{cwd:root,encoding:'utf8'});
 const nav=v118.slice(v118.indexOf('function academy102DashboardNav('),v118.indexOf('\nconst trainingArtBounds')).trim();
 assert.equal(menu.academy102DashboardNav.toString().replace(/\s+/g,' '),nav.replace(/\s+/g,' '));
 function imagesExist(html){for(const [,file]of html.matchAll(/src="(assets\/[^"?]+)(?:\?[^\"]*)?"/g))assert.ok(fs.existsSync(path.join(root,file)),file);}
 for(const child of ['pawel','patryk']){
  const a=app(),d=data();d.bookPages[0].number=1;d.bookPages[0].imageId='real-page-image';
  d.books.push({id:'b2',title:'Nowi tropiciele',child:'pawel',subject:'Polski',grade:'2'}, {id:'bp',title:'Moja książka',child:'patryk',subject:'Angielski',grade:'P'});
  d.bookPages.push({id:'page002',bookId:'b1',number:2,chapter:'Animals',text:'A cat and a dog.',imageId:'real-page-image'}, {id:'pol1',bookId:'b2',number:1,text:'Kot lubi mleko.'},{id:'pp1',bookId:'bp',number:1,text:'A red ball.'});
  a.api.set(d,{role:'child',who:child});
  await a.api.handle('child:home');assert.equal((a.root.innerHTML.match(/class="academy107-wide-face"/g)||[]).length,6);
  await a.api.handle('child:learn');assert.match(a.root.innerHTML,/data-v77-step="subject"/);imagesExist(a.root.innerHTML);
  await a.api.handle('training:subject:Wiedza%20og%C3%B3lna');
  assert.match(a.root.innerHTML,/data-interface124="material"/);imagesExist(a.root.innerHTML);
  assert.equal((a.root.innerHTML.match(/data-action="training:books:all"/g)||[]).length,1);
  assert.equal((a.root.innerHTML.match(/data-action="training:source:outside"/g)||[]).length,1);
  assert.equal((a.root.innerHTML.match(/data-action="mic"/g)||[]).length,1);
  await a.api.handle('training:books:pick');
  assert.match(a.root.innerHTML,/data-interface124="pick"/);imagesExist(a.root.innerHTML);
  assert.match(a.root.innerHTML,/data-action="training:back:source"/);
  assert.match(a.root.innerHTML,/data-v772-book-choice="chapter"/);assert.match(a.root.innerHTML,/data-v772-book-choice="range"/);
  assert.equal((a.root.innerHTML.match(/data-action="mic"/g)||[]).length,1);
  assert.doesNotMatch(a.root.innerHTML,/Zaznaczono 93 stron|Wybrano 82 strony/);
  if(child==='pawel'){
   assert.match(a.root.innerHTML,/Nowi tropiciele/);assert.match(a.root.innerHTML,/data-image="real-page-image"/);
   a.api.trainingSelectionChange({checked:true,hasAttribute:n=>n==='data-tr71-book',dataset:{tr71Book:'b1'}});
   assert.deepEqual([...a.api.trainingSelected()].sort(),['page001','page002']);
   const chapter={dataset:{v772ChapterBook:'b1'},value:'Animals'},from={dataset:{v77RangeBook:'b1',v77RangeEdge:'from'},value:'page001'},to={dataset:{v77RangeBook:'b1',v77RangeEdge:'to'},value:'page002'},error={dataset:{v772RangeError:'b1'},textContent:''};
   a.document.querySelectorAll=s=>s==='[data-v772-chapter-book]'?[chapter]:s==='[data-v77-range-book]'?[from,to]:s==='[data-v772-range-error]'?[error]:[];
   a.ctx.v772ApplyChapter('b1');assert.deepEqual([...a.api.trainingSelected()],['page002']);
   from.value='page002';to.value='page001';assert.equal(a.api.v77ApplyRange('b1',false),false);assert.match(error.textContent,/Początek zakresu/);
   from.value='page001';to.value='page002';assert.equal(a.api.v77ApplyRange('b1',false),true);
   await a.api.handle('training:start');assert.match(a.root.innerHTML,/data-interface124="options"/);assert.match(a.root.innerHTML,/Materiał z książek · 2 strony/);
  }else{
   assert.match(a.root.innerHTML,/Moja książka/);assert.doesNotMatch(a.root.innerHTML,/Nowi tropiciele|real-page-image/);
   await a.api.handle('training:all');await a.api.handle('training:start');assert.match(a.root.innerHTML,/data-interface124="options"/);
  }
  imagesExist(a.root.innerHTML);
  for(const action of ['training:mixed:start','training:catalog','training:assessment'])assert.equal(a.root.innerHTML.split('data-action="'+action+'"').length-1,1);
  await a.api.handle('training:back:source');await a.api.handle('training:source:outside');assert.match(a.root.innerHTML,/data-interface124="options"/);assert.match(a.root.innerHTML,/Inne materiały/);
  await a.api.handle('training:back:source');await a.api.handle('training:back:subject');assert.match(a.root.innerHTML,/data-v77-step="subject"/);
 }
 const p={release:124,profiles:[{id:'pawel',name:'Paweł',grade:'Klasa 2',coins:37,progress:63,hero:'hulk',audio:''},{id:'patryk',name:'Patryk',grade:'Przedszkole',coins:12,progress:24,hero:'spider',audio:'<button class="listen">Odsłuchaj</button>'}],parent:true,status:'Połączono',pair:'',update:true,portrait:menu.heroPortrait};
 const entry=ui.entry124(p);imagesExist(entry);
 for(const value of ['37 złotych','12 złotych','aria-valuenow="63"','aria-valuenow="24"','enter:pawel','enter:patryk','enter:admin'])assert.ok(entry.includes(value));
 const other=ui.entry124({...p,parent:false,profiles:[{...p.profiles[0],hero:'captain'}]});assert.ok(other.includes(menu.heroPortrait('captain')));assert.doesNotMatch(other,/enter:patryk|enter:admin/);imagesExist(other);
 const choices=ui.choices124();for(const key of ['classic','walk'])assert.ok(choices.includes('hq:view:'+key));imagesExist(choices);
 const empty=ui.training124Material({subject:'Fizyka',hasPages:false});assert.equal((empty.match(/ disabled/g)||[]).length,2);
 const sw=vm.runInNewContext(fs.readFileSync(path.join(root,'sw.js'),'utf8')+'\n({CACHE,ASSETS})',{self:{addEventListener(){}}});assert.equal(sw.CACHE,'academy-v124');
 for(const file of fs.readdirSync(path.join(root,'assets/interface124')).filter(n=>n.endsWith('.webp')))assert.ok(sw.ASSETS.includes('./assets/interface124/'+file),file+' offline');
 for(const asset of sw.ASSETS)if(asset!=='./')assert.ok(fs.existsSync(path.join(root,asset.replace(/^\.\//,'').split('?')[0])),asset+' exists');
 console.log('PASS V124: supplied assets, unchanged subjects/animations and V118 menu, both children, live book photos/counts, full-book/chapter/range selection, invalid range guard, navigation, profiles, one microphone and offline assets.');
})().catch(e=>{console.error(e);process.exitCode=1});
