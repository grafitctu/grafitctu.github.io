(()=>{
 'use strict';
 const host=document.querySelector('[data-covariance-lab]');if(!host)return;
 const M=window.CovarianceMath,root=host.querySelector('[data-cov3]'),old=host.querySelector('[data-cov2]');
 const state={dimension:new URL(location.href).searchParams.get('cov')==='3'?3:2,preset:'base',points:[],cell:[0,0]},bad=new Set();let report,valid=false;
 const $=selector=>root.querySelector(selector),tr=(cs,en)=>document.body.dataset.lang==='en'?en:cs;
 const f=(x,d=4)=>{if(Math.abs(x)<.5*10**(-d))x=0;return x.toLocaleString(document.body.dataset.lang==='en'?'en-US':'cs-CZ',{maximumFractionDigits:d,useGrouping:false});};
 const sub=['₁','₂','₃'],name=i=>'x'+sub[i],cname=(i,j)=>'C'+sub[i]+sub[j];
 function load(){
  state.points=M.presets[state.preset].map(row=>row.slice());bad.clear();
  $('[data-cov-inputs]').innerHTML='<thead><tr><th>'+tr('Vzorek','Sample')+'</th>'+[0,1,2].map(i=>'<th>'+name(i)+'</th>').join('')+'</tr></thead><tbody>'+state.points.map((row,r)=>'<tr><th scope="row">'+(r+1)+'</th>'+row.map((x,c)=>'<td><input type="number" step="any" value="'+x+'" data-row="'+r+'" data-column="'+c+'" aria-label="'+tr('Vzorek','Sample')+' '+(r+1)+', '+name(c)+'"></td>').join('')+'</tr>').join('')+'</tbody><tfoot><tr><th>μ</th>'+[0,1,2].map(i=>'<td data-cov-mean="'+i+'"></td>').join('')+'</tr></tfoot>';
  render();
 }
 function table(headers,rows){return '<table class="data-table"><thead><tr>'+headers.map(x=>'<th>'+x+'</th>').join('')+'</tr></thead><tbody>'+rows.map(row=>'<tr>'+row.map(x=>'<td>'+x+'</td>').join('')+'</tr>').join('')+'</tbody></table>';}
 function plots(){
  $('[data-cov-views]').innerHTML=[[0,1],[0,2],[1,2]].map(([a,b])=>{
   const xs=state.points.map(row=>row[a]),ys=state.points.map(row=>row[b]);let xmin=Math.min(...xs),xmax=Math.max(...xs),ymin=Math.min(...ys),ymax=Math.max(...ys);
   if(xmin===xmax){xmin--;xmax++;}if(ymin===ymax){ymin--;ymax++;}
   const px=x=>35+(x-xmin)/(xmax-xmin)*190,py=y=>135-(y-ymin)/(ymax-ymin)*100;
   const groups=new Map();state.points.forEach((row,r)=>{const key=row[a]+','+row[b];if(!groups.has(key))groups.set(key,{row,labels:[]});groups.get(key).labels.push(r+1);});
   return '<svg viewBox="0 0 265 170" role="img" aria-label="'+name(a)+' / '+name(b)+'"><title>'+name(a)+' / '+name(b)+'</title><path d="M30 20V140H240" fill="none" stroke="#60777a"/><text x="230" y="162">'+name(a)+'</text><text x="5" y="18">'+name(b)+'</text>'+[...groups.values()].map(({row,labels})=>'<circle cx="'+px(row[a])+'" cy="'+py(row[b])+'" r="5" fill="#007f78"/><text x="'+(px(row[a])+7)+'" y="'+(py(row[b])-6)+'">'+labels.join(',')+'</text>').join('')+'</svg>';
  }).join('');
 }
 function render(){
  const error=$('[data-cov-error]');
  if(bad.size){valid=false;error.hidden=false;error.textContent=tr('Doplňte všechny příznaky konečnými čísly. Výpočet čeká na platný vstup.','Fill every feature with a finite number. The calculation waits for valid input.');return;}
  try{report=M.stats(state.points);valid=true;}catch(e){valid=false;error.hidden=false;error.textContent=tr('Hodnoty nelze zpracovat. Zkontrolujte čísla ve vstupní tabulce.','The values cannot be processed. Check the input numbers.');return;}
  error.hidden=true;
  host.querySelectorAll('[data-cov-preset] option').forEach(o=>o.textContent=o.dataset[document.body.dataset.lang==='en'?'en':'cs']);
  $('[data-cov-inputs] thead th').textContent=tr('Vzorek','Sample');
  $('[data-cov-inputs]').querySelectorAll('input').forEach(input=>input.setAttribute('aria-label',tr('Vzorek','Sample')+' '+(Number(input.dataset.row)+1)+', '+name(Number(input.dataset.column))));
  for(let i=0;i<3;i++)$('[data-cov-mean="'+i+'"]').textContent=f(report.mean[i]);
  const [i,j]=state.cell,E=M.entry(report,i,j);
  $('[data-cov-shape]').textContent=tr('Řádky = vzorky, sloupce = příznaky. ','Rows = samples, columns = features. ')+'Xᶜ: '+report.n+' × 3; Xᶜᵀ: 3 × '+report.n+'; C: (3 × '+report.n+') · ('+report.n+' × 3) = 3 × 3.';
  $('[data-cov-cells]').querySelectorAll('button').forEach(button=>{
   const [r,c]=button.dataset.covCell.split(',').map(Number);button.innerHTML='<span>'+cname(r,c)+'</span><strong>'+f(report.C[r][c])+'</strong>';
   button.setAttribute('aria-pressed',String(r===i&&c===j));button.dataset.active=String(r===i&&c===j||r===j&&c===i);button.dataset.diagonal=String(r===c);
  });
  $('[data-cov-entry]').textContent=cname(i,j)+' — '+(i===j?tr('rozptyl příznaku ','variance of feature ')+name(i):tr('kovariance příznaků ','covariance of features ')+name(i)+', '+name(j));
  $('[data-cov-products]').innerHTML=table([tr('Vzorek','Sample'),'Δ'+name(i),'Δ'+name(j),tr('Součin','Product')],report.centered.map((row,r)=>[r+1,f(row[i]),f(row[j]),f(E.products[r])]));
  $('[data-cov-sum]').textContent=cname(i,j)+' = ['+E.products.map(x=>'('+f(x)+')').join(' + ')+'] / ('+report.n+' − 1) = '+f(E.sum)+' / '+E.divisor+' = '+f(E.value,6);
  $('[data-cov-explain]').textContent=i===j?tr('Násobíme odchylku samu sebou. Proto je rozptyl nezáporný.','Multiply each deviation by itself. This makes the variance nonnegative.'):tr('Kladný součin: obě odchylky mají stejné znaménko. Záporný součin: opačná znaménka. Při výměně příznaků se součin nezmění, a proto Cᵢⱼ = Cⱼᵢ.','A positive product means matching deviation signs; a negative product means opposite signs. Swapping features leaves the product unchanged, so Cᵢⱼ = Cⱼᵢ.');
  $('[data-cov-eigenvalues]').textContent=report.values.map((x,k)=>'λ'+sub[k]+' = '+f(x,6)).join(' · ');
  $('[data-cov-eigenvectors]').innerHTML=table(['PC','λ','u = (u₁; u₂; u₃)',tr('Podíl rozptylu','Variance share')],report.values.map((x,k)=>['PC'+(k+1),f(x,6),'('+report.vectors[k].map(v=>f(v,4)).join('; ')+')',report.fractions[k]===null?'—':f(100*report.fractions[k],2)+' %']));
  $('[data-cov-eigen-note]').textContent=report.repeated?tr('Shodná vlastní čísla: v příslušném podprostoru není báze vlastních vektorů jednoznačná. Lze zvolit i jiné navzájem kolmé jednotkové směry.','Repeated eigenvalues: the eigenvector basis in that subspace is not unique. Other orthogonal unit directions are equally valid.'):report.rank<3?tr('Nulové vlastní číslo znamená směr bez rozptylu. U lineárně závislých příznaků má kovarianční matice nižší hodnost.','A zero eigenvalue identifies a direction with no variance. Linearly dependent features give a covariance matrix of reduced rank.'):tr('Platí Cu = λu. Vlastní vektory zde mají délku 1 a jsou navzájem kolmé; λ udává výběrový rozptyl projekce na daný směr.','Cu = λu. These eigenvectors have unit length and are mutually orthogonal; λ is the sample variance of the projection onto that direction.');
  plots();
 }
 function dimension(value){
  state.dimension=value;root.hidden=value!==3;old.hidden=value!==2;
  host.querySelectorAll('[data-cov-dimension]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.covDimension)===value)));
  const url=new URL(location.href);url.searchParams.set('cov',String(value));history.replaceState(null,'',url);render();
 }
 for(let i=0;i<3;i++)for(let j=0;j<3;j++){const button=document.createElement('button');button.type='button';button.dataset.covCell=i+','+j;button.addEventListener('click',()=>{state.cell=[i,j];render();});$('[data-cov-cells]').append(button);}
 $('[data-cov-inputs]').addEventListener('input',event=>{const input=event.target;if(!input.matches('input'))return;const key=input.dataset.row+','+input.dataset.column,value=Number(input.value);if(input.value.trim()===''||!Number.isFinite(value))bad.add(key);else{bad.delete(key);state.points[Number(input.dataset.row)][Number(input.dataset.column)]=value;}render();});
 $('[data-cov-preset]').addEventListener('change',event=>{state.preset=event.target.value;load();});$('[data-cov-reset]').addEventListener('click',load);
 host.querySelectorAll('[data-cov-dimension]').forEach(b=>b.addEventListener('click',()=>dimension(Number(b.dataset.covDimension))));
 document.addEventListener('geometry:change',render);load();dimension(state.dimension);
 window.CovarianceLab={getReport:()=>structuredClone({dimension:state.dimension,preset:state.preset,points:state.points,selected:state.cell,valid,report,entry:report?M.entry(report,...state.cell):null})};
})();
