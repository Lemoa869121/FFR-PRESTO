import type { RuleStatus } from '../../types';

/**
 * Cutting / quantity rules of the Forster Presto system.
 *
 * Source: forsterpro manufacturing file "FFR Presto" (32 positions, see
 * data/sources/ffr-presto). The file contains results, not formulas: every rule
 * below was DERIVED from those results and is checked by the test suite against
 * all 32 positions (src/tests/prestoRules.test.ts). Rules that several formulas
 * explain equally well, or that rely on an unusual constant, are "a_valider".
 *
 * Notation: W total width, H total height, L / R left / right fixed part width,
 * T transom height, Wd = W − L − R (door frame width), Hd = H − T (door zone height).
 */
export interface PrestoRule {
  id: string;
  domain: 'Configuration' | 'Dormant' | 'Vantail' | 'Vitrage' | 'Quincaillerie' | 'Accessoires' | 'Joints';
  title: string;
  formula: string;
  status: Extract<RuleStatus, 'derivee' | 'a_valider' | 'explicite'>;
  /** Values of the parameters actually observed in the source document. */
  observedOn: string;
  note?: string;
}

const ALL = '32 positions (Int / Ext 001 à 012)';

export const PRESTO_RULES: readonly PrestoRule[] = [
  { id: 'P-CFG-01', domain: 'Configuration', title: 'Correspondance tirant ↔ DIN', formula: 'Tirant gauche = DIN L ; tirant droit = DIN R', status: 'a_valider', observedOn: 'DIN L et DIN R présents dans le dossier', note: 'Libellés forsterpro « Sens d’ouverture DIN L / R » ; correspondance avec le vocabulaire « tirant » à confirmer.' },
  { id: 'P-CFG-02', domain: 'Configuration', title: 'Ouverture intérieure / extérieure', formula: 'Ouverture intérieure = variante « Int » ; extérieure = variante « Ext »', status: 'explicite', observedOn: ALL, note: 'Confirmé par le demandeur le 11/11/2026.' },

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

  { id: 'P-VAN-01', domain: 'Vantail', title: 'Dimensions du vantail', formula: 'Porte simple : largeur = Wd − 80 ; porte double : largeur = (Wd − 50) / 2 par vantail ; hauteur = Hd − 50', status: 'derivee', observedOn: 'Wd = 1 073 (simple), 2 036 (double), Hd = 2 170', note: 'Largeur et hauteur de porte constantes dans le dossier : écarts vérifiés sur une seule valeur.' },
  { id: 'P-VAN-02', domain: 'Vantail', title: 'Montants et traverse haute du vantail', formula: 'Int : 32.805, 135° - 135° ; Ext : 32.803, 45° - 45° ; montants L = hauteur vantail, traverse haute L = largeur vantail', status: 'derivee', observedOn: ALL, note: 'Échange 32.803 ↔ 32.805 entre Int et Ext confirmé par le demandeur.' },
  { id: 'P-VAN-03', domain: 'Vantail', title: 'Traverse basse du vantail', formula: '32.855, L = largeur vantail, 45° - 45°', status: 'derivee', observedOn: ALL },
  { id: 'P-VAN-04', domain: 'Vantail', title: 'Montant de battement (porte double)', formula: 'Int : 32.803, 45° - 45° ; Ext : 32.805, 135° - 135° ; L = hauteur vantail ; après délardage = hauteur − 34 ; sur le montant D du 1er vantail si (Int et DIN L) ou (Ext et DIN R), sinon sur le montant G du 2e vantail', status: 'derivee', observedOn: '16 portes doubles' },

  { id: 'P-VIT-01', domain: 'Vitrage', title: 'Clair de vitrage d’un vantail', formula: 'Largeur = largeur vantail − 140 ; hauteur = hauteur vantail − 180', status: 'derivee', observedOn: 'vantail 993 × 2 120' },
  { id: 'P-VIT-02', domain: 'Vitrage', title: 'Champs fixes et leur clair', formula: 'Un champ par colonne latérale en zone porte et, avec imposte, un champ par colonne en zone d’imposte ; largeur = largeur latérale − 50 (colonne fixe) ou Wd − 100 (au-dessus de la porte) ; hauteur = Hd − 140 (zone porte) ou T − 90 (zone d’imposte)', status: 'derivee', observedOn: ALL },
  { id: 'P-VIT-03', domain: 'Vitrage', title: 'Parcloses (901335)', formula: '4 par champ : 2 × hauteur clair (D, G) et 2 × largeur clair (B, H), coupe 90° - 90°', status: 'derivee', observedOn: ALL },
  { id: 'P-VIT-04', domain: 'Vitrage', title: 'Dimensions du remplissage', formula: '(largeur clair − 16) × (hauteur clair + 24), arrondi au mm ; surface arrondie à 0,01 m² ; désignation source « Sans vitrage, 9 mm »', status: 'derivee', observedOn: '7 tailles de champ différentes' },

  { id: 'P-QUI-01', domain: 'Quincaillerie', title: 'Paumelles à souder (907662)', formula: '3 par vantail', status: 'derivee', observedOn: ALL },
  { id: 'P-QUI-02', domain: 'Quincaillerie', title: 'Ferrures de porte', formula: 'FFR019FND, FFR042FND, FFR046FND : 1 de chaque par porte', status: 'derivee', observedOn: ALL },
  { id: 'P-QUI-03', domain: 'Quincaillerie', title: 'Ferrures de porte double', formula: 'FFR045FND, FFR049FND, FFR050FND : 1 de chaque', status: 'derivee', observedOn: '16 portes doubles' },

  { id: 'P-ACC-01', domain: 'Accessoires', title: 'Boutons autotaraudeurs (906579)', formula: 'Par champ : 2 × n(largeur clair) + 2 × n(hauteur clair), n(l) = max(3 ; ⌈l / 277⌉)', status: 'a_valider', observedOn: '7 tailles de champ', note: 'Seul pas entier compatible avec les données ; la règle Forster réelle est à confirmer.' },
  { id: 'P-ACC-02', domain: 'Accessoires', title: 'Douilles d’écoulement (900100)', formula: 'Par champ : ⌊largeur clair / 400⌋ + 1 (fixes comptés dans le dormant, vantaux dans la porte)', status: 'a_valider', observedOn: 'largeurs de clair 432 à 1 936', note: '⌈largeur / 400⌉ donne les mêmes résultats sur le dossier ; les deux formules diffèrent pour un multiple exact de 400.' },
  { id: 'P-ACC-03', domain: 'Accessoires', title: 'Pièces de remplissage 916320 / 916322', formula: 'Porte simple : 1 / 1 ; porte double DIN L : 3 / 2 ; DIN R : 2 / 3', status: 'derivee', observedOn: ALL },
  { id: 'P-ACC-04', domain: 'Accessoires', title: 'Pièces d’étanchéité de porte double', formula: 'DIN L : 905703 × 2 ; DIN R : 905702 × 2', status: 'derivee', observedOn: '16 portes doubles' },
];

export function getRule(id: string): PrestoRule {
  const rule = PRESTO_RULES.find((r) => r.id === id);
  if (!rule) throw new Error(`Règle inconnue : ${id}`);
  return rule;
}
