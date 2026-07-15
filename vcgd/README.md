# VCGD bilingual redesign

Preview routes:

- Czech: `/vcgd/`
- English: `/vcgd/en/`

Shared assets:

- `vcgd.css` — standalone visual system, responsive styles and mixed-orientation A4 print layout
- `vcgd.js` — semester filters, persistent card/horizontal view switch, accessible syllabus dialog and print-document generator
- `syllabi-cs.js` — complete Czech syllabus data
- `syllabi-en.js` — official English catalogue data, documented source translations and English overrides where the English catalogue still exposes Czech fields
- `assets/fit-cvut-negativ-cs.svg` and `assets/fit-cvut-negativ-en.svg` — official Czech and English FIT CTU logo variants for dark backgrounds, copied without modification from the [CTU logo package](https://www.cvut.cz/logo-a-graficky-manual)
- `pdf/vcgd-studijni-plan-a-sylaby.pdf` and `pdf/vcgd-curriculum-and-syllabi.pdf` — 28-page printable documents with a one-page A4 landscape curriculum followed by 27 portrait syllabus pages

The syllabus assets are generated in two steps:

1. `node tools/build-syllabi.mjs` extracts and normalizes the full Czech data from the archived legacy source at `archive/vcgd-legacy-2026-07-15.html`.
2. `python tools/fetch-en-syllabi.py` resolves current FIT catalogue links, refreshes the English catalogue text and aligns Czech catalogue URLs.

The print document is generated from the same HTML course cards and syllabus data as the interactive page. Appending `?print=1` prepares the print-only DOM without opening a print dialog; this view is used to rebuild the committed PDFs. Regular browser printing and Ctrl+P use the same layout.

The root `vcgd.html` is now a compatibility redirect, so both the historical extensionless `/vcgd` route and `/vcgd.html` lead to the new `/vcgd/` page while preserving query parameters and fragments. The exact pre-redesign source is retained at `archive/vcgd-legacy-2026-07-15.html` and in Git history.

## Curriculum model

The presentation follows the structure of the existing VCGD prototype and the public FIT CTU course catalogue as checked on 2026-07-15:

- programme core: 62 ECTS;
- specialization core: 36 ECTS;
- required elective blocks: at least 10 ECTS;
- elective space: at least 12 ECTS;
- complete programme: 120 ECTS.

Both language variants contain the same 27 course codes. The `UEE` environment-design course records the completed four-day intensive block taught by Daniel Tripplet from Purdue University. A similar format is planned for the following academic year; no stable public catalogue entry is available yet.

The detail dialog contains annotation, lecture and seminar outlines, literature, requirements and available teaching metadata. Most English texts come directly from the official FIT CTU catalogue. `ANI-DVD` and `ANI-DIP` use transparent English translations of the Czech VCGD source because the catalogue does not currently expose a complete English syllabus. A small set of catalogue fields that are still Czech on the English FIT page are translated through explicit overrides in `tools/fetch-en-syllabi.py`. The Czech and English `UEE` syllabus is maintained from VCGD's record of the completed intensive course because it does not yet have a stable public catalogue page.
