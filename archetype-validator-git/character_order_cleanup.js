(() => {
  'use strict';

  const FRONT = [
    'mario', 'kratos_modern', 'joel_miller', 'lara_croft', 'geralt_of_rivia',
    'harrier_harry_du_bois', 'link', 'gordon_freeman', 'chell', 'master_chief',
    'doom_slayer', 'samus_aran', 'solid_snake', 'cloud_strife', 'batman',
    'kratos_old', 'senua', 'jesse_faden', 'adam_jensen', 'carl_cj_johnson',
    'niko_bellic', 'leon_s_kennedy', 'jill_valentine_chris_redfield',
    'ethan_winters', 'max_payne', 'sonic_the_hedgehog', 'dante',
    'kazuma_kiryu', 'ichiban_kasuga', 'booker_dewitt'
  ];

  const PREFERRED = {
    mario: ['igdbpre90_1985_super-mario-bros_mario'],
    lara_croft: ['steam__lara-croft', 'igdb90_1996_tomb-raider_lara-croft', 'steam_391220_lara-croft'],
    link: ['igdb90_1998_the-legend-of-zelda-ocarina-of-time_link'],
    chell: ['steam__chell_2', 'steam__chell'],
    gordon_freeman: ['steam__gordon-freeman'],
    batman: ['steam_35140_bruce_wayne_batman'],
    samus_aran: ['igdb90_1994_super-metroid_samus-aran'],
    solid_snake: ['igdb90_1998_metal-gear-solid_solid-snake'],
    doom_slayer: ['steam_379720_doom-slayer', 'igdb90_1993_doom_doomguy'],
    adam_jensen: ['steam_238010_adam_jensen'],
    kazuma_kiryu: ['steam_638970_kazuma_kiryu'],
    mega_man: ['igdbpre90_1987_mega-man_mega-man'],
    talion: ['steam_241930_talion'],
    the_prince: ['igdb90_2003_prince-of-persia-the-sands-of-time_the-prince'],
    artyom: ['steam__artyom'],
    amicia_de_rune: ['steam_752590_amicia_de_rune']
  };

  function norm(value) {
    return String(value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[™®“”"']/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ' ')
      .trim()
      .replace(/\s+/g, ' ');
  }

  function keyText(value) { return norm(value).replace(/ /g, '_'); }
  function character(item) { return item && (item.character || item.protagonist_name || item.display_character || item.name || ''); }
  function game(item) { return item && (item.game || item.display_game || item.game_name || item.title || ''); }

  function key(item) {
    const c = norm(character(item));
    const g = norm(game(item));
    const appid = String(item && item.appid || '').split('.')[0];

    if (c.includes('kratos')) return (c.includes('norse') || g.includes('2018') || appid === '1593500') ? 'kratos_modern' : 'kratos_old';
    if (c.includes('lara croft')) return 'lara_croft';
    if (c === 'link') return 'link';
    if (c === 'mario' || c === 'jumpman mario') return 'mario';
    if (c.includes('bruce wayne') || c === 'batman') return 'batman';
    if (c === 'chell') return 'chell';
    if (c === 'gordon freeman') return 'gordon_freeman';
    if (c === 'doomguy' || c === 'doom slayer') return 'doom_slayer';
    if (c === 'samus aran') return 'samus_aran';
    if (c === 'solid snake') return 'solid_snake';
    if (c === 'mega man') return 'mega_man';
    if (c === 'kazuma kiryu') return 'kazuma_kiryu';
    if (c === 'adam jensen') return 'adam_jensen';
    if (c === 'talion') return 'talion';
    if (c === 'the prince') return 'the_prince';
    if (c === 'the painter') return 'the_painter';
    if (c === 'blake langermann') return 'blake_langermann';
    if (c === 'artyom') return 'artyom';
    if (c === 'amicia de rune') return 'amicia_de_rune';
    if (c === 'adventurer') return 'adventurer_generic';
    return keyText(c);
  }

  function addMissing(items) {
    const out = items.slice();
    if (!out.some((item) => norm(character(item)).includes('joel'))) {
      out.push({
        id: 'manual_2013_the-last-of-us_joel-miller',
        game: 'The Last of Us Part I',
        gameTitle: 'The Last of Us Part I',
        character: 'Joel Miller',
        name: 'Joel Miller',
        protagonist_name: 'Joel Miller',
        display_label: 'The Last of Us Part I — Joel Miller',
        description: 'The Last of Us Part I — Joel Miller',
        validation_prompt: 'Game: The Last of Us Part I\nCharacter/role: Joel Miller',
        internal_suggested_primary_archetype: 'Caregiver',
        internal_suggested_secondary_archetype: 'Everyman / Shadow-load high',
        include_main_clean: true
      });
    }
    if (!out.some((item) => key(item) === 'kratos_modern')) {
      out.push({
        id: 'manual_2018_god-of-war_kratos-modern',
        appid: '1593500',
        game: 'God of War',
        gameTitle: 'God of War (2018)',
        character: 'Kratos (Norse era)',
        name: 'Kratos (Norse era)',
        protagonist_name: 'Kratos (Norse era)',
        display_label: 'God of War (2018) — Kratos (Norse era)',
        description: 'God of War (2018) — Kratos (Norse era)',
        validation_prompt: 'Game: God of War (2018)\nCharacter/role: Kratos (Norse era)',
        internal_suggested_primary_archetype: 'Caregiver',
        internal_suggested_secondary_archetype: 'Hero / Ruler / Shadow-load high',
        include_main_clean: true
      });
    }
    return out;
  }

  function score(groupKey, item, originalIndex) {
    let value = Math.max(0, 500 - originalIndex);
    const pref = PREFERRED[groupKey] || [];
    const prefIndex = pref.indexOf(item && item.id);
    if (prefIndex >= 0) value += 100000 - prefIndex * 1000;
    if (String(character(item)).indexOf('/') < 0) value += 200;
    if (item && (item.include_main_clean === true || String(item.include_main_clean).toLowerCase() === 'true')) value += 100;
    return value;
  }

  function dedupe(items) {
    const groups = new Map();
    items.forEach((item, index) => {
      const groupKey = key(item) || ('unknown_' + index);
      if (!groups.has(groupKey)) groups.set(groupKey, []);
      groups.get(groupKey).push({ item, index });
    });
    const kept = [];
    groups.forEach((entries, groupKey) => {
      let best = entries[0];
      entries.forEach((entry) => {
        if (score(groupKey, entry.item, entry.index) > score(groupKey, best.item, best.index)) best = entry;
      });
      const clone = Object.assign({}, best.item);
      clone.dedup_note_v3 = entries.length === 1 ? 'kept_unique' : 'kept_representative_for_' + groupKey + '; removed_' + (entries.length - 1) + '_duplicate_entries';
      kept.push({ item: clone, index: best.index });
    });
    return kept;
  }

  function prepareCharactersForValidation(data) {
    if (!Array.isArray(data)) return data;
    const kept = dedupe(addMissing(data));
    const byKey = new Map();
    kept.forEach((entry) => {
      byKey.set(key(entry.item), entry.item);
      byKey.set(keyText(character(entry.item)), entry.item);
      byKey.set(entry.item.id, entry.item);
    });

    const used = new Set();
    const ordered = [];
    FRONT.forEach((frontKey) => {
      const item = byKey.get(frontKey);
      if (item && !used.has(item.id)) {
        ordered.push(item);
        used.add(item.id);
      }
    });
    kept.sort((a, b) => a.index - b.index).forEach((entry) => {
      if (!used.has(entry.item.id)) {
        ordered.push(entry.item);
        used.add(entry.item.id);
      }
    });

    ordered.forEach((item, index) => {
      item.order = index + 1;
      item.reorder_note_v3 = 'iconic_front_dedup_minimized';
      item.reorder_reason_v3 = 'iconic protagonists first; duplicate protagonist entries minimized';
      if (!item.name) item.name = character(item);
      if (!item.gameTitle) item.gameTitle = game(item);
    });
    return ordered;
  }

  window.prepareArchetypeCharactersForValidation = prepareCharactersForValidation;
})();

(() => {
  const current = document.currentScript;
  const script = document.createElement('script');
  script.src = 'app_' + 'cleaned.js?v=dedup1';
  if (current && current.parentNode) current.parentNode.insertBefore(script, current.nextSibling);
  else document.head.appendChild(script);
})();
