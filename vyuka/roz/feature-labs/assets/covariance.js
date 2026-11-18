(() => {
  'use strict';
  const M = window.FeatureMath;
  const { $, all, t, num, vector, print, read, on, readoutRange, table, plotting, teal, orange } = window.FeatureUI;
  const presets = {
    positive: [[1,1],[2,3],[3,2],[4,4]],
    negative: [[1,4],[2,2],[3,3],[4,1]],
    line: [[1,1],[2,2],[3,3],[4,4]],
    equal: [[1,1],[1,4],[4,1],[4,4]]
  };
  const names = ['A','B','C','D'];
  let rows, stats;
  let cell = [0,1], angle = 0;
  const offset = (center, direction, distance) => center.map((value, i) => value + direction[i] * distance);
  const pointLabel = i => names[i];

  function makeSampleTable() {
    $('sample-table').innerHTML = table([t('Vzorek','Sample'), 'x₁', 'x₂', 'x₁ − μ₁', 'x₂ − μ₂'],
      rows.map((row, i) => [
        pointLabel(i),
        ...row.map((value,j) => '<input type="number" min="-20" max="20" step="0.25" value="' + value +
          '" data-sample="' + i + ',' + j + '" aria-label="' + pointLabel(i) + ', x' + (j + 1) + '">'),
        '<span data-centered="' + i + ',0"></span>', '<span data-centered="' + i + ',1"></span>'
      ]));
  }

  function renderMatrix() {
    for (const node of all('[data-centered]')) {
      const [i,j] = node.dataset.centered.split(',').map(Number);
      node.textContent = num(stats.centered[i][j]);
    }
    print('sample-mean', 'μ = ' + vector(stats.mean) + (read('feature-scale') !== 1 ?
      ' · ' + t('x₂ v tomto výpočtu násobíme třemi', 'x₂ is multiplied by three in this calculation') : ''));
    if (!$('cov-matrix').firstChild) {
      $('cov-matrix').innerHTML = '<table class="matrix-table"><tbody>' + [0,1].map(i => '<tr>' +
        [0,1].map(j => '<td><button type="button" data-cov-cell="' + i + ',' + j +
          '" aria-label="C ' + (i + 1) + ' ' + (j + 1) + '"></button></td>').join('') + '</tr>').join('') + '</tbody></table>';
    }
    for (const node of all('[data-cov-cell]')) {
      const [i,j] = node.dataset.covCell.split(',').map(Number);
      node.textContent = num(stats.matrix[i][j], 4);
      node.setAttribute('aria-pressed', String(i === cell[0] && j === cell[1]));
    }
    const [i,j] = cell;
    const products = stats.centered.map(row => row[i] * row[j]);
    const total = M.sum(products);
    const subs = ['₁','₂'];
    print('cov-formula', 'C' + subs[i] + subs[j] + ' = ' + num(total) + ' / (' + stats.rows.length + ' − 1) = ' + num(stats.matrix[i][j], 5));
    $('cov-products').innerHTML = table([t('Vzorek','Sample'), 'x' + subs[i] + ' − μ' + subs[i], 'x' + subs[j] + ' − μ' + subs[j],
      t('Součin','Product')], stats.centered.map((row,k) => [pointLabel(k), num(row[i]), num(row[j]), num(products[k])]));
    print('correlation', stats.correlation === null ?
      t('Korelace není definována při nulovém rozptylu.', 'Correlation is undefined when a variance is zero.') :
      'r₁₂ = C₁₂ / √(C₁₁ C₂₂) = ' + num(stats.correlation, 4));
  }

  function createPlot(id, radius) {
    const [x,y] = stats.mean;
    return plotting($(id), x-radius, x+radius, y-radius, y+radius, 'x₁', 'x₂', true);
  }

  function samples(plot, selected = null) {
    plot.point(stats.mean, '#465a63', 'cross', 10);
    stats.rows.forEach((row, i) => {
      plot.point(row, teal, 'dot', i === selected ? 10 : 6);
      plot.label(row, pointLabel(i), teal, 10, -12);
    });
  }

  function renderDistance() {
    const model = M.distanceModel(stats, $('distance-mode').value);
    const length = read('distance-length');
    const probes = stats.eigen.axes.map(axis => axis.map(x => length * x));
    const radius = Math.max(2.1, length, 2 * Math.sqrt(model.values[0]), ...stats.centered.map(row => Math.hypot(...row))) * 1.18;
    const plot = createPlot('distance-chart', radius);
    if (model.invertible) {
      const ellipse = Array.from({length: 97}, (_, i) => {
        const phi = 2 * Math.PI * i / 96;
        return stats.mean.map((value,j) => value + 2 * (
          model.axes[0][j] * Math.sqrt(model.values[0]) * Math.cos(phi) +
          model.axes[1][j] * Math.sqrt(model.values[1]) * Math.sin(phi)
        ));
      });
      plot.line(ellipse, teal, 3);
    }
    probes.forEach((delta, i) => {
      const probe = offset(stats.mean, delta, 1);
      plot.line([stats.mean, probe], orange, 3, i ? [8,5] : []);
      plot.point(probe, orange, 'open', 9);
      plot.label(probe, i ? 'P₂' : 'P₁', orange, 12, i ? -12 : 19);
    });
    samples(plot);
    readoutRange('distance-length');
    $('distance-values').innerHTML = table([t('Bod','Point'), t('Posun','Offset'), 'dᴱ', 'dᴹ'],
      probes.map((delta, i) => {
        const result = M.distances(delta, model);
        return [i ? 'P₂' : 'P₁', vector(delta), num(result.euclidean), num(result.mahalanobis)];
      }));
    print('distance-message', model.invertible ?
      t('P₁ směřuje podél PC1, P₂ podél PC2 původní kovariance.', 'P₁ follows PC1 and P₂ follows PC2 of the original covariance.') :
      t('Použitá matice je singulární. Inverzi získáte například přidáním 0,1 I.', 'This matrix is singular. Try adding 0.1 I to obtain an invertible matrix.'));
  }

  function renderProjection() {
    const result = M.projection(stats, angle);
    const radius = 1.22 * Math.max(1, ...stats.centered.map(row => Math.hypot(...row)));
    const plot = createPlot('projection-chart', radius);
    const drawAxis = (axis, color, dash) => plot.line([
      offset(stats.mean, axis, -radius * 0.9), offset(stats.mean, axis, radius * 0.9)
    ], color, 3, dash);
    drawAxis(result.axis, teal, []);
    drawAxis(stats.eigen.axes[0], orange, [9,6]);
    result.scores.forEach((z, i) => {
      const projected = offset(stats.mean, result.axis, z);
      plot.line([stats.rows[i], projected], '#849794', 2, [5,5]);
      plot.point(projected, teal, 'open', 7);
    });
    samples(plot);
    print('axis-angle-value', num(angle * 180 / Math.PI, 1) + '°');
    print('axis-variance', t('Rozptyl průmětů', 'Projection variance') + ' = ' + num(result.variance, 5));
    print('axis-vector', 'u = ' + vector(result.axis) + ' · z = ' + vector(result.scores));
    const total = M.sum(stats.eigen.values);
    $('pca-eigen').innerHTML = table([t('Složka','Component'), t('Směr u','Direction u'), 'λ', t('Podíl rozptylu','Variance share')],
      stats.eigen.values.map((value, i) => ['PC' + (i + 1), vector(stats.eigen.axes[i]), num(value, 4),
        total > 0 ? num(100 * value / total, 2) + ' %' : '—']));
    print('pca-axis-note', stats.eigen.repeated ?
      t('Stejná vlastní čísla. Osa s největším rozptylem není určena jednoznačně.',
        'Equal eigenvalues. The direction maximizing variance is not unique.') :
      t('Oranžová PC1 má největší rozptyl λ₁. Znaménko směru můžeme obrátit.', 'Orange PC1 maximizes variance at λ₁. Either sign of its direction is valid.'));
  }

  function renderReconstruction() {
    const count = read('component-count'), chosen = read('chosen-sample');
    const result = M.reconstruct(stats, count);
    const radius = 1.22 * Math.max(1, ...stats.centered.map(row => Math.hypot(...row)));
    const plot = createPlot('reconstruction-chart', radius);
    result.estimates.forEach((estimate,i) => {
      plot.line([stats.rows[i], estimate], i === chosen ? orange : '#aab4b4', i === chosen ? 4 : 2, [5,5]);
    });
    samples(plot, chosen);
    result.estimates.forEach((estimate,i) => plot.point(estimate, i === chosen ? orange : '#46665e', 'square', i === chosen ? 8 : 5));
    readoutRange('component-count');
    print('reconstruction-variance', t('Zachovaný rozptyl', 'Retained variance') + ' = ' +
      (result.fraction === null ? '—' : num(100 * result.fraction, 3) + ' %'));
    print('reconstruction-coordinate', names[chosen] + ' · z = ' + vector(result.scores[chosen].slice(0, count)) +
      ' · x̂ = ' + vector(result.estimates[chosen]));
    print('reconstruction-error', '‖x − x̂‖² = ' + num(result.errors[chosen], 5) + ' · ' +
      t('Průměr čtverců vzdáleností všech bodů', 'Mean squared distance across all points') + ' = ' + num(result.mse, 5));
    $('reconstruction-table').innerHTML = table([t('Bod','Point'), 'x', 'x̂'],
      stats.rows.map((row, i) => [names[i], vector(row), vector(result.estimates[i])]));
  }

  function render() {
    const scale = read('feature-scale');
    stats = M.covariance(rows.map(([x,y]) => [x,y * scale]));
    renderMatrix();
    renderDistance();
    renderProjection();
    renderReconstruction();
  }

  function selectPreset() {
    rows = presets[$('sample-preset').value].map(row => row.slice());
    makeSampleTable();
    render();
  }
  on('sample-preset','change',selectPreset);
  on('reset-samples','click',() => {
    $('feature-scale').value = '1';
    selectPreset();
  });
  on('sample-table','input',event => {
    const input = event.target.closest('[data-sample]');
    if (!input || input.value === '' || !Number.isFinite(input.valueAsNumber)) return;
    const [i,j] = input.dataset.sample.split(',').map(Number);
    const value = Math.min(20, Math.max(-20, input.valueAsNumber));
    rows[i][j] = value;
    if (value !== input.valueAsNumber) input.value = value;
    render();
  });
  on('sample-table','focusout',event => {
    const input = event.target.closest('[data-sample]');
    if (!input) return;
    const [i,j] = input.dataset.sample.split(',').map(Number);
    input.value = rows[i][j];
  });
  on('cov-matrix','click',event => {
    const button = event.target.closest('[data-cov-cell]');
    if (!button) return;
    cell = button.dataset.covCell.split(',').map(Number);
    renderMatrix();
  });
  on('axis-angle','input',() => {
    angle = read('axis-angle') * Math.PI / 180;
    renderProjection();
  });
  on('use-pc1','click',() => {
    angle = stats.eigen.angle;
    $('axis-angle').value = Math.round(180 * angle / Math.PI);
    renderProjection();
  });
  on('feature-scale','change',render);
  on('distance-length','input',renderDistance);
  on('distance-mode','change',renderDistance);
  on('component-count','input',renderReconstruction);
  on('chosen-sample','change',renderReconstruction);
  document.addEventListener('feature-language',() => { makeSampleTable(); render(); });
  selectPreset();
})();
