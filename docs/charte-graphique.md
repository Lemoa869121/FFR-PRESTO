# Charte graphique Forster

Référence commune à toutes les applications du projet ACCUEIL FORSTER, validée le 10/11/2026 (maquette Serrure STD). Source : RG Master Brandbook (Figma), logo et polices fournis par Forster.

FFR-PRESTO reprend **la même direction artistique que SERRURE_STD** (commit `225a3d6`).

## Couleurs

| Nom | HEX | Usage | Variable CSS (FFR-PRESTO) |
|---|---|---|---|
| Main blue (PMS 654) | `#003C75` | Logo, en-tête, bandeaux de titre, pastilles « Calculé » | `--fo-blue` |
| Secondary blue | `#0F4196` | Liens, boutons principaux, focus, **références et données techniques**, cotes | `--fo-blue2` |
| Text blue | `#051939` | Tout le texte (jamais de noir pur) | `--fo-ink` |
| Grey | `#DDE2E9` | Fonds, panneaux, séparateurs, bordures | `--fo-grey` |
| White | `#FFFFFF` | Fond principal, texte sur fond bleu | `--fo-white` |

Seule exception hors charte : **orange pour les alertes** (teintes `orange-50` / `200` / `800` de SERRURE_STD : `#FFF7ED`, `#FED7AA`, `#9A3412`), utilisé pour « Attention », « Bloquant », « À compléter », « Donnée de démonstration ».

Textes secondaires : Text blue avec transparence (`--fo-ink-70`, `--fo-ink-55`), jamais de gris neutre. Pour les petits textes, FFR-PRESTO utilise 70 % : à 55 %, le contraste sur blanc (≈ 4 : 1) est sous le seuil d’accessibilité de 4,5 : 1.

## Typographie : Faktum (René Bieder)

| Graisse | Usage |
|---|---|
| SemiBold (600) | Titres de page, grands titres |
| Medium (500) | Sous-titres, bandeaux, libellés, noms de produits, boutons |
| Regular (400) | Texte courant |

Fichiers : `src/assets/fonts/Faktum-{Regular,Medium,SemiBold}.woff`, identiques à ceux de SERRURE_STD (convertis depuis les OTF fournis). Ils sont placés dans `src/assets` pour que Vite ajuste leur chemin au sous-dossier GitHub Pages (`/FFR-PRESTO/`).

⚠️ Le dépôt est public : les fichiers de police y sont téléchargeables. Décision Forster du 10/11/2026 : utiliser Faktum. **Vérifier que la licence couvre l’usage web.**

## Logo

- Officiel : `L_Forster_rgb.svg` (bleu `#003C75`) → `public/logo-forster.svg` (identique octet pour octet au fichier fourni).
- Sur fond bleu : `public/logo-forster-blanc.svg` (seule la couleur change).
- Ne pas déformer, recadrer ni recolorer autrement. Le favicon n’utilise pas le logo (simple pictogramme bleu).

## Mise en page

- En-tête bleu principal, logo blanc à gauche, filet blanc, nom de l’appli « ForsterCalc » ; navigation en pastilles (onglet actif blanc).
- Fond blanc ; cartes blanches à bordure grise et coins arrondis (12 px) ; champs et boutons arrondis (8 px).
- Bandeaux de section : fond bleu principal, texte blanc (cartes du récapitulatif, étapes de l’assistant, titres des tableaux).
- Boutons principaux en bleu secondaire, survol en bleu principal.
- Pied de page : logo bleu et « Steel is our nature. ».
