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

  const vipExtraCharacters = [
    extra('vip_bg2_gorions-ward-bhaalspawn', 'Baldur\'s Gate II: Enhanced Edition', 'Gorion\'s Ward / Bhaalspawn', 'custom player protagonist and child of Bhaal drawn into Amn and the Throne of Bhaal conflict', 'custom protagonist', 'Everyman', 'Hero / Ruler'),
    extra('vip_bg2_aerie', 'Baldur\'s Gate II: Enhanced Edition', 'Aerie', 'avariel cleric/mage companion', 'playable party companion', 'Innocent', 'Caregiver / Sage'),
    extra('vip_bg2_anomen-delryn', 'Baldur\'s Gate II: Enhanced Edition', 'Anomen Delryn', 'fighter/cleric companion seeking knighthood and recognition', 'playable party companion', 'Hero', 'Ruler / Everyman'),
    extra('vip_bg2_cernd', 'Baldur\'s Gate II: Enhanced Edition', 'Cernd', 'shapeshifting druid companion', 'playable party companion', 'Sage', 'Caregiver / Explorer'),
    extra('vip_bg2_edwin-odesseiron', 'Baldur\'s Gate II: Enhanced Edition', 'Edwin Odesseiron', 'Red Wizard companion driven by magical ambition', 'playable party companion', 'Magician', 'Ruler'),
    extra('vip_bg2_haerdalis', 'Baldur\'s Gate II: Enhanced Edition', 'Haer\'Dalis', 'tiefling bard and planar performer companion', 'playable party companion', 'Jester', 'Lover / Explorer'),
    extra('vip_bg2_imoen', 'Baldur\'s Gate II: Enhanced Edition', 'Imoen', 'thief/mage companion and childhood friend of the protagonist', 'playable party companion', 'Jester', 'Innocent / Caregiver'),
    extra('vip_bg2_jaheira', 'Baldur\'s Gate II: Enhanced Edition', 'Jaheira', 'Harper fighter/druid companion and guardian figure', 'playable party companion', 'Caregiver', 'Sage / Ruler'),
    extra('vip_bg2_jan-jansen', 'Baldur\'s Gate II: Enhanced Edition', 'Jan Jansen', 'gnome illusionist/thief companion and comic inventor', 'playable party companion', 'Jester', 'Creator / Sage'),
    extra('vip_bg2_keldorn-firecam', 'Baldur\'s Gate II: Enhanced Edition', 'Keldorn Firecam', 'Inquisitor paladin companion', 'playable party companion', 'Hero', 'Ruler / Sage'),
    extra('vip_bg2_korgan-bloodaxe', 'Baldur\'s Gate II: Enhanced Edition', 'Korgan Bloodaxe', 'dwarven berserker mercenary companion', 'playable party companion', 'Outlaw', 'Hero'),
    extra('vip_bg2_mazzy-fentan', 'Baldur\'s Gate II: Enhanced Edition', 'Mazzy Fentan', 'halfling fighter companion with paladin-like ideals', 'playable party companion', 'Hero', 'Caregiver / Ruler'),
    extra('vip_bg2_minsc', 'Baldur\'s Gate II: Enhanced Edition', 'Minsc', 'Rashemi ranger companion with Boo', 'playable party companion', 'Hero', 'Jester / Caregiver'),
    extra('vip_bg2_nalia-dearnise', 'Baldur\'s Gate II: Enhanced Edition', 'Nalia de\'Arnise', 'noble thief/mage companion concerned with social duty', 'playable party companion', 'Caregiver', 'Ruler / Rebel'),
    extra('vip_bg2_valygar-corthala', 'Baldur\'s Gate II: Enhanced Edition', 'Valygar Corthala', 'ranger companion hunted for his family legacy', 'playable party companion', 'Explorer', 'Hero / Outlaw'),
    extra('vip_bg2_viconia-devir', 'Baldur\'s Gate II: Enhanced Edition', 'Viconia DeVir', 'drow cleric companion and exile', 'playable party companion', 'Outlaw', 'Lover / Sage'),
    extra('vip_bg2_yoshimo', 'Baldur\'s Gate II: Enhanced Edition', 'Yoshimo', 'bounty hunter thief companion with a hidden obligation', 'playable party companion', 'Outlaw', 'Jester / Shadow-load high'),
    extra('vip_bg2_sarevok', 'Baldur\'s Gate II: Throne of Bhaal', 'Sarevok Anchev', 'former antagonist who can join the party in Throne of Bhaal', 'playable party companion', 'Outlaw', 'Hero / Ruler'),
    extra('vip_bg2_dorn-il-khan', 'Baldur\'s Gate II: Enhanced Edition', 'Dorn Il-Khan', 'blackguard companion introduced in the Enhanced Edition', 'playable party companion', 'Outlaw', 'Ruler / Shadow-load high'),
    extra('vip_bg2_hexxat', 'Baldur\'s Gate II: Enhanced Edition', 'Hexxat', 'vampire thief companion introduced in the Enhanced Edition', 'playable party companion', 'Outlaw', 'Lover / Explorer'),
    extra('vip_bg2_neera', 'Baldur\'s Gate II: Enhanced Edition', 'Neera', 'wild mage companion introduced in the Enhanced Edition', 'playable party companion', 'Magician', 'Jester / Rebel'),
    extra('vip_bg2_rasaad-yn-bashir', 'Baldur\'s Gate II: Enhanced Edition', 'Rasaad yn Bashir', 'Sun Soul monk companion introduced in the Enhanced Edition', 'playable party companion', 'Sage', 'Hero / Innocent'),
    extra('vip_bg2_wilson', 'Baldur\'s Gate II: Enhanced Edition', 'Wilson', 'bear companion introduced in the Enhanced Edition', 'playable party companion', 'Innocent', 'Hero / Jester'),
    extra('vip_silksong_hornet', 'Hollow Knight: Silksong', 'Hornet', 'princess-protector of Hallownest and playable protagonist travelling through Pharloom', 'fixed protagonist', 'Hero', 'Explorer / Caregiver'),
    extra('vip_bg3_tav-custom-origin', 'Baldur\'s Gate 3', 'Tav / Custom Origin', 'custom player-created protagonist drawn into the mind flayer parasite crisis', 'custom protagonist', 'Everyman', 'Hero / Explorer'),
    extra('vip_bg3_dark-urge', 'Baldur\'s Gate 3', 'The Dark Urge', 'customizable origin protagonist haunted by murderous impulses and a hidden legacy', 'custom origin protagonist', 'Outlaw', 'Hero / Shadow-load high'),
    extra('vip_bg3_astarion', 'Baldur\'s Gate 3', 'Astarion', 'vampire spawn rogue origin character and companion', 'origin character / playable party companion', 'Outlaw', 'Lover / Everyman'),
    extra('vip_bg3_gale', 'Baldur\'s Gate 3', 'Gale', 'wizard origin character and companion carrying a dangerous magical condition', 'origin character / playable party companion', 'Magician', 'Sage / Lover'),
    extra('vip_bg3_karlach', 'Baldur\'s Gate 3', 'Karlach', 'tiefling barbarian origin character and companion with an infernal engine', 'origin character / playable party companion', 'Hero', 'Lover / Rebel'),
    extra('vip_bg3_lae-zel', 'Baldur\'s Gate 3', 'Lae\'zel', 'githyanki fighter origin character and companion shaped by martial duty', 'origin character / playable party companion', 'Hero', 'Ruler / Rebel'),
    extra('vip_bg3_shadowheart', 'Baldur\'s Gate 3', 'Shadowheart', 'cleric origin character and companion with concealed memories and religious conflict', 'origin character / playable party companion', 'Sage', 'Innocent / Caregiver'),
    extra('vip_bg3_wyll', 'Baldur\'s Gate 3', 'Wyll', 'warlock origin character and companion known as the Blade of Frontiers', 'origin character / playable party companion', 'Hero', 'Caregiver / Magician'),
    extra('vip_bg3_halsin', 'Baldur\'s Gate 3', 'Halsin', 'druid companion and protector of the Emerald Grove', 'playable party companion', 'Caregiver', 'Sage / Explorer'),
    extra('vip_bg3_minthara', 'Baldur\'s Gate 3', 'Minthara', 'drow paladin companion associated with ruthless command and survival', 'playable party companion', 'Ruler', 'Outlaw / Hero'),
    extra('vip_bg3_jaheira', 'Baldur\'s Gate 3', 'Jaheira', 'veteran Harper druid/fighter companion returning in Baldur\'s Gate 3', 'playable party companion', 'Caregiver', 'Sage / Ruler'),
    extra('vip_bg3_minsc', 'Baldur\'s Gate 3', 'Minsc', 'Rashemi ranger companion returning with Boo in Baldur\'s Gate 3', 'playable party companion', 'Hero', 'Jester / Caregiver')
  ];

  function extra(id, game, character, role, type, primary, secondary) {
    return {
      id,
      appid: '',
      original_release_year: '',
      game,
      gameTitle: game,
      title: game,
      character,
      name: character,
      protagonist_name: character,
      display_game: game,
      display_character: character,
      display_label: game + ' — ' + character,
      description: game + ' — ' + character,
      validation_prompt: 'Game: ' + game + '\nCharacter/role: ' + character,
      protagonist_role: role,
      protagonist_type: type,
      source_type: 'VIP manual addition',
      source_note: 'VIP-only extra validation item appended after the standard runtime ordering.',
      validation_status: 'not_validated',
      known_status: 'named_protagonist',
      internal_suggested_primary_archetype: primary,
      internal_suggested_secondary_archetype: secondary,
      internal_suggested_archetype_confidence_0_1: '0.65',
      bucket: 'vip_extra_manual',
      batch: 'vip_bg2_bg3_silksong_append',
      prompt: game + ' — ' + character,
      include_main_clean: true,
      game_included_for_display: true,
      needs_split_or_research: false,
      vip_extra: true
    };
  }

  function identity(item) {
    return String((item && (item.id || item.characterId)) || '').toLowerCase() + '|' +
      String((item && (item.character || item.name || item.protagonist_name)) || '').toLowerCase() + '|' +
      String((item && (item.game || item.gameTitle || item.title)) || '').toLowerCase();
  }

  function appendVipExtras(list) {
    if (!Array.isArray(list)) return list;
    const out = list.slice();
    const seen = new Set(out.map(identity));
    vipExtraCharacters.forEach((item) => {
      if (!seen.has(identity(item))) out.push(Object.assign({}, item));
    });
    out.forEach((item, index) => {
      if (item && typeof item === 'object') item.order = index + 1;
    });
    return out;
  }

  Object.defineProperty(window, 'prepareArchetypeCharactersForValidation', {
    configurable: true,
    set(fn) {
      const wrapped = function(data) {
        return appendVipExtras(typeof fn === 'function' ? fn(data) : data);
      };
      Object.defineProperty(window, 'prepareArchetypeCharactersForValidation', {
        configurable: true,
        writable: true,
        value: wrapped
      });
    },
    get() {
      return undefined;
    }
  });

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
