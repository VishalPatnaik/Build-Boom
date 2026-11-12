# vesyron.com

Company site for Vesyron. A tiny Cloudflare Worker (`vesyron-site`, source `worker.js`) serves
the files in `public/` straight from this GitHub repo on `vesyron.com`
and `www.vesyron.com` (www redirects to the bare domain).

| Path | What |
|---|---|
| `/` | Vesyron home: logo and list of apps |
| `/towershift/` | TOWER//SHIFT page (support: towershift@vesyron.com) |
| `/towershift/privacy` | TOWER//SHIFT privacy policy (source: `public/privacy.html`) |
| `/app-ads.txt` | Add `public/app-ads.txt` once the AdMob publisher ID exists |

Email: Cloudflare Email Routing forwards `towershift@vesyron.com` to the owner's Gmail.
Add one address per app (`<app>@vesyron.com`) the same way.

## Update the site

1. Edit files in `site/vesyron/public/` (the privacy policy comes from `public/privacy.html`).
2. `node site/vesyron/build-worker.mjs` (copies the privacy policy in).
3. Commit and push. The site picks up changes within about 5 minutes.

Only if `worker.js` changes: Cloudflare dashboard → Workers & Pages → `vesyron-site` → Edit code →
paste `worker.js` → Deploy. If the repo's default branch changes, update `SRC` in `worker.js`.

## Add another app

Add `site/vesyron/public/<app>/index.html` and a card on `public/index.html`, then push. Add `<app>@vesyron.com` in Email Routing → Routing rules.
