/* Native MathML preserves fractions, indices and integration domains. */
const row=(...s)=>'<mrow>'+s.join('')+'</mrow>',mi=s=>'<mi>'+s+'</mi>',mo=s=>'<mo>'+s+'</mo>',mn=s=>'<mn>'+s+'</mn>',sub=(a,b)=>'<msub>'+a+b+'</msub>',sup=(a,b)=>'<msup>'+a+b+'</msup>',frac=(a,b)=>'<mfrac>'+row(a)+row(b)+'</mfrac>';
const par=s=>row(mo('('),s,mo(')')),f=sub(mi('f'),mi('r')),Li=sub(mi('L'),mi('i')),Lo=sub(mi('L'),mi('o')),Le=sub(mi('L'),mi('e')),Ei=sub(mi('E'),mi('i')),wi=sub(mi('ω'),mi('i')),wo=sub(mi('ω'),mi('o')),ti=sub(mi('θ'),mi('i')),to=sub(mi('θ'),mi('o')),d=mi('d'),cos='<mi mathvariant="normal">cos</mi>',rho=mi('ρ'),pi=mi('π'),domain=sup(mi('Ω'),mo('+'));
const args=(...a)=>par(a.join(mo(','))),fr=f+args(mi('x'),wi,wo),lIn=Li+args(mi('x'),wi),lOut=Lo+args(mi('x'),wo),integral=s=>row('<munder>'+mo('∫')+domain+'</munder>',s),units=mo('[')+sup('<mi mathvariant="normal">sr</mi>',row(mo('−'),mn(1)))+mo(']');
module.exports={
 fullDefinition:row(fr,mo('='),frac(d+lOut,row(lIn,cos,ti,d,wi)),'<mspace width="1em"/>',units),
 incident:row(d,Ei,mo('='),lIn,cos,ti,d,wi),
 energy:row(integral(row(f,args(wi,wo),cos,to,d,wo)),mo('≤'),mn(1)),
 lambert:row(f,mo('='),frac(rho,pi)),
 normalization:row(integral(row(cos,mi('θ'),d,mi('ω'))),mo('='),pi),
 albedoIntegral:row(integral(row(frac(rho,pi),cos,mi('θ'),d,mi('ω'))),mo('='),rho),
 balance:row(lOut,mo('='),Le,args(mi('x'),wo),mo('+'),integral(row(fr,lIn,cos,ti,d,wi)))
};
