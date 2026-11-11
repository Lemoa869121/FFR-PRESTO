import { useCallback, useState } from 'react';
import type { Quote } from '../types';
import { QuoteRepository, StorageError } from '../storage/quoteStorage';
import { compositionLabel, STATUS_LABELS } from '../domain/quoteFactory';
import { formatDateTime, formatEuro, formatMm } from '../utils/format';
import { navigate, routeToHash } from '../app/router';
import { Notice } from '../components/StatusNotice';

function loadQuotes(repository: QuoteRepository): { quotes: Quote[]; error: string | null } {
  try {
    return { quotes: repository.list(), error: null };
  } catch (e) {
    return { quotes: [], error: e instanceof StorageError ? e.message : 'Erreur inconnue lors de la lecture des chiffrages.' };
  }
}

export function DashboardPage({ repository }: { repository: QuoteRepository }) {
  const [state, setState] = useState(() => loadQuotes(repository));
  const [message, setMessage] = useState<string | null>(null);
  const refresh = useCallback(() => setState(loadQuotes(repository)), [repository]);

  const run = (action: () => void, success: string) => {
    try {
      action();
      setMessage(success);
      refresh();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Action impossible.');
    }
  };

  return (
    <section aria-labelledby="dashboard-title">
      <div className="hero">
        <span className="pill">Chiffrage matériel Forster Presto</span>
        <h1 id="dashboard-title">
          Tableau de bord
          <span className="hero__accent">Portes et châssis Presto</span>
        </h1>
        <p>
          Chiffrages enregistrés sur ce poste (stockage local du navigateur). Les nomenclatures sont calculées avec les règles
          dérivées du dossier de fabrication forsterpro « FFR Presto ».
        </p>
        <p>
          <button type="button" className="btn btn--primary" onClick={() => navigate({ name: 'new' })}>
            Nouveau chiffrage
          </button>
        </p>
      </div>

      {state.error && <Notice tone="bloquant" title="Lecture impossible">{state.error}</Notice>}
      <p className="sr-status" role="status" aria-live="polite">{message ?? ''}</p>

      {state.quotes.length === 0 ? (
        <div className="empty-state">
          <p>Aucun chiffrage enregistré.</p>
          <p className="muted">Créez un premier chiffrage avec le bouton « Nouveau chiffrage ».</p>
        </div>
      ) : (
        <div className="table-wrap" role="region" aria-label="Chiffrages enregistrés" tabIndex={0}>
          <table className="data-table">
            <caption className="sr-only">Chiffrages enregistrés</caption>
            <thead>
              <tr>
                <th scope="col">Projet / référence</th>
                <th scope="col">Modifié le</th>
                <th scope="col">Composition</th>
                <th scope="col" className="num">Dimensions (L × H)</th>
                <th scope="col" className="num">Qté</th>
                <th scope="col" className="num">Prix total</th>
                <th scope="col">Statut</th>
                <th scope="col"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {state.quotes.map((q) => (
                <tr key={q.id}>
                  <td>
                    <a href={routeToHash({ name: 'edit', id: q.id })} className="strong-link">{q.project.name}</a>
                    <span className="sub mono">{q.project.quoteReference}</span>
                  </td>
                  <td>{formatDateTime(q.updatedAt)}</td>
                  <td>{compositionLabel(q)}</td>
                  <td className="num">{formatMm(q.dimensions.totalWidth)} × {formatMm(q.dimensions.totalHeight)}</td>
                  <td className="num">{q.project.quantity}</td>
                  <td className="num">{formatEuro(q.totalPrice)}</td>
                  <td><span className={`badge badge--${q.status}`}>{STATUS_LABELS[q.status]}</span></td>
                  <td className="actions">
                    <div className="actions__group">
                    <button type="button" className="btn btn--small" onClick={() => navigate({ name: 'edit', id: q.id })} aria-label={`Ouvrir ${q.project.name}`}>Ouvrir</button>
                    <button type="button" className="btn btn--small" onClick={() => run(() => repository.duplicate(q.id), `Chiffrage « ${q.project.name} » dupliqué.`)} aria-label={`Dupliquer ${q.project.name}`}>Dupliquer</button>
                    <button
                      type="button"
                      className="btn btn--small btn--danger"
                      aria-label={`Supprimer ${q.project.name}`}
                      onClick={() => {
                        if (window.confirm(`Supprimer définitivement le chiffrage « ${q.project.name} » ?`)) {
                          run(() => repository.remove(q.id), `Chiffrage « ${q.project.name} » supprimé.`);
                        }
                      }}
                    >
                      Supprimer
                    </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
