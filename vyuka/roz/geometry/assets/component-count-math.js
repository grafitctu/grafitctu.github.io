/* Pure, testable calculations for the linked PCA component-count example. */
(function(root,factory){
 const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.PcaCountMath=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 function spectrum(values){
  if(!values.length||values.some(value=>!Number.isFinite(value)||value<0))throw new Error('Expected finite non-negative eigenvalues.');
  const total=values.reduce((sum,value)=>sum+value,0);
  const fractions=values.map(value=>total>0?value/total:0),cumulative=[0];
  fractions.forEach(value=>cumulative.push(cumulative.at(-1)+value));
  return {values:values.slice(),total,fractions,cumulative,defined:total>0};
 }
 function countForFraction(values,target){
  if(!Number.isFinite(target)||target<0||target>1)throw new Error('Expected a fraction between 0 and 1.');
  const s=spectrum(values);if(!s.defined)return null;
  // At least the requested fraction. Tolerance only absorbs summation rounding.
  return s.cumulative.findIndex(value=>value+1e-14>=target);
 }
 function report(D,k,example){
  const dimensions=D.mean.length;
  if(!Number.isInteger(k)||k<0||k>dimensions||!Number.isInteger(example)||example<0||example>=D.originals.length)throw new Error('Invalid component count or example.');
  const s=spectrum(D.explained_variance),original=D.originals[example],reconstruction=D.mean.slice();
  for(let j=0;j<k;j++)for(let pixel=0;pixel<dimensions;pixel++)reconstruction[pixel]+=D.scores[example][j]*D.components[j][pixel];
  const mse=reconstruction.reduce((sum,value,pixel)=>sum+(original[pixel]-value)**2,0)/dimensions;
  return {...s,k,example,original:original.slice(),reconstruction,mse,retained:s.defined?s.cumulative[k]:null,
   lastVariance:k?s.values[k-1]:null,nextVariance:k<dimensions?s.values[k]:null};
 }
 return {spectrum,countForFraction,report};
});
