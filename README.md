# Dashboard catalogue eSIM — MyBestSim

Lit les fichiers CSV des fournisseurs eSIM, calcule les statistiques clés du
catalogue et les affiche dans un dashboard web.

## Fonctionnement

```
data/*.csv ──► scripts/build-stats.mjs ──► stats.json ──► dashboard React
```

1. **Lecture** : le script parcourt tous les CSV du dossier `data/` (un fichier par fournisseur).
2. **Validation** : chaque ligne est contrôlée (colonnes, prix, devise, data, durée, SKU unique).
   Une ligne invalide est écartée et signalée dans la section « Qualité des données ».
3. **Calcul** : les statistiques sont calculées une seule fois et écrites dans un fichier JSON.
4. **Affichage** : l'application React lit ce JSON et présente les résultats.

Pour mettre à jour le dashboard, il suffit de remplacer les CSV dans `data/` et de relancer le build.

## Statistiques affichées

- nombre total de cartes eSIM ;
- nombre de produits à plus de 100 € ;
- fourchette de prix (min / max) ;
- moyenne de data par carte ;
- prix moyen global ;
- répartition par fournisseur ;
- en plus : prix médian au Go, distribution des prix, prix selon le volume et la durée,
  destinations les plus couvertes, recherche d'offres filtrable.

## Choix de traitement

- Les forfaits **illimités** n'ont pas de volume de data : ils sont exclus de la moyenne de data.
- Le code pays **`NA`** désigne l'Amérique du Nord, pas une valeur manquante.
- « Plus de 100 € » signifie **strictement** supérieur à 100 €.

## Lancer en local

```bash
npm install
npm run dev
```

## Article SEO

La page `/article` (fichier `public/article.html`) présente l'article de la partie 2,
« Internet en croisière : quelle eSIM choisir ? ». Elle est exclue de l'indexation Google
(`noindex`) pour éviter tout contenu dupliqué si l'article est publié sur mybestsim.com.
