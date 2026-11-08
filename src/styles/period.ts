// Эпохи и страны — абстрактно, как обложки серий: ар-деко, модерн, античность, манускрипт,
// Восток, звёздная геометрия, машинопись, ретрофантастика.
import { H, W, dark, light, n, on, pal, pick, poly, rand, int, smooth, shuffle, type Pt } from '../core.ts';
import { F, caps, fit, measure, txt } from '../text.ts';
import { GOLD, bg, circle, clip, frame, initial, path, pattern, rect, stroke, texts, type Style } from '../cover.ts';

// ============ Ар-деко ============

const DECO_BG = pal('1b2430 12201c 2a1622 1c1c1c 0f2a3a 3a2a1a 23303a 2e1f33');
const DECO_LINE = pal('d4b06a d4b06a c8c8c0 efe2c4 5fa48a e08a6a');

export const deco: Style = {
  id: 'deco',
  name: 'Ар-деко',
  variants: ['Веер', 'Лучи', 'Ступени', 'Арки'],
  draw(c) {
    const { r, v, L, R, cx, cw } = c;
    const b = pick(r, DECO_BG);
    const f = pick(r, DECO_LINE);
    const font = pick(r, [caps(F.antique, 0.14), F.didone, caps(F.narrow, 0.16)]);
    const af = caps(F.antique, 0.2);
    let art = '';
    let tb = { x: L + 6, y: 26, w: cw - 12, h: 96 };
    if (v === 0) {
      // Веер из центра снизу: лучи и дуги.
      const k = int(r, 7, 11);
      for (let i = 0; i <= k; i++) {
        const a = Math.PI + (i / k) * Math.PI;
        art += stroke(`M${n(cx)} ${H}L${n(cx + 150 * Math.cos(a))} ${n(H + 150 * Math.sin(a))}`, f, 1.4);
      }
      for (const rr of [44, 80, 116, 146]) art += path(`M${n(cx - rr)} ${H}a${rr} ${rr} 0 0 1 ${2 * rr} 0`, 'none', ` stroke="${f}" stroke-width="${rr === 50 ? 3 : 1.4}"`);
      art += path(`M${n(cx - 30)} ${H}a30 30 0 0 1 60 0Z`, f);
    } else if (v === 1) {
      // Солнце: лучи-клинья вокруг круга, название под ним.
      const cy = rand(r, 100, 120);
      const k = 24;
      let d = '';
      for (let i = 0; i < k; i += 2) {
        const a0 = (i / k) * 2 * Math.PI;
        const a1 = ((i + 1) / k) * 2 * Math.PI;
        d += `M${n(cx)} ${n(cy)}L${n(cx + 260 * Math.cos(a0))} ${n(cy + 260 * Math.sin(a0))}L${n(cx + 260 * Math.cos(a1))} ${n(cy + 260 * Math.sin(a1))}Z`;
      }
      art = path(d, light(b, 0.08)) + circle(cx, cy, 40, b) + circle(cx, cy, 40, 'none', ` stroke="${f}" stroke-width="2"`) + circle(cx, cy, 32, 'none', ` stroke="${f}" stroke-width=".9"`) + circle(cx, cy, 6, f);
      const py = cy + 58;
      art += rect(L - 2, py, cw + 4, H - py - 18, b) + frame(L - 2, py, cw + 4, H - py - 18, f, 1.4);
      tb = { x: L + 8, y: py + 12, w: cw - 16, h: H - py - 42 };
    } else if (v === 2) {
      // Ступени: зиккурат из рамок вокруг названия.
      for (let i = 0; i < 3; i++) {
        const k = i * 8;
        art += path(`M${n(L - 4 + k)} ${n(H - 20)}V${n(80 + k)}h${n(18)}v-${n(14)}h${n(cw + 8 - 2 * k - 36)}v${n(14)}h${n(18)}V${n(H - 20)}`, 'none', ` stroke="${f}" stroke-width="${i ? 1 : 2}"`);
      }
      art += stroke(`M${n(cx)} 20V58M${n(cx - 10)} 30V58M${n(cx + 10)} 30V58`, f, 1.4);
      tb = { x: L + 26, y: 110, w: cw - 52, h: 150 };
    } else {
      // Арки: вложенные арки дверного проёма.
      for (let i = 0; i < 5; i++) {
        const w = cw - i * 18;
        const top = 70 + i * 16;
        art += path(`M${n(cx - w / 2)} ${H}V${n(top + w / 2)}a${n(w / 2)} ${n(w / 2)} 0 0 1 ${n(w)} 0V${H}`, 'none', ` stroke="${i % 2 ? light(f, 0.3) : f}" stroke-width="${i ? 1.2 : 2.4}"`);
      }
      tb = { x: L + 30, y: 150, w: cw - 60, h: 120 };
    }
    return {
      svg: bg(b) + art + texts(c, tb, { font, max: 22, lines: 4, color: light(f, 0.25), af, as: 8.5, ac: f, gap: 12 }) + stroke(`M${n(L - 4)} 12H${n(R + 4)}`, f, 1),
      tex: 'grain',
      spine: r() < 0.5 ? 'leather' : 'tone',
      sc: dark(b, 0.3),
      age: 0.4,
      base: b,
    };
  },
};

// ============ Модерн (ар-нуво) ============

const NOUV_BG = pal('d9cfb3 c7cfb7 e2d3c3 b9c4b5 d6c2b2 cfc6a8 e4dcc4');
const NOUV_INK = pal('4a5a3c 5c3d2e 3d4a5c 6a4a5c 3a3a2c');
const NOUV_ACC = pal('b5764a 8a9a5b c49a3c 9b5d6b 6a8a8a');

export const nouveau: Style = {
  id: 'nouveau',
  name: 'Модерн',
  variants: ['Арка', 'Стебли', 'Рама'],
  draw(c) {
    const { r, v, L, cx, cw, id } = c;
    const b = pick(r, NOUV_BG);
    const ink = pick(r, NOUV_INK);
    const acc = pick(r, NOUV_ACC);
    const font = pick(r, [caps(F.antique, 0.1), F.slav, F.old]);
    // Стебель: вертикальная волна с бутоном наверху.
    const stem = (x: number, y0: number, y1: number, amp: number, ph: number) => {
      const p: Pt[] = [];
      for (let y = y1; y >= y0; y -= 20) p.push([x + amp * Math.sin(y * 0.045 + ph), y]);
      const [tx, ty] = p[p.length - 1];
      return stroke(smooth(p, false), ink, 1.8) + circle(tx, ty - 5, 6, acc) + circle(tx, ty - 5, 6, 'none', ` stroke="${ink}" stroke-width="1.2"`);
    };
    let art = '';
    let tb = { x: L + 4, y: 212, w: cw - 8, h: 72 };
    if (v === 0) {
      // Арка: окно с полукруглым верхом, в нём стебли.
      const w = cw - 4;
      const x0 = cx - w / 2;
      const top = 22;
      const bot = 196;
      const arch = `M${n(x0)} ${bot}V${n(top + w / 2)}a${n(w / 2)} ${n(w / 2)} 0 0 1 ${n(w)} 0V${bot}Z`;
      let stems = '';
      const k = int(r, 3, 5);
      for (let i = 0; i < k; i++) stems += stem(x0 + ((i + 0.5) / k) * w, rand(r, top + 30, top + 80), bot, rand(r, 4, 10), rand(r, 0, 6));
      art = path(arch, light(b, 0.3)) + clip(id + 'a', arch, stems) + path(arch, 'none', ` stroke="${ink}" stroke-width="2.4"`) + path(arch, 'none', ` stroke="${ink}" stroke-width=".8" transform="translate(${n(cx)} ${n((top + bot) / 2)}) scale(.92) translate(${n(-cx)} ${n(-(top + bot) / 2)})"`);
    } else if (v === 1) {
      // Стебли поперёк всей обложки, название в картуше.
      for (let i = 0; i < 6; i++) art += stem(rand(r, 0, W), rand(r, 10, 120), H + 10, rand(r, 8, 20), rand(r, 0, 6));
      const py = rand(r, 140, 170);
      art += path(`M${n(L)} ${n(py)}h${n(cw)}a14 14 0 0 1 0 28v${n(52)}a14 14 0 0 1 0 28h${n(-cw)}a14 14 0 0 1 0-28v-52a14 14 0 0 1 0-28z`, light(b, 0.4), ` stroke="${ink}" stroke-width="1.6"`);
      tb = { x: L + 8, y: py + 12, w: cw - 16, h: 84 };
    } else {
      // Рама: кайма из дуг по краям.
      const k = 14;
      art =
        pattern(id + 'f', k, k, `<path d="M0 ${k}a${k / 2} ${k / 2} 0 0 1 ${k} 0" fill="none" stroke="${ink}" stroke-width="1.6"/><circle cx="${k / 2}" cy="${k * 0.7}" r="2" fill="${acc}"/>`) +
        rect(L - 8, 14, cw + 16, H - 28, `url(#${id}f)`) +
        rect(L + 6, 28, cw - 12, H - 56, b) +
        frame(L + 6, 28, cw - 12, H - 56, ink, 1.6);
      tb = { x: L + 18, y: 50, w: cw - 36, h: 200 };
      return { svg: bg(b) + art + texts(c, tb, { font, max: 22, color: ink, af: caps(F.antique, 0.16), ac: dark(acc, 0.2), at: 'split' }), tex: 'grain', spine: 'cloth', sc: dark(b, 0.45), age: 0.8, base: b };
    }
    return { svg: bg(b) + art + texts(c, tb, { font, max: 20, lines: 3, color: ink, af: caps(F.antique, 0.16), ac: dark(acc, 0.2) }), tex: 'grain', spine: 'cloth', sc: dark(b, 0.45), age: 0.8, base: b };
  },
};

// ============ Античность ============

// Меандр (греческий ключ) — плитка шириной k.
const meander = (k: number, col: string, sw: number) =>
  `<path d="M0 ${n(k * 0.9)}H${n(k * 0.8)}V${n(k * 0.1)}H${n(k * 0.2)}V${n(k * 0.7)}H${n(k * 0.6)}V${n(k * 0.3)}H${n(k * 0.4)}" fill="none" stroke="${col}" stroke-width="${n(sw)}"/><path d="M${n(k * 0.8)} ${n(k * 0.9)}H${k}" stroke="${col}" stroke-width="${n(sw)}"/>`;

export const antique: Style = {
  id: 'antique',
  name: 'Античность',
  variants: ['Меандр', 'Колонны', 'Медальон', 'Фриз'],
  draw(c) {
    const { r, v, L, R, cx, cw, id } = c;
    const black = r() < 0.4;
    const terra = pick(r, ['#c06a3d', '#b5562f', '#c47a45', '#a84c32']);
    const b = black ? '#1f1a17' : pick(r, ['#ecdcc0', '#e8d5b5', '#efe4cf']);
    const f = black ? terra : '#2a211c';
    const font = caps(F.antique, 0.12);
    const k = 22;
    const band = (y: number, col: string) => pattern(id + 'm' + y, k, k, meander(k, col, 2.6), ` y="${y}"`) + rect(0, y, W, k, `url(#${id}m${y})`);
    let art = '';
    let tb = { x: L, y: 70, w: cw, h: 160 };
    if (v === 0) {
      art = band(22, f) + band(H - 44, f) + stroke(`M0 16H${W}M0 50H${W}M0 ${H - 50}H${W}M0 ${H - 16}H${W}`, f, 1.6);
    } else if (v === 1) {
      // Колонны с каннелюрами, название на архитраве.
      const cols = 3;
      const w = 26;
      for (let i = 0; i < cols; i++) {
        const x = L + ((i + 0.5) / cols) * cw - w / 2;
        art += rect(x - 4, 116, w + 8, 8, f) + rect(x, 124, w, 140, f, ' opacity=".9"') + stroke(`M${n(x + 6)} 128V260M${n(x + 13)} 128V260M${n(x + 20)} 128V260`, b, 1.6) + rect(x - 4, 264, w + 8, 8, f);
      }
      art += rect(L - 10, 100, cw + 20, 10, f) + path(`M${n(L - 10)} 96L${n(cx)} 62L${n(R + 10)} 96Z`, 'none', ` stroke="${f}" stroke-width="2"`) + rect(0, 276, W, 6, f);
      tb = { x: L, y: 14, w: cw, h: 44 };
      return { svg: bg(b) + art + texts(c, { ...tb, h: 40 }, { font, max: 16, lines: 2, color: f, as: 7.5, af: caps(F.antique, 0.2), gap: 4 }), tex: 'grain', spine: 'tone', age: 0.8, base: b };
    } else if (v === 2) {
      // Медальон: круг с точками, буква в середине.
      const cy = 96;
      let dots = '';
      for (let i = 0; i < 28; i++) dots += circle(cx + 54 * Math.cos((i / 28) * 6.283), cy + 54 * Math.sin((i / 28) * 6.283), 2, f);
      art = circle(cx, cy, 62, 'none', ` stroke="${f}" stroke-width="2"`) + dots + circle(cx, cy, 46, 'none', ` stroke="${f}" stroke-width="1"`) + txt(fit(initial(c.title), F.antique, { maxW: 60, max: 54 }), cx, cy + 19, f, 'middle') + band(H - 40, f);
      tb = { x: L, y: 170, w: cw, h: 84 };
    } else {
      // Фриз: полосы с треугольниками и волнами, как на вазе.
      const t = 12;
      art =
        pattern(id + 't', t, t, `<path d="M0 ${t}L${t / 2} 1L${t} ${t}z" fill="${f}"/>`, ' y="40"') +
        pattern(id + 'w', 16, 12, `<path d="M0 8c4 0 4-6 8-6s4 6 8 6" fill="none" stroke="${f}" stroke-width="2.2"/>`, ' y="250"') +
        rect(0, 28, W, 6, f) +
        rect(0, 40, W, t, `url(#${id}t)`) +
        rect(0, 58, W, 3, f) +
        rect(0, 240, W, 3, f) +
        rect(0, 250, W, 12, `url(#${id}w)`) +
        rect(0, 268, W, 6, f);
      tb = { x: L, y: 76, w: cw, h: 150 };
    }
    return { svg: bg(b) + art + texts(c, tb, { font, max: 22, color: f, af: caps(F.antique, 0.2), as: 9, gap: 14 }), tex: 'grain', spine: 'tone', age: 0.8, base: b };
  },
};

// ============ Манускрипт ============

const PARCH = pal('eadbb8 e8d6ae efe3c6 e6d3a8');
const INK2 = pal('a8322a 2c4a8a 3e6b3a');

export const manuscript: Style = {
  id: 'manuscript',
  name: 'Манускрипт',
  variants: ['Буквица', 'Кайма', 'Плетёнка'],
  draw(c) {
    const { r, v, L, R, cx, cw, id } = c;
    const b = pick(r, PARCH);
    const [c1, c2] = shuffle(r, INK2);
    const k = '#2a2018';
    const font = pick(r, [F.slav, F.old, F.didone]);
    const af = caps(F.old, 0.1);
    let art = '';
    let tb = { x: L + 4, y: 150, w: cw - 8, h: 120 };
    if (v === 0) {
      // Буквица: квадрат с золотой рамкой и большой буквой.
      const s = Math.min(96, cw - 20);
      const x = cx - s / 2;
      const y = 34;
      const ch = fit(initial(c.title), F.slav, { maxW: s - 24, max: 76 })!;
      art = rect(x, y, s, s, c2) + frame(x + 4, y + 4, s - 8, s - 8, GOLD, 2) + frame(x, y, s, s, k, 1.4) + txt(ch, cx, y + s / 2 + ch.size * 0.36, GOLD, 'middle') + circle(x, y, 5, c1) + circle(x + s, y, 5, c1) + circle(x, y + s, 5, c1) + circle(x + s, y + s, 5, c1);
      art += stroke(`M${n(L)} 146H${n(R)}`, c1, 1) + stroke(`M${n(L)} 276H${n(R)}`, c1, 1);
    } else if (v === 1) {
      // Кайма из цветных кусков с квадратами в углах.
      const seg = 18;
      let d1 = '';
      let d2 = '';
      const x0 = L - 6;
      const x1 = R + 4;
      for (let y = 14; y < H - 14; y += seg) ((y / seg) % 2 < 1 ? (d1 += `M${n(x0)} ${y}v${seg}M${n(x1)} ${y}v${seg}`) : (d2 += `M${n(x0)} ${y}v${seg}M${n(x1)} ${y}v${seg}`));
      for (let x = x0; x < x1; x += seg) ((x / seg) % 2 < 1 ? (d1 += `M${n(x)} 14h${seg}M${n(x)} ${H - 14}h${seg}`) : (d2 += `M${n(x)} 14h${seg}M${n(x)} ${H - 14}h${seg}`));
      art = clip(id + 'b', `M${n(x0 - 4)} 10H${n(x1 + 4)}V${H - 10}H${n(x0 - 4)}Z`, stroke(d1, c1, 6) + stroke(d2, c2, 6));
      for (const [x, y] of [
        [x0, 14],
        [x1, 14],
        [x0, H - 14],
        [x1, H - 14],
      ])
        art += rect(x - 6, y - 6, 12, 12, GOLD) + frame(x - 6, y - 6, 12, 12, k, 1);
      tb = { x: L + 12, y: 50, w: cw - 24, h: 200 };
    } else {
      // Плетёнка: две ленты, переплетённые вдоль левого края.
      const x = L + 8;
      const a: Pt[] = [];
      const bb: Pt[] = [];
      for (let y = -10; y <= H + 10; y += 9) {
        a.push([x + 9 * Math.sin(y * 0.13), y]);
        bb.push([x - 9 * Math.sin(y * 0.13), y]);
      }
      art = stroke(smooth(a, false), k, 6.5) + stroke(smooth(a, false), c1, 4) + stroke(smooth(bb, false), k, 6.5) + stroke(smooth(bb, false), c2, 4);
      tb = { x: L + 28, y: 40, w: cw - 30, h: 220 };
      return { svg: bg(b) + art + texts(c, tb, { font, max: 22, lines: 5, color: k, af, ac: c1, as: 9, align: 'start', at: 'split' }), tex: 'grain', spine: 'leather', sc: '#4a2a1a', age: 1, base: b };
    }
    return { svg: bg(b) + art + texts(c, tb, { font, max: 22, color: k, af, ac: c1, as: 9 }), tex: 'grain', spine: 'leather', sc: pick(r, ['#4a2a1a', '#2c2018', '#5a1f1f']), age: 1, base: b };
  },
};

// ============ Восток ============

const EAST_BG = pal('efe6d2 e4e1d8 26365a 1f1f1f e9dcc6 2f3e3a');
const EAST_ACC = pal('c8462f c49a45 d0623e b8443a');

export const east: Style = {
  id: 'east',
  name: 'Восток',
  variants: ['Солнце', 'Волны', 'Решётка', 'Облака'],
  draw(c) {
    const { r, v, L, R, cx, cw, id } = c;
    const b = pick(r, EAST_BG);
    const darkBg = on(b) !== '#1d1b19';
    const ink = darkBg ? '#ece4d2' : '#26365a';
    const acc = pick(r, EAST_ACC);
    const font = pick(r, [F.serif, F.antique, caps(F.narrow, 0.1)]);
    let art = '';
    let tb = { x: L, y: 20, w: cw, h: 90 };
    let at: 'top' | 'bottom' = 'top';
    if (v === 0) {
      const cy = rand(r, 150, 180);
      art = circle(cx + rand(r, -20, 20), cy, rand(r, 46, 60), acc);
      for (let i = 0; i < 4; i++) {
        const y = cy - 30 + i * 26 + rand(r, -6, 6);
        const x = rand(r, -40, 80);
        const w = rand(r, 90, 150);
        art += rect(x, y, w, 12, ink, ` rx="6" opacity="${darkBg ? 0.85 : 0.9}"`);
      }
    } else if (v === 1) {
      // Волны-чешуйки в нижней половине.
      // Сейгайха: веера из колец, каждый ряд ложится на предыдущий.
      const s = 15;
      const fan = (x: number, y: number) => [1, 0.75, 0.5, 0.25].map((m, i) => `<circle cx="${n(x)}" cy="${n(y)}" r="${n(s * m)}" fill="${i % 2 ? b : ink}"/>`).join('');
      const y0 = rand(r, 150, 190);
      art =
        pattern(id + 'w', 2 * s, s, fan(0, s / 2) + fan(2 * s, s / 2) + fan(s, s) + fan(0, 1.5 * s) + fan(2 * s, 1.5 * s), ` y="${n(y0)}"`) +
        rect(0, y0, W, H - y0, `url(#${id}w)`) +
        circle(R - 26, rand(r, 120, y0 - 26), 14, acc);
    } else if (v === 2) {
      // Решётка из тонких реек, одна клетка цветная.
      const xs = [L - 6, L + cw * 0.38, L + cw * 0.62, R + 4];
      const ys = [134, 170, 214, 250, 286];
      const ci = int(r, 0, 2);
      const cj = int(r, 0, 3);
      art = rect(xs[ci], ys[cj], xs[ci + 1] - xs[ci], ys[cj + 1] - ys[cj], acc);
      art += stroke(xs.map((x) => `M${n(x)} 134V286`).join('') + ys.map((y) => `M${n(L - 6)} ${y}H${n(R + 4)}`).join(''), ink, 2.2);
    } else {
      // Облака: полосы тумана и косые линии ветра.
      for (let i = 0; i < 5; i++) {
        const y = 120 + i * 32;
        const x = rand(r, -60, 100);
        art += rect(x, y, rand(r, 80, 140), 16, i % 2 ? acc : ink, ` rx="8" opacity="${i % 2 ? 0.9 : 0.25}"`);
      }
      let d = '';
      for (let i = 0; i < 9; i++) {
        const x = rand(r, L, R);
        const y = rand(r, 120, 260);
        d += `M${n(x)} ${n(y)}l-12 26`;
      }
      art += stroke(d, ink, 1.2);
    }
    if (v === 0 && r() < 0.5) {
      tb = { x: L, y: 220, w: cw, h: 64 };
      at = 'bottom';
    }
    return { svg: bg(b) + art + texts(c, tb, { font, max: 22, lines: 3, color: ink, align: 'start', at, ac: darkBg ? acc : dark(acc, 0.1), gap: 7 }), tex: 'grain', spine: 'cloth', sc: darkBg ? dark(b, 0.4) : '#26365a', age: 0.5, base: b };
  },
};

// ============ Звёздная геометрия ============

const GIRIH = [pal('22407a 2a8c8c f2eee4 d4a24c'), pal('2f5e4e d4a24c f0e8d6 b4553a'), pal('1d3557 e9c46a f1faee e76f51'), pal('5a2a2a d9b26f efe6d6 2a7a7a'), pal('23395b 9fc4c4 f4efe2 c0843a')];

// Звезда {n/k}: n вершин через k.
function star(cx: number, cy: number, R: number, nn: number, k: number, rot = 0): string {
  let d = '';
  const pts: Pt[] = [];
  for (let i = 0; i < nn; i++) {
    const a = rot + (i / nn) * 2 * Math.PI;
    pts.push([cx + R * Math.cos(a), cy + R * Math.sin(a)]);
  }
  const g0 = gcd(nn, k);
  for (let s = 0; s < g0; s++) {
    const p: Pt[] = [];
    for (let i = 0; i < nn / g0; i++) p.push(pts[(s + i * k) % nn]);
    d += poly(p);
  }
  return d;
}
const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);

export const girih: Style = {
  id: 'girih',
  name: 'Звёзды',
  variants: ['Розетка', 'Плитка', 'Арка'],
  draw(c) {
    const { r, v, L, cx, cw, id } = c;
    const [d0, d1, p0, a0] = pick(r, GIRIH);
    const font = pick(r, [caps(F.antique, 0.1), F.serif, F.old]);
    let art = '';
    let tb = { x: L, y: 200, w: cw, h: 80 };
    let b = d0;
    let ink = p0;
    if (v === 0) {
      const cy = 104;
      const nn = pick(r, [8, 10, 12, 16]);
      const k = nn === 8 ? 3 : nn === 10 ? 3 : nn === 12 ? 5 : 7;
      art =
        circle(cx, cy, 80, d1) +
        path(star(cx, cy, 76, nn, k, -Math.PI / 2), 'none', ` stroke="${p0}" stroke-width="3" stroke-linejoin="round"`) +
        path(star(cx, cy, 40, nn, k - 1 || 2, -Math.PI / 2 + Math.PI / nn), a0, ` stroke="${d0}" stroke-width="2" fill-rule="evenodd"`) +
        circle(cx, cy, 8, d0) +
        circle(cx, cy, 80, 'none', ` stroke="${a0}" stroke-width="2"`);
    } else if (v === 1) {
      // Плитка: восьмиконечные звёзды в узлах решётки.
      const s = pick(r, [40, 50]);
      const body = path(star(s / 2, s / 2, s * 0.42, 8, 3), d1, ` stroke="${p0}" stroke-width="2" stroke-linejoin="round" fill-rule="nonzero"`) + circle(s / 2, s / 2, s * 0.12, a0) + path(star(0, 0, s * 0.42, 8, 3) + star(s, 0, s * 0.42, 8, 3) + star(0, s, s * 0.42, 8, 3) + star(s, s, s * 0.42, 8, 3), 'none', ` stroke="${p0}" stroke-width="2"`);
      art = pattern(id + 'p', s, s, body, ` x="${n(cx - s / 2)}"`) + rect(0, 0, W, H, `url(#${id}p)`) + rect(L - 6, 196, cw + 12, 84, d0) + frame(L - 2, 200, cw + 4, 76, a0, 1.6);
      tb = { x: L + 6, y: 208, w: cw - 12, h: 62 };
    } else {
      // Стрельчатая арка, внутри — узор.
      const s = 30;
      const w = cw - 4;
      const x0 = cx - w / 2;
      const top = 24;
      const bot = 200;
      const arch = `M${n(x0)} ${bot}V${n(top + w * 0.55)}Q${n(x0)} ${top + 10} ${n(cx)} ${top}Q${n(x0 + w)} ${top + 10} ${n(x0 + w)} ${n(top + w * 0.55)}V${bot}Z`;
      b = p0;
      ink = d0;
      art =
        pattern(id + 'p', s, s, path(star(s / 2, s / 2, s * 0.45, 8, 3), a0, ` stroke="${d0}" stroke-width="1.6"`), ` x="${n(cx - s / 2)}"`) +
        path(arch, d1) +
        path(arch, `url(#${id}p)`) +
        path(arch, 'none', ` stroke="${d0}" stroke-width="5"`) +
        path(arch, 'none', ` stroke="${a0}" stroke-width="1.6"`);
      tb = { x: L, y: 212, w: cw, h: 72 };
    }
    return { svg: bg(b) + art + texts(c, tb, { font, max: 20, lines: 3, color: ink, ac: a0, af: caps(F.antique, 0.16), as: 9 }), tex: 'grain', spine: 'leather', sc: dark(d0, 0.35), age: 0.5, base: b };
  },
};

// ============ Машинопись и ASCII ============

const RAMP = ' .:-=+*#%@';

export const typewriter: Style = {
  id: 'typewriter',
  name: 'Машинопись',
  variants: ['Титул', 'Рамка', 'Узор', 'Терминал'],
  draw(c) {
    const { r, v, L, cx, cw } = c;
    const term = v === 3;
    const b = term ? pick(r, ['#101810', '#141414', '#0f1420']) : pick(r, ['#f1ece0', '#e9e4d6', '#f4f1e8', '#ece6d8']);
    const ink = term ? pick(r, ['#7fe09a', '#f0b040', '#d8e0e8']) : pick(r, ['#2a2a2e', '#2a2a2e', '#34406a', '#3a2f2a']);
    const red = term ? ink : '#9b2a2a';
    const font = F.mono;
    const size = 8;
    const adv = measure('M', font, size);
    const cols = Math.floor((W - 8) / adv);
    const row = (s: string, y: number, col = ink, extra = '') => txt({ lines: [s], size, font, lh: 1, maxW: 999 }, 4, y, col, 'start', extra);
    let art = '';
    let tb = { x: L, y: 70, w: cw, h: 160 };
    if (v === 0) {
      // Титул: звёздочки, подчёркивания.
      const deco = pick(r, ['* * *', '- - -', '=====', '~~~', '+ + +']);
      art = txt({ lines: [deco], size: 12, font, lh: 1, maxW: 999 }, cx, 252, ink, 'middle') + txt({ lines: ['_'.repeat(Math.floor(cw / measure('_', font, 10)))], size: 10, font, lh: 1, maxW: 999 }, L, 56, red);
    } else if (v === 1) {
      // Рамка из знаков.
      const [corner, h, vv] = pick(r, [
        ['+', '=', '|'],
        ['#', '#', '#'],
        ['*', '*', '*'],
        ['+', '-', '+'],
        ['@', '=', '@'],
      ]);
      const big = 12;
      const k = Math.floor((W - 8) / measure('M', font, big)) - 2;
      const lines = Math.floor((H - 24) / 12);
      for (let i = 0; i < lines; i++) {
        const s = i === 0 || i === lines - 1 ? corner + h.repeat(k) + corner : vv + ' '.repeat(k) + vv;
        art += txt({ lines: [s], size: big, font, lh: 1, maxW: 999 }, 4, 22 + i * 12, i % 2 ? red : ink);
      }
      tb = { x: L + 4, y: 40, w: cw - 8, h: 210 };
    } else {
      // Узор или экран: поле знаков по плотности математической функции.
      const kind = int(r, 0, 2);
      const fx = rand(r, 0.05, 0.12);
      const fy = rand(r, 0.05, 0.12);
      const ox = rand(r, 0, W);
      const oy = rand(r, 0, H);
      const lines = Math.floor((H - 10) / 9);
      for (let i = 0; i < lines; i++) {
        let s = '';
        const y = 10 + i * 9;
        for (let j = 0; j < cols; j++) {
          const x = 4 + j * adv;
          const d = Math.hypot(x - ox, y - oy);
          const f = kind === 0 ? Math.sin(x * fx) + Math.sin(y * fy) + Math.sin(d * 0.06) : kind === 1 ? Math.sin(d * 0.09 - Math.atan2(y - oy, x - ox) * 3) * 1.5 : Math.cos(x * fx) * Math.sin(y * fy) * 3;
          s += RAMP[Math.max(0, Math.min(9, Math.floor(((f + 3) / 6) * 10)))];
        }
        art += row(s, y + 6, ink, term ? '' : ' opacity=".55"');
      }
      const by = rand(r, 90, 160);
      art += rect(L - 6, by, cw + 12, 88, b) + frame(L - 6, by, cw + 12, 88, ink, 1.2);
      tb = { x: L + 2, y: by + 10, w: cw - 4, h: 68 };
      if (term) art += txt({ lines: ['> _'], size: 10, font, lh: 1, maxW: 99 }, L, by - 10, ink);
    }
    return {
      svg: bg(b) + art + texts(c, tb, { font: caps(font, 0), max: 19, min: 8, lines: 5, lh: 1.25, color: ink, af: font, as: 9, ac: red, authorFirst: v < 2, gap: 14 }),
      tex: term ? 'none' : 'grain',
      spine: term ? 'tone' : 'none',
      age: term ? 0 : 0.9,
      base: b,
    };
  },
};

// ============ Ретрофантастика ============

const SKY = [pal('0b1026 1b2a5a 3a4f8f'), pal('1a0f2e 4a1f5c c2456f'), pal('081c24 14495a 2f8f8f'), pal('20120a 5c2a14 d4692f'), pal('0d0d12 23233a 4b4b7a'), pal('101a2c 2b3f63 e09f6b')];
const PLANET = pal('e8a85c d9603b 7ec4c4 c9b8e8 f2d16b e07a8a');

export const space: Style = {
  id: 'space',
  name: 'Космос',
  variants: ['Планета', 'Орбиты', 'Затмение', 'Горизонт'],
  draw(c) {
    const { r, v, L, R, cx, cw, id } = c;
    const sky = pick(r, SKY);
    const [p1, p2] = shuffle(r, PLANET);
    const font = pick(r, [F.tech, F.heavy, caps(F.narrow, 0.08)]);
    const fg = '#f4ecdf';
    let stars = '';
    for (let i = 0; i < 26; i++) stars += `M${n(rand(r, 0, W))} ${n(rand(r, 0, H))}h0`;
    let art =
      `<linearGradient id="${id}s" x2="0" y2="1"><stop offset="0" stop-color="${sky[0]}"/><stop offset=".6" stop-color="${sky[1]}"/><stop offset="1" stop-color="${sky[2]}"/></linearGradient>` +
      bg(`url(#${id}s)`) +
      stroke(stars, '#fff', 1.6, ' stroke-linecap="round" opacity=".8"') +
      pattern(id + 'h', 5, 5, `<circle cx="2.5" cy="2.5" r="1.3" fill="#000"/>`, ' patternTransform="rotate(45)"');
    const ty = 22;
    if (v === 0) {
      // Планета с кольцом и тенью полутоном.
      const px = rand(r, cx - 20, cx + 30);
      const py = rand(r, 150, 180);
      const pr = rand(r, 46, 62);
      const tilt = rand(r, -24, -8);
      const ring = (half: 0 | 1) => path(`M${n(px - pr * 1.7)} ${n(py)}a${n(pr * 1.7)} ${n(pr * 0.42)} 0 0 ${half} ${n(pr * 3.4)} 0`, 'none', ` stroke="${p2}" stroke-width="5" transform="rotate(${n(tilt)} ${n(px)} ${n(py)})"`);
      let bands = '';
      for (let i = -3; i <= 3; i++) bands += rect(px - pr, py + i * pr * 0.28, pr * 2, pr * 0.1, dark(p1, 0.2));
      art += ring(1) + circle(px, py, pr, p1) + clip(id + 'p', `M${n(px - pr)} ${n(py)}a${n(pr)} ${n(pr)} 0 1 0 ${n(2 * pr)} 0a${n(pr)} ${n(pr)} 0 1 0 ${n(-2 * pr)} 0`, bands + circle(px + pr * 0.5, py - pr * 0.35, pr * 1.1, `url(#${id}h)`, ' opacity=".35"')) + ring(0) + circle(rand(r, L, R), rand(r, 230, 270), 7, p2);
    } else if (v === 1) {
      // Орбиты: эллипсы вокруг звезды, на них планеты.
      const sx = cx;
      const sy = rand(r, 160, 190);
      art += circle(sx, sy, 14, p1);
      for (let i = 1; i <= 5; i++) {
        const a = 18 + i * 17;
        art += `<ellipse cx="${n(sx)}" cy="${n(sy)}" rx="${a}" ry="${n(a * 0.38)}" fill="none" stroke="${fg}" stroke-opacity=".5" stroke-width="1.2"/>`;
        const t = rand(r, 0, 6.28);
        art += circle(sx + a * Math.cos(t), sy + a * 0.38 * Math.sin(t), rand(r, 2.5, 6), i % 2 ? p2 : p1);
      }
    } else if (v === 2) {
      // Затмение: тёмный диск, корона, лучи.
      const ex = cx;
      const ey = rand(r, 150, 175);
      let rays = '';
      for (let i = 0; i < 36; i++) {
        const a = (i / 36) * 6.283;
        const l = i % 2 ? 66 : 80;
        rays += `M${n(ex + 52 * Math.cos(a))} ${n(ey + 52 * Math.sin(a))}L${n(ex + l * Math.cos(a))} ${n(ey + l * Math.sin(a))}`;
      }
      art += `<radialGradient id="${id}c"><stop offset=".5" stop-color="${p1}"/><stop offset="1" stop-color="${p1}" stop-opacity="0"/></radialGradient>` + circle(ex, ey, 70, `url(#${id}c)`) + stroke(rays, p1, 1.4) + circle(ex, ey, 46, sky[0]);
    } else {
      // Горизонт: полосатое солнце над сеткой в перспективе.
      const hz = rand(r, 176, 196);
      const sr = rand(r, 48, 60);
      let gaps = '';
      for (let i = 0; i < 5; i++) gaps += rect(cx - sr, hz - 4 - i * 9, sr * 2, 2 + i * 0.6, sky[1]);
      let grid = '';
      for (let i = -8; i <= 8; i++) grid += `M${n(cx + i * 6)} ${n(hz)}L${n(cx + i * 40)} ${H}`;
      for (let i = 1; i < 8; i++) grid += `M0 ${n(hz + (H - hz) * (i / 8) ** 1.8)}H${W}`;
      art += clip(id + 'u', `M0 0H${W}V${n(hz)}H0Z`, circle(cx, hz, sr, p1) + gaps) + rect(0, hz, W, H - hz, sky[0]) + stroke(grid, p2, 1.2);
    }
    return {
      svg: art + frame(8, 8, W - 16, H - 16, fg, 1, ' opacity=".5"') + texts(c, { x: L, y: ty, w: cw, h: 90 }, { font, max: 24, lines: 3, color: fg, align: 'start', at: 'top', ac: p1, as: 9, gap: 8 }),
      tex: 'grain',
      spine: 'tone',
      age: 0.25,
      base: sky[1],
    };
  },
};

