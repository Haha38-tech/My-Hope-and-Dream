import { rasterize } from './pixelart.js';
import { BLUE, NAVY } from '../game/cars.js';

const TIRE = { hi: '#4b4b5c', light: '#31313d', base: '#202029', dark: '#121218' };
const SIDEWALL = { base: '#34343f' };
const CHROME = { base: '#c9cfdf' };
const DOT = { base: '#ffffff' };
const VISOR = { hi: '#9d92ff', light: '#3b3c8f', base: '#1b1e4d', dark: '#0f1131' };
const SHINE = { base: '#d6caff' };

// Колесо: чёрная шина, тёмная боковина, синий диск с болтами (видно вращение).
function wheelParts(r, tread) {
  const parts = [{ circle: [0, 0], r, ramp: TIRE }];
  if (tread) {
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      parts.push({ circle: [Math.cos(a) * r * 0.96, Math.sin(a) * r * 0.96], r: r * 0.13, ramp: TIRE, flat: true });
    }
  }
  parts.push(
    { circle: [0, 0], r: r * 0.74, ramp: SIDEWALL, flat: true, mask: true },
    { circle: [0, 0], r: r * 0.52, ramp: BLUE },
    { circle: [0, 0], r: r * 0.2, ramp: NAVY, flat: true, mask: true },
    { circle: [0, 0], r: r * 0.08, ramp: DOT, flat: true, mask: true },
  );
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + 0.4;
    parts.push({ circle: [Math.cos(a) * r * 0.36, Math.sin(a) * r * 0.36], r: r * 0.07, ramp: CHROME, flat: true, mask: true });
  }
  return parts;
}

// Голова — синий шлем с тёмным визором и бликом.
function headParts(r) {
  return [
    { circle: [0, 0], r, ramp: BLUE },
    { poly: [[0.08 * r, -0.4 * r], [1.1 * r, -0.4 * r], [1.1 * r, 0.32 * r], [0.24 * r, 0.32 * r]], ramp: VISOR, mask: true },
    { poly: [[0.52 * r, -0.3 * r], [0.84 * r, -0.3 * r], [0.84 * r, -0.14 * r], [0.52 * r, -0.14 * r]], ramp: SHINE, flat: true, mask: true },
    { circle: [-0.38 * r, -0.52 * r], r: 0.15 * r, ramp: DOT, flat: true, mask: true },
  ];
}

const cache = new Map();

// Спрайты рисуются для машины масштаба 1 и уменьшаются при отрисовке.
export function buildCarSprites(id, def) {
  if (!cache.has(id)) {
    cache.set(id, {
      body: rasterize(def.art.body),
      wheels: def.wheels.map((w) => rasterize(wheelParts(w.r, def.art.tread))),
      head: rasterize(headParts(def.head.r)),
    });
  }
  return cache.get(id);
}
