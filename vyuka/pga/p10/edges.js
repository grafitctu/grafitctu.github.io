(()=>{
const host=document.querySelector('[data-edges]'),W=64,H=40,cl=(x,n)=>Math.max(0,Math.min(n,x));
const filters=[
 ['Prewitt',[-1,0,1,-1,0,1,-1,0,1],3],
 ['Sobel',[-1,0,1,-2,0,2,-1,0,1],4],
 ['Scharr',[-3,0,3,-10,0,10,-3,0,3],16],
 ['Laplacián',[0,1,0,1,-4,1,0,1,0],1]
];
host.innerHTML='<p>Na svislém přechodu roste jas doprava. Která složka gradientu ho zachytí? A co se stane, když do stejné scény přidáš šum?</p><div class="controls"><label>Scéna <select><option>Skok, kruh a šikmá hrana</option><option>Plynulý přechod</option><option>Jediný světlý bod</option></select></label><label>Šum ± <input type="range" min="0" max="60" value="0"> <b data-noise></b></label><label><input type="checkbox"> Předem vyhladit (1–2–1 v obou osách)</label><label>Práh <input type="range" min="1" max="255" value="40"> <b data-th></b></label></div><small>Kliknutím vyber pixel; kliknutím na výsledek vybereš i filtr. Bíle jsou odezvy, které dosáhly prahu.</small><div data-images style="display:flex;gap:.65em;flex-wrap:wrap"></div><div class="controls"><label>Rozebrat filtr <select data-method></select></label></div><div data-detail></div>';
const [scene,method]=host.querySelectorAll('select'),[noise,blur,threshold]=host.querySelectorAll('input'),images=host.querySelector('[data-images]'),detail=host.querySelector('[data-detail]');
method.innerHTML=filters.map(([n])=>'<option>'+n+'</option>').join('');
method.selectedIndex=1;let px=17,py=15;
const views=['Vstup do filtru',...filters.map(f=>f[0])].map((name,i)=>{
 const box=document.createElement('div');box.style='flex:1 1 125px;max-width:245px';box.innerHTML='<b>'+name+'</b><canvas width="256" height="160" style="display:block;width:100%;cursor:crosshair"></canvas>';images.append(box);
 const c=box.querySelector('canvas');c.setAttribute('aria-label',name);c.onclick=e=>{const b=c.getBoundingClientRect();px=cl(Math.floor((e.clientX-b.left)*W/b.width),W-1);py=cl(Math.floor((e.clientY-b.top)*H/b.height),H-1);if(i)method.selectedIndex=i-1;draw()};return c;
});
const transpose=k=>k.map((_,i)=>k[(i%3)*3+Math.floor(i/3)]),dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0),fmt=n=>Number(n.toFixed(2)).toLocaleString('cs');
function draw(){
 const src=Array.from({length:W*H},(_,i)=>{const x=i%W,y=Math.floor(i/W);let v=scene.selectedIndex===1?32+3*x:scene.selectedIndex===2?(x===32&&y===20?240:24):((x-33)**2+(y-18)**2<80?220:x>42+y/3?192:x>=18?120:40);
 const q=Math.sin((i+1)*78.233)*43758.5453;return cl(Math.round(v+(2*(q-Math.floor(q))-1)*noise.value),255)});
 const windowAt=(a,x,y)=>Array.from({length:9},(_,i)=>a[cl(y+Math.floor(i/3)-1,H-1)*W+cl(x+i%3-1,W-1)]);
 const pixels=blur.checked?src.map((_,i)=>Math.round(dot(windowAt(src,i%W,Math.floor(i/W)),[1,2,1,2,4,2,1,2,1])/16)):src;
 const ortho=filters.map(f=>transpose(f[1])),contexts=views.map(c=>c.getContext('2d'));
 function paint(i,x,y,v){contexts[i].fillStyle='rgb('+v+','+v+','+v+')';contexts[i].fillRect(4*x,4*y,4,4)}
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){const a=windowAt(pixels,x,y);paint(0,x,y,a[4]);filters.forEach(([,k,d],i)=>{
  const gx=dot(a,k)/d,gy=dot(a,ortho[i])/d,strength=i===3?Math.abs(gx):Math.hypot(gx,gy);
  paint(i+1,x,y,strength>=+threshold.value?255:0);
 })}
 contexts.forEach(g=>{g.strokeStyle='#ff7135';g.lineWidth=1.5;g.strokeRect(px*4-4,py*4-4,12,12)});
 const i=method.selectedIndex,[name,k,d]=filters[i],a=windowAt(pixels,px,py),gx=dot(a,k)/d,gy=dot(a,ortho[i])/d,lap=i===3,strength=lap?Math.abs(gx):Math.hypot(gx,gy);
 const matrix=(name,v)=>'<div><b>'+name+'</b><pre style="line-height:1.2;margin:.25em 0">'+[0,3,6].map(j=>v.slice(j,j+3).map(x=>String(x).padStart(4)).join(' ')).join('\n')+'</pre></div>';
 detail.innerHTML='<div style="display:flex;flex-wrap:wrap;gap:1em">'+matrix('Okolí ['+px+', '+py+']',a)+matrix(lap?'Maska Δ':'Maska x',k)+(lap?'':matrix('Maska y',ortho[i]))+'</div><output>'+ (lap?'ΔI = '+fmt(gx)+'; |ΔI| = '+fmt(strength):'Gₓ = '+dot(a,k)+' / '+d+' = '+fmt(gx)+'; Gᵧ = '+dot(a,ortho[i])+' / '+d+' = '+fmt(gy)+'; √(Gₓ² + Gᵧ²) ≈ '+fmt(strength))+' → '+(strength>=+threshold.value?'hrana':'pod prahem')+'</output><small>Masky násobíme v zobrazené orientaci (korelace); osa y míří dolů. Směrové masky jsou škálované tak, aby na svislém skoku dávaly jeho kontrast. Laplacián měří druhou derivaci: prahujeme její absolutní hodnotu, nehledáme gradient ani průchody nulou. Na okraji opakujeme krajní pixel.</small>';
 host.querySelector('[data-noise]').textContent=noise.value;host.querySelector('[data-th]').textContent=threshold.value;
}
host.oninput=draw;draw();
})();
