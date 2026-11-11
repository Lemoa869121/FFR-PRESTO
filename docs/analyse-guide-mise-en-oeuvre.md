# Analyse du guide de mise en œuvre Forster presto

> Document : `918301_presto_verarbeitung_ordner.pdf`, article 918301, édition 01/2021, 926 pages A4, trilingue (allemand, français, anglais).
> SHA-256 : `5eb4ee69245076f013f6103f874db85ef433f0cae817c1e9384e173da663035e`
> Fourni le 11/11/2026. Analysé le 11/11/2026. Les pages sont citées par leur code imprimé « VP » et leur numéro de page PDF.

## 1. Ce que contient le guide

| Chapitre | Pages PDF | Contenu | Utile au calcul matière |
|---|---|---|---|
| 0 Répertoire des numéros | 3 à 8 | Index des références → pages | Recherche |
| 1 Informations générales | 9 à 45 | Système, acoustique, **directives de mise en œuvre** (coupe, tolérances, soudage) | Tolérances, lame de scie |
| 2 Attestations | 47 | Homologations | Non (V2 : feu, acoustique) |
| **3 presto 50 porte** | 49 à 507 | Système, **profilés (kg/m, barres)**, quincaillerie, **accessoires (unités de vente)**, coupes et **plans du système**, variantes, montage des serrures, mise en œuvre du vantail, vitrages | **Oui** |
| 4 presto 60S porte | 509 à 843 | Même structure, autre série | Non (série non utilisée dans le dossier FFR) |
| 5 presto 50 porte tôlée | 845 | — | Non |
| 6 presto 50 fenêtre | 847 à 924 | Fenêtres | Non (hors périmètre V1) |

Le guide est surtout composé de **dessins cotés** : coupes, plans, gabarits de perçage. Il ne contient **pas de formules de débit** de type « longueur = largeur − x » : le calcul forsterpro n'y est pas décrit. Il apporte en revanche des cotes de construction, des tables et des règles de pose qui confirment, complètent ou encadrent les règles déduites du dossier FFR Presto.

## 2. Confirmations des règles dérivées

| Règle | Ce que dit le guide | Effet |
|---|---|---|
| P-VAN-01 dimensions du vantail | Coupes B-B et C-C d'une porte 1 vantail (VP 3.5.32, 3.5.33) : recouvrement du dormant 36 mm et jeu de feuillure 4 mm en tête et en montants, jeu au sol « variable » | Devient **explicite** : vantail = passage − 2 × 40 ; hauteur = zone porte − 40 − jeu sous porte. Le dossier (993 × 2 120 avec un jeu de 10 mm) est retrouvé exactement |
| P-VAN-04 montant de battement | Cote de 34 mm au battement sur l'insertion des pièces de remplissage (VP 3.6.10) | Délardage « hauteur − 34 » confirmé |
| P-ACC-04 pièces d'étanchéité | « Dichtungsstück oben — DIN links 905703, DIN rechts 905702 » (VP 3.4.9) | Devient **explicite** (la quantité de 2 reste celle du dossier) |
| P-ACC-03 pièces de remplissage | Emplacements de 916320 et 916322 au battement et en pied (VP 3.6.10) | Emplacements confirmés ; quantités du dossier |
| Barres de 6 000 mm | Colonne « L [mm] » des tables de profilés (VP 3.2.1, 3.2.2, 3.2.4) | Explicite pour les 7 profilés |
| Matériau « Acier brut » et « presto XS 50 Standard Aluminium » | Profilés en acier brut ou ZM ; parcloses en aluminium (VP 3.1.1, 3.2.4) | Lève l'incohérence I5 de l'analyse du dossier : l'aluminium désigne les parcloses 901335 |

## 3. Règles nouvelles intégrées

| ID | Règle | Source | Intégration |
|---|---|---|---|
| P-CFG-03 | Jeu sous porte saisi (10 mm par défaut, valeur du dossier) | VP 3.5.32 | Nouveau champ « Jeu sous porte » ; une valeur ≠ 10 est signalée comme extrapolée pour les règles dérivées qui en dépendent |
| P-CTL-01 | Dormant et vantail ≥ 120 mm | VP 3.1.1 | Alerte bloquante |
| P-CTL-02 | Charges admissibles des paumelles 907662 (H 1 800 à 3 000 mm × B 600 à 1 400 mm) | VP 3.3.114 | Affiche la charge admissible du vantail (case inférieure la plus proche) ; alerte hors table |
| P-CTL-03 | Tolérances de coupe : dormant +1 / −0 mm, vantail +0 / −1 mm ; lame 4 à 6 mm | VP 1.3.3 | Commentaire sur chaque ligne de profilé |
| P-CTL-04 | Poids des profilés (kg/m) | VP 3.2.1, 3.2.2, 3.2.4 | Poids par ligne et poids total des profilés |
| — | Unités de vente (barre 6 m, rouleau 100 m, magasin 200, lots de 2, 4 ou 10) | VP 3.2.x, 3.3.114, 3.4.1 à 3.4.9 | Page « Règles de calcul » ; nécessaire pour chiffrer les quantités quand les tarifs seront fournis |

## 4. Règles encadrées sans être tranchées

| Règle | Guide | Conclusion |
|---|---|---|
| P-ACC-01 boutons de fixation 906579 | Au plus 70 mm des extrémités, entraxe au plus 300 mm, disposition en quinconce possible (VP 3.6.14) | Le minimum du guide (⌈(l − 140) / 300⌉ + 1) est respecté par toutes les quantités du dossier, mais forsterpro en pose davantage (ex. 3 au lieu de 2 sur 240 mm). La règle reste **à valider** ; un test vérifie qu'elle ne descend jamais sous le minimum du guide |
| P-ACC-02 douilles d'écoulement 900100 | Article décrit (VP 3.4.7), pas de règle de quantité pour la porte | Reste **à valider** |
| P-CFG-01 tirant ↔ DIN | Le guide emploie DIN gauche / droite (VP 3.6.10) sans parler de « tirant » | Reste **à valider** |
| Poids de la position | Le poids forsterpro « sans accessoires » dépasse celui des profilés calculé avec les kg/m du guide (Int 001 : 40,06 contre 38,62 kg). L'écart croît avec les longueurs de joints | Le poids des joints n'est pas dans le guide : seul le poids des profilés est affiché |

## 5. Écarts et points d'attention

| Constat | Détail |
|---|---|
| Désignation de 906579 | Dossier : « boutons autotaraudeurs » ; guide : « Bouton de fixation **autoforeur** pour parcloses, acier chromaté » (VP 3.4.7). L'autotaraudeur inox est 906583. La désignation du dossier est conservée telle quelle, l'écart est signalé ici |
| Paumelles 907662 | Vendues par lot de 2 (VP 3.3.114) alors que le dossier compte 3 pièces par vantail : à prendre en compte pour le prix |
| Poids du vantail | Le dossier indique 62,8 kg pour un vantail « sans vitrage, 9 mm » ; ce poids inclut manifestement un remplissage. Il ne peut pas être recalculé sans définition du remplissage |
| Taille du PDF | 141 Mo : au-dessus de la limite de 100 Mo par fichier de GitHub, il n'est pas versionné (empreinte et références de pages seulement) |

## 6. Non intégré, et pourquoi

| Sujet | Pages | Raison |
|---|---|---|
| Châssis fixe seul | VP 3.5.30, 3.5.41 (plan 13 : dormant 32.851, meneaux et traverses 32.852, parclose 901246) | Les plans donnent les profilés et les cotes de vision (50 mm) mais aucune longueur de coupe. Un export forsterpro de quelques châssis fixes permettrait de dériver et de vérifier les règles comme pour les portes |
| Vitrages et parcloses selon l'épaisseur de verre | VP 3.2.4, 3.8.22 à 3.8.67 | Le choix de la parclose dépend du vitrage, qui n'est pas encore défini (le dossier n'a que « Sans vitrage, 9 mm » avec 901335) |
| Serrures, gâches, crémones, ferme-portes, anti-panique | VP 3.3, 3.7 (débits de tringles, ex. « L = A − 164 ») | Le dossier utilise des kits FFR (FFR019FND, FFR042FND, FFR049FND…) absents du guide ; à intégrer avec le catalogue des options |
| Joints de seuil, brosses | VP 3.8.4 à 3.8.21 | Options non présentes dans le dossier |
| presto 60S, porte tôlée, fenêtres | Chapitres 4 à 6 | Hors périmètre V1 |
| Performances feu, acoustique | Chapitres 1.2, 2 | V2 |
