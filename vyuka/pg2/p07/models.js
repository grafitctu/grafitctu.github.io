(function(root){
  'use strict';
  function framebuffer(width,height,bits,buffers,fps){
    if (![width,height,bits,buffers,fps].every(Number.isInteger) || width<1||height<1||bits<1||buffers<1||fps<1) throw Error('Invalid framebuffer parameters');
    const rowBytes=Math.ceil(width*bits/8), frameBytes=rowBytes*height;
    return {rowBytes,frameBytes,allocatedBytes:frameBytes*buffers,writeBytesPerSecond:frameBytes*fps,dirtyFlags:Math.ceil(width/16)*Math.ceil(height/16)};
  }
  function patch(size,strength,seed,tile,repeat){
    if(!Number.isInteger(size)||size<3||!Number.isFinite(strength)||strength<0||strength>1)throw Error('Invalid texture parameters');
    const a=new Uint8ClampedArray(size*size),phase=(repeat?0:tile)*1.731+seed*.319;
    for(let y=0;y<size;y++)for(let x=0;x<size;x++){
      const u=x/(size-1),v=y/(size-1),base=.48+.13*Math.cos(2*Math.PI*(u+v));
      const variation=.30*Math.sin(3*Math.PI*u+phase)*Math.cos(5*Math.PI*v-phase);
      a[y*size+x]=255*Math.max(0,Math.min(1,base+strength*Math.sin(Math.PI*u)*Math.sin(Math.PI*v)*variation));
    }
    return a;
  }
  function texture(strength,seed,repeat){
    const size=24,cols=4,rows=3,tiles=Array.from({length:cols*rows},(_,n)=>patch(size,strength,seed,n,repeat));
    let maxEdgeError=0;
    for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){
      const a=tiles[y*cols+x];
      if(x+1<cols){const b=tiles[y*cols+x+1];for(let i=0;i<size;i++)maxEdgeError=Math.max(maxEdgeError,Math.abs(a[i*size+size-1]-b[i*size]));}
      if(y+1<rows){const b=tiles[(y+1)*cols+x];for(let i=0;i<size;i++)maxEdgeError=Math.max(maxEdgeError,Math.abs(a[(size-1)*size+i]-b[i]));}
    }
    return {size,cols,rows,tiles,maxEdgeError};
  }
  const api={framebuffer,patch,texture};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  else root.GrafitWeek07Models=api;
})(typeof globalThis!=='undefined'?globalThis:this);
