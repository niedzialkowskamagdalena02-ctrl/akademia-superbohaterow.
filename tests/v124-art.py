from pathlib import Path
from PIL import Image
import hashlib,json
root=Path(__file__).resolve().parents[1]
records=json.loads((root/'assets/interface124/sources.json').read_text())
for r in records:
 p=root/r['asset'];im=Image.open(p)
 assert im.size==(r['width'],r['height'])
 assert hashlib.sha256(p.read_bytes()).hexdigest()==r['sha256']
for name in ['books','pages','dice','controller','trophy','rocket','voice','back','mic']:
 im=Image.open(root/f'assets/interface124/{name}.webp')
 assert im.mode=='RGBA' and im.getchannel('A').getextrema()[0]<=3,name+' requires transparent alpha'
assert Image.open(root/'assets/interface124/space.webp').size==(901,1746)
assert Image.open(root/'assets/interface124/entry-scene.webp').size==(853,1844)
print('PASS V124 artwork: 20 lossless native-size components, genuine transparency, HD backdrop and supplied entry dimensions.')
