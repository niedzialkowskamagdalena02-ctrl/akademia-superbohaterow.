import {interfaceSources121 as sources,subjectTiles121 as tiles,knowledgePieces121 as pieces} from './interface121/source-map.js?v=121';

// All coordinates are read in each supplied file's actual pixel space.
export function crop121(source,[x,y,w,h],className=''){
 const file=sources.subjects;
 return `<span class="art121 ${className}" aria-hidden="true" style="--crop121-ratio:${w/h};aspect-ratio:${w}/${h}"><img src="assets/interface121/subjects.webp" alt="" draggable="false" style="width:${file.width/w*100}%;left:${-x/w*100}%;top:${-y/h*100}%"></span>`;
}
const slot=(rect,[w,h])=>`left:${rect[0]/w*100}%;top:${rect[1]/h*100}%;width:${rect[2]/w*100}%;height:${rect[3]/h*100}%`;
const sr=text=>`<span class="academy102-sr">${text}</span>`;
const piece=(key,rect,parent,cls)=>`<span class="academy121-piece ${cls}" style="${slot([rect[0]-parent[0],rect[1]-parent[1],rect[2],rect[3]],[parent[2],parent[3]])}">${crop121(key,rect)}</span>`;
const decorateVoice=(voice,art)=>voice.replace('</button>',art+'</button>');

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
