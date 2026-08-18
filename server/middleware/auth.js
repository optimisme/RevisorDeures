function requireAdmin(req, res, next) {
  if (req.session && req.session.admin) {
    return next();
  }
  return res.status(403).json({ error: 'No autoritzat' });
}

function requireStudent(req, res, next) {
  if (req.session && req.session.studentId) {
    return next();
  }
  return res.status(403).json({ error: 'No autoritzat' });
}

function authorizeStudent(studentId) {
  return (req, res, next) => {
    if (req.session && req.session.studentId === studentId) {
      return next();
    }
    return res.status(403).json({ error: 'No autoritzat' });
  };
}

module.exports = { requireAdmin, requireStudent, authorizeStudent };
