# Python — NI-ROZ / ANI-ROZ

Česky: rozbalte celý ZIP, otevřete terminál ve složce `examples` a nainstalujte
závislosti. Doporučujeme vlastní virtuální prostředí.

English: extract the entire ZIP, open a terminal in `examples` and install
the dependencies. Use a separate virtual environment.

```sh
python -m pip install -r requirements.txt
python check_pca.py
python covariance_3d.py
python lesson_snippets.py
python geometry/pca_dbscan.py --angle 35
python classification_pipeline.py data/rings_train.csv data/rings_test.csv rbf 1 1
```

Výstup se vypíše do terminálu. `check_pca.py` používá čtyři body z `data.csv`;
`geometry/pca_dbscan.py` čte `geometry/datasets.json`. Další CSV jsou v `data`.

Output is printed in the terminal. `check_pca.py` uses the four points in
`data.csv`; `geometry/pca_dbscan.py` reads `geometry/datasets.json`.
The other CSV files are in `data`.

`covariance_3d.py` používá `data/toy-3d.csv`: všechny tři sloupce jsou příznaky.
Vypíše průměry, centrovaná data, kovarianční matici 3 × 3 a její vlastní dvojice.
`covariance_3d.py` uses `data/toy-3d.csv`: all three columns are features.
It prints the means, centred data, the 3 by 3 covariance matrix and its eigenpairs.

`classification_pipeline.py` učí scaler, PCA i SVM pouze na trénovací množině.
Poslední sloupec jeho CSV obsahuje třídu. Test ponechte pro závěrečné hodnocení;
parametry volte na validačních datech nebo vnitřní křížovou validací.

`classification_pipeline.py` fits the scaler, PCA and SVM on training data only.
Its CSV files have class labels in the last column. Reserve the test for final
evaluation; choose parameters using validation data or inner cross-validation.

Jednotlivé ukázky lze stáhnout také samostatně ve verzi Python nebo C++.
Individual examples are also available as separate Python or C++ ZIPs:
https://grafitctu.github.io/vyuka/roz/tutorials/#programming
