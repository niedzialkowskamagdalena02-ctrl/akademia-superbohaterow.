import {PICTURES80} from './pictures80.js?v=81';
// V80: mechanics contain no textbook content. Every target comes from the selected source pool.
export const GAME_TITLES80={kitchen:'Kuchnia Potworka','letter-race':'Gwiezdny wyścig liter',island:'Wyspa dźwięków',rebus:'Rebus słowny','word-catcher':'Gwiezdny łapacz słów',egg:'Tajemnicze jajo',spot:'Bystre oko',balloon:'Balonowy słowniczek','monster-tf':'Nakarm Potworka · tak czy nie','monster-speak':'Nakarm Potworka · powiedz'};
const esc80=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const shuffle80=a=>{const r=[...a];for(let i=r.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[r[i],r[j]]=[r[j],r[i]]}return r};
const foods80=new Set(['apple','banana','bread','egg','cheese','milk','water','broccoli','tomato','potato','carrot','pear','grape','strawberry','lemon','pizza','cake','rice','juice','butter','sandwich','ice cream']);
const compound80=[['sun','flower','sunflower'],['rain','bow','rainbow'],['car','pet','carpet'],['snow','man','snowman'],['foot','ball','football']];
const phonemes80={apple:['æ','ae'],arm:['ɑː',null],ball:['b','b'],book:['b','b'],bed:['b','b'],banana:['b','b'],bird:['b','b'],blue:['b','b'],bread:['b','b'],milk:['m','m'],monkey:['m','m'],mother:['m','m'],monday:['m','m'],fish:['f','f'],friend:['f','f'],flower:['f','f'],friday:['f','f'],foot:['f','f'],pencil:['p','p'],pen:['p','p'],pig:['p','p'],pink:['p','p'],cat:['k','k'],car:['k','k'],cow:['k','k'],coat:['k','k'],cake:['k','k'],lion:['l','l'],listen:['l','l'],lemon:['l','l'],tree:['t','t'],table:['t','t'],tuesday:['t','t'],tomato:['t','t'],sun:['s','s'],school:['s','s'],socks:['s','s'],sunday:['s','s'],summer:['s','s'],sandwich:['s','s']};
const basicArt80=new Set(['cat','dog','sun','house','book','tree','bird','fish','apple','water','milk','car','ball','flower','school','t shirt','shirt','skirt','shorts','trousers','dress','shoes','hat','socks','listen','think','say','ask','write','read']);
const pictured80=x=>x&&(basicArt80.has(x.en)||!!PICTURES80[x.en]);
const at80=(list,round)=>list[((round%list.length)+list.length)%list.length];
export function buildGames80(pool,round=0){
 const seen=new Set(),words=pool.filter(x=>x?.en&&x?.pl&&x.sourcePageId&&!seen.has(x.en)&&seen.add(x.en));if(words.length<3)return [];
 const single=words.filter(x=>/^[a-z]{2,12}$/.test(x.en)),visual=words.filter(pictured80),out=[];
 const options=(target,list=words)=>shuffle80([target,...shuffle80(list.filter(x=>x.en!==target.en&&x.pl!==target.pl)).slice(0,3)]);
 const add=(kind,target,question,questionPl,extra={})=>{if(!target)return;out.push({game80:kind,type:'game80',question,questionPl,instructionEn:question,instructionPl:questionPl,answer:target.en,wordEn:target.en,promptPl:target.pl,picture:target.picture||'',explanation:'Po angielsku „'+target.pl+'” to „'+target.en+'”.',sourcePageId:target.sourcePageId,sourceBookId:target.sourceBookId,sourceTitle:target.sourceTitle,pageNumber:target.pageNumber,options:[],done:false,correct:false,progress80:0,miss80:false,...extra})};
 if(single.length){for(const [offset,kind] of ['letter-race','egg','balloon'].entries()){const target=at80(single,round+offset);
  const letters=shuffle80([...target.en]),alphabet='abcdefghijklmnopqrstuvwxyz',extra=shuffle80([...alphabet].filter(x=>!target.en.includes(x))).slice(0,3);
  const gaps=[...target.en].map((_,i)=>i).filter(i=>kind==='balloon'&&(i%2===1||target.en.length===2&&i===0));
  add(kind,target,kind==='balloon'?'Pop the missing letters.':'Build the English word.',(kind==='balloon'?'Uzupełnij brakujące litery: ':'Ułóż po angielsku: ')+target.pl+'.',{letters80:letters,picked80:[],slots80:gaps,decoys80:extra,fly80:shuffle80([...new Set([...target.en,...extra])]),flightRounds80:[...target.en].map(c=>shuffle80([c,...shuffle80([...new Set([...target.en,...extra])].filter(x=>x!==c)).slice(0,3)])),ship80:50});
 }}
 if(words.length>=4){const target=at80(words,round+3);add('word-catcher',target,'Catch the English word.','Złap po angielsku: '+target.pl+'.',{items80:options(target),ship80:50});}
 const food=words.filter(x=>foods80.has(x.en));if(food.length>=2){const target=at80(food,round),amount=words.some(x=>x.en==='three')?1+round%3:1;add('kitchen',target,'Listen and fill the order.','Posłuchaj zamówienia i podaj składniki.',{items80:options(target,food),amount80:amount,order80:amount===1?target.en:(amount+' × '+target.en),audio:target.en});}
 const ph=visual.filter(x=>['ae','m'].includes(phonemes80[x.en]?.[1]));if(ph.length&&visual.length>=3){const target=at80(ph,round);add('island',target,'Listen to the sound. Find a word starting with it.','Posłuchaj głoski. Wybierz obrazek słowa, które się nią zaczyna.',{phoneme80:phonemes80[target.en][0],sound80:phonemes80[target.en][1],items80:options(target,visual.filter(x=>x.en===target.en||phonemes80[x.en]?.[0]!==phonemes80[target.en][0]))});}
 const compounds=compound80.filter(parts=>parts.every(en=>words.some(x=>x.en===en))&&parts.slice(0,2).every(en=>pictured80(words.find(x=>x.en===en))));
 if(compounds.length){const parts=at80(compounds,round),target=words.find(x=>x.en===parts[2]);add('rebus',target,'Join the two words. What word do they make?','Połącz dwa słowa z obrazków. Jakie angielskie słowo powstanie?',{parts80:parts.slice(0,2).map(en=>words.find(x=>x.en===en))});}
 if(visual.length>=3){const items=shuffle80(visual).slice(0,Math.min(7,visual.length)),targets=items.slice(0,Math.min(3,items.length));add('spot',targets[0],'Find the objects on the island.','Znajdź rzeczy z listy na wyspie.',{items80:shuffle80(items),targets80:targets.map(x=>x.en),found80:[],answer:'Wszystkie przedmioty',solutions77:targets.map(x=>x.en+' — '+x.pl)});
 const target=at80(visual,round+1),truth=round%2===0,label=truth?target:at80(visual.filter(x=>x.en!==target.en),round);
 add('monster-tf',target,'Does the word match the picture?','Czy podpis pasuje do obrazka?',{image80:target,label80:label.en,answer:truth?'yes':'no',truth80:truth,solutions77:[target.en+' — '+target.pl],explanation:'Obrazek przedstawia: '+target.pl+'. Po angielsku to „'+target.en+'”.'});
 const speech=at80(visual,round+2);add('monster-speak',speech,'Feed the monster. Say the word in English.','Potworek prosi: '+speech.pl+'. Powiedz to po angielsku.',{type:'vocab-speak',vocab76:true,audio:speech.en});
 }
 return out;
}
function picture80(x,art){if(x.cue82)return '<div class="subject82-cue">'+esc80(x.cue82)+'</div>';if(PICTURES80[x.en])return '<img class="g80-picture80" src="assets/games80/pictures/'+PICTURES80[x.en]+'" alt="'+esc80(x.pl)+'" draggable="false">';const visual=basicArt80.has(x.en)?art(x.en):'';return visual||'<span class="g80-emoji" role="img" aria-label="'+esc80(x.pl)+'">'+esc80(x.picture||'')+'</span>';}
const button80=(label,action,cls='',attrs='')=>'<button type="button" class="'+cls+'" data-mg="g80-'+action+'" '+attrs+'>'+label+'</button>';
export function renderGame80(t,{answered=false,mode='game',art=()=>''}={}){
 const k=t.game80,locked=answered?'disabled':'',picture=x=>picture80(x,art),chef='<img class="g80-chef" src="assets/games80/chef.webp" alt="Przyjazny potworek kucharz" draggable="false">';
 let html='<section class="g80-board g80-'+k+(answered?' g80-complete':'')+'"><div class="g80-heading"><span>'+(t.subject82==='matematyka'?'PRZYGODA Z MATEMATYKĄ':t.subject82==='polski'?'PRZYGODA Z POLSKIM':'PRZYGODA ZE SŁÓWKAMI')+'</span><h3>'+esc80(GAME_TITLES80[k])+'</h3></div><p class="g80-en" lang="en">'+esc80(t.question)+'</p><p class="g80-instruction">'+esc80(t.questionPl)+'</p>';
 if(k==='kitchen')html+='<div class="g80-kitchen-scene">'+chef+'<div class="g80-order">'+button80('🔊 Posłuchaj zamówienia','sound','mg-primary')+'<p>Zamówienie: '+t.progress80+' / '+t.amount80+'</p><div class="g80-bowl" aria-hidden="true">'+('✦'.repeat(t.progress80))+'</div></div></div><div class="g80-shelf">'+t.items80.map((x,i)=>button80(picture(x)+'<span lang="en">'+esc80(x.en)+'</span>','item:'+i,'g80-food',locked)).join('')+'</div>';
 if(k==='island')html+=button80('🔊 Posłuchaj głoski','sound','mg-primary')+'<div class="g80-island-scene">'+t.items80.map((x,i)=>button80(picture(x),'item:'+i,'g80-island-object','aria-label="'+esc80(x.pl)+'" '+locked)).join('')+'</div>';
 if(k==='spot')html+='<ul class="g80-find-list">'+t.targets80.map(en=>'<li class="'+(t.found80.includes(en)?'found':'')+'">'+esc80(en)+(t.found80.includes(en)?' ✓':'')+'</li>').join('')+'</ul><div class="g80-island-scene g80-hidden-scene">'+t.items80.map((x,i)=>button80(picture(x),'item:'+i,'g80-island-object '+(t.found80.includes(x.en)?'found':''),'aria-label="'+esc80(x.pl)+'" '+locked)).join('')+'</div><p>Odnalezione: '+t.found80.length+' / '+t.targets80.length+'</p>';
 if(['letter-race','word-catcher'].includes(k)){
  const labels=k==='letter-race'?(t.flightRounds80?.[Math.min(t.progress80,t.answer.length-1)]||t.fly80):t.items80.map(x=>x.en);html+='<div class="g80-space" data-g80-space tabindex="0" aria-label="Plansza kosmiczna. Steruj strzałkami, łap spacją lub dotknij celu."><div class="g80-space-stars" aria-hidden="true">✦ · ✧ · ✦ · ✧</div>'+labels.map((v,i)=>button80('<span lang="en">'+esc80(v)+'</span>','catch:'+i,'g80-falling '+(k==='word-catcher'?'g80-star':'g80-orb'),'data-g80-drop="'+i+'" style="left:'+(k==='word-catcher'?(i%2?75:25):((i+.5)/labels.length*100))+'%;--delay:'+(-i*1.8)+'s;--duration:'+(15+i%3*2)+'s" '+locked)).join('')+'<img class="g80-rocket" data-g80-ship style="left:'+(t.ship80||50)+'%" src="assets/games80/rocket.webp" alt="Rakieta" draggable="false"></div><div class="g80-flight-controls">'+button80('◀','move:-1','','aria-label="Rakieta w lewo" '+locked)+button80('✦ Łap','grab','mg-primary',locked)+button80('▶','move:1','','aria-label="Rakieta w prawo" '+locked)+'</div>';
  if(k==='letter-race')html+='<div class="g80-spelling-slots" role="status">'+[...t.answer].map((c,i)=>'<span>'+(i<t.progress80?esc80(c):'•')+'</span>').join('')+'</div><p>Zebrane litery: '+t.progress80+' / '+t.answer.length+'</p>';
 }
 if(['egg','balloon'].includes(k)){
  const letters=t.letters80,picked=t.picked80.map(i=>letters[i]).join('');
  if(k==='egg')html+='<div class="g80-egg-scene"><div class="g80-shell '+(answered?'hatched':'')+'" style="--crack:'+Math.min(100,picked.length/t.answer.length*100)+'%">'+(answered?'<img src="assets/games80/pictures/hatch.svg" alt="Wykluty pisklak">':'<span class="g80-egg-crack">ϟ</span>')+'</div><div class="g80-picture-cue">'+picture({en:t.wordEn,pl:t.promptPl,picture:t.picture})+'</div></div>';
  if(k==='balloon')html+='<div class="g80-word-gaps" lang="en">'+[...t.answer].map((c,i)=>'<span>'+(!t.slots80.includes(i)||t.progress80>t.slots80.indexOf(i)?esc80(c):'_')+'</span>').join('')+'</div>';
  if(k==='egg')html+='<div class="g80-spelling-slots" role="status">'+[...t.answer].map((c,i)=>'<span>'+esc80(picked[i]||'•')+'</span>').join('')+'</div><div class="g80-letter-tray">'+letters.map((c,i)=>button80(esc80(c),'letter:'+i,'g80-letter',(t.picked80.includes(i)||answered?'disabled':''))).join('')+'</div>'+button80('↩ Cofnij','undo')+button80('✓ Sprawdź słowo','check','mg-primary',locked);
  else html+='<div class="g80-balloon-sky">'+t.fly80.map((c,i)=>button80('<span>'+esc80(c)+'</span>','balloon:'+i,'g80-balloon-target balloon-'+i%5,'style="--delay:'+(-i*.7)+'s" '+locked)).join('')+'</div>';
 }
 if(k==='rebus')html+='<div class="g80-rebus-parts">'+t.parts80.map((x,i)=>(i?'<b aria-label="plus">＋</b>':'')+'<div>'+picture(x)+'<strong lang="en">'+esc80(x.en)+'</strong></div>').join('')+'</div><label for="mg-written">Połącz słowa i wpisz rozwiązanie</label><input id="mg-written" lang="en" autocomplete="off" autocapitalize="none" spellcheck="false" placeholder="Wpisz po angielsku" '+locked+'>'+button80('✓ Sprawdź rebus','check','mg-primary',locked);
 if(k==='monster-tf')html+='<div class="g80-monster-scene">'+chef+'<div class="g80-held-card">'+picture(t.image80)+button80('🔊 '+esc80(t.label80),'label','g80-word-label','lang="en"')+'</div></div><div class="g80-yes-no">'+button80('TAK ✔','bool:yes','g80-yes',locked)+button80('NIE ✖','bool:no','g80-no',locked)+'</div>';
 if(k==='monster-speak')html+='<div class="g80-monster-scene">'+chef+'<div class="g80-speech-bubble">'+picture({en:t.wordEn,pl:t.promptPl,picture:t.picture})+'<strong>'+esc80(t.promptPl)+'</strong></div></div>'+(!answered?button80(t.v76Recording?'⏹ Zakończ wypowiedź':'🎙️ Nakarm głosem','mic','mg-primary '+(t.v76Recording?'v76-recording':'')):'')+(t.v76Transcript?'<p>Usłyszałem: '+esc80(t.v76Transcript)+'</p>':'')+(t.v76Error?'<p role="status">'+esc80(t.v76Error)+'</p>':'');
 if(t.miss80&&!answered)html+='<p class="g80-feedback" role="status">'+(mode==='test'?'Sprawdź swój wybór i spróbuj ponownie.':'Jeszcze nie tym razem. Możesz spokojnie spróbować ponownie.')+'</p>';
 if(answered)html+='<div class="g80-feedback success" role="status">🌟 Udało się! '+esc80(t.solutions77?.join('; ')||(t.wordEn+' — '+t.promptPl))+'</div>';
 html+='<p class="g80-credit"><a href="assets/games80/credits.html" target="_blank" rel="noopener">Autorzy ilustracji i nagrań</a></p>';return html+'</section>';
}
let phonemeAudio80=null;
export function stopGameAudio80(){if(phonemeAudio80){phonemeAudio80.pause();phonemeAudio80=null;}}
export function playPhoneme80(sound,onError=()=>{}){stopGameAudio80();if(!/^(ae|b|m|f|p|k|l|t|s)$/.test(sound))return false;try{const a=new Audio('assets/games80/phoneme-'+sound+'.ogg');phonemeAudio80=a;a.onended=()=>{if(phonemeAudio80===a)phonemeAudio80=null};a.play().catch(onError);return true}catch{onError();return false}}
export function gameAction80(t,act,api){
 if(!t?.game80||!act.startsWith('g80-'))return false;
 const {answer,draw,say,mic,answered,root,mode,save}=api,k=t.game80,a=act.slice(4),word=(x,lang=t.language82||'en-GB')=>say([{text:x,lang,rate:.72}]);
 if(a==='label'){word(t.label80);return true}
 if(a==='sound'){
  if(k==='island'){api.stopSpeech();playPhoneme80(t.sound80,()=>{t.miss80=true;draw()});}
  else if(k==='kitchen')say(Array.from({length:t.amount80},()=>({text:t.audio,lang:'en-GB',rate:.72,pauseAfterMs:450})));
  return true;
 }
 if(answered)return true;
 if(a==='mic'){mic(t);return true}
 const miss=()=>{t.miss80=true;save();draw()};
 if(a.startsWith('item:')){const x=t.items80[Number(a.split(':')[1])];if(!x)return true;
  if(k==='spot'){word(x.en);if(t.targets80.includes(x.en)){if(!t.found80.includes(x.en))t.found80.push(x.en);t.miss80=false;if(t.found80.length===t.targets80.length){t.pendingSpeech80=x.en;answer(t.answer)}else{save();draw()}}else miss();}
  else if(x.en===t.wordEn){if(k==='kitchen'&&++t.progress80<t.amount80){word(x.en);t.miss80=false;save();draw()}else{t.pendingSpeech80=x.en;answer(t.answer)}}else{if(k!=='island'||mode!=='test')word(x.en);miss()}
  return true;
 }
 if(a.startsWith('move:')){t.ship80=Math.max(7,Math.min(93,(t.ship80||50)+Number(a.split(':')[1])*15));const ship=root.querySelector('[data-g80-ship]');if(ship)ship.style.left=t.ship80+'%';save();return true}
 if(a==='grab'){const field=root.querySelector('[data-g80-space]');if(!field)return true;const r=field.getBoundingClientRect(),target=[...field.querySelectorAll('[data-g80-drop]')].map(el=>({el,rect:el.getBoundingClientRect()})).filter(x=>Math.abs((x.rect.left+x.rect.width/2-r.left)/r.width*100-(t.ship80||50))<19).sort((a,b)=>b.rect.bottom-a.rect.bottom)[0];if(target)return gameAction80(t,target.el.dataset.mg,api);miss();return true}
 if(a.startsWith('catch:')){const i=Number(a.split(':')[1]),list=k==='letter-race'?(t.flightRounds80?.[Math.min(t.progress80,t.answer.length-1)]||t.fly80):t.items80.map(x=>x.en);if(!list[i])return true;t.ship80=k==='word-catcher'?(i%2?75:25):(i+.5)/list.length*100;
  if(k==='letter-race'){if(list[i]===t.answer[t.progress80]){t.progress80++;t.miss80=false;if(t.progress80===t.answer.length)answer(t.answer);else{save();draw()}}else miss();}
  else{t.pendingSpeech80=list[i];if(list[i]===t.answer)answer(t.answer);else{word(list[i]);miss()}}return true;
 }
 if(a.startsWith('balloon:')){const c=t.fly80[Number(a.split(':')[1])],expected=t.answer[t.slots80[t.progress80]];if(!c)return true;if(c===expected){t.progress80++;t.miss80=false;if(t.progress80===t.slots80.length)answer(t.answer);else{save();draw()}}else miss();return true}
 if(a.startsWith('letter:')){const i=Number(a.split(':')[1]);if(Number.isInteger(i)&&t.letters80[i]&&!t.picked80.includes(i)){t.picked80.push(i);t.miss80=false;save();draw()}return true}
 if(a==='undo'){t.picked80.pop();t.miss80=false;save();draw();return true}
 if(a==='check'){const value=k==='rebus'?root.querySelector('#mg-written')?.value:t.picked80.map(i=>t.letters80[i]).join('');if(String(value||'').trim().toLocaleLowerCase('pl-PL')===t.answer)answer(t.answer);else miss();return true}
 if(a.startsWith('bool:')){const value=a.split(':')[1];if(value===t.answer)answer(value);else miss();return true}
 return true;
}
// CSS animates falling items. This adapter gives the same scene touch and keyboard controls.
export function mountMotion80(root,t,action){const field=root.querySelector('[data-g80-space]');if(!field)return ()=>{};let active=false;
 const move=e=>{if(!active||e.target.closest?.('button'))return;const r=field.getBoundingClientRect();t.ship80=Math.max(7,Math.min(93,(e.clientX-r.left)/r.width*100));const ship=field.querySelector('[data-g80-ship]');if(ship)ship.style.left=t.ship80+'%'};
 const down=e=>{active=true;move(e)},up=()=>{active=false},key=e=>{if(['ArrowLeft','ArrowRight',' '].includes(e.key)){e.preventDefault();action(e.key===' '?'g80-grab':'g80-move:'+(e.key==='ArrowLeft'?-1:1))}};
 field.addEventListener('pointerdown',down);field.addEventListener('pointermove',move);field.addEventListener('pointerup',up);field.addEventListener('pointercancel',up);field.addEventListener('keydown',key);
 return ()=>{for(const [event,fn] of [['pointerdown',down],['pointermove',move],['pointerup',up],['pointercancel',up],['keydown',key]])field.removeEventListener(event,fn)};
}
