// Behavior tests: farming, both physical branch routes, medals and telegraph lifecycle.
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm');
const {NinjaGame}=require('../engine.js');
const tick=(g,input={})=>{g.update(1/120,input);g.events=[];};
const fresh=()=>{const g=new NinjaGame();g.reset();return g;};
for(const mode of ['slide','jump']) {
 const g=fresh();
 for(let i=0;i<7200;i++) {
  if(mode==='jump'&&g.p.ground) {g.pressJump();g.releaseJump();}
  tick(g,{slide:mode==='slide'&&i%24<12});
 }
 assert.equal(g.score,0,mode+' cannot farm 60s at spawn');
}
{
 const g=fresh();g.p.x=1100;
 for(let i=0;i<1000;i++)g.hazardAward(150,'deflect');
 assert.equal(g.score,150,'one hazard reward per sector');
 g.p.inv=0;g.damage();g.p.x=1100;g.hazardAward(150,'deflect');
 assert.equal(g.score,150,'respawn preserves awarded hazard sectors');
 for(let i=0;i<20;i++)g.award('unique:'+i,10,['jump','wall','slide','gap'][i%4]);
 assert.equal(g.combo,3,'bounded variety multiplier');
}
{
 const g=fresh();g.bestX=700;g.progressStep=6;
 const traverse=()=>{g.p.x=435;g.p.y=360;g.p.h=40;g.p.vx=0;g.p.ground=true;
  for(let i=0;i<200&&g.p.x<600;i++)tick(g,{right:true,slide:true});};
 traverse();const points=g.score;
 assert.ok(points>=150,'actual first beam crossing scores');
 traverse();assert.equal(g.score,points,'crossing same beam twice cannot farm');
}
{
 const g=fresh();g.p.x=2075;g.p.y=300;g.bestX=2075;
 for(let i=0;i<500&&g.p.x<2520;i++) {g.shots=[];tick(g,{right:true,slide:true});}
 assert.ok(g.p.x>=2520&&g.hp===3,'lower route rejoins without jumps or damage');
 assert.equal(g.scroll.taken,false,'lower route does not receive upper reward');
 assert.ok(g.awarded.has(g.solids.find(s=>s.type==='beam'&&s.x===2215).id));
}
{
 const g=fresh();g.p.x=2075;g.p.y=300;g.bestX=2075;let last=-1;
 for(let i=0;i<1200&&!g.scroll.taken;i++) {
  const p=g.p;
  if(p.x<2410&&(p.ground&&g.time-last>.2||p.wallGrace>0&&!p.ground&&p.vy>-120&&g.time-last>.24||!p.ground&&p.vy>-10&&p.jumps>0&&g.time-last>.25)) {
   g.pressJump();g.releaseJump();last=g.time;
  }
  const desired=p.x<2410?245:Math.max(-245,Math.min(245,(2450-p.x)*4));
  g.shots=[];tick(g,{right:p.vx<desired-15,left:p.vx>desired+15});
 }
 assert.ok(g.scroll.taken&&g.stats.wall>0&&g.hp===3,'upper scroll reached through real input/wall jump');
 const score=g.score;assert.equal(g.award('scroll',500,'scroll',false),0);assert.equal(g.score,score);
 for(let i=0;i<240&&g.p.x<2520;i++){g.shots=[];tick(g,{right:true});}
 assert.ok(g.p.x>=2520&&g.hp===3,'upper route rejoins');
}
{
 const g=fresh();g.time=65;assert.equal(g.medal(),null,'no medal before finish');
 g.p.inv=0;g.damage();assert.equal(g.resultTime,70);g.state='won';assert.equal(g.medal(),'gold');
 for(const [time,medal] of [[70,'gold'],[70.01,'silver'],[100,'silver'],[100.01,'bronze'],[150,'bronze'],[150.01,'finish']]) {
  g.time=time;g.penalty=0;assert.equal(g.medal(),medal);
 }
 g.state='paused';const t=g.time;tick(g);assert.equal(g.time,t,'pause excludes time');
 g.reset();assert.equal(g.penalty,0);assert.equal(g.awarded.size,0);
}
{
 const g=fresh();g.p.x=1000;g.p.y=330;g.spawnTimer=0;tick(g);
 const shot=g.shots[0],x=shot.x;assert.ok(shot.windup>.6);
 for(let i=0;i<60;i++)tick(g);assert.equal(shot.x,x,'windup stays still');
 for(let i=0;i<25;i++)tick(g);assert.ok(shot.x<x,'projectile releases after windup');
}
for(const lives of [1,2]) {
 const g=fresh();Object.assign(g.p,{x:g.finish-1,y:360,ground:true,vx:245,inv:0});
 g.hp=lives;g.shots=[{x:g.finish,y:360,w:17,h:17,vx:0,spin:0,near:false}];tick(g,{right:true});
 assert.equal(g.state,lives===1?'dead':'playing','hit at finish must not grant a win from stale player');
 assert.equal(g.medal(),null);assert.equal(g.awarded.has('finish'),false);
}
// Exercise actual browser functions in a VM; only DOM and Canvas are test doubles.
const nodes={},stored=new Map(),ctx=new Proxy({},{get:(t,k)=>k==='createLinearGradient'?()=>({addColorStop(){}}):()=>{},set:()=>true});
const el=id=>nodes[id]??={style:{},dataset:{},classList:{add(){},remove(){}},getContext:()=>ctx,getBoundingClientRect:()=>({width:960,height:480}),focus(){},setAttribute(){},addEventListener(){}};
const context=vm.createContext({NinjaGame,console,document:{getElementById:el,querySelectorAll:()=>[],addEventListener(){}},window:{addEventListener(){}},HTMLInputElement:class{},matchMedia:()=>({matches:false}),ResizeObserver:class{observe(){}},requestAnimationFrame(){},localStorage:{getItem:k=>stored.get(k),setItem:(k,v)=>stored.set(k,v)}});
vm.runInContext(fs.readFileSync(require('node:path').join(__dirname,'../game.js'),'utf8'),context);const run=s=>vm.runInContext(s,context);
for(const [w,h] of [[480,504],[960,480],[960,250]]) {
 run(`W=${w};H=${h};start();g.p.x=1800;g.p.y=100;g.p.vx=850;resetCamera();`);
 for(let i=0;i<90;i++)run('g.p.x+=g.p.vx/60;updateCamera(1/60)');
 assert.ok(run('g.p.x-cam')>=w*.14-1&&run('g.p.x-cam')<=w*.78+1,'dash remains framed');
 assert.ok(run('g.p.y+H-480+camY')>=31,'upper route visible');
 run('g.p.vx=-500');for(let i=0;i<60;i++)run('g.p.x+=g.p.vx/60;updateCamera(1/60)');
 assert.ok(run('lookAhead')<0,'lookahead follows reversal');
 run('g.shots=[{x:g.p.x+650,y:200,vx:-260,windup:0}];g.p.vx=0;resetCamera();render(.05)');
 assert.ok(run('shotIndicator(g.shots[0])!==null')||w>650,'offscreen warning independent of timer');
}
run('start();updateHud()');assert.equal(nodes.tutorial.hidden,false);assert.match(nodes.tutorialTitle.textContent,/1\/6/);
run('g.bestX=160;updateHud()');assert.match(nodes.tutorialTitle.textContent,/2\/6/);
run('g.state="paused";updateHud()');assert.equal(nodes.tutorial.hidden,true);
run('g.state="won";g.time=68;g.score=1234;saveResult();updateHud();syncOverlay()');
assert.equal(JSON.parse(stored.get('konoha-records-v11')).time,68);
assert.equal(nodes.overlayHint.dataset.medal,'gold');
run('start();g.time=1;g.state="dead";saveResult()');assert.equal(run('records.time'),68,'failed run cannot set best time');
run('endTutorial()');assert.equal(stored.get('konoha-tutorial-v11'),'done');
console.log('PASS v11: anti-farming, repeat obstacles/respawn, both physical routes, scroll, medal edges/penalty/pause, windup, camera 3 viewports, warnings, tutorial and versioned local records.');
