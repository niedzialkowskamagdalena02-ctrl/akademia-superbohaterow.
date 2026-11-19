const assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs'),{execFileSync}=require('node:child_process');
const {context}=require('./hangar130-dom.cjs'),url=n=>require('node:url').pathToFileURL(path.join(__dirname,'../assets',n));
Object.defineProperty(global,'performance',{value:{now:()=>global.__testTime130||0},configurable:true});
(async()=>{
 const {createProgress130}=await import(url('hangar130-data.js')),{mountBaggage130}=await import(url('hangar130-baggage.js'));
 const c=context('baggage','young',createProgress130({preview:true})),spoken=[];c.speak=t=>spoken.push(t);const game=mountBaggage130(c);
 c.click('load');assert(c.root.textContent.includes('Spróbuj najpierw samodzielnie'));assert(c.root.querySelector('[data-h130="undo"]').disabled);
 c.click('bag:0');assert.equal(c.root.querySelector('[data-bag-drag="0"]').getAttribute('aria-pressed'),'true');c.click('hold:0');c.advance(250);assert.equal(game.snapshot().placed.length,1);
 c.click('undo');assert.equal(game.snapshot().placed.length,0);assert(c.root.querySelector('[data-h130="undo"]').disabled);
 c.click('bag:0');c.click('hold:0');c.advance(250);c.click('unload:0');assert.equal(game.snapshot().placed.length,0);c.click('undo');assert.equal(game.snapshot().placed.length,1);c.click('undo');assert.equal(game.snapshot().placed.length,0);
 // Highlight follows the finger; cancellation changes neither answers nor undo history.
 const bag=c.root.querySelector('[data-bag-drag="0"]'),hold=c.root.querySelector('[data-hold="0"]');c.doc.under=hold;
 c.event('pointerdown',bag,{clientX:0,clientY:0});c.event('pointermove',bag,{clientX:20,clientY:20});assert(hold.classList.contains('h131-drop-target'));
 c.event('pointercancel',bag,{clientX:20,clientY:20});assert(!hold.classList.contains('h131-drop-target'));assert.equal(game.snapshot().placed.length,0);c.advance(400);
 for(let i=0;i<3;i++){c.click('bag:'+i);c.click('hold:0');c.advance(250);}c.click('confirm-bags');c.advance(700);assert.equal(game.snapshot().phase,'cabin');
 assert(c.root.querySelector('[data-h130="undo"]').disabled,'A new stage cannot undo accepted baggage');
 assert(c.root.innerHTML.indexOf('h130-boarding-ticket')<c.root.innerHTML.indexOf('h130-cabin'),'Ticket stays above the seating workspace');
 const person=game.snapshot().task.people[0];c.click('person:'+person.id);const wrong=game.snapshot().task.seats.find(s=>s.id!==person.target).id;c.click('seat:'+wrong);
 assert.equal(spoken.at(-1),'Sprawdź bilet. Miś powinien siedzieć na miejscu numer 2.');assert(c.root.querySelector('[data-h130="undo"]').disabled,'Wrong placement is not recorded as a move');
 c.click('seat:'+person.target);c.advance(250);assert.equal(game.snapshot().people[person.id],person.target);assert(!c.root.querySelector('[data-h130="depart"]').disabled);
 c.click('undo');assert.deepEqual(game.snapshot().people,{});assert(!c.root.querySelector('[data-person-drag="'+person.id+'"]').disabled);assert(c.root.querySelector('[data-h130="depart"]').disabled);
 const data=path.join(__dirname,'../assets/hangar130-data.js');assert.equal(fs.readFileSync(data,'utf8'),execFileSync('git',['show','4ac7bbc3375cb160d2149adb35dc92a7cfc71367:assets/hangar130-data.js'],{cwd:path.join(__dirname,'..'),encoding:'utf8'}),'Exercise data remains unchanged');
 console.log('PASS V131 baggage workspace: reversible loading/unloading and seating; stage isolation; ticket above seats; complete error speech; drag target and cancellation; original task data unchanged.');
})().catch(e=>{console.error(e);process.exitCode=1;});
