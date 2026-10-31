/* V79 Android: kanał udostępniany wyłącznie głównej stronie Akademii. */
(()=>{
 'use strict';
 if(window.top!==window||window.__academyAndroid79)return;
 window.__academyAndroid79=true;
 let port=null,serial=0,current=null,voices=[],speaking=false;
 const utterances=new Map();
 const send=message=>{if(!port)throw new Error('Połączenie z obsługą głosu nie jest gotowe.');port.postMessage(JSON.stringify(message));};
 const fire=(object,type,event={})=>{try{object?.['on'+type]?.({...event,type,target:object});}catch(e){console.error(e);}};
 class Recognition{
  constructor(){this.lang='pl-PL';this.maxAlternatives=5;this.interimResults=false;this.continuous=false;this._results=[];this._active=false;}
  start(){
   if(this._active)throw new Error('Mikrofon jest już włączony.');
   if(current)current.abort();
   this._id='r'+(++serial);this._results=[];this._active=true;current=this;
   try{send({action:'listen',id:this._id,lang:this.lang,continuous:!!this.continuous,interim:!!this.interimResults});}
   catch(e){this._active=false;current=null;throw e;}
  }
  stop(){if(this._active)send({action:'stop-listening',id:this._id});}
  abort(){if(!this._active)return;const id=this._id;this._active=false;if(current===this)current=null;try{send({action:'cancel-listening',id});}catch{}fire(this,'end');}
 }
 class Utterance{constructor(text=''){this.text=String(text);this.lang='pl-PL';this.rate=1;this.pitch=1;this.volume=1;this.voice=null;}}
 const synthesis={
  get speaking(){return speaking;},get pending(){return utterances.size>0;},get paused(){return false;},
  getVoices(){return voices.slice();},
  speak(u){const id='s'+(++serial);utterances.set(id,u);try{send({action:'speak',id,text:String(u.text||''),lang:u.lang||'pl-PL',rate:u.rate||1,pitch:u.pitch||1});}catch(e){utterances.delete(id);fire(u,'error',{error:'synthesis-unavailable'});}},
  cancel(){utterances.clear();speaking=false;try{send({action:'cancel-speech'});}catch{}},
  pause(){this.cancel();},resume(){},onvoiceschanged:null
 };
 function receive(e){
  let m;try{m=JSON.parse(e.data);}catch{return;}
  if(m.type==='voices'){voices=(m.voices||[]).map(v=>({...v,localService:true,default:false}));fire(synthesis,'voiceschanged');return;}
  if(m.type==='speech'){
   const u=utterances.get(m.id);if(!u)return;
   if(m.event==='start'){speaking=true;fire(u,'start');}
   if(m.event==='end'||m.event==='error'){utterances.delete(m.id);speaking=utterances.size>0;fire(u,m.event,{error:m.error});}
   return;
  }
  const r=current;if(!r||m.id!==r._id||!r._active)return;
  if(m.event==='start'){fire(r,'start');return;}
  if(m.event==='result'){
   const result=(m.alternatives||[]).slice(0,r.maxAlternatives).map(text=>({transcript:String(text),confidence:0}));
   result.isFinal=!!m.final;result.item=i=>result[i];
   const at=r._results.length,results=[...r._results,result];results.item=i=>results[i];
   if(m.final)r._results.push(result);
   if(m.final||r.interimResults)fire(r,'result',{resultIndex:at,results});
  }
  if(m.event==='error')fire(r,'error',{error:m.error||'network'});
  if(m.event==='end'){r._active=false;current=null;fire(r,'end');}
 }
 window.addEventListener('message',e=>{
  if(e.data!=='academy-native-79'||!e.ports?.[0]||port)return;
  if(location.origin!=='https://niedzialkowskamagdalena02-ctrl.github.io'||!location.pathname.startsWith('/akademia-superbohaterow./'))return;
  port=e.ports[0];port.onmessage=receive;port.start?.();
  window.SpeechRecognition=window.webkitSpeechRecognition=Recognition;
  window.SpeechSynthesisUtterance=Utterance;
  Object.defineProperty(window,'speechSynthesis',{configurable:true,value:synthesis});
  window.__academyNativeReady79=true;send({action:'ready'});
  document.dispatchEvent(new CustomEvent('academy:native-ready'));
 });
})();
