require('dotenv').config({ path: './settings.env' });
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const path = require('path');
const { init } = require('./db/db');
const { initSchema } = require('./db/init');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sessions
app.use(session({
  secret: process.env.SESSION_SECRET || 'default-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }
}));

// Estàtics
app.use(express.static(path.join(__dirname, 'public')));

// Rutes API
const routesDir = path.join(__dirname, 'routes');
require('fs').readdirSync(routesDir).forEach(file => {
  if (file.endsWith('.js') && file !== 'index.js') {
    const route = require(path.join(routesDir, file));
    const routeName = file.replace('.js', '');
    // Auth routes go under /api/auth/*
    if (routeName === 'auth') {
      app.use('/api/auth', route);
    } else {
      app.use(`/api/${routeName}`, route);
    }
  }
});

// Health check
app.get('/api', (req, res) => {
  res.json({ status: 'ok', name: 'RevisorDeures API' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ error: 'Error intern del servidor' });
});

// Pàgines HTML
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin.html')));
app.get('/admin/alumnes', (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin-alumnes.html')));
app.get('/admin/practiques', (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin-practiques.html')));
app.get('/admin/entregues', (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin-entregues.html')));
app.get('/alumne', (req, res) => res.sendFile(path.join(__dirname, 'public', 'alumne.html')));
app.get('/alumne/entregues', (req, res) => res.sendFile(path.join(__dirname, 'public', 'alumne-entregues.html')));
app.get('/alumne/enviar', (req, res) => res.sendFile(path.join(__dirname, 'public', 'alumne-enviar.html')));

app.listen(PORT, () => {
  console.log(`Servidor escoltant al port ${PORT}`);
});

// Inicialitzar BD
init()
  .then(() => initSchema())
  .then(() => {
    console.log('Base de dades inicialitzada');
    
    // Iniciar servidor d'avaluació automàtica
    try {
      const evaluator = require('./evaluator');
      evaluator.startEvaluatorServer(3001);
    } catch (err) {
      console.error('Error iniciant evaluator:', err.message);
    }
  })
  .catch(err => { console.error('Error inicialitzant BD:', err); process.exit(1); });
