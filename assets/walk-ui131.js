export function walkHelpHidden131(child,storage=globalThis.localStorage){
 try{return storage?.getItem('academy-walk-help-hidden131-'+child)==='1';}catch{return false;}
}
export function hideWalkHelp131(child,storage=globalThis.localStorage){
 try{storage?.setItem('academy-walk-help-hidden131-'+child,'1');}catch{}
}
