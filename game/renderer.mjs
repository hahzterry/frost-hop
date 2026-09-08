import { WIDTH, HEIGHT } from './engine.mjs';
import { drawCharacter } from './characters.mjs';
import { themeForFloor, drawFootTrail } from './effects.mjs';
export function renderGame(ctx, game, clock, particles, reducedMotion = false, character = 'frost', trail = []) {
  const { camera, player:p } = game;
  const slime = themeForFloor(game.floor) === 'slime';
  const accent = slime ? '#b0f0ac' : game.floor >= 50 ? '#9cb2ff' : '#78e6f3';
  const t = reducedMotion ? 0 : clock;
  ctx.clearRect(0,0,WIDTH,HEIGHT);
  const bg = ctx.createLinearGradient(0,0,0,HEIGHT);
  bg.addColorStop(0,slime?'#1c1234':'#0b1630'); bg.addColorStop(1,slime?'#3a2053':'#172e48');
  ctx.fillStyle=bg;ctx.fillRect(0,0,WIDTH,HEIGHT);
  ctx.lineWidth=1;
  const offset=((-camera*.35)%64+64)%64;
  ctx.strokeStyle=slime?'#50305f':'#233751';
  for(let row=-1;row<11;row++){
    const y=row*64+offset;
    ctx.beginPath();ctx.moveTo(18,y);ctx.lineTo(462,y);ctx.stroke();
    for(let x=(row%2)*64+18;x<462;x+=128){ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x,y+64);ctx.stroke();}
  }
  if(slime){
    // Bioluminescent slime pockets replace the ice tower's windows.
    for(let n=0;n<6;n++){
      const y=((n*175-camera*.2)%1050+1050)%1050-100;
      const x=n%2?390:85;
      ctx.fillStyle='#a873cc12';ctx.beginPath();ctx.ellipse(x,y,48,76,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#654080';ctx.beginPath();ctx.ellipse(x,y,25,41,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#25153d';ctx.beginPath();ctx.ellipse(x,y-3,21,35,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#8273a9';ctx.fillRect(x-15,y+12,30,8);
      ctx.fillStyle='#9accab';ctx.beginPath();ctx.ellipse(x,y+12,15,5,0,Math.PI,Math.PI*2);ctx.fill();
      ctx.fillStyle='#9accab';ctx.fillRect(x+4,y+14,5,12);ctx.fillRect(x-11,y+13,4,7);
      ctx.fillStyle='#c9f7ae';ctx.fillRect(x-7,y+9,7,2);
    }
    // Slow rising bubbles stay behind the gameplay layer, with no flashing.
    for(let i=0;i<14;i++){
      const x=38+(i*113)%405+Math.sin(t*.5+i)*6;
      const y=((i*83-t*(9+i%3*3)-camera*.1)%HEIGHT+HEIGHT)%HEIGHT;
      const radius=3+i%4*2;
      ctx.fillStyle='#c19ae815';ctx.strokeStyle='#b89ade45';ctx.beginPath();ctx.arc(x,y,radius,0,Math.PI*2);ctx.fill();ctx.stroke();
      ctx.fillStyle='#dcd2f35a';ctx.fillRect(x-radius*.35,y-radius*.45,2,2);
    }
  }else{
    for(let n=0;n<4;n++){
      const y=((n*240-camera*.18)%960+960)%960-160,x=n%2?352:84;
      ctx.fillStyle='#081526';ctx.fillRect(x,y,44,75);
      ctx.fillStyle='#203d58';ctx.fillRect(x+3,y+3,38,68);
      ctx.fillStyle='#335b73';ctx.fillRect(x+8,y+9,12,53);
      ctx.fillStyle='#11243c';ctx.fillRect(x+20,y,4,75);ctx.fillRect(x,y+32,44,5);
    }
  }
  ctx.fillStyle=slime?'#543368':'#304862';ctx.fillRect(0,0,18,HEIGHT);ctx.fillRect(462,0,18,HEIGHT);
  ctx.fillStyle=slime?'#866093':'#4e7187';ctx.fillRect(14,0,4,HEIGHT);ctx.fillRect(462,0,4,HEIGHT);
  for(let y=offset-64;y<HEIGHT;y+=32){ctx.fillStyle=slime?'#301d49':'#1b304c';ctx.fillRect(0,y,14,3);ctx.fillRect(466,y,14,3);}
  if(slime){
    for(let i=0;i<7;i++){
      const y=((i*117-camera*.42)%820+820)%820-80;
      for(const x of [11,463]){
        ctx.fillStyle='#b896d6';ctx.fillRect(x,y,6,31+i%3*8);
        ctx.fillStyle='#89b99a';ctx.fillRect(x+1,y,4,12+i%3*8);
        ctx.fillStyle='#c6e3ad';ctx.fillRect(x+2,y,2,6);
      }
    }
  }else{
    for(let i=0;i<34;i++){
      const x=(i*137+Math.sin(t*.3+i)*10)%WIDTH;
      const y=((i*91+t*(6+i%4*3)-camera*.1)%HEIGHT+HEIGHT)%HEIGHT;
      ctx.fillStyle=i%3?'#87b6ca55':'#c9f2ff99';ctx.fillRect(x,y,i%3?2:3,i%3?2:3);
    }
  }
  for(const f of game.platforms){
    const y=Math.round(f.y-camera);if(y < -25 || y > HEIGHT+20)continue;
    const x=Math.round(f.x),w=Math.round(f.w);
    ctx.fillStyle=slime?'#12082070':'#06142470';ctx.fillRect(x+4,y+14,w,7);
    ctx.fillStyle=slime?'#70508d':f.floor%10===0?'#516786':'#3c718b';ctx.fillRect(x,y+4,w,13);
    ctx.fillStyle=accent;ctx.fillRect(x,y,w,5);
    ctx.fillStyle=slime?'#def5b5':'#e6fbff';ctx.fillRect(x+2,y,w-4,2);
    ctx.fillStyle=slime?'#91c5a4':'#a3e9f2';ctx.fillRect(x+9,y+5,4,9);ctx.fillRect(x+w-19,y+5,5,14);
    ctx.fillStyle=slime?'#a4dbb1':'#224e69';ctx.fillRect(x+25,y+8,w-48,3);
    if(slime){
      ctx.fillStyle='#c4a4de';ctx.fillRect(x+f.floor%4*13+34,y+5,5,8);
      ctx.fillStyle='#96cca6';ctx.beginPath();ctx.arc(x+11,y+13,2,0,Math.PI);ctx.fill();
      ctx.beginPath();ctx.arc(x+w-16.5,y+18,2.5,0,Math.PI);ctx.fill();
    }
    if(f.floor>0){ctx.font='bold 12px monospace';ctx.textAlign='left';ctx.fillStyle=slime?'#d8bde9':'#abcbd7';ctx.fillText(String(f.floor).padStart(2,'0'),f.x+f.w+10>440?f.x-27:f.x+f.w+9,y+10);}
  }
  for(const s of particles){ctx.globalAlpha=Math.max(0,s.life);ctx.fillStyle=s.color;ctx.fillRect(s.x,s.y-camera,s.size,s.size);}
  ctx.globalAlpha=1;
  drawFootTrail(ctx,trail,camera);
  drawCharacter(ctx,character,p,p.x+p.w/2,p.y-camera,t,reducedMotion);
  const fog=ctx.createLinearGradient(0,590,0,640);
  fog.addColorStop(0,slime?'#b589e000':'#77d8e000');fog.addColorStop(1,slime?'#b589e037':'#77d8e042');
  ctx.fillStyle=fog;ctx.fillRect(0,590,480,50);
}
