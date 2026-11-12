/** Stínový klon: čistý záznam/prezentace, nikdy další fyzikální hráč.
 * UMD kvůli file:// i Node testům. Čas je engine.resultTime (včetně penalizací).
 * Řádek: [čas,x,chodidla,směr,frame,výška,headX,cut,[[frame,váha],...]].
 * cut znamená respawn: během penalizační mezery drž starou pozici, pak skoč na novou.
 * Formát, mapa a pravidla se kontrolují před přehráním cizích/starých localStorage dat.
 */
(function(root){
  'use strict';
  const KEY='konoha-shadow-clone-v1', FORMAT=1, MAX_BYTES=2000000;
  const round=(n,d=1000)=>Math.round(n*d)/d;
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  function validReplay(r,rules,map){
    if(!r||r.format!==FORMAT||r.rules!==rules||r.map!==map||!Number.isFinite(r.time)||r.time<=0||r.time>86400||
      !Array.isArray(r.samples)||r.samples.length<2||r.samples.length>12000) return false;
    let last=-1;
    for(const s of r.samples){
      if(!Array.isArray(s)||s.length!==9||!s.slice(0,8).every(Number.isFinite)||s[0]<=last||s[0]>r.time+.001||
        s[1]<0||s[1]>10000||s[2]<-4000||s[2]>1000||![-1,1].includes(s[3])||
        !Number.isInteger(s[4])||s[4]<0||s[4]>63||s[5]<1||s[5]>150||Math.abs(s[6])>100||
        ![0,1].includes(s[7])||!Array.isArray(s[8])||s[8].length<1||s[8].length>4) return false;
      let weight=0;
      for(const l of s[8]){
        if(!Array.isArray(l)||l.length!==2||!Number.isInteger(l[0])||l[0]<0||l[0]>63||
          !Number.isFinite(l[1])||l[1]<=0||l[1]>1) return false;
        weight+=l[1];
      }
      if(Math.abs(weight-1)>.01) return false;
      last=s[0];
    }
    return r.samples[0][0]===0&&Math.abs(last-r.time)<.001&&r.samples.at(-1)[1]>=9000;
  }
  class GhostTrack {
    constructor(replay){
      this.replay=replay;
      this.samples=replay.samples;
      // First-passage times, not x/speed: stopping, backtracking and different routes
      // must not produce invented pace. Interpolate only within real movement segments.
      this.segments=[];
      let frontier=this.samples[0][1];
      for(let i=1;i<this.samples.length;i++){
        const a=this.samples[i-1],b=this.samples[i];
        if(b[1]>frontier){
          if(!b[7]&&b[1]>a[1]){
            const t=a[0]+(b[0]-a[0])*(frontier-a[1])/(b[1]-a[1]);
            this.segments.push([frontier,b[1],t,b[0]]);
          }
          frontier=b[1];
        }
      }
    }
    at(time){
      const rows=this.samples;
      let lo=0,hi=rows.length-1;
      while(lo<hi){const m=Math.ceil((lo+hi)/2);if(rows[m][0]<=time)lo=m;else hi=m-1;}
      const a=rows[lo],b=rows[Math.min(lo+1,rows.length-1)];
      const f=b[7]||a===b?0:clamp((time-a[0])/(b[0]-a[0]),0,1);
      const mix=(i)=>a[i]+(b[i]-a[i])*f;
      const layers=new Map();
      for(const [frame,weight] of a[8])layers.set(frame,(layers.get(frame)||0)+weight*(1-f));
      for(const [frame,weight] of b[8])layers.set(frame,(layers.get(frame)||0)+weight*f);
      return {x:mix(1),feet:mix(2),face:f<.5?a[3]:b[3],
        pose:{frame:a[4],height:mix(5),headX:mix(6),layers:[...layers].filter(l=>l[1]>.0001).map(([frame,weight])=>({frame,weight}))},
        finished:time>=this.replay.time};
    }
    arrival(x){
      if(x<=this.samples[0][1]) return 0;
      let lo=0,hi=this.segments.length;
      while(lo<hi){const m=(lo+hi)>>1;if(this.segments[m][1]<x)lo=m+1;else hi=m;}
      const s=this.segments[lo];
      if(!s||x<s[0]) return null;
      return s[2]+(s[3]-s[2])*(x-s[0])/(s[1]-s[0]);
    }
  }
  class ShadowClone {
    constructor(storage,rules,map){
      this.storage=storage;this.rules=rules;this.map=map;this.best=null;this.reference=null;
      this.samples=[];this.persisted=true;this.recording=false;
      try {
        const raw=storage?.getItem(KEY);
        if(raw&&raw.length<=MAX_BYTES){const r=JSON.parse(raw);if(validReplay(r,rules,map))this.best=new GhostTrack(r);}
      }catch{} // Disabled storage, partial/corrupt or incompatible data: play normally.
    }
    begin(g,pose){
      this.reference=this.best; // Freeze the opponent for the WHOLE attempt, including result screen.
      this.samples=[];this.interval=1/30;this.lastPlayer=null;this.recording=true;
      this.sample(g,pose,true);
    }
    sample(g,pose,force=false){
      if(!this.recording||!['playing','won'].includes(g.state))return;
      const time=round(g.resultTime,10000),previous=this.samples.at(-1);
      const cut=this.lastPlayer!==null&&this.lastPlayer!==g.p;
      if(previous&&time<=previous[0])return;
      if(previous&&!force&&!cut&&time-previous[0]<this.interval-1e-6)return;
      const p=g.p,frame=pose?.frame??0;
      const layers=(pose?.layers||[{frame,weight:1}]).filter(l=>l.weight>.001)
        .sort((a,b)=>b.weight-a.weight).slice(0,4);
      const total=layers.reduce((sum,l)=>sum+l.weight,0)||1;
      this.samples.push([time,round(p.x,10),round(p.y+p.h,10),p.wall&&!p.ground&&p.vy>=0?p.wall:p.face,
        frame,round(pose?.height??p.h,100),round(pose?.headX??0,100),cut?1:0,
        layers.map(l=>[l.frame,round(l.weight/total,10000)])]);
      this.lastPlayer=p;
      // Bound memory without dropping the ending of a long run. Preserve both sides
      // of respawns; progressively thin ordinary frames (30 -> 15 -> 7.5 Hz...).
      if(this.samples.length>9000){
        this.samples=this.samples.filter((s,i,all)=>i%2===0||s[7]||all[i+1]?.[7]||i===all.length-1);
        this.interval*=2;
      }
    }
    finish(g,pose){
      if(!this.recording)return false;
      this.sample(g,pose,true);this.recording=false;
      if(g.state!=='won'||(this.best&&g.resultTime>=this.best.replay.time-.0001))return false;
      const replay={format:FORMAT,rules:this.rules,map:this.map,time:round(g.resultTime,10000),samples:this.samples};
      if(!validReplay(replay,this.rules,this.map))return false;
      this.best=new GhostTrack(replay);this.persisted=false;
      try {
        const raw=JSON.stringify(replay);
        if(this.storage&&raw.length<=MAX_BYTES){this.storage.setItem(KEY,raw);this.persisted=true;}
      }catch{} // Quota failure keeps the new clone in memory for the current page session.
      return true;
    }
    delta(g){
      if(!this.reference)return null;
      if(g.state==='won')return g.resultTime-this.reference.replay.time;
      const t=this.reference.arrival(g.bestX);
      return t===null?null:g.resultTime-t;
    }
  }
  const api={ShadowClone,GhostTrack,validReplay,KEY};
  if(typeof module!=='undefined')module.exports=api;
  else {root.ShadowClone=ShadowClone;root.GhostTrack=GhostTrack;}
})(typeof window!=='undefined'?window:globalThis);
