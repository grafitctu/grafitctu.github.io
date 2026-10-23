"""Reviewed, concept-based ROZ rewrite. Never imports source slide graphics into HTML."""
from pathlib import Path
import sys,json,html,hashlib,shutil,ast,math
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'tmp/roz-native-runtime'))
from latex2mathml.converter import convert
from roz_native_remaining import COURSES
from roz_commentary_content import TOPICS
E=html.escape
DEST=ROOT/'web/roz-native-20261023'
SHARED=DEST/'shared';SHARED.mkdir(parents=True,exist_ok=True)
for src,name in [('roz-native.css','presentation.css'),('roz-native.js','presentation.js')]:
    (SHARED/name).write_bytes((ROOT/'tools'/src).read_bytes())
MODELS=json.loads((ROOT/'tools/roz-native-models.json').read_bytes())
SOURCE_INDEX=json.loads((ROOT/'tools/roz-native-source-index.json').read_bytes())
MODELS['frequency']=('Od pokusů k relativní četnosti',[('probability','Pravděpodobnost události (%)',0,100,1,50),('trials','Počet nezávislých pokusů',10,2000,10,200),('seed','Seed simulace',1,9999,1,7)])
js=(ROOT/'tools/roz-models.js').read_text(encoding='utf8').replace("const root=document.querySelector('[data-model]');if(!root)return;", "document.querySelectorAll('[data-model]').forEach(root=>{")
js=js.replace("render();})();", "render();});})();")
frequency="""if(type==='frequency'){const p=val('probability')/100,n=Math.round(val('trials'));let state=Math.round(val('seed'))>>>0,count=0;const points=[];for(let k=1;k<=n;k++){state=(Math.imul(1664525,state)+1013904223)>>>0;if(state/4294967296<p)count++;points.push([k,count/k]);}const w=canvas.width,h=canvas.height,X=k=>38+k/n*(w-50),Y=v=>h-30-v*(h-58);ctx.fillStyle='#fcfbf8';ctx.fillRect(0,0,w,h);ctx.strokeStyle='#c9d4d8';ctx.beginPath();ctx.moveTo(38,20);ctx.lineTo(38,h-30);ctx.lineTo(w-12,h-30);ctx.stroke();ctx.strokeStyle='#935f95';ctx.setLineDash([5,4]);ctx.beginPath();ctx.moveTo(38,Y(p));ctx.lineTo(w-12,Y(p));ctx.stroke();ctx.setLineDash([]);ctx.strokeStyle='#245d72';ctx.lineWidth=2;ctx.beginPath();points.forEach(([k,f],i)=>i?ctx.lineTo(X(k),Y(f)):ctx.moveTo(X(k),Y(f)));ctx.stroke();ctx.fillStyle='#203039';ctx.font='14px Segoe UI';ctx.fillText('1',15,23);ctx.fillText('0',15,h-27);ctx.fillText('n = '+n,w-95,h-7);text='Syntetická simulace se seedem '+val('seed')+': '+count+' výskytů / '+n+' pokusů = '+fmt(count/n)+'. Nastavené p = '+fmt(p)+'. Modrá křivka: průběžná četnost; fialová přímka: nastavená pravděpodobnost. Konečný vzorek kolísá, nejde o měření.';}"""
js=js.replace('out.textContent=text;',frequency+'\nout.textContent=text;')
(SHARED/'models.js').write_text(js,encoding='utf8')
ASSET_QUERY={name:hashlib.sha256((SHARED/name).read_bytes()).hexdigest()[:16] for name in ['presentation.css','presentation.js','models.js']}

def diagram(kind):
    """New semantic SVG, no embedded PDF/raster or converted glyph outlines."""
    bits=[];caption='Nově kreslené schéma GRAFIT · ilustrační konstrukce.'
    def text(x,y,s,size=18):bits.append(f'<text x="{x}" y="{y}" text-anchor="middle" fill="currentColor" font-size="{size}">{E(s)}</text>')
    def line(x,y,a,b,dash=''):bits.append(f'<path d="M{x} {y} L{a} {b}" fill="none" stroke="#8aa5ad" stroke-width="2" {dash}/>')
    def circle(x,y,r=8,col='#397b8b'):bits.append(f'<circle cx="{x}" cy="{y}" r="{r}" fill="{col}"/>')
    def box(x,y,w,h,s):
        bits.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="9" fill="none" stroke="#8aa5ad" stroke-width="2"/>');text(x+w/2,y+h/2+6,s)
    if kind in ['gaussian','kde']:
        line(30,210,390,210)
        for mu,sigma,color in [(155,44,'#397b8b'),(260,62,'#aa6c8d')]:
            coords=[(x,210-140*math.exp(-.5*((x-mu)/sigma)**2)) for x in range(30,391,3)]
            bits.append('<path d="'+' '.join(('M' if i==0 else 'L')+f'{x:.1f} {y:.1f}' for i,(x,y) in enumerate(coords))+'" fill="none" stroke="'+color+'" stroke-width="3"/>')
        text(155,240,'A');text(270,240,'B');caption='Dvě konstruované hustoty; výška není pravděpodobnost bodu.'
    elif kind in ['projection','affine','boundary','neighbors','clusters','margin','bias-variance']:
        line(35,210,390,210);line(45,220,45,35)
        for cx,cy,col in [(135,155,'#397b8b'),(280,90,'#aa6c8d')]:
            for dx,dy in [(-30,4),(0,-20),(18,12),(35,-8),(-12,24)]:circle(cx+dx,cy+dy,6,col)
        if kind in ['boundary','margin']:line(205,220,225,30)
        elif kind in ['projection','affine']:line(65,210,360,45,'stroke-dasharray="6 5"')
        text(375,240,'x₁');text(25,35,'x₂');caption='Konstruované body a směr/hranice; nejde o experimentální data.'
    elif kind in ['sets']:
        bits.extend(['<circle cx="160" cy="125" r="80" fill="#397b8b" fill-opacity=".2" stroke="#397b8b" stroke-width="2"/>','<circle cx="255" cy="125" r="80" fill="#aa6c8d" fill-opacity=".2" stroke="#aa6c8d" stroke-width="2"/>']);text(125,130,'A');text(290,130,'B');text(208,130,'A ∩ B',16)
    elif kind in ['regions','connectivity']:
        for j in range(5):
            for i in range(7):
                a=(i<3 and j<3)or(i==3 and j==2);bits.append(f'<rect x="{55+i*43}" y="{25+j*43}" width="40" height="40" rx="3" fill="{("#397b8b" if a else "#aa6c8d")}" fill-opacity=".35"/>')
        text(205,268,'Oblast A / oblast B')
    elif kind=='confusion':
        text(240,25,'Predikce');text(169,52,'+');text(294,52,'−');
        for x,y,s in [(110,65,'TP'),(240,65,'FN'),(110,145,'FP'),(240,145,'TN')]:box(x,y,120,70,s)
        text(70,110,'+');text(70,190,'−');text(205,250,'Řádky: skutečnost',16)
    elif kind=='grammar':
        for i,s in enumerate(['S','aSb','aaSbb','aabb']):
            box(95,10+i*70,230,48,s)
            if i<3:line(210,58+i*70,210,78+i*70)
        caption='Odvození slova aabb pravidly S → aSb a S → ε.'
    elif kind=='probability-tree':
        for x,y,a,b in [(210,40,110,120),(210,40,310,120),(110,120,65,210),(110,120,165,210),(310,120,265,210),(310,120,365,210)]:line(x,y,a,b)
        for x,y,s in [(210,30,'Ω'),(110,115,'A'),(310,115,'Aᶜ'),(65,240,'A ∩ B'),(165,240,'A ∩ Bᶜ'),(265,240,'Aᶜ ∩ B'),(365,240,'Aᶜ ∩ Bᶜ')]:text(x,y,s,16)
        caption='Rozklad prostoru podle jevu A a poté podle jevu B.'
    elif kind=='automaton':
        for x in [65,205,355]:
            bits.append(f'<circle cx="{x}" cy="135" r="30" fill="none" stroke="#8aa5ad" stroke-width="2"/>')
        bits.append('<circle cx="355" cy="135" r="24" fill="none" stroke="#8aa5ad" stroke-width="2"/>')
        line(95,135,175,135);line(235,135,325,135);text(65,141,'S');text(205,141,'A');text(355,141,'F');text(135,115,'a');text(280,115,'b')
        caption='Částečný deterministický automat přijímající pouze slovo ab; chybějící přechody odmítají.'
    elif kind in ['tree','dendrogram']:
        for x,y,a,b in [(210,50,120,125),(210,50,300,125),(120,125,70,205),(120,125,170,205),(300,125,260,205),(300,125,350,205)]:line(x,y,a,b)
        for x,y,s in [(210,45,'S'),(120,120,'A'),(300,120,'B'),(70,215,'a'),(170,215,'b'),(260,215,'c'),(350,215,'d')]:
            bits.append(f'<circle cx="{x}" cy="{y-6}" r="21" fill="var(--panel)" stroke="#8aa5ad"/>');text(x,y,s)
        if kind=='automaton':caption='Ilustrace přechodů stavů; konkrétní přijímaný jazyk určuje přechodová funkce.'
        elif kind=='dendrogram':caption='Schéma hierarchie; délky větví zde nekódují naměřené vzdálenosti.'
        else:caption='Schéma rozkladu na části; konkrétní pravidla definuje text.'
    elif kind in ['neuron','network']:
        if kind=='neuron':
            for y,s in [(50,'x₁'),(130,'x₂'),(210,'x₃')]:text(45,y+5,s);line(65,y,190,130)
            box(175,100,70,60,'Σ + b');line(245,130,290,130);box(290,100,65,60,'f');text(390,137,'y');line(355,130,375,130)
        else:
            for x,ys in [(65,[60,140,220]),(205,[40,110,180,250]),(355,[100,190])]:
                for y in ys:circle(x,y,15)
            for a in [60,140,220]:
                for b in [40,110,180,250]:line(80,a,190,b)
            for a in [40,110,180,250]:
                for b in [100,190]:line(220,a,340,b)
    elif kind=='crossover':
        for y,s in [(65,'0000 │ 0000'),(115,'1111 │ 1111'),(195,'0000 │ 1111'),(245,'1111 │ 0000')]:text(210,y,s,25)
        text(210,155,'↓ výměna částí',16)
    else:
        flows={'pipeline':['Data','Příznaky','Rozhodnutí'],'course-map':['Reprezentace','Učení','Hodnocení'],'bayes-flow':['Prior × model','Posterior','Nejmenší riziko'],'loss':['Rozhodnutí','Ztráta','Průměrné riziko'],'minimax':['Pravidlo','Nejhorší prior','Minimum maxima'],'reject':['Posterior','Riziko chyby','Třída / odmítnutí'],'context':['Pozorování','Sousední značky','Společné skóre'],'em':['E: odpovědnosti','M: parametry','Další iterace'],'kmeans':['Přiřadit','Přepočítat středy','Opakovat'],'split':['Trénink','Validace','Test'],'evolution':['Výběr','Křížení + mutace','Nová populace'],'frequency':['Pokusy','Počet výskytů','Podíl nₐ / n']}
        labels=flows[kind]
        for i,s in enumerate(labels):
            box(50,20+i*88,320,60,s)
            if i<2:line(210,80+i*88,210,103+i*88)
    return '<figure><svg viewBox="0 0 420 290" role="img" aria-label="'+E(caption)+'" xmlns="http://www.w3.org/2000/svg">'+''.join(bits)+'</svg><figcaption>'+E(caption)+'</figcaption></figure>'

def math_block(latex):
    latex=latex.replace(r'\arg\max',r'\operatorname{argmax}').replace(r'\arg\min',r'\operatorname{argmin}')
    # Responsive break at the equality; do not rasterize, clip or shrink formulas.
    pieces=[latex];depth=0
    for i,ch in enumerate(latex):
        if ch=='{':depth+=1
        elif ch=='}':depth-=1
        elif ch=='=' and depth==0 and 2<i<len(latex)-2 and len(latex)>20:
            pieces=[latex[:i],latex[i:]];break
    return '<div class="math"><div class="equation">'+''.join(convert(p,display='inline') for p in pieces)+'</div></div>'

def model(kind):
    title,fields=MODELS[kind];inputs=[]
    for f in fields:
        name,label=f[:2];identity=kind+'-'+name
        if f[2]=='text':field=f'<input id="{identity}" name="{name}" type="text" maxlength="{f[3]}" value="{f[4]}" spellcheck="false">'
        else:field=f'<input id="{identity}" name="{name}" type="number" min="{f[2]}" max="{f[3]}" step="{f[4]}" value="{f[5]}">'
        inputs.append(f'<label for="{identity}">{E(label)}{field}</label>')
    return title,'<div class="model-intro"><strong>Vyzkoušejte · doplněk GRAFIT</strong><p>Konstruovaný didaktický model. Měňte vstupy a sledujte výpočet; nejde o naměřený výkon ani plný učící algoritmus.</p></div><div class="lab" data-model="'+kind+'"><div class="lab-inputs">'+''.join(inputs)+'<button type="button" data-reset-model>Obnovit hodnoty</button></div><canvas width="700" height="300" role="img" aria-label="Konstruovaný graf; výsledek a omezení jsou vypsány v textu pod ním."></canvas><output aria-live="polite"></output></div>'

summary=[]
for n,concepts in sorted(COURSES.items()):
    part=f'p{n:02}';folder=DEST/part;folder.mkdir(exist_ok=True)
    old=ROOT/'web/roz-lectures-20261022'/part;original=SOURCE_INDEX[str(n)];mapping=original['mapping'];total=len(mapping)
    covered=set()
    for s in concepts:covered.update(range(s['source'][0],s['source'][1]+1))
    assert covered==set(range(1,total+1)),(n,'coverage',sorted(set(range(1,total+1))-covered),sorted(covered-set(range(1,total+1))))
    pdf=old/'original.pdf'
    if not pdf.exists():pdf=ROOT/'vyuka/roz'/part/'original.pdf'
    shutil.copyfile(pdf,folder/'original.pdf')
    info=TOPICS[n];manifest={k:original[k] for k in ['part','author','sourceYear','sourceURL','sourceSha256','pdfPages']}
    manifest.update(format='native-html-concepts-v1',sourcePanels=total,editorialPolicy='Czech thematic rewrite, not a verbatim transcription. Reveal sequences merged; new selectable HTML/MathML and semantic diagrams. Historical examples labeled. Detailed experiment tables remain in linked unchanged PDF. No source slide render in either edition.',mapping=[])
    for i,s in enumerate(concepts,1):
        panels=list(range(s['source'][0],s['source'][1]+1));pages=sorted({mapping[j-1]['pdfPage'] for j in panels})
        manifest['mapping'].append(dict(htmlSlide=i,title=s['title'],sourcePanels=panels,pdfPages=pages))
    for commented in [False,True]:
        filename='commented.html' if commented else 'index.html';sections=[]
        for i,s in enumerate(concepts,1):
            body='<div class="prose">'+''.join('<p>'+E(p)+'</p>' for p in s['paragraphs'])+''.join(math_block(x) for x in s['math'])+'</div>'
            if s['diagram']:body='<div class="with-figure">'+body+diagram(s['diagram'])+'</div>'
            if s['table']:body+='<table><tbody>'+''.join('<tr>'+''.join(('<th scope="col">' if k==0 else '<td>')+E(v)+('</th>' if k==0 else '</td>') for v in row)+'</tr>' for k,row in enumerate(s['table']))+'</tbody></table>'
            if commented and s['comment']:body+='<aside class="comment"><strong>Komentář GRAFIT</strong><p>'+E(s['comment'])+'</p></aside>'
            pages=manifest['mapping'][i-1]['pdfPages'];page=pages[0]
            body+=f'<p class="source-meta">Michal Haindl · podklad 2023–2024 · tematický přepis GRAFIT. <a href="original.pdf#page={page}">Zdrojové PDF · strany {", ".join(map(str,pages))}</a></p>'
            sections.append((s['title'],body,'Výklad' if not commented else 'Výklad s komentářem'))
            if n==2 and 'četnost' in s['title'].lower():
                title,body=model('frequency');sections.append((title,body,'Interaktivní doplněk GRAFIT'))
        # A worked example, a model and a self-test are in both editions; comments go inline.
        title,body=model(info['model']);sections.append((title,body,'Interaktivní doplněk GRAFIT'))
        title,text=info['example'];sections.append((title,'<div class="prose"><p>'+E(text)+'</p><p>'+E(info['pitfall'])+'</p></div>','Řešený příklad · doplněk GRAFIT'))
        sections.append(('Zkuste si odpovědět','<div class="prose"><p>'+E(info['question'])+'</p></div><details class="answer"><summary>Zobrazit vysvětlení</summary><p>'+E(info['answer'])+'</p></details>','Ověření porozumění · doplněk GRAFIT'))
        if commented:
            for title,text in info['cards']:
                sections.append((title,'<div class="prose"><p>'+E(text)+'</p></div>','Shrnutí souvislostí · komentář GRAFIT'))
        sections.append(('Podklady a způsob zpracování',f'<div class="prose"><p>Autor původních podkladů: Michal Haindl, FIT ČVUT / ÚTIA AV ČR, 2023–2024. Český tematický přepis, vysázení a didaktické doplňky: GRAFIT, 2026.</p><p>Tato verze slučuje postupná odhalení a vysvětluje témata vlastními větami. Není doslovnou reprodukcí každé původní tabulky ani náhradou aktuálních organizačních pokynů. Zdrojové PDF zůstává beze změny; žádný původní snímek zde není vložen jako obrázek.</p></div><p class="actions"><a href="original.pdf">Stáhnout původní PDF</a><a href="{E(original["sourceURL"])}">Autorský zdroj</a><a href="source-manifest.json">Mapa témat a SHA-256</a></p><p class="footer-info">SHA-256 původního PDF: {original["sourceSha256"]}</p>','Provenience'))
        manifest.setdefault('webEditions',{})[filename]={'slides':len(sections),'nativeConcepts':len(concepts),'sourceRenders':0}
        slidehtml=''.join(f'<section class="slide" id="slide-{i}" aria-label="{E(title)}"><div class="content"><div class="eyebrow">ROZ {n:02} · {E(label)}</div><h2>{E(title)}</h2>{body}</div></section>' for i,(title,body,label) in enumerate(sections,1))
        contents=''.join(f'<a href="#slide-{i}"><span>{i:02}</span>{E(title)}</a>' for i,(title,body,label) in enumerate(sections,1))
        def variant(file,label):return f'<a href="{file}"'+(' aria-current="page"' if file==filename else '')+'>'+label+'</a>'
        doc=f'''<!doctype html><html lang="cs"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>ROZ {n:02} · {E(info['cs'])} · {'S komentářem' if commented else 'Webový výklad'}</title><meta name="description" content="Český webový výklad ROZ: {E(info['cs'])}. Nativní text, vzorce a interaktivní doplňky."><link rel="stylesheet" href="../shared/presentation.css"><script src="../shared/presentation.js" defer></script><script src="../shared/models.js" defer></script></head><body><header class="toolbar"><a class="brand" href="../">ROZ <span>/ {n:02}</span></a><div class="variants" aria-label="Varianta přednášky">{variant('index.html','Výklad')}{variant('commented.html','S komentářem')}</div><nav aria-label="Nástroje přednášky"><button id="contents" aria-haspopup="dialog">Obsah</button><button id="reading" aria-pressed="false">Čtení</button><button id="notes-toggle" aria-expanded="false" aria-controls="notes-panel">Poznámky</button><button id="theme" aria-pressed="false" aria-label="Přepnout barevný režim">◐</button><button id="fullscreen" aria-label="Celá obrazovka (F)">⛶</button><button id="print">Tisk</button><a href="original.pdf">PDF</a><a class="offline-link" href="offline.zip">Offline ZIP</a></nav></header><main id="deck" aria-label="ROZ {n:02}">{slidehtml}</main><footer class="controls"><span class="hint">← → listování · F celá obrazovka</span><div class="pager"><button id="previous" aria-label="Předchozí téma">←</button><output id="counter">1 / {len(sections)}</output><button id="next" aria-label="Další téma">→</button></div><span class="credit">Michal Haindl · web GRAFIT</span><div class="progress" aria-hidden="true"><div id="progress-value"></div></div></footer><div id="announcement" class="sr-only" aria-live="polite"></div><dialog id="overview" aria-labelledby="overview-title"><div class="dialog-heading"><h2 id="overview-title">Obsah přednášky</h2><button class="close" aria-label="Zavřít obsah">✕</button></div><label for="search">Najít téma</label><input id="search" type="search"><nav>{contents}</nav></dialog><dialog class="notes" id="notes-panel" aria-labelledby="notes-title"><div class="dialog-heading"><h2 id="notes-title">Moje poznámky</h2><button class="close" aria-label="Zavřít poznámky">✕</button></div><p id="note-context"></p><label for="note-text">Poznámka k tématu</label><textarea id="note-text"></textarea><p id="note-status" aria-live="polite">Ukládají se jen v tomto prohlížeči.</p><div class="actions"><button id="note-clear">Vymazat tuto poznámku</button></div><details id="legacy" hidden><summary>Poznámky z předchozí verze</summary><p>Původní čísla snímků se změnila. Staré poznámky zůstávají uchované odděleně.</p><pre id="legacy-text"></pre></details></dialog><noscript><p>Přednáška je bez JavaScriptu zobrazena jako celý dokument. Modely vyžadují JavaScript.</p></noscript></body></html>'''
        for asset,version in ASSET_QUERY.items():
            doc=doc.replace('../shared/'+asset+'"','../shared/'+asset+'?v='+version+'"')
        (folder/filename).write_text(doc,encoding='utf8')
    (folder/'source-manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
    summary.append(dict(part=n,pdfPages=original['pdfPages'],sourcePanels=total,concepts=len(concepts),editions=manifest['webEditions'],sourceSha256=original['sourceSha256']))
(DEST/'build-summary.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print(json.dumps(summary,ensure_ascii=False))
