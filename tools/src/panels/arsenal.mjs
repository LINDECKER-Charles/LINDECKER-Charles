/**
 * VI. L'arsenal : les huit technologies du quotidien dans des cases d'objet,
 * comme l'inventaire de Bloodborne Legendary Run (fond sombre vignetté,
 * filet de laiton), puis ce que les projets mettent en œuvre, par famille.
 */
import { Doc } from '../core/doc.mjs';
import { C } from '../core/tokens.mjs';
import { rng, r1 } from '../core/rng.mjs';
import { plate, label, TXT } from './plate.mjs';
import { diamond, rule } from '../art/ornaments.mjs';
import { icon } from '../art/icons.mjs';

const DAILY = ['C#', '.NET', 'Angular', 'TypeScript', 'PostgreSQL', 'Docker', 'Git', 'GitHub Actions'];

/** Une case d'objet : fond vignetté, filet de laiton, liseré intérieur. */
function slot(doc, x, y, s, name, role, X, mobile) {
  const g = doc.uid('sl');
  doc.defs(`<radialGradient id="${g}" cx=".5" cy=".42" r=".7"><stop offset="0" stop-color="#2E2622"/><stop offset=".62" stop-color="#1C1613"/><stop offset="1" stop-color="#120E0C"/></radialGradient>`);
  const out = [
    `<rect x="${r1(x)}" y="${r1(y)}" width="${s}" height="${s}" fill="url(#${g})" stroke="${C.goldRail}"/>`,
    `<rect x="${r1(x + 4)}" y="${r1(y + 4)}" width="${s - 8}" height="${s - 8}" fill="none" stroke="${C.bone}" stroke-opacity=".08"/>`,
    diamond(x + s / 2, y, 3.5, C.goldSheen, 0.8),
    icon(name, x + s * 0.3, y + s * 0.3, s * 0.4, C.bone, { opacity: 0.92, strokeWidth: 1.4 }),
  ];
  const nameY = y + s + (mobile ? 40 : 34);
  const lines = name === 'GitHub Actions' ? ['GitHub', 'Actions'] : [name];
  lines.forEach((ln, i) => out.push(doc.text(ln, { f: 'm5', size: mobile ? 22 : 19, x: x + s / 2, y: nameY + i * (mobile ? 26 : 22), fill: C.bone, anchor: 'middle' })));
  const roleY = nameY + (lines.length - 1) * (mobile ? 26 : 22) + (mobile ? 30 : 26);
  const q = doc.para(role, { f: 's3i', size: X.label, x: x + s / 2, y: roleY, width: s + 20, lh: 1.3, fill: C.ash, anchor: 'middle' });
  out.push(q.svg);
  return { svg: out.join(''), last: q.last };
}

export async function arsenal(t, variant = 'desktop') {
  const mobile = variant === 'mobile';
  const X = TXT[variant];
  const A = t.arsenal;
  const W = mobile ? 720 : 1280;
  const doc = new Doc({ w: W, h: 100, title: `${A.chapter}. ${A.title}`, desc: A.alt, lang: t.lang });
  const p = plate(doc, rng(mobile ? 62 : 61), { variant, chapter: A.chapter, title: A.title, sub: A.sub, stars: 70 });
  const cx = W / 2;
  let y = p.top + (mobile ? 30 : 26);

  const heading = (text) => {
    const size = X.label + 2;
    const w = doc.width(text, 'm5', size, 0.3, true);
    doc.add(label(doc, text, { x: cx, y, size, fill: C.ember, anchor: 'middle', tracking: 0.3 }));
    doc.add(rule(doc, { x: cx - w / 2 - 230, y: y - size * 0.35, w: 200, color: C.goldSheen, opacity: 0.5 }));
    doc.add(rule(doc, { x: cx + w / 2 + 30, y: y - size * 0.35, w: 200, color: C.goldSheen, opacity: 0.5 }));
  };

  heading(A.daily);
  y += mobile ? 52 : 46;
  const perRow = mobile ? 4 : 8;
  const s = mobile ? 128 : 112;
  const gap = mobile ? 30 : 34;
  let bottom = y;
  for (let r = 0; r < DAILY.length / perRow; r++) {
    const row = DAILY.slice(r * perRow, (r + 1) * perRow);
    const total = row.length * s + (row.length - 1) * gap;
    const x0 = cx - total / 2;
    let rowBottom = y;
    row.forEach((name, i) => {
      const sl = slot(doc, x0 + i * (s + gap), y, s, name, A.dailyRoles[name], X, mobile);
      doc.add(sl.svg);
      rowBottom = Math.max(rowBottom, sl.last);
    });
    y = rowBottom + (mobile ? 62 : 0);
    bottom = rowBottom;
  }
  y = bottom + (mobile ? 40 : 74);

  heading(A.practiced);
  y += mobile ? 64 : 56;
  const cols = mobile ? 2 : 4;
  const pad = mobile ? 52 : 92;
  const colW = (W - pad * 2) / cols;
  let rowTop = y;
  let rowBottom = y;
  A.families.forEach((fam, i) => {
    const c = i % cols;
    if (i && c === 0) {
      rowTop = rowBottom + (mobile ? 56 : 52);
    }
    const fx = pad + c * colW;
    doc.add(diamond(fx + 4, rowTop - 6, 3.5, C.goldSheen, 0.85));
    doc.add(label(doc, fam.n, { x: fx + 18, y: rowTop, size: X.label, fill: C.goldSheen, tracking: 0.2 }));
    const q = doc.para(fam.t.join(' · '), { f: 's4', size: X.small, x: fx + 18, y: rowTop + (mobile ? 40 : 36), width: colW - 40, lh: 1.45, fill: C.parchment });
    doc.add(q.svg);
    rowBottom = Math.max(rowBottom, q.last);
  });
  p.finish(rowBottom);
  return doc.render();
}
