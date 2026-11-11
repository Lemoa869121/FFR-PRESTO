import type { ValidationWarning } from '../../types';
import { getComposition } from '../../domain/compositions';
import { resolveDoorSizing } from '../../domain/doorSizing';
import type { CalculationInput } from '../types';
import type { PrestoConfig } from './types';
import { OBSERVED_DOMAIN, REFERENCE_FLOOR_GAP } from './referencePositions';
import { formatMm } from '../../utils/format';

export const PRESTO_SYSTEM = 'forster presto/presto XS 50 Standard Aluminium';

export interface ConfigResult {
  config: PrestoConfig | null;
  warnings: ValidationWarning[];
}

const list = (values: number[]) => values.map((v) => formatMm(v)).join(', ');

/** Translates validated form values into Presto parameters, with explicit warnings. */
export function prestoConfigFromInput(input: CalculationInput): ConfigResult {
  const warnings: ValidationWarning[] = [];
  const def = getComposition(input.composition.type);
  if (!def.rulesAvailable) {
    warnings.push({ code: 'RULES_MISSING', level: 'bloquant', message: `${def.label} : règle métier à fournir (aucune donnée dans le dossier de fabrication).` });
    return { config: null, warnings };
  }
  if (input.options.system && input.options.system !== PRESTO_SYSTEM) {
    warnings.push({ code: 'SYSTEM_UNSUPPORTED', level: 'bloquant', message: `Système « ${input.options.system} » : aucune règle disponible (seul ${PRESTO_SYSTEM} est intégré).` });
    return { config: null, warnings };
  }
  const d = input.dimensions;
  const missing = (cond: boolean, label: string) => {
    if (cond) warnings.push({ code: 'DIMENSION_MISSING', level: 'bloquant', message: `${label} manquante.` });
    return cond;
  };
  if (missing(def.hasTransom && !(d.transomHeight && d.transomHeight > 0), 'Hauteur de l’imposte')) {
    return { config: null, warnings };
  }
  // P-PL-01 / P-PL-02: door sized by total width or by clear passage.
  const sizing = resolveDoorSizing(input.composition.type, input.composition.leafCount, d);
  if (sizing.errors.length > 0) {
    for (const message of sizing.errors) warnings.push({ code: 'DIMENSION_MISSING', level: 'bloquant', message });
    return { config: null, warnings };
  }
  const config: PrestoConfig = {
    openingSide: input.options.openingSide,
    leafCount: input.composition.leafCount,
    din: input.options.handing === 'din_droite' ? 'R' : 'L',
    totalWidth: sizing.totalWidth,
    totalHeight: d.totalHeight,
    leftSideWidth: sizing.leftSideWidth,
    rightSideWidth: sizing.rightSideWidth,
    transomHeight: def.hasTransom ? d.transomHeight ?? 0 : 0,
    floorGap: d.floorGap ?? REFERENCE_FLOOR_GAP,
    ...(sizing.activeLeafWidth !== undefined ? { activeLeafWidth: sizing.activeLeafWidth } : {}),
  };

  // Flag every parameter outside the values present in the source file.
  const extrapolated: string[] = [];
  const Wd = config.totalWidth - config.leftSideWidth - config.rightSideWidth;
  const Hd = config.totalHeight - config.transomHeight;
  const leaves = config.leafCount;
  if (!OBSERVED_DOMAIN.doorFrameWidth[leaves].includes(Wd)) extrapolated.push(`largeur de passage dormant ${formatMm(Wd)} (dossier : ${list(OBSERVED_DOMAIN.doorFrameWidth[leaves])})`);
  if (!OBSERVED_DOMAIN.doorZoneHeight.includes(Hd)) extrapolated.push(`hauteur de la zone porte ${formatMm(Hd)} (dossier : ${list(OBSERVED_DOMAIN.doorZoneHeight)})`);
  if (!OBSERVED_DOMAIN.floorGap.includes(config.floorGap)) extrapolated.push(`jeu sous porte ${formatMm(config.floorGap)} (dossier : ${list(OBSERVED_DOMAIN.floorGap)})`);
  if (config.transomHeight > 0 && !OBSERVED_DOMAIN.transomHeight.includes(config.transomHeight)) extrapolated.push(`hauteur d’imposte ${formatMm(config.transomHeight)} (dossier : ${list(OBSERVED_DOMAIN.transomHeight)})`);
  if (leaves === 2) {
    const active = config.activeLeafWidth ?? (Wd - 50) / 2;
    if (Math.abs(active - (Wd - 50) / 2) > 1e-6) extrapolated.push(`vantaux inégaux (vantail principal ${formatMm(active)}, vantail semi-fixe ${formatMm(Wd - 50 - active)} ; dossier : vantaux égaux)`);
  }
  for (const [label, w] of [['gauche', config.leftSideWidth], ['droite', config.rightSideWidth]] as const) {
    if (w > 0 && !OBSERVED_DOMAIN.sideWidth[leaves].includes(w)) extrapolated.push(`partie latérale ${label} ${formatMm(w)} (dossier avec ${leaves} vantail${leaves === 2 ? 'x' : ''} : ${list(OBSERVED_DOMAIN.sideWidth[leaves])})`);
  }
  if (extrapolated.length > 0) {
    warnings.push({
      code: 'EXTRAPOLATED',
      level: 'attention',
      message: `Résultat extrapolé, à valider : ${extrapolated.join(' ; ')}. Les règles dérivées n’ont été vérifiées que sur les valeurs du dossier.`,
    });
  }

  const ignored = (
    [
      ['glazingType', 'Type de vitrage'], ['infillType', 'Type de remplissage'], ['finish', 'Finition'], ['colour', 'Couleur'],
      ['lockType', 'Type de serrure'], ['handleType', 'Type de poignée'], ['doorCloser', 'Ferme-porte'], ['panicBar', 'Barre anti-panique'],
    ] as const
  ).filter(([key]) => input.options[key]).map(([, label]) => label);
  if (ignored.length > 0) {
    warnings.push({ code: 'OPTIONS_IGNORED', level: 'attention', message: `Options non prises en compte dans la nomenclature (données à fournir) : ${ignored.join(', ')}.` });
  }
  return { config, warnings };
}
