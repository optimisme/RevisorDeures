const express = require('express');
const router = express.Router();
const valoracions = require('../db/valoracions');
const entreguesDb = require('../db/entregues');
const { requireAuth } = require('./auth');

// GET /api/valoracions/entrega/:id — obtenir valoració d'una entrega (alumne/admin)
router.get('/entrega/:id', requireAuth(), (req, res) => {
  try {
    const entrega_id = parseInt(req.params.id);
    
    // Admin pot veure qualsevol, alumne només les seves
    if (req.user.rol !== 'admin') {
      const entrega = entreguesDb.getById(entrega_id);
      if (!entrega) {
        return res.status(404).json({ error: 'Entrega no trobada' });
      }
      if (entrega.alumne_id !== req.user.id) {
        return res.status(403).json({ error: 'No tens permís per veure aquesta valoració' });
      }
    }
    
    const valoracio = valoracions.getByEntrega(entrega_id);
    return res.json({ valoracio: valoracio || null });
  } catch (err) {
    console.error('Error obtenint valoració:', err);
    return res.status(500).json({ error: 'Error intern del servidor' });
  }
});

module.exports = router;
