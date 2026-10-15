/**
 * Une note en bas de section : la date des chiffres, les crédits. Une bande de
 * nuit, une phrase en italique, deux losanges.
 */
import { Doc } from '../core/doc.mjs';
import { C } from '../core/tokens.mjs';
import { TXT } from './plate.mjs';
import { diamond } from '../art/ornaments.mjs';

export async function note(t, variant = 'desktop', kind = 'releve') {
  const mobile = variant === 'mobile';
  const W = mobile ? 720 : 1280;
  const X = TXT[variant];
  const text = kind === 'releve' ? t.projects.releve : t.credits;
  const probe = new Doc({ w: W, h: 10 });
  const size = X.small - (mobile ? 2 : 3);
  const width = mobile ? W - 120 : 980;
  const lines = probe.para(text, { f: 's3i', size, x: W / 2, y: 0, width, lh: 1.5, anchor: 'middle', balance: true }).lines.length;
  const H = Math.round(48 + (lines - 1) * size * 1.5 + 34);
  const doc = new Doc({ w: W, h: H, title: text, desc: '', lang: t.lang });
  doc.add(`<rect width="${W}" height="${H}" fill="${C.night}"/>`);
  const p = doc.para(text, { f: 's3i', size, x: W / 2, y: 46, width, lh: 1.5, fill: C.ash, anchor: 'middle', balance: true });
  doc.add(p.svg);
  doc.add(diamond(W / 2, 16, 3, C.goldSheen, 0.7));
  return doc.render();
}
