/**
 * VIII. La suite, à plusieurs : la phrase de Charles sur le travail à
 * plusieurs, l'invitation à discuter (une lanterne qui en allume une autre,
 * le pictogramme « emmener »), puis les deux projets ouverts aux
 * contributions. Les boutons suivent l'image dans le README.
 * Et le pied de page : la nuit retombe sur Yharnam.
 */
import { Doc } from '../core/doc.mjs';
import { C } from '../core/tokens.mjs';
import { rng, r1 } from '../core/rng.mjs';
import { plate, label, TXT } from './plate.mjs';
import { nightBackground, starField, moon, mist, grain, vignette, horizonHaze } from '../art/sky.mjs';
import { diamond, rule, divider } from '../art/ornaments.mjs';
import { lantern } from '../art/lantern.mjs';
import { Shapes, townLayer, cathedral } from '../art/skyline.mjs';

export async function end(t, variant = 'desktop') {
  const mobile = variant === 'mobile';
  const X = TXT[variant];
  const E = t.end;
  const W = mobile ? 720 : 1280;
  const doc = new Doc({ w: W, h: 100, title: `${E.chapter}. ${E.title}`, desc: E.alt, lang: t.lang });
  const p = plate(doc, rng(mobile ? 82 : 81), { variant, chapter: E.chapter, title: E.title, stars: 80, light: { x: W / 2, y: 420, r: 520, color: C.emberCore, opacity: 0.07 } });
  const cx = W / 2;
  let y = p.top + (mobile ? 40 : 30);

  // deux lanternes : l'une allume l'autre
  const ls = mobile ? 0.62 : 0.58;
  doc.add(lantern(doc, { x: cx - (mobile ? 88 : 80), y, s: ls, state: 'lit', glowR: 120 }));
  doc.add(lantern(doc, { x: cx + (mobile ? 88 : 80), y: y + 18, s: ls, state: 'next', glowR: 120, delay: 1.2 }));
  doc.add(`<path d="M${r1(cx - 54)} ${r1(y + 30)}Q${cx} ${r1(y - 26)} ${r1(cx + 54)} ${r1(y + 46)}" fill="none" stroke="${C.goldSheen}" stroke-opacity=".7" stroke-width="1.4" stroke-dasharray="2 6"/>`);
  y += 150 * ls + (mobile ? 96 : 86);

  // la phrase, mot pour mot, entre deux grands guillemets
  const qw = mobile ? W - 110 : 900;
  const open = t.lang === 'fr' ? '«' : '“';
  const close = t.lang === 'fr' ? '»' : '”';
  const qs = 34;
  const q = doc.para(E.quote, { f: 's3i', size: qs, x: cx, y, width: qw, lh: 1.38, fill: C.parchment, anchor: 'middle', balance: true });
  doc.add(q.svg);
  // les grands guillemets s'accrochent au début de la première ligne et à la fin de la dernière
  const firstW = doc.width(q.lines[0], 's3i', qs);
  const lastW = doc.width(q.lines[q.lines.length - 1], 's3i', qs);
  const big = mobile ? 96 : 110;
  const ox = Math.max(30, cx - firstW / 2 - big * 0.62);
  const cxq = Math.min(W - 30 - big * 0.5, cx + lastW / 2 + big * 0.1);
  doc.add(doc.text(open, { f: 's3i', size: big, x: ox, y: y + big * 0.22, fill: C.goldSheen, opacity: 0.4 }));
  doc.add(doc.text(close, { f: 's3i', size: big, x: cxq, y: q.last + big * 0.22, fill: C.goldSheen, opacity: 0.4 }));
  y = q.last + (mobile ? 74 : 64);
  doc.add(divider(cx, y, mobile ? 200 : 180, 'candles', C.goldSheen, 0.6));
  y += mobile ? 70 : 62;
  const call = doc.para(E.call, { f: 's4', size: X.body, x: cx, y, width: mobile ? W - 110 : 760, lh: 1.5, fill: C.bone, anchor: 'middle', balance: true });
  doc.add(call.svg);
  y = call.last + (mobile ? 100 : 90);

  // contribuer
  doc.add(rule(doc, { x: mobile ? 52 : 140, y: y - (mobile ? 44 : 40), w: mobile ? W - 104 : W - 280, color: C.goldSheen, opacity: 0.35 }));
  const cl = doc.para(E.contrib, { f: 'm5', size: X.label + 1, x: cx, y: y + 6, width: W - (mobile ? 120 : 280), lh: 1.6, fill: C.ember, anchor: 'middle', tracking: 0.24, upper: true, balance: true });
  doc.add(cl.svg);
  y = cl.last + (mobile ? 66 : 60);
  const cols = mobile ? 1 : 2;
  const pad = mobile ? 52 : 140;
  const cw = (W - pad * 2) / cols;
  let bottom = y;
  E.contribItems.forEach((it, i) => {
    const x = mobile ? pad : pad + i * cw + (i ? 30 : 0);
    const yy = mobile ? y + i * 170 : y;
    doc.add(diamond(x + 6, yy - 9, 5, C.goldSheen));
    doc.add(doc.text(it.n, { f: 'm5', size: mobile ? 30 : 26, x: x + 24, y: yy, fill: C.bone }));
    const d = doc.para(it.t, { f: 's3', size: X.small, x: x + 24, y: yy + (mobile ? 42 : 38), width: cw - 60, lh: 1.42, fill: C.parchment });
    doc.add(d.svg);
    bottom = Math.max(bottom, d.last);
  });
  p.finish(bottom);
  return doc.render();
}

/** Le pied de page : une bande de nuit, la lune basse, la ville, l'adieu. */
export async function footer(t, variant = 'desktop') {
  const mobile = variant === 'mobile';
  const W = mobile ? 720 : 1280;
  const H = mobile ? 460 : 400;
  const doc = new Doc({ w: W, h: H, title: t.end.farewell, desc: t.end.footAlt, lang: t.lang });
  const rnd = rng(mobile ? 92 : 91);
  doc.style('@keyframes fw{0%,100%{opacity:.82}50%{opacity:1}}.fw{animation:fw 6s ease-in-out infinite}');
  doc.add(nightBackground(doc, { w: W, h: H, top: C.night, mid: '#10161A', bottom: '#191310', midAt: 0.6 }));
  doc.add(starField(doc, rnd, { w: W, h: H * 0.6, n: 90, glints: 3, fade: true }));
  const mx = mobile ? 560 : 1050;
  const my = mobile ? 300 : 250;
  doc.add(moon(doc, rnd, { cx: mx, cy: my, r: mobile ? 70 : 80, haloOpacity: 0.18 }));
  doc.add(horizonHaze(doc, { w: W, y0: H * 0.4, y1: H, cx: mx / W, opacity: 0.5 }));
  const base = H + 4;
  const far = new Shapes();
  townLayer(far, rnd, { x0: -40, x1: W + 40, base, hMin: 50, hMax: 110, spireRate: 0.35, towerRate: 0.2, lightRate: 0, scale: 1.1, maxH: H * 0.45 });
  const near = new Shapes();
  townLayer(near, rnd, { x0: -40, x1: W + 40, base, hMin: 16, hMax: 52, spireRate: 0.2, towerRate: 0.06, lightRate: 0.35, scale: 0.9, maxH: H * 0.3 });
  cathedral(near, rnd, mx, base - 12, mobile ? 0.36 : 0.42);
  doc.add(`<path d="${far.path()}" fill="#1B2328"/>`);
  doc.add(mist(doc, rnd, { x: -100, y: H - 90, w: W + 200, h: 70, opacity: 0.1, n: 6 }));
  doc.add(`<path d="${near.path()}" fill="#070909"/>`);
  for (const l of near.lights) doc.add(`<rect x="${r1(l.x)}" y="${r1(l.y)}" width="${r1(l.w)}" height="${r1(l.h)}" fill="${C.emberCore}" fill-opacity=".5"/>`);
  // l'adieu, en bandeau comme une galaxie achevée
  const fy = mobile ? 132 : 128;
  const size = mobile ? 30 : 30;
  doc.add(`<rect x="0" y="${fy - 64}" width="${W}" height="104" fill="#000" fill-opacity=".35"/>`);
  doc.add(divider(W / 2, fy - 64, mobile ? 300 : 360, 'flourish', C.goldSheen, 0.55));
  doc.add(`<g class="fw">${doc.para(t.end.farewell, { f: 'm5', size, x: W / 2, y: fy, width: W - 80, lh: 1.25, fill: C.goldSheen, anchor: 'middle', tracking: 0.12, upper: true }).svg}</g>`);
  doc.add(divider(W / 2, fy + 40, mobile ? 300 : 360, 'flourish', C.goldSheen, 0.55));
  doc.add(vignette(doc, { w: W, h: H, strength: 0.55 }));
  doc.add(grain(doc, { w: W, h: H, opacity: 0.06 }));
  return doc.render();
}
