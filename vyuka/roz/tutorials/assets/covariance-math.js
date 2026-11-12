(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.CovarianceMath=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const base=[[1,1,4],[2,2,1],[3,2,3],[4,3,2]];
 const presets={base,redundant:base.map(([x,y])=>[x,y,x+y]),constant:base.map(([x,y])=>[x,y,5]),isotropic:[-1,1].flatMap(x=>[-1,1].flatMap(y=>[-1,1].map(z=>[x,y,z])))};
 function eigen(matrix){
  if(matrix.length!==3||matrix.some(row=>row.length!==3||row.some(x=>!Number.isFinite(x))))throw Error('Expected a finite 3 by 3 matrix.');
  const A=matrix.map(row=>row.slice()),V=Array.from({length:3},(_,i)=>Array.from({length:3},(_,j)=>Number(i===j)));
  const scale=Math.max(...A.flat().map(Math.abs)),tol=Math.max(scale,1e-300)*1e-13;
  for(let i=0;i<3;i++)for(let j=0;j<3;j++)if(Math.abs(A[i][j]-A[j][i])>1e-12*Math.max(1,scale))throw Error('Expected a symmetric matrix.');
  let converged=scale===0;
  for(let sweep=0;sweep<100&&!converged;sweep++){
   let largest=0;
   for(let p=0;p<3;p++)for(let q=p+1;q<3;q++){
    const apq=A[p][q];largest=Math.max(largest,Math.abs(apq));if(Math.abs(apq)<=tol)continue;
    const tau=(A[q][q]-A[p][p])/(2*apq),t=(tau>=0?1:-1)/(Math.abs(tau)+Math.hypot(1,tau)),c=1/Math.hypot(1,t),s=t*c;
    A[p][p]-=t*apq;A[q][q]+=t*apq;A[p][q]=A[q][p]=0;
    for(let k=0;k<3;k++){
     if(k!==p&&k!==q){const x=A[k][p],y=A[k][q];A[k][p]=A[p][k]=c*x-s*y;A[k][q]=A[q][k]=s*x+c*y;}
     const x=V[k][p],y=V[k][q];V[k][p]=c*x-s*y;V[k][q]=s*x+c*y;
    }
   }
   converged=largest<=tol;
  }
  if(!converged)throw Error('Eigenvalue iteration did not converge.');
  const order=[0,1,2].sort((a,b)=>A[b][b]-A[a][a]),values=order.map(j=>A[j][j]);
  const vectors=order.map(j=>{const u=V.map(row=>row[j]);const pivot=u.reduce((best,x,i)=>Math.abs(x)>Math.abs(u[best])?i:best,0);return u[pivot]<0?u.map(x=>-x):u;});
  return {values,vectors};
 }
 function stats(X){
  if(!Array.isArray(X)||X.length<2||X.some(row=>!Array.isArray(row)||row.length!==3||row.some(x=>!Number.isFinite(x))))throw Error('Use at least two finite samples with three features.');
  const n=X.length,mean=[0,1,2].map(j=>X.reduce((s,row)=>s+row[j]/n,0)),centered=X.map(row=>row.map((x,j)=>x-mean[j]));
  const sums=[0,1,2].map(i=>[0,1,2].map(j=>centered.reduce((sum,row)=>sum+row[i]*row[j],0))),C=sums.map(row=>row.map(x=>x/(n-1)));
  if(C.flat().some(x=>!Number.isFinite(x)))throw Error('The covariance is too large to represent.');
  const E=eigen(C),values=E.values.map(x=>Math.max(0,x)),total=values.reduce((a,b)=>a+b,0),threshold=values[0]*1e-10;
  return {n,d:3,mean,centered,sums,C,values,vectors:E.vectors,total,rank:values.filter(x=>x>threshold).length,fractions:values.map(x=>total>0?x/total:null),repeated:values.some((x,i)=>i>0&&Math.abs(x-values[i-1])<=Math.max(total,1e-300)*1e-10)};
 }
 function entry(report,i,j){
  if(![i,j].every(k=>Number.isInteger(k)&&k>=0&&k<3))throw Error('Invalid covariance entry.');
  return {i,j,products:report.centered.map(row=>row[i]*row[j]),sum:report.sums[i][j],divisor:report.n-1,value:report.C[i][j]};
 }
 return {presets,eigen,stats,entry};
});
