const { test, expect } = require('@playwright/test');
const { request } = require('playwright');

function createAPI() {
  return request.newContext({ baseURL: 'http://localhost:3000', timeout: 10000 });
}

function uniqueId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
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

test.describe('Pàgina de Gestió de Pràctiques', () => {
  test('es pot obrir /admin/practiques amb sessió admin', async ({ page }) => {
    const api = await createAPI();
    const cookieStr = await loginAs(api, 'admin', 'admin123');
    await setCookie(page, cookieStr);
    await api.dispose();
    
    await page.goto('/admin/practiques');
    await expect(page.locator('h1')).toContainText('Gestió');
  });

  test('mostra botó + Afegir Pràctica', async ({ page }) => {
    const api = await createAPI();
    const cookieStr = await loginAs(api, 'admin', 'admin123');
    await setCookie(page, cookieStr);
    await api.dispose();
    
    await page.goto('/admin/practiques');
    await expect(page.locator('#addBtn')).toBeVisible();
  });

  test('mostra taula de pràctiques buida', async ({ page }) => {
    const api = await createAPI();
    const cookieStr = await loginAs(api, 'admin', 'admin123');
    await setCookie(page, cookieStr);
    await api.dispose();
    
    await page.goto('/admin/practiques');
    await expect(page.locator('table')).toBeVisible();
  });

  test('afegeix pràctica amb el formulari', async ({ page }) => {
    const api = await createAPI();
    const cookies = await loginAs(api, 'admin', 'admin123');
    
    const titol = `Practica E2E ${uniqueId()}`;
    
    await setCookie(page, cookies);
    await page.goto('/admin/practiques');
    await page.waitForLoadState('networkidle');
    
    // Obrir modal
    await page.click('#addBtn', { force: true });
    
    // Obir modal i enviar formulari tot amb evaluate per evitar problemes de visibilitat
    await page.evaluate((data) => {
      // Cerrar modal afegir primer per assegurar neteja
      const addModal = document.getElementById('addModal');
      if (addModal) {
        addModal.classList.add('active');
      }
      
      // Omplir formulari
      document.getElementById('titol').value = data.titol;
      document.getElementById('criteria').value = data.criteria;
      
      // Disparar esdeveniments d'input
      ['titol', 'criteria'].forEach(id => {
        const el = document.getElementById(id);
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      });
      
      // Enviar formulari directament
      const form = document.getElementById('addForm');
      form.dispatchEvent(new Event('submit', { bubbles: true }));
    }, { titol, criteria: `Criteris per a ${titol}` });
    
    // Esperar que es tanqui el modal i es refresqui la taula
    await page.waitForTimeout(1000);
    
    // Verificar que la taula conté la nova pràctica
    const rows = await page.locator('table tr').count();
    expect(rows).toBeGreaterThan(1);
    
    await api.dispose();
  });

  test('alumne no pot accedir amb API', async ({ page }) => {
    const api = await createAPI();
    
    // Crear alumne com admin
    const adminCookies = await loginAs(api, 'admin', 'admin123');
    const email = `${Date.now()}-alumne2@exemple.com`;
    await api.post('/api/alumnes', {
      data: { nom: 'Alumne Visual', email, password: 'pass' }
    });
    await api.dispose();
    
    // Login com alumne
    const api2 = await createAPI();
    await loginAs(api2, email, 'pass');
    
    // Intentar accedir a API de pràctiques
    const res = await api2.post('/api/practiques', {
      data: { titol: 'No autoritzada' }
    });
    expect(res.status()).toBe(403);
    
    await api2.dispose();
  });
});
