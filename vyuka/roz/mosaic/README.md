# Mosaic segmentation teaching demo

Open index.html. Use CZ/EN, arrow keys, reading mode or Print / PDF.

Install `python -m pip install -r requirements.txt` and run:

    python segment.py input.png seg.png --k 6 --method 04_Lab_std

K must match the assignment metadata for your image. Output stores class IDs.
The presentation compares 10 fixed variants on 80 CVUT2016_zimni course mosaics.
Development groups: 1, 6, 11, 16 (16 images), remaining groups: 64 images.
The split does not guarantee unseen textures. GT is never a segmenter input.
Image colours are aligned to GT for visualisation only, not for generating labels.
The primary example is tm18_2_2 (selected illustration, not a representative sample).
The failure example tm2_2_2 shows the largest CS drop for method 04 vs 05.
Source dataset: CVUT2016_zimni, distributed for the CTU ROZ assignment.
Original course: https://courses.fit.cvut.cz/NI-ROZ/
This is a new teaching implementation, not an original lecture by Michal Haindl.

Measured versions: NumPy 2.5.1, SciPy 1.18.0, scikit-learn 1.9.0, scikit-image 0.26.0.
See experiment-summary.json for parameters and evaluation provenance.
Only the presentation, illustrative images and segmenter source are published here.
The complete result packages and per-image private reports remain local.
