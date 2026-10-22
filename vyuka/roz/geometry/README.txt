NI-ROZ / ANI-ROZ: Geometrie dat / The geometry of data
2026-10-22

ČESKY
=====
Rozbalte CELÝ balík a otevřete index.html v prohlížeči.
Česky / English přepíná jazyk. Šipky vlevo a vpravo listují slidy.
Režim slidů lze vypnout pro souvislé čtení.

Hlavní ukázka: index.html#pca
Tažením v horní ploše nebo posuvníkem otáčíte osu.
Dole se počítá Variance a zachovaný podíl rozptylu. Spodní projekční
stupnice se při otáčení nemění. Výpočet používá všechny body,
projekční úsečky kvůli čitelnosti kreslíme jen u části bodů.
Tlačítko Ukázat maximum použijte až po vlastním odhadu.
Potom zapněte Vlastní vektory a čísla. Modrá šipka ukazuje u1,
fialová u2. Pod grafem jsou jejich jednotkové souřadnice a hodnoty
lambda1, lambda2, tedy rozptyly v těchto směrech. Obě šipky mají stejnou
ilustrační délku. Otáčení oranžové osy vlastní směry ani čísla nemění.
Při změně dat nebo škálování se přepočítají.

DBSCAN: index.html#dbscan
Měňte epsilon a min_samples, klikněte na bod a sledujte okolí.
Minimum zahrnuje bod samotný. Obrys označuje okrajový bod, křížek šum.

Slide 4: index.html#svm
Záložka Přímka ve 2D: otáčení a posun přímky, živý počet chyb.
Nový příznak ve 3D: výška roviny, střed kružnice a otáčení 3D pohledu.
Kružnici posunete kliknutím či tažením vlevo, kameru tažením vpravo.
Po zaměření grafu fungují také šipky na klávesnici. Vzorce jsou sbalené.
Původní video je pouze v citaci pod slidem. Jde o ruční geometrii,
ne trénink SVM. Třetí záložka s přehrávačem byla odstraněna.

Slide 2: index.html#dbscan-video
Tři kroky: okolí bodu, růst prvního shluku a celý výsledek DBSCAN.
Vyberte jádrový, okrajový nebo šumový bod. Růst lze krokovat,
přehrávat i posunovat posuvníkem počtu zpracovaných jader.
Šedý bod při růstu ještě neznamená šum.

Slide 5: index.html#pca-video
Tři kroky: původní body, kolmá projekce, jediná souřadnice.
Posuvník mění úhel a skutečně přepočítává rozptyl.
Slide 7 srovnává tři směry na stejných 480 bodech. Tlačítka pod
grafy přenesou danou osu do hlavního klikátka.

Obrázky: index.html#digits
Posuvník mění počet složek PCA a skutečně přepočítává rekonstrukci.
PCA je naučené na trénovací části, zobrazené obrázky jsou odložené.
Záložka Co je složka? ukazuje trénovací průměr a první tři vzory vah.
Přepnutím obrázku se mění jeho koeficienty, nikoli společné vzory.
k = 0 ukáže samotný průměr, k = 64 úplnou rekonstrukci.

Slide 9: vysvětlení ×8 a ruční výpočet kovariance na čtyřech bodech.
Slide 11: pět kroků výpočtu PC1 od průměru po ověření Cu = lambda*u.
Lze přepnout aktuální mrak a čtyři jednoduché body.

Slide 13: index.html#component-count
Graf vlastních čísel, kumulativní rozptyl a rekonstrukce jsou propojené
stejným k. Tlačítka 90 %, 95 % a 99 % najdou nejmenší vyhovující k.
MSE patří vybranému obrázku, rozptyl společnému trénovacímu modelu.

Slidy 16 až 18 jsou volitelné rozšíření: krokování k-means proti DBSCAN,
skutečně naučené SVM (C, gamma, margin, podpůrné vektory) a PCA proti LDA.
SVM používá 32 předpočítaných modelů scikit-learn SVC, vždy z tréninku.

guide.html: souvislý studentský výklad všech 19 slidů.
Stejný text lze rozbalit pod každým slidem. Odkaz Výklad je v navigaci.
algorithms.html: osm dvojjazyčných pseudokódů ukázek.
examples/pca-spectrum.csv: přesné číselné hodnoty spektra PCA.

worksheet.html: úkoly na 90 minut a lokální pole pro odpovědi.
Odpovědi se nikam neposílají. Export zobrazí souhrn ke zkopírování.
teacher.html: metodika, číselná vodítka, omezení a zdroje.
examples/pca_dbscan.py: volitelný výpočet stejných dat v Pythonu.
requirements.txt: knihovny pro Python, nejsou nutné pro webovou část.

Všechny ukázky jsou vlastní a fungují bez internetu. Původní videa
jsou pouze jako odkazy a citace dole. Balík neobsahuje jejich kopie
ani snímky převzaté z videí. Pro místní webový server lze použít:
  python -m http.server 8789 --bind 127.0.0.1
a otevřete http://127.0.0.1:8789/.
Obsazený port lze změnit, například na 8790.

assets/sources.json uvádí původní odkazy a autorství: Andrew Tang,
@ml.swe. Zdrojová videa se otevírají až po kliknutí na odkaz.
Nová verze ZIP neobsahuje media/, assets/stills/ ani staré komentáře
k videím. Dřívější distribuční balíky zůstávají beze změny.

archive/ml-basics-20261018 zachovává předchozí cvičení jako doplněk.
Starší původní balík se tímto vydáním nepřepisuje.

ENGLISH
=======
Extract the WHOLE package and open index.html in a browser.
Select English. Left/right arrows change slides. Turn off Slide mode
for continuous reading.

Main example: index.html#pca
Drag in the upper plot or use the slider to rotate the projection axis.
Variance and the retained fraction update from all points. The lower
projection scale stays fixed while rotating. Projection lines are drawn
for a subset of points for readability; all points enter the calculation.
Reveal the maximum only after your own prediction.
Then enable Eigenvectors and eigenvalues. The blue arrow shows u1,
and the purple arrow shows u2. Their unit-vector components and lambda1,
lambda2 (projection variances) appear below the plot. Both arrows share
one illustrative display length. Rotating the orange axis leaves the
eigenpairs unchanged. Changing data or scaling recomputes them.

DBSCAN: index.html#dbscan
Change epsilon and min_samples. Click a point to inspect its neighbours.
The minimum count includes the point itself. Hollow points are border
points, and crosses are noise.

Slide 4: index.html#svm
Line in 2D: rotate and move a line, with a live error count.
New feature in 3D: change plane height and circle centre, rotate the view.
Click or drag on the left to move the circle. Drag on the right to rotate
the camera. Focus a plot and use arrow keys for keyboard controls.
Equations start collapsed. The original video is linked in the citation
below the slide. This is manually controlled geometry, not SVM fitting.

Slide 2: index.html#dbscan-video
Inspect neighbourhoods, step through the first cluster's core-point
queue, then show the full DBSCAN result. Grey during expansion does
not yet mean noise. Use Play, Next core point or the progress slider.

Slide 5: index.html#pca-video
Switch between original points, perpendicular projection and the
remaining one-dimensional coordinates. Rotate the axis with the slider.
Slide 7 compares three directions using the same 480 points and scale.
Each button opens its direction in the main PCA example.

Images: index.html#digits
The component slider recomputes the reconstructed images. PCA is fitted
on training data; the displayed images come from the held-out split.
What is a component? shows the training mean and three weight patterns.
Selecting another image changes its scores, not the shared patterns.
k = 0 shows only the mean. k = 64 reconstructs the complete image.

Slide 9 explains ×8 and covariance using a complete four-point example.
Slide 11 has five steps for PC1, from the mean to checking Cu = lambda*u.
Switch between the current cloud and four simple points.

Slide 13: index.html#component-count
The eigenvalue plot, cumulative variance and reconstruction share k.
The 90%, 95% and 99% buttons find the smallest qualifying count.
MSE describes the selected image; variance describes the training model.

Slides 16 through 18 are optional: k-means steps versus DBSCAN, fitted
SVM (C, gamma, margin, support vectors), and PCA versus LDA.
SVM uses 32 precomputed scikit-learn SVC models, each fitted on training
points only. The browser selects models rather than refitting them.

guide.html: a student reading guide for all 19 slides.
Expand the same text below a slide, or select Guide in the navigation.
algorithms.html: eight bilingual example pseudocodes.
examples/pca-spectrum.csv: exact numerical PCA spectrum values.

worksheet.html: 90-minute tasks and local answer fields.
Answers are not transmitted. Export displays a summary to copy.
teacher.html: teaching guidance, numerical checks, caveats and sources.
examples/pca_dbscan.py: optional Python calculations on the same data.
requirements.txt: Python dependencies, not required by the web part.

All examples are original and work offline. Source videos appear only
as links and citations below the related slides. No copied videos or
source frames are included in this ZIP. Optionally use the local HTTP
server command above and open http://127.0.0.1:8789/.
Change 8789 if the port is already in use.

assets/sources.json records source URLs and attribution: Andrew Tang,
@ml.swe. Videos open only when their external links are followed.
The new ZIP omits media/, assets/stills/ and old descriptive captions.
Previous distribution packages remain unchanged.

archive/ml-basics-20261018 keeps the previous lab as optional material.
This release does not overwrite the original earlier package.
