import type {
  BomGroup, ForsterproDocument, ImportedBomLine, ImportedCuttingPlan, ImportedCuttingSummaryLine,
  ImportedElement, ImportedOffcut, ImportedPosition, PdfLineRef,
} from './types';

/** French number as printed by forsterpro: "2.170,0" → 2170, "5,58" → 5.58. */
export function parseFrNumber(raw: string): number {
  const value = Number(raw.replace(/\./g, '').replace(',', '.'));
  if (Number.isNaN(value)) throw new Error(`Nombre illisible : « ${raw} »`);
  return value;
}

/** Evaluates a quantity expression such as "1", "1*2" or "5,98*2". */
export function evalQtyExpression(raw: string): number {
  const total = raw.split('*').map(parseFrNumber).reduce((a, b) => a * b, 1);
  return Math.round(total * 1000) / 1000;
}

const GROUPS: Record<string, BomGroup> = {
  Profilés: 'profiles', parcloses: 'glazing_beads', Vitrage: 'glazing', Ferrure: 'hardware', Joints: 'gaskets', Accessoires: 'accessories',
};

const QTY = String.raw`(\d+(?:,\d+)?) \((\d+(?:,\d+)?(?:\*\d+)?)\)`;
const RE = {
  position: /^Position:\s+(.+?)\s*$/,
  quantity: /^Quantité:\s+(\d+)\s+Pce/,
  size: /^Taille:\s+([\d.]+) x ([\d.]+) mm/,
  element: /^(\d+(?:,\d+)*):\s+(.+?)\s*$/,
  sash: /^Vantail:\s+(\S+)\s+Poids:\s+([\d,]+) kg\s+Taille:\s+([\d.]+) x ([\d.]+) mm/,
  sashContinuation: /^(\d+\.\d+)\s+([\d,]+) kg\s+([\d.]+) x ([\d.]+) mm$/,
  profile: new RegExp(String.raw`^\s*${QTY} Pce (\S+)\s+(.+?)\s+([\d.]+,\d)\s+(\d+°) - (\d+°)\s+(.+?)\s*$`),
  glass: new RegExp(String.raw`^\s*${QTY} Pce\s+([\d.]+)\s+([\d.]+)\s+([\d,]+)\s+(.+?)\s+(\d+)\s*$`),
  piece: new RegExp(String.raw`^\s*${QTY} pce (\S+)\s+(.+?)\s*$`),
  metre: new RegExp(String.raw`^\s*${QTY} m (\S+)\s+(.+?)\s*$`),
  maxDim: /Max\/Dim\.:\s+([\d.]+,\d) mm/,
  trimmed: /Longueur après délardage:\s+([\d.]+,\d) mm/,
  printedPage: /Page:\s*(\d+)\s*$/m,
};
const SKIP = /forsterpro I|Document édité|Bon d'atelier|Affaire:|^\s*\d\d\/\d\d\/\d{4} \/ |^\s+FFR Presto\s*$|NOTA|informations reçues|décline toute|Croquis|Quantité\s+Largeur|^\s+\[mm\]|Répertoire:|^Suite de la position/;

function printedPageOf(text: string, pdfPage: number): number {
  const m = RE.printedPage.exec(text);
  return m?.[1] ? Number(m[1]) : pdfPage;
}

function isCuttingSection(text: string): boolean {
  return text.split('\n').slice(0, 3).some((l) => l.includes('Débit optimisé'));
}

function elementKind(index: string, label: string): ImportedElement['kind'] {
  if (index === '0') return 'dormant';
  return label.startsWith('Porte') ? 'porte' : 'fixe';
}

function parseWorkshopOrder(pages: string[], unparsed: ForsterproDocument['unparsed']): ImportedPosition[] {
  const positions: ImportedPosition[] = [];
  let pos: ImportedPosition | null = null;
  let elem: ImportedElement | null = null;
  let group: BomGroup | null = null;
  let last: ImportedBomLine | null = null;
  let pendingSash = false;

  pages.forEach((text, i) => {
    const pdfPage = i + 1;
    if (isCuttingSection(text)) return;
    const printedPage = printedPageOf(text, pdfPage);
    text.split('\n').forEach((line, j) => {
      const s = line.trim();
      if (!s || SKIP.test(line)) return;
      const source: PdfLineRef = { pdfPage, printedPage, line: j + 1 };
      let m: RegExpExecArray | null;

      if ((m = RE.position.exec(s))) {
        elem = { indexRaw: '0', fieldIndexes: [0], labelRaw: 'Dormant', kind: 'dormant', sashes: [], lines: [], source };
        pos = {
          id: m[1] ?? '', quantity: 0, seriesRaw: '', sizeRaw: '', widthMm: 0, heightMm: 0, drainageRaw: '', materialRaw: '',
          outerGasketRaw: '', sourceWarnings: [], elements: [elem], source,
        };
        positions.push(pos);
        group = null;
        return;
      }
      if (!pos || !elem) return;
      const p: ImportedPosition = pos;
      const e: ImportedElement = elem;

      if ((m = RE.quantity.exec(s))) { p.quantity = Number(m[1]); return; }
      if (s.startsWith('Série:')) { p.seriesRaw = s.slice(6).trim().split(/\s{2,}/)[0] ?? ''; return; }
      if ((m = RE.size.exec(s))) {
        p.sizeRaw = `${m[1]} x ${m[2]} mm`;
        p.widthMm = parseFrNumber(m[1] ?? '');
        p.heightMm = parseFrNumber(m[2] ?? '');
        return;
      }
      if (s.startsWith('Drainage:')) { p.drainageRaw = s.split(':')[1]?.trim() ?? ''; return; }
      if (s.startsWith('Matériau:')) { p.materialRaw = s.slice(9).trim(); return; }
      if (s.startsWith('Joint - extérieur')) { p.outerGasketRaw = s.split(/\s{2,}/)[0] ?? ''; return; }
      if (s.includes('coupe système')) { p.sourceWarnings.push({ text: s, source }); return; }
      if (s.startsWith('Poids') || s.startsWith('(') || s === 'Dormant' || s.startsWith('plinthe):')) return;
      if (s in GROUPS) { group = GROUPS[s] ?? null; return; }
      if ((m = RE.sash.exec(s))) {
        e.sashes.push({ id: m[1] ?? '', weightKg: parseFrNumber(m[2] ?? ''), widthMm: parseFrNumber(m[3] ?? ''), heightMm: parseFrNumber(m[4] ?? ''), source });
        return;
      }
      if (s.startsWith('Vantail:') && s.includes('Taille')) { pendingSash = true; return; }
      if ((pendingSash || e.sashes.length > 0) && (m = RE.sashContinuation.exec(s))) {
        pendingSash = false;
        e.sashes.push({ id: m[1] ?? '', weightKg: parseFrNumber(m[2] ?? ''), widthMm: parseFrNumber(m[3] ?? ''), heightMm: parseFrNumber(m[4] ?? ''), source });
        return;
      }
      if (s.startsWith('Raccord au sol:')) { e.floorConnectionRaw = s.split(':').slice(1).join(':').trim(); return; }
      if (s.startsWith('Jeu de porte')) { e.doorGapRaw = s.split(/\s{2,}/).pop(); return; }
      if (last && (m = RE.maxDim.exec(s))) { last.maxDimMm = parseFrNumber(m[1] ?? ''); return; }
      if (last && (m = RE.trimmed.exec(s))) { last.lengthAfterTrimMm = parseFrNumber(m[1] ?? ''); return; }

      const base = (qtyRaw: string, expr: string) => ({ qtyRaw, qtyExpressionRaw: expr, qtyTotal: evalQtyExpression(expr), source });
      if (group && (m = RE.profile.exec(line))) {
        last = {
          group, ref: m[3] ?? null, descriptionRaw: (m[4] ?? '').trim(), unitRaw: 'Pce', ...base(m[1] ?? '', m[2] ?? ''),
          lengthRaw: m[5], lengthMm: parseFrNumber(m[5] ?? ''), cutAnglesRaw: `${m[6]} - ${m[7]}`, orientationRaw: (m[8] ?? '').replace(/\s/g, ''),
        };
        e.lines.push(last);
        return;
      }
      if (group && (m = RE.glass.exec(line))) {
        last = {
          group, ref: null, descriptionRaw: (m[6] ?? '').trim(), unitRaw: 'Pce', ...base(m[1] ?? '', m[2] ?? ''),
          glass: { widthMm: parseFrNumber(m[3] ?? ''), heightMm: parseFrNumber(m[4] ?? ''), areaM2: parseFrNumber(m[5] ?? ''), fieldNo: Number(m[7]) },
        };
        e.lines.push(last);
        return;
      }
      if (group && (m = RE.metre.exec(line))) {
        last = { group, ref: m[3] ?? null, descriptionRaw: (m[4] ?? '').trim(), unitRaw: 'm', ...base(m[1] ?? '', m[2] ?? '') };
        e.lines.push(last);
        return;
      }
      if (group && (m = RE.piece.exec(line))) {
        last = { group, ref: m[3] ?? null, descriptionRaw: ((m[4] ?? '').trim().split(/\s{2,}/)[0] ?? '').trim(), unitRaw: 'pce', ...base(m[1] ?? '', m[2] ?? '') };
        e.lines.push(last);
        return;
      }
      if ((m = RE.element.exec(s))) {
        const indexRaw = m[1] ?? '';
        const labelRaw = m[2] ?? '';
        elem = { indexRaw, fieldIndexes: indexRaw.split(',').map(Number), labelRaw, kind: elementKind(indexRaw, labelRaw), sashes: [], lines: [], source };
        p.elements.push(elem);
        group = null;
        return;
      }
      // Wrapped description of the previous hardware / accessory row.
      if (last && last.unitRaw === 'pce' && line.startsWith(' '.repeat(20))) {
        last.descriptionRaw = `${last.descriptionRaw} ${s}`;
        return;
      }
      unparsed.push({ pdfPage, line: j + 1, text: s });
    });
  });
  return positions;
}

function parseCuttingSection(pages: string[]) {
  const plans: ImportedCuttingPlan[] = [];
  const offcuts: ImportedOffcut[] = [];
  const summary: ImportedCuttingSummaryLine[] = [];
  let mode: 'offcuts' | 'summary' | 'bars' | null = null;
  let plan: ImportedCuttingPlan | null = null;
  let pattern: ImportedCuttingPlan['patterns'][number] | null = null;
  const reHead = /forster (\S+)\s+(.+?)\s*$/;
  const reBars = /^\s*(\d+) Pce á ([\d.]+) mm\s+Largeur: ([\d,]+ mm \/ Hauteur: [\d,]+)/;
  const reWaste = /Chutes: ([\d.]+) mm = ([\d,]+) %/;
  const reParams = /Chutes utilisables: ([\d.]+) mm\s+Epaisseur lame de scie: (\d+) mm\s+Chutes d'extr\.: (\d+) mm/;
  const reRepeat = /^\s*(\d+)x\s*$/;
  const reCut = /^\s*(\d+)\s+([A-Za-z]+\s*\/\s*\d+)\s+([\d.]+,\d)\s+([\d.]+,\d)\s+(\d+° \/ \d+°)\s+(.+?)\s*$/;
  const reOffcut = /^(\S+)\s+(.+?),\s*(\d+)\s+(\d+)\s+([\d.]+)\s*$/;
  const reSummary = /^(\S+)\s+(.+?)\s+(\d+)\s+([\d.]+)\s+([\d.]+)\s+([\d,]+)\s*$/;

  pages.forEach((text, i) => {
    if (!isCuttingSection(text)) return;
    const pdfPage = i + 1;
    const printedPage = printedPageOf(text, pdfPage);
    text.split('\n').forEach((line, j) => {
      const s = line.trim();
      const source: PdfLineRef = { pdfPage, printedPage, line: j + 1 };
      let m: RegExpExecArray | null;
      if (s === 'Chutes restantes') { mode = 'offcuts'; return; }
      if (s === 'Récapitulatif') { mode = 'summary'; return; }
      if (!line.includes('forsterpro') && (m = reHead.exec(line))) {
        mode = 'bars';
        plan = { ref: m[1] ?? '', descriptionRaw: m[2] ?? '', stockBars: 0, barLengthMm: 0, sectionRaw: '', wasteMm: 0, wastePct: 0, usableOffcutMm: 0, sawKerfMm: 0, endWasteMm: 0, patterns: [], source };
        plans.push(plan);
        return;
      }
      if (mode === 'offcuts' && (m = reOffcut.exec(s))) {
        offcuts.push({ ref: m[1] ?? '', descriptionRaw: m[2] ?? '', codeRaw: m[3] ?? '', qty: Number(m[4]), lengthMm: parseFrNumber(m[5] ?? ''), source });
        return;
      }
      if (mode === 'summary' && (m = reSummary.exec(s))) {
        summary.push({ ref: m[1] ?? '', descriptionRaw: m[2] ?? '', bars: Number(m[3]), barLengthMm: parseFrNumber(m[4] ?? ''), wasteMm: parseFrNumber(m[5] ?? ''), wastePct: parseFrNumber(m[6] ?? ''), source });
        return;
      }
      if (mode !== 'bars' || !plan) return;
      const pl: ImportedCuttingPlan = plan;
      if ((m = reBars.exec(line))) { pl.stockBars = Number(m[1]); pl.barLengthMm = parseFrNumber(m[2] ?? ''); pl.sectionRaw = m[3] ?? ''; return; }
      if ((m = reWaste.exec(line))) { pl.wasteMm = parseFrNumber(m[1] ?? ''); pl.wastePct = parseFrNumber(m[2] ?? ''); return; }
      if ((m = reParams.exec(line))) { pl.usableOffcutMm = parseFrNumber(m[1] ?? ''); pl.sawKerfMm = Number(m[2]); pl.endWasteMm = Number(m[3]); return; }
      if ((m = reRepeat.exec(line))) { pattern = { repeat: Number(m[1]), cuts: [], source }; pl.patterns.push(pattern); return; }
      if (pattern && (m = reCut.exec(line))) {
        pattern.cuts.push({
          qty: Number(m[1]), orientationRaw: (m[2] ?? '').replace(/\s/g, ''), cutLengthMm: parseFrNumber(m[3] ?? ''),
          lengthMm: parseFrNumber(m[4] ?? ''), anglesRaw: m[5] ?? '', positionId: m[6] ?? '', source,
        });
      }
    });
  });
  return { plans, offcuts, summary };
}

export interface ParseOptions {
  documentId: string;
  fileName: string;
  sha256: string;
}

/** Parses all pages of a forsterpro manufacturing file (pages[0] = PDF page 1). */
export function parseForsterproDocument(pages: string[], options: ParseOptions): ForsterproDocument {
  const unparsed: ForsterproDocument['unparsed'] = [];
  const positions = parseWorkshopOrder(pages, unparsed);
  const { plans, offcuts, summary } = parseCuttingSection(pages);
  const first = pages[0] ?? '';
  const header = /(\d\d\/\d\d\/\d{4} \/ \d\d:\d\d)\s*\n\s+(.+?)\s*\n/.exec(first);
  return {
    ...options,
    affaire: header?.[2]?.trim() ?? '',
    editedAtRaw: header?.[1] ?? '',
    pageCount: pages.length,
    positions,
    cuttingPlans: plans,
    offcuts,
    cuttingSummary: summary,
    unparsed,
  };
}
