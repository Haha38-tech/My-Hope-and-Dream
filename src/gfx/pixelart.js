// Мини-движок пиксель-арта: растеризует фигуры (в метрах) в маленький canvas,
// добавляет блики сверху, тени снизу и тёмный контур — как у спрайтов в стиле аркад.
export const ART_PPM = 24; // пикселей арта на метр

const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));

function inside(p, x, y) {
  if (p.circle) return (x - p.circle[0]) ** 2 + (y - p.circle[1]) ** 2 <= p.r * p.r;
  let hit = false;
  const pts = p.poly;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i];
    const [xj, yj] = pts[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) hit = !hit;
  }
  return hit;
}

function bounds(p) {
  if (p.circle) return [p.circle[0] - p.r, p.circle[1] - p.r, p.circle[0] + p.r, p.circle[1] + p.r];
  const xs = p.poly.map((q) => q[0]);
  const ys = p.poly.map((q) => q[1]);
  return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
}

/**
 * parts: [{ poly | circle+r, ramp: {light, base, dark}, flat?, mask? }]
 * mask — красить только поверх уже закрашенного; flat — без бликов/теней.
 * Возвращает { canvas, ox, oy }: (ox, oy) — пиксель, где находится точка (0, 0).
 */
export function rasterize(parts, { ppm = ART_PPM, pad = 2, outline = '#0c0b10' } = {}) {
  let [x0, y0, x1, y1] = [Infinity, Infinity, -Infinity, -Infinity];
  for (const p of parts) {
    const b = bounds(p);
    x0 = Math.min(x0, b[0]); y0 = Math.min(y0, b[1]);
    x1 = Math.max(x1, b[2]); y1 = Math.max(y1, b[3]);
  }
  const minX = Math.floor(x0 * ppm) - pad;
  const minY = Math.floor(y0 * ppm) - pad;
  const w = Math.ceil(x1 * ppm) + pad - minX;
  const h = Math.ceil(y1 * ppm) + pad - minY;
  const idx = new Int16Array(w * h).fill(-1);

  parts.forEach((p, i) => {
    const b = bounds(p);
    const px0 = Math.max(0, Math.floor(b[0] * ppm) - minX);
    const py0 = Math.max(0, Math.floor(b[1] * ppm) - minY);
    const px1 = Math.min(w, Math.ceil(b[2] * ppm) - minX + 1);
    const py1 = Math.min(h, Math.ceil(b[3] * ppm) - minY + 1);
    for (let y = py0; y < py1; y++) {
      for (let x = px0; x < px1; x++) {
        const k = y * w + x;
        if (p.mask && idx[k] < 0) continue;
        if (inside(p, (x + 0.5 + minX) / ppm, (y + 0.5 + minY) / ppm)) idx[k] = i;
      }
    }
  });

  const ramps = parts.map((p) => ({
    hi: hex(p.ramp.hi ?? p.ramp.light ?? p.ramp.base),
    light: hex(p.ramp.light ?? p.ramp.base),
    base: hex(p.ramp.base),
    dark: hex(p.ramp.dark ?? p.ramp.base),
  }));
  const line = hex(outline);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  const img = ctx.createImageData(w, h);
  const put = (k, [r, g, b]) => {
    img.data[k * 4] = r; img.data[k * 4 + 1] = g; img.data[k * 4 + 2] = b; img.data[k * 4 + 3] = 255;
  };

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const k = y * w + x;
      const i = idx[k];
      if (i >= 0) {
        const above = y > 0 ? idx[k - w] : -1;
        const below = y < h - 1 ? idx[k + w] : -1;
        const r = ramps[i];
        // Сверху — светлый блик в 1 пиксель, снизу — тень.
        put(k, parts[i].flat ? r.base : above !== i ? r.hi : below !== i ? r.dark : r.base);
      } else {
        const near = (x > 0 && idx[k - 1] >= 0) || (x < w - 1 && idx[k + 1] >= 0)
          || (y > 0 && idx[k - w] >= 0) || (y < h - 1 && idx[k + w] >= 0);
        if (near) put(k, line);
      }
    }
  }
  ctx.putImageData(img, 0, 0);
  return { canvas, ox: -minX, oy: -minY, ppm };
}
