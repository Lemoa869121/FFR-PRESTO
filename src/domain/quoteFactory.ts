import type { Quote, QuoteStatus } from '../types';
import type { QuoteFormValues } from '../validation/quoteSchema';
import { buildElements, getComposition } from './compositions';
import { generateId } from '../storage/quoteStorage';

export const STATUS_LABELS: Record<QuoteStatus, string> = {
  brouillon: 'Brouillon',
  a_completer: 'Données à compléter',
  calcule: 'Calculé',
};

export function compositionLabel(quote: { composition: Pick<Quote['composition'], 'type' | 'leafCount'> }): string {
  const def = getComposition(quote.composition.type);
  if (!def.hasDoor || def.leafCounts.length === 1) return def.label;
  return `${def.label} — ${quote.composition.leafCount === 1 ? '1 vantail' : '2 vantaux'}`;
}

/** Builds a Quote from validated form values, keeping identity fields of an existing quote. */
export function quoteFromForm(values: QuoteFormValues, existing?: Quote, status: QuoteStatus = 'brouillon', totalPrice: number | null = null): Quote {
  const now = new Date().toISOString();
  return {
    id: existing?.id ?? generateId(),
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    status,
    totalPrice,
    project: values.project,
    composition: {
      type: values.composition.type,
      leafCount: values.composition.leafCount,
      elements: buildElements(values.composition.type, values.dimensions),
    },
    dimensions: values.dimensions,
    options: values.options,
  };
}

export function formFromQuote(quote: Quote): QuoteFormValues {
  return {
    project: quote.project,
    composition: { type: quote.composition.type, leafCount: quote.composition.leafCount },
    dimensions: quote.dimensions,
    options: quote.options,
  };
}
