(() => {
  'use strict';
  const $=id=>document.getElementById(id);
  const params=new URL(location.href).searchParams;
  const saved=()=>{try{return localStorage.getItem('roz-workshops-language');}catch{return null;}};
  const state={lang:(params.get('lang')||saved())==='en'?'en':'cs'};
  const t=(cs,en)=>state.lang==='cs'?cs:en;
  const num=(x,d=2)=>x.toLocaleString(t('cs-CZ','en-GB'),{minimumFractionDigits:d,maximumFractionDigits:d});
  const pc=(n,d)=>num(100*n,d)+' %';
  const classNames={bark:['kůra','bark'],flowers:['květy','flowers'],glass:['sklo','glass'],
                    rock:['hornina','rock'],textile:['textilie','textile'],wood:['dřevo','wood']};
  const className=k=>t(...classNames[k]);
  const listen=(ids,fn)=>ids.forEach(id=>$(id).addEventListener($(id).type==='range'?'input':'change',fn));
  const text=(id,v)=>{$(id).textContent=v;};
  const smallTable=(el,heading,rows)=>{
    el.replaceChildren();const h=el.createTHead().insertRow();
    heading.forEach(k=>{const th=document.createElement('th');th.scope='col';th.textContent=k;h.append(th);});
    const b=el.createTBody();
    rows.forEach(row=>{const tr=b.insertRow();row.forEach((v,i)=>{
      const td=document.createElement(i?'td':'th');if(!i)td.scope='row';
      td.textContent=v;tr.append(td);
    });});
  };
  function setLang(lang) {
    state.lang=lang;document.documentElement.lang=lang;
    document.title=t(document.body.dataset.titleCs,document.body.dataset.titleEn)+' · NI-ROZ';
    for(const key of ['cs','en'])$('lang-'+key).setAttribute('aria-pressed',String(key===lang));
    for(const el of document.querySelectorAll('[data-text-cs]'))el.textContent=t(el.dataset.textCs,el.dataset.textEn);
    for(const el of document.querySelectorAll('[data-alt-cs]'))el.alt=t(el.dataset.altCs,el.dataset.altEn);
    for(const el of document.querySelectorAll('[data-aria-cs]'))el.setAttribute('aria-label',t(el.dataset.ariaCs,el.dataset.ariaEn));
    for(const a of document.querySelectorAll('a[data-portal-cs]'))a.setAttribute('href',t(a.dataset.portalCs,a.dataset.portalEn));
    for(const a of document.querySelectorAll('a[data-nav]')){
      const u=new URL(a.getAttribute('href'),location.href);u.searchParams.set('lang',lang);a.href=u.href;
    }
    try{localStorage.setItem('roz-workshops-language',lang);}catch{}
    try{const u=new URL(location.href);u.searchParams.set('lang',lang);history.replaceState(null,'',u);}catch{}
    document.dispatchEvent(new Event('roz-language'));
  }
  function initialise() {
    for (const key of ['cs','en'])$('lang-'+key).onclick=()=>setLang(key);
    for(const group of document.querySelectorAll('.code-group')){
      const buttons=[...group.querySelectorAll('button[data-code]')];
      function show(lang){
        buttons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.code===lang)));
        group.querySelectorAll('[data-snippet]').forEach(e=>{e.hidden=e.dataset.snippet!==lang;});
      }
      buttons.forEach(b=>b.onclick=()=>show(b.dataset.code));show('cpp');
    }
    setLang(state.lang);
    if(window.setupWorkshop)window.setupWorkshop();
  }
  window.RozUI={$,t,num,pc,text,state,className,listen,smallTable,params};
  document.addEventListener('DOMContentLoaded',initialise,{once:true});
})();
