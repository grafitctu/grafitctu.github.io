/* Only shrink a text block when a single complete word cannot fit its line.
   Paragraph length and the number of wrapped lines never trigger fitting. */
(() => {
  const originals = new WeakMap(), tracked = new Set();
  const textBlocks = ':is(.slide, .reveal .slides section) :is(h1,h2,h3,h4,p,li,td,th,dt,dd,figcaption,blockquote)';
  let scheduled = false, printing = false;
  function restore(el) {
    const old = originals.get(el);
    if (old) {
      if (old.value) el.style.setProperty('font-size', old.value, old.priority);
      else el.style.removeProperty('font-size');
    }
  }
  function prepareLinks() {
    document.querySelectorAll('.slide a[href], .reveal .slides section a[href]').forEach(link => {
      if (link.childElementCount || !/^https?:\/\//i.test(link.textContent.trim())) return;
      const text = link.textContent, parts = text.split(/([/._?&=#:%-])/);
      if (parts.length < 2) return;
      const fragment = document.createDocumentFragment();
      parts.forEach((part, index) => {
        fragment.append(document.createTextNode(part));
        if (index % 2) fragment.append(document.createElement('wbr'));
      });
      link.replaceChildren(fragment);
    });
  }
  function prepareSlashLists() {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT), nodes = [];
    let node;
    while ((node = walker.nextNode())) {
      if (!node.parentElement.closest('.slide, .reveal .slides section') || node.parentElement.closest('a, pre, code, math, svg, .katex, script, style')) continue;
      if (/[\p{L}\p{N}][/\\][\p{L}\p{N}]/u.test(node.textContent) || /https?:\/\//i.test(node.textContent) || /\b[a-f0-9]{64}\b/i.test(node.textContent)) nodes.push(node);
    }
    nodes.forEach(node => {
      const fragment = document.createDocumentFragment();
      node.textContent.split(/https?:\/\//i.test(node.textContent) ? /([/._?&=#:%-]|\b[a-f0-9]{64}\b)/i : /([/\\]|\b[a-f0-9]{64}\b)/i).forEach((part, index) => {
        if (/^[a-f0-9]{64}$/i.test(part)) {
          const hash = document.createElement('code');
          hash.className = 'grafit-integrity-hash'; hash.textContent = part;
          fragment.append(hash);
        } else {
          fragment.append(document.createTextNode(part));
          if (index % 2) fragment.append(document.createElement('wbr'));
        }
      });
      node.replaceWith(fragment);
    });
  }
  function fit() {
    scheduled = false;
    if (printing) return;
    prepareLinks();
    prepareSlashLists();
    document.querySelectorAll(textBlocks).forEach(el => {
      if (!el.getClientRects().length || !el.getBoundingClientRect().width) return;
      if (!originals.has(el)) originals.set(el, {value: el.style.getPropertyValue('font-size'), priority: el.style.getPropertyPriority('font-size')});
      tracked.add(el);
      restore(el);
      const style = getComputedStyle(el), box = el.getBoundingClientRect();
      const scale = el.offsetWidth ? box.width / el.offsetWidth : 1;
      const available = box.width - (parseFloat(style.paddingLeft) + parseFloat(style.paddingRight)) * scale;
      if (available <= 0) return;
      let longest = 0;
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      let node;
      while ((node = walker.nextNode())) {
        if (node.parentElement.closest('svg, math, .katex, code, pre, .sr-only, [aria-hidden="true"]')) continue;
        for (const match of node.textContent.matchAll(/[\p{L}\p{M}]+/gu)) {
          const range = document.createRange();
          range.setStart(node, match.index); range.setEnd(node, match.index + match[0].length);
          longest = Math.max(longest, range.getBoundingClientRect().width);
        }
      }
      if (longest > available + 1) el.style.setProperty('font-size', (parseFloat(style.fontSize) * available / longest * 0.99) + 'px', 'important');
    });
  }
  function schedule() { if (!scheduled) { scheduled = true; requestAnimationFrame(fit); } }
  function start() {
    schedule();
    document.fonts?.ready.then(schedule);
    new MutationObserver(schedule).observe(document.body, {subtree: true, childList: true, attributes: true, attributeFilter: ['class', 'hidden']});
    if (window.Reveal?.on) { Reveal.on('slidechanged', schedule); Reveal.on('ready', schedule); }
  }
  addEventListener('resize', schedule);
  addEventListener('hashchange', schedule);
  addEventListener('beforeprint', () => { printing = true; tracked.forEach(restore); });
  addEventListener('afterprint', () => { printing = false; schedule(); });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, {once: true});
  else start();
})();
