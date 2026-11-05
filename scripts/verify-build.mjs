import { existsSync, readdirSync, readFileSync } from "node:fs";
import { resolve, join, sep } from "node:path";
import { gzipSync } from "node:zlib";
import { collectStaticScripts } from "./build-assets.ts";

const root = resolve(
  existsSync(".vercel/output/static/index.html")
    ? ".vercel/output/static"
    : "dist",
);
if (!existsSync(join(root, "index.html")))
  throw new Error("Home page was not generated");
function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? walk(join(dir, entry.name)) : [join(dir, entry.name)],
  );
}
const files = walk(root);
const htmlFiles = files.filter((file) => file.endsWith(".html"));
let links = 0;
for (const page of htmlFiles) {
  const html = readFileSync(page, "utf8");
  const pathname =
    "/" +
    page
      .slice(root.length + 1)
      .replaceAll("\\", "/")
      .replace(/index\.html$/, "");
  for (const [, value] of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
    if (/^(https?:|mailto:|tel:|data:)/.test(value)) continue;
    const url = new URL(
      value.replaceAll("&amp;", "&"),
      `http://build.local${pathname}`,
    );
    let target = resolve(root, "." + decodeURIComponent(url.pathname));
    if (target !== root && !target.startsWith(root + sep))
      throw new Error(`Escaping link ${value}`);
    if (url.pathname.endsWith("/")) target = join(target, "index.html");
    if (!existsSync(target))
      throw new Error(`Broken internal link in ${pathname}: ${value}`);
    if (url.hash && target.endsWith(".html")) {
      const content = readFileSync(target, "utf8");
      const id = decodeURIComponent(url.hash.slice(1));
      if (!content.includes(`id="${id}"`))
        throw new Error(`Missing anchor in ${pathname}: ${value}`);
    }
    links++;
  }
}

const home = readFileSync(join(root, "index.html"), "utf8");
const entries = [...home.matchAll(/<script\b[^>]*\bsrc="([^"]+)"/g)].map(
  ([, src]) => resolve(root, "." + src),
);
const initial = collectStaticScripts(entries, root);
const gzip = (file) => gzipSync(readFileSync(file)).length;
const core = [...initial].reduce((sum, file) => sum + gzip(file), 0);
if (core > 75 * 1024)
  throw new Error(
    `Home arrival JavaScript is ${core} bytes gzip; budget is 76800`,
  );
// The optional F1 graphics (lights-out transition, circuit track, animated
// gradient backdrop) and everything they import: Three.js, React and the
// React Three Fiber renderer.
const effectEntries = files.filter((file) =>
  /(?:f1-scene|circuit-scene|F1Gradient).*\.js$/.test(file),
);
if (effectEntries.length < 3)
  throw new Error("Expected separate transition, circuit and backdrop chunks");
const effectGraph = collectStaticScripts(effectEntries, root);
const effect = [...effectGraph].reduce((sum, file) => sum + gzip(file), 0);
const engine = [...effectGraph].filter((file) => /three/i.test(file));
if (!engine.length) throw new Error("Expected Three.js inside the lazy 3D graph");
// Minimal arrival must not load the 3D effects or the engine.
const lazyOnly = [...effectGraph].filter(
  (file) => /(?:f1-scene|circuit-scene|F1Gradient|three|react|client)/i.test(file),
);
if (lazyOnly.some((file) => initial.has(file)))
  throw new Error("3D code unexpectedly loads on arrival");
console.log(
  `Build verification: ${htmlFiles.length} pages, ${links} internal references; home JS ${(core / 1024).toFixed(1)} KB gzip; optional F1 graphics ${(effect / 1024).toFixed(1)} KB gzip.`,
);
