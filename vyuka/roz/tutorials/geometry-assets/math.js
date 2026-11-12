/* Pure numerical routines. No DOM, network, or student labels in PCA. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.GeometryMath = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const TAU = 2 * Math.PI;
  function rng(seed = 42) {
    let state = seed >>> 0;
    return function () {
      state += 0x6D2B79F5;
      let t = state;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function normal(random) {
    return Math.sqrt(-2 * Math.log(Math.max(random(), 1e-15))) * Math.cos(TAU * random());
  }
  function cloud(kind = 'cloud', seed = 42) {
    const random = rng(seed), points = [], labels = [];
    const theta = 35 * Math.PI / 180, ct = Math.cos(theta), st = Math.sin(theta);
    if (kind === 'isotropic') {
      // Exact angular symmetry, not merely an approximately circular random sample.
      for (let ring = 1; ring <= 20; ring++) for (let j = 0; j < 24; j++) {
        const radius = 3 * Math.sqrt((ring - .5) / 20), a = TAU * j / 24;
        points.push([radius * Math.cos(a) + 1.4, radius * Math.sin(a) + .8]);
      }
    } else for (let i = 0; i < 480; i++) {
      if (kind === 'classes') {
        const label = i % 2;
        points.push([2.9 * normal(random) + 1.4, (label ? .72 : -.72) + .11 * normal(random) + .8]);
        labels.push(label);
      } else {
        const a = 2.55 * normal(random), b = .58 * normal(random);
        points.push([ct * a - st * b + 1.4, st * a + ct * b + .8]);
      }
    }
    if (kind === 'outlier') points.push([32, -26]);
    return {points, labels, seed, synthetic: true, kind};
  }
  function moons(seed = 17) {
    const random = rng(seed), points = [];
    for (let branch = 0; branch < 2; branch++) for (let i = 0; i < 120; i++) {
      const t = Math.PI * i / 119;
      points.push(branch === 0
        ? [Math.cos(t) + .026 * normal(random), Math.sin(t) + .026 * normal(random)]
        : [1 - Math.cos(t) + .026 * normal(random), .5 - Math.sin(t) + .026 * normal(random)]);
    }
    for (let i = 0; i < 24; i++) points.push([-1.4 + 3.8 * random(), -.9 + 2.2 * random()]);
    return {points, seed, synthetic: true, kind: 'moons'};
  }
  function validate(points) {
    if (points.length < 2 || points.some(p => p.length !== 2 || !p.every(Number.isFinite))) {
      throw new Error('Expected at least two finite 2D points.');
    }
  }
  function mean(points) {
    validate(points);
    return points.reduce((sum, p) => [sum[0] + p[0] / points.length, sum[1] + p[1] / points.length], [0, 0]);
  }
  function covariance(points) {
    const mu = mean(points), n = points.length;
    let xx = 0, xy = 0, yy = 0;
    for (const p of points) {
      const x = p[0] - mu[0], y = p[1] - mu[1];
      xx += x * x; xy += x * y; yy += y * y;
    }
    return {mean: mu, matrix: [[xx / (n - 1), xy / (n - 1)], [xy / (n - 1), yy / (n - 1)]], n};
  }
  function eigen2(matrix) {
    const a = matrix[0][0], b = matrix[0][1], d = matrix[1][1];
    const trace = a + d, gap = Math.hypot(a - d, 2 * b);
    let angle = .5 * Math.atan2(2 * b, a - d);
    angle = (angle % Math.PI + Math.PI) % Math.PI;
    return {values: [Math.max(0, (trace + gap) / 2), Math.max(0, (trace - gap) / 2)],
      angle, vectors: [[Math.cos(angle), Math.sin(angle)], [-Math.sin(angle), Math.cos(angle)]],
      degenerate: gap <= 1e-10 * Math.max(1, Math.abs(trace)), zero: trace <= 1e-14};
  }
  function project(points, angle) {
    const stats = covariance(points), u = [Math.cos(angle), Math.sin(angle)];
    const scores = [], projected = [];
    let sumSquares = 0, squaredError = 0;
    for (const p of points) {
      const dx = p[0] - stats.mean[0], dy = p[1] - stats.mean[1], z = dx * u[0] + dy * u[1];
      scores.push(z); sumSquares += z * z;
      const q = [stats.mean[0] + z * u[0], stats.mean[1] + z * u[1]];
      projected.push(q); squaredError += (p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2;
    }
    const totalVariance = stats.matrix[0][0] + stats.matrix[1][1];
    return {...stats, direction: u, scores, projected, variance: sumSquares / (points.length - 1),
      mse: squaredError / points.length,
      explainedRatio: totalVariance > 1e-14 ? sumSquares / (points.length - 1) / totalVariance : null,
      totalVariance, eigen: eigen2(stats.matrix)};
  }
  function preprocess(points, {standardize = false, yScale = 1} = {}) {
    const raw = points.map(p => [p[0], p[1] * yScale]);
    if (!standardize) return raw;
    const c = covariance(raw), sx = Math.sqrt(c.matrix[0][0]), sy = Math.sqrt(c.matrix[1][1]);
    return raw.map(p => [(p[0] - c.mean[0]) / (sx || 1), (p[1] - c.mean[1]) / (sy || 1)]);
  }
  function dbscan(points, eps = .18, minSamples = 6) {
    validate(points);
    if (!(eps > 0) || !Number.isInteger(minSamples) || minSamples < 1) throw new Error('Invalid DBSCAN parameters.');
    const n = points.length, neighbors = points.map(() => []), cutoff = eps * eps;
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      const d2 = (points[i][0] - points[j][0]) ** 2 + (points[i][1] - points[j][1]) ** 2;
      if (d2 <= cutoff + 1e-14) neighbors[i].push(j); // Includes the selected point itself.
    }
    const core = neighbors.map(a => a.length >= minSamples), labels = Array(n).fill(-2);
    let clusterCount = 0;
    for (let i = 0; i < n; i++) {
      if (labels[i] !== -2) continue;
      if (!core[i]) {labels[i] = -1; continue;}
      labels[i] = clusterCount;
      const queue = [i];
      for (let at = 0; at < queue.length; at++) for (const j of neighbors[queue[at]]) {
        if (labels[j] === -2) {
          labels[j] = clusterCount;
          if (core[j]) queue.push(j);
        } else if (labels[j] === -1) labels[j] = clusterCount;
      }
      clusterCount++;
    }
    return {labels, core, neighbors, clusterCount,
      coreCount: core.filter(Boolean).length,
      borderCount: labels.filter((label, i) => label >= 0 && !core[i]).length,
      noiseCount: labels.filter(label => label === -1).length};
  }
  return {rng, normal, cloud, moons, mean, covariance, eigen2, project, preprocess, dbscan};
});
