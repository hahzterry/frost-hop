// Original 138 BPM synth composition: no samples or external audio requests.
// Scheduling uses the audio clock instead of animation frames for a steady beat.
const BPM = 138;
export const SIXTEENTH = 60 / BPM / 4;
const bassRoots = [41,41,37,39,41,44,37,39];
const phrases = [
  [0,7,12,7,3,10,15,12],
  [0,3,7,10,12,10,7,3],
];
const hz = midi => 440 * 2 ** ((midi - 69) / 12);
export class TechnoLoop {
  constructor(context, timers = globalThis) {
    this.context = context; this.timers = timers;
    this.master = context.createGain(); this.master.gain.value = 0; this.master.connect(context.destination);
    this.nodes = new Set(); this.running = false; this.timer = null; this.step = 0; this.nextTime = 0; this.disposed = false;
    this.noise = context.createBuffer(1, Math.ceil(context.sampleRate * .2), context.sampleRate);
    const data = this.noise.getChannelData(0);
    let seed = 19;
    for (let i = 0; i < data.length; i++) { seed = (seed * 16807) % 2147483647; data[i] = (seed / 2147483647) * 2 - 1; }
  }
  voice(source, gain, time, duration, filter) {
    source.connect(filter || gain); if (filter) filter.connect(gain); gain.connect(this.master);
    this.nodes.add(source);
    source.onended = () => { this.nodes.delete(source); source.disconnect(); gain.disconnect(); filter?.disconnect(); };
    source.start(time); source.stop(time + duration + .02);
  }
  tone(note, time, duration, volume, type = 'triangle', cutoff = 0) {
    const ac = this.context, source = ac.createOscillator(), gain = ac.createGain();
    source.type = type; source.frequency.value = hz(note);
    gain.gain.setValueAtTime(.0001, time); gain.gain.exponentialRampToValueAtTime(volume, time + .009);
    gain.gain.exponentialRampToValueAtTime(.0001, time + duration);
    let filter;
    if (cutoff) { filter = ac.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.setValueAtTime(cutoff,time); filter.frequency.exponentialRampToValueAtTime(220,time+duration); filter.Q.value = 2; }
    this.voice(source,gain,time,duration,filter);
  }
  kick(time) {
    const ac=this.context, source=ac.createOscillator(), gain=ac.createGain();
    source.frequency.setValueAtTime(135,time); source.frequency.exponentialRampToValueAtTime(43,time+.16);
    gain.gain.setValueAtTime(.72,time); gain.gain.exponentialRampToValueAtTime(.0001,time+.2);
    this.voice(source,gain,time,.21);
  }
  percussion(time, clap = false, open = false) {
    const ac=this.context,source=ac.createBufferSource(),gain=ac.createGain(),filter=ac.createBiquadFilter();
    source.buffer=this.noise; filter.type='highpass'; filter.frequency.value=clap?1400:7600;
    const duration = clap ? .1 : open ? .11 : .025;
    gain.gain.setValueAtTime(clap ? .2 : open ? .07 : .045,time); gain.gain.exponentialRampToValueAtTime(.0001,time+duration);
    this.voice(source,gain,time,duration,filter);
  }
  schedule(step, time) {
    const beat=step%16,bar=Math.floor(step/16)%8,root=bassRoots[bar];
    if(beat%4===0)this.kick(time);
    if(beat===4||beat===12)this.percussion(time,true);
    if(beat%2===0)this.percussion(time,false,beat%4===2);
    if(beat%4===2||beat===15)this.tone(root+(beat===15?12:0),time,.13,.32,'sawtooth',800);
    if(beat%2===1)this.tone(root+24+phrases[Math.floor(bar/4)][Math.floor(beat/2)],time,.16,.105,'triangle');
    if(beat===0)for(const interval of [0,3,7])this.tone(root+24+interval,time,.65,.045,'triangle');
  }
  pump() {
    if (!this.running || this.disposed) return;
    const ac=this.context;
    if(ac.state==='closed'){this.stop();return;}
    if(ac.state==='suspended'||ac.state==='interrupted')return;
    // After a stalled tab, skip elapsed notes instead of emitting a loud backlog.
    if(this.nextTime<ac.currentTime-.15)this.nextTime=ac.currentTime+.025;
    while(this.nextTime<ac.currentTime+.1){this.schedule(this.step,this.nextTime);this.step=(this.step+1)%128;this.nextTime+=SIXTEENTH;}
  }
  start() {
    if(this.running||this.disposed)return;
    this.running=true;this.nextTime=this.context.currentTime+.03;
    this.master.gain.cancelScheduledValues(this.context.currentTime);
    this.master.gain.setTargetAtTime(.2,this.context.currentTime,.03);
    this.pump();this.timer=this.timers.setInterval(()=>this.pump(),25);
  }
  stop(reset = false) {
    this.running=false;
    if(this.timer!==null)this.timers.clearInterval(this.timer);
    this.timer=null;
    const time=this.context.currentTime;
    this.master.gain.cancelScheduledValues(time);this.master.gain.setValueAtTime(0,time);
    for(const source of this.nodes){try{source.stop(time);}catch{}}
    if(reset)this.step=0;
  }
  dispose() { this.stop(true);this.disposed=true;this.master.disconnect(); }
}
