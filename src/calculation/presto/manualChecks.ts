import type { ValidationWarning } from '../../types';
import { HINGE_907662_LOADS, MIN_FRAME_OR_LEAF_MM, STUD_SPACING } from '../../data/sources/presto-manual/manual';
import { formatMm } from '../../utils/format';
import type { PrestoBom } from './types';

const vp = (r: { vp: string; pdfPage: number }) => `guide de mise en œuvre presto, ${r.vp}, p. ${r.pdfPage}`;

/**
 * Conservative permissible load for a leaf, read in the 907662 table: next tabulated
 * height BELOW the leaf height and next tabulated width ABOVE the leaf width (both give
 * lower loads in this table). Returns null outside the table.
 */
export function hingeLoadFor(leafWidth: number, leafHeight: number): number | null {
  const t = HINGE_907662_LOADS;
  const hMin = t.heights[0] ?? 0;
  const hMax = t.heights[t.heights.length - 1] ?? 0;
  const wMin = t.widths[0] ?? 0;
  const wMax = t.widths[t.widths.length - 1] ?? 0;
  if (leafHeight < hMin || leafHeight > hMax || leafWidth < wMin || leafWidth > wMax) return null;
  let row = 0;
  t.heights.forEach((h, i) => { if (h <= leafHeight) row = i; });
  const col = t.widths.findIndex((w) => w >= leafWidth);
  return t.loads[row]?.[col] ?? null;
}

/** Minimum number of studs on one glazing-bead side according to the spacing rule. */
export function minStudsPerSide(lengthMm: number): number {
  const inner = Math.max(lengthMm - 2 * STUD_SPACING.maxFromEndMm, 0);
  return Math.ceil(inner / STUD_SPACING.maxSpacingMm) + 1;
}

/** Checks of a generated composition against the explicit limits of the manual. */
export function manualChecks(bom: PrestoBom): ValidationWarning[] {
  const warnings: ValidationWarning[] = [];
  const { config, geometry } = bom;
  const min = MIN_FRAME_OR_LEAF_MM.value;
  const tooSmall = [
    ['largeur totale', config.totalWidth], ['hauteur totale', config.totalHeight],
    ['largeur de vantail', geometry.leafWidth], ['hauteur de vantail', geometry.leafHeight],
  ].filter(([, v]) => (v as number) < min);
  if (tooSmall.length > 0) {
    warnings.push({
      code: 'MANUAL_MIN_SIZE',
      level: 'bloquant',
      message: `Dimension inférieure au minimum de ${min} mm (${vp(MIN_FRAME_OR_LEAF_MM.source)}) : ${tooSmall.map(([l, v]) => `${l} ${formatMm(v as number)}`).join(', ')}.`,
    });
  }
  const load = hingeLoadFor(geometry.leafWidth, geometry.leafHeight);
  if (load === null) {
    warnings.push({
      code: 'HINGE_TABLE_OUT_OF_RANGE',
      level: 'attention',
      message: `Vantail ${formatMm(geometry.leafWidth)} × ${formatMm(geometry.leafHeight)} hors de la table de charges des paumelles 907662 (largeur 600 à 1 400 mm, hauteur 1 800 à 3 000 mm, ${vp(HINGE_907662_LOADS.source)}) : charge admissible non garantie.`,
    });
  } else {
    warnings.push({
      code: 'HINGE_LOAD',
      level: 'info',
      message: `Charge admissible des paumelles 907662 pour ce vantail : ${load} kg (${vp(HINGE_907662_LOADS.source)}, valeur de la case inférieure la plus proche). Poids du vantail non calculé : remplissage non défini.`,
    });
  }
  return warnings;
}
