const { test, expect } = require('@playwright/test');
const { request } = require('playwright');

function parseCookies(setCookieStr) {
  const cookies = {};
  if (!setCookieStr) return cookies;
  const parts = setCookieStr.split(';');
  const [nameValue] = parts;
  const [name, value] = nameValue.trim().split('=');
  if (name) cookies[name] = value;
  return cookies;
}

function uniqueId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

async function getCookie(api, loginData) {
  const res = await api.post('/api/auth/login', { data: loginData });
  expect(res.status()).toBe(200);
  return {
    cookies: parseCookies(res.headers()['set-cookie']),
    api: api
  };
}

test.describe('API Pràctiques - Rutes protegides', () => {
  test('GET sense sessió → 401', async () => {
    const api = await request.newContext({ baseURL: 'http://localhost:3000' });
    const res = await api.get('/api/practiques');
    expect(res.status()).toBe(401);
    await api.dispose();
  });

  test('POST sense sessió → 401', async () => {
    const api = await request.newContext({ baseURL: 'http://localhost:3000' });
    const res = await api.post('/api/practiques', { data: { titol: 'Test' } });
    expect(res.status()).toBe(401);
    await api.dispose();
  });

  test('POST /api/practiques → crea pràctica', async () => {
    const api = await request.newContext({ baseURL: 'http://localhost:3000' });
    const { cookies } = await getCookie(api, { usuari: 'admin', password: 'admin123' });
    const titol = `Pràctica ${uniqueId()}`;
    const res = await api.post('/api/practiques', {
      data: { titol, criteria: 'Criteris de prova' },
      cookies
    });
    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body.titol).toBe(titol);
    expect(body.criteria).toBe('Criteris de prova');
    await api.dispose();
  });

  test('POST títol buit → 400', async () => {
    const api = await request.newContext({ baseURL: 'http://localhost:3000' });
    const { cookies } = await getCookie(api, { usuari: 'admin', password: 'admin123' });
    const res = await api.post('/api/practiques', {
      data: { titol: '', criteria: 'Criteris' },
      cookies
    });
    expect(res.status()).toBe(400);
    await api.dispose();
  });

  test('PUT /api/practiques/:id → 200 actualitzat', async () => {
    const api = await request.newContext({ baseURL: 'http://localhost:3000' });
    const { cookies } = await getCookie(api, { usuari: 'admin', password: 'admin123' });
    
    // Crear una per actualitzar
    const titol = `Practica ${uniqueId()}`;
    await api.post('/api/practiques', {
      data: { titol, criteria: 'Criteris vells' },
      cookies
    });
    
    // Obtener la llista i agafar l'últim
    const listRes = await api.get('/api/practiques', { cookies });
    const list = await listRes.json();
    const lastId = list[list.length - 1].id;
    
    const res = await api.put(`/api/practiques/${lastId}`, {
      data: { titol: `${titol} actualitzada`, criteria: 'Criteris nous' },
      cookies
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.titol).toBe(`${titol} actualitzada`);
    await api.dispose();
  });

  test('DELETE /api/practiques/:id → 200', async () => {
    const api = await request.newContext({ baseURL: 'http://localhost:3000' });
    const { cookies } = await getCookie(api, { usuari: 'admin', password: 'admin123' });
    
    // Crear una per esborrar
    const titol = `Practica ${uniqueId()}`;
    await api.post('/api/practiques', {
      data: { titol, criteria: 'Esborrar' },
      cookies
    });
    
    // Obtener l'ID de l'última
    const listRes = await api.get('/api/practiques', { cookies });
    const list = await listRes.json();
    const lastId = list[list.length - 1].id;
    
    const res = await api.delete(`/api/practiques/${lastId}`, { cookies });
    expect(res.status()).toBe(200);
    
    // Verificar que s'ha esborrat
    const verifyRes = await api.get(`/api/practiques/${lastId}`, { cookies });
    expect(verifyRes.status()).toBe(404);
    await api.dispose();
  });

  test('DELETE /api/practiques/999 → 404', async () => {
    const api = await request.newContext({ baseURL: 'http://localhost:3000' });
    const { cookies } = await getCookie(api, { usuari: 'admin', password: 'admin123' });
    const res = await api.delete('/api/practiques/999', { cookies });
    expect(res.status()).toBe(404);
    await api.dispose();
  });

  test('POST amb sessió alumne → 403', async () => {
    const api1 = await request.newContext({ baseURL: 'http://localhost:3000' });
    const api2 = await request.newContext({ baseURL: 'http://localhost:3000' });
    
    const email = `${Date.now()}-alumne@exemple.com`;
    const { cookies: adminCookies } = await getCookie(api1, { usuari: 'admin', password: 'admin123' });
    
    // Crear alumne
    await api1.post('/api/alumnes', {
      data: { nom: 'Test Alumne', email, password: 'pass' },
      cookies: adminCookies
    });
    
    // Login com alumne
    const res = await api2.post('/api/auth/login', {
      data: { usuari: email, password: 'pass' }
    });
    expect(res.status()).toBe(200);
    const alumneCookies = parseCookies(res.headers()['set-cookie']);
    
    // Intentar crear pràctica com alumne → 403
    const createRes = await api2.post('/api/practiques', {
      data: { titol: 'Pràctica no autoritzada' },
      cookies: alumneCookies
    });
    expect(createRes.status()).toBe(403);
    
    await api1.dispose();
    await api2.dispose();
  });
});
