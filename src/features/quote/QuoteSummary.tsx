import type { QuoteFormValues } from '../../validation/quoteSchema';
import { DIMENSION_LABELS, getComposition, visibleDimensionFields } from '../../domain/compositions';
import { compositionLabel } from '../../domain/quoteFactory';
import { OPTION_LISTS } from '../../data/provisionalOptions';
import { calculateQuote } from '../../calculation/engine';
import { formatDate, formatEuro, formatMm } from '../../utils/format';
import { CompositionPreview } from '../../components/CompositionPreview';
import { CuttingListTable } from '../../components/CuttingListTable';
import { ResultTotals } from '../../components/ResultTotals';
import { WarningList } from '../../components/StatusNotice';
import type { CalculationResult } from '../../types';

function safeCalculate(values: QuoteFormValues): CalculationResult | { error: string } {
  try {
    return calculateQuote(values);
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Calcul impossible.' };
  }
}

export function QuoteSummary({ values }: { values: QuoteFormValues }) {
  const def = getComposition(values.composition.type);
  const fields = visibleDimensionFields(values.composition.type, values.composition.leafCount);
  const result = safeCalculate(values);
  const optionLabel = (field: (typeof OPTION_LISTS)[number]['field'], value: string) =>
    OPTION_LISTS.find((l) => l.field === field)?.choices.find((c) => c.value === value)?.label ?? (value || '—');

  return (
    <div className="summary">
      <div className="summary__grid">
        <section className="card" aria-labelledby="sum-info">
          <h2 id="sum-info">Informations générales</h2>
          <dl className="kv">
            <dt>Projet</dt><dd>{values.project.name || '—'}</dd>
            <dt>Référence</dt><dd className="mono">{values.project.quoteReference || '—'}</dd>
            <dt>Client</dt><dd>{values.project.clientName || '—'}</dd>
            <dt>Date de création</dt><dd>{formatDate(values.project.createdOn)}</dd>
            <dt>Quantité</dt><dd>{values.project.quantity}</dd>
            {values.project.description && (<><dt>Description</dt><dd>{values.project.description}</dd></>)}
          </dl>
        </section>
        <section className="card" aria-labelledby="sum-compo">
          <h2 id="sum-compo">Composition et dimensions</h2>
          <dl className="kv">
            <dt>Composition</dt><dd>{compositionLabel(values)}</dd>
            {fields.filter((f) => f !== 'mainLeafWidth' && f !== 'secondaryLeafWidth').map((f) => (<FragmentRow key={f} label={DIMENSION_LABELS[f]} value={formatMm(values.dimensions[f])} />))}
            {'geometry' in result && result.geometry && (
              <>
                <dt>Passage dormant (calculé)</dt><dd>{formatMm(result.geometry.doorFrameWidthMm)} × {formatMm(result.geometry.doorZoneHeightMm)}</dd>
                <dt>Vantail{result.geometry.leafCount === 2 ? 's (chacun)' : ''} (calculé)</dt><dd>{formatMm(result.geometry.leafWidthMm)} × {formatMm(result.geometry.leafHeightMm)}</dd>
              </>
            )}
            <dt>Position de référence</dt>
            <dd>{'referencePositionId' in result && result.referencePositionId
              ? <span className="tag tag--ok">{result.referencePositionId} (dossier FFR Presto)</span>
              : <span className="tag tag--warn">Aucune — résultat extrapolé</span>}</dd>
          </dl>
        </section>
        <section className="card" aria-labelledby="sum-opt">
          <h2 id="sum-opt">Options techniques</h2>
          <dl className="kv">
            <dt>Ouverture</dt><dd>{values.options.openingSide === 'interieur' ? 'Intérieure' : 'Extérieure'}</dd>
            <dt>Tirant</dt><dd>{values.options.handing === 'tirant_gauche' ? 'Tirant gauche' : 'Tirant droit'}</dd>
            {OPTION_LISTS.map((l) => (<FragmentRow key={l.field} label={l.label} value={optionLabel(l.field, values.options[l.field])} />))}
            <dt>Autres accessoires</dt><dd>{values.options.otherAccessories || '—'}</dd>
          </dl>
        </section>
      </div>

      <section className="card" aria-labelledby="sum-preview">
        <h2 id="sum-preview">Schéma simplifié</h2>
        <CompositionPreview type={values.composition.type} leafCount={values.composition.leafCount} dimensions={values.dimensions} handing={values.options.handing} />
      </section>

      {'error' in result ? (
        <p className="field__error">{result.error}</p>
      ) : (
        <>
          <section className="card" aria-labelledby="sum-warn">
            <h2 id="sum-warn">Alertes et données manquantes</h2>
            {!def.rulesAvailable && <p className="tag tag--warn">Règle métier à fournir pour cette composition</p>}
            <WarningList warnings={result.warnings} />
          </section>
          <section className="card" aria-labelledby="sum-cut">
            <h2 id="sum-cut">Liste de débit</h2>
            <CuttingListTable items={result.cuttingList} caption="Liste de débit matière — quantités pour 1 composition" />
          </section>
          <section className="card" aria-labelledby="sum-tot">
            <h2 id="sum-tot">Détail du chiffrage</h2>
            <ResultTotals totals={result.totals} quantity={values.project.quantity} />
            <p className="total-line">
              Montant total du matériel : <strong>{formatEuro(result.totals.materialForQuantity)}</strong>
            </p>
          </section>
        </>
      )}
    </div>
  );
}

function FragmentRow({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </>
  );
}
