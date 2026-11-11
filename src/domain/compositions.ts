import type { CompositionType, Dimensions, Element, LeafCount } from '../types';

export type DimensionField = keyof Dimensions;

export interface CompositionDefinition {
  type: CompositionType;
  label: string;
  description: string;
  hasDoor: boolean;
  /** Allowed leaf counts; the first one is the default. */
  leafCounts: LeafCount[];
  hasTransom: boolean;
  hasLeftSide: boolean;
  hasRightSide: boolean;
  /** Whether material rules exist for this composition (see docs/calculation-rules.md). */
  rulesAvailable: boolean;
}

/**
 * Registry of compositions. Adding a composition = adding one entry here;
 * the form, the preview and the calculation read the flags instead of switching on the type.
 */
export const COMPOSITIONS: readonly CompositionDefinition[] = [
  { type: 'porte_simple', label: 'Porte simple', description: 'Porte 1 vantail', hasDoor: true, leafCounts: [1], hasTransom: false, hasLeftSide: false, hasRightSide: false, rulesAvailable: true },
  { type: 'porte_double', label: 'Porte double', description: 'Porte 2 vantaux', hasDoor: true, leafCounts: [2], hasTransom: false, hasLeftSide: false, hasRightSide: false, rulesAvailable: true },
  { type: 'chassis_fixe', label: 'Châssis fixe', description: 'Châssis vitré sans ouvrant', hasDoor: false, leafCounts: [1], hasTransom: false, hasLeftSide: false, hasRightSide: false, rulesAvailable: false },
  { type: 'porte_imposte', label: 'Porte avec imposte', description: 'Porte et imposte vitrée', hasDoor: true, leafCounts: [1, 2], hasTransom: true, hasLeftSide: false, hasRightSide: false, rulesAvailable: true },
  { type: 'porte_lateral_gauche', label: 'Porte avec partie latérale gauche', description: 'Partie fixe à gauche de la porte', hasDoor: true, leafCounts: [1, 2], hasTransom: false, hasLeftSide: true, hasRightSide: false, rulesAvailable: true },
  { type: 'porte_lateral_droite', label: 'Porte avec partie latérale droite', description: 'Partie fixe à droite de la porte', hasDoor: true, leafCounts: [1, 2], hasTransom: false, hasLeftSide: false, hasRightSide: true, rulesAvailable: true },
  { type: 'porte_deux_laterales', label: 'Porte avec deux parties latérales', description: 'Parties fixes de part et d’autre', hasDoor: true, leafCounts: [1, 2], hasTransom: false, hasLeftSide: true, hasRightSide: true, rulesAvailable: true },
  { type: 'porte_imposte_lateral_gauche', label: 'Porte avec imposte et partie latérale gauche', description: 'Imposte sur toute la largeur, fixe à gauche', hasDoor: true, leafCounts: [1, 2], hasTransom: true, hasLeftSide: true, hasRightSide: false, rulesAvailable: true },
  { type: 'porte_imposte_lateral_droite', label: 'Porte avec imposte et partie latérale droite', description: 'Imposte sur toute la largeur, fixe à droite', hasDoor: true, leafCounts: [1, 2], hasTransom: true, hasLeftSide: false, hasRightSide: true, rulesAvailable: true },
  { type: 'porte_imposte_laterales', label: 'Porte avec imposte et parties latérales', description: 'Imposte et deux parties fixes', hasDoor: true, leafCounts: [1, 2], hasTransom: true, hasLeftSide: true, hasRightSide: true, rulesAvailable: true },
  { type: 'personnalisee', label: 'Composition personnalisée', description: 'Assemblage libre (règles à fournir)', hasDoor: true, leafCounts: [1, 2], hasTransom: true, hasLeftSide: true, hasRightSide: true, rulesAvailable: false },
];

export function getComposition(type: CompositionType): CompositionDefinition {
  const def = COMPOSITIONS.find((c) => c.type === type);
  if (!def) throw new Error(`Composition inconnue : ${type}`);
  return def;
}

/** Dimension fields shown in the form for a given composition. */
export function visibleDimensionFields(type: CompositionType, leafCount: LeafCount): DimensionField[] {
  const def = getComposition(type);
  const fields: DimensionField[] = ['totalWidth', 'totalHeight'];
  if (def.hasDoor) fields.push('mainLeafWidth');
  if (def.hasDoor && leafCount === 2) fields.push('secondaryLeafWidth');
  if (def.hasDoor) fields.push('floorGap');
  if (def.hasTransom) fields.push('transomHeight');
  if (def.hasLeftSide) fields.push('leftSideWidth');
  if (def.hasRightSide) fields.push('rightSideWidth');
  return fields;
}

export const DIMENSION_LABELS: Record<DimensionField, string> = {
  totalWidth: 'Largeur totale',
  totalHeight: 'Hauteur totale',
  mainLeafWidth: 'Largeur du vantail principal',
  secondaryLeafWidth: 'Largeur du vantail secondaire',
  transomHeight: 'Hauteur de l’imposte',
  floorGap: 'Jeu sous porte (sol fini)',
  leftSideWidth: 'Largeur de la partie latérale gauche',
  rightSideWidth: 'Largeur de la partie latérale droite',
};

/** Dimensions computed by the application (read-only in the form). */
export const DERIVED_DIMENSION_FIELDS: readonly DimensionField[] = ['mainLeafWidth', 'secondaryLeafWidth'];

/**
 * Splits a composition into its elements (used by the preview and the summary).
 * Purely geometric: no Forster rule is applied here.
 */
export function buildElements(type: CompositionType, dims: Dimensions): Element[] {
  const def = getComposition(type);
  const left = def.hasLeftSide ? (dims.leftSideWidth ?? 0) : 0;
  const right = def.hasRightSide ? (dims.rightSideWidth ?? 0) : 0;
  const transom = def.hasTransom ? (dims.transomHeight ?? 0) : 0;
  const centreWidth = Math.max(dims.totalWidth - left - right, 0);
  const lowerHeight = Math.max(dims.totalHeight - transom, 0);
  const elements: Element[] = [
    { id: 'dormant', kind: 'dormant', column: 'centre', row: 'bas', widthMm: dims.totalWidth, heightMm: dims.totalHeight },
  ];
  if (def.hasLeftSide) elements.push({ id: 'lat-g', kind: 'fixe_lateral', column: 'gauche', row: 'bas', widthMm: left, heightMm: lowerHeight });
  elements.push({
    id: 'centre',
    kind: def.hasDoor ? 'porte' : 'fixe_lateral',
    column: 'centre',
    row: 'bas',
    widthMm: centreWidth,
    heightMm: lowerHeight,
  });
  if (def.hasRightSide) elements.push({ id: 'lat-d', kind: 'fixe_lateral', column: 'droite', row: 'bas', widthMm: right, heightMm: lowerHeight });
  if (def.hasTransom && transom > 0) {
    if (def.hasLeftSide) elements.push({ id: 'imp-g', kind: 'imposte', column: 'gauche', row: 'haut', widthMm: left, heightMm: transom });
    elements.push({ id: 'imp-c', kind: 'imposte', column: 'centre', row: 'haut', widthMm: centreWidth, heightMm: transom });
    if (def.hasRightSide) elements.push({ id: 'imp-d', kind: 'imposte', column: 'droite', row: 'haut', widthMm: right, heightMm: transom });
  }
  return elements;
}
