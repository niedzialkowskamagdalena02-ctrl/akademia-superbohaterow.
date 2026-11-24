from pathlib import Path
import hashlib,importlib.util,json,re,shutil,subprocess,tempfile
ROOT=Path(__file__).resolve().parents[1];PACK=ROOT.parent/'v141_package'
spec=importlib.util.spec_from_file_location('installer141',PACK/'AKADEMIA_V141_AKTUALIZUJ.py');module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
payload,manifest=module.verified_payload(PACK)
with tempfile.TemporaryDirectory(prefix='academy141-install-')as where:
 root=Path(where)
 def git(*args):return subprocess.run(['git',*args],cwd=root,check=True,capture_output=True,text=True).stdout
 git('init','-q');git('config','user.name','Installer Test');git('config','user.email','test@localhost');git('remote','add','origin','https://github.com/niedzialkowskamagdalena02-ctrl/akademia-superbohaterow..git')
 originals={}
 for name in ['assets/app.js','assets/mission-game140.js','assets/training139-catalog.js','index.html','sw.js']:
  content=subprocess.run(['git','show','c1b3516:'+name],cwd=ROOT,check=True,capture_output=True).stdout
  if name=='assets/app.js':content+=b'\n// Unrelated training change: preserve me.\n'
  originals[name]=content;target=root/name;target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(content)
 image_dir=root/'assets/hq/hall138';image_dir.mkdir(parents=True)
 original_hashes={}
 for name in manifest['required_images']:
  source=ROOT/'assets/hq/hall138'/name;shutil.copyfile(source,image_dir/name);original_hashes[name]=hashlib.sha256(source.read_bytes()).hexdigest()
 (root/'progress.json').write_text('{"coins":47,"keep":true}')
 git('add','.');git('commit','-qm','V140 fixture')
 result=subprocess.run(['python',str(PACK/'AKADEMIA_V141_AKTUALIZUJ.py'),'--project',str(root)],capture_output=True,text=True)
 assert result.returncode==0,result.stdout+result.stderr
 assert 'Unrelated training change' in (root/'assets/app.js').read_text()
 assert (root/'assets/mission-game140.js').read_bytes()==originals['assets/mission-game140.js']
 assert (root/'assets/training139-catalog.js').read_bytes()==originals['assets/training139-catalog.js']
 assert json.loads((root/'progress.json').read_text())['coins']==47
 for name,digest in original_hashes.items():assert hashlib.sha256((image_dir/name).read_bytes()).hexdigest()==digest
 assert 'const ACADEMY_RELEASE=141;' in (root/'assets/app.js').read_text()
 assert not module.plan_update(root,payload,manifest),'Reinstall must be idempotent'
 for name in ['assets/app.js','assets/base-walk85.js','assets/hall-view138.js','sw.js']:
  result=subprocess.run(['node','--check',str(root/name)],capture_output=True,text=True);assert result.returncode==0,result.stderr
 assets=json.loads(re.search(r'const ASSETS=(\[.*?\]);',(root/'sw.js').read_text())[1])
 for name in payload:
  if name.startswith('assets/'):assert './'+name+('?v=141' if name.endswith(('.js','.css','.html'))else'')in assets,name
 assert './assets/training139/pages/closet-school.html?v=141'in assets
print('PASS V140 → V141 installer: training engine/catalog and all original hall PNGs unchanged; progress retained; repeated installation makes no change; fresh module and game-page cache keys.')
