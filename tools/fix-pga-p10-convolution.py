"""Scoped web erratum for source PDF pages 68/69; preserve the original PDF.

Run after PDF/SVG export and before importing the deck into the teaching library.
Only the formula region is covered; all original artwork stays byte-for-byte.
The searchable transcript, notes payload and slides.json receive the same fix.
"""
from pathlib import Path
import hashlib
import html
import json
import re
import sys

FORMULAS = {
    68: "(f ∗ g)[n] = Σ_{m=−∞}^{∞} f[m] · g[n−m]",
    69: "(f ∗ g)[m, n] = Σ_{i=−∞}^{∞} Σ_{j=−∞}^{∞} f[i, j] · g[m−i, n−j]",
}


def formula_svg(page):
    """Offline SVG math with explicit limits, no CDN or math renderer needed."""
    if page == 68:
        rect, y, left, sums, right = ("100 68 210 38", 88, 103, [(177, "m")], 197)
        lhs, rhs = "(f ∗ g)[n] =", "f[m] · g[n−m]"
    else:
        rect, y, left, sums, right = ("100 82 210 45", 104, 53, [(135, "i"), (162, "j")], 183)
        lhs, rhs = "(f ∗ g)[m, n] =", "f[i, j] · g[m−i, n−j]"
    x, top, width, height = rect.split()
    items = [f'<rect x="{x}" y="{top}" width="{width}" height="{height}" fill="white"/>',
             f'<text x="{left}" y="{y}" font-size="11">{lhs}</text>']
    for x, index in sums:
        items += [f'<text x="{x}" y="{y+2}" text-anchor="middle" font-size="21">∑</text>',
                  f'<text x="{x}" y="{y-14}" text-anchor="middle" font-size="8">∞</text>',
                  f'<text x="{x}" y="{y+15}" text-anchor="middle" font-size="8">{index}=−∞</text>']
    items.append(f'<text x="{right}" y="{y}" font-size="11">{rhs}</text>')
    return ('\n<g id="pga-convolution-erratum" fill="black" font-family="Times New Roman, serif" '
            f'role="img" aria-label="{html.escape(FORMULAS[page], quote=True)}">'
            + ''.join(items) + '</g>\n')


def correct_deck(deck):
    deck = Path(deck)
    data = json.loads((deck / 'slides.json').read_text(encoding='utf8'))
    document = (deck / 'index.html').read_text(encoding='utf8')
    changed = []
    for number, formula in FORMULAS.items():
        page = data['pages'][number - 1]
        assert page['page'] == number and 'Diskrétní' in page['title']
        old = page['text']
        if formula not in old:
            # Match only the documented erroneous equation, including PDF layout.
            pattern = r'∑∞\s*\(f ∗g\) =\s*f\[m\] · g\[n −m\]\s*\(' + str(number - 57) + r'\)\s*m=−∞'
            new, count = re.subn(pattern, formula + f'    ({number - 57})', old)
            assert count == 1, f'Unexpected source formula on page {number}'
            assert html.escape(old) in document
            document = document.replace(html.escape(old), html.escape(new), 1)
            document = document.replace(json.dumps(old, ensure_ascii=False)[1:-1],
                                        json.dumps(new, ensure_ascii=False)[1:-1], 1)
            page['text'] = new
        target = deck / page['image']
        svg = target.read_text(encoding='utf8')
        svg = re.sub(r'\n<g id="pga-convolution-erratum".*?</g>\n', '', svg, flags=re.S)
        updated = svg.replace('</svg>', formula_svg(number) + '</svg>')
        if updated != target.read_text(encoding='utf8'):
            target.write_text(updated, encoding='utf8', newline='\n')
        changed.append(target)
    for name, content in [('index.html', document),
                          ('slides.json', json.dumps(data, ensure_ascii=False, indent=2))]:
        target = deck / name
        if target.read_text(encoding='utf8') != content:
            target.write_text(content, encoding='utf8', newline='\n')
        changed.append(target)
    return changed


if __name__ == '__main__':
    deck = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(__file__).resolve().parents[1] / 'vyuka/pga/p10'
    changed = correct_deck(deck)
    manifest = deck.parents[1] / 'source-manifest.json'
    if manifest.exists():
        data = json.loads(manifest.read_text(encoding='utf8'))
        for target in changed:
            key = target.relative_to(manifest.parent).as_posix()
            for item in data['files']:
                if item['copy'] == key:
                    raw = target.read_bytes()
                    item.update(bytes=len(raw), sha256=hashlib.sha256(raw).hexdigest())
        manifest.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf8', newline='\n')
    print('Corrected web formulas on pages 68/69; original PDF unchanged.')
