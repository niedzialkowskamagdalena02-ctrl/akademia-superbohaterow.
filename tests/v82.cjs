const assert=require('assert/strict'),fs=require('fs'),vm=require('vm'),path=require('path');
const ROOT=process.argv[2]||path.resolve(__dirname,'..');process.argv[2]=ROOT;
const {env,mission,task}=require('./v79-harness.cjs');let passed=0,failed=0;
const plain=x=>JSON.parse(JSON.stringify(x));async function test(n,f){try{await f();passed++;console.log('PASS',n)}catch(e){failed++;console.error('FAIL',n,e.stack)}}
function math(){return mission({books:[{id:'b1',title:'Matematyka',subject:'Matematyka'}],pages:[{id:'p1',bookId:'b1',number:1,text:'2 + 3 = 5. 8 − 2 = 6. 3 × 3 = 9. 12 ÷ 3 = 4.'},{id:'p2',bookId:'b1',number:2,text:'10 + 10 = 20.'}]});}
function polish(){return mission({books:[{id:'b1',title:'Polski',subject:'Polski'}],pages:[{id:'p1',bookId:'b1',number:1,text:'Żółta żaba siedzi. Łódka płynie. Kot pije mleko.'},{id:'p2',bookId:'b1',number:2,text:'Zegar pokazuje czas.'}]});}
function subjectGames(e,sub){return e.ctx.buildSubjectGames82(e.ctx.subjectPool82([],e.pages.slice(0,1),e.books,sub),sub,0);}
function solve(e,t){const act=s=>e.api.v80GameAction((t.game81?'g81-':'g80-')+s,t),k=t.game80;
 if(k==='word-catcher')act('catch:'+t.items80.findIndex(x=>x.en===t.answer));
 if(k==='letter-race')while(!t.correct)act('catch:'+t.flightRounds80[t.progress80].indexOf(t.answer[t.progress80]));
 if(k==='egg'){const used=new Set();for(const c of t.answer){const i=t.letters80.findIndex((x,i)=>x===c&&!used.has(i));used.add(i);act('letter:'+i);}act('check');}
 if(k==='balloon')while(!t.correct)act('balloon:'+t.fly80.indexOf(t.answer[t.slots80[t.progress80]]));
 if(k==='letter-thief')act('thief:'+t.letters81.indexOf(t.wordEn[t.gap81]));
 if(k==='block-tower')for(const [i,c] of [...t.wordEn].entries()){act('block:'+t.letters81[i].indexOf(c));act('drop');}
 if(k==='caterpillar')for(let i=0;i<t.items81.length;i++)act('pair:'+i+':'+i);
 if(k==='armor-builder')for(const p of t.parts81)act('armor-choice:'+p.choices.findIndex(x=>x.en===p.word.en));
 if(k==='web-climber')for(const [i,f] of t.floors81.entries())act('window:'+i+':'+f.choices.findIndex(x=>x.en===f.word.en));
 if(k==='moon-maze'){for(const [y,x] of [[2,1],[3,1],[3,2]])act('move:'+y+':'+x);for(const gate of [0,1,2]){if(gate===1)for(const [y,x] of [[3,3],[2,3],[1,3],[1,4]])act('move:'+y+':'+x);if(gate===2)for(const [y,x] of [[1,5],[2,5],[3,5],[4,5]])act('move:'+y+':'+x);act('door:'+t.gates81[gate].choices.findIndex(x=>x.en===t.gates81[gate].word.en));}act('move:5:5');}
}
(async()=>{
const w=env();vm.runInContext(fs.readFileSync(ROOT+'/assets/base.js','utf8').replace(/^import .*;\s*$/gm,'').replace(/export /g,''),w.ctx);const catalog=vm.runInContext('BASE_ITEMS',w.ctx);
for(const item of catalog)for(const balance of [item.cost,Math.max(0,item.cost-1)])await test('Cena '+item.id+' · saldo '+balance,()=>{const p={coins:balance},owned=[];const r=w.ctx.purchase82(p,item,owned);assert.equal(r.ok,balance>=item.cost);assert.equal(p.coins,balance>=item.cost?balance-item.cost:balance);assert.equal(owned.includes(item.id),balance>=item.cost);});
for(const coins of [undefined,null,NaN,Infinity,-1,'','15 zł',{},'nan'])await test('Uszkodzony portfel nie odblokowuje rzeczy: '+String(coins),()=>{const p={coins},owned=[];assert.equal(w.ctx.purchase82(p,{id:'x',cost:50},owned).ok,false);assert.equal(owned.length,0);});
await test('Tekstowe saldo 15 jest rozliczane liczbowo i tylko raz',()=>{const p={coins:'15'},a=[],item={id:'mask',cost:15};assert.equal(w.ctx.purchase82(p,item,a).ok,true);assert.equal(p.coins,0);assert.equal(w.ctx.purchase82(p,item,a).ok,false);assert.equal(a.length,1);});
await test('Cena katalogu oraz dostępność przycisku używają tej samej kontroli',()=>{const h=w.ctx.baseMarkup({coins:14,xp:0},(n,a)=>'<button data-action="'+a+'">'+n+'</button>');assert.match(h,/button disabled data-action="base:buy:spidermask"/);assert.ok(!w.ctx.affordable82({coins:14},{cost:15}));});
for(const sub of ['polski','matematyka'])for(const md of ['game','test']){
 const make=sub==='polski'?polish:math;const expected=sub==='polski'?10:5;
 await test(sub+' · '+md+' · źródła i liczba mechanik',()=>{const e=make(),g=subjectGames(e,sub);assert.equal(g.length,expected);assert.ok(g.every(t=>t.sourcePageId==='p1'&&t.subject82===sub));});
 for(const kind of (sub==='polski'?['letter-race','egg','balloon','letter-thief','block-tower']:[]).concat(['word-catcher','caterpillar','armor-builder','web-climber','moon-maze']))await test(sub+' · '+md+' · '+kind+' pełne zaliczenie',()=>{const e=make(),t=subjectGames(e,sub).find(x=>x.game80===kind);e.api.setTask(t,md);assert.ok(e.api.stage().includes('PRZYGODA')||e.api.stage().includes('AKADEMIA'));solve(e,t);assert.equal(t.correct,true);assert.equal(e.api.score(),1);e.api.answer(t.answer);assert.equal(e.api.score(),1);assert.ok(e.spoken.filter(x=>x.text).every(x=>x.lang==='pl-PL'));});
 await test(sub+' · '+md+' · mieszanka zostawia klasyczne czytanie i nie wychodzi poza stronę',()=>{const e=make();e.api.setTask(task(),md);const classic={type:'reading-mini',question:'Przeczytaj',answer:'Przeczytane'};const list=e.api.v80PrepareTasks([classic],e.pages.slice(0,1));assert.ok(list.includes(classic));assert.ok(list.some(t=>t.subject82===sub));assert.ok(list.filter(t=>t.game80).every(t=>t.sourcePageId==='p1'));});
}
await test('Matematyka nie tworzy działań z języka polskiego ani błędnego dzielenia',()=>{const e=math(),p=[{id:'x',bookId:'b1',text:'3 / 0 = ?. 3 / 2 = ?. 2 - 8 = ?'}];assert.equal(e.ctx.subjectPool82([],p,e.books,'matematyka').length,0);assert.equal(e.ctx.subjectPool82([],e.pages,[{id:'b1',subject:'Angielski'}],'matematyka').length,0);});
for(const md of ['game','test'])await test('Mentor odpowiada na wiele pytań UI i ogólnych · '+md,async()=>{let calls=0;const e=mission({ask:async p=>{calls++;assert.match(p,/KONKRETNE PYTANIE/);return JSON.stringify({kind:'help',text:calls%2?'Mikrofon jest czerwony. Dotknij go, żeby mówić.':'Iron Man buduje zbroje i pomaga przyjaciołom.'});}}),t=task();e.api.setTask(t,md);for(let i=0;i<8;i++)await e.api.tutorAsk(i%2?'Co robi Iron Man?':'Gdzie jest mikrofon?');assert.equal(calls,8);assert.ok(!t.v77Revealed&&!t.v82AwaitingReveal&&!t.v77HintCount);});
await test('Gotowe rozwiązanie wymaga uprzedzenia i osobnego Tak',async()=>{const e=mission(),t=task();e.api.setTask(t);await e.api.tutorAsk('Podaj odpowiedź');assert.ok(t.v82AwaitingReveal);assert.ok(!t.v77Revealed);assert.doesNotMatch(e.api.tutorMessages().at(-1).text,/\bcat\b/);assert.match(e.api.stage(),/tutor82-yes/);await e.api.tutorAsk('Tak');assert.equal(t.v77Revealed,true);assert.match(e.api.tutorMessages().at(-1).text,/cat/);e.api.answer('cat');await e.api.finish();assert.deepEqual(plain(e.api.coinsRewards()),[]);});
await test('Nie zachowuje możliwość zdobycia pieniędzy',async()=>{const e=mission(),t=task();e.api.setTask(t);await e.api.tutorAsk('Podaj odpowiedź');await e.api.tutorAsk('Nie, spróbuję sam');assert.ok(!t.v77Revealed&&!t.v82AwaitingReveal);e.api.answer('cat');await e.api.finish();assert.deepEqual(plain(e.api.coinsRewards()),[1]);});
await test('Zwykłe Tak bez oferty nie zdradza rozwiązania',async()=>{const e=mission({ask:async()=>JSON.stringify({kind:'help',text:'Powiedz, co mam Ci wyjaśnić.'})}),t=task();e.api.setTask(t);await e.api.tutorAsk('Tak');assert.ok(!t.v77Revealed);});
for(const raw of [JSON.stringify({kind:'reveal',text:'cat'}),JSON.stringify({kind:'hint',text:'Poprawna odpowiedź to cat.'}),'cat'])await test('Odpowiedź AI jest zatrzymana przed pokazaniem klucza: '+raw.slice(0,24),async()=>{const e=mission({ask:async()=>raw}),t=task();e.api.setTask(t);await e.api.tutorAsk('Co mam tu wpisać?');assert.ok(t.v82AwaitingReveal&&!t.v77Revealed);assert.doesNotMatch(e.api.tutorMessages().at(-1).text,/\bcat\b/);});
await test('Odmowa i zmiana zadania nie przenoszą zgody',async()=>{const e=mission(),a=task(),b=task({answer:'dog'});e.api.setTask(a);await e.api.tutorAsk('Podaj odpowiedź');e.api.setTask(b);await e.api.tutorAsk('Tak');assert.ok(!b.v77Revealed);});
await test('Spóźniona odpowiedź nie trafia do nowego zadania',async()=>{let resolve;const e=mission({ask:()=>new Promise(r=>resolve=r)}),a=task();e.api.setTask(a);const pending=e.api.tutorAsk('Pomóż');e.api.setTask(task({answer:'dog'}));resolve(JSON.stringify({kind:'help',text:'Stara odpowiedź'}));await pending;assert.ok(!e.api.tutorMessages().some(x=>x.text==='Stara odpowiedź'));});
await test('Sprawdzian odmawia ujawnienia także po Tak',async()=>{const e=mission({ask:async()=>JSON.stringify({kind:'reveal',text:'cat'})}),t=task();e.api.setTask(t,'test');await e.api.tutorAsk('Podaj odpowiedź');await e.api.tutorAsk('Tak');assert.ok(!t.v77Revealed&&!t.v82AwaitingReveal);});
await test('Offline nie podszywa się pod odpowiedź mentora',async()=>{const e=mission(),t=task();e.api.setTask(t);await e.api.tutorAsk('Jak to działa?');assert.match(e.api.tutorMessages().at(-1).text,/chwilowo nie może odpowiedzieć/);assert.ok(!t.v77Revealed);});
await test('Nauka przed pisaniem: nowicjusz dopasowuje, potem kopiuje, potem pisze z pamięci',()=>{const e=env(),pool=[{en:'water',pl:'woda',sourcePageId:'p1'},{en:'milk',pl:'mleko',sourcePageId:'p1'},{en:'bed',pl:'łóżko',sourcePageId:'p1'}],original={type:'write',answer:'water',question:'Write water'};let t=e.ctx.scaffoldStudy82([original],pool,{})[0];assert.equal(t.type,'vocab-choice');assert.equal(t.study82[0].pl,'woda');assert.equal(original.type,'write');t=e.ctx.scaffoldStudy82([original],pool,{water:{correct:2}})[0];assert.equal(t.model82,'water');assert.equal(t.copyPractice82,true);t=e.ctx.scaffoldStudy82([original],pool,{water:{correct:4}})[0];assert.equal(t.type,'write');assert.ok(!t.model82);t=e.ctx.scaffoldStudy82([original],pool,{water:{correct:2,guided:2}})[0];assert.ok(!t.model82);});
await test('Trening pokazuje lekcję, lektora EN/PL i dopiero potem zadanie',()=>{const e=mission(),list=e.api.v80PrepareTasks([],e.pages),t=list.find(t=>t.study82?.length);assert.ok(t);e.api.setTask(t);assert.match(e.api.stage(),/Najpierw poznaj słowo/);let b={dataset:{mg:'study82-listen'}};e.root.listeners.click({target:{closest:()=>b}});assert.ok(e.spoken.some(x=>x.lang==='en-GB'));const n=t.study82.length;for(let i=0;i<n;i++){b={dataset:{mg:'study82-next'}};e.root.listeners.click({target:{closest:()=>b}});}assert.equal(t.studyDone82,true);assert.doesNotMatch(e.api.stage(),/Najpierw poznaj słowo/);});
await test('Sprawdzian nie otrzymuje lekcji ani wzoru',()=>{const e=mission();e.api.setTask(task(),'test');const list=e.api.v80PrepareTasks([],e.pages);assert.ok(list.every(t=>!t.study82&&!t.model82));});
await test('Kopiowanie wzoru nie nalicza pieniędzy ani opanowania słowa',async()=>{const e=mission(),t=task({copyPractice82:true,study82:[{en:'cat'}]});e.api.setTask(t);t.studyDone82=true;e.api.answer('cat');await e.api.finish();assert.deepEqual(plain(e.api.coinsRewards()),[]);const progress=e.ctx.recordStudy82(t,{});assert.equal(progress.cat.correct,undefined);assert.equal(progress.cat.guided,1);});
await test('Lekcja i postęp nie wychodzą poza słówka z materiału; pomagane nie liczą się jako opanowane',()=>{const e=env(),pool=[{en:'water',pl:'woda',sourcePageId:'p1'}],t={type:'write',answer:'browser',correct:true};assert.equal(e.ctx.scaffoldStudy82([t],pool,{})[0].study82,undefined);assert.deepEqual(plain(e.ctx.recordStudy82({correct:true,v77Revealed:true,study82:[{en:'water'}]},{})),{});});
await test('Wąż czeka na ruch, rośnie po krysztale i utrzymuje wolniejsze tempo',()=>{
 const e=env(),timers=new Map(),buttons={};let id=0;
 const gradient={addColorStop(){}};
 const ctx=new Proxy({createLinearGradient:()=>gradient},{get:(o,k)=>o[k]||(()=>{})});
 for(const key of ['canvas','#arcade-status','#arcade-restart','#arcade-pause'])buttons[key]={textContent:'',addEventListener(n,f){this[n]=f;},getContext:()=>ctx,width:240,height:384};
 e.root.querySelector=s=>buttons[s];e.root.querySelectorAll=()=>[];
 e.ctx.setInterval=(fn,ms)=>{timers.set(++id,{fn,ms});return id};e.ctx.clearInterval=id=>timers.delete(id);
 e.ctx.window.addEventListener=(n,fn)=>e.ctx.window[n]=fn;e.ctx.window.removeEventListener=n=>delete e.ctx.window[n];
 vm.runInContext('Math.random=()=>49.5/109;',e.ctx);
 vm.runInContext(fs.readFileSync(ROOT+'/assets/arcade.js','utf8').replace(/export /g,''),e.ctx);
 e.ctx.mountArcade('snake',e.root);
 const hud=buttons['#arcade-status'],press=key=>e.ctx.window.keydown({key,preventDefault(){}});
 assert.equal(timers.size,0);assert.match(hud.textContent,/Długość: 3.*aby zacząć/);
 press('ArrowLeft');assert.equal(timers.size,0);press('ArrowRight');press('ArrowRight');assert.equal(timers.size,1);
 const tick=[...timers.values()][0];assert.equal(tick.ms,520);tick.fn();assert.match(hud.textContent,/Kryształy: 1.*Długość: 4/);
 press('ArrowDown');tick.fn();assert.match(hud.textContent,/Długość: 4/);
 buttons['#arcade-pause'].click();assert.equal(buttons['#arcade-pause'].textContent,'▶ Wznów');
 buttons['#arcade-restart'].click();assert.equal(timers.size,0);assert.match(hud.textContent,/Długość: 3/);
 press('ArrowUp');assert.equal(timers.size,1);e.ctx.stopArcade();assert.equal(timers.size,0);
});
console.log(JSON.stringify({passed,failed,scope:'V82: ceny, mentor, zgoda, źródła PL/MAT, nauka EN, Wąż'}));if(failed)process.exitCode=1;
})();
