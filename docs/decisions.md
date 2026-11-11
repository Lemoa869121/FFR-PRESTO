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
