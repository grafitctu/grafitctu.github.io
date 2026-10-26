const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),tex=require('./pga-tex.cjs'),data=require('./pga-richtr-v2-content.cjs')(require('./pga-richtr-content.json'));
let displays=0,checks=0;
for(const [slug,deck]of Object.entries(data)){
 for(const t of deck.topics){tex.prepare(slug,t);if(t.math){assert(t.mathHtml.includes('katex-html'));assert(t.mathHtml.includes('application/x-tex'));displays++;checks+=2;}
  for(const e of t.equations||[]){assert(e.html.includes('katex-html'));assert(e.html.includes('<math '));assert(!e.html.includes('katex-error'));displays++;checks+=3;}}
 for(const t of deck.topics)for(const q of t.questions||[])if(q.tex){assert(tex.render(q.tex).includes('katex-html'));displays++;checks++;}
 const html=fs.readFileSync(path.join(root,'vyuka/pga',slug,'web.html'),'utf8');assert.equal((html.match(/data-tex=/g)||[]).length,deck.topics.reduce((n,t)=>n+!!t.math+(t.equations?.length||0)+(t.questions?.filter(q=>q.tex).length||0),0));
 assert(!html.includes('cdn.jsdelivr.net'));assert(!html.includes('<p class="equation"'));assert(html.includes('family.css'));assert(html.includes('katex.min.css'));assert(!html.includes('<script src="../richtr-web/vendor'));checks+=6;
}
assert.equal(displays,24);assert.throws(()=>tex.prepare('p04',{id:'missing',math:'x'}));assert.throws(()=>tex.render(String.raw`\notARealCommand`));
assert(tex.formulas.p04['slide-10'].equations[0].includes(String.raw`\mathrm d\omega_o`));assert(tex.formulas.p04['slide-11'][0].includes(String.raw`\mathrm d\omega_i`));
assert(tex.text('<script>ωᵢ</script>').startsWith('&lt;script&gt;'));assert(!tex.text('<script>ωᵢ</script>').includes('<script>'));checks+=7;
const vendor=path.join(root,'vyuka/pga/richtr-web/vendor/katex-0.19.1'),receipt=JSON.parse(fs.readFileSync(path.join(vendor,'upstream.json')));
for(const f of receipt.files){const bytes=fs.readFileSync(path.join(vendor,f.file));assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),f.sha256);checks++;}
console.log(JSON.stringify({checks,displays,topics:[44,26],strictTeX:true,htmlAndAccessibleMathml:true,localFonts:true,upstreamIntegrity:true},null,2));
