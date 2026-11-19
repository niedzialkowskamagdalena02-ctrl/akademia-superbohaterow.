const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),vm=require('node:vm');
const {pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'..'),url=n=>pathToFileURL(path.join(root,'assets',n));
(async()=>{
 const {training121Subjects,crop121}=await import(url('interface121.js'));
 const {interfaceSources121,subjectTiles121}=await import(url('interface121/source-map.js'));
 const {training119Subjects}=await import(url('interface119.js'));
 const source=JSON.parse(fs.readFileSync(path.join(root,'assets/interface121/sources.json'))).find(x=>x.asset.endsWith('/subjects.webp'));
 assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,source.asset))).digest('hex'),source.sha256);
 assert.deepEqual([interfaceSources121.subjects.width,interfaceSources121.subjects.height],[709,1536]);
 for(const [id,[x,y,w,h]] of Object.entries(subjectTiles121))assert.ok(x>=0&&y>=0&&x+w<=709&&y+h<=1536,id);
 const rect=subjectTiles121.polish,crop=crop121('subjects',rect);assert.ok(crop.includes('width:'+709/rect[2]*100+'%'));
 const html=training121Subjects('');assert.equal(html,training119Subjects(''));
 assert.equal((html.match(/aria-label="Wybierz przedmiot /g)||[]).length,5);assert.equal((html.match(/ disabled /g)||[]).length,2);
 for(const layer of ['academy121-globe','academy121-letter','academy121-butterfly'])assert.ok(html.includes(layer));
 const sw=vm.runInNewContext(fs.readFileSync(path.join(root,'sw.js'),'utf8')+'\n({ASSETS})',{self:{addEventListener(){}}});
 for(const name of ['subjects.webp','subjects-scene.svg','knowledge-moving-base.svg'])assert.ok(sw.ASSETS.includes('./assets/interface121/'+name));
 console.log('PASS V121 retained subject board: original source, crop coordinates, 5 subjects/2 locks, animation layers and offline artwork.');
})().catch(e=>{console.error(e);process.exitCode=1});
