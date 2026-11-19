import {interfaceSources121 as sources,subjectTiles121 as tiles,knowledgePieces121 as pieces} from './interface121/source-map.js?v=121';

// All coordinates are read in each supplied file's actual pixel space.
export function crop121(source,[x,y,w,h],className=''){
 const file=sources[source];
 return `<span class="art121 ${className}" aria-hidden="true" style="--crop121-ratio:${w/h};aspect-ratio:${w}/${h}"><img src="assets/interface121/${file.file}" alt="" draggable="false" style="width:${file.width/w*100}%;left:${-x/w*100}%;top:${-y/h*100}%"></span>`;
}
const slot=(rect,[w,h])=>`left:${rect[0]/w*100}%;top:${rect[1]/h*100}%;width:${rect[2]/w*100}%;height:${rect[3]/h*100}%`;
const sr=text=>`<span class="academy102-sr">${text}</span>`;
const piece=(key,rect,parent,cls)=>`<span class="academy121-piece ${cls}" style="${slot([rect[0]-parent[0],rect[1]-parent[1],rect[2],rect[3]],[parent[2],parent[3]])}">${crop121(key,rect)}</span>`;
const decorateVoice=(voice,art)=>voice.replace('</button>',art+'</button>');

export function entry121({release,profiles,status,linked,parent,pair,update,portrait}){
 return `<main class="academy107-entry academy121-entry">
  <header class="academy107-entry-header"><h1>${crop121('entry',[77,87,470,55])}${sr('Akademia Superbohaterów')}<span>V${release}</span></h1><p>Wybierz swoją bazę</p></header>
  <section class="academy107-welcome academy121-welcome">${crop121('entry',[20,200,666,295])}<h2 class="academy102-sr">Witaj w Akademii!</h2><p class="academy102-sr">Każdy bohater ma własne misje i nagrody.</p></section>
  <div class="academy107-profiles">${profiles.map(({id,name,grade,coins,progress,hero,audio})=>{
   const pct=Math.max(0,Math.min(100,Number(progress)||0));
   return `<div class="academy107-profile"><button type="button" class="academy107-profile-card academy107-profile-${id} academy121-profile" data-action="enter:${id}" aria-label="${name}, ${grade}, ${coins} złotych">
    <img class="academy121-profile-frame" src="assets/interface121/profile-${id}.svg" alt="" draggable="false">
    <img class="academy107-profile-hero academy121-profile-hero${['hulk','spider'].includes(hero)?' is-source-hero':''}" data-hero121="${hero}" src="${portrait(hero)}" alt="" draggable="false">
    <span class="academy107-profile-name">${name}</span><span class="academy107-profile-grade">${grade} · ${coins} złotych</span>
    <span class="academy107-profile-progress" role="progressbar" aria-label="Postęp ${pct}%" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}"><span style="width:${pct}%"></span></span>
   </button>${audio}</div>`;
  }).join('')}</div>
  ${parent?`<section class="academy107-link-panel academy121-parent"><button type="button" class="academy107-entry-art academy121-parent-button" data-action="enter:admin" aria-label="Centrum dowodzenia mamy">${crop121('entry',[25,1326,663,164])}</button></section>`:''}
  <details class="academy121-connection"><summary>Połączenie i aktualizacja</summary><p${linked?' data-sync78-message role="status"':''}>${status}</p>${pair}${update?'<button type="button" data-action="academy:update" aria-label="Aktualizuj Akademię">Aktualizuj Akademię</button>':''}</details>
 </main>`;
}

export function dashboard121(destinations,speak,current){
 const rects=[[14,100,386,216],[401,100,381,216],[14,318,386,211],[401,318,381,211],[14,529,386,212],[401,529,381,212]];
 return `<nav class="academy102-destinations academy121-dashboard" aria-label="Menu Akademii">${destinations.map(([picture,label,tab],i)=>{
  const rect=rects[i],voice=[rect[0]+rect[2]-.245*rect[2],rect[1]+rect[3]-.43*rect[3],rect[2]*.24,rect[3]*.43];
  return `<div class="academy102-voiced" data-destination="${picture}"><button type="button" class="academy104-destination" data-action="child:${tab}" aria-label="${label}"${tab===current?' aria-current="page"':''}><span class="academy121-dashboard-art">${crop121('dashboard',rect)}</span></button>${decorateVoice(speak(label),crop121('dashboard',voice))}</div>`;
 }).join('')}</nav>`;
}

function knowledgeMotion(){
 return `<span class="academy121-motion" aria-hidden="true">${Object.entries(pieces).map(([name,rect])=>piece('subjects',rect,tiles.knowledge,name==='globe'?'academy121-globe':'academy121-letter')).join('')}</span>`;
}
export function training121Subjects(voice,extras=''){
 const list=[['knowledge','wiedza','Wiedza ogólna'],['polish','polski','Polski'],['math','matematyka','Matematyka'],['english','angielski','Angielski'],['nature','przyroda','Przyroda'],['chemistry','','Chemia'],['physics','','Fizyka']];
 const {width,height}=sources.subjects;
 return `<section class="academy121-subject-page" data-interface119="subjects" data-v77-step="subject">
  <div class="academy121-subject-board"><img class="academy121-subject-scene" src="assets/interface121/subjects-scene.svg" alt="" draggable="false">
   <h2 class="academy102-sr">Trenuj</h2><p class="academy102-sr">Wybierz przedmiot</p>
   <button type="button" class="academy121-back academy121-subject-back" data-back119 aria-label="Wróć" style="${slot(tiles.back,[width,height])}">${crop121('subjects',tiles.back)}</button>
   <span class="academy121-subject-voice" style="${slot(tiles.voice,[width,height])}">${decorateVoice(voice,crop121('subjects',tiles.voice))}</span>
   ${list.map(([id,key,label])=>`<button type="button" class="academy121-subject${key?' tr72-subject-card':''}" data-theme="${key}" style="${slot(tiles[id],[width,height])}" ${key?`data-action="training:subject:${encodeURIComponent(label)}" aria-label="Wybierz przedmiot ${label}"`:`disabled aria-label="${label} — w przygotowaniu"`}>
    ${crop121('subjects',tiles[id],'academy121-subject-face')}${sr(label)}
    ${key==='wiedza'?`<img class="academy121-clean-knowledge" src="assets/interface121/knowledge-moving-base.svg" alt="" draggable="false">${knowledgeMotion()}`:key?`<span class="academy121-motion academy121-subject-particles" aria-hidden="true">${key==='przyroda'?'<i class="academy121-butterfly">🦋</i>':key==='matematyka'?'<i>2</i><i>+</i><i>3</i><i>=</i><i>5</i>':key==='polski'?'<i>A</i><i>Ą</i><i>b</i>':'<i>Hello!</i><i>Hi!</i>'}</span>`:''}
   </button>`).join('')}
  </div>${extras?`<div class="tr71 tr72-subject-grid academy121-extras">${extras}</div>`:''}
 </section>`;
}

const back=()=>`<button type="button" class="academy121-back" data-back119 aria-label="Wróć">${crop121('subjects',tiles.back)}</button>`;
const heading=title=>`<header class="academy121-heading">${back()}<h2>${crop121('subjects',[239,44,105,115],'academy121-rocket')}<span>${title}</span></h2></header>`;
const illustrations={
 dice:['modes',[141,393,467,391]],controller:['modes',[905,419,498,359]],trophy:['modes',[403,1254,216,190]],
 books:['range',[211,622,289,234]],pages:['range',[216,1048,270,234]],planet:['subjects',[246,352,223,226]]
};
function choice(kind,title,description,action,art,disabled=false){
 return `<button type="button" class="academy121-choice academy121-${kind}" data-action="${action}" data-motion121="${art}"${disabled?' disabled':''} aria-label="${title}"${description?` aria-description="${description}"`:''}>
  <span class="academy121-illustration">${crop121(...illustrations[art])}${['books','pages'].includes(art)?'<span class="academy121-book-particles" aria-hidden="true"><i>A</i><i>3</i><i>✦</i></span>':''}</span><strong>${title}</strong>${description?`<small>${description}</small>`:''}
 </button>`;
}
export function training121Options({subject,source,count}){
 const cards=source?
  choice('practice','Trenuj','Losowa mieszanka gier i zadań','training:mixed:start','dice')+
  choice('choose','Wybierz grę','Wybrana gra, losowe zadania','training:catalog','controller')+
  choice('assessment','Sprawdzian','Różne zadania bez podpowiedzi','training:assessment','trophy'):
  choice('books','Materiał z książek','Cała książka, dział lub strony','training:source:books','books')+
  choice('outside','Inne materiały','Zadania spoza książek','training:source:outside','planet');
 return `<section class="academy121-page academy121-options academy115-flow" data-interface119="options" data-v77-step="${source?'train-options':'source'}">
  ${heading(subject)}<p class="academy121-subtitle">${source==='books'?'Materiał z książek · '+count+(count===1?' strona':[2,3,4].includes(count%10)&&![12,13,14].includes(count%100)?' strony':' stron'):source==='outside'?'Inne materiały':'Wybierz materiał'}</p>
  <div class="academy121-choices${source?' has-modes':''}">${cards}</div>
 </section>`;
}
export function training121Range({subject,voice,hasPages}){
 return `<section class="academy121-page academy121-range" data-interface119="range" data-v77-step="range">
  ${heading(subject)}<h3>Wybierz zakres <span class="academy121-range-voice">${decorateVoice(voice,crop121('range',[290,452,134,106]))}</span></h3>
  <div class="academy121-range-choices">
   ${choice('all','Cały materiał z książek','','training:range:all','books',!hasPages)}
   ${choice('pages','Wybierz książkę, dział lub strony','','training:range:pick','pages',!hasPages)}
  </div>${hasPages?'':'<p class="academy121-empty" role="status">Brak stron z odczytanym tekstem dla tego przedmiotu. Wybierz inne materiały albo dodaj strony w panelu mamy.</p>'}
 </section>`;
}
