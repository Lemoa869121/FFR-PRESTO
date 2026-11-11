/**
 * Explicit data read in the Forster presto processing manual
 * ("Verarbeitungsordner" / documentation de mise en œuvre), art. no. 918301, edition 01/2021.
 * Each value carries its page: `vp` is the page code printed on the page (e.g. "VP 3.3.114"),
 * `pdfPage` the physical page of the 926-page PDF. Values are copied as printed.
 * The PDF itself (141 MB) exceeds GitHub's 100 MB file limit and is not versioned
 * (see data/sources/presto-manual/README.md).
 */

export interface ManualRef {
  vp: string;
  pdfPage: number;
  title: string;
}

export const MANUAL = {
  documentId: 'presto-verarbeitung-918301-01-2021',
  fileName: '918301_presto_verarbeitung_ordner.pdf',
  sha256: '5eb4ee69245076f013f6103f874db85ef433f0cae817c1e9384e173da663035e',
  edition: '01/2021',
  articleNo: '918301',
  pageCount: 926,
} as const;

export const ref = (vp: string, pdfPage: number, title: string): ManualRef => ({ vp, pdfPage, title });

/** Profile weights and bar lengths (tables "Profile / Profilés", columns L [mm] and G [kg/m]). */
export const PROFILE_DATA: Record<string, { barLengthMm: number; kgPerM: number; source: ManualRef }> = {
  '32.851': { barLengthMm: 6000, kgPerM: 2.715, source: ref('VP 3.2.1', 59, 'Profilés acier') },
  '32.852': { barLengthMm: 6000, kgPerM: 3.157, source: ref('VP 3.2.1', 59, 'Profilés acier') },
  '32.855': { barLengthMm: 6000, kgPerM: 3.615, source: ref('VP 3.2.1', 59, 'Profilés acier') },
  '32.800': { barLengthMm: 6000, kgPerM: 2.849, source: ref('VP 3.2.2', 60, 'Profilés acier') },
  '32.803': { barLengthMm: 6000, kgPerM: 3.297, source: ref('VP 3.2.2', 60, 'Profilés acier') },
  '32.805': { barLengthMm: 6000, kgPerM: 3.297, source: ref('VP 3.2.2', 60, 'Profilés acier') },
  '901335': { barLengthMm: 6000, kgPerM: 0.422, source: ref('VP 3.2.4', 62, 'Parcloses aluminium') },
};

/** Leaf / frame geometry read on the system plans (sections B-B and C-C of a single door). */
export const LEAF_GEOMETRY = {
  /** Visible frame face before the leaf, at head and jambs. */
  frameOverlapMm: 36,
  /** Rebate play between frame and leaf. */
  rebatePlayMm: 4,
  /** Gap between leaf and finished floor: "variabel" on the plan; 10 mm in the FFR Presto file. */
  defaultFloorGapMm: 10,
  sources: [ref('VP 3.5.32', 242, 'Plans du système — porte 1 vantail, coupe B-B'), ref('VP 3.5.33', 243, 'Plans du système — coupe C-C')],
};

/** "Blendrahmen-/Flügelmass ab 120 mm" — minimum outer frame / leaf size. */
export const MIN_FRAME_OR_LEAF_MM = { value: 120, source: ref('VP 3.1.1', 53, 'Le système en un coup d’œil — Dimensions') };

/** Cutting tolerances (rebate play): outer frame nominal +1 / −0 mm, leaf frame +0 / −1 mm. */
export const CUTTING_TOLERANCES = {
  frame: '+1 / −0 mm',
  leaf: '+0 / −1 mm',
  sawBladeMm: [4, 6] as const,
  source: ref('VP 1.3.3', 27, 'Directives générales de mise en œuvre — 4.1 Coupe'),
};

/** Steel studs on glazing beads: ≤ 70 mm from each end, spacing ≤ 300 mm. */
export const STUD_SPACING = { maxFromEndMm: 70, maxSpacingMm: 300, source: ref('VP 3.6.14', 280, 'Pose des boutons de serrage — parcloses') };

/** Top weatherstripping pieces by DIN handing. */
export const SEALING_PIECES = { R: '905702', L: '905703', source: ref('VP 3.4.9', 203, 'Accessoires — pièces de remplissage') };

/** Filler pieces 916320 / 916322 placement and meeting-stile cut-back of 34 mm (double door, DIN left). */
export const FILLER_PIECES = { meetingStileCutBackMm: 34, source: ref('VP 3.6.10', 276, 'Insertion de pièces de remplissage — DIN gauche') };

/**
 * Permissible door loads [kg] for weld-on hinges 907662 (table on the product page).
 * Rows: leaf height H [mm]; columns: leaf width B [mm].
 */
export const HINGE_907662_LOADS = {
  heights: [1800, 2000, 2200, 2400, 2600, 2800, 3000],
  widths: [600, 800, 1000, 1200, 1400],
  loads: [
    [260, 210, 180, 160, 140],
    [280, 230, 200, 170, 150],
    [280, 240, 200, 180, 160],
    [300, 250, 220, 190, 170],
    [320, 270, 240, 210, 190],
    [330, 290, 250, 220, 200],
    [340, 300, 260, 230, 210],
  ],
  source: ref('VP 3.3.114', 178, 'Paumelle à souder 907662 — charges admissibles'),
};

/** Presto 50 door system plans available in the manual (13 types, incl. fixed glazing). */
export const SYSTEM_PLANS = ref('VP 3.5.30', 240, 'Tableau des plans du système (13 types, dont vitrage fixe)');

/** Sales units printed in the accessory / fitting tables (needed to price quantities later). */
export const SALES_UNITS: Record<string, { unit: string; source: ManualRef }> = {
  '32.800': { unit: 'barre de 6 000 mm', source: ref('VP 3.2.2', 60, 'Profilés acier') },
  '32.803': { unit: 'barre de 6 000 mm', source: ref('VP 3.2.2', 60, 'Profilés acier') },
  '32.805': { unit: 'barre de 6 000 mm', source: ref('VP 3.2.2', 60, 'Profilés acier') },
  '32.851': { unit: 'barre de 6 000 mm', source: ref('VP 3.2.1', 59, 'Profilés acier') },
  '32.852': { unit: 'barre de 6 000 mm', source: ref('VP 3.2.1', 59, 'Profilés acier') },
  '32.855': { unit: 'barre de 6 000 mm', source: ref('VP 3.2.1', 59, 'Profilés acier') },
  '901335': { unit: 'barre de 6 000 mm', source: ref('VP 3.2.4', 62, 'Parcloses aluminium') },
  '905306': { unit: 'rouleau de 100 m', source: ref('VP 3.4.1', 195, 'Accessoires — joints') },
  '905312': { unit: 'rouleau de 100 m', source: ref('VP 3.4.2', 196, 'Accessoires — joints de vitrage') },
  '905317': { unit: 'rouleau de 100 m', source: ref('VP 3.4.2', 196, 'Accessoires — joints de vitrage') },
  '900100': { unit: 'sachet de 10 pièces', source: ref('VP 3.4.7', 201, 'Accessoires — évacuation d’eau') },
  '906579': { unit: 'magasin de 200 pièces', source: ref('VP 3.4.7', 201, 'Accessoires — boutons de fixation') },
  '916320': { unit: 'lot de 4 pièces', source: ref('VP 3.4.8', 202, 'Accessoires — pièces de remplissage') },
  '916322': { unit: 'lot de 4 pièces', source: ref('VP 3.4.8', 202, 'Accessoires — pièces de remplissage') },
  '905702': { unit: 'lot de 10 pièces', source: ref('VP 3.4.9', 203, 'Accessoires — pièces d’étanchéité') },
  '905703': { unit: 'lot de 10 pièces', source: ref('VP 3.4.9', 203, 'Accessoires — pièces d’étanchéité') },
  '907662': { unit: 'lot de 2 pièces', source: ref('VP 3.3.114', 178, 'Paumelle à souder') },
};
