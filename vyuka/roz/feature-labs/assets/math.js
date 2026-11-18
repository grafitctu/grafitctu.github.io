(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.FeatureMath = factory();
})(globalThis, function () {
  'use strict';

  const sum = values => values.reduce((total, value) => total + value, 0);
  const dot = (a, b) => sum(a.map((value, i) => value * b[i]));
  const subtract = (a, b) => a.map((value, i) => value - b[i]);
  const zeros = size => Array.from({length: size}, () => Array(size).fill(0));

  function eigen2(a, b, d) {
    const radius = Math.hypot(a - d, 2 * b);
    const angle = radius === 0 ? 0 : Math.atan2(2 * b, a - d) / 2;
    return {
      angle,
      values: [Math.max(0, (a + d + radius) / 2), Math.max(0, (a + d - radius) / 2)],
      axes: [[Math.cos(angle), Math.sin(angle)], [-Math.sin(angle), Math.cos(angle)]],
      repeated: radius <= 1e-10 * Math.max(1, a + d)
    };
  }

  function covariance(rows) {
    if (rows.length < 2 || rows.some(row => row.length !== 2 || !row.every(Number.isFinite))) {
      throw new Error('Use at least two rows with two finite numbers.');
    }
    const mean = [0, 1].map(j => sum(rows.map(row => row[j])) / rows.length);
    const centered = rows.map(row => subtract(row, mean));
    const matrix = [0, 1].map(i => [0, 1].map(j =>
      sum(centered.map(row => row[i] * row[j])) / (rows.length - 1)
    ));
    const [a, b] = matrix[0];
    const d = matrix[1][1];
    return {
      rows, mean, centered, matrix, eigen: eigen2(a, b, d),
      correlation: a > 0 && d > 0 ? b / Math.sqrt(a * d) : null
    };
  }

  function projection(stats, angle) {
    const axis = [Math.cos(angle), Math.sin(angle)];
    const scores = stats.centered.map(row => dot(row, axis));
    return {axis, scores, variance: sum(scores.map(x => x * x)) / (scores.length - 1)};
  }

  function reconstruct(stats, keep) {
    const {axes, values} = stats.eigen;
    const scores = stats.centered.map(row => axes.map(axis => dot(row, axis)));
    const estimates = scores.map(row => stats.mean.map((mean, j) =>
      mean + sum(row.slice(0, keep).map((value, i) => value * axes[i][j]))
    ));
    const errors = estimates.map((row, i) => {
      const delta = subtract(row, stats.rows[i]);
      return dot(delta, delta);
    });
    const trace = sum(values);
    return {
      scores, estimates, errors, mse: sum(errors) / errors.length,
      fraction: trace > 0 ? sum(values.slice(0, keep)) / trace : null
    };
  }

  function distanceModel(stats, mode) {
    const [a, b] = stats.matrix[0];
    const d = stats.matrix[1][1];
    const epsilon = mode === 'ridge' ? 0.1 : 0;
    const eigen = eigen2(a + epsilon, mode === 'diagonal' ? 0 : b, d + epsilon);
    return { ...eigen, epsilon, invertible: eigen.values[1] > 1e-10 * Math.max(1, eigen.values[0]) };
  }

  function distances(delta, model) {
    const euclidean = Math.hypot(...delta);
    if (!model.invertible) return {euclidean, mahalanobis: null, parts: null};
    const parts = model.axes.map((axis, i) => dot(delta, axis) ** 2 / model.values[i]);
    return {euclidean, mahalanobis: Math.sqrt(sum(parts)), parts};
  }

  const size = 6;
  const classes = ['vertical', 'horizontal', 'checker'];
  function tile(kind, phase = 0) {
    return Array.from({length: size}, (_, y) => Array.from({length: size}, (_, x) => {
      if (kind === 'gray') return [0, 85, 170, 255][(x + y * 2) % 4];
      const name = kind === 'horizontal' ? y : kind === 'checker' ? x + y : x;
      return ((name + phase) % 2) * 255;
    }));
  }

  function quantize(image, levels) {
    return image.map(row => row.map(value => Math.floor(value * levels / 256)));
  }

  function histogram(image, levels) {
    const counts = Array(levels).fill(0);
    image.forEach(row => row.forEach(value => counts[value]++));
    return counts;
  }

  function pairs(image, dx, dy) {
    const result = [];
    image.forEach((row, y) => row.forEach((i, x) => {
      const j = image[y + dy]?.[x + dx];
      if (j !== undefined) result.push({x, y, toX: x + dx, toY: y + dy, i, j});
    }));
    return result;
  }

  function glcm(pairsForOffset, levels, symmetrize = false, limit = pairsForOffset.length) {
    const counts = zeros(levels);
    const used = pairsForOffset.slice(0, limit);
    for (const {i, j} of used) {
      counts[i][j]++;
      if (symmetrize) counts[j][i]++;
    }
    const total = used.length * (symmetrize ? 2 : 1);
    const probabilities = counts.map(row => row.map(value => total ? value / total : 0));
    const features = {contrast: 0, homogeneity: 0, asm: 0};
    if (!total) return {counts, total, probabilities, features: null};
    probabilities.forEach((row, i) => row.forEach((p, j) => {
      const gap = (i - j) ** 2;
      features.contrast += gap * p;
      features.homogeneity += p / (1 + gap);
      features.asm += p * p;
    }));
    return {counts, total, probabilities, features};
  }

  function textureFeatures(image, type, offset) {
    const bins = quantize(image, 2);
    if (type === 'histogram') {
      return histogram(bins, 2).map(value => value / (size * size));
    }
    return [[offset, 0], [0, offset]].map(([dx, dy]) =>
      glcm(pairs(bins, dx, dy), 2).features.contrast
    );
  }

  function textureClassification(type, offset, perturb) {
    const prototypes = classes.map(name => ({
      name, features: textureFeatures(tile(name), type, offset)
    }));
    const names = ['vertical', 'checker', 'horizontal', 'horizontal', 'vertical', 'checker'];
    const probes = names.map((name, index) => {
      // Larger parent tiles would have the same local phase; these six tiles are
      // fixed classroom examples, with no expectation of a benchmark result.
      const image = tile(name, 1);
      if (perturb) {
        const y = index % size;
        const x = (index + 1) % size;
        image[y][x] = 255 - image[y][x];
        image[y][(x + 1) % size] = 255 - image[y][(x + 1) % size];
      }
      const features = textureFeatures(image, type, offset);
      const distances = prototypes.map(prototype => Math.hypot(...subtract(features, prototype.features)));
      const best = Math.min(...distances);
      const winners = classes.filter((_, i) => Math.abs(distances[i] - best) < 1e-10);
      return {name, image, features, distances, prediction: winners.length === 1 ? winners[0] : null};
    });
    return {prototypes, probes};
  }

  const masks = {
    elbow: [[0,0],[0,1],[0,2],[0,3],[1,3],[2,3]],
    rectangle: [[0,0],[1,0],[2,0],[3,0],[0,1],[1,1],[2,1],[3,1]]
  };
  function moveMask(points, turn, scale, dx, dy) {
    const rotated = points.map(([x, y]) => [[x,y], [-y,x], [-x,-y], [y,-x]][turn]);
    const minX = Math.min(...rotated.map(([x]) => x));
    const minY = Math.min(...rotated.map(([, y]) => y));
    const result = [];
    for (const [x, y] of rotated) {
      for (let j = 0; j < scale; j++) {
        for (let i = 0; i < scale; i++) {
          result.push([(x - minX) * scale + i + dx, (y - minY) * scale + j + dy]);
        }
      }
    }
    return result;
  }

  function moments(points, area = false) {
    if (points.length === 0) return null;
    const m00 = points.length;
    const m10 = sum(points.map(([x]) => x));
    const m01 = sum(points.map(([, y]) => y));
    const centroid = [m10 / m00, m01 / m00];
    const centered = points.map(row => subtract(row, centroid));
    // A unit square has second centered integral 1/12 along each axis.
    const correction = area ? m00 / 12 : 0;
    const mu20 = sum(centered.map(([x]) => x * x)) + correction;
    const mu02 = sum(centered.map(([, y]) => y * y)) + correction;
    const mu11 = sum(centered.map(([x, y]) => x * y));
    const eta20 = mu20 / m00 ** 2;
    const eta02 = mu02 / m00 ** 2;
    const eta11 = mu11 / m00 ** 2;
    const hu = [eta20 + eta02, (eta20 - eta02) ** 2 + 4 * eta11 ** 2];
    return {m00, m10, m01, centroid, mu20, mu02, mu11, eta20, eta02, eta11, hu};
  }

  // These scores are deliberately made up. They have no link to a sensor,
  // commercial model, biometric sample or attack artifact.
  const verification = {
    mated: [34,48,59,63,69,71,73,76,80,83,85,87,89,91,94,97],
    nonmated: [7,14,18,20,25,28,32,34,38,42,45,50,54,61,65,74]
  };
  const padData = {
    bonaFide: [[80,85],[95,91],[70,68],[84,49],[89,64],[58,77],[63,72],[78,58]],
    simulated: [[91,13],[85,34],[75,46],[62,53],[54,32],[70,68],[87,24],[39,61]]
  };

  function verificationErrors(threshold) {
    const miss = verification.mated.filter(score => score < threshold).length;
    const falseMatch = verification.nonmated.filter(score => score >= threshold).length;
    return {miss, falseMatch, positives: verification.mated.length, negatives: verification.nonmated.length};
  }

  function padErrors(matchThreshold, padThreshold, usePad) {
    const pass = ([match, pad]) => match >= matchThreshold && (!usePad || pad >= padThreshold);
    return {
      errors: padData.bonaFide.filter(([, pad]) => pad < padThreshold).length,
      missedAttacks: padData.simulated.filter(([, pad]) => pad >= padThreshold).length,
      genuineAccepted: padData.bonaFide.filter(pass).length,
      attackAccepted: padData.simulated.filter(pass).length,
      genuine: padData.bonaFide.length, attacks: padData.simulated.length
    };
  }

  return {
    dot, sum, subtract, covariance, projection, reconstruct, distanceModel, distances,
    size, classes, tile, quantize, histogram, pairs, glcm, textureClassification,
    masks, moveMask, moments, verification, padData, verificationErrors, padErrors
  };
});
