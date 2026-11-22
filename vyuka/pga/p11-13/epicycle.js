(() => {
 'use strict';
 const root=document.querySelector('[data-epicycle]'); if(!root)return;
 const style=document.createElement('link');style.rel='stylesheet';style.href='../epicycle.css';document.head.append(style);
 // Original single-stroke cat illustration; no external images or video required.
 const outline='M 85 120 L 65 35 Q 110 40 145 78 Q 195 60 245 78 Q 280 40 325 35 L 305 120 Q 345 165 310 220 Q 280 270 195 275 Q 110 270 80 220 Q 45 165 85 120 L 120 145 Q 140 125 155 145 Q 140 165 120 145 L 175 185 L 215 185 L 195 205 L 175 185 L 195 205 Q 180 230 160 212 Q 180 230 195 205 Q 210 230 230 212 Q 210 230 195 205 L 215 185 L 235 145 Q 250 125 270 145 Q 250 165 235 145 L 295 180 L 350 165 L 295 180 L 350 195 L 295 180 L 270 220 Q 240 250 195 255 Q 140 250 115 220 L 95 180 L 40 195 L 95 180 L 40 165 L 95 180 L 85 120 Z';
 root.innerHTML=`<div class="epi-controls">
 <label>Počet rotujících členů <b data-count></b><input aria-label="Počet rotujících členů" data-count-slider type="range" min="1" max="511" value="70"></label>
 <label>Průběh kreslení <b data-time></b><input aria-label="Průběh kreslení" data-time-slider type="range" min="0" max="1000" value="650"></label>
 <button data-play>Přehrát</button><button data-reset>Od začátku</button>
 <label><input type="checkbox" data-circles checked> Kružnice a vektory</label></div>
 <div class="epi-controls epi-first"><label>Poloměr prvního kruhu <b data-radius-value></b><input data-radius type="range" min="0" max="200" step="1" value="100"></label><label>Posun počáteční fáze <b data-phase-value></b><input data-phase type="range" min="-180" max="180" value="0"></label><label>Frekvence prvního kruhu k <b data-frequency-value></b><input data-frequency type="range" min="-8" max="8" step="1" value="1"></label><button data-restore>Vrátit původní kruh</button></div>
 <canvas width="1120" height="440" aria-label="Předloha kočky vlevo, Fourierova kresba s rotujícími vektory vpravo"></canvas>
 <output aria-live="polite"></output>`;
 const svg=document.createElementNS('http://www.w3.org/2000/svg','svg'), path=document.createElementNS(svg.namespaceURI,'path');path.setAttribute('d',outline);svg.append(path);svg.style.cssText='position:absolute;width:0;height:0;overflow:hidden';root.append(svg);
 const N=512,length=path.getTotalLength(),samples=Array.from({length:N},(_,j)=>{const p=path.getPointAtLength(j*length/N);return [p.x-195,p.y-155]});
 const terms=Array.from({length:N},(_,k)=>{let re=0,im=0; samples.forEach(([x,y],j)=>{const a=2*Math.PI*k*j/N;re+=x*Math.cos(a)+y*Math.sin(a);im+=y*Math.cos(a)-x*Math.sin(a)});return {k:k>N/2?k-N:k,re:re/N,im:im/N,amp:Math.hypot(re,im)/N}});
 const dc=terms.shift(); terms.sort((a,b)=>b.amp-a.amp);
 const original={...terms[0]},radius=root.querySelector('[data-radius]'),phase=root.querySelector('[data-phase]'),frequency=root.querySelector('[data-frequency]');frequency.value=original.k;
 const canvas=root.querySelector('canvas'),ctx=canvas.getContext('2d'),count=root.querySelector('[data-count-slider]'),time=root.querySelector('[data-time-slider]'),circles=root.querySelector('[data-circles]'),play=root.querySelector('[data-play]');
 let trajectory=[],playing=false,last=0,progress=650;
 function point(t){let x=dc.re,y=dc.im;for(const c of terms.slice(0,+count.value)){const a=2*Math.PI*c.k*t; x+=c.re*Math.cos(a)-c.im*Math.sin(a);y+=c.re*Math.sin(a)+c.im*Math.cos(a)}return [x,y]}
 function rebuild(){trajectory=Array.from({length:1001},(_,j)=>point(j/1000));draw()}
 function changeFirst(){const a=Math.atan2(original.im,original.re)+Number(phase.value)*Math.PI/180,r=original.amp*Number(radius.value)/100;Object.assign(terms[0],{k:Number(frequency.value),amp:r,re:r*Math.cos(a),im:r*Math.sin(a)});rebuild()}
 radius.oninput=phase.oninput=frequency.oninput=changeFirst;
 root.querySelector('[data-restore]').onclick=()=>{radius.value=100;phase.value=0;frequency.value=original.k;Object.assign(terms[0],original);rebuild()};
 function line(points,color,width){ctx.beginPath();points.forEach(([x,y],j)=>j?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke()}
 function draw(){
  const t=+time.value/1000;ctx.clearRect(0,0,1120,440);ctx.fillStyle='#203039';ctx.font='bold 22px system-ui';ctx.fillText('Předloha · kočka jedním tahem',28,32);ctx.fillText('Kresba součtem rotujících vektorů',560,32);
  ctx.save();ctx.translate(250,240);ctx.scale(1.1,1.1);ctx.translate(-195,-155);ctx.strokeStyle='#203039';ctx.lineWidth=2;ctx.stroke(new Path2D(outline));ctx.restore();
  const extent=Math.max(160,...trajectory.map(([x,y])=>Math.max(Math.abs(x),Math.abs(y))),Math.abs(dc.re)+terms[0].amp,Math.abs(dc.im)+terms[0].amp),zoom=Math.min(1.1,175/extent);
  ctx.save();ctx.translate(810,240);ctx.scale(zoom,zoom);
  line(trajectory,'#e5ece9',1.2);line(trajectory.slice(0,Math.floor(t*1000)+1),'#007f75',2.5);
  let x=dc.re,y=dc.im;
  for(const c of terms.slice(0,+count.value)){const a=2*Math.PI*c.k*t,nx=x+c.re*Math.cos(a)-c.im*Math.sin(a),ny=y+c.re*Math.sin(a)+c.im*Math.cos(a);
   if(circles.checked){const first=c===terms[0];ctx.beginPath();ctx.arc(x,y,c.amp,0,Math.PI*2);ctx.strokeStyle=first?'#be570f':'#8a9fa580';ctx.lineWidth=first?2:.7;ctx.stroke();line([[x,y],[nx,ny]],first?'#be570f':'#375e7980',first?2:1)}x=nx;y=ny;
  }
  ctx.beginPath();ctx.arc(x,y,4,0,Math.PI*2);ctx.fillStyle='#bf570f';ctx.fill();ctx.restore();
  root.querySelector('[data-count]').textContent=count.value;root.querySelector('[data-time]').textContent=(t*100).toFixed(1)+' %';
  root.querySelector('[data-radius-value]').textContent=radius.value+' % · r = '+terms[0].amp.toFixed(1);root.querySelector('[data-phase-value]').textContent=phase.value+'°';root.querySelector('[data-frequency-value]').textContent=frequency.value;
  root.querySelector('output').textContent=`${count.value} členů + původní posun c₀. Oranžový kruh je první (původně nejsilnější) rotující člen, nikoli DC. Záporné k obrací směr, k = 0 zastaví rotaci. Měníme jen tento člen; ostatní zůstávají. Pravý náhled se při velké deformaci zmenší, aby se vešel.`;
 }
 function pause(){playing=false;play.textContent='Přehrát'}
 count.oninput=rebuild;time.oninput=()=>{pause();progress=+time.value;draw()};circles.onchange=draw;
 root.querySelector('[data-reset]').onclick=()=>{pause();time.value=0;progress=0;draw()};
 play.onclick=()=>{playing=!playing;play.textContent=playing?'Pozastavit':'Přehrát';if(playing){if(+time.value>=1000){time.value=0;progress=0}last=performance.now();requestAnimationFrame(tick)}};
 function tick(now){if(!playing)return;if(root.closest('section').hidden||document.hidden){pause();return}progress=Math.min(1000,progress+(now-last)/18);last=now;time.value=Math.round(progress);draw();if(progress<1000)requestAnimationFrame(tick);else pause()}
 rebuild();
})();
