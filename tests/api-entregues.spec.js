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

async function getCookie(api, loginData) {
  const res = await api.post('/api/auth/login', { data: loginData });
  expect(res.status()).toBe(200);
  return {
    cookies: parseCookies(res.headers()['set-cookie'])
  };
}

async function createAlumne(api) {
  const { cookies: adminCookies } = await getCookie(api, { usuari: 'admin', password: 'admin123' });
  const email = uniqueEmail('exemple.com');
  const res = await api.post('/api/alumnes', {
    data: { nom: 'Alumne Entrega', email, password: 'pass' },
    cookies: adminCookies
  });
  expect(res.status()).toBe(201);
  return email;
}

test.describe('API Entregues — Rutes', () => {
  test('POST sense sessió → 401', async () => {
    const api = await request.newContext({ baseURL: 'http://localhost:3000' });
    const res = await api.post('/api/entregues', { data: { practica_id: 1, repo_url: 'https://github.com/test/repo' } });
    expect(res.status()).toBe(401);
    await api.dispose();
  });

  test('POST amb admin → 403', async () => {
    const api = await request.newContext({ baseURL: 'http://localhost:3000' });
    const { cookies } = await getCookie(api, { usuari: 'admin', password: 'admin123' });
    const res = await api.post('/api/entregues', {
      data: { practica_id: 1, repo_url: 'https://github.com/test/repo' },
      cookies
    });
    expect(res.status()).toBe(403);
    await api.dispose();
  });

  test('POST amb alumne i dades correctes → 201', async () => {
    const api = await request.newContext({ baseURL: 'http://localhost:3000' });
    
    // Crear alumne amb admin
    const email = await createAlumne(api);
    
    // Login com alumne (mateixa API, session es manté)
    const { cookies } = await getCookie(api, { usuari: email, password: 'pass' });
    
    // Crear entrega
    const res = await api.post('/api/entregues', {
      data: { practica_id: 1, repo_url: 'https://github.com/test/repo' },
      cookies
    });
    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body.entrega).toBeDefined();
    expect(body.entrega.estat).toBe('pendent');
    expect(body.entrega.revisada).toBe(0);
    
    await api.dispose();
  });

  test('POST URL no GitHub → 400', async () => {
    const api = await request.newContext({ baseURL: 'http://localhost:3000' });
    
    const email = await createAlumne(api);
    const { cookies } = await getCookie(api, { usuari: email, password: 'pass' });
    
    const res = await api.post('/api/entregues', {
      data: { practica_id: 1, repo_url: 'https://example.com/notgithub' },
      cookies
    });
    expect(res.status()).toBe(400);
    
    await api.dispose();
  });

  test('POST practica inexistent → 400', async () => {
    const api = await request.newContext({ baseURL: 'http://localhost:3000' });
    
    const email = await createAlumne(api);
    const { cookies } = await getCookie(api, { usuari: email, password: 'pass' });
    
    const res = await api.post('/api/entregues', {
      data: { practica_id: 9999, repo_url: 'https://github.com/test/repo' },
      cookies
    });
    expect(res.status()).toBe(400);
    
    await api.dispose();
  });

  test('POST duplicada → 409', async () => {
    const api = await request.newContext({ baseURL: 'http://localhost:3000' });
    
    const email = await createAlumne(api);
    const { cookies } = await getCookie(api, { usuari: email, password: 'pass' });
    
    // Primera entrega
    await api.post('/api/entregues', {
      data: { practica_id: 1, repo_url: 'https://github.com/test/repo1' },
      cookies
    });
    
    // Intentar duplicar
    const res = await api.post('/api/entregues', {
      data: { practica_id: 1, repo_url: 'https://github.com/test/repo2' },
      cookies
    });
    expect(res.status()).toBe(409);
    
    await api.dispose();
  });

  test('GET sense sessió → 401', async () => {
    const api = await request.newContext({ baseURL: 'http://localhost:3000' });
    const res = await api.get('/api/entregues');
    expect(res.status()).toBe(401);
    await api.dispose();
  });

  test('GET amb alumne → 200 amb entregues seves', async () => {
    const api = await request.newContext({ baseURL: 'http://localhost:3000' });
    
    const email = await createAlumne(api);
    const { cookies } = await getCookie(api, { usuari: email, password: 'pass' });
    
    // Crear una entrega
    await api.post('/api/entregues', {
      data: { practica_id: 1, repo_url: 'https://github.com/test/repo' },
      cookies
    });
    
    const res = await api.get('/api/entregues', { cookies });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.entregues).toBeDefined();
    
    await api.dispose();
  });

  test('GET amb admin → 200 totes les entregues', async () => {
    const api = await request.newContext({ baseURL: 'http://localhost:3000' });
    const { cookies } = await getCookie(api, { usuari: 'admin', password: 'admin123' });
    const res = await api.get('/api/entregues', { cookies });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.entregues).toBeDefined();
    await api.dispose();
  });

  test('GET ?practica_id=1 → filtra', async () => {
    const api = await request.newContext({ baseURL: 'http://localhost:3000' });
    const { cookies } = await getCookie(api, { usuari: 'admin', password: 'admin123' });
    const res = await api.get('/api/entregues?practica_id=1', { cookies });
    expect(res.status()).toBe(200);
    await api.dispose();
  });

  test('GET /alumne/:id amb admin → 200', async () => {
    const api = await request.newContext({ baseURL: 'http://localhost:3000' });
    const { cookies } = await getCookie(api, { usuari: 'admin', password: 'admin123' });
    const res = await api.get('/api/entregues/alumne/2', { cookies });
    expect(res.status()).toBe(200);
    await api.dispose();
  });

  test('GET /practica/:id amb admin → 200', async () => {
    const api = await request.newContext({ baseURL: 'http://localhost:3000' });
    const { cookies } = await getCookie(api, { usuari: 'admin', password: 'admin123' });
    const res = await api.get('/api/entregues/practica/1', { cookies });
    expect(res.status()).toBe(200);
    await api.dispose();
  });

  test('GET /pendents amb admin → 200', async () => {
    const api = await request.newContext({ baseURL: 'http://localhost:3000' });
    const { cookies } = await getCookie(api, { usuari: 'admin', password: 'admin123' });
    const res = await api.get('/api/entregues/pendents', { cookies });
    expect(res.status()).toBe(200);
    await api.dispose();
  });

  test('GET valoracio amb admin → 200', async () => {
    const api = await request.newContext({ baseURL: 'http://localhost:3000' });
    const { cookies: adminCookies } = await getCookie(api, { usuari: 'admin', password: 'admin123' });
    
    // Crear alumne i entrega per tenir dades
    const email = uniqueEmail('exemple.com');
    await api.post('/api/alumnes', {
      data: { nom: 'Alumne Valoracio', email, password: 'pass' },
      cookies: adminCookies
    });
    const alumneRes = await api.get('/api/alumnes', { cookies: adminCookies });
    const alumnes = await alumneRes.json();
    const alumneId = alumnes[0]?.id;
    
    // Crear alumne per session
    const alumneApi = await request.newContext({ baseURL: 'http://localhost:3000' });
    const { cookies: alumneCookies } = await getCookie(alumneApi, { usuari: email, password: 'pass' });
    const entregaRes = await alumneApi.post('/api/entregues', {
      data: { practica_id: 1, repo_url: 'https://github.com/test/valoracio' },
      cookies: alumneCookies
    });
    const entregaBody = await entregaRes.json();
    const entregaId = entregaBody.entrega?.id;
    await alumneApi.dispose();
    
    // Obtenir valoracio (no existeix, però ha de retornar 200)
    const res = await api.get(`/api/valoracions/entrega/${entregaId}`, { cookies: adminCookies });
    expect(res.status()).toBe(200);
    
    await api.dispose();
  });

  test('PATCH revisar amb admin → 200', async () => {
    const api = await request.newContext({ baseURL: 'http://localhost:3000' });
    const { cookies: adminCookies } = await getCookie(api, { usuari: 'admin', password: 'admin123' });
    
    const email = uniqueEmail('exemple.com');
    await api.post('/api/alumnes', {
      data: { nom: 'Alumne Revisar', email, password: 'pass' },
      cookies: adminCookies
    });
    
    const alumneApi = await request.newContext({ baseURL: 'http://localhost:3000' });
    const { cookies: alumneCookies } = await getCookie(alumneApi, { usuari: email, password: 'pass' });
    const entregaRes = await alumneApi.post('/api/entregues', {
      data: { practica_id: 1, repo_url: 'https://github.com/test/revisar' },
      cookies: alumneCookies
    });
    const entregaBody = await entregaRes.json();
    const entregaId = entregaBody.entrega?.id;
    await alumneApi.dispose();
    
    const res = await api.patch(`/api/entregues/${entregaId}/revisar`, { cookies: adminCookies });
    expect(res.status()).toBe(200);
    
    await api.dispose();
  });

  test('PATCH revisar si ja revisada → 400', async () => {
    const api = await request.newContext({ baseURL: 'http://localhost:3000' });
    const { cookies: adminCookies } = await getCookie(api, { usuari: 'admin', password: 'admin123' });
    
    const email = uniqueEmail('exemple.com');
    await api.post('/api/alumnes', {
      data: { nom: 'Alumne Doble Revisio', email, password: 'pass' },
      cookies: adminCookies
    });
    
    const alumneApi = await request.newContext({ baseURL: 'http://localhost:3000' });
    const { cookies: alumneCookies } = await getCookie(alumneApi, { usuari: email, password: 'pass' });
    const entregaRes = await alumneApi.post('/api/entregues', {
      data: { practica_id: 1, repo_url: 'https://github.com/test/doble' },
      cookies: alumneCookies
    });
    const entregaBody = await entregaRes.json();
    const entregaId = entregaBody.entrega?.id;
    await alumneApi.dispose();
    
    // Primera revisió → 200
    await api.patch(`/api/entregues/${entregaId}/revisar`, { cookies: adminCookies });
    
    // Doble revisió → 400
    const res = await api.patch(`/api/entregues/${entregaId}/revisar`, { cookies: adminCookies });
    expect(res.status()).toBe(400);
    
    await api.dispose();
  });

  test('PATCH revisar amb alumne → 403', async () => {
    const api = await request.newContext({ baseURL: 'http://localhost:3000' });
    
    const email = await createAlumne(api);
    const { cookies: alumneCookies } = await getCookie(api, { usuari: email, password: 'pass' });
    
    const entregaRes = await api.post('/api/entregues', {
      data: { practica_id: 1, repo_url: 'https://github.com/test/alumne' },
      cookies: alumneCookies
    });
    const entregaBody = await entregaRes.json();
    const entregaId = entregaBody.entrega?.id;
    
    const res = await api.patch(`/api/entregues/${entregaId}/revisar`, { cookies: alumneCookies });
    expect(res.status()).toBe(403);
    
    await api.dispose();
  });

  test('DELETE sense sessió → 401', async () => {
    const api = await request.newContext({ baseURL: 'http://localhost:3000' });
    const res = await api.delete('/api/entregues/1');
    expect(res.status()).toBe(401);
    await api.dispose();
  });

  test('DELETE 999 → 404', async () => {
    const api = await request.newContext({ baseURL: 'http://localhost:3000' });
    const { cookies } = await getCookie(api, { usuari: 'admin', password: 'admin123' });
    const res = await api.delete('/api/entregues/999', { cookies });
    expect(res.status()).toBe(404);
    await api.dispose();
  });
});
