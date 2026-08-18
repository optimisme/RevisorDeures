const { expect } = require('chai');
const { hashPassword, comparePassword } = require('../../lib/hash');

describe('hashPassword', () => {
  it('retorna un string de 32 caràcters', () => {
    const hash = hashPassword('test');
    expect(hash).to.be.a('string').with.length(32);
  });

  it('retorna només caràcters hex', () => {
    const hash = hashPassword('test');
    expect(hash).to.match(/^[0-9a-f]+$/);
  });

  it('mateix password sempre retorna el mateix hash', () => {
    expect(hashPassword('same')).to.equal(hashPassword('same'));
  });

  it('passwords diferents retornen hashes diferents', () => {
    expect(hashPassword('a')).to.not.equal(hashPassword('b'));
  });

  it('gestiona passwords buits', () => {
    const hash = hashPassword('');
    expect(hash).to.be.a('string').with.length(32);
  });

  it('gestiona passwords llargs', () => {
    const longPassword = 'a'.repeat(1000);
    const hash = hashPassword(longPassword);
    expect(hash).to.be.a('string').with.length(32);
  });

  it('gestiona passwords amb caràcters especials', () => {
    const hash = hashPassword('p@$$w0rd!#$%&');
    expect(hash).to.be.a('string').with.length(32);
  });
});

describe('comparePassword', () => {
  it('retorna true amb password correcte', () => {
    const hash = hashPassword('secret');
    expect(comparePassword('secret', hash)).to.be.true;
  });

  it('retorna false amb password incorrecte', () => {
    const hash = hashPassword('secret');
    expect(comparePassword('wrong', hash)).to.be.false;
  });

  it('retorna true per a password buits', () => {
    const hash = hashPassword('');
    expect(comparePassword('', hash)).to.be.true;
  });

  it('retorna false si el hash no és vàlid', () => {
    expect(comparePassword('secret', 'notahash')).to.be.false;
  });

  it('compara passwords llargs correctament', () => {
    const longPassword = 'a'.repeat(1000);
    const hash = hashPassword(longPassword);
    expect(comparePassword(longPassword, hash)).to.be.true;
    expect(comparePassword('wrong', hash)).to.be.false;
  });
});
