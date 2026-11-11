import type { GeneratedElement, GeneratedLine, PrestoBom, PrestoConfig } from './types';
import { LEAF_GEOMETRY } from '../../data/sources/presto-manual/manual';
import { DOUBLE_MEETING_MM, clearHeightFromDoorZone, clearPassageFromFrame, clearPassageOfLeaf } from './clearPassage';

/**
 * Generates the bill of materials of a Forster Presto composition by applying the
 * derived rules of ./rules.ts. Each line carries the id of the rule that produced it.
 * Pure function: no I/O, no price.
 */

const GASKET_ALLOWANCE = 1.03; // P-JNT-01..03
const INFILL_DESCRIPTION = 'Sans vitrage, 9 mm'; // only infill present in the source

/** Rounds half up with `digits` decimals, tolerant to binary floating noise. */
export function roundHalfUp(value: number, digits = 0): number {
  const f = 10 ** digits;
  return Math.round(Number((value * f).toFixed(6))) / f;
}

const metres = (mm: number) => roundHalfUp((GASKET_ALLOWANCE * mm) / 1000, 2);

/** P-ACC-01 — screws per side of a field. */
export function screwsPerSide(lengthMm: number): number {
  return Math.max(3, Math.ceil(Number((lengthMm / 277).toFixed(6))));
}

/** P-ACC-01 — screws for a field. */
export function screwsForField(clearW: number, clearH: number): number {
  return 2 * screwsPerSide(clearW) + 2 * screwsPerSide(clearH);
}

/** P-ACC-02 — drain sockets for a field. */
export function drainsForField(clearW: number): number {
  return Math.floor(clearW / 400) + 1;
}

/** P-JNT-03 — glazing gasket length (m) for a field. */
export function glazingGasketForField(clearW: number, clearH: number): number {
  return metres(2 * (clearW + clearH - 40));
}

/** P-VIT-04 — infill size for a clear opening. */
export function infillFor(clearW: number, clearH: number) {
  const widthMm = roundHalfUp(clearW - 16);
  const heightMm = roundHalfUp(clearH + 24);
  return { widthMm, heightMm, areaM2: roundHalfUp((widthMm * heightMm) / 1e6, 2), descriptionRaw: INFILL_DESCRIPTION };
}

function profile(ref: string, lengthMm: number, cut: string, side: GeneratedLine['side'], ruleId: string, extra: Partial<GeneratedLine> = {}): GeneratedLine {
  return { group: 'profiles', ref, quantity: 1, unit: 'piece', lengthMm, cut, side, ruleId, ...extra };
}
function pieces(group: GeneratedLine['group'], ref: string, quantity: number, ruleId: string): GeneratedLine {
  return { group, ref, quantity, unit: 'piece', ruleId };
}
function gasket(ref: string, quantity: number, ruleId: string): GeneratedLine {
  return { group: 'gaskets', ref, quantity, unit: 'metre', ruleId };
}

/** P-VIT-03 / 04 / P-JNT-03 / P-ACC-01 — beads, infill, gaskets and screws of `count` identical fields. */
function glazedField(clearW: number, clearH: number, count: number): GeneratedLine[] {
  const beads = (['D', 'G', 'B', 'H'] as const).map((side): GeneratedLine => ({
    group: 'glazing_beads', ref: '901335', quantity: count, unit: 'piece',
    lengthMm: side === 'D' || side === 'G' ? clearH : clearW, cut: '90° - 90°', side, ruleId: 'P-VIT-03',
  }));
  const gasketM = roundHalfUp(glazingGasketForField(clearW, clearH) * count, 2);
  return [
    ...beads,
    { group: 'glazing', ref: null, quantity: count, unit: 'piece', glass: infillFor(clearW, clearH), ruleId: 'P-VIT-04' },
    gasket('905312', gasketM, 'P-JNT-03'),
    gasket('905317', gasketM, 'P-JNT-03'),
    pieces('accessories', '906579', screwsForField(clearW, clearH) * count, 'P-ACC-01'),
  ];
}

export class PrestoConfigError extends Error {
  override name = 'PrestoConfigError';
}

export function generatePrestoBom(config: PrestoConfig): PrestoBom {
  const ext = config.openingSide === 'exterieur';
  const { leftSideWidth: L, rightSideWidth: R, transomHeight: T, totalWidth: W, totalHeight: H } = config;
  const Wd = W - L - R;
  const Hd = H - T;
  const double = config.leafCount === 2;
  // P-VAN-01 (manual VP 3.5.32 / 3.5.33): 36 mm frame face + 4 mm rebate play at head and jambs,
  // floor gap below the leaf. P-VAN-05: double-leaf width derived from the FFR Presto file.
  const perSide = LEAF_GEOMETRY.frameOverlapMm + LEAF_GEOMETRY.rebatePlayMm;
  const leafWidth = double ? config.activeLeafWidth ?? (Wd - DOUBLE_MEETING_MM) / 2 : Wd - 2 * perSide;
  const secondaryLeafWidth = double ? Wd - DOUBLE_MEETING_MM - leafWidth : undefined;
  const leafHeight = Hd - perSide - config.floorGap;
  if (Wd <= 0 || Hd <= 0 || leafWidth <= 140 || leafHeight <= 180 || (secondaryLeafWidth !== undefined && secondaryLeafWidth <= 140)) {
    throw new PrestoConfigError('Dimensions incompatibles avec les règles Presto (passage ou vantail trop petit).');
  }
  if ((L > 0 && L <= 50) || (R > 0 && R <= 50) || (T > 0 && T <= 90)) {
    throw new PrestoConfigError('Partie latérale ou imposte trop petite pour les règles Presto.');
  }
  const mullion = ext ? '32.805' : '32.803';

  // ── Dormant ───────────────────────────────────────────────
  const dor: GeneratedLine[] = [];
  if (R > 0) dor.push(profile('32.851', H, '135° - 135°', 'D', 'P-DOR-01'));
  else {
    dor.push(profile('32.800', Hd, ext ? '135° - 90°' : '90° - 135°', 'D', 'P-DOR-02'));
    if (T > 0) dor.push(profile('32.851', T, '90° - 135°', 'D', 'P-DOR-03'));
  }
  if (L > 0) dor.push(profile('32.851', H, '135° - 135°', 'G', 'P-DOR-01'));
  else {
    dor.push(profile('32.800', Hd, ext ? '90° - 135°' : '135° - 90°', 'G', 'P-DOR-02'));
    if (T > 0) dor.push(profile('32.851', T, '135° - 90°', 'G', 'P-DOR-03'));
  }
  if (R > 0) dor.push(profile('32.851', R, '90° - 135°', 'B', 'P-DOR-04'));
  if (L > 0) dor.push(profile('32.851', L, '135° - 90°', 'B', 'P-DOR-04'));
  if (T > 0) dor.push(profile('32.851', W, '135° - 135°', 'H', 'P-DOR-06'));
  else {
    if (R > 0) dor.push(profile('32.851', R, '135° - 90°', 'H', 'P-DOR-05'));
    dor.push(profile('32.800', Wd, '135° - 135°', 'H', 'P-DOR-05'));
    if (L > 0) dor.push(profile('32.851', L, '90° - 135°', 'H', 'P-DOR-05'));
  }
  const mullions: [number, string, string][] = [
    [R, '90° - 135°', '45° - 90°'],
    [L, '135° - 90°', '90° - 45°'],
  ];
  for (const [width, cutInt, cutExt] of mullions) {
    if (width <= 0) continue;
    dor.push(profile(mullion, Hd + 20, ext ? cutExt : cutInt, 'Ha', 'P-DOR-07', T > 0 ? {} : { lengthAfterTrimMm: Hd }));
    if (T > 0) dor.push(profile('32.852', T - 50, '90° - 90°', 'Ha', 'P-DOR-08'));
  }
  if (T > 0) {
    const framedEnds = (L > 0 ? 0 : 1) + (R > 0 ? 0 : 1);
    dor.push(profile(mullion, Wd + 40, ext ? '45° - 45°' : '135° - 135°', 'La', 'P-DOR-09', framedEnds > 0 ? { lengthAfterTrimMm: Wd + 40 - 20 * framedEnds } : {}));
    for (const width of [L, R]) if (width > 0) dor.push(profile('32.852', width - 50, '90° - 90°', 'La', 'P-DOR-10'));
  }
  const left = L > 0 ? Hd + 20 : Hd;
  const right = R > 0 ? Hd + 20 : Hd;
  const top = T > 0 ? Wd + 40 : Wd;
  dor.push(gasket('905306', metres(left + right + top), 'P-JNT-01'));

  // ── Fixed fields (P-VIT-02) ───────────────────────────────
  const fields: { label: string; w: number; h: number }[] = [];
  if (L > 0) fields.push({ label: 'Partie latérale gauche', w: L - 50, h: Hd - 140 });
  if (R > 0) fields.push({ label: 'Partie latérale droite', w: R - 50, h: Hd - 140 });
  if (T > 0) {
    if (L > 0) fields.push({ label: 'Imposte gauche', w: L - 50, h: T - 90 });
    fields.push({ label: 'Imposte au-dessus de la porte', w: Wd - 100, h: T - 90 });
    if (R > 0) fields.push({ label: 'Imposte droite', w: R - 50, h: T - 90 });
  }
  const fieldDrains = fields.reduce((n, f) => n + drainsForField(f.w), 0);
  if (fieldDrains > 0) dor.push(pieces('accessories', '900100', fieldDrains, 'P-ACC-02'));

  // ── Door (P-VAN / P-QUI / P-ACC) ──────────────────────────
  const leaves = double ? 2 : 1;
  const stile = ext ? '32.803' : '32.805';
  const stileCut = ext ? '45° - 45°' : '135° - 135°';
  const meetingOnFirst = (config.din === 'L') !== ext;
  const door: GeneratedLine[] = [];
  const widths = double ? [leafWidth, secondaryLeafWidth ?? leafWidth] : [leafWidth];
  for (let i = 0; i < leaves; i += 1) {
    const width = widths[i] ?? leafWidth;
    for (const side of ['D', 'G'] as const) {
      const meeting = double && ((meetingOnFirst && i === 0 && side === 'D') || (!meetingOnFirst && i === 1 && side === 'G'));
      door.push(meeting
        ? profile(ext ? '32.805' : '32.803', leafHeight, ext ? '135° - 135°' : '45° - 45°', side, 'P-VAN-04', { lengthAfterTrimMm: leafHeight - 34 })
        : profile(stile, leafHeight, stileCut, side, 'P-VAN-02'));
    }
    door.push(profile('32.855', width, '45° - 45°', 'B', 'P-VAN-03'));
    door.push(profile(stile, width, stileCut, 'H', 'P-VAN-02'));
  }
  const leafClearW = leafWidth - 140; // P-VIT-01 (active leaf)
  const leafClearH = leafHeight - 180;
  // Identical leaves are grouped (count 2), as in the forsterpro file.
  const distinct = [...new Set(widths)];
  for (const w of distinct) door.push(...glazedField(w - 140, leafClearH, widths.filter((x) => x === w).length));
  door.push(pieces('hardware', '907662', 3 * leaves, 'P-QUI-01'));
  for (const ref of ['FFR019FND', 'FFR042FND', 'FFR046FND']) door.push(pieces('hardware', ref, 1, 'P-QUI-02'));
  if (double) for (const ref of ['FFR045FND', 'FFR049FND', 'FFR050FND']) door.push(pieces('hardware', ref, 1, 'P-QUI-03'));
  door.push(gasket('905306', metres(widths.reduce((s, w) => s + 2 * leafHeight + w, 0)), 'P-JNT-02'));
  door.push(pieces('accessories', '900100', widths.reduce((s, w) => s + drainsForField(w - 140), 0), 'P-ACC-02'));
  if (double) {
    door.push(pieces('accessories', '916320', config.din === 'L' ? 3 : 2, 'P-ACC-03'));
    door.push(pieces('accessories', '916322', config.din === 'L' ? 2 : 3, 'P-ACC-03'));
    door.push(pieces('accessories', config.din === 'L' ? '905703' : '905702', 2, 'P-ACC-04'));
  } else {
    door.push(pieces('accessories', '916320', 1, 'P-ACC-03'));
    door.push(pieces('accessories', '916322', 1, 'P-ACC-03'));
  }

  const elements: GeneratedElement[] = [
    { kind: 'dormant', label: 'Dormant', lines: dor },
    {
      kind: 'porte',
      label: `${double ? 'Porte 2 vantaux' : 'Porte 1 vantail'} ${ext ? 'extérieure' : 'intérieure'} — DIN ${config.din}`,
      clear: { widthMm: leafClearW, heightMm: leafClearH },
      lines: door,
    },
    ...fields.map((f): GeneratedElement => ({ kind: 'fixe', label: f.label, clear: { widthMm: f.w, heightMm: f.h }, lines: glazedField(f.w, f.h, 1) })),
  ];
  return {
    config,
    geometry: {
      doorFrameWidth: Wd,
      doorZoneHeight: Hd,
      leafWidth,
      secondaryLeafWidth,
      leafHeight,
      clearPassage: clearPassageFromFrame(Wd, config.leafCount),
      activeClearPassage: clearPassageOfLeaf(leafWidth),
      clearHeight: clearHeightFromDoorZone(Hd),
    },
    elements,
  };
}
