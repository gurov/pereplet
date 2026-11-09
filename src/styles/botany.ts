// Ботаника: силуэты листьев и папоротника — как вырезки Матисса и гербарные листы.
// Несколько форм: простой лист, узкий (ива), лопастной (дуб), пальчатый (клён) и вайя папоротника.
import { H, W, dark, light, mix, n, on, pal, pick, rand, int, ramp, smooth, wadaColor, type Pt, type Rng } from '../core.ts';
import { F, caps } from '../text.ts';
import { AUTHOR, grad, lab, op, path, sk, stroke, texts, type Style } from '../cover.ts';

// Система координат листа: u — от основания к кончику (0…1), v — поперёк (в долях ширины).
type Uv = (u: number, v: number) => Pt;
const axes =
  (x: number, y: number, l: number, w: number, a: number): Uv =>
  (u, v) => [x + u * l * Math.cos(a) - v * w * Math.sin(a), y + u * l * Math.sin(a) + v * w * Math.cos(a)];
const xy = ([x, y]: Pt) => `${n(x)} ${n(y)}`;

// Простой лист из двух кривых: основание (x, y), длина l, полуширина w, угол a.
export function blade(x: number, y: number, l: number, w: number, a: number): string {
  const P = axes(x, y, l, w, a);
  return `M${xy(P(0, 0))}C${xy(P(0.25, 1.2))} ${xy(P(0.7, 1))} ${xy(P(1, 0))}C${xy(P(0.7, -1))} ${xy(P(0.25, -1.2))} ${xy(P(0, 0))}Z`;
}
// Жилки: средняя и k пар боковых.
function veins(x: number, y: number, l: number, w: number, a: number, k = 4): string {
  const P = axes(x, y, l, w, a);
  let d = `M${xy(P(-0.08, 0))}L${xy(P(0.9, 0))}`;
  for (let i = 1; i <= k; i++) {
    const u = (i / (k + 1)) * 0.8;
    d += `M${xy(P(u + 0.2, 0.6))}L${xy(P(u, 0))}L${xy(P(u + 0.2, -0.6))}`;
  }
  return d;
}
// Лист по полуширине hw(u): дуб — волна по краю.
function outline(x: number, y: number, l: number, w: number, a: number, hw: (u: number) => number, k = 24): string {
  const P = axes(x, y, l, w, a);
  const pts: Pt[] = [];
  for (let i = 0; i <= k; i++) pts.push(P(i / k, hw(i / k)));
  for (let i = k - 1; i > 0; i--) pts.push(P(i / k, -hw(i / k)));
  return smooth(pts);
}
// Пальчатый лист (клён): пять лопастей по кругу, нижние меньше.
function palmate(x: number, y: number, l: number, a: number): string {
  const pts: Pt[] = [];
  for (let i = 0; i < 40; i++) {
    const t = (i / 40) * 2 * Math.PI;
    const rr = l * 0.5 * (0.42 + 0.58 * Math.abs(Math.cos(2.5 * t)) ** 2) * (0.78 + 0.22 * Math.cos(t));
    pts.push([x + rr * Math.cos(t + a), y + rr * Math.sin(t + a)]);
  }
  return smooth(pts);
}

// Лист одной из форм; возвращает контур и жилки.
export function leaf(r: Rng, x: number, y: number, l: number, a: number, kind = int(r, 0, 3)): [string, string] {
  if (kind === 3) {
    const cx = x + l * 0.45 * Math.cos(a);
    const cy = y + l * 0.45 * Math.sin(a);
    let vv = `M${n(x)} ${n(y)}L${n(cx)} ${n(cy)}`;
    for (const q of [-1.26, -0.63, 0, 0.63, 1.26]) vv += `M${n(cx)} ${n(cy)}l${n(l * 0.4 * Math.cos(a + q))} ${n(l * 0.4 * Math.sin(a + q))}`;
    return [palmate(cx, cy, l, a), vv];
  }
  const w = l * (kind === 1 ? 0.13 : kind === 2 ? 0.3 : 0.32);
  const d = kind === 2 ? outline(x, y, l, w, a, (u) => Math.sin(Math.PI * u) ** 0.8 * (0.72 + 0.28 * Math.cos(u * 8 * Math.PI))) : blade(x, y, l, w, a);
  return [d, veins(x, y, l, w, a, kind === 1 ? 6 : 4)];
}

// Плитка обоев: два листа наискосок.
export const sprig = (s: number) => blade(s * 0.1, s * 0.55, s * 0.6, s * 0.17, -0.6) + blade(s * 0.55, s * 0.95, s * 0.45, s * 0.13, -1.9);

// Вайя папоротника: изогнутый стержень, перья по обе стороны, к кончику мельче.
export function fern(x: number, y: number, l: number, a: number, bend: number, k = 18): [string, string] {
  let d = '';
  const stem: Pt[] = [];
  let ang = a;
  for (let i = 0; i <= k; i++) {
    const t = i / k;
    stem.push([x, y]);
    const pl = l * 0.3 * (1 - t) ** 0.7 * Math.min(1, (t + 0.12) * 3.5);
    if (pl > 2) d += blade(x, y, pl, pl * 0.2, ang - 1.05) + blade(x, y, pl, pl * 0.2, ang + 1.05);
    x += (l / k) * Math.cos(ang);
    y += (l / k) * Math.sin(ang);
    ang += bend / k;
  }
  return [d, smooth(stem, false)];
}

// Зелень, мох, олива; вторая половина случаев — краска Вады.
const GREENS = pal('2f4a3a 3d5a40 5f7d4e 6b8f71 8a9a5b 3f5f5a 6a7a4a');

export const botany: Style = {
  id: 'botany',
  name: 'Ботаника',
  variants: ['Лист', 'Папоротник', 'Гербарий'],
  sp: 0.3,
  draw(c) {
    const { r, v, L, cx, cw, id } = c;
    const g0 = r() < 0.55 ? pick(r, GREENS) : wadaColor(r, 0.04, 0.3);
    // Тёмный фон и листья тон в тон или светлая бумага и полупрозрачные листья.
    const deep = r() < 0.45;
    const b = deep ? dark(g0, 0.5) : light(mix(g0, '#e8dcc0', 0.6), 0.45);
    const tones = deep ? ramp(dark(g0, 0.3), mix(g0, b, 0.1), 4) : ramp(g0, light(g0, 0.4), 4);
    const ink = deep ? light(mix(g0, '#f1ead8', 0.8), 0.4) : dark(g0, 0.55);
    const vein = deep ? dark(g0, 0.6) : light(g0, 0.6);
    const font = pick(r, [F.serif, F.old, F.didone, caps(F.antique, 0.1), caps(F.narrow, 0.06)]);
    const af = pick(r, [AUTHOR, caps(F.serif, 0.08)]);
    const mb = deep ? '' : ' style="mix-blend-mode:multiply"';
    const o = op(deep ? 1 : rand(r, 0.7, 0.92));
    const top = r() < 0.6;
    let tb = top ? { x: L, y: 22, w: cw, h: 86 } : { x: L, y: 204, w: cw, h: 80 };
    let art = grad(id + 'b', b, mix(b, g0, 0.12), rand(r, 0, 1), 1);
    let plate = '';
    if (v === 0) {
      // Один крупный лист от края к середине, видна только часть; жилки тонкой линией.
      const l = rand(r, 220, 360);
      const x0 = rand(r, -20, W + 20);
      const y0 = top ? H + 20 : -20;
      const [d, vv] = leaf(r, x0, y0, l, Math.atan2(rand(r, 120, 200) - y0, rand(r, 50, 150) - x0));
      art += path(d, tones[1], o + mb) + stroke(vv, vein, l * 0.008, op(0.5) + ' stroke-linecap="round"');
    } else if (v === 1) {
      // Одна–три вайи из нижнего угла, полупрозрачные, разного размера.
      const k = int(r, 1, 3);
      const fx = r() < 0.5 ? rand(r, -10, 40) : rand(r, 160, 210);
      for (let i = 0; i < k; i++) {
        const [d, st] = fern(fx + rand(r, -20, 20), H + 10, rand(r, 180, 320) / (1 + i * 0.3), -Math.PI / 2 + (fx < cx ? 1 : -1) * rand(r, 0.15, 0.6), (fx < cx ? 1 : -1) * rand(r, 0.3, 0.9));
        art += path(d, tones[i], o + mb) + stroke(st, tones[i], 1.6, o);
      }
      tb = { x: L, y: 22, w: cw, h: 86 };
    } else {
      // Гербарий: несколько листьев разных форм внахлёст, этикетка по центру сверху.
      for (let i = 0; i < int(r, 3, 5); i++) {
        const [d, vv] = leaf(r, rand(r, 10, W - 10), rand(r, 150, 280), rand(r, 60, 130), rand(r, -2.8, -0.4));
        art += path(d, tones[i % 4], o + mb) + stroke(vv, vein, 1, op(0.45));
      }
      const pw = Math.min(cw - 16, 150);
      const k = pick(r, [0, 1, 3]);
      plate = path(lab(k, cx - pw / 2, 24, pw, 92), '#f6f1e6') + path(lab(k, cx - pw / 2 + 4, 28, pw - 8, 84), 'none', sk(dark(g0, 0.3), 0.8));
      tb = { x: cx - pw / 2 + 12, y: 36, w: pw - 24, h: 68 };
    }
    return {
      svg: art + plate + texts(c, tb, v > 1 ? { font, max: 18, lines: 3, color: '#2a2622', af, as: 8, ac: dark(g0, 0.2) } : { font, max: 22, lines: 3, color: ink, af, as: 9, ac: on(b, dark(g0, 0.2), light(g0, 0.6)), halo: b }),
      tex: 'grain',
      // Переплёт тканью или кожей; у листа и папоротника иногда рамка по краю.
      spine: r() < 0.5 ? 'cloth' : 'leather',
      sc: dark(g0, deep ? 0.65 : 0.35),
      corners: r() < 0.3,
      frame: v < 2 && r() < 0.45 ? mix(ink, b, 0.35) : undefined,
      age: 0.5,
      base: b,
    };
  },
};
