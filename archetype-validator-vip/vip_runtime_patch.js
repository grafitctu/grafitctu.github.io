(() => {
  'use strict';

  const cfg = window.ARCHETYPE_CONFIG || {};
  const sheetName = String(cfg.RESPONSE_SHEET_NAME || 'responses_vip');
  const variant = String(cfg.VALIDATOR_VARIANT || 'vip');
  const originalCharactersUrl = '../archetype-validator-git/characters.json';

  const localStorageMap = {
    archetype_current_index: 'vip_archetype_current_index',
    archetype_participant_id: 'vip_archetype_participant_id',
    archetype_responses_jsonl: 'vip_archetype_responses_jsonl'
  };

  const storageProto = Storage.prototype;
  const originalGetItem = storageProto.getItem;
  const originalSetItem = storageProto.setItem;
  const originalRemoveItem = storageProto.removeItem;

  function mapKey(key) {
    return localStorageMap[key] || key;
  }

  storageProto.getItem = function patchedGetItem(key) {
    if (this === window.localStorage) return originalGetItem.call(this, mapKey(key));
    return originalGetItem.call(this, key);
  };

  storageProto.setItem = function patchedSetItem(key, value) {
    if (this === window.localStorage) return originalSetItem.call(this, mapKey(key), value);
    return originalSetItem.call(this, key, value);
  };

  storageProto.removeItem = function patchedRemoveItem(key) {
    if (this === window.localStorage) return originalRemoveItem.call(this, mapKey(key));
    return originalRemoveItem.call(this, key);
  };

  const originalFetch = window.fetch.bind(window);

  window.fetch = function vipFetch(input, init) {
    const url = typeof input === 'string' ? input : String(input && input.url || '');
    const normalized = url.split('?')[0].replace(/^\.\//, '');

    if (normalized === 'characters.json' || normalized.endsWith('/characters.json')) {
      return originalFetch(originalCharactersUrl, init);
    }

    const method = String((init && init.method) || '').toUpperCase();
    const endpoint = String(cfg.GOOGLE_SHEETS_WEB_APP_URL || '');
    const isSubmit = method === 'POST' && endpoint && url.indexOf(endpoint) === 0;

    if (isSubmit && init && typeof init.body === 'string') {
      try {
        const payload = JSON.parse(init.body || '{}');
        payload.sheetName = sheetName;
        payload.validatorVariant = variant;
        payload.vip = true;
        init = Object.assign({}, init, { body: JSON.stringify(payload) });
      } catch (error) {
        // Keep original request if the body is not JSON.
      }
    }

    return originalFetch(input, init);
  };
})();
