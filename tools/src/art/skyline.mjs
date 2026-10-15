/**
 * Silhouettes gothiques façon Yharnam, générées : flèches, pinacles, tours à
 * étages, cathédrale, tour de l'horloge, pignons et cheminées. Toutes les
 * formes d'un plan sont tracées dans le même sens et réunies en un seul
 * chemin (règle de remplissage « nonzero ») : leurs recouvrements fusionnent.
 */
import { r1 } from '../core/rng.mjs';

/** Accumulateur de polygones, tous parcourus dans le même sens (gauche → haut → droite). */
class Shapes {
  constructor() {
    this.polys = [];
    this.lights = [];
    this.marks = [];
  }

  /** Ajoute un polygone, remis dans le sens commun s'il était tracé à l'envers. */
  poly(points) {
    if (points.length < 3) return this;
    let area = 0;
    for (let i = 0; i < points.length; i++) {
      const [x1, y1] = points[i];
      const [x2, y2] = points[(i + 1) % points.length];
      area += x1 * y2 - x2 * y1;
    }
    this.polys.push(area < 0 ? [...points].reverse() : points);
    return this;
  }

  rect(x, yBottom, w, h) {
    return this.poly([[x, yBottom], [x, yBottom - h], [x + w, yBottom - h], [x + w, yBottom]]);
  }

  /** Triangle posé sur `yBase`, sommet à `h` au-dessus. */
  tri(x, yBase, w, h, apexShift = 0) {
    return this.poly([[x, yBase + 0.6], [x + w / 2 + apexShift, yBase - h], [x + w, yBase + 0.6]]);
  }

  /**
   * Flèche gothique : un triangle effilé, ses crochets (petites dents sur les
   * arêtes) et un épi en pointe.
   */
  spire(cx, yBase, w, h, { crockets = 0, finial = true, needle = 0.18 } = {}) {
    const left = [[cx - w / 2, yBase + 0.6]];
    const right = [];
    const steps = crockets;
    for (let i = 1; i <= steps; i++) {
      const t = i / (steps + 1);
      const y = yBase - h * t;
      const half = (w / 2) * (1 - t);
      const tooth = Math.max(0.9, w * 0.07 * (1 - t * 0.5));
      left.push([cx - half - tooth, y + tooth * 0.4], [cx - half, y - tooth * 0.9]);
      right.unshift([cx + half, y - tooth * 0.9], [cx + half + tooth, y + tooth * 0.4]);
    }
    const apex = [[cx, yBase - h]];
    this.poly([...left, ...apex, ...right, [cx + w / 2, yBase + 0.6]]);
    if (finial) {
      const nh = h * needle;
      const nw = Math.max(0.8, w * 0.05);
      this.rect(cx - nw / 2, yBase - h + 1, nw, nh);
      const k = Math.max(1.4, w * 0.09);
      const ky = yBase - h - nh * 0.55;
      this.poly([[cx - k, ky], [cx, ky - k], [cx + k, ky], [cx, ky + k]]);
    }
    return this;
  }

  /** Pinacle : fût mince, petite flèche, boule. */
  pinnacle(cx, yBase, w, h) {
    this.rect(cx - w / 2, yBase, w, h * 0.45);
    this.spire(cx, yBase - h * 0.45, w * 1.15, h * 0.55, { crockets: 0, finial: true, needle: 0.12 });
    return this;
  }

  /** Créneaux sur une arête horizontale. */
  crenels(x, y, w, size) {
    const n = Math.max(2, Math.floor(w / (size * 2)));
    const step = w / n;
    for (let i = 0; i < n; i++) this.rect(x + i * step, y + 0.5, step * 0.55, size);
    return this;
  }

  /** Dôme en demi-cercle (approché), posé sur `yBase`. */
  dome(cx, yBase, r, squash = 1) {
    const pts = [];
    for (let i = 0; i <= 14; i++) {
      const a = Math.PI - (Math.PI * i) / 14;
      pts.push([cx + Math.cos(a) * r, yBase - Math.sin(a) * r * squash]);
    }
    pts[0][1] += 0.6;
    pts[pts.length - 1][1] += 0.6;
    return this.poly(pts);
  }

  /**
   * Arc-boutant : une bande droite de la culée (`xPier`, `yPier`) au mur
   * (`xWall`, `yWall`), creusée en dessous d'un arc.
   */
  buttress(xWall, yWall, xPier, yPier, thick) {
    const lerp = (a, b, t) => a + (b - a) * t;
    const pts = [[xPier, yPier + 0.6], [xPier, yPier - thick], [xWall, yWall - thick * 0.5], [xWall, yWall + thick * 1.2]];
    const n = 10;
    for (let i = n - 1; i >= 1; i--) {
      const t = i / n;
      pts.push([lerp(xPier, xWall, t), lerp(yPier + 0.6, yWall + thick * 1.2, t) - Math.sin(Math.PI * t) * thick * 1.1]);
    }
    return this.poly(pts);
  }

  light(x, y, w, h, kind = 'window') {
    this.lights.push({ x, y, w, h, kind });
    return this;
  }

  mark(name, data) {
    this.marks.push({ name, ...data });
    return this;
  }

  /** Un seul chemin pour tout le plan. */
  path() {
    return this.polys.map((p) => 'M' + p.map(([x, y]) => `${r1(x)} ${r1(y)}`).join('L') + 'Z').join('');
  }
}

/** Tour à étages : corps, retraits, pinacles d'angle, flèche finale. */
function tower(s, rnd, cx, base, { w, h, stages = 3, spireH, crockets = 4, pinn = true, dome = false, windows = 0 }) {
  let y = base;
  let width = w;
  const stageH = h / stages;
  for (let i = 0; i < stages; i++) {
    s.rect(cx - width / 2, y + 0.5, width, stageH + 1);
    if (pinn && i < stages) {
      const ph = stageH * rnd.range(0.35, 0.6);
      const pw = Math.max(2, width * 0.12);
      s.pinnacle(cx - width / 2 + pw / 2, y - stageH, pw, ph);
      s.pinnacle(cx + width / 2 - pw / 2, y - stageH, pw, ph);
    }
    if (windows && i < stages - 1 && rnd.chance(0.75)) {
      const ww = Math.max(1.6, width * 0.12);
      const wh = stageH * 0.42;
      s.light(cx - ww / 2, y - stageH * 0.75, ww, wh, 'arch');
    }
    y -= stageH;
    width *= rnd.range(0.72, 0.86);
  }
  if (dome) {
    s.dome(cx, y, width / 2, 1.1);
    s.spire(cx, y - width * 0.5, width * 0.18, spireH * 0.5, { crockets: 0 });
  } else s.spire(cx, y, width * 1.02, spireH, { crockets });
  return y;
}

/** La cathédrale : nef, deux tours de façade, tour de croisée, pinacles et arcs-boutants. */
export function cathedral(s, rnd, cx, base, k = 1) {
  const naveW = 250 * k;
  const naveH = 150 * k;
  // nef et toit
  s.rect(cx - naveW / 2, base, naveW, naveH);
  s.tri(cx - naveW / 2 - 4 * k, base - naveH, naveW + 8 * k, 70 * k);
  for (let i = 0; i <= 8; i++) {
    const px = cx - naveW / 2 + (naveW * i) / 8;
    s.pinnacle(px, base - naveH + 2, 6 * k, rnd.range(34, 52) * k);
  }
  // arcs-boutants de part et d'autre
  for (let i = 0; i < 4; i++) {
    const bx = cx - naveW / 2 - 34 * k - i * 6 * k;
    s.rect(bx - 5 * k, base, 10 * k, (70 + i * 6) * k);
    s.pinnacle(bx, base - (70 + i * 6) * k, 8 * k, 40 * k);
    s.buttress(cx - naveW / 2 + 2, base - naveH * 0.82, bx + 4 * k, base - (66 + i * 6) * k, 5 * k);
    const bx2 = cx + naveW / 2 + 34 * k + i * 6 * k;
    s.rect(bx2 - 5 * k, base, 10 * k, (70 + i * 6) * k);
    s.pinnacle(bx2, base - (70 + i * 6) * k, 8 * k, 40 * k);
    s.buttress(cx + naveW / 2 - 2, base - naveH * 0.82, bx2 - 4 * k, base - (66 + i * 6) * k, 5 * k);
  }
  // tours de façade
  for (const side of [-1, 1]) {
    const tx = cx + side * (naveW / 2 - 18 * k);
    tower(s, rnd, tx, base, { w: 54 * k, h: 260 * k, stages: 4, spireH: 150 * k, crockets: 7, windows: 1 });
    // tourelles d'angle, plus basses, et leurs flèches
    const ox = cx + side * (naveW / 2 + 70 * k);
    tower(s, rnd, ox, base, { w: 30 * k, h: 150 * k, stages: 3, spireH: 90 * k, crockets: 4, windows: 1 });
    // couronne de pinacles entre la façade et la croisée
    for (let i = 1; i <= 3; i++) s.pinnacle(cx + side * (naveW * 0.08 * i), base - naveH - 54 * k + i * 6 * k, 5 * k, (60 - i * 8) * k);
  }
  // tour de croisée, la plus haute, cernée de quatre flèches
  const crossTop = tower(s, rnd, cx, base - naveH + 10 * k, { w: 74 * k, h: 190 * k, stages: 3, spireH: 250 * k, crockets: 10, windows: 1 });
  for (const side of [-1, 1]) {
    s.spire(cx + side * 24 * k, crossTop + 6 * k, 9 * k, 80 * k, { crockets: 3 });
    s.spire(cx + side * 44 * k, crossTop + 40 * k, 8 * k, 64 * k, { crockets: 2 });
  }
  // rosace
  s.light(cx - 14 * k, base - naveH * 0.74, 28 * k, 28 * k, 'rose');
  s.mark('cathedral', { x: cx, top: base - naveH - 190 * k - 250 * k });
  return s;
}

/** La tour de l'horloge : un fût très haut, un cadran pâle, un toit en pointe. */
export function clockTower(s, rnd, cx, base, k = 1) {
  const w = 52 * k;
  const h = 330 * k;
  s.rect(cx - w / 2, base, w, h);
  // contreforts
  s.rect(cx - w / 2 - 6 * k, base, 8 * k, h * 0.55);
  s.rect(cx + w / 2 - 2 * k, base, 8 * k, h * 0.55);
  const top = base - h;
  s.crenels(cx - w / 2 - 3 * k, top, w + 6 * k, 5 * k);
  s.rect(cx - w * 0.38, top + 1, w * 0.76, 46 * k);
  s.pinnacle(cx - w / 2, top, 7 * k, 46 * k);
  s.pinnacle(cx + w / 2, top, 7 * k, 46 * k);
  s.spire(cx, top - 45 * k, w * 0.8, 120 * k, { crockets: 5 });
  s.mark('clock', { x: cx, y: top + 30 * k, r: 15 * k });
  return s;
}

/**
 * Un plan de ville entre `x0` et `x1`, sur la ligne `base` : maisons à
 * pignons, tours, flèches, selon une densité et une hauteur données.
 */
export function townLayer(s, rnd, { x0, x1, base, hMin, hMax, spireRate = 0.3, towerRate = 0.15, lightRate = 0.3, scale = 1, skip = [], profile = () => 1, maxH = Infinity }) {
  let x = x0;
  while (x < x1) {
    const w = rnd.range(30, 84) * scale;
    const cx = x + w / 2;
    const blocked = skip.some(([a, b]) => cx > a && cx < b);
    if (!blocked) {
      const p = profile(cx);
      const h = rnd.range(hMin, hMax) * p;
      const roll = rnd.next();
      if (roll < towerRate * p) {
        // une tour ne dépasse jamais la hauteur permise : on réduit corps et flèche ensemble
        let th = h * rnd.range(1.3, 1.8);
        let sh = h * rnd.range(0.7, 1.4);
        const k = Math.min(1, maxH / (th + sh * 1.2));
        th *= k;
        sh *= k;
        tower(s, rnd, cx, base, { w: w * rnd.range(0.45, 0.62), h: th, stages: rnd.int(2, 3), spireH: sh, crockets: rnd.int(2, 6), dome: rnd.chance(0.15), windows: lightRate > 0 ? 1 : 0 });
        s.rect(x, base, w, h * 0.55);
      } else {
        house(s, rnd, x, base, w, Math.min(h, maxH * 0.45), scale, spireRate * p);
        if (rnd.chance(lightRate)) {
          const ww = 3.2 * scale;
          const wh = 5.5 * scale;
          s.light(x + rnd.range(0.2, 0.7) * w, base - h * rnd.range(0.35, 0.8), ww, wh, rnd.chance(0.3) ? 'arch' : 'window');
        }
      }
    }
    x += w * rnd.range(0.62, 0.95);
  }
  return s;
}

/**
 * Une maison de Yharnam : pignon raide, mansarde ou toit plat crénelé,
 * cheminées, lucarnes, parfois une petite flèche.
 */
function house(s, rnd, x, base, w, h, scale, spireRate) {
  s.rect(x, base, w, h);
  const kind = rnd.next();
  const top = base - h;
  if (kind < 0.55) {
    const roofH = h * rnd.range(0.5, 1.05);
    s.tri(x - 2 * scale, top, w + 4 * scale, roofH, rnd.range(-w * 0.06, w * 0.06));
    if (rnd.chance(0.4)) {
      // lucarne pointue sur le versant
      const dx = x + w * rnd.range(0.2, 0.35);
      s.rect(dx, top - roofH * 0.25, w * 0.14, roofH * 0.2);
      s.tri(dx - 1, top - roofH * 0.45, w * 0.14 + 2, roofH * 0.25);
    }
    if (rnd.chance(0.55)) s.rect(x + w * rnd.range(0.62, 0.8), top - roofH * 0.55, 5 * scale, roofH * 0.6);
  } else if (kind < 0.8) {
    // mansarde : toit brisé, deux pentes
    const r1h = h * rnd.range(0.25, 0.4);
    s.poly([[x - 2, top + 0.6], [x + w * 0.12, top - r1h], [x + w * 0.88, top - r1h], [x + w + 2, top + 0.6]]);
    s.tri(x + w * 0.12, top - r1h, w * 0.76, h * rnd.range(0.12, 0.25));
    if (rnd.chance(0.7)) s.rect(x + w * rnd.range(0.15, 0.35), top - r1h - h * 0.3, 5 * scale, h * 0.3);
    if (rnd.chance(0.5)) s.rect(x + w * rnd.range(0.6, 0.78), top - r1h - h * 0.26, 4 * scale, h * 0.26);
  } else {
    // toit plat, crénelé, avec un pinacle à chaque angle
    s.crenels(x, top, w, 4 * scale);
    s.pinnacle(x + 3 * scale, top, 4 * scale, h * 0.35);
    s.pinnacle(x + w - 3 * scale, top, 4 * scale, h * 0.35);
  }
  if (rnd.chance(spireRate)) s.spire(x + w * rnd.range(0.3, 0.7), top - h * 0.1, rnd.range(9, 15) * scale, h * rnd.range(0.9, 1.8), { crockets: rnd.int(2, 5) });
}

export { Shapes };
