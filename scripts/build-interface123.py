#!/usr/bin/env python3
"""UI composition only: retain source illustration pixels, replace raster text
and the opaque back-button rectangle with scalable interface layers.
No artwork is resized or re-encoded with a lossy codec.
"""
from pathlib import Path
from io import BytesIO
from PIL import Image
import base64,json,hashlib

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'assets/interface123'
OUT.mkdir(exist_ok=True)
def source(name):
    path=ROOT/'assets/interface122'/name
    im=Image.open(path).convert('RGB')
    png=BytesIO();im.save(png,'PNG',compress_level=9)
    return im,'data:image/png;base64,'+base64.b64encode(png.getvalue()).decode(),hashlib.sha256(path.read_bytes()).hexdigest()

im,data,sha=source('scope-all.webp')
# The illustration ends above this slot. Fit only its smooth colour field
# through the live label area; the original artwork/frame remain untouched.
svg=f'''<svg xmlns="http://www.w3.org/2000/svg" width="670" height="443" viewBox="0 0 670 443">
<defs>
<linearGradient id="field" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#234fb0"/><stop offset=".53" stop-color="#3f3aa6"/><stop offset="1" stop-color="#62279e"/></linearGradient>
<filter id="feather" x="-15%" y="-35%" width="130%" height="170%"><feGaussianBlur stdDeviation="6"/></filter>
<mask id="live-label"><rect width="670" height="443" fill="white"/><rect x="76" y="279" width="527" height="78" rx="16" fill="black" filter="url(#feather)"/></mask>
</defs>
<rect width="670" height="443" fill="url(#field)"/>
<image width="670" height="443" href="{data}" mask="url(#live-label)"/>
</svg>'''
(OUT/'scope-all.svg').write_text(svg)

im,data,scene_sha=source('scope-scene.webp')
# A transparent, feathered join removes only the old opaque back-button slot.
# The constellation artwork and all remaining positions stay in source space.
svg=f'''<svg xmlns="http://www.w3.org/2000/svg" width="695" height="1463" viewBox="0 0 695 1463">
<defs>
<linearGradient id="sky" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#14314a"/><stop offset="1" stop-color="#1b2c43"/></linearGradient>
<linearGradient id="join" x1="0" y1="0" x2="0" y2="1"><stop stop-color="black"/><stop offset="1" stop-color="white"/></linearGradient>
<mask id="sky-join"><rect width="695" height="1463" fill="white"/><rect width="695" height="130" fill="black"/><rect y="130" width="695" height="50" fill="url(#join)"/></mask>
</defs>
<path d="M0 0H695V190H0Z" fill="url(#sky)"/>
<g fill="#b2d3e9" opacity=".35"><circle cx="274" cy="18" r="1"/><circle cx="394" cy="45" r="1.4"/><circle cx="533" cy="25" r="1"/><circle cx="649" cy="86" r="1.4"/></g>
<image width="695" height="1463" href="{data}" mask="url(#sky-join)"/>
</svg>'''
(OUT/'scope-scene.svg').write_text(svg)
(OUT/'sources.json').write_text(json.dumps({'scope-all.webp':sha,'scope-scene.webp':scene_sha,'note':'Original decoded pixels embedded as lossless PNG; SVG masks affect only live text and the former back-button slot.'},indent=2)+'\n')
print('Built 2 native-resolution SVG compositions; source artwork unchanged.')
