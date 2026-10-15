/**
 * Construit tous les visuels du profil et réécrit les deux README.
 *   npm run build                 → assets/<langue>/*.svg, README.md, README.fr.md
 *   npm run build -- --snap DIR   → et un instantané PNG de chaque panneau dans DIR
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { T } from './src/content.mjs';
import { PANELS } from './src/panels/index.mjs';
import { button, buttonSet } from './src/panels/buttons.mjs';
import { readme } from './src/readme.mjs';
import { snap, closeSnap } from './src/core/snap.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'assets');
const args = process.argv.slice(2);
const snapDir = args.includes('--snap') ? args[args.indexOf('--snap') + 1] : null;
const only = args.includes('--only') ? args[args.indexOf('--only') + 1].split(',') : null;

let total = 0;
let count = 0;
for (const lang of ['fr', 'en']) {
  const dir = path.join(OUT, lang);
  fs.mkdirSync(dir, { recursive: true });
  // on repart de zéro pour les SVG ; les images animées (rituals.mjs) restent
  if (!only) for (const f of fs.readdirSync(dir)) if (f.endsWith('.svg')) fs.rmSync(path.join(dir, f));
  const write = (file, svg) => {
    fs.writeFileSync(path.join(dir, file), svg);
    total += svg.length;
    count += 1;
  };
  for (const [name, fn] of Object.entries(PANELS)) {
    if (only && !only.includes(name)) continue;
    for (const variant of ['desktop', 'mobile']) {
      const file = `${name}${variant === 'mobile' ? '.mobile' : ''}.svg`;
      write(file, await fn(T[lang], variant));
      if (snapDir) await snap(path.join(dir, file), path.join(snapDir, lang, file.replace(/\.svg$/, '.png')), { wait: 4500 });
    }
  }
  if (!only) for (const [id, opts] of Object.entries(buttonSet(T[lang]))) write(`btn-${id}.svg`, await button(T[lang], opts));
  console.log(`✓ ${lang}`);
}
if (!only) {
  fs.writeFileSync(path.join(ROOT, 'README.md'), readme(T.en));
  fs.writeFileSync(path.join(ROOT, 'README.fr.md'), readme(T.fr));
}
await closeSnap();
console.log(`${count} fichiers, ${(total / 1024 / 1024).toFixed(2)} Mo`);
