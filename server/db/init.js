const { init: initDB, query, run, save } = require('./db');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', 'settings.env') });

async function initSchema() {
  await initDB();
  
  // Crear taules si no existeixen
  run(`
    CREATE TABLE IF NOT EXISTS alumnes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nom TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  run(`
    CREATE TABLE IF NOT EXISTS practiques (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titol TEXT NOT NULL,
      criteria TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  run(`
    CREATE TABLE IF NOT EXISTS entregues (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      alumne_id INTEGER NOT NULL,
      practica_id INTEGER NOT NULL,
      repo_url TEXT NOT NULL,
      estat TEXT DEFAULT 'pendent',
      revisada INTEGER DEFAULT 0,
      revisat_per INTEGER,
      revisat_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (alumne_id) REFERENCES alumnes(id),
      FOREIGN KEY (practica_id) REFERENCES practiques(id)
    )
  `);
  
  run(`
    CREATE TABLE IF NOT EXISTS valoracions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      entrega_id INTEGER UNIQUE NOT NULL,
      estat TEXT DEFAULT 'pendent',
      resultat TEXT,
      comentaris TEXT,
      detall TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (entrega_id) REFERENCES entregues(id)
    )
  `);
  
  save();
  console.log('Esquema de base de dades inicialitzat correctament');
  
  const tables = query("SELECT name FROM sqlite_master WHERE type='table'");
  console.log('Taules:', tables.map(t => t.name));
}

if (require.main === module) {
  initSchema()
    .then(() => process.exit(0))
    .catch(err => { console.error(err); process.exit(1); });
}

module.exports = { initSchema };
