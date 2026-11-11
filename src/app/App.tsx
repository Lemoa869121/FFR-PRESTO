import { lazy, Suspense, useMemo } from 'react';
import { QuoteRepository } from '../storage/quoteStorage';
import { useRoute, routeToHash, type Route } from './router';
import { DashboardPage } from '../pages/DashboardPage';
import { QuoteWizardPage } from '../pages/QuoteWizardPage';
import { CuttingListPage } from '../pages/CuttingListPage';
import { RulesPage } from '../pages/RulesPage';

// The import screen bundles SheetJS: load it only when opened.
const ImportPage = lazy(() => import('../pages/ImportPage').then((m) => ({ default: m.ImportPage })));

// Official Forster logos (charte graphique, identical to SERRURE_STD).
const LOGO_WHITE = `${import.meta.env.BASE_URL}logo-forster-blanc.svg`;
const LOGO_BLUE = `${import.meta.env.BASE_URL}logo-forster.svg`;

const NAV: { label: string; route: Route }[] = [
  { label: 'Tableau de bord', route: { name: 'dashboard' } },
  { label: 'Nouveau chiffrage', route: { name: 'new' } },
  { label: 'Liste de débit', route: { name: 'cutting' } },
  { label: 'Import des données', route: { name: 'import' } },
  { label: 'Règles de calcul', route: { name: 'rules' } },
];

export function App() {
  const route = useRoute();
  const repository = useMemo(() => new QuoteRepository(), []);

  return (
    <div className="app">
      <a className="skip-link" href="#contenu">Aller au contenu</a>
      <header className="app-header">
        <div className="app-header__inner">
          <a className="app-header__brand" href={routeToHash({ name: 'dashboard' })}>
            <img src={LOGO_WHITE} alt="Forster" className="app-header__logo" />
            <span className="app-header__name">
              <span className="app-header__title">ForsterCalc</span>
              <span className="app-header__subtitle">Chiffrage automatique de portes et châssis Forster</span>
            </span>
          </a>
          <nav aria-label="Navigation principale">
            <ul className="app-nav">
              {NAV.map((item) => (
                <li key={item.label}>
                  <a
                    href={routeToHash(item.route)}
                    aria-current={item.route.name === route.name ? 'page' : undefined}
                    className="app-nav__link"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>
      <main id="contenu" className="app-main" tabIndex={-1}>
        {route.name === 'dashboard' && <DashboardPage repository={repository} />}
        {route.name === 'new' && <QuoteWizardPage key="new" repository={repository} />}
        {route.name === 'edit' && <QuoteWizardPage key={route.id} repository={repository} quoteId={route.id} />}
        {route.name === 'cutting' && <CuttingListPage repository={repository} quoteId={route.id} />}
        {route.name === 'import' && (
          <Suspense fallback={<p role="status">Chargement du module d’import…</p>}>
            <ImportPage />
          </Suspense>
        )}
        {route.name === 'rules' && <RulesPage />}
      </main>
      <footer className="app-footer">
        <div className="app-footer__inner">
          <div className="app-footer__brand">
            <img src={LOGO_BLUE} alt="Forster" className="app-footer__logo" />
            <span className="app-footer__claim">Steel is our nature.</span>
          </div>
          <p className="app-footer__note">
            ForsterCalc — application interne, V1 matériel uniquement (hors main-d’œuvre, performances feu / acoustique / thermique,
            remises et marges). Aucun prix réel n’est intégré. Règles Presto dérivées du dossier forsterpro « FFR Presto ».
          </p>
        </div>
      </footer>
    </div>
  );
}
