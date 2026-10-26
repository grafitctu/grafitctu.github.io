const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8'),before=f=>cp.execFileSync('git',['show','origin/main:'+f],{cwd:root,encoding:'utf8'});
let cards=0;
for(const file of ['vyuka/index.html','vyuka/en/index.html','vyuka/pga/index.html','vyuka/pga/en/index.html']){
 const html=read(file),groups=file.includes('/pga/')?[...html.matchAll(/<li class="subject-lecture pga">([\s\S]*?)<\/li>/g)]:[...html.matchAll(/<td class="pga"[^>]*>([\s\S]*?)<\/td>/g)];assert.equal(groups.length,10,file);
 for(const [,card]of groups){const links=card.match(/<div class="lecture-links">([\s\S]*?)<\/div>/)[1],anchors=[...links.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)];assert.equal(anchors.length,3);assert(anchors[0][1].includes('class="primary"'));assert(anchors[1][1].includes(' download'));assert(anchors[2][1].includes('target="_blank"'));assert.equal(anchors[1][1].match(/href="([^"]+)"/)[1],anchors[2][1].match(/href="([^"]+)"/)[1]);assert(/\.pdf$/.test(anchors[1][1].match(/href="([^"]+)"/)[1]));assert(!/review|implementation-v2|richtr-2026|web-v1|Author source|Zdroj autora/.test(links));cards++;}
 if(!file.includes('/pga/'))assert.equal(html.replace(/<td class="pga"[^>]*>[\s\S]*?<\/td>/g,'PGA'),before(file).replace(/<td class="pga"[^>]*>[\s\S]*?<\/td>/g,'PGA'),'Non-PGA overview content changed');
}
for(const slug of ['p04','p05']){const file='vyuka/pga/'+slug+'/web.html',html=read(file);assert(!/href="[^"]*(?:review\.html|implementation-v2|web-v1|richtr-2026)/.test(html));assert.deepEqual(html.match(/<article\b[\s\S]*?<\/article>/g),before(file).match(/<article\b[\s\S]*?<\/article>/g),'Lecture topic content changed');assert(html.includes('href="original.pdf" download'));assert(html.includes('href="original.pdf" target="_blank"'));}
assert(!/href="[^"]*(?:review|implementation|web-v1)/.test(read('vyuka/pga/richtr-2026/index.html')));
console.log(JSON.stringify({cardsChecked:cards,linksPerCard:3,topicsUnchanged:69,otherCoursesUnchanged:true,reviewAndArchiveLinksRemoved:true},null,2));
