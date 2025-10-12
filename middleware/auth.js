// Middleware til at tjekke om bruger er logget ind
const authMiddleware = (req, res, next) => {
  console.log('🔒 authMiddleware - Session:', req.session.bruger ? 'Findes' : 'Findes IKKE');
  if (req.session.bruger) {
    next();
  } else {
    res.redirect('/login');
  }
};

// Middleware til at tjekke om bruger er admin
const adminMiddleware = (req, res, next) => {
  console.log('👑 adminMiddleware - Session:', req.session.bruger);
  console.log('👑 adminMiddleware - Rolle:', req.session.bruger?.rolle);
  if (req.session.bruger && req.session.bruger.rolle === 'admin') {
    console.log('✅ Admin adgang godkendt');
    next();
  } else {
    console.log('❌ Admin adgang nægtet');
    res.status(403).send('Adgang nægtet');
  }
};

module.exports = { authMiddleware, adminMiddleware };
