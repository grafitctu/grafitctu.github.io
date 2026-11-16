(()=>{const pages=[...document.querySelectorAll('article')],select=document.querySelector('header select'),$=id=>document.getElementById(id);let i=0;
function show(){let j=pages.findIndex(e=>'#'+e.id===location.hash);i=j<0?0:j;pages.forEach((e,k)=>e.hidden=k!==i);select.selectedIndex=i;document.querySelector('footer output').textContent=(i+1)+' / '+pages.length;$('prev').disabled=!i;$('next').disabled=i===pages.length-1;scrollTo(0,0)}
function go(j){location.hash=pages[Math.max(0,Math.min(j,pages.length-1))].id}
select.onchange=()=>go(select.selectedIndex);$('prev').onclick=()=>go(i-1);$('next').onclick=()=>go(i+1);onhashchange=show;show();
document.addEventListener('keydown',e=>{if(e.target.closest('input,select,button,dialog,summary')||document.querySelector('dialog[open]'))return;if(['ArrowRight','ArrowLeft','Home','End'].includes(e.key)){e.preventDefault();go(({ArrowRight:i+1,ArrowLeft:i-1,Home:0,End:pages.length-1})[e.key])}});
$('lab-toggle').onclick=()=>$('lab-dialog').showModal();document.querySelector('dialog .close').onclick=()=>$('lab-dialog').close();$('fullscreen').onclick=()=>document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen();
})();
