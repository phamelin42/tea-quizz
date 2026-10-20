# Produits Amazon sur le résultat (tea-quizz) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Afficher sous chaque carte de thé ou d'infusion du résultat des exemples réels vendus sur Amazon.fr (liens d'affiliation), tirés d'un catalogue validé par Phil, livré vide dans cette PR.

**Architecture:** Un module de données et de règles pures (`products.ts`) est injecté dans `QuizService` par un jeton, qui ajoute `examples` à chaque carte de thé. Un petit composant `app-examples` affiche le bloc ; `result.html` affiche la mention d'affiliation quand au moins un exemple existe.

**Tech Stack:** Angular 22 (standalone, signaux, zoneless), Vitest via `ng test`, Playwright, Fuda (`@phamelin/fuda`), Prettier.

**Spec:** `docs/superpowers/specs/2026-10-20-produits-amazon-design.md`

## Global Constraints

- Branche `claude/amazing-maxwell-it70ox` (imposée par la session) ; jamais de push sur `main`. Commits en français, à l'impératif court, un sujet par commit, terminés par les lignes `Co-Authored-By` et `Claude-Session` données par la session.
- Node ≥ 22.22.3 (`.nvmrc` : 24) : `source /opt/nvm/nvm.sh && nvm use 24` si `node -v` est 22.22.0 (le hook `.claude/hooks/session-start.sh` le fait s'il est actif). Ne jamais lancer `playwright install`.
- Tag d'affiliation `phamelin-21`, défini à un seul endroit (`AFFILIATE_TAG`). Lien : `https://www.amazon.fr/dp/<asin>?tag=phamelin-21`.
- Liens produit : `target="_blank"`, `rel="sponsored noopener noreferrer"`, texte « (nouvel onglet) » dans un `.fd-sr`.
- Aucun prix, aucune image, aucune note Amazon. Aucun ASIN ni lien deviné : le catalogue reste `[]` dans cette PR.
- Mention d'affiliation, texte exact : « En tant que Partenaire Amazon, je réalise un bénéfice sur les achats remplissant les conditions requises. » (Phil confirmera le libellé.)
- Aucun bienfait ni promesse de santé : le test existant de `profile.spec.ts` (regex `guéri|soign|détox|…|bienfait`) doit lire aussi les textes ajoutés. Règle de la caféine inchangée : les infusions n'ont pas de théine.
- Aucune valeur en dur dans les styles (tokens Fuda uniquement) ; un `.scss` de composant pèse au plus 4 Ko (`result.scss` est déjà à 3 117 octets : le style du bloc va dans un nouveau composant).
- Typographie française : espace insécable avant `: ; ? !`, apostrophe typographique (’).
- Prettier : `npx prettier --check <fichiers touchés>` avant chaque push.

## Review Focus

- Catalogue vide (état de production de cette PR) : aucune carte n'affiche de bloc, aucune mention d'affiliation, aucune erreur.
- Profil « Aucune caféine » (ou le soir sans la rechercher) : aucun produit de thé (`LeafTea`) n'est proposé, même sur la carte « Pour varier ».
- Un thé « pur » (repère `pure` affiché) ne reçoit jamais un produit `flavoured: true`.
- Une infusion dont la composition cite `Camellia sinensis` ou « thé » est signalée par `catalogueDefects` ; un thé sans feuille de théier aussi (contrôle négatif testé).
- La carte « matériel » (`gear`) n'affiche jamais d'exemple.

---

### Task 1: Module `products.ts` (types, lien, règles, jeton)

**Files:**

- Create: `src/app/tea/products.ts`
- Modify: `src/app/tea/profile.ts:41-52` (`TeaCard.tea?: TeaKey`) et `:222-236` (le helper `card()` pose `tea`)
- Test: `src/app/tea/products.spec.ts`

**Interfaces:**

- Consumes: `TeaCard`, `Profile`, `labelHints` (`./profile`), `TeaKey`, `LeafTea`, `HerbalTea` (`./content`).
- Produces (tâches 2 et 3 s'appuient dessus) :
  - `TeaCard` gagne `readonly tea?: TeaKey` (absent sur la carte `gear`)
  - `export const AFFILIATE_TAG = 'phamelin-21'`
  - `export const AFFILIATE_NOTICE: string` (texte exact des contraintes) et `export const EXAMPLES_NOTE: string` = « Exemples dont la composition correspond au type évoqué, présentés sans classement. »
  - `export interface Product { id; name; brand; tea: TeaKey; asin; ingredients: readonly string[]; flavoured: boolean; sourceUrl; validated }` (tous `readonly`, `validated` au format `AAAA-MM-JJ`)
  - `export const CATALOGUE: readonly Product[] = []`
  - `export const PRODUCT_CATALOGUE: InjectionToken<readonly Product[]>` (`providedIn: 'root'`, `factory: () => CATALOGUE`)
  - `export function amazonUrl(asin: string): string`
  - `export function catalogueDefects(catalogue: readonly Product[]): string[]`
  - `export function examplesFor(card: TeaCard, profile: Profile, catalogue: readonly Product[]): Product[]` (au plus 3)
  - `export function mentionsBrand(text: string, catalogue: readonly Product[]): boolean`

- [ ] **Step 1: Écrire `products.spec.ts` (échec attendu)**

Une `fixture()` avec un produit valide par `TeaKey` (12 clés, ASIN de test `B0TESTTEA01`…, marque `Maison Exemple`), `flavoured: false`, ingrédients cohérents (`['Thé vert sencha']` pour un `LeafTea`, `['Rooibos']` pour une infusion). Tests, par nom :
`amazonUrl` renvoie `https://www.amazon.fr/dp/B0TESTTEA01?tag=phamelin-21` · `CATALOGUE` est vide dans cette PR (retiré en tâche catalogue) · `catalogueDefects` renvoie `[]` pour la fixture · `catalogueDefects` signale séparément : ASIN en minuscules ; ASIN à 11 caractères ; `sourceUrl` en `http://` ; date `20/10/2026` ; `id` en double ; `tea` inconnu ; `ingredients` vide ; infusion (`HerbalTea`) dont un ingrédient correspond à `/camellia|\bth[ée]\b|\btea\b/i` ; thé (`LeafTea`) dont aucun ingrédient ne correspond à `/camellia|th[ée]|\btea\b|matcha|pu-?erh/i` · `examplesFor` : ne renvoie que les produits dont `tea` est celui de `card.tea` ; `[]` pour une carte sans `tea` (le matériel) ; avec `profile.caffeine === 'none'`, exclut tout produit d'un `LeafTea` ; exclut `flavoured: true` quand `labelHints(profile)` contient la clé `pure` ; garde `flavoured: true` sinon ; cap de 3 ; ordre du catalogue conservé ; `[]` avec un catalogue vide · `mentionsBrand('… Maison Exemple …', fixture)` vaut `true`, `mentionsBrand('Un thé vert', fixture)` vaut `false`, insensible à la casse.
Obtenir `Profile` et cartes par `analyse` et `teas` à partir d'un `answers()` local (copier l'aide du haut de `profile.spec.ts`).

- [ ] **Step 2: Constater l'échec**

Run: `npx ng test --no-watch --include='src/app/tea/products.spec.ts'` — Expected: FAIL (module `./products` introuvable).

- [ ] **Step 3: Implémenter**

`teas()` : le helper `card()` ajoute `tea`. `products.ts` suit les signatures ci-dessus ; `examplesFor` applique, dans l'ordre : `card.tea` défini et égal à `product.tea` ; `profile.caffeine === 'none'` → exclut les produits dont `tea` est un `LeafTea` (réutiliser `TEAS[tea].caffeine`) ; repère `pure` affiché → exclut `flavoured` ; `.slice(0, 3)`. Commentaire sur le pourquoi : le filtre applique les règles de profil, `catalogueDefects` celles qui ne dépendent pas du profil.

- [ ] **Step 4: Relancer** — même commande. Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/tea/products.ts src/app/tea/products.spec.ts src/app/tea/profile.ts
git commit -m "Ajoute le catalogue de produits et ses règles"
```

---

### Task 2: Exemples dans `QuizService` et garde-fous sur toutes les réponses

**Files:**

- Modify: `src/app/tea/quiz.service.ts:2,37-47`
- Modify: `src/app/tea/quiz.service.spec.ts`
- Modify: `src/app/tea/profile.spec.ts` (nouveau test dans `describe('contenu')` ou un `describe('exemples de produits')`)

**Interfaces:**

- Consumes: `PRODUCT_CATALOGUE`, `examplesFor`, `catalogueDefects`, `mentionsBrand`, `Product` (tâche 1).
- Produces: `QuizService.result()` renvoie `teas: (TeaCard & { examples: Product[] })[]`.

- [ ] **Step 1: Écrire les tests (échec attendu)**

`quiz.service.spec.ts` : catalogue par défaut → chaque carte a `examples: []` ; avec `{ provide: PRODUCT_CATALOGUE, useValue: fixture }`, la carte `main` a au moins un exemple dont `tea` est `profile.tea`, et la carte `gear` aucun. Reprendre la manière dont le fichier atteint l'écran `result`.
`profile.spec.ts` : (a) test « n'affiche que des exemples cohérents avec le profil, pour toutes les réponses » : parcourir `everyAnswers()`, traiter chaque profil distinct une fois (`JSON.stringify(profile)` dans un `Set`), appeler `examplesFor` pour chaque carte de `teas(profile)` avec la fixture. Contrôles réécrits indépendamment du filtre : exemple d'une infusion → pas de `Camellia`/`thé` dans ses ingrédients ; profil sans caféine → aucun exemple de `LeafTea` ; repère `pure` → `flavoured === false` ; carte `gear` → aucun exemple. Un seul `expect(defects).toEqual([])`. Contrôle négatif : un thé vert fixture avec `flavoured: true` n'est pas proposé à un profil `pure`. (b) test « les marques ne vivent que dans products.ts » : sur `everyText` du test existant (le même tableau, ne pas dupliquer l'énumération : le sortir dans une aide partagée), `mentionsBrand(text, [...CATALOGUE, ...fixture])` est faux pour chaque texte. (c) `expect(catalogueDefects(CATALOGUE)).toEqual([])`.

- [ ] **Step 2: Constater l'échec**

Run: `npx ng test --no-watch --include='src/app/tea/*.spec.ts'` — Expected: FAIL.

- [ ] **Step 3: Brancher le service**

`private readonly catalogue = inject(PRODUCT_CATALOGUE)` dans `QuizService`, et `teas: teas(profile).map((card) => ({ ...card, examples: examplesFor(card, profile, this.catalogue) }))`. Importer `inject`.

- [ ] **Step 4: Relancer** — Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/tea/quiz.service.ts src/app/tea/quiz.service.spec.ts src/app/tea/profile.spec.ts
git commit -m "Associe des exemples de produits aux cartes de thé"
```

---

### Task 3: Composant `app-examples` et mention d'affiliation

**Files:**

- Create: `src/app/examples/examples.ts`, `examples.html`, `examples.scss`, `examples.spec.ts`
- Modify: `src/app/result/result.ts`, `src/app/result/result.html`
- Test: `src/app/result/result.spec.ts` (nouveau)

**Interfaces:**

- Consumes: `Product`, `amazonUrl`, `AFFILIATE_NOTICE`, `EXAMPLES_NOTE` (tâches 1-2).
- Produces: `Examples` (`selector: 'app-examples'`, `products = input.required<readonly Product[]>()`, hôte `display: block`) ; `Result.view()` gagne `affiliate: boolean` (vrai si une carte a au moins un exemple), `notice` et `note`.

- [ ] **Step 1: Écrire les tests (échec attendu)**

`examples.spec.ts` : avec 2 produits, 2 `<a>` dont `href` = `amazonUrl(asin)`, `target="_blank"`, `rel` contenant `sponsored`, `noopener` et `noreferrer` ; chaque lien contient un `.fd-sr` « (nouvel onglet) » ; nom et marque affichés ; la composition est la liste complète des `ingredients`, séparés par des virgules ; aucun `<img>` ni prix.
`result.spec.ts` : (a) catalogue par défaut, résultat atteint : aucun `app-examples` et aucun texte « Partenaire Amazon » ; (b) catalogue fixture donnant un exemple : `app-examples` présent dans la carte du thé, la mention et la note visibles une seule fois, l'encart « Ceci n’est pas un avis médical » toujours là.

- [ ] **Step 2: Constater l'échec**

Run: `npx ng test --no-watch --include='src/app/{examples,result}/*.spec.ts'` — Expected: FAIL.

- [ ] **Step 3: Implémenter**

`Examples` suit le patron des autres composants (`templateUrl`, `styleUrl`, `ViewEncapsulation.None`, classe `app-examples`). Gabarit : `<p class="app-label">Exemples sur Amazon</p>` puis une `<ul>` ; par produit, un `<a>` avec les attributs ci-dessus, la marque, la ligne « Composition : … ». Style avec tokens (comme `result.scss`), cible de lien d'au moins 44 px, soulignement conservé. Dans `result.html`, après `.app-labels` de chaque carte de thé : `@if (tea.examples.length > 0) { <app-examples [products]="tea.examples" /> }` (un seul nœud racine : pas de NG8011). Sous la grille, `@if (v.affiliate) { <p class="app-note">{{ v.notice }} {{ v.note }}</p> }`. Importer `Examples` dans `Result.imports`.

- [ ] **Step 4: Relancer** — Expected: PASS ; `npx ng build` sans avertissement de budget.

- [ ] **Step 5: Commit**

```bash
git add src/app/examples src/app/result
git commit -m "Affiche les exemples de produits et la mention d'affiliation"
```

---

### Task 4: Réécrire la règle « sans marque »

**Files:**

- Modify: `CLAUDE.md:10`, `README.md:3`, `src/index.html:10`, `src/app/app.html:25-26`, `src/app/result/result.html:86-89`
- Test: `src/app/app.spec.ts` ou `e2e/accueil.spec.ts` si l'un lit l'ancien texte

**Interfaces:** aucune.

- [ ] **Step 1:** `grep -rn "marque" CLAUDE.md README.md src e2e` ; retenir les occurrences « sans marque » / « aucune marque » (ignorer `app-brand`). Inverser tout test qui lit l'ancien texte.
- [ ] **Step 2: Réécrire** :
  - `CLAUDE.md` : « aucune marque » devient « une marque n'est citée que dans `src/app/tea/products.ts` : composition lue chez le fabricant, lien Amazon validé par Phil, aucun prix, aucun classement, aucun bienfait » ; ajouter `products.ts` et `examples/` à « Structure », et les liens d'affiliation (`phamelin-21`) à « Le projet ». Le fichier `.claude/CLAUDE.commun.md` ne se modifie pas (copie de `claude-context`) ; le dire dans la PR, car la § 15 y interdit « aucune marque recommandée » pour la santé.
  - `README.md` et `src/index.html` : retirer « , sans marque ».
  - `app.html` : « Aucune marque n’est recommandée. » devient « Les produits cités sont des exemples dont la composition correspond, pas des recommandations. »
  - `result.html` : « Des types de thés et d’infusions, sans marque. Comparez… » devient « Des types de thés et d’infusions. Comparez les listes d’ingrédients de ceux que vous trouvez en magasin. »
- [ ] **Step 3:** `npx prettier --check CLAUDE.md README.md src/index.html src/app/app.html src/app/result/result.html` ; Expected: « All matched files use Prettier code style! ».
- [ ] **Step 4: Commit**

```bash
git add CLAUDE.md README.md src/index.html src/app/app.html src/app/result/result.html
git commit -m "Remplace la règle « sans marque » par le catalogue validé"
```

---

### Task 5: Quality gates, push, PR

**Files:** aucun.

- [ ] **Step 1:** `npm ci` si `node_modules` manque (attendre la fin).
- [ ] **Step 2:** lire `.github/workflows/*.yml` et lancer toutes les étapes qu'il liste : `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, `npm run e2e` (Chromium de `/opt/pw-browsers`), `npm run format:check`. Expected: tout vert, y compris le 320 px et axe Jour/Nuit existants.
- [ ] **Step 3:** `git status` : aucun fichier non listé.
- [ ] **Step 4:** pousser, vérifier qu'aucune PR n'existe déjà pour la branche, ouvrir la PR vers `main` (gabarit du dépôt s'il existe) : ce qui change, critères cochés honnêtement, poids du bundle avant/après, « catalogue vide, rien de visible en production », e2e axe avec produits repoussé à la PR « Catalogue », point à relire : écart avec `CLAUDE.commun.md` § 15, restes à Phil. Puis `subscribe_pr_activity`.

## Vérification de la PR « Catalogue » (suite, hors de ce plan)

Tableau (produit, composition, source, lien) remis à Phil ; ajout des seuls produits validés dans `CATALOGUE` ; retirer `expect(CATALOGUE).toEqual([])` ; e2e axe Jour/Nuit et 320 px sur un résultat qui affiche des produits.
