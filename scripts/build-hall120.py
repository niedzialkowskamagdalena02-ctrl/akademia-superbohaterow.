#!/usr/bin/env python3
"""Map the supplied entrance crops into the continuous V119 hall.

Usage: python3 scripts/build-hall120.py /path/to/Ujecia_Holu_4K.zip
Requires Pillow. No generated or repainted content is used for the entrances.
"""
from pathlib import Path
from io import BytesIO
import hashlib
import json
import sys
import zipfile
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
SPEC = {
  "pet": {
    "file": "04_Kacik_zwierzaka.png",
    "crop": [
      0,
      615,
      562,
      485
    ],
    "polygon": [
      [
        0,
        615
      ],
      [
        435,
        615
      ],
      [
        514,
        702
      ],
      [
        515,
        868
      ],
      [
        558,
        900
      ],
      [
        562,
        1015
      ],
      [
        0,
        1100
      ]
    ],
    "target": [
      0,
      432,
      145,
      199
    ],
    "plate": [
      119,
      898,
      416,
      159
    ],
    "uvRect": [
      0.017307129072767175,
      0.6179453503643697,
      0.0605022327249676,
      0.07355036669417357
    ]
  },
  "armory": {
    "file": "05_Zbrojownia.png",
    "crop": [
      0,
      373,
      582,
      609
    ],
    "polygon": [
      [
        0,
        531
      ],
      [
        195,
        373
      ],
      [
        468,
        426
      ],
      [
        582,
        568
      ],
      [
        582,
        935
      ],
      [
        0,
        982
      ]
    ],
    "target": [
      124,
      297,
      237,
      269
    ],
    "plate": [
      86,
      830,
      438,
      108
    ],
    "uvRect": [
      0.08963958205000058,
      0.5624131081503861,
      0.10054161484908007,
      0.05378177395438213
    ]
  },
  "shop": {
    "file": "07_Sklep.png",
    "crop": [
      62,
      636,
      587,
      425
    ],
    "polygon": [
      [
        62,
        687
      ],
      [
        339,
        636
      ],
      [
        624,
        689
      ],
      [
        649,
        1061
      ],
      [
        62,
        1061
      ]
    ],
    "target": [
      350,
      342,
      211,
      213
    ],
    "plate": [
      151,
      967,
      404,
      89
    ],
    "uvRect": [
      0.2153277802212154,
      0.5725923469726109,
      0.08186006848880958,
      0.05028715432057829
    ]
  },
  "vault": {
    "file": "08_Skarbiec.png",
    "crop": [
      89,
      597,
      519,
      413
    ],
    "polygon": [
      [
        89,
        707
      ],
      [
        218,
        610
      ],
      [
        529,
        597
      ],
      [
        608,
        689
      ],
      [
        608,
        1010
      ],
      [
        89,
        1010
      ]
    ],
    "target": [
      546,
      334,
      200,
      213
    ],
    "plate": [
      200,
      917,
      310,
      78
    ],
    "uvRect": [
      0.3318909619357319,
      0.5626114088078814,
      0.06733962850247528,
      0.04535242717651523
    ]
  },
  "training": {
    "file": "06_Sala_Treningowa.png",
    "crop": [
      0,
      477,
      709,
      609
    ],
    "polygon": [
      [
        0,
        853
      ],
      [
        83,
        790
      ],
      [
        83,
        583
      ],
      [
        197,
        477
      ],
      [
        508,
        477
      ],
      [
        625,
        584
      ],
      [
        625,
        795
      ],
      [
        709,
        853
      ],
      [
        709,
        1037
      ],
      [
        575,
        1086
      ],
      [
        136,
        1086
      ],
      [
        0,
        1037
      ]
    ],
    "target": [
      687,
      317,
      387,
      281
    ],
    "plate": [
      125,
      938,
      462,
      105
    ],
    "uvRect": [
      0.42572147760394224,
      0.5971939139143586,
      0.14215203781943542,
      0.054620378649457686
    ]
  },
  "arcade": {
    "file": "01_Centrum_Rozrywki.png",
    "crop": [
      70,
      309,
      597,
      547
    ],
    "polygon": [
      [
        70,
        435
      ],
      [
        193,
        327
      ],
      [
        528,
        309
      ],
      [
        667,
        427
      ],
      [
        667,
        856
      ],
      [
        70,
        835
      ]
    ],
    "target": [
      1221,
      328,
      217,
      232
    ],
    "plate": [
      143,
      752,
      432,
      86
    ],
    "uvRect": [
      0.7032324342494131,
      0.5816125262526562,
      0.08851472696062046,
      0.04112211942150379
    ]
  },
  "hangar": {
    "file": "03_Hangar.png",
    "width": 711,
    "crop": [
      0,
      237,
      581,
      661
    ],
    "polygon": [
      [
        0,
        365
      ],
      [
        359,
        237
      ],
      [
        581,
        449
      ],
      [
        581,
        898
      ],
      [
        0,
        886
      ]
    ],
    "target": [
      1407,
      299,
      240,
      268
    ],
    "plate": [
      76,
      790,
      358,
      89
    ],
    "uvRect": [
      0.8108197001243822,
      0.5898667421674993,
      0.08336130801188325,
      0.04068175887376409
    ]
  }
}

def build(archive):
    output = ROOT / 'assets/hq/panorama120'
    output.mkdir(parents=True, exist_ok=True)
    background = ROOT / 'assets/hq/panorama119/hall.png'
    image = Image.open(background).convert('RGB')
    width, height = 6144, 3072
    scale = width / image.width
    image = image.resize((width, height), Image.Resampling.LANCZOS)
    records = []
    with zipfile.ZipFile(archive) as zipped:
        for key, spec in SPEC.items():
            raw = zipped.read('Ujecia_Holu_4K/' + spec['file'])
            original = Image.open(BytesIO(raw)).convert('RGB')
            sx = original.width / spec.get('width', 709)
            sy = original.height / 1536
            x, y, w, h = spec['crop']
            box = [round(x*sx), round(y*sy), round((x+w)*sx), round((y+h)*sy)]
            crop = original.crop(box)
            mask = Image.new('L', crop.size)
            ImageDraw.Draw(mask).polygon([(round(px*sx)-box[0], round(py*sy)-box[1])
                                         for px, py in spec['polygon']], fill=255)
            tx, ty, tw, th = spec['target']
            size = (round(tw*scale), round(th*scale))
            mask = mask.resize(size, Image.Resampling.LANCZOS).filter(ImageFilter.GaussianBlur(1.5))
            image.paste(crop.resize(size, Image.Resampling.LANCZOS),
                        (round(tx*scale), round(ty*scale)), mask)
            records.append({'id': key, 'source': spec['file'], 'source_size': list(original.size),
                            'source_sha256': hashlib.sha256(raw).hexdigest(), 'source_crop': box,
                            'crop_reference': spec['crop'], 'mask_reference': spec['polygon'],
                            'target_reference': spec['target'], 'hit_uv': spec['uvRect']})
    target = output / 'hall.webp'
    image.save(target, lossless=True, method=6)
    metadata = {'width': width, 'height': height,
                'sha256': hashlib.sha256(target.read_bytes()).hexdigest(),
                'background': 'assets/hq/panorama119/hall.png',
                'background_sha256': hashlib.sha256(background.read_bytes()).hexdigest(),
                'method': 'masked crops, resampling and edge feather; background resized from V119; no new image generation',
                'reference_size': [1774,887], 'entrances': records}
    (output/'sources.json').write_text(json.dumps(metadata, ensure_ascii=False, indent=2)+'\n')
    # Share the same coordinates with the runtime to prevent texture/hit-area drift.
    data = {r['id']: r['hit_uv'] for r in records}
    (ROOT/'assets/hall-entries120.js').write_text('export const hallEntries120 = '+json.dumps(data,indent=2)+';\n')
    print('Built', target, target.stat().st_size, 'bytes')

if __name__ == '__main__':
    build(sys.argv[1])
