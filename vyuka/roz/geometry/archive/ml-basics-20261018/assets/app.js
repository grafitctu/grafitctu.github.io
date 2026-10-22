(() => {
  const body = document.body;
  let savedLanguage = 'cs';
  try { savedLanguage = localStorage.getItem('roz-ml-language') || 'cs'; } catch {}
  const requested = new URLSearchParams(location.search).get('lang');
  const validLanguage = value => value === 'en' ? 'en' : 'cs';
  function language(value) {
    value = validLanguage(value);
    body.dataset.lang = value;
    document.documentElement.lang = value;
    document.querySelectorAll('[data-set-language]').forEach(button =>
      button.setAttribute('aria-pressed', String(button.dataset.setLanguage === value)));
    document.querySelectorAll('a[data-keep-language]').forEach(link => {
      const target = new URL(link.getAttribute('href'), location.href);
      target.searchParams.set('lang', value);
      link.href = target.href;
    });
    try { localStorage.setItem('roz-ml-language', value); } catch {}
  }
  document.querySelectorAll('[data-set-language]').forEach(button =>
    button.addEventListener('click', () => language(button.dataset.setLanguage)));
  language(requested || savedLanguage);

  const slides = [...document.querySelectorAll('[data-slide]')];
  let active = Math.max(0, slides.findIndex(slide => '#' + slide.id === location.hash));
  function showSlide(index) {
    if (!slides.length) return;
    active = Math.max(0, Math.min(slides.length - 1, index));
    slides.forEach((slide, i) => slide.classList.toggle('active', i === active));
    const counter = document.querySelector('[data-counter]');
    if (counter) counter.textContent = `${active + 1} / ${slides.length}`;
    document.querySelectorAll('[data-previous]').forEach(button => button.disabled = active === 0);
    document.querySelectorAll('[data-next]').forEach(button => button.disabled = active === slides.length - 1);
    if (body.dataset.view === 'slides') {
      history.replaceState(null, '', '#' + slides[active].id);
      window.scrollTo({top: 0, behavior: 'instant'});
    }
  }
  const viewButton = document.querySelector('[data-toggle-view]');
  viewButton?.addEventListener('click', () => {
    body.dataset.view = body.dataset.view === 'slides' ? 'read' : 'slides';
    viewButton.setAttribute('aria-pressed', String(body.dataset.view === 'slides'));
    showSlide(active);
  });
  document.querySelectorAll('[data-previous]').forEach(button => button.addEventListener('click', () => showSlide(active - 1)));
  document.querySelectorAll('[data-next]').forEach(button => button.addEventListener('click', () => showSlide(active + 1)));
  document.addEventListener('keydown', event => {
    if (body.dataset.view !== 'slides' || /INPUT|TEXTAREA|SELECT/.test(event.target.tagName)) return;
    if (event.key === 'ArrowRight' || event.key === 'PageDown') { event.preventDefault(); showSlide(active + 1); }
    if (event.key === 'ArrowLeft' || event.key === 'PageUp') { event.preventDefault(); showSlide(active - 1); }
    if (event.key === 'Home') showSlide(0);
    if (event.key === 'End') showSlide(slides.length - 1);
  });
  showSlide(active);
  document.querySelectorAll('[data-print]').forEach(button => button.addEventListener('click', () => window.print()));

  const expected = ['regression','classification','classification','classification','classification','classification','clustering','classification','classification'];
  document.querySelector('[data-check-sort]')?.addEventListener('click', () => {
    const selections = [...document.querySelectorAll('[data-sort]')];
    const correct = selections.filter((input, i) => input.value === expected[i]).length;
    const result = document.querySelector('[data-sort-result]');
    result.textContent = body.dataset.lang === 'en'
      ? `${correct} / ${expected.length} correct for the estimators used in this exercise.`
      : `${correct} / ${expected.length} správně pro varianty metod použité v tomto cvičení.`;
  });
  document.querySelectorAll('textarea[data-answer]').forEach(area => {
    const key = 'roz-ml-answer-v1-' + area.dataset.answer;
    try { area.value = localStorage.getItem(key) || ''; } catch {}
    area.addEventListener('input', () => { try { localStorage.setItem(key, area.value); } catch {} });
  });
  document.querySelector('[data-export-answers]')?.addEventListener('click', () => {
    const content = [...document.querySelectorAll('textarea[data-answer]')]
      .map(area => {
        const label = document.querySelector(`label[for="${area.id}"]`);
        return `${label?.innerText.trim() || area.dataset.answer}\n${area.value}\n`;
      }).join('\n');
    const panel = document.querySelector('[data-answer-export]');
    const output = document.querySelector('[data-export-text]');
    panel.hidden = false;
    output.value = content;
    output.focus();
    output.select();
    panel.scrollIntoView({behavior: 'smooth', block: 'center'});
  });
})();
