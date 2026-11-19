#!/usr/bin/env python3
"""Package Magda's supplied HD assets as native-size UI components.

Usage: build-interface124.py EXTRACTED_RAR_DIR TRANSPARENT_SPRITE.png
The transparent sprite is the background-extraction edit of the supplied
9014c4f7 sheet. Original source files are never overwritten or upscaled.
"""
from pathlib import Path
from PIL import Image,ImageFilter,ImageDraw
import numpy as np
import json,sys,hashlib

ROOT=Path(__file__).resolve().parents[1]
SRC=Path(sys.argv[1]);SPRITE=Path(sys.argv[2]);OUT=ROOT/'assets/interface124'
OUT.mkdir(exist_ok=True)
records=[]
def image(name):return Image.open(SRC/name)
def save(name,im,source):
    target=OUT/(name+'.webp');im.save(target,'WEBP',lossless=True,method=6,exact=True)
    records.append({'asset':target.relative_to(ROOT).as_posix(),'source':source,'width':im.width,'height':im.height,'sha256':hashlib.sha256(target.read_bytes()).hexdigest()})

def clear_slot(im,box):
    """Live text slots only; fit the neighbouring smooth background field."""
    from scipy.ndimage import median_filter
    x,y,w,h=box;data=median_filter(np.array(im.convert('RGB')).astype(float),size=(5,5,1))
    x0=max(0,x-12);x1=min(im.width,x+w+12);y0=max(0,y-12);y1=min(im.height,y+h+12)
    yy,xx=np.mgrid[y0:y1,x0:x1];xx=(xx-x)/w;yy=(yy-y)/h
    use=((xx<.04)|(xx>.96)|(yy<.04)|(yy>.96))&(data[y0:y1,x0:x1].max(axis=2)<155)
    coords=lambda X,Y:np.stack([np.ones_like(X),X,Y,X*Y,X*X,Y*Y],axis=-1)
    fit=np.linalg.lstsq(coords(xx[use],yy[use]),data[y0:y1,x0:x1][use],rcond=None)[0]
    Y,X=np.mgrid[0:h,0:w];field=coords(X/w,Y/h)@fit
    alpha=np.minimum.reduce([X/12,Y/12,(w-1-X)/12,(h-1-Y)/12,np.ones_like(X)])
    im.paste(Image.fromarray(np.uint8(np.clip(field,0,255))),(x,y),Image.fromarray(np.uint8(np.clip(alpha,0,1)*255)))

sprite=Image.open(SPRITE).convert('RGBA')
assert sprite.size==(1536,1024) and sprite.getchannel('A').getextrema()[0]==0
rects={'rocket':(45,5,485,340),'books':(555,0,985,345),'pages':(1060,0,1490,345),
       'dice':(60,340,480,675),'controller':(560,335,990,670),'trophy':(1080,345,1470,665),
       'back':(65,710,510,950),'voice':(555,680,990,980),'mic':(1060,654,1460,989)}
for name,rect in rects.items():save(name,sprite.crop(rect),'background-extraction: elementy/9014c4f7-957e-4a75-8d18-9cff06fceb98.png')
save('space',image('tła/57f5286c-9cff-4220-ba9b-e594eb6f9fb9.png'),'tła/57f5286c-9cff-4220-ba9b-e594eb6f9fb9.png')
gold=image('elementy/dalej-wybierz-tryb.png').convert('RGBA')
save('next',gold.crop(gold.getchannel('A').getbbox()),'elementy/dalej-wybierz-tryb.png')

choice=image('d0035813-9d84-4c53-9843-033fd0627880.png').convert('RGB')
for name,rect in [('classic',(0,421,911,898)),('walk',(0,894,911,1361))]:
    save(name,choice.crop(rect),'d0035813-9d84-4c53-9843-033fd0627880.png')

entry=image('08e726c8-c5c1-438c-8c66-3edd9122bbdb.png').convert('RGB')
profiles={'pawel':(26,550,807,436),'patryk':(26,987,807,425)}
for child,(x,y,w,h) in profiles.items():
    face=entry.crop((x,y,x+w,y+h))
    if child=='pawel':slots=[(315,253,184,65),(244,307,330,62),(160,354,485,59)]
    else:slots=[(295,250,225,80),(221,307,365,61),(159,351,486,54)]
    for box in slots:clear_slot(face,box)
    save('profile-'+child,face,'08e726c8-c5c1-438c-8c66-3edd9122bbdb.png')
    alternate=face.copy();bx,by,bw,bh=(299,31,205,225) if child=='pawel' else (317,39,177,226)
    patch=face.crop((bx-bw,by,bx,by+bh)).transpose(Image.Transpose.FLIP_LEFT_RIGHT)
    alpha=Image.new('L',(bw,bh),0);ImageDraw.Draw(alpha).rectangle((8,8,bw-9,bh-9),fill=255)
    alternate.paste(patch,(bx,by),alpha.filter(ImageFilter.GaussianBlur(5)))
    save('profile-'+child+'-other',alternate,'08e726c8-c5c1-438c-8c66-3edd9122bbdb.png')

scene=entry.copy();d=ImageDraw.Draw(scene)
for x,y,w,h in profiles.values():d.rectangle((x,y,x+w-1,y+h-1),fill='#06172f')
for x,y,w,h in [(272,1408,315,121),(15,1525,824,204)]:d.rectangle((x,y,x+w-1,y+h-1),fill='#06172f')
d.rounded_rectangle((690,91,757,124),radius=3,fill='#0a2945')
save('entry-scene',scene,'08e726c8-c5c1-438c-8c66-3edd9122bbdb.png')
save('entry-listen',entry.crop((272,1408,587,1529)),'08e726c8-c5c1-438c-8c66-3edd9122bbdb.png')
save('entry-parent',entry.crop((15,1525,839,1729)),'08e726c8-c5c1-438c-8c66-3edd9122bbdb.png')
(OUT/'sources.json').write_text(json.dumps(records,ensure_ascii=False,indent=2)+'\n')
print('Built',len(records),'native-size components from supplied artwork and the transparent extraction.')
