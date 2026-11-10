import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createGame, sanitizeConfig, STEP } from '../src/game/game.js';
import { ARENA_IDS, floorAt } from '../src/game/arena.js';
import { CAR_IDS, MAX_SCALE, MIN_SCALE } from '../src/game/cars.js';

const run = (game, input, seconds) => {
  for (let t = 0; t < seconds; t += STEP) game.step(input);
};

for (const arenaId of ARENA_IDS) {
  for (const carId of CAR_IDS) {
    test(`${arenaId}/${carId}: встаёт на колёса, D — вправо, A — влево`, () => {
      const g = createGame({ arenaId, carId, scale: 1 });
      run(g, 0, 1.5);
      const p = g.car.chassis.getPosition();
      assert.ok(g.car.grounded, 'колёса на земле');
      assert.ok(Math.abs(g.car.chassis.getAngle()) < 0.15, `угол ${g.car.chassis.getAngle()}`);
      assert.ok(p.y < floorAt(g.arena, p.x));
      assert.equal(g.car.headHit, false);

      const x0 = p.x;
      run(g, 1, 0.8);
      assert.ok(g.car.chassis.getPosition().x - x0 > 1.5, 'вперёд');
      const h = createGame({ arenaId, carId, scale: 1 });
      run(h, 0, 1.5);
      run(h, -1, 0.8);
      assert.ok(h.car.chassis.getPosition().x - x0 < -1.5, 'назад');
    });
  }
}

test('на разгоне машина проезжает больше половины потолка', () => {
  for (const carId of CAR_IDS) {
    const g = createGame({ arenaId: 'stadium', carId });
    run(g, 0, 1);
    let minX = Infinity, maxX = -Infinity;
    for (let t = 0; t < 4.5; t += STEP) {
      g.step(1);
      const p = g.car.chassis.getPosition();
      if (p.y < g.arena.cy - 2.6 && g.car.grounded) { minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x); }
    }
    assert.ok(maxX - minX > g.arena.width / 2, `${carId}: ${maxX - minX}`);
  }
});

test('медленная машина на потолке не держится и падает', () => {
  const g = createGame({ arenaId: 'stadium' });
  g.spawn({ angle: Math.PI, y: 1.8 });
  run(g, 0, 1.5);
  assert.ok(g.car.chassis.getPosition().y > g.arena.cy, 'упала вниз');
});

test('в воздухе газ крутит корпус (нос вверх), назад — нос вниз', () => {
  for (const [input, sign] of [[1, -1], [-1, 1]]) {
    const g = createGame();
    g.spawn({ y: 3 });
    run(g, input, 0.3);
    assert.equal(Math.sign(g.car.chassis.getAngularVelocity()), sign, `input ${input}`);
  }
});

test('падение вверх ногами — удар головой', () => {
  const g = createGame();
  g.spawn({ angle: Math.PI, y: floorAt(g.arena, g.arena.cx) - 2 });
  run(g, 0, 1.5);
  assert.ok(g.car.headHit);
  assert.equal(g.events[0].type, 'headHit');
});

test('размер машины только уменьшается; уменьшенная машина меньше', () => {
  assert.equal(sanitizeConfig({ scale: 3 }).scale, MAX_SCALE);
  assert.equal(sanitizeConfig({ scale: 0.1 }).scale, MIN_SCALE);
  assert.equal(sanitizeConfig({ arenaId: 'nope', carId: 'nope' }).arenaId, 'stadium');
  const big = createGame({ scale: 1 }).car.wheels[0].body.getFixtureList().getShape().getRadius();
  const small = createGame({ scale: 0.5 }).car.wheels[0].body.getFixtureList().getShape().getRadius();
  assert.ok(Math.abs(small - big / 2) < 1e-9);
});
