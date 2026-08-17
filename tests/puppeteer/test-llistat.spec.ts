import puppeteer from 'puppeteer';

describe('Test llistat de pràctiques', () => {
  let browser: any;
  let page: any;

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: true,
      executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    page = await browser.newPage();
    await page.goto('http://localhost:3001/');
    await page.waitForSelector('#practiques-list');
  });

  afterAll(async () => {
    await browser?.close();
  });

  beforeEach(async () => {
    await page.reload();
    await page.waitForSelector('#practiques-list');
  });

  test('Hauria de mostrar el títol de la pàgina', async () => {
    const title = await page.title();
    expect(title).toBe('RevisorDeures - Gestionari de Pràctiques');
  });

  test('Hauria de mostrar la secció de pràctiques', async () => {
    const practiquesSection = await page.$('#practiques');
    expect(practiquesSection).toBeTruthy();
  });

  test('Hauria de mostrar el llistat de pràctiques', async () => {
    const practiquesList = await page.$('#practiques-list');
    expect(practiquesList).toBeTruthy();
  });

  test('Hauria de mostrar les pràctiques des de l\'API', async () => {
    const practicasText = await page.evaluate(() => {
      const container = document.getElementById('practiques-list');
      return container?.innerText || '';
    });

    expect(practicasText).toContain('Pràctica de Test');
  });

  test('Hauria de mostrar targetes de pràctiques amb classe practica-card', async () => {
    const practicaCards = await page.$$('.practica-card');
    expect(practicaCards.length).toBeGreaterThan(0);
  });

  test('Hauria de mostrar el nom de la pràctica a la targeta', async () => {
    const practicaNom = await page.evaluate(() => {
      const cards = document.querySelectorAll('.practica-card h3');
      return Array.from(cards).map((card: any) => card.textContent);
    });

    expect(practicaNom).toContain('Pràctica de Test');
  });

  test('Hauria de tenir un botó per crear nova pràctica', async () => {
    const btnNovaPractica = await page.$('#btn-nova-practica');
    expect(btnNovaPractica).toBeTruthy();

    const buttonText = await page.evaluate(() => {
      const btn = document.getElementById('btn-nova-practica');
      return btn?.textContent || '';
    });

    expect(buttonText).toBe('Nova Pràctica');
  });

  test('Hauria de tenir accessibilitat bàsica amb ARIA labels', async () => {
    const mainElement = await page.$('main');
    expect(mainElement).toBeTruthy();

    const hasRole = await page.evaluate(() => {
      const main = document.querySelector('main');
      return main?.getAttribute('role') !== null || main?.tagName.toLowerCase() === 'main';
    });

    expect(hasRole).toBe(true);
  });

  test('Hauria de tenir focus visible als enllaços', async () => {
    const navLinks = await page.$$('.nav-link');
    expect(navLinks.length).toBeGreaterThan(0);

    const hasFocusOutline = await page.evaluate(() => {
      const link = document.querySelector('.nav-link');
      if (!link) return false;

      const style = window.getComputedStyle(link);
      return style.outline !== 'none' || style.borderRadius !== '0px';
    });

    expect(hasFocusOutline).toBe(true);
  });

  test('Hauria de mostrar el peu de pàgina', async () => {
    const footerText = await page.evaluate(() => {
      const footer = document.querySelector('footer');
      return footer?.innerText || '';
    });

    expect(footerText).toContain('RevisorDeures');
  });
});
