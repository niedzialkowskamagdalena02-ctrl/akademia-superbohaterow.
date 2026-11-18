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
  ['hulk','assets/art/hulk.webp'],
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

export function academy107Entry({release, profiles, status, linked, parent, pair, update}) {
  return `<main class="academy107-entry">
    <header class="academy107-entry-header">
      <h1>${refinedArt('entry-logo')}<span class="academy102-sr">Akademia Superbohaterów</span><span>V${release}</span></h1>
      <p>Wybierz swoją bazę</p>
    </header>
    <section class="academy107-welcome">
      <img src="assets/interface110/welcome-shield.webp" alt="" draggable="false">
      <h2>Witaj w Akademii!</h2>
      <p>Każdy bohater ma własne misje i nagrody.</p>
    </section>
    <div class="academy107-profiles">${profiles.map(({id, name, grade, coins, progress, hero, audio})=>{
      const portrait=heroPortrait(hero);
      return `
      <div class="academy107-profile">
        <button type="button" class="academy107-profile-card academy107-profile-${id}" data-action="enter:${id}">
          <img class="academy107-profile-hero${portrait.endsWith('.svg')?' academy108-selected-hero':''}" src="${portrait}" alt="" draggable="false">
          <span class="academy107-profile-name">${name}</span>
          <span class="academy107-profile-grade">${grade} · ${coins} złotych</span>
          <span class="academy107-profile-progress" aria-label="Postęp ${progress}%"><span style="width:${progress}%"></span></span>
        </button>${audio}
      </div>`;
    }).join('')}</div>
    <section class="academy107-link-panel">
      ${parent ? `<button type="button" class="academy107-entry-art academy107-entry-parent" data-action="enter:admin" aria-label="Centrum dowodzenia mamy"></button>` : ''}
      <p${linked?' data-sync78-message role="status"':''}>${status}</p>
    </section>
    ${pair}
    ${update ? `<footer><button type="button" class="academy107-entry-art academy107-update" data-action="academy:update" aria-label="Aktualizuj Akademię"></button></footer>` : ''}
  </main>`;
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

const trainingArtBounds=[0,0,1422,1536];
const trainingBoardBounds=[0,0,1422,1720];
const subjectTiles=[
  {key:'wiedza', label:'Wiedza ogólna', rect:[142,339,1091,479], placement:[142,339,1091,532], motion:'knowledge'},
  {key:'polski', label:'Polski', rect:[91,832,389,350], placement:[91,883,389,393], illustration:[161,897,267,180]},
  {key:'matematyka', label:'Matematyka', rect:[490,832,388,350], placement:[490,883,388,393], illustration:[548,874,268,217], effect:'<span class="academy111-numbers">1 + 2 × 3</span>'},
  {key:'angielski', label:'Angielski', rect:[890,832,389,350], placement:[890,883,389,393], illustration:[952,874,270,216]},
  {key:'przyroda', label:'Przyroda', rect:[91,1190,302,333], placement:[91,1290,389,393], illustration:[137,1218,199,180], effect:'<span class="academy111-butterfly">🦋</span>'},
  {label:'Chemia', rect:[397,1190,288,333], placement:[490,1290,388,393]},
  {label:'Fizyka', rect:[694,1190,289,333], placement:[890,1290,389,393]}
];
const knowledgePieces=[
  ['globe',[587,408,226,222]],
  ['letter',[567,387,62,64]],
  ['letter',[783,407,58,78]],
  ['letter',[1037,413,70,83]],
  ['letter',[352,690,63,74]],
  ['letter',[967,698,62,77]],
  ['bulb',[1022,577,104,134]],
  ['leaf',[248,400,120,145]]
];

function trainingArtPlacement(rect,[left,top,parentWidth,parentHeight]=trainingBoardBounds,crop=rect) {
  const [x,y,width,height]=rect;
  const [cropX,cropY,cropWidth,cropHeight]=crop;
  const [, ,artWidth,artHeight]=trainingArtBounds;
  const percent=(part,whole)=>(part/whole*100).toFixed(4)+'%';
  return `--left:${percent(x-left,parentWidth)};--top:${percent(y-top,parentHeight)};
    --width:${percent(width,parentWidth)};--height:${percent(height,parentHeight)};
    --crop-position:${percent(cropX,artWidth-cropWidth)} ${percent(cropY,artHeight-cropHeight)};
    --crop-size:${percent(artWidth,cropWidth)} ${percent(artHeight,cropHeight)}`;
}

function trainingArtPiece(kind,rect,parent) {
  return `<span class="academy111-piece academy111-${kind}" style="${trainingArtPlacement(rect,parent)}" aria-hidden="true"></span>`;
}

export function academy111Training(voice,extraSubjects='') {
  return `<section class="academy111-training" aria-labelledby="academy111-training-title" data-v77-step="subject">
    <div class="academy111-board">
      <h2 id="academy111-training-title" class="academy102-sr">Trenuj</h2>
      <p class="academy102-sr">Wybierz przedmiot</p>
      ${trainingArtPiece('rocket',[491,75,123,126])}
      <span class="academy111-voice-slot" style="${trainingArtPlacement([395,222,112,109])}">${voice}</span>
      ${subjectTiles.map(({key,label,rect,placement,motion,illustration,effect=''})=>{
        const style=trainingArtPlacement(placement,trainingBoardBounds,rect);
        if(!key)return `<button type="button" class="academy111-subject" disabled aria-label="${label} — w przygotowaniu" style="${style}"></button>`;
        const motionName=motion||key;
        const pieces=motion?knowledgePieces.map(([kind,area])=>trainingArtPiece(kind,area,rect)).join('') :
          trainingArtPiece('illustration',illustration,rect);
        return `<button type="button" class="tr72-subject-card academy111-subject" data-theme="${key}" data-action="training:subject:${encodeURIComponent(label)}"
          aria-label="Wybierz przedmiot ${label}" style="${style};--motion-art:url(assets/interface111/${motionName}-motion.webp)">
          <span class="academy111-motion" aria-hidden="true">${pieces}${effect}</span>
        </button>`;
      }).join('')}
    </div>
    ${extraSubjects?`<div class="tr71 tr72-subject-grid academy111-extra-subjects">${extraSubjects}</div>`:''}
  </section>`;
}

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

export function academy115TrainingPanel({subject, source, count}) {
  const rollingDice = `<span class="academy113-dice" aria-hidden="true">${activityArt('dice')}</span>`;
  const gamepad = `<span class="academy113-controller" aria-hidden="true">
    ${activityArt('controller')}
    <span class="academy113-hand academy113-hand-left"></span>
    <span class="academy113-hand academy113-hand-right"></span>
  </span>`;
  const shelfBooks = `<span class="academy115-shelf" aria-hidden="true">${referenceArt('shelf')}<span class="academy113-shelf-books">
    ${activityArt('book-1')}${activityArt('book-2')}${activityArt('book-3')}
  </span></span>`;
  const makeTile = (kind,title,action,description,artwork) =>
    `<button type="button" class="academy102-tile academy115-card academy115-${kind}" data-action="${action}"
      aria-description="${description}"><span class="academy115-illustration" aria-hidden="true">${artwork}</span>
      <strong>${title}</strong><small>${description}</small></button>`;
  const cards = source ?
    makeTile('practice','Trenuj','training:mixed:start','Losowa mieszanka gier i zadań',rollingDice)+
    makeTile('choose','Wybierz grę','training:catalog','Wybrana gra, losowe zadania',gamepad)+
    makeTile('assessment','Sprawdzian','training:assessment','Różne zadania bez podpowiedzi','<span class="academy115-symbol">🏆</span>') :
    makeTile('books','Materiał z książek','training:source:books','Cała książka, dział lub strony',shelfBooks)+
    makeTile('outside','Inne materiały','training:source:outside','Zadania spoza książek',referenceArt('planet','academy117-planet'));
  return `<section class="academy102-knowledge-panel academy115-flow" aria-labelledby="academy115-title" data-v77-step="${source?'train-options':'source'}">
    <h2 id="academy115-title">${subject}</h2>
    <p>${source==='books'?'Materiał z książek · '+count+(count===1?' strona':[2,3,4].includes(count%10)&&![12,13,14].includes(count%100)?' strony':' stron'):source==='outside'?'Inne materiały':'Wybierz materiał'}</p>
    <div class="academy115-cards">${cards}</div>
  </section>`;
}
