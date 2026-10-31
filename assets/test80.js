// Separate preview entry point. Never imported by the production index.html.
if(location.hostname==='niedzialkowskamagdalena02-ctrl.github.io'){
 document.querySelector('#app').textContent='Wersję testową otwieraj pod osobnym adresem testowym, aby zachować oddzielne dane.';
 throw Error('Test preview is disabled on the production origin');
}
globalThis.AKADEMIA_TEST80=true;
// Defence in depth: no production AI, family-sync or photo requests can leave this preview.
const browserFetch80=globalThis.fetch.bind(globalThis);
globalThis.fetch=(input,options)=>{const url=new URL(typeof input==='string'?input:input.url,location.href);if(url.hostname==='akademia-ai.niedzialkowskamagdalena02.workers.dev')return Promise.reject(new DOMException('W podglądzie V80 produkcyjne AI i synchronizacja są wyłączone.','NotAllowedError'));return browserFetch80(input,options)};
const [{initial,get,put},{vocabulary76,makeVocabularyTasks76},{GAME_TITLES80,buildGames80},{mountMissionGame}]=await Promise.all([import('./data.js'),import('./english76.js?v=80'),import('./games80.js?v=80'),import('./mission-game.js?v=80')]);
const bookId80='v80-demo-book',demoPages80=[
 {number:1,text:'Hello friend! Listen, read, write, think, say and ask. A pencil, a pen, a book, a chair, a table. Monday Tuesday Wednesday Thursday Friday Saturday Sunday.'},
 {number:2,text:'A cat, a dog, a lion, a bird, a fish, a rabbit. A tree, a flower, the sun. A sunflower. A car and a pet. A carpet. My bed is in my house.'},
 {number:3,text:'Apple banana broccoli carrot tomato pear bread egg cheese milk water juice. One two three. Red blue green yellow. A spoon and a plate.'},
 {number:4,text:'Spring summer autumn winter. A season. Shorts trousers jacket coat dress shoes hat socks. A ball at school.'}
].map((p,i)=>({...p,id:'v80-demo-page-'+i,bookId:bookId80,chapter:i<2?'Dział 1':'Dział 2'}));
let demoState80=await get('state');if(!demoState80){demoState80=initial();demoState80.books=[{id:bookId80,title:'Angielski — materiał testowy V80',child:'pawel',audience:['pawel'],subject:'Angielski',grade:'2',type:'Podręcznik',part:'1'}];demoState80.bookPages=demoPages80;await put('state',demoState80)}
if(!demoState80.parentPin){demoState80.parentPin='0000';await put('state',demoState80)}
const params80=new URLSearchParams(location.search),kind80=params80.get('demo'),testMode80=params80.get('mode')==='test';
const banner80=document.querySelector('#v80-test-banner');banner80.innerHTML='<strong>V80 TEST · oddzielne dane</strong><p>To materiały przykładowe. Synchronizacja z rodziną i produkcyjne AI są wyłączone. Mikrofon i głosy korzystają z telefonu. PIN przykładowego panelu mamy: 0000.</p><nav><a href="?">Akademia V80</a><a href="?app=1">Pełna Akademia</a><button id="v80-reset">Wyzeruj dane testowe</button></nav>';
document.querySelector('#v80-reset').onclick=async()=>{if(!confirm('Wyzerować wyłącznie dane tej testowej strony?'))return;const db=await import('./data.js');await db.replaceRecords([]);for(let i=localStorage.length-1;i>=0;i--){const key=localStorage.key(i);if(key.startsWith('academy-'))localStorage.removeItem(key)}location.href=location.pathname};
if(!kind80){await import('./app.js?v=80')}
else{
 const round=Math.max(0,Number(params80.get('round'))||0),pool=demoPages80.flatMap(p=>vocabulary76(p.text).map(x=>({...x,sourcePageId:p.id,sourceBookId:bookId80,pageNumber:p.number,sourceTitle:'Przykładowy materiał V80'}))),unique=[...new Map(pool.map(x=>[x.en,x])).values()];
 let tasks=buildGames80(unique,round);if(kind80!=='all')tasks=tasks.filter(t=>t.game80===kind80);
 const base={sourceBookId:bookId80,sourcePageId:demoPages80[0].id,pageNumber:1,vocab76:true,done:false,correct:false};
 if(kind80==='reading')tasks=[{...base,type:'vocab-reading',question:'Read the words aloud, in order.',questionPl:'Przeczytaj słowa po angielsku, w podanej kolejności.',readWords:['monday','tuesday','wednesday'],readMeanings:['poniedziałek','wtorek','środa'],answer:'monday tuesday wednesday',wordEn:'monday',audio:'monday tuesday wednesday'}];
 if(kind80==='match')tasks=[{...base,type:'vocab-match',question:'Match the English words with their Polish meanings.',questionPl:'Połącz angielskie słowa z ich polskimi znaczeniami.',answer:'Wszystkie pary',pairs:[{en:'listen',pl:'słuchać'},{en:'pencil',pl:'ołówek'},{en:'lion',pl:'lew'},{en:'hello',pl:'cześć'}],right:[0,1,2,3],matched:[],left:null}];
 if(kind80==='choice')tasks=makeVocabularyTasks76(unique,round,10).filter(t=>t.type==='vocab-choice').slice(0,1).map(t=>({...t,vocab76:true}));
 const app=document.querySelector('#app');app.innerHTML='<main class="wrap"><nav class="v80-demo-nav"><a href="?">← Akademia</a><a href="?demo='+kind80+'&round='+(round+1)+(testMode80?'&mode=test':'')+'">Inny zestaw słów</a><a href="?demo='+kind80+'&round='+round+'&mode='+(testMode80?'game':'test')+'">'+(testMode80?'Przełącz na trening':'Przełącz na sprawdzian')+'</a></nav><div id="v80-demo-game"></div></main>';
 const root=document.querySelector('#v80-demo-game');if(!tasks.length){root.textContent='Nie ma takiego zestawu. Wróć do listy gier.';throw Error('Unknown demo')}
 const child='pawel';localStorage.setItem('academy-v49-session-'+child+'-'+bookId80,JSON.stringify({scope:'all',mode:testMode80?'test':'game',tasks,idx:0,points:0,award:false}));
 const {speak}=await import('./voice.js?v=80');mountMissionGame(root,{books:demoState80.books,pages:demoPages80,ask:async()=>{throw Error('Produkcja AI wyłączona w wersji testowej')},speak,child,initialBookId:bookId80,childGrade:'2',reward:async coins=>{const s=await get('state');s.profiles.pawel.coins+=coins;s.history.push({id:crypto.randomUUID(),child:'pawel',title:'Test gry V80',points:coins,date:new Date().toISOString()});await put('state',s)},onBack:()=>{location.href='?'}});root.querySelector('[data-mg=resume]')?.click();
}
