import type { CompositionType, Dimensions, LeafCount } from '../types';
import { getComposition } from './compositions';
import { frameFromClearPassage, leafFromClearPassage } from '../calculation/presto/clearPassage';

/**
 * How the door width is given:
 * - door + fixed part(s): total width + clear passage → the fixed parts take the rest;
 * - double door alone: total width OR clear passage (choice of the user);
 * - single door alone: total width.
 */
export function usesClearPassage(type: CompositionType, leafCount: LeafCount, dims: Pick<Dimensions, 'sizingMode'>): boolean {
  const def = getComposition(type);
  if (!def.hasDoor) return false;
  if (def.hasLeftSide || def.hasRightSide) return true;
  return leafCount === 2 && dims.sizingMode === 'passage_libre';
}

/** Whether the user chooses between total width and clear passage (double door without fixed part). */
export function offersSizingChoice(type: CompositionType, leafCount: LeafCount): boolean {
  const def = getComposition(type);
  return def.hasDoor && leafCount === 2 && !def.hasLeftSide && !def.hasRightSide;
}

export interface DoorSizing {
  totalWidth: number;
  doorFrameWidth: number;
  leftSideWidth: number;
  rightSideWidth: number;
  /** Active leaf width of a double door when an active clear passage is given. */
  activeLeafWidth?: number;
  errors: string[];
}

/** Resolves total width, door frame passage and fixed-part widths from the entered values. */
export function resolveDoorSizing(type: CompositionType, leafCount: LeafCount, dims: Dimensions): DoorSizing {
  const def = getComposition(type);
  const errors: string[] = [];
  let totalWidth = dims.totalWidth;
  let doorFrameWidth: number;
  let leftSideWidth = 0;
  let rightSideWidth = 0;

  if (usesClearPassage(type, leafCount, dims)) {
    if (!(dims.clearPassage && dims.clearPassage > 0)) {
      errors.push('Passage libre manquant.');
      return { totalWidth, doorFrameWidth: 0, leftSideWidth, rightSideWidth, errors };
    }
    doorFrameWidth = frameFromClearPassage(dims.clearPassage, leafCount);
    if (def.hasLeftSide || def.hasRightSide) {
      const rest = totalWidth - doorFrameWidth;
      const parts = (def.hasLeftSide ? 1 : 0) + (def.hasRightSide ? 1 : 0);
      const each = rest / parts;
      if (each <= 50) errors.push('Largeur totale insuffisante pour le passage libre demandé : la partie fixe serait trop étroite.');
      if (def.hasLeftSide) leftSideWidth = each;
      if (def.hasRightSide) rightSideWidth = each;
    } else {
      totalWidth = doorFrameWidth;
    }
  } else {
    doorFrameWidth = totalWidth;
  }

  let activeLeafWidth: number | undefined;
  if (def.hasDoor && leafCount === 2 && dims.activeClearPassage && dims.activeClearPassage > 0) {
    activeLeafWidth = leafFromClearPassage(dims.activeClearPassage);
  }
  return { totalWidth, doorFrameWidth, leftSideWidth, rightSideWidth, activeLeafWidth, errors };
}
