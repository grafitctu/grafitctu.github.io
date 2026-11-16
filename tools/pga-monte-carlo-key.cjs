module.exports=function addKey(html){
 const slide=/<article\b[^>]* id="slide-21"[^>]*>[\s\S]*?<\/article>/;
 const equation=/<div class="equation tex-equation"[^>]*>[\s\S]*?<\/div>/;
 const s=html.match(slide)?.[0];
 if(!s?.includes('Monte Carlo a path tracing')||!equation.test(s))throw Error('Missing Monte Carlo estimator');
 if(s.includes('data-mc-key'))return html;
 const legend='<aside data-mc-key aria-label="Význam symbolů" style="flex:1 1 19em;min-width:0"><p><b>g(ω)</b> — příspěvek směru do integrálu. U odrazu je to dopadající radiance × BRDF × kosinus úhlu dopadu.</p><p><b>p(ω)</b> — hustota pravděpodobnosti, s níž vybíráme směry (v sr⁻¹). Dělením touto hustotou vyrovnáme to, že některé směry losujeme častěji než jiné.</p><p><b>ωₖ</b> je k-tý vylosovaný směr, <b>N</b> počet vzorků a <b>dω</b> element prostorového úhlu.</p></aside>';
 return html.replace(slide,()=>s.replace(equation,eq=>'<div style="display:flex;flex-wrap:wrap;align-items:center;gap:.4em 1.5em">'+eq+legend+'</div>'));
};
