(() => {
 const root=document.querySelector('[data-lena]');if(!root)return;
 const style=document.createElement('link');style.rel='stylesheet';style.href='../lena-synthesis.css';document.head.append(style);
 root.innerHTML=`<div class="lena-controls"><button data-step="-1">− 1</button><button data-step="1">+ 1 báze</button><button data-step="10">+ 10</button><button data-step="100">+ 100</button><button data-all>Všechny</button><button data-reset>Jen průměr</button><button data-play>Přehrát</button><label>Počet přidaných složek <input data-n type="range" min="0" value="0" max="2049"><b data-number>0</b></label></div>
 <div class="lena-panels"><figure><figcaption>Dosavadní součet Sₘ₋₁</figcaption><canvas data-before width="64" height="64"></canvas></figure><strong>+</strong><figure><figcaption>Přidaná složka bₘ</figcaption><canvas data-wave width="64" height="64"></canvas></figure><strong>=</strong><figure><figcaption>Nový součet Sₘ</figcaption><canvas data-sum width="64" height="64"></canvas></figure><figure><figcaption>Předloha · Lena 64 × 64</figcaption><canvas data-original width="64" height="64"></canvas></figure></div>
 <div class="lena-bottom"><canvas data-surface width="540" height="245" aria-label="Prostorový pohled na přidávanou sinusovou plochu"></canvas><div><b data-term></b><p data-equation></p><label><input data-boost type="checkbox" checked> Zesílit náhled samostatné báze</label><p class="lena-note">Výška „plechu“ je příspěvek k jasu, ne hloubka scény. U pruhů šedá znamená nulu. Náhled lze zesílit; do součtu vždy přičítáme skutečné hodnoty. Součty mají pevnou stupnici 0–255.</p><output data-error></output></div></div>`;
 const $=s=>root.querySelector(s),N=64,L=N*N,TAU=2*Math.PI,cos=Array.from({length:L},(_,i)=>Math.cos(TAU*i/N)),sin=cos.map((_,i)=>Math.sin(TAU*i/N));
 let terms=[],samples,sum,n=0,dc=0,playing=false,timer;
 function dft(input){let R=input,I=new Float64Array(L);for(let axis=0;axis<2;axis++){const rr=new Float64Array(L),ii=new Float64Array(L);for(let j=0;j<N;j++)for(let k=0;k<N;k++){let a=0,b=0;for(let q=0;q<N;q++){const at=axis?q*N+j:j*N+q,c=cos[k*q],s=sin[k*q];a+=R[at]*c+I[at]*s;b+=I[at]*c-R[at]*s}const at=axis?k*N+j:j*N+k;rr[at]=a;ii[at]=b}R=rr;I=ii}return [R,I]}
 function val(t,i){return t?t.lut[(t.u*(i%N)+t.v*Math.floor(i/N))%N]:0}
 function paint(c,fn){const g=c.getContext('2d'),im=g.createImageData(N,N);for(let i=0;i<L;i++){const v=fn(i);im.data[4*i]=im.data[4*i+1]=im.data[4*i+2]=v;im.data[4*i+3]=255}g.putImageData(im,0,0)}
 function surface(t,boost){const c=$('[data-surface]'),g=c.getContext('2d');g.clearRect(0,0,c.width,c.height);g.fillStyle='#203039';g.font='16px system-ui';g.fillText('Přidávaná báze jako vlnitý plech',12,21);
  const amp=t?.amp||1,gain=boost?65/amp:.7;const z=(x,y)=>t?t.amp*Math.cos(TAU*(t.su*x+t.sv*y)/N+t.phase):0;
  const project=(x,y)=>[265+(x-y)*3.2,65+(x+y)*1.03-z(x,y)*gain];
  // Sample all 64 pixels so even high-frequency components remain represented.
  for(let y=0;y<N;y+=2){g.beginPath();for(let x=0;x<N;x++){const [a,b]=project(x,y);x?g.lineTo(a,b):g.moveTo(a,b)}g.strokeStyle='#087e79';g.lineWidth=.75;g.stroke()}
  for(let x=0;x<N;x+=2){g.beginPath();for(let y=0;y<N;y++){const [a,b]=project(x,y);y?g.lineTo(a,b):g.moveTo(a,b)}g.strokeStyle='#087e7950';g.stroke()}
 }
 function render(){if(!samples)return;const t=terms[n-1],boost=$('[data-boost]').checked;
  paint($('[data-before]'),i=>sum[i]-val(t,i));paint($('[data-wave]'),i=>128+val(t,i)*(boost&&t?120/(t.amp||1):1));paint($('[data-sum]'),i=>sum[i]);surface(t,boost);
  $('[data-number]').textContent=n+' / '+terms.length;$('[data-n]').value=n;
  $('[data-term]').textContent=t?`Složka ${n}: frekvence (${t.su}, ${t.sv}), amplituda ${t.amp.toFixed(3)}, fáze ${(t.phase*180/Math.PI).toFixed(1)}°`:`DC: průměrný jas ${dc.toFixed(3)}`;
  $('[data-equation]').textContent=t?`bₘ(x,y) = ${t.amp.toFixed(3)} cos(2π(${t.su}x/64 + ${t.sv}y/64) + ${t.phase.toFixed(3)}). Sₘ = Sₘ₋₁ + bₘ.`:'Zatím nepřidáváme žádné pruhy. Začínáme konstantní plochou: S₀(x,y) = průměrný jas.';
  const rmse=Math.sqrt(sum.reduce((a,v,i)=>a+(v-samples[i])**2,0)/L);$('[data-error]').textContent=`RMSE bez ořezu: ${rmse.toFixed(6)}. Řazení: rostoucí vzdálenost od nulové frekvence.`;root.dataset.rmse=rmse;
  root.querySelector('[data-step="-1"]').disabled=!n;root.querySelector('[data-step="1"]').disabled=n===terms.length;
 }
 function update(target){target=Math.max(0,Math.min(terms.length,target));while(n<target){const t=terms[n++];for(let i=0;i<L;i++)sum[i]+=val(t,i)}while(n>target){const t=terms[--n];for(let i=0;i<L;i++)sum[i]-=val(t,i)}render()}
 function pause(){playing=false;clearTimeout(timer);$('[data-play]').textContent='Přehrát'}
 root.querySelectorAll('[data-step]').forEach(b=>b.onclick=()=>{pause();update(n+Number(b.dataset.step))});
 $('[data-n]').oninput=e=>{pause();update(+e.target.value)};$('[data-all]').onclick=()=>{pause();update(terms.length)};$('[data-reset]').onclick=()=>{pause();update(0)};$('[data-boost]').onchange=render;
 $('[data-play]').onclick=()=>{if(playing){pause();return}if(n===terms.length)update(0);playing=true;$('[data-play]').textContent='Pozastavit';function tick(){if(!playing)return;if(root.closest('section').hidden||document.hidden){pause();return}update(n+1);if(n<terms.length)timer=setTimeout(tick,180);else pause()}tick()};
 root.querySelectorAll('button,input').forEach(e=>e.disabled=true);
 const img=new Image();img.onload=()=>{const c=document.createElement('canvas');c.width=c.height=N;const g=c.getContext('2d');g.drawImage(img,0,0,N,N);const pixels=g.getImageData(0,0,N,N).data;samples=Float64Array.from({length:L},(_,i)=>.299*pixels[i*4]+.587*pixels[i*4+1]+.114*pixels[i*4+2]);const [R,I]=dft(samples);dc=R[0]/L;sum=new Float64Array(L).fill(dc);
  for(let i=1;i<L;i++){const u=i%N,v=Math.floor(i/N),j=((N-v)%N)*N+(N-u)%N;if(i>j)continue;const a=R[i]*(i===j?1:2)/L,b=I[i]*(i===j?1:2)/L,su=u>N/2?u-N:u,sv=v>N/2?v-N:v;terms.push({u,v,su,sv,r:su*su+sv*sv,amp:Math.hypot(a,b),phase:Math.atan2(b,a),lut:cos.slice(0,N).map((c,k)=>a*c-b*sin[k])})}
  terms.sort((a,b)=>a.r-b.r||b.amp-a.amp);$('[data-n]').max=terms.length;paint($('[data-original]'),i=>samples[i]);root.querySelectorAll('button,input').forEach(e=>e.disabled=false);render();root.dataset.ready='true';
 };img.onerror=()=>{$('[data-error]').textContent='Obrázek se nepodařilo načíst.'};img.src=root.dataset.lena;
})();
