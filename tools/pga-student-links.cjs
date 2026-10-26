/* Student-facing PGA navigation. Provenance/source metadata stays internal. */
module.exports=function links(item,lang,prefix,escape){
 if(!item.primary||!item.pdf)throw Error('PGA lecture requires an interactive version and a PDF: '+item.id);
 const label=lang==='cs'?['Interaktivní přednáška','PDF ke stažení','Otevřít PDF']:['Interactive lecture','Download PDF','Open PDF'];
 return [
  `<a class="primary" href="${escape(prefix+item.primary)}">${label[0]} ↗</a>`,
  `<a href="${escape(prefix+item.pdf)}" download>${label[1]} ↓</a>`,
  `<a href="${escape(prefix+item.pdf)}" target="_blank" rel="noopener">${label[2]} ↗</a>`
 ];
};
