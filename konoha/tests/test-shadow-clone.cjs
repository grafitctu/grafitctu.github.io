const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {ShadowClone,GhostTrack,validReplay,KEY}=require('../ghost.js');
const {NinjaGame}=require('../engine.js');
const rules='konoha-v11',map='rooftops-branch-v1';
const store=()=>{const data=new Map();return {data,getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v)}};
const row=(t,x,cut=0)=>[t,x,400,1,4,40,0,cut,[[4,1]]];
const replay=(time=60)=>({format:1,rules,map,time,samples:[row(0,80),row(10,1000),row(time,9001)]});
assert.ok(validReplay(replay(),rules,map));
for(const mutate of [r=>r.rules='old',r=>r.map='other',r=>r.samples[1][0]=0,r=>r.samples[1][1]=Infinity,
 r=>r.samples[1][4]=64,r=>r.samples[1][8][0][1]=-1,r=>r.samples[1][7]=2,r=>r.samples.pop(),r=>r.samples[0][0]=1]){
 const r=replay();mutate(r);assert.equal(validReplay(r,rules,map),false);
}
{
 const r=replay();r.samples=[row(0,80),row(1,180),row(6,80,1),row(7,280),row(60,9001)];
 const t=new GhostTrack(r);
 assert.equal(t.at(.5).x,130,'positions interpolate');
 assert.equal(t.at(5).x,180,'penalty holds previous position, never lerps across respawn');
 assert.equal(t.at(6).x,80,'respawn snaps at recorded time');
 assert.equal(t.at(61).x,9001,'finish holds');assert.equal(t.at(61).finished,true);
 assert.equal(t.arrival(130),.5,'first passage');assert.equal(t.arrival(180),1,'return trip cannot rewrite split');
 assert.equal(t.arrival(280),7);
 const paused=JSON.stringify(t.at(4));assert.equal(JSON.stringify(t.at(4)),paused,'same clock = frozen replay');
}
{
 const t=new GhostTrack({time:4,samples:[row(0,80),row(2,80),row(3,180),row(4,280)]});
 assert.equal(t.arrival(130),2.5,'standing still does not smear pace over entire run');
}
{
 const storage=store();storage.setItem(KEY,JSON.stringify(replay()));
 const c=new ShadowClone(storage,rules,map),g=new NinjaGame();g.reset();c.begin(g);
 const original=c.reference;
 g.time=10;g.p.x=1000;c.sample(g);g.time=55;g.p.x=9001;g.state='won';
 assert.equal(c.finish(g),true);assert.equal(c.best.replay.time,55);assert.equal(c.reference,original,'opponent frozen until next start');
 assert.equal(c.delta(g),-5,'final pace uses result time');assert.equal(c.finish(g),false,'terminal event idempotent');
 g.reset();c.begin(g);assert.equal(c.reference.replay.time,55);
 g.time=60;g.p.x=9001;g.state='won';assert.equal(c.finish(g),false,'slower finish preserves clone');
 g.reset();c.begin(g);g.time=1;g.state='dead';assert.equal(c.finish(g),false,'failed attempt never replaces clone');
 const loaded=new ShadowClone(storage,rules,map);assert.equal(loaded.best.replay.time,55,'persists reload');
 g.reset();loaded.begin(g);g.time=9;g.penalty=5;g.bestX=1000;assert.equal(loaded.delta(g),4,'pace includes penalty');
 const bytes=storage.getItem(KEY);storage.setItem(KEY,'{broken');assert.equal(new ShadowClone(storage,rules,map).best,null);
 storage.setItem(KEY,bytes);assert.equal(new ShadowClone(storage,rules,'different').best,null,'map mismatch rejected');
}
{
 const blocked={getItem(){throw Error('blocked')},setItem(){throw Error('quota')}};
 const c=new ShadowClone(blocked,rules,map),g=new NinjaGame();g.reset();c.begin(g);
 g.time=60;g.p.x=9001;g.state='won';assert.equal(c.finish(g),true);assert.ok(c.best);assert.equal(c.persisted,false);
}
{
 const g=new NinjaGame();g.reset();const c=new ShadowClone(store(),rules,map);c.begin(g);
 for(let i=1;i<10000;i++){g.time=i/25;g.p.x=80+i*.8;c.sample(g);}
 assert.ok(c.samples.length<9000&&c.interval>1/30,'long runs thin samples instead of truncating ending');
 g.time=401;g.p.x=9001;g.state='won';assert.ok(c.finish(g));assert.ok(c.best.replay.samples.at(-1)[1]>=9000);
}
// Observe a full real course. Recording must not change physics, hits, finish time or score.
const {traverse}=require('./test-course-v4.cjs');
const baseline=traverse({shots:true}).g;
const c=new ShadowClone(store(),rules,map);
const recorded=traverse({shots:true,onStart:g=>c.begin(g),onStep:g=>c.sample(g)}).g;
assert.deepEqual([recorded.time,recorded.score,recorded.hp,recorded.stats],[baseline.time,baseline.score,baseline.hp,baseline.stats]);
assert.ok(c.finish(recorded));assert.ok(c.best.replay.samples.length>500);
assert.ok(JSON.stringify(c.best.replay).length<2000000);
// Browser integration: no DOM/network dependency in recording; real start/end/render wiring.
const nodes={},storage=store(),ctx=new Proxy({},{get:(t,k)=>k==='createLinearGradient'?()=>({addColorStop(){}}):()=>{},set:()=>true});
storage.setItem(KEY,JSON.stringify(replay()));
const el=id=>nodes[id]??={style:{},dataset:{},classList:{add(){},remove(){}},getContext:()=>ctx,getBoundingClientRect:()=>({width:960,height:480}),focus(){},setAttribute(){},addEventListener(){}};
const context=vm.createContext({NinjaGame,ShadowClone,document:{getElementById:el,querySelectorAll:()=>[],addEventListener(){}},window:{addEventListener(){}},HTMLInputElement:class{},matchMedia:()=>({matches:false}),ResizeObserver:class{observe(){}},requestAnimationFrame(){},localStorage:storage});
vm.runInContext(fs.readFileSync(path.join(__dirname,'../game.js'),'utf8'),context);const run=s=>vm.runInContext(s,context);
run('start();g.time=9;g.bestX=1000;render(.04);updateHud()');
assert.match(nodes.cloneDelta.textContent,/NÁSKOK −1.0/);assert.equal(nodes.cloneProgress.hidden,false);
run('g.penalty=5;updateHud()');assert.match(nodes.cloneDelta.textContent,/ZTRÁTA \+4.0/);
run('pause();render(.2)');const n=run('shadow.samples.length');run('render(.2)');assert.equal(run('shadow.samples.length'),n);
nodes.cloneToggle.checked=false;nodes.cloneToggle.onchange();run('updateHud()');assert.equal(nodes.cloneProgress.hidden,true);
assert.equal(storage.getItem('konoha-clone-visible'),'off');
run('start();g.time=50;g.p.x=9001;g.state="won";g.event("won");events();updateHud()');
assert.equal(run('shadow.best.replay.time'),50);assert.equal(run('shadow.reference.replay.time'),60);
run('start();updateHud()');assert.equal(run('shadow.reference.replay.time'),50);assert.equal(run('shadow.samples[0][0]'),0);
console.log('PASS clone: validation, interpolation/respawn/penalties, first-passage pace, pause, fastest completed run only, frozen opponent, reload/quota handling, long-run bounds, full-course non-interference, actual UI lifecycle and hide toggle.');
