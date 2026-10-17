// Serves apps/docs/dist the way Read the Docs does: under /en/latest/, directory index.html, 404.html for misses.
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

const root = new URL("../apps/docs/dist/", import.meta.url).pathname;
const prefix = "/en/latest/";
const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".png": "image/png", ".json": "application/json" };
const port = Number(process.env.PORT ?? 4321);

createServer(async (req, res) => {
  const url = decodeURIComponent(new URL(req.url, "http://x").pathname);
  if (url === "/") { res.writeHead(302, { location: prefix }); return res.end(); }
  let file = url.startsWith(prefix) ? join(root, normalize("./" + url.slice(prefix.length))) : null;
  try {
    if (!file || !(file + "/").startsWith(root)) throw 0;
    if ((await stat(file)).isDirectory()) file = join(file, "index.html");
    const body = await readFile(file);
    res.writeHead(200, { "content-type": types[extname(file)] ?? "application/octet-stream" });
    res.end(body);
  } catch {
    res.writeHead(404, { "content-type": types[".html"] });
    res.end(await readFile(join(root, "404.html")));
  }
}).listen(port, () => console.log(`RTD-like server: http://localhost:${port}${prefix}`));
