document.addEventListener('DOMContentLoaded', () => {
  'use strict';
  const {$, t, num} = RozUI;
  const root = $('pca-steps') || $('pca-reel');
  const canvas = $('seq-plot'), g = canvas.getContext('2d');
  const width = canvas.width, height = canvas.height;
  const data = $('seq-data');
  const raw = JSON.parse(data.textContent);
  const stats = FeatureMath.covariance(raw.map(([h, w]) => [h / 5, w / 4]));
  const points = stats.centered, [pc1, pc2] = stats.eigen.axes;
  const scores = points.map(p => FeatureMath.dot(p, pc1));
  const radius = Math.max(...points.flat().map(Math.abs)) * 1.18;
  const A = data.dataset.matrix ? JSON.parse(data.dataset.matrix) : stats.matrix;
  const blue = '#24648a', rust = '#af4723', gold = '#a26b0e', teal = '#08796b', ink = '#203a42';
  const captions = [...root.querySelectorAll('[data-seq-panel]')];
  const stagePicker = $('seq-stage');
  const stretchPicker = $('seq-stretch-matrix');
  const stretchCases = [...root.querySelectorAll('[data-stretch-case]')];
  let stage = 1, cell = [0, 1];

  const value = id => Number($(id).value);
  const n = (x, digits=2) => num(Math.abs(x) < 0.5 * 10 ** -digits ? 0 : x, digits);
  const pair = (p, digits=2) => '(' + p.map(x => n(x, digits)).join(t('; ', ', ')) + ')';
  const transform = (p, matrix=A) => matrix.map(row => FeatureMath.dot(row, p));
  const scaled = (p, s) => p.map(v => s * v);
  const blend = (p, q, f) => p.map((v, i) => v + f * (q[i] - v));
  const unit = degrees => {
    const radians = degrees * Math.PI / 180;
    return [Math.cos(radians), Math.sin(radians)];
  };
  const reading = (...lines) => { $('seq-reading').textContent = lines.join('\n'); };
  const rangeLabel = (id, suffix='') => { $(id+'-val').textContent = $(id).value + suffix; };

  function line(p, q, colour, thickness=1, dash=[]) {
    g.beginPath(); g.setLineDash(dash);
    g.moveTo(...p); g.lineTo(...q); g.strokeStyle=colour; g.lineWidth=thickness; g.stroke();
    g.setLineDash([]);
  }
  function dot(p, colour, r=4, hollow=false) {
    g.beginPath(); g.arc(...p, r, 0, 2*Math.PI);
    if (hollow) { g.strokeStyle=colour; g.lineWidth=2; g.stroke(); }
    else { g.fillStyle=colour; g.fill(); }
  }
  function label(str, x, y, colour=ink, align='left') {
    g.font='15px "Segoe UI", sans-serif'; g.textAlign=align; g.fillStyle=colour;
    g.fillText(str, x, y);
  }
  function arrow(from, to, colour, thickness=3) {
    line(from, to, colour, thickness);
    const angle=Math.atan2(to[1]-from[1], to[0]-from[0]);
    for (const side of [-1,1])
      line(to,[to[0]-9*Math.cos(angle+side*0.46),to[1]-9*Math.sin(angle+side*0.46)],colour,thickness);
  }
  function plane(limit, xName, yName) {
    const ox=width/2, oy=height/2, scale=(height/2-38)/limit;
    const at=([x,y])=>[ox+x*scale,oy-y*scale];
    line([18,oy],[width-18,oy],'#a9bcb8'); line([ox,17],[ox,height-16],'#a9bcb8');
    for (let k=-Math.floor(limit); k<=Math.floor(limit); k++) {
      if (k===0) continue;
      const [x,y]=at([k,k]);
      line([x,oy-3],[x,oy+3],'#91a6a1'); line([ox-3,y],[ox+3,y],'#91a6a1');
      label(String(k),x,oy+18,'#647973','center');
    }
    label(xName,width-17,oy-9,ink,'right'); label(yName,ox+9,22);
    return at;
  }
  function axis(at, u, extent, colour, thickness=1.5, dash=[]) {
    line(at(scaled(u,-extent)),at(scaled(u,extent)),colour,thickness,dash);
  }
  function drawTransform() {
    const f=value('seq-transform')/100, v=[2,-0.5], av=transform(v);
    const at=plane(3,'x','y'), moved=p=>at(blend(p,transform(p),f));
    g.save(); g.beginPath(); g.rect(14,28,width-28,height-48); g.clip();
    for (let k=-6;k<=6;k++) {
      line(at([k,-8]),at([k,8]),'#e4eae5'); line(at([-8,k]),at([8,k]),'#e4eae5');
      line(moved([k,-8]),moved([k,8]),'#adcbc4'); line(moved([-8,k]),moved([8,k]),'#adcbc4');
    }
    g.restore();
    const start=at([0,0]), before=at(v), current=moved(v);
    arrow(start,before,blue,4); arrow(start,current,rust,2.5); dot(start,ink,3);
    label('v',before[0]+8,before[1]+15,blue);
    label(f===1?'Av':t('v průběhu','in motion'),current[0]+8,current[1]-9,rust);
    rangeLabel('seq-transform',' %');
    reading(t('První řádek','First row')+'   '+n(A[0][0])+' × 2 + '+n(A[0][1])+' × ('+n(-.5,1)+') = '+n(av[0],3),
            t('Druhý řádek','Second row')+'   '+n(A[1][0])+' × 2 + '+n(A[1][1])+' × ('+n(-.5,1)+') = '+n(av[1],3),
            t('Poloha šipky při zvoleném posunu','Arrow at the selected position')+'   '+pair(blend(v,av,f),3));
  }
  function drawDirections() {
    const at=plane(2.35,'x','y'), origin=at([0,0]);
    let previous=[1,0];
    for (let angle=4;angle<=360;angle+=4) {
      const u=unit(angle);
      line(at(previous),at(u),'#9bb9c9'); line(at(transform(previous)),at(transform(u)),'#ce9b77');
      previous=u;
    }
    for (let angle=0;angle<360;angle+=45) line(origin,at(transform(unit(angle))),'#d1c0ad');
    const u=unit(value('seq-direction')), au=transform(u);
    axis(at,u,2.25,'#789193',1,[4,4]); arrow(origin,at(u),blue,4); arrow(origin,at(au),rust,2.5);
    const [x,y]=at(u), [xx,yy]=at(au);
    label('u',x+6,y+17,blue); label('Au',xx+6,yy-7,rust);
    rangeLabel('seq-direction','°');
    const cross=u[0]*au[1]-u[1]*au[0], along=FeatureMath.dot(u,au);
    let verdict;
    if (Math.abs(cross)<1e-8) {
      // u has unit length, so u·Au is the signed multiplier on an eigenline.
      const factor=along.toLocaleString(t('cs-CZ','en-GB'),{maximumFractionDigits:2});
      verdict=t('Obě šipky leží na stejné přímce. Našli jste vlastní vektor.',
                'Both arrows lie on the same line. You found an eigenvector.')+' Au = '+factor+'u.';
    } else {
      const heading=n(Math.atan2(au[1],au[0])*180/Math.PI);
      const gap=n(Math.atan2(Math.abs(cross),along)*180/Math.PI);
      verdict=t(`Oranžová šipka míří pod úhlem ${heading}°. S modrou šipkou svírá úhel ${gap}°.`,
                `The orange arrow points at ${heading}°. The angle between the two arrows is ${gap}°.`);
    }
    const rowProducts=A.map((row,i)=>
      n(row[0])+' × ('+n(u[0],3)+') + '+n(row[1])+' × ('+n(u[1],3)+') ≈ '+n(au[i],3));
    reading('u ≈ '+pair(u,3)+'     Au ≈ '+pair(au,3),
            t('První řádek','First row')+'   '+rowProducts[0],
            t('Druhý řádek','Second row')+'   '+rowProducts[1]);
    if ($('seq-alignment')) $('seq-alignment').textContent=verdict;
    else $('seq-reading').append('\n'+verdict);
  }
  function drawStretch() {
    const selected=value('seq-eigen'), name=stretchPicker?.value || 'A';
    let matrix=A;
    for (const panel of stretchCases) {
      panel.hidden=panel.dataset.stretchCase!==name;
      if (!panel.hidden) matrix=JSON.parse(panel.dataset.entries);
    }
    // These examples share both eigenlines. Integer vectors make the row products exact.
    const vectors=[[1,1],[-1,1]];
    const images=vectors.map(v=>transform(v,matrix));
    const factors=images.map((mv,i)=>FeatureMath.dot(vectors[i],mv)/FeatureMath.dot(vectors[i],vectors[i]));
    const fmt=x=>x.toLocaleString(t('cs-CZ','en-GB'),{maximumFractionDigits:3});
    const coords=p=>'('+p.map(fmt).join(t('; ', ', '))+')';
    const left=67, along=x=>left+(width-left-35)*x/3.2;
    line([along(1),60],[along(1),262],'#94aaa5',1.4,[4,4]);
    label(t('původní délka 1','original length 1'),along(1),44,ink,'center');
    factors.forEach((factor,i)=>{
      const length=Math.abs(factor);
      const y=110+102*i, colour=i===0?gold:teal;
      label(i===0?'45°':'135°',18,y+5,colour);
      line([left,y+13],[along(3.1),y+13],'#cbd9d3');
      arrow([left,y],[along(length),y],colour,selected===i?5:2.5);
      label('× '+fmt(length),along(length),y-15,colour,'center');
    });
    for (const q of [0,.5,1,1.5,2,2.5,3]) label(fmt(q),along(q),287,'#4d6663','center');
    const symbol=name==='3I'?'(3I)':name, factor=fmt(factors[selected]);
    const lambda=selected===0?'λ₁':'λ₂', angle=selected===0?'45°':'135°';
    // For (1,1) use the first row. For (−1,1) use the second row, whose input coordinate is +1.
    const diagonal=matrix[selected][selected], offDiagonal=matrix[selected][1-selected];
    const equation=angle+' · '+lambda+' = '+fmt(diagonal)+(selected===0?' + ':' − ')+fmt(offDiagonal)+' = '+factor;
    const factorLabel=$('seq-stretch-factor');
    if (factorLabel) factorLabel.textContent=equation;
    const v=coords(vectors[selected]), mv=coords(images[selected]);
    reading(t('Na této přímce zvolíme','On this line choose')+' v = '+v+'.   '+symbol+'v = '+mv+' = '+factor+' · '+v+'.',
            t('Pro jednotkovou šipku','For the unit arrow')+' u = v/√2   ⇒   '+symbol+'u = '+factor+'u.   '+lambda+' = '+factor+'.');
  }
  function drawCovariance() {
    const [i,j]=cell, names=['h','w'], at=plane(radius,names[i],names[j]);
    points.forEach(p=>dot(at([p[i],p[j]]),'#418b82',3.8));
    const p=points[0]; dot(at([p[i],p[j]]),rust,6);
    for (const button of root.querySelectorAll('[data-sigma]')) {
      const [row,column]=button.dataset.sigma.split('').map(Number);
      button.textContent=n(stats.matrix[row][column],2);
      button.setAttribute('aria-label','Σ['+names[row]+', '+names[column]+'] = '+button.textContent);
      button.setAttribute('aria-pressed',String(i===row&&j===column));
    }
    const total=points.reduce((s,p)=>s+p[i]*p[j],0);
    reading(t('První měření po centrování a převodu jednotek','First measurement after centring and rescaling')+'   '+pair(p,1),
            t('Jeho příspěvek','Its contribution')+'   '+n(p[i],1)+' × '+n(p[j],1)+' = '+n(p[i]*p[j],2),
            'Σ['+names[i]+', '+names[j]+'] = '+n(total,2)+' / ('+points.length+' − 1) = '+n(stats.matrix[i][j],2));
  }
  function drawAxes() {
    const at=plane(radius,'h','w'), extent=radius*1.05, angle=value('seq-axis'), u=unit(angle);
    points.forEach(p=>dot(at(p),'#629b94',3.6));
    axis(at,pc1,extent,gold,2.7); axis(at,pc2,extent,teal,2.5);
    axis(at,u,extent,ink,1.4,[6,4]);
    [pc1,pc2].forEach((axis,i)=>{const [x,y]=at(scaled(axis,extent));label(i===0?'PC1':'PC2',x+5,y-5,i===0?gold:teal);});
    rangeLabel('seq-axis','°');
    const variance=FeatureMath.projection(stats,angle*Math.PI/180).variance;
    reading(t('Rozptyl ve zvoleném směru','Variance along the trial axis')+'   uᵀΣu = '+n(variance,3),
            'λ₁ = '+n(stats.eigen.values[0],1)+'     λ₂ = '+n(stats.eigen.values[1],1)+'     PC1 = 80 %');
  }
  function drawProjection() {
    const at=plane(radius,'h','w'), selected=value('seq-point')-1, f=value('seq-project')/100;
    axis(at,pc1,radius*1.3,gold,2);
    points.forEach((p,i)=>{
      const target=scaled(pc1,scores[i]);
      line(at(p),at(target),'#d5dfd8'); dot(at(p),'#c9d5d0',2.5);
      dot(at(blend(p,target,f)),'#39877d',3.4);
    });
    const p=points[selected], z=scores[selected], target=scaled(pc1,z);
    line(at(p),at(target),rust,2,[4,3]); dot(at(p),rust,7,true); dot(at(blend(p,target,f)),rust,5);
    const [x,y]=at(target); label('z',x+8,y-7,rust);
    rangeLabel('seq-point'); rangeLabel('seq-project',' %');
    reading('x = '+pair(p,3)+'     u₁ = '+pair(pc1,3),
            'z = '+n(pc1[0],3)+' × ('+n(p[0],3)+') + '+n(pc1[1],3)+' × ('+n(p[1],3)+') ≈ '+n(z,3),
            t('Průmět v původních osách','Projection in the original axes')+'   z u₁ = '+pair(target,3));
  }
  function drawHistogram() {
    const bins=value('seq-bins'), low=Math.min(...scores), high=Math.max(...scores);
    const buckets=Array.from({length:bins},()=>[]);
    scores.forEach((z,i)=>buckets[Math.min(bins-1,Math.floor((z-low)/(high-low)*bins))].push(i));
    const left=49, baseline=height-52, span=width-left-26, binWidth=span/bins;
    const peak=Math.max(...buckets.map(group=>group.length));
    const rowHeight=Math.min(25,(baseline-45)/peak), size=Math.min(7,binWidth*.34,rowHeight*.36);
    line([left,baseline],[left+span,baseline],ink,1.6);
    const selected=value('seq-point')-1;
    buckets.forEach((group,j)=>{
      const x=left+(j+.5)*binWidth;
      line([left+j*binWidth,baseline],[left+j*binWidth,baseline+5],'#a3b7b2');
      group.forEach((id,row)=>dot([x,baseline-(row+.5)*rowHeight],id===selected?rust:teal,size));
    });
    const zx=left+span*(0-low)/(high-low);
    line([zx,baseline],[zx,baseline+7],ink);
    label(n(low,1),left,baseline+22,ink,'center'); label('0',zx,baseline+22,ink,'center');
    label(n(high,1),left+span,baseline+22,ink,'center');
    label(t('skóre z na PC1','score z on PC1'),width/2,height-7,ink,'center');
    label(t('1 bod = 1 měření','1 dot = 1 measurement'),left,27);
    const j=buckets.findIndex(group=>group.includes(selected)), counts=buckets.map(g=>g.length);
    rangeLabel('seq-bins');
    reading(t('Počty zleva doprava','Counts from left to right')+'   '+counts.join(' · ')+'     Σ = '+scores.length,
            t('Vybrané měření','Selected measurement')+' #'+(selected+1)+'     z = '+n(scores[selected],3)+'     '+
            t('interval','bin')+' '+(j+1)+'/'+bins+'     n = '+counts[j]);
  }
  const draws=[drawTransform,drawDirections,drawStretch,drawCovariance,drawAxes,drawProjection,drawHistogram];
  function draw() {
    const active=captions[stage-1];
    const caption=t(active.dataset.captionCs,active.dataset.captionEn);
    $('seq-caption').textContent=caption;
    canvas.setAttribute('aria-label',stagePicker.selectedOptions[0].textContent);
    g.fillStyle='#f5f7f2';g.fillRect(0,0,width,height);
    draws[stage-1]();
  }
  function setStage(next, remember=true) {
    stage=Number.isInteger(next)&&next>=1&&next<=draws.length?next:1;
    stagePicker.value=String(stage);
    captions.forEach(el=>{el.hidden=Number(el.dataset.seqPanel)!==stage;});
    root.querySelectorAll('[data-seq-code]').forEach(el=>{el.hidden=Number(el.dataset.seqCode)!==stage;});
    $('seq-prev').disabled=stage===1;
    $('seq-next').hidden=stage===draws.length; $('seq-restart').hidden=stage!==draws.length;
    $('seq-reading').setAttribute('aria-live',stage===2 && $('seq-alignment')?'off':'polite');
    const url=new URL(location.href);
    if (remember || url.searchParams.has('reel') || url.hash==='#pca-reel') {
      url.searchParams.delete('reel');url.searchParams.set('step',String(stage));
      if (url.hash==='#pca-reel' && root.id==='pca-steps') url.hash='pca-steps';
      try { history.replaceState(null,'',url); } catch {}
    }
    draw();
  }
  stagePicker.onchange=()=>setStage(Number(stagePicker.value));
  $('seq-prev').onclick=()=>setStage(stage-1); $('seq-next').onclick=()=>setStage(stage+1);
  $('seq-restart').onclick=()=>{
    for (const input of root.querySelectorAll('input[type="range"]')) input.value=input.defaultValue;
    $('seq-eigen').selectedIndex=0;
    if (stretchPicker) stretchPicker.selectedIndex=0;
    cell=[0,1]; setStage(1);
  };
  for (const input of root.querySelectorAll('input[type="range"]')) input.addEventListener('input',draw);
  $('seq-eigen').onchange=draw;
  stretchPicker?.addEventListener('change',draw);
  for (const [id,input,angle] of [['seq-near','seq-direction',44],['seq-diagonal','seq-direction',45],['seq-other','seq-direction',135],
                                  ['seq-pc1','seq-axis',45],['seq-pc2','seq-axis',135]])
    $(id)?.addEventListener('click',()=>{$(input).value=angle;draw();});
  for (const button of root.querySelectorAll('[data-sigma]'))
    button.onclick=()=>{cell=button.dataset.sigma.split('').map(Number);draw();};
  document.addEventListener('roz-language',draw);
  const params=new URL(location.href).searchParams;
  setStage(Number(params.get('step') ?? params.get('reel')),false);
},{once:true});
