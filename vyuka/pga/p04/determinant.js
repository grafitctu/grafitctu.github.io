// A column determinant is a signed volume; do not take abs before division.
(()=>{
 const lab=document.querySelector('#ray-triangle-worked [data-triangle-lab]'),M=globalThis.PGATriangle;
 if(!lab||!M)return;
 const panel=document.createElement('section');
 panel.innerHTML='<h3>Jeden systém, tři neznámé</h3><p>Průsečík musí ležet na paprsku i v rovině trojúhelníku: <i>O + td = A + u(B − A) + v(C − A)</i>. Přesuňme známé členy na pravou stranu. Se sloupci <i>a = B − A, b = C − A, c = −d</i> a pravou stranou <i>q = O − A</i> dostaneme <strong>au + bv + ct = q</strong>.</p><p>Determinant Δ = det[a b c] je orientovaný objem rovnoběžnostěnu. Nahraďme první sloupec vektorem q: z linearity platí det[q b c] = uΔ, protože členy se dvěma stejnými sloupci vymizí. Stejně získáme v a t výměnou druhého a třetího sloupce.</p><details open><summary><strong>Výpočet pro paprsek nastavený nahoře</strong></summary><p class="det-input"></p><div class="det-matrices" style="display:flex;flex-wrap:wrap;align-items:center;gap:1em"></div><p class="det-result"></p><svg viewBox="0 0 540 164" style="display:block;width:min(100%,720px);height:auto" role="img" aria-label="Tři podepsané podíly ploch pro vrcholy A, B a C"></svg><p class="det-caption"></p></details>';
 lab.append(panel);
 const fmt=x=>new Intl.NumberFormat('cs',{maximumFractionDigits:3}).format(Math.abs(x)<1e-10?0:x);
 const sub=(a,b)=>a.map((x,i)=>x-b[i]),det=([a,b,c])=>a[0]*(b[1]*c[2]-b[2]*c[1])-b[0]*(a[1]*c[2]-a[2]*c[1])+c[0]*(a[1]*b[2]-a[2]*b[1]);
 const vec=v=>'('+v.map(fmt).join('; ')+')';
 function update(){
  const s=M.scene(Object.fromEntries([...lab.querySelectorAll('input[type=range]')].map(e=>[e.name,+e.value]))),[A,B,C]=M.vertices;
  const a=sub(B,A),b=sub(C,A),c=s.d.map(x=>-x),q=sub(s.o,A),cols=[[a,b,c],[q,b,c],[a,q,c],[a,b,q]],D=cols.map(det);
  panel.querySelector('.det-input').textContent='O = '+vec(s.o)+', d = '+vec(s.d)+', q = O − A = '+vec(q)+'.';
  panel.querySelector('.det-matrices').innerHTML=cols.map((col,k)=>'<math xmlns="http://www.w3.org/1998/Math/MathML" aria-label="'+['Základní determinant','Čitatel pro u','Čitatel pro v','Čitatel pro t'][k]+'"><mrow><mi>'+['Δ','Δᵤ','Δᵥ','Δₜ'][k]+'</mi><mo>=</mo><mo stretchy="true">|</mo><mtable>'+[0,1,2].map(i=>'<mtr>'+col.map((v,j)=>'<mtd><mn'+(j===k-1?' mathcolor="#aa5310"':'')+'>'+fmt(v[i])+'</mn></mtd>').join('')+'</mtr>').join('')+'</mtable><mo stretchy="true">|</mo><mo>=</mo><mn>'+fmt(D[k])+'</mn></mrow></math>').join('');
  const svg=panel.querySelector('svg'),cap=panel.querySelector('.det-caption'),res=panel.querySelector('.det-result');
  if(Math.abs(D[0])<=1e-12*Math.hypot(...s.d)*4){
   res.textContent='Δ = 0: sloupce jsou lineárně závislé. Nedělíme nulou. U tohoto trojúhelníku je paprsek rovnoběžný s rovinou z = −5 a začíná mimo ni.';svg.innerHTML='';svg.style.display='none';cap.textContent='Bez průsečíku s rovinou nejsou žádné dílčí plochy.';return;
  }
  const [u,v,t]=D.slice(1).map(x=>x/D[0]),w=1-u-v,P=s.o.map((x,i)=>x+t*s.d[i]),weights=[w,u,v];
  const inside=weights.every(x=>x>=-1e-10),valid=t>=1e-6&&t<=s.settings.tMax;
  res.textContent=['u','v','t'].map((sym,i)=>sym+' = '+fmt(D[i+1])+' / '+fmt(D[0])+' = '+fmt([u,v,t][i])).join('; ') + '. P = '+vec(P)+'. '+(!inside?'Alespoň jedna váha je záporná: bod leží mimo trojúhelník. ': 'Všechny váhy jsou nezáporné: bod leží v trojúhelníku nebo na jeho hraně. ')+(valid?'Parametr t leží v povoleném intervalu.':'Parametr t je mimo povolený interval; paprsek nemá platný zásah.');
  const points=[A,B,C,P],xx=points.map(p=>p[0]),yy=points.map(p=>p[1]),lo=Math.min(...xx),hi=Math.max(...xx),bottom=Math.min(...yy),top=Math.max(...yy),scale=Math.min(136/(hi-lo),100/(top-bottom));
  const xy=p=>[83+(p[0]-(hi+lo)/2)*scale,67-(p[1]-(top+bottom)/2)*scale],coords=vs=>vs.map(p=>xy(p).join(',')).join(' ');
  svg.style.display='block';svg.innerHTML=[[P,B,C],[A,P,C],[A,B,P]].map((vs,i)=>'<g transform="translate('+180*i+' 0)"><polygon points="'+coords(vs)+'" fill="'+(weights[i]<-1e-10?'#d96652':['#d4a04b','#419986','#638bc1'][i])+'" fill-opacity=".72"/><polygon points="'+coords([A,B,C])+'" fill="none" stroke="currentColor"/>'+[A,B,C,P].map((p,j)=>{let [x,y]=xy(p);return '<circle cx="'+x+'" cy="'+y+'" r="2.5" fill="currentColor"/><text x="'+(x+3)+'" y="'+(y+(j===3?13:-3))+'" font-size="11" fill="currentColor">'+'ABCP'[j]+'</text>'}).join('')+'<text x="83" y="154" text-anchor="middle" font-size="14" fill="currentColor">'+['1 − u − v','u','v'][i]+' = '+fmt(weights[i])+'</text></g>').join('');
  cap.textContent='Čelní pohled: barevná plocha dělená plochou ABC dává váhu protilehlého vrcholu. Počítáme s orientací: při překročení hrany plocha změní znaménko (červená). Na hraně je odpovídající váha nulová.';
 }
 lab.addEventListener('input',update);lab.addEventListener('change',update);lab.addEventListener('click',e=>{if(e.target.closest('[data-triangle-reset]'))update()});update();
})();
