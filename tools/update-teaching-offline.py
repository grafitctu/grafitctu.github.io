"""Add the same site typography to self-contained lecture downloads."""
import hashlib,json,posixpath,re,sys,zipfile,io
from pathlib import Path
base=Path(sys.argv[1]); changed=[]
marker=re.compile(r'<!-- GRAFIT whole-word typography -->[\s\S]*?<!-- /GRAFIT whole-word typography -->\s*')
assets={'grafit-typography.'+ext:(base/('lecture-typography.'+ext)).read_bytes() for ext in ('css','js')}
for file in sorted(base.rglob('*.zip')):
 if file.name!='offline.zip' and file.relative_to(base).as_posix()!='roz/geometry-lab.zip':continue
 original=file.read_bytes()
 with zipfile.ZipFile(io.BytesIO(original)) as archive:
  infos=archive.infolist(); data={i.filename:archive.read(i) for i in infos}
  affected=False
  for name,content in list(data.items()):
   if not name.endswith('.html'):continue
   html=content.decode('utf8')
   if not re.search(r'class=["\'][^"\']*\b(?:slide|reveal)\b',html):continue
   affected=True; html=marker.sub('',html)
   prefix=posixpath.relpath('.',posixpath.dirname(name) or '.')
   block='<!-- GRAFIT whole-word typography -->\n<link rel="stylesheet" href="'+prefix+'/grafit-typography.css">\n<script defer src="'+prefix+'/grafit-typography.js"></script>\n<!-- /GRAFIT whole-word typography -->\n'
   if re.search('</head>',html,re.I):html=re.sub('</head>',lambda m:block+m[0],html,count=1,flags=re.I)
   elif '</title>' in html:html=html.replace('</title>','</title>'+block,1)
   else:raise ValueError(name+' lacks head/title')
   data[name]=html.encode('utf8')
  if not affected:continue
  data.update(assets)
  for name in list(data):
   if not name.endswith('SHA256SUMS.txt'):continue
   directory=posixpath.dirname(name)
   def refresh(m):
    target=posixpath.normpath(posixpath.join(directory,m[3]))
    return hashlib.sha256(data[target]).hexdigest()+m[2]+m[3] if target in data else m[0]
   data[name]=re.sub(r'^([a-f0-9]{64})(\s+)(.+)$',refresh,data[name].decode('utf8'),flags=re.M).encode('utf8')
  if all(data.get(i.filename)==archive.read(i) for i in infos) and len(data)==len(infos):continue
  output=io.BytesIO()
  with zipfile.ZipFile(output,'w',compression=zipfile.ZIP_DEFLATED) as dest:
   for info in infos:dest.writestr(info,data.pop(info.filename))
   for name,content in data.items():
    info=zipfile.ZipInfo(name,(2026,11,8,0,0,0));info.compress_type=zipfile.ZIP_DEFLATED;dest.writestr(info,content)
  file.write_bytes(output.getvalue());changed.append(file.relative_to(base).as_posix())
print(json.dumps(changed))
