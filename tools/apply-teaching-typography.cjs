/* Site-only typography: leave author/source baselines unchanged. */
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),{spawnSync}=require('node:child_process');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const marker=/<!-- GRAFIT whole-word typography -->[\s\S]*?<!-- \/GRAFIT whole-word typography -->\s*/g;
function inject(html,css,js){
 html=html.replace(marker,'');
 const block=`<!-- GRAFIT whole-word typography -->\n<link rel="stylesheet" href="${css}">\n<script defer src="${js}"></script>\n<!-- /GRAFIT whole-word typography -->\n`;
 if(/<\/head>/i.test(html))return html.replace(/<\/head>/i,block+'</head>');
 if(/<\/title>/i.test(html))return html.replace(/<\/title>/i,'</title>'+block);
 throw Error('Missing head/title');
}
module.exports=function apply(base){
 const mf=path.join(base,'source-manifest.json'),manifest=JSON.parse(fs.readFileSync(mf,'utf8'));
 function record(rel,bytes,source,before){
  let r=manifest.files.find(x=>x.copy===rel);
  if(!r){r={source,copy:rel};manifest.files.push(r);}
  if(before&&!r.preTypographySha256)r.preTypographySha256=hash(before);
  r.bytes=bytes.length;r.sha256=hash(bytes);
  r.adaptations=[...new Set([...(r.adaptations||[]),'Whole-word slide wrapping; responsive heading fit; GRAFIT site-only typography.'])];
 }
 const versions={};
 for(const ext of ['css','js']){
  const rel='lecture-typography.'+ext,data=fs.readFileSync(path.join(__dirname,'teaching-typography.'+ext));
  fs.writeFileSync(path.join(base,rel),data);record(rel,data,'tools/teaching-typography.'+ext);versions[ext]=hash(data).slice(0,12);
 }
 const presentations=[];
 function visit(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){
  if(e.isDirectory()){if(!['vendor','data'].includes(e.name))visit(path.join(dir,e.name));continue;}
  if(!e.name.endsWith('.html')||/before-|web-v1-/.test(e.name))continue;
  const full=path.join(dir,e.name),rel=path.relative(base,full).split(path.sep).join('/'),before=fs.readFileSync(full),html=before.toString('utf8');
  if(!/class=["'][^"']*\b(?:slide|reveal)\b/.test(html)&&!['dvd/tajemstvi/index.html'].includes(rel))continue;
  const r=manifest.files.find(x=>x.copy===rel);
  if(r&&r.sha256!==hash(before))throw Error('Unverified input: '+rel);
  if(!r&&!['pga/p05/2026/index.html','pga/p05/2026/workshop.html'].includes(rel))throw Error('Missing provenance: '+rel);
  const prefix=path.relative(path.dirname(full),base).split(path.sep).join('/')||'.';
  const next=Buffer.from(inject(html,`${prefix}/lecture-typography.css?v=${versions.css}`,`${prefix}/lecture-typography.js?v=${versions.js}`));
  fs.writeFileSync(full,next);record(rel,next,'published GRAFIT main cff4aee7ad77c44fce1102b8d4a008a6700b0ed9: vyuka/'+rel,before);presentations.push(rel);
 }}
 visit(base);
 // Validate archive bytes before repacking, just like HTML inputs.
 for(const r of manifest.files.filter(r=>r.copy.endsWith('/offline.zip')||r.copy==='roz/geometry-lab.zip')){
  const bytes=fs.readFileSync(path.join(base,r.copy));if(hash(bytes)!==r.sha256)throw Error('Unverified archive: '+r.copy);
  if(!r.preTypographySha256)r.preTypographySha256=r.sha256;
 }
 const offline=spawnSync('python',[path.join(__dirname,'update-teaching-offline.py'),base],{encoding:'utf8'});
 if(offline.status!==0)throw Error(offline.stderr||offline.stdout);
 for(const rel of JSON.parse(offline.stdout)){
  const r=manifest.files.find(x=>x.copy===rel);if(!r)throw Error('Missing ZIP provenance: '+rel);
  record(rel,fs.readFileSync(path.join(base,rel)),r.source);
 }
 // The original PGA01 package publishes a ledger beside its editable HTML.
 const sums=path.join(base,'pga/p01/SHA256SUMS.txt');
 if(fs.existsSync(sums)){
  const text=fs.readFileSync(sums,'utf8').replace(/\r\n/g,'\n').replace(/^([a-f0-9]{64})(\s+)(.+)$/gm,(all,h,space,rel)=>{const p=path.join(path.dirname(sums),rel);return fs.existsSync(p)?hash(fs.readFileSync(p))+space+rel:all;});
  fs.writeFileSync(sums,text);const r=manifest.files.find(x=>x.copy==='pga/p01/SHA256SUMS.txt');if(r)record(r.copy,Buffer.from(text),r.source);
 }
 fs.writeFileSync(mf,JSON.stringify(manifest,null,2)+'\n');
 console.log('Applied whole-word typography to '+presentations.length+' lecture pages.');
};
if(require.main===module)module.exports(path.resolve(process.argv[2]||path.join(__dirname,'../vyuka')));
