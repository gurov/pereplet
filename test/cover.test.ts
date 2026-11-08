import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { drawCover, STYLES } from '../src/index.ts';
import { hash } from '../src/core.ts';
import { F, fit, measure } from '../src/text.ts';

const books: [string, string][] = JSON.parse(readFileSync(new URL('../gallery/books.json', import.meta.url), 'utf8'));

test('каждый вариант каждого стиля рисуется без NaN и с текстом', () => {
  for (const s of STYLES)
    for (let v = 0; v < s.variants.length; v++)
      for (const [title, author] of books.slice(0, 40)) {
        const c = drawCover({ title, author }, { style: s.id, variant: v });
        assert.ok(c.svg.startsWith('<svg') && c.svg.endsWith('</svg>'), `${s.id}/${v}`);
        assert.doesNotMatch(c.svg, /NaN|undefined|Infinity/, `${s.id}/${v}: ${title}`);
        assert.ok(c.fonts.length > 0, `${s.id}/${v}: нет шрифтов`);
        assert.ok(c.svg.length < 40_000, `${s.id}/${v}: ${c.svg.length} B`);
      }
});

test('пустое название, без автора, длинные и странные строки', () => {
  for (const s of STYLES)
    for (let v = 0; v < s.variants.length; v++) {
      for (const b of [{ title: '' }, { title: '   ', author: '' }, { title: 'А'.repeat(300), author: 'Б '.repeat(80) }, { title: '<script>&"', author: 'Ü ß 日本語 🙂' }]) {
        const c = drawCover(b, { style: s.id, variant: v });
        assert.doesNotMatch(c.svg, /NaN|undefined|<script/, `${s.id}/${v}`);
      }
    }
});

test('одна книга — одна обложка; автор — одна серия', () => {
  const a = drawCover({ title: 'Мастер и Маргарита', author: 'Михаил Булгаков' });
  assert.equal(drawCover({ title: 'Мастер и Маргарита', author: 'Михаил Булгаков' }).svg, a.svg);
  for (const author of ['М. А. Булгаков', 'Булгаков', 'михаил булгаков'])
    assert.equal(drawCover({ title: 'Собачье сердце', author }).style, a.style);
});

test('текст влезает в заданную ширину', () => {
  for (const f of Object.values(F)) {
    const t = fit('Повесть о настоящем человеке и другие истории', f, { maxW: 120, max: 30, lines: 3 })!;
    for (const l of t.lines) assert.ok(measure(l, f, t.size) <= 120 + 0.5 || l.endsWith('…') || !l.includes(' '), `${f.key}: ${l}`);
  }
  assert.equal(measure('é', F.serif, 10), measure('e', F.serif, 10));
});

// Обложки не меняются в пределах мажорной версии: снимок хешей SVG.
// Обновить намеренно: UPDATE=1 npm test.
test('снимок обложек', () => {
  const file = new URL('./snapshot.json', import.meta.url);
  const now: Record<string, string> = {};
  for (const [title, author] of books.slice(0, 80)) now[`${title}|${author}`] = hash(drawCover({ title, author }).svg).toString(36);
  if (process.env.UPDATE || !existsSync(file)) writeFileSync(file, JSON.stringify(now, null, 1) + '\n');
  else assert.deepEqual(now, JSON.parse(readFileSync(file, 'utf8')));
});
