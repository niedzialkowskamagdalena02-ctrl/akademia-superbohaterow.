import {trainingCatalog95,trainingSubject95,outsideDeck95} from './training95.js?v=140';
import {readings} from './learning.js';
import {grammarInfo136,evidence136} from './training-cosmic140.js?v=140';
const pre=new Set(['letters','numbers','trace','rally','rhymes','camera','snail']);
const shared=new Set(['order','syllables','dino','rail','closet']);
const school=new Set(['grammar','read','bank','spelling','dictation']);
const names={'web-climber':'Spider-Man · Misja na dachu',rally:'Literkowy Rajd',dino:'Dinozaur Pożeracz Literek',rail:'Pociąg Pełen Cyferek',closet:'Szafa Zwierzątek',order:'Literki w kolejności',syllables:'Sylaby i głoski'};
export function trainingReady139(game,grade){
 const p=grade==='P',s=['1','2','3'].includes(String(grade));
 if(!p&&!s)return false;
 if(game.kind==='web-climber')return ['polski','matematyka'].includes(game.subject);
 if(game.kind==='rail')return game.subject==='matematyka';
 if(['dino','closet'].includes(game.kind))return ['polski',...(s?['matematyka']:[])].includes(game.subject);
 if(game.subject==='matematyka')return p&&game.kind==='numbers';
 return game.subject==='polski'&&(shared.has(game.kind)||p&&pre.has(game.kind)||s&&school.has(game.kind));
}
export function trainingCatalog139(grade,label,preview=false){
 const result=trainingCatalog95(grade,label).map(g=>({...g})),selected=trainingSubject95(label),groups=selected==='all'?['polski','matematyka']:[selected];
 const eligible=grade==='P'||['1','2','3'].includes(String(grade));
 if(eligible)for(const subject of groups){
  const kinds=subject==='polski'?['web-climber','order','syllables','dino','closet',...(grade==='P'?['rally']:[])]:subject==='matematyka'?['web-climber','rail',...(grade==='P'?[]:['dino','closet'])]:[];
  for(const kind of kinds)if(!result.some(g=>g.kind===kind&&g.subject===subject)){const engine=kind==='syllables'?'task':'package139';result.push({id:`${engine}:${subject}:${kind}`,kind,subject,engine,name:names[kind],icon:kind==='rally'?'🏎️':kind==='dino'?'🦕':kind==='rail'?'🚂':kind==='closet'?'👕':'🔤'});}
 }
 // Folder assignment follows education level, never the child's name.
 return result.map(g=>({...g,name:names[g.kind]||g.name,ready139:trainingReady139(g,grade),locked139:!preview&&!trainingReady139(g,grade)}));
}
const splits={kot:['kot'],lato:['la','to'],kolega:['ko','le','ga'],wakacje:['wa','ka','cje'],parasol:['pa','ra','sol'],samolot:['sa','mo','lot'],limonada:['li','mo','na','da'],mama:['ma','ma']};
export function decorateTasks139(tasks,kind){return tasks.map(t=>{
 let meta={};
 if(kind==='grammar')meta.grammar=grammarInfo136(t.question);
 if(kind==='syllables'){const word=t.question.match(/[„"]([^”"]+)[”"]/u)?.[1];if(/sylab/i.test(t.question)&&splits[word])meta={parts:splits[word],unit:'sylaby'};if(Array.isArray(t.parts))meta={parts:t.parts,unit:t.unit};}
 if(kind==='read'){const r=readings.find(r=>t.question.includes(r.text)&&t.answer===r.answer);if(r)meta.reading={text:r.text,question:r.question,evidence:evidence136(r.text,r.answer)};else if(t.sourceExcerpt)meta.reading={text:t.sourceExcerpt,question:t.question,evidence:evidence136(t.sourceExcerpt,t.answer)};}
 return {...t,space136:meta};
});}
export function schoolTasks139(subject,grade,custom=[]){
 const key=subject==='matematyka'?'math':subject==='angielski'?'words':'grammar';
 return outsideDeck95({subject,kind:key},grade,custom).filter(t=>Array.isArray(t.options)&&t.options.includes(t.answer));
}
