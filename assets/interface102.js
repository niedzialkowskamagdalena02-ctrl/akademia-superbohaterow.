import {entry122} from './interface122.js?v=123';
import {training119Subjects,training119Options} from './interface119.js?v=123';
const art = (name, className = '') =>
  `<img class="academy102-art ${className}" src="assets/interface102/${name}.webp" alt="" draggable="false">`;
const dashboardArt = (name) =>
  `<img class="academy102-art" src="assets/interface106/${name}.webp" alt="" draggable="false">`;
const refinedArt = (name) =>
  `<img class="academy102-art" src="assets/interface108/${name}.webp" alt="" draggable="false">`;
const activityArt = (name, className = '') =>
  `<img class="academy102-art ${className}" src="assets/interface113/${name}.webp" alt="" draggable="false">`;
const referenceArt = (name, className = '') =>
  `<img class="academy102-art ${className}" src="assets/interface117/${name}.webp" alt="" draggable="false">`;

const heroPortraits = new Map([
  ['iron','assets/interface108/hero-pawel.webp'],
  ['spider','assets/interface108/hero-patryk.webp'],
  ['hulk','assets/interface119/hulk.svg'],
  ['captain','assets/art/captain.webp'],
  ['thor','assets/art/thor.webp'],
  ['hood','assets/art/hood.webp'],
  ...['panther','hawkeye','gamora','groot','groot-lady'].map(key=>[key,`assets/interface116/${key}.webp`]),
  ['widow','assets/interface117/widow.webp'],
  ['wanda','assets/interface117/wanda.webp']
]);

export function heroPortrait(key) {
  return heroPortraits.get(key) ?? `assets/art/${key}.svg`;
}

export function academy107Entry(options){
 return entry122({...options,portrait:heroPortrait});
}

export function academy107PinScreen(length) {
  const pinKey = (action, label, extra='') =>
    `<button type="button" class="academy107-pin-key ${extra}" data-action="parent-pin:${action}" aria-label="${label}">${action.startsWith('digit:')?label:''}</button>`;
  return `<main class="academy107-pin-screen">
    <section class="academy107-pin-card" aria-labelledby="academy107-pin-title">
      <h1 id="academy107-pin-title">${refinedArt('pin-heading')}<span class="academy102-sr">Centrum dowodzenia rodzica</span></h1>
      <p id="academy107-pin-instruction">${length ? 'Podaj kod PIN, aby wejść do bazy!' : 'Ustaw kod PIN mamy (od 4 do 8 cyfr)'}</p>
      <form id="academy107-pin-form" class="academy107-pin-grid">
        <div class="academy107-pin-keypad">
          ${Array.from({length:9},(_,i)=>pinKey('digit:'+(i+1),i+1,[0,4,5].includes(i)?'academy107-pin-spark':'')).join('')}
          ${pinKey('cancel','Anuluj','academy107-pin-cancel')}
          ${pinKey('digit:0','0')}
          ${pinKey('erase','Usuń ostatnią cyfrę','academy107-pin-back')}
        </div>
        <div class="academy107-pin-answer">
          <label class="academy107-pin-display">
            <span class="academy102-sr">Kod PIN</span>
            <span class="academy107-pin-cells" aria-hidden="true">${Array.from({length:8},(_,i)=>
              `<span class="academy107-pin-cell"${i>=(length||4)?' hidden':''}></span>`).join('')}</span>
            <input type="password" id="academy107-pin-value" inputmode="none" autocomplete="off" maxlength="${length||8}" aria-describedby="academy107-pin-instruction academy107-pin-error">
          </label>
          <p id="academy107-pin-error" role="status"></p>
          ${pinKey('confirm','OK','academy107-pin-ok')}
        </div>
      </form>
    </section>
  </main>`;
}

function tile(name, label, action, {content='',description='',artwork=art(name)} = {}) {
  return `<button type="button" class="academy102-tile academy102-${name}" data-action="${action}" aria-label="${label}"
    ${description ? `aria-description="${description}"` : ''}>
    ${artwork}${content}</button>`;
}

function microphone() {
  return `<button type="button" class="mic academy102-mic" data-action="mic" aria-label="Zadaj pytanie"></button>`;
}

const testBanner = () => `<div class="academy102-test" role="note" aria-label="Tryb mamy — bezpłatny test. Postępy nie są zapisywane.">${art('test')}</div>`;

export function academy102Shell(scene, {title, content, menu='', voice='', release, test, status, sound, exit, base, back, skipScreenReader=false}) {
  const screen = scene==='missions'?'mission-screen':scene;
  if(back&&content.includes('data-interface119='))return `<main class="academy102-screen academy116-section academy119-full" ${skipScreenReader?'data-preschool-screen-skip':''}>
    ${test?`<div class="academy116-test" role="note">Tryb mamy · postępy nie są zapisywane ${exit}</div>`:''}
    <div class="academy104-section-body">${content.replaceAll('data-back119',`data-action="${back}"`)}</div>
    ${content.includes('data-interface119="subjects"')?'':microphone()}
  </main>`;
  if(back)return `<main class="academy102-screen academy102-${screen} academy116-section${base?' hq88-base-page':''}" ${skipScreenReader?'data-preschool-screen-skip':''}>
    <header class="academy116-top">
      <button type="button" class="academy116-back alt" data-action="${back}"><span aria-hidden="true">←</span> Wróć</button>
    </header>
    ${test?`<div class="academy116-test" role="note">Tryb mamy · postępy nie są zapisywane ${exit}</div>`:''}
    <div class="academy104-section-body">${content}</div>
    ${microphone()}
  </main>`;
  const profiles = test ? exit : `<button type="button" class="academy102-profiles" data-action="exit" aria-label="Profile">
    ${dashboardArt('profiles')}</button>`;
  return `<main class="academy102-screen academy102-${screen}${base?' hq88-base-page':''}" data-preschool-screen-skip>
    <header class="academy102-header">
      <div class="academy102-masthead">
        ${dashboardArt('masthead')}<span class="academy102-sr">Akademia Superbohaterów</span>
        <span class="academy102-version">V${release}</span>
      </div>
      <div class="academy102-identity">
        <div class="academy102-status"><h1>${title}</h1>${status}</div>
        <div class="academy102-header-actions">${sound}${profiles}</div>
      </div>
    </header>
    ${voice}${test ? testBanner() : ''}${menu}
    ${content}
    ${microphone()}
  </main>`;
}

export function academy102Choices() {
  const views=[
    ['classic','Widok klasyczny','overview','☰'],
    ['walk','Spacer po bazie','walk','']
  ];
  return `<nav class="academy102-choices" aria-label="Wybór widoku">
    ${views.map(([key,label,background,icon])=>tile(key,label,'hq:view:'+key,{
      artwork:`<img class="academy102-art" src="assets/hq/${background}.webp" alt="" draggable="false">`,
      content:`<span class="academy110-choice-label">${icon?`<span aria-hidden="true">${icon}</span>`:''}${label}</span>`
    })).join('')}
  </nav>`;
}

export function academy102Player({name, child, coins, grade, level, progress}) {
  return `<section class="academy102-player" aria-label="Profil bohatera">
    <div class="academy102-player-row">
      <h2>${name}${child==='patryk'?dashboardArt('patryk-spider'):activityArt('shield')}</h2>
      <b class="academy102-wallet">${dashboardArt('coin')}<span class="academy102-wallet-value" data-wallet82="${child}">${coins} złotych</span></b>
    </div>
    <p>${grade} · Baza poziom ${level}</p>
    <div class="academy102-progress" role="progressbar" aria-label="Postęp do następnego poziomu" aria-valuenow="${progress}">
      <div style="width:${progress}%">${dashboardArt('progress')}</div>
    </div>
  </section>`;
}

const destinations = [
  ['missions','Misje','missions-board'],
  ['books','Książki','books'],
  ['training','Trening','learn'],
  ['explorers','Sala odkrywców','academy'],
  ['mentor','Mentor','mentor'],
  ['headquarters','Baza Avengersów i gry','base']
];

export function academy102DashboardNav(preschool, speak, current) {
  return `<nav class="academy102-destinations${preschool?' academy102-preschool':''}" aria-label="Menu Akademii">${destinations.map(([picture,label,tab])=>{
    const artwork=referenceArt('nav-'+picture);
    const link = `<button type="button" class="academy104-destination" data-action="child:${tab}"${tab===current?' aria-current="page"':''} aria-label="${label}">
      <span class="academy107-wide-face">${artwork}<span>${label}</span></span></button>`;
    return `<div class="academy102-voiced" data-destination="${picture}">${link}${speak(label)}</div>`;
  }).join('')}</nav>`;
}

export function academy111Training(voice,extraSubjects='') { return training119Subjects(voice,extraSubjects); }

export function academy102DashboardVoice(name, speak) {
  return `<div class="academy102-screen-voice">${speak('Akademia '+name+'. Wybierz: Misje, Książki, Trening, Sala odkrywców, Mentor albo Baza Avengersów i gry.', 'Odsłuchaj ekran')}</div>`;
}

export function academy102MissionsHeader({audio}) {
  return `<header class="academy102-mission-header">
    <h2>${referenceArt('nav-missions')}Twoje misje</h2>${audio}
  </header>`;
}

export function academy102MissionZone({key, icon, title, desc, count, cards, voice}) {
  return `<section class="mission-zone zone-${key} academy102-zone">
    <div class="academy102-zone-top">${referenceArt(icon)}<div>
    <h2>${title} <span class="mission-count">${count}</span></h2><p>${desc}</p>
    ${count?'':'<p class="mission-empty">✨ Wszystko zrobione!</p>'}</div>${voice}</div>${cards}
  </section>`;
}

export function academy102FamilyHeading(title) {
  return `<h2>${dashboardArt('family')}${title}</h2>`;
}

export function academy115TrainingPanel(options) {
 return training119Options({...options,booksArt:referenceArt('shelf'),outsideArt:referenceArt('planet','academy117-planet')});
}
