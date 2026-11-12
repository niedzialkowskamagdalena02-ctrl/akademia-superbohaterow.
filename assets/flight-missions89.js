const wordGroups={
 rzeczownik:['pilot','chmura','samolot','kot','rower','plecak','kosmos','zegar','lampa','sowa','lotnisko','książka','drzewo','most','gwiazda','miasto','statek','mapa'],
 przymiotnik:['niebieski','wesoły','duży','słodka','mały','zielony','mokry','cicha','lekki','puszysty','wysoki','okrągły','zimny','miękka','kolorowy','krótka'],
 czasownik:['leci','rysuje','biegnie','świeci','czyta','skacze','pisze','gotuje','tańczy','płynie','szuka','śpiewa','buduje','liczy','myje','patrzy'],
 przysłówek:['szybko','głośno','wysoko','ostrożnie','wolno','wesoło','cicho','daleko']
};

const spellings={
 ou:[
  ['góra','gura'],['wózek','wuzek'],['król','krul'],['mróz','mruz'],
  ['ogórek','ogurek'],['piórnik','piurnik'],['wróbel','wrubel'],['stół','stuł'],
  ['kurz','kórz'],['buty','bóty'],['burza','bórza'],['kubek','kóbek']
 ],
 zrz:[
  ['żaba','rzaba'],['żuk','rzuk'],['żyrafa','rzyrafa'],['nożyczki','norzyczki'],
  ['łyżka','łyrzka'],['kałuża','kałurza'],['rzęsa','żęsa'],['grzyb','gżyb'],
  ['orzech','ożech'],['porządek','pożądek'],['rzodkiewka','żodkiewka'],['brzeg','bżeg']
 ],
 hch:[
  ['hałas','chałas'],['hamak','chamak'],['helikopter','chelikopter'],['herbata','cherbata'],
  ['bohater','bochater'],['hulajnoga','chulajnoga'],['chleb','hleb'],['chmura','hmura'],
  ['chustka','hustka'],['chomik','homik'],['chata','hata'],['schody','shody']
 ]
};

const missions=[
 {title:'Rzeczowniki',goal:'Złap wszystkie rzeczowniki.',instruction:'Szukaj nazw osób, zwierząt, miejsc i rzeczy.',kind:'rzeczownik',seconds:5.5},
 {title:'Przymiotniki',goal:'Złap wszystkie przymiotniki.',instruction:'Szukaj słów, które mówią, jaki ktoś lub coś jest.',kind:'przymiotnik',seconds:5.5},
 {title:'Czasowniki',goal:'Złap wszystkie czasowniki.',instruction:'Szukaj słów, które mówią, co ktoś robi lub co się dzieje.',kind:'czasownik',seconds:5.5},
 {title:'Ó czy U?',goal:'Złap wyrazy z poprawnym ó lub u.',instruction:'Sprawdź, czy w słowie pasuje ó zamknięte, czy u otwarte.',pairs:spellings.ou,seconds:7},
 {title:'Ż czy RZ?',goal:'Złap wyrazy z poprawnym ż lub rz.',instruction:'Sprawdź, czy w słowie pasuje ż z kropką, czy rz.',pairs:spellings.zrz,seconds:7},
 {title:'Strzał w literówkę',goal:'Traf w wyrazy z literówką.',instruction:'Wybierz pas z błędnie zapisanym słowem i naciśnij Strzał.',pairs:Object.values(spellings).flat(),shoot:true,seconds:8},
 {title:'H czy CH?',goal:'Złap wyrazy z poprawnym h lub ch.',instruction:'Sprawdź, czy w słowie pasuje h, czy ch.',pairs:spellings.hch,seconds:7}
];

export const FLIGHT_ROUNDS89=3;
export const GATES_PER_ROUND89=4;

export function flightMission89(index){
 return missions[index]??missions[0];
}
export function nextFlightMission89(index){
 return (index+1)%missions.length;
}

export function readFlightMission89(child,preview){
 if(!child||preview)return 0;
 try{
  const index=Number(localStorage.getItem('academy-v89-flight-'+child));
  return Number.isInteger(index)&&index>=0&&index<missions.length?index:0;
 }catch{return 0;}
}
export function saveFlightMission89(child,preview,index){
 if(!child||preview)return;
 try{localStorage.setItem('academy-v89-flight-'+child,String(index));}catch{}
}

function shuffled(items,random){
 const copy=[...items];
 for(let i=copy.length-1;i>0;i--){
  const j=Math.floor(random()*(i+1));
  [copy[i],copy[j]]=[copy[j],copy[i]];
 }
 return copy;
}

export function flightGates89(mission,random=Math.random){
 if(mission.kind){
  const targets=shuffled(wordGroups[mission.kind],random);
  const decoys=shuffled(Object.entries(wordGroups).filter(([kind])=>kind!==mission.kind)
   .flatMap(([kind,words])=>words.map(word=>({word,kind}))),random);
  return targets.slice(0,GATES_PER_ROUND89).map((word,index)=>shuffled([
   {word,kind:mission.kind,goal:true},
   decoys[index*2],
   index===2?{rock:true}:index===1?null:decoys[index*2+1]
  ],random));
 }
 const pairs=shuffled(mission.pairs,random);
 return pairs.slice(0,GATES_PER_ROUND89).map(([correct,wrong],index)=>{
  const [secondCorrect,secondWrong]=pairs[index+GATES_PER_ROUND89];
  const [thirdCorrect]=pairs[index+GATES_PER_ROUND89*2];
  return shuffled(mission.shoot?[
   {word:wrong,correction:correct,goal:true},{word:secondCorrect},{word:thirdCorrect}
  ]:[
   {word:correct,goal:true},{word:wrong,correction:correct},{word:secondWrong,correction:secondCorrect}
  ],random);
 });
}

export function flightHit89(state,mission,gate){
 if(!gate||state.hearts<=0)return '';
 if(gate.goal){
  state.score++;
  if(mission.shoot)return 'Trafione! Poprawnie piszemy „'+gate.correction+'”.';
  return mission.kind?'„'+gate.word+'” to '+mission.kind+'.':'Dobrze! „'+gate.word+'” to poprawna pisownia.';
 }
 state.hearts--;
 if(gate.rock)return 'Uwaga, przeszkoda!';
 if(mission.shoot)return '„'+gate.word+'” jest zapisane poprawnie. Szukaj błędu.';
 if(gate.correction)return 'Poprawnie piszemy „'+gate.correction+'”.';
 return '„'+gate.word+'” to '+gate.kind+'.';
}
