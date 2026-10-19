import { useMemo, useState } from 'react';
import { fmtData, fmtEuro, fmtInt } from '../format.js';

const PAGE = 20;
const VOLUMES = ['1', '3', '5', '10', '20', '50', 'unlimited'];
const VALIDITIES = ['7', '15', '30'];

export default function OfferFinder({ catalog }) {
  const [filters, setFilters] = useState({
    destination: '',
    provider: '',
    volume: '',
    validity: '',
    only5g: false,
    onlyTopUp: false,
  });
  const [limit, setLimit] = useState(PAGE);
  const set = (key) => (e) => {
    setFilters((f) => ({ ...f, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
    setLimit(PAGE);
  };

  const { countries, regions } = useMemo(() => {
    const entries = Object.entries(catalog.destinations).sort((a, b) => a[1].localeCompare(b[1], 'fr'));
    const regionCodes = new Set(['WW', 'EU', 'AS', 'NA']);
    return {
      countries: entries.filter(([code]) => !regionCodes.has(code)),
      regions: entries.filter(([code]) => regionCodes.has(code)),
    };
  }, [catalog]);

  const matches = useMemo(() => {
    const providerIndex = filters.provider === '' ? -1 : Number(filters.provider);
    return catalog.rows.filter(([provider, code, data, validity, , is5g, topUp]) => {
      if (filters.destination && code !== filters.destination) return false;
      if (providerIndex >= 0 && provider !== providerIndex) return false;
      if (filters.volume === 'unlimited' && data !== null) return false;
      if (filters.volume && filters.volume !== 'unlimited' && data !== Number(filters.volume)) return false;
      if (filters.validity && validity !== Number(filters.validity)) return false;
      if (filters.only5g && !is5g) return false;
      if (filters.onlyTopUp && !topUp) return false;
      return true;
    });
  }, [catalog, filters]);

  return (
    <>
      <form className="filters" onSubmit={(e) => e.preventDefault()}>
        <label>
          Destination
          <select value={filters.destination} onChange={set('destination')}>
            <option value="">Toutes</option>
            <optgroup label="Zones">
              {regions.map(([code, name]) => (
                <option key={code} value={code}>
                  {name}
                </option>
              ))}
            </optgroup>
            <optgroup label="Pays">
              {countries.map(([code, name]) => (
                <option key={code} value={code}>
                  {name}
                </option>
              ))}
            </optgroup>
          </select>
        </label>
        <label>
          Fournisseur
          <select value={filters.provider} onChange={set('provider')}>
            <option value="">Tous</option>
            {catalog.providers.map((name, i) => (
              <option key={name} value={i}>
                {name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Data
          <select value={filters.volume} onChange={set('volume')}>
            <option value="">Toutes</option>
            {VOLUMES.map((v) => (
              <option key={v} value={v}>
                {v === 'unlimited' ? 'Illimité' : `${v} Go`}
              </option>
            ))}
          </select>
        </label>
        <label>
          Durée
          <select value={filters.validity} onChange={set('validity')}>
            <option value="">Toutes</option>
            {VALIDITIES.map((v) => (
              <option key={v} value={v}>
                {v} jours
              </option>
            ))}
          </select>
        </label>
        <div className="filter-checks">
          <label className="check">
            <input type="checkbox" checked={filters.only5g} onChange={set('only5g')} />
            5G uniquement
          </label>
          <label className="check">
            <input type="checkbox" checked={filters.onlyTopUp} onChange={set('onlyTopUp')} />
            Rechargeable
          </label>
        </div>
      </form>

      <p className="result-count" aria-live="polite">
        {fmtInt(matches.length)} offre{matches.length > 1 ? 's' : ''}
        {matches.length > limit && ` · ${limit} moins chères affichées`}
      </p>

      {matches.length === 0 ? (
        <p className="empty">Aucune offre ne correspond à ces critères.</p>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Prix</th>
                <th className="left">Fournisseur</th>
                <th className="left">Destination</th>
                <th>Data</th>
                <th>Durée</th>
                <th>Prix / Go</th>
                <th className="left">Réseau</th>
                <th className="left">Recharge</th>
              </tr>
            </thead>
            <tbody>
              {matches.slice(0, limit).map(([provider, code, data, validity, price, is5g, topUp], i) => (
                <tr key={i}>
                  <td className="num strong">{fmtEuro(price)}</td>
                  <td className="left">{catalog.providers[provider]}</td>
                  <td className="left">{catalog.destinations[code]}</td>
                  <td className="num">{fmtData(data)}</td>
                  <td className="num">{validity} j</td>
                  <td className="num muted">{data ? fmtEuro(price / data) : '—'}</td>
                  <td className="left">{is5g ? '5G' : '4G'}</td>
                  <td className="left">{topUp ? 'Oui' : 'Non'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {matches.length > limit && (
        <button type="button" className="more" onClick={() => setLimit((n) => n + PAGE)}>
          Afficher {Math.min(PAGE, matches.length - limit)} offres de plus
        </button>
      )}
    </>
  );
}
