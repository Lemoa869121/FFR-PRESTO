# Source : dossier de fabrication « FFR Presto »

| Champ | Valeur |
|---|---|
| Fichier | `FFR_Dossier_de_fabrication-FFR_PRESTO.pdf` (175 pages A4) |
| SHA-256 | `7a1746a15d1a2c5ea5930e13fc70f46c130a2d7c2849baad46c16c59e0a336e4` |
| Producteur | forsterpro — combit List & Label 28.2 |
| Affaire | FFR Presto |
| Édité le | 11/11/2026 à 14:25, par Antoine DUVEY |
| Fourni le | 11/11/2026 |
| Statut | Quantités confirmées fiables par le demandeur (malgré l'avertissement forsterpro « recalculer la nomenclature ») |

**Ne jamais modifier ce PDF.** Toute nouvelle version doit être ajoutée à côté, avec sa propre empreinte.

## Extraction texte (`pages/`)

`pages/pNNN.txt` est l'extraction brute de la page PDF NNN, produite par :

```bash
for p in $(seq 1 175); do
  pdftotext -f $p -l $p -layout FFR_Dossier_de_fabrication-FFR_PRESTO.pdf pages/p$(printf %03d $p).txt
done
```

(poppler `pdftotext` 24.02.) Les numéros de ligne cités dans la traçabilité sont ceux de ces fichiers, 1 = première ligne.

## Structure

| Partie | Pages PDF | Pages imprimées |
|---|---|---|
| Bon d'atelier (32 positions) | 1 à 142 | 1 à 142 |
| Débit optimisé | 143 à 175 | 1 à 33 (= page PDF − 142) |

Données structurées générées par `npm run extract:ffr` → `src/data/sources/ffr-presto/`.
