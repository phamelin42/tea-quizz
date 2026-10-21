# Tea Quizz

Règles communes à tous les projets de Phil (copie de `phamelin42/claude-context`, ne pas la modifier ici ; ce fichier l'emporte en cas de désaccord) : @.claude/CLAUDE.commun.md

## Le projet

Questionnaire pour trouver le thé ou l'infusion adaptés à son besoin, construit sur le modèle de `skincare-quizz` : 10 questions à choix unique (moment, envie, caféine, saveurs, lait, amertume, expérience, temps, chaud ou glacé, tasses par jour), puis un écran de résultat avec la famille évoquée, ce qu'il faut repérer sur le paquet, le rituel de préparation, des types de thés et d'infusions et le matériel utile. Pas de score : aucune réponse n'est juste ou fausse. Site : tea-quizz.phamelin.fr.

- Le contenu est rédigé à la main et vérifié : un fait douteux ne vaut rien. Établi, traditionnel et débattu se distinguent (la camomille est « traditionnellement bue le soir », jamais « calmante »).
- Aucun conseil médical, aucune promesse de santé (« bienfaits », « détox »… sont interdits, `profile.spec.ts` relit tous les textes). Une marque n'est citée que dans `src/app/tea/catalogue.ts` : composition lue chez le fabricant, lien Amazon validé par Phil, aucun prix, aucun classement, aucun « bienfaits ». `flavoured` : « avec de la saveur » (arôme, épice, fruit, fleur), un chai l'est toujours. « Vos réponses évoquent… », jamais « vous avez… ». L'encart « Ceci n'est pas un avis médical » reste sur le résultat : caféine, grossesse, interactions, fer.
- Rien n'est enregistré : les réponses vivent en mémoire, dans `QuizService`.
- Les liens vers les produits sont des liens d'affiliation Amazon (tag `phamelin-21`) : aucune mention d'affiliation n'est affichée (décision de Phil du 21/10/2026), et le catalogue est validé par Phil avant tout ajout.
- Règle de la caféine : « Aucune », ou le soir sans la rechercher, donne uniquement des infusions (rooibos, camomille, menthe, verveine, fruits) ; « Le moins possible » garde un thé, en infusion courte, avec une infusion en complément. Les infusions ne sont pas des thés : elles ne contiennent pas de théine.

## Commandes

Voir les commandes communes (`npm start`, `test`, `lint`, `typecheck`, `build`, `e2e`, `format`). Le build de production est dans `dist/tea-quizz/browser`.

## Structure

- `src/app/` : un dossier par composant ; `app` affiche l'écran du moment (`home`, `question`, `analysis`, `result`).
- `src/app/tea/` : questions (`questions.ts`), textes (`content.ts`), calcul du profil, des thés, des repères d'étiquette et du rituel (`profile.ts`, fonctions pures), parcours (`quiz.service.ts`). `profile.spec.ts` parcourt toutes les combinaisons de réponses. `catalogue.ts` : les produits (données seules) ; `products.ts` : règles de validation, `examplesFor` et jeton `PRODUCT_CATALOGUE` (il ré-exporte `CATALOGUE`).
- `src/app/examples/` : bloc d'exemples de produits d'un type de thé.
- `e2e/` : Playwright (build de production servi par `http-server` sur le port 4300, ou `E2E_PORT` ; jamais un serveur réutilisé), clavier, 320 px, axe Jour/Nuit sur chaque écran.

## Règles à ne pas casser

- Un fait ajouté à `content.ts` (température, durée, dose, origine, avertissement) a une source fiable ; une température ou une durée est une fourchette courante, jamais une règle.
- Le rituel donne les durées et températures de `TEAS` ; l'infusion à froid se garde au réfrigérateur et se boit dans les 24 heures.
- Les icônes d'onglet sont une tasse de thé aux couleurs de Fuda, rendues depuis `favicon.svg` par Chromium.
