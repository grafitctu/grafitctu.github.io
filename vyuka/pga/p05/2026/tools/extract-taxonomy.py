from pathlib import Path
from pypdf import PdfReader
from PIL import Image, ImageDraw
import hashlib, json
root=Path(__file__).resolve().parents[1]
pdf=root/'data/taxonomy/18PGA_P12-original.pdf'
doc=PdfReader(pdf)
out=root/'data/taxonomy/extracted'
out.mkdir(exist_ok=True)
items=[]
for n,page in enumerate(doc.pages,1):
    for j,img in enumerate(page.images):
        if img.image.width<100 or img.image.height<80: continue
        name=f'p{n:02}-{j:02}.'+img.name.rsplit('.',1)[-1]
        (out/name).write_bytes(img.data)
        items.append(dict(page=n,name=name,width=img.image.width,height=img.image.height,sha256=hashlib.sha256(img.data).hexdigest()))
for start in range(0,len(items),36):
    subset=items[start:start+36]
    sheet=Image.new('RGB',(1200,((len(subset)+5)//6)*150),'white');draw=ImageDraw.Draw(sheet)
    for k,item in enumerate(subset):
        im=Image.open(out/item['name']).convert('RGB');im.thumbnail((190,120))
        x=(k%6)*200;y=(k//6)*150
        sheet.paste(im,(x,y+20));draw.text((x+3,y+2),item['name'],fill='black')
    sheet.save(root/f'data/taxonomy/contact-{start//36}.jpg')
(out/'manifest.json').write_text(json.dumps(items,indent=2),encoding='utf8')
print(len(items),'images extracted unchanged')
