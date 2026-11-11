# Contribuer à FFR-PRESTO

## Branches et pull requests

- `main` est protégée par convention : aucun push direct, tout passe par une pull request.
- Une branche par sujet : `feature/…`, `fix/…`, `docs/…`.
- Commits petits et explicites, au format [Conventional Commits](https://www.conventionalcommits.org/) : `feat:`, `fix:`, `test:`, `docs:`, `chore:`, `refactor:`.
- La CI (lint, tests, build) doit être verte avant fusion.

## Règles de code

1. TypeScript strict, aucun `any` sans justification écrite en commentaire.
2. **Aucune règle métier dans les composants React** : elles vont dans `src/calculation/`, `src/domain/` ou `src/validation/`.
3. Composants courts, réutilisables, accessibles : libellés associés, navigation clavier, contrastes suffisants.
4. Interface en français ; code, noms de variables et commentaires techniques en anglais.
5. Affichage français : millimètres, mètres pour les longueurs cumulées, euros, virgule décimale.
6. Gestion explicite des erreurs : message compréhensible pour l’utilisateur, jamais d’échec silencieux.

## Données métier : règles impératives

Ne **jamais** inventer une référence produit, une formule de débit, une règle technique, un prix, une quantité, une compatibilité, une limite dimensionnelle ou une performance.

- Toute donnée provisoire porte une mention visible : « Donnée de démonstration », « Valeur provisoire », « Règle métier à fournir », « Prix fictif, ne pas utiliser ».
- Les fichiers sources sont conservés tels quels dans `data/sources/` et ne sont jamais modifiés.
- Chaque règle de calcul a un identifiant, un statut (`explicite`, `derivee`, `a_valider`, `manquante`), et des sources citées dans `docs/calculation-rules.md`.
- Toute nouvelle règle est accompagnée de tests construits sur des cas réels vérifiables.

## Vérifications avant pull request

```bash
npm run lint
npm test
npm run build
```
