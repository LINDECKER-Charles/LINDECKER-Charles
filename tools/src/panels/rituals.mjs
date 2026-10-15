/**
 * « Allumer une étoile » : le fond de l'image animée des quatre allumages de
 * Bloodborne Legendary Run (boss, lieu, rune, gemme). Ce SVG pose la plaque,
 * les téléphones aux écrans vides et les légendes ; rituals.mjs (racine de
 * tools/) y incruste ensuite les vrais enregistrements, image par image.
 */
import { Doc } from '../core/doc.mjs';
import { C } from '../core/tokens.mjs';
import { rng, r1 } from '../core/rng.mjs';
import { plate, TXT } from './plate.mjs';
import { glow } from '../art/sky.mjs';

/** Rapport des enregistrements : 390 × 844. */
const RATIO = 844 / 390;

export async function ritualsBase(t, variant = 'desktop') {
  const mobile = variant === 'mobile';
  const X = TXT[variant];
  const R = t.rituals;
  const W = mobile ? 720 : 1280;
  const doc = new Doc({ w: W, h: 100, title: R.title, desc: R.alt, lang: t.lang });
  const p = plate(doc, rng(mobile ? 102 : 101), { variant, chapter: R.eyebrow.toLocaleUpperCase('fr-FR'), title: R.title, sub: R.sub, stars: 60 });
  const cols = mobile ? 2 : 4;
  const sw = mobile ? 262 : 222;
  const sh = Math.round(sw * RATIO);
  const bez = mobile ? 11 : 10;
  const gap = mobile ? 44 : 50;
  const pw = sw + bez * 2;
  const rowW = cols * pw + (cols - 1) * gap;
  const x0 = (W - rowW) / 2;
  let y = p.top + (mobile ? 30 : 24);
  const screens = [];
  let bottom = y;
  R.items.forEach((it, i) => {
    const c = i % cols;
    const r = Math.floor(i / cols);
    const px = x0 + c * (pw + gap);
    const py = y + r * (sh + bez * 2 + (mobile ? 150 : 0));
    // lueur derrière chaque téléphone, coque, écran vide
    doc.add(glow(doc, { cx: px + pw / 2, cy: py + sh * 0.45, r: pw * 0.95, color: i === 0 ? C.emberCore : C.goldSheen, opacity: 0.1 }));
    doc.add(`<rect x="${r1(px - 6)}" y="${r1(py - 6)}" width="${r1(pw + 12)}" height="${r1(sh + bez * 2 + 12)}" rx="${r1(pw * 0.13)}" fill="#000" fill-opacity=".45"/>`);
    doc.add(`<rect x="${r1(px)}" y="${r1(py)}" width="${r1(pw)}" height="${r1(sh + bez * 2)}" rx="${r1(pw * 0.11)}" fill="#08090A" stroke="${C.bone}" stroke-opacity=".22" stroke-width="1.2"/>`);
    const sx = px + bez;
    const sy = py + bez;
    doc.add(`<rect x="${r1(sx)}" y="${r1(sy)}" width="${sw}" height="${sh}" rx="${r1(sw * 0.06)}" fill="#0B0D0E"/>`);
    screens.push({ id: it.id, x: Math.round(sx), y: Math.round(sy), w: sw, h: sh, r: Math.round(sw * 0.06) });
    // légende
    const ly = py + sh + bez * 2 + (mobile ? 50 : 46);
    doc.add(doc.text(it.t, { f: 'm5', size: mobile ? 26 : 22, x: px + pw / 2, y: ly, fill: i === 0 ? C.emberCore : C.bone, anchor: 'middle' }));
    const q = doc.para(it.d, { f: 's3i', size: X.small - (mobile ? 2 : 3), x: px + pw / 2, y: ly + (mobile ? 36 : 30), width: pw + gap - 10, lh: 1.35, fill: C.ash, anchor: 'middle', balance: true });
    doc.add(q.svg);
    bottom = Math.max(bottom, q.last);
  });
  const n = doc.para(R.note, { f: 's3i', size: X.label, x: W / 2, y: bottom + (mobile ? 76 : 66), width: mobile ? W - 120 : 900, lh: 1.4, fill: C.ashDim, anchor: 'middle', balance: true });
  doc.add(n.svg);
  p.finish(n.last);
  return { svg: await doc.render(), screens, w: W, h: doc.h };
}
