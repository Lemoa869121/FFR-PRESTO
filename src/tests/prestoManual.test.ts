import { describe, expect, it } from 'vitest';
import { HINGE_907662_LOADS, LEAF_GEOMETRY, MANUAL, PROFILE_DATA, SALES_UNITS, SEALING_PIECES } from '../data/sources/presto-manual/manual';
import { hingeLoadFor, manualChecks, minStudsPerSide } from '../calculation/presto/manualChecks';
import { generatePrestoBom, screwsPerSide } from '../calculation/presto/generate';
import { calculateQuote, type CalculationInput } from '../calculation/engine';
import { DEFAULT_OPTIONS } from '../data/provisionalOptions';
import { getRule, PRESTO_RULES } from '../calculation/presto/rules';
import type { PrestoConfig } from '../calculation/presto/types';

const int001: PrestoConfig = { openingSide: 'interieur', leafCount: 1, din: 'L', totalWidth: 1073, totalHeight: 2170, leftSideWidth: 0, rightSideWidth: 0, transomHeight: 0, floorGap: 10 };

function input(partial: Partial<CalculationInput> = {}): CalculationInput {
  return {
    project: { name: 'Test', quoteReference: 'T', createdOn: '2026-11-11', quantity: 1 },
    composition: { type: 'porte_simple', leafCount: 1 },
    dimensions: { totalWidth: 1073, totalHeight: 2170, floorGap: 10 },
    options: { ...DEFAULT_OPTIONS },
    ...partial,
  };
}

describe('presto manual — data read as printed', () => {
  it('identifies the source document', () => {
    expect(MANUAL).toMatchObject({ articleNo: '918301', edition: '01/2021', pageCount: 926 });
    expect(MANUAL.sha256).toHaveLength(64);
  });
  it('profile weights and bar lengths (VP 3.2.1 / 3.2.2 / 3.2.4)', () => {
    expect(PROFILE_DATA['32.800']).toMatchObject({ barLengthMm: 6000, kgPerM: 2.849 });
    expect(PROFILE_DATA['32.855']?.kgPerM).toBe(3.615);
    expect(PROFILE_DATA['901335']).toMatchObject({ barLengthMm: 6000, kgPerM: 0.422, source: { vp: 'VP 3.2.4', pdfPage: 62 } });
  });
  it('hinge load table 907662 (VP 3.3.114)', () => {
    expect(HINGE_907662_LOADS.loads).toHaveLength(HINGE_907662_LOADS.heights.length);
    expect(HINGE_907662_LOADS.loads.every((r) => r.length === HINGE_907662_LOADS.widths.length)).toBe(true);
    expect(HINGE_907662_LOADS.loads[6]).toEqual([340, 300, 260, 230, 210]);
  });
  it('sales units of the accessories (for future pricing)', () => {
    expect(SALES_UNITS['906579']?.unit).toBe('magasin de 200 pièces');
    expect(SALES_UNITS['905306']?.unit).toBe('rouleau de 100 m');
    expect(SALES_UNITS['907662']?.unit).toBe('lot de 2 pièces');
  });
  it('sealing pieces by DIN (VP 3.4.9) match rule P-ACC-04', () => {
    expect(SEALING_PIECES).toMatchObject({ L: '905703', R: '905702' });
    expect(getRule('P-ACC-04').status).toBe('explicite');
  });
});

describe('leaf geometry from the system plans (P-VAN-01)', () => {
  it('reproduces the FFR Presto leaf 993 × 2 120 from 36 + 4 mm and a 10 mm floor gap', () => {
    expect(LEAF_GEOMETRY.frameOverlapMm + LEAF_GEOMETRY.rebatePlayMm).toBe(40);
    expect(generatePrestoBom(int001).geometry).toMatchObject({ leafWidth: 993, leafHeight: 2120 });
  });
  it('the floor gap changes the leaf height only', () => {
    const g = generatePrestoBom({ ...int001, floorGap: 15 }).geometry;
    expect(g).toMatchObject({ leafWidth: 993, leafHeight: 2115 });
  });
  it('a floor gap different from the file is flagged as extrapolated', () => {
    const r = calculateQuote(input({ dimensions: { totalWidth: 1073, totalHeight: 2170, floorGap: 15 } }));
    expect(r.warnings.find((w) => w.code === 'EXTRAPOLATED')?.message).toContain('jeu sous porte');
    expect(r.referencePositionId).toBeUndefined();
  });
  it('the default floor gap keeps the reference position', () => {
    expect(calculateQuote(input({ dimensions: { totalWidth: 1073, totalHeight: 2170 } })).referencePositionId).toBe('Int 001');
  });
});

describe('explicit checks of the manual', () => {
  it('hinge load: conservative cell, null outside the table', () => {
    expect(hingeLoadFor(993, 2120)).toBe(200); // H 2000 row, B 1000 column
    expect(hingeLoadFor(600, 1800)).toBe(260);
    expect(hingeLoadFor(1400, 3000)).toBe(210);
    expect(hingeLoadFor(1500, 2120)).toBeNull();
    expect(hingeLoadFor(993, 1700)).toBeNull();
  });
  it('reports the permissible load for a reference position', () => {
    const w = manualChecks(generatePrestoBom(int001));
    expect(w).toEqual([expect.objectContaining({ code: 'HINGE_LOAD', level: 'info' })]);
    expect(w[0]?.message).toContain('200 kg');
  });
  it('warns when the leaf is outside the hinge table', () => {
    const r = calculateQuote(input({ dimensions: { totalWidth: 1600, totalHeight: 2170, floorGap: 10 } }));
    expect(r.warnings.find((w) => w.code === 'HINGE_TABLE_OUT_OF_RANGE')?.level).toBe('attention');
    expect(r.cuttingList.length).toBeGreaterThan(0);
  });
  it('blocks dimensions under 120 mm', () => {
    const w = manualChecks(generatePrestoBom({ ...int001, totalWidth: 2000, leftSideWidth: 0, rightSideWidth: 0, transomHeight: 0 }));
    expect(w.some((x) => x.code === 'MANUAL_MIN_SIZE')).toBe(false);
    const bom = generatePrestoBom(int001);
    const small = manualChecks({ ...bom, geometry: { ...bom.geometry, leafWidth: 110 } });
    expect(small.find((x) => x.code === 'MANUAL_MIN_SIZE')?.level).toBe('bloquant');
  });
  it('stud counts of the file respect the spacing rule (≤ 70 mm from ends, ≤ 300 mm)', () => {
    for (const length of [240, 432, 853, 913.5, 973, 1936, 1940, 2030]) {
      expect(screwsPerSide(length)).toBeGreaterThanOrEqual(minStudsPerSide(length));
    }
    expect(minStudsPerSide(853)).toBe(4);
    expect(minStudsPerSide(2030)).toBe(8);
  });
});

describe('engine output enriched with the manual', () => {
  it('profile weight of Int 001 from kg/m (excluding gaskets and infill)', () => {
    const r = calculateQuote(input());
    expect(r.profileWeightKg).toBe(38.62);
    const frame = r.cuttingList.find((i) => i.reference === '32.800' && i.unitLengthMm === 2170);
    expect(frame?.weightKg).toBe(6.182);
    expect(frame?.comment).toContain('Tolérance de coupe dormant +1 / −0 mm');
    expect(frame?.comment).toContain('barre 6000 mm');
    const stile = r.cuttingList.find((i) => i.reference === '32.805');
    expect(stile?.comment).toContain('vantail +0 / −1 mm');
  });
  it('every rule with a manual source cites a VP page', () => {
    for (const rule of PRESTO_RULES.filter((r) => r.sources?.some((s) => s.startsWith('Guide')))) {
      expect(rule.sources?.join(' ')).toMatch(/VP \d+\.\d+\.\d+/);
    }
  });
});
