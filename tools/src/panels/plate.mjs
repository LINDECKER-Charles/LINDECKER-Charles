/**
 * La plaque commune des chapitres : nuit, quelques étoiles, vignette, grain,
 * cadre à l'arcature d'Oedon, et l'en-tête (numéro du chapitre, titre,
 * sous-titre, filet de la grille d'Oedon).
 */
import { C } from '../core/tokens.mjs';
import { r1 } from '../core/rng.mjs';
import { nightBackground, starField, vignette, grain, glow } from '../art/sky.mjs';
import { frame, divider, diamond, rule } from '../art/ornaments.mjs';

/** Tailles de l'en-tête par variante : le téléphone affiche l'image deux fois plus petite. */
export const HEAD = {
  desktop: { num: 18, numY: 82, title: 46, titleY: 140, sub: 22, subY: 180, subW: 860, gap: 34, divW: 220, pad: 72 },
  mobile: { num: 22, numY: 86, title: 54, titleY: 156, sub: 27, subY: 206, subW: 600, gap: 40, divW: 240, pad: 48 },
};

/** Corps de texte par variante : courant, petit, étiquette. */
export const TXT = {
  desktop: { body: 22, small: 18, label: 15, big: 52, name: 34, lh: 1.5 },
  mobile: { body: 27, small: 23, label: 19, big: 60, name: 40, lh: 1.45 },
};

/**
 * Pose l'en-tête ; renvoie `top`, l'ordonnée où le contenu commence, et
 * `finish(bas)`, à appeler en dernier : la hauteur de la plaque suit alors le
 * contenu (`bas` + une marge), puis le fond se glisse dessous et la vignette,
 * le grain et le cadre se posent dessus.
 */
export function plate(doc, rnd, { variant, chapter, title, sub, stars = 70, header = true, warmth = 0.5, light } = {}) {
  const { w } = doc;
  const H = HEAD[variant];
  let top = 60;
  if (header) {
    const cx = w / 2;
    // numéro du chapitre, entre deux filets et deux losanges
    const numW = doc.width(chapter, 'm6', H.num, 0.3);
    doc.add(doc.text(chapter, { f: 'm6', size: H.num, x: cx, y: H.numY, fill: C.ember, tracking: 0.3, anchor: 'middle' }));
    const span = 120;
    doc.add(rule(doc, { x: cx - numW / 2 - 18 - span, y: H.numY - H.num * 0.36, w: span, color: C.goldSheen, opacity: 0.5 }));
    doc.add(rule(doc, { x: cx + numW / 2 + 18, y: H.numY - H.num * 0.36, w: span, color: C.goldSheen, opacity: 0.5 }));
    doc.add(diamond(cx - numW / 2 - 12, H.numY - H.num * 0.36, 3, C.goldSheen, 0.8));
    doc.add(diamond(cx + numW / 2 + 12, H.numY - H.num * 0.36, 3, C.goldSheen, 0.8));
    doc.add(doc.text(title, { f: 'm5', size: doc.fit(title, 'm5', H.title, w - H.pad * 2 - 40), x: cx, y: H.titleY, fill: C.bone, anchor: 'middle' }));
    let y = H.titleY;
    if (sub) {
      const p = doc.para(sub, { f: 's3i', size: H.sub, x: cx, y: H.subY, width: H.subW, lh: 1.4, fill: C.ash, anchor: 'middle', balance: true });
      doc.add(p.svg);
      y = p.last;
    }
    doc.add(divider(cx, y + H.gap, H.divW, 'flourish', C.goldSheen, 0.6));
    top = y + H.gap + 46;
  }
  return {
    top,
    finish(bottom, pad = variant === 'mobile' ? 64 : 56) {
      if (bottom !== undefined) doc.h = Math.ceil(bottom + pad);
      const { h } = doc;
      const bg = [nightBackground(doc, { w, h, top: '#0D1113', mid: C.night, bottom: warmth > 0.5 ? '#1A120D' : '#15110F', midAt: 0.5 })];
      if (light) bg.push(glow(doc, { cx: light.x, cy: light.y, r: light.r, color: light.color ?? C.emberCore, opacity: light.opacity ?? 0.1 }));
      bg.push(`<g opacity=".7">${starField(doc, rnd, { w, h, n: stars, twinkle: 0.35, glints: 2, maxR: 1.2 })}</g>`);
      doc.parts.unshift(...bg);
      doc.add(vignette(doc, { w, h, strength: 0.5, cy: 0.45 }));
      doc.add(grain(doc, { w, h, opacity: 0.06 }));
      doc.add(frame({ w, h, inset: variant === 'mobile' ? 10 : 14, cornerSize: variant === 'mobile' ? 46 : 56 }));
    },
  };
}

/** Une étiquette en capitales espacées (sur-titre, famille, statut). */
export function label(doc, s, { x, y, size, fill = C.ash, anchor = 'start', tracking = 0.22, f = 'm5', halo }) {
  const extra = halo ? ` stroke="${halo}" stroke-width="${Math.round(size * 0.45)}" stroke-linejoin="round" style="paint-order:stroke"` : '';
  return doc.text(s, { f, size, x, y, fill, anchor, tracking, upper: true, extra });
}

/** Un chiffre-preuve : la valeur en grand, son libellé dessous. */
export function figure(doc, { v, l, s }, { x, y, size, labelSize, width, fill = C.bone, glowColor, anchor = 'start' }) {
  const out = [];
  if (glowColor) {
    const vw = doc.width(v, 's5', size);
    const gx = anchor === 'middle' ? x : x + vw / 2;
    out.push(glow(doc, { cx: gx, cy: y - size * 0.35, r: size * 1.6, color: glowColor, opacity: 0.22 }));
  }
  out.push(doc.text(v, { f: 's5', size, x, y, fill, anchor }));
  const p = doc.para(l, { f: 's4', size: labelSize, x, y: y + labelSize * 1.55, width, lh: 1.35, fill: C.ash, anchor });
  out.push(p.svg);
  let last = p.last;
  if (s) {
    const q = doc.para(s, { f: 's3i', size: labelSize * 0.86, x, y: last + labelSize * 1.35, width, lh: 1.3, fill: C.ashDim, anchor });
    out.push(q.svg);
    last = q.last;
  }
  return { svg: out.join(''), last };
}

/** Puce de technologie : logo en os et son nom. */
export function chip(doc, iconSvg, name, { x, y, size }) {
  const out = [];
  let cx = x;
  if (iconSvg) {
    out.push(iconSvg(cx, y - size * 0.95, size * 1.1));
    cx += size * 1.1 + size * 0.45;
  }
  out.push(doc.text(name, { f: 's4', size, x: cx, y, fill: C.parchment }));
  return { svg: out.join(''), width: cx - x + doc.width(name, 's4', size) };
}

export { r1 };
