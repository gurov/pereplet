// Графика XX века: авангард, Баухаус, швейцарский стиль, Мемфис, оп-арт, скандинавский минимализм.
import { H, W, dark, n, on, pal, pick, poly, rand, int, smooth, shuffle, type Pt, type Rng } from '../core.ts';
import { F, caps, fit, txt, measure } from '../text.ts';
import { AUTHOR, bg, circle, clip, frame, g, initial, path, pattern, rect, stroke, texts, type Style } from '../cover.ts';

const PAPERS = ['#ece2cc', '#efe6d2', '#e8dcc0', '#f0e9da'];

// ============ Авангард 1920-х ============

export const avant: Style = {
  id: 'avant',
  name: 'Авангард',
  variants: ['Клин', 'Диагональ', 'Лестница', 'Круг'],
  draw(c) {
    const { r, v, L, R, cx, cw } = c;
    const p = pick(r, PAPERS);
    const red = pick(r, ['#c8302c', '#b8322a', '#d0412e', '#c43d2f']);
    const k = '#1d1b1a';
    const extra = pick(r, ['#2a4d7a', '#d8a334', '#7a7a72', red]);
    const font = pick(r, [caps(F.narrow, 0.02), F.heavy, F.slav]);
    const flip = r() < 0.5;
    let svg: string;
    if (v === 0) {
      // Клин врезается в круг.
      const cy = rand(r, 90, 125);
      const rad = rand(r, 40, 58);
      const ccx = rand(r, cx + 10, R - 14);
      const [a, b] = flip ? [red, k] : [k, red];
      svg =
        bg(p) +
        circle(ccx, cy, rad, a) +
        path(`M${n(L - 30)} ${n(cy + rand(r, 50, 110))}L${n(ccx + rad * 0.3)} ${n(cy - 3)}L${n(ccx + rad * 0.15)} ${n(cy + 16)}Z`, b) +
        rect(L - 8, cy + rad + 18, rand(r, 50, 110), 7, extra) +
        rect(R - 40, 22, 8, 36, k) +
        texts(c, { x: L, y: 212, w: cw, h: 74 }, { font, max: 26, lines: 3, color: k, align: 'start', ac: red, as: 10, authorFirst: true, gap: 8 });
    } else if (v === 1) {
      // Диагональ: широкая полоса наискосок, название по ней.
      const ang = -rand(r, 18, 34);
      const band = rand(r, 54, 70);
      const t = fit(c.title, font, { maxW: 176, lines: 2, max: 30, min: 11, lh: 1.05 });
      const th = t ? t.size * 0.7 + (t.lines.length - 1) * t.size * 1.05 : 0;
      svg =
        bg(p) +
        circle(rand(r, cx, R), rand(r, 210, 250), rand(r, 30, 46), red) +
        g(
          rect(-120, 150 - band / 2, 440, band, k) +
            rect(-120, 150 + band / 2 + 6, 440, 4, red) +
            rect(-120, 150 - band / 2 - 14, 440, 3, k) +
            txt(t, cx, 150 - th / 2 + (t ? t.size * 0.7 : 0), p, 'middle'),
          `transform="rotate(${n(ang)} ${n(cx)} 150)"`,
        ) +
        txt(fit(c.author || ' ', AUTHOR, { maxW: cw, lines: 2, max: 11, min: 7 }), L, 36, k) +
        rect(L, 44, 40, 4, red);
    } else if (v === 2) {
      // Лестница: ступени из полос, название крупно внизу.
      let bars = '';
      const k0 = int(r, 4, 6);
      for (let i = 0; i < k0; i++) {
        const w = 40 + ((flip ? k0 - i : i + 1) / k0) * (cw - 20);
        bars += rect(L - 8, 26 + i * 22, w, 14, i % 2 ? k : red);
      }
      svg =
        bg(p) +
        bars +
        rect(R - 6, 20, 4, 150, k) +
        circle(R - 4, 26 + k0 * 22 + 18, 9, extra) +
        texts(c, { x: L, y: 26 + k0 * 22 + 34, w: cw - 10, h: H - 26 - (26 + k0 * 22 + 34) }, { font, max: 30, lines: 4, color: k, align: 'start', ac: red, at: 'split' });
    } else {
      // Круг: большой красный круг, через него балки.
      const ccx = rand(r, cx, R + 20);
      const cy = rand(r, 70, 110);
      svg =
        bg(p) +
        circle(ccx, cy, rand(r, 66, 84), red) +
        g(rect(-50, cy + 30, 320, 10, k) + rect(-50, cy + 48, 320, 3, k), `transform="rotate(${n(rand(r, -24, -8))} ${n(cx)} ${n(cy)})"`) +
        rect(L - 6, 196, cw + 12, 22, k) +
        txt(fit(c.author || ' ', AUTHOR, { maxW: cw, lines: 1, max: 11, min: 6.5 }), L, 211, p) +
        texts({ ...c, author: '' }, { x: L, y: 228, w: cw, h: 60 }, { font, max: 24, lines: 3, color: k, align: 'start', at: 'top' });
    }
    return { svg, tex: 'grain', spine: 'tone', age: 0.6, base: p };
  },
};

// ============ Баухаус ============

const BAUHAUS = [pal('eee9de d1402f f0b631 2a5ca8 1d1d1f'), pal('e9e4d8 c65d3b e3b448 3d6a8c 222222'), pal('efe9df d9734e 9bb59a 2f4a6a 1d1d1d'), pal('f0ece3 b23a48 f2c14e 5b8e7d 262626'), pal('e8e2d4 e07a5f f2cc8f 3d405b 81b29a')];

// Фигуры плитки размера s: четверть круга, полукруг, треугольник, круг, квадрат, пусто.
const SH: Record<string, (c: string, s: number) => string> = {
  q: (c, s) => `<path d="M0 0H${n(s)}A${n(s)} ${n(s)} 0 0 1 0 ${n(s)}Z" fill="${c}"/>`,
  h: (c, s) => `<path d="M0 0H${n(s)}A${n(s / 2)} ${n(s / 2)} 0 0 1 0 0Z" fill="${c}"/>`,
  t: (c, s) => `<path d="M0 0H${n(s)}V${n(s)}Z" fill="${c}"/>`,
  c: (c, s) => `<circle cx="${n(s / 2)}" cy="${n(s / 2)}" r="${n(s * 0.34)}" fill="${c}"/>`,
  s: (c, s) => `<rect x="${n(s * 0.2)}" y="${n(s * 0.2)}" width="${n(s * 0.6)}" height="${n(s * 0.6)}" fill="${c}"/>`,
  n: () => '',
};
export function tiles(r: Rng, cols: number, rows: number, s: number, x0: number, y0: number, fills: string[], kinds: string): string {
  let out = '';
  for (let j = 0; j < rows; j++)
    for (let i = 0; i < cols; i++) {
      const x = x0 + i * s;
      const y = y0 + j * s;
      const bi = int(r, 0, fills.length - 1);
      const fg = fills[(bi + int(r, 1, fills.length - 1)) % fills.length];
      out += rect(x, y, s + 0.4, s + 0.4, fills[bi]);
      const shape = SH[pick(r, [...kinds])](fg, s);
      if (shape) out += g(shape, `transform="translate(${n(x)} ${n(y)}) rotate(${int(r, 0, 3) * 90} ${n(s / 2)} ${n(s / 2)})"`);
    }
  return out;
}

export const bauhaus: Style = {
  id: 'bauhaus',
  name: 'Баухаус',
  variants: ['Плитки', 'Композиция', 'Арки', 'Буква'],
  draw(c) {
    const { r, v, L, R, cx, cw } = c;
    const [p, ...cols] = pick(r, BAUHAUS);
    const k = cols[3];
    const font = pick(r, [F.heavy, caps(F.narrow, 0.03), F.tech]);
    const mb = ' style="mix-blend-mode:multiply"';
    let svg: string;
    if (v === 0) {
      const s = W / 3;
      svg = bg(p) + tiles(r, 3, 3, s, 0, 0, [p, ...cols], 'qqhhtcsn') + rect(0, 200, W, 4, k) + texts(c, { x: L, y: 216, w: cw, h: 70 }, { font, max: 22, lines: 3, color: k, align: 'start', ac: cols[0] });
    } else if (v === 1) {
      const [a, b, d] = shuffle(r, cols.slice(0, 3));
      const ccx = rand(r, L + 30, R - 20);
      svg =
        bg(p) +
        circle(ccx, rand(r, 70, 100), rand(r, 46, 62), a, mb) +
        rect(rand(r, L - 10, cx - 20), rand(r, 100, 120), rand(r, 60, 90), rand(r, 60, 90), b, mb) +
        path(`M${n(rand(r, cx, R))} ${n(rand(r, 40, 80))}l${n(rand(r, 30, 60))} ${n(rand(r, 90, 130))}h${n(-rand(r, 70, 110))}z`, d, mb) +
        stroke(`M0 ${n(rand(r, 150, 190))}L${W} ${n(rand(r, 120, 170))}`, k, 2.4) +
        stroke(`M${n(rand(r, L, R))} 0V215`, k, 1.2) +
        texts(c, { x: L, y: 222, w: cw, h: 64 }, { font, max: 22, lines: 3, color: k, align: 'start', authorFirst: true, gap: 6 });
    } else if (v === 2) {
      // Арки: стопки полукругов.
      let arcs = '';
      const s = W / 2;
      for (let j = 0; j < 2; j++)
        for (let i = 0; i < 2; i++) {
          const x = i * s;
          const y = 150 + j * s * 0.75;
          const cc = shuffle(r, cols);
          const up = r() < 0.5;
          arcs += rect(x, y - s / 2, s + 0.4, s * 0.75 + 0.4, j === i ? p : cc[3] === k ? p : cc[3]);
          [0.5, 0.36, 0.22, 0.08].forEach((m, q) => {
            const rr = s * m;
            const cy = up ? y + s * 0.25 : y - s * 0.5;
            arcs += path(`M${n(x + s / 2 - rr)} ${n(cy)}a${n(rr)} ${n(rr)} 0 0 ${up ? 1 : 0} ${n(2 * rr)} 0Z`, q === 3 ? p : cc[q]);
          });
        }
      svg = bg(p) + arcs + texts(c, { x: L, y: 16, w: cw, h: 74 }, { font, max: 22, lines: 3, color: k, align: 'start', at: 'top', ac: cols[0] });
    } else {
      // Буква: огромная заглавная, за ней круг.
      const ch = initial(c.title);
      const size = 230;
      const w = measure(ch, F.heavy, size);
      const big = { lines: [ch], size: w > 190 ? size * (190 / w) : size, font: F.heavy, lh: 1, maxW: 400 };
      svg =
        bg(p) +
        circle(rand(r, L + 20, R - 20), rand(r, 70, 110), rand(r, 50, 70), cols[0], mb) +
        rect(rand(r, L - 10, cx), rand(r, 120, 160), rand(r, 40, 90), 50, cols[2], mb) +
        txt(big, cx, 196, k, 'middle', mb) +
        texts(c, { x: L, y: 220, w: cw, h: 66 }, { font, max: 20, lines: 3, color: k, align: 'start', ac: cols[1] });
    }
    return { svg, tex: 'grain', spine: 'tone', age: 0.4, base: p };
  },
};

// ============ Швейцарский стиль ============

const SWISS: [string, string, string][] = [
  ['#f2f0eb', '#1d1d1f', '#d6342c'],
  ['#e8e6e0', '#1d1d1f', '#2556a8'],
  ['#d6342c', '#f6f1e9', '#1d1d1f'],
  ['#1d1d1f', '#f2f0eb', '#e94f2e'],
  ['#2556a8', '#f2f0eb', '#f1c232'],
  ['#f1c232', '#1d1d1f', '#d6342c'],
  ['#e9e4dc', '#3b4a3f', '#c75b39'],
  ['#2f3e46', '#e8e3d9', '#e0a458'],
];

export const swiss: Style = {
  id: 'swiss',
  name: 'Швейцарский',
  variants: ['Кольца', 'Полосы', 'Точки', 'Волны'],
  draw(c) {
    const { r, v, L, R, cw } = c;
    const [b, f, a] = pick(r, SWISS);
    const font = pick(r, [caps(F.narrow, 0.01), F.heavy, F.tech]);
    const top = r() < 0.6;
    const tb = top ? { x: L, y: 18, w: cw, h: 90 } : { x: L, y: 200, w: cw, h: 86 };
    const zone: [number, number] = top ? [110, H] : [0, 196];
      let art = '';
    if (v === 0) {
      const ccx = rand(r, L + 40, W + 20);
      const cy = rand(r, zone[0] + 40, zone[1] - 40);
      for (let i = 12; i > 0; i--) art += circle(ccx, cy, i * 11, 'none', ` stroke="${i === 4 ? a : f}" stroke-width="${i % 3 ? 2.2 : 5}"`);
    } else if (v === 1) {
      const k = int(r, 10, 16);
      const w = (R - L + 8) / k;
      for (let i = 0; i < k; i++) {
        const h = rand(r, 20, zone[1] - zone[0] - 20);
        art += rect(L - 4 + i * w, zone[1] - 10 - h, w * 0.62, h, r() < 0.15 ? a : f);
      }
    } else if (v === 2) {
      const fx = rand(r, 0, W);
      const fy = rand(r, zone[0], zone[1]);
      const s = 18;
      let d = '';
      for (let y = zone[0] + 12; y < zone[1] - 6; y += s)
        for (let x = 10; x < W; x += s) {
          const k = Math.max(0, 1 - Math.hypot(x - fx, y - fy) / 170);
          const rr = 1 + k * 7.5;
          d += `M${n(x - rr)} ${n(y)}a${n(rr)} ${n(rr)} 0 1 0 ${n(2 * rr)} 0a${n(rr)} ${n(rr)} 0 1 0 ${n(-2 * rr)} 0`;
        }
      art = path(d, f) + circle(fx, fy, 6, a);
    } else {
      const k = 16;
      const amp = rand(r, 8, 22);
      const fr = rand(r, 0.02, 0.045);
      for (let i = 0; i < k; i++) {
        const y0 = zone[0] + 14 + (i / k) * (zone[1] - zone[0] - 28);
        const e = Math.sin((i / (k - 1)) * Math.PI);
        const p: Pt[] = [];
        for (let x = -10; x <= W + 10; x += 22) p.push([x, y0 + amp * e * Math.sin(x * fr + i * 0.25)]);
        art += stroke(smooth(p, false), i === 9 ? a : f, 2);
      }
    }
    return {
      svg: bg(b) + clip(c.id + 'z', `M0 ${zone[0]}H${W}V${zone[1]}H0Z`, art) + rect(L, top ? 112 : 194, 28, 3, a) + texts(c, tb, { font, max: 30, lines: 3, color: f, align: 'start', at: top ? 'split' : 'splitUp', ac: f }),
      tex: 'grain',
      spine: 'tone',
      age: 0.25,
      base: b,
    };
  },
};

// ============ Мемфис ============

const MEMPHIS_BG = pal('f6d6d6 d8ecef fbe7b5 e3dcf2 d9efd9 fde2c8 f4f1ea');
const MEMPHIS = pal('ff5c8a 2fb5b0 ffc23a 6a5acd ff7a3d 3d7bd9 7bc96f');
const K = '#1b1b1b';

function squiggle(x: number, y: number, len: number, amp: number): string {
  let d = `M${n(x)} ${n(y)}`;
  for (let i = 0; i < len; i++) d += `q${n(6)} ${n(i % 2 ? amp : -amp)} 12 0`;
  return d;
}

export const memphis: Style = {
  id: 'memphis',
  name: 'Мемфис',
  variants: ['Конфетти', 'Терраццо', 'Формы'],
  draw(c) {
    const { r, v, L, R, cw, id } = c;
    const p = pick(r, MEMPHIS_BG);
    const cols = shuffle(r, MEMPHIS);
    const font = pick(r, [F.heavy, F.tech]);
    const by = v === 1 ? rand(r, 100, 140) : rand(r, 196, 214);
    const bh = 76;
    const box =
      rect(L, by + 4, cw, bh, K) +
      rect(L - 5, by, cw, bh, '#fffdf8', ` stroke="${K}" stroke-width="2"`) +
      texts(c, { x: L + 4, y: by + 10, w: cw - 18, h: bh - 20 }, { font, max: 18, lines: 3, color: K, ac: dark(cols[0], 0.2), af: AUTHOR, as: 8.5 });
    let art = '';
    if (v === 0) {
      // Конфетти: фигурки, повёрнутые как попало.
      const items = [
        (x: number, y: number, col: string) => stroke(squiggle(x - 24, y, 4, 7), col, 3.5, ' stroke-linecap="round"'),
        (x: number, y: number, col: string) => path(`M${n(x)} ${n(y - 12)}l12 20h-24z`, 'none', ` stroke="${col}" stroke-width="3"`),
        (x: number, y: number, col: string) => circle(x, y, 9, col),
        (x: number, y: number, col: string) => stroke(`M${n(x - 18)} ${n(y)}l6-8 6 8 6-8 6 8 6-8`, col, 3),
        (x: number, y: number, col: string) => path(`M${n(x - 10)} ${n(y)}a10 10 0 0 1 20 0z`, col),
        (x: number, y: number, col: string) => stroke(`M${n(x - 8)} ${n(y)}h16M${n(x)} ${n(y - 8)}v16`, col, 3.5),
        (x: number, y: number, col: string) => rect(x - 7, y - 7, 14, 14, col),
      ];
      for (let i = 0; i < 18; i++) {
        const x = rand(r, 10, W - 10);
        const y = rand(r, 12, by - 8) * (i < 14 ? 1 : 0) + (i < 14 ? 0 : rand(r, by + bh + 12, H - 6));
        art += g(pick(r, items)(0, 0, i % 3 ? pick(r, cols) : K), `transform="translate(${n(x)} ${n(y)}) rotate(${int(r, 0, 360)})"`);
      }
      art = pattern(id + 'd', 10, 10, `<circle cx="5" cy="5" r="1.4" fill="${K}"/>`) + rect(rand(r, 0, 100), rand(r, 20, 120), 80, 60, `url(#${id}d)`) + art;
    } else if (v === 1) {
      // Терраццо: крошка камня.
      for (let i = 0; i < 70; i++) {
        const x = rand(r, 0, W);
        const y = rand(r, 0, H);
        const s = rand(r, 2, 7);
        const pts: Pt[] = [];
        const k = int(r, 3, 5);
        for (let j = 0; j < k; j++) {
          const a = (j / k) * 6.28 + rand(r, 0, 0.8);
          pts.push([x + s * Math.cos(a) * rand(r, 0.6, 1), y + s * Math.sin(a) * rand(r, 0.6, 1)]);
        }
        art += path(poly(pts), i % 5 ? cols[i % 4] : K);
      }
    } else {
      // Формы: круг в полоску, треугольник в горошек, волна.
      art =
        pattern(id + 's', 8, 8, `<path d="M0 2h8" stroke="${K}" stroke-width="2.5"/>`, ' patternTransform="rotate(45)"') +
        pattern(id + 'd', 9, 9, `<circle cx="4.5" cy="4.5" r="1.8" fill="${K}"/>`) +
        circle(rand(r, L + 30, R), rand(r, 60, 90), rand(r, 40, 52), cols[0]) +
        circle(rand(r, L + 30, R), rand(r, 60, 90), rand(r, 34, 46), `url(#${id}s)`) +
        path(`M${n(rand(r, 0, 40))} 190l${n(rand(r, 40, 70))}-${n(rand(r, 80, 110))}l${n(rand(r, 30, 60))} ${n(rand(r, 80, 110))}z`, cols[1]) +
        path(`M${n(rand(r, 60, 120))} 180l50-70 30 80z`, `url(#${id}d)`) +
        stroke(squiggle(rand(r, 20, 60), rand(r, 20, 40), 9, 9), K, 4, ' stroke-linecap="round"') +
        rect(R - 40, 140, 36, 36, cols[2]);
    }
    return { svg: bg(p) + art + box, tex: 'grain', spine: 'tone', age: 0.2, base: p };
  },
};

// ============ Оп-арт ============

const OP: [string, string][] = [
  ['#151515', '#f2efe8'],
  ['#1d2a4a', '#efe7d6'],
  ['#b0302a', '#f3ece0'],
  ['#1f4a3a', '#ece6d2'],
  ['#2a2a2a', '#e9c46a'],
  ['#3b2a5a', '#f0e6e0'],
];

// Выпуклая линза: точки внутри круга раздвигаются от центра.
const lens = (cx: number, cy: number, R: number, k: number) => ([x, y]: Pt): Pt => {
  const dx = x - cx;
  const dy = y - cy;
  const d = Math.hypot(dx, dy);
  if (d >= R || d === 0) return [x, y];
  const m = (R * (d / R) ** k) / d;
  return [cx + dx * m, cy + dy * m];
};

export const opart: Style = {
  id: 'opart',
  name: 'Оп-арт',
  variants: ['Линза', 'Муар', 'Шахматы', 'Волны'],
  draw(c) {
    const { r, v, L, cw } = c;
    const [f, b] = shuffle(r, pick(r, OP));
    const font = pick(r, [F.heavy, F.tech, caps(F.narrow, 0.05)]);
    let d = '';
    if (v === 0) {
      const T = lens(rand(r, 60, 140), rand(r, 80, 150), rand(r, 70, 100), 0.55);
      const s = 10;
      for (let x = 0; x < W; x += 2 * s) {
        const left: Pt[] = [];
        const right: Pt[] = [];
        for (let y = -5; y <= H + 5; y += 10) {
          left.push(T([x, y]));
          right.push(T([x + s, y]));
        }
        d += poly([...left, ...right.reverse()]);
      }
    } else if (v === 1) {
      const ring = (cx: number, cy: number) => {
        let s = '';
        for (let i = 1; i <= 22; i++) s += `M${n(cx - i * 9)} ${n(cy)}a${i * 9} ${i * 9} 0 1 0 ${i * 18} 0a${i * 9} ${i * 9} 0 1 0 ${-i * 18} 0`;
        return s;
      };
      d = ring(rand(r, 40, 90), rand(r, 60, 120)) + ring(rand(r, 110, 170), rand(r, 120, 200));
    } else if (v === 2) {
      const T = lens(rand(r, 70, 130), rand(r, 90, 160), rand(r, 80, 110), 0.5);
      const s = 25;
      for (let j = 0; j < H / s; j++)
        for (let i = 0; i < W / s; i++) if ((i + j) % 2 === 0) d += poly([T([i * s, j * s]), T([i * s + s, j * s]), T([i * s + s, j * s + s]), T([i * s, j * s + s])]);
    } else {
      const k = 22;
      const amp = rand(r, 6, 14);
      const fr = rand(r, 0.025, 0.05);
      for (let i = 0; i < k; i++) {
        const y0 = (i / k) * (H + 20) - 10;
        const top: Pt[] = [];
        const bot: Pt[] = [];
        for (let x = -10; x <= W + 10; x += 15) {
          top.push([x, y0 + amp * Math.sin(x * fr + i * 0.4)]);
          bot.push([x, y0 + 7 + amp * Math.sin(x * fr + i * 0.4 + 1.2)]);
        }
        d += poly([...top, ...bot.reverse()]);
      }
    }
    const by = r() < 0.5 ? 20 : 206;
    const art = path(d, f, v === 1 ? ' fill-rule="evenodd"' : '');
    return {
      svg: bg(b) + art + rect(L - 8, by, cw + 16, 74, b) + frame(L - 8, by, cw + 16, 74, f, 2.5) + texts(c, { x: L, y: by + 10, w: cw, h: 54 }, { font, max: 20, lines: 3, color: f, as: 8.5 }),
      tex: 'grain',
      spine: 'tone',
      age: 0.2,
      base: b,
    };
  },
};

// ============ Скандинавский минимализм ============

const NORDIC_BG = pal('efe8dc e6ece8 f1e4dc e4e7ef ece6d6 e9e2d2');
const NORDIC = pal('c97b5a 7a9a8a d9b26f 8c9db5 b5838d 5d6d5a e3c0a5 4f5d75 a3b18a d4a373');

export const nordic: Style = {
  id: 'nordic',
  name: 'Север',
  variants: ['Арки', 'Камни', 'Холмы', 'Солнце'],
  draw(c) {
    const { r, v, L, R, cx, cw } = c;
    const p = pick(r, NORDIC_BG);
    const cols = shuffle(r, NORDIC);
    const ink = '#33302c';
    const font = pick(r, [F.serif, F.antique, F.didone, caps(F.narrow, 0.06)]);
    let art = '';
    if (v === 0) {
      const k = int(r, 1, 2);
      for (let i = 0; i < k; i++) {
        const ax = k === 1 ? cx : i ? R - 34 : L + 34;
        const ay = rand(r, 170, 200) - i * 30;
        const big = k === 1 ? 68 : 44;
        [1, 0.75, 0.5, 0.25].forEach((m, q) => (art += path(`M${n(ax - big * m)} ${n(ay)}a${n(big * m)} ${n(big * m)} 0 0 1 ${n(2 * big * m)} 0Z`, q === 3 ? p : cols[(q + i) % cols.length])));
      }
    } else if (v === 1) {
      let y = rand(r, 196, 210);
      let w = rand(r, 100, 130);
      for (let i = 0; i < int(r, 4, 6); i++) {
        const h = rand(r, 18, 30);
        const x = cx + rand(r, -10, 10);
        const pts: Pt[] = [
          [x - w / 2, y - h / 2],
          [x, y - h / 2 - rand(r, 0, 4)],
          [x + w / 2, y - h / 2 + rand(r, -3, 3)],
          [x + w / 2 + 4, y],
          [x + w / 2, y + h / 2],
          [x, y + h / 2 + 2],
          [x - w / 2, y + h / 2],
          [x - w / 2 - 4, y],
        ];
        art += path(smooth(pts), cols[i]);
        y -= h + 1;
        w *= rand(r, 0.7, 0.88);
      }
    } else if (v === 2) {
      art = circle(rand(r, L + 20, R - 10), rand(r, 140, 160), rand(r, 16, 24), cols[0]);
      for (let i = 0; i < 4; i++) {
        const y0 = 172 + i * 24;
        const p2: Pt[] = [];
        for (let x = -20; x <= W + 20; x += 44) p2.push([x, y0 + rand(r, -12, 12)]);
        art += path(smooth(p2, false) + `L${W + 20} ${H}L-20 ${H}Z`, dark(cols[1 + (i % 2)], i * 0.12));
      }
    } else {
      const hz = rand(r, 160, 200);
      art = circle(cx + rand(r, -30, 30), hz, rand(r, 50, 70), cols[0]) + rect(0, hz, W, H - hz, cols[1]) + circle(rand(r, L, R), rand(r, 50, 90), 8, cols[2]) + stroke(`M${n(L)} ${n(hz + 30)}H${n(R)}`, p, 1.5);
    }
    const textTop = v !== 3;
    return {
      svg: bg(p) + art + texts(c, textTop ? { x: L, y: 22, w: cw, h: 88 } : { x: L, y: 226, w: cw, h: 60 }, { font, max: 22, lines: 3, color: textTop ? ink : on(cols[1]), align: 'start', at: 'top', gap: 6 }),
      tex: 'grain',
      spine: 'tone',
      age: 0.15,
      base: p,
    };
  },
};

