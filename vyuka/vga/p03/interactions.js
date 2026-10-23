/* Labelled teaching models; no editor API or remote service is invoked. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const notes = $('notes-panel'), notesToggle = $('notes-toggle');
  const noteData = JSON.parse($('notes-data').textContent);
  const currentPage = () => Math.max(1, Math.min(42, Number(location.hash.match(/^#slide-(\d+)$/)?.[1]) || 1));
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
  const definitions=[['Hrdina',['Poloha','Pevné těleso','Ovládání']],['Pochodeň',['Poloha','Světlo']],['Mlynář',['Poloha','Pevné těleso','NPC']],['Únos dcery',['Quest']],['Goblin',['Poloha','Pevné těleso','AI nepřítel']],['Ohnivák',['Poloha','Světlo','Pevné těleso','AI nepřítel']],['Dracula',['Poloha','Pevné těleso','AI nepřítel','NPC']]];
  let active=new Set(definitions.map(([name])=>name));
  const boxes=[...lab.querySelectorAll('input[type=checkbox]')];
  window.GrafitECS={state:null};
  function update(){
    const required=boxes.filter(e=>e.checked).map(e=>e.value);
    const result=definitions.filter(([name,comps])=>active.has(name)&&required.every(c=>comps.includes(c)));
    $('lab-result').textContent='Registr: '+active.size+' entit. Dotaz: '+(required.join(' ∩ ')||'bez podmínek')+'. Výsledek: '+result.length+' entit.';
    const target=$('entity-results');target.replaceChildren();
    for(const [name,comps] of result){const article=document.createElement('article'),h=document.createElement('h3'),p=document.createElement('p');h.textContent=name;p.textContent=comps.join(' · ');article.append(h,p);target.append(article)}
    window.GrafitECS.state={required,active:[...active],result:result.map(x=>x[0])};
    $('entity-remove').disabled=!active.has($('remove-entity').value);
  }
  boxes.forEach(e=>e.addEventListener('change',update));$('remove-entity').addEventListener('change',update);
  $('entity-remove').addEventListener('click',()=>{active.delete($('remove-entity').value);update()});
  $('lab-reset').addEventListener('click',()=>{active=new Set(definitions.map(x=>x[0]));boxes.forEach(e=>e.checked=['Poloha','Světlo'].includes(e.value));$('remove-entity').selectedIndex=0;update()});
  const open=()=>{if(!lab.open)lab.showModal();update()};$('lab-toggle').addEventListener('click',open);document.querySelectorAll('[data-open-lab]').forEach(b=>b.addEventListener('click',open));$('print-button').addEventListener('click',()=>print());update();

})();
