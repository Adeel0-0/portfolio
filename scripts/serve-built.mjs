import { createServer } from "node:http";
import { existsSync, readFileSync, statSync } from "node:fs";
import { resolve, join, extname, sep } from "node:path";

const fixture = process.argv.includes('--fixture');
// PORT lets browser tests run beside the owner's `astro dev` on 4321.
const port = Number(process.env.PORT) || (fixture ? 4322 : 4321);
const root = resolve(fixture ? '.tools/content-fixture/.vercel/output/static' : '.vercel/output/static');
if (!existsSync(join(root, "index.html")))
  throw new Error("Run npm run build first");
const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css",
  ".js": "text/javascript",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".pdf": "application/pdf",
  ".xml": "application/xml",
  ".txt": "text/plain",
  ".woff2": "font/woff2",
};

createServer((req, res) => {
  if (!["GET", "HEAD"].includes(req.method)) {
    res.writeHead(405, { Allow: "GET, HEAD" });
    res.end();
    return;
  }
  try {
    const url = new URL(req.url, "http://localhost");
    let file = resolve(root, "." + decodeURIComponent(url.pathname));
    if (file !== root && !file.startsWith(root + sep)) {
      res.writeHead(400);
      res.end();
      return;
    }
    if (existsSync(file) && statSync(file).isDirectory())
      file = join(file, "index.html");
    let status = 200;
    if (!existsSync(file)) {
      file = join(root, "404.html");
      status = 404;
    }
    if (!existsSync(file)) {
      res.writeHead(404);
      res.end("Page not found");
      return;
    }
    res.writeHead(status, {
      "content-type": mime[extname(file)] || "application/octet-stream",
    });
    res.end(req.method === "HEAD" ? undefined : readFileSync(file));
  } catch {
    res.writeHead(400);
    res.end("Invalid request");
  }
}).listen(port, "127.0.0.1", () =>
  console.log(`Production build: http://127.0.0.1:${port}`),
);
