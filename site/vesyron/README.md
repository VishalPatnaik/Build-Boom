# vesyron.com

Company site for Vesyron, served by one Cloudflare Worker (`vesyron-site`) on `vesyron.com`
and `www.vesyron.com` (www redirects to the bare domain).

| Path | What |
|---|---|
| `/` | Vesyron home: logo and list of apps |
| `/towershift/` | TOWER//SHIFT page (support: towershift@vesyron.com) |
| `/towershift/privacy` | TOWER//SHIFT privacy policy (source: `public/privacy.html`) |
| `/app-ads.txt` | Served automatically once `site/vesyron/app-ads.txt` exists (AdMob) |

Email: Cloudflare Email Routing forwards `towershift@vesyron.com` to the owner's Gmail.
Add one address per app (`<app>@vesyron.com`) the same way.

## Update the site

1. Edit the HTML/CSS here (or `public/privacy.html`).
2. `node site/vesyron/build-worker.mjs` (writes `site/vesyron/worker.js`).
3. Cloudflare dashboard → Workers & Pages → `vesyron-site` → Edit code → paste `worker.js` → Deploy.

## Add another app

Add `site/vesyron/<app>/index.html`, a card on `index.html`, and its routes in `build-worker.mjs`,
then rebuild and deploy. Add `<app>@vesyron.com` in Email Routing → Routing rules.
