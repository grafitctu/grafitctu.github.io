// MERL half/difference parameterization, as in the preserved BRDFRead.cpp.
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const material=process.env.MERL_MATERIAL||'dark-specular-fabric';
const dir=path.join(__dirname,'../data'),b=fs.readFileSync(path.join(dir,material+'.binary')),N=90*90*180;
if(b.length!==12+24*N)throw Error('Unexpected MERL size');
const clamp=(v,a,z)=>Math.max(a,Math.min(z,v)),rad=x=>x*Math.PI/180;
function lookup(ti,to,po=0){let i=[Math.sin(rad(ti)),0,Math.cos(rad(ti))],o=[Math.sin(rad(to))*Math.cos(rad(po)),Math.sin(rad(to))*Math.sin(rad(po)),Math.cos(rad(to))],h=i.map((v,k)=>v+o[k]),len=Math.hypot(...h);h=h.map(v=>v/len);let th=Math.acos(clamp(h[2],-1,1)),ph=Math.atan2(h[1],h[0]),x=i[0]*Math.cos(ph),y=-i[0]*Math.sin(ph),z=i[2],dx=x*Math.cos(th)-z*Math.sin(th),dz=x*Math.sin(th)+z*Math.cos(th),td=Math.acos(clamp(dz,-1,1)),pd=Math.atan2(y,dx);if(pd<0)pd+=Math.PI;let idx=clamp(Math.floor(pd/Math.PI*180),0,179)+180*clamp(Math.floor(td/(Math.PI/2)*90),0,89)+16200*clamp(Math.floor(Math.sqrt(th/(Math.PI/2))*90),0,89);return [1,1.15,1.66].map((s,k)=>b.readDoubleLE(12+8*(idx+k*N))*s/1500);}
const luminance=a=>.2126*a[0]+.7152*a[1]+.0722*a[2];
if(require.main===module){const slices=[];for(let ti=0;ti<=80;ti+=5){let values=[];for(let a=-85;a<=85;a++)values.push(luminance(lookup(ti,Math.abs(a),a<0?180:0)));let smooth=values.map((v,j)=>values.slice(Math.max(0,j-3),Math.min(171,j+4)).reduce((a,b)=>a+b,0)/values.slice(Math.max(0,j-3),Math.min(171,j+4)).length),peaks=[];for(let j=4;j<167;j++)if(smooth[j]>smooth[j-1]&&smooth[j]>=smooth[j+1])peaks.push({angle:j-85,value:smooth[j]});slices.push({ti,peaks});}console.log(JSON.stringify(slices,null,2));
const data={material,source:`https://people.csail.mit.edu/wojciech/BRDFDatabase/brdfs/${material}.binary`,sha256:crypto.createHash('sha256').update(b).digest('hex'),thetaI:[],thetaO:[],phiO:[],rgb:[]};
for(let t=0;t<=80;t+=5)data.thetaI.push(t);for(let t=0;t<=85;t+=5)data.thetaO.push(t);for(let p=0;p<360;p+=5)data.phiO.push(p);
for(let ti of data.thetaI)for(let to of data.thetaO)for(let po of data.phiO)data.rgb.push(...lookup(ti,to,po).map(v=>+v.toPrecision(6)));
const notice=fs.readFileSync(path.join(dir,'MERL-Copyright.txt'),'utf8');
fs.writeFileSync(path.join(dir,'measured.js'),'/*\n'+notice+'\n*/\nwindow.MEASURED='+JSON.stringify(data)+';\n');
fs.writeFileSync(path.join(dir,'provenance.json'),JSON.stringify({...data,rgb:undefined,peakDetection:'7 sample moving average of 1-degree incidence-plane samples; used only for locating candidates. Displayed data are not smoothed.',slices},null,2));}
module.exports={lookup,luminance};
