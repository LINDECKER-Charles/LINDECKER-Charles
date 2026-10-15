# Forge des visuels du profil

Le README du profil est fait d'images : des SVG autonomes, animés, générés ici à partir d'un seul
fichier de contenu. Le thème reprend l'univers de **Bloodborne Legendary Run** : sa palette (nuit,
os, braise, laiton, sang), ses polices (Shippori Mincho B1 pour les titres, Spectral pour le
texte), ses ornements (arcature et grille d'Oedon, cierges de l'autel) et ses constellations en
arbre.

## Construire

Node 22 ou plus récent.

```bash
cd tools
npm ci
npm run build          # assets/fr, assets/en, README.md et README.fr.md
```

| Commande | Rôle |
|---|---|
| `npm run build` | régénère tous les visuels (bureau et téléphone, français et anglais), les boutons et les deux README |
| `node build.mjs --only hero,sky` | ne régénère que certains panneaux (les README ne sont pas réécrits) |
| `node dev.mjs <panneau> [desktop\|mobile] [fr\|en]` | génère un seul panneau et en prend un instantané PNG (dossier `out/`, ou `FORGE_OUT`) |
| `node preview.mjs <dossier> [fr\|en]` | aperçu fidèle du README : rendu par l'API Markdown de GitHub (`gh` connecté), feuille de style de GitHub, thèmes sombre et clair, largeur du profil et d'un téléphone |

Le build signale tout texte qui sortirait de sa plaque (`⚠ débordement`) et tout caractère absent
des polices (`⚠ glyphe absent`).

## Modifier le contenu

Tout le texte, en français et en anglais, est dans [`src/content.mjs`](src/content.mjs) : identité,
règles, projets et chiffres, parcours, compétences, formation, liens. Les README sont réécrits
par le build : les modifier à la main serait perdu au prochain passage.

- **Un chiffre garde sa source et sa date** : la ligne des relevés (`releve`) suit les cartes.
- **Aucun dépôt privé n'est nommé ni lié** : Bloodborne Legendary Run, Karl Scraper, Sillage et
  Relais sont présentés sans lien vers leur code.
- **Portfolio V2** : tant que `PORTFOLIO_V2_ONLINE` vaut `false`, les cartes des projets privés
  mènent à l'accueil du portfolio ; à la mise en ligne de la V2, passer le drapeau à `true` pour
  qu'elles mènent à leur page `/projets/<projet>`.

## Comment c'est fait

- `src/core/` : le document SVG (`doc.mjs`), la typographie (`type.mjs` : mesure avec opentype.js,
  coupure des lignes, sous-ensembles WOFF2 embarqués), les images embarquées (`images.mjs`, WebP
  via sharp), les instantanés (`snap.mjs`, Playwright).
- `src/art/` : le ciel (étoiles, lune, nuages, brume, grain), la ville générée (`skyline.mjs` :
  flèches, pinacles, cathédrale, tour de l'horloge), les constellations, la lanterne, les ornements,
  les pictogrammes et les logos.
- `src/panels/` : un fichier par panneau du README.

Une image SVG affichée par GitHub ne charge aucune ressource externe : polices et captures sont
donc embarquées dans chaque fichier (sous-ensembles et WebP réduits à la taille d'affichage). Les
animations sont en CSS interne ; elles s'arrêtent avec `prefers-reduced-motion`, et chaque image
est complète sans elles.

## Provenance des images

| Fichier | Origine |
|---|---|
| `sources/portrait.webp` | photo de Charles Lindecker (séance du portfolio), détourée, recadrée sur le buste ; l'étalonnage au clair de lune est un filtre SVG appliqué à l'affichage |
| `sources/blr/*.webp` | vraies captures de Bloodborne Legendary Run (ciel, constellation, guide), prises pour le portfolio, avec un compte et une progression de démonstration ; posées sans retouche |
| `sources/blr/logo.webp` | l'icône de l'application Bloodborne Legendary Run |
| `sources/projets/*.webp` | captures des projets prises pour le portfolio, sur des données de démonstration (League Of Data Base : site public) ; `pvz.webp` est l'illustration « gravure » de la page PvZ Fusion du portfolio |

Les ornements (arcature, grille d'Oedon, cierges, fronton) sont recopiés du design system de
Bloodborne Legendary Run ; les pictogrammes des trois verbes, du portfolio. Logos techniques :
[Simple Icons](https://simpleicons.org) (CC0). Polices : Shippori Mincho B1 et Spectral,
[SIL Open Font License](https://openfontlicense.org), via Fontsource.

Bloodborne © Sony Interactive Entertainment / FromSoftware. Projet de fan, sans affiliation.
