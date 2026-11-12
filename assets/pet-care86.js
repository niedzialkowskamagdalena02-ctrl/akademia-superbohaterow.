import {hqRead,hqFood,hqFeed,hqPetName} from './headquarters84.js?v=87';
import {petTools87,mountPetGestures87} from './pet-gestures87.js?v=87';

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

export function servePet87(profile,id){
 const pet=hqRead(profile).pet;
 if(!pet||pet.care?.asleep||!petMeals(pet.species).some(([key])=>key===id))return false;
 if(id!=='water'&&!hqFeed(profile))return false;
 const care=pet.care??={};
 const dirt=care.dirt??={};
 if(id==='water')dirt.pee=true;else dirt.poop=true;
 return true;
}

export function petSprite86(species,outfit='plain',asleep=false,settling=false,animateTail=false){
 const animal=Object.hasOwn(ANIMALS,species)?species:'cat',clothes=petOutfit86(outfit);
 const awake='assets/hq/pet-'+animal+(animal==='guinea'?'87':'86')+'.webp';
 const src=asleep?'assets/hq/pet-'+animal+'-sleep87.webp':awake;
 return `<span class="hq86-animal" data-animal="${animal}" data-outfit="${clothes}" data-asleep="${!!asleep}"${settling?' data-settling':''}>
  <img class="hq87-pet-body" src="${src}" alt="${ANIMALS[animal]}${asleep?' śpi':''}" draggable="false">
  ${settling?`<img class="hq87-pet-fall-asleep" src="${awake}" alt="" draggable="false">`:''}
  ${animateTail&&!asleep&&animal!=='guinea'?`<img class="hq87-pet-tail" src="${awake}" alt="" draggable="false">`:''}
  <i class="hq86-outfit" aria-hidden="true"></i>
 </span>`;
}

export function setPetCare86(profile,action,value=''){
 const pet=hqRead(profile).pet;
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
  <span class="hq87-feed-hand">✋<i>${icon}</i></span>
  ${mouth?'':'<span class="hq87-food-stream"><i></i><i></i><i></i><i></i></span>'}
 </div>`;
}

function messMarkup(dirt,effect){
 const pee=dirt?.pee||effect==='clean-pee',poop=dirt?.poop||effect==='clean-poop';
 return (pee?`<span class="hq87-pet-mess hq87-puddle${effect==='clean-pee'?' is-cleaning':''}" role="img" aria-label="Kałuża"></span>`:'')+
  (poop?`<span class="hq87-pet-mess hq87-droppings${effect==='clean-poop'?' is-cleaning':''}" role="img" aria-label="Kupa">💩</span>`:'')+
  (effect==='clean-pee'?'<span class="hq87-cleaning hq87-wiping" aria-hidden="true">✋<i></i></span>':
   effect==='clean-poop'?'<span class="hq87-cleaning hq87-sweeping" aria-hidden="true">🧹</span>':'');
}

export function petCareMarkup86(profile,room,effect,button,playing=false){
 const hq=hqRead(profile),pet=hq.pet;
 if(!pet)return `<div class="hq86-adopt">
  <h3>Wybierz zwierzaka</h3>
  <label for="hq84-pet-name">Imię zwierzaka</label><input id="hq84-pet-name" maxlength="22" placeholder="Np. Puszek">
  <div class="hq86-adopt-pets">
   ${Object.entries(ANIMALS).map(([id,name])=>`<button type="button" data-action="hq:adopt:${id}">${petSprite86(id)}${name}</button>`).join('')}
  </div>
 </div>`;
 const current=petRoom86(room),index=ROOMS.findIndex(([key])=>key===current);
 const food=hqFood(profile).length,meals=new Set(hq.foodServed??[]).size;
 const outfit=petOutfit86(pet.care?.outfit),asleep=!!pet.care?.asleep,dirt=pet.care?.dirt;
 const meal=current==='kitchen'?petMeals(pet.species).find(([id])=>effect==='feed-'+id):null;
 const reactions={
  wash:['🫧','Piana spłukana. Zwierzak jest czysty!'],nap:['💤','Śpij dobrze!'],
  wake:['☀️','Pobudka!'],play:['🎾','Piłka wróciła!'],stroke:['💛','Ale miło!'],
  'clean-pee':['✨','Kałuża wytarta.'],'clean-poop':['✨','Podłoga zamieciona.'],
  outfit:['✨','Ubranko zapisane.'],food:['🥣','Zdobywasz porcję karmy!'],name:['✎','Imię zapisane.']
 };
 const reaction=meal?['💛',meal[0]==='water'?'Woda w misce!':'Smacznego!']:Object.hasOwn(reactions,effect)?reactions[effect]:null;
 const wake=button('☀️ Obudź','hq:care:wake','gold');
 const clean=(id,label)=>dirt?.[id]?button(label,'hq:care:clean:'+id,'alt'):`<button type="button" disabled>${label}</button>`;
 const controls={
  nest:button('🌙 Połóż spać','hq:care:nap','alt')+button(playing?'Schowaj piłkę':'🎾 Pobaw się','hq:pet-play','gold')+
   '<button type="button" data-pet-stroke>🤚 Pogłaszcz</button>',
  kitchen:`<p>Porcje karmy <b>${food}</b> <span aria-hidden="true">·</span> Nakarmienia <b>${meals}</b></p>`+
   petMeals(pet.species).map(([id,label,icon])=>id==='water'||food?button(icon+' '+label,'hq:feed:'+id,'gold'):`<button type="button" disabled>${icon} ${label}</button>`).join('')+
   button('📚 Zdobądź karmę · 5 pytań','hq:food','alt'),
  bath:clean('pee','🧽 Ścierka')+clean('poop','🧹 Zmiotka'),
  closet:'<div class="hq86-outfits">'+OUTFITS.map(([id,label,color])=>`<button type="button" data-action="hq:care:outfit:${id}" aria-pressed="${outfit===id}"><i style="--fabric:${color||'#667891'}" aria-hidden="true"></i>${label}</button>`).join('')+'</div>'
 };
 const instruction=current==='bath'&&!asleep?'Przesuń mydło po futerku. Potem przeciągnij prysznic, żeby spłukać pianę.':
  current==='nest'&&playing&&!asleep?'Przytrzymaj piłkę, przesuń palcem i puść, żeby rzucić.':'';
 return `<div class="hq86-pet-care" data-pet-room="${current}">
  <header class="hq86-pet-heading"><h3>${safe(pet.name)}</h3><span>${ROOMS[index][1]}</span></header>
  <div class="hq86-pet-scene" data-pet-swipe data-effect="${reaction?effect:''}" data-sleeping="${asleep}">
   <button type="button" class="hq86-pet-prev" data-action="hq:pet-room:${ROOMS[(index+ROOMS.length-1)%ROOMS.length][0]}" aria-label="Poprzedni pokój">‹</button>
   ${petSprite86(pet.species,outfit,asleep,effect==='nap',current==='nest')}
   ${reaction?`<div class="hq86-pet-reaction" aria-hidden="true">${reaction[0]}</div>`:''}
   ${petTools87(current,playing,asleep)}
   ${mealAnimation(meal)}
   ${current==='bath'?messMarkup(dirt,effect):''}
   <button type="button" class="hq86-pet-next" data-action="hq:pet-room:${ROOMS[(index+1)%ROOMS.length][0]}" aria-label="Następny pokój">›</button>
  </div>
  <nav class="hq86-pet-rooms" aria-label="Pokoje zwierzaka">
   ${ROOMS.map(([id,label,icon])=>`<button type="button" data-action="hq:pet-room:${id}" aria-pressed="${current===id}"><span aria-hidden="true">${icon}</span>${label}</button>`).join('')}
  </nav>
  <p class="hq87-gesture-help" role="status">${instruction}</p>
  <div class="hq86-pet-controls">${asleep?wake+(current==='bath'?controls.bath:''):controls[current]}</div>
  ${reaction?`<p class="hq86-pet-status" role="status">${reaction[1]}</p>`:''}
  ${current==='closet'?`<details class="hq87-pet-name"><summary>Zmień imię</summary><label for="hq87-pet-name">Nowe imię</label><input id="hq87-pet-name" value="${safe(pet.name)}" maxlength="22">${button('Zapisz imię','hq:care:name','alt')}</details>`:''}
 </div>`;
}

export function mountPetCare86(root,complete){
 const panel=root.querySelector('.hq86-pet-panel');
 if(!panel)return;
 const scene=panel.querySelector('[data-pet-swipe]');
 mountPetGestures87(panel,scene,complete);
 let start=null,handled=null;
 panel.addEventListener('pointerdown',event=>{
  handled=null;
  const button=event.target.closest('button');
  const swipe=scene?.contains(event.target)&&!button;
  if(event.button!==0||button?.hasAttribute('data-pet-tool')||!swipe&&!button)return;
  start={id:event.pointerId,x:event.clientX,y:event.clientY,swipe,button};
  if(swipe)scene.setPointerCapture(event.pointerId);
 });
 panel.addEventListener('pointerup',event=>{
  if(start?.id!==event.pointerId)return;
  const {x,y,swipe,button}=start,dx=event.clientX-x,dy=event.clientY-y;
  start=null;
  if(swipe&&Math.abs(dx)>=44&&Math.abs(dx)>Math.abs(dy)*1.35){
   scene.querySelector(dx<0?'.hq86-pet-next':'.hq86-pet-prev').click();
  }else if(button&&event.pointerType==='touch'&&Math.hypot(dx,dy)<9){
   handled=button;
   event.preventDefault();button.click();
  }
 });
 panel.addEventListener('pointercancel',()=>{start=null;});
 panel.addEventListener('click',event=>{
  if(event.detail&&handled&&handled.contains(event.target)){
   event.preventDefault();event.stopPropagation();
  }
 },true);
}
