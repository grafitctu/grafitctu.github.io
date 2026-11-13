/* Labelled teaching models; no editor API or remote service is invoked. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const notes = $('notes-panel'), notesToggle = $('notes-toggle');
  const noteData = JSON.parse($('notes-data').textContent);
  const currentPage = () => Math.max(1, Math.min(56, Number(location.hash.match(/^#slide-(\d+)$/)?.[1]) || 1));
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

  const lab=$('lab-dialog');$('lab-toggle').addEventListener('click',()=>{lab.showModal();render();});lab.querySelector('.close').addEventListener('click',()=>lab.close());
  function calculate(T,dt,a){
    if(!Number.isFinite(T+dt+a)||T<=0||dt<=0)throw new Error('Invalid integration parameters');
    let t=0,v=0,explicit=0,semi=0,trapezoid=0,steps=0;
    while(t<T-1e-12){const h=Math.min(dt,T-t),nextV=v+a*h;explicit+=v*h;semi+=nextV*h;trapezoid+=(v+nextV)*h/2;v=nextV;t+=h;steps++;if(steps>100000)throw new Error('Too many steps');}
    return{T,dt,a,steps,explicit,semi,trapezoid,exact:a*T*T/2,velocity:v};
  }
  function render(){const r=calculate(+$('duration').value,+$('step').value,+$('accel').value),f=n=>n.toLocaleString('cs-CZ',{maximumFractionDigits:6});$('lab-result').textContent=`T=${f(r.T)} s; Δt=${f(r.dt)} s; a=${f(r.a)} m/s²; ${r.steps} kroků.\nAnalytické posunutí: ${f(r.exact)} m.\nExplicitní Euler: ${f(r.explicit)} m; chyba ${f(r.explicit-r.exact)} m.\nSemiimplicitní Euler: ${f(r.semi)} m; chyba ${f(r.semi-r.exact)} m.\nLichoběžník: ${f(r.trapezoid)} m; chyba ${f(r.trapezoid-r.exact)} m.\nKonečná rychlost: ${f(r.velocity)} m/s.`;}
  ['duration','step','accel'].forEach(id=>$(id).addEventListener('input',render));$('lab-reset').addEventListener('click',()=>{Object.entries({duration:2,step:.1,accel:9.81}).forEach(([id,v])=>$(id).value=v);render();});window.GrafitIntegration={calculate};render();

})();
