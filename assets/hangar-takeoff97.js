import {digitWord96, picture96, ring96} from './hangar-art96.js?v=97';
import {pilotCall97} from './hangar-boarding97.js?v=97';

const positions = [[50,40],[71,25],[30,38],[51,28]];
const clamp = (value, min, max) => Math.min(max,Math.max(min,value));
const ease = value => value*value*(3-2*value);
const lerp = (start,end,ratio) => start+(end-start)*ratio;
const launchPrompt = 'Pociągnij czerwoną dźwignię, aby ruszyć.';
const finishPrompt = 'Wszystkie cyfry zaliczone! Wspaniale, kapitanie!';
const gatePrompt = number => 'Skieruj samolot przez obręcz z cyfrą '+digitWord96(number)+'.';

function aircraft97() {
  return `<div class="flight97-aircraft" data-f97-aircraft aria-hidden="true">
    <span class="flight97-trail flight97-trail-left"></span><span class="flight97-trail flight97-trail-right"></span>
    <span class="flight97-tailplane"></span><span class="flight97-wheel flight97-wheel-left"></span><span class="flight97-wheel flight97-wheel-right"></span>
    <span class="flight97-wing flight97-wing-left"><i></i><b></b></span>
    <span class="flight97-wing flight97-wing-right"><i></i><b></b></span>
    <span class="flight97-fuselage"><i></i></span><span class="flight97-fin"></span>
  </div>`;
}

export function takeoffMarkup97(needed,button) {
  const control=(action,arrow,label)=>button('move:'+action,`<span aria-hidden="true">${arrow}</span>`,
    `aria-label="${label}" title="${label}"`);
  return `<div class="flight95-surface flight97-takeoff" data-f97-phase="ready">
    ${pilotCall97(launchPrompt,'0 / '+needed.length,button)}
    <div class="flight97-window" data-f95-viewport aria-label="Widok z kokpitu. Steruj strzałkami lub przeciągnij po szybie." tabindex="0">
      <div class="flight97-sky" aria-hidden="true"></div>
      <div class="flight97-flight-clouds" aria-hidden="true">
        ${Array.from({length:5},(_,i)=>`<i style="--cloud:${i}"></i>`).join('')}
      </div>
      <div class="flight97-ground" aria-hidden="true">
        <div class="flight97-tarmac">
          ${Array.from({length:8},()=>'<i class="flight97-mark"></i>').join('')}
        </div>
      </div>
      ${needed.map((n,i)=>`<div class="flight97-hoop" data-f97-hoop="${i}" hidden>
        ${button('aim:'+i,`${ring96()}<b>${n}</b>`,`class="flight97-hoop-button" aria-label="Obręcz ${n}" disabled`)}
      </div>`).join('')}
      ${aircraft97()}
      <div class="flight97-cockpit-frame" aria-hidden="true"></div>
      <div class="flight97-sparks" aria-hidden="true"></div>
      <div class="flight97-dashboard" aria-hidden="true">
        ${picture96('instruments','flight97-dash-art')}
        <span class="flight97-status-lights"><i></i><i></i><i></i><i></i></span>
        <span class="flight97-yoke"><i></i><i></i><b></b></span>
      </div>
      <div class="flight96-throttle flight97-throttle" data-f95-lever>
        ${button('lever',`${picture96('lever','flight96-lever-art')}<b>Pociągnij dźwignię</b>`,
         'aria-label="Pociągnij dźwignię w dół"')}
      </div>
    </div>
    <div class="flight97-joystick" aria-label="Sterowanie samolotem">
      ${control('left','◀︎','W lewo')}${control('up','▲','Wyżej')}
      ${button('move:hold','Przeleć obręcz','class="flight95-primary"')}
      ${control('down','▼','Niżej')}${control('right','▶︎','W prawo')}
    </div>
  </div>`;
}

export function mountTakeoff97(root,needed,{onLaunch,onLift,onGate,onFinish}) {
  const stage = root.querySelector('.flight97-takeoff');
  const view = root.querySelector('[data-f95-viewport]');
  const aircraft = root.querySelector('[data-f97-aircraft]');
  const clouds = [...view.querySelectorAll('.flight97-flight-clouds i')];
  const marks = [...view.querySelectorAll('.flight97-mark')];
  const hoops = needed.map((_,i)=>root.querySelector('[data-f97-hoop="'+i+'"]'));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let phase='ready', elapsed=0, skyClock=0, runwayTravel=0, crossing=0, passed=0, raf=0, stopped=false;
  let x=50,y=60,targetX=50,targetY=48, roll=0, scale=.70, engaged=false;
  let last=performance.now();
  const style = (el,name,value) => el.style.setProperty(name,value);

  function setPhase(value) {
    phase=value;
    elapsed=0;
    stage.dataset.f97Phase=value;
  }
  function showGate() {
    hoops.forEach((ring,i)=>{
      ring.hidden=i!==passed && i!==passed-1;
      ring.dataset.f97Gate=i===passed?'current':'passed';
      const control=ring.querySelector('button');
      if (control) control.disabled=i!==passed;
    });
    onGate(passed,gatePrompt(needed[passed]));
  }
  function project(time, progress) {
    const inFlight = phase==='air'||phase==='done';
    const drift = inFlight&&!reduced ? Math.sin(time*1.65) : 0;
    const bank = reduced ? 0 : Math.round((roll+drift*2.1)*10)/10;
    style(view,'--turn',bank*.38+'deg');
    style(view,'--cloud-slide',(Math.sin(time/11)*43-bank*1.5)+'px');
    clouds.forEach((cloud,i)=>{
      const speed = reduced?.14:1.7+i*.75;
      style(cloud,'--cloud-x',(145-((time*speed+i*30)%190))+'%');
    });
    style(view,'--lift',progress);
    style(view,'--runway-flow',(runwayTravel%71)+'px');
    if (phase!=='air'&&phase!=='done') {
      marks.forEach((mark,i)=>{
        const depth = (i/marks.length+runwayTravel/194)%1;
        style(mark,'--mark-depth',depth);
        style(mark,'--mark-y',depth*depth*102+'%');
      });
    }
    style(aircraft,'--plane-x',x+drift*.46+'%');
    style(aircraft,'--plane-y',y+drift*1.3+'%');
    style(aircraft,'--plane-bank',bank+'deg');
    style(aircraft,'--plane-pitch',(reduced?0:(phase==='lift'?-24*progress:clamp((targetY-y)*1.3,-24,24)))+'deg');
    style(aircraft,'--plane-scale',scale);
    for (const index of [passed-1,passed]) {
      if (!hoops[index] || hoops[index].hidden) continue;
      const [gx,gy]=positions[index];
      const cleared=index!==passed;
      const depth=cleared ? 1.2 : .72+.65*crossing;
      style(hoops[index],'--gate-x',clamp(gx+(gx-50)*(depth-1)*.27,15,85)+'%');
      style(hoops[index],'--gate-y',gy+'%');
      style(hoops[index],'--gate-scale',depth);
    }
  }
  function update(now) {
    if (stopped) return;
    const dt=view.ownerDocument.hidden ? 0 : clamp((now-last)/1000,0,.12);
    last=now; elapsed+=dt;
    if (phase==='roll') {
      const progress=clamp(elapsed/1.35,0,1);
      skyClock+=dt*(.20+2.7*progress*progress);
      runwayTravel+=dt*(20+220*progress*progress);
      x=50; y=lerp(60,49,ease(progress)); scale=lerp(.70,.48,progress);
      if (progress===1) setPhase('lift');
    } else if (phase==='lift') {
      const progress=clamp(elapsed/.92,0,1);
      skyClock+=dt*2.6;
      runwayTravel+=dt*240;
      y=lerp(49,48-8,ease(progress)); scale=lerp(.48,.74,ease(progress));
      project(skyClock,ease(progress));
      if (progress===1) {
        setPhase('air');
        y=48;
        onLift();
        showGate();
      }
    } else if (phase==='air') {
      skyClock+=dt*(engaged?2.7:1);
      const [gx,gy]=positions[passed];
      const near=engaged&&Math.abs(x-gx)<7&&Math.abs(y-gy)<7;
      crossing=clamp(crossing+dt*(near?.92:-.42),0,1);
      roll=lerp(roll,clamp((targetX-x)*1.45,-32,32),Math.min(dt*5,1));
      x=lerp(x,targetX,Math.min(dt*4,1));
      y=lerp(y,targetY,Math.min(dt*4,1));
      scale=.78-.24*crossing;
      if (crossing===1) {
        hoops[passed].dataset.f97Gate='passed';
        passed+=1;
        engaged=false; crossing=0;
        if (passed===needed.length) {
          stage.dataset.f97Final='yes';
          hoops[passed-1].querySelector('button').disabled=true;
          setPhase('done');
          onFinish(finishPrompt);
        } else {
          showGate();
        }
      }
    } else if (phase==='done') {
      skyClock+=dt*1.1;
      x=lerp(x,61,Math.min(dt*1.3,1)); y=lerp(y,39,Math.min(dt*1.25,1));
      roll=lerp(roll,9,Math.min(dt*1.5,1));
      scale=lerp(scale,.46,Math.min(dt*1.1,1));
    } else skyClock+=dt*.34;

    if (phase!=='lift') project(skyClock,phase==='air'||phase==='done'?1:0);
    raf=requestAnimationFrame(update);
  }
  const align = (nextX,nextY) => {
    if (phase!=='air') return;
    targetX=clamp(nextX,19,81);
    targetY=clamp(nextY,17,61);
    engaged=true;
  };
  project(0,0);
  raf=requestAnimationFrame(update);
  return {
    launch(){
      if(phase!=='ready')return;
      setPhase('roll');
      onLaunch('Silniki pracują. Rozpędzamy się!');
    },
    aim(index){
      if(index===passed&&positions[index]) align(...positions[index]);
    },
    steer(direction) {
      if (direction==='hold') { if (positions[passed]) align(...positions[passed]); return; }
      const dx=direction==='left'?-11:direction==='right'?11:0;
      const dy=direction==='up'?-8:direction==='down'?8:0;
      align(targetX+dx,targetY+dy);
    },
    steerTo(atY, atX = targetX) { align(atX,atY); },
    stop() { stopped=true;cancelAnimationFrame(raf); }
  };
}
