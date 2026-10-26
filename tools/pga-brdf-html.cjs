const fs=require('fs'),path=require('path'),tex=require('./pga-tex.cjs');
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function images(dir,page){const svg=fs.readFileSync(path.join(dir,'assets',`page-${String(page).padStart(3,'0')}.svg`),'utf8').replace(/<mask\b[\s\S]*?<\/mask>/g,'');return[...new Set([...svg.matchAll(/<image\b[^>]*>/g)].map(m=>m[0]).filter(t=>Number(t.match(/\bwidth="([\d.]+)"/)?.[1])>30&&Number(t.match(/\bheight="([\d.]+)"/)?.[1])>30).map(t=>t.match(/(?:xlink:)?href="(image-[^"]+)"/)?.[1]).filter(Boolean))];}
const image=(file,alt)=>`<a href="assets/${file}" target="_blank" rel="noopener"><img src="assets/${file}" loading="lazy" alt="${esc(alt)}"></a>`;
module.exports=function extra(t,dir){let html='';
for(const b of t.callouts||[])html+=`<aside class="key-block key-${b.kind||'definition'}"><h3>${esc(b.title)}</h3><p>${tex.text(b.text)}</p></aside>`;
if(t.equations)html+='<div class="brdf-equations">'+t.equations.map(e=>`<section class="brdf-equation"><p>${esc(e.label)}</p>${e.html||(()=>{throw Error("TeX must be prepared before HTML rendering");})()}</section>`).join('')+'</div>';
if(t.table)html+='<div class="table-scroll brdf-table"><table><thead><tr>'+t.table.headers.map(x=>'<th scope="col">'+esc(x)+'</th>').join('')+'</tr></thead><tbody>'+t.table.rows.map(row=>'<tr>'+row.map(x=>'<td>'+esc(x)+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>';
if(t.sourcePairs){const files=images(dir,t.sourcePairs);if(files.length!==10)throw Error('Expected all five source material pairs');html+='<div class="material-pairs">'+Array.from({length:5},(_,i)=>'<figure>'+image(files[i],`Koule, vzorek ${i+1}`)+image(files[i+5],`Plošný vzorek ${i+1}`)+`<figcaption>Vzorek ${i+1}</figcaption></figure>`).join('')+'</div><p class="brdf-references">Stejné vzorky na kouli a na ploše.</p>';}
for(const g of t.sourceGallery||[]){const files=images(dir,g.page);html+=`<figure class="brdf-source-gallery"><div class="original-images${files.length>1?' many':''}">${files.map((file,i)=>image(file,`Materiálový příklad ${i+1}`)).join('')}</div><figcaption>${esc(g.caption)} <a href="original.pdf#page=${g.page}">Zdroj ilustrace</a></figcaption></figure>`;}
if(t.references)html+='<nav class="brdf-references" aria-label="Odborné zdroje">'+t.references.map(r=>`<a href="${esc(r.url)}">${esc(r.title)}</a>`).join('')+'</nav>';
return html;};
module.exports.images=images;
