(() => {
 'use strict';
 const data=window.DVD_SLIDES, sources=window.DVD_SOURCES;
 const $=id=>document.getElementById(id);
 const deck=$('deck'), viewport=$('viewport'), overview=$('overview'), imageView=$('image-view');
 const esc=s=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const link=(key)=>{const [label,url]=sources[key];return `<a href="${url}" target="_blank" rel="noopener">${esc(label)}</a>`;};
 const steamQR=(key,corner=false)=>{const game=window.DVD_STEAM[key];return `<a class="steam-qr ${corner?'steam-qr-corner':'steam-qr-inline'}" href="${game.url}" target="_blank" rel="noopener" aria-label="${esc(game.title)} na Steamu"><img src="${game.qr}" alt="QR: ${esc(game.title)} na Steamu"><span>Steam ↗</span></a>`;};
 let current=0,reading=false;
 const slides=data.map((item,index)=>{
  const slide=document.createElement('section');
  slide.className=`slide ${item.layout||''} ${item.dark?'dark':''}`;
  slide.id=`slide-${index+1}`;slide.dataset.chapter=item.chapter;
  slide.setAttribute('aria-label',`${index+1}. ${item.title}`);
  const refs=item.sources||[];
  const content=item.layout==='game'?`<div class="game-copy">${item.html}</div><figure class="game-figure"><img src="${item.image}" alt="${esc(item.alt)}" tabindex="0" role="button" aria-label="Zvětšit: ${esc(item.alt)}"><figcaption>${refs.filter(x=>/Art/.test(x)||x==='feign'||x==='dread'||x==='clock').map(link).join(' · ')}</figcaption></figure>`:item.html;
  slide.innerHTML=`${item.layout==='cover'?'':`<p class="section-label">${esc(item.chapter)}</p><h2>${esc(item.title)}</h2>`}<div class="slide-content">${content}</div><footer class="slide-foot"><span>${refs.length?link(refs[0]):'Návrhový rozbor / vlastní výukový model'}</span><span class="slide-number">${String(index+1).padStart(2,'0')}</span></footer><details class="notes-inline"><summary>Poznámky pro vyučujícího a zdroje</summary><p>${esc(item.notes)}</p>${refs.map(x=>`<p>${link(x)}</p>`).join('')}</details>`;
  if(item.steam){slide.classList.add('has-steam-qr');slide.insertAdjacentHTML('beforeend',steamQR(item.steam,true));}
  slide.querySelectorAll('[data-steam-qr]').forEach(el=>el.innerHTML=steamQR(el.dataset.steamQr));
  slide.querySelectorAll('[data-source]').forEach(el=>el.innerHTML=link(el.dataset.source));
  deck.append(slide);return slide;
 });
 overview.querySelector('nav').innerHTML=data.map((s,i)=>`<a href="#slide-${i+1}"><span>${String(i+1).padStart(2,'0')}</span>${esc(s.title)}</a>`).join('');
 const indexFromHash=()=>Math.max(0,Math.min(slides.length-1,(Number(location.hash.match(/^#slide-(\d+)$/)?.[1])||1)-1));
 function resize(){
  if(reading||innerWidth<=700){deck.style.transform='none';return;}
  const scale=Math.min((viewport.clientWidth-24)/1600,(viewport.clientHeight-24)/900);
  deck.style.transform=`scale(${Math.max(.1,scale)})`;
 }
 function updateNotes(){
  $('notes-title').textContent=data[current].title;$('notes-text').textContent=data[current].notes;
  $('notes-sources').innerHTML=(data[current].sources||[]).map(x=>`<p>${link(x)}</p>`).join('')||'<p>Vlastní návrhový rozbor nebo výukový model.</p>';
 }
 function go(index,writeHash=true){
  current=Math.max(0,Math.min(slides.length-1,index));
  slides.forEach((s,i)=>{s.hidden=!reading&&i!==current;s.inert=!reading&&i!==current;});
  $('counter').textContent=`${String(current+1).padStart(2,'0')} / ${slides.length}`;
  $('chapter').textContent=data[current].chapter;
  $('previous').disabled=current===0;$('next').disabled=current===slides.length-1;
  $('progress-value').style.width=`${(current+1)/slides.length*100}%`;
  $('announcement').textContent=slides[current].getAttribute('aria-label');
  overview.querySelectorAll('a').forEach((a,i)=>i===current?a.setAttribute('aria-current','page'):a.removeAttribute('aria-current'));
  updateNotes();
  if(writeHash)history.replaceState(null,'',`#slide-${current+1}`);
  if(reading)slides[current].scrollIntoView({behavior:'instant'});else viewport.scrollTop=0;
 }
 function toggleNotes(force){
  const show=typeof force==='boolean'?force:$('notes-panel').hidden;
  $('notes-panel').hidden=!show;$('notes-toggle').setAttribute('aria-pressed',String(show));
 }
 function toggleReading(){
  reading=!reading;document.body.classList.toggle('reading',reading);
  $('reading').setAttribute('aria-pressed',String(reading));$('reading').textContent=reading?'Prezentace':'Čtení';
  go(current,false);resize();
 }
 async function fullscreen(){try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{$('announcement').textContent='Celou obrazovku lze otevřít také klávesou F11.';}}
 $('next').addEventListener('click',()=>go(current+1));$('previous').addEventListener('click',()=>go(current-1));
 $('contents').addEventListener('click',()=>overview.showModal());
 $('notes-toggle').addEventListener('click',()=>toggleNotes());$('notes-close').addEventListener('click',()=>toggleNotes(false));
 $('reading').addEventListener('click',toggleReading);$('fullscreen').addEventListener('click',fullscreen);
 document.querySelector('.brand').addEventListener('click',e=>{if(e.currentTarget.id==='grafit-course-link')return;e.preventDefault();go(0);});
 overview.querySelectorAll('a').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();overview.close();go(Number(a.hash.slice(7))-1);}));
 document.querySelectorAll('dialog .close').forEach(b=>b.addEventListener('click',()=>b.closest('dialog').close()));
 [overview,imageView].forEach(d=>d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}}));
 document.querySelectorAll('.game-figure img').forEach(img=>{
  const open=()=>{const target=imageView.querySelector('img');target.src=img.src;target.alt=img.alt;imageView.showModal();};
  img.addEventListener('click',open);img.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open();}});
 });
 document.addEventListener('keydown',e=>{
  if(overview.open||imageView.open||e.ctrlKey||e.metaKey||e.altKey||e.target.closest('input,textarea,select'))return;
  if(e.key==='Escape'){toggleNotes(false);return;}
  if(e.target.closest('button,a,summary,[role=button]')&&['Enter',' '].includes(e.key))return;
  if(['ArrowRight','PageDown'].includes(e.key)||(e.key===' '&&!reading&&!e.shiftKey)){e.preventDefault();go(current+1);}
  else if(['ArrowLeft','PageUp'].includes(e.key)||(e.key===' '&&!reading&&e.shiftKey)){e.preventDefault();go(current-1);}
  else if(e.key==='Home'&&!reading){e.preventDefault();go(0);}
  else if(e.key==='End'&&!reading){e.preventDefault();go(slides.length-1);}
  else if(e.key.toLowerCase()==='n')toggleNotes();
  else if(e.key.toLowerCase()==='o')overview.showModal();
  else if(e.key.toLowerCase()==='r')toggleReading();
  else if(e.key.toLowerCase()==='f')fullscreen();
 });
 let touch;
 viewport.addEventListener('touchstart',e=>{touch=e.touches.length===1?{x:e.touches[0].clientX,y:e.touches[0].clientY}:null;},{passive:true});
 viewport.addEventListener('touchend',e=>{if(!touch||reading||e.target.closest('input,button,summary,a'))return;const dx=e.changedTouches[0].clientX-touch.x,dy=e.changedTouches[0].clientY-touch.y;if(Math.abs(dx)>65&&Math.abs(dx)>Math.abs(dy)*1.8)go(current+(dx<0?1:-1));touch=null;},{passive:true});
 addEventListener('hashchange',()=>go(indexFromHash(),false));addEventListener('resize',resize);
 const range=$('fascist-count');
 function probability(){const f=Number(range.value),n=17;const p=f<3?0:f*(f-1)*(f-2)/(n*(n-1)*(n-2));$('fascist-label').textContent=`${f} / ${n}`;$('policy-probability').textContent=`${(p*100).toLocaleString('cs-CZ',{minimumFractionDigits:1,maximumFractionDigits:1})} %`;}
 range.addEventListener('input',probability);probability();
 const graph={taxi:{A:['B','C'],B:['A','D'],C:['A','E'],D:['B','F'],E:['C','F'],F:['D','E']},bus:{A:['D'],B:['E'],C:['F'],D:['A'],E:['B'],F:['C']}};
 let possible=new Set(['A']),actual='A',trail=[],step=0;
 function movementView(){
  $('possible-set').textContent=[...possible].sort().join(' · ');
  $('trace-label').textContent=step?`${possible.size} ${possible.size===1?'možná poloha':possible.size<5?'možné polohy':'možných poloh'}`:'Známý start na A';
  $('trace-history').textContent=trail.length?(trail.length>8?'… / ':'')+trail.slice(-8).join(' / '):'Zatím bez pohybu.';
  $('trace-history').title=trail.join(' / ');
 }
 document.querySelectorAll('[data-move]').forEach(button=>button.addEventListener('click',()=>{
  const type=button.dataset.move;
  possible=new Set([...possible].flatMap(node=>graph[type][node]));
  const options=graph[type][actual];actual=options[step%options.length];step++;
  trail.push(`${step}. ${type}`);movementView();
 }));
 $('reveal-position').addEventListener('click',()=>{possible=new Set([actual]);trail.push(`odhalení: ${actual}`);movementView();});
 $('reset-movement').addEventListener('click',()=>{possible=new Set(['A']);actual='A';trail=[];step=0;movementView();});
 movementView();go(indexFromHash(),false);resize();
})();
