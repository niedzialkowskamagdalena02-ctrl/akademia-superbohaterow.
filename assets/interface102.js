const art = (name, className = '') =>
  `<img class="academy102-art ${className}" src="assets/interface102/${name}.webp" alt="" draggable="false">`;
const dashboardArt = (name) =>
  `<img class="academy102-art" src="assets/interface106/${name}.webp" alt="" draggable="false">`;
const detailArt = (name) =>
  `<img class="academy102-art" src="assets/interface107/${name}.webp" alt="" draggable="false">`;

export function academy107Entry({release, profiles, status, linked, parent, pair, update}) {
  return `<main class="academy107-entry">
    <header class="academy107-entry-header">
      <h1>${detailArt('entry-logo')}<span class="academy102-sr">Akademia Superbohaterów</span><span>V${release}</span></h1>
      <p>Wybierz swoją bazę</p>
    </header>
    <section class="academy107-welcome">${detailArt('entry-welcome')}
      <h2 class="academy102-sr">Witaj w Akademii!</h2>
      <p class="academy102-sr">Każdy bohater ma własne misje i nagrody.</p>
    </section>
    <div class="academy107-profiles">${profiles.map(({id, name, grade, coins, progress, hero, audio})=>`
      <div class="academy107-profile">
        <button type="button" class="academy107-profile-card academy107-profile-${id}${hero?' academy107-custom-hero':''}" data-action="enter:${id}">
          ${hero ? `<img class="academy107-profile-hero" src="assets/art/${hero}.svg" alt="">` : ''}
          <span class="academy107-profile-name">${name}</span>
          <span class="academy107-profile-grade">${grade} · ${coins} złotych</span>
          <span class="academy107-profile-progress" aria-label="Postęp ${progress}%"><span style="width:${progress}%"></span></span>
        </button>${audio}
      </div>`).join('')}</div>
    <section class="academy107-link-panel">
      ${parent ? `<button type="button" class="academy107-entry-art academy107-entry-parent" data-action="enter:admin">Centrum dowodzenia mamy</button>` : ''}
      <p${linked?' data-sync78-message role="status"':''}>${status}</p>
    </section>
    ${pair}
    ${update ? `<footer><button type="button" class="academy107-entry-art academy107-update" data-action="academy:update">Aktualizuj Akademię</button></footer>` : ''}
  </main>`;
}

export function academy107PinScreen(length) {
  const pinKey = (action, label, extra='') =>
    `<button type="button" class="academy107-pin-key ${extra}" data-action="parent-pin:${action}">${label}</button>`;
  return `<main class="academy107-pin-screen">
    <section class="academy107-pin-card" aria-labelledby="academy107-pin-title">
      <h1 id="academy107-pin-title">${detailArt('pin-heading')}<span class="academy102-sr">Centrum dowodzenia rodzica</span></h1>
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

function tile(name, label, action, content = '', description = '') {
  return `<button type="button" class="academy102-tile academy102-${name}" data-action="${action}" aria-label="${label}"
    ${description ? `aria-description="${description}"` : ''}>
    ${art(name)}${content}</button>`;
}

function microphone(className = '') {
  return `<button type="button" class="mic academy102-mic ${className}" data-action="mic" aria-label="Zadaj pytanie"></button>`;
}

const testBanner = () => `<div class="academy102-test" role="note" aria-label="Tryb mamy — bezpłatny test. Postępy nie są zapisywane.">${art('test')}</div>`;

export function academy102Shell(scene, {title, content, menu='', voice='', release, test, status, sound, exit, base}) {
  const profiles = test ? exit : `<button type="button" class="academy102-profiles" data-action="exit" aria-label="Profile">
    ${dashboardArt('profiles')}</button>`;
  const regular = scene==='section';
  const screen = scene==='missions'?'mission-screen':scene;
  return `<main class="academy102-screen academy102-${screen}${base?' hq88-base-page':''}" ${regular?'':'data-preschool-screen-skip'}>
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
    ${regular||scene==='missions'?`<div class="academy104-section-body">${content}</div>`:content}
    ${scene==='knowledge'?'':microphone()}
  </main>`;
}

export function academy102Choices() {
  return `<nav class="academy102-choices" aria-label="Wybór widoku">
    ${tile('classic','☰ Widok klasyczny','hq:view:classic')}
    ${tile('walk','🚶 Spacer po bazie','hq:view:walk')}
  </nav>`;
}

export function academy102Player({name, child, coins, grade, level, progress}) {
  return `<section class="academy102-player" aria-label="Profil bohatera">
    <div class="academy102-player-row">
      <h2>${name}${child==='patryk'?dashboardArt('patryk-spider'):detailArt('shield')}</h2>
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
  return `<nav class="academy102-destinations${preschool?' academy102-preschool':''}" aria-label="Menu Akademii">${destinations.map(([picture,label,tab],index)=>{
    const originalTile = index < 4;
    const link = `<button type="button" class="academy104-destination" data-action="child:${tab}"${tab===current?' aria-current="page"':''} aria-label="${label}">
      ${originalTile ? dashboardArt('patryk-'+picture) : `<span class="academy107-wide-face">${detailArt('icon-'+picture)}<span>${picture==='headquarters'?'Baza Avengersów<br>i gry':label}</span></span>`}</button>`;
    return `<div class="academy102-voiced${originalTile?' academy106-drawn-speaker':''}">${link}${speak(label)}</div>`;
  }).join('')}</nav>`;
}

export function academy102DashboardVoice(name, speak) {
  return `<div class="academy102-screen-voice">${speak('Akademia '+name+'. Wybierz: Misje, Książki, Trening, Sala odkrywców, Mentor albo Baza Avengersów i gry.', 'Odsłuchaj ekran')}</div>`;
}

export function academy102MissionsHeader({back, audio}) {
  return `<header class="academy102-mission-header">
    <h2>${detailArt('icon-missions')}Twoje misje</h2>${audio}${back}
  </header>`;
}

export function academy102MissionZone({key, icon, title, desc, count, cards, voice}) {
  return `<section class="mission-zone zone-${key} academy102-zone">
    <div class="academy102-zone-top">${detailArt(icon)}<div>
    <h2>${title} <span class="mission-count">${count}</span></h2><p>${desc}</p>
    ${count?'':'<p class="mission-empty">✨ Wszystko zrobione!</p>'}</div>${voice}</div>${cards}
  </section>`;
}

export function academy102FamilyHeading(title) {
  return `<h2>${dashboardArt('family')}${title}</h2>`;
}

export function academy102Knowledge(hasBookItems, back) {
  const mixed = hasBookItems ? 'Różne zadania z książki i spoza niej' : 'Losowe zadania spoza książki';
  return `<section class="academy102-knowledge-panel${hasBookItems ? '' : ' academy102-outside'}" aria-labelledby="academy102-knowledge-title">
    <h2 id="academy102-knowledge-title" class="academy102-sr">Wiedza ogólna</h2>
    ${art('knowledge-backdrop','academy102-knowledge-backdrop')}
    ${tile('train','Trenuj','training:mixed:start', `<span class="academy102-mixed-label" aria-hidden="true">${mixed}</span>`,mixed)}
    ${tile('game','Wybierz grę','training:back:catalog')}
    ${tile('library','Tylko z książki','training:mode:game','','Cały materiał albo wybrane strony')}
    ${microphone('academy102-mic--knowledge')}
  </section><nav class="academy102-return" aria-label="Powrót">${back}</nav>`;
}
