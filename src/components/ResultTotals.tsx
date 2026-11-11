import type { CalculationTotals } from '../types';
import { formatEuro } from '../utils/format';

const ROWS: { key: keyof CalculationTotals; label: string; strong?: boolean }[] = [
  { key: 'profiles', label: 'Total des profilés' },
  { key: 'glazingOrInfill', label: 'Total du vitrage ou remplissage' },
  { key: 'hardware', label: 'Total de la quincaillerie' },
  { key: 'accessories', label: 'Total des accessoires' },
  { key: 'other', label: 'Total des autres composants' },
  { key: 'material', label: 'Total matériel (unitaire)', strong: true },
  { key: 'materialForQuantity', label: 'Prix total pour la quantité demandée', strong: true },
];

export function ResultTotals({ totals, quantity }: { totals: CalculationTotals; quantity: number }) {
  return (
    <div className="table-wrap">
      <table className="data-table totals-table">
        <caption>Détail du chiffrage matériel (hors main-d’œuvre)</caption>
        <tbody>
          {ROWS.map((r) => (
            <tr key={r.key} className={r.strong ? 'total-row' : undefined}>
              <th scope="row">{r.key === 'materialForQuantity' ? `${r.label} (× ${quantity})` : r.label}</th>
              <td className="num">{formatEuro(totals[r.key])}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
