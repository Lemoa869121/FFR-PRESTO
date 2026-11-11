import type { CompositionType, Dimensions, Element, LeafCount } from '../types';


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

export type DimensionField = Exclude<keyof Dimensions, 'sizingMode'>;

export interface DimensionFieldSpec {
  field: DimensionField;
  /** false = value computed by the application (shown read-only). */
  editable: boolean;
}

/**
 * Dimension fields shown in the form for a composition, in display order.
 * Doors with a fixed part are sized by their clear passage; a double door alone by
 * its total width or its clear passage (dims.sizingMode).
 */
export function dimensionFieldSpecs(type: CompositionType, leafCount: LeafCount, dims: Pick<Dimensions, 'sizingMode'> = {}): DimensionFieldSpec[] {
  const def = getComposition(type);
  const hasSide = def.hasLeftSide || def.hasRightSide;
  const byPassage = def.hasDoor && (hasSide || (leafCount === 2 && dims.sizingMode === 'passage_libre'));
  const specs: DimensionFieldSpec[] = [
    { field: 'totalWidth', editable: !(def.hasDoor && !hasSide && byPassage) },
    { field: 'totalHeight', editable: true },
  ];
  if (def.hasDoor) {
    specs.push({ field: 'clearPassage', editable: byPassage });
    if (leafCount === 2) specs.push({ field: 'activeClearPassage', editable: true });
    specs.push({ field: 'mainLeafWidth', editable: false });
    if (leafCount === 2) specs.push({ field: 'secondaryLeafWidth', editable: false });
    specs.push({ field: 'floorGap', editable: true });
  }
  if (def.hasTransom) specs.push({ field: 'transomHeight', editable: true });
  if (def.hasLeftSide) specs.push({ field: 'leftSideWidth', editable: !def.hasDoor });
  if (def.hasRightSide) specs.push({ field: 'rightSideWidth', editable: !def.hasDoor });
  return specs;
}

/** Dimension fields shown in the form for a given composition. */
export function visibleDimensionFields(type: CompositionType, leafCount: LeafCount, dims: Pick<Dimensions, 'sizingMode'> = {}): DimensionField[] {
  return dimensionFieldSpecs(type, leafCount, dims).map((s) => s.field);
}

export const DIMENSION_LABELS: Record<DimensionField, string> = {
  totalWidth: 'Largeur totale',
  totalHeight: 'Hauteur totale',
  clearPassage: 'Passage libre (vantaux ouverts à 90°)',
  activeClearPassage: 'Passage libre du vantail principal',
  mainLeafWidth: 'Largeur du vantail principal',
  secondaryLeafWidth: 'Largeur du vantail secondaire',
  transomHeight: 'Hauteur de l’imposte',
  floorGap: 'Jeu sous porte (sol fini)',
  leftSideWidth: 'Largeur de la partie latérale gauche',
  rightSideWidth: 'Largeur de la partie latérale droite',
};


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
