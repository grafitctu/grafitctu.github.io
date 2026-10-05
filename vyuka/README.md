# Výuka / Teaching

Direct routes: `/vyuka/` and `/vyuka/en/`. There is deliberately no incoming
link from the main site navigation. The two overview pages have `noindex`.
The routes are public and accessible to anyone who knows their address.

The static table has one column per subject and one row per lecture/topic.
`catalog.json` is its editable source. Add a course and its lecture entries
when extending the library; the generator creates the columns automatically.
Regenerate the two indexes with:

```powershell
node tools/build-teaching-pages.cjs
```

Lecture copies retain their existing controls, sources, images, audio and
attribution. The English overview links to the same Czech lecture content.
P01 and P02 have both interactive HTML and a PDF viewer; the other VHS lectures
use the existing PDF.js viewer. P02 examples are listed as a supplement.
VHS P10 and P11 are absent in the source material and have not been fabricated.

PGA has five prepared lectures copied from `bi-pga-school/media/lectures`,
displayed using the existing PDF.js controls and shared PDF.js library. Their subject-specific numbers
appear in each cell: 04, 05, 06, 10 and 11–13. The last item is one PDF used
for both parts of the Fourier/Wiener lecture. The source PDF numbering follows
the school course plan rather than the older consolidated LaTeX filenames.

VGA (Computer game architecture) and EGG (Engines for games and graphics)
have reserved columns. Prepared web lecture copies were not found in the
current source workspace, so their cells have no links yet.

`source-manifest.json` records the relative source path, destination, byte count
and SHA-256 of each copied file. The snapshot is dated 2026-10-05. The PDF.js
license is preserved as `vhs/pdf/PDFJS-LICENSE.txt`.

The local teaching workspace contains `tools/build_grafit_teaching.cjs`, which
copies its current lecture exports into an isolated GRAFIT checkout and
regenerates `catalog.json` and the copy manifest. Run it from that workspace:

```powershell
node tools/build_grafit_teaching.cjs <isolated-GRAFIT-checkout>
node tools/add_grafit_pga.cjs <isolated-GRAFIT-checkout>
node tools/add_grafit_course_columns.cjs <isolated-GRAFIT-checkout>
```

Then regenerate the indexes, verify the copied lectures, and publish only the
intended `vyuka/` files and the overview generator.
The VHS/DVD copy script retains additional course columns and their copy
manifest entries when refreshing those two courses.
