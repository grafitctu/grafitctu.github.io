(() => {
  'use strict';
  const M = window.FeatureMath;
  const { $, all, t, num, vector, print, read, on, readoutRange, table, teal, orange, showSlide } = window.FeatureUI;
  const titles = {
    vertical: ['Svislé pruhy','Vertical stripes'],
    horizontal: ['Vodorovné pruhy','Horizontal stripes'],
    checker: ['Šachovnice','Checkerboard'],
    gray: ['Čtyři odstíny','Four gray values']
  };
  const title = name => t(...titles[name]);
  const palette = [0,85,170,255];
  let image = M.tile('vertical'), step = null, cell = null;

  function pixelStyle(value) {
    return '--pixel:rgb(' + [value,value,value].join(',') + ');--cell-ink:' + (value < 128 ? '#fff' : '#172c35');
  }

  function miniImage(image) {
    return '<div class="pixel-grid mini" aria-hidden="true">' +
      image.flat().map(value => '<span class="pixel" style="' + pixelStyle(value) + '"></span>').join('') + '</div>';
  }

  function renderHistogram() {
    $('histogram-comparison').innerHTML = M.classes.map(name => {
      const patch = M.tile(name);
      const counts = M.histogram(M.quantize(patch,2),2);
      return '<button type="button" class="pattern-card" data-pattern="' + name + '">' +
        '<strong>' + title(name) + '</strong>' + miniImage(patch) + '<span class="feature-bars">' +
        counts.map((count,i) => '<span class="feature-bar"><span>' + i + '</span><span><i style="width:' +
          (100 * count / 36) + '%"></i></span><strong>' + count + '</strong></span>').join('') +
        '</span></button>';
    }).join('');
  }

  function updateImage(bins, selected, last) {
    const container = $('editable-tile');
    if (!container.firstChild) {
      container.innerHTML = '<div class="pixel-grid">' + image.map((row,y) => row.map((_,x) =>
        '<button type="button" class="pixel" data-pixel="' + x + ',' + y + '"></button>'
      ).join('')).join('') + '</div>';
    }
    const highlighted = new Set(selected.flatMap(pair => [
      pair.x + ',' + pair.y, pair.toX + ',' + pair.toY
    ]));
    all('[data-pixel]').forEach(button => {
      const key = button.dataset.pixel;
      const [x,y] = key.split(',').map(Number);
      button.setAttribute('style', pixelStyle(image[y][x]));
      button.textContent = bins[y][x];
      button.dataset.hit = String(highlighted.has(key));
      button.dataset.source = String(last?.x === x && last?.y === y);
      button.dataset.target = String(last?.toX === x && last?.toY === y);
      button.setAttribute('aria-label', t('Pixel ', 'Pixel ') + '(' + x + ', ' + y + '), ' +
        t('jas ', 'brightness ') + image[y][x] + ', ' + t('úroveň ', 'level ') + bins[y][x]);
    });
  }

  function updateMatrix(levels, result) {
    const container = $('glcm-matrix');
    if (container.dataset.levels !== String(levels)) {
      const indices = Array.from({length:levels}, (_,i) => i);
      container.dataset.levels = levels;
      container.innerHTML = '<table class="matrix-table"><thead><tr><th scope="col">i ↘ j</th>' +
        indices.map(j => '<th scope="col">' + j + '</th>').join('') + '</tr></thead><tbody>' +
        indices.map(i => '<tr><th scope="row">' + i + '</th>' + indices.map(j =>
          '<td><button type="button" data-pair-cell="' + i + ',' + j + '"></button></td>'
        ).join('') + '</tr>').join('') + '</tbody></table>';
    }
    all('[data-pair-cell]').forEach(button => {
      const [i,j] = button.dataset.pairCell.split(',').map(Number);
      const count = result.counts[i][j];
      const proportion = result.total ? num(100 * result.probabilities[i][j], 1) + ' %' : '—';
      const selected = cell && cell[0] === i && cell[1] === j;
      button.innerHTML = '<strong>' + count + '</strong><small>' + proportion + '</small>';
      button.setAttribute('aria-pressed', String(Boolean(selected)));
      button.setAttribute('aria-label', i + ' → ' + j + ', ' + t('počet ', 'count ') + count + ', ' + proportion);
      const intensity = result.probabilities[i][j];
      button.style.backgroundColor = selected ? '' : 'rgba(0,109,100,' + (0.04 + 0.37 * intensity) + ')';
    });
  }

  function renderGlcm() {
    const levels = read('gray-levels');
    const distance = read('pair-distance');
    const [dx,dy] = {right:[distance,0],down:[0,distance],diagonal:[distance,distance]}[$('direction').value];
    const bins = M.quantize(image, levels);
    const ordered = M.pairs(bins, dx, dy);
    if (step === null) step = ordered.length;
    step = Math.min(step, ordered.length);
    const symmetrical = $('symmetry').checked;
    const result = M.glcm(ordered, levels, symmetrical, step);
    const selected = cell ? ordered.slice(0, step).filter(({i,j}) =>
      (cell[0] === i && cell[1] === j) || (symmetrical && cell[0] === j && cell[1] === i)
    ) : [];
    const last = cell ? selected[0] : ordered[step - 1];
    updateImage(bins, selected, last);
    updateMatrix(levels, result);
    readoutRange('pair-distance');
    $('pair-advance').disabled = step >= ordered.length;
    print('pair-detail', last ?
      '(' + last.x + ', ' + last.y + ') → (' + last.toX + ', ' + last.toY + '), ' +
        t('úrovně ', 'levels ') + last.i + ' → ' + last.j :
      t('Přičtěte první dvojici nebo vyberte neprázdnou buňku.', 'Count the first pair or select a non-empty cell.'));
    print('pair-total', 'Δ = ' + vector([dx,dy]) + ' · ' + t('Prošlé dvojice ', 'Pairs visited ') + step + '/' + ordered.length +
      ' · Σ C = ' + result.total);
    print('glcm-selected', cell ?
      'C[' + cell.join(', ') + '] = ' + result.counts[cell[0]][cell[1]] + ' · ' +
        t('podíl ', 'share ') + (result.total ? num(100 * result.probabilities[cell[0]][cell[1]], 1) + ' %' : '—') :
      t('Každá buňka uvádí počet dvojic a podíl z dosud započtených.', 'Each cell shows a count and a share of all entries counted so far.'));
    const features = result.features;
    $('glcm-features').innerHTML = table([t('Příznak','Feature'), t('Hodnota','Value')], [
      [t('Kontrast','Contrast'), num(features?.contrast)],
      [t('Homogenita','Homogeneity'), num(features?.homogeneity)],
      ['ASM', num(features?.asm)]
    ]);
    print('tile-histogram', t('Histogram úrovní ', 'Level histogram ') + vector(M.histogram(bins,levels)));
  }

  function switchPattern(name) {
    $('tile-preset').value = name;
    image = M.tile(name);
    step = null;
    cell = null;
    renderGlcm();
  }

  function renderClassifier() {
    const method = $('texture-features').value;
    const r = M.textureClassification(method, read('classifier-offset'), $('patch-noise').checked);
    $('classifier-offset').disabled = method === 'histogram';
    readoutRange('classifier-offset');
    $('texture-prototypes').innerHTML = table([t('Reference','Reference'), t('Vektor příznaků','Feature vector')],
      r.prototypes.map(({name,features}) => [title(name), vector(features)]));
    $('classified-tiles').innerHTML = r.probes.map((probe,i) => {
      const result = probe.prediction === null ? 'tie' : probe.prediction === probe.name ? 'correct' : 'wrong';
      const prediction = probe.prediction === null ? t('Remíza', 'Tie') : title(probe.prediction);
      return '<article class="patch-card" data-result="' + result + '"><strong>' + t('Výřez ', 'Patch ') + (i+1) +
        '</strong><div class="patch-body">' + miniImage(probe.image) + '<p><b>' + t('Třída', 'Class') + '</b> ' + title(probe.name) +
        '<br><b>' + t('Odhad', 'Prediction') + '</b> ' + prediction + '<br>x = ' + vector(probe.features) +
        '<br>' + t('Vzdálenosti ', 'Distances ') + vector(probe.distances) + '</p></div></article>';
    }).join('');
    const correct = r.probes.filter(p => p.prediction === p.name).length;
    const tied = r.probes.filter(p => p.prediction === null).length;
    print('classifier-result', t('Správně ', 'Correct ') + correct + '/' + r.probes.length +
      ' · ' + t('Chybně ', 'Wrong ') + (r.probes.length - correct - tied) + ' · ' + t('Remízy ', 'Ties ') + tied);
    print('confusion-method', method === 'histogram' ? t('Příznakový vektor z histogramu', 'Histogram feature vector') :
      t('Kontrast ve dvou směrech', 'Contrast in two directions') + ' · d = ' + read('classifier-offset'));
    const predictions = [...M.classes,null];
    $('patch-confusion').innerHTML = table([t('Skutečná třída','True class'), ...M.classes.map(title), t('Remíza','Tie')],
      M.classes.map(name => [title(name), ...predictions.map(label =>
        r.probes.filter(probe => probe.name === name && probe.prediction === label).length
      )]));
  }

  function drawMask(canvas, points, moments, bounds) {
    const ctx = canvas.getContext('2d');
    const [minX,maxX,minY,maxY] = bounds;
    const columns = maxX - minX + 1, rows = maxY - minY + 1;
    const side = Math.min((canvas.width - 50) / columns, (canvas.height - 48) / rows);
    const left = (canvas.width - side * columns) / 2, top = (canvas.height - side * rows) / 2;
    const xPixel = value => left + (value - minX) * side;
    const yPixel = value => top + (value - minY) * side;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = teal;
    for (const [x,y] of points) ctx.fillRect(xPixel(x), yPixel(y), side, side);
    ctx.strokeStyle = '#d4e0dc';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i <= columns; i++) {
      const x = left + i * side;
      ctx.moveTo(x,top); ctx.lineTo(x,top + rows * side);
    }
    for (let j = 0; j <= rows; j++) {
      const y = top + j * side;
      ctx.moveTo(left,y); ctx.lineTo(left + columns * side,y);
    }
    ctx.stroke();
    const [cx,cy] = moments.centroid;
    const mx = xPixel(cx) + side/2, my = yPixel(cy) + side/2;
    ctx.strokeStyle = 'white'; ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(mx-11,my); ctx.lineTo(mx+11,my);
    ctx.moveTo(mx,my-11); ctx.lineTo(mx,my+11);
    ctx.stroke();
    ctx.strokeStyle = orange; ctx.lineWidth = 3; ctx.stroke();
    ctx.fillStyle = '#172c35'; ctx.font = '16px Arial';
    ctx.fillText('x →',left + columns * side - 26,top - 6);
    ctx.fillText('y ↓',left - 23,top + 14);
  }

  function renderMoments() {
    const original = M.masks[$('shape').value];
    const moved = M.moveMask(original, read('rotation'), read('scale'), read('shift-x'), read('shift-y'));
    const area = $('moment-method').value === 'area';
    const a = M.moments(original, area), b = M.moments(moved, area);
    const allPoints = original.concat(moved);
    const x = allPoints.map(([x]) => x), y = allPoints.map(([,y]) => y);
    const bounds = [Math.min(...x)-1, Math.max(...x)+1, Math.min(...y)-1, Math.max(...y)+1];
    drawMask($('mask-original'),original,a,bounds);
    drawMask($('mask-moved'),moved,b,bounds);
    for (const id of ['scale','shift-x','shift-y']) readoutRange(id, id === 'scale' ? '×' : '');
    $('moments-values').innerHTML = table([t('Veličina','Quantity'),t('Původní','Original'),t('Transformovaná','Transformed')], [
      ['m₀₀',num(a.m00),num(b.m00)], ['m₁₀',num(a.m10),num(b.m10)], ['m₀₁',num(a.m01),num(b.m01)],
      [t('Těžiště','Centroid'),vector(a.centroid),vector(b.centroid)],
      ['μ₂₀',num(a.mu20),num(b.mu20)], ['μ₀₂',num(a.mu02),num(b.mu02)], ['μ₁₁',num(a.mu11),num(b.mu11)],
      ['η₂₀',num(a.eta20,6),num(b.eta20,6)], ['η₀₂',num(a.eta02,6),num(b.eta02,6)], ['η₁₁',num(a.eta11,6),num(b.eta11,6)],
      ['φ₁',num(a.hu[0],6),num(b.hu[0],6)], ['φ₂',num(a.hu[1],6),num(b.hu[1],6)]
    ]);
    print('moments-change', t('Rozdíl invariantů', 'Invariant difference') + ' (Δφ₁, Δφ₂) = ' +
      '(' + num(b.hu[0]-a.hu[0],7) + t('; ', ', ') + num(b.hu[1]-a.hu[1],7) + ')');
  }

  on('histogram-comparison','click',event => {
    const button = event.target.closest('[data-pattern]');
    if (button) { switchPattern(button.dataset.pattern); showSlide('glcm'); }
  });
  on('tile-preset','change',event => switchPattern(event.target.value));
  for (const [id,type] of [['gray-levels','change'],['direction','change'],['pair-distance','input']]) {
    on(id,type,() => { step = null; cell = null; renderGlcm(); });
  }
  on('symmetry','change',renderGlcm);
  on('pair-start','click',() => { step = 0; cell = null; renderGlcm(); });
  on('pair-advance','click',() => { step++; cell = null; renderGlcm(); });
  on('pair-all','click',() => { step = null; cell = null; renderGlcm(); });
  on('glcm-matrix','click',event => {
    const button = event.target.closest('[data-pair-cell]');
    if (button) { cell = button.dataset.pairCell.split(',').map(Number); renderGlcm(); }
  });
  on('editable-tile','click',event => {
    const button = event.target.closest('[data-pixel]');
    if (!button) return;
    const [x,y] = button.dataset.pixel.split(',').map(Number);
    const i = palette.indexOf(image[y][x]);
    image[y][x] = palette[(i + 1) % palette.length];
    renderGlcm();
  });
  on('texture-features','change',renderClassifier);
  on('classifier-offset','input',renderClassifier);
  on('patch-noise','change',renderClassifier);
  for (const id of ['shape','rotation','moment-method']) on(id,'change',renderMoments);
  for (const id of ['scale','shift-x','shift-y']) on(id,'input',renderMoments);
  function render() { renderHistogram(); renderGlcm(); renderClassifier(); renderMoments(); }
  document.addEventListener('feature-language',render);
  render();
})();
