// Native artwork layers keep each frame, illustration and glow together.
// The approved V121 subject board is intentionally left in interface121.js.
const size={entry:[710,1536],scope:[695,1463]};
const at=([x,y,w,h],[W,H])=>`left:${x/W*100}%;top:${y/H*100}%;width:${w/W*100}%;height:${h/H*100}%`;
const img=(name,cls='')=>`<img class="${cls}" src="assets/interface122/${name}.webp" alt="" draggable="false">`;
const sr=text=>`<span class="academy102-sr">${text}</span>`;
const voiceWithArt=(voice,name)=>voice.replace('</button>',img(name)+'</button>');

export function entry122({release,profiles,status,linked,parent,pair,update,portrait}){
 const rects={pawel:[34,501,646,360],patryk:[34,879,646,354]};
 const single=profiles.length===1;
 return `<main class="academy107-entry academy122-entry">
  <div class="academy122-entry-board${single?' is-single':''}">
   ${img('entry-scene','academy122-scene')}
   <header class="academy122-entry-header"><h1 class="academy102-sr">Akademia Superbohaterów</h1><p class="academy102-sr">Wybierz swoją bazę</p><span class="academy122-release">V${release}</span></header>
   <section class="academy122-welcome"><h2 class="academy102-sr">Witaj w Akademii!</h2><p class="academy102-sr">Każdy bohater ma własne misje i nagrody.</p></section>
   ${profiles.map(({id,name,grade,coins,progress,hero})=>{
    const native=hero===(id==='pawel'?'hulk':'spider');
    const pct=Math.max(0,Math.min(100,Number(progress)||0));
    const box=single?rects.pawel:rects[id];
    return `<button type="button" class="academy122-profile" style="${at(box,size.entry)}" data-action="enter:${id}" aria-label="${name}, ${grade}, ${coins} złotych">
     ${img('profile-'+id+(native?'':'-other'),'academy122-card-art')}
     ${native?'':`<img class="academy122-other-hero" src="${portrait(hero)}" alt="" draggable="false">`}
     <span class="academy122-profile-name">${name}</span><span class="academy122-profile-grade">${grade} · ${coins} złotych</span>
     <span class="academy122-progress" role="progressbar" aria-label="Postęp ${pct}%" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}"><span style="width:${pct}%"></span></span>
    </button>`;
   }).join('')}
   <span class="academy122-entry-audio" style="${at([254,1237,201,82],size.entry)}">${voiceWithArt(profiles.find(p=>p.audio)?.audio||'', 'entry-listen')}</span>
   ${parent?`<button type="button" class="academy122-parent" data-action="enter:admin" aria-label="Centrum dowodzenia mamy" style="${at([25,1326,663,164],size.entry)}">${img('entry-parent')}</button>`:''}
  </div>
  <details class="academy122-connection"><summary>Połączenie i aktualizacja</summary><p${linked?' data-sync78-message role="status"':''}>${status}</p>${pair}${update?'<button type="button" data-action="academy:update" aria-label="Aktualizuj Akademię">Aktualizuj Akademię</button>':''}</details>
 </main>`;
}

const detail123=()=>`<svg class="academy123-filters" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs><filter id="academy123-detail" color-interpolation-filters="sRGB" x="-1%" y="-1%" width="102%" height="102%"><feGaussianBlur in="SourceGraphic" stdDeviation=".32" result="soft"/><feComposite in="SourceGraphic" in2="soft" operator="arithmetic" k1="0" k2="1.3" k3="-.3" k4="0"/></filter></defs></svg>`;
const art123=(name,cls='')=>`<img class="${cls}" src="assets/interface123/${name}.svg" alt="" draggable="false">`;
const back=()=>`<button type="button" class="academy122-back" data-back119 aria-label="Wróć"><svg class="academy123-back-art" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 225 128" aria-hidden="true"><defs><linearGradient id="back123" x2="0" y2="1"><stop stop-color="#2789ba"/><stop offset=".42" stop-color="#176393"/><stop offset="1" stop-color="#0c315d"/></linearGradient><filter id="back123glow" x="-25%" y="-50%" width="150%" height="200%"><feGaussianBlur stdDeviation="4"/></filter></defs><rect x="9" y="14" width="200" height="94" rx="27" fill="none" stroke="#40d8ff" stroke-width="7" opacity=".7" filter="url(#back123glow)"/><rect x="9" y="14" width="200" height="94" rx="27" fill="url(#back123)" stroke="#67ddfa" stroke-width="3"/><rect x="15" y="20" width="188" height="82" rx="22" fill="none" stroke="#8dc9e4" stroke-opacity=".4" stroke-width="2"/><path d="M68 61H40m14-14L40 61l14 14" fill="none" stroke="#edfaff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></svg><span class="academy123-back-label">Wróć</span></button>`;
const title=subject=>subject==='Wiedza ogólna'?`${img('scope-title')}${sr(subject)}`:`<span>${subject}</span>`;
const particles=()=>'<span class="academy122-particles" aria-hidden="true"><i>A</i><i>3</i><i>✦</i></span>';

export function training122Material({subject,voice='',hasPages=true,step='source'}){
 return `<section class="academy122-material" data-interface119="range" data-v77-step="${step}">
  ${detail123()}
  <div class="academy122-scope-board">
   ${art123('scope-scene','academy122-scene')}
   <span class="academy122-scope-back" style="${at([0,0,225,128],size.scope)}">${back()}</span>
   <h2 class="academy122-scope-title" style="${at([202,194,403,86],size.scope)}">${title(subject)}</h2>
   <div class="academy122-material-tabs" aria-label="Rodzaj materiału"><span>Materiał z książek</span><button type="button" data-action="training:source:outside">Inne materiały →</button></div>
   <h3 class="academy102-sr">Wybierz zakres</h3>
   <span class="academy122-scope-voice" style="${at([280,442,150,121],size.scope)}">${voice}</span>
   <button type="button" class="academy122-scope-card academy122-all" data-motion121="books" data-action="training:books:all" style="${at([18,565,670,443],size.scope)}"${hasPages?'':' disabled'} aria-label="Cały materiał z książek">
    ${art123('scope-all','academy122-card-art')}<strong>Cały materiał z książek</strong>${particles()}
   </button>
   <button type="button" class="academy122-scope-card academy122-pick" data-motion121="pages" data-action="training:books:pick" style="${at([18,1009,677,450],size.scope)}"${hasPages?'':' disabled'} aria-label="Wybierz książkę, dział lub strony">
    ${img('scope-pick','academy122-card-art')}<strong>Wybierz książkę, dział<br>lub strony</strong>${particles()}
   </button>
   ${hasPages?'':'<p class="academy122-empty" role="status">Brak stron z odczytanym tekstem. Wybierz „Inne materiały” albo dodaj strony w panelu mamy.</p>'}
  </div>
 </section>`;
}

function mode(kind,label,description,action){
 return `<button type="button" class="academy122-mode academy122-${kind}" data-action="${action}" data-motion121="${kind}" aria-label="${label}" aria-description="${description}">
  ${img('mode-'+kind,'academy122-card-art')}<strong>${label}</strong><small>${description}</small>${particles()}
 </button>`;
}
export function training122Options({subject,source,count,voice,hasPages}){
 if(!source)return training122Material({subject,voice,hasPages});
 const pages=count===1?'strona':[2,3,4].includes(count%10)&&![12,13,14].includes(count%100)?'strony':'stron';
 return `<section class="academy122-options" data-interface119="options" data-v77-step="train-options">
  ${detail123()}
  <header class="academy122-modes-header">${back()}<h2>${subject}</h2></header>
  <p class="academy122-subtitle">${source==='books'?'Materiał z książek · '+count+' '+pages:'Inne materiały'}</p>
  <div class="academy122-mode-grid">
   ${mode('practice','Trenuj','Losowa mieszanka gier i zadań','training:mixed:start')}
   ${mode('choose','Wybierz grę','Wybrana gra, losowe zadania','training:catalog')}
   ${mode('assessment','Sprawdzian','Różne zadania bez podpowiedzi','training:assessment')}
  </div>
 </section>`;
}
