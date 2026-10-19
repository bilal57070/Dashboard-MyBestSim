import stats from './generated/stats.json';
import { fmtDate, fmtInt } from './format.js';
import Kpis from './components/Kpis.jsx';
import ProviderTable from './components/ProviderTable.jsx';
import PriceHistogram from './components/PriceHistogram.jsx';
import PriceMatrix from './components/PriceMatrix.jsx';
import Destinations from './components/Destinations.jsx';
import OfferFinder from './components/OfferFinder.jsx';
import DataQuality from './components/DataQuality.jsx';

function Section({ id, title, description, children }) {
  return (
    <section className="section" aria-labelledby={id}>
      <header className="section-head">
        <h2 id={id}>{title}</h2>
        {description && <p>{description}</p>}
      </header>
      {children}
    </section>
  );
}

export default function App() {
  const { summary, quality } = stats;

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <p className="eyebrow">MyBestSim</p>
          <h1>Catalogue eSIM</h1>
        </div>
        <p className="meta">
          {fmtInt(quality.files.length)} fichiers fournisseurs · mis à jour le {fmtDate(stats.generatedAt)}
        </p>
      </header>

      <Kpis summary={summary} />

      <Section
        id="fournisseurs"
        title="Répartition par fournisseur"
        description="Cliquez sur un en-tête de colonne pour trier."
      >
        <ProviderTable providers={stats.providers} />
      </Section>

      <div className="grid-2">
        <Section
          id="distribution"
          title="Distribution des prix"
          description="Nombre d'offres par tranche de 10 €."
        >
          <PriceHistogram buckets={stats.histogram} threshold={summary.priceThreshold} />
        </Section>

        <Section
          id="matrice"
          title="Prix médian selon le forfait"
          description="Volume de data × durée de validité, tous fournisseurs confondus."
        >
          <PriceMatrix matrix={stats.matrix} />
        </Section>
      </div>

      <Section
        id="destinations"
        title="Destinations les plus couvertes"
        description={`${summary.countryCount} pays et ${summary.regionCount} zones multi-pays (Europe, Asie, Amérique du Nord, Monde).`}
      >
        <Destinations destinations={stats.destinations} />
      </Section>

      <Section
        id="recherche"
        title="Trouver une offre"
        description="Toutes les offres du catalogue, de la moins chère à la plus chère."
      >
        <OfferFinder catalog={stats.catalog} />
      </Section>

      <DataQuality quality={quality} summary={summary} />
    </div>
  );
}
