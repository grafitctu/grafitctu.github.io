/* GRAFIT-only navigation, reapplied after each source refresh. */
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const sha=data=>crypto.createHash('sha256').update(data).digest('hex');
const css=`
.grafit-lecture-return,.grafit-course-link--floating{box-sizing:border-box;display:inline-flex;align-items:center;justify-content:center;flex:none;min-height:44px;padding:8px 12px;border:1px solid var(--line,#b6c3ca);border-radius:5px;background:var(--paper,#fcfbf8);color:var(--ink,#203039);font:600 14px/1.2 "Segoe UI",Arial,sans-serif;text-decoration:none;white-space:nowrap;cursor:pointer}
.grafit-lecture-return:hover,.grafit-course-link--floating:hover{background:var(--panel,#e8eff1)}
.grafit-lecture-return:focus-visible,#grafit-course-link:focus-visible{outline:3px solid var(--accent,#245d72);outline-offset:3px}
.grafit-lecture-return--floating,.grafit-course-link--floating{position:fixed;top:max(10px,env(safe-area-inset-top));left:max(12px,env(safe-area-inset-left));z-index:60;background:#fcfbf8;color:#203039;border-color:#b6c3ca;box-shadow:0 2px 10px #0002}
#grafit-course-link.brand{display:inline-flex;align-items:center;min-height:44px} .grafit-course-link--floating{left:168px}
body.grafit-toolbar-return.presenting{grid-template-rows:auto minmax(0,1fr) 70px}
body.grafit-toolbar-return:has(#viewport){grid-template-rows:auto minmax(0,1fr) 50px}
body.grafit-toolbar-return:has(#page-canvas){display:grid;height:100dvh;grid-template-rows:auto minmax(0,1fr) 70px;overflow:hidden}
.grafit-toolbar-return:has(#page-canvas) .deck{height:auto;min-height:0}
.grafit-toolbar-return:has(#page-canvas) .page{max-height:calc(100% - 24px)}
.grafit-toolbar-return .toolbar{display:flex;height:auto;min-height:76px;flex-wrap:wrap;padding-block:10px;gap:12px}
.grafit-toolbar-return .toolbar nav{flex-wrap:wrap}
@media(max-width:1100px){.grafit-toolbar-return .toolbar #chapter{display:none}}
@media(max-width:760px){.grafit-toolbar-return .toolbar{padding:10px 12px;min-height:65px}.grafit-toolbar-return .toolbar nav{width:100%;margin:0;gap:5px}.grafit-toolbar-return .toolbar .brand{font-size:17px}.grafit-toolbar-return .toolbar .variant-switch{flex-wrap:wrap}.grafit-toolbar-return.presenting{grid-template-rows:auto minmax(0,1fr) 64px}}
@media print{.grafit-lecture-return,#grafit-course-link{display:none!important}body.grafit-toolbar-return:has(#page-canvas){display:block;height:auto;overflow:visible}}
`;
module.exports=function addLectureReturn(base,catalog){
 const manifestPath=path.join(base,'source-manifest.json'),manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
 // VHS 02 and DVD used the brand as a first-slide shortcut. Source exports
 // retain that behavior; in the library the subject hyperlink navigates.
 for(const controllerFile of ['vhs/p02/presentation.js','dvd/tajemstvi/presentation.js']){
  const target=path.join(base,controllerFile),before=fs.readFileSync(target),record=manifest.files.find(f=>f.copy===controllerFile);
  if(!record||record.sha256!==sha(before))throw Error('Unverified controller: '+controllerFile);
  let controller=before.toString('utf8');
  if(!controller.includes('grafit-course-link')){
   controller=controller.replace("document.querySelector('.brand').href = `#v${version}-slide-1`;","if (document.querySelector('.brand').id !== 'grafit-course-link') document.querySelector('.brand').href = `#v${version}-slide-1`;")
    .replace("document.querySelector('.brand').addEventListener('click', e => { e.preventDefault(); go(0); });","document.querySelector('.brand').addEventListener('click', e => { if (e.currentTarget.id === 'grafit-course-link') return; e.preventDefault(); go(0); });")
    .replace("document.querySelector('.brand').addEventListener('click',e=>{e.preventDefault();go(0);});","document.querySelector('.brand').addEventListener('click',e=>{if(e.currentTarget.id==='grafit-course-link')return;e.preventDefault();go(0);});");
   if(controller===before.toString('utf8'))throw Error('Unknown brand handler: '+controllerFile);
   fs.writeFileSync(target,controller);record.preNavigationSha256??=sha(before);record.bytes=Buffer.byteLength(controller);record.sha256=sha(controller);record.adaptations=['Library course brand retains native navigation; first-slide controls remain available.'];
  }
 }
 const entries=[],courseByPage=new Map();for(const row of catalog.rows)for(const course of catalog.courses)for(const item of [].concat(row[course.id]||[]))for(const value of [item.primary,item.alternative])if(value&&(value.endsWith('/')||/\.html$/.test(value))){const file=value.endsWith('/')?value+'index.html':value;if(courseByPage.has(file)&&courseByPage.get(file).id!==course.id)throw Error('Ambiguous course: '+file);entries.push(file);courseByPage.set(file,course);}
 const pages=[...new Set(entries)];let changed=0;
 // Validate every input before changing any copy. Older PGA viewers were generated,
 // rather than copied, and did not yet have provenance entries.
 for(const file of pages){const record=manifest.files.find(f=>f.copy===file),data=fs.readFileSync(path.join(base,file));if(record&&record.sha256!==sha(data))throw Error('Unverified lecture copy: '+file);if(!record){if(!/^pga\/p(?:04|05|06|10|11-13)\.html$/.test(file))throw Error('Missing provenance: '+file);manifest.files.push({sourceWorkspace:'GRAFIT',source:'tools/add_grafit_pga.cjs (generated PDF viewer)',copy:file,bytes:data.length,sha256:sha(data)});}}
 for(const file of pages){
  const target=path.join(base,file),before=fs.readFileSync(target),record=manifest.files.find(f=>f.copy===file);
  if(!record||record.sha256!==sha(before))throw Error('Unverified lecture copy: '+file);
  let html=before.toString('utf8');
  if(!html.includes('id="grafit-lecture-return"')){
   const toolbar=/<header\b[^>]*class="[^"]*\btoolbar\b[^"]*"[^>]*>/i;
   const href=path.relative(path.dirname(target),base).split(path.sep).join('/')+'/';
   const link=`<a id="grafit-lecture-return" class="grafit-lecture-return${toolbar.test(html)?'':' grafit-lecture-return--floating'}" href="${href}" aria-label="Zpět na přehled přednášek GRAFIT">← Zpět na přehled</a>`;
   html=html.replace(/<\/head>/i,`<style id="grafit-lecture-return-style">${css}</style>\n</head>`);
   if(toolbar.test(html)){
    html=html.replace(/<body\b([^>]*)>/i,(all,attrs)=>'<body'+(/\bclass="/.test(attrs)?attrs.replace(/class="([^"]*)"/,(_,v)=>`class="${v} grafit-toolbar-return"`):attrs+' class="grafit-toolbar-return"')+'>');
    html=html.replace(toolbar,all=>all+'\n'+link);
   }else html=html.replace(/<body\b[^>]*>/i,all=>all+'\n'+link);
   fs.writeFileSync(target,html);record.preNavigationSha256??=sha(before);record.adaptations=[...new Set([...(record.adaptations||[]),'GRAFIT return link to teaching overview; print-hidden responsive navigation.'])];changed++;
  }
  const course=courseByPage.get(file),subjectHref=(path.relative(path.dirname(target),path.join(base,course.id)).split(path.sep).join('/')||'.')+'/';
  const aria='Přehled přednášek '+course.id.toUpperCase();
  if(!html.includes('id="grafit-course-link"')){
   if(/<a class="brand"[^>]*>/.test(html))html=html.replace(/<a class="brand"[^>]*>/,()=>'<a class="brand" id="grafit-course-link" href="'+subjectHref+'" aria-label="'+aria+'">');
   else html=html.replace(/(<a id="grafit-lecture-return"[^>]*>[\s\S]*?<\/a>)/,all=>all+'\n<a id="grafit-course-link" class="grafit-course-link--floating" href="'+subjectHref+'" aria-label="'+aria+'">'+course.id.toUpperCase()+'</a>');
   record.adaptations=[...new Set([...(record.adaptations||[]),'Course brand links to its own subject overview.'])];
  }
  html=html.replace(/<a\b[^>]*id="grafit-course-link"[^>]*>/,tag=>tag.replace(/href="[^"]*"/,()=>`href="${subjectHref}"`));
  if(['vhs/p02/index.html','dvd/tajemstvi/index.html'].includes(file)){
   const version=sha(fs.readFileSync(path.join(path.dirname(target),'presentation.js'))).slice(0,12);
   html=html.replace(/src="presentation\.js(?:\?[^"]*)?"/,()=>`src="presentation.js?v=${version}"`);
  }
  const refreshed=html.replace(/<style id="grafit-lecture-return-style">[\s\S]*?<\/style>/,`<style id="grafit-lecture-return-style">${css}</style>`);
  if(refreshed!==before.toString('utf8')){fs.writeFileSync(target,refreshed);changed++;}
  const result=fs.readFileSync(target);record.bytes=result.length;record.sha256=sha(result);
 }
 // Keep the published PGA package checksum ledger valid after the site-only adaptation.
 const ledger=path.join(base,'pga/p01/SHA256SUMS.txt');
 if(fs.existsSync(ledger)){
  const old=fs.readFileSync(ledger),updated=old.toString('utf8').replace(/^([a-f0-9]{64})  (.+)$/gm,(all,hash,file)=>sha(fs.readFileSync(path.join(path.dirname(ledger),file.trim())))+'  '+file);
  if(updated!==old.toString('utf8')){fs.writeFileSync(ledger,updated);const record=manifest.files.find(f=>f.copy==='pga/p01/SHA256SUMS.txt');record.preNavigationSha256??=sha(old);record.bytes=Buffer.byteLength(updated);record.sha256=sha(updated);record.adaptations=['Checksum ledger refreshed after GRAFIT navigation adaptation.'];}
 }
 fs.writeFileSync(manifestPath,JSON.stringify(manifest,null,2)+'\n');
 console.log(`Overview return links: ${pages.length} lecture entrypoints (${changed} added).`);
};
