#!/usr/bin/env node
// Lit tous les CSV de data/, valide chaque ligne, calcule les statistiques
// et écrit src/generated/stats.json, consommé par le dashboard au build.
//
// Usage : node scripts/build-stats.mjs [dossier-csv] [fichier-sortie]

import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { parseCsv } from './lib/csv.mjs';
import { missingColumns, normalizeRow } from './lib/validate.mjs';
import { computeStats } from './lib/stats.mjs';

const root = resolve(dirname(new URL(import.meta.url).pathname), '..');
const dataDir = resolve(process.argv[2] ?? join(root, 'data'));
const outFile = resolve(process.argv[3] ?? join(root, 'src/generated/stats.json'));

const MAX_REPORTED_ISSUES = 50;

async function main() {
  const files = (await readdir(dataDir)).filter((f) => f.toLowerCase().endsWith('.csv')).sort();
  if (!files.length) throw new Error(`Aucun fichier CSV dans ${dataDir}`);

  const products = [];
  const issues = [];
  const fileReports = [];
  const seenSkus = new Map();

  for (const file of files) {
    const { header, rows } = parseCsv(await readFile(join(dataDir, file), 'utf8'));
    const missing = missingColumns(header);
    if (missing.length) {
      issues.push({ file, line: 1, reason: `colonnes manquantes : ${missing.join(', ')}` });
      fileReports.push({ file, rows: rows.length, accepted: 0 });
      continue;
    }

    let accepted = 0;
    for (const row of rows) {
      const reject = (reason) => issues.push({ file, line: row.line, reason });
      if (row.cellCount !== header.length) {
        reject(`${row.cellCount} colonnes au lieu de ${header.length}`);
        continue;
      }
      const { product, errors } = normalizeRow(row.values);
      if (errors) {
        reject(errors.join(', '));
        continue;
      }
      if (seenSkus.has(product.sku)) {
        reject(`SKU ${product.sku} déjà présent dans ${seenSkus.get(product.sku)}`);
        continue;
      }
      seenSkus.set(product.sku, file);
      products.push(product);
      accepted++;
    }
    fileReports.push({ file, rows: rows.length, accepted });
  }

  if (!products.length) throw new Error('Aucun produit valide');

  const totalRows = fileReports.reduce((n, f) => n + f.rows, 0);
  const stats = {
    generatedAt: new Date().toISOString(),
    quality: {
      files: fileReports,
      totalRows,
      accepted: products.length,
      rejected: issues.filter((i) => i.line > 1).length,
      issues: issues.slice(0, MAX_REPORTED_ISSUES),
      truncatedIssues: Math.max(0, issues.length - MAX_REPORTED_ISSUES),
    },
    ...computeStats(products),
  };

  await mkdir(dirname(outFile), { recursive: true });
  await writeFile(outFile, JSON.stringify(stats));

  const s = stats.summary;
  console.log(
    [
      `${files.length} fichiers, ${totalRows} lignes, ${products.length} produits valides, ${issues.length} anomalie(s)`,
      `Prix : ${s.priceMin.price} € – ${s.priceMax.price} €, moyen ${s.avgPrice} €, > ${s.priceThreshold} € : ${s.overThreshold}`,
      `Data moyenne : ${s.avgDataGb} Go (${s.meteredCount} forfaits chiffrés, ${s.unlimitedCount} illimités exclus)`,
      `→ ${outFile}`,
    ].join('\n'),
  );
  for (const i of issues.slice(0, 10)) console.warn(`  ! ${i.file}:${i.line} ${i.reason}`);
}

main().catch((err) => {
  console.error(`Erreur : ${err.message}`);
  process.exit(1);
});
