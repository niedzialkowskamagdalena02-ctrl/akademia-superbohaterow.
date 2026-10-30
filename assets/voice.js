// V76: stan mikrofonu pochodzi ze zdarzen rozpoznawania i syntezy mowy.
let voiceState='idle',sequenceEpoch=0,recognizer=null;
export function getVoiceState(){return voiceState}
export function setVoiceState(state){
 voiceState=state;
 if(typeof document!=='undefined')document.dispatchEvent(new CustomEvent('academy:voice-state',{detail:{state}}));
}
export function stopSpeech(){
 sequenceEpoch++;
 try{window.speechSynthesis?.cancel()}catch{}
 setVoiceState('idle');
}
export function stopVoice(){
 if(recognizer){const old=recognizer;recognizer=null;old.__cancelled=true;try{old.abort()}catch{}}
 stopSpeech();
 if(typeof document!=='undefined')document.dispatchEvent(new CustomEvent('academy:voice-stop'));
}
function utterance(text,lang,style,rate){
 const u=new SpeechSynthesisUtterance(String(text).replace(/\*\*|__|[`#]/g,'').replace(/\[(.*?)\]\([^)]*\)/g,'$1').replace(/["“”]/g,'').replace(/\s+/g,' ').trim());
 u.lang=lang;u.rate=Math.max(.55,Math.min(1.1,Number(rate)||.92));u.pitch=style==='fun'?1.02:.98;
 const voices=window.speechSynthesis.getVoices().filter(v=>v.lang.toLowerCase().startsWith(String(lang).slice(0,2).toLowerCase()));
 if(voices.length)u.voice=style==='fun'?voices[voices.length-1]:voices[0];
 return u;
}
export function speakSequence(parts,options={}){
 if(!('speechSynthesis' in window))return false;
 if(voiceState==='listening'||voiceState==='starting')stopVoice();else stopSpeech();const epoch=sequenceEpoch;
 const items=parts.filter(p=>p&&String(p.text||'').trim());
 if(!items.length)return false;
 setVoiceState('thinking');
 const play=i=>{
  if(epoch!==sequenceEpoch)return;
  if(options.isCurrent&&!options.isCurrent()){setVoiceState('idle');return}
  if(i>=items.length){setVoiceState('idle');options.onDone?.();return}
  const p=items[i],u=utterance(p.text,p.lang||'pl-PL',p.style||options.style||'tech',p.rate||.92);
  u.onstart=()=>{if(epoch===sequenceEpoch)setVoiceState('speaking')};
  u.onend=()=>{if(epoch===sequenceEpoch)play(i+1)};
  u.onerror=()=>{if(epoch===sequenceEpoch){sequenceEpoch++;setVoiceState('idle');options.onError?.('Nie udało się odczytać tekstu. Sprawdź głosy w telefonie.')}};
  try{window.speechSynthesis.speak(u)}catch{setVoiceState('idle');options.onError?.('Odczyt głosowy jest niedostępny.')}
 };
 play(0);return true;
}
export function speak(text,lang='pl-PL',style='tech',rate=1){
 return speakSequence([{text,lang,style,rate:style==='fun'?Math.min(1.15,rate*1.02):Math.min(1.1,rate*.98)}]);
}
export function listen(onText,onError,options={}){
 const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
 if(!SR){onError?.('Ten telefon lub przeglądarka nie obsługuje rozpoznawania mowy.');return null}
 if(typeof isSecureContext!=='undefined'&&!isSecureContext){onError?.('Mikrofon wymaga strony HTTPS.');return null}
 stopVoice();setVoiceState('starting');
 let gotText=false,failed=false;
 try{
  const r=new SR();recognizer=r;r.lang=options.lang||'pl-PL';r.maxAlternatives=3;
  r.onstart=()=>{if(recognizer===r&&!r.__cancelled){setVoiceState('listening');options.onStart?.()}};
  r.onresult=e=>{
   if(r.__cancelled||gotText)return;
   const text=e.results?.[0]?.[0]?.transcript||'';gotText=!!text.trim();
   if(recognizer===r)recognizer=null;
   if(!gotText)return;
   setVoiceState('thinking');try{onText(text)}catch{setVoiceState('idle');onError?.('Nie udało się obsłużyć wypowiedzi. Spróbuj ponownie.')}
  };
  r.onerror=e=>{if(r.__cancelled)return;failed=true;if(recognizer===r)recognizer=null;setVoiceState('idle');onError?.(/not-allowed|service-not-allowed/.test(e.error)?'Zezwól na dostęp do mikrofonu.':'Nie udało się rozpoznać wypowiedzi. Spróbuj ponownie.')};
  r.onend=()=>{if(recognizer===r)recognizer=null;if(!gotText&&!failed&&!r.__cancelled){setVoiceState('idle');onError?.('Nie usłyszałem wypowiedzi. Spróbuj ponownie.')}options.onEnd?.()};
  r.start();return r;
 }catch(e){recognizer=null;setVoiceState('idle');onError?.(e.message||'Nie udało się uruchomić mikrofonu.');return null}
}
