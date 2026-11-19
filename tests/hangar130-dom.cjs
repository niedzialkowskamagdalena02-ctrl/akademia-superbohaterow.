// Deterministic DOM/event fixture; this is not a browser or device rendering test.
class Target {
 constructor(){this.listeners={};}
 addEventListener(type,fn,{signal}={}){if(signal?.aborted)return;const item={fn};(this.listeners[type]??=[]).push(item);signal?.addEventListener('abort',()=>this.listeners[type]=this.listeners[type].filter(x=>x!==item),{once:true});}
 emit(type,event){for(const {fn}of [...(this.listeners[type]||[])]){fn(event);if(event.immediate)break;}}
}
function split(s,sep){let depth=0,start=0,out=[];for(let i=0;i<s.length;i++){if('[('.includes(s[i]))depth++;if('])'.includes(s[i]))depth--;if(s[i]===sep&&!depth){out.push(s.slice(start,i));start=i+1;}}return [...out,s.slice(start)];}
function matches(el,selector){
 return split(selector,',').some(s=>{
  const chain=split(s.trim(),' ').filter(Boolean);if(chain.length>1){if(!matches(el,chain.pop()))return false;let parent=el.parentNode;while(parent){if(matches(parent,chain.join(' ')))return true;parent=parent.parentNode;}return false;}
  s=chain[0]||'';const tag=s.match(/^[a-z][\w-]*/i)?.[0];if(tag&&el.tagName!==tag.toLowerCase())return false;
  for(const [,name]of s.matchAll(/\.([\w-]+)/g))if(!el.classList.contains(name))return false;
  for(const [,id]of s.matchAll(/#([\w-]+)/g))if(el.getAttribute('id')!==id)return false;
  for(const [,name,op,value]of s.matchAll(/\[([\w-]+)(?:(\^=|=)"([^"]*)")?\]/g)){
   const a=el.getAttribute(name);if(a===null||op==='='&&a!==value||op==='^='&&!a.startsWith(value))return false;
  }
  return true;
 });
}
const decode=s=>s.replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&amp;/g,'&');
class Element extends Target {
 constructor(tag='div',doc){super();this.tagName=tag;this.ownerDocument=doc;this.attributes={};this.children=[];this.parentNode=null;this.text='';this.style={setProperty(k,v){this[k]=v;},removeProperty(k){delete this[k];}};this.dataset=new Proxy({}, {get:(_,key)=>this.getAttribute('data-'+String(key).replace(/[A-Z]/g,c=>'-'+c.toLowerCase()))??undefined,set:(_,key,value)=>{this.setAttribute('data-'+String(key).replace(/[A-Z]/g,c=>'-'+c.toLowerCase()),value);return true;}});this.classList={add:(...names)=>this.setAttribute('class',[...new Set([...this.classes(),...names])].join(' ')),remove:(...names)=>this.setAttribute('class',this.classes().filter(n=>!names.includes(n)).join(' ')),contains:n=>this.classes().includes(n)};}
 classes(){return (this.attributes.class||'').split(/\s+/).filter(Boolean);}
 setAttribute(n,v){this.attributes[n]=String(v);}
 getAttribute(n){return Object.hasOwn(this.attributes,n)?this.attributes[n]:null;}
 hasAttribute(n){return this.getAttribute(n)!==null;}
 removeAttribute(n){delete this.attributes[n];}
 get disabled(){return this.hasAttribute('disabled');}set disabled(v){if(v)this.setAttribute('disabled','');else this.removeAttribute('disabled');}
 get src(){return this.getAttribute('src');}set src(v){this.setAttribute('src',v);}
 get isConnected(){return this===this.ownerDocument?.root||!!this.parentNode?.isConnected;}
 appendChild(e){e.parentNode=this;this.children.push(e);return e;}
 remove(){if(this.parentNode)this.parentNode.children=this.parentNode.children.filter(x=>x!==this);this.parentNode=null;}
 set innerHTML(html){this.children.forEach(c=>c.parentNode=null);this.children=[];this.text='';const stack=[this];for(const token of String(html).match(/<!--[^]*?-->|<[^>]*>|[^<]+/g)||[]){if(token.startsWith('<!--'))continue;if(token.startsWith('</')){stack.pop();continue;}if(token.startsWith('<')){const tag=token.match(/^<([\w-]+)/)?.[1];if(!tag)continue;const e=new Element(tag,this.ownerDocument);for(const m of token.slice(tag.length+1,-1).matchAll(/([\w-]+)(?:="([^"]*)"|='([^']*)'|=([^\s>]+))?/g))e.setAttribute(m[1],decode(m[2]??m[3]??m[4]??''));stack.at(-1).appendChild(e);if(!['img','input','br','hr','meta','link','source'].includes(tag))stack.push(e);}else stack.at(-1).text+=decode(token);}}
 get innerHTML(){return this.text+this.children.map(e=>e.outerHTML).join('');}
 get outerHTML(){const open=`<${this.tagName} ${Object.entries(this.attributes).map(([k,v])=>k+'="'+v.replaceAll('"','&quot;')+'"').join(' ')}>`;return ['img','input','br','hr','meta','link','source'].includes(this.tagName)?open:open+this.innerHTML+`</${this.tagName}>`;}
 set textContent(v){this.children=[];this.text=String(v);}get textContent(){return this.text+this.children.map(e=>e.textContent).join('');}
 querySelectorAll(s){return this.children.flatMap(e=>[...(matches(e,s)?[e]:[]),...e.querySelectorAll(s)]);}
 querySelector(s){return this.querySelectorAll(s)[0]||null;}
 closest(s){return matches(this,s)?this:this.parentNode?.closest(s)||null;}
 cloneNode(){const wrapper=new Element('div',this.ownerDocument);wrapper.innerHTML=this.outerHTML;return wrapper.children[0];}
 getBoundingClientRect(){return this.rect||{x:0,y:0,left:0,top:0,right:800,bottom:450,width:800,height:450};}
 insertAdjacentHTML(_,html){this.innerHTML+=html;}
 focus(){}scrollTo(){}setPointerCapture(){}getContext(){return null;}
}
function fixture(){
 const doc=new Target();doc.hidden=false;doc.defaultView=new Target();doc.elementFromPoint=()=>doc.under||null;
 const root=new Element('section',doc);doc.root=root;
 function event(type,target,extra={}){const e={type,target,button:0,detail:0,pointerId:1,preventDefault(){this.prevented=true;},stopPropagation(){this.stopped=true;},stopImmediatePropagation(){this.stopped=true;this.immediate=true;},...extra};let el=target;while(el){el.emit(type,e);if(e.stopped)break;el=el.parentNode;}if(!e.stopped)doc.emit(type,e);return e;}
 return {root,doc,event,click(action){const el=root.querySelector('[data-h130="'+action+'"]');if(!el)throw Error('Missing button '+action);if(!el.disabled)event('click',el);return el;},key(key){return event('keydown',root,{key});}};
}
function context(game,mode,progress){
 const f=fixture();let now=0,version=0,timers=[],loops=[],abort=new AbortController(),completion=null;
 const c={...f,game,mode,progress,art:'assets/hangar130/',reduced:false,tone(){},tap(){},speak(){},alive:true,
  view(html){version++;abort.abort();abort=new AbortController();timers=[];loops=[];f.root.innerHTML=html;},
  status(text){const e=f.root.querySelector('[data-h130-status]');if(e)e.textContent=text;},
  on(target,type,fn){target?.addEventListener(type,fn,{signal:abort.signal});},
  later(fn,ms){timers.push({at:now+ms,fn,version});},loop(fn){loops.push({fn,version});},animate(){return null;},
  complete(label,badge){progress.complete(game,mode);completion={label,badge};c.view('<h3>'+label+'</h3>');},
  takeoff({onFinish}){let done=false;c.view('<button data-h130="skip">Pomiń</button>');const finish=()=>{if(done)return;done=true;onFinish();};c.on(f.root,'click',e=>{if(e.target.closest('[data-h130="skip"]'))finish();});c.later(finish,4100);},
  advance(ms){for(let end=now+ms;now<end;){const step=Math.min(16,end-now);now+=step;global.__testTime130=now;for(const loop of [...loops])if(loop.version===version)loop.fn(step/1000,now);const due=timers.filter(t=>t.at<=now);timers=timers.filter(t=>t.at>now);for(const t of due)if(t.version===version)t.fn();}},
  get completion(){return completion;}
 };return c;
}
module.exports={fixture,context,Element};
