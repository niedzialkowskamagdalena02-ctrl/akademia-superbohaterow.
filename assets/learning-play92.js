import {
 awardNames92,gameGroup92,masterLevels92,mathRound92,
 preschoolGames92,preschoolRound92,schoolGames92,table92
} from './learning-games92.js?v=92';
import {mountTrace92} from './learning-trace92.js?v=93';

const spriteRoot='assets/games80/pictures/';
const puzzles=[
 ['Tygrys','assets/learning92/tiger.webp','🐯'],
 ['Dinozaur','assets/learning92/dino.webp','🦕'],
 ['Kosmos','assets/games80/rocket.webp','🚀']
];
const gardenPlaces=[[12,28],[31,46],[61,27],[84,38],[17,64],[43,61],[71,67],[35,83],[87,82]];
const chestPlaces=[[13,66],[28,53],[42,70],[57,48],[72,61],[86,34]];
const mathGames=new Set(schoolGames92.map(([id])=>id));
const autoAdvance=new Map([['race',850],['balloons',520],['puzzle',650]]);
const clockTime=10;
const htmlEscape=text=>String(text).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const control=(label,action,extra='')=>`<button type="button" data-lg92="${action}" ${extra}>${label}</button>`;
const picture=(file,alt='')=>`<img src="${spriteRoot+file}.svg" alt="${htmlEscape(alt)}" draggable="false">`;

let dispose=()=>{};
export function mountLearningGames92(root,{grade,catalogExtra='',speak=()=>{},tap=()=>{},awards=()=>({}),onAward=()=>{}}={}){
 dispose();dispose=()=>{};
 if(!root)return;
 const group=gameGroup92(grade);
 if(!group)return;
 const games=group==='preschool'?preschoolGames92:schoolGames92;
 const events=new AbortController(),{signal}=events;
 let game='',state,lower=false,factor=0,art=0,responseTimer=0,clock=0,deadline=0;

 function clearTimers(){
  clearTimeout(responseTimer);responseTimer=0;
  clearInterval(clock);clock=0;
 }
 dispose=()=>{clearTimers();events.abort();};
 function focus(selector){root.querySelector(selector)?.focus({preventScroll:true});}
 function announce(message){
  const status=root.querySelector('[data-lg92-feedback]');
  if(status)status.textContent=message;
 }
 function catalog(){
  game='';clearTimers();root.dataset.game='';
  root.innerHTML=`<h2 tabindex="-1">${group==='school'?'Gry mnożeniowe':'Gry z literami i liczbami'}</h2>
   ${catalogExtra}<div class="lg92-catalog">${games.map(([id,icon,name,desc])=>{
    const award=awards()[id]&&awardNames92[id];
    return `<button type="button" class="lg92-card" data-lg92="open-${id}">
     <span aria-hidden="true">${icon}</span><strong>${name}</strong><small>${desc}</small>
     ${award?`<span class="lg92-award-earned">${award}</span>`:''}</button>`;
   }).join('')}</div>`;
  focus('h2');
 }
 function open(id){
  if(!games.some(([key])=>key===id))return;
  clearTimers();game=id;state=null;root.dataset.game=id;
  if(game==='trace'){
   render('<div data-lg92-trace></div>');
   mountTrace92(root.querySelector('[data-lg92-trace]'),{speak,tap});
   focus('h2');return;
  }
  briefing();
 }
 function briefing(){
  const description=games.find(([id])=>id===game)[3];
  const modes=game==='letters'?`<div class="lg92-mode" aria-label="Wielkość liter">
   ${control('Wielkie litery','upper',`aria-pressed="${!lower}"`)}
   ${control('Małe litery','lower',`aria-pressed="${lower}"`)}
  </div>`:'';
  const table=game==='timer'?`<label for="lg92-factor">Co ćwiczymy?</label><select id="lg92-factor">
   <option value="0">Wymieszane działania</option>
   ${table92.map(n=>`<option value="${n}" ${factor===n?'selected':''}>Mnożenie przez ${n}</option>`).join('')}
  </select>`:'';
  const images=game==='puzzle'?`<fieldset class="lg92-puzzle-picker"><legend>Wybierz obrazek</legend>
   ${puzzles.map(([name,,icon],i)=>`<label><input type="radio" name="lg92-art" value="${i}" ${i===art?'checked':''}>
    <span><i aria-hidden="true">${icon}</i>${name}</span></label>`).join('')}
  </fieldset>`:'';
  render(`<div class="lg92-brief"><p>${description}</p>${modes}${table}${images}
   ${control('▶ Zaczynamy','start','class="lg92-primary"')}
  </div>`);
  focus('h2');
 }
 function render(body){
  const [,icon,title]=games.find(([id])=>id===game);
  root.innerHTML=`<header class="lg92-header">${control('‹ Wszystkie gry','catalog')}
   <h2 tabindex="-1"><span aria-hidden="true">${icon} </span>${title}</h2>
  </header><div class="lg92-body">${body}</div>`;
 }
 function loadTasks(){
  state.tasks=mathGames.has(game)?mathRound92(game,grade,{factor,level:state.level}):preschoolRound92(game,{lower});
  state.index=0;state.gate=[];state.phase=game==='treasure'?'map':'answer';
 }
 function start(){
  clearTimers();
  factor=Number(root.querySelector('#lg92-factor')?.value??factor);
  art=Number(root.querySelector('[name="lg92-art"]:checked')?.value??art);
  state={score:0,streak:0,stars:0,level:0,phase:'answer',missed:[]};
  loadTasks();showTurn(true);
 }
 function activeTask(){return state.tasks[state.index];}
 function progress(){
  const {index,tasks,stars,level,score}=state;
  const right=game==='balloons'||game==='order'?'⭐ '+stars:
   game==='treasure'?'🪙 '+score:game==='timer'?'Punkty '+score:'';
  const title=game==='master'?'Poziom '+(level+1)+' z 4 · '+masterLevels92[level]:
   game==='missing'?'Poziom '+(activeTask().stage+1)+' z 3':'';
  return `<div class="lg92-progress">
   <div>${title?`<strong>${title}</strong> · `:''}${index+1} / ${tasks.length}</div>
   ${right?`<strong data-lg92-counter>${right}</strong>`:''}
  </div>`;
 }
 function taskTitle(task){
  const value=game==='letters'?`<span class="lg92-big-letter" aria-hidden="true">${task.cue}</span>`:'';
  return `<div class="lg92-prompt"><div><h3 tabindex="-1" data-lg92-prompt>${task.prompt}</h3>${value}</div>
   ${control('🔊','listen','class="lg92-listen" aria-label="Odsłuchaj polecenie"')}
  </div>`;
 }
 function mathOptions(task){
  const buttons=`<div class="lg92-options">${task.options.map((n,i)=>control(n,'pick-'+i)).join('')}</div>`;
  if(game!=='missing')return buttons;
  return buttons+`<form class="lg92-write" data-lg92-answer-form>
   <label for="lg92-write-number">Lub wpisz liczbę</label>
   <div><input id="lg92-write-number" type="text" inputmode="numeric" maxlength="3" pattern="[0-9]+" autocomplete="off" required>
   <button type="submit">Sprawdź</button></div>
  </form>`;
 }
 function race(track){
  return `<div class="lg92-race" data-lg92-race style="--race-at:${track}%">
   <div class="lg92-track-stripes"></div><span class="lg92-finish" aria-hidden="true">🏁</span>
   <div class="lg92-rocket-car">${picture('car')}</div>
  </div>`;
 }
 function balloons(task){
  return `<div class="lg92-balloons" style="--balloon-time:${Math.max(2.55,5.5-state.index*.43)}s">
   ${task.options.map((n,i)=>control(n,'pick-'+i,`class="lg92-balloon" style="--balloon-color:${['#f85476','#685bdc','#1985d9'][i]};--lift-delay:-${i*.43}s"`)).join('')}
  </div>`;
 }
 function puzzle(){
  const [name,src]=puzzles[art];
  return `<div class="lg92-puzzle" role="img" aria-label="Obrazek ${name}. Odkryte elementy: ${state.score} z 9."
   style="--puzzle:url('${src}')">
   ${Array.from({length:9},(_,i)=>`<span data-lg92-piece="${i}" style="--tile-x:${i%3*50}%;--tile-y:${Math.floor(i/3)*50}%" ${i<state.score?'data-revealed':''} aria-hidden="true">${i+1}</span>`).join('')}
  </div>`;
 }
 function treasureMap(){
  return `<div class="lg92-map" aria-label="Mapa skarbów">${chestPlaces.map(([x,y],i)=>{
   const opened=i<state.index||i===state.index&&state.phase==='solved';
   const label=opened?'Otwarta skrzynia':i===state.index?'Otwórz skrzynię '+(i+1):'Zamknięta skrzynia';
   return `<span class="lg92-chest-place" style="--at-x:${x}%;--at-y:${y}%">
    ${control(opened?'🪙':'<span class="lg92-chest" aria-hidden="true"></span>','chest-'+i,
     `aria-label="${label}" ${i===state.index&&state.phase==='map'?'data-openable':'disabled'}`)}
   </span>`;
  }).join('')}</div>`;
 }
 function preschoolOptions(task){
  if(game==='hidden'){
   return `<div class="lg92-garden" aria-label="Poszukiwania cyfr w ogrodzie">${task.options.map((n,i)=>
    control(n,'pick-'+i,`class="lg92-hidden-number" style="--at-x:${gardenPlaces[i][0]}%;--at-y:${gardenPlaces[i][1]}%"`)).join('')}</div>
    <p data-lg92-found role="status">Znaleziono 0 z ${task.count}</p>`;
  }
  if(game==='order'){
   return `<div class="lg92-order-list" aria-label="Ułożone litery">${task.answer.map((_,i)=>`<span data-lg92-slot="${i}">·</span>`).join('')}</div>
    <div class="lg92-options">${task.options.map((l,i)=>control(l,'pick-'+i)).join('')}</div>`;
  }
  if(task.pictures)return `<div class="lg92-options lg92-pictures">${task.pictures.map(({image,name},i)=>
   control(picture(image),'pick-'+i,`aria-label="${htmlEscape(name)}"`)).join('')}</div>`;
  const apple=task.apples?`<div class="lg92-apples" aria-label="Jabłka do policzenia">
   ${Array.from({length:task.apples},()=>picture('apple','Jabłko')).join('')}</div>`:'';
  const rhyme=task.rhyme?`<div class="lg92-rhyme">${picture(task.image)}<p>${task.rhyme}</p></div>`:'';
  return apple+rhyme+`<div class="lg92-options">${task.options.map((n,i)=>control(task.lower?n.toLowerCase():n,'pick-'+i)).join('')}</div>`;
 }
 function showTurn(read=false){
  const task=activeTask();
  const feedback='<p class="lg92-feedback" data-lg92-feedback role="status"></p>';
  const next=control('Dalej →','next','class="lg92-primary lg92-next" hidden');
  const counter=game==='timer'?`<div class="lg92-clock"><progress max="${clockTime}" value="${clockTime}" aria-label="Czas na odpowiedź"></progress>
   <strong data-lg92-seconds>${clockTime} s</strong></div>`:'';
  const stage=game==='race'?race(state.score/state.tasks.length*100):game==='puzzle'?puzzle():
   game==='treasure'?treasureMap():'';
  if(state.phase==='map'){
   render(progress()+stage+`<p>Dotknij świecącej skrzyni.</p>${feedback}`);
   focus('[data-openable]');return;
  }
  const options=game==='balloons'?balloons(task):mathGames.has(game)?mathOptions(task):preschoolOptions(task);
  render(progress()+counter+taskTitle(task)+stage+options+feedback+next);
  focus('[data-lg92-prompt]');
  if(read&&!mathGames.has(game))speak(task.speech);
  if(game==='timer')startClock();
 }
 function updateClock(){
  const left=Math.max(0,(deadline-Date.now())/1000);
  root.querySelector('progress').value=left;
  root.querySelector('[data-lg92-seconds]').textContent=Math.ceil(left)+' s';
  if(left>0)return;
  clearTimers();
  const task=activeTask();
  state.missed.push(task.equation);
  lockTurn();
  announce('Czas minął. '+task.equation+'.');
  revealNext(true);
 }
 function startClock(){
  deadline=Date.now()+clockTime*1000;
  clock=setInterval(updateClock,100);
 }
 function lockTurn(){
  state.phase='solved';
  for(const el of root.querySelectorAll('[data-lg92^="pick-"],[data-lg92-answer-form] input,[data-lg92-answer-form] button'))el.disabled=true;
 }
 function revealNext(shouldFocus=false){
  const next=root.querySelector('[data-lg92="next"]');
  if(next){next.hidden=false;if(shouldFocus)next.focus({preventScroll:true});}
 }
 function pick(index,target){
  if(state?.phase!=='answer')return;
  const task=activeTask();
  if(game==='hidden'){
   if(task.options[index]!==task.answer)return wrong(target);
   if(state.gate.includes(index))return;
   state.gate.push(index);target.dataset.hit='';target.disabled=true;
   root.querySelector('[data-lg92-found]').textContent='Znaleziono '+state.gate.length+' z '+task.count;
   if(state.gate.length===task.count)correct(target,'Brawo! Wszystkie odnalezione.');
   return;
  }
  if(game==='order'){
   const letter=task.options[index];
   if(letter!==task.answer[state.gate.length])return wrong(target);
   root.querySelector('[data-lg92-slot="'+state.gate.length+'"]').textContent=letter;
   state.gate.push(letter);target.disabled=true;
   if(state.gate.length===task.answer.length){
    state.stars++;correct(target,'Świetnie! Cały zestaw w dobrej kolejności.');
   }
   return;
  }
  submit(task.pictures?.[index]?.image??task.options?.[index],target);
 }
 function submit(value,target){
  if(state?.phase!=='answer')return;
  if(game==='timer'&&Date.now()>=deadline){updateClock();return;}
  const task=activeTask();
  if(value!==task.answer)return wrong(target);
  correct(target,task.success??(mathGames.has(game)?'Dobrze! '+task.equation+'.':'Brawo! Dobra odpowiedź.'));
 }
 function wrong(target){
  if(game==='balloons'){
   state.streak=0;
   announce('Spróbuj jeszcze raz. Seria zaczyna się od nowa.');
  }else announce('Spróbuj jeszcze raz.');
  if(!matchMedia('(prefers-reduced-motion: reduce)').matches)target?.animate?.([{translate:'0'},{translate:'-5px'},{translate:'5px'},{translate:'0'}],{duration:250});
 }
 function correct(target,message){
  clearTimers();lockTurn();state.score++;
  if(game==='balloons'){
   if(++state.streak%3===0){state.stars++;message+=' ⭐ Gwiazdka za trzy trafienia z rzędu!';}
   if(target)target.dataset.pop='';
  }
  if(game==='race'){
   const car=root.querySelector('[data-lg92-race]');
   car.style.setProperty('--race-at',state.score/state.tasks.length*100+'%');
   car.dataset.speed='';
  }
  if(game==='puzzle'){
   const piece=root.querySelector('[data-lg92-piece="'+(state.score-1)+'"]');
   piece.dataset.revealed='';
   piece.parentElement.setAttribute('aria-label','Odkryte elementy: '+state.score+' z 9.');
  }
  const counter=root.querySelector('[data-lg92-counter]');
  if(counter)counter.textContent=game==='treasure'?'🪙 '+state.score:
   game==='timer'?'Punkty '+state.score:'⭐ '+state.stars;
  if(game==='treasure')root.querySelector('.lg92-map').outerHTML=treasureMap();
  announce(message);
  if(!mathGames.has(game))speak(message);
  if(autoAdvance.has(game))responseTimer=setTimeout(advance,autoAdvance.get(game));
  else if(game==='timer')responseTimer=setTimeout(advance,600);
  else revealNext(true);
 }
 function advance(){
  clearTimers();
  if(state?.phase!=='solved')return;
  if(state.index+1<state.tasks.length){
   state.index++;state.gate=[];state.phase=game==='treasure'?'map':'answer';showTurn(true);return;
  }
  if(game==='master'&&state.level+1<masterLevels92.length){
   state.phase='between';
   render(`<div class="lg92-end"><span aria-hidden="true">⭐</span><h3>Poziom ${state.level+1} ukończony!</h3>
    <p>Dalej: ${masterLevels92[state.level+1].toLowerCase()}.</p>
    ${control('Następny poziom →','level','class="lg92-primary"')}</div>`);
   focus('[data-lg92="level"]');return;
  }
  finish();
 }
 function finish(){
  state.phase='done';
  if(awardNames92[game]){
   const message=root.closest('.lg92-shell')?.querySelector('[data-lg92-save]');
   if(message)message.textContent='';
   Promise.resolve(onAward(game)).catch(()=>{
    if(message?.isConnected)message.textContent='Zagrałeś do końca. Zapis odznaki się nie powiódł.';
   });
  }
  const victory={race:'🏆 Meta! Zdobywasz puchar!',balloons:'🎈 Koniec łapania balonów!',
   timer:'⏱️ Koniec rundy!',puzzle:'🧩 Obrazek odkryty!',missing:'⭐ Wszystkie liczby uzupełnione!',
   treasure:'🏴‍☠️ Wielki skarb zdobyty!',master:'🏅 Medal Mistrza Mnożenia!',order:'⭐ Alfabet ułożony!'};
  const title=victory[game]??'⭐ Brawo! Zabawa ukończona!';
  const extra=game==='puzzle'?puzzle():game==='treasure'?'<div class="lg92-big-treasure" aria-hidden="true">🪙<span class="lg92-chest"></span>🪙</div>':'';
  const results=game==='balloons'||game==='order'?'Zdobyte gwiazdki: '+state.stars:
   game==='treasure'?'Monety znalezione na wyspie: '+state.score:
   game==='timer'?'Trafienia: '+state.score+' z '+state.tasks.length:'';
  const errors=state.missed.length?`<details><summary>Działania do powtórki</summary>
   <ul>${state.missed.map(equation=>`<li>${equation}</li>`).join('')}</ul></details>`:'';
  render(`<div class="lg92-end"><h3 tabindex="-1" data-lg92-victory>${title}</h3>${extra}
   ${results?`<p>${results}</p>`:''}${errors}${control('Zagraj ponownie','retry','class="lg92-primary"')}</div>`);
  focus('[data-lg92-victory]');
 }

 root.addEventListener('click',event=>{
  const button=event.target.closest('[data-lg92]');
  if(!button||button.disabled)return;
  const action=button.dataset.lg92;
  tap();
  if(action.startsWith('open-'))return open(action.slice(5));
  if(action==='catalog')return catalog();
  if(action==='start')return start();
  if(action==='listen'&&state)return speak(activeTask().speech);
  if(action==='upper'||action==='lower'){lower=action==='lower';return briefing();}
  if(action==='retry')return briefing();
  if(action==='next')return advance();
  if(action==='level'&&state?.phase==='between'){state.level++;loadTasks();return showTurn();}
  if(action.startsWith('pick-'))return pick(Number(action.slice(5)),button);
  if(action.startsWith('chest-')&&game==='treasure'&&state?.phase==='map'&&Number(action.slice(6))===state.index){
   state.phase='answer';showTurn();
  }
 },{signal});
 root.addEventListener('submit',event=>{
  if(game!=='missing'||!event.target.matches('[data-lg92-answer-form]'))return;
  event.preventDefault();
  const input=event.target.querySelector('input');
  tap();submit(Number(input.value),input);
 },{signal});
 catalog();
}
