# VCGD bilingual redesign

Preview routes:

- Czech: `/vcgd/`
- English: `/vcgd/en/`

Shared assets:

- `vcgd.css` — standalone visual system, responsive and print styles
- `vcgd.js` — semester filters, persistent card/horizontal view switch, accessible syllabus dialog and print action
- `syllabi-cs.js` — complete Czech syllabus data
- `syllabi-en.js` — official English catalogue data, with two documented source translations
- `assets/fit-cvut-negativ-cs.svg` and `assets/fit-cvut-negativ-en.svg` — official Czech and English FIT CTU logo variants for dark backgrounds, copied without modification from the [CTU logo package](https://www.cvut.cz/logo-a-graficky-manual)

The syllabus assets are generated in two steps:

1. `node tools/build-syllabi.mjs` extracts and normalizes the full Czech data from the legacy `vcgd.html` source.
2. `python tools/fetch-en-syllabi.py` resolves current FIT catalogue links, refreshes the English catalogue text and aligns Czech catalogue URLs.

The root `vcgd.html` is now a compatibility redirect, so both the historical extensionless `/vcgd` route and `/vcgd.html` lead to the new `/vcgd/` page while preserving query parameters and fragments. The exact pre-redesign source is retained at `archive/vcgd-legacy-2026-07-15.html` and in Git history.

## Curriculum model

The presentation follows the structure of the existing VCGD prototype and the public FIT CTU course catalogue as checked on 2026-07-15:

- programme core: 62 ECTS;
- specialization core: 36 ECTS;
- required elective blocks: at least 10 ECTS;
- elective space: at least 12 ECTS;
- complete programme: 120 ECTS.

Both language variants contain the same 27 course codes. The `UEE` environment-design course is explicitly marked as planned because no stable public catalogue entry is available yet.

The detail dialog contains annotation, lecture and seminar outlines, literature, requirements and available teaching metadata. Most English texts come directly from the official FIT CTU catalogue. `ANI-DVD` and `ANI-DIP` use transparent English translations of the Czech VCGD source because the catalogue does not currently expose a complete English syllabus. `UEE` remains explicitly marked as a planned course without an approved public syllabus.
