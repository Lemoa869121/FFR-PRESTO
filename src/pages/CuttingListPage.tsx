import { useMemo } from 'react';
import { QuoteRepository } from '../storage/quoteStorage';
import { calculateQuote, EMPTY_TOTALS } from '../calculation/engine';
import { formFromQuote, compositionLabel } from '../domain/quoteFactory';
import { formatMm } from '../utils/format';
import { CuttingListTable } from '../components/CuttingListTable';
import { CATEGORY_LABELS, CATEGORY_ORDER } from '../domain/materialCategories';
import { ResultTotals } from '../components/ResultTotals';
import { Notice, WarningList } from '../components/StatusNotice';
import { routeToHash } from '../app/router';

export function CuttingListPage({ repository, quoteId }: { repository: QuoteRepository; quoteId?: string }) {
  const quote = useMemo(() => {
    try {
      return quoteId ? repository.get(quoteId) : undefined;
    } catch {
      return undefined;
    }
  }, [repository, quoteId]);
  const result = useMemo(() => (quote ? calculateQuote(formFromQuote(quote)) : null), [quote]);

  return (
    <section aria-labelledby="cut-title">
      <div className="page-head">
        <div>
          <h1 id="cut-title">Liste de débit matière</h1>
          {quote ? (
            <p className="muted">
              {quote.project.name} — <span className="mono">{quote.project.quoteReference}</span> — {compositionLabel(quote)} —{' '}
              {formatMm(quote.dimensions.totalWidth)} × {formatMm(quote.dimensions.totalHeight)} — quantité {quote.project.quantity}
            </p>
          ) : (
            <p className="muted">Ouvrez un chiffrage depuis le tableau de bord pour afficher sa liste de débit.</p>
          )}
        </div>
        {quote && <a className="btn" href={routeToHash({ name: 'edit', id: quote.id })}>Retour au chiffrage</a>}
      </div>

      {quoteId && !quote && <Notice tone="bloquant">Chiffrage introuvable.</Notice>}

      <p className="muted small">
        Catégories prévues : {CATEGORY_ORDER.map((c) => CATEGORY_LABELS[c]).join(', ')}.
      </p>

      <CuttingListTable items={result?.cuttingList ?? []} caption={`Liste de débit matière — quantités pour 1 composition${quote ? ` (commande : ${quote.project.quantity})` : ''}`} />

      {result && (
        <>
          <h2>Alertes</h2>
          <WarningList warnings={result.warnings} />
        </>
      )}
      <h2>Résultat du chiffrage</h2>
      <ResultTotals totals={result?.totals ?? EMPTY_TOTALS} quantity={quote?.project.quantity ?? 1} />
    </section>
  );
}
