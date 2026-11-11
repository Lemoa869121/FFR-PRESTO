/**
 * Core domain types for ForsterCalc.
 * Business rules never live in React components: components consume these types
 * and call the calculation / storage modules.
 */

export type CompositionType =
  | 'porte_simple'
  | 'porte_double'
  | 'chassis_fixe'
  | 'porte_imposte'
  | 'porte_lateral_gauche'
  | 'porte_lateral_droite'
  | 'porte_deux_laterales'
  | 'porte_imposte_lateral_gauche'
  | 'porte_imposte_lateral_droite'
  | 'porte_imposte_laterales'
  | 'personnalisee';

export type LeafCount = 1 | 2;

/** Kind of physical element inside a composition. */
export type ElementKind = 'dormant' | 'porte' | 'fixe_lateral' | 'imposte';

export interface Element {
  id: string;
  kind: ElementKind;
  /** Position in the composition grid, left to right / bottom to top. */
  column: 'gauche' | 'centre' | 'droite';
  row: 'bas' | 'haut';
  widthMm: number;
  heightMm: number;
}

export interface Composition {
  type: CompositionType;
  leafCount: LeafCount;
  elements: Element[];
}

/** All dimensions in millimetres. Optional fields are only used by some compositions. */
export interface Dimensions {
  totalWidth: number;
  totalHeight: number;
  mainLeafWidth?: number;
  secondaryLeafWidth?: number;
  transomHeight?: number;
  leftSideWidth?: number;
  rightSideWidth?: number;
}

export type OpeningSide = 'interieur' | 'exterieur';
export type Handing = 'tirant_gauche' | 'tirant_droit';

export interface TechnicalOptions {
  system: string;
  openingDirection: string;
  openingSide: OpeningSide;
  handing: Handing;
  glazingType: string;
  infillType: string;
  finish: string;
  colour: string;
  lockType: string;
  handleType: string;
  doorCloser: string;
  panicBar: string;
  otherAccessories: string;
}

export interface Project {
  name: string;
  quoteReference: string;
  clientName?: string;
  description?: string;
  /** ISO date (YYYY-MM-DD). */
  createdOn: string;
  quantity: number;
}

export type QuoteStatus = 'brouillon' | 'a_completer' | 'calcule';

export interface Quote {
  id: string;
  project: Project;
  composition: Composition;
  dimensions: Dimensions;
  options: TechnicalOptions;
  status: QuoteStatus;
  createdAt: string;
  updatedAt: string;
  /** Total material price for the requested quantity, null while no price source exists. */
  totalPrice: number | null;
}

export type MaterialCategory =
  | 'profiles'
  | 'renforts'
  | 'joints'
  | 'vitrage'
  | 'panneaux'
  | 'quincaillerie'
  | 'accessoires'
  | 'consommables';

/** Where a value comes from. Every calculated line must be traceable to one. */
export interface PriceSource {
  fileName: string;
  sheet?: string;
  cell?: string;
  row?: number;
  importedAt: string;
}

/** Location inside an imported document (PDF page / line, spreadsheet sheet / cell). */
export interface SourceLocation {
  documentId: string;
  section: string;
  pdfPage?: number;
  printedPage?: number;
  line?: number;
  sheet?: string;
  cell?: string;
}

export type RuleStatus = 'explicite' | 'derivee' | 'a_valider' | 'manquante' | 'demonstration';

export interface MaterialItem {
  reference: string;
  designation: string;
  category: MaterialCategory;
  unit: 'piece' | 'metre';
}

export interface CuttingListItem {
  reference: string;
  designation: string;
  category: MaterialCategory;
  /** Cutting length in mm (profiles, beads). */
  unitLengthMm?: number;
  /** Final length after trimming ("longueur après délardage") when it differs. */
  lengthAfterTrimMm?: number;
  cutAngles?: string;
  orientation?: string;
  quantity: number;
  unit: 'piece' | 'metre';
  /** Cumulated length in metres. */
  totalLengthM?: number;
  unitPrice: number | null;
  totalPrice: number | null;
  /** Human readable source ("Règle P-DOR-03, dérivée de 32 positions"). */
  dataSource: string;
  comment?: string;
  trace: {
    ruleId: string;
    ruleStatus: RuleStatus;
    referenceSource?: SourceLocation;
    priceSource: PriceSource | null;
  };
}

export type WarningLevel = 'info' | 'attention' | 'bloquant';

export interface ValidationWarning {
  code: string;
  level: WarningLevel;
  message: string;
  field?: string;
}

export interface CalculationTotals {
  profiles: number | null;
  glazingOrInfill: number | null;
  hardware: number | null;
  accessories: number | null;
  other: number | null;
  material: number | null;
  materialForQuantity: number | null;
}

export interface CalculationResult {
  status: 'non_calcule' | 'calcule' | 'partiel';
  cuttingList: CuttingListItem[];
  totals: CalculationTotals;
  warnings: ValidationWarning[];
  /** Id of the reference position the configuration matches exactly, if any. */
  referencePositionId?: string;
}

/** Mapping between a column of an imported spreadsheet and a target field. */
export interface ImportMapping {
  sourceFile: string;
  sheet: string;
  headerRow: number;
  columns: { sourceColumn: string; targetField: string | null }[];
}
