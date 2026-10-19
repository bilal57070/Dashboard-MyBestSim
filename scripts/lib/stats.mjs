// Calcul des statistiques à partir de la liste de produits validés.
// Fonctions pures : aucune lecture de fichier, testables isolément.

export const PRICE_THRESHOLD = 100;
export const HISTOGRAM_STEP = 10;
export const VOLUMES = [1, 3, 5, 10, 20, 50];
export const VALIDITIES = [7, 15, 30];

const round = (n, digits = 2) => (n == null || Number.isNaN(n) ? null : Number(n.toFixed(digits)));
const sum = (xs) => xs.reduce((a, b) => a + b, 0);
const mean = (xs) => (xs.length ? sum(xs) / xs.length : null);

export function median(xs) {
  if (!xs.length) return null;
  const s = [...xs].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

function groupBy(items, key) {
  const map = new Map();
  for (const item of items) {
    const k = key(item);
    if (!map.has(k)) map.set(k, []);
    map.get(k).push(item);
  }
  return map;
}

const pricesOf = (ps) => ps.map((p) => p.price);
const metered = (ps) => ps.filter((p) => !p.unlimited);
const pricePerGb = (ps) => metered(ps).map((p) => p.price / p.dataGb);
const cheapest = (ps) => ps.reduce((best, p) => (p.price < best.price ? p : best));

export function computeSummary(products) {
  const prices = pricesOf(products);
  const withData = metered(products);
  const min = cheapest(products);
  const max = products.reduce((best, p) => (p.price > best.price ? p : best));
  const countries = new Set(products.filter((p) => !p.isRegion).map((p) => p.countryCode));
  const regions = new Set(products.filter((p) => p.isRegion).map((p) => p.countryCode));

  return {
    totalProducts: products.length,
    overThreshold: products.filter((p) => p.price > PRICE_THRESHOLD).length,
    priceThreshold: PRICE_THRESHOLD,
    priceMin: { price: min.price, sku: min.sku, provider: min.provider, label: describe(min) },
    priceMax: { price: max.price, sku: max.sku, provider: max.provider, label: describe(max) },
    avgPrice: round(mean(prices)),
    medianPrice: round(median(prices)),
    avgDataGb: round(mean(withData.map((p) => p.dataGb)), 1),
    meteredCount: withData.length,
    unlimitedCount: products.length - withData.length,
    medianPricePerGb: round(median(pricePerGb(products))),
    providerCount: new Set(products.map((p) => p.provider)).size,
    countryCount: countries.size,
    regionCount: regions.size,
    share5g: round(products.filter((p) => p.network === '5G').length / products.length, 4),
    shareTopUp: round(products.filter((p) => p.topUp).length / products.length, 4),
  };
}

export function describe(p) {
  const data = p.unlimited ? 'Illimité' : `${p.dataGb} Go`;
  return `${p.countryName} · ${data} · ${p.validityDays} j`;
}

export function computeProviders(products) {
  const total = products.length;
  return [...groupBy(products, (p) => p.provider)]
    .map(([name, ps]) => ({
      name,
      count: ps.length,
      share: round(ps.length / total, 4),
      avgPrice: round(mean(pricesOf(ps))),
      medianPricePerGb: round(median(pricePerGb(ps))),
      share5g: round(ps.filter((p) => p.network === '5G').length / ps.length, 4),
      shareTopUp: round(ps.filter((p) => p.topUp).length / ps.length, 4),
      unlimitedCount: ps.filter((p) => p.unlimited).length,
      destinations: new Set(ps.map((p) => p.countryCode)).size,
    }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export function computeHistogram(products, step = HISTOGRAM_STEP) {
  const top = Math.ceil(Math.max(...pricesOf(products)) / step) * step;
  const buckets = [];
  for (let from = 0; from < top; from += step) buckets.push({ from, to: from + step, count: 0 });
  for (const p of products) {
    const i = Math.min(Math.floor(p.price / step), buckets.length - 1);
    buckets[i].count++;
  }
  return buckets;
}

// Prix médian par volume de data × durée de validité.
export function computeMatrix(products) {
  const volumes = [...VOLUMES, 'unlimited'];
  return volumes.map((volume) => ({
    volume,
    cells: VALIDITIES.map((validityDays) => {
      const ps = products.filter(
        (p) =>
          p.validityDays === validityDays &&
          (volume === 'unlimited' ? p.unlimited : p.dataGb === volume),
      );
      return { validityDays, count: ps.length, medianPrice: round(median(pricesOf(ps))) };
    }),
  }));
}

export function computeDestinations(products) {
  return [...groupBy(products, (p) => p.countryCode)]
    .map(([code, ps]) => {
      const best = cheapest(ps);
      return {
        code,
        name: ps[0].countryName,
        isRegion: ps[0].isRegion,
        count: ps.length,
        providers: new Set(ps.map((p) => p.provider)).size,
        minPrice: best.price,
        cheapestOffer: `${best.provider} · ${describe(best)}`,
        medianPricePerGb: round(median(pricePerGb(ps))),
      };
    })
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'fr'));
}

// Catalogue compact pour la recherche côté navigateur :
// [fournisseur (index), code destination, data Go (null = illimité), durée, prix, 5G (0/1), rechargeable (0/1)]
export function computeCatalog(products) {
  const providers = [...new Set(products.map((p) => p.provider))].sort((a, b) => a.localeCompare(b));
  const index = new Map(providers.map((name, i) => [name, i]));
  const destinations = Object.fromEntries(products.map((p) => [p.countryCode, p.countryName]));
  const rows = products
    .map((p) => [
      index.get(p.provider),
      p.countryCode,
      p.dataGb,
      p.validityDays,
      p.price,
      p.network === '5G' ? 1 : 0,
      p.topUp ? 1 : 0,
    ])
    .sort((a, b) => a[4] - b[4]);
  return { providers, destinations, rows };
}

export function computeStats(products) {
  return {
    summary: computeSummary(products),
    providers: computeProviders(products),
    histogram: computeHistogram(products),
    matrix: computeMatrix(products),
    destinations: computeDestinations(products),
    catalog: computeCatalog(products),
  };
}
