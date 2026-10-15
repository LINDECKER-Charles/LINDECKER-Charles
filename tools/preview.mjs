/**
 * Aperçu fidèle du README : le Markdown passe par l'API de rendu de GitHub
 * (même nettoyage que sur github.com, via `gh`), puis s'affiche avec la
 * feuille de style de GitHub, en thème sombre et clair, à la largeur du
 * profil et à celle d'un téléphone. Une capture pleine page par cas.
 *   node preview.mjs <dossier> [fr|en]
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const [outDir = 'preview', lang = 'fr'] = process.argv.slice(2);
fs.mkdirSync(outDir, { recursive: true });

const md = path.join(ROOT, lang === 'fr' ? 'README.fr.md' : 'README.md');
const html = execFileSync('gh', ['api', '-X', 'POST', '/markdown', '-f', 'mode=gfm', '-f', 'context=LINDECKER-Charles/LINDECKER-Charles', '-F', `text=@${md}`], { encoding: 'utf8', maxBuffer: 1 << 26 });
const css = (theme) => fs.readFileSync(path.join(ROOT, 'tools/node_modules/github-markdown-css', `github-markdown-${theme}.css`), 'utf8');

const browser = await chromium.launch();
for (const theme of ['dark', 'light']) {
  for (const [name, width, pad] of [['bureau', 846, 24], ['telephone', 390, 16]]) {
    const page = await browser.newPage({ viewport: { width: width + pad * 2, height: 900 }, deviceScaleFactor: 1 });
    const bg = theme === 'dark' ? '#0d1117' : '#ffffff';
    // une vraie page sur disque : une page en mémoire n'a pas le droit de lire file://
    const body = html.replaceAll('"./assets/', `"file://${ROOT}/assets/`);
    const doc = path.resolve(outDir, `${lang}-${theme}-${name}.html`);
    fs.writeFileSync(
      doc,
      `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><style>${css(theme)} body{margin:0;background:${bg}} .markdown-body{box-sizing:border-box;padding:${pad}px;max-width:${width + pad * 2}px} .markdown-body img{background-color:${bg}}</style></head><body><article class="markdown-body">${body}</article></body></html>`,
    );
    await page.goto(`file://${doc}`, { waitUntil: 'load' });
    await page.waitForTimeout(5000);
    const file = path.join(outDir, `${lang}-${theme}-${name}.png`);
    await page.screenshot({ path: file, fullPage: true });
    await page.close();
    console.log(file);
  }
}
await browser.close();
