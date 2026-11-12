(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.RozMath = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const toy = [[1, 1], [2, 2], [3, 2], [4, 3]];
  const dot = (a, b) => a.reduce((s, x, i) => s + x * b[i], 0);
  const norm = a => Math.hypot(...a);
  const matvec = (A, v) => A.map(row => dot(row, v));
  function validate(points) {
    if (!Array.isArray(points) || points.length < 2 || points.some(p => !Array.isArray(p) || p.length !== 2 || p.some(x => !Number.isFinite(x)))) throw new Error('At least two finite 2D observations are required.');
  }
  function stats(points) {
    validate(points);
    const n = points.length;
    const mean = [0, 1].map(j => points.reduce((s, p) => s + p[j], 0) / n);
    const centered = points.map(p => p.map((x, j) => x - mean[j]));
    const sums = [[0, 0], [0, 0]];
    for (const p of centered) for (let j = 0; j < 2; j++) for (let k = 0; k < 2; k++) sums[j][k] += p[j] * p[k];
    const C = sums.map(row => row.map(x => x / (n - 1)));
    const sd = C.map((row, j) => Math.sqrt(Math.max(0, row[j])));
    const correlation = sd[0] > 0 && sd[1] > 0 ? C[0][1] / (sd[0] * sd[1]) : null;
    return { n, mean, centered, sums, C, sd, correlation };
  }
  function eigen(A) {
    if (!Array.isArray(A) || A.length !== 2 || A.some(r => !Array.isArray(r) || r.length !== 2 || r.some(v => !Number.isFinite(v))) || Math.abs(A[0][1] - A[1][0]) > 1e-12) throw new Error('A finite symmetric 2 by 2 matrix is required.');
    const a = A[0][0], b = A[0][1], c = A[1][1];
    const gap = Math.hypot(a - c, 2 * b);
    const repeated = gap <= 1e-12 * Math.max(1, Math.abs(a), Math.abs(c), Math.abs(b));
    const theta = repeated ? 0 : Math.atan2(2 * b, a - c) / 2;
    const vectors = [[Math.cos(theta), Math.sin(theta)], [-Math.sin(theta), Math.cos(theta)]];
    const values = [(a + c + gap) / 2, (a + c - gap) / 2];
    return { values, vectors, theta, repeated };
  }
  function projection(points, theta) {
    const s = stats(points), u = [Math.cos(theta), Math.sin(theta)];
    const scores = s.centered.map(p => dot(p, u));
    const variance = scores.reduce((sum, z) => sum + z * z, 0) / (points.length - 1);
    const total = s.C[0][0] + s.C[1][1];
    const reconstructed = scores.map(z => s.mean.map((m, j) => m + z * u[j]));
    return { ...s, u, scores, variance, retained: total > 0 ? variance / total : null, reconstructed };
  }
  function reconstruction(points, k) {
    if (![0, 1, 2].includes(k)) throw new Error('k must be 0, 1 or 2.');
    const s = stats(points), e = eigen(s.C);
    const scores = s.centered.map(p => e.vectors.map(u => dot(p, u)));
    const pointsHat = scores.map(z => s.mean.map((m, j) => m + z.slice(0, k).reduce((sum, value, i) => sum + value * e.vectors[i][j], 0)));
    const mse = points.reduce((sum, p, i) => sum + p.reduce((q, value, j) => q + (value - pointsHat[i][j]) ** 2, 0), 0) / (points.length * 2);
    const total = e.values.reduce((sum, x) => sum + x, 0);
    return { ...s, ...e, scores, pointsHat, mse, retained: total > 0 ? e.values.slice(0, k).reduce((sum, x) => sum + x, 0) / total : null };
  }
  function standardize(points) {
    const s = stats(points);
    return { points: s.centered.map(p => p.map((x, j) => s.sd[j] > 0 ? x / s.sd[j] : 0)), constant: s.sd.map(x => x === 0) };
  }
  function nearest(points, query, { metric = 'l2', yScale = 1 } = {}) {
    validate(points);
    if (!['l1', 'l2'].includes(metric) || !Number.isFinite(yScale) || yScale <= 0 || !Array.isArray(query) || query.length !== 2 || query.some(x => !Number.isFinite(x))) throw new Error('Invalid distance arguments.');
    return points.map((p, i) => {
      const d = [Math.abs(p[0] - query[0]), Math.abs((p[1] - query[1]) * yScale)];
      return { i, distance: metric === 'l1' ? d[0] + d[1] : Math.hypot(...d) };
    }).sort((a, b) => a.distance - b.distance || a.i - b.i);
  }
  function confusion(truth, predicted) {
    if (truth.length !== predicted.length || !truth.length || [...truth, ...predicted].some(x => ![0, 1].includes(x))) throw new Error('Binary label arrays of equal nonzero length are required.');
    const counts = [[0, 0], [0, 0]];
    truth.forEach((x, i) => counts[x][predicted[i]]++);
    const [[tn, fp], [fn, tp]] = counts;
    return { counts, accuracy: (tn + tp) / truth.length, precision: tp + fp > 0 ? tp / (tp + fp) : null, recall: tp + fn > 0 ? tp / (tp + fn) : null };
  }
  return { toy, dot, norm, matvec, stats, eigen, projection, reconstruction, standardize, nearest, confusion };
});
