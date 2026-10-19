import { useState } from 'react';
import { fmtEuro, fmtInt, fmtPct } from '../format.js';

const COLUMNS = [
  { key: 'name', label: 'Fournisseur', align: 'left' },
  { key: 'count', label: 'Produits', align: 'left' },
  { key: 'share', label: 'Part', format: fmtPct },
  { key: 'avgPrice', label: 'Prix moyen', format: fmtEuro },
  { key: 'medianPricePerGb', label: 'Médiane / Go', format: fmtEuro },
  { key: 'share5g', label: '5G', format: fmtPct },
  { key: 'shareTopUp', label: 'Rechargeable', format: fmtPct },
  { key: 'destinations', label: 'Destinations', format: fmtInt },
];

export default function ProviderTable({ providers }) {
  const [sort, setSort] = useState({ key: 'count', dir: -1 });
  const max = Math.max(...providers.map((p) => p.count));

  const rows = [...providers].sort((a, b) => {
    const va = a[sort.key];
    const vb = b[sort.key];
    const cmp = typeof va === 'string' ? va.localeCompare(vb, 'fr') : va - vb;
    return cmp * sort.dir;
  });

  const toggle = (key) =>
    setSort((s) => (s.key === key ? { key, dir: -s.dir } : { key, dir: key === 'name' ? 1 : -1 }));

  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            {COLUMNS.map((c) => {
              const active = sort.key === c.key;
              return (
                <th
                  key={c.key}
                  className={c.align === 'left' ? 'left' : undefined}
                  aria-sort={active ? (sort.dir === 1 ? 'ascending' : 'descending') : 'none'}
                >
                  <button type="button" className="sort" onClick={() => toggle(c.key)}>
                    {c.label}
                    <span className="sort-mark" aria-hidden="true">
                      {active ? (sort.dir === 1 ? '↑' : '↓') : ''}
                    </span>
                  </button>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.map((p) => (
            <tr key={p.name}>
              <th scope="row" className="left">
                {p.name}
              </th>
              <td className="left bar-cell">
                <span className="bar-track">
                  <span className="bar" style={{ width: `${(p.count / max) * 100}%` }} />
                </span>
                <span className="num">{fmtInt(p.count)}</span>
              </td>
              {COLUMNS.slice(2).map((c) => (
                <td key={c.key} className="num">
                  {c.format(p[c.key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
