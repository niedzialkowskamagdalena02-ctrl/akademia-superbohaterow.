import {hqRead,hqFood} from './headquarters84.js?v=86';

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
const CARE_FIELDS={nap:'restedAt',wash:'washedAt',play:'playedAt'};
const safe=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
export const petRoom86=id=>ROOMS.some(([key])=>key===id)?id:'nest';
export const petOutfit86=id=>OUTFITS.some(([key])=>key===id)?id:'plain';

export function petSprite86(species,outfit='plain'){
 const animal=species==='dog'?'dog':'cat',clothes=petOutfit86(outfit);
 return `<span class="hq86-animal" data-animal="${animal}" data-outfit="${clothes}">
  <img src="assets/hq/pet-${animal}86.webp" alt="${animal==='dog'?'Pies':'Kot'}" draggable="false">
  <i class="hq86-outfit" aria-hidden="true"></i>
 </span>`;
}

export function setPetCare86(profile,action,value=''){
 const pet=hqRead(profile).pet;
 if(!pet)return false;
 if(action==='outfit'){
  if(!OUTFITS.some(([key])=>key===value)||petOutfit86(pet.care?.outfit)===value)return false;
  (pet.care??={}).outfit=value;return true;
 }
 if(!Object.hasOwn(CARE_FIELDS,action))return false;
 (pet.care??={})[CARE_FIELDS[action]]=Date.now();return true;
}

export function petCareMarkup86(profile,room,effect,button){
 const hq=hqRead(profile),pet=hq.pet;
 if(!pet)return `<div class="hq86-adopt">
  <h3>Wybierz zwierzaka</h3>
  <label for="hq84-pet-name">Imię zwierzaka</label><input id="hq84-pet-name" maxlength="22" placeholder="Np. Puszek">
  <div class="hq86-adopt-pets">
   <button type="button" data-action="hq:adopt:cat">${petSprite86('cat')}Kot</button>
   <button type="button" data-action="hq:adopt:dog">${petSprite86('dog')}Pies</button>
  </div>
 </div>`;
 const current=petRoom86(room),index=ROOMS.findIndex(([key])=>key===current);
 const food=hqFood(profile).length,meals=new Set(hq.foodServed??[]).size;
 const outfit=petOutfit86(pet.care?.outfit);
 const controls={
  nest:button('🌙 Połóż spać','hq:care:nap','alt')+button('🪀 Pobaw się','hq:care:play','gold'),
  kitchen:`<p>Porcje karmy <b>${food}</b> <span aria-hidden="true">·</span> Nakarmienia <b>${meals}</b></p>`+
   (food?button('🥣 Nakarm','hq:feed','gold'):'')+button('📚 Zdobądź karmę · 5 pytań','hq:food','alt'),
  bath:button('🫧 Umyj zwierzaka','hq:care:wash','gold'),
  closet:'<div class="hq86-outfits">'+OUTFITS.map(([id,label,color])=>`<button type="button" data-action="hq:care:outfit:${id}" aria-pressed="${outfit===id}"><i style="--fabric:${color||'#667891'}" aria-hidden="true"></i>${label}</button>`).join('')+'</div>'
 };
 const reactions={
  feed:['💛','Smacznego!'],wash:['🫧','Kąpiel gotowa!'],nap:['💤','Czas na drzemkę.'],play:['🪀','Ale zabawa!'],outfit:['✨','Ubranko zapisane.'],food:['🥣','Zdobywasz porcję karmy!']
 };
 const reaction=Object.hasOwn(reactions,effect)?reactions[effect]:null;
 return `<div class="hq86-pet-care" data-pet-room="${current}">
  <header class="hq86-pet-heading"><h3>${safe(pet.name)}</h3><span>${ROOMS[index][1]}</span></header>
  <div class="hq86-pet-scene" data-pet-swipe data-effect="${reaction?effect:''}">
   <button type="button" class="hq86-pet-prev" data-action="hq:pet-room:${ROOMS[(index+ROOMS.length-1)%ROOMS.length][0]}" aria-label="Poprzedni pokój">‹</button>
   ${petSprite86(pet.species,outfit)}
   ${reaction?`<div class="hq86-pet-reaction" aria-hidden="true">${reaction[0]}</div>`:''}
   <button type="button" class="hq86-pet-next" data-action="hq:pet-room:${ROOMS[(index+1)%ROOMS.length][0]}" aria-label="Następny pokój">›</button>
  </div>
  <nav class="hq86-pet-rooms" aria-label="Pokoje zwierzaka">
   ${ROOMS.map(([id,label,icon])=>`<button type="button" data-action="hq:pet-room:${id}" aria-pressed="${current===id}"><span aria-hidden="true">${icon}</span>${label}</button>`).join('')}
  </nav>
  <div class="hq86-pet-controls">${controls[current]}</div>
  ${reaction?`<p class="hq86-pet-status" role="status">${reaction[1]}</p>`:''}
 </div>`;
}

export function mountPetCare86(root){
 const panel=root.querySelector('.hq86-pet-panel');
 if(!panel)return;
 const scene=panel.querySelector('[data-pet-swipe]');
 let start=null,handled=null;
 panel.addEventListener('pointerdown',event=>{
  handled=null;
  const button=event.target.closest('button');
  const swipe=scene?.contains(event.target)&&!button;
  if(event.button!==0||!swipe&&!button)return;
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
