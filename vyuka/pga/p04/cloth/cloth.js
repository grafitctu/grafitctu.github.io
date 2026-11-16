'use strict';
(()=>{
const rad=Math.PI/180, tau=2*Math.PI, tables=clothData.map(s=>Float32Array.from(atob(s),c=>Math.expm1(c.charCodeAt(0)/20)/1000));
const canv=[...document.querySelectorAll('canvas')], controls=[...document.querySelectorAll('input[type=range]')], rgb=[0,0,0];
const used=tables.map(t=>new Uint8Array(t.length/3));
const polar=t=>Math.min(15,Math.max(0,t/(89.5*rad)*15)), az=p=>((p/tau%1+1)%1)*36;
// Four-dimensional linear interpolation, periodic at both azimuth seams.
function sample(m,ti,pi,to,po,track=false){
 const T=tables[m],x=polar(ti),y=polar(to),u=m?0:az(pi),v=az(m?po-pi:po);
 const i=x|0,j=y|0,k=u|0,l=v|0;rgb.fill(0);
 for(let a=0;a<2;a++)for(let b=0;b<(m?1:2);b++)for(let c=0;c<2;c++)for(let d=0;d<2;d++){
  let w=(a?x-i:1-x+i)*(b?u-k:1-u+k)*(c?y-j:1-y+j)*(d?v-l:1-v+l);
  let q=3*((((Math.min(15,i+a)*(m?1:36)+(k+b)%36)*16+Math.min(15,j+c))*36)+(l+d)%36);
  if(track&&w>0)used[m][q/3]=1;
  for(let h=0;h<3;h++)rgb[h]+=w*T[q+h];
 }return rgb;
}
function display(v){let x=4*v/(1+4*v);return Math.round(255*(x<=.0031308?12.92*x:1.055*x**(1/2.4)-.055));}
function sphere(m,L,rot){
 const ctx=canv[m].getContext('2d'),S=canv[m].width,img=ctx.createImageData(S,S);
 for(let v=0;v<S;v++)for(let u=0;u<S;u++){
  let x=(u+.5-S/2)/(S*.47),y=(S/2-v-.5)/(S*.47),z2=1-x*x-y*y;if(z2<=0)continue;
  let z=Math.sqrt(z2),nL=x*L[0]+y*L[1]+z*L[2],idx=(u+v*S)*4;img.data[idx+3]=255;
  if(nL<=0)continue;
  let s=Math.hypot(z,x),tx=z/s,tz=-x/s,bx=y*tz,by=s,bz=-y*tx;
  let pi=Math.atan2(bx*L[0]+by*L[1]+bz*L[2],tx*L[0]+tz*L[2]),po=Math.atan2(bz,tz);
  let f=sample(m,Math.acos(Math.min(1,nL)),pi-(m?0:rot),Math.acos(z),po-(m?0:rot),true);
  for(let k=0;k<3;k++)img.data[idx+k]=display(nL*f[k]);
 }ctx.putImageData(img,0,0);
}
function graph(A,E,R){
 const ctx=canv[2].getContext('2d'),P=(x,y,z)=>[170+100*(.8*x-.6*y),165+40*(.6*x+.8*y)-95*z,.6*x+.8*y+.42*z];
 ctx.clearRect(0,0,340,235);
 function line(a,b,color){ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.strokeStyle=color;ctx.stroke();}
 let grid=[],faces=[],max=0;
 for(let t=0;t<=24;t++){grid[t]=[];for(let p=0;p<72;p++){
  let o=t/24*89.5*rad,b=p*tau/72,f=sample(0,Math.PI/2-E,A-R,o,b-R);
  let Y=.2126*f[0]+.7152*f[1]+.0722*f[2];max=Math.max(max,Y);
  grid[t].push({s:Math.sin(o),z:Math.cos(o),b,Y,color:f.map(display)});
 }}
 const origin=P(0,0,0);
 for(let p=0;p<72;p++)line(P(Math.cos(p*tau/72),Math.sin(p*tau/72),0),P(Math.cos((p+1)*tau/72),Math.sin((p+1)*tau/72),0),'#adbcba');
 for(const [x,y,z,name] of [[1,0,0,'x'],[0,1,0,'y'],[0,0,1,'n']]){
  const end=P(x,y,z);line(origin,end,'#859490');ctx.fillStyle='#435653';ctx.fillText(name,end[0]+3,end[1]);
 }
 for(const row of grid)for(const q of row){const r=q.Y/(max||1);q.pt=P(r*q.s*Math.cos(q.b),r*q.s*Math.sin(q.b),r*q.z);}
 for(let t=0;t<24;t++)for(let p=0;p<72;p++){
  let n=(p+1)%72,vs=[grid[t][p],grid[t+1][p],grid[t+1][n],grid[t][n]];
  faces.push({vs,depth:vs.reduce((s,v)=>s+v.pt[2],0)});
 }
 for(const {vs} of faces.sort((a,b)=>a.depth-b.depth)){
  ctx.beginPath();vs.forEach(({pt},i)=>i?ctx.lineTo(pt[0],pt[1]):ctx.moveTo(pt[0],pt[1]));ctx.closePath();
  ctx.fillStyle=ctx.strokeStyle='rgb('+vs[1].color.join(',')+')';ctx.lineWidth=.55;ctx.fill();ctx.stroke();
 }
 const light=P(Math.cos(E)*Math.cos(A),Math.cos(E)*Math.sin(A),Math.sin(E));
 ctx.lineWidth=2;line(origin,light,'#d78116');ctx.fillStyle='#884a00';ctx.fillText('L',light[0]+3,light[1]);ctx.lineWidth=1;
 document.querySelector('#scale').textContent='Poloměr ∝ jas BRDF · maximum tohoto řezu: '+max.toLocaleString('cs',{maximumFractionDigits:3})+' sr⁻¹';
}
const $=id=>document.getElementById(id),atlas=$('atlas'),mat=$('material'),mask=$('mask'),colors=tables.map(t=>Uint8Array.from(t,display));
let px=0,py=0;
function coords(m,x,y){
 const a=Math.floor(x/36),i=m?Math.floor(y/16)*4+a:Math.floor(y/16),b=m?0:a,j=y%16,d=x%36;
 return {i,b,j,d,q:((i*(m?1:36)+b)*16+j)*36+d};
}
function inspect(){const m=mat.selectedIndex,{i,b,j,d,q}=coords(m,px,py),f=tables[m],theta=t=>(89.5*t/15).toLocaleString('cs',{maximumFractionDigits:1})+'°';
 $('probe').textContent='Vzorek: θᵢ = '+theta(i)+(m?'':', φᵢ = '+10*b+'°')+', θₒ = '+theta(j)+', '+(m?'φₒ − φᵢ':'φₒ')+' = '+10*d+'°. RGB = ('+Array.from(f.subarray(3*q,3*q+3),v=>v.toLocaleString('cs',{maximumFractionDigits:4})).join('; ')+') sr⁻¹ · '+(used[m][q]?'použit na kouli':'na kouli nepoužit')+'.';
}
function paintAtlas(){const m=mat.selectedIndex,mode=mask.selectedIndex,W=m?144:1296,H=m?64:256;
 if(atlas.width!==W||atlas.height!==H){atlas.width=W;atlas.height=H;px=py=0}
 const ctx=atlas.getContext('2d'),img=ctx.createImageData(W,H),C=colors[m],U=used[m];let count=0;
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){let {q}=coords(m,x,y),on=U[q];count+=on;let off=mode===1?!on:mode===2&&on,k=(y*W+x)*4;
 for(let h=0;h<3;h++)img.data[k+h]=off?175:C[3*q+h];img.data[k+3]=255;}
 ctx.putImageData(img,0,0);$('coverage').textContent='Koule využívá '+count.toLocaleString('cs')+' z '+U.length.toLocaleString('cs')+' RGB vzorků ('+(100*count/U.length).toLocaleString('cs',{maximumFractionDigits:2})+' %).';
 $('axes').textContent=(m?'16 dlaždic ve čtyřech řádcích: úhel dopadu θᵢ roste po řádcích zleva doprava. Uvnitř: vodorovně rozdíl azimutů φₒ − φᵢ, svisle θₒ.':'Každá dlaždice má pevný směr světla: φᵢ roste doprava, θᵢ dolů. Uvnitř dlaždice je celý pohledový řez: φₒ roste doprava, θₒ dolů.')+' Úhly θ měříme od normály. Najeď na mapu pro konkrétní hodnotu.';inspect();
}
atlas.onpointermove=e=>{const r=atlas.getBoundingClientRect();px=Math.min(atlas.width-1,Math.max(0,Math.floor((e.clientX-r.left)/r.width*atlas.width)));py=Math.min(atlas.height-1,Math.max(0,Math.floor((e.clientY-r.top)/r.height*atlas.height)));inspect()};
atlas.onkeydown=e=>{const d={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[e.key];if(!d)return;e.preventDefault();px=Math.min(atlas.width-1,Math.max(0,px+d[0]));py=Math.min(atlas.height-1,Math.max(0,py+d[1]));inspect()};mat.onchange=mask.onchange=paintAtlas;
let frame;
function draw(){
 frame=0;const [R,A,E]=controls.map(c=>{c.previousElementSibling.value=c.value+'°';return +c.value*rad});
 const L=[Math.cos(E)*Math.cos(A),Math.cos(E)*Math.sin(A),Math.sin(E)];
 used.forEach(u=>u.fill(0));sphere(0,L,R);sphere(1,L,R);graph(A,E,R);paintAtlas();
}
controls.forEach(c=>c.addEventListener('input',()=>{if(!frame)frame=requestAnimationFrame(draw)}));draw();
})();
