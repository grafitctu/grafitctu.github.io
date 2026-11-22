window.initFourierBasics=(N,rgba,dft)=>{
 window.initSpectralLab?.(N,rgba,dft);
 const M=N*N,seq=f=>Array.from({length:M},(_,i)=>f(i)),zero=()=>seq(()=>0),fft=a=>dft(a,zero(),false),ifft=([r,j])=>dft(r,j,true)[0];
 const rgb=[0,1,2].map(ch=>seq(i=>rgba[4*i+ch])),gray=([r,g,b])=>seq(i=>.299*r[i]+.587*g[i]+.114*b[i]),src=gray(rgb),F=fft(src);
 const spectra=f=>seq(i=>Math.hypot(f[0][i],f[1][i])),A=spectra(F),center=i=>((Math.floor(i/N)+N/2)%N)*N+(i%N+N/2)%N;
 const maxA=Math.max(...A),sig=i=>i%N>N/2?i%N-N:i%N;
 function panel(host,title){const e=document.createElement('div');e.style='flex:1 1 115px;max-width:220px';const c=document.createElement('canvas');c.width=c.height=N;c.style='display:block;width:100%;height:auto;image-rendering:pixelated';c.setAttribute('aria-label',title);const b=document.createElement('small');b.textContent=title;e.append(b,c);host.append(e);return c}
 function paint(c,arr){const g=c.getContext('2d'),im=g.createImageData(N,N);for(let i=0;i<M;i++){for(let j=0;j<3;j++)im.data[i*4+j]=arr[j%arr.length][i];im.data[i*4+3]=255}g.putImageData(im,0,0)}
 function show(title,names,control){const host=document.querySelector('[data-ap="'+title+'"]');host.innerHTML=control+'<div style="display:flex;flex-wrap:wrap;gap:.65em;margin:.4em 0"></div><output style="display:block"></output>';return [host,names.map(n=>panel(host.querySelector('div'),n)),host.querySelector('output')]}
 const amplitude=f=>seq(i=>255*Math.log1p(Math.hypot(f[0][center(i)],f[1][center(i)]))/Math.log1p(maxA));
 const phase=f=>seq(i=>{const j=center(i);return Math.hypot(f[0][j],f[1][j])<maxA*1e-10?128:127.5+127.5*Math.atan2(f[1][j],f[0][j])/Math.PI});
 {
 const [h,c,o]=show('shift',['Obraz po posunu','Amplituda · log(1 + A)','Fáze · −π až +π'], '<label>Kruhový posun doprava [px] <input type="range" min="0" max="32" value="0"> <b></b></label>');
 const q=h.querySelector('input');function draw(){const dx=+q.value,horizontal=seq(i=>src[i-i%N+(i%N-dx+N)%N]),f=fft(horizontal);paint(c[0],[horizontal]);paint(c[1],[amplitude(f)]);paint(c[2],[phase(f)]);h.querySelector('b').textContent=dx;
 const k=1,angle=(r,j)=>Math.atan2(j,r)*180/Math.PI;o.textContent='Sleduj frekvenci (u,v) = (1,0): A = '+Math.hypot(f[0][k],f[1][k]).toFixed(1)+', φ = '+angle(f[0][k],f[1][k]).toFixed(1)+'°. Posun o 16 px ze 64 změní její fázi o −90°. Střed map je nulová frekvence; černá až bílá na mapě fáze značí úhel, nikoli jas obrazu.'}q.oninput=draw;draw()
 }
 {
 const [h,c,o]=show('inverse',['Vstup','Použitá amplituda','Použitá fáze','Inverzní DFT'], '<label>Co předáme inverzní DFT? <select><option>Původní amplitudu i fázi</option><option>Jen amplitudu: všechny fáze 0</option><option>Jen fázi: sjednotit nenulové amplitudy</option><option>Všechny amplitudy 0</option></select></label>');
 const q=h.querySelector('select'),mean=src.reduce((a,b)=>a+b)/M;
 function draw(){const mode=q.selectedIndex,f=[F[0].slice(),F[1].slice()];for(let i=0;i<M;i++){
 if(mode===1){f[0][i]=A[i];f[1][i]=0}
 if(mode===2){const gain=i&&A[i]>maxA*1e-10?1/A[i]:0;f[0][i]*=gain;f[1][i]*=gain}
 if(mode===3)f[0][i]=f[1][i]=0}
 const a=ifft(f),peak=Math.max(...a.map(Math.abs)),display=mode===2?a.map(v=>128+127*v/(peak||1)):a;
 paint(c[0],[src]);paint(c[1],[amplitude(f)]);paint(c[2],[phase(f)]);paint(c[3],[display]);o.textContent=[
 'Obě složky zachované: každý pixel se vrátí na původní jas (až na numerické zaokrouhlení).',
 'Velikosti frekvencí zůstaly, ale všechny kosiny mají vrchol v počátku (levý horní roh). Rozložení objektů zmizelo. Zobrazení ořezává jas na 0–255.',
 'Nenulové frekvence mají velikost 1, DC jsme vynechali. Polohy mnoha hran jsou stále rozpoznatelné, ale původní jas ani kontrast neznáme. Pouze pro zobrazení: nula je šedá a kontrast je zesílen.',
 'Nula krát libovolná harmonická je nula. Výsledek je černý a fáze nulových koeficientů není definována (zde šedá). To není totéž jako nahradit neznámé amplitudy jedničkami.'
 ][mode]}q.onchange=draw;draw()
 }
 {
 const [h,c,o]=show('color',['Barevný vstup','Prostorové spektrum kanálu','Obraz po inverzi'], '<label>Vstup <select><option>Stejně světlé barevné pruhy</option><option>Fotografie</option></select></label> <label>Ukázat spektrum <select><option>R</option><option>G</option><option>B</option></select></label> <label>Co zachováme? <select><option>Všechny RGB kanály</option><option>Jen jas před DFT</option><option>RGB bez DC</option></select></label>');
 const [scene,ch,mode]=h.querySelectorAll('select');function draw(){const a=scene.selectedIndex?rgb:[0,1,2].map(k=>seq(i=>((i%N>>3)%2?[60,140,140]:[174,82,140])[k])),grayOnly=mode.selectedIndex===1,fs=(grayOnly?[gray(a)]:a).map(fft);if(mode.selectedIndex===2)for(const f of fs){f[0][0]=f[1][0]=0}
 ch.disabled=grayOnly;const f=fs[grayOnly?0:ch.selectedIndex];paint(c[0],a);paint(c[1],[amplitude(f)]);const rebuilt=fs.map(ifft);paint(c[2],mode.selectedIndex===2?rebuilt.map(row=>row.map(v=>v+128)):rebuilt);o.textContent=grayOnly?'Před DFT jsme nahradili trojici jediným číslem Y′ = 0,299R + 0,587G + 0,114B. Inverze vrátí tento šedý obraz, ne barvy. Pruhy mají téměř stejné Y′, proto v jasu téměř zmizí.':mode.selectedIndex===2?'Odebrání DC odstraní průměr každého kanálu, nikoli všechny barevné rozdíly. Pro zobrazení přičítáme ke každému kanálu 128.':'Každý kanál má vlastní amplitudu i fázi. Přepínáním R/G/B měníš jen náhled spektra, nikoli rekonstrukci. U pruhů je B konstantní: jeho spektrum má pouze středový bod.'}
 h.onchange=draw;draw()
 }
};
