import type { CuttingListItem } from '../types';
import { CATEGORY_LABELS, CATEGORY_ORDER, EMPTY_CUTTING_LIST_MESSAGE } from '../domain/materialCategories';
import { formatEuro, formatMetres, formatMm, formatQuantity } from '../utils/format';

export function CuttingListTable({ items, caption = 'Liste de débit matière' }: { items: CuttingListItem[]; caption?: string }) {
  return (
    <div className="table-wrap" role="region" aria-label={caption} tabIndex={0}>
      <table className="data-table">
        <caption>{caption}</caption>
        <thead>
          <tr>
            <th scope="col">Référence</th>
            <th scope="col">Désignation</th>
            <th scope="col">Catégorie</th>
            <th scope="col" className="num">Longueur unitaire</th>
            <th scope="col" className="num">Quantité</th>
            <th scope="col" className="num">Longueur totale</th>
            <th scope="col" className="num">Prix unitaire</th>
            <th scope="col" className="num">Prix total</th>
            <th scope="col">Source de la donnée</th>
            <th scope="col">Commentaire</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan={10} className="empty-cell">{EMPTY_CUTTING_LIST_MESSAGE}</td>
            </tr>
          ) : (
            CATEGORY_ORDER.flatMap((cat) => {
              const rows = items.filter((i) => i.category === cat);
              if (rows.length === 0) return [];
              return [
                <tr key={`cat-${cat}`} className="group-row">
                  <th scope="rowgroup" colSpan={10}>{CATEGORY_LABELS[cat]}</th>
                </tr>,
                ...rows.map((item, idx) => (
                  <tr key={`${cat}-${idx}`}>
                    <td className="mono">{item.reference}</td>
                    <td>{item.designation}</td>
                    <td>{CATEGORY_LABELS[item.category]}</td>
                    <td className="num">
                      {formatMm(item.unitLengthMm)}
                      {item.lengthAfterTrimMm !== undefined && <span className="sub">après délardage : {formatMm(item.lengthAfterTrimMm)}</span>}
                    </td>
                    <td className="num">{formatQuantity(item.quantity, item.unit)}</td>
                    <td className="num">{formatMetres(item.totalLengthM)}</td>
                    <td className="num">{formatEuro(item.unitPrice)}</td>
                    <td className="num">{formatEuro(item.totalPrice)}</td>
                    <td className="small">{item.dataSource}</td>
                    <td className="small">
                      {[item.cutAngles && `Coupe ${item.cutAngles}`, item.orientation && `Repère ${item.orientation}`, item.comment].filter(Boolean).join(' · ')}
                    </td>
                  </tr>
                )),
              ];
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
