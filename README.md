# Tea Quizz

Votre thé en 10 questions : le type de thé ou d’infusion qui correspond à vos envies, sa préparation, les repères à vérifier sur le paquet et le matériel utile, sans marque. Site : <https://tea-quizz.phamelin.fr>, construit avec le design system [Fuda](https://github.com/phamelin42/design-system-fuda).

## Démarrer

Node ≥ 22.22.3 est requis (Angular 22) ; `.nvmrc` indique 24.

```bash
npm ci
npm start          # http://localhost:4200
```

| Commande                             | Rôle                                                              |
| ------------------------------------ | ----------------------------------------------------------------- |
| `npm test`                           | Tests unitaires (Vitest via `ng test`)                            |
| `npm run lint` / `npm run typecheck` | ESLint / tsc                                                      |
| `npm run build`                      | Build de production dans `dist/tea-quizz/browser`                 |
| `npm run e2e`                        | Playwright sur ce build : parcours clavier, 320 px, axe Jour/Nuit |
| `npm run format`                     | Prettier                                                          |

Pour lancer Playwright avec un Chromium déjà installé : `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/chemin/chrome npm run e2e`.

## Mise en ligne

Vercel (`vercel.json`). Le projet Vercel et le DNS de `tea-quizz.phamelin.fr` sont créés par le dépôt `infra` (`projects.json`).
