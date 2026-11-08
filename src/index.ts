// pereplet — обложки книг, которые рисуются из названия и автора: SVG без картинок и запросов.
//
// - Стиль зависит только от автора: книги одного автора выглядят как одна серия.
//   Фамилия — последнее слово автора не короче трёх букв: «Булгаков», «М. А. Булгаков»
//   и «Михаил Булгаков» — одно и то же. Без автора стиль решает название.
// - Вариант стиля, краски, шрифт, толщина корешка и потёртости — от названия и фамилии.
// - Текст раскладывается по таблицам ширин знаков, поэтому результат одинаков везде.
//   Шрифты — fonts/fonts.css; список нужных обложке — в `fonts` (дождаться document.fonts.load).
import { H, W, hash, rng, weighted } from './core.ts';
import { used } from './text.ts';
import { SPINE, spine, texture, wear, type Ctx, type Style } from './cover.ts';
import { STYLES as ALL } from './styles/index.ts';

export interface Book {
  title: string;
  author?: string;
}
export interface Options {
  style?: string; // id стиля вместо выбранного по автору
  variant?: number;
  spine?: number; // ширина полосы корешка из 200 (0 или 34)
  age?: number; // 0…1 вместо выбранной
  id?: string; // приставка id внутри SVG
}
export interface Cover {
  svg: string;
  style: string;
  variant: string;
  fonts: string[]; // для document.fonts.load
}

export const STYLES: readonly Pick<Style, 'id' | 'name' | 'variants'>[] = ALL.map(({ id, name, variants }) => ({ id, name, variants }));

const words = (s: string) =>
  s
    .toLowerCase()
    .replace(/ё/g, 'е')
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean);
const surname = (author: string) => words(author).filter((w) => w.length >= 3).pop() ?? '';

export function drawCover(book: Book, opts: Options = {}): Cover {
  const title = book.title.trim() || 'Без названия';
  const author = (book.author ?? '').trim();
  const key = `${words(title).join(' ')}|${surname(author)}`;
  const style = ALL.find((s) => s.id === opts.style) ?? weighted(rng(hash('style|' + (surname(author) || words(title).join(' ')))), ALL, (s) => s.w ?? 1);
  const r = rng(hash(key));
  const v0 = Math.floor(r() * style.variants.length);
  const v = opts.variant ?? v0;
  const s0 = r() < (style.sp ?? 0.5) ? SPINE : 0;
  const s = opts.spine ?? s0;
  const a0 = r() ** 1.6;
  const id = opts.id ?? 'p' + hash(key + style.id).toString(36);
  const L = s ? s + 12 : 16;
  const c: Ctx = { title, author, r, v, id, s, L, R: W - 14, cx: (L + W - 14) / 2, cw: W - 14 - L };
  used.clear();
  const art = style.draw(c);
  const age = opts.age ?? a0 * (art.age ?? 0.3);
  const base = art.base ?? '#808080';
  const body = art.svg + texture(id, art.tex ?? 'grain') + spine(c, art) + wear(c, age, base);
  return {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}">${body}</svg>`,
    style: style.name,
    variant: style.variants[v] ?? String(v),
    fonts: [...used].map((f) => `${f.weight} 16px pp-${f.key}`),
  };
}
