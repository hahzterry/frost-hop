import { WIDTH, HEIGHT } from './engine.mjs';
const colors = ['#78e6f3', '#9cb2ff', '#c4a1ff', '#f7b4df'];
export function renderGame(ctx, game, clock, particles, reducedMotion = false) {
  const { camera, player:p } = game;
  const zone = Math.floor(game.floor / 50) % colors.length;
  const accent = colors[zone];
  ctx.clearRect(0,0,WIDTH,HEIGHT);
  const bg = ctx.createLinearGradient(0,0,0,HEIGHT); bg.addColorStop(0,'#0b1630'); bg.addColorStop(1,'#172e48');
  ctx.fillStyle=bg; ctx.fillRect(0,0,WIDTH,HEIGHT);
  // Functional tower walls, masonry and platforms are drawn in the game canvas.
  ctx.lineWidth=1;
  const offset = ((-camera*.35)%64+64)%64;
  ctx.strokeStyle='#233751';
  for(let row=-1;row<11;row++) {
    const y=row*64+offset;
    ctx.beginPath(); ctx.moveTo(18,y); ctx.lineTo(462,y); ctx.stroke();
    for(let x=(row%2)*64+18;x<462;x+=128) { ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x,y+64);ctx.stroke(); }
  }
  for(let n=0;n<4;n++) {
    const y=((n*240-camera*.18)%960+960)%960-160;
    const x=n%2?352:84;
    ctx.fillStyle='#081526';ctx.fillRect(x,y,44,75);
    ctx.fillStyle='#203d58';ctx.fillRect(x+3,y+3,38,68);
    ctx.fillStyle='#335b73';ctx.fillRect(x+8,y+9,12,53);
    ctx.fillStyle='#11243c';ctx.fillRect(x+20,y,4,75);ctx.fillRect(x,y+32,44,5);
  }
  ctx.fillStyle='#304862';ctx.fillRect(0,0,18,HEIGHT);ctx.fillRect(462,0,18,HEIGHT);
  ctx.fillStyle='#4e7187';ctx.fillRect(14,0,4,HEIGHT);ctx.fillRect(462,0,4,HEIGHT);
  for(let y=offset-64;y<HEIGHT;y+=32){ctx.fillStyle='#1b304c';ctx.fillRect(0,y,14,3);ctx.fillRect(466,y,14,3);}
  for(let i=0;i<34;i++) {
    const t=reducedMotion?0:clock;
    const x=(i*137+Math.sin(t*.3+i)*10)%WIDTH;
    const y=((i*91+t*(6+i%4*3)-camera*.1)%HEIGHT+HEIGHT)%HEIGHT;
    ctx.fillStyle=i%3?'#87b6ca55':'#c9f2ff99';ctx.fillRect(x,y,i%3?2:3,i%3?2:3);
  }
  for (const f of game.platforms) {
    const y=Math.round(f.y-camera); if(y < -25 || y > HEIGHT+20)continue;
    const x=Math.round(f.x),w=Math.round(f.w);
    ctx.fillStyle='#06142470';ctx.fillRect(x+4,y+14,w,7);
    ctx.fillStyle=f.floor%10===0?'#516786':'#3c718b';ctx.fillRect(x,y+4,w,13);
    ctx.fillStyle=accent;ctx.fillRect(x,y,w,5);
    ctx.fillStyle='#e6fbff';ctx.fillRect(x+2,y,w-4,2);
    ctx.fillStyle='#a3e9f2';ctx.fillRect(x+9,y+5,4,9);ctx.fillRect(x+w-19,y+5,5,14);
    ctx.fillStyle='#224e69';ctx.fillRect(x+25,y+8,w-48,3);
    if(f.floor>0){ctx.font='bold 12px monospace';ctx.textAlign='left';ctx.fillStyle='#abcbd7';ctx.fillText(String(f.floor).padStart(2,'0'),f.x+f.w+10>440?f.x-27:f.x+f.w+9,y+10);}
  }
  for(const s of particles){ctx.globalAlpha=Math.max(0,s.life);ctx.fillStyle=s.color;ctx.fillRect(s.x,s.y-camera,s.size,s.size);}
  ctx.globalAlpha=1;
  // Original pixel climber, with a knitted cap and a wind-blown orange scarf.
  const px=Math.round(p.x+p.w/2),py=Math.round(p.y-camera);
  ctx.save();ctx.translate(px,py+20);ctx.scale(p.facing,1);
  const fast=Math.abs(p.vx)>300&&!p.grounded;
  if(fast&&!reducedMotion)ctx.rotate(Math.sin(clock*14)*.12);
  const r=(x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(x,y,w,h);};
  r(-12,-19,24,36,'#081524');
  r(-10,-7,20,19,'#e5f6ed');r(-8,-5,16,15,'#b4dde0');
  r(-10,-18,20,14,'#ffdbb0');r(5,-14,3,4,'#132b3c');
  r(-13,-22,25,7,'#6cdddf');r(-10,-27,18,8,'#a6f5e4');r(-4,-31,6,5,'#f0ffdf');
  r(-14,-17,27,4,'#f1fff0');r(-12,-5,25,5,'#ff9e55');r(-23,-4,12,5,'#f37d48');r(-27,-3+(p.grounded?0:3),8,5,'#ffac62');
  r(-15,0,5,11,'#8bc3ce');r(10,-1,5,10,'#d9f2e5');
  const stride=p.grounded&&Math.abs(p.vx)>30&&!reducedMotion?Math.round(Math.sin(clock*25)*3):0;
  r(-9,12,7,7+stride,'#3f6590');r(3,12,7,7-stride,'#3f6590');
  r(-11,17+stride,10,4,'#edb078');r(2,17-stride,12,4,'#edb078');ctx.restore();
  const fog=ctx.createLinearGradient(0,590,0,640);fog.addColorStop(0,'#77d8e000');fog.addColorStop(1,'#77d8e042');ctx.fillStyle=fog;ctx.fillRect(0,590,480,50);
}
