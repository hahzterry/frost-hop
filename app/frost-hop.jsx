'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUp, Snowflake, Trophy, Volume2, VolumeX, Pause, Play, RotateCcw, Maximize, Zap, Mountain, Keyboard } from 'lucide-react';
import { TowerGame, WIDTH, HEIGHT, STEP } from '../game/engine.mjs';
import { renderGame } from '../game/renderer.mjs';

const initialStats = { floor:0, score:0, combo:0, comboTimer:0, maxCombo:0, speed:0, time:0 };
const format = n => Math.floor(n).toLocaleString('tr-TR');
export default function FrostHop() {
  const canvasRef=useRef(null), gameRef=useRef(null), input=useRef({left:new Set(),right:new Set(),jump:new Set()});
  const [status,setStatus]=useState('ready'),[stats,setStats]=useState(initialStats),[best,setBest]=useState(0),[muted,setMuted]=useState(false),[fullscreen,setFullscreen]=useState(false);
  const audioRef=useRef(null), mutedRef=useRef(false),bestRef=useRef(0),shellRef=useRef(null),startRef=useRef(null);
  const clearInput=useCallback(()=>{for(const set of Object.values(input.current))set.clear();},[]);
  const sound=useCallback((type)=>{
    if(mutedRef.current||!audioRef.current)return;
    try {
      const ac=audioRef.current, osc=ac.createOscillator(),gain=ac.createGain();
      const pitches={jump:[330,680,.13],land:[220,160,.055],combo:[600,1200,.22],over:[220,65,.45]};
      const data=pitches[type];if(!data)return;
      osc.type='triangle';osc.frequency.setValueAtTime(data[0],ac.currentTime);osc.frequency.exponentialRampToValueAtTime(data[1],ac.currentTime+data[2]);
      gain.gain.setValueAtTime(.075,ac.currentTime);gain.gain.exponentialRampToValueAtTime(.001,ac.currentTime+data[2]);osc.connect(gain);gain.connect(ac.destination);osc.start();osc.stop(ac.currentTime+data[2]);
    }catch{/* Audio is optional on restrictive browsers. */}
  },[]);
  const unlockAudio=()=>{try{const AC=window.AudioContext||window.webkitAudioContext;if(AC&&!audioRef.current)audioRef.current=new AC();audioRef.current?.resume()?.catch(()=>{});}catch{}};
  const start=useCallback(()=>{clearInput();gameRef.current?.start();setStats(initialStats);setStatus('playing');},[clearInput]);
  const togglePause=useCallback(()=>{const g=gameRef.current;if(!g)return;clearInput();if(g.status==='playing')g.pause();else if(g.status==='paused')g.resume();setStatus(g.status);},[clearInput]);
  useEffect(()=>{
    try{const n=Number(localStorage.getItem('frost-hop-best'));if(Number.isFinite(n)&&n>=0){bestRef.current=n;setBest(n);}const mute=localStorage.getItem('frost-hop-muted')==='true';setMuted(mute);mutedRef.current=mute;}catch{}
    const g=new TowerGame();gameRef.current=g;
    const canvas=canvasRef.current,ctx=canvas.getContext('2d');if(!ctx)return;
    const dpr=Math.min(window.devicePixelRatio||1,2);canvas.width=WIDTH*dpr;canvas.height=HEIGHT*dpr;ctx.scale(dpr,dpr);ctx.imageSmoothingEnabled=false;
    const reduce=window.matchMedia('(prefers-reduced-motion: reduce)');
    let raf=0,last=0,acc=0,ui=0,clock=0,particles=[];
    const keys={ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',Space:'jump',ArrowUp:'jump',KeyW:'jump'};
    const down=e=>{
      if(e.code==='Escape'||e.code==='KeyP'){if(!e.repeat)togglePause();return;}
      if(e.target instanceof Element&&e.target.closest('button'))return;
      const action=keys[e.code];if(action){e.preventDefault();if(g.status==='playing')input.current[action].add('key:'+e.code);}
    };
    const up=e=>{const action=keys[e.code];if(action)input.current[action].delete('key:'+e.code);};
    const suspend=()=>{clearInput();if(g.status==='playing'){g.pause();setStatus('paused');}last=0;acc=0;};
    const visibility=()=>{if(document.hidden)suspend();};
    const fullChange=()=>setFullscreen(!!document.fullscreenElement);
    window.addEventListener('keydown',down);window.addEventListener('keyup',up);window.addEventListener('blur',suspend);document.addEventListener('visibilitychange',visibility);document.addEventListener('fullscreenchange',fullChange);
    function frame(ts){
      const dt=last?Math.min((ts-last)/1000,.05):0;last=ts;clock+=dt;
      if(g.status==='playing'){
        acc+=dt;
        while(acc>=STEP){
          g.update(STEP,{left:input.current.left.size>0,right:input.current.right.size>0,jump:input.current.jump.size>0});acc-=STEP;
          for(const ev of g.events){
            sound(ev.type);
            if((ev.type==='jump'||ev.type==='land'||ev.type==='combo')&&!reduce.matches)for(let i=0;i<8;i++)particles.push({x:ev.x,y:ev.y,vx:(Math.random()-.5)*100,vy:-Math.random()*100,life:1,size:2+Math.random()*3,color:ev.type==='combo'?'#ffc272':'#a5f0ef'});
            if(ev.type==='over'){
              setStatus('over');clearInput();
              if(g.score>bestRef.current){bestRef.current=g.score;setBest(g.score);try{localStorage.setItem('frost-hop-best',String(g.score));}catch{}}
            }
          }
          if(g.status!=='playing'){acc=0;break;}
        }
        for(const p of particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt*2;}
        particles=particles.filter(p=>p.life>0).slice(-100);
      }else acc=0;
      renderGame(ctx,g,clock,particles,reduce.matches);
      ui+=dt;if(ui>.08){setStats({floor:g.floor,score:g.score,combo:g.combo,comboTimer:g.comboTimer,maxCombo:g.maxCombo,speed:Math.abs(g.player.vx)/430,time:g.time});ui=0;}
      raf=requestAnimationFrame(frame);
    }
    raf=requestAnimationFrame(frame);
    return()=>{cancelAnimationFrame(raf);window.removeEventListener('keydown',down);window.removeEventListener('keyup',up);window.removeEventListener('blur',suspend);document.removeEventListener('visibilitychange',visibility);document.removeEventListener('fullscreenchange',fullChange);clearInput();gameRef.current=null;audioRef.current?.close()?.catch(()=>{});audioRef.current=null;};
  },[clearInput,sound,togglePause]);
  useEffect(()=>{if(status!=='playing')startRef.current?.focus({preventScroll:true});},[status]);
  const changeMute=()=>{unlockAudio();const next=!muted;setMuted(next);mutedRef.current=next;try{localStorage.setItem('frost-hop-muted',String(next));}catch{}};
  const full=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else if(shellRef.current?.requestFullscreen)await shellRef.current.requestFullscreen();else setFullscreen(v=>!v);}catch{setFullscreen(v=>!v);}};
  function control(action){return {onPointerDown:e=>{e.preventDefault();e.currentTarget.setPointerCapture(e.pointerId);if(gameRef.current?.status==='playing')input.current[action].add(e.pointerId);},onPointerUp:e=>{input.current[action].delete(e.pointerId);},onPointerCancel:e=>{input.current[action].delete(e.pointerId);},onLostPointerCapture:e=>{input.current[action].delete(e.pointerId);},onContextMenu:e=>e.preventDefault(),onKeyDown:e=>{if(e.code==='Space'||e.code==='Enter'){e.preventDefault();if(gameRef.current?.status==='playing')input.current[action].add('button');}},onKeyUp:e=>{if(e.code==='Space'||e.code==='Enter')input.current[action].delete('button');},onBlur:()=>input.current[action].delete('button')};}
  const elapsed=`${String(Math.floor(stats.time/60)).padStart(2,'0')}:${String(Math.floor(stats.time%60)).padStart(2,'0')}`;
  return <main className={`arcade ${fullscreen?'expanded':''}`} ref={shellRef}>
    <header className="topbar"><a className="brand" href="/" aria-label="Frost Hop ana sayfa"><span className="brand-icon"><Snowflake size={25}/></span><span>FROST<span className="brand-light">HOP</span><small>YUKARI. BİR KAT DAHA.</small></span></a><div className="header-right"><span className="edition">SONSUZ TIRMANIŞ <span>01</span></span><button className="icon-button" onClick={changeMute} aria-label={muted?'Sesi aç':'Sesi kapat'} aria-pressed={muted}>{muted?<VolumeX size={20}/>:<Volume2 size={20}/>}</button><button className="icon-button fullscreen-button" onClick={full} aria-label={fullscreen?'Tam ekrandan çık':'Tam ekran'}><Maximize size={20}/></button></div></header>
    <div className="game-layout"><section className="play-section" aria-label="Oyun alanı">
      <div className="game-toolbar"><span><span className={`status-dot ${status==='playing'?'active':''}`}/>{status==='playing'?'TIRMANIŞ BAŞLADI':status==='paused'?'MOLA ZAMANI':'ZİRVE SENİ BEKLİYOR'}</span><span className="mobile-score">{format(stats.score)} PUAN</span><span className="desktop-hint">ICY TOWER ESİNTİLİ</span></div>
      <div className="canvas-wrap"><canvas ref={canvasRef} aria-label="Buzlu kulede platformlara zıplayarak yüksel. Yön tuşlarıyla koş, boşlukla zıpla." role="img"/>
        <div className="in-game-hud"><div className="floor-hud"><small>KAT</small><strong>{String(stats.floor).padStart(3,'0')}</strong></div><button className="pause-button" disabled={status==='ready'||status==='over'} onClick={togglePause} aria-label={status==='paused'?'Devam et':'Duraklat'}>{status==='paused'?<Play size={18}/>:<Pause size={18}/>}</button></div>
        {stats.combo>0&&status==='playing'&&<div className="combo-pop" key={stats.combo}><Zap size={21} fill="currentColor"/>{stats.combo}× KOMBO<span>DEVAM ET!</span></div>}
        {status!=='playing'&&<div className="game-overlay"><div className="start-card">
          <span className="eyebrow">{status==='ready'?'KÜÇÜK BİR ZIPLAYIŞLA BAŞLAR':status==='paused'?'ACELE ETME':'BİR TUR DAHA?'}</span>
          <h1>{status==='ready'?<>FROST<br/><span>HOP.</span></>:status==='paused'?<>KISA BİR<br/><span>MOLA.</span></>:<>GÜZEL<br/><span>TIRMANIŞ!</span></>}</h1>
          <p>{status==='ready'?<>Hızlan. Zıpla. Ritmi yakala.<br/>Aşağıya bakma.</>:status==='paused'?'Hazır olduğunda kaldığın yerden devam et.':`${format(stats.score)} puan · ${stats.floor}. kat · ${stats.maxCombo}× en iyi kombo`}</p>
          <button ref={startRef} className="primary-button" onClick={e=>{unlockAudio();if(status==='paused')togglePause();else start();e.currentTarget.blur();}}>{status==='paused'?<Play size={20} fill="currentColor"/>:status==='over'?<RotateCcw size={20}/>:<ArrowUp size={21}/>} {status==='paused'?'DEVAM ET':status==='over'?'TEKRAR DENE':'TIRMANIŞA BAŞLA'}</button>
          {status==='paused'?<button className="text-button" onClick={()=>{unlockAudio();start();}}>Yeniden başla</button>:<span className="start-note">{best>0?`Kişisel rekor: ${format(best)} puan`:'Yön + zıplama tuşunu birlikte kullan.'}</span>}
        </div></div>}
        <div className="altitude-label">{Math.floor(stats.floor/50)===0?'01 / BUZLU GEÇİT':`${String(Math.floor(stats.floor/50)+1).padStart(2,'0')} / YÜKSEK İRTİFA`}</div>
      </div>
      <div className="touch-controls"><div className="direction-controls"><button aria-label="Sola koş" {...control('left')}><ArrowLeft size={28}/></button><button aria-label="Sağa koş" {...control('right')}><ArrowRight size={28}/></button></div><span className="touch-tip">HIZLAN<br/><strong>VE YÜKSEL</strong></span><button className="jump-control" aria-label="Zıpla" {...control('jump')}><ArrowUp size={23}/><span>ZIPLA</span></button></div>
    </section>
    <aside className="sidebar"><div className="session-heading"><span>BU TIRMANIŞ</span><span className="timer">{elapsed}</span></div><div className="score-panel"><span className="label">TOPLAM PUAN</span><strong className="score-number">{format(stats.score)}</strong><div className="record"><Trophy size={16}/><span>KİŞİSEL REKOR</span><strong>{format(best)}</strong></div></div>
      <div className="metrics"><div><Mountain size={18}/><span>Ulaşılan kat</span><strong>{stats.floor}</strong></div><div><Zap size={18}/><span>En iyi kombo</span><strong>{stats.maxCombo}×</strong></div></div>
      <div className="momentum"><div><span className="label">HIZ GÜCÜ</span><span>{stats.speed>.7?'SÜPER ZIPLAYIŞ':'İVME KAZAN'}</span></div><div className="speed-track" role="meter" aria-label="Koşu hızı" aria-valuenow={Math.round(stats.speed*100)} aria-valuemin={0} aria-valuemax={100}><span style={{width:`${stats.speed*100}%`}}/></div><p>Ne kadar hızlı koşarsan,<br/>o kadar yükseğe zıplarsın.</p></div>
      <div className="how-to"><h2><Keyboard size={18}/> KONTROLLER</h2><div><span>Hareket</span><span><kbd>←</kbd> <kbd>→</kbd><em> / A D</em></span></div><div><span>Zıpla</span><kbd className="wide-key">BOŞLUK</kbd></div><div><span>Duraklat</span><kbd>ESC</kbd></div><p>Telefonda alttaki tuşları kullan.<br/>Zıplamayı basılı tutarak seri zıpla.</p></div>
      <div className="tip"><span>YÜKSEKLERE ÇIKMANIN SIRRI</span><p>Tek zıplayışta <strong>2+ kat</strong> geç.<br/>3,5 saniye içinde tekrarla,<br/>kombonu büyüt.</p></div>
      <div className="sidebar-bottom"><Snowflake size={16}/><span>Soğukkanlı kal. Yükselmeye devam.</span></div>
    </aside></div><footer><span>FROST HOP <span className="footer-dot">/</span> ÖZGÜN BİR ARCADE YORUMU</span><span>Bir sonraki kat senin.</span></footer>
  </main>;
}
