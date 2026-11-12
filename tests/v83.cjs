const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
process.argv[2]=path.join(__dirname,'..');
const {app,data}=require('./legacy/test.cjs');
const key='academy-v75-outside-pawel-angielski';
const builtInExample={q:'What do we call the water that falls from the clouds?',a:['Rain','Snow','Wind'],ok:0};

function fixture(){
 const e=app();
 e.api.set(data(),{role:'child',who:'pawel'});
 vm.runInContext(`globalThis.outside83={
  start:button=>{v37Subject='angielski';trainingStep='outside';return handle('v37:play',button)},
  panel:avengersPanel,run:()=>avengersRun,check:checkAcademyUpdate
 };`,e.ctx);
 return e;
}
function button(e){return Object.assign(e.element(),{removeAttribute(){}})}
function selectSavedFirst(e){vm.runInContext('let rand83=0;Math.random=()=>rand83++===0?0:0.999999;',e.ctx)}

async function main(){
 const quiz=fixture();
 quiz.storage.setItem(key,JSON.stringify([builtInExample]));
 selectSavedFirst(quiz);
 await quiz.ctx.outside83.start(button(quiz));
 const panel=quiz.ctx.outside83.panel();
 assert.match(panel,/What do we call the water that falls from the clouds\?/);
 assert.match(panel,/Jak nazywamy wodę, która spada z chmur\?/);
 assert.match(panel,/v37:say:en-US:What/);
 assert.match(panel,/v37:say:pl-PL:Jak/);
 assert.match(panel,/v37:say:en-US:Rain/);
 assert.equal(quiz.ctx.outside83.run().items.length,10);
 assert.ok(quiz.ctx.outside83.run().items.every(q=>q.q&&q.qPl));
 console.log('PASS Pytanie ze zdjęcia i cała angielska misja mają polecenia i odsłuch EN/PL');

 const legacy=fixture();
 const question={q:'What season comes after spring?',a:['Autumn','Summer','Winter'],ok:1};
 legacy.storage.setItem(key,JSON.stringify([question]));
 legacy.ctx.fetch=async()=>new Response(JSON.stringify({answer:'{"translations":[{"index":0,"text":"Jaką porę roku mamy po wiośnie?"}]}'}));
 selectSavedFirst(legacy);
 await legacy.ctx.outside83.start(button(legacy));
 const stored=JSON.parse(legacy.storage.getItem(key))[0];
 assert.deepEqual(stored,{...question,qPl:'Jaką porę roku mamy po wiośnie?'});
 assert.match(legacy.ctx.outside83.panel(),/Jaką porę roku mamy po wiośnie\?/);
 console.log('PASS Starsze pytanie otrzymuje tłumaczenie bez zmiany odpowiedzi');

 const offline=fixture();
 offline.storage.setItem(key,JSON.stringify([question]));
 offline.ctx.fetch=async()=>new Response('',{status:400});
 selectSavedFirst(offline);
 await offline.ctx.outside83.start(button(offline));
 assert.ok(offline.ctx.outside83.run().items.every(q=>q.q&&q.qPl));
 assert.equal(JSON.parse(offline.storage.getItem(key))[0].q,question.q);
 console.log('PASS Przy braku tłumaczenia aplikacja używa gotowych pytań i zachowuje stary wpis');

 const e=fixture(),btn=e.element();btn.textContent='🔄 Aktualizuj Akademię';
 const current=Number(fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8').match(/name="academy-release" content="(\d+)"/)[1]);
 let navigated=null,remote=current;
 e.ctx.window.location={href:'https://academy.example/root/#profile',replace:url=>{navigated=url}};
 e.ctx.fetch=async(url,{cache})=>{
  assert.equal(cache,'no-store');
  assert.equal(url.pathname,'/root/');
  assert.ok(url.searchParams.has('academy-update'));
  assert.equal(url.hash,'');
  return new Response('<meta name="academy-release" content="'+remote+'">');
 };
 await e.ctx.outside83.check(btn);
 assert.equal(navigated,null);assert.match(e.ids.notice.textContent,/aktualną wersję/);
 remote=current+1;await e.ctx.outside83.check(btn);
 assert.match(navigated,/^https:\/\/academy\.example\/root\/\?academy-update=/);
 assert.equal(btn.disabled,false);
 e.ctx.fetch=async()=>{throw Error('offline')};navigated=null;
 await e.ctx.outside83.check(btn);
 assert.equal(navigated,null);assert.match(e.ids.notice.textContent,/Sprawdź internet/);
 console.log('PASS Przycisk sprawdza wersję bez cache, przeładowuje nowszą i obsługuje brak sieci');

 const listeners={},writes=[];
 const ctx=vm.createContext({URL,Response,location:{origin:'https://academy.example'},
  self:{addEventListener:(name,fn)=>{listeners[name]=fn}},
  caches:{match:async key=>new Response(String(key)),open:async()=>({put:async key=>{writes.push(key)}})},
  fetch:async(request,options)=>{assert.equal(options.cache,'no-store');return new Response('nowa wersja')}
 });
 vm.runInContext(fs.readFileSync(path.join(__dirname,'..','sw.js'),'utf8'),ctx);
 const request={url:'https://academy.example/root/?academy-update=1',method:'GET',mode:'cors'};
 listeners.fetch({request,respondWith(){assert.fail('Sprawdzanie aktualizacji ma ominąć cache aplikacji')}});
 let response,wait;
 listeners.fetch({request:{...request,mode:'navigate'},respondWith:p=>{response=p},waitUntil:p=>{wait=p}});
 assert.equal(await (await response).text(),'nowa wersja');await wait;
 assert.deepEqual(writes,['https://academy.example/root/']);
 ctx.fetch=async()=>{throw Error('offline')};
 listeners.fetch({request:{...request,mode:'navigate'},respondWith:p=>{response=p}});
 assert.equal(await (await response).text(),'https://academy.example/root/');
 console.log('PASS Service worker omija cache przy sprawdzeniu i zachowuje dostęp offline po aktualizacji');
}
main().catch(error=>{console.error(error);process.exitCode=1});
