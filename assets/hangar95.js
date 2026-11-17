import {captainMissions93, aceMissions93, missionDeck93} from './missions93-data.js?v=93';
import {gameGroup92, shuffle92} from './learning-games92.js?v=92';
import {paintWorld} from './missions93.js?v=95';
import {airMarkup95, flightStyles95, mountAir95, plane95, shape95, surface95, voice95} from './hangar-flight95.js?v=95';

const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
})[c]);
const scenes = {
  baggage: ['cabin','🧳'], takeoff: ['cockpit','🛫'], airballs: ['day','🎈'],
  feeder: ['day','🐦'], parcels: ['islands','📦'], landing: ['runway','🔶'],
  seasons: ['autumn','🍁'], engine: ['cockpit','🔢'], spelling: ['sunset','Ó'],
  fuel: ['day',''], radar: ['radar','📡'], cargo: ['cargo','📦'],
  radio: ['islands','🎧'], airport: ['airport','💬']
};
const directions = {left:['◀','W lewo'], up:['▲','W górę'], down:['▼','W dół'], right:['▶','W prawo']};
const islands = [['red','Czerwona'],['blue','Niebieska'],['green','Zielona']];
const mapLocations = [[48,13],[50,55],[85,70],[59,90]];
const seasonScenes = ['spring','islands','autumn','winter'];
const seasonExtra = [
  [['Bocian','🕊️'],['Bałwan','⛄'],['Kasztan','🌰']],
  [['Plażowa piłka','🏖️'],['Płatek śniegu','❄️'],['Jesienny liść','🍁']],
  [['Jarzębina','🍒'],['Kwitnący krokus','🌷'],['Sanki','🛷']],
  [['Sanki','🛷'],['Kwitnący tulipan','🌷'],['Dojrzała truskawka','🍓']]
];
const buttons = (action, label, attrs = '') => `<button type="button" data-f95-action="${action}" ${attrs}>${label}</button>`;
const obj = (label, value = label, icon = '') => ({label,value,icon,words:String(label)});
const icon = value => `<span aria-hidden="true">${value}</span>`;

export function hangarDeck95(id, grade, random = Math.random) {
  const deck = missionDeck93(id, grade, random);
  if (id !== 'seasons') return deck;
  return deck.flatMap((task, index) => {
    const level = {...task, theme:seasonScenes[index]};
    const more = seasonExtra[index].map(([label, symbol], i) => obj(label, i ? 'no'+i : 'yes', symbol));
    return [level, {...level,options:shuffle92(more,random)}];
  });
}

export function nextAirObjects95(id, number, random = Math.random) {
  const alternative = number === 1 ? 3 : number - 1;
  return shuffle92([
    obj(number), obj(alternative),
    id === 'airballs' ? obj('Chmura burzowa','storm','⛈') : obj(number+1)
  ], random);
}

let unmount = () => {};

export function mountHangar95(root,{grade,legacy=false,speak=()=>{},tap=()=>{},tone=()=>{}} = {}) {
  unmount();
  unmount = () => {};
  if (!root) return;
  const preschool = gameGroup92(grade) === 'preschool';
  const games = preschool ? captainMissions93 : aceMissions93;
  const controller = new AbortController(), {signal} = controller;
  let id = '', deck = [], round = 0, state, gesture, air, delayed = 0, swallowClick = 0;
  const task = () => deck[round];
  const game = () => games.find(row => row[0] === id);
  const get = selector => root.querySelector(selector);
  const say = (text, lang) => speak(String(text), lang ?? 'pl-PL');
  const audio = (text, lang, label) => voice95(text, lang, label);
  const forChild = (text, label) => preschool ? audio(text, 'pl-PL', label) : '';
  const paired = (button, label) => `<div class="flight95-paired">${button}${forChild(label, 'Odsłuchaj: '+label)}</div>`;
  const close = '<button type="button" class="flight95-exit" data-action="hq:close" aria-label="Wysiądź z samolotu">✕ <span>Wysiądź</span></button>';
  const top = (title, back = '') => `<header class="flight95-top">${back}
    <h2 tabindex="-1">${esc(title)}</h2>${close}</header>`;

  function stop() {
    air?.stop();
    air = null;
    clearTimeout(delayed);
  }
  unmount = () => { stop(); controller.abort(); };
  function setContent(content, side = '') {
    root.innerHTML = content;
    root.dataset.fl95Mode = side;
    root.closest?.('.hq95-cockpit-panel')?.scrollTo?.({top:0});
  }
  function focusHeading() { root.querySelector('h2')?.focus?.({preventScroll:true}); }
  function report(message) {
    const status = get('[data-f95-report]');
    if (status) status.textContent = message;
  }
  function catalog(focus = false) {
    stop(); id = ''; state = null; gesture = null;
    const title = preschool ? 'Mały Kapitan' : 'As Przestworzy';
    setContent(top(title)+`<section class="flight95-menu">
      <div class="flight95-hero">
        <div><h3>Wybierz misję w kokpicie</h3>${forChild('Jesteś w kokpicie. Wybierz misję lotniczą.', 'Odsłuchaj instrukcję kokpitu')}</div>
      </div>
      <div class="flight95-missions">${games.map(([key,,name,desc],i) => `<div class="flight95-card">
        ${buttons('mission:'+key,`<span class="flight95-card-image" data-f95-sky="${scenes[key][0]}"><i>${i+1}</i>
          ${key === 'fuel' ? plane95() : icon(scenes[key][1])}</span><strong>${esc(name)}</strong>`)}
        ${forChild(name+'. '+desc,'Odsłuchaj: '+name)}</div>`).join('')}</div>
      ${legacy?'<button type="button" class="flight95-classic" data-action="hq:flight">✈ Klasyczny lot Quinjetem</button>':''}
    </section>`, 'menu');
    if (focus) focusHeading();
  }
  function open(key) {
    if (!games.some(item => item[0] === key)) return;
    id = key;
    const intro = game()[3];
    setContent(top(game()[2], buttons('catalog','‹ Kokpit','class="flight95-back"'))+
      surface95(scenes[id][0],`<div class="flight95-intro-body">${plane95()}
        <div class="flight95-brief"><div><strong>Misja ${games.indexOf(game())+1}</strong><p>${esc(intro)}</p></div>
        ${audio(intro,'pl-PL','Odsłuchaj polecenie')}</div>
        ${paired(buttons('start', 'Rozpocznij misję', 'class="flight95-primary"'),'Rozpocznij misję')}</div>`,'flight95-intro'), 'brief');
    focusHeading();
    if (preschool) say(intro);
  }
  function begin() {
    round = 0;
    deck = hangarDeck95(id,grade);
    newRound();
  }
  function newRound() {
    stop();
    state = {
      phase: id === 'takeoff' ? 'lever' : id === 'cargo' ? 'load' : id === 'airport' && round === 0 ? 'arrival' : 'play',
      done: [], pick: null, location: null, height: 49, fuel: 100,
      digits: '', step: 0, crates: [], flightObject: null, complete: false
    };
    if (task().kind === 'flightSequence') state.options = nextAirObjects95(id, task().needed[0]);
    draw();
    if (preschool || task().lang) readTask();
  }
  function readTask() {
    const t = task();
    if (id === 'takeoff' && state.phase === 'code') return say('Naciśnij po kolei: jeden, dwa, trzy, cztery.');
    if (id === 'takeoff' && state.phase === 'air') return say('Przeleć przez obręcz z liczbą '+t.needed[state.step]+'.');
    if (id === 'airport' && state.phase === 'arrival') return say('Wyląduj i połącz się z kontrolą lotniska.');
    say(t.speech,t.lang);
  }
  function draw(message = '') {
    stop();
    const t = task();
    const count = id === 'takeoff' || id === 'airballs' ? t.needed.length : deck.length;
    const current = t.kind === 'flightSequence' ? state.step + 1 : round + 1;
    const prompt = id === 'takeoff' && state.phase === 'code' ? 'Włącz przełączniki w kolejności 1 → 2 → 3 → 4.'
      : id === 'airport' && state.phase === 'arrival' ? 'Podejdź do odprawy po wylądowaniu.' : t.prompt;
    const lang = t.lang ?? 'pl-PL';
    const taskLine = `<div class="flight95-task"><div><small>${Math.min(current,count)} / ${count}</small>
      <p data-game-prompt lang="${lang}">${esc(prompt)}</p></div>${buttons('read','🔊','class="flight95-voice" aria-label="Odsłuchaj polecenie"')}</div>`;
    const nextLabel = round + 1 === deck.length ? 'Zobacz wynik' : 'Następna runda';
    const next = state.complete ? paired(buttons('next',nextLabel+' →','class="flight95-primary"'),nextLabel) : '';
    setContent(top(game()[2], buttons('catalog','‹ Kokpit','class="flight95-back"'))+taskLine+
      scene(t)+`<div class="flight95-bottom"><p data-f95-report role="status">${esc(message)}</p>${next}</div>`, id);
    if (id === 'parcels') paintWorld(get('canvas'));
    if (isFlying() && !state.complete) {
      const options = state.options ?? t.options;
      air = mountAir95(root, {
        id, options, initialAltitude:state.height,
        getFuel:id==='fuel'?dt => state.fuel = Math.max(0,state.fuel-dt*100/24):null,
        onEmpty:() => {state.fuel=100;draw('Paliwo się skończyło. Cysterny wracają.');},
        onPass:(index,height) => pass(options[index],height)
      });
    }
  }
  function isFlying() {
    return Object.hasOwn(flightStyles95,id) && (id !== 'takeoff' || state.phase === 'air');
  }
  function result(message, extra) {
    stop();
    state.complete = true;
    tone(6);
    const sceneNode = get('.flight95-surface');
    sceneNode.dataset.f95Win = extra ?? 'yes';
    if (id === 'fuel') {
      const fuel = get('[data-f95-fuel]'), percent=get('[data-f95-percent]');
      fuel.value = 100; percent.textContent = '100%';
    }
    if (id === 'spelling') get('[data-f95-banner]').textContent = task().prompt.replace('_',state.flightObject.label);
    sceneNode.querySelectorAll('[data-f95-action]:not([data-f95-action="read"])').forEach(control=> {control.disabled=true;});
    const next = round + 1 === deck.length ? 'Zobacz wynik' : 'Następna runda';
    get('.flight95-bottom').insertAdjacentHTML('beforeend', paired(buttons('next',next+' →','class="flight95-primary"'),next));
    report(message || 'Świetnie! Zadanie wykonane.');
    if (preschool) say(message || 'Brawo! Zadanie wykonane.');
  }
  function finish() {
    stop();
    setContent(top(game()[2],buttons('catalog','‹ Kokpit','class="flight95-back"'))+
      surface95('sunset',`<div class="flight95-complete"><span aria-hidden="true">🏆</span>
      <h3>Misja ukończona!</h3><p>Wszystkie zadania zaliczone.</p>
      ${paired(buttons('start','Zagraj ponownie','class="flight95-primary"'),'Zagraj ponownie')}</div>`), 'result');
    focusHeading();
    if (preschool) say('Brawo! Misja ukończona.');
  }
  function pass(item,height) {
    state.height = height;
    state.flightObject = item;
    const t = task();
    if (t.kind === 'flightSequence') {
      const expected = t.needed[state.step];
      if (item.value !== expected) {
        const message = item.value === 'storm' ? 'Omiń burzową chmurę. Szukamy liczby '+expected+'.' : 'Teraz potrzebna jest liczba '+expected+'.';
        draw(message); return say(message);
      }
      if (++state.step === t.needed.length) return result(id==='takeoff'?'Wszystkie obręcze zaliczone!':'Wszystkie balony złapane!');
      tone(state.step);
      const next = t.needed[state.step];
      state.options = nextAirObjects95(id, next);
      draw('Dobrze! Teraz '+next+'.'); say('Teraz '+next+'.');
      return;
    }
    if (item.value !== t.answer) {
      if (id === 'fuel') state.fuel = Math.max(0,state.fuel-12.5);
      const message = id === 'fuel' ? 'Zła cysterna. Ubyły 3 sekundy paliwa.' : 'Spróbuj jeszcze raz. Cele wracają.';
      draw(message);
      if (preschool) say(message);
      return;
    }
    const messages = {landing:'Udało się wylądować!',feeder:'Ptaszek dostał jedzenie!',seasons:'Ten przedmiot pasuje!',fuel:'Podłączono przewód. Bak pełny!'};
    result(t.explain ?? messages[id],id);
  }
  function scene(t) {
    if (isFlying()) {
      return airMarkup95(id,t,state.options??t.options,{turn:round,preschool,nextNumber:t.needed?.[state.step]});
    }
    switch (id) {
      case 'takeoff': return starter();
      case 'baggage': return baggage(t);
      case 'parcels': return map(t);
      case 'engine': return engine();
      case 'radar': return radar(t);
      case 'cargo': return cargo();
      case 'radio': return radio(t);
      case 'airport': return airport(t);
    }
  }
  function starter() {
    const lever = `<div class="flight95-lever" data-f95-lever>
      ${buttons('lever','<i></i><span>Pociągnij dźwignię ↓</span>','aria-label="Pociągnij dźwignię w dół"')}
      ${forChild('Pociągnij dźwignię w dół.','Odsłuchaj dźwignię')}</div>`;
    const order = `<div class="flight95-starter-keys">${[3,1,4,2].map(value => paired(
      buttons('ignite:'+value,`<b>${value}</b>`,state.done.includes(value)?'disabled data-f95-lit':''),String(value))).join('')}</div>`;
    return surface95('cockpit',`<div class="flight95-console">${state.phase === 'lever' ? lever : order}</div>`,'flight95-starter');
  }
  function baggage(t) {
    const label = t.seat ? 'Fotel' : 'Miejsce w luku';
    const seats = Array.from({length:t.count},(_,i) => {
      const filled = state.done.find(entry=>entry.slot===i);
      return paired(buttons('seat:'+i, filled ? icon(t.seat?'🧸':'🧳') : `<b>${i+1}</b>`,
        `data-f95-seat="${i}" aria-label="${label} ${i+1}" ${filled?'disabled data-f95-filled':''}`),label+' '+(i+1));
    }).join('');
    const items = t.options.map((item,i) => {
      const loaded = state.done.some(entry=>entry.index===i);
      return paired(buttons('bag:'+i,icon(item.icon)+`<b>${esc(item.label)}</b>`,
        `data-f95-drag="bag:${i}" ${loaded?'disabled data-f95-loaded':''} aria-pressed="${state.pick===i}"`), item.words);
    }).join('');
    return surface95(t.seat?'cabin':'cargo',`<div class="flight95-load-board">
      <div class="flight95-seats" data-f95-seats="${t.seat?'seats':'hold'}">${seats}</div>
      <div class="flight95-loading-items">${items}</div></div>`,'flight95-baggage');
  }
  function map(t) {
    const [x,y] = mapLocations[state.location] ?? [17,29];
    const hotspots = t.options.map((item,i) => {
      const [px,py]=mapLocations[i];
      return `<div class="flight95-pin" style="--pin-x:${px}%;--pin-y:${py}%">${paired(
        buttons('zone:'+i, esc(item.label), `aria-pressed="${state.location===i}"`),item.label)}</div>`;
    }).join('');
    return surface95('islands',`<div class="flight95-map">
      <canvas width="660" height="350" aria-label="Mapa świata"></canvas>${hotspots}
      <div class="flight95-map-plane" data-f95-map-plane style="--map-x:${x}%;--map-y:${y}%">${plane95()}<i>📦</i></div>
      <span class="flight95-map-recipient" aria-hidden="true">${t.icon}</span></div>
      <div class="flight95-map-bottom">${paired(buttons('drop','📦 Zrzuć paczkę','class="flight95-primary"'),'Zrzuć paczkę')}</div>`,'flight95-parcels');
  }
  function engine() {
    const keys=[1,2,3,4,5,6,7,8,9,'⌫',0,'✓'];
    return surface95('cockpit',`<div class="flight95-engine">
      <div class="flight95-instruments"><i></i><output data-f95-code aria-label="Wpisany kod">•••</output><i></i></div>
      <div class="flight95-keypad">${keys.map(key=>buttons('key:'+key, key=== '✓'?'START':key,
        `aria-label="${key === '✓'?'Uruchom silnik':key==='⌫'?'Usuń cyfrę':key}"`)).join('')}</div>
      </div>`,'flight95-engine-scene');
  }
  function radar(t) {
    const points = [[28,33],[68,32],[49,71]];
    return surface95('radar',`<div class="flight95-radar" aria-label="Ekran radaru">
      <div class="flight95-radar-sweep" aria-hidden="true"></div>
      ${t.options.map((item,i) => buttons('radar:'+i, shape95(item.icon),
        `aria-label="${esc(item.label)}" style="--radar-x:${points[i][0]}%;--radar-y:${points[i][1]}%"`)).join('')}</div>`,'flight95-radar-scene');
  }
  function cargo() {
    if (state.phase === 'load') {
      const tasks = deck.slice(round,round+3);
      return surface95('cargo',`<div class="flight95-loading-board">
        ${buttons('load','Luk ładunkowy <b>'+state.crates.length+' / '+tasks.length+'</b>','class="flight95-hold" data-f95-hold')}
        <div class="flight95-crates">${tasks.map((item,i)=>buttons('crate:'+i,esc(item.word),
          `class="flight95-crate" data-f95-drag="crate:${i}" ${state.crates.includes(i)?'disabled data-f95-loaded':''} aria-pressed="${state.pick===i}"`)).join('')}</div>
        ${buttons('depart','Start po załadunku','class="flight95-primary" '+(state.crates.length<tasks.length?'disabled':''))}
        </div>`,'flight95-cargo');
    }
    return surface95('islands',`<div class="flight95-cargo-flight">
      <div class="flight95-cargo-plane" data-f95-cargo-plane data-f95-heading="${state.location ?? ''}">
        ${plane95()}<b class="flight95-crate">${esc(task().word)}</b>
      </div><div class="flight95-hangars">${task().options.map((item,i)=>buttons('hangar:'+i,esc(item.label),
       `aria-pressed="${state.location===i}"`)).join('')}</div>
      ${buttons('cargo-drop','Zrzuć skrzynię','class="flight95-primary"')}</div>`,'flight95-cargo');
  }
  function radio(t) {
    const controls=Object.entries(directions).map(([dir,[arrow,label]])=>buttons('dir:'+dir,arrow,
      `aria-label="${label}" aria-pressed="${state.direction===dir}"`)).join('');
    return surface95('cockpit',`<div class="flight95-radio-window" data-f95-heading="${state.direction ?? ''}">
       ${t.color?islands.map(([color,label])=>buttons('island:'+color, esc(label),
         `class="flight95-island" data-f95-color="${color}" aria-label="${label} wyspa"`)).join(''):''}
      </div><div class="flight95-radio-controls">
      ${buttons('read','🎧 Radio','aria-label="Powtórz angielską komendę"')}
      <div class="flight95-stick" data-f95-stick>${controls}<i aria-hidden="true"></i></div>
      </div>`,'flight95-radio');
  }
  function airport(t) {
    if (state.phase === 'arrival') return surface95('runway',`<div class="flight95-arrival">${plane95()}
      ${buttons('arrive','Do odprawy','class="flight95-primary"')}</div>`);
    return surface95('airport',`<div class="flight95-dialogue">
      <div class="flight95-radio-call"><span aria-hidden="true">${t.icon}</span><b lang="en">${esc(t.prompt)}</b>${audio(t.speech,'en-US','Odsłuchaj pytanie po angielsku')}</div>
      <div class="flight95-bubbles">${t.options.map((item,i)=>`<div class="flight95-paired">
        ${buttons('reply:'+i,esc(item.label),'lang="en"')}${audio(item.label,'en-US','Odsłuchaj odpowiedź po angielsku: '+item.label)}
        </div>`).join('')}</div></div>`,'flight95-airport');
  }
  function bagPlace(index,slot) {
    const t = task(), already = state.done.some(entry => entry.slot === slot || entry.index === index);
    if (index === null || slot < 0 || already) return report('Wybierz przedmiot i wolne miejsce.');
    if (t.options[index]?.value !== t.answer) {
      const message=t.seat?'Dziś tym fotelem jedzie miś.':'Do luku włóż walizki z właściwą literą.';
      report(message); say(message); return;
    }
    state.done.push({index,slot}); state.pick=null; tone(state.done.length);
    draw();
    if (state.done.length === t.count) result(t.seat?'Wszystkie misie siedzą na fotelach!':'Wszystkie walizki są w luku!');
  }
  function crateLoad(index) {
    if (index === null || state.crates.includes(index)) return report('Najpierw wybierz skrzynię.');
    state.crates.push(index); state.pick = null; tone(state.crates.length);
    draw('Skrzynia w luku.');
  }
  function chooseZone(index) {
    state.location = index;
    const [x,y]=mapLocations[index];
    const plane=get('[data-f95-map-plane]');
    plane.style.setProperty('--map-x',x+'%');
    plane.style.setProperty('--map-y',y+'%');
    root.querySelectorAll('[data-f95-action^="zone:"]').forEach((item,i) => item.setAttribute('aria-pressed',String(i===index)));
    report('Nad strefą: '+task().options[index].label+'.');
  }
  function keypad(key) {
    if (key === '✓') {
      if (state.digits !== '' && Number(state.digits) === task().answer) result('Silnik działa! '+task().explain,'engine');
      else {
        state.digits = ''; report('Sprawdź działanie i wpisz kod jeszcze raz.');
      }
    } else if (key === '⌫') state.digits = state.digits.slice(0,-1);
    else state.digits = (state.digits+key).slice(0,3);
    get('[data-f95-code]').textContent = state.digits || '•••';
  }
  function radioDirection(direction) {
    state.direction = direction;
    get('.flight95-radio-window').dataset.f95Heading = direction;
    root.querySelectorAll('[data-f95-action^="dir:"]').forEach(item=>item.setAttribute('aria-pressed',String(item.dataset.f95Action==='dir:'+direction)));
    const t = task();
    if (direction === t.direction) {
      if (!t.color) result('Great flying!','radio');
      else report('Utrzymaj zakręt i skieruj się na właściwą wyspę.');
    } else report('Odsłuchaj komunikat i popraw kierunek.');
  }
  function action(value) {
    const [name,arg] = value.split(':');
    const i = Number(arg);
    if (name === 'catalog') return catalog(true);
    if (name === 'mission') return open(arg);
    if (name === 'start') return begin();
    if (!state) return;
    if (name === 'read') return readTask();
    if (name === 'next' && state.complete) {
      if (++round >= deck.length) return finish();
      if (id === 'cargo' && round % 3) {
        state.complete=false;state.location=null;draw('Kolejna skrzynia gotowa do zrzutu.');return;
      }
      return newRound();
    }
    if (state.complete) return;
    switch (name) {
      case 'aim': return air?.aim(i);
      case 'move': return air?.steer(arg);
      case 'lever':
        if (state.phase !== 'lever') return;
        state.phase='code'; draw('Dźwignia na dole. Czas na sekwencję.'); readTask(); return;
      case 'ignite':
        if (i !== state.done.length+1) return report('Znajdź najpierw '+(state.done.length+1)+'.');
        state.done.push(i); tone(i);
        if (i === 4) {state.phase='air';draw('Silnik uruchomiony!');readTask();}
        else draw('Przełącznik '+i+' włączony.');
        return;
      case 'bag': state.pick=i;draw('Wskaż wolne miejsce.');return;
      case 'seat': return bagPlace(state.pick,i);
      case 'zone': return chooseZone(i);
      case 'drop':
        if (state.location===null) return report('Najpierw wskaż miejsce na mapie.');
        if (task().options[state.location].value===task().answer) result(task().explain,'parcel');
        else {report('Tutaj to zwierzę nie mieszka. Poleć dalej.');say('Tutaj to zwierzę nie mieszka. Poleć dalej.');}
        return;
      case 'key': return keypad(arg);
      case 'radar':
        return task().options[i].value===task().answer?result('Cel zaznaczony!','radar'):report('Spójrz jeszcze raz na boki i kąty figury.');
      case 'crate': state.pick=i;draw('Przenieś wybraną skrzynię do luku.');return;
      case 'load': return crateLoad(state.pick);
      case 'depart': state.phase='deliver';draw('Ładunek na pokładzie. Wybierz strefę zrzutu.');return;
      case 'hangar':
        state.location=i;
        get('[data-f95-cargo-plane]').dataset.f95Heading=String(i);
        root.querySelectorAll('[data-f95-action^="hangar:"]').forEach((el,idx)=>el.setAttribute('aria-pressed',String(i===idx)));
        report('Nad hangarem: '+task().options[i].label+'.');return;
      case 'cargo-drop':
        if (state.location===null) return report('Skieruj samolot nad hangar.');
        return task().options[state.location].value===task().answer?result('Skrzynia dotarła do właściwego hangaru!','cargo'):report('Skrzynia należy do innej części mowy.');
      case 'dir': return radioDirection(arg);
      case 'island':
        if (state.direction===task().direction&&arg===task().color) return result('Great flying!','radio');
        return report('Odsłuchaj kierunek i kolor wyspy.');
      case 'arrive':
        get('.flight95-arrival').classList.add('is-landing');
        get('[data-f95-action="arrive"]').disabled = true;
        delayed=setTimeout(()=>{state.phase='play';draw();readTask();},720);return;
      case 'reply':
        return task().options[i].value===task().answer ? result('Cleared. Welcome to the airport!','airport') : report('Posłuchaj pytania jeszcze raz i wybierz odpowiedź.');
    }
  }
  root.addEventListener('click',event=>{
    const speaker=event.target.closest('[data-f95-say]');
    if (speaker) {tap();say(speaker.dataset.f95Say,speaker.dataset.f95Lang);return;}
    const control=event.target.closest('[data-f95-action]');
    if (!control || control.disabled || event.detail>0 && performance.now()<swallowClick) return;
    tap();action(control.dataset.f95Action);
  },{signal});
  root.addEventListener('keydown',event=>{
    if (!state||state.complete) return;
    if (air && ['ArrowUp','ArrowDown'].includes(event.key)) {
      event.preventDefault();air.steer(event.key==='ArrowUp'?'up':'down');return;
    }
    if (id === 'radio' && event.key.startsWith('Arrow') && directions[event.key.slice(5).toLowerCase()]) {
      event.preventDefault();radioDirection(event.key.slice(5).toLowerCase());return;
    }
    if (id === 'engine' && /^\d$|^Backspace$|^Enter$/.test(event.key) && (event.key!=='Enter'||!event.target.closest('button'))) {
      event.preventDefault();keypad(event.key==='Enter'?'✓':event.key==='Backspace'?'⌫':event.key);
    }
  },{signal});
  root.addEventListener('pointerdown',event=>{
    if (!state||state.complete||event.button!==0||gesture||event.target.closest('[data-f95-say]')) return;
    const aim=event.target.closest('[data-f95-action^="aim:"]');
    if (aim&&!aim.disabled) air?.aim(Number(aim.dataset.f95Action.split(':')[1]));
    const target=event.target.closest('[data-f95-drag],[data-f95-lever],[data-f95-viewport],[data-f95-stick]');
    if (!target||event.target.closest('button')?.disabled) return;
    gesture={target,id:event.pointerId,x:event.clientX,y:event.clientY,dragged:false};
  },{signal});
  root.addEventListener('pointermove',event=>{
    if (event.pointerId!==gesture?.id) return;
    const x=event.clientX-gesture.x,y=event.clientY-gesture.y;
    if (!gesture.dragged&&Math.hypot(x,y)<9) return;
    const target=gesture.target;
    if (!gesture.dragged) {gesture.dragged=true;root.setPointerCapture?.(event.pointerId);}
    if (target.hasAttribute('data-f95-viewport')) {
      const rect=target.getBoundingClientRect();
      air?.steerTo((event.clientY-rect.top)*100/rect.height);
    } else {
      target.style.setProperty('--drag-x',x+'px');
      target.style.setProperty('--drag-y',y+'px');
      target.dataset.f95Dragging='';
    }
  },{signal});
  function endPointer(event) {
    if (event.pointerId!==gesture?.id) return;
    const {target,dragged,y,x}=gesture;gesture=null;
    if (!dragged) return;
    delete target.dataset.f95Dragging;
    target.style.removeProperty('--drag-x');target.style.removeProperty('--drag-y');
    swallowClick=performance.now()+300;
    if (event.type==='pointercancel' || state?.complete) return;
    const under=root.ownerDocument.elementFromPoint(event.clientX,event.clientY);
    const [type,index]=(target.dataset.f95Drag??'').split(':');
    if (type==='bag'&&under?.closest('[data-f95-seat]')) bagPlace(Number(index),Number(under.closest('[data-f95-seat]').dataset.f95Seat));
    if (type==='crate'&&under?.closest('[data-f95-hold]')) crateLoad(Number(index));
    if (target.hasAttribute('data-f95-lever')&&event.clientY-y>13) action('lever');
    if (target.hasAttribute('data-f95-stick')) {
      const dx=event.clientX-x,dy=event.clientY-y;
      radioDirection(Math.abs(dx)>Math.abs(dy)?(dx<0?'left':'right'):(dy<0?'up':'down'));
    }
  }
  root.addEventListener('pointerup',endPointer,{signal});
  root.addEventListener('pointercancel',endPointer,{signal});
  catalog();
}
