import {feederPlane96, feederReward96, storm96} from './hangar-art96.js?v=97';

const altitude = [24, 49, 74];
const targetAltitudes = length => length === 2 ? [altitude[0], altitude[2]] : altitude;
const routeSkies = ['day', 'night', 'sunset'];
const art = 'assets/flight95/';
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
})[c]);

export const flightStyles95 = {
  airballs: { target: 'balloon', sky: 'day' },
  feeder: { target: 'cloud', sky: 'day' },
  landing: { target: 'runway', sky: 'runway' },
  seasons: { target: 'season', sky: 'spring' },
  spelling: { target: 'balloon', sky: 'day' },
  fuel: { target: 'tanker', sky: 'day' }
};

export function plane95(extra = '') {
  return `<img class="flight95-plane-art" src="${art}plane.webp" alt="" draggable="false" ${extra}>`;
}

export function shape95(code) {
  const [shape, color = 'cyan'] = String(code).split(' ');
  return `<i class="sq93-shape sq93-${esc(shape)} sq93-${esc(color)}" aria-hidden="true"></i>`;
}

export function voice95(text, lang = 'pl-PL', label = 'Odsłuchaj') {
  return `<button type="button" class="flight95-voice" data-f95-say="${esc(text)}" data-f95-lang="${lang}" aria-label="${esc(label)}" title="${esc(label)}">🔊</button>`;
}

export function surface95(theme, content, cls = '') {
  return `<div class="flight95-surface ${cls}" data-f95-sky="${theme}">${content}</div>`;
}

function target95(item, index, kind, lane, audio) {
  const type = item.value === 'storm' ? 'storm' : kind;
  const graphic = type === 'tanker' ? plane95() : type === 'runway' ? shape95(item.icon)
    : type === 'storm' ? storm96
    : item.icon ? `<span class="flight95-object-icon" aria-hidden="true">${item.icon}</span>` : '';
  return `<div class="flight95-object" data-f95-object data-f95-type="${type}" data-f96-lane="${index}" style="--alt:${lane}%;--color:${index}">
    <button type="button" data-f95-action="aim:${index}" class="flight95-target" aria-label="${esc(item.label)}">
      ${graphic}<b>${type === 'runway' || type === 'storm' ? '<span class="flight95-sr">'+esc(item.label)+'</span>' : esc(item.label)}</b>
    </button>
    ${audio ? voice95(item.words ?? item.label, 'pl-PL', 'Odsłuchaj: ' + item.label) : ''}
  </div>`;
}

export function airMarkup95(id, task, options, { turn, preschool, complete, lastRound }) {
  const { target, sky } = flightStyles95[id];
  const feeder = id === 'feeder', slalom = id === 'airballs';
  const theme = task.theme ?? (sky === 'day' && !slalom && !feeder ? routeSkies[turn % routeSkies.length] : sky);
  const attachment = id === 'spelling' ? `<span class="flight95-banner" data-f95-banner>${esc(task.prompt)}</span>`
    : id === 'fuel' ? '<span class="flight95-hose" aria-hidden="true"></span>' : '';
  const dashboard = id === 'fuel'
    ? '<div class="flight95-fuel"><span>PALIWO</span><progress max="100" value="100" data-f95-fuel aria-label="Paliwo"></progress><b data-f95-percent>100%</b></div>' : '';
  const controls = [
    ['move:up', '▲', 'Wyżej'], ['move:hold', '●', 'Utrzymaj kurs'], ['move:down', '▼', 'Niżej']
  ].map(([action, arrow, label]) => `<div class="flight95-paired">
    <button type="button" data-f95-action="${action}" aria-label="${label}"><span aria-hidden="true">${arrow}</span> ${label}</button>
    ${preschool ? voice95(label, 'pl-PL', 'Odsłuchaj: ' + label) : ''}</div>`).join('');
  const speech = preschool && !slalom && !feeder;
  const targets = complete ? '' : options.map((item, i) =>
    target95(item, i, target, targetAltitudes(options.length)[i], speech)).join('');
  const reward = complete && feeder ? feederReward96(esc(task.answer),esc(task.word),lastRound)
    : complete && slalom ? '<div class="flight96-slalom-win"><strong>6 / 6</strong><span aria-hidden="true">★</span></div>' : '';
  return surface95(theme, `
    <div class="flight95-viewport" data-f95-viewport tabindex="0"
        aria-label="Tor lotu. Przeciągnij w górę lub w dół albo użyj strzałek.">
      <div class="flight95-drift" aria-hidden="true"></div>
      ${targets}
      <div class="flight95-player" data-f95-player>${feeder?feederPlane96(complete):attachment+plane95()}</div>
      ${dashboard}${reward}
    </div>${complete ? '' : `<div class="flight95-steering">${controls}</div>`}`,
    `flight95-air${feeder?' flight96-feeder':slalom?' flight96-slalom':''}${complete?' flight96-air-win':''}`);
}

export function mountAir95(root, { id, options, getFuel, onPass, onEmpty, initialAltitude }) {
  const view = root.querySelector('[data-f95-viewport]');
  const player = view.querySelector('[data-f95-player]');
  const objects = [...view.querySelectorAll('[data-f95-object]')];
  const lanes = targetAltitudes(options.length);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const illustrated = id === 'airballs' || id === 'feeder';
  const slow = id === 'fuel' ? 10.8 : illustrated ? 6.4 : 9.4;
  let elapsed = 0;
  let motionClock = 0;
  let height = initialAltitude ?? altitude[1];
  let targetHeight = height;
  let issued = false;
  let aimed = false;
  let ended = false;
  let frame = 0;
  let last = performance.now();
  let x = 83;
  player.style.setProperty('--pilot-y', height + '%');

  function update(now) {
    if (ended) return;
    const dt = view.ownerDocument.hidden ? 0 : Math.min(.35, Math.max(0, (now - last) / 1000));
    last = now;
    elapsed += dt*(aimed ? 2.1 : 1);
    const approach = Math.min(elapsed / slow, 1.24);
    x = 83 - 63 * approach;
    const yDifference = targetHeight - height;
    height += yDifference * Math.min(1, dt * 9);
    player.style.setProperty('--pilot-y', height + '%');
    player.style.setProperty('--bank', reduced ? '0deg' : (yDifference * .40).toFixed(2) + 'deg');
    motionClock+=dt;
    const size = .68 + Math.min(approach,1)*.32;
    for (let i=0;i<objects.length;i++) {
      const object=objects[i];
      const bob = reduced ? 0 : Math.sin(motionClock*2.15+i*1.5);
      object.style.setProperty('--object-x', x + '%');
      object.style.setProperty('--object-scale', String(size));
      object.style.setProperty('--flight-bob',(bob*4.4).toFixed(1)+'px');
      object.style.setProperty('--flight-sway',(bob*3.2).toFixed(1)+'deg');
    }
    if (getFuel) {
      const fuel = getFuel(dt);
      view.querySelector('[data-f95-fuel]').value = fuel;
      view.querySelector('[data-f95-percent]').textContent = Math.ceil(fuel) + '%';
      if (fuel <= 0) {
        ended = true;
        onEmpty();
        return;
      }
    }
    if (issued && x <= 34 && x >= 10) {
      const hit = lanes.findIndex(y => Math.abs(y - height) < 8);
      if (hit >= 0) {
        ended = true;
        onPass(hit, height);
        return;
      }
    }
    if (approach >= 1.15) elapsed = 0;
    frame = requestAnimationFrame(update);
  }
  frame = requestAnimationFrame(update);

  return {
    aim(index) {
      if (ended || lanes[index] === undefined) return;
      targetHeight = lanes[index];
      issued = true;
      aimed = illustrated;
    },
    steer(direction) {
      if (ended) return;
      const directionIndex = direction === 'up' ? -1 : direction === 'down' ? 1 : 0;
      const current = altitude.reduce((best, y, i) => Math.abs(y - targetHeight) < Math.abs(altitude[best] - targetHeight) ? i : best, 1);
      targetHeight = altitude[Math.max(0, Math.min(altitude.length - 1, current + directionIndex))];
      issued = true;
    },
    steerTo(y) {
      if (ended) return;
      const band = altitude.reduce((best, value) => Math.abs(y - value) < Math.abs(y - best) ? value : best);
      targetHeight = band;
      issued = true;
    },
    stop() {
      ended = true;
      cancelAnimationFrame(frame);
    }
  };
}
