NI-ROZ / ANI-ROZ: Volba metody pro rozpoznavani
NI-ROZ / ANI-ROZ: Choosing a recognition method
2026-10-18

CESKY
=====

1. Rozbalte CELY ZIP. Otevrete index.html v prohlizeci.
   Instalace ani internet nejsou potreba pro slidy a pracovni list.
   Tlacitkem English prepnete jazyk. Sipky vlevo/vpravo listuji slidy.
   Rezim slidu lze vypnout pro souvisle cteni. Tisk / PDF pouzije
   tiskovy dialog prohlizece. Pro tisk slidu zvolte A4 na sirku.
   slides-cs.pdf a slides-en.pdf jsou staticke kopie. Pro funkcni
   odkazy mezi materialy pouzijte webovou verzi index.html.

2. lab.html je pracovni list na 90 minut. Obsahuje prikazy, otazky
   a pole pro odpovedi. Prohlizec se pokusi odpovedi uchovat lokalne.
   Na konci kliknete na Export odpovedi a zobrazeny souhrn zkopirujte
   do textoveho editoru a ulozte jako TXT.
   Odpovedi se neposilaji na zadny server.

3. teacher.html obsahuje metodiku, namerene vzorove vysledky,
   orientacni bodovani a zdroje. Pro ucitele, ne slepy zaverecny test.

4. lab.py a lab.ipynb obsahuji spustitelne experimenty.
   Potrebujete Python 3.11 nebo novejsi. V terminalu se presunte
   do teto slozky (tam, kde je lab.py). Vytvorte virtualni prostredi.

   Windows (PowerShell):
     py -3 -m venv .venv
     .\.venv\Scripts\python.exe -m pip install -r requirements.txt
     .\.venv\Scripts\python.exe lab.py compare --out results/run01

   Linux / macOS:
     python3 -m venv .venv
     .venv/bin/python -m pip install -r requirements.txt
     .venv/bin/python lab.py compare --out results/run01

   Instalace zavislosti potrebuje internet. Data load_digits jsou
   soucasti scikit-learn. Potom lze experimenty spoustet offline.
   Neni potreba GPU. Jupyter/VS Code pro notebook jsou volitelne
   a nejsou soucasti requirements.txt. Zvolte v nich toto prostredi.

5. Compare uci modely na treninku a porovnava je na validaci.
   Testove skore se zde nepocita. Vysledky jsou JSON a CSV.
   Kazdy novy experiment musi mit novy nazev slozky (run02, ...).
   Skript existujici vysledky neprepisuje.

6. Az po vyberu podle validace provedte jediny zaverecny test:

   Windows:
     .\.venv\Scripts\python.exe lab.py final --out results/run01
   Linux / macOS:
     .venv/bin/python lab.py final --out results/run01

   Pred testem se zapise final-choice.json. Pote vznikne final.json.
   Nepouzivejte testove skore pro dalsi ladeni. Po zmene lab.py nebo
   prostredi nejdrive udelejte novy compare. Zmeny v notebooku
   vyzaduji restart kernelu nebo znovunacteni modulu lab.

7. Zacnete ve funkci compute_features v lab.py. Jeji varianty porovnava
   feature_study s pevnym k-NN. Hlavni tabulka sedmi klasifikatoru
   a prikaz final pouzivaji puvodnich 64 pixelu. Pokud chcete novy
   priznak pouzit i tam, vlozte FeatureMap do pipeline v classifiers
   a vytvorte novy compare pred final. Zadny parametr se nesmi ucit
   z validace nebo testu. Podrobnosti a rozsireni jsou v lab.html.

8. reference/ obsahuje skutecny vzorovy beh, nikoli vymyslena cisla.
   comparison.json je zaznam faze compare; jeho test_evaluated=false
   zustava spravne i po samostatnem final, ktery ma vlastni final.json.
   Seed je 42 a split je po obrazcich, ne podle pisatelu. Jeden beh
   neurcuje obecne poradi metod. Verejna data i jejich stitky jsou
   pristupne, takze ochrany skriptu nejsou bezpecnostni mechanismus.
   Pro skutecne slepe hodnoceni musi ucitel dodat oddelena nova data.

Puvod a rozsah:
Podnetem je verejny popis deviti metod v prispevku @codingknowledge:
https://www.instagram.com/p/DejiXuBEjYY/?img_index=10
Overen byl verejny popis a nahled. Cela galerie nebyla pristupna.
Toto je puvodni vyukove rozsireni, ne prepis jednotlivych infografik.
Obrazky z Instagramu nejsou soucasti baliku. Odborne zdroje najdete
v teacher.html. Vsechny grafy vznikly z prilozeneho vzoroveho behu.

ENGLISH
=======

1. Extract the WHOLE ZIP. Open index.html in your browser.
   No installation or internet is needed for the slides or worksheet.
   Select English. Left/right arrows move between slides. Turn off
   Slide mode for continuous reading. Print / PDF opens your browser's
   print dialog. Use A4 landscape when printing the slides.
   slides-cs.pdf and slides-en.pdf are static copies. Use index.html
   for working links between the materials.

2. lab.html is the 90-minute worksheet. It includes commands,
   questions and answer fields. Your browser will try to save answers
   locally. At the end, use Export answers, copy the displayed summary
   into a text editor and save it as TXT.
   Answers are not sent to a server.

3. teacher.html provides teaching notes, measured reference results,
   an optional marking scheme and sources. It is not a blind test.

4. lab.py and lab.ipynb contain the runnable experiments.
   Use Python 3.11 or later. Open a terminal in this folder, beside
   lab.py. Create a virtual environment and run the commands above
   for Windows or Linux/macOS. You do not need to activate it.
   Dependency installation needs internet access. load_digits comes
   with scikit-learn. Experiments can then run offline. No GPU needed.
   Jupyter or VS Code are optional notebook interfaces and are not
   included in requirements.txt. Select this Python environment there.

5. Run compare first. It fits models on training data and compares
   validation scores. It does not compute test scores. Results are
   JSON and CSV. Use a fresh output folder for each experiment.
   Completed results are never overwritten.

6. Only after choosing by validation, run final once. See the commands
   above. It records final-choice.json before evaluation and writes
   final.json afterwards. Do not tune using these test scores.
   If lab.py or the environment changes, run a new compare first.
   Restart the notebook kernel or reload lab after editing lab.py.

7. Start with compute_features in lab.py. feature_study compares its
   variants using fixed k-NN. The main seven-classifier comparison and
   final use the original 64 pixels. To use a new descriptor there too,
   add FeatureMap to the pipelines in classifiers, then run a fresh
   compare before final. Fit learned parameters on training data only.

8. reference/ contains a measured example run, not invented scores.
   comparison.json records the compare phase, so test_evaluated=false
   remains correct even after a separate final.json is created.
   Seed 42, image-level split, not a test on new writers. A single run
   does not establish a universal ranking of methods. Public labels
   remain accessible; script guards are not a security mechanism.
   A genuinely blind assessment needs separate data from the teacher.

Source and scope:
The public caption of the linked @codingknowledge Instagram post is
the starting point. The caption and preview were checked, but the full
carousel was not accessible. This is an original teaching extension,
not a transcription of the individual infographics. No Instagram
images are redistributed. Primary technical sources are listed in
teacher.html. All charts were computed from the included example run.
