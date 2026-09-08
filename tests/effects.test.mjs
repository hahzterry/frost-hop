import assert from 'node:assert/strict';
import test from 'node:test';
import { FootTrail, effectForCombo, themeForFloor } from '../game/effects.mjs';
import { TowerGame } from '../game/engine.mjs';
import { CHARACTERS, validCharacter } from '../game/characters.mjs';
test('foot effect switches at 2x and 20x, based on current combo',()=>{
  assert.equal(effectForCombo(0),'none');assert.equal(effectForCombo(1),'none');
  assert.equal(effectForCombo(2),'star');assert.equal(effectForCombo(19),'star');
  assert.equal(effectForCombo(20),'flame');assert.equal(effectForCombo(34),'flame');
  const g=new TowerGame(),trail=new FootTrail(()=>.5);g.start();g.combo=2;
  for(let i=0;i<20;i++)trail.update(.05,g);
  assert.ok(trail.particles.length>0);assert.ok(trail.particles.every(p=>p.kind==='star'));
  g.combo=20;for(let i=0;i<20;i++)trail.update(.05,g);
  assert.ok(trail.particles.every(p=>p.kind==='flame'&&p.size<=5));assert.ok(trail.particles.length<=24);
  g.combo=0;for(let i=0;i<20;i++)trail.update(.05,g);assert.equal(trail.particles.length,0);
});
test('trails originate near feet, freeze on pause and respect reduced motion',()=>{
  const g=new TowerGame(),trail=new FootTrail(()=>.5);g.start();g.combo=20;trail.update(.05,g);
  assert.ok(trail.particles.length>0);
  assert.ok(trail.particles.every(p=>p.y===g.player.y+g.player.h&&Math.abs(p.x-(g.player.x+g.player.w/2))===7));
  const before=JSON.stringify(trail.particles);g.pause();trail.update(1,g);assert.equal(JSON.stringify(trail.particles),before);
  g.resume();trail.update(.05,g,true);assert.equal(trail.particles.length,0);
});
test('slime begins at floor 100, persists above it and resets with a new run',()=>{
  assert.equal(themeForFloor(99),'ice');assert.equal(themeForFloor(100),'slime');assert.equal(themeForFloor(600),'slime');
  const g=new TowerGame();g.floor=150;assert.equal(themeForFloor(g.floor),'slime');g.start();assert.equal(themeForFloor(g.floor),'ice');
});
test('only the three intended character choices are accepted',()=>{
  assert.deepEqual(CHARACTERS.map(c=>c.id),['frost','groove','riva']);
  assert.equal(validCharacter('groove'),true);assert.equal(validCharacter(null),false);assert.equal(validCharacter('broken-save'),false);
});
