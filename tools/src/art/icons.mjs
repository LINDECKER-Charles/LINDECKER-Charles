/**
 * Pictogrammes : logos techniques de Simple Icons (CC0, grille de 24), tracés
 * à l'identique et recolorés en os, plus quelques dessins propres au profil
 * (C#, LinkedIn, enveloppe, livre-lanterne du portfolio, sceau…).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { r2 } from '../core/rng.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

/** Nom affiché → identifiant Simple Icons. */
const SLUGS = {
  '.NET': 'dotnet',
  '.NET 10': 'dotnet',
  'ASP.NET Core': 'dotnet',
  Angular: 'angular',
  'Angular 22': 'angular',
  TypeScript: 'typescript',
  JavaScript: 'javascript',
  PostgreSQL: 'postgresql',
  Docker: 'docker',
  Git: 'git',
  'GitHub Actions': 'githubactions',
  GitHub: 'github',
  'Node.js': 'nodedotjs',
  Python: 'python',
  Trello: 'trello',
  Vitest: 'vitest',
  SQLite: 'sqlite',
  Rust: 'rust',
  Ionic: 'ionic',
  'Ionic 9': 'ionic',
  Capacitor: 'capacitor',
  'Capacitor 8': 'capacitor',
  npm: 'npm',
  PHP: 'php',
  Symfony: 'symfony',
  React: 'react',
  'Tailwind CSS': 'tailwindcss',
  Linux: 'linux',
  Nginx: 'nginx',
  Caddy: 'caddy',
  MCP: 'modelcontextprotocol',
};

const cache = new Map();

/** Le tracé d'un logo Simple Icons (grille 24 × 24). */
function simple(slug) {
  if (!cache.has(slug)) {
    const svg = fs.readFileSync(path.join(ROOT, 'node_modules/simple-icons/icons', `${slug}.svg`), 'utf8');
    cache.set(slug, svg.match(/ d="([^"]+)"/)[1]);
  }
  return cache.get(slug);
}

/** Dessins propres, sur la même grille de 24. `fill` : plein ; `stroke` : au trait. */
const CUSTOM = {
  // hexagone et dièse, à la manière du logo C#
  'C#': { stroke: 'M12 1.8 20.8 6.9v10.2L12 22.2 3.2 17.1V6.9Z', fill: 'M11.9 7.4a4.6 4.6 0 0 0-4.5 4.6 4.6 4.6 0 0 0 8 3.1l-1.3-1.1a2.9 2.9 0 1 1 0-4l1.3-1.1a4.6 4.6 0 0 0-3.5-1.5ZM16.3 9.8h.9v.9h.8v-.9h.9v.9h.7v.9h-.7v.8h.7v.9h-.7v.9h-.9v-.9h-.8v.9h-.9v-.9h-.7v-.9h.7v-.8h-.7v-.9h.7Zm.9 1.8v.8h.8v-.8Z' },
  linkedin: { stroke: 'M3.5 3.5h17v17h-17Z', fill: 'M7 10h2.4v7.4H7ZM8.2 6.2a1.4 1.4 0 1 1 0 2.8 1.4 1.4 0 0 1 0-2.8ZM11 10h2.3v1c.4-.7 1.3-1.2 2.6-1.2 2.3 0 2.8 1.5 2.8 3.5v4.1h-2.4v-3.6c0-.9 0-2-1.2-2s-1.4.9-1.4 1.9v3.7H11Z' },
  mail: { stroke: 'M3 5.5h18v13H3ZM3.4 6l8.6 7 8.6-7' },
  // le livre-lanterne du portfolio, d'après proposition-simplifiee.svg (grille 64 ramenée à 24)
  portfolio: { stroke: 'M2.2 12.8c2.6-.8 5.3 0 7.1 1.5m5.3 0c1.9-1.5 4.5-2.3 7.1-1.5v7.5c-3.8-.8-6.8 0-9.8 1.5-3-1.5-6-2.3-9.8-1.5ZM12 16.5v5.2', fill: 'M12 12.8c-1.9 0-3-1.1-3-2.6 0-2.3 2.2-3.8 3-6.4 0 2.6 3 4.1 3 6.4 0 1.5-1.1 2.6-3 2.6Z' },
  star: { fill: 'M12 1.5 13.6 10.4 22.5 12 13.6 13.6 12 22.5 10.4 13.6 1.5 12 10.4 10.4Z' },
  scroll: { stroke: 'M6 3.5h11.5a2 2 0 0 1 0 4H17v11a2 2 0 0 1-2 2H5.5a2 2 0 0 1 0-4H7V5.5a2 2 0 0 0-1-2ZM17 7.5H7M9.5 10.5h5M9.5 13.5h5M5.5 16.5H15' },
  cards: { stroke: 'M4.6 6.9 9.5 5.6l3.2 11.8-4.9 1.3ZM14.5 5.6l4.9 1.3-3.1 11.8-4.9-1.3Z', fill: 'M9.6 3.5h4.8v13h-4.8Z' },
  branch: { stroke: 'M6 3.5v17M6 17.5a2.5 2.5 0 1 0 0 3 2.5 2.5 0 0 0 0-3ZM18 6.5a2.5 2.5 0 1 1 0 .01M18 9v1.5c0 3-2.5 4-6 4.5-3 .5-6 1.5-6 3' },
  seal: { stroke: 'M12 2.5 14 4.4l2.7-.4.9 2.6 2.5 1.2-.4 2.7 1.8 2-1.8 2 .4 2.7-2.5 1.2-.9 2.6-2.7-.4L12 21.5l-2-1.9-2.7.4-.9-2.6-2.5-1.2.4-2.7-1.8-2 1.8-2-.4-2.7 2.5-1.2.9-2.6 2.7.4Z', fill: 'M12 7.5a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9Z' },
  lantern: { stroke: 'M12 2v2.5M8.5 7 12 4.5 15.5 7ZM8.6 7.3h6.8l-.7 9.7H9.3ZM8 17h8l-1.2 2.4H9.2Z', fill: 'M12 9.6c1.6 1.6 2 2.8 2 3.8a2 2 0 0 1-4 0c0-1 .4-2.2 2-3.8Z' },
  terminal: { stroke: 'M3 4.5h18v15H3ZM6.5 9.5l3 2.5-3 2.5M11.5 15h6' },
  talk: { stroke: 'M3.5 5h17v10h-9.5l-4.5 4v-4h-3Z', fill: 'M8 9.2h1.6v1.6H8Zm3.2 0h1.6v1.6h-1.6Zm3.2 0H16v1.6h-1.6Z' },
  globe: { stroke: 'M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18ZM3.5 12h17M12 3c2.6 2.6 3.6 5.6 3.6 9s-1 6.4-3.6 9c-2.6-2.6-3.6-5.6-3.6-9S9.4 5.6 12 3Z' },
};

/** Un pictogramme de 24 ramené à `size`, coin supérieur gauche en (`x`, `y`). */
export function icon(name, x, y, size, color, { opacity = 1, strokeWidth = 1.6 } = {}) {
  const k = size / 24;
  const tr = `translate(${r2(x)} ${r2(y)}) scale(${r2(k)})`;
  const custom = CUSTOM[name];
  if (custom) {
    const sw = r2(strokeWidth / k > 3 ? 3 : strokeWidth);
    return `<g transform="${tr}" opacity="${opacity}">${custom.stroke ? `<path d="${custom.stroke}" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round"/>` : ''}${custom.fill ? `<path d="${custom.fill}" fill="${color}"/>` : ''}</g>`;
  }
  const slug = SLUGS[name] ?? name;
  return `<g transform="${tr}" opacity="${opacity}"><path d="${simple(slug)}" fill="${color}"/></g>`;
}

/** Vrai si un logo existe pour cette technologie. */
export const hasIcon = (name) => Boolean(CUSTOM[name] || SLUGS[name]);
