// Builds one Cloudflare Worker that serves vesyron.com (no build tools needed).
// Usage: node site/vesyron/build-worker.mjs  ->  site/vesyron/worker.js (deployed as the vesyron-site Worker)
import fs from 'node:fs';
import path from 'node:path';
const here = path.dirname(new URL(import.meta.url).pathname);
const root = path.resolve(here, '../..');
const read = (p) => fs.readFileSync(path.join(here, p));
const privacy = fs.readFileSync(path.join(root, 'public/privacy.html'), 'utf8')
  .replace('<main>', '<main><p style="margin:0 0 16px"><a href="/towershift/">← TOWER//SHIFT</a></p>');
const files = {
  '/': { type: 'text/html; charset=utf-8', body: read('index.html').toString() },
  '/towershift/': { type: 'text/html; charset=utf-8', body: read('towershift/index.html').toString() },
  '/towershift/privacy': { type: 'text/html; charset=utf-8', body: privacy },
  '/style.css': { type: 'text/css; charset=utf-8', body: read('style.css').toString() },
  '/logo.webp': { type: 'image/webp', b64: read('logo.webp').toString('base64') },
  '/towershift-icon.webp': { type: 'image/webp', b64: read('towershift-icon.webp').toString('base64') },
  '/towershift-shot.webp': { type: 'image/webp', b64: read('towershift-shot.webp').toString('base64') },
  '/robots.txt': { type: 'text/plain', body: 'User-agent: *\nAllow: /\n' },
};
// app-ads.txt is added once the AdMob publisher ID exists (see site/vesyron/app-ads.txt)
if (fs.existsSync(path.join(here, 'app-ads.txt'))) files['/app-ads.txt'] = { type: 'text/plain', body: read('app-ads.txt').toString() };
const aliases = { '/towershift': '/towershift/', '/towershift/privacy/': '/towershift/privacy', '/towershift/privacy.html': '/towershift/privacy', '/index.html': '/' };
const worker = `const FILES = ${JSON.stringify(files)};
const ALIASES = ${JSON.stringify(aliases)};
const SEC = { 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'strict-origin-when-cross-origin', 'Strict-Transport-Security': 'max-age=31536000', 'X-Frame-Options': 'DENY' };
function b64(s){const b=atob(s);const u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return u;}
export default { async fetch(req) {
  const url = new URL(req.url);
  if (url.hostname === 'www.vesyron.com') { url.hostname = 'vesyron.com'; return Response.redirect(url.toString(), 301); }
  let p = url.pathname;
  if (ALIASES[p]) { url.pathname = ALIASES[p]; return Response.redirect(url.toString(), 301); }
  const f = FILES[p];
  if (!f) return new Response('Not found', { status: 404, headers: { 'content-type': 'text/plain', ...SEC } });
  const cache = f.b64 || p.endsWith('.css') ? 'public, max-age=86400' : 'public, max-age=300';
  return new Response(f.b64 ? b64(f.b64) : f.body, { headers: { 'content-type': f.type, 'cache-control': cache, ...SEC } });
} };
`;
fs.writeFileSync(path.join(here, 'worker.js'), worker);
console.log('worker.js', worker.length, 'bytes');
