document.addEventListener('DOMContentLoaded', () => {
  'use strict';
  const {$, t} = RozUI;
  const math = FeatureMath;
  const tiles = JSON.parse($('mc-data').textContent);
  const offsets = {right:[1,0], down:[0,1], left:[-1,0], right2:[2,0]};
  const side = 4, channels = ['R','G'];
  let covarianceCell = [0,1], countCell = [0,3], occurrence = 0;

  function drawTile(id, labels, colours, marks, description) {
    const grid = $(id);
    if (!grid.children.length) {
      for (let k=0; k<side*side; ++k) grid.append(document.createElement('span'));
    }
    labels.forEach((label,k) => {
      const square = grid.children[k], [r,g,b] = colours[k];
      square.textContent = label;
      square.style.backgroundColor = 'rgb('+[r,g,b].join(',')+')';
      square.style.color = 0.299*r+0.587*g+0.114*b > 140 ? '#142326' : '#fff';
      square.dataset.mark = marks.get(k) || '';
    });
    grid.setAttribute('aria-label',description+' · '+Array.from({length:side},(_,y)=>
      labels.slice(y*side,(y+1)*side).join(' / ')).join(' | '));
  }

  function drawMatrix(id, matrix, axes, selected, format) {
    for (const button of $(id).querySelectorAll('button')) {
      const i = Number(button.dataset.row), j = Number(button.dataset.col);
      button.textContent = format(matrix[i][j]);
      button.setAttribute('aria-label',(id==='mc-cov'?'S':'C')+'['+axes[i]+','+axes[j]+'] = '+button.textContent);
      button.setAttribute('aria-pressed',String(i===selected[0] && j===selected[1]));
    }
  }

  function draw(resetCell=false) {
    const locale=t('cs-CZ','en-GB');
    const formatter = new Intl.NumberFormat(locale,{maximumFractionDigits:3});
    const fullPrecision = new Intl.NumberFormat(locale,{maximumFractionDigits:8});
    const f = v => formatter.format(Math.abs(v)<0.0005 ? 0 : v).replace('-','−');
    const exact = v => fullPrecision.format(v).replace('-','−');
    const relation = v => Math.abs(v*1000-Math.round(v*1000)) < 1e-8 ? ' = ' : ' ≈ ';
    const source = $('mc-source').value, tile = tiles[source];
    const pixels = $('mc-order').value==='shuffled' ? [...tile].sort((a,b)=>a[3]-b[3]) : tile;
    const rows = pixels.map(([r,g]) => [Math.floor(r/64),Math.floor(g/64)]);
    const q = pixels.map(([r,g,b]) => Math.floor((r+g+b)/192));
    const levels = Array.from({length:side},(_,y)=>q.slice(y*side,(y+1)*side));
    const pairs = math.pairs(levels,...offsets[$('mc-direction').value]);
    const {counts,total,probabilities} = math.glcm(pairs,4);
    const cov = math.covariance(rows), [k,l] = covarianceCell;
    if (resetCell) {
      countCell = [pairs[0].i,pairs[0].j];
      occurrence = 0;
    }
    const [i,j] = countCell, hits = pairs.filter(p=>p.i===i && p.j===j);
    occurrence = hits.length ? occurrence % hits.length : 0;
    const hit = hits[occurrence], marks = new Map();
    if (hit) {
      marks.set(hit.y*side+hit.x,'A');
      marks.set(hit.toY*side+hit.toX,'B');
    }
    $('mc-origin').hidden = source!=='bark';
    drawTile('mc-rgb',rows.map(r=>r.join(', ')),pixels,new Map([[0,'•']]),t('R a G po řádcích','R and G by row'));
    drawTile('mc-grey',q,q.map(v=>[v*85,v*85,v*85]),marks,t('Úrovně jasu po řádcích','Grey levels by row'));
    drawMatrix('mc-cov',cov.matrix,channels,covarianceCell,f);
    drawMatrix('mc-glcm',counts,[0,1,2,3],countCell,String);

    const productSum = cov.centered.reduce((s,r)=>s+r[k]*r[l],0);
    $('mc-cov-value').textContent = 'S['+channels[k]+','+channels[l]+'] = '+exact(productSum)+' / ('+rows.length+' − 1)'+relation(cov.matrix[k][l])+f(cov.matrix[k][l]);
    $('mc-pixel-term').textContent = t('Označený pixel vlevo nahoře přispívá součinem ','The marked top-left pixel contributes ')+
      '('+f(rows[0][k])+' − '+exact(cov.mean[k])+') × ('+f(rows[0][l])+' − '+exact(cov.mean[l])+') = '+exact(cov.centered[0][k]*cov.centered[0][l])+'.';
    $('mc-glcm-value').textContent = 'C['+i+','+j+'] = '+counts[i][j]+t(' z ',' of ')+total+
      t(' platných dvojic',' valid pairs')+'\nP['+i+','+j+'] = '+counts[i][j]+' / '+total+relation(probabilities[i][j])+f(probabilities[i][j]);
    $('mc-next-pair').disabled = hits.length < 2;
    $('mc-pair-text').textContent = hit
      ? t('Označená dvojice ','Marked pair ')+(occurrence+1)+'/'+hits.length+' · A ('+hit.x+', '+hit.y+') → B ('+hit.toX+', '+hit.toY+').'
      : t('Dvojice '+i+' → '+j+' má v tomto směru nula výskytů.',
          'The pair '+i+' → '+j+' occurs zero times at this offset.');

    let sumA=0, sumB=0;
    counts.forEach((row,a)=>row.forEach((c,b)=>{sumA+=a*c;sumB+=b*c;}));
    const meanA=sumA/total, meanB=sumB/total;
    let cross=0;
    counts.forEach((row,a)=>row.forEach((c,b)=>{cross+=c*(a-meanA)*(b-meanB);}));
    $('mc-neighbour-value').textContent = 'ā'+relation(meanA)+f(meanA)+' · b̄'+relation(meanB)+f(meanB)+' · M = '+total+'\n'+
      'S[A,B]'+relation(cross)+f(cross)+' / ('+total+' − 1)'+relation(cross/(total-1))+f(cross/(total-1));
  }
  function onCell(id, choose) {
    $(id).addEventListener('click',event=>{
      const button = event.target.closest('button');
      if (!button) return;
      choose([Number(button.dataset.row),Number(button.dataset.col)]); draw();
    });
  }
  onCell('mc-cov',cell=>{covarianceCell=cell;});
  onCell('mc-glcm',cell=>{countCell=cell;occurrence=0;});
  $('mc-next-pair').onclick=()=>{occurrence++;draw();};
  $('mc-source').onchange=()=>draw(true);
  for (const id of ['mc-order','mc-direction']) $(id).onchange=()=>{occurrence=0;draw();};
  document.addEventListener('roz-language',()=>draw());
  draw();
},{once:true});
