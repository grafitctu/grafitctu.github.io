/* Labelled teaching models; no editor API or remote service is invoked. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const notes = $('notes-panel'), notesToggle = $('notes-toggle');
  const noteData = JSON.parse($('notes-data').textContent);
  const currentPage = () => Math.max(1, Math.min(46, Number(location.hash.match(/^#slide-(\d+)$/)?.[1]) || 1));
  function updateNotes() {
    const n = noteData[currentPage()];
    $('notes-title').textContent = n.title;
    $('notes-comment').textContent = n.comment;
    $('notes-original').textContent = n.original;
  }
  const launchers = new Map();
  for (const dialog of document.querySelectorAll('dialog')) {
    for (const method of ['show', 'showModal']) {
      const original = dialog[method].bind(dialog);
      dialog[method] = () => { launchers.set(dialog, document.activeElement); original(); };
    }
    dialog.addEventListener('close', () => {
      if (dialog === notes) notesToggle.setAttribute('aria-expanded', 'false');
      const trigger = launchers.get(dialog);
      if (trigger && trigger !== document.body && trigger.isConnected && !trigger.closest('[hidden]')) trigger.focus();
    });
    dialog.addEventListener('keydown', event => {
      if (event.key !== 'Tab' || !dialog.matches(':modal')) return;
      const elements = [...dialog.querySelectorAll('button:not(:disabled),input:not(:disabled),a[href],summary,[tabindex="0"]')].filter(e => e.getClientRects().length);
      const first = elements[0], last = elements.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    });
  }
  function toggleNotes() {
    if (notes.open) { notes.close(); return; }
    updateNotes();
    const modal = matchMedia('(max-width:760px)').matches;
    notes.setAttribute('aria-modal', String(modal));
    modal ? notes.showModal() : notes.show();
    notesToggle.setAttribute('aria-expanded', 'true');
  }
  notesToggle.addEventListener('click', toggleNotes);
  new MutationObserver(updateNotes).observe($('counter'), {subtree:true,childList:true,characterData:true});
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && notes.open && !notes.matches(':modal') && !document.querySelector('dialog:modal')) { notes.close(); return; }
    if (event.ctrlKey || event.altKey || event.metaKey || document.querySelector('dialog:modal') || event.target.closest('input,textarea,select,[contenteditable]')) return;
    if (event.key.toLowerCase() === 'n') { event.preventDefault(); toggleNotes(); }
  });
  matchMedia('(max-width:760px)').addEventListener('change', () => { if (notes.open) notes.close(); });

  const lab=$('lab-dialog'),openLab=()=>{if(!lab.open)lab.showModal();};
  $('lab-toggle').addEventListener('click',openLab);
  document.querySelectorAll('[data-open-lab]').forEach(b=>b.addEventListener('click',openLab));
  $('print-button').addEventListener('click',()=>window.print());
  const canvas=$('lab-canvas'),ctx=canvas.getContext('2d');
  const signal=(x,sigma)=>.02+.98*Math.exp(-.5*((x-37)/sigma)**2);
  function samples(n,sigma,adaptive){
    let points=Array.from({length:adaptive?5:n},(_,i)=>90*i/((adaptive?5:n)-1));
    const cache=new Map(),f=x=>{if(!cache.has(x))cache.set(x,signal(x,sigma));return cache.get(x);};
    points.forEach(f);
    while(points.length<n){
      let chosen=0,score=-1;
      for(let i=0;i<points.length-1;i++){
        const a=points[i],b=points[i+1],m=(a+b)/2;
        const error=Math.abs(f(m)-(f(a)+f(b))/2)+1e-5*(b-a);
        if(error>score){score=error;chosen=i;}
      }
      points.splice(chosen+1,0,(points[chosen]+points[chosen+1])/2);
    }
    return {points:points.map(x=>({x,y:f(x)})),evaluations:cache.size};
  }
  function error(points,sigma){
    let total=0,j=0;
    for(let i=0;i<=360;i++){const x=i/4;while(j<points.length-2&&points[j+1].x<x)j++;
      const a=points[j],b=points[j+1],y=a.y+(b.y-a.y)*(x-a.x)/(b.x-a.x);total+=(y-signal(x,sigma))**2;}
    return Math.sqrt(total/361);
  }
  function render(){
    const n=Math.max(5,Math.min(65,Math.round(Number($('sample-n').value)||12)));
    const sigma=Math.max(1,Math.min(20,Number($('sample-width').value)||3));
    const uniform=samples(n,sigma,false),adaptive=samples(n,sigma,true);
    ctx.fillStyle='#111d23';ctx.fillRect(0,0,700,330);const x=t=>50+t*6.7,y=v=>280-220*v;
    ctx.strokeStyle='#afbec8';ctx.lineWidth=2;ctx.beginPath();for(let t=0;t<=90;t+=.25)t===0?ctx.moveTo(x(t),y(signal(t,sigma))):ctx.lineTo(x(t),y(signal(t,sigma)));ctx.stroke();
    for(const [data,color,square] of [[uniform,'#ffd43b',false],[adaptive,'#8dcde1',true]]){
      ctx.strokeStyle=color;ctx.fillStyle=color;ctx.beginPath();data.points.forEach((p,i)=>i?ctx.lineTo(x(p.x),y(p.y)):ctx.moveTo(x(p.x),y(p.y)));ctx.stroke();
      for(const p of data.points){if(square)ctx.fillRect(x(p.x)-3,y(p.y)-3,6,6);else{ctx.beginPath();ctx.arc(x(p.x),y(p.y),3,0,Math.PI*2);ctx.fill();}}
    }
    ctx.fillStyle='#e5edf1';ctx.font='16px Segoe UI';ctx.fillText('0°',40,310);ctx.fillText('90°',635,310);ctx.fillText('normalizovaná odezva',50,25);
    const u=error(uniform.points,sigma),a=error(adaptive.points,sigma);
    $('lab-result').textContent='Kroužky: rovnoměrné · '+n+' vzorků / '+uniform.evaluations+' vyhodnocení; RMS '+u.toFixed(4)+'\nČtverečky: adaptivní · '+n+' uchovaných vzorků / '+adaptive.evaluations+' vyhodnocení včetně sond; RMS '+a.toFixed(4)+'\nŠedá čára: známý syntetický předpis. Adaptivní přístup nemá zaručenou převahu pro každý signál a rozpočet.';
    window.PG2Sampling.state={n,sigma,uniform,adaptive,uniformError:u,adaptiveError:a};
  }
  window.PG2Sampling={samples,signal,error,state:null};
  for(const id of ['sample-n','sample-width'])$(id).addEventListener('input',render);
  $('lab-reset').addEventListener('click',()=>{$('sample-n').value=12;$('sample-width').value=3;render();});render();

})();
