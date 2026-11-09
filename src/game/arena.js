// Арена: скруглённый прямоугольник («капсула»). Координаты в метрах, ось Y вниз.
export const ARENA = {
  width: 18,
  height: 10.125,
  cx: 9,
  cy: 5.15,
  hw: 8.1,
  hh: 3.95,
  radius: 2.7,
};

export const floorY = (a = ARENA) => a.cy + a.hh;

// Расстояние до границы: < 0 внутри арены, > 0 в стене.
export function arenaSdf(a, x, y) {
  const qx = Math.abs(x - a.cx) - a.hw + a.radius;
  const qy = Math.abs(y - a.cy) - a.hh + a.radius;
  const ox = Math.max(qx, 0);
  const oy = Math.max(qy, 0);
  return Math.hypot(ox, oy) + Math.min(Math.max(qx, qy), 0) - a.radius;
}

export function arenaOutline(a = ARENA, segments = 12) {
  const r = a.radius;
  const corners = [
    [a.cx + a.hw - r, a.cy + a.hh - r, 0],
    [a.cx - a.hw + r, a.cy + a.hh - r, 0.5 * Math.PI],
    [a.cx - a.hw + r, a.cy - a.hh + r, Math.PI],
    [a.cx + a.hw - r, a.cy - a.hh + r, 1.5 * Math.PI],
  ];
  const pts = [];
  for (const [cx, cy, a0] of corners) {
    for (let i = 0; i <= segments; i++) {
      const t = a0 + (i / segments) * 0.5 * Math.PI;
      pts.push([cx + r * Math.cos(t), cy + r * Math.sin(t)]);
    }
  }
  return pts;
}
