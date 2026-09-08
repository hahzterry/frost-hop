// Rendering only: simulation continues on every RAF with its existing 120 Hz step.
export class RenderBudget {
  constructor(dpr=1){this.maxScale=Math.max(1,Math.min(2,dpr));this.scale=this.maxScale;this.reset();}
  reset(){this.next=null;this.windowStart=null;this.frames=0;this.cost=0;this.goodWindows=0;}
  shouldDraw(now){
    if(this.next===null){this.next=now+1000/60;return true;}
    if(now+.25<this.next)return false;
    this.next+=1000/60;
    if(this.next<now-.25)this.next=now+1000/60;
    return true;
  }
  sample(now,cost,active){
    if(!active){this.windowStart=null;this.frames=0;this.cost=0;this.goodWindows=0;return false;}
    if(this.windowStart===null){this.windowStart=now;return false;}
    this.frames++;this.cost+=cost;
    const elapsed=now-this.windowStart;if(elapsed<2000)return false;
    const fps=this.frames*1000/elapsed,average=this.cost/this.frames;
    let next=this.scale;
    if(fps<48||average>12){next=Math.max(1,this.scale-.25);this.goodWindows=0;}
    else if(fps>57&&average<6){if(++this.goodWindows>=4){next=Math.min(this.maxScale,this.scale+.25);this.goodWindows=0;}}
    else this.goodWindows=0;
    this.frames=0;this.cost=0;this.windowStart=now;
    const changed=next!==this.scale;this.scale=next;return changed;
  }
}
