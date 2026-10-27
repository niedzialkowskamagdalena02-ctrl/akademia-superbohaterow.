import { initHeadquarters3D } from './headquarters3d.js';
import {initial,get,put,del,allRecords,replaceRecords,compress,uid,gradeName} from './data.js';
import {speak,listen} from './voice.js';
import {vocabulary,readings,explanation} from './learning.js';
import {syncAdapter} from './sync.js';
import {BASE_ITEMS,baseMarkup,migrateBase} from './base.js';
import {mountArcade,stopArcade} from './arcade.js';
let mentorHistory={tech:[],fun:[]};
let testMode=false,testSnapshot=null;let previewAll=false;let data,role='',who='',tab='home',adminTab='home',bookId='',pageId='',missionId='',practice=null,practiceAnswered=false,tracePoints=[],traceDown=false,traceMask=null;
const app=document.querySelector('#app'), $=id=>document.getElementById(id), e=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const date=()=>new Date().toISOString().slice(0,10), profile=()=>data.profiles[who], books=()=>data.books.filter(b=>b.child===who), pages=id=>data.books.length?null:null;
const speakBtn=(s,lang='pl-PL')=>`<button class="listen" data-speak="${e(s)}" data-lang="${lang}" title="Odsłuchaj" aria-label="Odsłuchaj">🔊</button>`;
const button=(name,action,cls='alt')=>`<button class="${cls}" data-action="${action}">${name}</button>`;
const input=(id,label,value='',type='text')=>`<label for="${id}">${label}</label><input id="${id}" type="${type}" value="${e(value)}">`;
const select=(id,label,options,value)=>`<label for="${id}">${label}</label><select id="${id}">${options.map(([v,t])=>`<option value="${e(v)}" ${v===value?'selected':''}>${e(t)}</option>`).join('')}</select>`;
const grades=[['P','Przedszkole'],...Array.from({length:12},(_,i)=>[String(i+1),`Klasa ${i+1}`])];
const people=[['pawel','Paweł'],['patryk','Patryk']];
const note=t=>{const n=$('notice');n.textContent=t;n.classList.add('visible');setTimeout(()=>n.classList.remove('visible'),4500)};
const save=async()=>{if(testMode)return;await put('state',data);await syncAdapter.onLocalChange(data)};
const img=async id=>{const blob=await get('image:'+id);return blob?URL.createObjectURL(blob):''};
let ocrBusy=false;
function ocrStatus(message,progress){
 const el=$('ocrstatus');if(el){el.textContent=message+(Number.isFinite(progress)?' ('+Math.round(progress*100)+'%)':'');el.hidden=false;}
 const btns=document.querySelectorAll('[data-action="page:ocr"],[data-action="reader:ocr"]');btns.forEach(b=>b.disabled=ocrBusy);
}
async function loadOcrLibrary(){
 if(window.Tesseract?.createWorker)return;
 await new Promise((resolve,reject)=>{
  const script=document.createElement('script');script.src='https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js';
  script.onload=resolve;script.onerror=()=>reject(Error('Nie udało się pobrać silnika OCR. Sprawdź połączenie z internetem.'));
  document.head.appendChild(script);
 });
 if(!window.Tesseract?.createWorker)throw Error('Silnik OCR nie został uruchomiony.');
}
async function prepareOcrImage(blob, mode='contrast'){
 const bitmap=await createImageBitmap(blob);
 try{
  const scale=Math.min(2.4,2600/Math.max(bitmap.width,bitmap.height));
  const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));
  const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);
  const frame=ctx.getImageData(0,0,canvas.width,canvas.height), px=frame.data;
  // Rozjaśnij kolorowe tło i wzmocnij ciemne litery. Zachowaj pełną stronę.
  for(let i=0;i<px.length;i+=4){
   const r=px[i],g=px[i+1],b=px[i+2];
   let lum=.299*r+.587*g+.114*b;
   if(mode==='contrast'){
    const max=Math.max(r,g,b),min=Math.min(r,g,b);
    // zielone i żółte tła podbijamy do jasności papieru
    if(g>r*1.12&&g>b*.95&&lum>75)lum=Math.min(255,lum+40);
    lum=Math.max(0,Math.min(255,(lum-125)*1.65+195));
   }else{lum=Math.max(0,Math.min(255,(lum-125)*1.25+155));}
   px[i]=px[i+1]=px[i+2]=lum;
  }
  ctx.putImageData(frame,0,0);
  return canvas;
 }finally{bitmap.close()}
}
async function recognizePage(page,language='pol'){
 if(ocrBusy)throw Error('Rozpoznawanie już trwa. Poczekaj na zakończenie.');
 ocrBusy=true;let worker=null;
 try{
  ocrStatus('Uruchamiam rozpoznawanie…');await loadOcrLibrary();
  const blob=await get('image:'+page.imageId);if(!blob)throw Error('Nie znaleziono zdjęcia tej strony.');
  ocrStatus('Ładuję język '+(language==='eng'?'angielski':'polski')+'…');
  worker=await window.Tesseract.createWorker(language,1,{logger:m=>{if(m.status==='recognizing text')ocrStatus('Analizuję stronę…',m.progress);}});
  await worker.setParameters({preserve_interword_spaces:'1',user_defined_dpi:'300'});
  const variants=[['oryginał',blob,'6'],['poprawiony kontrast',await prepareOcrImage(blob,'contrast'),'6'],['odcienie szarości',await prepareOcrImage(blob,'gray'),'11']];
  let best=null;
  for(let i=0;i<variants.length;i++){
   const [name,source,psm]=variants[i];ocrStatus('Odczyt '+(i+1)+'/3: '+name+'…');
   await worker.setParameters({tessedit_pageseg_mode:psm});
   const result=await worker.recognize(source);
   const candidate={text:(result?.data?.text||'').trim(),confidence:result?.data?.confidence||0,name};
   if(candidate.text.length>8&&(!best||candidate.confidence>best.confidence))best=candidate;
  }
  if(!best)throw Error('Nie wykryto czytelnego tekstu. Spróbuj zrobić zdjęcie na wprost, bez odblasków.');
  // Nie nadpisuj bez pytania tekstu, który mama już ręcznie poprawiła.
  if(page.text?.trim()&&!confirm('Na tej stronie jest już zapisany tekst. Zastąpić go nowym odczytem?')){
   ocrStatus('Zachowano poprzedni tekst.');return page.text;
  }
  page.text=best.text;await save();
  ocrStatus('Odczytano tekst (pewność OCR: '+Math.round(best.confidence)+'%). Sprawdź wynik przed użyciem.');
  return best.text;
 }catch(err){ocrStatus('Błąd: '+err.message);throw err;}
 finally{if(worker)await worker.terminate().catch(()=>{});ocrBusy=false;document.querySelectorAll('[data-action="page:ocr"],[data-action="reader:ocr"]').forEach(b=>b.disabled=false);}
}

async function recognizePageAI(page,language='pol'){
 if(ocrBusy)throw Error('Inne rozpoznawanie już trwa.');
 ocrBusy=true;
 try{
  ocrStatus('Przygotowuję zdjęcie do analizy AI…');
  const blob=await get('image:'+page.imageId);
  if(!blob)throw Error('Nie znaleziono zdjęcia strony.');
  if(blob.size>7*1024*1024)throw Error('Zdjęcie jest za duże (maksymalnie 7 MB).');
  const b64=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(String(r.result).split(',')[1]);r.onerror=()=>reject(Error('Nie udało się odczytać zdjęcia.'));r.readAsDataURL(blob)});
  ocrStatus('AI czyta stronę. To może potrwać kilkanaście sekund…');
  const response=await fetch('https://akademia-ai.niedzialkowskamagdalena02.workers.dev/ocr-ai',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({image:b64,mimeType:blob.type||'image/jpeg',language:language==='eng'?'angielski':'polski'})});
  let result;try{result=await response.json()}catch{throw Error('Serwer nie zwrócił poprawnej odpowiedzi. Sprawdź wdrożenie Netlify Functions.')}
  if(!response.ok)throw Error(result.error||'Błąd usługi AI: '+response.status);
  const text=String(result.text||'').trim();if(!text)throw Error('AI nie znalazło czytelnego tekstu na zdjęciu.');
  if(page.text?.trim()&&!confirm('Na stronie jest już tekst. Czy zastąpić go wynikiem AI?')){ocrStatus('Zachowano dotychczasowy tekst.');return}
  page.text=text;await save();ocrStatus('AI odczytało tekst. Sprawdź go przed zapisaniem i użyciem w ćwiczeniach.');return text;
 }catch(err){ocrStatus('Błąd AI: '+err.message);throw err}
 finally{ocrBusy=false;document.querySelectorAll('[data-action="page:ai"],[data-action="reader:ai"]').forEach(b=>b.disabled=false)}
}
const grant=async(child,points,reason,key)=>{if(data.history.some(h=>h.key===key))return false;data.profiles[child].xp+=points;data.profiles[child].coins+=points;data.history.unshift({id:uid(),key,child,points,reason,at:new Date().toISOString()});await save();return true};
function layout(title,content){app.innerHTML=`<main class="wrap"><header class="head"><div><div class="brand">⚡ AKADEMIA SUPERBOHATERÓW</div><div class="sub">${e(title)}</div></div>${role?button(testMode?'← Zakończ test':'← Profile','exit','alt'):''}</header>${testMode?'<div class="test-banner">🧪 TRYB MAMY — BEZPŁATNY TEST • POSTĘPY NIE SĄ ZAPISYWANE</div>':''}${content}</main>${role==='child'?'<button class="mic" data-action="mic" aria-label="Sterowanie głosowe">🎙️</button>':''}`;document.querySelectorAll('[data-speak]').forEach(b=>b.addEventListener('click',()=>speak(b.dataset.speak,b.dataset.lang,role==='child'?profile().mentor:'tech',data.settings.rate||1)));hydrateImages()}
async function hydrateImages(){for(const el of document.querySelectorAll('[data-image]')){const src=await img(el.dataset.image);if(el.isConnected&&src){el.src=src;el.onload=()=>URL.revokeObjectURL(src)}}}
function nav(){return role==='admin'?`<div class="tabs">${[['home','Przegląd'],['books','📚 Książki'],['missions','📋 Misje'],['settings','⚙️ Ustawienia'],['test','🧪 Testuj wszystko'],['backup','💾 Kopia']].map(([k,n])=>button(n,'admin:'+k,adminTab===k?'gold':'alt')).join('')}</div>`:`<div class="tabs">${[['home','🎯 Misje'],['books','📚 Książki'],['learn','🧠 Trening'],['academy','📖 Sala odkrywców'],['mentor','🤖 Mentor'],['base','🏙️ Baza Avengersów i gry']].map(([k,n])=>button(n,'child:'+k,tab===k?'gold':'alt')).join('')}</div>`}
function render(){if(tab!=='arcade')stopArcade();if(!role){layout('Wybierz swoją bazę',`<section class="card"><h1>Witaj w Akademii! 🛡️</h1><p>Każdy bohater ma własne misje i nagrody.</p></section><div class="grid">${people.map(([id,name])=>`<button class="tile" data-action="enter:${id}"><img class="profile-hero" src="assets/art/${data.profiles[id].hero||(id==='pawel'?'iron':'spider')}.svg" alt=""><h2>${name}</h2><small>${gradeName(data.profiles[id].grade)} · ${data.profiles[id].coins} złotych</small></button>`).join('')}</div><section class="card">${button('🔐 Centrum dowodzenia mamy','enter:admin','gold')}<p class="muted">Tryb lokalny: dane z tego telefonu nie synchronizują się jeszcze z innymi urządzeniami. ${syncAdapter.status()}</p></section>`);return}if(role==='admin')adminRender();else childRender()}
const DEFAULT_SUBJECTS=['Polski','Matematyka','Angielski','Przyroda','Plastyka','Muzyka','Informatyka','Wychowanie fizyczne','Etyka','Religia','Przedszkole'];
function subjectChecks(id){const current=data.profiles[id].subjects||[],items=[...new Set([...DEFAULT_SUBJECTS,...current])];return `<label>Przedmioty — zaznacz właściwe</label><div class="subject-list">${items.map(x=>`<label class="subject-chip"><input type="checkbox" data-subject-for="${id}" value="${e(x)}" ${current.includes(x)?'checked':''}> ${e(x)}</label>`).join('')}</div>`}
const VOCAB_ASSETS={apple:'apple',cat:'cat',dog:'dog',house:'house',book:'book',sun:'sun',tree:'tree',car:'car',bird:'bird',fish:'fish',ball:'ball',milk:'milk',school:'school',water:'water',flower:'flower'};
function vocabArt(word){const k=VOCAB_ASSETS[String(word||'').toLowerCase()];return k?`<img src="assets/art/vocab-${k}.svg" alt="Ilustracja: ${e(word)}">`:`<div class="vocab-fallback">${e(word)}</div>`}
const HEROES=[['iron','Iron Man','🦾','tech'],['spider','Spider-Man','🕷️','fun'],['hulk','Hulk','💚','fun'],['captain','Kapitan Ameryka','🛡️','tech'],['thor','Thor','⚡','fun'],['widow','Czarna Wdowa','🥷','tech'],['panther','Czarna Pantera','🐈‍⬛','tech'],['hawkeye','Hawkeye','🏹','tech'],['groot','Groot','🌳','fun'],['gamora','Gamora','⚔️','tech']];
function hero(id){return HEROES.find(x=>x[0]===id)||HEROES[0]}
function heroPicker(id){const current=data.profiles[id].hero||(id==='pawel'?'iron':'spider');return `<div class="hero-picker">${HEROES.map(([key,name,emoji])=>`<button class="hero-choice ${key===current?'chosen':''}" data-action="hero:set:${id}:${key}"><img class="hero-thumb" src="assets/art/${key}.svg" alt=""><b>${name}</b>${key===current?'<small>✓ Wybrany</small>':''}</button>`).join('')}</div>`}
const MENTOR_LINES={fun:{yes:['Spider-Man: Brawo! Pajęczy zmysł aż zatańczył!','Spider-Man: Oho! Mamy geniusza. Czy ktoś widział moje skarpetki?','Spider-Man: Świetnie! Nawet wisząc głową w dół, nie zrobiłbym tego lepiej!'],no:['Spider-Man: Ups! Sieć się trochę poplątała. Jeszcze raz!','Spider-Man: Mała wpadka! Nawet superbohater czasem ląduje w koszu na pranie.']},tech:{yes:['Iron Man: Analiza zakończona. Wynik: imponujący.','Iron Man: JARVIS, zapisz: młody geniusz na pokładzie.','Iron Man: Precyzja godna mojego laboratorium. Zatwierdzam!'],no:['Iron Man: Wykryto drobną usterkę w obliczeniach. Poprawiamy.','Iron Man: Prototyp odpowiedzi wymaga aktualizacji. Spróbuj ponownie.']}};
let mentorCounter=0;
function mentorLine(p,ok){const set=MENTOR_LINES[p.mentor==='fun'?'fun':'tech'][ok?'yes':'no'];return set[(mentorCounter++)%set.length]}

function adminRender(){let html=nav();if(adminTab==='home'){let pending=data.missions.filter(m=>m.status==='sent');html+=`<section class="card"><h2>Do sprawdzenia: ${pending.length}</h2>${pending.map(m=>missionCard(m,true)).join('')||'<p>Brak zgłoszeń.</p>'}</section><div class="grid">${people.map(([id,name])=>`<div class="card"><h3>${name}</h3><strong>⭐ ${data.profiles[id].coins} złotych</strong><p>${gradeName(data.profiles[id].grade)}</p></div>`).join('')}</div><p class="muted">Zdalne zgłoszenia wymagają późniejszego uruchomienia synchronizacji i logowania serwerowego.</p>`}
if(adminTab==='books')html+=`<section class="card"><h2>Dodaj podręcznik</h2>${select('bchild','Dziecko',people,'pawel')}${select('bgrade','Klasa',grades,'2')}${input('bsubject','Przedmiot','Polski')}${input('btitle','Tytuł')}${input('bpart','Część / tom')}${input('byear','Rok wydania')}${button('➕ Utwórz książkę','book:add','gold')}</section><section class="card"><h2>Biblioteka</h2>${data.books.map(b=>`<div class="item"><div><b>${e(b.title)}</b><small>${e(b.subject)} · ${e(data.profiles[b.child].name)} · ${gradeName(b.grade)} · ${dataPageCount(b.id)} stron</small></div>${button('Otwórz','book:open:'+b.id)}</div>`).join('')||'Brak książek'}</section>`;
if(adminTab==='book') {const b=data.books.find(b=>b.id===bookId);if(!b){adminTab='books';return render()}html+=`<section class="card">${button('← Biblioteka','admin:books')}<h2>${e(b.title)}</h2><h3>Edytuj dane książki</h3>${select('bchild','Dziecko',people,b.child)}${select('bgrade','Klasa',grades,b.grade)}${input('bsubject','Przedmiot',b.subject)}${input('btitle','Tytuł',b.title)}${input('bpart','Część / tom',b.part)}${input('byear','Rok',b.year)}${button('💾 Zapisz zmiany','book:save','gold')} ${button(b.archived?'Przywróć z archiwum':'Archiwizuj','book:archive')}<h3>Dodaj wiele stron naraz</h3>${input('start','Numer pierwszej strony',String((Math.max(0,...data.bookPages.filter(p=>p.bookId===bookId).map(p=>p.number))+1)),'number')}<label>Zdjęcia z galerii (można wybrać wiele)</label><input id="pagefiles" type="file" accept="image/*" multiple><button data-action="page:upload">📥 Dodaj zdjęcia</button><label>Lub zrób zdjęcie aparatem</label><input id="pagecamera" type="file" accept="image/*" capture="environment"><button data-action="page:camera" class="alt">📷 Dodaj z aparatu</button></section><section class="card"><h2>Strony</h2>${data.bookPages.filter(p=>p.bookId===bookId).sort((a,b)=>a.number-b.number).map(p=>`<div class="item"><img class="thumb" data-image="${p.imageId}" alt="Miniatura strony"><div>Strona ${p.number}<small>${p.text?'Tekst zapisany':'Brak tekstu — otwórz i użyj OCR'}</small></div>${button('Edytuj','page:open:'+p.id)}</div>`).join('')||'Nie dodano zdjęć.'}</section>`}
if(adminTab==='page'){const p=data.bookPages.find(p=>p.id===pageId);if(!p){adminTab='book';return render()}html+=`<section class="card">${button('← Strony','admin:book')}<h2>Strona ${p.number}</h2><img class="pagephoto" data-image="${p.imageId}" alt="Strona podręcznika">${input('pnum','Numer strony',p.number,'number')}<label for="ocrlang">Język tekstu na stronie</label><select id="ocrlang"><option value="pol">Polski</option><option value="eng">Angielski</option></select><p id="ocrstatus" class="guide" role="status" hidden></p><label>Rozpoznany tekst (można poprawić)</label><textarea id="ptext">${e(p.text||'')}</textarea><div class="row">${button('💾 Zapisz','page:save','gold')}${button('🔎 Rozpoznaj tekst','page:ocr')}${button('✨ Odczytaj przez AI','page:ai','gold')}${speakBtn(p.text||'Nie ma jeszcze rozpoznanego tekstu')}</div><label>Zastąp zdjęcie tej strony</label><input type="file" accept="image/*" id="replacefile"><button class="alt" data-action="page:replace">Zamień zdjęcie</button>${button('Usuń stronę','page:delete','line')}<p class="muted">Kliknij „Rozpoznaj tekst”. Pierwsze uruchomienie pobiera silnik i język z internetu. Po odczycie popraw ewentualne błędy i zapisz stronę.</p></section>`}
if(adminTab==='missions')html+=`<section class="card"><h2>Nowa misja</h2>${select('mchild','Dla kogo',people,'pawel')}${select('mtype','Rodzaj',[['homework','🎒 Misja szkolna'],['chore','🏠 Misja domowa'],['test','🚨 Sprawdzian / ważny termin']],'homework')}${input('mtitle','Opis / zadania')}${input('msubject','Przedmiot / kategoria','Polski')}${select('mbook','Podręcznik (opcjonalnie)',[['','Bez książki'],...data.books.map(b=>[b.id,b.title])],'')}${input('mpage','Numer strony','', 'number')}${input('mdue','Termin','', 'date')}${select('mrepeat','Powtarzanie',[['none','Jednorazowo'],['daily','Codziennie'],['weekly','Co tydzień']],'none')}${input('mpoints','Pieniążki po zatwierdzeniu','20','number')}<label><input id="mphoto" type="checkbox" checked> Wymagaj zdjęcia wykonanej pracy</label><p class='muted'>Przy typie „Test / sprawdzian” wybierz przedmiot, podręcznik i stronę lub pozostaw książkę pustą, aby utworzyć test losowy z wybranego przedmiotu.</p>${button('➕ Dodaj misję','mission:add','gold')}</section><section class="card"><h2>Wszystkie misje</h2>${data.missions.slice().reverse().map(m=>missionCard(m,true)).join('')||'Brak misji.'}</section>`;
if(adminTab==='settings')html+=`<section class="card"><h2>Profile i poziomy</h2><h3>🧪 Podgląd całej Bazy Avengersów</h3><p>Tryb testowy pokazuje wszystkie piętra i wyposażenie, bez kupowania i bez zmiany postępów dzieci.</p>${button('🏙️ Zobacz całą bazę — podgląd','admin:preview','gold')}${people.map(([id,name])=>`<div class="item"><h3>${name}</h3></div>${select('grade_'+id,'Etap edukacji',grades,data.profiles[id].grade)}${subjectChecks(id)}${input('newsubject_'+id,'Dodaj nowy przedmiot (opcjonalnie)')}${input('pin_'+id,'PIN profilu (opcjonalny)',data.profiles[id].pin,'password')}<h4>Wybierz bohatera</h4>${heroPicker(id)}${button('Zapisz '+name,'profile:save:'+id)}</section><section class="card">`).join('')}<h2>PIN mamy</h2>${input('parentpin','Nowy PIN (min. 4 cyfry)','','password')}${button('Zmień PIN','pin:change')}<h3>Nagrody za trening</h3>${input('xpPractice','XP za poprawne ćwiczenie',data.settings.xpPractice,'number')}${input('dailyLimit','Dzienny limit nagród',data.settings.dailyPracticeLimit,'number')}${input('rate','Tempo czytania',data.settings.rate||1,'number')}${button('Zapisz ustawienia','settings:save')}<h3>Muzyczne nagrody</h3>${input('songtitle','Nazwa piosenki')}${input('songurl','Link YouTube')}<label for="songlyrics">Tekst piosenki (wklej lub wpisz)</label><textarea id="songlyrics" rows="8" placeholder="Każdy wers w osobnej linii"></textarea>${select('songchild','Misja dla',people,'pawel')}${button('🎵 Zapisz piosenkę i utwórz misję','song:add','gold')}<p>${data.settings.songs.map((s,i)=>`${e(s.title)} ${button('Usuń','song:delete:'+i,'line')}`).join('<br>')}</p><p class="muted">PIN-y chronią tylko przed przypadkowym wejściem. Pełne uprawnienia wymagają kont serwerowych.</p></section>`;
if(adminTab==='test')html+=`<section class="card"><h2>🧪 Centrum testów mamy</h2><p>Uruchom dowolny profil w trybie testowym. Wszystkie gry, pomieszczenia, bohaterowie i przedmioty są odblokowane. Nic nie kosztuje złotych i żadne zmiany nie zostaną zapisane.</p><div class="grid">${people.map(([id,name])=>button('🎮 Testuj jako '+name,'test:enter:'+id,'gold')).join('')}</div><p class="muted">Po zakończeniu wybierz „Zakończ test”. Dane dzieci pozostaną takie jak przed testem.</p></section>`;
if(adminTab==='preview')html+=`<section class='card'>${button('← Wróć do ustawień','admin:settings')}<h2>🧪 Pełna Baza Avengersów — tryb testowy</h2><p class='muted'>Ten podgląd nie wydaje złotych ani nie odblokowuje elementów na stałe.</p>${baseMarkup({...data.profiles.pawel,coins:9999,base:{version:1,owned:BASE_ITEMS.map(x=>x.id)}},button,true)}</section>`;if(adminTab==='backup')html+=`<section class="card"><h2>Pełna kopia danych</h2><p>Eksport obejmuje zdjęcia stron, zdjęcia prac, profile, XP i misje. Przy dużej bibliotece plik będzie duży.</p>${button('⬇️ Pobierz kopię JSON','backup:export','gold')}<label>Przywróć kopię JSON</label><input type="file" id="backupfile" accept=".json,application/json">${button('Przywróć kopię','backup:import')}<p class="muted">Nie odinstalowuj aplikacji ani nie czyść danych witryny bez kopii. Synchronizacja między telefonami jeszcze nie jest aktywna.</p></section>`;
layout('Centrum dowodzenia mamy',html)}
function dataPageCount(id){return data.bookPages.filter(p=>p.bookId===id).length}

function youtubeId(url){
 try{const u=new URL(url);const h=u.hostname.replace(/^www\./,'');
  let id=h==='youtu.be'?u.pathname.slice(1):(['youtube.com','m.youtube.com','youtube-nocookie.com'].includes(h)?(u.searchParams.get('v')||u.pathname.match(/\/(?:embed|shorts|live)\/([\w-]+)/)?.[1]):'');
  return /^[A-Za-z0-9_-]{11}$/.test(id||'')?id:null;
 }catch{return null}
}
function songScreen(song,mission){
 const id=youtubeId(song.url);
 const lyrics=String(song.lyrics||'').split(/\r?\n/).filter(x=>x.trim());
 return `<section class="card song-stage">${button('← Wróć do misji','child:home')}<h2>🎵 ${e(song.title)}</h2><p>Posłuchaj i śpiewaj razem z tekstem!</p>
 ${id?`<div class="song-video"><iframe title="Piosenka ${e(song.title)}" src="https://www.youtube-nocookie.com/embed/${id}" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy" referrerpolicy="strict-origin-when-cross-origin"></iframe></div>`:'<p>Nieprawidłowy adres YouTube.</p>'}
 <h3>🎤 Tekst piosenki</h3><div class="song-lyrics">${lyrics.map((line,i)=>`<button class="song-line" data-action="song:line:${i}">${e(line)}</button>`).join('')||'<p>Mama nie dodała jeszcze tekstu piosenki.</p>'}</div>
 <p class="muted">Dotknij wersu, aby go wyróżnić. Tekst nie przewija się automatycznie w rytm filmu.</p>
 ${mission?button('📸 Zgłoś wykonanie misji','mission:submit:'+mission.id,'gold'):''}</section>`;
}
function missionGroup(m){return m.type==='test'?'test':m.type==='chore'?'home':m.type==='song'?'home':'school'}
function missionDue(m){if(!m.due)return '';const d=new Date(m.due+'T12:00:00'),today=new Date();today.setHours(12,0,0,0);const days=Math.round((d-today)/86400000);const label=days<0?'PO TERMINIE':days===0?'DZISIAJ':days===1?'JUTRO':days<=3?'ZA '+days+' DNI':'DO '+d.toLocaleDateString('pl-PL',{day:'numeric',month:'long'});return `<div class="mission-deadline ${days<0?'late':days<=1?'urgent':''}">⏰ ${label}</div>`}
function missionBoard(child){const all=data.missions.filter(m=>m.child===child&&m.status!=='approved'&&m.status!=='school');const groups=[['test','🚨 ALERTY BOHATERA','Sprawdziany i ważne terminy'],['school','🎒 MISJE SZKOLNE','Prace domowe i zadania do szkoły'],['home','🏠 MISJE DOMOWE','Obowiązki, piosenki i wyzwania w domu']];const sorted=arr=>arr.slice().sort((a,b)=>(a.due||'9999').localeCompare(b.due||'9999'));return `<div class="mission-dashboard">${groups.map(([key,title,desc])=>{const ms=sorted(all.filter(m=>missionGroup(m)===key));return `<section class="mission-zone zone-${key}"><h3>${title} <span class="mission-count">${ms.length}</span></h3><p>${desc}</p>${ms.map(m=>missionCard(m,false)).join('')||'<p class="mission-empty">✨ Wszystko zrobione!</p>'}</section>`}).join('')}</div>`}
function missionCard(m,admin){let status={todo:'Do zrobienia',sent:'Czeka na mamę',redo:'Do poprawy',approved:'Zatwierdzone',school:'Odrobione w szkole'}[m.status]||m.status;return `<div class="mission"><div class="row between"><b>${e(m.title)}</b><span class="pill">${status}</span></div>${missionDue(m)}<small>${e(data.profiles[m.child].name)} · ${e(m.subject)} · ${m.points} złotych ${m.page?'· str. '+m.page:''}</small>${m.type==='song'&&!admin?button('🎵 Otwórz piosenkę i tekst','song:open:'+m.id,'gold'):''}${m.type==='test'&&!admin&&m.status==='todo'?button('📝 Rozpocznij sprawdzian','test:start:'+m.id,'gold'):''}${m.comment?`<p>💬 ${e(m.comment)} ${speakBtn(m.comment)}</p>`:''}${m.photoId?`<img class="pagephoto" data-image="${m.photoId}" alt="Zdjęcie wykonanej pracy">`:''}<div class="row">${admin?`${m.status==='sent'?button('✓ Zatwierdź','mission:approve:'+m.id,'gold')+button('↩ Do poprawy','mission:reject:'+m.id):''}${m.status==='todo'?button('✓ Odrobione w szkole','mission:school:'+m.id):''}${button('Usuń','mission:delete:'+m.id,'line')}`:m.status==='todo'||m.status==='redo'?button('📸 Zgłoś wykonanie','mission:submit:'+m.id,'gold'):' '}</div></div>`}
let lessonIndex=0,academySubject='',arcadeId='snake';
const ARCADE_GAMES=[{id:'snake',title:'Kosmiczny Wąż',icon:'🐍',cost:20,desc:'Zbieraj gwiazdki, omijaj ściany i własny ogon.'},{id:'blocks',title:'Wieża Klocków',icon:'🧱',cost:30,desc:'Układaj spadające klocki i zapełniaj rzędy.'}];
const LESSONS=[
{icon:'🕵️',title:'Rzeczownik',subtitle:'Kto? Co?',story:'Spider-Man szuka sprawcy zamieszania! Widzi kota, rower i szkołę. Wszystkie te nazwy to rzeczowniki.',rule:'Rzeczownik nazywa osoby, zwierzęta, rośliny, rzeczy i miejsca. Odpowiada na pytania: kto? co?',examples:'kto? lekarz, kot; co? drzewo, książka',question:'Który wyraz jest rzeczownikiem?',answers:['skacze','kot','zielony'],correct:1,why:'Kot to nazwa zwierzęcia.'},
{icon:'🎨',title:'Przymiotnik',subtitle:'Jaki? Jaka? Jakie?',story:'Iron Man opisuje nową zbroję: czerwona, błyszcząca, szybka. Tak działają przymiotniki!',rule:'Przymiotnik opisuje cechy i odpowiada na pytania: jaki? jaka? jakie?',examples:'czerwony hełm, szybki pojazd, miła osoba',question:'Który wyraz jest przymiotnikiem?',answers:['biegnie','zielony','dom'],correct:1,why:'Zielony opisuje cechę, czyli kolor.'},
{icon:'🏃',title:'Czasownik',subtitle:'Co robi? Co się dzieje?',story:'Thor podnosi młot, Spider-Man skacze, a Groot rośnie. Każda z tych czynności ma własną nazwę.',rule:'Czasownik mówi o czynności lub stanie. Pytamy: co robi? co się z nim dzieje?',examples:'czyta, śpi, skacze, rośnie',question:'Który wyraz jest czasownikiem?',answers:['skacze','zbroja','niebieski'],correct:0,why:'Skacze oznacza czynność.'},
{icon:'✍️',title:'Ó czy U?',subtitle:'Ortografia bez strachu',story:'Groot znalazł słowo „góra”. Kiedy zmienisz je na „górka”, nadal słyszysz ó. Ale uwaga: nie każde ó da się tak wyjaśnić!',rule:'Ó często piszemy, gdy wymienia się na o, e lub a, np. stół — stoły. Wiele wyrazów trzeba też zapamiętać.',examples:'stół — stoły, wóz — wozy; ulica piszemy przez u',question:'Który zapis jest poprawny?',answers:['gura','góra','góra przez u'],correct:1,why:'Poprawnie piszemy „góra” przez ó.'},
{icon:'🐝',title:'RZ czy Ż?',subtitle:'Zasady pisowni',story:'Gamora sprawdza tajną wiadomość: „morze”. Iron Man podpowiada: morze — morski! Tak łatwiej zapamiętać rz.',rule:'Rz często wymienia się na r, np. morze — morski. Ż może wymieniać się na g, z, dz, h lub ź, np. książka — księga.',examples:'morze — morski, książka — księga',question:'Jak zapiszesz miejsce pełne fal?',answers:['może','morze','możeż'],correct:1,why:'Morze piszemy przez rz. „Może” oznacza coś innego.'},
{icon:'🧮',title:'Dodawanie',subtitle:'Łączymy siły',story:'Do bazy przyleciały 4 roboty, a później jeszcze 3. Ile robotów pomaga teraz Iron Manowi?',rule:'Dodawanie łączy liczby w jedną większą całość. Możesz liczyć na palcach, klockach albo osi liczbowej.',examples:'4 + 3 = 7, 10 + 5 = 15',question:'Ile wynosi 8 + 5?',answers:['12','13','14'],correct:1,why:'8 + 2 = 10, a potem jeszcze 3, czyli 13.'},
{icon:'➖',title:'Odejmowanie',subtitle:'Co zostało?',story:'Spider-Man miał 12 zapasowych pojemników z siecią. Zużył 5 podczas treningu.',rule:'Odejmowanie oznacza zabieranie części lub szukanie różnicy między liczbami.',examples:'12 − 5 = 7, 9 − 4 = 5',question:'Ile wynosi 14 − 6?',answers:['7','8','9'],correct:1,why:'14 − 4 = 10 i jeszcze − 2 = 8.'},
{icon:'✖️',title:'Mnożenie',subtitle:'Równe grupy',story:'W hangarze stoją 3 rzędy po 4 pojazdy. Nie trzeba liczyć każdego z osobna!',rule:'Mnożenie to szybki sposób dodawania równych grup. 3 × 4 to trzy grupy po cztery.',examples:'3 × 4 = 12, bo 4 + 4 + 4 = 12',question:'Ile wynosi 5 × 3?',answers:['8','15','20'],correct:1,why:'3 + 3 + 3 + 3 + 3 = 15.'},
{icon:'🍕',title:'Ułamki',subtitle:'Dzielimy sprawiedliwie',story:'Hulk i Thor dzielą pizzę na cztery równe kawałki. Jeden kawałek to jedna czwarta pizzy.',rule:'Ułamek opisuje część całości podzielonej na równe części. 1/4 to jedna z czterech równych części.',examples:'1/2 to połowa, 1/4 to ćwiartka',question:'Jak zapisać połowę?',answers:['1/2','1/3','2/1'],correct:0,why:'Jedna z dwóch równych części to 1/2.'},
{icon:'👋',subject:'english',title:'Powitania',subtitle:'Hello! Good morning!',story:'Spider-Man spotyka nowego kolegę i mówi: Hello! A rano Iron Man wita wszystkich: Good morning!',rule:'Hello to cześć. Good morning to dzień dobry rano. Goodbye to do widzenia.',examples:'Hello! — Cześć!; Good morning! — Dzień dobry!; Goodbye! — Do widzenia!',question:'Jak powiedzieć po angielsku „cześć”?',answers:['Goodbye','Hello','Thank you'],correct:1,why:'Hello oznacza cześć.'},
{icon:'🐶',subject:'english',title:'Zwierzęta',subtitle:'Cat, dog, bird',story:'Groot spotkał kota, psa i ptaka. Gamora uczy go ich angielskich nazw.',rule:'Cat to kot, dog to pies, bird to ptak, fish to ryba.',examples:'cat — kot; dog — pies; bird — ptak; fish — ryba',question:'Co znaczy dog?',answers:['pies','kot','ryba'],correct:0,why:'Dog to pies.'},
{icon:'🎨',subject:'english',title:'Kolory',subtitle:'Red, blue, green',story:'Iron Man pokazuje czerwony pancerz, a Hulk jest zielony. Nauczmy się nazywać te kolory!',rule:'Red to czerwony, blue to niebieski, green to zielony, yellow to żółty.',examples:'red — czerwony; blue — niebieski; green — zielony; yellow — żółty',question:'Jak powiedzieć „zielony”?',answers:['red','yellow','green'],correct:2,why:'Green to zielony.'},
{icon:'🔢',subject:'english',title:'Liczby 1–10',subtitle:'One, two, three',story:'Thor liczy młoty: one, two, three! Czy potrafisz policzyć do dziesięciu?',rule:'One 1, two 2, three 3, four 4, five 5, six 6, seven 7, eight 8, nine 9, ten 10.',examples:'one — jeden; two — dwa; three — trzy; ten — dziesięć',question:'Co znaczy three?',answers:['dwa','trzy','cztery'],correct:1,why:'Three to trzy.'},
{icon:'📐',title:'Figury geometryczne',subtitle:'Tajemnice kształtów',story:'Kapitan Ameryka ogląda tarczę: jest okrągła. Iron Man projektuje kwadratowe panele w laboratorium.',rule:'Kwadrat ma cztery równe boki. Prostokąt ma cztery kąty proste. Trójkąt ma trzy boki.',examples:'okno — prostokąt, znak ostrzegawczy — trójkąt',question:'Ile boków ma trójkąt?',answers:['3','4','5'],correct:0,why:'Trójkąt ma trzy boki.'}
];
// V30: interaktywne gry tematyczne w Sali Odkrywców
const DISCOVERY_PAIRS={
 0:[['kot','rzeczownik'],['czyta','czasownik'],['zielony','przymiotnik'],['szkoła','rzeczownik']],
 1:[['szybki','przymiotnik'],['rower','rzeczownik'],['skacze','czasownik'],['miła','przymiotnik']],
 2:[['biegnie','czasownik'],['książka','rzeczownik'],['czerwony','przymiotnik'],['śpiewa','czasownik']],
 3:[['stół','ó'],['ulica','u'],['góra','ó'],['buty','u']],
 4:[['morze','rz'],['żaba','ż'],['rzeka','rz'],['książka','ż']],
 5:[['4 + 3','7'],['5 + 2','7'],['6 + 4','10'],['8 + 5','13']],
 6:[['9 − 4','5'],['12 − 5','7'],['14 − 6','8'],['10 − 3','7']],
 7:[['3 × 4','12'],['5 × 3','15'],['2 × 6','12'],['4 × 4','16']],
 8:[['połowa','1/2'],['ćwiartka','1/4'],['trzy czwarte','3/4'],['jedna trzecia','1/3']],
 9:[['hello','cześć'],['goodbye','do widzenia'],['good morning','dzień dobry'],['thank you','dziękuję']],
 10:[['dog','pies'],['cat','kot'],['bird','ptak'],['fish','ryba']],
 11:[['red','czerwony'],['blue','niebieski'],['green','zielony'],['yellow','żółty']],
 12:[['one','1'],['two','2'],['three','3'],['five','5']],
 13:[['trójkąt','3 boki'],['kwadrat','4 równe boki'],['prostokąt','4 kąty proste'],['koło','brak boków']]
};
let discoveryGame=null;
function discoveryShuffle(a){return [...a].sort(()=>Math.random()-.5)}
function discoveryStart(mode){
 const pairs=DISCOVERY_PAIRS[lessonIndex]||[];
 if(!pairs.length)return;
 const items=discoveryShuffle(pairs).slice(0,mode==='match'?4:3);
 discoveryGame={mode,items,index:0,score:0,selected:null,done:[],finished:false};
 discoveryDraw();
}
function discoveryDraw(){
 const g=discoveryGame,el=$('discovery-game');if(!el||!g)return;
 const lang=LESSONS[lessonIndex]?.subject==='english'?'en-US':'pl-PL';
 if(g.finished){el.innerHTML=`<div class="discovery-result"><span>🏆</span><h3>Misja zakończona!</h3><p>Wynik: ${g.score} / ${g.items.length}</p>${button('🔄 Zagraj ponownie','discovery:restart','gold')} ${button('📖 Inny temat','child:academy')}</div>`;return}
 if(g.mode==='match'){
  const options=discoveryShuffle(g.items.map((x,i)=>({value:x[1],idx:i}))).map((x,i)=>`<button data-action="discovery:match:${x.idx}" ${g.done.includes(x.idx)?'disabled':''}>${e(x.value)}</button>`).join('');
  const current=g.items[g.index];
  el.innerHTML=`<div class="discovery-game"><span class="discovery-pill">🔗 ŁĄCZ W PARY</span><div class="discovery-count">${g.index+1}/${g.items.length}</div><p>Dopasuj odpowiedź do:</p><div class="discovery-prompt">${e(current[0])} ${speakBtn(current[0],lang)}</div><div class="discovery-options">${options}</div><p class="discovery-feedback" id="discovery-feedback" role="status"></p></div>`;
 }else{
  const current=g.items[g.index],answers=discoveryShuffle([current[1],...discoveryShuffle([...new Set((DISCOVERY_PAIRS[lessonIndex]||[]).map(x=>x[1]).filter(x=>x!==current[1]))]).slice(0,2)]);
  el.innerHTML=`<div class="discovery-game"><span class="discovery-pill">⚡ SZYBKA MISJA</span><div class="discovery-count">${g.index+1}/${g.items.length}</div><p>Wybierz poprawną odpowiedź:</p><div class="discovery-prompt">${e(current[0])} ${speakBtn(current[0],lang)}</div><div class="discovery-options">${answers.map(x=>`<button data-action="discovery:quick" data-answer="${e(x)}">${e(x)}</button>`).join('')}</div><p class="discovery-feedback" id="discovery-feedback" role="status"></p></div>`;
 }
 el.querySelectorAll('[data-speak]').forEach(b=>b.addEventListener('click',ev=>{ev.stopPropagation();speak(b.dataset.speak,b.dataset.lang,profile().mentor)}));
}
function discoveryAnswer(value){
 const g=discoveryGame;if(!g||g.finished)return;
 const correct=g.items[g.index][1]===value,fb=$('discovery-feedback');
 if(!correct){if(fb)fb.textContent='💡 Spróbuj jeszcze raz! Poszukaj właściwej pary.';return}
 g.score++;g.done.push(g.index);g.index++;
 if(g.index>=g.items.length)g.finished=true;
 discoveryDraw();
}

// V36_AVENGERS_GAME
const avengersQuiz = [
 {q:'Ile to 7 + 5?',a:['10','12','14'],ok:1,hero:'iron'},
 {q:'Które słowo oznacza KOT?',a:['DOG','CAT','SUN'],ok:1,hero:'spider'},
 {q:'Ile to 9 × 3?',a:['18','27','36'],ok:1,hero:'thor'},
 {q:'Które słowo oznacza DOM?',a:['HOUSE','TREE','BOOK'],ok:0,hero:'iron'},
 {q:'Ile to 20 − 8?',a:['14','12','10'],ok:1,hero:'spider'},
 {q:'Które słowo oznacza WODA?',a:['MILK','APPLE','WATER'],ok:2,hero:'thor'}
];
let avengersRun=null;

function avengersPanel(){
 if(!avengersRun)return `<section class="avengers-v36">
  <h2>⚡ Wyzwanie Avengersów</h2>
  <p>Rozwiąż sześć zadań i zdobądź punkty!</p>
  <button data-action="av36:start">🚀 Rozpocznij misję</button>
 </section>`;
 const g=avengersRun;
 if(g.i>=g.items.length)return `<section class="avengers-v36">
  <h2>🏆 Misja ukończona!</h2>
  <p>Wynik: ${g.points} / ${g.items.length}</p>
  <button data-action="av36:start">🔁 Zagraj ponownie</button>
  <button data-action="av36:close">Wróć do treningu</button>
 </section>`;
 const q=g.items[g.i];
 return `<section class="avengers-v36">
  <div class="av36-top">⚡ MISJA AVENGERSÓW <span>⭐ ${g.points} pkt</span></div>
  <div class="av36-progress"><div style="width:${g.i/g.items.length*100}%"></div></div>
  <img class="av36-hero" src="assets/art/${q.hero}.svg" alt="Avenger">
  <p>Wyzwanie ${g.i+1} z ${g.items.length}</p>
  <h2>${e(q.q)} ${v37Voice(q.q)}</h2>
  <div class="av36-answers">${q.a.map((answer,i)=>`<div class="v37-answer">
 <button data-action="av36:answer:${i}" ${g.done?'disabled':''}>${e(answer)}</button>
 ${v37Voice(answer,q.lang||'pl-PL')}
 </div>`).join('')}</div>
  ${g.done?`<p class="av36-result">${g.good?'🎉 Brawo!':'💡 Poprawna odpowiedź: '+e(q.a[q.ok])}</p>
  <button data-action="av36:next">➡️ Dalej</button>`:''}
  <button class="av36-close" data-action="av36:close">✖ Zamknij</button>
 </section>`;
}


// V37_CHALLENGE_HUB
let v37Subject='all';
let v37Classic=false;

const v37Subjects=[
 ['all','🌌','Cała wiedza','Misja mieszana'],
 ['polski','📖','Polski','Słowa i zagadki'],
 ['matematyka','🔢','Matematyka','Liczby i logika'],
 ['angielski','🇬🇧','Angielski','Słówka i wymowa'],
 ['przyroda','🌿','Przyroda','Odkrywaj świat']
];

const v37Bank={
 polski:[
 ['Ile sylab ma słowo motyl?',['1','2','3'],1],
 ['Które słowo oznacza zwierzę?',['kot','dom','las'],0],
 ['Który wyraz jest poprawny?',['ksionszka','książka','ksionżka'],1],
 ['Które słowo jest czasownikiem?',['biega','zielony','szkoła'],0],
 ['Co jest przeciwieństwem słowa wysoki?',['niski','szeroki','długi'],0],
 ['Ile liter ma słowo las?',['2','3','4'],1]
 ],
 matematyka:[
 ['Ile to 7 + 5?',['10','12','14'],1],
 ['Ile to 20 - 8?',['14','12','10'],1],
 ['Ile to 9 razy 3?',['18','27','36'],1],
 ['Która liczba jest parzysta?',['7','11','12'],2],
 ['Ile boków ma trójkąt?',['3','4','5'],0],
 ['Ile to 6 razy 4?',['20','24','28'],1]
 ],
 angielski:[
 ['Co oznacza CAT?',['pies','kot','dom'],1],
 ['Co oznacza HOUSE?',['dom','drzewo','książka'],0],
 ['Co oznacza WATER?',['mleko','woda','słońce'],1],
 ['Co oznacza BOOK?',['szkoła','piłka','książka'],2],
 ['Co oznacza DOG?',['kot','pies','ptak'],1],
 ['Co oznacza SUN?',['słońce','księżyc','deszcz'],0]
 ],
 przyroda:[
 ['Na jakiej planecie żyjemy?',['Mars','Ziemia','Wenus'],1],
 ['Co zbiera pszczoła z kwiatów?',['Nektar','Piasek','Kamienie'],0],
 ['Czego potrzebuje roślina?',['Wody i światła','Plastiku','Ciemności'],0],
 ['Ile mamy pór roku?',['2','4','6'],1],
 ['Które zwierzę jest ssakiem?',['Żaba','Delfin','Motyl'],1],
 ['Co daje nam Słońce?',['Światło i ciepło','Śnieg','Piasek'],0]
 ]
};

function v37Questions(subject){
 const ids=subject==='all'
  ?Object.keys(v37Bank):[subject];
 let questions=ids.flatMap(id=>
  (v37Bank[id]||[]).map(q=>({
   q:q[0],a:q[1],ok:q[2],
   lang:id==='angielski'?'en-US':'pl-PL',
   hero:id==='angielski'?'spider':
        id==='matematyka'?'iron':
        id==='przyroda'?'groot':'captain'
  }))
 );
 for(let i=questions.length-1;i>0;i--){
  const j=Math.floor(Math.random()*(i+1));
  [questions[i],questions[j]]=[questions[j],questions[i]];
 }
 return questions.slice(0,6);
}

function v37Voice(text,lang='pl-PL'){
 return `<button type="button" class="v37-voice"
 data-action="v37:say:${lang}:${encodeURIComponent(text)}"
 aria-label="Odczytaj na głos">🔊</button>`;
}

function v37Hub(){
 const selected=v37Subjects.find(x=>x[0]===v37Subject)
   ||v37Subjects[0];
 return `<section class="v37-hub">
  <div class="v37-heading">
   <div class="v37-label">⚡ STREFA AVENGERSÓW</div>
   <h2>🚀 SALA WYZWAŃ</h2>
   <p>Wybierz portal i rozpocznij przygodę!</p>
   <img src="assets/art/${who==='patryk'?'spider':'iron'}.svg"
    alt="Bohater Avengersów" class="v37-hero">
  </div>
  <div class="v37-portals">
   ${v37Subjects.map(([id,icon,name,desc])=>`
    <button type="button"
     class="v37-portal v37-${id} ${v37Subject===id?'selected':''}"
     data-action="v37:subject:${id}"
     aria-pressed="${v37Subject===id}">
     <span class="v37-icon">${icon}</span>
     <b>${name}</b>
     <small>${desc}</small>
    </button>`).join('')}
  </div>
  <div class="v37-launch">
   <h3>${selected[1]} ${selected[2]}</h3>
   <p>6 wyzwań • Avengersi • punkty • głos</p>
   <button data-action="v37:play">⚡ START MISJI</button>
  </div>
  <button class="v37-classic" data-action="v37:classic">
   📚 Pozostałe ćwiczenia i podręczniki
  </button>
 </section>`;
}

function childRender(){const p=profile();let html=`<section class="card"><div class="row between"><div><h2>${p.name} ${hero(p.hero||(who==='pawel'?'iron':'spider'))[2]}</h2><small>${gradeName(p.grade)} · Baza poziom ${1+Math.floor(p.xp/100)}</small></div><b class="xp">🪙 ${p.coins} złotych</b></div><div class="progress"><div style="width:${p.xp%100}%"></div></div></section>`+nav();
if(tab==='song'){const mission=data.missions.find(m=>m.id===missionId);const song=data.settings.songs.find(x=>x.id===mission?.songId);html+=song?songScreen(song,mission):'<section class="card">Nie znaleziono piosenki.</section>'}
if(tab==='home')html+=`<section class="card"><h2>🎯 Twoje misje ${speakBtn('Twoje misje')}</h2>${missionBoard(who)}</section><section class="card"><h3>Ostatnie osiągnięcia</h3>${data.history.filter(h=>h.child===who).slice(0,5).map(h=>`<p>+${h.points} złotych · ${e(h.reason)}</p>`).join('')||'Jeszcze brak.'}</section>`;
if(tab==='books')html+=`<section class="card"><h2>📚 Moje podręczniki ${speakBtn('Moje podręczniki')}</h2>${books().filter(b=>!b.archived).map(b=>`<div class="item"><div><b>${e(b.title)}</b><small>${e(b.subject)} · ${gradeName(b.grade)}</small></div>${button('Otwórz','reader:'+b.id)}</div>`).join('')||'Mama jeszcze nie dodała książek.'}</section>`;
if(tab==='reader'){let b=data.books.find(b=>b.id===bookId),ps=data.bookPages.filter(p=>p.bookId===bookId).sort((a,b)=>a.number-b.number);let pg=data.bookPages.find(p=>p.id===pageId)||ps[0];html+=`<section class="card">${button('← Książki','child:books')}<h2>${e(b?.title||'Podręcznik')}</h2>${select('readerpage','Strona',ps.map(p=>[p.id,'Strona '+p.number]),pg?.id)}${pg?`<img class="pagephoto" data-image="${pg.imageId}" alt="Strona podręcznika"><p class="guide">${e(pg.text||'Tekst nie jest jeszcze rozpoznany. Możesz oglądać zdjęcie strony.')}</p>${speakBtn(pg.text||'Brak zapisanego tekstu')}<label for="ocrlang">Język strony</label><select id="ocrlang"><option value="pol">Polski</option><option value="eng">Angielski</option></select><p id="ocrstatus" class="guide" role="status" hidden></p>${button('🔎 Rozpoznaj tekst ze zdjęcia','reader:ocr','gold')}${button('✨ Odczytaj przez AI','reader:ai','gold')}<p class="muted">Rozpoznawanie wymaga internetu. Sprawdź poprawność tekstu przed odczytem.</p>`:'Brak stron.'}${input('tasks','Numery zadań, np. 1, 2, 3, 5')}${button('Dodaj do moich misji','homework:create','gold')}${button('🤖 Zapytaj mentora','child:mentor')}</section>`}
if(tab==='submission'){let m=data.missions.find(m=>m.id===missionId);html+=`<section class="card">${button('← Misje','child:home')}<h2>${e(m?.title)}</h2><p>Prześlij zdjęcie pracy. Mama sprawdzi ją przed przyznaniem punktów.</p><label>Galeria</label><input type="file" accept="image/*" id="workfile"><label>Aparat</label><input type="file" accept="image/*" capture="environment" id="workcamera"><label>Wiadomość do mamy</label><textarea id="workcomment"></textarea>${button('📤 Zgłoś wykonanie','mission:send','gold')}</section>`}
if(tab==='learn'&&v37Classic)html+=`<section class="card"><h2>🎓 Akademia wiedzy ${speakBtn('Trening bohatera')}</h2><div class="learning-banner"><span>📚</span><div><strong>Ucz się jak superbohater!</strong><small>Obrazki • słuchanie • quizy • sprawdziany</small></div><span>⭐</span></div><p>Ucz się także bez pracy domowej. Za poprawne zadania zdobywasz złote. Dzienny limit nagród chroni przed powtarzaniem najłatwiejszych ćwiczeń.</p>${speakBtn('Wybierz rodzaj treningu. Możesz ćwiczyć matematykę, czytanie, angielski, quizy, dyktanda i krzyżówki.')} ${select('trainingSubject','Wybierz przedmiot',trainingSubjects(), 'polski')}<div id="trainingKinds">${trainingKindSelect('polski')}</div><div class="learning-exercise" id="exercise"></div>${button('🔄 Nowe ćwiczenie','exercise:new')}</section><section class="card"><h3>🎵 Muzyczne nagrody</h3><p class="muted">Lista zaakceptowana przez mamę. Linki otwierają YouTube — rodzic powinien nadzorować korzystanie.</p>${data.settings.songs.map(s=>`<p><a href="${e(s.url)}" target="_blank" rel="noopener noreferrer">🎶 ${e(s.title)}</a></p>`).join('')}</section>`;
if(tab==='academy'){const subjects=[['polish','📖','Język polski','Gramatyka i ortografia'],['math','🧮','Matematyka','Liczby, działania i figury'],['english','🇬🇧','Język angielski','Słówka i podstawowe zwroty']];const belongs=(l,i)=>l.subject==='english'?'english':i<5?'polish':'math';const chosen=subjects.find(x=>x[0]===academySubject);html+=`<section class="card discovery-head"><h2>🚀 Sala Odkrywców</h2>${chosen?`${button('← Wybierz przedmiot','academy:subjects')}<h3>${chosen[1]} ${chosen[2]}</h3><p>${chosen[3]}. Wybierz zagadnienie, poznaj zasadę i rozwiąż miniwyzwanie.</p><div class="discovery-grid">${LESSONS.map((l,i)=>belongs(l,i)===academySubject?`<button class="discovery-tile" data-action="lesson:open:${i}"><span>${l.icon}</span><b>${l.title}</b><small>${l.subtitle}</small></button>`:'').join('')}</div>`:`<p>Wybierz przedmiot, a potem zagadnienie, którego chcesz się nauczyć.</p><div class="discovery-grid">${subjects.map(([id,icon,title,subtitle])=>`<button class="discovery-tile" data-action="academy:subject:${id}"><span>${icon}</span><b>${title}</b><small>${subtitle}</small></button>`).join('')}</div>`}</section>`;}
if(tab==='lesson'){const l=LESSONS[lessonIndex]||LESSONS[0];html+=`<section class="card lesson-card">${button('← Zagadnienia','child:academy')}<div class="lesson-art">${l.icon}</div><h2>${l.title}</h2><p class="lesson-story">${e(l.story)}</p><div class="lesson-rule"><strong>Zapamiętaj!</strong><p>${e(l.rule)}</p></div><p><strong>Przykłady:</strong> ${e(l.examples)}</p>${speakBtn(l.story+' '+l.rule+' Przykłady: '+l.examples)}<h3>🎯 Miniwyzwanie</h3><p>${e(l.question)} ${speakBtn(l.question)}</p><div class="discovery-grid">${l.answers.map((x,i)=>button(e(x),'lesson:answer:'+i)).join('')}</div><p id="lesson-feedback" role="status"></p><div class="discovery-playground"><h3>🎮 Zagraj i utrwal wiedzę!</h3><p>Wybierz grę. Każda runda ma inne pytania i kolorowe odpowiedzi.</p><div class="discovery-actions">${button('🔗 Dopasuj pary','discovery:start:match','gold')}${button('⚡ Szybka misja','discovery:start:quick','gold')}</div><div id="discovery-game"></div></div>${button('🔄 Inny temat','child:academy')}</section>`}
if(tab==='mentor')html+=`<section class="card mentor-room"><div class="mentor-header"><span class="mentor-tag">⚡ STREFA MENTORA</span><h2>Spotkaj swojego supermentora!</h2><p>Wybierz bohatera i zobacz jego supermoc.</p></div><div class="mentor-choices"><button type="button" class="mentor-choice ${p.mentor==='tech'?'selected':''}" data-action="mentor:choose:tech">🦾 Iron Man</button><button type="button" class="mentor-choice ${p.mentor==='fun'?'selected':''}" data-action="mentor:choose:fun">🕸️ Spider-Man</button></div><div class="mentor-stage ${p.mentor==='fun'?'stage-spider':'stage-iron'}" id="mentor-stage" aria-label="Animacja wybranego mentora"><div class="mentor-stars">✦ ✧ ✦</div><div class="mentor-flight-lines"></div><div class="mentor-web" aria-hidden="true"><svg viewBox="0 0 500 280" preserveAspectRatio="none"><path d="M230 170 L480 18 M230 170 L498 85 M230 170 L498 160 M230 170 L488 248 M230 170 L370 0 M230 170 L310 0 M230 170 L490 280 M230 170 L360 280" stroke="white" stroke-width="3" fill="none"/><path d="M332 108 Q370 123 390 80 M355 134 Q415 158 442 110 M350 170 Q420 190 470 175 M345 203 Q400 210 442 234 M285 140 Q315 160 330 95" stroke="white" stroke-width="2" fill="none"/></svg></div><img class="mentor-figure" src="assets/art/${p.mentor==='fun'?'spider':'iron'}.svg" alt="${p.mentor==='fun'?'Spider-Man':'Iron Man'}"><div class="mentor-floor"></div><div class="mentor-power-caption">${p.mentor==='fun'?'🕸️ Uwaga, leci sieć!':'🚀 Start silników! Iron Man leci!'}</div></div><div class="mentor-talk"><h3>${p.mentor==='fun'?'🕷️ Spider-Man mówi:':'🦾 Iron Man mówi:'}</h3><p>${p.mentor==='fun'?'Hej! Masz pytanie? Dawaj, zanim znowu zaplączę się w sieć!':'System gotowy. Zadaj pytanie, młody wynalazco.'}</p></div><p class="muted">Mentor korzysta z AI Gemini. Możesz pytać o naukę i superbohaterów.</p><label for="question">Twoje pytanie</label><input id="question" placeholder="Np. Co to rzeczownik? Jak mnożyć?"><div class="row">${button('💡 Wyjaśnij','mentor:answer','gold')}${button('🎙️ Zapytaj głosem','mic')}</div><p id="mentoranswer" class="guide">Zapytaj o rzeczowniki, czasowniki, sylaby, dodawanie, odejmowanie lub mnożenie.</p>${button('🔊 Odczytaj wyjaśnienie','mentor:speak')}</section>`;
if(tab==='base'){html+=`<section class="card"><h3>🦸 Wybierz swojego bohatera</h3><p>Możesz zmienić bohatera w każdej chwili.</p>${heroPicker(who)}</section>`+baseMarkup(p,button)+`<section class="card"><h2>🎮 Salon gier Avengersów</h2><p>Gry są dostępne także bez wydawania złotych.</p>${button('🧩 Prawdziwa krzyżówka','game:crossword','gold')}${button('🏆 Quiz superbohatera','game:quiz')}${button('🧠 Zagadki logiczne','game:logic')}<div class="arcade-shop"><h3>🕹️ Sektor gier</h3><p>Odblokuj grę raz za złote zdobyte w misjach. Po zakupie możesz grać bez limitu.</p>${ARCADE_GAMES.map(g=>`<div class="arcade-offer"><div><b>${g.icon} ${g.title}</b><small>${g.desc}</small></div>${(p.arcadeUnlocked||[]).includes(g.id)?button('▶ Graj','arcade:open:'+g.id,'gold'):button('🔓 '+g.cost+' złotych','arcade:buy:'+g.id,p.coins>=g.cost?'gold':'alt')}</div>`).join('')}</div></section>`}
if(tab==='crossword'){html+=crosswordView()}
if(tab==='arcade'){html+=`<section class="card">${button('← Baza Avengersów','child:base')}<h2>🕹️ ${e(ARCADE_GAMES.find(x=>x.id===arcadeId)?.title||'Gra')}</h2><div id="arcade-root"></div><p class="muted">Graj dla zabawy — bez automatycznego zarabiania złotych.</p></section>`}
if(tab==='learn'){
  if(v37Classic){
   html+=`<div class="v37-return">
    <button data-action="v37:hub">← Sala Wyzwań</button>
   </div>`;
  }else{
   html+=v37Hub();
  }
  if(avengersRun)html+=avengersPanel();
 }layout('Akademia '+p.name,html);if(tab==='arcade')mountArcade(arcadeId,$('arcade-root'));if(tab==='learn'&&v37Classic)newExercise();if(tab==='trace')drawTrace()}
const CROSSWORDS=[
 {word:'KOT',clue:'Miauczy i mruczy',r:0,c:2,dir:'v'},
 {word:'DOM',clue:'Mieszkamy w nim',r:1,c:1,dir:'h'},
 {word:'LAS',clue:'Rosną w nim drzewa',r:3,c:2,dir:'h'},
 {word:'SOK',clue:'Napój z owoców',r:3,c:4,dir:'v'},
 {word:'OKO',clue:'Narząd wzroku',r:5,c:3,dir:'h'}
];
// Each entry has a fixed coordinate; all intersections are validated against one another.
const CROSS_LAYOUT=[
 {word:'KOT',clue:'Zwierzę, które miauczy',r:0,c:2,dir:'v'},
 {word:'DOM',clue:'Budynek, w którym mieszkasz',r:1,c:1,dir:'h'},
 {word:'LAS',clue:'Miejsce pełne drzew',r:3,c:1,dir:'h'},
 {word:'SOK',clue:'Napój wyciskany z owoców',r:3,c:3,dir:'v'},
 {word:'OKO',clue:'Widzisz nim świat',r:5,c:2,dir:'h'}
];
// Generated crossings: words share letters only where their coordinates overlap.
const CROSS_GAME=[
 {word:'KOT',clue:'Zwierzę, które miauczy',r:0,c:2,dir:'v'},
 {word:'DOM',clue:'Budynek, w którym mieszkasz',r:1,c:1,dir:'h'},
 {word:'LAS',clue:'Miejsce pełne drzew',r:3,c:0,dir:'h'},
 {word:'SOK',clue:'Owocowy napój',r:3,c:2,dir:'v'},
 {word:'OKO',clue:'Narząd wzroku',r:5,c:2,dir:'h'}
];
// Use a verified compact crossword with one shared central vertical word.
const PUZZLE=[
 {word:'KOT',clue:'Zwierzę, które miauczy',r:0,c:2,dir:'v'},
 {word:'DOM',clue:'Budynek mieszkalny',r:1,c:1,dir:'h'},
 {word:'TAMA',clue:'Budowla zatrzymująca wodę',r:2,c:2,dir:'h'}
];
// Intersections: KOT[1]=O = DOM[1], KOT[2]=T = TAMA[0].
function crosswordView(){const cells=new Map();for(const [i,w] of PUZZLE.entries()){for(let j=0;j<w.word.length;j++){const r=w.r+(w.dir==='v'?j:0),c=w.c+(w.dir==='h'?j:0),k=r+','+c,letter=w.word[j];if(cells.has(k)&&cells.get(k)!==letter)throw Error('Niezgodna krzyżówka');cells.set(k,letter)}}let grid='<div class="cross-grid">';for(let r=0;r<3;r++)for(let c=0;c<6;c++){const k=r+','+c;grid+=cells.has(k)?`<input class="cross-cell" data-cross="${k}" maxlength="1" inputmode="text" autocomplete="off" aria-label="Pole wiersz ${r+1} kolumna ${c+1}">`:'<div class="cross-empty"></div>'}grid+='</div>';return `<section class="card">${button('← Wróć do bazy','child:base')}<h2>🧩 Krzyżówka Avengersów</h2><p>Wpisuj po jednej literze w kratki. Hasła przecinają się i mają wspólne litery.</p>${grid}<h3>Hasła</h3>${PUZZLE.map((w,i)=>`<p><b>${i+1}. ${w.dir==='h'?'Poziomo':'Pionowo'}:</b> ${e(w.clue)} (${w.word.length} litery) ${speakBtn(w.clue)}</p>`).join('')}${button('Sprawdź całą krzyżówkę','crossword:check','gold')}<p id="cross-feedback" role="status"></p></section>`}
async function checkCrossword(){let ok=true,filled=true;const expected=new Map();for(const w of PUZZLE)for(let j=0;j<w.word.length;j++)expected.set((w.r+(w.dir==='v'?j:0))+','+(w.c+(w.dir==='h'?j:0)),w.word[j]);for(const [key,letter] of expected){const cell=document.querySelector(`[data-cross="${key}"]`);const val=(cell?.value||'').trim().toLocaleUpperCase('pl-PL');if(!val)filled=false;if(val!==letter)ok=false;cell?.classList.toggle('cross-wrong',!!val&&val!==letter)}const fb=$('cross-feedback');if(!filled){fb.textContent='Uzupełnij wszystkie kratki!';return}if(!ok){fb.textContent=mentorLine(profile(),false);speak(fb.textContent,'pl-PL',profile().mentor);return}fb.textContent=mentorLine(profile(),true);const key='crossword:'+who+':'+date();if(await grant(who,5,'Ułożona krzyżówka',key))fb.textContent+=' +5 złotych';else fb.textContent+=' Dziś punkty za tę krzyżówkę zostały już przyznane.';speak(fb.textContent,'pl-PL',profile().mentor)}
const TRAINING_GROUPS={
 polski:[['bookread','🎙️ Czytam z podręcznika'],['bookquiz','🧩 Zadania z podręcznika'],['read','📖 Czytanie ze zrozumieniem'],['syllable','🔠 Sylaby i wyrazy'],['dictation','✍️ Dyktando']],
 matematyka:[['bookquiz','📚 Zadania z podręcznika'],['math','➕ Działania matematyczne']],
 angielski:[['bookread','🎙️ Czytam z podręcznika'],['bookquiz','🧩 Zadania z podręcznika'],['english','🇬🇧 Słówka i wymowa']],
 wiedza:[['quiz','🏆 Quiz wiedzy'],['logic','🧠 Zagadki logiczne']],
 przedszkole:[['letter','🔤 Rozpoznaj literę'],['lettercase','🔠 Duża i mała litera'],['firstsound','🗣️ Pierwsza litera słowa'],['numbermatch','🔢 Wybierz cyfrę'],['shapes','🔷 Rozpoznaj kształt'],['count','⭐ Liczenie'],['trace','✍️ Pisanie palcem'],['color','🎨 Kolory i kształty'],['quiz','🎉 Quiz obrazkowy']]
};
function trainingSubjects(){return [['polski','📖 Język polski'],['matematyka','🧮 Matematyka'],['angielski','🇬🇧 Język angielski'],['wiedza','🧠 Wiedza i logika'],...(who==='patryk'?[['przedszkole','🌈 Zabawy przedszkolne']]:[])];}
function trainingKindSelect(subject){return select('kind','Wybierz ćwiczenie',TRAINING_GROUPS[subject]||TRAINING_GROUPS.polski,null)}
function trainingChooseSubject(subject){const target=$('trainingKinds');if(!target)return;target.innerHTML=trainingKindSelect(subject);newExercise()}
function trainingChooseKind(kind){const subject=Object.keys(TRAINING_GROUPS).find(k=>TRAINING_GROUPS[k].some(([id])=>id===kind))||'wiedza';const sel=$('trainingSubject');if(sel)sel.value=subject;trainingChooseSubject(subject);if($('kind'))$('kind').value=kind;newExercise()}

function bookTrainingPages(){
 const subject=$('trainingSubject')?.value||'polski';
 return data.bookPages.flatMap(pg=>{
  const b=data.books.find(x=>x.id===pg.bookId);
  if(!b||b.child!==who||b.archived||!pg.text?.trim())return [];
  const name=(b.subject||'').toLocaleLowerCase('pl-PL');
  if(subject==='angielski'&&!/ang|english/.test(name))return [];
  if(subject==='matematyka'&&!/mat/.test(name))return [];
  if(subject==='polski'&&!/pol/.test(name))return [];
  return [{pg,b}];
 });
}
function bookSentence(text){
 const cleaned=String(text||'').replace(/\s+/g,' ').trim();
 const sentences=cleaned.match(/[^.!?]+[.!?]+|[^.!?]+$/g)||[];
 return sentences.map(x=>x.trim()).filter(x=>x.length>=15&&x.length<=230&&x.split(/\s+/).length>=3);
}
function normWords(t){return String(t||'').toLocaleLowerCase('pl-PL').replace(/[^\p{L}\p{N}\s]/gu,' ').split(/\s+/).filter(Boolean)}
function compareReading(expected,heard){
 const a=normWords(expected),b=normWords(heard);
 let prev=Array.from({length:b.length+1},(_,i)=>i);
 for(let i=1;i<=a.length;i++){let curr=[i];for(let j=1;j<=b.length;j++)curr[j]=Math.min(curr[j-1]+1,prev[j]+1,prev[j-1]+(a[i-1]===b[j-1]?0:1));prev=curr}
 return {percent:Math.round(100*(1-prev[b.length]/Math.max(a.length,b.length,1))),expected:a.length,heard:b.length};
}
function bookExercise(){
 const box=$('exercise'),available=bookTrainingPages(),selected=$('booktrainingpage')?.value;
 const page=available.find(x=>x.pg.id===selected)||available[0];
 const kind=$('kind')?.value||'bookread';
 const pick=available.map(({pg,b})=>`<option value="${e(pg.id)}" ${pg.id===page?.pg.id?'selected':''}>${e(b.title)} · strona ${pg.number}</option>`).join('');
 const selector=`<div class="book-training-top"><span>📚 MISJA Z TWOJEJ KSIĄŻKI</span><span>✨ Uczymy się z podręcznika</span></div><label for="booktrainingpage">Wybierz książkę i stronę</label><select id="booktrainingpage">${pick}</select>`;
 if(!page){box.innerHTML=`<div class="book-training">${selector}<h3>📷 Dodaj najpierw stronę podręcznika</h3><p>Mama musi dodać zdjęcie, rozpoznać tekst i sprawdzić błędy OCR. Dopiero wtedy powstaną ćwiczenia z tej strony.</p></div>`;return}
 const sentences=bookSentence(page.pg.text);
 if(!sentences.length){box.innerHTML=`<div class="book-training">${selector}<p>Na tej stronie nie ma wystarczająco czytelnych zdań. Popraw tekst w Panelu mamy → Książki.</p></div>`;return}
 const sentence=sentences[Math.floor(Math.random()*sentences.length)];
 const lang=($('trainingSubject')?.value==='angielski')?'en-US':'pl-PL';
 if(kind==='bookread'){
  practice={kind,answer:sentence,question:sentence};
  box.innerHTML=`<div class="book-training">${selector}<div class="book-reading-card"><div class="book-illustration">📖 <span>⭐</span> 🎙️</div><span class="book-label">MISJA: PRZECZYTAJ NA GŁOS</span><p class="book-sentence">${e(sentence)}</p><div class="row">${speakBtn(sentence,lang)} ${button('🎙️ Czytam!','book:listen','gold')}</div><p class="book-instruction">Naciśnij mikrofon i przeczytaj zdanie. Porównamy rozpoznane słowa z tekstem książki.</p><p id="readingfeedback" role="status" class="book-result">Gotowy? Mikrofon czeka!</p><p class="muted">To orientacyjne porównanie tekstu rozpoznanego przez telefon, a nie wiarygodna ocena wymowy. W razie pomyłki mikrofonu spróbuj ponownie.</p></div></div>`;
 }else{
  const words=normWords(sentence).filter(x=>x.length>=4);
  const chosen=words[Math.floor(Math.random()*words.length)];
  const parts=sentence.split(new RegExp('('+chosen+')','i'));
  const masked=parts.map(x=>x.toLocaleLowerCase('pl-PL')===chosen?'_____':x).join('');
  const others=[...new Set(normWords(page.pg.text).filter(x=>x.length>=4&&x!==chosen))].sort(()=>Math.random()-.5).slice(0,3);
  const choices=[chosen,...others].sort(()=>Math.random()-.5);
  practice={kind,answer:chosen,question:masked};
  box.innerHTML=`<div class="book-training">${selector}<div class="book-reading-card"><div class="book-illustration">🧩 <span>✨</span> 📚</div><span class="book-label">MISJA: ODKRYJ BRAKUJĄCE SŁOWO</span><p class="book-sentence">${e(masked)}</p><p>Wybierz słowo, które naprawdę występuje w Twojej książce.</p><div class="book-choices">${choices.map((c,i)=>`<button data-choice="${e(c)}" data-action="exercise:check:${i}">${e(c)}</button>`).join('')}</div><p id="feedback" class="book-result" role="status"></p></div></div>`;
 }
 box.querySelectorAll('[data-speak]').forEach(b=>b.addEventListener('click',ev=>{ev.stopPropagation();speak(b.dataset.speak,b.dataset.lang,profile().mentor,data.settings.rate||1)}));
}
function practiceEnglishSpeech(){
 const word=practice?.word;
 const feedback=$('english-pronunciation-feedback');
 if(!word||!feedback)return;
 const Recognition=window.SpeechRecognition||window.webkitSpeechRecognition;
 if(!Recognition){feedback.textContent='Rozpoznawanie mowy nie jest dostępne w tej przeglądarce. Otwórz Akademię w Chrome.';return}
 try{
  const r=new Recognition();r.lang='en-US';r.interimResults=false;r.maxAlternatives=5;
  feedback.textContent='🎙️ Słucham! Powiedz po angielsku: '+word;
  r.onresult=ev=>{
   const alternatives=Array.from(ev.results[0]).map(x=>x.transcript.trim());
   const normalize=x=>x.toLowerCase().replace(/[^a-z\s-]/g,'').trim();
   const match=alternatives.some(x=>normalize(x)===normalize(word));
   const heard=alternatives[0]||'';
   feedback.textContent=match?'🌟 Telefon rozpoznał słowo „'+word+'”. Posłuchaj wzoru i powtórz dla utrwalenia.':'🎯 Telefon usłyszał „'+heard+'”. Odsłuchaj wzór i spróbuj ponownie. To może być też błąd rozpoznawania.';
  };
  r.onerror=ev=>{feedback.textContent='Nie udało się rozpoznać mowy ('+ev.error+'). Sprawdź dostęp do mikrofonu i spróbuj ponownie.'};
  r.onnomatch=()=>{feedback.textContent='Nie rozpoznano słowa. Spróbuj ponownie.'};
  r.start();
 }catch(err){feedback.textContent='Nie można uruchomić mikrofonu: '+err.message}
}
function checkBookReading(){
 const fb=$('readingfeedback');if(!fb||!practice||practice.kind!=='bookread')return;
 const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
 if(!SR){fb.textContent='Ta przeglądarka nie obsługuje rozpoznawania mowy. Spróbuj w Chrome na Androidzie.';return}
 fb.textContent='🎙️ Słucham… przeczytaj zdanie.';
 try{
  const rec=new SR();rec.lang=$('trainingSubject')?.value==='angielski'?'en-US':'pl-PL';rec.interimResults=false;
  rec.onresult=ev=>{
   const heard=ev.results[0][0].transcript,score=compareReading(practice.answer,heard);
   fb.innerHTML=`<b>Usłyszałam:</b> ${e(heard)}<p><b>Zgodność rozpoznanych słów: ${score.percent}%</b></p><p>${score.percent>=85?'🌟 Świetnie!':score.percent>=55?'💪 Dobra próba! Spróbuj jeszcze raz.':'🎯 Posłuchaj wzoru i spróbuj ponownie.'}</p>`;
  };
  rec.onerror=ev=>{fb.textContent='Nie udało się rozpoznać mowy ('+ev.error+'). Spróbuj ponownie.'};
  rec.onnomatch=()=>{fb.textContent='Nie rozpoznano zdania. Spróbuj jeszcze raz.'};
  rec.start();
 }catch(err){fb.textContent='Mikrofon: '+err.message}
}

async function newExercise(){const box=$('exercise');if(!box)return;const kind=$('kind').value;practiceAnswered=false;if(kind==='bookread'||kind==='bookquiz'){bookExercise();return;}let question='',answer='',choices=[],lang='pl-PL';if(kind==='letter'){const alphabet='ABCDEFGHIKLMNOPRSTUWYZ'.split('');const target=alphabet[Math.floor(Math.random()*alphabet.length)];question=`Znajdź literę ${target}. Dotknij właściwej litery!`;answer=target;choices=[target,...alphabet.filter(x=>x!==target).sort(()=>Math.random()-.5).slice(0,3)]}
else if(kind==='lettercase'){const alphabet='ABCDEFGHIKLMNOPRSTUWYZ'.split('');const target=alphabet[Math.floor(Math.random()*alphabet.length)];question=`Która mała literka pasuje do dużej ${target}?`;answer=target.toLowerCase();choices=[answer,...alphabet.filter(x=>x!==target).sort(()=>Math.random()-.5).slice(0,3).map(x=>x.toLowerCase())]}
else if(kind==='firstsound'){const words=[['🍎','arbuz','A'],['🐈','kot','K'],['🏠','dom','D'],['🐟','ryba','R'],['🦋','motyl','M'],['🐕','pies','P'],['☀️','słońce','S'],['🦁','lew','L'],['🌳','drzewo','D'],['🥛','mleko','M']];const w=words[Math.floor(Math.random()*words.length)];question=`${w[0]} ${w[1].toUpperCase()} — jaką literą zaczyna się to słowo?`;answer=w[2];choices=[answer,...'ABCDEFGHIKLMNOPRSTUWYZ'.split('').filter(x=>x!==answer).sort(()=>Math.random()-.5).slice(0,3)]}
else if(kind==='numbermatch'){const n=Math.floor(Math.random()*10);question=`Znajdź cyfrę ${n}. Która z nich to ${n}?`;answer=String(n);choices=[answer,...Array.from({length:10},(_,i)=>String(i)).filter(x=>x!==answer).sort(()=>Math.random()-.5).slice(0,3)]}
else if(kind==='shapes'){const shapes=[['●','koło'],['■','kwadrat'],['▲','trójkąt'],['◆','romb'],['★','gwiazda']];const sh=shapes[Math.floor(Math.random()*shapes.length)];question=`Który kształt to ${sh[1]}?`;answer=sh[0];choices=shapes.map(x=>x[0]).filter(x=>x!==answer).sort(()=>Math.random()-.5).slice(0,3).concat(answer)}
else if(kind==='math'){let max=profile().grade==='1'?10:profile().grade==='2'?30:100,a=1+Math.floor(Math.random()*max),b=1+Math.floor(Math.random()*Math.min(a,30)),plus=Math.random()>.5;question=`Ile to ${a} ${plus?'+':'−'} ${b}?`;answer=String(plus?a+b:a-b);choices=[answer,String(Number(answer)+2),String(Math.max(0,Number(answer)-1))]}else if(kind==='read'){const r=readings[Math.floor(Math.random()*readings.length)];question=r.text+'\n'+r.question;answer=r.answer;choices=r.options}else if(kind==='english'){const r=vocabulary[Math.floor(Math.random()*vocabulary.length)];question=`Co znaczy słowo „${r[0]}”?`;answer=r[1];choices=[r[1],...vocabulary.filter(v=>v[1]!==r[1]).slice(0,2).map(v=>v[1])];practice={kind,answer,question,word:r[0]};}else if(kind==='count'){let n=2+Math.floor(Math.random()*7);question='Policz gwiazdki: '+ '⭐'.repeat(n);answer=String(n);choices=[answer,String(n+1),String(n-1)]}else if(kind==='color'){const colors=[['🔴','czerwony'],['🟢','zielony'],['🔵','niebieski'],['🟡','żółty']];let r=colors[Math.floor(Math.random()*colors.length)];question=`Jaki to kolor? ${r[0]}`;answer=r[1];choices=colors.filter(c=>c[1]!==r[1]).slice(0,2).map(c=>c[1]).concat(answer)}else if(kind==='syllable'){const items=[['ma-ma','2'],['ka-na-pa','3'],['ko-tek','2'],['sa-mo-lot','3']];let r=items[Math.floor(Math.random()*items.length)];question=`Ile sylab ma słowo ${r[0]}?`;answer=r[1];choices=['1','2','3']}else if(kind==='dictation'){const words=['szkoła','krzesło','żaba','rzeka','chmura','przyjaciel','książka','ogród','pszczoła','wróbel'];answer=words[Math.floor(Math.random()*words.length)];question='Posłuchaj słowa, a potem zapisz je poprawnie.';practice={kind,answer,question};box.innerHTML=`<h3>✍️ Dyktando: posłuchaj i zapisz ${speakBtn('Napisz słowo, które za chwilę usłyszysz.')}</h3><div class="row">${button('🔊 Odsłuchaj słowo','dictation:play','gold')}</div><input id="dictationanswer" autocomplete="off" spellcheck="false" placeholder="Wpisz usłyszane słowo"><p>${button('Sprawdź pisownię','dictation:check','gold')}</p><p id="feedback" role="status"></p>`;box.querySelectorAll('[data-speak]').forEach(b=>b.addEventListener('click',()=>speak(b.dataset.speak)));return}
else if(kind==='quiz'){const qs=who==='pawel'?[['Ile dni ma tydzień?','7',['5','6','7','8']],['Która planeta jest naszą planetą?','Ziemia',['Mars','Ziemia','Wenus','Jowisz']],['Ile to 5 × 2?','10',['7','8','10','12']],['Co robi pszczoła?','Zbiera nektar',['Zbiera nektar','Buduje tamy','Zjada kamienie','Pływa w morzu']]]:[['Które zwierzę mówi „miau”?','🐈',['🐕','🐈','🐄','🐎']],['Jaki kolor ma trawa?','zielony',['czerwony','zielony','niebieski','fioletowy']],['Co ma dwa koła?','🚲',['🚲','🚗','🛶','🚁']]];const q=qs[Math.floor(Math.random()*qs.length)];question=q[0];answer=q[1];choices=q[2]}
else if(kind==='logic'){const q=[['Co jest cięższe: kilogram piór czy kilogram kamieni?','Tyle samo',['Pióra','Kamienie','Tyle samo','Nie wiadomo']],['Co następuje po liczbie 19?','20',['18','20','21','29']],['Który miesiąc jest po maju?','Czerwiec',['Marzec','Kwiecień','Czerwiec','Lipiec']]][Math.floor(Math.random()*3)];question=q[0];answer=q[1];choices=q[2]}
else if(kind==='trace'){box.innerHTML=`<h3>✍️ Prowadź palec po śladzie ${speakBtn('Prowadź palec po śladzie')}</h3>${select('tracechar','Litera lub cyfra','A B C D E F G H I J K L M N O P R S T U W Y Z 0 1 2 3 4 5 6 7 8 9'.split(' ').map(x=>[x,x]),'A')}<canvas id="trace" width="320" height="300" aria-label="Tablica do rysowania"></canvas><p id="tracefeedback">Narysuj literkę. Aplikacja sama sprawdzi kształt. Punkty tylko za poprawny ślad.</p>${button('Wyczyść','trace:clear')}${button('Sprawdź literkę','trace:submit','gold')}`;drawTrace();return}choices=[...new Set(choices)].sort(()=>Math.random()-.5);practice={kind,answer,question,...(practice?.word&&kind==='english'?{word:practice.word}:{})};box.innerHTML=kind==='english'?`<div class="english-game"><div class="english-top"><span>🇬🇧 ANGIELSKI · MISJA SŁÓWKA</span><span>✨ Ucz się przez zabawę</span></div><div class="english-mode-row"><span class="english-mode">🖼️ Obrazek</span><span class="english-mode">🔊 Słuchanie</span><span class="english-mode">🧠 Quiz</span></div><div class="english-illustration">${vocabArt(practice.word)}</div><div class="english-word"><small>POSŁUCHAJ I ZAPAMIĘTAJ</small><strong>${e(practice.word)}</strong><div class="english-audio">${speakBtn(practice.word,'en-US')} ${button('🔤 Literuj','exercise:spell')}</div><div class="english-pronunciation"><p><b>🎙️ Powiedz słowo po angielsku</b></p>${button('🎤 Powiedz do telefonu','exercise:pronounce','gold')}<p id="english-pronunciation-feedback" role="status" aria-live="polite">Najpierw posłuchaj wzoru, a potem naciśnij mikrofon.</p><small>Telefon sprawdza, jakie słowo rozpoznał — nie ocenia dokładności poszczególnych głosek. Możesz próbować wielokrotnie.</small></div></div><div class="english-question"><h3>Co oznacza <em>${e(practice.word)}</em>?</h3><p>Wybierz właściwą odpowiedź 👇</p></div><div class="english-answers">${choices.map((c,i)=>`<button class="english-answer" data-action="exercise:check:${i}" data-choice="${e(c)}"><span class="english-choice-mark">${['A','B','C','D'][i]}</span><b>${e(c)}</b></button>`).join('')}</div><p id="feedback" class="english-feedback" role="status"></p></div>`:`<h3>${e(question).replace(/\n/g,'<br>')} ${speakBtn(question)}</h3><p>${speakBtn('Wybierz poprawną odpowiedź spośród dostępnych możliwości.')}</p><div class="grid">${choices.map((c,i)=>`<button class="alt" data-action="exercise:check:${i}" data-choice="${e(c)}">${e(c)} ${speakBtn(c)}</button>`).join('')}</div><p id="feedback" role="status"></p>`;box.querySelectorAll('[data-speak]').forEach(b=>b.addEventListener('click',ev=>{ev.stopPropagation();speak(b.dataset.speak,b.dataset.lang,profile().mentor,data.settings.rate||1)}))}
async function checkExercise(i){if(practiceAnswered)return;const buttons=[...document.querySelectorAll('#exercise [data-choice]')],answer=buttons[i]?.dataset.choice;if(!answer)return;const ok=answer===practice.answer,fb=$('feedback');fb.textContent=mentorLine(profile(),ok);speak(fb.textContent,'pl-PL',profile().mentor);if(!ok)return;practiceAnswered=true;buttons.forEach(b=>b.disabled=true);const key=`practice:${who}:${date()}`,count=data.history.filter(h=>h.child===who&&h.key.startsWith(key)).length;const low=(who==='pawel'&&['count','color','letter','lettercase','firstsound','numbermatch','shapes','trace'].includes(practice.kind))||(Number(profile().grade)>2&&['count','color','letter','lettercase','firstsound','numbermatch','shapes'].includes(practice.kind));if(count<(Number(data.settings.dailyPracticeLimit)||3)&&!low){const awarded=await grant(who,Number(data.settings.xpPractice)||5,'Trening: '+practice.kind,key+':'+count);if(awarded)fb.textContent+=' +'+data.settings.xpPractice+' złotych'}else fb.textContent+=' Ćwicz dalej bez punktów (limit lub powtórka poniżej poziomu).'}
function drawTrace(){const canvas=$('trace');if(!canvas)return;const char=$('tracechar').value,ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,320,300);ctx.fillStyle='#d8dce5';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='bold 230px Arial';ctx.fillText(char,160,150);tracePoints=[];ctx.strokeStyle='#bd3048';ctx.lineWidth=10;ctx.lineCap='round';const mask=document.createElement('canvas');mask.width=320;mask.height=300;const mc=mask.getContext('2d');mc.fillStyle='white';mc.fillRect(0,0,320,300);mc.fillStyle='black';mc.font='bold 230px Arial';mc.textAlign='center';mc.textBaseline='middle';mc.fillText(char,160,150);traceMask=mc.getImageData(0,0,320,300).data;const pos=ev=>{const r=canvas.getBoundingClientRect();return [(ev.clientX-r.left)*320/r.width,(ev.clientY-r.top)*300/r.height]};canvas.onpointerdown=ev=>{traceDown=true;canvas.setPointerCapture(ev.pointerId);let p=pos(ev);tracePoints.push(p);ctx.beginPath();ctx.moveTo(...p)};canvas.onpointermove=ev=>{if(!traceDown)return;let p=pos(ev);tracePoints.push(p);ctx.lineTo(...p);ctx.stroke()};canvas.onpointerup=canvas.onpointercancel=()=>{traceDown=false;tracePoints.push(null)}}
async function traceSubmit(){
 const char=$('tracechar')?.value, feedback=$('tracefeedback');
 if(!char||!traceMask||!feedback)return;
 const strokes=[];let stroke=[];
 for(const point of tracePoints){if(point){stroke.push(point)}else if(stroke.length){strokes.push(stroke);stroke=[]}}
 if(stroke.length)strokes.push(stroke);
 const reject=(msg)=>{feedback.textContent='🔁 '+msg;speak(msg,'pl-PL',profile().mentor);note(msg)};
 if(!strokes.length||strokes.reduce((n,st)=>n+st.length,0)<12)return reject('Najpierw narysuj literkę palcem.');
 const W=320,H=300,grid=12,maskCells=new Set(),drawnCells=new Set();
 // Compare the actual rendered glyph with a sampled stroke, not just the amount of scribbling.
 const isInk=(x,y)=>x>=0&&x<W&&y>=0&&y<H&&traceMask[(Math.floor(y)*W+Math.floor(x))*4]<130;
 for(let y=0;y<H;y+=3)for(let x=0;x<W;x+=3)if(isInk(x,y))maskCells.add(Math.floor(x/grid)+Math.floor(y/grid)*Math.ceil(W/grid));
 let length=0,inside=0,samples=0,outside=0;
 for(const st of strokes){for(let i=1;i<st.length;i++){
  const a=st[i-1],b=st[i],d=Math.hypot(b[0]-a[0],b[1]-a[1]);if(d>130)return reject('Nie łącz odległych części jednym ruchem. Spróbuj jeszcze raz.');
  length+=d;const steps=Math.max(1,Math.ceil(d/3));
  for(let j=0;j<=steps;j++){
   const x=a[0]+(b[0]-a[0])*j/steps,y=a[1]+(b[1]-a[1])*j/steps;samples++;
   let close=false;for(let dy=-9;dy<=9&&!close;dy+=3)for(let dx=-9;dx<=9;dx+=3){if(isInk(x+dx,y+dy)){close=true;break}}
   if(close){inside++;drawnCells.add(Math.floor(x/grid)+Math.floor(y/grid)*Math.ceil(W/grid))}else outside++;
  }
 }}
 const precision=inside/Math.max(1,samples);
 // Count distinct regions of the letter reached by the child's strokes.
 let matched=0;for(const cell of maskCells){const gx=cell%Math.ceil(W/grid),gy=Math.floor(cell/Math.ceil(W/grid));let found=false;
  for(let dy=-1;dy<=1&&!found;dy++)for(let dx=-1;dx<=1;dx++)if(drawnCells.has(gx+dx+(gy+dy)*Math.ceil(W/grid))){found=true;break}
  if(found)matched++;
 }
 const coverage=matched/Math.max(1,maskCells.size);
 if(length<110||precision<.76||coverage<.55)return reject('Jeszcze nie całkiem. Prowadź paluszek po całej literce, dokładnie po jasnym śladzie.');
 const prefix=`trace:${who}:${date()}:`,count=data.history.filter(h=>h.key?.startsWith(prefix)).length;
 const key=prefix+char;
 if(data.history.some(h=>h.key===key)){feedback.textContent='✅ Świetnie! Ta literka jest już dzisiaj zaliczona. Możesz ćwiczyć dalej bez kolejnych punktów.';speak('Brawo! Literka jest poprawna. Dzisiaj punkty za nią już zdobyłeś.','pl-PL',profile().mentor);return}
 const limit=Math.max(0,Number(data.settings.dailyPracticeLimit)??3);
 const low=who==='pawel'&&Number(profile().grade)>=2;
 if(count>=limit||low){feedback.textContent='✅ Brawo! Kształt zaliczony. Dzisiaj bez dodatkowych punktów.';speak('Brawo! Dobrze poprowadzony ślad!','pl-PL',profile().mentor);return}
 const points=Math.max(0,Number(data.settings.xpPractice)||5);
 const awarded=await grant(who,points,'Poprawne pisanie: '+char,key);
 feedback.textContent=awarded?`✅ Brawo! Litera ${char} zaliczona. +${points} XP!`:'✅ Literka zaliczona.';
 speak(awarded?`Brawo! Poprawnie narysowana literka ${char}. Zdobywasz ${points} punktów!`:'Brawo! Poprawna literka.','pl-PL',profile().mentor);
}
async function exportBackup(){const records=await allRecords();const encoded=[];for(const [k,v] of records){if(v instanceof Blob){const base64=await new Promise(ok=>{const r=new FileReader();r.onload=()=>ok(r.result);r.readAsDataURL(v)});encoded.push([k,{__blob:base64}])}else encoded.push([k,v])}const url=URL.createObjectURL(new Blob([JSON.stringify({format:'academy-backup-1',records:encoded})],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='akademia-pelna-kopia-'+date()+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),10000)}
async function importBackup(){const f=$('backupfile').files[0];if(!f)return note('Wybierz plik kopii.');try{const raw=JSON.parse(await f.text());if(raw.format!=='academy-backup-1'||!Array.isArray(raw.records)||!raw.records.some(([k,v])=>k==='state'&&v.profiles?.pawel&&v.profiles?.patryk))throw Error('To nie jest poprawna kopia');if(!confirm('Zastąpić wszystkie lokalne dane tą kopią?'))return;const records=[];for(const [k,v] of raw.records){if(v?.__blob){const res=await fetch(v.__blob);records.push([k,await res.blob()])}else records.push([k,v])}await replaceRecords(records);data=await get('state');role='';render();note('Przywrócono pełną kopię.')}catch(err){note('Nie udało się przywrócić kopii: '+err.message)}}
async function handle(action,target){
if(action.startsWith('v37:say:')){
 const parts=action.split(':');
 const lang=parts[2];
 const text=decodeURIComponent(parts.slice(3).join(':'));
 speak(text,lang,profile().mentor,data.settings.rate||1);
 return;
}
if(action.startsWith('v37:subject:')){
 v37Subject=action.split(':')[2];
 return render();
}
if(action==='v37:play'){
 avengersRun={
  items:v37Questions(v37Subject),
  i:0,points:0,done:false,good:false
 };
 v37Classic=false;
 return render();
}
if(action==='v37:classic'){
 avengersRun=null;
 v37Classic=true;
 return render();
}
if(action==='v37:hub'){
 avengersRun=null;
 v37Classic=false;
 return render();
}

if(action==='av36:start'){
 avengersRun={items:[...avengersQuiz].sort(()=>Math.random()-.5),i:0,points:0,done:false,good:false};
 return render();
}
if(action==='av36:close'){avengersRun=null;return render();}
if(action.startsWith('av36:answer:')&&avengersRun&&!avengersRun.done){
 const q=avengersRun.items[avengersRun.i];
 avengersRun.good=Number(action.split(':')[2])===q.ok;
 if(avengersRun.good)avengersRun.points++;
 avengersRun.done=true;
 return render();
}
if(action==='av36:next'&&avengersRun&&avengersRun.done){
 avengersRun.i++;avengersRun.done=false;return render();
}
const [a,b,c]=action.split(':');try{if(action==='exit'){if(testMode){data=testSnapshot;testSnapshot=null;testMode=false;role='admin';who='';tab='home';adminTab='test';return render()}role='';who='';tab='home';return render()}if(a==='enter'){if(b==='admin'){if(!data.parentPin){const pin=prompt('Ustaw PIN mamy (minimum 4 cyfry)');if(!/^\d{4,8}$/.test(pin||''))return note('Wymagany PIN od 4 do 8 cyfr');data.parentPin=pin;await save()}else if(prompt('PIN mamy')!==data.parentPin)return note('Nieprawidłowy PIN');role='admin';adminTab='home'}else{const p=data.profiles[b];if(p.pin&&prompt('PIN profilu '+p.name)!==p.pin)return note('Nieprawidłowy PIN');role='child';who=b;tab='home'}return render()}if(a==='test'&&b==='enter'){if(!['pawel','patryk'].includes(c))return;testSnapshot=data;data=structuredClone(data);testMode=true;for(const id of ['pawel','patryk']){const p=data.profiles[id];p.coins=99999;p.arcadeUnlocked=ARCADE_GAMES.map(g=>g.id);const base=migrateBase(p);base.owned=BASE_ITEMS.map(i=>i.id)}role='child';who=c;tab='base';return render()}if(a==='admin'){adminTab=b;return render()}if(a==='child'){tab=b;return render()}if(action==='book:add'){const title=$('btitle').value.trim();if(!title)return note('Wpisz tytuł');data.books.push({id:uid(),title,child:$('bchild').value,grade:$('bgrade').value,subject:$('bsubject').value,part:$('bpart').value,year:$('byear').value,archived:false});await save();return render()}if(action==='book:save'){const book=data.books.find(b=>b.id===bookId);Object.assign(book,{title:$('btitle').value,child:$('bchild').value,grade:$('bgrade').value,subject:$('bsubject').value,part:$('bpart').value,year:$('byear').value});await save();return render()}if(action==='book:archive'){const book=data.books.find(b=>b.id===bookId);book.archived=!book.archived;await save();return render()}if(action.startsWith('book:open:')){bookId=action.slice(10);adminTab='book';return render()}if(action==='page:upload'||action==='page:camera'){const files=[...(action==='page:camera'?$('pagecamera'):$('pagefiles')).files];if(!files.length)return note('Wybierz zdjęcia');let n=Number($('start').value)||1,added=0;for(const f of files){const blob=await compress(f),imageId=uid();await put('image:'+imageId,blob);data.bookPages.push({id:uid(),bookId,number:n++,imageId,text:''});added++}await save();render();return note('Dodano '+added+' stron')}if(action.startsWith('page:open:')){pageId=action.slice(10);adminTab='page';return render()}if(action==='page:save'){const p=data.bookPages.find(p=>p.id===pageId);p.number=Number($('pnum').value)||p.number;p.text=$('ptext').value;await save();return note('Zapisano stronę')}if(action==='page:delete'){if(!confirm('Usunąć tę stronę?'))return;const p=data.bookPages.find(p=>p.id===pageId);await del('image:'+p.imageId);data.bookPages=data.bookPages.filter(x=>x.id!==pageId);await save();adminTab='book';return render()}if(action==='page:replace'){const f=$('replacefile').files[0];if(!f)return note('Wybierz zdjęcie');const p=data.bookPages.find(p=>p.id===pageId);await put('image:'+p.imageId,await compress(f));return render()}if(action==='page:ai'){const p=data.bookPages.find(p=>p.id===pageId);if(!p)return note('Nie znaleziono strony');try{await recognizePageAI(p,$('ocrlang')?.value||'pol');render();note('Odczyt AI gotowy. Sprawdź tekst.')}catch(err){note(err.message)}return}if(action==='page:ocr'){const p=data.bookPages.find(p=>p.id===pageId);if(!p)return note('Nie znaleziono strony');const lang=$('ocrlang')?.value||'pol';try{await recognizePage(p,lang);render();note('Tekst odczytany. Sprawdź go i zapisz poprawki.')}catch(err){note(err.message)}return}
if(action.startsWith('profile:save:')){const p=data.profiles[c],pin=$('pin_'+c).value;if(pin&&!/^\d{4,8}$/.test(pin))return note('PIN musi mieć 4–8 cyfr');p.grade=$('grade_'+c).value;p.subjects=[...document.querySelectorAll('[data-subject-for="'+c+'"]:checked')].map(x=>x.value);const extra=$('newsubject_'+c).value.trim();if(extra&&!p.subjects.some(x=>x.toLowerCase()===extra.toLowerCase()))p.subjects.push(extra);p.pin=pin;await save();return note('Zapisano profil')}if(a==='hero'&&b==='set'){const id=c,selected=action.split(':')[3];if(!HEROES.some(h=>h[0]===selected))return;data.profiles[id].hero=selected;await save();return render()}if(action==='pin:change'){const pin=$('parentpin').value;if(!/^\d{4,8}$/.test(pin))return note('PIN musi mieć 4–8 cyfr');data.parentPin=pin;await save();return note('Zmieniono PIN')}if(action==='settings:save'){data.settings.xpPractice=Math.max(0,Math.min(30,Number($('xpPractice').value)));data.settings.dailyPracticeLimit=Math.max(0,Math.min(20,Number($('dailyLimit').value)));data.settings.rate=Math.max(.5,Math.min(1.5,Number($('rate').value)));await save();return note('Zapisano ustawienia')}if(action.startsWith('song:open:')){missionId=action.slice(10);tab='song';return render()}if(action.startsWith('song:line:')){const lines=[...document.querySelectorAll('.song-line')];lines.forEach((x,i)=>x.classList.toggle('active',i===Number(c)));return}if(action==='song:add'){const title=$('songtitle').value,url=$('songurl').value;if(!/^https:\/\/(www\.)?(youtube\.com|youtu\.be)\//.test(url))return note('Podaj prawidłowy link YouTube');const lyrics=$('songlyrics')?.value||'';const id=youtubeId(url);if(!id)return note('Podaj prawidłowy adres filmu YouTube');data.settings.songs.push({id:uid(),title,url,lyrics});const song=data.settings.songs.at(-1);data.missions.push({id:uid(),child:$('songchild').value,type:'song',songId:song.id,title:'🎵 Naucz się piosenki: '+title,subject:'Muzyka',status:'todo',points:20,requirePhoto:false,repeat:'none',created:date()});await save();return render()}if(action.startsWith('song:delete:')){data.settings.songs.splice(Number(c),1);await save();return render()}if(action==='backup:export')return exportBackup();if(action==='backup:import')return importBackup();if(action.startsWith('reader:')&&action!=='reader:ocr'){bookId=b;pageId='';tab='reader';return render()}if(action==='reader:ai'){const pg=data.bookPages.find(p=>p.id===($('readerpage')?.value||pageId));if(!pg)return note('Wybierz stronę');try{await recognizePageAI(pg,$('ocrlang')?.value||'pol');pageId=pg.id;render();note('Odczyt AI gotowy. Sprawdź tekst.')}catch(err){note(err.message)}return}if(action==='reader:ocr'){const pg=data.bookPages.find(p=>p.id===($('readerpage')?.value||pageId));if(!pg)return note('Wybierz stronę');try{await recognizePage(pg,$('ocrlang')?.value||'pol');pageId=pg.id;render();note('Tekst rozpoznany — możesz go teraz odsłuchać.')}catch(err){note(err.message)}return}
if(action==='homework:create'){const p=data.bookPages.find(p=>p.id===$('readerpage').value),b=data.books.find(b=>b.id===bookId),tasks=$('tasks').value.trim();if(!p||!tasks)return note('Wybierz stronę i wpisz zadania');data.missions.push({id:uid(),child:who,type:'homework',title:'Zadania '+tasks,subject:b.subject,bookId:b.id,page:p.number,status:'todo',points:20,requirePhoto:true,repeat:'none',created:date()});await save();tab='home';return render()}if(action==='academy:subjects'){academySubject='';tab='academy';return render()}if(action.startsWith('academy:subject:')){academySubject=c;tab='academy';return render()}if(action.startsWith('lesson:open:')){lessonIndex=Number(c);tab='lesson';return render()}
if(action.startsWith('discovery:start:'))return discoveryStart(c);if(action==='discovery:restart')return discoveryStart(discoveryGame?.mode||'match');if(action.startsWith('discovery:match:'))return discoveryAnswer(discoveryGame?.items[discoveryGame.index]?.[1]===discoveryGame?.items[Number(c)]?.[1]?discoveryGame.items[discoveryGame.index][1]:'');if(action==='discovery:quick')return discoveryAnswer(target.dataset.answer);if(action.startsWith('lesson:answer:')){const l=LESSONS[lessonIndex],ok=Number(c)===l.correct,el=$('lesson-feedback');if(!el)return;el.textContent=ok?'🎉 Świetnie! '+l.why:'💡 Spróbuj ponownie. '+l.rule;el.className=ok?'answer-ok':'answer-retry';speak(el.textContent,'pl-PL',profile().mentor);return}
if(action.startsWith('arcade:buy:')){const g=ARCADE_GAMES.find(x=>x.id===c),p=profile();if(!g)return;if((p.arcadeUnlocked||[]).includes(g.id))return note('Gra już odblokowana');if(p.coins<g.cost)return note('Brakuje '+(g.cost-p.coins)+' złotych');p.coins-=g.cost;p.arcadeUnlocked??=[];p.arcadeUnlocked.push(g.id);await save();return render()}
if(action.startsWith('arcade:open:')){if(!testMode&&!(profile().arcadeUnlocked||[]).includes(c))return note('Najpierw odblokuj grę');arcadeId=c;tab='arcade';return render()}
if(action==='game:crossword'){tab='crossword';return render()}if(action==='game:quiz'){tab='learn';render();trainingChooseKind('quiz');return}if(action==='game:logic'){tab='learn';render();trainingChooseKind('logic');return}if(action==='crossword:check')return checkCrossword();if(action==='exercise:new')return newExercise();if(action==='book:listen')return checkBookReading();if(action==='dictation:play')return speak(practice?.answer||'','pl-PL',profile().mentor,.8);if(action==='dictation:check'){const v=($('dictationanswer')?.value||'').trim().toLocaleLowerCase('pl-PL'),ok=v===practice.answer.toLocaleLowerCase('pl-PL');const fb=$('feedback');if(practiceAnswered)return;if(!ok){fb.textContent=mentorLine(profile(),false);speak(fb.textContent,'pl-PL',profile().mentor);return}practiceAnswered=true;fb.textContent=mentorLine(profile(),true);$('dictationanswer').disabled=true;const key='practice:'+who+':'+date(),count=data.history.filter(h=>h.child===who&&h.key.startsWith(key)).length;if(count<Number(data.settings.dailyPracticeLimit||3)){await grant(who,Number(data.settings.xpPractice)||5,'Trening: '+practice.kind,key+':'+count);fb.textContent+=' +'+data.settings.xpPractice+' złotych'}else fb.textContent+=' Dzienny limit XP wykorzystany.';speak(fb.textContent,'pl-PL',profile().mentor);return}if(action.startsWith('exercise:check:'))return checkExercise(Number(c));if(action==='exercise:pronounce')return practiceEnglishSpeech();if(action==='exercise:spell'){const letters=practice.word.toUpperCase().split('').join(', ');return speak(letters,'en-US',profile().mentor,.75)}if(action==='trace:clear')return drawTrace();if(action==='trace:submit')return traceSubmit();if(action==='mentor:answer'){
 const q=String($('question')?.value||'').trim();
 if(!q)return note('Najpierw wpisz pytanie.');
 const style=profile().mentor==='fun'?'fun':'tech';
 const output=$('mentoranswer');
 output.textContent='⏳ Mentor zastanawia się...';
 try{
  const response=await fetch('https://akademia-ai.niedzialkowskamagdalena02.workers.dev/mentor-ai',{
   method:'POST',
   headers:{'Content-Type':'application/json'},
   body:JSON.stringify({
    question:q,
    mentor:style,
    history:mentorHistory[style]
   })
  });
  const result=await response.json();
  if(!response.ok||!result.answer)
   throw new Error(result.error||'Brak odpowiedzi AI');
  const answer=String(result.answer);
  mentorHistory[style].push(
   {role:'user',text:q},
   {role:'model',text:answer}
  );
  mentorHistory[style]=mentorHistory[style].slice(-8);
  output.textContent=answer;
  speak(answer,'pl-PL',style);
 }catch(err){
  output.textContent='Błąd połączenia z AI: '+err.message;
 }
 return;
}if(action.startsWith('mentor:choose:')){const style=action.split(':')[2];if(!['tech','fun'].includes(style))return;profile().mentor=style;await save();render();return}if(action==='mentor:speak')return speak($('mentoranswer').textContent,'pl-PL',profile().mentor);if(a==='base'&&b==='buy'){const item=BASE_ITEMS.find(x=>x.id===c),p=profile(),base=migrateBase(p);if(!item)return note('Nieznany element');if(base.owned.includes(item.id))return note('To już jest w Twojej bazie');if(p.coins<item.cost)return note('Potrzebujesz jeszcze '+(item.cost-p.coins)+' złotych');p.coins-=item.cost;base.owned.push(item.id);await save();speak('Brawo! Odblokowano '+item.name,'pl-PL',p.mentor);return render()}if(action==='mic')return microphone();}catch(err){console.error(err);note('Nie udało się wykonać operacji: '+err.message)}}
function helpForQuestion(question){
 const q=String(question||'').toLocaleLowerCase('pl-PL').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
 if(/(test|sprawdzian|kartkowk)/.test(q))return 'Aby zrobić test, wybierz zakładkę Trening, następnie przedmiot i ćwiczenie Test lub Quiz. Jeśli test jest zadany przez mamę, otwórz Misje i wybierz tę misję.';
 if(/(pogra|gra[cy]?|gry|waz|tetris|klock)/.test(q))return 'Żeby pograć, otwórz zakładkę Baza Avengersów i gry, następnie znajdź Sektor gier. Wybierz Kosmicznego Węża albo Wieżę Klocków. Jeżeli gra jest zamknięta, możesz odblokować ją za złote.';
 if(/(gdzie|jak|kt[oó]r|klik|wejsc|otworzyc|znalezc)/.test(q)&&/(trening|cwiczen|zadani|nauk)/.test(q))return 'Ćwiczenia znajdziesz w zakładce Trening. Najpierw wybierz przedmiot, a potem rodzaj zadania. W Sali odkrywców możesz poznać zasady i przykłady.';
 if(/(gdzie|jak|klik|wejsc|otworzyc|znalezc)/.test(q)&&/(baz|zbrojown|bohater|sklep|zlot)/.test(q))return 'Otwórz Bazę Avengersów i gry. Tam obejrzysz pomieszczenia, bohaterów i wyposażenie, a także wydasz zdobyte złote.';
 if(/(gdzie|jak|klik|wejsc|otworzyc|znalezc)/.test(q)&&/(ksiaz|lektur|czyta)/.test(q))return 'Wejdź w zakładkę Książki. Wybierz książkę i stronę, którą chcesz przeczytać lub odsłuchać.';
 if(/(gdzie|jak|klik|wejsc|otworzyc|znalezc)/.test(q)&&/(misj|prac[ae] domow)/.test(q))return 'Otwórz Misje. Tam znajdziesz zadania przygotowane przez mamę.';
 if(/(gdzie|jak|klik|wejsc|otworzyc|znalezc)/.test(q)&&/(mentor|pytan|mikrofon)/.test(q))return 'Wybierz zakładkę Mentor. Możesz tam wybrać Iron Mana lub Spider-Mana, zadać pytanie i odsłuchać odpowiedź.';
 if(/(gdzie|jak|klik|wejsc|otworzyc|znalezc)/.test(q)&&/(angiel|slowek|wymow)/.test(q))return 'Otwórz Trening, wybierz Angielski i ćwiczenie ze słówkami. W Sali odkrywców też znajdziesz angielskie lekcje.';
 if(/(przeczytaj|odczytaj|powtorz polecenie)/.test(q))return 'Aby odsłuchać zadanie, naciśnij przycisk głośnika przy poleceniu. Możesz też ponownie odsłuchać moją odpowiedź przyciskiem Odsłuchaj.';
 return null;
}
function closeMicBubble(){const box=document.getElementById('micanswer');if(box)box.remove();}
function showMicBubble(answer){
 closeMicBubble();
 const box=document.createElement('aside');box.id='micanswer';box.className='mic-answer-card';box.setAttribute('role','status');
 const heading=document.createElement('div');heading.className='mic-answer-heading';
 const title=document.createElement('strong');title.textContent=profile().mentor==='fun'?'🕷️ Spider-Man podpowiada':'🦾 Iron Man podpowiada';
 const close=document.createElement('button');close.type='button';close.className='mic-answer-close';close.setAttribute('aria-label','Zamknij podpowiedź');close.textContent='✕';close.addEventListener('click',()=>{if('speechSynthesis'in window)speechSynthesis.cancel();closeMicBubble()});
 heading.append(title,close);
 const text=document.createElement('p');text.textContent=answer;
 const replay=document.createElement('button');replay.type='button';replay.className='mic-answer-replay';replay.textContent='🔊 Odsłuchaj ponownie';replay.addEventListener('click',()=>speak(answer,'pl-PL',profile().mentor));
 box.append(heading,text,replay);document.body.appendChild(box);speak(answer,'pl-PL',profile().mentor);
}
async function helpWithExerciseAI(question){
 const style=profile().mentor==='fun'?'fun':'tech';
 const exercise=practice;
 const choices=[...document.querySelectorAll('#exercise [data-choice]')]
  .map(b=>b.dataset.choice);

 const context=[
  'Jesteś nauczycielem pomagającym dziecku w ćwiczeniu.',
  'Aktualne zadanie: '+exercise.question,
  'Rodzaj ćwiczenia: '+exercise.kind,
  'Odpowiedzi do wyboru: '+choices.join(', '),
  'Nie podawaj od razu poprawnej odpowiedzi.',
  'Wyjaśniaj prosto, krok po kroku.',
  'Prośba dziecka: '+question
 ].join('\\n');

 let bubble=document.getElementById('ai-exercise-help');
 if(!bubble){
  bubble=document.createElement('div');
  bubble.id='ai-exercise-help';
  bubble.className='card';
  document.getElementById('exercise')?.appendChild(bubble);
 }
 bubble.textContent='🧠 Bohater zastanawia się...';

 try{
  const response=await fetch('https://akademia-ai.niedzialkowskamagdalena02.workers.dev/mentor-ai',{
   method:'POST',
   headers:{'Content-Type':'application/json'},
   body:JSON.stringify({question:context,mentor:style,history:[]})
  });
  const result=await response.json();
  if(!response.ok||!result.answer)
   throw new Error(result.error||'Brak odpowiedzi AI');

  if(bubble.isConnected)bubble.textContent=result.answer;
  speak(result.answer,'pl-PL',style);
 }catch(err){
  if(bubble.isConnected)
   bubble.textContent='Nie udało się połączyć z AI: '+err.message;
 }
}

async function helpWithGeneralAI(question){
 const style=profile().mentor==='fun'?'fun':'tech';
 const screen=document.querySelector('main');
 const visibleText=String(screen?.innerText||'')
  .slice(0,2500);
 showMicBubble('🧠 Bohater szuka odpowiedzi...');
 try{
  const response=await fetch('https://akademia-ai.niedzialkowskamagdalena02.workers.dev/mentor-ai',{
   method:'POST',
   headers:{'Content-Type':'application/json'},
   body:JSON.stringify({
    question:'Pomóż dziecku. Oto tekst aktualnego ekranu: '
     +visibleText+'\\nPytanie dziecka: '+question,
    mentor:style,
    history:[]
   })
  });
  const result=await response.json();
  if(!response.ok||!result.answer)
   throw new Error(result.error||'Brak odpowiedzi AI');
  showMicBubble(result.answer);
 }catch(err){
  showMicBubble('Nie udało się połączyć z AI: '+err.message);
 }
}

function microphone(){
 const answer=q=>{
  const question=String(q||'').trim();
  if(!question)return;

  if(tab==='mentor' && $('question')){
   $('question').value=question;
   const output=$('mentoranswer');
   if(output)output.textContent='🎙️ Usłyszałem: '+question;
   handle('mentor:answer');
   return;
  }

  if(practice && document.getElementById('exercise')){
   helpWithExerciseAI(question);
   return;
  }

  helpWithGeneralAI(question);
 };

 listen(answer,msg=>{
  const q=prompt(msg+'\\nMożesz wpisać pytanie do mentora:');
  if(q)answer(q);
 });
}

document.addEventListener('click',ev=>{const btn=ev.target.closest('[data-action]');if(btn){if(ev.target.closest('[data-speak]'))return;handle(btn.dataset.action,btn)}});
document.addEventListener('change',ev=>{if(ev.target.id==='trainingSubject')trainingChooseSubject(ev.target.value);if(ev.target.id==='kind')newExercise();if(ev.target.id==='booktrainingpage')bookExercise();if(ev.target.id==='tracechar')drawTrace();if(ev.target.id==='readerpage'){pageId=ev.target.value;render()}if(ev.target.id==='mentorstyle'){profile().mentor=ev.target.value;save()}});
async function start(){try{data=await get('state')||initial();data.bookPages??=[];data.settings.rate??=1;data.settings.songs??=[];await save();render();if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js').catch(console.warn)}catch(err){app.innerHTML=`<main class="wrap"><section class="card"><h2>Nie udało się uruchomić Akademii</h2><p>${e(err.message)}</p><p>Włącz przechowywanie danych w przeglądarce i otwórz stronę ponownie.</p></section></main>`}}
start();

// V24: interaktywny podgląd bazy, bez ingerencji w postępy i zakupy.
(function(){
 const roomCenters={lab:[.25,.28],armory:[.72,.28],hangar:[.25,.73],team:[.72,.73]};
 const names={lab:'🔬 Laboratorium',armory:'🛡️ Zbrojownia',hangar:'🚀 Hangar',team:'🦸 Sala drużyny'};
 const state=new WeakMap();
 function setup(root){if(state.has(root))return state.get(root);const view=root.querySelector('[data-base-viewport]'),world=root.querySelector('[data-base-world]');const s={scale:1,x:0,y:0,pointer:null,moved:false};state.set(root,s);
 const paint=()=>{world.style.transform=`translate(${s.x}px,${s.y}px) scale(${s.scale})`};
 const reset=()=>{s.scale=1;s.x=0;s.y=0;paint()};
 const zoom=(factor)=>{const old=s.scale;s.scale=Math.max(1,Math.min(3.2,s.scale*factor));const w=view.clientWidth,h=view.clientHeight;s.x=w/2-(w/2-s.x)*s.scale/old;s.y=h/2-(h/2-s.y)*s.scale/old;paint()};
 const focus=(room)=>{if(!roomCenters[room])return;s.scale=2;const [rx,ry]=roomCenters[room];s.x=view.clientWidth*(.5-rx*s.scale);s.y=view.clientHeight*(.5-ry*s.scale);paint();root.querySelectorAll('[data-base-room]').forEach(b=>b.classList.toggle('selected',b.dataset.baseRoom===room));let inv={};try{inv=JSON.parse(decodeURIComponent(root.dataset.inventory||''))}catch{};const owned=inv[room]||[];root.querySelector('[data-base-info]').textContent=names[room]+' — '+(owned.length?'W bazie: '+owned.join(', ')+'.':'Tutaj pojawią się odblokowane przedmioty.');};
 view.addEventListener('pointerdown',e=>{if(e.button!==0)return;s.pointer={id:e.pointerId,x:e.clientX,y:e.clientY,ox:s.x,oy:s.y};s.moved=false;view.setPointerCapture(e.pointerId)});
 view.addEventListener('pointermove',e=>{if(!s.pointer||s.pointer.id!==e.pointerId)return;const dx=e.clientX-s.pointer.x,dy=e.clientY-s.pointer.y;if(Math.abs(dx)+Math.abs(dy)>7)s.moved=true;s.x=s.pointer.ox+dx;s.y=s.pointer.oy+dy;paint()});
 view.addEventListener('pointerup',e=>{if(s.pointer?.id===e.pointerId){s.pointer=null;setTimeout(()=>s.moved=false,50)}});
 view.addEventListener('pointercancel',()=>s.pointer=null);
 root.addEventListener('click',e=>{const z=e.target.closest('[data-base-zoom]');if(z){zoom(z.dataset.baseZoom==='in'?1.35:1/1.35);return}if(e.target.closest('[data-base-reset]')){reset();return}const f=e.target.closest('[data-base-fullscreen]');if(f){const full=root.classList.toggle('is-fullscreen');f.textContent=full?'✕':'⛶';document.body.style.overflow=full?'hidden':'';reset();return}const r=e.target.closest('[data-base-room],[data-room]');if(r&&!s.moved)focus(r.dataset.baseRoom||r.dataset.room)});
 root.addEventListener('keydown',e=>{const r=e.target.closest('[data-room]');if(r&&(e.key==='Enter'||e.key===' ')){e.preventDefault();focus(r.dataset.room)}});
 return s}
 const obs=new MutationObserver(()=>{document.querySelectorAll('[data-base-explorer]').forEach(setup);if(!document.querySelector('.base-explorer.is-fullscreen'))document.body.style.overflow=''});
 obs.observe(document.getElementById('app'),{childList:true,subtree:true});document.querySelectorAll('[data-base-explorer]').forEach(setup);
})();

initHeadquarters3D();
