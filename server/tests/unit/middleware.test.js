const { expect } = require('chai');
const supertest = require('supertest');
const express = require('express');
const session = require('express-session');
const { requireAdmin, requireStudent, authorizeStudent } = require('../../middleware/auth');

function createAppWithSession(sessionData) {
  const app = express();
  app.use(express.json());
  app.use(session({
    secret: 'test-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, sameSite: 'strict', maxAge: 28800000 }
  }));

  // Setup endpoint to initialize session
  app.post('/setup', (req, res) => {
    if (req.body.admin) req.session.admin = true;
    if (req.body.studentId) req.session.studentId = req.body.studentId;
    if (req.body.studentName) req.session.studentName = req.body.studentName;
    req.session.save(() => res.json({ ok: true }));
  });

  app.get('/admin/protected', requireAdmin, (req, res) => {
    res.json({ ok: true, role: 'admin' });
  });

  app.get('/student/protected', requireStudent, (req, res) => {
    res.json({ ok: true, role: 'student', id: req.session.studentId });
  });

  app.get('/student/:id/protected', (req, res, next) => {
    const middleware = authorizeStudent(parseInt(req.params.id));
    middleware(req, res, next);
  }, (req, res) => {
    res.json({ ok: true, studentId: req.session.studentId });
  });

  app.get('/check-session', (req, res) => {
    res.json({ 
      admin: req.session.admin, 
      studentId: req.session.studentId,
      studentName: req.session.studentName 
    });
  });

  return app;
}

describe('requireAdmin', () => {
  const app = createAppWithSession();

  it('crida next si hi ha sessió admin', async () => {
    const agent = supertest.agent(app);
    
    // Initialize session with admin
    const setup = await agent.post('/setup').send({ admin: true });
    expect(setup.body.ok).to.be.true;
    
    // Access protected route
    const response = await agent.get('/admin/protected');
    expect(response.status).to.equal(200);
    expect(response.body.ok).to.be.true;
    expect(response.body.role).to.equal('admin');
  });

  it('respon 403 si no hi ha sessió admin', async () => {
    const response = await supertest(app).get('/admin/protected');
    expect(response.status).to.equal(403);
    expect(response.body.error).to.equal('No autoritzat');
  });
});

describe('requireStudent', () => {
  const app = createAppWithSession();

  it('crida next si hi ha sessió studentId', async () => {
    const agent = supertest.agent(app);
    
    const setup = await agent.post('/setup').send({ studentId: 5, studentName: 'Test' });
    expect(setup.body.ok).to.be.true;
    
    const response = await agent.get('/student/protected');
    expect(response.status).to.equal(200);
    expect(response.body.ok).to.be.true;
    expect(response.body.id).to.equal(5);
  });

  it('respon 403 si no hi ha sessió studentId', async () => {
    const response = await supertest(app).get('/student/protected');
    expect(response.status).to.equal(403);
    expect(response.body.error).to.equal('No autoritzat');
  });
});

describe('authorizeStudent', () => {
  const app = createAppWithSession();

  it('crida next si l\'ID coincideix', async () => {
    const agent = supertest.agent(app);
    
    await agent.post('/setup').send({ studentId: 5 });
    const response = await agent.get('/student/5/protected');
    expect(response.status).to.equal(200);
    expect(response.body.ok).to.be.true;
    expect(response.body.studentId).to.equal(5);
  });

  it('respon 403 si l\'ID no coincideix', async () => {
    const agent = supertest.agent(app);
    
    await agent.post('/setup').send({ studentId: 10 });
    const response = await agent.get('/student/5/protected');
    expect(response.status).to.equal(403);
    expect(response.body.error).to.equal('No autoritzat');
  });

  it('respon 403 sense sessió', async () => {
    const response = await supertest(app).get('/student/5/protected');
    expect(response.status).to.equal(403);
    expect(response.body.error).to.equal('No autoritzat');
  });
});
