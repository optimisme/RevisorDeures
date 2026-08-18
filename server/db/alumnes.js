const crypto = require('crypto');
const { query, run, lastInsertRowId, save } = require('./db');

function hashPassword(pwd) {
  return crypto.createHash('md5').update(pwd).digest('hex');
}

function getAll() {
  const rows = query('SELECT id, nom, email, password_hash, created_at FROM alumnes ORDER BY id');
  return rows.map(r => ({
    id: r.id,
    nom: r.nom,
    email: r.email,
    password_hash: r.password_hash,
    created_at: r.created_at
  }));
}

function getById(id) {
  const rows = query('SELECT id, nom, email, password_hash, created_at FROM alumnes WHERE id = ?', [id]);
  return rows.length > 0 ? rows[0] : null;
}

function getByEmail(email) {
  const rows = query('SELECT id, nom, email, password_hash, created_at FROM alumnes WHERE email = ?', [email]);
  return rows.length > 0 ? rows[0] : null;
}

function create({ nom, email, password }) {
  const password_hash = hashPassword(password);
  run('INSERT INTO alumnes (nom, email, password_hash) VALUES (?, ?, ?)', [nom, email, password_hash]);
  const id = lastInsertRowId();
  save();
  return getById(id);
}

function update(id, { nom, email }) {
  if (nom) run('UPDATE alumnes SET nom = ? WHERE id = ?', [nom, id]);
  if (email) run('UPDATE alumnes SET email = ? WHERE id = ?', [email, id]);
  save();
  return getById(id);
}

function eliminar(id) {
  const alumne = getById(id);
  if (!alumne) return false;
  run('DELETE FROM alumnes WHERE id = ?', [id]);
  save();
  return true;
}

function existsByEmail(email) {
  const rows = query('SELECT id FROM alumnes WHERE email = ?', [email]);
  return rows.length > 0;
}

module.exports = { getAll, getById, getByEmail, create, update, eliminar, existsByEmail, hashPassword };
