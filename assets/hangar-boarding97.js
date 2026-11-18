import {shuffle92} from './learning-games92.js?v=92';
import {picture96} from './hangar-art96.js?v=97';

const letters = {K:'kot', M:'motyl', S:'sok', A:'arbuz', O:'oko', B:'banan', R:'rower', P:'pies', T:'tor'};
const animals = {
  bear: {label:'Miś', forms:['jednego misia','dwa misie','trzy misie','cztery misie']},
  cat: {label:'Kotek', forms:['jednego kotka','dwa kotki','trzy kotki','cztery kotki']},
  dog: {label:'Piesek', forms:['jednego pieska','dwa pieski','trzy pieski','cztery pieski']}
};
const bags = ['KKK','MM','KMS','OOOO','A','SSS','AK','MSAK','BBO','RR','T','PKO'];
const passengers = [
  ['bear'], ['dog','dog'], ['bear','bear','bear','dog'], ['cat','cat','cat'],
  ['cat'], ['bear','bear','bear','bear'], ['dog','dog','cat'], ['cat','dog'],
  ['dog','dog','dog','dog'], ['cat','cat','bear'], ['dog'], ['cat','bear','dog','dog']
];
const paint = ['purple','blue','green','red','amber','teal','pink'];
const seatPaint = ['orange','yellow','red','blue'];
const bagCount = ['jedną walizkę','dwie walizki','trzy walizki','cztery walizki'];
const format = new Intl.ListFormat('pl',{style:'long',type:'conjunction'});
const pilotImg = '<img src="assets/flight97/pilot.webp" alt="" draggable="false">';
const particles = '<span class="flight96-confetti" aria-hidden="true"></span>';

export const boardingRoundCount97 = bags.length;

export function boardingDeck97(turn, random = Math.random) {
  const bagLetters = [...bags[turn % bags.length]];
  const riders = passengers[turn % passengers.length];
  const singleLetter = new Set(bagLetters).size === 1;
  const loadCount = bagCount[bagLetters.length-1];
  const letterNote = singleLetter ? 'z literą ' + bagLetters[0]
    : 'z literami ' + format.format(bagLetters);
  const voiceNote = singleLetter ? letterNote + ' jak ' + letters[bagLetters[0]]
    : 'z literami '+format.format(bagLetters.map(letter=>letter+' jak '+letters[letter]));
  const riderList = Object.keys(animals).filter(name=>riders.includes(name)).map(name=>
    animals[name].forms[riders.filter(rider=>rider===name).length-1]
  );
  const seatPrompt = 'Posadź '+format.format(riderList)+(riders.length===1?' na fotelu.':' na fotelach.');
  const suitcases = [...bagLetters,...shuffle92(Object.keys(letters).filter(letter=>!bagLetters.includes(letter)),random).slice(0,2)];
  const passengerChoices = [...riders,...shuffle92(['bear','cat','dog','ball','rabbit'],random)
    .sort((a,b)=>Number(riders.includes(a))-Number(riders.includes(b))).slice(0,2)];
  const boardTask = (seat, targets, options, prompt, speech) => ({
    kind:'load', seat, targets, count:targets.length, options, prompt, speech, style:turn%3
  });
  return [
    boardTask(false,bagLetters,shuffle92(suitcases,random).map((value,i)=>({
      value,label:'Walizka z literą '+value,words:value+' jak '+letters[value],paint:paint[(turn+i)%paint.length]
    })),'Włóż '+loadCount+' '+letterNote+' do luku.','Włóż '+loadCount+' '+voiceNote+' do luku.'),
    boardTask(true,riders,shuffle92(passengerChoices,random).map((value,i)=>({
      value,label:animals[value]?.label ?? (value==='ball'?'Piłka':'Królik'),
      icon:value==='ball'?'⚽':'🐰',pose:(turn+i)%2
    })),seatPrompt,seatPrompt)
  ];
}

export function pilotCall97(message, progress, button) {
  return `<div class="flight97-pilot-call">
    <span class="flight97-pilot-face" aria-hidden="true">${pilotImg}<i></i></span>
    <div class="flight97-bubble"><small data-f97-board-progress>${progress}</small>
      <p data-game-prompt>${message}</p></div>
    ${button('read','🔊','class="flight95-voice" aria-label="Odsłuchaj polecenie pilota"')}
  </div>`;
}

function petPiece(item, seated) {
  if (item.value==='bear') return `<span class="flight97-animal flight97-bear" data-f97-pose="${item.pose}">
    ${item.pose?'<img alt="" draggable="false" src="assets/flight97/bear-wave.webp">':picture96('bear')}
  </span>`;
  if (!animals[item.value]) return `<span class="flight96-decoy" aria-hidden="true">${item.icon}</span>`;
  const clips = seated ? ['lap'] : ['step-a','step-b','lap'];
  return `<span class="flight97-animal flight97-walking" data-f97-pose="${item.pose}">
    ${clips.map(pose=>`<img src="assets/hq/pets88/${item.value}-${pose}.webp" alt="" draggable="false">`).join('')}
  </span>`;
}

function artFor(item, seated = false) {
  if (!item.paint) return petPiece(item,seated);
  return `<span class="flight96-case" data-f96-color="${item.paint}" aria-hidden="true">
    ${picture96('suitcase')}<b>${item.value}</b></span>`;
}

export function boardingMarkup97(task, state, message, button, listen) {
  const {done, pick, complete} = state;
  const positions = Array.from({length:task.count}, (_, i) => {
    const loaded = done.find(entry=>entry.slot===i);
    const label = (task.seat?'Fotel ':'Miejsce w luku ')+(i+1);
    const item = loaded && task.options[loaded.index];
    return button('seat:'+i,item?artFor(item,true):`<b aria-hidden="true">${i+1}</b>`,
      `class="flight96-slot" data-f95-seat="${i}" data-f96-color="${seatPaint[(i+task.style)%seatPaint.length]}"
       aria-label="${item ? label+': '+item.label : label}" ${item||complete?'disabled':''} ${item?'data-f95-filled':''}`);
  }).join('');
  const items = task.options.map((item,i) => {
    const loaded=done.some(entry=>entry.index===i);
    return `<div class="flight96-piece">${button('bag:'+i,artFor(item),
      `class="flight96-pick" data-f95-drag="bag:${i}" aria-label="${item.label}" aria-pressed="${pick===i}"
       ${loaded||complete?'disabled':''} ${loaded?'data-f95-loaded':''}`)}
      ${listen(item.words??item.label,'Odsłuchaj: '+item.label)}</div>`;
  }).join('');
  const board = task.seat ? `<div class="flight96-cabin-seats">${positions}</div>`
    : `<div class="flight96-airframe">${picture96('aircraft-nose','flight96-nose')}
       <div class="flight96-hatch"><div class="flight96-hold">${positions}</div></div></div>`;
  return `<div class="flight95-surface flight96-baggage flight97-board" data-f96-scene="${task.seat?'cabin':'hold'}"
      data-f97-style="${task.style}" style="--places:${task.count};--choices:${task.options.length}">
    <div class="flight97-board-world" aria-hidden="true"></div>
    ${pilotCall97(message,done.length+' / '+task.count,button)}
    ${board}
    ${complete ? `<div class="flight97-board-cheer" aria-hidden="true">${particles}✓</div>` : ''}
    <div class="flight96-pieces">${items}</div>
  </div>`;
}

export function canBoard97(task, done, value) {
  const already = done.filter(entry=>task.options[entry.index].value===value).length;
  return already < task.targets.filter(target=>target===value).length;
}

export function syncBoarding97(root, task, placed) {
  const {index,slot} = placed;
  const source = root.querySelector('[data-f95-drag="bag:'+index+'"]');
  const destination = root.querySelector('[data-f95-seat="'+slot+'"]');
  if (!source || !destination) return;
  source.dataset.f95Loaded = '';
  source.disabled = true;
  source.setAttribute?.('aria-pressed','false');
  destination.dataset.f95Filled = '';
  destination.disabled = true;
  destination.setAttribute?.('aria-label',(task.seat?'Fotel ':'Miejsce w luku ')+(slot+1)+': '+task.options[index].label);
  destination.innerHTML = artFor(task.options[index],true);
}

export function boardingTransfer97(root, task, {index,slot}, point) {
  const board = root.querySelector('.flight97-board');
  const source = root.querySelector('[data-f95-drag="bag:'+index+'"]');
  const destination = root.querySelector('[data-f95-seat="'+slot+'"]');
  if (!board?.getBoundingClientRect || !source || !destination || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const area = board.getBoundingClientRect(), from = source.getBoundingClientRect(), to = destination.getBoundingClientRect();
  const width = Math.min(from.width,to.width);
  const x = (point?.x ?? from.left+from.width/2)-area.left-width/2;
  const y = (point?.y ?? from.top+from.height/2)-area.top-width/2;
  const dx = to.left+to.width/2-area.left-width/2-x;
  const dy = to.top+to.height/2-area.top-width/2-y;
  const moving = root.ownerDocument.createElement('div');
  moving.className = 'flight97-transfer';
  moving.style.cssText = `left:${x}px;top:${y}px;width:${width}px;height:${width}px`;
  moving.innerHTML = artFor(task.options[index]);
  moving.setAttribute('aria-hidden','true');
  board.append(moving);
  const tween = moving.animate?.([
    {transform:'translate(0,0) scale(.96) rotate(-4deg)'},
    {transform:`translate(${dx*.55}px,${dy*.5-20}px) scale(1.04) rotate(7deg)`,offset:.57},
    {transform:`translate(${dx}px,${dy}px) scale(.91) rotate(0deg)`}
  ],{duration:410,easing:'cubic-bezier(.24,.58,.27,1)',fill:'both'});
  if (!tween) { moving.remove(); return; }
  return {finished:tween.finished.finally(()=>moving.remove()),stop:()=>tween.cancel()};
}
