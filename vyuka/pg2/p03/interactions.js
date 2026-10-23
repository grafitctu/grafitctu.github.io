/* Labelled teaching models; no editor API or remote service is invoked. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const notes = $('notes-panel'), notesToggle = $('notes-toggle');
  const noteData = JSON.parse($('notes-data').textContent);
  const currentPage = () => Math.max(1, Math.min(26, Number(location.hash.match(/^#slide-(\d+)$/)?.[1]) || 1));
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

  const lab=$('lab-dialog');window.GrafitBarycentric={state:null};
  function update(){
    const a=Number($('weight-a').value)/100,b=Number($('weight-b').value)/100,c=1-a-b,inside=c>=-1e-10;
    const x=a*60+b*560+c*310,y=(a+b)*260+c*40;
    const rgb=[0,1,2].map(k=>Math.round(a*[255,90,90][k]+b*[80,180,255][k]+c*[230,200,80][k]));
    const point=$('bary-point');point.setAttribute('cx',x);point.setAttribute('cy',y);point.setAttribute('fill',inside?'rgb('+rgb.join(',')+')':'#888');point.setAttribute('stroke','currentColor');
    $('bary-label').textContent=inside?'Uvnitř / hranice':'Mimo trojúhelník';
    $('lab-result').textContent='w1 = '+a.toFixed(2)+' · w2 = '+b.toFixed(2)+' · w3 = '+c.toFixed(2)+'\nSoučet = '+(a+b+c).toFixed(2)+'\n'+(inside?'Nezáporné váhy: bod leží uvnitř nebo na hranici.':'Záporná w3: bod leží mimo trojúhelník. Barva se zde neextrapoluje.')+'\np = ('+x.toFixed(1)+', '+y.toFixed(1)+')';
    window.GrafitBarycentric.state={weights:[a,b,c],inside,x,y,rgb:inside?rgb:null};
  }
  for(const id of ['weight-a','weight-b'])$(id).addEventListener('input',update);
  $('lab-reset').addEventListener('click',()=>{$('weight-a').value=20;$('weight-b').value=30;update()});
  const open=()=>{if(!lab.open)lab.showModal();update()};$('lab-toggle').addEventListener('click',open);document.querySelectorAll('[data-open-lab]').forEach(b=>b.addEventListener('click',open));$('print-button').addEventListener('click',()=>print());update();

})();
