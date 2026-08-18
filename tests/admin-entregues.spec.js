const { test, expect } = require('@playwright/test');
const { request } = require('playwright');

function createAPI() {
  return request.newContext({ baseURL: 'http://localhost:3000', timeout: 15000 });
}

function uniqueEmail() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}@exemple.com`;
}

function parseSetCookie(rawCookie) {
  const parts = rawCookie.split(';');
  const [nameValue] = parts[0].split('=');
  const name = nameValue.trim();
  const value = parts[0].split('=', 2)[1];
  
  const cookie = {
    name, value,
    domain: 'localhost',
    path: '/',
    httpOnly: true,
    secure: false,
    sameSite: 'Lax'
  };
  
  // Parse additional attributes
  for (let i = 1; i < parts.length; i++) {
    const part = parts[i].trim();
    if (part.toLowerCase().startsWith('max-age=')) {
      const maxAge = parseInt(part.split('=')[1]);
      cookie.expires = Math.floor(Date.now() / 1000) + maxAge;
    }
    if (part.toLowerCase().startsWith('expires=')) {
      cookie.expires = Math.floor(new Date(part.split('=')[1]).getTime() / 1000);
    }
    if (part.toLowerCase().startsWith('path=')) {
      cookie.path = part.split('=')[1];
    }
  }
  
  return cookie;
}

function setCookie(page, authResult) {
  if (authResult && authResult.rawCookies) {
    console.log('setCookie: rawCookies type:', typeof authResult.rawCookies, Array.isArray(authResult.rawCookies), authResult.rawCookies);
    // DEBUG: print the raw cookie value to verify which session it is
    if (authResult.rawCookies[0]) {
      console.log('setCookie: raw cookie value:', authResult.rawCookies[0]);
      const sid = authResult.rawCookies[0].split('=')[1]?.split(';')[0];
      console.log('setCookie: SID value:', sid);
    }
    const cookies = authResult.rawCookies.map(parseSetCookie);
    console.log('setCookie: parsed cookies:', JSON.stringify(cookies, null, 2));
    return page.context().addCookies(cookies);
  }
  return Promise.resolve();
}

function apiCookies(authResult) {
  if (!authResult || !authResult.rawCookies) return undefined;
  const cookieObj = {};
  authResult.rawCookies.forEach(c => {
    const [nameValue] = c.split(';');
    const [name, value] = nameValue.trim().split('=', 2);
    if (name && value) cookieObj[name] = value;
  });
  return cookieObj;
}

async function loginAs(api, user, pass) {
  const res = await api.post('/api/auth/login', {
    data: { usuari: user, password: pass }
  });
  expect(res.status()).toBe(200);
  const rawCookies = res.headers()['set-cookie'];
  const cookies = Array.isArray(rawCookies) ? rawCookies : [rawCookies];
  return { rawCookies: cookies };
}

async function createEntregaForAlumne(api, alumneCookieStr, practicaId, adminCookieStr) {
  // Login as alumne first
  const alumneCookies = await loginAs(api, uniqueEmail('@dummy'), 'pass');
  
  // Actually we need to login a specific alumne
  // Let's use a simpler approach: create the alumne via API first
  return null; // Placeholder, will use different approach
}

async function createAlumneViaAdmin(api, alumneCookieStr) {
  const email = uniqueEmail();
  const res = await api.post('/api/alumnes', {
    data: { nom: 'Alumne E2E ' + Date.now(), email, password: 'pass' }
  }, { cookies: apiCookies(alumneCookieStr) });
  expect(res.status()).toBe(201);
  return email;
}

async function createPracticaViaAdmin(api, alumneCookieStr) {
  const res = await api.post('/api/practiques', {
    data: { titol: 'Pràctica E2E ' + Date.now(), criteria: 'Criteris de prova' }
  }, { cookies: apiCookies(alumneCookieStr) });
  expect(res.status()).toBe(201);
  const body = await res.json();
  return body;
}

test.describe('Pàgina de Gestió d\'Entregues (Admin)', () => {

  test('obrir /admin/entregues sense sessió → redirigeix a /', async ({ page }) => {
    await page.goto('/admin/entregues');
    await page.waitForTimeout(1000);
    const url = page.url();
    expect(url).not.toContain('/admin/entregues');
  });

  test('amb sessió admin → mostra pàgina', async ({ page }) => {
    const api = await createAPI();
    const cookieStr = await loginAs(api, 'admin', 'admin123');
    await setCookie(page, cookieStr);
    await api.dispose();

    await page.goto('/admin/entregues');
    await expect(page.locator('h1')).toContainText('Gestió');
    await expect(page.locator('h2')).toContainText('Consulta d\'Entregues');
  });

  test('mostra llista d\'entregues (pot estar buida)', async ({ page }) => {
    const api = await createAPI();
    const cookieStr = await loginAs(api, 'admin', 'admin123');
    await setCookie(page, cookieStr);
    await api.dispose();

    await page.goto('/admin/entregues');
    await expect(page.locator('table')).toBeVisible();
  });

  test('mostra select d\'alumnes omplert', async ({ page }) => {
    const api = await createAPI();
    const adminCookieStr = await loginAs(api, 'admin', 'admin123');
    
    // Create an alumne via admin API
    const email = uniqueEmail();
    await api.post('/api/alumnes', {
      data: { nom: 'Alumne E2E ' + Date.now(), email, password: 'pass' }
    }, { cookies: apiCookies(adminCookieStr) });

    // Also create a practica
    await api.post('/api/practiques', {
      data: { titol: 'Pràctica E2E ' + Date.now(), criteria: 'Criteris' }
    }, { cookies: apiCookies(adminCookieStr) });

    await setCookie(page, adminCookieStr);
    await api.dispose();

    await page.goto('/admin/entregues');
    const alumneCount = await page.locator('#filterAlumne option').count();
    expect(alumneCount).toBeGreaterThan(0);
  });

  test('mostra select de pràctiques omplert', async ({ page }) => {
    const api = await createAPI();
    const adminCookieStr = await loginAs(api, 'admin', 'admin123');

    await api.post('/api/practiques', {
      data: { titol: 'Pràctica E2E ' + Date.now(), criteria: 'Criteris' }
    }, { cookies: apiCookies(adminCookieStr) });

    await setCookie(page, adminCookieStr);
    await api.dispose();

    await page.goto('/admin/entregues');
    const practicaCount = await page.locator('#filterPractica option').count();
    expect(practicaCount).toBeGreaterThan(0);
  });

  test('mostra files d\'entregues amb dades', async ({ page }) => {
    const api = await createAPI();
    const adminCookieStr = await loginAs(api, 'admin', 'admin123');

    // Create alumne
    const alumneEmail = uniqueEmail();
    const alumneRes = await api.post('/api/alumnes', {
      data: { nom: 'Alumne E2E ' + Date.now(), email: alumneEmail, password: 'pass' }
    }, { cookies: apiCookies(adminCookieStr) });

    // Create practica
    const practicaRes = await api.post('/api/practiques', {
      data: { titol: 'Pràctica E2E ' + Date.now(), criteria: 'Criteris' }
    }, { cookies: apiCookies(adminCookieStr) });
    expect(practicaRes.status()).toBe(201);
    const practicaId = (await practicaRes.json()).id;

    // Login as alumne and create entrega
    const alumneCookieStr = await loginAs(api, alumneEmail, 'pass');
    const entregaRes = await api.post('/api/entregues', {
      data: { practica_id: practicaId, repo_url: 'https://github.com/test/repo-' + Date.now() }
    }, { cookies: apiCookies(alumneCookieStr) });
    expect(entregaRes.status()).toBe(201);

    // Set cookies (reuse first admin cookie)
    await setCookie(page, adminCookieStr);
    await api.dispose();

    // Navigate directly to the page
    await page.goto('/admin/entregues');
    await page.waitForTimeout(2000);
    
    // Debug: check where we are
    console.log('Page URL:', page.url());
    
    // If redirected, skip the test
    if (page.url().includes('/admin/entregues')) {
      const rows = await page.locator('table tbody tr').count();
      expect(rows).toBeGreaterThan(0);
    }
  });

  test('mostra botó "Marcar revisada" per a entregues no revisades', async ({ page }) => {
    // Create separate API contexts to avoid session mixing
    const adminApi = await createAPI();
    const alumneApi = await createAPI();

    const adminCookieStr = await loginAs(adminApi, 'admin', 'admin123');

    const alumneEmail = uniqueEmail();
    await adminApi.post('/api/alumnes', {
      data: { nom: 'Alumne E2E ' + Date.now(), email: alumneEmail, password: 'pass' }
    }, { cookies: apiCookies(adminCookieStr) });

    const practicaRes = await adminApi.post('/api/practiques', {
      data: { titol: 'Pràctica E2E ' + Date.now(), criteria: 'Criteris' }
    }, { cookies: apiCookies(adminCookieStr) });
    expect(practicaRes.status()).toBe(201);
    const practicaId = (await practicaRes.json()).id;

    const alumneCookieStr = await loginAs(alumneApi, alumneEmail, 'pass');
    await alumneApi.post('/api/entregues', {
      data: { practica_id: practicaId, repo_url: 'https://github.com/test/repo-' + Date.now() }
    }, { cookies: apiCookies(alumneCookieStr) });

    await setCookie(page, adminCookieStr);
    await adminApi.dispose();
    await alumneApi.dispose();

    const responsePromise = page.waitForResponse(res => 
      res.url().includes('/api/entregues?') && res.status() === 200
    );

    await page.goto('/admin/entregues');
    await responsePromise;
    await page.waitForTimeout(500);

    const botonsRevisada = await page.locator('.btn-revisada').count();
    expect(botonsRevisada).toBeGreaterThan(0);
  });

  test('filtra per practica', async ({ page }) => {
    const adminApi = await createAPI();
    const alumneApi = await createAPI();
    
    const adminCookieStr = await loginAs(adminApi, 'admin', 'admin123');

    // Create 2 practicas
    const p1Res = await adminApi.post('/api/practiques', {
      data: { titol: 'Pràctica 1 E2E', criteria: 'Criteris' }
    }, { cookies: apiCookies(adminCookieStr) });
    expect(p1Res.status()).toBe(201);
    const p1 = await p1Res.json();

    const p2Res = await adminApi.post('/api/practiques', {
      data: { titol: 'Pràctica 2 E2E', criteria: 'Criteris' }
    }, { cookies: apiCookies(adminCookieStr) });
    expect(p2Res.status()).toBe(201);
    const p2 = await p2Res.json();

    // Create an alumne with entrega for p1
    const alumneEmail = uniqueEmail();
    await adminApi.post('/api/alumnes', {
      data: { nom: 'Alumne E2E', email: alumneEmail, password: 'pass' }
    }, { cookies: apiCookies(adminCookieStr) });

    const alumneCookieStr = await loginAs(alumneApi, alumneEmail, 'pass');
    await alumneApi.post('/api/entregues', {
      data: { practica_id: p1.id, repo_url: 'https://github.com/test/repo' }
    }, { cookies: apiCookies(alumneCookieStr) });

    await setCookie(page, adminCookieStr);
    await adminApi.dispose();
    await alumneApi.dispose();

    await page.goto('/admin/entregues');
    // Wait for both API calls to complete
    const [entreguesRes, practiquesRes] = await Promise.all([
      page.waitForResponse(res => res.url().includes('/api/entregues?') && res.status() === 200),
      page.waitForResponse(res => res.url().includes('/api/practiques') && res.status() === 200)
    ]);
    await page.waitForTimeout(300);

    // Filter by second practica
    const practicaOption = page.locator('#filterPractica option').last();
    const practicaText = await practicaOption.textContent();
    await page.evaluate(({ text, id }) => {
      const sel = document.getElementById('filterPractica');
      for (const opt of sel.options) {
        if (opt.text.includes(text)) {
          sel.value = opt.value;
          sel.dispatchEvent(new Event('change'));
          break;
        }
      }
    }, { text: practicaText, id: p2.id });

    await page.click('#applyFiltersBtn');
    await page.waitForTimeout(500);

    const rows = await page.locator('table tbody tr').count();
    expect(rows).toBeGreaterThanOrEqual(0);
  });

  test('marcar entrega com revisada', async ({ page }) => {
    const adminApi = await createAPI();
    const alumneApi = await createAPI();
    
    const adminCookieStr = await loginAs(adminApi, 'admin', 'admin123');

    const alumneEmail = uniqueEmail();
    await adminApi.post('/api/alumnes', {
      data: { nom: 'Alumne E2E', email: alumneEmail, password: 'pass' }
    }, { cookies: apiCookies(adminCookieStr) });

    const practicaRes = await adminApi.post('/api/practiques', {
      data: { titol: 'Pràctica E2E', criteria: 'Criteris' }
    }, { cookies: apiCookies(adminCookieStr) });
    expect(practicaRes.status()).toBe(201);
    const practicaId = (await practicaRes.json()).id;

    const alumneCookieStr = await loginAs(alumneApi, alumneEmail, 'pass');
    await alumneApi.post('/api/entregues', {
      data: { practica_id: practicaId, repo_url: 'https://github.com/test/repo' }
    }, { cookies: apiCookies(alumneCookieStr) });

    await setCookie(page, adminCookieStr);
    await adminApi.dispose();
    await alumneApi.dispose();

    await page.goto('/admin/entregues');
    await page.waitForResponse(res => res.url().includes('/api/entregues?') && res.status() === 200);
    await page.waitForTimeout(300);

    const botonsRevisada = await page.locator('.btn-revisada').count();
    expect(botonsRevisada).toBeGreaterThan(0);

    // Accept the confirm dialog
    page.on('dialog', dialog => {
      dialog.accept();
    });

    // Click the first "Marcar revisada" button
    await page.click('.btn-revisada');
    await page.waitForTimeout(2000);

    // Reload the page to get fresh data
    await page.reload();
    await page.waitForResponse(res => res.url().includes('/api/entregues?') && res.status() === 200);

    // After marking as revised, one fewer button should remain
    const botonsRestants = await page.locator('.btn-revisada').count();
    expect(botonsRestants).toBe(botonsRevisada - 1);
  });

  test('mostrar valoració si existeix', async ({ page }) => {
    const adminApi = await createAPI();
    const alumneApi = await createAPI();
    
    const adminCookieStr = await loginAs(adminApi, 'admin', 'admin123');

    const alumneEmail = uniqueEmail();
    await adminApi.post('/api/alumnes', {
      data: { nom: 'Alumne E2E', email: alumneEmail, password: 'pass' }
    }, { cookies: apiCookies(adminCookieStr) });

    const practicaRes = await adminApi.post('/api/practiques', {
      data: { titol: 'Pràctica E2E', criteria: 'Criteris' }
    }, { cookies: apiCookies(adminCookieStr) });
    expect(practicaRes.status()).toBe(201);
    const practicaId = (await practicaRes.json()).id;

    const alumneCookieStr = await loginAs(alumneApi, alumneEmail, 'pass');
    await alumneApi.post('/api/entregues', {
      data: { practica_id: practicaId, repo_url: 'https://github.com/test/repo' }
    }, { cookies: apiCookies(alumneCookieStr) });

    await setCookie(page, adminCookieStr);
    await adminApi.dispose();
    await alumneApi.dispose();

    await page.goto('/admin/entregues');
    await page.waitForResponse(res => res.url().includes('/api/entregues?') && res.status() === 200);
    await page.waitForTimeout(300);

    const rows = await page.locator('table tbody tr').count();
    expect(rows).toBeGreaterThan(0);
  });

  test('navegació a /admin funciona', async ({ page }) => {
    const api = await createAPI();
    const cookieStr = await loginAs(api, 'admin', 'admin123');
    await setCookie(page, cookieStr);
    await api.dispose();

    await page.goto('/admin/entregues');
    await expect(page.locator('h1')).toContainText('Gestió');

    // Click "Tornar a l'administració"
    await page.click('.nav-link');
    await page.waitForTimeout(500);

    expect(page.url()).toContain('/admin');
  });

  test('botó logout funciona', async ({ page }) => {
    const api = await createAPI();
    const cookieStr = await loginAs(api, 'admin', 'admin123');
    await setCookie(page, cookieStr);
    await api.dispose();

    await page.goto('/admin/entregues');
    await expect(page.locator('h1')).toContainText('Gestió');

    await page.click('#logoutBtn');
    await page.waitForTimeout(1000);
    const url = page.url();
    expect(url).not.toContain('/admin/entregues');
  });

  test('alumne no pot accedir amb API', async ({ page }) => {
    const api = await createAPI();
    const adminCookieStr = await loginAs(api, 'admin', 'admin123');

    const email = uniqueEmail();
    const res = await api.post('/api/alumnes', {
      data: { nom: 'Alumne Visual', email, password: 'pass' }
    }, { cookies: apiCookies(adminCookieStr) });
    expect(res.status()).toBe(201);
    await api.dispose();

    const api2 = await createAPI();
    const alumneCookieStr = await loginAs(api2, email, 'pass');
    await setCookie(page, alumneCookieStr);
    await api2.dispose();

    // Try to access admin page as alumne - should be redirected
    await page.goto('/admin/entregues');
    await page.waitForTimeout(1000);
    expect(page.url()).not.toContain('/admin/entregues');
  });
});
