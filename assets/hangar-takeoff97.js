import {digitWord96, picture96, ring96} from './hangar-art96.js?v=104';
import {pilotCall97} from './hangar-boarding97.js?v=104';

const positions = {1:[[50,35]],2:[[29,36],[71,30]],3:[[21,38],[50,25],[79,38]]};
const clamp = (value, min, max) => Math.min(max,Math.max(min,value));
const ease = value => value*value*(3-2*value);
const lerp = (start,end,ratio) => start+(end-start)*ratio;
const launchPrompt = 'Pociągnij czerwoną dźwignię, aby ruszyć.';
const finishPrompt = 'Wszystkie obręcze zaliczone! Wspaniale, kapitanie!';
const gatePrompt = digit => 'Przeleć przez obręcz z cyfrą '+digit+'.';

function aircraft97() {
  return `<div class="flight97-aircraft" data-f97-aircraft aria-hidden="true">
    <span class="flight97-trail flight97-trail-left"></span><span class="flight97-trail flight97-trail-right"></span>
    <span class="flight97-tailplane"></span><span class="flight97-wheel flight97-wheel-left"></span><span class="flight97-wheel flight97-wheel-right"></span>
    <span class="flight97-wing flight97-wing-left"><i></i><b></b></span>
    <span class="flight97-wing flight97-wing-right"><i></i><b></b></span>
    <span class="flight97-fuselage"><i></i></span><span class="flight97-fin"></span>
  </div>`;
}

export function takeoffMarkup97({needed,gates},button) {
  return `<div class="flight95-surface flight97-takeoff" data-f97-phase="ready">
    ${pilotCall97(launchPrompt,'0 / '+needed.length,button)}
    <div class="flight97-window" data-f95-viewport aria-label="Przeciągnij samolot palcem do wybranej obręczy. Na klawiaturze użyj strzałek." tabindex="0">
      <div class="flight97-sky" aria-hidden="true"></div>
      <div class="flight97-airflow" aria-hidden="true"></div>
      <div class="flight97-flight-clouds" aria-hidden="true">
        ${Array.from({length:5},(_,i)=>`<i style="--cloud:${i}"></i>`).join('')}
      </div>
      <div class="flight97-ground" aria-hidden="true">
        <div class="flight97-tarmac">
          ${Array.from({length:8},()=>'<i class="flight97-mark"></i>').join('')}
        </div>
      </div>
      ${gates.map((digits,round)=>digits.map((digit,i)=>{
        const [x,y]=positions[digits.length][i];
        return `<div class="flight97-hoop" data-f97-hoop="${round}:${i}" data-f97-lane="${i}"
          style="--gate-x:${x}%;--gate-y:${y}%" hidden>
          ${button('aim:'+i,`${ring96()}<b>${digit}</b>`,`class="flight97-hoop-button" aria-label="Obręcz ${digit}"`)}
        </div>`;
      }).join('')).join('')}
      ${aircraft97()}
      <div class="flight97-cockpit-frame" aria-hidden="true"></div>
      <div class="flight97-sparks" aria-hidden="true"></div>
      <div class="flight97-dashboard">
        ${picture96('instruments','flight97-dash-art')}
        <span class="flight97-status-lights" aria-hidden="true"><i></i><i></i><i></i><i></i></span>
        <span class="flight97-yoke" aria-hidden="true"><i></i><i></i><b></b></span>
        <div class="flight97-throttle" data-f95-lever>
          ${button('lever','<span class="flight97-lever-arm" aria-hidden="true"></span>',
            'aria-label="Pociągnij dźwignię w dół"')}
        </div>
      </div>
    </div>
  </div>`;
}

export function mountTakeoff97(root,{needed,gates,problems},{onLaunch,onGate,onFinish}) {
  const stage = root.querySelector('.flight97-takeoff');
  const view = root.querySelector('[data-f95-viewport]');
  const aircraft = root.querySelector('[data-f97-aircraft]');
  const clouds = [...view.querySelectorAll('.flight97-flight-clouds i')];
  const marks = [...view.querySelectorAll('.flight97-mark')];
  const hoops = gates.map((digits,round)=>digits.map((_,i)=>root.querySelector(`[data-f97-hoop="${round}:${i}"]`)));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let phase='ready', elapsed=0, skyClock=0, runwayTravel=0, crossing=0, passed=0, raf=0, stopped=false;
  let x=50,y=60,targetX=50,targetY=48, roll=0, scale=.70, engaged=false, approached=-1;
  let wrong=-1, retryAt=0, speed=0;
  let last=performance.now();
  const style = (el,name,value) => el.style.setProperty(name,value);

  function setPhase(value) {
    phase=value;
    elapsed=0;
    stage.dataset.f97Phase=value;
  }
  function announceGate(retry = false) {
    const problem=problems?.[passed];
    const digit=needed[passed];
    const prefix=retry?'Spróbuj jeszcze raz. ':'';
    const prompt=problem?`Ile to ${problem.expression}? Przeleć przez obręcz z wynikiem.`:gatePrompt(digit);
    const speech=problem?`Ile to ${problem.speech}? Przeleć przez obręcz z wynikiem.`:gatePrompt(digitWord96(digit));
    onGate(passed,prefix+prompt,retry,prefix+speech);
  }
  function showGate() {
    hoops[passed].forEach(ring=>{ ring.hidden=false; });
    announceGate();
  }
  function project(time, progress) {
    const inFlight = phase==='air'||phase==='done';
    const drift = inFlight&&!reduced ? Math.sin(time*1.65) : 0;
    const bank = reduced ? 0 : Math.round((roll+drift*2.1)*10)/10;
    style(view,'--turn',bank*.38+'deg');
    style(view,'--flight-speed',speed.toFixed(3));
    style(view,'--air-flow',(time*95%300)+'px');
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
    hoops[passed]?.forEach((ring,i)=>style(ring,'--gate-scale',.81+(i===approached?.39*crossing:0)));
  }
  function crossGate(index) {
    engaged=false; crossing=0; approached=-1;
    if (gates[passed][index]!==needed[passed]) {
      wrong=index;
      retryAt=elapsed+.6;
      hoops[passed][index].dataset.f97Gate='wrong';
      announceGate(true);
      return;
    }
    const lastRound=passed+1===needed.length;
    hoops[passed].forEach((ring,i)=>{
      ring.hidden=!lastRound||i!==index;
      if(!ring.hidden)ring.querySelector('button').disabled=true;
    });
    passed+=1;
    wrong=-1;
    if (!lastRound) { showGate(); return; }
    stage.dataset.f97Final='yes';
    setPhase('done');
    onFinish(finishPrompt);
  }

  function update(now) {
    if (stopped) return;
    const dt=view.ownerDocument.hidden ? 0 : clamp((now-last)/1000,0,.12);
    last=now; elapsed+=dt;
    if (phase==='roll') {
      const progress=clamp(elapsed/1.35,0,1);
      speed=lerp(.12,1,ease(progress));
      skyClock+=dt*(.34+2.8*speed);
      runwayTravel+=dt*(20+300*speed);
      x=50; y=lerp(60,49,ease(progress)); scale=lerp(.70,.48,progress);
      if (progress===1) setPhase('lift');
    } else if (phase==='lift') {
      const progress=clamp(elapsed/.92,0,1);
      skyClock+=dt*3.2;
      runwayTravel+=dt*320;
      y=lerp(49,48-8,ease(progress)); scale=lerp(.48,.74,ease(progress));
      project(skyClock,ease(progress));
      if (progress===1) {
        setPhase('air');
        y=48;
        showGate();
      }
    } else if (phase==='air') {
      speed=lerp(speed,1+passed*.065,Math.min(dt*2.8,1));
      skyClock+=dt*(engaged?3.1:2.2)*speed;
      roll=lerp(roll,clamp((targetX-x)*1.45,-32,32),Math.min(dt*5,1));
      x=lerp(x,targetX,Math.min(dt*4,1));
      y=lerp(y,targetY,Math.min(dt*4,1));
      if (wrong>=0 && elapsed>=retryAt) {
        delete hoops[passed][wrong].dataset.f97Gate;
        wrong=-1;
      }
      const near=engaged&&wrong<0
        ? positions[gates[passed].length].findIndex(([gx,gy])=>Math.abs(x-gx)<7&&Math.abs(y-gy)<7) : -1;
      if (near!==approached) { crossing=0; approached=near; }
      if (near>=0) crossing=clamp(crossing+dt*1.6*speed,0,1);
      scale=.78-.24*crossing;
      if (crossing===1) crossGate(near);
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
      root.querySelector('[data-f95-action="lever"]').disabled=true;
      onLaunch('Silniki pracują. Rozpędzamy się!');
    },
    aim(index){
      const point=positions[gates[passed]?.length]?.[index];
      if(point)align(...point);
    },
    steer(direction) {
      const dx=direction==='left'?-11:direction==='right'?11:0;
      const dy=direction==='up'?-8:direction==='down'?8:0;
      align(targetX+dx,targetY+dy);
    },
    steerTo(atY, atX = targetX) { align(atX,atY); },
    stop() { stopped=true;cancelAnimationFrame(raf); }
  };
}
