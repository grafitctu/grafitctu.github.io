# Games

Dvojjazyčná galerie studentských her a interaktivních projektů GRAFITU.

## Trasy

- `/games/` — česká verze
- `/games/en/` — anglická verze
- `/games.html` — kompatibilní přesměrování na českou verzi včetně parametrů a kotvy

## Sdílené soubory

- `games.css` — vzhled stránky, galerie a celoobrazovkové prezentace
- `games.js` — vykreslení galerie, filtry, sestavení a ovládání prezentace
- `catalog-extensions.js` — opravy ročníků, deduplikace a 34 doplněných her ze sedmi oficiálních GameJamů FIT
- `cover-overrides.js` — oficiální titulní obrázky her z GameJamů FIT podle Itch.io
- `presentation-data.js` — dvojjazyčné kapitoly o oboru, výuce, komunitě a výzkumu
- `../assets/games/games-data-20260624-*.js` — původní katalog 44 projektů; datové soubory zůstávají beze změny

Po načtení rozšíření obsahuje galerie 77 unikátních projektů. Zdrojem gamejamových položek jsou oficiální seznamy ročníků 2022.1, 2022.2, Velikonoce 2023, Velikonoce 2024, Vánoce 2024, Velikonoce 2025 a Velikonoce 2026 odkazované z `https://gamejam.pages.fit/`. Hra ZATRACENÝ MAJÁK nemá na Itch.io titulní obrázek, proto používá výchozí grafický zástupný motiv GRAFITU.

## Zdroje gamejamových položek

- `https://itch.io/jam/gamejam-fit-2026/entries`
- `https://itch.io/jam/gamejam-fit-2025a/entries`
- `https://itch.io/jam/gamejam-fit-2024-vanocni/entries`
- `https://itch.io/jam/gamejam-fit-2024/entries`
- `https://itch.io/jam/easter-gamejam-fit/entries`
- `https://itch.io/jam/gamejam-fit-2022-2/entries`
- `https://itch.io/jam/gamejam-fit-2022/entries`

## Prezentační režim

Prezentace kombinuje 26 her označených v katalogu příznakem `present=1` se 14 kapitolami o širším kontextu oboru. Celkem má 40 karet. Kapitoly nejsou součástí filtrovatelné galerie her a v prezentaci jsou výslovně označené jako kapitoly programu VCGD.

Spuštění odkazem: `?present=1`. Konkrétní karta: `?present=1&slide=12`. Pro lokální náhled funguje také kotva `#presentation`. Jazykový přepínač zachovává číslo právě zobrazené karty.

Ovládání: šipky nebo Page Up/Down, mezerník pro pauzu, Home/End pro začátek a konec, Escape pro ukončení. Na dotykových zařízeních funguje vodorovné přejetí.

Předchozí jednosouborová verze je uložená v `archive/games-legacy-2026-07-15.html`.
