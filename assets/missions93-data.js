import {shuffle92} from './learning-games92.js?v=92';

export const schoolMissions93=[
 ['monster','👾','Głodne Potworki i Koszyki','Policz owoce w równych koszykach i nakarm potworka.'],
 ['space','🚀','Kosmiczny Slalom','Skieruj rakietę do bramy z poprawnym wynikiem.'],
 ['chocolate','🍫','Fabryka Czekoladek','Ułóż tabliczkę, policz kostki i obróć formę.'],
 ['chameleon','🦎','Kameleon i Muchy','Złap wszystkie muchy z pasującym iloczynem.'],
 ['frog','🐸','Skacząca Żabka po Nenufarach','Przeskakuj po wielokrotnościach, aż dotrzesz na brzeg.'],
 ['potions','🧪','Magiczne Eliksiry','Wybierz fiolkę, która uzupełnia działanie.'],
 ['duel','🏴‍☠️','Pojedynek na Karty','Porównuj iloczyny na swojej karcie i karcie pirata.']
];
export const preschoolMissions93=[
 ['dino','🦕','Dinozaur Pożeracz Literek','Posłuchaj początku słowa i podaj dinozaurowi właściwe jajko.'],
 ['rail','🚂','Pociąg Pełen Cyferek','Policz przedmioty i wstaw je do właściwego wagonika.'],
 ['snail','🐌','Śladami Ślimaka','Poprowadź ślimaka po ścieżce i zbierz listki.'],
 ['camera','📸','Zaczarowany Aparat','Sfotografuj wszystkie znaki, o które prosi lektor.'],
 ['bubble','🫧','Kąpiel Bąbelkowa','Przebij bańki od najmniejszej liczby do największej.'],
 ['closet','🧸','Szafa Zwierzątek','Dobierz koszulkę i spodenki z tą samą literą.'],
 ['cookies','🍪','Kto Zjadł Ciasteczko?','Zapamiętaj, ile ciastek było na talerzu.']
];
export const captainMissions93=[
 ['baggage','🧳','Odprawa Bagażowa i Fotele w Kabinie','Załaduj właściwe walizki lub posadź misie.'],
 ['takeoff','🛫','Dźwignia Startowa i Cyferkowa Brama','Pociągnij dźwignię i przeleć przez obręcze po kolei.'],
 ['airballs','🎈','Podniebny Slalom z Balonami','Steruj w górę lub w dół, omijaj burzę i łap liczby po kolei.'],
 ['feeder','🐦','Karmnik na Skrzydle Samolotu','Posłuchaj ptaszka i wleć w chmurę z właściwą literą.'],
 ['parcels','🌍','Zrzut Paczek dla Zwierząt','Zrzuć paczkę nad odpowiednią częścią świata.'],
 ['landing','🔶','Lądowanie na Pasie z Kształtami','Posłuchaj wieży i wyląduj na pasie o odpowiednim kształcie i kolorze.'],
 ['seasons','🍂','Tunel Wiatrowy Pór Roku','Przeleć przez cztery tunele i złap przedmioty pasujące do pory roku.']
];
export const aceMissions93=[
 ['engine','🔐','Kokpit Matematyczny – Odpalić Silniki!','Wpisz kody z dodawania, odejmowania i mnożenia.'],
 ['spelling','🎈','Ortograficzne Balony na Horyzoncie','Wybierz wysokość lotu i złap litery do wyrazów.'],
 ['fuel','⛽','Tankowanie w Locie – Baza Rachunkowa','Tankuj z cysterny oznaczonej poprawnym wynikiem.'],
 ['radar','📡','Radar i Cele Geometrii','Znajdź właściwe figury na radarze.'],
 ['cargo','📦','Sortownia Ładunków – Części Mowy','Załaduj skrzynie i dostarcz je do właściwych hangarów.'],
 ['radio','🎧','Radiostacja Wieży Kontroli','Posłuchaj angielskich komend i wykonaj manewr.'],
 ['airport','🛬','Międzynarodowe Lotnisko','Odpowiedz po angielsku na pytania z wieży.']
];

const letters=[['M','motyl','🦋','mmm'],['S','sok','🧃','sss'],['J','jabłko','🍎','jjj'],
 ['K','kot','🐱','k'],['R','ryba','🐟','rrr'],['A','arbuz','🍉','aaa'],['B','banan','🍌','b'],['O','oko','👁️','ooo']];
const numberList=n=>Array.from({length:n},(_,i)=>i+1);
const select=(items,i)=>items[i%items.length];
const choose=(options,random)=>options[Math.floor(random()*options.length)];
const card=(label,value=label,icon='',words=String(label))=>({label,value,icon,words});
const multiple=(answer,others,random)=>shuffle92([answer,...shuffle92([...new Set(others)].filter(v=>v!==answer),random).slice(0,2)],random).map(v=>card(v));
const times=(a,b)=>a+' × '+b;
const timesVoice=(a,b)=>a+' razy '+b;
const mathChoices=(a,b,random)=>multiple(a*b,[a*b-a,a*b+b,a*b+1,a*b+2,a*b-1].filter(v=>v>0),random);

export function missionDeck93(id,grade,random=Math.random){
 const cap=Number(grade)===1?25:50;
 const factors=numberList(Number(grade)===1?5:10).slice(1);
 const pool=shuffle92(factors.flatMap(a=>factors.filter(b=>a*b<=cap).map(b=>[a,b])),random);
 const length={takeoff:1,airballs:1,seasons:4,bubble:3,camera:4,closet:4,baggage:4,parcels:4,landing:5,cargo:6,radio:6,airport:5}[id]??6;
 const spelling=[['G_RA','Ó','góra','Ó','U'],['B_TY','U','buty','Ó','U'],['_ABA','Ż','żaba','RZ','Ż'],['BU_ZA','RZ','burza','RZ','Ż'],['W_ZEK','Ó','wózek','Ó','U'],['KU_Z','RZ','kurz','RZ','Ż']];
 const biomes=[
  ['Pingwin cesarski','🐧','Antarktyda','Pingwin cesarski żyje w okolicach Antarktydy.'],
  ['Niedźwiedź polarny','🐻‍❄️','Arktyka','Niedźwiedź polarny żyje w Arktyce.'],
  ['Lew afrykański','🦁','Afryka','Lwa spotkasz na afrykańskiej sawannie.'],
  ['Kangur','🦘','Australia','Kangur żyje w Australii.']
 ];
 const seasons=[
  ['wiosna',[card('Pąk','yes','🌱'),card('Płatek śniegu','no1','❄️'),card('Jesienny liść','no2','🍂')]],
  ['lato',[card('Dojrzała truskawka','yes','🍓'),card('Sople','no1','🧊'),card('Bałwan','no2','⛄')]],
  ['jesień',[card('Kasztan','yes','🌰'),card('Kwitnący krokus','no1','🌷'),card('Bałwan','no2','⛄')]],
  ['zima',[card('Płatek śniegu','yes','❄️'),card('Dojrzała truskawka','no1','🍓'),card('Kwitnący tulipan','no2','🌷')]]
 ];
 const cargo=[
  ['dom','Rzeczowniki'],['biegać','Czasowniki'],['piękny','Przymiotniki'],['pilot','Rzeczowniki'],['lecieć','Czasowniki'],
  ['niebieski','Przymiotniki'],['lotnisko','Rzeczowniki'],['liczyć','Czasowniki'],['wielki','Przymiotniki']
 ];
 const runway=[
  card('Żółty trójkąt','0','triangle yellow'),card('Niebieskie koło','1','circle blue'),
  card('Czerwony kwadrat','2','square red'),card('Zielony prostokąt','3','rectangle green'),
  card('Czerwony trójkąt','4','triangle red'),card('Żółte koło','5','circle yellow')
 ];
 const radar=[
  ['Zaznacz czworokąt o czterech równych bokach i czterech kątach prostych.','Kwadrat','square',['Trójkąt','triangle'],['Prostokąt','rectangle']],
  ['Zaznacz figurę bez boków i bez wierzchołków.','Koło','circle',['Trójkąt','triangle'],['Kwadrat','square']],
  ['Znajdź figurę, która ma trzy boki.','Trójkąt','triangle',['Koło','circle'],['Romb','diamond']],
  ['Zaznacz czworokąt, który ma dwa krótsze i dwa dłuższe boki oraz cztery kąty proste.','Prostokąt','rectangle',['Kwadrat','square'],['Romb','diamond']],
  ['Omiń trójkąt rozwartokątny. Wybierz trójkąt z kątem prostym.','Trójkąt prostokątny','right',['Trójkąt rozwartokątny','obtuse'],['Trójkąt równoboczny','triangle']],
  ['Znajdź figurę, która ma pięć boków.','Pięciokąt','pentagon',['Kwadrat','square'],['Sześciokąt','hexagon']]
 ];
 const radio=[
  ['Turn left to the red island!','left','red'],['Fly up above the clouds!','up',''],
  ['Turn right to the blue island!','right','blue'],['Fly down below the clouds!','down',''],
  ['Turn left to the green island!','left','green'],['Turn right to the red island!','right','red']
 ];
 const airports=[
  ['How many passengers are on board?','I have four passengers.','I am eight years old.','My engine is red.','🧸🧸🧸🧸'],
  ['What colour is your engine?','My engine is red.','I have four passengers.','It is a cat.','🔴'],
  ['Where are you from?','I am from Poland.','It is sunny.','I have two bags.','🇵🇱'],
  ['What is the weather like?','It is sunny.','My bag is green.','I have one ticket.','☀️'],
  ['How many bags do you have?','I have two bags.','My plane is blue.','I am from Poland.','🧳🧳']
 ];
 const words=shuffle92(letters,random);
 return Array.from({length},(_,i)=>{
  const [a,b]=pool[i],product=a*b;
  const formula=times(a,b)+' = ?';
  const formulaSpeech='Ile to '+timesVoice(a,b)+'?';
  const [letter,word,icon,sound]=select(words,i);
  const letterOptions=()=>shuffle92([letter,...shuffle92(letters.map(row=>row[0]).filter(l=>l!==letter),random).slice(0,3)],random).map(l=>card(l,l,'',letters.find(row=>row[0]===l)[3]));
  switch(id){
   case 'monster':{
    const groups=2+i%3,each=2+Math.floor(i/2);
    const apples=each+' '+(each<5?'jabłka':'jabłek');
    return {kind:'baskets',prompt:groups+' koszyki. W każdym po '+apples+'.',speech:'Policz wszystkie jabłka. Mamy '+groups+' koszyki, po '+apples+' w każdym.',groups,each,answer:groups*each,options:mathChoices(groups,each,random),explain:times(groups,each)+' = '+Array(groups).fill(each).join(' + ')+' = '+groups*each};
   }
   case 'space': case 'fuel':
    return {kind:'flight',prompt:formula,speech:formulaSpeech,options:mathChoices(a,b,random),answer:product,time:id==='space'?10:16,explain:times(a,b)+' = '+product};
   case 'chocolate':{
    const rows=2+i%3,columns=3+Math.floor(i/2);
    return {kind:'chocolate',prompt:'Zamówienie: '+rows+' rzędy po '+columns+' kostek.',speech:'Zaznacz prostokąt: '+rows+' rzędy po '+columns+' kostek. Potem wpisz liczbę kostek.',rows,columns,answer:rows*columns,explain:times(rows,columns)+' = '+times(columns,rows)+' = '+rows*columns};
   }
   case 'chameleon':{
    const targets=Number(grade)===1?[6,8,10,12,15,20]:[12,18,20,24,30,36],answer=targets[i];
    const pairs=factors.flatMap(x=>factors.filter(y=>x<=y&&x*y<=cap).map(y=>[x,y]));
    const good=shuffle92(pairs.filter(([x,y])=>x*y===answer),random).slice(0,2);
    const target=answer;
    const decoys=shuffle92(pairs.filter(([x,y])=>x*y!==target),random).slice(0,4-good.length);
    return {kind:'collect',prompt:'Złap wszystkie muchy z wynikiem '+target+'.',speech:'Złap wszystkie muchy z wynikiem '+target+'.',answer:target,options:shuffle92([...good,...decoys],random).map(([x,y])=>card(times(x,y),x*y,'🪰',timesVoice(x,y)))};
   }
   case 'frog':{
    const jump=2+i%5,steps=i<2?4:5,needed=numberList(steps).map(n=>n*jump),extra=numberList(steps).map(n=>n*jump-1);
    return {kind:'sequence',prompt:'Skacz co '+jump+'. Wykonaj '+steps+' skoków.',speech:'Żabka skacze o '+jump+' oczka. Wykonaj '+steps+' skoków.',options:[...needed,...extra].sort((x,y)=>x-y).map(n=>card(n)),needed};
   }
   case 'potions': return {kind:'drop',prompt:a+' × ? = '+product,speech:'Wybierz brakującą liczbę w działaniu '+a+' razy ile równa się '+product+'?',drop:'Kociołek',targetIcon:'🫕',options:multiple(b,[b-2,b-1,b+1,b+2].filter(n=>n>0),random),answer:b,explain:times(a,b)+' = '+product};
   case 'duel':{
    const [c,d]=pool.find(pair=>pair[0]*pair[1]!==product&&(i%2?pair[0]*pair[1]>product:pair[0]*pair[1]<product))??pool.find(pair=>pair[0]*pair[1]!==product);
    return {kind:'duel',prompt:'Która karta ma większy wynik?',speech:'Która karta ma większy wynik?',options:[card(times(a,b),'you','🦸',timesVoice(a,b)),card(times(c,d),'pirate','🏴‍☠️',timesVoice(c,d))],answer:product>c*d?'you':'pirate',explain:times(a,b)+' = '+product+' · '+times(c,d)+' = '+c*d};
   }
   case 'dino':return {kind:'drop',prompt:'Podaj jajko z pierwszą literą.',speech:'Posłuchaj początku słowa: '+sound+'… '+word+'. Podaj właściwe jajko.',icon,drop:'Pyszczek dinozaura',options:letterOptions(),answer:letter,explain:'Pierwsza litera słowa „'+word+'” to '+letter+'.'};
   case 'rail':{
    const count=select([3,1,4,2,5,3],i);
    return {kind:'rail',prompt:'Policz i wybierz wagonik.',speech:'Policz przedmioty. Przeciągnij je do wagonika z odpowiednią liczbą.',count,icon:select(['🎈','🧸','🍎','⭐','🍐'],i),options:numberList(5).map(n=>card(n)),answer:count};
   }
   case 'camera':{
    const target=i%2?2+i:letter;
    const parts=i%2?[1,2,3,4,5,6,7,8,9]:letters.map(row=>row[0]);
    const repeat=i<2?3:4;
    const values=shuffle92([...Array(repeat).fill(target),...shuffle92(parts.filter(v=>v!==target),random).slice(0,8-repeat)],random);
    return {kind:'collect',prompt:i%2?'Znajdź wszystkie '+target+'.':'Sfotografuj wszystkie '+target+'.',
     speech:i%2?'Sfotografuj wszystkie cyfry '+target+'.':'Sfotografuj wszystkie litery takie jak pierwsza głoska w słowie '+word+'.',
     answer:target,options:values.map(n=>card(n,n,'',typeof n==='number'?String(n):letters.find(l=>l[0]===n)?.[3]??n))};
   }
   case 'bubble':{
    const needed=numberList(5+i);
    return {kind:'sequence',prompt:'Przebij bańki po kolei.',speech:'Przebij bańki od najmniejszej do największej. Zacznij od jedynki.',options:shuffle92(needed,random).map(n=>card(n)),needed};
   }
   case 'closet':{
    const upper=words.slice(i,i+3).map(row=>row[0]);
    const item=l=>card(l,l.toUpperCase(),'',letters.find(row=>row[0]===l.toUpperCase())[3]);
    return {kind:'closet',prompt:'Dobierz komplet dla misia.',speech:'Wybierz koszulkę z wielką literą. Potem dobierz spodenki z tą samą małą literą.',tops:upper.map(item),bottoms:shuffle92(upper,random).map(l=>item(l.toLowerCase())),count:upper.length};
   }
   case 'cookies':return {kind:'memory',prompt:'Ile ciasteczek jest na talerzu?',speech:'Spójrz na talerz. Zapamiętaj, ile jest ciasteczek.',answer:choose(numberList(4),random),options:numberList(4).map(n=>card(n))};
   case 'baggage':{
    const count=2+i%4,seat=i%2===1;
    return {kind:'load',prompt:seat?'Posadź '+count+' '+(count<5?'misie.':'misiów.'):'Załaduj '+count+' walizki z literą '+letter+'.',
     speech:seat?'Posadź misie na fotelach. Jest ich '+count+'.':'Włóż do luku walizki z pierwszą głoską słowa '+word+'. Wybierz '+count+' walizek.',
     count,seat,answer:seat?'bear':letter,options:shuffle92([...Array(count).fill(seat?card('Miś','bear','🧸'):card(letter,letter,'🧳',sound)),...(seat?[card('Piłka','ball','⚽'),card('Bagaż','case','🧳')]:letterOptions().filter(c=>c.value!==letter).map(c=>({...c,icon:'🧳'})))],random)};
   }
   case 'takeoff':case 'airballs':{
    const needed=numberList(id==='takeoff'?4:6);
    return {kind:'flightSequence',prompt:id==='takeoff'?'Uruchom silnik i przeleć przez obręcze.':'Łap balony w kolejności i omijaj burzę.',speech:id==='takeoff'?'Przeciągnij dźwignię i przeleć przez obręcze od jedynki.':'Steruj w górę i w dół. Łap balony od jedynki i omijaj burzę.',needed};
   }
   case 'feeder':{
    const options=letterOptions();
    return {kind:'flight',prompt:'Złap chmurę z pierwszą literą.',speech:'Ćwir, ćwir! Szukam czegoś, co zaczyna się tak: '+sound+'… '+word+'.',icon:'🐦 '+icon,word,sound,
     options:shuffle92([options.find(c=>c.value===letter),...options.filter(c=>c.value!==letter).slice(0,2)],random),answer:letter};
   }
   case 'parcels':{
    const [name,icon,answer,explain]=biomes[i];
    return {kind:'map',prompt:'Zawieź paczkę. Odbiorca: '+name+'.',speech:'Zawieź paczkę. Odbiorca: '+name+'. Wybierz strefę i naciśnij zrzut.',icon,answer,explain,
     options:['Arktyka','Afryka','Australia','Antarktyda'].map(name=>card(name))};
   }
   case 'landing':{
    const answer=runway[i];
    const prompt='Wyląduj na pasie: '+answer.label.toLowerCase()+'.';
    return {kind:'flight',prompt,speech:prompt,answer:answer.value,options:shuffle92([answer,...shuffle92(runway.filter(c=>c!==answer),random).slice(0,2)],random),shape:true};
   }
   case 'seasons':{
    const [name,options]=seasons[i],prompt='Tunel: '+name+'. Co pasuje?';
    return {kind:'flight',prompt,speech:prompt,answer:'yes',options:shuffle92(options,random)};
   }
   case 'engine':{
    const add=cap-i*2,right=b+3;
    const equation=i%3===0?[a,'×',b,product]:i%3===1?[add,'−',right,add-right]:[i+7,'+',a,i+7+a];
    const [x,op,y,answer]=equation;
    return {kind:'keypad',prompt:x+' '+op+' '+y+' = ?',speech:'Podaj wynik: '+x+' '+({'×':'razy','−':'minus','+':'plus'}[op])+' '+y+'.',answer,explain:x+' '+op+' '+y+' = '+answer};
   }
   case 'spelling':{
    const [prompt,answer,explain,one,two]=spelling[i];
    return {kind:'flight',prompt,speech:'Uzupełnij wyraz '+explain+'.',answer,explain:'Poprawna pisownia: '+explain+'.',options:shuffle92([card(one),card(two)],random)};
   }
   case 'radar':{
    const [prompt,answer,shape,one,two]=radar[i];
    return {kind:'radar',prompt,speech:prompt,answer,options:shuffle92([card(answer,answer,shape),card(one[0],one[0],one[1]),card(two[0],two[0],two[1])],random),shape:true};
   }
   case 'cargo':{
    const [word,answer]=cargo[i];
    return {kind:'cargo',prompt:'Dostarcz skrzynię: '+word+'.',speech:'Załaduj skrzynię ze słowem '+word+'. Dostarcz ją do właściwego hangaru.',word,answer,options:['Rzeczowniki','Czasowniki','Przymiotniki'].map(name=>card(name))};
   }
   case 'radio':{
    const [speech,direction,color]=radio[i];
    return {kind:'radio',prompt:'Posłuchaj wieży kontroli.',speech,direction,color,lang:'en-US'};
   }
   case 'airport':{
    const [speech,answer,d1,d2,icon]=airports[i];
    return {kind:'choice',prompt:speech,speech,lang:'en-US',answer,icon,options:shuffle92([answer,d1,d2],random).map(text=>card(text))};
   }
  }
  throw new Error('Nieznana misja: '+id);
 });
}
