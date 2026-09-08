// Shared LRU, bounded by RGBA pixels as well as entry count. Canvas backing
// stores are released on eviction; unsupported environments draw directly.
export class SpriteCache {
 constructor(limit=8*1024*1024){this.limit=limit;this.bytes=0;this.entries=new Map();}
 get(key,w,h,paint,scale=2){
  let entry=this.entries.get(key);
  if(entry){this.entries.delete(key);this.entries.set(key,entry);return entry.canvas;}
  const width=Math.ceil(w*scale),height=Math.ceil(h*scale),bytes=width*height*4;
  if(bytes>this.limit)return null;
  const canvas=typeof OffscreenCanvas!=='undefined'?new OffscreenCanvas(width,height):typeof document!=='undefined'?document.createElement('canvas'):null;
  if(!canvas)return null;
  canvas.width=width;canvas.height=height;const ctx=canvas.getContext('2d');if(!ctx)return null;
  ctx.scale(scale,scale);paint(ctx);
  while(this.bytes+bytes>this.limit||this.entries.size>=128){const oldest=this.entries.keys().next().value;const old=this.entries.get(oldest);this.bytes-=old.bytes;old.canvas.width=1;old.canvas.height=1;this.entries.delete(oldest);}
  this.entries.set(key,{canvas,bytes});this.bytes+=bytes;return canvas;
 }
}
export const sprites=new SpriteCache();
