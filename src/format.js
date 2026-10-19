const integer = new Intl.NumberFormat('fr-FR');
const euro = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' });
const percent = new Intl.NumberFormat('fr-FR', { style: 'percent', maximumFractionDigits: 0 });
const decimal = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 });

export const fmtInt = (n) => integer.format(n);
export const fmtEuro = (n) => (n == null ? '—' : euro.format(n));
export const fmtPct = (n) => (n == null ? '—' : percent.format(n));
export const fmtDec = (n) => (n == null ? '—' : decimal.format(n));
export const fmtData = (gb) => (gb == null ? 'Illimité' : `${gb} Go`);
export const fmtDate = (iso) =>
  new Date(iso).toLocaleString('fr-FR', { dateStyle: 'long', timeStyle: 'short', timeZone: 'Europe/Paris' });
