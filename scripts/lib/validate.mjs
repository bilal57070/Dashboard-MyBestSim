// Validation et normalisation d'une ligne CSV en produit typé.
// Une ligne invalide est rejetée avec un motif lisible, jamais corrigée en silence.

export const REQUIRED_COLUMNS = [
  'sku',
  'provider',
  'product_name',
  'country_code',
  'country_name',
  'data_gb',
  'data_display',
  'validity_days',
  'price',
  'currency',
  'network',
  'top_up',
];

export const EXPECTED_CURRENCY = 'EUR';

// Codes de zones multi-pays présents dans les fichiers. "NA" = Amérique du Nord.
export const REGION_CODES = new Set(['WW', 'EU', 'AS', 'NA']);

const NUMBER = /^\d+(\.\d+)?$/;

export function missingColumns(header) {
  return REQUIRED_COLUMNS.filter((c) => !header.includes(c));
}

export function normalizeRow(values) {
  const errors = [];
  for (const col of ['sku', 'provider', 'country_code', 'price', 'currency', 'validity_days']) {
    if (!values[col]) errors.push(`${col} vide`);
  }

  const price = NUMBER.test(values.price) ? Number(values.price) : NaN;
  if (values.price && Number.isNaN(price)) errors.push(`prix invalide « ${values.price} »`);
  if (values.currency && values.currency !== EXPECTED_CURRENCY) {
    errors.push(`devise ${values.currency} (attendu ${EXPECTED_CURRENCY})`);
  }

  const validity = NUMBER.test(values.validity_days) ? Number(values.validity_days) : NaN;
  if (values.validity_days && Number.isNaN(validity)) {
    errors.push(`durée invalide « ${values.validity_days} »`);
  }

  // data_gb vide = forfait illimité, à condition que l'affichage le confirme.
  const unlimited = values.data_gb === '' && /illimit/i.test(values.data_display);
  let dataGb = null;
  if (!unlimited) {
    if (NUMBER.test(values.data_gb)) dataGb = Number(values.data_gb);
    else errors.push(`data invalide « ${values.data_gb || values.data_display} »`);
  }

  if (errors.length) return { errors };

  return {
    product: {
      sku: values.sku,
      provider: values.provider,
      countryCode: values.country_code,
      countryName: values.country_name,
      isRegion: REGION_CODES.has(values.country_code),
      dataGb,
      unlimited,
      validityDays: validity,
      price,
      network: values.network,
      topUp: values.top_up.toLowerCase() === 'oui',
    },
  };
}
