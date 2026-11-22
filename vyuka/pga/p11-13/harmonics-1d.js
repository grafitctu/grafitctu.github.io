(()=>{
 const host=document.querySelector('[data-harmonics-1d]');if(!host)return;
 host.innerHTML=`<div style="display:flex;gap:18px;flex-wrap:wrap;font-size:17px;align-items:center"><label>Signál <select data-shape><option>Pila</option><option>Obdélník</option><option>Trojúhelník</option></select></label><label>Počet nenulových harmonických <input data-count type="range" min="1" max="40" value="3"> <b data-number>3</b></label><button data-minus>− 1</button><button data-plus>+ 1</button></div><canvas width="1100" height="450" style="width:100%;height:auto;max-height:none" aria-label="Nahoře výsledný součet a cílový signál, dole jednotlivé harmonické"></canvas><div data-equation class="eq"></div><p data-explain style="font-size:17px"></p>`;
 const $=s=>host.querySelector(s),c=$('canvas'),g=c.getContext('2d'),count=$('[data-count]'),shape=$('[data-shape]');
 function term(j){const mode=shape.selectedIndex,k=mode?2*j+1:j+1,a=mode===0?2*(k%2?1:-1)/(Math.PI*k):mode===1?4/(Math.PI*k):8*(j%2?-1:1)/(Math.PI*Math.PI*k*k);return{k,a}}
 function target(t){const mode=shape.selectedIndex;return mode===0?t/Math.PI:mode===1?(Math.abs(t)<1e-12?0:Math.sign(Math.sin(t))):2/Math.PI*Math.asin(Math.sin(t))}
 function curve(fn,cy,scale,color,width){g.beginPath();for(let i=0;i<=1000;i++){const t=-Math.PI+2*Math.PI*i/1000,x=60+i*.99,y=cy-scale*fn(t);i?g.lineTo(x,y):g.moveTo(x,y)}g.strokeStyle=color;g.lineWidth=width;g.stroke()}
 function axes(y){g.strokeStyle='#c6d3d0';g.lineWidth=1;g.beginPath();g.moveTo(60,y);g.lineTo(1050,y);g.moveTo(555,y-100);g.lineTo(555,y+100);g.stroke();g.fillStyle='#456';g.font='15px system-ui';g.fillText('−T/2',46,y+118);g.fillText('0',551,y+118);g.fillText('T/2',1030,y+118)}
 function draw(){const n=+count.value,terms=Array.from({length:n},(_,j)=>term(j)),colors=['#ba4e13','#386bb0','#a13e9f','#657e19','#91582d','#268e98'];g.clearRect(0,0,1100,450);g.fillStyle='#203039';g.font='bold 20px system-ui';g.fillText('Součet harmonických (zelená) a požadovaný signál (šedá)',25,25);axes(135);
  // Draw discontinuous targets as separate segments: no artificial connecting ramp.
  if(shape.selectedIndex===1){for(const [l,r,y] of [[60,555,220],[555,1050,50]]){g.beginPath();g.moveTo(l,y);g.lineTo(r,y);g.strokeStyle='#9ca6a4';g.lineWidth=3;g.stroke()}}else curve(target,135,85,'#9ca6a4',3);
  curve(t=>terms.reduce((s,{k,a})=>s+a*Math.sin(k*t),0),135,85,'#007f75',2.5);
  g.fillStyle='#203039';g.font='bold 18px system-ui';g.fillText('Jednotlivé sčítané harmonické · společné měřítko příspěvků',25,285);g.strokeStyle='#c6d3d0';g.beginPath();g.moveTo(60,365);g.lineTo(1050,365);g.stroke();
  terms.forEach(({k,a},j)=>curve(t=>a*Math.sin(k*t),365,55,colors[j%colors.length],j===n-1?2.5:1));
  $('[data-number]').textContent=n;$('[data-minus]').disabled=n===1;$('[data-plus]').disabled=n===40;
  $('[data-equation]').innerHTML=[`S<sub>M</sub>(t) = (2/π) ∑<sub>k=1…M</sub> (−1)<sup>k+1</sup> sin(2πkt/T)/k`,`S<sub>M</sub>(t) = (4/π) ∑<sub>j=0…M−1</sub> sin(2π(2j+1)t/T)/(2j+1)`,`S<sub>M</sub>(t) = (8/π²) ∑<sub>j=0…M−1</sub> (−1)<sup>j</sup> sin(2π(2j+1)t/T)/(2j+1)²`][shape.selectedIndex];
  const last=terms[n-1];$('[data-explain]').textContent=`T je perioda, t čas, M počet nenulových členů. Poslední přidaný člen: k = ${last.k}, koeficient ${last.a.toFixed(4)}. `+(shape.selectedIndex===2?'Trojúhelník je spojitý: koeficienty klesají jako 1/k² a součet se rychle vyhlazuje.':'U skoku se součet blíží průměru levé a pravé limity. Překmit nezmizí přidáváním členů, jen se zúží jeho okolí (Gibbsův jev).');host.dataset.count=n;
 }
 count.oninput=shape.onchange=draw;$('[data-minus]').onclick=()=>{count.value=Math.max(1,+count.value-1);draw()};$('[data-plus]').onclick=()=>{count.value=Math.min(40,+count.value+1);draw()};draw();
})();
