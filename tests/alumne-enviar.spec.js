const { test, expect } = require('@playwright/test');
const { request } = require('playwright');

function uniqueEmail(base) {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}@${base}`;
}

async function createAPI() {
  return request.newContext({ baseURL: 'http://localhost:3000', timeout: 15000 });
}

async function adminLogin(api) {
  const res = await api.post('/api/auth/login', {
    data: { usuari: 'admin', password: 'admin123' }
  });
  expect(res.status()).toBe(200);
  return res;
}

async function alumneLogin(api, email, password = 'pass') {
  const res = await api.post('/api/auth/login', {
    data: { usuari: email, password }
  });
  expect(res.status()).toBe(200);
  return res;
}

async function setupAlumne() {
  const api = await createAPI();
  
  // Login com admin per crear alumne
  await adminLogin(api);
  
  const email = uniqueEmail('exemple.com');
  // Crear alumne com admin
  const createRes = await api.post('/api/alumnes', {
    data: { nom: 'Alumne Test Enviar', email, password: 'pass' }
  });
  expect(createRes.status()).toBe(201);
  
  // Login com alumne
  const loginRes = await alumneLogin(api, email);
  
  // Verificar sessió
  const sessionRes = await api.get('/api/auth/session');
  expect(sessionRes.status()).toBe(200);
  const sessionData = await sessionRes.json();
  console.log('Session data:', sessionData);
  
  // Check cookies
  const setCookie = loginRes.headers()['set-cookie'];
  console.log('Set-Cookie:', setCookie);
  
  return { api, email, loginRes, sessionData };
}

test.describe('Pàgina d\'Enviar Entrega', () => {
  test('es pot obrir /alumne/enviar amb sessió alumne', async ({ page }) => {
    // Create fresh API context to create student
    const api = await request.newContext({ baseURL: 'http://localhost:3000', timeout: 15000 });
    
    // Login com admin per crear alumne
    const adminRes = await api.post('/api/auth/login', {
      data: { usuari: 'admin', password: 'admin123' }
    });
    expect(adminRes.status()).toBe(200);
    
    const email = uniqueEmail('exemple.com');
    const createRes = await api.post('/api/alumnes', {
      data: { nom: 'Alumne Test Enviar', email, password: 'pass' }
    });
    expect(createRes.status()).toBe(201);
    
    await api.dispose();
    
    // Navigate to home and login
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('RevisorDeures');
    await page.locator('#usuari').fill(email);
    await page.locator('#password').fill('pass');
    await page.locator('button[type="submit"]').click();
    
    // Should redirect to student dashboard
    await expect(page.locator('h1')).toContainText('El meu espai');
    
    // Navigate to enviar page - keep session
    await page.goto('/alumne/enviar');
    
    // Wait for navigation to complete
    await page.waitForLoadState('networkidle');
    await expect(page.locator('#practicaSelect')).toBeVisible();
  });

  test('redirigeix a / si no està loguejat', async ({ page }) => {
    await page.goto('/alumne/enviar');
    await page.waitForTimeout(500);
    const url = page.url();
    expect(url).toBe('http://localhost:3000/');
});

});
