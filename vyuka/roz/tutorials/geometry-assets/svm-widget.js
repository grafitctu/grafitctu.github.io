(function(){
  'use strict';
  const root=document.querySelector('[data-svm-root]');if(!root)return;
  const M=window.SvmGeometryMath,data=M.sample();
  const requested=new URLSearchParams(location.search).get('svm');
  const state={view:['linear','radial'].includes(requested)?requested:'linear',angle:25,offset:0,flip:false,height:1.44,cx:0,cy:0,yaw:-35,pitch:24,ghosts:true};
  const colors={inner:'#3d5d99',outer:'#b56b35',ink:'#1a2933',muted:'#586a73',grid:'#dce1dc',plane:'#087f76',paper:'#fcfbf7'};
  const rad=degrees=>degrees*Math.PI/180,clamp=(value,lo,hi)=>Math.min(hi,Math.max(lo,value));
  const en=()=>document.body.dataset.lang==='en',text=(cs,english)=>en()?english:cs;
  const num=(value,digits=2)=>Number(Math.abs(value)<.5*10**(-digits)?0:value).toLocaleString(en()?'en-GB':'cs-CZ',{minimumFractionDigits:digits,maximumFractionDigits:digits});
  let lineReport,radialReport;
  function setup(canvas,height){
    // Resize/print transitions can briefly collapse a grid track below its plot
    // padding. Wait for the next stable layout instead of producing a negative scale.
    const width=Math.round(canvas.getBoundingClientRect().width);if(width<120)return null;
    const dpr=window.devicePixelRatio||1;canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);canvas.style.height=height+'px';
    const ctx=canvas.getContext('2d');ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,width,height);ctx.font='14px "Segoe UI",Arial,sans-serif';
    return{ctx,w:width,h:height};
  }
  function label(ctx,value,x,y,align='center',color=colors.muted){ctx.fillStyle=color;ctx.textAlign=align;ctx.fillText(value,x,y);}
  function segment(ctx,a,b,color,width=1){ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(...a);ctx.lineTo(...b);ctx.stroke();ctx.lineWidth=1;}
  function polygon(ctx,points,fill,stroke=null){ctx.beginPath();points.forEach((p,i)=>ctx[i?'lineTo':'moveTo'](...p));ctx.closePath();if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1.5;ctx.stroke();ctx.lineWidth=1;}}
  function point(ctx,x,y,labelValue,wrong,size=4){
    const color=labelValue?colors.outer:colors.inner;ctx.beginPath();ctx.arc(x,y,size,0,2*Math.PI);ctx.lineWidth=1.7;
    if(labelValue){ctx.strokeStyle=color;ctx.stroke();}else{ctx.fillStyle=color;ctx.fill();}ctx.lineWidth=1;
    if(wrong){segment(ctx,[x-3,y-3],[x+3,y+3],colors.ink,1.1);segment(ctx,[x-3,y+3],[x+3,y-3],colors.ink,1.1);}
  }
  function clipHalfPlane(vertices,normal,offset,positive){
    const score=p=>(normal[0]*p[0]+normal[1]*p[1]-offset)*(positive?1:-1),output=[];
    for(let i=0;i<vertices.length;i++){
      const a=vertices[i],b=vertices[(i+1)%vertices.length],sa=score(a),sb=score(b);
      if(sa>=0)output.push(a);
      if((sa>=0)!==(sb>=0)){const t=sa/(sa-sb);output.push([a[0]+t*(b[0]-a[0]),a[1]+t*(b[1]-a[1])]);}
    }return output;
  }
  function draw2D(canvas,kind){
    const prepared=setup(canvas,kind==='linear'?365:340);if(!prepared)return;
    const {ctx,w,h}=prepared,limit=2.3,plotH=h-46,scale=Math.min((w-90)/(2*limit),(plotH-35)/(2*limit)),center=[w/2,(plotH+10)/2];
    const map=p=>[center[0]+p[0]*scale,center[1]-p[1]*scale],bounds=[[-limit,-limit],[limit,-limit],[limit,limit],[-limit,limit]];
    canvas._svm2d={center,scale};
    ctx.save();ctx.beginPath();ctx.rect(...map([-limit,limit]),2*limit*scale,2*limit*scale);ctx.clip();
    if(kind==='linear'){
      for(const positive of [false,true]){
        const p=clipHalfPlane(bounds,lineReport.normal,state.offset,positive),pred=(positive?1:0)^(state.flip?1:0);
        if(p.length)polygon(ctx,p.map(map),pred?'rgba(181,107,53,.06)':'rgba(61,93,153,.05)');
      }
    }else{
      polygon(ctx,bounds.map(map),'rgba(181,107,53,.06)');ctx.fillStyle='rgba(61,93,153,.08)';ctx.beginPath();ctx.arc(...map([state.cx,state.cy]),radialReport.radius*scale,0,2*Math.PI);ctx.fill();
    }
    ctx.restore();
    for(let tick=-2;tick<=2;tick++){
      const px=map([tick,0])[0],py=map([0,tick])[1];
      segment(ctx,[px,map([0,limit])[1]],[px,map([0,-limit])[1]],colors.grid);
      segment(ctx,[map([-limit,0])[0],py],[map([limit,0])[0],py],colors.grid);
      label(ctx,String(tick),px,map([0,-limit])[1]+21);label(ctx,String(tick),map([-limit,0])[0]-9,py+4,'right');
    }
    label(ctx,'x',w-24,h-5,'right');label(ctx,'y',25,17,'left');
    ctx.save();ctx.beginPath();ctx.rect(...map([-limit,limit]),2*limit*scale,2*limit*scale);ctx.clip();
    if(kind==='linear'){
      const n=lineReport.normal,t=[Math.cos(rad(state.angle)),Math.sin(rad(state.angle))],pivot=n.map(v=>v*state.offset);
      segment(ctx,map([pivot[0]-8*t[0],pivot[1]-8*t[1]]),map([pivot[0]+8*t[0],pivot[1]+8*t[1]]),colors.ink,2.4);
    }else{
      const c=map([state.cx,state.cy]);ctx.strokeStyle=colors.plane;ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(...c,radialReport.radius*scale,0,2*Math.PI);ctx.stroke();ctx.lineWidth=1;
      segment(ctx,[c[0]-7,c[1]],[c[0]+7,c[1]],colors.ink,2);segment(ctx,[c[0],c[1]-7],[c[0],c[1]+7],colors.ink,2);label(ctx,'c',c[0]+11,c[1]-9,'left',colors.ink);
    }
    const report=kind==='linear'?lineReport:radialReport;
    data.points.forEach((p,i)=>point(ctx,...map(p),data.labels[i],report.wrong[i]));ctx.restore();
  }
  function draw3D(canvas){
    const prepared=setup(canvas,340);if(!prepared)return;
    const {ctx,w,h}=prepared,limit=2.2,points=data.points.map((p,i)=>[...p,radialReport.z[i]]),top=Math.max(4,state.height,...radialReport.z);
    const ground=[[-limit,-limit,0],[limit,-limit,0],[limit,limit,0],[-limit,limit,0]],plane=ground.map(p=>[p[0],p[1],state.height]);
    const raw=p=>M.view(p,rad(state.yaw),rad(state.pitch)),all=[...points,...ground,...plane,[-limit,-limit,top]].map(raw);
    const minX=Math.min(...all.map(p=>p[0])),maxX=Math.max(...all.map(p=>p[0])),minY=Math.min(...all.map(p=>p[1])),maxY=Math.max(...all.map(p=>p[1]));
    const scale=Math.min((w-82)/(maxX-minX||1),(h-64)/(maxY-minY||1));
    const map=p=>{const q=raw(p);return[w/2+(q[0]-(minX+maxX)/2)*scale,h/2+(q[1]-(minY+maxY)/2)*scale,q[2]];};
    const xy=p=>map(p).slice(0,2);
    for(let tick=-2;tick<=2;tick++){
      segment(ctx,xy([tick,-limit,0]),xy([tick,limit,0]),colors.grid);
      segment(ctx,xy([-limit,tick,0]),xy([limit,tick,0]),colors.grid);
    }
    if(state.ghosts){
      ctx.globalAlpha=.22;points.forEach((p,i)=>point(ctx,...xy([p[0],p[1],0]),data.labels[i],false,2.5));
      ctx.setLineDash([3,5]);points.forEach((p,i)=>{if(i%8===0)segment(ctx,xy([p[0],p[1],0]),xy(p),colors.muted);});ctx.setLineDash([]);ctx.globalAlpha=1;
    }
    const events=points.map((p,i)=>({type:'point',i,p,depth:raw(p)[2]}));
    events.push({type:'plane',depth:plane.reduce((sum,p)=>sum+raw(p)[2]/4,0)});events.sort((a,b)=>a.depth-b.depth);
    for(const event of events){
      if(event.type==='plane')polygon(ctx,plane.map(xy),'rgba(8,127,118,.12)',colors.plane);
      else point(ctx,...xy(event.p),data.labels[event.i],radialReport.wrong[event.i]);
    }
    const origin=[-limit,-limit,0],axes=[[[limit,-limit,0],text('osa x','x axis')],[[-limit,limit,0],text('osa y','y axis')],[[-limit,-limit,top],'z']];
    for(const [end,title]of axes){
      segment(ctx,xy(origin),xy(end),colors.muted,1.3);const q=xy(end);ctx.textAlign='center';ctx.strokeStyle=colors.paper;ctx.lineWidth=4;ctx.strokeText(title,q[0],q[1]-7);ctx.lineWidth=1;label(ctx,title,q[0],q[1]-7,'center',colors.ink);
    }
    const zStep=top>6?2:1;
    for(let value=0;value<=top;value+=zStep){const q=xy([-limit,-limit,value]);label(ctx,num(value,0),q[0]-7,q[1]+4,'right');}
    label(ctx,'z = '+num(state.height),w-12,18,'right',colors.plane);
    canvas._svmScene={z:radialReport.z.slice(),height:state.height,yaw:state.yaw,pitch:state.pitch};
  }
  function render(){
    root.querySelectorAll('[data-svm-panel]').forEach(el=>el.hidden=el.dataset.svmPanel!==state.view);
    root.querySelectorAll('[data-svm-view]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.svmView===state.view)));
    lineReport=M.linear(data,rad(state.angle),state.offset,state.flip);radialReport=M.radial(data,state.cx,state.cy,state.height);
    root.querySelectorAll('[data-svm-control]').forEach(el=>el.value=state[el.dataset.svmControl]);
    root.querySelectorAll('[data-svm-value]').forEach(el=>{const key=el.dataset.svmValue;el.textContent=num(state[key],key==='angle'?1:2)+(key==='angle'?'°':'');});
    root.querySelector('[data-svm-errors="linear"]').textContent=lineReport.errors;root.querySelector('[data-svm-errors="radial"]').textContent=radialReport.errors;
    root.querySelector('[data-svm-radius]').textContent=num(radialReport.radius);
    root.querySelector('[data-svm-ghosts]').checked=state.ghosts;
    root.querySelectorAll('canvas[data-svm-plot]').forEach(canvas=>canvas.dataset.svmPlot==='lift'?draw3D(canvas):draw2D(canvas,canvas.dataset.svmPlot));
  }
  root.querySelectorAll('[data-svm-view]').forEach(button=>button.addEventListener('click',()=>{
    state.view=button.dataset.svmView;
    const url=new URL(location.href);url.searchParams.set('svm',state.view);history.replaceState(null,'',url);render();
  }));
  root.querySelectorAll('[data-svm-control]').forEach(input=>input.addEventListener('input',()=>{state[input.dataset.svmControl]=+input.value;render();}));
  root.querySelector('[data-svm-flip]').addEventListener('click',()=>{state.flip=!state.flip;render();});
  root.querySelector('[data-svm-reset-line]').addEventListener('click',()=>{Object.assign(state,{angle:25,offset:0,flip:false});render();});
  root.querySelector('[data-svm-reset-radial]').addEventListener('click',()=>{Object.assign(state,{height:1.44,cx:0,cy:0});render();});
  root.querySelector('[data-svm-reset-camera]').addEventListener('click',()=>{Object.assign(state,{yaw:-35,pitch:24});render();});
  root.querySelector('[data-svm-ghosts]').addEventListener('change',event=>{state.ghosts=event.target.checked;render();});
  const radialCanvas=root.querySelector('[data-svm-plot="radial"]'),liftCanvas=root.querySelector('[data-svm-plot="lift"]');
  function moveCentre(event){const g=radialCanvas._svm2d,r=radialCanvas.getBoundingClientRect();if(!g)return;state.cx=clamp((event.clientX-r.left-g.center[0])/g.scale,-1,1);state.cy=clamp(-(event.clientY-r.top-g.center[1])/g.scale,-1,1);render();}
  let moving=false;radialCanvas.addEventListener('pointerdown',event=>{moving=true;radialCanvas.setPointerCapture(event.pointerId);moveCentre(event);});
  radialCanvas.addEventListener('pointermove',event=>{if(moving)moveCentre(event);});
  for(const name of ['pointerup','pointercancel'])radialCanvas.addEventListener(name,()=>moving=false);
  let camera=null;liftCanvas.addEventListener('pointerdown',event=>{camera=[event.clientX,event.clientY];liftCanvas.setPointerCapture(event.pointerId);});
  liftCanvas.addEventListener('pointermove',event=>{if(!camera)return;state.yaw=(state.yaw+(event.clientX-camera[0])*.6)%360;state.pitch=clamp(state.pitch-(event.clientY-camera[1])*.35,10,75);camera=[event.clientX,event.clientY];render();});
  for(const name of ['pointerup','pointercancel'])liftCanvas.addEventListener(name,()=>camera=null);
  for(const canvas of [radialCanvas,liftCanvas])canvas.addEventListener('keydown',event=>{
    if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key))return;
    event.preventDefault();event.stopPropagation();const dx=event.key==='ArrowLeft'?-1:event.key==='ArrowRight'?1:0,dy=event.key==='ArrowDown'?-1:event.key==='ArrowUp'?1:0;
    if(canvas===radialCanvas){state.cx=clamp(state.cx+dx*.05,-1,1);state.cy=clamp(state.cy+dy*.05,-1,1);}else{state.yaw+=dx*5;state.pitch=clamp(state.pitch+dy*5,10,75);}render();
  });
  let pending=0;const observer=new ResizeObserver(()=>{cancelAnimationFrame(pending);pending=requestAnimationFrame(render);});
  root.querySelectorAll('canvas').forEach(canvas=>observer.observe(canvas.parentElement));
  document.addEventListener('geometry:change',render);
  window.SvmGeometryLab={state,render,getData:()=>data,getLinear:()=>lineReport,getRadial:()=>radialReport};render();
})();
