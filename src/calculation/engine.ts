import type { CalculationResult, CalculationTotals, CompositionType, Dimensions, LeafCount, Project, TechnicalOptions } from '../types';
import { getComposition, visibleDimensionFields } from '../domain/compositions';
import { checkDimensionLimits } from '../validation/dimensionLimits';

export const EMPTY_TOTALS: CalculationTotals = {
  profiles: null,
  glazingOrInfill: null,
  hardware: null,
  accessories: null,
  other: null,
  material: null,
  materialForQuantity: null,
};

/** Everything the engine needs; matches the validated form values. */
export interface CalculationInput {
  project: Project;
  composition: { type: CompositionType; leafCount: LeafCount };
  dimensions: Dimensions;
  options: TechnicalOptions;
}

/**
 * Calculation entry point. The Forster cutting rules are not integrated yet,
 * so the engine only returns validation warnings and an empty cutting list.
 */
export function calculateQuote(quote: CalculationInput): CalculationResult {
  const def = getComposition(quote.composition.type);
  const fields = visibleDimensionFields(def.type, quote.composition.leafCount);
  const warnings = checkDimensionLimits(quote.dimensions, fields);
  warnings.push({
    code: 'RULES_NOT_INTEGRATED',
    level: 'attention',
    message: 'La liste de débit sera calculée après intégration des règles métier Forster.',
  });
  warnings.push({ code: 'NO_PRICES', level: 'attention', message: 'Aucun fichier tarifaire importé : prix non disponibles.' });
  return { status: 'non_calcule', cuttingList: [], totals: EMPTY_TOTALS, warnings };
}
