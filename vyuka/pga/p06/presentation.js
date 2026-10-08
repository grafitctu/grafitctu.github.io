(() => {
  'use strict';
  const slides = [...document.querySelectorAll('.slide')];
  const $ = id => document.getElementById(id);
  const systemTheme = matchMedia('(prefers-color-scheme: dark)');
  function setTheme(theme) {
    document.documentElement.dataset.theme = theme;
    $('theme').setAttribute('aria-pressed', String(theme === 'dark'));
    $('theme').title = theme === 'dark' ? 'Přepnout na světlý režim' : 'Přepnout na tmavý režim';
  }
  setTheme(document.documentElement.dataset.theme);
  $('theme').addEventListener('click', () => {
    const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    setTheme(theme);
    try { localStorage.setItem('pga-chludil-theme', theme); } catch {}
  });
  systemTheme.addEventListener('change', event => {
    let saved;
    try { saved = localStorage.getItem('pga-chludil-theme'); } catch {}
    if (saved !== 'light' && saved !== 'dark') setTheme(event.matches ? 'dark' : 'light');
  });
  const overview = $('overview'), imageView = $('image-view');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let current = -1, reading = false, animations = [];
  const fromHash = () => Math.max(0, Math.min(slides.length - 1, (Number(location.hash.match(/^#slide-(\d+)$/)?.[1]) || 1) - 1));
  function update() {
    $('counter').textContent = `${String(current + 1).padStart(2, '0')} / ${slides.length}`;
    $('chapter').textContent = slides[current].dataset.section;
    $('previous').disabled = current === 0;
    $('next').disabled = current === slides.length - 1;
    $('progress-value').style.width = `${(current + 1) / slides.length * 100}%`;
    overview.querySelectorAll('a').forEach((link, n) => n === current ? link.setAttribute('aria-current', 'page') : link.removeAttribute('aria-current'));
    $('announcement').textContent = slides[current].getAttribute('aria-label');
  }
  function go(index, animate = true, writeHash = true) {
    index = Math.max(0, Math.min(slides.length - 1, index));
    if (index === current) { if (reading) slides[index].scrollIntoView(); return; }
    animations.forEach(a => a.cancel()); animations = [];
    const old = current, previous = slides[old], next = slides[index];
    current = index;
    slides.forEach((slide, n) => { slide.hidden = !reading && n !== index; slide.inert = !reading && n !== index; });
    if (!reading) next.scrollTop = 0;
    if (animate && previous && !reading && !reduced.matches) {
      const direction = index > old ? 1 : -1;
      previous.hidden = false; previous.inert = true;
      const options = {duration: 280, easing: 'cubic-bezier(.22,.7,.25,1)'};
      const exit = previous.animate([{transform:'translateX(0)',opacity:1},{transform:`translateX(${-direction * 8}%)`,opacity:0}], options);
      const enter = next.animate([{transform:`translateX(${direction * 8}%)`,opacity:0},{transform:'translateX(0)',opacity:1}], options);
      animations = [exit, enter];
      exit.finished.then(() => { if (current !== old && !reading) previous.hidden = true; }).catch(() => {});
    }
    if (writeHash) history.replaceState(null, '', `#slide-${index + 1}`);
    update();
    if (reading) next.scrollIntoView({behavior:'instant'});
  }
  $('next').addEventListener('click', () => go(current + 1));
  $('previous').addEventListener('click', () => go(current - 1));
  $('contents').addEventListener('click', () => overview.showModal());
  overview.querySelectorAll('a').forEach(link => link.addEventListener('click', event => {
    event.preventDefault(); overview.close(); go(Number(link.hash.slice(7)) - 1);
  }));
  document.querySelectorAll('dialog .close').forEach(button => button.addEventListener('click', () => button.closest('dialog').close()));
  [overview, imageView].forEach(dialog => dialog.addEventListener('click', event => { if (event.target === dialog) { const r=dialog.getBoundingClientRect(); if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom) dialog.close(); } }));
  document.querySelectorAll('figure img').forEach(img => {
    img.tabIndex = 0; img.setAttribute('role', 'button'); img.setAttribute('aria-label', `Zvětšit: ${img.alt}`);
    const open = () => { imageView.querySelector('img').src = img.src; imageView.querySelector('img').alt = img.alt; imageView.showModal(); };
    img.addEventListener('click', open);
    img.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') {e.preventDefault(); open();} });
  });
  $('reading').addEventListener('click', () => {
    animations.forEach(a => a.cancel()); reading = !reading;
    document.body.classList.toggle('reading', reading); document.body.classList.toggle('presenting', !reading);
    $('reading').setAttribute('aria-pressed', String(reading)); $('reading').textContent = 'Čtení';
    slides.forEach((slide, n) => {slide.hidden = !reading && n !== current; slide.inert = !reading && n !== current;});
    if (reading) slides[current].scrollIntoView({behavior:'instant'});
  });
  async function fullscreen() {
    try { if (document.fullscreenElement) await document.exitFullscreen(); else await document.documentElement.requestFullscreen(); }
    catch { $('announcement').textContent = 'Prohlížeč nepovolil celou obrazovku. Použijte F11.'; }
  }
  $('fullscreen').addEventListener('click', fullscreen);
  document.addEventListener('keydown', e => {
    if (document.querySelector('dialog:modal') || e.target.closest('[contenteditable=true]') || e.ctrlKey || e.metaKey || e.altKey || /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
    if ((e.key === ' ' || e.key === 'Enter') && e.target.closest('button,a,[role="button"]')) return;
    if (['ArrowRight','PageDown'].includes(e.key) || (e.key === ' ' && !reading && !e.shiftKey)) {e.preventDefault(); go(current + 1);}
    else if (['ArrowLeft','PageUp'].includes(e.key) || (e.key === ' ' && !reading && e.shiftKey)) {e.preventDefault(); go(current - 1);}
    else if (e.key === 'Home' && !reading) {e.preventDefault(); go(0);}
    else if (e.key === 'End' && !reading) {e.preventDefault(); go(slides.length - 1);}
    else if (e.key.toLowerCase() === 'f') fullscreen();
    else if (e.key.toLowerCase() === 'o') overview.showModal();
  });
  let touch;
  $('deck').addEventListener('touchstart', e => {touch = e.touches.length === 1 ? {x:e.touches[0].clientX,y:e.touches[0].clientY} : null;}, {passive:true});
  $('deck').addEventListener('touchend', e => {
    if (!touch || reading || e.target.closest('.table-wrap,input,button,select,textarea,[contenteditable=true]')) return;
    const dx=e.changedTouches[0].clientX-touch.x, dy=e.changedTouches[0].clientY-touch.y;
    if (Math.abs(dx)>65 && Math.abs(dx)>Math.abs(dy)*1.8) go(current+(dx<0?1:-1));
    touch=null;
  }, {passive:true});
  addEventListener('hashchange', () => go(fromHash(), true, false));
  document.body.classList.add('presenting'); go(fromHash(), false, false);
})();
