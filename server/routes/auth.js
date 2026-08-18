const express = require('express');
const router = express.Router();
const alumnes = require('../db/alumnes');
require('dotenv').config({ path: __dirname + '/../settings.env' });

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { usuari, password } = req.body;
  
  if (!usuari || !password) {
    return res.status(400).json({ error: 'Campus obligatoris: usuari, password' });
  }
  
  // Admin login
  if (usuari === 'admin') {
    if (password === process.env.SERVER_ADMIN_PWD) {
      req.session.user = { id: 1, rol: 'admin', usuari: 'admin' };
      req.session.save(() => {
        return res.json({ rol: 'admin', usuari: 'admin' });
      });
      return;
    }
  }
  
  // Alumne login
  const alumne = alumnes.getByEmail(usuari);
  if (!alumne) {
    return res.status(401).json({ error: 'Credencials incorrectes' });
  }
  
  if (alumnes.hashPassword(password) !== alumne.password_hash) {
    return res.status(401).json({ error: 'Credencials incorrectes' });
  }
  
  req.session.user = { rol: 'alumne', alumne_id: alumne.id, nom: alumne.nom, email: alumne.email };
  req.session.save(() => {
    res.json({ rol: 'alumne', alumne_id: alumne.id, nom: alumne.nom, email: alumne.email });
  });
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Error tancant sessió' });
    }
    res.json({ message: 'Sessió tancada' });
  });
});

// GET /api/auth/session
router.get('/session', (req, res) => {
  if (req.session && req.session.user) {
    res.json(req.session.user);
  } else {
    res.json(null);
  }
});

module.exports = router;

function requireAuth(roles) {
  return (req, res, next) => {
    if (!req.session || !req.session.user) {
      return res.status(401).json({ error: 'Cal estar identificat' });
    }
    
    req.user = req.session.user;
    
    if (!roles || roles.length === 0) {
      return next();
    }
    
    if (!roles.includes(req.session.user.rol)) {
      return res.status(403).json({ error: 'No tens permís per aquesta acció' });
    }
    
    return next();
  };
}

module.exports.requireAuth = requireAuth;
