function ensureAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }
  res.redirect('/auth/login/agent');
}

function ensureAgent(req, res, next) {
  if (req.session && req.session.user?.role === 'agent') {
    return next();
  }
  res.status(403).send('🚫 صلاحية غير كافية (وكيل فقط)');
}

function ensureAdmin(req, res, next) {
  if (req.session && req.session.user?.role === 'admin') {
    return next();
  }
  res.status(403).send('🚫 صلاحية غير كافية (مدير فقط)');
}

module.exports = {
  ensureAuthenticated,
  ensureAgent,
  ensureAdmin
};
