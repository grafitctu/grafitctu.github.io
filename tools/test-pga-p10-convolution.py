"""Regression check: python tools/test-pga-p10-convolution.py (stdlib only)."""
import hashlib
import json
from pathlib import Path
import runpy
import tempfile
import shutil
import xml.etree.ElementTree as ET

root = Path(__file__).resolve().parents[1]
fix = runpy.run_path(str(root / 'tools/fix-pga-p10-convolution.py'))
deck = root / 'vyuka/pga/p10'
data = json.loads((deck / 'slides.json').read_text(encoding='utf8'))
html = (deck / 'index.html').read_text(encoding='utf8')
payload = json.loads(html.split('<script type="application/json" id="source-data">')[1].split('</script>')[0])
assert data == payload
assert len(data['pages']) == 95
for page, formula in fix['FORMULAS'].items():
    assert formula in data['pages'][page-1]['text']
    svg = ET.parse(deck / data['pages'][page-1]['image'])
    group = svg.find('.//{http://www.w3.org/2000/svg}g[@id="pga-convolution-erratum"]')
    assert group is not None and group.attrib['aria-label'] == formula
    assert ''.join(group.itertext()).count('∑') == page - 67

# Substituting i=m-u, j=n-v turns the 2D formula into the page-86
# form h[i,j] I[m-i,n-j], including kernel reversal in both axes.
image = {(0, 0): 2, (1, 0): 3, (0, 1): 5, (1, 1): 7}
kernel = {(0, 0): 11, (1, 0): 13, (0, 1): 17, (1, 1): 19}
for m in range(3):
    for n in range(3):
        a = sum(v * kernel.get((m-i, n-j), 0) for (i, j), v in image.items())
        b = sum(v * image.get((m-i, n-j), 0) for (i, j), v in kernel.items())
        assert a == b
assert 'h[i, j]I[m −i, n −j]' in data['pages'][85]['text']

with tempfile.TemporaryDirectory(dir=root) as temp:
    target = Path(temp) / 'p10'
    target.mkdir()
    (target / 'assets').mkdir()
    for name in ['index.html', 'slides.json', 'assets/page-068.svg', 'assets/page-069.svg']:
        shutil.copyfile(deck / name, target / name)
    before = {p.relative_to(target): p.read_bytes() for p in target.rglob('*') if p.is_file()}
    fix['correct_deck'](target)
    assert before == {p.relative_to(target): p.read_bytes() for p in target.rglob('*') if p.is_file()}
    # Simulate a fresh PDF export: restore the old formula in both text modes.
    fresh = json.loads((target / 'slides.json').read_text(encoding='utf8'))
    document = (target / 'index.html').read_text(encoding='utf8')
    for number, formula in fix['FORMULAS'].items():
        old_text = fresh['pages'][number-1]['text']
        wrong = '∑∞\n (f ∗g) = f[m] · g[n −m] (' + str(number-57) + ')\n m=−∞'
        new_text = old_text.replace(formula + f'    ({number-57})', wrong)
        document = document.replace(old_text, new_text, 1)
        document = document.replace(json.dumps(old_text, ensure_ascii=False)[1:-1], json.dumps(new_text, ensure_ascii=False)[1:-1], 1)
        fresh['pages'][number-1]['text'] = new_text
    (target / 'index.html').write_text(document, encoding='utf8')
    (target / 'slides.json').write_text(json.dumps(fresh, ensure_ascii=False, indent=2), encoding='utf8')
    fix['correct_deck'](target)
    assert before == {p.relative_to(target): p.read_bytes() for p in target.rglob('*') if p.is_file()}

manifest = json.loads((root / 'vyuka/source-manifest.json').read_text(encoding='utf8'))
for item in manifest['files']:
    if item['copy'] in ['pga/p10/index.html', 'pga/p10/slides.json', 'pga/p10/assets/page-068.svg', 'pga/p10/assets/page-069.svg']:
        raw = (root / 'vyuka' / item['copy']).read_bytes()
        assert item['sha256'] == hashlib.sha256(raw).hexdigest() and item['bytes'] == len(raw)
print('PASS: formulas, 2D equivalence, SVG/XML, transcripts/notes, 95 pages, idempotence, provenance hashes')
