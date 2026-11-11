import * as XLSX from 'xlsx';
import { describeFile, type FileInfo } from './fileInfo';

export type CellValue = string | number | boolean | null;

export interface SheetPreview {
  name: string;
  /** Total number of rows in the sheet range. */
  rowCount: number;
  columnCount: number;
  /** First rows only, values as displayed by Excel when available. */
  rows: CellValue[][];
}

export interface WorkbookPreview {
  file: FileInfo;
  sheets: SheetPreview[];
}

export class ImportError extends Error {
  override name = 'ImportError';
}

/**
 * Reads a spreadsheet (xlsx, xls, ods, csv) in memory and returns a preview.
 * The original file is never modified: SheetJS only reads the provided bytes.
 */
export function previewWorkbook(data: ArrayBuffer, fileName: string, maxRows = 20): WorkbookPreview {
  const file = describeFile(fileName, data.byteLength);
  if (file.kind !== 'excel' && file.kind !== 'csv') {
    throw new ImportError(`Format non pris en charge pour l’aperçu : .${file.extension || '?'} (Excel ou CSV attendu).`);
  }
  let workbook: XLSX.WorkBook;
  try {
    workbook = file.kind === 'csv'
      ? XLSX.read(new TextDecoder('utf-8').decode(data), { type: 'string', raw: true })
      : XLSX.read(data, { type: 'array', cellDates: false });
  } catch (error) {
    throw new ImportError(`Fichier illisible : ${error instanceof Error ? error.message : 'erreur inconnue'}.`);
  }
  const sheets = workbook.SheetNames.map((name): SheetPreview => {
    const sheet = workbook.Sheets[name];
    if (!sheet) return { name, rowCount: 0, columnCount: 0, rows: [] };
    const range = sheet['!ref'] ? XLSX.utils.decode_range(sheet['!ref']) : null;
    const rows = XLSX.utils.sheet_to_json<CellValue[]>(sheet, { header: 1, raw: false, defval: null, blankrows: false });
    return {
      name,
      rowCount: range ? range.e.r - range.s.r + 1 : 0,
      columnCount: range ? range.e.c - range.s.c + 1 : 0,
      rows: rows.slice(0, maxRows),
    };
  });
  return { file, sheets };
}
