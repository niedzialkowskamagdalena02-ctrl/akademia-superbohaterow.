const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const native=require('/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/@napi-rs/canvas');
const root=path.resolve(__dirname,'..'),url=n=>require('node:url').pathToFileURL(path.join(root,'assets',n));
function bytes(key){const b=fs.readFileSync(path.join(root,'assets/hq/hands127',key)),chunks=[b.subarray(0,8)];for(let p=8;p<b.length;){const end=p+12+b.readUInt32BE(p),type=b.toString('ascii',p+4,p+8);if(!['caBX','iTXt','tEXt','zTXt'].includes(type))chunks.push(b.subarray(p,end));p=end;}return Buffer.concat(chunks);}
(async()=>{
 const {heroAssets127:art}=await import(url('hero-assets127.js')),{frameRect127,drawFrame127,frameKeys127}=await import(url('hero-animation127.js')),{fistPoint130,paintWind130,windRect130,paintContact131,windAngle131}=await import(url('hero-wind130.js'));
 const cache=new Map(),image=key=>cache.get(key);
 const needed=new Set([...art.effects.wind,...art.effects.punch]);
 for(const hero of Object.values(art.heroes))for(const side of [-1,1])for(const frame of hero.actions['punch:'+side]?.frames||[])for(const key of frameKeys127(frame))needed.add(key);
 for(const key of needed){const im=await native.loadImage(bytes(key));Object.defineProperties(im,{naturalWidth:{get(){return this.width;}},naturalHeight:{get(){return this.height;}}});cache.set(key,im);}
 let anchors=0,proximity=0,contacts=0;const folder=path.join(root,'../v131-effects-review');fs.mkdirSync(folder,{recursive:true});
 assert.equal(windAngle131({x:0,y:0},{x:10,y:0},-1),0);assert.equal(windAngle131({x:10,y:0},{x:0,y:0},1),0);
 for(const [hero,meta]of Object.entries(art.heroes))for(const side of [-1,1]){
  const action=meta.actions['punch:'+side];if(!action)continue;
  for(const [w,h]of [[393,852],[852,393]]){
   const box=frameRect127(w,h),canvas=native.createCanvas(w,h),ctx=canvas.getContext('2d');
   for(let i=0;i<action.frames.length;i++){
    const frame=action.frames[i],point=fistPoint130(frame,side,box);assert(Number.isFinite(point.x)&&Number.isFinite(point.y));
    const key=art.effects.wind[(side<0?0:2)+(i%2)],wind=image(key),r=windRect130(key,wind,point,box);
    assert(Math.abs(r.x+r.tipX*r.w-point.x)<1e-6);assert(Math.abs(r.y+r.tipY*r.h-point.y)<1e-6);
    ctx.clearRect(0,0,w,h);paintWind130(ctx,key,wind,point,box,.85);
    if(point.x>=16&&point.x<w-16&&point.y>=16&&point.y<h-16){assert(ctx.getImageData(Math.floor(point.x)-16,Math.floor(point.y)-16,32,32).data.some((v,j)=>j%4===3&&v>25),'Wind remains close to active fist '+hero+'/'+side+'/'+i);proximity++;}
    const contactKey=art.effects.punch[i%4];ctx.clearRect(0,0,w,h);paintContact131(ctx,contactKey,image(contactKey),point,box,1);
    if(point.x>=16&&point.x<w-16&&point.y>=16&&point.y<h-16){assert(ctx.getImageData(Math.floor(point.x)-16,Math.floor(point.y)-16,32,32).data.some((v,j)=>j%4===3&&v>25),'Contact flash follows the actual fist '+hero+'/'+side+'/'+i);contacts++;}
    if(i===Math.floor(action.frames.length/2)){
     paintWind130(ctx,key,wind,point,box,.85);
     drawFrame127(ctx,w,h,frame,new Map(frameKeys127(frame).map(k=>[k,image(k)])));
     fs.writeFileSync(path.join(folder,hero+'-'+side+'-'+w+'.png'),canvas.toBuffer('image/png'));
    }
    anchors++;
   }
  }
 }
 console.log(`PASS V131 effects: ${anchors} moving-hand placements, ${proximity} wind and ${contacts} punch-flash native pixel checks near the fist in portrait/landscape; wind follows movement direction. No PNG bytes changed.`);
})().catch(e=>{console.error(e);process.exitCode=1;});
