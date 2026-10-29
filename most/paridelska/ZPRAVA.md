# Pařidelská (Paredler Straße): zpráva o 3D modelu ulice a jeho pramenech

Projekt MOST, GRAFIT FIT ČVUT, 29. 10. 2026. Geometrie a stránka: Claude (Anthropic); textury doplňuje Codex. Web: https://grafitctu.github.io/most/paridelska/

Stav: ve 3D jsou 2 z 4 budov s půdorysem v GIS; ostatní čekají na prameny (archiv 29. 10. 2026 neodpovídal). Model ulice (GLB) je k dispozici.

## Co kde stálo

Poloha všech domů pochází z GIS vrstvy projektu, která je vektorizací historického plánu města Mostu z roku 1938. Ulice v ní vede jako Pařidelská (něm. Paredler Strasse) od jihozápadu (od U hřiště) k severovýchodu s 8 budovami: 4 s číslem popisným (421 a 1084 na severozápadní straně, 426 a 1425 na jihovýchodní) a 4 bez čísla na jihozápadním konci u hřiště. Liebknechtova ulice odbočuje k jihu hned za dvojvilou 426; za vilami vedla státní dráha, naproti přes silnici ležel Deutscher Sportplatz (situace 1922). Kliknutím na dům v mapě otevřete jeho stránku.

Půdorysy vil jsou v modelu podle kótovaných stavebních plánů (426: 27,00 × 12,35 m s rizalitem 0,8 m, 1922; 1425: 14,00 × 9,20 m, 1925) a jsou ukotvené na polygony GIS; u dvojvily 426 kreslí GIS čelo vystupující 2,1 m, které plán nezná (viz [Rozpory](#rozpory)).

### Úseky ulice
- SZ · severozápadní strana (u hřiště): 421, 1084
- JV · jihovýchodní strana (vily u Liebknechtovy a dráhy): 426, 1425

### Databázová oblast „Pařidelská“ a co modelováno není

Oblast Pařidelská v databázi Libuše obsahovala v živém seznamu z 23. 10. 2026 7 struktur (421, 426, 990, 1084, 1124, 1425, 1426). Struktury 426 a 1425 mají druhý záznam v oblasti Liebknechtova, kde jsou uloženy stavební plány a fotografie; z těchto kopií, načtených 23. 10. 2026 jiným vláknem, vznikly oba modely. Struktura 522, zadaná pod Pařidelskou, je v živém seznamu v oblasti Tyršova a v GIS leží pod Jahnovou ulicí 730 m odtud. Při zpracování 29. 10. 2026 archiv neodpovídal (časový limit spojení), proto přílohy oblasti Pařidelská nebylo možné otevřít; domy bez půdorysu v GIS nebo bez dostupného pramene jsou předány jako blocked:

| Čp. | Proč není modelován | Přílohy v databázi |
|---|---|---|
| 990 | bez půdorysu v GIS; přílohy (snímek sdílený s 1124 a 522) 29. 10. 2026 nedostupné | 5 (nedostupné) |
| 1124 | bez půdorysu v GIS; přílohy nedostupné | 5 (nedostupné) |
| 1426 | bez půdorysu v GIS; snímek sdílený s 1084 nedostupný | 5 (nedostupné) |
| 522 | v GIS pod Jahnovou 730 m od Pařidelské, v databázi živě v oblasti Tyršova – identita k ověření; přílohy nedostupné | 21 (nedostupné) |

## Odkud jsou prameny

### Stavební plány Ernsta Wettsteina 1922 a 1925

Obě vily mají kótované projekty mosteckého stavitele Ernsta Wettsteina pro Theresia Tiefbau-Gewerkschaft: dvojvila 426 z 24. 7. 1922 (Vorderansicht, podkroví, řezy a–b a c–d, půdorysy sklepa, přízemí a patra, situace se silnicí Brüx–Paredl, sportovištěm a dráhou) a vila 1425 ze září 1925 (pohled, řez, půdorysy, krov, situace 1:1440) s plánem oplocení z roku 1926. Projekt není realizace: půdorysy a výšky jsou z plánů, skladbu fasád ověřují fotografie, kde existují.

### Fotodokumentace KSPPOP 1974

Fotografie z roku 1974 s kartami Krajského střediska státní památkové péče a ochrany přírody v Ústí nad Labem popisují stanoviště a sousedy: u vily 1425 průčelí z protější strany Pařidelské (vpravo dům 1825, vlevo hradlo starého nádraží), nároží s Liebknechtovou a nádvorní stranu se vstupem; u dvojvily 426 zadní stranu z Liebknechtovy a řadu dvojvil, kde je 426 „poslední vlevo“. Náčrt KSPPOP 1425/1 dává členění střechy. Cílová epocha modelu jsou 70. léta.

### Starší plány 1874–1897

Ve struktuře 426 jsou i plány z let 1874, 1878, 1885 a 1897. Patří dřívějšímu domu téhož čísla (jiný půdorys, jiný stavebník) a pro model dvojvily z roku 1922 se nepoužily; zapsáno v knize nesouladů.

### Databáze Libuše projektu MOST a výpadek 29. 10. 2026

Databáze byla použita pouze pro čtení (0 zápisů). Seznamy struktur pocházejí z živého načtení oblastí 23. 10. 2026; při zpracování 29. 10. 2026 archiv neodpovídal (spojení vypršelo), takže z 99 příloh 10 struktur (oblasti Pařidelská, Liebknechtova a Tyršova) bylo možné otevřít 30 (30 různých souborů podle SHA-256: 17 plánů a výkresů, 5 fotografií, 5 archivních karet, 2 kolorovaných odvozenin a 1 dalších odvozenin bez tagu), všechny z kopií struktur 426 a 1425 oblasti Liebknechtova. Zbylých 69 příloh (oblast Pařidelská včetně vlastních záznamů 426 a 1425, struktura 522) zůstává nedostupných a budou doplněny, až archiv odpoví; zapsáno v knize nesouladů.

### Odvozeniny

Kolorované snímky a výřezy v databázi jsou rekonstrukce, ne prameny. O tvaru, otvorech a nápisech rozhoduje původní černobílá fotografie nebo plán.

### GIS a terén

Polohy a natočení domů jsou z GIS vrstvy (vektorizace plánu 1938, místní souřadnice). Půdorysy vil jsou z kótovaných plánů a kotvené na GIS polygony; u 426 GIS kreslí vystupující čelo 20,3 × 2,1 m, které plán nezná. Výšky budov v GIS jsou jen náhodný zástupný údaj: výšky vil jsou z elevací a řezů 1922 a 1925 (projekt, ±0,6 m), skladba z fotografií. Terén je zatím plochý (z = 0 u všech domů); historický výškopis nebyl k dispozici.

## Jak vznikla geometrie

- **Rešerše plánů.** Nejdříve jsme prohledali databázi: ze seznamu 99 příloh (oblasti Pařidelská, Liebknechtova a Tyršova, seznam z 23. 10. 2026) jsme otevřeli 30 dostupných na kontaktních listech, karty jsme četli v plné velikosti a listy použité pro geometrii v plném rozlišení (titulek, datum, měřítko, stavebník, sousedé). 69 příloh archiv 29. 10. 2026 nevydal; plány z let 1874–1897 u domu 426 patří dřívějšímu domu a byly vyřazeny.

- **Identita a orientace domů.** Situační plánky z let 1922 a 1925 (silnice Brüx–Paredl, Liebknechtova, dráha, sportoviště), popisy stanovišť na kartách KSPPOP a GIS určují, že obě vily stojí na jihovýchodní straně silnice u odbočky Liebknechtovy: 426 blíž k městu, 1425 za ní. Štítové průčelí vily 1425 hledí do Pařidelské, vstup s vnějším schodištěm je na nádvorní straně; dvojvila 426 má Vorderansicht do silnice a balkony dozadu k dráze.

- **Fasáda jen z fotografie nebo plánu s domem v rámečku.** Na každém použitém snímku a elevaci je dům v červeném rámečku a každý otvor má ID (G okna přízemí, U okna patra, A podkrovní okna, D dveře, B_ zadní fasáda, L_ a R_ křídla, N_ a S_ boční stěny). Počty otvorů z rámečků kontroluje brána proti plánu modelu; otvory, které pramen neukazuje, jsou přiznané hypotézy.

- **Měřítko.** Výšky a šířky jsou z kótovaných plánů (426: elevace 1922 34,3 px/m a řez c–d; 1425: pohled a řez 1925), u fotografií z roku 1974 poměry (zadní strana 426: 83 px/m). Kde se projekt liší od fotografie, model sleduje fotografii.

- **Střecha.** Členění střech je z plánů krovu a podkroví a z náčrtu KSPPOP 1425/1, sklony z řezů; střecha hotového modelu se změří ze sítě (426: hřeben 17,0 m, sklon 43,6°; 1425: hřeben 11,4 m).

- **Stavba v Blenderu.** Parametrický builder bez okna (`build_house_20261028.py`, týž jako u ulice U Pražské brány) vyrobí z `geometry_plan.json` BLEND a GLB. Otvory jsou skutečné niky, štít rizalitu a zadní štít 426 jsou vikýř a křídlo s vlastní zdí, balkony a schodiště jsou boxy, materiály jsou jen ID pro pozdější textury.

- **Kontrola.** Brána geometrie (prosvítání podkroví paprsky, nekryté zdivo, střecha nad prázdnem, UV, síť, počty otvorů) a vizuální kontrola: pohledy s materiály a bez barev (čtyři strany, čtyři rohy shora, dva podhledy u okapu, shora), detaily otvorů a záznam kontroly. Dům se do ulice umístí až po prošlé bráně a prohlédnuté sadě.

- **Sestava ulice.** Registr `street_layout_gis.json` drží polohu, natočení a revizi každého domu (rámec X = východ, Y = sever); okolní budovy z GIS zastupují v sestavě šedé bloky, domy 421 a 1084 čekají na prameny.

Pracovní složka: F:\MOST\output\paridelska_street_claude_2026-10-29\ (domy, kontroly, registr poloh; prameny jen ke čtení).

## Rozpory a hypotézy

- **1425: kam hledí štít a kde je vstup.** Plán z roku 1925 kreslí průčelí s tympanonem a vstup s vnějším schodištěm na protilehlých stranách. Karty KSPPOP popisují snímek průčelí „z protější strany Pařidelské“ a snímek vstupu jako „nádvorní stranu“: model proto staví štít do ulice (severozápad) a vstup dozadu (jihovýchod). Opačná orientace by znamenala, že fotograf stál na dráze.

- **426: starší plány ve struktuře.** Plány z let 1874, 1878, 1885 a 1897 u domu 426 mají jiný půdorys a jiného stavebníka než projekt dvojvily z roku 1922; patří dřívějšímu domu téhož čísla a nebyly použity.

- **426: půdorys GIS proti plánu.** GIS kreslí uliční čelo 20,3 m vystupující o 2,1 m, plán z roku 1922 kótuje 27,00 × 12,35 m s rizalitem 10,45 m vystupujícím 0,8 m. Model drží plán a je ukotven na zadní (jihovýchodní) hranu GIS polygonu; kanonický GIS zůstává beze změny.

- **426: přední fasáda jen z projektu.** Vorderansicht 1922 a vzdálená fotografie řady dvojvil jsou jediné prameny uliční strany: deset oken v podlaží, čtyři podkrovní okna rizalitu, vikýře a tři komíny jsou projekt, ne zaměření (štítek částečně hypotéza). Zadní strana je z fotografie z roku 1974 (balkony v nárožích, schodišťové okno, vstup se stupněm).

- **Výšky z plánů.** Římsa 426 je 10,0 m a hřeben 17,0 m podle elevace a řezu c–d (elevace kreslí hřeben ještě o něco výš, ±0,6 m); u 1425 římsa 7,1 m, vrchol štítu 9,5 m a hřeben 11,4 m podle pohledu a řezu 1925, fotografie potvrzují skladbu, ne rozměry (±0,3 m).

- **Boční stěny** obou vil mají okna podle půdorysů; žádná fotografie je neukazuje celé (u 1425 je z nároží čitelné jedno okno patra). Zadní přístavky 1425 v GIS polygonu (prádelna, kůlna) a podkrovní okna zadní strany 426 nejsou modelovány; lizény, šambrány, okenice, oválné okénko a kartuše zadního štítu jsou textura.

- **Výpadek archivu 29. 10. 2026.** Přílohy oblasti Pařidelská (48) a struktury 522 (21) nebylo možné načíst; domy 421 a 1084 mají půdorys v GIS a čekají na prameny, 990, 1124 a 1426 nemají půdorys v GIS, u 522 je identita sporná (GIS ji klade pod Jahnovu 730 m odtud, databáze do oblasti Tyršova).

- **Výšky a terén.** Terén je plochý (z = 0 u obou vil), ačkoli silnice k Pařidlům stoupá podél dráhy; historický výškopis nebyl k dispozici.

- **Dvorní a nedoložené strany** jsou bez otvorů, pokud je žádný pramen neukazuje.

Údaje jsou v datech označené jako `model_hypothesis`, `status: provisional`, `locked: false`.

## Kniha nesouladů pramenů

Případy, kdy si prameny odporují (plán proti fotografii, GIS proti plánu, chybně zařazený list, nedostupný archiv), zapisujeme do interní knihy nesouladů pramenů projektu MOST. Ta se zatím nepublikuje, proto zde uvádíme jen identifikátory případů této ulice (3):
- `2026-10-29_paridelska_1425-orientace-stit-k-ulici-vstup-vzadu` – Pařidelská 1425: průčelí s tympanonem hledí do Pařidelské, vstup se schodištěm je vzadu – orientaci rozhodly karty, ne plán oplocení
- `2026-10-29_paridelska_426-stare-plany-1874-1897-jiny-dum` – Pařidelská 426: plány z let 1874–1897 (Wenzels-Vorstadt, Panzner, Wustel, Spitz) patří dřívějšímu domu č. 426, fotografovaná dvojvila je projekt z roku 1922
- `2026-10-29_paridelska_api-vypadek-zdroje-nedostupne` – Pařidelská: 29. 10. 2026 archiv Libuše neodpovídal (TCP timeout), dávka začala z kopií jiných vláken – 421, 1084, 990, 1124, 1426 a 522 zůstaly bez pramenů

## Přehled domů

| Čp. | Úsek | Typ | Štítek | Podlaží | Průčelí × okap (m) | Revize | Přílohy | Stav / textury |
|---|---|---|---|---|---|---|---|---|
| 421 | SZ | dům na severozápadní straně (prameny nedostupné) | – | ? | – | – | – | čeká na prameny (přílohy 29. 10. 2026 nedostupné) |
| 1084 | SZ | dům na severozápadní straně (prameny nedostupné) | – | ? | – | – | – | čeká na prameny (přílohy 29. 10. 2026 nedostupné) |
| 426 | JV | dvojvila Theresia Tiefbau-Gewerkschaft s rizalitem a štítem (1922) | částečně hypotéza | 2 + podkroví | 27,0 × 10,0 | r1 | 16 | bez textur (částečně hypotéza – jen prosté materiály) |
| 1425 | JV | vila Theresia Tiefbau-Gewerkschaft s tympanonem (1925) | – | 2 | 14,0 × 7,1 | r1 | 14 | zatím bez textur |

## Domy jednotlivě

### Čp. 426: dvojvila Theresia Tiefbau-Gewerkschaft s rizalitem a štítem (1922)

> **Upozornění – částečně hypotéza:** Přední (uliční) fasáda je doložena jen stavebním plánem z roku 1922 a vzdálenou fotografií; zadní strana je fotografována. Okna, vikýře a výšky jsou projekt, ne zaměření.

- Dvojvila na parcele 3049 vedle vily 1425, projekt Ernsta Wettsteina z 24. 7. 1922 pro Theresia Tiefbau-Gewerkschaft (situace: silnice Brüx–Paredl, naproti Deutscher Sportplatz, za domem státní dráha). Karty KSPPOP: „zadní strana domu souběžného s Pařidelskou, se strany ul. Liebknechtovy“ a „nárožní dům 426 do Pařidelské, poslední vlevo v řadě dvouvilek“. GIS budova 1570 (27,3 m). Starší plány z let 1874–1897 ve stejné struktuře patří dřívějšímu domu téhož čísla.
- Prameny: plán E. Wettstein 1922 (Vorderansicht, podkroví, řezy a–b, c–d, půdorysy přízemí, patra a sklepa, situace), fotografie 1974 (zadní strana z Liebknechtovy, řada dvojvil) s kartami KSPPOP, GIS půdorys 1570
- Střecha: valbová střecha s hřebenem podél domu, příčná sedlová střecha rizalitu se štítem vpředu i vzadu, vikýře křídel, tři komíny; sklon ~44°
- GIS budova 1570 (popisek 426); geometrie revize r1, 877 polygonů.
- Hypotézy: přední fasáda je doložena jen projektem 1922 a vzdálenou fotografií – realizace oken, vikýřů a štítu neověřena (štítek); výšky z elevace a řezu 1922: přízemí +1,25 m, okna 1,8–3,75 / 5,45–7,4 m, římsa křídel 10,0 m, podkrovní okna rizalitu 10,6–12,2 m, hřeben 17,0 m (±0,6 m); zadní fasáda z fotografie 1974 a půdorysů: balkony v nárožích, schodišťové okno, vstup se stupněm; podkrovní okna vzadu nemodelována; boční okna podle půdorysů bez fotografie; rozpor GIS (čelo 20,3 m vystupující 2,1 m) × plán (rizalit 10,45 m, 0,8 m): model podle plánu, kotveno na GIS

| Příloha | Typ | SHA-256 (12 znaků) |
|---|---|---|
| cp_426,540_001.jpg | plán / výkres | 16a0dafa31a1 |
| cp_426,540_002.jpg | plán / výkres | 72e0d77e7ebb |
| cp_426,540_003.jpg | plán / výkres | 3e4a46a9a4e0 |
| cp_426,540_004.jpg | plán / výkres | 60c626ac7ad7 |
| cp_426,540_005.jpg | plán / výkres | 48a9e7337d98 |
| cp_426,540_006.jpg | plán / výkres | a0e18c94370b |
| cp_426,540_007.jpg | plán / výkres | 0ccebaf29676 |
| cp_426,540_008.jpg | plán / výkres | 6a1bb24d673b |
| cp_426,540_009.jpg | plán / výkres | b7f4df410911 |
| cp_426,540_010.jpg | plán / výkres | 290afd92b1cf |
| cp_426,540_011.jpg | plán / výkres | 0ab9c591a83e |
| cp_426_001.jpg | archivní karta | 2f0ade6cf435 |
| cp_426_001.jpg | fotografie | c66dda9dd381 |
| cp_426_002.jpg | fotografie | 036aac9df7cf |
| cp_426_002.jpg | archivní karta | 0ac8965fd223 |
| cp_426_002_col.png | kolorovaná odvozenina | 30606cd1a985 |

### Čp. 1425: vila Theresia Tiefbau-Gewerkschaft s tympanonem (1925)

- Vila na parcele 3050 v rohu Pařidelské a Liebknechtovy, postavená v letech 1925–26 pro Theresia Tiefbau-Gewerkschaft (plán stavitele Ernsta Wettsteina ze září 1925, plán oplocení 1926 „Umzäunung des neuen Wohnhauses Nr 1425“). Karty KSPPOP popisují stanoviště: z protější strany Pařidelské (vpravo dům 1825, vlevo hradlo starého nádraží), z nároží Pařidelské a Liebknechtovy a nádvorní stranu. GIS budova 2072.
- Prameny: plán E. Wettstein 9/1925 (Ansicht, řez, půdorysy, krov, situace 1:1440), plán oplocení 1926 (1:500), fotografie 1974 (průčelí z ulice, nároží, nádvorní strana) s kartami KSPPOP, náčrt KSPPOP 1425/1, GIS půdorys 2072
- Střecha: valbová střecha s hřebenem rovnoběžným s ulicí, štít rizalitu vbíhá do valby, dva komíny; sklon podle řezu ~40°
- GIS budova 2072 (popisek 1425); geometrie revize r1, 514 polygonů.
- Hypotézy: výšky z plánu 1925 (projekt): okna přízemí 1,45–3,15 m, patra 4,70–6,45 m, římsa 7,1 m, vrchol štítu 9,5 m, hřeben 11,4 m – fotografie potvrzují skladbu, ne rozměry (±0,3 m); boční stěny mají 2 okna na podlaží podle půdorysu; z nároží je čitelné jen 1 okno patra; vnější schodiště k zadnímu vstupu zjednodušeno na 4 stupně a podestu; zadní přístavky (prádelna, kůlna) v GIS polygonu nejsou modelovány; lizény, šambrány a okenice jsou textura

| Příloha | Typ | SHA-256 (12 znaků) |
|---|---|---|
| cp_1425_001.jpg | plán / výkres | d3d68c78360d |
| cp_1425_001.jpg | archivní karta | 5f2a2643bec8 |
| cp_1425_001.jpg | fotografie | 833990fb1881 |
| cp_1425_001.jpg | odvozenina bez tagu (kolorovaná / výřez / FRONT) | a1eab7a9520f |
| cp_1425_001__2.jpg | plán / výkres | f1de0fe27f8b |
| cp_1425_001_col.png | kolorovaná odvozenina | d0bc2249050e |
| cp_1425_002.jpg | archivní karta | 9969d6807b25 |
| cp_1425_002.jpg | fotografie | c9f41a51ac9d |
| cp_1425_002.jpg | plán / výkres | ad132c3ec85d |
| cp_1425_003.jpg | plán / výkres | 78bbfa815962 |
| cp_1425_003.jpg | fotografie | e8f3edde6e02 |
| cp_1425_003.jpg | archivní karta | 17638360d8fd |
| cp_1425_004.jpg | plán / výkres | a3237c10c82b |
| cp_1425_005.jpg | plán / výkres | c01423ab4f23 |
