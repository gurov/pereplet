// Общее: случайные числа от строки, цвета, числа в SVG.
import { WADA, WADA_HEX } from './wada.ts';

export const W = 200;
export const H = 300;

export type Rng = () => number;

export function hash(key: string): number {
  let h = 0x811c9dc5;
  for (const ch of key) {
    h ^= ch.codePointAt(0)!;
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export function rng(seed: number): Rng {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const pick = <T>(r: Rng, list: readonly T[]): T => list[Math.floor(r() * list.length)];
export const rand = (r: Rng, a: number, b: number) => a + r() * (b - a);
export const int = (r: Rng, a: number, b: number) => Math.floor(rand(r, a, b + 1));
export function weighted<T>(r: Rng, list: readonly T[], w: (t: T) => number): T {
  let x = r() * list.reduce((s, t) => s + w(t), 0);
  for (const t of list) if ((x -= w(t)) < 0) return t;
  return list[list.length - 1];
}
export function shuffle<T>(r: Rng, list: readonly T[]): T[] {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);

// Число для SVG: одна цифра после точки, без хвостовых нулей.
export const n = (x: number) => String(Math.round(x * 10) / 10);
export const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export type Pt = [number, number];
// Ломаная: «M x y x y …» (после M пары — это L).
export const poly = (p: Pt[], close = true) => 'M' + p.map(([x, y]) => n(x) + ' ' + n(y)).join(' ') + (close ? 'Z' : '');
// Гладкая кривая через точки (Catmull-Rom → кубические Безье).
export function smooth(p: Pt[], close = true): string {
  const m = p.length;
  const at = (i: number) => (close ? p[(i + m) % m] : p[Math.max(0, Math.min(m - 1, i))]);
  let d = `M${n(p[0][0])} ${n(p[0][1])}`;
  for (let i = 0; i < (close ? m : m - 1); i++) {
    const [a, b, c, e] = [at(i - 1), at(i), at(i + 1), at(i + 2)];
    d += `C${n(b[0] + (c[0] - a[0]) / 6)} ${n(b[1] + (c[1] - a[1]) / 6)} ${n(c[0] - (e[0] - b[0]) / 6)} ${n(c[1] - (e[1] - b[1]) / 6)} ${n(c[0])} ${n(c[1])}`;
  }
  return d + (close ? 'Z' : '');
}

// ---------- Цвета: всё в #rrggbb, чтобы смешивать ----------

export const rgb = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
const hex2 = (v: number) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0');
export const mix = (a: string, b: string, t: number) => {
  const x = rgb(a);
  const y = rgb(b);
  return '#' + x.map((v, i) => hex2(v + (y[i] - v) * t)).join('');
};
export const dark = (c: string, t: number) => mix(c, '#000000', t);
export const light = (c: string, t: number) => mix(c, '#ffffff', t);
export function hsl(h: number, s: number, l: number): string {
  h = ((h % 360) + 360) % 360;
  s /= 100;
  l /= 100;
  const k = (m: number) => (m + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (m: number) => 255 * (l - a * Math.max(-1, Math.min(k(m) - 3, 9 - k(m), 1)));
  return '#' + [f(0), f(8), f(4)].map(hex2).join('');
}
export function lum(c: string): number {
  const [r, g, b] = rgb(c).map((v) => {
    v /= 255;
    return v <= 0.04 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
// Краска для текста поверх фона: тёмная или светлая из двух.
export const on = (bg: string, d = '#1d1b19', l = '#fbf7ee') => (lum(bg) > 0.3 ? d : l);

// ---------- Вада Сандзо, «A Dictionary of Color Combinations» ----------

const wcol = (code: number) => {
  const i = code - (code > 92 ? 41 : 40);
  return '#' + WADA_HEX.slice(i * 6, i * 6 + 6);
};
// Сочетание из k цветов: одно из 120 (по два, по три) или 108 (по четыре).
export function wada(r: Rng, k: 2 | 3 | 4 = 3): string[] {
  const i = Math.floor(r() * (k > 3 ? 108 : 120));
  const s = k === 2 ? i * 2 : k === 3 ? 240 + i * 3 : 600 + i * 4;
  return [...WADA.slice(s, s + k)].map((c) => wcol(c.charCodeAt(0)));
}
// Один цвет справочника со светлотой (lum) в границах.
export function wadaColor(r: Rng, lo = 0, hi = 1): string {
  let c = '';
  for (let t = 0; t < 40; t++) {
    c = '#' + WADA_HEX.substr(Math.floor(r() * 159) * 6, 6);
    if (lum(c) >= lo && lum(c) <= hi) break;
  }
  return c;
}
// От тёмного к светлому.
export const byLum = (cs: string[]) => [...cs].sort((a, b) => lum(a) - lum(b));
// Плавная растяжка: k красок от a к b.
export const ramp = (a: string, b: string, k: number) => Array.from({ length: k }, (_, i) => mix(a, b, i / (k - 1 || 1)));
// Близкие оттенки: краска Вады от тёмной к светлой, иногда с уходом в соседнюю краску сочетания.
export function shades(r: Rng, k: number, lo = 0.45, hi = 0.5): string[] {
  const [a, b] = wada(r, 2);
  return ramp(dark(a, lo), light(mix(a, b, rand(r, 0, 0.6)), hi), k);
}
// Палитра от тёмной краски к светлой: контрастное сочетание Вады или близкие оттенки.
export const palette = (r: Rng, k: 2 | 3 | 4, p = 0.5) => (r() < p ? shades(r, k) : byLum(wada(r, k)));
// Краски, заметные на фоне; не хватает — добавляется тёмная или светлая.
export const seen = (cs: string[], bg: string, k = 3) => [...cs.filter((x) => Math.abs(lum(x) - lum(bg)) > 0.12), on(bg), on(bg), on(bg)].slice(0, k);

// Палитра: строка «#aaa #bbb …» → массив; так короче в коде.
export const pal = (s: string) => s.split(' ').map((c) => '#' + c);
