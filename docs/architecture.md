# Architecture

## Principes

- **100 % côté client** : React, TypeScript et Vite. Aucun backend n’est nécessaire en V1 ; le déploiement est statique (GitHub Pages ou équivalent).
- **Séparation stricte** entre interface, données et règles. Les composants React affichent et collectent ; ils appellent le domaine, le moteur de calcul et le stockage, sans contenir de règle métier.
- **Traçabilité** : chaque ligne de résultat porte l’identifiant de la règle appliquée, son statut et sa source.

## Couches

```
┌───────────────────────────── Interface (React) ─────────────────────────────┐
│ pages/  features/  components/                       app/router (hash)      │
└───────────────┬───────────────────────────────┬─────────────────────────────┘
                │                               │
        validation/ (Zod)               storage/ (localStorage)
                │
        domain/ (compositions, géométrie, fabrique de chiffrage)
                │
        calculation/ ─── moteur : entrée validée → CalculationResult
          ├── règles de débit (par système)          ← docs/calculation-rules.md
          ├── génération de la liste de débit
          └── traçabilité (ruleId, statut, source)
                │
        pricing/ (PriceBook)    data/ (catalogues sources)    imports/ (lecture de fichiers)
```

| Préoccupation | Module |
|---|---|
| Interface utilisateur | `src/pages`, `src/features`, `src/components` |
| Données tarifaires | `src/pricing` (vide tant qu’aucun tarif n’est importé) |
| Données produits | `src/data` |
| Règles de débit | `src/calculation` |
| Règles de validation | `src/validation` |
| Moteur de calcul | `src/calculation/engine.ts` |
| Génération du résultat | `src/calculation` → `CalculationResult` |
| Traçabilité des sources | `CuttingListItem.trace` (`ruleId`, `ruleStatus`, `referenceSource`, `priceSource`) |

## Flux d’un chiffrage

1. L’assistant (`QuoteWizardPage`) collecte les valeurs avec React Hook Form ; Zod les valide (`validation/quoteSchema.ts`).
2. `calculation/engine.ts` reçoit les valeurs validées et retourne un `CalculationResult` : liste de débit, totaux, alertes.
3. `domain/quoteFactory.ts` construit l’objet `Quote` ; `storage/quoteStorage.ts` l’enregistre dans le `localStorage`.
4. Le tableau de bord relit le stockage : ouvrir, dupliquer, supprimer.

## Extensibilité

- **Nouvelle composition** : ajouter une entrée dans `domain/compositions.ts`. Le formulaire, le schéma SVG et la validation lisent les indicateurs (`hasTransom`, `hasLeftSide`…) au lieu de tester le type.
- **Nouveau système ou nouvelles règles** : ajouter un module de règles dans `calculation/` et l’enregistrer dans le moteur, sans toucher à l’interface.
- **Tarifs** : charger un `PriceBook` depuis un import Excel ; chaque prix garde sa `PriceSource`.

## Routage

Routeur à base de hash (`#/chiffrage/…`), afin de fonctionner sur GitHub Pages sans configuration serveur.
