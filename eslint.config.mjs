import js from '@eslint/js';
import ts from 'typescript-eslint';
import astro from 'eslint-plugin-astro';

export default ts.config(
  { ignores: ['.astro/**', '.vercel/**', '.tools/**', '.recovery/**', 'dist/**', 'node_modules/**'] },
  js.configs.recommended,
  ...ts.configs.recommended,
  ...astro.configs.recommended,
  {
    languageOptions: { globals: { window:'readonly', document:'readonly', location:'readonly', history:'readonly', localStorage:'readonly', matchMedia:'readonly', performance:'readonly', innerWidth:'readonly', innerHeight:'readonly', devicePixelRatio:'readonly', CustomEvent:'readonly', requestAnimationFrame:'readonly', cancelAnimationFrame:'readonly', setTimeout:'readonly', clearTimeout:'readonly', fetch:'readonly', URL:'readonly', Response:'readonly', AbortSignal:'readonly', DOMException:'readonly', console:'readonly', process:'readonly' } },
    rules: { '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }] },
  },
  { files: ['**/*.astro'], rules: { 'astro/no-set-html-directive': 'error' } },
);
