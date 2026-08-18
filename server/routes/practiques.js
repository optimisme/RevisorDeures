const express = require('express');
const router = express.Router();
const practiques = require('../db/practiques');
const { requireAuth } = require('./auth');

// GET /api/practiques — llista totes les pràctiques (alumne i admin)
router.get('/', requireAuth(['alumne', 'admin']), (req, res) => {
  try {
    const rows = practiques.getAll();
    res.json(rows);
  } catch (error) {
    console.error('Error obtenint pràctiques:', error);
    res.status(500).json({ error: 'Error obtenint pràctiques' });
  }
});

// GET /api/practiques/:id — obtenir una pràctica per ID
router.get('/:id', requireAuth('admin'), (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const practica = practiques.getById(id);
    
    if (!practica) {
      return res.status(404).json({ error: 'Pràctica no trobada' });
    }
    
    res.json(practica);
  } catch (error) {
    console.error('Error obtenint pràctica:', error);
    res.status(500).json({ error: 'Error obtenint pràctica' });
  }
});

// POST /api/practiques — crear nova pràctica
router.post('/', requireAuth('admin'), (req, res) => {
  try {
    const { titol, criteria } = req.body;
    
    if (!titol || typeof titol !== 'string' || titol.trim().length === 0) {
      return res.status(400).json({ error: 'El títol és obligatori i no pot estar buit' });
    }
    
    const practica = practiques.create({ titol: titol.trim(), criteria: criteria ? criteria.trim() : null });
    res.status(201).json(practica);
  } catch (error) {
    console.error('Error creant pràctica:', error);
    res.status(500).json({ error: 'Error creant pràctica' });
  }
});

// PUT /api/practiques/:id — actualitzar pràctica
router.put('/:id', requireAuth('admin'), (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { titol, criteria } = req.body;
    
    if (titol !== undefined && (typeof titol !== 'string' || titol.trim().length === 0)) {
      return res.status(400).json({ error: 'El títol no pot estar buit' });
    }
    
    const practica = practiques.update(id, { titol: titol?.trim(), criteria: criteria !== undefined ? criteria.trim() : undefined });
    
    if (!practica) {
      return res.status(404).json({ error: 'Pràctica no trobada' });
    }
    
    res.json(practica);
  } catch (error) {
    console.error('Error actualitzant pràctica:', error);
    res.status(500).json({ error: 'Error actualitzant pràctica' });
  }
});

// DELETE /api/practiques/:id — esborrar pràctica
router.delete('/:id', requireAuth('admin'), (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    if (!practiques.exists(id)) {
      return res.status(404).json({ error: 'Pràctica no trobada' });
    }
    
    practiques.destroy(id);
    res.json({ message: 'Pràctica esborrada correctament' });
  } catch (error) {
    console.error('Error esborrant pràctica:', error);
    res.status(500).json({ error: 'Error esborrant pràctica' });
  }
});

module.exports = router;
