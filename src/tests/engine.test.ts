import { describe, expect, it } from 'vitest';
import { calculateQuote, FFR_PRESTO_CATALOGUE, type CalculationInput } from '../calculation/engine';
import { PriceBook } from '../pricing/priceBook';
import { DEFAULT_OPTIONS } from '../data/provisionalOptions';
import { REFERENCE_PRESETS } from '../domain/referencePresets';

function input(partial: Partial<CalculationInput> = {}): CalculationInput {
  return {
    project: { name: 'Test', quoteReference: 'T-1', createdOn: '2026-11-11', quantity: 2 },
    composition: { type: 'porte_lateral_droite', leafCount: 1 },
    dimensions: { totalWidth: 2036.5, totalHeight: 2170, rightSideWidth: 963.5 },
    options: { ...DEFAULT_OPTIONS },
    ...partial,
  };
}

describe('calculation engine', () => {
  it('recognises a reference position and returns a traced cutting list', () => {
    const r = calculateQuote(input());
    expect(r.referencePositionId).toBe('Int 003');
    expect(r.warnings[0]?.code).toBe('REFERENCE_MATCH');
    expect(r.geometry).toMatchObject({ leafWidthMm: 993, leafHeightMm: 2120, doorFrameWidthMm: 1073 });
    const mullion = r.cuttingList.find((i) => i.reference === '32.803');
    expect(mullion).toMatchObject({ unitLengthMm: 2190, lengthAfterTrimMm: 2170, quantity: 1, category: 'profiles', designation: 'Forster PRESTO' });
    expect(mullion?.trace).toMatchObject({ ruleId: 'P-DOR-07', ruleStatus: 'derivee', referenceSource: { pdfPage: 5, line: 12, documentId: 'ffr-presto-2026-11-11' }, priceSource: null });
    expect(mullion?.dataSource).toContain('P-DOR-07');
  });

  it('aggregates identical pieces and computes cumulated lengths', () => {
    const r = calculateQuote(input());
    const stiles = r.cuttingList.find((i) => i.reference === '32.805' && i.unitLengthMm === 2120);
    expect(stiles).toMatchObject({ quantity: 2, totalLengthM: 4.24, orientation: 'G, D' });
    const epdm = r.cuttingList.filter((i) => i.reference === '905306');
    expect(epdm.map((i) => i.quantity).sort()).toEqual([5.39, 5.6]);
  });

  it('never invents a price: totals stay null without a price book (T20)', () => {
    const r = calculateQuote(input());
    expect(r.status).toBe('partiel');
    expect(r.cuttingList.every((i) => i.unitPrice === null && i.totalPrice === null)).toBe(true);
    expect(r.totals.materialForQuantity).toBeNull();
    expect(r.warnings.map((w) => w.code)).toContain('NO_PRICES');
  });

  it('computes totals only when every line is priced (fictitious test prices)', () => {
    const r0 = calculateQuote(input());
    const refs = [...new Set(r0.cuttingList.map((i) => i.reference))].filter((ref) => ref !== '—');
    const book = new PriceBook(refs.map((reference) => ({ reference, unitPrice: 1, unit: 'piece', source: { fileName: 'test-prix-fictifs.xlsx', importedAt: '2026-11-11' } })));
    const partial = calculateQuote(input(), { catalogue: FFR_PRESTO_CATALOGUE, prices: book });
    // The infill has no reference, hence no price: the total cannot be given.
    expect(partial.totals.glazingOrInfill).toBeNull();
    expect(partial.totals.material).toBeNull();
    expect(partial.totals.profiles).not.toBeNull();
  });

  it('flags extrapolated dimensions (T19)', () => {
    const r = calculateQuote(input({ composition: { type: 'porte_simple', leafCount: 1 }, dimensions: { totalWidth: 1200, totalHeight: 2170 } }));
    expect(r.referencePositionId).toBeUndefined();
    expect(r.cuttingList.length).toBeGreaterThan(0);
    const w = r.warnings.find((x) => x.code === 'EXTRAPOLATED');
    expect(w?.level).toBe('attention');
    expect(w?.message).toContain('largeur de passage dormant');
  });

  it('does not calculate compositions without data (fixed frame, custom)', () => {
    for (const type of ['chassis_fixe', 'personnalisee'] as const) {
      const r = calculateQuote(input({ composition: { type, leafCount: 1 }, dimensions: { totalWidth: 1000, totalHeight: 2000 } }));
      expect(r.status).toBe('non_calcule');
      expect(r.cuttingList).toEqual([]);
      expect(r.warnings.find((w) => w.code === 'RULES_MISSING')?.level).toBe('bloquant');
    }
  });

  it('maps exterior opening and right handing to the matching position', () => {
    const r = calculateQuote(input({
      composition: { type: 'porte_imposte_lateral_gauche', leafCount: 2 },
      dimensions: { totalWidth: 2518, totalHeight: 2500, leftSideWidth: 482, transomHeight: 330 },
      options: { ...DEFAULT_OPTIONS, openingSide: 'exterieur', handing: 'tirant_droit' },
    }));
    expect(r.referencePositionId).toBe('Ext 010b');
  });

  it('reports impossible dimensions as blocking', () => {
    const r = calculateQuote(input({ composition: { type: 'porte_simple', leafCount: 1 }, dimensions: { totalWidth: 150, totalHeight: 2170 } }));
    expect(r.status).toBe('non_calcule');
    expect(r.warnings.find((w) => w.code === 'CONFIG_INVALID')?.level).toBe('bloquant');
  });

  it('lists options that the rules do not cover', () => {
    const r = calculateQuote(input({ options: { ...DEFAULT_OPTIONS, doorCloser: 'Ferme-porte 1' } }));
    expect(r.warnings.find((w) => w.code === 'OPTIONS_IGNORED')?.message).toContain('Ferme-porte');
  });

  it('each of the 32 presets of the form is recognised as its reference position', () => {
    expect(REFERENCE_PRESETS).toHaveLength(32);
    for (const preset of REFERENCE_PRESETS) {
      const r = calculateQuote(input({
        composition: { type: preset.compositionType, leafCount: preset.leafCount },
        dimensions: preset.dimensions,
        options: { ...DEFAULT_OPTIONS, openingSide: preset.openingSide, handing: preset.handing },
      }));
      expect(r.referencePositionId).toBe(preset.id);
      expect(r.warnings.some((w) => w.code === 'EXTRAPOLATED')).toBe(false);
    }
  });

  it('refuses an unsupported system', () => {
    const r = calculateQuote(input({ options: { ...DEFAULT_OPTIONS, system: 'Autre système' } }));
    expect(r.status).toBe('non_calcule');
    expect(r.warnings.find((w) => w.code === 'SYSTEM_UNSUPPORTED')).toBeDefined();
  });
});
