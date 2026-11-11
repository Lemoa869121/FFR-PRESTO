import type { PrestoConfig } from './types';

/**
 * The 32 positions of the forsterpro file "FFR Presto", expressed as Presto
 * parameters. Widths of the fixed parts and transom height are the lengths of the
 * frame members printed in the file (e.g. 32.851 963,5 under the side part,
 * 32.851 330 in the transom zone). Checked against the imported document by
 * src/tests/prestoRules.test.ts.
 */
export interface ReferencePosition {
  id: string;
  /** First PDF page of the position in the source document. */
  pdfPage: number;
  /** Size printed in the file (rounded by forsterpro, see analysis I2). */
  sizeRaw: string;
  config: PrestoConfig;
}

const BASE: { suffix: string; intPage: number; extPage: number; size: string; leaves: 1 | 2; L: number; R: number; W: number; H: number; din: 'L' | 'R' }[] = [
  { suffix: '001', intPage: 1, extPage: 72, size: '1.073 x 2.170 mm', leaves: 1, L: 0, R: 0, W: 1073, H: 2170, din: 'L' },
  { suffix: '002', intPage: 4, extPage: 75, size: '1.073 x 2.500 mm', leaves: 1, L: 0, R: 0, W: 1073, H: 2500, din: 'L' },
  { suffix: '003', intPage: 8, extPage: 79, size: '2.037 x 2.170 mm', leaves: 1, L: 0, R: 963.5, W: 2036.5, H: 2170, din: 'L' },
  { suffix: '003b', intPage: 12, extPage: 83, size: '2.037 x 2.170 mm', leaves: 1, L: 963.5, R: 0, W: 2036.5, H: 2170, din: 'R' },
  { suffix: '004', intPage: 16, extPage: 87, size: '2.037 x 2.500 mm', leaves: 1, L: 0, R: 963.5, W: 2036.5, H: 2500, din: 'L' },
  { suffix: '004b', intPage: 21, extPage: 92, size: '2.037 x 2.500 mm', leaves: 1, L: 963.5, R: 0, W: 2036.5, H: 2500, din: 'R' },
  { suffix: '005', intPage: 26, extPage: 97, size: '3.000 x 2.170 mm', leaves: 1, L: 963.5, R: 963.5, W: 3000, H: 2170, din: 'L' },
  { suffix: '006', intPage: 30, extPage: 101, size: '3.000 x 2.500 mm', leaves: 1, L: 963.5, R: 963.5, W: 3000, H: 2500, din: 'L' },
  { suffix: '007', intPage: 35, extPage: 106, size: '2.036 x 2.170 mm', leaves: 2, L: 0, R: 0, W: 2036, H: 2170, din: 'L' },
  { suffix: '008', intPage: 38, extPage: 109, size: '2.036 x 2.500 mm', leaves: 2, L: 0, R: 0, W: 2036, H: 2500, din: 'L' },
  { suffix: '009', intPage: 42, extPage: 113, size: '2.518 x 2.170 mm', leaves: 2, L: 0, R: 482, W: 2518, H: 2170, din: 'L' },
  { suffix: '009b', intPage: 46, extPage: 117, size: '2.518 x 2.170 mm', leaves: 2, L: 482, R: 0, W: 2518, H: 2170, din: 'R' },
  { suffix: '010', intPage: 50, extPage: 121, size: '2.518 x 2.500 mm', leaves: 2, L: 0, R: 482, W: 2518, H: 2500, din: 'L' },
  { suffix: '010b', intPage: 55, extPage: 126, size: '2.518 x 2.500 mm', leaves: 2, L: 482, R: 0, W: 2518, H: 2500, din: 'R' },
  { suffix: '011', intPage: 61, extPage: 132, size: '3.000 x 2.170 mm', leaves: 2, L: 482, R: 482, W: 3000, H: 2170, din: 'L' },
  { suffix: '012', intPage: 66, extPage: 137, size: '3.000 x 2.500 mm', leaves: 2, L: 482, R: 482, W: 3000, H: 2500, din: 'L' },
];

/** Floor gap of every position of the file ("Jeu de porte : 10 mm"). */
export const REFERENCE_FLOOR_GAP = 10;

/** Door zone height of every position of the file (H − T). */
export const REFERENCE_DOOR_ZONE_HEIGHT = 2170;

export const REFERENCE_POSITIONS: readonly ReferencePosition[] = (['interieur', 'exterieur'] as const).flatMap((side) =>
  BASE.map((b): ReferencePosition => ({
    id: `${side === 'interieur' ? 'Int' : 'Ext'} ${b.suffix}`,
    pdfPage: side === 'interieur' ? b.intPage : b.extPage,
    sizeRaw: b.size,
    config: {
      openingSide: side,
      leafCount: b.leaves,
      din: b.din,
      totalWidth: b.W,
      totalHeight: b.H,
      leftSideWidth: b.L,
      rightSideWidth: b.R,
      transomHeight: b.H - REFERENCE_DOOR_ZONE_HEIGHT,
      floorGap: REFERENCE_FLOOR_GAP,
    },
  })),
);

const activeOf = (c: PrestoConfig) =>
  c.leafCount === 2 ? c.activeLeafWidth ?? (c.totalWidth - c.leftSideWidth - c.rightSideWidth - 50) / 2 : 0;

const same = (a: PrestoConfig, b: PrestoConfig) =>
  a.openingSide === b.openingSide && a.leafCount === b.leafCount && a.din === b.din &&
  Math.abs(a.totalWidth - b.totalWidth) < 1e-6 && Math.abs(a.totalHeight - b.totalHeight) < 1e-6 &&
  Math.abs(a.leftSideWidth - b.leftSideWidth) < 1e-6 && Math.abs(a.rightSideWidth - b.rightSideWidth) < 1e-6 &&
  Math.abs(a.transomHeight - b.transomHeight) < 1e-6 && Math.abs(a.floorGap - b.floorGap) < 1e-6 &&
  Math.abs(activeOf(a) - activeOf(b)) < 1e-6;

export function findReferencePosition(config: PrestoConfig): ReferencePosition | undefined {
  return REFERENCE_POSITIONS.find((p) => same(p.config, config));
}

/** Parameter values observed in the file, used to flag extrapolated results. */
export const OBSERVED_DOMAIN = {
  doorFrameWidth: { 1: [1073], 2: [2036] } as Record<1 | 2, number[]>,
  doorZoneHeight: [REFERENCE_DOOR_ZONE_HEIGHT],
  transomHeight: [330],
  sideWidth: { 1: [963.5], 2: [482] } as Record<1 | 2, number[]>,
  floorGap: [REFERENCE_FLOOR_GAP],
};
