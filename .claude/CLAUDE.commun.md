# Contexte commun à tous les projets de Phil

> Ce fichier est partagé par tous les dépôts `phamelin42/*` (source : dépôt `claude-context`). Il
> réunit les règles que chaque projet a précisées un jour, pour qu'aucun ne les oublie. Le
> `CLAUDE.md` du projet décrit ce qui lui est propre et **l'emporte en cas de désaccord**. Les
> sections marquées _(si …)_ ne s'appliquent qu'aux projets concernés. Ne pas modifier ce fichier
> dans un projet : on le change dans `claude-context`, puis on le recopie partout.

## 1. Qui, quoi, où

- **Phil** (Philippe Hamelin, compte GitHub `phamelin42`), développeur Front-End Senior Angular, qui
  décide ; l'agent propose, exécute, vérifie et rend compte. Une décision écrite de Phil (dans un
  `CLAUDE.md`, un `PLAN.md`, une fiche, « Décisions validées ») ne se remet pas en cause : on
  l'applique, et si elle semble mauvaise on le dit dans la PR.
- Sites publics sous `*.phamelin.fr`. DNS (OVH) et projets Vercel sont déclarés dans le dépôt
  `infra` (`projects.json`) : un nouveau site s'y ajoute par une ligne, jamais à la main chez OVH ou
  Vercel. Les identifiants de projet, de domaine et de dépôt vivent là, pas dans le site.

| Dépôt                         | Rôle                                                                   |
| ----------------------------- | ---------------------------------------------------------------------- |
| `design-system-fuda`          | Fuda, design system Angular inspiré du hanafuda (Storybook)            |
| `site-template`               | Modèle de départ de tout nouveau site (Angular 22 + Fuda)              |
| `flag-quizz`, `capital-quizz` | Quiz de drapeaux et de capitales (même pile, mêmes règles de jeu)      |
| `tea-quizz`, `skincare-quizz` | Quiz éducatifs, jeu encore à définir avec Phil                         |
| `lois-votes`                  | « Qui a voté quoi ? » : SSR Angular + BFF Express, données officielles |
| `job-finder`                  | Moteur d'offres d'emploi avec alertes, produit encore à définir        |
| `portfolio`                   | Portfolio one-page (pré-rendu, FR/EN, Netlify)                         |
| `crochet-helper`              | Pattern Reader / Fil, lecteur de patrons (sans back-end, pilote auto)  |
| `phil-mp`                     | Micro-produits : un template, N produits (Ionic, SEO)                  |
| `petit-bac`                   | Mono-repo Petit Bac (Socket.IO, Material) et Carnet de voyage (NestJS) |
| `infra`                       | DNS OVH et projets Vercel, pilotés par `projects.json`                 |

Les projets se ressemblent volontairement : en cas de doute sur une façon de faire, regarder
comment le projet jumeau l'a résolue (flag-quizz ↔ capital-quizz, site-template → tout nouveau
site, crochet-helper ↔ phil-mp, lois-votes pour un serveur) plutôt que d'inventer.

## 2. Langue et rédaction

- **Français** pour l'interface, la documentation, les commentaires, les messages de commit, les
  PR et les rapports. Les identifiants de code restent en anglais. Exceptions écrites dans le projet
  (Storybook de Fuda en anglais, sites multilingues) : elles l'emportent.
- Un commentaire explique **pourquoi**, jamais **quoi**. Densité de commentaires et nommage du
  code environnant.
- **Typographie française** : espace insécable avant `: ; ? !` et à l'intérieur des « » ;
  apostrophe typographique (’) dans les textes visibles ; article devant un nom quand la langue le
  demande. Un texte relu est un texte sans faute.
- Pas de pronom genré deviné pour une personne : on la nomme.

## 3. Façon de travailler

### Avant de coder

- Lire le `CLAUDE.md` du projet, puis seulement les fichiers utiles (voir § 17).
- **Créer un projet** : toujours avec le skill `nouveau-projet` (dépôt `claude-context`), qui
  part de `site-template`, installe ce contexte et suit les étapes dans l'ordre.
- **Un projet « pas encore défini »** (règles d'un jeu, sources d'un moteur, produit) : proposer
  d'abord à Phil un plan par étapes et les choix à trancher (comme `lois-votes/docs/PLAN.md`), et
  ne coder qu'après validation.
- **Une décision qui n'est écrite nulle part** : ne rien inventer, ne pas choisir « une valeur
  raisonnable en attendant ». Poser la question (options, ce qui est bloqué), puis avancer sur ce
  qui ne dépend pas d'elle.
- Ce qui change l'architecture (un serveur, un appel réseau, une clé d'API, une dépendance
  d'exécution, un SDK tiers) se discute avant, et s'écrit dans un ADR (`docs/adr-NNN-*.md`).
- Si une icône, une variante ou un composant manque dans une bibliothèque partagée (Fuda,
  `libs/`, `shared/ui`), on l'ajoute **là**, pas dans le projet consommateur.

### Git et PR

- **Chaque dépôt a une branche `main`**, branche par défaut sur GitHub, créée dès le premier
  commit (un dépôt vide reçoit d'abord un commit initial sur `main`, puis la branche de travail).
  Un dépôt encore sur `master` ou sans `main` : créer `main` à l'identique, repointer les
  workflows (`branches: [main]`) et la documentation dans une PR, et demander à Phil d'en faire la
  branche par défaut.
- `main` est protégée : **jamais de push direct sur `main`** (un push y déclenche souvent le
  déploiement). Une branche par intention, au nom parlant (`ajout-questions`, `fix-focus`,
  `<slug>/NN-titre`), pas un `claude/<nom>` généré, **sauf si la session impose sa branche** : on
  utilise alors celle-là.
- Commits découpés par intention, un sujet par commit, message **en français à l'impératif court**
  (« Ajoute… », « Corrige… »), première ligne ≤ 72 caractères, préfixée du produit dans un
  mono-repo (`devis-artisan : ajoute l'export PDF`). Le corps dit le pourquoi.
- **Toute modification de code finit par une PR vers `main`**, ouverte sans attendre qu'on la
  demande, après avoir vérifié qu'il n'en existe pas déjà une ouverte pour la branche. Une PR
  fusionnée ne suit plus sa branche : le travail suivant repart de `main` et ouvre une nouvelle PR.
- Une branche en retard se met à jour par **fusion** de `main` (pas de rebase ni de force-push sur
  une branche partagée). Lockfiles et fichiers générés se régénèrent par l'outil, jamais à la main.
- **Une PR ouverte se suit jusqu'à sa fusion, et c'est l'agent qui fusionne** (décision de Phil du
  20/10/2026, pour tous les dépôts) :
  1. s'abonner à son activité (`subscribe_pr_activity`) dès l'ouverture : CI, avis, commentaires ;
  2. CI rouge : lire le journal, trouver la cause racine, corriger, relancer les quality gates en
     local, pousser ; recommencer jusqu'au vert. Un avis ou un commentaire de relecture se traite
     de même (correction poussée, ou réponse qui dit pourquoi non) ;
  3. CI verte sur le dernier commit, aucun conflit, aucune demande de modification ni question en
     attente : **fusionner soi-même** (méthode habituelle du dépôt, commit de fusion par défaut),
     même si la fusion déclenche un déploiement, puis se désabonner ;
  4. **vérifier ce que la fusion a lancé** sur `main` (CI, déploiements) : attendre leur fin, lire
     le journal de tout échec et dire à Phil la cause et quoi faire (un échec côté serveur, comme
     un réseau Docker disparu du VPS, ne se corrige pas depuis le dépôt) ; un échec dû au code se
     corrige par une nouvelle PR ;
  5. jamais de fusion sur une CI rouge, en attente ou sautée par erreur (un job sauté parce qu'un
     autre a échoué n'est pas vert). Ce qui reste à Phil après la fusion va dans le rapport.
- Une PR ne mélange pas un produit et une bibliothèque partagée ; ne reformate pas en masse des
  fichiers que la tâche ne touche pas.
- **Dépôts publics** : aucun secret, aucune clé d'API, aucune donnée personnelle dans le code, les
  tests, les fixtures ou les messages de commit.

### Contenu d'une PR

Ce qui change (3 à 5 lignes) · critères d'acceptation cochés honnêtement · poids du bundle avant
et après si le code applicatif change · ce qui reste et pourquoi · points à relire en priorité (là
où on a hésité) · ce qui a coûté des échanges (nombre approximatif, commandes ratées, information
manquante). Un avertissement de budget se justifie dans la PR.

## 4. Définition de « terminé »

- Une tâche est terminée quand **`lint`, `typecheck`, `test` et `build` sont verts**, plus `e2e`
  si l'interface, le clavier, le focus ou l'apparence changent. Si le projet a `verify` / `verify:ci`,
  c'est elle qui fait foi (`verify:ci` = ce que lance la CI : `verify` seul ne prédit pas la CI).
- **Avant d'ouvrir ou de mettre à jour une PR, lancer soi-même toutes les quality gates** : toutes
  les étapes de `.github/workflows/*.yml` (les lire, ne pas les deviner : lint, typecheck, tests,
  build, `format:check`, e2e, axe, Lighthouse, contrôles de `tools/`…), et **corriger jusqu'à ce
  qu'elles passent toutes**, même pour une PR de configuration ou de documentation. On n'ouvre
  jamais une PR en comptant sur la CI pour trouver les erreurs. Seule exception : une étape
  impossible à lancer dans le conteneur (secret, service externe) ; la PR le dit, avec la raison.
- **Ne rien déclarer vert sans l'avoir lancé et lu la sortie.** Une vérification annoncée « dans
  `main` » se prouve (`git merge-base --is-ancestor <sha> origin/main`), on ne la suppose pas.
- **Jamais de garde-fou désactivé pour passer** : pas de règle de lint coupée, pas de test en
  `skip`, pas de contrôle de build contourné, pas de `--no-verify` sans raison écrite. On corrige
  la cause.
- **Un garde-fou non branché ne garde rien** : tout test ou contrôle créé contre une régression
  (axe, reflow, budget, contraste…) tourne dans la CI ou dans `verify`.
- Avant tout push, même de Markdown seul, même par l'API GitHub :
  `npx prettier --check <fichiers touchés>`. La CI lance `format:check` sur tout le dépôt.
- Terminer toutes les écritures de fichiers **avant** la vérification finale : un fichier écrit
  après n'est vu ni par Prettier ni par ESLint.
- Pour un changement voulu d'apparence : régénérer les captures de référence, puis **relire les
  images modifiées** avant de les versionner.

## 5. Session cloud (claude.ai/code) et environnement

- L'image fournit Node 22.22.0, **refusé par Angular 22** (minimum 22.22.3 ou 24.15). Un hook
  `SessionStart` (`.claude/hooks/session-start.sh`) installe le Node de `.nvmrc` (nvm de
  `/opt/nvm`, sinon archive de nodejs.org), lance l'installation npm et exporte `PW_CHROMIUM`. Si
  `node -v` n'est pas le bon, c'est le hook qu'on corrige. Sans hook :
  `source /opt/nvm/nvm.sh && nvm use 24`.
- **Ne jamais lancer `playwright install`** : un Chromium est préinstallé dans `/opt/pw-browsers`.
  Désigner celui-là (`PW_CHROMIUM=/opt/pw-browsers/chromium` ou
  `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=…`, selon ce que lit `playwright.config.ts`).
- **Captures de référence** : uniquement avec le Chromium que la CI utilise (celui qu'épingle
  `@playwright/test` : `npx playwright --version`, puis `npx playwright install --dry-run chromium`).
  Un autre Chromium rend le texte autrement : ne pas commiter ses captures. Le rendu du texte est
  épinglé par `--font-render-hinting=none`.
- `npx playwright test` sert le **dernier build** (`dist/`), pas le code du moment : reconstruire
  avant de chercher un bug de test.
- `npm ci` en arrière-plan vide `node_modules` pendant qu'il tourne : attendre la fin.
- `pkill -f <motif>` dans une commande qui contient ce motif tue son propre shell ; ne pas boucler
  sur `pgrep -f` non plus. Lancer un serveur sur un port neuf plutôt que de tuer l'ancien.
- Le proxy du conteneur refuse certains hôtes (Umami, journaux bruts d'Actions) : lancer le
  workflow et lire ses journaux par les outils GitHub plutôt que `curl`.
- `push_files` (API GitHub) écrit le fichier **entier** : relire un fichier partagé et vivant depuis
  `origin/main` juste avant, sinon on écrase le travail d'un autre. Préférer `git push`.
- Push refusé (403) : ne pas réessayer en boucle ; livrer autrement (bundle git) et le dire.
- Un hook `pre-push` qui lance `verify:ci` a besoin du navigateur : `PW_CHROMIUM=… git push`.
- Fins de ligne : `.gitattributes` avec `* text=auto eol=lf`, sinon Prettier voit tout le dépôt
  modifié sur un poste Windows.

## 6. Pile et outillage communs

- **Angular 22**, TypeScript strict (`strictTemplates`), **TypeScript `~6.0`** (Angular 22 exige
  `>=6.0 <6.1`). Vitest via `ng test` (jsdom), ESLint (angular-eslint, règles de template et
  d'accessibilité), Prettier (`singleQuote`, parseur `angular` pour le HTML, largeur du projet),
  Playwright + `@axe-core/playwright`. Node ≥ 22.22.3 (`engines`), `.nvmrc` : 24.
- Avant de monter une version majeure : vérifier la compatibilité de `@angular/build`, de
  `typescript-eslint` et d'`angular-eslint`.
- Premier démarrage sans `package-lock.json` : `npm install`, committer le lock, puis passer la CI
  et `vercel.json` de `npm install` à `npm ci`.
- Le serveur MCP de la CLI Angular (`.mcp.json` : `npx -y @angular/cli mcp`) peut être déclaré
  pour donner à l'agent la documentation à jour d'Angular.

## 7. Conventions Angular

- Composants **standalone** sans `standalone: true` ; **OnPush** et **zoneless** sont les défauts
  de la v22 : ne pas les répéter. Aucun NgModule.
- **Signaux partout** : `input()`, `input.required()`, `model()` (liaison bidirectionnelle),
  `output()`, `computed()`, `linkedSignal()`, `viewChild()`, `contentChildren()`, `httpResource()`.
  Jamais `@Input`/`@Output`/`@HostBinding`/`@HostListener`, jamais `ngOnChanges`, jamais `mutate`
  (`set`/`update`).
- **Zoneless** : un état qui change hors d'un événement Angular (observable, minuterie, scroll,
  `requestAnimationFrame`, IndexedDB) passe par un signal, sinon l'affichage ne suit pas.
- Liaisons d'hôte dans `host: {}` ; `inject()` plutôt que le constructeur ; `@Service()` pour un
  singleton racine (`@Injectable` seulement pour `useClass`/`useFactory`… ou une autre portée).
- Contrôle de flux natif `@if` / `@for` (avec `track` stable, jamais `$index` sur une liste
  mutable) / `@switch` / `@let` / `@defer`. Jamais `*ngIf`, `ngClass`, `ngStyle` : liaisons
  `[class.x]` et `[style.x]`.
- **Template et styles dans des fichiers séparés** (`templateUrl`, `styleUrl`, chemins relatifs) ;
  seul un template vide reste inline. Un dossier par composant (`.ts`, `.html`, `.scss`, spec à
  côté).
- Sélecteurs préfixés (`app` dans un site, `fd` dans Fuda, `mp` dans les `libs/` de phil-mp),
  contrôlés par ESLint. Un composant se pose sur l'élément natif quand c'est possible
  (`button[fdButton]`, `a[fdCard]`) pour garder la sémantique ; un sélecteur d'attribut porte un
  `eslint-disable` expliqué.
- **Signal Forms** (`@angular/forms/signals`, `form()`, `[formField]`) pour tout nouveau
  formulaire ; un champ maison implémente `FormValueControl<T>` ou `FormCheckboxControl`. Sinon
  Reactive Forms, jamais template-driven.
- Routes en `loadComponent` (paresseuses). La logique métier et les données vont dans des services
  à signaux, testés à part ; les composants restent petits.
- Ce qui rend un tirage ou une date reproductible (`RANDOM`, horloge, jeux de données) est un
  **jeton d'injection**, remplacé dans les tests. Ne pas supposer `new Date()` disponible dans un
  template.
- **Rendu serveur ou pré-rendu** : aucun accès à `window`, `document`, `localStorage`,
  `navigator`, `matchMedia`, `IntersectionObserver`, `FileReader` hors navigateur ; garder par
  `isPlatformBrowser(inject(PLATFORM_ID))` ou `afterNextRender()`. Le HTML pré-rendu doit être
  complet et lisible sans JavaScript. Jamais un état dépendant du navigateur (pointeur, préférence)
  dans un template : il change à l'hydratation et décale la page.
- **Le texte venu de l'utilisateur ou d'un tiers n'est jamais du HTML** : ni `innerHTML`, ni
  `bypassSecurityTrust*`. Seule exception admise : une URL d'iframe construite **uniquement** depuis
  des données internes (code pays, table du projet), jamais depuis une saisie, et le commentaire le
  dit.

## 8. Styles et thème

- **Aucune valeur en dur** : couleur, espacement, rayon, ombre, police, durée, courbe passent par
  des custom properties issues des tokens (Fuda ou `tokens.css` du projet). Les tokens se
  génèrent (`npm run tokens`), on n'édite jamais le CSS généré. Exception écrite seulement (px de
  géométrie d'un décor repris d'une maquette).
- Classes BEM préfixées (`app-*`, `fd-*`). Dans la famille Fuda : `ViewEncapsulation.None` et un
  `.scss` par composant ; ce qui sert à plusieurs composants va dans un partiel partagé. Les hôtes
  sont `inline` par défaut : un hôte qui porte une bordure ou une hauteur reçoit un `display`
  explicite.
- Une surcharge de style d'un composant de bibliothèque doit être **plus spécifique** que lui
  (`.app-form .app-submit`) : l'ordre d'insertion des feuilles dépend du premier rendu.
- Budget : un `.scss` de composant pèse au plus 4 Ko (budget bloquant d'`angular.json`).
- **Thème Jour par défaut. Nuit uniquement par `data-theme="dark"` sur `<html>`**, posé par un
  service de thème (`FdThemeService`) sur choix de l'utilisateur, et rétabli avant le premier rendu
  par un petit script en ligne (pas de flash). **Jamais `prefers-color-scheme` pour les couleurs.**
- Mouvement : durées et courbes des tokens, animation de `transform` et `opacity` (et couleurs)
  seulement, `prefers-reduced-motion` respecté en un seul endroit global (les tokens de durée y
  tombent à ~0) ; pas de garde de mouvement réduit dispersée dans les composants. Mouvement réduit
  = fondu seul pour les dialogues et toasts, pulsation pour les chargements, décor figé.
- Polices : sous-ensemble latin seulement si le site n'affiche pas de japonais ; plages
  `unicode-range` explicites ; polices de repli calées (`size-adjust`) pour éviter le décalage.

## 9. Fuda _(si le projet utilise Fuda)_

- Source de vérité du design system : https://claude.ai/artifact/J8FezpFLFeajXXYPZzqrHB et le
  `CLAUDE.md` de `design-system-fuda`. Liste des composants :
  `node_modules/@phamelin/fuda/types/phamelin-fuda.d.ts`.
  Quand un composant Fuda existe, on l'utilise (`fd-emblem`, `button[fdButton]`, `FdBadge`,
  `FdChip`, `FdCard`, `FdTextField`, `FdToastService`, `FdDialog`, `FdThemeService`, `FdTooltip`,
  `svg[fdIcon]`…), jamais une copie de son SVG ou de son style.
- **Fuda est publiée sur npm sous `@phamelin/fuda`** (le paquet `fuda` du registre est un autre
  projet). Installation :
  `npm install @phamelin/fuda @angular/cdk @fontsource/dela-gothic-one @fontsource/zen-maru-gothic`,
  version en `^` dans `package.json`, figée par le lockfile.
  Imports `from '@phamelin/fuda'`. Une nouvelle version se publie en poussant un tag `vX.Y.Z`
  dans `design-system-fuda` (workflow `release.yml`) ; pour la prendre :
  `npm install @phamelin/fuda@latest`, puis toutes les quality gates.
- **Plus de dépendance git** (`github:…`, `git+https://…`, `vendor/*.tgz`) : un projet qui en a
  encore une passe à npm. Migration sans toucher au code possible par alias
  (`npm install fuda@npm:@phamelin/fuda`, imports `from 'fuda'` gardés), mais on préfère
  remplacer les imports et les chemins de styles par `@phamelin/fuda`. Une version de Fuda pas
  encore publiée ne se consomme pas : on publie d'abord.
- Styles : déclarer `node_modules/@phamelin/fuda/styles/fuda.css` dans `angular.json` (`styles`,
  **avant** `src/styles.scss`) : le paquet n'exporte pas `./styles/*`, un `@import` dans le SCSS
  ne se résout pas. Puis, dans `src/styles.scss`, les polices latines de `@fontsource` (Dela Gothic
  One 400, Zen Maru Gothic 500 et 700) ; `styles/fonts.css` de Fuda charge aussi le japonais, à
  réserver aux sites qui en affichent.
- Palette du projet : couleur principale `sakura` (texte `on-sakura`), `sakura-deep` pour le texte
  rose et les bords, `tokiwa` pour le succès (bouton `success`), `mizu` pour la progression.
- Pièges connus :
  - un contenu projeté ne se met pas dans un `@if` à plusieurs nœuds racines (NG8011) : garder les
    emplacements `slot=…` hors des `@if` et varier le texte par une expression ;
  - `viewChild('x')` sur un `button[fdButton]` rend le composant `FdButton` : lire l'élément avec
    `{ read: ElementRef }` ;
  - préférer `aria-disabled="true"` (grisé par Fuda) à `disabled`, qui retire le focus ; Playwright
    n'attend pas un élément `aria-disabled` : `click({ force: true })` dans les tests ;
  - le toast crée sa région `aria-live` au premier `show()`, rien à ajouter.

## 10. Accessibilité (WCAG 2.2 AA, sans exception)

- **axe sans aucune violation** sur chaque page et chaque état, **en Jour et en Nuit** ; une
  nouvelle page ou un nouvel état s'ajoute à l'audit e2e (idéalement l'audit dérive ses routes de
  la table des routes, pour qu'aucune page n'y échappe).
- Focus toujours visible (`--focus-ring`), navigation clavier complète, lien d'évitement, focus
  déplacé volontairement après une action (ex. sur « Suivant » après une réponse, puis dans le
  champ ou la première option).
- Cibles d'au moins **44 px** (48 px pour un public âgé ou tactile, comme phil-mp et
  crochet-helper). Reflow sans défilement horizontal à 320 px.
- Texte à **4,5:1** dans les deux thèmes ; **jamais la couleur seule** pour porter une information
  (coche ou croix et texte, annonce `aria-live` ou `fd-sr`).
- Libellé de champ toujours visible. HTML sémantique (`header`, `nav`, `main`, `article`,
  `section`, `figure`, `time`), un seul `<h1>`, titres sans saut, composants natifs (`button`,
  `select`, `dialog`) d'abord. Décor en `aria-hidden`, `alt` pertinent ailleurs.
- **Un audit de contraste pendant une transition lit des couleurs interpolées** : lancer axe avec
  `reducedMotion: 'reduce'` et attendre qu'aucune animation ne soit _en cours_ (`playState`),
  pas une liste `getAnimations()` vide. Mesurer au repos avant de corriger une palette.
- jsdom n'a ni mise en page ni cascade : contraste, focus initial d'un dialogue, position d'une
  infobulle se testent dans Playwright.

## 11. Données, état et robustesse

- **Toute entrée venant d'un tiers est bornée en taille avant traitement** (permalien, fichier
  importé, PDF, réponse d'API) : invalide ou trop grande → `null` ou refus propre, jamais
  d'exception (un lien de 6 Ko peut se décompresser en 5 Mo).
- **Données de l'utilisateur : aucune perte, même en cas d'échec.** Une écriture IndexedDB n'est
  réussie qu'au `complete` de la transaction (quota dépassé → `abort`) ; on n'efface jamais une
  ancienne copie sur la foi d'une écriture non confirmée ; plusieurs écritures liées = une seule
  transaction. `localStorage` seulement pour de petites préférences.
- Charger un nouvel élément ouvre un nouvel élément, il n'écrase pas l'actif. **Toute action
  destructive passe par une confirmation.**
- Asynchrone et effets : vider l'état _avant_ d'attendre une suppression, sinon un effet réécrit
  ce qu'on vient d'effacer. Un événement émis depuis un `effect` arrive un tour après le clic.
- Données absentes ou invalides côté serveur : journaliser, répondre 503 `no-store` avec
  `Retry-After`, jamais de faux contenu.
- Un lien absent vaut `null` et ne s'affiche pas : **jamais d'URL devinée**.
- Langue : portée par l'URL (racine pour la langue principale, préfixe pour l'autre, ex. `/en`),
  jamais par un état stocké ; tout texte visible passe par le service de traduction et doit venir
  d'un signal quand la page est réutilisée d'une langue à l'autre. Deux dictionnaires ont
  exactement les mêmes clés (test).

## 12. Performance et bundle

- Le premier affichage ne contient que la coquille et la page d'entrée ; tout le reste est
  paresseux (route, textes propres à une page, CSS d'une autre page, `import()` au clic).
- **Le budget d'`angular.json` est une alarme avec une vraie marge**, jamais réglé à quelques
  octets de la taille du moment (des dizaines d'échanges se sont perdus à grappiller). Mesurer
  avec `ng build --stats-json`. Ce que ressent l'utilisateur se juge par LCP/CLS (Playwright ou
  Lighthouse sur mobile bridé), pas à l'octet.
- Images : `width`/`height` partout (CLS nul), `loading="lazy"` sauf l'image LCP. Pour un SVG ou
  sans service de redimensionnement, une balise `<img>` native suffit (`NgOptimizedImage` coûte
  ~5,5 ko) ; `NgOptimizedImage` seulement là où le projet l'a choisi.
- `@defer` coûte ~5,6 ko au bundle initial même dans une page paresseuse : dans un site statique
  au budget serré, `import()` suffit. Dans un site SSR à hydratation incrémentale (portfolio,
  lois-votes), `@defer (hydrate on viewport)` pour ce qui est sous la ligne de flottaison, chaque
  bloc avec un `@placeholder` de hauteur fixe.
- Cache HTTP `immutable` seulement pour les fichiers à empreinte ; ce qui garde son nom
  (`ngsw-worker.js`, `print.css`, polices préchargées) est revalidé.
- Service worker : tout script qui réécrit `dist/` passe **avant** la génération de `ngsw.json` ;
  tester hors ligne en lisant l'état du worker, pas seulement le statut HTTP.
- Pas de bibliothèque tierce quand une API native suffit (`Intl`, `<dialog>`, `PerformanceObserver`,
  `node:crypto`).

## 13. Obligatoire sur tout site

- **Icône d'onglet** : `public/favicon.svg` (aux couleurs du site), `public/favicon.ico` (16, 32
  et 48 px), `public/apple-touch-icon.png` (180 px), déclarés dans `src/index.html` et vérifiés par
  un e2e. L'icône par défaut d'Angular n'est jamais acceptable ; des initiales sont provisoires.
- **Mesure d'audience** : Umami sans cookie (`analytics.patternreader.com`), un site enregistré
  par application. Ne jamais recopier le `data-website-id` d'un autre projet ; l'ajouter seulement
  une fois le site enregistré. Un événement se déclare dans le code **et** dans la liste des
  rapports (`tools/umami.mjs`). Aucun suivi par personne sans décision produit (bandeau CNIL).
- **SEO** : chaque page a un titre, une meta description, un `<h1>`, une URL canonique (et
  `hreflang` si plusieurs langues), est pré-rendue ou rendue côté serveur, et **reliée** depuis
  une autre (une page orpheline n'est pas trouvée). `robots.txt` et `sitemap.xml` sont générés ;
  une page `noindex` n'entre pas au sitemap. Une page « introuvable » répond 404, pas 200.
- `lang` correct sur `<html>`, `meta viewport`, titre propre au site (pas « Site Template »).

## 14. Sécurité et vie privée

- CSP sans `unsafe-inline` pour les scripts quand c'est possible (empreintes sha256 des scripts en
  ligne, vérifiées au build) ; `nosniff`, `Referrer-Policy`, `Permissions-Policy`.
- Lien externe dans un nouvel onglet : `target="_blank"` + `rel="noopener noreferrer"`, annoncé
  « (nouvel onglet) » aux lecteurs d'écran.
- Aucune donnée personnelle publiée ou stockée sans nécessité ; les données de l'utilisateur ne
  quittent pas son appareil dans un produit sans back-end. Aucun SDK tiers (pub, chat, analytics
  autre qu'Umami), aucun cookie.
- Respecter les conditions d'utilisation et les limites de débit de chaque source ; **jamais de
  scraping** qui les contrevient ; citer la source de chaque donnée. Un script qui interroge un
  service n'envoie aucune donnée personnelle (pas d'e-mail dans le User-Agent) et attend sur 429.
- Dans un workflow d'agent, l'étape qui détient un jeton d'écriture vit dans un autre job, repart
  d'un checkout propre et ne lit la production de l'agent que comme une donnée.

## 15. Contenu éditorial et exactitude

- **Le contenu est rédigé à la main et vérifié : un fait douteux ne vaut rien.** Sources fiables
  uniquement ; distinguer ce qui est établi de ce qui est traditionnel ou débattu ; capitales ou
  chiffres ambigus : retenir le plus cité et nommer l'autre.
- Santé, peau, alimentation : **aucun conseil médical**, aucun diagnostic, aucune promesse de
  résultat ; mentionner caféine et interactions quand c'est pertinent.
- Vocabulaire exact, même quand il est moins vendeur (ex. lois-votes : « Adopté par l'Assemblée »,
  « ont voté », jamais « présents »). Un taux calculé par nous est présenté comme tel.
- **Quiz : rien ne donne la réponse avant l'envoi** — ni texte alternatif, ni anecdote, ni astuce,
  ni carte, ni nom de fichier visible. Ce qui n'apparaît qu'après la réponse n'existe pas dans le
  DOM avant (`@if (isAnswered())`), pas même en encart vide. Une question ne se répond qu'une fois.
  Le verdict ne repose jamais sur la couleur seule. « Suivant » est un bouton secondaire.
- Contenu unique par produit (phil-mp) : aucune phrase copiée d'un site à l'autre, même
  reformulée à la marge.
- Images : licences libres uniquement, crédits générés, jamais ajoutées à la main hors du script
  prévu. Données officielles : licence et provenance citées.

## 16. Tests

- Vitest via **`ng test`** (jamais `npx vitest` seul : « TestBed.initTestEnvironment »). Tests
  ciblés pendant le travail (`npx ng test --no-watch --include='<glob>'`), suite complète une fois
  à la fin.
- Zoneless : jamais `fakeAsync`/`tick`/`flush`/`waitForAsync`. `await fixture.whenStable()`,
  `TestBed.tick()`, faux temporisateurs de Vitest pour le temps. Mocker par `TestBed`
  (`{ provide, useValue }`), pas par `vi.mock()` sur un import relatif.
- **Un test décrit ce que l'utilisateur doit obtenir, pas ce que le code fait** ; il ne fige jamais
  un comportement douteux. Un test qui figeait un bug est **inversé**, pas supprimé. Chaque défaut
  corrigé a son test.
- Une énumération (« chaque forme », « deux à douze », toutes les langues, tous les produits) est
  testée **en entier, en boucle**, pas sur un échantillon.
- Persistance : attendre l'écriture (`vi.waitFor`) puis relire par le service, pas l'état en
  mémoire juste après l'action.
- Pour vérifier qu'un test protège vraiment : casser le code (mutation) et le voir échouer ; un
  contrôle négatif évite un contrôle trop permissif.
- Un contrôle qui lit des fichiers va dans `tools/*.mjs` lancé au build (les specs Angular n'ont
  pas les types Node).
- Playwright : aucun service externe contacté (iframe de carte, Google, OpenStreetMap, photos
  servies par `page.route`) ; localiser par rôle et nom exact
  (`getByRole('button', { name, exact: true })`) ; un e2e d'événement asynchrone accumule jusqu'à
  obtenir ce qu'il attend. Impression : vérifier un vrai PDF (`page.pdf()`), pas `innerText`
  (qui lit aussi le texte masqué).

## 17. Économie de tokens

- Lire les fichiers **listés par la tâche**, et seulement eux ; le reste se trouve par `grep -n`.
  Avant un fichier de plus de 300 lignes : `grep -n`, puis lecture par plage. Jamais un gros
  dictionnaire ou glossaire en entier.
- Une seule vérification complète à la fin, des tests ciblés avant. Lancer les longues commandes en
  arrière-plan pendant la lecture.
- Bloqué après une vingtaine d'échanges sur une contrainte (budget, test impossible) : arrêter de
  contourner, commiter, expliquer le blocage. Une décision humaine coûte moins que cent échanges.
- Commiter au fil de l'eau (au moins toutes les 25 à 30 actions) : un travail non commité est
  perdu ou sauvé en vrac.

## 18. Fiches, prompts et travail délégué

- Une fiche (`prompts/NN-*.md`, `docs/prompts/`) est autoportante : contexte, fichiers à lire,
  critères d'acceptation, **hors périmètre**, vérification. On l'applique **à la lettre**, une
  seule à la fois, sans prendre d'avance. « Décisions déjà prises » : appliquées sans refaire
  l'exploration.
- **Si la fiche contredit le code** (chemin, nombre de pages, composant) : le code et `CLAUDE.md`
  font foi ; adapter et signaler l'écart dans la PR.
- Avant de lancer une fiche, la relire **en entier** contre l'état du code, nombres et listes
  compris (« six routes », « 12 pages ») : une fiche périmée coûte des centaines d'échanges.
- Agents en parallèle : une branche par agent, créée depuis la branche d'intégration à jour,
  fusionnée avant la vague suivante.
- **Rétro après chaque PR relue** : un défaut d'un type nouveau → une ligne dans les pièges du
  `CLAUDE.md` du projet (ou ici s'il vaut pour tous) ; un type déjà listé qui revient → le
  transformer en **contrôle automatique** (test, règle de lint, script de `tools/`). Garder les
  `CLAUDE.md` courts : fusionner plutôt qu'ajouter, supprimer ce qui ne sert plus.

## 19. Rendre compte à Phil

- Message final : ce qui est fait, ce qui ne l'est pas et pourquoi, sortie résumée des
  vérifications (vraiment lancées), écarts au plan, lien de la PR et son état (fusionnée, ou ce
  qui la bloque).
- Terminer par **ce que Phil doit faire, en liste numérotée** (réglage Vercel ou DNS, secret à
  créer, branche par défaut, décision à prendre), ou dire qu'il n'y a rien à faire.
- Une sortie rouge se rapporte telle quelle ; une étape sautée se dit.

## 20. Écarts assumés par projet

Ces projets s'écartent volontairement d'une règle ci-dessus ; leur `CLAUDE.md` l'emporte :

- **petit-bac** : `OnPush` explicite sur chaque composant, Angular Material et tokens `--pb-*`,
  thème clair/sombre/auto, i18n six langues par ngx-translate, fichiers sans suffixe pour
  `petit-bac` mais suffixés pour `travel-book`, commentaires sans accents, CSP qui tolère
  `unsafe-inline`.
- **crochet-helper** : CSS global (`hanami.css`, `lecteur.css`, `pages.css`), ni `styles:` ni
  `.scss` de composant, contrôlé par `tools/check-styles.mjs` ; thème sombre par `data-dim` ;
  anglais à la racine et français sous `/fr` ; commits à l'infinitif (« Ajouter… »).
- **phil-mp** : Ionic 9 pour les formulaires, classes de `base.css` au lieu de styles de
  composant, cibles de 48 px, rôle et périmètre de l'agent dans `AGENTS.md`.
- **portfolio** : `NgOptimizedImage`, `@defer` d'hydratation partout, seuils Lighthouse fixés par
  Phil (ne pas les modifier sans son accord), la maquette fait foi.
- **lois-votes** : SSR + BFF Express sur Vercel, données officielles préparées au build, aucune
  requête externe à l'exécution.
- **design-system-fuda** : textes Storybook en anglais, une seule story par composant avec un
  contrôle par `input`, captures visuelles versionnées.
