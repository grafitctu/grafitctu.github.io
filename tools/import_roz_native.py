from pathlib import Path
import json,hashlib,shutil,subprocess,zipfile,re
ROOT=Path(__file__).resolve().parents[1];SITE=ROOT/'tmp/grafit-roz-native-20261023';BASE=SITE/'vyuka';SRC=ROOT/'web/roz-native-20261023'
def digest(data):return hashlib.sha256(data).hexdigest()
def read(name):return json.loads((BASE/name).read_bytes())
catalog=read('catalog.json');manifest=read('source-manifest.json');upstream=read('upstream-sources.json')
summary=json.loads((SRC/'build-summary.json').read_bytes());parts=[f'p{x["part"]:02}' for x in summary]
prefixes=tuple(['roz/shared/']+[f'roz/{p}/' for p in parts])
# Only generated ROZ lecture subtrees in this isolated checkout may be removed.
for part in [*parts,'shared']:
    target=(BASE/'roz'/part).resolve();allowed=(SITE/'vyuka/roz').resolve()
    assert target.parent==allowed and SITE.name=='grafit-roz-native-20261023'
    if target.exists():shutil.rmtree(target)
manifest['files']=[f for f in manifest['files'] if not f['copy'].startswith(prefixes) and f['copy']!='roz/build-summary.json']
upstream['localSources']=[f for f in upstream['localSources'] if not f['copy'].startswith(prefixes) and f['copy']!='roz/build-summary.json']
def record(path,source):
    rel=path.relative_to(BASE).as_posix();data=path.read_bytes()
    manifest['files'].append(dict(sourceWorkspace='Výuka',source=source,copy=rel,bytes=len(data),sha256=digest(data),sourceSha256=digest(data),adaptations=['Czech native HTML/MathML thematic rewrite. No embedded original slide renders. Unchanged source PDF available as a download. New clearly labeled GRAFIT diagrams, models and commentary.']))
    upstream['localSources'].append(dict(source=source,copy=rel,sha256=digest(data)))
for path in sorted(SRC.rglob('*')):
    if not path.is_file() or path.name=='offline.zip':continue
    dest=BASE/'roz'/path.relative_to(SRC);dest.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(path,dest);record(dest,path.relative_to(ROOT).as_posix())
for row in catalog['rows']:
    for item in ([row['roz']] if isinstance(row.get('roz'),dict) else row.get('roz',[])):
        if item.get('id') not in parts:continue
        info=next(s for s in summary if f'p{s["part"]:02}'==item['id'])
        item['htmlSlides']=info['editions']['index.html']['slides']
        item['primaryLabel']={'cs':'Webový výklad','en':'Czech web lecture'}
        item['alternativeLabel']={'cs':'S komentářem','en':'Czech annotated edition'}
        item['description']={'cs':f'Michal Haindl · 2023–2024 · český tematický přepis: {info["concepts"]} témat, vzorce, nová schémata a modely; PDF ke stažení', 'en':f'Michal Haindl · 2023–2024 · Czech thematic rewrite: {info["concepts"]} topics, native formulas, new diagrams and models; downloadable source PDF'}
# Preserve all upstream PDFs, full hashes, material roles, repairs and check baseline.
catalog['updated']=manifest['snapshot']='2026-10-23'
def write(name,value):(BASE/name).write_bytes((json.dumps(value,ensure_ascii=False,indent=2)+'\n').encode())
write('catalog.json',catalog);write('source-manifest.json',manifest);write('upstream-sources.json',upstream)
subprocess.run(['node','tools/build-teaching-pages.cjs'],cwd=SITE,check=True)
manifest=read('source-manifest.json')
for part in parts:
    folder=BASE/'roz'/part;archive=folder/'offline.zip'
    with zipfile.ZipFile(archive,'w',zipfile.ZIP_DEFLATED) as z:
        z.writestr('README.txt','ROZ native HTML rewrite. Open '+part+'/index.html or commented.html. Both editions and unchanged original PDF included. No source slide images. All models run locally. Return links open the public course library.\n')
        z.writestr('index.html',f'<!doctype html><meta charset="utf-8"><title>ROZ offline</title><p><a href="{part}/index.html">Webový výklad</a> · <a href="{part}/commented.html">S komentářem</a></p>')
        for p in sorted([*folder.rglob('*'),*(BASE/'roz/shared').rglob('*')]):
            if not p.is_file() or p.name=='offline.zip':continue
            data=p.read_bytes()
            if p.suffix=='.html':
                text=data.decode().replace('href="../../"','href="https://grafitctu.github.io/vyuka/"').replace('href="../"','href="https://grafitctu.github.io/vyuka/roz/"')
                text=re.sub(r'<a class="offline-link"[^>]*>.*?</a>','<span>Offline balíček</span>',text);data=text.encode()
            z.writestr(p.relative_to(BASE/'roz').as_posix(),data)
    shutil.copyfile(archive,SRC/part/'offline.zip');record(archive,f'web/roz-native-20261023/{part}/offline.zip')
write('source-manifest.json',manifest);write('upstream-sources.json',upstream)
for name in ['catalog.json','source-manifest.json','upstream-sources.json']:
    before=subprocess.check_output(['git','show','HEAD:vyuka/'+name],cwd=SITE)
    if b'\r\n' in before:
        p=BASE/name;p.write_bytes(p.read_bytes().replace(b'\r\n',b'\n').replace(b'\n',b'\r\n'))
attrs=BASE/'.gitattributes';existing=attrs.read_text(encoding='utf8')
for rule in ['roz/*/*.pdf -text -diff','roz/*/*.zip -text -diff']:
    if rule not in existing:existing+='\n'+rule+'\n'
attrs.write_text(existing,encoding='utf8')
# Publish the reproducible builder and reviewed content alongside the generated pages.
for name in ['build_roz_native.py','import_roz_native.py','roz_native_content.py','roz_native_remaining.py','roz-native.css','roz-native.js','roz-native-models.json','roz-native-source-index.json','roz_commentary_content.py','roz-models.js']:
    shutil.copyfile(ROOT/'tools'/name,SITE/'tools'/name)
print('Imported native rewrite:',len(parts),'lectures;',sum(s['concepts'] for s in summary),'concepts. Other courses and upstream PDF baseline preserved.')
