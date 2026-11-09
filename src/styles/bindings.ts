// Переплёты и издательские серии: ткань, кожа, мраморная бумага, бумажные обложки.
import { H, W, byLum, dark, light, lum, mix, n, on, pal, palette, pick, poly, rand, int, smooth, shuffle, wada, wadaColor, type Pt } from '../core.ts';
import { F, caps, fit, txt } from '../text.ts';
import { blade } from './botany.ts';
import { AUTHOR, bg, box, circle, frame, initial, lab, op, orns, paper, path, pattern, rect, sk, stroke, texts, type Box, type Style, type TextOpts } from '../cover.ts';

const FOIL = pal('d6b46e d6b46e c9ccd1 c98a5a efe4c8');

// Четырёхлучевая звёздочка.
const star4 = (x: number, y: number, s: number) => poly([0, 1, 2, 3, 4, 5, 6, 7].map((i): Pt => [x + Math.sin((i * Math.PI) / 4) * s * (i % 2 ? 0.28 : 1), y - Math.cos((i * Math.PI) / 4) * s * (i % 2 ? 0.28 : 1)]));
// Разделители между названием и автором.
const MIDS: ((x: number, y: number, col: string) => string)[] = [
  (x, y, col) => path(`M${n(x)} ${n(y - 4)}l4 4-4 4-4-4z`, col) + stroke(`M${n(x - 22)} ${n(y)}h14M${n(x + 8)} ${n(y)}h14`, col, 0.9),
  (x, y, col) => circle(x - 9, y, 1.4, col) + circle(x, y, 1.9, col) + circle(x + 9, y, 1.4, col),
  (x, y, col) => stroke(`M${n(x - 20)} ${n(y)}h40`, col, 1.2),
  (x, y, col) => path(star4(x, y, 5), col),
  () => '',
];
// Эмблема: буква в круге, ромб, звезда, кольца.
function emblem(k: number, x: number, y: number, col: string, title: string): string {
  if (k === 0) return circle(x, y, 11, 'none', sk(col, 1.2)) + txt(fit(initial(title), F.serif, { maxW: 14, max: 12 }), x, y + 4.3, col, 'middle');
  if (k === 1) return path(`M${n(x)} ${n(y - 12)}l12 12-12 12-12-12z`, 'none', sk(col, 1.2)) + path(`M${n(x)} ${n(y - 5)}l5 5-5 5-5-5z`, col);
  if (k === 2) return path(star4(x, y, 12), col);
  return circle(x, y, 10, 'none', sk(col, 1)) + circle(x, y, 6.5, 'none', sk(col, 1)) + circle(x, y, 2.2, col);
}
// Набор линеек от x до правого края: двойная с тонкой, толстая с тонкой, точки между тонкими, три тонкие.
function rules(k: number, x: number, y: number, col: string): string {
  const h = (dy: number, sw: number, e = '') => stroke(`M${n(x)} ${n(y + dy)}H${W}`, col, sw, e);
  return k === 0 ? h(0, 1.6) + h(3, 0.6) + h(6, 1.6) : k === 1 ? h(0, 3) + h(5, 0.8) : k === 2 ? h(0, 0.8) + h(4, 2.4, ' stroke-dasharray="0 6" stroke-linecap="round"') + h(8, 0.8) : h(0, 1) + h(3.5, 1) + h(7, 1);
}

export const cloth: Style = {
  id: 'cloth',
  name: 'Переплёт',
  variants: ['Рамка', 'Наклейка', 'Блинт', 'Линейки', 'Тиснение'],
  w: 2,
  sp: 0.6,
  draw(c) {
    const { r, v, L, R, cx, cw, id } = c;
    // Ткань — краска Вады, приглушённая, как выцветший коленкор; вторая краска пары — для тиснения и кожи.
    const [c1, c2] = shuffle(r, wada(r, 2));
    const base = mix(lum(c1) > 0.45 ? dark(c1, 0.25) : c1, '#4a4238', rand(r, 0.06, 0.25));
    const mat = pick(r, ['cloth', 'cloth', 'leather', 'paper'] as const);
    const foil = lightOn(base, pick(r, FOIL));
    const deep = dark(base, 0.35);
    const leath = dark(mix(c2, '#3a2418', 0.4), 0.3);
    const font = pick(r, [F.serif, F.old, F.didone, caps(F.antique, 0.1), F.serif]);
    const af = pick(r, [AUTHOR, caps(F.serif, 0.08), caps(F.old, 0.1)]);
    // Элементы выбираются независимо: вид рамки, украшения углов, разделитель, эмблема, линейки, форма наклейки.
    const fk = int(r, 0, 5);
    const ok = int(r, 0, 4);
    const mid = MIDS[int(r, 0, 4)];
    const ek = int(r, 0, 3);
    const lk = int(r, 0, 5);
    const x0 = L - 4;
    const w0 = R - L + 8;
    const t = (b: Box, o: Partial<TextOpts> = {}) => texts(c, b, { font, max: 24, color: foil, af, as: 9, mid: (y, x) => mid(x, y, foil), ...o });
    // Наклейка формы lk; у овала текст уже, чтобы не вылезал за край.
    const label = (lx: number, ly: number, lw: number, lh: number, fill: string, line: string, ink: string, max = 22) =>
      path(lab(lk, lx + 1.2, ly + 1.5, lw, lh), '#000', op(0.25)) +
      path(lab(lk, lx, ly, lw, lh), fill) +
      path(lab(lk, lx + 5, ly + 5, lw - 10, lh - 10), 'none', sk(line, 0.9)) +
      texts(c, { x: lx + (lk === 4 ? lw * 0.17 : 12), y: ly + 12, w: lk === 4 ? lw * 0.66 : lw - 24, h: lh - 24 }, { font, max, lines: 4, color: ink, af, as: 8.5 });
    let body = '';
    if (v === 0) {
      // Рамка любого вида, иногда украшения в углах и эмблема внизу.
      const y0 = pick(r, [12, 16, 22]);
      const e = r() < 0.4;
      body = box(fk, x0, y0, w0, H - 2 * y0, foil) + orns(ok, x0, y0, w0, H - 2 * y0, foil) + t({ x: L + 10, y: y0 + 34, w: cw - 20, h: H - 2 * y0 - 68 - (e ? 36 : 0) }, { gap: 28 }) + (e ? emblem(ek, cx, H - y0 - 30, foil, c.title) : '');
    } else if (v === 1) {
      // Наклейка: бумажная или тёмная кожаная с золотом, любой формы, разного размера и высоты;
      // ниже — линейки, или рамка по всей крышке, или ничего.
      const lw = Math.min(cw - 6, rand(r, 112, 150));
      const lh = rand(r, 84, 124);
      const ly = rand(r, 44, 110);
      const dl = r() < 0.35;
      const p = dl ? leath : paper(r);
      const ink = dl ? lightOn(p, pick(r, FOIL)) : dark(base, 0.3);
      const extra = int(r, 0, 2);
      body = label(cx - lw / 2, ly, lw, lh, p, mix(ink, p, 0.4), ink) + (extra === 0 ? rules(int(r, 0, 3), x0 - 2, H - 44, foil) : extra === 1 ? box(fk, x0, 14, w0, H - 28, foil) : '');
    } else if (v === 2) {
      // Блинт: вдавленная кайма, внутренняя рамка и украшения углов тоном ткани; название золотом.
      const hi = light(base, 0.18);
      body =
        frame(x0 - 2, 12, w0 + 4, 276, deep, 2.6) +
        frame(x0 - 0.8, 13.2, w0 + 4, 276, hi, 1, op(0.5)) +
        box(fk, x0 + 10, 24, w0 - 16, 252, deep) +
        orns(ok, x0 + 10, 24, w0 - 16, 252, deep) +
        t({ x: L + 14, y: 46, w: cw - 28, h: 208 }, { at: 'split', mid: undefined });
    } else if (v === 3) {
      // Линейки одного набора на разной высоте; эмблема внизу или нет.
      const rk = int(r, 0, 3);
      const hi = r() < 0.35;
      const e = r() < 0.6;
      body =
        rules(rk, x0 - 2, hi ? 22 : 30, foil) +
        rules(rk, x0 - 2, hi ? 74 : 262, foil) +
        t({ x: L + 4, y: hi ? 96 : 56, w: cw - 8, h: hi ? (e ? 130 : 170) : e ? 150 : 190 }, { max: 27, as: 10, authorFirst: r() < 0.5, gap: 22 }) +
        (e ? emblem(ek, cx, hi ? 254 : 232, foil, c.title) : '');
    } else {
      // Тиснение: мотив по всей обложке — мелкий или такой крупный, что видна только часть; название в картуше любой формы.
      // Мотив вдавлен в ткань или оттиснут второй краской пары, полупрозрачно.
      const ink = r() < 0.6 ? deep : mix(c2, base, 0.45);
      const k = pick(r, [10, 14, 20, 30, 44]);
      const h = k / 2;
      const sw = n(k * 0.1);
      const motif = pick(r, [
        `<path d="M${h} ${n(k * 0.1)}L${n(k * 0.9)} ${h} ${h} ${n(k * 0.9)} ${n(k * 0.1)} ${h}z" fill="none" stroke="${ink}" stroke-width="${sw}"/>`,
        `<circle cx="${h}" cy="${h}" r="${n(k / 5)}" fill="${ink}"/>`,
        `<path d="M0 0L${k} ${k}M${k} 0L0 ${k}" stroke="${ink}" stroke-width="${sw}"/>`,
        path(blade(k * 0.15, k * 0.85, k, k * 0.22, -0.8), ink),
        path(star4(h, h, k * 0.4), ink),
      ]);
      const ch = rand(r, 110, 140);
      body =
        pattern(id + 'm', k, k, motif, ` x="${n(rand(r, 0, k))}" y="${n(rand(r, 0, k))}"`) +
        rect(0, 0, W, H, `url(#${id}m)`, op(rand(r, 0.45, 0.85))) +
        label(L - 2, rand(r, 70, 100), cw + 4, ch, base, foil, foil);
    }
    return {
      // Свет сверху справа: у кожи сильнее.
      svg: bg(base) + `<radialGradient id="${id}l" cx=".6" cy=".35" r=".8"><stop offset="0" stop-color="#fff" stop-opacity=".1"/><stop offset="1" stop-color="#000" stop-opacity="${mat === 'leather' ? 0.25 : 0.14}"/></radialGradient>` + rect(0, 0, W, H, `url(#${id}l)`) + body,
      tex: mat === 'paper' ? 'grain' : mat,
      spine: r() < 0.7 ? 'leather' : 'cloth',
      sc: pick(r, [dark(base, 0.5), leath, '#3a2418']),
      corners: r() < 0.45,
      age: 0.9,
      base,
    };
  },
};

// Золото на светлой ткани не видно — тогда тёмная краска; близкая по светлоте фольга — светлее.
const lightOn = (base: string, foil: string) => (on(base) === '#1d1b19' ? dark(base, 0.65) : Math.abs(lum(foil) - lum(base)) < 0.2 ? light(foil, 0.45) : foil);

// ============ Мраморная бумага ============

export const marble: Style = {
  id: 'marble',
  name: 'Мрамор',
  variants: ['Волна'],
  sp: 0.85,
  draw(c) {
    const { r, L, cw } = c;
    // Краски — сочетание Вады или близкие оттенки одной краски; светлая повторяется, чтобы узор дышал.
    // Большими полосами яркие краски режут глаз — приглушаем к общему тёплому тону.
    const w = palette(r, pick(r, [3, 4] as const), 0.4).map((x) => mix(x, '#7d705e', 0.2));
    const colors = r() < 0.5 ? shuffle(r, [...w, w.at(-1)!]) : [...w, ...w.slice(1, -1).reverse()];
    const art = bg(colors[1]) + combedWave(r, colors);
    const lw = Math.min(cw, 128);
    const lx = L + (cw - lw) / 2;
    const ly = rand(r, 40, 70);
    const lh = rand(r, 80, 100);
    const p = paper(r);
    const ink = '#2a2420';
    const font = pick(r, [F.serif, F.old, F.didone]);
    // Наклейка любой формы; у овала текст уже.
    const k = int(r, 0, 5);
    const label =
      path(lab(k, lx + 1.5, ly + 1.5, lw, lh), '#000', op(0.25)) +
      path(lab(k, lx, ly, lw, lh), p) +
      path(lab(k, lx + 4, ly + 4, lw - 8, lh - 8), 'none', sk(ink, 0.8) + op(0.6)) +
      texts(c, { x: lx + (k === 4 ? lw * 0.18 : 11), y: ly + 11, w: k === 4 ? lw * 0.64 : lw - 22, h: lh - 22 }, { font, max: 18, lines: 4, color: ink, as: 8, gap: 9 });
    // Полукожаный переплёт: полоса корешка и уголки — кожа.
    return { svg: art + label, tex: 'grain', spine: 'leather', sc: mix(byLum(w)[0], '#2a1a10', 0.6), corners: r() < 0.75, age: 0.9, base: colors[0] };
  },
};

// Волна: тонкие полосы, которые идут вверх и вниз (французский «каскад»).
function combedWave(r: () => number, colors: string[]): string {
  let out = '';
  // Мелкий гребень или крупная волна, из которой видна часть.
  const k = int(r, 8, 22);
  const amp = rand(r, 15, 70);
  const f = rand(r, 0.01, 0.04);
  for (let i = 0; i <= k; i++) {
    const x0 = (i / k) * (W + 40) - 20;
    const p: Pt[] = [];
    for (let y = -20; y <= H + 30; y += 25) p.push([x0 + amp * Math.sin(y * f + i * 0.35) * (0.6 + 0.4 * Math.sin(y * 0.05)), y]);
    out += path(smooth(p, false) + `L${W + 60} ${H + 20}L${W + 60} -20Z`, colors[i % colors.length]);
  }
  return out;
}

// ============ Издательская серия ============

export const series: Style = {
  id: 'series',
  name: 'Серия',
  variants: ['Три полосы', 'Окно', 'Плашка', 'Колонка'],
  draw(c) {
    const { r, v, L, R, cx, cw } = c;
    const col = wadaColor(r, 0.05, 0.38);
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
        pattern(c.id + 'd', k, k, pick(r, [`<circle cx="4" cy="4" r="1.8" fill="${p}"/>`, `<path d="M0 8L4 2 8 8z" fill="${p}"/>`, `<path d="M0 4h8" stroke="${p}" stroke-width="2"/>`]), ` patternTransform="scale(${pick(r, [0.8, 1, 1.5, 2.2])})"`) +
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
    return { svg, tex: 'grain', age: 0.7, base: col };
  },
};

// ============ Печать 60-х: две краски, наложение, сбитая приводка ============

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
  variants: ['Фигуры', 'Полосы'],
  draw(c) {
    const { r, v, L, R, cw, id } = c;
    // Две краски — тёмные из тройки Вады: на бумаге и при наложении они видны.
    const [i1, i2] = shuffle(r, byLum(wada(r, 3)).slice(0, 2));
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
    } else {
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
        `<g transform="${off}">${circle(R - 30, y0 + 120, 34, 'none', sk(k, 1.6))}</g>`;
    }
    return { svg, tex: 'grain', age: 0.8, base: p };
  },
};

