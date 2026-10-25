(function(root){'use strict';
const dot=(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0),norm=v=>{const l=Math.hypot(...v);return v.map(x=>x/l);};
function direction(theta,phi){const t=theta*Math.PI/180,p=phi*Math.PI/180;return[Math.sin(t)*Math.cos(p),Math.sin(t)*Math.sin(p),Math.cos(t)];}
function lambert(rho=.6){return rho/Math.PI;}
function ggx(wi,wo,alpha=.25,F0=.04){const ci=wi[2],co=wo[2];if(ci<=0||co<=0)return 0;const h=norm(wi.map((x,i)=>x+wo[i])),nh=Math.max(0,h[2]),ih=Math.max(0,Math.min(1,dot(wi,h))),a2=alpha*alpha,D=a2/(Math.PI*(nh*nh*(a2-1)+1)**2),g=c=>2*c/(c+Math.sqrt(a2+(1-a2)*c*c)),F=F0+(1-F0)*(1-ih)**5;return D*F*g(ci)*g(co)/(4*ci*co);}
function evaluate(model,wi,wo,alpha=.25,rho=.6){if(wi[2]<=0||wo[2]<=0)return 0;if(model==='diffuse')return lambert(rho);if(model==='ggx')return ggx(wi,wo,alpha);return .7*lambert(rho)+.3*ggx(wi,wo,alpha);}
function uboDirections(){const out=[{theta:0,phi:0,v:[0,0,1]}];for(const [theta,step] of [[15,60],[30,30],[45,20],[60,18],[75,15]])for(let phi=0;phi<360;phi+=step)out.push({theta,phi,v:direction(theta,phi)});return out;}
function contribution(Li,theta,omega,fr){const E=Li*Math.max(0,Math.cos(theta*Math.PI/180))*omega;return{E,L:fr*E};}
function recoverBrdf(L,E){if(E<=0)throw Error('Positive irradiance required');return L/E;}
function reflectance(wi,model,alpha=.25,rho=.6,n=128){let sum=0;const dt=Math.PI/(2*n),dp=Math.PI/n;for(let j=0;j<n;j++){const t=(j+.5)*dt,st=Math.sin(t),ct=Math.cos(t);for(let k=0;k<2*n;k++){const p=(k+.5)*dp;sum+=evaluate(model,wi,[st*Math.cos(p),st*Math.sin(p),ct],alpha,rho)*ct*st*dt*dp;}}return sum;}
const api={dot,norm,direction,lambert,ggx,evaluate,uboDirections,contribution,recoverBrdf,reflectance};root.PGABRDF=api;if(typeof module!=='undefined')module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
