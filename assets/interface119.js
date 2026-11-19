import {training121Subjects,training121Options,training121Range} from './interface121.js?v=121';
// These are viewports onto the user's original files. No illustration is redrawn.
const sheets={subjects:[1114,1536],range:[695,1536],modes:[1413,1536]};
export function crop119(sheet,[x,y,w,h],extra=''){
 const [sw]=sheets[sheet];
 return `<span class="art119 ${extra}" aria-hidden="true" style="aspect-ratio:${w}/${h}"><img src="assets/interface119/${sheet}.webp" alt="" draggable="false" style="width:${sw/w*100}%;left:${-x/w*100}%;top:${-y/h*100}%"></span>`;
}
export function training119Subjects(voice,extras=''){return training121Subjects(voice,extras);}
export function training119Options(options){return training121Options(options);}
export function training119Range(options){return training121Range(options);}
