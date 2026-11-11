import type { BomGroup, ForsterproDocument, PdfLineRef } from './types';

/** One article as read in the source document (no price, no invented data). */
export interface CatalogueEntry {
  ref: string;
  descriptionRaw: string;
  group: BomGroup;
  unitRaw: 'Pce' | 'pce' | 'm';
  /** Profile section from the "Débit optimisé" header, e.g. "50,0 mm / Hauteur: 70,0". */
  sectionRaw?: string;
  barLengthMm?: number;
  /** Material written in the cutting-plan header ("Acier brut", "Aluminium"). */
  materialRaw?: string;
  firstSeen: PdfLineRef & { positionId: string };
  occurrences: number;
}

export interface Catalogue {
  documentId: string;
  entries: CatalogueEntry[];
  /** Description of the infill rows, which have no article number. */
  glazingDescriptions: string[];
}

/** Builds the article list of a forsterpro document (deduplicated by reference). */
export function buildCatalogue(doc: ForsterproDocument): Catalogue {
  const map = new Map<string, CatalogueEntry>();
  const glazing = new Set<string>();
  for (const pos of doc.positions) {
    for (const el of pos.elements) {
      for (const line of el.lines) {
        if (line.ref === null) {
          glazing.add(line.descriptionRaw);
          continue;
        }
        const existing = map.get(line.ref);
        if (existing) {
          existing.occurrences += 1;
          continue;
        }
        map.set(line.ref, {
          ref: line.ref,
          descriptionRaw: line.descriptionRaw,
          group: line.group,
          unitRaw: line.unitRaw,
          firstSeen: { ...line.source, positionId: pos.id },
          occurrences: 1,
        });
      }
    }
  }
  for (const plan of doc.cuttingPlans) {
    const entry = map.get(plan.ref);
    if (!entry) continue;
    entry.sectionRaw = plan.sectionRaw;
    entry.barLengthMm = plan.barLengthMm;
    entry.materialRaw = plan.descriptionRaw.split(',').slice(1).join(',').trim() || undefined;
  }
  return {
    documentId: doc.documentId,
    entries: [...map.values()].sort((a, b) => a.ref.localeCompare(b.ref)),
    glazingDescriptions: [...glazing],
  };
}
