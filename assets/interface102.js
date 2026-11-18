const art = (name, className = '') =>
  `<img class="academy102-art ${className}" src="assets/interface102/${name}.webp" alt="" draggable="false">`;
const dashboardArt = (name) =>
  `<img class="academy102-art" src="assets/interface106/${name}.webp" alt="" draggable="false">`;

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
      <h2>${name}${dashboardArt(child==='patryk'?'patryk-spider':'shield')}</h2>
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
    const withSpeaker = preschool && index < 4;
    const link = `<button type="button" class="academy104-destination" data-action="child:${tab}"${tab===current?' aria-current="page"':''} aria-label="${label}">
      ${dashboardArt(withSpeaker ? 'patryk-'+picture : picture)}</button>`;
    return preschool ? `<div class="academy102-voiced${withSpeaker?' academy106-drawn-speaker':''}">${link}${speak(label)}</div>` : link;
  }).join('')}</nav>`;
}

export function academy102DashboardVoice(name, speak) {
  return `<div class="academy102-screen-voice">${speak('Akademia '+name+'. Wybierz: Misje, Książki, Trening, Sala odkrywców, Mentor albo Baza Avengersów i gry.', 'Odsłuchaj ekran')}</div>`;
}

export function academy102MissionsHeader({back, audio}) {
  return `<header class="academy102-mission-header">
    <h2>${art('icon-missions')}Twoje misje</h2>${audio}${back}
  </header>`;
}

export function academy102MissionZone({key, icon, title, desc, count, cards, voice}) {
  return `<section class="mission-zone zone-${key} academy102-zone">
    <div class="academy102-zone-top">${art(icon)}<div>
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
