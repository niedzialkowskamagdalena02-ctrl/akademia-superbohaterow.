const studyNorm82=s=>String(s||'').trim().toLocaleLowerCase('en-GB');
export function studyWords82(t,pool){
 const desired=[...(t.readWords||[]),...(t.pairs||[]).map(x=>x.en),...(t.parts81||[]).map(x=>x.word.en),...(t.floors81||[]).map(x=>x.word.en),...(t.packages81||[]).map(x=>x.en),...(t.items81||[]).map(x=>x.en),t.wordEn,t.answer];
 const seen=new Set();return desired.map(studyNorm82).filter(x=>x&&!seen.has(x)&&seen.add(x)).map(en=>pool.find(x=>x.en===en)).filter(Boolean);
}
export function scaffoldStudy82(tasks,pool,stats={}){
 return tasks.map(original=>{
  const t={...original},words=studyWords82(t,pool);if(!words.length)return t;
  t.study82=words.map(x=>({en:x.en,pl:x.pl,picture:x.picture||'',sourcePageId:x.sourcePageId}));
  t.studyIndex82=0;t.studyDone82=false;
  const en=studyNorm82(t.wordEn||t.answer),success=(Number(stats[en]?.correct)||0)+Math.min(2,Number(stats[en]?.guided)||0);
  if(['write','spelling','dictation','listening','vocab-listen'].includes(t.type)&&pool.some(x=>x.en===en)){
   if(success<2&&pool.length>=2){
    const target=pool.find(x=>x.en===en),others=pool.filter(x=>x.en!==en).slice(0,2);let opts=[en,...others.map(x=>x.en)];
    for(let i=opts.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[opts[i],opts[j]]=[opts[j],opts[i]];}
    Object.assign(t,{type:'vocab-choice',vocab76:true,options:opts,wordEn:en,answer:en,promptPl:target.pl,answerPl:target.pl,answerPlFor:en,question:'Choose the English word.',questionPl:'Wybierz po angielsku: '+target.pl+'.',instructionEn:'Choose the English word.',instructionPl:'Wybierz po angielsku: '+target.pl+'.',audio:'',studyOriginalType82:original.type});
   }else if(success<4){t.copyPractice82=true;t.model82=en;}
  }
  if(['letter-race','egg','balloon','letter-thief','block-tower'].includes(t.game80)||t.type==='vocab-build')t.model82=t.wordEn||t.answer;
  return t;
 });
}
export function recordStudy82(t,stats={}){
 if(!t.correct||t.v77Revealed)return stats;
 for(const x of t.study82||[]){const old=stats[x.en]||{};stats[x.en]=t.copyPractice82?{...old,guided:Math.min(999,(Number(old.guided)||0)+1)}:{...old,correct:Math.min(999,(Number(old.correct)||0)+1)};}
 return stats;
}
