/**
 * VII. Le grimoire : le titre obtenu (DWWM), le programme CDA étudié en
 * complément et sa jauge, les certifications, la pratique sur Frontend
 * Mentor, puis le chemin d'avant le titre, et la phrase qui le résume.
 */
import { Doc } from '../core/doc.mjs';
import { C } from '../core/tokens.mjs';
import { rng, r1 } from '../core/rng.mjs';
import { plate, label, TXT } from './plate.mjs';
import { glow } from '../art/sky.mjs';
import { diamond, rule, corner } from '../art/ornaments.mjs';
import { icon } from '../art/icons.mjs';

export async function grimoire(t, variant = 'desktop') {
  const mobile = variant === 'mobile';
  const X = TXT[variant];
  const G = t.grimoire;
  const W = mobile ? 720 : 1280;
  const doc = new Doc({ w: W, h: 100, title: `${G.chapter}. ${G.title}`, desc: G.alt, lang: t.lang });
  const p = plate(doc, rng(mobile ? 72 : 71), { variant, chapter: G.chapter, title: G.title, sub: G.sub, stars: 70 });
  const pad = mobile ? 52 : 86;
  let y = p.top + (mobile ? 36 : 30);

  // --- Le titre obtenu : un parchemin de nuit, sceau d'or -------------------------
  const D = G.diploma;
  const cardW = mobile ? W - pad * 2 : 560;
  const cardX = pad;
  const cardY = y;
  const inner = [];
  let cy = cardY + (mobile ? 64 : 58);
  const sealS = mobile ? 74 : 66;
  inner.push(glow(doc, { cx: cardX + 40 + sealS / 2, cy: cy + sealS / 2 - 18, r: sealS * 1.4, color: C.goldSheen, opacity: 0.22 }));
  inner.push(icon('seal', cardX + 40, cy - 18, sealS, C.goldSheen, { strokeWidth: 1.2 }));
  const tx = cardX + 40 + sealS + 28;
  inner.push(label(doc, D.status, { x: tx, y: cy + 6, size: X.label, fill: C.ember }));
  inner.push(doc.text(D.meta, { f: 's4', size: X.small - 2, x: tx, y: cy + 6 + X.label * 2, fill: C.ash }));
  cy += sealS + (mobile ? 46 : 40);
  const tt = doc.para(D.title, { f: 'm5', size: mobile ? 36 : 32, x: cardX + 40, y: cy, width: cardW - 80, lh: 1.2, fill: C.bone, balance: true });
  inner.push(tt.svg);
  cy = tt.last + (mobile ? 44 : 38);
  inner.push(doc.text(D.org, { f: 's3i', size: X.small - 1, x: cardX + 40, y: cy, fill: C.parchment }));
  cy += mobile ? 82 : 74;
  inner.push(glow(doc, { cx: cardX + 90, cy: cy - 18, r: 90, color: C.emberCore, opacity: 0.18 }));
  inner.push(doc.text(D.proof.v, { f: 's5', size: mobile ? 56 : 50, x: cardX + 40, y: cy, fill: C.emberCore }));
  const pv = doc.width(D.proof.v, 's5', mobile ? 56 : 50);
  inner.push(doc.text(D.proof.l, { f: 's4', size: X.small - 1, x: cardX + 40 + pv + 18, y: cy - 6, fill: C.ash }));
  const cardH = cy + (mobile ? 44 : 40) - cardY;
  doc.add(`<rect x="${cardX}" y="${cardY}" width="${cardW}" height="${r1(cardH)}" fill="#0E1112" fill-opacity=".75" stroke="${C.goldSheen}" stroke-opacity=".45"/>`);
  doc.add(`<rect x="${cardX + 6}" y="${cardY + 6}" width="${cardW - 12}" height="${r1(cardH - 12)}" fill="none" stroke="${C.bone}" stroke-opacity=".08"/>`);
  doc.add(corner(cardX - 12, cardY - 12, 46, 'tl', C.goldSheen, 0.75), corner(cardX + cardW - 34, cardY + cardH - 34, 46, 'br', C.goldSheen, 0.75));
  doc.add(...inner);
  let leftBottom = cardY + cardH;

  // --- Le programme CDA, les certifications, Frontend Mentor -----------------------
  const rx = mobile ? pad : cardX + cardW + 70;
  const rw = mobile ? W - pad * 2 : W - rx - pad;
  let ry = mobile ? leftBottom + 84 : cardY + 34;
  const CDA = G.cda;
  doc.add(label(doc, CDA.status, { x: rx, y: ry, size: X.label, fill: C.ashDim }));
  ry += mobile ? 52 : 46;
  const ct = doc.para(CDA.title, { f: 'm5', size: mobile ? 30 : 26, x: rx, y: ry, width: rw, lh: 1.2, fill: C.bone });
  doc.add(ct.svg);
  ry = ct.last + (mobile ? 38 : 32);
  doc.add(doc.text(CDA.meta, { f: 's4', size: X.small - 2, x: rx, y: ry, fill: C.ash }));
  ry += mobile ? 48 : 40;
  // la jauge de sang : la part du programme étudiée
  const gw = rw - 120;
  doc.add(`<rect x="${rx}" y="${ry - 6}" width="${r1(gw)}" height="4" fill="${C.stone}"/>`);
  doc.add(`<rect x="${rx}" y="${ry - 6}" width="${r1((gw * CDA.part) / 100)}" height="4" fill="${C.blood}"/>`);
  doc.add(diamond(rx, ry - 4, 5, C.goldSheen), diamond(rx + gw, ry - 4, 5, C.goldSheen));
  doc.add(doc.text(`${CDA.part}${t.lang === 'fr' ? ' %' : '%'}`, { f: 's5', size: X.small + 2, x: rx + gw + 22, y: ry + 2, fill: C.bone }));
  ry += mobile ? 96 : 84;

  for (const item of [G.certs, G.fm]) {
    doc.add(doc.text(item.v, { f: 's5', size: mobile ? 52 : 46, x: rx, y: ry, fill: C.bone }));
    const vw = doc.width(item.v, 's5', mobile ? 52 : 46);
    const q = doc.para(item.l, { f: 's4', size: X.small - 1, x: rx + vw + 18, y: ry - (mobile ? 22 : 20), width: rw - vw - 18, lh: 1.35, fill: C.ash });
    doc.add(q.svg);
    ry = Math.max(ry, q.last) + 12;
    if (item.list) {
      const l = doc.para(item.list, { f: 's3i', size: X.label, x: rx, y: ry + (mobile ? 30 : 26), width: rw, lh: 1.45, fill: C.ashDim });
      doc.add(l.svg);
      ry = l.last;
    }
    ry += mobile ? 92 : 82;
  }
  const rightBottom = ry - (mobile ? 92 : 82);

  // --- Le chemin d'avant le titre ------------------------------------------------
  let by = Math.max(leftBottom, rightBottom) + (mobile ? 96 : 86);
  const span = W - pad * 2;
  const steps = [...G.before].reverse();
  if (!mobile) {
    doc.add(rule(doc, { x: pad, y: by, w: span, color: C.goldSheen, opacity: 0.45 }));
    const step = span / steps.length;
    let low = by;
    steps.forEach((s, i) => {
      const sx = pad + step * i + step / 2;
      doc.add(diamond(sx, by, 5, i === steps.length - 1 ? C.ember : C.goldSheen, 0.9));
      doc.add(label(doc, s.y, { x: sx, y: by - 22, size: X.label - 1, fill: C.ashDim, anchor: 'middle', tracking: 0.16 }));
      const tq = doc.para(s.t, { f: 'm5', size: 19, x: sx, y: by + 40, width: step - 20, lh: 1.25, fill: C.bone, anchor: 'middle', balance: true });
      doc.add(tq.svg);
      const sq = doc.para(s.s, { f: 's3i', size: X.label, x: sx, y: tq.last + 26, width: step - 24, lh: 1.3, fill: C.ash, anchor: 'middle', balance: true });
      doc.add(sq.svg);
      low = Math.max(low, sq.last);
    });
    by = low + 92;
  } else {
    // sur téléphone, une colonne datée
    steps.forEach((s, i) => {
      doc.add(diamond(pad + 6, by - 8, 5, i === steps.length - 1 ? C.ember : C.goldSheen, 0.9));
      doc.add(label(doc, s.y, { x: pad + 26, y: by, size: X.label, fill: C.ashDim, tracking: 0.16 }));
      doc.add(doc.text(s.t, { f: 'm5', size: 26, x: pad + 26, y: by + 38, fill: C.bone }));
      doc.add(doc.text(s.s, { f: 's3i', size: X.label + 1, x: pad + 26, y: by + 70, fill: C.ash }));
      by += 122;
    });
    by += 40;
  }
  // la phrase de Charles, mot pour mot
  const q = doc.para(`« ${G.quote.join(' ')} »`.replace('« ', t.lang === 'fr' ? '« ' : '“').replace(' »', t.lang === 'fr' ? ' »' : '”'), { f: 's3i', size: mobile ? 30 : 28, x: W / 2, y: by, width: mobile ? W - pad * 2 : 900, lh: 1.4, fill: C.parchment, anchor: 'middle', balance: true });
  doc.add(q.svg);
  p.finish(q.last);
  return doc.render();
}
