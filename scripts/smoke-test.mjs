/**
 * Browser smoke test of the production build (run by the CI after `npm run build`).
 * Starts `vite preview`, drives Chromium through the main workflows and fails on any
 * console error. Screenshots are written to smoke-screenshots/.
 *
 *   npm run build && npm run smoke
 */
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { chromium } from 'playwright';

const PORT = 4173;
const BASE = process.env.BASE_PATH ?? (process.env.GITHUB_ACTIONS ? '/FFR-PRESTO/' : '/');
const URL = `http://localhost:${PORT}${BASE}`;
const SHOTS = 'smoke-screenshots';
mkdirSync(SHOTS, { recursive: true });

const server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], { stdio: 'inherit', shell: process.platform === 'win32' });
const stop = () => server.kill('SIGTERM');

async function waitForServer() {
  for (let i = 0; i < 60; i += 1) {
    try {
      const res = await fetch(URL);
      if (res.ok) return;
    } catch {
      // not ready yet
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`Serveur de prévisualisation injoignable : ${URL}`);
}

const steps = [];
function step(name) {
  steps.push(name);
  console.log(`▶ ${name}`);
}

let browser;
try {
  await waitForServer();
  browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1366, height: 900 }, locale: 'fr-FR' });
  const errors = [];
  page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', (err) => errors.push(err.message));
  page.on('dialog', (dialog) => dialog.accept());
  const expectText = async (text) => page.getByText(text, { exact: false }).first().waitFor({ timeout: 5000 });

  step('Tableau de bord accessible');
  await page.goto(URL);
  await page.getByRole('heading', { name: 'Tableau de bord' }).waitFor();
  await expectText('Aucun chiffrage enregistré');
  await page.screenshot({ path: `${SHOTS}/01-tableau-de-bord-vide.png`, fullPage: true });

  step('Nouveau chiffrage : informations générales');
  await page.getByRole('button', { name: 'Nouveau chiffrage' }).click();
  await page.getByLabel('Nom du projet').fill('Essai automatique');
  await page.getByLabel('Référence du chiffrage').fill('SMOKE-001');
  await page.getByRole('button', { name: 'Étape suivante' }).click();

  step('Composition : 11 types proposés, préremplissage Int 003');
  await page.getByLabel('Partir d’une position du dossier FFR Presto (facultatif)').waitFor();
  const radios = await page.getByRole('radiogroup', { name: 'Type de composition' }).getByRole('radio').count();
  if (radios !== 11) throw new Error(`11 compositions attendues, ${radios} trouvées`);
  await page.getByLabel('Partir d’une position du dossier FFR Presto (facultatif)').selectOption('Int 003');
  await page.screenshot({ path: `${SHOTS}/02-composition.png`, fullPage: true });
  await page.getByRole('button', { name: 'Étape suivante' }).click();

  step('Dimensions : champs selon la composition, schéma SVG, vantail calculé');
  await page.getByLabel('Largeur de la partie latérale droite').waitFor();
  if (await page.getByLabel('Largeur de la partie latérale gauche').count()) throw new Error('Champ latéral gauche affiché à tort');
  const leaf = await page.getByLabel('Largeur du vantail principal').inputValue();
  if (leaf !== '993') throw new Error(`Largeur de vantail calculée attendue 993, obtenue ${leaf}`);
  await page.locator('svg.preview__svg').waitFor();
  await page.screenshot({ path: `${SHOTS}/03-dimensions.png`, fullPage: true });
  await page.getByRole('button', { name: 'Étape suivante' }).click();

  step('Options techniques');
  await expectText('Listes provisoires');
  await page.getByRole('button', { name: 'Étape suivante' }).click();

  step('Récapitulatif : position de référence, liste de débit, prix non disponibles');
  await expectText('Int 003 (dossier FFR Presto)');
  await expectText('P-DOR-07');
  await expectText('Prix non disponible');
  await page.screenshot({ path: `${SHOTS}/04-recapitulatif.png`, fullPage: true });

  step('Enregistrement local');
  await page.getByRole('button', { name: 'Enregistrer le chiffrage' }).click();
  await page.getByRole('heading', { name: 'Chiffrage — Essai automatique' }).waitFor();
  const quoteUrl = page.url();
  if (quoteUrl.endsWith('/nouveau')) throw new Error('Le chiffrage n’a pas été enregistré');

  step('Liste de débit du chiffrage');
  await page.getByRole('link', { name: 'Voir la liste de débit' }).click();
  await page.getByRole('heading', { name: 'Liste de débit matière' }).waitFor();
  await expectText('32.803');
  await page.screenshot({ path: `${SHOTS}/05-liste-de-debit.png`, fullPage: true });

  step('Tableau de bord : ouvrir, dupliquer, supprimer');
  await page.getByRole('link', { name: 'Tableau de bord', exact: true }).click();
  await page.getByRole('link', { name: 'Essai automatique', exact: true }).waitFor();
  await expectText('Calculé');
  await page.getByRole('button', { name: 'Dupliquer Essai automatique', exact: true }).click();
  await page.getByRole('link', { name: 'Essai automatique (copie)', exact: true }).waitFor();
  await page.getByRole('button', { name: 'Supprimer Essai automatique (copie)', exact: true }).click();
  await page.getByRole('link', { name: 'Essai automatique (copie)', exact: true }).waitFor({ state: 'detached' });
  await page.screenshot({ path: `${SHOTS}/06-tableau-de-bord.png`, fullPage: true });
  await page.goto(quoteUrl);
  await page.getByRole('heading', { name: 'Chiffrage — Essai automatique' }).waitFor();

  step('Persistance après rechargement');
  await page.reload();
  await page.getByRole('heading', { name: 'Chiffrage — Essai automatique' }).waitFor();

  step('Import : aperçu d’un fichier CSV');
  await page.getByRole('link', { name: 'Import des données', exact: true }).click();
  writeFileSync(`${SHOTS}/exemple.csv`, 'Référence,Désignation,Prix\nDEMO-1,Donnée de démonstration,0\n');
  await page.getByLabel('Fichier (.xlsx, .xls, .ods, .csv)').setInputFiles(`${SHOTS}/exemple.csv`);
  await expectText('Aperçu des premières lignes');
  await expectText('DEMO-1');
  await page.screenshot({ path: `${SHOTS}/07-import.png`, fullPage: true });

  step('Règles de calcul');
  await page.getByRole('link', { name: 'Règles de calcul', exact: true }).click();
  await expectText('P-ACC-01');
  await page.screenshot({ path: `${SHOTS}/08-regles.png`, fullPage: true });

  if (errors.length > 0) throw new Error(`Erreurs console :\n${errors.join('\n')}`);
  console.log(`✔ Test de fumée réussi (${steps.length} étapes)`);
} catch (error) {
  console.error(`✖ Échec à l’étape « ${steps.at(-1) ?? 'démarrage'} » :`, error);
  process.exitCode = 1;
} finally {
  await browser?.close();
  stop();
}
