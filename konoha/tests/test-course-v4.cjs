const {NinjaGame}=require('../engine.js');const assert=require('node:assert/strict');
function traverse({shots=true,startZone=0,onStart=()=>{},onStep=()=>{}}={}){
 const g=new NinjaGame();g.state='playing';if(startZone){g.checkpoint=g.checkpoints[startZone].x;g.checkpointY=g.checkpoints[startZone].y;g.respawn();g.bestX=g.p.x;}
 let lastJump=-1,lastDash=-1,trace=[],lastZone=-1,stuck=0,lastX=0;
 onStart(g);
 for(let i=0;i<120*180&&g.state==='playing';i++){
  const p=g.p,feet=p.y+p.h;
  const tunnel=g.solids.find(s=>s.type==='beam'&&p.x+p.w>s.x-150&&p.x<s.x+s.w+5);
  const slide=!!tunnel;
  const support=g.solids.find(s=>Math.abs(s.y-feet)<3&&p.x+p.w>s.x&&p.x<s.x+s.w);
  const roof=g.solids.find(s=>s.type==='roof'&&p.x>=s.x-2&&p.x<s.x+s.w);
  const nextRoof=g.solids.find(s=>s.type==='roof'&&s.x>p.x);
  const inGap=!roof;
  const ahead=g.solids.filter(s=>s.type!=='beam'&&s.x>=p.x+p.w-2&&s.x-p.x<85&&s.y<feet-8&&s.y+s.h>p.y).sort((a,b)=>a.x-b.x)[0];
  const jump=()=>{g.pressJump();g.releaseJump();lastJump=g.time;};
  if(!slide&&p.ground&&g.time-lastJump>.2&&(ahead||(support&&support.x+support.w-p.x<58)))jump();
  if(p.wallGrace>0&&!p.ground&&p.vy> -120&&g.time-lastJump>.24)jump();
  else if(!slide&&!p.ground&&p.dash===0&&p.vy> -10&&p.jumps>0&&g.time-lastJump>.25&&(inGap||ahead||nextRoof&&nextRoof.y<feet-20))jump();
  if(inGap&&!p.ground&&p.cool===0&&p.dash===0&&p.jumps===0&&p.vy> -20&&nextRoof&&nextRoof.x-p.x>85&&g.time-lastJump>.18){g.dash();lastDash=g.time;}
  if(shots&&g.shots.some(s=>s.x>p.x&&s.x-p.x<75&&Math.abs(s.y-p.y)<45))g.dash();
  if(!shots)g.shots=[];
  const brake=tunnel&&!inGap&&!p.ground&&feet<tunnel.y+tunnel.h+35&&p.x<tunnel.x-24;
  g.update(1/120,{right:!brake,slide});
  onStep(g);
  if(g.zoneIndex!==lastZone){trace.push({zone:g.zoneIndex,x:Math.round(g.p.x),time:+g.time.toFixed(2),hp:g.hp});lastZone=g.zoneIndex;}
  if(i%120===0){if(Math.abs(g.p.x-lastX)<5)stuck++;else stuck=0;lastX=g.p.x;}
  if(stuck>5)break;
  g.events=[];
 }
 return {g,result:{state:g.state,x:g.p.x,y:g.p.y,hp:g.hp,time:g.time,stats:g.stats,trace}};
}
if(require.main===module){for(const shots of [false,true]){let {g,result}=traverse({shots});console.log(JSON.stringify({shots,...result}));assert.equal(g.state,'won');assert.ok(g.stats.wall>=5);assert.ok(g.stats.slide>=4);assert.ok(g.stats.dash>=3);}}
module.exports={traverse};
