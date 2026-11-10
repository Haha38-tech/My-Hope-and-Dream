// Арены. Координаты в метрах, ось Y вниз. Каждая арена — аналитическое SDF
// (< 0 — воздух, > 0 — стена), из которого строятся контуры для физики.

export const WORLD = { width: 18, height: 10.125 };

const CX = WORLD.width / 2;
const CY = 5.15;

// --- Примитивы SDF (отрицательные внутри фигуры).
const roundBox = (x, y, cx, cy, hw, hh, r) => {
  const qx = Math.abs(x - cx) - hw + r;
  const qy = Math.abs(y - cy) - hh + r;
  return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - r;
};
const circle = (x, y, cx, cy, r) => Math.hypot(x - cx, y - cy) - r;
// Плавное объединение — скруглённые переходы между фигурами.
const smin = (a, b, k) => {
  const h = Math.max(k - Math.abs(a - b), 0) / k;
  return Math.min(a, b) - (h * h * k) / 4;
};
// Суперэллипс: неевклидово «расстояние», нормализуется градиентом в normalize().
const superEllipse = (x, y, cx, cy, a, b, n) =>
  ((Math.abs(x - cx) / a) ** n + (Math.abs(y - cy) / b) ** n) ** (1 / n) - 1;

// Делит функцию на модуль градиента — получаем почти точное расстояние у границы.
function normalize(f, h = 1e-3) {
  return (x, y) => {
    const v = f(x, y);
    const gx = (f(x + h, y) - f(x - h, y)) / (2 * h);
    const gy = (f(x, y + h) - f(x, y - h)) / (2 * h);
    return v / Math.max(1e-6, Math.hypot(gx, gy));
  };
}

// Контур звёздной относительно (cx, cy) фигуры: лучи из центра до границы.
function rayLoop(inside, cx, cy, n = 160, maxR = 12) {
  const pts = [];
  for (let i = 0; i < n; i++) {
    const t = (i / n) * Math.PI * 2;
    const dx = Math.cos(t), dy = Math.sin(t);
    let lo = 0, hi = 0.05;
    while (hi < maxR && inside(cx + dx * hi, cy + dy * hi)) { lo = hi; hi += 0.05; }
    for (let k = 0; k < 30; k++) {
      const mid = (lo + hi) / 2;
      if (inside(cx + dx * mid, cy + dy * mid)) lo = mid; else hi = mid;
    }
    pts.push([cx + dx * lo, cy + dy * lo]);
  }
  return pts;
}

function makeArena({ id, name, room, islands = [], spawnDx = 0 }) {
  // Воздух = внутри комнаты и вне островов.
  const roomN = normalize(room);
  const islandsN = islands.map((s) => ({ ...s, f: normalize(s.f) }));
  const sdf = (x, y) => {
    let d = roomN(x, y);
    for (const s of islandsN) d = Math.max(d, -s.f(x, y));
    return d;
  };
  const loops = [
    rayLoop((x, y) => room(x, y) < 0, CX, CY),
    ...islands.map((s) => rayLoop((x, y) => s.f(x, y) < 0, s.cx, s.cy, 64)),
  ];
  return { id, name, ...WORLD, cx: CX, cy: CY, sdf, loops, spawnDx };
}

export const ARENAS = {
  stadium: makeArena({
    id: 'stadium',
    name: 'Стадион',
    room: (x, y) => roundBox(x, y, CX, CY, 8.1, 3.95, 3.6),
  }),
  donut: makeArena({
    id: 'donut',
    name: 'Пончик',
    room: (x, y) => superEllipse(x, y, CX, CY, 8.2, 4.05, 2.6),
    islands: [{ cx: CX, cy: CY - 0.2, f: (x, y) => superEllipse(x, y, CX, CY - 0.2, 2.3, 0.32, 2) }],
  }),
  pit: makeArena({
    id: 'pit',
    name: 'Яма',
    room: (x, y) => smin(
      roundBox(x, y, CX, CY - 0.35, 8.1, 3.6, 2.6),
      circle(x, y, CX, CY + 0.9, 3.25),
      1.2,
    ),
    spawnDx: -5,
  }),
};

export const ARENA_IDS = Object.keys(ARENAS);
export const DEFAULT_ARENA = ARENAS.stadium;

// Высота пола под точкой x: ищем самую нижнюю стену под центром (острова пропускаем).
export function floorAt(arena, x) {
  let y = arena.height + 4;
  while (y > arena.cy && arena.sdf(x, y) >= 0) y -= 0.02;
  return y;
}
