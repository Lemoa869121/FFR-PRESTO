# Modèle de données

Les types sont définis dans [`src/types/index.ts`](../src/types/index.ts).

## Chiffrage

| Type | Rôle | Champs principaux |
|---|---|---|
| `Quote` | Un chiffrage enregistré | `id`, `project`, `composition`, `dimensions`, `options`, `status`, `createdAt`, `updatedAt`, `totalPrice` (null sans tarif) |
| `Project` | Informations générales | `name`, `quoteReference`, `clientName?`, `description?`, `createdOn`, `quantity` |
| `Composition` | Type et éléments | `type: CompositionType`, `leafCount: 1 \| 2`, `elements: Element[]` |
| `Element` | Élément physique | `kind` (`dormant`, `porte`, `fixe_lateral`, `imposte`), `column`, `row`, `widthMm`, `heightMm` |
| `Dimensions` | Cotes en mm | `totalWidth`, `totalHeight`, `mainLeafWidth?`, `secondaryLeafWidth?`, `transomHeight?`, `leftSideWidth?`, `rightSideWidth?` |
| `TechnicalOptions` | Options techniques | système, sens et côté d’ouverture, tirant, vitrage, remplissage, finition, couleur, serrure, poignée, ferme-porte, anti-panique, autres |

Statuts d’un chiffrage : `brouillon`, `a_completer` (données métier manquantes), `calcule`.

## Résultat

| Type | Rôle |
|---|---|
| `CalculationResult` | `status`, `cuttingList`, `totals`, `warnings`, `referencePositionId?` |
| `CuttingListItem` | Une ligne de débit : référence, désignation, catégorie, longueur unitaire, quantité, longueur totale, prix unitaire et total (null si inconnus), source, commentaire, `trace` |
| `CalculationTotals` | Profilés, vitrage ou remplissage, quincaillerie, accessoires, autres, total matériel, total pour la quantité (null tant qu’aucun prix n’est disponible) |
| `ValidationWarning` | `code`, `level` (`info`, `attention`, `bloquant`), `message`, `field?` |

## Traçabilité

| Type | Rôle |
|---|---|
| `SourceLocation` | `documentId`, `section`, `pdfPage?`, `printedPage?`, `line?`, `sheet?`, `cell?` |
| `PriceSource` | `fileName`, `sheet?`, `cell?`, `row?`, `importedAt` |
| `RuleStatus` | `explicite` (lu dans la source), `derivee` (déduite des cas réels et vérifiée sur tous), `a_valider`, `manquante`, `demonstration` |

Chaque `CuttingListItem.trace` contient : `ruleId`, `ruleStatus`, `referenceSource` (où la référence produit a été lue), `priceSource` (null sans tarif).

## Catalogue et import

| Type | Rôle |
|---|---|
| `MaterialItem` | Référence produit : `reference`, `designation`, `category`, `unit` |
| `MaterialCategory` | `profiles`, `renforts`, `joints`, `vitrage`, `panneaux`, `quincaillerie`, `accessoires`, `consommables` |
| `ImportMapping` | Correspondance entre colonnes d’un fichier importé et champs cibles : `sourceFile`, `sheet`, `headerRow`, `columns[]` |

## Stockage local

Clé `forstercalc.quotes.v1` du `localStorage`, contenant un tableau JSON de `Quote`. Une donnée illisible déclenche une `StorageError` affichée à l’utilisateur ; elle n’est jamais écrasée silencieusement.
