// Эпохи и страны — абстрактно, как обложки серий: ар-деко, модерн, античность, манускрипт,
// Восток, звёздная геометрия, машинопись, ретрофантастика.
import { H, W, byLum, gcd, dark, light, mix, n, wada, on, pal, pick, poly, rand, int, smooth, shuffle, type Pt } from '../core.ts';
import { F, caps, fit, measure, txt } from '../text.ts';
import { bg, circle, clip, frame, GOLD, initial, path, pattern, rect, sk, stroke, texts, type Style } from '../cover.ts';
import { blade } from './botany.ts';

// ============ Ар-деко ============

const DECO_BG = pal('1b2430 12201c 2a1622 1c1c1c 0f2a3a 3a2a1a 23303a 2e1f33');
const DECO_LINE = pal('d4b06a d4b06a c8c8c0 efe2c4 5fa48a e08a6a');

export const deco: Style = {
  id: 'deco',
  name: 'Ар-деко',
  variants: ['Веер', 'Лучи', 'Ступени'],
  sp: 0.3,
  draw(c) {
    const { r, v, L, R, cx, cw } = c;
    const b = pick(r, DECO_BG);
    const f = pick(r, DECO_LINE);
    const font = pick(r, [caps(F.antique, 0.14), F.didone, caps(F.narrow, 0.16)]);
    const af = caps(F.antique, 0.2);
    let art = '';
    let tb = { x: L + 6, y: 26, w: cw - 12, h: 96 };
    if (v === 0) {
      // Веер снизу — из середины или из угла, разного размера; до текста не дорастает.
      const k = int(r, 7, 11);
      const m = rand(r, 0.6, 1.1);
      const fx = pick(r, [cx, cx, 10, W - 10]);
      for (let i = 0; i <= k; i++) {
        const a = Math.PI + (i / k) * Math.PI;
        art += stroke(`M${n(fx)} ${H}L${n(fx + 150 * m * Math.cos(a))} ${n(H + 150 * m * Math.sin(a))}`, f, 1.4);
      }
      for (const q of [44, 80, 116, 146]) art += path(`M${n(fx - q * m)} ${H}a${n(q * m)} ${n(q * m)} 0 0 1 ${n(2 * q * m)} 0`, 'none', sk(f, 1.4));
      art += path(`M${n(fx - 30 * m)} ${H}a${n(30 * m)} ${n(30 * m)} 0 0 1 ${n(60 * m)} 0Z`, f);
    } else if (v === 1) {
      // Солнце: лучи-клинья вокруг круга разного размера, сдвинутого вбок; название под ним.
      const sr = rand(r, 18, 52);
      const cy = rand(r, 40, 140 - sr);
      const sx = cx + rand(r, -70, 70);
      const k = 2 * int(r, 8, 14);
      let d = '';
      for (let i = 0; i < k; i += 2) {
        const a0 = (i / k) * 2 * Math.PI;
        const a1 = ((i + 1) / k) * 2 * Math.PI;
        d += `M${n(sx)} ${n(cy)}L${n(sx + 360 * Math.cos(a0))} ${n(cy + 360 * Math.sin(a0))}L${n(sx + 360 * Math.cos(a1))} ${n(cy + 360 * Math.sin(a1))}Z`;
      }
      art = path(d, light(b, 0.08)) + circle(sx, cy, sr, b) + circle(sx, cy, sr, 'none', sk(f, 2)) + circle(sx, cy, sr * 0.8, 'none', sk(f, 0.9)) + circle(sx, cy, sr * 0.15, f);
      const py = cy + sr + 18;
      art += rect(L - 2, py, cw + 4, H - py - 18, b) + frame(L - 2, py, cw + 4, H - py - 18, f, 1.4);
      tb = { x: L + 8, y: py + 12, w: cw - 16, h: H - py - 42 };
    } else {
      // Ступени: зиккурат из рамок вокруг названия.
      for (let i = 0; i < 3; i++) {
        const k = i * 8;
        art += path(`M${n(L - 4 + k)} ${n(H - 20)}V${n(80 + k)}h${n(18)}v-${n(14)}h${n(cw + 8 - 2 * k - 36)}v${n(14)}h${n(18)}V${n(H - 20)}`, 'none', sk(f, i ? 1 : 2));
      }
      art += stroke(`M${n(cx)} 20V58M${n(cx - 10)} 30V58M${n(cx + 10)} 30V58`, f, 1.4);
      tb = { x: L + 26, y: 110, w: cw - 52, h: 150 };
    }
    return {
      svg: bg(b) + art + texts(c, tb, { font, max: 22, lines: 4, color: light(f, 0.25), af, as: 8.5, ac: f, gap: 12 }) + stroke(`M${n(L - 4)} 12H${n(R + 4)}`, f, 1),
      tex: 'grain',
      spine: 'leather',
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
  variants: ['Стебли', 'Рама'],
  sp: 0.35,
  draw(c) {
    const { r, v, L, cw, id } = c;
    const b = pick(r, NOUV_BG);
    const ink = pick(r, NOUV_INK);
    const acc = pick(r, NOUV_ACC);
    const font = pick(r, [caps(F.antique, 0.1), F.slav, F.old]);
    const af = caps(F.antique, 0.16);
    if (v === 0) {
      // Стебли поперёк всей обложки, с бутонами и листьями; название в картуше.
      let art = '';
      for (let i = 0; i < 6; i++) {
        const x = rand(r, 0, W);
        const y0 = rand(r, 10, 120);
        const amp = rand(r, 8, 20);
        const ph = rand(r, 0, 6);
        const p: Pt[] = [];
        for (let y = H + 10; y >= y0; y -= 20) p.push([x + amp * Math.sin(y * 0.045 + ph), y]);
        const [tx, ty] = p[p.length - 1];
        const [lx, ly] = p[2];
        art += stroke(smooth(p, false), ink, 1.8) + path(blade(lx, ly, 26, 6, r() < 0.5 ? -0.5 : -2.6), mix(acc, b, 0.35)) + circle(tx, ty - 5, 6, acc) + circle(tx, ty - 5, 6, 'none', sk(ink, 1.2));
      }
      const py = rand(r, 140, 170);
      art += path(`M${n(L)} ${n(py)}h${n(cw)}a14 14 0 0 1 0 28v${n(52)}a14 14 0 0 1 0 28h${n(-cw)}a14 14 0 0 1 0-28v-52a14 14 0 0 1 0-28z`, light(b, 0.4), sk(ink, 1.6));
      return { svg: bg(b) + art + texts(c, { x: L + 8, y: py + 12, w: cw - 16, h: 84 }, { font, max: 20, lines: 3, color: ink, af, ac: dark(acc, 0.2) }), tex: 'grain', sc: dark(b, 0.45), corners: r() < 0.3, age: 0.8, base: b };
    }
    // Рама: кайма из листьев с ягодой, мелкая или крупная.
    const k = pick(r, [12, 16, 22]);
    const art =
      pattern(id + 'f', k, k, path(blade(k * 0.15, k * 0.85, k * 0.8, k * 0.2, -0.8), ink) + circle(k * 0.78, k * 0.72, k * 0.1, acc)) +
      rect(L - 8, 14, cw + 16, H - 28, `url(#${id}f)`) +
      rect(L + 6, 28, cw - 12, H - 56, b) +
      frame(L + 6, 28, cw - 12, H - 56, ink, 1.6);
    // Уголков нет: они срезали бы кайму.
    return { svg: bg(b) + art + texts(c, { x: L + 18, y: 50, w: cw - 36, h: 200 }, { font, max: 22, color: ink, af, ac: dark(acc, 0.2), at: 'split' }), tex: 'grain', sc: dark(b, 0.45), age: 0.8, base: b };
  },
};

// ============ Античность ============

// Меандр (греческий ключ) — плитка шириной k.
const meander = (k: number, col: string, sw: number) =>
  `<path d="M0 ${n(k * 0.9)}H${n(k * 0.8)}V${n(k * 0.1)}H${n(k * 0.2)}V${n(k * 0.7)}H${n(k * 0.6)}V${n(k * 0.3)}H${n(k * 0.4)}" fill="none" stroke="${col}" stroke-width="${n(sw)}"/><path d="M${n(k * 0.8)} ${n(k * 0.9)}H${k}" stroke="${col}" stroke-width="${n(sw)}"/>`;

export const antique: Style = {
  id: 'antique',
  name: 'Античность',
  variants: ['Меандр', 'Медальон', 'Фриз'],
  draw(c) {
    const { r, v, L, cx, cw, id } = c;
    const black = r() < 0.4;
    const terra = pick(r, ['#c06a3d', '#b5562f', '#c47a45', '#a84c32']);
    const b = black ? '#1f1a17' : pick(r, ['#ecdcc0', '#e8d5b5', '#efe4cf']);
    const f = black ? terra : '#2a211c';
    const font = caps(F.antique, 0.12);
    // Меандр мелкий или крупный.
    const k = pick(r, [16, 22, 30]);
    const band = (y: number, col: string) => pattern(id + 'm' + y, k, k, meander(k, col, k * 0.12), ` y="${y}"`) + rect(0, y, W, k, `url(#${id}m${y})`);
    let art = '';
    let tb = { x: L, y: 70, w: cw, h: 160 };
    if (v === 0) {
      art = band(22, f) + band(H - 22 - k, f) + stroke(`M0 16H${W}M0 ${k + 28}H${W}M0 ${H - k - 28}H${W}M0 ${H - 16}H${W}`, f, 1.6);
    } else if (v === 1) {
      // Медальон: круг с точками, буква в середине.
      const cy = 96;
      let dots = '';
      for (let i = 0; i < 28; i++) dots += circle(cx + 54 * Math.cos((i / 28) * 6.283), cy + 54 * Math.sin((i / 28) * 6.283), 2, f);
      art = circle(cx, cy, 62, 'none', sk(f, 2)) + dots + circle(cx, cy, 46, 'none', sk(f, 1)) + txt(fit(initial(c.title), F.antique, { maxW: 60, max: 54 }), cx, cy + 19, f, 'middle') + band(H - 12 - k, f);
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
    return { svg: bg(b) + art + texts(c, tb, { font, max: 22, color: f, af: caps(F.antique, 0.2), as: 9, gap: 14 }), tex: 'grain', age: 0.8, base: b };
  },
};

// ============ Манускрипт ============

const PARCH = pal('eadbb8 e8d6ae efe3c6 e6d3a8');
const INK2 = pal('a8322a 2c4a8a 3e6b3a');

export const manuscript: Style = {
  id: 'manuscript',
  name: 'Манускрипт',
  variants: ['Кайма', 'Плетёнка'],
  sp: 0.5,
  draw(c) {
    const { r, v, L, R, cw, id } = c;
    const b = pick(r, PARCH);
    const [c1, c2] = shuffle(r, INK2);
    const k = '#2a2018';
    const font = pick(r, [F.slav, F.old, F.didone]);
    const af = caps(F.old, 0.1);
    let art = '';
    let tb = { x: L + 4, y: 150, w: cw - 8, h: 120 };
    if (v === 0) {
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
      return { svg: bg(b) + art + texts(c, tb, { font, max: 22, lines: 5, color: k, af, ac: c1, as: 9, align: 'start', at: 'split' }), tex: 'grain', spine: 'leather', sc: '#4a2a1a', corners: r() < 0.4, age: 1, base: b };
    }
    // У каймы уголков нет: они закрыли бы золотые квадраты.
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
  sp: 0.25,
  draw(c) {
    const { r, v, L, R, cw, id } = c;
    const b = pick(r, EAST_BG);
    const darkBg = on(b) !== '#1d1b19';
    const ink = darkBg ? '#ece4d2' : '#26365a';
    const acc = pick(r, EAST_ACC);
    const font = pick(r, [F.serif, F.antique, caps(F.narrow, 0.1)]);
    let art = '';
    let tb = { x: L, y: 20, w: cw, h: 90 };
    let at: 'top' | 'bottom' = 'top';
    if (v === 0) {
      // Солнце любого размера, сдвинуто, иногда уходит за край; всегда в стороне от текста.
      const low = r() < 0.5;
      const sr = rand(r, 24, 95);
      const cy = low ? rand(r, 200 - sr - 70, 200 - sr) : rand(r, 120 + sr, 190 + sr);
      const sx = rand(r, L - sr * 0.4, R + sr * 0.4);
      art = circle(sx, cy, sr, acc);
      for (let i = 0; i < 4; i++) {
        const y = cy - sr * 0.6 + i * sr * 0.5 + rand(r, -6, 6);
        if (low ? y > 196 : y < 116) continue;
        art += rect(sx - rand(r, 60, 140), y, rand(r, 90, 150), 12, ink, ` rx="6" opacity="${darkBg ? 0.85 : 0.9}"`);
      }
      if (low) {
        tb = { x: L, y: 220, w: cw, h: 64 };
        at = 'bottom';
      }
    } else if (v === 1) {
      // Сейгайха: веера из колец, каждый ряд ложится на предыдущий; мелкая или крупная.
      const s = pick(r, [10, 15, 22, 30]);
      const fan = (x: number, y: number) => [1, 0.75, 0.5, 0.25].map((m, i) => `<circle cx="${n(x)}" cy="${n(y)}" r="${n(s * m)}" fill="${i % 2 ? b : ink}"/>`).join('');
      const y0 = rand(r, 150, 190);
      art =
        pattern(id + 'w', 2 * s, s, fan(0, s / 2) + fan(2 * s, s / 2) + fan(s, s) + fan(0, 1.5 * s) + fan(2 * s, 1.5 * s), ` x="${n(rand(r, 0, s))}" y="${n(y0)}"`) +
        rect(0, y0, W, H - y0, `url(#${id}w)`) +
        circle(R - 26, rand(r, 128, y0 - 20), rand(r, 8, 16), acc);
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
      for (let i = 0; i < 9; i++) d += `M${n(rand(r, L, R))} ${n(rand(r, 120, 260))}l-12 26`;
      art += stroke(d, ink, 1.2);
    }
    return { svg: bg(b) + art + texts(c, tb, { font, max: 22, lines: 3, color: ink, align: 'start', at, ac: darkBg ? acc : dark(acc, 0.1), gap: 7 }), tex: 'grain', sc: darkBg ? dark(b, 0.4) : '#26365a', age: 0.5, base: b };
  },
};

// ============ Звёздная геометрия ============


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

export const girih: Style = {
  id: 'girih',
  name: 'Звёзды',
  variants: ['Розетка', 'Плитка'],
  sp: 0.3,
  draw(c) {
    const { r, v, L, cx, cw, id } = c;
    // Сочетание Вады по светлоте: тёмный фон, второй тёмный, краска узора, светлая линия.
    const w = byLum(wada(r, 4));
    const [d0, d1, a0, p0] = [dark(w[0], 0.25), w[1], w[2], light(w[3], 0.45)];
    const font = pick(r, [caps(F.antique, 0.1), F.serif, F.old]);
    let art = '';
    let tb = { x: L, y: 200, w: cw, h: 80 };
    if (v === 0) {
      // Розетка разного размера; крупная уходит за край, но до текста не дотягивается.
      const m = rand(r, 0.6, 1.6);
      const cy = 192 - 82 * m;
      const sx = cx + rand(r, -50, 50) * m;
      const nn = pick(r, [8, 10, 12, 16]);
      const k = nn === 8 ? 3 : nn === 10 ? 3 : nn === 12 ? 5 : 7;
      art =
        circle(sx, cy, 80 * m, d1) +
        path(star(sx, cy, 76 * m, nn, k, -Math.PI / 2), 'none', sk(p0, 3 * m) + ` stroke-linejoin="round"`) +
        path(star(sx, cy, 40 * m, nn, k - 1 || 2, -Math.PI / 2 + Math.PI / nn), a0, sk(d0, 2 * m) + ` fill-rule="evenodd"`) +
        circle(sx, cy, 8 * m, d0) +
        circle(sx, cy, 80 * m, 'none', sk(a0, 2));
    } else {
      // Плитка: восьмиконечные звёзды в узлах решётки, от мелкой до крупной.
      const s = pick(r, [30, 40, 54, 72, 96]);
      const sw = sk(p0, Math.max(1.4, s * 0.045));
      const body = path(star(s / 2, s / 2, s * 0.42, 8, 3), d1, sw + ' stroke-linejoin="round" fill-rule="nonzero"') + circle(s / 2, s / 2, s * 0.12, a0) + path(star(0, 0, s * 0.42, 8, 3) + star(s, 0, s * 0.42, 8, 3) + star(0, s, s * 0.42, 8, 3) + star(s, s, s * 0.42, 8, 3), 'none', sw);
      art = pattern(id + 'p', s, s, body, ` x="${n(cx - s / 2 + rand(r, -s / 2, s / 2))}" y="${n(rand(r, 0, s))}"`) + rect(0, 0, W, H, `url(#${id}p)`) + rect(L - 6, 196, cw + 12, 84, d0) + frame(L - 2, 200, cw + 4, 76, a0, 1.6);
      tb = { x: L + 6, y: 208, w: cw - 12, h: 62 };
    }
    // Уголки только у розетки: у плитки они срезали бы плашку.
    return { svg: bg(d0) + art + texts(c, tb, { font, max: 20, lines: 3, color: p0, ac: a0, af: caps(F.antique, 0.16), as: 9 }), tex: 'grain', spine: 'leather', sc: dark(d0, 0.35), corners: v === 0 && r() < 0.3, age: 0.5, base: d0 };
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
  variants: ['Затмение', 'Горизонт'],
  draw(c) {
    const { r, v, L, cx, cw, id } = c;
    const sky = pick(r, SKY);
    const [p1, p2] = shuffle(r, PLANET);
    const font = pick(r, [F.tech, F.heavy, caps(F.narrow, 0.08)]);
    const fg = '#f4ecdf';
    let stars = '';
    for (let i = 0; i < 26; i++) stars += `M${n(rand(r, 0, W))} ${n(rand(r, 0, H))}h0`;
    let art =
      `<linearGradient id="${id}s" x2="0" y2="1"><stop offset="0" stop-color="${sky[0]}"/><stop offset=".6" stop-color="${sky[1]}"/><stop offset="1" stop-color="${sky[2]}"/></linearGradient>` +
      bg(`url(#${id}s)`) +
      stroke(stars, '#fff', 1.6, ' stroke-linecap="round" opacity=".8"');
    if (v === 0) {
      // Затмение: маленькое или огромное, сдвинутое; крупное уходит за нижний край. Текст наверху свободен.
      const m = rand(r, 0.45, 1.7);
      const ex = cx + rand(r, -60, 60);
      const ey = rand(r, 125 + 70 * m, 150 + 70 * m);
      let rays = '';
      for (let i = 0; i < 36; i++) {
        const a = (i / 36) * 6.283;
        const l = (i % 2 ? 66 : 80) * m;
        rays += `M${n(ex + 52 * m * Math.cos(a))} ${n(ey + 52 * m * Math.sin(a))}L${n(ex + l * Math.cos(a))} ${n(ey + l * Math.sin(a))}`;
      }
      art += `<radialGradient id="${id}c"><stop offset=".5" stop-color="${p1}"/><stop offset="1" stop-color="${p1}" stop-opacity="0"/></radialGradient>` + circle(ex, ey, 70 * m, `url(#${id}c)`) + stroke(rays, p1, 1.4) + circle(ex, ey, 46 * m, sky[0]);
    } else {
      // Горизонт: полосатое солнце разного размера над сеткой в перспективе.
      const hz = rand(r, 176, 196);
      const sr = rand(r, 26, hz - 120);
      const sx = cx + rand(r, -60, 60);
      let gaps = '';
      for (let i = 0; i < 5; i++) gaps += rect(sx - sr, hz - (4 + i * 9) * sr / 54, sr * 2, (2 + i * 0.6) * sr / 54, sky[1]);
      let grid = '';
      for (let i = -8; i <= 8; i++) grid += `M${n(cx + i * 6)} ${n(hz)}L${n(cx + i * 40)} ${H}`;
      for (let i = 1; i < 8; i++) grid += `M0 ${n(hz + (H - hz) * (i / 8) ** 1.8)}H${W}`;
      art += clip(id + 'u', `M0 0H${W}V${n(hz)}H0Z`, circle(sx, hz, sr, p1) + gaps) + rect(0, hz, W, H - hz, sky[0]) + stroke(grid, p2, 1.2);
    }
    return {
      svg: art + frame(8, 8, W - 16, H - 16, fg, 1, ' opacity=".5"') + texts(c, { x: L, y: 22, w: cw, h: 90 }, { font, max: 24, lines: 3, color: fg, align: 'start', at: 'top', ac: p1, as: 9, gap: 8 }),
      tex: 'grain',
      age: 0.25,
      base: sky[1],
    };
  },
};
