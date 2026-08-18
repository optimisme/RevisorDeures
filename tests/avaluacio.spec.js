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

function uniqueEmail(base) {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}@${base}`;
}

test.describe('Serveidor de Valoració Interna (T7.1)', () => {
  test('endpoint /api/entregues/avaluar/:id respon', async () => {
    const api = await createAPI();
    const email = uniqueEmail('exemple.com');
    
    // Crear alumne i entrega
    const adminCookies = await loginAs(api, 'admin', 'admin123');
    const practicaRes = await api.post('/api/practiques', {
      data: { titol: 'Pràctica Test Avaluació', criteria: 'Provar funcionalitat' }
    }, { cookies: adminCookies });
    expect(practicaRes.status()).toBe(201);
    const practicaId = (await practicaRes.json()).id;
    
    const alumneRes = await api.post('/api/alumnes', {
      data: { nom: 'Alumne Avaluació', email, password: 'pass' }
    }, { cookies: adminCookies });
    expect(alumneRes.status()).toBe(201);
    
    const alumneCookies = await loginAs(api, email, 'pass');
    const entregaRes = await api.post('/api/entregues', {
      data: { practica_id: practicaId, repo_url: 'https://github.com/test/avaluacio' }
    }, { cookies: alumneCookies });
    expect(entregaRes.status()).toBe(201);
    
    const entrega = await entregaRes.json();
    
    // Disparar avaluació
    const avaluacioRes = await api.post(`/api/entregues/avaluar/${entrega.entrega.id}`, {
      cookies: alumneCookies
    });
    expect(avaluacioRes.status()).toBe(200);
    const avaluacioData = await avaluacioRes.json();
    expect(avaluacioData.message).toBe('Avaluació iniciada');
    
    await api.dispose();
  });

  test('endpoint /api/entregues/valoracio/:id retorna 404 si no existeix', async () => {
    const api = await createAPI();
    const adminCookies = await loginAs(api, 'admin', 'admin123');
    
    const valoracioRes = await api.get('/api/entregues/valoracio/9999', {
      cookies: adminCookies
    });
    expect(valoracioRes.status()).toBe(404);
    
    await api.dispose();
  });

  test('endpoint avaluar retorna missatge correcte', async () => {
    const api = await createAPI();
    const email = uniqueEmail('exemple.com');
    
    const adminCookies = await loginAs(api, 'admin', 'admin123');
    const practicaRes = await api.post('/api/practiques', {
      data: { titol: 'Pràctica Test Avaluació 2', criteria: 'Criteri test' }
    }, { cookies: adminCookies });
    expect(practicaRes.status()).toBe(201);
    const practicaId = (await practicaRes.json()).id;
    
    const alumneRes = await api.post('/api/alumnes', {
      data: { nom: 'Alumne Test 2', email, password: 'pass' }
    }, { cookies: adminCookies });
    expect(alumneRes.status()).toBe(201);
    
    const alumneCookies = await loginAs(api, email, 'pass');
    const entregaRes = await api.post('/api/entregues', {
      data: { practica_id: practicaId, repo_url: 'https://github.com/test/avaluacio2' }
    }, { cookies: alumneCookies });
    expect(entregaRes.status()).toBe(201);
    
    const entrega = await entregaRes.json();
    
    // Disparar avaluació
    const avaluacioRes = await api.post(`/api/entregues/avaluar/${entrega.entrega.id}`, {
      cookies: alumneCookies
    });
    expect(avaluacioRes.status()).toBe(200);
    const data = await avaluacioRes.json();
    
    expect(data.message).toBe('Avaluació iniciada');
    expect(data.entrega).toBeTruthy();
    expect(data.entrega.id).toBe(entrega.entrega.id);
    
    await api.dispose();
  });
});
