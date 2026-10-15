/**
 * Boutons de lien, comme ceux de Bloodborne Legendary Run (« Éteindre ·
 * Maintenir ») : une case d'icône séparée par un filet, un libellé gravé en
 * capitales, une flèche de sortie en braise. Chacun est une image : le README
 * l'entoure de son lien.
 */
import { Doc } from '../core/doc.mjs';
import { C } from '../core/tokens.mjs';
import { icon } from '../art/icons.mjs';
import { arrow, diamond } from '../art/ornaments.mjs';
import { glow } from '../art/sky.mjs';

const H = 60;

export async function button(t, { label, glyph, kind = 'ghost', dir = 'ne', title }) {
  const size = 17;
  const tracking = 0.18;
  const box = H;
  const lw = new Doc({ w: 10, h: 10 }).width(label, 'm5', size, tracking, true);
  const w = Math.ceil(box + 22 + lw + 18 + 14 + 24);
  const doc = new Doc({ w, h: H, title: title ?? label, desc: '', lang: t.lang });
  const primary = kind === 'primary';
  const bg = doc.uid('b');
  doc.defs(`<linearGradient id="${bg}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#171B1D"/><stop offset="1" stop-color="#0A0C0D"/></linearGradient>`);
  const edge = primary ? C.ember : C.goldRail;
  doc.add(`<rect x=".5" y=".5" width="${w - 1}" height="${H - 1}" fill="url(#${bg})" stroke="${edge}" stroke-opacity="${primary ? 0.8 : 1}"/>`);
  doc.add(`<rect x="3.5" y="3.5" width="${w - 7}" height="${H - 7}" fill="none" stroke="${C.bone}" stroke-opacity=".07"/>`);
  if (primary) doc.add(glow(doc, { cx: box / 2, cy: H / 2, r: box * 0.9, color: C.emberCore, opacity: 0.22 }));
  doc.add(`<rect x="${box}" y="10" width="1" height="${H - 20}" fill="${edge}" fill-opacity=".8"/>`);
  doc.add(icon(glyph, box / 2 - 13, H / 2 - 13, 26, primary ? C.emberCore : C.bone, { strokeWidth: 1.5 }));
  doc.add(doc.text(label, { f: 'm5', size, x: box + 22, y: H / 2 + size * 0.36, fill: primary ? C.emberCore : C.bone, tracking, upper: true }));
  const ax = box + 22 + lw + 18;
  doc.add(arrow(ax, dir === 's' ? H / 2 + 2 : H / 2 - 7, 13, dir, primary ? C.emberCore : C.ember, 1.7));
  // repères d'angle, comme les cadres gravés
  doc.add(diamond(0.5, H / 2, 3, edge, 0.9), diamond(w - 0.5, H / 2, 3, edge, 0.9));
  return doc.render();
}

/**
 * Les boutons d'une langue : identifiant de fichier → réglages. Les liens
 * eux-mêmes vivent dans le README.
 */
export function buttonSet(t) {
  const b = t.buttons;
  return {
    portfolio: { label: b.portfolio, glyph: 'portfolio', kind: 'primary' },
    linkedin: { label: b.linkedin, glyph: 'linkedin' },
    email: { label: b.email, glyph: 'mail' },
    app: { label: b.app, glyph: 'star', kind: 'primary' },
    journal: { label: b.journal, glyph: 'scroll' },
    code: { label: b.code, glyph: 'GitHub' },
    npm: { label: b.npm, glyph: 'npm' },
    site: { label: b.site, glyph: 'terminal' },
    rules: { label: b.rules, glyph: 'cards' },
    upstream: { label: b.upstream, glyph: 'GitHub' },
    tool: { label: b.tool, glyph: 'terminal' },
    contribGup: { label: `${b.contrib} · gup`, glyph: 'branch' },
    contribConsole: { label: `${b.contrib} · Console Manager`, glyph: 'branch' },
    lang: { label: t.other.label, glyph: 'globe', dir: 'e' },
    certs: { label: b.certs, glyph: 'seal' },
    fm: { label: b.fm, glyph: 'cards' },
    talk: { label: b.talk, glyph: 'talk', kind: 'primary' },
  };
}
