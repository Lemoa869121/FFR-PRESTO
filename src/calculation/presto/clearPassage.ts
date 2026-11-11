/**
 * Clear passage ("passage libre", leaf opened at 90°) of Forster Presto doors.
 *
 * Source: drawings of the FFR Presto file, which annotate every door with
 * "PL(90°)" and "PLD": single door, frame 1 073 → PL 900; double door, frame 2 036
 * → PL 1 830 for both leaves and PL 900 for the active leaf; PLD 2 100 for a door
 * zone of 2 170. Frame face 70 mm (32.800, guide VP 3.2.2 / 3.5.33).
 * The leaf opened at 90° takes 33 mm of the opening (derived: 1 073 − 2 × 70 − 33 = 900).
 * Rules P-PL-01 to P-PL-03 (derived, one door width per type in the file).
 */

export const FRAME_FACE_MM = 70;
export const OPEN_LEAF_PROTRUSION_MM = 33;
/** Active-leaf clear passage = leaf width − 93 (993 → 900, single and double doors). */
export const LEAF_TO_CLEAR_MM = 93;
/** Meeting allowance of a double door: leaves = frame passage − 50 (P-VAN-05). */
export const DOUBLE_MEETING_MM = 50;

/** P-PL-01 — clear passage of the whole door (all leaves open). */
export function clearPassageFromFrame(doorFrameWidth: number, leafCount: 1 | 2): number {
  return doorFrameWidth - 2 * FRAME_FACE_MM - OPEN_LEAF_PROTRUSION_MM * leafCount;
}

/** P-PL-01 — door frame passage for a required clear passage. */
export function frameFromClearPassage(clearPassage: number, leafCount: 1 | 2): number {
  return clearPassage + 2 * FRAME_FACE_MM + OPEN_LEAF_PROTRUSION_MM * leafCount;
}

/** P-PL-02 — active leaf width for a required active-leaf clear passage. */
export function leafFromClearPassage(activeClearPassage: number): number {
  return activeClearPassage + LEAF_TO_CLEAR_MM;
}

export function clearPassageOfLeaf(leafWidth: number): number {
  return leafWidth - LEAF_TO_CLEAR_MM;
}

/** P-PL-03 — clear height (from finished floor to the frame head). */
export function clearHeightFromDoorZone(doorZoneHeight: number): number {
  return doorZoneHeight - FRAME_FACE_MM;
}

/** Standard clear-passage units ("unités de passage") given by the user. */
export const PASSAGE_UNITS = [
  { id: '1UP', label: '1 UP — 900 mm', clearPassage: 900, activeClearPassage: 900, leafCounts: [1] as (1 | 2)[] },
  { id: '2UP', label: '2 UP — 1 400 mm (900 + 500)', clearPassage: 1400, activeClearPassage: 900, leafCounts: [2] as (1 | 2)[] },
  { id: '3UP', label: '3 UP — 1 800 mm', clearPassage: 1800, activeClearPassage: 900, leafCounts: [2] as (1 | 2)[] },
] as const;
