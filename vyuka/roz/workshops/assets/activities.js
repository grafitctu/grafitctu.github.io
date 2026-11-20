window.setupWorkshop=()=>{
  'use strict';
  const {$,t,num,pc,text,smallTable,listen,params,className}=RozUI;
  const M=RozMachine, teal='#08796b',orange='#b95929',ink='#233f48';
  const colors=['#30789d','#e29a42','#15917d','#b25e85','#8374ac','#6f8140'];
  const onLanguage=fn=>document.addEventListener('roz-language',fn);
  function selectedPatch(){
    const select=$('sample-id'), n=CropData.rows.findIndex(r=>r.id===params.get('patch'));
    select.replaceChildren(...CropData.rows.map((r,i)=>new Option(r.id,i)));
    select.value=Math.max(0,n);return select;
  }
  function clear(canvas){const ctx=canvas.getContext('2d');ctx.fillStyle='#f4f6ef';ctx.fillRect(0,0,canvas.width,canvas.height);return ctx;}
  function dot(ctx,x,y,color,r=3){ctx.fillStyle=color;ctx.beginPath();ctx.arc(x,y,r,0,2*Math.PI);ctx.fill();}
  function line(ctx,x,y,xx,yy,color,width=1){ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(xx,yy);ctx.stroke();}
  function mark(ctx,x,y){line(ctx,x-7,y,x+7,y,'white',3);line(ctx,x,y-7,x,y+7,'white',3);line(ctx,x-7,y,x+7,y,'#182d36');line(ctx,x,y-7,x,y+7,'#182d36');}

  function labels(){
    let current=null,token=0,swapped=false;
    async function readImage(uri){
      const im=new Image();im.src=uri;await im.decode();
      const c=document.createElement('canvas');c.width=im.width;c.height=im.height;
      const g=c.getContext('2d');g.drawImage(im,0,0);
      return {im,rgba:g.getImageData(0,0,c.width,c.height).data};
    }
    function colourCanvas(values,raw){
      const c=document.createElement('canvas');c.width=c.height=512;
      const g=c.getContext('2d'),buf=g.createImageData(512,512),palette=[[50,116,161],[229,153,60],[30,152,123],[166,95,153]];
      values.forEach((v,i)=>{const rgb=raw?[v,v,v]:palette[v%palette.length];buf.data.set(rgb,4*i);buf.data[i*4+3]=255;});
      g.putImageData(buf,0,0);return c;
    }
    function showPixel(){
      if(!current)return;
      const x=+$('col').value,y=+$('row').value,i=512*y+x;
      text('col-val',x);text('row-val',y);
      for(const [id,image] of [['input',current.source.im],['pred',current.predImage],['truth',current.truthImage]]){
        const g=$(id).getContext('2d');g.drawImage(image,0,0);mark(g,x,y);
      }
      text('pixel','('+x+', '+y+') · RGB = ('+Array.from(current.source.rgba.slice(i*4,i*4+3)).join(', ')+') · SEG = '+current.pred[i]+' · GT = '+current.gt[i]);
      text('label-score','CS '+pc(current.scores.cs)+' · CA '+pc(current.scores.ca)+' · '+t('počet pixelů ','pixels ')+current.gt.length.toLocaleString());
    }
    function recalc(){
      if(!current)return;
      const keys=[...new Set(current.base)].sort((a,b)=>a-b);
      current.pred=Uint8Array.from(current.base,v=>swapped?(v===keys[0]?keys[1]:v===keys[1]?keys[0]:v):v);
      current.scores=M.mapScores(current.gt,current.pred);
      current.predImage=colourCanvas(current.pred,$('palette').value==='raw');
      $('swap').setAttribute('aria-pressed',String(swapped));showPixel();
    }
    async function load(){
      const turn=++token, rec=LabMaps[$('mosaic').value];current=null;swapped=false;
      const [source,truth,pred]=await Promise.all([rec.rgb,rec.gt,rec.seg].map(readImage));
      if(turn!==token)return;
      const plane=img=>Uint8Array.from({length:512*512},(_,i)=>img.rgba[4*i]);
      const gt=plane(truth);
      current={source,gt,base:plane(pred),truthImage:colourCanvas(gt,false)};recalc();
    }
    for(const id of ['input','pred','truth'])$(id).onclick=e=>{
      const rect=e.currentTarget.getBoundingClientRect();
      $('col').value=Math.min(511,Math.floor((e.clientX-rect.left)*512/rect.width));
      $('row').value=Math.min(511,Math.floor((e.clientY-rect.top)*512/rect.height));showPixel();
    };
    $('mosaic').onchange=load;$('palette').onchange=recalc;$('swap').onclick=()=>{swapped=!swapped;recalc();};
    listen(['col','row'],showPixel);onLanguage(showPixel);load();
  }

  function texture(){
    const picker=selectedPatch();
    if(!params.has('patch'))$('pattern').value='vertical';
    if(['x','y'].includes(params.get('dir')))$('dir').value=params.get('dir');
    const initialOffset=Number(params.get('offset'));
    if(Number.isInteger(initialOffset)&&initialOffset>=1&&initialOffset<=8)$('offset').value=initialOffset;
    const side=64, clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
    let selected=[0,0],anchor=32*side+32,matches=[];

    function magnify(q,ax,ay,bx,by){
      const c=$('pair-zoom'),g=c.getContext('2d'),cells=11,step=c.width/cells;
      const left=clamp(Math.floor((ax+bx)/2)-5,0,side-cells);
      const top=clamp(Math.floor((ay+by)/2)-5,0,side-cells);
      g.textAlign='center';g.textBaseline='middle';
      for(let r=0;r<cells;r++)for(let col=0;col<cells;col++){
        const x=left+col,y=top+r,a=q[y*side+x],v=85*a;
        const xx=col*step,yy=r*step,start=x===ax&&y===ay,end=x===bx&&y===by;
        g.fillStyle='rgb('+[v,v,v].join(',')+')';g.fillRect(xx,yy,step,step);
        g.strokeStyle=a<2?'#626967':'#b8c0bd';g.lineWidth=.6;g.strokeRect(xx+.5,yy+.5,step-1,step-1);
        g.fillStyle=a<2?'white':'#172b30';g.font='12px sans-serif';
        const labelled=start||end;
        g.fillText(String(a),xx+step*(labelled ? 0.67 : 0.5),yy+step*(labelled ? 0.7 : 0.53));
        if(start||end){
          g.lineWidth=2.6;g.strokeStyle=start?'#ff923a':'#00c4c9';g.strokeRect(xx+1.5,yy+1.5,step-3,step-3);
          g.fillStyle=g.strokeStyle;g.fillRect(xx,yy,12,12);
          g.fillStyle='#14272a';g.font='bold 10px sans-serif';g.fillText(start?'A':'B',xx+6,yy+6.5);
        }
      }
    }
    function draw(action){
      const d=+$('offset').value,vertical=$('dir').value==='y',kind=$('pattern').value;
      const q=kind==='real'?M.cropLevels(CropLevels[+picker.value]):
        Uint8Array.from({length:4096},(_,i)=>Math.floor((kind==='vertical'?i%64:Math.floor(i/64))/2)%2*3);
      const dx=vertical?0:d,dy=vertical?d:0;
      const neighbour=idx=>idx%side+dx<side&&Math.floor(idx/side)+dy<side?idx+dy*side+dx:-1;
      if(action==='pick'&&neighbour(anchor)!==-1)selected=[q[anchor],q[neighbour(anchor)]];
      const c=$('grey'),g=c.getContext('2d'),buf=g.createImageData(side,side);
      const counts=Array.from({length:4},()=>[0,0,0,0]),hist=[0,0,0,0];
      let total=0,contr=0;matches=[];
      q.forEach((a,idx)=>{
        hist[a]++;let highlight=false;
        const other=neighbour(idx);
        if(other!==-1){
          const b=q[other];counts[a][b]++;total++;contr+=(a-b)**2;
          highlight=a===selected[0]&&b===selected[1];
          if(highlight)matches.push(idx);
        }
        buf.data.set(highlight?[238,128,60,255]:[85*a,85*a,85*a,255],idx*4);
      });
      if(action==='match'&&matches.length){
        const distance=idx=>(idx%side-anchor%side)**2+(Math.floor(idx/side)-Math.floor(anchor/side))**2;
        anchor=matches.reduce((best,idx)=>distance(idx)<distance(best)?idx:best);
      }
      const ax=anchor%side,ay=Math.floor(anchor/side),bx=ax+dx,by=ay+dy,target=neighbour(anchor);
      const sm=document.createElement('canvas');sm.width=sm.height=side;sm.getContext('2d').putImageData(buf,0,0);
      g.imageSmoothingEnabled=false;g.drawImage(sm,0,0,c.width,c.height);
      function outline(x,y,color){
        const step=c.width/side;
        g.strokeStyle='#172b30';g.lineWidth=3;g.strokeRect(x*step,y*step,step,step);
        g.strokeStyle=color;g.lineWidth=1.5;g.strokeRect(x*step,y*step,step,step);
      }
      outline(ax,ay,'#ffbd70');if(target!==-1)outline(bx,by,'#00e3e5');
      magnify(q,ax,ay,bx,by);
      const table=$('glcm');smallTable(table,['i ↓ / j →','0','1','2','3'],counts.map((row,i)=>[i,...row]));
      counts.forEach((row,i)=>row.forEach((v,j)=>{
        const cell=table.tBodies[0].rows[i].cells[j+1],button=document.createElement('button');button.type='button';button.textContent=v;
        button.setAttribute('aria-pressed',String(selected[0]===i&&selected[1]===j));
        button.setAttribute('aria-label','C['+i+','+j+'] = '+v);
        button.onclick=()=>{selected=[i,j];draw('match');table.tBodies[0].rows[i].cells[j+1].firstChild.focus({preventScroll:true});};
        cell.replaceChildren(button);
      }));
      const [i,j]=selected,n=counts[i][j];
      $('next-pair').disabled=matches.length<2;
      const levels=i+' → '+j;
      const step=vertical?t('dolů','down'):t('vpravo','right');
      const edge=vertical?t('dolního','bottom'):t('pravého','right');
      const coords=(x,y)=>'('+x+', '+y+')';
      text('pair-readout',target<0?
        t('A v ','A at ')+coords(ax,ay)+t(' má souseda mimo výřez. Tento začátek se při daném posunu vynechá.',' has its neighbour outside the patch. This start is skipped at this offset.'):
        'A '+coords(ax,ay)+' = '+q[anchor]+'   →   B '+coords(bx,by)+' = '+q[target]+'. '+
        t('Tato dvojice přičte 1 do buňky ','This pair adds 1 to cell ')+'C['+q[anchor]+','+q[target]+'].'+
        (q[anchor]===i&&q[target]===j?'':t(' Oranžová na celém výřezu dál ukazuje dvojice ',' Orange on the whole patch still marks pairs ')+levels+'.'));
      text('glcm-explain',t('Hledaná dvojice ','Selected pair ')+levels+' · '+d+' px '+step+'. '+
        t('Počet oranžových začátků','Orange starting pixels')+' = '+n+'. '+
        t('Počet všech platných dvojic','All valid pairs')+' = 64 × (64 − '+d+') = '+total+'. '+
        t('V pásu u '+edge+' okraje o šířce '+d+' px leží soused už mimo výřez.',
          'In the '+d+' px strip along the '+edge+' edge, the neighbour falls outside the patch.'));
      text('offset-val',d);text('glcm-value','C['+i+','+j+'] = '+n+' · P = '+n+'/'+total+' = '+num(n/total,4)+' · '+t('kontrast','contrast')+' = '+num(contr/total,5));
      text('histogram','Histogram = ['+hist.join(', ')+'] · '+t('příspěvek vybrané buňky','selected cell contribution')+' = '+num((i-j)**2*n/total,5));
    }
    $('next-pair').onclick=()=>{anchor=matches.find(idx=>idx>anchor)??matches[0];draw();};
    $('grey').onclick=e=>{
      const rect=e.currentTarget.getBoundingClientRect();
      const pixel=(pos,start,dim)=>clamp(Math.floor((pos-start)*side/dim),0,side-1);
      anchor=pixel(e.clientY,rect.top,rect.height)*side+pixel(e.clientX,rect.left,rect.width);draw('pick');
    };
    $('grey').onkeydown=e=>{
      const move={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[e.key];
      if(!move)return;e.preventDefault();
      anchor=clamp(Math.floor(anchor/side)+move[1],0,side-1)*side+clamp(anchor%side+move[0],0,side-1);draw('pick');
    };
    function shape(){
      const dx=+$('move').value,turn=+$('turn').value;
      const points=FeatureMath.moveMask(FeatureMath.masks.elbow,turn,1,dx,1);
      const m=FeatureMath.moments(points);
      const g=clear($('shape')),s=21;
      for(const [x,y] of points){g.fillStyle=teal;g.fillRect(12+s*x,15+s*y,s-1,s-1);}
      dot(g,12+(m.centroid[0]+.5)*s,15+(m.centroid[1]+.5)*s,orange,5);
      text('move-val',dx);text('turn-val',turn*90+'°');
      text('hu','m₁₀ = '+m.m10+' · '+t('těžiště','centroid')+' = ('+m.centroid.map(v=>num(v)).join(' / ')+') · φ₁ = '+num(m.hu[0],5));
    }
    picker.onchange=()=>{$('pattern').value='real';draw('match');};
    $('pattern').onchange=()=>draw('match');
    listen(['dir','offset'],draw);listen(['move','turn'],shape);onLanguage(()=>{draw();shape();});draw('match');shape();
  }

  function pca(){
    const rows=CropData.rows.filter(r=>r.origin!==0),stats=FeatureMath.covariance(rows.map(r=>r.f.slice(0,2)));
    const mu=[0,1,2].map(j=>rows.reduce((s,r)=>s+r.f[j],0)/rows.length);
    const cov=mu.map((m,i)=>mu.map((n,j)=>rows.reduce((v,r)=>v+(r.f[i]-m)*(r.f[j]-n),0)/(rows.length-1)));
    const max=Math.max(...stats.centered.flat().map(Math.abs))*1.08;
    let angle=0,shown=false;
    function draw(){
      const c=$('cloud'),g=clear(c),s=(c.height-40)/(2*max),cx=c.width/2,cy=c.height/2;
      line(g,20,cy,c.width-20,cy,'#9bb3ae');line(g,cx,10,cx,c.height-12,'#9bb3ae');
      stats.centered.forEach(([x,y],i)=>dot(g,cx+s*x,cy-s*y,colors[rows[i].c],2.3));
      const rad=angle*Math.PI/180,co=Math.cos(rad),si=Math.sin(rad),len=Math.min((cx-14)/(Math.abs(co)||1e-12),(cy-12)/(Math.abs(si)||1e-12));
      line(g,cx-co*len,cy+si*len,cx+co*len,cy-si*len,ink,2);
      const sample=stats.centered[0],scalar=sample[0]*co+sample[1]*si;
      line(g,cx+s*sample[0],cy-s*sample[1],cx+s*scalar*co,cy-s*scalar*si,orange,2);
      dot(g,cx+s*scalar*co,cy-s*scalar*si,orange,5);
      g.fillStyle=ink;g.font='13px sans-serif';g.fillText('R − μR',c.width-62,cy-8);g.fillText('G − μG',cx+6,16);
      const variance=FeatureMath.projection(stats,rad).variance;
      smallTable($('cov3'),['C','R','G','B'],cov.map((r,i)=>['RGB'[i],...r.map(x=>num(x,1))]));
      text('angle-val',num(angle,2)+'°');text('pca-numbers',t('Rozptyl projekcí','Projection variance')+' = '+num(variance)+' · n = '+rows.length);
      const v=stats.eigen.axes[0],eig=stats.eigen.values;
      text('eigen',shown?'PC1 = ('+v.map(x=>num(x,4)).join(' / ')+') · λ₁ = '+num(eig[0])+' · λ₂ = '+num(eig[1])+' · λ₁/(λ₁+λ₂) = '+pc(eig[0]/(eig[0]+eig[1])):
        t('Otočte osu k největšímu rozptylu a potom si ověřte vlastní směr. Oranžová úsečka ukazuje průmět jednoho bodu.','Turn the axis towards the highest variance, then check the eigendirection. The orange line shows the projection of one point.'));
    }
    function maps(){
      const k=$('keep').value,scene=SegExamples.scenes['tm1_1_1.png'],row=scene.m[k];
      $('pca-src').src=scene.source;$('pca-gt').src=scene.truth;$('pca-pred').src=row.image;
      text('keep-val',k);text('pca-score',t('Zachovaný rozptyl','Retained variance')+' '+pc(row.retained)+' · CS '+pc(row.cs)+' · CA '+pc(row.ca));
    }
    $('angle').oninput=()=>{angle=+$('angle').value;shown=false;draw();};
    $('pc1').onclick=()=>{angle=stats.eigen.angle*180/Math.PI;$('angle').value=angle;shown=true;draw();};
    $('keep').oninput=maps;onLanguage(()=>{draw();maps();});draw();maps();
  }

  function models(){
    const pts=[[1,1],[1.4,2],[2,1],[2,3],[6,5],[7,6],[8,5]];
    let centres,assignments,phase,iteration;
    function reset(){centres=[[1,1],[2,3]];assignments=[];phase='assign';iteration=0;draw();}
    function draw(){
      const c=$('km'),g=clear(c),x=v=>28+v*56,y=v=>275-v*38;
      pts.forEach((p,i)=>dot(g,x(p[0]),y(p[1]),assignments.length?colors[assignments[i]]:'#809997',7));
      centres.forEach(([a,b],j)=>{line(g,x(a)-8,y(b),x(a)+8,y(b),ink,3);line(g,x(a),y(b)-8,x(a),y(b)+8,ink,3);
        g.fillStyle=ink;g.font='14px sans-serif';g.fillText(String(j+1),x(a)+10,y(b)-7);});
      text('km-state',t('Přepočty středů','Centre updates')+': '+iteration+' · '+centres.map(p=>'('+p.map(v=>num(v,2)).join(' / ')+')').join('   ')+ ' · '+
        (phase==='done'?t('Přiřazení je stabilní.','Assignments are stable.'):phase==='assign'?t('Následuje přiřazení bodů.','Next assign the points.'):t('Následuje přepočet středů.','Next update the centres.')));
      $('step').disabled=phase==='done';
    }
    $('step').onclick=()=>{
      if(phase==='assign'){
        const next=pts.map(p=>M.squaredDistance(p,centres[0])<=M.squaredDistance(p,centres[1])?0:1);
        phase=next.every((v,i)=>v===assignments[i])?'done':'update';assignments=next;
      }else if(phase==='update'){
        centres=centres.map((old,i)=>{const group=pts.filter((_,j)=>assignments[j]===i);
          return group.length?[0,1].map(k=>group.reduce((s,p)=>s+p[k],0)/group.length):old;});
        iteration++;phase='assign';
      }
      draw();
    };
    $('reset').onclick=reset;
    const picker=selectedPatch(),data=CropData,run=M.folds(data.rows,'origin');
    function vote(){
      const idx=+picker.value,k=+$('vote-k').value,actual=data.rows[idx],m=run.models[actual.origin];
      const ranking=m.train.map(j=>[j,M.squaredDistance(m.z[idx],m.z[j])]).sort((a,b)=>a[1]-b[1]||(data.rows[a[0]].id<data.rows[b[0]].id?-1:1));
      const top=ranking.slice(0,k),counts=Array(6).fill(0);top.forEach(([j])=>counts[data.rows[j].c]++);
      const winner=data.rows[top.find(([j])=>counts[data.rows[j].c]===Math.max(...counts))[0]].c;
      const root=$('neighbours');root.replaceChildren();
      [[idx,0],...top].forEach(([j,d],pos)=>{
        const row=data.rows[j],f=document.createElement('figure'),im=new Image();im.src='data/'+row.file;im.alt=row.id;
        const cap=document.createElement('figcaption');cap.textContent=(pos?'#'+pos+' · d='+num(Math.sqrt(d),2):t('Test','Test'))+' · '+className(data.classes[row.c]);f.append(im,cap);root.append(f);
      });
      text('vote',t('Skutečnost','Truth')+': '+className(data.classes[actual.c])+' · '+t('předpověď','prediction')+': '+className(data.classes[winner])+' · '+counts[winner]+'/'+k);
    }
    listen(['sample-id','vote-k'],vote);onLanguage(()=>{draw();vote();});reset();vote();
  }

  function scores(){
    const truth=Array.from({length:16},(_,i)=>i%4<2?0:1);let predicted=truth.slice(),caseId=null;
    const target=$('target'),edit=$('editable');
    truth.forEach(v=>{const el=document.createElement('span');el.className='label-'+v;el.textContent=v?'B':'A';target.append(el);});
    function grid(){
      edit.replaceChildren();
      predicted.forEach((v,i)=>{const el=document.createElement('button');el.type='button';el.textContent=v?'B':'A';el.className='label-'+v;
        el.setAttribute('aria-label',t('Pixel ','Pixel ')+(i%4+1)+','+(Math.floor(i/4)+1)+' = '+el.textContent);
        el.onclick=()=>{predicted[i]=1-v;grid();edit.children[i].focus();};edit.append(el);});
      const r=M.mapScores(truth,predicted);
      smallTable($('overlaps'),[t('GT / SEG','GT / SEG'),...r.labs.map(v=>v?'B':'A')],r.matrix.map((row,i)=>[r.refs[i]?'B':'A',...row]));
      text('metric-values',t('Započteno v CS','Credited in CS')+': '+r.credited+'/16 · CS '+pc(r.cs)+' · CA '+pc(r.ca));
    }
    for(const id of ['perfect','renamed','merged','exchange'])$(id).onclick=()=>{
      predicted=truth.map(v=>id==='renamed'?1-v:id==='merged'?0:v);
      if(id==='exchange'){predicted[0]=1;predicted[2]=0;}grid();
    };
    function cases(reset=false){
      const key=$('metric').value,sort=SegExamples.paired.slice().sort((a,b)=>(a.b[key]-a.a[key])-(b.b[key]-b.a[key]));
      if(reset||!caseId)caseId=sort[0].tm;
      $('case-num').replaceChildren(...sort.map(r=>new Option(r.tm,r.tm)));$('case-num').value=caseId;
      const r=sort.find(x=>x.tm===caseId),deltas=sort.map(x=>x.b[key]-x.a[key]);
      const avg=m=>sort.reduce((s,x)=>s+x[m][key],0)/sort.length;
      text('aggregate',key.toUpperCase()+' · A '+pc(avg('a'))+' → B '+pc(avg('b'))+' · '+t('lepší / horší / stejné','better / worse / tied')+
        ': '+[deltas.filter(d=>d>1e-12).length,deltas.filter(d=>d< -1e-12).length,deltas.filter(d=>Math.abs(d)<=1e-12).length].join(' / '));
      text('case-score',r.tm+' · CS '+pc(r.a.cs)+' → '+pc(r.b.cs)+' · CA '+pc(r.a.ca)+' → '+pc(r.b.ca));
    }
    $('metric').onchange=()=>cases(true);$('case-num').onchange=()=>{caseId=$('case-num').value;cases();};
    onLanguage(()=>{grid();cases();});grid();cases();
  }

  function bio(){
    const descriptions={face:['Porovnejte nový snímek tváře s referenčním snímkem uživatele.','Compare a new face image with the user’s reference.'],
      voice:['Úlohou je ověřit mluvčího podle hlasu. Přepis věty řeší jinou otázku.','Verify who spoke using their voice. Transcribing the sentence addresses a different question.'],
      finger:['Porovnejte polohu a orientaci markantů dvou otisků.','Compare positions and orientations of minutiae in two impressions.'],
      iris:['Porovnejte texturu duhovky v prstenci kolem zornice.','Compare the iris texture in the annulus around the pupil.']};
    function draw(){
      const th=+$('threshold').value,pad=+$('pad-threshold').value,on=$('pad').checked;
      text('threshold-val',th);text('pad-threshold-val',pad);text('modality-note',t(...descriptions[$('modality').value]));
      const scores=FeatureMath.verification,r=FeatureMath.verificationErrors(th),a=FeatureMath.padErrors(th,pad,on);
      const c=$('bio-plot'),g=clear(c),x=v=>25+v*5.46;
      [[scores.mated,50,teal,t('Stejná identita','Mated')],[scores.nonmated,120,orange,t('Různé identity','Non-mated')]].forEach(([values,y,col,name])=>{
        line(g,x(0),y,x(100),y,'#acb9b6');g.fillStyle=ink;g.font='13px sans-serif';g.fillText(name,x(0),y-14);
        values.forEach(v=>dot(g,x(v),y,col,4));});
      line(g,x(th),10,x(th),147,ink,2);g.fillText(String(th),Math.min(x(th),555),163);
      text('bio-rates','FMR = '+r.falseMatch+'/'+r.negatives+' = '+pc(r.falseMatch/r.negatives)+' · FNMR = '+r.miss+'/'+r.positives+' = '+pc(r.miss/r.positives));
      $('pad-threshold').disabled=!on;
      text('pad-rates',on?'APCER = '+a.missedAttacks+'/'+a.attacks+' = '+pc(a.missedAttacks/a.attacks)+' · BPCER = '+a.errors+'/'+a.genuine+' = '+pc(a.errors/a.genuine):t('Detektor je vypnutý.','The detector is off.'));
      text('end-to-end',t('Celým systémem přijato','Accepted by the full system')+': '+a.genuineAccepted+'/'+a.genuine+' '+t('pravých','bona fide')+' · '+a.attackAccepted+'/'+a.attacks+' '+t('simulovaných','simulated'));
    }
    listen(['modality','threshold','pad','pad-threshold'],draw);onLanguage(draw);draw();
  }
  ({labels,texture,pca,models,scores,bio})[document.body.dataset.activity]();
};
