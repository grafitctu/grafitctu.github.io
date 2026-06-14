window.ARCHETYPE_CONFIG = {
  // Sem vlož URL z Google Apps Script deploymentu končící /exec.
  // Když zůstane prázdné, web bude ukládat jen lokálně do prohlížeče.
  GOOGLE_SHEETS_WEB_APP_URL: 'https://script.google.com/macros/s/AKfycbzDCTDaYozWqU6Gn1GqUJSyY3tEpehhtwCn9KS7MzPnlDDD8Jx1Rak5Di8ZfP5x9KPNMQ/exec',

  // true = současně ukládat záložní kopii do localStorage
  KEEP_LOCAL_BACKUP: true,

  // max. počet archetypů na jednu postavu: primární, sekundární, třetí
  MAX_SELECTIONS: 3
};
