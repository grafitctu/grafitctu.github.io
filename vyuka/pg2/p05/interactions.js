/* Labelled teaching models; no editor API or remote service is invoked. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const notes = $('notes-panel'), notesToggle = $('notes-toggle');
  const noteData = JSON.parse($('notes-data').textContent);
  const currentPage = () => Math.max(1, Math.min(40, Number(location.hash.match(/^#slide-(\d+)$/)?.[1]) || 1));
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
  function calculate(l,v,n,e,b,k){const frames=l*v*e*b,merged=l*v*b,bytes=merged*n*n*3*k;return{frames,merged,bytes};}
  function render(){const a=['lights','views','resolution','exposures','bands','bytes'].map(id=>+$(id).value),r=calculate(...a);const f=n=>n.toLocaleString('cs-CZ',{maximumFractionDigits:3});$('lab-result').textContent=`${a[0]} světel × ${a[1]} pohledů; ${a[2]} × ${a[2]} px; ${a[3]} expozic; ${a[4]} pásem; ${a[5]} B/kanál.\nSnímací rámce: ${f(r.frames)}.\nSloučené obrazy: ${f(r.merged)}.\nNekomprimovaná sloučená data: ${f(r.bytes)} B (${f(r.bytes/1073741824)} GiB).`;}
  ['lights','views','resolution','exposures','bands','bytes'].forEach(id=>$(id).addEventListener('input',render));$('lab-reset').addEventListener('click',()=>{Object.entries({lights:81,views:81,resolution:800,exposures:1,bands:1,bytes:1}).forEach(([id,v])=>$(id).value=v);render()});window.GrafitBtfBudget={calculate};render();

})();
