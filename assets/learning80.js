import {cleanEnglish76,englishRecall774,VOCAB76,readingProgress79} from './english76.js?v=80';

export function derangement80(n,random=Math.random){
 const a=Array.from({length:n},(_,i)=>i);
 for(let i=n-1;i>0;i--){const j=Math.min(i-1,Math.floor(random()*i));[a[i],a[j]]=[a[j],a[i]];}
 return a;
}
export function ensurePairOrder80(t){
 const n=t.pairs?.length||0;
 if(!t.v80PairOrder&&!t.matched?.length){t.right=derangement80(n);t.v80PairOrder=true;}
 return t;
}
export function readingMeanings80(t){
 return (t.readWords||[]).map((en,i)=>({en,pl:VOCAB76.find(x=>x.en===cleanEnglish76(en))?.pl||String(t.readMeanings?.[i]||'').trim()})).filter(x=>x.pl&&x.pl.length<100);
}
export function meaningSpeech80(t){
 return readingMeanings80(t).flatMap(x=>[{text:x.en,lang:'en-GB',rate:.72,pauseAfterMs:220},{text:'to '+x.pl+'.',lang:'pl-PL',rate:.87,pauseAfterMs:450}]);
}
export function spreadListening80(tasks,pool,previous={}){
 const allowed=pool.filter(x=>/^[a-z]{2,12}$/.test(x.en)&&!['listen','think','read','write','say','ask'].includes(x.en));
 const counts={...(previous.counts||{})},used=new Set();let last=String(previous.last||'');
 const result=tasks.map(t=>{
  if(!['listening','dictation','vocab-listen'].includes(t.type)||englishRecall774(t)||!allowed.length)return t;
  const fresh=allowed.filter(x=>!used.has(x.en));let candidates=fresh.length?fresh:allowed;
  const notLast=candidates.filter(x=>x.en!==last);if(notLast.length)candidates=notLast;
  const min=Math.min(...candidates.map(x=>Number(counts[x.en])||0));
  const word=candidates.find(x=>(Number(counts[x.en])||0)===min);
  counts[word.en]=(Number(counts[word.en])||0)+1;used.add(word.en);last=word.en;
  const next={...t,answer:word.en,wordEn:word.en,audio:word.en,promptPl:word.pl,answerPl:word.pl,answerPlFor:word.en,picture:word.picture||'',sourcePageId:word.sourcePageId,sourceBookId:word.sourceBookId,sourceTitle:word.sourceTitle,pageNumber:word.pageNumber,question:'Listen and write the word.',questionPl:'Posłuchaj i zapisz słowo.',instructionEn:'Listen and write the word.',instructionPl:'Posłuchaj i zapisz słowo.',explanation:'Po angielsku „'+word.pl+'” to „'+word.en+'”.',v79UnsafeListening:false};
  if(cleanEnglish76(t.answer)!==word.en){next.v80OriginalBankKey=t._bankKey;delete next._bankKey;}
  return next;
 });
 return {tasks:result,history:{counts,last}};
}
function plain80(q){return String(q||'').toLocaleLowerCase('pl-PL').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ł/g,'l');}
export function interfaceQuestion80(question){
 const q=plain80(question);
 const ui=/przycisk|mikrofon|glosnik|ekran|pole (?:tekst|odpowiedz)|klik|nacis|dotkn|stuk|przesun|zaznacz|sterow|obslug|odtworz|nagryw|wylacz|wlacz|cofn|kafel|balon|rakiet|polacz|jak to dziala|jak mam odpowiedziec|co mam zrobic w (?:tej grze|tym zadaniu)/;
 const solution=/(?:podaj|zdradz|daj|jaka jest|ktora jest|poprawna|prawidlowa).{0,30}(?:odpowiedz|rozwiaz)|(?:co oznacza|co znaczy|przetlumacz|jak przeliter|jaka litere|ktora litere|ktore slowo|ktory wyraz)|(?:ktory|ktora|ktore).{0,30}(?:wybrac|nacisnac|zaznaczyc)|(?:napisz|powiedz).{0,20}(?:slowo|rozwiaz)/;
 if(solution.test(q)&&!/(?:gdzie|jak).{0,30}przycisk.{0,12}(?:pokaz odpowiedz|podpowiedz)/.test(q))return false;
 return ui.test(q)&&/jak|gdzie|czym|co mam|co to|nie wiem|nie umiem|nie moge|nie dziala|pomoz|pomoc|wytlumacz|wyjasnij/.test(q);
}
export function interfaceHelp80(t){
 if(t?.game80){const k=t.game80;
  if(['letter-race','word-catcher'].includes(k))return 'Przesuwaj rakietę strzałkami albo palcem po planszy. Możesz też dotknąć wybranej litery lub gwiazdki, żeby ją złapać. Głośnik powtarza polecenie.';
  if(['egg','balloon','rebus'].includes(k))return 'Dotykaj liter, aby układać słowo. Przyciskiem Cofnij usuniesz ostatnią literę. Potem naciśnij Sprawdź. Głośnik przy poleceniu odczyta instrukcję.';
  if(k==='monster-speak')return 'Naciśnij mikrofon i poczekaj, aż pokaże, że słucha. Powiedz słowo po angielsku. Dotknięcie mikrofonu ponownie kończy nagranie.';
  if(k==='monster-tf')return 'Obejrzyj obrazek i podpis. Zielony przycisk oznacza TAK, a drugi NIE. Dotknij przycisku zgodnego z Twoją decyzją.';
  if(k==='spot')return 'Dotykaj przedmiotów na obrazku. Na pasku u góry widać listę rzeczy do znalezienia. Głośnik powtarza polecenie.';
  if(k==='kitchen')return 'Naciśnij głośnik, żeby posłuchać zamówienia. Następnie dotykaj składników na półce, aby przekazać je kucharzowi. Pasek pokazuje postęp zamówienia.';
  return 'Naciśnij głośnik, żeby posłuchać dźwięku. Następnie dotknij wybranego obrazka na wyspie.';
 }
 if(t?.type==='vocab-match')return 'Dotknij jednego kafelka po lewej, a potem jednego po prawej, żeby połączyć parę. Każdy kafelek możesz nacisnąć ponownie, aby posłuchać jego wymowy. Zaliczone pary mają znaczek.';
 if(t?.type==='vocab-reading'||t?.type==='reading-mini')return 'Naciśnij mikrofon i przeczytaj podświetlone słowo. Po rozpoznaniu zmieni kolor na zielony. Możesz zrobić przerwę i kontynuować od następnego słowa. Głośnik pozwala posłuchać wzoru.';
 if(['vocab-choice','vocab-meaning'].includes(t?.type))return 'Dotknij kafelka, żeby posłuchać słowa i zaznaczyć wybór. Potem naciśnij Sprawdź wybór. Możesz wcześniej posłuchać różnych kafelków.';
 if(['listening','dictation','vocab-listen'].includes(t?.type))return 'Naciśnij Posłuchaj, a potem dotknij pola Wpisz odpowiedź. Wpisz usłyszane słowo i naciśnij Sprawdź. Nagranie można odtwarzać ponownie.';
 if(t?.type==='crossword')return 'Dotknij kratki i wpisuj litery. Poniżej planszy są ponumerowane polecenia. Po wpisaniu wyrazu naciśnij Sprawdź. Cofanie usuwa wpisaną literę.';
 if(t?.type==='wordsearch')return 'Dotknij pierwszej litery słowa, a potem kolejnych sąsiadujących liter na planszy. Możesz zmienić zaznaczenie i spróbować ponownie.';
 return 'Dotknij wybranego kafelka albo pola odpowiedzi. Jeśli jest przycisk Sprawdź, naciśnij go po dokonaniu wyboru. Głośnik odczytuje polecenie, a mikrofon służy do rozmowy z nauczycielem.';
}
