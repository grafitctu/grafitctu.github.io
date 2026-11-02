// One HTML slide for each original page, including incremental reveals.
const sequence=require('../data/texture-sequence.json');
const image=(file,alt)=>`<a href="data/taxonomy/extracted/${file}" target="_blank" rel="noopener"><img src="data/taxonomy/extracted/${file}" alt="${alt}"></a>`;
module.exports=()=>sequence.map(({page,images})=>{
 let title=page>=62?'Spatial homogeneity - random placed universal patch':page>=48&&page<=60?'Textury':'Textura',body='';
 if(page===36)body='<ul class="texture-question"><li>Co je to vlastně textura?</li></ul>';
 else if(page<=47){
  const first=page<=41, total=first?5:6;
  body=`<div class="texture-reveal ${first?'five':'six'}">${Array.from({length:total},(_,i)=>`<figure>${images[i]?image(images[i].file,`${first?'Ovoce':'Krajina s postavou'}: původní ilustrace ${i+1}`):''}</figure>`).join('')}</div>`;
 }else if(page<=60){
  body='<p>Exaktní matematická definice textury neexistuje.</p>';
  if(page>=49)body+=`<div class="texture-materials">${image(images[0].file,'Původní fotografie krajiny s postavou a postupné označení materiálů')}<p>Vizuální scény jsou reprezentovány tvary a materiály. Materiály jsou pak reprezentovány pomocí vizuálních textur.</p></div>`;
 }else if(page===61){
  body='<div class="columns texture-definition"><ul><li>Exaktní definice textury neexistuje.</li><li>Přesto je množství kritérií, které musí splňovat.</li><li>Základní je homogenita ve všech dimenzích.</li><li>To, že základní vlastnosti textury se průběžně nemění, jí umožňují syntetizovat a zacházet s ní jako s celkem.</li><li>Textura tedy není libovolný obrázek napláclý na 3D model.</li></ul><aside><h2>Základní vlastnost textury</h2><p>Základní vlastností textury je to, že je (více či méně) homogenní. Tj. z jedné její části je možné odhadnout, jak vypadá jiná část.</p><p>Jinými slovy dostatečný malý kus textury obsahuje všechny frekvence, které se objevují i ve všech dalších částech textury.</p></aside></div>';
 }else body=`<div class="texture-homogeneity">${image(images[0].file,'Původní srovnání prostorové homogenity: náhodně umístěný univerzální výřez')}</div>`;
 return {title,section:'TEXTURA',body:`<div class="texture-native" data-original-page="${page}">${body}</div>`};
});
