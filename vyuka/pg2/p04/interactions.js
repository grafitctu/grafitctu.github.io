/* Labelled teaching models; no editor API or remote service is invoked. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const notes = $('notes-panel'), notesToggle = $('notes-toggle');
  const noteData = JSON.parse($('notes-data').textContent);
  const currentPage = () => Math.max(1, Math.min(43, Number(location.hash.match(/^#slide-(\d+)$/)?.[1]) || 1));
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

  const lab=$('lab-dialog');
  window.GrafitStereo={state:null};
  const ids=['tilt','azimuth','albedo','noise'],defaults=[20,45,.6,0];
  function update(){
    const [tilt,azimuth,rho,noise]=ids.map(i=>Number($(i).value)),rad=Math.PI/180;
    const n=[Math.sin(tilt*rad)*Math.cos(azimuth*rad),Math.sin(tilt*rad)*Math.sin(azimuth*rad),Math.cos(tilt*rad)];
    const a=Math.sin(35*rad),b=Math.cos(35*rad),lights=[0,120,240].map(p=>[a*Math.cos(p*rad),a*Math.sin(p*rad),b]);
    const clean=lights.map(l=>rho*l.reduce((s,v,i)=>s+v*n[i],0));const I=clean.map((v,i)=>Math.max(0,v+(i===0?noise:0)));
    const g=[(2*I[0]-I[1]-I[2])/(3*a),(I[1]-I[2])/(Math.sqrt(3)*a),(I[0]+I[1]+I[2])/(3*b)];
    const estimatedAlbedo=Math.hypot(...g),estimatedNormal=estimatedAlbedo>1e-10?g.map(v=>v/estimatedAlbedo):null;
    const angle=estimatedNormal?Math.acos(Math.max(-1,Math.min(1,n.reduce((s,v,i)=>s+v*estimatedNormal[i],0))))/rad:null;
    $('lab-result').textContent='Nastavení: odklon '+tilt+'°, azimut '+azimuth+'°, ρ='+rho.toFixed(2)+', odchylka '+noise.toFixed(3)+'. Intenzity: ['+I.map(x=>x.toFixed(4)).join(', ')+']. Odhad ρ='+estimatedAlbedo.toFixed(4)+'. '+(estimatedNormal?'Normála ['+estimatedNormal.map(x=>x.toFixed(4)).join(', ')+']; úhlová chyba '+angle.toFixed(3)+'°.':'Normála neurčitelná: nulový vektor g.');
    const path=v=>'M160 150 L'+(160+120*v[0]).toFixed(2)+' '+(150-120*v[2]).toFixed(2);
    $('true-normal').setAttribute('d',path(n));$('estimated-normal').setAttribute('d',estimatedNormal?path(estimatedNormal):'');
    window.GrafitStereo.state={normal:n,rho,noise,clean,intensities:I,estimatedAlbedo,estimatedNormal,angle};
  }
  ids.forEach(i=>$(i).addEventListener('input',update));$('lab-reset').addEventListener('click',()=>{ids.forEach((i,k)=>$(i).value=defaults[k]);update()});
  const open=()=>{if(!lab.open)lab.showModal();update()};$('lab-toggle').addEventListener('click',open);document.querySelectorAll('[data-open-lab]').forEach(b=>b.addEventListener('click',open));$('print-button').addEventListener('click',()=>print());
  function fitMath(){document.querySelectorAll('.equation').forEach(el=>{el.style.fontSize='';const math=el.querySelector('math');if(math&&el.clientWidth){const f=parseFloat(getComputedStyle(el).fontSize);if(math.scrollWidth>el.clientWidth)el.style.fontSize=Math.max(10,f*el.clientWidth/math.scrollWidth*.97)+'px'}})}
  new ResizeObserver(fitMath).observe($('deck'));addEventListener('hashchange',fitMath);$('reading').addEventListener('click',fitMath);update();

})();
