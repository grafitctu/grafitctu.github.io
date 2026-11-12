# C++17 — NI-ROZ / ANI-ROZ

Česky: tyto příklady odpovídají přepínači Python / C++ ve slidech.
Ke kompilaci stačí C++17 a CMake. Python ani OpenCV nejsou potřeba.
LIBSVM je přibalený ve zdrojovém kódu, včetně licence.

English: these programs accompany the Python / C++ selector in the slides.
They need a C++17 compiler and CMake. Python and OpenCV are not required.
LIBSVM is included as source, with its licence.

Z adresáře `examples/cpp` / From `examples/cpp`:

```sh
cmake -S . -B build
cmake --build build --config Release
```

Windows: použijte Visual Studio 2022 s C++ workloadem; CMake zvolí jeho generátor.
Windows: install Visual Studio 2022 with the C++ workload; CMake can use that generator.
Příkazy spusťte v Developer PowerShell for VS, nebo otevřete složku s
`CMakeLists.txt` přímo ve Visual Studiu.
Run the commands in Developer PowerShell for VS, or open the folder containing
`CMakeLists.txt` directly in Visual Studio.

Linux / macOS (typický generátor s jednou konfigurací / usual single-config generator):

```sh
./build/check_pca
./build/covariance_3d ../data/toy-3d.csv
./build/pca_dbscan --data ../data --angle 35
./build/pca_dbscan --data ../data --y-scale 8 --standardize
./build/classification_pipeline ../data/blobs_train.csv ../data/blobs_test.csv rbf 1 1
./build/lesson_snippets
```

Windows, PowerShell (Visual Studio generator):

```powershell
.\build\Release\check_pca.exe
.\build\Release\covariance_3d.exe ..\data\toy-3d.csv
.\build\Release\pca_dbscan.exe --data ..\data --angle 35
.\build\Release\classification_pipeline.exe ..\data\blobs_train.csv ..\data\blobs_test.csv rbf 1 1
.\build\Release\lesson_snippets.exe
```

- `recognition.hpp`: čitelné výukové funkce / readable teaching functions:
  mean, covariance, PCA, standardization, DBSCAN, K-means, 1-NN, binary Fisher LDA.
- `lesson_snippets.cpp`: přesné C++ ukázky ze slidů / the exact slide examples.
- `check_pca.cpp`: čtyři body, vlastní čísla a chyba rekonstrukce pro každé k /
  the four-point example, eigenvalues and reconstruction error for each k.
- `covariance_3d.cpp`: tři příznaky, kovarianční matice 3 × 3 a její vlastní dvojice /
  three features, a 3 by 3 covariance matrix and its eigenpairs.
  `toy-3d.csv` má tři příznakové sloupce; všechny patří do výpočtu kovariance. /
  All three columns of `toy-3d.csv` are features and enter the covariance calculation.
- `pca_dbscan.cpp`: stejná data i argumenty jako Python; `--data` volí adresář CSV /
  same saved points and options as Python; `--data` selects the CSV directory.
- `classification_pipeline.cpp`: fit scaler/PCA/SVM jen na tréninku /
  fit scaler/PCA/SVM on training data only.

PCA používá výběrovou kovarianci s dělitelem n−1. Scaler klasifikační pipeline
používá n jako scikit-learn StandardScaler; volba `--standardize` v demonstračním
`pca_dbscan` používá n−1, stejně jako jeho původní Python varianta.
PCA uses sample covariance (n−1). The classification scaler uses n, matching
StandardScaler; the descriptive `pca_dbscan --standardize` uses n−1, matching
its original Python companion.

Znaménka vlastních vektorů se mohou lišit; stejné jsou osy, rozptyly a rekonstrukce.
Eigenvector signs may differ; axes, variances and reconstruction are equivalent.
`check_pca` reports MSE per original number. The legacy `pca_dbscan`
`reconstruction_mse` field averages squared Euclidean error per sample (sums
over its two features), matching the existing Python companion.
DBSCAN labels are cluster identifiers, not ground-truth class labels.
The PCA/Jacobi implementation is intended for small dense teaching examples.

SVM: Chih-Chung Chang and Chih-Jen Lin, LIBSVM 3.37,
tag `v337`, commit `6b907139084abf2da4d6d3cb10dc3b7eaffa2fbb`.
Official source: https://github.com/cjlin1/libsvm/tree/v337
Licence: `third_party/libsvm/COPYRIGHT` (BSD 3-Clause).
