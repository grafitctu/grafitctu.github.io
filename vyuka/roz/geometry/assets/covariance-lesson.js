(function(){
 'use strict';const root=document.querySelector('[data-cov-lesson]');if(!root)return;
 const M=window.CovarianceLessonMath,state={source:'current',step:0};let latest;
 const en=()=>document.body.dataset.lang==='en',t=(cs,english)=>en()?english:cs;
 const num=(v,d=5)=>Number(Math.abs(v)<.5*10**(-d)?0:v).toLocaleString(en()?'en-GB':'cs-CZ',{minimumFractionDigits:d,maximumFractionDigits:d});
 const vector=(v,d=5)=>'('+v.map(value=>num(value,d)).join('; ')+')';
 const matrix=r=>`<div class="math cov-number-matrix">C = [ ${num(r.a)} &nbsp; ${num(r.b)} ]<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[ ${num(r.b)} &nbsp; ${num(r.d)} ]</div>`;
 function render(){
  const points=state.source==='tiny'?M.tiny:window.GeometryLab.getPoints(),r=M.calculate(points);latest=r;
  root.querySelector('[data-cov-source]').value=state.source;
  root.querySelectorAll('[data-cov-step]').forEach(el=>el.setAttribute('aria-pressed',String(+el.dataset.covStep===state.step)));
  root.querySelector('[data-cov-scope]').textContent=t(`Počet bodů n = ${r.n}. Všechny součty a průměry patří těmto ${r.n} bodům.`,`Point count n = ${r.n}. Every sum and mean uses these ${r.n} points.`);
  let html='';
  if(state.step===0){
   html=`<p>${t('Nejprve spočteme průměr a od každého bodu ho odečteme.','First compute the mean, then subtract it from each point.')}</p><div class="math">μ = ${vector(r.mean)}<br>Δxᵢ = xᵢ − μₓ, &nbsp; Δyᵢ = yᵢ − μᵧ</div><table class="metric-table"><thead><tr><th>i</th><th>xᵢ</th><th>yᵢ</th><th>Δxᵢ</th><th>Δyᵢ</th></tr></thead><tbody>${r.rows.slice(0,4).map((row,i)=>`<tr><td>${i+1}</td><td>${num(row.x,3)}</td><td>${num(row.y,3)}</td><td>${num(row.dx,3)}</td><td>${num(row.dy,3)}</td></tr>`).join('')}</tbody></table>${r.n>4?`<p class="small">${t('Tabulka ukazuje první čtyři body. Další kroky počítají ze všech '+r.n+' bodů.','The table shows the first four points. Later steps use all '+r.n+' points.')}</p>`:''}`;
  }else if(state.step===1){
   html=`<p>${t('Sečteme čtverce a součiny odchylek, potom dělíme n − 1. Na diagonále jsou rozptyly, mimo diagonálu kovariance.','Sum squared deviations and products, then divide by n − 1. Variances lie on the diagonal, covariance off the diagonal.')}</p><div class="math">a = ∑ Δxᵢ² / (${r.n} − 1) = ${num(r.sums[0])} / ${r.n-1} = ${num(r.a)}<br>b = ∑ ΔxᵢΔyᵢ / (${r.n} − 1) = ${num(r.sums[1])} / ${r.n-1} = ${num(r.b)}<br>d = ∑ Δyᵢ² / (${r.n} − 1) = ${num(r.sums[2])} / ${r.n-1} = ${num(r.d)}</div>${matrix(r)}`;
  }else if(state.step===2){
   html=`${matrix(r)}<p>${t('Pro symetrickou matici 2 × 2 dostaneme větší vlastní číslo přímo. Symboly a, b, d označují položky matice výše.','For a symmetric 2 × 2 matrix, compute the larger eigenvalue directly. Symbols a, b and d refer to the matrix entries above.')}</p><div class="math">Δ = √((a − d)² + 4b²) = ${num(r.delta)}<br>λ₁ = (a + d + Δ) / 2 = ${num(r.lambda)}<br>λ₂ = (a + d − Δ) / 2 = ${num(r.lambda2)}</div>`;
  }else if(state.step===3){
   html=`<p>${t('Z rovnice (C − λ₁I)v = 0 můžeme při b ≠ 0 vzít vektor v = (b, λ₁ − a). Jeho délku potom upravíme na 1. Při b = 0 vybereme osu s větším rozptylem.','From (C − λ₁I)v = 0, when b ≠ 0 we can take v = (b, λ₁ − a). Normalize its length to 1. When b = 0, choose the axis with larger variance.')}</p><div class="math">v = ${vector(r.v)}<br>‖v‖ = ${num(r.length)}<br>u₁ = v / ‖v‖ = ${vector(r.u)}<br>θ = atan2(u₁ᵧ, u₁ₓ) = ${num(r.angle*180/Math.PI,3)}°</div><p>${t('Úhel měříme od kladné vodorovné osy. Opačný vektor −u₁ popisuje stejnou projekční osu.','Measure the angle from the positive horizontal axis. The opposite vector −u₁ describes the same projection axis.')}</p>`;
  }else{
   html=`<p>${t('Dosadíme vypočtený jednotkový směr zpět do rovnice. Násobení maticí musí dát stejný výsledek jako násobení vlastním číslem.','Substitute the computed unit direction back into the equation. Matrix multiplication must match multiplication by the eigenvalue.')}</p><div class="math">Cu₁ = ${vector(r.product)}<br>λ₁u₁ = ${vector(r.expected)}<br>‖u₁‖ = ${num(Math.hypot(...r.u))}<br>V(u₁) = u₁ᵀCu₁ = ${num(r.lambda)}</div><p>${t('Výpočty používají plnou přesnost. Zde zobrazená čísla jsou zaokrouhlená.','Calculations use full precision. The values shown here are rounded.')}</p>`;
  }
  if(r.nonunique)html+=`<p class="note">${t('Vlastní čísla jsou stejná. Hlavní směr není jednoznačný; ukazujeme jednu platnou volbu.','The eigenvalues are equal. The principal direction is not unique; we show one valid choice.')}</p>`;
  root.querySelector('[data-cov-stage-content]').innerHTML=html;
  root.querySelector('[data-cov-print-summary]').innerHTML=`<p>n = ${r.n}, &nbsp; μ = ${vector(r.mean,3)}</p>${matrix(r)}<div class="math">λ₁ = ${num(r.lambda)}, &nbsp; u₁ = ${vector(r.u)}<br>θ = ${num(r.angle*180/Math.PI,3)}°</div>`;
 }
 root.querySelector('[data-cov-source]').addEventListener('change',event=>{state.source=event.target.value;render();});
 root.querySelectorAll('[data-cov-step]').forEach(el=>el.addEventListener('click',()=>{state.step=+el.dataset.covStep;render();}));
 document.addEventListener('geometry:change',render);window.CovarianceLesson={state,render,getReport:()=>latest};render();
})();
