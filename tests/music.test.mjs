import assert from 'node:assert/strict';
import test from 'node:test';
import { TechnoLoop, SIXTEENTH } from '../game/music.mjs';
function environment(){
  const active=new Map(),sources=[];let serial=0;
  const param=()=>({value:0,setValueAtTime(v){this.value=v;},exponentialRampToValueAtTime(v){this.value=v;},setTargetAtTime(v){this.value=v;},cancelScheduledValues(){}});
  const node=()=>({gain:param(),frequency:param(),Q:param(),connect(){},disconnect(){}});
  const ac={currentTime:0,state:'running',sampleRate:48000,destination:{},createGain:node,createBiquadFilter:node,createBuffer:(_,size)=>({getChannelData:()=>new Float32Array(size)})};
  const source=()=>{const s={...node(),start(at){assert.ok(at>=ac.currentTime);this.started=at;},stop(at){this.stopped=at;}};sources.push(s);return s;};
  ac.createOscillator=source;ac.createBufferSource=source;
  const timers={setInterval(fn){active.set(++serial,fn);return serial;},clearInterval(id){active.delete(id);}};
  return {ac,active,sources,timers};
}
test('music transport schedules a steady bounded beat and does not duplicate timers',()=>{
  const {ac,active,sources,timers}=environment(),music=new TechnoLoop(ac,timers);
  assert.equal(active.size,0);music.start();music.start();assert.equal(active.size,1);assert.ok(sources.length>0);
  assert.ok(Math.abs(SIXTEENTH-60/138/4)<1e-8);
  for(let i=0;i<800;i++){
    ac.currentTime+=.025;
    for(const fn of active.values())fn();
    for(const s of sources)if(s.onended&&s.stopped<=ac.currentTime){const end=s.onended;s.onended=null;end();}
    assert.ok(music.nodes.size<25,'finished voices must release their graph nodes');
  }
  assert.ok(music.step>=0&&music.step<128);
  const currentStep=music.step;music.stop();assert.equal(active.size,0);assert.equal(music.master.gain.value,0);assert.equal(music.step,currentStep);
  music.start();assert.equal(active.size,1);music.stop(true);assert.equal(music.step,0);music.dispose();music.start();assert.equal(active.size,0);
});
test('stalled audio clock skips the backlog and suspended contexts add no notes',()=>{
  const {ac,sources,timers}=environment(),music=new TechnoLoop(ac,timers);music.start();
  const initial=sources.length;ac.state='suspended';ac.currentTime=200;music.pump();assert.equal(sources.length,initial);
  ac.state='running';music.pump();assert.ok(sources.length-initial<12);assert.ok(music.nextTime>ac.currentTime);music.dispose();
});
