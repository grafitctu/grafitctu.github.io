(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./math.js'));else root.CovarianceLessonMath=factory(root.GeometryMath);})(typeof globalThis!=='undefined'?globalThis:this,function(M){
 'use strict';
 const tiny=[[1,1],[2,2],[3,2],[4,3]];
 function calculate(points){
  const stats=M.covariance(points),matrix=stats.matrix,[a,b]=matrix[0],d=matrix[1][1],n=points.length;
  const rows=points.map(p=>{const dx=p[0]-stats.mean[0],dy=p[1]-stats.mean[1];return {x:p[0],y:p[1],dx,dy,xx:dx*dx,xy:dx*dy,yy:dy*dy};});
  const sums=rows.reduce((s,r)=>[s[0]+r.xx,s[1]+r.xy,s[2]+r.yy],[0,0,0]);
  const delta=Math.hypot(a-d,2*b),lambda=(a+d+delta)/2;
  let v=[b,lambda-a];if(Math.hypot(...v)<1e-14)v=a>=d?[1,0]:[0,1];
  const length=Math.hypot(...v),u=v.map(value=>value/length),angle=(Math.atan2(u[1],u[0])+2*Math.PI)%(Math.PI);
  const product=[a*u[0]+b*u[1],b*u[0]+d*u[1]],expected=u.map(value=>lambda*value);
  return {...stats,a,b,d,rows,sums,delta,lambda,lambda2:(a+d-delta)/2,v,length,u,angle,product,expected,
   nonunique:delta<=1e-10*Math.max(1,Math.abs(a+d)),residual:Math.hypot(product[0]-expected[0],product[1]-expected[1])};
 }
 return {tiny,calculate};
});
