// V41: interaktywne misje z podrecznikow, AI generuje tresc, aplikacja mechanike.
export function mountMissionGame(root,{books,pages,ask,speak,reward,child,initialBookId}){
 const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const norm=s=>String(s??'').trim().toLocaleLowerCase('pl-PL').replace(/\s+/g,' ');
 const btn=(label,act,cls='')=>`<button type="button" class="${cls}" data-mg="${act}">${label}</button>`;
 const shuffle=a=>[...a].sort(()=>Math.random()-.5);
 let bookId=initialBookId||'',scope='all',mode='game',tasks=[],idx=0,points=0,choice=null,answered=false,tiles=[],busy=false,award=false,progress={};
 const book=()=>books.find(b=>b.id===bookId);
 const subject=()=>/ang|english/i.test(book()?.subject||'')?'angielski':/mat/i.test(book()?.subject||'')?'matematyka':'polski';
 const available=()=>books.filter(b=>pages.some(p=>p.bookId===b.id&&p.text?.trim()));
 const pagesFor=()=>pages.filter(p=>p.bookId===bookId&&p.text?.trim()).sort((a,b)=>a.number-b.number);
 const material=()=>pagesFor().filter(p=>scope==='all'||String(p.number)===scope).map(p=>`STRONA ${p.number}: ${p.text}`).join('\n').slice(0,15000);
 const themes={polski:['🕵️ Detektyw Spider-Mana','🦹 Pułapka Lokiego','🎙️ Laboratorium czytania','🧩 Szyfr Avengersów','✍️ Dyktando Kapitana','🔠 Sylaby i głoski','📝 Krzyżówka'],matematyka:['🔐 Sejf Iron Mana','🛒 Sklep Avengersów','⏰ Zegar misji','📐 Geometria','🧮 Działania','🧠 Logiczne zagadki'],angielski:['🎧 Słuchanie','🎙️ Wymowa','🃏 Memory','🧩 Rozsypanki','✍️ Pisownia','🦹 Pułapka Lokiego','🗣️ Dialogi']};
 const plan={polski:['detective','loki','reading','order','dictation','syllables','crossword','choice'],matematyka:['safe','shop','clock','choice','safe','order','choice','shop'],angielski:['listening','memory','order','spelling','loki','reading','choice','listening']};
 const storeKey=()=>`academy-v41-${child}-${bookId}-${scope}`;
 function setup(){
  const bs=available();
  if(!bs.length){root.innerHTML='<section class="mg-panel"><h2>📚 Brakuje tekstu z podręcznika</h2><p>Dodaj strony i uruchom rozpoznawanie tekstu AI w panelu książek.</p></section>';return}
  if(!bs.some(b=>b.id===bookId))bookId=bs[0].id;
  root.innerHTML=`<section class="mg-panel"><header class="mg-header"><small>⚡ AKADEMIA SUPERBOHATERÓW</small><h2>🎮 Misje specjalne</h2><p>Jedna książka. Nieskończenie wiele wariantów przygód!</p></header>
  <label>📚 Podręcznik</label><select id="mg-book">${bs.map(b=>`<option value="${escape(b.id)}">${escape(b.title)} · ${escape(b.subject)}</option>`).join('')}</select>
  <label>📖 Dział lub strona</label><select id="mg-scope"><option value="all">Wszystkie dostępne strony (cały dział)</option>${pagesFor().map(p=>`<option value="${escape(p.number)}">Strona ${escape(p.number)}</option>`).join('')}</select>
  <label>🎯 Rodzaj misji</label><select id="mg-mode"><option value="game">🎮 Przygoda z wyjaśnieniami</option><option value="test">🏆 Próbny sprawdzian</option></select>
  <div class="mg-gallery">${themes[subject()].map(t=>`<div>${t}</div>`).join('')}</div>${btn('⚡ ROZPOCZNIJ MISJĘ SPECJALNĄ','start','mg-primary')}
  <p class="mg-hint">AI tworzy zadania z rozpoznanych stron. Przed nauką sprawdź, czy tekst ze zdjęć został prawidłowo odczytany.</p></section>`;
  root.querySelector('#mg-book').value=bookId;
  root.querySelector('#mg-scope').value=scope;
  root.querySelector('#mg-mode').value=mode;
  root.querySelector('#mg-book').onchange=e=>{bookId=e.target.value;scope='all';setup()};
  root.querySelector('#mg-scope').onchange=e=>{scope=e.target.value};
  root.querySelector('#mg-mode').onchange=e=>{mode=e.target.value};
 }
 function parse(raw){
  let s=String(raw).replace(/```(?:json)?/gi,'').replace(/```/g,'');
  s=s.slice(s.indexOf('{'),s.lastIndexOf('}')+1);
  const obj=JSON.parse(s);
  if(!Array.isArray(obj.tasks))throw Error('AI nie zwróciło listy zadań');
  const good=obj.tasks.filter(t=>t&&typeof t.question==='string'&&typeof t.answer==='string'&&typeof t.explanation==='string'&&Array.isArray(t.options)&&t.options.length===4&&t.options.every(x=>typeof x==='string'));
  if(good.length<5)throw Error('AI przygotowało zbyt mało poprawnych zadań');
  return good.slice(0,8).map((t,i)=>({...t,type:plan[subject()][i],options:t.options.slice(0,4),done:false,correct:false}));
 }
 async function start(){
  if(busy)return;
  const source=material();if(!source)return setup();
  busy=true;root.innerHTML='<section class="mg-panel"><h2>🧠 Mentor AI tworzy misję...</h2><p>Przygotowuję zagadki, interakcje i finał.</p></section>';
  const difficulty=(()=>{try{return JSON.parse(localStorage.getItem(storeKey())||'{}').weak||[]}catch{return []}})();
  const prompt=`Jesteś doświadczonym nauczycielem klasy 2 szkoły podstawowej. Tworzysz 8 zadań dla dziecka, przedmiot: ${subject()}. ZADANIA MUSZĄ WYNIKAĆ Z MATERIAŁU. Kolejne rodzaje: ${plan[subject()].join(', ')}. Każde zadanie ma być INNE. Dla polskiego ćwicz czytanie ze zrozumieniem, ortografię, rzeczowniki, czasowniki, przymiotniki, sylaby, głoski i krzyżówki. Dla matematyki: działania, zakupy, zegar, porównania, zadania tekstowe, geometrię, logiczne myślenie. Dla angielskiego: słówka, tłumaczenia, wymowę, rozumienie ze słuchu, pisownię, układanie zdań i dialogi. Uczeń wcześniej mylił: ${difficulty.join('; ')}. W odpowiedzi zwróć TYLKO JSON: {"tasks":[{"question":"krótkie polecenie","answer":"jedna poprawna odpowiedź","options":["cztery","różne","możliwe","odpowiedzi"],"explanation":"krótkie wyjaśnienie po polsku","audio":"słowo do odsłuchania"}]}. Każda tablica options MUSI zawierać answer dokładnie raz. Dla zadań typu safe i shop odpowiedź to liczba. Dla clock odpowiedź to godzina HH:MM. Dla memory: options to 4 różne pary w formacie "polski=english"; answer to pierwsza para dokładnie. Dla crossword: options to 4 hasła "SŁOWO=wskazówka", answer to pierwsze słowo. Dla order: answer to 2-5 wyrazów, których kolejność uczeń ułoży. Dla spelling: answer to 3-10 liter. Dla syllables: answer to liczba sylab. Dla reading: question to krótki fragment do przeczytania i pytanie, answer do wyboru z options. Dla dictation: audio to słowo do zapisania, answer to to słowo. Dla listening: audio to angielskie słowo, answer to polskie znaczenie. Unikaj niejednoznaczności i błędów w liczeniu głosek. Nie wstawiaj znaków nowej linii wewnątrz stringów JSON. MATERIAŁ: ${source}`;
  try{tasks=parse(await ask(prompt));idx=0;points=0;award=false;reset();draw()}
  catch(err){root.innerHTML=`<section class="mg-panel"><h2>⚠️ AI nie przygotowało misji</h2><p>${escape(err.message)}</p>${btn('Spróbuj ponownie','start')}${btn('Wróć','back')}</section>`}
  finally{busy=false}
 }
 function reset(){choice=null;answered=false;tiles=[]}
 const task=()=>tasks[idx];
 function answer(value){
  if(answered)return;
  const t=task();choice=String(value);answered=true;t.done=true;
  t.correct=norm(choice)===norm(t.answer);
  if(t.correct)points++;
  draw();
 }
 function stage(){const t=task();let html='';
  if(t.type==='safe')html+=`<div class="mg-vault ${answered&&t.correct?'mg-unlocked':''}"><div class="mg-vault-door">🔐</div><div class="mg-vault-gold">🪙 🪙 ✨ 🪙 🪙</div></div>`;
  if(t.type==='shop')html+='<div class="mg-scene">🛒 🍎 🥛 🍞 💰</div>';
  if(t.type==='clock')html+='<div class="mg-scene">⏰ 🕒</div>';
  if(t.type==='listening'||t.type==='dictation')html+=btn('🔊 Odsłuchaj','audio','mg-sound');
  if(t.type==='reading')html+=btn('🔊 Posłuchaj fragmentu','audio','mg-sound');
  html+=`<h3>${escape(t.question)}</h3>`;
  if(t.type==='memory'){
   if(!t.cards){t.cards=t.options.map((s,i)=>({i,p:s.split('=')})).filter(x=>x.p.length===2).flatMap(x=>[{pair:x.i,text:x.p[0]},{pair:x.i,text:x.p[1]}]);t.cards=shuffle(t.cards);t.matched=[];t.flipped=[]}
   html+=`<div class="mg-memory">${t.cards.map((c,i)=>btn(t.matched.includes(i)||t.flipped.includes(i)?escape(c.text):'❔','flip:'+i,'mg-memory-card '+(t.matched.includes(i)?'mg-matched':''))).join('')}</div>`;
  }else if(t.type==='crossword'){
   html+='<div class="mg-cross">'+t.options.map((s,i)=>{const [word,clue]=s.split('=');return `<label>${escape(clue||'Wpisz hasło')}</label><input data-mg-cross="${i}" maxlength="${Math.max(3,word.length)}" placeholder="${'□'.repeat(Math.min(word.length,16))}" autocomplete="off">`}).join('')+'</div>'+btn('✓ Sprawdź hasła','cross','mg-primary');
  }else if(t.type==='order'||t.type==='spelling'){
   if(!t.chunks)t.chunks=shuffle(t.type==='order'?t.answer.split(/\s+/):Array.from(t.answer));
   html+=`<div class="mg-built">${escape(tiles.map(i=>t.chunks[i]).join(t.type==='order'?' ':'')||'Dotknij kafelków, aby ułożyć odpowiedź')}</div><div class="mg-choices">${t.chunks.map((v,i)=>btn(escape(v),'tile:'+i,'mg-choice '+(tiles.includes(i)?'mg-tile-used':''))).join('')}</div>${btn('↩ Cofnij','undo')}${btn('✓ Sprawdź','submit','mg-primary')}`;
  }else if(t.type==='dictation'){
   html+='<input id="mg-written" autocomplete="off" placeholder="Wpisz usłyszane słowo">'+btn('✓ Sprawdź','written','mg-primary');
  }else{
   html+=`<div class="mg-choices">${t.options.map((v,i)=>btn(escape(v),'pick:'+i,'mg-choice')).join('')}</div>`;
  }
  if(answered){html+=`<div class="mg-feedback">${t.correct?'🌟 Świetnie!':'💡 Poprawna odpowiedź: '+escape(t.answer)}${mode==='test'?'':`<p>${escape(t.explanation)}</p>`}</div>`+btn(idx===tasks.length-1?'🏆 Zakończ misję':'➡️ Następna zagadka','next','mg-primary')}
  return html;
 }
 function draw(){
  if(idx>=tasks.length)return finish();
  const t=task();
  const names={safe:'🔐 Sejf Iron Mana',shop:'🛒 Sklep Avengersów',clock:'⏰ Zegar misji',detective:'🕵️ Detektyw Spider-Mana',loki:'🦹 Bitwa z Lokim',reading:'🎙️ Laboratorium czytania',order:'🧩 Szyfr Avengersów',dictation:'✍️ Dyktando Kapitana',syllables:'🔠 Sylaby i głoski',crossword:'📝 Krzyżówka',choice:'⚡ Zagadka bohatera',listening:'🎧 Misja słuchowa',memory:'🃏 Memory',spelling:'✍️ Pisownia'};
  root.innerHTML=`<section class="mg-panel"><header class="mg-header"><small>${mode==='test'?'🏆 PRÓBNY SPRAWDZIAN':'⚡ MISJA SPECJALNA'}</small><h2>${names[t.type]||'🎮 Misja bohatera'}</h2><p>Wyzwanie ${idx+1} z ${tasks.length}</p><div class="mg-bar"><div style="width:${Math.round(idx/tasks.length*100)}%"></div></div></header>${stage()}</section>`;
 }
 function finish(){
  if(!award){award=true;const weak=tasks.filter(t=>!t.correct).map(t=>t.question).slice(0,8);try{localStorage.setItem(storeKey(),JSON.stringify({weak,date:Date.now(),score:points,total:tasks.length}))}catch{}
   if(points>0)reward(Math.min(12,points));}
  root.innerHTML=`<section class="mg-panel mg-final"><div class="mg-fireworks">✨ 🪙 ⭐ 🪙 ✨</div><h2>🏆 Misja ukończona!</h2><strong>${points} / ${tasks.length}</strong><p>Monety za misję: ${Math.min(12,points)}. Wróć do błędów lub rozpocznij nową przygodę.</p>${tasks.map(t=>`<details><summary>${t.correct?'✅':'📖'} ${escape(t.question)}</summary><p>Odpowiedź: ${escape(t.answer)}</p><p>${escape(t.explanation)}</p></details>`).join('')}${btn('🔄 Nowa misja AI','start','mg-primary')}${btn('📚 Zmień dział','back')}</section>`;
 }
 root.addEventListener('click',ev=>{
  const b=ev.target.closest('[data-mg]');if(!b||busy)return;
  const act=b.dataset.mg,t=task();
  if(act==='start')return start();if(act==='back')return setup();
  if(act==='next'){idx++;reset();return draw()}
  if(act==='audio')return speak(t.audio||t.question,subject()==='angielski'?'en-US':'pl-PL');
  if(answered)return;
  if(act.startsWith('pick:'))return answer(t.options[Number(act.slice(5))]);
  if(act.startsWith('tile:')){const i=Number(act.slice(5));if(!tiles.includes(i)){tiles.push(i);draw()}return}
  if(act==='undo'){tiles.pop();return draw()}
  if(act==='submit')return answer(tiles.map(i=>t.chunks[i]).join(t.type==='order'?' ':''));
  if(act==='written')return answer(root.querySelector('#mg-written')?.value||'');
  if(act==='cross'){
   const words=t.options.map(s=>s.split('=')[0]);const vals=[...root.querySelectorAll('[data-mg-cross]')].map(x=>x.value);
   const correct=words.every((w,i)=>norm(w)===norm(vals[i]));t.answer=words.join(', ');
   return answer(correct?t.answer:'');
  }
  if(act.startsWith('flip:')){
   const i=Number(act.slice(5));if(t.matched.includes(i)||t.flipped.includes(i)||t.flipped.length>=2)return;
   t.flipped.push(i);draw();
   if(t.flipped.length===2){const [a,b]=t.flipped;
    if(t.cards[a].pair===t.cards[b].pair){t.matched.push(a,b);t.flipped=[];if(t.matched.length===t.cards.length){t.answer='Wszystkie pary';return answer('Wszystkie pary')}draw()}
    else{busy=true;setTimeout(()=>{t.flipped=[];busy=false;draw()},850)}
   }
  }
 });
 setup();return {open:setup};
}
