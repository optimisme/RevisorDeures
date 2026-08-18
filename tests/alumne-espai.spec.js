const { test, expect } = require('@playwright/test');
const { request } = require('playwright');

function createAPI() {
  return request.newContext({ baseURL: 'http://localhost:3000', timeout: 15000 });
}

function uniqueEmail(base) {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}@${base}`;
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

async function setupAlumne() {
  const api = await createAPI();
  const email = uniqueEmail('exemple.com');
  
  // Login com admin per crear alumne
  const adminCookies = await loginAs(api, 'admin', 'admin123');
  
  // Crear alumne com admin (amb cookies d'admin)
  await api.post('/api/alumnes', {
    data: { nom: 'Alumne Test Espai', email, password: 'pass' }
  }, { cookies: adminCookies });
  
  // Login com alumne
  const alumneCookies = await loginAs(api, email, 'pass');
  
  return { api, email, cookies: alumneCookies };
}

test.describe('Pàgina de l\'Espai Personal de l\'Alumne', () => {
  test('es pot obrir /alumne amb sessió', async ({ page }) => {
    const { api, cookies } = await setupAlumne();
    await setCookie(page, cookies);
    await api.dispose();
    
    await page.goto('/alumne');
    await expect(page.locator('h1')).toContainText('RevisorDeures');
  });

  test('mostra targetes de navegació', async ({ page }) => {
    const { api, cookies } = await setupAlumne();
    await setCookie(page, cookies);
    await api.dispose();
    
    await page.goto('/alumne');
    
    // Ha de mostrar les targetes
    const cards = page.locator('.card');
    await expect(cards.nth(0)).toBeVisible(); // Les meves Entregues
    await expect(cards.nth(1)).toBeVisible(); // Enviar Entrega
  });

  test('mostra botó de tancar sessió', async ({ page }) => {
    const { api, cookies } = await setupAlumne();
    await setCookie(page, cookies);
    await api.dispose();
    
    await page.goto('/alumne');
    await expect(page.locator('#logoutBtn')).toBeVisible();
  });

  test('redirigeix a / si no està loguejat', async ({ page }) => {
    await page.goto('/alumne');
    // El JS fa window.location.href = '/' quan no hi ha sessió
    // Esperem una mica i comprovem la URL final
    await page.waitForTimeout(500);
    const url = page.url();
    expect(url.endsWith('/')).toBeTruthy();
  });

  test('alumne pot accedir al seu espai amb API', async ({ page }) => {
    const api = await createAPI();
    const email = uniqueEmail('exemple.com');
    
    // Crear alumne com admin
    const adminCookies = await loginAs(api, 'admin', 'admin123');
    const createRes = await api.post('/api/alumnes', {
      data: { nom: 'Alumne Accés Directe', email, password: 'pass' }
    }, { cookies: adminCookies });
    expect(createRes.status()).toBe(201);
    
    // Login com alumne
    const alumneCookies = await loginAs(api, email, 'pass');
    const res = await api.get('/api/auth/session', { cookies: alumneCookies });
    expect(res.status()).toBe(200);
    const sessionData = await res.json();
    expect(sessionData.rol).toBe('alumne');
    
    // Verificar que un alumne NO pot llistar alumnes (403 esperat)
    const alumnesRes = await api.get('/api/alumnes', { cookies: alumneCookies });
    expect(alumnesRes.status()).toBe(403);
    
    await api.dispose();
  });
});
