import type { RuleStatus } from '../../types';

/**
 * Cutting / quantity rules of the Forster Presto system.
 *
 * Sources:
 * - forsterpro manufacturing file "FFR Presto" (32 positions, data/sources/ffr-presto):
 *   results, not formulas — rules are DERIVED from them and checked by the test suite
 *   against all 32 positions (src/tests/prestoRules.test.ts);
 * - Forster presto processing manual 918301, edition 01/2021 (VP page codes): rules or
 *   values written explicitly are marked "explicite" with their page.
 * Rules that several formulas explain equally well, or that rely on an unusual
 * constant, are "a_valider".
 *
 * Notation: W total width, H total height, L / R left / right fixed part width,
 * T transom height, Wd = W − L − R (door frame width), Hd = H − T (door zone height).
 */
export interface PrestoRule {
  id: string;
  domain: 'Configuration' | 'Dormant' | 'Vantail' | 'Vitrage' | 'Quincaillerie' | 'Accessoires' | 'Joints' | 'Contrôles';
  title: string;
  formula: string;
  status: Extract<RuleStatus, 'derivee' | 'a_valider' | 'explicite'>;
  /** Values of the parameters actually observed in the source document. */
  observedOn: string;
  note?: string;
  /** Documents supporting the rule (manual page codes, FFR Presto file). */
  sources?: string[];
}

const ALL = '32 positions (Int / Ext 001 à 012)';

export const PRESTO_RULES: readonly PrestoRule[] = [
  { id: 'P-CFG-01', domain: 'Configuration', title: 'Sens d’ouverture DIN', formula: 'Saisi directement : DIN gauche (DIN L) ou DIN droite (DIN R)', status: 'explicite', observedOn: 'DIN L et DIN R présents dans le dossier', note: 'Vocabulaire Forster « Sens d’ouverture DIN L / R » ; saisie en DIN gauche / DIN droite (demande du 11/11/2026).', sources: ['Dossier FFR Presto (32 positions)', 'Guide presto VP 3.6.10 (p. 276)'] },
  { id: 'P-CFG-03', domain: 'Configuration', title: 'Jeu sous porte (sol fini)', formula: 'Paramètre saisi ; 10 mm par défaut', status: 'explicite', observedOn: '10 mm dans le dossier', note: 'Cote « variable » sur les plans du système ; « Jeu de porte : 10 mm » dans le dossier.', sources: ['Guide presto VP 3.5.32 (p. 242)', 'Dossier FFR Presto (32 positions)'] },
  { id: 'P-CFG-02', domain: 'Configuration', title: 'Ouverture intérieure / extérieure', formula: 'Ouverture intérieure = variante « Int » ; extérieure = variante « Ext »', status: 'explicite', observedOn: ALL, note: 'Confirmé par le demandeur le 11/11/2026.' },

  { id: 'P-PL-01', domain: 'Configuration', title: 'Passage libre ↔ passage dormant', formula: 'Passage libre (vantaux à 90°) = Wd − 2 × 70 − 33 × nombre de vantaux ; porte simple Wd = PL + 173, porte double Wd = PL + 206', status: 'derivee', observedOn: 'PL(90°) 900 pour Wd 1 073 ; 1 830 pour Wd 2 036', note: 'Annotations « PL(90°) » des croquis du dossier ; face du dormant 70 mm.', sources: ['Dossier FFR Presto (croquis, ex. p. 1 et 35)', 'Guide presto VP 3.5.33 (p. 243)'] },
  { id: 'P-PL-02', domain: 'Configuration', title: 'Passage libre du vantail principal', formula: 'Vantail principal = passage libre du vantail + 93', status: 'derivee', observedOn: 'PL(90°) 900 pour un vantail de 993 (portes simples et doubles)', sources: ['Dossier FFR Presto (croquis)'] },
  { id: 'P-PL-03', domain: 'Configuration', title: 'Passage libre en hauteur', formula: 'PLD = Hd − 70', status: 'derivee', observedOn: 'PLD 2 100 pour Hd 2 170', sources: ['Dossier FFR Presto (croquis)'] },
  { id: 'P-PL-04', domain: 'Configuration', title: 'Unités de passage normalisées', formula: '1 UP = 900 mm ; 2 UP = 1 400 mm (900 + 500) ; 3 UP = 1 800 mm', status: 'explicite', observedOn: '—', note: 'Valeurs données par le demandeur le 11/11/2026 ; proposées dans le formulaire.' },
  { id: 'P-DOR-01', domain: 'Dormant', title: 'Montant extérieur côté partie fixe', formula: '32.851, L = H, coupe 135° - 135°', status: 'derivee', observedOn: 'H = 2 170 et 2 500' },
  { id: 'P-DOR-02', domain: 'Dormant', title: 'Montant extérieur côté porte', formula: '32.800, L = Hd ; Int : D 90° - 135°, G 135° - 90° ; Ext : angles inversés', status: 'derivee', observedOn: 'Hd = 2 170' },
  { id: 'P-DOR-03', domain: 'Dormant', title: 'Montant extérieur en zone d’imposte (côté porte)', formula: '32.851, L = T ; D 90° - 135°, G 135° - 90°', status: 'derivee', observedOn: 'T = 330' },
  { id: 'P-DOR-04', domain: 'Dormant', title: 'Traverse basse sous une partie fixe', formula: '32.851, L = largeur de la partie latérale ; droite 90° - 135°, gauche 135° - 90°', status: 'derivee', observedOn: 'L, R = 963,5 et 482' },
  { id: 'P-DOR-05', domain: 'Dormant', title: 'Traverse haute sans imposte', formula: 'Au-dessus de la porte : 32.800, L = Wd, 135° - 135° ; au-dessus d’une partie fixe : 32.851, L = largeur latérale (droite 135° - 90°, gauche 90° - 135°)', status: 'derivee', observedOn: 'Wd = 1 073 et 2 036' },
  { id: 'P-DOR-06', domain: 'Dormant', title: 'Traverse haute avec imposte', formula: '32.851, L = W, 135° - 135° (une seule pièce)', status: 'derivee', observedOn: 'W = 1 073 à 3 000' },
  { id: 'P-DOR-07', domain: 'Dormant', title: 'Montant intermédiaire porte / partie fixe', formula: 'Int : 32.803 ; Ext : 32.805 ; coupe L = Hd + 20 ; Int droite 90° - 135°, gauche 135° - 90° ; Ext droite 45° - 90°, gauche 90° - 45° ; sans imposte : longueur après délardage = Hd', status: 'derivee', observedOn: 'Hd = 2 170' },
  { id: 'P-DOR-08', domain: 'Dormant', title: 'Montant intermédiaire en zone d’imposte', formula: '32.852, L = T − 50, 90° - 90°', status: 'derivee', observedOn: 'T = 330' },
  { id: 'P-DOR-09', domain: 'Dormant', title: 'Traverse d’imposte au-dessus de la porte', formula: 'Int : 32.803, 135° - 135° ; Ext : 32.805, 45° - 45° ; coupe L = Wd + 40 ; délardage de 20 par extrémité appuyée sur le dormant extérieur', status: 'derivee', observedOn: 'Wd = 1 073 et 2 036 ; 0, 1 ou 2 extrémités sur dormant' },
  { id: 'P-DOR-10', domain: 'Dormant', title: 'Traverse d’imposte au-dessus d’une partie fixe', formula: '32.852, L = largeur latérale − 50, 90° - 90°', status: 'derivee', observedOn: 'L, R = 963,5 et 482' },

  { id: 'P-JNT-01', domain: 'Joints', title: 'Joint EPDM du dormant (905306)', formula: '1,03 × (montant gauche + montant droit + traverse au-dessus de la porte) / 1 000, arrondi à 0,01 m ; montant = Hd (dormant) ou Hd + 20 (intermédiaire) ; traverse = Wd ou Wd + 40 (imposte)', status: 'derivee', observedOn: ALL },
  { id: 'P-JNT-02', domain: 'Joints', title: 'Joint EPDM du vantail (905306)', formula: '1,03 × (2 × hauteur vantail + largeur vantail) / 1 000 par vantail, arrondi à 0,01 m', status: 'derivee', observedOn: 'vantail 993 × 2 120' },
  { id: 'P-JNT-03', domain: 'Joints', title: 'Joints de vitrage 905312 et 905317', formula: 'Chacun : 1,03 × 2 × (largeur clair + hauteur clair − 40) / 1 000 par champ, arrondi à 0,01 m', status: 'derivee', observedOn: '7 tailles de champ différentes' },

  { id: 'P-VAN-01', domain: 'Vantail', title: 'Dimensions du vantail', formula: 'Hauteur = Hd − (36 + 4) − jeu sous porte ; porte simple : largeur = Wd − 2 × (36 + 4)', status: 'explicite', observedOn: 'Wd = 1 073, Hd = 2 170, jeu 10 (dossier)', note: 'Recouvrement du dormant 36 mm et jeu de feuillure 4 mm en tête et en montants (coupes B-B et C-C).', sources: ['Guide presto VP 3.5.32 (p. 242)', 'Guide presto VP 3.5.33 (p. 243)', 'Dossier FFR Presto (32 positions)'] },
  { id: 'P-VAN-05', domain: 'Vantail', title: 'Largeur des vantaux d’une porte double', formula: 'Vantail principal + vantail semi-fixe = Wd − 50 ; vantaux égaux par défaut, sinon vantail principal selon P-PL-02', status: 'derivee', observedOn: 'Wd = 2 036, vantaux égaux', note: 'Recouvrement au battement non coté lisiblement dans le guide (VP 3.5.36).', sources: ['Dossier FFR Presto (32 positions)'] },
  { id: 'P-VAN-02', domain: 'Vantail', title: 'Montants et traverse haute du vantail', formula: 'Int : 32.805, 135° - 135° ; Ext : 32.803, 45° - 45° ; montants L = hauteur vantail, traverse haute L = largeur vantail', status: 'derivee', observedOn: ALL, note: 'Échange 32.803 ↔ 32.805 entre Int et Ext confirmé par le demandeur.' },
  { id: 'P-VAN-03', domain: 'Vantail', title: 'Traverse basse du vantail', formula: '32.855, L = largeur vantail, 45° - 45°', status: 'derivee', observedOn: ALL },
  { id: 'P-VAN-04', domain: 'Vantail', title: 'Montant de battement (porte double)', formula: 'Int : 32.803, 45° - 45° ; Ext : 32.805, 135° - 135° ; L = hauteur vantail ; après délardage = hauteur − 34 ; sur le montant D du 1er vantail si (Int et DIN L) ou (Ext et DIN R), sinon sur le montant G du 2e vantail', status: 'derivee', observedOn: '16 portes doubles', note: 'Cote de 34 mm au battement confirmée par le guide.', sources: ['Guide presto VP 3.6.10 (p. 276)', 'Dossier FFR Presto (32 positions)'] },

  { id: 'P-VIT-01', domain: 'Vitrage', title: 'Clair de vitrage d’un vantail', formula: 'Largeur = largeur vantail − 140 ; hauteur = hauteur vantail − 180', status: 'derivee', observedOn: 'vantail 993 × 2 120' },
  { id: 'P-VIT-02', domain: 'Vitrage', title: 'Champs fixes et leur clair', formula: 'Un champ par colonne latérale en zone porte et, avec imposte, un champ par colonne en zone d’imposte ; largeur = largeur latérale − 50 (colonne fixe) ou Wd − 100 (au-dessus de la porte) ; hauteur = Hd − 140 (zone porte) ou T − 90 (zone d’imposte)', status: 'derivee', observedOn: ALL },
  { id: 'P-VIT-03', domain: 'Vitrage', title: 'Parcloses (901335)', formula: '4 par champ : 2 × hauteur clair (D, G) et 2 × largeur clair (B, H), coupe 90° - 90°', status: 'derivee', observedOn: ALL },
  { id: 'P-VIT-04', domain: 'Vitrage', title: 'Dimensions du remplissage', formula: '(largeur clair − 16) × (hauteur clair + 24), arrondi au mm ; surface arrondie à 0,01 m² ; désignation source « Sans vitrage, 9 mm »', status: 'derivee', observedOn: '7 tailles de champ différentes' },

  { id: 'P-QUI-01', domain: 'Quincaillerie', title: 'Paumelles à souder (907662)', formula: '3 par vantail', status: 'derivee', observedOn: ALL },
  { id: 'P-QUI-02', domain: 'Quincaillerie', title: 'Ferrures de porte', formula: 'FFR019FND, FFR042FND, FFR046FND : 1 de chaque par porte', status: 'derivee', observedOn: ALL },
  { id: 'P-QUI-03', domain: 'Quincaillerie', title: 'Ferrures de porte double', formula: 'FFR045FND, FFR049FND, FFR050FND : 1 de chaque', status: 'derivee', observedOn: '16 portes doubles' },

  { id: 'P-ACC-01', domain: 'Accessoires', title: 'Boutons autotaraudeurs (906579)', formula: 'Par champ : 2 × n(largeur clair) + 2 × n(hauteur clair), n(l) = max(3 ; ⌈l / 277⌉)', status: 'a_valider', observedOn: '7 tailles de champ', note: 'Le guide impose au plus 70 mm des extrémités et 300 mm d’entraxe : les quantités du dossier respectent ce minimum mais en posent davantage ; la répartition exacte de forsterpro n’est pas décrite.', sources: ['Guide presto VP 3.6.14 (p. 280)', 'Dossier FFR Presto (32 positions)'] },
  { id: 'P-ACC-02', domain: 'Accessoires', title: 'Douilles d’écoulement (900100)', formula: 'Par champ : ⌊largeur clair / 400⌋ + 1 (fixes comptés dans le dormant, vantaux dans la porte)', status: 'a_valider', observedOn: 'largeurs de clair 432 à 1 936', note: '⌈largeur / 400⌉ donne les mêmes résultats sur le dossier ; les deux formules diffèrent pour un multiple exact de 400.' },
  { id: 'P-ACC-03', domain: 'Accessoires', title: 'Pièces de remplissage 916320 / 916322', formula: 'Porte simple : 1 / 1 ; porte double DIN L : 3 / 2 ; DIN R : 2 / 3', status: 'derivee', observedOn: ALL, note: 'Emplacements décrits par le guide ; quantités tirées du dossier.', sources: ['Guide presto VP 3.6.10 (p. 276)', 'Dossier FFR Presto (32 positions)'] },
  { id: 'P-ACC-04', domain: 'Accessoires', title: 'Pièces d’étanchéité de porte double', formula: 'DIN L : 905703 × 2 ; DIN R : 905702 × 2', status: 'explicite', observedOn: '16 portes doubles', note: 'Correspondance DIN écrite dans le guide (« Dichtungsstück oben, DIN links 905703 / DIN rechts 905702 ») ; quantité 2 tirée du dossier.', sources: ['Guide presto VP 3.4.9 (p. 203)', 'Dossier FFR Presto (32 positions)'] },

  { id: 'P-CTL-01', domain: 'Contrôles', title: 'Dimension minimale', formula: 'Dormant et vantail ≥ 120 mm (bloquant)', status: 'explicite', observedOn: '—', sources: ['Guide presto VP 3.1.1 (p. 53)'] },
  { id: 'P-CTL-02', domain: 'Contrôles', title: 'Charge admissible des paumelles 907662', formula: 'Table H 1 800 à 3 000 × B 600 à 1 400 mm ; hors table : alerte', status: 'explicite', observedOn: '—', note: 'Le poids du vantail n’est pas calculé tant que le remplissage n’est pas défini.', sources: ['Guide presto VP 3.3.114 (p. 178)'] },
  { id: 'P-CTL-03', domain: 'Contrôles', title: 'Tolérances de coupe', formula: 'Dormant +1 / −0 mm ; vantail +0 / −1 mm', status: 'explicite', observedOn: '—', sources: ['Guide presto VP 1.3.3 (p. 27)'] },
  { id: 'P-CTL-04', domain: 'Contrôles', title: 'Poids des profilés et longueur de barre', formula: 'Poids = kg/m × longueur × quantité ; barres de 6 000 mm', status: 'explicite', observedOn: '7 références', note: 'Hors joints, remplissage et quincaillerie.', sources: ['Guide presto VP 3.2.1, 3.2.2, 3.2.4 (p. 59, 60, 62)'] },
];

export function getRule(id: string): PrestoRule {
  const rule = PRESTO_RULES.find((r) => r.id === id);
  if (!rule) throw new Error(`Règle inconnue : ${id}`);
  return rule;
}
