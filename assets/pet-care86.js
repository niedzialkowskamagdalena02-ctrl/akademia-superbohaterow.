import {hqRead,hqFood,hqFeed,hqPet,hqPetName} from './headquarters84.js?v=88';
import {petTools87,mountPetGestures87} from './pet-gestures87.js?v=90';

const ROOMS=[
 ['nest','Legowisko','🌙'],
 ['kitchen','Kuchnia','🥣'],
 ['bath','Łazienka','🫧'],
 ['closet','Garderoba','🧣']
];
const OUTFITS=[
 ['plain','Bez ubranka',''],
 ['scarf','Turkusowa chustka','#5ce8d8'],
 ['bow','Fioletowa muszka','#bd8bff'],
 ['cape','Peleryna bohatera','#ffcb64']
];
const CARE_FIELDS={wash:'washedAt',play:'playedAt',stroke:'pettedAt'};
const ANIMALS={cat:'Kot',dog:'Pies',guinea:'Świnka morska'};
const WATER=['water','Daj wodę','💧'];
const KIBBLE=['kibble','Daj suchą karmę','🥣'];
const WET=['wet','Daj mokrą karmę','🥫'];
const MEALS={
 dog:[WATER,KIBBLE,WET,['bone','Daj kość','🦴']],
 cat:[WATER,KIBBLE,WET,['fish','Daj rybę','🐟']],
 guinea:[WATER,KIBBLE,['greens','Daj zieleninę','🥬'],['carrot','Daj marchewkę','🥕']]
};
const safe=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
export const petRoom86=id=>ROOMS.some(([key])=>key===id)?id:'nest';
export const petOutfit86=id=>OUTFITS.some(([key])=>key===id)?id:'plain';
const petMeals=species=>MEALS[species]??MEALS.cat;

const messRoom=room=>room===true?'bath':room;

export function servePet87(profile,id,random=Math.random){
 const pet=hqPet(profile);
 if(!pet||pet.care?.asleep||!petMeals(pet.species).some(([key])=>key===id))return false;
 if(id!=='water'&&!hqFeed(profile))return false;
 const care=pet.care??={};
 const dirt=care.dirt??={};
 const type=id==='water'?'pee':'poop';
 if(!dirt[type]){
  const other=messRoom(dirt[type==='pee'?'poop':'pee']);
  const options=ROOMS.map(([room])=>room).filter(room=>room!==other);
  dirt[type]=options[Math.floor(random()*options.length)];
 }
 return true;
}

export function petSprite86(species,outfit='plain',asleep=false,settling=false,motion=false){
 const animal=Object.hasOwn(ANIMALS,species)?species:'cat',clothes=petOutfit86(outfit);
 const awake='assets/hq/pet-'+animal+(animal==='guinea'?'87':'86')+'.webp';
 const src=asleep?'assets/hq/pet-'+animal+'-sleep87.webp':awake;
 return `<span class="hq86-animal" data-animal="${animal}" data-outfit="${clothes}" data-asleep="${!!asleep}"${settling?' data-settling':''}>
  <img class="hq87-pet-body" src="${src}" alt="${ANIMALS[animal]}${asleep?' śpi':''}" draggable="false">
  ${settling?`<img class="hq87-pet-fall-asleep" src="${awake}" alt="" draggable="false">`:''}
  ${motion&&!asleep?`<span class="hq88-pet-motion" aria-hidden="true">
   <i class="hq88-pet-paws" style="--pet-image:url(${awake})"></i>
   <i class="hq88-pet-face" style="--pet-image:url(${awake})"></i>
   ${animal!=='guinea'?`<img class="hq87-pet-tail" src="${awake}" alt="" draggable="false">`:''}
   <img class="hq88-step-a" src="assets/hq/pets88/${animal}-step-a.webp" alt="" draggable="false">
   <img class="hq88-step-b" src="assets/hq/pets88/${animal}-step-b.webp" alt="" draggable="false">
   <img class="hq88-lap" src="assets/hq/pets88/${animal}-lap.webp" alt="" draggable="false">
   <i class="hq88-pet-tongue"></i>
  </span>`:''}
  <i class="hq86-outfit" aria-hidden="true"></i>
 </span>`;
}

export function setPetCare86(profile,action,value=''){
 const pet=hqPet(profile);
 if(!pet)return false;
 if(action==='name'){
  const name=hqPetName(value);
  if(!name||name===pet.name)return false;
  pet.name=name;return true;
 }
 if(action==='outfit'){
  if(!OUTFITS.some(([key])=>key===value)||petOutfit86(pet.care?.outfit)===value)return false;
  (pet.care??={}).outfit=value;return true;
 }
 if(action==='clean'){
  if(!['pee','poop'].includes(value)||!pet.care?.dirt?.[value])return false;
  pet.care.dirt[value]=false;return true;
 }
 if(action==='nap'||action==='wake'){
  const asleep=action==='nap';
  if(!!pet.care?.asleep===asleep)return false;
  const care=pet.care??={};
  care.asleep=asleep;
  if(asleep)care.restedAt=Date.now();
  return true;
 }
 if(pet.care?.asleep||!Object.hasOwn(CARE_FIELDS,action))return false;
 (pet.care??={})[CARE_FIELDS[action]]=Date.now();return true;
}

function mealAnimation(meal){
 if(!meal)return '';
 const [id,,icon]=meal;
 const mouth=['bone','fish','carrot'].includes(id);
 return `<div class="hq87-meal" data-meal="${id}" data-mouth="${mouth}" aria-hidden="true">
  ${mouth?'':'<span class="hq87-bowl-fill"></span>'}
  ${id==='fish'?'<img class="hq90-fish" src="assets/games80/pictures/fish.svg" alt="">':`<span class="hq87-feed-hand">✋<i>${icon}</i></span>`}
  ${mouth?'':'<span class="hq87-food-stream"><i></i><i></i><i></i><i></i></span>'}
 </div>`;
}

function messMarkup(pee,poop){
 return (pee?'<span class="hq87-pet-mess hq87-puddle" data-mess="pee" role="img" aria-label="Kałuża"></span>':'')+
  (poop?'<span class="hq87-pet-mess hq87-droppings" data-mess="poop" role="img" aria-label="Kupa">💩</span>':'');
}

export function petPicker88(profile){
 const active=hqPet(profile),saved=hqRead(profile).pets;
 return `<div class="hq86-adopt">
  <h3>Wybierz zwierzaka</h3>
  <label for="hq84-pet-name">Imię zwierzaka</label>
  <input id="hq84-pet-name" maxlength="22" placeholder="${active?'Wpisz nowe imię':'Np. Puszek'}">
  <div class="hq86-adopt-pets">
   ${Object.entries(ANIMALS).map(([id,name])=>{
    const pet=saved?.[id]??(active?.species===id?active:null);
    return `<button type="button" data-action="hq:adopt:${id}">${petSprite86(id)}${name}${pet?`<small>${safe(pet.name)}</small>`:''}</button>`;
   }).join('')}
  </div>
 </div>`;
}

export function petCareMarkup86(profile,room,effect,button,playing=false){
 const hq=hqRead(profile),pet=hqPet(profile);
 if(!pet)return petPicker88(profile);
 const current=petRoom86(room),index=ROOMS.findIndex(([key])=>key===current);
 const food=hqFood(profile).length,meals=new Set(hq.foodServed??[]).size;
 const outfit=petOutfit86(pet.care?.outfit),asleep=!!pet.care?.asleep,dirt=pet.care?.dirt;
 const pee=messRoom(dirt?.pee)===current,poop=messRoom(dirt?.poop)===current;
 const meal=current==='kitchen'?petMeals(pet.species).find(([id])=>effect==='feed-'+id):null;
 const reactions={
  wash:['🫧','Piana spłukana. Zwierzak jest czysty!'],nap:['💤','Śpij dobrze!'],
  wake:['☀️','Pobudka!'],play:['🎾','Piłka wróciła!'],stroke:['💛','Ale miło!'],
  'clean-pee':['✨','Kałuża wytarta.'],'clean-poop':['✨','Podłoga zamieciona.'],
  outfit:['✨','Ubranko zapisane.'],food:['🥣','Zdobywasz porcję karmy!'],name:['✎','Imię zapisane.']
 };
 const reaction=meal?['💛',({water:'Woda w misce!',fish:'Kot dostał rybę!'}[meal[0]]??'Smacznego!')]:Object.hasOwn(reactions,effect)?reactions[effect]:null;
 const wake=button('☀️ Obudź','hq:care:wake','gold');
 const controls={
  nest:button('🌙 Połóż spać','hq:care:nap','alt')+button(playing?'Schowaj piłkę':'🎾 Pobaw się','hq:pet-play','gold')+
   '<button type="button" data-pet-stroke>🤚 Pogłaszcz</button>',
  kitchen:`<p>Porcje karmy <b>${food}</b> <span aria-hidden="true">·</span> Nakarmienia <b>${meals}</b></p>`+
   (meal?`<p class="hq86-pet-status" role="status">${reaction[1]}</p>`:food?'':'<p>Zdobądź porcję karmy, żeby nakarmić zwierzaka.</p>')+
   petMeals(pet.species).map(([id,label,icon])=>id==='water'||food?button(icon+' '+label,'hq:feed:'+id,'gold'):`<button type="button" disabled>${icon} ${label}</button>`).join('')+
   button('📚 Zdobądź karmę · 5 pytań','hq:food','alt'),
  bath:'',
  closet:'<div class="hq86-outfits">'+OUTFITS.map(([id,label,color])=>`<button type="button" data-action="hq:care:outfit:${id}" aria-pressed="${outfit===id}"><i style="--fabric:${color||'#667891'}" aria-hidden="true"></i>${label}</button>`).join('')+'</div>'
 };
 const instruction=pee?'Przeciągnij ścierkę po kałuży.':poop?'Przeciągnij zmiotkę po podłodze.':
  current==='bath'&&!asleep?'Przesuń mydło po futerku. Potem przeciągnij prysznic, żeby spłukać pianę.':
  current==='nest'&&playing&&!asleep?'Przytrzymaj piłkę, przesuń palcem i puść, żeby rzucić.':'';
 return `<div class="hq86-pet-care" data-pet-room="${current}">
  <header class="hq86-pet-heading">${button('Wybierz zwierzaka','hq:pet-select','alt hq88-pet-picker')}<h3>${safe(pet.name)}</h3><span>${ROOMS[index][1]}</span></header>
  <div class="hq86-pet-scene" data-pet-swipe data-effect="${reaction?effect:''}" data-sleeping="${asleep}">
   <button type="button" class="hq86-pet-prev" data-action="hq:pet-room:${ROOMS[(index+ROOMS.length-1)%ROOMS.length][0]}" aria-label="Poprzedni pokój">‹</button>
   ${petSprite86(pet.species,outfit,asleep,effect==='nap',true)}
   ${reaction?`<div class="hq86-pet-reaction" aria-hidden="true">${reaction[0]}</div>`:''}
   ${petTools87(current,playing,asleep,pee,poop)}
   ${mealAnimation(meal)}
   ${messMarkup(pee,poop)}
   <button type="button" class="hq86-pet-next" data-action="hq:pet-room:${ROOMS[(index+1)%ROOMS.length][0]}" aria-label="Następny pokój">›</button>
  </div>
  <nav class="hq86-pet-rooms" aria-label="Pokoje zwierzaka">
   ${ROOMS.map(([id,label,icon])=>{
    const dirty=[dirt?.pee,dirt?.poop].some(room=>messRoom(room)===id);
    return `<button type="button" data-action="hq:pet-room:${id}" aria-pressed="${current===id}"><span aria-hidden="true">${icon}</span>${label}${dirty?'<i class="hq88-dirty" aria-label="Do posprzątania"></i>':''}</button>`;
   }).join('')}
  </nav>
  <p class="hq87-gesture-help" role="status">${instruction}</p>
  <div class="hq86-pet-controls">${asleep?wake:controls[current]}</div>
  ${reaction&&!meal?`<p class="hq86-pet-status" role="status">${reaction[1]}</p>`:''}
 </div>`;
}

export function mountPetCare86(root,complete,markup){
 const panel=root.querySelector('.hq86-pet-panel');
 if(!panel)return;
 let care=panel.querySelector('.hq86-pet-care');
 if(!care)return;
 if(markup){
  const scroll=panel.scrollTop;
  care.outerHTML=markup;
  panel.scrollTop=scroll;
  care=panel.querySelector('.hq86-pet-care');
 }
 const scene=care.querySelector('[data-pet-swipe]');
 mountPetGestures87(care,scene,complete);
 if(!scene)return;
 let start=null;
 scene.addEventListener('pointerdown',event=>{
  if(event.button!==0||start||event.target.closest('button'))return;
  start={id:event.pointerId,x:event.clientX,y:event.clientY};
  scene.setPointerCapture(event.pointerId);
 });
 scene.addEventListener('pointerup',event=>{
  if(start?.id!==event.pointerId)return;
  const dx=event.clientX-start.x,dy=event.clientY-start.y;
  start=null;
  if(Math.abs(dx)>=44&&Math.abs(dx)>Math.abs(dy)*1.35){
   scene.querySelector(dx<0?'.hq86-pet-next':'.hq86-pet-prev').click();
  }
 });
 scene.addEventListener('pointercancel',event=>{if(start?.id===event.pointerId)start=null;});
}
