import type { CompositionType, Dimensions, Handing, LeafCount, OpeningSide } from '../types';
import { getComposition } from './compositions';

export interface Rect { x: number; y: number; w: number; h: number }

export interface PreviewPanel extends Rect {
  kind: 'fixe' | 'vantail';
  /** Hinge side for leaves (seen from the drawing). */
  hinge?: 'gauche' | 'droite';
  label: string;
}

export interface PreviewDimension {
  orientation: 'horizontal' | 'vertical';
  from: number;
  to: number;
  /** Offset level (0 = closest to the frame). */
  level: number;
  value: number;
}

export interface PreviewLayout {
  width: number;
  height: number;
  panels: PreviewPanel[];
  dividers: { x1: number; y1: number; x2: number; y2: number }[];
  dimensions: PreviewDimension[];
}

/**
 * Simplified geometry for the SVG preview (proportional, not a shop drawing).
 * Coordinates are in millimetres, origin at the top-left corner of the frame.
 */
export interface PreviewOptions {
  openingSide?: OpeningSide;
  /** Real leaf widths of a double door (active / passive), to draw unequal leaves. */
  leafWidths?: { active: number; passive: number };
}

/**
 * Hinge side as seen on the drawing (exterior view, as in forsterpro): DIN is read from
 * the side towards which the door opens, so an inward-opening door is mirrored.
 */
export function hingeSideInView(handing: Handing, openingSide: OpeningSide = 'interieur'): 'gauche' | 'droite' {
  const dinLeft = handing === 'din_gauche';
  return dinLeft === (openingSide === 'exterieur') ? 'gauche' : 'droite';
}

export function computePreviewLayout(type: CompositionType, leafCount: LeafCount, dims: Dimensions, handing: Handing, options: PreviewOptions = {}): PreviewLayout | null {
  const def = getComposition(type);
  const W = dims.totalWidth;
  const H = dims.totalHeight;
  if (!(W > 0) || !(H > 0)) return null;
  const left = def.hasLeftSide ? Math.max(dims.leftSideWidth ?? 0, 0) : 0;
  const right = def.hasRightSide ? Math.max(dims.rightSideWidth ?? 0, 0) : 0;
  const transom = def.hasTransom ? Math.max(dims.transomHeight ?? 0, 0) : 0;
  const centre = W - left - right;
  if (centre <= 0 || transom >= H) return null;
  const lowerTop = transom;
  const lowerH = H - transom;

  const panels: PreviewPanel[] = [];
  const dividers: PreviewLayout['dividers'] = [];
  const columns: { x: number; w: number; kind: 'lat' | 'centre' }[] = [];
  if (left > 0) columns.push({ x: 0, w: left, kind: 'lat' });
  columns.push({ x: left, w: centre, kind: 'centre' });
  if (right > 0) columns.push({ x: left + centre, w: right, kind: 'lat' });

  columns.forEach((col, i) => {
    if (i > 0) dividers.push({ x1: col.x, y1: 0, x2: col.x, y2: H });
    if (transom > 0) panels.push({ kind: 'fixe', x: col.x, y: 0, w: col.w, h: transom, label: 'Imposte' });
    if (col.kind === 'lat' || !def.hasDoor) {
      panels.push({ kind: 'fixe', x: col.x, y: lowerTop, w: col.w, h: lowerH, label: col.kind === 'lat' ? 'Fixe' : 'Châssis fixe' });
      return;
    }
    const hingeMain = hingeSideInView(handing, options.openingSide);
    if (leafCount === 2) {
      // The active leaf is hinged on the DIN side; both leaves are hinged on the outer jambs.
      const lw = options.leafWidths;
      const activeShare = lw && lw.active > 0 && lw.passive > 0 ? lw.active / (lw.active + lw.passive) : 0.5;
      const leftShare = hingeMain === 'gauche' ? activeShare : 1 - activeShare;
      const split = col.w * leftShare;
      dividers.push({ x1: col.x + split, y1: lowerTop, x2: col.x + split, y2: H });
      panels.push({ kind: 'vantail', x: col.x, y: lowerTop, w: split, h: lowerH, hinge: 'gauche', label: hingeMain === 'gauche' ? 'Vantail principal' : 'Vantail semi-fixe' });
      panels.push({ kind: 'vantail', x: col.x + split, y: lowerTop, w: col.w - split, h: lowerH, hinge: 'droite', label: hingeMain === 'droite' ? 'Vantail principal' : 'Vantail semi-fixe' });
    } else {
      panels.push({ kind: 'vantail', x: col.x, y: lowerTop, w: col.w, h: lowerH, hinge: hingeMain, label: 'Vantail' });
    }
  });
  if (transom > 0) dividers.push({ x1: 0, y1: transom, x2: W, y2: transom });

  const dimensions: PreviewDimension[] = [{ orientation: 'horizontal', from: 0, to: W, level: 1, value: W }];
  if (columns.length > 1) {
    columns.forEach((c) => dimensions.push({ orientation: 'horizontal', from: c.x, to: c.x + c.w, level: 0, value: c.w }));
  }
  dimensions.push({ orientation: 'vertical', from: 0, to: H, level: 1, value: H });
  if (transom > 0) {
    dimensions.push({ orientation: 'vertical', from: 0, to: transom, level: 0, value: transom });
    dimensions.push({ orientation: 'vertical', from: transom, to: H, level: 0, value: lowerH });
  }
  return { width: W, height: H, panels, dividers, dimensions };
}
