// Текст: ширины знаков из таблиц (src/metrics.ts), перенос по словам, подбор размера.
// Таблицы делают раскладку одинаковой везде — в браузере до загрузки шрифтов и в Node.
import { CHARS, WIDTHS } from './metrics.ts';
import { esc, n } from './core.ts';

export interface Font {
  key: string;
  weight: number;
  css: string;
  upper?: boolean; // всегда прописными
  ls?: number; // разрядка, em
}
const font = (key: string, weight: number, fallback: string, extra: Partial<Font> = {}): Font => ({ key, weight, css: `pp-${key},${fallback}`, ...extra });
export const F = {
  serif: font('serif', 700, 'Georgia,serif'),
  old: font('old', 700, 'Georgia,serif'),
  didone: font('didone', 700, 'Georgia,serif'),
  antique: font('antique', 400, 'Georgia,serif'),
  narrow: font('narrow', 600, "'Arial Narrow',sans-serif", { upper: true, ls: 0.03 }),
  tech: font('tech', 400, 'sans-serif'),
  heavy: font('heavy', 400, 'sans-serif', { upper: true }),
  slav: font('slav', 400, 'serif', { upper: true }),
  mono: font('mono', 400, 'monospace'),
};
// Тот же шрифт с другими настройками (прописные, разрядка).
export const caps = (f: Font, ls = 0.08): Font => ({ ...f, upper: true, ls });

const at = new Map([...CHARS].map((ch, i) => [ch, i]));
export const up = (s: string) => s.toLocaleUpperCase('ru');

// Шрифты, которые понадобились обложке: хозяин страницы дожидается их загрузки.
export const used = new Set<Font>();

export function measure(s: string, f: Font, size: number): number {
  const tab = WIDTHS[f.key];
  let w = 0;
  let count = 0;
  for (const ch of s) {
    const i = at.get(ch) ?? at.get(ch.normalize('NFD')[0]);
    w += i === undefined ? (ch.codePointAt(0)! > 0x2e80 ? 80 : 46) : tab.charCodeAt(i) - 32;
    count++;
  }
  return (w / 80 + (f.ls ?? 0) * count) * size;
}

export interface Fit {
  lines: string[];
  size: number;
  font: Font;
  lh: number; // межстрочный, доля размера
  maxW: number;
}
export interface FitOpts {
  maxW: number;
  lines?: number;
  max: number;
  min?: number;
  lh?: number;
}

function wrap(words: string[], f: Font, size: number, maxW: number): string[] {
  const lines: string[] = [];
  let line = '';
  for (const w of words) {
    const next = line ? `${line} ${w}` : w;
    if (!line || measure(next, f, size) <= maxW) line = next;
    else {
      lines.push(line);
      line = w;
    }
  }
  if (line) lines.push(line);
  return lines;
}

// Самый крупный размер, при котором текст влезает в maxLines строк; иначе обрезка с «…».
export function fit(text: string, f: Font, o: FitOpts): Fit | null {
  const s = f.upper ? up(text) : text;
  const words = s.split(/\s+/).filter(Boolean);
  if (!words.length) return null;
  const maxLines = o.lines ?? 4;
  const min = o.min ?? 9;
  const lh = o.lh ?? 1.12;
  for (let size = o.max; size >= min; size -= size > 20 ? 1 : 0.5) {
    const lines = wrap(words, f, size, o.maxW);
    if (lines.length <= maxLines && lines.every((l) => measure(l, f, size) <= o.maxW)) return { lines, size, font: f, lh, maxW: o.maxW };
  }
  let lines = wrap(words, f, min, o.maxW);
  if (lines.length > maxLines) {
    lines = lines.slice(0, maxLines);
    let last = lines[maxLines - 1] + '…';
    while (measure(last, f, min) > o.maxW && last.length > 2) last = last.slice(0, -2).trimEnd() + '…';
    lines[maxLines - 1] = last;
  }
  return { lines, size: min, font: f, lh, maxW: o.maxW };
}

export const cap = (t: Fit | null) => (t ? t.size * 0.7 : 0); // высота прописной
export const block = (t: Fit | null) => (t ? (t.lines.length - 1) * t.size * t.lh : 0);
export const height = (t: Fit | null) => (t ? cap(t) + block(t) : 0);

// y — базовая линия первой строки. Слишком длинное слово ужимается по ширине.
export function txt(t: Fit | null, x: number, y: number, fill: string, anchor = 'start', extra = ''): string {
  if (!t) return '';
  used.add(t.font);
  const f = t.font;
  const spans = t.lines
    .map((l, i) => {
      const squeeze = measure(l, f, t.size) > t.maxW + 0.5 ? ` textLength="${n(t.maxW)}" lengthAdjust="spacingAndGlyphs"` : '';
      return `<tspan x="${n(x)}" y="${n(y + i * t.size * t.lh)}"${squeeze}>${esc(l)}</tspan>`;
    })
    .join('');
  const ls = f.ls ? ` letter-spacing="${n(f.ls * t.size)}"` : '';
  const a = anchor === 'start' ? '' : ` text-anchor="${anchor}"`;
  return `<text font-family="${f.css}" font-weight="${f.weight}" font-size="${n(t.size)}" fill="${fill}"${a}${ls}${extra}>${spans}</text>`;
}
