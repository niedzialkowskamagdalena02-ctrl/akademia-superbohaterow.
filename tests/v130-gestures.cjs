const assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs');
(async()=>{
 const url=n=>require('node:url').pathToFileURL(path.join(__dirname,'../assets',n));
 const {createHandGestures130,handAction130,heroAbility130,gestureModes130,handAt130,handZones130}=await import(url('hero-gestures130.js'));
 let now=0,id=0;const timers=new Map(),actions=[],equipment=[];
 const advance=ms=>{now+=ms;for(const [id,t]of [...timers])if(t.at<=now){timers.delete(id);t.fn();}};
 const g=createHandGestures130({handAt:e=>e.side??null,act:(side,double)=>actions.push([side,double,now]),equip:up=>equipment.push(up),now:()=>now,later:(fn,ms)=>{timers.set(++id,{fn,at:now+ms});return id;},cancelLater:id=>timers.delete(id)});
 g.tap(-1);advance(249);assert.equal(actions.length,0);advance(1);assert.deepEqual(actions.shift(),[-1,false,250]);
 g.tap(1);advance(100);g.tap(1);assert.equal(actions.length,1);assert.deepEqual(actions.shift(),[1,true,350]);advance(300);assert.equal(actions.length,0,'Double tap never schedules an earlier ordinary punch');
 g.tap(-1);g.tap(1);advance(250);assert.equal(actions.length,2);assert(actions.every(a=>!a[1]));actions.length=0;
 const event=(type,side,x,y)=>({type,button:0,pointerId:1,side,clientX:x,clientY:y});
 for(const dy of [-70,70]){assert(g.down(event('pointerdown',1,300,700)));assert(g.move(event('pointermove',1,300,700+dy)));assert(g.end(event('pointerup',1,300,700+dy)));advance(300);assert.equal(actions.length,0);}assert.deepEqual(equipment,[true,false]);
 g.down(event('pointerdown',-1,80,700));g.move(event('pointermove',-1,200,600));g.end(event('pointerup',-1,200,600));advance(300);assert.equal(actions.length,0);assert.equal(equipment.length,2,'Left swipe does not draw a right-handed weapon');
 assert.equal(g.down(event('pointerdown',null,180,300)),false);assert.equal(g.move(event('pointermove',null,220,300)),false);
 g.tap(1);g.cancel();advance(300);assert.equal(actions.length,0,'No delayed action after leaving the screen');
 g.down(event('pointerdown',1,300,700));g.end(event('pointercancel',1,300,700));advance(300);assert.equal(actions.length,0);
 for(const hero of ['captain','thor','iron','spider'])for(const side of [-1,1])assert.equal(handAction130(hero,side,true,false,false).mode,'punch');
 for(const hero of ['iron','spider'])for(const side of [-1,1])assert.equal(handAction130(hero,side,true,true,false).mode,hero==='iron'?'laser':'web');
 for(const hero of ['captain','thor']){
  assert.equal(handAction130(hero,1,false,true,true).mode,hero==='captain'?'shield-hit':'hammer');
  assert.equal(handAction130(hero,1,true,true,true).mode,hero==='captain'?'shield':'throw');
  assert.deepEqual(handAction130(hero,-1,true,true,true),{mode:'punch',side:-1,preserveOther:true});
  assert.equal(handAction130(hero,1,true,true,false).mode,'punch','A stored weapon must first be drawn with a swipe');
 }
 assert.equal(heroAbility130('iron',['arc']),true);assert.equal(heroAbility130('iron',['armor']),false);assert.equal(heroAbility130('spider',['spiderweb']),true);assert.equal(heroAbility130('spider',['web']),true);assert.equal(heroAbility130('thor',[]),false);assert.equal(heroAbility130('captain',['shield']),true);
 for(const hero of ['hulk','captain','thor','iron','spider'])for(const [w,h]of [[360,800],[800,360],[393,852]])for(const held of [false,true]){
  const zones=handZones130(hero,held,w,h);assert.equal(zones.length,2);
  for(const z of zones){assert(z.right>z.left&&z.bottom>z.top);assert.equal(handAt130(hero,held,(z.left+z.right)/2,(z.top+z.bottom)/2,w,h),z.side);}
  assert.equal(handAt130(hero,held,w*.5,h*.2,w,h),null,'Looking at the room is outside hand zones');
 }
 const {powerMarkup127}=await import(url('hero-animation127.js'));for(const hero of ['hulk','captain','thor','iron','spider'])assert(!/button|data-walk-mode|data-walk-power/.test(powerMarkup127(hero)));
 assert(gestureModes130('captain',true).includes('shield-hit'));
 console.log('PASS V130 gestures: 250 ms single/double separation, one special without an earlier punch, independent hands, swipe/cancel isolation, inventory gates, left punch while armed, no visible power buttons, hand zones in portrait/landscape.');
})().catch(e=>{console.error(e);process.exitCode=1;});
