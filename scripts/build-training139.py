#!/usr/bin/env python3
"""Adapt supplied playable previews and deduplicate original bytes by SHA-256."""
from pathlib import Path
import re,json,hashlib,shutil
ROOT=Path(__file__).resolve().parents[1];SRC=ROOT.parent/'training139_sources';OUT=ROOT/'assets/training139';PAGES=OUT/'pages';MEDIA=OUT/'media'
PAGES.mkdir(parents=True,exist_ok=True);MEDIA.mkdir(exist_ok=True)
packs={
 'letters':'patryk/Kosmiczne_Poznaj_Literki','numbers':'patryk/Kosmiczne_Cyfrowe_Lowy_v2',
 'order':'oboje/Kosmiczne_Literki_w_Kolejnosci','trace':'patryk/Kosmiczne_Pisanie_po_Sladzie',
 'rally':'patryk/Literkowy_Rajd_Plynne_Pisanie','rhymes':'patryk/Rymowanki_30_Zagadek_Dwie_Wersje',
 'camera':'patryk/Zaczarowany_Aparat_Litery_na_Przedmiotach','dino':'oboje/Dinozaur_Dwie_Wersje',
 'rail':'oboje/Pociag_Pelen_Cyferek_Dwie_Wersje','closet':'oboje/Szafa_Zwierzatek_Klatki_i_Zadania_AI (1)',
 'grammar':'pawel/Czesci_Mowy_Laboratorium_Slow'}
existing={hashlib.sha256(p.read_bytes()).hexdigest():p for p in (ROOT/'assets/space132').glob('*.png')}
assets={};audits=[];pages={};registry=[]
def literal(s):return json.dumps(s,ensure_ascii=False).replace('<','\\u003c')
for kind,folder in packs.items():
 d=SRC/folder;mapping={}
 for f in d.rglob('*'):
  if not f.is_file() or f.suffix.lower() not in ['.png','.webp','.svg']:continue
  rel=f.relative_to(d).as_posix()
  if any(part.startswith('Literkowy_Rajd_')for part in f.relative_to(d).parts):continue
  if len(f.relative_to(d).parts)==1 and rel not in ['tlo.webp']:continue
  sha=hashlib.sha256(f.read_bytes()).hexdigest()
  if sha in existing:target=existing[sha]
  elif sha in assets:target=assets[sha]
  else:
   name=re.sub('[^a-zA-Z0-9_.-]','_',f.name);target=MEDIA/(sha[:12]+'_'+name);shutil.copyfile(f,target);assets[sha]=target
  mapping[rel]='../../'+target.relative_to(ROOT/'assets').as_posix()
  audits.append({'pack':kind,'source':str(f.relative_to(SRC)),'runtime':target.relative_to(ROOT).as_posix(),'sha256':sha})
 variants={'pre':'Podglad.html'}
 if kind=='rhymes':variants={'pre':'Przedszkolak.html','school':'Klasy_1-3.html'}
 if kind=='dino':variants={'pre':'Przedszkolak.html','school':'Klasy_1-3.html'}
 if kind=='rail':variants={'pre':'Patryk_Przedszkolak.html','school':'Pawel_Klasy_1-3.html'}
 if kind=='closet':variants={'pre':'Patryk_Przedszkole.html','school':'Pawel_Klasy_1-3.html'}
 if kind=='grammar':
  art={Path(k).stem:v.replace('../../','assets/',1)for k,v in mapping.items()}
  (OUT/'grammar-art.js').write_text('export const grammarArt139='+literal(art)+';\n')
  for key,name in [('plecak','Plecak'),('pies','Pies'),('zaba','Żaba'),('rakieta','Rakieta'),('robot','Robot'),('jablko','Jabłko')]:
   registry.append({'id':'grammar-'+key,'name':name,'file':art[key]})
  continue
 pages[kind]={}
 for mode,file in variants.items():
  html=(d/file).read_text()
  html=re.sub(r'<script src="gra.js"></script>',lambda m:'<script>\n'+(d/'gra.js').read_text()+'\n</script>',html)
  # Resolve both static URLs and dynamic img.src/background assignments to the
  # common, byte-identical media. No image is recompressed or regenerated.
  for source,target in sorted(mapping.items(),key=lambda x:-len(x[0])):html=html.replace(source,target)
  def scripts(match):
   s=match[1]
   s=re.sub(r'(\b[\w.$()]+\.src\s*=)\s*([^;\n]+);',r'\1Training139.asset(\2);',s)
   s=re.sub(r'(\.style\.backgroundImage\s*=)\s*([^;\n]+);',r'\1Training139.css(\2);',s)
   s=s.replace('localStorage.getItem','Training139.storage.getItem').replace('localStorage.setItem','Training139.storage.setItem')
   if kind in ['letters','numbers']:
    s=re.sub(r'const config=\{.*?\};', 'const config=Training139.restore?.config||Training139.config.letterConfig;',s,count=1)
    s=s.replace('let i=0, correct=0, skipped=0, locked=false, paused=false;','let i=Training139.restore?.index||0, correct=Training139.restore?.score||0, skipped=Training139.restore?.skipped||0, locked=false, paused=false;')
    s=s.replace('function render(){','function render(){\n Training139.save({index:i,score:correct,skipped,config,roundComplete:false,context:{question:'+('"Którą liczbę słyszysz?"' if kind=='numbers'else'config.questions[i]?.[0]')+',answer:config.questions[i]?.[2]?.[config.questions[i]?.[3]],options:config.questions[i]?.[2]}});')
    s=s.replace('correct++;','correct++;Training139.save({index:i+1,score:correct,skipped,config,roundComplete:true});')
    s=s.replace('i++;skipped++;render();','i++;skipped++;Training139.advance();render();')
    s=s.replace('i++;render();','i++;Training139.advance();render();')
   if kind in ['order','rhymes']:
    s=s.replace('let index=0;','let index=0;let correct=Training139.restore?.score||0,skipped=Training139.restore?.skipped||0,roundSolved=false;')
    s=s.replace("heading.textContent='Brawo, misja ukończona!';","heading.textContent='Misja zakończona';message.textContent='Poprawne: '+correct+' · pominięte: '+skipped;")
   if kind=='order':
    s=re.sub(r'const mode="order", rounds=.*?;', 'const mode="order";let rounds=Training139.restore?.rounds||Training139.config.orderRounds;',s,count=1)
    s=s.replace('let index=0;','let index=Training139.restore?.index||0;')
    s=s.replace('function render(){','function render(){roundSolved=false;Training139.save({index,rounds,picks:[],score:correct,skipped,roundComplete:false,context:{question:"Ułóż litery w kolejności alfabetu.",answer:rounds[index]?.[1]?.join(", ")}});')
    s=s.replace('picks.push(letter);','picks.push(letter);Training139.save({index,rounds,picks,score:correct,skipped});if(picks.length===rounds[index][1].length)document.querySelector(".slots")?.classList.add("complete");')
    s=s.replace('index++;render();','index++;Training139.advance();render();')
    s=s.replace('progress(index+1);','correct++;roundSolved=true;Training139.save({index:index+1,picks:[],score:correct,roundComplete:true});progress(index+1);')
   if kind=='rhymes':
    s=s.replace('let rounds=sampleRounds();','let rounds=Training139.restore?.rounds||Training139.config.rhymeRounds;')
    s=s.replace('let index=0;','let index=Training139.restore?.index||0;')
    s=s.replace('const q=rounds[index];','const q=rounds[index];roundSolved=false;Training139.save({index,rounds,score:correct,skipped,roundComplete:false,context:q?{question:q[1],answer:q[3],word:q[4],options:q[2]}:{}});')
    s=s.replace('progress(index+1);','correct++;roundSolved=true;progress(index+1);Training139.save({index:index+1,rounds,score:correct,skipped,roundComplete:true});')
    s=s.replace('index++;render();','index++;Training139.advance();render();')
   if kind=='trace':
    return '<script type="module">import {mountTrace92} from "../../learning-trace92.js?v=95";\nconst root=document.querySelector("#play");document.querySelector("#heading").textContent="Pisz po śladzie";mountTrace92(root,{speak:Training139.speak,onFinish:()=>{Training139.save({glyph:root.querySelector("select").value,completed:true});Training139.advance();}});Training139.onSkip=()=>root.querySelector("[data-trace-act=next]").click();</script>'
   if kind=='rally':
    s=s.replace('const upper=[...alphabet].map(glyph=>letterRoute(glyph,true));','const upper=[...alphabet].map(glyph=>[glyph,Training139.config.routes[glyph]]);')
    s=s.replace('const lower=[...alphabet.toLowerCase()].map(glyph=>letterRoute(glyph,false));','const lower=[...alphabet.toLowerCase()].map(glyph=>[glyph,Training139.config.routes[glyph]]);')
    s=s.replace('let rounds=shuffledSigns(sets.mixed);','let rounds=Training139.restore?.rounds||shuffledSigns(sets.mixed);')
    s=s.replace('let bag=[], lastBackground;','let bag=Training139.restore?.backgroundBag||[], lastBackground;')
    s=s.replace('lastBackground=bag.pop();return lastBackground;','lastBackground=bag.pop();Training139.save({backgroundBag:bag,lastBackground});return lastBackground;')
    s=s.replace('if(keepScene!==true)currentBackground=nextBackground();','if(!currentBackground&&Training139.restore?.lastBackground)currentBackground=Training139.restore.lastBackground;else if(keepScene!==true)currentBackground=nextBackground();')
    s=s.replace('let index=0;','let index=Training139.restore?.index||0;')
    s=s.replace('function render(keepScene=false){','function render(keepScene=false){\n Training139.save({index,rounds,context:{question:"Narysuj znak po śladzie.",answer:rounds[index][0]}});')
    s=s.replace("progress(index+1);road.classList.add('finished');", "progress(index+1);Training139.save({index:index+1,rounds,lastBackground:null});Training139.advance();road.classList.add('finished');")
   if kind=='camera':
    s=re.sub(r'const rounds=\[.*?;', 'const rounds=Training139.restore?.rounds||Training139.config.cameraRounds;',s,count=1)
    s=s.replace('let round=0, found=0, scene=0;','let round=Training139.restore?.round||0, found=0, scene=0;let sceneBag=Training139.restore?[...Training139.restore.sceneBag,Training139.restore.scene]:[],seen=[];')
    s=s.replace('function render(){','function render(){\n if(!sceneBag.length)sceneBag=Training139.shuffle(scenes.map((_,i)=>i));setScene(sceneBag.pop());seen=[];\n Training139.save({round,rounds,sceneBag,context:{question:"Sfotografuj wszystkie "+rounds[round][0],answer:rounds[round][0],options:rounds[round][1]}});')
    s=s.replace('found++;board.classList.remove', 'found++;seen.push(i);Training139.save({round,rounds,sceneBag,scene,seen});board.classList.remove')
    s=s.replace('round=(round+1)%rounds.length;', 'round=(round+1)%rounds.length;Training139.advance();')
   if kind=='dino':
    s=re.sub(r'const bank=\[.*?;', 'const bank=Training139.config.objects;',s,count=1)
    s=re.sub(r'const tasks=\[.*?;', 'const tasks=Training139.config.dinoTasks;',s,count=1)
    s=s.replace("$('#filter').hidden=false;","$('#filter').hidden=true;")
    s=s.replace("answer=letter;","answer=letter;Training139.save({queue,current,score,context:{question:older?current.polecenie:$('#task').textContent,answer:letter,word:current.nazwa,options:older?current.opcje:[]}});")
    s=s.replace("dino.classList.remove('rub');topic.disabled=false;round();", "dino.classList.remove('rub');topic.disabled=false;Training139.advance();round();")
    s=s.replace('const wait=(ms)=>new Promise(resolve=>setTimeout(resolve,ms));','const wait=(ms)=>new Promise(resolve=>setTimeout(resolve,matchMedia("(prefers-reduced-motion: reduce)").matches?0:ms));')
   if kind=='rail':
    s=s.replace("wagon.setAttribute('aria-label'", "wagon.dataset.wagon=number;wagon.setAttribute('aria-label'")
    s=s.replace('redraw(wagon);','redraw(wagon);Training139.save({current:{...current,labels:[...current.labels]},level,loaded:[...loaded],dropped:[...dropped],context:{question:instructions[mode].join(" "),answer:[...current.labels.values()].join(", ")}});')
    s=s.replace('level++;start();','level++;Training139.advance();start();')
    s=s.replace('redraw();\n}', 'redraw();Training139.save({level,current:{...current,labels:[...current.labels]},loaded:[...loaded],dropped:[...dropped],context:{question:instructions[mode].join(" "),answer:[...current.labels.values()].join(", ")}});\n}')
    s=s.replace('pick.onclick=()=>{selected=i;', 'pick.onclick=()=>{if(pick.skipClick){pick.skipClick=false;return;}selected=i;')
    s=s.replace('pick.ondragstart=e=>e.dataTransfer.setData', 'Training139.dragCargo(pick,i,load);pick.ondragstart=e=>e.dataTransfer.setData')
   if kind=='closet':
    s=re.sub(r'const missions=\[.*?\n\];','const missions=Training139.config.closetMissions;',s,count=1,flags=re.S)
    s=s.replace('let rounds=school?schoolRounds():createRounds();','let rounds=Training139.restore?.rounds||(school?schoolRounds():createRounds());')
    s=s.replace('let index=0,selected={}', 'let index=Training139.restore?.index||0,selected={}')
    s=s.replace('const current=rounds[index];selected={};solved=false;', 'const current=rounds[index];selected={};solved=false;Training139.save({index,rounds,selected:{},context:{question:school?current.mission+". "+current.topTask[0]+" "+current.bottomTask[0]:"Dobierz wielką i małą literę.",answer:school?current.topTask[2]+", "+current.bottomTask[2]:current.target}});')
    s=s.replace('selected[group]=letter;', 'selected[group]=letter;Training139.save({selected});')
    s=s.replace("solved=true;$('.status')", "solved=true;Training139.save({index:index+1,rounds,selected:{}});$('.status')")
    s=s.replace('index++;}render();','index++;}Training139.advance();render();')
   s=s.replace('location.reload()','Training139.back()')
   tails={
    'letters':'Training139.onSkip=()=>{if(!locked){i++;skipped++;render();}};',
    'numbers':'Training139.onSkip=()=>{if(!locked){i++;skipped++;render();}};',
    'order':'Training139.onSkip=()=>{if(!roundSolved){index++;skipped++;render();}};if(Training139.restore?.picks?.length){render();for(const wanted of Training139.restore.picks){[...play.querySelectorAll(".pick")].find(b=>b.textContent===wanted&&!b.disabled)?.click();}}',
    'rhymes':'Training139.onSkip=()=>{if(!roundSolved){index++;skipped++;render();}};',
    'rally':'Training139.onSkip=nextSign;',
    'camera':'Training139.onSkip=()=>document.querySelector("#next").onclick();if(Training139.restore?.seen){for(const i of Training139.restore.seen)board.querySelectorAll(".object")[i]?.click();}',
    'dino':'Training139.onSkip=()=>{if(!busy)round();};if(Training139.restore?.current){queue=Training139.restore.queue||[];queue.push(Training139.restore.current);score=Training139.restore.score||0;round();}',
    'rail':'Training139.onSkip=()=>{level++;start();};if(Training139.restore?.current){const r=Training139.restore;current={...r.current,labels:new Map(r.current.labels)};level=r.level;loaded=new Set(r.loaded);dropped=new Set(r.dropped);redraw();document.querySelector(".scene").style.backgroundImage=Training139.css("url(tla/"+current.bg+".webp)");document.querySelector("#station").textContent="Stacja "+(level+1)+" · "+current.station;document.querySelector("#leave").hidden=loaded.size!==current.wagons.length;Training139.save({level,current:{...current,labels:[...current.labels]},loaded:[...loaded],dropped:[...dropped]});}',
    'closet':'Training139.onSkip=()=>{index=(index+1)%rounds.length;render();};if(Training139.restore?.selected){for(const [g,value]of Object.entries(Training139.restore.selected)){const node=document.querySelector(g==="top"?"#tops":"#bottoms");[...node.querySelectorAll(".pick")].find(b=>b.textContent===value)?.click();}}'
   }
   s+='\n'+tails.get(kind,'')
   return '<script>\n'+s+'\n</script>'
  html=re.sub(r'<script>([\s\S]*?)</script>',scripts,html)
  if kind=='trace':html=html.replace('<style>','<link rel="stylesheet" href="../../learning92.css?v=92"><style>',1)
  config='<script>window.TRAINING139_ASSETS='+literal(mapping)+';</script><script src="../frame-bridge.js?v=140"></script>'
  html=html.replace('<style>',config+'<style>',1)
  # Preview-only age/topic/scene controls are not part of the game flow.
  extra='<style>#filter,#scene,#random{display:none!important}body .lg92-trace-board{background:#fff9e9}body [data-trace-start]{fill:#ffc83d;filter:drop-shadow(0 0 3px #f0b800)}.slots.complete{box-shadow:0 0 20px #79edb1}.training139-paused{pointer-events:none;filter:blur(3px)}body.training139-paused *{animation-play-state:paused!important}</style>'
  html=html.replace('</style>','</style>'+extra,1)
  name=kind+'-'+mode+'.html';(PAGES/name).write_text(html);pages[kind][mode]='assets/training139/pages/'+name
 # Reuse the full object/riddle libraries, independent of folder duplicates.
 if kind=='dino':
  for item in json.loads((d/'Katalog_przedmiotow.json').read_text()):
   if item['plik'] in mapping:registry.append({'id':Path(item['plik']).stem,'name':item['nazwa'],'file':mapping[item['plik']].replace('../../','assets/',1)})
 if kind=='rail':
  labels=['Balon','Jabłko','Gruszka','Miś','Klocek','Prezent','Truskawka','Banan','Pomarańcza','Ananas','Marchew','Dynia','Grzyb','Żołądź','Kasztan','Szyszka','Liść','Słonecznik','Samochodzik','Kaczuszka','Piłka','Bębenek','Latawiec','Wiaderko','Rozgwiazda','Muszla','Rękawiczka','Śnieżynka','Gwiazda','Cukierek']
  keys=json.loads((d/'Katalog.json').read_text())['cargo'] if 'cargo' in json.loads((d/'Katalog.json').read_text()) else []
  if not keys:keys=json.loads(re.search(r'const catalog=(\{.*?\});',(d/'gra.js').read_text())[1])['cargo']
  for key,label in zip(keys,labels):
   rel='grafiki/'+key+'.png'
   if rel in mapping:registry.append({'id':key,'name':label,'file':mapping[rel].replace('../../','assets/',1)})
 if kind=='rhymes':
  bank=json.loads((d/'Bank_30_zagadek.json').read_text())
  for row in bank:
   row['obraz']=mapping.get(row['obraz'],row['obraz']).replace('../../','assets/',1)
   registry.append({'id':'riddle-'+row['id'],'name':row['haslo'],'file':row['obraz']})
  (OUT/'rhymes.json').write_text(json.dumps(bank,ensure_ascii=False))
 if kind=='grammar':
  (OUT/'grammar-art.json').write_text(json.dumps({Path(k).stem:v.replace('../../','assets/',1)for k,v in mapping.items()},ensure_ascii=False))
registry=list({r['id']:r for r in registry}.values());(OUT/'objects.json').write_text(json.dumps(registry,ensure_ascii=False))
(OUT/'catalog.js').write_text('export const packagePages139='+literal(pages)+';\n')
(ROOT/'scripts/training139-assets.json').write_text(json.dumps(audits,ensure_ascii=False,indent=2))
print(json.dumps({'pages':sum(len(v)for v in pages.values()),'unique_media':len(assets),'shared_originals':len(existing),'references':len(audits),'objects':len(registry)},ensure_ascii=False))
