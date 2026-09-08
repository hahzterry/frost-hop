import test from 'node:test';
import assert from 'node:assert/strict';
import { RenderBudget } from '../game/render-budget.mjs';
import { SpriteCache } from '../game/sprite-cache.mjs';
test('60 Hz rendering ceiling at 60, 90, 120 and 144 Hz; no missed simulation callbacks',()=>{
 for(const hz of [60,90,120,144]){
  const b=new RenderBudget(3);let draws=0,callbacks=0;
  for(let i=0;i<hz*10;i++){callbacks++;if(b.shouldDraw(i*1000/hz))draws++;}
  assert.equal(callbacks,hz*10);assert.ok(draws>=590&&draws<=601,`${hz}Hz drew ${draws}`);
 }
});
test('sustained load lowers resolution, recovery is slower, pause resets samples',()=>{
 const b=new RenderBudget(3);assert.equal(b.scale,2);
 for(let t=0;t<=2100;t+=1000/30)b.sample(t,15,true);
 assert.equal(b.scale,1.75);
 for(let t=2200;t<20000;t+=1000/30)b.sample(t,15,true);
 assert.equal(b.scale,1);
 b.reset();for(let t=0;t<6100;t+=1000/60)b.sample(t,2,true);
 assert.equal(b.scale,1);
 for(let t=6100;t<8500;t+=1000/60)b.sample(t,2,true);
 assert.equal(b.scale,1.25);
 b.sample(10000,90,false);assert.equal(b.frames,0);assert.equal(b.windowStart,null);
 b.reset();assert.equal(b.shouldDraw(900000),true);
});
test('sprite cache reuses paint and releases backing stores at its memory ceiling',()=>{
 const original=globalThis.OffscreenCanvas;
 globalThis.OffscreenCanvas=class{constructor(w,h){this.width=w;this.height=h;}getContext(){return {scale(){}};}};
 try{
  const c=new SpriteCache(128);let paints=0;const paint=()=>paints++;
  const first=c.get('a',4,4,paint,1);assert.equal(c.get('a',4,4,paint,1),first);assert.equal(paints,1);
  c.get('b',4,4,paint,1);c.get('c',4,4,paint,1);
  assert.equal(c.bytes,128);assert.equal(c.entries.size,2);assert.equal(first.width,1);
  assert.equal(c.get('huge',100,100,paint,1),null);
 }finally{if(original===undefined)delete globalThis.OffscreenCanvas;else globalThis.OffscreenCanvas=original;}
});

test('warm platform and character materials avoid rebuilding gradients',async()=>{
 const { platform }=await import('../game/surfaces.mjs');
 const { drawCharacter }=await import('../game/characters.mjs');
 const original=globalThis.OffscreenCanvas;let gradients=0;
 const ctx=new Proxy({}, {get:(_t,k)=>k==='createLinearGradient'||k==='createRadialGradient'?()=>{gradients++;return{addColorStop(){}};}:()=>{},set:()=>true});
 globalThis.OffscreenCanvas=class{getContext(){return ctx;}};
 try{
  const draw=()=>{platform(ctx,{x:40,w:150,floor:12},120,false,'#78e6f3');drawCharacter(ctx,'frost',{vx:300,vy:0,grounded:true,facing:1},240,300,1);};
  draw();assert.ok(gradients>0);gradients=0;draw();assert.equal(gradients,0);
 }finally{if(original===undefined)delete globalThis.OffscreenCanvas;else globalThis.OffscreenCanvas=original;}
});
