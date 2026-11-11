import { PRESTO_RULES } from '../calculation/presto/rules';
import { FFR_PRESTO_CATALOGUE } from '../calculation/engine';
import { Notice } from '../components/StatusNotice';
import { SALES_UNITS } from '../data/sources/presto-manual/manual';

const STATUS: Record<string, { label: string; tone: string }> = {
  explicite: { label: 'Explicite', tone: 'ok' },
  derivee: { label: 'Dérivée (32 positions)', tone: 'ok' },
  a_valider: { label: 'À valider', tone: 'warn' },
};

export function RulesPage() {
  const domains = [...new Set(PRESTO_RULES.map((r) => r.domain))];
  return (
    <section aria-labelledby="rules-title">
      <div className="page-head">
        <div>
          <h1 id="rules-title">Règles de calcul — Forster Presto</h1>
          <p className="muted">
            Sources : dossier de fabrication forsterpro « FFR Presto » du 11/11/2026 (32 positions) et guide de mise en œuvre Forster presto
            n° 918301, édition 01/2021 (pages citées par leur code VP).
          </p>
        </div>
      </div>
      <Notice tone="info" title="Comment ces règles ont été établies">
        Les règles « explicites » sont écrites dans le guide de mise en œuvre ou confirmées par le demandeur. Les règles « dérivées » sont déduites
        des nomenclatures des 32 positions du dossier forsterpro. Dans les deux cas, les tests automatiques vérifient que l’ensemble reproduit exactement
        chaque ligne des 32 positions. Hors des dimensions du dossier, le résultat est signalé comme extrapolé.
      </Notice>
      {domains.map((domain) => (
        <div key={domain} className="table-wrap">
          <table className="data-table">
            <caption>{domain}</caption>
            <thead>
              <tr>
                <th scope="col">ID</th>
                <th scope="col">Règle</th>
                <th scope="col">Formule</th>
                <th scope="col">Vérifiée sur</th>
                <th scope="col">Sources</th>
                <th scope="col">Statut</th>
              </tr>
            </thead>
            <tbody>
              {PRESTO_RULES.filter((r) => r.domain === domain).map((r) => (
                <tr key={r.id}>
                  <td className="mono">{r.id}</td>
                  <td>{r.title}{r.note && <span className="sub">{r.note}</span>}</td>
                  <td className="small">{r.formula}</td>
                  <td className="small">{r.observedOn}</td>
                  <td className="small">{(r.sources ?? ['Dossier FFR Presto (32 positions)']).join(' ; ')}</td>
                  <td><span className={`tag tag--${STATUS[r.status]?.tone ?? 'warn'}`}>{STATUS[r.status]?.label ?? r.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
      <h2>Références lues dans le dossier</h2>
      <div className="table-wrap">
        <table className="data-table">
          <caption className="sr-only">Références produits du dossier</caption>
          <thead>
            <tr>
              <th scope="col">Référence</th>
              <th scope="col">Description (source)</th>
              <th scope="col">Unité</th>
              <th scope="col">Section / barre</th>
              <th scope="col">Unité de vente (guide)</th>
              <th scope="col">Première occurrence</th>
            </tr>
          </thead>
          <tbody>
            {FFR_PRESTO_CATALOGUE.entries.map((e) => (
              <tr key={e.ref}>
                <td className="mono">{e.ref}</td>
                <td>{e.descriptionRaw}{e.materialRaw && <span className="sub">{e.materialRaw}</span>}</td>
                <td>{e.unitRaw}</td>
                <td className="small">{e.sectionRaw ? `${e.sectionRaw} — barre ${e.barLengthMm} mm` : '—'}</td>
                <td className="small">{SALES_UNITS[e.ref] ? `${SALES_UNITS[e.ref]?.unit} (${SALES_UNITS[e.ref]?.source.vp})` : 'non trouvée'}</td>
                <td className="small">{e.firstSeen.positionId}, p. {e.firstSeen.pdfPage}, l. {e.firstSeen.line}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
