/* Original teaching scenes. Every frame is derived from the same numerical data. */
(function(root,factory){
  if(typeof module==='object'&&module.exports)module.exports=factory(require('./math.js'));
  else root.GeometrySceneMath=factory(root.GeometryMath);
})(typeof globalThis!=='undefined'?globalThis:this,function(M){
  'use strict';
  function expansion(points,eps=.18,minSamples=6){
    const result=M.dbscan(points,eps,minSamples),seed=result.core.findIndex(Boolean);
    if(seed<0)return {result,seed,order:[],frames:[{current:null,members:[],processed:[]}]};
    const order=[seed],queued=new Set(order),members=new Set([seed]),processed=[];
    const frames=[{current:null,members:[seed],processed:[]}];
    for(let at=0;at<order.length;at++){
      const current=order[at];
      for(const j of result.neighbors[current]){
        members.add(j);
        if(result.core[j]&&!queued.has(j)){queued.add(j);order.push(j);}
      }
      processed.push(current);
      frames.push({current,members:[...members],processed:processed.slice()});
    }
    return {result,seed,order,frames};
  }
  function comparisons(points){
    const best=M.project(points,0).eigen.angle;
    return [best+Math.PI/2,best+Math.PI/4,best].map(angle=>{
      angle=(angle%Math.PI+Math.PI)%Math.PI;
      return {angle,report:M.project(points,angle)};
    });
  }
  return {expansion,comparisons};
});
