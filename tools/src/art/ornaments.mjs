/**
 * Ornements repris du design system de Bloodborne Legendary Run
 * (front/src/design-system/assets/ornaments) : l'arcature d'Oedon pour les
 * angles, la grille d'Oedon et les cierges de l'autel pour les filets. Les
 * tracés sont recopiés tels quels et recolorés ici.
 */
import { C } from '../core/tokens.mjs';
import { r1 } from '../core/rng.mjs';

/** Arcature d'Oedon, angle supérieur gauche (64 × 64). */
const CORNER = {
  stroke: 'M9 59V9h50M14 48V14h34M14 43c1-13 12-19 13-19s6-12 16-10M14 34c1-8 5-13 10-15m10-5c-8 1-13 5-15 10M19 19l11 11m-7-4 6-1-1 6m-10 8-4 4m25-25 4-4M9 52h5m38-43v5',
  fill: 'M9 3l4 6-4 4-4-4Zm50 4 4 2-4 2ZM7 59l2 4 2-4ZM28 28l7 3-4 4Z',
};

/** La grille d'Oedon (240 × 40). */
const FLOURISH = {
  stroke:
    'M8 27h93m38 0h93M22 31h77m42 0h77M32 27V16m18 11V12m18 15V10m18 17V7m68 20V7m18 20V10m18 17V12m18 15V16M32 25q2-7 9-10 7 3 9 10m0 0q2-8 9-12 7 4 9 12m0 0q2-9 9-14 7 5 9 14m68 0q2-9 9-14 7 5 9 14m0 0q2-8 9-12 7 4 9 12m0 0q2-7 9-10 7 3 9 10M99 31V17l9-4V9l12-6 12 6v4l9 4v14M103 31V20l9-5V11l8-4 8 4v4l9 5v11M114 30V20q1-5 6-8 5 3 6 8v10m-10 4h8',
  fill: 'm8 25-7 2 7 2Zm224 0 7 2-7 2ZM32 11l-2 5h4Zm18-4-2 5h4Zm18-2-2 5h4Zm18-3-2 5h4Zm68 0-2 5h4Zm18 3-2 5h4Zm18 2-2 5h4Zm18 4-2 5h4ZM118.6 23h2.8v8h-2.8Zm-2.6 2h8v1.5h-8Z',
};

/** Les cierges de l'autel de mémoire (240 × 40). */
const CANDLES = {
  stroke:
    'M4 30h88m56 0h88M30 33h49m82 0h49M120 13v19m-17-13v4c0 5 9 5 17 5s17 0 17-5v-4m-32 13h30m-26 3h22M87 22v8m-8-6v3q0 3 8 3t8-3v-3m58-2v8m-8-6v3q0 3 8 3t8-3v-3M57 30v-7h7v7m112 0v-7h7v7M117 13h6m-23 6h6m28 0h6m-56 3h6m60 0h6M77 24h4m12 0h4m46 0h4m14 0h4',
  fill: 'M118.7 7h2.6v6h-2.6ZM101.8 13h2.4v6h-2.4Zm34 0h2.4v6h-2.4Zm-50 4h2.4v5h-2.4Zm66 0h2.4v5h-2.4Zm-74 3h2.4v4h-2.4Zm16 0h2.4v4h-2.4Zm50 0h2.4v4h-2.4Zm16 0h2.4v4h-2.4ZM120 1c-1 2-2 3-1 4s3 0 2-2Zm-17 6c-1 2-2 3-1 4s3 0 2-2Zm34 0c-1 2-2 3-1 4s3 0 2-2Zm-50 4c-1 2-2 3-1 4s3 0 2-2Zm66 0c-1 2-2 3-1 4s3 0 2-2Zm-74 3c-1 2-2 3-1 4s3 0 2-2Zm16 0c-1 2-2 3-1 4s3 0 2-2Zm50 0c-1 2-2 3-1 4s3 0 2-2Zm16 0c-1 2-2 3-1 4s3 0 2-2ZM4 28l-3 2 3 2Zm232 0 3 2-3 2ZM117 32h6l2 3h-10Z',
};

/** Le fronton de l'atelier (240 × 32). */
const PEDIMENT = {
  stroke: 'M3 22h86l6-5h10l15-13 15 13h10l6 5h86M22 26h65l10-5h9l14-12 14 12h9l10 5h65M99 17V9m42 8V9m-33 12v-3m24 3v-3m-18 9v-7q0-5 6-9 6 4 6 9v7M109 29h22m-11-12v10',
  fill: 'M118.5 1h3v3h-3ZM99 3l3 4-3 3-3-3Zm42 0 3 4-3 3-3-3ZM51 20l6 2-6 2-6-2Zm138 0 6 2-6 2-6-2Z',
};

/** Un angle d'arcature, orienté (`tl`, `tr`, `bl`, `br`), de côté `size`. */
export function corner(x, y, size, which = 'tl', color = C.goldSheen, opacity = 0.7) {
  const s = size / 64;
  const fx = which.endsWith('r') ? -1 : 1;
  const fy = which.startsWith('b') ? -1 : 1;
  const tx = fx < 0 ? x + size : x;
  const ty = fy < 0 ? y + size : y;
  return `<g transform="translate(${r1(tx)} ${r1(ty)}) scale(${r1(s * fx * 100) / 100} ${r1(s * fy * 100) / 100})" opacity="${opacity}"><path d="${CORNER.stroke}" fill="none" stroke="${color}" stroke-width="${r1(1.4 / Math.max(s, 0.5) * 0.9 * 10) / 10}" stroke-linejoin="miter"/><path d="${CORNER.fill}" fill="${color}"/></g>`;
}

/** Un filet ornemental centré en `cx`, de largeur `width`. */
export function divider(cx, y, width, kind = 'flourish', color = C.goldSheen, opacity = 0.75) {
  const src = { flourish: FLOURISH, candles: CANDLES, pediment: PEDIMENT }[kind];
  const h = kind === 'pediment' ? 32 : 40;
  const s = width / 240;
  return `<g transform="translate(${r1(cx - width / 2)} ${r1(y - (h * s) / 2)}) scale(${Math.round(s * 1000) / 1000})" opacity="${opacity}"><path d="${src.stroke}" fill="none" stroke="${color}" stroke-width="${r1(Math.max(1, 1.2 / s) * 10) / 10}"/><path d="${src.fill}" fill="${color}"/></g>`;
}

/**
 * Cadre de plaque : un filet os à faible opacité, un liseré intérieur et les
 * quatre angles d'arcature.
 */
export function frame({ x = 0, y = 0, w, h, inset = 14, cornerSize = 54, color = C.goldSheen, line = C.bone, lineOpacity = 0.16, inner = true }) {
  const a = x + inset;
  const b = y + inset;
  const cw = w - inset * 2;
  const ch = h - inset * 2;
  const out = [`<rect x="${a + 0.5}" y="${b + 0.5}" width="${cw - 1}" height="${ch - 1}" fill="none" stroke="${line}" stroke-opacity="${lineOpacity}"/>`];
  if (inner) out.push(`<rect x="${a + 6.5}" y="${b + 6.5}" width="${cw - 13}" height="${ch - 13}" fill="none" stroke="${line}" stroke-opacity="${(lineOpacity * 0.45).toFixed(3)}"/>`);
  const o = -cornerSize * 0.14;
  out.push(
    corner(a + o, b + o, cornerSize, 'tl', color),
    corner(a + cw - cornerSize - o, b + o, cornerSize, 'tr', color),
    corner(a + o, b + ch - cornerSize - o, cornerSize, 'bl', color),
    corner(a + cw - cornerSize - o, b + ch - cornerSize - o, cornerSize, 'br', color),
  );
  return out.join('');
}

/** Flèche dessinée (les polices n'en ont pas) : `→`, `↗` ou `↓`. */
export function arrow(x, y, size, kind = 'ne', color = C.ember, width = 1.6) {
  const s = size;
  const paths = {
    e: `M${r1(x)} ${r1(y)}h${r1(s)}m${r1(-s * 0.38)} ${r1(-s * 0.36)}l${r1(s * 0.38)} ${r1(s * 0.36)}l${r1(-s * 0.38)} ${r1(s * 0.36)}`,
    ne: `M${r1(x)} ${r1(y + s * 0.5)}l${r1(s * 0.8)} ${r1(-s * 0.8)}m${r1(-s * 0.55)} 0h${r1(s * 0.55)}v${r1(s * 0.55)}`,
    s: `M${r1(x + s * 0.4)} ${r1(y - s * 0.6)}v${r1(s)}m${r1(-s * 0.36)} ${r1(-s * 0.38)}l${r1(s * 0.36)} ${r1(s * 0.38)}l${r1(s * 0.36)} ${r1(-s * 0.38)}`,
  };
  return `<path d="${paths[kind]}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="square"/>`;
}

/** Losange plein (puce, séparateur, extrémité de jauge). */
export function diamond(x, y, s, color = C.goldSheen, opacity = 1) {
  return `<path d="M${r1(x)} ${r1(y - s)}L${r1(x + s)} ${r1(y)}L${r1(x)} ${r1(y + s)}L${r1(x - s)} ${r1(y)}Z" fill="${color}" opacity="${opacity}"/>`;
}

/** Filet horizontal qui s'efface aux deux bouts. */
export function rule(doc, { x, y, w, color = C.bone, opacity = 0.3 }) {
  const id = doc.uid('ru');
  doc.defs(`<linearGradient id="${id}"><stop offset="0" stop-color="${color}" stop-opacity="0"/><stop offset=".5" stop-color="${color}" stop-opacity="${opacity}"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></linearGradient>`);
  return `<rect x="${r1(x)}" y="${r1(y)}" width="${r1(w)}" height="1" fill="url(#${id})"/>`;
}
