const fs = require('fs');
const path = require('path');
const express = require('express');
const session = require('express-session');
const db = require('./db');

// Parse settings.env
function loadSettings(envPath) {
  const raw = fs.readFileSync(envPath, 'utf8');
  const settings = {};
  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.substring(0, eqIdx).trim();
    const value = trimmed.substring(eqIdx + 1).trim();
    settings[key] = value;
  }
  return settings;
}

const settingsPath = path.join(__dirname, 'settings.env');
const settings = loadSettings(settingsPath);

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: settings.SESSION_SECRET || 'fallback_secret',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'strict', maxAge: 28800000 }
}));

// Health endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/', (req, res) => {
  res.json({ message: 'RevisorDeures API' });
});

app.get('/check-session', (req, res) => {
  res.json({
    admin: req.session.admin,
    studentId: req.session.studentId,
    studentName: req.session.studentName,
    studentEmail: req.session.studentEmail
  });
});

// Rutes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const PORT = settings.PORT || 3000;

if (process.env.NODE_ENV !== 'test') {
  const server = app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

module.exports = app;
