const path = require('path');
const Database = require('better-sqlite3');

const useMemory = process.env.USE_MEMORY_DB === '1';
const dbPath = useMemory ? ':memory:' : path.join(__dirname, 'revisordeures.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS alumnes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS practiques (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titol TEXT NOT NULL,
    criterios TEXT NOT NULL,
    github_url TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS entregues (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    alumne_id INTEGER NOT NULL,
    practica_id INTEGER NOT NULL,
    github_url TEXT NOT NULL,
    accepted INTEGER DEFAULT 0,
    graded INTEGER DEFAULT 0,
    grade_summary TEXT,
    reviewed INTEGER DEFAULT 0,
    reviewed_at TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (alumne_id) REFERENCES alumnes(id),
    FOREIGN KEY (practica_id) REFERENCES practiques(id),
    UNIQUE(alumne_id, practica_id)
  );

  CREATE INDEX IF NOT EXISTS idx_entregues_alumne_id ON entregues(alumne_id);
  CREATE INDEX IF NOT EXISTS idx_entregues_practica_id ON entregues(practica_id);
`);

function prepare(sql) {
  return db.prepare(sql);
}

// Alumnes CRUD
module.exports.alumnes = {
  findAll: () => {
    const stmt = prepare('SELECT id, email, name FROM alumnes');
    return stmt.all();
  },
  findById: (id) => {
    const stmt = prepare('SELECT id, email, name FROM alumnes WHERE id = ?');
    return stmt.get(id) || null;
  },
  findByEmail: (email) => {
    const stmt = prepare('SELECT * FROM alumnes WHERE email = ?');
    return stmt.get(email) || null;
  },
  create: ({ email, password_hash, name }) => {
    const stmt = prepare('INSERT INTO alumnes (email, password_hash, name) VALUES (?, ?, ?)');
    const result = stmt.run(email, password_hash, name);
    return result.lastInsertRowid;
  },
  update: (id, data) => {
    const fields = [];
    const values = [];
    if (data.name !== undefined) { fields.push('name = ?'); values.push(data.name); }
    if (data.email !== undefined) { fields.push('email = ?'); values.push(data.email); }
    if (data.password_hash !== undefined) { fields.push('password_hash = ?'); values.push(data.password_hash); }
    if (fields.length === 0) return true;
    const stmt = prepare(`UPDATE alumnes SET ${fields.join(', ')}, updated_at = datetime('now') WHERE id = ?`);
    values.push(id);
    stmt.run(...values);
    return true;
  },
  delete: (id) => {
    const stmt = prepare('DELETE FROM alumnes WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }
};

// Practiques CRUD
module.exports.practiques = {
  findAll: () => {
    const stmt = prepare('SELECT * FROM practiques');
    return stmt.all();
  },
  findById: (id) => {
    const stmt = prepare('SELECT * FROM practiques WHERE id = ?');
    return stmt.get(id) || null;
  },
  create: ({ titol, criterios, github_url }) => {
    const stmt = prepare('INSERT INTO practiques (titol, criterios, github_url) VALUES (?, ?, ?)');
    const result = stmt.run(titol, criterios, github_url);
    return result.lastInsertRowid;
  },
  update: (id, data) => {
    const fields = [];
    const values = [];
    if (data.titol !== undefined) { fields.push('titol = ?'); values.push(data.titol); }
    if (data.criterios !== undefined) { fields.push('criterios = ?'); values.push(data.criterios); }
    if (data.github_url !== undefined) { fields.push('github_url = ?'); values.push(data.github_url); }
    if (fields.length === 0) return true;
    const stmt = prepare(`UPDATE practiques SET ${fields.join(', ')}, updated_at = datetime('now') WHERE id = ?`);
    values.push(id);
    stmt.run(...values);
    return true;
  },
  delete: (id) => {
    const stmt = prepare('DELETE FROM practiques WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }
};

// Entregues CRUD
module.exports.entregues = {
  findAll: (filter) => {
    let sql = 'SELECT * FROM entregues';
    const params = [];
    if (filter) {
      const conditions = [];
      if (filter.alumne_id !== undefined) { conditions.push('alumne_id = ?'); params.push(filter.alumne_id); }
      if (filter.practica_id !== undefined) { conditions.push('practica_id = ?'); params.push(filter.practica_id); }
      if (conditions.length > 0) {
        sql += ' WHERE ' + conditions.join(' AND ');
      }
    }
    sql += ' ORDER BY created_at DESC';
    const stmt = prepare(sql);
    return stmt.all(...params);
  },
  findById: (id) => {
    const stmt = prepare('SELECT * FROM entregues WHERE id = ?');
    return stmt.get(id) || null;
  },
  findByAlumneAndPractica: (alumne_id, practica_id) => {
    const stmt = prepare('SELECT * FROM entregues WHERE alumne_id = ? AND practica_id = ?');
    return stmt.get(alumne_id, practica_id) || null;
  },
  create: ({ alumne_id, practica_id, github_url }) => {
    const stmt = prepare('INSERT INTO entregues (alumne_id, practica_id, github_url) VALUES (?, ?, ?)');
    const result = stmt.run(alumne_id, practica_id, github_url);
    return result.lastInsertRowid;
  },
  update: (id, data) => {
    const fields = [];
    const values = [];
    if (data.github_url !== undefined) { fields.push('github_url = ?'); values.push(data.github_url); }
    if (data.accepted !== undefined) { fields.push('accepted = ?'); values.push(data.accepted); }
    if (data.graded !== undefined) { fields.push('graded = ?'); values.push(data.graded); }
    if (data.grade_summary !== undefined) { fields.push('grade_summary = ?'); values.push(data.grade_summary); }
    if (data.reviewed !== undefined) { fields.push('reviewed = ?'); values.push(data.reviewed); }
    if (data.reviewed_at !== undefined) { fields.push('reviewed_at = ?'); values.push(data.reviewed_at); }
    if (fields.length === 0) return true;
    const stmt = prepare(`UPDATE entregues SET ${fields.join(', ')}, updated_at = datetime('now') WHERE id = ?`);
    values.push(id);
    stmt.run(...values);
    return true;
  },
  delete: (id) => {
    const stmt = prepare('DELETE FROM entregues WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }
};

module.exports.db = db;
