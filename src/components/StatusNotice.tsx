import type { ReactNode } from 'react';
import type { ValidationWarning } from '../types';

type Tone = 'demo' | 'info' | 'attention' | 'bloquant';

export function Notice({ tone = 'info', title, children }: { tone?: Tone; title?: string; children: ReactNode }) {
  return (
    <div className={`notice notice--${tone}`} role={tone === 'bloquant' ? 'alert' : 'note'}>
      {title && <p className="notice__title">{title}</p>}
      <div className="notice__body">{children}</div>
    </div>
  );
}

/** Small inline tag for provisional data ("Donnée de démonstration", "Valeur provisoire"…). */
export function DemoTag({ children = 'Donnée de démonstration' }: { children?: ReactNode }) {
  return <span className="tag tag--demo">{children}</span>;
}

export function WarningList({ warnings }: { warnings: ValidationWarning[] }) {
  if (warnings.length === 0) return <p className="muted">Aucune alerte.</p>;
  return (
    <ul className="warning-list">
      {warnings.map((w, i) => (
        <li key={`${w.code}-${i}`} className={`warning warning--${w.level}`}>
          <span className="warning__level">{w.level === 'bloquant' ? 'Bloquant' : w.level === 'attention' ? 'Attention' : 'Info'}</span>
          <span>{w.message}</span>
        </li>
      ))}
    </ul>
  );
}
