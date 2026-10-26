/* Deterministic mathematical, provenance and generation regressions. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),web=path.join(root,'vyuka/pga'),M=require('../vyuka/pga/richtr-web/models-v2.js'),R=require('../vyuka/pga/richtr-web/integrators-v2.js');
let checks=0;const near=(a,b,tol=1e-9)=>{assert.ok(Math.abs(a-b)<tol,`${a} != ${b}`);checks++;};
const sha=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const s=M.sphere([0,0,0],[0,0,-1]);near(s.roots[0],4);near(s.roots[1],6);assert.deepEqual(s.normal,[0,0,1]);
const s2=M.sphere([.6,0,0],[0,0,-1]);near(s2.roots[0],4.2);near(s2.roots[1],5.8);near(Math.hypot(...s2.normal),1);
near(M.sphere([1,0,0],[0,0,-1]).disc,0);assert.deepEqual(M.sphere([1.4,0,0],[0,0,-1]).roots,[]);near(M.sphere([0,0,0],[0,0,-2]).t,2);
near(M.fresnel(0).F,.04);near(M.fresnel(60).F,.0891867128022128);near(M.fresnel(60).schlick,.07);assert.equal(M.fresnel(50,1.5,1).tir,true);near(M.fresnel(50,1.5,1).F,1);
for(let x=-5;x<=5;x+=.15){const b=M.bvhDemo(x);assert.ok(b.match);assert.equal(b.naiveTests,1024);checks++;}assert.ok(M.bvhDemo(.15).bvhTests<1024);
assert.equal(M.boxHit([0,0,0],[0,0,-1],[-1,-1,-6],[1,1,-4]),true);assert.equal(M.boxHit([2,0,0],[0,0,-1],[-1,-1,-6],[1,1,-4]),false);assert.equal(M.boxHit([0,0,0],[0,0,-1],[-1,-1,-6],[1,1,-4],3),false);
assert.deepEqual(M.mapNormal([.5,.5,1]),[0,0,1]);near(M.mapNormal([.5,.5,1],true)[0],-.44467447537);assert.ok(M.mapNormal([.6,.7,.9],false,true)[1]<0);
for(const [x,y] of [[.1,.2],[.7,-.4],[-.2,.6]]){const e=1e-6,dx=(M.height(x+e,y)-M.height(x-e,y))/(2*e),dy=(M.height(x,y+e)-M.height(x,y-e))/(2*e),n=M.norm([-dx,-dy,1]);M.normalAt(x,y).forEach((v,i)=>near(v,n[i],1e-8));}
for(const angle of [0,15,45,60,78]){const h=M.profileHit(.4,.3,angle);near(h.z,M.height(h.u,h.v),.001);assert.ok(h.steps<=64);}
for(const f of [4,32,160,240])for(const n of [1,4])for(let x=0;x<128;x+=7){const a=M.filteringPixel(x,31,f,n);assert.ok(a>=0&&a<=1);checks++;}
const seed1=R.rng(1729),seed2=R.rng(1729);for(let i=0;i<32;i++)near(seed1(),seed2());
const totals={};for(const mode of ['direct','whitted','path']){let sum=0;for(let y=0;y<24;y++)for(let x=0;x<32;x++){const c=R.pixel(x,y,32,24,mode,16);c.forEach(v=>assert.ok(Number.isFinite(v)&&v>=0));sum+=c.reduce((a,b)=>a+b,0);}assert.ok(sum>1);totals[mode]=sum;checks++;}assert.notEqual(totals.direct,totals.whitted);assert.notEqual(totals.whitted,totals.path);
const pdf={p04:'93a764f2d3f68bca0e913ba8eae670fc76218a79705886215011c7be35dc1d71',p05:'280f243ac5d1c71186e8e1fe2915b6d83faa028f2f4491590e8f71ba772d39c4'};
const archive=JSON.parse(fs.readFileSync(path.join(web,'richtr-web/archive-v1/manifest.json')));
for(const f of archive.files){assert.equal(sha(path.join(web,f.path)),f.sha256);checks++;}
for(const slug of Object.keys(pdf)){assert.equal(sha(path.join(web,slug,'original.pdf')),pdf[slug]);const map=JSON.parse(fs.readFileSync(path.join(web,slug,'web-source-map.json')));assert.deepEqual(map.topics.flatMap(t=>t.pdfPages).sort((a,b)=>a-b),Array.from({length:map.originalPages},(_,i)=>i+1));const oldCount=slug==='p04'?24:19;for(let n=1;n<=oldCount;n++)assert.ok(map.topics.some(t=>t.id==='slide-'+n));assert.equal(map.topics.length,slug==='p04'?42:19);checks++;}
const assets=path.join(web,'richtr-web/v2/assets'),render=JSON.parse(fs.readFileSync(path.join(assets,'render-manifest.json')));assert.equal(sha(path.join(assets,'render-source.py')),render.renderScriptSha256);
const records=render.records;assert.ok(Array.isArray(records),'render records');assert.equal(records.length,14);
for(const r of records){const file=path.join(assets,r.file),b=fs.readFileSync(file);assert.equal(sha(file),r.sha256);assert.equal(b.readUInt32BE(16),r.width);assert.equal(b.readUInt32BE(20),r.height);assert.equal(r.seed,1729);if(r.file.startsWith('noise-'))assert.equal(r.denoising,false);checks++;}
const manifest=JSON.parse(fs.readFileSync(path.join(root,'vyuka/source-manifest.json')));for(const m of manifest.files.filter(x=>/pga\/(richtr-|p04\/web|p05\/web)/.test(x.copy))){assert.equal(sha(path.join(root,'vyuka',m.copy)),m.sha256,m.copy);checks++;}
console.log(JSON.stringify({checks,integratorRadianceTotals:totals,pdfUnchanged:true,originalPagesMappedOnce:true,stableAnchors:true,renderFiles:records.length,archive},null,2));
