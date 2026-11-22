(()=>{const box=document.querySelector('[data-photo]'),freq=box.dataset.photo==='fftphoto',N=64;
box.innerHTML='<label>Filtr <select></select></label><label>'+(freq?'Poloměr masky':'Síla efektu [%]')+' <input type="range" min="0" max="'+(freq?46:200)+'" value="'+(freq?8:100)+'"></label><canvas width="720" height="210" aria-label="Porovnání tří obrazů"></canvas><output></output>';
const [sel,range,can,out]=box.querySelectorAll('select,input,canvas,output'),ctx=can.getContext('2d');(freq?['Dolní propust','Horní propust']:['Vyhlazení','Ostření']).forEach(t=>sel.add(new Option(t)));let samples;
// Separable direct DFT; no requests for external libraries or GPU.
const cos=Array.from({length:N*N},(_,k)=>Math.cos(2*Math.PI*k/N)),sin=cos.map((_,k)=>Math.sin(2*Math.PI*k/N));
function transform(R,I,inv){for(let axis=0;axis<2;axis++){const rr=[],ii=[];for(let j=0;j<N;j++)for(let k=0;k<N;k++){let a=0,b=0;for(let n=0;n<N;n++){const i=axis?n*N+j:j*N+n,c=cos[k*n],s=sin[k*n]*(inv?1:-1);a+=R[i]*c-I[i]*s;b+=R[i]*s+I[i]*c}const i=axis?k*N+j:j*N+k;rr[i]=a/(inv?N:1);ii[i]=b/(inv?N:1)}R=rr;I=ii}return [R,I]}
const at=(x,y)=>samples[Math.max(0,Math.min(63,y))*64+Math.max(0,Math.min(63,x))];let fourier;
function draw(){if(!samples)return;let val=+range.value,idx=sel.selectedIndex,mid=[],last=[],report;
if(freq){let R=fourier[0].slice(),I=fourier[1].slice();for(let i=0;i<R.length;i++){const x=i%N,y=i>>6,d=Math.hypot(Math.min(x,N-x),Math.min(y,N-y)),pass=idx?d>val:d<=val;if(!pass)R[i]=I[i]=0;mid[((y+32)%64)*64+(x+32)%64]=255*Math.log1p(Math.hypot(R[i],I[i]))/Math.log1p(Math.abs(fourier[0][0]))}last=transform(R,I,true)[0].map(v=>idx?v+128:v);report='Poloměr '+val+' · '+(idx?'Výstup: nula = střední šedá (128).':'Výstup: stejná stupnice jasu jako vstup.');}
else{for(let i=0;i<samples.length;i++){let x=i%64,y=i>>6,s=0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)s+=at(x+dx,y+dy)*(dx?1:2)*(dy?1:2)/16;let delta=(s-samples[i])*val/100*(idx?-1:1);mid[i]=samples[i]+delta;last[i]=128+delta}report='Síla '+val+' % · Rozdíl: nula = střední šedá. Hodnoty omezujeme až při zobrazení.'}
const names=freq?['Vstup','Filtrované spektrum','Rekonstrukce']:['Vstup','Filtrovaný obraz','Rozdíl'];ctx.fillStyle='white';ctx.fillRect(0,0,720,210);[samples,mid,last].forEach((a,j)=>{const tmp=document.createElement('canvas');tmp.width=tmp.height=N;const c=tmp.getContext('2d'),im=c.createImageData(N,N);a.forEach((z,i)=>{im.data.fill(z,4*i,4*i+3);im.data[4*i+3]=255});c.putImageData(im,0,0);ctx.imageSmoothingEnabled=false;ctx.drawImage(tmp,j*240+35,3,176,176);ctx.font='16px system-ui';ctx.fillStyle='#203039';ctx.fillText(names[j],j*240+35,201)});out.textContent=report;}
function installHarmonics(){
 const mask=document.createElement('div');while(box.firstChild)mask.append(box.firstChild);
 const view=document.createElement('label');view.innerHTML='Pohled <select><option>Frekvenční maska</option><option>Skládání obrazu z harmonických</option></select>';
 const pane=document.createElement('div');pane.hidden=true;
 pane.innerHTML='<div><button type="button" data-back>− 1</button> <label>Počet harmonických <input type="range" min="0" value="0"></label> <button type="button" data-next>+ 1</button> <button type="button" data-all>Všechny</button></div><b>Průběžný součet</b><canvas width="64" height="64" style="width:min(100%,250px);height:auto;max-height:none;image-rendering:pixelated" aria-label="Součet přidaných složek"></canvas><output></output><b>Přidané složky</b><div data-strip style="display:flex;flex-wrap:wrap;gap:.5em"></div><button data-older>Starší složky</button> <button data-newer>Novější složky</button><small>Začínáme průměrným jasem (DC), potom přidáváme harmonické od největší amplitudy. Jedna pruhovaná plocha spojuje sdruženou dvojici frekvencí, pokud jsou odlišné. Na miniaturách je nula šedá a kontrast pruhů je pro čitelnost zesílen samostatně. Do součtu vstupují se skutečnou amplitudou a fází. Tento pohled skládá celý vstup bez frekvenční masky.</small>';
 box.append(view,mask,pane);
 const $=s=>pane.querySelector(s),steps=$('input'),tiles=$('[data-strip]'),total=$('canvas'),terms=[],area=N*N;
 for(let i=1;i<area;i++){const u=i%N,v=Math.floor(i/N),j=((N-v)%N)*N+(N-u)%N;if(i>j)continue;
  const scale=(i===j?1:2)/area,a=fourier[0][i]*scale,b=fourier[1][i]*scale;
  terms.push({u,v,amp:Math.hypot(a,b),values:Array.from({length:N},(_,k)=>a*cos[k]-b*sin[k])})}
 terms.sort((a,b)=>b.amp-a.amp);steps.max=terms.length;
 let n=0,start=0;const dc=fourier[0][0]/area,sum=new Float64Array(area).fill(dc);
 function wave(t,i){return t.values[(t.u*(i%N)+t.v*(i>>6))%N]}
 function paint(c,fn){let g=c.getContext('2d'),im=g.createImageData(N,N);for(let i=0;i<area;i++){im.data.fill(fn(i),4*i,4*i+3);im.data[4*i+3]=255}g.putImageData(im,0,0)}
 function drawTiles(){tiles.replaceChildren();for(let j=start;j<=Math.min(start+5,n);j++){
  const t=terms[j-1],fig=document.createElement('div'),c=document.createElement('canvas');c.width=c.height=N;c.style='width:80px;height:80px;image-rendering:pixelated;margin:0';
  let small=document.createElement('small');const signed=k=>k>N/2?k-N:k;small.textContent=t?'#'+j+' ('+signed(t.u)+', '+signed(t.v)+') · A='+t.amp.toFixed(1):'DC = '+dc.toFixed(1);
  fig.append(c,small);tiles.append(fig);paint(c,i=>t?128+120*wave(t,i)/(t.amp||1):dc)}
  $('[data-older]').disabled=start===0;$('[data-newer]').disabled=start+5>=n}
 function update(k){while(n<k){const t=terms[n++];for(let i=0;i<area;i++)sum[i]+=wave(t,i)}while(n>k){const t=terms[--n];for(let i=0;i<area;i++)sum[i]-=wave(t,i)}
  steps.value=n;start=Math.floor(n/6)*6;paint(total,i=>sum[i]);drawTiles();const rmse=Math.sqrt(sum.reduce((s,v,i)=>s+(v-samples[i])**2,0)/area);
  $('output').textContent='DC + '+n+' / '+terms.length+' harmonických · RMSE vůči vstupu: '+rmse.toFixed(3)+'.';$('[data-next]').disabled=n===terms.length;$('[data-back]').disabled=!n}
 steps.oninput=()=>update(+steps.value);$('[data-next]').onclick=()=>update(n+1);$('[data-back]').onclick=()=>update(n-1);$('[data-all]').onclick=()=>update(terms.length);
 $('[data-older]').onclick=()=>{start-=6;drawTiles()};$('[data-newer]').onclick=()=>{start+=6;drawTiles()};
 view.querySelector('select').onchange=e=>{mask.hidden=!!e.target.selectedIndex;pane.hidden=!mask.hidden};update(0);
}
const img=new Image();img.onload=()=>{let c=document.createElement('canvas');c.width=c.height=N;let g=c.getContext('2d'),side=Math.min(img.width,img.height);g.drawImage(img,(img.width-side)/2,(img.height-side)/2,side,side,0,0,N,N);let a=g.getImageData(0,0,N,N).data;samples=Array.from({length:N*N},(_,i)=>.299*a[4*i]+.587*a[4*i+1]+.114*a[4*i+2]);if(freq){fourier=transform(samples,samples.map(()=>0),false);installHarmonics();window.initFourierBasics?.(N,a,transform)}draw()};img.src=box.dataset.pixels;sel.oninput=range.oninput=draw;})();
