import { fmtEuro, fmtInt } from '../format.js';

export default function PriceMatrix({ matrix }) {
  const validities = matrix[0].cells.map((c) => c.validityDays);
  return (
    <div className="table-wrap">
      <table className="table matrix">
        <thead>
          <tr>
            <th className="left">Data</th>
            {validities.map((v) => (
              <th key={v}>{v} jours</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {matrix.map((row) => (
            <tr key={row.volume}>
              <th scope="row" className="left">
                {row.volume === 'unlimited' ? 'Illimité' : `${row.volume} Go`}
              </th>
              {row.cells.map((c) => (
                <td key={c.validityDays} className="num" title={`${fmtInt(c.count)} offres`}>
                  {fmtEuro(c.medianPrice)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
