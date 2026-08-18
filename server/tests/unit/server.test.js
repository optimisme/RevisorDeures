const request = require('supertest');
const app = require('../../server');
const { expect } = require('chai');

describe('GET /health', () => {
  it('respon 200 amb { status: "ok" }', async () => {
    const res = await request(app).get('/health');
    expect(res.status).to.equal(200);
    expect(res.body).to.deep.equal({ status: 'ok' });
  });
});

describe('GET /', () => {
  it('respon 200', async () => {
    const res = await request(app).get('/');
    expect(res.status).to.equal(200);
  });
});
