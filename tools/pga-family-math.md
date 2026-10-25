# PGA: lecture-family style and equation typesetting

The current native P04/P05 editions follow the existing VHS P01/P03/P04
family: Segoe UI, warm paper, dark-mode tokens, 600-weight tightly spaced
headings, 76px toolbar, 70px pager and progress line, flat panels, reading,
presentation, fullscreen and print modes. PGA retains its ochre course colour
(`#745c16`, dark `#dccb8a`, as in `course-colors.cjs`). Scientific semantic
colours (green **Barva**/definitions, incident/outgoing rays, BRDF lobes) remain
distinct. `family.css` is a scoped, last-loaded adaptation, not a modification
of the VHS lectures or the pinned v1 archive.

All 20 displayed equations are explicitly transcribed in `pga-tex.cjs`.
Multi-line `aligned`/`gathered` environments keep long expressions readable;
an equation-local horizontal scroller handles narrow screens without making
the whole page wider. The selected inline notation in prose uses the same
renderer. Code examples and historical extracted source text remain literal.
The definitions, variables, integration domains and differential directions
are unchanged; vectors are consistently bold. Measurement subscripts use
English `sample`, `background`, `reference` in the equations; the Czech labels
and explanation still identify these quantities.

KaTeX 0.19.1 is pinned under `richtr-web/vendor/` with its MIT licence,
upstream URL, npm SHA-512 integrity and file SHA-256 receipt. It runs **only
at build time**, with strict errors and `trust:false`. Published HTML contains
both typeset HTML and accessible MathML, plus its TeX annotation. Font/CSS
files are local: no runtime CDN, installation script, or external renderer.
The TeX is the authoritative typesetting source; the older hand-built MathML
helper is no longer used to render these formulas.

Rebuild and regressions:

```sh
node tools/build-pga-richtr-web.cjs
node tools/test-pga-v2.cjs
node tools/test-pga-brdf.cjs
node tools/test-pga-tex.cjs
```

Do not edit the generated HTML by hand. The builder fails when an existing
displayed formula has no explicit TeX transcription. Original PDFs, all 153
source-page mappings, original slide URLs, 14 Cycles renders, BRDF restoration,
stable topic anchors and the pinned v1 editions must remain unchanged.
