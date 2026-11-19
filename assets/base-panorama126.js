import {FLOOR_DEPTH} from './base-map86.js?v=95';
export {placeHallHit120} from './base-panorama120.js?v=120';

export const hallFaces126=['px','nx','py','ny','pz','nz'].map(n=>'panorama126/'+n+'.webp');
// Insets of the existing empty painted boards. Text alone goes inside these
// frames: no extra panel artwork is layered over the supplied photograph.
export const hallBoards126={
 hangar:[[260,1666],[700,1629],[690,1724],[250,1771]],
 pet:[[1040,1625],[1480,1594],[1480,1675],[1050,1708]],
 armory:[[1640,1590],[2070,1574],[2070,1644],[1640,1664]],
 shop:[[2250,1565],[2880,1565],[2880,1635],[2250,1630]],
 training:[[2870,2175],[3830,2165],[3830,2340],[2870,2360]],
 vault:[[3660,1565],[4045,1575],[4035,1650],[3670,1640]],
 arcade:[[5405,1640],[5960,1680],[5960,1767],[5405,1710]]
};
export function hallSurface120(room,u,v){
 const yaw=(u-.5)*2*Math.PI,pitch=(.5-v)*Math.PI;
 const ray=[Math.cos(pitch)*Math.sin(yaw),Math.sin(pitch),Math.cos(pitch)*Math.cos(yaw)];
 const distance=Math.min(...ray.map((n,i)=>Math.abs(n)<1e-9?Infinity:(i===1&&n<0?FLOOR_DEPTH:room.bounds[i])/Math.abs(n)));
 return ray.map(n=>n*distance);
}
export function hallPoint120(point){
 const board=hallBoards126[point.room];if(!board)return point;
 return {...point,u:board.reduce((s,p)=>s+p[0],0)/(4*6144),
  v:board.reduce((s,p)=>s+p[1],0)/(4*3072),panel120:board};
}
export function hallOutline120(room,board){
 const result=[];
 for(let i=0;i<4;i++)for(let j=0;j<12;j++){
  const t=j/12,a=board[i],b=board[(i+1)%4];
  result.push(hallSurface120(room,(a[0]+(b[0]-a[0])*t)/6144,(a[1]+(b[1]-a[1])*t)/3072));
 }
 return result;
}
const icons={
 hangar:'M2 13l8-3V4a2 2 0 014 0v6l8 3v3l-8-2v5l3 2v1l-5-1-5 1v-1l3-2v-5l-8 2z',
 pet:'M8 12c-2 2-5 4-4 7s5 1 8 1 7 2 8-1-2-5-4-7c-2-2-6-2-8 0z M5 5a2 3 0 110 6 2 3 0 010-6 M10 2a2 3 0 110 6 2 3 0 010-6 M15 2a2 3 0 110 6 2 3 0 010-6 M20 5a2 3 0 110 6 2 3 0 010-6',
 armory:'M12 2L3 6v7c0 5 9 9 9 9s9-4 9-9V6z M8 9h8v5l-4 4-4-4z',
 shop:'M4 7h16l1 15H3z M8 8V6a4 4 0 018 0v2',
 training:'M12 3a9 9 0 110 18 9 9 0 010-18 M12 8a4 4 0 110 8 4 4 0 010-8 M12 0v6 M12 18v6 M0 12h6 M18 12h6',
 vault:'M3 5h18l3 6-12 12L0 11z M0 11h24 M7 5l-2 6 7 12 7-12-2-6 M7 5l5 6 5-6',
 arcade:'M7 7h10c5 0 8 15 3 15-2 0-4-4-5-4H9c-1 0-3 4-5 4C-1 22 2 7 7 7z M6 11v6 M3 14h6 M16 12h1 M19 15h1'
};
export function hallDoor120(label,room){
 return `<span class="hq126-sign" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 170"><path d="${icons[room]??icons.training}" transform="translate(55 36) scale(4)" fill="none" stroke="#c8ffff" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/><text x="210" y="116" fill="#f0feff" font-size="86" font-weight="800" font-family="Arial, sans-serif">${label}</text></svg></span><span class="academy102-sr">${label}</span>`;
}
export function placeHallLabel126(marker,room,board,project){
 const label=marker.querySelector('.hq126-sign');if(!label)return;
 const points=board.map(([x,y])=>project(hallSurface120(room,x/6144,y/3072)));
 const matrix=points.every(Boolean)?quadMatrix126(points,1000,170):null;
 label.hidden=!matrix;
 if(matrix)label.style.transform='matrix3d('+matrix.join(',')+')';
}
export function quadMatrix126(points,width,height){
 const [[x0,y0],[x1,y1],[x2,y2],[x3,y3]]=points;
 const dx1=x1-x2,dx2=x3-x2,dx3=x0-x1+x2-x3;
 const dy1=y1-y2,dy2=y3-y2,dy3=y0-y1+y2-y3;
 const divisor=dx1*dy2-dx2*dy1;if(Math.abs(divisor)<1e-8)return null;
 const g=(dx3*dy2-dx2*dy3)/divisor,h=(dx1*dy3-dx3*dy1)/divisor;
 return [(x1-x0+g*x1)/width,(y1-y0+g*y1)/width,0,g/width,
  (x3-x0+h*x3)/height,(y3-y0+h*y3)/height,0,h/height,
  0,0,1,0,x0,y0,0,1];
}
export function hallDensity125(width,height,dpr,software=false){
 return Math.min(dpr||1,software?1.5:3.5,Math.sqrt((software?1_500_000:4_000_000)/(width*height)));
}
