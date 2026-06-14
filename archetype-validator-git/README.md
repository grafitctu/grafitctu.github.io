# Archetype Validator

Statický web pro validaci archetypů herních postav. Uživatel u každé postavy vybere primární, sekundární a případně třetí archetyp. Výsledek se ukládá do Google Sheets přes Google Apps Script; zároveň může zůstat záložní lokální kopie v prohlížeči.

## Struktura

- `index.html` – stránka validátoru
- `styles.css` – responzivní desktop/iPhone vzhled
- `app.js` – výběr archetypů, pořadí 1/2/3, přepínání postav, ukládání
- `characters.json` – seznam postav ke klasifikaci
- `config.js` – nastavení endpointu Google Sheets
- `google-apps-script.js` – skript pro Google Apps Script

## Nasazení na GitHub Pages

1. Vytvoř repozitář, například `archetype-validator`.
2. Nahraj do něj obsah této složky.
3. V GitHubu otevři **Settings → Pages**.
4. Nastav deploy z větve `main`, složka `/root`.
5. Počkej na publikování stránky.

## Přidání postav

Uprav `characters.json`:

```json
[
  {
    "id": "arthur_morgan",
    "name": "Arthur Morgan",
    "gameTitle": "Red Dead Redemption 2"
  }
]
```

`id` nech bez diakritiky a mezer. Slouží jako stabilní identifikátor v datech.

## Napojení na Google Sheets

1. Vytvoř nový Google Sheet.
2. Otevři **Extensions → Apps Script**.
3. Do `Code.gs` vlož obsah souboru `google-apps-script.js`.
4. Ulož projekt.
5. Dej **Deploy → New deployment → Web app**.
6. Nastav:
   - **Execute as:** `Me`
   - **Who has access:** `Anyone`
7. Autorizuj skript.
8. Zkopíruj URL web appky končící `/exec`.
9. V `config.js` nastav:

```js
window.ARCHETYPE_CONFIG = {
  GOOGLE_SHEETS_WEB_APP_URL: 'https://script.google.com/macros/s/TVUJ_KOD/exec',
  KEEP_LOCAL_BACKUP: true,
  MAX_SELECTIONS: 3
};
```

## Ukládané sloupce

Google Sheet vytvoří list `responses` a ukládá:

- `receivedAt`
- `timestamp`
- `participantId`
- `characterIndex`
- `characterId`
- `characterName`
- `gameTitle`
- `primaryArchetype`
- `secondaryArchetype`
- `tertiaryArchetype`
- `selectedArchetypeNames`
- `selectedArchetypesJson`
- `skipped`
- `userAgent`

## Poznámky k testování

Lokální náhled HTML v iOS/ChatGPT aplikaci může blokovat JavaScript. Na GitHub Pages nebo jiném normálním hostingu JavaScript funguje standardně.

Když Google endpoint není nastavený nebo selže, web drží lokální kopii v `localStorage`. Tu lze stáhnout tlačítkem **Export lokálních dat**.
