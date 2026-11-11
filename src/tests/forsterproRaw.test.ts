import { describe, expect, it } from 'vitest';
import documentJson from '../data/sources/ffr-presto/document.json';
import { parseForsterproDocument } from '../imports/forsterpro/parseForsterpro';
import type { ForsterproDocument } from '../imports/forsterpro/types';

// Raw page-by-page extraction of the source PDF (never modified).
const rawPages = import.meta.glob('../../data/sources/ffr-presto/pages/p*.txt', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;

describe('committed import is reproducible from the source text', () => {
  it('re-parsing the 175 extracted pages gives exactly the committed JSON', () => {
    const pages = Object.keys(rawPages).sort().map((k) => rawPages[k] ?? '');
    expect(pages).toHaveLength(175);
    const committed = documentJson as ForsterproDocument;
    const parsed = parseForsterproDocument(pages, { documentId: committed.documentId, fileName: committed.fileName, sha256: committed.sha256 });
    expect(JSON.parse(JSON.stringify(parsed))).toEqual(committed);
  });
});
