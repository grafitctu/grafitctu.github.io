/* Labelled teaching models; no editor API or remote service is invoked. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const notes = $('notes-panel'), notesToggle = $('notes-toggle');
  const noteData = JSON.parse($('notes-data').textContent);
  const currentPage = () => Math.max(1, Math.min(33, Number(location.hash.match(/^#slide-(\d+)$/)?.[1]) || 1));
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
  function eigenSymmetric(input){
    const n=input.length,a=input.map(r=>r.slice()),v=Array.from({length:n},(_,i)=>Array.from({length:n},(_,j)=>+(i===j)));
    for(let iter=0;iter<100*n*n;iter++){
      let p=0,q=1,max=0;for(let i=0;i<n;i++)for(let j=i+1;j<n;j++)if(Math.abs(a[i][j])>max){max=Math.abs(a[i][j]);p=i;q=j;}
      if(max<1e-12)break;
      const tau=(a[q][q]-a[p][p])/(2*a[p][q]),t=(tau>=0?1:-1)/(Math.abs(tau)+Math.sqrt(1+tau*tau)),c=1/Math.sqrt(1+t*t),s=t*c,apq=a[p][q];
      a[p][p]-=t*apq;a[q][q]+=t*apq;a[p][q]=a[q][p]=0;
      for(let k=0;k<n;k++)if(k!==p&&k!==q){const x=a[k][p],y=a[k][q];a[k][p]=a[p][k]=c*x-s*y;a[k][q]=a[q][k]=s*x+c*y;}
      for(let k=0;k<n;k++){const x=v[k][p],y=v[k][q];v[k][p]=c*x-s*y;v[k][q]=s*x+c*y;}
    }
    return Array.from({length:n},(_,i)=>({value:Math.max(0,a[i][i]),vector:v.map(r=>r[i])})).sort((x,y)=>y.value-x.value);
  }
  function calculate(k,noise,center){
    const m=10,n=8,A=Array.from({length:m},(_,i)=>Array.from({length:n},(_,j)=>Math.sin((i+1)*.4)*Math.cos((j+1)*.3)+.6*Math.cos(i*.65)*Math.sin(j*.5)+noise*Math.sin((i*13+j*7)*.7))),mean=Array.from({length:n},(_,j)=>center?A.reduce((s,r)=>s+r[j],0)/m:0),B=A.map(r=>r.map((x,j)=>x-mean[j]));
    const gram=Array.from({length:n},(_,i)=>Array.from({length:n},(_,j)=>B.reduce((s,r)=>s+r[i]*r[j],0))),ev=eigenSymmetric(gram),selected=ev.slice(0,k);
    const reconstructed=B.map(row=>Array.from({length:n},(_,j)=>mean[j]+selected.reduce((s,e)=>s+row.reduce((x,b,i)=>x+b*e.vector[i],0)*e.vector[j],0))),energy=ev.reduce((s,e)=>s+e.value,0),retained=selected.reduce((s,e)=>s+e.value,0),errorSquared=A.reduce((s,row,i)=>s+row.reduce((t,x,j)=>t+(x-reconstructed[i][j])**2,0),0),stored=k*(m+n+1)+(center?n:0);
    return{A,reconstructed,k,noise,center,energy,retained,fraction:energy?retained/energy:1,errorSquared,rmse:Math.sqrt(errorSquared/(m*n)),stored,original:m*n,singularValues:ev.map(e=>Math.sqrt(e.value))};
  }
  function paint(id,matrix,scale){const c=$(id),ctx=c.getContext('2d');for(let i=0;i<10;i++)for(let j=0;j<8;j++){const x=Math.max(-1,Math.min(1,matrix[i][j]/scale)),r=Math.round(245-160*Math.max(0,-x)),b=Math.round(245-160*Math.max(0,x)),g=Math.round(245-170*Math.abs(x));ctx.fillStyle=`rgb(${r},${g},${b})`;ctx.fillRect(j*30,i*30,30,30);ctx.strokeStyle='#0002';ctx.strokeRect(j*30,i*30,30,30);}}
  function render(){const r=calculate(+$('rank').value,+$('noise').value,$('center').checked),scale=Math.max(...r.A.flat().map(Math.abs),...r.reconstructed.flat().map(Math.abs),1e-9);paint('original-matrix',r.A,scale);paint('reconstructed-matrix',r.reconstructed,scale);const f=n=>n.toLocaleString('cs-CZ',{maximumFractionDigits:6});$('lab-result').textContent=`k=${r.k}; detail=${f(r.noise)}; ${r.center?'PCA (centrovaná data)':'SVD bez centrování'}.\nZachycená energie ${f(r.fraction*100)} %. RMSE ${f(r.rmse)}.\nPůvodní matice:80 hodnot =320 B. Faktory${r.center?' a průměry':''}:${r.stored} hodnot =${r.stored*4} B. Poměr originál/výsledek: ${f(r.original/r.stored)}×.\nSingulární hodnoty: ${r.singularValues.map(f).join(', ')}.`;}
  ['rank','noise','center'].forEach(id=>$(id).addEventListener('input',render));$('lab-reset').addEventListener('click',()=>{$('rank').value=2;$('noise').value=.12;$('center').checked=true;render();});window.GrafitLowRank={calculate,eigenSymmetric};render();

})();
