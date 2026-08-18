const express = require('express');
const router = express.Router();
const entreguesDb = require('../db/entregues');
const valoracionsDb = require('../db/valoracions');
const practiquesDb = require('../db/practiques');
const { requireAuth } = require('./auth');
const { valorarEntrega } = require('../evaluator');

// POST /api/entregues — crear entrega (alumne)
router.post('/', requireAuth('alumne'), (req, res) => {
  try {
    const { practica_id, repo_url } = req.body;
    
    if (!practica_id || !repo_url) {
      return res.status(400).json({ error: 'Camps obligatoris: practica_id, repo_url' });
    }
    
    if (!/^https:\/\/github\.com\/[^\/]+\/[^\/]+$/.test(repo_url)) {
      return res.status(400).json({ error: 'URL no vàlida. Ha de ser https://github.com/owner/repo' });
    }
    
    const practica = practiquesDb.getById(parseInt(practica_id));
    if (!practica) {
      return res.status(400).json({ error: 'Pràctica no existent' });
    }
    
    const existing = entreguesDb.getByAlumnePractica(req.user.alumne_id, parseInt(practica_id));
    if (existing) {
      return res.status(409).json({ error: 'Ja tens una entrega activa per aquesta pràctica' });
    }
    
    const entrega = entreguesDb.create({
      alumne_id: req.user.alumne_id,
      practica_id: parseInt(practica_id),
      repo_url,
      estat: 'pendent'
    });
    
    // Crear valoració inicial
    valoracionsDb.create({
      entrega_id: entrega.id,
      estat: 'pendent'
    });
    
    return res.status(201).json({ entrega });
  } catch (err) {
    console.error('Error creant entrega:', err);
    return res.status(500).json({ error: 'Error intern del servidor' });
  }
});

// GET /api/entregues — llistar entregues (admin totes, alumne les seves)
router.get('/', requireAuth(['alumne', 'admin']), (req, res) => {
  try {
    const filters = {};
    
    if (req.query.alumne_id && req.user.rol === 'admin') {
      filters.alumne_id = req.query.alumne_id;
    }
    
    if (req.query.practica_id) {
      filters.practica_id = req.query.practica_id;
    }
    
    if (req.query.estat) {
      filters.estat = req.query.estat;
    }
    
    let entregues;
    if (req.user.rol === 'admin') {
      entregues = entreguesDb.getAll(filters);
    } else {
      entregues = entreguesDb.getByAlumne(req.user.alumne_id, filters);
    }
    
    return res.json({ entregues });
  } catch (err) {
    console.error('Error llistant entregues:', err);
    return res.status(500).json({ error: 'Error intern del servidor' });
  }
});

// GET /api/entregues/alumne/:alumne_id — llistar per alumne (admin)
router.get('/alumne/:alumne_id', requireAuth('admin'), (req, res) => {
  try {
    const entregues = entreguesDb.getByAlumne(parseInt(req.params.alumne_id));
    return res.json({ entregues });
  } catch (err) {
    console.error('Error llistant per alumne:', err);
    return res.status(500).json({ error: 'Error intern del servidor' });
  }
});

// GET /api/entregues/practica/:practica_id — llistar per practica (admin)
router.get('/practica/:practica_id', requireAuth('admin'), (req, res) => {
  try {
    const entregues = entreguesDb.getByPractica(parseInt(req.params.practica_id));
    return res.json({ entregues });
  } catch (err) {
    console.error('Error llistant per practica:', err);
    return res.status(500).json({ error: 'Error intern del servidor' });
  }
});

// GET /api/entregues/pendents — entregues pendents de revisió (admin)
router.get('/pendents', requireAuth('admin'), (req, res) => {
  try {
    const entregues = entreguesDb.getAll({ estat: 'pendent' });
    // Afegir valoració a cada entrega
    entregues.forEach(e => {
      e.valoracio = valoracionsDb.getByEntrega(e.id) || null;
    });
    return res.json({ entregues });
  } catch (err) {
    console.error('Error llistant pendents:', err);
    return res.status(500).json({ error: 'Error intern del servidor' });
  }
});

// GET /api/valoracions/entrega/:entrega_id — obtenir valoració d'una entrega
router.get('/valoracions/entrega/:entrega_id', requireAuth(['alumne', 'admin']), (req, res) => {
  try {
    const entrega = entreguesDb.getById(parseInt(req.params.entrega_id));
    
    if (!entrega) {
      return res.status(404).json({ error: 'Entrega no existent' });
    }
    
    // Verificar permisos
    if (req.user.rol !== 'admin' && entrega.alumne_id !== req.user.alumne_id) {
      return res.status(403).json({ error: 'No tens permís per veure aquesta valoració' });
    }
    
    const valoracio = valoracionsDb.getByEntrega(parseInt(req.params.entrega_id));
    return res.json({ valoracio });
  } catch (err) {
    console.error('Error obtenint valoració:', err);
    return res.status(500).json({ error: 'Error intern del servidor' });
  }
});

// PATCH /api/entregues/:id/revisar — marcar com revisada (admin)
router.patch('/:id/revisar', requireAuth('admin'), (req, res) => {
  try {
    const entrega = entreguesDb.getById(parseInt(req.params.id));
    
    if (!entrega) {
      return res.status(404).json({ error: 'Entrega no existent' });
    }
    
    if (entrega.revisada) {
      return res.status(400).json({ error: 'Entrega ja revisada' });
    }
    
    entreguesDb.marcarRevisada(parseInt(req.params.id), req.user.id);
    return res.json({ message: 'Entrega marcada com revisada' });
  } catch (err) {
    console.error('Error marcant revisada:', err);
    return res.status(500).json({ error: 'Error intern del servidor' });
  }
});

// DELETE /api/entregues/:id — esborrar entrega
router.delete('/:id', requireAuth(['alumne', 'admin']), (req, res) => {
  try {
    const entrega = entreguesDb.getById(parseInt(req.params.id));
    
    if (!entrega) {
      return res.status(404).json({ error: 'Entrega no existent' });
    }
    
    // Alumne només pot esborrar si no està revisada
    if (req.user.rol !== 'admin' && entrega.alumne_id !== req.user.alumne_id) {
      return res.status(403).json({ error: 'No tens permís per esborrar aquesta entrega' });
    }
    
    if (entrega.revisada && req.user.rol !== 'admin') {
      return res.status(403).json({ error: 'No es pot esborrar una entrega revisada' });
    }
    
    entreguesDb.destroy(parseInt(req.params.id));
    return res.json({ message: 'Entrega esborrada' });
  } catch (err) {
    console.error('Error esborrant entrega:', err);
    return res.status(500).json({ error: 'Error intern del servidor' });
  }
});

// POST /api/entregues/avaluar/:id — disparar avaluació automàtica (alumne/admin)
router.post('/avaluar/:id', requireAuth(['alumne', 'admin']), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const entrega = entreguesDb.getById(id);
    
    if (!entrega) {
      return res.status(404).json({ error: 'Entrega no trobada' });
    }

    // Comprovar si ja té valoració completada
    if (entrega.estat === 'completada') {
      return res.json({ message: 'Entrega ja valorada', entrega });
    }

    // Disparar avaluació en segon pla (no block)
    setImmediate(() => {
      valorarEntrega(id)
        .catch(err => console.error(`[Evaluator] Error async: ${err.message}`));
    });

    res.json({ message: 'Avaluació iniciada', entrega });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/entregues/valoracio/:id — consultar valoració
router.get('/valoracio/:id', requireAuth(['alumne', 'admin']), (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const valoracio = valoracionsDb.getByEntrega(id);
    
    if (!valoracio) {
      return res.status(404).json({ error: 'Valoració no trobada' });
    }
    
    res.json({ valoracio });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
