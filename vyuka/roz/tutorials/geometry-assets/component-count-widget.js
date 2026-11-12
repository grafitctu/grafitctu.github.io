(function(){
 'use strict';
 const root=document.querySelector('#component-count');if(!root)return;
 const M=window.PcaCountMath,D=window.GeometryDigits,charts=[...root.querySelectorAll('[data-count-chart]')];
 const C={ink:'#1a2933',muted:'#586a73',grid:'#dce1dc',kept:'#087f76',omitted:'#c7ceca',orange:'#b56b35',paper:'#fcfbf7'};
 const english=()=>document.body.dataset.lang==='en',text=(cs,en)=>english()?en:cs;
 const number=(value,digits=2)=>Number(Math.abs(value)<.5*10**(-digits)?0:value).toLocaleString(english()?'en-GB':'cs-CZ',{minimumFractionDigits:digits,maximumFractionDigits:digits});
 let latest=null;
 function set(selector,value){root.querySelectorAll(selector).forEach(el=>el.textContent=value);}
 function line(ctx,a,b,color,width=1){ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(...a);ctx.lineTo(...b);ctx.stroke();ctx.lineWidth=1;}
 function label(ctx,value,x,y,align='left',color=C.muted){ctx.textAlign=align;ctx.fillStyle=color;ctx.fillText(value,x,y);}
 function draw(canvas,r,forcedWidth=null){
  const w=forcedWidth??Math.round(canvas.getBoundingClientRect().width);if(w<120)return;
  const h=window.innerWidth<850?205:190,dpr=window.devicePixelRatio||1;
  canvas.width=w*dpr;canvas.height=h*dpr;canvas.style.height=h+'px';
  const ctx=canvas.getContext('2d');ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);ctx.font='13px "Segoe UI",Arial,sans-serif';
  const pad={left:47,right:18,top:24,bottom:42},pw=w-pad.left-pad.right,ph=h-pad.top-pad.bottom;
  const isSpectrum=canvas.dataset.countChart==='spectrum',topValue=isSpectrum?Math.max(1,Math.ceil(r.values[0]/50)*50):100;
  const x=k=>pad.left+pw*k/64,y=value=>pad.top+ph*(1-value/topValue);
  const ticks=isSpectrum?[0,topValue/4,topValue/2,topValue*3/4,topValue]:[0,25,50,75,100];
  for(const tick of ticks){line(ctx,[pad.left,y(tick)],[w-pad.right,y(tick)],C.grid);label(ctx,number(tick,0)+(isSpectrum?'':' %'),pad.left-7,y(tick)+4,'right');}
  line(ctx,[pad.left,pad.top],[pad.left,h-pad.bottom],C.ink);
  line(ctx,[pad.left,h-pad.bottom],[w-pad.right,h-pad.bottom],C.ink);
  const xTicks=w<420?[0,16,32,48,64]:[0,8,16,32,48,64];
  for(const tick of xTicks){const at=isSpectrum&&tick===0 ? .5 : tick;
   line(ctx,[x(at),h-pad.bottom],[x(at),h-pad.bottom+4],C.ink);
   label(ctx,String(isSpectrum&&tick===0?1:tick),x(at),h-pad.bottom+19,'center');
  }
  if(isSpectrum){
   r.values.forEach((value,i)=>{ctx.fillStyle=i<r.k?C.kept:C.omitted;const height=ph*value/topValue;ctx.fillRect(x(i)+.6,y(value),Math.max(.4,pw/64-1.2),height);});
   label(ctx,'λⱼ',pad.left,14);
   label(ctx,text('Pořadí složky j','Component index j'),w-pad.right,h-2,'right');
  }else{
   ctx.strokeStyle=C.ink;ctx.lineWidth=1.8;ctx.beginPath();r.cumulative.forEach((v,k)=>ctx[k?'lineTo':'moveTo'](x(k),y(v*100)));ctx.stroke();ctx.lineWidth=1;
   label(ctx,text('Zachovaný rozptyl','Variance retained'),pad.left,14);
   label(ctx,text('Počet složek k','Component count k'),w-pad.right,h-2,'right');
  }
  ctx.save();ctx.setLineDash([4,4]);line(ctx,[x(r.k),pad.top],[x(r.k),h-pad.bottom],C.orange,1.4);ctx.restore();
  const point=isSpectrum&&r.k>0?[x(r.k-.5),y(r.lastVariance)]:!isSpectrum?[x(r.k),y(100*r.retained)]:null;
  if(point){ctx.beginPath();ctx.arc(...point,4,0,2*Math.PI);ctx.fillStyle=C.kept;ctx.fill();}
  canvas._countGeometry={canvasWidth:w,left:pad.left,width:pw,k:r.k,values:r.values.slice(),cumulative:r.cumulative.slice(),marker:point};
 }
 function render(){
  const state=window.GeometryLab?.state;if(!state)return;
  latest=M.report(D,state.k,state.digitExample);
  charts.forEach(canvas=>draw(canvas,latest));
  set('[data-count-retained]',number(100*latest.retained,1)+' %');set('[data-count-mse]',number(latest.mse,4));
  set('[data-count-status]',latest.k===0?
   text('k = 0: žádná složka. Kumulativní podíl je 0 % a rekonstrukce je společný trénovací průměr.','k = 0: no components. The cumulative fraction is 0% and reconstruction is the shared training mean.'):
   latest.k===64?text('k = 64: všechny složky. Rekonstrukce obnoví původní hodnoty až na numerické zaokrouhlení.','k = 64: all components. Reconstruction recovers the original values up to numerical rounding.'):
   text(`Poslední ponechaná složka je PC${latest.k}, λ${latest.k} = ${number(latest.lastVariance,2)}. Pro obrázek ukládáme ${latest.k} nových souřadnic místo 64 původních hodnot.`,`The last retained component is PC${latest.k}, λ${latest.k} = ${number(latest.lastVariance,2)}. We store ${latest.k} new coordinates per image instead of 64 original values.`));
  const body=root.querySelector('[data-count-table]');
  body.innerHTML=latest.values.map((value,j)=>`<tr data-included="${j<latest.k}"><td>${j+1}</td><td>${number(value,6)}</td><td>${number(100*latest.fractions[j],3)} %</td><td>${number(100*latest.cumulative[j+1],3)} %</td><td>${j<latest.k?text('ponechána','retained'):text('vynechána','omitted')}</td></tr>`).join('');
  root.querySelectorAll('[data-count-target]').forEach(el=>{el.title=text('Nejmenší počet složek: ','Smallest component count: ')+M.countForFraction(D.explained_variance,+el.dataset.countTarget);});
 }
 function setCount(k){window.GeometryLab.state.k=Math.max(0,Math.min(64,k));window.GeometryLab.render();}
 root.querySelectorAll('[data-count-target]').forEach(el=>el.addEventListener('click',()=>setCount(M.countForFraction(D.explained_variance,+el.dataset.countTarget))));
 charts.forEach(canvas=>canvas.addEventListener('click',event=>{
  const g=canvas._countGeometry;if(!g)return;const x=event.clientX-canvas.getBoundingClientRect().left;setCount(Math.round((x-g.left)/g.width*64));
 }));
 document.addEventListener('geometry:digits',render);
 let pending=0;const observer=new ResizeObserver(()=>{cancelAnimationFrame(pending);pending=requestAnimationFrame(render);});charts.forEach(canvas=>observer.observe(canvas.parentElement));
 window.addEventListener('beforeprint',()=>{
  for(const canvas of charts){
   draw(canvas,latest,canvas._countGeometry?.canvasWidth||700);
   root.querySelectorAll(`[data-count-print="${canvas.dataset.countChart}"]`).forEach(img=>{if(img.lang===(english()?'en':'cs'))img.src=canvas.toDataURL('image/png');});
  }
 });
 window.PcaCountLab={render,getReport:()=>latest,setCount};render();
})();
