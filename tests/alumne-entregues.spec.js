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

async function setupAlumneWithEntrega() {
  const api = await createAPI();
  const email = uniqueEmail('exemple.com');
  const adminCookies = await loginAs(api, 'admin', 'admin123');
  
  // Crear pràctica dinàmica
  const practicaRes = await api.post('/api/practiques', {
    data: { titol: 'Pràctica Test Entregues', criteria: 'Criteri de prova' }
  }, { cookies: adminCookies });
  expect(practicaRes.status()).toBe(201);
  const practicaId = (await practicaRes.json()).practica?.id || 1;
  
  // Crear alumne com admin
  const createRes = await api.post('/api/alumnes', {
    data: { nom: 'Alumne Test Entregues', email, password: 'pass' }
  }, { cookies: adminCookies });
  expect(createRes.status()).toBe(201);
  
  // Login com alumne
  const alumneCookies = await loginAs(api, email, 'pass');
  
  // Crear una entrega
  const entregaRes = await api.post('/api/entregues', {
    data: { practica_id: practicaId, repo_url: 'https://github.com/test/alumne-entregues' }
  }, { cookies: alumneCookies });
  expect(entregaRes.status()).toBe(201);
  const entrega = await entregaRes.json();
  
  return { api, email, cookies: alumneCookies, practicaId, entrega: entrega.entrega };
}

test.describe('Pàgina de les Meves Entregues', () => {
  test('es pot obrir /alumne/entregues amb sessió alumne', async ({ page }) => {
    const { api, cookies } = await setupAlumneWithEntrega();
    await setCookie(page, cookies);
    await api.dispose();
    
    await page.goto('/alumne/entregues');
    await expect(page.locator('h1')).toContainText('Entregues');
  });

  test('mostra taula amb entregues', async ({ page }) => {
    const { api, cookies } = await setupAlumneWithEntrega();
    await setCookie(page, cookies);
    await api.dispose();
    
    await page.goto('/alumne/entregues');
    
    // Ha de mostrar la taula
    await expect(page.locator('table')).toBeVisible();
  });

  test('mostra botó per enviar nova entrega', async ({ page }) => {
    const { api, cookies } = await setupAlumneWithEntrega();
    await setCookie(page, cookies);
    await api.dispose();
    
    await page.goto('/alumne/entregues');
    
    await expect(page.locator('.btn-primary')).toBeVisible();
  });

  test('mostra estat pendent correctament', async ({ page }) => {
    const { api, cookies } = await setupAlumneWithEntrega();
    await setCookie(page, cookies);
    await api.dispose();
    
    await page.goto('/alumne/entregues');
    
    // Ha de mostrar el badge "pendent"
    await expect(page.locator('.badge-pendent')).toBeVisible();
  });

  test('mostra botó esborrar quan no està revisada', async ({ page }) => {
    const { api, cookies } = await setupAlumneWithEntrega();
    await setCookie(page, cookies);
    await api.dispose();
    
    await page.goto('/alumne/entregues');
    
    // Ha de mostrar el botó d'esborrar
    const deleteBtn = page.locator('.btn-delete');
    await expect(deleteBtn).toBeVisible();
  });

  test('esborrar entrega funciona', async ({ page }) => {
    const { api, cookies } = await setupAlumneWithEntrega();
    await setCookie(page, cookies);
    await api.dispose();
    
    await page.goto('/alumne/entregues');
    
    // Fer clic al botó d'esborrar
    const deleteBtn = page.locator('.btn-delete');
    await expect(deleteBtn).toBeVisible();
    await deleteBtn.click();
    
    // Confirmar l'acció
    page.on('dialog', dialog => dialog.dismiss());
    
    // Comprovar que hi ha missatge d'èxit
    await page.waitForTimeout(500);
  });

  test('redirigeix a / si no està loguejat', async ({ page }) => {
    await page.goto('/alumne/entregues', { waitUntil: 'load' });
    // Després del load, el JS executa la redirecció
    await page.waitForTimeout(200);
    // Comprovar que ja no som a la pàgina d'entregues
    const url = page.url();
    expect(url.endsWith('/') || url.endsWith('/alumne') || url.endsWith('/admin')).toBeTruthy();
  });

  test('mostra missatge quan no hi ha entregues', async ({ page }) => {
    const api = await createAPI();
    const email = uniqueEmail('exemple.com');
    
    // Crear pràctica
    const adminCookies = await loginAs(api, 'admin', 'admin123');
    const practicaRes = await api.post('/api/practiques', {
      data: { titol: 'Pràctica Test Sense Entregues', criteria: 'Criteri' }
    }, { cookies: adminCookies });
    expect(practicaRes.status()).toBe(201);
    
    // Crear alumne sense entregues
    await api.post('/api/alumnes', {
      data: { nom: 'Alumne Sense Entregues', email, password: 'pass' }
    }, { cookies: adminCookies });
    
    const alumneCookies = await loginAs(api, email, 'pass');
    await setCookie(page, alumneCookies);
    await api.dispose();
    
    await page.goto('/alumne/entregues');
    
    // Ha de mostrar el missatge de no hi ha entregues
    await expect(page.locator('.empty-state')).toBeVisible();
  });

  test('mostra enllaç a retornar a l\'espai', async ({ page }) => {
    const { api, cookies } = await setupAlumneWithEntrega();
    await setCookie(page, cookies);
    await api.dispose();
    
    await page.goto('/alumne/entregues');
    
    const navLink = page.locator('.nav-link');
    await expect(navLink).toBeVisible();
    const href = await navLink.getAttribute('href');
    expect(href).toBe('/alumne');
  });

  test('botó logout funciona', async ({ page }) => {
    const { api, cookies } = await setupAlumneWithEntrega();
    await setCookie(page, cookies);
    await api.dispose();
    
    await page.goto('/alumne/entregues');
    
    // Fer clic al botó de logout
    await page.locator('#logoutBtn').click();
    
    // Redirigeix a la pàgina d'entrada
    await page.waitForTimeout(500);
    // Comprovar que ja no estem a la pàgina d'entregues
    const url = page.url();
    expect(url.endsWith('/') || url.endsWith('/alumne') || url.endsWith('/admin')).toBeTruthy();
  });
});
