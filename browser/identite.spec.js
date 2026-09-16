import { test, expect } from '@playwright/test';
/* global localStorage -- callbacks exécutés dans la page */

// Tests rouges SPEC critères 1 à 5 — identité de Cuity (navigateur).
// Crit.1 nom, Crit.2 emoji, Crit.3 accueil, Crit.4 suggestions, Crit.5 réponses signées.

const ACCUEIL = 'Bonjour, je suis Cuity 👩‍🍳. Posez-moi vos questions sur la cuisine anti-gaspi !';

const SUGGESTIONS = [
  "J'ai faim, propose-moi des recettes anti-gaspi",
  "J'ai du Penicillium sur mon fromage, puis-je encore le manger ?",
  'Mes bananes sont noires, quelles recettes puis-je faire ?',
];

function surveiller(page) {
  const erreurs = [];
  page.on('pageerror', (e) => erreurs.push(e.message));
  return erreurs;
}

async function pageNeuve(page) {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
}

async function envoyer(page, texte) {
  await page.locator('#message').fill(texte);
  await page.getByRole('button', { name: /envoyer/i }).click();
}

const lignes = (page) => page.locator('#messages li');
const accueil = (page) => page.getByText(ACCUEIL, { exact: true });
const suggestions = (page) => page.locator('#suggestions button');

test.describe('SPEC 1 — Nom', () => {
  test('B1 — le titre principal affiche Cuity', async ({ page }) => {
    await pageNeuve(page);
    await expect(page.locator('h1')).toContainText('Cuity');
  });

  test('B2 — le nom Cuity fait entre 2 et 20 caractères', async ({ page }) => {
    await pageNeuve(page);
    const titre = await page.locator('h1').textContent();
    expect(titre).toContain('Cuity');
    expect('Cuity'.length).toBeGreaterThanOrEqual(2);
    expect('Cuity'.length).toBeLessThanOrEqual(20);
  });
});

test.describe('SPEC 2 — Emoji', () => {
  test('B3 — l’emoji est visible à côté du nom dans le header', async ({ page }) => {
    await pageNeuve(page);
    await expect(page.locator('header')).toContainText('👩‍🍳');
    await expect(page.locator('header')).toContainText('Cuity');
  });
});

test.describe('SPEC 3 — Accueil', () => {
  test('B4 — conversation vide : message d’accueil exact affiché', async ({ page }) => {
    await pageNeuve(page);
    await expect(lignes(page)).toHaveCount(0);
    await expect(accueil(page)).toBeVisible();
  });

  test('B5 — l’accueil n’est pas ajouté dans #messages', async ({ page }) => {
    await pageNeuve(page);
    await expect(lignes(page)).toHaveCount(0);
    await expect(accueil(page)).toBeVisible();
    await expect(page.locator('#messages')).not.toContainText(ACCUEIL);
  });

  test('B6 — l’accueil disparaît dès le premier message envoyé', async ({ page }) => {
    await pageNeuve(page);
    await expect(accueil(page)).toBeVisible();
    await envoyer(page, 'salut');
    await expect(lignes(page)).toHaveCount(2);
    await expect(accueil(page)).toBeHidden();
  });

  test('B7 — l’accueil réapparaît quand la conversation est effacée', async ({ page }) => {
    await pageNeuve(page);
    await envoyer(page, 'salut');
    await expect(lignes(page)).toHaveCount(2);
    page.once('dialog', (d) => d.accept());
    await page.locator('#effacer').click();
    await expect(lignes(page)).toHaveCount(0);
    await expect(accueil(page)).toBeVisible();
  });
});

test.describe('SPEC 4 — Suggestions', () => {
  test('B8 — exactement les trois questions attendues, dans l’ordre', async ({ page }) => {
    await pageNeuve(page);
    await expect(suggestions(page)).toHaveCount(3);
    for (let i = 0; i < SUGGESTIONS.length; i += 1) {
      await expect(suggestions(page).nth(i)).toHaveText(SUGGESTIONS[i]);
    }
  });

  test('B9 — cliquer remplit le champ sans envoyer', async ({ page }) => {
    for (let i = 0; i < SUGGESTIONS.length; i += 1) {
      await pageNeuve(page);
      await expect(suggestions(page)).toHaveCount(3);
      await suggestions(page).nth(i).click();
      await expect(page.locator('#message')).toHaveValue(SUGGESTIONS[i]);
      await expect(lignes(page)).toHaveCount(0);
    }
  });
});

test.describe('SPEC 5 — Réponses signées (UI)', () => {
  test('B10 — chaque réponse de l’assistant commence par Cuity', async ({ page }) => {
    const erreurs = surveiller(page);
    await pageNeuve(page);
    await envoyer(page, 'salut');
    await expect(lignes(page)).toHaveCount(2);
    const premiere = (await lignes(page).nth(1).textContent()) ?? '';
    expect(premiere.trim().startsWith('Cuity')).toBe(true);

    await envoyer(page, 'parle-moi de la météo');
    await expect(lignes(page)).toHaveCount(4);
    const seconde = (await lignes(page).nth(3).textContent()) ?? '';
    expect(seconde.trim().startsWith('Cuity')).toBe(true);
    expect(erreurs).toHaveLength(0);
  });
});
