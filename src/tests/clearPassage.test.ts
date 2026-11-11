import { describe, expect, it } from 'vitest';
import { clearHeightFromDoorZone, clearPassageFromFrame, frameFromClearPassage, leafFromClearPassage, PASSAGE_UNITS } from '../calculation/presto/clearPassage';
import { dimensionFieldSpecs } from '../domain/compositions';
import { resolveDoorSizing, usesClearPassage } from '../domain/doorSizing';
import { computePreviewLayout, hingeSideInView } from '../domain/previewLayout';
import { calculateQuote, type CalculationInput } from '../calculation/engine';
import { DEFAULT_OPTIONS } from '../data/provisionalOptions';
import { generatePrestoBom } from '../calculation/presto/generate';
import { REFERENCE_PRESETS } from '../domain/referencePresets';

function input(partial: Partial<CalculationInput> = {}): CalculationInput {
  return {
    project: { name: 'T', quoteReference: 'T', createdOn: '2026-11-11', quantity: 1 },
    composition: { type: 'porte_double', leafCount: 2 },
    dimensions: { totalWidth: 2036, totalHeight: 2170, floorGap: 10 },
    options: { ...DEFAULT_OPTIONS },
    ...partial,
  };
}

describe('clear passage rules (P-PL-01 to P-PL-03)', () => {
  it('reproduce the PL(90°) annotations of the FFR Presto drawings', () => {
    expect(clearPassageFromFrame(1073, 1)).toBe(900);
    expect(clearPassageFromFrame(2036, 2)).toBe(1830);
    expect(frameFromClearPassage(900, 1)).toBe(1073);
    expect(frameFromClearPassage(1830, 2)).toBe(2036);
    expect(leafFromClearPassage(900)).toBe(993);
    expect(clearHeightFromDoorZone(2170)).toBe(2100);
  });
  it('standard passage units given by the user', () => {
    expect(PASSAGE_UNITS.map((u) => [u.id, u.clearPassage, u.activeClearPassage])).toEqual([['1UP', 900, 900], ['2UP', 1400, 900], ['3UP', 1800, 900]]);
  });
});

describe('door sizing from the entered values', () => {
  it('door + fixed part: total width and clear passage → fixed part takes the rest', () => {
    const s = resolveDoorSizing('porte_lateral_droite', 1, { totalWidth: 2036.5, totalHeight: 2170, clearPassage: 900 });
    expect(s).toMatchObject({ doorFrameWidth: 1073, rightSideWidth: 963.5, leftSideWidth: 0, errors: [] });
  });
  it('two fixed parts share the rest equally', () => {
    const s = resolveDoorSizing('porte_deux_laterales', 2, { totalWidth: 3000, totalHeight: 2170, clearPassage: 1830 });
    expect(s).toMatchObject({ doorFrameWidth: 2036, leftSideWidth: 482, rightSideWidth: 482 });
  });
  it('double door: total width or clear passage', () => {
    expect(usesClearPassage('porte_double', 2, { sizingMode: 'largeur_totale' })).toBe(false);
    expect(resolveDoorSizing('porte_double', 2, { totalWidth: 2036, totalHeight: 2170 }).doorFrameWidth).toBe(2036);
    const byPl = resolveDoorSizing('porte_double', 2, { totalWidth: 0, totalHeight: 2170, sizingMode: 'passage_libre', clearPassage: 1400, activeClearPassage: 900 });
    expect(byPl).toMatchObject({ totalWidth: 1606, doorFrameWidth: 1606, activeLeafWidth: 993 });
  });
  it('reports a total width too small for the requested clear passage', () => {
    expect(resolveDoorSizing('porte_lateral_gauche', 1, { totalWidth: 1100, totalHeight: 2170, clearPassage: 900 }).errors).toHaveLength(1);
    expect(resolveDoorSizing('porte_lateral_gauche', 1, { totalWidth: 2000, totalHeight: 2170 }).errors).toEqual(['Passage libre manquant.']);
  });
  it('form fields: clear passage editable with a fixed part, side widths computed', () => {
    const specs = dimensionFieldSpecs('porte_lateral_droite', 1);
    expect(specs.find((s) => s.field === 'clearPassage')?.editable).toBe(true);
    expect(specs.find((s) => s.field === 'rightSideWidth')?.editable).toBe(false);
    const dbl = dimensionFieldSpecs('porte_double', 2, { sizingMode: 'passage_libre' });
    expect(dbl.find((s) => s.field === 'totalWidth')?.editable).toBe(false);
    expect(dbl.find((s) => s.field === 'activeClearPassage')?.editable).toBe(true);
    expect(dimensionFieldSpecs('porte_simple', 1).find((s) => s.field === 'clearPassage')?.editable).toBe(false);
  });
});

describe('double doors with unequal leaves (2 UP = 900 + 500)', () => {
  it('active leaf 993 and passive leaf from the remaining width', () => {
    const r = calculateQuote(input({ dimensions: { totalWidth: 0, totalHeight: 2170, floorGap: 10, sizingMode: 'passage_libre', clearPassage: 1400, activeClearPassage: 900 } }));
    expect(r.geometry).toMatchObject({ totalWidthMm: 1606, leafWidthMm: 993, secondaryLeafWidthMm: 563, clearPassageMm: 1400, activeClearPassageMm: 900 });
    expect(r.warnings.find((w) => w.code === 'EXTRAPOLATED')?.message).toContain('vantaux inégaux');
    const bottoms = r.cuttingList.filter((i) => i.reference === '32.855').map((i) => [i.unitLengthMm, i.quantity]);
    expect(bottoms).toEqual(expect.arrayContaining([[993, 1], [563, 1]]));
  });
  it('equal leaves keep the reference position (FFR Presto 007)', () => {
    const r = calculateQuote(input({ dimensions: { totalWidth: 2036, totalHeight: 2170, floorGap: 10, activeClearPassage: 900 } }));
    expect(r.referencePositionId).toBe('Int 007');
  });
  it('the passive leaf must stay wide enough', () => {
    const r = calculateQuote(input({ dimensions: { totalWidth: 1100, totalHeight: 2170, floorGap: 10, activeClearPassage: 900 } }));
    expect(r.status).toBe('non_calcule');
  });
  it('presets of the 32 positions still match their position', () => {
    for (const p of REFERENCE_PRESETS) {
      const r = calculateQuote(input({ composition: { type: p.compositionType, leafCount: p.leafCount }, dimensions: p.dimensions, options: { ...DEFAULT_OPTIONS, openingSide: p.openingSide, handing: p.handing } }));
      expect(r.referencePositionId).toBe(p.id);
    }
  });
});

describe('preview: DIN handing and swing triangles', () => {
  it('hinge side in the exterior view (as on the forsterpro drawings)', () => {
    expect(hingeSideInView('din_gauche', 'interieur')).toBe('droite'); // Int 001: apex on the left
    expect(hingeSideInView('din_gauche', 'exterieur')).toBe('gauche'); // Ext 001: apex on the right
    expect(hingeSideInView('din_droite', 'interieur')).toBe('gauche');
  });
  it('double door: unequal leaves drawn in proportion, active leaf on the DIN side', () => {
    const l = computePreviewLayout('porte_double', 2, { totalWidth: 1606, totalHeight: 2170 }, 'din_gauche', { openingSide: 'exterieur', leafWidths: { active: 993, passive: 563 } });
    const leaves = l?.panels.filter((p) => p.kind === 'vantail') ?? [];
    expect(leaves[0]).toMatchObject({ hinge: 'gauche', label: 'Vantail principal' });
    expect(leaves[1]).toMatchObject({ hinge: 'droite', label: 'Vantail semi-fixe' });
    expect((leaves[0]?.w ?? 0) > (leaves[1]?.w ?? 0)).toBe(true);
  });
  it('geometry exposes the unequal leaves', () => {
    const g = generatePrestoBom({ openingSide: 'interieur', leafCount: 2, din: 'L', totalWidth: 1606, totalHeight: 2170, leftSideWidth: 0, rightSideWidth: 0, transomHeight: 0, floorGap: 10, activeLeafWidth: 993 }).geometry;
    expect(g).toMatchObject({ leafWidth: 993, secondaryLeafWidth: 563, clearPassage: 1400 });
  });
});
