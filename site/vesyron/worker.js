// vesyron.com: serves site/vesyron/public from GitHub, cached at Cloudflare's edge.
const SRC = 'https://raw.githubusercontent.com/VishalPatnaik/Build-Boom/claude/physics-and-payment-fixes/site/vesyron/public';
const TYPES = { html: 'text/html; charset=utf-8', css: 'text/css; charset=utf-8', webp: 'image/webp', png: 'image/png', svg: 'image/svg+xml', txt: 'text/plain; charset=utf-8', ico: 'image/x-icon' };
const ALIAS = { '/towershift': '/towershift/', '/towershift/privacy/': '/towershift/privacy', '/towershift/privacy.html': '/towershift/privacy', '/index.html': '/' };
const SEC = { 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'strict-origin-when-cross-origin', 'Strict-Transport-Security': 'max-age=31536000', 'X-Frame-Options': 'DENY' };
export default {
  async fetch(req, env, ctx) {
    const url = new URL(req.url);
    if (url.hostname.startsWith('www.')) { url.hostname = url.hostname.slice(4); return Response.redirect(url.toString(), 301); }
    if (ALIAS[url.pathname]) { url.pathname = ALIAS[url.pathname]; return Response.redirect(url.toString(), 301); }
    let p = url.pathname;
    if (p.endsWith('/')) p += 'index.html';
    else if (!/\.[a-z0-9]+$/i.test(p)) p += '.html';
    if (p.includes('..')) return new Response('Not found', { status: 404 });
    const cache = caches.default;
    const key = new Request(url.origin + p);
    let res = await cache.match(key);
    if (!res) {
      const up = await fetch(SRC + p, { cf: { cacheTtl: 300 } });
      if (!up.ok) return new Response('Not found', { status: 404, headers: { 'content-type': 'text/plain', ...SEC } });
      const ext = p.split('.').pop().toLowerCase();
      res = new Response(up.body, { headers: { 'content-type': TYPES[ext] || 'application/octet-stream', 'cache-control': ext === 'html' || ext === 'txt' ? 'public, max-age=300' : 'public, max-age=86400', ...SEC } });
      ctx.waitUntil(cache.put(key, res.clone()));
    }
    return res;
  },
};
