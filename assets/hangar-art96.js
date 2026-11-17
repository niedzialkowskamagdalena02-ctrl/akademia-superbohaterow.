const art = 'assets/flight96/';
const digits = ['zero', 'jeden', 'dwa', 'trzy', 'cztery', 'pięć', 'sześć'];
const colors = ['purple', 'blue', 'green', 'red', 'amber', 'teal', 'pink'];
const seats = ['orange', 'yellow', 'red', 'blue'];
const confetti = '<span class="flight96-confetti" aria-hidden="true"></span>';

export const digitWord96 = digit => digits[digit];
export const picture96 = (name, cls = '') =>
  `<img class="${cls}" src="${art}${name}.webp" draggable="false" alt="">`;

export function baggageScene96(task, {done, pick, complete}, button, listen) {
  const passenger = task.seat;
  const piece = (item, index) => passenger && item.value === 'bear'
    ? picture96('bear', 'flight96-bear')
    : passenger
      ? `<span class="flight96-decoy" aria-hidden="true">${item.icon}</span>`
      : `<span class="flight96-case" data-f96-color="${colors[index % colors.length]}" aria-hidden="true">
          ${picture96('suitcase')}<b>${item.label}</b></span>`;
  const positions = Array.from({length:task.count}, (_, i) => {
    const loaded = done.find(entry => entry.slot === i);
    const label = (passenger ? 'Fotel ' : 'Miejsce w luku ') + (i+1);
    const contents = loaded ? piece(task.options[loaded.index],loaded.index) : `<b aria-hidden="true">${i+1}</b>`;
    return button('seat:'+i,contents,
      `class="flight96-slot" data-f95-seat="${i}" data-f96-color="${seats[i]}"
        aria-label="${loaded ? label+': '+(passenger?'miś':'walizka '+task.options[loaded.index].label) : label}"
        ${loaded ? 'disabled data-f95-filled' : ''}`);
  }).join('');
  const items = task.options.map((item,i) => {
    const loaded = done.some(entry => entry.index === i);
    const label = passenger ? item.label : 'Walizka z literą '+item.label;
    return `<div class="flight96-piece">${button('bag:'+i,piece(item,i),
      `class="flight96-pick" data-f95-drag="bag:${i}" aria-label="${label}" aria-pressed="${pick===i}"
        ${loaded ? 'disabled data-f95-loaded' : ''}`)}
      ${listen(item.words,'Odsłuchaj: '+label)}</div>`;
  }).join('');
  const board = passenger ? `<div class="flight96-cabin-seats">${positions}</div>`
    : `<div class="flight96-airframe">${picture96('aircraft-nose','flight96-nose')}
       <div class="flight96-hatch"><div class="flight96-hold">${positions}</div></div></div>`;
  return `<div class="flight95-surface flight96-baggage" data-f96-scene="${passenger?'cabin':'hold'}">
    ${board}
    ${complete ? `<div class="flight96-ready">${confetti}<span aria-hidden="true">✓</span>
      <strong>${passenger?'Bagaże i pasażerowie na pokładzie!':'Walizki w luku!'}</strong></div>` : ''}
    <div class="flight96-pieces">${items}</div>
  </div>`;
}

export function takeoffStarter96(button) {
  return `<div class="flight95-surface flight96-takeoff flight96-start-runway">
    <div class="flight96-windshield" aria-hidden="true"></div>
    ${picture96('instruments','flight96-instruments')}
    <div class="flight96-throttle" data-f95-lever>
      ${button('lever',`${picture96('lever','flight96-lever-art')}<b>Pociągnij dźwignię</b>`,
        'aria-label="Pociągnij dźwignię w dół"')}
    </div>
  </div>`;
}

export function ring96() {
  return `<span class="flight96-ring-puffs" aria-hidden="true">${Array.from({length:18},(_,i)=>{
    const angle=i*2*Math.PI/18;
    return `<i style="left:${(50+42*Math.cos(angle)).toFixed(1)}%;top:${(50+42*Math.sin(angle)).toFixed(1)}%"></i>`;
  }).join('')}</span>`;
}

export const storm96 = '<span class="flight96-storm" aria-hidden="true"><i></i><i></i><i></i><span>⚡</span></span>';

export function cockpitFlight96(won) {
  return `<div class="flight96-windshield" aria-hidden="true"></div>
    ${picture96('instruments','flight96-instruments')}
    ${won ? `<div class="flight96-ring-win">${confetti}
       <div class="flight96-ring" aria-hidden="true">${ring96()}<b>4</b></div>
       <strong>Wszystkie cyfry zaliczone!</strong></div>` : ''}`;
}

export function feederPlane96(fed = false) {
  return `${picture96('feeder-plane','flight96-feeder-jet')}
    ${picture96('chick','flight96-chick')}${picture96('bowl','flight96-bowl')}
    ${fed ? '<span class="flight96-grain" aria-hidden="true">✦</span>' : ''}`;
}

export function feederReward96(letter, word, done) {
  return `<div class="flight96-feeder-reward">${done ? confetti : ''}
    <div class="flight96-letter-cloud" aria-hidden="true"><b>${letter}</b></div>
    <strong>${done?'Ptaszek nakarmiony!':'Tak, to głoska „'+letter+'”!'}</strong>
    <span>${letter} jak ${word}</span>
  </div>`;
}
