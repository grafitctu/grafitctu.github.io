document.addEventListener('DOMContentLoaded', () => {
  'use strict';
  const {$, t, num} = RozUI;
  const root = $('pca-reel');
  const canvas = $('seq-plot'), g = canvas.getContext('2d');
  const width = canvas.width, height = canvas.height;
  const raw = JSON.parse($('seq-data').textContent);
  const stats = FeatureMath.covariance(raw.map(([h, w]) => [h / 5, w / 4]));
  const points = stats.centered, [pc1, pc2] = stats.eigen.axes;
  const scores = points.map(p => FeatureMath.dot(p, pc1));
  const radius = Math.max(...points.flat().map(Math.abs)) * 1.18;
  const A = [[1.25, 0.75], [0.75, 1.25]];
  const blue = '#24648a', rust = '#af4723', gold = '#a26b0e', teal = '#08796b', ink = '#203a42';
  const captions = [...root.querySelectorAll('[data-seq-panel]')];
  const stagePicker = $('seq-stage');
  let stage = 1, cell = [0, 1];

  const value = id => Number($(id).value);
  const n = (x, digits=2) => num(Math.abs(x) < 0.5 * 10 ** -digits ? 0 : x, digits);
  const pair = (p, digits=2) => '(' + p.map(x => n(x, digits)).join(t('; ', ', ')) + ')';
  const transform = p => A.map(row => FeatureMath.dot(row, p));
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
    reading(t('První řádek','First row')+'   '+n(1.25)+' × 2 + '+n(.75)+' × ('+n(-.5,1)+') = '+n(av[0],3),
            t('Druhý řádek','Second row')+'   '+n(.75)+' × 2 + '+n(1.25)+' × ('+n(-.5,1)+') = '+n(av[1],3),
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
    const error=Math.abs(u[0]*au[1]-u[1]*au[0]);
    reading('u = '+pair(u)+'     Au = '+pair(au),
            error<1e-8?t('Obě šipky leží na stejné přímce. Našli jste vlastní směr.','Both arrows lie on the same line. You found an eigendirection.'):
                         t('Šipky svírají úhel. Zkuste najít polohu, ve které budou na jedné přímce.','The arrows make an angle. Find a position where they share a line.'));
  }
  function drawStretch() {
    const selected=value('seq-eigen'), left=72, per=(width-125)/2.2;
    const along=x=>left+per*x;
    const axes=[[Math.SQRT1_2,Math.SQRT1_2],[-Math.SQRT1_2,Math.SQRT1_2]];
    const scales=axes.map(u=>Math.hypot(...transform(u)));
    line([along(1),60],[along(1),262],'#94aaa5',1.4,[4,4]);
    label(t('původní délka 1','original length 1'),along(1),44,ink,'center');
    scales.forEach((s,i)=>{
      const y=110+102*i, colour=i===0?gold:teal;
      label(i===0?'u₁':'u₂',26,y+5,colour);
      line([left,y+13],[along(2.15),y+13],'#cbd9d3');
      arrow([left,y],[along(s),y],colour,selected===i?5:2.5);
      label('× '+n(s,1),along(s),y-15,colour,'center');
    });
    for (const q of [0,.5,1,1.5,2]) label(n(q,1),along(q),287,'#4d6663','center');
    reading((selected===0?'λ₁':'λ₂')+' = ‖Au‖ / ‖u‖ = '+n(scales[selected],1)+' / 1 = '+n(scales[selected],1));
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
    if (remember) {
      const url=new URL(location.href);url.searchParams.set('reel',String(stage));
      try { history.replaceState(null,'',url); } catch {}
    }
    draw();
  }
  stagePicker.onchange=()=>setStage(Number(stagePicker.value));
  $('seq-prev').onclick=()=>setStage(stage-1); $('seq-next').onclick=()=>setStage(stage+1);
  $('seq-restart').onclick=()=>{
    for (const input of root.querySelectorAll('input[type="range"]')) input.value=input.defaultValue;
    $('seq-eigen').selectedIndex=0; cell=[0,1]; setStage(1);
  };
  for (const input of root.querySelectorAll('input[type="range"]')) input.addEventListener('input',draw);
  $('seq-eigen').onchange=draw;
  for (const [id,input,angle] of [['seq-diagonal','seq-direction',45],['seq-other','seq-direction',135],
                                  ['seq-pc1','seq-axis',45],['seq-pc2','seq-axis',135]])
    $(id).onclick=()=>{$(input).value=angle;draw();};
  for (const button of root.querySelectorAll('[data-sigma]'))
    button.onclick=()=>{cell=button.dataset.sigma.split('').map(Number);draw();};
  document.addEventListener('roz-language',draw);
  setStage(Number(new URL(location.href).searchParams.get('reel')),false);
},{once:true});
