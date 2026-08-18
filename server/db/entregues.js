const { query, run, save } = require('./db');

function getAll(filters = {}) {
  let sql = 'SELECT entregues.*, alumnes.nom as alumne_nom, alumnes.email as alumne_email, practiques.titol as practica_titol FROM entregues JOIN alumnes ON entregues.alumne_id = alumnes.id JOIN practiques ON entregues.practica_id = practiques.id';
  const params = [];
  
  if (filters.alumne_id) {
    sql += ' WHERE entregues.alumne_id = ?';
    params.push(filters.alumne_id);
  }
  if (filters.practica_id) {
    sql += params.length > 0 ? ' AND practica_id = ?' : ' WHERE practica_id = ?';
    params.push(filters.practica_id);
  }
  if (filters.estat) {
    sql += params.length > 0 ? ' AND estat = ?' : ' WHERE estat = ?';
    params.push(filters.estat);
  }
  
  sql += ' ORDER BY entregues.created_at DESC';
  return query(sql, params);
}

function getById(id) {
  const rows = query(
    `SELECT entregues.*, alumnes.nom as alumne_nom, alumnes.email as alumne_email, practiques.titol as practica_titol 
     FROM entregues 
     JOIN alumnes ON entregues.alumne_id = alumnes.id 
     JOIN practiques ON entregues.practica_id = practiques.id 
     WHERE entregues.id = ?`,
    [id]
  );
  return rows.length > 0 ? rows[0] : null;
}

function getByAlumne(alumne_id, filters = {}) {
  let sql = `SELECT entregues.*, practiques.titol as practica_titol 
             FROM entregues 
             JOIN practiques ON entregues.practica_id = practiques.id 
             WHERE entregues.alumne_id = ?`;
  const params = [alumne_id];
  
  if (filters.practica_id) {
    sql += ' AND entregues.practica_id = ?';
    params.push(filters.practica_id);
  }
  
  sql += ' ORDER BY entregues.created_at DESC';
  return query(sql, params);
}

function getByPractica(practica_id) {
  const rows = query(
    `SELECT entregues.*, alumnes.nom as alumne_nom, alumnes.email as alumne_email 
     FROM entregues 
     JOIN alumnes ON entregues.alumne_id = alumnes.id 
     WHERE entregues.practica_id = ? 
     ORDER BY entregues.created_at DESC`,
    [practica_id]
  );
  return rows;
}

function getNoRevisades(alumne_id) {
  const rows = query(
    `SELECT entregues.*, practiques.titol as practica_titol 
     FROM entregues 
     JOIN practiques ON entregues.practica_id = practiques.id 
     WHERE entregues.alumne_id = ? AND entregues.revisada = 0 
     ORDER BY entregues.created_at DESC`,
    [alumne_id]
  );
  return rows;
}

function create({ alumne_id, practica_id, repo_url }) {
  run('INSERT INTO entregues (alumne_id, practica_id, repo_url, estat) VALUES (?, ?, ?, ?)', 
    [alumne_id, practica_id, repo_url, 'pendent']);
  const id = require('./db').lastInsertRowId();
  save();
  return getById(id);
}

function updateEstat(id, estat) {
  run('UPDATE entregues SET estat = ? WHERE id = ?', [estat, id]);
  save();
  return getById(id);
}

function marcarRevisada(id, revisat_per) {
  run('UPDATE entregues SET revisada = 1, revisat_per = ?, revisat_at = CURRENT_TIMESTAMP WHERE id = ?', 
    [revisat_per, id]);
  save();
  return getById(id);
}

function destroy(id) {
  run('DELETE FROM entregues WHERE id = ?', [id]);
  save();
  return true;
}

function exists(id) {
  const rows = query('SELECT id FROM entregues WHERE id = ?', [id]);
  return rows.length > 0;
}

function getByAlumnePractica(alumne_id, practica_id) {
  const rows = query(
    'SELECT id FROM entregues WHERE alumne_id = ? AND practica_id = ? AND revisada = 0',
    [alumne_id, practica_id]
  );
  return rows.length > 0 ? rows[0] : null;
}

module.exports = {
  getAll,
  getById,
  getByAlumne,
  getByPractica,
  getNoRevisades,
  create,
  updateEstat,
  marcarRevisada,
  destroy,
  exists,
  getByAlumnePractica
};
