# Produits Amazon sur le résultat (tea-quizz)

## Objectif

Proposer, sous chaque thé ou infusion du résultat, de vrais produits achetables sur Amazon.fr dont la composition correspond au type évoqué par le profil. Les liens sont des liens d'affiliation Partenaires Amazon (tag `phamelin-21`).

## Décisions

- Décision de Phil (20/10/2026) : cette fonctionnalité **remplace** la règle « aucune marque » de `CLAUDE.md`. Des exemples nommés sont permis, à condition de figurer dans le catalogue validé.
- Les fiches Amazon.fr ne sont pas lisibles depuis l'environnement de l'agent (défi anti-robot). L'agent propose des produits à partir de la composition publiée par le fabricant ; **Phil ouvre chaque lien Amazon et valide** avant son intégration. Aucun lien ni ASIN n'est deviné.
- Aucun prix, aucune image, aucune note : Amazon interdit de les copier hors de son API.
- Pas d'API Amazon (PA-API), pas de serveur, pas de clé : le catalogue est un fichier du dépôt.

## Données

`src/app/tea/products.ts` (types et règles ; les données sont dans `src/app/tea/catalogue.ts`) :

```ts
export interface Product {
  readonly id: string;
  readonly name: string;
  readonly brand: string;
  /** Type de thé ou d’infusion illustré. */
  readonly tea: TeaKey;
  readonly asin: string;
  /** Composition recopiée de la fiche du fabricant. */
  readonly ingredients: readonly string[];
  /** Vrai dès qu’une saveur est ajoutée au thé ou à la plante (arôme, épice, fruit, fleur, morceaux). */
  readonly flavoured: boolean;
  readonly sourceUrl: string;
  /** Date de validation du lien par Phil (AAAA-MM-JJ). */
  readonly validated: string;
}
```

- `AFFILIATE_TAG = 'phamelin-21'` est défini à un seul endroit ; le lien est `https://www.amazon.fr/dp/<asin>?tag=<tag>`.
- Un produit n'entre dans le fichier qu'après validation par Phil. Le catalogue est livré **vide** dans la première PR.

## Affichage (`result.html`)

- Une carte porte la clé `tea` du thé qu'elle illustre ; sous chaque carte de thé : un bloc « Exemples sur Amazon » avec nom, marque, une ligne de composition et un lien.
- Liens `target="_blank"` `rel="sponsored noopener noreferrer"`, annoncés « (nouvel onglet) ».
- Carte sans produit validé : aucun bloc, ni vide ni factice.
- Dès qu'au moins un lien est affiché : mention visible « En tant que Partenaire Amazon, je réalise un bénéfice sur les achats remplissant les conditions requises. » et précision que ce sont des exemples dont la composition correspond, pas un classement.
- Le texte « Des types de thés et d'infusions, sans marque » de `result.html`, la meta description de `index.html` et la ligne du pied de page de `app.html` sont réécrits.
- L'encart « Ceci n'est pas un avis médical » (caféine, grossesse, interactions, fer) reste.

## Garde-fous (`profile.spec.ts`, toutes les combinaisons de réponses)

- Un produit rattaché à une infusion (`HerbalTea`) ne contient pas `Camellia sinensis` et n'a pas de caféine ; un produit rattaché à un thé (`LeafTea`) en contient.
- Règle de la caféine : « Aucune », ou le soir sans la rechercher, n'affiche que des produits d'infusions.
- `flavoured` veut dire « avec de la saveur » (décision de Phil du 20/10/2026) : vrai dès qu'une saveur est ajoutée au thé ou à la plante (arôme, épice, fruit, fleur, morceaux), pas seulement un arôme. Un thé `flavoured: false` n'a qu'un ingrédient, le thé lui-même (« bio », `*` et qualificatif entre parenthèses tolérés) ; aucun produit `flavoured: false` n'annonce d'arôme ni, pour un thé, d'épice, de fruit ou de fleur. Un chai est toujours `flavoured: true` : sans épices, ce n'est pas un chai.
- Un thé « pur » (étiquette `pure`) n'a pas `flavoured: true`, sauf le chai, aromatisé par nature : sans cette exception, la carte « pur » n'afficherait jamais de chai.
- Un nouveau contrôle de `profile.spec.ts` relit les textes de `content.ts` et de `profile.ts` : aucune marque du catalogue n'y apparaît, les marques ne vivent que dans `products.ts`.
- Les mots interdits (« bienfaits », « détox »…) restent interdits dans tous les textes, produits compris.
- L'ASIN respecte `^[A-Z0-9]{10}$` ; chaque produit a une source en `https://` et une date ; les `id` sont uniques ; le tag d'affiliation apparaît une fois par lien, seul `amazon.fr` est un hôte de lien produit.

## Règles réécrites

`CLAUDE.md` (« Le projet »), `index.html`, `app.html`, `result.html`, `README.md` s'il mentionne « sans marque ».

## Livraison

1. PR « Structure » : types, affichage, mention, tests, règles. Catalogue vide, donc rien de visible en production.
2. PR « Catalogue » : tableau (produit, composition, source, lien à contrôler) remis à Phil ; seuls les produits validés sont ajoutés.

Catalogue initial : 15 produits (`src/app/tea/catalogue.ts`), proposés le 2026-10-21, à valider par Phil lien par lien avant publication (PR en brouillon). Au plus deux produits par type, de marques différentes ; un type sans produit fiable n'affiche rien.

Quality gates avant chaque PR : `lint`, `typecheck`, `test`, `build`, `e2e` (axe Jour/Nuit, 320 px, état avec produits), `format:check`.

## Hors périmètre

PA-API, prix et images Amazon, mesure Umami des clics (le site n'est pas encore enregistré), modification de Fuda, matériel (`GEARS`) : il reste sans produit dans cette étape.

## À la charge de Phil

- Contrôler chaque lien Amazon du tableau.
- Déclarer le site dans le compte Partenaires Amazon.
- Confirmer le libellé de la mention légale.
