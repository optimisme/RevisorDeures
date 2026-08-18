const { test, expect } = require('@playwright/test');
const { request } = require('playwright');

function createAPI() {
  return request.newContext({ baseURL: 'http://localhost:3000', timeout: 15000 });
}

function parseCookies(setCookieStr) {
  const cookies = {};
  if (!setCookieStr) return cookies;
  const parts = setCookieStr.split(';');
  const [nameValue] = parts;
  const [name, value] = nameValue.trim().split('=');
  if (name) cookies[name] = value;
  return cookies;
}

async function loginAs(api, user, pass) {
  const res = await api.post('/api/auth/login', {
    data: { usuari: user, password: pass }
  });
  expect(res.status()).toBe(200);
  return parseCookies(res.headers()['set-cookie']);
}

function setCookie(page, cookieObj) {
  const entries = Object.entries(cookieObj);
  return page.context().addCookies(entries.map(([name, value]) => ({
    name, value, domain: 'localhost', path: '/'
  })));
}

async function setupAdmin() {
  const api = await createAPI();
  const adminCookies = await loginAs(api, 'admin', 'admin123');
  return { api, cookies: adminCookies };
}

test.describe('Pàgina principal d\'Administració', () => {
  test('es pot obrir /admin amb sessió', async ({ page }) => {
    const { api, cookies } = await setupAdmin();
    await setCookie(page, cookies);
    await api.dispose();
    
    await page.goto('/admin');
    await expect(page.locator('h1')).toContainText('RevisorDeures');
  });

  test('mostra targetes de navegació', async ({ page }) => {
    const { api, cookies } = await setupAdmin();
    await setCookie(page, cookies);
    await api.dispose();
    
    await page.goto('/admin');
    
    const cards = page.locator('.card');
    await expect(cards).toHaveCount(3);
    
    const titols = await cards.allTextContents();
    const textos = titols.join(' ').toLowerCase();
    expect(textos).toContain('alumnes');
    expect(textos).toContain('pràctiques');
    expect(textos).toContain('entregues');
  });

  test('targeta Gestió d\'Alumnes redirigeix correctament', async ({ page }) => {
    const { api, cookies } = await setupAdmin();
    await setCookie(page, cookies);
    await api.dispose();
    
    await page.goto('/admin');
    await page.click('a[href="/admin/alumnes"]');
    await expect(page.locator('h1')).toContainText('Gestió d\'Alumnes');
  });

  test('targeta Gestió de Pràctiques redirigeix correctament', async ({ page }) => {
    const { api, cookies } = await setupAdmin();
    await setCookie(page, cookies);
    await api.dispose();
    
    await page.goto('/admin');
    await page.click('a[href="/admin/practiques"]');
    await expect(page.locator('h1')).toContainText('Gestió de Pràctiques');
  });

  test('targeta Consulta d\'Entregues redirigeix correctament', async ({ page }) => {
    const { api, cookies } = await setupAdmin();
    await setCookie(page, cookies);
    await api.dispose();
    
    await page.goto('/admin');
    await page.click('a[href="/admin/entregues"]');
    await expect(page.locator('h1')).toContainText('Entregues');
  });

  test('redirigeix a / si no està loguejat', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForTimeout(500);
    expect(page.url().endsWith('/')).toBeTruthy();
  });

  test('botó logout destrueix sessió i redirigeix', async ({ page }) => {
    const { api, cookies } = await setupAdmin();
    await setCookie(page, cookies);
    await api.dispose();
    
    await page.goto('/admin');
    
    await page.locator('#logoutBtn').click();
    await page.waitForTimeout(500);
    
    expect(page.url().endsWith('/')).toBeTruthy();
  });
});
