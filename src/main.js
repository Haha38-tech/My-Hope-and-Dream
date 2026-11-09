import '@fontsource/press-start-2p/400.css';
import './style.css';
import { createGame, STEP } from './game/game.js';
import { buildCarSprites } from './gfx/sprites.js';
import { renderArenaTexture } from './gfx/arenaArt.js';
import { drawCar, drawDebug } from './gfx/render.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const banner = document.getElementById('banner');

const game = createGame();
const arena = game.arena;
const sprites = buildCarSprites(game.car.def);
const arenaTex = renderArenaTexture(arena, { x0: -10, y0: -6, x1: arena.width + 10, y1: arena.height + 6 });

// --- Управление: A — назад, D — вперёд (по коду клавиши, работает и в русской раскладке).
const keys = new Set();
let debug = new URLSearchParams(location.search).has('debug');
addEventListener('keydown', (e) => {
  keys.add(e.code);
  if (e.code === 'KeyR') respawn();
  if (e.code === 'KeyB') debug = !debug;
});
addEventListener('keyup', (e) => keys.delete(e.code));
addEventListener('blur', () => keys.clear());

// Тач: левая половина экрана — назад, правая — вперёд.
const touches = new Map();
canvas.addEventListener('pointerdown', (e) => {
  canvas.setPointerCapture(e.pointerId);
  touches.set(e.pointerId, e.clientX < innerWidth / 2 ? -1 : 1);
});
for (const ev of ['pointerup', 'pointercancel']) canvas.addEventListener(ev, (e) => touches.delete(e.pointerId));

function readInput() {
  let v = 0;
  if (keys.has('KeyD') || keys.has('ArrowRight')) v += 1;
  if (keys.has('KeyA') || keys.has('ArrowLeft')) v -= 1;
  for (const t of touches.values()) v += t;
  return Math.sign(v);
}

// --- Удар головой: вспышка, тряска, перезапуск.
let respawnAt = 0;
let shake = 0;
const particles = [];

function respawn() {
  game.spawn();
  respawnAt = 0;
  banner.classList.remove('show');
}

function onHeadHit(at) {
  shake = 0.35;
  respawnAt = game.time + 1.4;
  banner.classList.remove('show');
  void banner.offsetWidth; // перезапуск CSS-анимации
  banner.classList.add('show');
  const colors = ['#fff6b8', '#ffd23f', '#ffffff', '#ff8f5e'];
  for (let i = 0; i < 18; i++) {
    const a = Math.random() * Math.PI * 2;
    const s = 3 + Math.random() * 5;
    particles.push({ x: at.x, y: at.y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 3, life: 0.6 + Math.random() * 0.4, c: colors[i % colors.length] });
  }
}

// --- Цикл с фиксированным шагом физики.
let acc = 0;
let last = performance.now();
function frame(now) {
  const dt = Math.min(0.1, (now - last) / 1000);
  last = now;
  acc += dt;
  while (acc >= STEP) {
    game.step(respawnAt ? 0 : readInput());
    for (const ev of game.events.splice(0)) if (ev.type === 'headHit' && !respawnAt) onHeadHit(ev.at);
    if (respawnAt && game.time >= respawnAt) respawn();
    acc -= STEP;
  }
  for (const p of particles) { p.vy += 20 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt; }
  for (let i = particles.length - 1; i >= 0; i--) if (particles[i].life <= 0) particles.splice(i, 1);
  shake = Math.max(0, shake - dt);
  render();
  requestAnimationFrame(frame);
}

function render() {
  const dpr = devicePixelRatio || 1;
  const w = Math.round(innerWidth * dpr);
  const h = Math.round(innerHeight * dpr);
  if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
  ctx.imageSmoothingEnabled = false;

  // Вся арена целиком в кадре, как в оригинальном жанре.
  const ppm = Math.min(w / arena.width, h / arena.height);
  const sx = (Math.random() - 0.5) * shake * 0.6;
  const sy = (Math.random() - 0.5) * shake * 0.6;
  ctx.setTransform(ppm, 0, 0, ppm, w / 2 - (arena.width / 2 - sx) * ppm, h / 2 - (arena.height / 2 - sy) * ppm);
  ctx.fillStyle = '#0b0a10';
  ctx.fillRect(-50, -50, arena.width + 100, arena.height + 100);
  ctx.drawImage(arenaTex.canvas, arenaTex.x0, arenaTex.y0, arenaTex.x1 - arenaTex.x0, arenaTex.y1 - arenaTex.y0);

  drawCar(ctx, game.car, sprites);
  for (const p of particles) {
    ctx.fillStyle = p.c;
    ctx.globalAlpha = Math.min(1, p.life * 2);
    ctx.fillRect(p.x - 0.06, p.y - 0.06, 0.12, 0.12);
  }
  ctx.globalAlpha = 1;
  if (debug) drawDebug(ctx, game.world);
}

window.__game = game; // для отладки из консоли
requestAnimationFrame(frame);
