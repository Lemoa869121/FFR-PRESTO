# Analyse du dossier de fabrication « FFR Presto »

> Statut : analyse préalable, présentée le 11/11/2026 avant intégration. Décisions du demandeur ci-dessous ; règles résultantes dans [`calculation-rules.md`](calculation-rules.md).
> Document analysé : `FFR_Dossier_de_fabrication-FFR_PRESTO.pdf` (175 pages A4)
> Analyse réalisée le 11/11/2026. Toutes les valeurs citées sont reprises telles quelles du PDF, avec leur page et leur ligne (ligne = numéro de ligne dans l'extraction texte de la page, `pdftotext -layout`).

---

## Décisions du demandeur (11/11/2026)

| Question | Décision |
|---|---|
| Q1 — Mode de calcul V1 | Définir les règles de calcul à partir des dimensions et positions disponibles → règles dérivées, vérifiées sur les 32 positions |
| Q2 — Avertissement « recalculer la nomenclature » | Les quantités sont fiables |
| Q3 — Confidentialité (dépôt public) | Autorisé : PDF, références extraites et nom de l'éditeur versionnés |
| Q4 — Type « imposte + une seule partie latérale » | Ajouté (gauche et droite) |
| Q4 bis — Châssis fixe seul | Sans données pour l'instant, ajouté plus tard |
| Q5 — Intérieur / extérieur | Le choix d'ouverture sélectionne la variante Int ou Ext ; l'échange 32.803 ↔ 32.805 est une règle |

---

## 0. Nature du document (constat principal)

Le document est une **sortie du logiciel forsterpro** (générateur « combit List & Label 28.2 »), affaire « FFR Presto », éditée le 11/11/2026 à 14:25. Ce n'est **pas un fichier de règles** : c'est le **résultat** d'un calcul effectué par forsterpro pour **32 positions concrètes** de dimensions fixes.

Conséquences :

- Le document fournit des **cas réels vérifiables** (entrée : configuration et dimensions ; sortie : nomenclature et débit). C'est une base de tests et un catalogue de configurations de référence.
- Il ne contient **aucune formule de débit**. Les relations entre les dimensions et les longueurs de coupe ne sont pas écrites ; elles ne peuvent qu'être *observées* sur les exemples, ce qui ne suffit pas à en faire des règles (voir §5).
- Il ne contient **aucun prix**.

L'extraction automatique a été contrôlée : **32 positions, 1 484 lignes de nomenclature, 0 ligne non reconnue**. Les débits optimisés **concordent à 100 %** avec les nomenclatures (même nombre de coupes et même longueur cumulée pour les 7 références débitées, voir §7).

---

## 1. Feuilles et sections trouvées

Le PDF contient deux parties, chacune avec sa propre pagination imprimée.

| Partie | Pages PDF | Pages imprimées | Contenu |
|---|---|---|---|
| **Bon d'atelier** | 1 à 142 | 1 à 142 | 32 positions, chacune avec un croquis coté (image) et une nomenclature par élément |
| **Débit optimisé** | 143 à 175 | 1 à 33 | Chutes restantes (p. 143), plans de coupe par barre pour 7 références (p. 144 à 174), récapitulatif (p. 175) |

⚠️ La page imprimée du débit optimisé vaut *page PDF − 142*. La traçabilité stockera les deux numéros.

### 1.1 Positions (Bon d'atelier)

Toutes les positions ont : Quantité 1 Pce · Série « forster presto/presto XS 50 Standard Aluminium » · Joint extérieur 2 mm · Drainage visible · Matériau « Acier brut » · Raccord au sol « Plinthe d'onglet 1060.2 » · Jeu de porte 10 mm · Hauteur de poignée 1 050 mm · vantaux de 993 × 2 120 mm.

| Config. | Int (p.) | Ext (p.) | Taille (affichée) | Éléments (libellés source) | Composition ForsterCalc correspondante |
|---|---|---|---|---|---|
| 001 | 1 | 72 | 1.073 x 2.170 | Porte 1 vantail DIN L | Porte simple |
| 002 | 4 | 75 | 1.073 x 2.500 | Porte 1 vantail DIN L + fixe (imposte) | Porte avec imposte |
| 003 | 8 | 79 | 2.037 x 2.170 | Porte 1 vantail DIN L + fixe à droite | Porte + partie latérale droite |
| 003b | 12 | 83 | 2.037 x 2.170 | Fixe à gauche + porte 1 vantail DIN R | Porte + partie latérale gauche |
| 004 | 16 | 87 | 2.037 x 2.500 | Porte 1 vtl DIN L + 3 fixes (latéral droit + 2 impostes) | Imposte + partie latérale droite |
| 004b | 21 | 92 | 2.037 x 2.500 | 3 fixes + porte 1 vtl DIN R | Imposte + partie latérale gauche |
| 005 | 26 | 97 | 3.000 x 2.170 | Fixes 1,3 (×2) + porte 1 vtl DIN L au centre | Porte + deux parties latérales |
| 006 | 30 | 101 | 3.000 x 2.500 | Fixes 1,3 + porte 1 vtl + fixes 4,5 + fixe 6 | Porte avec imposte et parties latérales |
| 007 | 35 | 106 | 2.036 x 2.170 | Porte 2 vantaux DIN L | Porte double |
| 008 | 38 | 109 | 2.036 x 2.500 | Porte 2 vantaux + fixe (imposte) | Porte double avec imposte |
| 009 | 42 | 113 | 2.518 x 2.170 | Porte 2 vantaux DIN L + fixe à droite | Porte double + latérale droite |
| 009b | 46 | 117 | 2.518 x 2.170 | Fixe à gauche + porte 2 vantaux DIN R | Porte double + latérale gauche |
| 010 | 50 | 121 | 2.518 x 2.500 | Porte 2 vtx DIN L + 3 fixes | Porte double, imposte + latérale droite |
| 010b | 55 | 126 | 2.518 x 2.500 | 3 fixes + porte 2 vtx DIN R | Porte double, imposte + latérale gauche |
| 011 | 61 | 132 | 3.000 x 2.170 | Fixes 1,3 + porte 2 vantaux | Porte double + deux latérales |
| 012 | 66 | 137 | 3.000 x 2.500 | Fixes 1,3 + porte 2 vtx + fixes 4,5 + fixe 6 | Porte double, imposte et deux latérales |

« Int » = porte ouvrant vers l'intérieur (« Porte 1 vantail intérieur ») ; « Ext » = ouvrant vers l'extérieur (« Porte 1 vtl extérieur »). La colonne « Composition » est ma correspondance proposée avec les types de l'application ; **elle est à valider**.

**Compositions V1 non couvertes par le document** : châssis fixe seul, composition personnalisée, porte simple ou double DIN R sans partie latérale, toute largeur de vantail autre que 993 mm, toute hauteur autre que 2 170 / 2 500 mm.

### 1.2 Structure d'une position

```
Position ─┬─ En-tête (quantité, série, taille, drainage, matériau, poids, avertissement)
          ├─ Élément 0 « Dormant »  → Profilés, Joints, Accessoires
          ├─ Élément n « Porte … »  → Vantail(aux), Profilés, parcloses, Vitrage, Ferrure, Joints, Accessoires
          └─ Élément n « Volume fixe Vitré de l'intérieur » → parcloses, Vitrage, Joints, Accessoires
```

Un élément peut regrouper plusieurs champs identiques : « 1,3: Volume fixeVitré de l'intérieur (Données par champ, 2 Totalité des champs) » (p. 27, l. 29). Les quantités y sont écrites sous la forme `1 (1*2)`.

Les tableaux sont coupés par les sauts de page (« Suite de la position … ») ; l'extraction les recolle.

---

## 2. Signification probable des colonnes

### 2.1 Bon d'atelier

| Colonne source | Exemple (Int 001) | Signification probable | Certitude |
|---|---|---|---|
| Croquis | (pictogramme) | Image de la section ; non exploitable en texte | — |
| Quantité | `1 (1) Pce`, `5,58 (5,58) m`, `1 (1*2) Pce` | Quantité par champ, puis entre parenthèses l'expression du total pour l'élément (quantité × nombre de champs) | Explicite pour `*2` ; **à valider** si la quantité de position est > 1 |
| Numéro | `32.800` | Référence article Forster | Élevée |
| Description | `Forster PRESTO` | Désignation article | Élevée |
| Longueur [mm] | `2.170,0` | Longueur de coupe | Élevée |
| Coupe | `90° - 135°` | Angles de coupe aux deux extrémités | Élevée ; convention 135°/45° **à valider** |
| Orientation / N° courant | `D/1`, `Ha / 7`, `La / 7` | Côté (D = droite, G = gauche, H = haut, B = bas ; Ha / La = traverse ou montant intermédiaire ?) / numéro de repère sur le croquis | D/G/H/B : élevée ; **Ha / La : à valider** |
| Max/Dim. | `1.113,0 mm` (p. 5, l. 13) | Longueur brute avant délardage, utilisée dans le débit | Élevée |
| Longueur après délardage | `1.073,0 mm` (p. 5, l. 14) | Longueur finale après délardage | Élevée |
| Teinte | (vide partout) | Finition ou couleur | Colonne vide |
| Vitrage : Largeur / Hauteur / Surface | `837 / 1.964 / 1,64` | Dimensions du remplissage en mm et surface en m² | Élevée |
| Vitrage : Description / Numéro | `Sans vitrage, 9 mm` / `1` | Type de remplissage / repère du champ | Élevée |

### 2.2 Débit optimisé

| Colonne | Exemple | Signification probable |
|---|---|---|
| En-tête de référence | `forster 32.800 — Forster PRESTO, Acier brut` | Référence, désignation, matériau |
| `20 Pce á 6.000 mm` | p. 144, l. 8 | Nombre de barres approvisionnées × longueur de barre |
| Largeur / Hauteur | `50,0 mm / 70,0` | Section du profilé (unité de la hauteur non écrite) |
| Chutes | `25.688 mm = 21,4 %` | Chute totale, y compris les chutes restantes réutilisables |
| Chutes utilisables / Epaisseur lame de scie / Chutes d'extr. | `600 / 4 / 60 mm` | Paramètres de l'optimisation |
| `1x` | — | Plan de coupe répété N fois (N barres identiques) |
| Quantité / Orientation / Débit / Longueur / Coupe / Position-Lot | `1 H/4 1.073,0 1.073,0 135° / 135° Int 001` | Coupe affectée à une position ; Débit = Longueur sur les 849 coupes |
| Chutes restantes : Trait. surface / Quantité / Longueur | `32.800 Forster PRESTO, 1024 — 8 — 1.592` | Chutes réutilisables ; le code `1024` / `1009` qui suit la description n'est pas expliqué (**à valider**) |
| Récapitulatif : Quantité / Longueur / Chutes / % | `32.800 — 20 — 6.000 — 25.688 — 21,4` | Synthèse par référence (p. 175) |

---

## 3. Références produits identifiées (23 + 1 remplissage)

Aucune n'a été créée : toutes sont lues dans le PDF. Les descriptions sont reproduites exactement, y compris en anglais.

| Référence | Description (source) | Groupe source | Unité | Occurrences (positions) | Quantité totale document |
|---|---|---|---|---|---|
| 32.800 | Forster PRESTO | Profilés | Pce | 28 | 48 pièces |
| 32.803 | Forster PRESTO | Profilés | Pce | 31 | 96 pièces |
| 32.805 | Forster PRESTO | Profilés | Pce | 31 | 96 pièces |
| 32.851 | Forster PRESTO | Profilés | Pce | 28 | 112 pièces |
| 32.852 | Forster PRESTO | Profilés | Pce | 12 | 32 pièces |
| 32.855 | Forster PRESTO | Profilés | Pce | 32 | 48 pièces |
| 901335 | Parclose aluminium | parcloses | Pce | 32 | 448 pièces |
| 905306 | joint EPDM | Joints | m | 32 | 454,40 m |
| 905312 | joint pour vitrage à sec adhesif | Joints | m | 32 | 530,96 m |
| 905317 | joint étanchéité vitrage à sec intérieur | Joints | m | 32 | 530,96 m |
| 907662 | paumelle à souder | Ferrure | pce | 32 | 144 |
| FFR019FND | Kit n°1, 2 béquille + carré de 8 + rosaces | Ferrure | pce | 32 | 32 |
| FFR042FND | Serrure 1 point Pdt et 1/2 tour TP de 22mm | Ferrure | pce | 32 | 32 |
| FFR045FND | Serrure 2 points à levier | Ferrure | pce | 16 (portes doubles) | 16 |
| FFR046FND | Gâche | Ferrure | pce | 32 | 32 |
| FFR049FND | Kit tringles M 8 Lg 1000mm et Lg 1500mm + 2 embouts+ 1 gâche | Ferrure | pce | 16 (portes doubles) | 16 |
| FFR050FND | Gâche au sol avec obturateur | Ferrure | pce | 16 (portes doubles) | 16 |
| 900100 | douilles d'écoulement | Accessoires | pce | 32 | 328 |
| 905702 | Pièce d'etancheite droite | Accessoires | pce | 4 (009b, 010b) | 8 |
| 905703 | Pièce d'etancheite CR gauche | Accessoires | pce | 12 | 24 |
| 906579 | boutons autotaraudeurs | Accessoires | pce | 32 | 2 368 |
| 916320 | filler piece for profile left | Accessoires | pce | 32 | 60 |
| 916322 | filler piece for profile right | Accessoires | pce | 32 | 52 |
| *(sans réf.)* | Sans vitrage, 9 mm | Vitrage | Pce | 32 | 112 champs |

Sections lues dans le débit optimisé : 32.800 et 32.851 en 50 × 70 ; 32.803, 32.805, 32.852 et 32.855 en 50 × 90 ; 901335 en 30 × 20. Barres de 6 000 mm pour toutes.

Libellé cité sans référence article : « Plinthe d'onglet 1060.2 » (raccord au sol), en en-tête d'élément uniquement, jamais en ligne de nomenclature.

---

## 4. Unités utilisées

| Grandeur | Unité source | Format | Remarque |
|---|---|---|---|
| Dimensions, longueurs de coupe | mm | `2.170,0` (point = milliers, virgule = décimale, 1 décimale) | Croquis : `2036⁵` = 2 036,5 |
| Taille de position | mm | `1.073 x 2.170 mm` | **Arrondie** à l'entier (voir §7) |
| Joints | m | `5,58` (2 décimales) | Linéaire |
| Profilés, parcloses, vitrages | `Pce` (majuscule) | entier | — |
| Ferrures, accessoires | `pce` (minuscule) | entier | Même sens que `Pce` |
| Surface de remplissage | m² | `1,64` | Arrondie à 2 décimales |
| Poids | kg | `40,06` | Indicatif |
| Angles | ° | `90° - 135°` | — |
| Section profilé | mm | `50,0 mm / 70,0` | Unité de la hauteur implicite |
| Chutes | mm et % | `25.688 mm = 21,4 %` | — |
| Prix | — | **absent** | — |

---

## 5. Règles de débit : ce qui est explicite et ce qui ne l'est pas

### 5.1 Explicitement présent dans le document (intégrable tel quel)

| # | Contenu explicite | Source |
|---|---|---|
| E1 | Pour chaque position de référence : liste complète des pièces (référence, quantité, longueur, angles, orientation) | Bon d'atelier |
| E2 | Quantités multipliées par le nombre de champs identiques : `1 (1*2)` | p. 27, l. 29–53 |
| E3 | Longueur brute (Max/Dim.) et longueur après délardage pour certaines pièces | ex. p. 5, l. 13–14 |
| E4 | Paramètres d'optimisation : barre de 6 000 mm, lame de scie 4 mm, chute d'extrémité 60 mm, chute utilisable dès 600 mm | p. 144, l. 6–11 et suivantes |
| E5 | Nombre de barres et chute par référence pour l'affaire complète (les 32 positions débitées ensemble) | p. 175 |
| E6 | Ferrures propres aux portes doubles (FFR045FND, FFR049FND, FFR050FND) et nombre de paumelles (3 par vantail) | positions 007 à 012 |

E5 vaut pour **l'ensemble des 32 positions optimisées ensemble**. Le nombre de barres d'une seule position n'est pas dérivable de ce document.

### 5.2 Relations observées : non démontrées, à valider

Elles sont listées pour aider la validation métier, **pas pour être codées**. Chacune repose sur un seul jeu de dimensions (largeur de vantail toujours 993 mm, deux hauteurs seulement).

| # | Observation | Pourquoi ce n'est pas une règle |
|---|---|---|
| O1 | Vantail 993 × 2 120 dans un dormant de 1 073 × 2 170 (écarts −80 / −50) | Une seule largeur de porte dans tout le document |
| O2 | Parcloses du vantail 1 940 / 853 ; remplissage 837 × 1 964 | Idem |
| O3 | Int → Ext : 32.805 ↔ 32.803 et coupes 135° ↔ 45° sur les montants et traverses du vantail, angles des montants du dormant inversés ; ferrures, joints et accessoires identiques | Constat sur 13 paires ; principe à confirmer |
| O4 | Imposte : dormant de porte 2 152 + imposte 348 (+ jonction de 7 mm sur les croquis) pour une hauteur de 2 500 | Une seule hauteur d'imposte ; le « 7 » n'apparaît que sur les images |
| O5 | Délardage 1 113 → 1 073 (Int 002) mais 1 113 → 1 093 (Int 004) | La même longueur brute donne deux longueurs finales selon le contexte : règle inconnue |
| O6 | Longueurs de joint (ex. 5,58 m d'EPDM sur le dormant d'Int 001) | Aucune relation simple avec le périmètre ; formule inconnue |
| O7 | Nombre de boutons autotaraudeurs (24 par vantail, 14 à 24 par fixe) | Dépend de la taille ; formule inconnue |

### 5.3 Absent

Formules de longueur de coupe, limites dimensionnelles, règles de choix des profilés (32.851 contre 32.800 dans le dormant, 32.852), règles de quantité des accessoires et des joints, compatibilités, prix, remplissages et vitrages réels.

---

## 6. Informations manquantes

1. **Prix** de toutes les références (et unité de prix : barre, mètre, pièce).
2. **Règles paramétriques** de débit (formules longueur = f(L, H)) pour sortir des 32 dimensions de référence.
3. **Châssis fixe seul** : aucun exemple.
4. **Remplissage / vitrage** : seulement « Sans vitrage, 9 mm », sans référence ni prix.
5. **Plinthe d'onglet 1060.2** : pas de référence article ni de quantité.
6. **Finitions et teintes** : colonne « Teinte » vide, « Trait. surface » vide ; matériau « Acier brut » uniquement.
7. **Variantes DIN R** pour les portes sans partie latérale.
8. **Signification** des repères Ha / La, des codes 1024 / 1009, et du « 7 » des croquis.
9. **Consommables** (silicone, colle, fixations murales, chevilles) : absents. Peut-être hors périmètre forsterpro.
10. Ferme-porte, barre anti-panique, autres serrures : absents (présents dans les options de l'interface V1).

---

## 7. Incohérences, doublons et points d'attention

| # | Constat | Détail et source | Impact |
|---|---|---|---|
| I1 | **Avertissement forsterpro sur les 32 positions** | « La coupe système de la position "Int 001" n'existe pas. Veuillez recalculer la nomenclature. » (p. 1, l. 26 ; idem pour chaque position) | **Bloquant** : la fiabilité de la nomenclature est à confirmer |
| I2 | Taille arrondie | Int 003 : Taille « 2.037 » alors que 1 073,0 + 963,5 = 2 036,5 (dormant p. 8) et croquis « 2036⁵ » ; Int 007 : « 2.036 » | Ne jamais calculer à partir de la Taille affichée ; conserver les deux valeurs |
| I3 | Chute du récapitulatif ≠ chute de la fiche barre | 32.852 : 2.760 mm (p. 175) contre 2.756 mm (p. 159) ; 901335 : 9.538 mm (p. 175) contre 9.464 mm (p. 163). Le calcul 6 000 × barres − Σ coupes donne 2 756 et 9 464 | Conserver les deux valeurs sources ; alerte à l'affichage |
| I4 | Poids de position < poids de vantail | Int 001 : « Poids position (sans accessoires) 40,06 kg » contre « Vantail 1.1 Poids 62,8 kg » | Ne pas exploiter les poids en V1 |
| I5 | Matériau contradictoire | Série « …Standard Aluminium », Matériau « Acier brut », parclose « Aluminium » | À clarifier avant tout chiffrage matière |
| I6 | Remplissage non défini | « Sans vitrage, 9 mm » ; « 0,00 kg Remplissages » | Total vitrage impossible |
| I7 | Pièces de remplissage asymétriques | Portes doubles : 3 × 916320 (left) et 2 × 916322 (right), ex. p. 37, l. 47–49 | À confirmer (pas forcément une erreur) |
| I8 | Casse et langue hétérogènes | `Pce` / `pce` ; descriptions anglaises (« filler piece… ») | Conserver le texte brut, normaliser seulement l'unité interne |
| I9 | Doublons | Aucun doublon de ligne détecté. Les lignes répétées (ex. deux montants 2 120) sont des pièces distinctes (orientation et repère différents). Int 003 et 003b, etc., sont des miroirs, pas des doublons | Clé unique : position + élément + repère + ligne source |

Contrôle croisé Bon d'atelier ↔ Débit optimisé (calculé) :

| Réf. | Barres | Coupes (bon / débit) | Σ longueurs (bon = débit) | 6 000 × barres − Σ | Chute affichée (fiche barre / récap.) |
|---|---|---|---|---|---|
| 32.800 | 20 | 48 / 48 | 94 312 mm | 25 688 | 25.688 / 25.688 |
| 32.803 | 34 | 96 / 96 | 173 388 mm | 30 612 | 30.612 / 30.612 |
| 32.805 | 34 | 96 / 96 | 173 388 mm | 30 612 | 30.612 / 30.612 |
| 32.851 | 26 | 112 / 112 | 151 128 mm | 4 872 | 4.872 / 4.872 |
| 32.852 | 3 | 32 / 32 | 15 244 mm | 2 756 | 2.756 / **2.760** |
| 32.855 | 10 | 48 / 48 | 47 664 mm | 12 336 | 12.336 / 12.336 |
| 901335 | 89 | 448 / 448 | 524 536 mm | 9 464 | 9.464 / **9.538** |

---

## 8. Questions bloquantes

**Q1 — Stratégie de calcul V1.** Le document fournit 32 cas fixes, pas de formules. Je propose de procéder ainsi en V1 :
- si la configuration et les dimensions saisies correspondent **exactement** à une position de référence, l'application restitue sa nomenclature source, entièrement tracée ;
- sinon, elle affiche « Règle de débit paramétrique à fournir » et ne calcule rien.

Validez-vous ce mode, ou disposez-vous des formules forsterpro (ou d'autres exports avec d'autres dimensions) ?

**Q2 — Fiabilité.** L'avertissement « Veuillez recalculer la nomenclature » (I1) remet-il en cause les quantités ? Faut-il un export recalculé ?

**Q3 — Confidentialité.** Le dépôt **FFR-PRESTO est public** (et GitHub Pages le serait aussi). Puis-je y versionner le PDF, les références Forster extraites et le nom de l'éditeur du document ? Si ce n'est pas le cas, je propose : le PDF n'est pas versionné ; le jeu de données extrait est chargé localement via le module d'import ; les tests s'appuient sur un extrait limité. Il faudrait votre accord sur le contenu de cet extrait.

**Q4 — Correspondance des compositions** (tableau §1.1). En particulier : les configurations 004 / 010 (imposte + **une** partie latérale) doivent-elles devenir un type de composition supplémentaire ? Et le châssis fixe seul reste-t-il sans données pour l'instant ?

**Q5 — Int / Ext.** « Ouverture intérieure ou extérieure » doit-elle sélectionner la variante Int ou Ext du document ? Faut-il considérer l'échange 32.803 ↔ 32.805 (O3) comme une règle ?

Non bloquantes mais nécessaires pour le chiffrage : unité de prix des profilés (barre de 6 m ou mètre linéaire), chiffrage des chutes (barres entières ou longueur nette), remplissage, codes 1024 / 1009.

---

## 9. Modèle de données proposé

Principe : **trois couches strictement séparées**.

1. **Données importées (immuables)** : copie fidèle du document, valeurs brutes et valeurs parsées côte à côte, chaque ligne avec sa source.
2. **Règles** : correspondances composition → position de référence, statut de chaque règle (`explicite` / `à valider` / `manquante`). Aucune formule tant qu'elle n'est pas fournie.
3. **Calcul et résultat** : le moteur ne lit que les couches 1 et 2 et produit des lignes tracées.

```ts
// ── Traçabilité ───────────────────────────────────────────────
interface SourceDocument {
  id: string;                 // ex. "ffr-presto-2026-11-11"
  fileName: string;           // nom du fichier tel que fourni
  sha256: string;             // empreinte : prouve que la source n'a pas changé
  producer: string;           // "combit List & Label 28.2"
  affaire: string;            // "FFR Presto"
  editedAt: string;           // "11/11/2026 / 14:25" (brut)
  pageCount: number;
}
interface SourceLocation {
  documentId: string;
  section: 'bon_atelier' | 'debit_optimise';
  pdfPage: number;            // page physique du PDF
  printedPage: number;        // numéro imprimé (≠ pdfPage pour le débit)
  line: number;               // ligne dans l'extraction texte de la page
  rawText: string;            // ligne source exacte
}

// ── Couche 1 : données importées ──────────────────────────────
interface ImportedPosition {
  id: string;                 // "Int 001"
  openingSide: 'interieur' | 'exterieur';   // déduit du libellé source
  quantity: number;
  series: string; material: string; drainage: string; outerGasket: string;
  sizeRaw: string;            // "2.037 x 2.170 mm" (arrondi, cf. I2)
  widthMm: number; heightMm: number;
  sourceWarnings: { text: string; source: SourceLocation }[];  // ex. I1
  elements: ImportedElement[];
  source: SourceLocation;
}
interface ImportedElement {
  indexRaw: string;           // "0", "2", "1,3"
  fieldIndexes: number[];     // [1, 3]
  kind: 'dormant' | 'porte_1_vantail' | 'porte_2_vantaux' | 'fixe_vitre';
  labelRaw: string;
  dinDirection?: 'L' | 'R';
  handleHeightMm?: number;
  floorConnectionRaw?: string;   // "Plinthe d'onglet 1060.2"
  doorGapRaw?: string;
  sashes: { id: string; widthMm: number; heightMm: number; weightKg: number; source: SourceLocation }[];
  lines: ImportedBomLine[];
  source: SourceLocation;
}
type BomGroup = 'profiles' | 'glazing_beads' | 'glazing' | 'hardware' | 'gaskets' | 'accessories';
interface ImportedBomLine {
  group: BomGroup;
  ref: string | null;         // null pour « Sans vitrage, 9 mm »
  descriptionRaw: string;
  unitRaw: 'Pce' | 'pce' | 'm';
  qtyRaw: string;             // "1"
  qtyExpressionRaw: string;   // "1*2"
  qtyTotal: number;           // évalué depuis qtyExpressionRaw
  lengthMm?: number; lengthRaw?: string;
  maxDimMm?: number; lengthAfterTrimMm?: number;
  cutAnglesRaw?: string;      // "90° - 135°"
  orientationRaw?: string;    // "D/1", "Ha/7"
  glass?: { widthMm: number; heightMm: number; areaM2: number; fieldNo: number };
  source: SourceLocation;
}
interface ImportedCuttingPlan {
  ref: string; descriptionRaw: string;
  stockBars: number; barLengthMm: number;
  sectionRaw: string;         // "50,0 mm / 70,0"
  wasteMm: number; wastePct: number;
  sawKerfMm: number; endWasteMm: number; usableOffcutMm: number;
  patterns: { repeat: number; cuts: { qty: number; orientation: string; cutLengthMm: number; lengthMm: number; anglesRaw: string; positionId: string; source: SourceLocation }[]; source: SourceLocation }[];
  source: SourceLocation;
}
interface ImportedOffcut { ref: string; descriptionRaw: string; codeRaw: string; qty: number; lengthMm: number; source: SourceLocation }
interface ImportedCuttingSummary { ref: string; bars: number; barLengthMm: number; wasteMm: number; wastePct: number; source: SourceLocation }

// Catalogue dérivé (dédoublonné), SANS prix
interface ProductReference {
  ref: string; descriptions: string[]; category: MaterialCategory; unit: 'piece' | 'metre';
  sectionRaw?: string; firstSeen: SourceLocation;
}

// ── Couche 2 : règles ─────────────────────────────────────────
type RuleStatus = 'explicite' | 'a_valider' | 'manquante';
interface CompositionMapping {           // composition ForsterCalc → position(s) source
  compositionType: CompositionType;
  openingSide: 'interieur' | 'exterieur';
  dinDirection?: 'L' | 'R';
  referencePositionId: string;           // "Int 003b"
  status: RuleStatus;                    // 'a_valider' tant que Q4 n'est pas tranchée
  note?: string;
}
interface CuttingRule {                  // vide en V1 ; prêt pour les formules
  id: string; status: RuleStatus; description: string;
  appliesTo: { ref: string; elementKind: ImportedElement['kind'] };
  formula?: never;                       // à définir quand les formules seront fournies
  providedBy?: SourceLocation;
}

// ── Couche 3 : résultat ───────────────────────────────────────
interface CuttingListItem {
  ref: string; designation: string; category: MaterialCategory;
  unitLengthMm?: number; quantity: number; totalLengthM?: number;
  unitPrice: number | null; totalPrice: number | null;   // null = « Prix non disponible »
  trace: { source: SourceLocation; ruleApplied: string; ruleStatus: RuleStatus; priceSource: PriceSource | null };
  comment?: string;
}
```

Fichiers prévus dans le dépôt (après réponse à Q3) :

- `src/imports/forsterpro/` : parseur PDF/texte → couche 1, avec tests ;
- `src/data/sources/ffr-presto/` : JSON extrait, généré une fois et jamais modifié à la main ;
- `src/domain/rules/` : correspondances, statuts ;
- `src/calculation/` : moteur de calcul ;
- `docs/calculation-rules.md` : explicite, à valider, manquant.

---

## 10. Scénarios de test proposés (tous issus du document)

| # | Scénario | Attendu (valeurs source) | Source |
|---|---|---|---|
| T1 | Parsing de l'en-tête Int 001 | Quantité 1 ; Taille 1 073 × 2 170 ; série « forster presto/presto XS 50 Standard Aluminium » ; matériau « Acier brut » | p. 1 |
| T2 | Dormant Int 001 | 3 × 32.800 : 2 170,0 (90°-135°, D/1) ; 2 170,0 (135°-90°, G/2) ; 1 073,0 (135°-135°, H/4) ; joint 905306 = 5,58 m | p. 1, l. 30–34 ; p. 2, l. 9 |
| T3 | Vantail Int 001 | 1.1 = 993 × 2 120, 62,8 kg ; 2 × 32.805 2 120 ; 32.855 993 (45°-45°) ; 32.805 993 ; 4 parcloses 1 940 / 1 940 / 853 / 853 ; remplissage 837 × 1 964 = 1,64 m² | p. 2 |
| T4 | Ferrures porte simple | 3 × 907662, 1 × FFR019FND, 1 × FFR042FND, 1 × FFR046FND | p. 2–3 |
| T5 | Ligne de description sur deux lignes | FFR019FND = « Kit n°1, 2 béquille + carré de 8 + rosaces » | p. 2, l. 54–55 |
| T6 | Champs multiples | Int 005, élément « 1,3 » : 4 parcloses `1 (1*2)` → total 2 chacune (2 030 / 2 030 / 913,5 / 913,5) ; joint 905312 `5,98 (5,98*2)` → 11,96 m ; 906579 `24 (24*2)` → 48 | p. 27, l. 29–53 |
| T7 | Délardage | Int 002, 32.803 La/7 : longueur 1 113,0 ; Max/Dim. 1 113,0 ; après délardage 1 073,0 | p. 5, l. 12–14 |
| T8 | Délardage contextuel (non-règle) | 32.803 1 113 → 1 073 (Int 002) **et** → 1 093 (ailleurs) : le moteur ne doit **pas** généraliser | §5.2 O5 |
| T9 | Porte double | Int 007 : 2 vantaux 993 × 2 120 ; 6 × 907662 ; FFR045FND, FFR049FND, FFR050FND présents ; 2 × 905703 | p. 35–37 |
| T10 | Variante Ext | Ext 001 : montants et traverse haute du vantail en 32.803 (45°-45°) au lieu de 32.805 (135°-135°) ; angles des montants du dormant inversés (D/1 135°-90°, G/2 90°-135°) ; ferrures, joints et accessoires identiques à Int 001 | p. 72–74 |
| T11 | Taille arrondie | Int 003 : sizeRaw « 2.037 x 2.170 mm » conservé ; Σ dormant horizontal = 2 036,5 ; alerte I2 générée | p. 8 |
| T12 | Avertissement source | Chaque position porte l'avertissement « coupe système … n'existe pas » → `sourceWarnings.length === 1` | p. 1, l. 26 |
| T13 | Totaux globaux | 32 positions ; 1 484 lignes ; 32.800 = 48 pièces ; 901335 = 448 ; 906579 = 2 368 ; 905306 = 454,40 m | tout le bon |
| T14 | Cohérence bon ↔ débit | Pour les 7 références : nombre de coupes et Σ longueurs identiques (tableau §7) | p. 144–174 |
| T15 | Barres et chutes | 32.800 : 20 barres de 6 000, chute 25 688 mm = 21,4 % ; 6 000 × 20 − 94 312 = 25 688 | p. 144, p. 175 |
| T16 | Écart récapitulatif (I3) | 32.852 : fiche barre 2 756 contre récap. 2 760 → les deux valeurs conservées et une alerte | p. 159, p. 175 |
| T17 | Pages du débit | Ligne du débit p. PDF 175 → page imprimée 33 | p. 175 |
| T18 | Immutabilité | Le JSON importé est figé ; le SHA-256 du PDF est vérifié avant import | — |
| T19 | Hors référence | Porte simple 1 200 × 2 170 → aucune nomenclature, alerte « Règle de débit paramétrique à fournir » | Q1 |
| T20 | Prix | Toute ligne → `unitPrice: null`, libellé « Prix non disponible » ; aucun total matériel affiché comme définitif | — |

---

### Annexe : méthode d'extraction

- `pdftotext -layout`, page par page ; expressions régulières par type de ligne (profilé, parclose, vitrage, ferrure / accessoire, joint) ; recollage des tableaux coupés par les sauts de page ; descriptions sur deux lignes rattachées à la ligne précédente.
- Résultat : 32 positions, 1 484 lignes, 0 ligne non reconnue ; 7 plans de coupe, 849 coupes ; 12 lignes de chutes restantes ; 7 lignes de récapitulatif.
- Croquis : vérifiés visuellement pour les 32 positions (disposition des éléments, cotes) ; ils ne sont pas exploités comme données.
