// Палитры Вады Сандзо («A Dictionary of Color Combinations», 1933) → src/wada.ts.
// Данные — пакет dictionary-of-colour-combinations (MIT, Matt DesLauriers / Dain Blodorn Kim).
import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
const colors = createRequire(import.meta.url)('dictionary-of-colour-combinations');

const combos = new Map();
colors.forEach((c, i) => c.combinations.forEach((k) => (combos.has(k) ? combos.get(k).push(i) : combos.set(k, [i]))));
const ids = [...combos.keys()].sort((a, b) => a - b);
// Цвет — один знак: код 40 + номер (0…158 → «(»…«Ç»); «\» обходим.
const ch = (i) => String.fromCharCode(40 + i + (40 + i >= 92 ? 1 : 0));
const hex = colors.map((c) => c.hex.slice(1)).join('');
const flat = ids.map((k) => combos.get(k).map(ch).join('')).join('');
// Сочетания идут подряд: 120 по два, 120 по три, 108 по четыре.
const sizes = ids.map((k) => combos.get(k).length);
if (sizes.slice(0, 120).some((s) => s !== 2) || sizes.slice(120, 240).some((s) => s !== 3) || sizes.slice(240).some((s) => s !== 4)) throw new Error('порядок сочетаний не тот');
writeFileSync(
  'src/wada.ts',
  `// Создано scripts/wada.mjs. Вада Сандзо, «A Dictionary of Color Combinations» (1933): 159 цветов,\n` +
    `// 348 сочетаний (120 по два, 120 по три, 108 по четыре). Цвет в сочетании — знак: код − 40 (после «\\\\» − 41).\n` +
    `export const WADA_HEX = '${hex}';\nexport const WADA = ${JSON.stringify(flat)};\n`,
);
console.log(colors.length, 'цветов,', ids.length, 'сочетаний');
