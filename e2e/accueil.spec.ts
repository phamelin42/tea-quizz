import AxeBuilder from '@axe-core/playwright';
import { expect, type Page, test } from '@playwright/test';

test.use({ reducedMotion: 'reduce' });

const TITLE = 'Votre thé, en 10 questions';

/** Répond à toutes les questions au clavier, par le chiffre de l'option. */
async function answerAll(page: Page, keys = ['1', '2', '3', '1', '3', '3', '2', '1', '2', '2']) {
  for (const [i, key] of keys.entries()) {
    await expect(page.getByText(`Question ${i + 1} sur 10`, { exact: true })).toBeVisible();
    await page.keyboard.press(key);
  }
}

/** Un thé vert : la carte du thé et celle du thé suivant montrent des exemples du catalogue. */
const KEYS_WITH_TEA = ['1', '2', '3', '1', '3', '3', '2', '1', '2', '2'];
/** Le soir, pour se détendre, sans caféine : uniquement des infusions. */
const KEYS_WITHOUT_CAFFEINE = ['4', '3', '4', '6', '1', '1', '1', '1', '1', '1'];

/** axe au repos : une couleur lue pendant une transition serait interpolée. */
async function expectNoViolations(page: Page) {
  await page.waitForFunction(() =>
    document.getAnimations().every((animation) => animation.playState !== 'running'),
  );
  const { violations } = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(violations).toEqual([]);
  // Hors WCAG mais exigé par le projet : un seul h1, des titres sans saut et jamais vides.
  const headings = await new AxeBuilder({ page })
    .withRules(['page-has-heading-one', 'heading-order', 'empty-heading'])
    .analyze();
  expect(headings.violations).toEqual([]);
}

test('la page présente le questionnaire', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Tea Quizz/);
  await expect(page.getByRole('heading', { level: 1, name: TITLE })).toBeFocused();
});

test("les icônes d'onglet répondent", async ({ request }) => {
  for (const file of ['favicon.svg', 'favicon.ico', 'apple-touch-icon.png']) {
    const response = await request.get(file);
    expect(response.ok(), file).toBe(true);
  }
});

test('le parcours se fait entièrement au clavier', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Commencer' }).focus();
  await page.keyboard.press('Enter');

  const first = page.getByRole('heading', { level: 1 });
  await expect(first).toHaveText(/À quel moment de la journée/);
  await expect(first).toBeFocused();
  await expect(page.getByRole('button', { name: 'Précédent' })).toHaveCount(0);

  // Une réponse au chiffre coche l'option, puis l'intitulé suivant reçoit le focus.
  await page.keyboard.press('3');
  await expect(page.getByRole('heading', { level: 1, name: /Qu’attendez-vous/ })).toBeFocused();
  await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '10');

  // Retour : la réponse donnée reste cochée.
  await page.getByRole('button', { name: 'Précédent' }).click();
  await expect(page.getByRole('button', { name: /Après le repas/, pressed: true })).toBeVisible();

  await answerAll(page);
  await expect(page.getByRole('status')).toHaveText('Analyse de vos réponses…');
  await expect(page.getByRole('status')).toBeFocused();
  const result = page.getByRole('heading', { level: 1, name: /Vos réponses évoquent/ });
  await expect(result).toBeFocused();
  for (const name of [
    'Ce qu’il faut repérer sur le paquet',
    'Votre rituel',
    'Les thés et le matériel qui correspondent',
  ]) {
    await expect(page.getByRole('heading', { level: 2, name })).toBeVisible();
  }
  await expect(page.getByText('Ceci n’est pas un avis médical')).toBeVisible();

  await page.getByRole('button', { name: 'Modifier mes réponses' }).click();
  await expect(page.getByText('Question 1 sur 10', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { pressed: true })).toHaveCount(1);

  await answerAll(page);
  await page.getByRole('button', { name: 'Recommencer' }).click();
  await expect(page.getByRole('heading', { level: 1, name: TITLE })).toBeFocused();
  await page.getByRole('button', { name: 'Commencer' }).click();
  await expect(page.getByRole('button', { pressed: true })).toHaveCount(0);
});

test('rien ne déborde en largeur à 320 px', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Commencer' }).click();
  await expect(page.getByText('Question 1 sur 10', { exact: true })).toBeVisible();

  // Une réponse donnée en bas de page ramène la question suivante en haut.
  await page.getByRole('button', { name: /Le matin/ }).click();
  await expect(page.getByText('Question 2 sur 10', { exact: true })).toBeVisible();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  const back = await page.getByRole('button', { name: 'Précédent' }).boundingBox();
  expect(back!.height).toBeGreaterThanOrEqual(44);
  await page.getByRole('button', { name: 'Précédent' }).click();

  await answerAll(page);
  await expect(page.getByRole('button', { name: 'Recommencer' })).toBeVisible();
  const width = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(width).toBeLessThanOrEqual(320);
});

for (const theme of ['light', 'dark'] as const) {
  test(`axe (WCAG 2.2 AA) sur chaque écran, thème ${theme}`, async ({ page }) => {
    if (theme === 'dark') {
      await page.addInitScript(() => localStorage.setItem('fuda-theme', 'dark'));
    }
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1, name: TITLE })).toBeVisible();
    await expectNoViolations(page);

    await page.getByRole('button', { name: 'Commencer' }).click();
    await expect(page.getByText('Question 1 sur 10', { exact: true })).toBeVisible();
    await page.keyboard.press('2');
    await expect(page.getByRole('button', { name: 'Précédent' })).toBeVisible();
    await page.getByRole('button', { name: 'Précédent' }).click();
    await expect(page.getByRole('button', { pressed: true })).toBeVisible();
    await expectNoViolations(page);

    await answerAll(page);
    await expect(page.getByRole('button', { name: 'Recommencer' })).toBeVisible();
    await expectNoViolations(page);
  });
}

/** Le résultat avec des produits à l'écran : rien ne se vérifie sur un résultat sans exemple. */
async function reachResultWithExamples(page: Page, keys = KEYS_WITH_TEA) {
  await page.goto('/');
  await page.getByRole('button', { name: 'Commencer' }).click();
  await answerAll(page, keys);
  await expect(
    page.getByRole('heading', { level: 1, name: /Vos réponses évoquent/ }),
  ).toBeFocused();
  await expect(page.locator('app-examples').first()).toBeVisible();
}

test('le résultat montre des exemples sur Amazon, avec la mention d’affiliation une seule fois', async ({
  page,
}) => {
  await reachResultWithExamples(page);
  const links = page.locator('app-examples a');
  expect(await links.count()).toBeGreaterThan(0);
  for (const link of await links.all()) {
    await expect(link).toHaveAttribute(
      'href',
      /^https:\/\/www\.amazon\.fr\/dp\/[A-Z0-9]{10}\?tag=phamelin-21$/,
    );
    await expect(link).toHaveAttribute('rel', /sponsored/);
    await expect(link).toHaveAttribute('target', '_blank');
  }
  await expect(page.getByText('Exemples sur Amazon').first()).toBeVisible();
  await expect(
    page.getByText('En tant que Partenaire Amazon, je réalise un bénéfice', { exact: false }),
  ).toHaveCount(1);
});

test('sans caféine, les exemples sont des infusions', async ({ page }) => {
  await reachResultWithExamples(page, KEYS_WITHOUT_CAFFEINE);
  const compositions = await page.locator('.app-examples__composition').allTextContents();
  expect(compositions.length).toBeGreaterThan(0);
  for (const composition of compositions) {
    expect(composition).not.toMatch(/camellia|(?<![\p{L}])th[ée](?![\p{L}])|\btea\b|matcha/iu);
  }
});

test('le résultat avec exemples ne déborde pas en largeur à 320 px', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await reachResultWithExamples(page);
  const width = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(width).toBeLessThanOrEqual(320);
  for (const link of await page.locator('app-examples a').all()) {
    const box = await link.boundingBox();
    expect(box!.height).toBeGreaterThanOrEqual(44);
    expect(box!.x + box!.width).toBeLessThanOrEqual(320);
  }
});

for (const theme of ['light', 'dark'] as const) {
  test(`axe (WCAG 2.2 AA) sur le résultat avec exemples, thème ${theme}`, async ({ page }) => {
    if (theme === 'dark') {
      await page.addInitScript(() => localStorage.setItem('fuda-theme', 'dark'));
    }
    await reachResultWithExamples(page);
    await expect(page.locator('app-examples a').first()).toBeVisible();
    await expectNoViolations(page);
  });
}
