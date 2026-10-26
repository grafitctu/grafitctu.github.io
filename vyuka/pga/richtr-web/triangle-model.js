/* Teaching model: ray/plane intersection followed by barycentric containment.
   Relative tolerances, inclusive edges; not a watertight mesh intersection API. */
(function(root){'use strict';
const add=(a,b)=>a.map((x,i)=>x+b[i]),sub=(a,b)=>a.map((x,i)=>x-b[i]),mul=(a,s)=>a.map(x=>x*s),dot=(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const vertices=[[-1,-1,-5],[1,-1,-5],[0,1,-5]];
function intersect(o,d,vs=vertices,tMin=1e-6,tMax=Infinity){
 const [A,B,C]=vs,e1=sub(B,A),e2=sub(C,A),n=cross(e1,e2),nl=Math.hypot(...n),dl=Math.hypot(...d),base={hit:false,vertices:vs};
 if(!dl)return{...base,reason:'zero'};
 if(!nl||nl<=1e-12*Math.hypot(...e1)*Math.hypot(...e2))return{...base,reason:'degenerate'};
 const normal=mul(n,1/nl),denom=dot(normal,d),numerator=dot(normal,sub(A,o));
 if(Math.abs(denom)<=1e-12*dl)return{...base,normal,denom,reason:Math.abs(numerator)<=1e-10*Math.max(1,Math.hypot(...sub(A,o)))?'coplanar':'parallel'};
 const t=numerator/denom,point=add(o,mul(d,t)),q=sub(point,A),u=dot(cross(q,e2),n)/(nl*nl),v=dot(cross(e1,q),n)/(nl*nl),weights=[1-u-v,u,v],inside=weights.every(w=>w>=-1e-10),inRange=t>=tMin&&t<=tMax;
 return{...base,t,point,normal,denom,u,v,weights,inside,inRange,hit:inside&&inRange,reason:t<tMin?'before':t>tMax?'far':!inside?'outside':'hit',distance:Math.abs(t)*dl,uv:[u+.5*v,v]};
}
const defaults={ox:0,oy:0,angle:0,speed:1,tMax:10};
const presets={center:{...defaults},edge:{...defaults,oy:-1},vertex:{...defaults,ox:-1,oy:-1},outside:{...defaults,ox:1.5},parallel:{...defaults,angle:90},behind:{...defaults,angle:180},range:{...defaults,tMax:3}};
function scene(settings={}){const s={...defaults,...settings},a=s.angle*Math.PI/180,o=[s.ox,s.oy,0],d=[s.speed*Math.sin(a),0,-s.speed*Math.cos(a)];return{settings:s,o,d,result:intersect(o,d,vertices,1e-6,s.tMax)};}
const api={intersect,scene,vertices,defaults,presets};root.PGATriangle=api;if(typeof module!=='undefined')module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
