(()=>{'use strict';
const slides=[...document.querySelectorAll('.slide')],$=id=>document.getElementById(id);let index=0,presenting=false;
const fromHash=()=>Math.max(0,slides.findIndex(s=>s.id===decodeURIComponent(location.hash.slice(1))));
function go(n,write=true){index=Math.max(0,Math.min(slides.length-1,n));slides.forEach((s,i)=>s.hidden=presenting&&i!==index);$('counter').textContent=(index+1)+' / '+slides.length;if($('progress'))$('progress').style.width=((index+1)/slides.length*100)+'%';$('previous').disabled=index===0;$('next').disabled=index===slides.length-1;if(write)history.replaceState(null,'','#'+slides[index].id);if(presenting)scrollTo(0,0);else if(write)slides[index].scrollIntoView();}
function theme(t){document.documentElement.dataset.theme=t;$('theme').setAttribute('aria-pressed',String(t==='dark'));}
try{theme(localStorage.getItem('pga-native-theme')||'light');}catch{theme('light');}
$('theme').onclick=()=>{const t=document.documentElement.dataset.theme==='dark'?'light':'dark';theme(t);try{localStorage.setItem('pga-native-theme',t);}catch{}};
$('previous').onclick=()=>go(index-1);$('next').onclick=()=>go(index+1);
$('reading').onclick=()=>{presenting=!presenting;document.body.classList.toggle('presenting',presenting);$('reading').textContent=presenting?'Čtení':'Snímky';$('reading').setAttribute('aria-pressed',String(!presenting));go(index);};
async function fullscreen(){try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{}}if($('fullscreen'))$('fullscreen').onclick=fullscreen;
$('print').onclick=()=>print();$('contents').onclick=()=>$('overview').showModal();$('close-overview').onclick=()=>$('overview').close();
let printState=[];addEventListener('beforeprint',()=>{printState=[...document.querySelectorAll('.tutorial details')].map(d=>[d,d.open]);printState.forEach(([d])=>d.open=true);});addEventListener('afterprint',()=>printState.forEach(([d,open])=>d.open=open));
$('overview').querySelectorAll('a').forEach(a=>a.onclick=e=>{e.preventDefault();$('overview').close();go(slides.findIndex(s=>s.id===a.hash.slice(1)));});
addEventListener('hashchange',()=>go(fromHash(),false));
let scrollPending=false;addEventListener('scroll',()=>{if(presenting||scrollPending)return;scrollPending=true;requestAnimationFrame(()=>{scrollPending=false;if(presenting)return;let n=0;slides.forEach((s,i)=>{if(s.getBoundingClientRect().top<innerHeight*.4)n=i;});if(n!==index)go(n,false);});},{passive:true});
document.querySelectorAll('.source').forEach(d=>d.addEventListener('toggle',()=>{if(d.open)d.querySelectorAll('object[data-src]').forEach(o=>{o.data=o.dataset.src;delete o.dataset.src;});}));
addEventListener('keydown',e=>{if(document.querySelector('dialog[open]')||e.ctrlKey||e.altKey||e.metaKey||e.target.closest('input,textarea,select,summary'))return;if(e.key.toLowerCase()==='f'){e.preventDefault();fullscreen();return;}const n={ArrowRight:index+1,PageDown:index+1,ArrowLeft:index-1,PageUp:index-1,Home:0,End:slides.length-1}[e.key];if(n!==undefined){e.preventDefault();go(n);}});
go(fromHash(),false);
})();
