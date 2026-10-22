(function () {
  'use strict';
  const body=document.body, slides=[...document.querySelectorAll('[data-slide]')];
  let current=Math.max(0,slides.findIndex(el=>'#'+el.id===location.hash));
  function setLanguage(value){
    const language=value==='en'?'en':'cs';body.dataset.lang=language;document.documentElement.lang=language;
    const pageUrl=new URL(location.href);pageUrl.searchParams.set('lang',language);history.replaceState(null,'',pageUrl);
    document.querySelectorAll('[data-language]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.language===language)));
    document.querySelectorAll('a[data-keep-language]').forEach(el=>{const url=new URL(el.getAttribute('href'),location.href);url.searchParams.set('lang',language);el.href=url.href;});
    try{localStorage.setItem('roz-geometry-language',language);}catch{}
    document.dispatchEvent(new Event('geometry:change'));
  }
  let saved='cs';try{saved=localStorage.getItem('roz-geometry-language')||'cs';}catch{}
  setLanguage(new URLSearchParams(location.search).get('lang')||saved);
  document.querySelectorAll('[data-language]').forEach(el=>el.addEventListener('click',()=>setLanguage(el.dataset.language)));
  function show(index){
    if(!slides.length)return;current=Math.max(0,Math.min(slides.length-1,index));
    slides.forEach((el,i)=>{el.classList.toggle('active',i===current);if(i!==current)el.querySelectorAll('video').forEach(video=>video.pause());});
    document.querySelectorAll('[data-counter]').forEach(el=>el.textContent=`${current+1} / ${slides.length}`);
    document.querySelectorAll('[data-previous]').forEach(el=>el.disabled=current===0);
    document.querySelectorAll('[data-next]').forEach(el=>el.disabled=current===slides.length-1);
    if(body.dataset.view==='slides'){history.replaceState(null,'','#'+slides[current].id);window.scrollTo(0,0);}
    document.dispatchEvent(new Event('geometry:change'));
  }
  document.querySelectorAll('[data-previous]').forEach(el=>el.addEventListener('click',()=>show(current-1)));
  document.querySelectorAll('[data-next]').forEach(el=>el.addEventListener('click',()=>show(current+1)));
  document.querySelectorAll('[data-jump]').forEach(el=>el.addEventListener('click',()=>show(slides.findIndex(s=>s.id===el.dataset.jump))));
  window.addEventListener('hashchange',()=>{
    const index=slides.findIndex(slide=>'#'+slide.id===location.hash);
    if(index>=0&&index!==current)show(index);
  });
  document.querySelector('[data-toggle-view]')?.addEventListener('click',event=>{body.dataset.view=body.dataset.view==='slides'?'read':'slides';event.currentTarget.setAttribute('aria-pressed',String(body.dataset.view==='slides'));show(current);});
  document.addEventListener('keydown',event=>{
    if(body.dataset.view!=='slides'||/INPUT|SELECT|TEXTAREA|VIDEO/.test(event.target.tagName))return;
    if(event.key==='ArrowRight'||event.key==='PageDown'){event.preventDefault();show(current+1);}
    if(event.key==='ArrowLeft'||event.key==='PageUp'){event.preventDefault();show(current-1);}
    if(event.key==='Home')show(0);if(event.key==='End')show(slides.length-1);
  });
  document.querySelectorAll('[data-print]').forEach(el=>el.addEventListener('click',()=>window.print()));
  window.addEventListener('beforeprint',()=>{
    // Keep printed plots consistent with the latest visible calculation.
    for(const kind of ['pca','dbscan']){
      const drawn=[...document.querySelectorAll(`canvas[data-plot="${kind}"]`)].filter(canvas=>canvas._geometry);
      const visible=drawn.find(canvas=>canvas.getBoundingClientRect().width>0)||drawn[0];
      if(visible)document.querySelectorAll(`canvas[data-plot="${kind}"]`).forEach(canvas=>{
        const image=canvas.parentElement.nextElementSibling;
        if(image?.classList.contains('print-still'))image.src=visible.toDataURL('image/png');
      });
    }
  });
  document.querySelectorAll('textarea[data-answer]').forEach(el=>{
    const key='roz-geometry-answer-'+el.dataset.answer;try{el.value=localStorage.getItem(key)||'';}catch{}
    el.addEventListener('input',()=>{try{localStorage.setItem(key,el.value);}catch{}});
  });
  document.querySelector('[data-export]')?.addEventListener('click',()=>{
    const value=[...document.querySelectorAll('textarea[data-answer]')].map(el=>`${document.querySelector('label[for="'+el.id+'"]')?.innerText||el.dataset.answer}\n${el.value}\n`).join('\n');
    const target=document.querySelector('[data-export-text]');target.parentElement.hidden=false;target.value=value;target.focus();target.select();
  });
  show(current);
})();
