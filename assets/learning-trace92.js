import {alphabet92,numbers92,letterName92} from './learning-games92.js?v=92';

// Single-line print shapes. Each entry describes the order of the pencil strokes.
const printStrokes={
 A:'M61 148 L100 39 L139 148|M78 103 H122',
 B:'M66 149 V42 H103 Q136 42 136 68 Q136 94 103 94 H66|M103 94 Q141 94 141 121 Q141 149 103 149 H66',
 C:'M138 56 Q123 39 102 39 Q63 39 63 95 Q63 151 102 151 Q123 151 138 134',
 D:'M65 149 V42 H93 Q141 42 141 95 Q141 149 93 149 H65',
 E:'M137 42 H65 V149 H137|M65 93 H124',
 F:'M137 42 H65 V149|M65 93 H125',
 G:'M136 56 Q124 39 102 39 Q62 39 62 95 Q62 151 103 151 Q127 151 140 134 V100 H106',
 H:'M65 42 V149|M138 42 V149|M65 95 H138',
 I:'M100 42 V149',
 J:'M130 42 V117 Q130 150 99 150 Q74 150 66 124',
 K:'M65 42 V149|M138 42 L67 102 L143 149',
 L:'M65 42 V149 H140',
 M:'M58 149 V42 L101 105 L143 42 V149',
 N:'M65 149 V42 L139 149 V42',
 O:'M103 39 C50 39 50 151 103 151 C155 151 155 39 103 39',
 P:'M65 149 V42 H105 Q139 42 139 69 Q139 96 105 96 H65',
 R:'M65 149 V42 H105 Q139 42 139 69 Q139 96 105 96 H65|M101 96 L144 149',
 S:'M137 55 Q122 39 104 39 C57 39 51 80 102 94 C158 110 150 151 102 151 Q80 151 64 134',
 T:'M56 42 H146|M101 42 V149',
 U:'M64 42 V113 Q64 150 102 150 Q140 150 140 113 V42',
 W:'M49 42 L72 148 L101 74 L130 148 L153 42',
 Y:'M57 42 L101 100 L144 42|M101 101 V149',
 Z:'M61 42 H141 L61 149 H142',
 a:'M132 91 Q117 72 100 74 Q68 74 68 112 Q68 151 100 151 Q118 151 132 132|M132 76 V149',
 b:'M70 41 V148|M70 91 Q85 74 101 74 Q135 74 135 112 Q135 151 101 151 Q82 151 70 134',
 c:'M130 86 Q119 74 102 74 Q70 74 70 112 Q70 151 102 151 Q118 151 130 139',
 d:'M132 90 Q118 74 101 74 Q68 74 68 112 Q68 151 101 151 Q118 151 132 134|M132 41 V149',
 e:'M70 110 H132 Q132 74 100 74 Q69 74 69 112 Q69 151 103 151 Q121 151 133 139',
 f:'M87 153 V74 Q87 39 113 39 Q127 39 135 49|M70 79 H120',
 g:'M131 89 Q119 74 100 74 Q67 74 67 111 Q67 148 100 148 Q120 148 131 131|M131 76 V151 Q131 181 101 181 Q82 181 69 167',
 h:'M71 42 V149|M71 99 Q85 74 109 74 Q133 74 133 100 V149',
 i:'M101 76 V149|M101 52 L101 53',
 j:'M109 76 V155 Q109 181 87 181 Q77 181 70 175|M109 52 L109 53',
 k:'M72 42 V149|M132 76 L74 117 L135 149',
 l:'M101 42 V149',
 m:'M61 149 V77|M61 99 Q74 75 91 75 Q104 75 104 96 V149|M104 99 Q119 75 134 75 Q146 75 146 97 V149',
 n:'M71 149 V77|M71 101 Q87 74 109 74 Q132 74 132 101 V149',
 o:'M102 74 C57 74 57 151 102 151 C147 151 147 74 102 74',
 p:'M70 77 V181|M70 91 Q85 74 100 74 Q134 74 134 112 Q134 151 100 151 Q82 151 70 134',
 r:'M80 149 V78|M80 104 Q94 76 117 76 H126',
 s:'M130 85 Q120 74 102 74 Q77 74 77 93 Q77 106 102 112 Q130 119 130 132 Q130 151 103 151 Q82 151 72 140',
 t:'M97 47 V126 Q97 150 113 150 Q124 150 130 143|M75 78 H126',
 u:'M70 77 V123 Q70 151 94 151 Q117 151 132 127|M132 77 V149',
 w:'M54 78 L77 149 L103 101 L128 149 L152 78',
 y:'M68 76 L102 144|M135 76 L91 181',
 z:'M72 77 H132 L72 149 H133',
 '0':'M101 41 C56 41 56 151 101 151 C146 151 146 41 101 41',
 '1':'M80 64 L103 42 V149',
 '2':'M65 68 Q72 40 105 40 Q137 40 137 69 Q137 90 67 148 H139',
 '3':'M68 54 Q83 40 105 40 Q137 40 137 67 Q137 91 103 94 Q139 95 139 122 Q139 150 104 150 Q79 150 63 133',
 '4':'M119 42 L62 115 H145|M119 42 V149',
 '5':'M136 42 H76 L69 94 Q85 84 102 84 Q139 84 139 118 Q139 150 103 150 Q80 150 63 135',
 '6':'M130 49 Q85 20 68 84 Q57 151 102 151 Q138 151 138 119 Q138 91 105 91 Q80 91 66 110',
 '7':'M60 42 H141 L91 149',
 '8':'M102 94 C61 80 59 40 102 40 C145 40 144 80 102 94 C53 108 55 151 102 151 C149 151 151 108 102 94',
 '9':'M136 84 Q123 103 101 103 Q66 103 66 73 Q66 41 102 41 Q148 41 136 106 Q129 147 80 150'
};
const accented={
 'Ą':['A','M139 148 Q125 162 131 171 Q135 176 143 175'],
 'ą':['a','M132 149 Q120 161 128 172 Q133 178 143 173'],
 'Ę':['E','M134 149 Q122 158 125 170 Q130 177 141 173'],
 'ę':['e','M124 145 Q115 158 122 169 Q129 176 139 173'],
 'Ł':['L','M49 113 L98 83'],'ł':['l','M79 105 L123 78']
};
for(const [plain,accent] of [['C','Ć'],['N','Ń'],['O','Ó'],['S','Ś'],['Z','Ź']]){
 accented[accent]=[plain,'M96 28 L111 16'];
 accented[accent.toLowerCase()]=[plain.toLowerCase(),'M96 61 L112 48'];
}
accented['Ż']=['Z','M103 23 L103 24'];
accented['ż']=['z','M103 56 L103 57'];

export function traceStrokes92(symbol){
 if(symbol==='10')return [
  ...traceStrokes92('1').map(stroke=>({...stroke,scale:.79,x:-26,y:19})),
  ...traceStrokes92('0').map(stroke=>({...stroke,scale:.79,x:56,y:19}))
 ];
 const [base,accent]=accented[symbol]??[symbol];
 return [...(printStrokes[base]?.split('|')??[]),...(accent?[accent]:[])]
  .map(d=>({d,scale:1,x:0,y:0}));
}

export function traceStep92(points,index,position){
 let best=-1,nearest=Infinity;
 for(let i=index;i<Math.min(points.length,index+5);i++){
  const point=points[i],distance=Math.hypot(point.x-position.x,point.y-position.y);
  if(distance<=12&&distance<=nearest){best=i;nearest=distance;}
 }
 return best;
}

export function mountTrace92(root,{speak=()=>{},tap=()=>{},snail=false}={}){
 let group='upper',symbol='A',step=0,next=0,active=null;
 let paths,points;
 root.classList.toggle('lg93-snail',snail);
 root.innerHTML=`<div class="lg92-mode" aria-label="Rodzaj śladu">
  <button type="button" data-trace-set="upper">Wielkie litery</button>
  <button type="button" data-trace-set="lower">Małe litery</button>
  <button type="button" data-trace-set="number">Liczby 0–10</button>
 </div><div class="lg92-trace-select"><label for="lg92-symbol">Wybierz znak</label><select id="lg92-symbol"></select>
 <button type="button" data-trace-act="speak" aria-label="Odsłuchaj">🔊</button></div>
 <div class="lg92-trace-board">
  <svg viewBox="0 0 200 195" role="img" aria-label="Pola pisania po śladzie">
   <g data-trace-guides><path d="M8 42 H192 M8 75 H192 M8 149 H192 M8 182 H192"></path></g>
   <g data-trace-lines></g>
   ${snail?'<g data-snail-leaves aria-hidden="true"></g><circle data-snail-finish r="4.2"></circle><text data-trace-snail font-size="15" text-anchor="middle" dy="-6">🐌</text>':''}
   <circle data-trace-start r="4.7"></circle>
  </svg>
 </div><p class="lg92-feedback" data-trace-status role="status"></p>
 <div class="lg92-controls"><button type="button" data-trace-act="clear">Wyczyść</button>
 <button type="button" data-trace-act="next">Następny znak →</button></div>`;
 const select=root.querySelector('select'),svg=root.querySelector('svg');
 const status=root.querySelector('[data-trace-status]'),layer=root.querySelector('[data-trace-lines]');
 const start=root.querySelector('[data-trace-start]');
 const snailSprite=root.querySelector('[data-trace-snail]'),finish=root.querySelector('[data-snail-finish]'),leafLayer=root.querySelector('[data-snail-leaves]');
 const symbols=()=>group==='number'?numbers92.map(String):alphabet92.map(l=>group==='lower'?l.toLowerCase():l);
 const say=()=>{
  const name=group==='number'?'liczbę '+symbol:'literę '+letterName92(symbol.toUpperCase());
  speak((snail?'Poprowadź ślimaka zieloną ścieżką do czerwonej kropki. Rysujemy ':'Poprowadź palec po śladzie. Rysujemy ')+name+'. Zacznij od kolorowej kropki.');
 };
 function selectMode(){
  select.replaceChildren(...symbols().map(key=>new Option(key,key)));
  select.value=symbol;
  for(const btn of root.querySelectorAll('[data-trace-set]'))btn.setAttribute('aria-pressed',String(btn.dataset.traceSet===group));
 }
 function moveDot(){
  const point=points[step]?.[next];
  start.toggleAttribute('hidden',!point);
  if(point){
   start.setAttribute('cx',point.x);start.setAttribute('cy',point.y);
   if(snail){
    snailSprite.setAttribute('x',point.x);snailSprite.setAttribute('y',point.y);
    const line=points[step],end=line.at(-1);
    finish.setAttribute('cx',end.x);finish.setAttribute('cy',end.y);
    leafLayer.innerHTML=[.28,.52,.75].map(part=>Math.floor((line.length-1)*part)).filter((i,n,arr)=>i>next&&arr.indexOf(i)===n)
     .map(i=>`<text x="${line[i].x}" y="${line[i].y}" dy="-4" font-size="10" text-anchor="middle">🍃</text>`).join('');
   }
  }else if(snail){leafLayer.textContent='';snailSprite.setAttribute('x',points.at(-1).at(-1).x);snailSprite.setAttribute('y',points.at(-1).at(-1).y);}
 }
 function reset(){
  step=0;next=0;active=null;
  root.classList.remove('lg92-trace-done');
  const strokes=traceStrokes92(symbol);
  layer.innerHTML=strokes.map(({d,scale,x,y})=>
   `<path data-trace-guide d="${d}" transform="translate(${x} ${y}) scale(${scale})"></path><polyline data-trace-ink></polyline>`).join('');
  paths=[...layer.querySelectorAll('[data-trace-ink]')];
  points=[...layer.querySelectorAll('[data-trace-guide]')].map((path,index)=>{
   const {scale,x,y}=strokes[index];
   const length=path.getTotalLength();
   const count=Math.max(1,Math.ceil(length*scale/5));
   return Array.from({length:count+1},(_,i)=>{
    const p=path.getPointAtLength(i/count*length);
    return {x:p.x*scale+x,y:p.y*scale+y};
   });
  });
  status.textContent=snail?'Zacznij od zielonej kropki i poprowadź ślimaka do czerwonej.':'Zacznij od świecącej kropki.';
  moveDot();
 }
 function point(event){
  return new DOMPoint(event.clientX,event.clientY).matrixTransform(svg.getScreenCTM().inverse());
 }
 function update(position){
  const line=points[step];
  const closest=traceStep92(line,next,position);
  if(closest<0){
   if(snail){
    const checkpoint=Math.max(0,...[.28,.52,.75].map(part=>Math.floor((line.length-1)*part)).filter(i=>i<=next));
    next=checkpoint;active=null;
    paths[step].setAttribute('points',line.slice(0,next+1).map(p=>p.x+','+p.y).join(' '));
    status.textContent='Ślimak wrócił na ścieżkę. Zacznij od jego nowego miejsca.';moveDot();
   }
   return;
  }
  next=closest;
  const drawn=line.slice(0,next+1);
  paths[step].setAttribute('points',drawn.map(p=>p.x+','+p.y).join(' '));
  if(next===line.length-1){
   step++;next=0;active=null;
   if(step===points.length){
    root.classList.add('lg92-trace-done');status.textContent='⭐ Brawo! Ślad ukończony.';
    speak('Brawo! Udało się narysować cały znak.');
   }else status.textContent='Teraz zacznij od kolejnej kropki.';
  }else status.textContent='Prowadź palec dalej po przerywanej linii.';
  moveDot();
 }
 svg.addEventListener('pointerdown',event=>{
  if(event.button!==0||active!==null||step===points.length)return;
  const position=point(event),mark=points[step][next];
  if(Math.hypot(position.x-mark.x,position.y-mark.y)>16)return;
  active=event.pointerId;svg.setPointerCapture(event.pointerId);
  if(points[step].length===2){
   const line=points[step];
   if(Math.hypot(line[0].x-line[1].x,line[0].y-line[1].y)<2){update(line.at(-1));return;}
  }
  update(position);
 });
 svg.addEventListener('pointermove',event=>{
  if(event.pointerId!==active)return;
  const samples=event.getCoalescedEvents?.();
  for(const entry of samples?.length?samples:[event]){
   if(active===null)break;
   update(point(entry));
  }
 });
 for(const type of ['pointerup','pointercancel','lostpointercapture'])svg.addEventListener(type,event=>{
  if(event.pointerId===active)active=null;
 });
 select.addEventListener('change',()=>{symbol=select.value;reset();say();});
 root.addEventListener('click',event=>{
  const button=event.target.closest('button');
  if(!button)return;
  const mode=button.dataset.traceSet,action=button.dataset.traceAct;
  if(!mode&&!action)return;
  tap();
  if(mode){group=mode;symbol=symbols()[0];selectMode();reset();say();}
  if(action==='speak')say();
  if(action==='clear')reset();
  if(action==='next'){
   const list=symbols();symbol=list[(list.indexOf(symbol)+1)%list.length];
   select.value=symbol;reset();say();
  }
 });
 selectMode();reset();
}
