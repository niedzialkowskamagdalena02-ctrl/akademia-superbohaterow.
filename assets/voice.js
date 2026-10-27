export function speak(text,lang='pl-PL',style='tech',rate=1){
 if(!('speechSynthesis' in window))return false;
 const synth=window.speechSynthesis;
 synth.cancel();

 const u=new SpeechSynthesisUtterance(String(text).replace(/\*\*|__|[`#]/g,'').replace(/\[(.*?)\]\([^)]*\)/g,'$1').replace(/["“”]/g,'').replace(/\s+/g,' ').trim());
 u.lang=lang;

 if(style==='fun'){
  u.rate=Math.min(1.15,rate*1.02);
  u.pitch=1.02;
 }else{
  u.rate=Math.min(1.1,rate*0.98);
  u.pitch=0.98;
 }

 const voices=synth.getVoices().filter(v=>
  v.lang.toLowerCase().startsWith(String(lang).slice(0,2).toLowerCase())
 );

 if(voices.length){
  u.voice=style==='fun'
   ?voices[voices.length-1]
   :voices[0];
 }

 synth.speak(u);
 return true;
}
export function listen(onText,onError){const SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SR){onError('Ten telefon lub przeglądarka nie obsługuje rozpoznawania mowy.');return}if(!isSecureContext){onError('Mikrofon wymaga strony HTTPS.');return}try{const r=new SR();r.lang='pl-PL';r.onresult=e=>onText(e.results[0][0].transcript);r.onerror=e=>onError('Błąd mikrofonu: '+e.error);r.start()}catch(e){onError(e.message)}}
