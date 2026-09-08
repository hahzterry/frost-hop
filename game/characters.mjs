// All climbers share the same physics and collision box; these are cosmetic skins.
export const CHARACTERS = [
  { id: 'frost', name: 'Buzcu', description: 'Orijinal tırmanışçı', color: '#a2f0dc' },
  { id: 'groove', name: 'Groove', description: 'Afro saçlı popstar', color: '#ffc879' },
  { id: 'riva', name: 'Riva', description: 'Tekno dansçısı', color: '#efa9ff' },
];
export const validCharacter = id => CHARACTERS.some(c => c.id === id);

export function drawCharacter(ctx, character, player, x, y, clock = 0, reducedMotion = false) {
  const moving = player.grounded && Math.abs(player.vx) > 30 && !reducedMotion;
  const stride = moving ? Math.round(Math.sin(clock * 25) * 3) : 0;
  const airborne = !player.grounded;
  ctx.save(); ctx.translate(Math.round(x), Math.round(y) + 20); ctx.scale(player.facing || 1, 1);
  if (Math.abs(player.vx) > 300 && airborne && !reducedMotion) ctx.rotate(Math.sin(clock * 14) * .12);
  const r = (x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); };
  if (character === 'groove') {
    // Rounded, full afro silhouette, dark skin, gold shades and a stage jacket.
    r(-12,-19,24,37,'#111625');
    r(-11,-8,22,20,'#bb58c7'); r(-7,-6,13,18,'#f7f1d9');
    r(-10,-20,20,14,'#955d3e'); r(-7,-18,16,11,'#ac704b');
    r(-15,-30,28,17,'#171624'); r(-19,-25,35,9,'#171624');
    r(-11,-34,21,5,'#211c2e'); r(-17,-29,8,8,'#211c2e'); r(6,-30,7,9,'#30223a');
    r(-15,-22,6,8,'#33263c'); r(-8,-17,19,4,'#f8cc68');
    r(-6,-16,6,3,'#231d31'); r(4,-16,6,3,'#231d31'); r(6,-10,4,2,'#ffe0bc');
    r(-5,-4,3,7,'#ffce66'); r(-2,1,6,3,'#ffce66'); r(4,-4,2,7,'#ffce66');
    r(-16,-2-stride,5,12,'#d874d8'); r(11,-2+stride,5,10,'#d874d8');
    r(-16,8-stride,5,4,'#a56a48'); r(11,7+stride,5,4,'#a56a48');
    r(-9,12,7,7+stride,'#303955'); r(3,12,7,7-stride,'#303955');
    r(-11,17+stride,10,4,'#fff0cb'); r(2,17-stride,12,4,'#fff0cb');
  } else if (character === 'riva') {
    // Blonde ponytail, headphones and bright dancewear.
    r(-13,-23,22,23,'#ffe08b'); r(-18,-17,8,20,'#edbc59');
    r(-23,-4+(airborne?3:stride),10,5,'#ffe49b');
    r(-10,-18,20,14,'#ffd0ae'); r(5,-14,3,4,'#30334a');
    r(-11,-24,22,8,'#ffe28a'); r(-12,-19,10,5,'#f8cf6d');
    r(-12,-25,23,3,'#e296fb'); r(-15,-20,6,11,'#b861dc'); r(-14,-19,3,7,'#8ff0ed');
    r(-10,-4,20,12,'#9762e4'); r(-7,-2,13,6,'#c29cff');
    r(-8,8,16,4,'#ffd0ae'); r(-10,12,21,5,'#222c48');
    r(-15,-2-stride,5,10,'#ffd0ae'); r(11,-5+stride,5,10,'#ffd0ae');
    r(-15,6-stride,5,3,'#8ff0ed'); r(11,3+stride,5,3,'#ff96d5');
    r(-9,15,7,5+stride,'#303b5b'); r(3,15,7,5-stride,'#303b5b');
    r(-10,18+stride,10,4,'#8ff0ed'); r(3,18-stride,11,4,'#8ff0ed');
    r(-9,13,2,6,'#ec91e9'); r(8,13,2,6,'#ec91e9');
  } else {
    r(-12,-19,24,36,'#081524');
    r(-10,-7,20,19,'#e5f6ed'); r(-8,-5,16,15,'#b4dde0');
    r(-10,-18,20,14,'#ffdbb0'); r(5,-14,3,4,'#132b3c');
    r(-13,-22,25,7,'#6cdddf'); r(-10,-27,18,8,'#a6f5e4'); r(-4,-31,6,5,'#f0ffdf');
    r(-14,-17,27,4,'#f1fff0'); r(-12,-5,25,5,'#ff9e55'); r(-23,-4,12,5,'#f37d48'); r(-27,-3+(airborne?3:0),8,5,'#ffac62');
    r(-15,0,5,11,'#8bc3ce'); r(10,-1,5,10,'#d9f2e5');
    r(-9,12,7,7+stride,'#3f6590'); r(3,12,7,7-stride,'#3f6590');
    r(-11,17+stride,10,4,'#edb078'); r(2,17-stride,12,4,'#edb078');
  }
  ctx.restore();
}
