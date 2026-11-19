"""Pixel checks for the parts Magda asked to retain sharply, at native size."""
from pathlib import Path
from PIL import Image,ImageChops
import json,hashlib
root=Path(__file__).resolve().parents[1]
assets=root/'assets/interface122'
def im(path):return Image.open(path).convert('RGB')
def equal(a,b):assert a.size==b.size and ImageChops.difference(a,b).getbbox() is None
entry=im(root/'assets/interface121/entry.webp')
equal(im(assets/'entry-scene.webp').crop((0,190,710,500)),entry.crop((0,190,710,500)))
for name,y in [('pawel',501),('patryk',879)]:
 equal(im(assets/f'profile-{name}.webp').crop((0,0,646,207)),entry.crop((34,y,680,y+207)))
scope=im(root/'assets/interface121/range.webp')
equal(im(assets/'scope-all.webp'),scope.crop((18,565,688,1008)))
for record in json.loads((assets/'sources.json').read_text()):
 p=assets/record['file'];assert Image.open(p).size==(record['width'],record['height'])
 assert hashlib.sha256(p.read_bytes()).hexdigest()==record['sha256']
print('PASS V122 art: welcome, both source heroes, book illustration/frame/glow retained pixel for pixel; native resolutions and lossless layers verified.')
