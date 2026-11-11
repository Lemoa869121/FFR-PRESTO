import { describe, expect, it } from 'vitest';
import { COMPOSITIONS, buildElements, getComposition, visibleDimensionFields } from '../domain/compositions';
import { computePreviewLayout } from '../domain/previewLayout';
import { compositionLabel } from '../domain/quoteFactory';

describe('composition registry', () => {
  it('offers every V1 composition type plus the "imposte + one side" variants', () => {
    const labels = COMPOSITIONS.map((c) => c.label);
    expect(labels).toEqual(expect.arrayContaining([
      'Porte simple', 'Porte double', 'Châssis fixe', 'Porte avec imposte',
      'Porte avec partie latérale gauche', 'Porte avec partie latérale droite',
      'Porte avec deux parties latérales', 'Porte avec imposte et parties latérales',
      'Porte avec imposte et partie latérale gauche', 'Porte avec imposte et partie latérale droite',
      'Composition personnalisée',
    ]));
    expect(new Set(COMPOSITIONS.map((c) => c.type)).size).toBe(COMPOSITIONS.length);
  });

  it('marks compositions without Forster data as "rules to be provided"', () => {
    expect(getComposition('chassis_fixe').rulesAvailable).toBe(false);
    expect(getComposition('personnalisee').rulesAvailable).toBe(false);
    expect(getComposition('porte_simple').rulesAvailable).toBe(true);
  });

  it('throws on an unknown composition', () => {
    expect(() => getComposition('inconnue' as never)).toThrow();
  });
});

describe('visibleDimensionFields', () => {
  it('shows only width and height for a fixed frame', () => {
    expect(visibleDimensionFields('chassis_fixe', 1)).toEqual(['totalWidth', 'totalHeight']);
  });
  it('adds the secondary leaf for double doors', () => {
    expect(visibleDimensionFields('porte_double', 2)).toContain('secondaryLeafWidth');
    expect(visibleDimensionFields('porte_simple', 1)).not.toContain('secondaryLeafWidth');
  });
  it('shows transom and both side widths for the full composition', () => {
    expect(visibleDimensionFields('porte_imposte_laterales', 1)).toEqual(
      ['totalWidth', 'totalHeight', 'mainLeafWidth', 'floorGap', 'transomHeight', 'leftSideWidth', 'rightSideWidth'],
    );
  });
  it('shows only the right side for "imposte + partie latérale droite"', () => {
    const f = visibleDimensionFields('porte_imposte_lateral_droite', 2);
    expect(f).toContain('rightSideWidth');
    expect(f).not.toContain('leftSideWidth');
    expect(f).toContain('transomHeight');
  });
});

describe('buildElements', () => {
  it('splits a full composition into dormant, sides, door and three transom fields', () => {
    const els = buildElements('porte_imposte_laterales', { totalWidth: 3000, totalHeight: 2500, leftSideWidth: 963.5, rightSideWidth: 963.5, transomHeight: 330 });
    expect(els.map((e) => e.id)).toEqual(['dormant', 'lat-g', 'centre', 'lat-d', 'imp-g', 'imp-c', 'imp-d']);
    expect(els.find((e) => e.id === 'centre')).toMatchObject({ kind: 'porte', widthMm: 1073, heightMm: 2170 });
  });
});

describe('computePreviewLayout', () => {
  it('returns null for incoherent dimensions', () => {
    expect(computePreviewLayout('porte_simple', 1, { totalWidth: 0, totalHeight: 2000 }, 'tirant_gauche')).toBeNull();
    expect(computePreviewLayout('porte_lateral_droite', 1, { totalWidth: 900, totalHeight: 2000, rightSideWidth: 1000 }, 'tirant_gauche')).toBeNull();
  });
  it('draws two leaves for a double door, respecting the total width', () => {
    const layout = computePreviewLayout('porte_double', 2, { totalWidth: 2036, totalHeight: 2170 }, 'tirant_gauche');
    const leaves = layout?.panels.filter((p) => p.kind === 'vantail') ?? [];
    expect(leaves).toHaveLength(2);
    expect(leaves.reduce((s, l) => s + l.w, 0)).toBe(2036);
  });
  it('places the transom on top and adds height dimensions', () => {
    const layout = computePreviewLayout('porte_imposte', 1, { totalWidth: 1073, totalHeight: 2500, transomHeight: 330 }, 'tirant_droit');
    expect(layout?.panels.find((p) => p.label === 'Imposte')).toMatchObject({ y: 0, h: 330 });
    expect(layout?.dimensions.filter((d) => d.orientation === 'vertical').map((d) => d.value)).toEqual([2500, 330, 2170]);
    expect(layout?.panels.find((p) => p.kind === 'vantail')?.hinge).toBe('droite');
  });
});

describe('compositionLabel', () => {
  it('adds the leaf count only when the composition allows both', () => {
    expect(compositionLabel({ composition: { type: 'porte_simple', leafCount: 1 } })).toBe('Porte simple');
    expect(compositionLabel({ composition: { type: 'porte_imposte', leafCount: 2 } })).toBe('Porte avec imposte — 2 vantaux');
  });
});
