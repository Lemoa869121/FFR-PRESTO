# Règles de calcul

> Système intégré : **Forster Presto — presto XS 50 Standard Aluminium**.
> Sources :
> - dossier de fabrication forsterpro « FFR Presto » du 11/11/2026 ([`data/sources/ffr-presto`](../data/sources/ffr-presto/README.md)) ;
> - guide de mise en œuvre Forster presto n° 918301, édition 01/2021 ([`data/sources/presto-manual`](../data/sources/presto-manual/README.md)), cité par code de page « VP ».
> Code : [`src/calculation/presto/`](../src/calculation/presto) — registre des règles : [`rules.ts`](../src/calculation/presto/rules.ts).

## Méthode

Le dossier contient le **résultat** forsterpro pour 32 positions, pas de formules. Sur demande du 11/11/2026 (« suivant les dimensions et les positions que tu as, il faut que tu définisses les règles de calcul »), les règles ci-dessous ont été **déduites** de ces 32 nomenclatures, puis vérifiées :

- `src/tests/prestoRules.test.ts` génère chaque position à partir de ses dimensions et compare, élément par élément (dormant, porte, fixes), **chaque ligne** : référence, longueur, angles de coupe, côté, longueur après délardage et quantité, avec la nomenclature du dossier. Résultat : **32 / 32 positions identiques**.
- Un test négatif vérifie qu'une modification de 1 mm suffit à faire échouer la comparaison.
- Le numéro de repère forsterpro (« N° courant », ex. D/**1**) n'est pas reproduit ; seule la lettre de côté est comparée.

### Statuts

| Statut | Signification |
|---|---|
| explicite | Écrit dans le guide de mise en œuvre (page VP citée), lu dans le dossier ou confirmé par le demandeur |
| dérivée | Déduite des 32 positions et vérifiée sur toutes |
| **à valider** | Plusieurs formules expliquent les données, ou constante inhabituelle : confirmation Forster requise |

### Domaine de validité

Les longueurs suivent des écarts constants (ex. vantail = passage − 80) qui n'ont été observés que sur les valeurs du dossier :

| Paramètre | Valeurs présentes dans le dossier |
|---|---|
| Largeur de passage dormant Wd | 1 073 (1 vantail), 2 036 (2 vantaux) |
| Hauteur de la zone porte Hd | 2 170 |
| Hauteur d'imposte T | 330 |
| Largeur de partie latérale | 963,5 (1 vantail), 482 (2 vantaux) |

En dehors de ces valeurs, l'application calcule avec les mêmes règles mais affiche l'alerte **« Résultat extrapolé, à valider »**. Lorsque la configuration est identique à l'une des 32 positions, elle affiche la position de référence et sa page.

## Notation

- W largeur totale, H hauteur totale ;
- L, R largeur des parties latérales gauche et droite = longueur de la traverse du dormant au-dessus ou au-dessous de la partie fixe (dossier : 963,5 ou 482) ;
- T hauteur d'imposte = longueur du montant de dormant en zone d'imposte (dossier : 330) ;
- Wd = W − L − R (passage dormant) ; Hd = H − T (zone porte) ;
- côtés : D droite, G gauche, H haut, B bas, Ha montant intermédiaire, La traverse intermédiaire ;
- clair = dimensions de vitrage entre parcloses ;
- joints : arrondi au centième de mètre (demi supérieur) ; remplissage : arrondi au millimètre.

### Configuration

| ID | Règle | Formule | Vérifiée sur | Sources | Statut |
|---|---|---|---|---|---|
| P-CFG-01 | Correspondance tirant ↔ DIN<br>*Libellés forsterpro « Sens d’ouverture DIN L / R » ; correspondance avec le vocabulaire « tirant » à confirmer.* | Tirant gauche = DIN L ; tirant droit = DIN R | DIN L et DIN R présents dans le dossier | Dossier FFR Presto (32 positions) | **à valider** |
| P-CFG-03 | Jeu sous porte (sol fini)<br>*Cote « variable » sur les plans du système ; « Jeu de porte : 10 mm » dans le dossier.* | Paramètre saisi ; 10 mm par défaut | 10 mm dans le dossier | Guide presto VP 3.5.32 (p. 242)<br>Dossier FFR Presto (32 positions) | explicite |
| P-CFG-02 | Ouverture intérieure / extérieure<br>*Confirmé par le demandeur le 11/11/2026.* | Ouverture intérieure = variante « Int » ; extérieure = variante « Ext » | 32 positions (Int / Ext 001 à 012) | Dossier FFR Presto (32 positions) | explicite |

### Dormant

| ID | Règle | Formule | Vérifiée sur | Sources | Statut |
|---|---|---|---|---|---|
| P-DOR-01 | Montant extérieur côté partie fixe | 32.851, L = H, coupe 135° - 135° | H = 2 170 et 2 500 | Dossier FFR Presto (32 positions) | dérivée |
| P-DOR-02 | Montant extérieur côté porte | 32.800, L = Hd ; Int : D 90° - 135°, G 135° - 90° ; Ext : angles inversés | Hd = 2 170 | Dossier FFR Presto (32 positions) | dérivée |
| P-DOR-03 | Montant extérieur en zone d’imposte (côté porte) | 32.851, L = T ; D 90° - 135°, G 135° - 90° | T = 330 | Dossier FFR Presto (32 positions) | dérivée |
| P-DOR-04 | Traverse basse sous une partie fixe | 32.851, L = largeur de la partie latérale ; droite 90° - 135°, gauche 135° - 90° | L, R = 963,5 et 482 | Dossier FFR Presto (32 positions) | dérivée |
| P-DOR-05 | Traverse haute sans imposte | Au-dessus de la porte : 32.800, L = Wd, 135° - 135° ; au-dessus d’une partie fixe : 32.851, L = largeur latérale (droite 135° - 90°, gauche 90° - 135°) | Wd = 1 073 et 2 036 | Dossier FFR Presto (32 positions) | dérivée |
| P-DOR-06 | Traverse haute avec imposte | 32.851, L = W, 135° - 135° (une seule pièce) | W = 1 073 à 3 000 | Dossier FFR Presto (32 positions) | dérivée |
| P-DOR-07 | Montant intermédiaire porte / partie fixe | Int : 32.803 ; Ext : 32.805 ; coupe L = Hd + 20 ; Int droite 90° - 135°, gauche 135° - 90° ; Ext droite 45° - 90°, gauche 90° - 45° ; sans imposte : longueur après délardage = Hd | Hd = 2 170 | Dossier FFR Presto (32 positions) | dérivée |
| P-DOR-08 | Montant intermédiaire en zone d’imposte | 32.852, L = T − 50, 90° - 90° | T = 330 | Dossier FFR Presto (32 positions) | dérivée |
| P-DOR-09 | Traverse d’imposte au-dessus de la porte | Int : 32.803, 135° - 135° ; Ext : 32.805, 45° - 45° ; coupe L = Wd + 40 ; délardage de 20 par extrémité appuyée sur le dormant extérieur | Wd = 1 073 et 2 036 ; 0, 1 ou 2 extrémités sur dormant | Dossier FFR Presto (32 positions) | dérivée |
| P-DOR-10 | Traverse d’imposte au-dessus d’une partie fixe | 32.852, L = largeur latérale − 50, 90° - 90° | L, R = 963,5 et 482 | Dossier FFR Presto (32 positions) | dérivée |

### Joints

| ID | Règle | Formule | Vérifiée sur | Sources | Statut |
|---|---|---|---|---|---|
| P-JNT-01 | Joint EPDM du dormant (905306) | 1,03 × (montant gauche + montant droit + traverse au-dessus de la porte) / 1 000, arrondi à 0,01 m ; montant = Hd (dormant) ou Hd + 20 (intermédiaire) ; traverse = Wd ou Wd + 40 (imposte) | 32 positions (Int / Ext 001 à 012) | Dossier FFR Presto (32 positions) | dérivée |
| P-JNT-02 | Joint EPDM du vantail (905306) | 1,03 × (2 × hauteur vantail + largeur vantail) / 1 000 par vantail, arrondi à 0,01 m | vantail 993 × 2 120 | Dossier FFR Presto (32 positions) | dérivée |
| P-JNT-03 | Joints de vitrage 905312 et 905317 | Chacun : 1,03 × 2 × (largeur clair + hauteur clair − 40) / 1 000 par champ, arrondi à 0,01 m | 7 tailles de champ différentes | Dossier FFR Presto (32 positions) | dérivée |

### Vantail

| ID | Règle | Formule | Vérifiée sur | Sources | Statut |
|---|---|---|---|---|---|
| P-VAN-01 | Dimensions du vantail<br>*Recouvrement du dormant 36 mm et jeu de feuillure 4 mm en tête et en montants (coupes B-B et C-C).* | Hauteur = Hd − (36 + 4) − jeu sous porte ; porte simple : largeur = Wd − 2 × (36 + 4) | Wd = 1 073, Hd = 2 170, jeu 10 (dossier) | Guide presto VP 3.5.32 (p. 242)<br>Guide presto VP 3.5.33 (p. 243)<br>Dossier FFR Presto (32 positions) | explicite |
| P-VAN-05 | Largeur des vantaux d’une porte double<br>*Recouvrement au battement non coté lisiblement dans le guide (VP 3.5.36).* | (Wd − 50) / 2 par vantail | Wd = 2 036 | Dossier FFR Presto (32 positions) | dérivée |
| P-VAN-02 | Montants et traverse haute du vantail<br>*Échange 32.803 ↔ 32.805 entre Int et Ext confirmé par le demandeur.* | Int : 32.805, 135° - 135° ; Ext : 32.803, 45° - 45° ; montants L = hauteur vantail, traverse haute L = largeur vantail | 32 positions (Int / Ext 001 à 012) | Dossier FFR Presto (32 positions) | dérivée |
| P-VAN-03 | Traverse basse du vantail | 32.855, L = largeur vantail, 45° - 45° | 32 positions (Int / Ext 001 à 012) | Dossier FFR Presto (32 positions) | dérivée |
| P-VAN-04 | Montant de battement (porte double)<br>*Cote de 34 mm au battement confirmée par le guide.* | Int : 32.803, 45° - 45° ; Ext : 32.805, 135° - 135° ; L = hauteur vantail ; après délardage = hauteur − 34 ; sur le montant D du 1er vantail si (Int et DIN L) ou (Ext et DIN R), sinon sur le montant G du 2e vantail | 16 portes doubles | Guide presto VP 3.6.10 (p. 276)<br>Dossier FFR Presto (32 positions) | dérivée |

### Vitrage

| ID | Règle | Formule | Vérifiée sur | Sources | Statut |
|---|---|---|---|---|---|
| P-VIT-01 | Clair de vitrage d’un vantail | Largeur = largeur vantail − 140 ; hauteur = hauteur vantail − 180 | vantail 993 × 2 120 | Dossier FFR Presto (32 positions) | dérivée |
| P-VIT-02 | Champs fixes et leur clair | Un champ par colonne latérale en zone porte et, avec imposte, un champ par colonne en zone d’imposte ; largeur = largeur latérale − 50 (colonne fixe) ou Wd − 100 (au-dessus de la porte) ; hauteur = Hd − 140 (zone porte) ou T − 90 (zone d’imposte) | 32 positions (Int / Ext 001 à 012) | Dossier FFR Presto (32 positions) | dérivée |
| P-VIT-03 | Parcloses (901335) | 4 par champ : 2 × hauteur clair (D, G) et 2 × largeur clair (B, H), coupe 90° - 90° | 32 positions (Int / Ext 001 à 012) | Dossier FFR Presto (32 positions) | dérivée |
| P-VIT-04 | Dimensions du remplissage | (largeur clair − 16) × (hauteur clair + 24), arrondi au mm ; surface arrondie à 0,01 m² ; désignation source « Sans vitrage, 9 mm » | 7 tailles de champ différentes | Dossier FFR Presto (32 positions) | dérivée |

### Quincaillerie

| ID | Règle | Formule | Vérifiée sur | Sources | Statut |
|---|---|---|---|---|---|
| P-QUI-01 | Paumelles à souder (907662) | 3 par vantail | 32 positions (Int / Ext 001 à 012) | Dossier FFR Presto (32 positions) | dérivée |
| P-QUI-02 | Ferrures de porte | FFR019FND, FFR042FND, FFR046FND : 1 de chaque par porte | 32 positions (Int / Ext 001 à 012) | Dossier FFR Presto (32 positions) | dérivée |
| P-QUI-03 | Ferrures de porte double | FFR045FND, FFR049FND, FFR050FND : 1 de chaque | 16 portes doubles | Dossier FFR Presto (32 positions) | dérivée |

### Accessoires

| ID | Règle | Formule | Vérifiée sur | Sources | Statut |
|---|---|---|---|---|---|
| P-ACC-01 | Boutons autotaraudeurs (906579)<br>*Le guide impose au plus 70 mm des extrémités et 300 mm d’entraxe : les quantités du dossier respectent ce minimum mais en posent davantage ; la répartition exacte de forsterpro n’est pas décrite.* | Par champ : 2 × n(largeur clair) + 2 × n(hauteur clair), n(l) = max(3 ; ⌈l / 277⌉) | 7 tailles de champ | Guide presto VP 3.6.14 (p. 280)<br>Dossier FFR Presto (32 positions) | **à valider** |
| P-ACC-02 | Douilles d’écoulement (900100)<br>*⌈largeur / 400⌉ donne les mêmes résultats sur le dossier ; les deux formules diffèrent pour un multiple exact de 400.* | Par champ : ⌊largeur clair / 400⌋ + 1 (fixes comptés dans le dormant, vantaux dans la porte) | largeurs de clair 432 à 1 936 | Dossier FFR Presto (32 positions) | **à valider** |
| P-ACC-03 | Pièces de remplissage 916320 / 916322<br>*Emplacements décrits par le guide ; quantités tirées du dossier.* | Porte simple : 1 / 1 ; porte double DIN L : 3 / 2 ; DIN R : 2 / 3 | 32 positions (Int / Ext 001 à 012) | Guide presto VP 3.6.10 (p. 276)<br>Dossier FFR Presto (32 positions) | dérivée |
| P-ACC-04 | Pièces d’étanchéité de porte double<br>*Correspondance DIN écrite dans le guide (« Dichtungsstück oben, DIN links 905703 / DIN rechts 905702 ») ; quantité 2 tirée du dossier.* | DIN L : 905703 × 2 ; DIN R : 905702 × 2 | 16 portes doubles | Guide presto VP 3.4.9 (p. 203)<br>Dossier FFR Presto (32 positions) | explicite |

### Contrôles

| ID | Règle | Formule | Vérifiée sur | Sources | Statut |
|---|---|---|---|---|---|
| P-CTL-01 | Dimension minimale | Dormant et vantail ≥ 120 mm (bloquant) | — | Guide presto VP 3.1.1 (p. 53) | explicite |
| P-CTL-02 | Charge admissible des paumelles 907662<br>*Le poids du vantail n’est pas calculé tant que le remplissage n’est pas défini.* | Table H 1 800 à 3 000 × B 600 à 1 400 mm ; hors table : alerte | — | Guide presto VP 3.3.114 (p. 178) | explicite |
| P-CTL-03 | Tolérances de coupe | Dormant +1 / −0 mm ; vantail +0 / −1 mm | — | Guide presto VP 1.3.3 (p. 27) | explicite |
| P-CTL-04 | Poids des profilés et longueur de barre<br>*Hors joints, remplissage et quincaillerie.* | Poids = kg/m × longueur × quantité ; barres de 6 000 mm | 7 références | Guide presto VP 3.2.1, 3.2.2, 3.2.4 (p. 59, 60, 62) | explicite |

## Données non couvertes (règle métier à fournir)

| Sujet | Statut |
|---|---|
| Châssis fixe seul, composition personnalisée | Le guide montre le vitrage fixe (plan 13, VP 3.5.41 : dormant 32.851, meneaux et traverses 32.852) mais sans longueurs de coupe : règles à établir avec un export forsterpro |
| Vitrages et remplissages réels | Seul « Sans vitrage, 9 mm » figure dans le dossier, sans référence |
| Plinthe d'onglet 1060.2 (raccord au sol) | Citée en en-tête, sans référence ni quantité |
| Ferme-porte, anti-panique, autres serrures et poignées | Absents du dossier |
| Finitions, teintes, traitement de surface | Colonnes vides dans le dossier |
| Optimisation des barres (6 000 mm, lame 4 mm, chute d'extrémité 60 mm) | Paramètres connus ; l'optimisation n'est pas recalculée (longueurs nettes seulement) |
| Limites dimensionnelles | Minimum 120 mm (P-CTL-01) et table de charges des paumelles (P-CTL-02) appliqués ; pas d’autre limite dans le guide pour le calcul matière |
| Prix | Aucun tarif fourni |

## Points d'attention issus du dossier

- Les 32 positions portent l'avertissement forsterpro « Veuillez recalculer la nomenclature » ; le demandeur a confirmé le 11/11/2026 que **les quantités sont fiables**.
- La « Taille » affichée par forsterpro est arrondie (2 037 pour 2 036,5) : le calcul utilise les longueurs réelles.
- Chutes du récapitulatif ≠ fiches barres pour 32.852 (2 760 contre 2 756) et 901335 (9 538 contre 9 464). Les deux valeurs sont conservées dans les données importées.
