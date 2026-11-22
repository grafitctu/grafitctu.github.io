(()=>{
// Periodic 128 x 128 images, grayscale in [0,255]; radial motion is NOT assumed.
const N=128,M=N*N,arr=()=>new Float64Array(M),wrap=x=>(x+N)%N;
function fft(a,b,inv){
 for(let axis=0;axis<2;axis++)for(let j=0;j<N;j++){
  const idx=k=>axis?k*N+j:j*N+k;
  for(let i=1,r=0;i<N;i++){let m=N>>1;while(r&m){r^=m;m>>=1}r^=m;if(i<r){const u=idx(i),v=idx(r);[a[u],a[v]]=[a[v],a[u]];[b[u],b[v]]=[b[v],b[u]]}}
  for(let l=2;l<=N;l*=2)for(let k=0;k<l/2;k++){let phase=(inv?2:-2)*Math.PI*k/l,c=Math.cos(phase),s=Math.sin(phase);
   for(let i=k;i<N;i+=l){const u=idx(i),v=idx(i+l/2),re=a[v]*c-b[v]*s,im=a[v]*s+b[v]*c;a[v]=a[u]-re;b[v]=b[u]-im;a[u]+=re;b[u]+=im}}
 }if(inv)for(let i=0;i<M;i++){a[i]/=M;b[i]/=M}return [a,b]
}
function transfer(length,angle){const a=arr(),phi=angle*Math.PI/180;
 for(let i=0;i<length*8;i++){const d=((i+.5)/(length*8)-.5)*(length-1),x=d*Math.cos(phi),y=d*Math.sin(phi),ix=Math.floor(x),iy=Math.floor(y);
  for(let v=0;v<2;v++)for(let u=0;u<2;u++)a[wrap(iy+v)*N+wrap(ix+u)]+=(1-Math.abs(x-ix-u))*(1-Math.abs(y-iy-v))/(length*8)}
 return fft(a,arr(),false)
}
const cases=[['7B8 3815',17,20],['3S5 8086',25,155]],st={scene:0,truth:false};
function preset(){[,st.len,st.angle]=cases[st.scene];st.noise=1;st.logK=-3.5}
preset();
let orig,Y,measured;
function capture(){let canvas=document.createElement('canvas');canvas.width=canvas.height=N;let g=canvas.getContext('2d');
 g.fillStyle='#414141';g.fillRect(0,0,N,N);g.fillStyle='#dedede';g.fillRect(4,46,120,36);g.strokeStyle='#181818';g.strokeRect(6,48,116,32);g.fillStyle='#171717';g.font='bold 23px monospace';g.textAlign='center';g.fillText(cases[st.scene][0],64,72);
 const pix=g.getImageData(0,0,N,N).data;orig=Float64Array.from({length:M},(_,i)=>pix[4*i]);const [a,b]=fft(orig.slice(),arr(),false),[h,k]=transfer(cases[st.scene][1],cases[st.scene][2]);
 for(let i=0;i<M;i++){let re=a[i]*h[i]-b[i]*k[i];b[i]=a[i]*k[i]+b[i]*h[i];a[i]=re}fft(a,b,true);let seed=918273;
 measured=a.map(v=>{seed=(Math.imul(1664525,seed)+1013904223)>>>0;return v+st.noise*Math.sqrt(12)*(seed/4294967296-.5)});Y=fft(measured.slice(),arr(),false)
}
function restore(H,K){const a=arr(),b=arr();for(let i=0;i<M;i++){const h=H[0][i],k=H[1][i],p=h*h+k*k;if(p<1e-12&&!K)continue;a[i]=(Y[0][i]*h+Y[1][i]*k)/(p+K);b[i]=(Y[1][i]*h-Y[0][i]*k)/(p+K)}return fft(a,b,true)[0]}
function spectrum([a,b]){const z=arr();let cap=0;for(let i=0;i<M;i++){let v=Math.log1p(Math.hypot(a[i],b[i])/(a===Y[0]?N:0.025));z[((i>>7)+64)%N*N+((i%N+64)%N)]=v;if(i)cap=Math.max(cap,v)}return z.map(v=>255*v/(cap||1))}
function paint(c,a,spec){const h=spec?N:60;c.width=N;c.height=h;let ctx=c.getContext('2d'),im=ctx.createImageData(N,h);for(let i=0;i<N*h;i++){im.data.fill(a[i+(spec?0:34*N)],4*i,4*i+3);im.data[4*i+3]=255}ctx.putImageData(im,0,0)}
const labs=[...document.querySelectorAll('[data-motion]')];
const slider=(key,label,min,max,step=1)=>'<label style="display:block;background:#edf3ef;padding:.45em .65em;border-radius:.3em"><span style="display:flex;justify-content:space-between;gap:.4em">'+label+' <b></b></span><input style="display:block;width:100%;margin:.35em 0 0" data-k="'+key+'" type="range" min="'+min+'" max="'+max+'" step="'+step+'"></label>';
for(const e of labs){const estimate=e.dataset.motion==='estimate';
 e.innerHTML='<div style="display:flex;align-items:center;gap:1em;flex-wrap:wrap"><label>Snímek <select data-k="scene"><option value="0">A</option><option value="1">B</option></select></label><button type="button" data-reset>Obnovit čitelné nastavení</button></div><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,185px),1fr));gap:.5em;margin:.6em 0;font-size:.8em">'+slider('noise','Šum měření σ',0,10)+slider('angle','Odhad směru',0,179)+slider('len','Odhad délky',1,35)+(estimate?'':slider('logK','Potlačení šumu K',-5,0,.25))+'</div><small>Šum mění vstupní snímek. Směr a délka mění pouze odhad rozmazání.'+(estimate?'':' Vyšší K více tlumí šum, ale také jemné tahy.')+'</small><div data-panels style="display:flex;flex-wrap:wrap;gap:.6em"></div><label style="display:block"><input type="checkbox" data-k="truth"> Porovnat s ostrým originálem a skutečnými parametry</label><output style="display:block;font-size:.8em"></output>';
 e.querySelector('[data-reset]').onclick=()=>{preset();capture();draw()};
 const titles=estimate?['Měření','Spektrum měření |Y|','Přenos odhadnuté stopy |H|']:['Měření','Přímá inverze','Wiener','Ostrý originál'];
 for(const t of titles){let p=document.createElement('div');p.style='flex:1 1 125px;text-align:center';p.innerHTML='<small>'+t+'</small><canvas style="width:100%;height:auto;max-height:210px;object-fit:contain;image-rendering:pixelated"></canvas>';p.querySelector('canvas').setAttribute('aria-label',t);e.querySelector('[data-panels]').append(p)}
 e.oninput=ev=>{const k=ev.target.dataset.k;if(!k)return;st[k]=k==='truth'?ev.target.checked:+ev.target.value;if(k==='scene')preset();if(k==='noise'||k==='scene')capture();draw()}
}
function draw(){const H=transfer(st.len,st.angle),K=10**st.logK,inv=restore(H,0),win=restore(H,K);
 for(const e of labs){for(const q of e.querySelectorAll('[data-k]')){const k=q.dataset.k;if(k==='truth')q.checked=st.truth;else q.value=st[k];const val=q.closest('label').querySelector('b');if(val)val.textContent=k==='logK'?K.toLocaleString('cs',{maximumSignificantDigits:2}):st[k]+({angle:'°',len:' px'}[k]||'')}
 const c=e.querySelectorAll('canvas');paint(c[0],measured,false);const out=e.querySelector('output');
 if(e.dataset.motion==='estimate'){paint(c[1],spectrum(Y),true);paint(c[2],spectrum(H),true);out.textContent='Spektra mají střed uprostřed a logaritmickou stupnici. Úhel měříme od směru doprava po směru hodinových ručiček.'+(st.truth?' Skutečná stopa: '+cases[st.scene][1]+' px, '+cases[st.scene][2]+'°.':'')}
 else{paint(c[1],inv,false);paint(c[2],win,false);c[3].parentElement.hidden=!st.truth;if(st.truth)paint(c[3],orig,false);out.textContent='Stejná jasová stupnice pro všechny obrazy. Inverze vynechá numericky nulový přenos; malé nenulové hodnoty zesílí i šum.'+(st.truth?' Reference: '+cases[st.scene][0]+'. RMSE před ořezem jasu: měření '+err(measured)+', Wiener '+err(win)+'.':' Věrohodně vypadající tah není důkazem správného znaku.')}
 if(!estimateMode(e)&&st.truth)out.textContent+=' Skutečná stopa: '+cases[st.scene][1]+' px, '+cases[st.scene][2]+'°.';
 }}
function estimateMode(e){return e.dataset.motion==='estimate'}
function err(a){return Math.sqrt(a.reduce((s,v,i)=>s+(v-orig[i])**2,0)/M).toFixed(1)}
capture();draw();
})();
