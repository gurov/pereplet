// Орнамент: узорная бумага (повтор плитки через <pattern>) и плашка с названием.
import { W, H, dark, mix, n, pick, rand, int, shades, shuffle, wada, type Rng } from '../core.ts';
import { F, caps } from '../text.ts';
import { bg, circle, lab, op, path, pattern, rect, sk, texts, type Style } from '../cover.ts';
import { tiles } from './graphic.ts';
import { sprig } from './botany.ts';

const motifs: ((s: number, a: string, b: string, k: string) => [string, number, number])[] = [
  // Чешуя
  (s, a) => {
    const h = s / 2;
    const arc = (x: number, y: number) => `M${n(x - h)} ${n(y)}a${n(h)} ${n(h)} 0 0 1 ${n(s)} 0`;
    return [`<path d="${arc(h, h) + arc(0, 0) + arc(s, 0)}" fill="none" stroke="${a}" stroke-width="${n(s * 0.09)}"/>`, s, h];
  },
  // Ромбы с косой сеткой
  (s, a, _b, k) => [`<path d="M${n(s / 2)} 0L${s} ${n(s * 0.7)}L${n(s / 2)} ${n(s * 1.4)}L0 ${n(s * 0.7)}Z" fill="${a}"/><path d="M0 0L${s} ${n(s * 1.4)}M${s} 0L0 ${n(s * 1.4)}" stroke="${k}" stroke-opacity=".35" stroke-width="1"/>`, s, s * 1.4],
  // Шеврон
  (s, a) => [`<path d="M0 ${n(s * 0.75)}L${n(s / 2)} ${n(s * 0.25)}L${s} ${n(s * 0.75)}" fill="none" stroke="${a}" stroke-width="${n(s * 0.22)}"/>`, s, s],
  // Горох
  (s, a) => [`<circle cx="${n(s / 4)}" cy="${n(s / 4)}" r="${n(s * 0.13)}" fill="${a}"/><circle cx="${n((3 * s) / 4)}" cy="${n((3 * s) / 4)}" r="${n(s * 0.13)}" fill="${a}"/>`, s, s],
  // Клетка
  (s, a, _b, k) => [`<rect width="${s}" height="${n(s * 0.36)}" fill="${a}" opacity=".55"/><rect width="${n(s * 0.36)}" height="${s}" fill="${a}" opacity=".55"/><path d="M0 ${n(s * 0.7)}H${s}M${n(s * 0.7)} 0V${s}" stroke="${k}" stroke-opacity=".5" stroke-width="1"/>`, s, s],
  // Решётка-ключ
  (s, a) => {
    const q = s / 4;
    return [`<path d="M0 ${n(q)}H${n(3 * q)}V${n(3 * q)}H${n(q)}V${n(2 * q)}H${n(2 * q)}M${n(2 * q)} ${s}V${n(3.5 * q)}" fill="none" stroke="${a}" stroke-width="${n(s * 0.08)}"/>`, s, s];
  },
  // Листья: два листа наискосок и ягода
  (s, a, _b, k) => [path(sprig(s), a) + circle(s * 0.8, s * 0.3, s * 0.07, k, op(0.6)), s, s],
  // Звёзды: восьмиконечная из двух квадратов
  (s, a, _b, k) => {
    const h = s / 2;
    const m = s * 0.26;
    return [`<rect x="${n(h - m)}" y="${n(h - m)}" width="${n(2 * m)}" height="${n(2 * m)}" fill="${a}"/><rect x="${n(h - m)}" y="${n(h - m)}" width="${n(2 * m)}" height="${n(2 * m)}" fill="${a}" transform="rotate(45 ${n(h)} ${n(h)})"/><circle cx="${n(h)}" cy="${n(h)}" r="${n(s * 0.08)}" fill="${k}" opacity=".6"/><circle cx="0" cy="0" r="${n(s * 0.06)}" fill="${a}"/><circle cx="${s}" cy="0" r="${n(s * 0.06)}" fill="${a}"/><circle cx="0" cy="${s}" r="${n(s * 0.06)}" fill="${a}"/><circle cx="${s}" cy="${s}" r="${n(s * 0.06)}" fill="${a}"/>`, s, s];
  },
];

export const ornament: Style = {
  id: 'ornament',
  name: 'Орнамент',
  variants: ['Чешуя', 'Ромбы', 'Шеврон', 'Горох', 'Клетка', 'Решётка', 'Листья', 'Звёзды', 'Плитки'],
  sp: 0.45,
  draw(c) {
    const { r, v, L, cx, cw, id } = c;
    // Сочетание Вады: фон и узор — две краски, узор иногда приглушён к фону; третья, затемнённая, — линии.
    // Или тон в тон: фон и узор — близкие оттенки одной краски.
    const sh = shades(r, 3, 0.4, 0.35);
    const [b, a0, k0] = r() < 0.35 ? [sh[1], sh[int(r, 0, 1) * 2], sh[0]] : shuffle(r, wada(r, 3));
    const a = mix(a0, b, rand(r, 0, 0.4));
    const k = dark(k0, 0.35);
    const font = pick(r, [F.serif, F.old, caps(F.narrow, 0.05), F.didone, caps(F.antique, 0.1)]);
    let art: string;
    if (v === 8) {
      const m = int(r, 3, 6);
      art = tiles(r as Rng, m, Math.ceil((m * 3) / 2), W / m, 0, 0, [b, a, k], 'qhtcsn');
    } else {
      // Мотив от мелкого до крупного, когда видна только часть; повтор сдвинут и иногда повёрнут.
      const s = pick(r, [14, 20, 28, 40, 56]);
      const [body, w, h] = motifs[v](s, a, b, k);
      art = pattern(id + 'o', w, h, body, ` x="${n(rand(r, 0, w))}" y="${n(rand(r, 0, h))}" patternTransform="rotate(${pick(r, [0, 0, 0, 30, 45])})"`) + rect(0, 0, W, H, `url(#${id}o)`);
    }
    const plate = pick(r, ['#f4efe4', '#efe7d6', '#f3ede1']);
    const ink = '#26221e';
    const layout = Math.floor(rand(r, 0, 4));
    let box: string;
    if (layout === 0) box = rect(0, 196, W, H - 196, plate) + rect(0, 196, W, 3, k) + texts(c, { x: L, y: 210, w: cw, h: 76 }, { font, max: 22, lines: 3, color: ink, align: 'start', ac: a === plate ? k : a, as: 9 });
    else if (layout === 1) {
      // Плашка в середине — любой формы наклейки; у овала текст уже.
      const f = int(r, 0, 5);
      box = path(lab(f, L - 4, 92, cw + 8, 120), plate) + path(lab(f, L, 96, cw, 112), 'none', sk(k, 1.2)) + texts(c, { x: f === 4 ? L + cw * 0.17 : L + 10, y: 106, w: f === 4 ? cw * 0.66 : cw - 20, h: 92 }, { font, max: 22, color: ink, as: 9 });
    }
    else if (layout === 2) box = rect(0, 0, W, 104, plate) + rect(0, 101, W, 3, k) + texts(c, { x: L, y: 18, w: cw, h: 74 }, { font, max: 22, lines: 3, color: ink, align: 'start', at: 'top', as: 9 });
    else {
      const rr = Math.min(cw / 2 + 4, 70);
      box = circle(cx, 140, rr, plate) + circle(cx, 140, rr - 5, 'none', sk(k, 1.2)) + texts(c, { x: cx - rr * 0.72, y: 140 - rr * 0.62, w: rr * 1.44, h: rr * 1.24 }, { font, max: 18, color: ink, as: 8 });
    }
    // Узорная бумага с корешком и уголками из ткани или кожи — как у книжных серий.
    return { svg: bg(b) + art + box, tex: 'grain', spine: r() < 0.5 ? 'cloth' : 'leather', sc: k, corners: r() < 0.35, age: 0.6, base: b };
  },
};
