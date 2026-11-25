import {frameRect127} from './hero-animation127.js?v=142';

export const DOUBLE_TAP130=250;
// Existing inventory IDs, including the older training-web item.
export const freeHandPowers131=Object.freeze(['pawel','patryk']);
export function heroAbility130(hero,owned=[],child=''){
 if(['iron','spider'].includes(hero)&&freeHandPowers131.includes(child))return true;
 const has=id=>owned.includes(id);
 return hero==='hulk'||hero==='captain'&&has('shield')||hero==='thor'&&has('thorhammer')||hero==='iron'&&has('arc')||hero==='spider'&&(has('spiderweb')||has('web'));
}
export function gestureModes130(hero,unlocked){
 return ['punch',...(hero==='hulk'?['slam']:!unlocked?[]:hero==='captain'?['shield','shield-hit']:hero==='thor'?['hammer','throw']:hero==='iron'?['laser']:hero==='spider'?['web']:[])];
}
export function handAction130(hero,side,double,unlocked,held){
 let mode='punch';
 if(side===1&&held)mode=hero==='captain'?'shield-hit':hero==='thor'?'hammer':'punch';
 if(double&&unlocked){
  if(hero==='hulk')mode='slam';
  if(hero==='captain'&&held&&side===1)mode='shield';
  if(hero==='thor'&&held&&side===1)mode='throw';
  if(hero==='iron')mode='laser';
  if(hero==='spider')mode='web';
 }
 return {mode,side,preserveOther:side===-1&&held};
}
// Normalised hand regions in the supplied idle PNGs. Weapon heads and forearms
// are deliberately outside these zones; touching the rest of the room still looks/walks.
const regions={
 hulk:[[.055,.424,.441,.84],[.559,.424,.945,.84]],
 captain:[[.10,.585,.395,.90],[.564,.397,.95,.82]],
 'captain-held':[[.068,.665,.347,.96],[.61,.43,.89,.76]],
 thor:[[.143,.412,.472,.81],[.524,.411,.85,.81]],
 'thor-held':[[.143,.414,.47,.81],[.67,.40,.89,.75]],
 iron:[[.092,.537,.416,.90],[.585,.40,.94,.82]],
 spider:[[.124,.576,.417,.91],[.553,.44,.972,.83]]
};
export function handZones130(hero,held,width,height){
 const source=regions[hero+(held?'-held':'')]||regions[hero];if(!source)return [];
 const box=frameRect127(width,height);
 return source.map(([x,y,x1,y1],i)=>({side:i?1:-1,left:Math.max(0,box.x+x*box.w),top:Math.max(0,box.y+y*box.h),right:Math.min(width,box.x+x1*box.w),bottom:Math.min(height,box.y+y1*box.h)}));
}
export function handAt130(hero,held,x,y,width,height){return handZones130(hero,held,width,height).find(r=>x>=r.left&&x<=r.right&&y>=r.top&&y<=r.bottom)?.side??null;}

export function createHandGestures130({handAt,act,equip,now=()=>performance.now(),later=setTimeout,cancelLater=clearTimeout,windowMs=DOUBLE_TAP130}={}){
 const pointers=new Map(),pending=new Map();let suppressedUntil=0;
 function clear(side){const item=pending.get(side);if(item)cancelLater(item.timer);pending.delete(side);}
 function tap(side){
  const previous=pending.get(side),at=now();
  if(previous&&at-previous.at<=windowMs){clear(side);act(side,true);return;}
  if(previous){clear(side);act(side,false);}
  const item={at,timer:null};pending.set(side,item);
  item.timer=later(()=>{if(pending.get(side)!==item)return;pending.delete(side);act(side,false);},windowMs);
 }
 function cancel(){for(const side of pending.keys())clear(side);pointers.clear();}
 return {tap,cancel,
  down(e){if(e.button!==0)return false;const side=handAt(e);if(side===null)return false;pointers.set(e.pointerId,{side,x:e.clientX,y:e.clientY,dx:0,dy:0,moved:false});return true;},
  move(e){const p=pointers.get(e.pointerId);if(!p)return false;p.dx=e.clientX-p.x;p.dy=e.clientY-p.y;if(Math.hypot(p.dx,p.dy)>9){p.moved=true;clear(p.side);}return true;},
  end(e){
   const p=pointers.get(e.pointerId);if(!p)return false;pointers.delete(e.pointerId);suppressedUntil=now()+450;
   if(e.type==='pointercancel'){clear(p.side);return true;}
   const dx=e.clientX-p.x,dy=e.clientY-p.y,moved=p.moved||Math.hypot(dx,dy)>9;
   if(moved){clear(p.side);if(p.side===1&&Math.abs(dy)>=32&&Math.abs(dy)>Math.abs(dx)*1.25)equip(dy<0);}
   else tap(p.side);
   return true;
  },
  suppressClick(){return now()<suppressedUntil;},get touching(){return pointers.size>0;}
 };
}
