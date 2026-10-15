/**
 * Constellation en arbre, à la manière de Bloodborne Legendary Run : une
 * étoile d'entrée, un tronc, des branches. Les traits se tracent, les étoiles
 * s'allument dans l'ordre ; la prochaine étoile palpite en braise, une étoile
 * légendaire porte un halo d'or.
 */
import { C } from '../core/tokens.mjs';
import { r1 } from '../core/rng.mjs';

export function constellationCss(doc) {
  if (doc._consCss) return;
  doc._consCss = true;
  doc.style(
    '@keyframes trace{from{stroke-dashoffset:1}to{stroke-dashoffset:0}}' +
      '.trace{stroke-dasharray:1;animation:trace 1.1s ease-out both}' +
      '@keyframes pop{from{opacity:0;transform:scale(.2)}to{opacity:1;transform:none}}' +
      '.pop{transform-box:fill-box;transform-origin:center;animation:pop .6s cubic-bezier(.2,.7,.2,1.3) both}' +
      '@keyframes next{0%,100%{opacity:.95;transform:scale(1)}50%{opacity:.45;transform:scale(1.35)}}' +
      '.next{transform-box:fill-box;transform-origin:center;animation:next 2.4s ease-in-out infinite}',
  );
}

/** Génère l'arbre : un tronc qui monte, des branches qui s'en écartent. */
export function growTree(rnd, { x, y, w, h, trunk = 7, branchRate = 0.55 }) {
  const nodes = [];
  const links = [];
  const root = { x: x + w * 0.5, y: y + h, depth: 0 };
  nodes.push(root);
  let prev = root;
  const step = h / trunk;
  for (let i = 1; i <= trunk; i++) {
    const n = { x: x + w * 0.5 + rnd.range(-w * 0.08, w * 0.08), y: y + h - step * i, depth: i };
    nodes.push(n);
    links.push([prev, n]);
    if (i > 1 && i < trunk && rnd.chance(branchRate)) {
      const side = rnd.chance(0.5) ? -1 : 1;
      let bp = n;
      const len = rnd.int(2, 4);
      for (let k = 1; k <= len; k++) {
        const b = { x: bp.x + side * rnd.range(w * 0.08, w * 0.15), y: bp.y - rnd.range(step * 0.25, step * 0.7), depth: i + k };
        if (b.x < x || b.x > x + w || b.y < y) break;
        nodes.push(b);
        links.push([bp, b]);
        bp = b;
      }
    }
    prev = n;
  }
  return { nodes, links };
}

/**
 * Dessine une constellation dans une boîte. `delay` décale l'allumage ;
 * `litRatio` règle la part d'étoiles allumées.
 */
export function constellation(doc, rnd, { x, y, w, h, delay = 0, litRatio = 0.6, trunk = 7, opacity = 1 }) {
  constellationCss(doc);
  const { nodes, links } = growTree(rnd, { x, y, w, h, trunk });
  const order = [...nodes].sort((a, b) => a.depth - b.depth);
  const litCount = Math.round(order.length * litRatio);
  order.forEach((n, i) => {
    n.state = i < litCount ? 'lit' : i === litCount ? 'next' : 'out';
  });
  const legendary = order[Math.max(1, Math.floor(litCount * 0.6))];
  if (legendary) legendary.state = 'legend';
  const t = (d) => delay + d * 0.28;
  const lines = links
    .map(([a, b]) => {
      const litLine = a.state !== 'out' && b.state !== 'out' && b.state !== 'next';
      return `<path class="trace" pathLength="1" d="M${r1(a.x)} ${r1(a.y)}L${r1(b.x)} ${r1(b.y)}" stroke="${litLine ? C.parchment : C.bone}" stroke-opacity="${litLine ? 0.55 : 0.22}" stroke-width="1.1" style="animation-delay:${r1(t(a.depth))}s"/>`;
    })
    .join('');
  const stars = order
    .map((n) => {
      const d = `animation-delay:${r1(t(n.depth) + 0.5)}s`;
      if (n.state === 'next')
        return `<g class="pop" style="${d}"><circle class="next" cx="${r1(n.x)}" cy="${r1(n.y)}" r="9" fill="none" stroke="${C.emberCore}" stroke-width="1.3"/><circle cx="${r1(n.x)}" cy="${r1(n.y)}" r="4.2" fill="none" stroke="${C.emberCore}" stroke-width="1.6"/></g>`;
      if (n.state === 'legend')
        return `<g class="pop" style="${d}"><circle cx="${r1(n.x)}" cy="${r1(n.y)}" r="13" fill="${C.goldSheen}" fill-opacity=".12"/><circle cx="${r1(n.x)}" cy="${r1(n.y)}" r="4.6" fill="${C.goldSheen}" stroke="#F1D9A6" stroke-width="1"/></g>`;
      if (n.state === 'lit')
        return `<g class="pop" style="${d}"><circle cx="${r1(n.x)}" cy="${r1(n.y)}" r="4" fill="${C.night}" stroke="${C.ember}" stroke-width="1.5"/><circle cx="${r1(n.x)}" cy="${r1(n.y)}" r="1.5" fill="${C.emberCore}"/></g>`;
      return `<circle class="pop" style="${d}" cx="${r1(n.x)}" cy="${r1(n.y)}" r="3.4" fill="${C.night}" stroke="${C.bone}" stroke-opacity=".45" stroke-width="1.1"/>`;
    })
    .join('');
  return `<g opacity="${opacity}" fill="none">${lines}${stars}</g>`;
}
