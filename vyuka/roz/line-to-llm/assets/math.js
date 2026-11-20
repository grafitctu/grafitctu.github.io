(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.LineLlmMath=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const dot=(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0),matvec=(A,x)=>A.map(row=>dot(row,x)),relu=x=>Math.max(0,x);
 const vocab=['I','brush','my','teeth','twice','a','day','week','month','year','night','<unk>'];
 const embeddings=[[.2,.1,-.1],[.8,0,.2],[.1,.3,0],[1,-.2,.4],[0,.9,.5],[.2,.1,.3],[.1,1.2,.7],[.4,.8,-.3],[-.5,.4,.8],[-.8,.1,.9],[.9,-.6,.1],[0,0,0]];
 const weights={Q:[[1.4,.2,-.4],[.4,1.6,.2],[-.6,.4,1.2]],K:[[1.2,-.2,.8],[.2,1.4,-.4],[.4,.2,1.8]],V:[[1,0,.2],[-.1,.8,.1],[0,.3,.7]],output:[[.7,1.3,.4],[-.4,.5,.9],[.2,-.6,1.1],[-.8,.2,.1],[1.2,-.7,-.4]],bias:[1.2,.4,-.2,-.8,-.4]};
 const candidates=['day','week','month','year','night'];
 function softmax(logits,temperature=1){
  if(!(temperature>0)||!Number.isFinite(temperature)||!logits.length||logits.some(x=>Number.isNaN(x)||x===Infinity))throw Error('Invalid softmax input.');
  const largest=Math.max(...logits);if(!Number.isFinite(largest))throw Error('At least one position must be unmasked.');
  const e=logits.map(x=>Math.exp((x-largest)/temperature)),sum=e.reduce((a,b)=>a+b,0);return e.map(x=>x/sum);
 }
 function solve(A,b){
  const n=b.length,M=A.map((row,i)=>[...row,b[i]]);
  for(let p=0;p<n;p++){
   let pivot=p;for(let r=p+1;r<n;r++)if(Math.abs(M[r][p])>Math.abs(M[pivot][p]))pivot=r;
   if(Math.abs(M[pivot][p])<1e-13)throw Error('Singular system. Increase regularization.');
   [M[p],M[pivot]]=[M[pivot],M[p]];const scale=M[p][p];for(let j=p;j<=n;j++)M[p][j]/=scale;
   for(let r=0;r<n;r++)if(r!==p){const factor=M[r][p];for(let j=p;j<=n;j++)M[r][j]-=factor*M[p][j];}
  }return M.map(row=>row[n]);
 }
 function summary(rows){
  const train=rows.filter(r=>r.split==='train');if(train.length<2)throw Error('Need training samples.');
  const mean=train.reduce((s,r)=>s+r.horsepower,0)/train.length,sd=Math.sqrt(train.reduce((s,r)=>s+(r.horsepower-mean)**2,0)/train.length);
  return {train,mean,sd,yMean:train.reduce((s,r)=>s+r.mpg,0)/train.length};
 }
 function fitBasis(rows,k=0,ridge=.01){
  if(!Number.isInteger(k)||k<0||k>14||!Number.isFinite(ridge)||ridge<0)throw Error('Invalid fit options.');
  const S=summary(rows),z=S.train.map(r=>(r.horsepower-S.mean)/S.sd),lo=Math.min(...z),hi=Math.max(...z),knots=Array.from({length:k},(_,i)=>lo+(hi-lo)*(i+1)/(k+1));
  const basis=x=>[1,x,...knots.map(t=>relu(x-t))],P=z.map(basis),d=k+2;
  const A=Array.from({length:d},()=>Array(d).fill(0)),b=Array(d).fill(0);
  P.forEach((row,r)=>{for(let i=0;i<d;i++){b[i]+=row[i]*S.train[r].mpg;for(let j=0;j<d;j++)A[i][j]+=row[i]*row[j];}});
  for(let j=1;j<d;j++)A[j][j]+=ridge;const beta=solve(A,b);
  return {k,ridge,mean:S.mean,sd:S.sd,knots,beta};
 }
 function predict(model,hp){const z=(hp-model.mean)/model.sd;return dot(model.beta,[1,z,...model.knots.map(t=>relu(z-t))]);}
 function metrics(rows,predictor,split){const part=rows.filter(r=>r.split===split);if(!part.length)return null;const residuals=part.map(r=>predictor(r.horsepower)-r.mpg);return {n:part.length,mae:residuals.reduce((s,e)=>s+Math.abs(e),0)/part.length,mse:residuals.reduce((s,e)=>s+e*e,0)/part.length};}
 function lineGradient(rows,w,b){
  const S=summary(rows),x=S.train.map(r=>(r.horsepower-S.mean)/S.sd),y=S.train.map(r=>r.mpg-S.yMean),errors=x.map((v,i)=>w*v+b-y[i]);
  return {loss:errors.reduce((s,e)=>s+e*e,0)/x.length,dw:2*dot(errors,x)/x.length,db:2*errors.reduce((a,c)=>a+c,0)/x.length,mean:S.mean,sd:S.sd,yMean:S.yMean};
 }
 function gradientRun(rows,w,b,eta,steps){const history=[];for(let t=0;t<steps;t++){const g=lineGradient(rows,w,b);history.push({w,b,loss:g.loss});if(g.loss>1e8)break;w-=eta*g.dw;b-=eta*g.db;}return {w,b,history,gradient:lineGradient(rows,w,b)};}
 const networkWeights={W1:[[-1.4],[-.7],[.4],[.8],[1.2]],b1:[-.8,.2,.6,-.4,.3],W2:Array.from({length:5},(_,i)=>Array.from({length:5},(_,j)=>(((i+1)*7+(j+1)*3)%11-5)/6)),b2:[.1,-.2,.3,-.1,.2],W3:[[.6,-.4,.8,-.7,.5]],b3:[.1]};
 function network(x,activation='relu'){
  const N=networkWeights,fn=activation==='identity'?v=>v:activation==='tanh'?Math.tanh:relu;
  const z1=matvec(N.W1,[x]).map((v,i)=>v+N.b1[i]),h1=z1.map(fn),z2=matvec(N.W2,h1).map((v,i)=>v+N.b2[i]),h2=z2.map(fn),y=dot(N.W3[0],h2)+N.b3[0];return {x,z1,h1,z2,h2,y,parameters:46};
 }
 function tokenize(text){return (text.match(/[\p{L}\p{N}]+|[^\s\p{L}\p{N}]/gu)||[]).slice(0,8).map(token=>({token,id:vocab.indexOf(token)>=0?vocab.indexOf(token):11}));}
 function attention(text,queryIndex,options={}){
  const tokens=tokenize(text);if(!tokens.length)throw Error('Enter a prefix.');
  const query=Math.max(0,Math.min(tokens.length-1,queryIndex??tokens.length-1)),E=options.embeddings||embeddings,position=options.position!==false,causal=options.causal!==false;
  const H=tokens.map(({id},p)=>E[id].map((v,j)=>v+(position?[.03*p,.02*(p%2),-.01*p][j]:0)));
  const Q=H.map(h=>matvec(weights.Q,h)),K=H.map(h=>matvec(weights.K,h)),V=H.map(h=>matvec(weights.V,h));
  const raw=K.map(k=>dot(Q[query],k)/Math.sqrt(3)),scores=raw.map((s,j)=>causal&&j>query?-Infinity:s),alpha=softmax(scores,options.attentionTemperature||1),context=[0,1,2].map(d=>V.reduce((sum,row,j)=>sum+alpha[j]*row[d],0));
  const logits=weights.output.map((w,i)=>dot(w,context)+weights.bias[i]),probabilities=softmax(logits,options.outputTemperature||1);
  return {tokens,query,H,Q,K,V,raw,scores,alpha,context,logits,probabilities,candidates,causal,position};
 }
 function gpt2ParameterCount(v=50257,d=768,n=1024,layers=12){const token=v*d,position=n*d,blocks=layers*(12*d*d+13*d),finalNorm=2*d;return {token,position,blocks,finalNorm,total:token+position+blocks+finalNorm};}
 return {dot,matvec,relu,softmax,solve,summary,fitBasis,predict,metrics,lineGradient,gradientRun,network,networkWeights,tokenize,attention,vocab,embeddings,weights,candidates,gpt2ParameterCount};
});
