import type { CalculationResult, CalculationTotals } from '../types';
import { getComposition, visibleDimensionFields } from '../domain/compositions';
import { checkDimensionLimits } from '../validation/dimensionLimits';
import { EMPTY_PRICE_BOOK, type PriceBook } from '../pricing/priceBook';
import type { Catalogue } from '../imports/forsterpro/buildCatalogue';
import catalogueJson from '../data/sources/ffr-presto/catalogue.json';
import type { CalculationInput } from './types';
import { prestoConfigFromInput } from './presto/fromInput';
import { generatePrestoBom, PrestoConfigError } from './presto/generate';
import { computeTotals, toCuttingList } from './presto/toCuttingList';
import { findReferencePosition } from './presto/referencePositions';
import { manualChecks } from './presto/manualChecks';
import { roundHalfUp } from './presto/generate';

export type { CalculationInput } from './types';

export const EMPTY_TOTALS: CalculationTotals = {
  profiles: null,
  glazingOrInfill: null,
  hardware: null,
  accessories: null,
  other: null,
  material: null,
  materialForQuantity: null,
};

export const FFR_PRESTO_CATALOGUE = catalogueJson as Catalogue;

export interface EngineDependencies {
  catalogue: Catalogue;
  prices: PriceBook;
}

const DEFAULT_DEPS: EngineDependencies = { catalogue: FFR_PRESTO_CATALOGUE, prices: EMPTY_PRICE_BOOK };

/**
 * Calculation entry point: validated input → cutting list, totals, warnings.
 * Business rules live in ./presto (never in React components).
 */
export function calculateQuote(input: CalculationInput, deps: EngineDependencies = DEFAULT_DEPS): CalculationResult {
  const def = getComposition(input.composition.type);
  const warnings = checkDimensionLimits(input.dimensions, visibleDimensionFields(def.type, input.composition.leafCount));

  const { config, warnings: configWarnings } = prestoConfigFromInput(input);
  warnings.push(...configWarnings);
  if (!config) return { status: 'non_calcule', cuttingList: [], totals: EMPTY_TOTALS, warnings };

  let bom;
  try {
    bom = generatePrestoBom(config);
  } catch (error) {
    if (error instanceof PrestoConfigError) {
      warnings.push({ code: 'CONFIG_INVALID', level: 'bloquant', message: error.message });
      return { status: 'non_calcule', cuttingList: [], totals: EMPTY_TOTALS, warnings };
    }
    throw error;
  }

  const checks = manualChecks(bom);
  warnings.push(...checks);
  if (checks.some((w) => w.level === 'bloquant')) return { status: 'non_calcule', cuttingList: [], totals: EMPTY_TOTALS, warnings };

  const cuttingList = toCuttingList(bom, deps.catalogue, deps.prices);
  const profileWeightKg = roundHalfUp(cuttingList.reduce((s, i) => s + (i.weightKg ?? 0), 0), 2);
  const totals = computeTotals(cuttingList, input.project.quantity);
  const reference = findReferencePosition(config);
  if (reference) {
    warnings.unshift({
      code: 'REFERENCE_MATCH',
      level: 'info',
      message: `Configuration identique à la position « ${reference.id} » du dossier de fabrication (page ${reference.pdfPage}) : nomenclature vérifiée ligne à ligne par les tests.`,
    });
  }
  if (cuttingList.some((i) => i.trace.ruleStatus === 'a_valider')) {
    warnings.push({ code: 'RULES_TO_VALIDATE', level: 'attention', message: 'Certaines quantités reposent sur des règles « à valider » (boutons autotaraudeurs, douilles d’écoulement).' });
  }
  if (totals.material === null) {
    warnings.push({ code: 'NO_PRICES', level: 'attention', message: 'Aucun tarif importé : prix non disponibles. Les quantités sont calculées, le montant ne l’est pas.' });
  }
  warnings.push({ code: 'BARS_NOT_OPTIMISED', level: 'info', message: 'Longueurs nettes de coupe : l’optimisation en barres de 6 000 mm (chutes) n’est pas calculée.' });

  return {
    status: totals.material === null ? 'partiel' : 'calcule',
    cuttingList,
    totals,
    warnings,
    referencePositionId: reference?.id,
    profileWeightKg,
    geometry: {
      doorFrameWidthMm: bom.geometry.doorFrameWidth,
      doorZoneHeightMm: bom.geometry.doorZoneHeight,
      leafWidthMm: bom.geometry.leafWidth,
      leafHeightMm: bom.geometry.leafHeight,
      leafCount: config.leafCount,
    },
  };
}
