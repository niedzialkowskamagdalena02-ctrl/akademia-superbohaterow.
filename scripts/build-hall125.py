#!/usr/bin/env python3
"""Keep the supplied hall at native size and pack native detail tiles separately.

Usage: python3 scripts/build-hall125.py EXTRACTED_HOL_RAR
Requires Pillow. The runtime projects these tiles directly, never through a
small panorama intermediate. No Android HUD, hands or controls enter the world.
"""
from pathlib import Path
import hashlib
import json
import sys
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
SRC = Path(sys.argv[1])
OUT = ROOT/'assets/hq/panorama125'
OUT.mkdir(parents=True, exist_ok=True)
BASE = 'd6f741ec-399c-477e-ac76-d1e2a635de9d.png'
base = Image.open(SRC/BASE).convert('RGB')
W, H = base.size
assert (W, H) == (1774, 887)
base.save(OUT/'hall.webp', lossless=True, method=6)
atlas = Image.new('RGBA', (2048, 2048))
records = []
preview = base.convert('RGBA')

def tile(name, file, crop, target, at, shape='rectangle'):
    x, y, w, h = crop
    image = Image.open(SRC/file).convert('RGBA').crop((x, y, x+w, y+h))
    mask = Image.new('L', (w, h))
    d = ImageDraw.Draw(mask)
    if shape == 'circle':
        d.ellipse((2, 2, w-3, h-3), fill=255)
    elif shape == 'sign':
        bevel = int(h*.29)
        d.polygon([(bevel, 2), (w-bevel-1, 2), (w-3, h//2),
                   (w-bevel-1, h-3), (bevel, h-3), (2, h//2)], fill=255)
    else:
        d.rounded_rectangle((2, 2, w-3, h-3), radius=18, fill=255)
    # Only 2 source pixels at the silhouette edge; interiors remain opaque.
    image.putalpha(mask.filter(ImageFilter.GaussianBlur(.7)))
    atlas.paste(image, at)
    rect = [target[0]/W, target[1]/H, target[2]/W, target[3]/H]
    region = [at[0]/2048, at[1]/2048, w/2048, h/2048]
    records.append(dict(id=name, source=file, source_size=list(Image.open(SRC/file).size),
                        crop=crop, target=target, uv=rect, atlas=region, native_size=[w,h]))
    # Review only: this downsampled composite is never used as a texture.
    thumb = image.resize(tuple(target[2:]), Image.Resampling.LANCZOS)
    preview.alpha_composite(thumb, tuple(target[:2]))

tile('pet-detail', '1a37e98b-e01a-4d35-aa53-25dae6b73141.png',
     [15, 300, 755, 950], [282, 240, 153, 217], (4, 4))
tile('globe-detail', 'Panorama_holu_3840.png',
     [1690, 392, 476, 476], [916, 354, 172, 172], (768, 4), 'circle')
tile('car-case-detail', 'Panorama_holu_3840.png',
     [468, 650, 308, 240], [1407, 344, 70, 60], (1252, 4))
tile('rocket-case-detail', 'Panorama_holu_3840.png',
     [813, 686, 230, 213], [1399, 411, 81, 77], (1572, 4))

signs = '615fcd41-a1ce-406e-9050-5bade588d31b.png'
entries = {
    'hangar': [46, 466, 205, 48], 'pet': [298, 457, 143, 38],
    'armory': [470, 450, 151, 43], 'shop': [663, 449, 192, 43],
    'training': [808, 619, 378, 73], 'vault': [1167, 451, 184, 42],
    'arcade': [1514, 456, 228, 56]
}
for i, (name, y) in enumerate(zip(entries, [64, 279, 497, 699, 906, 1109, 1320])):
    tile(name, signs, [121, y, 782, 170], entries[name],
         (4 + (i%2)*800, 964 + (i//2)*178), 'sign')
atlas.save(OUT/'details.webp', lossless=True, method=6)
metadata = dict(version=125, panorama=dict(source=BASE, native_size=[W,H]),
                atlas_size=[2048,2048], details=records,
                entrances={name:[r[0]/W,r[1]/H,r[2]/W,r[3]/H] for name,r in entries.items()})
metadata['files'] = {p.name:dict(bytes=p.stat().st_size, sha256=hashlib.sha256(p.read_bytes()).hexdigest())
                     for p in [OUT/'hall.webp', OUT/'details.webp']}
metadata['sources'] = {name:hashlib.sha256((SRC/name).read_bytes()).hexdigest()
                       for name in {BASE, signs, *(r['source'] for r in records)}}
(OUT/'sources.json').write_text(json.dumps(metadata, ensure_ascii=False, indent=2)+'\n')
(ROOT/'assets/hall-details125.js').write_text(
    '// Native source pixels. This atlas is sampled separately from the panorama.\n'
    'export const hallDetails125 = '+json.dumps([{k:r[k] for k in ['id','uv','atlas','native_size']} for r in records], indent=2)+';\n'
    'export const hallEntries125 = '+json.dumps(metadata['entrances'], indent=2)+';\n')
preview.convert('RGB').save(OUT.parent.parent.parent.parent/'hall125-composite-review.jpg', quality=94)
print(json.dumps(metadata['files'], indent=2))
