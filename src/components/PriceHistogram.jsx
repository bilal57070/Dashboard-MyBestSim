import { useState } from 'react';
import { fmtInt } from '../format.js';

export default function PriceHistogram({ buckets, threshold }) {
  const [active, setActive] = useState(null);
  const max = Math.max(...buckets.map((b) => b.count));
  const total = buckets.reduce((n, b) => n + b.count, 0);
  const shown = active ?? buckets.reduce((best, b) => (b.count > best.count ? b : best));

  return (
    <figure className="histogram">
      <figcaption className="readout" aria-live="polite">
        <span className="num">
          {shown.from}–{shown.to} €
        </span>
        <span>
          {fmtInt(shown.count)} offres · {((shown.count / total) * 100).toFixed(1).replace('.', ',')} %
        </span>
        {!active && <span className="muted">tranche la plus fréquente</span>}
      </figcaption>

      <div className="hist-plot" onMouseLeave={() => setActive(null)}>
        {buckets.map((b) => (
          <button
            type="button"
            key={b.from}
            className={`hist-col${b.from >= threshold ? ' over' : ''}${active === b ? ' active' : ''}`}
            onMouseEnter={() => setActive(b)}
            onFocus={() => setActive(b)}
            onBlur={() => setActive(null)}
            aria-label={`${b.from} à ${b.to} € : ${b.count} offres`}
          >
            <span className="hist-bar" style={{ height: `${(b.count / max) * 100}%` }} />
          </button>
        ))}
      </div>
      <div className="hist-axis" aria-hidden="true">
        {buckets.map((b) => (
          <span key={b.from}>{b.from % 50 === 0 ? `${b.from} €` : ''}</span>
        ))}
      </div>
      <p className="legend">
        <span className="swatch over" /> au-delà de {threshold} €
      </p>
    </figure>
  );
}
