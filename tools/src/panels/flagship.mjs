/**
 * L'étoile légendaire : Bloodborne Legendary Run, le sujet principal. Vraies
 * captures de l'application (ciel d'une partie, constellation en arbre, guide),
 * repères chiffrés et datés, et les trois décisions « sous le capot » du
 * journal public. Les captures sont posées telles quelles, sans retouche.
 */
import { Doc } from '../core/doc.mjs';
import { C } from '../core/tokens.mjs';
import { rng, r1 } from '../core/rng.mjs';
import { embed } from '../core/images.mjs';
import { plate, label, TXT } from './plate.mjs';
import { glow } from '../art/sky.mjs';
import { diamond, corner, divider } from '../art/ornaments.mjs';
import { icon } from '../art/icons.mjs';
import { lanternCss } from '../art/lantern.mjs';

/** Un écran de téléphone : coque sombre, écran arrondi, capture entière. */
function phone(doc, img, { x, y, w, caption, X }) {
  const h = w * img.ratio;
  const pad = w * 0.045;
  const clip = doc.uid('ph');
  doc.defs(`<clipPath id="${clip}"><rect x="${r1(x + pad)}" y="${r1(y + pad)}" width="${r1(w - pad * 2)}" height="${r1(h - pad * 2 * img.ratio)}" rx="${r1(w * 0.07)}"/></clipPath>`);
  const sh = h - pad * 2 * img.ratio + pad * 2;
  return (
    `<rect x="${r1(x - 6)}" y="${r1(y - 6)}" width="${r1(w + 12)}" height="${r1(sh + 12)}" rx="${r1(w * 0.12)}" fill="#000" fill-opacity=".45"/>` +
    `<rect x="${r1(x)}" y="${r1(y)}" width="${r1(w)}" height="${r1(sh)}" rx="${r1(w * 0.1)}" fill="#08090A" stroke="${C.bone}" stroke-opacity=".22" stroke-width="1.2"/>` +
    `<image href="${img.uri}" x="${r1(x + pad)}" y="${r1(y + pad)}" width="${r1(w - pad * 2)}" height="${r1((w - pad * 2) * img.ratio)}" clip-path="url(#${clip})" preserveAspectRatio="xMidYMin slice"/>` +
    (caption ? doc.text(caption, { f: 's3i', size: X.small - 2, x: x + w / 2, y: y + sh + X.small * 1.6, fill: C.ash, anchor: 'middle' }) : '')
  );
}

/** La capture d'ordinateur, dans un cadre à barre d'adresse. */
function screen(doc, img, { x, y, w, address, caption, X }) {
  const bar = 30;
  const h = w * img.ratio;
  const out = [
    `<rect x="${r1(x - 8)}" y="${r1(y - 8)}" width="${r1(w + 16)}" height="${r1(h + bar + 16)}" fill="#000" fill-opacity=".4"/>`,
    `<rect x="${r1(x)}" y="${r1(y)}" width="${r1(w)}" height="${r1(h + bar)}" fill="#0A0C0D" stroke="${C.bone}" stroke-opacity=".22"/>`,
    `<rect x="${r1(x)}" y="${r1(y)}" width="${r1(w)}" height="${bar}" fill="#121617"/>`,
    ...[0, 1, 2].map((i) => `<circle cx="${r1(x + 16 + i * 14)}" cy="${r1(y + bar / 2)}" r="3.6" fill="${C.stone3}"/>`),
    `<rect x="${r1(x + 72)}" y="${r1(y + 7)}" width="${r1(w - 144)}" height="${bar - 14}" rx="8" fill="#0A0C0D"/>`,
    doc.text(address, { f: 's4', size: 13, x: x + w / 2, y: y + bar / 2 + 4.5, fill: C.ash, anchor: 'middle' }),
    `<image href="${img.uri}" x="${r1(x)}" y="${r1(y + bar)}" width="${r1(w)}" height="${r1(h)}"/>`,
    corner(x - 16, y - 16, 44, 'tl', C.goldSheen, 0.6),
    corner(x + w - 28, y + h + bar - 28, 44, 'br', C.goldSheen, 0.6),
  ];
  if (caption) out.push(doc.text(caption, { f: 's3i', size: X.small - 2, x: x + w, y: y + h + bar + X.small * 1.7, fill: C.ash, anchor: 'end' }));
  return out.join('');
}

export async function flagship(t, variant = 'desktop') {
  const mobile = variant === 'mobile';
  const X = TXT[variant];
  const F = t.flagship;
  const W = mobile ? 720 : 1280;
  const doc = new Doc({ w: W, h: 100, title: `${F.name} — ${F.title}`, desc: F.alt, lang: t.lang });
  const p = plate(doc, rng(mobile ? 42 : 41), { variant, header: false, stars: 90, light: { x: mobile ? 360 : 900, y: 360, r: 620, color: C.goldSheen, opacity: 0.07 } });
  lanternCss(doc);
  const pad = mobile ? 52 : 80;

  // --- En-tête : l'icône de l'application, le nom, la promesse ---------------------
  let y = mobile ? 92 : 98;
  const logo = await embed('blr/logo.webp', { width: 96, scale: 2, quality: 86 });
  const ls = mobile ? 104 : 96;
  doc.add(glow(doc, { cx: pad + ls / 2, cy: y + ls / 2, r: ls * 1.3, color: C.goldSheen, opacity: 0.2 }));
  doc.add(`<rect x="${pad - 1}" y="${y - 1}" width="${ls + 2}" height="${ls + 2}" fill="none" stroke="${C.goldSheen}" stroke-opacity=".7"/>`);
  doc.add(`<image href="${logo.uri}" x="${pad}" y="${y}" width="${ls}" height="${ls}"/>`);
  const tx = pad + ls + (mobile ? 28 : 30);
  doc.add(label(doc, F.eyebrow, { x: tx, y: y + (mobile ? 28 : 26), size: X.label, fill: C.goldSheen, tracking: 0.24 }));
  const nameSize = mobile ? 40 : 40;
  doc.add(doc.text('Bloodborne', { f: 'm5', size: nameSize, x: tx, y: y + 70, fill: C.bone }));
  doc.add(doc.text('Legendary Run', { f: 'm5', size: nameSize, x: tx, y: y + 70 + nameSize * 1.12, fill: C.bone }));
  y += 70 + nameSize * 1.12 + (mobile ? 70 : 62);

  const colW = mobile ? W - pad * 2 : 520;
  const tag = doc.para(F.title, { f: 's3i', size: mobile ? 34 : 30, x: pad, y, width: colW, lh: 1.3, fill: C.parchment, balance: true });
  doc.add(tag.svg);
  y = tag.last + (mobile ? 54 : 46);
  const chap = doc.para(F.chapeau, { f: 's3', size: X.body, x: pad, y, width: colW, lh: X.lh, fill: C.bone });
  doc.add(chap.svg);
  y = chap.last + (mobile ? 70 : 64);

  // --- Repères chiffrés -----------------------------------------------------------
  const pw = colW / 3;
  F.proofs.forEach((pr, i) => {
    const px = pad + i * pw;
    if (i === 0) doc.add(glow(doc, { cx: px + 50, cy: y - 18, r: 90, color: C.emberCore, opacity: 0.18 }));
    doc.add(doc.text(pr.v, { f: 's5', size: mobile ? 52 : 50, x: px, y, fill: i === 0 ? C.emberCore : C.bone }));
    const q = doc.para(pr.l, { f: 's4', size: X.small - 1, x: px, y: y + (mobile ? 34 : 32), width: pw - 22, lh: 1.35, fill: C.ash });
    doc.add(q.svg);
    if (i > 0) doc.add(`<rect x="${r1(px - 14)}" y="${r1(y - 44)}" width="1" height="${mobile ? 110 : 100}" fill="${C.bone}" fill-opacity=".12"/>`);
  });
  y += mobile ? 118 : 104;
  doc.add(doc.text(F.source, { f: 's3i', size: X.label, x: pad, y, fill: C.ashDim }));
  y += mobile ? 58 : 52;

  // --- Statut, rôle, pile ---------------------------------------------------------
  doc.add(statusLantern(pad + 8, y - 10, mobile ? 1.15 : 1));
  doc.add(doc.text(F.status, { f: 's4', size: X.small, x: pad + 34, y, fill: C.bone }));
  y += mobile ? 40 : 36;
  doc.add(doc.text(F.role, { f: 's3i', size: X.small - 1, x: pad + 34, y, fill: C.ash }));
  y += mobile ? 56 : 50;
  let sx = pad;
  let sy = y;
  const chipSize = X.small - 2;
  for (const name of F.stack) {
    const iw = chipSize * 1.15;
    const nw = doc.width(name, 's4', chipSize);
    const total = iw + 8 + nw + 26;
    if (sx + total > pad + colW + 10) {
      sx = pad;
      sy += chipSize * 2;
    }
    const withIcon = name !== 'ASP.NET Core';
    if (withIcon) doc.add(icon(name, sx, sy - chipSize * 0.95, iw, C.bone, { opacity: 0.85 }));
    doc.add(doc.text(name, { f: 's4', size: chipSize, x: withIcon ? sx + iw + 8 : sx, y: sy, fill: C.parchment }));
    sx += withIcon ? total : total - iw - 8;
  }
  y = sy + (mobile ? 30 : 20);
  doc.add(doc.text(F.privateNote, { f: 's3i', size: X.label, x: pad, y: y + (mobile ? 30 : 26), fill: C.ashDim }));
  let leftBottom = y + (mobile ? 30 : 26);

  // --- Captures -----------------------------------------------------------------
  const desk = await embed('blr/parcours-desktop.webp', { width: 580, scale: 1.7, quality: 80 });
  const ph1 = await embed('blr/ciel-lisible-apres.webp', { width: 190, scale: 2, quality: 80 });
  const ph2 = await embed('blr/guide.webp', { width: 190, scale: 2, quality: 80 });
  let capBottom;
  if (!mobile) {
    const sx0 = 650;
    const sy0 = 104;
    const sw = 560;
    doc.add(screen(doc, desk, { x: sx0, y: sy0, w: sw, address: 'bloodborne-legendary-run.com/fr/sky', caption: F.captions[0], X }));
    const deskBottom = sy0 + 30 + sw * desk.ratio;
    doc.add(phone(doc, ph1, { x: 690, y: deskBottom + 64, w: 176, caption: F.captions[1], X }));
    doc.add(phone(doc, ph2, { x: 1000, y: deskBottom + 40, w: 176, caption: F.captions[2], X }));
    capBottom = deskBottom + 40 + 176 * ph2.ratio + 40;
  } else {
    y = leftBottom + 70;
    const sw = W - pad * 2;
    doc.add(screen(doc, desk, { x: pad, y, w: sw, address: 'bloodborne-legendary-run.com', caption: F.captions[0], X }));
    y += 30 + sw * desk.ratio + 76;
    const pw2 = 250;
    doc.add(phone(doc, ph1, { x: W / 2 - pw2 - 18, y, w: pw2, caption: F.captions[1], X }));
    doc.add(phone(doc, ph2, { x: W / 2 + 18, y: y + 28, w: pw2, caption: F.captions[2], X }));
    capBottom = y + 28 + pw2 * ph2.ratio + 50;
    leftBottom = capBottom;
  }

  // --- Sous le capot : trois décisions du journal --------------------------------
  let dy = Math.max(leftBottom, capBottom) + (mobile ? 40 : 30);
  doc.add(divider(W / 2, dy, mobile ? 220 : 200, 'pediment', C.goldSheen, 0.55));
  dy += mobile ? 64 : 60;
  doc.add(label(doc, t.lang === 'fr' ? 'Sous le capot' : 'Under the hood', { x: W / 2, y: dy, size: X.label + 1, fill: C.ember, anchor: 'middle', tracking: 0.3 }));
  dy += mobile ? 58 : 54;
  const cw = mobile ? W - pad * 2 : (W - pad * 2 - 80) / 3;
  let bottom = dy;
  let flow = dy;
  F.decisions.forEach((d, i) => {
    const cx = mobile ? pad : pad + i * (cw + 40);
    const cy = mobile ? flow : dy;
    doc.add(diamond(cx + 6, cy - 9, 5, C.goldSheen));
    const tt = doc.para(d.t, { f: 'm5', size: mobile ? 28 : 23, x: cx + 24, y: cy, width: cw - 24, lh: 1.25, fill: C.bone });
    doc.add(tt.svg);
    const q = doc.para(d.e, { f: 's3', size: X.small, x: cx + 24, y: tt.last + (mobile ? 42 : 36), width: cw - 24, lh: 1.42, fill: C.parchment });
    doc.add(q.svg);
    bottom = Math.max(bottom, q.last);
    flow = q.last + 76;
  });

  p.finish(bottom);
  return doc.render();
}

/** Petite lanterne allumée : le statut « en ligne ». */
function statusLantern(x, y, s) {
  return `<g transform="translate(${r1(x)} ${r1(y)}) scale(${s})"><path d="M0-12v3M-5-5 0-9 5-5ZM-5-5h10l-1 11H-4ZM-6 6h12l-1.5 3h-9Z" fill="none" stroke="${C.goldSheen}" stroke-width="1.3" stroke-linejoin="round"/><path class="fl" d="M0-2.5c1.6 1.6 2 2.8 2 3.8a2 2 0 0 1-4 0c0-1 .4-2.2 2-3.8Z" fill="${C.emberCore}"/></g>`;
}
