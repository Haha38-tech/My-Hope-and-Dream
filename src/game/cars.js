// Описания машин: физика (колёса, мотор, голова) + пиксель-арт.
// Метры при масштабе 1, ось X — вперёд по ходу машины, ось Y — вниз.

// Палитра в духе аркадных машинок: синий корпус, белый блик сверху, тёмный низ.
export const BLUE = { hi: '#8fc2ff', light: '#5a9cff', base: '#2f6ae4', dark: '#1b3d99' };
export const NAVY = { hi: '#6f93ec', light: '#2f55c4', base: '#1f3a94', dark: '#13245e' };
const WHITE = { hi: '#ffffff', light: '#ffffff', base: '#f1f4fa', dark: '#aab2c8' };
const CHROME = { hi: '#ffffff', light: '#dfe4ef', base: '#a9b1c6', dark: '#6b7390' };
const GLASS = { hi: '#ffffff', light: '#c9f1ff', base: '#7fc6f0', dark: '#4a86c4' };
const BROWN = { hi: '#c98652', light: '#a5603a', base: '#7d4227', dark: '#532a18' };
const BLACK = { hi: '#55556a', light: '#33333e', base: '#22222b', dark: '#15151b' };
const LAMP = { hi: '#ffffff', light: '#fff6b8', base: '#ffd23f', dark: '#d8961c' };
const TAIL = { hi: '#ffd0d0', light: '#ff7a7a', base: '#e8323f', dark: '#9c1424' };

const rect = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
const arch = (w, extra = 0.07) => ({ circle: [w.x, w.y], r: w.r + extra, ramp: BLACK, flat: true, mask: true });

const buggyWheels = [
  { x: -0.55, y: 0.14, r: 0.24, drive: true },
  { x: 0.56, y: 0.14, r: 0.24, drive: true },
];
const pickupWheels = [
  { x: -0.62, y: 0.17, r: 0.27, drive: true },
  { x: 0.66, y: 0.17, r: 0.27, drive: true },
];
const monsterWheels = [
  { x: -0.62, y: 0.32, r: 0.38, drive: true },
  { x: 0.62, y: 0.32, r: 0.38, drive: true },
];

export const CARS = {
  buggy: {
    name: 'Багги',
    blurb: 'Лёгкая и шустрая',
    chassis: [[[-0.85, -0.1], [-0.55, -0.2], [0.4, -0.2], [0.85, -0.06], [0.85, 0.1], [-0.85, 0.1]]],
    density: 2.0,
    wheelDensity: 2.5,
    tireFriction: 1.8,
    wheels: buggyWheels,
    suspension: { frequencyHz: 6, damping: 0.7 },
    // torque — момент на каждое ведущее колесо, maxSpeed — рад/с, brake — сопротивление качению без газа.
    engine: { torque: 2.6, maxSpeed: 50, brake: 0.12 },
    // Подкрутка корпуса в воздухе.
    air: { torque: 1.6, maxSpin: 7 },
    head: { x: -0.12, y: -0.4, r: 0.21, neckY: -0.22, density: 0.5, frequencyHz: 6, damping: 0.35 },
    art: {
      body: [
        { poly: rect(-0.34, -0.36, 0.06, -0.12), ramp: BROWN },
        { poly: [[-0.92, -0.38], [-0.68, -0.38], [-0.68, -0.31], [-0.92, -0.29]], ramp: NAVY },
        { poly: rect(-0.82, -0.32, -0.76, -0.16), ramp: BLACK },
        { poly: [[-0.88, -0.14], [-0.6, -0.22], [-0.36, -0.22], [-0.36, -0.14], [0.1, -0.14], [0.1, -0.22], [0.42, -0.22], [0.88, -0.08], [0.9, 0.08], [0.8, 0.14], [-0.84, 0.14], [-0.9, 0.04]], ramp: BLUE },
        { poly: [[0.1, -0.22], [0.18, -0.37], [0.25, -0.37], [0.21, -0.22]], ramp: GLASS },
        { poly: rect(-0.95, 0.04, 0.95, 0.16), ramp: NAVY, mask: true },
        { poly: rect(-0.95, -0.04, 0.95, -0.005), ramp: WHITE, mask: true, flat: true },
        { poly: rect(0.78, -0.1, 0.95, -0.03), ramp: LAMP, mask: true },
        { poly: rect(-0.95, -0.15, -0.84, -0.07), ramp: TAIL, mask: true },
        ...buggyWheels.map((w) => arch(w)),
      ],
      tread: false,
    },
  },
  pickup: {
    name: 'Пикап',
    blurb: 'Тяжёлый, крепко стоит',
    chassis: [
      [[-1, -0.2], [1, -0.2], [1, 0.12], [-1, 0.12]],
      [[0.05, -0.2], [0.12, -0.52], [0.55, -0.52], [0.75, -0.2]],
    ],
    density: 2.0,
    wheelDensity: 2.5,
    tireFriction: 1.7,
    wheels: pickupWheels,
    suspension: { frequencyHz: 5.5, damping: 0.75 },
    engine: { torque: 4.3, maxSpeed: 44, brake: 0.2 },
    air: { torque: 2.8, maxSpin: 5.5 },
    head: { x: 0.3, y: -0.66, r: 0.21, neckY: -0.46, density: 0.5, frequencyHz: 6, damping: 0.35 },
    art: {
      body: [
        { poly: rect(-1.03, -0.31, 0.06, -0.24), ramp: NAVY },
        { poly: rect(-0.95, -0.34, -0.89, -0.2), ramp: CHROME },
        { poly: rect(-1.03, -0.25, 0.1, 0.14), ramp: BLUE },
        { poly: [[0.02, -0.25], [0.1, -0.56], [0.57, -0.56], [0.78, -0.25]], ramp: BLUE },
        { poly: [[0.04, -0.27], [0.74, -0.27], [1.03, -0.2], [1.05, 0.08], [0.96, 0.14], [0.04, 0.14]], ramp: BLUE },
        { poly: [[0.16, -0.48], [0.5, -0.48], [0.65, -0.29], [0.16, -0.29]], ramp: GLASS, mask: true },
        { poly: [[0.2, -0.4], [0.42, -0.4], [0.42, -0.29], [0.2, -0.29]], ramp: BROWN, mask: true },
        { poly: rect(-1.05, -0.06, 1.06, -0.025), ramp: WHITE, mask: true, flat: true },
        { poly: rect(-1.05, 0.06, 1.06, 0.16), ramp: NAVY, mask: true },
        { poly: rect(0.95, 0.02, 1.1, 0.12), ramp: CHROME },
        { poly: rect(-1.1, 0.02, -0.97, 0.12), ramp: CHROME },
        { poly: rect(0.94, -0.18, 1.06, -0.1), ramp: LAMP, mask: true },
        { poly: rect(-1.06, -0.22, -0.97, -0.13), ramp: TAIL, mask: true },
        ...pickupWheels.map((w) => arch(w)),
      ],
      tread: false,
    },
  },
  monster: {
    name: 'Монстр',
    blurb: 'Огромные колёса',
    chassis: [[[-0.9, -0.25], [0.3, -0.25], [0.9, -0.05], [0.9, 0.12], [-0.9, 0.12]]],
    density: 1.6,
    wheelDensity: 1.6,
    tireFriction: 2.0,
    wheels: monsterWheels,
    suspension: { frequencyHz: 4.2, damping: 0.6 },
    engine: { torque: 4.5, maxSpeed: 32, brake: 0.25 },
    air: { torque: 2.4, maxSpin: 6 },
    head: { x: -0.12, y: -0.5, r: 0.21, neckY: -0.3, density: 0.5, frequencyHz: 6, damping: 0.35 },
    art: {
      body: [
        { poly: rect(-0.34, -0.44, 0.04, -0.18), ramp: BROWN },
        { poly: rect(-0.62, 0.06, 0.62, 0.2), ramp: NAVY },
        { poly: [[-0.5, 0.18], [-0.44, 0.18], [-0.6, 0.34], [-0.66, 0.3]], ramp: CHROME },
        { poly: [[0.5, 0.18], [0.44, 0.18], [0.6, 0.34], [0.66, 0.3]], ramp: CHROME },
        { poly: [[-0.92, -0.28], [-0.36, -0.28], [-0.36, -0.19], [0.08, -0.19], [0.08, -0.28], [0.32, -0.28], [0.92, -0.08], [0.94, 0.1], [-0.92, 0.1]], ramp: BLUE },
        { poly: [[0.08, -0.28], [0.16, -0.43], [0.23, -0.43], [0.2, -0.28]], ramp: GLASS },
        { poly: rect(-0.95, -0.09, 0.95, -0.055), ramp: WHITE, mask: true, flat: true },
        { poly: rect(-0.95, 0.02, 0.95, 0.12), ramp: NAVY, mask: true },
        { poly: rect(0.8, -0.1, 0.96, -0.02), ramp: LAMP, mask: true },
        { poly: rect(-0.96, -0.26, -0.86, -0.16), ramp: TAIL, mask: true },
        ...monsterWheels.map((w) => arch(w, 0.04)),
      ],
      tread: true,
    },
  },
};

export const CAR_IDS = Object.keys(CARS);
// Размер машины: только уменьшение относительно базового.
export const MIN_SCALE = 0.5;
export const MAX_SCALE = 1;
