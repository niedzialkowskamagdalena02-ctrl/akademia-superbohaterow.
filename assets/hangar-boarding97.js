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
export const boardingSlots98 = 4;

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
  const otherSpecies = Object.keys(animals).filter(species=>!riders.includes(species));
  const passengerChoices = [...riders,...shuffle92(otherSpecies,random).slice(0,2)];
  const boardTask = (seat, targets, options, prompt, speech) => ({
    kind:'load', seat, targets, count:targets.length, options, prompt, speech, style:turn%3
  });
  return [
    boardTask(false,bagLetters,shuffle92(suitcases,random).map((value,i)=>({
      value,label:'Walizka z literą '+value,words:value+' jak '+letters[value],paint:paint[(turn+i)%paint.length]
    })),'Włóż '+loadCount+' '+letterNote+' do luku.','Włóż '+loadCount+' '+voiceNote+' do luku.'),
    boardTask(true,riders,shuffle92(passengerChoices,random).map((value,i)=>({
      value,label:animals[value].label,pose:(turn+i)%2
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

function petPiece(item, pose) {
  return `<span class="flight98-pet" data-f98-species="${item.value}" data-f98-pose="${pose}" data-f98-color="${item.pose}"
      aria-hidden="true">
    <span class="flight98-pet-shadow"></span>
    <span class="flight98-pet-body">
      <span class="flight98-tail"></span>
      <span class="flight98-leg flight98-leg-left"><i></i></span>
      <span class="flight98-leg flight98-leg-right"><i></i></span>
      <span class="flight98-torso"></span>
      <span class="flight98-arm flight98-arm-left"><i></i></span>
      <span class="flight98-arm flight98-arm-right"><i></i></span>
      <span class="flight98-head">
        <span class="flight98-ear flight98-ear-left"></span><span class="flight98-ear flight98-ear-right"></span>
        <span class="flight98-face">
          <i class="flight98-eye flight98-eye-left"></i><i class="flight98-eye flight98-eye-right"></i>
          <span class="flight98-whiskers"></span>
          <span class="flight98-muzzle"><i></i><b></b></span>
        </span>
      </span>
      ${item.value==='bear'?'<img class="flight99-teddy" src="assets/flight96/bear.webp" alt="" draggable="false">':''}
    </span>
  </span>`;
}

function artFor(item, pose = 'idle') {
  if (!item.paint) return petPiece(item,pose);
  return `<span class="flight96-case" data-f96-color="${item.paint}" aria-hidden="true">
    ${picture96('suitcase')}<b>${item.value}</b></span>`;
}

export function boardingMarkup97(task, state, message, button, listen) {
  const {done, pick} = state;
  const positions = Array.from({length:boardingSlots98}, (_,i) => {
    const label = (task.seat?'Fotel ':'Miejsce w luku ')+(i+1);
    return button('seat:'+i,`<b aria-hidden="true">${i+1}</b>`,
      `class="flight96-slot" data-f95-seat="${i}" data-f96-color="${seatPaint[i]}"
       aria-label="${label}"`);
  }).join('');
  const items = task.options.map((item,i) => `<div class="flight96-piece">
    ${button('bag:'+i,artFor(item),`class="flight96-pick" data-f95-drag="bag:${i}" aria-label="${item.label}" aria-pressed="${pick===i}"`)}
    ${listen(item.words??item.label,'Odsłuchaj: '+item.label)}</div>`).join('');
  const board = task.seat ? `<div class="flight96-cabin-seats">${positions}</div>`
    : `<div class="flight96-airframe">${picture96('aircraft-nose','flight96-nose')}
       <div class="flight96-hatch"><div class="flight96-hold">${positions}</div></div></div>`;
  return `<div class="flight95-surface flight96-baggage flight97-board" data-f96-scene="${task.seat?'cabin':'hold'}"
      data-f97-style="${task.style}" style="--places:${boardingSlots98};--choices:${task.options.length}">
    <div class="flight97-board-world" aria-hidden="true"></div>
    ${pilotCall97(message,done.length+' / '+task.count,button)}
    ${board}
    <div class="flight96-pieces">${items}</div>
  </div>`;
}

export function finishBoarding98(root, message) {
  const board = root.querySelector('.flight97-board');
  board.dataset.f95Win='baggage';
  root.querySelector('[data-game-prompt]').textContent=message;
  board.querySelectorAll('[data-f95-seat],[data-f95-drag]').forEach(control=>{control.disabled=true;});
  board.insertAdjacentHTML('beforeend',`<div class="flight97-board-cheer" aria-hidden="true">${particles}✓</div>`);
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
  destination.innerHTML = artFor(task.options[index],'sit');
}

export function boardingTransfer97(root, task, {index,slot}, point) {
  const board = root.querySelector('.flight97-board');
  const source = root.querySelector('[data-f95-drag="bag:'+index+'"]');
  const destination = root.querySelector('[data-f95-seat="'+slot+'"]');
  if (!board?.animate || !source || !destination || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const area = board.getBoundingClientRect(), from = source.getBoundingClientRect(), to = destination.getBoundingClientRect();
  const riding = task.seat;
  const size = riding ? Math.floor(Math.min(from.width*1.14,to.width*.96,116)) : Math.min(from.width,to.width);
  const x = (point?.x ?? from.left+from.width/2)-area.left;
  const y = (point?.y ?? from.top+from.height/2)-area.top;
  const seatX = to.left+to.width/2-area.left;
  const seatY = to.top+to.height/2-area.top;
  const moving = root.ownerDocument.createElement('div');
  moving.className = 'flight97-transfer';
  moving.style.cssText = `left:${x-size/2}px;top:${y-size/2}px;width:${size}px;height:${size}px`;
  moving.innerHTML = artFor(task.options[index]);
  moving.setAttribute('aria-hidden','true');
  board.append(moving);
  source.dataset.f98Moving='';
  const pet = moving.querySelector('.flight98-pet');
  let tween, stopped = false;
  const play = (pose, frames, duration, easing = 'linear') => {
    if (stopped) return;
    if (pet) pet.dataset.f98Pose=pose;
    tween = moving.animate(frames,{duration,easing,fill:'both'});
    return tween.finished;
  };
  const at = (left,top,scale=1,rotate=0) =>
    ({transform:`translate(${left-x}px,${top-y}px) scale(${scale}) rotate(${rotate}deg)`});
  const animate = async () => {
    if (!pet) {
      await play('load',[at(x,y,.94,-3),at((x+seatX)/2,(y+seatY)/2-18,1.02,6),at(seatX,seatY,.88)],410,'ease-in-out');
      return;
    }
    const floor = to.bottom-area.top+size*.30;
    const aisle = point ? (seatX<area.width/2?1:-1)*size*.37+seatX : area.width*.5;
    const wayY = point ? (y+floor)/2 : Math.max(floor,(y+floor)/2);
    pet.style.setProperty('--facing',aisle<x?-1:1);
    await play('walk',[at(x,y,.91),{...at(aisle,wayY,.98),offset:.57},at(seatX,floor,.96)],940);
    pet.style.setProperty('--facing',1);
    const landing = seatY+3;
    await play('jump',[
      at(seatX,floor,.96),{...at(seatX,floor+4,.90),offset:.19},
      {...at(seatX,landing-size*.44,1.08),offset:.61},at(seatX,landing,.98)
    ],490,'ease-in-out');
    await play('sit',[at(seatX,landing,.98),at(seatX,landing+3,.91),at(seatX,landing,1)],180,'ease-out');
  };
  const finished = animate().finally(()=>{
    moving.remove();
    delete source.dataset.f98Moving;
  });
  return {finished,stop(){stopped=true; tween?.cancel();}};
}
