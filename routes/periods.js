const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { pool } = require('../db');

// Alle routes bruger authMiddleware
router.use(authMiddleware);

// Vis forestillingsperioder
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM forestillingsperioder WHERE bruger_id = $1 ORDER BY fra_dato',
      [req.session.bruger.id]
    );
    
    res.render('forestillingsperioder', { 
      bruger: req.session.bruger,
      perioder: result.rows
    });
  } catch (error) {
    console.error('❌ Fejl ved hentning af forestillingsperioder:', error);
    res.render('forestillingsperioder', { 
      bruger: req.session.bruger,
      perioder: []
    });
  }
});

// Tilføj forestillingsperiode
router.post('/', async (req, res) => {
  const { titel, fraDato, tilDato } = req.body;
  
  try {
    // Indsæt ny periode i forestillingsperioder tabel
    await pool.query(
      'INSERT INTO forestillingsperioder (bruger_id, titel, fra_dato, til_dato) VALUES ($1, $2, $3, $4)',
      [req.session.bruger.id, titel, fraDato, tilDato]
    );
    
    res.redirect('/forestillingsperioder');
  } catch (error) {
    console.error('❌ Fejl ved tilføjelse af forestillingsperiode:', error);
    res.redirect('/forestillingsperioder');
  }
});

// Slet forestillingsperiode
router.post('/slet/:id', async (req, res) => {
  try {
    const periodeId = parseInt(req.params.id);
    
    // Slet periode fra forestillingsperioder tabel
    await pool.query(
      'DELETE FROM forestillingsperioder WHERE id = $1 AND bruger_id = $2',
      [periodeId, req.session.bruger.id]
    );
    
    res.redirect('/forestillingsperioder');
  } catch (error) {
    console.error('❌ Fejl ved sletning af forestillingsperiode:', error);
    res.redirect('/forestillingsperioder');
  }
});

module.exports = router;
