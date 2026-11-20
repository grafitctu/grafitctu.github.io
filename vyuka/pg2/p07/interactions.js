/* Labelled teaching models; no editor API or remote service is invoked. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const notes = $('notes-panel'), notesToggle = $('notes-toggle');
  const noteData = JSON.parse($('notes-data').textContent);
  const currentPage = () => Math.max(1, Math.min(54, Number(location.hash.match(/^#slide-(\d+)$/)?.[1]) || 1));
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
  function render(){const strength=+$('strength').value,seed=+$('seed').value;if(!Number.isInteger(seed)||seed<1||seed>99){$('lab-result').textContent='Varianta musí být celé číslo 1 až 99.';return;}const t=GrafitWeek07Models.texture(strength,seed,$('tile-mode').value==='repeat'),c=$('tile-canvas'),ctx=c.getContext('2d'),im=ctx.createImageData(c.width,c.height);for(let ty=0;ty<t.rows;ty++)for(let tx=0;tx<t.cols;tx++){const a=t.tiles[ty*t.cols+tx];for(let y=0;y<t.size;y++)for(let x=0;x<t.size;x++){const at=((ty*t.size+y)*c.width+tx*t.size+x)*4,v=a[y*t.size+x];im.data[at]=im.data[at+1]=im.data[at+2]=v;im.data[at+3]=255;}}ctx.putImageData(im,0,0);$('lab-result').textContent='12 dílů, varianta '+seed+', síla '+f(strength)+'. Největší rozdíl sousedních krajních pixelů: '+t.maxEdgeError+' z 255. '+($('tile-mode').value==='repeat'?'Všechny vnitřky jsou stejné.':'Vnitřky se liší; společné hrany zůstávají.');}
  for(const id of ['strength','seed','tile-mode'])$(id).addEventListener('input',render);
  $('lab-reset').addEventListener('click',()=>{$('strength').value=.8;$('seed').value=7;$('tile-mode').value='repeat';render();});

})();
