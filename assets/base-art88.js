const displayItems=new Set([
 'armor','helmet','boots','cape','shield','thorhammer','spidermask','gauntlet',
 'vibranium','spiderweb','web','arc','quinjet','language-cup','language-cape',
 'robot','portal','reactor','workshop','hangar','tower'
]);
const largeItems=new Set(['armor','cape','language-cape']);
const stoneHues={stone_space:-55,stone_mind:138,stone_reality:90,stone_power:0,stone_time:-140,stone_soul:112};
const figures={
 guardian:'iron',inventor:'spider',shadow:'hulk',cosmo:'thor',blackwidow:'widow',
 panther:'panther',captain:'captain',hawkeye:'hawkeye',groot:'groot',gamora:'gamora'
};

export function baseArt88(id){
 if(displayItems.has(id))return {src:'assets/hq/equipment88/'+id+'.webp',hue:0,tall:largeItems.has(id),caseScale:id==='helmet'?.66:1};
 if(id==='guardian')return {src:'assets/hq/mentor-iron91.webp',hue:0,tall:true};
 if(Object.hasOwn(stoneHues,id))return {src:'assets/hq/equipment88/stone.webp',hue:stoneHues[id],tall:false};
 if(Object.hasOwn(figures,id))return {src:'assets/art/'+figures[id]+'.svg',hue:0,tall:true};
 return null;
}
