# Format des imports

## Principes

1. Le fichier d’origine n’est **jamais modifié**. L’application lit une copie en mémoire ; les fichiers sources versionnés restent tels quels dans `data/sources/`.
2. Chaque donnée importée garde sa source : fichier, feuille ou page, ligne et, si possible, cellule.
3. Les données importées sont séparées des règles de calcul.

## Écran « Import des données » (V1)

Formats acceptés pour l’aperçu : `.xlsx`, `.xlsm`, `.xls`, `.xlsb`, `.ods`, `.csv`.

Fonctions disponibles :

- sélection du fichier, puis affichage de son nom, de son extension et de sa taille ;
- liste des feuilles avec leur nombre de lignes ;
- aperçu des 20 premières lignes ;
- choix de la ligne d’en-tête ;
- préparation d’une correspondance colonne → champ (`ImportMapping`), exportable en JSON.

**Aucune donnée n’est intégrée au moteur de calcul depuis cet écran**, et un message le rappelle à l’utilisateur.

### Champs cibles prévus

| Type de fichier | Champs |
|---|---|
| Prix | Référence, Désignation, Prix unitaire (€), Unité de prix, Date de validité |
| Références | Référence, Désignation, Catégorie, Unité, Longueur de barre (mm) |
| Liste de débit | Référence, Désignation, Quantité, Longueur (mm), Coupe, Orientation |
| CSV générique | Référence, Désignation, Quantité, Prix unitaire (€) |

## Procédure pour un nouveau fichier métier

1. Déposer le fichier tel quel dans `data/sources/<identifiant>/`.
2. Analyser sa structure : sections, colonnes, unités, règles explicites, ambiguïtés.
3. Écrire ou adapter le parseur dans `src/imports/`, avec des tests sur le fichier réel.
4. Générer le JSON importé, avec la source de chaque ligne, dans `src/data/sources/<identifiant>/`.
5. Documenter les règles dans `docs/calculation-rules.md`.
