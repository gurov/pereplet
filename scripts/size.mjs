// Вес пакета: минифицированный бандл и gzip. Порог — 25 КБ gzip.
import { build } from 'rolldown';
import { gzipSync } from 'node:zlib';
const out = await build({ input: 'src/index.ts', output: { format: 'esm', minify: true }, write: false, logLevel: 'warn' });
const code = out.output[0].code;
const gz = gzipSync(code, { level: 9 }).length;
console.log(`min ${(code.length / 1024).toFixed(1)} KB, gzip ${(gz / 1024).toFixed(1)} KB`);
if (gz > 25 * 1024) {
  console.error('больше 25 КБ gzip');
  process.exit(1);
}
