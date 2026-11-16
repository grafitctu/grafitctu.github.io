'use strict';
(()=>{
const $=s=>document.querySelector(s),scene=$('#scene'),tree=$('#tree'),slider=$('#cap');
const hints={quad:'Kliknutím přidej bod. Jakmile list překročí kapacitu, rozdělí se přesně uprostřed na čtyři kvadranty, včetně prázdných.',kd:'Stejné body, jiné dělení: každý řez rozdělí buňku na dvě části. Střídáme osy x a y a řežeme mezi body co nejblíže mediánu. Při přidání bodu se strom přepočítá.',bvh:'Kliknutím přidej objekt. Nerozdělujeme prostor: rozdělíme objekty podle středů na nejdelší ose jejich rozložení. Každá skupina dostane těsný osově zarovnaný obdélník. Sourozenecké obálky se mohou překrývat.'};
let mode='quad',points=[],objects=[],cursor=[200,120],keyboard=false,nodes=[],root;
function item(x,y,k){return {x,y,rx:[11,18,9,14][k%4],ry:[8,7,15,12][k%4]}}
objects=[[72,66],[91,82],[105,46],[240,120],[250,130],[290,164]].map(([x,y],i)=>item(x,y,i));
function build(items,box,depth=0){
 const n={items,box,depth,id:nodes.length,ch:[]};nodes.push(n);
 if(mode==='bvh'&&items.length)n.box=[Math.min(...items.map(v=>v.x-v.rx)),Math.min(...items.map(v=>v.y-v.ry)),Math.max(...items.map(v=>v.x+v.rx)),Math.max(...items.map(v=>v.y+v.ry))];
 if(items.length<=+slider.value)return n;
 let [l,t,r,b]=box;
 if(mode==='quad'){
  const x=(l+r)/2,y=(t+b)/2,groups=[[],[],[],[]];
  items.forEach(v=>groups[+(v.x>=x)+2*(v.y>=y)].push(v));
  n.ch=[[l,t,x,y],[x,t,r,y],[l,y,x,b],[x,y,r,b]].map((box,i)=>build(groups[i],box,depth+1));
 }else{
  let axis=depth%2?'y':'x';
  const span=a=>Math.max(...items.map(v=>v[a]))-Math.min(...items.map(v=>v[a]));
  if(mode==='bvh')axis=span('x')>=span('y')?'x':'y';else if(!span(axis))axis=axis==='x'?'y':'x';
  const sorted=items.slice().sort((a,b)=>a[axis]-b[axis]);let k=Math.floor(sorted.length/2);
  if(mode==='kd'){
   let best=Infinity;for(let j=1;j<sorted.length;j++)if(sorted[j-1][axis]<sorted[j][axis]&&Math.abs(j-sorted.length/2)<best){best=Math.abs(j-sorted.length/2);k=j}
  }
  n.axis=axis;const cut=(sorted[k-1][axis]+sorted[k][axis])/2;
  let boxes=axis==='x'?[[l,t,cut,b],[cut,t,r,b]]:[[l,t,r,cut],[l,cut,r,b]];
  n.ch=[sorted.slice(0,k),sorted.slice(k)].map((g,i)=>build(g,boxes[i],depth+1));
 }return n;
}
function rect(b,attr){return '<rect x="'+b[0]+'" y="'+b[1]+'" width="'+(b[2]-b[0])+'" height="'+(b[3]-b[1])+'" '+attr+'/>'}
function drawScene(active){
 let bvh=mode==='bvh',n=nodes[active],parts=[];
 if(n)parts.push(rect(n.box,'fill="#ffedce"'));
 for(const v of root.items){let marked=n?.items.includes(v);parts.push(bvh?'<ellipse cx="'+v.x+'" cy="'+v.y+'" rx="'+v.rx+'" ry="'+v.ry+'" fill="'+(marked?'#e98c35':'#92bcba')+'"/>':'<circle cx="'+v.x+'" cy="'+v.y+'" r="3" fill="'+(marked?'#ae5000':'#184a62')+'"/>')}
 for(const a of nodes)parts.push(rect(a.box,'class="cut" stroke-width="'+(bvh?1.7:0.7)+'"'+(bvh&&a.ch.length?' stroke-dasharray="5 2"':'')));
 if(n)parts.push(rect(n.box,'fill="none" stroke="#a75200" stroke-width="2.5"'));
 if(keyboard){let [x,y]=cursor;parts.push('<path d="M'+(x-5)+' '+y+'h10 M'+x+' '+(y-5)+'v10" stroke="#b90"/>')}
 scene.innerHTML=parts.join('');
}
function render(){
 nodes=[];root=build(mode==='bvh'?objects:points,[0,0,400,240]);drawScene(null);
 let leaves=0,maxDepth=0,edges=[],marks=[];
 function layout(n){maxDepth=Math.max(maxDepth,n.depth);if(n.ch.length){n.ch.forEach(layout);n.tx=(n.ch[0].tx+n.ch.at(-1).tx)/2}else n.tx=23+44*leaves++;
  n.ty=24+42*n.depth;for(const c of n.ch)edges.push('<path class="branch" d="M'+n.tx+' '+n.ty+'V'+(n.ty+20)+'H'+c.tx+'V'+c.ty+'"/>');}
 layout(root);const W=Math.max(130,leaves*44),H=Math.max(100,48+42*maxDepth);
 tree.setAttribute('viewBox','0 0 '+W+' '+H);tree.style.minWidth=W+'px';tree.style.height=Math.max(130,H)+'px';
 for(const n of nodes){const label=!n.ch.length?n.items.length:mode==='quad'?'4×':mode==='kd'?n.axis:'box';
  marks.push('<g class="node" tabindex="0" data-id="'+n.id+'" data-leaf="'+!n.ch.length+'" aria-label="Hloubka '+n.depth+', počet prvků '+n.items.length+'" transform="translate('+n.tx+' '+n.ty+')"><rect x="-16" y="-10" width="32" height="20" rx="5"/><text text-anchor="middle" y="4">'+label+'</text></g>')}
 tree.innerHTML=edges.join('')+marks.join('');$('#hint').textContent=hints[mode];$('#caplabel').textContent='Maximální počet '+(mode==='bvh'?'objektů':'bodů')+' na list';
 $('output').value=slider.value;$('#stats').textContent='Prvků: '+root.items.length+' · listů: '+leaves+' · hloubka: '+maxDepth;
}
function insert(x,y){x=Math.round(x);y=Math.round(y);if(mode==='bvh')objects.push(item(Math.min(381,Math.max(19,x)),Math.min(224,Math.max(16,y)),objects.length));else if(!points.some(p=>p.x===x&&p.y===y))points.push({x,y});render()}
scene.onclick=e=>{keyboard=false;const p=new DOMPoint(e.clientX,e.clientY).matrixTransform(scene.getScreenCTM().inverse());insert(p.x,p.y)};
scene.onkeydown=e=>{let d={ArrowUp:[0,-5],ArrowDown:[0,5],ArrowLeft:[-5,0],ArrowRight:[5,0]}[e.key];if(!d&&e.key!=='Enter')return;e.preventDefault();keyboard=true;if(!d)return insert(...cursor);cursor=[Math.max(0,Math.min(400,cursor[0]+d[0])),Math.max(0,Math.min(240,cursor[1]+d[1]))];drawScene(null)};
function select(e){const el=e.target.closest('.node');tree.querySelector('.active')?.classList.remove('active');el?.classList.add('active');drawScene(el?+el.dataset.id:null)}
for(const ev of ['pointerover','focusin','click'])tree.addEventListener(ev,select);
function clear(){tree.querySelector('.active')?.classList.remove('active');drawScene(null)}
tree.addEventListener('pointerleave',()=>tree.contains(document.activeElement)?select({target:document.activeElement}):clear());
tree.addEventListener('focusout',clear);
document.querySelectorAll('[data-mode]').forEach(button=>button.onclick=()=>{mode=button.dataset.mode;if(mode==='kd'&&!points.length)points=[[52,34],[79,88],[111,150],[128,57],[250,45],[295,145],[320,92]].map(([x,y])=>({x,y}));document.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));render()});
slider.oninput=render;render();
})();
