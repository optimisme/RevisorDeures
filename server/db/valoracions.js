const { query, run, save } = require('./db');

function getByEntrega(entrega_id) {
  const rows = query('SELECT id, entrega_id, estat, resultat, comentaris, detall, created_at, updated_at FROM valoracions WHERE entrega_id = ?', [entrega_id]);
  return rows.length > 0 ? rows[0] : null;
}

function create({ entrega_id, estat, resultat, comentaris, detall }) {
  run(
    'INSERT INTO valoracions (entrega_id, estat, resultat, comentaris, detall) VALUES (?, ?, ?, ?, ?)',
    [entrega_id, estat || 'pendent', resultat || null, comentaris || null, detall || null]
  );
  const id = require('./db').lastInsertRowId();
  save();
  return getById(id);
}

function getById(id) {
  const rows = query('SELECT id, entrega_id, estat, resultat, comentaris, detall, created_at, updated_at FROM valoracions WHERE id = ?', [id]);
  return rows.length > 0 ? rows[0] : null;
}

function updateEstat(id, estat) {
  run('UPDATE valoracions SET estat = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [estat, id]);
  save();
  return getById(id);
}

function updateResultat(id, resultat, comentaris, detall) {
  run(
    'UPDATE valoracions SET resultat = ?, comentaris = ?, detall = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [resultat, comentaris, detall, id]
  );
  save();
  return getById(id);
}

function getByAlumne(alumne_id) {
  const rows = query(
    `SELECT valoracions.*, entregues.repo_url, practiques.titol as practica_titol, alumnes.nom as alumne_nom
     FROM valoracions
     JOIN entregues ON valoracions.entrega_id = entregues.id
     JOIN alumnes ON entregues.alumne_id = alumnes.id
     JOIN practiques ON entregues.practica_id = practiques.id
     WHERE entregues.alumne_id = ?
     ORDER BY valoracions.created_at DESC`,
    [alumne_id]
  );
  return rows;
}

function exists(entrega_id) {
  const rows = query('SELECT id FROM valoracions WHERE entrega_id = ?', [entrega_id]);
  return rows.length > 0;
}

module.exports = {
  getByEntrega,
  getById,
  create,
  updateEstat,
  updateResultat,
  getByAlumne,
  exists
};
