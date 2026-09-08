import { sprites } from './sprite-cache.mjs';
import { rounded } from './characters.mjs';
const cache=new Map();
export function detailLevel(width=480){return width<380?'low':'medium';}
// Two repeating relief textures share a fixed 256 × 128 atlas per theme.
// Small screens omit fine grooves and halve ambient particles (2D LOD).
export function masonry(ctx,slime,offset,detail){
 const key=`${slime}:${detail}`;let tile=cache.get(key);
 if(!tile){
  tile=typeof OffscreenCanvas!=='undefined'?new OffscreenCanvas(256,128):typeof document!=='undefined'?document.createElement('canvas'):null;
  if(tile){tile.width=256;tile.height=128;const c=tile.getContext('2d');
   for(let row=0;row<2;row++)for(let col=-1;col<3;col++){
    const x=col*128+(row%2)*64,y=row*64;
    const g=c.createLinearGradient(x,y,x+120,y+64);g.addColorStop(0,slime?'#483359':'#233b55');g.addColorStop(1,slime?'#251932':'#122339');
    rounded(c,x+1,y+1,126,62,5,g);
    c.strokeStyle=slime?'#b493c51b':'#a3d1e320';c.lineWidth=1;c.beginPath();c.moveTo(x+6,y+2);c.lineTo(x+121,y+2);c.stroke();
    if(detail==='medium'){
     c.strokeStyle=slime?'#160c201c':'#071b3029';c.beginPath();c.moveTo(x+18,y+22);c.lineTo(x+43,y+24);c.lineTo(x+49,y+29);c.stroke();
     c.fillStyle='#e7f5ff07';c.fillRect(x+74,y+44,26,1);
    }
   }cache.set(key,tile);
  }
 }
 if(tile){ctx.save();ctx.beginPath();ctx.rect(18,0,444,640);ctx.clip();for(let y=offset-128;y<640;y+=128)for(let x=18;x<480;x+=256)ctx.drawImage(tile,x,y);ctx.restore();}
}
function paintPlatform(ctx,f,y,slime,accent){
 const x=f.x,w=f.w;
 const shadow=ctx.createLinearGradient(0,y+15,0,y+27);shadow.addColorStop(0,'#03081866');shadow.addColorStop(1,'#03081800');ctx.fillStyle=shadow;ctx.fillRect(x+3,y+15,w,12);
 const side=ctx.createLinearGradient(0,y,0,y+18);side.addColorStop(0,slime?'#be9cde':'#80b5cf');side.addColorStop(.3,slime?'#755393':'#3e7798');side.addColorStop(1,slime?'#3c2956':'#193d59');
 rounded(ctx,x,y,w,18,3,side);
 rounded(ctx,x+3,y+6,w-6,9,2,slime?'#452e625a':'#102e4b66');
 const cap=ctx.createLinearGradient(x,y,x,y+6);cap.addColorStop(0,slime?'#e1ffcb':'#f0ffff');cap.addColorStop(1,accent);rounded(ctx,x,y,w,5,2,cap);
 ctx.fillStyle='#ffffffb3';ctx.fillRect(x+4,y,w-8,1);
 ctx.fillStyle=slime?'#d7b8f329':'#c4f3ff25';ctx.beginPath();ctx.moveTo(x+w*.2,y+5);ctx.lineTo(x+w*.36,y+5);ctx.lineTo(x+w*.3,y+15);ctx.lineTo(x+w*.15,y+15);ctx.fill();
 for(const dx of [10,w-19]){
  const g=ctx.createLinearGradient(x+dx,y,x+dx+6,y+20);g.addColorStop(0,slime?'#d9ffb5':'#d7ffff');g.addColorStop(1,slime?'#67b790':'#65a7c766');
  rounded(ctx,x+dx,y+4,slime?6:4,dx===10?11:16,slime?3:1,g);
 }
 ctx.fillStyle=slime?'#b8eeaa':'#8edff0';ctx.fillRect(x+25,y+8,Math.max(0,w-50),1);
 if(f.floor%10===0){rounded(ctx,x+w/2-9,y+7,18,6,3,slime?'#b3ec9c':'#b4d5ff');ctx.fillStyle='#ffffffbb';ctx.fillRect(x+w/2-5,y+8,10,1);}
}
function paintLightField(ctx,slime){
 const glow=ctx.createRadialGradient(110,100,8,160,150,390);glow.addColorStop(0,slime?'#d68cff1c':'#8feaff20');glow.addColorStop(1,'#00000000');ctx.fillStyle=glow;ctx.fillRect(18,0,444,640);
 const vignette=ctx.createLinearGradient(0,0,480,0);vignette.addColorStop(0,'#020a1955');vignette.addColorStop(.22,'#020a1900');vignette.addColorStop(.78,'#020a1900');vignette.addColorStop(1,'#020a1955');ctx.fillStyle=vignette;ctx.fillRect(18,0,444,640);
}

export function platform(ctx,f,y,slime,accent){
 const w=f.w+3,h=27;
 const key=`platform:${f.w}:${slime}:${accent}:${f.floor%10===0}`;
 const sprite=sprites.get(key,w,h,c=>paintPlatform(c,{x:0,w:f.w,floor:f.floor},0,slime,accent));
 if(sprite)ctx.drawImage(sprite,f.x,y,w,h);else paintPlatform(ctx,f,y,slime,accent);
}

export function lightField(ctx,slime){
 const sprite=sprites.get(`light:${slime}`,480,640,c=>paintLightField(c,slime),1);
 if(sprite)ctx.drawImage(sprite,0,0,480,640);else paintLightField(ctx,slime);
}
