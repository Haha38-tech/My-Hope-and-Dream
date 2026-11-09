import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createGame, STEP } from '../src/game/game.js';
import { floorY } from '../src/game/arena.js';

const run = (game, input, seconds) => {
  for (let t = 0; t < seconds; t += STEP) game.step(input);
};

test('машина падает на пол, встаёт на колёса и не проваливается', () => {
  const g = createGame();
  run(g, 0, 2);
  const p = g.car.chassis.getPosition();
  assert.ok(g.car.grounded, 'колёса на земле');
  assert.ok(p.y < floorY(g.arena) && p.y > floorY(g.arena) - 1.2, `y=${p.y}`);
  assert.ok(Math.abs(g.car.chassis.getAngle()) < 0.1);
  assert.equal(g.car.headHit, false);
});

test('D едет вперёд (вправо), A — назад (влево)', () => {
  const g = createGame();
  run(g, 0, 1);
  const x0 = g.car.chassis.getPosition().x;
  run(g, 1, 0.8);
  const x1 = g.car.chassis.getPosition().x;
  assert.ok(x1 - x0 > 2, `вперёд: ${x1 - x0}`);

  const h = createGame();
  run(h, 0, 1);
  run(h, -1, 0.8);
  assert.ok(h.car.chassis.getPosition().x - x0 < -2);
});

test('в воздухе газ крутит корпус (нос вверх), назад — нос вниз', () => {
  for (const [input, sign] of [[1, -1], [-1, 1]]) {
    const g = createGame();
    g.spawn({ y: 4 });
    run(g, input, 0.3);
    assert.ok(Math.sign(g.car.chassis.getAngularVelocity()) === sign, `input ${input}`);
  }
});

test('падение вверх ногами — удар головой', () => {
  const g = createGame();
  g.spawn({ angle: Math.PI, y: floorY(g.arena) - 2 });
  run(g, 0, 1.5);
  assert.ok(g.car.headHit);
  assert.equal(g.events[0].type, 'headHit');
});
