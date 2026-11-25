from pathlib import Path
import importlib.util,json,re,subprocess,tempfile,zipfile
ROOT=Path(__file__).resolve().parents[1];PACK=ROOT.parent/'v142_package'
spec=importlib.util.spec_from_file_location('installer142',PACK/'AKADEMIA_V142_AKTUALIZUJ.py');module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
payload,manifest=module.verified_payload(PACK)
with tempfile.TemporaryDirectory(prefix='academy142-install-')as where:
 root=Path(where)
 def git(*args):return subprocess.run(['git',*args],cwd=root,check=True,capture_output=True,text=True).stdout
 git('init','-q');git('config','user.name','Installer Test');git('config','user.email','test@localhost');git('remote','add','origin','https://github.com/niedzialkowskamagdalena02-ctrl/akademia-superbohaterow..git')
 originals={}
 names=['assets/app.js','index.html','sw.js','assets/hall-view138.js','assets/hall-layered137.js','assets/hall-assets141.js','assets/hall-loading141.js','assets/missions93.js','assets/mission-game140.js']
 for name in names:
  content=subprocess.run(['git','show','b409d82:'+name],cwd=ROOT,check=True,capture_output=True).stdout
  if name=='assets/app.js':content+=b'\n// Unrelated profile change: preserve me.\n'
  originals[name]=content;target=root/name;target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(content)
 (root/'progress.json').write_text('{"coins":47,"keep":true}')
 git('add','.');git('commit','-qm','V141 fixture')
 result=subprocess.run(['python',str(PACK/'AKADEMIA_V142_AKTUALIZUJ.py'),'--project',str(root)],capture_output=True,text=True)
 assert result.returncode==0,result.stdout+result.stderr
 assert 'Unrelated profile change: preserve me' in (root/'assets/app.js').read_text()
 for name in names[3:]:assert (root/name).read_bytes()==originals[name],name
 assert json.loads((root/'progress.json').read_text())['coins']==47
 assert 'const ACADEMY_RELEASE=142;' in (root/'assets/app.js').read_text()
 assert not module.plan_update(root,payload,manifest),'Reinstall must be idempotent'
 for name in ['assets/app.js','assets/base-walk85.js','assets/hero-animation127.js','assets/training139-player.js','assets/spider142/gra.js','sw.js']:
  result=subprocess.run(['node','--check',str(root/name)],capture_output=True,text=True);assert result.returncode==0,result.stderr
 assets=json.loads(re.search(r'const ASSETS=(\[.*?\]);',(root/'sw.js').read_text())[1])
 for name in payload:
  if name.startswith('assets/'):assert './'+name+('?v=142' if name.endswith(('.js','.css','.html'))else'')in assets,name
 for name in ['assets/app.js','assets/base-walk85.js','assets/hero-gestures130.js','assets/hero-animation127.js','assets/training139/catalog.js','assets/training139/frame-bridge.js','assets/spider142/pre.html','assets/spider142/school.html']:
  assert './'+name+'?v=142'in assets,name
 assert './assets/training139/pages/closet-school.html?v=142'in assets
 assert not any('hands127/'in p for p in assets),'Do not redownload all hero PNGs at each update'
 # Interrupted publication is recoverable by rerunning an already-installed ZIP.
 head=git('rev-parse','HEAD');module.install(root,{});assert git('rev-parse','HEAD')==head
 # Refuse an unrelated future release before writing anything.
 app=root/'assets/app.js';app.write_text(app.read_text().replace('ACADEMY_RELEASE=142','ACADEMY_RELEASE=150'))
 try:module.plan_update(root,payload,manifest)
 except ValueError:pass
 else:raise AssertionError('Do not downgrade a future version')
with zipfile.ZipFile(ROOT.parent/'AKADEMIA_V142_SPIDERMAN.zip')as archive:assert archive.testzip() is None
print('PASS V141 → V142 ZIP/installer: selective app launcher update; original hall, snail engine, other games and progress retained; idempotent/recoverable; future release protected; fresh offline page/module keys; ZIP integrity.')
