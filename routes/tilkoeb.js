const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');

// Route bruger authMiddleware
router.use(authMiddleware);

// Tilkøb (Add-ons) page
router.get('/', (req, res) => {
  res.render('tilkøb', { 
    bruger: req.session.bruger
  });
});

module.exports = router;
