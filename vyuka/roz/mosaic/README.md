# Segmentace mozaiky / Mosaic segmentation (C++17)

Otevřete index.html. Ukázky, segmenter i naměřené výsledky používají C++17.
Open index.html. All code examples, segmentation outputs and measurements use C++17.

## Build and run

Linux / macOS:

    g++ -O2 -std=c++17 segment.cpp -o segment
    ./segment input.png seg.png 6 4

Windows: install Visual Studio C++ Build Tools, run build-msvc.cmd, then:

    .\segment.exe input.png seg.png 6 4

Or use CMake:

    cmake -S . -B build
    cmake --build build --config Release

Arguments: input image, output PNG, known K, method number 0..9, optional seed.
Default seed: 20261112. Method numbers match the slides and CSV.
Image is an interleaved float array: (y,x,channel). Input channels are RGB, 0..1.
Gaussian blur uses separate spatial passes, reflect padding and radius round(3*sigma).
Lab uses sRGB linearisation and D65, all three coordinates divided by 100.
K-means++ uses 5 attempts, at most 100 Lloyd iterations, 8192 sampled pixels.
std::mt19937 and standard-library shuffle are deterministic within the tested build;
other standard libraries or floating-point implementations can change results.
This is a new native implementation, not a bitwise port of the original Segmenter 18
or the previous Python demonstration. Scores and pictures were recomputed, not reused.

## Experiment

80 CVUT2016_zimni course mosaics; 10 variants; 800 independently evaluated SEG files.
Development groups 1,6,11,16 (16 images); remaining groups (64 images) held out.
The group split does not guarantee unseen textures. RGB and known K are the only inputs.
GT is used only by the evaluator and to align display colours.
The primary mosaic is an illustration, not a representative sample.
The failure slide selects the largest CS decrease from method 04 to 05.
All full result packages remain local; this publication contains selected illustrations
and aggregate measurements. See experiment-summary.json for provenance.

## Third-party code

stb_image.h (v2.30) and stb_image_write.h (v1.16): Sean Barrett and contributors.
Bundled from the existing portable course segmenter. Original licence notices remain
in each header (MIT or public-domain alternative): https://github.com/nothings/stb
No Python, OpenCV or proprietary VR library is required to compile or run the segmenter.
