/**
 * Atelier : génère un seul visuel et en prend un instantané.
 *   node dev.mjs <panneau> [desktop|mobile] [fr|en] [attente en ms] [dossier]
 */
import fs from 'node:fs';
import path from 'node:path';
import { T } from './src/content.mjs';
import { PANELS } from './src/panels/index.mjs';
import { snap, closeSnap } from './src/core/snap.mjs';

const [name, variant = 'desktop', lang = 'fr', wait = '4500', outDir = process.env.FORGE_OUT ?? 'out'] = process.argv.slice(2);
if (!PANELS[name]) {
  console.error(`Panneaux : ${Object.keys(PANELS).join(', ')}`);
  process.exit(1);
}
fs.mkdirSync(outDir, { recursive: true });
const svg = await PANELS[name](T[lang], variant);
const file = path.join(outDir, `${name}-${variant}-${lang}.svg`);
fs.writeFileSync(file, svg);
const png = file.replace(/\.svg$/, '.png');
await snap(file, png, { wait: Number(wait) });
await closeSnap();
console.log(`${file} (${(svg.length / 1024).toFixed(1)} Ko) → ${png}`);
