const express = require('express');
const router = express.Router();
const alumnes = require('../db/alumnes');
const { requireAuth } = require('./auth');

// Middleware per verificar format d'email
function validEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// GET /api/alumnes — llista totes les alumnes (sense password)
router.get('/', requireAuth('admin'), (req, res) => {
  try {
    const alumnesList = alumnes.getAll();
    // Eliminarem password_hash de la resposta
    const alumnesSegurs = alumnesList.map(({ password_hash, ...altres }) => altres);
    res.json(alumnesSegurs);
  } catch (error) {
    res.status(500).json({ error: 'Error obtenint alumnes' });
  }
});

// GET /api/alumnes/:id — obtenir una alumne per ID
router.get('/:id', requireAuth('admin'), (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const alumne = alumnes.getById(id);
    
    if (!alumne) {
      return res.status(404).json({ error: 'Alumne no trobat' });
    }
    
    const { password_hash, ...alumneSegur } = alumne;
    res.json(alumneSegur);
  } catch (error) {
    res.status(500).json({ error: 'Error obtenint alumne' });
  }
});

// POST /api/alumnes — crear nova alumne
router.post('/', requireAuth('admin'), (req, res) => {
  try {
    const { nom, email, password } = req.body;
    
    // Validacions
    if (!nom || !email || !password) {
      return res.status(400).json({ error: 'Camps obligatoris: nom, email, password' });
    }
    
    if (!validEmail(email)) {
      return res.status(400).json({ error: 'Format d\'email incorrecte' });
    }
    
    if (nom.length < 2) {
      return res.status(400).json({ error: 'El nom ha de tenir almenys 2 caràcters' });
    }
    
    // Verificar si l'email ja existeix
    if (alumnes.existsByEmail(email)) {
      return res.status(409).json({ error: 'Ja existeix un alumne amb aquest email' });
    }
    
    const alumne = alumnes.create({ nom, email, password });
    res.status(201).json({ 
      id: alumne.id, 
      nom: alumne.nom, 
      email: alumne.email,
      created_at: alumne.created_at
    });
  } catch (error) {
    res.status(500).json({ error: 'Error creant alumne' });
  }
});

// PUT /api/alumnes/:id — actualitzar alumne
router.put('/:id', requireAuth('admin'), (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { nom, email } = req.body;
    
    // Validacions
    if (nom !== undefined && nom.length < 2) {
      return res.status(400).json({ error: 'El nom ha de tenir almenys 2 caràcters' });
    }
    
    if (email !== undefined && !validEmail(email)) {
      return res.status(400).json({ error: 'Format d\'email incorrecte' });
    }
    
    if (email !== undefined && alumnes.existsByEmail(email)) {
      return res.status(409).json({ error: 'Ja existeix un alumne amb aquest email' });
    }
    
    const alumneActualitzat = alumnes.update(id, { nom, email });
    
    if (!alumneActualitzat) {
      return res.status(404).json({ error: 'Alumne no trobat' });
    }
    
    const { password_hash, ...alumneSegur } = alumneActualitzat;
    res.json(alumneSegur);
  } catch (error) {
    res.status(500).json({ error: 'Error actualitzant alumne' });
  }
});

// DELETE /api/alumnes/:id — esborrar alumne
router.delete('/:id', requireAuth('admin'), (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const eliminat = alumnes.eliminar(id);
    
    if (!eliminat) {
      return res.status(404).json({ error: 'Alumne no trobat' });
    }
    
    res.json({ message: 'Alumne esborrat correctament' });
  } catch (error) {
    res.status(500).json({ error: 'Error esborrant alumne' });
  }
});

module.exports = router;
