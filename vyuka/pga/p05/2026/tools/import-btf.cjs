// Extract original UBO2003 JPEG bytes, without transcoding or normalizing exposure.
const fs=require('fs'),path=require('path'),zlib=require('zlib'),crypto=require('crypto'),assert=require('assert');
const root=path.resolve(__dirname,'../data/btf'),archive=path.join(root,'UBO_CORDUROY256.zip'),buf=fs.readFileSync(archive);
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const table=Array.from({length:256},(_,n)=>{for(let k=0;k<8;k++)n=n&1?0xedb88320^(n>>>1):n>>>1;return n>>>0;});
function crc32(b){let crc=0xffffffff;for(let v of b)crc=table[(crc^v)&255]^(crc>>>8);return (crc^0xffffffff)>>>0;}
let end=-1;for(let p=buf.length-22;p>=Math.max(0,buf.length-65557);p--)if(buf.readUInt32LE(p)===0x06054b50){end=p;break;}assert(end>=0,'ZIP end record');
const count=buf.readUInt16LE(end+10);let p=buf.readUInt32LE(end+16),entries=[];fs.mkdirSync(path.join(root,'frames'),{recursive:true});
for(let k=0;k<count;k++){
 assert.equal(buf.readUInt32LE(p),0x02014b50);const method=buf.readUInt16LE(p+10),crc=buf.readUInt32LE(p+16),compressed=buf.readUInt32LE(p+20),size=buf.readUInt32LE(p+24),nl=buf.readUInt16LE(p+28),el=buf.readUInt16LE(p+30),cl=buf.readUInt16LE(p+32),offset=buf.readUInt32LE(p+42),name=buf.toString('utf8',p+46,p+46+nl);p+=46+nl+el+cl;
 const match=name.match(/(?:^|\/)(\d+) tl(\d+) pl(\d+) tv(\d+) pv(\d+)\.jpg$/i);assert(match,'Unexpected archive entry '+name);
 assert.equal(buf.readUInt32LE(offset),0x04034b50);const start=offset+30+buf.readUInt16LE(offset+26)+buf.readUInt16LE(offset+28),packed=buf.subarray(start,start+compressed),bytes=method===8?zlib.inflateRawSync(packed):method===0?packed:null;assert(bytes&&bytes.length===size);assert.equal(crc32(bytes),crc,'CRC '+name);assert.equal(bytes.readUInt16BE(0),0xffd8);
 const [,id,tl,pl,tv,pv]=match,file=`frames/${id.padStart(5,'0')}.jpg`;fs.writeFileSync(path.join(root,file),bytes);entries.push({id:Number(id),light:[+tl,+pl],view:[+tv,+pv],file,original:name,sha256:sha(bytes),bytes:size});
}
const directions=axis=>[...new Map(entries.map(e=>[e[axis].join(','),e[axis]])).values()].sort((a,b)=>a[0]-b[0]||a[1]-b[1]),lights=directions('light'),views=directions('view'),key=a=>a.join(','),map=new Map(entries.map(e=>[key(e.light)+'|'+key(e.view),e]));assert.equal(lights.length,81);assert.equal(views.length,81);assert.equal(entries.length,6561);assert.equal(map.size,6561);
const frames=lights.flatMap(l=>views.map(v=>{const e=map.get(key(l)+'|'+key(v));assert(e);return e.file;})),reference=map.get('0,0|0,0');assert(reference);
const data={material:'CORDUROY',dataset:'Bonn UBO2003',source:'https://cg.cs.uni-bonn.de/btf/UBO2003/CORDUROY/ONEFILE/UBO_CORDUROY256.zip',citation:'Mirko Sattler, Ralf Sarlette, Reinhard Klein: Efficient and Realistic Visualization of Cloth. Eurographics Symposium on Rendering, 2003.',width:256,height:256,physicalSizeMM:[22.01,22.01],lights,views,frames,reference:reference.file,referenceData:'data:image/jpeg;base64,'+fs.readFileSync(path.join(root,reference.file)).toString('base64')};
fs.writeFileSync(path.join(root,'dataset.js'),'window.BTF_DATA='+JSON.stringify(data)+';\n');
fs.writeFileSync(path.join(root,'manifest.json'),JSON.stringify({...data,referenceData:undefined,frames:undefined,archiveSha256:sha(buf),archiveBytes:buf.length,extraction:'Original JPEG bytes, CRC32 verified for every entry. No image edits, resampling or exposure normalization.',entries},null,2));
console.log({images:entries.length,lights:lights.length,views:views.length,archiveSha256:sha(buf),reference:reference.file});
