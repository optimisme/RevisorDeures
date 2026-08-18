const { query, run, save } = require('./db');

function getAll() {
  return query('SELECT id, titol, criteria, created_at FROM practiques ORDER BY id');
}

function getById(id) {
  const rows = query('SELECT id, titol, criteria, created_at FROM practiques WHERE id = ?', [id]);
  return rows.length > 0 ? rows[0] : null;
}

function create({ titol, criteria }) {
  run('INSERT INTO practiques (titol, criteria) VALUES (?, ?)', [titol, criteria || null]);
  const id = require('./db').lastInsertRowId();
  save();
  return getById(id);
}

function update(id, { titol, criteria }) {
  if (titol) run('UPDATE practiques SET titol = ? WHERE id = ?', [titol, id]);
  if (criteria !== undefined) run('UPDATE practiques SET criteria = ? WHERE id = ?', [criteria, id]);
  save();
  return getById(id);
}

function destroy(id) {
  run('DELETE FROM practiques WHERE id = ?', [id]);
  save();
  return true;
}

function exists(id) {
  const rows = query('SELECT id FROM practiques WHERE id = ?', [id]);
  return rows.length > 0;
}

module.exports = { getAll, getById, create, update, destroy, exists };
