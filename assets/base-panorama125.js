import {hallEntries125} from './hall-details125.js?v=125';
export {hallDoor120,hallSurface120,hallOutline120,placeHallHit120} from './base-panorama120.js?v=120';

// Keep the continuous world geometry; only the source image and sign positions change.
export function hallPoint120(point){
 const rect=hallEntries125[point.room];
 return rect?{...point,u:rect[0]+rect[2]/2,v:rect[1]+rect[3]/2,panel120:rect}:point;
}

export function hallDensity125(width,height,dpr,software=false){
 return Math.min(dpr||1,software?1.5:3.5,Math.sqrt((software?1_500_000:4_000_000)/(width*height)));
}
