const MiB=1024*1024;

// Keep compressed originals separately from a small decoded playback window.
// Original PNG files are never resized or re-encoded by this loader.
export function createHeroResources129({base='assets/hq/hands127/',decodedBudget=96*MiB,sourceBudget=64*MiB}={}){
 const sources=new Map(),decoded=new Map(),pins=new Map();
 let sourceBytes=0,decodedBytes=0,peakBytes=0,stamp=0,decodes=0,fetches=0;
 const pinned=key=>[...pins.values()].some(keys=>keys.has(key));
 function drop(key,entry){
  decoded.delete(key);decodedBytes-=entry.bytes;
  entry.image.onload=entry.image.onerror=null;
  if(entry.url)URL.revokeObjectURL(entry.url);
  entry.image.src='';
 }
 function trim(){
  for(const [key,entry]of [...decoded].sort((a,b)=>a[1].at-b[1].at)){
   if(decodedBytes<=decodedBudget)break;
   if(entry.image&&!pinned(key))drop(key,entry);
  }
  peakBytes=Math.max(peakBytes,decodedBytes);
  for(const [key,entry]of sources){
   if(sourceBytes<=sourceBudget)break;
   if(entry.blob){sources.delete(key);sourceBytes-=entry.blob.size;}
  }
 }
 async function source(key){
  let entry=sources.get(key);
  if(entry){sources.delete(key);sources.set(key,entry);return entry.promise;}
  entry={blob:null,promise:null};sources.set(key,entry);fetches++;
  entry.promise=(async()=>{
   try{
    const response=await fetch(base+key,{cache:'force-cache'});
    if(!response.ok)throw new Error('HTTP '+response.status);
    entry.blob=await response.blob();sourceBytes+=entry.blob.size;trim();return entry.blob;
   }catch(error){sources.delete(key);throw new Error('Nie udało się pobrać klatek. Sprawdź połączenie i wybierz ruch ponownie.');}
  })();
  return entry.promise;
 }
 function decode(key){
  let entry=decoded.get(key);
  if(entry){entry.at=++stamp;return entry.promise;}
  entry={image:null,promise:null,bytes:0,url:null,at:++stamp};decoded.set(key,entry);
  entry.promise=(async()=>{
   try{
    const blob=await source(key),image=new Image();image.decoding='async';
    entry.url=URL.createObjectURL(blob);
    await new Promise((resolve,reject)=>{
     image.onload=()=>resolve();image.onerror=()=>reject(new Error('Nie udało się odczytać klatki animacji.'));
     image.src=entry.url;
    });
    if(typeof image.decode==='function')await image.decode();
    entry.image=image;entry.bytes=image.naturalWidth*image.naturalHeight*4;decodedBytes+=entry.bytes;decodes++;trim();
    return image;
   }catch(error){decoded.delete(key);if(entry.url)URL.revokeObjectURL(entry.url);throw error;}
  })();
  return entry.promise;
 }
 async function warm(keys,progress=()=>{},valid=()=>true){
  const list=[...new Set(keys)].filter(Boolean);
  for(let i=0;i<list.length;i+=4){
   if(!valid())return false;
   await Promise.all(list.slice(i,i+4).map(source));progress(Math.min(i+4,list.length),list.length);
  }
  return valid();
 }
 async function decodeAll(keys){
  const list=[...new Set(keys)].filter(Boolean);
  for(let i=0;i<list.length;i+=3)await Promise.all(list.slice(i,i+3).map(decode));
 }
 return {
  warm,decode,decodeAll,
  peek(key){const entry=decoded.get(key);if(entry?.image){entry.at=++stamp;return entry.image;}return null;},
  pin(owner,keys){pins.set(owner,new Set(keys.filter(Boolean)));trim();},
  release(owner){pins.delete(owner);for(const [key,entry]of decoded)if(entry.image&&!pinned(key))drop(key,entry);},
  get stats(){return {sourceBytes,decodedBytes,peakBytes,decodes,fetches,decodedCount:[...decoded.values()].filter(e=>e.image).length,decodedBudget,sourceBudget};}
 };
}

export const heroResources129=createHeroResources129();
