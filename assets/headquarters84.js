import {BASE_ITEMS} from './base.js?v=82';
import {affordable82,balance82} from './wallet82.js?v=82';
import {baseArt88} from './base-art88.js?v=91';

export const HQ_ROOMS = [
 ['entry','Wejście','🧭'], ['lab','Laboratorium','🔬'], ['arcade','Rozrywka','🕹️'],
 ['armory','Zbrojownia','🛡️'], ['hangar','Hangar','🛩️'], ['pet','Kącik zwierzaka','🐾']
];
export const HQ_SPOTS = [
 ['entry',-.68,1.0,2.85,'🔐 Skarbiec','hq:wallet'],
 ['lab',-5.2,1.6,-4.35,'📚 Trening','hq:training'],
 ['arcade',4.8,1.6,-4.4,'🎮 Automaty','hq:arcade'],
 ['arcade',6.5,1.1,-2.1,'🔮 Kula sucharów','hq:joke'],
 ['armory',0,1.9,-8.9,'🛡️ Kolekcja zbroi','hq:gallery'],
 ['armory',-3.4,1.08,-8.85,'Gablota A','hq:slot:a'],
 ['armory',3.4,1.08,-8.85,'Gablota B','hq:slot:b'],
 ['armory',0,1.08,-8.85,'Gablota C','hq:slot:c'],
 ['lab',-6.95,1.15,-2.25,'Półka','hq:slot:lab'],
 ['hangar',-5.4,1.2,3.0,'🛩️ Lądowisko','hq:hangar'],
 ['pet',4.75,.72,2.0,'🥣 Miska','hq:pet'],
 ['pet',6.55,1.0,3.6,'🥚 Gniotek','hq:egg']
];
const ARMORY_SLOTS=[['a','Gablota A'],['b','Gablota B'],['c','Gablota C']];
export const HQ_SLOTS = [...ARMORY_SLOTS,['lab','Półka w laboratorium']];
const GEM_PRICES = {spidermask:3,thorhammer:4,helmet:5,armor:7,gauntlet:9,quinjet:8};
export const HQ_AWARDS86=[
 {id:'language-cup',name:'Puchar mistrza języków',icon:'🏆',awardOnly:true,zone:'armory'},
 {id:'language-cape',name:'Peleryna mistrza języków',icon:'🦸',awardOnly:true,zone:'armory'}
];
export const hqItems=()=>[...BASE_ITEMS,...HQ_AWARDS86];
const escape = value => String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
export const hqRead = profile => profile?.base?.headquarters ?? {};
function hqWrite(profile){
 profile.base ??= {version:1,owned:[]};
 return profile.base.headquarters ??= {};
}
export function hqBalances(profile){
 const state=hqRead(profile);
 const unlocked=new Set(state.gemPurchases??[]);
 const earned=Object.values(state.crystalRuns??{}).reduce((total,n)=>total+(Number.isSafeInteger(n)&&n>0?n:0),0);
 const spent=[...unlocked].reduce((total,id)=>total+(Object.hasOwn(GEM_PRICES,id)?GEM_PRICES[id]:0),0);
 const tokens=new Set(state.energyEarned??[]);
 for(const id of state.energySpent??[])tokens.delete(id);
 return {coins:balance82(profile)??0,gems:Math.max(0,earned-spent),energy:tokens.size,nextToken:tokens.values().next().value};
}
export function hqEarnToken(profile,id,subject,perfect){
 if(!profile||!perfect||!id||!['polski','angielski'].includes(subject))return false;
 const list=hqWrite(profile).energyEarned??=[];
 if(list.includes(id))return false;
 list.push(id);
 return true;
}
export function hqSpendToken(profile){
 const id=hqBalances(profile).nextToken;
 if(!id)return false;
 (hqWrite(profile).energySpent??=[]).push(id);
 return true;
}
export function hqRecordCrystals(profile,run,total){
 if(!run||!Number.isSafeInteger(total)||total<1)return false;
 const runs=hqWrite(profile).crystalRuns??={};
 if(total<=(runs[run]??0))return false;
 runs[run]=total;
 return true;
}
export function hqBuyWithGems(profile,id){
 if(!Object.hasOwn(GEM_PRICES,id)||profile.base?.owned?.includes(id)||hqBalances(profile).gems<GEM_PRICES[id])return false;
 const state=hqWrite(profile);
 (profile.base.owned??=[]).push(id);
 (state.gemPurchases??=[]).push(id);
 hqDisplayPurchase88(profile,id);
 return true;
}
export function hqPlaced(profile,slot){
 return Object.entries(hqRead(profile).placements??{}).find(([id,value])=>value===slot&&profile.base?.owned?.includes(id))?.[0];
}
export function hqPlace(profile,id,slot){
 if(!HQ_SLOTS.some(([key])=>key===slot)||!hqItems().some(item=>item.id===id)||!profile.base?.owned?.includes(id))return false;
 const places=hqWrite(profile).placements??={};
 for(const other of Object.keys(places))if(places[other]===slot)delete places[other];
 places[id]=slot;
 return true;
}
export function hqDisplayPurchase88(profile,id){
 const item=hqItems().find(entry=>entry.id===id);
 if(item?.zone!=='armory'||hqRead(profile).placements?.[id])return false;
 const slot=ARMORY_SLOTS.find(([key])=>!hqPlaced(profile,key))?.[0];
 return !!slot&&hqPlace(profile,id,slot);
}
const PET_DEFAULT_NAMES={cat:'Puszek',dog:'Drops',guinea:'Fistaszek'};
export const hqPetName=name=>String(name??'').trim().slice(0,22);
export function hqPet(profile){
 const {pet,pets,activePet}=hqRead(profile);
 return pets?.[activePet]??pet;
}
export function hqAdopt(profile,species,name){
 if(!Object.hasOwn(PET_DEFAULT_NAMES,species)||hqPet(profile))return false;
 hqWrite(profile).pet={species,name:hqPetName(name)||PET_DEFAULT_NAMES[species]};
 return true;
}
export function hqChoosePet88(profile,species,name){
 if(!Object.hasOwn(PET_DEFAULT_NAMES,species))return false;
 const state=hqWrite(profile),pets=state.pets??={};
 const legacy=state.pet;
 if(legacy&&Object.hasOwn(PET_DEFAULT_NAMES,legacy.species)&&!pets[legacy.species]){
  pets[legacy.species]=structuredClone(legacy);
 }
 const selected=pets[species]??={species,name:PET_DEFAULT_NAMES[species]};
 const chosenName=hqPetName(name);
 if(chosenName)selected.name=chosenName;
 state.activePet=species;
 return true;
}
export function hqPaint(profile,paint){
 if(!profile.base?.owned?.includes('quinjet')||!['blue','gold','mint'].includes(paint))return false;
 hqWrite(profile).paint=paint;return true;
}
export function hqEarnFood(profile,id){
 if(!hqPet(profile)||!id)return false;
 const list=hqWrite(profile).foodEarned??=[];
 if(list.includes(id))return false;
 list.push(id);
 return true;
}
export function hqFood(profile){
 const hq=hqRead(profile);
 const served=new Set(hq.foodServed??[]);
 return (hq.foodEarned??[]).filter(id=>!served.has(id));
}
export function hqFeed(profile){
 const id=hqFood(profile)[0];
 if(!id)return false;
 (hqWrite(profile).foodServed??=[]).push(id);
 return true;
}
const mainButtons = [
 ['🔐 Skarbiec','hq:wallet'],['📚 Trening','hq:training'],['🎮 Rozrywka','hq:arcade'],
 ['🛡️ Zbrojownia','hq:gallery'],['🛒 Sklep','hq:shop'],['🛩️ Hangar','hq:hangar'],['🐾 Zwierzak','hq:pet']
];
export function hqChoices(button){
 return '<div class="hq84-choices">'+button('☰ Widok klasyczny','hq:view:classic','alt')+
  button('🚶 Spacer po bazie','hq:view:walk','gold')+'</div>';
}
export function hqMarkup(profile,child,view,button){
 const state=hqRead(profile),pet=hqPet(profile),balances=hqBalances(profile);
 const walk=view==='walk';
 const modes=walk?button('☰ Widok klasyczny','hq:view:classic','alt'):button('🚶 Spacer po bazie','hq:view:walk','alt');
 return `<section class="hq84" aria-labelledby="hq84-title">
  <header class="hq84-heading"><h2 id="hq84-title">${walk?'Spacer po bazie':'Baza Avengersów'}</h2>${modes}</header>
  <div class="hq84-balances" aria-label="Stan portfela">
   <span>🪙 <b>${balances.coins}</b> złotych</span><span>💎 <b>${balances.gems}</b> kryształów</span><span>⚡ <b>${balances.energy}</b> żetonów</span>
  </div>
  <div class="hq84-stage" data-hq84-scene data-child="${escape(child)}" data-view="${view}" data-pet="${Object.hasOwn(PET_DEFAULT_NAMES,pet?.species)?pet.species:''}" data-quinjet="${profile.base?.owned?.includes('quinjet')?'yes':''}" data-paint="${['gold','mint','blue'].includes(state.paint)?state.paint:'blue'}">
   <canvas aria-label="${walk?'Pierwszoosobowy widok bazy':'Widok całej bazy z góry'}"></canvas>
   <div class="hq84-hotspots">${HQ_SPOTS.map(([room,x,y,z,label,action],index)=>{
    const item=action.startsWith('hq:slot:')?hqItems().find(v=>v.id===hqPlaced(profile,action.split(':')[2])):null;
    return `<button type="button" data-hq84-spot="${index}" data-action="${action}" data-trophy="${item?.id??''}" hidden>${item?escape(item.name):label}</button>`;
   }).join('')}</div>
   ${walk?'<div class="hq84-drive" aria-label="Sterowanie ruchem"><button data-move="forward" type="button" aria-label="Do przodu">▲</button><button data-move="left" type="button" aria-label="Krok w lewo">◀</button><button data-move="back" type="button" aria-label="Do tyłu">▼</button><button data-move="right" type="button" aria-label="Krok w prawo">▶</button></div>':''}
  </div>
  <p class="hq84-hint">${walk?'Strzałki poruszają graczem. Przesuń palcem po scenie, aby się rozejrzeć.':'Przesuń palcem, aby obrócić bazę. Wybierz pokój, aby go przybliżyć.'}</p>
  <div class="hq84-rooms" aria-label="Pomieszczenia">${HQ_ROOMS.map(([id,name,icon])=>`<button type="button" data-hq84-room="${id}">${icon} ${name}</button>`).join('')}${walk?'':'<button type="button" data-hq84-room="overview">⌖ Cała baza</button>'}</div>
  <div class="hq84-shortcuts" aria-label="Skróty w bazie">${mainButtons.map(([label,action])=>button(label,action,'alt')).join('')}</div>
 </section>`;
}
export function hqWallet(profile){
 const {coins,gems,energy}=hqBalances(profile);
 return `<div class="hq87-vault-panel"><h3>🔐 Portfel w skarbcu</h3><dl class="hq84-wallet"><dt>Złote z misji</dt><dd>🪙 ${coins}</dd><dt>Kryształy z gier</dt><dd>💎 ${gems}</dd><dt>Żetony do automatów</dt><dd>⚡ ${energy}</dd></dl></div>`;
}
export function hqShop(profile,slot,button,collection=false,walking=false){
 const {gems,coins}=hqBalances(profile),owned=new Set(profile.base?.owned??[]);
 const title=HQ_SLOTS.find(([id])=>id===slot)?.[1];
 const items=hqItems().filter(item=>!collection||owned.has(item.id)).sort((a,b)=>Number(b.zone==='armory')-Number(a.zone==='armory'));
 return `<h3>${collection?'🛡️ Zbrojownia':'🛒 Sklep z wyposażeniem'}</h3>${collection?
   `<p>${title?'Wybierz trofeum do gabloty „'+title+'”.':'Wybierz, gdzie wystawić zdobyte wyposażenie.'}</p>`:
   `<div class="hq87-shop-balance" aria-label="Środki na zakupy"><span>🪙 ${coins} złotych</span><span>💎 ${gems} kryształów</span></div>`}
  ${items.length?'':'<p>Zdobyte wyposażenie pojawi się tutaj.</p>'}<div class="hq84-catalog">${items.map(item=>{
   const gemPrice=GEM_PRICES[item.id];
   const art=baseArt88(item.id);
   const photo=art?`<img class="hq88-item-art" style="--hq-art-hue:${art.hue}deg" src="${art.src}" alt="" loading="lazy">`:`<span aria-hidden="true">${item.icon}</span>`;
   const place=slot?button('Ustaw tutaj','hq:place:'+item.id+':'+slot,'gold'):button('Wybierz miejsce','hq:places:'+item.id,'alt');
   const buy=affordable82(profile,item)?button(item.cost?'🪙 '+item.cost+' złotych':'🎁 Odbierz','base:buy:'+item.id,'gold'):`<button type="button" disabled>🪙 ${item.cost} złotych</button>`;
   const gemsBuy=gemPrice?(gems>=gemPrice?button('💎 '+gemPrice+' kryształów','hq:buy-gems:'+item.id,'alt'):`<button type="button" disabled>💎 ${gemPrice} kryształów</button>`):'';
   const locked=item.awardOnly?'<small>🏆 Nagroda w Language Master</small>':buy+gemsBuy;
   const ownedActions=item.id==='workshop'&&walking&&!collection?button('Wejdź do warsztatu','hq:room:workshop','gold'):place;
   return `<article>${photo}<h4>${escape(item.name)}</h4><div>${owned.has(item.id)?ownedActions:locked}</div></article>`;
  }).join('')}</div>`;
}
export function hqFoodQuiz88(quiz,button,voice){
 if(!quiz||quiz.index>=quiz.items.length)return '';
 const [q,answers,,pl]=quiz.items[quiz.index];
 return `<h3>🥣 Trening po karmę</h3><p>Pytanie ${quiz.index+1} z ${quiz.items.length}</p>
  <h4 class="hq88-quiz-question">${escape(q)}${voice(q,pl?'en-US':'pl-PL')}</h4>
  ${pl?`<p class="hq88-quiz-question">${escape(pl)}${voice(pl,'pl-PL')}</p>`:''}
  <div class="hq84-answers">${answers.map((answer,index)=>button(escape(answer),'hq:answer:'+index,'alt')).join('')}</div>
  <p id="hq84-answer-status" role="status"></p>`;
}
