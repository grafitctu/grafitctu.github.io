from pypdf import PdfReader
from pathlib import Path
import json
from PIL import Image
root=Path(__file__).resolve().parents[1]
r=PdfReader(root/'data/taxonomy/18PGA_P12-original.pdf')
records=[]
for n in range(36,66):
 p=r.pages[n-1]; imgs={im.name.split('.')[0]:f'p{n:02}-{j:02}.'+im.name.rsplit('.',1)[1] for j,im in enumerate(p.images)}; visible=[]
 def visit(op,args,cm,tm):
  if op==b'Do' and str(args[0])[1:] in imgs and 0<=cm[4]<float(p.mediabox.width) and 0<=cm[5]<float(p.mediabox.height):
   visible.append(dict(file=imgs[str(args[0])[1:]],x=round(cm[4],2),y=round(cm[5],2),w=round(cm[0],2),h=round(cm[3],2)))
 p.extract_text(visitor_operand_before=visit)
 for im in visible:
  if im['file'].endswith('.jp2'):
   original=root/'data/taxonomy/extracted'/im['file']
   converted=original.with_suffix('.png')
   Image.open(original).save(converted)
   im['file']=converted.name
 records.append(dict(page=n,images=visible))
(root/'data/texture-sequence.json').write_text(json.dumps(records,indent=2),encoding='utf8')
print(json.dumps(records))
