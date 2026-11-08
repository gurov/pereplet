// Переплёты и издательские серии: ткань, кожа, мраморная бумага, бумажные обложки.
import { H, W, dark, light, n, on, pal, pick, poly, rand, int, smooth, shuffle, type Pt } from '../core.ts';
import { F, caps, fit, txt } from '../text.ts';
import { AUTHOR, bg, circle, frame, initial, paper, path, pattern, rect, stroke, texts, type Style } from '../cover.ts';

const CLOTH = pal('7b2d26 2e5949 24426b 5a3b5d 7d5320 2f5f6b 474d57 6b3e26 44522c 743f5b 1f4e5f 8f3b2a 2b2b2e 9a7b4f 5d6b74 a5603a 3f3a63 6e7f5c b39a6c 8a3c4a 3c4a3a 6a2f3f');
const FOIL = pal('d6b46e d6b46e c9ccd1 c98a5a efe4c8');

export const cloth: Style = {
  id: 'cloth',
  name: 'Переплёт',
  variants: ['Рамка', 'Наклейка', 'Блинт', 'Линейки', 'Тиснение'],
  w: 2,
  draw(c) {
    const { r, v, L, R, cx, cw } = c;
    const base = pick(r, CLOTH);
    const mat = pick(r, ['cloth', 'cloth', 'leather', 'paper'] as const);
    const foil = lightOn(base, pick(r, FOIL));
    const font = pick(r, [F.serif, F.old, F.didone, caps(F.antique, 0.1), F.serif]);
    const af = pick(r, [AUTHOR, caps(F.serif, 0.08), caps(F.old, 0.1)]);
    const sc = pick(r, [dark(base, 0.45), dark(base, 0.6), pick(r, CLOTH), '#3a2418']);
    let body = '';
    let corners = r() < 0.35;
    if (v === 0) {
      // Рамка: двойная тиснёная рамка, ромб между названием и автором.
      body =
        frame(L - 4, 14, R - L + 8, 272, foil, 1.6, ' opacity=".85"') +
        frame(L, 19, R - L, 262, foil, 0.8, ' opacity=".5"') +
        texts(c, { x: L + 10, y: 50, w: cw - 20, h: 200 }, { font, max: 26, color: foil, af, as: 9.5, gap: 30, mid: (y, x) => path(`M${n(x)} ${n(y - 4)}l4 4-4 4-4-4z`, foil) + stroke(`M${n(x - 22)} ${n(y)}h14M${n(x + 8)} ${n(y)}h14`, foil, 0.9) });
    } else if (v === 1) {
      // Наклейка: бумажная этикетка, рамка по ней.
      const lw = Math.min(cw - 6, 140);
      const lh = rand(r, 92, 120);
      const ly = rand(r, 54, 96);
      const shape = int(r, 0, 2);
      const lx = cx - lw / 2;
      const p = paper(r);
      const ink = dark(base, 0.3);
      const d =
        shape === 0
          ? `M${n(lx)} ${n(ly)}h${n(lw)}v${n(lh)}h${n(-lw)}z`
          : shape === 1
            ? `M${n(lx + 8)} ${n(ly)}h${n(lw - 16)}l8 8v${n(lh - 16)}l-8 8h${n(16 - lw)}l-8-8v${n(16 - lh)}z`
            : `M${n(lx + 10)} ${n(ly)}h${n(lw - 20)}a10 10 0 0 0 10 10v${n(lh - 20)}a10 10 0 0 0-10 10h${n(20 - lw)}a10 10 0 0 0-10-10v${n(20 - lh)}a10 10 0 0 0 10-10z`;
      body =
        path(d, p, ' stroke="#000" stroke-opacity=".25"') +
        rect(lx + 5, ly + 5, lw - 10, lh - 10, 'none', ` stroke="${ink}" stroke-opacity=".5" stroke-width=".9"`) +
        texts(c, { x: lx + 12, y: ly + 12, w: lw - 24, h: lh - 24 }, { font, max: 22, lines: 4, color: ink, af, as: 8.5 }) +
        stroke(`M${n(L)} ${n(H - 40)}H${n(R)}`, foil, 1.2, ' opacity=".7"');
    } else if (v === 2) {
      // Блинт: вдавленная рамка с уголками, тиснение золотом.
      const deep = dark(base, 0.35);
      const hi = light(base, 0.18);
      const x0 = L - 2;
      const x1 = R + 2;
      const k = 12;
      const corner = (x: number, y: number) => circle(x, y, 5, 'none', ` stroke="${deep}" stroke-width="2.2"`) + circle(x, y, 1.8, deep);
      body =
        frame(x0, 12, x1 - x0, 276, deep, 2.6) +
        frame(x0 + 1.2, 13.2, x1 - x0, 276, hi, 1, ' opacity=".5"') +
        frame(x0 + k, 12 + k, x1 - x0 - 2 * k, 276 - 2 * k, deep, 1.2) +
        corner(x0 + k, 12 + k) +
        corner(x1 - k, 12 + k) +
        corner(x0 + k, 288 - k) +
        corner(x1 - k, 288 - k) +
        texts(c, { x: L + 14, y: 46, w: cw - 28, h: 208 }, { font, max: 24, color: foil, af, as: 9, at: 'split' });
    } else if (v === 3) {
      // Линейки: золотые полосы, автор сверху, буква-эмблема внизу.
      const rules = (y: number) => stroke(`M${n(L - 6)} ${y}H${W}M${n(L - 6)} ${y + 6}H${W}`, foil, 1.6) + stroke(`M${n(L - 6)} ${y + 3}H${W}`, foil, 0.6);
      body =
        rules(30) +
        rules(262) +
        texts(c, { x: L + 4, y: 56, w: cw - 8, h: 150 }, { font, max: 27, color: foil, af, as: 10, authorFirst: true, gap: 22 }) +
        circle(cx, 232, 11, 'none', ` stroke="${foil}" stroke-width="1.2"`) +
        txt(fit(initial(c.title), F.serif, { maxW: 14, max: 12 }), cx, 236.3, foil, 'middle');
      corners = false;
    } else {
      // Тиснение: узор по всей обложке, название в картуше.
      const deep = dark(base, 0.3);
      const k = pick(r, [10, 12, 14]);
      const motif = pick(r, [
        `<path d="M${k / 2} 1l${k / 2 - 1} ${k / 2 - 1}-${k / 2 - 1} ${k / 2 - 1}-${k / 2 - 1}-${k / 2 - 1}z" fill="none" stroke="${deep}" stroke-width="1.2"/>`,
        `<circle cx="${k / 2}" cy="${k / 2}" r="${k / 5}" fill="${deep}"/>`,
        `<path d="M0 0L${k} ${k}M${k} 0L0 ${k}" stroke="${deep}" stroke-width="1.2"/>`,
      ]);
      const ch = rand(r, 110, 140);
      const cy = rand(r, 70, 100);
      body =
        pattern(c.id + 'm', k, k, motif) +
        rect(0, 0, W, H, `url(#${c.id}m)`, ' opacity=".8"') +
        rect(L - 2, cy, cw + 4, ch, base) +
        frame(L + 2, cy + 4, cw - 4, ch - 8, foil, 1.2) +
        frame(L - 2, cy, cw + 4, ch, deep, 1.6) +
        texts(c, { x: L + 12, y: cy + 14, w: cw - 24, h: ch - 28 }, { font, max: 22, color: foil, af, as: 9 });
    }
    return {
      svg: bg(base) + (mat === 'leather' ? `<radialGradient id="${c.id}l" cx=".6" cy=".35" r=".8"><stop offset="0" stop-color="#fff" stop-opacity=".1"/><stop offset="1" stop-color="#000" stop-opacity=".25"/></radialGradient>` + rect(0, 0, W, H, `url(#${c.id}l)`) : '') + body,
      tex: mat === 'paper' ? 'grain' : mat,
      spine: r() < 0.7 ? 'leather' : 'cloth',
      sc,
      corners,
      age: 0.9,
      base,
    };
  },
};

// Золото на светлой ткани не видно — тогда тёмная краска.
const lightOn = (base: string, foil: string) => (on(base) === '#1d1b19' ? dark(base, 0.65) : foil);

// ============ Мраморная бумага ============

const MARBLE = [
  pal('1d2f4a c9a24b a3392c e9e1cf 2f5d50'),
  pal('3b2f63 e0b85a c4553b f0e8d8 6d8fb0'),
  pal('6b2a2a d9c49a 2a4d6b efe6d0 8c9a6b'),
  pal('9cb6c9 e8d7b0 c98f7c f4efe6 6c7a8a'),
  pal('2e3b2e a5b07a e3d8b8 8a5a3c d9a35a'),
  pal('22303c 8aa3b5 e9e4da b5503c 3f6d6a'),
  pal('5a3a5e d8a6b0 f1e3dc 3e6f8a e8c56a'),
  pal('31261d b48a52 eadbc0 6a2e2e 4c6b5c'),
];

// Капли краски на воде (Jaffer, «Mathematical marbling»): каждая новая капля раздвигает прежние.
function drops(r: () => number, colors: string[], k: number): string {
  const shapes: { p: Pt[]; c: string }[] = [];
  for (let i = 0; i < k; i++) {
    const cx = rand(r, -10, W + 10);
    const cy = rand(r, -10, H + 10);
    const rad = rand(r, 14, 34);
    for (const s of shapes)
      for (const p of s.p) {
        const dx = p[0] - cx;
        const dy = p[1] - cy;
        const m = Math.sqrt(1 + (rad * rad) / (dx * dx + dy * dy || 1));
        p[0] = cx + dx * m;
        p[1] = cy + dy * m;
      }
    const p: Pt[] = [];
    for (let j = 0; j < 18; j++) p.push([cx + rad * Math.cos((j / 18) * 2 * Math.PI), cy + rad * Math.sin((j / 18) * 2 * Math.PI)]);
    shapes.push({ p, c: colors[i % colors.length] });
  }
  // Гребень поперёк: «павлиний» изгиб.
  const amp = rand(r, 6, 16);
  const f = rand(r, 0.03, 0.07);
  return shapes.map((s) => path(poly(s.p.map(([x, y]) => [x + amp * Math.sin(y * f), y])), s.c)).join('');
}

// Полосы, изогнутые волной и протянутые гребнем.
function combed(r: () => number, colors: string[]): string {
  const k = int(r, 10, 14);
  const a1 = rand(r, 6, 22);
  const f1 = rand(r, 0.02, 0.06);
  const a2 = rand(r, 4, 14);
  const f2 = rand(r, 0.05, 0.14);
  const ph = rand(r, 0, 6);
  let out = '';
  for (let i = 0; i <= k; i++) {
    const y0 = (i / k) * (H + 40) - 30;
    const p: Pt[] = [];
    for (let x = -20; x <= W + 20; x += 20) {
      const y = y0 + a1 * Math.sin(x * f1 + ph + i * 0.3);
      p.push([x + a2 * Math.sin(y * f2), y]);
    }
    out += path(smooth(p, false) + `L${W + 20} ${H + 20}L-20 ${H + 20}Z`, colors[i % colors.length]);
  }
  return out;
}

export const marble: Style = {
  id: 'marble',
  name: 'Мрамор',
  variants: ['Гребень', 'Капли', 'Волна'],
  draw(c) {
    const { r, v, L, cw } = c;
    const colors = shuffle(r, pick(r, MARBLE));
    const art = v === 1 ? bg(colors[0]) + drops(r, colors.slice(1).concat(colors[0]), int(r, 12, 16)) : v === 0 ? bg(colors[0]) + combed(r, colors) : bg(colors[1]) + combedWave(r, colors);
    const sc = pick(r, ['#3a2418', '#5a1f1f', '#1f2f3a', '#2c3a2a', '#4a3020']);
    const lw = Math.min(cw, 128);
    const lx = L + (cw - lw) / 2;
    const ly = rand(r, 40, 70);
    const lh = rand(r, 80, 100);
    const p = paper(r);
    const ink = '#2a2420';
    const font = pick(r, [F.serif, F.old, F.didone]);
    const label =
      rect(lx + 1.5, ly + 1.5, lw, lh, '#000', ' opacity=".25"') +
      rect(lx, ly, lw, lh, p) +
      frame(lx + 4, ly + 4, lw - 8, lh - 8, ink, 0.8, ' opacity=".6"') +
      texts(c, { x: lx + 11, y: ly + 11, w: lw - 22, h: lh - 22 }, { font, max: 18, lines: 4, color: ink, as: 8, gap: 9 });
    return { svg: art + label, tex: 'grain', spine: 'leather', sc, corners: true, age: 0.9, base: colors[0] };
  },
};

// Волна: тонкие полосы, которые идут вверх и вниз (французский «каскад»).
function combedWave(r: () => number, colors: string[]): string {
  let out = '';
  const k = int(r, 9, 13);
  const amp = rand(r, 20, 50);
  const f = rand(r, 0.015, 0.03);
  for (let i = 0; i <= k; i++) {
    const x0 = (i / k) * (W + 40) - 20;
    const p: Pt[] = [];
    for (let y = -20; y <= H + 20; y += 20) p.push([x0 + amp * Math.sin(y * f + i * 0.35) * (0.6 + 0.4 * Math.sin(y * 0.05)), y]);
    out += path(smooth(p, false) + `L${W + 60} ${H + 20}L${W + 60} -20Z`, colors[i % colors.length]);
  }
  return out;
}

// ============ Издательская серия ============

const SERIES = pal('e2702b 2f7a53 2b5f9e 6d4a8f c8364f 7a2433 d9a525 5b6b7a 1f7c7a b8562a 3c3c3c 8a9a3a');

export const series: Style = {
  id: 'series',
  name: 'Серия',
  variants: ['Три полосы', 'Окно', 'Плашка', 'Колонка'],
  draw(c) {
    const { r, v, L, R, cx, cw } = c;
    const col = pick(r, SERIES);
    const p = paper(r);
    const ink = '#1f1d1b';
    const font = pick(r, [F.serif, F.didone, F.old, caps(F.narrow, 0.04)]);
    const af = pick(r, [AUTHOR, caps(F.serif, 0.06), F.serif]);
    let svg: string;
    if (v === 0) {
      // Три полосы: цветные сверху и снизу, название на белой середине.
      const y0 = rand(r, 80, 100);
      const y1 = rand(r, 200, 220);
      svg =
        bg(col) +
        rect(0, y0, W, y1 - y0, p) +
        stroke(`M0 ${n(y0 + 3)}H${W}M0 ${n(y1 - 3)}H${W}`, col, 0.8) +
        texts(c, { x: L, y: y0 + 12, w: cw, h: y1 - y0 - 24 }, { font, max: 24, lines: 3, color: ink, af, as: 9.5, ac: dark(col, 0.2), authorFirst: r() < 0.5 }) +
        path(`M${n(cx - 13)} ${n(y0 / 2)}a13 9 0 1 0 26 0a13 9 0 1 0-26 0z`, p) +
        txt(fit(initial(c.author || c.title), F.serif, { maxW: 14, max: 10 }), cx, y0 / 2 + 3.5, col, 'middle');
    } else if (v === 1) {
      // Окно: светлая рамка с названием, внизу полоска узора.
      const wy = rand(r, 34, 60);
      const wh = rand(r, 120, 150);
      const k = 8;
      svg =
        bg(col) +
        rect(L - 4, wy, cw + 8, wh, p) +
        frame(L, wy + 4, cw, wh - 8, col, 1) +
        texts(c, { x: L + 10, y: wy + 14, w: cw - 20, h: wh - 28 }, { font, max: 24, color: ink, af, as: 9.5, ac: dark(col, 0.25) }) +
        pattern(c.id + 'd', k, k, pick(r, [`<circle cx="4" cy="4" r="1.8" fill="${p}"/>`, `<path d="M0 8L4 2 8 8z" fill="${p}"/>`, `<path d="M0 4h8" stroke="${p}" stroke-width="2"/>`])) +
        rect(L - 4, 238, cw + 8, 32, `url(#${c.id}d)`, ' opacity=".55"');
    } else if (v === 2) {
      // Плашка: цветной блок сверху с названием, автор ниже на бумаге.
      const by = rand(r, 160, 190);
      svg =
        bg(p) +
        rect(0, 0, W, by, col) +
        texts(c, { x: L, y: 26, w: cw, h: by - 50 }, { font, max: 28, color: on(col), af, align: 'start', at: 'bottom' }) +
        stroke(`M${n(L)} ${n(by + 14)}H${n(R)}`, col, 2) +
        txt(fit(c.author || ' ', af, { maxW: cw, lines: 2, max: 11, min: 7 }), L, by + 34, ink);
    } else {
      // Колонка: цветная полоса с буквой, название справа.
      const w = rand(r, 44, 58);
      const big = fit(initial(c.title), F.didone, { maxW: w - 6, max: 52 })!;
      svg =
        bg(p) +
        rect(L - 6, 0, w, H, col) +
        txt(big, L - 6 + w / 2, 70, on(col), 'middle') +
        texts(c, { x: L + w + 4, y: 40, w: R - L - w - 4, h: 220 }, { font, max: 22, lines: 6, color: ink, af, as: 9, ac: dark(col, 0.2), align: 'start', at: 'split' });
    }
    return { svg, tex: 'grain', spine: 'tone', age: 0.7, base: col };
  },
};

// ============ Печать 60-х: две краски, наложение, сбитая приводка ============

const INKS = [pal('c8452c 2f6f8f'), pal('d9a03a 3b6e4f'), pal('b8343b e0b13a'), pal('2f5d8a e07b39'), pal('6a8a3c c94f3d'), pal('8b4a8c e2b23c'), pal('2a7d7a e86a4a'), pal('4a4a8a d8b04a')];

function blob(r: () => number, cx: number, cy: number, rad: number, k = 7): string {
  const p: Pt[] = [];
  for (let i = 0; i < k; i++) {
    const a = (i / k) * 2 * Math.PI;
    const m = rad * rand(r, 0.7, 1.15);
    p.push([cx + m * Math.cos(a), cy + m * Math.sin(a) * rand(r, 0.8, 1.1)]);
  }
  return smooth(p);
}

export const print60: Style = {
  id: 'print60',
  name: 'Печать 60-х',
  variants: ['Фигуры', 'Полосы', 'Окно'],
  draw(c) {
    const { r, v, L, R, cx, cw, id } = c;
    const [i1, i2] = shuffle(r, pick(r, INKS));
    const p = pick(r, ['#efe8d6', '#ece4cf', '#f2ecdc']);
    const k = '#262320';
    const mb = ' style="mix-blend-mode:multiply"';
    const font = pick(r, [caps(F.narrow, 0.05), F.serif, F.slav, F.tech]);
    const dots = pattern(id + 'h', 4, 4, `<circle cx="2" cy="2" r="1.1" fill="${i2}"/>`, ' patternTransform="rotate(30)"');
    const off = `translate(${n(rand(r, 1, 2.5))} ${n(rand(r, -2, 1))})`;
    let svg: string;
    if (v === 0) {
      // Фигуры: пятна двух красок внахлёст, контур чёрным со сдвигом.
      let fills = '';
      let lines = '';
      for (let i = 0; i < 4; i++) {
        const d = blob(r, rand(r, L, R), rand(r, 50, 190), rand(r, 26, 52));
        fills += path(d, i % 2 ? i1 : i === 2 ? `url(#${id}h)` : i2, mb);
        if (r() < 0.6) lines += stroke(d, k, 1.6);
      }
      svg =
        bg(p) +
        dots +
        fills +
        `<g transform="${off}">${lines}</g>` +
        texts(c, { x: L, y: 222, w: cw, h: 62 }, { font, max: 22, lines: 2, color: k, af: AUTHOR, as: 9, align: 'start', ac: i1 });
    } else if (v === 1) {
      // Полосы: широкие полосы краски, полутон, вывороткой название.
      const y0 = rand(r, 120, 160);
      svg =
        bg(p) +
        dots +
        rect(0, 0, W, y0, i1) +
        rect(0, y0 - 40, W, 70, `url(#${id}h)`, mb) +
        rect(0, y0 + 30, W, 14, i2, mb) +
        pattern(id + 't', 12, 10, `<path d="M0 10L6 2 12 10z" fill="${k}"/>`) +
        rect(0, y0 + 50, W, 10, `url(#${id}t)`) +
        texts(c, { x: L, y: 24, w: cw, h: y0 - 60 }, { font, max: 26, color: p, af: AUTHOR, as: 10, align: 'start', authorFirst: true }) +
        circle(R - 30, y0 + 120, 34, i2, mb) +
        circle(R - 52, y0 + 104, 20, i1, mb) +
        `<g transform="${off}">${circle(R - 30, y0 + 120, 34, 'none', ` stroke="${k}" stroke-width="1.6"`)}</g>`;
    } else {
      // Окно: краска во всю обложку, бумажная плашка, знак из двух фигур.
      const wy = rand(r, 140, 170);
      svg =
        bg(i1) +
        rect(L - 4, wy, cw + 8, 112, p) +
        texts(c, { x: L + 8, y: wy + 12, w: cw - 16, h: 88 }, { font, max: 22, color: k, af: AUTHOR, as: 9, ac: i1 }) +
        circle(cx - 12, 74, 36, i2, mb) +
        path(`M${n(cx - 10)} 122L${n(cx + 40)} 40L${n(cx + 46)} 122Z`, p, ' opacity=".9"' + mb) +
        `<g transform="${off}">${stroke(`M${n(cx - 10)} 122L${n(cx + 40)} 40L${n(cx + 46)} 122Z`, k, 1.6)}</g>`;
    }
    return { svg, tex: 'grain', spine: 'tone', age: 0.8, base: p };
  },
};

