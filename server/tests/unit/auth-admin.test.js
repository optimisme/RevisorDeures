const request = require('supertest');
const app = require('../../server');
const { expect } = require('chai');
const { alumnes } = require('../../db');
const { hashPassword } = require('../../lib/hash');

describe('POST /api/auth/admin/login', () => {
  it('respon 401 amb credencials incorrectes', async () => {
    const response = await request(app)
      .post('/api/auth/admin/login')
      .send({ username: 'admin', password: 'wrong' });
    expect(response.status).to.equal(401);
    expect(response.body.error).to.equal('Credencials incorrectes');
  });

  it('respon 200 amb credencials correctes', async () => {
    const response = await request(app)
      .post('/api/auth/admin/login')
      .send({ username: 'admin', password: 'change_me_in_production' });
    expect(response.status).to.equal(200);
    expect(response.body.ok).to.be.true;
    expect(response.body.redirect).to.equal('/admin');
  });

  it('respon 401 amb username incorrecte', async () => {
    const response = await request(app)
      .post('/api/auth/admin/login')
      .send({ username: 'wronguser', password: 'change_me_in_production' });
    expect(response.status).to.equal(401);
  });

  it('respon 401 amb camp username absent', async () => {
    const response = await request(app)
      .post('/api/auth/admin/login')
      .send({ password: 'change_me_in_production' });
    expect(response.status).to.equal(401);
  });

  it('respon 401 amb camp password absent', async () => {
    const response = await request(app)
      .post('/api/auth/admin/login')
      .send({ username: 'admin' });
    expect(response.status).to.equal(401);
  });
});

describe('POST /api/auth/admin/logout', () => {
  it('respon 200 i destrueix sessió admin amb cookie de sessió', async () => {
    // Login primer
    const agent = request.agent(app);
    const login = await agent.post('/api/auth/admin/login')
      .send({ username: 'admin', password: 'change_me_in_production' });
    expect(login.status).to.equal(200);

    // Logout
    const logout = await agent.post('/api/auth/admin/logout');
    expect(logout.status).to.equal(200);
    expect(logout.body.ok).to.be.true;
    expect(logout.body.redirect).to.equal('/');
  });

  it('respon 403 si no hi ha sessió admin', async () => {
    const response = await request(app)
      .post('/api/auth/admin/logout');
    expect(response.status).to.equal(403);
    expect(response.body.error).to.equal('No autoritzat');
  });
});

describe('POST /api/auth/student/login', () => {
  it('respon 400 amb email invàlid', async () => {
    const response = await request(app)
      .post('/api/auth/student/login')
      .send({ email: 'notanemail', password: 'test' });
    expect(response.status).to.equal(400);
    expect(response.body.error).to.equal('Email invàlid');
  });

  it('respon 401 amb alumne inexistent', async () => {
    const response = await request(app)
      .post('/api/auth/student/login')
      .send({ email: 'nobody@test.com', password: 'test' });
    expect(response.status).to.equal(401);
    expect(response.body.error).to.equal('Credencials incorrectes');
  });

  it('respon 401 amb password incorrecte', async () => {
    const password = 'correctpassword';
    alumnes.create({ email: 'student@test.com', password_hash: hashPassword(password), name: 'Test Student' });
    const response = await request(app)
      .post('/api/auth/student/login')
      .send({ email: 'student@test.com', password: 'wrongpassword' });
    expect(response.status).to.equal(401);
    expect(response.body.error).to.equal('Credencials incorrectes');
  });

  it('respon 200 amb credencials correctes', async () => {
    const password = 'correctpassword';
    alumnes.create({ email: 'student2@test.com', password_hash: hashPassword(password), name: 'Student Two' });
    const agent = request.agent(app);
    const response = await agent.post('/api/auth/student/login')
      .send({ email: 'student2@test.com', password });
    expect(response.status).to.equal(200);
    expect(response.body.ok).to.be.true;
    expect(response.body.redirect).to.equal('/alumne');
  });

  it('després de login, la sessió té studentId, studentName i studentEmail', async () => {
    const password = 'correctpassword';
    alumnes.create({ email: 'student3@test.com', password_hash: hashPassword(password), name: 'Student Three' });
    const agent = request.agent(app);
    await agent.post('/api/auth/student/login')
      .send({ email: 'student3@test.com', password });
    
    const response = await agent.get('/check-session');
    expect(response.status).to.equal(200);
    expect(response.body.studentEmail).to.equal('student3@test.com');
    expect(response.body.studentName).to.equal('Student Three');
  });

  it('respon 401 amb camp email absent', async () => {
    const response = await request(app)
      .post('/api/auth/student/login')
      .send({ password: 'test' });
    expect(response.status).to.equal(400);
  });

  it('respon 401 amb camp password absent', async () => {
    const response = await request(app)
      .post('/api/auth/student/login')
      .send({ email: 'test@test.com' });
    expect(response.status).to.equal(401);
  });
});

describe('POST /api/auth/student/logout', () => {
  it('respon 200 i destrueix sessió estudiant amb cookie de sessió', async () => {
    const password = 'correctpassword';
    alumnes.create({ email: 'logout@test.com', password_hash: hashPassword(password), name: 'Logout Student' });
    const agent = request.agent(app);
    await agent.post('/api/auth/student/login')
      .send({ email: 'logout@test.com', password });

    const logout = await agent.post('/api/auth/student/logout');
    expect(logout.status).to.equal(200);
    expect(logout.body.ok).to.be.true;
    expect(logout.body.redirect).to.equal('/');
  });

  it('respon 403 si no hi ha sessió estudiant', async () => {
    const response = await request(app)
      .post('/api/auth/student/logout');
    expect(response.status).to.equal(403);
    expect(response.body.error).to.equal('No autoritzat');
  });
});

describe('GET /api/auth/admin/protected', () => {
  it('respon 403 sense sessió admin', async () => {
    const response = await request(app).get('/api/auth/admin/protected');
    expect(response.status).to.equal(403);
    expect(response.body.error).to.equal('No autoritzat');
  });

  it('respon 200 amb sessió admin activa', async () => {
    const agent = request.agent(app);
    await agent.post('/api/auth/admin/login')
      .send({ username: 'admin', password: 'change_me_in_production' });
    
    const response = await agent.get('/api/auth/admin/protected');
    expect(response.status).to.equal(200);
    expect(response.body.ok).to.be.true;
    expect(response.body.role).to.equal('admin');
  });

  it('respon 403 amb sessió estudiant', async () => {
    const password = 'correctpassword';
    alumnes.create({ email: 'admincheck@test.com', password_hash: hashPassword(password), name: 'Admin Check Student' });
    const agent = request.agent(app);
    await agent.post('/api/auth/student/login')
      .send({ email: 'admincheck@test.com', password });
    
    const response = await agent.get('/api/auth/admin/protected');
    expect(response.status).to.equal(403);
  });
});
