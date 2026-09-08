export const effectForCombo = combo => combo >= 20 ? 'flame' : combo >= 2 ? 'star' : 'none';
export const themeForFloor = floor => floor >= 100 ? 'slime' : 'ice';
const starColors = ['#8ff6e5', '#ffd58a', '#f4a4ed', '#adaaff', '#baf098'];
export class FootTrail {
  constructor(random = Math.random) { this.random = random; this.reset(); }
  reset() { this.particles = []; this.elapsed = 0; this.serial = 0; }
  update(dt, game, reducedMotion = false) {
    if (game.status !== 'playing') return;
    if (reducedMotion) { this.reset(); return; }
    for (const p of this.particles) {
      p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt;
    }
    this.particles = this.particles.filter(p => p.life > 0);
    const kind = effectForCombo(game.combo);
    if (kind === 'none') { this.elapsed = 0; return; }
    this.elapsed += dt;
    const interval = kind === 'flame' ? 1 / 26 : 1 / 18;
    while (this.elapsed >= interval) {
      this.elapsed -= interval;
      const flame = kind === 'flame';
      const p = game.player;
      const life = flame ? .3 + this.random() * .12 : .4 + this.random() * .22;
      this.particles.push({
        kind, x: p.x + p.w / 2 + (this.serial++ % 2 ? 7 : -7), y: p.y + p.h,
        vx: -p.vx * .045 + (this.random() - .5) * 20,
        vy: flame ? -20 - this.random() * 12 : 12 + this.random() * 18,
        life, maxLife: life, size: flame ? 3 + this.random() * 2 : 2 + this.random() * 1.5,
        color: starColors[this.serial % starColors.length], rotation: this.random() * Math.PI,
      });
    }
    // A short, bounded trail keeps platforms and feet easy to see on a phone.
    this.particles = this.particles.slice(-24);
  }
}
export function drawFootTrail(ctx, particles, camera) {
  ctx.save();
  for (const p of particles) {
    const alpha = Math.max(0, p.life / p.maxLife);
    ctx.globalAlpha = alpha * .85;
    ctx.save(); ctx.translate(p.x, p.y - camera);
    if (p.kind === 'star') {
      ctx.rotate(p.rotation + (1 - alpha) * 1.4);
      ctx.fillStyle = p.color; ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const angle = i * Math.PI / 4, radius = i % 2 ? p.size * .33 : p.size;
        const x = Math.cos(angle) * radius, y = Math.sin(angle) * radius;
        if (!i) ctx.moveTo(x,y); else ctx.lineTo(x,y);
      }
      ctx.closePath(); ctx.fill();
    } else {
      const s = p.size;
      ctx.fillStyle = '#ff955b'; ctx.beginPath();
      ctx.moveTo(-s*.6,1); ctx.quadraticCurveTo(-s,-s*.7,0,-s*2.1);
      ctx.quadraticCurveTo(s*.35,-s,s*.65,0); ctx.quadraticCurveTo(0,s,-s*.6,1); ctx.fill();
      ctx.fillStyle = '#ffe3a0'; ctx.fillRect(-1,-s*.6,2,s*.7);
    }
    ctx.restore();
  }
  ctx.restore();
}
