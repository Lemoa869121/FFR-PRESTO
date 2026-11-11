import type { CalculationTotals, CuttingListItem, MaterialCategory, RuleStatus } from '../../types';
import type { Catalogue, CatalogueEntry } from '../../imports/forsterpro/buildCatalogue';
import type { PriceBook } from '../../pricing/priceBook';
import type { GeneratedLine, LineGroup, PrestoBom } from './types';
import { getRule } from './rules';
import { roundHalfUp } from './generate';

const CATEGORY: Record<LineGroup, MaterialCategory> = {
  profiles: 'profiles',
  glazing_beads: 'profiles',
  glazing: 'vitrage',
  hardware: 'quincaillerie',
  gaskets: 'joints',
  accessories: 'accessoires',
};

const STATUS_LABEL: Record<RuleStatus, string> = {
  explicite: 'explicite',
  derivee: 'dérivée du dossier',
  a_valider: 'à valider',
  manquante: 'manquante',
  demonstration: 'démonstration',
};

const SIDE_ORDER = ['G', 'D', 'H', 'B', 'Ha', 'La'];

function keyOf(l: GeneratedLine): string {
  return [l.group, l.ref ?? '', l.lengthMm ?? '', l.lengthAfterTrimMm ?? '', l.cut ?? '', l.glass ? `${l.glass.widthMm}x${l.glass.heightMm}` : '', l.ruleId].join('|');
}

/**
 * Aggregates the generated lines of a composition into cutting-list items
 * (quantities for ONE composition), with full traceability.
 */
export function toCuttingList(bom: PrestoBom, catalogue: Catalogue, prices: PriceBook): CuttingListItem[] {
  const byRef = new Map<string, CatalogueEntry>(catalogue.entries.map((e) => [e.ref, e]));
  const groups = new Map<string, { line: GeneratedLine; quantity: number; sides: Set<string> }>();
  for (const el of bom.elements) {
    for (const line of el.lines) {
      const k = keyOf(line);
      const g = groups.get(k) ?? { line, quantity: 0, sides: new Set<string>() };
      g.quantity = roundHalfUp(g.quantity + line.quantity, 3);
      if (line.side) g.sides.add(line.side);
      groups.set(k, g);
    }
  }
  const items: CuttingListItem[] = [];
  for (const { line, quantity, sides } of groups.values()) {
    const rule = getRule(line.ruleId);
    const entry = line.ref ? byRef.get(line.ref) : undefined;
    const price = line.ref ? prices.lookup(line.ref) : null;
    const unitPrice = price ? price.unitPrice : null;
    const isLength = line.lengthMm !== undefined;
    const totalLengthM = isLength ? roundHalfUp(((line.lengthMm ?? 0) * quantity) / 1000, 3) : line.unit === 'metre' ? quantity : undefined;
    const designation = line.glass
      ? `Remplissage ${line.glass.widthMm} × ${line.glass.heightMm} mm — ${line.glass.descriptionRaw}`
      : entry?.descriptionRaw ?? 'Désignation non trouvée dans la source';
    const refSource = entry ? `réf. lue p. ${entry.firstSeen.pdfPage}, l. ${entry.firstSeen.line} (${entry.firstSeen.positionId})` : 'remplissage sans référence dans la source';
    items.push({
      reference: line.ref ?? '—',
      designation,
      category: CATEGORY[line.group],
      unitLengthMm: line.lengthMm,
      lengthAfterTrimMm: line.lengthAfterTrimMm,
      cutAngles: line.cut,
      orientation: sides.size > 0 ? [...sides].sort((a, b) => SIDE_ORDER.indexOf(a) - SIDE_ORDER.indexOf(b)).join(', ') : undefined,
      quantity,
      unit: line.unit,
      totalLengthM,
      unitPrice,
      totalPrice: unitPrice === null ? null : roundHalfUp(unitPrice * quantity, 2),
      dataSource: `Règle ${rule.id} (${STATUS_LABEL[rule.status]}) · ${refSource}`,
      comment: line.glass ? `Surface ${String(line.glass.areaM2).replace('.', ',')} m² par champ` : undefined,
      trace: {
        ruleId: rule.id,
        ruleStatus: rule.status,
        referenceSource: entry
          ? { documentId: catalogue.documentId, section: 'bon_atelier', pdfPage: entry.firstSeen.pdfPage, printedPage: entry.firstSeen.printedPage, line: entry.firstSeen.line }
          : undefined,
        priceSource: price ? price.source : null,
      },
    });
  }
  return items;
}

/** Totals are only given when EVERY line has a price; otherwise null (never a partial sum). */
export function computeTotals(items: CuttingListItem[], quantity: number): CalculationTotals {
  const sum = (cats: MaterialCategory[]) => {
    const rows = items.filter((i) => cats.includes(i.category));
    if (rows.some((r) => r.totalPrice === null)) return null;
    return roundHalfUp(rows.reduce((s, r) => s + (r.totalPrice ?? 0), 0), 2);
  };
  const profiles = sum(['profiles']);
  const glazingOrInfill = sum(['vitrage', 'panneaux']);
  const hardware = sum(['quincaillerie']);
  const accessories = sum(['accessoires']);
  const other = sum(['joints', 'renforts', 'consommables']);
  const parts = [profiles, glazingOrInfill, hardware, accessories, other];
  const material = parts.some((p) => p === null) ? null : roundHalfUp(parts.reduce<number>((s, p) => s + (p ?? 0), 0), 2);
  return { profiles, glazingOrInfill, hardware, accessories, other, material, materialForQuantity: material === null ? null : roundHalfUp(material * quantity, 2) };
}
