import * as pdfjsLib from './pdf.min.mjs';

const root = document.documentElement;
const cfg = document.body.dataset;
const $ = id => document.getElementById(id);
const pdfUrl = cfg.pdf;
const pageCount = Number(cfg.pages || 0);
const title = cfg.title || 'VHS';
const canvas = $('page-canvas'), context = canvas.getContext('2d', {alpha:false});
const overview = $('overview');
const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)');
let pdf, current = 1, rendering = false, pending = null;

function theme(value) {
  root.dataset.theme = value;
  $('theme').setAttribute('aria-pressed', String(value === 'dark'));
  $('theme').title = value === 'dark' ? 'Přepnout na světlý režim' : 'Přepnout na tmavý režim';
}
let stored = null;
try { stored = localStorage.getItem('vhs-theme'); } catch {}
theme(stored === 'dark' || stored === 'light' ? stored : (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
$('theme').addEventListener('click', () => {
  const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
  theme(next); try { localStorage.setItem('vhs-theme', next); } catch {}
});

function hashPage() { return Math.max(1, Math.min(pdf?.numPages || pageCount || 1, Number(location.hash.match(/^#page-(\d+)$/)?.[1]) || 1)); }
function update() {
  $('counter').value = `${String(current).padStart(2,'0')} / ${String(pdf.numPages).padStart(2,'0')}`;
  $('progress-value').style.width = `${current / pdf.numPages * 100}%`;
  $('previous').disabled = current <= 1; $('next').disabled = current >= pdf.numPages;
  $('chapter').textContent = title;
  overview.querySelectorAll('button').forEach((b,i) => i + 1 === current ? b.setAttribute('aria-current','page') : b.removeAttribute('aria-current'));
  $('announcement').textContent = `${title}, strana ${current} z ${pdf.numPages}`;
}
async function render(pageNo, animate = true, updateHash = true) {
  if (!pdf) return;
  pageNo = Math.max(1, Math.min(pdf.numPages, pageNo));
  if (rendering) { pending = {pageNo, animate, updateHash}; return; }
  rendering = true;
  try {
    const oldData = canvas.width && canvas.height ? canvas.toDataURL('image/png') : null;
    const oldPage = current;
    const page = await pdf.getPage(pageNo);
    const base = page.getViewport({scale:1});
    const box = $('page').getBoundingClientRect();
    const scale = Math.max(1, Math.min(2.4, Math.min(box.width/base.width, box.height/base.height) * devicePixelRatio));
    const viewport = page.getViewport({scale});
    canvas.width = Math.ceil(viewport.width); canvas.height = Math.ceil(viewport.height);
    canvas.style.aspectRatio = `${base.width}/${base.height}`;
    const task = page.render({canvasContext:context, viewport});
    await task.promise;
    if (oldData && animate && oldPage !== pageNo && !prefersReduced.matches) {
      const direction = pageNo > current ? 1 : -1;
      const old = new Image(); old.src = oldData; old.alt = ''; old.style.cssText='position:absolute;inset:0;width:100%;height:100%;object-fit:contain;';
      const fresh = new Image(); fresh.src = canvas.toDataURL('image/png'); fresh.alt = ''; fresh.style.cssText='position:absolute;inset:0;width:100%;height:100%;object-fit:contain;transform:translateX('+(direction*7)+'%);opacity:0;';
      $('page').append(old, fresh); canvas.style.visibility='hidden';
      const a = old.animate([{transform:'translateX(0)',opacity:1},{transform:`translateX(${-direction*7}%)`,opacity:0}],{duration:280,easing:'cubic-bezier(.22,.7,.25,1)'});
      const b = fresh.animate([{transform:`translateX(${direction*7}%)`,opacity:0},{transform:'translateX(0)',opacity:1}],{duration:280,easing:'cubic-bezier(.22,.7,.25,1)'});
      await Promise.all([a.finished,b.finished]); old.remove(); fresh.remove(); canvas.style.visibility='visible';
    }
    current = pageNo;
    if (updateHash) history.replaceState(null,'',`#page-${pageNo}`);
    update(); $('loading').hidden = true;
  } finally { rendering = false; }
  if (pending) { const next=pending; pending=null; render(next.pageNo,next.animate,next.updateHash); }
}
function go(n) { if (pdf) render(n); }
$('next').addEventListener('click',()=>go(current+1)); $('previous').addEventListener('click',()=>go(current-1));
$('fullscreen').addEventListener('click',async()=>{if(document.fullscreenElement) await document.exitFullscreen(); else await document.documentElement.requestFullscreen();});
$('contents').addEventListener('click',()=>overview.showModal());
document.querySelectorAll('.close').forEach(b=>b.addEventListener('click',()=>b.closest('dialog').close()));
overview.addEventListener('click',e=>{if(e.target===overview) overview.close();});
document.addEventListener('keydown',e=>{
  if (overview.open || e.ctrlKey || e.metaKey || e.altKey || /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
  if (['ArrowRight','PageDown'].includes(e.key) || e.key===' ') {e.preventDefault();go(current+1);}
  else if (['ArrowLeft','PageUp'].includes(e.key)) {e.preventDefault();go(current-1);}
  else if (e.key==='Home') {e.preventDefault();go(1);} else if(e.key==='End'){e.preventDefault();go(pdf.numPages);}
  else if(e.key.toLowerCase()==='f') $('fullscreen').click(); else if(e.key.toLowerCase()==='o') overview.showModal();
});
overview.querySelectorAll('button[data-page]').forEach(b=>b.addEventListener('click',()=>{overview.close();go(Number(b.dataset.page));}));
addEventListener('hashchange',()=>go(hashPage()));
async function boot() {
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = './pdf.worker.min.mjs';
    pdf = await pdfjsLib.getDocument(pdfUrl).promise;
    $('page').setAttribute('aria-label', `${title}, snímek ${current}`);
    await render(hashPage(), false, false);
  } catch (error) {
    $('loading').hidden=true; $('error').hidden=false; $('error-detail').textContent = `PDF se nepodařilo načíst: ${error.message}`;
  }
}
boot();
