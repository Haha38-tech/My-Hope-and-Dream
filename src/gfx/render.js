import { ART_PPM } from './pixelart.js';

function drawSprite(ctx, sprite, body, scale, facing = 1) {
  const p = body.getPosition();
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(body.getAngle());
  ctx.scale((facing * 1) / ART_PPM, 1 / ART_PPM);
  ctx.drawImage(sprite.canvas, -sprite.ox, -sprite.oy);
  ctx.restore();
}

export function drawCar(ctx, car, sprites) {
  // Голова позади корпуса — шея прячется в кабине.
  drawSprite(ctx, sprites.head, car.head, 1, car.facing);
  drawSprite(ctx, sprites.body, car.chassis, 1, car.facing);
  car.wheels.forEach((w, i) => drawSprite(ctx, sprites.wheels[i], w.body, 1, car.facing));
}

export function drawDebug(ctx, world) {
  ctx.save();
  ctx.lineWidth = 0.03;
  ctx.strokeStyle = '#4dff88';
  for (let b = world.getBodyList(); b; b = b.getNext()) {
    const p = b.getPosition();
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(b.getAngle());
    for (let f = b.getFixtureList(); f; f = f.getNext()) {
      const s = f.getShape();
      ctx.beginPath();
      if (s.getType() === 'circle') {
        const c = s.getCenter();
        ctx.arc(c.x, c.y, s.getRadius(), 0, Math.PI * 2);
        ctx.moveTo(c.x, c.y);
        ctx.lineTo(c.x + s.getRadius(), c.y);
      } else {
        const vs = s.m_vertices;
        vs.forEach((v, i) => (i ? ctx.lineTo(v.x, v.y) : ctx.moveTo(v.x, v.y)));
        if (s.getType() === 'polygon' || s.m_hasPrevVertex !== undefined) ctx.closePath();
      }
      ctx.stroke();
    }
    ctx.restore();
  }
  ctx.restore();
}
