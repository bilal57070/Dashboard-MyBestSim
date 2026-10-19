import { fmtDec, fmtEuro, fmtInt } from '../format.js';

function Kpi({ label, value, note }) {
  return (
    <div className="kpi">
      <dt>{label}</dt>
      <dd>
        <span className="kpi-value">{value}</span>
        {note && <span className="kpi-note">{note}</span>}
      </dd>
    </div>
  );
}

export default function Kpis({ summary: s }) {
  const share = s.overThreshold / s.totalProducts;
  return (
    <dl className="kpis">
      <Kpi label="Cartes eSIM" value={fmtInt(s.totalProducts)} note={`${s.providerCount} fournisseurs`} />
      <Kpi
        label={`Produits à plus de ${s.priceThreshold} €`}
        value={fmtInt(s.overThreshold)}
        note={`${fmtDec(share * 100)} % du catalogue`}
      />
      <Kpi
        label="Fourchette de prix"
        value={
          <>
            {fmtEuro(s.priceMin.price)} <span className="kpi-sep">–</span> {fmtEuro(s.priceMax.price)}
          </>
        }
        note={`Max : ${s.priceMax.provider}, ${s.priceMax.label}`}
      />
      <Kpi
        label="Data moyenne par carte"
        value={`${fmtDec(s.avgDataGb)} Go`}
        note={`hors ${fmtInt(s.unlimitedCount)} forfaits illimités`}
      />
      <Kpi label="Prix moyen" value={fmtEuro(s.avgPrice)} note={`médiane ${fmtEuro(s.medianPrice)}`} />
      <Kpi
        label="Prix médian au Go"
        value={fmtEuro(s.medianPricePerGb)}
        note="forfaits avec volume défini"
      />
    </dl>
  );
}
