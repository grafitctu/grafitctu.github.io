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

  const methods = {
    macro:['Makro','Sekvence existujících příkazů vyvolaná jedním příkazem. V modelu této přednášky nové funkce nepřidává.'],
    script:['Skript','Program ve skriptovacím jazyce volá zpřístupněné API. Bez přestavění aplikace; rozsah určuje hostitel.'],
    library:['Knihovna','V tomto srovnání jde o přilinkování do hostitele: přístup ke zdrojům a kompilace aplikace. Obecně existují také dynamické knihovny.'],
    plugin:['Zásuvný modul','Hostitel rozšíření načte přes své rozhraní. Celou aplikaci nepřestavujeme; samotný modul může vyžadovat kompilaci.']
  };
  document.querySelectorAll('input[name="method"]').forEach(input => input.addEventListener('change', () => {
    const [title,text] = methods[input.value]; $('method-title').textContent = title; $('method-result').textContent = text;
  }));

  let cycle = 0;
  const calls = [
    [0,'Čeká na hostitele.'],[1,'selector 1 · Inicializace parametrů.'],[2,'selector 2 · Příprava a přidělení paměti.'],
    [3,'selector 3 · Start: první oblast a parametry.'],[4,'selector 4 · Zpracovaný blok 1 / 3.'],
    [4,'selector 4 · Zpracovaný blok 2 / 3.'],[4,'selector 4 · Zpracovaný blok 3 / 3.'],[5,'selector 5 · Konec: uvolnění prostředků.']
  ];
  function showCycle() {
    const [selector,text] = calls[cycle];
    document.querySelectorAll('[data-cycle]').forEach(e => e.classList.toggle('active', Number(e.dataset.cycle) === selector));
    $('cycle-result').textContent = text; $('cycle-step').disabled = cycle === calls.length - 1;
  }
  $('cycle-step').addEventListener('click', () => { cycle = Math.min(calls.length-1,cycle+1); showCycle(); });
  $('cycle-reset').addEventListener('click', () => { cycle = 0; showCycle(); });

  const width = 128, height = 80;
  const sourceContext = $('input-image').getContext('2d'), destinationContext = $('output-image').getContext('2d');
  const original = sourceContext.createImageData(width,height);
  for (let y=0;y<height;y++) for(let x=0;x<width;x++) {
    const i=(y*width+x)*4;
    original.data[i]=Math.round(x/(width-1)*255); original.data[i+1]=Math.round(y/(height-1)*255);
    original.data[i+2]=((Math.floor(x/16)+Math.floor(y/16))%2)?180:80; original.data[i+3]=255;
  }
  sourceContext.putImageData(original,0,0);
  function preview() {
    const amount = Number($('brightness').value), enabled=$('preview').checked;
    $('brightness-value').textContent = String(amount);
    const image=destinationContext.createImageData(width,height);
    for(let i=0;i<original.data.length;i+=4){for(let c=0;c<3;c++) image.data[i+c]=Math.max(0,Math.min(255,original.data[i+c]+(enabled?amount:0))); image.data[i+3]=255;}
    destinationContext.putImageData(image,0,0);
    $('preview-result').textContent = enabled ? 'Náhled: přičtení '+amount+' k RGB kanálům, hodnoty oříznuté do 0–255.' : 'Náhled vypnutý: zobrazený původní vstup.';
  }
  $('brightness').addEventListener('input',preview); $('preview').addEventListener('change',preview);
  $('preview-reset').addEventListener('click',()=>{$('brightness').value='0';$('preview').checked=true;preview();}); preview();

  let completed=0;
  function tileModel() {
    const rows=Number($('tile-height').value), count=Math.ceil(4096/rows), bytes=2*4096*rows*4;
    $('tile-value').textContent=String(rows); $('memory-full').textContent='128 MiB';
    $('memory-tile').textContent=(bytes/1048576).toFixed(0)+' MiB';
    $('tile-result').textContent=completed+' / '+count+' bloků'; $('tile-step').disabled=completed>=count;
    const grid=$('tile-grid');grid.replaceChildren();for(let i=0;i<count;i++){const stripe=document.createElement('i');if(i<completed)stripe.className='done';grid.append(stripe);}
  }
  $('tile-height').addEventListener('input',()=>{completed=0;tileModel();});
  $('tile-step').addEventListener('click',()=>{completed=Math.min(Math.ceil(4096/Number($('tile-height').value)),completed+1);tileModel();});
  $('tile-reset').addEventListener('click',()=>{$('tile-height').value='512';completed=0;tileModel();});tileModel();
})();
