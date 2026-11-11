/** Kinds of files the import module will load, and the fields their columns can map to. */
export type ImportDataset = 'prix' | 'references' | 'debit' | 'csv';

export const IMPORT_DATASETS: { value: ImportDataset; label: string }[] = [
  { value: 'prix', label: 'Fichier Excel de prix' },
  { value: 'references', label: 'Fichier Excel de références' },
  { value: 'debit', label: 'Liste de débit' },
  { value: 'csv', label: 'Fichier CSV (générique)' },
];

const COMMON = [
  { value: 'reference', label: 'Référence produit' },
  { value: 'designation', label: 'Désignation' },
];

export const IMPORT_TARGETS: Record<ImportDataset, { value: string; label: string }[]> = {
  prix: [...COMMON, { value: 'unitPrice', label: 'Prix unitaire (€)' }, { value: 'priceUnit', label: 'Unité de prix' }, { value: 'validFrom', label: 'Date de validité' }],
  references: [...COMMON, { value: 'category', label: 'Catégorie' }, { value: 'unit', label: 'Unité' }, { value: 'barLength', label: 'Longueur de barre (mm)' }],
  debit: [...COMMON, { value: 'quantity', label: 'Quantité' }, { value: 'length', label: 'Longueur (mm)' }, { value: 'cut', label: 'Coupe' }, { value: 'orientation', label: 'Orientation' }],
  csv: [...COMMON, { value: 'quantity', label: 'Quantité' }, { value: 'unitPrice', label: 'Prix unitaire (€)' }],
};
