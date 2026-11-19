#!/usr/bin/env python3
"""Build native-size UI layers from the supplied artwork, without rescaling.

Whole cards include their backgrounds, frames and glow. Small live text slots
use neighbouring background colours through a glyph mask, not rectangular
transparent holes. The original files in interface121 remain untouched.
"""
from pathlib import Path
import json, hashlib
from PIL import Image, ImageFilter, ImageDraw, ImageChops
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT/'assets/interface122'
OUT.mkdir(exist_ok=True)
records = []

def load(key):
    return Image.open(ROOT/f'assets/interface121/{key}.webp').convert('RGB')

def save(name, image):
    image.save(OUT/(name+'.webp'), 'WEBP', lossless=True, method=6)
    records.append({'file':name+'.webp','width':image.width,'height':image.height,
                    'sha256':hashlib.sha256((OUT/(name+'.webp')).read_bytes()).hexdigest()})

def clear_text(image, box, threshold=120):
    """Fill a live slot from a fitted local colour field, including shadows.

    A soft 12px rim joins the original pixels. Only a small text slot is
    involved; illustrations and their surrounding glows are never sampled out.
    """
    x,y,w,h=box
    data=np.array(image).astype(float)
    from scipy.ndimage import median_filter
    data=median_filter(data,size=(5,5,1))
    x0=max(0,x-12);x1=min(image.width,x+w+12)
    y0=max(0,y-12);y1=min(image.height,y+h+12)
    yy,xx=np.mgrid[y0:y1,x0:x1]
    xx=(xx-x)/w; yy=(yy-y)/h
    use=((xx<.04)|(xx>.96)|(yy<.04)|(yy>.96))
    values=data[y0:y1,x0:x1]
    use &= values.max(axis=2)<150
    coords=lambda X,Y:np.stack([np.ones_like(X),X,Y,X*Y,X*X,Y*Y],axis=-1)
    fit=np.linalg.lstsq(coords(xx[use],yy[use]),values[use],rcond=None)[0]
    Y,X=np.mgrid[0:h,0:w]
    field=coords(X/w,Y/h)@fit
    mask=np.minimum.reduce([X/12,Y/12,(w-1-X)/12,(h-1-Y)/12,np.ones_like(X)])
    mask=np.uint8(np.clip(mask,0,1)*255)
    image.paste(Image.fromarray(np.uint8(np.clip(field,0,255))),(x,y),Image.fromarray(mask))

def feather_patch(image, box, patch, feather=10):
    x,y,w,h=box
    mask=Image.new('L',(w,h),0)
    ImageDraw.Draw(mask).rectangle((feather,feather,w-feather-1,h-feather-1),fill=255)
    mask=mask.filter(ImageFilter.GaussianBlur(feather/2))
    image.paste(patch,(x,y),mask)

def blank_progress(image, box):
    clear_text(image,box)

def mirrored_edge(image, source_box, dest_x, overlap=30):
    patch=image.crop(source_box).transpose(Image.Transpose.FLIP_LEFT_RIGHT)
    w,h=patch.size
    alpha=np.full((h,w),255,dtype='uint8')
    if dest_x==0:
        alpha[:,-overlap:]=np.uint8(np.linspace(255,0,overlap))
    else:
        alpha[:,:overlap]=np.uint8(np.linspace(0,255,overlap))
    if source_box[1]>0:
        alpha[:30]=np.uint8(alpha[:30].astype(float)*np.linspace(0,1,30)[:,None])
    image.paste(patch,(dest_x,source_box[1]),Image.fromarray(alpha))

def card_alpha(image, tab, body):
    """Keep the source frame/glow, fading the space OUTSIDE its silhouette.

    The card is repositioned on the modes page. Its old rectangular sky must
    not come along, even though the illustration and frame remain untouched.
    """
    core=Image.new('L',image.size,0)
    d=ImageDraw.Draw(core)
    d.rounded_rectangle(body,radius=82,fill=255)
    d.rounded_rectangle(tab,radius=35,fill=255)
    halo=core.filter(ImageFilter.GaussianBlur(10))
    alpha=ImageChops.lighter(core,halo)
    image=image.convert('RGBA');image.putalpha(alpha)
    return image

entry=load('entry')
profiles={'pawel':(34,501,646,360),'patryk':(34,879,646,354)}
for child,(x,y,w,h) in profiles.items():
    face=entry.crop((x,y,x+w,y+h))
    if child=='pawel':
        clear_text(face,(250,211,154,56))
        clear_text(face,(201,257,276,49))
    else:
        clear_text(face,(235,207,186,54))
        clear_text(face,(190,254,303,52))
    blank_progress(face,(125,294,410,49))
    save('profile-'+child,face)
    # Alternate selected heroes still use their real existing portrait. Only
    # the source figure's body is removed, leaving the surrounding light.
    alternate=face.copy()
    bx,by,bw,bh=(245,24,168,194) if child=='pawel' else (257,24,145,185)
    patch=face.crop((bx-bw,by,bx,by+bh)).transpose(Image.Transpose.FLIP_LEFT_RIGHT)
    feather_patch(alternate,(bx,by,bw,bh),patch,8)
    save('profile-'+child+'-other',alternate)

# These source rectangles fit together exactly on a single 710 × 1536 board.
# No welcome/banner/portrait is feathered onto a different page background.
scene=entry.copy()
draw=ImageDraw.Draw(scene)
for x,y,w,h in profiles.values():
    draw.rectangle((x,y,x+w-1,y+h-1),fill='#07152b')
for box in [(254,1237,201,82),(25,1326,663,164)]:
    x,y,w,h=box; draw.rectangle((x,y,x+w-1,y+h-1),fill='#08162d')
ImageDraw.Draw(scene).rounded_rectangle((564,103,626,130),radius=3,fill='#102943')
save('entry-scene',scene)
save('entry-listen',entry.crop((254,1237,455,1319)))
save('entry-parent',entry.crop((25,1326,688,1490)))

scope=load('range').crop((0,0,695,1463))
# The reference has a painted microphone over the bottom card. Reconstruct
# only that occluded corner with the corresponding left edge of the same card.
mirrored_edge(scope,(0,1250,190,1463),505,28)
# Live text also restores the words hidden behind that painted microphone.
clear_text(scope,(65,1264,572,126))
save('scope-all',scope.crop((18,565,688,1008)))
save('scope-pick',scope.crop((18,1009,695,1459)))
scope_scene=scope.copy()
draw=ImageDraw.Draw(scope_scene)
for box in [(0,0,225,128),(18,565,670,443),(18,1009,677,450)]:
    x,y,w,h=box;draw.rectangle((x,y,x+w-1,y+h-1),fill='#0c1737')
# Clear the dynamic subject title; default knowledge uses the untouched source
# title as a separate layer, just like the cards.
clear_text(scope_scene,(204,195,405,89),threshold=75)
save('scope-scene',scope_scene)
save('scope-title',load('range').crop((202,194,605,280)))
save('scope-back',load('range').crop((0,0,225,128)))
back=load('range').crop((0,0,225,128)).convert('RGBA')
alpha=Image.new('L',back.size,0)
ImageDraw.Draw(alpha).rounded_rectangle((0,7,214,118),radius=27,fill=255)
back.putalpha(alpha.filter(ImageFilter.GaussianBlur(3)))
save('back',back)
save('scope-voice',load('range').crop((280,442,430,563)))

modes=load('modes')
blue=modes.crop((0,278,755,1186))
# Its left edge is cut in the uploaded reference; complete it using the intact
# right edge of that exact blue card, without stretching the illustration.
mirrored_edge(blue,(679,0,755,908),0,36)
clear_text(blue,(32,514,680,290))
save('mode-practice',card_alpha(blue,(251,10,481,130),(10,63,746,889)))
green=Image.new('RGB',(755,908))
green.paste(modes.crop((776,278,1413,1186)),(0,0))
mirrored_edge(green,(0,0,155,908),600,35)
clear_text(green,(105,514,600,290))
save('mode-choose',card_alpha(green,(279,10,507,130),(10,63,746,889)))
red=modes.crop((0,1180,1413,1536))
mirrored_edge(red,(0,70,320,356),1093,45)
clear_text(red,(607,119,538,116))
clear_text(red,(320,242,933,90))
save('mode-assessment',card_alpha(red,(541,7,993,130),(-5,61,1418,356)))

(OUT/'sources.json').write_text(json.dumps(records,ensure_ascii=False,indent=2)+'\n')
print('Built',len(records),'native-size layers; original input pixels were not rescaled.')
