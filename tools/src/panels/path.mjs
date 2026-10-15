/**
 * V. Les lanternes du parcours : dans Bloodborne, une lanterne allumée est un
 * repère sur le chemin. Chaque rôle en est une : allumée s'il continue,
 * éteinte s'il est terminé. Du plus récent au plus ancien, comme le portfolio.
 */
import { Doc } from '../core/doc.mjs';
import { C } from '../core/tokens.mjs';
import { rng, r1 } from '../core/rng.mjs';
import { plate, label, TXT } from './plate.mjs';
import { glow } from '../art/sky.mjs';
import { diamond } from '../art/ornaments.mjs';
import { lantern } from '../art/lantern.mjs';

export async function path(t, variant = 'desktop') {
  const mobile = variant === 'mobile';
  const X = TXT[variant];
  const P = t.path;
  const W = mobile ? 720 : 1280;
  const doc = new Doc({ w: W, h: 100, title: `${P.chapter}. ${P.title}`, desc: P.alt, lang: t.lang });
  const p = plate(doc, rng(mobile ? 52 : 51), { variant, chapter: P.chapter, title: P.title, sub: P.sub, stars: mobile ? 70 : 80 });

  const lx = mobile ? 92 : 168;
  const tx = mobile ? 168 : 262;
  const textW = mobile ? W - tx - 50 : 620;
  let y = p.top + (mobile ? 40 : 34);
  const anchors = [];
  const chainAt = doc.parts.length;
  P.items.forEach((it, i) => {
    const lit = it.state === 'lit';
    const top = y;
    // la lanterne, suspendue à la chaîne du chemin
    anchors.push(top);
    doc.add(lantern(doc, { x: lx, y: top - 6, s: mobile ? 0.5 : 0.46, state: lit ? (i === 0 ? 'next' : 'lit') : 'out', stroke: lit ? C.goldSheen : C.stone4, strokeOpacity: lit ? 0.9 : 0.8, glowR: 90, delay: i * 0.7 }));
    let yy = top + (mobile ? 18 : 14);
    const per = doc.para(it.period, { f: 'm5', size: X.label, x: tx, y: yy, width: textW, lh: 1.6, fill: lit ? C.ember : C.ashDim, tracking: 0.2, upper: true });
    doc.add(per.svg);
    yy = per.last + (mobile ? 50 : 44);
    const role = doc.para(it.role, { f: 'm5', size: mobile ? 34 : 30, x: tx, y: yy, width: textW, lh: 1.2, fill: lit ? C.bone : C.parchment });
    doc.add(role.svg);
    yy = role.last + (mobile ? 40 : 34);
    const meta = `${it.org} · ${it.place} · ${P.natures[it.nature]}`;
    const m = doc.para(meta, { f: 's4i', size: X.small, x: tx, y: yy, width: textW, lh: 1.35, fill: lit ? C.parchment : C.ash });
    doc.add(m.svg);
    yy = m.last + (mobile ? 40 : 34);
    const d = doc.para(it.text, { f: 's3', size: X.small + (mobile ? 0 : 1), x: tx, y: yy, width: textW, lh: 1.42, fill: C.ash });
    doc.add(d.svg);
    yy = d.last;
    if (it.proof) {
      if (mobile) {
        yy += 64;
        doc.add(doc.text(it.proof.v, { f: 's5', size: 44, x: tx, y: yy, fill: C.emberCore }));
        const vw = doc.width(it.proof.v, 's5', 44);
        doc.add(doc.text(it.proof.l, { f: 's4', size: X.small - 2, x: tx + vw + 16, y: yy - 4, fill: C.ash }));
      } else {
        const px = 1000;
        doc.add(glow(doc, { cx: px + 40, cy: top + 50, r: 80, color: C.emberCore, opacity: 0.14 }));
        doc.add(doc.text(it.proof.v, { f: 's5', size: it.proof.v.length > 6 ? 36 : 46, x: px, y: top + 66, fill: C.emberCore }));
        const q = doc.para(it.proof.l, { f: 's4', size: X.small - 2, x: px, y: top + 98, width: 190, lh: 1.35, fill: C.ash });
        doc.add(q.svg);
        yy = Math.max(yy, q.last);
      }
    }
    y = yy + (mobile ? 86 : 62);
  });
  // la chaîne : un filet d'or d'une lanterne à l'autre, des losanges entre elles
  const chainTop = anchors[0] - 26;
  const chainBottom = anchors[anchors.length - 1] - 10;
  doc.parts.splice(chainAt, 0, `<path d="M${lx} ${r1(chainTop)}V${r1(chainBottom)}" stroke="${C.goldSheen}" stroke-opacity=".35" stroke-width="1.2" stroke-dasharray="2 6"/>`);
  for (let i = 0; i < anchors.length - 1; i++) {
    const mid = (anchors[i] + 90 + anchors[i + 1] - 10) / 2;
    doc.add(diamond(lx, mid, 4, C.goldSheen, 0.6));
  }
  p.finish(y - (mobile ? 86 : 62));
  return doc.render();
}
