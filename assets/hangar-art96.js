const art = 'assets/flight96/';
const digits = ['zero', 'jeden', 'dwa', 'trzy', 'cztery', 'pięć', 'sześć', 'siedem', 'osiem', 'dziewięć'];
const confetti = '<span class="flight96-confetti" aria-hidden="true"></span>';

export const digitWord96 = digit => digits[digit] ?? String(digit ?? '');
export const picture96 = (name, cls = '') =>
  `<img class="${cls}" src="${art}${name}.webp" draggable="false" alt="">`;

export function ring96() {
  return `<span class="flight96-ring-puffs" aria-hidden="true">${Array.from({length:18},(_,i)=>{
    const angle=i*2*Math.PI/18;
    return `<i style="left:${(50+42*Math.cos(angle)).toFixed(1)}%;top:${(50+42*Math.sin(angle)).toFixed(1)}%"></i>`;
  }).join('')}</span>`;
}

export const storm96 = '<span class="flight96-storm" aria-hidden="true"><i></i><i></i><i></i><span>⚡</span></span>';

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
