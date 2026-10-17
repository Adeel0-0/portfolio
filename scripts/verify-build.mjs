import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { resolve, dirname, join, sep } from 'node:path';
import { gzipSync } from 'node:zlib';

const root = resolve(existsSync('.vercel/output/static/index.html') ? '.vercel/output/static' : 'dist');
if (!existsSync(join(root, 'index.html'))) throw new Error('Home page was not generated');
function walk(dir) { return readdirSync(dir, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? walk(join(dir, entry.name)) : [join(dir, entry.name)]); }
const files = walk(root);
const htmlFiles = files.filter(file => file.endsWith('.html'));
let links = 0;
for (const page of htmlFiles) {
  const html = readFileSync(page, 'utf8');
  const pathname = '/' + page.slice(root.length + 1).replaceAll('\\', '/').replace(/index\.html$/, '');
  for (const [, value] of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
    if (/^(https?:|mailto:|tel:|data:)/.test(value)) continue;
    const url = new URL(value.replaceAll('&amp;', '&'), `http://build.local${pathname}`);
    let target = resolve(root, '.' + decodeURIComponent(url.pathname));
    if (target !== root && !target.startsWith(root + sep)) throw new Error(`Escaping link ${value}`);
    if (url.pathname.endsWith('/')) target = join(target, 'index.html');
    if (!existsSync(target)) throw new Error(`Broken internal link in ${pathname}: ${value}`);
    if (url.hash && target.endsWith('.html')) {
      const content = readFileSync(target, 'utf8');
      const id = decodeURIComponent(url.hash.slice(1));
      if (!content.includes(`id="${id}"`)) throw new Error(`Missing anchor in ${pathname}: ${value}`);
    }
    links++;
  }
}

const initial = new Set();
function follow(file) {
  if (initial.has(file)) return;
  initial.add(file);
  const source = readFileSync(file, 'utf8');
  // Only static imports: dynamic imports remain outside the arrival bundle.
  for (const [, specifier] of source.matchAll(/\b(?:import|export)\s*(?:[^('"`;]*?\s+from\s*)?["']([^"']+)["']/g)) {
    if (specifier.startsWith('.')) follow(resolve(dirname(file), specifier));
  }
}
const home = readFileSync(join(root, 'index.html'), 'utf8');
for (const [, src] of home.matchAll(/<script\b[^>]*\bsrc="([^"]+)"/g)) follow(resolve(root, '.' + src));
const gzip = file => gzipSync(readFileSync(file)).length;
const core = [...initial].reduce((sum, file) => sum + gzip(file), 0);
if (core > 75 * 1024) throw new Error(`Home arrival JavaScript is ${core} bytes gzip; budget is 76800`);
const effect = files.filter(file => /f1-scene.*\.js$/.test(file)).reduce((sum, file) => sum + gzip(file), 0);
if (!effect) throw new Error('Expected a separately built cinematic chunk');
if ([...initial].some(file => /f1-scene/.test(file))) throw new Error('Cinematic unexpectedly loads on arrival');
console.log(`Build verification: ${htmlFiles.length} pages, ${links} internal references; home JS ${(core / 1024).toFixed(1)} KB gzip; cinematic ${(effect / 1024).toFixed(1)} KB gzip.`);
