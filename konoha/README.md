# Konoha / Trénink v12 — stínový klon

Publikovaný runtime je přímo v této složce, bez bundleru, serveru či povinné databáze.
Otevři `index.html`, nebo servíruj celou složku `konoha` libovolným statickým hostingem.
Zdroj navazuje na okomentovaný AI handoff v10.1. Původní verze jsou zachované.

## Změny a rozhraní

- **v12 / `ghost.js`:** klon nejrychlejšího zaznamenaného dokončeného běhu. Pohyb,
  chodidla a vrstvy animace se vzorkují nejvýše 30× za sekundu. Přehrávání interpoluje
  pozice i pózy; respawn je explicitní střih. Používá stejný `resultTime` jako medaile:
  při penalizaci referenčního běhu drží starou pózu 5 s, potom přejde na checkpoint;
  penalizace současného běhu posune referenční přehrávání dopředu. Pauza zastaví oba.
- Znaménko tempa porovnává první dosažení stejné maximální X souřadnice. Zastavení
  i návrat zpět tedy zvyšují ztrátu; různé větve se porovnávají podle postupu tratí.
  V cíli se použije přesný rozdíl výsledných časů. Klon nemá žádné kolize ani odměny.
- Soupeř (`shadow.reference`) zůstává stejný celý pokus. Rychlejší vítězství mění
  `shadow.best` teprve pro další start; smrt, pomalejší pokus ani restart rekord nemažou.
- Klíč `konoha-shadow-clone-v1` obsahuje formát 1, rules/map, čas a kompaktní pole vzorků.
  Ukládá se jen nejlepší dokončený záznam, nikoli každý snímek zvlášť. Kontrolujeme
  velikost, časy, souřadnice, indexy atlasu, váhy i kompatibilitu. Při plné či zakázané
  localStorage zůstane nový klon v paměti do zavření stránky; HUD to oznámí.
  Dlouhé běhy se postupně převzorkují, s ochranou okolí respawnů, místo useknutí konce.
- Záznam staršího rekordu nelze rekonstruovat. Původní osobní čas zůstává zachovaný,
  klon vznikne z prvního nově dokončeného běhu a nese vlastní viditelný referenční čas.
  Fyzika/mapa v12 se nemění, proto `rulesVersion` zůstává `konoha-v11` a původní rekordy
  jsou kompatibilní. Vypnutí zaškrtávátka skrývá klona a jeho značku, nikoli nahrávání.

Předchozí změny v11:

- `engine.js`: `trick()` už jen eviduje vstupy a emituje animační události.
  `award(id, base, kind, flow)` je jediná cesta pro jednorázové bonusy.
  `awarded` přetrvá checkpointový respawn; resetuje se až novým pokusem.
  Postup dává 10 bodů / 100 nových pixelů; orby 100; překážky 150; mezery 200;
  svitek 500; cíl 500 za život. Rozmanitost úspěchů během 4 s omezuje FLOW na 3×.
  Jeden střelecký bonus na 300px sektor (near 50 / deflect 150) brání čekání na místě.
- Obě větve jsou ve druhé zóně, x=2070–2530. Spodní trám x=2215–2405,
  horní plošiny a odrazová stěna, svitek (2460,112), následné spojení do stejné tratě.
- Střely mají `windup=.65`: před vypuštěním stojí a nejsou nebezpečné.
  Vykreslení výstrahy je podle aktuální polohy střely, výšky a okraje obrazovky.
- `game.js`: rychlostní lookahead, svislá mrtvá zóna, pojistky okrajů a reset při zásahu.
  Kamera nesmí ovlivnit fyziku. `shotIndicator()` je čistý výpočet prezentace.
- `resultTime = time + penalty`: aktivní SIMULAČNÍ čas + 5 sekund za zásah.
  Pauza a kosmetický hitstop se nepočítají. Medaile až ve stavu `won`:
  zlato <=70, stříbro <=100, bronz <=150; nad limit dokončení bez časové medaile.
  Limity jsou počáteční návrh; automatický průchod není náhradou testu obtížnosti lidmi.
- Lokální záznam `konoha-records-v11`: `{score, time}`. Nejlepší čas jen z úspěšných
  dokončení. Staré farmitelné skóre není importováno. Chyba localStorage nezastaví hru.
- Tutorial šesti krátkých kroků mimo Canvas; dokončení/přeskočení se pamatuje.
  Tlačítko „Nový pokus s tutorialem“ začíná od začátku. Vstupní pravidla jsou zachovaná:
  zem/wall na puštění, dvojskok na stisk; coyote, buffer, setrvačnost a animace beze změn.

## Budoucí databáze

Zachované komentáře `AI_HANDOFF_SCORE_START/END` označují integrační místo v game.js.
Odesílat neměnný snapshot jednou z události won/dead, nikdy z každého renderu či overlaye.
Přidej `rulesVersion='konoha-v11'`, `mapVersion='rooftops-branch-v1'`, score, time,
penalty, resultTime, medal, hp, scroll.taken, stats a unikátní runId.
Časy a skóre této verze neporovnávat s v10. Statický klient výsledky negarantuje proti
ruční manipulaci; soutěžní server musí vstupy/výsledky ověřovat. Žádný tajný klíč do JS.

## Ověření

`node konoha/tests/test-shadow-clone.cjs` kontroluje výběr nejlepšího dokončeného běhu,
změnu reference až při dalším startu, reload, kvótu/chyby storage, neplatný formát/mapu,
interpolaci, střihy při respawnu, penalizace, pauzu, first-passage tempo, dlouhé záznamy,
skutečné UI volání start/render/end a nezměněný výsledek celého běhu při nahrávání.
Testovací reálný průchod 48.7167 s má 1300 vzorků a přibližně 69 kB JSON.

`node konoha/tests/test-training-v11.cjs` testuje farmení, opakovaný průchod překážkou/respawn,
obě fyzické větve včetně svitku, limity medailí, penalizaci a pauzu, windup,
kameru ve třech viewports, tutorial a lokální rekordy. `node konoha/tests/test-course-v4.cjs` projde celou
trať s/bez střel. Ostatních 11 regresních testů kontroluje vstupy, fyziku a animace.
`render-v11.cjs` používá skutečný renderer s nativním Canvasem; jeho PNG nejsou
browser screenshots. Vyžaduje @napi-rs/canvas; zde načítá lokální bundled runtime.

Ostatní regresní testy a nativní render QA jsou v pracovním balíku `E:/WebGames/konoha-v11`.
