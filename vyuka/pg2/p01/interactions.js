/* Labelled teaching models; no editor API or remote service is invoked. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const notes = $('notes-panel'), notesToggle = $('notes-toggle');
  const noteData = JSON.parse($('notes-data').textContent);
  const currentPage = () => Math.max(1, Math.min(32, Number(location.hash.match(/^#slide-(\d+)$/)?.[1]) || 1));
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

  // Shared notes/focus handling above is inherited from PGA 01.
  const lab = $('lab-dialog');
  const openLab = () => { if (!lab.open) lab.showModal(); };
  $('lab-toggle').addEventListener('click', openLab);
  document.querySelectorAll('[data-open-lab]').forEach(button => button.addEventListener('click',openLab));
  $('print-button').addEventListener('click', () => window.print());
  const canvas = $('lab-canvas'), ctx = canvas.getContext('2d');
  const fields = [...lab.querySelectorAll('input')];
  const initial = new Map(fields.map(input => [input,input.value]));
  const number = (id, fallback) => {
    const input = $(id), raw = Number(input.value);
    if (!input.value || !Number.isFinite(raw)) return fallback;
    return Math.max(Number(input.min), Math.min(Number(input.max),raw));
  };
  function clear() { ctx.fillStyle='#111d23';ctx.fillRect(0,0,600,320);ctx.strokeStyle='#8dcde1';ctx.lineWidth=3;ctx.fillStyle='#e5edf1';ctx.font='20px Segoe UI'; }
  let steps=0, points=0, x=70, direction=1, elapsed=0;
  function render() {
    clear();
    if ($('pong-dt')) {
      ctx.strokeRect(35,35,530,250);ctx.fillRect(50,125,10,70);ctx.fillRect(540,125,10,70);
      ctx.beginPath();ctx.arc(x,160,9,0,2*Math.PI);ctx.fill();
      ctx.fillText(points+' : 0',265,65);
      $('lab-result').textContent='Technická smyčka: '+steps+' kroků, '+elapsed+' ms\nVýměna: '+(points>=11?'ukončená':'aktivní')+'\nZápas: '+points+' / 11 bodů'+(points>=11?' · konec zápasu':'');
      $('pong-step').disabled=points>=11;$('pong-point').disabled=points>=11;
      window.Week01Lab.state={kind:'pong',steps,points,x,elapsed};
    } else if ($('display-width')) {
      const w=number('display-width',1920),h=number('display-height',1080),fov=number('display-fov',90),fps=number('display-fps',60);
      const scale=Math.min(500/w,240/h),rw=w*scale,rh=h*scale;
      ctx.strokeRect((600-rw)/2,(320-rh)/2,rw,rh);ctx.fillText(w+' × '+h+' px',40,28);
      $('lab-result').textContent='Poměr stran: '+(w/h).toFixed(3)+'\n'+(w*h/1e6).toFixed(2)+' megapixelů\n'+(w/fov).toFixed(2)+' px/° (průměr)\n'+(1000/fps).toFixed(2)+' ms / snímek\n'+(w*h*fps/1e6).toFixed(2)+' milionů px / s';
      window.Week01Lab.state={kind:'display',width:w,height:h,pixelsPerDegree:w/fov,frameMs:1000/fps};
    } else {
      const rho=number('material-rho',.6),angle=number('material-angle',45),side=number('material-side',512),dirs=number('material-directions',81),r=angle*Math.PI/180;
      const brdf=rho/Math.PI,radiance=brdf*Math.cos(r),bytes=side*side*3*dirs*dirs;
      ctx.strokeStyle='#aeb5ca';ctx.beginPath();ctx.moveTo(60,265);ctx.lineTo(540,265);ctx.stroke();
      ctx.strokeStyle='#8dcde1';ctx.beginPath();ctx.moveTo(300,265);ctx.lineTo(300,80);ctx.stroke();ctx.fillText('n',310,92);
      ctx.strokeStyle='#ffd43b';ctx.beginPath();ctx.moveTo(300,265);ctx.lineTo(300+Math.sin(r)*190,265-Math.cos(r)*190);ctx.stroke();
      ctx.fillStyle='rgb('+Array(3).fill(Math.round(radiance*Math.PI*255)).join(',')+')';ctx.fillRect(60,285,480,25);
      $('lab-result').textContent='fᵣ = '+brdf.toFixed(4)+' sr⁻¹\nLₒ = '+radiance.toFixed(4)+' W/(m² sr)\nBTF: '+(dirs*dirs).toLocaleString('cs')+' obrázků\n'+(bytes/1073741824).toFixed(3)+' GiB (RGB8, nekomprimováno)';
      window.Week01Lab.state={kind:'material',rho,angle,brdf,radiance,images:dirs*dirs,bytes};
    }
  }
  window.Week01Lab={state:null};
  fields.forEach(input => input.addEventListener('input', render));
  if ($('pong-step')) {
    $('pong-step').addEventListener('click',()=>{
      const dt=number('pong-dt',16);elapsed+=dt;steps++;x+=direction*120*dt/1000;
      if(x>530){x=1060-x;direction=-1;}if(x<70){x=140-x;direction=1;}render();
    });
    $('pong-point').addEventListener('click',()=>{points=Math.min(11,points+1);x=70;direction=1;render();});
  }
  $('lab-reset').addEventListener('click',()=>{initial.forEach((value,input)=>{input.value=value;});steps=points=elapsed=0;x=70;direction=1;render();});
  render();

})();
