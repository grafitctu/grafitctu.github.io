(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const all = selector => [...document.querySelectorAll(selector)];
  const language = () => document.body.dataset.lang;
  const t = (cs, en) => language() === 'en' ? en : cs;
  const num = (value, digits = 3) => value == null ? '—' :
    Number((Math.abs(value) < 0.5 * 10 ** -digits ? 0 : value).toFixed(digits))
      .toLocaleString(t('cs-CZ', 'en-US'), {maximumFractionDigits: digits, useGrouping: false});
  const vector = value => '(' + value.map(x => num(x)).join(t('; ', ', ')) + ')';
  const print = (id, value) => { $(id).textContent = value; };
  const read = id => Number($(id).value);
  const on = (id, type, fn) => $(id).addEventListener(type, fn);
  const escape = s => String(s).replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);
  const readoutRange = (id, suffix = '') => print(id + '-value', num(read(id)) + suffix);
  function table(headers, rows) {
    return '<table><thead><tr>' + headers.map(x => '<th scope="col">' + x + '</th>').join('') +
      '</tr></thead><tbody>' + rows.map(row => '<tr>' + row.map((x,i) =>
        i === 0 ? '<th scope="row">' + x + '</th>' : '<td>' + x + '</td>'
      ).join('') + '</tr>').join('') + '</tbody></table>';
  }

  const teal = '#007e71', orange = '#b35320', ink = '#172c35', grid = '#e2eae6';
  function plotting(canvas, xmin, xmax, ymin, ymax, xLabel, yLabel, equalUnits = false) {
    const ctx = canvas.getContext('2d'), W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    const xStart = 67, xEnd = W - 21, yStart = 42, yEnd = H - 57;
    if (equalUnits) {
      const ratio = (xEnd - xStart) / (yEnd - yStart);
      const xCenter = (xmin + xmax) / 2, yCenter = (ymin + ymax) / 2;
      const yHalf = Math.max((ymax - ymin) / 2, (xmax - xmin) / (2 * ratio));
      xmin = xCenter - yHalf * ratio;
      xmax = xCenter + yHalf * ratio;
      ymin = yCenter - yHalf;
      ymax = yCenter + yHalf;
    }
    const x = a => xStart + (a - xmin) / (xmax - xmin) * (xEnd - xStart);
    const y = b => yEnd - (b - ymin) / (ymax - ymin) * (yEnd - yStart);
    ctx.font = '22px Arial';
    ctx.fillStyle = ink;
    ctx.textBaseline = 'middle';
    ctx.lineWidth = 1;
    for (let n = 0; n <= 4; n++) {
      const atX = xStart + (xEnd - xStart) * n / 4;
      const atY = yEnd - (yEnd - yStart) * n / 4;
      ctx.strokeStyle = grid;
      ctx.beginPath();
      ctx.moveTo(atX, yStart);
      ctx.lineTo(atX, yEnd);
      ctx.moveTo(xStart, atY);
      ctx.lineTo(xEnd, atY);
      ctx.stroke();
      ctx.textAlign = 'center';
      ctx.fillText(num(xmin + (xmax - xmin) * n / 4, 1), atX, yEnd + 20);
      ctx.textAlign = 'right';
      if (yLabel) ctx.fillText(num(ymin + (ymax - ymin) * n / 4, 1), xStart - 8, atY);
    }
    ctx.textAlign = 'left';
    ctx.fillText(yLabel, xStart, 19);
    ctx.textAlign = 'right';
    ctx.fillText(xLabel, xEnd, H - 14);
    function line(points, color = teal, width = 2, dash = []) {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.setLineDash(dash);
      points.forEach(([a,b],i) => i ? ctx.lineTo(x(a),y(b)) : ctx.moveTo(x(a),y(b)));
      ctx.stroke();
      ctx.setLineDash([]);
    }
    function point([a,b], color = teal, kind = 'dot', size = 7) {
      const px = x(a), py = y(b);
      ctx.lineWidth = 3;
      ctx.strokeStyle = color;
      ctx.fillStyle = kind === 'dot' ? color : 'white';
      ctx.beginPath();
      if (kind === 'cross') {
        ctx.moveTo(px - size, py); ctx.lineTo(px + size, py);
        ctx.moveTo(px, py - size); ctx.lineTo(px, py + size);
      } else if (kind === 'square') ctx.rect(px - size, py - size, size * 2, size * 2);
      else ctx.arc(px, py, size, 0, 2 * Math.PI);
      if (kind !== 'cross') ctx.fill();
      ctx.stroke();
    }
    function label([a,b], text, color = ink, offsetX = 12, offsetY = -12) {
      ctx.textAlign = 'left';
      ctx.font = 'bold 21px Arial';
      ctx.fillStyle = color;
      ctx.fillText(text, Math.min(x(a) + offsetX, W - 52), Math.max(y(b) + offsetY, 24));
    }
    return {ctx, x, y, line, point, label, bounds:[xmin, xmax, ymin, ymax]};
  }

  const slides = all('.slide');
  function showSlide(id, updateHash = true) {
    if (!slides.length) return;
    const index = Math.max(0, slides.findIndex(node => node.id === id));
    slides.forEach((slide, i) => { slide.hidden = i !== index; });
    $('slide-topic').value = slides[index].id;
    print('slide-progress', (index + 1) + ' / ' + slides.length);
    $('slide-back').disabled = index === 0;
    $('slide-next').disabled = index === slides.length - 1;
    if (updateHash) {
      const url = new URL(location.href);
      url.hash = slides[index].id;
      history.replaceState(null, '', url);
      window.scrollTo(0, 0);
    }
  }

  const initial = new URL(location.href);
  let codeLanguage = 'cpp';
  try { codeLanguage = localStorage.getItem('roz-code-language') === 'python' ? 'python' : 'cpp'; } catch {}
  if (['cpp','python'].includes(initial.searchParams.get('code'))) codeLanguage = initial.searchParams.get('code');
  function renderCode() {
    for (const container of all('[data-example]')) {
      const id = container.dataset.example;
      const snippet = window.FeatureCode[id][codeLanguage];
      if (!container.firstChild) {
        container.innerHTML = '<div class="code-buttons"><button type="button" data-code="cpp">C++</button>' +
          '<button type="button" data-code="python">Python</button></div><pre tabindex="0"><code></code></pre>' +
          '<p class="download-links"><a download href="packages/' + id + '-cpp.zip">C++ ZIP</a>' +
          '<a download href="packages/' + id + '-python.zip">Python ZIP</a></p>';
      }
      container.querySelector('code').textContent = snippet;
      container.querySelectorAll('[data-code]').forEach(button =>
        button.setAttribute('aria-pressed', String(button.dataset.code === codeLanguage)));
    }
  }

  function setLanguage(lang, notify = true) {
    const choice = lang === 'en' ? 'en' : 'cs';
    document.body.dataset.lang = choice;
    document.documentElement.lang = choice;
    const url = new URL(location.href);
    url.searchParams.set('lang', choice);
    history.replaceState(null, '', url);
    all('[data-language]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.language === choice)));
    all('option[data-cs]').forEach(option => { option.textContent = option.dataset[choice]; });
    all('canvas[data-label-cs]').forEach(canvas => {
      canvas.setAttribute('aria-label', choice === 'cs' ? canvas.dataset.labelCs : canvas.dataset.labelEn);
    });
    all('a[data-language-link]').forEach(anchor => {
      const target = new URL(anchor.getAttribute('href'), location.href);
      target.searchParams.set('lang', choice);
      anchor.href = target.href;
    });
    if (notify) document.dispatchEvent(new Event('feature-language'));
  }
  document.addEventListener('click', event => {
    const lang = event.target.closest('[data-language]');
    if (lang) setLanguage(lang.dataset.language);
    const code = event.target.closest('button[data-code]');
    if (code) {
      codeLanguage = code.dataset.code;
      try { localStorage.setItem('roz-code-language', codeLanguage); } catch {}
      const url = new URL(location.href);
      url.searchParams.set('code', codeLanguage);
      history.replaceState(null,'',url);
      renderCode();
    }
  });
  if (slides.length) {
    function advance(delta) {
      const current = slides.findIndex(slide => !slide.hidden);
      const next = slides[current + delta];
      if (next) showSlide(next.id);
    }
    on('slide-topic', 'change', event => showSlide(event.target.value));
    on('slide-back', 'click', () => advance(-1));
    on('slide-next', 'click', () => advance(1));
    window.addEventListener('hashchange', () => {
      const id = location.hash.slice(1);
      if (slides.some(slide => slide.id === id)) showSlide(id, false);
    });
    document.addEventListener('keydown', event => {
      if (event.altKey || event.ctrlKey || event.metaKey || event.target.closest('input, select, button, textarea, pre, a, summary')) return;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        advance(event.key === 'ArrowLeft' ? -1 : 1);
      }
    });
    showSlide(location.hash.slice(1), false);
  }
  setLanguage(initial.searchParams.get('lang'), false);
  renderCode();
  window.FeatureUI = { $, all, t, num, vector, print, read, on, escape, readoutRange, table, plotting, teal, orange, ink, showSlide };
})();
