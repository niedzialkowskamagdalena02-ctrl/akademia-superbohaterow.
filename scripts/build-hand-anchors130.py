#!/usr/bin/env python3
"""Measure supplied PNG alpha pixels. Writes coordinates only; never modifies images."""
from pathlib import Path
import json
import numpy as np
from PIL import Image

ROOT=Path(__file__).resolve().parents[1]
source=(ROOT/'assets/hero-assets127.js').read_text()
art=json.loads(source[source.index('=')+1:].strip().rstrip(';'))
keys=set()
for hero in art['heroes'].values():
    for action in hero['actions'].values():
        if action['effect']!='punch':continue
        for frame in action['frames']:
            keys.update([frame] if isinstance(frame,str) else [layer['src'] for layer in frame['layers']])

def point(alpha,x0,x1):
    yy,xx=np.nonzero(alpha[:,x0:x1]>128)
    if not len(xx):return None
    cutoff=yy.min()+max(20,int((yy.max()-yy.min())*.18))
    top=yy<=cutoff
    return [round(float((xx[top]+x0).mean()/alpha.shape[1]),5),round(float(yy[top].mean()/alpha.shape[0]),5),round(float((xx[top].max()-xx[top].min()+1)/alpha.shape[1]),5),round(float((yy[top].max()-yy[top].min()+1)/alpha.shape[0]),5)]

fists={}
for key in sorted(keys):
    image=np.asarray(Image.open(ROOT/'assets/hq/hands127'/key).convert('RGBA'))
    alpha=image[:,:,3];h,w=alpha.shape
    fists[key]={'size':[w,h],'left':point(alpha,0,w//2),'right':point(alpha,w//2,w),'full':point(alpha,0,w)}
winds={}
for i,key in enumerate(art['effects']['wind']):
    image=np.asarray(Image.open(ROOT/'assets/hq/hands127'/key).convert('RGBA'),dtype=float)
    alpha=image[:,:,3];h,w=alpha.shape
    yy,xx=np.nonzero(alpha>32);x0,x1=int(xx.min()),int(xx.max()+1)
    leading=xx>x1-(x1-x0)*.22 if i<2 else xx<x0+(x1-x0)*.22
    scores=(image[yy[leading],xx[leading],:3].mean(axis=1)/255)*(alpha[yy[leading],xx[leading]]/255)**2
    tip=[float(np.average(xx[leading],weights=scores)/w),float(np.average(yy[leading],weights=scores)/h)]
    winds[key]={'visibleWidth':round((x1-x0)/w,5),'tip':[round(v,5) for v in tip]}
effects={}
for key in art['effects']['punch']:
    image=np.asarray(Image.open(ROOT/'assets/hq/hands127'/key).convert('RGBA'),dtype=float)
    alpha=image[:,:,3];h,w=alpha.shape;yy,xx=np.nonzero(alpha>32)
    weights=alpha[yy,xx]**2
    effects[key]={'center':[round(float(np.average(xx,weights=weights)/w),5),round(float(np.average(yy,weights=weights)/h),5)],'extent':round(max((xx.max()-xx.min()+1)/w,(yy.max()-yy.min()+1)/h),5)}
(ROOT/'assets/hero-anchors130.js').write_text('// Alpha-derived coordinates from untouched supplied PNGs.\nexport const fistAnchors130='+json.dumps(fists,separators=(',',':'))+';\nexport const windAnchors130='+json.dumps(winds,separators=(',',':'))+';\nexport const effectAnchors131='+json.dumps(effects,separators=(',',':'))+';\n')
print(f'Measured {len(fists)} fist sources and {len(winds)} wind PNGs; original bytes unchanged.')
