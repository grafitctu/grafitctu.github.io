/* Deterministic geometry/radiometry used by both diagrams and numerical tests. */
(function(root){'use strict';
const rad=x=>x*Math.PI/180,dot=(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0),add=(a,b)=>a.map((x,i)=>x+b[i]),scale=(a,s)=>a.map(x=>x*s),sub=(a,b)=>add(a,scale(b,-1)),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],norm=a=>{const l=Math.hypot(...a);return l?a.map(x=>x/l):[0,0,0];};
function direction(elevation,azimuth){const e=rad(elevation),p=rad(azimuth);return[Math.cos(e)*Math.cos(p),Math.cos(e)*Math.sin(p),Math.sin(e)];}
function reflect(l,n=[0,0,1]){return sub(scale(n,2*dot(n,l)),l);}
function phong(n,l,v,{ka=.05,kd=.6,ks=.7,p=32}={}){n=norm(n);l=norm(l);v=norm(v);const nl=dot(n,l),rv=Math.max(0,dot(reflect(l,n),v));const ambient=ka,diffuse=kd*Math.max(0,nl),specular=nl>0&&dot(n,v)>0?ks*rv**p:0;return{ambient,diffuse,specular,total:ambient+diffuse+specular,nl,rv};}
function coneIrradiance(P,n,I=36,halfAngle=30){const r=Math.hypot(...P),inside=r>0&&P[2]>0&&P[2]/r>=Math.cos(rad(halfAngle))-1e-12,cosine=r?Math.max(0,dot(norm(n),scale(P,-1/r))):0;return{E:inside?I*cosine/(r*r):0,r,cosine,inside};}
function board({distance=3,offset=0,pitch=0,roll=0}={}){const a=rad(pitch),b=rad(roll),n=[-Math.sin(a)*Math.cos(b),Math.sin(b),-Math.cos(a)*Math.cos(b)],u=norm(cross([0,1,0],n)),v=cross(n,u),center=[offset,0,distance];return{n,u,v,center,point:(x,y)=>add(center,add(scale(u,x),scale(v,y)))};}
function coneSolidAngle(halfAngle){return 2*Math.PI*(1-Math.cos(rad(halfAngle)));}
const api={rad,dot,add,sub,scale,cross,norm,direction,reflect,phong,coneIrradiance,board,coneSolidAngle};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.PGATeaching=api;
})(typeof globalThis!=='undefined'?globalThis:this);
