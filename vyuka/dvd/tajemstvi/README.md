# DVD: Tajemství ve hře

Samostatná webová přednáška v češtině: **72 snímků**, rozšířený výklad přibližně na **120–150 minut**
a podklady pro navazující **45minutové cvičení**.

Otevřete `index.html` v aktuálním Chrome, Edge nebo Firefoxu. Prezentace funguje
přímo z disku, bez internetu, instalace, externích knihoven a externích fontů.
Při přenášení zachovejte celý adresář včetně složky `assets`.

## Obsah a orientační čas

| Snímky | Téma | Čas |
|---|---|---|
| 1–7 | Tajemství, časové linky, Schellův diagram a výpovědi | 13 min |
| 8–25 | Digitální hry, proximity chat, viditelnost a další příklady | 33 min |
| 26–29 | Přehled používaných mechanik | 12 min |
| 30–35 | Multiplayer, časové režimy, asynchronnost a asymetrie | 15 min |
| 36–42 | Publikum, Twitch API, EventSub a Cult of the Lamb | 17 min |
| 43–46 | Secret Hitler, soukromá volba a náhoda | 12 min |
| 47–51 | Krvavá hodina odbila, chybná informace, smrt a vypravěč | 13 min |
| 52–55 | Scotland Yard a demonstrace skrytého pohybu | 12 min |
| 56–61 | Parametry návrhu, spolupráce, reputace a přenos na stůl | 14 min |
| 62–67 | Zadání, audit a pracovní podklady ke cvičení | 45 min zvlášť |
| 68–72 | Závěrečná otázka a odkazy | při zakončení |

Snímek 39 ukazuje ilustrační HTTP požadavek Create Poll a návaznost na
EventSub `channel.poll.end`, s prázdnými zástupnými údaji.

## Časové linky za úvodní situací

Snímek 03 obsahuje vlastní SVG schéma čtyř hráčů s pěti událostmi.
Poznámky vysvětlují, co lze vyloučit a proč mezera v pozorování není důkaz
viny. Diagram neodvozuje nepozorované trasy ani okamžik zmizení paliva.
Čísla uvedená v předchozích revizích patří příslušným starším verzím.

## Revize podle připomínek z 5. 10. 2026

Přibyla nejistota o zdrojích, omezený výhled a cíl vytvářet setkání a výpovědi.
Snímky 6 a 7 oddělují vlastnictví informace od pozorování, tvrzení a hypotézy.
Feign uvádí Police, Serial Killer a Tracker se zjednodušeným popisem.
Tracker používá barvu a stopy. Police blokuje odchod cíle, nikoli všechny návštěvy.
Vysvětlení nespolehlivých rolí požaduje nezávislé ověření a rozlišuje nejistotu
vlastní schopnosti od klamání ostatních hráčů.

Mezi dalšími příklady jsou Dale & Dawson, Dawson Oaks Trailer Park a MIMESIS.
Veřejný katalog Social Deduction (Steam tag 745697, filtr hry) vrátil 422 položek.
Po přidání pěti probíraných aplikací mimo katalog bylo dotázáno 427 aplikací.
U 233 byl počet dostupný, 194 dotazů skončilo HTTP 404. Tyto aplikace mají
**nedostupný počet**, nikoli nulu. Dva nové příklady byly vybrány podle nejvyšších
dostupných počtů při vyloučení již probíraných her a výslovně požadovaného Dale & Dawson.
Odpovědi a metoda jsou v `steam-activity-snapshot.json`. Počty se automaticky neobnovují.
MIMESIS používá napodobující příšery a nepředpokládá zrádce mezi lidskými hráči.

Cult of the Lamb ukazuje účast publika a Help or Hinder. Historický popis z roku
2023 doplňuje patch z února 2026. Snímek je návrhový příklad, nikoli návod na
aktuální konfiguraci extension. Ukázkový endpoint předchozích snímků nepovažujeme
za popis vnitřního řešení této hry. Twitch Drops jsou jiný mechanismus.

Síť na snímku 54 je vlastní SVG. Používá stejných šest stanic a devět spojů jako
interaktivní demonstrace. Barvu doplňují plné a přerušované čáry.
Antihero a Komunikační pravidla jsou uložené v `hidden-slides.json` a nepromítají se.
Podstatné volby komunikace zůstávají v přehledu mechanik a kontrolních otázkách.

## Výsledek auditu cvičení

Původní mapa role–akce–výsledek–zdroj neúspěchu byla vhodná pro sabotáž výpravy.
Nepokrývala výslovně skrytý pohyb, umístění zdrojů, soukromé karty ani chybnou
zprávu. Rozšířená mapa (63), kontrolní otázky (64) a přehled pokrytí (65)
zachycují informační jádro většiny diskutovaných her. Nejsou úplnými pravidly
a neověřují vyváženost ani všechny interakce schopností.

Týmy navrhují jednu základní mechaniku tajemství a její smysluplné použití.
Nepotřebné řádky mapy lze označit N/A. Při testu sledují, zda stopa změnila volbu,
proč se vyplatí spolupracovat s podezřelými a zda se schopnost použila
v očekávaném počtu příležitostí. Další test zaznamená vliv reputace z minulé partie.
