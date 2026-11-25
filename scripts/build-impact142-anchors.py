from pathlib import Path
import json,subprocess,numpy as np
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]
raw=subprocess.run(['node','--input-type=module','-e',"import {heroAssets127 as a} from './assets/hero-assets127.js';import {action127} from './assets/hero-animation127.js';let actions=[];for(const hero of ['spider','iron','captain','thor'])for(const[key,v]of Object.entries(a.heroes[hero].actions)){if(['web','laser','shield','throw','hammer'].some(k=>key.startsWith(k)))actions.push({hero,key,...v});}actions.push({hero:'captain',key:'shield-hit:1',...action127('captain','shield-hit',1)});console.log(JSON.stringify({actions,webs:a.webs,effects:a.effects}));"],cwd=ROOT,check=True,capture_output=True,text=True)
a=json.loads(raw.stdout);contacts={};marks={}
def pixels(key):return np.array(Image.open(ROOT/'assets/hq/hands127'/key).convert('RGBA'))
def center(ar,mask):
 weight=np.where(mask,ar[:,:,3].astype(float),0);ys,xs=np.indices(weight.shape);n=weight.sum();return [round(float((xs*weight).sum()/n/ar.shape[1]),6),round(float((ys*weight).sum()/n/ar.shape[0]),6)]
for action in a['actions']:
 age=action['duration']*action['contact'];dur=action.get('durations')or[action['duration']/len(action['frames'])]*len(action['frames']);end=0
 for i,d in enumerate(dur):
  end+=d
  if end>age:break
 frame=action['frames'][i];key=frame if isinstance(frame,str)else frame['layers'][-1]['src'];ar=pixels(key);h,w=ar.shape[:2];r,g,b,alpha=[ar[:,:,i].astype(float)for i in range(4)];y=np.arange(h)[:,None];mask=alpha>50
 kind=action['key'].split(':')[0]
 if kind=='web':
  mask&=(r>155)&(g>155)&(b>155)&(np.maximum(np.maximum(r,g),b)-np.minimum(np.minimum(r,g),b)<90)&(y<h*.65)
  top=np.where(mask)[0].min();mask&=y<top+max(10,h*.025)
 elif kind=='laser':
  mask&=(g>160)&(b>170)&(b>r*1.2)&(y<h*.62)
  top=np.where(mask)[0].min();mask&=y<top+max(7,h*.018)
 elif kind in ['shield','throw']:
  mask&=y<h*(.60 if kind=='shield'else .42)
 elif kind=='hammer':
  mask&=(y<h*.41)&(b>80)&(np.maximum(np.maximum(r,g),b)-np.minimum(np.minimum(r,g),b)<100)
 elif kind=='shield-hit':mask&=(y<h*.6)&(r>b*1.15)
 point=center(ar,mask)
 contacts[action['hero']+':'+action['key']]={'index':i,'src':key,'size':[w,h],'point':point}
for kind,keys in a['webs'].items():
 ar=pixels(keys[0]);point=center(ar,ar[:,:,3]>60)
 for key in keys:marks[key]={'anchor':point,'kind':kind}
for kind,keys in a['effects'].items():
 for key in keys:
  ar=pixels(key);mask=ar[:,:,3]>60;xy=np.where(mask);anchor=center(ar,mask);extent=max((xy[1].max()-xy[1].min()+1)/ar.shape[1],(xy[0].max()-xy[0].min()+1)/ar.shape[0]);marks[key]={'anchor':anchor,'extent':round(float(extent),6),'kind':kind}
(ROOT/'assets/hero-impact-anchors142.js').write_text('// Measured in the untouched supplied PNGs; no image bytes are changed.\nexport const contactAnchors142='+json.dumps(contacts,separators=(',',':'))+';\nexport const markAnchors142='+json.dumps(marks,separators=(',',':'))+';\n')
print(json.dumps(contacts,ensure_ascii=False))
