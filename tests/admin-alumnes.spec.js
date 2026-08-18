const { test, expect } = require('@playwright/test');
const { request } = require('playwright');

function createAPI() {
  return request.newContext({ baseURL: 'http://localhost:3000', timeout: 10000 });
}

function uniqueEmail(base) {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}@${base}`;
}

async function loginAs(api, user, pass) {
  const res = await api.post('/api/auth/login', {
    data: { usuari: user, password: pass }
  });
  expect(res.status()).toBe(200);
  return res.headers()['set-cookie'];
}

function setCookie(page, cookieStr) {
  const [nameValue] = cookieStr.split(';');
  const [name, value] = nameValue.trim().split('=');
  return page.context().addCookies([{
    name, value, domain: 'localhost', path: '/'
  }]);
}

test.describe('Pàgina de Gestió d\'Alumnes', () => {
  test('es pot obrir /admin/alumnes amb sessió admin', async ({ page }) => {
    const api = await createAPI();
    const cookieStr = await loginAs(api, 'admin', 'admin123');
    await setCookie(page, cookieStr);
    await api.dispose();
    
    await page.goto('/admin/alumnes');
    await expect(page.locator('h1')).toContainText('Gestió');
  });

  test('mostra botó + Afegir Alumne', async ({ page }) => {
    const api = await createAPI();
    const cookieStr = await loginAs(api, 'admin', 'admin123');
    await setCookie(page, cookieStr);
    await api.dispose();
    
    await page.goto('/admin/alumnes');
    await expect(page.locator('#addBtn')).toBeVisible();
  });

  test('mostra taula d\'alumnes', async ({ page }) => {
    const api = await createAPI();
    const cookies = await loginAs(api, 'admin', 'admin123');
    
    const email1 = uniqueEmail('exemple.com');
    const email2 = uniqueEmail('exemple.com');
    
    // Crear 2 alumnes amb emails únics
    await api.post('/api/alumnes', {
      data: { nom: 'Joan Test', email: email1, password: 'pass' }
    });
    await api.post('/api/alumnes', {
      data: { nom: 'Maria Test', email: email2, password: 'pass' }
    });
    
    await api.dispose();
    
    await setCookie(page, cookies);
    await page.goto('/admin/alumnes');
    await page.waitForTimeout(500);
    
    // Ha de mostrar la taula amb files
    await expect(page.locator('table')).toBeVisible();
    // Les files es generen dinàmicament
    const rows = await page.locator('table tr').count();
    expect(rows).toBeGreaterThan(1);
  });

  test('alumne no pot accedir amb API', async ({ page }) => {
    const api = await createAPI();
    
    // Crear alumne com admin
    const adminCookies = await loginAs(api, 'admin', 'admin123');
    const email = uniqueEmail('exemple.com');
    const createRes = await api.post('/api/alumnes', {
      data: { nom: 'Alumne Visual', email, password: 'pass' }
    });
    expect(createRes.status()).toBe(201);
    await api.dispose();
    
    // Login com alumne
    const api2 = await createAPI();
    const alumneCookie = await loginAs(api2, email, 'pass');
    
    // Intentar accedir a API d'alumnes
    const res = await api2.post('/api/alumnes', {
      data: { nom: 'Altre', email: uniqueEmail('exemple.com'), password: 'pass' }
    });
    expect(res.status()).toBe(403);
    
    await api2.dispose();
  });
});
