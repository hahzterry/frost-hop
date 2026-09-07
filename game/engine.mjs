// Pure, fixed-step game simulation. Coordinates grow downwards.
export const WIDTH = 480;
export const HEIGHT = 640;
export const STEP = 1 / 120;
export class TowerGame {
  constructor(random = Math.random) { this.random = random; this.reset(); }
  reset() {
    this.player = { x: 224, y: 550, w: 28, h: 40, vx: 0, vy: 0, grounded: true, facing: 1 };
    this.platforms = [{ x: 18, y: 590, w: 444, floor: 0 }];
    this.camera = 0; this.time = 0; this.ascentAt = null;
    this.floor = 0; this.lastFloor = 0; this.score = 0; this.bonus = 0;
    this.combo = 0; this.maxCombo = 0; this.comboTimer = 0;
    this.status = 'ready'; this.events = []; this.coyote = .1; this.jumpBuffer = 0;
    this.generated = 0; this.lastX = 224; this.generate();
  }
  start() { this.reset(); this.status = 'playing'; }
  pause() { if (this.status === 'playing') this.status = 'paused'; }
  resume() { if (this.status === 'paused') this.status = 'playing'; }
  generate() {
    while (590 - this.generated * 70 > this.camera - 750) {
      const floor = ++this.generated;
      const w = Math.max(100, 176 - Math.floor(floor / 10) * 6);
      // Every consecutive pair is reachable even without a running jump.
      const center = Math.max(28 + w/2, Math.min(WIDTH - 28 - w/2, this.lastX + (this.random() - .5) * 230));
      this.platforms.push({ x: center - w/2, y: 590 - floor * 70, w, floor });
      this.lastX = center;
    }
    this.platforms = this.platforms.filter(p => p.y < this.camera + HEIGHT + 120);
  }
  update(dt, input = {}) {
    this.events = [];
    if (this.status !== 'playing') return;
    this.time += dt;
    const p = this.player;
    const axis = Number(!!input.right) - Number(!!input.left);
    p.vx += axis * 1550 * dt;
    if (!axis) p.vx *= Math.exp(- (p.grounded ? 6 : 1.5) * dt);
    p.vx = Math.max(-430, Math.min(430, p.vx));
    if (axis) p.facing = axis;
    this.coyote = p.grounded ? .1 : Math.max(0, this.coyote - dt);
    this.jumpBuffer = input.jump ? .12 : Math.max(0, this.jumpBuffer - dt);
    if (this.jumpBuffer > 0 && this.coyote > 0) {
      p.vy = -(585 + Math.abs(p.vx) * .55);
      p.grounded = false; this.coyote = 0; this.jumpBuffer = 0;
      this.events.push({ type: 'jump', x: p.x + p.w/2, y: p.y + p.h });
    }
    const oldBottom = p.y + p.h;
    p.x += p.vx * dt;
    if (p.x < 18) { p.x = 18; p.vx = Math.abs(p.vx) * .85; this.events.push({type:'wall'}); }
    if (p.x + p.w > WIDTH - 18) { p.x = WIDTH - 18 - p.w; p.vx = -Math.abs(p.vx) * .85; this.events.push({type:'wall'}); }
    p.vy += 1450 * dt; p.y += p.vy * dt; p.grounded = false;
    if (p.vy >= 0) {
      let landing = null;
      for (const platform of this.platforms) {
        if (oldBottom <= platform.y + .5 && p.y + p.h >= platform.y && p.x + p.w > platform.x && p.x < platform.x + platform.w && (!landing || platform.y < landing.y)) landing = platform;
      }
      if (landing) {
        p.y = landing.y - p.h; p.vy = 0; p.grounded = true;
        if (landing.floor > this.floor) {
          const gap = landing.floor - this.lastFloor;
          this.floor = landing.floor;
          if (this.ascentAt === null) this.ascentAt = this.time;
          if (gap >= 2) {
            this.combo = this.comboTimer > 0 ? this.combo + 1 : 1;
            this.comboTimer = 3.5; this.maxCombo = Math.max(this.maxCombo, this.combo);
            this.bonus += gap * this.combo * 50;
            this.events.push({type:'combo', x:p.x, y:p.y, value:this.combo});
          }
          this.score = this.floor * 100 + this.bonus;
          this.events.push({type:'land', x:p.x + p.w/2, y:landing.y});
        }
        this.lastFloor = landing.floor;
      }
    }
    this.comboTimer = Math.max(0, this.comboTimer - dt);
    if (!this.comboTimer) this.combo = 0;
    this.camera = Math.min(this.camera, p.y - 285);
    if (this.ascentAt !== null && this.time - this.ascentAt > 5) this.camera -= Math.min(95, 20 + this.floor * .5) * dt;
    this.generate();
    if (p.y > this.camera + HEIGHT + 20) { this.status = 'over'; this.events.push({type:'over'}); }
  }
}
