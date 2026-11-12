import {HQ_ART,hqPlaced,hqRead} from './headquarters84.js?v=84';
import {drawHeroHands} from './hero-hands85.js?v=85';

const action=(label,x,y,id)=>({label,x,y,id});
const door=(label,x,y,room)=>({label,x,y,room});
const hall=door('← Korytarz',.29,.79,'hall');
const scenes={
 hall:{name:'Baza Avengersów',art:'walk.webp',depth:5.2,points:[
  door('Laboratorium',.18,.46,'lab'),door('Automaty',.81,.45,'arcade'),
  door('Zbrojownia',.50,.34,'armory'),door('Kącik zwierzaka',.83,.64,'pet'),
  door('Hangar',.15,.60,'hangar'),action('Portfel',.19,.74,'hq:wallet')
 ]},
 lab:{name:'Laboratorium',art:'lab.webp',depth:4.5,points:[
  action('Trening',.48,.45,'hq:training'),action('Książki',.27,.59,'hq:area:books'),
  action('Misje',.72,.38,'hq:area:home'),action('Sala odkrywców',.73,.57,'hq:area:academy'),
  action('Mentor',.50,.65,'hq:area:mentor'),action('Półka',.27,.31,'hq:slot:lab'),hall
 ]},
 arcade:{name:'Centrum Rozrywki',art:'arcade.webp',depth:4.2,points:[
  action('Zagraj',.51,.46,'hq:arcade'),action('Kula sucharów',.75,.63,'hq:joke'),hall
 ]},
 armory:{name:'Zbrojownia',art:'armory.webp',depth:4.6,points:[
  action('Sklep ze zbrojami',.5,.45,'hq:shop'),action('Gablota A',.26,.59,'hq:slot:a'),
  action('Gablota B',.73,.59,'hq:slot:b'),action('Zmień bohatera',.5,.72,'hq:hero'),hall
 ]},
 hangar:{name:'Hangar',art:'hangar.webp',depth:5.4,points:[
  action('Lądowisko',.5,.52,'hq:hangar'),hall
 ]},
 pet:{name:'Kącik zwierzaka',art:'pet.webp',depth:3.5,points:[
  action('Miska',.35,.63,'hq:pet'),action('Gniotek',.74,.54,'hq:egg'),hall
 ]}
};
const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
const cameraByProfile=new Map();
const textures=new Map();
let dispose=()=>{};

export function baseWalkMarkup(profile,child,hero,release,panel){
 const pet=hqRead(profile).pet?.species;
 const jet=profile.base?.owned?.includes('quinjet');
 const paint=hqRead(profile).paint;
 const currentScene=cameraByProfile.get(child)?.scene??'hall';
 const trophy=(slot,room,x,y)=>{
  const item=hqPlaced(profile,slot);
  return item&&HQ_ART.has(item)?prop(room,x,y,'item-'+item,slot):'';
 };
 return '<section class="hq85-walk" data-hq84-scene data-hq85-walk data-child="'+child+
  '" data-hero="'+hero+'"><div class="hq85-stage" tabindex="0" aria-label="Przytrzymaj ekran lub spację, żeby iść. Dotknij przedmiotu, aby go użyć.">'+
  '<img class="hq85-image" src="assets/hq/'+scenes[currentScene].art+'" alt="" draggable="false">'+
  '<canvas class="hq85-world" aria-hidden="true"></canvas><canvas class="hq85-hands" aria-hidden="true"></canvas>'+
  Object.entries(scenes).map(([scene,value])=>value.points.map((p,index)=>
   '<button type="button" class="hq85-point" data-scene="'+scene+'" data-point="'+index+'"'+
   (p.room?' data-walk-door="'+p.room+'"':' data-action="'+p.id+'"')+' hidden>'+p.label+'</button>').join('')).join('')+
  trophy('a','armory',.26,.47)+trophy('b','armory',.73,.47)+trophy('lab','lab',.27,.24)+
  (pet==='dog'?prop('pet',.36,.49,'vocab-dog','pet'):'')+
  (jet?prop('hangar',.5,.52,'item-quinjet','jet',paint==='gold'?'gold':paint==='mint'?'mint':'blue'):'')+
  '<div class="hq85-top"><button type="button" data-action="hq:view:menu">‹ Wybór widoku</button><span>V'+release+'</span></div>'+
  '<div class="hq85-location" role="status"></div><p class="hq85-help">Przytrzymaj ekran, żeby iść. Dotknij miejsca, żeby wejść.</p>'+
  '</div>'+panel+'</section>';
}

function prop(room,x,y,file,key,color=''){
 return '<img class="hq85-prop" src="assets/art/'+file+'.svg" alt="" data-scene="'+room+'" data-x="'+x+
  '" data-y="'+y+'" data-prop="'+key+'" data-paint="'+color+'" hidden>';
}

function freshCamera(){return {scene:'hall',advance:0,x:0,y:0};}
export function resetBaseWalk(child){cameraByProfile.delete(child);}

function depthAt(room,x,y){
 const floor=clamp((y-.44)/.56,0,1);
 const side=Math.pow(Math.abs(x-.5)*2,2);
 const depth=scenes[room].depth;
 return Math.max(1.22,depth-(depth-1.22)*Math.pow(floor,.76)-side*(.6+.5*floor));
}

function readTexture(file){
 if(!textures.has(file)){
  const promise=new Promise((resolve,reject)=>{
   const img=new Image();
   img.onload=()=>resolve(img);
   img.onerror=()=>reject(Error('Nie udało się wczytać pomieszczenia.'));
   img.src='assets/hq/'+file;
  });
  textures.set(file,promise);
  promise.catch(()=>textures.delete(file));
 }
 return textures.get(file);
}

function makeWorld(canvas){
 const gl=canvas.getContext('webgl',{alpha:false,antialias:true,powerPreference:'low-power'});
 if(!gl)return null;
 const program=gl.createProgram();
 function shader(type,code){
  const handle=gl.createShader(type);
  gl.shaderSource(handle,code);gl.compileShader(handle);
  gl.attachShader(program,handle);gl.deleteShader(handle);
 }
 shader(gl.VERTEX_SHADER,
  'attribute vec3 point; attribute vec2 uv; uniform vec3 move; uniform vec2 fit; varying vec2 tex;'+
  'void main(){vec3 p=point-move; gl_Position=vec4(p.xy*fit,p.z-0.2,p.z); tex=uv;}');
 shader(gl.FRAGMENT_SHADER,
  'precision mediump float; varying vec2 tex; uniform sampler2D room;'+
  'void main(){gl_FragColor=texture2D(room,tex);}');
 gl.linkProgram(program);
 if(!gl.getProgramParameter(program,gl.LINK_STATUS)){gl.deleteProgram(program);return null;}
 gl.useProgram(program);
 const position=gl.getAttribLocation(program,'point'),uv=gl.getAttribLocation(program,'uv');
 const camera=gl.getUniformLocation(program,'move'),fitting=gl.getUniformLocation(program,'fit');
 const buffer=gl.createBuffer(),texture=gl.createTexture();
 gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
 gl.vertexAttribPointer(position,3,gl.FLOAT,false,20,0);gl.enableVertexAttribArray(position);
 gl.vertexAttribPointer(uv,2,gl.FLOAT,false,20,12);gl.enableVertexAttribArray(uv);
 gl.bindTexture(gl.TEXTURE_2D,texture);
 for(const axis of [gl.TEXTURE_WRAP_S,gl.TEXTURE_WRAP_T])gl.texParameteri(gl.TEXTURE_2D,axis,gl.CLAMP_TO_EDGE);
 for(const filter of [gl.TEXTURE_MIN_FILTER,gl.TEXTURE_MAG_FILTER])gl.texParameteri(gl.TEXTURE_2D,filter,gl.LINEAR);
 gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);
 gl.clearColor(.055,.07,.13,1);
 let count=0;
 return {
  load(image,room,ratio){
   const vertices=[];
   function add(x,y){
    const z=depthAt(room,x,y);
    vertices.push((2*x-1)*ratio*z,(1-2*y)*z,z,x,y);
   }
   for(let y=0;y<36;y++)for(let x=0;x<24;x++){
    const l=x/24,r=(x+1)/24,t=y/36,b=(y+1)/36;
    add(l,t);add(r,t);add(l,b);add(r,t);add(r,b);add(l,b);
   }
   count=vertices.length/5;
   gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(vertices),gl.STATIC_DRAW);
   gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);
  },
  draw(move,fit){
   gl.viewport(0,0,canvas.width,canvas.height);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
   gl.uniform3fv(camera,move);gl.uniform2fv(fitting,fit);gl.drawArrays(gl.TRIANGLES,0,count);
  },
  free(){gl.deleteBuffer(buffer);gl.deleteTexture(texture);gl.deleteProgram(program);}
 };
}

export function mountBaseWalk(root){
 dispose();dispose=()=>{};
 if(!root)return;
 const stage=root.querySelector('.hq85-stage'),fallback=root.querySelector('.hq85-image');
 const canvas=root.querySelector('.hq85-world'),hands=root.querySelector('.hq85-hands');
 const location=root.querySelector('.hq85-location'),dialog=root.querySelector('dialog');
 const markers=[...root.querySelectorAll('.hq85-point,.hq85-prop')];
 const ctx=hands.getContext('2d'),world=makeWorld(canvas);
 const controller=new AbortController(),signal=controller.signal;
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 const child=root.dataset.child,state=cameraByProfile.get(child)??freshCamera();
 cameraByProfile.set(child,state);
 let frame=0,loading=false,loaded=false,revision=0,pointer=null,previous=0,step=0,playing=false;
 let ratio=.5628,fx=1,fy=1,width=0,height=0,transition=null,effect=null,ignoreClickUntil=0;
 if(dialog){
  if(typeof dialog.showModal==='function')dialog.showModal();else dialog.setAttribute('open','');
  dialog.addEventListener('cancel',event=>{
   event.preventDefault();dialog.querySelector('[data-action="hq:close"]')?.click();
  },{signal});
 }
 function renderSoon(){if(!frame)frame=requestAnimationFrame(draw);}
 function resize(){
  const rect=stage.getBoundingClientRect();
  width=rect.width;height=rect.height;
  if(!width||!height)return;
  const density=Math.min(window.devicePixelRatio||1,1.65);
  for(const surface of [canvas,hands]){
   surface.width=Math.round(width*density);surface.height=Math.round(height*density);
  }
  renderSoon();
 }
 function project(x,y,move){
  const z=depthAt(state.scene,x,y),depth=z-move[2];
  return [(.5+((2*x-1)*ratio*z-move[0])*fx/(2*depth))*width,
   (.5-((1-2*y)*z-move[1])*fy/(2*depth))*height];
 }
 function markersInView(move,now){
  for(const marker of markers){
   if(marker.dataset.scene!==state.scene){marker.hidden=true;continue;}
   const point=scenes[state.scene].points[+marker.dataset.point];
   const x=point?.x??+marker.dataset.x,y=point?.y??+marker.dataset.y;
   const [left,top]=project(x,y,move);
   const exit=marker.dataset.walkDoor==='hall';
   marker.hidden=!exit&&(left< -width*.12||left>width*1.12||top<65||top>height-38);
   if(marker.hidden)continue;
   const edge=marker.classList.contains('hq85-point')?marker.offsetWidth/2+6:0;
   marker.style.left=clamp(left,edge,width-edge)+'px';marker.style.top=clamp(top,72,height-57)+'px';
   const active=effect&&(effect.slot&&effect.slot===marker.dataset.prop||effect.kind==='egg'&&point?.id==='hq:egg'||effect.kind==='feed'&&point?.id==='hq:pet');
   marker.style.setProperty('--hq-effect',active?String(Math.sin(Math.min(1,(now-effect.start)/650)*Math.PI)*.21):'0');
  }
 }
 function load(scene,keepCamera=false){
  const id=++revision,room=scenes[scene],file=room.art;
  loading=true;
  return readTexture(file).then(image=>{
   if(signal.aborted||id!==revision)return;
   state.scene=scene;
   if(!keepCamera){state.x=0;state.y=0;state.advance=0;}
   ratio=image.naturalWidth/image.naturalHeight;
   fallback.src=image.src;
   if(world)world.load(image,scene,ratio);
   loaded=true;location.textContent=room.name;
   stage.dataset.room=scene;stage.classList.toggle('has-depth',!!world);
  }).catch(()=>{
   if(!signal.aborted&&id===revision)location.textContent='Dotknij wejścia, aby spróbować ponownie.';
  }).finally(()=>{
   if(!signal.aborted&&id===revision){loading=false;transition=null;stage.classList.remove('is-entering');renderSoon();}
  });
 }
 function enter(scene,now){
  if(!scenes[scene]||state.scene===scene||loading||transition)return;
  transition={scene,start:now};stage.classList.add('is-entering');renderSoon();
 }
 function beginWalk(event){
  if(event.target.closest('button')){ignoreClickUntil=0;return;}
  if(event.button!==0||pointer||transition||loading||dialog)return;
  const rect=stage.getBoundingClientRect();
  pointer={id:event.pointerId,time:performance.now(),x:event.clientX,y:event.clientY,drag:false,
   aimX:clamp((event.clientX-rect.left)/rect.width,0,1),aimY:clamp((event.clientY-rect.top)/rect.height,0,1),walked:0};
  stage.setPointerCapture(event.pointerId);renderSoon();
 }
 function goForward(now,dt){
  if(!pointer||pointer.drag||pointer.arrived||now-pointer.time<155||loading||transition)return;
  playing=true;step+=dt*9;
  pointer.walked+=dt;
  state.advance=clamp(state.advance+dt*.45,0,.66);
  state.x=clamp(state.x+(pointer.aimX-.5)*dt*.29,-.17,.17);
  if(pointer.walked<1.30||state.scene!=='hall')return;
  const {aimX,aimY}=pointer;
  enter(aimX<.36?(aimY>.59?'hangar':'lab'):aimX>.64?(aimY>.59?'pet':'arcade'):'armory',now);
  pointer.arrived=true;
 }
 function draw(now){
  frame=0;
  if(!width||!height)return;
  const dt=Math.min((now-previous)/1000,.034);previous=now;playing=false;
  goForward(now,dt);
  if(transition&&!loading&&now-transition.start>=(reduced?0:240))void load(transition.scene);
  if(effect&&now-effect.start>650)effect=null;
  const aspect=width/height;
  // Cover the screen without stretching the original illustration.
  fx=Math.max(1/ratio,1/aspect);
  fy=Math.max(1,aspect/ratio);
  const move=[state.x,state.y,state.advance];
  if(world&&loaded)world.draw(move,[fx,fy]);
  else fallback.style.transform='translate('+(-move[0]*36)+'px,'+(move[1]*36)+'px) scale('+(1+move[2]*.39)+')';
  if(ctx)drawHeroHands(ctx,hands,root.dataset.hero,reduced?0:step,playing);
  markersInView(move,now);
  if(pointer&&!pointer.arrived||effect||transition&&!loading)renderSoon();
 }
 function release(event){
  if(pointer&&(event===undefined||pointer.id===event.pointerId)){
   if(pointer.drag||pointer.walked>.02)ignoreClickUntil=performance.now()+450;
   pointer=null;renderSoon();
  }
 }
 stage.addEventListener('pointerdown',beginWalk,{signal});
 stage.addEventListener('pointermove',event=>{
  if(!pointer||pointer.arrived||event.pointerId!==pointer.id)return;
  const dx=event.clientX-pointer.x,dy=event.clientY-pointer.y;
  if(Math.hypot(dx,dy)>8)pointer.drag=true;
  if(pointer.drag){
   state.x=clamp(state.x-dx*.0018,-.17,.17);
   state.y=clamp(state.y+dy*.0017,-.15,.15);
   pointer.x=event.clientX;pointer.y=event.clientY;renderSoon();
  }
 },{signal});
 for(const type of ['pointerup','pointercancel','lostpointercapture'])stage.addEventListener(type,release,{signal});
 stage.addEventListener('contextmenu',event=>event.preventDefault(),{signal});
 stage.addEventListener('click',event=>{
  if(event.detail&&performance.now()<ignoreClickUntil){
   event.preventDefault();event.stopPropagation();ignoreClickUntil=0;return;
  }
  const room=event.target.closest('[data-walk-door]')?.dataset.walkDoor;
  if(room)enter(room,performance.now());
 },{signal,capture:true});
 stage.addEventListener('keydown',event=>{
  if(event.target!==stage||event.code!=='Space'||pointer||dialog)return;
  event.preventDefault();
  pointer={id:'keyboard',time:performance.now(),aimX:.5,aimY:.5,walked:0};renderSoon();
 },{signal});
 stage.addEventListener('keyup',event=>{if(event.code==='Space'&&pointer?.id==='keyboard')release();},{signal});
 window.addEventListener('blur',()=>release(),{signal});
 root.addEventListener('hq84:effect',event=>{
  const {kind,slot}=event.detail;
  effect={kind,slot,start:performance.now()};
  renderSoon();
 },{signal});
 canvas.addEventListener('webglcontextlost',event=>{
  event.preventDefault();stage.classList.remove('has-depth');
 },{signal});
 const observer=new ResizeObserver(resize);observer.observe(stage);resize();
 void load(state.scene,true);
 dispose=()=>{controller.abort();observer.disconnect();cancelAnimationFrame(frame);world?.free();};
}
