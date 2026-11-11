import { describe, expect, it } from 'vitest';
import documentJson from '../data/sources/ffr-presto/document.json';
import type { ForsterproDocument, ImportedBomLine } from '../imports/forsterpro/types';
import { REFERENCE_POSITIONS, findReferencePosition } from '../calculation/presto/referencePositions';
import { drainsForField, generatePrestoBom, PrestoConfigError, screwsForField, screwsPerSide } from '../calculation/presto/generate';
import type { GeneratedLine, PrestoConfig } from '../calculation/presto/types';
import { PRESTO_RULES, getRule } from '../calculation/presto/rules';

const doc = documentJson as ForsterproDocument;

/**
 * Comparison key for a line. The forsterpro "N° courant" (drawing number) is not
 * reproduced: only the side letter is compared (D/1 → D, Ha/7 → Ha).
 */
type Kind = 'dormant' | 'porte' | 'fixe';
type Bag = Map<string, number>;

const add = (bag: Bag, key: string, qty: number) => bag.set(key, Math.round(((bag.get(key) ?? 0) + qty) * 1000) / 1000);

function docKey(l: ImportedBomLine): string {
  if (l.group === 'glazing') return `G|${l.glass?.widthMm}|${l.glass?.heightMm}|${l.glass?.areaM2}`;
  if (l.lengthMm !== undefined) return `P|${l.ref}|${l.lengthMm}|${l.cutAnglesRaw}|${(l.orientationRaw ?? '').replace(/\/.*/, '')}|${l.lengthAfterTrimMm ?? ''}`;
  return `Q|${l.ref}`;
}
function genKey(l: GeneratedLine): string {
  if (l.group === 'glazing') return `G|${l.glass?.widthMm}|${l.glass?.heightMm}|${l.glass?.areaM2}`;
  if (l.lengthMm !== undefined) return `P|${l.ref}|${l.lengthMm}|${l.cut}|${l.side}|${l.lengthAfterTrimMm ?? ''}`;
  return `Q|${l.ref}`;
}

function docBags(id: string): Record<Kind, Bag> {
  const p = doc.positions.find((x) => x.id === id);
  if (!p) throw new Error(`position ${id} absente`);
  const bags: Record<Kind, Bag> = { dormant: new Map(), porte: new Map(), fixe: new Map() };
  for (const e of p.elements) for (const l of e.lines) add(bags[e.kind], docKey(l), l.qtyTotal);
  return bags;
}
function genBags(config: PrestoConfig): Record<Kind, Bag> {
  const bags: Record<Kind, Bag> = { dormant: new Map(), porte: new Map(), fixe: new Map() };
  for (const e of generatePrestoBom(config).elements) for (const l of e.lines) add(bags[e.kind], genKey(l), l.quantity);
  return bags;
}
const sorted = (bag: Bag) => [...bag.entries()].sort(([a], [b]) => a.localeCompare(b));

describe('derived Presto rules reproduce the forsterpro file', () => {
  it('covers the 32 positions of the file', () => {
    expect(REFERENCE_POSITIONS.map((p) => p.id).sort()).toEqual(doc.positions.map((p) => p.id).sort());
  });

  for (const ref of REFERENCE_POSITIONS) {
    it(`${ref.id}: same lines, lengths, cuts and quantities as the file (p. ${ref.pdfPage})`, () => {
      const source = doc.positions.find((p) => p.id === ref.id);
      expect(source?.sizeRaw).toBe(ref.sizeRaw);
      expect(source?.source.pdfPage).toBe(ref.pdfPage);
      const expected = docBags(ref.id);
      const actual = genBags(ref.config);
      for (const kind of ['dormant', 'porte', 'fixe'] as const) {
        expect(sorted(actual[kind])).toEqual(sorted(expected[kind]));
      }
    });
  }

  it('fails as soon as one rule changes (the comparison is not vacuous)', () => {
    const ref = REFERENCE_POSITIONS[0];
    if (!ref) throw new Error('no reference');
    const bags = genBags({ ...ref.config, totalHeight: ref.config.totalHeight + 1 });
    expect(sorted(bags.dormant)).not.toEqual(sorted(docBags(ref.id).dormant));
  });
});

describe('individual rules', () => {
  const int003: PrestoConfig = { openingSide: 'interieur', leafCount: 1, din: 'L', totalWidth: 2036.5, totalHeight: 2170, leftSideWidth: 0, rightSideWidth: 963.5, transomHeight: 0 };

  it('P-VAN-01: leaf size from the door frame (simple and double)', () => {
    expect(generatePrestoBom(int003).geometry).toEqual({ doorFrameWidth: 1073, doorZoneHeight: 2170, leafWidth: 993, leafHeight: 2120 });
    expect(generatePrestoBom({ ...int003, leafCount: 2, totalWidth: 2036, rightSideWidth: 0 }).geometry.leafWidth).toBe(993);
  });

  it('P-DOR-09: trimming of the transom bar depends on the frame ends (T8)', () => {
    const transom = (L: number, R: number) => generatePrestoBom({ ...int003, totalHeight: 2500, transomHeight: 330, leftSideWidth: L, rightSideWidth: R, totalWidth: 1073 + L + R })
      .elements[0]?.lines.find((l) => l.ruleId === 'P-DOR-09');
    expect(transom(0, 0)).toMatchObject({ lengthMm: 1113, lengthAfterTrimMm: 1073 });
    expect(transom(0, 963.5)).toMatchObject({ lengthMm: 1113, lengthAfterTrimMm: 1093 });
    expect(transom(963.5, 963.5)?.lengthAfterTrimMm).toBeUndefined();
  });

  it('P-VAN-02 / P-VAN-04: exterior swaps 32.803 and 32.805 (T10)', () => {
    const refs = (side: PrestoConfig['openingSide']) => generatePrestoBom({ ...int003, openingSide: side }).elements[1]?.lines.filter((l) => l.group === 'profiles').map((l) => `${l.ref} ${l.cut}`);
    expect(refs('interieur')).toEqual(['32.805 135° - 135°', '32.805 135° - 135°', '32.855 45° - 45°', '32.805 135° - 135°']);
    expect(refs('exterieur')).toEqual(['32.803 45° - 45°', '32.803 45° - 45°', '32.855 45° - 45°', '32.803 45° - 45°']);
  });

  it('P-VAN-04: meeting stile position follows DIN and opening side (T9)', () => {
    const meeting = (side: PrestoConfig['openingSide'], din: 'L' | 'R') =>
      generatePrestoBom({ ...int003, leafCount: 2, totalWidth: 2036, rightSideWidth: 0, openingSide: side, din }).elements[1]?.lines.find((l) => l.ruleId === 'P-VAN-04');
    expect(meeting('interieur', 'L')).toMatchObject({ ref: '32.803', side: 'D', lengthAfterTrimMm: 2086 });
    expect(meeting('interieur', 'R')).toMatchObject({ ref: '32.803', side: 'G' });
    expect(meeting('exterieur', 'L')).toMatchObject({ ref: '32.805', side: 'G' });
    expect(meeting('exterieur', 'R')).toMatchObject({ ref: '32.805', side: 'D' });
  });

  it('P-ACC-01: screws, the only integer spacing compatible with the file', () => {
    expect([240, 432, 853, 913.5, 973, 1936, 1940, 2030].map(screwsPerSide)).toEqual([3, 3, 4, 4, 4, 7, 8, 8]);
    expect(screwsForField(853, 1940)).toBe(24);
    expect(screwsForField(432, 240)).toBe(12);
  });

  it('P-ACC-02: drains per field', () => {
    expect([432, 853, 913.5, 973, 1936].map(drainsForField)).toEqual([2, 3, 3, 3, 5]);
  });

  it('rejects dimensions the rules cannot handle', () => {
    expect(() => generatePrestoBom({ ...int003, totalWidth: 900 })).toThrow(PrestoConfigError);
    expect(() => generatePrestoBom({ ...int003, totalHeight: 2500, transomHeight: 50 })).toThrow(PrestoConfigError);
  });

  it('extrapolates linearly outside the file, with the same rules', () => {
    const bom = generatePrestoBom({ ...int003, totalWidth: 1200, rightSideWidth: 0 });
    expect(bom.geometry.leafWidth).toBe(1120);
    expect(bom.elements[0]?.lines.find((l) => l.side === 'H')).toMatchObject({ ref: '32.800', lengthMm: 1200 });
    expect(findReferencePosition(bom.config)).toBeUndefined();
  });
});

describe('rule registry', () => {
  it('every generated line points to a documented rule', () => {
    const ids = new Set(PRESTO_RULES.map((r) => r.id));
    for (const ref of REFERENCE_POSITIONS) {
      for (const e of generatePrestoBom(ref.config).elements) for (const l of e.lines) expect(ids.has(l.ruleId)).toBe(true);
    }
  });
  it('flags the ambiguous rules as "à valider"', () => {
    expect(getRule('P-ACC-01').status).toBe('a_valider');
    expect(getRule('P-ACC-02').status).toBe('a_valider');
    expect(getRule('P-CFG-01').status).toBe('a_valider');
    expect(new Set(PRESTO_RULES.map((r) => r.id)).size).toBe(PRESTO_RULES.length);
  });
});
