const fs=require('node:fs'),path=require('node:path');
const {createCanvas,loadImage}=require('/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/@napi-rs/canvas');
const folder=path.resolve(__dirname,'../../v127-review');
(async()=>{
 const list=JSON.parse(fs.readFileSync(path.join(folder,'sequences.json')));
 const picks=[['hulk','slam',-1],['captain','shield',1],['thor','punch',1],['thor','hammer',1],['iron','laser',1],['spider','web',1]];
 for(const [hero,mode,side]of picks){
  const seq=list.find(s=>s.hero===hero&&s.mode===mode&&s.side===side),c=createCanvas(1280,620),g=c.getContext('2d');g.fillStyle='#142538';g.fillRect(0,0,c.width,c.height);
  for(let i=0;i<8;i++){
   const image=await loadImage(path.join(folder,seq.files[i])),x=i%4*320,y=Math.floor(i/4)*310;
   g.fillStyle='#283b50';g.fillRect(x+4,y+4,312,280);
   g.drawImage(image,x+84,y+4,144,280);g.fillStyle='white';g.font='15px sans-serif';g.fillText(`${hero} ${mode} ${i+1}`,x+12,y+302);
  }
  fs.writeFileSync(path.join(folder,hero+'-'+mode+'-contact.jpg'),c.toBuffer('image/jpeg'));
 }
})();
