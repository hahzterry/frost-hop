import test from 'node:test';
import assert from 'node:assert/strict';
import { renderGame } from '../game/renderer.mjs';
import { detailLevel } from '../game/surfaces.mjs';
import { TowerGame } from '../game/engine.mjs';

// Exercise rendering without a browser and reject invalid drawing coordinates.
function context(){
 let depth=0,calls=0;
 const ctx=new Proxy({canvas:{clientWidth:360}}, {get(target,key){
  if(key in target)return target[key];
  if(key==='createLinearGradient'||key==='createRadialGradient')return ()=>({addColorStop(){}});
  if(key==='save')return ()=>{depth++;};if(key==='restore')return ()=>{assert.ok(depth>0);depth--;};
  return (...args)=>{calls++;for(const n of args)if(typeof n==='number')assert.ok(Number.isFinite(n),`${key} received ${n}`);};
 }});
 return {ctx,check(){assert.equal(depth,0);assert.ok(calls>100);}};
}
test('every skin renders in both themes without changing physics or leaking canvas state',()=>{
 for(const character of ['frost','groove','riva'])for(const floor of [0,100])for(const grounded of [true,false]){
  const game=new TowerGame();game.floor=floor;game.player.grounded=grounded;game.player.vx=400;game.player.vy=-500;
  const before=JSON.stringify(game);const {ctx,check}=context();renderGame(ctx,game,1.25,[],false,character,[]);check();assert.equal(JSON.stringify(game),before);
 }
});
test('small screens use reduced environment detail',()=>{assert.equal(detailLevel(360),'low');assert.equal(detailLevel(480),'medium');});
