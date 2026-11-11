import { describe, expect, it } from 'vitest';
import { formatEuro, formatMetres, formatMm, parseFrenchNumber, todayIso } from '../utils/format';
import { columnLetter, describeFile, getExtension } from '../imports/fileInfo';
import { parseHash, routeToHash } from '../app/router';
import { checkDimensionLimits } from '../validation/dimensionLimits';

// Intl uses narrow no-break spaces in fr-FR: normalise for readable assertions.
const n = (s: string) => s.replace(/[\u00a0\u202f]/g, ' ');

describe('French formatting', () => {
  it('uses the decimal comma and thousands separator', () => {
    expect(n(formatMm(2036.5))).toBe('2 036,5 mm');
    expect(n(formatMetres(5.58))).toBe('5,58 m');
  });
  it('never invents a price', () => {
    expect(formatEuro(null)).toBe('Prix non disponible');
    expect(n(formatEuro(1234.5))).toBe('1 234,50 €');
  });
  it('parses French decimals', () => {
    expect(parseFrenchNumber('2 036,5')).toBe(2036.5);
    expect(parseFrenchNumber('1073')).toBe(1073);
    expect(Number.isNaN(parseFrenchNumber('abc'))).toBe(true);
    expect(Number.isNaN(parseFrenchNumber(''))).toBe(true);
  });
  it('formats today as ISO date', () => {
    expect(todayIso(new Date(2026, 10, 11))).toBe('2026-11-11');
  });
});

describe('file information', () => {
  it('identifies extension and kind', () => {
    expect(getExtension('Tarif 2026.XLSX')).toBe('xlsx');
    expect(getExtension('sans-extension')).toBe('');
    expect(describeFile('liste.csv', 10).kind).toBe('csv');
    expect(describeFile('dossier.pdf', 10).kind).toBe('pdf');
    expect(describeFile('photo.png', 10).kind).toBe('inconnu');
  });
  it('converts column indexes to letters', () => {
    expect([0, 25, 26, 27, 701].map(columnLetter)).toEqual(['A', 'Z', 'AA', 'AB', 'ZZ']);
  });
});

describe('hash router', () => {
  it('round-trips every route', () => {
    for (const hash of ['#/', '#/chiffrage/nouveau', '#/chiffrage/abc', '#/debit', '#/debit/abc', '#/import', '#/regles']) {
      expect(routeToHash(parseHash(hash))).toBe(hash);
    }
    expect(parseHash('#/inconnu')).toEqual({ name: 'dashboard' });
  });
});

describe('dimension limits', () => {
  it('applies no business limit while Forster has not provided them', () => {
    const w = checkDimensionLimits({ totalWidth: 99999, totalHeight: 1 }, ['totalWidth', 'totalHeight']);
    expect(w.map((x) => x.code)).toEqual(['LIMITS_NOT_PROVIDED']);
  });
  it('blocks values outside an enabled limit', () => {
    const w = checkDimensionLimits({ totalWidth: 500, totalHeight: 2000 }, ['totalWidth'], [{ field: 'totalWidth', min: 600, enabled: true, source: 'test' }]);
    expect(w).toEqual([expect.objectContaining({ code: 'LIMIT_MIN', level: 'bloquant' })]);
  });
});
