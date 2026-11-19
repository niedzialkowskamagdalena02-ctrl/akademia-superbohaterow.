const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..'),base='605f75a3a0b851829d4602b2f7a7149852cfa0b2';
const old=file=>cp.execFileSync('git',['show',base+':'+file],{cwd:root,maxBuffer:8*1024*1024});
for(const file of ['assets/hq/panorama125/hall.webp','assets/hq/panorama125/details.webp','assets/base-panorama125.js','assets/hall-details125.js','assets/panorama-software119.js','assets/base-panorama119.css','assets/style.css','assets/interface124.js','assets/base-map86.js','assets/headquarters84.js','assets/hero-animation127.css'])assert.deepEqual(fs.readFileSync(path.join(root,file)),old(file),file+' preserved');
const world=s=>s.slice(s.indexOf('export function panoramaWorld('),s.indexOf('let dispose='));
assert.equal(world(fs.readFileSync(path.join(root,'assets/base-walk85.js'),'utf8')),world(old('assets/base-walk85.js').toString()));
const art=JSON.parse(fs.readFileSync(path.join(root,'assets/hq/hands127/sources.json'))),refs=new Set(Object.values(art.files).flatMap(f=>f.originals));
const input=path.join(root,'../animations_refs/selected');let count=0;
function scan(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,entry.name);if(entry.isDirectory())scan(file);else if(/^\d+\.png$/.test(entry.name)){count++;assert.ok(refs.has(path.relative(input,file)),'Supplied numbered frame omitted: '+file);}}}
for(const hero of ['hulk','kapitan_ameryka','thor','iron_man','spider_man'])scan(path.join(input,hero));
assert.equal(count,303);
for(const [hero,key,n]of [['hulk','slam:-1',13],['hulk','punch:1',11],['captain','shield:1',25],['thor','throw:1',38],['iron','laser:1',13],['spider','web:1',14]])assert.equal(art.heroes[hero].actions[key].frames.length,n);
for(const keys of Object.values(art.webs))assert.equal(keys.length,11);
console.log('PASS V129 scope: all 303 supplied numbered frames included; exact V125 hall and existing training/progress code retained.');
