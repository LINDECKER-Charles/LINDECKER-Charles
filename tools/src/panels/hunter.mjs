/**
 * I. Le chasseur : la fiche du profil, comme celle d'un personnage dans
 * Bloodborne Legendary Run. Portrait au clair de lune dans une fenêtre en
 * ogive, titre de chasseur en braise, identité, histoire et « la run ».
 */
import { Doc } from '../core/doc.mjs';
import { C } from '../core/tokens.mjs';
import { rng, r1 } from '../core/rng.mjs';
import { embed } from '../core/images.mjs';
import { plate, label, TXT } from './plate.mjs';
import { glow, starField } from '../art/sky.mjs';
import { diamond, rule, corner } from '../art/ornaments.mjs';
import { icon } from '../art/icons.mjs';
import { lantern } from '../art/lantern.mjs';

const L = {
  desktop: { w: 1280, h: 680, arch: { x: 92, y: 80, w: 340, bottom: 572 }, col: { x: 500, w: 690 }, eyebrowY: 118 },
  mobile: { w: 720, h: 1500, arch: { x: 170, y: 104, w: 380, bottom: 640 }, col: { x: 56, w: 608 }, eyebrowY: 790 },
};

/** Ogive équilatérale : deux arcs de rayon `w` qui se rejoignent au sommet. */
function archPath(x, y, w, bottom, inset = 0) {
  const W = w - inset * 2;
  const x0 = x + inset;
  const apex = y + inset;
  const spring = apex + W * 0.866;
  return `M${r1(x0)} ${r1(bottom - inset)}V${r1(spring)}A${r1(W)} ${r1(W)} 0 0 1 ${r1(x0 + W / 2)} ${r1(apex)}A${r1(W)} ${r1(W)} 0 0 1 ${r1(x0 + W)} ${r1(spring)}V${r1(bottom - inset)}Z`;
}

export async function hunter(t, variant = 'desktop') {
  const V = L[variant];
  const X = TXT[variant];
  const doc = new Doc({ w: V.w, h: V.h, title: `${t.hunter.chapter}. ${t.hunter.title}`, desc: t.hunter.alt, lang: t.lang });
  const rnd = rng(variant === 'desktop' ? 7 : 8);
  const p = plate(doc, rnd, { variant, header: false, stars: 50 });
  const A = V.arch;

  // --- La fenêtre en ogive et le portrait ---------------------------------------
  const clip = doc.uid('ac');
  const fade = doc.uid('af');
  const grade = doc.uid('ag');
  const sky = doc.uid('as');
  doc.defs(
    `<clipPath id="${clip}"><path d="${archPath(A.x, A.y, A.w, A.bottom, 6)}"/></clipPath>` +
      `<linearGradient id="${sky}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1A242A"/><stop offset=".6" stop-color="#121A1E"/><stop offset="1" stop-color="#0B0F11"/></linearGradient>` +
      `<linearGradient id="${fade}m" x1="0" y1="0" x2="0" y2="1"><stop offset=".72" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>` +
      `<mask id="${fade}"><rect x="${A.x}" y="${A.y}" width="${A.w}" height="${A.bottom - A.y}" fill="url(#${fade}m)"/></mask>` +
      // étalonnage au clair de lune : niveaux de gris, puis une carte de dégradé nuit → ardoise → os
      `<filter id="${grade}" color-interpolation-filters="sRGB"><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncR type="table" tableValues="0.03 0.16 0.42 0.80 0.93"/><feFuncG type="table" tableValues="0.05 0.2 0.45 0.80 0.91"/><feFuncB type="table" tableValues="0.07 0.24 0.49 0.79 0.87"/></feComponentTransfer></filter>`,
  );
  doc.add(`<path d="${archPath(A.x, A.y, A.w, A.bottom, 6)}" fill="url(#${sky})"/>`);
  const portrait = await embed('portrait.webp', { width: A.w, scale: 1.6, quality: 84 });
  const pw = A.w - 8;
  const ph = pw * portrait.ratio;
  const py = A.bottom - ph + 4;
  doc.add(
    `<g clip-path="url(#${clip})">` +
      glow(doc, { cx: A.x + A.w * 0.62, cy: A.y + A.w * 0.42, r: A.w * 0.75, color: C.moon, opacity: 0.32 }) +
      `<g opacity=".8">${starField(doc, rng(3), { x: A.x, y: A.y, w: A.w, h: A.w * 0.6, n: 26, twinkle: 0.5, glints: 1, maxR: 1.1 })}</g>` +
      `<g mask="url(#${fade})"><image href="${portrait.uri}" x="${r1(A.x + 4)}" y="${r1(py)}" width="${r1(pw)}" height="${r1(ph)}" filter="url(#${grade})"/></g>` +
      glow(doc, { cx: A.x + 26, cy: A.bottom - 70, r: A.w * 0.8, color: C.ember, opacity: 0.2 }) +
      '</g>',
  );
  // cadre d'or : l'ogive, son double intérieur, la clef de voûte
  doc.add(`<path d="${archPath(A.x, A.y, A.w, A.bottom)}" fill="none" stroke="${C.goldSheen}" stroke-opacity=".75" stroke-width="1.6"/>`);
  doc.add(`<path d="${archPath(A.x, A.y, A.w, A.bottom, 10)}" fill="none" stroke="${C.bone}" stroke-opacity=".16"/>`);
  doc.add(diamond(A.x + A.w / 2, A.y - 1, 6, C.goldSheen, 0.9));
  doc.add(`<path d="M${r1(A.x + A.w / 2)} ${r1(A.y - 22)}v14" stroke="${C.goldSheen}" stroke-opacity=".8" stroke-width="1.4"/>`);
  doc.add(corner(A.x - 18, A.bottom - 46, 64, 'bl', C.goldSheen, 0.7), corner(A.x + A.w - 46, A.bottom - 46, 64, 'br', C.goldSheen, 0.7));
  // la plaque du nom, sous la fenêtre
  const plateY = A.bottom + 44;
  doc.add(rule(doc, { x: A.x - 10, y: A.bottom + 14, w: A.w + 20, color: C.goldSheen, opacity: 0.55 }));
  doc.add(label(doc, t.hero.name, { x: A.x + A.w / 2, y: plateY, size: variant === 'desktop' ? 17 : 21, fill: C.bone, anchor: 'middle', tracking: 0.3 }));
  doc.add(lantern(doc, { x: A.x + 40, y: A.bottom - 132, s: 0.6, state: 'lit', glowR: 90 }));

  // --- La fiche ----------------------------------------------------------------
  const x = V.col.x;
  const cw = V.col.w;
  let y = V.eyebrowY;
  doc.add(doc.text(t.hunter.chapter, { f: 'm6', size: X.label + 3, x, y, fill: C.ember, tracking: 0.3 }));
  doc.add(rule(doc, { x: x + 30, y: y - 6, w: 60, color: C.goldSheen, opacity: 0.6 }));
  doc.add(label(doc, t.hunter.title, { x: x + 104, y, size: X.label + 3, fill: C.bone, tracking: 0.3 }));
  y += variant === 'desktop' ? 62 : 74;
  doc.add(label(doc, t.hunter.tag, { x, y, size: X.label, fill: C.ashDim }));
  y += variant === 'desktop' ? 52 : 62;
  doc.add(doc.text(t.hunter.rank, { f: 'm5', size: variant === 'desktop' ? 46 : 54, x, y, fill: C.emberCore }));
  y += variant === 'desktop' ? 40 : 48;
  doc.add(icon('seal', x, y - X.label * 1.05, X.label * 1.3, C.goldSheen, { strokeWidth: 1.4 }));
  doc.add(label(doc, `${t.hunter.rarity} · B-Hive · Mulhouse`, { x: x + X.label * 1.9, y, size: X.label, fill: C.goldSheen }));
  y += variant === 'desktop' ? 56 : 70;
  // le titre dit déjà le poste : la fiche reprend le rôle de lead, puis l'histoire
  for (const line of t.hunter.lines.slice(1)) {
    const q = doc.para(line, { f: 's4', size: X.body + 2, x, y, width: cw, lh: 1.4, fill: C.bone });
    doc.add(q.svg);
    y = q.last + (X.body + 2) * 1.4;
  }
  y += variant === 'desktop' ? 8 : 12;
  const story = doc.para(t.hunter.story, { f: 's3', size: X.body, x, y, width: cw, lh: X.lh + 0.08, fill: C.parchment });
  doc.add(story.svg);
  y = story.last + (variant === 'desktop' ? 62 : 78);

  // « La run » : la jauge de sang et trois repères
  doc.add(label(doc, t.hunter.run, { x, y, size: X.label, fill: C.ash, tracking: 0.3 }));
  const gx = x + doc.width(t.hunter.run, 'm5', X.label, 0.3, true) + (variant === 'desktop' ? 22 : 26);
  const gw = cw - (gx - x);
  doc.add(`<rect x="${gx}" y="${y - 7}" width="${r1(gw)}" height="3" fill="${C.blood}" fill-opacity=".9"/><rect x="${gx}" y="${y - 7}" width="${r1(gw)}" height="1" fill="#C0392B" fill-opacity=".35"/>`);
  doc.add(diamond(gx, y - 5.5, 5, C.goldSheen), diamond(gx + gw, y - 5.5, 5, C.goldSheen));
  y += variant === 'desktop' ? 66 : 80;
  const cols = 3;
  const colW = cw / cols;
  let bottom = plateY;
  t.hunter.stats.forEach((s, i) => {
    const sx = x + i * colW;
    doc.add(doc.text(s.v, { f: 's5', size: variant === 'desktop' ? 48 : 58, x: sx, y, fill: i === 2 ? C.emberCore : C.bone }));
    const q = doc.para(s.l, { f: 's4', size: X.small - 1, x: sx, y: y + (variant === 'desktop' ? 30 : 38), width: colW - 26, lh: 1.35, fill: C.ash });
    doc.add(q.svg);
    bottom = Math.max(bottom, q.last);
  });

  p.finish(bottom);
  return doc.render();
}
