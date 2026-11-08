// Галерея для просмотра: gallery/out/index.html (сборка пакета и книги внутри) + fonts/.
import { build } from 'rolldown';
import { gzipSync } from 'node:zlib';
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, readdirSync, statSync } from 'node:fs';
import { drawCover, STYLES } from '../src/index.ts';

const iife = (await build({ input: 'src/index.ts', output: { format: 'iife', name: 'PP', minify: true }, write: false, logLevel: 'warn' })).output[0].code;
const esm = (await build({ input: 'src/index.ts', output: { format: 'esm', minify: true }, write: false, logLevel: 'warn' })).output[0].code;
const books = JSON.parse(readFileSync('gallery/books.json', 'utf8'));
const fonts = readdirSync('fonts').filter((f) => f.endsWith('.woff2'));
let ms = 0;
let k = 0;
for (const s of STYLES)
  for (let v = 0; v < s.variants.length; v++)
    for (const [title, author] of books.slice(0, 20)) {
      const t = performance.now();
      drawCover({ title, author }, { style: s.id, variant: v });
      ms += performance.now() - t;
      k++;
    }
const stats = {
  gzip: (gzipSync(esm, { level: 9 }).length / 1024).toFixed(1).replace('.', ','),
  fonts: Math.round(fonts.reduce((n, f) => n + statSync('fonts/' + f).size, 0) / 1024),
  ms: (ms / k).toFixed(2).replace('.', ','),
};
mkdirSync('gallery/out/fonts', { recursive: true });
for (const f of fonts) copyFileSync('fonts/' + f, 'gallery/out/fonts/' + f);
const html = readFileSync('gallery/index.html', 'utf8')
  .replace('/*BUNDLE*/', () => iife)
  .replace('/*BOOKS*/[]', () => JSON.stringify(books))
  .replace('/*STATS*/{}', () => JSON.stringify(stats));
writeFileSync('gallery/out/index.html', html);
// Для просмотра здесь: при публикации кодировку добавляет обёртка страницы.
writeFileSync('gallery/out/preview.html', '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' + html);
console.log('gallery/out/index.html', (html.length / 1024).toFixed(0), 'KB', stats);
