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

function uniqueEmail(base) {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}@${base}`;
}

function getCookie(api, loginData) {
  return api.post('/api/auth/login', {
    data: loginData
  }).then(async res => {
    expect(res.status()).toBe(200);
    return {
      cookies: parseCookies(res.headers()['set-cookie']),
      api: api
    };
  });
}

test.describe('API Alumnes - Rutes protegides', () => {
  test('GET sense sessió → 401', async () => {
    const api = await request.newContext({ baseURL: 'http://localhost:3000' });
    const res = await api.get('/api/alumnes');
    expect(res.status()).toBe(401);
    await api.dispose();
  });

  test('POST sense sessió → 401', async () => {
    const api = await request.newContext({ baseURL: 'http://localhost:3000' });
    const res = await api.post('/api/alumnes', { data: { nom: 'Test' } });
    expect(res.status()).toBe(401);
    await api.dispose();
  });

  test('POST /api/alumnes → crea alumne', async () => {
    const api = await request.newContext({ baseURL: 'http://localhost:3000' });
    const { cookies } = await getCookie(api, { usuari: 'admin', password: 'admin123' });
    const email = uniqueEmail('exemple.com');
    const res = await api.post('/api/alumnes', {
      data: { nom: 'Maria López', email, password: 'pass123' },
      cookies
    });
    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body.nom).toBe('Maria López');
    expect(body.password_hash).toBeUndefined();
    // Guardar email per netejar
    api.meta = { email };
    await api.dispose();
  });

  test('POST duplicat → 409', async () => {
    const api = await request.newContext({ baseURL: 'http://localhost:3000' });
    const { cookies } = await getCookie(api, { usuari: 'admin', password: 'admin123' });
    const email = uniqueEmail('exemple.com');
    // Crear
    await api.post('/api/alumnes', {
      data: { nom: 'Duplicat Test', email, password: 'pass' },
      cookies
    });
    // Intentar duplicar
    const res = await api.post('/api/alumnes', {
      data: { nom: 'Duplicat Test', email, password: 'pass' },
      cookies
    });
    expect(res.status()).toBe(409);
    await api.dispose();
  });

  test('PUT actualitza → 200', async () => {
    const api = await request.newContext({ baseURL: 'http://localhost:3000' });
    const { cookies } = await getCookie(api, { usuari: 'admin', password: 'admin123' });
    const listRes = await api.get('/api/alumnes', { cookies });
    const list = await listRes.json();
    if (list.length > 0) {
      const id = list[0].id;
      const res = await api.put(`/api/alumnes/${id}`, {
        data: { nom: 'Actualitzat' },
        cookies
      });
      expect(res.status()).toBe(200);
    }
    await api.dispose();
  });

  test('DELETE → 200', async () => {
    const api = await request.newContext({ baseURL: 'http://localhost:3000' });
    const { cookies } = await getCookie(api, { usuari: 'admin', password: 'admin123' });
    const listRes = await api.get('/api/alumnes', { cookies });
    const list = await listRes.json();
    if (list.length > 0) {
      const res = await api.delete(`/api/alumnes/${list[0].id}`, { cookies });
      expect(res.status()).toBe(200);
    }
    await api.dispose();
  });

  test('DELETE 999 → 404', async () => {
    const api = await request.newContext({ baseURL: 'http://localhost:3000' });
    const { cookies } = await getCookie(api, { usuari: 'admin', password: 'admin123' });
    const res = await api.delete('/api/alumnes/999', { cookies });
    expect(res.status()).toBe(404);
    await api.dispose();
  });

  test('POST amb sessió alumne → 403', async () => {
    const api1 = await request.newContext({ baseURL: 'http://localhost:3000' });
    const api2 = await request.newContext({ baseURL: 'http://localhost:3000' });
    
    const email = uniqueEmail('exemple.com');
    const { cookies: adminCookies } = await getCookie(api1, { usuari: 'admin', password: 'admin123' });
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
    
    // Intentar crear alumne com alumne → 403
    const createRes = await api2.post('/api/alumnes', {
      data: { nom: 'Altre', email: 'altre@exemple.com', password: 'pass' },
      cookies: alumneCookies
    });
    expect(createRes.status()).toBe(403);
    
    await api1.dispose();
    await api2.dispose();
  });
});
