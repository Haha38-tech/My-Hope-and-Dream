import { ART_PPM } from './pixelart.js';

// Хэш для детерминированного шума.
function hash(x, y, s = 0) {
  let h = (x * 374761393 + y * 668265263 + s * 2147483647) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

const mix = (a, b, t) => a + (b - a) * t;

// Рисует стены арены (каменная кладка с подсветкой у кромки) в пикселях арта.
// Покрывает прямоугольник world [x0, y0]–[x1, y1], чтобы стены уходили за края экрана.
export function renderArenaTexture(arena, { x0, y0, x1, y1 }, ppm = ART_PPM) {
  const w = Math.ceil((x1 - x0) * ppm);
  const h = Math.ceil((y1 - y0) * ppm);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  const img = ctx.createImageData(w, h);
  const cell = Math.max(3, Math.round(0.42 * ppm)); // размер «булыжника»

  for (let py = 0; py < h; py++) {
    for (let px = 0; px < w; px++) {
      const wx = x0 + (px + 0.5) / ppm;
      const wy = y0 + (py + 0.5) / ppm;
      const d = arena.sdf(wx, wy) * ppm; // в пикселях
      let r, g, b;

      if (d < 0) {
        // Тёмный фон внутри арены, чуть светлее к центру.
        const v = Math.min(1, -d / 60);
        const glow = Math.max(0, 1 - Math.hypot((wx - arena.cx) / 8, (wy - arena.cy) / 4) * 0.9);
        r = mix(10, 22, glow * v); g = mix(9, 18, glow * v); b = mix(16, 32, glow * v);
        if (d > -Math.max(1, ppm / 12)) { r = 6; g = 5; b = 9; }
      } else {
        // Ячейки Вороного — камни кладки.
        const gx = Math.floor(px / cell), gy = Math.floor(py / cell);
        let d1 = 1e9, d2 = 1e9, id = 0;
        for (let j = -1; j <= 1; j++) {
          for (let i = -1; i <= 1; i++) {
            const cx = (gx + i + 0.15 + hash(gx + i, gy + j, 1) * 0.7) * cell;
            const cy = (gy + j + 0.15 + hash(gx + i, gy + j, 2) * 0.7) * cell;
            const dd = Math.hypot(px - cx, py - cy);
            if (dd < d1) { d2 = d1; d1 = dd; id = hash(gx + i, gy + j, 3); }
            else if (dd < d2) d2 = dd;
          }
        }
        const mortar = d2 - d1 < Math.max(0.8, cell * 0.12);

        // Свет из арены: сильнее снизу (пол), мягко затухает вглубь стены.
        const below = Math.max(0, Math.min(1, (wy - arena.cy) / 4));
        const glow = Math.exp(-d / (0.75 * ppm)) * (0.35 + 0.65 * below);
        const depth = Math.min(1, d / (3.8 * ppm));
        let base = [mix(62, 30, depth), mix(52, 25, depth), mix(82, 44, depth)];
        const tint = 0.9 + id * 0.2;
        base = base.map((c) => c * tint);
        const warm = [236, 204, 170];
        r = mix(base[0], warm[0], glow * 0.75);
        g = mix(base[1], warm[1], glow * 0.75);
        b = mix(base[2], warm[2], glow * 0.75);
        if (mortar) { r *= 0.72; g *= 0.7; b *= 0.78; }
        // Яркая кромка.
        if (d < Math.max(1, ppm / 15)) { r = 250; g = 238; b = 222; }
        else if (d < Math.max(1.6, ppm / 8.5)) { r = mix(r, 200, 0.6); g = mix(g, 176, 0.6); b = mix(b, 160, 0.6); }
      }

      const k = (py * w + px) * 4;
      img.data[k] = r; img.data[k + 1] = g; img.data[k + 2] = b; img.data[k + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return { canvas, x0, y0, x1, y1 };
}
