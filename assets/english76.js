// V76: tresc z podrecznika, jawne jezyki polecen i oddzielne cwiczenia slowek.
export const VOCAB76=[
 ['cat','kot','🐈'],['dog','pies','🐕'],['sun','słońce','☀️'],['house','dom','🏠'],['book','książka','📘'],['tree','drzewo','🌳'],['bird','ptak','🐦'],['fish','ryba','🐟'],['apple','jabłko','🍎'],['water','woda','💧'],['milk','mleko','🥛'],['car','samochód','🚗'],['ball','piłka','⚽'],['flower','kwiat','🌼'],['school','szkoła','🏫'],['pencil','ołówek','✏️'],['pen','długopis','🖊️'],['chair','krzesło','🪑'],['table','stół',''],['door','drzwi','🚪'],['window','okno','🪟'],['bed','łóżko','🛏️'],['red','czerwony','🔴'],['blue','niebieski','🔵'],['green','zielony','🟢'],['yellow','żółty','🟡'],['white','biały','⚪'],['black','czarny','⚫'],['orange','pomarańczowy','🟠'],['pink','różowy',''],['purple','fioletowy','🟣'],['brown','brązowy','🟤'],['one','jeden','1'],['two','dwa','2'],['three','trzy','3'],['four','cztery','4'],['five','pięć','5'],['six','sześć','6'],['seven','siedem','7'],['eight','osiem','8'],['nine','dziewięć','9'],['ten','dziesięć','10'],['monday','poniedziałek',''],['tuesday','wtorek',''],['wednesday','środa',''],['thursday','czwartek',''],['friday','piątek',''],['saturday','sobota',''],['sunday','niedziela',''],['mother','mama',''],['father','tata',''],['sister','siostra',''],['brother','brat',''],['friend','przyjaciel',''],['happy','szczęśliwy','🙂'],['sad','smutny','🙁'],['big','duży',''],['small','mały',''],['rabbit','królik','🐇'],['horse','koń','🐎'],['duck','kaczka','🦆'],['cow','krowa','🐄'],['pig','świnia','🐖'],['sheep','owca','🐑'],['lion','lew','🦁'],['elephant','słoń','🐘'],['monkey','małpa','🐒'],['banana','banan','🍌'],['bread','chleb','🍞'],['egg','jajko','🥚'],['cheese','ser','🧀'],['head','głowa',''],['hand','dłoń','✋'],['eye','oko','👁️'],['ear','ucho','👂'],['nose','nos','👃'],['mouth','usta',''],['leg','noga',''],['foot','stopa','🦶'],['arm','ręka',''],['body','ciało',''],['hello','cześć','👋'],['goodbye','do widzenia','👋']
].map(([en,pl,picture])=>({en,pl,picture}));
export const cleanEnglish76=s=>String(s||'').toLowerCase().replace(/[’']/g,"'").replace(/[^a-z0-9' ]/g,' ').replace(/\s+/g,' ').trim();
export function vocabulary76(text){
 const source=' '+cleanEnglish76(text)+' ';
 return VOCAB76.filter(x=>source.includes(' '+x.en+' ')&&(x.en!=='orange'||/\b(?:colo[u]?rs?|red|blue|green|yellow|purple|pink)\b/i.test(text)));
}
export function checkedVocabulary76(items,text){
 const source=' '+cleanEnglish76(text)+' ',seen=new Set(),out=[];
 for(const x of Array.isArray(items)?items:[]){const en=cleanEnglish76(x?.en),pl=String(x?.pl||'').trim();if(!en||en.length>45||!pl||pl.length>75||(en===cleanEnglish76(pl)&&!['zebra','radio','hotel','park','robot','zoo','sport','internet','film','video'].includes(en))||!source.includes(' '+en+' ')||seen.has(en))continue;seen.add(en);const known=VOCAB76.find(v=>v.en===en&&en!=='orange');out.push(known||{en,pl,picture:''});}
 return out.slice(0,60);
}
export function englishInstruction76(t){
 if(t?.instructionEn&&t?.instructionPl)return {en:t.instructionEn,pl:t.instructionPl};
 const known={
  crossword:['Solve the crossword. The highlighted letters will form the secret word.','Rozwiąż krzyżówkę. Wyróżnione litery utworzą hasło.'],
  wordsearch:['Find the words in the grid.','Znajdź słowa na planszy.'],
  order:['Put the words in the correct order.','Ułóż wyrazy w odpowiedniej kolejności.'],
  spelling:['Put the letters in the correct order.','Ułóż litery w odpowiedniej kolejności.'],
  memory:['Find the matching pairs.','Znajdź pasujące pary.'],
  listening:['Listen and write the word.','Posłuchaj i zapisz słowo.'],
  dictation:['Listen and write what you hear.','Posłuchaj i zapisz to, co usłyszysz.'],
  'vocab-write':['Write the English word.','Napisz po angielsku: '+(t.promptPl||'')+'.'],
  'vocab-speak':['Say the English word. Tap the microphone to answer.','Jak jest po angielsku „'+(t.promptPl||'')+'”? Naciśnij mikrofon i odpowiedz po angielsku.'],
  'vocab-repeat':['Listen, then say the word.','Posłuchaj i powtórz słowo.'],
  'vocab-choice':['Choose the matching English word.','Wybierz po angielsku: '+(t.promptPl||'')+'.'],
  'vocab-meaning':['What does this word mean?','Co oznacza to słowo?'],
  'vocab-listen':['Listen and write the word.','Posłuchaj i zapisz słowo.'],
  'vocab-reading':['Read the words aloud, in order.','Przeczytaj słowa po angielsku, w podanej kolejności.']
 };
 // Wlasne pytanie AI ma pierwszenstwo przed szablonem, o ile ma oba jezyki.
 if(t?.questionPl&&typeof t.question==='string'&&!/[ąćęłńóśźż]/i.test(t.question)&&!/^\s*[📝🧩🎧🃏🔎]/u.test(t.question))return {en:t.question,pl:t.questionPl};
 if(known[t?.type])return {en:known[t.type][0],pl:known[t.type][1]};
 const q=String(t?.question||'').trim();
 if(q&& !/[ąćęłńóśźż]|\b(rozwiąż|uloz|ułóż|znajdź|przeczytaj|podręcznika|wybierz|zapisz|posłuchaj)\b/i.test(q))return {en:q,pl:t?.questionPl||'Wykonaj polecenie po angielsku.'};
 return {en:'Choose the correct answer.',pl:q||'Wybierz poprawną odpowiedź.'};
}
export function task76(entry,type,pool,index=0){
 const distractors=pool.filter(x=>x.en!==entry.en&&x.pl!==entry.pl).slice(0,3);
 if(['vocab-choice','vocab-meaning'].includes(type)&&distractors.length<3)type='vocab-write';
 const meaning=type==='vocab-meaning',opts=[meaning?entry.pl:entry.en,...distractors.map(x=>meaning?x.pl:x.en)];
 if(opts.length>1){const at=index%opts.length;opts.push(...opts.splice(0,at));}
 const t={type,answer:meaning?entry.pl:entry.en,options:opts,wordEn:entry.en,promptPl:entry.pl,picture:entry.picture||'',audio:entry.en,explanation:entry.en+' — '+entry.pl,pageNumber:entry.pageNumber||'',sourcePageId:entry.sourcePageId,sourceBookId:entry.sourceBookId,sourceTitle:entry.sourceTitle||'',done:false,correct:false};
 const instruction=englishInstruction76(t);t.question=instruction.en;t.questionPl=instruction.pl;t.instructionEn=instruction.en;t.instructionPl=instruction.pl;
 return t;
}
export function makeVocabularyTasks76(pool,rotation=0,count=10){
 if(!pool.length)return [];
 const kinds=['vocab-choice','vocab-write','vocab-speak','vocab-meaning','vocab-repeat','vocab-listen','vocab-reading'];
 return Array.from({length:Math.min(count,Math.max(pool.length,7))},(_,i)=>{
  const entry=pool[(i+Math.abs(rotation))%pool.length],type=kinds[(i+Math.abs(rotation))%kinds.length];
  const t=task76(entry,type,pool,i+rotation);
  if(type==='vocab-reading'){const words=Array.from({length:Math.min(3,pool.length)},(_,j)=>pool[(i+j+Math.abs(rotation))%pool.length].en);t.readWords=words;t.readMeanings=words.map(w=>pool.find(x=>x.en===w)?.pl||'');t.answer=words.join(' ');t.audio=t.answer;}
  return t;
 });
}
export function spokenMatch76(expected,heard){
 const target=cleanEnglish76(expected),actual=cleanEnglish76(heard);
 if(!target||!actual)return false;
 if(actual===target)return true;
 const fillers=new Set(['the','a','an']);return actual.split(' ').filter(x=>!fillers.has(x)).join(' ')===target;
}
export function englishTaskSafe76(t){
 if(!t||!String(t.question||'').trim()||!String(t.answer||'').trim())return false;
 if(t.needsSource===true||/according to (?:the )?text|from (?:the )?text|in the story|z tekstu|z podręcznika/i.test(t.question))return false;
 if(!String(t.questionPl||'').trim()||/[ąćęłńóśźż]|\b(?:wybierz|zapisz|podręcznika|uloz|znajdz)\b/i.test(t.question))return false;
 if(!['spelling','order','reading'].includes(t.type)&&(' '+cleanEnglish76(t.question)+' ').includes(' '+cleanEnglish76(t.answer)+' '))return false;
 if(['listening','dictation'].includes(t.type)&&!String(t.audio||'').trim())t.audio=t.answer;
 return true;
}
