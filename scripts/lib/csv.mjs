// Parseur CSV minimal (RFC 4180) : séparateur virgule, guillemets doubles,
// fins de ligne LF ou CRLF, BOM UTF-8 ignoré. Toutes les valeurs restent des
// chaînes : la conversion de types est faite par la validation, jamais ici
// (ainsi le code pays "NA" n'est jamais confondu avec une valeur manquante).

export function parseCsv(text) {
  const src = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
  const records = [];
  let record = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (inQuotes) {
      if (ch === '"') {
        if (src[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      record.push(field);
      field = '';
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && src[i + 1] === '\n') i++;
      record.push(field);
      records.push(record);
      record = [];
      field = '';
    } else {
      field += ch;
    }
  }
  if (field !== '' || record.length > 0) {
    record.push(field);
    records.push(record);
  }

  const nonEmpty = records.filter((r) => !(r.length === 1 && r[0].trim() === ''));
  const [header = [], ...rows] = nonEmpty;
  return {
    header: header.map((h) => h.trim()),
    rows: rows.map((cells, index) => ({
      line: index + 2,
      values: Object.fromEntries(header.map((h, i) => [h.trim(), (cells[i] ?? '').trim()])),
      cellCount: cells.length,
    })),
  };
}
