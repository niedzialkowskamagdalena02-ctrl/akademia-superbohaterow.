// Layered hall using only supplied PNG artwork. No panoramic sphere is used
// for the rooms: each room keeps a flat plane and its own undistorted UVs.
export function hallGeometry137(scene){
 const a=scene.apothem,h=scene.wall_height,half=a*Math.tan(Math.PI/8),apex=[0,scene.apex_height,0];
 return scene.rooms.map((room,i)=>{
  const angle=i*Math.PI/4,n=[Math.sin(angle),0,-Math.cos(angle)],r=[Math.cos(angle),0,Math.sin(angle)];
  const point=(x,y,offset=0)=>[n[0]*(a+offset)+r[0]*x,y,n[2]*(a+offset)+r[2]*x];
  return {...room,angle,normal:n,right:r,half,wall:[point(-half,h),point(half,h),point(-half,0),point(half,0)],roof:[point(-half,h),point(half,h),apex],signVertices:[point(-half*.73,.72,-.025),point(half*.73,.72,-.025),point(-half*.73,.72-half*1.46*.245,-.025),point(half*.73,.72-half*1.46*.245,-.025)]};
 });
}
export function hallCamera137(yaw,pitch,width,height){
 const c=Math.cos(yaw),s=Math.sin(yaw),p=Math.cos(pitch),q=Math.sin(pitch),aspect=width/height;
 const ty=aspect<1?Math.tan(36*Math.PI/180)/aspect:Math.tan(33*Math.PI/180);
 return {right:[c,0,s],up:[-s*q,p,c*q],forward:[s*p,q,-c*p],tan:[ty*aspect,ty]};
}
export async function createLayeredHall137(canvas,scene,{baseURL='',changed=()=>{},signal=new AbortController().signal}={}){
 const gl=canvas.getContext('webgl',{alpha:false,antialias:true,preserveDrawingBuffer:false});
 if(!gl)throw Error('Ten podgląd wymaga WebGL. W paczce jest również podgląd PNG.');
 const vertex=`attribute vec3 position;attribute vec2 uv;varying vec2 tex;uniform vec3 eye,right,up,forward;uniform vec2 tangent;void main(){vec3 p=position-eye;vec3 v=vec3(dot(p,right),dot(p,up),dot(p,forward));gl_Position=vec4(v.xy/tangent,1.002002*v.z-.2002002,v.z);tex=uv;}`;
 const frag=`precision mediump float;varying vec2 tex;uniform sampler2D art;void main(){vec4 c=texture2D(art,tex);if(c.a<.008)discard;gl_FragColor=c;}`;
 const skyVertex=`attribute vec3 position;varying vec2 screen;void main(){gl_Position=vec4(position,1.);screen=position.xy;}`;
 const skyFrag=`precision highp float;varying vec2 screen;uniform sampler2D art;uniform vec3 right,up,forward;uniform vec2 tangent;uniform float repeats,skyScale;void main(){vec3 ray=normalize(forward+screen.x*tangent.x*right+screen.y*tangent.y*up);float u=fract((atan(ray.x,-ray.z)/6.28318530718+.5)*repeats);float v=clamp(.74-(asin(ray.y)-.46)*skyScale,.002,.998);gl_FragColor=vec4(texture2D(art,vec2(u,v)).rgb,1.);}`;
 const make=(vs,fs)=>{
  const compile=(type,src)=>{const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;};
  const v=compile(gl.VERTEX_SHADER,vs),f=compile(gl.FRAGMENT_SHADER,fs),p=gl.createProgram();gl.attachShader(p,v);gl.attachShader(p,f);gl.linkProgram(p);gl.deleteShader(v);gl.deleteShader(f);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(p));return p;
 };
 const world=make(vertex,frag),sky=make(skyVertex,skyFrag),buffer=gl.createBuffer(),textures=new Map(),rooms=hallGeometry137(scene);
 let disposed=false,stamp='';
 const files=[...new Set(['png/ramka.png','png/sufit.png','png/niebo.png','png/podloga.png',...scene.rooms.flatMap(r=>[r.image,r.sign].filter(Boolean))])];
 const uniform=(p,name,value)=>{const u=gl.getUniformLocation(p,name);if(value.length===3)gl.uniform3fv(u,value);else gl.uniform2fv(u,value);};
 const use=(program,camera,state)=>{
  gl.useProgram(program);gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
  for(const name of ['right','up','forward'])uniform(program,name,camera[name]);uniform(program,'tangent',camera.tan);
  if(program===world)uniform(program,'eye',[state.x||0,scene.eye,state.z||0]);
  gl.uniform1i(gl.getUniformLocation(program,'art'),0);gl.activeTexture(gl.TEXTURE0);
 };
 const render=(program,file,vertices,uvs)=>{
  const data=new Float32Array(vertices.flatMap((v,i)=>[...v,...uvs[i]]));gl.bufferData(gl.ARRAY_BUFFER,data,gl.STREAM_DRAW);
  const at=gl.getAttribLocation(program,'position');gl.enableVertexAttribArray(at);gl.vertexAttribPointer(at,3,gl.FLOAT,false,20,0);
  const tex=gl.getAttribLocation(program,'uv');if(tex>=0){gl.enableVertexAttribArray(tex);gl.vertexAttribPointer(tex,2,gl.FLOAT,false,20,12);}
  gl.bindTexture(gl.TEXTURE_2D,textures.get(file));gl.drawArrays(gl.TRIANGLES,0,vertices.length);
 };
 const quad=(file,v)=>render(world,file,[v[0],v[2],v[1],v[1],v[2],v[3]],[[0,0],[0,1],[1,0],[1,0],[0,1],[1,1]]);
 const api={
  draw(state={}){
   if(disposed)return;const {yaw=0,pitch=0}=state,key=[canvas.width,canvas.height,yaw,pitch,state.x,state.z].join(':');if(key===stamp)return;stamp=key;
   const camera=hallCamera137(yaw,pitch,canvas.width,canvas.height);gl.viewport(0,0,canvas.width,canvas.height);gl.clearColor(.015,.025,.08,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
   gl.disable(gl.DEPTH_TEST);gl.disable(gl.BLEND);use(sky,camera,state);gl.uniform1f(gl.getUniformLocation(sky,'repeats'),scene.sky_repeats);gl.uniform1f(gl.getUniformLocation(sky,'skyScale'),2048/379*scene.sky_repeats/(2*Math.PI));
   render(sky,'png/niebo.png',[[-1,-1,0],[1,-1,0],[-1,1,0],[-1,1,0],[1,-1,0],[1,1,0]],Array(6).fill([0,0]));
   use(world,camera,state);gl.enable(gl.DEPTH_TEST);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
   const r=scene.apothem*1.5;quad('png/podloga.png',[[-r,0,-r],[r,0,-r],[-r,0,r],[r,0,r]]);
   for(const room of rooms){
    // The room is the lower layer; the actual supplied alpha frame is above.
    // Equal-depth layering is deliberate: no perspective mismatch on the window.
    gl.depthFunc(gl.LEQUAL);quad(room.image,room.wall);quad('png/ramka.png',room.wall);
    if(room.sign)quad(room.sign,room.signVertices);
   }
   for(const room of rooms)render(world,'png/sufit.png',room.roof,[[126/1024,1424/1536],[895/1024,1424/1536],[510/1024,23/1536]]);
  },
  free(){if(disposed)return;disposed=true;for(const t of textures.values())gl.deleteTexture(t);gl.deleteBuffer(buffer);gl.deleteProgram(world);gl.deleteProgram(sky);},
  geometry:rooms
 };
 async function load(file){
  const response=await fetch(new URL(file,baseURL||document.baseURI),{signal});if(!response.ok)throw Error('Nie udało się pobrać '+file);
  const blob=await response.blob();let image;
  if(typeof createImageBitmap==='function')image=await createImageBitmap(blob,{premultiplyAlpha:'none',colorSpaceConversion:'none'});
  else{const url=URL.createObjectURL(blob);try{image=new Image();image.src=url;await image.decode();}finally{URL.revokeObjectURL(url);}}
  if(disposed||signal.aborted){image.close?.();throw new DOMException('Przerwano','AbortError');}
  const texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,false);
  gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);textures.set(file,texture);image.close?.();
 }
 try{let index=0;await Promise.all([0,1].map(async()=>{while(index<files.length)await load(files[index++]);}));changed();return api;}
 catch(error){api.free();throw error;}
}
