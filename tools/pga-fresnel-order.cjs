module.exports=function fresnel(html,katex){
 const math=tex=>katex.renderToString(tex,{displayMode:true,throwOnError:true});
 function change(id,fn){
  const re=new RegExp('<article\\b[^>]* id="'+id+'"[^>]*>[\\s\\S]*?</article>');
  if(!re.test(html))throw Error('Missing optics slide '+id);
  html=html.replace(re,s=>fn(s));
 }
 if(html.includes('data-fresnel-exact'))return html;
 const row='<div style="display:flex;flex-wrap:wrap;gap:.4em 1em;align-items:center">';
 change('slide-19',s=>{
  const i=s.indexOf('<div class="content illustrated">'),j=s.indexOf('<figure>',i);
  if(i<0||j<i)throw Error('Unexpected Fresnel layout');
  const pair=row+math('R_s=\\left|\\frac{n_i\\cos\\theta_i-n_t\\cos\\theta_t}{n_i\\cos\\theta_i+n_t\\cos\\theta_t}\\right|^2')+
   math('R_p=\\left|\\frac{n_t\\cos\\theta_i-n_i\\cos\\theta_t}{n_t\\cos\\theta_i+n_i\\cos\\theta_t}\\right|^2')+'</div>';
  return s.slice(0,i)+'<div data-fresnel-exact>'+pair+'<p>Na hladkém rozhraní dvou neabsorbujících dielektrik se dvě polarizace odrážejí různě. Elektrické pole kmitá <strong>kolmo</strong> k rovině dopadu (s), nebo <strong>rovnoběžně</strong> s ní (p). Zlomky jsou poměry amplitud; jejich druhé mocniny dávají podíly výkonu.</p></div><div class="content illustrated"><div><p>Indexy lomu před a za rozhraním jsou <i>nᵢ, nₜ</i>. Úhel dopadu θᵢ i úhel lomu θₜ měříme od normály. θₜ získáme ze Snellova zákona:</p>'+math('n_i\\sin\\theta_i=n_t\\sin\\theta_t')+'<p>Nepolarizované světlo má v obou složkách stejný výkon:</p>'+math('F=\\tfrac12(R_s+R_p),\\qquad T=1-F')+'<p>Při úplném vnitřním odrazu lomená větev nepřenáší výkon: <i>F = 1</i>.</p></div>'+s.slice(j);
 });
 change('fresnel-illustrations',s=>s.replace('<div class="content"><div><ul>','<div data-fresnel-schlick><p><strong>Kolmý dopad je přesný zvláštní případ.</strong> Obě polarizace mají stejnou odrazivost. Pro jiné úhly můžeme místo výpočtu obou složek použít <strong>Schlickovu aproximaci</strong>:</p>'+row+math('F_0=\\left(\\frac{n_i-n_t}{n_i+n_t}\\right)^2')+math('F_{\\mathrm{Schlick}}(\\theta_i)=F_0+(1-F_0)(1-\\cos\\theta_i)^5')+'</div><p>Vzduch → sklo (1 → 1,5): při kolmém dopadu se odrazí 4 % výkonu. Při 60° dávají plné rovnice 8,92 %, Schlick 7 %. Úplný vnitřní odraz testujeme samostatně.</p></div><div class="content"><div><ul>'));
 return html;
};
