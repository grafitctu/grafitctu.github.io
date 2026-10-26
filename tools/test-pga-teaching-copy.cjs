/* Editorial regression: teaching content, not conversion/build commentary. */
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8'),before=f=>cp.execFileSync('git',['show','a2cdfd4004393da3724755d1ecc88ef8a57f0458:'+f],{cwd:root,encoding:'utf8'});
const matches=(s,re)=>[...s.matchAll(re)].map(m=>m[0]);
const banned=/Rozšířená edice|Tematický webový převod|Upřesnění převodu|Webový převod|konvence převodu|Radka? Richtra?|navazuj[^<.]*PG1|Původní PDF|PDF strana|zdrojové snímky|zdrojovými snímky|Původní snímky|nový řešený příklad|historické galerie|historické snímky|původní kopii|web-v1|review\.html|implementation-v2|render-manifest\.json/i;
let topics=0,equations=0;
for(const slug of ['p04','p05']){const file='vyuka/pga/'+slug+'/web.html',html=read(file),old=before(file);assert(!banned.test(html),'Editorial text leaked in '+slug);assert(!html.includes('class="source"'));assert(!html.includes('PG1'));topics+=matches(html,/<article\b/g).length;equations+=matches(html,/data-tex=/g).length;}
assert.equal(topics,72);assert.equal(equations,26);
const data=require('./pga-richtr-v2-content.cjs')(require('./pga-richtr-content.json'));for(const deck of Object.values(data))for(const t of deck.topics){for(const s of t.points)assert(!/webový převod|původní PDF|review|Radka Richtra|navazuj.*PG1/i.test(s));}
console.log(JSON.stringify({topics,equations,noConversionCommentary:true,noPG1Prerequisite:true},null,2));
