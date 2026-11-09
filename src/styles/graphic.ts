// Графика XX века: авангард, Баухаус, швейцарский стиль, оп-арт, скандинавский минимализм.
import { H, W, dark, light, lum, mix, n, on, pal, palette, pick, poly, rand, ramp, int, shades, smooth, shuffle, wada, type Pt, type Rng } from '../core.ts';
import { F, caps, fit, txt } from '../text.ts';
import { AUTHOR, bg, circle, clip, frame, g, grad, op, path, rect, sk, stroke, texts, type Style } from '../cover.ts';

const PAPERS = pal('ece2cc efe6d2 e8dcc0 f0e9da dcd8cf e6d6b8');
const AVANT = pal('c8302c c8302c 2a5a9a d8a334 2f6b4f d9622b 5a3d7a 1f7a8c 7a7a72');

// ============ Авангард 1920-х ============

export const avant: Style = {
  id: 'avant',
  name: 'Авангард',
  variants: ['Клин', 'Диагональ', 'Лестница', 'Круг'],
  draw(c) {
    const { r, v, L, R, cx, cw } = c;
    // Акцент — не только красный; изредка всё наоборот: светлые формы на чёрном.
    const [acc, extra] = shuffle(r, AVANT).slice(0, 2);
    let p = pick(r, PAPERS);
    let k = '#1d1b1a';
    if (r() < 0.2) [p, k] = [k, p];
    const font = pick(r, [caps(F.narrow, 0.02), F.heavy, F.slav]);
    const flip = r() < 0.5;
    let svg: string;
    if (v === 0) {
      // Клин врезается в круг; круг, клин и балки — где угодно над текстом, балки под любым углом.
      const rad = rand(r, 28, 62);
      const ccx = rand(r, L + 10, R - 10);
      const cy = rand(r, 40 + rad * 0.5, 170 - rad * 0.4);
      const side = ccx > cx ? 1 : -1;
      const [a, b] = flip ? [acc, k] : [k, acc];
      svg =
        bg(p) +
        clip(
          c.id + 'z',
          `M0 0H${W}V204H0Z`,
          circle(ccx, cy, rad, a) +
            path(`M${n(side > 0 ? L - 30 : R + 30)} ${n(rand(r, 20, 200))}L${n(ccx + side * rad * 0.3)} ${n(cy - 3)}L${n(ccx + side * rad * 0.15)} ${n(cy + 16)}Z`, b) +
            g(rect(rand(r, L - 8, cx), rand(r, 20, 190), rand(r, 50, 110), 7, extra) + rect(rand(r, L, R - 8), rand(r, 14, 120), 8, rand(r, 30, 70), k), `transform="rotate(${int(r, -35, 35)} ${n(cx)} 110)"`),
        ) +
        texts(c, { x: L, y: 212, w: cw, h: 74 }, { font, max: 26, lines: 3, color: k, align: 'start', ac: acc, as: 10, authorFirst: true, gap: 8 });
    } else if (v === 1) {
      // Диагональ: широкая полоса наискосок, название по ней.
      const ang = -rand(r, 18, 34);
      const band = rand(r, 54, 70);
      const t = fit(c.title, font, { maxW: 176, lines: 2, max: 30, min: 11, lh: 1.05 });
      const th = t ? t.size * 0.7 + (t.lines.length - 1) * t.size * 1.05 : 0;
      svg =
        bg(p) +
        circle(rand(r, cx, R), rand(r, 210, 250), rand(r, 30, 46), acc) +
        g(
          rect(-120, 150 - band / 2, 440, band, k) +
            rect(-120, 150 + band / 2 + 6, 440, 4, acc) +
            rect(-120, 150 - band / 2 - 14, 440, 3, k) +
            txt(t, cx, 150 - th / 2 + (t ? t.size * 0.7 : 0), p, 'middle'),
          `transform="rotate(${n(ang)} ${n(cx)} 150)"`,
        ) +
        txt(fit(c.author || ' ', AUTHOR, { maxW: cw, lines: 2, max: 11, min: 7 }), L, 36, k) +
        rect(L, 44, 40, 4, acc);
    } else if (v === 2) {
      // Лестница: ступени из полос, название крупно внизу.
      let bars = '';
      const k0 = int(r, 4, 6);
      for (let i = 0; i < k0; i++) {
        const w = 40 + ((flip ? k0 - i : i + 1) / k0) * (cw - 20);
        bars += rect(L - 8, 26 + i * 22, w, 14, i % 2 ? k : acc);
      }
      svg =
        bg(p) +
        bars +
        rect(R - 6, 20, 4, 150, k) +
        circle(R - 4, 26 + k0 * 22 + 18, 9, extra) +
        texts(c, { x: L, y: 26 + k0 * 22 + 34, w: cw - 10, h: H - 26 - (26 + k0 * 22 + 34) }, { font, max: 30, lines: 4, color: k, align: 'start', ac: acc, at: 'split' });
    } else {
      // Круг: большой красный круг, через него балки.
      const ccx = rand(r, cx, R + 20);
      const cy = rand(r, 70, 110);
      svg =
        bg(p) +
        circle(ccx, cy, rand(r, 66, 84), acc) +
        g(rect(-50, cy + 30, 320, 10, k) + rect(-50, cy + 48, 320, 3, k), `transform="rotate(${n(rand(r, -24, -8))} ${n(cx)} ${n(cy)})"`) +
        rect(L - 6, 196, cw + 12, 22, k) +
        txt(fit(c.author || ' ', AUTHOR, { maxW: cw, lines: 1, max: 11, min: 6.5 }), L, 211, p) +
        texts({ ...c, author: '' }, { x: L, y: 228, w: cw, h: 60 }, { font, max: 24, lines: 3, color: k, align: 'start', at: 'top' });
    }
    return { svg, tex: 'grain', age: 0.6, base: p };
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
  variants: ['Плитки', 'Композиция'],
  draw(c) {
    const { r, v, L, R, cx, cw } = c;
    const [p, ...cols] = pick(r, BAUHAUS);
    const k = cols[3];
    const font = pick(r, [F.heavy, caps(F.narrow, 0.03), F.tech]);
    const mb = ' style="mix-blend-mode:multiply"';
    let svg: string;
    if (v === 0) {
      // Плитки от крупных (две в ряд) до мелких (пять в ряд).
      const m = int(r, 2, 5);
      const s = W / m;
      svg = bg(p) + clip(c.id + 't', `M0 0H${W}V200H0Z`, tiles(r, m, Math.ceil(200 / s), s, 0, 0, [p, ...cols], 'qqhhtcsn')) + rect(0, 200, W, 4, k) + texts(c, { x: L, y: 216, w: cw, h: 70 }, { font, max: 22, lines: 3, color: k, align: 'start', ac: cols[0] });
    } else {
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
    }
    return { svg, tex: 'grain', age: 0.4, base: p };
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
      const sp = rand(r, 6, 18);
      for (let i = Math.min(30, Math.ceil(260 / sp)); i > 0; i--) art += circle(ccx, cy, i * sp, 'none', sk(i === 4 ? a : f, sp * (i % 3 ? 0.2 : 0.45)));
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
      const s = pick(r, [12, 18, 26]);
      let d = '';
      for (let y = zone[0] + 12; y < zone[1] - 6; y += s)
        for (let x = 10; x < W; x += s) {
          const k = Math.max(0, 1 - Math.hypot(x - fx, y - fy) / 170);
          const rr = 1 + k * s * 0.42;
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
      age: 0.25,
      base: b,
    };
  },
};

// ============ Оп-арт ============

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
    // Нежно: светлая бумага и средний тон той же или соседней краски; изредка наоборот.
    const w = palette(r, 4, 0.6);
    const lite = r() < 0.75;
    const b = lite ? light(w[3], 0.55) : dark(w[0], 0.2);
    const f = lite ? mix(w[0], b, rand(r, 0.3, 0.55)) : mix(w[2], b, 0.45);
    const font = pick(r, [F.heavy, F.tech, caps(F.narrow, 0.05)]);
    let d = '';
    if (v === 0) {
      const T = lens(rand(r, 40, 160), rand(r, 60, 240), rand(r, 60, 140), 0.55);
      const s = pick(r, [7, 10, 14, 20]);
      for (let x = 0; x < W; x += 2 * s) {
        const left: Pt[] = [];
        const right: Pt[] = [];
        for (let y = -5; y <= H + 5; y += 12) {
          left.push(T([x, y]));
          right.push(T([x + s, y]));
        }
        d += poly([...left, ...right.reverse()]);
      }
    } else if (v === 1) {
      const sp = pick(r, [5, 7, 9, 13]);
      const ring = (cx: number, cy: number) => {
        let s = '';
        for (let i = 1; i <= Math.ceil(240 / sp); i++) s += `M${n(cx - i * sp)} ${n(cy)}a${i * sp} ${i * sp} 0 1 0 ${i * sp * 2} 0a${i * sp} ${i * sp} 0 1 0 ${-i * sp * 2} 0`;
        return s;
      };
      d = ring(rand(r, 40, 90), rand(r, 60, 120)) + ring(rand(r, 110, 170), rand(r, 120, 200));
    } else if (v === 2) {
      const T = lens(rand(r, 40, 160), rand(r, 60, 240), rand(r, 60, 140), 0.5);
      const s = pick(r, [16, 25, 36, 50]);
      for (let j = 0; j < H / s; j++)
        for (let i = 0; i < W / s; i++) if ((i + j) % 2 === 0) d += poly([T([i * s, j * s]), T([i * s + s, j * s]), T([i * s + s, j * s + s]), T([i * s, j * s + s])]);
    } else {
      const k = int(r, 12, 30);
      const th = (H / k) * 0.5;
      const amp = rand(r, 6, 14) * th / 7;
      const fr = rand(r, 0.015, 0.05);
      for (let i = 0; i < k; i++) {
        const y0 = (i / k) * (H + 20) - 10;
        const top: Pt[] = [];
        const bot: Pt[] = [];
        for (let x = -10; x <= W + 10; x += 15) {
          top.push([x, y0 + amp * Math.sin(x * fr + i * 0.4)]);
          bot.push([x, y0 + th + amp * Math.sin(x * fr + i * 0.4 + 1.2)]);
        }
        d += poly([...top, ...bot.reverse()]);
      }
    }
    const by = r() < 0.5 ? 20 : 206;
    const art = path(d, f, v === 1 ? ' fill-rule="evenodd"' : '');
    return {
      svg: bg(b) + art + rect(L - 8, by, cw + 16, 74, b) + frame(L - 8, by, cw + 16, 74, f, 2.5) + texts(c, { x: L, y: by + 10, w: cw, h: 54 }, { font, max: 20, lines: 3, color: on(b, dark(f, 0.5), light(f, 0.7)), as: 8.5 }),
      tex: 'grain',
      age: 0.2,
      base: b,
    };
  },
};

// ============ Скандинавский минимализм ============

const NORDIC_BG = pal('efe8dc e6ece8 f1e4dc e4e7ef ece6d6 e9e2d2');

export const nordic: Style = {
  id: 'nordic',
  name: 'Север',
  variants: ['Камни', 'Холмы', 'Солнце'],
  draw(c) {
    const { r, v, L, R, cx, cw } = c;
    const p = pick(r, NORDIC_BG);
    // Формы — сочетание Вады из четырёх или близкие оттенки; слишком светлые чуть темнее, чтобы не тонули в бумаге.
    const cols = (r() < 0.4 ? shades(r, 4, 0.35, 0.2) : shuffle(r, wada(r, 4))).map((x) => (lum(x) > 0.6 ? dark(x, 0.18) : x));
    const ink = '#33302c';
    const font = pick(r, [F.serif, F.antique, F.didone, caps(F.narrow, 0.06)]);
    let art = '';
    if (v === 0) {
      // Камни внизу, ниже текста.
      let y = rand(r, 240, 262);
      let w = rand(r, 120, 150);
      for (let i = 0; i < int(r, 3, 5); i++) {
        const h = rand(r, 20, 28);
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
        art += path(smooth(pts), cols[i % 4]);
        y -= h + 1;
        w *= rand(r, 0.7, 0.88);
      }
    } else if (v === 1) {
      // Солнце разного размера, наполовину за холмами и ниже текста; холмы — плавная растяжка красок.
      const cy = rand(r, 150, 180);
      art = circle(rand(r, 0, W), cy, rand(r, 14, cy - 122), cols[0]);
      const hills = ramp(cols[1], dark(cols[2], 0.25), 4);
      for (let i = 0; i < 4; i++) {
        const y0 = 172 + i * 24;
        const p2: Pt[] = [];
        for (let x = -20; x <= W + 20; x += 44) p2.push([x, y0 + rand(r, -12, 12)]);
        art += path(smooth(p2, false) + `L${W + 20} ${H}L-20 ${H}Z`, hills[i]);
      }
    } else {
      // Солнце на горизонте: маленькое или огромное, иногда уходит за край.
      // Земля под текстом: средние тона темнее, чтобы надпись читалась.
      const hz = rand(r, 160, 200);
      if (lum(cols[1]) < 0.42) cols[1] = dark(cols[1], 0.3);
      art = grad(c.id + 'k', p, mix(p, cols[0], 0.25)) + circle(cx + rand(r, -90, 90), hz, rand(r, 26, 110), cols[0], op(rand(r, 0.75, 1))) + rect(0, hz, W, H - hz, cols[1]) + stroke(`M${n(L)} ${n(hz + 30)}H${n(R)}`, p, 1.5);
    }
    const textTop = v !== 2;
    return {
      svg: bg(p) + art + texts(c, textTop ? { x: L, y: 22, w: cw, h: 88 } : { x: L, y: 226, w: cw, h: 60 }, { font, max: 22, lines: 3, color: textTop ? ink : on(cols[1]), align: 'start', at: 'top', gap: 6 }),
      tex: 'grain',
      age: 0.15,
      base: p,
    };
  },
};

