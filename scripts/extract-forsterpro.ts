/**
 * Regenerates the structured data of the "FFR Presto" manufacturing file from the
 * committed page-by-page text extraction. The source PDF is never modified.
 *
 *   npm run extract:ffr
 */
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseForsterproDocument } from '../src/imports/forsterpro/parseForsterpro.ts';
import { buildCatalogue } from '../src/imports/forsterpro/buildCatalogue.ts';

const SOURCE_DIR = 'data/sources/ffr-presto';
const PDF = 'FFR_Dossier_de_fabrication-FFR_PRESTO.pdf';
const OUT_DIR = 'src/data/sources/ffr-presto';

const sha256 = createHash('sha256').update(readFileSync(join(SOURCE_DIR, PDF))).digest('hex');
const pageFiles = readdirSync(join(SOURCE_DIR, 'pages')).filter((f) => /^p\d{3}\.txt$/.test(f)).sort();
const pages = pageFiles.map((f) => readFileSync(join(SOURCE_DIR, 'pages', f), 'utf-8'));

const doc = parseForsterproDocument(pages, { documentId: 'ffr-presto-2026-11-11', fileName: PDF, sha256 });
if (doc.unparsed.length > 0) {
  console.error('Lignes non reconnues :', doc.unparsed.slice(0, 20));
  process.exit(1);
}
const catalogue = buildCatalogue(doc);

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(join(OUT_DIR, 'document.json'), `${JSON.stringify(doc, null, 1)}\n`);
writeFileSync(join(OUT_DIR, 'catalogue.json'), `${JSON.stringify(catalogue, null, 1)}\n`);
const lines = doc.positions.reduce((n, p) => n + p.elements.reduce((m, e) => m + e.lines.length, 0), 0);
console.log(`${doc.positions.length} positions, ${lines} lignes, ${doc.cuttingPlans.length} plans de coupe, ${catalogue.entries.length} références → ${OUT_DIR}`);
