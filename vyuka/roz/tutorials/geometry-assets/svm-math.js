/* Explicit feature geometry. No optimizer, fitted SVM or hidden network request. */
(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.SvmGeometryMath=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  function sample(seed=23){
    let state=seed>>>0;
    function random(){state+=0x6D2B79F5;let t=state;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296;}
    const points=[],labels=[];
    for(let i=0;i<160;i++){
      const label=i<60?0:1,angle=2*Math.PI*random();
      const radius=label?1.48+.32*random():.76*Math.sqrt(random());
      points.push([radius*Math.cos(angle),radius*Math.sin(angle)]);labels.push(label);
    }
    return{points,labels,seed,synthetic:true};
  }
  function report(data,scores,flip=false){
    const predicted=scores.map(score=>(score>=0?1:0)^(flip?1:0));
    const wrong=predicted.map((label,i)=>label!==data.labels[i]);
    return{scores,predicted,wrong,errors:wrong.filter(Boolean).length,n:data.points.length};
  }
  function linear(data,angle=0,offset=0,flip=false){
    const normal=[-Math.sin(angle),Math.cos(angle)];
    return{...report(data,data.points.map(p=>normal[0]*p[0]+normal[1]*p[1]-offset),flip),normal,angle,offset};
  }
  function radial(data,cx=0,cy=0,height=1.44){
    if(!Number.isFinite(height)||height<0)throw new Error('Plane height must be finite and nonnegative.');
    const z=data.points.map(p=>(p[0]-cx)**2+(p[1]-cy)**2);
    return{...report(data,z.map(value=>value-height)),z,cx,cy,height,radius:Math.sqrt(height)};
  }
  function view(point,yaw,pitch){
    const [x,y,z]=point,c=Math.cos(yaw),s=Math.sin(yaw),depthXY=s*x+c*y;
    return[c*x-s*y,Math.sin(pitch)*depthXY-Math.cos(pitch)*z,Math.cos(pitch)*depthXY+Math.sin(pitch)*z];
  }
  return{sample,linear,radial,view};
});
