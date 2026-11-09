import { World, Vec2, Chain } from 'planck';
import { ARENA, arenaOutline, floorY } from './arena.js';
import { CARS } from './cars.js';
import { createCar, destroyCar, updateCar } from './car.js';

export const GRAVITY = 20;
export const STEP = 1 / 120;

export function createGame({ carId = 'buyan', arena = ARENA } = {}) {
  const world = new World({ gravity: Vec2(0, GRAVITY) });
  const walls = world.createBody({ type: 'static' });
  walls.createFixture(new Chain(arenaOutline(arena).map(([x, y]) => Vec2(x, y)), true), {
    friction: 0.9,
    restitution: 0.05,
    userData: { type: 'arena' },
  });

  const game = { world, arena, carId, car: null, time: 0, events: [] };

  const onContact = (contact, delta) => {
    const a = contact.getFixtureA().getUserData();
    const b = contact.getFixtureB().getUserData();
    const other = a?.type === 'arena' ? b : b?.type === 'arena' ? a : null;
    if (!other) return;
    if (other.type === 'wheel') other.wheel.contacts += delta;
    if (other.type === 'head' && delta > 0 && !other.car.headHit) {
      other.car.headHit = true;
      game.events.push({ type: 'headHit', car: other.car, at: other.car.head.getPosition().clone() });
    }
  };
  world.on('begin-contact', (c) => onContact(c, 1));
  world.on('end-contact', (c) => onContact(c, -1));

  game.spawn = (opts = {}) => {
    if (game.car) destroyCar(world, game.car);
    game.car = createCar(world, CARS[carId], {
      x: opts.x ?? arena.cx,
      y: opts.y ?? floorY(arena) - 1.6,
      facing: opts.facing ?? 1,
    });
    if (opts.angle) {
      // Поворачиваем всю машину вокруг центра корпуса.
      const c = game.car.chassis.getPosition().clone();
      for (const b of [game.car.chassis, game.car.head, ...game.car.wheels.map((w) => w.body)]) {
        const p = b.getPosition();
        const dx = p.x - c.x, dy = p.y - c.y;
        const cs = Math.cos(opts.angle), sn = Math.sin(opts.angle);
        b.setTransform(Vec2(c.x + dx * cs - dy * sn, c.y + dx * sn + dy * cs), b.getAngle() + opts.angle);
      }
    }
    return game.car;
  };

  game.step = (input) => {
    updateCar(game.car, input);
    world.step(STEP, 8, 3);
    game.time += STEP;
  };

  game.spawn();
  return game;
}
