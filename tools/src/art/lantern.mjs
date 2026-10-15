/**
 * Lanterne de chasseur, au trait comme les ornements du design system :
 * anneau, toit en pagode, cage à barreaux, flamme qui vacille. Allumée, sa
 * vitre et son halo prennent la couleur de la braise ; éteinte, elle reste
 * un dessin de pierre. Boîte locale : 100 × 170, origine en haut au centre.
 */
import { C } from '../core/tokens.mjs';
import { r1, r2 } from '../core/rng.mjs';

export function lanternCss(doc) {
  if (doc._lanternCss) return;
  doc._lanternCss = true;
  doc.style(
    '@keyframes fl{0%,100%{transform:scale(1,1)}20%{transform:scale(.93,1.07)}45%{transform:scale(1.05,.94)}70%{transform:scale(.97,1.04)}}' +
      '.fl{transform-box:fill-box;transform-origin:50% 92%;animation:fl 1.9s ease-in-out infinite}' +
      '@keyframes hg{0%,100%{opacity:1}30%{opacity:.82}55%{opacity:.95}80%{opacity:.78}}' +
      '.hg{animation:hg 3.1s ease-in-out infinite}',
  );
}

/**
 * Pose une lanterne. `x`, `y` : le haut de l'anneau ; `s` : l'échelle.
 * `state` : `lit` (allumée), `next` (la prochaine, braise vive), `out` (éteinte).
 */
export function lantern(doc, { x, y, s = 1, state = 'lit', stroke = C.goldSheen, strokeOpacity = 0.9, glowR = 120, delay = 0 }) {
  lanternCss(doc);
  const lit = state !== 'out';
  const glass = doc.uid('lg');
  const flame = doc.uid('lf');
  const halo = doc.uid('lh');
  const core = state === 'next' ? C.emberCore : C.ember;
  doc.defs(
    `<radialGradient id="${glass}" cx=".5" cy=".62" r=".7"><stop offset="0" stop-color="${lit ? '#FFE2B0' : '#2A2522'}" stop-opacity="${lit ? 0.95 : 0.9}"/><stop offset=".45" stop-color="${lit ? core : '#1E1A17'}" stop-opacity="${lit ? 0.55 : 0.9}"/><stop offset="1" stop-color="${lit ? '#3A1A08' : '#141110'}" stop-opacity="${lit ? 0.85 : 0.95}"/></radialGradient>` +
      `<linearGradient id="${flame}" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#FFF4D6"/><stop offset=".45" stop-color="${C.emberCore}"/><stop offset="1" stop-color="${C.emberCoal}"/></linearGradient>` +
      `<radialGradient id="${halo}"><stop offset="0" stop-color="${C.emberCore}" stop-opacity="${state === 'next' ? 0.42 : 0.3}"/><stop offset=".35" stop-color="${C.ember}" stop-opacity=".12"/><stop offset="1" stop-color="${C.ember}" stop-opacity="0"/></radialGradient>`,
  );
  const sw = r2(1.5 / s);
  const st = `fill="none" stroke="${stroke}" stroke-opacity="${strokeOpacity}" stroke-width="${sw}" stroke-linejoin="miter"`;
  const anim = delay ? ` style="animation-delay:-${r1(delay)}s"` : '';
  const parts = [];
  if (lit) parts.push(`<circle class="hg"${anim} cx="0" cy="88" r="${r1(glowR / s)}" fill="url(#${halo})"/>`);
  parts.push(
    // anneau et crochet
    `<circle cx="0" cy="7" r="6" ${st}/><path d="M0 13v7" ${st}/>`,
    // toit en pagode, avec ses avant-toits relevés
    `<path d="M-34 44q8-3 14-10 8-9 12-14h16q4 5 12 14 6 7 14 10" ${st}/><path d="M-8 20h16" ${st}/><path d="M-30 44h60v6h-60z" ${st}/>`,
    // vitre
    `<path d="M-24 50h48l-4 64h-40z" fill="url(#${glass})" stroke="none"/>`,
    // cage : montants et traverse
    `<path d="M-24 50l4 64M24 50l-4 64M-8 50l1.3 64M8 50l-1.3 64M-23 80h46" ${st}/>`,
    // socle et pointe
    `<path d="M-26 114h52v7h-52zM-18 121l18 16 18-16M0 137v8" ${st}/><circle cx="0" cy="148" r="3" fill="${stroke}" fill-opacity="${strokeOpacity}"/>`,
  );
  if (lit) parts.push(`<path class="fl"${anim} d="M0 72c-5 7-9 12-9 18 0 6 4 10 9 10s9-4 9-10c0-6-4-11-9-18z" fill="url(#${flame})"/><circle class="hg"${anim} cx="0" cy="92" r="6" fill="#FFF8E6" fill-opacity=".9"/>`);
  return `<g transform="translate(${r1(x)} ${r1(y)}) scale(${s})">${parts.join('')}</g>`;
}
