const {chromium}=require('playwright');
const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),out=process.env.TEST_ARTIFACT_DIR||require('node:os').tmpdir();
const styles=[...fs.readFileSync(path.join(root,'index.html'),'utf8').matchAll(/<link rel="stylesheet"[^>]+>/g)].map(m=>m[0]).join('');
const fixture=`<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1">${styles}<main class="hq86-main" id="app"></main><script type="module">
import {baseWalkMarkup,mountBaseWalk} from './assets/base-walk85.js?v=120';
import {hallEntries120} from './assets/hall-entries120.js?v=120';
const app=document.querySelector('#app');
app.innerHTML=baseWalkMarkup({grade:'2',base:{owned:[]}},'qa','iron',120,'','<button class="hq87-mic mic" data-action="mic">Zadaj pytanie</button>');
mountBaseWalk(app.querySelector('[data-hq86-walk]'));window.entries=hallEntries120;
</script>`;
(async()=>{
 const server=http.createServer((req,res)=>{
  const name=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  if(name==='/fixture'){res.setHeader('Content-Type','text/html;charset=utf-8');res.end(fixture);return;}
  const file=path.resolve(root,'.'+name);
  if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||fs.statSync(file).isDirectory()){res.writeHead(404);res.end();return;}
  res.setHeader('Content-Type',name.endsWith('.js')?'text/javascript':name.endsWith('.css')?'text/css':name.endsWith('.png')?'image/png':name.endsWith('.webp')?'image/webp':'application/octet-stream');
  res.end(fs.readFileSync(file));
 });
 await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
 server.unref();
 const browser=await chromium.launch({executablePath:process.env.CHROME_BINARY||(fs.existsSync('/usr/bin/chromium')?'/usr/bin/chromium':chromium.executablePath()),args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const failures=[],errors=[];let visited=0;
 try{
  for(const renderer of ['webgl','software']){
   const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,reducedMotion:'reduce'});
   if(renderer==='software')await context.addInitScript(()=>{const get=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(kind,...args){return /webgl/.test(kind)?null:get.call(this,kind,...args);};});
   const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)failures.push(r.url());});
   for(const id of ['training','armory','arcade','hangar','pet','shop','vault']){
    await page.goto(`http://127.0.0.1:${server.address().port}/fixture`);
    const stage=page.locator('.hq86-stage');
    await page.waitForFunction(()=>document.querySelector('.hq86-stage.has-depth[aria-busy="false"]'));
    assert.equal(await stage.getAttribute('data-renderer'),renderer);
    const target=await page.evaluate(id=>{const [u,v,w,h]=window.entries[id];return {yaw:(u+w/2-.62)*2*Math.PI,pitch:(.5-v-h/2)*Math.PI/1.36};},id);
    await stage.focus();
    const turns=Math.round(target.yaw/.22),tilts=Math.round(target.pitch/.13);
    for(let i=0;i<Math.abs(turns);i++)await page.keyboard.press(turns<0?'ArrowLeft':'ArrowRight');
    for(let i=0;i<Math.abs(tilts);i++)await page.keyboard.press(tilts<0?'ArrowDown':'ArrowUp');
    const button=page.locator(`.hq120-entry[data-walk-door="${id}"]`);
    await page.waitForFunction(id=>!document.querySelector('.hq120-entry[data-walk-door="'+id+'"]').hidden,id);
    const xy=await button.evaluate(el=>{
     const points=[...el.style.clipPath.matchAll(/([-\d.]+)px ([-\d.]+)px/g)].map(m=>[+m[1],+m[2]]);
     const rect=el.closest('.hq86-stage').getBoundingClientRect();
     return {x:rect.left+points.reduce((sum,p)=>sum+p[0],0)/points.length,y:rect.top+points.reduce((sum,p)=>sum+p[1],0)/points.length};
    });
    assert.equal(await page.evaluate(({x,y})=>document.elementFromPoint(x,y)?.closest('[data-walk-door]')?.dataset.walkDoor,xy),id,'Actual touch target: '+id);
    if(['training','hangar','pet'].includes(id))await page.screenshot({path:path.join(out,`v120-${renderer}-${id}.png`)});
    await page.touchscreen.tap(xy.x,xy.y);
    await page.waitForFunction(id=>document.querySelector('.hq86-stage').dataset.room===id,id);
    await page.waitForFunction(()=>document.querySelector('.hq86-stage[aria-busy="false"]'));
    await page.locator('[data-walk-back]').click();
    await page.waitForFunction(()=>document.querySelector('.hq86-stage[data-room="hall"][aria-busy="false"]'));
    visited++;
   }
   await context.close();
  }
  assert.deepEqual(errors,[]);assert.deepEqual(failures,[]);
 }finally{await browser.close();server.close();}
 console.log('PASS V120 browser: '+visited+' entrance/return flows in WebGL and Canvas at 390×844; real touch hit testing; no missing assets or JS errors.');
})().catch(e=>{console.error(e);process.exitCode=1;});
