/**
 * II. Les trois règles : maîtriser, réinventer, emmener. Trois médaillons
 * gravés reliés d'un trait (d'abord, ensuite, puis) ; une seule case éclairée,
 * « Emmener », la preuve la plus forte, comme sur l'accueil du portfolio.
 */
import { Doc } from '../core/doc.mjs';
import { C } from '../core/tokens.mjs';
import { rng } from '../core/rng.mjs';
import { plate, label, TXT } from './plate.mjs';
import { glow } from '../art/sky.mjs';
import { diamond, rule } from '../art/ornaments.mjs';
import { picto } from '../art/pictos.mjs';

const L = {
  desktop: { w: 1280, cols: 3, colW: 360, xs: [236, 640, 1044], r: 60 },
  mobile: { w: 720, cols: 1, colW: 560, xs: [360], r: 62 },
};

export async function rules(t, variant = 'desktop') {
  const V = L[variant];
  const X = TXT[variant];
  const R = t.rules;
  const doc = new Doc({ w: V.w, h: 100, title: `${R.chapter}. ${R.title}`, desc: R.alt, lang: t.lang });
  const p = plate(doc, rng(variant === 'desktop' ? 12 : 13), { variant, chapter: R.chapter, title: R.title, sub: R.sub, stars: 60 });
  doc.style('@keyframes halo{0%,100%{opacity:.85}50%{opacity:1}}.halo{animation:halo 4s ease-in-out infinite}');

  let bottom = p.top;
  const blocks = R.items.map((item, i) => ({ item, i }));
  // sur téléphone, les trois règles s'empilent ; sur ordinateur, trois colonnes
  let y0 = p.top + V.r + 24;
  for (const { item, i } of blocks) {
    const strong = i === 2;
    const cx = variant === 'desktop' ? V.xs[i] : V.xs[0];
    const cy = y0;
    // la lumière unique derrière « Emmener »
    if (strong) doc.add(`<g class="halo">${glow(doc, { cx, cy: cy + 120, r: 300, color: C.emberCore, opacity: 0.12 })}</g>`);
    // médaillon : disque sombre, deux anneaux, quatre losanges cardinaux
    const med = doc.uid('md');
    doc.defs(`<radialGradient id="${med}" cx=".5" cy=".38" r=".7"><stop offset="0" stop-color="${strong ? '#2A1D12' : '#1F2427'}"/><stop offset="1" stop-color="#0B0E0F"/></radialGradient>`);
    doc.add(`<circle cx="${cx}" cy="${cy}" r="${V.r}" fill="url(#${med})" stroke="${strong ? C.ember : C.goldSheen}" stroke-opacity="${strong ? 0.9 : 0.7}" stroke-width="1.5"/>`);
    doc.add(`<circle cx="${cx}" cy="${cy}" r="${V.r - 8}" fill="none" stroke="${C.bone}" stroke-opacity=".14"/>`);
    for (const a of [0, 90, 180, 270]) {
      const rad = (a * Math.PI) / 180;
      doc.add(diamond(cx + Math.cos(rad) * V.r, cy + Math.sin(rad) * V.r, 4, strong ? C.ember : C.goldSheen, 0.95));
    }
    doc.add(picto(item.picto, cx, cy + 2, V.r * 1.25, { light: strong ? C.emberCore : C.goldSheen, soft: C.ashDim }));

    // le trait qui relie les règles, d'abord → ensuite → puis
    if (variant === 'desktop' && i < 2) {
      const xa = cx + V.r + 16;
      const xb = V.xs[i + 1] - V.r - 16;
      doc.add(rule(doc, { x: xa, y: cy, w: xb - xa, color: C.goldSheen, opacity: 0.55 }));
      doc.add(diamond((xa + xb) / 2, cy, 4.5, C.goldSheen, 0.8));
    }

    let y = cy + V.r + (variant === 'desktop' ? 50 : 56);
    doc.add(label(doc, item.order, { x: cx, y, size: X.label, fill: strong ? C.ember : C.ashDim, anchor: 'middle' }));
    y += variant === 'desktop' ? 54 : 64;
    doc.add(doc.text(item.verb, { f: 'm5', size: variant === 'desktop' ? 42 : 50, x: cx, y, fill: strong ? C.emberCore : C.bone, anchor: 'middle' }));
    y += variant === 'desktop' ? 42 : 50;
    const sense = doc.para(item.sense, { f: 's3i', size: X.body, x: cx, y, width: V.colW, lh: 1.42, fill: C.parchment, anchor: 'middle', balance: true });
    doc.add(sense.svg);
    y = sense.last + (variant === 'desktop' ? 34 : 40);
    doc.add(rule(doc, { x: cx - 90, y, w: 180, color: strong ? C.ember : C.bone, opacity: strong ? 0.6 : 0.25 }));
    y += variant === 'desktop' ? 46 : 54;
    if (item.big) {
      doc.add(glow(doc, { cx, cy: y + 10, r: 90, color: C.emberCore, opacity: 0.2 }));
      doc.add(doc.text(item.big, { f: 's5', size: variant === 'desktop' ? 72 : 84, x: cx, y: y + 34, fill: C.emberCore, anchor: 'middle' }));
      y += variant === 'desktop' ? 80 : 94;
    }
    const segs = item.proof.map((s) => ({ t: s.t, f: s.mark ? 's5' : 's4', fill: s.mark ? C.emberCore : strong ? C.bone : C.ash }));
    const proof = doc.rich(segs, { x: cx, y, width: V.colW - 20, size: X.body - 1, lh: 1.45, anchor: 'middle' });
    doc.add(proof.svg);
    bottom = Math.max(bottom, proof.last);
    if (variant === 'mobile') {
      y0 = proof.last + 96 + V.r;
      if (i < 2) {
        doc.add(rule(doc, { x: cx - 160, y: proof.last + 56, w: 320, color: C.goldSheen, opacity: 0.4 }));
        doc.add(diamond(cx, proof.last + 56, 4.5, C.goldSheen, 0.8));
      }
    }
  }
  p.finish(bottom);
  return doc.render();
}
