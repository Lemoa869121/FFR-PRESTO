/** Parameters of a Forster Presto composition, in millimetres. */
export interface PrestoConfig {
  openingSide: 'interieur' | 'exterieur';
  leafCount: 1 | 2;
  /** DIN handing as written in forsterpro ("Sens d'ouverture DIN L / DIN R"). */
  din: 'L' | 'R';
  totalWidth: number;
  totalHeight: number;
  /** Length of the frame member over / under the left fixed part; 0 = no left part. */
  leftSideWidth: number;
  rightSideWidth: number;
  /** Height of the transom zone (outer jamb piece above the door); 0 = no transom. */
  transomHeight: number;
  /** Gap between the leaf and the finished floor (P-CFG-03); 10 mm in the FFR Presto file. */
  floorGap: number;
}

export type PrestoElementKind = 'dormant' | 'porte' | 'fixe';
export type LineGroup = 'profiles' | 'glazing_beads' | 'glazing' | 'hardware' | 'gaskets' | 'accessories';

export interface GeneratedLine {
  group: LineGroup;
  /** Article number; null for the infill (no article number in the source). */
  ref: string | null;
  quantity: number;
  unit: 'piece' | 'metre';
  lengthMm?: number;
  lengthAfterTrimMm?: number;
  /** "90° - 135°" (same notation as forsterpro). */
  cut?: string;
  /** D, G, H, B (outer members), Ha (vertical mullion), La (horizontal transom). */
  side?: 'D' | 'G' | 'H' | 'B' | 'Ha' | 'La';
  glass?: { widthMm: number; heightMm: number; areaM2: number; descriptionRaw: string };
  ruleId: string;
}

export interface GeneratedElement {
  kind: PrestoElementKind;
  label: string;
  /** Clear glazing size for fixed fields and leaves (mm). */
  clear?: { widthMm: number; heightMm: number };
  lines: GeneratedLine[];
}

export interface PrestoGeometry {
  doorFrameWidth: number;
  doorZoneHeight: number;
  leafWidth: number;
  leafHeight: number;
}

export interface PrestoBom {
  config: PrestoConfig;
  geometry: PrestoGeometry;
  elements: GeneratedElement[];
}
