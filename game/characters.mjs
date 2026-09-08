// Cosmetic rendering only. The engine's 28 × 40 collision box is unchanged.
export const CHARACTERS = [
  { id: 'frost', name: 'Buzcu', description: 'Orijinal tırmanışçı', color: '#a2f0dc' },
  { id: 'groove', name: 'Groove', description: 'Afro saçlı popstar', color: '#ffc879' },
  { id: 'riva', name: 'Riva', description: 'Tekno dansçısı', color: '#efa9ff' },
];
export const validCharacter = id => CHARACTERS.some(c => c.id === id);
const palettes = {
  frost: ['#ffe1bc','#c38865','#e5fff4','#63a9b8','#284463','#e6ad77'],
  groove: ['#bc825a','#70402f','#ee91df','#863b9e','#242d50','#fff0c8'],
  riva: ['#ffdbc5','#cb937d','#c9a4ff','#7443b0','#27344f','#88f5e5'],
};
export function rounded(ctx,x,y,w,h,r,fill) {
  ctx.fillStyle=fill;ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill();
}
function material(ctx,x,y,w,h,light,dark,r=4) {
  const g=ctx.createLinearGradient(x,y,x+w,y+h);g.addColorStop(0,light);g.addColorStop(.35,light);g.addColorStop(1,dark);
  rounded(ctx,x,y,w,h,r,g);
}
function oval(ctx,x,y,rx,ry,c) {ctx.fillStyle=c;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fill();}
function line(ctx,points,c,width=1) {ctx.strokeStyle=c;ctx.lineWidth=width;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(...points[0]);for(const p of points.slice(1))ctx.lineTo(...p);ctx.stroke();}
function head(ctx,id){
 const [skin,shade]=palettes[id];
 if(id==='groove'){
  oval(ctx,0,-19,17,15,'#191426');
  for(let i=0;i<13;i++){const a=i/13*Math.PI*2;oval(ctx,Math.cos(a)*12,-20+Math.sin(a)*10,5,5,i<7?'#38273f':'#231c31');}
 }
 if(id==='riva')material(ctx,-13,-25,25,26,'#fff0a4','#c7893f',11);
 oval(ctx,-10,-10,3,4,shade);oval(ctx,10,-10,3,4,skin);
 material(ctx,-10,-23,21,21,skin,shade,8);
 oval(ctx,6,-10,4,3,skin);
 if(id==='groove'){
  rounded(ctx,-9,-17,10,6,2,'#ffda7e');rounded(ctx,2,-17,10,6,2,'#ffda7e');
  rounded(ctx,-7.5,-16,7,3.5,1,'#28314b');rounded(ctx,3.5,-16,7,3.5,1,'#28314b');line(ctx,[[0,-15],[3,-15]],'#f9dd91',1.5);
  line(ctx,[[-5,-15],[-2,-16]],'#b4d6dd',.8);
 }else{
  for(const x of [-4,6]){oval(ctx,x,-13,2.6,3.1,'#fff6e9');oval(ctx,x+.7,-12.8,1.45,2.2,'#233347');oval(ctx,x+1,-13.7,.55,.8,'#ffffff');}
  line(ctx,[[-7,-18],[-3,-18.5]],'#68483c',1.2);line(ctx,[[4,-18],[8,-17]],'#68483c',1.2);
 }
 line(ctx,[[1,-6],[4,-5.3],[7,-6.4]],id==='groove'?'#ffe6c6':'#9f635a',1.1);
 oval(ctx,3,-9,1.5,1,skin);
 if(id==='frost'){
  material(ctx,-12,-29,25,13,'#bffff0','#4bb5bf',7);
  material(ctx,-14,-19,29,5,'#f0fff3','#91d5cf',2);
  for(let x=-9;x<11;x+=3)line(ctx,[[x,-26],[x,-22]],'#e6fff65c',.65);
  oval(ctx,0,-31,4,4,'#ecffe8');oval(ctx,-1,-32,2,2,'#ffffff');
 }else if(id==='riva'){
  material(ctx,-12,-27,25,10,'#fff0ab','#e4b452',6);
  ctx.fillStyle='#ffdf86';ctx.beginPath();ctx.moveTo(-11,-23);ctx.quadraticCurveTo(0,-15,8,-22);ctx.lineTo(-11,-26);ctx.fill();
  line(ctx,[[-12,-17],[-12,-26],[0,-29],[11,-24]],'#ce8eee',2.5);
  material(ctx,-15,-20,7,11,'#d89aff','#683a9c',3);rounded(ctx,-14,-18,3,7,1.5,'#96fff1');
 }else{
  for(let i=0;i<10;i++)oval(ctx,-11+(i%5)*5,-25-Math.floor(i/5)*4,3.5,3,'#37283f');
 }
}
// One shared 384 × 160 head atlas (~240 KiB RGBA), generated once.
// No remote textures, per-frame texture uploads, or unbounded sprite caches.
let atlas;
function getAtlas(){
 if(atlas)return atlas;
 const canvas=typeof OffscreenCanvas!=='undefined'?new OffscreenCanvas(384,160):typeof document!=='undefined'?document.createElement('canvas'):null;
 if(!canvas)return null;
 canvas.width=384;canvas.height=160;const c=canvas.getContext('2d');if(!c)return null;
 c.scale(2,2);CHARACTERS.forEach(({id},i)=>{c.save();c.translate(i*64+32,48);head(c,id);c.restore();});atlas=canvas;return atlas;
}
export function drawCharacter(ctx, character, player, x, y, clock=0, reducedMotion=false){
 const id=validCharacter(character)?character:'frost';const [skin,shade,light,dark,pants,shoe]=palettes[id];
 const speed=Math.min(Math.abs(player.vx)/430,1);const running=player.grounded&&speed>.07;
 const phase=clock*(12+speed*12);const swing=reducedMotion?0:running?Math.sin(phase)*.65:0;
 const air=!player.grounded;const rise=Math.max(-1,Math.min(1,(player.vy||0)/600));
 const bob=reducedMotion?0:running?Math.abs(Math.cos(phase))*1.2:Math.sin(clock*2.5)*.4;
 ctx.save();ctx.translate(x,y+20);ctx.scale(player.facing||1,1);
 // Feet remain at the original collision baseline; only the upper body bobs.
 for(const side of [-1,1]){
  ctx.save();ctx.translate(side*5,10);ctx.rotate(reducedMotion?0:air?side*(.25-rise*.18):swing*side);
  material(ctx,-3.5,0,7,9,'#546487',pants,3);material(ctx,-4,7,11,4.5,shoe,id==='frost'?'#a86c49':'#559dba',2);
  line(ctx,[[-2,10.5],[6,10.5]],'#fff6dfb0',.8);ctx.restore();
 }
 ctx.translate(0,-bob);ctx.rotate(reducedMotion?0:player.vx/430*.065);
 if(id==='frost'){
  const flutter=reducedMotion?0:Math.sin(clock*10)*2;
  ctx.fillStyle='#ec824c';ctx.beginPath();ctx.moveTo(-8,-3);ctx.quadraticCurveTo(-20,1+flutter,-27,-2+flutter);ctx.lineTo(-27,3+flutter);ctx.quadraticCurveTo(-18,7,-8,1);ctx.fill();
 }
 if(id==='riva'){
  ctx.save();ctx.translate(-10,-20);ctx.rotate(reducedMotion?0:Math.sin(clock*6)*.12+speed*.3);
  material(ctx,-11,0,10,19,'#ffe89a','#c99043',5);line(ctx,[[-7,3],[-7,14]],'#fff0b7',1);ctx.restore();
 }
 for(const side of [-1,1]){
  ctx.save();ctx.translate(side*10,-2);ctx.rotate(reducedMotion?side*-.12:air?side*-.6:side*-.12-swing*side*.8);
  material(ctx,-3,0,6,10,id==='riva'?skin:light,id==='riva'?shade:dark,3);oval(ctx,0,10,2.8,3,skin);ctx.restore();
 }
 material(ctx,-10,-5,20,18,light,dark,5);
 if(id==='frost'){
  line(ctx,[[0,0],[0,11]],'#518b9d',1);line(ctx,[[-7,6],[-3,7]],'#f0fff7',1);rounded(ctx,-12,-6,25,5,2,'#ffa65e');
  rounded(ctx,3,2,4,4,1,'#efffe9');
 }else if(id==='groove'){
  material(ctx,-5,-4,10,16,'#fff7df','#d1b993',2);
  line(ctx,[[-7,-3],[-4,5],[-1,0]],'#ffe5fd',1);line(ctx,[[7,-3],[4,5],[1,0]],'#ffe5fd',1);
  line(ctx,[[-4,-3],[-2,3],[2,4],[5,-3]],'#ffd46a',1.5);oval(ctx,1,4,1.5,1.5,'#ffe8a0');
 }else{
  rounded(ctx,-8,8,16,4,2,skin);line(ctx,[[-6,-1],[4,4],[7,0]],'#eddbff',1.2);rounded(ctx,-9,11,18,3,1,'#30364f');
 }
 const a=getAtlas();if(a){const i=CHARACTERS.findIndex(c=>c.id===id);ctx.drawImage(a,i*128,0,128,160,-32,-48,64,80);}else head(ctx,id);
 ctx.restore();
}
