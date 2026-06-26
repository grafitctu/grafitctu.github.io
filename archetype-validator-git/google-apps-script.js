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

const DEFAULT_SHEET_NAME = 'responses';
const ALLOWED_SHEET_NAMES = ['responses', 'responses_vip'];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const payload = JSON.parse(e.postData && e.postData.contents ? e.postData.contents : '{}');
    const sheetName = getSheetName_(payload);
    const sheet = getOrCreateSheet_(ss, sheetName);
    ensureHeader_(sheet);

    sheet.appendRow([
      new Date(),
      payload.timestamp || '',
      payload.participantId || '',
      payload.validatorVariant || '',
      payload.sheetName || '',
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
      payload.vip === true,
      payload.userAgent || ''
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true, sheetName: sheetName }))
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

function getSheetName_(payload) {
  const requested = String(payload.sheetName || '').trim();
  if (ALLOWED_SHEET_NAMES.indexOf(requested) >= 0) return requested;
  return DEFAULT_SHEET_NAME;
}

function getOrCreateSheet_(ss, name) {
  return ss.getSheetByName(name) || ss.insertSheet(name);
}

function ensureHeader_(sheet) {
  const header = [
    'receivedAt',
    'timestamp',
    'participantId',
    'validatorVariant',
    'requestedSheetName',
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
    'vip',
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
