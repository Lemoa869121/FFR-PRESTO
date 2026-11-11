# Décisions techniques

## D-001 — Application 100 % côté client

Aucun backend en V1 : utilisateur unique, données locales, déploiement statique. Un backend ne serait justifié que pour le partage multi-postes ou une base tarifaire centrale.

## D-002 — Stack

React, TypeScript strict, Vite, React Hook Form, Zod, SheetJS, Vitest. Pas de framework CSS ni de bibliothèque de composants : une feuille de style unique avec variables CSS suffit, et évite des dépendances lourdes.

## D-003 — Routage par hash

`#/chiffrage/…` fonctionne sur GitHub Pages sans configuration serveur. Pas de dépendance de routage.

## D-004 — Stockage `localStorage`

Simple et suffisant pour un utilisateur unique. L’accès passe par `QuoteRepository`, qu’on pourra remplacer (IndexedDB, API) sans toucher à l’interface. Les données corrompues provoquent une erreur explicite.

## D-005 — Limites dimensionnelles configurables mais désactivées

Aucune limite Forster n’a été fournie. Le mécanisme existe (`src/validation/dimensionLimits.ts`) ; chaque limite est désactivée avec la mention « Règle métier à fournir ».

## D-006 — SheetJS depuis le CDN officiel

Le paquet `xlsx` publié sur npm est figé en 0.18.5 et comporte des vulnérabilités connues. La version maintenue est distribuée par `cdn.sheetjs.com` ; `package.json` y pointe directement.

## D-007 — Pas de lockfile au premier commit

L’environnement de développement initial n’avait pas accès au registre npm. La CI installe depuis `package.json` et publie le `package-lock.json` résolu en artefact, qui sera versionné dans une PR suivante.

## D-008 — Schéma SVG proportionnel

Le schéma respecte les proportions saisies et affiche les cotes principales, mais ce n’est pas un plan de fabrication. Géométrie calculée dans `domain/previewLayout.ts`, testée indépendamment du rendu.

## D-009 — Règles Presto dérivées des 32 positions du dossier

Le dossier forsterpro ne contient que des résultats. Sur demande explicite (11/11/2026), les règles sont déduites de ces résultats et **vérifiées sur les 32 positions, ligne par ligne**. Chaque règle a un identifiant et un statut (`dérivée` ou `à valider`) ; voir `docs/calculation-rules.md`.

## D-010 — Résultats extrapolés signalés, jamais présentés comme vérifiés

Hors des valeurs présentes dans le dossier (passage 1 073 ou 2 036, zone porte 2 170, imposte 330, parties latérales 963,5 ou 482), le calcul applique les mêmes règles mais affiche l'alerte « Résultat extrapolé, à valider ». Une configuration identique à une position du dossier affiche sa position de référence.

## D-011 — Données importées séparées des règles

`src/data/sources/ffr-presto/document.json` est généré depuis l'extraction texte versionnée et ne doit pas être modifié à la main : un test vérifie qu'une nouvelle analyse des pages redonne exactement le même JSON. Les règles (`src/calculation/presto/`) ne lisent que le catalogue (désignations, sources) : aucune nomenclature n'est recopiée du dossier.

## D-012 — Totaux en euros seulement si toutes les lignes ont un prix

Pas de somme partielle présentée comme un total : sans tarif complet, les totaux restent « Prix non disponible ». Le remplissage n'a pas de référence dans la source, donc pas de prix possible tant qu'il n'est pas défini.

## D-013 — Longueurs nettes, pas d'optimisation en barres

Le dossier donne les paramètres d'optimisation (barres de 6 000 mm, lame 4 mm, chute d'extrémité 60 mm, chute utilisable 600 mm) mais l'algorithme forsterpro n'est pas connu. La V1 restitue les longueurs nettes de coupe et la longueur cumulée ; le nombre de barres n'est pas calculé.

## D-014 — Vérification hors ligne

L'environnement de développement initial n'avait pas accès au registre npm. Les tests ont été exécutés localement avec Node `node:test` (via tsx) sur la même API que Vitest ; la CI GitHub exécute la chaîne complète (installation, ESLint, Vitest, `tsc -b`, build Vite).

## D-015 — Charte graphique Forster (identique à SERRURE_STD)

Remplace la consigne initiale « identité visuelle neutre, sans logo Forster tant qu’aucun fichier n’est fourni » : le logo officiel et la police Faktum ont été fournis (11/11/2026) et la charte validée le 10/11/2026 sur SERRURE_STD est appliquée (voir `docs/charte-graphique.md`). FFR-PRESTO reste sans Tailwind : les couleurs de la charte sont des variables CSS aux mêmes noms (`--fo-blue`, `--fo-blue2`, `--fo-ink`, `--fo-grey`). Licence web de Faktum à confirmer, le dépôt étant public.

## D-016 — Guide de mise en œuvre presto comme deuxième source

Le guide Forster presto 918301 (01/2021) ne contient pas de formules de débit mais des cotes de construction, des tables et des règles de pose. Il sert à **confirmer** des règles dérivées, qui deviennent « explicites » avec la page VP citée (P-VAN-01, P-ACC-04), à **ajouter** des contrôles explicites (P-CTL-01 à 04, P-CFG-03) et à **encadrer** les règles ambiguës (P-ACC-01). Une règle explicite du guide qui contredirait le dossier FFR Presto ne serait pas appliquée silencieusement : l'écart serait signalé. Aucun cas de ce type n'a été trouvé. Le PDF (141 Mo) n'est pas versionné ; il est identifié par son SHA-256.
