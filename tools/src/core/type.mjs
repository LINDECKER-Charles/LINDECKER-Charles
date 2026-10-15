/**
 * Typographie : chargement des polices, mesure, césure en lignes et
 * sous-ensembles embarqués.
 *
 * Les deux familles du design system de Bloodborne Legendary Run :
 * Shippori Mincho B1 (titrage, le latin d'un Minchō comme celui du jeu) et
 * Spectral (texte). Les mesures viennent d'opentype.js ; le rendu, de la police
 * embarquée dans chaque SVG en sous-ensemble WOFF2 (seuls les glyphes écrits),
 * parce qu'une image SVG ne peut charger aucune ressource externe.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import opentype from 'opentype.js';
import subsetFont from 'subset-font';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const FS = (pkg, file) => path.join(ROOT, 'node_modules/@fontsource', pkg, 'files', file);

/** Clé → fichier de police (sans extension), nom de famille CSS et pile de repli. */
export const FONTS = {
  m5: { file: FS('shippori-mincho-b1', 'shippori-mincho-b1-latin-500-normal'), fallback: 'serif' },
  m6: { file: FS('shippori-mincho-b1', 'shippori-mincho-b1-latin-600-normal'), fallback: 'serif' },
  m7: { file: FS('shippori-mincho-b1', 'shippori-mincho-b1-latin-700-normal'), fallback: 'serif' },
  s3: { file: FS('spectral', 'spectral-latin-300-normal'), fallback: 'Georgia,serif' },
  s4: { file: FS('spectral', 'spectral-latin-400-normal'), fallback: 'Georgia,serif' },
  s5: { file: FS('spectral', 'spectral-latin-500-normal'), fallback: 'Georgia,serif' },
  s3i: { file: FS('spectral', 'spectral-latin-300-italic'), fallback: 'Georgia,serif', italic: true },
  s4i: { file: FS('spectral', 'spectral-latin-400-italic'), fallback: 'Georgia,serif', italic: true },
};

const cache = new Map();

/** La police opentype.js d'une clé (chargée une fois). */
export function font(key) {
  if (!FONTS[key]) throw new Error(`Police inconnue : ${key}`);
  if (!cache.has(key)) cache.set(key, opentype.loadSync(`${FONTS[key].file}.woff`));
  return cache.get(key);
}

/** Nom de famille CSS propre à chaque sous-ensemble embarqué. */
export const family = (key) => `f-${key}`;

const missingWarned = new Set();

/** Signale un caractère absent de la police : il tomberait sur une police de repli. */
export function checkGlyphs(key, text) {
  const f = font(key);
  for (const ch of new Set(text)) {
    if (ch === '\n' || ch === ' ') continue;
    if (f.charToGlyphIndex(ch) === 0 && !missingWarned.has(key + ch)) {
      missingWarned.add(key + ch);
      console.warn(`⚠ glyphe absent de ${key} : « ${ch} » (U+${ch.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')})`);
    }
  }
}

/**
 * Remplace les caractères qu'une police n'a pas par un équivalent qu'elle a :
 * l'espace fine insécable (U+202F) devient une insécable ordinaire.
 */
export function normalize(text, key) {
  const f = font(key);
  if (f.charToGlyphIndex('\u202F') === 0) return String(text).replace(/\u202F/g, '\u00A0');
  return String(text);
}

/** Largeur d'une ligne, en unités du SVG ; `tracking` en em, ajouté entre les lettres. */
export function measure(text, key, size, tracking = 0) {
  if (!text) return 0;
  text = normalize(text, key);
  const f = font(key);
  const w = f.getAdvanceWidth(text, size, { kerning: true });
  return w + tracking * size * (Array.from(text).length - 1);
}

/** Espaces sécables : seule l'espace ordinaire coupe une ligne (les insécables tiennent). */
const BREAK = / /;

/**
 * Coupe un texte en lignes d'au plus `width`, mot par mot. `\n` force une
 * ligne. Un mot trop long reste seul sur sa ligne.
 */
export function wrap(text, key, size, width, tracking = 0) {
  const lines = [];
  for (const para of String(text).split('\n')) {
    const words = para.split(BREAK).filter((w) => w.length);
    let line = '';
    for (const word of words) {
      const candidate = line ? `${line} ${word}` : word;
      if (!line || measure(candidate, key, size, tracking) <= width) line = candidate;
      else {
        lines.push(line);
        line = word;
      }
    }
    lines.push(line);
  }
  return lines;
}

/**
 * Coupe en équilibrant les lignes (comme `text-wrap: balance`) : on cherche la
 * plus petite largeur qui garde le même nombre de lignes.
 */
export function wrapBalanced(text, key, size, width, tracking = 0) {
  const base = wrap(text, key, size, width, tracking);
  if (base.length < 2) return base;
  let lo = width * 0.4;
  let hi = width;
  let best = base;
  for (let i = 0; i < 18; i++) {
    const mid = (lo + hi) / 2;
    const attempt = wrap(text, key, size, mid, tracking);
    if (attempt.length <= base.length && attempt.every((l) => measure(l, key, size, tracking) <= width)) {
      best = attempt;
      hi = mid;
    } else lo = mid;
  }
  return best;
}

/** Contour vectoriel d'un texte (titre animé au trait) : un tracé par glyphe. */
export function glyphPaths(text, key, size, x, y, tracking = 0) {
  const f = font(key);
  const glyphs = f.stringToGlyphs(text);
  const scale = size / f.unitsPerEm;
  const out = [];
  let cx = x;
  for (let i = 0; i < glyphs.length; i++) {
    const g = glyphs[i];
    const p = g.getPath(cx, y, size);
    const d = p.toPathData(2);
    if (d) out.push({ d, x: cx, w: g.advanceWidth * scale, ch: text[i] });
    let adv = g.advanceWidth * scale + tracking * size;
    if (i < glyphs.length - 1) adv += f.getKerningValue(g, glyphs[i + 1]) * scale;
    cx += adv;
  }
  return { paths: out, width: cx - x - tracking * size };
}

const subsetCache = new Map();

/** Sous-ensemble WOFF2 d'une police pour les caractères donnés, en base64. */
export async function subsetBase64(key, chars) {
  const text = [...new Set(chars)].sort().join('');
  const id = `${key}:${text}`;
  if (!subsetCache.has(id)) {
    const buf = fs.readFileSync(`${FONTS[key].file}.woff2`);
    const out = await subsetFont(buf, text, { targetFormat: 'woff2' });
    subsetCache.set(id, Buffer.from(out).toString('base64'));
  }
  return subsetCache.get(id);
}

/** Métriques utiles d'une police à une taille donnée. */
export function metrics(key, size) {
  const f = font(key);
  const s = size / f.unitsPerEm;
  return {
    ascent: f.ascender * s,
    descent: -f.descender * s,
    cap: (f.tables.os2.sCapHeight || f.ascender * 0.7) * s,
    xHeight: (f.tables.os2.sxHeight || f.ascender * 0.5) * s,
  };
}
