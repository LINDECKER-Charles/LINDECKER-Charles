/**
 * IV. Les constellations : une carte par projet, à la manière d'une fiche
 * d'objet de Bloodborne Legendary Run. À gauche, une vraie capture (ou
 * l'illustration de PvZ Fusion) dans son cadre ; au centre, le besoin, le rôle
 * et le statut ; à droite, un seul chiffre sourcé. PvZ Fusion, la vedette de
 * la vitrine, a sa grande carte et ses trois repères.
 */
import { Doc } from '../core/doc.mjs';
import { C } from '../core/tokens.mjs';
import { rng, r1 } from '../core/rng.mjs';
import { embed } from '../core/images.mjs';
import { plate, label, TXT } from './plate.mjs';
import { glow } from '../art/sky.mjs';
import { diamond, rule, corner, arrow } from '../art/ornaments.mjs';
import { icon } from '../art/icons.mjs';
import { lanternCss } from '../art/lantern.mjs';

/** La capture de chaque carte et son cadrage (fraction de la source gardée). */
const SHOTS = {
  pvz: { file: 'projets/pvz.webp', crop: { x: 0, y: 0.04, w: 1, h: 0.86 } },
  omnicard: { file: 'projets/omnicard.webp', crop: { x: 0, y: 0.04, w: 1, h: 0.74 } },
  league: { file: 'projets/league.webp', crop: { x: 0, y: 0, w: 0.8, h: 0.62 } },
  gup: { file: 'projets/gup.webp', crop: { x: 0, y: 0, w: 1, h: 1 } },
  githealth: { file: 'projets/githealth.webp', crop: { x: 0.12, y: 0, w: 0.76, h: 0.62 }, dim: true },
  karl: { file: 'projets/karl.webp', crop: { x: 0, y: 0, w: 1, h: 1 } },
  sillage: { file: 'projets/sillage.webp', crop: { x: 0.36, y: 0, w: 0.64, h: 0.7 }, dim: true },
  relais: { file: 'projets/relais.webp', crop: { x: 0, y: 0, w: 1, h: 0.86 }, dim: true },
};

const PRIVATE = new Set(['karl', 'sillage', 'relais']);

/** Une capture dans son cadre : filet, coins d'arcature, légère vignette. */
async function shot(doc, id, { x, y, w, h }) {
  const s = SHOTS[id];
  const img = await embed(s.file, { width: w, crop: s.crop, scale: 1.8, quality: 78 });
  const clip = doc.uid('sc');
  const vg = doc.uid('sv');
  doc.defs(
    `<clipPath id="${clip}"><rect x="${r1(x)}" y="${r1(y)}" width="${r1(w)}" height="${r1(h)}"/></clipPath>` +
      `<radialGradient id="${vg}" cx=".5" cy=".45" r=".75"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="${s.dim ? 0.4 : 0.42}"/></radialGradient>`,
  );
  return (
    `<rect x="${r1(x - 7)}" y="${r1(y - 7)}" width="${r1(w + 14)}" height="${r1(h + 14)}" fill="#000" fill-opacity=".4"/>` +
    `<g clip-path="url(#${clip})"><image href="${img.uri}" x="${r1(x)}" y="${r1(y)}" width="${r1(w)}" height="${r1(h)}" preserveAspectRatio="xMidYMin slice"${s.dim ? ' opacity=".94"' : ''}/>` +
    `<rect x="${r1(x)}" y="${r1(y)}" width="${r1(w)}" height="${r1(h)}" fill="url(#${vg})"/></g>` +
    `<rect x="${r1(x + 0.5)}" y="${r1(y + 0.5)}" width="${r1(w - 1)}" height="${r1(h - 1)}" fill="none" stroke="${C.bone}" stroke-opacity=".24"/>` +
    corner(x - 15, y - 15, 42, 'tl', C.goldSheen, 0.65) +
    corner(x + w - 27, y + h - 27, 42, 'br', C.goldSheen, 0.65)
  );
}

/** Le statut en un mot et une forme : lanterne allumée, éteinte, ou ouverte. */
function status(doc, text, state, { x, y, size }) {
  const lit = state !== 'out';
  const g = `<g transform="translate(${r1(x + 7)} ${r1(y - size * 0.4)}) scale(${r1(size / 18)})"><path d="M0-12v3M-5-5 0-9 5-5ZM-5-5h10l-1 11H-4ZM-6 6h12l-1.5 3h-9Z" fill="none" stroke="${lit ? C.goldSheen : C.ashDim}" stroke-width="1.3" stroke-linejoin="round"/>${lit ? `<path class="fl" d="M0-2.5c1.6 1.6 2 2.8 2 3.8a2 2 0 0 1-4 0c0-1 .4-2.2 2-3.8Z" fill="${C.emberCore}"/>` : `<path d="M-2.5 2.5 2.5-2.5" stroke="${C.ashDim}" stroke-width="1.2"/>`}</g>`;
  return g + doc.text(text, { f: 's4', size, x: x + 26, y, fill: lit ? C.bone : C.ash });
}

/** Pile technique : logos en os et noms. */
function stack(doc, list, { x, y, size, maxW }) {
  let sx = x;
  let sy = y;
  const out = [];
  for (const name of list) {
    const iw = size * 1.1;
    const nw = doc.width(name, 's4', size);
    const total = iw + 8 + nw + 24;
    if (sx + total > x + maxW) {
      sx = x;
      sy += size * 1.9;
    }
    out.push(icon(name, sx, sy - size * 0.92, iw, C.bone, { opacity: 0.8 }));
    out.push(doc.text(name, { f: 's4', size, x: sx + iw + 8, y: sy, fill: C.parchment }));
    sx += total;
  }
  return { svg: out.join(''), last: sy };
}

export async function card(t, variant = 'desktop', id) {
  if (id === 'pvz') return featured(t, variant);
  const mobile = variant === 'mobile';
  const X = TXT[variant];
  const P = t.projects[id];
  const W = mobile ? 720 : 1280;
  const doc = new Doc({ w: W, h: 100, title: `${P.name} — ${P.proof}`, desc: `${P.need} ${P.figure.v} ${P.figure.l}. ${P.role}. ${P.status}.`, lang: t.lang });
  const p = plate(doc, rng(id.length * 7 + (mobile ? 1 : 0)), { variant, header: false, stars: mobile ? 40 : 46 });
  lanternCss(doc);
  const lit = P.state !== 'out';
  let bottom;
  if (!mobile) {
    const sx = 66;
    const sy = 62;
    const sw = 330;
    const sh = 216;
    doc.add(await shot(doc, id, { x: sx, y: sy, w: sw, h: sh }));
    const x = 446;
    let y = 84;
    const fam = doc.width(P.family, 'm5', X.label, 0.22, true);
    doc.add(label(doc, P.family, { x, y, size: X.label, fill: C.ember }));
    doc.add(diamond(x + fam + 14, y - 5, 3, C.goldSheen));
    doc.add(label(doc, P.proof, { x: x + fam + 28, y, size: X.label, fill: C.goldSheen }));
    y += 50;
    doc.add(doc.text(P.name, { f: 'm5', size: 38, x, y, fill: C.bone }));
    y += 42;
    const need = doc.para(P.need, { f: 's3', size: X.body - 1, x, y, width: 500, lh: 1.42, fill: C.parchment, maxLines: 3 });
    doc.add(need.svg);
    y = need.last + 44;
    doc.add(status(doc, P.status, P.state, { x, y, size: X.small - 1 }));
    y += 32;
    doc.add(doc.text(P.role, { f: 's3i', size: X.small - 2, x: x + 26, y, fill: C.ash }));
    bottom = Math.max(sy + sh, y);
    // le chiffre, à droite, séparé d'un filet vertical
    const fx = 1000;
    doc.add(`<rect x="${fx - 34}" y="${sy + 6}" width="1" height="${sh - 12}" fill="${C.bone}" fill-opacity=".12"/>`);
    let fy = sy + 82;
    if (lit) doc.add(glow(doc, { cx: fx + 60, cy: fy - 22, r: 100, color: C.emberCore, opacity: 0.16 }));
    doc.add(doc.text(P.figure.v, { f: 's5', size: 60, x: fx, y: fy, fill: lit ? C.emberCore : C.bone }));
    const fl = doc.para(P.figure.l, { f: 's4', size: X.small - 1, x: fx, y: fy + 34, width: 210, lh: 1.35, fill: C.ash });
    doc.add(fl.svg);
    fy = fl.last + 44;
    const st = stack(doc, P.stack, { x: fx, y: fy, size: X.label, maxW: 230 });
    doc.add(st.svg);
    if (PRIVATE.has(id)) doc.add(doc.text(t.projects.privateNote, { f: 's3i', size: X.label, x: fx, y: st.last + 34, fill: C.ashDim }));
    bottom = Math.max(bottom, st.last + (PRIVATE.has(id) ? 34 : 0));
  } else {
    const pad = 52;
    let y = 82;
    doc.add(label(doc, P.family, { x: pad, y, size: X.label, fill: C.ember }));
    y += X.label * 1.9;
    doc.add(label(doc, P.proof, { x: pad, y, size: X.label, fill: C.goldSheen }));
    y += 60;
    doc.add(doc.text(P.name, { f: 'm5', size: 46, x: pad, y, fill: C.bone }));
    y += 36;
    const sw = W - pad * 2;
    const sh = Math.round(sw * 0.56);
    doc.add(await shot(doc, id, { x: pad, y, w: sw, h: sh }));
    y += sh + 66;
    const need = doc.para(P.need, { f: 's3', size: X.body, x: pad, y, width: sw, lh: 1.42, fill: C.parchment });
    doc.add(need.svg);
    y = need.last + 74;
    if (lit) doc.add(glow(doc, { cx: pad + 60, cy: y - 24, r: 110, color: C.emberCore, opacity: 0.16 }));
    doc.add(doc.text(P.figure.v, { f: 's5', size: 66, x: pad, y, fill: lit ? C.emberCore : C.bone }));
    const fl = doc.para(P.figure.l, { f: 's4', size: X.small, x: pad, y: y + 40, width: sw, lh: 1.35, fill: C.ash });
    doc.add(fl.svg);
    y = fl.last + 60;
    doc.add(status(doc, P.status, P.state, { x: pad, y, size: X.small }));
    y += 40;
    doc.add(doc.text(P.role, { f: 's3i', size: X.small - 1, x: pad + 26, y, fill: C.ash }));
    y += 58;
    const st = stack(doc, P.stack, { x: pad, y, size: X.small - 2, maxW: sw });
    doc.add(st.svg);
    bottom = st.last;
    if (PRIVATE.has(id)) {
      doc.add(doc.text(t.projects.privateNote, { f: 's3i', size: X.label, x: pad, y: st.last + 44, fill: C.ashDim }));
      bottom += 44;
    }
  }
  p.finish(bottom);
  return doc.render();
}

/** PvZ Fusion, la vedette : l'illustration du portfolio, le double titre, trois repères. */
async function featured(t, variant) {
  const mobile = variant === 'mobile';
  const X = TXT[variant];
  const P = t.projects.pvz;
  const W = mobile ? 720 : 1280;
  const doc = new Doc({ w: W, h: 100, title: `${P.name} — ${P.proof}`, desc: `${P.title.join(' ')} ${P.need}`, lang: t.lang });
  const p = plate(doc, rng(mobile ? 77 : 76), { variant, header: false, stars: 60, light: { x: mobile ? 360 : 300, y: 260, r: 420, color: C.emberCore, opacity: 0.06 } });
  lanternCss(doc);
  const pad = mobile ? 52 : 70;
  let y = mobile ? 82 : 84;
  const textX = mobile ? pad : 600;
  const textW = mobile ? W - pad * 2 : W - 600 - pad;
  if (!mobile) doc.add(await shot(doc, 'pvz', { x: pad, y: 64, w: 470, h: 352 }));
  const fam = doc.width(P.family, 'm5', X.label, 0.22, true);
  doc.add(label(doc, P.family, { x: textX, y, size: X.label, fill: C.ember }));
  if (!mobile) {
    doc.add(diamond(textX + fam + 14, y - 5, 3, C.goldSheen));
    doc.add(label(doc, P.proof, { x: textX + fam + 28, y, size: X.label, fill: C.goldSheen }));
  } else {
    y += X.label * 1.9;
    doc.add(label(doc, P.proof, { x: textX, y, size: X.label, fill: C.goldSheen }));
  }
  y += mobile ? 64 : 56;
  doc.add(doc.text(P.name, { f: 'm5', size: mobile ? 44 : 40, x: textX, y, fill: C.bone }));
  y += mobile ? 58 : 52;
  for (const line of P.title) {
    doc.add(doc.text(line, { f: 's3i', size: mobile ? 34 : 30, x: textX, y, fill: C.parchment }));
    y += mobile ? 44 : 40;
  }
  if (mobile) {
    y += 26;
    const sw = W - pad * 2;
    const sh = Math.round(sw * 0.7);
    doc.add(await shot(doc, 'pvz', { x: pad, y, w: sw, h: sh }));
    y += sh + 70;
  } else y += 14;
  const need = doc.para(P.need, { f: 's3', size: X.body - (mobile ? 0 : 1), x: textX, y, width: textW, lh: 1.45, fill: C.bone });
  doc.add(need.svg);
  y = need.last + (mobile ? 64 : 52);
  doc.add(status(doc, P.status, 'lit', { x: textX, y, size: X.small - 1 }));
  y += mobile ? 38 : 32;
  doc.add(doc.text(P.role, { f: 's3i', size: X.small - 2, x: textX + 26, y, fill: C.ash }));
  // trois repères, sur toute la largeur
  let fy = Math.max(y + (mobile ? 96 : 84), mobile ? 0 : 500);
  doc.add(rule(doc, { x: pad, y: fy - (mobile ? 74 : 70), w: W - pad * 2, color: C.goldSheen, opacity: 0.4 }));
  const cols = mobile ? 1 : 3;
  const cw = (W - pad * 2) / cols;
  let bottom = fy;
  P.figures.forEach((f, i) => {
    const fx = mobile ? pad : pad + i * cw;
    const yy = mobile ? fy + i * 150 : fy;
    if (i === 0) doc.add(glow(doc, { cx: fx + 40, cy: yy - 22, r: 100, color: C.emberCore, opacity: 0.2 }));
    doc.add(value(doc, f.v, { x: fx, y: yy, size: mobile ? 60 : 54, fill: i === 0 ? C.emberCore : C.bone }));
    const q = doc.para(f.l, { f: 's4', size: X.small - 1, x: fx, y: yy + (mobile ? 38 : 34), width: cw - 40, lh: 1.35, fill: C.ash });
    doc.add(q.svg);
    const s = doc.text(f.s, { f: 's3i', size: X.label, x: fx, y: q.last + X.label * 1.5, fill: C.ashDim });
    doc.add(s);
    bottom = Math.max(bottom, q.last + X.label * 1.5);
  });
  const st = stack(doc, P.stack, { x: pad, y: bottom + (mobile ? 70 : 60), size: X.label + (mobile ? 2 : 0), maxW: W - pad * 2 });
  doc.add(st.svg);
  p.finish(st.last);
  return doc.render();
}

/**
 * Une valeur chiffrée ; la flèche de « 1 335 → 0 », absente de Spectral, est
 * dessinée.
 */
function value(doc, v, { x, y, size, fill }) {
  if (!v.includes('→')) return doc.text(v, { f: 's5', size, x, y, fill });
  const [a, b] = v.split('→').map((s) => s.trim());
  const aw = doc.width(a, 's5', size);
  const gap = size * 0.28;
  const al = size * 0.62;
  return (
    doc.text(a, { f: 's5', size, x, y, fill }) +
    arrow(x + aw + gap, y - size * 0.3, al, 'e', fill, Math.max(2, size * 0.05)) +
    doc.text(b, { f: 's5', size, x: x + aw + gap * 2 + al, y, fill })
  );
}

/** Séparateur de famille : le nom de la constellation entre deux filets. */
export async function familySep(t, variant = 'desktop', family) {
  const mobile = variant === 'mobile';
  const W = mobile ? 720 : 1280;
  const H = mobile ? 120 : 104;
  const name = t.sky.families[family];
  const counts = { equipe: 1, jeu: 3, outils: 2, ia: 3 };
  const n = counts[family];
  const unit = t.lang === 'fr' ? (n > 1 ? 'étoiles' : 'étoile') : n > 1 ? 'stars' : 'star';
  const doc = new Doc({ w: W, h: H, title: `${name} · ${n} ${unit}`, desc: '', lang: t.lang });
  const X = TXT[variant];
  doc.add(`<rect width="${W}" height="${H}" fill="${C.night}"/>`);
  const cx = W / 2;
  const cy = H / 2 + 6;
  const size = X.label + 4;
  const nw = doc.width(name, 'm5', size, 0.3, true);
  doc.add(label(doc, name, { x: cx, y: cy, size, fill: C.ember, anchor: 'middle', tracking: 0.3 }));
  doc.add(doc.text(`${n} ${unit}`, { f: 's3i', size: X.label, x: cx, y: cy + size * 1.25, fill: C.ashDim, anchor: 'middle' }));
  const span = mobile ? 170 : 330;
  doc.add(rule(doc, { x: cx - nw / 2 - 30 - span, y: cy - size * 0.35, w: span, color: C.goldSheen, opacity: 0.6 }));
  doc.add(rule(doc, { x: cx + nw / 2 + 30, y: cy - size * 0.35, w: span, color: C.goldSheen, opacity: 0.6 }));
  // une petite constellation de part et d'autre : l'entrée et deux étoiles
  for (const side of [-1, 1]) {
    const sx = cx + side * (nw / 2 + 16);
    doc.add(diamond(sx, cy - size * 0.35, 4, C.goldSheen));
  }
  return doc.render();
}
