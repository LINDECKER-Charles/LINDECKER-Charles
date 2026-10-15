/**
 * III. Le ciel des projets : neuf projets en quatre constellations, dessinées
 * comme les galaxies de Bloodborne Legendary Run (un arbre qui part d'une
 * étoile d'entrée). Une étoile allumée est un projet en service ; Omnicard,
 * hors ligne, reste éteinte ; Bloodborne Legendary Run est l'étoile
 * légendaire. Une étincelle remonte chaque arbre, en boucle.
 */
import { Doc } from '../core/doc.mjs';
import { C } from '../core/tokens.mjs';
import { rng, r1 } from '../core/rng.mjs';
import { plate, label, TXT } from './plate.mjs';
import { glow, glint } from '../art/sky.mjs';

/**
 * Les arbres, en coordonnées du bureau (le ciel commence à y = 0). `up` : le
 * nom au-dessus de l'étoile ; sinon dessous.
 */
const TREES = [
  {
    family: 'equipe',
    nodes: { e: [170, 330], a: [160, 270], b: [186, 212], c: [112, 178], d: [196, 146], f: [252, 104], pvz: [164, 56] },
    links: [['e', 'a'], ['a', 'b'], ['b', 'c'], ['b', 'd'], ['d', 'f'], ['d', 'pvz']],
    named: { pvz: { id: 'pvz', state: 'lit', up: true } },
  },
  {
    family: 'jeu',
    nodes: { e: [478, 330], a: [478, 280], b: [430, 236], omni: [366, 194], c: [524, 222], d: [504, 158], blr: [478, 66], f: [584, 168], league: [610, 236], g: [416, 126] },
    links: [['e', 'a'], ['a', 'b'], ['b', 'omni'], ['a', 'c'], ['c', 'd'], ['d', 'blr'], ['c', 'f'], ['f', 'league'], ['d', 'g']],
    named: {
      omni: { id: 'omnicard', state: 'out' },
      blr: { id: 'blr', state: 'legend', up: true },
      league: { id: 'league', state: 'lit' },
    },
  },
  {
    family: 'outils',
    nodes: { e: [800, 330], a: [806, 268], b: [772, 214], gup: [726, 160], c: [832, 176], d: [890, 218], gh: [842, 70] },
    links: [['e', 'a'], ['a', 'b'], ['b', 'gup'], ['a', 'c'], ['c', 'd'], ['c', 'gh']],
    named: {
      gup: { id: 'gup', state: 'lit' },
      gh: { id: 'githealth', state: 'lit', up: true },
    },
  },
  {
    family: 'ia',
    nodes: { e: [1078, 330], a: [1078, 274], d: [1024, 236], karl: [978, 206], b: [1094, 204], sil: [1052, 104], c: [1146, 158], rel: [1176, 72] },
    links: [['e', 'a'], ['a', 'd'], ['d', 'karl'], ['a', 'b'], ['b', 'sil'], ['b', 'c'], ['c', 'rel']],
    named: {
      karl: { id: 'karl', state: 'lit' },
      sil: { id: 'sillage', state: 'lit', up: true },
      rel: { id: 'relais', state: 'lit', up: true },
    },
  },
];

const NAMES = {
  pvz: ['PvZ Fusion'],
  omnicard: ['Omnicard'],
  blr: ['Bloodborne', 'Legendary Run'],
  league: ['League Of', 'Data Base'],
  gup: ['gup'],
  githealth: ['GitHealth'],
  karl: ['Karl Scraper'],
  sillage: ['Sillage'],
  relais: ['Relais'],
};

/**
 * Sur téléphone, les quatre arbres se rangent en deux rangées de deux : chaque
 * arbre est déplacé (dx, dy) depuis sa place du bureau.
 */
const MOBILE_SHIFT = { equipe: [-10, 0], jeu: [-6, 0], outils: [-628, 470], ia: [-557, 470] };

export async function sky(t, variant = 'desktop') {
  const mobile = variant === 'mobile';
  const W = mobile ? 720 : 1280;
  const X = TXT[variant];
  const S = t.sky;
  const doc = new Doc({ w: W, h: 100, title: `${S.chapter}. ${S.title}`, desc: S.alt, lang: t.lang });
  const p = plate(doc, rng(mobile ? 32 : 31), { variant, chapter: S.chapter, title: S.title, sub: S.sub, stars: mobile ? 140 : 160 });
  doc.style(
    '@keyframes run{from{stroke-dashoffset:1.08}to{stroke-dashoffset:0}}' +
      '.run{stroke-dasharray:.08 1;animation:run 6s linear infinite}' +
      '@keyframes beat{0%,100%{opacity:.55;transform:scale(1)}50%{opacity:1;transform:scale(1.12)}}' +
      '.beat{transform-box:fill-box;transform-origin:center;animation:beat 4.5s ease-in-out infinite}',
  );

  // le compteur, comme dans l'en-tête de l'application
  const all = TREES.flatMap((tr) => Object.values(tr.named));
  const lit = all.filter((n) => n.state !== 'out').length;
  const counter = S.counter.replace(/^\d+ \/ \d+/, `${lit} / ${all.length}`);
  const top = p.top + (mobile ? 34 : 30);
  const cs = X.label + 4;
  doc.add(doc.text(counter, { f: 's4', size: cs, x: W / 2 + 12, y: top, fill: C.ash, anchor: 'middle' }));
  const cw = doc.width(counter, 's4', cs);
  doc.add(glint(W / 2 + 12 - cw / 2 - 18, top - 6, 7, C.bone, 7, 1).replace('class="gl"', 'class=""'));

  let bottom = top;
  const skyTop = top + (mobile ? 120 : 100);
  const nameSize = X.label + 1;
  TREES.forEach((tr, ti) => {
    const [dx, dy] = mobile ? MOBILE_SHIFT[tr.family] : [0, 0];
    const pt = (id) => [tr.nodes[id][0] + dx, skyTop + tr.nodes[id][1] + dy];
    const stateOf = (id) => tr.named[id]?.state;
    const lines = tr.links
      .map(([a, b]) => {
        const [x1, y1] = pt(a);
        const [x2, y2] = pt(b);
        const dim = stateOf(b) === 'out';
        return `<path d="M${r1(x1)} ${r1(y1)}L${r1(x2)} ${r1(y2)}" stroke="${dim ? C.bone : C.parchment}" stroke-opacity="${dim ? 0.22 : 0.55}" stroke-width="1.3"/>`;
      })
      .join('');
    doc.add(`<g fill="none">${lines}</g>`);
    doc.add(`<path class="run" pathLength="1" d="${sparkPath(tr, pt)}" fill="none" stroke="${C.emberCore}" stroke-width="2.6" stroke-linecap="round" style="animation-delay:-${r1(ti * 1.5)}s"/>`);
    for (const id of Object.keys(tr.nodes)) {
      if (tr.named[id]) continue;
      const [x, y] = pt(id);
      if (id === 'e') doc.add(`<circle cx="${r1(x)}" cy="${r1(y)}" r="7" fill="${C.night}" stroke="${C.goldSheen}" stroke-width="1.5"/><circle cx="${r1(x)}" cy="${r1(y)}" r="2.4" fill="${C.goldSheen}"/>`);
      else doc.add(`<circle cx="${r1(x)}" cy="${r1(y)}" r="3.6" fill="${C.ember}" fill-opacity=".9"/>`);
    }
    for (const [id, n] of Object.entries(tr.named)) {
      const [x, y] = pt(id);
      if (n.state === 'legend') {
        doc.add(glow(doc, { cx: x, cy: y, r: 80, color: C.goldSheen, opacity: 0.34 }));
        doc.add(`<circle class="beat" cx="${r1(x)}" cy="${r1(y)}" r="21" fill="none" stroke="${C.goldSheen}" stroke-opacity=".6"/>`);
        doc.add(`<circle cx="${r1(x)}" cy="${r1(y)}" r="11" fill="${C.goldSheen}" stroke="#F3DFAE" stroke-width="1.4"/>`);
        doc.add(glint(x, y, 24, '#F7E7C0', 5, ti));
      } else if (n.state === 'lit') {
        doc.add(glow(doc, { cx: x, cy: y, r: 42, color: C.emberCore, opacity: 0.28 }));
        doc.add(`<circle class="beat" cx="${r1(x)}" cy="${r1(y)}" r="14" fill="none" stroke="${C.ember}" stroke-opacity=".5" style="animation-delay:-${r1(ti * 1.1)}s"/>`);
        doc.add(`<circle cx="${r1(x)}" cy="${r1(y)}" r="8.5" fill="${C.night}" stroke="${C.ember}" stroke-width="2"/><circle cx="${r1(x)}" cy="${r1(y)}" r="3.8" fill="${C.emberCore}"/>`);
      } else {
        doc.add(`<circle cx="${r1(x)}" cy="${r1(y)}" r="8.5" fill="${C.night}" stroke="${C.bone}" stroke-opacity=".55" stroke-width="1.6"/><path d="M${r1(x - 4)} ${r1(y + 4)}L${r1(x + 4)} ${r1(y - 4)}" stroke="${C.bone}" stroke-opacity=".4"/>`);
      }
      const fill = n.state === 'legend' ? C.goldSheen : n.state === 'out' ? C.ash : C.bone;
      const name = NAMES[n.id];
      const lineStep = nameSize * 1.45;
      const gap = n.state === 'legend' ? 46 : 32;
      name.forEach((line, li) => {
        const ly = n.up ? y - gap - (name.length - 1 - li) * lineStep : y + gap + 6 + li * lineStep;
        doc.add(label(doc, line, { x, y: ly, size: nameSize, fill, anchor: 'middle', tracking: 0.2, halo: C.night }));
        bottom = Math.max(bottom, ly);
      });
      if (n.state === 'out') {
        const ly = y + gap + 6 + name.length * lineStep;
        doc.add(doc.text(t.lang === 'fr' ? 'hors ligne' : 'offline', { f: 's3i', size: X.label, x, y: ly - 4, fill: C.ashDim, anchor: 'middle' }));
      }
    }
    const [ex, ey] = pt('e');
    const count = Object.keys(tr.named).length;
    doc.add(label(doc, S.families[tr.family], { x: ex, y: ey + 48, size: X.label + 1, fill: C.ember, anchor: 'middle', tracking: 0.28 }));
    const unit = t.lang === 'fr' ? (count > 1 ? 'étoiles' : 'étoile') : count > 1 ? 'stars' : 'star';
    doc.add(doc.text(`${count} ${unit}`, { f: 's3i', size: X.label, x: ex, y: ey + 48 + X.label * 1.5, fill: C.ashDim, anchor: 'middle' }));
    bottom = Math.max(bottom, ey + 48 + X.label * 1.5);
  });

  p.finish(bottom);
  return doc.render();
}

/** Le chemin le plus long depuis l'étoile d'entrée, pour l'étincelle. */
function sparkPath(tr, pt) {
  const children = {};
  for (const [a, b] of tr.links) (children[a] ??= []).push(b);
  const longest = (id) => {
    const kids = children[id] ?? [];
    let best = [];
    for (const k of kids) {
      const path = longest(k);
      if (path.length > best.length) best = path;
    }
    return [id, ...best];
  };
  return longest('e')
    .map((id, i) => `${i ? 'L' : 'M'}${r1(pt(id)[0])} ${r1(pt(id)[1])}`)
    .join('');
}
