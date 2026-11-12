import {BASE_ITEMS} from './base.js?v=82';
import {affordable82,balance82} from './wallet82.js?v=82';

export const HQ_ROOMS = [
 ['entry','Wejście','🧭'], ['lab','Laboratorium','🔬'], ['arcade','Rozrywka','🕹️'],
 ['armory','Zbrojownia','🛡️'], ['hangar','Hangar','🛩️'], ['pet','Kącik zwierzaka','🐾']
];
export const HQ_SPOTS = [
 ['entry',-.68,1.0,2.85,'👛 Portfel','hq:wallet'],
 ['lab',-5.2,1.6,-4.35,'📚 Trening','hq:training'],
 ['arcade',4.8,1.6,-4.4,'🎮 Automaty','hq:arcade'],
 ['arcade',6.5,1.1,-2.1,'🔮 Kula sucharów','hq:joke'],
 ['armory',0,1.45,-8.9,'🛡️ Sklep','hq:shop'],
 ['armory',-3.4,1.08,-8.85,'Gablota A','hq:slot:a'],
 ['armory',3.4,1.08,-8.85,'Gablota B','hq:slot:b'],
 ['lab',-6.95,1.15,-2.25,'Półka','hq:slot:lab'],
 ['hangar',-5.4,1.2,3.0,'🛩️ Lądowisko','hq:hangar'],
 ['pet',4.75,.72,2.0,'🥣 Miska','hq:pet'],
 ['pet',6.55,1.0,3.6,'🥚 Gniotek','hq:egg']
];
export const HQ_SLOTS = [['a','Gablota A'],['b','Gablota B'],['lab','Półka w laboratorium']];
const GEM_PRICES = {spidermask:3,thorhammer:4,helmet:5,armor:7,gauntlet:9,quinjet:8};
export const HQ_ART = new Set(['helmet','armor','cape','gauntlet','quinjet','shield','web','arc','thorhammer','spidermask']);
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
 return true;
}
export function hqPlaced(profile,slot){
 return Object.entries(hqRead(profile).placements??{}).find(([id,value])=>value===slot&&profile.base?.owned?.includes(id))?.[0];
}
export function hqPlace(profile,id,slot){
 if(!HQ_SLOTS.some(([key])=>key===slot)||!BASE_ITEMS.some(item=>item.id===id)||!profile.base?.owned?.includes(id))return false;
 const places=hqWrite(profile).placements??={};
 for(const other of Object.keys(places))if(places[other]===slot)delete places[other];
 places[id]=slot;
 return true;
}
export function hqAdopt(profile,species,name){
 if(!['cat','dog'].includes(species)||hqRead(profile).pet)return false;
 hqWrite(profile).pet={species,name:String(name??'').trim().slice(0,22)||(species==='cat'?'Puszek':'Drops')};
 return true;
}
export function hqPaint(profile,paint){
 if(!profile.base?.owned?.includes('quinjet')||!['blue','gold','mint'].includes(paint))return false;
 hqWrite(profile).paint=paint;return true;
}
export function hqEarnFood(profile,id){
 if(!hqRead(profile).pet||!id)return false;
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
 ['👛 Portfel','hq:wallet'],['📚 Trening','hq:training'],['🎮 Rozrywka','hq:arcade'],
 ['🛡️ Zbrojownia','hq:shop'],['🛩️ Hangar','hq:hangar'],['🐾 Zwierzak','hq:pet']
];
export function hqChoices(button){
 return '<div class="hq84-choices">'+button('☰ Widok klasyczny','hq:view:classic','alt')+
  button('🚶 Spacer po bazie','hq:view:walk','gold')+'</div>';
}
export function hqMarkup(profile,child,view,button){
 const state=hqRead(profile),balances=hqBalances(profile);
 const walk=view==='walk';
 const modes=walk?button('☰ Widok klasyczny','hq:view:classic','alt'):button('🚶 Spacer po bazie','hq:view:walk','alt');
 return `<section class="hq84" aria-labelledby="hq84-title">
  <header class="hq84-heading"><h2 id="hq84-title">${walk?'Spacer po bazie':'Baza Avengersów'}</h2>${modes}</header>
  <div class="hq84-balances" aria-label="Stan portfela">
   <span>🪙 <b>${balances.coins}</b> złotych</span><span>💎 <b>${balances.gems}</b> kryształów</span><span>⚡ <b>${balances.energy}</b> żetonów</span>
  </div>
  <div class="hq84-stage" data-hq84-scene data-child="${escape(child)}" data-view="${view}" data-pet="${state.pet?.species==='dog'?'dog':state.pet?'cat':''}" data-quinjet="${profile.base?.owned?.includes('quinjet')?'yes':''}" data-paint="${['gold','mint','blue'].includes(state.paint)?state.paint:'blue'}">
   <canvas aria-label="${walk?'Pierwszoosobowy widok bazy':'Widok całej bazy z góry'}"></canvas>
   <div class="hq84-hotspots">${HQ_SPOTS.map(([room,x,y,z,label,action],index)=>{
    const item=action.startsWith('hq:slot:')?BASE_ITEMS.find(v=>v.id===hqPlaced(profile,action.split(':')[2])):null;
    return `<button type="button" data-hq84-spot="${index}" data-action="${action}" data-trophy="${item?.id??''}" hidden>${item?escape(item.name):label}</button>`;
   }).join('')}</div>
   ${walk?'<div class="hq84-drive" aria-label="Sterowanie ruchem"><button data-move="forward" type="button" aria-label="Do przodu">▲</button><button data-move="left" type="button" aria-label="Krok w lewo">◀</button><button data-move="back" type="button" aria-label="Do tyłu">▼</button><button data-move="right" type="button" aria-label="Krok w prawo">▶</button></div>':''}
  </div>
  <p class="hq84-hint">${walk?'Strzałki poruszają graczem. Przesuń palcem po scenie, aby się rozejrzeć.':'Przesuń palcem, aby obrócić bazę. Wybierz pokój, aby go przybliżyć.'}</p>
  <div class="hq84-rooms" aria-label="Pomieszczenia">${HQ_ROOMS.map(([id,name,icon])=>`<button type="button" data-hq84-room="${id}">${icon} ${name}</button>`).join('')}${walk?'':'<button type="button" data-hq84-room="overview">⌖ Cała baza</button>'}</div>
  <div class="hq84-shortcuts" aria-label="Skróty w bazie">${mainButtons.map(([label,action])=>button(label,action,'alt')).join('')}</div>
 </section>`;
}
export function hqWallet(profile,button){
 const {coins,gems,energy}=hqBalances(profile);
 return `<h3>👛 Portfel</h3><dl class="hq84-wallet"><dt>Złote z misji</dt><dd>🪙 ${coins}</dd><dt>Kryształy z gier</dt><dd>💎 ${gems}</dd><dt>Żetony do automatów</dt><dd>⚡ ${energy}</dd></dl>${button('🛡️ Otwórz sklep ze zbrojami','hq:shop','gold')}`;
}
export function hqShop(profile,slot,button){
 const {gems}=hqBalances(profile),owned=new Set(profile.base?.owned??[]);
 const title=HQ_SLOTS.find(([id])=>id===slot)?.[1];
 const items=[...BASE_ITEMS].sort((a,b)=>Number(b.zone==='armory')-Number(a.zone==='armory'));
 return `<h3>🛡️ Sklep i kolekcja</h3><p>${title?'Miejsce na trofeum: '+title+'.':'Kup wyposażenie i wybierz, gdzie je ustawić.'}</p>
  ${button('👛 Portfel','hq:wallet','alt')}
  <div class="hq84-catalog">${items.map(item=>{
   const gemPrice=GEM_PRICES[item.id];
   const photo=HQ_ART.has(item.id)?`<img src="assets/art/item-${item.id}.svg" alt="" loading="lazy">`:`<span aria-hidden="true">${item.icon}</span>`;
   const place=slot?button('Ustaw tutaj','hq:place:'+item.id+':'+slot,'gold'):button('Wybierz miejsce','hq:places:'+item.id,'alt');
   const buy=affordable82(profile,item)?button(item.cost?'🪙 '+item.cost+' złotych':'🎁 Odbierz','base:buy:'+item.id,'gold'):`<button type="button" disabled>🪙 ${item.cost} złotych</button>`;
   const gemsBuy=gemPrice?(gems>=gemPrice?button('💎 '+gemPrice+' kryształów','hq:buy-gems:'+item.id,'alt'):`<button type="button" disabled>💎 ${gemPrice} kryształów</button>`):'';
   return `<article>${photo}<h4>${escape(item.name)}</h4><div>${owned.has(item.id)?place:buy+gemsBuy}</div></article>`;
  }).join('')}</div>`;
}
export function hqPetMarkup(profile,quiz,button){
 const pet=hqRead(profile).pet,food=hqFood(profile).length;
 if(!pet)return `<h3>🐾 Wybierz przyjaciela</h3><label for="hq84-pet-name">Imię zwierzaka</label><input id="hq84-pet-name" maxlength="22" placeholder="Np. Puszek">${button('🐱 Wybieram kota','hq:adopt:cat','gold')}${button('🐶 Wybieram psa','hq:adopt:dog','alt')}`;
 if(quiz&&quiz.index<quiz.items.length){
  const [q,answers,,pl]=quiz.items[quiz.index];
  return `<h3>🥣 Trening po karmę</h3><p>Pytanie ${quiz.index+1} z ${quiz.items.length}</p><h4>${escape(q)}</h4>${pl?`<p>${escape(pl)}</p>`:''}<div class="hq84-answers">${answers.map((answer,index)=>button(escape(answer),'hq:answer:'+index,'alt')).join('')}</div><p id="hq84-answer-status" role="status"></p>`;
 }
 return `<h3>${pet.species==='dog'?'🐶':'🐱'} ${escape(pet.name)}</h3><p>🥣 Porcje karmy: <b>${food}</b> · Nakarmienia: ${new Set(hqRead(profile).foodServed??[]).size}</p>
  ${food?button('🥣 Nakarm zwierzaka','hq:feed','gold'):''}${button('📚 Zdobądź karmę · 5 pytań','hq:food','alt')}${button('🥚 Ściśnij gniotek','hq:egg','alt')}`;
}
