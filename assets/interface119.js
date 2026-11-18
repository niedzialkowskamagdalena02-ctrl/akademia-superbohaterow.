// These are viewports onto the user's original files. No illustration is redrawn.
const sheets={subjects:[1114,1536],range:[695,1536],modes:[1413,1536]};
export function crop119(sheet,[x,y,w,h],extra=''){
 const [sw]=sheets[sheet];
 return `<span class="art119 ${extra}" aria-hidden="true" style="aspect-ratio:${w}/${h}"><img src="assets/interface119/${sheet}.webp" alt="" draggable="false" style="width:${sw/w*100}%;left:${-x/w*100}%;top:${-y/h*100}%"></span>`;
}
const back119=()=>`<button type="button" class="academy119-back" data-back119 aria-label="Wróć">${crop119('range',[0,8,212,112])}<span class="academy102-sr">Wróć</span></button>`;
const heading119=(title,training=false)=>`<header class="academy119-heading">${back119()}<h2>${training?crop119('subjects',[361,19,399,146]):title}${training?'<span class="academy102-sr">Trenuj</span>':''}</h2></header>`;
export function training119Subjects(voice,extras=''){
 const subjects=[
  ['wiedza','Wiedza ogólna',[110,335,922,419]],
  ['polski','Polski',[59,821,298,289]],
  ['matematyka','Matematyka',[419,818,297,292]],
  ['angielski','Angielski',[780,818,297,292]],
  ['przyroda','Przyroda',[64,1181,292,293]],
  ['','Chemia',[420,1181,298,293]],
  ['','Fizyka',[780,1180,298,294]]
 ];
 const tile=([key,label,picture])=>`<button type="button" class="academy119-subject${key?' tr72-subject-card':''}${key==='wiedza'?' academy119-knowledge':''}" ${key?`data-theme="${key}" data-action="training:subject:${encodeURIComponent(label)}" aria-label="Wybierz przedmiot ${label}"`:`disabled aria-label="${label} — w przygotowaniu"`}>${crop119('subjects',picture,'subject119-picture')}</button>`;
 return `<section class="academy119-page academy119-subjects" data-interface119="subjects" data-v77-step="subject">
  <header class="academy119-subject-header">${crop119('subjects',[0,0,1114,288])}${back119()}<h2 class="academy102-sr">Trenuj</h2><p class="academy102-sr">Wybierz przedmiot</p><span class="academy119-subject-voice">${voice}</span></header>
  ${tile(subjects[0])}<div class="academy119-subject-grid">${subjects.slice(1).map(tile).join('')}</div>
  ${extras?`<div class="tr71 tr72-subject-grid academy119-extras">${extras}</div>`:''}
 </section>`;
}
const illustration119=(name)=>{
 const crops={dice:['modes',[141,393,467,391]],controller:['modes',[905,419,498,359]],trophy:['modes',[403,1254,216,190]],books:['range',[224,627,265,222]],pages:['range',[220,1053,252,227]]};
 return crop119(...crops[name]);
};
function choice119(kind,title,description,action,art,disabled=false){
 return `<button type="button" class="academy119-choice academy119-${kind}" data-action="${action}"${disabled?' disabled':''} aria-label="${title}" aria-description="${description}">
  <span class="academy119-illustration">${art}</span><strong>${title}</strong>${description?`<small>${description}</small>`:''}
 </button>`;
}
export function training119Options({subject,source,count,booksArt,outsideArt}){
 const cards=source?
  choice119('practice','Trenuj','Losowa mieszanka gier i zadań','training:mixed:start',illustration119('dice'))+
  choice119('choose','Wybierz grę','Wybrana gra, losowe zadania','training:catalog',illustration119('controller'))+
  choice119('assessment','Sprawdzian','Różne zadania bez podpowiedzi','training:assessment',illustration119('trophy')):
  choice119('books','Materiał z książek','Cała książka, dział lub strony','training:source:books',booksArt)+
  choice119('outside','Inne materiały','Zadania spoza książek','training:source:outside',outsideArt);
 return `<section class="academy119-page academy119-options academy115-flow" data-interface119="options" data-v77-step="${source?'train-options':'source'}">
  ${heading119(subject)}<p class="academy119-subtitle">${source==='books'?'Materiał z książek · '+count+(count===1?' strona':[2,3,4].includes(count%10)&&![12,13,14].includes(count%100)?' strony':' stron'):source==='outside'?'Inne materiały':'Wybierz materiał'}</p>
  <div class="academy119-choices${source?' has-modes':''}">${cards}</div>
 </section>`;
}
export function training119Range({subject,voice,hasPages}){
 return `<section class="academy119-page academy119-range" data-interface119="range" data-v77-step="range">
  ${heading119(subject)}<h3>Wybierz zakres <span class="academy119-range-voice">${crop119('range',[290,452,134,106])}${voice}</span></h3>
  <div class="academy119-range-choices">
   ${choice119('all','Cały materiał z książek','','training:range:all',illustration119('books'),!hasPages)}
   ${choice119('pages','Wybierz książkę, dział lub strony','','training:range:pick',illustration119('pages'),!hasPages)}
  </div>${hasPages?'':'<p class="academy119-empty" role="status">Brak stron z odczytanym tekstem dla tego przedmiotu. Wybierz inne materiały albo dodaj strony w panelu mamy.</p>'}
 </section>`;
}
