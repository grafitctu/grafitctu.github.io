/* Labelled teaching models; no editor API or remote service is invoked. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const notes = $('notes-panel'), notesToggle = $('notes-toggle');
  const noteData = JSON.parse($('notes-data').textContent);
  const currentPage = () => Math.max(1, Math.min(37, Number(location.hash.match(/^#slide-(\d+)$/)?.[1]) || 1));
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

  const lab=$('lab-dialog'),canvas=$('lab-canvas'),ctx=canvas.getContext('2d');
  const initial={'loop-fps':60,'loop-logic':18,'loop-render':4,'loop-parts':1};
  let frames=0;
  const read=id=>{
    const e=$(id),v=Number(e.value),fallback=initial[id];
    const bounded=e.value.trim()&&Number.isFinite(v)?Math.min(Number(e.max),Math.max(Number(e.min),v)):fallback;
    return id==='loop-parts'?Math.round(bounded):bounded;
  };
  function calculate(){
    const fps=read('loop-fps'),logic=read('loop-logic'),render=read('loop-render'),parts=read('loop-parts');
    const budget=1000/fps,logicPerFrame=logic/parts,work=logicPerFrame+render;
    return {fps,logic,render,parts,budget,logicPerFrame,work,overrun:Math.max(0,work-budget),slack:Math.max(0,budget-work),minimumCompletionMs:parts*budget,frames,completedTasks:Math.floor(frames/parts)};
  }
  function update(){
    const s=calculate(),scale=590/Math.max(s.budget,s.work,1);
    ctx.fillStyle='#111d23';ctx.fillRect(0,0,700,300);ctx.font='18px Segoe UI';ctx.fillStyle='#e5edf1';
    ctx.fillText('Čas jednoho snímku (ms) — zjednodušený model',25,32);
    ctx.fillStyle='#8dcde1';ctx.fillRect(35,80,s.logicPerFrame*scale,54);
    ctx.fillStyle='#c7b9e3';ctx.fillRect(35+s.logicPerFrame*scale,80,s.render*scale,54);
    const x=35+s.budget*scale;ctx.strokeStyle='#f3cf88';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x,58);ctx.lineTo(x,155);ctx.stroke();
    ctx.fillStyle='#e5edf1';ctx.fillText('Logika '+s.logicPerFrame.toFixed(2)+' ms',35,195);ctx.fillText('Vykreslení '+s.render.toFixed(2)+' ms',35,226);ctx.fillText('Limit '+s.budget.toFixed(2)+' ms',35,257);
    $('lab-result').textContent='Rozpočet: '+s.budget.toFixed(2)+' ms\nPráce na snímek: '+s.work.toFixed(2)+' ms\n'+(s.overrun>1e-9?'Překročení: '+s.overrun.toFixed(2)+' ms':'Rezerva: '+s.slack.toFixed(2)+' ms')+'\nÚloha potřebuje '+s.parts+' snímků; při dodržení cílové frekvence '+s.minimumCompletionMs.toFixed(2)+' ms.\nProvedené kroky: '+s.frames+' · dokončené úlohy: '+s.completedTasks+(s.overrun>1e-9?'\nCílová frekvence není s těmito sériovými časy dosažitelná.':'');
    window.VGALoopBudget.state=s;
  }
  window.VGALoopBudget={state:null};
  const open=()=>{if(!lab.open)lab.showModal();update();};
  $('lab-toggle').addEventListener('click',open);
  document.querySelectorAll('[data-open-lab]').forEach(b=>b.addEventListener('click',open));
  for(const id of Object.keys(initial))$(id).addEventListener('input',()=>{frames=0;update();});
  $('lab-step').addEventListener('click',()=>{frames++;update();});
  $('lab-reset').addEventListener('click',()=>{for(const [id,value] of Object.entries(initial))$(id).value=value;frames=0;update();});
  $('print-button').addEventListener('click',()=>window.print());
  update();

})();
