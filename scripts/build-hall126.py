#!/usr/bin/env python3
"""Reproject the supplied complete 6144x3072 sphere into six mobile-safe faces.

Usage: python3 scripts/build-hall126.py SOURCE.png
Requires Pillow and numpy. Faces preserve the complete sphere, including poles,
without the old vertical stretch, object overlays or a GPU-wide downscale.
"""
from pathlib import Path
import hashlib
import json
import sys
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT/'assets/hq/panorama126'
OUT.mkdir(parents=True, exist_ok=True)
SOURCE = Path(sys.argv[1])
im = Image.open(SOURCE).convert('RGB')
assert im.size == (6144, 3072), 'Expected the complete supplied panorama'
source = np.asarray(im)
N = 2048

def bilinear(u, v):
    # Horizontal wrap is essential at the back of the room. At each pole the
    # vertical coordinate is clamped, rather than repeating the floor/roof.
    x = (u*im.width-.5) % im.width
    y = np.clip(v*im.height-.5, 0, im.height-1)
    ix = np.floor(x).astype(int); iy = np.floor(y).astype(int)
    dx = (x-ix)[..., None]; dy = (y-iy)[..., None]
    jx = (ix+1) % im.width; jy = np.minimum(iy+1, im.height-1)
    return np.round((source[iy,ix]*(1-dx)+source[iy,jx]*dx)*(1-dy)+
                    (source[jy,ix]*(1-dx)+source[jy,jx]*dx)*dy).astype('uint8')

def directions(name, s, t):
    one = np.ones_like(s)
    return np.stack({'px':(one,-t,-s),'nx':(-one,-t,s),
                     'py':(s,one,t),'ny':(s,-one,-t),
                     'pz':(s,-t,one),'nz':(-s,-t,-one)}[name], -1)

files = {}
for name in ['px','nx','py','ny','pz','nz']:
    face = np.empty((N,N,3), dtype='uint8')
    # Boundary texels in adjacent faces sample the same exact direction.
    for y in range(0,N,128):
        s,t = np.meshgrid(np.linspace(-1,1,N), np.linspace(-1,1,N)[y:y+128])
        ray = directions(name,s,t);ray /= np.linalg.norm(ray,axis=2)[...,None]
        u = .5+np.arctan2(ray[:,:,0],ray[:,:,2])/(2*np.pi)
        v = .5-np.arcsin(np.clip(ray[:,:,1],-1,1))/np.pi
        face[y:y+128] = bilinear(u,v)
    p = OUT/(name+'.webp')
    Image.fromarray(face).save(p, lossless=True, method=6)
    files[p.name] = dict(size=[N,N],bytes=p.stat().st_size,
                         sha256=hashlib.sha256(p.read_bytes()).hexdigest())
    print(name, files[p.name]['bytes'], flush=True)

meta = dict(version=126,source=SOURCE.name,source_size=list(im.size),
            source_sha256=hashlib.sha256(SOURCE.read_bytes()).hexdigest(),
            projection='equirectangular 360x180; u=.5+yaw/(2*pi), v=.5-pitch/pi',
            runtime='six lossless 2048x2048 faces; no detail islands or low-resolution base',
            order=['px','nx','py','ny','pz','nz'],files=files)
(OUT/'sources.json').write_text(json.dumps(meta,indent=2)+'\n')
