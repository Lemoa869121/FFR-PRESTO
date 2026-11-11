import { useEffect, useState } from 'react';

/** Hash based routes: work on GitHub Pages without server configuration. */
export type Route =
  | { name: 'dashboard' }
  | { name: 'new' }
  | { name: 'edit'; id: string }
  | { name: 'cutting'; id?: string }
  | { name: 'import' };

export function parseHash(hash: string): Route {
  const path = hash.replace(/^#/, '');
  const parts = path.split('/').filter(Boolean);
  if (parts[0] === 'chiffrage' && parts[1] === 'nouveau') return { name: 'new' };
  if (parts[0] === 'chiffrage' && parts[1]) return { name: 'edit', id: decodeURIComponent(parts[1]) };
  if (parts[0] === 'debit') return parts[1] ? { name: 'cutting', id: decodeURIComponent(parts[1]) } : { name: 'cutting' };
  if (parts[0] === 'import') return { name: 'import' };
  return { name: 'dashboard' };
}

export function routeToHash(route: Route): string {
  switch (route.name) {
    case 'dashboard': return '#/';
    case 'new': return '#/chiffrage/nouveau';
    case 'edit': return `#/chiffrage/${encodeURIComponent(route.id)}`;
    case 'cutting': return route.id ? `#/debit/${encodeURIComponent(route.id)}` : '#/debit';
    case 'import': return '#/import';
  }
}

export function navigate(route: Route): void {
  window.location.hash = routeToHash(route);
}

export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(() => parseHash(window.location.hash));
  useEffect(() => {
    const onChange = () => {
      setRoute(parseHash(window.location.hash));
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return route;
}
