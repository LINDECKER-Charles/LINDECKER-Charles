/**
 * La bannière : une nuit sur Yharnam. Ciel étoilé, lune pâle derrière la
 * flèche de la cathédrale, trois plans de ville dans la brume, une
 * constellation en arbre qui s'allume comme dans Bloodborne Legendary Run,
 * et le nom tracé à l'encre d'or.
 */
import { Doc } from '../core/doc.mjs';
import { C } from '../core/tokens.mjs';
import { rng, r1 } from '../core/rng.mjs';
import { glyphPaths, measure } from '../core/type.mjs';
import { nightBackground, starField, moon, clouds, mist, grain, vignette, glow, glint, horizonHaze } from '../art/sky.mjs';
import { Shapes, cathedral, clockTower, townLayer } from '../art/skyline.mjs';
import { divider, diamond } from '../art/ornaments.mjs';
import { constellation } from '../art/constellation.mjs';

const LAYOUTS = {
  desktop: {
    w: 1280,
    h: 640,
    bar: { y: 58, line: 92, pad: 56 },
    title: { x: 96, eyebrowY: 214, nameY: 306, nameMax: 640, nameSize: 96, hookY: 372, hookSize: 31, hookStep: 42, divY: 470 },
    moon: { cx: 1022, cy: 262, r: 128 },
    cath: { cx: 1022, k: 0.66, lift: 96 },
    clock: { cx: 1226, k: 0.74, lift: 40 },
    tree: { x: 770, y: 118, w: 120, h: 250 },
    stars: { n: 190 },
    leftLow: 720,
  },
  mobile: {
    w: 720,
    h: 1000,
    ground: 610,
    bar: { y: 56, line: 88, pad: 40, compact: true },
    title: { x: 56, eyebrowY: 718, nameY: 804, nameMax: 610, nameSize: 84, hookY: 872, hookSize: 31, hookStep: 42, divY: 950 },
    moon: { cx: 430, cy: 300, r: 118 },
    cath: { cx: 430, k: 0.5, lift: 30 },
    clock: { cx: 650, k: 0.52, lift: 14 },
    tree: { x: 70, y: 140, w: 150, h: 230 },
    stars: { n: 150 },
    leftLow: 0,
  },
};

export async function hero(t, variant = 'desktop') {
  const L = LAYOUTS[variant];
  const { w, h } = L;
  const rnd = rng(variant === 'desktop' ? 1859 : 1863);
  const doc = new Doc({ w, h, title: `${t.hero.name} — ${t.hero.eyebrow}`, desc: t.hero.alt, lang: t.lang });

  doc.style(
    '@keyframes rise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}' +
      '.rise{animation:rise 1.4s cubic-bezier(.2,.7,.2,1) both}' +
      '@keyframes ink{0%{fill-opacity:0;stroke-dashoffset:1}55%{fill-opacity:0}100%{fill-opacity:1;stroke-dashoffset:0}}' +
      '.ink{stroke-dasharray:1;animation:ink 2.6s cubic-bezier(.4,.1,.2,1) both}' +
      '@keyframes wl{0%,100%{opacity:.9}40%{opacity:.55}60%{opacity:1}75%{opacity:.4}}' +
      '.wl{animation:wl 4s ease-in-out infinite}',
  );

  // --- Ciel ---------------------------------------------------------------
  const sceneH = L.ground ?? h;
  doc.add(nightBackground(doc, { w, h: sceneH, top: '#080B0D', mid: '#11171A', bottom: '#1A1411', midAt: 0.62 }));
  const titleBox = variant === 'desktop' ? { x0: 70, x1: 720, y0: 150, y1: 500 } : { x0: 0, x1: 0, y0: 0, y1: 0 };
  const moonC = L.moon;
  doc.add(
    starField(doc, rnd, {
      w,
      h: sceneH * 0.78,
      n: L.stars.n,
      fade: true,
      avoid: (x, y) => Math.hypot(x - moonC.cx, y - moonC.cy) < moonC.r * 1.25 || (x > titleBox.x0 && x < titleBox.x1 && y > titleBox.y0 && y < titleBox.y1 && rnd.chance(0.7)),
      glints: 5,
    }),
  );

  // lueur de lune sur tout le ciel droit
  doc.add(glow(doc, { cx: moonC.cx, cy: moonC.cy, r: moonC.r * 5.2, color: C.moon, opacity: 0.08 }));
  doc.add(moon(doc, rnd, { cx: moonC.cx, cy: moonC.cy, r: moonC.r }));
  doc.add(clouds(doc, rnd, { x: moonC.cx - moonC.r * 2.4, y: moonC.cy - moonC.r * 0.9, w: moonC.r * 4.6, h: moonC.r * 1.9, n: 9 }));

  // la constellation : un arbre qui part d'une étoile d'entrée
  doc.add(constellation(doc, rng(variant === 'desktop' ? 21 : 34), { ...L.tree, delay: 0.9, trunk: 6 }));

  // --- Ville ----------------------------------------------------------------
  const base = sceneH + 4;
  // la ville reste basse sous le titre et monte vers la lune
  const low = (x) => (x < L.leftLow ? 0.55 : 1);
  doc.add(horizonHaze(doc, { w, y0: sceneH * 0.42, y1: sceneH, cx: moonC.cx / w, opacity: 0.6 }));

  const far = new Shapes();
  townLayer(far, rnd, { x0: -40, x1: w + 40, base, hMin: 70, hMax: variant === 'desktop' ? 150 : 150, spireRate: 0.3, towerRate: 0.22, lightRate: 0, scale: 1.25, profile: low, maxH: sceneH * 0.55 });
  const mid = new Shapes();
  townLayer(mid, rnd, { x0: -40, x1: w + 40, base, hMin: 40, hMax: variant === 'desktop' ? 96 : 130, spireRate: 0.3, towerRate: 0.12, lightRate: 0.25, scale: 1, profile: low, skip: [[L.cath.cx - 120, L.cath.cx + 120]] });
  cathedral(mid, rnd, L.cath.cx, base - L.cath.lift, L.cath.k);
  mid.rect(L.cath.cx - 230 * L.cath.k, base, 460 * L.cath.k, L.cath.lift + 2);
  clockTower(mid, rnd, L.clock.cx, base - L.clock.lift, L.clock.k);
  mid.rect(L.clock.cx - 40, base, 80, L.clock.lift + 2);

  const near = new Shapes();
  townLayer(near, rnd, { x0: -40, x1: w + 40, base, hMin: 18, hMax: variant === 'desktop' ? 58 : 80, spireRate: 0.18, towerRate: 0.06, lightRate: 0.35, scale: 0.9 });

  const hazeFar = doc.uid('hz');
  doc.defs(`<linearGradient id="${hazeFar}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#26323A"/><stop offset=".5" stop-color="#1C252B"/><stop offset="1" stop-color="#151C20"/></linearGradient>`);
  doc.add(`<path d="${far.path()}" fill="url(#${hazeFar})"/>`);
  doc.add(lights(far.lights, rnd, 0.35));
  doc.add(mist(doc, rnd, { x: -100, y: sceneH - 170, w: w + 200, h: 100, opacity: 0.1, n: 6, drift: 50, dur: 55 }));
  doc.add(`<path d="${mid.path()}" fill="#0C1113"/>`);
  for (const m of mid.marks.filter((k) => k.name === 'clock')) doc.add(clockFace(doc, m));
  doc.add(lights(mid.lights, rnd, 0.65));
  doc.add(mist(doc, rnd, { x: -100, y: sceneH - 80, w: w + 200, h: 70, opacity: 0.11, n: 6, drift: 70, dur: 40 }));
  doc.add(`<path d="${near.path()}" fill="#070909"/>`);
  doc.add(lights(near.lights, rnd, 0.9));
  if (L.ground) {
    // sous la ville, la rue dans l'ombre : le titre s'y pose
    const gid = doc.uid('gd');
    doc.defs(`<linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#070909"/><stop offset=".35" stop-color="#0B0E10"/><stop offset="1" stop-color="#101416"/></linearGradient>`);
    doc.add(`<rect x="0" y="${sceneH}" width="${w}" height="${h - sceneH}" fill="url(#${gid})"/>`);
    doc.add(mist(doc, rnd, { x: -100, y: sceneH + 6, w: w + 200, h: 60, opacity: 0.08, n: 5, drift: 40, dur: 45 }));
  }

  // --- Bandeau supérieur, comme l'en-tête de l'application ------------------------
  const pad = L.bar.pad;
  doc.add(doc.text(t.hero.run, { f: 'm5', size: variant === 'desktop' ? 17 : 19, x: pad, y: L.bar.y, fill: C.bone, tracking: 0.3, upper: true, cls: 'rise', extra: ' style="animation-delay:.1s"' }));
  const runW = doc.width(t.hero.run, 'm5', variant === 'desktop' ? 17 : 19, 0.3, true);
  if (!L.bar.compact) {
    doc.add(diamond(pad + runW + 22, L.bar.y - 6, 3.2, C.ember));
    doc.add(doc.text('Bloodborne', { f: 's4i', size: 18, x: pad + runW + 38, y: L.bar.y, fill: C.ashDim, cls: 'rise', extra: ' style="animation-delay:.2s"' }));
  }
  // compteurs à droite : étoiles et constellations
  const cs = variant === 'desktop' ? 17 : 19;
  const c2w = doc.width(t.hero.counter[1], 's4', cs);
  const c1w = doc.width(t.hero.counter[0], 's4', cs);
  const right = w - pad;
  doc.add(doc.text(t.hero.counter[1], { f: 's4', size: cs, x: right, y: L.bar.y, fill: C.ash, anchor: 'end' }));
  doc.add(moonGlyph(right - c2w - 18, L.bar.y - 6, 7));
  doc.add(`<circle cx="${r1(right - c2w - 42)}" cy="${L.bar.y - 6}" r="1.6" fill="${C.ashDim}"/>`);
  doc.add(doc.text(t.hero.counter[0], { f: 's4', size: cs, x: right - c2w - 58, y: L.bar.y, fill: C.ash, anchor: 'end' }));
  doc.add(sparkGlyph(right - c2w - 58 - c1w - 18, L.bar.y - 6, 8));
  doc.add(`<rect x="${pad}" y="${L.bar.line}" width="${w - pad * 2}" height="1" fill="${C.bone}" fill-opacity=".1"/>`);

  // --- Titre ------------------------------------------------------------------
  const T0 = L.title;
  const ebSize = doc.fit(t.hero.eyebrow, 'm5', variant === 'desktop' ? 18 : 20, w - T0.x * 2, 0.26, true);
  doc.add(doc.text(t.hero.eyebrow, { f: 'm5', size: ebSize, x: T0.x + 2, y: T0.eyebrowY, fill: C.ember, tracking: 0.26, upper: true, cls: 'rise', extra: ' style="animation-delay:.35s"' }));

  // le nom, en tracés : le trait d'or s'écrit puis l'encre le remplit
  let size = T0.nameSize;
  while (measure(t.hero.name, 'm6', size, 0.01) > T0.nameMax) size -= 2;
  const { paths } = glyphPaths(t.hero.name, 'm6', size, T0.x, T0.nameY, 0.01);
  const ink = doc.uid('in');
  const halo = doc.uid('ih');
  doc.defs(
    `<linearGradient id="${ink}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F6F2E8"/><stop offset=".62" stop-color="${C.bone}"/><stop offset="1" stop-color="#B9AE95"/></linearGradient>` +
      `<filter id="${halo}" x="-10%" y="-40%" width="120%" height="180%"><feGaussianBlur stdDeviation="14"/></filter>`,
  );
  const allD = paths.map((p) => p.d).join('');
  doc.add(`<g class="rise" style="animation-delay:2.1s;animation-duration:2.4s"><path d="${allD}" fill="${C.emberCore}" opacity=".16" filter="url(#${halo})"/></g>`);
  doc.add(
    `<g fill="url(#${ink})" stroke="${C.goldSheen}" stroke-width="1.1" stroke-opacity=".85">` +
      paths.map((p, i) => `<path class="ink" pathLength="1" d="${p.d}" style="animation-delay:${r1(0.5 + i * 0.07)}s"/>`).join('') +
      '</g>',
  );

  // l'accroche, en italique de Spectral
  t.hero.hook.forEach((line, i) => {
    doc.add(doc.text(line, { f: 's3i', size: T0.hookSize, x: T0.x + 2, y: T0.hookY + i * T0.hookStep, fill: C.parchment, cls: 'rise', extra: ` style="animation-delay:${r1(1.6 + i * 0.25)}s"` }));
  });
  doc.add(`<g class="rise" style="animation-delay:2.2s">${divider(T0.x + 120, T0.divY, 240, 'flourish', C.goldSheen, 0.7)}</g>`);

  // --- Finitions ------------------------------------------------------------------
  doc.add(vignette(doc, { w, h, strength: 0.55, cx: 0.5, cy: 0.38 }));
  doc.add(grain(doc, { w, h, opacity: 0.07 }));
  return doc.render();
}

/** Fenêtres et rosaces allumées : la braise derrière les vitres. */
function lights(list, rnd, intensity) {
  return list
    .map((l) => {
      const flick = rnd.chance(0.35);
      const cls = flick ? ` class="wl" style="animation-duration:${r1(rnd.range(3, 7))}s;animation-delay:-${r1(rnd.range(0, 6))}s"` : '';
      if (l.kind === 'rose') {
        // rosace : un anneau de braise et ses rayons
        const cx = l.x + l.w / 2;
        const cy = l.y + l.h / 2;
        const r = l.w / 2;
        const spokes = Array.from({ length: 8 }, (_, i) => {
          const a = (i / 8) * Math.PI * 2;
          return `M${r1(cx + Math.cos(a) * r * 0.25)} ${r1(cy + Math.sin(a) * r * 0.25)}L${r1(cx + Math.cos(a) * r * 0.9)} ${r1(cy + Math.sin(a) * r * 0.9)}`;
        }).join('');
        return `<g${cls}><circle cx="${r1(cx)}" cy="${r1(cy)}" r="${r1(r * 1.6)}" fill="${C.ember}" fill-opacity="${(0.12 * intensity).toFixed(2)}"/><circle cx="${r1(cx)}" cy="${r1(cy)}" r="${r1(r)}" fill="#2A140A" stroke="${C.ember}" stroke-opacity="${(0.8 * intensity).toFixed(2)}" stroke-width="1.4"/><path d="${spokes}" stroke="${C.emberCore}" stroke-opacity="${(0.65 * intensity).toFixed(2)}" stroke-width="1"/><circle cx="${r1(cx)}" cy="${r1(cy)}" r="${r1(r * 0.22)}" fill="${C.emberCore}" fill-opacity="${(0.8 * intensity).toFixed(2)}"/></g>`;
      }
      if (l.kind === 'arch') return `<path${cls} d="M${r1(l.x)} ${r1(l.y + l.h)}V${r1(l.y + l.w / 2)}Q${r1(l.x)} ${r1(l.y)} ${r1(l.x + l.w / 2)} ${r1(l.y - l.w * 0.3)}Q${r1(l.x + l.w)} ${r1(l.y)} ${r1(l.x + l.w)} ${r1(l.y + l.w / 2)}V${r1(l.y + l.h)}Z" fill="${C.emberCore}" fill-opacity="${(0.5 * intensity).toFixed(2)}"/>`;
      return `<rect${cls} x="${r1(l.x)}" y="${r1(l.y)}" width="${r1(l.w)}" height="${r1(l.h)}" fill="${C.emberCore}" fill-opacity="${(0.55 * intensity).toFixed(2)}"/>`;
    })
    .join('');
}

/** Le cadran de la tour de l'horloge, pâle sous la lune. */
function clockFace(doc, m) {
  const g = glow(doc, { cx: m.x, cy: m.y, r: m.r * 3, color: C.moon, opacity: 0.12 });
  const ticks = Array.from({ length: 12 }, (_, i) => {
    const a = (i / 12) * Math.PI * 2;
    return `M${r1(m.x + Math.cos(a) * m.r * 0.78)} ${r1(m.y + Math.sin(a) * m.r * 0.78)}L${r1(m.x + Math.cos(a) * m.r * 0.92)} ${r1(m.y + Math.sin(a) * m.r * 0.92)}`;
  }).join('');
  return `${g}<circle cx="${r1(m.x)}" cy="${r1(m.y)}" r="${r1(m.r)}" fill="#3B474D" fill-opacity=".8" stroke="${C.silver}" stroke-opacity=".35"/><path d="${ticks}" stroke="${C.silver}" stroke-opacity=".5" stroke-width="1"/><path d="M${r1(m.x)} ${r1(m.y)}L${r1(m.x + m.r * 0.15)} ${r1(m.y - m.r * 0.6)}M${r1(m.x)} ${r1(m.y)}L${r1(m.x + m.r * 0.5)} ${r1(m.y + m.r * 0.1)}" stroke="${C.silver}" stroke-opacity=".7" stroke-width="1.4"/>`;
}

/** Petite étoile à quatre branches, comme le compteur de l'application. */
function sparkGlyph(x, y, s, color = C.bone) {
  return glint(x, y, s, color, 7, 2).replace('class="gl"', 'class=""');
}

/** Croissant de lune : un demi-disque creusé d'une demi-ellipse. */
function moonGlyph(x, y, r, color = C.ash) {
  return `<path d="M${r1(x)} ${r1(y - r)}A${r} ${r} 0 0 0 ${r1(x)} ${r1(y + r)}A${r1(r * 0.42)} ${r} 0 0 1 ${r1(x)} ${r1(y - r)}Z" fill="${color}"/>`;
}
