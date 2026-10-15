/**
 * Images embarquées : une capture ou une photo, recadrée et réduite à la
 * taille où elle s'affiche (le double, pour les écrans denses), puis mise en
 * WebP dans le SVG. Le contenu n'est ni redessiné ni recomposé.
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const cache = new Map();

/**
 * `crop` : fraction de l'image source à garder ({ x, y, w, h } entre 0 et 1).
 * `width` : largeur affichée ; l'image est produite à `scale` fois cette largeur.
 */
export async function embed(file, { width, crop, scale = 2, quality = 80 } = {}) {
  const key = JSON.stringify([file, width, crop, scale, quality]);
  if (!cache.has(key)) {
    const src = path.join(ROOT, 'sources', file);
    let img = sharp(src);
    const meta = await img.metadata();
    if (crop) {
      const left = Math.round(meta.width * crop.x);
      const top = Math.round(meta.height * crop.y);
      img = sharp(src).extract({ left, top, width: Math.min(meta.width - left, Math.round(meta.width * crop.w)), height: Math.min(meta.height - top, Math.round(meta.height * crop.h)) });
    }
    const target = Math.round(width * scale);
    const buf = await img.resize({ width: target, withoutEnlargement: true }).webp({ quality, alphaQuality: 90, effort: 6 }).toBuffer();
    const out = await sharp(buf).metadata();
    cache.set(key, { uri: `data:image/webp;base64,${buf.toString('base64')}`, ratio: out.height / out.width, bytes: buf.length });
  }
  return cache.get(key);
}
