(()=>{
for(const host of document.querySelectorAll('[data-grid-conv]')){
 const grid=[[1,1,2,6,6],[1,2,3,7,7],[1,2,4,8,8],[1,2,3,7,7],[1,1,2,6,6]];
 const kernels=[[0,0,0,1,0,-1,0,0,0],[1,1,1,1,1,1,1,1,1],[0,-1,0,-1,5,-1,0,-1,0]];
 host.innerHTML='<div class="controls"><label>Jádro <select><option>Rozdíl zprava a zleva</option><option>Průměr okolí</option><option>Ostření</option></select></label><button type="button" data-step="-1">← Předchozí pixel</button><button type="button" data-step="1">Další pixel →</button></div><small>Klikni do vstupu nebo krokuj po řádcích. Mimo obraz počítáme s nulami. Jádro se před násobením otočí o 180°.</small><div class="conv-panels" style="display:flex;flex-wrap:wrap;gap:1em;margin:.5em 0"></div><output aria-live="polite"></output>';
 const panels=host.querySelector('.conv-panels'),select=host.querySelector('select');let pos=12;
 function draw(){
  const y=Math.floor(pos/5),x=pos%5,k=select.selectedIndex,g=kernels[k],div=k===1?9:1,terms=[];
  const outside=(r,c)=>r<0||c<0||r>=5||c>=5;
  function panel(name,n,items){return '<div><b>'+name+'</b><div style="display:grid;grid-template-columns:repeat('+n+',max-content);gap:2px;margin-top:.3em">'+items.join('')+'</div></div>'}
  function cell(v,bg,idx){const tag=idx===undefined?'span':'button',attrs=idx===undefined?'':' type="button" data-pixel="'+idx+'" aria-pressed="'+(idx===pos)+'" aria-label="Řádek '+Math.floor(idx/5)+', sloupec '+idx%5+', hodnota '+v+'"';return '<'+tag+attrs+' style="text-align:center;min-width:2em;padding:.12em;border:1px solid #88999a;color:#182e34;background:'+bg+'">'+v+'</'+tag+'>'}
  const input=grid.flatMap((row,r)=>row.map((v,c)=>cell(v,r===y&&c===x?'#ffcf83':Math.abs(r-y)<=1&&Math.abs(c-x)<=1?'#d8ece7':'white',r*5+c)));
  const products=g.map((_,i)=>{const r=y+Math.floor(i/3)-1,c=x+i%3-1,v=outside(r,c)?0:grid[r][c],w=g[8-i];terms.push(v*w);return cell(v+' × ('+w+')',outside(r,c)?'#eee':w?'#d8ece7':'white')});
  const matrix=a=>a.map(v=>cell(v,'white')),factor=div===9?' / 9':'';
  panels.innerHTML=panel('Vstup f',5,input)+panel('Jádro g'+factor,3,matrix(g))+panel('Po otočení'+factor,3,matrix([...g].reverse()))+panel('Součiny v okolí',3,products);
  const sum=terms.reduce((a,b)=>a+b,0);
  host.querySelector('output').textContent='Výstup ['+y+', '+x+'] = ('+terms.map((v,i)=>i?(v<0?' − ':' + ')+Math.abs(v):v).join('')+')'+factor+' = '+(sum/div).toLocaleString('cs',{maximumFractionDigits:3})+(div!==1&&sum%div?' (zaokrouhleno)':'')+'.';
  host.querySelector('[data-step="-1"]').disabled=pos===0;host.querySelector('[data-step="1"]').disabled=pos===24;
 }
 panels.onclick=e=>{const b=e.target.closest('[data-pixel]');if(b){pos=+b.dataset.pixel;draw();panels.querySelector('[data-pixel="'+pos+'"]').focus()}};
 for(const b of host.querySelectorAll('[data-step]'))b.onclick=()=>{pos+=+b.dataset.step;draw()};
 select.onchange=draw;draw();
}
const range=(name,t,min,max,v)=>'<label>'+t+' <input name="'+name+'" type="range" min="'+min+'" max="'+max+'" value="'+v+'"></label>';
const select=(name,t,items)=>'<label>'+t+' <select name="'+name+'">'+items.map(s=>'<option>'+s+'</option>').join('')+'</select></label>';
function lab(el,prompt,controls,paint,answer){
 el.innerHTML='<p>'+prompt+'</p><div class="controls">'+controls+'</div><canvas width="640" height="240" role="img" aria-label="'+el.parentElement.querySelector('h1').textContent+'"></canvas><output aria-live="polite"></output><details><summary>Co z toho plyne?</summary>'+answer+'</details>';
 const c=el.querySelector('canvas'),g=c.getContext('2d'),draw=()=>{g.fillStyle='#fff';g.fillRect(0,0,c.width,c.height);g.font='15px Segoe UI';const v=Object.fromEntries([...el.querySelectorAll('[name]')].map(e=>[e.name,e.type==='range'?+e.value:e.value]));el.querySelector('output').textContent=paint(g,v)};
 el.addEventListener('input',draw);draw();
}
const label=(g,s,x,y)=>{g.fillStyle='#24404b';g.fillText(s,x,y)};
const cell=(g,x,y,w,h,color)=>{g.fillStyle=color;g.fillRect(x,y,w,h)};
const gray=v=>'rgb('+[v,v,v].join(',')+')';
const el=id=>document.querySelector('[data-lab="'+id+'"]');
lab(el('line'),'Měň výšku konce úsečky a projdi ji krok po kroku. Kdy se změní i řádek pixelu?',range('Y','Koncové y',0,8,5)+range('k','Krok',0,15,6),(g,{Y,k})=>{
 const X=15,S=23,px=x=>90+x*S,py=y=>207-y*S;
 for(let y=0;y<=8;y++)for(let x=0;x<=X;x++)cell(g,px(x)-11,py(y)-11,22,22,'#e7efed');
 let y=0,d=2*Y-X,last=0;for(let x=0;x<=k;x++){cell(g,px(x)-10,py(y)-10,20,20,x===k?'#d18228':'#27847d');last=y;if(x===k)break;if(d>=0){y++;d-=2*X}d+=2*Y}
 g.strokeStyle='#233441';g.beginPath();g.moveTo(px(0),py(0));g.lineTo(px(X),py(Y));g.stroke();
 return 'Krok '+k+': pixel ('+k+', '+last+'), rozhodovací proměnná d = '+d+'. '+(k===X?'Konec úsečky.':d>=0?'Další pixel bude o řádek výš.':'Další pixel zůstane ve stejném řádku.');
},'Pro tento oktant přidáváme vždy 1 k x. Celočíselná chyba rozhoduje mezi dvěma kandidáty; při remíze tato varianta volí vyšší řádek.');
lab(el('dither'),'Oba obrazy mají stejný počet odstínů. Změní rozptyl chyby samotnou paletu, nebo jen prostorové uspořádání pixelů?',range('levels','Počet odstínů',2,12,3),(g,{levels})=>{
 const W=72,H=36,src=Array.from({length:W*H},(_,i)=>(i%W)/(W-1)*255),work=src.slice(),quant=v=>Math.round(Math.max(0,Math.min(255,v))/255*(levels-1))*255/(levels-1);
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){let i=y*W+x,q=quant(work[i]),e=work[i]-q;cell(g,12+x*4,35+y*4,4,4,gray(quant(src[i])));cell(g,333+x*4,35+y*4,4,4,gray(q));for(const [dx,dy,w] of [[1,0,7],[-1,1,3],[0,1,5],[1,1,1]])if(x+dx>=0&&x+dx<W&&y+dy<H)work[i+dy*W+dx]+=e*w/16}
 label(g,'Nejbližší odstín',12,22);label(g,'Floydův–Steinbergův rozptyl',333,22);return 'Obě palety: '+Array.from({length:levels},(_,i)=>Math.round(i*255/(levels-1))).join(', ')+'.';
},'Rozptyl chyby nepřidává žádný odstín. Přenáší chybu do sousedních pixelů, takže z větší vzdálenosti vnímáme plynulejší přechod.');
lab(el('conv'),'Posuň střed jádra na hranu obrazu. Sleduj číselný výsledek před ořezem, nejen jeho zobrazený odstín.',range('x','Sloupec x',0,7,4)+range('y','Řádek y',0,7,3)+select('kernel','Jádro',['Průměr','Rozdíl v ose x','Ostření'])+select('op','Operace',['Konvoluce','Korelace'])+select('edge','Mimo obraz',['Nula','Opakovat okraj','Periodicky']),(g,{x,y,kernel,op,edge})=>{
 const K=kernel==='Průměr'?Array(9).fill(1):kernel==='Rozdíl v ose x'?[0,0,0,-1,0,1,0,0,0]:[0,-1,0,-1,5,-1,0,-1,0],div=kernel==='Průměr'?9:1;
 const I=(x,y)=>x<3+y/5?30:210,read=(x,y)=>{if(edge==='Nula'&&(x<0||x>7||y<0||y>7))return 0;const ix=v=>edge==='Periodicky'?(v+8)%8:Math.max(0,Math.min(7,v));return I(ix(x),ix(y))};
 const calc=(x,y)=>K.map((w,i)=>{let a=i%3-1,b=Math.floor(i/3)-1,sign=op==='Konvoluce'?-1:1;return w*read(x+sign*a,y+sign*b)});
 for(let j=0;j<8;j++)for(let i=0;i<8;i++){let val=calc(i,j).reduce((a,b)=>a+b,0)/div;cell(g,18+i*23,29+j*23,22,22,gray(I(i,j)));cell(g,430+i*23,29+j*23,22,22,gray(Math.max(0,Math.min(val,255))));}
 for(let base of [18,430]){g.strokeStyle='#ef932f';g.lineWidth=3;g.strokeRect(base+x*23,29+y*23,22,22)}
 label(g,'Vstup',18,20);label(g,'Výstup: 0 až 255',430,20);label(g,'Jádro h'+(div===9?' / 9':''),255,45);for(let i=0;i<9;i++)label(g,String(K[i]),257+(i%3)*32,75+Math.floor(i/3)*30);
 const terms=calc(x,y);return '('+x+', '+y+'): ('+terms.join(' + ').replaceAll('+ -','− ')+') / '+div+' = '+(terms.reduce((a,b)=>a+b,0)/div).toLocaleString('cs',{maximumFractionDigits:2})+'.';
},'U symetrického jádra otočení nic nezmění. Přepni na rozdílovou masku: korelace a konvoluce mají na téže hraně opačné znaménko. Záporná odezva se na černobílém displeji ořízne na černou.');
const box=document.querySelector('[data-indexed]');
for(const host of document.querySelectorAll('[data-continuous]')){
 // Linear pieces: left endpoint, right endpoint, left and right one-sided values.
 const shapes={
  wide:['Široký obdélník',[[0,2,1,1]]],box:['Úzký obdélník',[[0,1,1,1]]],
  ramp:['Rostoucí rampa',[[0,1,0,1]]],triangle:['Trojúhelník',[[0,1,0,1],[1,2,1,0]]],
  bipolar:['Kladný a záporný pulz',[[0,1,1,1],[1,2,-1,-1]]]
 };
 const options=Object.entries(shapes).map(([k,[name]])=>'<option value="'+k+'">'+name+'</option>').join('');
 host.insertAdjacentHTML('beforeend','<div class="controls"><label>Vstup f <select>'+options+'</select></label><label>Jádro g <select>'+options+'</select></label><button type="button" data-swap>Prohodit f ↔ g</button><button type="button" data-dir="-1">−0,25</button><label>Posun t <input type="range" min="-1" max="5" step="0.01" value="0.5"></label><button type="button" data-dir="1">+0,25</button></div><svg viewBox="0 0 620 283" style="display:block;width:min(100%,800px);touch-action:none;cursor:ew-resize" role="img" aria-label="Překryv funkcí, orientovaná plocha součinu a graf konvoluce"></svg><output aria-live="polite"></output><small>Posuň t jezdcem, tažením v grafu nebo po krocích. Plocha pod osou se odečítá. Zkus funkce prohodit: překryv vypadá jinak, ale výsledná konvoluce zůstane stejná.</small>');
 const [fs,gs]=host.querySelectorAll('select'),svg=host.querySelector('svg'),slider=host.querySelector('input'),out=host.querySelector('output');
 fs.value='wide';gs.value=host.dataset.continuous;
 const X=x=>42+(x+3)*67,pts=p=>p.map(v=>v.join(',')).join(' '),line=(p,c)=>'<polyline points="'+pts(p)+'" fill="none" stroke="'+c+'" stroke-width="2.5"/>',label=(x,y,s)=>'<text x="'+x+'" y="'+y+'" font-size="12" fill="#263e47">'+s+'</text>';
 const value=([a,b,u,v],x)=>u+(x-a)*(v-u)/(b-a);
 function overlap(t,visit){
  for(const f of shapes[fs.value][1])for(const g of shapes[gs.value][1]){
   const a=Math.max(f[0],t-g[1]),b=Math.min(f[1],t-g[0]);
   if(b>a)visit(a,b,x=>value(f,x)*value(g,t-x));
  }
 }
 function area(t){let sum=0;overlap(t,(a,b,h)=>{sum+=(b-a)*(h(a)+4*h((a+b)/2)+h(b))/6});return sum}
 let curve='';
 function draw(){const t=+slider.value;
  let h='';for(const [y,title] of [[49,'①  Vstup f(τ) · zeleně     |     Převrácené a posunuté jádro g(t − τ) · oranžově'],[145,'②  Součin: kladná a záporná plocha'],[238,'③  Konvoluce (f ∗ g)(t)']]){
   h+=label(5,y-36,title)+line([[X(-3),y],[X(5),y]],'#adbcbe')+label(592,y+4,y===238?'t':'τ');
   for(let i=-3;i<=5;i++)h+=label(X(i)-3,y+14,i);
  }
  function signal(parts,color){const p=[[X(-3),49]];for(const [a,b,u,v] of parts)p.push([X(a),49],[X(a),49-25*u],[X(b),49-25*v],[X(b),49]);p.push([X(5),49]);h+=line(p,color)}
  signal(shapes[fs.value][1],'#08776c');signal(shapes[gs.value][1].map(([a,b,u,v])=>[t-b,t-a,v,u]).reverse(),'#bf6314');
  overlap(t,(a,b,v)=>{const p=Array.from({length:25},(_,i)=>{const x=a+(b-a)*i/24;return [X(x),145-25*v(x)]});
   const c=v((a+b)/2)<0?'#b65040':'#08776c';h+='<polygon points="'+pts([[X(a),145],...p,[X(b),145]])+'" fill="'+c+'" opacity=".32"/>'+line(p,c)});
  const y=area(t);h+=curve+'<circle cx="'+X(t)+'" cy="'+(238-17*y)+'" r="5" fill="#bf6314"/>';svg.innerHTML=h;
  const fmt=v=>(Math.abs(v)<.00005?0:v).toLocaleString('cs',{maximumFractionDigits:4});
  out.textContent='t = '+fmt(t)+' · Orientovaná plocha součinu = (f ∗ g)(t) = '+fmt(y)+'.';
  for(const btn of host.querySelectorAll('[data-dir]'))btn.disabled=btn.dataset.dir==='1'?t>=5:t<=-1;
 }
 function pair(){curve=line(Array.from({length:601},(_,i)=>{const t=-1+i/100;return [X(t),238-17*area(t)]}),'#265996');draw()}
 function set(t){slider.value=Math.min(5,Math.max(-1,t)).toFixed(2);draw()}
 for(const btn of host.querySelectorAll('[data-dir]'))btn.onclick=()=>set(+slider.value+Number(btn.dataset.dir)*.25);
 host.querySelector('[data-swap]').onclick=()=>{const f=fs.value;fs.value=gs.value;gs.value=f;pair()};
 function point(e){return new DOMPoint(e.clientX,e.clientY).matrixTransform(svg.getScreenCTM().inverse()).x/67}
 let anchor=0,start=0;svg.onpointerdown=e=>{anchor=point(e);start=+slider.value;svg.setPointerCapture(e.pointerId)};
 svg.onpointermove=e=>{if(svg.hasPointerCapture(e.pointerId))set(start+point(e)-anchor)};
 fs.onchange=gs.onchange=pair;slider.oninput=draw;pair();
}
{
 const host=document.querySelector('[data-clip]');
 if(host){
 const cases=[[[28,154],[378,38]],[[130,75],[260,130]],[[22,75],[75,155]],[[36,97],[125,13]],[[200,10],[200,192]],[[34,56],[370,56]]];
 host.innerHTML='<p>Přesuň modrý konec A nebo B a krokuj výpočet. Čtyři bity znamenají v pořadí <b>nahoře · dole · vpravo · vlevo</b>. Bod na hranici patří dovnitř.</p>'+select('preset','Příklad',['Průchod oknem','Oba konce uvnitř','Celá vlevo','Minutí rohu','Svislá úsečka','Po horní hraně','Vlastní'])+' <button data-back>← Zpět</button> <button data-next>Další krok →</button> <button data-first>Od začátku</button><svg viewBox="0 0 400 205" style="display:block;width:min(100%,650px);background:white;touch-action:none;margin:.5em auto" tabindex="0" aria-label="Úsečka a devět oblastí. Kliknutím přesuň bližší konec. Klávesou A nebo B zvol konec a šipkami ho posuň."></svg><output aria-live="polite"></output>';
 const svg=host.querySelector('svg'),out=host.querySelector('output'),preset=host.querySelector('select'),btn=q=>host.querySelector('[data-'+q+']');
 const code=([x,y])=>(y<56?8:0)|(y>150?4:0)|(x>290?2:0)|(x<100?1:0),bits=n=>n.toString(2).padStart(4,'0'),names={8:'horní',4:'dolní',2:'pravou',1:'levou'},fmt=p=>'('+p.map(x=>+x.toFixed(1)).join('; ')+')';
 let orig=cases[0].map(p=>p.slice()),index=0,steps=[],drag=null,selected=0;
 function rebuild(){let [a,b]=orig;steps=[];index=0;
  for(;;){const ca=code(a),cb=code(b),s={a,b,ca,cb};steps.push(s);
   if(!(ca|cb)){s.msg='Přijmi: oba konce leží v okně.';s.end='yes';break}
   if(ca&cb){s.msg='Zamítni: oba konce jsou za stejnou hranou.';s.end='no';break}
   const c=ca||cb,edge=[8,4,2,1].find(k=>c&k),vertical=edge<=2,j=vertical?0:1,h={8:56,4:150,1:100,2:290}[edge],t=(h-a[j])/(b[j]-a[j]);
   const p=a.map((x,k)=>k===j?h:x+t*(b[k]-x));s.p=p;s.edge=edge;s.msg='Ořízni '+(ca?'A':'B')+' přes '+names[edge]+' hranu: '+(vertical?'x':'y')+' = '+h+', průsečík P = '+fmt(p)+'. V dalším kroku nahradí P tento konec a jeho kód se přepočítá.';if(ca)a=p;else b=p;
  }draw()}
 const line=(a,b,c,w,d='')=>'<line x1="'+a[0]+'" y1="'+a[1]+'" x2="'+b[0]+'" y2="'+b[1]+'" stroke="'+c+'" stroke-width="'+w+'" stroke-dasharray="'+d+'"/>';
 function draw(){const s=steps[index];let h='<rect x="100" y="56" width="190" height="94" fill="#e2f1e9" stroke="#29695e"/>';
 for(const x of [100,290])h+=line([x,0],[x,205],'#9ba9a8',1,'3 3');for(const y of [56,150])h+=line([0,y],[400,y],'#9ba9a8',1,'3 3');
 for(const y of [19,107,187])for(const x of [48,194,350])h+='<text x="'+x+'" y="'+y+'" text-anchor="middle" font-size="11" fill="#506264">'+bits(code([x,y]))+'</text>';
 if(s.edge){const e=s.edge;h+=(e<=2?line([e===1?100:290,0],[e===1?100:290,205],'#c57619',2):line([0,e===8?56:150],[400,e===8?56:150],'#c57619',2))}
 h+=line(...orig,'#88969c',2,'4 3')+line(s.a,s.b,s.end==='no'?'#ad4634':s.end==='yes'?'#08765b':'#214f82',3);
 for(const [i,p] of [s.a,s.b].entries())h+='<circle cx="'+p[0]+'" cy="'+p[1]+'" r="5" fill="#214f82"/><text x="'+Math.min(385,p[0]+5)+'" y="'+Math.max(12,p[1]-6)+'" font-size="12">'+('AB'[i])+'</text>';
 if(s.p)h+='<circle cx="'+s.p[0]+'" cy="'+s.p[1]+'" r="6" fill="#ffa83a" stroke="#6e4200"/>';
 svg.innerHTML=h;out.textContent='Krok '+(index+1)+'/'+steps.length+' · A: '+bits(s.ca)+' · B: '+bits(s.cb)+' · OR: '+bits(s.ca|s.cb)+' · AND: '+bits(s.ca&s.cb)+'. '+s.msg;btn('back').disabled=!index;btn('next').disabled=index===steps.length-1;}
 btn('back').onclick=()=>{index--;draw()};btn('next').onclick=()=>{index++;draw()};btn('first').onclick=()=>{index=0;draw()};
 preset.onchange=()=>{if(cases[preset.selectedIndex])orig=cases[preset.selectedIndex].map(p=>p.slice());rebuild()};
 const point=e=>{const p=new DOMPoint(e.clientX,e.clientY).matrixTransform(svg.getScreenCTM().inverse());return [Math.round(p.x),Math.round(p.y)]};
 function move(p){orig[selected]=[Math.max(1,Math.min(399,p[0])),Math.max(1,Math.min(204,p[1]))];preset.selectedIndex=cases.length;rebuild()}
 svg.onpointerdown=e=>{const p=point(e);const dist=v=>Math.hypot(v[0]-p[0],v[1]-p[1]);selected=+(dist(orig[1])<dist(orig[0]));drag=e.pointerId;svg.setPointerCapture(drag);move(p)};
 svg.onpointermove=e=>{if(drag===e.pointerId)move(point(e))};svg.onlostpointercapture=()=>drag=null;
 svg.onkeydown=e=>{if('ab'.includes(e.key.toLowerCase())&&e.key.length===1){selected=+('b'===e.key.toLowerCase());return}const d={ArrowUp:[0,-2],ArrowDown:[0,2],ArrowLeft:[-2,0],ArrowRight:[2,0]}[e.key];if(d){e.preventDefault();e.stopPropagation();move(orig[selected].map((x,k)=>x+d[k]))}};rebuild();
 }
}
for(const host of document.querySelectorAll('[data-curves]')){
 const names={join:'Spojitost',bezier:'Bézier',spline:'B-splajn',nurbs:'NURBS'};
 host.innerHTML='<div class="curve-nav">'+Object.entries(names).map(([key,name])=>'<button type="button" data-kind="'+key+'">'+name+'</button>').join(' ')+'</div><p class="curve-question"></p><div class="curve-settings"></div><svg viewBox="0 0 420 165" role="img" aria-label="Křivka, řídicí body a geometrická konstrukce"></svg><output></output>';
 const svg=host.querySelector('svg'),settings=host.querySelector('.curve-settings'),result=host.querySelector('output');
 const mix=(p,q,t)=>p.map((v,i)=>v+(q[i]-v)*t),path=(pts,color,width=2,dash='')=>'<polyline points="'+pts.map(p=>p.join(',')).join(' ')+'" fill="none" stroke="'+color+'" stroke-width="'+width+'" stroke-dasharray="'+dash+'"/>',dot=(p,c,r=4)=>'<circle cx="'+p[0]+'" cy="'+p[1]+'" r="'+r+'" fill="'+c+'"/>',linePts=(fn,n=100)=>Array.from({length:n+1},(_,i)=>fn(i/n)),green='#08766d',gold='#a95712',grey='#89999e',blue='#225593';
 const bez=(p,t)=>p.length===1?p[0]:bez(p.slice(1).map((q,i)=>mix(p[i],q,t)),t);
 let mode;
 function setup(key){
 mode=key;for(const b of host.querySelectorAll('[data-kind]'))b.setAttribute('aria-pressed',String(b.dataset.kind===key));
 host.querySelector('.curve-question').textContent={join:'Co se ve spoji změní, i když obě části vypadají hladce?',bezier:'Posuň parametr t. Oranžový bod získáme opakovaným dělením úseček ve stejném poměru.',spline:'Posuň oranžový řídicí bod. Která část kvadratického B-splajnu zůstane přesně na místě?',nurbs:'Řídicí body se nehýbou. Změň jen váhu prostředního bodu a porovnej výsledek s čárkovanou čtvrtkružnicí.'}[key];
 settings.innerHTML=key==='join'?select('level','Podmínka ve spoji',['C⁰: společný bod','G¹: společný směr','C¹: stejná rychlost','C²: stejné zrychlení']):key==='bezier'?range('t','Parametr t (%)',0,100,50):key==='spline'?range('dy','Posun bodu nahoru',0,80,45):range('weight','Váha w (v % jednotkové váhy)',10,250,100)+' <button type="button" class="exact">Přesná čtvrtkružnice</button>';
 if(key==='nurbs'){const slider=settings.querySelector('input');slider.step='any';settings.querySelector('button').onclick=()=>{slider.value=100*Math.SQRT1_2;draw(Math.SQRT1_2)}}
 draw();
 }
 function draw(exact){
 let html='',msg='',inp=settings.querySelector('input');
 if(mode==='join'){
 const k=settings.querySelector('select').selectedIndex,A=[[20,140],[70,30],[130,100],[200,100]],B=[A[3],[[255,45],[245,100],[270,100],[270,100]][k],k===3?[350,30]:[330,135],[400,60]];
 html=path(A,grey,1,'3 3')+path(B,grey,1,'3 3')+path(linePts(t=>bez(A,t)),blue,3)+path(linePts(t=>bez(B,t)),green,3)+path([A[2],A[3],B[1]],gold,2)+[...A,...B].map(p=>dot(p,gold,3)).join('');
 const diff=(p,q)=>Math.hypot(...p.map((v,i)=>v-q[i])),v=(p,j)=>p[j+1].map((x,i)=>3*(x-p[j][i])),a=(p,j)=>p[j].map((x,i)=>6*(x-2*p[j+1][i]+p[j+2][i]));
 msg=['C⁰: poloha navazuje, ale tečna mění směr.','G¹: směr souhlasí, délky tečen ne. Pohyb při stejném tempu parametru skokově zpomalí.','C¹: rychlostní vektory souhlasí, zrychlení se ještě liší.','C²: souhlasí poloha, rychlost i zrychlení.'][k]+' Rozdíl prvních derivací: '+Math.round(diff(v(A,2),v(B,0)))+'; druhých: '+Math.round(diff(a(A,1),a(B,0)))+' (normy, oba úseky mají parametr 0 až 1).';
 }else if(mode==='bezier'){
 const P=[[25,135],[105,10],[250,12],[393,135]],t=+inp.value/100,Q=P.slice(1).map((p,i)=>mix(P[i],p,t)),R=Q.slice(1).map((p,i)=>mix(Q[i],p,t));
 html=path(P,grey,1,'3 3')+path(linePts(t=>bez(P,t)),green,3)+path(Q,blue)+path(R,gold)+P.map(p=>dot(p,grey)).join('')+Q.map(p=>dot(p,blue)).join('')+R.map(p=>dot(p,gold)).join('')+dot(mix(...R,t),gold,6);msg='t = '+t.toLocaleString('cs')+' · de Casteljau: 4 řídicí body → 3 body → 2 body → bod na křivce.';
 }else if(mode==='spline'){
 const P=[[15,120],[70,30],[125,110],[192,125],[260,90],[330,35],[404,110]],K=[0,0,0,1,2,3,4,5,5,5];
 function N(i,d,u){if(!d)return +(K[i]<=u&&u<K[i+1]);const a=K[i+d]-K[i],b=K[i+d+1]-K[i+1];return (a?(u-K[i])/a*N(i,d-1,u):0)+(b?(K[i+d+1]-u)/b*N(i+1,d-1,u):0)}
 function curve(u){if(u===5)return P.at(-1);return [0,1].map(k=>P.reduce((s,p,i)=>s+N(i,2,u)*p[k],0))}
 html=path(linePts(t=>curve(5*t)),grey,3,'4 3');P[3][1]-=+inp.value;html+=path(P,grey,1,'3 3')+path(linePts(t=>curve(t*5)),green,3)+path(linePts(t=>curve(1+3*t)),gold,3)+P.map((p,i)=>dot(p,i===3?gold:grey)).join('');
 msg='Posun: '+inp.value+'. Oranžově je interval 1 < u < 4, na němž má čtvrtý bod nenulovou váhu. Zelené konce se nemění.';
 }else{
 const w=typeof exact==='number'?exact:+inp.value/100,P=[[140,142],[140,22],[260,22]];
 html=path(P,grey,1)+path(linePts(t=>[260-120*Math.cos(t*Math.PI/2),142-120*Math.sin(t*Math.PI/2)]),grey,3,'4 3')+path(linePts(t=>{const b=[(1-t)**2,2*w*t*(1-t),t*t];return [0,1].map(k=>b.reduce((s,v,i)=>s+v*P[i][k],0)/(b[0]+b[1]+b[2]))}),green,3)+P.map((p,i)=>dot(p,i===1?gold:grey)).join('');
 msg='Krajní váhy = 1, prostřední w = '+(w===Math.SQRT1_2?'1/√2 ≈ 0,7071 (přesný oblouk)':w.toLocaleString('cs'))+'. Vyšší váha přitahuje křivku k oranžovému bodu. Jde o jeden kvadratický úsek NURBS s uzly (0, 0, 0, 1, 1, 1).';
 }
 svg.innerHTML=html;result.textContent=msg;
 }
 settings.oninput=()=>draw();host.querySelector('.curve-nav').onclick=e=>{if(e.target.dataset.kind)setup(e.target.dataset.kind)};setup(host.dataset.curves);
}
if(box){
 const {w,h,colors,pixels,bytes}=JSON.parse(box.querySelector('.idx-data').textContent),grid=box.querySelector('.idx-grid'),pal=box.querySelector('.idx-palette'),photo=box.querySelector('.idx-photo'),fmt=n=>n.toLocaleString('cs');
 pal.innerHTML=colors.map((c,i)=>'<div><b>'+i+'</b> <i style="background:rgb('+c+')"></i> '+c.join(', ')+'</div>').join('');
 grid.style.gridTemplateColumns='repeat('+w+',1fr)';grid.innerHTML=pixels.map(i=>'<span>'+i+'</span>').join('');
 let active=0;
 function pick(n){grid.children[active].classList.remove('selected');pal.children[pixels[active]].classList.remove('selected');active=n;grid.children[n].classList.add('selected');pal.children[pixels[n]].classList.add('selected');box.querySelector('.idx-read').textContent='Pixel ('+(n%w)+', '+Math.floor(n/w)+') obsahuje index '+pixels[n]+' → v paletě RGB ('+colors[pixels[n]].join(', ')+').';}
 function at(e){const r=e.currentTarget.getBoundingClientRect();pick(Math.min(h-1,Math.max(0,Math.floor((e.clientY-r.top)*h/r.height)))*w+Math.min(w-1,Math.max(0,Math.floor((e.clientX-r.left)*w/r.width))));}
 for(const el of [photo,grid]){el.onpointermove=at;el.onclick=at}
 grid.onkeydown=e=>{const step={ArrowLeft:-1,ArrowRight:1,ArrowUp:-w,ArrowDown:w}[e.key];if(step){e.stopPropagation();e.preventDefault();pick(Math.max(0,Math.min(w*h-1,active+step)))}};
 const raw=w*h*3,packed=w*h*3/8,palette=3*colors.length;
 box.querySelector('.idx-bytes').innerHTML='<b>RGB: '+fmt(raw)+' B.</b> Při těsném uložení stačí pro 8 barev 3 bity na pixel: '+packed+' B indexů + '+palette+' B palety = '+(packed+palette)+' B. <strong>Úspora '+fmt(raw-packed-palette)+' B ('+Math.round(100*(1-(packed+palette)/raw))+' %).</strong><br><small>Srovnáváme stejný osmibarevný obraz bez komprese. Skutečný GIF včetně hlaviček, palety a komprese LZW má '+bytes+' B.</small>';
 pick(Math.floor(h/2)*w+Math.floor(w/2));
}
})();
