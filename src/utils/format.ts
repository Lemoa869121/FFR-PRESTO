/** French display formatting (virgule décimale, espace insécable pour les milliers). */

const mmFormatter = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 });
const metreFormatter = new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const integerFormatter = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 });
const euroFormatter = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' });
const dateFormatter = new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
const dateTimeFormatter = new Intl.DateTimeFormat('fr-FR', {
  day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
});

export function formatMm(value: number | undefined | null): string {
  if (value === undefined || value === null || Number.isNaN(value)) return '—';
  return `${mmFormatter.format(value)} mm`;
}

export function formatMetres(value: number | undefined | null): string {
  if (value === undefined || value === null || Number.isNaN(value)) return '—';
  return `${metreFormatter.format(value)} m`;
}

export function formatQuantity(value: number, unit: 'piece' | 'metre'): string {
  return unit === 'metre' ? formatMetres(value) : integerFormatter.format(value);
}

export function formatEuro(value: number | null | undefined): string {
  if (value === undefined || value === null || Number.isNaN(value)) return 'Prix non disponible';
  return euroFormatter.format(value);
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '—' : dateFormatter.format(d);
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '—' : dateTimeFormatter.format(d);
}

/** Today's date as YYYY-MM-DD in local time. */
export function todayIso(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Parses a French decimal string ("2 036,5") into a number; returns NaN when invalid. */
export function parseFrenchNumber(input: string): number {
  const cleaned = input.replace(/[\s\u00a0\u202f]/g, '').replace(',', '.');
  if (cleaned === '' || !/^-?\d+(\.\d+)?$/.test(cleaned)) return Number.NaN;
  return Number(cleaned);
}
