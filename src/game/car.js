import { Vec2, Polygon, Circle, WheelJoint, WeldJoint } from 'planck';

// facing: 1 — машина смотрит вправо, -1 — влево (описание зеркалится).
// scale ≤ 1 уменьшает машину; мотор масштабируется так, чтобы ускорения и скорость сохранились.
export function createCar(world, def, { x, y, facing = 1, scale = 1, group = -1 }) {
  const s = scale;
  const fx = (v) => v * facing * s;
  const car = { def, facing, scale: s, chassis: null, wheels: [], head: null, headHit: false, grounded: false, input: 0 };
  car.engine = {
    torque: def.engine.torque * s ** 3,
    maxSpeed: def.engine.maxSpeed / s,
    brake: def.engine.brake * s ** 3,
    airTorque: def.air.torque * s ** 4,
    maxSpin: def.air.maxSpin,
  };

  car.chassis = world.createBody({ type: 'dynamic', position: Vec2(x, y) });
  for (const poly of def.chassis) {
    car.chassis.createFixture(new Polygon(poly.map(([px, py]) => Vec2(fx(px), py * s))), {
      density: def.density,
      friction: 0.5,
      restitution: 0.05,
      filterGroupIndex: group,
      userData: { type: 'chassis', car },
    });
  }

  for (const w of def.wheels) {
    const at = Vec2(x + fx(w.x), y + w.y * s);
    const body = world.createBody({ type: 'dynamic', position: at });
    const wheel = { def: w, body, joint: null, contacts: 0 };
    body.createFixture(new Circle(w.r * s), {
      density: def.wheelDensity,
      friction: def.tireFriction,
      restitution: 0.1,
      filterGroupIndex: group,
      userData: { type: 'wheel', car, wheel },
    });
    wheel.joint = world.createJoint(new WheelJoint({
      enableMotor: true,
      motorSpeed: 0,
      maxMotorTorque: car.engine.brake,
      frequencyHz: def.suspension.frequencyHz,
      dampingRatio: def.suspension.damping,
    }, car.chassis, body, at, Vec2(0, 1)));
    car.wheels.push(wheel);
  }

  const h = def.head;
  car.head = world.createBody({ type: 'dynamic', position: Vec2(x + fx(h.x), y + h.y * s) });
  car.head.createFixture(new Circle(h.r * s), {
    density: h.density,
    friction: 0.6,
    restitution: 0.2,
    filterGroupIndex: group,
    userData: { type: 'head', car },
  });
  // Мягкая (по углу) сварка — голова пружинисто болтается на «шее».
  car.headJoint = world.createJoint(new WeldJoint({
    frequencyHz: h.frequencyHz,
    dampingRatio: h.damping,
  }, car.chassis, car.head, Vec2(x + fx(h.x), y + h.neckY * s)));

  return car;
}

export function carBodies(car) {
  return [car.chassis, car.head, ...car.wheels.map((w) => w.body)];
}

export function destroyCar(world, car) {
  for (const b of carBodies(car)) world.destroyBody(b);
}

// input: 1 — газ вперёд, -1 — назад, 0 — отпущено.
export function updateCar(car, input) {
  const e = car.engine;
  const dir = input * car.facing; // направление на экране
  car.input = input;
  car.grounded = car.wheels.some((w) => w.contacts > 0);

  for (const w of car.wheels) {
    if (input !== 0 && w.def.drive) {
      w.joint.setMotorSpeed(dir * e.maxSpeed);
      w.joint.setMaxMotorTorque(e.torque);
    } else {
      w.joint.setMotorSpeed(0);
      w.joint.setMaxMotorTorque(e.brake);
    }
  }

  if (input !== 0 && !car.grounded) {
    // Газ в воздухе задирает нос, задний ход — опускает.
    const torque = -dir * e.airTorque;
    const spin = car.chassis.getAngularVelocity() * Math.sign(torque);
    if (spin < e.maxSpin) car.chassis.applyTorque(torque, true);
  }
}
