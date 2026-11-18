const art = (name, className = '') =>
  `<img class="academy102-art ${className}" src="assets/interface102/${name}.webp" alt="" draggable="false">`;

function tile(name, label, action, content = '', description = '') {
  return `<button type="button" class="academy102-tile academy102-${name}" data-action="${action}" aria-label="${label}"
    ${description ? `aria-description="${description}"` : ''}>
    ${art(name)}${content}</button>`;
}

function microphone(className = '') {
  return `<button type="button" class="mic academy102-mic ${className}" data-action="mic" aria-label="Zadaj pytanie"></button>`;
}

const testBanner = () => `<div class="academy102-test" role="note" aria-label="Tryb mamy — bezpłatny test. Postępy nie są zapisywane.">${art('test')}</div>`;

export function academy102Shell(scene, {title, content, voice='', release, test, status, sound, exit}) {
  if (scene === 'knowledge') {
    return `<main class="academy102-screen academy102-knowledge" data-preschool-screen-skip>${test ? testBanner() : ''}${content}</main>`;
  }
  if (scene === 'missions') return `<main class="academy102-screen academy102-mission-screen" data-preschool-screen-skip>${test ? testBanner() : ''}${content}${microphone()}</main>`;
  const profiles = test ? exit : tile('profiles','← Profile','exit');
  return `<main class="academy102-screen academy102-${scene}" data-preschool-screen-skip>
    ${voice}
    <header class="academy102-header">
      <div class="academy102-masthead">
        <span class="academy102-sr">Akademia Superbohaterów</span>${art('masthead')}
        <span class="academy102-version">V${release}</span>
      </div>
      <div class="academy102-identity">
        <div class="academy102-status"><h1>${title}</h1>${status}</div>
        <div class="academy102-header-actions">${sound}${profiles}</div>
      </div>
    </header>
    ${test ? testBanner() : ''}${content}${microphone()}
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
      <h2>${name}${art(child==='patryk'?'patryk-spider':'shield')}</h2>
      <b class="academy102-wallet">${art('coin')}<span class="academy102-wallet-value" data-wallet82="${child}">${coins} złotych</span></b>
    </div>
    <p>${grade} · Baza poziom ${level}</p>
    <div class="academy102-progress" role="progressbar" aria-label="Postęp do następnego poziomu" aria-valuenow="${progress}">
      <div style="width:${progress}%">${art('progress')}</div>
    </div>
  </section>`;
}

const destinations = [
  ['missions','🎯 Misje','home'],
  ['books','📚 Książki','books'],
  ['training','🧠 Trening','learn'],
  ['explorers','📖 Sala odkrywców','academy'],
  ['mentor','🤖 Mentor','mentor'],
  ['headquarters','🏙️ Baza Avengersów i gry','base']
];

export function academy102DashboardNav(preschool, speak) {
  const entries = preschool ? [...destinations.slice(0,4).map(([picture,label,tab])=>['patryk-'+picture,label,tab]),...destinations.slice(3)] : destinations;
  return `<nav class="academy102-destinations${preschool?' academy102-preschool':''}" aria-label="Menu Akademii">${entries.map(([picture,label,tab])=>{
    const action = tab==='home'?'missions-board':tab;
    const link = tile(picture,label,`child:${action}`);
    return preschool ? `<div class="academy102-voiced${picture.startsWith('patryk-')?' academy102-printed-speaker':''}">${link}${speak(label.slice(label.indexOf(' ')+1))}</div>` : link;
  }).join('')}</nav>`;
}

export function academy102DashboardVoice(name, speak) {
  return `<div class="academy102-screen-voice">${speak('Akademia '+name+'. Wybierz: Misje, Książki, Trening, Sala odkrywców, Mentor albo Baza Avengersów i gry.', 'Odsłuchaj ekran')}${art('patryk-listen')}</div>`;
}

export function academy102MissionsHeader({name, back, audio}) {
  return `<header class="academy102-mission-header">
    <h1>${art('mission-title')}Twoje misje</h1>${audio}
    <div class="academy102-mission-person"><strong>${name}</strong>${art('avatar')}${back}</div>
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
  return `<h2>${art('family')}${title}</h2>`;
}

export function academy102Knowledge(hasBookItems, back, exit) {
  const mixed = hasBookItems ? 'Różne zadania z książki i spoza niej' : 'Losowe zadania spoza książki';
  return `<section class="academy102-knowledge-panel${hasBookItems ? '' : ' academy102-outside'}" aria-labelledby="academy102-knowledge-title">
    <h1 id="academy102-knowledge-title" class="academy102-sr">Wiedza ogólna</h1>
    ${art('knowledge-backdrop','academy102-knowledge-backdrop')}
    ${tile('train','Trenuj','training:mixed:start', `<span class="academy102-mixed-label" aria-hidden="true">${mixed}</span>`,mixed)}
    ${tile('game','Wybierz grę','training:back:catalog')}
    ${tile('library','Tylko z książki','training:mode:game','','Cały materiał albo wybrane strony')}
    ${microphone('academy102-mic--knowledge')}
  </section><nav class="academy102-return" aria-label="Powrót">${back}${exit}</nav>`;
}
