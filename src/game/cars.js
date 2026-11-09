// Описания машин: физика (колёса, мотор, голова) + пиксель-арт.
// Метры, ось X — вперёд по ходу машины, ось Y — вниз.

const RED = { light: '#ff8f5e', base: '#e0472f', dark: '#9a2622' };
const ARCH = { base: '#2a2134' };
const COCKPIT = { light: '#5b4660', base: '#3b2c42', dark: '#2a1f30' };
const STRIPE = { light: '#ffffff', base: '#f3ece2', dark: '#c4b6ae' };
const GLASS = { light: '#e9fcff', base: '#8fd8f5', dark: '#4b8fc0' };
const STEEL = { light: '#b9c0d8', base: '#6f7899', dark: '#3d4462' };
const LAMP = { light: '#fff6b8', base: '#ffd23f', dark: '#d8961c' };
const TAIL = { light: '#ffb3b3', base: '#ff3b4a', dark: '#b3122a' };

const rect = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];

export const CARS = {
  buyan: {
    name: 'Буян',
    // Выпуклый полигон корпуса для физики.
    chassis: [[-1.15, -0.22], [-0.6, -0.3], [0.3, -0.3], [1.15, -0.1], [1.15, 0.18], [-1.15, 0.18]],
    density: 2.2,
    wheelDensity: 1.0,
    tireFriction: 1.6,
    wheels: [
      { x: -0.74, y: 0.27, r: 0.36, drive: true },
      { x: 0.76, y: 0.27, r: 0.36, drive: true },
    ],
    suspension: { frequencyHz: 5.5, damping: 0.75 },
    // torque — момент на каждое ведущее колесо, maxSpeed — рад/с, brake — сопротивление качению без газа.
    engine: { torque: 10, maxSpeed: 26, brake: 0.35 },
    // Подкрутка корпуса в воздухе.
    air: { torque: 6, maxSpin: 7 },
    head: { x: -0.2, y: -0.6, r: 0.3, neckY: -0.32, density: 0.6, frequencyHz: 6, damping: 0.35 },
    art: {
      body: [
        { poly: [[-1.18, -0.24], [-0.62, -0.32], [0.3, -0.32], [0.72, -0.17], [1.18, -0.11], [1.2, 0.1], [1.1, 0.21], [-1.12, 0.21], [-1.2, 0.08]], ramp: RED },
        { circle: [-0.74, 0.27], r: 0.45, ramp: ARCH, flat: true, mask: true },
        { circle: [0.76, 0.27], r: 0.45, ramp: ARCH, flat: true, mask: true },
        { poly: rect(-0.6, -0.34, 0.2, -0.22), ramp: COCKPIT, mask: true },
        { poly: rect(-1.25, -0.05, 1.25, 0.02), ramp: STRIPE, mask: true },
        { poly: rect(1.04, -0.12, 1.25, -0.02), ramp: LAMP, mask: true },
        { poly: rect(-1.25, -0.24, -1.1, -0.12), ramp: TAIL, mask: true },
        { poly: [[0.18, -0.31], [0.3, -0.64], [0.4, -0.64], [0.3, -0.31]], ramp: GLASS },
        { poly: rect(-1.04, -0.5, -0.97, -0.22), ramp: STEEL },
        { poly: [[-1.28, -0.6], [-0.84, -0.56], [-0.84, -0.47], [-1.24, -0.5]], ramp: STEEL },
        { poly: rect(-1.36, 0.08, -1.1, 0.15), ramp: STEEL },
      ],
      wheel: 'standard',
      head: 'bandana',
    },
  },
};
