const {chromium}=require('playwright'),fs=require('fs'),http=require('http'),path=require('path'),assert=require('assert/strict');
const ROOT=path.resolve(process.argv[2]||path.resolve(__dirname,'..'));
const fixture=`<!doctype html><html lang="pl"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/assets/style.css"><main id="game" style="max-width:650px;margin:10px auto;padding:10px"></main><script type="module">
import {mountMissionGame} from '/assets/mission-game.js';
window.SpeechRecognition=class{start(){window.rec=this;queueMicrotask(()=>this.onstart?.())}abort(){this.onend?.()}stop(){this.onend?.()}};
const task={type:'vocab-reading',vocab76:true,readWords:['bed','friend','shorts'],readMeanings:['łóżko','przyjaciel','krótkie spodenki'],wordEn:'bed',promptPl:'łóżko',answer:'bed friend shorts',audio:'bed friend shorts',question:'Read the words aloud, in order.',questionPl:'Przeczytaj słowa po angielsku, w podanej kolejności.',sourcePageId:'page001',sourceBookId:'b1',pageNumber:4};
localStorage.setItem('academy-v49-session-pawel-b1',JSON.stringify({scope:'all',mode:'game',tasks:[task],idx:0,points:0,award:false}));
mountMissionGame(document.querySelector('#game'),{books:[{id:'b1',subject:'Angielski',title:'Angielski'}],pages:[{id:'page001',bookId:'b1',number:4,text:'bed friend shorts'}],ask:async()=>'',speak:()=>{},reward:()=>{},child:'pawel',childGrade:'2',initialBookId:'b1'});
document.querySelector('[data-mg=resume]').click();window.demoReady=true;
</script></html>`;
(async()=>{
 let passed=0;
 const server=http.createServer((req,res)=>{
  const name=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  if(name==='/'){res.setHeader('content-type','text/html;charset=utf-8');return res.end(fixture);}
  const file=path.join(ROOT,name);if(!file.startsWith(ROOT+path.sep)||!fs.existsSync(file)){res.writeHead(404);return res.end();}
  res.setHeader('content-type',name.endsWith('.js')?'text/javascript':name.endsWith('.css')?'text/css':'application/octet-stream');res.end(fs.readFileSync(file));
 });
 await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
 const browser=await chromium.launch({executablePath:process.env.CHROME_BINARY||chromium.executablePath(),args:['--no-sandbox']});
 try{
  for(const width of [360,412]){
   const context=await browser.newContext({viewport:{width,height:900},deviceScaleFactor:1});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto('http://127.0.0.1:'+server.address().port);await page.waitForFunction(()=>window.demoReady);
   assert.equal(await page.locator('[data-v79-word]').count(),3);passed++;
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);passed++;
   for(const [i,word] of ['bed','friend','shorts'].entries()){
    await page.locator('[data-mg=v76-word-record]').click();
    await page.evaluate(word=>{window.rec.onresult({results:[[{transcript:word}]]});window.rec.onend();},word);
    assert.equal(await page.locator('.v79-read-done').count(),i+1);passed++;
    if(i<2)assert.equal(await page.locator('.v79-read-current span').textContent(),['friend','shorts'][i]);
   }
   assert.match(await page.locator('.v76-success').textContent(),/Wszystkie słowa zaliczone/);passed++;
   assert.equal(errors.length,0,errors.join('\n'));passed++;
   await page.screenshot({path:path.join(process.env.TEST_ARTIFACT_DIR||require('os').tmpdir(),'academy-v79-'+width+'.png'),fullPage:true});
   await context.close();
  }
 }finally{await browser.close();server.close();}
 console.log(JSON.stringify({passed,failed:0,scope:'Chromium, szerokości 360 i 412, rzeczywisty moduł i kliknięcia, symulowane nagranie'}));
})().catch(e=>{console.error(e);process.exitCode=1;});
