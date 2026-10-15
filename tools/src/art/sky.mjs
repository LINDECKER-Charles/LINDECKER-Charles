/**
 * Le ciel : fond de nuit, étoiles qui scintillent, lune, nuages, brume, grain
 * et vignette. Chaque fonction écrit ses définitions dans le document et
 * renvoie son balisage.
 */
import { C } from '../core/tokens.mjs';
import { r1, r2 } from '../core/rng.mjs';

/** Fond de nuit vertical, plus froid en haut, plus chaud près de l'horizon. */
export function nightBackground(doc, { w, h, top = '#0A0D0F', mid = C.night, bottom = '#17110E', midAt = 0.55 } = {}) {
  const id = doc.uid('bg');
  doc.defs(
    `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="${midAt}" stop-color="${mid}"/><stop offset="1" stop-color="${bottom}"/></linearGradient>`,
  );
  return `<rect width="${w}" height="${h}" fill="url(#${id})"/>`;
}

/**
 * Champ d'étoiles. `avoid(x, y)` écarte des zones (texte, lune). Une part
 * scintille, chacune à son rythme ; quelques-unes portent une croix de lumière.
 */
export function starField(doc, rnd, { x = 0, y = 0, w, h, n = 120, avoid = () => false, twinkle = 0.3, glints = 4, maxR = 1.5, color = C.bone, fade } = {}) {
  if (!doc._starCss) {
    doc._starCss = true;
    doc.style(
      '@keyframes tw{0%,100%{opacity:1}50%{opacity:.18}}' +
        '.tw{animation:tw 5s ease-in-out infinite}' +
        '@keyframes gl{0%,100%{opacity:.85;transform:scale(1)}50%{opacity:.35;transform:scale(.7)}}' +
        '.gl{transform-box:fill-box;transform-origin:center;animation:gl 6s ease-in-out infinite}',
    );
  }
  const out = [];
  let placed = 0;
  let guard = 0;
  while (placed < n && guard < n * 20) {
    guard++;
    const sx = x + rnd.next() * w;
    const sy = y + rnd.next() * h;
    if (avoid(sx, sy)) continue;
    placed++;
    const big = rnd.next();
    const r = big > 0.97 ? rnd.range(1.1, maxR) : big > 0.8 ? rnd.range(0.7, 1.1) : rnd.range(0.35, 0.75);
    // plus pâles vers le bas : l'horizon est noyé de brume
    const depth = fade ? Math.max(0.15, 1 - (sy - y) / h) : 1;
    const op = r2(rnd.range(0.35, 0.95) * depth);
    const tint = rnd.chance(0.12) ? C.moon : rnd.chance(0.06) ? C.parchment : color;
    if (rnd.chance(twinkle)) {
      out.push(`<circle class="tw" cx="${r1(sx)}" cy="${r1(sy)}" r="${r2(r)}" fill="${tint}" fill-opacity="${op}" style="animation-duration:${r1(rnd.range(3.2, 8))}s;animation-delay:-${r1(rnd.range(0, 8))}s"/>`);
    } else out.push(`<circle cx="${r1(sx)}" cy="${r1(sy)}" r="${r2(r)}" fill="${tint}" fill-opacity="${op}"/>`);
  }
  // quelques étoiles plus vives, en croix de lumière
  for (let i = 0; i < glints; i++) {
    let gx;
    let gy;
    let tries = 0;
    do {
      gx = x + rnd.next() * w;
      gy = y + rnd.next() * h * 0.7;
      tries++;
    } while (avoid(gx, gy) && tries < 40);
    out.push(glint(gx, gy, rnd.range(5, 9), rnd.chance(0.3) ? C.moon : C.bone, rnd.range(4, 9), rnd.range(0, 6)));
  }
  return `<g>${out.join('')}</g>`;
}

/** Étoile vive : une croix fine à quatre branches et un cœur. */
export function glint(x, y, s, color = C.bone, dur = 6, delay = 0) {
  const k = s * 0.16;
  const d = `M${r1(x)} ${r1(y - s)}L${r1(x + k)} ${r1(y - k)}L${r1(x + s)} ${r1(y)}L${r1(x + k)} ${r1(y + k)}L${r1(x)} ${r1(y + s)}L${r1(x - k)} ${r1(y + k)}L${r1(x - s)} ${r1(y)}L${r1(x - k)} ${r1(y - k)}Z`;
  return `<g class="gl" style="animation-duration:${r1(dur)}s;animation-delay:-${r1(delay)}s"><path d="${d}" fill="${color}" fill-opacity=".9"/><circle cx="${r1(x)}" cy="${r1(y)}" r="${r1(s * 0.22)}" fill="#fff"/></g>`;
}

/**
 * La lune pâle de Yharnam : un disque crémeux, des mers plus sombres, un
 * limbe bleuté et un grand halo.
 */
export function moon(doc, rnd, { cx, cy, r, haloR = r * 3.4, haloOpacity = 0.22 }) {
  const body = doc.uid('mb');
  const halo = doc.uid('mh');
  const clip = doc.uid('mc');
  const blur = doc.uid('mf');
  const limb = doc.uid('ml');
  doc.defs(
    `<radialGradient id="${body}" cx=".42" cy=".38" r=".75"><stop offset="0" stop-color="#F4F1E6"/><stop offset=".55" stop-color="#E2E3DC"/><stop offset=".85" stop-color="#C9D0D2"/><stop offset="1" stop-color="#AEB9BF"/></radialGradient>` +
      `<radialGradient id="${halo}"><stop offset="0" stop-color="${C.moon}" stop-opacity="${haloOpacity}"/><stop offset=".3" stop-color="${C.moon}" stop-opacity="${r2(haloOpacity * 0.45)}"/><stop offset=".65" stop-color="${C.moon}" stop-opacity="${r2(haloOpacity * 0.12)}"/><stop offset="1" stop-color="${C.moon}" stop-opacity="0"/></radialGradient>` +
      `<radialGradient id="${limb}" cx=".5" cy=".5" r=".5"><stop offset=".78" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#3A4A55" stop-opacity=".45"/></radialGradient>` +
      `<clipPath id="${clip}"><circle cx="${cx}" cy="${cy}" r="${r}"/></clipPath>` +
      `<filter id="${blur}" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="${r1(r * 0.05)}"/></filter>`,
  );
  // mers lunaires : des taches floues, plus grises
  const seas = [];
  for (let i = 0; i < 9; i++) {
    const a = rnd.range(0, Math.PI * 2);
    const d = rnd.range(0, r * 0.7);
    seas.push(
      `<ellipse cx="${r1(cx + Math.cos(a) * d)}" cy="${r1(cy + Math.sin(a) * d)}" rx="${r1(rnd.range(r * 0.12, r * 0.32))}" ry="${r1(rnd.range(r * 0.08, r * 0.24))}" fill="#8E9AA0" fill-opacity="${r2(rnd.range(0.12, 0.3))}" transform="rotate(${r1(rnd.range(0, 180))} ${r1(cx)} ${r1(cy)})"/>`,
    );
  }
  for (let i = 0; i < 14; i++) {
    const a = rnd.range(0, Math.PI * 2);
    const d = rnd.range(0, r * 0.85);
    seas.push(`<circle cx="${r1(cx + Math.cos(a) * d)}" cy="${r1(cy + Math.sin(a) * d)}" r="${r1(rnd.range(r * 0.015, r * 0.05))}" fill="#7F8B92" fill-opacity="${r2(rnd.range(0.15, 0.35))}"/>`);
  }
  return (
    `<circle cx="${cx}" cy="${cy}" r="${r1(haloR)}" fill="url(#${halo})"/>` +
    `<circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#${body})"/>` +
    `<g clip-path="url(#${clip})"><g filter="url(#${blur})">${seas.join('')}</g><circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#${limb})"/></g>`
  );
}

/**
 * Nuages effilés : des fuseaux sombres qui passent devant la lune, et
 * quelques voiles plus clairs que la lune éclaire par en dessous.
 */
export function clouds(doc, rnd, { x, y, w, h, n = 6, color = '#141B1F', lit = C.moonDim, opacity = [0.3, 0.6], drift = 60 } = {}) {
  const blur = doc.uid('cb');
  doc.defs(`<filter id="${blur}" x="-30%" y="-300%" width="160%" height="700%"><feGaussianBlur stdDeviation="5 1.6"/></filter>`);
  if (!doc._cloudCss) {
    doc._cloudCss = true;
    doc.style('@keyframes cd{from{transform:translateX(0)}to{transform:translateX(var(--dx))}}.cd{animation:cd 80s ease-in-out infinite alternate}');
  }
  const out = [];
  for (let i = 0; i < n; i++) {
    const cx = x + rnd.next() * w;
    const cy = y + rnd.next() * h;
    const len = rnd.range(w * 0.2, w * 0.5);
    const th = rnd.range(2.5, 7);
    const isLit = rnd.chance(0.35);
    // fuseau : effilé aux deux bouts, plus épais au tiers
    const a = cx - len / 2;
    const b = cx + len / 2;
    const k = rnd.range(0.3, 0.6);
    const d = `M${r1(a)} ${r1(cy)}Q${r1(a + len * k)} ${r1(cy - th * 2)} ${r1(b)} ${r1(cy + rnd.range(-th, th))}Q${r1(a + len * (k + 0.1))} ${r1(cy + th * 1.4)} ${r1(a)} ${r1(cy)}Z`;
    out.push(
      `<g class="cd" style="--dx:${r1(rnd.range(-drift, drift))}px;animation-duration:${r1(rnd.range(60, 110))}s;animation-delay:-${r1(rnd.range(0, 60))}s"><path d="${d}" fill="${isLit ? lit : color}" fill-opacity="${r2(isLit ? rnd.range(0.08, 0.18) : rnd.range(...opacity))}" filter="url(#${blur})"/></g>`,
    );
  }
  return `<g>${out.join('')}</g>`;
}

/** Brume d'horizon : la lune éclaire l'air au-dessus des toits, le ciel s'y éclaircit. */
export function horizonHaze(doc, { w, y0, y1, color = '#2C3A42', opacity = 0.55, cx = 0.7 }) {
  const id = doc.uid('hh');
  const id2 = doc.uid('hm');
  doc.defs(
    `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${color}" stop-opacity="0"/><stop offset=".7" stop-color="${color}" stop-opacity="${opacity}"/><stop offset="1" stop-color="${color}" stop-opacity="${r2(opacity * 0.7)}"/></linearGradient>` +
      `<radialGradient id="${id2}" cx="${cx}" cy="1" r="1"><stop offset="0" stop-color="#fff"/><stop offset=".8" stop-color="#fff" stop-opacity=".35"/><stop offset="1" stop-color="#fff" stop-opacity=".15"/></radialGradient>` +
      `<mask id="${id2}m"><rect x="0" y="${y0}" width="${w}" height="${y1 - y0}" fill="url(#${id2})"/></mask>`,
  );
  return `<rect x="0" y="${y0}" width="${w}" height="${y1 - y0}" fill="url(#${id})" mask="url(#${id2}m)"/>`;
}

/** Bande de brume au clair de lune, qui glisse lentement. */
export function mist(doc, rnd, { x = 0, y, w, h, color = C.moon, opacity = 0.1, n = 5, drift = 40, dur = 50 } = {}) {
  const blur = doc.uid('mi');
  doc.defs(`<filter id="${blur}" x="-20%" y="-100%" width="140%" height="300%"><feGaussianBlur stdDeviation="${r1(h * 0.35)} ${r1(h * 0.22)}"/></filter>`);
  if (!doc._mistCss) {
    doc._mistCss = true;
    doc.style('@keyframes md{from{transform:translateX(0)}to{transform:translateX(var(--dx))}}.md{animation:md 50s ease-in-out infinite alternate}');
  }
  const out = [];
  for (let i = 0; i < n; i++) {
    const cx = x + (w * (i + rnd.range(0.1, 0.9))) / n;
    out.push(
      `<ellipse cx="${r1(cx)}" cy="${r1(y + rnd.range(-h * 0.2, h * 0.2))}" rx="${r1(rnd.range(w / n, (w / n) * 1.8))}" ry="${r1(rnd.range(h * 0.25, h * 0.5))}" fill="${color}" fill-opacity="${r2(opacity * rnd.range(0.6, 1.2))}"/>`,
    );
  }
  return `<g class="md" style="--dx:${r1(rnd.range(-drift, drift))}px;animation-duration:${dur}s"><g filter="url(#${blur})">${out.join('')}</g></g>`;
}

/** Grain de pellicule, comme le jeton `--texture-grain` du design system. */
export function grain(doc, { w, h, opacity = 0.06, freq = 0.85 } = {}) {
  const id = doc.uid('gr');
  doc.defs(
    `<filter id="${id}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="2" stitchTiles="stitch" seed="7"/><feColorMatrix type="saturate" values="0"/></filter>`,
  );
  return `<rect width="${w}" height="${h}" filter="url(#${id})" opacity="${opacity}" style="mix-blend-mode:overlay"/>`;
}

/** Vignette : les bords s'enfoncent dans la nuit. */
export function vignette(doc, { w, h, strength = 0.6, cx = 0.5, cy = 0.42 } = {}) {
  const id = doc.uid('vg');
  doc.defs(
    `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r=".75"><stop offset=".45" stop-color="#000" stop-opacity="0"/><stop offset=".85" stop-color="#000" stop-opacity="${r2(strength * 0.6)}"/><stop offset="1" stop-color="#000" stop-opacity="${strength}"/></radialGradient>`,
  );
  return `<rect width="${w}" height="${h}" fill="url(#${id})"/>`;
}

/** Lueur ronde (lanterne, braise, lune), en dégradé radial. */
export function glow(doc, { cx, cy, r, color = C.emberCore, opacity = 0.3, cls = '', style = '' }) {
  const id = doc.uid('gw');
  doc.defs(
    `<radialGradient id="${id}"><stop offset="0" stop-color="${color}" stop-opacity="${opacity}"/><stop offset=".4" stop-color="${color}" stop-opacity="${r2(opacity * 0.35)}"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></radialGradient>`,
  );
  return `<circle${cls ? ` class="${cls}"` : ''}${style ? ` style="${style}"` : ''} cx="${r1(cx)}" cy="${r1(cy)}" r="${r1(r)}" fill="url(#${id})"/>`;
}
