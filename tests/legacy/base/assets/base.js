// Autorski świat bohaterów. Wersjonowane identyfikatory ułatwiają przyszłą synchronizację.
export const BASE_ITEMS=[
{id:'shield',name:'Tarcza Kapitana Ameryki',icon:'🛡️',cost:0,zone:'training',type:'gadżet'},
{id:'workshop',name:'Warsztat Tony’ego Starka',icon:'🦾',cost:0,zone:'lab',type:'pomieszczenie'},
{id:'web',name:'Sieć treningowa',icon:'🕸️',cost:60,zone:'training',type:'gadżet'},
{id:'hangar',name:'Hangar odrzutowców',icon:'🚀',cost:100,zone:'hangar',type:'pomieszczenie'},
{id:'tower',name:'Wieża dowodzenia',icon:'🏙️',cost:160,zone:'command',type:'pomieszczenie'},
{id:'reactor',name:'Reaktor energii',icon:'⚡',cost:25,zone:'lab',type:'ulepszenie'},
{id:'robot',name:'Robot pomocnik',icon:'🤖',cost:45,zone:'lab',type:'towarzysz'},
{id:'portal',name:'Portal misji',icon:'🌀',cost:70,zone:'command',type:'ulepszenie'},
{id:'armor',name:'Zbroja Iron Mana',icon:'🦾',cost:50,zone:'armory',type:'zbroja'},
{id:'helmet',name:'Maska Iron Mana',icon:'🔴',cost:35,zone:'armory',type:'zbroja'},
{id:'boots',name:'Buty odrzutowe Iron Mana',icon:'👢',cost:50,zone:'armory',type:'zbroja'},
{id:'cape',name:'Strój Czarnej Pantery',icon:'🦸',cost:30,zone:'armory',type:'zbroja'},
{id:'guardian',name:'Iron Man',icon:'🦾',cost:80,zone:'team',type:'bohater'},
{id:'inventor',name:'Spider-Man',icon:'🕷️',cost:90,zone:'team',type:'bohater'},
{id:'shadow',name:'Hulk',icon:'💚',cost:85,zone:'team',type:'bohater'},
{id:'cosmo',name:'Thor',icon:'⚡',cost:110,zone:'team',type:'bohater'},
,
{id:'vibranium',name:'Pazury Czarnej Pantery',icon:'🐾',cost:20,zone:'armory',type:'gadżet'},
{id:'thorhammer',name:'Młot Thora',icon:'🔨',cost:35,zone:'armory',type:'broń'},
{id:'spidermask',name:'Maska Spider-Mana',icon:'🕷️',cost:15,zone:'armory',type:'maska'},
{id:'spiderweb',name:'Wyrzutnia sieci',icon:'🕸️',cost:25,zone:'armory',type:'gadżet'},
{id:'gauntlet',name:'Rękawica Nieskończoności',icon:'✊',cost:120,zone:'armory',type:'artefakt'},
{id:'stone_space',name:'Kamień Przestrzeni',icon:'💎',cost:35,zone:'armory',type:'Kamień Nieskończoności'},
{id:'stone_mind',name:'Kamień Umysłu',icon:'💎',cost:35,zone:'armory',type:'Kamień Nieskończoności'},
{id:'stone_reality',name:'Kamień Rzeczywistości',icon:'💎',cost:35,zone:'armory',type:'Kamień Nieskończoności'},
{id:'stone_power',name:'Kamień Mocy',icon:'💎',cost:35,zone:'armory',type:'Kamień Nieskończoności'},
{id:'stone_time',name:'Kamień Czasu',icon:'💎',cost:35,zone:'armory',type:'Kamień Nieskończoności'},
{id:'stone_soul',name:'Kamień Duszy',icon:'💎',cost:35,zone:'armory',type:'Kamień Nieskończoności'},
{id:'arc',name:'Reaktor łukowy Iron Mana',icon:'💠',cost:25,zone:'lab',type:'technologia'},
{id:'quinjet',name:'Quinjet Avengersów',icon:'🛩️',cost:65,zone:'hangar',type:'pojazd'},
{id:'blackwidow',name:'Czarna Wdowa',icon:'🕶️',cost:65,zone:'team',type:'bohater'},
{id:'panther',name:'Czarna Pantera',icon:'🐈‍⬛',cost:65,zone:'team',type:'bohater'},
{id:'captain',name:'Kapitan Ameryka',icon:'⭐',cost:65,zone:'team',type:'bohater'},
{id:'hawkeye',name:'Hawkeye',icon:'🏹',cost:55,zone:'team',type:'bohater'},
{id:'groot',name:'Groot',icon:'🌳',cost:65,zone:'team',type:'bohater'},
{id:'gamora',name:'Gamora',icon:'⚔️',cost:70,zone:'team',type:'bohater'}];
export const ZONES=[['command','Centrum dowodzenia','📡'],['lab','Laboratorium','🔬'],['training','Sala treningowa','🎯'],['hangar','Hangar','🛸'],['armory','Zbrojownia Avengersów','🧰'],['team','Drużyna','🌟']];
export function migrateBase(p){p.base??={version:1,owned:[],activeHero:'guardian'};p.base.owned??=[];if(Array.isArray(p.unlocks))for(const [legacy,id] of [['Tarcza','shield'],['Warsztat','workshop'],['Sieć treningowa','web'],['Hangar','hangar'],['Wieża','tower']])if(p.unlocks.includes(legacy)&&!p.base.owned.includes(id))p.base.owned.push(id);return p.base}

const FIGURES={
 guardian:['#c72c32','#f4c64f','iron'],inventor:['#c82438','#2559a3','spider'],shadow:['#4dbd4d','#593a8b','hulk'],cosmo:['#5276bb','#d52d38','thor'],blackwidow:['#242a34','#b23b36','widow'],panther:['#161b27','#a58fd2','panther'],captain:['#2d559c','#d63846','captain'],hawkeye:['#3b344b','#8a67b4','hawkeye'],groot:['#80522f','#57a950','groot'],gamora:['#47995c','#272339','gamora']
};
const HERO_ASSET={guardian:'iron',inventor:'spider',shadow:'hulk',cosmo:'thor',blackwidow:'widow',panther:'panther',captain:'captain',hawkeye:'hawkeye',groot:'groot',gamora:'gamora'};
const ART_ITEMS=new Set(['helmet','armor','cape','gauntlet','quinjet','shield','web','arc','thorhammer','spidermask']);
function artImage(id,hero=false){const k=hero?(HERO_ASSET[id]||id):id;return `<img class="av-art" src="assets/art/${hero?k+'.svg':'item-'+k+'.svg'}" alt="" loading="lazy">`}
function heroFigure(id){return artImage(id,true)}

const STONES=[
 ['stone_space','Przestrzeni','#2679f4',125,94],['stone_mind','Umysłu','#f8d947',156,115],
 ['stone_reality','Rzeczywistości','#ef334c',184,139],['stone_power','Mocy','#a65bff',211,169],
 ['stone_time','Czasu','#36c46d',166,211],['stone_soul','Duszy','#ff982f',111,183]
];
function gauntletSVG(owned,wide=false){
 const stone=(id,name,color,x,y)=>`<g><circle cx="${x}" cy="${y}" r="12" fill="#091c2a" stroke="#efcf80" stroke-width="3"/><path d="M${x} ${y-9}l8 9-8 9-8-9Z" fill="${owned.has(id)?color:'#263044'}" stroke="${owned.has(id)?'#fff7bd':'#8c8f9d'}" stroke-width="2"/>${owned.has(id)?`<circle cx="${x}" cy="${y}" r="16" fill="${color}" opacity=".18"/>`:''}<title>${name}: ${owned.has(id)?'zdobyty':'miejsce na kamień'}</title></g>`;
 return `<svg class="infinity-gauntlet" viewBox="0 0 330 330" role="img" aria-label="Złota Rękawica Nieskończoności z sześcioma miejscami na kamienie. ${STONES.filter(v=>owned.has(v[0])).length} z 6 kamieni zdobytych"><defs><linearGradient id="ggold" x2="1" y2="1"><stop stop-color="#fff0a0"/><stop offset=".4" stop-color="#d9a63c"/><stop offset=".8" stop-color="#93601d"/><stop offset="1" stop-color="#f7dc77"/></linearGradient></defs><ellipse cx="169" cy="298" rx="93" ry="14" fill="#000" opacity=".4"/><path d="M107 278 L91 207 Q81 181 77 154 L72 99 Q72 76 91 77 Q107 78 111 99 L120 142 L121 52 Q121 31 139 31 Q159 31 159 53 L160 135 L164 36 Q165 16 185 19 Q202 23 200 45 L199 138 L210 67 Q215 47 233 55 Q248 63 241 85 L225 162 Q258 129 275 147 Q292 165 266 191 L228 239 L229 278 Z" fill="url(#ggold)" stroke="#6e471c" stroke-width="7" stroke-linejoin="round"/><path d="M112 214Q165 232 233 209M110 248Q168 265 228 248M131 66L139 133M180 52L180 132M222 92L213 145" fill="none" stroke="#fff3aa" stroke-width="5" opacity=".65"/><path d="M100 277L231 277L231 298L105 298Z" fill="#8b5522" stroke="#e5b95c" stroke-width="4"/>${STONES.map(v=>stone(...v)).join('')}</svg>`;
}
function isoBase(owned){
 const inv=Object.fromEntries(['lab','armory','hangar','team'].map(k=>[k,BASE_ITEMS.filter(it=>it.zone===k&&owned.has(it.id)).map(it=>it.name)]));
 return `<div class="base3d-shell" data-hq3d data-owned="${[...owned].join(',')}" data-inventory="${encodeURIComponent(JSON.stringify(inv))}">
 <div class="base3d-heading"><div><strong>🌆 BAZA AVENGERSÓW — ŚWIAT 3D</strong><small>Obracaj palcem • zbliżaj dwoma palcami • wybierz pomieszczenie</small></div><button type="button" data-hq-full aria-label="Pełny ekran">⛶</button></div>
 <canvas class="base3d-canvas" data-hq-canvas aria-label="Interaktywny trójwymiarowy model bazy z laboratorium, zbrojownią, hangarem i salą drużyny"></canvas>
 <div class="base3d-toolbar"><button type="button" data-hq-zoom="out">−</button><button type="button" data-hq-reset>⌖ Widok ogólny</button><button type="button" data-hq-zoom="in">+</button></div>
 <div class="base3d-rooms"><button data-hq-room="lab">🔬 Laboratorium</button><button data-hq-room="armory">🛡️ Zbrojownia</button><button data-hq-room="hangar">🚀 Hangar</button><button data-hq-room="team">🦸 Drużyna</button></div>
 <p class="base3d-info" data-hq-info>Dotknij pokoju lub obróć bazę, aby obejrzeć jej wyposażenie.</p></div>
 <div class="iso-gauntlet-room"><div class="iso-pedestal"><div class="iso-case-title">GABLOTA ARTEFAKTÓW — KAMIENIE NIESKOŃCZONOŚCI</div>${owned.has('gauntlet')?gauntletSVG(owned):'<div class="iso-locked">🔒 Miejsce na Rękawicę Nieskończoności</div>'}<div class="iso-stone-progress">${STONES.filter(v=>owned.has(v[0])).length}/6 Kamieni Nieskończoności</div></div></div>`;
}

function visualBase(owned,level,activeHero){
 const has=id=>owned.has(id);
 const pictures={
 armor:`<svg viewBox="0 0 110 140"><path d="M34 20L52 10 76 20 90 45 80 74 76 132 58 136 39 132 34 75 20 46Z" fill="#bb1f29" stroke="#f8c957" stroke-width="5"/><path d="M35 23L53 16 75 23 67 42 44 42Z" fill="#f6c857"/><path d="M45 54L65 54 70 79 55 92 40 79Z" fill="#f6c857"/><circle cx="55" cy="70" r="10" fill="#aef7ff"/><path d="M20 48L8 84 21 93 38 65M90 48L102 84 89 93 73 65" fill="#c62530" stroke="#f8c957" stroke-width="4"/><path d="M41 95L38 132 51 136 55 96M69 95L72 132 59 136 55 96" fill="#b21d29" stroke="#f8c957" stroke-width="3"/></svg>`,
 helmet:`<svg viewBox="0 0 110 140"><path d="M24 47Q24 12 55 12Q86 12 86 47L84 95 67 124 43 124 26 95Z" fill="#b91f2a" stroke="#f5c64f" stroke-width="5"/><path d="M35 37L75 37 79 73 67 99 43 99 31 73Z" fill="#f5c64f"/><path d="M33 72L49 75 48 85 35 82M77 72L61 75 62 85 75 82" fill="#b8faff"/><path d="M44 108L66 108" stroke="#8b1722" stroke-width="5"/></svg>`,
 shield:`<svg viewBox="0 0 110 140"><circle cx="55" cy="70" r="50" fill="#b91c35"/><circle cx="55" cy="70" r="39" fill="#fff"/><circle cx="55" cy="70" r="28" fill="#22549c"/><path d="M55 44L62 61 81 61 66 73 72 91 55 80 38 91 44 73 29 61 48 61Z" fill="#fff"/></svg>`,
 cape:`<svg viewBox="0 0 110 140"><path d="M35 21L55 11 75 21 89 50 78 68 85 131 25 131 32 68 21 50Z" fill="#14151d" stroke="#9578c9" stroke-width="4"/><path d="M37 22L55 36 73 22 68 65 55 77 42 65Z" fill="#393345"/><path d="M42 83L55 98 68 83M34 109L55 118 76 109" fill="none" stroke="#ae95e3" stroke-width="4"/><path d="M30 37L22 80M80 37L88 80" stroke="#77708f" stroke-width="7"/></svg>`,
 thorhammer:`<svg viewBox="0 0 110 140"><path d="M49 55L67 55 67 132 49 132Z" fill="#8d5630" stroke="#d9b375" stroke-width="4"/><rect x="13" y="15" width="84" height="51" rx="9" fill="#aab8c7" stroke="#eef5ff" stroke-width="6"/><path d="M28 27H82M28 53H82" stroke="#65788d" stroke-width="5"/></svg>`,
 quinjet:`<svg viewBox="0 0 110 140"><path d="M55 9L69 53 106 93 101 110 64 93 63 127 55 134 47 127 46 93 9 110 4 93 41 53Z" fill="#9cb4d0" stroke="#e7f5ff" stroke-width="4"/><path d="M55 22L63 56 55 79 47 56Z" fill="#37d8ee"/></svg>`,
 spidermask:`<svg viewBox="0 0 110 140"><path d="M55 12Q98 15 91 83L74 122 36 122 19 83Q12 15 55 12Z" fill="#c3263b" stroke="#233b6b" stroke-width="5"/><path d="M23 68L50 76 44 96 26 91ZM87 68L60 76 66 96 84 91Z" fill="#fff"/><path d="M55 16V124M20 48H90M22 83H88M35 24L74 115M75 24L36 115" stroke="#273e65" stroke-width="2" fill="none"/></svg>`
 };
 const item=(id,icon,label)=>has(id)?`<div class="av-prop ${ART_ITEMS.has(id)||HERO_ASSET[id]?'av-illustrated':''} ${HERO_ASSET[id]?'av-character':''}" title="${label}"><div class="av-object">${HERO_ASSET[id]?heroFigure(id):ART_ITEMS.has(id)?artImage(id):`<span class="av-emoji">${icon}</span>`}</div><small>${label}</small></div>`:'';


 const wall=level>3?'#445f9a':'#315080';
 return `<div class="av-scene" role="img" aria-label="Wizualna Baza Avengersów. Pomieszczenia i wyposażenie zmieniają się po odblokowaniu.">
 <div class="av-moon"></div><div class="av-skyline"><span>✦</span><span>✧</span><span>✦</span></div>
 <div class="av-building av-skyscraper" style="--wall:${wall}"><div class="av-windows">${Array.from({length:16},(_,i)=>`<i style="--i:${i}"></i>`).join('')}</div>
 <div class="av-antenna"></div><div class="av-wing av-wing-left"></div><div class="av-wing av-wing-right"></div><div class="av-roof">${has('tower')?'📡 WIEŻA AVENGERSÓW':'⚡ BAZA AVENGERSÓW'} <span class="av-logo">A</span></div>
 <div class="av-floors">
 <div class="av-room av-lab"><strong>🔬 LABORATORIUM</strong><div class="av-room-decor"><span class="av-screen"></span><span class="av-tank"></span><span class="av-console"></span></div><div class="av-props">${item('workshop','🧰','Warsztat Starka')}${item('reactor','⚡','Energia')}${item('robot','🤖','Robot')}${item('arc','💠','Reaktor')}</div></div>
 <div class="av-room av-armory"><strong>🛡️ ZBROJOWNIA</strong><div class="av-room-decor"><span class="av-display"></span><span class="av-display"></span><span class="av-display"></span></div><div class="av-props av-armory-display">${item('armor','🦾','Zbroja Iron Mana')}${item('helmet','🔴','Maska Iron Mana')}${item('shield','🛡️','Tarcza Kapitana')}${item('cape','🐈‍⬛','Strój Pantery')}${item('thorhammer','🔨','Mjolnir')}${item('spidermask','🕷️','Maska Spider-Mana')}${item('vibranium','🐾','Pazury Pantery')}${item('boots','👢','Buty Iron Mana')}${item('spiderweb','🕸️','Sieci')}${has('gauntlet')?`<div class="av-gauntlet-display">${gauntletSVG(owned)}</div>`:''}</div></div>
 <div class="av-room av-hangar"><strong>🚀 HANGAR</strong><div class="av-room-decor"><span class="av-runway"></span><span class="av-gate"></span></div><div class="av-props">${item('hangar','🛬','Hangar')}${item('quinjet','🛩️','Quinjet')}</div></div>
 <div class="av-room av-training"><strong>🎯 TRENING I MISJE</strong><div class="av-room-decor"><span class="av-target"></span><span class="av-target"></span></div><div class="av-props">${item('web','🕸️','Sieć treningowa')}${item('portal','🌀','Portal')}</div></div>
 </div><div class="av-team av-lounge"><strong>DRUŻYNA AVENGERSÓW</strong><div class="av-room-decor"><span class="av-sofa"></span><span class="av-table"></span></div><div class="av-props">${item('guardian','🦾','Iron Man')}${item('inventor','🕷️','Spider-Man')}${item('shadow','💚','Hulk')}${item('cosmo','⚡','Thor')}${item('blackwidow','🕶️','Czarna Wdowa')}${item('panther','🐈‍⬛','Czarna Pantera')}${item('captain','⭐','Kapitan Ameryka')}${item('hawkeye','🏹','Hawkeye')}${item('groot','🌳','Groot')}${item('gamora','⚔️','Gamora')}</div></div>
 </div><div class="av-ground">🌳 ✨ 🌳</div></div>`
}
export function baseMarkup(p,button,preview=false){const b=migrateBase(p),owned=new Set(b.owned),level=1+Math.floor(p.xp/100),available=BASE_ITEMS.filter(x=>owned.has(x.id));return `<section class="card"><h2>🏙️ Baza Avengersów</h2><p>Poziom <b>${level}</b> · <b>${p.coins}</b> złotych · ${available.length}/${BASE_ITEMS.length} elementów</p>${isoBase(owned)}<details class="old-base"><summary>Pokaż również przekrój wieży</summary>${visualBase(owned,level,p.hero||'iron')}</details><p class="muted">Każdy odblokowany przedmiot pojawia się w odpowiednim pomieszczeniu. Dotychczasowe zakupy zostają zachowane.</p></section>`+ZONES.map(([zone,title,icon])=>`<section class="card"><h3>${icon} ${title}</h3><div class="base-grid">${BASE_ITEMS.filter(x=>x.zone===zone).map(item=>`<div class="base-item ${owned.has(item.id)?'owned':''}"><div class="base-icon">${item.id==='gauntlet'?gauntletSVG(owned):item.id.startsWith('stone_')?`<span class="gem-catalog" style="--gem:${STONES.find(v=>v[0]===item.id)?.[2]||'#fff'}">◆</span>`:HERO_ASSET[item.id]?heroFigure(item.id):ART_ITEMS.has(item.id)?artImage(item.id):item.icon}</div><b>${item.name}</b><small>${item.type}</small>${owned.has(item.id)?'<span class="base-tag">✓ W bazie</span>':`<span class="base-price">${item.cost?item.cost+' złotych':'🎁 GRATIS'}</span>${preview?'':button('Odblokuj','base:buy:'+item.id,p.coins>=item.cost?'gold':'alt')}`}</div>`).join('')}</div></section>`).join('')}
