# Feuille de route

## V1 — chiffrage matériel

| Étape | Contenu | Statut |
|---|---|---|
| 1 | Interface fonctionnelle : tableau de bord, assistant en 5 étapes, schéma SVG, stockage local, liste de débit (structure), import (aperçu) | ✅ livrée (PR « initial interface ») |
| 2 | Intégration du dossier de fabrication forsterpro « FFR Presto » : données sources tracées, 30 règles Presto dérivées et vérifiées sur 32 positions, moteur, tests | ✅ livrée (PR « forsterpro rules ») |
| 2 ter | Guide de mise en œuvre presto 918301 : confirmations, contrôles explicites, poids, unités de vente | ✅ livrée (PR « guide de mise en œuvre ») |
| 2 bis | Validation Forster des règles « à valider » (P-ACC-01 boutons, P-ACC-02 douilles, P-CFG-01 tirant ↔ DIN) et des extrapolations | en attente de Forster |
| 3 | Import des tarifs Excel → `PriceBook` tracé, totaux en euros | en attente des fichiers tarifaires |
| 4 | Catalogue réel des options (vitrages, finitions, serrures…) | en attente des données |
| 5 | Châssis fixe seul, composition personnalisée | en attente des règles (fichier forsterpro avec ces compositions) |
| 5 bis | Optimisation des barres (6 000 mm) | à cadrer (D-013) |
| 6 | Limites dimensionnelles | en attente des règles |

## V2

- Performances feu, acoustiques et thermiques.
- Éventuellement : main-d’œuvre, remises, marges, multi-utilisateurs, à cadrer.

## Consolidation

Le dépôt `Forster-Calc` est réservé à la documentation globale, à l’intégration ou à une version consolidée. Il n’est pas modifié à ce stade.
