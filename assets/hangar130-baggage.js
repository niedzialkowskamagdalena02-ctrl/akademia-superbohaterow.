import {boarding130,bagAllowed130,baggageValid130,seatsValid130,cities130,destinations130,modeNames130} from './hangar130-data.js?v=130';
import {img130,btn130,esc130} from './hangar130.js?v=130';
import {status130,bindRead130} from './hangar130-flight.js?v=130';

const colorNames={purple:'fioletowa',green:'zielona',red:'CZERWONA',blue:'niebieska'};
const files={purple:'walizka.png',green:'walizka_zielona.png',red:'walizka_czerwona.png',blue:'walizka_niebieska.png'};
const bagArt=item=>`${img130('baggage/'+files[item.color])}<b>${esc130(item.label)}</b>${item.color==='red'?'<small>CZERWONA</small>':''}`;
export function mountBaggage130(c){
 let flight=c.progress.unlocked(),task=boarding130(c.mode,flight),phase='brief',placed=[],people={},pick=null,hold=0,busy=false,gesture=null,swallow=0;
 const get=s=>c.root.querySelector(s),selected=()=>task.people.find(p=>p.id===pick),saved=()=>c.progress.read().stamps||{};
 const text=()=>phase==='cabin'?task.people.map(p=>p.name+': '+p.ticket).join('. '):task.prompt;
 const steps=()=>`<nav class="h130-steps" aria-label="Etapy lotu"><strong>Lot ${flight+1} / 5 · ${esc130(task.city)}</strong><span>${['baggage','cabin','launch'].map((s,i)=>`<b ${phase===s?'aria-current="step"':''}>${['Bagaż','Kabina','Start'][i]}</b>`).join(' → ')}</span></nav>`;
 function heading(prompt){return steps()+`<section class="h130-task"><div><small>${esc130(modeNames130[c.mode])}</small><h3>${esc130(prompt)}</h3></div>${btn130('read-task','🔊','aria-label="Powtórz polecenie pilota"')}${btn130('hint','Podpowiedź')}</section>`;}
 function bind(){
  bindRead130(c,text);
  c.on(c.root,'click',e=>{
   const b=e.target.closest('[data-h130]');if(!b||b.disabled||busy||performance.now()<swallow)return;
   const [a,arg]=b.dataset.h130.split(':');
   if(a==='hint'){c.status(task.hint);c.speak(task.hint);}
   if(a==='flight'&&Number(arg)<=c.progress.unlocked()){flight=Number(arg);task=boarding130(c.mode,flight);brief();}
   if(a==='difficulty'&&phase==='brief'&&modeNames130[arg]){c.mode=arg;task=boarding130(c.mode,flight);brief();}
   if(a==='load'){placed=[];people={};pick=null;phase='baggage';draw();c.speak(task.prompt);}
   if(a==='bag')selectBag(Number(arg));
   if(a==='hold-tab'){hold=Number(arg);draw();}
   if(a==='hold')placeBag(pick,Number(arg));
   if(a==='unload'){placed=placed.filter(p=>p.index!==Number(arg));pick=null;draw('Walizka wróciła na taśmę.');}
   if(a==='confirm-bags'){
    if(!baggageValid130(task,placed)){c.status(task.rule==='equal'?'Każdy luk ma mieć tyle samo walizek. Możesz je przełożyć.':task.rule==='fill'?'Sprawdź wolne miejsca we wszystkich lukach.':'Sprawdź walizki i ich kolejność.');return;}
    busy=true;get('.h130-holds').classList.add('is-closing');c.status('Bagaż sprawdzony. Zamykamy luki.');c.later(()=>{busy=false;phase='cabin';pick=null;draw();c.speak(text());},c.reduced?150:650);
   }
   if(a==='person'){pick=arg;draw('Wskaż miejsce zgodne z biletem.');}
   if(a==='seat')placePerson(pick,arg);
   if(a==='depart'&&seatsValid130(task,people)){phase='launch';c.takeoff({label:'Start do '+destinations130[flight],onFinish:arrive});}
   if(a==='continue'){if(flight<4){flight++;task=boarding130(c.mode,flight);brief();}else passport();}
   if(a==='passport')passport();
  });
  c.on(c.root,'pointerdown',e=>{
   if(e.button!==0||busy)return;const el=e.target.closest('[data-bag-drag],[data-person-drag]');if(!el)return;
   gesture={id:e.pointerId,el,x:e.clientX,y:e.clientY,moved:false,bag:el.dataset.bagDrag,person:el.dataset.personDrag};
  });
  c.on(c.root,'pointermove',e=>{
   if(e.pointerId!==gesture?.id||busy)return;const dx=e.clientX-gesture.x,dy=e.clientY-gesture.y;if(!gesture.moved&&Math.hypot(dx,dy)<8)return;
   if(!gesture.moved){gesture.moved=true;c.root.setPointerCapture?.(e.pointerId);}
   e.preventDefault();gesture.el.style.transform=`translate(${dx}px,${dy}px)`;gesture.el.classList.add('is-dragging');
  },{passive:false});
  const end=e=>{
   if(e.pointerId!==gesture?.id)return;const g=gesture;gesture=null;g.el.style.transform='';g.el.classList.remove('is-dragging');
   if(!g.moved)return;swallow=performance.now()+350;
   if(e.type==='pointercancel')return;
   // Capture stays on the root; use the actual release point for the target and animation.
   g.el.style.pointerEvents='none';const under=c.root.ownerDocument.elementFromPoint(e.clientX,e.clientY);g.el.style.pointerEvents='';
   if(g.bag!==undefined){const h=under?.closest('[data-hold]');if(h)placeBag(Number(g.bag),Number(h.dataset.hold),{x:e.clientX,y:e.clientY});}
   if(g.person){const s=under?.closest('[data-seat]');if(s)placePerson(g.person,s.dataset.seat,{x:e.clientX,y:e.clientY});}
  };
  c.on(c.root,'pointerup',end);c.on(c.root,'pointercancel',end);
 }
 function brief(){
  phase='brief';busy=false;pick=null;hold=0;
  const stamps=saved(),unlock=c.progress.unlocked();
  c.view(steps()+`<section class="h130-flight-card">${flight===0?img130('baggage/nowy_jork.jpg','h130-city'):''}<div class="h130-ticket-head">${img130('baggage/bilet.png')}<h3>Karta pokładowa · ${esc130(task.city)}</h3></div><div class="h130-modes" aria-label="Poziom tego lotu">${Object.entries(modeNames130).map(([m,name])=>btn130('difficulty:'+m,name,`aria-pressed="${c.mode===m}"`)).join('')}</div><p>${esc130(task.prompt)}</p><p>${esc130(task.people.map(p=>p.name+': '+p.ticket).join(' · '))}</p>${btn130('read-task','🔊 Polecenie pilota')}${btn130('load','Załaduj walizki','class="h130-primary"')}</section><nav class="h130-flight-select" aria-label="Wybierz odblokowany lot">${cities130.map((name,i)=>btn130('flight:'+i,`${i+1}. ${esc130(name)}${stamps['young:'+i]||stamps['captain:'+i]?' ✓':''}`,`${i>unlock?'disabled':''} aria-current="${i===flight?'true':'false'}"`)).join('')}</nav>${btn130('passport','Paszport i pieczątki')}${status130()}`);
  bind();c.speak('Lot '+(flight+1)+'. Lecimy do '+destinations130[flight]+'. '+task.prompt);
 }
 function selectBag(index){pick=index;c.root.querySelectorAll('[data-bag-drag]').forEach(el=>el.setAttribute('aria-pressed',String(Number(el.dataset.bagDrag)===index)));c.status('Wskaż luk dla walizki '+task.pool[index].label+'.');}
 function draw(message=''){
  busy=false;gesture=null;
  if(phase==='baggage'){
   const counts=task.capacity.map((_,i)=>placed.filter(p=>p.hold===i).length+(task.occupied[i]||0));
   c.view(heading(task.prompt)+`<section class="h130-terminal" style="background-image:url('${c.art}baggage/terminal.jpg')">
    ${task.holds>1?`<div class="h130-hold-tabs" aria-label="Wybierz luk">${counts.map((n,i)=>btn130('hold-tab:'+i,`Luk ${i+1} · ${n}/${task.capacity[i]}`,`aria-pressed="${i===hold}"`)).join('')}</div>`:''}
    <div class="h130-holds" style="--hold-count:${task.holds}">${counts.map((count,i)=>`<section class="h130-hold ${i===hold?'is-active':''}" data-hold="${i}"><button type="button" data-h130="hold:${i}" aria-label="Umieść wybraną walizkę w luku ${i+1}"><strong>Luk ${i+1} · ${count}/${task.capacity[i]}</strong><span class="h130-hold-slots">${Array.from({length:task.occupied[i]||0},()=>'<i class="h130-occupied" title="Wcześniej zajęte miejsce">▣</i>').join('')}${Array.from({length:Math.max(0,task.capacity[i]-count)},()=>'<i class="h130-empty-slot"></i>').join('')}</span></button><div class="h130-packed">${placed.filter(p=>p.hold===i).map(p=>`<div>${btn130('bag:'+p.index,bagArt(task.pool[p.index]),`class="h130-suitcase" data-bag-drag="${p.index}" aria-label="Przełóż walizkę ${esc130(task.pool[p.index].label)}"`)}${btn130('unload:'+p.index,'↩','aria-label="Wyjmij walizkę z luku"')}</div>`).join('')}</div></section>`).join('')}</div>
    <div class="h130-conveyor" aria-label="Taśma bagażowa">${task.pool.map((item,i)=>placed.some(p=>p.index===i)?'':btn130('bag:'+i,bagArt(item),`class="h130-suitcase" data-bag-drag="${i}" aria-pressed="${pick===i}" aria-label="Walizka ${esc130(item.label)}, ${colorNames[item.color]}"`)).join('')}</div></section>
    <div class="h130-next"><strong>Poprawnie załadowano: ${placed.length} / ${task.count}</strong>${btn130('confirm-bags','Zatwierdź bagaż i zamknij luk','class="h130-primary"')}</div>${status130()}`);
   bind();c.status(message||'Wybierz walizkę, potem luk. Możesz przeciągać i przekładać bagaże przed zatwierdzeniem.');
  }else{
   const rows=[...new Set(task.seats.map(s=>s.row))].sort((a,b)=>a-b);
   const seatMarkup=s=>{
    if(!s)return '<span></span>';
    const passenger=task.people.find(p=>people[p.id]===s.id);
    return btn130('seat:'+s.id,`<b>${esc130(s.id)}</b>${img130('baggage/fotel.png','h130-seat-art')}${passenger?img130('baggage/'+passenger.id+'.png','h130-seated')+'<i class="h130-belt" aria-label="Pas zapięty"></i>':''}`,`class="h130-seat" data-seat="${esc130(s.id)}" aria-label="Fotel ${esc130(s.id)}, rząd ${s.row}, ${s.side==='left'?'lewa':'prawa'} strona${passenger?', '+passenger.name:''}"`);
   };
   c.view(heading('Kabina — posadź pasażerów zgodnie z biletami')+`<section class="h130-cabin" style="background-image:url('${c.art}baggage/kabina.jpg')"><div class="h130-seat-rows">${rows.map(row=>`<div class="h130-seat-row"><small>Rząd ${row}</small><div>${seatMarkup(task.seats.find(s=>s.row===row&&s.side==='left'&&s.pos===0))}${seatMarkup(task.seats.find(s=>s.row===row&&s.side==='left'&&s.pos===1))}<span class="h130-aisle" aria-label="Przejście">⋮</span>${seatMarkup(task.seats.find(s=>s.row===row&&s.side==='right'&&s.pos===0))}${seatMarkup(task.seats.find(s=>s.row===row&&s.side==='right'&&s.pos===1))}</div></div>`).join('')}</div>
    <div class="h130-passengers">${task.people.map(p=>btn130('person:'+p.id,`${img130('baggage/'+p.id+'.png')}<span>${esc130(p.name)}</span>`,`data-person-drag="${p.id}" aria-pressed="${pick===p.id}" ${people[p.id]?'disabled':''}`)).join('')}</div></section>
    <div class="h130-boarding-ticket">${img130('baggage/bilet.png')}<p>${selected()?esc130(selected().name+' · Miejsce: '+selected().ticket):'Wybierz pasażera, aby zobaczyć jego bilet.'}</p></div>
    ${btn130('depart','Start do '+destinations130[flight],`class="h130-primary" ${seatsValid130(task,people)?'':'disabled'}`)}${status130()}`);
   bind();c.status(message||'Wybierz pasażera i fotel albo przeciągnij go na miejsce z biletu.');
  }
 }
 function transfer(source,target,point,commit){
  if(!source||!target){commit();return;}
  const from=source.getBoundingClientRect(),to=target.getBoundingClientRect(),clone=source.cloneNode(true);
  clone.removeAttribute('data-h130');clone.removeAttribute('data-bag-drag');clone.removeAttribute('data-person-drag');clone.classList.add('h130-transfer');clone.style.cssText=`position:fixed;left:${point?point.x-from.width/2:from.left}px;top:${point?point.y-from.height/2:from.top}px;width:${from.width}px;height:${from.height}px;pointer-events:none;z-index:99999;`;
  c.root.appendChild(clone);busy=true;
  const end=()=>{clone.remove();if(c.alive)commit();};
  const dx=to.left+to.width/2-(point?point.x:from.left+from.width/2),dy=to.top+to.height/2-(point?point.y:from.top+from.height/2);
  const animation=c.animate(clone,[{transform:'translate(0,0) scale(1)',opacity:1},{transform:`translate(${dx}px,${dy}px) scale(.4)`,opacity:.65}],{duration:450,easing:'cubic-bezier(.2,.7,.3,1)',fill:'forwards'});
  if(animation)animation.finished.then(end,()=>clone.remove());else c.later(end,c.reduced?70:200);
 }
 function placeBag(index,target,point){
  if(busy||phase!=='baggage'||!Number.isInteger(index)||!task.pool[index]||target<0||target>=task.holds)return;
  const old=placed.find(p=>p.index===index),others=placed.filter(p=>p.index!==index);
  if(old?.hold===target){c.status('Ta walizka już jest w tym luku.');return;}
  if(!old&&!bagAllowed130(task,others,index)){c.status('Ta walizka nie pasuje. '+task.prompt);c.speak('Sprawdź polecenie. '+task.prompt);const el=get('[data-bag-drag="'+index+'"]');c.animate(el,[{transform:'translateY(0)'},{transform:'translateY(-6px)'},{transform:'translateY(0)'}],{duration:250});return;}
  if(others.filter(p=>p.hold===target).length+(task.occupied[target]||0)>=task.capacity[target]){c.status('Luk pełny. Wybierz inny lub przełóż walizkę.');return;}
  transfer(get('[data-bag-drag="'+index+'"]'),get('[data-hold="'+target+'"]'),point,()=>{
   if(old)old.hold=target;else placed.push({index,hold:target});hold=target;pick=null;c.tone(2);draw('Walizka trafiła do luku '+(target+1)+'. Możesz poprawić układ przed zatwierdzeniem.');
   c.animate(get('[data-hold="'+target+'"]'),[{boxShadow:'0 0 22px #83ff9c'},{boxShadow:'0 0 0 transparent'}],{duration:500});
  });
 }
 function placePerson(id,seat,point){
  if(busy||phase!=='cabin')return;const person=task.people.find(p=>p.id===id);
  if(!person){c.status('Najpierw wybierz pasażera.');return;}
  if(person.target!==seat||Object.values(people).includes(seat)){c.status('Sprawdź bilet. '+person.name+': '+person.ticket);c.speak(person.name+'. '+person.ticket);c.animate(get('[data-person-drag="'+id+'"]'),[{transform:'translateY(0)'},{transform:'translateY(-6px)'},{transform:'translateY(0)'}],{duration:300});return;}
  transfer(get('[data-person-drag="'+id+'"]'),get('[data-seat="'+seat+'"]'),point,()=>{people[id]=seat;pick=null;c.tone(3);draw(person.name+' siedzi na miejscu '+seat+'. Pas zapięty.');c.animate(get('[data-seat="'+seat+'"] .h130-seated'),[{transform:'translateY(0)'},{transform:'translateY(-8px)'},{transform:'translateY(0)'}],{duration:450});});
 }
 function arrive(){
  const fresh=c.progress.stamp(c.mode,flight);if(fresh)c.tone(6);
  c.view(steps()+`<section class="h130-destination">${flight===0?img130('baggage/nowy_jork.jpg','h130-city'):''}<h3>Witaj! ${esc130(task.city)}</h3><div class="h130-stamp">✓ ${esc130(task.city)}</div><p>Pieczątka zapisana w paszporcie.</p>${btn130('continue',flight===4?'Zobacz paszport':'Następny lot','class="h130-primary"')}</section>${status130()}`);bind();c.speak('Wylądowaliśmy! '+task.city+'. Pieczątka do paszportu.');
 }
 function passport(){
  const stamps=saved(),all=cities130.every((_,i)=>stamps['young:'+i]||stamps['captain:'+i]);
  if(all)c.progress.complete('baggage',c.mode);
  c.view(steps()+`<section class="h130-passport">${img130('baggage/paszport.png')}<h3>${all?'Pięć lotów ukończonych!':'Paszport pilota'}</h3><div>${cities130.map((city,i)=>`<p class="${stamps['young:'+i]||stamps['captain:'+i]?'is-stamped':''}">${esc130(city)} ${stamps['young:'+i]||stamps['captain:'+i]?'✓':'—'}<small>${['young','captain'].filter(m=>stamps[m+':'+i]).map(m=>modeNames130[m]).join(' · ')}</small></p>`).join('')}</div>${btn130('flight:'+c.progress.unlocked(),'Wybierz lot','class="h130-primary"')}</section>${status130()}`);bind();
 }
 brief();return {snapshot:()=>({flight,phase,placed,people,pick,busy,task})};
}
