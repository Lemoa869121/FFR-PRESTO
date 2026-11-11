import { useMemo } from 'react';
import { QuoteRepository } from '../storage/quoteStorage';
import { useRoute, routeToHash, type Route } from './router';
import { DashboardPage } from '../pages/DashboardPage';
import { QuoteWizardPage } from '../pages/QuoteWizardPage';
import { CuttingListPage } from '../pages/CuttingListPage';
import { ImportPage } from '../pages/ImportPage';

const NAV: { label: string; route: Route }[] = [
  { label: 'Tableau de bord', route: { name: 'dashboard' } },
  { label: 'Nouveau chiffrage', route: { name: 'new' } },
  { label: 'Liste de débit', route: { name: 'cutting' } },
  { label: 'Import des données', route: { name: 'import' } },
];

export function App() {
  const route = useRoute();
  const repository = useMemo(() => new QuoteRepository(), []);

  return (
    <div className="app">
      <a className="skip-link" href="#contenu">Aller au contenu</a>
      <header className="app-header">
        <div className="app-header__brand">
          <span className="app-header__mark" aria-hidden="true" />
          <div>
            <p className="app-header__name">ForsterCalc</p>
            <p className="app-header__subtitle">Chiffrage automatique de portes et châssis Forster</p>
          </div>
        </div>
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
      </header>
      <main id="contenu" className="app-main" tabIndex={-1}>
        {route.name === 'dashboard' && <DashboardPage repository={repository} />}
        {route.name === 'new' && <QuoteWizardPage key="new" repository={repository} />}
        {route.name === 'edit' && <QuoteWizardPage key={route.id} repository={repository} quoteId={route.id} />}
        {route.name === 'cutting' && <CuttingListPage repository={repository} quoteId={route.id} />}
        {route.name === 'import' && <ImportPage />}
      </main>
      <footer className="app-footer">
        <p>
          Application interne — V1 matériel uniquement (hors main-d’œuvre, performances feu / acoustique / thermique,
          remises et marges). Aucun prix réel n’est intégré.
        </p>
      </footer>
    </div>
  );
}
