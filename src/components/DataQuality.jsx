import { fmtInt } from '../format.js';

export default function DataQuality({ quality: q, summary: s }) {
  return (
    <footer className="quality">
      <div>
        <h2>Qualité des données</h2>
        <p>
          {fmtInt(q.totalRows)} lignes lues dans {q.files.length} fichiers ·{' '}
          <strong>{fmtInt(q.accepted)} produits retenus</strong> · {fmtInt(q.rejected)} ligne
          {q.rejected > 1 ? 's' : ''} rejetée{q.rejected > 1 ? 's' : ''}.
        </p>
        {q.issues.length > 0 && (
          <ul className="issues">
            {q.issues.map((i, n) => (
              <li key={n}>
                <code>
                  {i.file}:{i.line}
                </code>{' '}
                {i.reason}
              </li>
            ))}
            {q.truncatedIssues > 0 && <li>… et {q.truncatedIssues} autres</li>}
          </ul>
        )}
      </div>
      <div>
        <h2>Règles de calcul</h2>
        <ul>
          <li>
            Data moyenne calculée sur les {fmtInt(s.meteredCount)} forfaits à volume défini ; les{' '}
            {fmtInt(s.unlimitedCount)} forfaits illimités sont exclus.
          </li>
          <li>« Plus de {s.priceThreshold} € » signifie strictement supérieur à {s.priceThreshold} €.</li>
          <li>Le code « NA » désigne l'Amérique du Nord, pas une valeur manquante.</li>
          <li>Une ligne au prix non numérique, dans une autre devise que l'euro ou en double est rejetée.</li>
        </ul>
      </div>
    </footer>
  );
}
