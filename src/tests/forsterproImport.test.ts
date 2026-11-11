import { describe, expect, it } from 'vitest';
import documentJson from '../data/sources/ffr-presto/document.json';
import catalogueJson from '../data/sources/ffr-presto/catalogue.json';
import type { ForsterproDocument } from '../imports/forsterpro/types';
import type { Catalogue } from '../imports/forsterpro/buildCatalogue';
import { evalQtyExpression, parseForsterproDocument, parseFrNumber } from '../imports/forsterpro/parseForsterpro';

const doc = documentJson as ForsterproDocument;
const catalogue = catalogueJson as Catalogue;
const pos = (id: string) => {
  const p = doc.positions.find((x) => x.id === id);
  if (!p) throw new Error(`position ${id} absente`);
  return p;
};

describe('number parsing (format forsterpro)', () => {
  it('reads French thousands and decimals', () => {
    expect(parseFrNumber('2.170,0')).toBe(2170);
    expect(parseFrNumber('5,58')).toBe(5.58);
    expect(parseFrNumber('963,5')).toBe(963.5);
    expect(() => parseFrNumber('abc')).toThrow();
  });
  it('evaluates multi-field quantities', () => {
    expect(evalQtyExpression('1*2')).toBe(2);
    expect(evalQtyExpression('5,98*2')).toBe(11.96);
    expect(evalQtyExpression('24')).toBe(24);
  });
});

describe('imported document — global figures (T13)', () => {
  it('contains 32 positions, 1 484 lines and no unparsed line', () => {
    expect(doc.positions).toHaveLength(32);
    expect(doc.positions.reduce((n, p) => n + p.elements.reduce((m, e) => m + e.lines.length, 0), 0)).toBe(1484);
    expect(doc.unparsed).toEqual([]);
    expect(doc.affaire).toBe('FFR Presto');
    expect(doc.sha256).toBe('7a1746a15d1a2c5ea5930e13fc70f46c130a2d7c2849baad46c16c59e0a336e4');
  });
  it('totals per reference match the analysis', () => {
    const total = (ref: string) => doc.positions.flatMap((p) => p.elements.flatMap((e) => e.lines)).filter((l) => l.ref === ref).reduce((s, l) => s + l.qtyTotal, 0);
    expect(total('32.800')).toBe(48);
    expect(total('901335')).toBe(448);
    expect(total('906579')).toBe(2368);
    expect(Math.round(total('905306') * 100) / 100).toBe(454.4);
  });
  it('lists 23 references without inventing any', () => {
    expect(catalogue.entries.map((e) => e.ref)).toEqual([
      '32.800', '32.803', '32.805', '32.851', '32.852', '32.855', '900100', '901335', '905306', '905312', '905317', '905702',
      '905703', '906579', '907662', '916320', '916322', 'FFR019FND', 'FFR042FND', 'FFR045FND', 'FFR046FND', 'FFR049FND', 'FFR050FND',
    ]);
    expect(catalogue.glazingDescriptions).toEqual(['Sans vitrage, 9 mm']);
  });
});

describe('position Int 001 (T1–T5, T12)', () => {
  const p = pos('Int 001');
  it('header', () => {
    expect(p).toMatchObject({ quantity: 1, sizeRaw: '1.073 x 2.170 mm', widthMm: 1073, heightMm: 2170, seriesRaw: 'forster presto/presto XS 50 Standard Aluminium', materialRaw: 'Acier brut' });
    expect(p.source).toMatchObject({ pdfPage: 1, printedPage: 1 });
  });
  it('keeps the forsterpro warning (T12)', () => {
    expect(p.sourceWarnings).toHaveLength(1);
    expect(p.sourceWarnings[0]?.text).toContain('Veuillez recalculer la nomenclature');
    expect(p.sourceWarnings[0]?.source.line).toBe(26);
  });
  it('frame: three 32.800 members with source page and line (T2)', () => {
    const frame = p.elements[0];
    expect(frame?.kind).toBe('dormant');
    expect(frame?.lines.filter((l) => l.group === 'profiles').map((l) => [l.ref, l.lengthMm, l.cutAnglesRaw, l.orientationRaw, l.source.pdfPage, l.source.line])).toEqual([
      ['32.800', 2170, '90° - 135°', 'D/1', 1, 30],
      ['32.800', 2170, '135° - 90°', 'G/2', 1, 32],
      ['32.800', 1073, '135° - 135°', 'H/4', 1, 34],
    ]);
    expect(frame?.lines.find((l) => l.ref === '905306')).toMatchObject({ qtyTotal: 5.58, unitRaw: 'm', source: { pdfPage: 2, line: 9 } });
  });
  it('leaf, beads, infill and hardware (T3, T4, T5)', () => {
    const door = p.elements[1];
    expect(door?.kind).toBe('porte');
    expect(door?.sashes).toEqual([expect.objectContaining({ id: '1.1', widthMm: 993, heightMm: 2120, weightKg: 62.8 })]);
    expect(door?.lines.find((l) => l.group === 'glazing')?.glass).toEqual({ widthMm: 837, heightMm: 1964, areaM2: 1.64, fieldNo: 1 });
    expect(door?.lines.filter((l) => l.ref === '901335').map((l) => l.lengthMm)).toEqual([1940, 1940, 853, 853]);
    expect(door?.lines.find((l) => l.ref === '907662')?.qtyTotal).toBe(3);
    expect(door?.lines.find((l) => l.ref === 'FFR019FND')?.descriptionRaw).toBe('Kit n°1, 2 béquille + carré de 8 + rosaces');
    expect(door?.floorConnectionRaw).toBe('Plinthe d\'onglet 1060.2');
  });
});

describe('special rows', () => {
  it('multi-field element of Int 005 (T6)', () => {
    const el = pos('Int 005').elements.find((e) => e.indexRaw === '1,3');
    expect(el?.fieldIndexes).toEqual([1, 3]);
    expect(el?.lines.filter((l) => l.ref === '901335').map((l) => [l.qtyExpressionRaw, l.qtyTotal, l.lengthMm])).toEqual([
      ['1*2', 2, 2030], ['1*2', 2, 2030], ['1*2', 2, 913.5], ['1*2', 2, 913.5],
    ]);
    expect(el?.lines.find((l) => l.ref === '905312')?.qtyTotal).toBe(11.96);
    expect(el?.lines.find((l) => l.ref === '906579')?.qtyTotal).toBe(48);
    expect(el?.source).toMatchObject({ pdfPage: 27, line: 29 });
  });
  it('trimmed transom of Int 002 (T7)', () => {
    const line = pos('Int 002').elements[0]?.lines.find((l) => l.orientationRaw === 'La/7');
    expect(line).toMatchObject({ ref: '32.803', lengthMm: 1113, maxDimMm: 1113, lengthAfterTrimMm: 1073, source: { pdfPage: 5, line: 12 } });
  });
  it('double door with two sashes (Int 007)', () => {
    const door = pos('Int 007').elements.find((e) => e.kind === 'porte');
    expect(door?.sashes.map((s) => s.id)).toEqual(['1.1', '1.2']);
  });
});

describe('optimised cutting (T14–T17)', () => {
  it('bon d’atelier and débit optimisé agree for the 7 cut references (T14)', () => {
    for (const plan of doc.cuttingPlans) {
      const fromBon = doc.positions.flatMap((p) => p.elements.flatMap((e) => e.lines)).filter((l) => l.ref === plan.ref && l.lengthMm !== undefined);
      const cutsBon = fromBon.reduce((n, l) => n + l.qtyTotal, 0);
      const lenBon = fromBon.reduce((n, l) => n + l.qtyTotal * (l.lengthMm ?? 0), 0);
      const cuts = plan.patterns.flatMap((pt) => pt.cuts.map((c) => ({ ...c, qty: c.qty * pt.repeat })));
      expect(cuts.reduce((n, c) => n + c.qty, 0)).toBe(cutsBon);
      expect(cuts.reduce((n, c) => n + c.qty * c.cutLengthMm, 0)).toBe(lenBon);
      expect(plan.stockBars * plan.barLengthMm - lenBon).toBe(plan.wasteMm);
    }
  });
  it('32.800: 20 bars of 6 000 mm, 25 688 mm waste = 21,4 % (T15)', () => {
    expect(doc.cuttingPlans.find((p) => p.ref === '32.800')).toMatchObject({ stockBars: 20, barLengthMm: 6000, wasteMm: 25688, wastePct: 21.4, sawKerfMm: 4, endWasteMm: 60, usableOffcutMm: 600 });
  });
  it('keeps both values when summary and bar sheet disagree (T16)', () => {
    expect(doc.cuttingPlans.find((p) => p.ref === '32.852')?.wasteMm).toBe(2756);
    expect(doc.cuttingSummary.find((s) => s.ref === '32.852')?.wasteMm).toBe(2760);
    expect(doc.cuttingPlans.find((p) => p.ref === '901335')?.wasteMm).toBe(9464);
    expect(doc.cuttingSummary.find((s) => s.ref === '901335')?.wasteMm).toBe(9538);
  });
  it('maps PDF page 175 to printed page 33 (T17)', () => {
    expect(doc.cuttingSummary[0]?.source).toMatchObject({ pdfPage: 175, printedPage: 33 });
    expect(doc.offcuts).toHaveLength(12);
  });
});

describe('parser on raw text', () => {
  it('ignores unknown pages and reports unclassified lines', () => {
    const page = [
      "  Bon d'atelier                     Date:",
      'Position: Test 1',
      'Quantité: 1 Pce',
      'Taille: 1.000 x 2.000 mm',
      'Dormant',
      'Profilés',
      '         1 (1) Pce 32.800                  Forster PRESTO                              2.000,0       90° - 135°           D/1',
      'Ligne inattendue',
    ].join('\n');
    const parsed = parseForsterproDocument([page], { documentId: 't', fileName: 't.pdf', sha256: '' });
    expect(parsed.positions[0]?.elements[0]?.lines[0]).toMatchObject({ ref: '32.800', lengthMm: 2000, qtyTotal: 1 });
    expect(parsed.unparsed).toEqual([{ pdfPage: 1, line: 8, text: 'Ligne inattendue' }]);
  });
});
