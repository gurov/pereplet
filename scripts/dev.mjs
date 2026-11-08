// Сборка для страницы gallery/dev.html: window.PP.
import { build } from 'rolldown';
await build({ input: 'src/index.ts', output: { file: 'gallery/dev/pereplet.js', format: 'iife', name: 'PP', minify: false }, logLevel: 'warn' });
