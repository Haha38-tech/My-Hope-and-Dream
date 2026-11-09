import { rasterize } from './pixelart.js';

const TIRE = { light: '#4a4458', base: '#2c2836', dark: '#1d1a25' };
const RIM = { light: '#e2e6f2', base: '#a7aec6', dark: '#666e8c' };
const HUB = { base: '#3d4462' };
const SKIN = { light: '#ffd9b3', base: '#f0b183', dark: '#c27c56' };
const BANDANA = { light: '#7fe0ff', base: '#2d9be0', dark: '#1a5fa8' };
const SHADES = { light: '#5d5a78', base: '#16131f', dark: '#16131f' };
const SHINE = { base: '#ffffff' };
const MOUTH = { base: '#7a2b2b' };

function wheelParts(r) {
  const bolts = [0, 1, 2].map((i) => {
    const a = (i / 3) * Math.PI * 2;
    return { circle: [Math.cos(a) * r * 0.32, Math.sin(a) * r * 0.32], r: r * 0.12, ramp: HUB, flat: true, mask: true };
  });
  return [
    { circle: [0, 0], r, ramp: TIRE },
    { circle: [0, 0], r: r * 0.58, ramp: RIM },
    ...bolts,
  ];
}

function headParts(r) {
  return [
    // Хвостики банданы сзади.
    { poly: [[-0.75 * r, -0.45 * r], [-1.6 * r, -0.2 * r], [-1.45 * r, 0.15 * r], [-0.85 * r, -0.05 * r]], ramp: BANDANA },
    { circle: [0, 0], r, ramp: SKIN },
    { poly: [[-r, -r], [r, -r], [r, -0.2 * r], [-r, -0.05 * r]], ramp: BANDANA, mask: true },
    { poly: [[0.05 * r, 0.02 * r], [r, 0.02 * r], [r, 0.32 * r], [0.12 * r, 0.32 * r]], ramp: SHADES, mask: true },
    { poly: [[0.62 * r, 0.06 * r], [0.78 * r, 0.06 * r], [0.78 * r, 0.16 * r], [0.62 * r, 0.16 * r]], ramp: SHINE, flat: true, mask: true },
    { poly: [[0.38 * r, 0.56 * r], [0.85 * r, 0.5 * r], [0.85 * r, 0.62 * r], [0.42 * r, 0.66 * r]], ramp: MOUTH, flat: true, mask: true },
  ];
}

// Собирает спрайты для описания машины из cars.js.
export function buildCarSprites(def) {
  return {
    body: rasterize(def.art.body),
    wheels: def.wheels.map((w) => rasterize(wheelParts(w.r))),
    head: rasterize(headParts(def.head.r)),
  };
}
