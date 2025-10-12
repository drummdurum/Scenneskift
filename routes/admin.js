const express = require('express');
const router = express.Router();
const { adminMiddleware } = require('../middleware/auth');
const { pool } = require('../db');

// Alle routes bruger adminMiddleware
router.use(adminMiddleware);

// Admin oversigt
router.get('/', async (req, res) => {
  try {
    const brugereResult = await pool.query('SELECT * FROM brugere ORDER BY id');
    const produkterResult = await pool.query('SELECT * FROM produkter ORDER BY id');
    
    res.render('admin', { 
      bruger: req.session.bruger, 
      brugere: brugereResult.rows, 
      produkter: produkterResult.rows 
    });
  } catch (error) {
    console.error('❌ Fejl ved hentning af admin data:', error);
    res.render('admin', { 
      bruger: req.session.bruger, 
      brugere: [], 
      produkter: [] 
    });
  }
});

// Godkend bruger
router.post('/godkend/:id', async (req, res) => {
  try {
    await pool.query(
      'UPDATE brugere SET aktiv = true WHERE id = $1',
      [parseInt(req.params.id)]
    );
    res.redirect('/admin');
  } catch (error) {
    console.error('❌ Fejl ved godkendelse af bruger:', error);
    res.redirect('/admin');
  }
});

// Deaktiver bruger
router.post('/deaktiver/:id', async (req, res) => {
  try {
    const brugerId = parseInt(req.params.id);
    
    // Tjek at det ikke er en admin
    const result = await pool.query(
      'SELECT rolle FROM brugere WHERE id = $1',
      [brugerId]
    );
    
    if (result.rows[0] && result.rows[0].rolle !== 'admin') {
      await pool.query(
        'UPDATE brugere SET aktiv = false WHERE id = $1',
        [brugerId]
      );
    }
    
    res.redirect('/admin');
  } catch (error) {
    console.error('❌ Fejl ved deaktivering af bruger:', error);
    res.redirect('/admin');
  }
});

// Slet produkt
router.post('/slet-produkt/:id', async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM produkter WHERE id = $1',
      [parseInt(req.params.id)]
    );
    res.redirect('/admin');
  } catch (error) {
    console.error('❌ Fejl ved sletning af produkt:', error);
    res.redirect('/admin');
  }
});

module.exports = router;
