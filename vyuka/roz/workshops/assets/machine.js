/* Shared classroom calculations. No network access or trained weights. */
(function (root) {
  'use strict';
  function folds(rows, mode) {
    const models = [], predictions = Array(rows.length);
    for (let fold = 0; fold < 6; fold++) {
      const train = [], test = [];
      rows.forEach((r,i) => (r[mode] === fold ? test : train).push(i));
      const mean = Array(8).fill(0), scale = Array(8).fill(0);
      for (const i of train) rows[i].f.forEach((v,k) => {mean[k] += v;});
      mean.forEach((_,k) => {mean[k] /= train.length;});
      for (const i of train) rows[i].f.forEach((v,k) => {scale[k] += (v-mean[k])**2;});
      scale.forEach((v,k) => {scale[k] = v > 0 ? Math.sqrt(v/train.length) : 1;});
      const z = rows.map(r => r.f.map((v,k) => (v-mean[k])/scale[k]));
      const model = {train, test, mean, scale, z};
      models.push(model);
      for (const i of test) {
        let nearest = train[0], best = Infinity;
        for (const j of train) {
          const d = squaredDistance(z[i],z[j]);
          if (d < best || (d === best && rows[j].id < rows[nearest].id)) {
            nearest = j;
            best = d;
          }
        }
        predictions[i] = {nearest, c:rows[nearest].c, distance:Math.sqrt(best), fold};
      }
    }
    return {models,predictions};
  }

  function squaredDistance(a,b) {
    let sum = 0;
    for (let k = 0; k < a.length; k++) sum += (a[k]-b[k])**2;
    return sum;
  }

  function summarize(rows, run, fold) {
    const matrix = Array.from({length:6},() => Array(6).fill(0));
    const tested = [], shared = new Set();
    let correct = 0, same = 0;
    const overlap = run.models.map(model => {
      const trainParents = new Set(model.train.map(i => rows[i].p));
      return new Set(model.test.map(i => rows[i].p).filter(p => trainParents.has(p)));
    });
    rows.forEach((r,i) => {
      const p = run.predictions[i];
      if (fold !== -1 && p.fold !== fold) return;
      tested.push(i);
      matrix[r.c][p.c]++;
      if (p.c === r.c) correct++;
      if (rows[p.nearest].p === r.p) same++;
      if (overlap[p.fold].has(r.p)) shared.add(r.p);
    });
    return {matrix,tested,correct,same,shared:shared.size};
  }

  function mapScores(gt, prediction) {
    // Scan order keeps the tie rule independent of the numeric names of the labels.
    const refs = [...new Set(gt)];
    const labs = [...new Set(prediction)];
    const refAt = new Map(refs.map((v,i) => [v,i])), predAt = new Map(labs.map((v,i) => [v,i]));
    const matrix = refs.map(() => labs.map(() => 0));
    gt.forEach((v,i) => {matrix[refAt.get(v)][predAt.get(prediction[i])]++;});
    const sizes = matrix.map(row => row.reduce((a,b) => a+b,0));
    const areas = labs.map((_,j) => matrix.reduce((acc,row) => acc+row[j],0));
    let credited = 0, best = -1, ca = 0;
    for (let i=0;i<refs.length;i++) for (let j=0;j<labs.length;j++) {
      const n=matrix[i][j];
      if (4*n>=3*sizes[i] && 4*n>=3*areas[j]) credited+=n;
    }
    // For these classroom maps K <= 3. Enumerate the padded one-to-one assignments.
    const size=Math.max(refs.length,labs.length);
    function assign(i,used,overlap,weighted) {
      if(i===size) {
        if(overlap>best) {best=overlap;ca=weighted;}
        return;
      }
      for(let j=0;j<size;j++) if(!(used&(1<<j))) {
        const n=matrix[i]?.[j]??0;
        const add=n?sizes[i]*n/(sizes[i]+areas[j]-n):0;
        assign(i+1,used|(1<<j),overlap+n,weighted+add);
      }
    }
    assign(0,0,0,0);
    return {matrix,refs,labs,cs:credited/gt.length,ca:ca/gt.length,credited};
  }
  function cropLevels(encoded) {
    const packed = atob(encoded), a = new Uint8Array(4096);
    for(let i=0;i<packed.length;i++) for(let j=0;j<4;j++) a[4*i+j] = (packed.charCodeAt(i)>>(6-2*j))&3;
    return a;
  }
  root.RozMachine = {folds, summarize, squaredDistance, mapScores, cropLevels};
  if(typeof module!=='undefined' && module.exports) module.exports=root.RozMachine;
})(globalThis);
