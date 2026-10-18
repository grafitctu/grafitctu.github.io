# Kulová: zpráva o 3D modelu ulice a jeho pramenech

Projekt MOST, GRAFIT FIT ČVUT, 18. 10. 2026. Geometrie a stránka: Claude (Anthropic); textury doplňuje Codex. Web: https://grafitctu.github.io/most/kulova/

## Co kde stálo

Poloha všech domů pochází z GIS vrstvy projektu, která je vektorizací historického plánu města Mostu z roku 1938 (budovy ve starém Mostě, Statutární město Most). Kulová v ní vede jako ulice č. 24 s dvanácti budovami: na severní straně 260, 261, 262, 263, 264, 111, 265 a 266, na jižní straně 258, 1608, 1712 a 257. Nárožní 267 GIS přiřazuje k Minoritské, domy 259 a 154 ke Školní. Kliknutím na zelený dům v mapě otevřete jeho stránku.

### Co o ulici říkají archivní karty

- Karta k fotografii ze schodů (kolem roku 1968, J. Baldž) popisuje „pohled do horního ústí Kulové ulice ze schodů za starou školou čp. 150–153 v ul. Dobrovolců“; schody vedly do Rooseveltovy ulice a jmenovaly se „Zwinger steige“.

- Tatáž karta vidí „protilehlý rohák čp. 260“, vpravo dům 259 „a níže uličkou řadu 258, 1608 a 1712“ a za ní „zídku s vraty do zahrady čp. 257 Šmeralovo nám.“ Je to jediný archivní doklad domu 1712.

- Podle stejné karty na prostranství vedle schodů „kdysi stály domky pod hradbami, počínaje čp. 154 + 267, zbořené okolo r. 1954“. To je v rozporu s polohou čp. 267 v GIS na nároží s Minoritskou; viz [Rozpory](#rozpory).

### Databázová oblast „Kulová“ je širší než ulice

Oblast Kulová v databázi Libuše obsahuje 26 struktur. Čtrnáct z nich jsou domy této ulice a nároží (čp. 1712 v databázi chybí). Dalších dvanáct leží podle GIS v sousedních ulicích nebo daleko od ní; jejich přílohy jsme načetli a prohlédli, ale modelovány nejsou:

| Čp. | Ulice podle GIS | Přílohy |
|---|---|---|
| 230 | K jatkám, Na valech | 3 |
| 239 | Na valech | 1 |
| 240 | Na valech | 1 |
| 241 | Rozmarýnová | 1 |
| 242 | Rozmarýnová | 1 |
| 253 | U jeptišek | 1 |
| 254 | U jeptišek | 3 |
| 255 | U jeptišek | 3 |
| 256 | 3. náměstí | 3 |
| 454 | v GIS není | 2 |
| 545 | Eliášova | 5 |
| 1721 | Vtelenská cesta | 9 |

## Odkud jsou prameny

### Databáze Libuše projektu MOST

U všech 26 struktur oblasti Kulová jsme 18. 10. 2026 načetli seznam příloh, pouze pro čtení. Celkem 154 příloh: černobílé fotografie, archivní karty, pohlednice, stavební plány a jejich odvozeniny (kolorované snímky, rektifikované průčelí FRONT). Sdílené snímky, například `cp_261,262,263_001` nebo `cp_111,154,265,266,267_001`, visí u více domů. Každou přílohu jsme otevřeli; náhledy jsou na stránkách domů a seznam s kontrolními součty SHA-256 v [zprávě](ZPRAVA.md).

### Stavební plány

Kulová má na rozdíl od mnoha jiných ulic skutečné výkresy: řezy a půdorysy čp. 261 z roku 1889, plán čp. 259 z roku 1871, popsaný list čp. 264 z roku 1887, projekt průčelí čp. 262 z 90. let 19. století a jeho plán z roku 1940 v měřítku 1:100 se situací ulice, plán čp. 263 z roku 1910, projekt čp. 1608 z roku 1908 a zaměření ze 60. let. Plány dvorních objektů (258, 263) nejsou doklad uličního průčelí. Ručně kreslený plán střech bloku 260–263 dokládá hřebeny a valby.

### Fotografie a karty

Hlavní obrazové prameny jsou snímky řady 261–263 z výšky, pohled ze schodů ze Školní (kolem roku 1968) a fotografie z roku 1969 na severní řadu 111–264 a 111–267. Ručně psané texty karet určují, co snímek ukazuje a kdo jsou sousedé.

### Odvozeniny

Kolorované snímky a rektifikovaná průčelí (FRONT) v databázi jsou rekonstrukce, ne prameny. Slouží jako podklad textur; o tvaru, nápisech a poškození rozhoduje původní černobílá fotografie.

### GIS a terén

Polohy, natočení a šířky průčelí jsou z GIS vrstvy (vektorizace plánu 1938, místní souřadnice EPSG:5514). Výšky budov v GIS jsou jen náhodný zástupný údaj a historický výškopis neexistuje: výšky domů odhadujeme z plánů a fotografií a podélný sklon ulice (2 % k západu) je hypotéza podle fotografie.

## Jak vznikla geometrie

- **Rešerše plánů a identita.** Pro každý dům jsme otevřeli všechny přílohy, i ty, které se zdají nepodstatné (i vnitřní půdorys ukazuje vnější obrys domu). Pořadí domů v severní řadě jsme určili porovnáním šířek parcel v GIS s pořadím a poměry domů na fotografiích; dřívější práce měly řetězec 263–267 posunutý o jeden dům.

- **Poloha v ulici.** Z GIS půdorysu je průčelní hrana, natočení a obrys domu; registr ulice `street_layout_gis.json` drží polohu všech domů.

- **Plán domu.** `geometry_plan.json` popisuje průčelí, otvory, římsy, parapety, frontony, vikýře, střechu a seznam hypotéz. Střecha prochází samostatnou kontrolou proti plánu střech nebo řezu (u 1608 tak vyšla najevo chybná přední valba).

- **Stavba v Blenderu 4.5.** Parametrický builder bez okna vyrobí BLEND a GLB. Otvory jsou skutečné niky, vikýře otevírají hlavní krytinu, frontony 262 mají patu, pole, věnec a středový článek.

- **Registrace k fotografii.** U 262 jsme osy a výšky oken posunuli na přijatý barevný FRONT a ověřili na původní černobílé fotografii (varianta G: geometrie se přizpůsobí doložené textuře).

- **Kontrola.** Audit sítě (uzavřenost, orientace, překrývající se plochy, průniky domů), test zkolabovaných UV, rendery každého otvoru zepředu a z obou stran, střešní rohy a clay. Střešní otvory navíc testuje 240–270 paprsků, zda v nich není plocha hlavní střechy.

- **Sestava ulice.** Domy, chodníky, obrubníky, vozovka a mobiliář 60. let (lavice, koše, sloupy s dráty, značka, konzolové lampy); plakátový sloup z doby kolem 1900 je samostatný objekt `*_EPOCH1900`.

Pracovní složky: F:\MOST\output\kulova_5houses_claude_G_2026-10-16\ (domy), kulova_street_claude_2026-10-16\ (ulice), kulova_geo_qa_claude_2026-10-17\ a kulova_geo_qa_claude_2026-10-18\ (opravy geometrie a UV, aktuální sestava r13).

## Rozpory a hypotézy

- **Čp. 154 a 267.** Karta ze schodů (kolem roku 1968) uvádí, že na prostranství vedle schodů „stály domky pod hradbami, počínaje čp. 154 + 267, zbořené okolo r. 1954“. GIS (plán 1938) klade 154 ke Školní, ale 267 na opačný konec ulice, na nároží s Minoritskou; tam ho určuje i porovnání šířek parcel s fotografií. Buď karta myslí jiné domy, nebo je identita 267 chybná. Nevyřešeno. Pokud platí karta, v hlavní epoše 60. let by 154 (a možná 267) už nestály.

- **Čp. 1712** v databázi Libuše chybí. Existenci dokládá situace 1940 na listu `cp_262_005` a text karty ze schodů, podobu nic. Struktura 1721, kterou databáze vede v oblasti Kulová, je jiný dům: projekt rodinného domku z roku 1930 na Vtelenské cestě, asi 1,5 km odtud.

- **Čp. 154** nemá žádný obrazový pramen; celý model je odhad podle GIS půdorysu.

- **Čp. 258.** Barevný FRONT uložený pod číslem 259 zobrazuje tento dům, ale jen vikýř, střechu a jednu řadu oken; přízemí a dveře v něm chybí.

- **Čp. 1608** je modelován podle projektu z roku 1908. Realizaci zachycuje jen vzdálený snímek; vikýře projektu (dva velké se dvěma okny a malý vpravo) se od modelu liší a čekají na samostatnou opravu.

- **Čp. 262.** Projekt z 90. let 19. století a fotografie se liší v nadokenních motivech; model sleduje fotografii. Osy oken jsou o 0,1 až 0,3 m jinde než v projektu.

- **Výšky a terén.** Výšky podlaží a střech, hloubky říms a nik jsou odhady. Historický výškopis neexistuje; podélný sklon ulice je hypotéza.

- **Půdorysy v GIS se překrývají** u dvojic 265/266, 259/258 a 1608/1712. Model je ponechává, jak jsou.

- **Epocha.** Hlavní scéna odpovídá 60. letům; plakátový sloup doložený snímkem kolem roku 1900 je samostatný objekt.

Údaje jsou v datech označené jako `model_hypothesis`, `status: provisional`, `locked: false`.

## Přehled domů

| Čp. | Strana | Typ | Podlaží | Průčelí × okap (m) | Revize | Přílohy | Textury |
|---|---|---|---|---|---|---|---|
| 260 | severní | nárožní dům s arkýřem | 3 | 12,7 × 10,8 | r5 | 11 | zatím bez textur |
| 261 | severní | dvoupodlažní dům s barokním vikýřem | 2 | 13,7 × 7,1 | r5 | 11 | Codex: pracovní textury na starší geometrii, čeká na převázání na r5 |
| 262 | severní | dům Okresní nemocenské pokladny | 3 + půdní pás | 16,5 × 13,9 | r6 | 24 | Codex: hotové na revizi r5 (vzhled schválen), čeká na převázání na r6 |
| 263 | severní | nízký dvoupodlažní dům | 2 | 10,3 × 6,3 | r3 | 16 | zatím bez textur |
| 264 | severní | úzký dům s vraty | 2 | 7,4 × 7,5 | r2 | 8 | zatím bez textur |
| 111 | severní | Lutherhaus | 2 | 11,4 × 6,9 | r6 | 7 | Codex: pracovní textury na starší geometrii, čeká na převázání na r6 |
| 265 | severní | tmavý dvoupodlažní dům | 2 | 15,2 × 6,9 | r4 | 5 | zatím bez textur |
| 266 | severní | zdobený třípodlažní dům | 3 | 11,2 × 12,0 | r4 | 5 | zatím bez textur |
| 267 | severní | nárožní dům s obchodem ZBRANĚ · STŘELIVO | 3 | 22,5 × 12,2 | r4 | 6 | zatím bez textur |
| 154 | jižní | dům do Školní (bez pramene) | 2 (hypotéza) | 11,5 × 7,0 | r2 | 2 | zatím bez textur |
| 259 | jižní | nárožní dům Kulová × Školní | 2 | 12,1 × 7,2 | r5 | 6 | zatím bez textur |
| 258 | jižní | dům s velkým vikýřem | 2 | 13,2 × 7,0 | r4 | 9 | Codex: zablokováno, podklad FRONT je jen částečný |
| 1608 | jižní | novostavba podle projektu 1908 | 2 | 12,1 × 7,6 | r6 | 4 | zatím bez textur |
| 1712 | jižní | dům bez záznamu v databázi | 2 (hypotéza) | 11,0 × 7,0 | r1 | 0 | zatím bez textur |
| 257 | jižní | přízemní dům s valbou | 1 | 19,0 × 4,2 | r3 | 7 | zatím bez textur |

## Domy jednotlivě

### Čp. 260: nárožní dům s arkýřem

- Nárožní dům Kulová × Školní (Schulgasse) s polygonálním arkýřem se štítem na západním rohu, vpravo od něj tři okenní osy ve třech podlažích, v přízemí obloukový vjezd u arkýře. Karta ze schodů (kolem roku 1968) ho jmenuje jako „protilehlý rohák čp. 260“.
- Prameny: fotografie řady od schodů ze Školní (cp_258,259,260,1608_001), ručně kreslený plán střech bloku 260–263, GIS půdorys
- Střecha: nárožní valba; hřeben uličního křídla podél Kulové, západního křídla podél Dobrovolců (plán střech bloku)
- GIS půdorys id 6 (ulice Kulová); geometrie revize r5, 167 polygonů.
- Hypotézy: výšky podlaží a okapu jsou odhad z fotografie (žádný řez); nárožní arkýř zjednodušen na hranol se střešní hmotou; na fotografii je polygonální se štítem; dlouhá fasáda do Schulgasse bez otvorů (nemodelováno); polohy os odečteny ze šikmého záběru, ne z rektifikované fotografie

| Příloha | Typ | SHA-256 (12 znaků) |
|---|---|---|
| cp_258,259,260,1608_001.jpg | archivní karta | 99035b68c24f |
| cp_258,259,260,1608_001_col.png | odvozenina (kolorovaná / FRONT) | f4cc505a9f70 |
| cp_260_001.jpg | plán / výkres | b65eb69334fb |
| cp_260_001_col_cr_front.png | odvozenina (kolorovaná / FRONT) | 9b9e1dab7995 |
| cp_260_001_mult.png | odvozenina (kolorovaná / FRONT) | fb52ab72e155 |
| cp_260_002.jpg | plán / výkres | 252a80685f93 |
| cp_260_003.jpg | plán / výkres | 27d1aded067f |
| cp_260_004.jpg | plán / výkres | 7dd3d4c5aff2 |
| cp_260_005.jpg | plán / výkres | a57a41e7e8ca |
| cp_260_006.jpg | plán / výkres | 23f9d58c3c00 |
| cp_260_007.jpg | plán / výkres | b5921e6c83ce |

### Čp. 261: dvoupodlažní dům s barokním vikýřem

- Dvoupodlažní dům vlevo od čp. 262. Ve střeše barokní vikýř se zaobleným vrcholem a malé volské oko výš ve svahu, vlevo vstupní dveře se schodem.
- Prameny: řezy a půdorysy 1889 (cp_261_001), zaměření ze 60. let (cp_261_001__2), fotografie řady 261–262–263, plán střech bloku 260–263, databázový barevný FRONT
- Střecha: sedlová, štíty na obou koncích (plán střech bloku)
- GIS půdorys id 7 (ulice Kulová); geometrie revize r5, 288 polygonů.
- Hypotézy: opening positions are fractions of width from prior registration, not measured; baroque dormer simplified to gable box with arched niche; right end gable abuts cp. 262 firewall; left hip per photo impression; provisional; rear facade blind; eb_top: position from FRONT photo (x~5.4 m, ~78 % up the slope), size estimated – provisional; door step 0.14 m: one step visible in photo, height estimated – provisional; baroque dormer: curved top + frame per photo; depth/rear hypothetical

| Příloha | Typ | SHA-256 (12 znaků) |
|---|---|---|
| cp_261,262,263_001.jpg | odvozenina (kolorovaná / FRONT) | 8e228f324ba9 |
| cp_261,262,263_001.jpg | plán / výkres | 9f83578eb0c9 |
| cp_261,262,263_001.jpg | archivní karta | 84ed644e75f3 |
| cp_261,262,263_001__2.jpg | fotografie | 8422592be672 |
| cp_261,262,263_001_col.png | odvozenina (kolorovaná / FRONT) | 7be152934800 |
| cp_261_001.jpg | plán / výkres | 764e080efd15 |
| cp_261_001__2.jpg | plán / výkres | 6fa024a10a3b |
| cp_261_001_col_cr_front.png | odvozenina (kolorovaná / FRONT) | 34ad3f97a36d |
| cp_261_001_mult.png | odvozenina (kolorovaná / FRONT) | 2e9f02f3c999 |
| cp_261_002.jpg | plán / výkres | d5f73b881e25 |
| cp_261_col.png | odvozenina (kolorovaná / FRONT) | 8751fa795ce6 |

### Čp. 262: dům Okresní nemocenské pokladny

- Historizující dům s nápisem BEZIRKS-KRANKEN-KASSA v přízemí: průjezd se segmentovým portálem, dvě patra s frontony (v 1. patře krajní trojúhelníkové a čtyři segmentové, ve 2. patře nízké trojúhelníky a zaoblené motivy v krajních osách), pilastry krajních os, v půdním pásu čtyři okna a dvě slepá pole.
- Prameny: plán 10/1940 v měřítku 1:100 (cp_262_005), projekt průčelí z 90. let 19. století (cp_262_006), fotografie řady 261–263 z věže kostela, plán střech bloku; osy podle přijatého barevného FRONTu ověřené na černobílé fotografii
- Střecha: valba k 261, štít nad 263, nízká valba nad pravým traktem
- GIS půdorys id 8 (ulice Kulová); geometrie revize r6, 1847 polygonů.
- Hypotézy: axes_x from design elevation cp_262_006 scaled to 16.50 m; provisional; opening heights from photo/elevation proportions; provisional; rear/right-wing roof simplified, courtyard wings omitted; provisional; cornice/pediment depths are modelling defaults, not measured; pediment depths/profile steps are not measured (provisional); contour types from photo ca5bfe70 + elevation cp_262_006; attic blind fields (axes 2,5) depth 0.06 provisional; gate passage depth 0.45 provisional (no steps per plan 1940 ground floor); pilaster/capital dimensions estimated from photo; festoon ornament left to texture; gutter radius/downpipe position estimated from photo

| Příloha | Typ | SHA-256 (12 znaků) |
|---|---|---|
| cp_261,262,263_001.jpg | plán / výkres | 9f83578eb0c9 |
| cp_261,262,263_001.jpg | archivní karta | 84ed644e75f3 |
| cp_261,262,263_001.jpg | fotografie | 9e44e922e859 |
| cp_261,262,263_001__2.jpg | fotografie | 8422592be672 |
| cp_261,262,263_001_col.png | odvozenina (kolorovaná / FRONT) | 7be152934800 |
| cp_261_col.png | odvozenina (kolorovaná / FRONT) | 8751fa795ce6 |
| cp_262_001.jpg | archivní karta | 05da9d0ea15e |
| cp_262_001.jpg | plán / výkres | f641735c5a73 |
| cp_262_001_col.png | odvozenina (kolorovaná / FRONT) | 201b7459e68e |
| cp_262_001_col_cr_front.png | odvozenina (kolorovaná / FRONT) | 1ba7f8f13df7 |
| cp_262_001_mult.png | odvozenina (kolorovaná / FRONT) | 7d5ec38f02c4 |
| cp_262_002.jpg | plán / výkres | dfda2a5e015d |
| cp_262_003.jpg | plán / výkres | 686008a20421 |
| cp_262_004.jpg | plán / výkres | e5952f29c667 |
| cp_262_005.jpg | plán / výkres | fa9e6431bc55 |
| cp_262_006.jpg | plán / výkres | d5f25d683fb4 |
| cp_262_007.jpg | plán / výkres | 66a76b123ade |
| cp_262_008.jpg | plán / výkres | 3bef61e1b968 |
| cp_262_009.jpg | plán / výkres | b71b83f2024b |
| cp_262_010.jpg | plán / výkres | 66f5f0b0a9c2 |
| cp_262_011.jpg | plán / výkres | 873274c940f6 |
| cp_262_012.jpg | plán / výkres | f502d414b198 |
| cp_262_013.jpg | plán / výkres | 622181244887 |
| cp_262_014.jpg | plán / výkres | a419c7cd8219 |

### Čp. 263: nízký dvoupodlažní dům

- Nízký dvoupodlažní dům vpravo od 262 s obloukovými dveřmi a třemi volskými oky.
- Prameny: plán 10/1910 se šířkou průčelí 10,28 m (cp_263_003), zaměření 1965, fotografie z roku 1969 (cp_111,263,264_001), plán střech bloku
- Střecha: uliční křídlo s hřebenem podél ulice, zadní křídlo s valbou (plán střech bloku)
- GIS půdorys id 9 (ulice Kulová); geometrie revize r3, 166 polygonů.
- Hypotézy: identity of this facade vs. 264 remains provisional (see identity report 27.9.2026); eave/ridge heights and depth are photo/plan estimates; rear 1908 dormer and rear windows omitted; eyebrow dormer positions approximate from photo

| Příloha | Typ | SHA-256 (12 znaků) |
|---|---|---|
| cp_111,263,264_001.jpg | archivní karta | 7e1c2e60a8ae |
| cp_111,263,264_001_col.png | odvozenina (kolorovaná / FRONT) | fa22e384e1ba |
| cp_261,262,263_001.jpg | archivní karta | 84ed644e75f3 |
| cp_261,262,263_001.jpg | plán / výkres | 9f83578eb0c9 |
| cp_261,262,263_001.jpg | odvozenina (kolorovaná / FRONT) | 8e228f324ba9 |
| cp_261,262,263_001__2.jpg | fotografie | 8422592be672 |
| cp_261,262,263_001_col.png | odvozenina (kolorovaná / FRONT) | 7be152934800 |
| cp_261_col.png | odvozenina (kolorovaná / FRONT) | 8751fa795ce6 |
| cp_263_001.jpg | plán / výkres | 16e93eccfa6b |
| cp_263_001__2.jpg | plán / výkres | dcf7bd236b1d |
| cp_263_001_col_cr_front.png | odvozenina (kolorovaná / FRONT) | 53fcf394d91c |
| cp_263_001_mult.png | odvozenina (kolorovaná / FRONT) | 8b9826d596ed |
| cp_263_002.jpg | plán / výkres | 3006d6461f6e |
| cp_263_002__2.jpg | plán / výkres | 550e1b03bf80 |
| cp_263_003.jpg | plán / výkres | fa53efe86a09 |
| cp_264_col.png | odvozenina (kolorovaná / FRONT) | e8f25af82375 |

### Čp. 264: úzký dům s vraty

- Úzký třiosý dům s vraty a třemi volskými oky.
- Prameny: popsaný list 1887 se šířkou 7,4 m (cp_264_001), půdorys 1965, fotografie z roku 1969
- Střecha: sedlová s volskými oky
- GIS půdorys id 10 (ulice Kulová); geometrie revize r2, 153 polygonů.
- Hypotézy: G1/G2 ground windows are a hypothesis (photo partly occluded; prior batch registered only U1-U3 and D1); facade identity (narrow 3-axis part vs. wide Lutherhaus front) provisional per prior reports; depth/rear simplified

| Příloha | Typ | SHA-256 (12 znaků) |
|---|---|---|
| cp_111,263,264_001.jpg | archivní karta | 7e1c2e60a8ae |
| cp_111,263,264_001_col.png | odvozenina (kolorovaná / FRONT) | fa22e384e1ba |
| cp_264_001.jpg | plán / výkres | f30db03b02fb |
| cp_264_001__2.jpg | plán / výkres | 2855e8ce812b |
| cp_264_001_col_cr_front.png | odvozenina (kolorovaná / FRONT) | 0a1d414cc0ce |
| cp_264_001_mult.png | odvozenina (kolorovaná / FRONT) | 370140209821 |
| cp_264_002.jpg | plán / výkres | 1f51ea31f99b |
| cp_264_col.png | odvozenina (kolorovaná / FRONT) | e8f25af82375 |

### Čp. 111: Lutherhaus

- „Lutherhaus“: dvoupodlažní dům s nápisovým pásem nad přízemím, mělce obloukovými vstupními dveřmi a pěti volskými oky ve dvou řadách. Identitu určuje pořadí domů na fotografiích ve shodě se šířkami parcel v GIS.
- Prameny: fotografie z roku 1969 (cp_111,263,264_001) a řady 111–267 (cp_111,154,265,266,267_001), archivní karta, GIS půdorys
- Střecha: sedlová s pěti volskými oky; zadní křídlo bez plánu střechy (hypotéza)
- GIS půdorys id 11 (ulice Kulová); geometrie revize r6, 330 polygonů.
- Hypotézy: identita „tmavý dům = 111“ podle popisku karty 111,263,264; identity report ji nechává provisional; osy odečteny ze šikmého záběru; eyebrow positions read from the original B/W FRONT (3 lower at ~2.0/5.7/9.4 m, 2 upper at ~3.9/7.6 m); sizes estimated – provisional; door arch: shallow segmental per photo; rear wing unchanged – hypothesis without roof plan

| Příloha | Typ | SHA-256 (12 znaků) |
|---|---|---|
| P-000190.jpg | pohlednice | b8adcb802c28 |
| P-000190__2.jpg | pohlednice | 211003d6e8aa |
| cp_111,154,265,266,267_001.jpg | fotografie | 0ebdc835a90e |
| cp_111,154,265,266,267_001_col.png | odvozenina (kolorovaná / FRONT) | 050253bb34ef |
| cp_111,263,264_001.jpg | archivní karta | 7e1c2e60a8ae |
| cp_111,263,264_001_col.png | odvozenina (kolorovaná / FRONT) | fa22e384e1ba |
| cp_111,265,266,267_001.jpg | archivní karta | 2bd813fa16fa |

### Čp. 265: tmavý dvoupodlažní dům

- Tmavě omítaný dvoupodlažní dům mezi Lutherhausem (111) a zdobeným 266.
- Prameny: fotografie řady 111–267, GIS půdorys (hluboká parcela tvaru L)
- Střecha: nízká valba za hlavní římsou
- GIS půdorys id 12 (ulice Kulová); geometrie revize r4, 194 polygonů.
- Hypotézy: osy a výšky ze šikmé fotografie; frontony zjednodušeny; zadní L křídlo jen jako součást půdorysu bez vlastní střechy

| Příloha | Typ | SHA-256 (12 znaků) |
|---|---|---|
| P-000190.jpg | pohlednice | b8adcb802c28 |
| P-000190__2.jpg | pohlednice | 211003d6e8aa |
| cp_111,154,265,266,267_001.jpg | fotografie | 0ebdc835a90e |
| cp_111,154,265,266,267_001_col.png | odvozenina (kolorovaná / FRONT) | 050253bb34ef |
| cp_111,265,266,267_001.jpg | archivní karta | 2bd813fa16fa |

### Čp. 266: zdobený třípodlažní dům

- Třípodlažní dům s pilastry a segmentovými frontony vedle nárožního 267.
- Prameny: fotografie řady 111–267, GIS půdorys
- Střecha: nízká valba
- GIS půdorys id 13 (ulice Kulová); geometrie revize r4, 224 polygonů.
- Hypotézy: zkosené nároží nemodelováno (builder nemá chamfer); dlouhá fasáda do boční ulice bez otvorů; identita 265/266 podle GIS pořadí; popisky na fotografii nejsou jednoznačné

| Příloha | Typ | SHA-256 (12 znaků) |
|---|---|---|
| P-000190.jpg | pohlednice | b8adcb802c28 |
| P-000190__2.jpg | pohlednice | 211003d6e8aa |
| cp_111,154,265,266,267_001.jpg | fotografie | 0ebdc835a90e |
| cp_111,154,265,266,267_001_col.png | odvozenina (kolorovaná / FRONT) | 050253bb34ef |
| cp_111,265,266,267_001.jpg | archivní karta | 2bd813fa16fa |

### Čp. 267: nárožní dům s obchodem ZBRANĚ · STŘELIVO

- Nárožní dům Kulová × Minoritská se zkoseným nárožím a obchodem ZBRANĚ · STŘELIVO, výkladce do obou ulic. Pozor: karta ze schodů (kolem roku 1968) uvádí čp. 154 a 267 mezi „domky pod hradbami“ zbořenými okolo roku 1954 – viz Rozpory.
- Prameny: fotografie řady 111–267 (cp_111,154,265,266,267_001), GIS půdorys (22,5 m do Minoritské, 17,6 m do Kulové)
- Střecha: valba (hypotéza)
- GIS půdorys id 14 (ulice Minoritů); geometrie revize r4, 471 polygonů.
- Hypotézy: počet os a výšky odhad ze šikmé fotografie; zkosení nároží 2,2 m (odhad); zadní křídla jen GIS obrys

| Příloha | Typ | SHA-256 (12 znaků) |
|---|---|---|
| P-000190.jpg | pohlednice | b8adcb802c28 |
| P-000190__2.jpg | pohlednice | 211003d6e8aa |
| P-000964.jpg | pohlednice | e02031c1b4c4 |
| cp_111,154,265,266,267_001.jpg | fotografie | 0ebdc835a90e |
| cp_111,154,265,266,267_001_col.png | odvozenina (kolorovaná / FRONT) | 050253bb34ef |
| cp_111,265,266,267_001.jpg | archivní karta | 2bd813fa16fa |

### Čp. 154: dům do Školní (bez pramene)

- Dům s průčelím do Školní ulice. V databázi k němu není fotografie ani plán, model je celý hypotéza podle GIS půdorysu. Podle karty ze schodů patřil k domkům pod hradbami zbořeným okolo roku 1954.
- Prameny: jen GIS půdorys a seznam domů u fotografie cp_111,154,265,266,267_001, kde ho nelze rozlišit
- Střecha: valba (hypotéza)
- GIS půdorys id 302 (ulice Školní); geometrie revize r2, 111 polygonů.
- Hypotézy: CELÝ DŮM JE HYPOTÉZA: žádný fotografický ani plánový pramen; jen GIS obrys a generické dvoupodlažní členění

| Příloha | Typ | SHA-256 (12 znaků) |
|---|---|---|
| cp_111,154,265,266,267_001.jpg | fotografie | 0ebdc835a90e |
| cp_111,154,265,266,267_001_col.png | odvozenina (kolorovaná / FRONT) | 050253bb34ef |

### Čp. 259: nárožní dům Kulová × Školní

- Nárožní dům: vstupní průčelí se čtyřmi osami a dveřmi do Školní, do Kulové bok se třemi osami; břidlicová valba.
- Prameny: fotografie od schodů (cp_258,259,260,1608_001 a kolorovaná odvozenina), plán 1871 (cp_259_001)
- Střecha: valba na obou koncích (plán 1871), břidlice (kolorovaná fotografie)
- GIS půdorys id 312 (ulice Školní); geometrie revize r5, 100 polygonů.
- Hypotézy: osy odečteny ze šikmého záběru; výšky odhad; zadní část nemodelována

| Příloha | Typ | SHA-256 (12 znaků) |
|---|---|---|
| cp_258,259,260,1608_001.jpg | archivní karta | 99035b68c24f |
| cp_258,259,260,1608_001_col.png | odvozenina (kolorovaná / FRONT) | f4cc505a9f70 |
| cp_259_001.jpg | plán / výkres | b754306de87f |
| cp_259_001_col_cr_front.png | odvozenina (kolorovaná / FRONT) | 7ec0cb625982 |
| cp_259_001_mult.png | odvozenina (kolorovaná / FRONT) | a9847da67210 |
| cp_259_002.jpg | plán / výkres | 2986c96dc2d9 |

### Čp. 258: dům s velkým vikýřem

- Žlutý dvoupodlažní dům za 259 s velkým středovým sedlovým vikýřem se třemi okny. Barevný FRONT uložený v databázi pod číslem 259 zobrazuje tento dům, ale jen zčásti (vikýř, střecha a jedna řada oken).
- Prameny: kolorovaná fotografie od schodů, databázový FRONT „259“; plány 258 z let 1888 a 1910 jsou dvorní objekty, ne uliční průčelí
- Střecha: sedlová, štíty k sousedům
- GIS půdorys id 313 (ulice Kulová); geometrie revize r4, 222 polygonů.
- Hypotézy: identita: databázový FRONT „259“ přiřazen tomuto domu podle fotografie (SOL61 jej u 259 odmítla); osy a výšky odhad z fotografie; plány 258 (magazín 1888, dvorní křídlo 1910) nejsou uliční průčelí

| Příloha | Typ | SHA-256 (12 znaků) |
|---|---|---|
| P-000074.jpg | pohlednice | 4425c866a184 |
| P-000074__2.jpg | pohlednice | db59d0f8e122 |
| cp_258,259,260,1608_001.jpg | archivní karta | 99035b68c24f |
| cp_258,259,260,1608_001_col.png | odvozenina (kolorovaná / FRONT) | f4cc505a9f70 |
| cp_258_001.jpg | plán / výkres | 9f1fb9e96b83 |
| cp_258_002.jpg | plán / výkres | 8f354655de51 |
| cp_258_003.jpg | plán / výkres | 250091c2e28f |
| cp_258_004.jpg | plán / výkres | b7646e04f54f |
| cp_258_005.jpg | plán / výkres | 5d0b81c7b07c |

### Čp. 1608: novostavba podle projektu 1908

- Dům podle projektu „Plan über Erbauung eines Wohnhauses“ z roku 1908 (Bauparzelle 1608 ½, Kugelgasse). Na fotografii od schodů je jen vzdáleně v pozadí za 258.
- Prameny: projekt 1908 (cp_1608_002: pohled, řez A-B, krov), fotografie od schodů
- Střecha: podle projektu: plná přední plocha, hřeben souběžně s ulicí, štítové konce, dva komíny; zadní křídlo s valbou
- GIS půdorys id 2052 (ulice Kulová); geometrie revize r6, 193 polygonů.
- Hypotézy: členění z projektu 1908, realizace fotograficky nepotvrzena v detailu; výšky z plánu odhadem; roof r6: topology from the 1908 design sheet (front rectangle, ridge parallel to the street, gable ends); heights unchanged estimates; dormers differ from the 1908 Ansicht (2+2+1 windows) – open blocker

| Příloha | Typ | SHA-256 (12 znaků) |
|---|---|---|
| cp_1608_001.jpg | plán / výkres | 4cb268972cb1 |
| cp_1608_002.jpg | plán / výkres | 3ddf18dd6b40 |
| cp_258,259,260,1608_001.jpg | archivní karta | 99035b68c24f |
| cp_258,259,260,1608_001_col.png | odvozenina (kolorovaná / FRONT) | f4cc505a9f70 |

### Čp. 1712: dům bez záznamu v databázi

- V databázi Libuše struktura 1712 neexistuje (struktura 1721 je jiný dům na Vtelenské cestě). Existenci domu dokládá situace 1940 na listu cp_262_005 a karta ze schodů, která jmenuje „řadu 258, 1608 a 1712“. Podobu nedokládá nic: model je hypotéza podle GIS půdorysu a sousedů.
- Prameny: GIS půdorys, situace 1940 na listu cp_262_005, text karty cp_258,259,260,1608_001
- Střecha: sedlová se štítem k 1608 a valbou k volnému konci (hypotéza)
- GIS půdorys id 2053 (ulice Kulová); geometrie revize r1, 126 polygonů.
- Hypotézy: CELÝ DŮM JE HYPOTÉZA: v Libuši neexistuje struktura 1712 (prohledány všechny oblasti); jen GIS obrys a sousedství; počet podlaží a členění odvozeno od sousedů

### Čp. 257: přízemní dům s valbou

- Přízemní starý dům s valbovou střechou, na kartách už jako ruina s odkrytým krovem; půdorys tvaru L se zadním křídlem. Karta ze schodů zmiňuje „zídku s vraty do zahrady čp. 257 Šmeralovo nám.“
- Prameny: karty cp_257_001 a cp_257_002, GIS půdorys
- Střecha: valba
- GIS půdorys id 314 (ulice Kulová); geometrie revize r3, 80 polygonů.
- Hypotézy: počet a poloha otvorů odhad (fotografie šikmá, dům zarostlý); zadní křídlo jako hmota z GIS

| Příloha | Typ | SHA-256 (12 znaků) |
|---|---|---|
| cp_257_001.jpg | fotografie | 7ee75ddcc621 |
| cp_257_001.jpg | odvozenina (kolorovaná / FRONT) | 29b238b95138 |
| cp_257_001.jpg | archivní karta | 76f4070f8143 |
| cp_257_001.jpg | plán / výkres | 10adba4fe0f6 |
| cp_257_001_col.png | odvozenina (kolorovaná / FRONT) | 9fa3f9a22600 |
| cp_257_002.jpg | archivní karta | 71307327dbe6 |
| cp_257_002_col.png | odvozenina (kolorovaná / FRONT) | 7d54a927ec8c |
