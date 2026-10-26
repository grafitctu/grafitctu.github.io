/* Explicit, reviewable TeX for every displayed formula. Rendered at build time,
 * with accessible MathML and local Computer Modern-derived KaTeX fonts. */
const katex=require('../vyuka/pga/richtr-web/vendor/katex-0.19.1/katex.js');
const formulas={
 p04:{
  'whitted-recursion':[String.raw`C_d=C_{\mathrm{local}}+w_r C_{r,d+1}+w_t C_{t,d+1},\qquad d<D`],
  'slide-3':String.raw`\begin{aligned}x&=r\cos\varepsilon\cos\varphi,\\y&=r\cos\varepsilon\sin\varphi,\\z&=r\sin\varepsilon.\end{aligned}`,
  'slide-6':String.raw`E=\frac{I}{r^2}\max(0,\mathbf n\cdot\boldsymbol\omega_i)`,
  'brdf-definition':[
   String.raw`\begin{aligned}f_r(x,\boldsymbol\omega_i,\boldsymbol\omega_o)&=\frac{\mathrm d L_o(x,\boldsymbol\omega_o)}{L_i(x,\boldsymbol\omega_i)\cos\theta_i\,\mathrm d\omega_i},\\[.5em][f_r]&=\mathrm{sr}^{-1}.\end{aligned}`,
   String.raw`\mathrm d E_i=L_i(x,\boldsymbol\omega_i)\cos\theta_i\,\mathrm d\omega_i`
  ],
  'brdf-measurement':[
   String.raw`f_r\approx\frac{L_{o,\mathrm{sample}}-L_{o,\mathrm{background}}}{E_i}`,
   String.raw`f_{r,\mathrm{sample}}\approx\frac{L_{o,\mathrm{sample}}}{L_{o,\mathrm{reference}}}\,\frac{\rho_{\mathrm{reference}}}{\pi}`
  ],
  'slide-10':{main:String.raw`\begin{gathered}f_r\geq0,\\ f_r(\boldsymbol\omega_i,\boldsymbol\omega_o)=f_r(\boldsymbol\omega_o,\boldsymbol\omega_i).\end{gathered}`,
   equations:[String.raw`\int_{\Omega^+}f_r(\boldsymbol\omega_i,\boldsymbol\omega_o)\cos\theta_o\,\mathrm d\omega_o\leq1`]},
  'brdf-lambert':[
   String.raw`f_r=\frac{\rho}{\pi}`,
   String.raw`\int_{\Omega^+}\cos\theta\,\mathrm d\omega=\pi`,
   String.raw`\int_{\Omega^+}\frac{\rho}{\pi}\cos\theta\,\mathrm d\omega=\rho`
  ],
  'slide-11':[String.raw`\begin{aligned}L_o(x,\boldsymbol\omega_o)&=L_e(x,\boldsymbol\omega_o)\\ &\quad+\int_{\Omega^+}f_r(x,\boldsymbol\omega_i,\boldsymbol\omega_o)\\ &\qquad\cdot L_i(x,\boldsymbol\omega_i)\cos\theta_i\,\mathrm d\omega_i.\end{aligned}`],
  'slide-13':String.raw`\begin{aligned}C&=k_a C_a+C_l\Bigl[\,k_d c_d\max(0,\mathbf n\cdot\mathbf l)\\&\qquad+k_s c_s\max(0,\mathbf r\cdot\mathbf v)^p\,\Bigr]\end{aligned}`,
  'slide-14':String.raw`\begin{aligned}\mathbf r&=2(\mathbf n\cdot\mathbf l)\mathbf n-\mathbf l,\\\cos\alpha&=\mathbf r\cdot\mathbf v,\\S&=k_s\max(0,\cos\alpha)^p.\end{aligned}`,
  'phong-lobe-3d':String.raw`S(\mathbf v)=k_s\max(0,\mathbf r\cdot\mathbf v)^p`,
  'slide-16':String.raw`\begin{gathered}\mathbf r(t)=\mathbf o+t\mathbf d,\\t\in[t_{\min},t_{\max}]\end{gathered}`,
  'slide-17':String.raw`\begin{aligned}a&=\mathbf d\cdot\mathbf d,\\b&=2\mathbf d\cdot(\mathbf o-\mathbf c),\\c_0&=\lVert\mathbf o-\mathbf c\rVert^2-R^2,\\at^2+bt+c_0&=0.\end{aligned}`,
  'slide-19':String.raw`\begin{gathered}\mathbf d_r=\mathbf d-2(\mathbf d\cdot\mathbf n)\mathbf n,\\ \eta_i\sin\theta_i=\eta_t\sin\theta_t\end{gathered}`,
  'slide-21':String.raw`\int g(\boldsymbol\omega)\,\mathrm d\omega\approx\frac1N\sum_{k=1}^N\frac{g(\boldsymbol\omega_k)}{p(\boldsymbol\omega_k)}`
 },
 p05:{
  'slide-6':String.raw`f_s(\boldsymbol\omega_i,\boldsymbol\omega_o)=\frac{D(\mathbf h)\,F(\boldsymbol\omega_i,\mathbf h)\,G(\boldsymbol\omega_i,\boldsymbol\omega_o)}{4\lvert\mathbf n\cdot\boldsymbol\omega_i\rvert\,\lvert\mathbf n\cdot\boldsymbol\omega_o\rvert}`,
  'slide-8':String.raw`F(\theta)=F_0+(1-F_0)(1-\cos\theta)^5`,
  'slide-14':String.raw`\begin{aligned}\mathbf n_t&=\operatorname{normalize}(2\mathbf c-\mathbf1),\\\mathbf n&=\operatorname{normalize}(\mathrm{TBN}\,\mathbf n_t).\end{aligned}`
 }
};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function render(tex){return `<div class="equation tex-equation" data-tex="${esc(tex)}">${katex.renderToString(tex,{displayMode:true,output:'htmlAndMathml',throwOnError:true,strict:'error',trust:false,maxExpand:1000})}</div>`;}
function prepare(slug,t){const f=formulas[slug]?.[t.id];if(t.math){const tex=typeof f==='string'?f:f?.main;if(!tex)throw Error('Missing main TeX '+slug+'/'+t.id);t.mathHtml=render(tex);}
 if(t.equations)t.equations.forEach((e,i)=>{e.tex=Array.isArray(f)?f[i]:f?.equations?.[i];if(!e.tex)throw Error('Missing equation TeX '+slug+'/'+t.id+'/'+i);e.html=render(e.tex);});return t;}
const inlineFormulas={
 'k_d':String.raw`k_d`,'k_s':String.raw`k_s`,'kₐ':String.raw`k_a`,'Cₐ':String.raw`C_a`,'Cₗ':String.raw`C_l`,'c_d':String.raw`c_d`,'c_s':String.raw`c_s`,
 'θ=90°−ε':String.raw`\theta=90^\circ-\varepsilon`,'cos θ=sin ε':String.raw`\cos\theta=\sin\varepsilon`,
 'I = dΦ/dω':String.raw`I=\frac{\mathrm d\Phi}{\mathrm d\omega}`,
 'E = dΦ/dA':String.raw`E=\frac{\mathrm d\Phi}{\mathrm dA}`,
 'L = d²Φ/(dA⊥ dω)':String.raw`L=\frac{\mathrm d^2\Phi}{\mathrm dA_{\perp}\,\mathrm d\omega}`,
 '1/r²':String.raw`1/r^2`,
 'ωᵢ = (θᵢ, φᵢ)':String.raw`\boldsymbol\omega_i=(\theta_i,\varphi_i)`,
 'ωₒ = (θₒ, φₒ)':String.raw`\boldsymbol\omega_o=(\theta_o,\varphi_o)`,
 'fᵣ = ρ/π':String.raw`f_r=\rho/\pi`,
 'Lₒ = ρE/π':String.raw`L_o=\rho E/\pi`,
 't²−10t+24=0':String.raw`t^2-10t+24=0`,
 'F₀=((1−1,5)/(1+1,5))²=0,04':String.raw`F_0=\left(\frac{1-1{,}5}{1+1{,}5}\right)^2=0{,}04`,
 'fᵣ = dLₒ/dEᵢ':String.raw`f_r=\mathrm dL_o/\mathrm dE_i`,
 'dEᵢ = Lᵢ cos θᵢ dωᵢ':String.raw`\mathrm dE_i=L_i\cos\theta_i\,\mathrm d\omega_i`,
 'fᵣ=ρ/π':String.raw`f_r=\rho/\pi`,
 'sr⁻¹':String.raw`\mathrm{sr}^{-1}`,
 'ωᵢ':String.raw`\boldsymbol\omega_i`,'ωₒ':String.raw`\boldsymbol\omega_o`,
 'θᵢ':String.raw`\theta_i`,'θₒ':String.raw`\theta_o`,
 'fᵣ':String.raw`f_r`,'dLₒ':String.raw`\mathrm dL_o`,'dEᵢ':String.raw`\mathrm dE_i`,
 'Lᵢ':String.raw`L_i`,'Lₒ':String.raw`L_o`,'dωᵢ':String.raw`\mathrm d\omega_i`,
 'ρ/π':String.raw`\rho/\pi`,'F₀':String.raw`F_0`
};
const inlinePattern=new RegExp(Object.keys(inlineFormulas).sort((a,b)=>b.length-a.length).map(x=>x.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|'),'g');
function text(s){s=String(s);let result='',last=0;for(const m of s.matchAll(inlinePattern)){result+=esc(s.slice(last,m.index))+katex.renderToString(inlineFormulas[m[0]],{displayMode:false,output:'htmlAndMathml',throwOnError:true,strict:'error',trust:false});last=m.index+m[0].length;}return result+esc(s.slice(last));}
function inline(source){return katex.renderToString(source,{displayMode:false,output:'htmlAndMathml',throwOnError:true,strict:'error',trust:false});}
module.exports={formulas,render,prepare,text,inline};
