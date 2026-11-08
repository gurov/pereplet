// Шрифты обложек: подмножество (латиница, кириллица, знаки) → fonts/*.woff2, fonts.css
// и таблица ширин src/metrics.ts. Исходники — TTF из github.com/google/fonts:
//   node scripts/fonts.mjs <папка с TTF>
// Имена файлов в папке — ключи FONTS ниже (<key>.ttf и <key>-OFL.txt).
import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'node:fs';
import { join } from 'node:path';
import subsetFont from 'subset-font';
import * as fontkit from 'fontkit';

const src = process.argv[2];
if (!src) throw new Error('usage: node scripts/fonts.mjs <dir with ttf>');

// key → [файл, семейство в SVG, жирность, оси]
export const FONTS = {
  serif: ['ptserif', 700],
  didone: ['playfairdisplay', 700, { wght: 700 }],
  narrow: ['oswald', 600, { wght: 600 }],
  tech: ['russoone', 400],
  mono: ['ptmono', 400],
  antique: ['forum', 400],
  slav: ['ruslandisplay', 400],
  heavy: ['rubikmonoone', 400],
  old: ['oldstandardtt', 700],
};

const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => String.fromCodePoint(a + i)).join('');
// Ширины меряются для этих знаков; остальное в шрифте тоже есть, но меряется «в среднем».
// Латиница с диакритикой меряется по базовой букве (é → e), см. measure() в src/text.ts.
export const CHARS = range(0x20, 0x7e) + range(0x410, 0x44f) + 'Ёё–—‘’“”„«»…№•';
const TEXT = CHARS + range(0xa0, 0xff) + range(0x400, 0x45f) + '‚′″€−';

mkdirSync('fonts', { recursive: true });
let css = '/* Шрифты pereplet (SIL OFL 1.1, лицензии рядом). */\n';
const widths = {};
for (const [key, [file, weight, axes]] of Object.entries(FONTS)) {
  const ttf = readFileSync(join(src, file + '.ttf'));
  const opts = { targetFormat: 'woff2', noHinting: true, keepFeatures: [], ...(axes ? { variationAxes: axes } : {}) };
  const woff2 = await subsetFont(ttf, TEXT, opts);
  writeFileSync(`fonts/${key}.woff2`, woff2);
  copyFileSync(join(src, file + '-OFL.txt'), `fonts/${key}-OFL.txt`);
  css += `@font-face{font-family:pp-${key};src:url(./${key}.woff2) format("woff2");font-weight:${weight};font-display:swap}\n`;
  const font = fontkit.create(await subsetFont(ttf, TEXT, { targetFormat: 'truetype', ...(axes ? { variationAxes: axes } : {}) }));
  const upm = font.unitsPerEm;
  let s = '';
  for (const ch of CHARS) {
    const g = font.glyphForCodePoint(ch.codePointAt(0));
    const w = g.id ? g.advanceWidth / upm : 0.6;
    s += String.fromCharCode(Math.min(126, 32 + Math.round(w * 80)));
  }
  widths[key] = s;
  console.log(key.padEnd(8), String(woff2.length).padStart(6), 'B', font.familyName);
}
writeFileSync('fonts/fonts.css', css);
writeFileSync(
  'src/metrics.ts',
  `// Создано scripts/fonts.mjs. Ширины знаков CHARS в 1/80 em, код знака − 32.\n` +
    `export const CHARS = ${JSON.stringify(CHARS)};\n` +
    `export const WIDTHS: Record<string, string> = ${JSON.stringify(widths, null, 1)};\n`,
);
