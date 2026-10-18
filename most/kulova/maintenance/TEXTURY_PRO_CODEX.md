# Kulová – jak doplnit texturovaný dům (pro Codex)

Stránka `/most/kulova/` ukazuje geometrii všech 15 domů bez textur. Texturované domy se doplňují **po jednom** a bez zásahu
do generátoru stránek: stačí přidat jeden GLB a upravit jeden záznam v JSON.

## 1. Model
- Vycházej z geometrické revize uvedené u domu v `data/textures.json` (`geometry_revision`, geometrie je i v `geometry_glb`).
  Pracovní BLEND revizí jsou ve složkách `kulova_geo_qa_claude_2026-10-18` (261 r5, 111 r6, 258 r4, 1608 r6),
  `kulova_geo_qa_claude_2026-10-17` (262 r6) a `kulova_5houses_claude_G_2026-10-16` (ostatní).
- Zachovej místní souřadnice domu (průčelí v rovině y = 0 v Blenderu, osa x podél průčelí) a jména objektů `CP_<čp>_*`.
  Neposouvej ani neotáčej celý dům: v ulici se texturovaný model vkládá pod uzel `CP_<čp>_root` sestavy.
- Export glTF binární (`.glb`), výchozí osa Y nahoru, textury vložené. Rozumná velikost: do 8 MB na dům,
  textury nejvýš 2048 px (JPEG nebo WebP).

## 2. Soubor
- Ulož jako `most/kulova/models/textured/cp<čp>.glb`.

## 3. Záznam v `most/kulova/data/textures.json`
```json
"262": {"status": "published", "label": "Codex: textury na revizi r6, QA ...", "glb": "models/textured/cp262.glb",
        "geometry_revision": "r6", "geometry_glb": "models/cp262.glb", "updated": "RRRR-MM-DD", "by": "Codex", "qa": "odkaz nebo popis kontroly"}
```
- `glb` je cesta relativní k `/most/kulova/`. Dokud je `glb` `null`, prohlížeč textury nenabízí.
- `label` se zobrazuje v informačním panelu ulice. Tabulky na stránkách se přegenerují při příští aktualizaci stránky.

## 4. Kontrola
- Stránka domu `/most/kulova/cp<čp>/`: v nabídce *Povrch* je *Textury (Codex)* a texturovaný dům překryje geometrii.
- Stránka ulice `/most/kulova/`: volba *Textury (Codex)* vloží dům na jeho místo v ulici; ostatní domy zůstanou geometrické.
- Pokud se texturovaný dům v ulici posune nebo pootočí, nesouhlasí místní souřadnice s geometrickou revizí (bod 1).
- Do souborů nepatří adresa API databáze, UUID ani uživatelská ID.

Generátor stránky (Claude): `F:\MOST\output\grafit_kulova_street_publish_20261018\gen\`. Soubor `data/textures.json`
generátor jen čte; po prvním vytvoření ho nepřepisuje.
