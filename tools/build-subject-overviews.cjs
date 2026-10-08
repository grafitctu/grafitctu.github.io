/* Subject overviews derived from the same catalog as the central library. */
const fs=require('node:fs'),path=require('node:path');
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const nav=(catalog,lang,prefix,current)=>`<nav class="subject-nav" aria-label="${lang==='cs'?'Přehledy předmětů':'Course overviews'}">${catalog.courses.map(c=>`<a href="${prefix+c.id+'/'+(lang==='en'?'en/':'')}"${current===c.id?' aria-current="page"':''}>${esc(c.id.toUpperCase())}</a>`).join('')}</nav>`;
module.exports=function buildSubjects(base,catalog,lang,t,cell){
 const en=lang==='en',prefix=en?'../../':'../';
 for(const course of catalog.courses){
  const items=catalog.rows.flatMap(row=>[].concat(row[course.id]||[]).map(item=>({row:row.label,item})));
  const back=en?'All courses':'Všechny předměty',route=course.id+'/'+(en?'en/':''),title=course.code+' · '+course.title[lang];
  const official=course.official||(course.id==='vhs'?'https://courses.fit.cvut.cz/BI-VHS/':null);
  const cards=items.map(({row,item})=>`<li class="subject-lecture ${course.id}"><p class="eyebrow">${esc(row==='+'?t.supplement:(en?'Lecture / topic ':'Přednáška / téma ')+row)}</p>${cell(item,course.id,prefix).replace(/^<td[^>]*>|<\/td>$/g,'')}</li>`).join('\n');
  const upcoming=course.upcoming?.length?`<section class="subject-upcoming"><h2>${en?'Further topics — materials forthcoming':'Další témata — podklady připravujeme'}</h2><p>${en?'The author currently publishes no downloadable material for these topics.':'Autor pro tato témata zatím nezveřejňuje soubor ke stažení.'}</p><ol>${course.upcoming.map(x=>`<li>${esc(x.number)} · ${esc(x.title)}</li>`).join('')}</ol></section>`:'';
  const html=`<!doctype html>
<html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)} | GRAFIT</title><meta name="robots" content="noindex"><meta name="description" content="${esc((en?'Lecture overview: ':'Přehled přednášek: ')+course.title[lang])}"><link rel="canonical" href="https://grafitctu.github.io/vyuka/${route}"><link rel="alternate" hreflang="cs" href="https://grafitctu.github.io/vyuka/${course.id}/"><link rel="alternate" hreflang="en" href="https://grafitctu.github.io/vyuka/${course.id}/en/"><link rel="stylesheet" href="${prefix}vyuka.css"></head>
<body><a class="skip" href="#main">${t.skip}</a><header class="site-header"><nav class="site-nav" aria-label="GRAFIT"><a class="brand" href="${prefix+(en?'en/':'')}">← ${back}</a><div class="languages" aria-label="${t.nav}">${en?'<a href="../" lang="cs">CZ</a><span aria-current="page">EN</span>':'<span aria-current="page">CZ</span><a href="en/" lang="en">EN</a>'}</div></nav></header>
<main id="main"><section class="subject-hero"><p class="eyebrow">GRAFIT · ${esc(course.code)}</p><h1>${esc(course.id.toUpperCase())}<span class="subject-name">${esc(course.title[lang])}</span></h1><p class="lead">${items.length} ${en?'lectures and topics':'přednášek a témat'} · ${t.lang}</p></section>${nav(catalog,lang,prefix,course.id)}<section aria-labelledby="lectures-title"><div class="catalog-intro"><h2 id="lectures-title">${t.catalog}</h2></div>${items.length?'<ol class="subject-lectures">'+cards+'</ol>':'<p class="note">'+t.planned+'.</p>'}</section>${upcoming}<div class="course-links"><a href="${prefix+(en?'en/':'')}">← ${back}</a>${official?`<a href="${esc(official)}">${en?'Official course page':'Oficiální stránka předmětu'} ↗</a>`:''}</div></main><footer><a href="/">GRAFIT · FIT ČVUT</a><span>${t.snapshot}</span></footer></body></html>\n`;
  const destination=path.join(base,route);fs.mkdirSync(destination,{recursive:true});fs.writeFileSync(path.join(destination,'index.html'),html);
 }
};
module.exports.nav=nav;
