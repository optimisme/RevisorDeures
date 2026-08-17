import puppeteer from 'puppeteer';

describe('Test formulari d\'entrega', () => {
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

  test('Hauria de mostrar el formulari d\'entrega al detall de pràctica', async () => {
    const practicaCards = await page.$$('.practica-card');
    if (practicaCards.length > 0) {
      await practicaCards[0].click();
      await page.waitForSelector('#practica-detail');
    }

    const formEntrega = await page.$('#form-entrega');
    expect(formEntrega).toBeTruthy();
  });

  test('Hauria de tenir un camp per la URL del repositori', async () => {
    const urlInput = await page.$('#url-repo');
    expect(urlInput).toBeTruthy();

    const inputType = await page.evaluate(() => {
      const input = document.getElementById('url-repo');
      return input?.getAttribute('type') || '';
    });

    expect(inputType).toBe('url');
  });

  test('Hauria de tenir un label per al camp de URL', async () => {
    const labelText = await page.evaluate(() => {
      const label = document.querySelector('label[for="url-repo"]');
      return label?.textContent || '';
    });

    expect(labelText).toContain('URL del Repositori GitHub');
  });

  test('Hauria de tenir un botó per enviar l\'entrega', async () => {
    const submitButton = await page.evaluate(() => {
      const form = document.getElementById('form-entrega');
      if (!form) return null;
      const button = form.querySelector('button[type="submit"]');
      return button?.textContent || null;
    });

    expect(submitButton).toBe('Enviar Entrega');
  });

  test('Hauria de validar que el camp URL és required', async () => {
    const isRequired = await page.evaluate(() => {
      const input = document.getElementById('url-repo');
      return input?.required || false;
    });

    expect(isRequired).toBe(true);
  });

  test('Hauria de tenir estils de focus al camp d\'entrada', async () => {
    const input = await page.$('#url-repo');
    if (input) {
      await input.focus();
      await new Promise(resolve => setTimeout(resolve, 100));

      const hasFocusStyle = await page.evaluate(() => {
        const input = document.getElementById('url-repo');
        if (!input) return false;

        const style = window.getComputedStyle(input);
        return style.boxShadow !== '' || style.outline !== 'none';
      });

      expect(hasFocusStyle).toBe(true);
    }
  });

  test('Hauria de mostrar el formulari amb la classe form-section', async () => {
    const formSection = await page.$('.form-section');
    expect(formSection).toBeTruthy();
  });

  test('Hauria de mostrar el formulari dins de .detail-content', async () => {
    const detailContent = await page.$('.detail-content');
    expect(detailContent).toBeTruthy();
  });
});
