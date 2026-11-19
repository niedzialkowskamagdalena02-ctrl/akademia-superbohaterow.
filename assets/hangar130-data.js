// Mission IDs and old profile data stay intact. Only the four cockpit games use these rules.
export const gameIds130 = ['baggage','takeoff','airballs','engine'];
export const modeNames130 = {young:'Młody pilot',captain:'Kapitan Paweł'};
export const cities130 = ['Nowy Jork','Paryż','Londyn','Rzym','Tokio'];
export const destinations130 = ['Nowego Jorku','Paryża','Londynu','Rzymu','Tokio'];
function dotHint(prompt){
 const m=prompt.match(/^(\d+) ([+−×]) (\d+) =/);if(!m)return 'Najpierw oblicz działanie w nawiasie, potem dodaj lub odejmij pozostałą liczbę.';
 const [,a,op,b]=m,one=Number(a),two=Number(b),dots=n=>'●'.repeat(Math.min(n,12));
 if(op==='+')return `Połącz dwie grupy: ${dots(one)} + ${dots(two)}. Policz razem.`;
 if(op==='−')return `Zacznij od ${a} kropek: ${dots(one)}. Skreśl ${b} i policz pozostałe.`;
 return `Narysuj ${a} grup po ${b} kropek.${one<=5&&two<=6?' '+Array.from({length:one},()=>dots(two)).join(' / '):' Dodawaj po '+b+'.'}`;
}
const t = (prompt,answer,equation=prompt.replace(' = ?','')+' = '+answer,hint=dotHint(prompt)) => ({prompt,answer,equation,hint});
export function tasks130(game,mode) {
 const captain=mode==='captain';
 if(game==='takeoff')return captain ? [t('4 × 4 = ?',16),t('6 × 3 = ?',18),t('7 × 4 = ?',28),t('6 × 6 = ?',36),t('7 × 8 = ?',56),t('8 × 9 = ?',72),t('Jakiej liczby brakuje? 6 × □ = 42',7,'6 × 7 = 42','Policz, ile szóstek daje 42.'),t('Jakiej liczby brakuje? □ × 8 = 48',6,'6 × 8 = 48','Policz, ile ósemek daje 48.'),t('(4 × 5) + 3 = ?',23),t('(7 × 6) − 5 = ?',37),t('10 × 10 = ?',100)]
 : [t('2 + 1 = ?',3),t('5 − 2 = ?',3),t('8 − 4 = ?',4),t('4 + 5 = ?',9),t('11 − 4 = ?',7),t('10 + 5 = ?',15),t('2 × 2 = ?',4),t('2 × 4 = ?',8),t('3 × 3 = ?',9),t('4 × 3 = ?',12),t('5 × 4 = ?',20)];
 if(game==='engine')return captain ? [t('4 × 6 = ?',24),t('7 × 5 = ?',35),t('8 × 7 = ?',56),t('Jakiej liczby brakuje? 6 × □ = 42',7,'6 × 7 = 42','Dodawaj szóstki do 42. Ile ich potrzebujesz?'),t('4 rzędy po 6 foteli, 3 puste. Ilu pasażerów?',21,'4 × 6 − 3 = 21','Najpierw policz wszystkie fotele: 4 × 6. Odejmij 3 puste.'),t('5 luków po 8 miejsc. Załadowano 27 walizek. Ile jeszcze?',13,'5 × 8 − 27 = 13','Pojemność to 5 × 8. Odejmij 27 załadowanych walizek.')]
 : [t('4 + 3 = ?',7),t('12 − 5 = ?',7),t('2 × 3 = ?',6),t('3 × 3 = ?',9),t('4 × 4 = ?',16),t('5 × 6 = ?',30)];
 if(game==='airballs')return captain ? [t('4 × 3 = ?',12),t('15 − 7 = ?',8),t('6 × 4 = ?',24),t('7 × 5 = ?',35),t('6 × □ = 42. Jaka liczba?',7,'6 × 7 = 42'),t('10 × 10 = ?',100)]
 : [1,2,3,4,5,6].map(n=>t('Traf balon z liczbą '+n,n,'To liczba '+n));
 return [];
}
export function choices130(answer,count=3,random=Math.random) {
 const values=new Set([answer]);
 for(const v of [answer+1,Math.max(0,answer-1),answer+2]) {if(values.size>=count)break;values.add(v);}
 const a=[...values];for(let i=a.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;
}
export const clamp130=(v,min=0,max=1)=>Math.max(min,Math.min(max,v));
export function ellipse130(x,y,cx,cy,rx,ry){return ((x-cx)/rx)**2+((y-cy)/ry)**2<=1;}
// The luminous ring is wider than its opening. A wingtip grazing the rim is not a pass.
export function ringPass130(planeX,ringX,openingRadius,halfPlaneWidth=0.035){return Math.abs(planeX-ringX)+halfPlaneWidth<=openingRadius;}
export function balloonHit130(x,y,b){return ellipse130(x,y,b.x,b.y-.035,b.w*.37,b.h*.32);}
export function cloudHit130(x,y,c){return [[-.025,.005,.060,.058],[.028,-.013,.048,.068],[.069,.009,.04,.046]].some(([dx,dy,rx,ry])=>ellipse130(x,y,c.x+dx,c.y+dy,rx,ry));}

const bag=(label,color='purple')=>({label:String(label),color});
const pool=(values,color)=>values.map((v,i)=>bag(v,color||['purple','green','blue'][i%3]));
const seat=(id,row,side,pos=0)=>({id:String(id),row,side,pos});
const four=[seat(1,1,'left',0),seat(2,1,'left',1),seat(3,1,'right',0),seat(4,1,'right',1)];
const person=(id,name,target,ticket=target)=>({id,name,target:String(target),ticket:String(ticket)});
export function boarding130(mode,flight) {
 const captain=mode==='captain';
 const base={flight,city:cities130[flight],holds:1,capacity:[8],occupied:[0],count:3,rule:'any',pool:[],seats:four,people:[],hint:'Wybierz walizkę, potem luk. Możesz też przeciągnąć ją palcem.'};
 const young=[
  {prompt:'Załaduj trzy walizki K.',pool:pool(['K','K','K','M','S']),rule:'letters',wanted:['K','K','K'],people:[person('mis','Miś',2)]},
  {prompt:'Załaduj dwie walizki M i jedną S.',pool:pool(['M','M','S','K','T']),rule:'letters',wanted:['M','M','S'],people:[person('kot','Kot',4)]},
  {prompt:'Załaduj A, B, C w tej kolejności.',pool:pool(['C','A','D','B','K']),rule:'order',wanted:['A','B','C'],people:[person('mis','Miś',1),person('kot','Kot',2,'Obok misia, po tej samej stronie przejścia')],hint:'Najpierw A, potem B, na końcu C. Kot i miś siedzą obok siebie, bez przejścia między nimi.'},
  {prompt:'Załaduj trzy walizki R.',pool:pool(['R','R','R','S','T']),rule:'letters',wanted:['R','R','R'],seats:[seat('1A',1,'left'),seat('1B',1,'right'),seat('2A',2,'left'),seat('2B',2,'right')],people:[person('mis','Miś','2A','Rząd 2, lewa strona'),person('kot','Kot','2B','Rząd 2, prawa strona')]},
  {prompt:'Załaduj cztery walizki T.',pool:pool(['T','S','T','T','K','T']),count:4,rule:'letters',wanted:['T','T','T','T'],people:[person('mis','Miś',1),person('kot','Kot',2),person('pies','Pies',4)]}
 ];
 const advanced=[
  {prompt:'Załaduj 2 × 3 walizki z puli ośmiu.',pool:pool([1,2,3,4,5,6,7,8]),count:6,seats:[seat(6,1,'left'),seat(8,1,'left',1),seat(9,1,'right'),seat(12,1,'right',1)],people:[person('mis','Miś',9,'3 × 3')],hint:'Dwie grupy po trzy walizki. Miejsce misia: trzy razy trzy.'},
  {prompt:'Rozłóż 12 walizek po równo do 3 luków.',pool:pool(Array.from({length:12},(_,i)=>i+1)),count:12,holds:3,capacity:[4,4,4],occupied:[0,0,0],rule:'equal',people:[person('kot','Kot',4,'Tyle, ile walizek w jednym luku')],hint:'Rozkładaj po jednej: luk 1 → luk 2 → luk 3. Powtórz cztery razy. ● → 1 · ● → 2 · ● → 3'},
  {prompt:'Wybierz wielokrotności 4: 4, 6, 8, 10, 12.',pool:pool([4,6,8,10,12]),count:3,rule:'multiples',seats:[seat(4,1,'left'),seat(8,1,'left',1),seat(10,1,'right'),seat(12,1,'right',1)],people:[person('mis','Miś',12,'Największa liczba na wybranej walizce')],hint:'Licz co cztery: 4, 8, 12. Znajdź największą z wybranych liczb.'},
  {prompt:'Załaduj cztery CZERWONE walizki z PARZYSTYMI numerami.',pool:[...pool([2,4,6,8,3],'red'),...pool([10,12],'blue')],count:4,rule:'redEven',seats:[seat('11A',11,'left'),seat('11B',11,'left',1),seat('12A',12,'right',1),seat('12B',12,'right')],people:[person('kot','Kot','12A','Rząd 3 × 4, A — przy oknie'),person('mis','Miś','12B','Rząd 3 × 4, B — obok kota')],hint:'CZERWONA i parzysta: oba warunki naraz. Rząd 3 × 4 to 12. A jest przy oknie.'},
  {prompt:'4 luki po 5 miejsc, 13 zajętych. Dołóż brakujące walizki.',pool:pool([1,2,3,4,5,6,7,8,9]),count:7,holds:4,capacity:[5,5,5,5],occupied:[4,3,3,3],rule:'fill',seats:[seat(8,1,'left'),seat(9,1,'left',1),seat(10,1,'right'),seat(12,1,'right',1)],people:[person('mis','Miś',8,'2 × 4'),person('kot','Kot',9,'3 × 3'),person('pies','Pies',12,'2 × 6')],hint:'Razem jest 4 × 5 miejsc. Odejmij 13 zajętych. W każdym luku jest najwyżej 5 walizek.'}
 ];
 return {...base,...(captain?advanced:young)[flight]};
}
export function bagAllowed130(task,placed,index) {
 const item=task.pool[index];if(!item||placed.some(p=>p.index===index))return false;
 if(placed.length>=task.count)return false;
 if(task.rule==='letters')return task.wanted.filter(v=>v===item.label).length>placed.filter(p=>task.pool[p.index].label===item.label).length;
 if(task.rule==='order')return item.label===task.wanted[placed.length];
 if(task.rule==='multiples')return Number(item.label)%4===0;
 if(task.rule==='redEven')return item.color==='red'&&Number(item.label)%2===0;
 return true;
}
export function baggageValid130(task,placed) {
 if(placed.length!==task.count||new Set(placed.map(p=>p.index)).size!==placed.length)return false;
 const checked=[];for(const p of placed){if(!Number.isInteger(p.hold)||p.hold<0||p.hold>=task.holds||!bagAllowed130(task,checked,p.index))return false;checked.push(p);}
 const counts=task.capacity.map((_,i)=>placed.filter(p=>p.hold===i).length+(task.occupied[i]||0));
 return counts.every((n,i)=>n<=task.capacity[i])&&(task.rule!=='equal'||counts.every(n=>n===task.count/task.holds))&&(task.rule!=='fill'||counts.every((n,i)=>n===task.capacity[i]));
}
export function seatsValid130(task,placed){return task.people.every(p=>placed[p.id]===p.target)&&new Set(Object.values(placed)).size===task.people.length;}

export function createProgress130({profileKey='default',preview=false,getProgress=()=>({}),onProgress=()=>{},storage=globalThis.localStorage}={}) {
 const key='academy-hangar130-'+profileKey;
 let local={};if(!preview)try{local=JSON.parse(storage?.getItem(key)||'{}')||{};}catch{}
 const read=()=>({...local,...(preview?{}:getProgress()||{})});
 function write(fn){const p=read();fn(p);local=p;if(!preview){try{storage?.setItem(key,JSON.stringify(p));}catch{}onProgress(p);}return p;}
 return {read,
  round(game,mode,n){return write(p=>{const k=game+':'+mode;const v=p[k]||{};p[k]={...v,round:Math.max(v.round||0,n)};});},
  complete(game,mode){let fresh=false;write(p=>{const k=game+':'+mode;fresh=!p[k]?.complete;p[k]={...p[k],complete:true};});return fresh;},
  stamp(mode,flight){let fresh=false;write(p=>{const stamps={...p.stamps};const k=mode+':'+flight;fresh=!stamps[k];stamps[k]=true;p.stamps=stamps;});return fresh;},
  unlocked(){const s=read().stamps||{};let n=0;while(n<4&&(s['young:'+n]||s['captain:'+n]))n++;return n;}
 };
}
