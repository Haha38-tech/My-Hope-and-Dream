import { World, Vec2, Chain } from 'planck';
import { ARENAS, floorAt } from './arena.js';
import { CARS, MIN_SCALE, MAX_SCALE } from './cars.js';
import { createCar, destroyCar, updateCar, carBodies } from './car.js';

// Низкая гравитация: машины «летают» и могут проехать по потолку на разгоне.
export const GRAVITY = 7.5;
export const GRIP = 1.5;
export const GRIP_SPEED = 9;
export const GRIP_REACH = 0.15;
export const STEP = 1 / 120;

export const DEFAULT_CONFIG = { arenaId: 'stadium', carId: 'buggy', scale: 0.85 };

export function sanitizeConfig(cfg = {}) {
  const c = { ...DEFAULT_CONFIG, ...cfg };
  if (!ARENAS[c.arenaId]) c.arenaId = DEFAULT_CONFIG.arenaId;
  if (!CARS[c.carId]) c.carId = DEFAULT_CONFIG.carId;
  c.scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, Number(c.scale) || DEFAULT_CONFIG.scale));
  return c;
}

export function createGame(cfg = {}) {
  const config = sanitizeConfig(cfg);
  const arena = ARENAS[config.arenaId];
  const world = new World({ gravity: Vec2(0, GRAVITY) });
  const walls = world.createBody({ type: 'static' });
  for (const loop of arena.loops) {
    walls.createFixture(new Chain(loop.map(([x, y]) => Vec2(x, y)), true), {
      friction: 0.9,
      restitution: 0.05,
      userData: { type: 'arena' },
    });
  }

  const game = { world, arena, config, car: null, time: 0, events: [] };

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
    const x = opts.x ?? arena.cx + (arena.spawnDx ?? 0);
    game.car = createCar(world, CARS[config.carId], {
      x,
      y: opts.y ?? floorAt(arena, x) - 1.3 * config.scale,
      facing: opts.facing ?? 1,
      scale: config.scale,
    });
    if (opts.angle) {
      // Поворачиваем всю машину вокруг центра корпуса.
      const c = game.car.chassis.getPosition().clone();
      const cs = Math.cos(opts.angle), sn = Math.sin(opts.angle);
      for (const b of carBodies(game.car)) {
        const p = b.getPosition();
        const dx = p.x - c.x, dy = p.y - c.y;
        b.setTransform(Vec2(c.x + dx * cs - dy * sn, c.y + dx * sn + dy * cs), b.getAngle() + opts.angle);
      }
    }
    return game.car;
  };

  // Сцепление шин: колесо, касающееся стены, прижимается к ней. Сила растёт с
  // квадратом скорости (как прижимная сила): на разгоне машина проходит стены и
  // часть потолка, а медленная — отваливается, а не висит на стене.
  const applyGrip = (car) => {
    // Колесо, чуть оторвавшееся от стены (отскок подвески, вращение корпуса
    // после закругления), тоже притягивается, иначе машина сразу отлипает от потолка.
    const touching = car.wheels.filter((w) => w.contacts > 0
      || -arena.sdf(w.body.getPosition().x, w.body.getPosition().y) - w.def.r * car.scale < GRIP_REACH * car.scale);
    if (!touching.length) return;
    const mass = carBodies(car).reduce((m, b) => m + b.getMass(), 0);
    const v = car.chassis.getLinearVelocity().length();
    const k = GRIP * Math.min(1, (v / GRIP_SPEED) ** 2);
    const f = (k * mass * GRAVITY) / car.wheels.length;
    const h = 0.02;
    for (const w of touching) {
      const p = w.body.getPosition();
      const gx = arena.sdf(p.x + h, p.y) - arena.sdf(p.x - h, p.y);
      const gy = arena.sdf(p.x, p.y + h) - arena.sdf(p.x, p.y - h);
      const len = Math.hypot(gx, gy) || 1;
      w.body.applyForceToCenter(Vec2((gx / len) * f, (gy / len) * f), true);
    }
  };

  game.step = (input) => {
    updateCar(game.car, input);
    applyGrip(game.car);
    world.step(STEP, 8, 3);
    game.time += STEP;
  };

  game.spawn();
  return game;
}
