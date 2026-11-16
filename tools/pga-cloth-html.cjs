function addCloth(html){
 const slide=/(<article\b[^>]*\bid="brdf-directions"[^>]*>[\s\S]*?<\/h2>)/;
 if(!slide.test(html))throw Error('Missing BRDF direction slide');
 if(html.includes('data-measured-cloth'))return html;
 return html.replace(slide,'$1<details data-measured-cloth><summary><strong>Měřené látky: otoč sárí a porovnej jeho odlesk s MERL</strong></summary><p><a href="cloth/index.html" target="_blank" rel="noopener">Otevřít ukázku v samostatném okně ↗</a></p><iframe loading="lazy" title="Měřené BRDF: dvě látky a barevný prostorový graf" src="cloth/index.html" style="display:block;width:100%;height:min(76vh,650px);border:0"></iframe></details>');
}
module.exports=addCloth;
