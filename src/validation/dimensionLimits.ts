import type { Dimensions, ValidationWarning } from '../types';
import type { DimensionField } from '../domain/compositions';
import { DIMENSION_LABELS } from '../domain/compositions';

/**
 * Configurable business limits. Forster has not provided any min / max value yet,
 * so every limit is disabled ("Règle métier à fournir"). Enabling a limit only
 * requires filling `min` / `max`, setting `enabled: true` and citing the source.
 */
export interface DimensionLimit {
  field: DimensionField;
  min?: number;
  max?: number;
  enabled: boolean;
  source: string;
}

export const DIMENSION_LIMITS: readonly DimensionLimit[] = (
  ['totalWidth', 'totalHeight', 'mainLeafWidth', 'secondaryLeafWidth', 'transomHeight', 'leftSideWidth', 'rightSideWidth'] as const
).map((field) => ({ field, enabled: false, source: 'Règle métier à fournir' }));

export function checkDimensionLimits(
  dims: Dimensions,
  fields: DimensionField[],
  limits: readonly DimensionLimit[] = DIMENSION_LIMITS,
): ValidationWarning[] {
  const warnings: ValidationWarning[] = [];
  for (const limit of limits) {
    if (!limit.enabled || !fields.includes(limit.field)) continue;
    const value = dims[limit.field];
    if (value === undefined) continue;
    const label = DIMENSION_LABELS[limit.field];
    if (limit.min !== undefined && value < limit.min) {
      warnings.push({ code: 'LIMIT_MIN', level: 'bloquant', field: limit.field, message: `${label} inférieure au minimum (${limit.min} mm, ${limit.source}).` });
    }
    if (limit.max !== undefined && value > limit.max) {
      warnings.push({ code: 'LIMIT_MAX', level: 'bloquant', field: limit.field, message: `${label} supérieure au maximum (${limit.max} mm, ${limit.source}).` });
    }
  }
  if (!limits.some((l) => l.enabled)) {
    warnings.push({ code: 'LIMITS_NOT_PROVIDED', level: 'info', message: 'Limites dimensionnelles Forster non fournies : aucun contrôle min / max appliqué (règle métier à fournir).' });
  }
  return warnings;
}
