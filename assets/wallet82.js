export function balance82(profile){const value=profile?.coins;return (typeof value==='number'||typeof value==='string'&&value.trim()!=='')&&Number.isFinite(Number(value))&&Number(value)>=0?Number(value):null;}
export function affordable82(profile,item){const balance=balance82(profile);return balance!==null&&typeof item?.cost==='number'&&Number.isFinite(item.cost)&&item.cost>=0&&balance>=item.cost;}
export function purchase82(profile,item,owned){
 if(!item||typeof item.cost!=='number'||!Number.isFinite(item.cost)||item.cost<0||!Array.isArray(owned))return {ok:false,message:'Nieznany element'};
 if(owned.includes(item.id))return {ok:false,message:'To już jest odblokowane'};
 const balance=balance82(profile);
 if(balance===null)return {ok:false,message:'Nie mogę odczytać portfela. Pobierz dane od mamy i spróbuj ponownie.'};
 if(balance<item.cost)return {ok:false,message:'Potrzebujesz jeszcze '+(item.cost-balance)+' złotych'};
 profile.coins=Number((balance-item.cost).toFixed(6));owned.push(item.id);
 return {ok:true,cost:item.cost,balance:profile.coins};
}
export function credit82(state,child,points,reason,key,id,at){
 const p=state.profiles?.[child],amount=Number(points),balance=balance82(p);
 if(!p||balance===null||!Number.isFinite(amount)||amount<=0||amount>10000||!key)return {ok:false,credited:0};
 state.history??=[];const old=state.history.find(h=>h.key===key&&h.child===child);
 if(old)return {ok:false,credited:Number(old.points)||0,duplicate:true};
 const previous={coins:p.coins,xp:p.xp};p.coins=Number((balance+amount).toFixed(6));p.xp=(Number(p.xp)||0)+amount;
 const record={id,key,child,points:amount,reason,at};state.history.unshift(record);
 return {ok:true,credited:amount,rollback:()=>{p.coins=previous.coins;p.xp=previous.xp;state.history=state.history.filter(x=>x.id!==id);}};
}
