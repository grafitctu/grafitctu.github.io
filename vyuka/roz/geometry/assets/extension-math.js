(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./math.js'),require('./svm-math.js'));else root.GeometryExtensionMath=factory(root.GeometryMath,root.SvmGeometryMath);})(typeof globalThis!=='undefined'?globalThis:this,function(M,SM){
 'use strict';
 const distance=(p,q)=>(p[0]-q[0])**2+(p[1]-q[1])**2;
 function kmeans(points,k=2,seed=17){
  if(!Number.isInteger(k)||k<1||k>points.length)throw new Error('Invalid k.');
  const random=M.rng(seed),chosen=new Set();while(chosen.size<k)chosen.add(Math.floor(random()*points.length));
  let centres=[...chosen].map(i=>points[i].slice()),labels=Array(points.length).fill(-1);
  const frames=[{phase:'initial',centres:centres.map(p=>p.slice()),labels:labels.slice(),sse:null,iteration:0}];
  for(let iteration=1;iteration<=60;iteration++){
   const assigned=points.map(point=>{let best=0;for(let j=1;j<k;j++)if(distance(point,centres[j])<distance(point,centres[best]))best=j;return best;});
   frames.push({phase:'assign',centres:centres.map(p=>p.slice()),labels:assigned.slice(),sse:points.reduce((s,p,i)=>s+distance(p,centres[assigned[i]]),0),iteration});
   if(assigned.every((value,i)=>value===labels[i]))break;
   labels=assigned;
   centres=centres.map((previous,j)=>{const members=points.filter((_,i)=>labels[i]===j);return members.length?M.mean(members):previous.slice();});
   frames.push({phase:'update',centres:centres.map(p=>p.slice()),labels:labels.slice(),sse:points.reduce((s,p,i)=>s+distance(p,centres[labels[i]]),0),iteration});
  }
  return {k,seed,frames,final:frames.at(-1)};
 }
 function ldaData(gap=.72){
  const data=M.cloud('classes');data.points=data.points.map((p,i)=>[p[0],p[1]+(data.labels[i]?1:-1)*(gap-.72)]);return data;
 }
 function lda(points,labels){
  const means=[0,1].map(label=>M.mean(points.filter((_,i)=>labels[i]===label)));
  let a=0,b=0,d=0;points.forEach((p,i)=>{const dx=p[0]-means[labels[i]][0],dy=p[1]-means[labels[i]][1];a+=dx*dx;b+=dx*dy;d+=dy*dy;});
  a/=points.length-2;b/=points.length-2;d/=points.length-2;
  const diff=[means[1][0]-means[0][0],means[1][1]-means[0][1]],det=a*d-b*b;
  if(det<=1e-14)throw new Error('Singular within-class covariance.');
  const w=[(d*diff[0]-b*diff[1])/det,(a*diff[1]-b*diff[0])/det],norm=Math.hypot(...w),direction=w.map(v=>v/norm);
  const pca=M.project(points,0).eigen,angle=Math.atan2(direction[1],direction[0]);
  function quality(u){const separation=u[0]*diff[0]+u[1]*diff[1],within=u[0]*u[0]*a+2*u[0]*u[1]*b+u[1]*u[1]*d;return separation**2/within;}
  return {means,within:[[a,b],[b,d]],direction,angle,pca,fisherLda:quality(direction),fisherPca:quality(pca.vectors[0])};
 }
 function svmData(){
  function blobs(seed,n){const random=M.rng(seed),points=[],labels=[];for(let i=0;i<n;i++){const l=i%2;points.push([(l?.9:-.9)+.7*M.normal(random),(l?.35:-.35)+.85*M.normal(random)]);labels.push(l);}return {points,labels};}
  const rings=SM.sample(23),ringsTest=SM.sample(59),noisy=rings.labels.slice();
  for(const i of [4,20,39,60,78,99,124,144])noisy[i]=1-noisy[i];
  return {blobs:{train:blobs(71,160),test:blobs(72,120)},rings:{train:{points:rings.points,labels:noisy},test:{points:ringsTest.points,labels:ringsTest.labels}}};
 }
 return {kmeans,ldaData,lda,svmData};
});
