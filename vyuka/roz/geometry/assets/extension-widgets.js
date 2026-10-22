(function(){
 'use strict';if(!document.querySelector('#clustering-compare'))return;
 const M=window.GeometryMath,E=window.GeometryExtensionMath,bank=window.GeometrySvmModels,points=M.moons().points;
 const state={k:2,seed:17,frame:0,eps:.18,dataset:'blobs',kernel:'linear',ci:1,gi:1,test:false,gap:.72};
 const Cs=[.1,1,10,100],gammas=[.1,1,10],palette=['#087f76','#b56b35','#526ca4','#94426e'];
 const C={ink:'#1a2933',muted:'#586a73',grid:'#dce1dc',blue:'#526ca4',orange:'#b56b35',teal:'#087f76',purple:'#94426e',pale:'#c7ceca'};
 const en=()=>document.body.dataset.lang==='en',t=(cs,english)=>en()?english:cs,num=(v,d=2)=>Number(Math.abs(v)<.5*10**(-d)?0:v).toLocaleString(en()?'en-GB':'cs-CZ',{minimumFractionDigits:d,maximumFractionDigits:d});
 let km=E.kmeans(points),db=M.dbscan(points),ldaReport,svmModel,preparingPrint=false;
 const canvases=[...document.querySelectorAll('[data-extension-plot]')];
 const set=(selector,value)=>document.querySelectorAll(selector).forEach(el=>el.textContent=value);
 function setup(canvas,height=350){
  const measured=Math.round(canvas.getBoundingClientRect().width),w=measured|| (preparingPrint?(canvas._extensionWidth||700):0);if(w<120)return;
  canvas._extensionWidth=w;
  const dpr=window.devicePixelRatio||1;canvas.width=w*dpr;canvas.height=height*dpr;canvas.style.height=height+'px';
  const ctx=canvas.getContext('2d');ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,height);ctx.font='14px "Segoe UI",Arial,sans-serif';return {ctx,w,h:height};
 }
 function line(ctx,a,b,color,width=1){ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(...a);ctx.lineTo(...b);ctx.stroke();ctx.lineWidth=1;}
 function dot(ctx,p,color,size=3,fill=true){ctx.beginPath();ctx.arc(...p,size,0,Math.PI*2);ctx[fill?'fillStyle':'strokeStyle']=color;ctx[fill?'fill':'stroke']();}
 function cross(ctx,p,color,size=5){line(ctx,[p[0]-size,p[1]-size],[p[0]+size,p[1]+size],color,1.5);line(ctx,[p[0]-size,p[1]+size],[p[0]+size,p[1]-size],color,1.5);}
 function label(ctx,value,x,y,align='left',color=C.muted){ctx.textAlign=align;ctx.fillStyle=color;ctx.fillText(value,x,y);}
 function drawClusters(canvas){
  const p=setup(canvas);if(!p)return;const {ctx,w,h}=p,mu=M.mean(points),scale=Math.min((w-80)/3.9,(h-65)/2.5),map=q=>[w/2+(q[0]-mu[0])*scale,h/2-(q[1]-mu[1])*scale];
  for(const x of [-1,0,1,2]){const q=map([x,mu[1]]);line(ctx,[q[0],15],[q[0],h-25],C.grid);label(ctx,String(x),q[0],h-8,'center');}
  const kind=canvas.dataset.extensionPlot,frame=km.frames[state.frame],labels=kind==='kmeans'?frame.labels:db.labels;
  points.forEach((point,i)=>{const p=map(point),l=labels[i];if(kind==='dbscan-compare'&&l<0)cross(ctx,p,C.muted,3);else dot(ctx,p,l<0?C.pale:palette[l%palette.length],3.5,kind==='kmeans'||db.core[i]);});
  if(kind==='kmeans')frame.centres.forEach((q,i)=>{dot(ctx,map(q),'#fcfbf7',9);cross(ctx,map(q),palette[i],8);});
  canvas._extensionReport={kind,labels:labels.slice(),centres:frame.centres.map(p=>p.slice())};
 }
 function drawMargin(canvas){
  const p=setup(canvas,365);if(!p)return;const {ctx,w,h}=p,dataset=bank.datasets[state.dataset],limit=dataset.limit,side=Math.min(w-80,h-55),left=(w-side)/2,top=12;
  const map=q=>[left+(q[0]+limit)/(2*limit)*side,top+(limit-q[1])/(2*limit)*side],grid=svmModel.grid,n=dataset.grid_size;
  for(let r=0;r<n-1;r+=2)for(let c=0;c<n-1;c+=2){ctx.fillStyle=grid[r][c]>=0?'rgba(181,107,53,.09)':'rgba(82,108,164,.09)';ctx.fillRect(left+c/(n-1)*side,top+(1-(r+2)/(n-1))*side,2*side/(n-1)+.5,2*side/(n-1)+.5);}
  for(const value of [-2,-1,0,1,2])if(Math.abs(value)<=limit){const q=map([value,0]),r=map([0,value]);line(ctx,[q[0],top],[q[0],top+side],C.grid);line(ctx,[left,r[1]],[left+side,r[1]],C.grid);label(ctx,String(value),q[0],top+side+18,'center');}
  const contours=[];
  for(const level of [-1,0,1]){
   ctx.save();if(level)ctx.setLineDash([5,4]);
   for(let r=0;r<n-1;r++)for(let c=0;c<n-1;c++){
    const vertices=[[c,r,grid[r][c]],[c+1,r,grid[r][c+1]],[c+1,r+1,grid[r+1][c+1]],[c,r+1,grid[r+1][c]]],hits=[];
    for(let edge=0;edge<4;edge++){const a=vertices[edge],b=vertices[(edge+1)%4];if((a[2]<level)!==(b[2]<level)){const f=(level-a[2])/(b[2]-a[2]);hits.push([left+(a[0]+f*(b[0]-a[0]))/(n-1)*side,top+(1-(a[1]+f*(b[1]-a[1]))/(n-1))*side]);}}
    for(let i=0;i+1<hits.length;i+=2){line(ctx,hits[i],hits[i+1],level?C.muted:C.ink,level?1:2);contours.push(level);}
   }ctx.restore();
  }
  const displayed=state.test?dataset.test:dataset.train,scores=state.test?svmModel.test_scores:svmModel.train_scores,support=new Set(svmModel.support);
  displayed.points.forEach((point,i)=>{const q=map(point),l=displayed.labels[i];dot(ctx,q,l?C.orange:C.blue,3.5,l===0);if((scores[i]>0?1:0)!==l)cross(ctx,q,C.ink,3);if(!state.test&&support.has(i))dot(ctx,q,C.ink,7.5,false);});
  label(ctx,state.test?t('Odložené body','Held-out points'):t('Trénovací body','Training points'),20,h-7);
  canvas._extensionReport={kind:'margin',dataset:state.dataset,kernel:state.kernel,C:svmModel.C,gamma:svmModel.gamma,support:svmModel.support.slice(),contours:contours.length,trainErrors:svmModel.train_errors,testErrors:svmModel.test_errors};
 }
 function drawLda(canvas){
  const p=setup(canvas,450);if(!p)return;const {ctx,w,h}=p,data=E.ldaData(state.gap),mu=M.mean(data.points),plotH=245;
  const dx=Math.max(...data.points.map(p=>Math.abs(p[0]-mu[0])))*1.1,dy=Math.max(...data.points.map(p=>Math.abs(p[1]-mu[1])))*1.2,scale=Math.min((w-75)/(2*dx),(plotH-40)/(2*dy));
  const centre=[w/2,plotH/2],map=p=>[centre[0]+(p[0]-mu[0])*scale,centre[1]-(p[1]-mu[1])*scale];
  data.points.forEach((p,i)=>dot(ctx,map(p),data.labels[i]?C.orange:C.blue,2.5));
  const directions=[ldaReport.pca.vectors[0],ldaReport.direction],colors=[C.teal,C.purple],R=Math.max(...data.points.map(p=>Math.hypot(p[0]-mu[0],p[1]-mu[1]))),stripScale=(w-75)/(2*R);
  directions.forEach((u,j)=>{
   const length=Math.min(130,w*.28),start=[centre[0]-u[0]*length,centre[1]+u[1]*length],end=[centre[0]+u[0]*length,centre[1]-u[1]*length];line(ctx,start,end,colors[j],3);label(ctx,j?'LDA':'PCA',end[0]+8,end[1]-6,'left',colors[j]);
   const y=295+j*85;line(ctx,[37,y],[w-38,y],C.muted);label(ctx,j?t('Projekce LDA','LDA projection'):t('Projekce PCA','PCA projection'),37,y-27,'left',colors[j]);
   for(const value of [-R,0,R])label(ctx,num(value,1),w/2+value*stripScale,y+23,'center');
   data.points.forEach((p,i)=>{const z=(p[0]-mu[0])*u[0]+(p[1]-mu[1])*u[1];dot(ctx,[w/2+z*stripScale,y-7-(i%4)*3],data.labels[i]?C.orange:C.blue,2.2);});
  });
  canvas._extensionReport={kind:'lda',pca:directions[0].slice(),lda:directions[1].slice(),fisherPca:ldaReport.fisherPca,fisherLda:ldaReport.fisherLda};
 }
 function render(){
  const frame=km.frames[state.frame];db=M.dbscan(points,state.eps,6);
  ldaReport=E.lda(E.ldaData(state.gap).points,E.ldaData(state.gap).labels);
  svmModel=bank.datasets[state.dataset].models.find(model=>model.kernel===state.kernel&&model.C===Cs[state.ci]&&(state.kernel==='linear'||model.gamma===gammas[state.gi]));
  document.querySelector('[data-kmeans-frame]').max=km.frames.length-1;document.querySelector('[data-kmeans-frame]').value=state.frame;
  set('[data-kmeans-frame-value]',state.frame+' / '+(km.frames.length-1));document.querySelector('[data-kmeans-next]').disabled=state.frame===km.frames.length-1;
  const phase=frame.phase==='initial'?t('Počáteční středy','Initial centres'):frame.phase==='assign'?t('Přiřazení k nejbližším středům','Assignment to nearest centres'):t('Posun středů do průměrů skupin','Moving centres to group means');
  set('[data-kmeans-status]',phase+(frame.sse===null?'':' · SSE = '+num(frame.sse,3)));
  set('[data-compare-eps-value]',num(state.eps,2));set('[data-compare-db-status]',t('DBSCAN: ','DBSCAN: ')+db.clusterCount+t(' shluky, ',' clusters, ')+db.noiseCount+t(' šumových bodů.',' noise points.'));
  set('[data-margin-c-value]',num(Cs[state.ci],1));set('[data-margin-gamma-value]',state.kernel==='linear'?'—':num(gammas[state.gi],1));document.querySelector('[data-margin-gamma]').disabled=state.kernel==='linear';
  const dataset=bank.datasets[state.dataset];set('[data-margin-train-errors]',svmModel.train_errors+' / '+dataset.train.points.length);set('[data-margin-test-errors]',svmModel.test_errors+' / '+dataset.test.points.length);set('[data-margin-support]',svmModel.support_count);
  set('[data-lda-gap-value]',num(state.gap,2));set('[data-lda-pca-angle]',num(ldaReport.pca.angle*180/Math.PI,1)+'°');set('[data-lda-angle]',num((ldaReport.angle*180/Math.PI+180)%180,1)+'°');
  for(const canvas of canvases){const kind=canvas.dataset.extensionPlot;if(kind==='margin')drawMargin(canvas);else if(kind==='lda')drawLda(canvas);else drawClusters(canvas);}
 }
 function reset(){km=E.kmeans(points,state.k,state.seed);state.frame=0;render();}
 document.querySelector('[data-kmeans-k]').addEventListener('change',event=>{state.k=+event.target.value;reset();});
 document.querySelector('[data-kmeans-reset]').addEventListener('click',()=>{state.seed++;reset();});
 document.querySelector('[data-kmeans-next]').addEventListener('click',()=>{state.frame=Math.min(state.frame+1,km.frames.length-1);render();});
 document.querySelector('[data-kmeans-final]').addEventListener('click',()=>{state.frame=km.frames.length-1;render();});
 document.querySelector('[data-kmeans-frame]').addEventListener('input',event=>{state.frame=+event.target.value;render();});
 document.querySelector('[data-compare-eps]').addEventListener('input',event=>{state.eps=+event.target.value;render();});
 for(const [key,selector] of [['dataset','[data-margin-dataset]'],['kernel','[data-margin-kernel]']])document.querySelector(selector).addEventListener('change',event=>{state[key]=event.target.value;render();});
 for(const [key,selector] of [['ci','[data-margin-c]'],['gi','[data-margin-gamma]']])document.querySelector(selector).addEventListener('input',event=>{state[key]=+event.target.value;render();});
 document.querySelector('[data-margin-test]').addEventListener('change',event=>{state.test=event.target.checked;render();});
 document.querySelector('[data-lda-gap]').addEventListener('input',event=>{state.gap=+event.target.value;render();});
 document.addEventListener('geometry:change',render);
 let pending=0;const observer=new ResizeObserver(()=>{cancelAnimationFrame(pending);pending=requestAnimationFrame(render);});canvases.forEach(c=>observer.observe(c.parentElement));
 window.addEventListener('beforeprint',()=>{preparingPrint=true;render();preparingPrint=false;for(const canvas of canvases)if(canvas._extensionReport)document.querySelectorAll(`[data-extension-print="${canvas.dataset.extensionPlot}"]`).forEach(img=>{if(img.lang===(en()?'en':'cs'))img.src=canvas.toDataURL('image/png');});});
 window.GeometryExtensions={state,render,getKmeans:()=>km,getDbscan:()=>db,getLda:()=>ldaReport,getSvm:()=>svmModel};render();
})();
