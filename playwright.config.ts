import { defineConfig } from '@playwright/test';

// Plusieurs sessions peuvent partager la machine : un autre site sur le même port serait testé à la
// place du nôtre (titre, pages, axe d'un autre projet). `E2E_PORT` en choisit un libre.
const port = process.env['E2E_PORT'] ?? '4300';

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  reporter: process.env['CI'] ? 'github' : 'list',
  use: {
    baseURL: `http://localhost:${port}`,
    viewport: { width: 1200, height: 900 },
    // Pour utiliser un Chromium déjà installé : PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/chemin/vers/chrome
    launchOptions: {
      executablePath: process.env['PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH'],
    },
  },
  // Le test s'exécute sur le build de production : `npm run build` d'abord.
  webServer: {
    command: `npx http-server dist/tea-quizz/browser -p ${port} -s`,
    url: `http://localhost:${port}`,
    // Jamais de serveur réutilisé : un serveur déjà là peut servir un autre build ou un autre site.
    reuseExistingServer: false,
  },
});
