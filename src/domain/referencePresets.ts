import type { CompositionType, Dimensions, Handing, LeafCount, OpeningSide } from '../types';
import { REFERENCE_POSITIONS, type ReferencePosition } from '../calculation/presto/referencePositions';
import { COMPOSITIONS } from './compositions';
import { clearPassageFromFrame } from '../calculation/presto/clearPassage';

export interface ReferencePreset {
  id: string;
  label: string;
  pdfPage: number;
  compositionType: CompositionType;
  leafCount: LeafCount;
  dimensions: Dimensions;
  openingSide: OpeningSide;
  handing: Handing;
}

/** Finds the composition whose flags match the parts present in a reference position. */
export function compositionForPosition(p: ReferencePosition): CompositionType {
  const hasLeft = p.config.leftSideWidth > 0;
  const hasRight = p.config.rightSideWidth > 0;
  const hasTransom = p.config.transomHeight > 0;
  const single = !hasLeft && !hasRight && !hasTransom;
  if (single) return p.config.leafCount === 2 ? 'porte_double' : 'porte_simple';
  const def = COMPOSITIONS.find((c) => c.rulesAvailable && c.hasDoor && c.leafCounts.length > 1 &&
    c.hasLeftSide === hasLeft && c.hasRightSide === hasRight && c.hasTransom === hasTransom);
  if (!def) throw new Error(`Aucune composition pour ${p.id}`);
  return def.type;
}

/** The 32 positions of the FFR Presto file, ready to pre-fill the form. */
export const REFERENCE_PRESETS: readonly ReferencePreset[] = REFERENCE_POSITIONS.map((p) => {
  const type = compositionForPosition(p);
  const c = p.config;
  return {
    id: p.id,
    pdfPage: p.pdfPage,
    label: `${p.id} — ${COMPOSITIONS.find((d) => d.type === type)?.label ?? type}${c.leafCount === 2 && type !== 'porte_double' ? ' (2 vantaux)' : ''} — ${p.sizeRaw}`,
    compositionType: type,
    leafCount: c.leafCount,
    dimensions: {
      totalWidth: c.totalWidth,
      totalHeight: c.totalHeight,
      floorGap: c.floorGap,
      clearPassage: clearPassageFromFrame(c.totalWidth - c.leftSideWidth - c.rightSideWidth, c.leafCount),
      ...(c.leafCount === 2 ? { activeClearPassage: 900, sizingMode: 'largeur_totale' as const } : {}),
      ...(c.transomHeight > 0 ? { transomHeight: c.transomHeight } : {}),
      ...(c.leftSideWidth > 0 ? { leftSideWidth: c.leftSideWidth } : {}),
      ...(c.rightSideWidth > 0 ? { rightSideWidth: c.rightSideWidth } : {}),
    },
    openingSide: c.openingSide,
    handing: c.din === 'R' ? 'din_droite' : 'din_gauche',
  };
});

/** Default values taken from the file when a field appears (labelled as such in the form). */
export function referenceDefault(field: 'transomHeight' | 'leftSideWidth' | 'rightSideWidth', leafCount: LeafCount): number {
  if (field === 'transomHeight') return 330;
  return leafCount === 2 ? 482 : 963.5;
}
