/* Labelled teaching models; no editor API or remote service is invoked. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const notes = $('notes-panel'), notesToggle = $('notes-toggle');
  const noteData = JSON.parse($('notes-data').textContent);
  const currentPage = () => Math.max(1, Math.min(55, Number(location.hash.match(/^#slide-(\d+)$/)?.[1]) || 1));
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
  let state='standing',queue=[],log=[];
  const labels={standing:'stání',jumping:'skok',ducking:'přikrčení'};
  const commands={jump:'skok',duck:'přikrčení',release:'uvolnění dolů',land:'dopad'};
  const transitions={standing:{jump:'jumping',duck:'ducking'},jumping:{land:'standing'},ducking:{release:'standing'}};
  window.GrafitCommands={state:null};
  function update(){
    $('lab-result').textContent='Stav: '+labels[state]+'. Fronta FIFO ('+queue.length+'/30): '+(queue.map(x=>commands[x]).join(' → ')||'prázdná')+'.';
    $('process').disabled=!queue.length;
    lab.querySelectorAll('[data-command]').forEach(b=>b.disabled=queue.length>=30);
    $('command-log').replaceChildren(...log.slice(-12).map(s=>{const li=document.createElement('li');li.textContent=s;return li}));
    window.GrafitCommands.state={current:state,queue:[...queue],log:[...log]};
  }
  lab.querySelectorAll('[data-command]').forEach(b=>b.addEventListener('click',()=>{if(queue.length<30)queue.push(b.dataset.command);update()}));
  $('process').addEventListener('click',()=>{if(!queue.length)return;const c=queue.shift(),next=transitions[state]?.[c];log.push(commands[c]+': '+labels[state]+(next?' → '+labels[next]:' → nepovolený přechod, stav beze změny'));if(next)state=next;update()});
  $('lab-reset').addEventListener('click',()=>{state='standing';queue=[];log=[];update()});
  const open=()=>{if(!lab.open)lab.showModal();update()};$('lab-toggle').addEventListener('click',open);document.querySelectorAll('[data-open-lab]').forEach(b=>b.addEventListener('click',open));$('print-button').addEventListener('click',()=>print());update();

})();
