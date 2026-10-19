import { useState } from 'react';
import { fmtEuro, fmtInt } from '../format.js';

export default function Destinations({ destinations }) {
  const [includeRegions, setIncludeRegions] = useState(false);
  const rows = destinations.filter((d) => includeRegions || !d.isRegion).slice(0, 10);
  const max = Math.max(...rows.map((d) => d.count));

  return (
    <>
      <label className="check">
        <input type="checkbox" checked={includeRegions} onChange={(e) => setIncludeRegions(e.target.checked)} />
        Inclure les zones multi-pays
      </label>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th className="left">Destination</th>
              <th className="left">Offres</th>
              <th>Fournisseurs</th>
              <th>Médiane / Go</th>
              <th>Dès</th>
              <th className="left">Offre la moins chère</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((d) => (
              <tr key={d.code}>
                <th scope="row" className="left">
                  {d.name}
                </th>
                <td className="left bar-cell">
                  <span className="bar-track">
                    <span className="bar" style={{ width: `${(d.count / max) * 100}%` }} />
                  </span>
                  <span className="num">{fmtInt(d.count)}</span>
                </td>
                <td className="num">{d.providers}</td>
                <td className="num">{fmtEuro(d.medianPricePerGb)}</td>
                <td className="num">{fmtEuro(d.minPrice)}</td>
                <td className="left muted">{d.cheapestOffer}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
