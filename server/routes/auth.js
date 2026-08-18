const express = require('express');
const fs = require('fs');
const path = require('path');
const { alumnes } = require('../db');
const { comparePassword } = require('../lib/hash');
const { requireAdmin, requireStudent } = require('../middleware/auth');

function parseSettingsEnv() {
  const content = fs.readFileSync(path.join(__dirname, '..', 'settings.env'), 'utf8');
  const obj = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        obj[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
      }
    }
  }
  return obj;
}

const settings = parseSettingsEnv();

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

const router = express.Router();

// Admin login
router.post('/admin/login', (req, res) => {
  const { username, password } = req.body;
  
  if (username === settings.ADMIN_USER && password === settings.ADMIN_PASSWORD) {
    req.session.admin = true;
    req.session.save((err) => {
      if (err) {
        return res.status(500).json({ error: 'Error intern' });
      }
      return res.json({ ok: true, redirect: '/admin' });
    });
  } else {
    res.status(401).json({ error: 'Credencials incorrectes' });
  }
});

// Admin logout
router.post('/admin/logout', requireAdmin, (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      // If session already destroyed, still return success
      return res.json({ ok: true, redirect: '/' });
    }
    return res.json({ ok: true, redirect: '/' });
  });
});

// Admin protected endpoint (prova)
router.get('/admin/protected', requireAdmin, (req, res) => {
  res.json({ ok: true, role: 'admin', session: req.session });
});

// Student login
router.post('/student/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Email invàlid' });
  }
  
  const alumne = alumnes.findByEmail(email);
  if (!alumne) {
    return res.status(401).json({ error: 'Credencials incorrectes' });
  }
  
  if (!comparePassword(password, alumne.password_hash)) {
    return res.status(401).json({ error: 'Credencials incorrectes' });
  }
  
  req.session.studentId = alumne.id;
  req.session.studentName = alumne.name;
  req.session.studentEmail = alumne.email;
  req.session.save((err) => {
    if (err) {
      return res.status(500).json({ error: 'Error intern' });
    }
    return res.json({ ok: true, redirect: '/alumne' });
  });
});

// Student logout
router.post('/student/logout', requireStudent, (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.json({ ok: true, redirect: '/' });
    }
    return res.json({ ok: true, redirect: '/' });
  });
});

module.exports = router;
