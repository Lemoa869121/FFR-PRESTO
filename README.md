# ForsterCalc — FFR-PRESTO

**Chiffrage automatique de portes et châssis Forster** — application interne, côté client, qui automatise le chiffrage **matériel** des portes et châssis fixes Forster Presto.

> ⚠️ **Statut des données** : aucun prix réel n’est intégré. Les règles de débit Presto sont **dérivées** du dossier de fabrication forsterpro « FFR Presto » et vérifiées sur ses 32 positions ([`docs/calculation-rules.md`](docs/calculation-rules.md)). Les listes d’options marquées « Donnée de démonstration » sont fictives et ne sont pas utilisées par le calcul.

L’interface suit la **charte graphique Forster**, identique à celle de SERRURE_STD : couleurs, police Faktum, logo officiel ([`docs/charte-graphique.md`](docs/charte-graphique.md)).

## Objectif

Remplacer le chiffrage manuel par une application qui, à partir d’une composition et de ses dimensions, produit :

- la liste de débit matière (profilés, joints, vitrage, quincaillerie, accessoires) ;
- le détail du chiffrage matériel ;
- la traçabilité de chaque ligne jusqu’à sa source (fichier, feuille ou page, ligne, référence, règle appliquée).

## Périmètre de la V1

- Portes simples et doubles, châssis fixes, impostes, parties latérales, compositions combinées.
- Calcul **matériel uniquement**.
- Un seul utilisateur, sans authentification. Données conservées dans le `localStorage` du navigateur.

### Exclu de la V1

Main-d’œuvre de fabrication, main-d’œuvre de pose, performances feu, acoustiques et thermiques (prévues en V2), remises commerciales, marges commerciales, gestion multi-utilisateurs.

## Installation locale

Prérequis : Node.js 20 ou plus récent (22 recommandé).

```bash
git clone https://github.com/Lemoa869121/FFR-PRESTO.git
cd FFR-PRESTO
npm install
npm run dev
```

L’application est ensuite accessible sur l’adresse affichée par Vite (par défaut `http://localhost:5173`).

## Commandes disponibles

| Commande | Rôle |
|---|---|
| `npm run dev` | Serveur de développement |
| `npm run build` | Vérification TypeScript puis build de production dans `dist/` |
| `npm run preview` | Sert le build de production localement |
| `npm run lint` | ESLint |
| `npm run typecheck` | Vérification TypeScript seule |
| `npm test` | Tests unitaires (Vitest) |
| `npm run extract:ffr` | Régénère les données importées du dossier forsterpro depuis `data/sources/ffr-presto/pages` |

## Structure du projet

```
src/
  app/          Application shell et routeur (hash, compatible GitHub Pages)
  pages/        Écrans : tableau de bord, assistant de chiffrage, liste de débit, import
  features/     Blocs fonctionnels (récapitulatif du chiffrage)
  components/   Composants d’affichage réutilisables (schéma SVG, tableaux, alertes)
  domain/       Compositions, géométrie du schéma, fabrique de chiffrages
  calculation/  Moteur de calcul ; presto/ = règles Forster Presto (aucune règle dans les composants React)
  pricing/      Sources de prix (vide : aucun prix fourni)
  imports/      Lecture de fichiers : aperçu Excel / CSV (SheetJS), parseur forsterpro
  storage/      Persistance locale (localStorage)
  validation/   Schémas Zod et limites dimensionnelles configurables
  types/        Types TypeScript du domaine
  utils/        Formatage français (mm, m, €, dates)
  data/         Données importées (sources/ffr-presto) et listes provisoires identifiées
  tests/        Tests unitaires
docs/           Architecture, modèle de données, règles de calcul, import, analyse du dossier, feuille de route, décisions
data/sources/   Fichiers sources versionnés tels quels (PDF forsterpro + extraction texte)
scripts/        Outils de développement (extraction forsterpro)
```

## Déploiement

Le workflow GitHub Actions `.github/workflows/ci.yml` exécute le lint, les tests et le build à chaque pull request. Sur la branche `main`, il publie `dist/` sur **GitHub Pages**. Il faut activer Pages une fois dans *Settings → Pages → Source : GitHub Actions*.

Le chemin de base est `/FFR-PRESTO/` sur GitHub Actions et `/` en local ; la variable `BASE_PATH` permet de le surcharger pour une autre plateforme statique (Netlify, serveur interne…).

## Statut des données fictives

| Donnée | Statut |
|---|---|
| Prix | **Aucun** : affichage « Prix non disponible » |
| Listes d’options (système, vitrage, finition…) | **Donnée de démonstration** |
| Limites dimensionnelles | **Règle métier à fournir** : contrôle désactivé |
| Système | Forster Presto — presto XS 50 Standard Aluminium (source : dossier FFR Presto) |
| Références produits | 23 références lues dans le dossier, avec page et ligne |
| Règles de débit | 36 règles : dérivées des 32 positions du dossier, confirmées ou complétées par le guide de mise en œuvre presto (pages VP citées) ; 3 « à valider » ([`docs/calculation-rules.md`](docs/calculation-rules.md)) |
| Guide de mise en œuvre presto 918301 | Cotes du vantail, contrôles (120 mm, charges des paumelles), tolérances, poids et unités de vente ([`docs/analyse-guide-mise-en-oeuvre.md`](docs/analyse-guide-mise-en-oeuvre.md)) |
| Hors dimensions du dossier | Calcul extrapolé, signalé « à valider » |
| Châssis fixe seul, composition personnalisée | **Règle métier à fournir** |

## Procédure pour fournir la liste de débit

1. Transmettre le fichier source (export forsterpro PDF, Excel ou CSV) sans le modifier.
2. Le fichier est versionné dans `data/sources/<nom>/` et n’est jamais modifié par l’application.
3. Analyse préalable : structure, colonnes, règles explicites, ambiguïtés, modèle de données (voir [`docs/import-format.md`](docs/import-format.md)).
4. Les règles sont intégrées dans `src/calculation/` avec des tests construits sur les cas réels du document.
5. Chaque ligne calculée conserve sa source : fichier, page ou feuille, ligne ou cellule, référence, règle appliquée.
