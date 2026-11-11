export type ImportKind = 'excel' | 'csv' | 'pdf' | 'inconnu';

export interface FileInfo {
  fileName: string;
  extension: string;
  kind: ImportKind;
  sizeBytes: number;
}

const EXCEL_EXTENSIONS = ['xlsx', 'xlsm', 'xls', 'xlsb', 'ods'];

export function getExtension(fileName: string): string {
  const idx = fileName.lastIndexOf('.');
  return idx > 0 && idx < fileName.length - 1 ? fileName.slice(idx + 1).toLowerCase() : '';
}

export function describeFile(fileName: string, sizeBytes: number): FileInfo {
  const extension = getExtension(fileName);
  let kind: ImportKind = 'inconnu';
  if (EXCEL_EXTENSIONS.includes(extension)) kind = 'excel';
  else if (extension === 'csv' || extension === 'txt') kind = 'csv';
  else if (extension === 'pdf') kind = 'pdf';
  return { fileName, extension, kind, sizeBytes };
}

/** Converts a 0-based column index into a spreadsheet letter (0 → A, 26 → AA). */
export function columnLetter(index: number): string {
  let n = index + 1;
  let out = '';
  while (n > 0) {
    const rem = (n - 1) % 26;
    out = String.fromCharCode(65 + rem) + out;
    n = Math.floor((n - 1) / 26);
  }
  return out;
}
