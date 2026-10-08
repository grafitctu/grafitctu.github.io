(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const decks = new Map([...document.querySelectorAll('.deck-variant')].map(deck => [Number(deck.dataset.version), deck]));
  const sets = new Map([...decks].map(([version, deck]) => [version, [...deck.querySelectorAll('.slide')]]));
  const dialogs = [$('overview'), $('image-view'), $('changes')];
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const systemTheme = matchMedia('(prefers-color-scheme: dark)');
  const read = key => { try { return localStorage.getItem(key); } catch { return null; } };
  const save = (key, value) => { try { localStorage.setItem(key, String(value)); } catch {} };
  const positions = {};
  for (const v of [1,2]) {
    const savedId = read(`vhs-p02-slide-${v}`) || `v${v}-slide-${(Number(read(`vhs-p02-position-${v}`)) || 0)+1}`;
    positions[v] = Math.max(0,sets.get(v).findIndex(slide => slide.id === savedId));
  }
  const visited = {1: read('vhs-p02-slide-1') !== null || read('vhs-p02-position-1') !== null,
                   2: read('vhs-p02-slide-2') !== null || read('vhs-p02-position-2') !== null};
  let version = read('vhs-p02-version') === '2' ? 2 : 1;
  let current = -1, reading = false, animations = [], touch = null;

  for (const [v, slides] of sets) {
    slides.forEach((slide, i) => {
      const heading = slide.querySelector('h2,h1');
      slide.dataset.title ||= heading?.textContent.trim().replace(/\s+/g, ' ') || `Snímek ${i+1}`;
      if (heading) { heading.id ||= `v${v}-title-${i+1}`; heading.tabIndex = -1; }
      slide.setAttribute('aria-label', `Varianta ${v}, snímek ${i+1}: ${slide.dataset.title}`);
      if (v === 1 && (slide.textContent.length > 900 || (slide.querySelectorAll('li').length > 7 && slide.querySelector('figure')))) slide.classList.add('is-dense');
    });
  }

  function setTheme(theme) {
    document.documentElement.dataset.theme = theme;
    const label = theme === 'dark' ? 'Přepnout na světlý režim' : 'Přepnout na tmavý režim';
    $('theme').setAttribute('aria-pressed', String(theme === 'dark'));
    $('theme').setAttribute('aria-label', label);
    $('theme').title = label;
  }
  setTheme(document.documentElement.dataset.theme);
  $('theme').addEventListener('click', () => {
    const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    setTheme(theme); save('vhs-theme', theme);
  });
  systemTheme.addEventListener('change', e => {
    if (!['light', 'dark'].includes(read('vhs-theme'))) setTheme(e.matches ? 'dark' : 'light');
  });

  function stop(reason = 'Zvuk je zastavený.') { window.VHSAudio?.stopAll(reason); }
  function cancelAnimations() { animations.forEach(a => a.cancel()); animations = []; }
  function parseHash() {
    const match = location.hash.match(/^#v([12])-slide-(\d+)$/);
    if (match) {
      const v = Number(match[1]), id = `v${v}-slide-${match[2]}`;
      const index = sets.get(v).findIndex(slide => slide.id === id);
      return index < 0 ? null : {version:v,index};
    }
    const legacy = location.hash.match(/^#slide-(\d+)$/);
    return legacy ? {version: 1, index: Number(legacy[1])-1} : null;
  }
  function syncSlides() {
    for (const [v, deck] of decks) {
      deck.hidden = v !== version;
      deck.inert = v !== version;
      sets.get(v).forEach((slide, index) => {
        slide.hidden = !reading && (v !== version || index !== current);
        slide.inert = v !== version || (!reading && index !== current);
      });
    }
  }
  function buildOverview() {
    const nav = $('overview').querySelector('nav');
    nav.replaceChildren();
    $('overview-title').textContent = `Obsah · varianta ${version}`;
    sets.get(version).forEach((slide, index) => {
      const link = document.createElement('a');
      link.href = `#${slide.id}`;
      for (const [tag, value] of [['span', String(index+1).padStart(2,'0')], ['span', slide.dataset.title], ['small', slide.dataset.section]]) {
        const element = document.createElement(tag); element.textContent = value; link.append(element);
      }
      link.addEventListener('click', e => { e.preventDefault(); $('overview').close(); go(index); });
      nav.append(link);
    });
  }
  function update() {
    const slides = sets.get(version), slide = slides[current];
    $('counter').textContent = `${String(current+1).padStart(2,'0')} / ${slides.length}`;
    $('counter').setAttribute('aria-label', `Varianta ${version}, snímek ${current+1} z ${slides.length}`);
    $('chapter').textContent = slide.dataset.section;
    $('previous').disabled = current === 0;
    $('next').disabled = current === slides.length-1;
    $('progress-value').style.width = `${(current+1)/slides.length*100}%`;
    if (document.querySelector('.brand').id !== 'grafit-course-link') document.querySelector('.brand').href = `#v${version}-slide-1`;
    document.querySelectorAll('.variant-switch button').forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.version) === version)));
    $('overview').querySelectorAll('nav a').forEach((link, i) => {
      if (i === current) link.setAttribute('aria-current', 'page'); else link.removeAttribute('aria-current');
    });
    $('announcement').textContent = slide.getAttribute('aria-label');
    document.title = `VHS 02 · V${version} · ${slide.dataset.title}`;
    positions[version] = current; visited[version] = true;
    save(`vhs-p02-slide-${version}`, slide.id); save('vhs-p02-version', version);
  }
  function go(index, animate = true, writeHash = true) {
    const slides = sets.get(version);
    index = Math.max(0, Math.min(slides.length-1, index));
    if (index === current) { if (reading) slides[index].scrollIntoView({behavior:'instant'}); return; }
    stop('Zvuk se zastavil při změně snímku.'); cancelAnimations();
    const old = current, previous = slides[old], next = slides[index];
    current = index; syncSlides();
    if (!reading) next.scrollTop = 0;
    if (animate && previous && !reading && !reducedMotion.matches) {
      const direction = index > old ? 1 : -1;
      previous.hidden = false; previous.inert = true;
      const options = {duration: 280, easing:'cubic-bezier(.22,.7,.25,1)'};
      const exit = previous.animate([{transform:'translateX(0)',opacity:1},{transform:`translateX(${-direction*8}%)`,opacity:0}], options);
      const enter = next.animate([{transform:`translateX(${direction*8}%)`,opacity:0},{transform:'translateX(0)',opacity:1}], options);
      animations = [exit, enter];
      exit.finished.then(() => { if (current !== old && !reading) previous.hidden = true; }).catch(() => {});
    }
    if (writeHash) history.replaceState(null, '', `#${next.id}`);
    update();
    if (reading) next.scrollIntoView({behavior:'instant'});
  }
  function selectVersion(nextVersion, index, writeHash = true) {
    if (nextVersion === version) { if (index !== undefined) go(index, false, writeHash); return; }
    stop('Zvuk se zastavil při změně varianty.'); cancelAnimations();
    const topic = sets.get(version)[current]?.dataset.topic;
    if (index === undefined) {
      const match = sets.get(nextVersion).findIndex(slide => slide.dataset.topic === topic);
      index = visited[nextVersion] ? positions[nextVersion] : Math.max(0, match);
    }
    version = nextVersion; current = -1; buildOverview();
    go(index, false, false);
    if (writeHash) history.pushState(null, '', `#${sets.get(version)[current].id}`);
  }
  function openDialog(dialog) { stop('Zvuk se zastavil při otevření přehledu.'); dialog.showModal(); }
  function handleHash() {
    const state = parseHash();
    if (state) {
      if (state.version !== version) selectVersion(state.version, state.index, false);
      else go(state.index, true, false);
      return;
    }
    const reference = document.getElementById(location.hash.slice(1));
    const slide = reference?.closest('.slide');
    if (slide) {
      const v = Number(slide.closest('.deck-variant').dataset.version);
      const index = sets.get(v).indexOf(slide);
      if (v !== version) selectVersion(v, index, false); else go(index, false, false);
      reference.scrollIntoView({block:'center',behavior:'instant'});
    }
  }

  $('previous').addEventListener('click', () => go(current-1));
  $('next').addEventListener('click', () => go(current+1));
  $('contents').addEventListener('click', () => openDialog($('overview')));
  document.querySelector('.brand').addEventListener('click', e => { if (e.currentTarget.id === 'grafit-course-link') return; e.preventDefault(); go(0); });
  document.querySelectorAll('.variant-switch button').forEach(button => button.addEventListener('click', () => selectVersion(Number(button.dataset.version))));
  document.querySelectorAll('[data-open-changes]').forEach(button => button.addEventListener('click', () => openDialog($('changes'))));
  document.querySelectorAll('dialog .close').forEach(button => button.addEventListener('click', () => button.closest('dialog').close()));
  dialogs.forEach(dialog => dialog.addEventListener('click', e => {
    if (e.target !== dialog) return;
    const r = dialog.getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dialog.close();
  }));
  document.querySelectorAll('figure img').forEach(img => {
    if (img.closest('a')) return; // Historical linked screenshots remain video links.
    img.tabIndex = 0; img.setAttribute('role','button'); img.setAttribute('aria-label', `Zvětšit: ${img.alt}`);
    const open = () => {
      const large = $('image-view').querySelector('img'); large.src = img.src; large.alt = img.alt;
      openDialog($('image-view'));
    };
    img.addEventListener('click', open);
    img.addEventListener('keydown', e => { if (['Enter',' '].includes(e.key)) { e.preventDefault(); open(); } });
  });
  document.querySelectorAll('a[href^="http"]').forEach(link => {link.target = '_blank'; link.rel = 'noopener noreferrer';});
  $('reading').addEventListener('click', () => {
    stop('Zvuk se zastavil při změně režimu.'); cancelAnimations(); reading = !reading;
    document.body.classList.toggle('reading', reading); document.body.classList.toggle('presenting', !reading);
    $('reading').setAttribute('aria-pressed', String(reading)); $('reading').textContent = reading ? 'Prezentace' : 'Čtení';
    syncSlides();
    if (reading) sets.get(version)[current].scrollIntoView({behavior:'instant'});
    else window.scrollTo({top:0,behavior:'instant'});
  });
  let scrollFrame = null;
  addEventListener('scroll', () => {
    if (!reading || scrollFrame !== null) return;
    scrollFrame = requestAnimationFrame(() => {
      scrollFrame = null;
      if (!reading) return;
      const top = document.querySelector('.toolbar').getBoundingClientRect().bottom + 20;
      let best = 0, distance = Infinity;
      sets.get(version).forEach((slide, index) => { const d = Math.abs(slide.getBoundingClientRect().top - top); if (d < distance) {best = index; distance = d;} });
      if (current !== best) { current = best; history.replaceState(null,'',`#${sets.get(version)[best].id}`); update(); }
    });
  }, {passive:true});
  async function fullscreen() {
    try { if (document.fullscreenElement) await document.exitFullscreen(); else await document.documentElement.requestFullscreen(); }
    catch { $('announcement').textContent = 'Prohlížeč nepovolil celou obrazovku. Použijte F11.'; }
  }
  $('fullscreen').addEventListener('click', fullscreen);
  $('stop-audio').addEventListener('click', () => stop());
  document.addEventListener('vhs:audio-state', e => { $('stop-audio').disabled = !e.detail.active; });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') stop();
    if (dialogs.some(dialog => dialog.open) || e.ctrlKey || e.altKey || e.metaKey || e.target.closest('input,textarea,select,[contenteditable],.lab,fieldset')) return;
    if ([' ','Enter'].includes(e.key) && e.target.closest('button,a,[role="button"]')) return;
    if (['ArrowRight','PageDown'].includes(e.key) || (e.key === ' ' && !reading && !e.shiftKey)) {e.preventDefault(); go(current+1);}
    else if (['ArrowLeft','PageUp'].includes(e.key) || (e.key === ' ' && !reading && e.shiftKey)) {e.preventDefault(); go(current-1);}
    else if (e.key === 'Home' && !reading) {e.preventDefault(); go(0);}
    else if (e.key === 'End' && !reading) {e.preventDefault(); go(sets.get(version).length-1);}
    else if (e.key.toLowerCase() === 'f') fullscreen();
    else if (e.key.toLowerCase() === 'o') openDialog($('overview'));
  });
  $('deck').addEventListener('touchstart', e => {
    touch = e.touches.length === 1 && !e.target.closest('.lab,a,button,input,textarea,select,.table-wrap') ? {x:e.touches[0].clientX,y:e.touches[0].clientY} : null;
  }, {passive:true});
  $('deck').addEventListener('touchend', e => {
    if (!touch || reading) return;
    const dx=e.changedTouches[0].clientX-touch.x, dy=e.changedTouches[0].clientY-touch.y;
    if (Math.abs(dx)>65 && Math.abs(dx)>Math.abs(dy)*1.8) go(current+(dx<0?1:-1));
    touch=null;
  }, {passive:true});
  addEventListener('hashchange', handleHash);
  addEventListener('beforeprint', () => stop());
  const initial = parseHash();
  if (initial) version = initial.version;
  buildOverview(); document.body.classList.add('presenting');
  go(initial?.index ?? positions[version], false, true);
})();
