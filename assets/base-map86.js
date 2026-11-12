const door=(label,u,v,room)=>({label,u,v,room});
const station=(label,u,v,action,icon='',front=false)=>({label,u,v,action,icon,front});
const photo=(label,u,v,action)=>station(label,u,v,action,'',true);
const fixture=(label,u,v,action,kind)=>({...station(label,u,v,action),fixture:kind});

export const walkRooms={
 hall:{
  name:'Hol główny',art:'hall88.webp',bounds:[7,3.2,6.3],points:[
   door('Sala Treningowa',.50,.423,'training'),
   door('Zbrojownia',.14,.419,'armory'),
   door('Centrum Rozrywki',.745,.428,'arcade'),
   door('Hangar',.871,.425,'hangar'),
   door('Kącik zwierzaka',.046,.563,'pet'),
   door('Wejdź do sklepu',.257,.538,'shop'),
   door('Skarbiec',.365,.49,'vault')
  ]
 },
 training:{
  name:'Sala Treningowa Avengers',art:'training86.webp',heading:.486,minHorizontalFov:.64,bounds:[6.4,2.9,5.8],points:[
   door('Wieża Języka Angielskiego',.055,.43,'english'),
   door('Laboratorium Języka Polskiego',.718,.429,'polish'),
   station('Moje podręczniki',.19,.437,'hq:area:books','📚'),
   fixture('Trening',.564,.445,'hq:training','training'),
   fixture('Misje',.49,.55,'hq:area:home','missions'),
   fixture('Symulator misji',.409,.473,'hq:exercise:mixed','simulator'),
   door('Sala Odkrywców',.803,.395,'explorer'),
   station('Language Master',.947,.476,'hq:master','🏆'),
   station('Mentor',.624,.515,'hq:area:mentor')
  ]
 },
 polish:{
  name:'Laboratorium Gramatyki i Słów',art:'polish86.webp',heading:.826,minHorizontalFov:.62,bounds:[5.4,2.6,5],points:[
   station('Mistrz rzeczowników',.206,.488,'hq:exercise:nouns','🤖'),
   station('Polski z podręcznika',.387,.442,'hq:subject:polish','📖'),
   station('Ortografia U/Ó i RZ/Ż',.675,.479,'hq:exercise:spelling','🧪'),
   fixture('Półka na trofeum',.885,.512,'hq:slot:lab','shelf'),
   door('Warsztat Tony’ego Starka',.766,.435,'workshop')
  ]
 },
 workshop:{
  name:'Warsztat Tony’ego Starka',art:'annex86.webp',portrait:'workshop91.webp',tint:[.88,.97,1.04],bounds:[4.5,2.5,4.5],points:[
   photo('Reaktor warsztatu',.5,.438,'hq:workbench')
  ]
 },
 english:{
  name:'Wieża Języka Angielskiego',art:'english86.webp',bounds:[5.8,2.8,5.3],points:[
   station('Alphabet Challenge',.26,.51,'hq:exercise:alphabet','🔠'),
   station('Słówka z podręcznika',.5,.458,'hq:subject:english','📚'),
   station('Plural Monsters',.75,.501,'hq:exercise:plurals','👾'),
   station('Angielski z podręcznika',.943,.45,'hq:subject:english-training','🎧')
  ]
 },
 armory:{
  name:'Zbrojownia',art:'annex86.webp',portrait:'armory.webp',tint:[1.08,.95,.83],bounds:[4,2.35,3.7],points:[
   photo('Kolekcja zbroi',.5,.259,'hq:gallery'),
   photo('Gablota A',.194,.626,'hq:slot:a'),
   photo('Gablota B',.81,.626,'hq:slot:b'),
   photo('Gablota C',.5,.641,'hq:slot:c'),
   station('Zmień bohatera',.705,.46,'hq:hero','🦸')
  ]
 },
 arcade:{
  name:'Centrum Rozrywki',art:'annex86.webp',portrait:'arcade.webp',tint:[1.1,.84,1.12],bounds:[4.2,2.35,4],points:[
   photo('Automaty',.51,.475,'hq:arcade'),
   photo('Kula sucharów',.49,.671,'hq:joke')
  ]
 },
 explorer:{
  name:'Sala Odkrywców',art:'explorer87.webp',bounds:[5.5,2.8,5.2],points:[
   station('Odkrywaj z globusem',.5,.48,'hq:area:academy','🌍')
  ]
 },
 shop:{
  name:'Sklep',art:'annex86.webp',portrait:'shop87.webp',tint:[.82,1.06,1.08],bounds:[4.2,2.4,4],points:[
   photo('Kup wyposażenie',.5,.56,'hq:shop')
  ]
 },
 vault:{
  name:'Skarbiec',art:'annex86.webp',portrait:'vault87.webp',tint:[.94,.94,1.05],bounds:[4,2.35,3.8],points:[
   photo('Portfel',.5,.60,'hq:wallet')
  ]
 },
 hangar:{
  name:'Hangar',art:'annex86.webp',portrait:'hangar.webp',tint:[.87,1,1.12],bounds:[4.6,2.8,5.1],points:[
   photo('Lądowisko',.5,.65,'hq:hangar'),
   photo('Wsiądź do Quinjeta',.5,.491,'hq:flight')
  ]
 },
 pet:{
  name:'Kącik zwierzaka',art:'annex86.webp',portrait:'nook86.webp',tint:[1.12,.91,.96],bounds:[3.45,2.1,3.4],points:[
   photo('Wybierz zwierzaka',.495,.612,'hq:pet'),
   photo('Gniotek',.815,.584,'hq:egg')
  ]
 }
};

export const FULL_TURN=2*Math.PI;
export const VERTICAL_SCALE=1.36;
export const PHOTO_FOV=.94;
export const FLOOR_DEPTH=1.58;
export const clamp86=(n,min,max)=>Math.max(min,Math.min(max,n));
export const wrapAngle=angle=>Math.atan2(Math.sin(angle),Math.cos(angle));

export function roomRay86(point,portraitRatio){
 if(point.front){
  return [(point.u*2-1)*portraitRatio*PHOTO_FOV,(1-point.v*2)*PHOTO_FOV,1];
 }
 const yaw=(point.u-.5)*FULL_TURN;
 const pitch=(.5-point.v)*Math.PI/VERTICAL_SCALE;
 const flat=Math.cos(pitch);
 return [flat*Math.sin(yaw),Math.sin(pitch),flat*Math.cos(yaw)];
}

export function roomAnchor86(room,point,portraitRatio){
 const ray=roomRay86(point,portraitRatio);
 const distance=Math.min(...ray.map((n,i)=>n===0?Infinity:
  (i===1&&n<0?FLOOR_DEPTH:room.bounds[i])/Math.abs(n)));
 return ray.map(n=>n*distance*.91);
}

export function cameraBasis86(yaw,pitch){
 const sy=Math.sin(yaw),cy=Math.cos(yaw),sp=Math.sin(pitch),cp=Math.cos(pitch);
 return [cy,0,-sy,-sy*sp,cp,-cy*sp,sy*cp,sp,cy*cp];
}

export function advance86(room,pose,distance){
 const [limitX,,limitZ]=room.bounds;
 const x=clamp86(pose.x+Math.sin(pose.yaw)*distance,.9-limitX,limitX-.9);
 const z=clamp86(pose.z+Math.cos(pose.yaw)*distance,.9-limitZ,limitZ-.9);
 const moved=Math.hypot(x-pose.x,z-pose.z);
 pose.x=x;pose.z=z;
 return moved;
}
