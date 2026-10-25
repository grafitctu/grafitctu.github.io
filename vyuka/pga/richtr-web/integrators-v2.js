/* Original educational CPU renderer: identical geometry/camera for three integrators.
   Lambert + ideal mirror + nonabsorbing glass. No MIS, textures, volumes or denoising.
   Finite depth is a deliberate bias. Scene units and emitted radiance are relative. */
(function(root){'use strict';const M=root.PGALab||(typeof require!=='undefined'?require('./models-v2.js'):null),{add,sub,mul,dot,norm}=M;const prod=(a,b)=>a.map((x,i)=>x*b[i]),black=[0,0,0];
const scene=[{kind:'plane',axis:2,k:0,a:0,b:1,lo:[-2.5,-2.5],hi:[2.5,2.5],color:[.68,.68,.68]},
{kind:'plane',axis:2,k:4.6,a:0,b:1,lo:[-2.5,-2.5],hi:[2.5,2.5],color:[.68,.68,.68]},
{kind:'plane',axis:1,k:2.5,a:0,b:2,lo:[-2.5,0],hi:[2.5,4.6],color:[.68,.68,.68]},
{kind:'plane',axis:0,k:-2.5,a:1,b:2,lo:[-2.5,0],hi:[2.5,4.6],color:[.55,.035,.025]},
{kind:'plane',axis:0,k:2.5,a:1,b:2,lo:[-2.5,0],hi:[2.5,4.6],color:[.03,.44,.07]},
{kind:'plane',axis:2,k:4.4,a:0,b:1,lo:[-1.45,-.4],hi:[.25,1],color:[0,0,0],emission:[12,12,12]},
{kind:'sphere',c:[-1,.3,.95],r:.95,material:'glass',color:[1,1,1]},
{kind:'sphere',c:[.95,1.1,.78],r:.78,material:'mirror',color:[.91,.92,.94]},
{kind:'box',lo:[.15,-1.15,0],hi:[1.15,-.15,1],color:[.65,.37,.07]}];
function rng(seed){let s=seed>>>0;return()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return(s>>>0)/4294967296;};}
function hit(o,d,max=Infinity){let best=null;for(const obj of scene){let t=Infinity,n;
if(obj.kind==='sphere'){const s=M.sphere(o,d,obj.c,obj.r);if(s.t!==undefined){t=s.t;n=s.normal;}}
if(obj.kind==='plane'&&Math.abs(d[obj.axis])>1e-10){const q=(obj.k-o[obj.axis])/d[obj.axis];if(q>1e-4){const p=add(o,mul(d,q));if(p[obj.a]>=obj.lo[0]&&p[obj.a]<=obj.hi[0]&&p[obj.b]>=obj.lo[1]&&p[obj.b]<=obj.hi[1]){t=q;n=[0,0,0];n[obj.axis]=obj.axis===2&&obj.k>0?-1:1;}}}
if(obj.kind==='box'){let near=-Infinity,far=Infinity,nearN,farN;for(let k=0;k<3;k++){if(Math.abs(d[k])<1e-12){if(o[k]<obj.lo[k]||o[k]>obj.hi[k]){near=Infinity;break;}continue;}let a=(obj.lo[k]-o[k])/d[k],b=(obj.hi[k]-o[k])/d[k],na=[0,0,0],nb=[0,0,0];na[k]=-1;nb[k]=1;if(a>b){[a,b]=[b,a];[na,nb]=[nb,na];}if(a>near){near=a;nearN=na;}if(b<far){far=b;farN=nb;}}if(near<=far&&far>1e-4){t=near>1e-4?near:far;n=near>1e-4?nearN:farN;}}
if(t>1e-4&&t<max){max=t;best={t,p:add(o,mul(d,t)),n,obj};}}
return best;}
const reflect=(d,n)=>sub(d,mul(n,2*dot(d,n)));
function refraction(d,n){const inside=dot(d,n)>0,N=inside?mul(n,-1):n,eta=inside?1.5:1/1.5,c=-dot(d,N),k=1-eta*eta*(1-c*c),F=M.fresnel(Math.acos(Math.max(0,Math.min(1,c)))*180/Math.PI,inside?1.5:1,inside?1:1.5).F;return{N,F,d:k<0?null:norm(add(mul(d,eta),mul(N,eta*c-Math.sqrt(k))))};}
function direct(h,random){const x=[-1.45+1.7*random(),-.4+1.4*random(),4.4],v=sub(x,h.p),dist2=dot(v,v),dist=Math.sqrt(dist2),l=mul(v,1/dist),N=dot(h.n,l)>0?h.n:mul(h.n,-1),cos=Math.max(0,dot(N,l)),lightCos=Math.max(0,l[2]);if(!cos||!lightCos||hit(add(h.p,mul(N,1e-4)),l,dist-2e-4))return black;return h.obj.color.map(c=>c/Math.PI*12*cos*lightCos/dist2*(1.7*1.4));}
function whitted(o,d,random,depth,mode){if(depth<0)return black;const h=hit(o,d);if(!h)return black;if(h.obj.emission)return h.obj.emission;const type=h.obj.material;if(type==='mirror'){if(mode==='direct')return black;const rd=reflect(d,h.n);return prod(h.obj.color,whitted(add(h.p,mul(rd,2e-4)),rd,random,depth-1,mode));}if(type==='glass'){if(mode==='direct')return black;const f=refraction(d,h.n),rd=reflect(d,f.N),a=whitted(add(h.p,mul(rd,2e-4)),rd,random,depth-1,mode);if(!f.d)return a;const b=whitted(add(h.p,mul(f.d,2e-4)),f.d,random,depth-1,mode);return add(mul(a,f.F),mul(b,1-f.F));}return direct(h,random);}
function cosine(N,random){const u=random(),phi=2*Math.PI*random(),r=Math.sqrt(u),z=Math.sqrt(1-u),T=norm(Math.abs(N[2])<.9?[-N[1],N[0],0]:[0,-N[2],N[1]]),B=[N[1]*T[2]-N[2]*T[1],N[2]*T[0]-N[0]*T[2],N[0]*T[1]-N[1]*T[0]];return norm(add(add(mul(T,r*Math.cos(phi)),mul(B,r*Math.sin(phi))),mul(N,z)));}
function pathTrace(o,d,random,depth=8){let weight=[1,1,1];for(let k=0;k<depth;k++){const h=hit(o,d);if(!h)return black;if(h.obj.emission)return prod(weight,h.obj.emission);const N=dot(d,h.n)<0?h.n:mul(h.n,-1);if(h.obj.material==='glass'){const f=refraction(d,h.n);d=!f.d||random()<f.F?reflect(d,f.N):f.d;}else if(h.obj.material==='mirror'){d=reflect(d,N);weight=prod(weight,h.obj.color);}else{d=cosine(N,random);weight=prod(weight,h.obj.color);}o=add(h.p,mul(d,2e-4));}return black;}
function pixel(x,y,w,h,mode,samples=8){const camera=[0,-10,4.2],f=norm(sub([0,.6,1.9],camera)),right=[1,0,0],up=norm([0,-f[2],f[1]]),random=rng(1729+(y*w+x)*65537);let color=[0,0,0];for(let k=0;k<samples;k++){const sx=((x+random())/w-.5)*.94,sy=(.5-(y+random())/h)*.94*h/w,d=norm(add(add(f,mul(right,sx)),mul(up,sy)));color=add(color,mode==='path'?pathTrace(camera,d,random):whitted(camera,d,random,6,mode));}return mul(color,1/samples);}
const api={scene,rng,hit,pixel,pathTrace,whitted};root.PGART=api;if(typeof module!=='undefined')module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
