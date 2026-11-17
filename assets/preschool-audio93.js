const skip='[data-speak],.listen,.mic,[data-voice93],.sq93,.hq86-point,[data-dir],[data-preschool-voice-skip]';
const lists='.hq84-answers,.v75-pre-buttons,.lg92-options,.lg92-mode,.lg92-controls,.lg92-catalog,.discovery-grid,.tabs,.hq86-pet-controls,.hq86-adopt-pets,.hq86-pet-rooms';
const standalone='.hq84-panel>button,.hq86-top>button,.hq86-stage>[data-walk-web],.lg92-header>button,.lg92-brief>button,.lg92-next,.lg92-end>button,.lg92-shell>.lg92-back,.lg92-more,.sq93-shell>button,.avengers-v36>button';
const labels={
 'Głośniej':'Głośniej','‹':'Wróć','›':'Następny','▲':'W górę','▼':'W dół','◀':'W lewo','▶':'W prawo',
 '✓':'Zatwierdź','↻':'Spróbuj jeszcze raz','⟳':'Obróć klocek','🔊':'Odsłuchaj'
};
const text=node=>(node.dataset.voiceText??node.getAttribute('aria-label')??node.innerText??node.textContent??'')
 .trim().replace(/^[^\p{L}\p{N}]+/u,'').trim();
const phonemes={A:'aaa',B:'b jak balon',C:'c jak cebula',D:'d jak dom',E:'eee',F:'fff',
 G:'g jak góra',H:'h jak hak',I:'iii',J:'jjj',K:'k jak kot',L:'lll',Ł:'ł jak ławka',M:'mmm',N:'nnn',
 O:'ooo',P:'p jak pies',R:'rrr',S:'sss',T:'t jak tor',U:'uuu',W:'www',Y:'yyy',Z:'zzz',
 Ć:'ć jak ćma',Ś:'śśś',Ź:'źźź',Ż:'żżż',Ą:'ą',Ę:'ę',Ó:'uuu',Ń:'ń jak w słowie koń'};
export function preschoolSpeech93(label){
 const trimmed=String(label).trim();
 return labels[trimmed]??phonemes[trimmed.toUpperCase()]??trimmed;
}
function voiceButton(doc,label){
 const button=doc.createElement('button');
 button.type='button';button.className='pres93-speaker';
 button.dataset.voice93=label;
 button.setAttribute('aria-label',label==='screen'?'Odsłuchaj polecenia ekranu':'Odsłuchaj: '+label);
 button.textContent=label==='screen'?'🔊 Odsłuchaj ekran':'🔊';
 return button;
}

let disconnect=()=>{};
export function mountPreschoolAudio93(root,speak=()=>{}){
 disconnect();disconnect=()=>{};
 if(!root||typeof MutationObserver==='undefined'||!root.ownerDocument)return;
 const doc=root.ownerDocument,controller=new AbortController();
 const companionButtons=new Map();
 function enhance(){
  for(const list of root.querySelectorAll(lists)){
   for(const button of [...list.children].filter(el=>el.tagName==='BUTTON'&&!el.matches(skip))){
    const label=text(button);
    if(!label)continue;
    const card=doc.createElement('div');card.className='pres93-read-card';
    button.before(card);card.append(button,voiceButton(doc,label));
   }
   if(list.querySelector(':scope > .pres93-read-card'))list.classList.add('pres93-read-grid');
  }
  const dialog=root.querySelector('dialog[open]');
  const panel=dialog?.querySelector('.hq84-panel')??root.querySelector('main');
  if(panel&&!root.querySelector('.sq93')&&!panel.querySelector(':scope > [data-voice93="screen"]')){
   const speaker=voiceButton(doc,'screen');speaker.classList.add('pres93-screen');
   if(dialog&&panel.firstElementChild?.matches('[data-action="hq:close"]'))panel.firstElementChild.after(speaker);
   else panel.prepend(speaker);
  }
  for(const button of root.querySelectorAll(standalone)){
   if(button.matches(skip)||button.closest('.pres93-read-card')||companionButtons.has(button))continue;
   // Absolute controls in the walk view share its separate screen reader.
   if(button.closest('.hq86-stage'))continue;
   const label=text(button);
   if(!label)continue;
   const speaker=voiceButton(doc,label);
   speaker.classList.add('pres93-next-to');speaker.hidden=button.hidden;
   button.after(speaker);companionButtons.set(button,speaker);
  }
  for(const [button,speaker] of companionButtons){
   if(!button.isConnected){companionButtons.delete(button);continue;}
   if(speaker.hidden!==button.hidden)speaker.hidden=button.hidden;
  }
 }
 root.addEventListener('click',event=>{
  const speaker=event.target.closest('[data-voice93]');
  if(!speaker)return;
  const {voice93}=speaker.dataset;
  if(voice93!=='screen'){speak(preschoolSpeech93(voice93));return;}
  const region=speaker.closest('.hq84-panel')??root;
  const prompts=[...region.querySelectorAll('[data-game-prompt],[data-lg92-prompt],.hq88-quiz-question, .avengers-v36 h2, .hq86-help, .hq86-location,.v75-preschool h2,[data-v77-step] h2,[data-v77-step] h3,.discovery-head h2,.discovery-head h3,.lesson-card h2,.lesson-rule p,.lesson-story,.lg92-brief p,[data-trace-status],[data-task-instruction],.hq84-panel h3')];
  const content=prompts.filter(node=>!node.hidden&&node.getClientRects().length).map(node=>node.querySelector('[data-speak]')?.dataset.speak??text(node)).filter(Boolean);
  if(!content.length){
   const title=region.querySelector('h2,h3,.sub');
   if(title)content.push(text(title));
  }
  if(content.length)speak([...new Set(content)].slice(0,6).join('. '));
 },{signal:controller.signal});
 const observer=new MutationObserver(changes=>{
  if(changes.some(change=>change.type==='childList'||change.attributeName==='open'||companionButtons.has(change.target)))enhance();
 });
 observer.observe(root,{subtree:true,childList:true,attributes:true,attributeFilter:['hidden','open']});
 enhance();
 disconnect=()=>{observer.disconnect();controller.abort();};
}
