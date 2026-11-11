import type { PriceSource } from '../types';

/**
 * Price book. EMPTY on purpose: no Forster price has been provided.
 * Prices will be loaded from the Excel price files through the import module;
 * each entry keeps its source (file, sheet, cell) for traceability.
 */
export interface PriceEntry {
  reference: string;
  unitPrice: number;
  unit: 'piece' | 'metre' | 'barre';
  source: PriceSource;
}

export class PriceBook {
  private readonly entries = new Map<string, PriceEntry>();

  constructor(entries: PriceEntry[] = []) {
    for (const e of entries) this.entries.set(e.reference, e);
  }

  get size(): number {
    return this.entries.size;
  }

  lookup(reference: string): PriceEntry | null {
    return this.entries.get(reference) ?? null;
  }
}

export const EMPTY_PRICE_BOOK = new PriceBook();
