/**
 * Raw structured data imported from a forsterpro "Dossier de fabrication" PDF
 * (text extracted page by page with `pdftotext -layout`).
 * Values are kept exactly as printed (`*Raw` fields) next to their parsed value.
 */

export interface PdfLineRef {
  /** Physical PDF page (1-based). */
  pdfPage: number;
  /** Page number printed in the footer of the section. */
  printedPage: number;
  /** Line number in the extracted text of the page (1-based). */
  line: number;
}

export type BomGroup = 'profiles' | 'glazing_beads' | 'glazing' | 'hardware' | 'gaskets' | 'accessories';

export interface ImportedBomLine {
  group: BomGroup;
  /** Article number, null for the glazing rows ("Sans vitrage, 9 mm"). */
  ref: string | null;
  descriptionRaw: string;
  unitRaw: 'Pce' | 'pce' | 'm';
  /** Quantity per field, as printed ("1", "5,58"). */
  qtyRaw: string;
  /** Expression in brackets ("1", "1*2", "5,98*2"). */
  qtyExpressionRaw: string;
  /** Evaluated total for the element (qty per field × number of fields). */
  qtyTotal: number;
  lengthMm?: number;
  lengthRaw?: string;
  /** "Max/Dim." value printed under the row. */
  maxDimMm?: number;
  /** "Longueur après délardage" value printed under the row. */
  lengthAfterTrimMm?: number;
  cutAnglesRaw?: string;
  /** "D/1", "Ha/7"… (spaces removed). */
  orientationRaw?: string;
  glass?: { widthMm: number; heightMm: number; areaM2: number; fieldNo: number };
  source: PdfLineRef;
}

export interface ImportedSash {
  id: string;
  widthMm: number;
  heightMm: number;
  weightKg: number;
  source: PdfLineRef;
}

export interface ImportedElement {
  /** "0" for the frame, "2", "1,3" (grouped identical fields). */
  indexRaw: string;
  fieldIndexes: number[];
  labelRaw: string;
  kind: 'dormant' | 'porte' | 'fixe';
  sashes: ImportedSash[];
  floorConnectionRaw?: string;
  doorGapRaw?: string;
  lines: ImportedBomLine[];
  source: PdfLineRef;
}

export interface ImportedPosition {
  id: string;
  quantity: number;
  seriesRaw: string;
  sizeRaw: string;
  widthMm: number;
  heightMm: number;
  drainageRaw: string;
  materialRaw: string;
  outerGasketRaw: string;
  sourceWarnings: { text: string; source: PdfLineRef }[];
  elements: ImportedElement[];
  source: PdfLineRef;
}

export interface ImportedCut {
  qty: number;
  orientationRaw: string;
  cutLengthMm: number;
  lengthMm: number;
  anglesRaw: string;
  positionId: string;
  source: PdfLineRef;
}

export interface ImportedCuttingPlan {
  ref: string;
  descriptionRaw: string;
  stockBars: number;
  barLengthMm: number;
  sectionRaw: string;
  wasteMm: number;
  wastePct: number;
  usableOffcutMm: number;
  sawKerfMm: number;
  endWasteMm: number;
  patterns: { repeat: number; cuts: ImportedCut[]; source: PdfLineRef }[];
  source: PdfLineRef;
}

export interface ImportedOffcut {
  ref: string;
  descriptionRaw: string;
  codeRaw: string;
  qty: number;
  lengthMm: number;
  source: PdfLineRef;
}

export interface ImportedCuttingSummaryLine {
  ref: string;
  descriptionRaw: string;
  bars: number;
  barLengthMm: number;
  wasteMm: number;
  wastePct: number;
  source: PdfLineRef;
}

export interface ForsterproDocument {
  documentId: string;
  fileName: string;
  sha256: string;
  affaire: string;
  editedAtRaw: string;
  pageCount: number;
  positions: ImportedPosition[];
  cuttingPlans: ImportedCuttingPlan[];
  offcuts: ImportedOffcut[];
  cuttingSummary: ImportedCuttingSummaryLine[];
  /** Non-empty lines the parser could not classify (must stay empty). */
  unparsed: { pdfPage: number; line: number; text: string }[];
}
