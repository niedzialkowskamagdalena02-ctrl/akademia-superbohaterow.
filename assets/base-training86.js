import {hqRead,HQ_AWARDS86} from './headquarters84.js?v=86';

export const MASTER_PRIZES86=HQ_AWARDS86.map(item=>item.id);
export const MASTER_SCORE86=8;

export function energy86(profile){
 const crystals=Object.values(hqRead(profile).correctRuns??{}).reduce((total,n)=>
  total+(Number.isSafeInteger(n)&&n>0?n:0),0);
 const capacity=8,charged=crystals?1+(crystals-1)%capacity:0;
 return {crystals,charged,capacity,level:1+Math.floor(Math.max(0,crystals-1)/capacity)};
}

export function recordEnergy86(profile,id,correct){
 if(!profile||!id||!Number.isSafeInteger(correct)||correct<=0||correct>100)return false;
 const base=profile.base??={owned:[],version:1};
 const state=base.headquarters??={};
 const runs=state.correctRuns??={};
 if(Object.hasOwn(runs,id))return false;
 runs[id]=correct;return true;
}

export function unlockMaster86(profile,correct,total){
 if(!profile||total!==10||correct<MASTER_SCORE86)return false;
 const owned=(profile.base??={version:1}).owned??=[];
 const prizes=MASTER_PRIZES86.filter(id=>!owned.includes(id));
 owned.push(...prizes);return prizes.length>0;
}

const nouns=[
 ['Robot ma zebrać nazwę zwierzęcia. Który wyraz wybierzesz?','kot','biegnie','zielony'],
 ['Wybierz rzeczownik, który nazywa osobę.','lekarka','szybko','kolorowy'],
 ['Który wyraz nazywa miejsce?','szkoła','wesoły','czytać'],
 ['Kto lub co? Który z tych wyrazów jest rzeczownikiem?','rower','pedałuje','czerwony'],
 ['W zdaniu „Maja rysuje” wybierz nazwę osoby.','Maja','rysuje','wesoło'],
 ['Robot sortuje nazwy rzeczy. Który wyraz do niego pasuje?','książka','otwiera','ciekawa'],
 ['Wybierz nazwę rośliny.','dąb','rośnie','wysoki'],
 ['W zdaniu „Pies śpi” wybierz rzeczownik.','pies','śpi','cicho']
];
const spelling=[
 ['Która część pasuje do „g_ra”?','ó','u'],
 ['Która część pasuje do „_lica”?','u','ó'],
 ['Napraw rurę z napisem „mo_e”. Chodzi o wodę i fale.','rz','ż'],
 ['Która część pasuje do „_aba”?','ż','rz'],
 ['Która część pasuje do „st_ł”?','ó','u'],
 ['Która część pasuje do „b_ty”?','u','ó'],
 ['Napraw rurę z napisem „_eka”.','rz','ż'],
 ['Która część pasuje do „ksią_ka”?','ż','rz']
];
const alphabet=[
 ['A, B, __','C','D','E','Wstaw kolejną literę.'],
 ['D, __, F','E','H','G','Wstaw literę, której brakuje.'],
 ['G, H, __','I','J','K','Wstaw kolejną literę.'],
 ['J, __, L','K','P','M','Wstaw literę, której brakuje.'],
 ['M, N, __','O','R','Q','Wstaw kolejną literę.'],
 ['P, __, R','Q','T','S','Wstaw literę, której brakuje.'],
 ['S, T, __','U','V','W','Wstaw kolejną literę.'],
 ['X, __, Z','Y','W','V','Wstaw literę, której brakuje.']
];
const plurals=[
 ['One cat, two …','cats','cat','cates','Jeden kot, dwa koty. Dokończ po angielsku.'],
 ['One dog, two …','dogs','dog','doges','Jeden pies, dwa psy. Dokończ po angielsku.'],
 ['One book, two …','books','book','bookes','Jedna książka, dwie książki. Dokończ po angielsku.'],
 ['One apple, two …','apples','apple','appless','Jedno jabłko, dwa jabłka. Dokończ po angielsku.'],
 ['One bus, two …','buses','bus','buss','Jeden autobus, dwa autobusy. Dokończ po angielsku.'],
 ['One box, two …','boxes','box','boxs','Jedno pudełko, dwa pudełka. Dokończ po angielsku.'],
 ['One baby, two …','babies','baby','babys','Jedno niemowlę, dwoje niemowląt. Dokończ po angielsku.'],
 ['One dish, two …','dishes','dish','dishs','Jedno naczynie, dwa naczynia. Dokończ po angielsku.']
];

const tasks={
 nouns:{name:'Mistrz rzeczowników',theme:'nouns',hero:'iron',subject:'polski',items:nouns},
 spelling:{name:'Ortografia U/Ó i RZ/Ż',theme:'spelling',hero:'groot',subject:'polski',items:spelling},
 alphabet:{name:'Alphabet Challenge',theme:'alphabet',hero:'spider',subject:'angielski',items:alphabet},
 plurals:{name:'Plural Monsters',theme:'plurals',hero:'hulk',subject:'angielski',items:plurals},
 mixed:{name:'Symulator misji',theme:'mixed',hero:'captain',items:[]},
 master:{name:'Language Master',theme:'master',hero:'thor',items:[]}
};
const shuffle=list=>{
 const items=[...list];
 for(let i=items.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[items[i],items[j]]=[items[j],items[i]];}
 return items;
};
function pick(id,limit){
 const group=tasks[id],english=group.subject==='angielski';
 const rows=id==='plurals'?[...shuffle(group.items.slice(0,4)),...shuffle(group.items.slice(4))]:shuffle(group.items);
 return rows.slice(0,limit).map(([q,correct,...rest])=>{
  const qPl=english?rest.pop():'';
  const a=shuffle([correct,...rest]);
  return {q,qPl,a,ok:a.indexOf(correct),lang:english?'en-US':'pl-PL',hero:group.hero,theme:group.theme};
 });
}

export function trainingRound86(id){
 if(!Object.hasOwn(tasks,id))return null;
 const group=tasks[id];
 const items=id==='master'?shuffle([...pick('nouns',3),...pick('spelling',2),...pick('alphabet',2),...pick('plurals',3)]):
  id==='mixed'?shuffle([...pick('nouns',2),...pick('spelling',2),...pick('alphabet',2),...pick('plurals',2)]):pick(id,6);
 return {name:group.name,subject:group.subject,items,kind86:id,i:0,points:0,done:false,good:false};
}

export function trainingConsole86(question,progress,correct){
 const theme=question.theme;
 const icon={nouns:'🤖',spelling:'🧪',alphabet:'🤖',plurals:'👾'}[theme];
 if(!icon)return '';
 if(theme==='plurals')return '<div class="hq86-training-console hq86-monsters" aria-hidden="true"><span>👾</span>'+(correct?'<span>👾</span>':'<span class="hq86-monster-pod">✧</span>')+'</div>';
 const count=6,position=Math.min(count-1,progress);
 return `<div class="hq86-training-console hq86-${theme}" style="--station:${position}" aria-hidden="true">
  ${Array.from({length:count},(_,i)=>`<i class="${i<=position?'active':''}"></i>`).join('')}<span>${icon}</span>
 </div>`;
}
