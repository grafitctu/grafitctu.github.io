window.initFourierPaint=(N,lena,dft)=>{
 const root=document.querySelector('[data-fourier-paint]');if(!root)return;
 const style=document.createElement('link');style.rel='stylesheet';style.href='../fourier-paint.css';document.head.append(style);
 const L=N*N,clean=lena.map(v=>45+.65*v),mask=new Float64Array(L).fill(1),history=[];
 root.innerHTML=`<div class="fp-controls"><label>Poškození <select data-noise><option>Šikmé pruhy</option><option>Dvě soustavy pruhů</option></select></label><label>Nástroj <select data-tool><option>Potlačit frekvence</option><option>Obnovit frekvence</option></select></label><label>Poloměr štětce [buňky] <input data-radius type="range" min="0" max="6" value="0"><b data-size>0</b></label><button data-undo disabled>Zpět</button><button data-reset>Reset masky</button><label><input type="checkbox" data-hint> Ukázat špičky rušení</label><label><input type="checkbox" data-reference> Odkrýt nepoškozenou předlohu</label></div>
 <div class="fp-panels"><figure><figcaption data-left-label>Vstup · poškozená Lena</figcaption><canvas data-input width="64" height="64"></canvas></figure><figure><figcaption>DFT · kresli masku do spektra</figcaption><canvas data-spectrum width="320" height="320" tabindex="0" aria-label="Editor frekvenční masky: kreslení myší nebo dotykem; pro klávesnici použijte souřadnice níže"></canvas></figure><figure><figcaption>Rekonstrukce · inverzní DFT</figcaption><canvas data-output width="64" height="64"></canvas></figure></div>
 <div class="fp-coordinate"><label>Frekvence u <input data-u type="number" min="-32" max="31" value="10"></label><label>v <input data-v type="number" min="-32" max="31" value="6"></label><button data-apply>Použít štětec na (u,v)</button><span data-cursor></span></div>
 <p class="fp-note">Červená = potlačené frekvence. Zásah se automaticky provede i v protilehlém bodě. Zachováváme fázi a násobíme reálnou i imaginární část stejnou maskou: F̃ = M·F. Střed je průměrný jas; jeho smazání obraz ztmaví. Reset obnoví všechny koeficienty.</p><output></output>`;
 const $=s=>root.querySelector(s),canvas=$('[data-spectrum]'),ctx=canvas.getContext('2d');let input,F,peak,noiseTerms,down=false,last=null,queued=false;
 const center=i=>((Math.floor(i/N)+N/2)%N)*N+(i%N+N/2)%N;
 function paint(c,a){const g=c.getContext('2d'),im=g.createImageData(N,N);for(let i=0;i<L;i++){im.data[4*i]=im.data[4*i+1]=im.data[4*i+2]=a[i];im.data[4*i+3]=255}g.putImageData(im,0,0)}
 function spectrum(){const temp=document.createElement('canvas');temp.width=temp.height=N;const g=temp.getContext('2d'),im=g.createImageData(N,N);for(let i=0;i<L;i++){const j=center(i),v=255*Math.log1p(Math.hypot(F[0][j],F[1][j]))/peak;im.data[4*i]=mask[j]?v:180;im.data[4*i+1]=mask[j]?v:Math.round(v*.2);im.data[4*i+2]=mask[j]?v:Math.round(v*.2);im.data[4*i+3]=255}g.putImageData(im,0,0);ctx.imageSmoothingEnabled=false;ctx.drawImage(temp,0,0,320,320);
 if($('[data-hint]').checked){ctx.strokeStyle='#ffe254';ctx.lineWidth=2;for(const [u,v] of noiseTerms)for(const sign of [-1,1]){ctx.beginPath();ctx.arc(((N/2+sign*u+N)%N+.5)*5,((N/2+sign*v+N)%N+.5)*5,7,0,Math.PI*2);ctx.stroke()}}
 }
 function render(){queued=false;const filtered=[F[0].map((v,i)=>v*mask[i]),F[1].map((v,i)=>v*mask[i])],out=dft(...filtered,true);paint($('[data-output]'),out[0]);const reference=$('[data-reference]').checked;paint($('[data-input]'),reference?clean:input);$('[data-left-label]').textContent=reference?'Reference · Lena bez přidaných pruhů':'Vstup · poškozená Lena';spectrum();
 const rmse=a=>Math.sqrt(a.reduce((s,v,i)=>s+(v-clean[i])**2,0)/L),e=rmse(out[0]);root.dataset.rmse=e;root.dataset.imag=Math.max(...out[1].map(Math.abs));root.dataset.masked=mask.reduce((s,v)=>s+(v===0),0);
 $('output').textContent=`Potlačeno ${root.dataset.masked} / ${L} koeficientů. RMSE vůči referenci: vstup ${rmse(input).toFixed(2)}, rekonstrukce ${e.toFixed(2)}. Pevná stupnice jasu 0–255; jen zobrazení ořezává hodnoty mimo rozsah.`;
 $('[data-undo]').disabled=!history.length;
 }
 function schedule(){if(!queued){queued=true;requestAnimationFrame(render)}}
 function save(){history.push(mask.slice());if(history.length>25)history.shift()}
 function stamp(x,y){const r=+$('[data-radius]').value,value=$('[data-tool]').selectedIndex?1:0;for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){if(dx*dx+dy*dy>r*r)continue;const u=((x+dx+N/2)%N+N)%N,v=((y+dy+N/2)%N+N)%N;mask[v*N+u]=value;mask[((N-v)%N)*N+(N-u)%N]=value}schedule()}
 function location(e){const b=canvas.getBoundingClientRect();return[Math.max(0,Math.min(N-1,Math.floor((e.clientX-b.left)*N/b.width))),Math.max(0,Math.min(N-1,Math.floor((e.clientY-b.top)*N/b.height)))]}
 canvas.onpointerdown=e=>{e.preventDefault();save();down=true;canvas.setPointerCapture(e.pointerId);last=location(e);stamp(...last)};
 canvas.onpointermove=e=>{const pt=location(e);$('[data-cursor]').textContent=`Pod kurzorem: (${pt[0]-N/2}, ${pt[1]-N/2})`;if(!down)return;const count=Math.max(Math.abs(pt[0]-last[0]),Math.abs(pt[1]-last[1]),1);for(let k=1;k<=count;k++)stamp(Math.round(last[0]+(pt[0]-last[0])*k/count),Math.round(last[1]+(pt[1]-last[1])*k/count));last=pt};
 canvas.onpointerup=canvas.onpointercancel=()=>{down=false;last=null};
 $('[data-apply]').onclick=()=>{const u=+$('[data-u]').value,v=+$('[data-v]').value;if(!Number.isInteger(u)||!Number.isInteger(v)||u< -32||u>31||v< -32||v>31)return;save();stamp(u+N/2,v+N/2)};
 $('[data-radius]').oninput=e=>$('[data-size]').textContent=e.target.value;
 $('[data-undo]').onclick=()=>{if(history.length){mask.set(history.pop());render()}};
 $('[data-reset]').onclick=()=>{save();mask.fill(1);render()};$('[data-reference]').onchange=render;$('[data-hint]').onchange=spectrum;
 function setup(){noiseTerms=$('[data-noise]').selectedIndex?[[10,6,25],[0,13,16]]:[[10,6,32]];input=clean.map((v,i)=>v+noiseTerms.reduce((s,[u,w,a])=>s+a*Math.cos(2*Math.PI*(u*(i%N)+w*Math.floor(i/N))/N+.4),0));F=dft(input,new Array(L).fill(0),false);peak=Math.log1p(Math.max(...F[0].map((v,i)=>Math.hypot(v,F[1][i]))));mask.fill(1);history.length=0;render();root.dataset.ready='true'}
 $('[data-noise]').onchange=setup;setup();
};
