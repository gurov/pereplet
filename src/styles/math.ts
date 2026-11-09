// Математика и архитектура: гильош, мозаики, кривые, рельеф, аркады и витражи.
// Всё дёшево: сотни точек, а не тысячи; повторы — через <use> и <pattern>.
import { H, W, byLum, gcd, dark, light, lum, mix, n, on, pal, palette, pick, poly, rand, ramp, int, seen, smooth, shuffle, wada, type Pt, type Rng } from '../core.ts';
import { F, caps } from '../text.ts';
import { bg, circle, clip, frame, grad, op, path, pattern, rect, sk, stroke, texts, type Style } from '../cover.ts';

// ============ Гильош ============

export const guilloche: Style = {
  id: 'guilloche',
  name: 'Гильош',
  variants: ['Розетка', 'Лента', 'Лиссажу', 'Спирограф'],
  draw(c) {
    const { r, v, L, R, cx, cw, id } = c;
    // Сочетание Вады: бледный оттенок светлой краски — бумага, тёмная и средняя — линии.
    // Иногда наоборот, как на тёмной ценной бумаге.
    const w = palette(r, 3, 0.3);
    const [b, k1, k2] = r() < 0.2 ? [dark(w[0], 0.55), light(w[2], 0.2), w[1]] : [light(w[2], 0.75), dark(w[0], 0.1), w[1]];
    const font = pick(r, [F.didone, F.serif, F.old, caps(F.antique, 0.12)]);
    const sw = 0.9;
    let art = '';
    let tb = { x: L, y: 196, w: cw, h: 86 };
    // Кривая плюс её повёрнутые копии через <use>.
    const copies = (d: string, cx0: number, cy0: number, k: number, col: string, step: number) => {
      let s = `<path id="${id}g${col.slice(1)}" d="${d}" fill="none" stroke="${col}" stroke-width="${sw}"/>`;
      for (let i = 1; i < k; i++) s += `<use href="#${id}g${col.slice(1)}" transform="rotate(${n(i * step)} ${n(cx0)} ${n(cy0)})"/>`;
      return s;
    };
    // Масштаб рисунка: мелкий целиком или крупный, уходящий за край; низ — над текстом.
    const m = rand(r, 0.6, 1.6);
    const cy = 188 - 84 * m;
    if (v === 0) {
      // Розетка: волна по окружности, повёрнутая много раз.
      const wave = (R0: number, A: number) => {
        const p: Pt[] = [];
        for (let i = 0; i < 120; i++) {
          const t = (i / 120) * 2 * Math.PI;
          const rr = (R0 + A * Math.sin(q * t)) * m;
          p.push([cx + rr * Math.cos(t), cy + rr * Math.sin(t)]);
        }
        return poly(p);
      };
      const q = int(r, 7, 13);
      art = copies(wave(62, 14), cx, cy, 8, k1, 360 / q / 8) + copies(wave(30, 8), cx, cy, 6, k2, 360 / q / 6) + circle(cx, cy, 82 * m, 'none', sk(k1, 1.6));
    } else if (v === 1) {
      // Лента: синусы со сдвигом фазы сверху и снизу.
      const band = (y0: number, col: string) => {
        let d = '';
        for (let j = 0; j < 9; j++) {
          const p: Pt[] = [];
          for (let x = -10; x <= W + 10; x += 6) p.push([x, y0 + 16 * Math.sin(x * 0.07 + j * 0.7) * Math.cos(x * 0.013 + j * 0.2)]);
          d += poly(p, false);
        }
        return stroke(d, col, sw);
      };
      art = band(56, k1) + band(244, k2) + stroke(`M0 30H${W}M0 82H${W}M0 218H${W}M0 270H${W}`, k1, 1.4);
      tb = { x: L, y: 96, w: cw, h: 110 };
    } else if (v === 2) {
      // Лиссажу: несколько фигур со сдвигом фазы.
      const [a, bb] = pick(r, [
        [3, 2],
        [5, 4],
        [3, 4],
        [5, 6],
        [1, 2],
        [3, 5],
      ]);
      let d = '';
      for (let j = 0; j < 4; j++) {
        const p: Pt[] = [];
        for (let i = 0; i <= 130; i++) {
          const t = (i / 130) * 2 * Math.PI;
          p.push([cx + (cw / 2 - 4) * m * Math.sin(a * t + j * 0.13), cy + 76 * m * Math.sin(bb * t)]);
        }
        d += poly(p, false);
      }
      art = stroke(d, j2(k1, k2, r), sw + 0.2);
    } else {
      // Спирограф: гипотрохоида.
      const Rr = pick(r, [5, 7, 8, 9, 11]);
      const rr = pick(r, [2, 3, 4].filter((x) => Rr % x));
      const dd = rand(r, 0.5, 1.2) * rr;
      const turns = rr / gcd(Rr, rr);
      const sc = (80 * m) / (Rr - rr + dd);
      const p: Pt[] = [];
      for (let i = 0; i <= turns * 70; i++) {
        const t = (i / 70) * 2 * Math.PI;
        p.push([cx + sc * ((Rr - rr) * Math.cos(t) + dd * Math.cos(((Rr - rr) / rr) * t)), cy + sc * ((Rr - rr) * Math.sin(t) - dd * Math.sin(((Rr - rr) / rr) * t))]);
      }
      art = copies(poly(p), cx, cy, 3, k1, 360 / Rr / 3) + circle(cx, cy, 6, k2);
    }
    return {
      svg: bg(b) + art + frame(L - 6, 10, R - L + 12, H - 20, k1, 1.2) + frame(L - 2, 14, R - L + 4, H - 28, k2, 0.8) + texts(c, tb, { font, max: 22, lines: 3, color: on(b, dark(k1, 0.3), light(k1, 0.6)), ac: k1, af: caps(F.serif, 0.1), as: 8.5 }),
      tex: 'grain',
      age: 0.6,
      base: b,
    };
  },
};
const j2 = (a: string, b: string, r: Rng) => (r() < 0.5 ? a : b);

// ============ Мозаики ============

// Пенроуз P3: треугольники Робинсона, разбиение (Preshing).
function penrose(cx: number, cy: number, R: number, steps: number): { thin: string; thick: string; edges: string } {
  type T = [0 | 1, Pt, Pt, Pt];
  const phi = (1 + Math.sqrt(5)) / 2;
  let tris: T[] = [];
  for (let i = 0; i < 10; i++) {
    let b: Pt = [cx + R * Math.cos(((2 * i - 1) * Math.PI) / 10), cy + R * Math.sin(((2 * i - 1) * Math.PI) / 10)];
    let c: Pt = [cx + R * Math.cos(((2 * i + 1) * Math.PI) / 10), cy + R * Math.sin(((2 * i + 1) * Math.PI) / 10)];
    if (i % 2) [b, c] = [c, b];
    tris.push([0, [cx, cy], b, c]);
  }
  const lerp = (p: Pt, q: Pt, t: number): Pt => [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t];
  for (let s = 0; s < steps; s++) {
    const next: T[] = [];
    for (const [k, a, b, c] of tris) {
      if (k === 0) {
        const p = lerp(a, b, 1 / phi);
        next.push([0, c, p, b], [1, p, c, a]);
      } else {
        const q = lerp(b, a, 1 / phi);
        const rr = lerp(b, c, 1 / phi);
        next.push([1, rr, c, a], [1, q, rr, b], [0, rr, q, a]);
      }
    }
    tris = next;
  }
  let thin = '';
  let thick = '';
  let edges = '';
  for (const [k, a, b, c] of tris) {
    const d = poly([a, b, c]);
    if (k === 0) thin += d;
    else thick += d;
    edges += poly([c, a, b], false);
  }
  return { thin, thick, edges };
}

// Вороной: каждая клетка — прямоугольник, обрезанный серединными перпендикулярами.
function voronoi(seeds: Pt[], box: [number, number, number, number]): Pt[][] {
  return seeds.map((s, i) => {
    let cell: Pt[] = [
      [box[0], box[1]],
      [box[2], box[1]],
      [box[2], box[3]],
      [box[0], box[3]],
    ];
    seeds.forEach((o, j) => {
      if (i === j || !cell.length) return;
      const mx = (s[0] + o[0]) / 2;
      const my = (s[1] + o[1]) / 2;
      const nx = o[0] - s[0];
      const ny = o[1] - s[1];
      const side = (p: Pt) => (p[0] - mx) * nx + (p[1] - my) * ny;
      const out: Pt[] = [];
      cell.forEach((p, k) => {
        const q = cell[(k + 1) % cell.length];
        const a = side(p);
        const b = side(q);
        if (a <= 0) out.push(p);
        if (a <= 0 !== b <= 0) {
          const t = a / (a - b);
          out.push([p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t]);
        }
      });
      cell = out;
    });
    return cell;
  });
}
function seeds(r: Rng, cols: number, rows: number, box: [number, number, number, number]): Pt[] {
  const s: Pt[] = [];
  const w = (box[2] - box[0]) / cols;
  const h = (box[3] - box[1]) / rows;
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) s.push([box[0] + (i + rand(r, 0.15, 0.85)) * w, box[1] + (j + rand(r, 0.15, 0.85)) * h]);
  return s;
}

export const tiling: Style = {
  id: 'tiling',
  name: 'Мозаика',
  variants: ['Пенроуз', 'Вороной', 'Трюше', 'Кубы'],
  draw(c) {
    const { r, v, L, cw, id } = c;
    // Сочетание Вады из четырёх или близкие оттенки одной краски, от тёмной к светлой.
    // Мозаика — это большие плоскости: краски приглушены, чтобы не резали глаз.
    const [k0, k1, k2, k3] = palette(r, 4, 0.45).map((x) => mix(x, '#857c70', 0.22));
    // Плавный переход через все четыре краски: t от 0 до 1.
    const tone = (t: number) => (t < 1 / 3 ? mix(k0, k1, t * 3) : t < 2 / 3 ? mix(k1, k2, t * 3 - 1) : mix(k2, k3, Math.min(1, t * 3 - 2)));
    const font = pick(r, [F.heavy, F.tech, caps(F.narrow, 0.05), F.serif]);
    let art = '';
    if (v === 0) {
      // Центр где угодно; чем больше радиус, тем крупнее плитки и тем меньше их видно.
      const px = rand(r, 0, W);
      const py = rand(r, 0, H);
      const p = penrose(px, py, Math.hypot(Math.max(px, W - px), Math.max(py, H - py)) * rand(r, 1.05, 2.2), 3);
      art = path(p.thin, k1) + path(p.thick, k2) + stroke(p.edges, r() < 0.5 ? k3 : k0, 1.6, ' stroke-linejoin="round"');
    } else if (v === 1) {
      // От крупных клеток к мелким; краска клетки меняется плавно сверху вниз.
      const m = int(r, 2, 6);
      const box: [number, number, number, number] = [-10, -10, W + 10, H + 10];
      const cells = voronoi(seeds(r, m, Math.round(m * 1.5), box), box);
      const dir = r() < 0.5;
      art = cells.map((cl) => path(poly(cl), tone(Math.min(1, Math.max(0, (dir ? cl[0][1] : H - cl[0][1]) / H + rand(r, -0.15, 0.15)))))).join('') + stroke(cells.map((cl) => poly(cl)).join(''), light(k3, 0.5), 10 / m + 1, ' stroke-linejoin="round"');
    } else if (v === 2) {
      // Трюше: в каждой клетке две дуги, повёрнутые случайно; клетка от мелкой до крупной.
      const s = pick(r, [24, 32, 44, 60]);
      const h = s / 2;
      let d = '';
      for (let y = 0; y < H; y += s)
        for (let x = 0; x < W; x += s)
          d += r() < 0.5 ? `M${n(x + h)} ${n(y)}a${n(h)} ${n(h)} 0 0 1 ${n(-h)} ${n(h)}M${n(x + s)} ${n(y + h)}a${n(h)} ${n(h)} 0 0 0 ${n(-h)} ${n(h)}` : `M${n(x + h)} ${n(y)}a${n(h)} ${n(h)} 0 0 0 ${n(h)} ${n(h)}M${n(x)} ${n(y + h)}a${n(h)} ${n(h)} 0 0 1 ${n(h)} ${n(h)}`;
      art = grad(id + 'g', k0, tone(0.3), 1, 1) + stroke(d, k2, s * 0.28) + stroke(d, k3, s * 0.08);
    } else {
      // Кубы: ромбы трёх тонов — объём из плоской мозаики, от мелких до крупных.
      const s = pick(r, [10, 14, 20, 28, 40]);
      const w = s * Math.sqrt(3);
      const cube = (x: number, y: number) =>
        path(`M${n(x)} ${n(y)}l${n(w / 2)} ${n(s / 2)} ${n(-w / 2)} ${n(s / 2)} ${n(-w / 2)} ${n(-s / 2)}z`, k3) +
        path(`M${n(x - w / 2)} ${n(y + s / 2)}l${n(w / 2)} ${n(s / 2)}v${s}l${n(-w / 2)} ${n(-s / 2)}z`, k1) +
        path(`M${n(x)} ${n(y + s)}l${n(w / 2)} ${n(-s / 2)}v${s}l${n(-w / 2)} ${n(s / 2)}z`, k0);
      art = pattern(id + 'c', w, 3 * s, cube(w / 2, 0) + cube(0, 1.5 * s) + cube(w, 1.5 * s) + cube(w / 2, 3 * s) + cube(0, -1.5 * s) + cube(w, -1.5 * s), ` x="${n(rand(r, 0, w))}"`) + rect(0, 0, W, H, `url(#${id}c)`);
    }
    const by = r() < 0.5 ? 26 : 196;
    const plate = lum(k3) > 0.6 ? k3 : '#f4f1ea';
    return {
      svg: bg(k0) + art + rect(L - 6, by, cw + 12, 80, plate) + frame(L - 6, by, cw + 12, 80, dark(k0, 0.2), 2) + texts(c, { x: L + 2, y: by + 10, w: cw - 4, h: 60 }, { font, max: 20, lines: 3, color: on(plate), ac: seen([k1, k0], plate)[0], as: 8.5 }),
      tex: 'grain',
      age: 0.3,
      base: k0,
    };
  },
};

// ============ Кривые ============


// Кривая Гильберта: относительные шаги h/v — коротко.
function hilbert(order: number, step: number): string {
  let d = '';
  let dir = 0;
  const go = () => (d += dir === 0 ? `h${step}` : dir === 1 ? `v${step}` : dir === 2 ? `h${-step}` : `v${-step}`);
  const turn = (k: number) => (dir = (dir + k + 4) % 4);
  const h = (o: number, a: number) => {
    if (!o) return;
    turn(a);
    h(o - 1, -a);
    go();
    turn(-a);
    h(o - 1, a);
    go();
    h(o - 1, a);
    turn(-a);
    go();
    h(o - 1, -a);
    turn(a);
  };
  h(order, 1);
  return d;
}
// Кривая дракона: последовательность поворотов.
function dragon(order: number, step: number): string {
  let turns: number[] = [];
  for (let i = 0; i < order; i++) turns = [...turns, 1, ...turns.map((t) => -t).reverse()];
  let dir = 0;
  let d = '';
  for (const t of [0, ...turns]) {
    dir = (dir + t + 4) % 4;
    d += dir === 0 ? `h${step}` : dir === 1 ? `v${step}` : dir === 2 ? `h${-step}` : `v${-step}`;
  }
  return d;
}

export const curves: Style = {
  id: 'curves',
  name: 'Кривые',
  variants: ['Гильберт', 'Подсолнух', 'Золотое сечение', 'Дракон', 'Роза'],
  draw(c) {
    const { r, v, L, R, cx, cw } = c;
    // Фон — самая тёмная или самая светлая краска сочетания Вады (или близких оттенков), линии — остальные.
    const w = palette(r, 4, 0.35);
    const b = r() < 0.4 ? dark(w[0], 0.35) : light(w[3], 0.55);
    const [f1, f2, f3] = seen(shuffle(r, w), b);
    const ink = on(b);
    const font = pick(r, [F.tech, caps(F.narrow, 0.05), F.serif, F.heavy]);
    // Рисунок любого масштаба: мелкий целиком или крупный кусок; ниже черты — только текст.
    const m = rand(r, 0.6, 1.8);
    const fx = cx + rand(r, -40, 40) * m;
    const cy = 100 + rand(r, -30, 30) * m;
    let art = '';
    if (v === 0) {
      const o = pick(r, [3, 4, 5]);
      const size = 150 * m;
      const step = size / (2 ** o - 1);
      art = stroke(`M${n(fx - size / 2)} ${n(cy - size / 2)}` + hilbert(o, +n(step)), f1, Math.max(1.4, step * 0.4), ' stroke-linecap="square"');
    } else if (v === 1) {
      // Подсолнух: золотой угол; точки — отрезки нулевой длины с круглыми концами. Кольца — плавно от краски к краске.
      const ds = ['', '', '', ''];
      const sc = 3.4 + 3.4 * m;
      const k = Math.min(330, Math.round((150 / sc) ** 2));
      for (let i = 1; i <= k; i++) {
        const a = i * 2.39996;
        const rr = sc * Math.sqrt(i);
        ds[Math.min(3, Math.floor((i / k) * 4))] += `M${n(fx + rr * Math.cos(a))} ${n(cy + rr * Math.sin(a))}h0`;
      }
      const cs = ramp(f1, f2, 4);
      art = ds.map((d, i) => stroke(d, cs[i], sc * (0.5 + i * 0.2), ' stroke-linecap="round"')).join('');
    } else if (v === 2) {
      // Квадраты золотого прямоугольника и дуги спирали.
      let x = fx - 85 * m;
      let y = cy - 75 * m;
      let ww = 190 * m;
      let h = ww / 1.618;
      let out = '';
      let arcs = '';
      const fills = [f1, b, f2, light(f3, 0.2), b, f1, f2, b];
      for (let i = 0; i < 8; i++) {
        const s = Math.min(ww, h);
        const k = i % 4;
        const [sx, sy] = k === 0 ? [x, y] : k === 1 ? [x + ww - s, y] : k === 2 ? [x + ww - s, y + h - s] : [x, y + h - s];
        out += rect(sx, sy, s, s, fills[i], sk(ink, 1.6));
        const [ax, ay, bx, by] = k === 0 ? [sx, sy + s, sx + s, sy] : k === 1 ? [sx, sy, sx + s, sy + s] : k === 2 ? [sx + s, sy, sx, sy + s] : [sx + s, sy + s, sx, sy];
        arcs += `M${n(ax)} ${n(ay)}A${n(s)} ${n(s)} 0 0 1 ${n(bx)} ${n(by)}`;
        if (k === 0) {
          x += s;
          ww -= s;
        } else if (k === 1) {
          y += s;
          h -= s;
        } else if (k === 2) ww -= s;
        else h -= s;
      }
      art = out + stroke(arcs, ink, 2.2);
    } else if (v === 3) {
      // Дракон: от целого до крупного фрагмента.
      const o = int(r, 9, 11);
      const step = (rand(r, 0.8, 2.6) * 120) / 2 ** (o / 2);
      art = stroke(`M${n(fx - 30 * m)} ${n(cy + 10 * m)}` + dragon(o, +n(step)), f1, Math.max(1.2, step * 0.5), ` stroke-linejoin="round" transform="rotate(${int(r, 0, 3) * 90 + 45} ${n(fx)} ${n(cy)})"`);
    } else {
      // Роза r = cos(kθ), полупрозрачная.
      const [p, q] = pick(r, [
        [3, 1],
        [5, 2],
        [7, 3],
        [4, 1],
        [5, 3],
        [6, 5],
      ]);
      const pts: Pt[] = [];
      const turns = q % 2 && p % 2 ? q : 2 * q;
      const k = Math.round(360 / turns);
      for (let i = 0; i <= k * turns; i++) {
        const t = (i / k) * Math.PI * 2;
        const rr = 80 * m * Math.cos((p / q) * t);
        pts.push([fx + rr * Math.cos(t), cy + rr * Math.sin(t)]);
      }
      art = path(poly(pts), f1, ` fill-rule="evenodd" opacity="${n(rand(r, 0.55, 0.9))}"`) + stroke(poly(pts), ink, 1.2);
    }
    return {
      svg: bg(b) + clip(c.id + 'z', `M0 0H${W}V200H0Z`, art) + texts(c, { x: L, y: 214, w: cw, h: 70 }, { font, max: 22, lines: 3, color: ink, align: 'start', ac: f1, as: 9 }) + stroke(`M${n(L)} 206H${n(R)}`, ink, 1, ' opacity=".5"'),
      tex: 'grain',
      // Рамка — как у гравюры; золотому сечению она мешала бы квадратами у края.
      frame: v !== 2 && r() < 0.3 ? mix(ink, b, 0.4) : undefined,
      age: 0.2,
      base: b,
    };
  },
};

// ============ Рельеф ============

export const topo: Style = {
  id: 'topo',
  name: 'Рельеф',
  variants: ['Изолинии', 'Хребты', 'Сетка'],
  draw(c) {
    const { r, v, L, cw } = c;
    const w = byLum(wada(r, 3));
    const [b, ink, acc] = r() < 0.4 ? [dark(w[0], 0.4), light(w[2], 0.25), w[1]] : [light(w[2], 0.6), dark(w[0], 0.25), w[1]];
    const font = pick(r, [caps(F.narrow, 0.06), F.serif, F.tech]);
    let art = '';
    let tb = { x: L, y: 214, w: cw, h: 72 };
    let fr: string | undefined;
    if (v === 0) {
      // Изолинии вокруг двух вершин: полярные кривые с плавным шумом; шаг от частого до редкого.
      const sp = rand(r, 8, 17);
      const peaks: [number, number, number][] = [
        [rand(r, 30, 170), rand(r, 50, 150), Math.round(130 / sp)],
        [rand(r, 0, 200), rand(r, 140, 210), Math.round(70 / sp)],
      ];
      for (const [px, py, k] of peaks) {
        const ph = [rand(r, 0, 6), rand(r, 0, 6), rand(r, 0, 6)];
        for (let i = 1; i <= k; i++) {
          const p: Pt[] = [];
          for (let j = 0; j < 12; j++) {
            const t = (j / 12) * 2 * Math.PI;
            const rr = i * sp * (1 + 0.22 * Math.sin(2 * t + ph[0] + i * 0.15) + 0.12 * Math.sin(3 * t + ph[1]) + 0.08 * Math.sin(5 * t + ph[2] - i * 0.1));
            p.push([px + rr * Math.cos(t), py + rr * Math.sin(t) * 0.8]);
          }
          art += stroke(smooth(p), i % 5 === 0 ? acc : ink, i % 5 === 0 ? 2 : 1.2);
        }
      }
      art = clip(c.id + 'c', `M0 0H${W}V204H0Z`, art);
      // Как у карты: иногда рамка по краю.
      if (r() < 0.4) fr = ink;
    } else if (v === 1) {
      // Хребты: слои гор плавно от светлых к тёмным, иногда с уходом в другую краску.
      // Солнце разного размера, наполовину за горами, ниже текста.
      const k = int(r, 5, 7);
      const sr = rand(r, 10, 44);
      art = circle(rand(r, 0, W), rand(r, 96 + sr * 0.5, 150), sr, acc, op(rand(r, 0.6, 1)));
      const cs = ramp(light(mix(ink, acc, rand(r, 0, 0.6)), 0.7), ink, k);
      for (let i = 0; i < k; i++) {
        const y0 = 128 + (i * 130) / k;
        const a = rand(r, 10, 40);
        const p: Pt[] = [];
        for (let x = -20; x <= W + 20; x += 20) p.push([x, y0 - Math.abs(Math.sin(x * 0.03 + i * 1.7)) * a]);
        art += path(poly(p, false) + `L${W + 20} ${H}L-20 ${H}Z`, cs[i]);
      }
      tb = { x: L, y: 18, w: cw, h: 62 };
    } else {
      // Сетка: поверхность с горбом, строки закрывают те, что за ними.
      const hx = rand(r, 70, 130);
      const hy = rand(r, 60, 140);
      for (let i = 0; i < 18; i++) {
        const y0 = 30 + i * 10;
        const p: Pt[] = [];
        for (let x = -10; x <= W + 10; x += 10) {
          const d = ((x - hx) ** 2 + (y0 - hy) ** 2) / 2400;
          p.push([x, y0 - 70 * Math.exp(-d) - 4 * Math.sin(x * 0.1 + i)]);
        }
        art += path(poly(p, false) + `L${W + 10} ${y0 + 30}L-10 ${y0 + 30}Z`, b) + stroke(poly(p, false), i % 4 ? ink : acc, 1.3);
      }
    }
    return { svg: bg(b) + art + texts(c, tb, { font, max: 22, lines: 3, color: on(b, '#1d1b19', '#f2ece0'), align: 'start', ac: acc, as: 9 }), tex: 'grain', frame: fr, age: 0.25, base: b };
  },
};

// ============ Архитектура ============

const STONE = pal('e6dccb d9cdb8 ece4d6 cfc6b8');

export const arch: Style = {
  id: 'arch',
  name: 'Архитектура',
  variants: ['Бетон', 'Витраж', 'Фасад'],
  draw(c) {
    const { r, v, L, cx, cw, id } = c;
    const font = pick(r, [caps(F.narrow, 0.06), F.heavy, caps(F.antique, 0.12), F.serif]);
    let b = pick(r, STONE);
    let ink = '#2a2622';
    let acc = pick(r, ['#b5562f', '#2f5d7a', '#7a2e3b', '#3d6b4a', '#c99a2e']);
    let art = '';
    let tb = { x: L, y: 18, w: cw, h: 74 };
    if (v === 0) {
      // Бетон: модули с глубокими тенями, одно окно светится; модуль от мелкого до крупного.
      b = pick(r, ['#b9b5ad', '#a8a49c', '#c4bfb5']);
      const s = pick(r, [18, 26, 34, 48, 64]);
      const x0 = rand(r, -s, 0);
      const m = `<rect width="${n(s * 0.9)}" height="${n(s * 0.9)}" fill="${light(b, 0.12)}"/><path d="M${n(s * 0.2)} ${n(s * 0.27)}h${n(s * 0.5)}v${n(s * 0.5)}h${n(-s * 0.5)}z" fill="${dark(b, 0.45)}"/><path d="M${n(s * 0.2)} ${n(s * 0.27)}h${n(s * 0.5)}l-${n(s * 0.13)} ${n(s * 0.13)}h${n(-s * 0.37)}v${n(s * 0.37)}l-${n(s * 0.13)} ${n(s * 0.13)}z" fill="#000" opacity=".25"/>`;
      const lx = x0 + s * int(r, 1, Math.floor(W / s) - 1);
      const ly = 100 + s * int(r, 0, Math.floor(190 / s) - 1);
      art =
        pattern(id + 'b', s, s, m, ` x="${n(x0)}" y="100"`) +
        rect(0, 100, W, H - 100, `url(#${id}b)`) +
        rect(lx + s * 0.2, ly + s * 0.27, s * 0.5, s * 0.5, acc) +
        rect(0, 92, W, 8, dark(b, 0.3));
    } else if (v === 1) {
      // Витраж: круглое окно-роза или прямоугольная рама, стёкла — клетки Вороного.
      b = pick(r, ['#2a2622', '#1d1f2a', '#2b2320']);
      ink = '#efe6d6';
      const w = cw - 6;
      const x0 = cx - w / 2;
      const round = r() < 0.5;
      const top = round ? 110 - w / 2 : 18;
      const bot = round ? 110 + w / 2 : 200;
      const win = round ? `M${n(x0)} 110a${n(w / 2)} ${n(w / 2)} 0 1 0 ${n(w)} 0a${n(w / 2)} ${n(w / 2)} 0 1 0 ${n(-w)} 0Z` : `M${n(x0)} ${top}H${n(x0 + w)}V${bot}H${n(x0)}Z`;
      const m = int(r, 2, 5);
      const cells = voronoi(seeds(r, m, Math.round(m * 1.6), [x0, top, x0 + w, bot]), [x0, top, x0 + w, bot]);
      const jewel = palette(r, 4, 0.3);
      const glass = cells.map((cl) => path(poly(cl), pick(r, jewel))).join('') + stroke(cells.map((cl) => poly(cl)).join(''), '#141414', 9 / m + 1, ' stroke-linejoin="round"');
      art = clip(id + 'w', win, glass + `<linearGradient id="${id}gl" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".25"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/></linearGradient>` + rect(x0, top, w, bot - top, `url(#${id}gl)`)) + path(win, 'none', ` stroke="#141414" stroke-width="5"`);
      acc = '#e0a526';
      tb = { x: L, y: 214, w: cw, h: 70 };
    } else {
      // Фасад: стеклянная стена, в стёклах плавно переливается небо; шаг рам от мелкого до крупного.
      const sky = palette(r, 3, 0.6);
      const k = int(r, 3, 8);
      const s = W / k;
      for (let y = 104; y < H; y += s * 1.3)
        for (let x = 0; x < W; x += s) {
          const t = Math.min(1, Math.max(0, (x + y - 104) / 380 + rand(r, -0.1, 0.1)));
          art += rect(x, y, s, s * 1.3, t < 0.5 ? mix(sky[0], sky[1], t * 2) : mix(sky[1], sky[2], t * 2 - 1));
        }
      let d = '';
      for (let x = s; x < W; x += s) d += `M${n(x)} 104V${H}`;
      for (let y = 104; y < H; y += s * 1.3) d += `M0 ${n(y)}H${W}`;
      // Блик по стеклу наискосок.
      art +=
        `<linearGradient id="${id}gl" x2="1" y2=".6"><stop offset=".2" stop-color="#fff" stop-opacity="0"/><stop offset=".45" stop-color="#fff" stop-opacity=".35"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/></linearGradient>` +
        rect(0, 104, W, H - 104, `url(#${id}gl)`) +
        stroke(d, dark(b, 0.6), 1 + 5 / k) +
        rect(0, 96, W, 8, dark(b, 0.3));
    }
    return { svg: bg(b) + art + texts(c, tb, { font, max: 22, lines: 3, color: ink, align: 'start', ac: acc, as: 9, gap: 6 }), tex: 'grain', age: 0.4, base: b };
  },
};
