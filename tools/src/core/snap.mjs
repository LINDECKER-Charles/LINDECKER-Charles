/**
 * Instantanés de contrôle : chaque SVG est ouvert comme une image (balise
 * `<img>`, comme GitHub l'affiche) puis photographié, après un délai qui
 * laisse jouer les animations d'entrée.
 */
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

let browser;

export async function snap(svgFile, pngFile, { width, wait = 4000, dpr = 1, bg = '#0d1117' } = {}) {
  browser ??= await chromium.launch();
  const svg = fs.readFileSync(svgFile, 'utf8');
  const m = svg.match(/viewBox="0 0 (\d+(?:\.\d+)?) (\d+(?:\.\d+)?)"/);
  const vw = Number(m[1]);
  const vh = Number(m[2]);
  const w = width ?? vw;
  const h = Math.round((vh * w) / vw);
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: dpr });
  const b64 = Buffer.from(svg).toString('base64');
  await page.setContent(`<!doctype html><html><body style="margin:0;background:${bg}"><img style="display:block;width:${w}px" src="data:image/svg+xml;base64,${b64}"></body></html>`);
  await page.waitForTimeout(wait);
  fs.mkdirSync(path.dirname(pngFile), { recursive: true });
  await page.screenshot({ path: pngFile });
  await page.close();
}

export async function closeSnap() {
  await browser?.close();
  browser = undefined;
}
