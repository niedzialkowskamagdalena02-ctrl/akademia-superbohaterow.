#!/usr/bin/env python3
"""Conservative runtime dependency audit. Precache and tests are not evidence
that an old illustration is used. Dynamic asset folders are retained.

--archive ZIP writes a reversible archive; --apply removes only its verified
members from the working tree. Run from the repository root.
"""
from pathlib import Path
from collections import deque
from urllib.parse import unquote
import argparse,re,json,hashlib,zipfile

ROOT=Path(__file__).resolve().parents[1]
GRAPHICS={'.webp','.png','.jpg','.jpeg','.gif','.svg','.avif'}
TEXT={'.js','.css','.html','.webmanifest','.svg'}
def audit():
    queue=deque();seen=set();urls=set();reasons={};patterns=set()
    def add(raw,parent,why):
        raw=raw.strip().strip('"\'').replace('\\','/')
        if not raw or raw.startswith(('data:','http:','https:','blob:','#','plugin:')):return
        if raw.startswith('//'):return
        if '${' in raw and not raw.startswith(('assets/','./','../')):return
        path,_,query=raw.partition('?');path=path.split('#')[0]
        if path.startswith('assets/') or path in ['icon.svg','manifest.webmanifest','sw.js']:
            rel=path
        else:
            rel=(parent/Path(path)).as_posix()
        rel=re.sub(r'\$\{[^}]+\}','*',rel)
        rel=re.sub(r'\*+','*',rel)
        try:
            abs_path=(ROOT/rel).resolve();abs_path.relative_to(ROOT)
        except (ValueError,OSError):return
        rel=abs_path.relative_to(ROOT).as_posix()
        if '*' in rel:
            patterns.add(rel)
            for p in ROOT.glob(rel):
                if p.is_file():add(p.relative_to(ROOT).as_posix(),Path('.'),why+' [dynamic]')
            return
        if abs_path.is_dir():
            if rel in ['.','assets']:return
            patterns.add(rel+'/**')
            for p in abs_path.rglob('*'):
                if p.is_file() and p.suffix in GRAPHICS:add(p.relative_to(ROOT).as_posix(),Path('.'),why+' [folder]')
            return
        if not abs_path.is_file():return
        url='./'+rel+('?'+query if query else '')
        urls.add(url);reasons.setdefault(rel,set()).add(why)
        if rel not in seen:seen.add(rel);queue.append(abs_path)
    for rel in ['index.html','v80-test.html','manifest.webmanifest']:
        add(rel,Path('.'),'entry')
    while queue:
        p=queue.popleft();rel=p.relative_to(ROOT).as_posix()
        if p.suffix not in TEXT or p.name=='sw.js':continue
        s=p.read_text();parent=p.parent.relative_to(ROOT)
        # Imports, CSS url(), DOM URLs and manifest image sources.
        for raw in re.findall(r'(?:from\s*|import\s*\(?)["\']([^"\']+)["\']',s):add(raw,parent,rel)
        for raw in re.findall(r'url\(\s*["\']?([^\)"\']+)',s):add(raw,parent,rel)
        for raw in re.findall(r'(?:src|href)\s*[=:]\s*["\']([^"\']+)["\']',s):add(raw,parent,rel)
        # Literal and template asset URLs, including helper-generated variants.
        for raw in re.findall(r'assets/[A-Za-z0-9_./${}\-?=]+',s):add(raw,Path('.'),rel)
        if p.suffix=='.webmanifest':
            for icon in json.loads(s).get('icons',[]):add(icon['src'],parent,rel)
    all_graphics=sorted(p for p in (ROOT/'assets').rglob('*') if p.is_file() and p.suffix.lower() in GRAPHICS)
    unused=[p for p in all_graphics if p.relative_to(ROOT).as_posix() not in seen]
    return {'runtime_files':sorted(seen),'runtime_urls':sorted(urls),'dynamic_patterns':sorted(patterns),
            'unused':[{'path':p.relative_to(ROOT).as_posix(),'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for p in unused],
            'used_graphics':len(all_graphics)-len(unused),'unused_bytes':sum(p.stat().st_size for p in unused)}

def main():
    ap=argparse.ArgumentParser();ap.add_argument('--report',required=True);ap.add_argument('--archive');ap.add_argument('--apply',action='store_true');args=ap.parse_args()
    report=audit();Path(args.report).write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
    if args.archive:
        with zipfile.ZipFile(args.archive,'w',zipfile.ZIP_DEFLATED,compresslevel=6) as z:
            z.writestr('GRAFIKI_MANIFEST_V124.json',json.dumps(report['unused'],ensure_ascii=False,indent=2))
            for row in report['unused']:z.write(ROOT/row['path'],row['path'])
        with zipfile.ZipFile(args.archive) as z:
            assert z.testzip() is None
            for row in report['unused']:assert hashlib.sha256(z.read(row['path'])).hexdigest()==row['sha256']
        if args.apply:
            for row in report['unused']:(ROOT/row['path']).unlink()
    elif args.apply:raise SystemExit('--apply requires --archive')
    print(json.dumps({'kept_graphics':report['used_graphics'],'archived_graphics':len(report['unused']),'unused_bytes':report['unused_bytes']},ensure_ascii=False))
if __name__=='__main__':main()
