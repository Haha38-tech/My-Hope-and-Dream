import { ARENAS, ARENA_IDS } from './game/arena.js';
import { CARS, CAR_IDS, MIN_SCALE, MAX_SCALE } from './game/cars.js';
import { buildCarSprites } from './gfx/sprites.js';
import { renderArenaTexture } from './gfx/arenaArt.js';
import { ART_PPM } from './gfx/pixelart.js';

// Машина «в покое» для превью: спрайты на своих местах описания.
function drawCarPreview(canvas, id) {
  const def = CARS[id];
  const sp = buildCarSprites(id, def);
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  const s = 2; // пикселей экрана на пиксель арта
  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height * 0.6);
  ctx.scale(s, s);
  const put = (spr, x, y) => ctx.drawImage(spr.canvas, Math.round(x * ART_PPM - spr.ox), Math.round(y * ART_PPM - spr.oy));
  put(sp.head, def.head.x, def.head.y);
  put(sp.body, 0, 0);
  def.wheels.forEach((w, i) => put(sp.wheels[i], w.x, w.y));
  ctx.restore();
}

function card(label, sub, canvas, onClick) {
  const b = document.createElement('button');
  b.className = 'card';
  b.type = 'button';
  b.append(canvas);
  const t = document.createElement('span');
  t.className = 'card-title';
  t.textContent = label;
  b.append(t);
  if (sub) {
    const d = document.createElement('span');
    d.className = 'card-sub';
    d.textContent = sub;
    b.append(d);
  }
  b.addEventListener('click', onClick);
  return b;
}

/** Редактор (клавиша E): арена, машина, размер машины (только уменьшение). */
export function createEditor(root, { getConfig, onChange, onToggle }) {
  root.innerHTML = `
    <div class="panel" role="dialog" aria-label="Редактор">
      <div class="panel-head"><span>РЕДАКТОР</span><button class="round close" type="button" aria-label="Закрыть">✕</button></div>
      <div class="section-title">АРЕНА</div>
      <div class="cards arenas"></div>
      <div class="section-title">МАШИНА</div>
      <div class="cards cars"></div>
      <div class="section-title">РАЗМЕР МАШИНЫ <span class="size-value"></span></div>
      <div class="size-row">
        <button class="round minus" type="button" aria-label="Меньше">−</button>
        <input class="size" type="range" min="${MIN_SCALE * 100}" max="${MAX_SCALE * 100}" step="5" />
        <button class="round plus" type="button" aria-label="Больше">+</button>
      </div>
      <button class="play" type="button">▶ ИГРАТЬ</button>
      <div class="panel-hint">E / Esc — закрыть</div>
    </div>`;
  const $ = (s) => root.querySelector(s);
  const arenaCards = ARENA_IDS.map((id) => {
    const a = ARENAS[id];
    const tex = renderArenaTexture(a, { x0: 0, y0: 0, x1: a.width, y1: a.height }, 9);
    tex.canvas.className = 'thumb';
    return card(a.name, '', tex.canvas, () => onChange({ arenaId: id }));
  });
  const carCards = CAR_IDS.map((id) => {
    const c = document.createElement('canvas');
    c.width = 150; c.height = 84; c.className = 'thumb';
    drawCarPreview(c, id);
    return card(CARS[id].name, CARS[id].blurb, c, () => onChange({ carId: id }));
  });
  $('.arenas').append(...arenaCards);
  $('.cars').append(...carCards);

  const size = $('.size');
  const setScale = (v) => onChange({ scale: Math.min(MAX_SCALE, Math.max(MIN_SCALE, v)) });
  size.addEventListener('input', () => setScale(size.value / 100));
  $('.minus').addEventListener('click', () => setScale(getConfig().scale - 0.05));
  $('.plus').addEventListener('click', () => setScale(getConfig().scale + 0.05));
  $('.close').addEventListener('click', () => editor.toggle(false));
  $('.play').addEventListener('click', () => editor.toggle(false));

  const editor = {
    open: false,
    refresh() {
      const cfg = getConfig();
      ARENA_IDS.forEach((id, i) => arenaCards[i].classList.toggle('selected', id === cfg.arenaId));
      CAR_IDS.forEach((id, i) => carCards[i].classList.toggle('selected', id === cfg.carId));
      size.value = Math.round(cfg.scale * 100);
      $('.size-value').textContent = `${Math.round(cfg.scale * 100)}%`;
    },
    toggle(force) {
      editor.open = force ?? !editor.open;
      root.classList.toggle('open', editor.open);
      if (editor.open) editor.refresh();
      onToggle(editor.open);
    },
  };
  return editor;
}
