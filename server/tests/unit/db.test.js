const { expect } = require('chai');
const db = require('../../db');

describe('DB connection', () => {
  it('connecta i pot crear alumnes', () => {
    const id = db.alumnes.create({ email: 't@t.com', password_hash: 'h', name: 'Test' });
    expect(id).to.exist;
    const alumne = db.alumnes.findById(id);
    expect(alumne).to.exist;
    expect(alumne.email).to.equal('t@t.com');
  });

  it('llegeix tots els alumnes', () => {
    db.alumnes.create({ email: 'altre@t.com', password_hash: 'h', name: 'Altres' });
    const alumnes = db.alumnes.findAll();
    expect(alumnes.length).to.be.greaterThan(0);
  });
});
