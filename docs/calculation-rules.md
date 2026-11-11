# Règles de calcul

> Système intégré : **Forster Presto — presto XS 50 Standard Aluminium**.
> Source unique à ce jour : dossier de fabrication forsterpro « FFR Presto » du 11/11/2026 ([`data/sources/ffr-presto`](../data/sources/ffr-presto/README.md)).
> Code : [`src/calculation/presto/`](../src/calculation/presto) — registre des règles : [`rules.ts`](../src/calculation/presto/rules.ts).

## Méthode

Le dossier contient le **résultat** forsterpro pour 32 positions, pas de formules. Sur demande du 11/11/2026 (« suivant les dimensions et les positions que tu as, il faut que tu définisses les règles de calcul »), les règles ci-dessous ont été **déduites** de ces 32 nomenclatures, puis vérifiées :

- `src/tests/prestoRules.test.ts` génère chaque position à partir de ses dimensions et compare, élément par élément (dormant, porte, fixes), **chaque ligne** : référence, longueur, angles de coupe, côté, longueur après délardage et quantité, avec la nomenclature du dossier. Résultat : **32 / 32 positions identiques**.
- Un test négatif vérifie qu'une modification de 1 mm suffit à faire échouer la comparaison.
- Le numéro de repère forsterpro (« N° courant », ex. D/**1**) n'est pas reproduit ; seule la lettre de côté est comparée.

### Statuts

| Statut | Signification |
|---|---|
| explicite | Lu dans la source ou confirmé par le demandeur |
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

| ID | Règle | Formule | Vérifiée sur | Statut |
|---|---|---|---|---|
| P-CFG-01 | Correspondance tirant ↔ DIN<br>*Libellés forsterpro « Sens d’ouverture DIN L / R » ; correspondance avec le vocabulaire « tirant » à confirmer.* | Tirant gauche = DIN L ; tirant droit = DIN R | DIN L et DIN R présents dans le dossier | **à valider** |
| P-CFG-02 | Ouverture intérieure / extérieure<br>*Confirmé par le demandeur le 11/11/2026.* | Ouverture intérieure = variante « Int » ; extérieure = variante « Ext » | 32 positions (Int / Ext 001 à 012) | explicite |

### Dormant

| ID | Règle | Formule | Vérifiée sur | Statut |
|---|---|---|---|---|
| P-DOR-01 | Montant extérieur côté partie fixe | 32.851, L = H, coupe 135° - 135° | H = 2 170 et 2 500 | dérivée |
| P-DOR-02 | Montant extérieur côté porte | 32.800, L = Hd ; Int : D 90° - 135°, G 135° - 90° ; Ext : angles inversés | Hd = 2 170 | dérivée |
| P-DOR-03 | Montant extérieur en zone d’imposte (côté porte) | 32.851, L = T ; D 90° - 135°, G 135° - 90° | T = 330 | dérivée |
| P-DOR-04 | Traverse basse sous une partie fixe | 32.851, L = largeur de la partie latérale ; droite 90° - 135°, gauche 135° - 90° | L, R = 963,5 et 482 | dérivée |
| P-DOR-05 | Traverse haute sans imposte | Au-dessus de la porte : 32.800, L = Wd, 135° - 135° ; au-dessus d’une partie fixe : 32.851, L = largeur latérale (droite 135° - 90°, gauche 90° - 135°) | Wd = 1 073 et 2 036 | dérivée |
| P-DOR-06 | Traverse haute avec imposte | 32.851, L = W, 135° - 135° (une seule pièce) | W = 1 073 à 3 000 | dérivée |
| P-DOR-07 | Montant intermédiaire porte / partie fixe | Int : 32.803 ; Ext : 32.805 ; coupe L = Hd + 20 ; Int droite 90° - 135°, gauche 135° - 90° ; Ext droite 45° - 90°, gauche 90° - 45° ; sans imposte : longueur après délardage = Hd | Hd = 2 170 | dérivée |
| P-DOR-08 | Montant intermédiaire en zone d’imposte | 32.852, L = T − 50, 90° - 90° | T = 330 | dérivée |
| P-DOR-09 | Traverse d’imposte au-dessus de la porte | Int : 32.803, 135° - 135° ; Ext : 32.805, 45° - 45° ; coupe L = Wd + 40 ; délardage de 20 par extrémité appuyée sur le dormant extérieur | Wd = 1 073 et 2 036 ; 0, 1 ou 2 extrémités sur dormant | dérivée |
| P-DOR-10 | Traverse d’imposte au-dessus d’une partie fixe | 32.852, L = largeur latérale − 50, 90° - 90° | L, R = 963,5 et 482 | dérivée |

### Joints

| ID | Règle | Formule | Vérifiée sur | Statut |
|---|---|---|---|---|
| P-JNT-01 | Joint EPDM du dormant (905306) | 1,03 × (montant gauche + montant droit + traverse au-dessus de la porte) / 1 000, arrondi à 0,01 m ; montant = Hd (dormant) ou Hd + 20 (intermédiaire) ; traverse = Wd ou Wd + 40 (imposte) | 32 positions (Int / Ext 001 à 012) | dérivée |
| P-JNT-02 | Joint EPDM du vantail (905306) | 1,03 × (2 × hauteur vantail + largeur vantail) / 1 000 par vantail, arrondi à 0,01 m | vantail 993 × 2 120 | dérivée |
| P-JNT-03 | Joints de vitrage 905312 et 905317 | Chacun : 1,03 × 2 × (largeur clair + hauteur clair − 40) / 1 000 par champ, arrondi à 0,01 m | 7 tailles de champ différentes | dérivée |

### Vantail

| ID | Règle | Formule | Vérifiée sur | Statut |
|---|---|---|---|---|
| P-VAN-01 | Dimensions du vantail<br>*Largeur et hauteur de porte constantes dans le dossier : écarts vérifiés sur une seule valeur.* | Porte simple : largeur = Wd − 80 ; porte double : largeur = (Wd − 50) / 2 par vantail ; hauteur = Hd − 50 | Wd = 1 073 (simple), 2 036 (double), Hd = 2 170 | dérivée |
| P-VAN-02 | Montants et traverse haute du vantail<br>*Échange 32.803 ↔ 32.805 entre Int et Ext confirmé par le demandeur.* | Int : 32.805, 135° - 135° ; Ext : 32.803, 45° - 45° ; montants L = hauteur vantail, traverse haute L = largeur vantail | 32 positions (Int / Ext 001 à 012) | dérivée |
| P-VAN-03 | Traverse basse du vantail | 32.855, L = largeur vantail, 45° - 45° | 32 positions (Int / Ext 001 à 012) | dérivée |
| P-VAN-04 | Montant de battement (porte double) | Int : 32.803, 45° - 45° ; Ext : 32.805, 135° - 135° ; L = hauteur vantail ; après délardage = hauteur − 34 ; sur le montant D du 1er vantail si (Int et DIN L) ou (Ext et DIN R), sinon sur le montant G du 2e vantail | 16 portes doubles | dérivée |

### Vitrage

| ID | Règle | Formule | Vérifiée sur | Statut |
|---|---|---|---|---|
| P-VIT-01 | Clair de vitrage d’un vantail | Largeur = largeur vantail − 140 ; hauteur = hauteur vantail − 180 | vantail 993 × 2 120 | dérivée |
| P-VIT-02 | Champs fixes et leur clair | Un champ par colonne latérale en zone porte et, avec imposte, un champ par colonne en zone d’imposte ; largeur = largeur latérale − 50 (colonne fixe) ou Wd − 100 (au-dessus de la porte) ; hauteur = Hd − 140 (zone porte) ou T − 90 (zone d’imposte) | 32 positions (Int / Ext 001 à 012) | dérivée |
| P-VIT-03 | Parcloses (901335) | 4 par champ : 2 × hauteur clair (D, G) et 2 × largeur clair (B, H), coupe 90° - 90° | 32 positions (Int / Ext 001 à 012) | dérivée |
| P-VIT-04 | Dimensions du remplissage | (largeur clair − 16) × (hauteur clair + 24), arrondi au mm ; surface arrondie à 0,01 m² ; désignation source « Sans vitrage, 9 mm » | 7 tailles de champ différentes | dérivée |

### Quincaillerie

| ID | Règle | Formule | Vérifiée sur | Statut |
|---|---|---|---|---|
| P-QUI-01 | Paumelles à souder (907662) | 3 par vantail | 32 positions (Int / Ext 001 à 012) | dérivée |
| P-QUI-02 | Ferrures de porte | FFR019FND, FFR042FND, FFR046FND : 1 de chaque par porte | 32 positions (Int / Ext 001 à 012) | dérivée |
| P-QUI-03 | Ferrures de porte double | FFR045FND, FFR049FND, FFR050FND : 1 de chaque | 16 portes doubles | dérivée |

### Accessoires

| ID | Règle | Formule | Vérifiée sur | Statut |
|---|---|---|---|---|
| P-ACC-01 | Boutons autotaraudeurs (906579)<br>*Seul pas entier compatible avec les données ; la règle Forster réelle est à confirmer.* | Par champ : 2 × n(largeur clair) + 2 × n(hauteur clair), n(l) = max(3 ; ⌈l / 277⌉) | 7 tailles de champ | **à valider** |
| P-ACC-02 | Douilles d’écoulement (900100)<br>*⌈largeur / 400⌉ donne les mêmes résultats sur le dossier ; les deux formules diffèrent pour un multiple exact de 400.* | Par champ : ⌊largeur clair / 400⌋ + 1 (fixes comptés dans le dormant, vantaux dans la porte) | largeurs de clair 432 à 1 936 | **à valider** |
| P-ACC-03 | Pièces de remplissage 916320 / 916322 | Porte simple : 1 / 1 ; porte double DIN L : 3 / 2 ; DIN R : 2 / 3 | 32 positions (Int / Ext 001 à 012) | dérivée |
| P-ACC-04 | Pièces d’étanchéité de porte double | DIN L : 905703 × 2 ; DIN R : 905702 × 2 | 16 portes doubles | dérivée |

## Données non couvertes (règle métier à fournir)

| Sujet | Statut |
|---|---|
| Châssis fixe seul, composition personnalisée | Aucune donnée ; à ajouter plus tard (décision du 11/11/2026) |
| Vitrages et remplissages réels | Seul « Sans vitrage, 9 mm » figure dans le dossier, sans référence |
| Plinthe d'onglet 1060.2 (raccord au sol) | Citée en en-tête, sans référence ni quantité |
| Ferme-porte, anti-panique, autres serrures et poignées | Absents du dossier |
| Finitions, teintes, traitement de surface | Colonnes vides dans le dossier |
| Optimisation des barres (6 000 mm, lame 4 mm, chute d'extrémité 60 mm) | Paramètres connus ; l'optimisation n'est pas recalculée (longueurs nettes seulement) |
| Limites dimensionnelles | Non fournies : contrôle désactivé |
| Prix | Aucun tarif fourni |

## Points d'attention issus du dossier

- Les 32 positions portent l'avertissement forsterpro « Veuillez recalculer la nomenclature » ; le demandeur a confirmé le 11/11/2026 que **les quantités sont fiables**.
- La « Taille » affichée par forsterpro est arrondie (2 037 pour 2 036,5) : le calcul utilise les longueurs réelles.
- Chutes du récapitulatif ≠ fiches barres pour 32.852 (2 760 contre 2 756) et 901335 (9 538 contre 9 464). Les deux valeurs sont conservées dans les données importées.
