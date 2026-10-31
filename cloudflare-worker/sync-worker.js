import {sync78Clean,sync78Clone,sync78Equal,sync78Merge,sync78Visible,sync78AllowedChange} from '../assets/sync-core.js';
const SYNC_ORIGIN78='https://niedzialkowskamagdalena02-ctrl.github.io';
const SYNC_CORS78={'Access-Control-Allow-Origin':SYNC_ORIGIN78,'Access-Control-Allow-Methods':'POST, GET, PUT, OPTIONS','Access-Control-Allow-Headers':'Content-Type, Authorization','Cache-Control':'private, no-store','Vary':'Origin'};
const reply78=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{...SYNC_CORS78,'Content-Type':'application/json'}});
const hex78=b=>Array.from(new Uint8Array(b),x=>x.toString(16).padStart(2,'0')).join('');
const random78=()=>hex78(crypto.getRandomValues(new Uint8Array(32)));
const hash78=async raw=>hex78(await crypto.subtle.digest('SHA-256',typeof raw==='string'?new TextEncoder().encode(raw):raw));
class SyncError78 extends Error{constructor(message,status=400,code='invalid'){super(message);this.status=status;this.code=code;}}
export async function handleFamilySync78(request,env){
 if(request.headers.get('Origin')!==SYNC_ORIGIN78)return reply78({error:'Brak dostępu.'},403);
 if(request.method==='OPTIONS')return new Response(null,{status:204,headers:SYNC_CORS78});
 if(!env.FAMILY_SYNC)return reply78({error:'Udostępnianie nie zostało jeszcze uruchomione na serwerze.',code:'not-configured'},503);
 try{return await env.FAMILY_SYNC.get(env.FAMILY_SYNC.idFromName('academy-families-v78')).fetch(request);}catch{return reply78({error:'Połączenie jest chwilowo niedostępne. Zmiany pozostają na telefonie.'},503);}
}
// SQLite-backed Durable Object: transakcyjne KV, zadne publiczne katalogi z danymi.
export class AcademyFamilySync78{
 constructor(ctx){this.ctx=ctx;this.storage=ctx.storage;}
 async jsonGet(key,store=this.storage){const meta=await store.get(key);if(!meta)return undefined;let text='';for(let i=0;i<meta.parts;i++)text+=await store.get(key+':'+i)||'';return JSON.parse(text);}
 async jsonPut(key,value,store=this.storage){const text=JSON.stringify(value),old=await store.get(key),parts=Math.ceil(text.length/32000);for(let i=0;i<parts;i++)await store.put(key+':'+i,text.slice(i*32000,(i+1)*32000));for(let i=parts;i<(old?.parts||0);i++)await store.delete(key+':'+i);await store.put(key,{parts});}
 async docs(family,store=this.storage){const index=await store.get('f:'+family+':index')||[],out={};for(const key of index){const value=await this.jsonGet('f:'+family+':doc:'+key,store);if(value!==undefined)out[key]=value;}return out;}
 async body(request){const raw=await request.arrayBuffer();if(raw.byteLength>7500000)throw new SyncError78('Za duża porcja danych.',413);try{return sync78Clean(JSON.parse(new TextDecoder().decode(raw)));}catch{throw new SyncError78('Nieprawidłowe dane.');}}
 async session(request){const token=(request.headers.get('Authorization')||'').replace(/^Bearer /,'');if(!/^[a-f0-9]{64}$/.test(token))throw new SyncError78('Wpisz ponownie kod połączenia.',401,'unauthorized');const key='token:'+await hash78(token),session=await this.storage.get(key);if(!session)throw new SyncError78('To połączenie zostało wyłączone. Poproś mamę o nowy kod.',401,'unauthorized');return {...session,tokenKey:key};}
 async rate(request,kind,max,period){const ip=await hash78(request.headers.get('CF-Connecting-IP')||'unknown'),key='rate:'+kind+':'+ip.slice(0,32),now=Date.now(),old=await this.storage.get(key),row=old&&old.until>now?old:{n:0,until:now+period};if(row.n>=max)throw new SyncError78('Za dużo prób. Spróbuj później.',429,'rate-limit');row.n++;await this.storage.put(key,row);}
 async fetch(request){
  try{return await this.ctx.blockConcurrencyWhile(()=>this.route(request));}catch(e){return reply78({error:e instanceof SyncError78?e.message:'Nie udało się zapisać zmian. Pozostają na telefonie.',code:e.code||'server-error'},e.status||503);}
 }
 async route(request){
  const url=new URL(request.url),path=url.pathname.replace(/^\/family-sync\/?/,''),method=request.method;
  if(path==='create'&&method==='POST'){
   const body=await this.body(request),token=String(body.token||'');if(!/^[a-f0-9]{64}$/.test(token))throw new SyncError78('Nieprawidłowe rozpoczęcie połączenia.');const existing=await this.storage.get('token:'+await hash78(token));if(existing){if(existing.role!=='parent')throw new SyncError78('Nieprawidłowe połączenie.',403);return reply78({...existing,token});}
   await this.rate(request,'create',3,86400000);const count=await this.storage.get('family-count')||0;if(count>=20)throw new SyncError78('Limit nowych połączeń został osiągnięty.',429);
   const family=crypto.randomUUID(),session={family,role:'parent',child:null,seq:0,lastId:'',created:Date.now()};
   await this.storage.transaction(async s=>{await s.put('token:'+await hash78(token),session);await s.put('f:'+family+':revision',0);await s.put('family-count',count+1);});return reply78({...session,token});
  }
  if(path==='join'&&method==='POST'){
   const body=await this.body(request),token=String(body.token||'');if(!/^[a-f0-9]{64}$/.test(token))throw new SyncError78('Nieprawidłowe rozpoczęcie połączenia.');const existing=await this.storage.get('token:'+await hash78(token));if(existing){if(existing.role!=='child')throw new SyncError78('Nieprawidłowe połączenie.',403);return reply78({...existing,token});}
   await this.rate(request,'join',12,600000);const code=String(body.code||'').toUpperCase().replace(/[ -]/g,'');if(!/^[A-Z2-7]{8}$/.test(code))throw new SyncError78('Kod ma 8 znaków. Sprawdź go na telefonie mamy.');
   const key='pair:'+await hash78(code),pair=await this.storage.get(key);if(!pair||pair.expires<Date.now())throw new SyncError78('Kod jest nieprawidłowy lub wygasł. Wygeneruj nowy kod u mamy.',400,'expired-code');
   const tokenKey='token:'+await hash78(token),session={family:pair.family,role:'child',child:pair.child,seq:0,lastId:'',created:Date.now()};
   await this.storage.transaction(async s=>{const old=await s.get('f:'+pair.family+':device:'+pair.child);if(old)await s.delete(old);await s.put(tokenKey,session);await s.put('f:'+pair.family+':device:'+pair.child,tokenKey);await s.delete(key);});return reply78({...session,token});
  }
  const session=await this.session(request),family=session.family,prefix='f:'+family+':';
  if(path==='pair'&&method==='POST'){
   if(session.role!=='parent')throw new SyncError78('Tę czynność wykonuje mama.',403);const body=await this.body(request);if(!['pawel','patryk'].includes(body.child))throw new SyncError78('Wybierz dziecko.');if(!(await this.storage.get(prefix+'revision')))throw new SyncError78('Najpierw poczekaj na wysłanie materiałów.');
   const alphabet='ABCDEFGHIJKLMNOPQRSTUVWXYZ234567',code=Array.from(crypto.getRandomValues(new Uint8Array(8)),x=>alphabet[x%32]).join(''),old=await this.storage.get(prefix+'pair:'+body.child),key='pair:'+await hash78(code),expires=Date.now()+600000;if(old)await this.storage.delete(old);await this.storage.put(key,{family,child:body.child,expires});await this.storage.put(prefix+'pair:'+body.child,key);return reply78({code,expires,child:body.child});
  }
  if(path==='revoke'&&method==='POST'){
   if(session.role!=='parent')throw new SyncError78('Tę czynność wykonuje mama.',403);const {child}=await this.body(request);if(!['pawel','patryk'].includes(child))throw new SyncError78('Wybierz dziecko.');const key=await this.storage.get(prefix+'device:'+child);if(key)await this.storage.delete(key);const pair=await this.storage.get(prefix+'pair:'+child);if(pair)await this.storage.delete(pair);return reply78({revoked:true});
  }
  const blob=path.match(/^blob\/([a-f0-9]{64})(?:\/(\d+|commit))?$/);
  if(blob){
   const digest=blob[1],part=blob[2],key=prefix+'blob:'+digest;
   if(method==='PUT'&&/^\d+$/.test(part||'')){
    if(await this.storage.get(key+':meta'))return reply78({stored:true});
    const n=Number(part),bytes=await request.arrayBuffer();if(n>23||!bytes.byteLength||bytes.byteLength>262144)throw new SyncError78('Za duża część zdjęcia.',413);const old=await this.storage.get(key+':part:'+n),used=await this.storage.get(prefix+'blob-bytes')||0,nextSize=used+bytes.byteLength-(old?.byteLength||0);if(nextSize>209715200)throw new SyncError78('Biblioteka osiągnęła limit 200 MB zdjęć.',413,'storage-limit');await this.storage.transaction(async s=>{await s.put(key+':part:'+n,bytes);await s.put(prefix+'blob-bytes',nextSize);});return reply78({stored:true});
   }
   if(method==='POST'&&part==='commit'){
    if(await this.storage.get(key+':meta'))return reply78({complete:true});
    const m=await this.body(request);if(!Number.isInteger(m.parts)||m.parts<1||m.parts>24||!Number.isInteger(m.size)||m.size<1||m.size>6291456||!/^image\/(jpeg|png|webp)$/.test(m.type))throw new SyncError78('Nieprawidłowe zdjęcie.');
    const chunks=[];let size=0;for(let i=0;i<m.parts;i++){const chunk=await this.storage.get(key+':part:'+i);if(!chunk)throw new SyncError78('Brakuje części zdjęcia. Wyślij ponownie.');chunks.push(new Uint8Array(chunk));size+=chunk.byteLength;}if(size!==m.size)throw new SyncError78('Niepełne zdjęcie.');const all=new Uint8Array(size);let at=0;for(const c of chunks){all.set(c,at);at+=c.length;}if(await hash78(all)!==digest)throw new SyncError78('Zdjęcie jest uszkodzone.');await this.storage.put(key+':meta',{parts:m.parts,size:m.size,type:m.type});return reply78({complete:true});
   }
   if(method==='GET'&&!part){
    const visible=sync78Visible(await this.docs(family),session);if(!Object.entries(visible).some(([k,m])=>k.startsWith('record/')&&m.hash===digest))throw new SyncError78('Brak dostępu do zdjęcia.',403);const m=await this.storage.get(key+':meta');if(!m)throw new SyncError78('Zdjęcie nie zostało jeszcze przesłane.',404);const chunks=[];for(let i=0;i<m.parts;i++)chunks.push(await this.storage.get(key+':part:'+i));return new Response(new Blob(chunks,{type:m.type}),{headers:{...SYNC_CORS78,'Content-Type':m.type}});
   }
  }
  if(path==='sync'&&method==='POST'){
   const body=await this.body(request),changes=Array.isArray(body.changes)?body.changes:[];if(changes.length>3000)throw new SyncError78('Za dużo zmian w jednej porcji.',413);
   if(changes.length&&(!Number.isInteger(body.seq)||typeof body.id!=='string'||body.id.length>100))throw new SyncError78('Nieprawidłowa kolejka zmian.');
   if(changes.length&&(body.seq<session.seq||body.seq===session.seq&&body.id!==session.lastId))return reply78({error:'Druga karta właśnie wysłała zmiany. Spróbuj ponownie.',code:'sequence-conflict',seq:session.seq},409);
   if(changes.length&&body.seq>session.seq+1)return reply78({error:'Odśwież kolejkę synchronizacji.',code:'sequence-conflict',seq:session.seq},409);
   let revision=await this.storage.get(prefix+'revision')||0;
   if(changes.length&&body.seq>session.seq){
    const current=await this.docs(family),next=sync78Clone(current),conflicts=[];
    for(const op of changes){if(!op||typeof op.key!=='string'||op.key.length>250)throw new SyncError78('Nieprawidłowa zmiana.');const value=op.remove?undefined:op.value,result=sync78Merge(op.base,value,current[op.key],op.key,conflicts);if(result===undefined)delete next[op.key];else next[op.key]=result;}
    for(const op of changes){const value=op.remove?undefined:op.value,foreign=session.role==='child'&&op.key.startsWith('mission/')&&current[op.key]?.child!==session.child;if(foreign||!sync78AllowedChange(op.key,op.base,value,session,next))throw new SyncError78('To urządzenie nie może zmieniać tych danych.',403,'permission-denied');if(op.key.startsWith('record/')&&value){const meta=await this.storage.get(prefix+'blob:'+value.hash+':meta');if(!meta||meta.size!==value.size||meta.type!==value.type)throw new SyncError78('Najpierw trzeba wysłać całe zdjęcie.');}}
    if(conflicts.length)return reply78({error:'Te same dane zmieniono jednocześnie. Wybierz wersję w panelu synchronizacji.',code:'content-conflict',conflicts:[...new Set(conflicts)].slice(0,30),revision,seq:session.seq,docs:sync78Visible(current,session)},409);
    // Wszystkie zmiany i numer paczki zatwierdzamy w jednej transakcji.
    await this.storage.transaction(async s=>{for(const op of changes){const k=prefix+'doc:'+op.key;if(next[op.key]===undefined){const meta=await s.get(k);for(let i=0;i<(meta?.parts||0);i++)await s.delete(k+':'+i);await s.delete(k);}else await this.jsonPut(k,next[op.key],s);}await s.put(prefix+'index',Object.keys(next));await s.put(prefix+'revision',++revision);await s.put(session.tokenKey,{...session,tokenKey:undefined,seq:body.seq,lastId:body.id});});session.seq=body.seq;
   }
   if(body.revision===revision)return reply78({unchanged:true,revision,seq:session.seq});
   return reply78({revision,seq:session.seq,docs:sync78Visible(await this.docs(family),session)});
  }
  throw new SyncError78('Nie znaleziono tej funkcji.',404);
 }
}
