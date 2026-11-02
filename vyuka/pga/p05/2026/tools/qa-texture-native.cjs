const {chromium}=require('C:/Users/grafi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const path=require('path'),{pathToFileURL}=require('url'),assert=require('assert'),fs=require('fs');
(async()=>{const b=await chromium.launch({channel:'msedge',headless:true}),p=await b.newPage({viewport:{width:1366,height:768}}),errors=[];
p.on('pageerror',e=>errors.push(e.message));const url=process.env.PGA_QA_URL||pathToFileURL(path.resolve(__dirname,'../index.html')).href;
await p.goto(url);assert.equal(await p.locator('.texture-native').count(),30);assert.equal(await p.locator('.original-page,img[src*="original-texture/page-"]').count(),0);
for(const width of [1366,390]){await p.setViewportSize({width,height:width===1366?768:844});for(let n=36;n<=65;n++){
 await p.goto(url+'#s'+(n+9));const s=p.locator('.slide.active');assert.equal(await s.locator('.texture-native').getAttribute('data-original-page'),String(n));
 const count=n===36||n===48||n===61?0:n<=41?n-36:n<=47?n-41:1;assert.equal(await s.locator('img').count(),count);
 await s.locator('img').evaluateAll(async imgs=>Promise.all(imgs.map(i=>i.decode())));
 assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`horizontal overflow ${n}/${width}`);
 if(width===1366){assert(await s.evaluate(e=>e.getBoundingClientRect().bottom<=document.querySelector('footer').getBoundingClientRect().top),`vertical overflow ${n}`);if([36,41,47,49,60,61,62,65].includes(n))await p.screenshot({path:path.resolve(__dirname,`../qa-texture-native-${n}.png`)});}
}}
assert.deepEqual(errors,[]);console.log(JSON.stringify({nativeSlides:30,fullPageImages:0,viewports:[1366,390],allImagesDecoded:true,orderAndRevealCounts:true,errors}));await b.close();})().catch(e=>{console.error(e);process.exit(1)});
