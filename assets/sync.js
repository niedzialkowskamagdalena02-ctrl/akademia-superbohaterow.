import {sync78Clone,sync78Equal,sync78Merge,sync78Flatten,sync78Inflate,sync78Visible,sync78Changes,sync78StorageKey,sync78AllowedChange} from './sync-core.js?v=78';
const SYNC78_ENDPOINT='https://akademia-ai.niedzialkowskamagdalena02.workers.dev/family-sync/';
const SYNC78_DEVICE='academy-sync-device-78';
export function createSync78(options={}){
 const storage=options.storage||globalThis.localStorage,send=options.fetch||((...args)=>fetch(...args)),clock=options.now||(()=>Date.now());
 let host=null,device=null,baseline={},revision=-1,seq=0,outbox=null,photoMeta={},busy=false,applying=false,timer=null,interval=null,stopped=false,conflict=null,message='Połączenie telefonów nie jest jeszcze włączone.',again=false;
 const dirtyPhotos=new Set(),listeners=new Set(),uploaded=new Set();
 const emit=text=>{message=text;for(const fn of listeners)fn({message,connected:!!device,busy,conflict:!!conflict});};
 const localGet=key=>{try{return JSON.parse(storage.getItem(key)||'null');}catch{return null;}};
 const newToken=()=>Array.from(crypto.getRandomValues(new Uint8Array(32)),x=>x.toString(16).padStart(2,'0')).join('');
 function persistDevice(){storage.setItem(SYNC78_DEVICE,JSON.stringify(device));}
 async function request(path,body,method='POST',binary=false){
  const abort=new AbortController(),timeout=setTimeout(()=>abort.abort(),25000);
  try{const response=await send(SYNC78_ENDPOINT+path,{method,headers:{...(device?{Authorization:'Bearer '+device.token}:{}),...(!binary&&method!=='GET'?{'Content-Type':'application/json'}:{})},...(method==='GET'?{}:{body:binary?body:JSON.stringify(body||{})}),signal:abort.signal,cache:'no-store'});
   if(binary&&method==='GET'&&response.ok)return await response.blob();const result=await response.json();if(!response.ok){const error=Error(result.error||'Nie udało się połączyć telefonów.');error.code=result.code;error.data=result;throw error;}return result;
  }finally{clearTimeout(timeout);}
 }
 const hash=async blob=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',await blob.arrayBuffer())),x=>x.toString(16).padStart(2,'0')).join('');
 async function capture(){
  const state=sync78Clone(host.getState()),stores={},records={},blobs=new Map(),ids=new Set();
  for(let i=0;i<storage.length;i++){const key=storage.key(i);if(sync78StorageKey(key)){try{stores[key]=JSON.parse(storage.getItem(key));}catch{}}}
  for(const b of state.books||[])if(b.coverId)ids.add(b.coverId);for(const p of state.bookPages||[])if(p.imageId)ids.add(p.imageId);for(const m of state.missions||[])if(m.photoId)ids.add(m.photoId);
  for(const id of ids){const key='image:'+id,blob=await host.read(key);if(!(blob instanceof Blob))continue;let meta=photoMeta[key];if(!meta||dirtyPhotos.has(key)||meta.size!==blob.size||meta.type!==blob.type){meta={hash:await hash(blob),type:blob.type,size:blob.size};photoMeta[key]=meta;dirtyPhotos.delete(key);}records[key]=meta;blobs.set(meta.hash,blob);}
  let docs=sync78Flatten(state,stores,records);if(device?.role==='child')docs=sync78Visible(docs,device);return {docs,blobs};
 }
 async function uploadPhotos(snapshot){
  const pending=(outbox?.changes||[]).filter(x=>x.key.startsWith('record/')&&!x.remove).map(x=>x.value),required=[...new Map([...Object.entries(snapshot.docs).filter(([k])=>k.startsWith('record/')).map(([,m])=>m),...pending].map(m=>[m.hash,m])).values()];let done=0;
  for(const meta of required){if(uploaded.has(meta.hash)||Object.entries(baseline).some(([k,m])=>k.startsWith('record/')&&sync78Equal(m,meta))){done++;continue;}const blob=snapshot.blobs.get(meta.hash)||await host.read('sync78:outgoing:'+meta.hash);if(!blob)throw Error('Brakuje zdjęcia do wysłania.');emit('Wysyłam zdjęcia: '+(++done)+'/'+required.length+'…');const parts=Math.ceil(blob.size/262144);
   for(let i=0;i<parts;i++)await request('blob/'+meta.hash+'/'+i,await blob.slice(i*262144,(i+1)*262144).arrayBuffer(),'PUT',true);
   await request('blob/'+meta.hash+'/commit',{...meta,parts});uploaded.add(meta.hash);
  }
 }
 async function persist(){await host.write('sync78:meta',{family:device.family,baseline,revision,seq,photoMeta,outbox});}
 async function applyRemote(remote,atRequest,preferLocal=true){
  const downloaded=new Map();
  // Najpierw sprawdz zdjecia; nie oznaczaj polowy biblioteki jako gotowej.
  let done=0;const images=Object.entries(remote).filter(([key])=>key.startsWith('record/'));
  for(const [docKey,meta] of images){const key=docKey.slice(7);if(photoMeta[key]?.hash===meta.hash&&await host.read(key)){done++;continue;}emit('Pobieram zdjęcia: '+(++done)+'/'+images.length+'…');const blob=await request('blob/'+meta.hash,null,'GET',true);if(blob.size!==meta.size||await hash(blob)!==meta.hash)throw Error('Niepełne zdjęcie. Ponowię pobieranie.');downloaded.set(key,{meta,blob});}
  // Podczas pobierania mozna dalej pracowac. Scal rowniez te pozniejsze zmiany.
  const latest=await capture(),merged={},collisions=[];
  for(const key of new Set([...Object.keys(atRequest),...Object.keys(latest.docs),...Object.keys(remote)])){
   const problems=[],value=sync78Merge(atRequest[key],latest.docs[key],remote[key],key,problems,preferLocal);
   if(problems.length)collisions.push(...problems);if(value!==undefined)merged[key]=value;
  }
  const bundle=sync78Inflate(merged,host.defaults());
  applying=true;try{
   for(const [key,{meta,blob}] of downloaded)if(bundle.records[key]?.hash===meta.hash){await host.write(key,blob);photoMeta[key]=meta;}
   for(let i=storage.length-1;i>=0;i--){const key=storage.key(i);if(sync78StorageKey(key)&&!(key in bundle.stores))storage.removeItem(key);}
   for(const [key,value] of Object.entries(bundle.stores))storage.setItem(key,JSON.stringify(value));
   await host.applyState(bundle.state);await host.write('state',bundle.state);
  }finally{applying=false;}
  baseline=sync78Clone(remote);if(collisions.length&&preferLocal){conflict={remote,local:latest.docs,paths:collisions,base:atRequest};emit('Te same dane zmieniono na obu telefonach. Wybierz wersję.');}
 }
 async function cycle(){
  if(!device||!host||stopped||conflict)return false;if(busy){again=true;return false;}busy=true;
  try{
   emit('Synchronizuję…');const snapshot=await capture();
   if(device.role==='child'&&revision<0){const result=await request('sync',{revision:-1,changes:[]});await applyRemote(result.docs,snapshot.docs);revision=result.revision;seq=result.seq;await persist();emit('Połączono z mamą. Materiały są gotowe.');return true;}
   if(!outbox){let changes=sync78Changes(baseline,snapshot.docs);if(device.role==='child')changes=changes.filter(op=>sync78AllowedChange(op.key,op.base,op.remove?undefined:op.value,device,snapshot.docs));if(changes.length){outbox={id:crypto.randomUUID(),seq:seq+1,changes,revision,blobs:[]};for(const op of changes)if(op.key.startsWith('record/')&&!op.remove&&snapshot.blobs.has(op.value.hash)){await host.write('sync78:outgoing:'+op.value.hash,snapshot.blobs.get(op.value.hash));outbox.blobs.push(op.value.hash);}}await persist();}
   await uploadPhotos(snapshot);const payload=outbox||{revision,changes:[]},atRequest=sync78Clone(baseline);for(const op of outbox?.changes||[]){if(op.remove)delete atRequest[op.key];else atRequest[op.key]=sync78Clone(op.value);}const result=await request('sync',payload);
   seq=result.seq;if(!result.unchanged){await applyRemote(result.docs,atRequest);revision=result.revision;}const sent=outbox;outbox=null;await persist();for(const hash of sent?.blobs||[])await host.remove?.('sync78:outgoing:'+hash);if(!conflict)emit('Połączono · ostatnia synchronizacja '+new Date(clock()).toLocaleTimeString('pl-PL',{hour:'2-digit',minute:'2-digit'}));return true;
  }catch(error){
   if(error.code==='content-conflict'){const base=sync78Clone(baseline);await applyRemote(error.data.docs,base);conflict??={remote:error.data.docs,local:(await capture()).docs,paths:error.data.conflicts,base};revision=error.data.revision;outbox=null;emit(error.message);}
   else if(error.code==='sequence-conflict'){seq=error.data.seq;outbox=null;again=true;emit('Łączę zmiany z drugiej karty…');}
   else emit((error.code==='unauthorized'?error.message:'Oczekuje na połączenie. '+error.message)+' Zmiany pozostają na telefonie.');
   await persist().catch(()=>{});return false;
  }finally{busy=false;if(again){again=false;schedule();}}
 }
 function schedule(){if(!device||applying||stopped||conflict)return;clearTimeout(timer);timer=setTimeout(()=>{timer=null;cycle();},500);}
 async function init(config){host=config;device=localGet(SYNC78_DEVICE);if(device&&!['parent','child'].includes(device.role))device=null;
  if(device){const saved=await host.read('sync78:meta');if(saved?.family===device.family){baseline=saved.baseline||{};revision=saved.revision??-1;seq=saved.seq||0;outbox=saved.outbox||null;photoMeta=saved.photoMeta||{};}schedule();}
  if(options.listen!==false){
   globalThis.addEventListener?.('online',schedule);globalThis.addEventListener?.('focus',schedule);globalThis.document?.addEventListener('visibilitychange',()=>{if(!document.hidden)schedule();});
   globalThis.document?.addEventListener('academy:record-change',ev=>{if(applying||String(ev.detail?.key).startsWith('sync78:'))return;if(String(ev.detail?.key).startsWith('image:'))dirtyPhotos.add(ev.detail.key);schedule();});
   if(typeof Storage!=='undefined'&&!Storage.prototype.__academySync78){const oldSet=Storage.prototype.setItem,oldRemove=Storage.prototype.removeItem;Storage.prototype.setItem=function(k,v){const result=oldSet.call(this,k,v);if(sync78StorageKey(k))globalThis.dispatchEvent(new Event('academy:storage-change'));return result;};Storage.prototype.removeItem=function(k){const result=oldRemove.call(this,k);if(sync78StorageKey(k))globalThis.dispatchEvent(new Event('academy:storage-change'));return result;};Object.defineProperty(Storage.prototype,'__academySync78',{value:true});}
   globalThis.addEventListener?.('academy:storage-change',schedule);interval=setInterval(()=>{if(!globalThis.document?.hidden)schedule();},30000);
  }return device;
 }
 async function connectParent(){if(device)throw Error('Ten telefon jest już połączony.');const key='academy-sync-parent-pending-78',pending=localGet(key)||{token:newToken()};storage.setItem(key,JSON.stringify(pending));device=await request('create',pending);persistDevice();storage.removeItem(key);baseline={};revision=-1;seq=device.seq||0;outbox=null;await persist();return await cycle();}
 async function join(code){if(device)throw Error('Ten telefon jest już połączony.');const key='academy-sync-child-pending-78',previous=localGet(key),pending=previous?.code===code?previous:{code,token:newToken()};storage.setItem(key,JSON.stringify(pending));const session=await request('join',pending);device=session;persistDevice();storage.removeItem(key);baseline={};revision=-1;seq=device.seq||0;outbox=null;await persist();if(!await cycle())throw Error(message);schedule();return device;}
 async function pair(child){if(device?.role!=='parent')throw Error('Kod tworzy mama.');if(!await cycle())throw Error('Najpierw poczekaj na zakończenie synchronizacji.');return request('pair',{child});}
 async function resolve(which){if(!conflict)return;const c=conflict;conflict=null;outbox=null;baseline=sync78Clone(c.remote);if(which==='remote')await applyRemote(c.remote,c.base||{},false);await persist();schedule();}
 return {init,connectParent,join,pair,resolve,cycle,revoke:child=>request('revoke',{child}),onLocalChange:async()=>{schedule();return {queued:!!device};},changed:schedule,device:()=>device,status:()=>message,onStatus:fn=>{listeners.add(fn);return ()=>listeners.delete(fn);},stop:()=>{stopped=true;clearTimeout(timer);clearInterval(interval);},debug:()=>({baseline,revision,seq,outbox,conflict})};
}
export const syncAdapter=createSync78();
