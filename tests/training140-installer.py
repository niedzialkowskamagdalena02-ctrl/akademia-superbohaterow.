from pathlib import Path
import hashlib,importlib.util,json,subprocess,tempfile,zipfile
ROOT=Path(__file__).resolve().parents[1];PACK=ROOT.parent/'v140_package'
spec=importlib.util.spec_from_file_location('installer140',PACK/'AKADEMIA_V140_AKTUALIZUJ.py');module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
payload,manifest=module.verified_payload(PACK)
with tempfile.TemporaryDirectory(prefix='academy140-install-')as where:
 root=Path(where)
 def git(*args):return subprocess.run(['git',*args],cwd=root,check=True,capture_output=True,text=True).stdout
 git('init','-q');git('config','user.name','Installer Test');git('config','user.email','test@localhost');git('remote','add','origin','https://github.com/niedzialkowskamagdalena02-ctrl/akademia-superbohaterow..git')
 for name in ['assets/app.js','assets/mission-game.js','index.html','sw.js']:
  content=subprocess.run(['git','show','9b3f34d:'+name],cwd=ROOT,check=True,capture_output=True).stdout
  if name=='assets/app.js':content=content.replace(b'ACADEMY_RELEASE=138',b'ACADEMY_RELEASE=139')+b'\n// Independent hall loading fix: preserve me.\n'
  if name=='assets/mission-game.js':content+=b'\n// Independent assessment fix: preserve me.\n'
  target=root/name;target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(content)
 (root/'progress.json').write_text('{"coins":47,"keep":true}')
 (root/'assets/hall-untouched.png').write_bytes(b'original-hall')
 git('add','.');git('commit','-qm','V139 fixture with independent changes')
 result=subprocess.run(['python',str(PACK/'AKADEMIA_V140_AKTUALIZUJ.py'),'--project',str(root)],capture_output=True,text=True)
 assert result.returncode==0,result.stdout+result.stderr
 assert 'Independent hall loading fix' in (root/'assets/app.js').read_text()
 assert 'Independent assessment fix' in (root/'assets/mission-game140.js').read_text()
 assert json.loads((root/'progress.json').read_text())['coins']==47
 assert (root/'assets/hall-untouched.png').read_bytes()==b'original-hall'
 assert 'const ACADEMY_RELEASE=140;' in (root/'assets/app.js').read_text()
 assert not module.plan_update(root,payload,manifest),'Reinstall must be idempotent'
 for file in ['assets/app.js','assets/mission-game140.js','sw.js']:
  result=subprocess.run(['node','--check',str(root/file)],capture_output=True,text=True);assert result.returncode==0,result.stderr
 assets=json.loads(__import__('re').search(r'const ASSETS=(\[.*?\]);',(root/'sw.js').read_text())[1])
 for file in payload:
  if file.startswith('assets/'):assert './'+file+('?v=140'if file.endswith(('.js','.css'))else'')in assets,file
print('PASS installer V139 → V140; unrelated hall/engine fixes and progress intact, repeated install makes no change, all runtime assets in offline list.')
