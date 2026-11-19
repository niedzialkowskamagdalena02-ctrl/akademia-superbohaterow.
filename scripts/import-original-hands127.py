#!/usr/bin/env python3
"""Copy supplied PNG bytes verbatim and produce the runtime animation manifest."""
from pathlib import Path
import argparse, hashlib, json, shutil
from PIL import Image

parser=argparse.ArgumentParser()
parser.add_argument('sources', type=Path)
args=parser.parse_args()
root=Path(__file__).resolve().parents[1]
out=root/'assets/hq/hands127'
out.mkdir(parents=True,exist_ok=True)
files={}; by_hash={}
def asset(relative):
    source=args.sources/relative if not relative.startswith('COMMON/') else args.sources.parent/'raw'/relative[7:]
    data=source.read_bytes(); digest=hashlib.sha256(data).hexdigest()
    if digest in by_hash:
        key=by_hash[digest]; files[key]['originals'].append(relative); return key
    key=digest[:20]+'.png'
    shutil.copyfile(source,out/key)
    with Image.open(source) as im:
        if im.mode!='RGBA': raise ValueError('Expected original RGBA: '+relative)
        size=list(im.size)
    files[key]={'sha256':digest,'bytes':len(data),'size':size,'originals':[relative]}
    by_hash[digest]=key
    return key
def numbered(folder,picks=None):
    if picks is None:
        picks=[int(p.stem) for p in sorted((args.sources/folder).glob('*.png'),key=lambda p:int(p.stem)) if p.stem.isdigit()]
    return [asset(f'{folder}/{n:02}.png') for n in picks]
def sequence(folder,picks,duration,**kw):
    frames=numbered(folder,picks)
    result={'frames':frames,'duration':duration,'source_sequence':folder,**kw}
    if len(frames)>2:
        result['durations']=[16]+[(duration-48)/(len(frames)-2)]*(len(frames)-2)+[32]
    return result
def action(frames,duration,**kw):return {'frames':frames,'duration':duration,**kw}
heroes={}
punch=None
for key,source in [('hulk','hulk'),('captain','kapitan_ameryka'),('spider','spider_man')]:
    actions={}
    for side,word in [(-1,'lewa'),(1,'prawa')]:
        actions[f'punch:{side}']=sequence(f'{source}/Cios_{word}',punch,520,contact=.45,effect='punch')
    heroes[key]={'idle':asset(f'{source}/Pozycje_bazowe/garda.png'),'actions':actions}
for side,word in [(-1,'lewa'),(1,'prawa')]:
    heroes['hulk']['actions'][f'slam:{side}']=sequence(f'hulk/Uderzenie_w_dol_{word}',None,620,contact=.58,effect='hulk-dent',defer=True)
heroes['captain']['shieldIdle']=asset('kapitan_ameryka/Pozycje_bazowe/chwyt-tarczy.png')
heroes['captain']['actions']['shield:1']=sequence('kapitan_ameryka/Rzut_trafienie_powrot',None,1080,contact=.52,effect='shield-dent')
thor='thor/Thor_PNG'
heroes['thor']={'idle':asset(thor+'/rece-otwarte.png'),'hammerIdle':asset(thor+'/mlot-chwyt.png'),'actions':{}}
left=asset(thor+'/rece-lewa.png'); right=asset(thor+'/rece-prawa.png')
bare=numbered(thor+'/Przejscia/Bez_mlota',[1,2,3])
hammer=numbered(thor+'/Przejscia/Z_mlotem',[1,2,3])
# Square images are supplied active-arm layers. Rectangles place them as-is;
# no pixel deformation, mirroring, recolouring or recompression is performed.
def thor_frame(src,hammer=False):
    base=right if not hammer else asset(thor+'/mlot-uderzenie-bez-smugi.png')
    return {'layers':[{'src':base,'clip':[0,.5,.45,.5]}, {'src':src,'rect':[.35,.03,.62,1.1022222222]}]}
idle=heroes['thor']['idle']; hammer_idle=heroes['thor']['hammerIdle']
heroes['thor']['actions']['punch:1']=action([idle,thor_frame(bare[0]),thor_frame(bare[1]),thor_frame(bare[2]),right,thor_frame(bare[1]),thor_frame(bare[0]),idle],600,contact=.48,effect='punch')
heroes['thor']['actions']['punch:-1']=action([idle,{'layers':[{'src':left,'rect':[-.05,.08,1.05,1.05]}]},left,{'layers':[{'src':left,'rect':[0,-.03,1.03,1.03]}]},left,{'layers':[{'src':left,'rect':[-.03,.04,1.03,1.03]}]},left,idle],600,contact=.48,effect='punch')
hit=asset(thor+'/mlot-uderzenie-bez-smugi.png')
heroes['thor']['actions']['hammer:1']=action([hammer_idle,thor_frame(hammer[0],True),thor_frame(hammer[1],True),thor_frame(hammer[2],True),hit,thor_frame(hammer[1],True),thor_frame(hammer[0],True),hammer_idle],760,contact=.53,effect='hammer-dent')
heroes['thor']['actions']['throw:1']=sequence(thor+'/Klatki_lotu',None,1432,contact=.54,effect='hammer-dent')
heroes['thor']['actions']['throw:1']['durations']=[24]+[38]*36+[40]
iron='iron_man'; no=iron+'/Bez_lasera_bez_podswietlenia'; yes=iron+'/Z_laserem_i_podswietleniem'
heroes['iron']={'idle':asset(no+'/Pozycje_bazowe/garda.png'),'laserIdle':asset(yes+'/Pozycje_bazowe/otwarte-dlonie.png'),'actions':{}}
for side,word in [(-1,'lewa'),(1,'prawa')]:
    heroes['iron']['actions'][f'punch:{side}']=sequence(no+'/Cios_'+word,punch,520,contact=.45,effect='punch')
    heroes['iron']['actions'][f'laser:{side}']=sequence(yes+'/Strzal_'+word,None,680,contact=.48,effect='laser')
for side,word in [(-1,'lewa'),(1,'prawa')]:
    heroes['spider']['actions'][f'web:{side}']=sequence('spider_man/Pajeczyna_'+word,None,650,contact=.58,effect='web',defer=True)
webs={}
for name in ['Wiszaca_duza','Wiszaca_mala','Klasyczna_duza','Klasyczna_mala','Narozna','Kokon']:
    webs[name]=numbered('spider_man/Powstawanie_sieci/'+name,None)
fx={
 'punch':[asset('COMMON/uderzenie'+suffix+'.png') for suffix in ['', ' 2',' 3',' 4']],
 'wind':[asset('efekty/Smugi/'+name+'.png') for name in ['lewo-prawo-krotka','lewo-prawo-dluga','prawo-lewo-krotka','prawo-lewo-dluga']],
 'hulk-dent':[asset('hulk/Efekty/'+name+'.png') for name in ['Wgniecenie_plytkie','Wgniecenie_w_stali','Wgniecenie_glebokie','Wgniecenie_z_peknieciami']],
 'shield-dent':[asset('kapitan_ameryka/Efekty/Wgniecenie_po_tarczy.png')],
 'shield-contact':[asset('kapitan_ameryka/Pozycje_bazowe/efekt-trafienia.png')],
 'hammer-dent':[asset(thor+'/Efekty/Wgniecenie_po_mlocie.png')],
 'laser-contact':[asset('efekty/Laser/'+name+'.png') for name in ['01-trafienie-czerwone','02-trafienie-blekitne','03-trafienie-fioletowe']],
 'laser':[asset('efekty/Laser/'+name+'.png') for name in ['04-dziura-mala','05-dziura-owalna','06-dziura-postrzepiona']],
 'laser-tip':[asset('laser/00-rozblysk-na-koncu-promienia.png')],
}
data={'version':129,'frame':[1280,720],'heroes':heroes,'webs':webs,'effects':fx,'files':files}
(out/'sources.json').write_text(json.dumps(data,indent=2,ensure_ascii=False)+'\n')
(root/'assets/hero-assets127.js').write_text('// Original PNGs copied byte-for-byte from the supplied archive.\nexport const heroAssets127='+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';\n')
print(f'{len(files)} original PNGs, {sum(f["bytes"] for f in files.values())/1024**2:.1f} MiB. No image pixels changed.')
