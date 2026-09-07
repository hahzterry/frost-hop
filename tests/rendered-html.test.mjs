import assert from 'node:assert/strict';
import test from 'node:test';
test('production worker serves the playable Turkish game entry point',async()=>{
  const {default:worker}=await import('../dist/server/index.js');
  const response=await worker.fetch(new Request('http://localhost/',{headers:{accept:'text/html'}}),{ASSETS:{fetch:async()=>new Response('Not found',{status:404})}},{waitUntil(){},passThroughOnException(){}});
  assert.equal(response.status,200);
  const html=await response.text();
  assert.match(html,/<html[^>]*lang="tr"/);assert.match(html,/Frost Hop/);assert.match(html,/<canvas/);assert.match(html,/TIRMANIŞA BAŞLA/);assert.match(html,/Sola koş/);assert.match(html,/Zıpla/);assert.doesNotMatch(html,/Starter Project|codex-preview/);
});
