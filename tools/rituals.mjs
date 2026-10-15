/**
 * L'image animée « Allumer une étoile » : les quatre vrais enregistrements de
 * Bloodborne Legendary Run (boss, lieu, rune, gemme) joués ensemble, dans les
 * téléphones du panneau rituals. Le fond vient du SVG ; chaque image de la
 * vidéo est incrustée dans son écran, puis l'ensemble devient un WebP animé.
 *
 * Demande ffmpeg et img2webp (libwebp) : brew install ffmpeg webp.
 *   node rituals.mjs            → assets/<langue>/rituals.webp et rituals.mobile.webp
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { T } from './src/content.mjs';
import { ritualsBase } from './src/panels/rituals.mjs';
import { snap, closeSnap } from './src/core/snap.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(HERE, '../assets');
const FPS = 12.5;
/**
 * Largeur publiée : un peu au-dessus de l'affichage (≈ 846 px dans le profil,
 * ≈ 358 px sur téléphone), pour un poids raisonnable.
 */
const OUT_W = { desktop: 1024, mobile: 540 };
/**
 * Réglages de l'encodeur. Les dégradés sombres de l'application supportent
 * mal le lossy à différences d'images : des pavés apparaissent. Des images
 * clés fréquentes et une qualité haute les évitent.
 */
const ENCODER = (process.env.RITUALS_ENC ?? '-lossy -q 78 -m 4 -kmin 3 -kmax 6').split(' ');

for (const lang of ['fr', 'en']) {
  for (const variant of ['desktop', 'mobile']) {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'rituels-'));
    const { svg, screens, w } = await ritualsBase(T[lang], variant);
    fs.writeFileSync(path.join(tmp, 'fond.svg'), svg);
    await snap(path.join(tmp, 'fond.svg'), path.join(tmp, 'fond.png'), { wait: 4500, width: w });
    // les images de chaque vidéo, à la taille de leur écran, coins arrondis
    const clips = [];
    for (const s of screens) {
      const dir = path.join(tmp, s.id);
      fs.mkdirSync(dir);
      execFileSync('ffmpeg', ['-v', 'error', '-i', path.join(HERE, 'sources/rituels', `${s.id}.mp4`), '-vf', `fps=${FPS},scale=${s.w}:${s.h}:flags=lanczos`, path.join(dir, '%04d.png')]);
      clips.push({ s, files: fs.readdirSync(dir).sort().map((f) => path.join(dir, f)) });
    }
    const mask = (s) => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${s.w}" height="${s.h}"><rect width="${s.w}" height="${s.h}" rx="${s.r}" fill="#fff"/></svg>`);
    const count = Math.min(...clips.map((c) => c.files.length));
    const frames = [];
    for (let i = 0; i < count; i++) {
      const layers = [];
      for (const { s, files } of clips) {
        const rounded = await sharp(files[i]).composite([{ input: mask(s), blend: 'dest-in' }]).png().toBuffer();
        layers.push({ input: rounded, left: s.x, top: s.y });
      }
      const file = path.join(tmp, `image-${String(i).padStart(4, '0')}.png`);
      // composé à la taille du SVG, puis réduit à la largeur publiée
      const full = await sharp(path.join(tmp, 'fond.png')).composite(layers).png().toBuffer();
      await sharp(full).resize({ width: OUT_W[variant] }).png().toFile(file);
      frames.push(file);
    }
    const out = path.join(OUT, lang, `rituals${variant === 'mobile' ? '.mobile' : ''}.webp`);
    if (process.env.RITUALS_KEEP) fs.cpSync(tmp, path.join(process.env.RITUALS_KEEP, `${lang}-${variant}`), { recursive: true });
    execFileSync('img2webp', ['-loop', '0', ...ENCODER, '-d', String(Math.round(1000 / FPS)), ...frames, '-o', out], { stdio: 'ignore' });
    console.log(`${out} : ${count} images, ${(fs.statSync(out).size / 1024).toFixed(0)} Ko`);
    fs.rmSync(tmp, { recursive: true, force: true });
  }
}
await closeSnap();
