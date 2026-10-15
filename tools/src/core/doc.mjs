/**
 * Un document SVG autonome : texte composé et mesuré, polices embarquées en
 * sous-ensemble, styles et animations CSS internes. Rien n'est chargé au
 * dehors : GitHub sert ces fichiers comme des images.
 */
import { family, FONTS, measure, wrap, wrapBalanced, checkGlyphs, subsetBase64, normalize } from './type.mjs';
import { r1 } from './rng.mjs';

export const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Attributs optionnels, sans les valeurs absentes. */
export const attrs = (o) =>
  Object.entries(o)
    .filter(([, v]) => v !== undefined && v !== null && v !== false)
    .map(([k, v]) => ` ${k}="${esc(v)}"`)
    .join('');

const BASE_CSS =
  'text{font-kerning:normal;text-rendering:geometricPrecision;white-space:pre}' +
  '@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}';

export class Doc {
  constructor({ w, h, title, desc = '', lang = 'fr' }) {
    Object.assign(this, { w, h, title, desc, lang });
    this.parts = [];
    this.defsParts = [];
    this.css = [];
    this.fontUse = new Map();
    this.n = 0;
  }

  /** Identifiant unique dans ce document. */
  uid(prefix = 'i') {
    this.n += 1;
    return `${prefix}${this.n}`;
  }

  defs(s) {
    this.defsParts.push(s);
    return this;
  }

  style(s) {
    this.css.push(s);
    return this;
  }

  add(...s) {
    this.parts.push(...s);
    return this;
  }

  /** Note les caractères écrits dans une police : ils formeront son sous-ensemble. */
  use(key, text) {
    checkGlyphs(key, text);
    if (!this.fontUse.has(key)) this.fontUse.set(key, new Set());
    const set = this.fontUse.get(key);
    for (const ch of text) set.add(ch);
  }

  /** Attributs de police d'une clé. */
  fontAttrs(key, size, tracking = 0) {
    const f = FONTS[key];
    return attrs({
      'font-family': `${family(key)},${f.fallback}`,
      'font-size': r1(size),
      'font-style': f.italic ? 'italic' : undefined,
      'letter-spacing': tracking ? `${tracking}em` : undefined,
    });
  }

  /** Signale un texte qui sortirait de la plaque (marge de 20 unités). */
  guard(s, x0, width) {
    if (x0 < 20 || x0 + width > this.w - 20) {
      const key = `${this.title}|${s}`;
      Doc.overflow ??= new Set();
      if (!Doc.overflow.has(key)) {
        Doc.overflow.add(key);
        console.warn(`⚠ débordement (${Math.round(x0)} → ${Math.round(x0 + width)} / ${this.w}) dans « ${this.title} » : ${s.slice(0, 70)}`);
      }
    }
  }

  /**
   * Une ligne de texte. Avec un interlettrage, l'ancrage est calculé ici :
   * les navigateurs comptent l'espace après la dernière lettre.
   */
  text(str, { f = 's4', size = 24, x = 0, y = 0, fill, anchor = 'start', tracking = 0, opacity, cls, extra = '', upper = false } = {}) {
    const s = normalize(upper ? str.toLocaleUpperCase('fr-FR') : str, f);
    this.use(f, s);
    let tx = x;
    let ta = anchor;
    const tw = measure(s, f, size, tracking);
    if (tracking && anchor !== 'start') {
      tx = anchor === 'middle' ? x - tw / 2 : x - tw;
      ta = 'start';
    }
    this.guard(s, ta === 'middle' ? tx - tw / 2 : ta === 'end' ? tx - tw : tx, tw);
    return `<text${attrs({ x: r1(tx), y: r1(y), fill, opacity, class: cls, 'text-anchor': ta !== 'start' ? ta : undefined })}${this.fontAttrs(f, size, tracking)}${extra}>${esc(s)}</text>`;
  }

  /** La plus grande taille (≤ `size`) à laquelle un texte tient dans `maxW`. */
  fit(str, f, size, maxW, tracking = 0, upper = false) {
    let s = size;
    while (s > 8 && this.width(str, f, s, tracking, upper) > maxW) s -= 1;
    return s;
  }

  /** Largeur d'un texte, pour placer ce qui le suit. */
  width(str, f, size, tracking = 0, upper = false) {
    return measure(upper ? str.toLocaleUpperCase('fr-FR') : str, f, size, tracking);
  }

  /**
   * Un paragraphe coupé à `width`. `y` est la ligne de base de la première
   * ligne ; renvoie aussi la ligne de base de la dernière (`last`) et la
   * hauteur occupée jusqu'à elle (`height`).
   */
  para(str, { f = 's4', size = 24, x = 0, y = 0, width = 600, lh = 1.5, fill, anchor = 'start', tracking = 0, balance = false, maxLines, opacity, cls, upper = false } = {}) {
    const s = normalize(upper ? str.toLocaleUpperCase('fr-FR') : str, f);
    let lines = (balance ? wrapBalanced : wrap)(s, f, size, width, tracking);
    if (maxLines && lines.length > maxLines) {
      console.warn(`⚠ paragraphe tronqué (${lines.length} > ${maxLines}) : ${s.slice(0, 60)}…`);
      lines = lines.slice(0, maxLines);
    }
    const step = lh > 4 ? lh : size * lh;
    this.use(f, lines.join(''));
    const spans = lines
      .map((line, i) => {
        let lx = x;
        const w = measure(line, f, size, tracking);
        if (anchor !== 'start') lx = anchor === 'middle' ? x - w / 2 : x - w;
        this.guard(line, lx, w);
        return `<tspan x="${r1(lx)}" y="${r1(y + i * step)}">${esc(line)}</tspan>`;
      })
      .join('');
    const svg = `<text${attrs({ fill, opacity, class: cls })}${this.fontAttrs(f, size, tracking)}>${spans}</text>`;
    return { svg, lines, step, last: y + (lines.length - 1) * step, height: (lines.length - 1) * step };
  }

  /**
   * Texte à plusieurs styles sur une seule ligne : des segments
   * `{ t, f, size, fill, tracking }` posés bout à bout à partir de `x`.
   */
  run(segments, { x = 0, y = 0, anchor = 'start', gap = 0 } = {}) {
    const widths = segments.map((s) => (s.w !== undefined ? s.w : measure(s.t, s.f, s.size, s.tracking || 0)));
    const total = widths.reduce((a, b) => a + b, 0) + gap * (segments.length - 1);
    let cx = anchor === 'middle' ? x - total / 2 : anchor === 'end' ? x - total : x;
    const out = [];
    segments.forEach((s, i) => {
      if (s.svg) out.push(s.svg(cx, y));
      else out.push(this.text(s.t, { f: s.f, size: s.size, x: cx, y, fill: s.fill, tracking: s.tracking || 0, opacity: s.opacity, cls: s.cls }));
      cx += widths[i] + gap;
    });
    return { svg: out.join(''), width: total };
  }

  /**
   * Paragraphe à plusieurs styles : des segments `{ t, f, fill }` coupés en
   * lignes ensemble (un mot surligné peut tomber n'importe où). `size` et
   * `lh` sont communs.
   */
  rich(segments, { x = 0, y = 0, width = 600, size = 22, lh = 1.5, anchor = 'start', cls } = {}) {
    // les mots, faits de « courses » de même style (« mois » surligné puis « . »)
    const words = [];
    let cur = null;
    let space = false;
    for (const seg of segments) {
      for (const ch of normalize(seg.t, seg.f)) {
        if (ch === ' ') {
          if (cur) words.push(cur);
          cur = null;
          space = true;
          continue;
        }
        if (!cur) {
          cur = { runs: [], space: words.length > 0 && space };
          space = false;
        }
        const last = cur.runs[cur.runs.length - 1];
        if (last && last.f === seg.f && last.fill === seg.fill) last.t += ch;
        else cur.runs.push({ t: ch, f: seg.f, fill: seg.fill });
      }
    }
    if (cur) words.push(cur);
    for (const wd of words) wd.w = wd.runs.reduce((a, r) => a + measure(r.t, r.f, size), 0);
    const spW = measure(' ', segments[0].f, size);
    const step = size * lh;
    const lines = [[]];
    let lineW = 0;
    for (const wd of words) {
      const line = lines[lines.length - 1];
      const add = (line.length ? spW : 0) + wd.w;
      if (line.length && lineW + add > width) {
        lines.push([wd]);
        lineW = wd.w;
      } else {
        line.push(wd);
        lineW += add;
      }
    }
    const out = lines.map((line, li) => {
      const lw = line.reduce((a, wd, i) => a + wd.w + (i ? spW : 0), 0);
      const lx = anchor === 'middle' ? x - lw / 2 : anchor === 'end' ? x - lw : x;
      this.guard(line.map((wd) => wd.runs.map((r) => r.t).join('')).join(' '), lx, lw);
      let first = true;
      return line
        .map((wd, i) =>
          wd.runs
            .map((r, k) => {
              const t = (i > 0 && k === 0 ? ' ' : '') + r.t;
              this.use(r.f, t);
              const pos = first ? ` x="${r1(lx)}" y="${r1(y + li * step)}"` : '';
              first = false;
              return `<tspan${pos}${attrs({ fill: r.fill })}${this.fontAttrs(r.f, size)}>${esc(t)}</tspan>`;
            })
            .join(''),
        )
        .join('');
    });
    return { svg: `<text${attrs({ class: cls })}>${out.join('')}</text>`, lines: lines.length, last: y + (lines.length - 1) * step };
  }

  async render() {
    let fontCss = '';
    for (const [key, set] of this.fontUse) {
      const b64 = await subsetBase64(key, [...set].join('') + ' ');
      fontCss += `@font-face{font-family:${family(key)};src:url(data:font/woff2;base64,${b64}) format('woff2');font-display:block}`;
    }
    return (
      `<svg xmlns="http://www.w3.org/2000/svg" width="${this.w}" height="${this.h}" viewBox="0 0 ${this.w} ${this.h}" role="img" aria-labelledby="t d" lang="${this.lang}">` +
      `<title id="t">${esc(this.title)}</title><desc id="d">${esc(this.desc)}</desc>` +
      `<style>${fontCss}${BASE_CSS}${this.css.join('')}</style>` +
      `<defs>${this.defsParts.join('')}</defs>` +
      this.parts.join('') +
      '</svg>'
    );
  }
}
