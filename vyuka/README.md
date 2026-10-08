# Výuka / Teaching

Direct routes: `/vyuka/` and `/vyuka/en/`. There is deliberately no incoming
link from the main site navigation. The two overview pages have `noindex`.
The routes are public and accessible to anyone who knows their address.

The static table has one column per subject and one row per lecture/topic.
It fits the available desktop width without horizontal scrolling. At 1100px
and below, each topic row becomes a grid of labelled lecture cards (two
columns, or one at 600px and below); empty cells are omitted. Planned
subjects remain visible in a short status line. All navigation uses normal
vertical page scrolling.
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

VGA (Computer game architecture) still has a reserved column.
The 2026-10-07 snapshot adds eight current public web presentations from
Petr Pauš: three MVT, one EGG (coauthored with Jan Matoušek) and four PVR.
Their entrypoints were verified against the current official course plans.
The two presentations for MVT lecture 02 share one table cell, each with
its own title and links. Cells can contain a lecture object or an array.
All lectures retain the author's attribution and controls, with a source link
in the overview. Lecture code/library/images are mirrored in `paus/` using
their original directory structure. Videos and project archives retain
absolute links to the author's server. One MVT AR GIF link returning 404 was
corrected to the working image already specified by the source's preview.

`source-manifest.json` records the relative source path, destination, byte count
and SHA-256 of each copied file. For mirrored Pauš lectures it additionally
records the original URL, original hash and documented link adaptations.
The latest snapshot is dated 2026-10-07. The PDF.js
license is preserved as `vhs/pdf/PDFJS-LICENSE.txt`.

The local teaching workspace contains `tools/build_grafit_teaching.cjs`, which
copies its current lecture exports into an isolated GRAFIT checkout and
regenerates `catalog.json` and the copy manifest. Run it from that workspace:

```powershell
node tools/build_grafit_teaching.cjs <isolated-GRAFIT-checkout>
node tools/add_grafit_pga.cjs <isolated-GRAFIT-checkout>
node tools/add_grafit_course_columns.cjs <isolated-GRAFIT-checkout>
python tools/mirror_paus_lectures.py
node tools/add_grafit_paus.cjs <isolated-GRAFIT-checkout>
```

Then regenerate the indexes, verify the copied lectures, and publish only the
intended `vyuka/` files and the overview generator.
The VHS/DVD copy script retains additional course columns and their copy
manifest entries when refreshing those two courses.

PGA lecture 01 now has a native, offline HTML adaptation of Jiří Chludil's
verified 40-page 2024/2025 PDF at `pga/p01/`. It reuses the VHS 01 stylesheet
and navigation, adds DVD-style notes, retains all 17 source illustrations,
and maps each HTML slide to its original PDF page. Four explicitly labelled
browser models demonstrate extension methods, plugin callbacks, RGB preview
and tiled working memory; they do not execute a real Blender/GIMP plugin.
Historical grading and software-version claims are labelled as such. The
original PDF, printable HTML export, editable slide data and provenance are
included. Both public and local source PDFs had the same SHA-256.

The authoring workspace uses `tools/build_chludil_p01.py` and
`tools/add_grafit_chludil.cjs`. The builder checks the reviewed source PDF hash
before rebuilding; a changed PDF requires a new content review. The PGA PDF
refresh script preserves independently authored HTML lectures and their
manifest entries.
