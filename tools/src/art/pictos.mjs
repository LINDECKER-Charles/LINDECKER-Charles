/**
 * Les pictogrammes des trois verbes, recopiés du portfolio V2
 * (site/src/assets/visuels/global/GLO-04.svg, dessinés à la main sur une
 * grille de 48) : le livre ouvert et son signet (maîtriser), l'éventail de
 * cartes (réinventer), la lanterne qui en allume une autre (emmener).
 */
import { C } from '../core/tokens.mjs';
import { r2 } from '../core/rng.mjs';

const PICTOS = {
  maitriser: [
    ['trait', 'M20 11.5c-3.2-2.2-8.2-2.8-13.5-2.1v19.8c5.3-.7 10.3-.1 13.5 2.1 3.2-2.2 8.2-2.8 13.5-2.1V9.4c-5.3-.7-10.3-.1-13.5 2.1ZM20 11.5v19.8'],
    ['doux', 'M10.2 15h6.2M10.2 19h6.2M10.2 23h4.4M23.6 19h6.2M23.6 23h6.2'],
    ['plein', 'M24.2 8.7h4.6v7.6l-2.3-1.7-2.3 1.7Z'],
  ],
  reinventer: [
    // les deux cartes inclinées de ±17° autour de leur coin bas (rect pivotés de l'original)
    ['trait', 'M2.6 13.5 14.1 10 19.2 26.7 7.8 30.3Z'],
    ['trait', 'M25.9 10 37.4 13.5 32.2 30.3 20.8 26.7Z'],
    ['plein', 'M15.6 8.5h8.8a1.6 1.6 0 0 1 1.6 1.6v14.3a1.6 1.6 0 0 1-1.6 1.6h-8.8a1.6 1.6 0 0 1-1.6-1.6V10.1a1.6 1.6 0 0 1 1.6-1.6Z'],
    ['creux', 'M17.5 13.5h5M17.5 17h3'],
  ],
  emmener: [
    ['trait', 'M4.5 16.5 9 12.6l4.5 3.9ZM5.5 16.5v9.5M12.5 16.5v9.5M4 26h10M9 12.6v-2'],
    ['plein', 'M9 18.6c1.2 1.2 1.6 2.2 1.6 3a1.6 1.6 0 0 1-3.2 0c0-.8.4-1.8 1.6-3Z'],
    ['trait', 'M25.5 19.5 30 15.6l4.5 3.9ZM26.5 19.5v9.5M33.5 19.5v9.5M25 29h10M30 15.6v-2'],
    ['plein', 'M30 21.6c1.2 1.2 1.6 2.2 1.6 3a1.6 1.6 0 0 1-3.2 0c0-.8.4-1.8 1.6-3Z'],
    ['pointille', 'M13.5 12c3.5-4.5 9-5 13.5-1'],
  ],
};

/**
 * Un pictogramme centré en (`cx`, `cy`), de côté `size`. `light` colore la
 * lumière (le signet, la carte tirée, les flammes).
 */
export function picto(name, cx, cy, size, { stroke = C.bone, soft = C.ash, light = C.goldSheen, hollow = C.night, cls = '' } = {}) {
  const k = size / 40;
  const tr = `translate(${r2(cx - 20 * k)} ${r2(cy - 20 * k)}) scale(${r2(k)})`;
  const sw = (w) => r2(w);
  const parts = PICTOS[name].map(([kind, d]) => {
    if (kind === 'plein') return `<path d="${d}" fill="${light}"${cls ? ` class="${cls}"` : ''}/>`;
    if (kind === 'creux') return `<path d="${d}" fill="none" stroke="${hollow}" stroke-width="${sw(1.4)}" stroke-linecap="round"/>`;
    if (kind === 'doux') return `<path d="${d}" fill="none" stroke="${soft}" stroke-width="${sw(1.1)}" stroke-linecap="round"/>`;
    if (kind === 'pointille') return `<path d="${d}" fill="none" stroke="${light}" stroke-width="${sw(1.2)}" stroke-dasharray="1.5 3" stroke-linecap="round"/>`;
    return `<path d="${d}" fill="none" stroke="${stroke}" stroke-width="${sw(1.5)}" stroke-linecap="round" stroke-linejoin="round"/>`;
  });
  return `<g transform="${tr}">${parts.join('')}</g>`;
}
