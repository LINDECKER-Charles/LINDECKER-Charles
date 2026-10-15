/** Générateur pseudo-aléatoire reproductible (mulberry32) : un même germe, un même dessin. */
export function rng(seed) {
  let a = seed >>> 0;
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    next,
    /** Réel dans [min, max). */
    range: (min, max) => min + (max - min) * next(),
    /** Entier dans [min, max]. */
    int: (min, max) => Math.floor(min + (max - min + 1) * next()),
    /** Vrai avec la probabilité p. */
    chance: (p) => next() < p,
    pick: (list) => list[Math.floor(next() * list.length)],
  };
}

/** Arrondi pour l'écriture des coordonnées : des SVG plus légers. */
export const r1 = (n) => Math.round(n * 10) / 10;
export const r2 = (n) => Math.round(n * 100) / 100;
