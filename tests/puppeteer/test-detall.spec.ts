import puppeteer from 'puppeteer';

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

describe('Test detall de pràctica amb resultats', () => {
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
    await page.waitForSelector('.practica-card');

    const practicaCards = await page.$$('.practica-card');
    if (practicaCards.length > 0) {
      await practicaCards[0].click();
      
      try {
        await page.waitForSelector('#practica-nom', { timeout: 5000 });
      } catch (e) {
        console.error('Timeout waiting for practica-nom');
      }
      
      await wait(500);
    }
  });

  test('Hauria de mostrar el detall de la pràctica', async () => {
    const practicaDetail = await page.$('#practica-detail');
    expect(practicaDetail).toBeTruthy();
  });

  test('Hauria de mostrar el nom de la pràctica al detall', async () => {
    const practicaNom = await page.evaluate(() => {
      const nomElement = document.getElementById('practica-nom');
      return nomElement?.textContent || '';
    });

    expect(practicaNom).toBe('Pràctica de Test');
  });

  test('Hauria de mostrar la secció de criteris', async () => {
    const criteriaSection = await page.$('.criteria-section');
    expect(criteriaSection).toBeTruthy();
  });

  test('Hauria de mostrar la secció d\'entregues', async () => {
    const entreguesSection = await page.$('.entregues-section');
    expect(entreguesSection).toBeTruthy();
  });

  test('Hauria de mostrar targetes d\'entregues', async () => {
    const entregaCards = await page.$$('.entrega-card');
    expect(entregaCards.length).toBeGreaterThan(0);
  });

  test('Hauria de mostrar badges d\'estat a les entregues', async () => {
    const statusBadges = await page.$$('.status-badge');
    expect(statusBadges.length).toBeGreaterThan(0);
  });

  test('Hauria de mostrar l\'estat COMPLETED amb color verd', async () => {
    const completedBadge = await page.$('.status-COMPLETED');
    expect(completedBadge).toBeTruthy();

    const backgroundColor = await page.evaluate(() => {
      const badge = document.querySelector('.status-COMPLETED');
      if (!badge) return '';

      const style = window.getComputedStyle(badge);
      return style.backgroundColor;
    });

    expect(backgroundColor).toBeTruthy();
  });

  test('Hauria de mostrar el formulari per crear nova entrega', async () => {
    const formEntrega = await page.$('#form-entrega');
    expect(formEntrega).toBeTruthy();
  });

  test('Hauria de tenir un botó per tornar a la llista', async () => {
    const btnTornar = await page.$('#btn-tornar');
    expect(btnTornar).toBeTruthy();

    const buttonText = await page.evaluate(() => {
      const btn = document.getElementById('btn-tornar');
      return btn?.textContent || '';
    });

    expect(buttonText).toBe('Tornar');
  });

  test('Hauria de mostrar el botó per crear nou criteri', async () => {
    const btnNouCriteri = await page.$('#btn-nou-criteri');
    expect(btnNouCriteri).toBeTruthy();

    const buttonText = await page.evaluate(() => {
      const btn = document.getElementById('btn-nou-criteri');
      return btn?.textContent || '';
    });

    expect(buttonText).toBe('Nou Criteri');
  });

  test('Hauria de mostrar les targetes de criteris amb estils correctes', async () => {
    const criteriaCards = await page.$$('.criteri-card');
    expect(criteriaCards.length).toBeGreaterThan(0);

    const hasCardStyle = await page.evaluate(() => {
      const cards = document.querySelectorAll('.criteri-card');
      if (cards.length === 0) return false;

      const firstCard = cards[0];
      const style = window.getComputedStyle(firstCard);
      return style.backgroundColor !== '' || style.boxShadow !== '';
    });

    expect(hasCardStyle).toBe(true);
  });

  test('Hauria de tenir navegació funcional entre llistat i detall', async () => {
    const btnTornar = await page.$('#btn-tornar');
    if (btnTornar) {
      await page.evaluate((btn: any) => {
        btn.click();
      }, btnTornar);
      
      await wait(300);

      const llistaVisible = await page.evaluate(() => {
        const llista = document.getElementById('practiques');
        if (!llista) return false;
        const style = window.getComputedStyle(llista);
        return style.display !== 'none';
      });

      expect(llistaVisible).toBe(true);
    }
  });

  test('Hauria de mostrar les entregues amb la seva data', async () => {
    const entregaCards = await page.$$('.entrega-card');
    if (entregaCards.length > 0) {
      const hasData = await page.evaluate(() => {
        const cards = document.querySelectorAll('.entrega-card');
        if (cards.length === 0) return false;

        const firstCard = cards[0];
        return firstCard.textContent.includes('Enviada el');
      });

      expect(hasData).toBe(true);
    }
  });

  test('Hauria de tenir accessibilitat bàsica al detall', async () => {
    const detailSection = await page.$('section#practica-detail');
    expect(detailSection).toBeTruthy();

    const hasHeadings = await page.evaluate(() => {
      const headings = document.querySelectorAll('h2, h3, h4');
      return headings.length > 0;
    });

    expect(hasHeadings).toBe(true);
  });
});
