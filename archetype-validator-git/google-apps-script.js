/**
 * Google Apps Script endpoint for Archetype Validator.
 *
 * Setup:
 * 1. Create/open a Google Sheet.
 * 2. Extensions → Apps Script.
 * 3. Paste this file into Code.gs.
 * 4. Deploy → New deployment → Web app.
 * 5. Execute as: Me. Who has access: Anyone.
 * 6. Copy the /exec URL to config.js as GOOGLE_SHEETS_WEB_APP_URL.
 */

const SHEET_NAME = 'responses';

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = getOrCreateSheet_(ss, SHEET_NAME);
    ensureHeader_(sheet);

    const payload = JSON.parse(e.postData && e.postData.contents ? e.postData.contents : '{}');

    sheet.appendRow([
      new Date(),
      payload.timestamp || '',
      payload.participantId || '',
      payload.characterIndex ?? '',
      payload.characterId || '',
      payload.characterName || '',
      payload.gameTitle || '',
      payload.primaryArchetype || '',
      payload.secondaryArchetype || '',
      payload.tertiaryArchetype || '',
      Array.isArray(payload.selectedArchetypeNames) ? payload.selectedArchetypeNames.join(', ') : '',
      JSON.stringify(payload.selectedArchetypes || []),
      payload.skipped === true,
      payload.userAgent || ''
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return ContentService
    .createTextOutput('Archetype Validator endpoint is running.')
    .setMimeType(ContentService.MimeType.TEXT);
}

function getOrCreateSheet_(ss, name) {
  return ss.getSheetByName(name) || ss.insertSheet(name);
}

function ensureHeader_(sheet) {
  const header = [
    'receivedAt',
    'timestamp',
    'participantId',
    'characterIndex',
    'characterId',
    'characterName',
    'gameTitle',
    'primaryArchetype',
    'secondaryArchetype',
    'tertiaryArchetype',
    'selectedArchetypeNames',
    'selectedArchetypesJson',
    'skipped',
    'userAgent'
  ];

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(header);
    sheet.setFrozenRows(1);
    return;
  }

  const current = sheet.getRange(1, 1, 1, header.length).getValues()[0];
  const isEmpty = current.every(value => value === '');
  if (isEmpty) {
    sheet.getRange(1, 1, 1, header.length).setValues([header]);
    sheet.setFrozenRows(1);
  }
}
