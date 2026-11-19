// Supplied illustrations are independent transparent components. Layout is
// normal document flow; image rectangles are never used as a second UI layer.
export const art124=(name,cls='')=>`<img class="${cls}" src="assets/interface124/${name}.webp" alt="" draggable="false">`;
export const pageCount124=n=>n+' '+(n===1?'strona':[2,3,4].includes(n%10)&&![12,13,14].includes(n%100)?'strony':'stron');
const sr=s=>`<span class="academy102-sr">${s}</span>`;
const at=([x,y,w,h],[W,H])=>`left:${x/W*100}%;top:${y/H*100}%;width:${w/W*100}%;height:${h/H*100}%`;
export const voice124=voice=>voice.replace('</button>',art124('voice')+'</button>');
const back124=()=>`<button type="button" class="academy124-back" data-back119 aria-label="Wróć">${art124('back')}</button>`;
const heading124=(subject,voice='')=>`<header class="academy124-heading"><div class="academy124-top">${back124()}</div><h2>${art124('rocket')}<span>${subject}</span></h2>${voice?`<span class="academy124-voice">${voice124(voice)}</span>`:''}</header>`;
const particles=()=>'<span class="academy124-particles" aria-hidden="true"><i>A</i><i>3</i><i>✦</i></span>';

export function training124Material({subject,voice='',hasPages=true,step='source'}){
 return `<section class="academy124-flow academy124-material" data-interface119="range" data-interface124="material" data-v77-step="${step}">
  ${heading124(subject)}
  <nav class="academy124-material-tabs" aria-label="Rodzaj materiału"><span>Materiał z książek</span><button type="button" data-action="training:source:outside">Inne materiały →</button></nav>
  <h3 class="academy124-scope-label">Wybierz zakres <span class="academy124-voice">${voice124(voice)}</span></h3>
  <div class="academy124-scope-cards">
   <button type="button" class="academy124-card academy124-books" data-motion121="books" data-action="training:books:all"${hasPages?'':' disabled'} aria-label="Cały materiał z książek">${art124('books','academy124-card-icon')}<strong>Cały materiał z książek</strong>${particles()}</button>
   <button type="button" class="academy124-card academy124-pages" data-motion121="pages" data-action="training:books:pick"${hasPages?'':' disabled'} aria-label="Wybierz książkę, dział lub strony">${art124('pages','academy124-card-icon')}<strong>Wybierz książkę, dział<br>lub strony</strong>${particles()}</button>
  </div>
  ${hasPages?'':'<p class="academy124-empty" role="status">Brak stron z odczytanym tekstem. Wybierz „Inne materiały” albo dodaj strony w panelu mamy.</p>'}
 </section>`;
}
function mode124(kind,art,label,description,action){return `<button type="button" class="academy124-card academy124-${kind}" data-action="${action}" data-motion121="${art}" aria-label="${label}" aria-description="${description}"><span class="academy124-tab" aria-hidden="true"></span>${art124(art,'academy124-card-icon')}<strong>${label}</strong><small>${description}</small>${particles()}</button>`;}
export function training124Options({subject,source,count,voice,hasPages}){
 if(!source)return training124Material({subject,voice,hasPages});
 const pages=count===1?'strona':[2,3,4].includes(count%10)&&![12,13,14].includes(count%100)?'strony':'stron';
 return `<section class="academy124-flow academy124-options" data-interface119="options" data-interface124="options" data-v77-step="train-options">
  ${heading124(subject)}<p class="academy124-subtitle">${source==='books'?'Materiał z książek · '+count+' '+pages:'Inne materiały'}</p>
  <div class="academy124-modes">
   ${mode124('practice','dice','Trenuj','Losowa mieszanka gier i zadań','training:mixed:start')}
   ${mode124('choose','controller','Wybierz grę','Wybrana gra, losowe zadania','training:catalog')}
   ${mode124('assessment','trophy','Sprawdzian','Różne zadania bez podpowiedzi','training:assessment')}
  </div>
 </section>`;
}
export function training124Picker({subject,voice,tools,books,count,nextLabel}){
 return `<section class="academy124-flow academy124-picker" data-interface119="pick" data-interface124="pick" data-v77-step="pick">
  ${heading124(subject)}<h3 class="academy124-picker-label">Zaznacz książki, działy lub strony <span class="academy124-voice">${voice124(voice)}</span></h3>
  <div class="academy124-tools">${tools}</div><div class="academy124-book-list">${books||'<p class="academy124-empty">Nie ma jeszcze stron z zapisanym tekstem w tym przedmiocie.</p>'}</div>
  <p id="tr71-count" class="academy124-count" role="status" aria-live="polite">Zaznaczono ${pageCount124(count)}.</p>
  <button type="button" class="academy124-next" data-action="training:start" aria-label="${nextLabel}">${nextLabel==='Dalej · wybierz tryb'?art124('next')+sr(nextLabel):nextLabel}</button>
 </section>`;
}
export function microphone124(){return `<button type="button" class="mic academy102-mic academy124-mic" data-action="mic" aria-label="Zadaj pytanie">${art124('mic')}</button>`;}
export function choices124(){return `<nav class="academy102-choices academy124-choices" aria-label="Wybór widoku">${[['classic','Widok klasyczny'],['walk','Spacer po bazie']].map(([key,label])=>`<button type="button" class="academy124-view" data-action="hq:view:${key}" aria-label="${label}">${art124(key)}${sr(label)}</button>`).join('')}</nav>`;}

export function entry124({release,profiles,status,linked,parent,pair,update,portrait}){
 const size=[853,1844],rects={pawel:[26,550,807,436],patryk:[26,987,807,425]};
 return `<main class="academy124-entry"><div class="academy124-entry-board">
  ${art124('entry-scene','academy124-entry-scene')}<h1 class="academy102-sr">Akademia Superbohaterów</h1><p class="academy102-sr">Wybierz swoją bazę. Witaj w Akademii! Każdy bohater ma własne misje i nagrody.</p><span class="academy124-release">V${release}</span>
  ${profiles.map(({id,name,grade,coins,progress,hero})=>{
   const native=hero===(id==='pawel'?'hulk':'spider'),pct=Math.max(0,Math.min(100,Number(progress)||0));
   return `<button type="button" class="academy124-profile academy124-profile-${id}" style="${at(profiles.length===1?rects.pawel:rects[id],size)}" data-action="enter:${id}" aria-label="${name}, ${grade}, ${coins} złotych">${art124('profile-'+id+(native?'':'-other'))}${native?'':`<img class="academy124-other-hero" src="${portrait(hero)}" alt="" draggable="false">`}<span class="academy124-profile-name">${name}</span><span class="academy124-profile-grade">${grade} · ${coins} złotych</span><span class="academy124-progress" role="progressbar" aria-label="Postęp ${pct}%" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}"><span style="width:${pct}%"></span></span></button>`;
  }).join('')}
  <span class="academy124-entry-audio" style="${at([272,1408,315,121],size)}">${(profiles.find(p=>p.audio)?.audio||'').replace('</button>',art124('entry-listen')+'</button>')}</span>
  ${parent?`<button type="button" class="academy124-parent" data-action="enter:admin" aria-label="Centrum dowodzenia mamy" style="${at([15,1525,824,204],size)}">${art124('entry-parent')}</button>`:''}
  </div><details class="academy124-connection"><summary>Połączenie i aktualizacja</summary><p${linked?' data-sync78-message role="status"':''}>${status}</p>${pair}${update?'<button type="button" data-action="academy:update" aria-label="Aktualizuj Akademię">Aktualizuj Akademię</button>':''}</details></main>`;
}
