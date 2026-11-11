# Format des imports

## Principes

1. Le fichier d’origine n’est **jamais modifié**. L’application lit une copie en mémoire ; les fichiers sources versionnés restent tels quels dans `data/sources/`.
2. Chaque donnée importée garde sa source : fichier, feuille ou page, ligne et, si possible, cellule.
3. Les données importées sont séparées des règles de calcul.

## Écran « Import des données » (V1)

Formats acceptés pour l’aperçu : `.xlsx`, `.xlsm`, `.xls`, `.xlsb`, `.ods`, `.csv`.

Fonctions disponibles :

- sélection du fichier, puis affichage de son nom, de son extension et de sa taille ;
- liste des feuilles avec leur nombre de lignes ;
- aperçu des 20 premières lignes ;
- choix de la ligne d’en-tête ;
- préparation d’une correspondance colonne → champ (`ImportMapping`), exportable en JSON.

**Aucune donnée n’est intégrée au moteur de calcul depuis cet écran**, et un message le rappelle à l’utilisateur.

### Champs cibles prévus

| Type de fichier | Champs |
|---|---|
| Prix | Référence, Désignation, Prix unitaire (€), Unité de prix, Date de validité |
| Références | Référence, Désignation, Catégorie, Unité, Longueur de barre (mm) |
| Liste de débit | Référence, Désignation, Quantité, Longueur (mm), Coupe, Orientation |
| CSV générique | Référence, Désignation, Quantité, Prix unitaire (€) |

## Dossier de fabrication forsterpro (PDF)

Premier fichier intégré : `data/sources/ffr-presto/` (voir son README pour l'empreinte SHA-256).

| Étape | Outil | Résultat |
|---|---|---|
| 1. Extraction texte page par page | `pdftotext -layout` (poppler) | `data/sources/ffr-presto/pages/pNNN.txt` (versionné) |
| 2. Analyse syntaxique | `src/imports/forsterpro/parseForsterpro.ts` | positions, éléments, lignes, plans de coupe, chutes, récapitulatif |
| 3. Catalogue | `src/imports/forsterpro/buildCatalogue.ts` | 23 références dédoublonnées, avec 1re occurrence |
| 4. Génération | `npm run extract:ffr` | `src/data/sources/ffr-presto/document.json` et `catalogue.json` |

Chaque ligne importée conserve : page PDF, page imprimée (≠ pour le débit optimisé : page PDF − 142), numéro de ligne, valeur brute (`qtyRaw`, `qtyExpressionRaw`, `lengthRaw`, `cutAnglesRaw`, `orientationRaw`, `descriptionRaw`) et valeur numérique.

Reconnaissance des lignes du bon d'atelier :

| Type | Exemple source |
|---|---|
| Profilé / parclose | `1 (1) Pce 32.800  Forster PRESTO  2.170,0  90° - 135°  D/1` |
| Remplissage | `1 (1) Pce  837  1.964  1,64 Sans vitrage, 9 mm  1` |
| Ferrure / accessoire | `3 (3) pce 907662  paumelle à souder` (description éventuellement sur 2 lignes) |
| Joint | `5,58 (5,58) m 905306  joint EPDM` |
| Champs multiples | `1 (1*2) Pce …` → total 2 |
| Délardage | `Max/Dim.: 1.113,0 mm` / `Longueur après délardage: 1.073,0 mm` |

Contrôles automatiques (`src/tests/forsterproImport.test.ts`, `forsterproRaw.test.ts`) : 0 ligne non reconnue, 1 484 lignes, totaux par référence, cohérence bon d'atelier ↔ débit optimisé, JSON versionné identique à une nouvelle analyse des pages.

## Procédure pour un nouveau fichier métier

1. Déposer le fichier tel quel dans `data/sources/<identifiant>/`.
2. Analyser sa structure : sections, colonnes, unités, règles explicites, ambiguïtés.
3. Écrire ou adapter le parseur dans `src/imports/`, avec des tests sur le fichier réel.
4. Générer le JSON importé, avec la source de chaque ligne, dans `src/data/sources/<identifiant>/`.
5. Documenter les règles dans `docs/calculation-rules.md`.
