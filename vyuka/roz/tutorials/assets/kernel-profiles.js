(() => {
  'use strict';
  const slide = document.getElementById('svm-margin');
  const probe = document.getElementById('kernel-probe');
  if (!slide || !probe) return;

  // A horizontal section through the fixed reference z = (1, 0), with x = (t, 0).
  const reference = 1;
  const linear = t => t * reference;
  const rbf = (t, gamma) => Math.exp(-gamma * (t - reference) ** 2);
  const xMin = Number(probe.min), xMax = Number(probe.max);
  const left = 35, right = 259, top = 17, bottom = 123;
  const px = t => left + (t - xMin) / (xMax - xMin) * (right - left);
  const ink = '#40565d', grid = '#d7e1df', teal = '#08796f', orange = '#a84d12';
  const svgNS = 'http://www.w3.org/2000/svg';

  function draw(svg, kind, t, gamma, number) {
    const isLinear = kind === 'linear';
    const min = isLinear ? -2.2 : -0.06, max = isLinear ? 3.2 : 1.12;
    const py = value => bottom - (value - min) / (max - min) * (bottom - top);
    const score = isLinear ? linear : position => rbf(position, gamma);
    const layer = document.createDocumentFragment();
    function add(tag, attrs, label) {
      const el = document.createElementNS(svgNS, tag);
      for (const [key, value] of Object.entries(attrs)) el.setAttribute(key, value);
      if (label !== undefined) el.textContent = label;
      layer.append(el);
    }
    function text(x, y, value, anchor = 'middle') {
      add('text', {x, y, 'text-anchor': anchor, 'font-size': 13, fill: ink}, value);
    }
    for (const value of isLinear ? [-2, 0, 1, 3] : [0, 0.5, 1]) {
      const y = py(value);
      add('line', {x1: left, x2: right, y1: y, y2: y, stroke: value === 0 ? ink : grid});
      text(left - 6, y + 4, number(value), 'end');
    }
    for (let position = xMin; position <= xMax; position++) {
      const x = px(position);
      add('line', {x1: x, x2: x, y1: bottom, y2: bottom + 3, stroke: ink});
      text(x, bottom + 18, number(position));
    }
    text(right + 11, bottom + 18, 't');
    text(left, top - 5, 'K', 'start');
    add('line', {x1: px(reference), x2: px(reference), y1: top, y2: bottom,
                 stroke: ink, 'stroke-dasharray': '4 4'});
    text(px(reference), top - 5, 'z');

    const samples = isLinear ? 1 : 160;
    const points = [];
    for (let i = 0; i <= samples; i++) {
      const position = xMin + i / samples * (xMax - xMin);
      points.push(px(position).toFixed(2) + ',' + py(score(position)).toFixed(2));
    }
    add('polyline', {points: points.join(' '), fill: 'none', stroke: teal,
                     'stroke-width': 3, 'stroke-linejoin': 'round'});
    add('circle', {cx: px(t), cy: py(score(t)), r: 5.3, fill: orange, stroke: '#fff', 'stroke-width': 1.6});
    svg.replaceChildren(layer);
  }

  const dropdown = slide.querySelector('[data-margin-kernel]');
  const gammaInput = slide.querySelector('[data-margin-gamma]');
  const bank = window.GeometrySvmModels.datasets;
  const gammaValues = [...new Set(bank.blobs.models.filter(m => m.kernel === 'rbf').map(m => m.gamma))].sort((a,b) => a-b);
  const positionOutput = slide.querySelector('[data-kernel-position]');
  const linearOutput = slide.querySelector('[data-kernel-result="linear"]');
  const rbfOutput = slide.querySelector('[data-kernel-result="rbf"]');
  const distanceOutput = slide.querySelector('[data-kernel-distance]');
  const charts = slide.querySelectorAll('[data-kernel-chart]');

  function render() {
    const t = Number(probe.value);
    const model = window.GeometryExtensions.getSvm();
    const gamma = model.kernel === 'rbf' ? model.gamma : gammaValues[Number(gammaInput.value)];
    const formatter = new Intl.NumberFormat(document.documentElement.lang, {maximumFractionDigits: 4});
    const number = value => formatter.format(value).replace('-', '−');
    const result = rbf(t, gamma), distanceSquared = (t - reference) ** 2;
    const scientific = new Intl.NumberFormat(document.documentElement.lang, {notation: 'scientific', maximumFractionDigits: 2});
    const value = result < 0.001 ? scientific.format(result).replace('-', '−') :
      result.toLocaleString(document.documentElement.lang, {maximumFractionDigits: 3});
    positionOutput.textContent = 't = ' + number(t);
    linearOutput.textContent = number(t) + ' × 1 + 0 × 0 = ' + number(linear(t));
    distanceOutput.textContent = 'd² = (' + number(t) + ' − 1)² = ' + number(distanceSquared);
    rbfOutput.textContent = 'exp(−' + number(gamma) + ' × ' + number(distanceSquared) + ')' +
      (distanceSquared === 0 ? ' = ' : ' ≈ ') + value;
    for (const svg of charts) draw(svg, svg.dataset.kernelChart, t, gamma, number);
  }
  probe.addEventListener('input', render);
  dropdown.addEventListener('change', render);
  gammaInput.addEventListener('input', render);
  document.addEventListener('geometry:change', render);
  render();
})();
