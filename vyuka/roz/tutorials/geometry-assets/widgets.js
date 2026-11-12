(function () {
  'use strict';
  const M = window.GeometryMath;
  const state = {angle:0, kind:'cloud', standardize:false, yScale:1, lines:true, best:false, showEigen:false,
    eps:.18, minSamples:6, selected:60, k:8, digitExample:5,
    digitView:new URLSearchParams(location.search).get('digits')==='components'?'components':'reconstruction'};
  const lang = () => document.body.dataset.lang || 'cs';
  const text = (cs,en) => lang()==='en' ? en : cs;
  const number = (v, digits=3) => Number(Math.abs(v)<.5*10**(-digits)?0:v).toLocaleString(lang()==='en'?'en-GB':'cs-CZ', {minimumFractionDigits:digits,maximumFractionDigits:digits});
  const colors = {ink:'#1a2933', muted:'#586a73', line:'#dce1dc', teal:'#087f76', orange:'#b56b35', blue:'#526ca4', pc1:'#3d5d99', pc2:'#94426e', paper:'#fcfbf7'};
  const clusters = ['#087f76','#b56b35','#526ca4','#9b4f76','#697d37','#835f38'];
  const canvases = [...document.querySelectorAll('canvas[data-plot]')];
  const cloudCache = new Map();
  for (const kind of ['cloud','isotropic','outlier','classes']) cloudCache.set(kind,M.cloud(kind));
  const moonData = M.moons();
  let selectedPca = null, latestPca = null, latestDb = null, latestDigits = null;
  function setAll(selector, value) {document.querySelectorAll(selector).forEach(el=>el.textContent=value);}
  function getCloud() {return M.preprocess(cloudCache.get(state.kind).points,state);}
  function setup(canvas, height) {
    const width = Math.round(canvas.getBoundingClientRect().width);
    if (!width) return null;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(width*dpr); canvas.height = Math.round(height*dpr);
    canvas.style.height = height+'px';
    const ctx=canvas.getContext('2d');ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,width,height);
    ctx.font='14px "Segoe UI",Arial,sans-serif';ctx.lineWidth=1;
    return {ctx,width,height};
  }
  function dot(ctx,x,y,r,color,fill=true){ctx.beginPath();ctx.arc(x,y,r,0,2*Math.PI);ctx[fill?'fillStyle':'strokeStyle']=color;ctx[fill?'fill':'stroke']();}
  function segment(ctx,a,b,color,width=1){ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(...a);ctx.lineTo(...b);ctx.stroke();ctx.lineWidth=1;}
  function arrow(ctx,from,to,color){
    segment(ctx,from,to,color,3);
    const angle=Math.atan2(to[1]-from[1],to[0]-from[0]),head=10;
    for(const offset of [-.42,.42])segment(ctx,to,[to[0]-head*Math.cos(angle+offset),to[1]-head*Math.sin(angle+offset)],color,3);
  }
  function label(ctx,value,x,y,align='center',color=colors.muted){ctx.fillStyle=color;ctx.textAlign=align;ctx.fillText(value,x,y);}
  function tickStep(range){const rough=range/5,power=10**Math.floor(Math.log10(Math.max(rough,1e-10)));return [1,2,5,10].find(v=>v*power>=rough)*power;}
  function drawPca(canvas) {
    const prepared=setup(canvas,window.innerWidth<440?410:state.showEigen?390:470);if(!prepared)return;
    const {ctx,width:w,height:h}=prepared, data=getCloud(), report=M.project(data,state.angle), mu=report.mean;
    latestPca=report;
    const plotH=h-135, pad=45;
    const dx=Math.max(...data.map(p=>Math.abs(p[0]-mu[0])))*1.1||1;
    const dy=Math.max(...data.map(p=>Math.abs(p[1]-mu[1])))*1.1||1;
    const scale=Math.min((w-2*pad)/(2*dx),(plotH-60)/(2*dy));
    const center=[w/2,plotH/2+5], map=p=>[center[0]+(p[0]-mu[0])*scale,center[1]-(p[1]-mu[1])*scale];
    canvas._geometry={center,scale,plotH};
    const halfX=(w/2-pad)/scale, halfY=(plotH/2-30)/scale;
    const stepx=tickStep(halfX*2),stepy=tickStep(halfY*2);
    for(let v=Math.ceil((mu[0]-halfX)/stepx)*stepx;v<=mu[0]+halfX;v+=stepx){const px=map([v,mu[1]])[0];segment(ctx,[px,25],[px,plotH-22],colors.line);label(ctx,number(v,0),px,plotH-5);}
    for(let v=Math.ceil((mu[1]-halfY)/stepy)*stepy;v<=mu[1]+halfY;v+=stepy){const py=map([mu[0],v])[1];segment(ctx,[pad,py],[w-pad,py],colors.line);label(ctx,number(v,0),pad-9,py+4,'right');}
    label(ctx,text(state.standardize?'Standardizované příznaky':'Příznak 2 (a.u.)','Feature 2'+(state.standardize?' (standardized)':' (a.u.)')),pad,15,'left');
    label(ctx,text('Příznak 1','Feature 1'),w-pad,plotH+14,'right');
    const u=report.direction;
    const axisLength=Math.min((w/2-pad-8)/(scale*Math.max(Math.abs(u[0]),1e-15)),(plotH/2-30)/(scale*Math.max(Math.abs(u[1]),1e-15)));
    const endA=map([mu[0]-axisLength*u[0],mu[1]-axisLength*u[1]]), endB=map([mu[0]+axisLength*u[0],mu[1]+axisLength*u[1]]);
    if(state.lines){ctx.globalAlpha=.15;for(let i=0;i<data.length;i+=4)segment(ctx,map(data[i]),map(report.projected[i]),colors.orange);ctx.globalAlpha=1;}
    const labels=cloudCache.get(state.kind).labels;
    ctx.globalAlpha=.65;
    data.forEach((p,i)=>dot(ctx,...map(p),state.kind==='outlier'&&i===data.length-1?5:2.5,
      labels.length?(labels[i]===0?colors.blue:colors.orange):colors.teal));ctx.globalAlpha=1;
    segment(ctx,endA,endB,colors.orange,2.4);dot(ctx,...endA,6,colors.orange);dot(ctx,...endB,6,colors.orange);
    report.projected.forEach(p=>dot(ctx,...map(p),1.8,colors.orange));
    canvas._eigenArrows=[];
    if(state.showEigen){
      // Unit-vector components are reported below. Both arrows use one common
      // illustrative display length, not lambda as a length or a covariance ellipse.
      const displayLength=Math.min(110,(w-2*pad)*.32,(plotH-60)*.43);
      report.eigen.vectors.forEach((v,i)=>{
        const color=i===0?colors.pc1:colors.pc2,end=[center[0]+v[0]*displayLength,center[1]-v[1]*displayLength];
        const back=[center[0]-v[0]*displayLength,center[1]+v[1]*displayLength];
        ctx.save();ctx.setLineDash([4,5]);ctx.globalAlpha=.6;segment(ctx,back,center,color,1.5);ctx.restore();
        arrow(ctx,center,end,color);
        const title=i===0?'u₁':'u₂',tx=end[0]+(v[0]<-.2?-10:10),ty=end[1]+(v[1]>0?-7:17),align=v[0]<-.2?'right':'left';
        ctx.font='600 17px "Segoe UI",Arial,sans-serif';ctx.textAlign=align;
        ctx.strokeStyle=colors.paper;ctx.lineWidth=5;ctx.strokeText(title,tx,ty);
        label(ctx,title,tx,ty,align,color);ctx.font='14px "Segoe UI",Arial,sans-serif';ctx.lineWidth=1;
        canvas._eigenArrows.push({vector:v.slice(),eigenvalue:report.eigen.values[i],from:center.slice(),to:end});
      });
    }
    dot(ctx,...center,4,colors.ink);label(ctx,text('průměr','mean'),center[0]+9,center[1]-9,'left',colors.ink);
    const R=Math.max(...data.map(p=>Math.hypot(p[0]-mu[0],p[1]-mu[1])))||1;
    const stripY=plotH+74, stripScale=(w-2*pad)/(2*R);
    segment(ctx,[pad,stripY],[w-pad,stripY],colors.ink);
    label(ctx,text('Projekce na jednu osu','Projection onto one axis'),pad,plotH+27,'left',colors.ink);
    for(const fraction of [-1,-.5,0,.5,1]){const px=w/2+fraction*R*stripScale;segment(ctx,[px,stripY-4],[px,stripY+4],colors.ink);label(ctx,number(fraction*R,1),px,stripY+24);}
    ctx.globalAlpha=.55;report.scores.forEach((z,i)=>dot(ctx,w/2+z*stripScale,stripY-9-(i%5)*4,2.5,labels.length?(labels[i]===0?colors.blue:colors.orange):colors.teal));ctx.globalAlpha=1;
    label(ctx,text('Rozestupy řádků pouze pro čitelnost.','Vertical offsets are for visibility only.'),w/2,h-7);
    selectedPca={report,data};
  }
  function refreshPca() {
    document.querySelectorAll('canvas[data-plot="pca"]').forEach(drawPca);
    const points=getCloud(), r=M.project(points,state.angle);latestPca=r;
    setAll('[data-angle-value]',number(state.angle*180/Math.PI,1)+'°');
    setAll('[data-variance]',number(r.variance));
    setAll('[data-kept]',r.explainedRatio===null?'—':number(100*r.explainedRatio,1)+' %');
    setAll('[data-mse]',number(r.mse));
    setAll('[data-eigen-angle]',r.eigen.degenerate?text('bez jediného směru','no unique direction'):number(r.eigen.angle*180/Math.PI,2)+'°');
    setAll('[data-lambda1]',number(r.eigen.values[0],4));setAll('[data-lambda2]',number(r.eigen.values[1],4));
    r.eigen.vectors.forEach((v,i)=>setAll(`[data-eigen-vector="${i+1}"]`,'('+v.map(component=>number(component,4)).join('; ')+')'));
    document.querySelectorAll('[data-show-eigen]').forEach(el=>el.checked=state.showEigen);
    document.querySelectorAll('[data-eigen-details]').forEach(el=>el.hidden=!state.showEigen);
    document.querySelectorAll('[data-eigen-degenerate]').forEach(el=>el.hidden=!r.eigen.degenerate);
    setAll('[data-count-pca]',points.length);
    for(let i=0;i<2;i++)for(let j=0;j<2;j++)setAll(`[data-cov="${i}${j}"]`,number(r.matrix[i][j],4));
    setAll('[data-pca-status]',r.eigen.degenerate?text('Kruhový mrak: různé osy mají stejnou varianci.','Circular cloud: different axes have the same variance.'):
      state.best?text('Zobrazen je směr největší výběrové variance.','Showing the direction of maximum sample variance.'):
      text('Otočte osu tažením nebo posuvníkem.','Rotate the axis by dragging or using the slider.'));
    document.querySelectorAll('[data-angle]').forEach(el=>el.value=(state.angle*180/Math.PI).toFixed(2));
    document.querySelectorAll('[data-pca-kind]').forEach(el=>el.value=state.kind);
    document.querySelectorAll('[data-standardize]').forEach(el=>el.checked=state.standardize);
    document.querySelectorAll('[data-y-scale]').forEach(el=>el.checked=state.yScale!==1);
  }
  function drawDb(canvas) {
    const prepared=setup(canvas,window.innerWidth<850?350:390);if(!prepared)return;
    const {ctx,width:w,height:h}=prepared, points=moonData.points, r=latestDb;
    const mu=M.mean(points), rangeX=Math.max(...points.map(p=>Math.abs(p[0]-mu[0])))*1.12, rangeY=Math.max(...points.map(p=>Math.abs(p[1]-mu[1])))*1.15;
    const scale=Math.min((w-100)/(2*rangeX),(h-70)/(2*rangeY)), center=[w/2,h/2];
    const map=p=>[center[0]+(p[0]-mu[0])*scale,center[1]-(p[1]-mu[1])*scale];
    canvas._geometry={map,points};
    for(const x of [-1,0,1,2]){const p=map([x,mu[1]]);segment(ctx,[p[0],25],[p[0],h-45],colors.line);label(ctx,String(x),p[0],h-24);}
    label(ctx,text('Příznak 2','Feature 2'),20,18,'left');label(ctx,text('Příznak 1','Feature 1'),w-20,h-6,'right');
    const selected=points[state.selected], q=map(selected), neighborSet=new Set(r.neighbors[state.selected]);
    ctx.fillStyle='rgba(181,107,53,.08)';ctx.beginPath();ctx.arc(...q,state.eps*scale,0,2*Math.PI);ctx.fill();ctx.strokeStyle=colors.orange;ctx.stroke();
    points.forEach((p,i)=>{
      const [x,y]=map(p), group=r.labels[i], color=group<0?colors.muted:clusters[group%clusters.length];
      if(group<0){segment(ctx,[x-3,y-3],[x+3,y+3],color,1.3);segment(ctx,[x-3,y+3],[x+3,y-3],color,1.3);}
      else dot(ctx,x,y,r.core[i]?4:3.5,color,r.core[i]);
      if(neighborSet.has(i))dot(ctx,x,y,7,colors.orange,false);
    });
    dot(ctx,...q,10,colors.ink,false);
    label(ctx,'ε',q[0]+state.eps*scale+8,q[1]-5,'left',colors.orange);
  }
  function refreshDb() {
    latestDb=M.dbscan(moonData.points,state.eps,state.minSamples);
    document.querySelectorAll('canvas[data-plot="dbscan"]').forEach(drawDb);
    setAll('[data-eps-value]',number(state.eps,2));setAll('[data-min-value]',state.minSamples);
    setAll('[data-clusters]',latestDb.clusterCount);setAll('[data-noise]',latestDb.noiseCount);
    setAll('[data-neighbors]',latestDb.neighbors[state.selected].length);
    setAll('[data-point-type]',latestDb.core[state.selected]?text('jádrový','core'):latestDb.labels[state.selected]<0?text('šum','noise'):text('okrajový','border'));
  }
  function digitImage(canvas,values) {
    canvas.width=8;canvas.height=8;const ctx=canvas.getContext('2d'), image=ctx.createImageData(8,8);
    values.forEach((value,i)=>{const shade=Math.round(255*(1-Math.max(0,Math.min(16,value))/16));image.data[i*4]=shade;image.data[i*4+1]=shade;image.data[i*4+2]=shade;image.data[i*4+3]=255;});ctx.putImageData(image,0,0);
  }
  function signedPatternImage(canvas,values,extent){
    canvas.width=8;canvas.height=8;const ctx=canvas.getContext('2d'),image=ctx.createImageData(8,8);
    values.forEach((value,i)=>{
      const t=Math.min(1,Math.abs(value)/(extent||1)),target=value>=0?[61,93,153]:[181,107,53];
      for(let channel=0;channel<3;channel++)image.data[4*i+channel]=Math.round(255+(target[channel]-255)*t);
      image.data[4*i+3]=255;
    });ctx.putImageData(image,0,0);
  }
  function reconstructDigit(index){
    const D=window.GeometryDigits,values=D.mean.slice();
    for(let k=0;k<state.k;k++)for(let j=0;j<64;j++)values[j]+=D.scores[index][k]*D.components[k][j];
    return values;
  }
  function refreshDigits() {
    const D=window.GeometryDigits;if(!D)return;
    let error=0;const reconstructions=D.originals.map((original,i)=>{
      const values=reconstructDigit(i);for(let j=0;j<64;j++)error+=(original[j]-values[j])**2;return values;
    });
    document.querySelectorAll('[data-digit-original]').forEach(canvas=>digitImage(canvas,D.originals[+canvas.dataset.digitOriginal]));
    document.querySelectorAll('[data-digit-reconstructed]').forEach(canvas=>digitImage(canvas,reconstructions[+canvas.dataset.digitReconstructed]));
    const extent=Math.max(...D.components.slice(0,3).flat().map(Math.abs)),example=state.digitExample;
    document.querySelectorAll('[data-component-image]').forEach(canvas=>signedPatternImage(canvas,D.components[+canvas.dataset.componentImage],extent));
    for(let j=0;j<3;j++){
      setAll(`[data-component-ratio="${j}"]`,number(100*D.explained_variance_ratio[j],1)+' %');
      setAll(`[data-component-score="${j}"]`,number(D.scores[example][j],3));
      setAll(`[data-component-use="${j}"]`,j<state.k?text('použita','included'):text('vynechána','omitted'));
    }
    document.querySelectorAll('[data-digit-preview]').forEach(canvas=>digitImage(canvas,canvas.dataset.digitPreview==='mean'?D.mean:canvas.dataset.digitPreview==='original'?D.originals[example]:reconstructions[example]));
    document.querySelectorAll('[data-digit-panel]').forEach(el=>el.hidden=el.dataset.digitPanel!==state.digitView);
    document.querySelectorAll('[data-digit-view]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.digitView===state.digitView)));
    document.querySelectorAll('[data-digit-example]').forEach(el=>el.value=example);
    document.querySelectorAll('[data-digit-k]').forEach(el=>el.value=state.k);
    setAll('[data-digit-example-label]',D.labels[example]);
    setAll('[data-k-value]',state.k);setAll('[data-digit-ratio]',number(100*D.explained_variance_ratio.slice(0,state.k).reduce((a,b)=>a+b,0),1)+' %');
    setAll('[data-digit-mse]',number(error/(D.originals.length*64),4));
    setAll('[data-digit-state]',state.k===0?text('k = 0: ukládáme jen společný průměr. Všechny rekonstruované obrázky jsou stejné.','k = 0: only the shared mean remains. All reconstructed images are identical.'):
      state.k===64?text('k = 64: používáme všechny směry. Původní hodnoty se obnoví až na numerické zaokrouhlení.','k = 64: all directions are included. Original values are recovered up to numerical rounding.'):
      text(`k = ${state.k}: pro každý obrázek ponecháme ${state.k} nových souřadnic. Rekonstrukce má stále všech 64 pixelů.`,`k = ${state.k}: we keep ${state.k} new coordinates per image. The reconstruction still has all 64 pixels.`));
    latestDigits={k:state.k,example,view:state.digitView,mse:error/(D.originals.length*64),reconstructions,mean:D.mean.slice(),scores:D.scores[example].slice(),componentExtent:extent};
    document.dispatchEvent(new Event('geometry:digits'));
  }
  function changeAngle(degrees){
    const normalized=((degrees%360)+360)%360;
    state.angle=(normalized>180?normalized-180:normalized)*Math.PI/180;
    state.best=false;refreshPca();
  }
  document.querySelectorAll('[data-angle]').forEach(el=>el.addEventListener('input',()=>changeAngle(+el.value)));
  document.querySelectorAll('[data-best-axis]').forEach(el=>el.addEventListener('click',()=>{state.angle=M.eigen2(M.covariance(getCloud()).matrix).angle;state.best=true;refreshPca();}));
  document.querySelectorAll('[data-perpendicular]').forEach(el=>el.addEventListener('click',()=>changeAngle(state.angle*180/Math.PI+90)));
  document.querySelectorAll('[data-pca-kind]').forEach(el=>el.addEventListener('change',()=>{state.kind=el.value;state.best=false;refreshPca();}));
  document.querySelectorAll('[data-pca-preset]').forEach(el=>el.addEventListener('click',()=>{
    state.kind=el.dataset.pcaPreset;state.standardize=false;state.yScale=1;state.angle=0;state.best=false;refreshPca();
  }));
  document.querySelectorAll('[data-standardize]').forEach(el=>el.addEventListener('change',()=>{state.standardize=el.checked;state.best=false;refreshPca();}));
  document.querySelectorAll('[data-y-scale]').forEach(el=>el.addEventListener('change',()=>{state.yScale=el.checked?8:1;state.best=false;refreshPca();}));
  document.querySelectorAll('[data-lines]').forEach(el=>el.addEventListener('change',()=>{state.lines=el.checked;refreshPca();}));
  document.querySelectorAll('[data-show-eigen]').forEach(el=>el.addEventListener('change',()=>{state.showEigen=el.checked;refreshPca();}));
  document.querySelectorAll('canvas[data-plot="pca"]').forEach(canvas=>{
    let dragging=false;
    function rotate(event){const g=canvas._geometry,rect=canvas.getBoundingClientRect();if(!g||event.clientY-rect.top>g.plotH)return;
      const angle=Math.atan2(-(event.clientY-rect.top-g.center[1]),event.clientX-rect.left-g.center[0]);changeAngle(angle*180/Math.PI);}
    canvas.addEventListener('pointerdown',event=>{dragging=true;canvas.setPointerCapture(event.pointerId);rotate(event);});
    canvas.addEventListener('pointermove',event=>{if(dragging)rotate(event);});
    canvas.addEventListener('pointerup',()=>dragging=false);canvas.addEventListener('pointercancel',()=>dragging=false);
  });
  document.querySelectorAll('[data-eps]').forEach(el=>el.addEventListener('input',()=>{state.eps=+el.value;refreshDb();}));
  document.querySelectorAll('[data-min-samples]').forEach(el=>el.addEventListener('input',()=>{state.minSamples=+el.value;refreshDb();}));
  document.querySelectorAll('canvas[data-plot="dbscan"]').forEach(canvas=>canvas.addEventListener('click',event=>{
    const g=canvas._geometry;if(!g)return;const rect=canvas.getBoundingClientRect(),mouse=[event.clientX-rect.left,event.clientY-rect.top];
    let minimum=Infinity;g.points.forEach((p,i)=>{const q=g.map(p),d=(q[0]-mouse[0])**2+(q[1]-mouse[1])**2;if(d<minimum){minimum=d;state.selected=i;}});refreshDb();
  }));
  document.querySelectorAll('[data-digit-k]').forEach(el=>el.addEventListener('input',()=>{state.k=+el.value;refreshDigits();}));
  document.querySelectorAll('[data-digit-example]').forEach(el=>el.addEventListener('change',()=>{state.digitExample=+el.value;refreshDigits();}));
  document.querySelectorAll('[data-digit-view]').forEach(el=>el.addEventListener('click',()=>{
    state.digitView=el.dataset.digitView;const url=new URL(location.href);url.searchParams.set('digits',state.digitView);history.replaceState(null,'',url);refreshDigits();
  }));
  function renderAll(){refreshPca();refreshDb();refreshDigits();}
  let pending=0;const observer=new ResizeObserver(()=>{cancelAnimationFrame(pending);pending=requestAnimationFrame(renderAll);});
  canvases.forEach(canvas=>observer.observe(canvas.parentElement));
  document.addEventListener('geometry:change',renderAll);
  window.GeometryLab={state,render:renderAll,getPca:()=>latestPca,getDbscan:()=>latestDb,getPoints:()=>getCloud(),getDigits:()=>latestDigits};
  renderAll();
})();
