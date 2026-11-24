import {grammarArt139} from './training139/grammar-art.js?v=140';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const cosmicKinds136=['letters','trace','rhymes','order','syllables','grammar','read','bank'];
export const cosmicTitles136={letters:'Poznaj literki',trace:'Pisanie po śladzie',rhymes:'Rymowanki i literki',order:'Literki w kolejności',syllables:'Sylaby i głoski',grammar:'Części mowy',read:'Czytanie ze zrozumieniem',bank:'Quiz · Polski'};
const themes={letters:'Dopasuj literę i pomóż rakiecie dotrzeć do skrzyni.',trace:'Poprowadź znak od świecącej kropki.',rhymes:'Odgadnij hasło i wybierz jego pierwszą literę.',order:'Ułóż literki w kolejności polskiego alfabetu.',syllables:'Laboratorium dźwięku',grammar:'Sortownia słów',read:'Depesze z orbity',bank:'Radar językowy'};
const art=(name,cls='')=>`<img src="assets/space132/${name}.png" class="${cls}" alt="" draggable="false" decoding="async">`;
const button=(text,action,attr='data-mg',cls='')=>`<button type="button" ${attr}="${action}" class="${cls}">${text}</button>`;
export function cosmicFrame136({kind,index=0,total=0,progress=0,body='',feedback='',help='',paused=false,attr='data-mg',intro=false,count='',footer='',trace=false}){
 const percent=total?Math.max(0,Math.min(100,progress/total*100)):0;
 return `<section class="space132 space136 ${index>=total&&!intro?'is-complete':''}" data-cosmic136="${kind}"><header class="space132-header">${button('‹ Wszystkie gry',attr==='data-mg'?'back':'catalog',attr)}<h2>${esc(cosmicTitles136[kind])}</h2>${art('astronauta','space132-astronaut')}</header><p class="space132-count" data-c136-count>${esc(count|| (intro?'Gotowi do startu?':index>=total?'Misja zakończona':`Wyzwanie ${index+1} z ${total}`))}</p><div class="space132-track" role="progressbar" aria-label="Postęp" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${progress}" style="--space-progress:${percent}%" data-c136-track><span class="space132-fill"></span><span class="space132-star" style="left:50%">${art('gwiazda')}</span>${art('rakieta_przezroczysta','space132-ship')}${art('skrzynia','space132-chest')}</div><div class="space136-bar">${intro||trace||index>=total?'':button(paused?'▶ Wznów':'Ⅱ Pauza',paused?'resume':'pause',attr)}${footer}</div><div class="space132-guide">${art('robot','space132-robot')}${art('fala_dzwiekowa','space132-wave')}<p>${esc(paused?'Misja zatrzymana. Wrócisz do tego samego zadania.':themes[kind])}</p></div><section class="space132-answer space136-play" ${paused?'inert':''}>${body}</section>${feedback}${help}</section>`;
}
export function grammarInfo136(question){
 if(/rzeczownik/i.test(question))return {label:'Rzeczownik',ask:'kto? co?',key:'noun'};
 if(/czasownik/i.test(question))return {label:'Czasownik',ask:'co robi?',key:'verb'};
 if(/przymiotnik/i.test(question))return {label:'Przymiotnik',ask:'jaki? jaka? jakie?',key:'adjective'};
 return null;
}
export function evidence136(text,answer){
 const at=String(text).toLocaleLowerCase('pl-PL').indexOf(String(answer).replace(/^bo /i,'').toLocaleLowerCase('pl-PL'));
 return at<0?null:{start:at,end:at+String(answer).replace(/^bo /i,'').length};
}
function grammarPlatform139(t,answered,category){
 const word=String(t.answer).toLocaleLowerCase('pl');let key='',motion='';
 if(/plecak/.test(word))key='plecak';else if(/jabłk/.test(word))key='jablko';else if(/żab/.test(word))key='zaba';else if(/robot/.test(word))key='robot';else if(/rakiet/.test(word))key='rakieta';else if(/pies/.test(word))key='pies';
 if(category?.key==='verb'){if(/bieg/.test(word)){key='pies';motion='runs';}else if(/startuje/.test(word)){key='rakieta';motion='launches';}}
 if(category?.key==='adjective'){if(word==='zielony'||word==='zielona')key='zaba';else if(word==='niebieski')key='robot';}
 return `<div class="space136-platform ${answered?'is-reward':''} ${motion}" aria-label="Platforma nagrody">${answered?(key&&grammarArt139[key]?`<img src="${grammarArt139[key]}" alt="">`:'<span aria-hidden="true">✦</span>'):''}</div>`;
}
export function taskMarkup136({kind,task:t,index,total,points,answered,wrongAttempts,help='',paused=false}){
 let body='',effect='';
 const metadata=t.space136||{},reading=metadata.reading,parts=metadata.parts;
 if(reading){
  const hit=answered&&reading.evidence;
  body+=`<blockquote class="space136-passage">${hit?esc(reading.text.slice(0,hit.start))+'<mark>'+esc(reading.text.slice(hit.start,hit.end))+'</mark>'+esc(reading.text.slice(hit.end)):esc(reading.text)}</blockquote>`;
 }
 body+=`<h3>${esc(reading?.question||t.question)}</h3>${button('🔊 Odczytaj polecenie','audio')}`;
 if(kind==='grammar')body+=grammarPlatform139(t,answered,metadata.grammar)+`<div class="space136-chambers">${[['noun','Rzeczownik','kto? co?'],['verb','Czasownik','co robi?'],['adjective','Przymiotnik','jaki? jaka? jakie?']].map(([key,label,ask])=>`<div class="space136-chamber ${answered&&metadata.grammar?.key===key?'is-filled':''}" data-category="${key}"><strong>${label}</strong><small>${ask}</small>${answered&&metadata.grammar?.key===key?`<span>${esc(t.answer)}</span>`:''}</div>`).join('')}</div>`;
 if(kind==='bank')body+=`${metadata.topic?`<small>${esc(metadata.topic)}</small>`:''}<div class="space136-radar" aria-label="Poprawne: ${points} z ${total}">${Array.from({length:total},(_,i)=>`<i class="${i<points?'lit':''}" aria-hidden="true"></i>`).join('')}</div>`;
 body+=`<div class="space136-choices">${(t.options||[]).map((option,i)=>`<button type="button" data-mg="pick:${i}" ${answered?'disabled':''} class="${answered&&String(option)===String(t.answer)?'is-correct':''}">${esc(option)}</button>`).join('')}</div>`;
 if(answered&&kind==='syllables'&&Array.isArray(parts))effect=`<div class="space136-sound-tiles" aria-label="Podział wyrazu">${parts.map(p=>`<span>${esc(p)}</span>`).join('')}</div>`;
 const feedback=paused?'':answered?`<div class="space136-feedback is-good" role="status">${esc(t.explanation||'Dobra odpowiedź!')}${effect}</div>${button(index===total-1?'Zakończ misję':'Dalej →','next','data-mg','space132-gold')}`:wrongAttempts?'<p class="space136-feedback is-retry" role="status">Spróbuj jeszcze raz.</p>':'';
 const tools=paused?'':`<div class="space132-tools">${answered?'':button('Pomiń bez zaliczenia','skip')}<div class="space132-help-row">${button('Zapytaj nauczyciela AI','space132-help')}${button(art('mikrofon'),'tutor-mic','data-mg','space132-mic')}</div></div>${help}`;
 return cosmicFrame136({kind,index,total,progress:index+(answered?1:0),body:paused?'<p>Twój postęp jest zachowany.</p>':body,feedback,help:tools,paused,footer:`<span>Poprawne: ${points}</span>`});
}
export function taskResult136({kind,points,total,skipped,coins}){
 return cosmicFrame136({kind,index:total,total,progress:total,body:`<div class="space132-result">${art('skrzynia')}<h3>Misja ukończona!</h3><p>Poprawne: ${points} z ${total}.</p><p>Pominięte bez zaliczenia: ${skipped}.</p><p>Zdobyte złote: ${coins}.</p>${button('Zagraj ponownie','start','data-mg','space132-gold')}${button('Wszystkie gry','back')}</div>`});
}
export const roundSpeech136=(kind,t)=>kind==='rhymes'?`${t.rhyme} Jaka jest pierwsza litera odgadniętego słowa?`:t.speech;

// Uses the application's existing AI and microphone callbacks. Updates only
// the help area, so a reply cannot erase a drawn stroke or selected letter.
export function cosmicHelp136(root,{signal,ask,speak,mic,context}){
 let messages=[],busy=false,request=null,generation=0;
 const content=()=>`<details class="mg-tutor" ${messages.length||busy?'open':''}><summary>Pomoc nauczyciela</summary><div data-c136-messages aria-live="polite">${messages.map(m=>`<p><strong>${m.role==='user'?'Ty':'Nauczyciel'}:</strong> ${esc(m.text)}</p>`).join('')}${busy?'<p>Nauczyciel przygotowuje pomoc…</p>':''}</div>${context()?.v82AwaitingReveal?'<button type="button" data-lg92="c136-consent-yes">Tak, pokaż odpowiedź · bez pieniędzy</button><button type="button" data-lg92="c136-consent-no">Nie, spróbuję sam</button>':''}<textarea data-c136-question rows="2" aria-label="Pytanie do nauczyciela" placeholder="Wpisz pytanie…"></textarea><button type="button" data-lg92="c136-send" ${busy?'disabled':''}>Wyślij pytanie</button></details>`;
 const update=()=>{const area=root.querySelector('[data-c136-tutor]');if(area)area.innerHTML=content();};
 async function send(question){
  if(busy||!question?.trim()||!ask)return;
  const task=context(),ticket=generation;request=new AbortController();busy=true;messages.push({role:'user',text:question.trim()});update();
  try{const text=await ask(question.trim(),task,request.signal,()=>context()===task);if(signal.aborted||context()!==task||!root.isConnected)return;messages.push({role:'assistant',text});}
  catch(error){if(!signal.aborted&&context()===task&&error.name!=='AbortError')messages.push({role:'assistant',text:'Nie udało się połączyć z nauczycielem. Spróbuj ponownie.'});}
  finally{if(ticket===generation){busy=false;if(!signal.aborted)update();}}
 }
 root.ownerDocument.addEventListener('academy:tutor-question',event=>{if(root.isConnected&&root.querySelector('[data-c136-tutor]'))void send(event.detail?.question);},{signal});
 signal.addEventListener('abort',()=>request?.abort(),{once:true});
 return {
  markup:()=>`<div class="space132-tools"><div class="space132-help-row">${button('Zapytaj nauczyciela AI','c136-help','data-lg92')}${button(art('mikrofon'),'c136-mic','data-lg92','space132-mic')}</div></div><aside data-c136-tutor>${content()}</aside>`,
  action(action){
   if(action==='c136-help'){const area=root.querySelector('.mg-tutor');if(area)area.open=!area.open;return true;}
   if(action==='c136-mic'){mic?.();return true;}
   if(action==='c136-consent-yes'||action==='c136-consent-no'){void send(action.endsWith('yes')?'Tak':'Nie');return true;}
   if(action==='c136-send'){void send(root.querySelector('[data-c136-question]')?.value);return true;}
   return false;
  },reset(){generation++;request?.abort();busy=false;messages=[];update();}
 };
}
