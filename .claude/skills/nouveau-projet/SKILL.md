---
name: nouveau-projet
description: Créer un nouveau projet de Phil (site, quiz, outil, dépôt phamelin42/*) toujours de la même façon — dépôt avec branche main, squelette site-template, Fuda depuis npm (@phamelin/fuda), contexte Claude commun et hooks, icônes, quality gates toutes vertes, déclaration dans infra, PR suivies jusqu’à leur fusion. À utiliser dès que Phil demande de créer, démarrer, initialiser ou monter un projet, un site ou un dépôt, ou de mettre un dépôt existant aux normes communes.
---

# Créer un projet avec le contexte commun

Objectif : un dépôt neuf qui démarre au même niveau que les autres, sans que Phil ait à répéter
une seule règle. Le contexte commun (`CLAUDE.commun.md` du dépôt `claude-context`) fait foi ; ce
skill n'en est que l'ordre d'exécution. Suivre les étapes **dans l'ordre**, et terminer **toujours**
par le rapport du § 12.

`$CC` désigne le clone de `phamelin42/claude-context`, `$TPL` celui de `phamelin42/site-template`,
`$P` celui du nouveau projet.

## 0. Cadrer (avant tout fichier)

- Il faut : le **nom** du dépôt (kebab-case, sert aussi de sous-domaine), ce que fait le projet en
  une phrase, et le sous-domaine s'il diffère (`capitals-quizz` pour `capital-quizz`). Ce qui
  manque se demande, ne s'invente pas.
- Produit, règles du jeu ou sources pas encore définis : on crée quand même le squelette, mais la
  section « Le projet » du `CLAUDE.md` le dit, et **aucune fonctionnalité** ne se code avant que
  Phil ait validé un plan par étapes (modèle : `lois-votes/docs/PLAN.md`). Proposer ce plan dans
  le rapport final.
- Projet qui n'est pas un site Angular (API, script, outil) : garder les étapes 1-3, 6, 8-12 et
  remplacer le squelette par celui du projet jumeau le plus proche (`lois-votes` pour un serveur,
  `infra` pour un outil Node sans dépendance).

## 1. Réunir les sources

```bash
ls ~/claude-context ~/site-template 2>/dev/null   # ou sous le dossier de travail de la session
```

Absents : les ajouter à la session (`add_repo`, accès `read`), cloner, puis lire
`$CC/CLAUDE.commun.md` en entier. Vérifier la dernière version publiée de Fuda :
`npm view @phamelin/fuda version` (un 404 juste après une publication est normal quelques
minutes ; ne pas repasser à une dépendance git pour autant : attendre).

## 2. Le dépôt et sa branche `main`

1. Dépôt `phamelin42/<nom>`, **public**, sans fichier initial. Créer par les outils GitHub
   (`create_repository`) ; si la session le refuse, demander à Phil de le créer (vide, ou par
   « Use this template » depuis `site-template`) et de l'ajouter à la session, puis `add_repo`
   avec l'accès `push`.
2. **`main` d'abord** : dépôt vide → un commit initial sur `main` (un `README.md` d'une ligne,
   « Initialise le dépôt »), poussé sur `main`. Créé depuis le modèle → `main` existe déjà.
   Vérifier : `git ls-remote origin refs/heads/main`.
3. Tout le reste se fait sur une branche de travail créée depuis `main` (`initialisation`, ou la
   branche imposée par la session), jamais directement sur `main`.

## 3. Squelette depuis `site-template`

```bash
git -C "$TPL" archive HEAD | tar -x -C "$P"      # le modèle sans son historique
grep -rn "site-template\|Site Template" "$P" --exclude-dir=node_modules --exclude-dir=.git
```

Remplacer chaque occurrence : `package.json` (`name`, `description`), `angular.json` (nom du
projet et `buildTarget`), `vercel.json` (`outputDirectory`), `playwright.config.ts` (chemin de
`dist/`), `src/index.html` (`<title>`, meta description, `lang`), `src/app/app.ts` et leurs tests
(`app.spec.ts`, `e2e/accueil.spec.ts`), `README.md`. La commande `grep` ci-dessus doit finir vide.

## 4. Fuda depuis npm

Si le modèle dépend encore de Fuda par git (`"fuda": "github:…"` ou `git+https:`) :

```bash
npm uninstall fuda
npm install @phamelin/fuda@latest
grep -rln "from 'fuda'" src e2e | xargs -r sed -i "s#from 'fuda'#from '@phamelin/fuda'#"
```

Styles : retirer `@import 'fuda/styles/fuda.css'` de `src/styles.scss` et déclarer
`node_modules/@phamelin/fuda/styles/fuda.css` en tête des `styles` d'`angular.json` (le paquet
n'exporte pas ses styles : un `@import '@phamelin/fuda/styles/…'` casse le build). Contrôle :
`grep -rn "'fuda'\|fuda/styles" src e2e` ne doit plus rien trouver, et `npm run build` passe.

Et signaler dans le rapport que `site-template` lui-même est à migrer (PR séparée), pour que le
prochain projet n'ait plus cette étape.

## 5. Contexte Claude et fichiers communs

```bash
"$CC/scripts/installer.sh" "$P" --avec-hooks
```

- Réécrire le `CLAUDE.md` du projet à partir de `$CC/modeles/CLAUDE.projet.md` : **seulement ce
  qui est propre au projet** (le projet, ses commandes, sa structure, ses règles à ne pas casser,
  ses écarts). Tout ce que le contexte commun dit déjà en est retiré, y compris les conventions
  recopiées du modèle.
- `.nvmrc` : `24`. `.gitattributes` : `* text=auto eol=lf`. `engines.node` : `>=22.22.3`.
- Session cloud : `source /opt/nvm/nvm.sh && nvm use 24` (ou relancer le hook copié, avec
  `CLAUDE_CODE_REMOTE=true`) : `node -v` doit donner une 24.

## 6. Ce qui est obligatoire sur tout site

- **Icônes d'onglet** propres au projet, pas les initiales du modèle : un pictogramme simple lié
  au sujet, aux couleurs des tokens Fuda, dans `public/favicon.svg` ; puis `favicon.ico` (16, 32,
  48 px) et `apple-touch-icon.png` (180 px) **générés depuis le SVG** (Chromium de
  `/opt/pw-browsers` en capture, ou `magick` s'il est installé), jamais dessinés à la main.
- **Umami** : ne pas ajouter de `data-website-id` (le site n'est pas encore enregistré) ; c'est
  une action pour Phil.
- Titre, description, `lang`, `<h1>` propres au site ; `robots.txt` et `sitemap.xml` si le modèle
  les génère.

## 7. Lockfile et CI

```bash
npm install --no-audit --no-fund       # crée package-lock.json, à committer
```

Puis passer `.github/workflows/ci.yml` et `vercel.json` de `npm install` à `npm ci`, et
`cache-dependency-path` sur `package-lock.json`.

## 8. Quality gates : toutes, par soi-même, jusqu'au vert

Lire `.github/workflows/ci.yml` et lancer **chacune de ses étapes**, dans l'ordre, en local :

```bash
npm ci && npm run lint && npm run typecheck && npm test && npm run build \
  && npx prettier --check . \
  && PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH="$(readlink -f /opt/pw-browsers/chromium)" npm run e2e
```

Toute erreur se corrige, puis on relance **tout**. Jamais de règle coupée, de test en `skip` ni
de `--no-verify`. Ne passer à la suite qu'avec une sortie entièrement verte, lue.

## 9. Commits

Un commit par intention, en français à l'impératif : « Reprend le squelette de site-template »,
« Renomme le projet en <nom> », « Utilise Fuda depuis npm », « Ajoute le contexte Claude
commun », « Ajoute les icônes d'onglet », « Fige les dépendances et passe la CI à npm ci ».
Prettier vérifié avant chaque push.

## 10. Déclaration dans `infra`

Sauf si le projet se déploie lui-même ailleurs (cf. « Ce qui n'a pas sa place ici » dans le README
d'`infra`) : dans `phamelin42/infra`, sur une branche,
`node scripts/add-project.mjs <nom> phamelin42/<nom> [sous-domaine]`, puis `node --test` (vert),
commit « Déclare le projet <nom> », PR vers `main`. Le projet Vercel et le DNS seront créés au
merge.

## 11. PR

PR de la branche de travail vers `main` du nouveau dépôt, après avoir vérifié qu'aucune n'est
déjà ouverte, avec le contenu du § 3 du contexte commun et la sortie résumée des quality gates.
Même chose pour la PR d'`infra`.

Puis **suivre chaque PR jusqu'à sa fusion** (contexte commun § 3) : s'abonner à son activité,
corriger toute CI rouge ou tout avis, et la fusionner soi-même dès que la CI est verte sur le
dernier commit. La PR du projet d'abord, celle d'`infra` ensuite (sa fusion crée Vercel et le DNS).

## 12. Rapport à Phil — toujours

Ce qui est fait, liens des PR et leur état (fusionnées, ou ce qui les bloque), sortie résumée des
gates, puis **ce que Phil doit faire**, en liste numérotée, par exemple :

1. Faire de `main` la branche par défaut et la protéger (check de CI requis), si ce n'est pas déjà
   le cas.
2. Enregistrer le site dans Umami et me donner le `data-website-id`.
3. Valider le plan du produit (si le projet n'était pas encore défini) et l'icône.

## Mettre un dépôt existant aux normes

Mêmes règles, sans les étapes 2.1, 3 et 10 : vérifier ou créer `main` (§ 2 du contexte commun
pour un dépôt sur `master`), installer le contexte (§ 5), migrer Fuda vers npm (§ 4), alléger son
`CLAUDE.md` de ce que le commun dit déjà, puis § 8, § 9, § 11 et § 12.
