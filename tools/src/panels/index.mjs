/** Le registre des visuels : nom → fonction (texte de la langue, variante) → SVG. */
import { hero } from './hero.mjs';
import { hunter } from './hunter.mjs';
import { rules } from './rules.mjs';
import { sky } from './sky.mjs';
import { flagship } from './flagship.mjs';
import { card, familySep } from './cards.mjs';
import { path } from './path.mjs';
import { arsenal } from './arsenal.mjs';
import { grimoire } from './grimoire.mjs';
import { end, footer } from './end.mjs';
import { note } from './note.mjs';

export const PROJECTS = ['pvz', 'omnicard', 'league', 'gup', 'githealth', 'karl', 'sillage', 'relais'];
export const FAMILIES = ['equipe', 'jeu', 'outils', 'ia'];

export const PANELS = {
  hero,
  hunter,
  rules,
  sky,
  flagship,
  path,
  arsenal,
  grimoire,
  end,
  footer,
  'note-releve': (t, v) => note(t, v, 'releve'),
  'note-credits': (t, v) => note(t, v, 'credits'),
  ...Object.fromEntries(PROJECTS.map((id) => [`card-${id}`, (t, v) => card(t, v, id)])),
  ...Object.fromEntries(FAMILIES.map((f) => [`sep-${f}`, (t, v) => familySep(t, v, f)])),
};
