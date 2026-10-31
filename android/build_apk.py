#!/usr/bin/env python3
"""Build the private Android APK with Android SDK 35 and JDK 17+.
Signing key and password file are supplied separately; never commit them.
"""
from pathlib import Path
import argparse,shutil,subprocess,zipfile,os,hashlib

def build(sdk_platform,build_tools,key,password,out):
 root=Path(__file__).resolve().parent
 work=root/'build'
 if work.exists():shutil.rmtree(work)
 work.mkdir();classes=work/'classes';classes.mkdir()
 java=shutil.which('java')
 if not java:raise SystemExit('JDK 17 or later is required.')
 android=sdk_platform/'android.jar'
 def run(*args):subprocess.run([str(x) for x in args],check=True)
 def native(name,*args):
  exe=build_tools/name
  exe.chmod(exe.stat().st_mode|0o100)
  run(exe,*args)
 sources=sorted((root/'app/src/main/java').rglob('*.java'))
 run(java,'com.sun.tools.javac.Main','-encoding','UTF-8','--release','8','-classpath',android,'-d',classes,*sources)
 native('aapt2','compile','--dir',root/'app/src/main/res','-o',work/'resources.zip')
 native('aapt2','link','-o',work/'unsigned.apk','--manifest',root/'app/src/main/AndroidManifest.xml','-I',android,'-A',root/'app/src/main/assets',work/'resources.zip')
 run(java,'-cp',build_tools/'lib/d8.jar','com.android.tools.r8.D8','--lib',android,'--min-api','26','--output',work,*sorted(classes.rglob('*.class')))
 with zipfile.ZipFile(work/'unsigned.apk','a',zipfile.ZIP_DEFLATED) as z:z.write(work/'classes.dex','classes.dex')
 native('zipalign','-f','-p','4',work/'unsigned.apk',work/'aligned.apk')
 run(java,'-jar',build_tools/'lib/apksigner.jar','sign','--ks',key,'--ks-key-alias','academy','--ks-pass','file:'+str(password),'--v4-signing-enabled','false','--out',out,work/'aligned.apk')
 run(java,'-jar',build_tools/'lib/apksigner.jar','verify','--verbose',out)
 print('APK SHA256:',hashlib.sha256(out.read_bytes()).hexdigest())

if __name__=='__main__':
 p=argparse.ArgumentParser()
 for n in ['platform','build-tools','key','password-file','output']:p.add_argument('--'+n,required=True,type=Path)
 a=p.parse_args();build(a.platform.resolve(),a.build_tools.resolve(),a.key.resolve(),a.password_file.resolve(),a.output.resolve())
