// Compare the actual Canvas fallback with the EGL render of the same views.
// Requires @napi-rs/canvas; no browser or network is used.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {createRequire}=require('node:module');
(async()=>{
 const req=createRequire(path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES??process.cwd(),'package.json'));
 const {createCanvas,loadImage}=req('@napi-rs/canvas');
 const root=path.resolve(__dirname,'..'),folder=path.resolve(process.argv[2]);
 const {panoramaSoftware126}=await import('file://'+root+'/assets/panorama-software126.js');
 const {cameraBasis86,walkRooms}=await import('file://'+root+'/assets/base-map86.js');
 const canvas=createCanvas(960,540),renderer=panoramaSoftware126(canvas);
 const faces=await Promise.all(['px','nx','py','ny','pz','nz'].map(n=>loadImage(path.join(root,'assets/hq/panorama126',n+'.webp'))));
 renderer.load(null,null,walkRooms.hall,faces);
 const angles=[['front',0,0],['right',Math.PI/2,0],['back',Math.PI,0],['left',-Math.PI/2,0],['roof',0,Math.PI/2],['floor',0,-Math.PI/2],['edge',Math.PI/4,0],['edge-roof',-.7,.7]];
 const results=[];
 for(const [name,yaw,pitch]of angles){
  renderer.draw({x:0,z:0},cameraBasis86(yaw,pitch),1,.5625,0);
  const reference=await loadImage(path.join(folder,name+'.jpg')),comparison=createCanvas(960,540);comparison.getContext('2d').drawImage(reference,0,0);
  const a=canvas.getContext('2d').getImageData(0,0,960,540).data,b=comparison.getContext('2d').getImageData(0,0,960,540).data;
  let sum=0,darkGaps=0;
  for(let i=0;i<a.length;i+=4){sum+=Math.abs(a[i]-b[i])+Math.abs(a[i+1]-b[i+1])+Math.abs(a[i+2]-b[i+2]);
   if(a[i]===16&&a[i+1]===32&&a[i+2]===57&&b[i]+b[i+1]+b[i+2]>160)darkGaps++;
  }
  const mean=sum/(960*540*3);assert.ok(mean<6,name+' matches GPU: '+mean);assert.ok(darkGaps<10,name+' has no cube-edge gaps');
  results.push({view:name,mean_error:mean,darkGaps});fs.writeFileSync(path.join(folder,name+'-software.png'),canvas.toBuffer('image/png'));
 }
 fs.writeFileSync(path.join(folder,'software-results.json'),JSON.stringify(results,null,2));
 console.log('PASS V126 software: eight actual Canvas views match GPU, including every cube edge, ceiling, floor and horizontal wrap. Mean RGB errors: '+results.map(r=>r.mean_error.toFixed(2)).join(', '));
})().catch(e=>{console.error(e);process.exitCode=1;});
