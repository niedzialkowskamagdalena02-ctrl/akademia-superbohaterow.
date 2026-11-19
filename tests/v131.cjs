const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {fixture,context}=require('./hangar130-dom.cjs'),url=n=>require('node:url').pathToFileURL(path.join(__dirname,'../assets',n));
(async()=>{
 const {speechText131,speak}=await import(url('voice.js'));
 for(const [text,expected]of [['2 × 3','2 razy 3'],['5×7','5 razy 7'],['5 * 7','5 razy 7'],['2 x 3 x 4','2 razy 3 razy 4'],['**2 × 3**','2 razy 3']])assert.equal(speechText131(text),expected);
 assert.equal(speechText131('box, fox, six','en-GB'),'box, fox, six');assert.equal(speechText131('2 × 3','en-GB'),'2 × 3');
 const spoken=[];global.window={speechSynthesis:{cancel(){},getVoices(){return [{lang:'pl-PL'}];},speak:u=>spoken.push(u.text)}};global.SpeechSynthesisUtterance=class{constructor(text){this.text=text;}};speak('2 × 3');assert.equal(spoken[0],'2 razy 3');
 const {walkHelpHidden131,hideWalkHelp131}=await import(url('walk-ui131.js')),map=new Map(),store={getItem:k=>map.get(k),setItem:(k,v)=>map.set(k,v)};
 assert.equal(walkHelpHidden131('pawel',store),false);hideWalkHelp131('pawel',store);assert(walkHelpHidden131('pawel',store));assert(!walkHelpHidden131('patryk',store));
 const {heroAbility130}=await import(url('hero-gestures130.js'));
 for(const child of ['pawel','patryk'])for(const hero of ['iron','spider'])assert(heroAbility130(hero,[],child));assert(!heroAbility130('captain',[],'pawel'));assert(!heroAbility130('thor',[],'patryk'));assert(!heroAbility130('iron',[],'other'));
 const {createProgress130}=await import(url('hangar130-data.js')),progress=createProgress130({preview:true});
 const {mountBaggage130}=await import(url('hangar130-baggage.js')),c=context('baggage','young',progress),speech=[];c.speak=t=>speech.push(t);const game=mountBaggage130(c);
 assert(!c.root.querySelector('[data-h130^="difficulty:"]'));assert(!c.root.textContent.includes('Miś: 2'));c.click('load');
 // Complete the original baggage task, then check ticket UI rather than changing its rules.
 for(let i=0;i<3;i++){c.click('bag:'+i);c.click('hold:0');c.advance(250);}c.click('confirm-bags');c.advance(700);
 assert.equal(c.root.querySelectorAll('[data-person-drag]').length,3);assert(c.root.textContent.includes('Wybierz pasażera, aby zobaczyć jego miejsce.'));c.click('person:mis');assert(speech.at(-1).includes('powinien siedzieć na miejscu numer 2'));c.click('person:guest-kot');assert(speech.at(-1).includes('inny lot'));assert.equal(Object.keys(game.snapshot().people).length,0);
 const {mountBalloons130}=await import(url('hangar130-balloons.js')),b=context('airballs','young',progress),balloons=mountBalloons130(b);
 assert(!b.root.querySelector('.h130-controls'));const board=b.root.querySelector('[data-h130-board]'),plane=b.root.querySelector('[data-h130="plane-fire"]');
 b.event('pointerdown',plane,{clientX:144,clientY:240});b.event('pointerup',plane,{clientX:144,clientY:240});assert(balloons.snapshot().bullet,'Tap on plane fires');
 const retry=context('airballs','young',progress),g=mountBalloons130(retry),p=retry.root.querySelector('[data-h130="plane-fire"]'),view=retry.root.querySelector('[data-h130-board]');
 retry.event('pointerdown',p,{clientX:144,clientY:240});retry.event('pointermove',p,{clientX:144,clientY:170});retry.event('pointerup',p,{clientX:144,clientY:170});retry.advance(100);assert(!g.snapshot().bullet,'Dragging the plane does not fire');assert(g.snapshot().y<.53);
 // A click inherited from boarding the plane cannot immediately choose a game.
 global.requestAnimationFrame=()=>1;global.cancelAnimationFrame=()=>{};global.Image=class{set src(v){queueMicrotask(()=>this.onload?.());}async decode(){}};global.matchMedia=()=>({matches:false});
 const {mountHangar130}=await import(url('hangar130.js')),f=fixture(),ui=mountHangar130(f.root,{grade:'P',preview:true});
 let tile=f.root.querySelector('[data-h130="game:airballs"]');f.event('click',tile,{detail:1});assert(f.root.querySelector('.h130-menu'));
 f.event('pointerdown',tile);f.event('click',tile,{detail:1});assert(f.root.querySelector('.h130-modes'));ui.stop();
 const css=fs.readFileSync(path.join(__dirname,'../assets/base-fixes131.css'),'utf8');assert(css.includes('color:#f4fbff!important'));assert(css.includes('[data-walk-hide-help]'));
 console.log('PASS V131 technical fixes: real Polish utterance reads multiplication as razy; free hand powers for both children without purchases; per-child closable help, visible navigation styles, cockpit click-through guard, no repeated level picker, ticket auto-reading and existing animal choices, larger tap-to-fire plane with drag/fire separation.');
})().catch(e=>{console.error(e);process.exitCode=1;});
