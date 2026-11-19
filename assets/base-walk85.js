import {hallPoint120,hallDoor120,hallSurface120,hallOutline120,placeHallHit120,hallDensity125} from './base-panorama125.js?v=125';
import {hallDetails125} from './hall-details125.js?v=125';
import {panoramaSoftware119} from './panorama-software119.js?v=128';
import {hqPet,hqPlaced,hqRead} from './headquarters84.js?v=117';
import {baseArt88} from './base-art88.js?v=119';
import {drawHeroHands} from './hero-hands85.js?v=127';
import {heroPlayer127,powerMarkup127,action127} from './hero-animation127.js?v=127';
import {walkRooms,FLOOR_DEPTH,FULL_TURN,PHOTO_FOV,VERTICAL_SCALE,advance86,cameraBasis86,clamp86,roomAnchor86,wrapAngle} from './base-map86.js?v=95';
import {energy86} from './base-training86.js?v=117';
import {petSprite86} from './pet-care86.js?v=117';
import {mentorMarkup87,drawMentor87,MENTOR_GREETING_MS} from './base-mentor87.js?v=91';
import {gameGroup92} from './learning-games92.js?v=92';

const routes=new Map(),images=new Map();
const skyHD=['training86','polish86','english86','explorer87','annex86','hall88','workshop91','armory','arcade','nook86','hangar','hangar95','shop87','vault87'];
const roomImage93=file=>file==='hall88.webp'?'panorama125/hall.webp':(skyHD.includes(file.replace('.webp',''))?'hd93/':'')+file;
const pose=room=>({room,x:0,z:0,yaw:((walkRooms[room].heading??(room==='hall'?.62:.5))-.5)*FULL_TURN,pitch:0});
const current=child=>routes.get(child)?.at(-1)??pose('hall');
const casePositions={a:[.194,.567],b:[.81,.567],c:[.5,.574]};
const labShelf=walkRooms.polish.points.find(point=>point.fixture==='shelf');
const escapeText=value=>String(value).replace(/[&<>]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[ch]));
const prop=(room,u,v,front,art,key,paint='',extra='')=>
 `<img class="hq86-prop hq88-item-art${extra?' '+extra:''}" data-room="${room}" data-u="${u}" data-v="${v}" data-front="${front?1:0}" data-prop="${key}" data-paint="${paint}" style="--hq-art-hue:${art.hue}deg" data-tall="${art.tall}"${art.caseScale?` data-case-scale="${art.caseScale}"`:''} src="${art.src}" alt="" hidden>`;
export function baseWalkMarkup(profile,child,hero,release,panel,mic=''){
 const state=hqRead(profile),animal=hqPet(profile),scene=walkRooms[current(child).room];
 const trophy=(slot,room,u,v,front=true)=>{
  const art=baseArt88(hqPlaced(profile,slot));
  return art?prop(room,u,v,front,art,slot,'',room==='armory'?'hq88-case-art':''):'';
 };
 const pet=animal?`<span class="hq86-prop hq86-nook-pet" data-room="pet" data-u=".499" data-v=".516" data-front="1" data-prop="pet" hidden>${petSprite86(animal.species,animal.care?.outfit,animal.care?.asleep,false,true)}</span>`:'';
 const paint=['mint','gold'].includes(state.paint)?state.paint:'blue';
 const jet=profile.base?.owned?.includes('quinjet'),school=!!gameGroup92(profile.grade);
 const shop=prop('shop',.085,.425,true,baseArt88('shield'),'shop-shield','','hq88-shop-display')+
  prop('shop',.905,.391,true,baseArt88('thorhammer'),'shop-hammer','','hq88-shop-display')+
  prop('shop',.892,.507,true,baseArt88('boots'),'shop-boots','','hq88-shop-display');
 const {crystals,charged,capacity,level}=energy86(profile);
 return `<section class="hq86-walk" data-hq84-scene data-hq86-walk data-child="${child}" data-hero="${hero}" data-jet="${jet?paint:school?'blue':''}">
  <div class="hq86-stage" tabindex="0" aria-label="Przesuń palcem, aby się rozejrzeć. Przytrzymaj ekran, żeby iść. Na klawiaturze użyj strzałek i spacji.">
   <div class="hq86-fallback" aria-hidden="true"></div>
   <canvas class="hq119-software" aria-hidden="true"></canvas>
   <canvas class="hq86-world" aria-hidden="true"></canvas><canvas class="hq86-hands" aria-hidden="true"></canvas>
   ${Object.entries(walkRooms).flatMap(([room,value])=>value.points.map((p,i)=>{
    if(profile.grade==='P'&&(p.action?.startsWith('hq:exercise:')||p.action==='hq:master'))return '';
    if(p.action==='hq:board'&&!jet&&!school)return '';
    const mentor=p.action==='hq:area:mentor',orb=p.action==='hq:joke',explorer=p.room==='explorer';
    const locked=p.room==='workshop'&&!profile.base?.owned?.includes('workshop');
    const style=mentor?' hq87-mentor-actor':orb?' hq87-orb':explorer?' hq87-discovery-door':p.room==='shop'?' hq88-shop-door':
     p.room==='workshop'?' hq91-workshop-door':p.action==='hq:workbench'?' hq91-reactor':p.fixture?' hq91-fixture hq91-fixture-'+p.fixture:p.icon?' hq86-holo':'';
    const label=p.action==='hq:pet'&&animal?escapeText(animal.name):p.label;
    const art=p.fixture?`<img src="assets/hq/${p.fixture}91.webp" alt="" draggable="false">`:p.icon?`<span aria-hidden="true">${p.icon}</span>`:'';
    const plate=room==='hall'&&p.room;
    const content=plate?hallDoor120(p.label):mentor?mentorMarkup87(profile.mentor):`${art}<b>${label}</b>`;
    const action=locked?'data-action="hq:room:workshop"':p.room?`data-walk-door="${p.room}"` :`data-action="${p.action}"`;
    return `<button type="button" class="hq86-point${style}${plate?' hq120-entry':''}" data-room="${room}" data-index="${i}" ${action} hidden>${content}</button>`;
   })).join('')}
   ${Object.entries(casePositions).map(([slot,[u,v]])=>trophy(slot,'armory',u,v)).join('')+trophy('lab','polish',labShelf.u,labShelf.v-.041,false)+pet+shop}
   <header class="hq86-top">
    <button type="button" data-action="hq:view:menu">‹ Wybór widoku</button>
    <button type="button" data-walk-back hidden>‹ Wróć</button>
    <div class="hq86-energy" title="${crystals} zdobytych kryształów energii">
     <div><b>Energia bohatera</b><span>poz. ${level}</span></div>
     <meter min="0" max="${capacity}" value="${charged}" aria-label="Energia superbohatera" aria-valuetext="${crystals} zdobytych kryształów energii"></meter>
     <span class="hq86-energy-gems" aria-hidden="true">${Array.from({length:capacity},(_,i)=>`<i class="${i<charged?'lit':''}"></i>`).join('')}</span>
    </div>
   </header>
   ${powerMarkup127(hero)}
   <div class="hq86-location" role="status">${scene.name}</div><small class="hq86-release">V${release}</small>
   <p class="hq86-help">Przesuń palcem, żeby się rozejrzeć. Przytrzymaj, żeby iść.</p>
   ${panel?'':'<div class="hq86-notice" id="hq85-notice" role="status"></div>'}
  </div>${panel}${panel?'':mic}</section>`;
}

export function resetBaseWalk(child){routes.delete(child);}
export function walkRoomId93(child){return current(child).room;}
export function openWalkRoom87(child,name){
 if(!Object.hasOwn(walkRooms,name))return false;
 const stack=routes.get(child)??[pose('hall')];
 if(stack.at(-1).room!==name)stack.push(pose(name));
 routes.set(child,stack);
 return true;
}

export function focusWalkCase88(child,slot){
 const view=current(child),room=walkRooms[view.room];
 const point=view.room==='polish'&&slot==='lab'?labShelf:
  view.room==='armory'&&Object.hasOwn(casePositions,slot)?{u:casePositions[slot][0],v:casePositions[slot][1],front:true}:null;
 if(!point)return false;
 const [x,y,z]=roomAnchor86(room,point,543/724);
 const distance=Math.hypot(x-view.x,z-view.z);
 view.yaw=Math.atan2(x-view.x,z-view.z);
 view.pitch=clamp86(Math.atan2(y+.33,distance),-.57,.57);
 return true;
}

function image86(file){
 if(!images.has(file)){
  const request=new Promise((resolve,reject)=>{
   const image=new Image();
   image.onload=()=>resolve(image);
   image.onerror=()=>reject(new Error('Nie udało się wczytać grafiki pomieszczenia.'));
   image.src='assets/hq/'+file;
  });
  images.set(file,request);
  request.catch(()=>images.delete(file));
 }
 return images.get(file);
}

export function panoramaWorld(canvas){
 const gl=canvas.getContext('webgl',{alpha:false,antialias:false,depth:false,powerPreference:'low-power'});
 if(!gl)return null;
 // WebGL 1 guarantees only 16 fragment vectors. On a small GPU retain the
 // most important native detail; larger GPUs also sample the seven signs.
 const detailCount=Math.min(hallDetails125.length,Math.max(1,Math.floor((gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS)-14)/2)));
 const detailShader=Array.from({length:detailCount},(_,i)=>`
   if(hasDetails>0.5){
    vec2 local=(uv-detailUV[${i}].xy)/detailUV[${i}].zw;
    if(min(local.x,local.y)>=0.&&max(local.x,local.y)<=1.){
     vec4 tile=texture2D(details,detailAtlas[${i}].xy+local*detailAtlas[${i}].zw);
     bg=bg*(1.-tile.a)+tile.rgb;
    }
   }`).join('');
 const program=gl.createProgram();
 function attach(type,source){
  const shader=gl.createShader(type);
  gl.shaderSource(shader,source);gl.compileShader(shader);gl.attachShader(program,shader);gl.deleteShader(shader);
 }
 attach(gl.VERTEX_SHADER,`
  attribute vec2 position;
  varying vec2 screen;
  void main(){screen=position;gl_Position=vec4(position,0.,1.);}
 `);
 attach(gl.FRAGMENT_SHADER,`
  #ifdef GL_FRAGMENT_PRECISION_HIGH
  precision highp float;
  #else
  precision mediump float;
  #endif
  varying vec2 screen;
  uniform mat3 basis;
  uniform vec3 eye, bounds, tint;
  uniform vec2 fov, photoFov;
  uniform float squish, hasDetails;
  uniform sampler2D panorama, portrait, details;
  uniform vec4 detailUV[${detailCount}], detailAtlas[${detailCount}];
  const float pi=3.14159265;
  void main(){
   vec3 ray=basis*vec3(screen*fov,1.);
   vec3 positive=step(0.,ray);
   vec3 lower=vec3(-bounds.x,-${FLOOR_DEPTH},-bounds.z);
   vec3 travel=(mix(lower,bounds,positive)-eye)*(positive*2.-1.)/max(abs(ray),vec3(.0001));
   float distance=min(min(travel.x,travel.y),travel.z);
   vec3 dir=normalize(eye+distance*ray);
   vec2 uv=vec2(.5+atan(dir.x,dir.z)/(2.*pi),.5-asin(clamp(dir.y,-1.,1.))*${VERTICAL_SCALE}/pi);
   uv.y=clamp(uv.y,.002,.998);
   vec3 bg=texture2D(panorama,uv).rgb;
   float seam=1.-smoothstep(0.,.023,min(uv.x,1.-uv.x));
   // Other room panoramas retain their original edge treatment. The new hall
   // uses one continuous photograph, without the old 8-degree mirror smear.
   if(abs(hasDetails)<0.5)bg=mix(bg,texture2D(panorama,vec2(1.-uv.x,uv.y)).rgb,seam*.5);
   ${detailShader}
   bg*=tint;
   if(photoFov.x>0.&&dir.z>.02){
    vec2 photo=vec2(.5)+vec2(dir.x,-dir.y)/dir.z/(2.*photoFov);
    vec2 edge=min(photo,1.-photo);
    float mask=smoothstep(0.,.15,min(edge.x,edge.y));
    float toy=(1.-smoothstep(.10,.15,abs(photo.x-.809)))*(1.-smoothstep(.08,.115,abs(photo.y-.587)));
    photo.y+=squish*toy*(photo.y-.677)*.7;
    bg=mix(bg,texture2D(portrait,clamp(photo,0.,1.)).rgb,mask);
   }
   gl_FragColor=vec4(bg,1.);
  }
 `);
 gl.linkProgram(program);
 if(!gl.getProgramParameter(program,gl.LINK_STATUS)){gl.deleteProgram(program);return null;}
 gl.useProgram(program);
 const buffer=gl.createBuffer();
 gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
 gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
 const position=gl.getAttribLocation(program,'position');
 gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
 const textures=['panorama','portrait','details'].map((name,i)=>{
  const texture=gl.createTexture();
  gl.activeTexture(gl.TEXTURE0+i);gl.bindTexture(gl.TEXTURE_2D,texture);
  for(const axis of [gl.TEXTURE_WRAP_S,gl.TEXTURE_WRAP_T])gl.texParameteri(gl.TEXTURE_2D,axis,gl.CLAMP_TO_EDGE);
  for(const filter of [gl.TEXTURE_MIN_FILTER,gl.TEXTURE_MAG_FILTER])gl.texParameteri(gl.TEXTURE_2D,filter,gl.LINEAR);
  gl.uniform1i(gl.getUniformLocation(program,name),i);
  gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([28,45,70,255]));
  return texture;
 });
 const uniform=Object.fromEntries(['basis','eye','bounds','tint','fov','photoFov','squish','hasDetails'].map(name=>[name,gl.getUniformLocation(program,name)]));
 for(let i=0;i<detailCount;i++){
  gl.uniform4fv(gl.getUniformLocation(program,`detailUV[${i}]`),hallDetails125[i].uv);
  gl.uniform4fv(gl.getUniformLocation(program,`detailAtlas[${i}]`),hallDetails125[i].atlas);
 }
 return {
  load(image,front,room,detailImage){
   const limit=gl.getParameter(gl.MAX_TEXTURE_SIZE);
   [image,front,detailImage].forEach((texture,i)=>{
    if(!texture)return;
    if(Math.max(texture.naturalWidth,texture.naturalHeight)>limit){
     const resized=document.createElement('canvas');
     const ratio=limit/Math.max(texture.naturalWidth,texture.naturalHeight);
     resized.width=Math.round(texture.naturalWidth*ratio);resized.height=Math.round(texture.naturalHeight*ratio);
     const context=resized.getContext('2d');context.imageSmoothingQuality='high';
     context.drawImage(texture,0,0,resized.width,resized.height);texture=resized;
    }
    gl.activeTexture(gl.TEXTURE0+i);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,i===2);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,texture);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,false);
   });
   gl.uniform3fv(uniform.bounds,room.bounds);
   gl.uniform3fv(uniform.tint,room.tint??[1,1,1]);
   gl.uniform1f(uniform.hasDetails,detailImage?1:room.art==='hall88.webp'?-1:0);
   gl.uniform2f(uniform.photoFov,front?PHOTO_FOV*front.naturalWidth/front.naturalHeight:0,PHOTO_FOV);
  },
  draw(state,basis,fx,fy,squish){
   gl.viewport(0,0,canvas.width,canvas.height);
   gl.uniformMatrix3fv(uniform.basis,false,basis);
   gl.uniform3f(uniform.eye,state.x,0,state.z);
   gl.uniform2f(uniform.fov,fx,fy);
   gl.uniform1f(uniform.squish,squish);
   gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
  },
  free(){
   textures.forEach(texture=>gl.deleteTexture(texture));gl.deleteBuffer(buffer);gl.deleteProgram(program);
   gl.getExtension('WEBGL_lose_context')?.loseContext();
  }
 };
}

let dispose=()=>{};
export function mountBaseWalk(root){
 dispose();dispose=()=>{};
 if(!root)return;
 const stage=root.querySelector('.hq86-stage'),canvas=root.querySelector('.hq86-world');
 const fallback=root.querySelector('.hq86-fallback'),hands=root.querySelector('.hq86-hands');
 const software=stage.querySelector('.hq119-software');
 const location=root.querySelector('.hq86-location'),dialog=root.querySelector('dialog');
 const back=stage.querySelector('[data-walk-back]'),menu=stage.querySelector('[data-action="hq:view:menu"]');
 const markers=[...stage.querySelectorAll('.hq86-point,.hq86-prop')];
 const flightButton=stage.querySelector('[data-action="hq:board"]');
 const ctx=hands.getContext('2d'),controller=new AbortController(),{signal}=controller;
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 const {hero,child}=root.dataset,stack=routes.get(child)??[pose('hall')];
 routes.set(child,stack);
 let world=panoramaWorld(canvas)??panoramaSoftware119(software),width=0,height=0,frame=0,last=0,step=0;
 stage.dataset.renderer=world?.kind??'webgl';
 let pointer=null,transition=null,busy=false,effect=null,ignoreClickUntil=0,forwarding=false;
 let portraitRatio=.73,sceneMarkers=[],greeting=null;
 let ironArt=null,jetBounds=null;
 const heroPlayer=heroPlayer127(hero,()=>{syncPowerControls();renderSoon();});
 const on=(target,name,listener,options={})=>target.addEventListener(name,listener,{...options,signal});
 const state=()=>stack.at(-1);
 const room=()=>walkRooms[state().room];
 if(dialog){
  if(typeof dialog.showModal==='function')dialog.showModal();else dialog.setAttribute('open','');
  on(dialog,'cancel',event=>{
   event.preventDefault();dialog.querySelector('[data-action="hq:close"]')?.click();
  });
 }
 function renderSoon(){if(!frame)frame=requestAnimationFrame(draw);}
 function syncPowerControls(){
  if(signal.aborted)return;
  for(const button of stage.querySelectorAll('[data-walk-mode]')){
   button.setAttribute('aria-pressed',String(button.dataset.walkMode===heroPlayer.mode));
   button.disabled=busy||!!transition||heroPlayer.busy;
  }
  for(const button of stage.querySelectorAll('[data-walk-power]')){
   button.disabled=busy||!!transition||heroPlayer.busy||!action127(hero,heroPlayer.mode,Number(button.dataset.walkPower));
  }
  const status=stage.querySelector('.hq127-status');
  if(status)status.textContent=heroPlayer.loading?'Ładuję oryginalne klatki…':heroPlayer.error;
 }
 if(stage.querySelector('[data-mentor="iron"]'))image86('mentor-iron91-sheet.webp').then(image=>{
  if(!signal.aborted){ironArt=image;renderSoon();}
 }).catch(()=>{});
 function resize(){
  const rect=stage.getBoundingClientRect();
  width=rect.width;height=rect.height;
  if(!width||!height)return;
  const density=hallDensity125(width,height,window.devicePixelRatio);
  for(const surface of [canvas,hands]){
   surface.width=Math.round(width*density);surface.height=Math.round(height*density);
  }
  const softDensity=hallDensity125(width,height,window.devicePixelRatio,true);
  software.width=Math.round(width*softDensity);software.height=Math.round(height*softDensity);
  renderSoon();
 }
 function setMarkers(){
  sceneMarkers=[];
  for(const marker of markers){
   if(marker.dataset.room!==state().room){marker.hidden=true;continue;}
   const original=room().points[Number(marker.dataset.index)]??{
    u:Number(marker.dataset.u),v:Number(marker.dataset.v),front:marker.dataset.front==='1'
   };
   const p=state().room==='hall'?hallPoint120(original):original;
   sceneMarkers.push({marker,p,anchor:p.panel120?hallSurface120(room(),p.u,p.v):roomAnchor86(room(),p,portraitRatio),
    outline:p.panel120?hallOutline120(room(),p.panel120):null});
  }
 }
 async function load(){
  const selected=room();
  busy=true;stage.setAttribute('aria-busy','true');
  location.textContent=selected.name;stage.dataset.room=state().room;
  back.hidden=stack.length===1;menu.hidden=stack.length!==1;
  greeting=null;sceneMarkers=[];markers.forEach(marker=>marker.hidden=true);
  jetBounds=null;
  heroPlayer.stop();syncPowerControls();
  if(heroPlayer.supported)void heroPlayer.setMode(heroPlayer.mode);
  fallback.style.backgroundImage=`url("assets/hq/${roomImage93(selected.portrait??selected.art)}")`;
  fallback.classList.toggle('has-portrait',!!selected.portrait);
  try{
   const [image,front,detailImage]=await Promise.all([image86(roomImage93(selected.art)),selected.portrait?image86(roomImage93(selected.portrait)):null,
    selected===walkRooms.hall?image86('panorama125/details.webp').catch(()=>null):null]);
   if(signal.aborted)return;
   portraitRatio=front?front.naturalWidth/front.naturalHeight:.73;
   world?.load(image,front,selected,detailImage);
   stage.classList.toggle('has-depth',!!world);
  }catch{
   if(signal.aborted)return;
   stage.classList.remove('has-depth');
  }finally{
   if(!signal.aborted){
    busy=false;stage.setAttribute('aria-busy','false');stage.classList.remove('is-travelling');setMarkers();syncPowerControls();renderSoon();
   }
  }
 }
 function project(basis,fx,fy,point){
  const view=state(),dx=point[0]-view.x,dy=point[1],dz=point[2]-view.z;
  const depth=dx*basis[6]+dy*basis[7]+dz*basis[8];
  if(depth<.25)return null;
  const x=dx*basis[0]+dz*basis[2],y=dx*basis[3]+dy*basis[4]+dz*basis[5];
  return [(.5+x/(2*depth*fx))*width,(.5-y/(2*depth*fy))*height,depth];
 }
 function paintMarkers(basis,fx,fy,now){
  for(const {marker,p,anchor,outline} of sceneMarkers){
   if(outline){placeHallHit120(marker,outline,state(),basis,fx,fy,width,height);continue;}
   const projected=project(basis,fx,fy,anchor);
   marker.hidden=!projected||projected[0]<24||projected[0]>width-24||projected[1]<100||projected[1]>height-90;
   if(marker.hidden)continue;
   const [x,y,depth]=projected;
   const figure=marker.querySelector('.hq87-mentor-figure');
   if(figure){
    const player=state(),distance=Math.hypot(player.x-anchor[0],player.z-anchor[2]);
    if(!greeting&&distance<2.05&&!reduced)greeting={at:now,open:false};
    drawMentor87(figure,clamp86((width*.5-x)/width,-.48,.48),greeting?now-greeting.at:0,ironArt);
   }
   const isButton=marker.tagName==='BUTTON';
   const size=clamp86((isButton?1.08:.92)*(4/depth)**.22,.72,1.15);
   const edge=isButton?Math.min(marker.offsetWidth*size*.5+4,width*.48):0;
   marker.style.left=clamp86(x,edge,width-edge)+'px';
   marker.style.top=y+'px';
   const active=effect&&(effect.slot&&effect.slot===marker.dataset.prop||
    effect.kind==='egg'&&p.action==='hq:egg'||
    effect.kind==='workbench'&&p.action==='hq:workbench'||
    effect.kind==='feed'&&(p.action==='hq:bowl'||marker.dataset.prop==='pet'));
   const amount=active?Math.sin(Math.min(1,(now-effect.start)/650)*Math.PI):0;
   marker.style.setProperty('--hq-scale',size);
   marker.style.setProperty('--hq-squish',1-(effect?.kind==='egg'?amount*.40:0));
   marker.style.setProperty('--hq-effect',String(amount));
   if(p.action==='hq:workbench')marker.toggleAttribute('data-powered',amount>.08);
   if(marker.classList.contains('hq88-case-art')){
    const photoHeight=(marker.dataset.tall==='true'?.225:.155)*PHOTO_FOV/fy*height;
    const scale=Number(marker.dataset.caseScale??1);
    marker.style.setProperty('--hq-case-size',clamp86(photoHeight*anchor[2]/depth,44,height*.57)*scale+'px');
   }
  }
 }
 function stop(event){
  if(!pointer||event&&pointer.id!==event.pointerId)return;
  const {drag,walk,point}=pointer;
  pointer=null;renderSoon();
  if(drag||walk){ignoreClickUntil=performance.now()+420;return;}
  if(point&&event?.type==='pointerup'&&event.pointerType==='touch'){
   // Some Android browsers suppress their next synthetic click after a drag.
   ignoreClickUntil=performance.now()+420;
   event.preventDefault();
   point.click();
  }
 }
 function draw(now){
  frame=0;
  if(!width||!height)return;
  const walkDelta=last?Math.min((now-last)/1000,.5):0;
  const dt=last?Math.min((now-last)/1000,.042):0;last=now;
  const view=state(),selected=room();
  let moving=false;
  if(pointer&&!pointer.drag&&!busy&&!transition&&now-pointer.time>185){
   if(!pointer.walk&&typeof pointer.id==='number'&&stage.hasPointerCapture(pointer.id)===false){
    stage.setPointerCapture(pointer.id);
   }
   pointer.walk=true;
   moving=advance86(selected,view,walkDelta*1.24)>.0001;
  }
  if(transition){
   const {from,to,yaw,done,start,duration}=transition;
   const amount=duration?clamp86((now-start)/duration,0,1):1;
   const ease=amount*amount*(3-2*amount);
   view.x=from.x+(to.x-from.x)*ease;view.z=from.z+(to.z-from.z)*ease;
   view.yaw=wrapAngle(from.yaw+yaw*ease);
   view.pitch=from.pitch*(1-ease);
   moving=amount<1&&Math.hypot(to.x-from.x,to.z-from.z)>.04;
   if(amount===1){transition=null;done();if(signal.aborted)return;}
  }
  if(moving&&!reduced)step+=dt*7.7;
  if(effect&&now-effect.start>650)effect=null;
  const aspect=width/height;
  const fx=Math.max(Math.min(.94*aspect,.60),selected.minHorizontalFov??0),fy=fx/aspect;
  const live=state(),basis=cameraBasis86(live.yaw,live.pitch);
  const squish=live.room==='pet'&&effect?.kind==='egg'?Math.sin((now-effect.start)/650*Math.PI):0;
  if(world&&!busy&&stage.classList.contains('has-depth'))world.draw(live,basis,fx,fy,squish);
  else{
   const yaw=live.yaw+Math.atan2(live.x,room().bounds[2]);
   fallback.style.backgroundPosition=`calc(50% - ${yaw/FULL_TURN*height*2.56}px) ${50-live.pitch*34}%`;
   fallback.style.transform=`scale(${1+Math.min(.16,Math.hypot(live.x,live.z)*.025)})`;
  }
  if(ctx&&!heroPlayer.draw(ctx,hands,now,{view:live,basis,fx,fy,bounds:selected.bounds,room:live.room,reduced})){
   drawHeroHands(ctx,hands,hero,reduced?0:step,moving);
  }
  if(flightButton&&live.room==='hangar'){
   const projectPhoto=(u,v)=>project(basis,fx,fy,roomAnchor86(selected,{u,v,front:true},portraitRatio));
   const a=projectPhoto(.09,.44),b=projectPhoto(.92,.69);
   jetBounds=a&&b?{left:Math.min(a[0],b[0]),right:Math.max(a[0],b[0]),top:Math.min(a[1],b[1]),bottom:Math.max(a[1],b[1])}:null;
  }
  paintMarkers(basis,fx,fy,now);
  if(greeting?.open&&now-greeting.at>=MENTOR_GREETING_MS){
   greeting.open=false;forwardPoint(greeting.marker);
   if(signal.aborted)return;
  }
  if(pointer||transition||effect||heroPlayer.animated||greeting&&now-greeting.at<MENTOR_GREETING_MS)renderSoon();else last=0;
 }
 function forwardPoint(marker){
  forwarding=true;marker.dataset.hqForwarded='1';
  try{marker.click();}finally{delete marker.dataset.hqForwarded;forwarding=false;}
 }
 function jetTarget(event){
  if(!jetBounds||!flightButton)return null;
  const rect=stage.getBoundingClientRect(),x=event.clientX-rect.left,y=event.clientY-rect.top;
  return x>=jetBounds.left&&x<=jetBounds.right&&y>=jetBounds.top&&y<=jetBounds.bottom?flightButton:null;
 }
 function travel(marker,done){
  const found=sceneMarkers.find(item=>item.marker===marker);
  if(!found||busy||transition)return;
  const from={...state()},[x,,z]=found.anchor;
  const dx=x-from.x,dz=z-from.z,distance=Math.hypot(dx,dz);
  const advance=Math.max(0,Math.min(distance-1.06,2.5));
  const to={...from};
  const direction=distance>.06?Math.atan2(dx,dz):from.yaw;
  to.yaw=direction;advance86(room(),to,advance);
  transition={from,to,yaw:wrapAngle(direction-from.yaw),done,start:performance.now(),duration:reduced?0:380+advance*170};
  stage.classList.add('is-travelling');renderSoon();
 }
 on(stage,'pointerdown',event=>{
  ignoreClickUntil=0;
  if(event.button!==0||pointer||busy||transition||dialog||event.target.closest('.hq86-top,[data-walk-controls],.pres93-speaker'))return;
  const point=event.target.closest('.hq86-point')||jetTarget(event);
  pointer={id:event.pointerId,time:performance.now(),x:event.clientX,y:event.clientY,drag:false,walk:false,point};
  if(!point)stage.setPointerCapture(event.pointerId);
  renderSoon();
 });
 on(stage,'pointermove',event=>{
  if(!pointer||event.pointerId!==pointer.id||busy||transition)return;
  const dx=event.clientX-pointer.x,dy=event.clientY-pointer.y;
  if(!pointer.drag&&Math.hypot(dx,dy)<8)return;
  if(!pointer.drag){pointer.drag=true;stage.setPointerCapture(event.pointerId);}
  const view=state();
  view.yaw=wrapAngle(view.yaw-dx*2.65/width);
  view.pitch=clamp86(view.pitch+dy*2.55/height,-.86,.89);
  pointer.x=event.clientX;pointer.y=event.clientY;renderSoon();
 });
 for(const event of ['pointerup','pointercancel'])on(window,event,stop);
 on(stage,'lostpointercapture',event=>{if(event.target===stage)stop(event);});
 on(window,'blur',()=>stop());
 on(stage,'contextmenu',event=>event.preventDefault());
 on(stage,'click',event=>{
  if(forwarding)return;
  if(event.detail&&performance.now()<ignoreClickUntil){
   event.preventDefault();event.stopPropagation();return;
  }
  if(event.target.closest('[data-walk-back]')){
   if(stack.length>1&&!busy&&!transition){stack.pop();void load();}
   return;
  }
  if(event.target.closest('[data-walk-controls]'))return;
  const marker=event.target.closest('.hq86-point');
  if(!marker&&!busy&&!transition&&event.detail&&jetTarget(event)){
   event.preventDefault();flightButton.click();return;
  }
  if(!marker||busy||transition){
   if(marker){event.preventDefault();event.stopPropagation();}
   return;
  }
  const next=marker.dataset.walkDoor;
  if(marker.classList.contains('hq87-mentor-actor')&&!reduced){
   event.preventDefault();event.stopPropagation();
   const now=performance.now();
   if(!greeting||now-greeting.at>=MENTOR_GREETING_MS)greeting={at:now};
   greeting.open=true;greeting.marker=marker;renderSoon();return;
  }
  if(!next&&!marker.matches('.hq86-holo,.hq91-fixture'))return;
  event.preventDefault();event.stopPropagation();
  travel(marker,()=>{
   if(next){stack.push(pose(next));void load();return;}
   stage.classList.remove('is-travelling');
   forwardPoint(marker);
  });
 },{capture:true});
 function activatePower(side){
  if(dialog||busy||transition||!ctx)return;
  void heroPlayer.play(side);
 }
 for(const button of stage.querySelectorAll('[data-walk-mode]')){
  on(button,'click',()=>{if(!dialog&&!busy&&!transition)void heroPlayer.setMode(button.dataset.walkMode);});
 }
 for(const button of stage.querySelectorAll('[data-walk-power]')){
  on(button,'click',()=>activatePower(Number(button.dataset.walkPower)));
 }
 on(stage,'keydown',event=>{
  if(event.target!==stage||dialog||busy||transition)return;
  const view=state();
  if(heroPlayer.supported&&!event.repeat&&['KeyF','KeyG'].includes(event.code)){
   const left=action127(hero,heroPlayer.mode,-1);
   activatePower(event.code==='KeyF'&&left?-1:1);
  }
  else if(event.code==='Space'){
   if(!pointer)pointer={id:'keyboard',time:performance.now(),drag:false,walk:false};
  }else if(['ArrowLeft','ArrowRight'].includes(event.code)){
   view.yaw=wrapAngle(view.yaw+(event.code==='ArrowLeft'?-.22:.22));
  }else if(['ArrowUp','ArrowDown'].includes(event.code)){
   view.pitch=clamp86(view.pitch+(event.code==='ArrowUp'?.13:-.13),-.86,.89);
  }else return;
  event.preventDefault();renderSoon();
 });
 on(stage,'keyup',event=>{if(event.code==='Space'&&pointer?.id==='keyboard')stop();});
 on(root,'hq84:effect',event=>{
  effect={...event.detail,start:performance.now()};renderSoon();
 });
 on(canvas,'webglcontextlost',event=>{
  event.preventDefault();world=panoramaSoftware119(software);stage.dataset.renderer='software';stage.classList.remove('has-depth');void load();renderSoon();
 });
 const observer=new ResizeObserver(resize);observer.observe(stage);resize();
 void load();
 dispose=()=>{controller.abort();heroPlayer.dispose();observer.disconnect();cancelAnimationFrame(frame);world?.free();};
}
