window.setupWorkshop=()=>{
  'use strict';
  const {$,t,pc,num,text,className,params,listen}=RozUI;
  const data=CropData, rows=data.rows, C=data.classes, M=RozMachine;
  const runs={crop:M.folds(rows,'crop'),origin:M.folds(rows,'origin')};
  let mode='crop',fold=-1,filter=null;
  let selected=Math.max(0,rows.findIndex(r=>r.id===(params.get('patch')||'bark10_t0-12')));
  const trClass=i=>className(C[i]);
  function scoreLine(id,s) {
    text(id,pc(s.correct/s.tested.length)+' · '+s.correct+'/'+s.tested.length);
    $(id+'-bar').style.width=(100*s.correct/s.tested.length)+'%';
  }
  function showSample() {
    const row=rows[selected],p=runs[mode].predictions[selected],near=rows[p.nearest];
    $('sample').src='data/'+row.file;$('neighbour').src='data/'+near.file;
    $('sample').alt=t('Testovací výřez ','Test patch ')+row.id;
    $('neighbour').alt=t('Nejbližší trénovací výřez ','Nearest training patch ')+near.id;
    const original=data.parents[row.p];
    $('original').src='data/originals/'+original.path;$('original').alt=original.path;
    Object.assign($('box').style,{left:100*row.x/original.width+'%',top:100*row.y/original.height+'%',
      width:6400/original.width+'%',height:6400/original.height+'%'});
    text('sample-file',row.id+' · '+trClass(row.c));text('neighbour-file',near.id+' · '+trClass(near.c));
    text('original-file',original.path+' · ('+row.x+', '+row.y+')');
    text('nearest-filename',data.parents[near.p].path);
    text('decision',t('Předpověď ','Prediction ')+trClass(p.c)+' · '+t('správná třída ','true class ')+trClass(row.c)
        +' · d = '+num(p.distance,3)+' · '+t('běh ','fold ')+(p.fold+1));
    text('shared-note',row.p===near.p?t('Oba výřezy pocházejí ze stejného původního souboru.','Both patches come from the same original file.')
      :t('Soused pochází z jiného původního souboru.','The neighbour comes from a different original file.'));
    const other=runs[mode==='crop'?'origin':'crop'].predictions[selected];
    text('other-result',t('Tentýž výřez ve druhém režimu','The same patch under the other split')+' · '+trClass(other.c)+' · '+rows[other.nearest].id);
    $('open-texture').href='03-texture.html?lang='+RozUI.state.lang+'&patch='+encodeURIComponent(row.id);
    $('open-model').href='05-models.html?lang='+RozUI.state.lang+'&patch='+encodeURIComponent(row.id);
  }
  function draw() {
    const current=M.summarize(rows,runs[mode],fold);
    const a=M.summarize(rows,runs.crop,fold),b=M.summarize(rows,runs.origin,fold);
    scoreLine('score-crop',a);scoreLine('score-origin',b);
    text('delta',t('Rozdíl ve správnosti (náhodné − podle obrazu)','Accuracy difference (random − grouped)')+' = '+
      num(100*(a.correct/a.tested.length-b.correct/b.tested.length))+' '+t('procentního bodu','percentage points'));
    for(const k of ['crop','origin']){
      $('choose-'+k).setAttribute('aria-pressed',String(k===mode));
      $('score-'+k).parentElement.setAttribute('aria-current',String(k===mode));
    }
    const testCount=current.tested.length;
    text('fold-count',fold===-1?t('Šest běhů. Každý z 576 výřezů byl právě jednou v testu. V každém běhu 480 trénovacích a 96 testovacích výřezů.','Six folds. Each of the 576 patches was tested once. Each fold uses 480 training and 96 test patches.'):
      t('V tomto běhu je 480 výřezů v tréninku a 96 v testu. Oba režimy mohou v témže čísle běhu testovat jiné výřezy.','This fold contains 480 training and 96 test patches. The two protocols can test different patches in the same fold number.'));
    const testParents=new Set(current.tested.map(i=>rows[i].p)).size;
    text('overlap',current.shared+' / '+testParents+' · '+t('testovacích originálů zastoupených také v tréninku příslušného běhu','test originals also present in their fold’s training data'));
    text('same-neighbour',current.same+' / '+testCount+' · '+t('předpovědí se sousedem ze stejného originálu','predictions using a neighbour from the same original'));
    const matrix=$('confusion');matrix.replaceChildren();
    const header=matrix.createTHead().insertRow();
    [t('Pravda ↓ / Odhad →','True ↓ / Predicted →'),...C.map(className),t('Recall','Recall')].forEach(v=>{
      const th=document.createElement('th');th.scope='col';th.textContent=v;header.append(th);
    });
    const body=matrix.createTBody();
    current.matrix.forEach((row,i)=>{
      const tr=body.insertRow(),th=document.createElement('th');th.scope='row';th.textContent=trClass(i);tr.append(th);
      row.forEach((v,j)=>{
        const td=tr.insertCell(),button=document.createElement('button');
        button.type='button';button.textContent=v;button.disabled=!v;
        button.setAttribute('aria-label',trClass(i)+' → '+trClass(j)+': '+v);
        button.setAttribute('aria-pressed',String(filter?.[0]===i&&filter?.[1]===j));
        if(i===j)td.className='diagonal';
        button.onclick=()=>{filter=[i,j];draw();};td.append(button);
      });
      tr.insertCell().textContent=pc(row[i]/row.reduce((x,y)=>x+y,0),0);
    });
    let ids=current.tested.filter(i=>!filter || (rows[i].c===filter[0]&&runs[mode].predictions[i].c===filter[1]));
    if(!ids.length){filter=null;ids=current.tested;}
    if(!ids.includes(selected))selected=ids[0];
    $('crop-picker').replaceChildren(...ids.map(i=>new Option(rows[i].id,i)));
    $('crop-picker').value=selected;
    text('matching',ids.length+' '+t('výřezů ve výběru','patches in selection'));
    $('clear-cell').disabled=filter===null;
    showSample();
  }
  ['crop','origin'].forEach(k=>{$('choose-'+k).onclick=()=>{mode=k;filter=null;draw();};});
  $('fold').onchange=()=>{fold=Number($('fold').value);filter=null;draw();};
  $('clear-cell').onclick=()=>{filter=null;draw();};
  $('crop-picker').onchange=()=>{selected=Number($('crop-picker').value);showSample();};
  $('find-error').onclick=()=>{
    filter=null;
    const ids=M.summarize(rows,runs[mode],fold).tested.filter(i=>rows[i].c!==runs[mode].predictions[i].c);
    if(ids.length){selected=ids.find(i=>i>selected)??ids[0];}draw();
  };
  function bayes(){
    const prior=+$('prior').value/100,cost=+$('cost').value;
    const wa=.8*prior,wb=.3*(1-prior),a=wa/(wa+wb),riskA=1-a,riskB=cost*a;
    text('prior-val',pc(prior,0));text('cost-val',num(cost,1));
    text('posterior','P(A | x) = '+num(wa,3)+' / '+num(wa+wb,3)+' = '+num(a,3)+' · P(B | x) = '+num(1-a,3));
    text('risk',t('Riziko A','Risk A')+' = '+num(riskA,3)+' · '+t('riziko B','risk B')+' = '+num(riskB,3)+' · '+
      t('volba ','decision ')+(Math.abs(riskA-riskB)<1e-10?'A / B':riskA<riskB?'A':'B'));
  }
  listen(['prior','cost'],bayes);
  document.addEventListener('roz-language',()=>{draw();bayes();});
  window.workshopSplit={runs};draw();bayes();
};
