/* Labelled teaching models; no editor API or remote service is invoked. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const notes = $('notes-panel'), notesToggle = $('notes-toggle');
  const noteData = JSON.parse($('notes-data').textContent);
  const currentPage = () => Math.max(1, Math.min(48, Number(location.hash.match(/^#slide-(\d+)$/)?.[1]) || 1));
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
      const elements = [...dialog.querySelectorAll('button:not(:disabled),input:not(:disabled),select:not(:disabled),a[href],summary,[tabindex="0"]')].filter(e => e.getClientRects().length);
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
  const f=n=>n.toLocaleString('cs-CZ',{maximumFractionDigits:3});
  function render(){const vals=['width','height','bits','buffers','fps'].map(id=>+$(id).value);if(vals.some((v,i)=>!Number.isInteger(v)||v<1||v>(i===4?1000:8192))){$('lab-result').textContent='Zadejte celá kladná čísla v rozsahu polí.';return;}const r=GrafitWeek07Models.framebuffer(...vals);$('lab-result').textContent='Řádek: '+f(r.rowBytes)+' B. Jeden obraz: '+f(r.frameBytes)+' B.\nCelkem: '+f(r.allocatedBytes)+' B = '+f(r.allocatedBytes/1e6)+' MB = '+f(r.allocatedBytes/1048576)+' MiB.\nÚplný zápis: '+f(r.writeBytesPerSecond)+' B/s. Dirty flags: '+r.dirtyFlags+'.';}
  for(const id of ['width','height','bits','buffers','fps'])$(id).addEventListener('input',render);
  $('lab-reset').addEventListener('click',()=>{for(const [id,v] of Object.entries({width:320,height:200,bits:8,buffers:2,fps:25}))$(id).value=v;render();});

})();
