const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

let db;
let initialized = false;
const DB_PATH = path.join(__dirname, 'data', 'data.db');

async function init() {
  const sql = await initSqlJs();
  
  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    db = new sql.Database(buffer);
  } else {
    db = new sql.Database();
  }
  
  initialized = true;
  return db;
}

function getInstance() {
  if (!initialized || !db) {
    throw new Error('Base de dades no inicialitzada. Crida db.init() primer.');
  }
  return db;
}

function run(sql, params = []) {
  const d = getInstance();
  const stmt = d.prepare(sql);
  stmt.bind(params);
  stmt.step();
  stmt.free();
}

function escapeValue(val) {
  if (val === null) return 'NULL';
  if (typeof val === 'number') return val.toString();
  if (typeof val === 'boolean') return val ? '1' : '0';
  // Escape single quotes
  const escaped = String(val).replace(/'/g, "''");
  return `'${escaped}'`;
}

function query(sql, params = []) {
  const d = getInstance();
  
  if (params.length > 0) {
    // For parameterized queries, replace ? with escaped values and use exec
    let query = sql;
    params.forEach(val => {
      query = query.replace('?', escapeValue(val), 1);
    });
    const result = d.exec(query);
    if (!result.length) return [];
    
    const cols = result[0].columns;
    const rows = result[0].values;
    return rows.map(row => {
      const obj = {};
      cols.forEach((col, idx) => obj[col] = row[idx]);
      return obj;
    });
  }
  
  // For non-parameterized queries, use exec
  const result = d.exec(sql);
  if (!result.length) return [];
  
  const cols = result[0].columns;
  const rows = result[0].values;
  return rows.map(row => {
    const obj = {};
    cols.forEach((col, idx) => obj[col] = row[idx]);
    return obj;
  });
}

function exec(sql) {
  const d = getInstance();
  return d.exec(sql);
}

function lastInsertRowId() {
  const d = getInstance();
  const rows = d.exec('SELECT last_insert_rowid()');
  return rows[0] ? rows[0].values[0][0] : 0;
}

function save() {
  if (!db) return;
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

// Save on unload
process.on('exit', save);
process.on('SIGINT', () => { save(); process.exit(0); });
process.on('SIGTERM', () => { save(); process.exit(0); });

module.exports = { init, getInstance, run, query, exec, lastInsertRowId, save };
