// Каркас обложки: контекст стиля, корешок, фактура, следы времени, раскладка текста.
import { H, W, dark, light, mix, n, pick, rand, int, type Rng } from './core.ts';
import { F, caps, cap, fit, height, txt, type Fit, type Font } from './text.ts';

// Контекст стиля.
export interface Ctx {
  title: string;
  author: string;
  r: Rng;
  v: number; // вариант стиля
  id: string; // приставка id внутри SVG
  s: number; // ширина полосы корешка (0 — её нет)
  L: number; // левый край места под текст
  R: number; // правый край
  cx: number; // середина места
  cw: number; // ширина места
}

export interface Art {
  svg: string;
  tex?: 'cloth' | 'leather' | 'grain' | 'none'; // фактура всей обложки
  spine?: 'cloth' | 'leather'; // материал полосы корешка, если она выпала
  sc?: string; // цвет полосы и уголков
  corners?: boolean; // уголки из того же материала
  frame?: string; // рамка по краю обложки этой краской (форму выбирает конвейер)
  age?: number; // насколько обложка может состариться, 0…1
  base?: string; // основной цвет — для потёртостей
}

export interface Style {
  id: string;
  name: string;
  variants: string[];
  w?: number; // как часто выпадает
  sp?: number; // доля обложек с полосой корешка (по умолчанию её нет)
  draw: (c: Ctx) => Art;
}

// ---------- Мелкие кирпичи SVG ----------

export const rect = (x: number, y: number, w: number, h: number, fill: string, extra = '') =>
  `<rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" fill="${fill}"${extra}/>`;
export const bg = (fill: string) => `<rect width="${W}" height="${H}" fill="${fill}"/>`;
export const circle = (x: number, y: number, r: number, fill: string, extra = '') => `<circle cx="${n(x)}" cy="${n(y)}" r="${n(r)}" fill="${fill}"${extra}/>`;
export const path = (d: string, fill: string, extra = '') => `<path d="${d}" fill="${fill}"${extra}/>`;
export const stroke = (d: string, color: string, sw: number, extra = '') => `<path d="${d}" fill="none" stroke="${color}" stroke-width="${n(sw)}"${extra}/>`;
export const frame = (x: number, y: number, w: number, h: number, color: string, sw: number, extra = '') =>
  `<rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" fill="none" stroke="${color}" stroke-width="${n(sw)}"${extra}/>`;
export const pattern = (id: string, w: number, h: number, body: string, extra = '') =>
  `<pattern id="${id}" width="${n(w)}" height="${n(h)}" patternUnits="userSpaceOnUse"${extra}>${body}</pattern>`;
export const g = (body: string, attrs: string) => `<g ${attrs}>${body}</g>`;
// Рисунок, обрезанный по контуру d.
export const clip = (id: string, d: string, body: string) => `<clipPath id="${id}"><path d="${d}"/></clipPath><g clip-path="url(#${id})">${body}</g>`;
// Обводка: краска и толщина.
export const sk = (c: string, w: number) => ` stroke="${c}" stroke-width="${n(w)}"`;
export const op = (o: number) => ` opacity="${Math.round(o * 100) / 100}"`;
// Градиент на всю обложку: от a к b по направлению (x2, y2).
export const grad = (id: string, a: string, b: string, x2 = 0, y2 = 1) =>
  `<linearGradient id="${id}" x2="${x2}" y2="${y2}"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>` + rect(0, 0, W, H, `url(#${id})`);

// ---------- Текст в коробке ----------

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}
export interface TextOpts {
  font: Font;
  max: number;
  min?: number;
  lines?: number;
  lh?: number;
  color: string;
  align?: 'start' | 'middle' | 'end';
  af?: Font; // шрифт автора
  as?: number; // его наибольший размер
  ac?: string; // его цвет
  at?: 'top' | 'center' | 'bottom' | 'split' | 'splitUp'; // split — название вверху, автор внизу; splitUp — наоборот
  authorFirst?: boolean;
  gap?: number;
  mid?: (y: number, x: number) => string; // украшение между названием и автором
  halo?: string; // обводка букв краской фона: текст читается поверх узора
}
export const AUTHOR = caps(F.narrow, 0.12);

// Название и автор в коробке; возвращает SVG и низ последней строки.
export function texts(c: Ctx, b: Box, o: TextOpts): string {
  const al = o.align ?? 'middle';
  const x = al === 'start' ? b.x : al === 'end' ? b.x + b.w : b.x + b.w / 2;
  const af = o.af ?? AUTHOR;
  let t = fit(c.title, o.font, { maxW: b.w, lines: o.lines ?? 4, max: o.max, min: o.min ?? 10, lh: o.lh });
  const a = c.author ? fit(c.author, af, { maxW: b.w, lines: 2, max: o.as ?? 10, min: 6.5, lh: 1.25 }) : null;
  const gap = o.gap ?? (t ? Math.max(8, t.size * 0.55) : 8);
  const at = o.at ?? 'center';
  const free = at === 'split' || at === 'splitUp' ? b.h - height(a) - gap : b.h - height(a) - (a ? gap : 0);
  // Слишком высокое название — меньше строк и кегль.
  for (let max = o.max; t && height(t) > free && max > (o.min ?? 10); max -= 2) t = fit(c.title, o.font, { maxW: b.w, lines: o.lines ?? 4, max, min: o.min ?? 10, lh: o.lh });
  const th = height(t);
  const ah = height(a);
  const ac = o.ac ?? o.color;
  const hl = (f: Fit | null) => (o.halo && f ? ` stroke="${o.halo}" stroke-width="${n(f.size * 0.22)}" stroke-linejoin="round" paint-order="stroke"` : '');
  const T = (y: number) => txt(t, x, y + cap(t), o.color, al, hl(t));
  const A = (y: number) => txt(a, x, y + cap(a), ac, al, hl(a) + (ac === o.color ? ' opacity=".85"' : ''));
  if (at === 'split') return T(b.y) + A(b.y + b.h - ah);
  if (at === 'splitUp') return A(b.y) + T(b.y + b.h - th);
  const first = o.authorFirst ? ah : th;
  const total = th + (a ? gap + ah : 0);
  const y0 = at === 'top' ? b.y : at === 'bottom' ? b.y + b.h - total : b.y + (b.h - total) / 2;
  const y1 = y0 + first + gap;
  const mid = a && o.mid ? o.mid(y0 + first + gap / 2, x) : '';
  return (o.authorFirst ? A(y0) + T(y1) : T(y0) + A(y1)) + mid;
}

// Заглавная буква названия — для буквиц и эмблем.
export const initial = (s: string) => (s.match(/[\p{L}\p{N}]/u)?.[0] ?? '?').toLocaleUpperCase('ru');

// ---------- Фактуры ----------

// Мелкие точки «зерна» — постоянная плитка, чтобы не плодить разные.
const GRAIN = (() => {
  let s = '';
  const pts = [
    [1, 2], [5, 1], [8, 6], [3, 8], [10, 3], [12, 10], [7, 11], [2, 13], [13, 5], [9, 14], [5, 5], [11, 7], [0, 9], [14, 12],
  ];
  pts.forEach(([x, y], i) => (s += `<rect x="${x}" y="${y}" width="1.2" height="1.2" fill="${i % 2 ? '#fff' : '#000'}" opacity="${i % 3 ? 0.35 : 0.5}"/>`));
  return s;
})();
const WEAVE = '<path d="M0 .5H2.5M.5 0V2.5" stroke="#fff" stroke-opacity=".06" stroke-width=".8"/><path d="M0 1.8H2.5M1.8 0V2.5" stroke="#000" stroke-opacity=".08" stroke-width=".8"/>';
const LEATHER =
  '<path d="M2 3c1-1 3 0 2 1s-3 0-2-1zM13 9c1-1 3 0 2 1s-3 0-2-1zM6 15c1-.5 2 .5 1 1s-2-.5-1-1zM17 2c.8-.5 1.6.4.8.9s-1.6-.4-.8-.9zM9 7c.6-.4 1.4.3.7.7s-1.4-.3-.7-.7zM19 17c.8-.5 1.6.4.8.9s-1.6-.4-.8-.9zM3 20c.6-.4 1.4.3.7.7s-1.4-.3-.7-.7z" fill="#000" opacity=".16"/><path d="M6 5h1.5M1 11h1M14 14h1.5M10 20h1" stroke="#fff" stroke-opacity=".09"/>';

export function texture(id: string, kind: string, w = W): string {
  if (kind === 'cloth') return pattern(id + 'tw', 2.5, 2.5, WEAVE) + rect(0, 0, w, H, `url(#${id}tw)`);
  if (kind === 'leather') return pattern(id + 'tl', 22, 22, LEATHER) + rect(0, 0, w, H, `url(#${id}tl)`);
  if (kind === 'grain') return pattern(id + 'tg', 15, 15, GRAIN) + rect(0, 0, W, H, `url(#${id}tg)`, op(0.18));
  return '';
}

// ---------- Сгиб у левого края и свет слева ----------

export const hinge = (s: number) => rect(0, 0, 1.2, H, '#000', op(0.25)) + rect(s + 6, 0, 2.4, H, '#000', op(0.1)) + rect(s + 8.4, 0, 1.6, H, '#fff', op(0.08));

// ---------- Оформление: наклейки, рамки, украшения углов, полоса корешка, уголки ----------

// Контур наклейки формы k: 0 прямоугольник, 1 срезанные углы, 2 вогнутые, 3 скруглённые, 4 овал, 5 ярлык.
export function lab(k: number, x: number, y: number, w: number, h: number): string {
  const q = Math.min(10, h / 4);
  const [X, Y, a, b, c, d, e, f] = [x + w, y + h, x + q, x + w - q, y + q, y + h - q, n(q), n(-q)];
  if (k === 1) return `M${n(a)} ${n(y)}H${n(b)}L${n(X)} ${n(c)}V${n(d)}L${n(b)} ${n(Y)}H${n(a)}L${n(x)} ${n(d)}V${n(c)}Z`;
  if (k === 2 || k === 3) {
    const arc = (dx: string, dy: string) => `a${e} ${e} 0 0 ${k - 2} ${dx} ${dy}`;
    return `M${n(a)} ${n(y)}H${n(b)}${arc(e, e)}V${n(d)}${arc(f, e)}H${n(a)}${arc(f, f)}V${n(c)}${arc(e, f)}Z`;
  }
  if (k === 4) return `M${n(x)} ${n(y + h / 2)}a${n(w / 2)} ${n(h / 2)} 0 1 0 ${n(w)} 0a${n(w / 2)} ${n(h / 2)} 0 1 0 ${n(-w)} 0Z`;
  if (k === 5) return `M${n(x)} ${n(y + h / 2)}L${n(a)} ${n(y)}H${n(b)}L${n(X)} ${n(y + h / 2)}L${n(b)} ${n(Y)}H${n(a)}Z`;
  return `M${n(x)} ${n(y)}H${n(X)}V${n(Y)}H${n(x)}Z`;
}
// Рамка вида k: 0 одна линия, 1 двойная, 2 толстая с тонкой, 3 с вогнутыми углами, 4 из точек, 5 скруглённая двойная.
export function box(k: number, x: number, y: number, w: number, h: number, col: string): string {
  const o = (f: number, i: number, sw: number, e = '') => path(lab(f, x + i, y + i, w - 2 * i, h - 2 * i), 'none', sk(col, sw) + e);
  return k === 0 ? o(0, 0, 1.4) : k === 1 ? o(0, 0, 1.6) + o(0, 5, 0.8) : k === 2 ? o(0, 0, 3) + o(0, 6, 0.8) : k === 3 ? o(2, 0, 1.4) + o(2, 5, 0.7) : k === 4 ? o(0, 0, 2, ' stroke-dasharray="0 4" stroke-linecap="round"') : o(3, 0, 1.4) + o(3, 5, 0.7);
}
// Украшения в углах рамки: 0 кольцо с точкой, 1 ромб, 2 квадрат, 3 точка, 4 ничего.
export function orns(k: number, x: number, y: number, w: number, h: number, col: string): string {
  let s = '';
  for (const [px, py] of [[x, y], [x + w, y], [x, y + h], [x + w, y + h]]) s += k === 0 ? circle(px, py, 4.5, 'none', sk(col, 1.6)) + circle(px, py, 1.6, col) : k === 1 ? path(`M${n(px)} ${n(py - 5)}l5 5-5 5-5-5z`, col) : k === 2 ? rect(px - 3.5, py - 3.5, 7, 7, col) : k === 3 ? circle(px, py, 3, col) : '';
  return s;
}

// Полоса корешка: материал переплёта немного заходит на крышку. Одна ширина — разные смотрятся случайно.
export const SPINE = 12;
const CK = 32; // катет уголка

// Рамка по краю, полоса корешка и уголки — поверх рисунка стиля.
export function dress(c: Ctx, a: Art): string {
  const { s, r, id } = c;
  const col = a.sc ?? dark(a.base ?? '#777777', 0.45);
  let out = a.frame ? box(int(r, 0, 5), s + 8, 10, W - s - 18, H - 20, a.frame) : '';
  if (s) out += rect(0, 0, s, H, col) + texture(id + 's', a.spine ?? 'cloth', s) + rect(s - 1, 0, 1, H, '#000', op(0.35)) + rect(s, 0, 1, H, '#fff', op(0.15));
  if (a.corners) out += path(`M${W} 0V${CK}L${W - CK} 0ZM${W} ${H}V${H - CK}L${W - CK} ${H}Z`, col) + stroke(`M${W - CK} 0L${W} ${CK}M${W - CK} ${H}L${W} ${H - CK}`, dark(col, 0.4), 1.2, op(0.6));
  return out;
}

// ---------- Следы времени ----------

export function wear(c: Ctx, a: number, base: string): string {
  if (a < 0.08) return '';
  const { r, id } = c;
  let out =
    rect(0, 0, W, H, '#c9a46a', op(0.16 * a)) +
    `<radialGradient id="${id}v" r=".72"><stop offset=".55" stop-color="#3a2410" stop-opacity="0"/><stop offset="1" stop-color="#3a2410" stop-opacity="${Math.round(a * 45) / 100}"/></radialGradient>` +
    rect(0, 0, W, H, `url(#${id}v)`);
  // Потёртые углы: из-под краски видно картон.
  const board = mix(light(base, 0.35), '#b8a58a', 0.5);
  const corners: [number, number, number, number][] = [
    [W, 0, -1, 1],
    [W, H, -1, -1],
    [0, 0, 1, 1],
    [0, H, 1, -1],
  ];
  for (const [x, y, dx, dy] of corners) {
    if (r() > a + 0.2) continue;
    const k = rand(r, 3, 4 + a * 7);
    out += path(`M${x} ${y}h${n(dx * k)}q${n(-dx * k * 0.2)} ${n(dy * k * 0.5)} ${n(-dx * k)} ${n(dy * k * rand(r, 0.8, 1.2))}Z`, board, op(0.75));
  }
  // Пятна и потёртые края.
  for (let i = int(r, 0, Math.round(a * 6)); i > 0; i--) out += circle(rand(r, 10, W - 10), rand(r, 10, H - 10), rand(r, 1.5, 5), '#7a4a1c', op(rand(r, 0.06, 0.18)));
  out += frame(0.8, 0.8, W - 1.6, H - 1.6, light(base, 0.5), 1.6, op(0.3 * a));
  return out;
}

// Краска-«золото» и бумага; часто нужны разным стилям.
export const GOLD = '#d6b46e';
export const PAPER = ['#f2ead8', '#efe6d0', '#f4efe4', '#ebe3d0', '#f1ece2'];
export const paper = (r: Rng) => pick(r, PAPER);
