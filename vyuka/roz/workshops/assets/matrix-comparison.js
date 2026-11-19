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

  function showCovariance(cov, selected, firstRgb, exact, f, relation) {
    const [i,j]=selected, rows=cov.rows, n=rows.length;
    const [a,b]=[channels[i],channels[j]], [meanA,meanB]=[cov.mean[i],cov.mean[j]];
    const total=cov.centered.reduce((sum,row)=>sum+row[i]*row[j],0);
    const entry=cov.matrix[i][j];
    $('mc-cov-value').textContent='S['+a+','+b+'] = '+exact(total)+' / ('+n+' − 1) = '+
      exact(total)+' / '+(n-1)+relation(entry)+f(entry);
    $('mc-pixel-term').textContent=t('U označeného pixelu vlevo nahoře dostaneme ',
                                     'For the marked top-left pixel we get ')+
      '('+rows[0][i]+' − '+exact(meanA)+') × ('+rows[0][j]+' − '+exact(meanB)+') = '+
      exact(cov.centered[0][i]*cov.centered[0][j])+'.';
    if (!$('mc-products')) return; // Older cached pages contain only the two readouts above.

    $('mc-chosen-cell').textContent='S['+a+','+b+']';
    $('mc-jump').textContent=t('Jak vyšlo '+f(entry)+'?','How did we get '+f(entry)+'?');
    $('mc-input-values').textContent=channels.map((ch,c)=>
      ch+' = ⌊'+firstRgb[c]+' / 64⌋ = '+rows[0][c]).join('\n');
    const types=new Map();
    for (const row of rows) {
      const key=row.join(',');
      if (!types.has(key)) types.set(key,{row,count:0});
      types.get(key).count++;
    }
    // Keep the arithmetic in the same order when the student shuffles the tile.
    const groups=[...types.values()].sort((x,y)=>y.row[0]-x.row[0] || y.row[1]-x.row[1]);
    $('mc-pixel-count').textContent=t(
      'Obrázek má '+side+' řádky a '+side+' sloupce. Každý pixel je jedno měření dvojice (R, G).',
      'The image has '+side+' rows and '+side+' columns. Each pixel gives one measurement of (R, G).'
    )+'  n = '+side+' × '+side+' = '+n+'.';
    $('mc-channel-means').textContent=channels.map((name,c)=>{
      const frequencies=new Map();
      for (const {row,count} of groups)
        frequencies.set(row[c],(frequencies.get(row[c]) || 0)+count);
      const terms=[...frequencies].map(([v,count])=>count+' × '+v);
      const sum=rows.reduce((s,row)=>s+row[c],0);
      return name+'̄ = ('+terms.join(' + ')+') / '+n+' = '+sum+' / '+n+' = '+exact(cov.mean[c]);
    }).join('\n');
    const factor=v=>v<0?'('+exact(v)+')':exact(v);
    const terms=[], table=[];
    for (const {row,count} of groups) {
      const da=row[i]-meanA, db=row[j]-meanB, product=da*db;
      table.push(['('+row.join(', ')+')',String(count),factor(da)+' × '+factor(db)+' = '+exact(product)]);
      terms.push(count+' × '+factor(product));
    }
    RozUI.smallTable($('mc-products'),['(R, G)',t('Počet pixelů','Pixel count'),
      t('Součin pro jeden pixel','Product for one pixel')],table);
    $('mc-product-sum').textContent=t('Součet za všech '+n+' pixelů','Sum over all '+n+' pixels')+
      '\n'+terms.join(' + ')+' = '+exact(total);
    $('mc-cov-divisor').textContent=t(
      'Člen −1 pochází ze vzorce pro výběrovou kovarianci. Průměr každého kanálu jsme určili z těchto pixelů. Odchylky od něj sečtené přes celý kanál dají nulu. Jakmile známe '+(n-1)+' odchylek, poslední už je určená.',
      'The −1 comes from the sample covariance formula. We estimated each channel mean from these pixels. The deviations from that mean sum to zero. Once we know '+(n-1)+' deviations, the last one is fixed.'
    )+'  n − 1 = '+n+' − 1 = '+(n-1)+'.';
    let meaning;
    if (i===j) meaning=t('Tato buňka je rozptyl kanálu '+a+'. Každý pixel přispívá čtvercem své odchylky od průměru.',
                        'This cell is the variance of channel '+a+'. Each pixel contributes its squared deviation from the mean.');
    else if (entry<0) meaning=t('Záporné znaménko říká, že v součtu převažují opačné odchylky. Vyšší červená tu zpravidla doprovází nižší zelenou a naopak.',
                                'The negative sign means opposite deviations dominate the sum. Higher red tends to go with lower green, and vice versa.');
    else if (entry>0) meaning=t('Kladné znaménko říká, že v součtu převažují odchylky stejného znaménka. Vyšší červená tu zpravidla doprovází vyšší zelenou.',
                                'The positive sign means deviations of the same sign dominate the sum. Higher red tends to go with higher green.');
    else meaning=t('Součiny odchylek se sečtou na nulu.','The products of deviations sum to zero.');
    $('mc-cov-meaning').textContent=meaning;
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
    const cov = math.covariance(rows);
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

    showCovariance(cov,covarianceCell,pixels[0],exact,f,relation);
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
