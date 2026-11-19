#!/usr/bin/env python3
"""Package the five supplied interface images, preserving their original bytes.

Usage: python3 scripts/build-interface121.py ENTRY SUBJECTS MODES DASHBOARD RANGE
SVG masks/viewports keep the supplied art; they do not redraw illustrations.
"""
from pathlib import Path
import sys, json, base64, hashlib
from PIL import Image
from io import BytesIO

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'assets/interface121'
OUT.mkdir(exist_ok=True)
images={}
records=[]
for key,file in zip(['entry','subjects','modes','dashboard','range'],sys.argv[1:]):
    p=Path(file); raw=p.read_bytes(); im=Image.open(p)
    ext=im.format.lower().replace('jpeg','jpg')
    target=OUT/(key+'.'+ext); target.write_bytes(raw)
    embedded=BytesIO();im.convert('RGB').save(embedded,format='PNG',compress_level=9)
    mime='image/png'
    images[key]={'file':target.name,'width':im.width,'height':im.height,
                 'data':'data:'+mime+';base64,'+base64.b64encode(embedded.getvalue()).decode()}
    records.append({'asset':str(target.relative_to(ROOT)),'source':p.name,
                    'width':im.width,'height':im.height,'sha256':hashlib.sha256(raw).hexdigest()})

def masked_svg(name,key,box,holes=(),radius=0):
    source=images[key]; x,y,w,h=box
    parts=[]
    for shape in holes:
        if len(shape)==3:
            cx,cy,r=shape;parts.append(f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="black" filter="url(#soft)"/>')
        else:
            hx,hy,hw,hh=shape;parts.append(f'<rect x="{hx}" y="{hy}" width="{hw}" height="{hh}" rx="8" fill="black" filter="url(#soft)"/>')
    svg=f'''<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}">
<defs><filter id="soft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="4"/></filter>
<mask id="cut" maskUnits="userSpaceOnUse" x="0" y="0" width="{w}" height="{h}"><rect width="{w}" height="{h}" fill="white"/>{''.join(parts)}</mask>
<clipPath id="round"><rect width="{w}" height="{h}" rx="{radius}"/></clipPath></defs>
<g clip-path="url(#round)" mask="url(#cut)"><image x="{-x}" y="{-y}" width="{source['width']}" height="{source['height']}" href="{source['data']}"/></g></svg>'''
    (OUT/(name+'.svg')).write_text(svg)

# Only live hero/name/coins/progress slots are masked out of the new frames.
masked_svg('profile-pawel','entry',[34,501,646,360],[(152,18,350,206),(145,213,370,89),(137,303,386,38)],36)
masked_svg('profile-patryk','entry',[34,879,646,354],[(35,6,580,215),(140,207,380,101),(137,304,386,38)],36)
masked_svg('hero-hulk','entry',[179,526,357,192])
masked_svg('hero-spider','entry',[64,900,590,190])

# The scene keeps the original header and space; separate real buttons replace
# the corresponding painted rectangles, so pressing never leaves a second frame.
tiles={
 'knowledge':[0,269,709,453], 'polish':[4,731,235,316],
 'math':[242,731,229,316], 'english':[472,731,233,316],
 'nature':[4,1048,235,337], 'chemistry':[242,1048,229,337],
 'physics':[472,1048,233,337], 'back':[18,79,209,87],
 'voice':[471,178,82,77]}
masked_svg('subjects-scene','subjects',[0,0,images['subjects']['width'],images['subjects']['height']],list(tiles.values()))
# During the click animation, only the moving source pieces disappear from
# the still layer. Their own image layers use the same source coordinates.
moving={'globe':[235,342,245,247], 'letter-a':[224,290,92,91],
        'number-3':[420,297,80,80], 'number-7':[546,324,83,94],
        'letter-b':[134,520,84,92], 'number-bottom':[536,535,85,92]}
box=tiles['knowledge'];holes=[(x-box[0],y-box[1],w,h) for x,y,w,h in moving.values()]
masked_svg('knowledge-moving-base','subjects',box,holes,42)

mapping={key:{k:v for k,v in value.items() if k!='data'} for key,value in images.items()}
(OUT/'source-map.js').write_text('export const interfaceSources121 = '+json.dumps(mapping,indent=2)+';\n'
    +'export const subjectTiles121 = '+json.dumps(tiles,indent=2)+';\n'
    +'export const knowledgePieces121 = '+json.dumps(moving,indent=2)+';\n')
(OUT/'sources.json').write_text(json.dumps(records,indent=2,ensure_ascii=False)+'\n')
print('Packaged',len(records),'original interface sources and SVG viewports.')
