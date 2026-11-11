import { useState } from 'react';
import { previewWorkbook, ImportError, type WorkbookPreview } from '../imports/spreadsheetPreview';
import { columnLetter, describeFile } from '../imports/fileInfo';
import { IMPORT_TARGETS, IMPORT_DATASETS, type ImportDataset } from '../imports/importTargets';
import { Notice } from '../components/StatusNotice';
import type { ImportMapping } from '../types';

export function ImportPage() {
  const [dataset, setDataset] = useState<ImportDataset>('prix');
  const [preview, setPreview] = useState<WorkbookPreview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sheetIndex, setSheetIndex] = useState(0);
  const [headerRow, setHeaderRow] = useState(1);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const onFile = async (file: File | undefined) => {
    setPreview(null);
    setError(null);
    setMapping({});
    setSheetIndex(0);
    if (!file) return;
    const info = describeFile(file.name, file.size);
    if (info.kind === 'pdf') {
      setError('Les PDF forsterpro sont importés par le script de développement (voir docs/import-format.md), pas depuis cet écran.');
      return;
    }
    setLoading(true);
    try {
      // file.arrayBuffer() returns a copy in memory: the original file is never modified.
      setPreview(previewWorkbook(await file.arrayBuffer(), file.name));
    } catch (e) {
      setError(e instanceof ImportError ? e.message : 'Lecture du fichier impossible.');
    } finally {
      setLoading(false);
    }
  };

  const sheet = preview?.sheets[sheetIndex];
  const header = sheet?.rows[headerRow - 1] ?? [];
  const columnCount = Math.max(0, ...(sheet?.rows.map((r) => r.length) ?? [0]));
  const draftMapping: ImportMapping | null = preview && sheet
    ? {
        sourceFile: preview.file.fileName,
        sheet: sheet.name,
        headerRow,
        columns: Array.from({ length: columnCount }, (_, c) => ({ sourceColumn: columnLetter(c), targetField: mapping[columnLetter(c)] || null })),
      }
    : null;

  return (
    <section aria-labelledby="import-title">
      <div className="page-head">
        <div>
          <h1 id="import-title">Import des données</h1>
          <p className="muted">Aperçu de fichiers Excel ou CSV et préparation des correspondances de colonnes.</p>
        </div>
      </div>

      <Notice tone="attention" title="Aucune donnée n’est intégrée au moteur de calcul depuis cet écran">
        Le fichier est lu en mémoire pour l’aperçu uniquement. Il n’est jamais modifié, et rien n’est enregistré.
      </Notice>

      <div className="panel">
        <div className="grid-2">
          <div className="field">
            <label htmlFor="import-dataset">Type de données</label>
            <select id="import-dataset" value={dataset} onChange={(e) => setDataset(e.target.value as ImportDataset)}>
              {IMPORT_DATASETS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="import-file">Fichier (.xlsx, .xls, .ods, .csv)</label>
            <input id="import-file" type="file" accept=".xlsx,.xlsm,.xls,.xlsb,.ods,.csv,.txt" onChange={(e) => void onFile(e.target.files?.[0])} />
          </div>
        </div>
        {loading && <p role="status">Lecture du fichier…</p>}
        {error && <Notice tone="bloquant">{error}</Notice>}
      </div>

      {preview && (
        <div className="panel">
          <h2>Fichier sélectionné</h2>
          <dl className="kv kv--inline">
            <dt>Nom</dt><dd className="mono">{preview.file.fileName}</dd>
            <dt>Extension</dt><dd className="mono">.{preview.file.extension}</dd>
            <dt>Taille</dt><dd>{new Intl.NumberFormat('fr-FR').format(Math.round(preview.file.sizeBytes / 1024))} Ko</dd>
            <dt>Feuilles</dt><dd>{preview.sheets.length}</dd>
          </dl>

          <div className="grid-2">
            <div className="field">
              <label htmlFor="import-sheet">Feuille</label>
              <select id="import-sheet" value={sheetIndex} onChange={(e) => { setSheetIndex(Number(e.target.value)); setMapping({}); }}>
                {preview.sheets.map((s, i) => <option key={s.name} value={i}>{s.name} ({s.rowCount} lignes)</option>)}
              </select>
            </div>
            <div className="field">
              <label htmlFor="import-header">Ligne d’en-tête</label>
              <input id="import-header" type="number" min={1} max={sheet?.rows.length ?? 1} value={headerRow} onChange={(e) => setHeaderRow(Math.max(1, Number(e.target.value) || 1))} />
            </div>
          </div>

          {sheet && sheet.rows.length > 0 ? (
            <>
              <h3>Aperçu des premières lignes</h3>
              <div className="table-wrap" role="region" aria-label="Aperçu de la feuille" tabIndex={0}>
                <table className="data-table data-table--compact">
                  <thead>
                    <tr>
                      <th scope="col">#</th>
                      {Array.from({ length: columnCount }, (_, c) => <th key={c} scope="col" className="mono">{columnLetter(c)}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {sheet.rows.map((row, r) => (
                      <tr key={r} className={r === headerRow - 1 ? 'header-row' : undefined}>
                        <th scope="row" className="mono">{r + 1}</th>
                        {Array.from({ length: columnCount }, (_, c) => <td key={c}>{row[c] === null || row[c] === undefined ? '' : String(row[c])}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <h3>Correspondance des colonnes (préparation)</h3>
              <p className="muted small">Cette correspondance n’est pas encore appliquée : elle servira à l’intégration des tarifs et références.</p>
              <div className="mapping-grid">
                {Array.from({ length: columnCount }, (_, c) => {
                  const letter = columnLetter(c);
                  const title = header[c] === null || header[c] === undefined ? '' : String(header[c]);
                  return (
                    <div className="field" key={letter}>
                      <label htmlFor={`map-${letter}`}>Colonne {letter}{title && ` — ${title}`}</label>
                      <select id={`map-${letter}`} value={mapping[letter] ?? ''} onChange={(e) => setMapping({ ...mapping, [letter]: e.target.value })}>
                        <option value="">Ignorer</option>
                        {IMPORT_TARGETS[dataset].map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                      </select>
                    </div>
                  );
                })}
              </div>
              {draftMapping && (
                <details>
                  <summary>Voir la correspondance au format JSON</summary>
                  <pre className="code">{JSON.stringify(draftMapping, null, 2)}</pre>
                </details>
              )}
            </>
          ) : (
            <p className="muted">Feuille vide.</p>
          )}
        </div>
      )}
    </section>
  );
}
