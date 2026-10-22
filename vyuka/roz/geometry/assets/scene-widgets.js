(function(){
  'use strict';
  const plots=[...document.querySelectorAll('[data-scene-plot]')];if(!plots.length)return;
  const M=window.GeometryMath,S=window.GeometrySceneMath,cloud=M.cloud().points,moons=M.moons().points;
  const trace=S.expansion(moons),comparisons=S.comparisons(cloud);
  const examples={core:trace.seed,border:trace.result.labels.findIndex((v,i)=>v>=0&&!trace.result.core[i]),noise:trace.result.labels.findIndex(v=>v<0)};
  const state={densityStage:0,progress:0,selected:trace.seed,playing:false,projectionStage:0,angle:0};
  const C={ink:'#1a2933',muted:'#586a73',grid:'#dce1dc',teal:'#087f76',orange:'#b56b35',blue:'#526ca4',pale:'#c8ceca'};
  const english=()=>document.body.dataset.lang==='en',text=(cs,en)=>english()?en:cs;
  const number=(v,d=2)=>Number(Math.abs(v)<.5*10**(-d)?0:v).toLocaleString(english()?'en-GB':'cs-CZ',{minimumFractionDigits:d,maximumFractionDigits:d});
  const set=(selector,value)=>document.querySelectorAll(selector).forEach(el=>el.textContent=value);
  function prepare(canvas,height){
    const w=Math.round(canvas.getBoundingClientRect().width);if(w<120)return null;
    const dpr=window.devicePixelRatio||1;canvas.width=w*dpr;canvas.height=height*dpr;canvas.style.height=height+'px';
    const ctx=canvas.getContext('2d');ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,height);ctx.font='14px "Segoe UI",Arial,sans-serif';
    return {ctx,w,h:height};
  }
  function line(ctx,a,b,color,width=1){ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(...a);ctx.lineTo(...b);ctx.stroke();ctx.lineWidth=1;}
  function dot(ctx,p,color,r=3,filled=true){ctx.beginPath();ctx.arc(...p,r,0,Math.PI*2);ctx[filled?'fillStyle':'strokeStyle']=color;ctx[filled?'fill':'stroke']();}
  function label(ctx,value,x,y,align='left',color=C.muted){ctx.textAlign=align;ctx.fillStyle=color;ctx.fillText(value,x,y);}
  function drawProjection(canvas,angle,stage=1){
    const small=canvas.dataset.scenePlot.startsWith('compare'),p=prepare(canvas,small?320:340);if(!p)return;
    const {ctx,w,h}=p,r=M.project(cloud,angle),mu=r.mean,pad=32,top=stage===2?105:27,bottom=stage===2?105:h-115;
    const extentX=Math.max(...cloud.map(q=>Math.abs(q[0]-mu[0]))),extentY=Math.max(...cloud.map(q=>Math.abs(q[1]-mu[1])));
    const scale=Math.min((w-2*pad)/(2*extentX*1.1),(h-150)/(2*extentY*1.1)),centre=[w/2,(h-110)/2];
    const map=q=>[centre[0]+(q[0]-mu[0])*scale,centre[1]-(q[1]-mu[1])*scale];
    const R=Math.max(...cloud.map(q=>Math.hypot(q[0]-mu[0],q[1]-mu[1]))),stripScale=(w-2*pad)/(2*R),sy=h-57;
    if(stage!==2){
      for(const x of [-4,0,4]){const q=map([mu[0]+x,mu[1]]);line(ctx,[q[0],top],[q[0],bottom],C.grid);}
      for(const y of [-2,0,2]){const q=map([mu[0],mu[1]+y]);line(ctx,[pad,q[1]],[w-pad,q[1]],C.grid);}
      label(ctx,text('Dva původní příznaky','Two original features'),pad,16);
      ctx.globalAlpha=.6;cloud.forEach(q=>dot(ctx,map(q),C.teal,small?1.7:2.3));ctx.globalAlpha=1;
      if(stage===1){
        ctx.globalAlpha=.16;for(let i=0;i<cloud.length;i+=5)line(ctx,map(cloud[i]),map(r.projected[i]),C.orange);ctx.globalAlpha=1;
        const u=r.direction,L=Math.min((w/2-pad)/(scale*Math.max(Math.abs(u[0]),1e-12)),(h-150)/2/(scale*Math.max(Math.abs(u[1]),1e-12)));
        line(ctx,map([mu[0]-L*u[0],mu[1]-L*u[1]]),map([mu[0]+L*u[0],mu[1]+L*u[1]]),C.orange,2);
        r.projected.forEach(q=>dot(ctx,map(q),C.orange,small?1.3:1.7));
      }
      dot(ctx,centre,C.ink,3);
    }else{
      label(ctx,text('Kolmou odchylku už neuchováváme.','We no longer store perpendicular displacement.'),w/2,55,'center',C.ink);
      label(ctx,text('Každému bodu zbývá jediné číslo.','Each point keeps only one number.'),w/2,82,'center');
    }
    if(stage>0){
      const y=stage===2?180:sy;
      label(ctx,text('Jedna souřadnice od průměru','One coordinate from the mean'),pad,y-39);
      line(ctx,[pad,y],[w-pad,y],C.ink);
      for(const fraction of [-1,-.5,0,.5,1]){const x=w/2+fraction*R*stripScale;line(ctx,[x,y-3],[x,y+4],C.ink);label(ctx,number(fraction*R,1),x,y+22,'center');}
      ctx.globalAlpha=.6;r.scores.forEach((z,i)=>dot(ctx,[w/2+z*stripScale,y-8-(i%5)*3],C.orange,2));ctx.globalAlpha=1;
      label(ctx,text('Svislý posun teček slouží jen čitelnosti.','Vertical dot offsets only improve visibility.'),w/2,h-5,'center');
    }
    canvas._sceneReport=r;
  }
  function drawDensity(canvas){
    const p=prepare(canvas,340);if(!p)return;
    const {ctx,w,h}=p,mu=M.mean(moons),scale=Math.min((w-80)/3.9,(h-65)/2.5),centre=[w/2,h/2];
    const map=q=>[centre[0]+(q[0]-mu[0])*scale,centre[1]-(q[1]-mu[1])*scale];
    canvas._sceneGeometry={map};
    const frame=trace.frames[state.progress],members=new Set(frame.members),processed=new Set(frame.processed);
    const selected=state.densityStage===1?(frame.current??trace.seed):state.selected,neighbours=new Set(trace.result.neighbors[selected]);
    for(const x of [-1,0,1,2]){const q=map([x,mu[1]]);line(ctx,[q[0],20],[q[0],h-35],C.grid);label(ctx,String(x),q[0],h-15,'center');}
    const q=map(moons[selected]);ctx.beginPath();ctx.arc(...q,.18*scale,0,2*Math.PI);ctx.fillStyle='rgba(181,107,53,.09)';ctx.fill();ctx.strokeStyle=C.orange;ctx.stroke();
    moons.forEach((point,i)=>{
      const at=map(point),core=trace.result.core[i],group=trace.result.labels[i];
      let color=C.pale,filled=true,noise=false;
      if(state.densityStage===0&&neighbours.has(i))color=C.teal;
      if(state.densityStage===1&&members.has(i)){color=processed.has(i)?C.teal:C.blue;filled=core;}
      if(state.densityStage===2){color=group===0?C.teal:group===1?C.orange:C.muted;filled=core;noise=group<0;}
      if(noise){line(ctx,[at[0]-3,at[1]-3],[at[0]+3,at[1]+3],color);line(ctx,[at[0]-3,at[1]+3],[at[0]+3,at[1]-3],color);}
      else dot(ctx,at,color,3.5,filled);
    });
    dot(ctx,q,C.ink,8,false);label(ctx,'ε',q[0]+.18*scale+8,q[1], 'left',C.orange);
  }
  let timer=null;
  function stop(){if(timer)clearInterval(timer);timer=null;state.playing=false;}
  function render(){
    if(document.body.dataset.view==='slides'&&!document.querySelector('#dbscan-video')?.classList.contains('active'))stop();
    const r=trace.result,frame=trace.frames[state.progress],selected=state.selected,count=r.neighbors[selected].length;
    document.querySelectorAll('[data-density-stage]').forEach(el=>el.setAttribute('aria-pressed',String(+el.dataset.densityStage===state.densityStage)));
    document.querySelectorAll('[data-projection-stage]').forEach(el=>el.setAttribute('aria-pressed',String(+el.dataset.projectionStage===state.projectionStage)));
    document.querySelector('[data-density-inspect]').hidden=state.densityStage!==0;
    document.querySelector('[data-density-growth]').hidden=state.densityStage!==1;
    document.querySelector('[data-density-final-legend]').hidden=state.densityStage!==2;
    const progress=document.querySelector('[data-density-progress]');progress.max=trace.order.length;progress.value=state.progress;
    set('[data-density-progress-value]',state.progress+' / '+trace.order.length);
    document.querySelector('[data-density-next]').disabled=state.progress===trace.order.length;
    const play=document.querySelector('[data-density-play]');play.setAttribute('aria-pressed',String(state.playing));play.textContent=state.playing?text('Pozastavit','Pause'):text('Spustit','Play');
    set('[data-density-measure]',state.densityStage===0?text('Počet v okolí: ','Neighbourhood count: ')+count:state.densityStage===1?text('Připojené body: ','Joined points: ')+frame.members.length:text('Shluky: ','Clusters: ')+r.clusterCount+' · '+text('Šum: ','Noise: ')+r.noiseCount);
    const type=r.core[selected]?text('jádrový','core'):r.labels[selected]>=0?text('okrajový','border'):text('šum','noise');
    set('[data-density-status]',state.densityStage===0?
      text(`Vybraný bod je ${type}. V kruhu je ${count} bodů včetně něj. Prohlédněte i další příklady nebo klikněte do grafu.`,`The selected point is ${type}. The circle contains ${count} points, including itself. Inspect the other examples or click in the plot.`):
      state.densityStage===1?text('Zelená: zpracovaná jádra. Modrá jádra ještě čekají. Prázdné modré body se připojí, ale růst neprodlouží. Šedá znamená mimo dosavadní růst, zatím ne šum.','Green: processed cores. Blue cores await processing. Hollow blue points join without carrying expansion further. Grey means outside the expansion so far, not yet noise.'):
      text('Celý DBSCAN našel dva shluky. Obchází i další oblasti mimo první rozrostlý shluk. Křížky označují body, ke kterým se nedostalo žádné jádro.','Full DBSCAN found two clusters. It also examines regions outside the first expanded cluster. Crosses mark points that no core point reaches.'));
    const report=M.project(cloud,state.angle);
    set('[data-scene-angle-value]',number(state.angle*180/Math.PI,1)+'°');set('[data-scene-variance]',number(report.variance,3));set('[data-scene-kept]',number(100*report.explainedRatio,1)+' %');
    const projectionMessages=[
      ['Zelené body mají dvě původní souřadnice. Osa, kterou zvolíme v dalším kroku, prochází jejich průměrem.','Green points have two original coordinates. The axis chosen in the next step passes through their mean.'],
      ['Oranžové úsečky vedou kolmo na osu. Dole čteme polohu každé projekce od průměru. Otočte osu a sledujte skutečný rozptyl.','Orange segments meet the axis at right angles. Below, read each projected position from the mean. Rotate the axis and watch the actual variance.'],
      ['Zůstaly jen polohy podél osy. Dva body odlišné pouze v kolmém směru mohou mít stejné číslo. Ztracený směr nelze z této souřadnice přesně obnovit.','Only positions along the axis remain. Points differing only in the perpendicular direction can share one number. That number cannot recover the lost direction exactly.']
    ];
    set('[data-projection-status]',text(...projectionMessages[state.projectionStage]));
    for(const canvas of plots){const kind=canvas.dataset.scenePlot;
      if(kind==='density')drawDensity(canvas);
      else if(kind==='projection')drawProjection(canvas,state.angle,state.projectionStage);
      else if(kind.startsWith('compare-'))drawProjection(canvas,comparisons[+kind.slice(8)].angle);
    }
    comparisons.forEach(({angle,report:r},i)=>set(`[data-comparison-readout="${i}"]`,text('Úhel: ','Angle: ')+number(angle*180/Math.PI,1)+'°\nVariance: '+number(r.variance,3)+'\n'+text('Zachováno: ','Retained: ')+number(100*r.explainedRatio,1)+' %'));
  }
  document.querySelectorAll('[data-density-stage]').forEach(el=>el.addEventListener('click',()=>{stop();state.densityStage=+el.dataset.densityStage;render();}));
  document.querySelectorAll('[data-density-example]').forEach(el=>el.addEventListener('click',()=>{state.selected=examples[el.dataset.densityExample];render();}));
  document.querySelector('[data-density-progress]').addEventListener('input',event=>{stop();state.progress=+event.target.value;render();});
  document.querySelector('[data-density-next]').addEventListener('click',()=>{stop();state.progress=Math.min(state.progress+1,trace.order.length);render();});
  document.querySelector('[data-density-play]').addEventListener('click',()=>{
    if(state.playing)stop();else{
      if(state.progress===trace.order.length)state.progress=0;state.playing=true;
      timer=setInterval(()=>{state.progress++;if(state.progress>=trace.order.length){state.progress=trace.order.length;stop();}render();},160);
    }render();
  });
  document.querySelector('[data-scene-plot="density"]').addEventListener('click',event=>{
    if(state.densityStage===1)return;const canvas=event.currentTarget,g=canvas._sceneGeometry;if(!g)return;
    const rect=canvas.getBoundingClientRect(),mouse=[event.clientX-rect.left,event.clientY-rect.top];let nearest=Infinity;
    moons.forEach((point,i)=>{const p=g.map(point),distance=(p[0]-mouse[0])**2+(p[1]-mouse[1])**2;if(distance<nearest){nearest=distance;state.selected=i;}});render();
  });
  document.querySelectorAll('[data-projection-stage]').forEach(el=>el.addEventListener('click',()=>{state.projectionStage=+el.dataset.projectionStage;render();}));
  document.querySelector('[data-scene-angle]').addEventListener('input',event=>{state.angle=+event.target.value*Math.PI/180;render();});
  document.querySelectorAll('[data-try-comparison]').forEach(el=>el.addEventListener('click',()=>{
    Object.assign(window.GeometryLab.state,{angle:comparisons[+el.dataset.tryComparison].angle,kind:'cloud',standardize:false,yScale:1,best:false,showEigen:false});
    window.GeometryLab.render();location.hash='pca';
  }));
  document.addEventListener('visibilitychange',()=>{if(document.hidden){stop();render();}});
  document.addEventListener('geometry:change',render);
  window.addEventListener('beforeprint',()=>{
    stop();render();
    for(const canvas of plots){
      if(!canvas.width||(canvas.dataset.scenePlot==='density'?!canvas._sceneGeometry:!canvas._sceneReport))continue;
      const holder=canvas.parentElement;
      for(let img=holder.nextElementSibling;img?.classList.contains('scene-print');img=img.nextElementSibling){
        if(img.lang===(english()?'en':'cs'))img.src=canvas.toDataURL('image/png');
      }
    }
  });
  let pending=0;const observer=new ResizeObserver(()=>{cancelAnimationFrame(pending);pending=requestAnimationFrame(render);});plots.forEach(el=>observer.observe(el.parentElement));
  window.GeometryScenes={state,render,trace,examples,comparisons,getProjection:()=>M.project(cloud,state.angle)};
  render();
})();
