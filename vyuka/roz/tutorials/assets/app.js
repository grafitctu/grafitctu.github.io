(() => {
  'use strict';
  const M = window.RozMath, D = M.toy, S = M.stats(D), E = M.eigen(S.C);
  const $ = id => document.getElementById(id);
  const slides = [...document.querySelectorAll('.slide')];
  const url = new URL(location.href);
  let lang = url.searchParams.get('lang') === 'en' ? 'en' : 'cs';
  let feature = 2, centered = false, varianceFeature = 0, covPreset = 'positive', cell = '01';
  let eigenMatrix = 'easy', eigenAngle = 20, handStep = 0, projectionAngle = 0, showEigen = false;
  let k = 1, scaleEight = false, scaleStandard = false, query = [2.7, 1.1], distanceMetric = 'l2', distanceScale = false;
  let split = 'train', predictions = [0, 0, 0, 0, 0, 1, 0, 1];
  let matvecA = [[2, 1], [0, 1]], matvecV = [1, 2], matvecT = 1, matvecGrid = true, matvecError = '', matvecFrame = 0;
  const truth = [0, 0, 0, 0, 0, 0, 1, 1], quizAnswers = {}, maps = new WeakMap();
  const tr = (cs, en) => lang === 'cs' ? cs : en;
  const f = (x, digits = 3) => x === null || !Number.isFinite(x) ? tr('nedefinováno', 'undefined') : (Math.abs(x) < 1e-12 ? 0 : x).toLocaleString(lang === 'cs' ? 'cs-CZ' : 'en-GB', { minimumFractionDigits: digits, maximumFractionDigits: digits });
  const vstr = (v, digits = 3) => '(' + v.map(x => f(x, digits)).join('; ') + ')';
  const names = ['A', 'B', 'C', 'D'];
  const table = (headers, rows) => '<table class="data-table"><thead><tr>' + headers.map(x => '<th scope="col">' + x + '</th>').join('') + '</tr></thead><tbody>' + rows.map(r => '<tr>' + r.map(x => '<td>' + x + '</td>').join('') + '</tr>').join('') + '</tbody></table>';
  const matrix = (A, chosen) => A.flatMap((row, i) => row.map((value, j) => '<span class="' + ((chosen === '' + i + j || chosen === '01' && i !== j) ? 'chosen' : '') + '">' + f(value) + '</span>')).join('');
  const ns = 'http://www.w3.org/2000/svg';
  function node(tag, attrs, text) { const n = document.createElementNS(ns, tag); for (const [a, v] of Object.entries(attrs || {})) n.setAttribute(a, v); if (text !== undefined) n.textContent = text; return n; }
  function line(svg, p, q, cls, extra = {}) { svg.append(node('line', { x1: p[0], y1: p[1], x2: q[0], y2: q[1], class: cls, ...extra })); }
  function plot(svg, { xlim = [0, 5], ylim = [0, 4], xlabel = 'x₁', ylabel = 'x₂', title = '', grid = true } = {}) {
    const height = Number(svg.viewBox.baseVal.height) || 360, width = 560;
    const left = 53, right = 22, top = 25, bottom = height < 150 ? 34 : 46;
    const scale = Math.min((width - left - right) / (xlim[1] - xlim[0]), (height - top - bottom) / (ylim[1] - ylim[0]));
    const ox = left + ((width - left - right) - scale * (xlim[1] - xlim[0])) / 2;
    const oy = top + ((height - top - bottom) - scale * (ylim[1] - ylim[0])) / 2;
    const xy = p => [ox + (p[0] - xlim[0]) * scale, oy + (ylim[1] - p[1]) * scale];
    svg.replaceChildren(node('title', {}, title || svg.getAttribute('aria-label')));
    const xticks = Math.max(2, Math.min(7, Math.round(xlim[1] - xlim[0]))), yticks = Math.max(2, Math.min(6, Math.round(ylim[1] - ylim[0])));
    if (grid) for (let i = 0; i <= xticks; i++) {
      const x = xlim[0] + i * (xlim[1] - xlim[0]) / xticks;
      line(svg, xy([x, ylim[0]]), xy([x, ylim[1]]), 'grid');
      const p = xy([x, ylim[0]]); svg.append(node('text', { x: p[0], y: p[1] + 21, 'text-anchor': 'middle' }, f(x, Number.isInteger(x) ? 0 : 1)));
    }
    if (grid) for (let i = 0; i <= yticks; i++) {
      const y = ylim[0] + i * (ylim[1] - ylim[0]) / yticks;
      line(svg, xy([xlim[0], y]), xy([xlim[1], y]), 'grid');
      const p = xy([xlim[0], y]); svg.append(node('text', { x: p[0] - 10, y: p[1] + 4, 'text-anchor': 'end' }, f(y, Number.isInteger(y) ? 0 : 1)));
    }
    const x0 = Math.max(xlim[0], Math.min(0, xlim[1])), y0 = Math.max(ylim[0], Math.min(0, ylim[1]));
    line(svg, xy([xlim[0], y0]), xy([xlim[1], y0]), 'axis');
    line(svg, xy([x0, ylim[0]]), xy([x0, ylim[1]]), 'axis');
    svg.append(node('text', { x: width - 11, y: height - 7, 'text-anchor': 'end' }, xlabel));
    svg.append(node('text', { x: 10, y: 16 }, ylabel));
    const inverse = (clientX, clientY) => {
      const r = svg.getBoundingClientRect(), x = (clientX - r.left) / r.width * width, y = (clientY - r.top) / r.height * height;
      return [xlim[0] + (x - ox) / scale, ylim[1] - (y - oy) / scale];
    };
    maps.set(svg, { xy, inverse, scale });
    return { xy, inverse, scale };
  }
  function point(svg, xy, p, label, { cls = 'point', radius = 6, fill, square = false } = {}) {
    const pos = xy(p), attrs = { class: cls, ...(fill ? { style: 'fill:' + fill } : {}) };
    svg.append(square ? node('rect', { x: pos[0] - radius, y: pos[1] - radius, width: radius * 2, height: radius * 2, ...attrs }) : node('circle', { cx: pos[0], cy: pos[1], r: radius, ...attrs }));
    if (label) svg.append(node('text', { x: pos[0] + 10, y: pos[1] - 10, class: 'label' }, label));
  }
  function arrow(svg, xy, from, to, color, label) {
    const a = xy(from), b = xy(to); line(svg, a, b, '', { stroke: color, 'stroke-width': 3 });
    const n = Math.hypot(b[0] - a[0], b[1] - a[1]);
    if (n > 1e-5) {
      const dx = (b[0] - a[0]) / n, dy = (b[1] - a[1]) / n;
      svg.append(node('polygon', { points: `${b[0]},${b[1]} ${b[0] - 10 * dx + 4 * dy},${b[1] - 10 * dy - 4 * dx} ${b[0] - 10 * dx - 4 * dy},${b[1] - 10 * dy + 4 * dx}`, fill: color }));
    } else svg.append(node('circle', { cx: b[0], cy: b[1], r: 4, fill: color }));
    if (label) svg.append(node('text', { x: b[0] + 9, y: b[1] + 17, class: 'label' }, label));
  }
  function eigArrows(svg, xy, origin, eig, length = 1.35) {
    eig.vectors.forEach((u, i) => arrow(svg, xy, origin, origin.map((x, j) => x + length * u[j]), i ? '#963f70' : '#365ea0', 'u' + (i + 1)));
  }
  function renderFeature() {
    $('feature-table').tBodies[0].innerHTML = D.map((p, i) => '<tr class="' + (i === feature ? 'selected' : '') + '"><td><button type="button" data-sample="' + i + '" aria-pressed="' + (i === feature) + '">' + names[i] + '</button></td><td>' + p[0] + '</td><td>' + p[1] + '</td></tr>').join('');
    const svg = $('feature-plot'), { xy } = plot(svg);
    D.forEach((p, i) => point(svg, xy, p, names[i], { radius: i === feature ? 10 : 6 }));
    const p = D[feature]; line(svg, xy([p[0], 0]), xy(p), 'help-line'); line(svg, xy([0, p[1]]), xy(p), 'help-line');
    $('feature-value').innerHTML = names[feature] + ': <strong>x' + (feature + 1) + ' = ' + vstr(p, 0) + '</strong><br>' + tr('Dvě souřadnice, jeden vzorek.', 'Two coordinates, one sample.');
  }
  function renderCenter() {
    const values = centered ? S.centered : D, mean = centered ? [0, 0] : S.mean;
    $('center-formula').innerHTML = 'μ = ((1 + 2 + 3 + 4)/4, (1 + 2 + 2 + 3)/4)<br>μ = ' + vstr(S.mean, 1) + '<br>xᶜᵢ = xᵢ − μ';
    const svg = $('center-plot'), { xy } = plot(svg, { xlim: [-2, 5], ylim: [-2, 4] });
    values.forEach((p, i) => point(svg, xy, p, names[i]));
    point(svg, xy, mean, 'μ', { fill: '#ad5d24', radius: 8 });
    $('center-table').innerHTML = table([tr('Vzorek', 'Sample'), 'x₁', 'x₂'], values.map((p, i) => [names[i], f(p[0], 1), f(p[1], 1)]));
    $('center-value').innerHTML = tr('Aktuální průměr', 'Current mean') + ': <strong>' + vstr(mean, 1) + '</strong><br>' + tr('Vzdálenost A–D', 'Distance A–D') + ' = ' + f(Math.hypot(3, 2));
  }
  function renderVariance() {
    const j = varianceFeature;
    $('variance-table').innerHTML = table([tr('Vzorek', 'Sample'), 'x' + (j + 1), 'Δx' + (j + 1), '(Δx' + (j + 1) + ')²'], D.map((p, i) => [names[i], f(p[j], 1), f(S.centered[i][j], 1), f(S.centered[i][j] ** 2, 2)]));
    $('variance-formula').innerHTML = 's² = Σᵢ (xᵢ − μ)² / (n − 1)<br>= ' + f(S.sums[j][j], 0) + ' / (4 − 1)<br>= <strong>' + f(S.C[j][j], 6) + '</strong>';
    $('variance-value').innerHTML = tr('Průměr', 'Mean') + ': ' + f(S.mean[j], 2) + '<br>' + tr('Směrodatná odchylka', 'Standard deviation') + ': <strong>s = ' + f(S.sd[j], 6) + '</strong>';
  }
  const covPoints = () => ({ positive: D, negative: D.map(p => [p[0], 4 - p[1]]), nonlinear: [[-2, 4], [-1, 1], [0, 0], [1, 1], [2, 4]], constant: D.map(p => [p[0], 2]) }[covPreset]);
  function renderCov() {
    const points = covPoints(), s = M.stats(points), svg = $('cov-plot');
    const { xy } = plot(svg, covPreset === 'nonlinear' ? { xlim: [-3, 3], ylim: [-1, 5] } : {});
    points.forEach((p, i) => point(svg, xy, p, String(i + 1)));
    point(svg, xy, s.mean, 'μ', { fill: '#ad5d24' });
    $('cov-table').innerHTML = table(['i', 'Δx₁', 'Δx₂', 'Δx₁ Δx₂'], s.centered.map((p, i) => [i + 1, f(p[0], 1), f(p[1], 1), f(p[0] * p[1], 2)]));
    $('cov-formula').innerHTML = 'cov(x₁, x₂) = Σᵢ Δxᵢ₁ Δxᵢ₂ / (n − 1)<br>= ' + f(s.sums[0][1], 2) + ' / ' + (s.n - 1) + ' = <strong>' + f(s.C[0][1], 4) + '</strong>';
    $('cov-value').innerHTML = 'μ = ' + vstr(s.mean, 2) + '<br>' + tr('Pearsonova korelace', 'Pearson correlation') + ' r = <strong>' + f(s.correlation, 4) + '</strong>';
    $('cov-explanation').textContent = ({
      positive: tr('Zde cov = 1. Pearsonova korelace r = cov/(s₁s₂) nemá jednotky a je přibližně 0,949. Kladná korelace sama nedokazuje příčinný vztah.', 'Here cov = 1. Pearson correlation r = cov/(s₁s₂) is dimensionless and approximately 0.949. Positive correlation alone does not establish causation.'),
      negative: tr('Druhý příznak teď s rostoucím prvním převážně klesá. Součet součinů je záporný. Znaménko kovariance zachycuje tento směr vztahu.', 'The second feature now generally decreases as the first increases. The product sum is negative. Covariance captures this direction of association.'),
      nonlinear: tr('Tady je x₂ = x₁²: druhý příznak je určen prvním. Přesto je kovariance i lineární korelace přesně nula. Nulová korelace obecně neznamená nezávislost.', 'Here x₂ = x₁²: the first feature determines the second. Yet covariance and linear correlation are exactly zero. Zero correlation does not generally imply independence.'),
      constant: tr('Druhý příznak je konstantní, jeho rozptyl je nula. Kovariance je nula, ale korelace je nedefinovaná, protože bychom dělili nulou.', 'The second feature is constant, so its variance is zero. Covariance is zero, but correlation is undefined because its denominator is zero.')
    })[covPreset];
  }
  function renderMatrix() {
    const [i, j] = [...cell].map(Number), products = S.centered.map(p => p[i] * p[j]);
    $('cov-matrix').innerHTML = matrix(S.C, cell);
    document.querySelectorAll('[data-cell]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.cell === cell)));
    $('matrix-table').innerHTML = table([tr('Vzorek', 'Sample'), 'Δx' + (i + 1), 'Δx' + (j + 1), tr('Součin', 'Product')], S.centered.map((p, index) => [names[index], f(p[i], 1), f(p[j], 1), f(products[index], 2)]));
    $('matrix-formula').innerHTML = 'C' + (i + 1) + (j + 1) + ' = (' + products.map(x => f(x, 2)).join(' + ') + ') / 3<br>= <strong>' + f(S.C[i][j], 6) + '</strong>';
    $('matrix-value').textContent = i === j ? tr('Diagonála: rozptyl příznaku ', 'Diagonal: variance of feature ') + 'x' + (i + 1) : tr('Mimo diagonálu: kovariance x₁ a x₂.', 'Off-diagonal: covariance of x₁ and x₂.');
  }
  const matvecPresets = {
    example: [[2, 1], [0, 1]], identity: [[1, 0], [0, 1]], scale: [[2, 0], [0, .5]],
    rotation: [[0, -1], [1, 0]], shear: [[1, 1], [0, 1]], reflection: [[1, 0], [0, -1]],
    projection: [[1, 0], [0, 0]], zero: [[0, 0], [0, 0]], eigen: [[2, 1], [1, 2]]
  };
  const matvecIds = ['matvec-a00', 'matvec-a01', 'matvec-a10', 'matvec-a11', 'matvec-v0', 'matvec-v1'];
  const mf = x => x !== 0 && (Math.abs(x) < .001 || Math.abs(x) >= 1e5) ? x.toExponential(3).replace('.', lang === 'cs' ? ',' : '.') : f(x, Number.isInteger(x) ? 0 : 3);
  const mvstr = v => '(' + v.map(mf).join('; ') + ')';
  const factor = x => x < 0 ? '(' + mf(x) + ')' : mf(x);
  function stopMatvecAnimation() {
    if (matvecFrame) cancelAnimationFrame(matvecFrame);
    matvecFrame = 0;
    if ($('matvec-play')) $('matvec-play').textContent = tr('Přehrát', 'Animate');
  }
  function writeMatvecInputs() {
    [...matvecA.flat(), ...matvecV].forEach((x, i) => { $(matvecIds[i]).value = String(x); $(matvecIds[i]).setAttribute('aria-invalid', 'false'); });
    matvecError = '';
  }
  function readMatvecInputs() {
    stopMatvecAnimation();
    const values = matvecIds.map(id => {
      const field = $(id), text = field.value.trim();
      const value = /^[+-]?(?:\d+(?:[.,]\d*)?|[.,]\d+)(?:e[+-]?\d+)?$/i.test(text) ? Number(text.replace(',', '.')) : NaN;
      field.setAttribute('aria-invalid', String(!Number.isFinite(value)));
      return value;
    });
    matvecError = values.every(Number.isFinite) ? '' : 'entry';
    if (!matvecError) {
      const A = [values.slice(0, 2), values.slice(2, 4)], v = values.slice(4), w = M.matvec(A, v);
      if (![...values, ...w].every(x => Number.isFinite(x) && Math.abs(x) < 1e100)) matvecError = 'range';
      else { matvecA = A; matvecV = v; matvecT = 1; }
    }
    renderMatvec();
  }
  function renderMatvec() {
    const A = matvecA, v = matvecV, w = M.matvec(A, v), t = matvecT;
    const current = v.map((x, j) => (1 - t) * x + t * w[j]);
    const error = $('matvec-error'); error.hidden = !matvecError;
    error.textContent = matvecError ? (matvecError === 'entry' ? tr('Doplňte do všech šesti polí platná konečná čísla.', 'Enter valid finite numbers in all six fields.') : tr('Vstup nebo výsledek je příliš velký pro tuto ukázku.', 'The input or result is too large for this demonstration.')) + ' ' + tr('Graf a výpočet zatím zobrazují poslední platné zadání.', 'The plot and calculation still show the last valid entries.') : '';
    $('matvec-products').innerHTML = A.map((row, j) => '<div><span class="output-coordinate">w' + (j === 0 ? '₁' : '₂') + '</span> = ' + factor(row[0]) + ' · ' + factor(v[0]) + ' + ' + factor(row[1]) + ' · ' + factor(v[1]) + ' = <strong>' + mf(w[j]) + '</strong></div>').join('');
    $('matvec-result').innerHTML = 'w = Av = <strong>' + mvstr(w) + '</strong>';
    $('matvec-columns').textContent = factor(v[0]) + ' · ' + mvstr([A[0][0], A[1][0]]) + ' + ' + factor(v[1]) + ' · ' + mvstr([A[0][1], A[1][1]]) + ' = ' + mvstr(w);
    $('matvec-progress').value = Math.round(t * 100);
    $('matvec-progress-value').textContent = f(t, 2);
    $('matvec-current-legend').textContent = t === 1 ? tr('Výsledek Av', 'Result Av') : 'w(t)';
    $('matvec-current').textContent = (t === 1 ? 'Av' : 'w(t)') + ' = ' + mvstr(current);
    $('matvec-play').textContent = matvecFrame ? tr('Zastavit', 'Pause') : tr('Přehrát', 'Animate');
    const svg = $('matvec-plot');
    const limits = j => {
      const low = Math.min(0, v[j], w[j]), high = Math.max(1, v[j], w[j]), pad = Math.max(.7, (high - low) * .22);
      return [low - pad, high + pad];
    };
    const raw = [limits(0), limits(1)], rawStep = Math.max(...raw.map(r => r[1] - r[0])) / 6;
    const power = 10 ** Math.floor(Math.log10(rawStep)), fraction = rawStep / power;
    const tickStep = (fraction < 1.5 ? 1 : fraction < 3 ? 2 : fraction < 7 ? 5 : 10) * power;
    const [xlim, ylim] = raw.map(r => [Math.floor(r[0] / tickStep) * tickStep, Math.ceil(r[1] / tickStep) * tickStep]);
    const { xy } = plot(svg, { xlim, ylim, xlabel: 'x₁', ylabel: 'x₂', grid: false, title: tr('Modrý vstup v a oranžový obraz ', 'Blue input v and orange image ') + mvstr(current) });
    const reference = node('g');
    const tickLabel = value => Math.abs(value) >= 1e5 || value !== 0 && Math.abs(value) < .001 ? mf(value) : Number(value.toPrecision(12)).toLocaleString(lang === 'cs' ? 'cs-CZ' : 'en-GB', { maximumFractionDigits: 6 });
    for (let j = 0; j < 2; j++) {
      const r = j === 0 ? xlim : ylim, count = Math.round((r[1] - r[0]) / tickStep);
      for (let i = 0; i <= count; i++) {
        const value = r[0] + i * tickStep;
        line(reference, xy(j === 0 ? [value, ylim[0]] : [xlim[0], value]), xy(j === 0 ? [value, ylim[1]] : [xlim[1], value]), 'grid');
        const p = xy(j === 0 ? [value, ylim[0]] : [xlim[0], value]);
        reference.append(node('text', { x: p[0] + (j === 0 ? 0 : -10), y: p[1] + (j === 0 ? 21 : 4), 'text-anchor': j === 0 ? 'middle' : 'end' }, tickLabel(value)));
      }
    }
    svg.insertBefore(reference, svg.querySelector('.axis'));
    const topLeft = xy([xlim[0], ylim[1]]), bottomRight = xy([xlim[1], ylim[0]]);
    const defs = node('defs'), clip = node('clipPath', { id: 'matvec-clip' });
    clip.append(node('rect', { x: topLeft[0], y: topLeft[1], width: bottomRight[0] - topLeft[0], height: bottomRight[1] - topLeft[1] }));
    defs.append(clip); svg.append(defs);
    if (matvecGrid) {
      const group = node('g', { 'clip-path': 'url(#matvec-clip)', 'aria-hidden': 'true' });
      const extent = Math.max(3, ...v.map(Math.abs)), step = extent / 3;
      const transform = p => {
        const target = M.matvec(A, p);
        return p.map((x, j) => (1 - t) * x + t * target[j]);
      };
      for (let i = -3; i <= 3; i++) {
        line(group, xy(transform([i * step, -extent])), xy(transform([i * step, extent])), 'transformed-grid');
        line(group, xy(transform([-extent, i * step])), xy(transform([extent, i * step])), 'transformed-grid');
      }
      svg.append(group);
    }
    line(svg, xy([0, 0]), xy(v), 'vector-v');
    arrow(svg, xy, [0, 0], v, '#365ea0');
    arrow(svg, xy, [0, 0], current, '#ad5d24');
    const p = xy(v), q = xy(current);
    svg.append(node('text', { x: p[0] + 10, y: p[1] - 12, class: 'label', style: 'fill:#365ea0' }, 'v'));
    svg.append(node('text', { x: q[0] + 10, y: q[1] + 20, class: 'label', style: 'fill:#ad5d24' }, t === 1 ? 'Av' : 'w(t)'));
  }
  const chosenMatrix = () => ({ easy: [[2, 1], [1, 2]], cov: S.C, equal: [[2, 0], [0, 2]], zero: [[1, 0], [0, 0]] }[eigenMatrix]);
  function renderEigen() {
    const A = chosenMatrix(), e = M.eigen(A), angle = eigenAngle * Math.PI / 180;
    const v = [Math.cos(angle), Math.sin(angle)], Av = M.matvec(A, v), alpha = M.dot(v, Av), residual = M.norm(Av.map((x, i) => x - alpha * v[i]));
    const svg = $('eigen-plot'), { xy, scale } = plot(svg, { xlim: [-3.5, 3.5], ylim: [-3.5, 3.5] });
    const origin = xy([0, 0]); svg.append(node('circle', { cx: origin[0], cy: origin[1], r: scale, fill: 'none', stroke: '#ccd7cf', 'stroke-width': 1 }));
    arrow(svg, xy, [0, 0], v, '#365ea0', 'v'); arrow(svg, xy, [0, 0], Av, '#ad5d24', 'Av');
    $('eigen-angle-value').textContent = f(eigenAngle, 2) + '°';
    $('eigen-equation').innerHTML = 'A = [[' + A[0].map(x => f(x)).join('; ') + '],<br>[' + A[1].map(x => f(x)).join('; ') + ']]<br>v = ' + vstr(v, 4) + '<br>Av = ' + vstr(Av, 4);
    $('eigen-value').innerHTML = 'λ₁ = ' + f(e.values[0], 4) + ', λ₂ = ' + f(e.values[1], 4) + '<br>' + tr('Odchylka od násobku v', 'Residual from a multiple of v') + ': <strong>' + f(residual, 6) + '</strong>';
    $('eigen-explanation').textContent = e.repeated ? tr('Obě vlastní čísla jsou 2. Každý nenulový vektor je vlastní: A = 2I pouze zdvojnásobuje. Jediný privilegovaný hlavní směr tu neexistuje.', 'Both eigenvalues are 2. Every nonzero vector is an eigenvector: A = 2I only doubles it. There is no unique privileged direction.') : residual < 1e-9 ? tr('Nyní Av = λv, kde λ = ', 'Now Av = λv, with λ = ') + f(alpha, 6) + '. ' + tr('Vektor jsme našli; nula při λ = 0 je také platný obraz.', 'This is an eigenvector; a zero image for λ = 0 is valid too.') : tr('Tyto dvě šipky neleží na téže přímce, takže zvolený v není vlastní vektor. Otáčejte jím nebo použijte tlačítka vlastních směrů. Odchylka je ‖Av − (vᵀAv)v‖ pro jednotkový v.', 'These arrows are not on the same line, so this v is not an eigenvector. Rotate it or use the eigenvector buttons. The residual is ‖Av − (vᵀAv)v‖ for unit v.');
  }
  function renderHand() {
    const lambda = E.values[0], vec = [1, lambda - S.C[0][0]], length = M.norm(vec), u = E.vectors[0], Cu = M.matvec(S.C, u), scaled = u.map(x => lambda * x);
    const content = [
      ['det(C − λI) = 0<br>(5/3 − λ)(2/3 − λ) − 1 = 0<br>λ² − (7/3)λ + 1/9 = 0', tr('Hledáme čísla λ, pro která rovnice (C − λI)v = 0 připouští nenulový vektor. Koeficient 7/3 je součet diagonály; 1/9 je determinant C.', 'Find λ values for which (C − λI)v = 0 has a nonzero solution. The coefficient 7/3 is the diagonal sum; 1/9 is the determinant of C.')],
      ['λ₁,₂ = (7 ± 3√5)/6<br>λ₁ = ' + f(E.values[0], 6) + '<br>λ₂ = ' + f(E.values[1], 6), tr('Větší vlastní číslo bude rozptylem podél PC1. Obě jsou nezáporná. Jejich součet je celkový rozptyl 7/3.', 'The larger eigenvalue will be the variance along PC1. Both are nonnegative. Their sum is the total variance, 7/3.')],
      ['(5/3 − λ₁)v₁ + v₂ = 0<br>v₁ = 1, v₂ = λ₁ − 5/3<br>v = ' + vstr(vec, 6), tr('Zvolíme první souřadnici 1 a dopočítáme druhou. Tento nenulový vektor už je vlastní, ale ještě nemá délku 1.', 'Set the first coordinate to 1 and solve for the second. This nonzero vector already is an eigenvector, but it is not yet unit length.')],
      ['‖v‖ = ' + f(length, 6) + '<br>u₁ = v / ‖v‖ = ' + vstr(u, 6) + '<br>u₂ = ' + vstr(E.vectors[1], 6), tr('Normalizujeme délku, aby projekční variance byla přímo λ. Směr PC1 svírá s kladnou první osou úhel ', 'Normalize the length so projected variance equals λ directly. The angle from the positive first axis to PC1 is ') + f(E.theta * 180 / Math.PI, 4) + '°.'],
      ['Cu₁ = ' + vstr(Cu, 6) + '<br>λ₁u₁ = ' + vstr(scaled, 6) + '<br>‖Cu₁ − λ₁u₁‖ < 10⁻¹²', tr('Obě strany rovnice souhlasí. Opačný vektor −u₁ je stejně správný: změní znaménka skóre, ale ne projekční přímku ani rekonstrukci.', 'Both sides agree. The opposite vector −u₁ is equally valid: it flips score signs, but not the projection line or reconstruction.')]
    ];
    $('hand-content').innerHTML = '<div class="formula">' + content[handStep][0] + '</div><p>' + content[handStep][1] + '</p>';
    document.querySelectorAll('[data-hand-step]').forEach(b => b.setAttribute('aria-pressed', String(Number(b.dataset.handStep) === handStep)));
    const svg = $('hand-plot'), { xy } = plot(svg, { xlim: [-2, 2], ylim: [-2, 2], xlabel: 'xᶜ₁', ylabel: 'xᶜ₂' });
    S.centered.forEach((p, i) => point(svg, xy, p, names[i])); eigArrows(svg, xy, [0, 0], E);
  }
  function renderProjection() {
    const p = M.projection(D, projectionAngle * Math.PI / 180), svg = $('projection-plot');
    const { xy } = plot(svg, { xlim: [-3, 3], ylim: [-2.5, 2.5], xlabel: 'xᶜ₁', ylabel: 'xᶜ₂' });
    line(svg, xy(p.u.map(x => -2.7 * x)), xy(p.u.map(x => 2.7 * x)), '', { stroke: '#ad5d24', 'stroke-width': 2 });
    S.centered.forEach((x, i) => { const z = p.u.map(u => u * p.scores[i]); line(svg, xy(x), xy(z), 'projection'); point(svg, xy, z, '', { fill: '#ad5d24', radius: 4 }); point(svg, xy, x, names[i]); });
    if (showEigen) eigArrows(svg, xy, [0, 0], E, 1.9);
    const strip = $('scores-plot'), W = 560, sy = 62, sx = z => 46 + (z + 2.4) / 4.8 * 468;
    strip.replaceChildren(node('title', {}, tr('Projekční skóre čtyř vzorků', 'Projection scores of four observations')));
    line(strip, [46, sy], [514, sy], 'axis');
    [-2, -1, 0, 1, 2].forEach(z => { line(strip, [sx(z), sy - 4], [sx(z), sy + 4], 'axis'); strip.append(node('text', { x: sx(z), y: sy + 24, 'text-anchor': 'middle' }, String(z))); });
    p.scores.forEach((z, i) => { strip.append(node('circle', { cx: sx(z), cy: sy, r: 5, fill: '#ad5d24' })); strip.append(node('text', { x: sx(z), y: sy - 12 - (i % 2) * 25, 'text-anchor': 'middle' }, names[i])); });
    strip.append(node('text', { x: W - 10, y: 108, 'text-anchor': 'end' }, 'z'));
    $('projection-angle-value').textContent = f(projectionAngle, 2) + '°';
    $('projection-value').innerHTML = 'u = ' + vstr(p.u, 4) + '<br>' + tr('Výběrový rozptyl skóre', 'Sample variance of scores') + ': <strong>' + f(p.variance, 6) + '</strong><br>' + tr('Podíl celkového rozptylu', 'Fraction of total variance') + ': ' + f(p.retained * 100, 2) + ' %';
    $('scores-table').innerHTML = table([tr('Vzorek', 'Sample'), 'zᵢ = (xᵢ − μ)ᵀu'], p.scores.map((z, i) => [names[i], f(z, 6)]));
  }
  function renderReconstruction() {
    const r = M.reconstruction(D, k), svg = $('reconstruction-plot'), { xy } = plot(svg);
    D.forEach((p, i) => { line(svg, xy(p), xy(r.pointsHat[i]), 'help-line'); point(svg, xy, p, names[i], { cls: 'original', radius: 8 }); if (k > 0) point(svg, xy, r.pointsHat[i], '', { cls: 'reconstructed', radius: 5 }); });
    if (!k) point(svg, xy, S.mean, 'μ', { cls: 'reconstructed', radius: 7 });
    $('components-value').textContent = k + ' / 2';
    $('spectrum').innerHTML = r.values.map((lambda, i) => '<div class="bar-group"><span>λ' + (i + 1) + ' = ' + f(lambda, 4) + '</span><div class="bar ' + (i >= k ? 'omitted' : '') + '" style="height:' + Math.max(2, 120 * lambda / r.values[0]) + 'px"></div><span>PC' + (i + 1) + '</span></div>').join('');
    $('spectrum').setAttribute('aria-label', tr('Vlastní čísla ', 'Eigenvalues ') + r.values.map(x => f(x, 6)).join(', ') + tr('; ponecháno komponent: ', '; retained components: ') + k);
    $('reconstruction-value').innerHTML = tr('Zachovaný rozptyl', 'Retained variance') + ': <strong>' + f(r.retained * 100, 2) + ' %</strong><br>MSE = <strong>' + f(r.mse, 6) + '</strong><br>' + tr('Počet souřadnic na vzorek', 'Coordinates per sample') + ': ' + k + ' / 2';
  }
  function renderScaling() {
    let values = D.map(p => [p[0], p[1] * (scaleEight ? 8 : 1)]);
    if (scaleStandard) values = M.standardize(values).points;
    const s = M.stats(values), e = M.eigen(s.C), svg = $('scale-plot');
    const { xy } = plot(svg, scaleStandard ? { xlim: [-2, 2], ylim: [-2, 2], xlabel: 'z₁', ylabel: 'z₂' } : { xlim: [0, 5], ylim: [0, scaleEight ? 26 : 4] });
    values.forEach((p, i) => point(svg, xy, p, names[i]));
    arrow(svg, xy, s.mean, s.mean.map((x, j) => x + (scaleEight && !scaleStandard ? 8 : 1.3) * e.vectors[0][j]), '#365ea0', 'PC1');
    $('scale-matrix').innerHTML = matrix(s.C);
    $('scale-value').innerHTML = 'μ = ' + vstr(s.mean, 3) + '<br>λ₁ = ' + f(e.values[0], 5) + '<br>' + tr('Směr PC1', 'PC1 angle') + ': <strong>' + f(e.theta * 180 / Math.PI, 3) + '°</strong><br>r = ' + f(s.correlation, 5);
  }
  function renderDistance() {
    const nearest = M.nearest(D, query, { metric: distanceMetric, yScale: distanceScale ? 8 : 1 });
    const best = nearest[0], svg = $('distance-plot'), { xy } = plot(svg);
    D.forEach((p, i) => point(svg, xy, p, names[i] + ': ' + (i < 2 ? '0' : '1'), { fill: i < 2 ? '#087b72' : '#365ea0', square: i >= 2 }));
    line(svg, xy(query), xy(D[best.i]), 'projection');
    const q = xy(query), points = Array.from({ length: 10 }, (_, i) => { const angle = i * Math.PI / 5 - Math.PI / 2, radius = i % 2 ? 4.3 : 10; return (q[0] + radius * Math.cos(angle)) + ',' + (q[1] + radius * Math.sin(angle)); }).join(' ');
    svg.append(node('polygon', { points, fill: '#ad5d24' })); svg.append(node('text', { x: q[0] + 11, y: q[1] + 20, class: 'label' }, 'q'));
    $('distance-value').innerHTML = 'q = ' + vstr(query, 2) + '<br>' + tr('Nejbližší vzorek', 'Nearest observation') + ': <strong>' + names[best.i] + '</strong><br>' + tr('Predikovaná třída', 'Predicted class') + ': <strong>' + (best.i < 2 ? 0 : 1) + '</strong>';
    $('distance-table').innerHTML = table([tr('Pořadí', 'Rank'), tr('Vzorek', 'Sample'), 'd(q, x)'], nearest.map((row, i) => [i + 1, names[row.i], f(row.distance, 5)]));
  }
  function renderEvaluation() {
    const explanations = {
      train: tr('Trénink: odhadneme průměry, škály, vlastní směry PCA a parametry klasifikátoru. Všechny další vzorky transformujeme těmito uloženými hodnotami.', 'Training: fit means, scales, PCA directions and classifier parameters. Transform later observations using these stored values.'),
      validation: tr('Validace: porovnáme volby, například počet komponent PCA nebo počet sousedů. Validační výsledek tím používáme k výběru, proto není nedotčeným závěrečným testem.', 'Validation: compare choices such as the PCA component count or neighbour count. Since it guides selection, validation is not an untouched final test.'),
      test: tr('Test: jednou změříme zvolený postup na odložených případech. Po pohledu na test neměníme volby a současně jej dále nevydáváme za nedotčený. Snímky stejného objektu či videa držíme podle úlohy ve stejné skupině.', 'Test: evaluate the chosen procedure on held-out cases. After looking at test results, do not retune and continue calling that set untouched. Depending on the task, keep images of the same object or video in the same group.')
    };
    $('split-explanation').textContent = explanations[split];
    document.querySelectorAll('[data-split]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.split === split)));
    $('prediction-table').innerHTML = table(['i', tr('Skutečná třída', 'True class'), tr('Predikce: klikněte', 'Prediction: click')], truth.map((y, i) => [i + 1, y, '<button type="button" data-prediction="' + i + '" aria-label="' + tr('Změnit predikci vzorku ', 'Change prediction for sample ') + (i + 1) + '">' + predictions[i] + '</button>']));
    const c = M.confusion(truth, predictions);
    $('confusion-table').innerHTML = table([tr('Skutečnost / predikce', 'Truth / prediction'), tr('Pred. 0', 'Pred. 0'), tr('Pred. 1', 'Pred. 1')], [[tr('Skutečná 0', 'True 0'), c.counts[0][0] + ' (TN)', c.counts[0][1] + ' (FP)'], [tr('Skutečná 1', 'True 1'), c.counts[1][0] + ' (FN)', c.counts[1][1] + ' (TP)']]);
    $('evaluation-value').innerHTML = 'Accuracy = <strong>' + f(c.accuracy * 100, 1) + ' %</strong><br>Precision (1) = ' + (c.precision === null ? f(null) : f(c.precision * 100, 1) + ' %') + '<br>Recall (1) = ' + (c.recall === null ? f(null) : f(c.recall * 100, 1) + ' %');
  }
  function renderQuiz() {
    const correct = { scale: '64', pca: 'no', fit: 'train' };
    const explanation = {
      scale: tr('Rozptyl násobíme 8² = 64. Každá odchylka se násobí osmi a pak se umocní.', 'Variance is multiplied by 8² = 64. Each deviation is multiplied by eight and then squared.'),
      pca: tr('PCA nezná třídy. I směr s malým rozptylem může být důležitý pro jejich rozlišení; ověřte to validací.', 'PCA does not use class labels. Even a low-variance direction can matter for separating classes; check this using validation.'),
      fit: tr('Průměr i vlastní směry se učí na tréninku. Na validaci a testu se použije stejná uložená transformace.', 'Fit the mean and directions on training data. Apply the same stored transform to validation and test data.')
    };
    document.querySelectorAll('[data-quiz]').forEach(item => {
      const id = item.dataset.quiz, answer = quizAnswers[id];
      item.querySelectorAll('[data-answer]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.answer === answer)));
      item.querySelector('.quiz-answer').textContent = answer ? (answer === correct[id] ? tr('Správně. ', 'Correct. ') : tr('Zkuste znovu. ', 'Try again. ')) + explanation[id] : '';
    });
  }
  function renderAll() {
    document.documentElement.lang = lang; document.body.dataset.lang = lang;
    document.querySelectorAll('[data-cs][data-en]').forEach(el => el.textContent = el.dataset[lang]);
    document.querySelectorAll('[data-lang-button]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.langButton === lang)));
    document.querySelectorAll('a[data-keep-language]').forEach(a => { const target = new URL(a.getAttribute('href'), location.href); target.searchParams.set('lang', lang); a.href = target.href; }); document.querySelectorAll('[data-course-home]').forEach(a => a.href = 'https://grafitctu.github.io/vyuka/roz/' + (lang === 'en' ? 'en/' : ''));
    if ($('feature-table')) renderFeature(); if ($('center-toggle')) renderCenter(); if ($('variance-feature')) renderVariance(); if ($('cov-preset')) renderCov(); if ($('cov-matrix')) renderMatrix(); if ($('matvec-plot')) renderMatvec(); if ($('eigen-plot')) renderEigen(); if ($('hand-plot')) renderHand(); if ($('projection-plot')) renderProjection(); if ($('reconstruction-plot')) renderReconstruction(); if ($('scale-eight')) renderScaling(); if ($('distance-plot')) renderDistance(); if ($('prediction-majority')) renderEvaluation(); if ($('glossary')) renderQuiz(); updateNav();
  }
  function currentIndex() { let id; try { id = decodeURIComponent(location.hash.slice(1)); } catch { id = 'intro'; } const i = slides.findIndex(s => s.id === id); return i >= 0 ? i : 0; }
  function updateNav() {
    const index = currentIndex(); slides.forEach((s, i) => s.classList.toggle('active', i === index));
    $('topic').innerHTML = slides.map((s, i) => '<option value="' + s.id + '">' + (i + 1) + '. ' + s.dataset[lang === 'cs' ? 'titleCs' : 'titleEn'] + '</option>').join('');
    $('topic').value = slides[index].id; $('slide-counter').textContent = (index + 1) + ' / ' + slides.length;
    $('previous').disabled = index === 0; $('next').disabled = index === slides.length - 1; $('progress').style.width = ((index + 1) / slides.length * 100) + '%'; document.dispatchEvent(new Event('geometry:change')); 
  }
  function go(id) { if (!slides.some(s => s.id === id)) return; if (location.hash !== '#' + id) location.hash = id; updateNav(); if (document.body.dataset.view === 'slides') window.scrollTo({ top: 0 }); else $(id).scrollIntoView(); }
  function move(delta) { const index = Math.max(0, Math.min(slides.length - 1, currentIndex() + delta)); go(slides[index].id); }
  document.addEventListener('click', event => {
    const button = event.target.closest('button'); if (!button) return;
    if (button.dataset.langButton) { lang = button.dataset.langButton; const u = new URL(location.href); u.searchParams.set('lang', lang); history.replaceState(null, '', u); renderAll(); }
    if (button.dataset.go) go(button.dataset.go);
    if (button.dataset.sample !== undefined) { feature = Number(button.dataset.sample); renderFeature(); }
    if (button.dataset.cell) { cell = button.dataset.cell; renderMatrix(); }
    if (button.dataset.handStep !== undefined) { handStep = Number(button.dataset.handStep); renderHand(); }
    if (button.dataset.split) { split = button.dataset.split; renderEvaluation(); }
    if (button.dataset.prediction !== undefined) { const i = Number(button.dataset.prediction); predictions[i] = 1 - predictions[i]; renderEvaluation(); }
    if (button.dataset.answer) { quizAnswers[button.closest('[data-quiz]').dataset.quiz] = button.dataset.answer; renderQuiz(); }
  });
  $('topic')?.addEventListener('change', e => go(e.target.value));
  $('previous')?.addEventListener('click', () => move(-1)); $('next')?.addEventListener('click', () => move(1));
  $('reading')?.addEventListener('click', () => { const read = document.body.dataset.view !== 'read'; document.body.dataset.view = read ? 'read' : 'slides'; $('reading').setAttribute('aria-pressed', String(read)); if (read) $(slides[currentIndex()].id).scrollIntoView(); else window.scrollTo({ top: 0 }); });
  $('print')?.addEventListener('click', () => window.print());
  document.addEventListener('keydown', e => { if (document.body.dataset.view !== 'slides' || e.target.closest('input,select,textarea,button,svg,canvas')) return; if (e.key === 'ArrowRight' || e.key === 'PageDown') { e.preventDefault(); move(1); } if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); move(-1); } });
  window.addEventListener('hashchange', updateNav);
  window.addEventListener('hashchange', () => { if (slides[currentIndex()].id !== 'matvec') stopMatvecAnimation(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) stopMatvecAnimation(); });
  matvecIds.forEach((id, index) => $(id)?.addEventListener('input', () => { if (index < 4) $('matvec-preset').value = 'custom'; readMatvecInputs(); }));
  $('matvec-preset')?.addEventListener('change', event => {
    const preset = matvecPresets[event.target.value]; if (!preset) return;
    stopMatvecAnimation(); matvecA = preset.map(row => [...row]); matvecT = 1; writeMatvecInputs(); renderMatvec();
  });
  $('matvec-reset')?.addEventListener('click', () => {
    stopMatvecAnimation(); matvecA = matvecPresets.example.map(row => [...row]); matvecV = [1, 2]; matvecT = 1; matvecGrid = true;
    $('matvec-preset').value = 'example'; $('matvec-grid').checked = true; writeMatvecInputs(); renderMatvec();
  });
  $('matvec-grid')?.addEventListener('change', e => { matvecGrid = e.target.checked; renderMatvec(); });
  $('matvec-progress')?.addEventListener('input', e => { stopMatvecAnimation(); matvecT = Number(e.target.value) / 100; renderMatvec(); });
  $('matvec-play')?.addEventListener('click', () => {
    if (matvecFrame) { stopMatvecAnimation(); return; }
    const start = performance.now(), reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) { matvecT = 1; renderMatvec(); return; }
    matvecT = 0;
    const animate = now => {
      matvecT = Math.min(1, Math.round((now - start) / 1800 * 100) / 100);
      matvecFrame = matvecT < 1 ? requestAnimationFrame(animate) : 0; renderMatvec();
    };
    matvecFrame = requestAnimationFrame(animate); renderMatvec();
  });
  $('matvec-plot')?.addEventListener('click', event => {
    if (event.button !== 0 || matvecError) return;
    const p = maps.get($('matvec-plot')).inverse(event.clientX, event.clientY);
    stopMatvecAnimation(); matvecV = p.map(x => Math.round(x * 100) / 100); matvecT = 1;
    writeMatvecInputs(); renderMatvec(); $('matvec-plot').focus({ preventScroll: true });
  });
  $('matvec-plot')?.addEventListener('keydown', event => {
    if (!event.key.startsWith('Arrow') || matvecError) return;
    event.preventDefault(); event.stopPropagation(); stopMatvecAnimation();
    const j = event.key === 'ArrowRight' || event.key === 'ArrowLeft' ? 0 : 1;
    matvecV[j] = Math.round((matvecV[j] + (event.key === 'ArrowRight' || event.key === 'ArrowUp' ? .1 : -.1)) * 100) / 100;
    matvecT = 1; writeMatvecInputs(); renderMatvec();
  });
  $('center-toggle')?.addEventListener('change', e => { centered = e.target.checked; renderCenter(); });
  $('variance-feature')?.addEventListener('change', e => { varianceFeature = Number(e.target.value); renderVariance(); });
  $('cov-preset')?.addEventListener('change', e => { covPreset = e.target.value; renderCov(); });
  $('eigen-matrix')?.addEventListener('change', e => { eigenMatrix = e.target.value; renderEigen(); });
  for (const id of ['eigen-angle','projection-angle']) if ($(id)) $(id).step = 'any';
  $('eigen-angle')?.addEventListener('input', e => { eigenAngle = Number(e.target.value); renderEigen(); });
  const setEigen = i => { const e = M.eigen(chosenMatrix()), angle = Math.atan2(e.vectors[i][1], e.vectors[i][0]) * 180 / Math.PI; eigenAngle = (angle % 180 + 180) % 180; $('eigen-angle').value = eigenAngle; renderEigen(); };
  $('eigen-u1')?.addEventListener('click', () => setEigen(0)); $('eigen-u2')?.addEventListener('click', () => setEigen(1));
  $('projection-angle')?.addEventListener('input', e => { projectionAngle = Number(e.target.value); renderProjection(); });
  $('projection-max')?.addEventListener('click', () => { projectionAngle = E.theta * 180 / Math.PI; $('projection-angle').value = projectionAngle; renderProjection(); });
  $('projection-eigen')?.addEventListener('change', e => { showEigen = e.target.checked; renderProjection(); });
  $('projection-plot')?.addEventListener('pointerdown', e => { const p = maps.get($('projection-plot')).inverse(e.clientX, e.clientY); if (Math.hypot(...p) < 1e-8) return; projectionAngle = (Math.atan2(p[1], p[0]) * 180 / Math.PI % 180 + 180) % 180; $('projection-angle').value = projectionAngle; renderProjection(); });
  $('projection-plot')?.addEventListener('keydown', e => { if (!e.key.startsWith('Arrow')) return; e.preventDefault(); e.stopPropagation(); projectionAngle = (projectionAngle + (e.key === 'ArrowRight' || e.key === 'ArrowUp' ? 1 : -1) + 180) % 180; $('projection-angle').value = projectionAngle; renderProjection(); });
  $('components')?.addEventListener('input', e => { k = Number(e.target.value); renderReconstruction(); });
  $('scale-eight')?.addEventListener('change', e => { scaleEight = e.target.checked; renderScaling(); });
  $('scale-standard')?.addEventListener('change', e => { scaleStandard = e.target.checked; renderScaling(); });
  $('distance-metric')?.addEventListener('change', e => { distanceMetric = e.target.value; renderDistance(); });
  $('distance-scale')?.addEventListener('change', e => { distanceScale = e.target.checked; renderDistance(); });
  $('distance-reset')?.addEventListener('click', () => { query = [2.7, 1.1]; renderDistance(); });
  const clampQuery = p => [Math.max(0.5, Math.min(4.5, p[0])), Math.max(0.5, Math.min(3.5, p[1]))];
  $('distance-plot')?.addEventListener('pointerdown', e => { query = clampQuery(maps.get($('distance-plot')).inverse(e.clientX, e.clientY)); renderDistance(); });
  $('distance-plot')?.addEventListener('keydown', e => { if (!e.key.startsWith('Arrow')) return; e.preventDefault(); e.stopPropagation(); query = clampQuery([query[0] + (e.key === 'ArrowRight' ? .1 : e.key === 'ArrowLeft' ? -.1 : 0), query[1] + (e.key === 'ArrowUp' ? .1 : e.key === 'ArrowDown' ? -.1 : 0)]); renderDistance(); });
  $('prediction-perfect')?.addEventListener('click', () => { predictions = [...truth]; renderEvaluation(); });
  $('prediction-majority')?.addEventListener('click', () => { predictions = Array(8).fill(0); renderEvaluation(); });
  let printDetails = [];
  window.addEventListener('beforeprint', () => { stopMatvecAnimation(); matvecT = 1; renderAll(); printDetails = [...document.querySelectorAll('details')].map(d => [d, d.open]); printDetails.forEach(([d]) => d.open = true); });
  window.addEventListener('afterprint', () => printDetails.forEach(([d, open]) => d.open = open));
  window.RozLab = { getReport: () => ({ lang, slide: slides[currentIndex()].id, stats: S, eigen: E, matvec: { A: matvecA.map(row => [...row]), v: [...matvecV], result: M.matvec(matvecA, matvecV), t: matvecT, current: matvecV.map((x, j) => (1 - matvecT) * x + matvecT * M.matvec(matvecA, matvecV)[j]), valid: !matvecError, playing: !!matvecFrame }, eigenDirection: { matrix: chosenMatrix(), angle: eigenAngle }, projection: M.projection(D, projectionAngle * Math.PI / 180), reconstruction: M.reconstruction(D, k), query: [...query], nearest: M.nearest(D, query, { metric: distanceMetric, yScale: distanceScale ? 8 : 1 }), confusion: M.confusion(truth, predictions), quizAnswers: { ...quizAnswers } }) };
  renderAll();
})();
