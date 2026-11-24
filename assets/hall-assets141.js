// Original PNG bytes, shared by the WebGL renderer and its 2D fallback.
const root141=new URL('./hq/hall138/',import.meta.url);
export const hallFile141=file=>String(file).replace(/^\.\//,'').replace(/^png\//,'');
export const hallURL141=(file,base=root141)=>new URL(hallFile141(file),base).href;
export const hallFiles141=scene=>[...new Set(['fallback.png','ramka.png','sufit.png','niebo.png','podloga.png',...scene.rooms.flatMap(room=>[room.image,room.sign].filter(Boolean))].map(hallFile141))];
export const hallSizes141={"ramka.png":503203,"training_tablica.png":216348,"globe.png":1440581,"vault_tablica.png":217122,"armory.png":1589976,"hangar.png":1302372,"training.png":1415888,"pet_tablica.png":221629,"shop_tablica.png":225097,"arcade.png":1100661,"podloga.png":2562428,"niebo.png":1386340,"pet.png":1364788,"armory_tablica.png":222074,"fallback.png":1052338,"sufit.png":773681,"shop.png":1470496,"arcade_tablica.png":227069,"vault.png":1113081,"hangar_tablica.png":209541};
export function createHallAssets141(scene,{baseURL=root141,signal,onProgress=()=>{}}={}){
 const controller=new AbortController(),files=hallFiles141(scene),images=new Map();let promise=null,disposed=false,received=0,decoded=0;
 const totalBytes=files.reduce((sum,file)=>sum+(hallSizes141[file]||0),0);
 const abort=()=>controller.abort();if(signal?.aborted)abort();else signal?.addEventListener('abort',abort,{once:true});
 const check=()=>{if(disposed||controller.signal.aborted)throw new DOMException('Przerwano wczytywanie','AbortError');};
 const report=(file,phase)=>{if(!disposed)onProgress({file,phase,received,totalBytes,decoded,total:files.length,percent:Math.min(100,(totalBytes?Math.min(1,received/totalBytes):0)*80+decoded/files.length*20)});};
 async function load(file){
  check();const response=await fetch(hallURL141(file,baseURL),{signal:controller.signal,cache:'force-cache'});
  if(!response.ok)throw Error('Nie udało się pobrać '+file+' (HTTP '+response.status+').');
  let blob;
  if(response.body?.getReader){const reader=response.body.getReader(),parts=[];try{for(;;){const {done,value}=await reader.read();if(done)break;check();parts.push(value);received+=value.byteLength;report(file,'download');}}finally{reader.releaseLock();}blob=new Blob(parts,{type:'image/png'});}
  else{blob=await response.blob();received+=blob.size;report(file,'download');}
  check();let image;
  if(typeof createImageBitmap==='function'){
   try{image=await createImageBitmap(blob,{premultiplyAlpha:'none',colorSpaceConversion:'none'});}catch(error){check();image=null;}
  }
  if(!image){const url=URL.createObjectURL(blob);try{image=new Image();image.decoding='async';await new Promise((resolve,reject)=>{image.onload=resolve;image.onerror=()=>reject(Error('Nie udało się odczytać '+file+'.'));image.src=url;});if(image.decode)await image.decode();}finally{URL.revokeObjectURL(url);}}
  if(disposed||controller.signal.aborted){image.close?.();check();}
  images.set(file,image);decoded++;report(file,'decode');
 }
 return {
  loadAll(){if(!promise){let index=0;report('','download');promise=Promise.all([0,1].map(async()=>{while(index<files.length){check();await load(files[index++]);}})).then(()=>images);}return promise;},
  get:file=>images.get(hallFile141(file)),
  free(){if(disposed)return;disposed=true;controller.abort();signal?.removeEventListener('abort',abort);for(const image of images.values())image.close?.();images.clear();}
 };
}
