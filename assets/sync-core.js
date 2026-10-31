// Wspolny model synchronizacji. Uprawnienia sprawdzane ponownie po stronie serwera.
export const SYNC78_CHILDREN=['pawel','patryk'];
export const sync78Clone=x=>x===undefined?undefined:JSON.parse(JSON.stringify(x));
export function sync78Equal(a,b){if(a===b)return true;if(!a||!b||typeof a!=='object'||typeof b!=='object'||Array.isArray(a)!==Array.isArray(b))return false;const keys=Object.keys(a);return keys.length===Object.keys(b).length&&keys.every(k=>Object.prototype.hasOwnProperty.call(b,k)&&sync78Equal(a[k],b[k]));}
const sync78Object=x=>!!x&&typeof x==='object'&&!Array.isArray(x);
const sync78SafeKey=k=>typeof k==='string'&&k.length<=8192&&!['__proto__','prototype','constructor'].includes(k);
export function sync78Clean(x,depth=0){
 if(depth>45)throw Error('Zbyt złożone dane.');
 if(Array.isArray(x))return x.map(v=>sync78Clean(v,depth+1));
 if(sync78Object(x)){const out={};for(const [k,v] of Object.entries(x)){if(!sync78SafeKey(k))throw Error('Niedozwolony klucz.');out[k]=sync78Clean(v,depth+1);}return out;}
 return x;
}
export function sync78Merge(base,local,remote,path='',conflicts=[],preferLocal=false){
 if(sync78Equal(local,base))return sync78Clone(remote);
 if(sync78Equal(remote,base)||sync78Equal(local,remote))return sync78Clone(local);
 if([base,local,remote].every(x=>typeof x==='number')&&/\/(coins|xp|seen|wrong)$/.test(path))return Math.max(0,remote+(local-base));
 if([local,remote].every(sync78Object)&&(!base||sync78Object(base))){
  const out={};for(const k of new Set([...Object.keys(base||{}),...Object.keys(local),...Object.keys(remote)])){
   if(!sync78SafeKey(k))throw Error('Niedozwolony klucz.');const v=sync78Merge(base?.[k],local[k],remote[k],path+'/'+k,conflicts,preferLocal);if(v!==undefined)out[k]=v;
  }return out;
 }
 if(Array.isArray(local)&&Array.isArray(remote)&&(!base||Array.isArray(base))){
  const b=base||[],identity=x=>sync78Object(x)?String(x.id||x.key||JSON.stringify(x)):JSON.stringify(x),bm=new Map(b.map(x=>[identity(x),x])),lm=new Map(local.map(x=>[identity(x),x])),rm=new Map(remote.map(x=>[identity(x),x])),out=[];
  for(const key of new Set([...rm.keys(),...lm.keys(),...bm.keys()])){const v=sync78Merge(bm.get(key),lm.get(key),rm.get(key),path+'/'+key,conflicts,preferLocal);if(v!==undefined)out.push(v);}return out;
 }
 conflicts.push(path);return sync78Clone(preferLocal?local:remote);
}
export function sync78StorageKey(key){return /^academy-v(?:41-|48-bank-|75-outside-|53-stats-|76-question-stats-|76-word-stats-)/.test(key);}
export function sync78Flatten(state,stores={},records={}){
 const docs={'meta':Object.fromEntries(Object.entries(state).filter(([k])=>!['profiles','books','bookPages','missions','history'].includes(k)))};
 for(const [id,value] of Object.entries(state.profiles||{}))docs['profile/'+id]=sync78Clone(value);
 for(const [field,kind] of [['books','book'],['bookPages','page'],['missions','mission'],['history','history']])for(const row of state[field]||[])if(row?.id&&sync78SafeKey(row.id))docs[kind+'/'+row.id]=sync78Clone(row);
 for(const [key,value] of Object.entries(stores))if(sync78StorageKey(key))docs['ls/'+key]=sync78Clone(value);
 for(const [key,value] of Object.entries(records))if(/^image:[\w%-]{1,150}$/.test(key))docs['record/'+key]=sync78Clone(value);
 return docs;
}
export function sync78Inflate(docs,defaults={}){
 const state={...sync78Clone(defaults),...sync78Clone(docs.meta||{}),profiles:{...sync78Clone(defaults.profiles||{})},books:[],bookPages:[],missions:[],history:[]},stores={},records={};
 for(const [key,value] of Object.entries(docs)){
  const at=key.indexOf('/'),kind=key.slice(0,at),id=key.slice(at+1);if(kind==='profile')state.profiles[id]=sync78Clone(value);
  else if(kind==='ls')stores[id]=sync78Clone(value);else if(kind==='record')records[id]=sync78Clone(value);
  else if(['book','page','mission','history'].includes(kind))state[{book:'books',page:'bookPages',mission:'missions',history:'history'}[kind]].push(sync78Clone(value));
 }
 state.history.sort((a,b)=>String(b.at||'').localeCompare(String(a.at||'')));return {state,stores,records};
}
export function sync78Visible(docs,session){
 if(session.role==='parent')return sync78Clone(docs);
 const child=session.child,allowedBooks=new Set(),images=new Set(),out={};
 for(const [key,b] of Object.entries(docs))if(key.startsWith('book/')){
  const audience=Array.isArray(b.audience)?b.audience:[...new Set([b.child,...(b.sharedWith||[])])];
  if(!b.archived&&audience.includes(child)){allowedBooks.add(b.id);out[key]=sync78Clone(b);if(b.coverId)images.add(b.coverId);}
 }
 for(const [key,value] of Object.entries(docs)){
  if(key==='meta'){out.meta={version:value.version||1,parentPin:'',settings:sync78Clone(value.settings||{})};continue;}
  if(key==='profile/'+child){out[key]={...sync78Clone(value),pin:''};continue;}
  if(key.startsWith('page/')&&allowedBooks.has(value.bookId)){out[key]=sync78Clone(value);if(value.imageId)images.add(value.imageId);}
  if((key.startsWith('mission/')||key.startsWith('history/'))&&value.child===child){out[key]=sync78Clone(value);if(value.photoId)images.add(value.photoId);}
  if(key.startsWith('ls/')){
   const k=key.slice(3),bank=[...allowedBooks].some(id=>k==='academy-v48-bank-'+docs['book/'+id].child+'-'+id),own=sync78OwnStorage(k,child);
   if(bank||own)out[key]=sync78Clone(value);
  }
 }
 for(const id of images){const key='record/image:'+id;if(docs[key])out[key]=sync78Clone(docs[key]);}
 return out;
}
export function sync78OwnStorage(key,child){return ['academy-v41-','academy-v75-outside-','academy-v53-stats-','academy-v76-question-stats-','academy-v76-word-stats-'].some(prefix=>key.startsWith(prefix+child+'-'));}
export function sync78AllowedChange(key,base,value,session,nextDocs){
 if(!sync78SafeKey(key)||key.length>250)return false;
 if(session.role==='parent')return /^(meta$|(?:profile|book|page|mission|history|ls|record)\/)/.test(key)&&(!key.startsWith('ls/')||sync78StorageKey(key.slice(3)));
 const child=session.child;
 if(key==='profile/'+child&&base&&value){const allowed=new Set(['coins','xp','base','unlocks','mentor','arcadeUnlocked']);return Object.keys({...base,...value}).every(k=>allowed.has(k)||sync78Equal(base[k],value[k]))&&[value.coins,value.xp].every(n=>Number.isFinite(n)&&n>=0&&n<=1e9);}
 if(key.startsWith('mission/')&&base?.child===child&&value?.child===child){const allowed=new Set(['status','photoId','submittedAt','submitted','sentAt','studentComment']);return ['todo','redo','sent'].includes(value.status)&&Object.keys({...base,...value}).every(k=>allowed.has(k)||sync78Equal(base[k],value[k]));}
 if(key.startsWith('history/')&&value?.child===child&&!base)return typeof value.id==='string'&&typeof value.key==='string'&&Number.isFinite(value.points)&&value.points>=0&&value.points<=10000;
 if(key.startsWith('ls/'))return sync78OwnStorage(key.slice(3),child)&&!key.startsWith('ls/academy-v75-outside-');
 if(key.startsWith('record/image:')&&value){const id=key.slice('record/image:'.length);return Object.entries(nextDocs).some(([k,m])=>k.startsWith('mission/')&&m.child===child&&m.photoId===id);}
 return false;
}
export function sync78Changes(base,current){return [...new Set([...Object.keys(base),...Object.keys(current)])].filter(k=>!sync78Equal(base[k],current[k])).map(key=>({key,base:sync78Clone(base[key]),value:sync78Clone(current[key]),remove:current[key]===undefined}));}
