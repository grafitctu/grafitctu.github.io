# ROZ native rewrite, 23 October 2026

The 11 Haindl lectures (parts 01–09, 11, 12) now use Czech authored HTML prose,
selectable MathML, new semantic SVG diagrams and 12 didactic models. Both the
main and annotated editions contain **zero source-slide renders**. Do not
restore the former `source-frame`, converted page SVGs or auxiliary OCR dumps.
The unchanged PDFs remain downloadable source documents.

The rewrite merges 902 reveal states from 230 PDF pages into 211 concepts.
`source-manifest.json` in each lecture maps concepts to source panel indices
and PDF pages. This is a thematic editorial rewrite, not a claim of verbatim
transcription: detailed historical experiment tables remain in the linked PDF.
Source age, authorship and the distinction between historical results and
synthetic GRAFIT models must remain visible.

## Sources and rebuild

Reviewed Czech text: `roz_native_content.py` and `roz_native_remaining.py`.
Additional examples: `roz_commentary_content.py`. Model definitions and source
PDF/page metadata: `roz-native-models.json`, `roz-native-source-index.json`.
Shared controller/style source: `roz-native.js`, `roz-native.css`; model code:
`roz-models.js`. The builder adds the seeded relative-frequency simulation.

`build_roz_native.py` requires Python and `latex2mathml` (tested with Python
3.11 and latex2mathml 3.81.1). It reads unchanged PDFs from the original local
export, or from `vyuka/roz/pXX/original.pdf` when run in a site checkout. Output
goes to `web/roz-native-20261023/`. The local `import_roz_native.py` is explicitly
for the isolated October 23 staging checkout; change its destination deliberately
for a later publication. Then regenerate `tools/build-teaching-pages.cjs`, rebuild
offline ZIPs and refresh all recorded hashes. Preserve upstream material hashes,
roles, source policies, unrelated courses and the standalone geometry lab.

## UX contract

Use VHS/DVD typography, warm light theme and existing dark palette; subtle ROZ
brand tint; course brand links to the ROZ overview and return link to all courses.
Keep Čtení, keyboard navigation, searchable contents, notes, theme, fullscreen,
print, source PDF and offline download. Targets are at least 44 px. Form inputs
own their arrow keys. Desktop notes are nonmodal, mobile notes modal.

Native notes have a new versioned storage key. Earlier notes stay available
read-only with their original slide numbers; do not reassign them to new concepts.
At 320/390 px formulas wrap without clipping or sideways scrolling. Print shows
all concepts and answers without fixed slide heights or hidden overflow.

## Validation

Verify all 22 entrypoints on desktop and 320/390 px mobile; MathML dimensions,
no source `<img>`/`<image>`/iframe/object, browser errors, links, keyboard,
notes/focus, model reset and numeric edge cases, dark theme, print extraction
and visual inspection, and all 22 offline entrypoints. Validate every manifest
SHA-256 and unchanged original PDF hash. Publish only after scoped PR review,
successful Pages deployment and full live hashes of every changed public file.
