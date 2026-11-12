(() => {
  'use strict';
  const examples = window.RozCodeExamples;
  if (!examples) return;
  const viewers = [];
  const query = new URL(location.href).searchParams.get('code');
  let saved;
  try { saved = localStorage.getItem('roz-code-language'); } catch {}
  let language = ['python', 'cpp'].includes(query) ? query : ['python', 'cpp'].includes(saved) ? saved : 'cpp';
  const bi = (cs, en) => { const span = document.createElement('span'); for (const [lang,text] of [['cs',cs],['en',en]]) { const s=document.createElement('span');s.lang=lang;s.textContent=text;span.append(s); } return span; };
  function updateLinks() {
    const folder = location.pathname.slice(0, location.pathname.lastIndexOf('/') + 1);
    document.querySelectorAll('a[data-keep-language]').forEach(a => {
      const url = new URL(a.getAttribute('href'),location.href);
      if (url.origin === location.origin && url.pathname.startsWith(folder) && /(?:\.html|\/)$/i.test(url.pathname)) { url.searchParams.set('code',language);a.href=url.href; }
    });
  }
  function show(viewer, choice) {
    if (!viewer.panels.has(choice)) choice = language;
    viewer.choice = choice;
    for (const [key,panel] of viewer.panels) panel.hidden = key !== choice;
    for (const [key,button] of viewer.buttons) { button.setAttribute('aria-selected',String(key===choice));button.tabIndex=key===choice?0:-1; }
    viewer.sourceLink.href = examples[viewer.box.dataset.codeExample].sourceFiles?.[choice] || (choice === 'cpp' ? 'examples/cpp/lesson_snippets.cpp' : 'examples/lesson_snippets.py');
    viewer.sourceLink.replaceChildren(choice === 'cpp' ? bi('Úplný C++ soubor','Full C++ source') : bi('Úplný Python soubor','Full Python source'));
    viewer.sourceLink.hidden = choice === 'pseudocode';
    for(const [key,link] of viewer.zipLinks)link.dataset.selected=String(key===choice);
    viewer.projectLink.href=choice==='python'?'examples/README-Python.md':'examples/cpp/README.md';
    viewer.projectLink.replaceChildren(choice==='python'?bi('Spuštění Pythonu','Running Python'):bi('Kompilace C++','Build the C++ project'));
  }
  function choose(viewer, choice) {
    if (choice === 'pseudocode') { show(viewer,choice);return; }
    language=choice;
    try { localStorage.setItem('roz-code-language',language); } catch {}
    const url=new URL(location.href);url.searchParams.set('code',language);history.replaceState(null,'',url);
    for (const item of viewers) show(item,language);
    updateLinks();
  }
  function attach(parent, id, originalPython) {
    if (!examples[id] || parent.dataset.codeEnhanced) return;
    const pseudo = originalPython ? [] : [...parent.children].filter(n => n.matches('pre[lang]') || n.matches('div[lang]') && n.querySelector('pre'));
    if (!originalPython && !pseudo.length) return;
    parent.dataset.codeEnhanced='true';
    const box=document.createElement('div');box.className='code-viewer';box.dataset.codeExample=id;
    const tabs=document.createElement('div');tabs.className='code-tabs';tabs.setAttribute('role','tablist');tabs.setAttribute('aria-label','Programovací jazyk / Programming language');
    const viewer={box,panels:new Map(),buttons:new Map(),choice:language};
    box.append(tabs);parent.insertBefore(box,originalPython || pseudo[0]);
    const choices=pseudo.length?['pseudocode','python','cpp']:['python','cpp'];
    for (const key of choices) {
      const panel=document.createElement('div');panel.className='code-panel';panel.id='roz-code-panel-'+viewers.length+'-'+key;panel.setAttribute('role','tabpanel');panel.tabIndex=0;panel.dataset.codePanel=key;
      const button=document.createElement('button');button.type='button';button.id=panel.id+'-tab';button.dataset.codeChoice=key;button.setAttribute('role','tab');button.setAttribute('aria-controls',panel.id);panel.setAttribute('aria-labelledby',button.id);
      if(key==='pseudocode'){button.append(bi('Pseudokód','Pseudocode'));pseudo.forEach(n=>panel.append(n));}
      else{button.textContent=key==='cpp'?'C++':'Python';if(key==='python'&&originalPython)panel.append(originalPython);else{const pre=document.createElement('pre'),code=document.createElement('code');code.className='language-'+key;code.textContent=examples[id][key];pre.append(code);panel.append(pre);}}
      button.addEventListener('click',()=>choose(viewer,key));
      button.addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();event.stopPropagation();let index=choices.indexOf(viewer.choice);index=event.key==='Home'?0:event.key==='End'?choices.length-1:(index+(event.key==='ArrowRight'?1:-1)+choices.length)%choices.length;choose(viewer,choices[index]);viewer.buttons.get(choices[index]).focus();});
      tabs.append(button);box.append(panel);viewer.buttons.set(key,button);viewer.panels.set(key,panel);
    }
    box.querySelectorAll('pre').forEach(pre=>pre.tabIndex=0);
    const links=document.createElement('div');links.className='code-downloads';viewer.sourceLink=document.createElement('a');links.append(viewer.sourceLink);
    viewer.zipLinks=new Map();
    for(const key of ['cpp','python']){const link=document.createElement('a'),label=key==='cpp'?'C++':'Python';link.href=examples[id].downloads[key];link.download='roz-'+id+'-'+key+'.zip';link.dataset.codeDownload=key;link.append(bi('Stáhnout '+label+' ZIP','Download '+label+' ZIP'));links.append(link);viewer.zipLinks.set(key,link);}
    viewer.projectLink=document.createElement('a');links.append(viewer.projectLink);box.append(links);
    viewers.push(viewer);show(viewer,language);
  }
  const experiment=document.querySelector('#python > pre');if(experiment)attach(experiment.parentElement,'pca-experiment',experiment);
  document.querySelectorAll('[data-algorithm]').forEach(parent=>attach(parent,parent.dataset.algorithm));
  const reconstruction=document.querySelector('#reconstruction details');if(reconstruction)attach(reconstruction,'pca-reconstruct');
  const notes=document.querySelector('main.notes');if(notes)for(const id of Object.keys(examples)){const section=notes.querySelector('section#'+id);if(section)attach(section,id);}
  const matvec=document.querySelector('#matvec');if(matvec){const detail=document.createElement('details');detail.className='code-details';const summary=document.createElement('summary');summary.append(bi('Výpočet v Pythonu nebo C++','Compute it in Python or C++'));const pre=document.createElement('pre');pre.textContent=examples.matvec.python;detail.append(summary,pre);matvec.querySelector('.matvec-layout>div').append(detail);attach(detail,'matvec',pre);}
  document.addEventListener('geometry:change',updateLinks);
  document.querySelectorAll('[data-lang-button]').forEach(button=>button.addEventListener('click',()=>queueMicrotask(updateLinks)));
  updateLinks();
  window.RozCode={getReport:()=>({language,viewers:viewers.map(v=>({id:v.box.dataset.codeExample,choice:v.choice}))})};
})();
