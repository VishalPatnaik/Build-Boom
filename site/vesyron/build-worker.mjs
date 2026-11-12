// vesyron.com is served by a tiny Cloudflare Worker (worker.js) that reads the files in
// site/vesyron/public from this GitHub repo and caches them at the edge.
// So: edit files in site/vesyron/public, run this script, commit and push. The site updates
// within ~5 minutes. Redeploy worker.js only if worker.js itself changes.
// This script copies the app privacy policy into the site.
import fs from 'node:fs';
import path from 'node:path';
const here = path.dirname(new URL(import.meta.url).pathname);
const root = path.resolve(here, '../..');
const privacy = fs.readFileSync(path.join(root, 'public/privacy.html'), 'utf8')
  .replace('<main>', '<main><p style="margin:0 0 16px"><a href="/towershift/">← TOWER//SHIFT</a></p>');
fs.writeFileSync(path.join(here, 'public/towershift/privacy.html'), privacy);
console.log('copied privacy policy');
