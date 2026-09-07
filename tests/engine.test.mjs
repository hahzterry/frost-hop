import test from 'node:test';
import assert from 'node:assert/strict';
import {TowerGame, STEP, WIDTH, HEIGHT} from '../game/engine.mjs';
const tick=(g,n,input={})=>{for(let i=0;i<n;i++)g.update(STEP,input);};
const make=()=>{const g=new TowerGame(()=>.5);g.start();return g;};
test('running speed gives a higher jump than standing',()=>{
  const a=make(),b=make();b.player.vx=430;
  a.update(STEP,{jump:true});b.update(STEP,{jump:true,right:true});
  assert.ok(b.player.vy<a.player.vy-200);
});
test('platforms allow ascent through them and catch a descending player',()=>{
  const g=make();g.player.y=490;g.player.vy=-300;g.player.grounded=false;g.coyote=0;
  g.update(STEP);assert.ok(g.player.vy<0);assert.equal(g.player.grounded,false);
  g.player.y=475;g.player.vy=200;
  tick(g,8);assert.equal(g.player.y,480);assert.equal(g.player.grounded,true);assert.equal(g.floor,1);
});
test('two-floor landings score a combo and chain within the time limit',()=>{
  const g=make();const land=n=>{g.player.y=590-n*70-41;g.player.vy=300;g.player.grounded=false;g.update(STEP);};
  land(2);assert.equal(g.combo,1);assert.equal(g.score,300);
  land(4);assert.equal(g.combo,2);assert.equal(g.score,700);assert.equal(g.maxCombo,2);
  tick(g,421);assert.equal(g.combo,0);
});
test('pause freezes player, camera, timer and score',()=>{
  const g=make();tick(g,10,{right:true,jump:true});g.pause();const before=JSON.stringify({...g,events:[]});
  tick(g,120,{jump:true,left:true});assert.equal(JSON.stringify({...g,events:[]}),before);g.resume();assert.equal(g.status,'playing');
});
test('walls reflect momentum and keep the climber inside the tower',()=>{
  const g=make();g.player.x=WIDTH-18-g.player.w;g.player.vx=400;g.update(STEP);
  assert.ok(g.player.vx<0);assert.ok(g.player.x+g.player.w<=WIDTH-18);
});
test('generated platforms stay reachable and bounded over a long climb',()=>{
  let seed=7;const rng=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646;};
  const g=new TowerGame(rng);
  for(let i=0;i<500;i++){
    g.camera=-i*70;g.generate();assert.ok(g.platforms.length<30);
    for(let j=1;j<g.platforms.length;j++){
      const a=g.platforms[j-1],b=g.platforms[j];assert.equal(a.y-b.y,70);assert.ok(b.x>=18&&b.x+b.w<=WIDTH-18);
      const gap=Math.max(0,b.x-(a.x+a.w),a.x-(b.x+b.w));assert.ok(gap<70);
    }
  }
});
test('camera eventually overtakes an idle climber after ascent',()=>{
  const g=make();g.floor=1;g.ascentAt=0;tick(g,8000);assert.equal(g.status,'over');assert.ok(g.player.y>g.camera+HEIGHT);
});
test('restart clears score, combo and motion',()=>{
  const g=make();tick(g,40,{right:true,jump:true});g.bonus=100;g.combo=3;g.start();assert.equal(g.score,0);assert.equal(g.combo,0);assert.equal(g.player.vx,0);assert.equal(g.status,'playing');
});
